// @vitest-environment jsdom
/* RULES-FIRST REVIEW, family 9 — OIL: which seats and which people earn (W88–W96)
   ([ENGINE-RULES-REVIEW], D1983, 11 Nov 26). OIL is leave earned for working an off day — time off banked, never pay.
   One test per worklist item where no existing test already holds the ruling whole (those are named in the review's
   results, not repeated here), each led by the ruling's own words, on a small made-up week through the app's own doors
   AND the app's real OIL wiring — the harness of rulesfirst-8-oil-hours.test.ts: both stores, wireLeaveWarSync (which
   says which day is a weekend and who stands behind a placeholder), the publish door, the OIL pass (runOilPass), the
   OIL Earn switches (toggleOilItem / toggleOilPerson), the board's figures (oilDayFigures / oilFigureFor) and the
   warnings. Every day emptied first; 18 Jul 26 is the Saturday. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { DAYS } from './data'
import { INPUTS, oilAsks } from './inputs'
import { HOOKS } from './hooks'
import { VCONF } from './rules'
import { SCHED, signOf, setDayApproved, publishALDay, dayDelta } from './publish'
import { validate } from './validate'
import { dayOilWork, oilCapableItems, rowItemKey, groundItemKey } from './oil'
import { oilEvidence, itemState, oilSentOf } from './oilev'
import { makeStandalone } from './waves'
import { blockFromTpl } from './dutytpl'
import { ensureRowIds } from './rowids'
import { requestRowFields, srcvOf } from './overlay'
import { stashClear } from './weekstash'
import { initStore as raptorInitStore, notify } from '../state/store'
import { setSession } from '../state/auth'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { getState, initStore as lwInitStore, lwHistInit, setPeople, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { runOilPass, wireLeaveWarSync } from '../leavewar/sync'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { oilDayFigures, oilFigureFor, toggleOilItem, toggleOilPerson, inertWhy, inertSays } from '../ui/oilmode'
import { lgChecks } from '../ui/logic-html'
import { DutyTplModal } from '../ui/DutyTplModal'
import { setTplEdit } from '../ui/pops'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), v: { ...VCONF }, toast: HOOKS.toast }
const SAT = 5
const SAT_ISO = '2026-07-18'
const day = (di: number): any => DAYS[di]
const jet = (p = '', w = '') => ({ p, w, area: '', rmks: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [jet('bane')], ...o })
const wave = (forms: any[] = [form()]) => ({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: forms })
/* one duty block of one row; `blk` lets a block made by the template door stand in */
const desk = (id: string, str: string, end: string, role = 'SDO', o: any = {}, blk: any = null) => {
  const b = blk || { label: 'Duty', rows: [] }
  if (blk) b.rows = [{ role, id, str, end, ...o }]; else b.rows.push({ role, id, str, end, ...o })
  day(SAT).dutywaves.push(b); return b
}
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const publish = (di: number) => { sign(di); setDayApproved(di, true) }
const amend = (di: number) => { sign(di); publishALDay(di) }
const cellOf = (p: string) => getState().wars[0].grid[p]?.[SAT_ISO]
const ids = () => ensureRowIds(DAYS)
const deskItem = (bi: number, ri = 0) => rowItemKey(day(SAT).dutywaves[bi].rows[ri].rid)
const fig = () => oilDayFigures(SAT)
const oilHow = () => (lgChecks().flatMap((g: any) => g.items).find((c: any) => c.id === 'oil') as any).how() as string[]

beforeEach(() => {
  INPUTS.splice(0)
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d))
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [], oild: undefined }))
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
  HOOKS.toast = (() => {}) as any
})
afterEach(() => {
  HOOKS.toast = saved.toast; _resetTimeline(); setSession(null)
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.assign(VCONF, saved.v)
})

