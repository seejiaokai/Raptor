/* A FLIGHT WITH NO LANDING TYPED IS ASSUMED TO LAND A SET FLIGHT LENGTH AFTER TAKE-OFF ([WARN-WORDS-STANDALONE] piece B —
   owner D2046, D2047, D2053, 15 Nov 26). "Where a flight has no landing typed (blank or "TBD"), the app assumes it lands a
   set flight length after take-off — a Logic setting — and says so … every check that reads the landing uses that
   assumed time"; the setting starts at 60 minutes (D2047); such a flight counts in Insights' hours and the long-day note
   up to its assumed landing (D2053). Changes D1990 (the day ends at the assumed landing plus the debrief), D2010 (the
   crew-rest words name the assumed landing) and D2022.

   Ranger's Friday, as he was shown it (D2046's own case): VL BFM took off 12:00 with no landing typed, RU took off 13:00
   — today the tight turn read 60 min and the debrief 12:00–14:00; with the assumed landing VL lands 13:00, the turn reads
   0 min and the debrief 13:00–15:00. Each reader of the landing is staged here through the engine's own doors (validate,
   workSpan, dayOilSpans, personBusy, slotRules), with a typed landing as the control that does not move. The OIL kept on
   a published day (D2005, D2044) is in leavewar/assumedlanding-published.test.ts. Harness: rulescheck-batch2.test.ts's. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED, signOf, setDayApproved } from './publish'
import { VCONF, RULE_SPEC, RULE_STD } from './rules'
import { PEOPLE } from './people'
import { validate, workSpan, dayEvents } from './validate'
import { dayOilSpans } from './oil'
import { personBusy, slotRules } from './avail'
import { KEPT_RULE_KEYS } from './faceattrs'
import { hydrateRoles } from '../state/mission-roles'
import { makeStandalone } from './waves'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF }, p: JSON.stringify(PEOPLE) }
const h = (hh: number, mm = 0) => hh * 60 + mm
const MON = 0, TUE = 1, FRI = 4, SAT = 5
const day = (di: number): any => DAYS[di]
const add = (di: number, w: any) => { day(di).waves.push(w); return day(di).waves.length - 1 }
const ac = (p = '', w = '', rmks = '') => ({ p, w, rmks, area: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [ac('bane')], ...o })
const wave = (forms: any[] = [form()], o: any = {}) => ({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: forms, ...o })
const ground = (di: number, who: string, str: string, end: string, prog = 'BRIEFING') => day(di).ground.push({ prog, str, end, who, more: [] })
const warns = (di: number, code?: string | null, id?: string) => validate().all.filter((x: any) => x.di === di
  && (!code || x.code === code) && (!id || (x.who || []).includes(id)))
const msgs = (di: number, code: string, id = 'bane') => warns(di, code, id).map((x: any) => String(x.msg))

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60, fltLen: 60 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  const p0 = JSON.parse(saved.p); Object.keys(PEOPLE).forEach(k => { if (!(k in p0)) delete (PEOPLE as any)[k] }); Object.assign(PEOPLE, p0)
  hydrateRoles([])
})

describe('the setting (D2046, D2047)', () => {
  it('a Logic setting, starting at 60 minutes, kept by a published day with the other settings its checks read (D2005)', () => {
    expect(RULE_STD.v.fltLen).toBe(60)
    expect(RULE_SPEC.fltLen).toMatchObject({ u: 'min' })
    expect(KEPT_RULE_KEYS).toContain('fltLen')
  })
})

describe('Ranger\'s Friday — the tight turn and the debrief read the assumed landing (D2046)', () => {
  const friday = (ld: string) => add(FRI, wave([form({ cs: 'VL', to: '12:00', ld }), form({ cs: 'RU', to: '13:00', ld: '14:00' })]))
  for (const ld of ['', 'TBD']) {
    it(`landing "${ld}": VL lands 13:00, so the turn to RU reads 0 min and names the assumption`, () => {
      friday(ld)
      expect(msgs(FRI, 'TURN')).toEqual(['Tight turn: VL BFM → RU BFM, 0 min (needs 90). VL BFM landing assumed 13:00 (T/O + 1h), RU BFM T/O 13:00'])
    })
  }
  it('the debrief window runs from the assumed landing, 13:00–15:00', () => {
    add(FRI, wave([form({ cs: 'VL', to: '12:00', ld: '' })]))
    ground(FRI, 'bane', '13:10', '13:30')
    expect(msgs(FRI, 'DEBRIEF')).toEqual(['Misses VL BFM debrief 13:00–15:00 (landing assumed): BRIEFING 13:10–13:30'])
  })
  it('the setting moves every one of them: at 30 minutes VL lands 12:30', () => {
    VCONF.fltLen = 30
    friday('')
    expect(msgs(FRI, 'TURN')).toEqual(['Tight turn: VL BFM → RU BFM, 30 min (needs 90). VL BFM landing assumed 12:30 (T/O + 30 min), RU BFM T/O 13:00'])
  })
  it('left as it is: a typed landing is never moved', () => {
    VCONF.fltLen = 30
    friday('12:15')
    expect(msgs(FRI, 'TURN')).toEqual(['Tight turn: VL BFM → RU BFM, 45 min (needs 90). VL BFM landing 12:15, RU BFM T/O 13:00'])
  })
  it('a man busy from the step to the dekit after the ASSUMED landing (D2059): a briefing at 13:10 is a conflict', () => {
    add(FRI, wave([form({ cs: 'VL', to: '12:00', ld: '' })]))
    ground(FRI, 'bane', '13:10', '13:20')
    expect(msgs(FRI, 'DOUBLE_BOOK')).toEqual(['Conflict: VL BFM (landing assumed 13:00, dekit to 13:30) & BRIEFING 13:10–13:20'])
  })
})

describe('crew rest — the day ends at the assumed landing plus the debrief (D1990, D2010 as D2046 changes them)', () => {
  for (const ld of ['', 'TBD']) {
    it(`Monday's VL took off 12:00, landing "${ld}": ended 15:00, clear 03:00 — Tuesday's 04:00 take-off breaks it`, () => {
      add(MON, wave([form({ to: '12:00', ld })]))
      add(TUE, wave([form({ to: '04:00', ld: '05:00' })]))
      const m = msgs(TUE, 'CREW_REST')
      expect(m.length).toBe(1)
      expect(m[0]).toContain('Crew rest: Monday T/O 12:00, landing assumed 13:00 (T/O + 1h) + 2h debrief (assumed) → ended 15:00 → clear 03:00. ')
    })
  }
  /* Astra's blind read (16 Nov 26, finding 1): the day being judged decides (D2005) — its own flight length, as its own
     debrief already does. A published Monday kept 60 minutes; the setting is now 120; Tuesday, not published, is judged by
     120, so Monday's 20:00 sortie with no landing lands 22:00 for Tuesday's crew rest, never Monday's kept 21:00. */
  it('the day being judged decides: Monday published under 60 min, the setting now 120 — Tuesday reads landing 22:00', () => {
    add(MON, wave([form({ to: '20:00', ld: '' })]))
    add(TUE, wave([form({ to: '14:00', ld: '15:00', br: '11:00' })]))
    const g = signOf(MON); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(MON, true)
    VCONF.fltLen = 120
    const m = msgs(TUE, 'CREW_REST')
    expect(m.length, 'clear 12:00 — the 11:00 brief breaks it').toBe(1)
    expect(m[0]).toContain('Monday T/O 20:00, landing assumed 22:00 (T/O + 2h) + 2h debrief (assumed) → ended 00:00')
  })
  it('at 03:00 exactly the rest is legal (the edge moves with the assumed landing)', () => {
    add(MON, wave([form({ to: '12:00', ld: '' })]))
    add(TUE, wave([form({ to: '05:20', ld: '06:20' })]))                    // brief 03:00
    expect(msgs(TUE, 'CREW_REST')).toEqual([])
  })
})

