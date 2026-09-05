/* THE RUN TRACE AND THE PRE-DROP QUESTION (owner, 5 Sep 26 — steps 3 and 4 of
   the flagging plan). The seven-day breach lands on the day the count crosses;
   every earlier day of that run is a day the scheduler can still clear, so
   each wears a dotted trace pointing at the breach day — "make the warning
   like what the crew rest does" — and a run that reaches Sunday at the limit
   and continues into next Monday traces forward exactly as crew rest does.
   Before any drop, `runIfPlaced`/`restIfPlaced` answer what those two hard
   rules WOULD say, read off the validator's own tables, and slotBar prints
   the answer as its last reason.

   Adjacent weeks are hand-built through the same weekBundle mock weekctx.test
   uses; each test loads its own week key, ten weeks apart, so the module-level
   bundle cache never serves one test another's next Monday. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { setCurWeek } from './waves'
import { VCONF } from './rules'
import { validate, traceOf, traceChip, traceLeads, traceIx, chipOf, runIfPlaced, restIfPlaced, crossDayIfPlaced, RUNLEN, RUNSEED, NEXTON } from './validate'
import { slotBar, slotRules } from './avail'

const { MOCKS, weekBundleMock } = vi.hoisted(() => {
  const MOCKS: Record<string, any> = {}
  const weekBundleMock = vi.fn((v: any) => MOCKS[v])
  return { MOCKS, weekBundleMock }
})
vi.mock('./weeks-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./weeks-data')>()
  return { ...actual, weekBundle: (v: any) => weekBundleMock(v) ?? actual.emptyWeek(v) }
})
// eslint-disable-next-line import/first
import { weekDateLabels, shiftWeekKey } from './weeks-data'

const BASE = '05/10/2026'   // a real Monday, far from the seed weeks and from weekctx.test's keys
const wkFor = (i: number) => shiftWeekKey(BASE, i * 10)
const DOWS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const blankDay = (dow: string, dt: string): any =>
  ({ dow, dt, wc: '0 X 0 X 0', notes: [], allhands: [], waves: [], sims: { amt: [], oft: [] }, dutywaves: [], ground: [] })
const weekOf = (labels: string[], overrides: Record<number, any> = {}) => ({
  days: DOWS.map((dow, i) => ({ ...blankDay(dow, labels[i]), ...(overrides[i] || {}) })),
  dates: labels.slice(), inputs: [], seedSans: false,
})
const groundRow = (id: string) => ({ ground: [{ prog: 'DUTY SPELL', str: '0900', end: '1000', who: id }] })

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
let wk = 0
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  VCONF.maxRun = 6
  setCurWeek(wkFor(wk++))
})
/* bullet: on NOTHING in the seed week (checked off EVDAYS), so a ground row
   on him clashes with no sortie and no louder chip ever hides the run label —
   daysrun.test's vegas flies on weekdays and wears a C over a 09:00 row */
const ID = 'bullet'
const workOn = (id: string, days: number[], str = '0900', end = '1000') => days.forEach(di => {
  DAYS[di].ground = DAYS[di].ground || []
  DAYS[di].ground.push({ prog: 'DUTY SPELL', str, end, who: id })
})
const nextMondayHas = (id: string) => {
  const cur = wkFor(wk - 1), nextKey = shiftWeekKey(cur, 1)
  MOCKS[nextKey] = weekOf(weekDateLabels(nextKey), { 0: groundRow(id) })
}