describe('W88 — one principle, no allow-list: every seat can earn, its default decides, the admin can always override in OIL Earn; the one boundary is a seat with nothing to measure — no times, zero length, cancelled, or an ⓘ row — no switch, a short line saying why, never a silent absence (D28, D31, D43, D49; beside it D755, D776)', () => {
  it('a Saturday with all four kinds of "nothing to measure" beside an ordinary desk: only the ordinary desk has a switch and credits; each of the four tells its man why; the admin can switch the ordinary desk off and one man back on', () => {
    desk('bane', '', '', 'SDO')                                   // no times
    desk('stiff', '0800', '0800', 'SXO')                          // zero length
    desk('pump', '0800', '1600', 'OPS O', { cx: true })           // cancelled
    day(SAT).ground.push({ prog: 'BRIEF', str: '0800', end: '1600', who: 'ignite', more: [], info: true })   // ⓘ
    desk('split', '0800', '1700', 'RUNNER')                        // the control
    ids()
    const nothing = [deskItem(0), deskItem(1), deskItem(2), groundItemKey(day(SAT).ground[0])]
    const cap = oilCapableItems(day(SAT))
    expect(nothing.map(i => cap.has(i)), '"no switch" on all four').toEqual([false, false, false, false])
    expect(cap.has(deskItem(3)), 'every seat that can be measured offers it').toBe(true)
    expect(fig(), 'only the measured seat credits').toEqual({ split: 'FO' })
    const why = nothing.map(i => inertWhy(SAT, i))
    expect(why.every(w => w.length > 0), '"a short line saying why, never a silent absence"').toBe(true)
    expect(inertSays('Ranger', why[0]!), 'D1783\'s words').toBe('Nothing changed for Ranger. This row gives him no working hours to count OIL from.')
    const w = validate().all.find((x: any) => x.di === SAT && x.code === 'OIL_NO_TIMES')
    expect(String(w?.msg || ''), 'the day names the timeless and the zero-length desk too').toMatch(/SDO and SXO have no usable times/)
    /* "the admin can always override": the ordinary desk off, then one man allowed back on under nothing else */
    expect(toggleOilItem(SAT, deskItem(3)), 'switched off').toBe(false)
    expect(fig(), 'nothing earns').toEqual({})
    toggleOilItem(SAT, deskItem(3))                              // back to no decision
    expect(toggleOilPerson(SAT, 'split', deskItem(3)), 'one man off').toBe(false)
    expect(fig()).toEqual({})
    expect(toggleOilPerson(SAT, 'split', deskItem(3)), 'and back on').toBe(true)
    expect(fig()).toEqual({ split: 'FO' })
  })
  /* UNCLEAR 9.U1 — D49 ("a flying line whose written take-off and landing are the same still earns — the man reported")
     was ruled about a sortie (22 Sep 26) and the code deliberately leaves a STANDBY shift out of it (oil.ts dayOilBlind);
     a month later D1042 made a standby line that flies "a real flight … with every warning an ordinary flying line gets".
     Whether a flying SC shift typed START = END, its R typed, is "a flying line with the same written take-off and
     landing" (earns) or "zero length" (earns nothing) is his to say. */
  /* ANSWERED 11 Nov 26 (D1999, "A10 as recommended"): a standby shift that flies, typed with the same START and END,
     earns like a flying line — from its R or B, with the amber "times look wrong" note. The as-built test below is
     flipped to that. */
  it('D1999 (was 9.U1): an SC AM shift flying on its R 06:00, START and END both typed 08:00 — bane earns from the R to the END, credited by default; the day keeps the amber same-time note and no longer names the shift as having no usable times', () => {
    const w: any = makeStandalone('sc'); const f = w.formations[0]
    f.to = '08:00'; f.ld = '08:00'; f.rl = '06:00'; f.aircraft[0].p = 'bane'
    w.formations = [f]; day(SAT).waves.push(w); ids()
    const spans = dayOilWork(day(SAT)).bane || []
    expect(spans.map((s: any) => [s.s, s.e, s.dflt]), 'from the R 06:00 to the END 08:00, on by default').toEqual([[6 * 60, 8 * 60, true]])
    expect(fig(), 'credited — two hours, a half day').toEqual({ bane: 'HO' })
    const all = validate().all.filter((x: any) => x.di === SAT)
    expect(all.find((x: any) => x.code === 'OIL_NO_TIMES'), 'not named as having no usable times').toBeUndefined()
    const note = all.filter((x: any) => x.code === 'FLT_NO_LEN')
    expect(note.map((x: any) => x.sev), 'the amber "times look wrong" note').toEqual(['adv'])
    expect(String(note[0].msg), 'the note no longer says the shift earns nobody').not.toMatch(/earns nobody/)
    /* the words job ([RULES-CHECK-FIXES] job 3): a shift has no debrief, so the flying line's "the day still earns from
       the report and debrief" was not exact — it says what the shift earns from, new words his to change */
    expect(String(note[0].msg), 'its own tail').toMatch(/one of the two is wrong; the shift still earns from its R or B$/)
  })
  it('D1999 edges: the B counts as the R does, the earlier of the two; a shift whose R is its START, or one that does not fly, still measures nothing and is named', () => {
    const w: any = makeStandalone('sc'); const f = w.formations[0]
    f.to = '08:00'; f.ld = '08:00'; f.br = '07:00'; f.rl = '06:30'; f.aircraft[0].p = 'bane'
    w.formations = [f]; day(SAT).waves.push(w); ids()
    expect((dayOilWork(day(SAT)).bane || []).map((s: any) => [s.s, s.e]), 'the earlier of B and R').toEqual([[6 * 60 + 30, 8 * 60]])
    f.br = ''; f.rl = '08:00'
    expect(dayOilWork(day(SAT)).bane, 'an R at the START measures nothing').toBeUndefined()
    let m = validate().all.find((x: any) => x.di === SAT && x.code === 'OIL_NO_TIMES')
    expect(String(m?.msg || '')).toMatch(/SC shift has no usable times/)
    f.rl = ''
    expect(dayOilWork(day(SAT)).bane, 'a shift that does not fly measures nothing').toBeUndefined()
    m = validate().all.find((x: any) => x.di === SAT && x.code === 'OIL_NO_TIMES')
    expect(String(m?.msg || '')).toMatch(/SC shift has no usable times/)
    const note = validate().all.find((x: any) => x.di === SAT && x.code === 'FLT_NO_LEN')
    expect(String(note?.msg || ''), 'and its note still says it earns nobody').toMatch(/a shift with no length earns nobody any OIL/)
  })
})

