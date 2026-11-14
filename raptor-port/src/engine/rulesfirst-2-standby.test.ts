/* RULES-FIRST REVIEW, family 2 — standby lines (SC, AVALON, BB) and standby lines that fly (W14–W26)
   ([ENGINE-RULES-REVIEW], D1983, 11 Nov 26). One test per worklist item, each led by the ruling's own words, on a small
   made-up day through the engine's own doors (buildDay through validate, dayCount, computeInsights, dayOilWork, dayEngaged,
   dayKeys, blockFromTpl, waveFromTpl). Items whose ruled behaviour an existing test already holds whole are named in the
   review's results, not duplicated here. Harness: the same as rallybox.test.ts / rulesfirst-1-report-times.test.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED } from './publish'
import { VCONF, SHIFT_HARD } from './rules'
import { validate, dayEvents } from './validate'
import { makeStandalone, saFlies, dayCount } from './waves'
import { dayOilWork } from './oil'
import { computeInsights } from './insights'
import { dayEngaged, dayStandby, slotBar } from './avail'
import { dayKeys } from './restore'
import { blockFromTpl } from './dutytpl'
import { addWaveTpl, setWaveTplLine, waveFromTpl, delWaveTpl } from './wavetpl'
import { saFliesHTML, exemptDeskOwn } from '../ui/html'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF } }
const h = (hh: number, mm = 0) => hh * 60 + mm
const MON = 0, TUE = 1
const add = (di: number, w: any) => { (DAYS[di] as any).waves.push(w); return (DAYS[di] as any).waves.length - 1 }
const warns = (di: number, id: string | null, code?: string | RegExp) => validate().all.filter((x: any) => x.di === di
  && (id == null || (x.who || []).includes(id))
  && (!code || (typeof code === 'string' ? x.code === code : code.test(x.code))))
const hard = (di: number, id: string) => warns(di, id).filter((x: any) => x.sev === 'hard')
const oil = (di: number) => dayOilWork(DAYS[di], { expandAll: () => [] }) as any
const allDay = (person: string, type: string, date = 'Jul 14') => INPUTS.push({ person, date, allday: true, type, remarks: '', mod: '' } as any)
const flyLine = (lines: string[], to: string, ld: string, p: string) =>
  ({ label: 'WAVE 1', intimes: lines, formations: [{ cs: 'VL', msn: 'BFM', to, ld, br: '', rl: '', aircraft: [{ p, w: '', rmks: '', opts: {} }] }] })

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
})

describe('W14 — a standby line that actually flies is a real flight, every row SPARE included, on START and END (D1042, D1043, D1044, D1045)', () => {
  it('an SC AM SPARE on local leave: clean while it stands by; R typed, it is a flown seat — flagged, counted, on shift START→END, earning by default', () => {
    const w: any = makeStandalone('sc'); add(TUE, w)
    const f = w.formations[0]; f.aircraft[2].p = 'split'          // row 2 is a SPARE
    allDay('split', 'LL')
    expect(hard(TUE, 'split'), 'standing by: local leave may stand (canSpare)').toEqual([])
    expect(dayCount(DAYS[TUE])).toBe('0 / 2')
    f.rl = '06:30'                                                 // "typing its B or R ticking it by itself"
    expect(hard(TUE, 'split').map((x: any) => x.code), 'every warning an ordinary flying line gets').toEqual(['LEAVE_FLY'])
    expect(dayCount(DAYS[TUE]), 'one seated flying row — the SPARE — and PM still standing by').toBe('1 / 2')
    const ev = dayEvents(TUE, 'split').filter((e: any) => e.kind === 'shift')
    expect(ev.map((e: any) => [e.report, e.s, e.e]), 'the line\'s planned START and END, no take-off and landing of its own').toEqual([[h(6, 30), h(7), h(13)]])
    expect(oil(TUE).split.map((x: any) => [x.s, x.e, x.dflt]), 'earning OIL by default').toEqual([[h(6, 30), h(13), true]])
    // D1060 (the agent's call, told with the drawing): no brief or debrief window on a flying standby row
    expect(warns(TUE, 'split', /BRIEF/)).toEqual([])
  })
})

describe('W14 — D1996 (Q3 answered, 11 Nov 26): a standby line that flies is checked like a sortie — a clash inside it is red, and the tight-turn and double-turn notes apply', () => {
  it('D1996: a lecture inside a flying SC AM shift is the red clash, as inside an ordinary sortie; a sortie 30 min after the flying shift\'s END is a tight turn', () => {
    const w: any = makeStandalone('sc'); add(TUE, w)
    const am = w.formations[0]; am.rl = '06:30'; am.aircraft[2].p = 'split'
    ;(DAYS[TUE] as any).ground.push({ prog: 'LECTURE', str: '0900', end: '1000', who: 'split' })
    expect(warns(TUE, 'split', /DOUBLE_BOOK|SHIFT_SOFT/).map((x: any) => [x.code, x.sev]), 'the flying SPARE').toEqual([['DOUBLE_BOOK', 'hard']])
    ;(DAYS[TUE] as any).waves.splice(0)
    add(TUE, flyLine([], '08:00', '12:00', 'split'))
    expect(warns(TUE, 'split', /DOUBLE_BOOK|SHIFT_SOFT/).map((x: any) => [x.code, x.sev]), 'an ordinary sortie').toEqual([['DOUBLE_BOOK', 'hard']])
    ;(DAYS[TUE] as any).ground.splice(0); (DAYS[TUE] as any).waves.splice(0)
    add(TUE, w); add(TUE, flyLine([], '13:30', '14:30', 'split'))  // 30 min after the flying shift's END
    expect(warns(TUE, 'split', 'TURN').map((x: any) => x.sev), 'END → the next take-off, as a landing → take-off').toEqual(['adv'])
    expect(warns(TUE, 'split', /DOUBLE_BOOK|SHIFT_SOFT/), 'one after the other is a turn, not a clash').toEqual([])
  })
  it('D1996, the edges: the same shift standing by (nothing typed) keeps the amber SHIFT_SOFT and no turn; a Meeting input inside a flying shift is red; the SC MAIN that only stands by is untouched', () => {
    const w: any = makeStandalone('sc'); add(TUE, w)
    const am = w.formations[0]; am.aircraft[0].p = 'split'           // the MAIN row, nothing typed: stands by
    ;(DAYS[TUE] as any).ground.push({ prog: 'LECTURE', str: '0900', end: '1000', who: 'split' })
    expect(warns(TUE, 'split', /DOUBLE_BOOK|SHIFT_SOFT/).map((x: any) => [x.code, x.sev]), 'standing by: as built').toEqual([['SHIFT_SOFT', 'adv']])
    ;(DAYS[TUE] as any).ground.splice(0); add(TUE, flyLine([], '13:30', '14:30', 'split'))
    expect(warns(TUE, 'split', 'TURN'), 'a shift that only stands by is not a leg').toEqual([])
    ;(DAYS[TUE] as any).waves.splice(1)
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: h(9), e: h(10), type: 'Meeting', remarks: '', mod: '' } as any)
    expect(warns(TUE, 'split', /SHIFT_SOFT|INPUT_FLY/).map((x: any) => [x.code, x.sev]), 'a Meeting against the MAIN standing by: amber, as built').toEqual([['SHIFT_SOFT', 'adv']])
    am.rl = '06:30'
    expect(warns(TUE, 'split', /SHIFT_SOFT|INPUT_FLY/).map((x: any) => [x.code, x.sev]), 'the same Meeting once the shift flies: red').toEqual([['INPUT_FLY', 'hard']])
    // a row ticked "Flies" by hand flies alone — its shift's other rows still stand by (D1061)
    am.rl = ''; INPUTS.splice(0); am.aircraft[0].p = ''; am.aircraft[2].p = 'split'; am.aircraft[2].fly = true
    ;(DAYS[TUE] as any).ground.push({ prog: 'LECTURE', str: '0900', end: '1000', who: 'split' })
    expect(warns(TUE, 'split', /DOUBLE_BOOK|SHIFT_SOFT/).map((x: any) => [x.code, x.sev]), 'the hand-ticked SPARE').toEqual([['DOUBLE_BOOK', 'hard']])
  })
  /* The bug check of 12 Nov 26 (walker W2 S29.1, Astra 5): with Logic's "SC MAIN clashes → another shift" at Advisory, a
     flying SC AM against the standing PM read amber. D1996: a standby line that flies is checked like a sortie, and a
     clash inside it is red — the Advisory setting is about a shift that only stands by. */
  it('D1996: a flying MAIN against a standing MAIN stays red under "another shift: Advisory", in both orders; two standing shifts still follow the setting', () => {
    const was = SHIFT_HARD.shift, wasFly = SHIFT_HARD.fly
    try {
      SHIFT_HARD.shift = false
      const w: any = makeStandalone('sc'); add(TUE, w)
      const am = w.formations[0], pm = w.formations[1]
      Object.assign(pm, { to: '09:00', ld: '15:00' }); am.aircraft[0].p = 'bane'; pm.aircraft[0].p = 'bane'
      am.aircraft[0].fly = true
      expect(warns(TUE, 'bane', /DOUBLE_BOOK|SHIFT_SOFT/).map((x: any) => [x.code, x.sev]), 'AM flies, PM stands by').toEqual([['DOUBLE_BOOK', 'hard']])
      am.aircraft[0].fly = false; pm.aircraft[0].fly = true
      expect(warns(TUE, 'bane', /DOUBLE_BOOK|SHIFT_SOFT/).map((x: any) => [x.code, x.sev]), 'PM flies, AM stands by').toEqual([['DOUBLE_BOOK', 'hard']])
      pm.aircraft[0].fly = false
      expect(warns(TUE, 'bane', /DOUBLE_BOOK|SHIFT_SOFT/).map((x: any) => [x.code, x.sev]), 'both stand by: the setting, Advisory').toEqual([['SHIFT_SOFT', 'adv']])
      /* the narrow read of the fix: grading the flying row as "a flight" swapped one setting for another — with "a
         flight" at Advisory and "another shift" at Warning it turned amber. A clash with it is red, whatever either says. */
      SHIFT_HARD.shift = true; SHIFT_HARD.fly = false; am.aircraft[0].fly = true
      expect(warns(TUE, 'bane', /DOUBLE_BOOK|SHIFT_SOFT/).map((x: any) => [x.code, x.sev]), '"a flight" at Advisory: still red').toEqual([['DOUBLE_BOOK', 'hard']])
    } finally { SHIFT_HARD.shift = was; SHIFT_HARD.fly = wasFly }
  })
  /* THE CREW LIST AGREES WITH THE WARNING LIST (the roll-call's MISSING row for D1996, closed 12 Nov 26): a man on a
     flying standby shift with a lecture or a Meeting inside it reads in the crew list as he would on a sortie — the
     same "already on …" reason — where it used to read nothing while the warning list rang red. */
  it('D1996, the crew list: on a flying SC shift a lecture and a Meeting inside it give the sortie\'s reason; standing by, both stay silent, as built', () => {
    const w: any = makeStandalone('sc'); const gi = add(TUE, w)
    const am = w.formations[0]; am.aircraft[0].p = 'split'
    const seat = `${TUE}.${gi}.0.0.p`
    ;(DAYS[TUE] as any).ground.push({ prog: 'LECTURE', str: '0900', end: '1000', who: 'split' })
    validate()
    expect(slotBar('split', seat), 'standing by: a soft ground row does not bar him, as built').toBe('')
    am.rl = '06:30'; validate()
    const flying = slotBar('split', seat)
    /* the same man, the same lecture, on an ordinary sortie over the same hours */
    ;(DAYS[TUE] as any).waves.splice(0); const fg = add(TUE, flyLine([], '08:00', '12:00', 'split')); validate()
    const sortie = slotBar('split', `${TUE}.${fg}.0.0.p`)
    expect(sortie, 'the sortie\'s reason').toBe('already on LECTURE 09:00–10:00')
    expect(flying, 'the flying shift reads the same').toBe(sortie)
    /* a Meeting input, not on the programme */
    ;(DAYS[TUE] as any).ground.splice(0); (DAYS[TUE] as any).waves.splice(0); add(TUE, w)
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: h(9), e: h(10), type: 'Meeting', remarks: '', mod: '' } as any)
    am.rl = ''; validate()
    expect(slotBar('split', seat), 'standing by: the Meeting is the shift\'s amber, never a bar — as built').toBe('')
    am.rl = '06:30'; validate()
    expect(slotBar('split', seat), 'flying: the sortie\'s reason').toMatch(/^already on Meeting 09:00–10:00/)
  })
})

