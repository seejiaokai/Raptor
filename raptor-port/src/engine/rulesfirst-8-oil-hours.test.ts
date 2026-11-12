// @vitest-environment jsdom
/* RULES-FIRST REVIEW, family 8 — OIL hours: how a day is measured and which version earns (W79–W87)
   ([ENGINE-RULES-REVIEW], D1983, 11 Nov 26). OIL is leave earned for working an off day — time off banked, never pay.
   One test per worklist item where no existing test already holds the ruling whole (those are named in the review's
   results, not repeated here), each led by the ruling's own words, on a small made-up week through the app's own doors
   AND the app's real OIL wiring: both stores (the schedule's and the Leave War's), wireLeaveWarSync (which installs the
   hooks that say which day is a weekend or a holiday), the publish door (commitSetDayApproved / publishALDay), the OIL
   pass (runOilPass), the warnings (validate / officialWarn), the board's OIL Earn figures (oilDayFigures) and the
   work-hours span Insights and the long day read (workSpan). Harness: leavewar/publishdoor.test.ts and
   leavewar/oilworkstart-published.test.ts, every day emptied first. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { VCONF } from './rules'
import { SCHED, signOf, setDayApproved, publishALDay, dayDelta, daySnapOf, dayCurVer } from './publish'
import { validate, officialWarn, workSpan, dayEvents } from './validate'
import { dayOilSpans, envMin, uniformOil } from './oil'
import { oilEvidence } from './oilev'
import { makeStandalone } from './waves'
import { stashClear } from './weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { commitSetDayApproved } from '../state/sched-commit'
import { setSession } from '../state/auth'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { getState, initStore as lwInitStore, lwHistInit, rawState, setDayAward, setDayEvent, setPeople, setRole, awardsOnDay } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { recsAt } from '../leavewar/engine/warrecs'
import { isNonWorkingISO, runOilPass, wireLeaveWarSync } from '../leavewar/sync'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { oilDayFigures, oilShown } from '../ui/oilmode'
import { lgChecks } from '../ui/logic-html'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), v: { ...VCONF }, toast: HOOKS.toast }
const h = (hh: number, mm = 0) => hh * 60 + mm
const MON = 0, WED = 2, SAT = 5, SUN = 6
const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
const day = (di: number): any => DAYS[di]
const jet = (p = '', w = '') => ({ p, w, area: '', rmks: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [jet('bane')], ...o })
const wave = (lines: string[] = [], forms: any[] = [form()]) => ({ label: 'WAVE 1', night: false, intimes: lines, traffic: [], formations: forms })
const desk = (di: number, id: string, str: string, end: string, role = 'SDO') => {
  day(di).dutywaves.push({ label: 'Duty', rows: [{ role, id, str, end }] })
}
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const publish = (di: number) => { sign(di); setDayApproved(di, true) }
const amend = (di: number) => { sign(di); publishALDay(di) }
const cellOf = (p: string, iso: string) => getState().wars[0].grid[p]?.[iso]
const worked = (p: string, iso: string) => recsAt(getState().wars[0].recs, p, iso).filter((r: any) => r.oil === 'auto').map((r: any) => r.spans)
const codes = (b: any, di: number) => ((((b.byDay || [])[di] || {}).warns || []) as any[]).map((w: any) => w.code)
const warnOf = (b: any, di: number, code: string) => ((((b.byDay || [])[di] || {}).warns || []) as any[]).find((w: any) => w.code === code)
const oilHow = () => (lgChecks().flatMap((g: any) => g.items).find((c: any) => c.id === 'oil') as any).how() as string[]
let said: string[] = []

beforeEach(() => {
  INPUTS.splice(0)
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d))
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  Object.assign(VCONF, { reportLead: 180, debrief: 120, oilFullMin: 361 })
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' } as any)
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  setRole('admin')
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
})
afterEach(() => {
  HOOKS.toast = saved.toast; _resetTimeline(); setSession(null)
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.assign(VCONF, saved.v)
})

describe('W79 — a flying line\'s OIL runs from the earliest applicable entered in-time / rally, the nominal report time where none is entered; an evening-before report lengthens that line\'s own day only; the day counts first event to last end, breaks included (D592; beside it D591)', () => {
  /* Bane's Saturday: a 07:00–08:00 ground brief, then VL (take-off 12:00, landing 13:00) with the wave's in-time typed
     10:00 — later than the nominal 09:00 (the agent's reading (6): a later typed time shortens). Every reader of OIL hours
     on one made-up day: the engine's walk, the board's OIL Earn figure, the work-hours span Insights and the long day
     read, and — once published — the Leave War's credit and the worked times it stores. */
  it('one made-up Saturday, every reader agrees: 07:00 (his first event) to 15:00 (landing + debrief), gap included, a full day; nothing typed and no brief — 09:00 to 15:00, exactly six hours, a half', () => {
    day(SAT).ground.push({ prog: 'BRIEF', str: '0700', end: '0800', who: 'bane' })
    day(SAT).waves.push(wave(['10:00 IN TIME']))
    validate()
    const sp = [...dayOilSpans(day(SAT)).bane!].sort((a: any, b: any) => a[0] - b[0])
    expect(sp, 'the engine: the brief, and the line from the typed 10:00 (not the nominal 09:00) to 13:00 + 2h').toEqual([[h(7), h(8)], [h(10), h(15)]])
    expect(uniformOil(envMin(sp)), 'first start to last end, the gap included: eight hours').toBe(1)
    expect(oilDayFigures(SAT).bane, 'the board\'s OIL Earn figure').toBe('FO')
    const ws: any = workSpan(dayEvents(SAT, 'bane'))
    expect([ws.s, ws.e], 'the work-hours span (Insights, the long day) runs over the same day').toEqual([h(7), h(15)])
    publish(SAT); runOilPass()
    expect(cellOf('bane', ISO[SAT]), 'the Leave War credit').toBe('FO')
    expect(worked('bane', ISO[SAT]), 'and the worked times it stores beside it').toEqual([[[h(7), h(8)], [h(10), h(15)]]])
    /* the equal-time edge: no brief, nothing typed — the nominal 09:00 to 15:00 is six hours exactly, still a half */
    day(SAT).ground.splice(0); day(SAT).waves[0].intimes = []
    validate()
    expect(dayOilSpans(day(SAT)).bane, 'nothing typed: the nominal report').toEqual([[h(9), h(15)]])
    expect(oilDayFigures(SAT).bane, 'exactly six hours is a half day (6h01 is the full-day line)').toBe('HO')
    const ws2: any = workSpan(dayEvents(SAT, 'bane'))
    expect([ws2.s, ws2.e], 'the work hours start at the same default').toEqual([h(9), h(15)])
    amend(SAT); runOilPass()
    expect(cellOf('bane', ISO[SAT]), 'published again: the credit follows').toBe('HO')
  })
  it('a report on the evening before lengthens the line\'s own day and credits the day before nothing — the Saturday walk never sees Sunday\'s line', () => {
    day(SUN).waves.push(wave(['22:00 IN TIME'], [form({ to: '01:00', ld: '02:00' })]))
    expect(dayOilSpans(day(SUN)).bane, 'Sunday\'s day starts at 22:00 the evening before').toEqual([[h(-2), h(4)]])
    expect(dayOilSpans(day(SAT)).bane, 'Saturday has nothing from it').toBeUndefined()
    publish(SAT); publish(SUN); runOilPass()
    expect([cellOf('bane', ISO[SAT]), cellOf('bane', ISO[SUN])], 'six hours — a half day, on Sunday only').toEqual([undefined, 'HO'])
    expect(worked('bane', ISO[SUN]), 'the stored times are the date\'s own, from midnight').toEqual([[[0, h(4)]]])
  })
})