describe('W89 — on by default: flying lines, SC MAIN, Common Programme, Standard and SC-shift duty desks, ground rows, sims, sim passengers, the extra-people line, a standby line that actually flies; an ⓘ row and a BB duty desk do not earn by default (D15, D24, D43; beside it D755, D776, D1042–D1044, D1060, D1061, D1064, D1066)', () => {
  it('one man on each of the eleven: every "on" seat credits him by default with no decision written; the ⓘ row and the BB desk do not; a man on two earning rows is credited one day, once', () => {
    day(SAT).waves.push(wave([form({ aircraft: [jet('bane')] })]))                         // flying line
    const sc: any = makeStandalone('sc'); sc.formations[0].aircraft[0].p = 'stiff'; day(SAT).waves.push(sc)   // SC MAIN
    const av: any = makeStandalone('avalon'); av.formations[0].rl = '18:00'; av.formations[0].aircraft[2].p = 'slipway'   // a SPARE on a line that flies
    day(SAT).waves.push(av)
    day(SAT).allhands.push({ prog: 'MASS BRIEF', str: '0800', end: '1000', who: ['dj'], more: [] })   // Common Programme
    desk('nact', '0800', '1700', 'SDO')                                                    // Standard desk
    desk('prowler', '07:00', '13:00', 'SXO AM', {}, blockFromTpl('sc'))                    // SC-shift desk, by the template door
    desk('mamba', '0800', '1700', 'RUNNER', { more: ['taipan'] })                          // a desk's extra-people line
    day(SAT).ground.push({ prog: 'GROUND SCHOOL', str: '0900', end: '1600', who: 'pump', more: [] })   // ground row
    day(SAT).sims.oft.push({ label: 'EP-1', str: '0900', end: '1300', p: 'slash', w: '', pax: ['harpoon'], rmks: '' })  // sim seat + passenger
    day(SAT).ground.push({ prog: 'INFO', str: '0900', end: '1600', who: 'snap', more: [], info: true })   // ⓘ
    desk('ignite', '0800', '1700', 'SXO', {}, { label: 'BB', sa: 'bb', noconf: true, rows: [] })        // a BB desk
    desk('nact', '1800', '2000', 'OPS O')                                                  // nact's second earning row
    ids()
    expect(day(SAT).oild, 'no decision anywhere').toBeUndefined()
    const f = fig()
    const on = ['bane', 'stiff', 'slipway', 'dj', 'nact', 'prowler', 'mamba', 'taipan', 'pump', 'slash', 'harpoon']
    expect(on.filter(p => !f[p]), 'every "on by default" seat credits its man').toEqual([])
    expect([f.snap, f.ignite], '"an ⓘ row and a BB duty desk do not earn by default"').toEqual([undefined, undefined])
    expect(f.nact, 'two earning rows, one day: 08:00 to 20:00, one full day').toBe('FO')
    expect(itemState(day(SAT), oilEvidence(SAT), deskItem(3)), 'the BB desk offers the switch, off').toBe('off')
    publish(SAT); runOilPass()
    expect(cellOf('nact'), 'and the Leave War holds one FO, not two').toBe('FO')
  })
})