describe('W15 — a flying standby row\'s day ends at END with no debrief; a hand tick lights that one row only (D1045, D1044, D1061)', () => {
  it('SC PM 13:00–19:00 flying, its SPARE on a sortie next morning: an 07:00 report is clear (rest from END, nothing added), 06:59 is a breach', () => {
    const w: any = makeStandalone('sc'); add(MON, w)
    const pm = w.formations[1]; pm.rl = '12:00'; pm.aircraft[2].p = 'split'
    const tue: any = flyLine(['07:00 IN TIME'], '10:00', '11:00', 'split'); add(TUE, tue)
    expect(warns(TUE, 'split', 'CREW_REST'), 'the equal-time edge: 19:00 + 12h = 07:00 exactly').toEqual([])
    tue.intimes = ['06:59 IN TIME']
    expect(warns(TUE, 'split', 'CREW_REST').length, 'a minute inside the rest').toBe(1)
  })
  it('nothing typed: a hand tick flies its own row (crew rest and OIL) and never its shift; a second tap takes it off', () => {
    const w: any = makeStandalone('sc'); add(TUE, w)
    const am = w.formations[0]; am.aircraft[2].p = 'split'; am.aircraft[3].p = 'stuff'
    am.aircraft[2].fly = true
    expect(am.aircraft.map((a: any) => saFlies(w, am, a))).toEqual([false, false, true, false])
    validate()
    expect(dayEvents(TUE, 'split').some((e: any) => e.kind === 'shift'), 'the ticked SPARE is on shift').toBe(true)
    expect(dayEvents(TUE, 'stuff').some((e: any) => e.kind === 'shift'), 'its neighbour still stands by').toBe(false)
    expect(oil(TUE).split[0].dflt).toBe(true)
    expect(oil(TUE).stuff[0].dflt).toBe(false)
    am.aircraft[2].fly = false
    validate()
    expect(dayEvents(TUE, 'split').some((e: any) => e.kind === 'shift'), 'untick: standing by again').toBe(false)
  })
})