describe('W80 — an SC shift\'s typed B counts as work: its OIL and work hours run from it to the shift\'s end; a blank B leaves the written start to end; a rally typed on an SC MAIN line starts that crew\'s day as the B does (D606, D1041; beside it D1044, D1045)', () => {
  const sc = () => { const w: any = makeStandalone('sc'); w.formations[0].aircraft[0].p = 'bane'; w.formations[0].aircraft[2].p = 'stiff'; day(SAT).waves.push(w); return w.formations[0] }
  it('his case and its edges, read by the OIL walk, the board and the work-hours span alike: blank B — 07:00–13:00, a half; B 06:00 — from 06:00, a full day, the SPARE flying too (D1044 over D606\'s reading 3); R 05:30 beside it — the earlier; a B typed after the START — the planned START (D1044)', () => {
    const f = sc()
    validate()
    expect(dayOilSpans(day(SAT)).bane, 'a blank B: the written start to end').toEqual([[h(7), h(13)]])
    expect([oilDayFigures(SAT).bane, oilDayFigures(SAT).stiff], 'the MAIN a half; the SPARE stands by — off by default').toEqual(['HO', undefined])
    f.br = '06:00'; validate()
    expect(dayOilSpans(day(SAT)).bane, 'the B starts his OIL').toEqual([[h(6), h(13)]])
    expect([oilDayFigures(SAT).bane, oilDayFigures(SAT).stiff], 'seven hours, a full day — and the SPARE flies from the B (D1044, D1045)').toEqual(['FO', 'FO'])
    const ws: any = workSpan(dayEvents(SAT, 'bane'))
    expect([ws.s, ws.e], '"its OIL and work hours run from it" — the work-hours span agrees').toEqual([h(6), h(13)])
    f.rl = '05:30'; validate()
    expect(dayOilSpans(day(SAT)).bane, 'a rally earlier than the B: the earlier starts the day (D1041)').toEqual([[h(5, 30), h(13)]])
    f.rl = ''; f.br = '08:00'; validate()
    expect(dayOilSpans(day(SAT)).bane, 'a B typed after the START: the line flies on its planned START and END (D1044; D606 reading 1)').toEqual([[h(7), h(13)]])
    const ws2: any = workSpan(dayEvents(SAT, 'bane'))
    expect([ws2.s, ws2.e], 'the work hours agree').toEqual([h(7), h(13)])
  })
  // RULES-FIRST FINDING 8.1 (11 Nov 26, [ENGINE-RULES-REVIEW]): the Logic page's OIL "How it works" says a standby row that flies earns "from its B or R (the earlier) to its END"; with a B typed after the shift's START the app counts from the START (D1044's planned START and END); flip to it() when fixed.
  // FIXED by the words job ([RULES-CHECK-FIXES] job 3, the report's F8 words): "from its B or R if earlier than its START, otherwise from its START, to its END".
  it('8.1 — the Logic line read as written (D932: every line correct for a real case): an SC AM shift 07:00–13:00 with its B typed 08:00 earns, as the line says, from 08:00 — or the line no longer says so', () => {
    const f = sc(); f.br = '08:00'; validate()
    const says = oilHow().some(s => /from its B or R \(the earlier\) to its END/.test(s))
    const start = dayOilSpans(day(SAT)).bane![0]![0]
    expect({ says, start }, 'the line and the app agree').toEqual(says ? { says, start: h(8) } : { says, start })
  })
})

