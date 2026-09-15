/* PHASE 1 of the published-schedule flagging build (spec §5.1/§5.5, F-1/CRP-002/
   CRP-004). validate() now computes TWO result bundles: WORKING (the live desk
   copy — the module globals, unchanged) and OFFICIAL (each approved day judged at
   its ISSUED/signed version). An unpublished amendment to a published day changes
   WORKING but NOT OFFICIAL until it is published. When no approved day diverges,
   OFFICIAL is the very same object as WORKING (the alias — drift-proof by
   construction, zero cost).

   Mock mechanics mirror weekctx.test.ts (a hand-built previous week seeds the
   loaded Monday's crew rest); approval mirrors publish.test.ts (sign + approve). */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { setCurWeek } from './waves'
import { validate, officialWarn } from './validate'
import { SCHED, signOf, setDayApproved } from './publish'
import { dayIssuedHTML, dayHTML } from '../ui/html'
import { DWOPEN } from '../state/view'
import { stashPut, stashClear } from './weekstash'
import { verId, dayIso } from './verid'
import { setWorld, setFiling, clearFiling } from './world'
import { seedRunIn } from './weekctx'
import { VCONF } from './rules'

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

const DOWS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const blankDay = (dow: string, dt: string): any =>
  ({ dow, dt, wc: '0 X 0 X 0', notes: [], allhands: [], waves: [], sims: { amt: [], oft: [] }, dutywaves: [], ground: [] })
const weekOf = (labels: string[], overrides: Record<number, any> = {}) => ({
  days: DOWS.map((dow, i) => ({ ...blankDay(dow, labels[i]), ...(overrides[i] || {}) })),
  dates: labels.slice(), inputs: [], seedSans: false,
})
const dutyRow = (id: string, str: string, end: string) =>
  ({ dutywaves: [{ label: 'Duty', rows: [{ role: 'SDO', id, str, end }] }] })

const BASE = '03/08/2026'
const wkFor = (i: number) => shiftWeekKey(BASE, i * 10)
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
function resetSched() {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  ;(SCHED as any).al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; (SCHED as any).curDraft = {}
}
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  resetSched()
})
afterEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  resetSched()
  setCurWeek('13/07/2026'); validate()
})

/* puts `id` on the loaded Monday (DAYS[0]) wave 1 / formation 0, RCP seat.
   A ~06:00 report against a Sunday duty ending 23:00 (clear at 11:00) breaches;
   a mid-afternoon report (≥ 13:20 T/O with a blank brief) is clear. */
function flyMonday(id: string, to: string, ld: string, br = '') {
  const f = (DAYS[0] as any).waves[0].formations[0]
  f.to = to; f.ld = ld; f.br = br
  f.aircraft[0].w = id
}
const crMon = (w: any, id: string) => w.all.find((x: any) => x.code === 'CREW_REST' && (x.who || []).includes(id) && x.di === 0)

describe('Phase 1 — validate() computes WORKING and OFFICIAL bundles', () => {
  it('HIDDEN FIX — an unpublished amendment clears a breach in WORKING but OFFICIAL still shows it', () => {
    const WK = wkFor(0)
    MOCKS[shiftWeekKey(WK, -1)] = weekOf(weekDateLabels(shiftWeekKey(WK, -1)), { 6: dutyRow('waldo', '1900', '2300') })
    setCurWeek(WK)
    flyMonday('waldo', '06:00', '07:25')              // report ~03:40 vs clear 11:00 → breach
    expect(crMon(validate(), 'waldo'), 'baseline breach before publish').toBeTruthy()
    sign(0); setDayApproved(0, true)                  // freeze Monday at T/O 06:00
    ;(DAYS[0] as any).waves[0].formations[0].to = '14:00'   // working: pushed to a clear report
    ;(DAYS[0] as any).waves[0].formations[0].ld = '15:25'
    const w = validate()
    expect(crMon(w, 'waldo'), 'WORKING no longer breaches').toBeFalsy()
    expect(crMon(officialWarn(), 'waldo'), 'OFFICIAL still shows the frozen breach').toBeTruthy()
  })

  it('FRESH BREACH — an unpublished amendment ADDS a breach in WORKING that OFFICIAL does not have', () => {
    const WK = wkFor(1)
    MOCKS[shiftWeekKey(WK, -1)] = weekOf(weekDateLabels(shiftWeekKey(WK, -1)), { 6: dutyRow('waldo', '1900', '2300') })
    setCurWeek(WK)
    flyMonday('waldo', '14:00', '15:25')              // clear report → no breach
    validate()
    sign(0); setDayApproved(0, true)                  // freeze the clean Monday
    ;(DAYS[0] as any).waves[0].formations[0].to = '06:00'  // working: pulled early → breach
    ;(DAYS[0] as any).waves[0].formations[0].ld = '07:25'
    const w = validate()
    expect(crMon(w, 'waldo'), 'WORKING now breaches').toBeTruthy()
    expect(crMon(officialWarn(), 'waldo'), 'OFFICIAL (frozen clean) does not').toBeFalsy()
  })

  it('NO DIVERGENCE — with no unpublished amendment, OFFICIAL is the very same object as WORKING (aliased)', () => {
    const WK = wkFor(2)
    setCurWeek(WK)
    flyMonday('waldo', '12:00', '13:25')
    sign(0); setDayApproved(0, true)                  // approved, working == issued
    const w = validate()
    expect(officialWarn()).toBe(w)                    // same ref — zero cost, cannot drift
  })

  it('NO APPROVED DAY — OFFICIAL aliases WORKING (nothing signed, no second document exists)', () => {
    const WK = wkFor(3)
    setCurWeek(WK)
    flyMonday('waldo', '06:00', '07:25')
    const w = validate()
    expect(officialWarn()).toBe(w)
  })
})