describe('W16 — a row on a typed line that does not come in is cancelled with its own CX; the rest still flies; no untick (D1046)', () => {
  it('SC AM R typed, both SPAREs seated, one CX: his crew rest, OIL and count go; the other SPARE still flies; a cleared tick on a typed line changes nothing', () => {
    const w: any = makeStandalone('sc'); add(TUE, w)
    const am = w.formations[0]; am.rl = '06:30'; am.aircraft[2].p = 'split'; am.aircraft[3].p = 'stuff'
    expect(dayCount(DAYS[TUE])).toBe('2 / 2')
    am.aircraft[3].cx = true
    validate()
    expect(dayEvents(TUE, 'stuff').length, 'no shift, no crew rest').toBe(0)
    expect(oil(TUE).stuff, 'no OIL').toBeUndefined()
    expect(dayCount(DAYS[TUE]), 'one jet, not two').toBe('1 / 2')
    expect(dayEvents(TUE, 'split').some((e: any) => e.kind === 'shift'), 'the rest of the line still flies').toBe(true)
    am.aircraft[2].fly = false                                     // "there is no untick"
    expect(saFlies(w, am, am.aircraft[2])).toBe(true)
  })
})

describe('W17 — a standby row with nobody seated is no jet or sortie; an ordinary empty flying line still counts (D1062, D1009)', () => {
  it('Insights: an empty ordinary line is a sortie and a formation; an empty flying standby row nothing; a row with only its rear seat filled counts', () => {
    const base = computeInsights()
    add(TUE, { label: 'WAVE 1', intimes: [], formations: [{ cs: 'VL', msn: 'BFM', to: '10:00', ld: '11:00', aircraft: [{ p: '', w: '', rmks: '', opts: {} }] }] })
    const one = computeInsights()
    expect([one.sorties - base.sorties, one.forms - base.forms], 'D1009: nobody on it, still one sortie, one formation').toEqual([1, 1])
    const w: any = makeStandalone('sc'); add(TUE, w)
    const am = w.formations[0]; am.rl = '06:30'
    am.aircraft[0].p = 'split'; am.aircraft[1].p = 'stuff'
    const two = computeInsights()
    expect([two.sorties - one.sorties, two.forms - one.forms], 'D1062: two seated MAIN rows, both SPAREs empty — 2, not 4').toEqual([2, 1])
    am.aircraft[2].w = 'bullet'                                    // the agent's reading: "neither seat" — one seat is somebody
    expect(computeInsights().sorties - two.sorties).toBe(1)
  })
})