describe('W81 — a flying line with the same written take-off and landing still earns, the day saying the times look wrong — a warning, not a refusal; an overnight line earns on the day it sits on, the hours past midnight earn the next day nothing (D49, D42)', () => {
  it('VL 10:00–10:00 on Saturday: a half day from its report and debrief, the line flagged as an advisory and NOT in the "no usable times" list; a Saturday-night AVALON 19:00–07:00 that flies earns Saturday only', () => {
    day(SAT).waves.push(wave([], [form({ to: '10:00', ld: '10:00' })]))
    const av: any = makeStandalone('avalon'); av.formations[0].aircraft[0].p = 'stiff'; av.formations[0].rl = '18:00'
    day(SAT).waves.push(av)
    const b = validate()
    expect(dayOilSpans(day(SAT)).bane, 'D49: 07:00 report to 12:00 debrief').toEqual([[h(7), h(12)]])
    expect(oilDayFigures(SAT).bane, '"It should still earn"').toBe('HO')
    expect(warnOf({ byDay: b.byDay }, SAT, 'FLT_NO_LEN')?.sev, '"the day must SAY the times look wrong" — an advisory').toBe('adv')
    expect(String(warnOf({ byDay: b.byDay }, SAT, 'OIL_NO_TIMES')?.msg || ''), 'never named as a line that earns nobody').not.toContain('VL')
    expect(dayOilSpans(day(SAT)).stiff, 'D42: the night line from its 18:00 rally, through midnight, on Saturday').toEqual([[h(18), h(31)]])
    expect(oilDayFigures(SAT).stiff, 'thirteen hours — a full day, and a standby line that flies earns by default (D1042)').toBe('FO')
    expect(dayOilSpans(day(SUN)).stiff, '"Monday doesnt earn" — the day after gets nothing').toBeUndefined()
    publish(SAT); publish(SUN); runOilPass()
    expect([cellOf('stiff', ISO[SAT]), cellOf('stiff', ISO[SUN])]).toEqual(['FO', undefined])
    expect(worked('stiff', ISO[SAT]), 'the stored times end at midnight').toEqual([[[h(18), 1439]]])
  })
})