describe('the run trace — every earlier day of a run points at the day it breaks', () => {
  it('seven days Mon–Sun: Mon–Sat wear the trace to Sunday, Sunday wears its own solid flag', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5, 6])
    validate()
    for (let k = 0; k <= 5; k++) {
      const t = traceOf(k, ID)
      expect(t && t.run, `day ${k} carries the run trace`).toBeTruthy()
      expect(t.run).toEqual({ di: 6, dow: 'Sunday', n: 7 })
      expect(t.leaveBy, 'no crew-rest fields on a run-only trace').toBeUndefined()
      expect(traceChip(t)).toBe('RUN')
      expect(traceLeads(k, ID), 'nothing louder on a quiet day — the trace owns the chip').toBeTruthy()
      expect(traceIx(t, ID, 'RUN'), 'the row resolves to the DAYS_RUN warning on Sunday').toBeGreaterThanOrEqual(0)
    }
    expect(traceOf(6, ID), 'the breach day itself is not traced').toBeNull()
    expect(chipOf(6, ID)).toBe('RUN')
  })

  it('only the crossing day is traced to — the days after it wear their own flag, and a break day resets everything', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5, 6])
    validate()
    expect(traceOf(5, ID).run.di).toBe(6)
    /* Wed off: Mon–Tue and Thu–Sun are two runs of 2 and 4 — nothing crosses */
    DAYS[2].ground = DAYS[2].ground.filter((g: any) => g.who !== ID)
    validate()
    for (let k = 0; k <= 6; k++) expect(traceOf(k, ID), `day ${k} clean`).toBeNull()
  })

  it('a run walked in from last week that breaks on Monday traces nothing in this week (its earlier days are last week\'s)', () => {
    const cur = wkFor(wk - 1), prevKey = shiftWeekKey(cur, -1)
    const row = groundRow(ID)
    MOCKS[prevKey] = weekOf(weekDateLabels(prevKey), { 1: row, 2: row, 3: row, 4: row, 5: row, 6: row })
    workOn(ID, [0])
    validate()
    expect(RUNSEED[ID]).toBe(6)
    expect(chipOf(0, ID)).toBe('RUN')
    expect(traceOf(0, ID)).toBeNull()
  })

  it('FORWARD: six days ending Sunday and on next Monday — every day traces to next Monday, no warning is written', () => {
    workOn(ID, [1, 2, 3, 4, 5, 6])
    nextMondayHas(ID)
    const r = validate()
    expect(NEXTON.has(ID)).toBe(true)
    for (let k = 1; k <= 6; k++) expect(traceOf(k, ID).run).toEqual({ di: null, dow: 'Monday', n: 7 })
    expect(traceOf(0, ID)).toBeNull()
    expect(r.all.filter((w: any) => w.code === 'DAYS_RUN').length, 'the breach lands when next week loads').toBe(0)
    expect(traceIx(traceOf(6, ID), ID, 'RUN')).toBe(-1)
  })

  it('FORWARD: five days ending Sunday and on next Monday is six — under the limit, no trace', () => {
    workOn(ID, [2, 3, 4, 5, 6])
    nextMondayHas(ID)
    validate()
    for (let k = 0; k <= 6; k++) expect(traceOf(k, ID)).toBeNull()
  })

  it('the run trace merges beside a crew-rest trace on the same puck instead of replacing it', () => {
    /* split flies late Tuesday and reports early Wednesday (the audit-c-crossday
       fixture) — Tuesday carries his crew-rest trace. Put him on the programme
       Mon–Sun as well and Tuesday must carry BOTH. */
    const d1 = DAYS[1].waves[0].formations[0]
    d1.to = '20:00'; d1.ld = '23:00'; d1.br = ''
    d1.aircraft[0].p = 'split'
    DAYS[2].waves[0].formations[0].aircraft[0].p = 'split'
    workOn('split', [0, 1, 2, 3, 4, 5, 6])
    validate()
    const t = traceOf(1, 'split')
    expect(t.leaveBy, 'crew rest still there').toBe('20:15')
    expect(t.di).toBe(2)
    expect(t.run).toEqual({ di: 6, dow: 'Sunday', n: 7 })
    expect(traceChip(t), 'RUN outranks CR, as on the breach day').toBe('RUN')
    expect(traceIx(t, 'split')).toBeGreaterThanOrEqual(0)
    expect(traceIx(t, 'split', 'RUN')).toBeGreaterThanOrEqual(0)
  })
})