/* PHASE 2 (spec §5.4/§8, F-3/CRP-007). The view page's frozen issued face now
   OVERLAYS the OFFICIAL flags — the warning list, the puck rings and the trace
   box — on top of byte-frozen content. dayIssuedHTML is a pure string builder, so
   the whole surface is asserted on the rendered string here (no DOM needed). */
describe('Phase 2 — the published (view) face shows OFFICIAL flags on frozen content', () => {
  afterEach(() => DWOPEN.clear())

  it('a published day with a frozen crew-rest breach shows the warning on its issued face', () => {
    const WK = wkFor(10)
    MOCKS[shiftWeekKey(WK, -1)] = weekOf(weekDateLabels(shiftWeekKey(WK, -1)), { 6: dutyRow('waldo', '1900', '2300') })
    setCurWeek(WK)
    flyMonday('waldo', '06:00', '07:25')
    validate()
    sign(0); setDayApproved(0, true)
    DWOPEN.add(0)                                        // open the list so the row prose renders
    const issued = dayIssuedHTML(0)
    expect(issued, 'the warning header now renders on the frozen face').toContain('daywarn')
    expect(issued, "waldo's puck flags crew rest on the frozen face").toMatch(/data-person="waldo"[^>]*Crew rest/)
  })

  it('an unpublished fix clears WORKING but the issued face still shows the breach (the whole point)', () => {
    const WK = wkFor(11)
    MOCKS[shiftWeekKey(WK, -1)] = weekOf(weekDateLabels(shiftWeekKey(WK, -1)), { 6: dutyRow('waldo', '1900', '2300') })
    setCurWeek(WK)
    flyMonday('waldo', '06:00', '07:25')
    validate()
    sign(0); setDayApproved(0, true)                    // freeze the breach into the issued version
    ;(DAYS[0] as any).waves[0].formations[0].to = '14:00'   // working: fixed
    ;(DAYS[0] as any).waves[0].formations[0].ld = '15:25'
    validate()
    DWOPEN.add(0)
    const issued = dayIssuedHTML(0)
    const working = dayHTML(0, false)                    // the live working face (no official overlay)
    expect(issued, 'official/frozen face still flags waldo').toMatch(/data-person="waldo"[^>]*Crew rest/)
    expect(working, 'the working copy is clean — no crew-rest flag on waldo').not.toMatch(/data-person="waldo"[^>]*Crew rest/)
  })
})

/* PHASE 3 (spec §5.3/§14.1/§14.2, F-2/CRP-001). The OFFICIAL world resolves each
   NEIGHBOUR week's days at their SIGNED version too, so an unpublished amendment to
   a prior Sunday cannot silence the loaded Monday's official crew-rest bust — and
   the alias gate must widen over the whole dependency window, or a delta-free
   loaded week would alias OFFICIAL=WORKING and miss it. The prev week is hand-built
   as a STASH entry carrying both a WORKING Sunday and its issued snapshot. */