describe('W18 — three stand as built: a seatless row of a flying shift keeps its lit "✓ FLIES" though it counts nothing (D1067)', () => {
  it('the week draws the lit chip on an empty SPARE row of a typed shift, while the day\'s count leaves it out', () => {
    const w: any = makeStandalone('sc'); const gi = add(TUE, w)
    const am = w.formations[0]; am.rl = '06:30'; am.aircraft[0].p = 'split'
    expect(saFliesHTML(`${TUE}.${gi}.0.3`, am.aircraft[3], false, false)).toMatch(/✓ FLIES/)
    expect(dayCount(DAYS[TUE])).toBe('1 / 2')
    // the no-times warning is line-anchored (its START box), as every line-anchored warning is
    const bb: any = makeStandalone('bb'); const bi = add(TUE, bb); bb.formations[0].aircraft[0].p = 'stuff'; bb.formations[0].aircraft[0].fly = true
    expect(warns(TUE, null, 'SA_FLY_NO_TIME').map((x: any) => x.key)).toEqual([`ff:${TUE}.${bi}.0.to`])
  })
})

describe('W19 — the "✓ FLIES" chip shows lit where a row flies; the week shows nothing on a row that does not fly (D1060, D1064)', () => {
  it('off the board: nothing on a standing-by row, a read-only lit chip (never a button) on a flying one', () => {
    const w: any = makeStandalone('avalon'); const gi = add(TUE, w)
    const f = w.formations[0]; f.aircraft[2].p = 'split'
    expect(saFliesHTML(`${TUE}.${gi}.0.2`, f.aircraft[2], true, false), 'the week, standing by').toBe('')
    f.aircraft[2].fly = true
    const lit = saFliesHTML(`${TUE}.${gi}.0.2`, f.aircraft[2], true, false)
    expect(lit).toMatch(/✓ FLIES/)
    expect(lit).not.toMatch(/<button/)
  })
})