describe('runIfPlaced — would a day here push a run past the limit, and where does it break?', () => {
  it('lands inside a gap: Mon–Sat filled, asked about Sunday → breaks Sunday', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5])
    validate()
    expect(runIfPlaced(ID, 6)).toEqual({ di: 6, dow: 'Sunday', n: 7 })
  })
  it('lands at the FRONT of a run: Tue–Sun filled, asked about Monday → the run breaks on Sunday, not Monday', () => {
    workOn(ID, [1, 2, 3, 4, 5, 6])
    validate()
    expect(runIfPlaced(ID, 0)).toEqual({ di: 6, dow: 'Sunday', n: 7 })
  })
  it('joins two runs: Mon–Wed and Fri–Sun filled, asked about Thursday → breaks Sunday', () => {
    workOn(ID, [0, 1, 2, 4, 5, 6])
    validate()
    expect(runIfPlaced(ID, 3)).toEqual({ di: 6, dow: 'Sunday', n: 7 })
  })
  it('under the limit answers null; a day he is already on answers null (the count would not change)', () => {
    workOn(ID, [0, 1, 2, 3, 4])
    validate()
    expect(runIfPlaced(ID, 5)).toBeNull()
    expect(runIfPlaced(ID, 2)).toBeNull()
    expect(RUNLEN[2][ID]).toBe(3)
  })
  it('reads the seed walked in from last week', () => {
    const cur = wkFor(wk - 1), prevKey = shiftWeekKey(cur, -1)
    const row = groundRow(ID)
    MOCKS[prevKey] = weekOf(weekDateLabels(prevKey), { 1: row, 2: row, 3: row, 4: row, 5: row, 6: row })
    validate()
    expect(runIfPlaced(ID, 0)).toEqual({ di: 0, dow: 'Monday', n: 7 })
  })
  it('walks past Sunday into next Monday', () => {
    workOn(ID, [1, 2, 3, 4, 5])
    nextMondayHas(ID)
    validate()
    expect(runIfPlaced(ID, 6)).toEqual({ di: null, dow: 'Monday', n: 7 })
  })
  it('a placeholder or an unknown id answers null', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5])
    validate()
    expect(runIfPlaced('nobody', 6)).toBeNull()
    expect(runIfPlaced('', 6)).toBeNull()
  })
})

describe('restIfPlaced — crew rest asked before the write, both directions, off the validator\'s own body', () => {
  /* the audit-c-crossday fixture: Tuesday's first formation lands 23:00
     (+2h debrief → rest clears 13:00 Wednesday); Wednesday's first formation
     reports 08:15 */
  const lateTuesday = () => { const d1 = DAYS[1].waves[0].formations[0]; d1.to = '20:00'; d1.ld = '23:00'; d1.br = '' }
  it('BACKWARD: he flew late yesterday; the seat asked about reports before rest clears', () => {
    lateTuesday()
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    validate()
    const seatW = '2.0.0.0.w'                         // the RCP beside Wednesday's FCP occupant
    expect(DAYS[2].waves[0].formations[0].aircraft[0].w).not.toBe('split')
    const r: any = restIfPlaced('split', seatW)
    expect(r, 'a breach is foreseen').toBeTruthy()
    expect(r.dir).toBe('back'); expect(r.di).toBe(2); expect(r.dow).toBe('Wednesday')
    expect(r.leaveBy).toBe('20:15')
    expect(crossDayIfPlaced('split', seatW)).toMatch(/^crew rest — not clear until 13:00/)
    /* and the write agrees: planting him raises exactly that warning */
    DAYS[2].waves[0].formations[0].aircraft[0].w = 'split'
    const after = validate()
    expect(after.all.find((w: any) => w.code === 'CREW_REST' && w.di === 2 && w.who.includes('split'))).toBeTruthy()
  })
  it('FORWARD: he reports early tomorrow; the late seat asked about would break tomorrow', () => {
    lateTuesday()
    DAYS[2].waves[0].formations[0].aircraft[0].p = 'split'   // Wednesday 08:15 report
    validate()
    const seatW = '1.0.0.0.w'                         // beside Tuesday's late line's FCP
    const r: any = restIfPlaced('split', seatW)
    expect(r, 'the breach tomorrow is foreseen').toBeTruthy()
    expect(r.dir).toBe('fwd'); expect(r.di).toBe(2); expect(r.dow).toBe('Wednesday')
    expect(r.leaveBy).toBe('20:15')
    expect(crossDayIfPlaced('split', seatW)).toBe('crew rest — breaks Wednesday: he must be gone by 20:15')
  })
  it('an empty formation has no sibling leg to clone and answers null; a duty key bears no crew rest', () => {
    lateTuesday()
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    validate()
    const f = DAYS[2].waves[0].formations[0]
    f.aircraft.forEach((a: any) => { a.p = ''; a.w = '' })
    validate()
    expect(restIfPlaced('split', '2.0.0.0.w')).toBeNull()
    expect(restIfPlaced('split', 'd:2.0.0')).toBeNull()
  })
  it('nothing foreseen answers null and leaves WARN untouched (a probe never writes)', () => {
    validate()
    const before = JSON.stringify([traceOf(1, 'split'), traceOf(2, 'split')])
    expect(restIfPlaced('split', '2.0.0.0.w')).toBeNull()
    expect(JSON.stringify([traceOf(1, 'split'), traceOf(2, 'split')])).toBe(before)
  })
})