describe('W82 — only the issued schedule earns OIL, both ways: a holiday declared after publication waits for republication, the day saying so; a day\'s OIL comes from its latest published version — no lock, no clock; a later amendment taking a man off a past day takes that day\'s OIL from him (D2, D142)', () => {
  it('D142: a working-copy change pays nothing; the amendment that takes Stiff off takes his OIL, Bane\'s standing', () => {
    day(SAT).waves.push(wave([], [form({ to: '10:00', ld: '11:15', aircraft: [jet('bane', 'stiff')] })]))
    publish(SAT); runOilPass()
    expect([cellOf('bane', ISO[SAT]), cellOf('stiff', ISO[SAT])]).toEqual(['FO', 'FO'])
    day(SAT).waves[0].formations[0].aircraft[0].w = ''          // taken off in the working copy only
    validate(); runOilPass()
    expect(cellOf('stiff', ISO[SAT]), 'a draft change pays and costs nothing until it is published').toBe('FO')
    amend(SAT); runOilPass()
    expect([cellOf('bane', ISO[SAT]), cellOf('stiff', ISO[SAT])], '"a later amendment … takes that day\'s OIL from him"').toEqual(['FO', undefined])
  })
  it('an Undo of the publish is an unpublish: the only published version gone, the day pays nothing', () => {
    day(SAT).waves.push(wave([], [form({ to: '10:00', ld: '11:15' })]))
    sign(SAT); commitSetDayApproved(SAT, true); runOilPass()
    expect(cellOf('bane', ISO[SAT])).toBe('FO')
    expect(globalUndo().ok).toBe(true); runOilPass()
    expect(cellOf('bane', ISO[SAT]), 'no published version — no OIL').toBeUndefined()
  })
  /* The published-day family's question (7.U2), answered with the real hooks: a Wednesday published as a working day with
     a flying line that has no times (and Stiff on a 08:00–15:00 desk); then the Leave War makes it a public holiday. */
  it('D2 with the real wiring (7.U2): made a holiday after publishing, the day reads ONE pending change, says why (amber), shows the red "no usable times" on its face — and pays nobody until it is published again', () => {
    day(WED).waves.push(wave([], [form({ to: '', ld: '' })]))
    desk(WED, 'stiff', '0800', '1500')
    publish(WED); validate(); runOilPass()
    expect(codes(officialWarn(), WED).filter(c => /^OIL_/.test(c)), 'published as a working day: no OIL words at all').toEqual([])
    expect(dayDelta(WED), 'nothing waits').toEqual([])
    expect(setDayEvent(ISO[WED], 0, 'PH')).toBe(true)
    validate(); runOilPass()
    const face = officialWarn()
    expect(warnOf(face, WED, 'OIL_STALE_DAY')?.sev, '"the day saying so" (D2)').toBe('adv')
    expect(warnOf(face, WED, 'OIL_NO_TIMES')?.sev, 'and the red line naming the timeless VL, live on the published face').toBe('hard')
    expect(dayDelta(WED).map((e: any) => e.kind), 'with the real hooks the day DOES read pending — one OIL change').toEqual(['oil'])
    expect(cellOf('stiff', ISO[WED]), '"waits for republication"').toBeUndefined()
    amend(WED); validate(); runOilPass()
    expect(cellOf('stiff', ISO[WED]), 'published again: Stiff\'s seven hours land').toBe('FO')
    expect(codes(officialWarn(), WED).filter(c => /^OIL_/.test(c)), 'the stale line goes; the timeless line is still true, and still said').toEqual(['OIL_NO_TIMES'])
  })
})