describe('Phase 3 — cross-week: OFFICIAL judges the loaded Monday against the SIGNED previous Sunday', () => {
  afterEach(() => stashClear())

  /* a stashed previous week whose Sunday is PUBLISHED (issued end `issuedEnd`)
     but whose WORKING copy has been amended to `workEnd` — the stash blob shape
     state/store.ts:weekStashSnap writes (short keys d/ok/cv/a/o/dr). */
  function stashPrevSunday(prevKey: string, workEnd: string, issuedEnd: string) {
    const labels = weekDateLabels(prevKey)
    const days = DOWS.map((dow, i) => ({ ...blankDay(dow, labels[i]) })) as any[]
    days[6] = { ...blankDay('Sunday', labels[6]), ...dutyRow('waldo', '08:00', workEnd) }
    const iso = dayIso(prevKey, 6)
    const id = verId(iso, 0)
    const issued = { ...blankDay('Sunday', labels[6]), ...dutyRow('waldo', '08:00', issuedEnd) }
    const sc = { dayOK: { 6: 1 }, cur: { 6: id }, als: [], orig: { 6: { id, d: issued, c: {}, fil: {} } }, drafts: {} }
    stashPut(prevKey, JSON.stringify({ d: days, ok: sc.dayOK, cv: sc.cur, a: sc.als, o: sc.orig, dr: sc.drafts }))
  }

  it("an unpublished amendment to the prev Sunday does NOT silence the loaded Monday's official bust", () => {
    const WK = wkFor(20)
    stashPrevSunday(shiftWeekKey(WK, -1), '15:20', '23:00')   // working amended clear; signed ends late
    setCurWeek(WK)
    flyMonday('waldo', '06:00', '07:25')                      // loaded Monday, NOT approved (delta-free loaded week)
    const w = validate()
    expect(crMon(w, 'waldo'), 'WORKING: the amended Sunday clears it').toBeFalsy()
    expect(crMon(officialWarn(), 'waldo'), 'OFFICIAL: the signed Sunday still busts it').toBeTruthy()
  })

  it("a signed prev Sunday's late finish flags the loaded Monday on BOTH worlds when working matches", () => {
    const WK = wkFor(21)
    stashPrevSunday(shiftWeekKey(WK, -1), '23:00', '23:00')   // working == signed, both late
    setCurWeek(WK)
    flyMonday('waldo', '06:00', '07:25')
    const w = validate()
    expect(crMon(w, 'waldo')).toBeTruthy()
    expect(crMon(officialWarn(), 'waldo')).toBeTruthy()
  })
})

/* PHASE 4 (spec §14.3, Codex V2-002/003). Filing (an input's acc) is a fourth
   publication axis that day content does not carry. The OFFICIAL run must read each
   approved date's FROZEN filing (snapshot.fil), so marking an input 'r' (removed)
   on the working copy does NOT clear a signed warning until it is published. */
describe('Phase 4 — the OFFICIAL run honours the SIGNED filing state', () => {
  const leaveFly = (w: any, id: string) => w.all.find((x: any) => x.code === 'LEAVE_FLY' && (x.who || []).includes(id) && x.di === 0)

  it("filing an input 'r' after publish keeps the OFFICIAL warning; WORKING clears it", () => {
    const WK = wkFor(30)
    setCurWeek(WK)
    const dt = (DAYS[0] as any).dt
    flyMonday('waldo', '06:00', '07:25')                 // waldo is flying Monday
    INPUTS.push({ person: 'waldo', date: dt, allday: true, type: 'LL', acc: '', remarks: '', mod: '', iid: 'iLL1' })
    expect(leaveFly(validate(), 'waldo'), 'baseline: on leave + flying').toBeTruthy()
    sign(0); setDayApproved(0, true)                     // freeze the filing (iLL1 → '')
    ;(INPUTS.find((i: any) => i.iid === 'iLL1') as any).acc = 'r'   // file it removed on the working copy
    const w = validate()
    expect(leaveFly(w, 'waldo'), 'WORKING: removed → the warning clears').toBeFalsy()
    expect(leaveFly(officialWarn(), 'waldo'), 'OFFICIAL: the signed filing keeps it').toBeTruthy()
  })

  /* trap (a): the 7-day RUN count reads INPUTS directly (workedSet), not through
     inpShow — so it must honour the frozen filing too, or the official run count
     would drop a signed day's work when its input is later filed 'r'. */
  it('the RUN count (workedSet) honours the signed filing — a working r still counts as signed work', () => {
    const WK = wkFor(31)
    const labels = weekDateLabels(shiftWeekKey(WK, -1))
    setCurWeek(WK)
    INPUTS.push({ person: 'waldo', date: labels[6], allday: true, type: 'Training', acc: 'r', remarks: '', mod: '', iid: 'iTR1' })
    expect(seedRunIn(WK, VCONF.maxRun), 'WORKING: removed → not counted').toEqual({})
    setWorld('official'); setFiling({ [labels[6]]: { iTR1: '' } })       // as signed: active
    try { expect(seedRunIn(WK, VCONF.maxRun), 'OFFICIAL: signed-active → counts').toEqual({ waldo: 1 }) }
    finally { setWorld('working'); clearFiling() }
  })
})