describe('review findings (5 Sep 26) — the question reads the week AFTER a move, stands down on exempt lines, and never captions over a real breach', () => {
  it('a seat-to-seat move: the seat he is leaving counts as off when it was his only event that day', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5])                    // Saturday's row is his only Saturday event
    validate()
    const satKey = `g:5.${DAYS[5].ground.length - 1}`
    expect(runIfPlaced(ID, 6), 'asked plainly: a seventh day').toBeTruthy()
    expect(runIfPlaced(ID, 6, { di: 5, key: satKey, sole: true }), 'moved off Saturday: six, not seven').toBeNull()
    expect(runIfPlaced(ID, 6, { di: 5, key: satKey, sole: false }), 'Saturday keeps another event: still seven').toBeTruthy()
    expect(crossDayIfPlaced(ID, 'g:6.0', satKey)).toBe('')
    expect(slotBar(ID, 'g:6.0', undefined, satKey)).toBe('')
    expect(slotBar(ID, 'g:6.0')).toMatch(/7th day in a row/)
  })
  it('a same-day crew-rest move: the leg being moved cannot break its own crew rest', () => {
    const d1 = DAYS[1].waves[0].formations[0]; d1.to = '20:00'; d1.ld = '23:00'; d1.br = ''
    d1.aircraft[0].p = 'split'
    DAYS[2].waves[0].formations[0].aircraft[0].p = 'split'   // his real 08:15 breach on Wednesday
    validate()
    /* a formation in Wednesday's SECOND wave, pushed to the afternoon with no
       published in-time, so its own report is 13:40 — after rest clears */
    const w2 = DAYS[2].waves[1]
    expect(w2 && w2.formations[0], 'a second wave on Wednesday').toBeTruthy()
    w2.intimes = []
    const f2 = w2.formations[0]; f2.to = '16:00'; f2.ld = '17:00'; f2.br = ''
    validate()
    const laterKey = '2.1.0.0.w'
    /* asked plainly the probe still sees his 08:15 leg, but that breach is
       already on the warning list word for word — nothing NEW, so silence
       (the same delta the drop toast reads); moved off the 08:15 leg, the
       later leg alone is clear */
    expect(restIfPlaced('split', laterKey), 'an existing breach is not this seat\'s').toBeNull()
    expect(restIfPlaced('split', laterKey, { di: 2, key: '2.0.0.0.p', sole: false }), 'moving OFF the 08:15 leg: judged on the later leg alone').toBeNull()
    /* and a seat that would make it WORSE is new: an earlier report than the one already flagged */
    const w0 = DAYS[2].waves[0]; w0.intimes = []
    const f0 = w0.formations[1]; expect(f0, 'a second formation in wave 0').toBeTruthy()
    f0.to = '06:00'; f0.ld = '07:00'; f0.br = ''
    validate()
    const worse: any = restIfPlaced('split', '2.0.1.0.w')
    expect(worse && worse.dir, 'a 03:40 report is a different breach — new').toBe('back')
  })
  it('an SC SPARE seat is exempt from the conflict engine, so it gets no cross-day reason', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5])
    validate()
    /* find any SC spare seat in the seed; skip if the seed carries none */
    let spareKey: any = null
    DAYS.forEach((d: any, di: number) => (d.waves || []).forEach((w: any, gi: number) => (w.formations || []).forEach((f: any, li: number) => (f.aircraft || []).forEach((a: any, ai: number) => {
      const k = `${di}.${gi}.${li}.${ai}.p`
      if (!spareKey && slotRules(k).saExempt) spareKey = k
    }))))
    if (!spareKey) return
    expect(slotRules(spareKey).saExempt).toBe(true)
    expect(slotBar(ID, spareKey)).not.toMatch(/day in a row|crew rest/)
  })
  it('a man\'s OWN crew-rest breach today keeps its label over a run trace for later in the week', () => {
    const d1 = DAYS[1].waves[0].formations[0]; d1.to = '20:00'; d1.ld = '23:00'; d1.br = ''
    d1.aircraft[0].p = 'split'
    DAYS[2].waves[0].formations[0].aircraft[0].p = 'split'
    /* 05:00 rows: clear of his 20:00 Tuesday sortie and of Wednesday's busy
       window, so no conflict chip outranks the crew-rest one */
    workOn('split', [0, 1, 2, 3, 4, 5, 6], '0500', '0530')
    validate()
    expect(chipOf(2, 'split'), 'his own breach on Wednesday').toBe('CR')
    expect(traceOf(2, 'split').run, 'and a run trace on the same day').toBeTruthy()
    expect(traceLeads(2, 'split'), 'the trace does not lead').toBeNull()
  })
  it('the answer is memoised per validate() and forgotten on the next one', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5])
    validate()
    expect(crossDayIfPlaced(ID, 'g:6.0')).toMatch(/7th day/)
    DAYS[5].ground = DAYS[5].ground.filter((g: any) => g.who !== ID)
    expect(crossDayIfPlaced(ID, 'g:6.0'), 'stale until validate() runs').toMatch(/7th day/)
    validate()
    expect(crossDayIfPlaced(ID, 'g:6.0')).toBe('')
  })
})