describe('the long day and Insights\' hours count to the assumed landing (D2053, over D1936)', () => {
  for (const ld of ['', 'TBD']) {
    it(`landing "${ld}": the span runs to the assumed landing plus the debrief, and the note says the landing was assumed`, () => {
      ground(TUE, 'bane', '06:00', '07:00')
      add(TUE, wave([form({ to: '18:00', ld })]))
      validate()
      expect(workSpan(dayEvents(TUE, 'bane')), 'Insights reads this span (insights.ts)').toMatchObject({ s: h(6), e: h(21) })
      const m = msgs(TUE, 'LONGDAY')
      expect(m.length).toBe(1)
      expect(m[0]).toMatch(/^Long day: 15h(00)? \(limit 12h\), 06:00 → 21:00 \(VL BFM landing assumed 19:00 \+ 2h debrief assumed\)$/)   // the approved words, spec §3 (D2053)
    })
  }
  /* the re-walk (W3, 16 Nov 26): a line with no callsign typed read "( LATE FLT landing assumed …)" — the name trimmed */
  it('a line with no callsign typed: the flight is named by its mission, no stray space', () => {
    ground(TUE, 'bane', '06:00', '07:00')
    add(TUE, wave([form({ cs: '', msn: 'LATE FLT', to: '18:00', ld: '' })]))
    validate()
    expect(msgs(TUE, 'LONGDAY')[0]).toMatch(/ \(LATE FLT landing assumed 19:00 \+ 2h debrief assumed\)$/)
  })
  it('left as it is: a line with no take-off counts nowhere', () => {
    ground(TUE, 'bane', '06:00', '07:00')
    add(TUE, wave([form({ to: '', ld: '' })]))
    validate()
    expect(workSpan(dayEvents(TUE, 'bane'))).toMatchObject({ s: h(6), e: h(7) })
  })
})