describe('W90 — off by default, the switch offered in the mode: SC SPARE, AVALON flying lines and duty desks, BB flying lines, a duty block minted from an AVALON template — the same seat, one answer; an activated one can be credited, on a published day through an ordinary amendment (D24, D35; beside it D1042–D1044, D1060, D1061, D1064, D1066)', () => {
  it('each of the five off by default with its switch; switched on, each credits; the AVALON line activated on a PUBLISHED Saturday reads one pending change and pays only once the amendment goes out', () => {
    const sc: any = makeStandalone('sc'); sc.formations[0].aircraft[0].p = 'bane'; sc.formations[0].aircraft[2].p = 'stiff'
    const av: any = makeStandalone('avalon'); av.formations[0].aircraft[0].p = 'pump'
    const bb: any = makeStandalone('bb'); bb.formations[0].to = '08:00'; bb.formations[0].ld = '16:00'; bb.formations[0].aircraft[0].p = 'ignite'
    day(SAT).waves.push(sc, av, bb)
    desk('split', '19:00', '07:00', 'SXO', {}, blockFromTpl('avalon'))                     // the template-minted AVALON desk
    desk('pike', '19:00', '07:00', 'RUNNER', {}, { label: 'AV', sa: 'avalon', noconf: true, rows: [] })   // an AVALON desk by hand
    ids()
    const ev = () => oilEvidence(SAT)
    const scI = rowItemKey(sc.formations[0].rid), avI = rowItemKey(av.formations[0].rid), bbI = rowItemKey(bb.formations[0].rid)
    expect([itemState(day(SAT), ev(), scI), itemState(day(SAT), ev(), avI), itemState(day(SAT), ev(), bbI),
      itemState(day(SAT), ev(), deskItem(0)), itemState(day(SAT), ev(), deskItem(1))],
    'the SC shift mixed (MAIN on, SPARE off); AVALON, BB and both AVALON desks off — the minted one and the hand-built one alike').toEqual(['mixed', 'off', 'off', 'off', 'off'])
    expect(fig(), 'by default only the SC MAIN earns').toEqual({ bane: 'HO' })
    toggleOilPerson(SAT, 'stiff', scI); toggleOilItem(SAT, bbI); toggleOilItem(SAT, deskItem(0)); toggleOilItem(SAT, deskItem(1))
    expect(fig(), 'switched on, each credits').toEqual({ bane: 'HO', stiff: 'HO', ignite: 'FO', split: 'FO', pike: 'FO' })
    /* the AVALON line, activated after the day went out */
    publish(SAT); runOilPass()
    expect(cellOf('pump'), 'published with the AVALON line off').toBeUndefined()
    expect(toggleOilItem(SAT, avI), 'the admin credits it in OIL Earn').toBe(true)
    expect(dayDelta(SAT).map((e: any) => e.kind), 'an ordinary amendment waits').toContain('oil')
    runOilPass()
    expect(cellOf('pump'), 'nothing paid while it waits').toBeUndefined()
    amend(SAT); runOilPass()
    expect(cellOf('pump'), 'paid once the amendment goes out').toBe('FO')
  })
})