describe('W20 — SC, AVALON and BB are not flying load unless the line flies; SC main counts towards work hours (D516, D1042)', () => {
  it('SC AM standing by: no sortie, the MAIN\'s hours count, the SPARE\'s none; R typed: both sorties and both on shift from the R', () => {
    const w: any = makeStandalone('sc'); add(TUE, w)
    const am = w.formations[0]; am.aircraft[0].p = 'bane'; am.aircraft[2].p = 'stiff'
    const av: any = makeStandalone('avalon'); add(TUE, av); av.formations[0].aircraft[0].p = 'split'
    const hrs = (I: any, id: string) => (I.hours.find((x: any) => x.id === id) || { mins: 0 }).mins
    const a = computeInsights()
    expect([a.sorties, a.forms], 'not flying load').toEqual([0, 0])
    expect(hrs(a, 'bane'), 'SC main counts towards work hours').toBe(h(6))
    expect(hrs(a, 'stiff'), 'an SC SPARE standing by: none').toBe(0)
    expect(hrs(a, 'split'), 'an AVALON MAIN standing by: none (D516 "does not decide other duties\' hours")').toBe(0)
    am.rl = '06:30'
    const b = computeInsights()
    expect([b.sorties, b.forms]).toEqual([2, 1])
    expect([hrs(b, 'bane'), hrs(b, 'stiff')]).toEqual([h(6, 30), h(6, 30)])
  })
})