describe('OIL — a weekend flight with no landing earns to its assumed landing (D2046 "every check"; the agent\'s reading)', () => {
  it('Saturday: report 06:00 (default rally) to 10:00 + 2h debrief', () => {
    add(SAT, wave([form({ to: '09:00', ld: '' })]))
    expect(dayOilSpans(day(SAT)).bane).toEqual([[h(6), h(12)]])
    VCONF.fltLen = 90
    expect(dayOilSpans(day(SAT)).bane, 'the setting moves it').toEqual([[h(6), h(12, 30)]])
  })
  it('left as it is: no take-off, nothing earned', () => {
    add(SAT, wave([form({ to: '', ld: '' })]))
    expect(dayOilSpans(day(SAT)).bane).toBeUndefined()
  })
})

describe('who is busy — the crew list and the ALL AVAIL crowd read the same assumed landing', () => {
  it('personBusy: step 11:00 to dekit 13:30', () => {
    add(FRI, wave([form({ to: '12:00', ld: '' })]))
    expect(personBusy(day(FRI), 'bane')).toEqual([[h(11), h(13, 30)]])
  })
  it('the seat\'s own window (slotRules): step 11:00 to dekit 13:30', () => {
    add(FRI, wave([form({ to: '12:00', ld: '' })]))
    expect(slotRules(`${FRI}.0.0.0.p`)).toMatchObject({ slotStart: h(11), slotEnd: h(13, 30) })
  })
})

/* [WARN-WORDS-STANDALONE] piece C — A STANDBY SHIFT WITH ITS START TYPED AND ITS END BLANK IS LEFT OUT OF CREW REST UNTIL ITS
   END IS TYPED (owner D2055, 15 Nov 26 — "never 'ended' at its START; its own 'cannot be worked out' warning stays"). A
   shift's END is never assumed (D2046 is a sortie's landing): with END blank the shift used to end at its START, so a
   Monday SC from 20:00 "ended" 20:00 and cleared Tuesday 08:00 — a rest worked out from a time nobody typed. The same for a
   shift that flies (the agent's reading). */
describe('D2055 — a standby shift with START and no END bears no crew rest until its END is typed', () => {
  const scMon = (to: string, ld: string, flies = false) => {
    const w: any = makeStandalone('sc')
    w.formations = [w.formations[0]]
    Object.assign(w.formations[0], { to, ld, ...(flies ? { br: '19:00' } : {}) })
    w.formations[0].aircraft[0].p = 'bane'
    add(MON, w)
  }
  const tue = () => add(TUE, wave([form({ to: '09:00', ld: '10:00' })], { intimes: ['07:00 IN TIME'] }))
  it('Monday SC 20:00 with END blank: no crew rest on Tuesday (it used to "end" at 20:00 and clear 08:00)', () => {
    scMon('20:00', ''); tue()
    expect(msgs(TUE, 'CREW_REST')).toEqual([])
  })
  it('the same shift flying (its B typed): no crew rest either, and its own warning stays', () => {
    scMon('20:00', '', true); tue()
    expect(msgs(TUE, 'CREW_REST')).toEqual([])
    expect(warns(MON, 'SA_FLY_NO_TIME').map((x: any) => String(x.msg))).toEqual([expect.stringMatching(/flies but has no END\. Type it so its crew rest and OIL can be worked out\.$/)])
  })
  it('the control: END typed 23:00 clears at 11:00 — Tuesday\'s 07:00 in-time breaks it', () => {
    scMon('20:00', '23:00'); tue()
    expect(msgs(TUE, 'CREW_REST')).toHaveLength(1)
  })
})