describe('W91 — a standby line that actually flies is a real flight and earns by default; it flies with B or R typed — every row, SPARE included, the day ending at END with no debrief, a row not coming in cancelled by its own CX — or with a row ticked "Flies" by hand, lighting that row only (D1042, D1044, D1045, D1046, D1061; beside it D24, D1043, D1060, D1064, D1066)', () => {
  it('a BB shift 08:00–15:00 with its B typed 07:00: both MAINs and the SPARE who comes in earn from 07:00 to END (8h, a full day, no debrief added); the SPARE who does not come in is CX\'d and earns nothing; on a second BB shift with nothing typed, one SPARE ticked Flies earns and his neighbour does not', () => {
    const bb: any = makeStandalone('bb'); const f = bb.formations[0]
    f.to = '08:00'; f.ld = '15:00'; f.br = '07:00'
    f.aircraft[0].p = 'bane'; f.aircraft[1].p = 'stiff'; f.aircraft[2].p = 'pump'; f.aircraft[3].p = 'ignite'; f.aircraft[3].cx = true
    const bb2: any = makeStandalone('bb'); const g = bb2.formations[0]
    g.to = '09:00'; g.ld = '12:00'; g.aircraft[2].p = 'split'; g.aircraft[2].fly = true; g.aircraft[3].p = 'pike'
    day(SAT).waves.push(bb, bb2); ids()
    const sp = dayOilWork(day(SAT))
    expect(sp.pump!.map(w => [w.s, w.e]), 'the SPARE: from the B to END, nothing after').toEqual([[7 * 60, 15 * 60]])
    expect(sp.ignite, 'a row not coming in, cancelled by its own CX').toBeUndefined()
    expect(fig(), 'MAINs and SPARE a full day; the hand-ticked SPARE half; his neighbour standing by nothing').toEqual({ bane: 'FO', stiff: 'FO', pump: 'FO', split: 'HO' })
  })
})

describe('W92 — the placeholder pucks behave exactly like named people: on by default wherever a named man is, off on the off-by-default seats until the line actually flies, and wherever one may land it offers the switch — landing and earning one list, one decision (D32, D43; beside it D24, D755, D776, D1042–D1044, D1060, D1061, D1064, D1066)', () => {
  it('ALL AVAIL on a Standard desk: the men behind it earn by default, as a named man there does, and the desk\'s switch takes them all off; ALL AVAIL on an AVALON-template desk: off by default, the switch puts them on; every seat it may land on offers the switch', () => {
    desk('allavail', '0800', '1700', 'SDO')
    desk('bane', '0800', '1700', 'SXO')
    desk('allavail', '19:00', '07:00', 'RUNNER', {}, blockFromTpl('avalon'))
    /* the other seats a placeholder may land on, on Sunday (whether a row offers the switch is the day's own walk) */
    DAYS[6].sims.oft.push({ label: 'EP-1', str: '0900', end: '1300', p: '', w: '', pax: ['all'], rmks: '' })
    DAYS[6].allhands.push({ prog: 'MASS BRIEF', str: '0800', end: '0900', who: [], more: ['allavail'] })
    DAYS[6].ground.push({ prog: 'GS', str: '1000', end: '1100', who: 'allavail', more: [] })
    ids()
    const crowd = oilSentOf(oilEvidence(SAT), deskItem(0)).people
    const crowdAv = oilSentOf(oilEvidence(SAT), deskItem(2)).people
    expect([crowd.length > 2, crowdAv.length > 2], 'somebody stands behind each puck').toEqual([true, true])
    const f = fig()
    expect(crowd.filter(p => f[p] !== 'FO'), '"on by default wherever a named man is"').toEqual([])
    expect(f.bane, 'the named man beside it').toBe('FO')
    expect(crowdAv.filter(p => !crowd.includes(p) && p !== 'bane' && f[p]), '"off on the off-by-default seats"').toEqual([])
    expect(Object.keys(dayOilWork(day(SAT), { expandAll: () => [] })), 'the puck itself is never a man').not.toContain('allavail')
    const capSun = oilCapableItems(DAYS[6])
    const sun = [rowItemKey(DAYS[6].sims.oft[0].rid), rowItemKey(DAYS[6].allhands[0].rid), groundItemKey(DAYS[6].ground[0])]
    expect([...[deskItem(0), deskItem(2)].map(i => oilCapableItems(day(SAT)).has(i)), ...sun.map(i => capSun.has(i))],
      '"wherever one may land it offers the switch" — two desks, a sim passenger, the Common Programme\'s extras, a ground row').toEqual([true, true, true, true, true])
    toggleOilItem(SAT, deskItem(0))
    expect(fig(), 'the Standard desk switched off: its crowd earns nothing, the named man beside it keeps his own desk').toEqual({ bane: 'FO' })
    toggleOilItem(SAT, deskItem(2))
    const f2 = fig()
    expect(crowdAv.filter(p => !f2[p]), 'the AVALON desk switched on: everyone behind its puck earns').toEqual([])
  })
})