describe('W21 — in the crew list a man whose only task is standing by is not faded; the day\'s figures not changed (D1120)', () => {
  it('SC SPARE, an AVALON / BB row that does not fly and the AVALON desk read free in the crew list; the figures keep AVALON, BB and the desk tasked; flying, or tasked elsewhere, he is tasked', () => {
    const d: any = { dow: 'Tue', dt: 'Jul 14', waves: [], dutywaves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [] }
    const sc: any = makeStandalone('sc'); sc.formations[0].aircraft[2].p = 'ignite'
    const av: any = makeStandalone('avalon'); av.formations[0].aircraft[0].p = 'split'; av.formations[0].aircraft[1].p = 'bullet'
    const bb: any = makeStandalone('bb'); bb.formations[0].aircraft[3].p = 'stuff'
    d.waves.push(sc, av, bb)
    d.dutywaves.push({ ...blockFromTpl('avalon'), rows: [{ role: 'SXO', id: 'bane', str: '19:00', end: '07:00' }] })
    d.dutywaves.push({ ...blockFromTpl('sc'), rows: [{ role: 'SXO AM', id: 'stiff', str: '07:00', end: '13:00' }] })
    d.sims.amt.push({ label: 'EP-4N', p: 'bullet', w: '', str: '09:00', end: '11:00' })   // bullet is tasked elsewhere too
    const crewList = dayEngaged(d, true), figures = dayEngaged(d)
    expect(['ignite', 'split', 'stuff', 'bane'].filter(id => crewList.has(id)), 'standing by: not tasked in the crew list').toEqual([])
    expect(['bullet', 'stiff'].filter(id => crewList.has(id)), 'a sim, an SC desk').toEqual(['bullet', 'stiff'])
    expect(['split', 'stuff', 'bane'].filter(id => figures.has(id)), 'the day\'s figures not changed').toEqual(['split', 'stuff', 'bane'])
    expect([...dayStandby(d).keys()].sort()).toEqual(['bane', 'bullet', 'ignite', 'split', 'stuff'])
    av.formations[0].rl = '18:30'
    expect(dayEngaged(d, true).has('split'), 'a standby row that flies is a flight, so a task').toBe(true)
  })
})

describe('W22 — the MAIN / SPARE flip is a real change the rules engine reads and the next amendment carries (settled, Aug 26)', () => {
  it('an SC AM row on local leave: MAIN flags hard, flipped to SPARE it is clean — and the day\'s fr: key changes', () => {
    const w: any = makeStandalone('sc'); const gi = add(TUE, w)
    const a = w.formations[0].aircraft[0]; a.p = 'split'
    allDay('split', 'LL')
    const before = dayKeys(DAYS[TUE], TUE).get(`fr:${TUE}.${gi}.0.0`)
    expect(hard(TUE, 'split').length, 'MAIN on local leave').toBeGreaterThan(0)
    a.spare = true; a.role = 'SPARE'                               // what the badge's flip writes (ui/interactions.ts)
    expect(hard(TUE, 'split'), 'SPARE: standing by, local leave stands').toEqual([])
    expect(dayKeys(DAYS[TUE], TUE).get(`fr:${TUE}.${gi}.0.0`), 'the amendment\'s fingerprint moves').not.toBe(before)
  })
})