/* [WARN-WORDS-STANDALONE] — A DUTY DESK MADE FROM AN SC SHIFT TEMPLATE, ITS START TYPED AND ITS END BLANK, IS LEFT OUT OF CREW
   REST UNTIL ITS END IS TYPED, as an SC wave line is (owner D2073, 16 Nov 26 — "2 as recommended", over the walk's finding:
   a Friday desk from 20:00 with no END "ended 21:00 → clear 09:00", START plus the Logic page's one-hour default for any
   other row). The agent's reading, told to him: only a desk from an SC shift template, never every duty row with no END —
   a plain desk keeps the assumed hour (the control below). */
describe('D2073 — an SC-template duty desk with START and no END bears no crew rest until its END is typed', () => {
  const desk = (di: number, str: string, end: string, sa?: string) => {
    const blk: any = { label: sa ? 'SC Shift' : 'Standard', rows: [{ role: 'SXO PM', id: 'bane', str, end, more: [] }] }
    if (sa) blk.sa = sa
    day(di).dutywaves.push(blk)
  }
  const sat = () => add(SAT, wave([form({ to: '09:00', ld: '10:00' })], { intimes: ['07:00 IN TIME'] }))
  it('Friday SC desk 20:00 with END blank: no crew rest on Saturday (it used to "end" 21:00 and clear 09:00)', () => {
    desk(FRI, '20:00', '', 'sc'); sat()
    expect(msgs(SAT, 'CREW_REST')).toEqual([])
  })
  it('the control: its END typed 23:00 clears at 11:00, so Saturday\'s 07:00 in-time breaks it', () => {
    desk(FRI, '20:00', '23:00', 'sc'); sat()
    expect(msgs(SAT, 'CREW_REST')).toHaveLength(1)
  })
  it('a plain desk (no SC template) with END blank keeps the assumed hour: ended 21:00, Saturday 07:00 breaks it', () => {
    desk(FRI, '20:00', ''); sat()
    expect(msgs(SAT, 'CREW_REST')).toHaveLength(1)
  })
  /* Astra's code read of the follow-ups (16 Nov 26, chat 87): the day's events take the same man at the same hours under
     the same name as ONE commitment (the seat-and-extras rule in events.ts), so an SC desk placed BEFORE a plain desk of the
     same role and hours swallowed the plain one — and its "no END" with it: the breach the plain desk makes vanished, by
     block order alone. Both orders must read alike: one commitment, ending at the plain desk's assumed 21:00. */
  it('an SC desk BEFORE a plain desk of the same role and hours: the plain desk still ends 21:00, Saturday 07:00 breaks it', () => {
    desk(FRI, '20:00', '', 'sc'); desk(FRI, '20:00', ''); sat()
    expect(msgs(SAT, 'CREW_REST')).toHaveLength(1)
    expect(msgs(SAT, 'CREW_REST')[0]).toMatch(/21:00/)
  })
  it('the same two desks the other way round read the same, and neither order raises a conflict of the man with himself', () => {
    desk(FRI, '20:00', ''); desk(FRI, '20:00', '', 'sc'); sat()
    expect(msgs(SAT, 'CREW_REST')).toHaveLength(1)
    expect(msgs(SAT, 'CREW_REST')[0]).toMatch(/21:00/)
    expect(msgs(FRI, 'DOUBLE_BOOK')).toEqual([])
  })
  it('the SC-first order raises no conflict of the man with himself either', () => {
    desk(FRI, '20:00', '', 'sc'); desk(FRI, '20:00', ''); sat()
    expect(msgs(FRI, 'DOUBLE_BOOK')).toEqual([])
  })
  it('the same man in an SC desk\'s seat AND its extras is still one commitment with no END: no crew rest', () => {
    desk(FRI, '20:00', '', 'sc'); day(FRI).dutywaves.at(-1).rows[0].more = ['bane']; sat()
    expect(msgs(SAT, 'CREW_REST')).toEqual([])
  })
})