describe('W94 — correct as built, no conflict: a ground crewman named on a weekend duty earns; a placeholder on it earns for the men it stands for unless switched off; ALL / ALL AVAIL never include ground crew (D52)', () => {
  it('Ratchet (ground crew) named on Saturday\'s SDO desk earns a full day; ALL AVAIL on the RUNNER desk stands for aircrew only — Cotter, ground crew and free, is not behind it — and they earn until the desk is switched off', () => {
    desk('torque', '0800', '1700', 'SDO')
    desk('allavail', '0800', '1700', 'RUNNER')
    ids()
    const crowd = oilSentOf(oilEvidence(SAT), deskItem(1)).people
    expect(crowd.length).toBeGreaterThan(2)
    expect(crowd.filter(p => ['torque', 'spanner'].includes(p)), '"ALL / ALL AVAIL never include ground crew"').toEqual([])
    const f = fig()
    expect(f.torque, '"a ground crewman named on a weekend duty earns"').toBe('FO')
    expect(f.spanner).toBeUndefined()
    expect(crowd.filter(p => f[p] !== 'FO'), '"a placeholder on it earns for the men it stands for"').toEqual([])
    toggleOilItem(SAT, deskItem(1))
    expect(fig(), '"unless switched off"').toEqual({ torque: 'FO' })
  })
})

describe('W95 — leave and medical inputs never earn and are never asked; nor a Personal input, a SANS availability or an upchit; every kind that can earn — Training, Course, Meeting, Attach ("Fly with" until D1373), Appointment, Duty, Event, Overseas duty and Other — is asked and its answer decides, wherever filed, Unavailable included (D804; beside it D803)', () => {
  it('the OIL question is asked of exactly those nine kinds, and of no leave, medical, upchit, Personal or SANS availability', () => {
    const asked = (['LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL', 'HL', 'OML', 'ATT C', 'ATT B', 'Upchit',
      'Training', 'CSE', 'Meeting', 'Attach', 'Personal', 'Appointment', 'Duty', 'Event', 'OD', 'Other', 'SANS Availability'] as const)
      .filter(t => oilAsks(t))
    expect(asked).toEqual(['Training', 'CSE', 'Meeting', 'Attach', 'Appointment', 'Duty', 'Event', 'OD', 'Other'])
  })
})

describe('W96 — the green OIL bar shows only on the events that counted towards a man\'s day, not on every puck he wears (D1; beside it D26) and a tap on a puck that cannot earn says "Nothing changed for <callsign>." then why (D1783)', () => {
  it('Ranger on a Saturday desk, an ⓘ ground row and an AVALON line left off: his day\'s figure shows on the desk only', () => {
    desk('bane', '0800', '1700', 'SDO')
    day(SAT).ground.push({ prog: 'INFO', str: '1800', end: '1900', who: 'bane', more: [], info: true })
    const av: any = makeStandalone('avalon'); av.formations[0].aircraft[0].p = 'bane'; day(SAT).waves.push(av)
    ids()
    const avI = rowItemKey(av.formations[0].rid), gI = groundItemKey(day(SAT).ground[0])
    expect([oilFigureFor(SAT, 'bane', deskItem(0)), oilFigureFor(SAT, 'bane', gI), oilFigureFor(SAT, 'bane', avI)]).toEqual(['FO', null, null])
    expect(inertSays('Ranger', inertWhy(SAT, gI)), 'the ⓘ row\'s tap').toBe('Nothing changed for Ranger. This row gives him no working hours to count OIL from.')
  })
})

/* ---- the findings ------------------------------------------------------------------------------------------------ */