describe('W23 — a standalone SPARE is barred by !canSpare: overseas and every medical code, even with no shift times (settled 10 Aug 26; D605)', () => {
  it('an SC SPARE with its shift times cleared: a whole-day LL stays silent, a whole-day OL or ATT C flags; a part-day OL says nothing (nothing to compare)', () => {
    const w: any = makeStandalone('sc'); add(TUE, w)
    const am = w.formations[0]; am.to = ''; am.ld = ''; am.aircraft[2].p = 'split'
    allDay('split', 'LL')
    expect(hard(TUE, 'split')).toEqual([])
    INPUTS.splice(0); allDay('split', 'OL')
    expect(hard(TUE, 'split').map((x: any) => x.code)).toEqual(['LEAVE_FLY'])
    INPUTS.splice(0); allDay('split', 'ATT C')
    expect(hard(TUE, 'split').map((x: any) => x.code)).toEqual(['DNIF_FLY'])
    INPUTS.splice(0); INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: h(8), e: h(10), type: 'OL', remarks: '', mod: '' } as any)
    expect(hard(TUE, 'split')).toEqual([])
  })
})

describe('W24 — AVALON / BB keep noconf: nothing cross-checked against tasks or rest, ONE look; a whole-day absence flags with blank times (settled 11 Aug / 7 Sep 26; D605, D1042)', () => {
  it('a BB SPARE with blank times: whole-day OL flags, whole-day LL silent; AVALON tonight and an 06:00 report tomorrow raises no crew rest — until the line flies', () => {
    const bb: any = makeStandalone('bb'); add(TUE, bb); bb.formations[0].aircraft[3].p = 'stuff'
    allDay('stuff', 'OL')
    expect(hard(TUE, 'stuff').map((x: any) => x.code)).toEqual(['LEAVE_FLY'])
    INPUTS.splice(0); allDay('stuff', 'LL')
    expect(hard(TUE, 'stuff')).toEqual([])
    const av: any = makeStandalone('avalon'); add(MON, av); av.formations[0].aircraft[0].p = 'split'
    add(TUE, flyLine(['06:00 IN TIME'], '09:00', '10:00', 'split'))
    expect(warns(TUE, 'split', 'CREW_REST'), 'standing by: "it should not raise a warning" (7 Sep 26)').toEqual([])
    av.formations[0].rl = '18:30'
    expect(warns(TUE, 'split', 'CREW_REST').length, 'flying: a real flight with every warning (D1042)').toBe(1)
  })
})