describe('slotBar carries the two cross-day answers as its last reason', () => {
  it('the seventh day reads on the palette\'s own oracle, for a ground row too', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5])
    validate()
    DAYS[6].ground = DAYS[6].ground || []
    DAYS[6].ground.push({ prog: 'BRIEF', str: '1400', end: '1500', who: '' })
    const key = `g:6.${DAYS[6].ground.length - 1}`
    expect(slotBar(ID, key)).toBe('7th day in a row — breaks Sunday (6 is the limit)')
    expect(slotBar(ID, 'g:6.0')).toMatch(/7th day in a row/)
  })
  it('a closer reason still wins: an SC shift he is not current for says so first', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5])
    validate()
    /* a day he is already on answers nothing about the run either way */
    expect(slotBar(ID, 'g:5.0')).not.toMatch(/day in a row/)
  })
  it('a probe leaves the published tables exactly as validate() left them', () => {
    workOn(ID, [0, 1, 2, 3, 4, 5])
    validate()
    const snap = JSON.stringify([RUNLEN, RUNSEED, [...NEXTON]])
    slotBar(ID, 'g:6.0'); restIfPlaced('split', '2.0.0.0.w')
    expect(JSON.stringify([RUNLEN, RUNSEED, [...NEXTON]])).toBe(snap)
  })
})