describe('9.1 — the Logic page\'s OIL "How it works" against a real case (D932: every line correct for a real case; W88 and W93\'s rows)', () => {
  // RULES-FIRST FINDING 9.1 (11 Nov 26, [ENGINE-RULES-REVIEW]): the Logic line "A row with no times, or no end time, earns nothing." is untrue of a request's row: an all-day Training answered Yes lands a row with no times and its man earns a full day; flip to it() when fixed.
  // FIXED by the words job ([RULES-CHECK-FIXES] job 3, the report's F9 words): "A row the scheduler adds with no times …, but a request answered yes earns over its own times."
  it('Ranger files an all-day Training for Saturday, answers Yes, and it is accepted onto the Ground Programme: its row carries no times and he earns a full day — so the Logic page does not say that such a row earns nothing', () => {
    INPUTS.unshift({ iid: 'rq1', type: 'Training', date: 'Jul 18', yr: 2026, acc: 'g', allday: true, s: 0, e: 1439, remarks: '',
      mod: '2026-07-01', by: 'bane', oil: { [SAT_ISO]: 1 }, people: [{ p: 'bane' }] } as any)
    day(SAT).ground = [{ ...requestRowFields(INPUTS[0]), src: 'rq1', srcv: srcvOf(INPUTS[0]) }]; ids()
    const row = day(SAT).ground[0]
    const earns = fig().bane
    const says = oilHow().some(s => /A row with no times, or no end time, earns nothing/.test(s))
    expect({ times: [row.str, row.end], earns, says }, 'the row, the credit, and the Logic line agree').toEqual({ times: ['', ''], earns: 'FO', says: false })
  })
})

describe('9.2 — the duty-template sheet\'s AVALON and BB desk notes against D24 / D35 (an AVALON or BB desk earns nothing by default, and the admin can switch it on)', () => {
  // RULES-FIRST FINDING 9.2 (11 Nov 26, [ENGINE-RULES-REVIEW]): the template sheet said an AVALON (and a BB) desk "earns no OIL on a weekend or holiday", yet D24/D35 make it switchable and the app credits one switched on.
  // FIXED by his words, D1994 (11 Nov 26): "…and earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if activated." — the note now says the default and the way to credit it.
  it('the AVALON template\'s note says the desk earns no OIL by default and how to switch it on, while a desk minted from it, switched on in OIL Earn, earns a full day (D1994)', async () => {
    desk('split', '19:00', '07:00', 'SXO', {}, blockFromTpl('avalon')); ids()
    toggleOilItem(SAT, deskItem(0))
    const earns = fig().split
    const host = document.createElement('div'); document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => { root.render(createElement(DutyTplModal)) })
    await act(async () => { setTplEdit(true); notify() })
    const tab = [...host.querySelectorAll('.tpl-tab')].find(b => b.textContent === 'AVALON') as HTMLElement
    await act(async () => { tab.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    const note = String(host.querySelector('.tpl-wave-note')?.textContent || '')
    /* the seed has no BB template, so the note's twin is read by turning this one's "For wave" to BB, then back */
    const wave = host.querySelector('.tpl-wave select') as HTMLSelectElement
    const pick = async (v: string) => act(async () => {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(wave, v)
      wave.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await pick('bb')
    const bbNote = String(host.querySelector('.tpl-wave-note')?.textContent || '')
    await pick('avalon')
    await act(async () => { setTplEdit(false); notify() }); await act(async () => { root.unmount() }); host.remove()
    /* D1997 (11 Nov 26): once its wave flies the desk is fully checked and earns by default, so the note's "checked
       only for…" and its default hold until then — said so, his D1994 words after it unchanged */
    expect(note, 'the AVALON note says the narrow check lasts until its wave flies').toMatch(/^The AVALON desk — until the AVALON flies, checked only for overseas or medically down/)
    expect(bbNote, 'and the BB note').toMatch(/^The BB desk — the same rules as the AVALON desk: until the BB flies, checked only for/)
    expect(bbNote, 'the BB note, its twin, in the same words').toMatch(/^The BB desk .*and earns no OIL by default on a weekend or holiday\. Switch it on in OIL Earn if activated\.$/)
    expect({ note: /AVALON desk/.test(note), earns, ruled: note.endsWith('and earns no OIL by default on a weekend or holiday. Switch it on in OIL Earn if activated.') }).toEqual({ note: true, earns: 'FO', ruled: true })
  })
})