describe('W84 — an award and a worked day add up; OIL may be credited by hand on any day; the weekend and holiday limit belongs to the automatic pass, which reads the published schedule (D82, D79)', () => {
  it('Bane: an award typed on a working Monday stands, the published Monday earns nothing; a 3-day award on a Saturday he then works is worth 4', () => {
    desk(MON, 'bane', '0800', '1700')
    expect(setDayAward('bane', ISO[MON], 1, { note: 'Exercise' }), 'D79: by hand, on any day').toBeNull()
    publish(MON); runOilPass()
    expect(worked('bane', ISO[MON]), 'the automatic pass: a weekday earns nothing').toEqual([])
    expect(cellOf('bane', ISO[MON]), 'the grid cell is the hand award\'s own FO box (D402)').toBe('FO')
    expect(awardsOnDay('bane', ISO[MON]).map((a: any) => a.amount)).toEqual([1])
    expect(setDayAward('bane', ISO[SAT], 3, { note: 'Exercise recovery' })).toBeNull()
    desk(SAT, 'bane', '0800', '1700')
    publish(SAT); runOilPass()
    const worth = (getState().views as any).bane?.[ISO[SAT]]?.earnsOil + awardsOnDay('bane', ISO[SAT]).reduce((n: number, a: any) => n + a.amount, 0)
    expect(worth, '"So it\'s 4"').toBe(4)
  })
})

describe('W85 — an "Off day" does not earn: only a PH turns a day into one that can earn; the Leave War\'s own Off day stays inert for OIL, and leave charging is untouched (D21)', () => {
  it('Monday tagged Off day with Stiff on a desk: no OIL Earn, no OIL words, no credit when published, and still a day leave charges; the same Monday made a PH earns', () => {
    desk(MON, 'stiff', '0800', '1600')
    expect(setDayEvent(ISO[MON], 0, 'Off day')).toBe(true)
    validate()
    expect([HOOKS.oilEarningDay(MON), oilShown(MON), isNonWorkingISO(ISO[MON])], 'not a day that can earn — and so a day leave charges').toEqual([false, false, false])
    expect(codes(validate(), MON).filter(c => /^OIL_/.test(c)), 'no OIL words on it').toEqual([])
    publish(MON); runOilPass()
    expect(cellOf('stiff', ISO[MON])).toBeUndefined()
    expect(setDayEvent(ISO[MON], 0, '')).toBe(true); expect(setDayEvent(ISO[MON], 0, 'PH')).toBe(true)
    expect([HOOKS.oilEarningDay(MON), oilShown(MON)], '"only a PH turns a day into one that can earn"').toEqual([true, true])
    amend(MON); runOilPass()
    expect(cellOf('stiff', ISO[MON])).toBe('FO')
  })
})

describe('W86 — a worked weekend that earns nobody any OIL says so, on the day and at publish, with its reason; an ALL AVAIL / ALL row with a start and no end earns nobody (D81, D360)', () => {
  it('his own case — Stiff on Sunday\'s SDO desk with no times: the day names the desk, and publishing says the day earned nobody and why; an ALL AVAIL row with a start and no end credits nobody', () => {
    desk(SUN, 'stiff', '', '')
    day(SUN).dutywaves.push({ label: 'Duty 2', rows: [{ role: 'RUNNER', id: 'allavail', str: '1830', end: '', rid: 'r-open' }] })
    const w = warnOf(validate(), SUN, 'OIL_NO_TIMES')
    expect(w?.msg, 'on the day, with the reason').toMatch(/SDO and RUNNER have no usable times — nobody on them earns OIL/)
    sign(SUN); commitSetDayApproved(SUN, true); runOilPass()
    expect(said.join(' | '), 'at publish, with the reason').toMatch(/earned nobody any OIL — the SDO and RUNNER desks have no usable times/)
    expect(Object.keys(dayOilSpans(day(SUN))), 'D360: nobody is credited from a guessed hour').toEqual([])
    expect((oilEvidence(SUN).sent as any)['r:r-open'], 'D360: but the crowd behind the puck is counted over the assumed hour').toBeDefined()
  })
})