describe('W25 — a desk minted from an SC / AVALON / BB template is that wave\'s, "exempt as its wave is" (settled 13 Aug 26) — D1997 once the wave flies', () => {
  it('D1997 (Q4 answered): once its wave flies the AVALON desk is fully checked and earns OIL by default; the SC desk is an SC seat for the spare rule', () => {
    const av: any = makeStandalone('avalon'); add(TUE, av); av.formations[0].rl = '18:30'; av.formations[0].aircraft[0].p = 'split'
    ;(DAYS[TUE] as any).dutywaves.push({ ...blockFromTpl('avalon'), rows: [{ role: 'SXO', id: 'bane', str: '19:00', end: '07:00' }] })
    add(TUE, flyLine([], '20:00', '21:00', 'bane'))                 // the desk man's own sortie, inside the desk's hours
    expect(warns(TUE, 'bane', 'DOUBLE_BOOK').map((x: any) => x.sev), 'his words: "once the wave flies the desk is fully checked"').toEqual(['hard'])
    expect(oil(TUE).bane.filter((x: any) => x.src === 'Duty').map((x: any) => x.dflt), '"…and earns OIL by default"').toEqual([true])
    // the same wave standing by (nothing typed): the desk stays exempt and off by default, as built
    av.formations.forEach((f: any) => { f.rl = ''; f.br = '' })
    expect(warns(TUE, 'bane', 'DOUBLE_BOOK'), 'standing by: not cross-checked').toEqual([])
    expect(oil(TUE).bane.filter((x: any) => x.src === 'Duty').map((x: any) => x.dflt), 'standing by: earns nothing by default').toEqual([false])
    // a BB desk does not follow the AVALON wave's flying — only its own wave's
    av.formations[0].rl = '18:30'
    ;(DAYS[TUE] as any).dutywaves.splice(0); (DAYS[TUE] as any).dutywaves.push({ label: 'BB', sa: 'bb', noconf: true, rows: [{ role: 'BB DUTY', id: 'bane', str: '19:00', end: '07:00' }] })
    expect(warns(TUE, 'bane', 'DOUBLE_BOOK'), 'the BB desk, its BB wave not flying').toEqual([])
    av.formations[0].rl = ''; (DAYS[TUE] as any).dutywaves.splice(0)
    // "an SC desk an SC seat for the spare rule"
    const sc: any = makeStandalone('sc'); add(TUE, sc); sc.formations[0].aircraft[2].p = 'stuff'
    ;(DAYS[TUE] as any).dutywaves.push({ ...blockFromTpl('sc'), rows: [{ role: 'SXO AM', id: 'stuff', str: '07:00', end: '13:00' }] })
    expect(warns(TUE, 'stuff', 'DOUBLE_BOOK').length).toBe(1)
  })
  /* The bug check of 12 Nov 26 (walker W1 S03, Astra 4, the Opus read 2): the warning list said the desk man clashed, but
     his puck on the desk stayed plain — the desk's puck still read "exempt: only my own row's warnings", and the clash is
     anchored to the sortie. D1997: once its wave flies the desk is fully checked, so its puck wears the man's rings as an
     ordinary desk's does (undefined = the day-wide decoration, as for any desk). */
  it('D1997: once its wave flies, the AVALON desk\'s puck rings as an ordinary desk\'s does; standing by it keeps its own rule', () => {
    const av: any = makeStandalone('avalon'); add(TUE, av); av.formations[0].rl = '18:30'; av.formations[0].aircraft[0].p = 'split'
    ;(DAYS[TUE] as any).dutywaves.push({ ...blockFromTpl('avalon'), rows: [{ role: 'SXO', id: 'bane', str: '19:00', end: '07:00' }] })
    add(TUE, flyLine([], '20:00', '21:00', 'bane'))
    validate()
    expect(exemptDeskOwn(TUE, `d:${TUE}.0.0`, 'bane'), 'flying: no longer exempt, the day-wide rings apply').toBeUndefined()
    av.formations[0].rl = ''; validate()
    expect(exemptDeskOwn(TUE, `d:${TUE}.0.0`, 'bane'), 'standing by: its own rule, clean').toBeNull()
  })
})

describe('W26 — a "+ Wave" template mints an ordinary wave whose own kind drives the checks; a standby template keeps the built-in\'s shape (settled Aug–Sep 26)', () => {
  it('an AVALON template with MAIN + SPARE lines: standalone, noconf, checked as the built-in is — standing by local leave stands, R typed it flies', () => {
    const t = addWaveTpl('Nights', 'avalon')!
    try {
      setWaveTplLine(t.id, 0, 'cs', 'AV'); setWaveTplLine(t.id, 0, 'msn', 'NIGHT'); setWaveTplLine(t.id, 0, 'to', '19:00'); setWaveTplLine(t.id, 0, 'ld', '07:00')
      const w: any = waveFromTpl(t.id)
      expect([w.standalone, w.noconf, w.kind]).toEqual([true, true, 'avalon'])
      add(TUE, w); w.formations[0].aircraft[0].p = 'split'
      allDay('split', 'LL')
      expect(hard(TUE, 'split')).toEqual([])
      w.formations[0].rl = '18:30'
      expect(hard(TUE, 'split').map((x: any) => x.code)).toEqual(['LEAVE_FLY'])
    } finally { delWaveTpl(t.id) }
  })
})
