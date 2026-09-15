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
import { SCHED, signOf, setDayApproved, dayCurVer } from './publish'
import { dayIssuedHTML, dayHTML } from '../ui/html'
import { DWOPEN, WFOCUS, focusWarn, setPage } from '../state/view'
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

  /* trap (a) / CRPF-007: the 7-day RUN count (workedSet) hypothesises the auto-landing
     of an activity input only on an UNSIGNED seed date — on a SIGNED date the frozen
     document's events are authoritative (matching a loaded day's RUNLEN on-set), so an
     unlanded/cancelled activity must NOT be counted off its input. */
  it('the RUN count derives a SIGNED date from events only, not a hypothetical input landing', () => {
    const WK = wkFor(31)
    const labels = weekDateLabels(shiftWeekKey(WK, -1))
    setCurWeek(WK)
    INPUTS.push({ person: 'waldo', date: labels[6], allday: true, type: 'Training', acc: 'g', remarks: '', mod: '', iid: 'iTR1' })
    expect(seedRunIn(WK, VCONF.maxRun), 'UNSIGNED seed: the input would auto-land → counts').toEqual({ waldo: 1 })
    setWorld('official'); setFiling({ [labels[6]]: { iTR1: 'g' } })       // this date is signed
    try { expect(seedRunIn(WK, VCONF.maxRun), 'SIGNED date: events only, no landed row → not counted').toEqual({}) }
    finally { setWorld('working'); clearFiling() }
  })
})

/* PHASE 5 (spec §14.4, F-3/CRP-007, test #9). The click/focus path must resolve a
   clicked warning against the SAME bundle its rendered list came from: a view-page
   tap on a published-only warning opens THAT (official) warning, and a stale index
   is a defined no-op, never a throw. */
describe('Phase 5 — a view-page tap on a published-only warning focuses the OFFICIAL warning', () => {
  afterEach(() => { setPage('editsched') })

  it('focuses the official crew-rest warning even though WORKING has cleared it', () => {
    const WK = wkFor(40)
    MOCKS[shiftWeekKey(WK, -1)] = weekOf(weekDateLabels(shiftWeekKey(WK, -1)), { 6: dutyRow('waldo', '1900', '2300') })
    setCurWeek(WK)
    flyMonday('waldo', '06:00', '07:25')
    validate()
    sign(0); setDayApproved(0, true)                    // freeze the breach
    ;(DAYS[0] as any).waves[0].formations[0].to = '14:00'
    ;(DAYS[0] as any).waves[0].formations[0].ld = '15:25'
    validate()
    const off = officialWarn()
    const ix = (off.byDay[0].warns as any[]).findIndex((x: any) => x.code === 'CREW_REST' && (x.who || []).includes('waldo'))
    expect(ix, 'the official list carries the breach').toBeGreaterThanOrEqual(0)
    setPage('viewsched')                                // the published day shows OFFICIAL flags
    focusWarn(0, ix)
    expect(WFOCUS && (WFOCUS as any).ids.includes('waldo'), 'focus landed on the official warning').toBe(true)
  })
})

/* PHASE 6 (spec §6/§14.5). Two divergence affordances, shown to everyone: the
   "Not Yet Signed" day marker (a published day whose working copy diverges from the
   signed version), and the in-list "goes away / new once signed" markings on the
   working view. The marker is computed on the LIVE day, before the snapshot swap. */
describe('Phase 6 — "Not Yet Signed" marker', () => {
  it('shows on a published day with an unpublished amendment, on the issued face and the working face; absent when clean', () => {
    const WK = wkFor(50)
    setCurWeek(WK)
    flyMonday('waldo', '14:00', '15:25')
    validate()
    sign(0); setDayApproved(0, true)                     // published, clean
    expect(dayIssuedHTML(0), 'clean published day: no marker').not.toContain('Not yet signed')
    ;(DAYS[0] as any).waves[0].formations[0].to = '06:00'  // unpublished amendment
    validate()
    expect(dayIssuedHTML(0), 'issued face warns that newer unsigned edits exist').toContain('Not yet signed')
    expect(dayHTML(0, false), 'the working face too').toContain('Not yet signed')
  })

  it('is absent on a never-published (draft) day', () => {
    const WK = wkFor(51)
    setCurWeek(WK)
    flyMonday('waldo', '06:00', '07:25')
    validate()
    expect(dayHTML(0, true), 'a draft day has no signed version to diverge from').not.toContain('Not yet signed')
  })
})

/* CODE-REVIEW ROUND 2 completions. */
describe('CRPF-R2-001 — a fresh unaccepted commitment on an approved loaded day is excluded from OFFICIAL', () => {
  const inpFly = (b: any, id: string) => b.all.find((x: any) => x.code === 'INPUT_FLY' && (x.who || []).includes(id) && x.di === 0)
  it('the loaded gate is membership-aware, so a new empty-acc input does not alias into OFFICIAL', () => {
    const WK = wkFor(64)
    setCurWeek(WK)
    const dt = (DAYS[0] as any).dt
    flyMonday('waldo', '08:00', '10:00')
    validate()
    sign(0); setDayApproved(0, true)                     // clean publish
    /* a timed activity input overlapping the flight — refused auto-land on an approved
       day, so acc stays '' (the coarse filingDelta would call this "no delta") */
    INPUTS.push({ person: 'waldo', date: dt, allday: false, s: 8 * 60, e: 9 * 60, type: 'Meeting', acc: '', remarks: '', mod: '', iid: 'iMTG1' })
    const w = validate()
    expect(inpFly(w, 'waldo'), 'WORKING flags the clash').toBeTruthy()
    expect(inpFly(officialWarn(), 'waldo'), 'OFFICIAL excludes the fresh unpublished commitment').toBeFalsy()
  })
})

/* CODE-REVIEW ROUND 1 fixes (Codex GPT-6 Astra). */
describe('CRPF-005 — an unresolvable published day is PROTECTED, not left as a live draft', () => {
  it("a published day whose snapshot cannot resolve does not bust its neighbour on OFFICIAL", () => {
    const WK = wkFor(62)
    setCurWeek(WK)
    const dt0 = (DAYS[0] as any).dt, dt1 = (DAYS[1] as any).dt
    ;(DAYS[0] as any) = { ...blankDay('Monday', dt0), ...dutyRow('waldo', '1900', '2300') }   // late duty
    ;(DAYS[1] as any) = { ...blankDay('Tuesday', dt1), waves: [{ kind: 'fly', formations: [{ to: '06:00', ld: '07:25', br: '', aircraft: [{ p: '', w: 'waldo' }] }] }] }
    validate()
    const cr1 = (b: any) => b.all.find((x: any) => x.code === 'CREW_REST' && (x.who || []).includes('waldo') && x.di === 1)
    expect(cr1(validate()), 'baseline: Monday late duty busts Tuesday').toBeTruthy()
    sign(0); setDayApproved(0, true); sign(1); setDayApproved(1, true)
    /* corrupt day 0 to an UNRESOLVABLE approved state (a legacy/damaged book) */
    delete (SCHED.orig as any)[0]; delete (SCHED.cur as any)[0]
    SCHED.als = SCHED.als.filter((a: any) => +a.di !== 0)
    const w = validate()
    expect(dayCurVer(0) == null, 'day 0 is now unresolvable').toBe(true)
    expect(cr1(w), 'WORKING still busts Tuesday off the live Monday').toBeTruthy()
    expect(cr1(officialWarn()), 'OFFICIAL protects the unresolvable Monday — no derived breach').toBeFalsy()
  })
})

describe('CRPF-001 — a current medical fact flags OFFICIAL immediately (§4, unversioned)', () => {
  const dnif = (b: any, id: string) => b.all.find((x: any) => x.code === 'DNIF_FLY' && (x.who || []).includes(id) && x.di === 0)

  it('a downchit added after publish flags OFFICIAL even under an unrelated amendment', () => {
    const WK = wkFor(60)
    setCurWeek(WK)
    const dt = (DAYS[0] as any).dt
    flyMonday('waldo', '06:00', '07:25')
    validate()
    sign(0); setDayApproved(0, true)                          // clean publish (no medical yet)
    ;(DAYS[0] as any).waves[0].formations[0].msn = 'XREF'     // unrelated content amendment → forces the official pass
    INPUTS.push({ person: 'waldo', date: dt, allday: true, type: 'ATT C', acc: '', remarks: 'Medically down', mod: '', iid: 'iMED1' })
    const w = validate()
    expect(dnif(w, 'waldo'), 'WORKING flags the downchit').toBeTruthy()
    expect(dnif(officialWarn(), 'waldo'), 'OFFICIAL flags medical unfitness immediately (§4) — not frozen out').toBeTruthy()
  })
})

describe('CRPF-012 — the "goes away" row survives when the working list empties', () => {
  afterEach(() => DWOPEN.clear())

  it('a hidden fix that clears the ONLY warning still shows a "to clear once signed" box', () => {
    const WK = wkFor(61)
    MOCKS[shiftWeekKey(WK, -1)] = weekOf(weekDateLabels(shiftWeekKey(WK, -1)), { 6: dutyRow('waldo', '1900', '2300') })
    setCurWeek(WK)
    const dt = (DAYS[0] as any).dt
    /* a MINIMAL day 0 — one flying seat that busts crew rest off the mocked Sunday,
       and nothing else, so clearing it empties the working warning list entirely. */
    ;(DAYS[0] as any) = { ...blankDay('Monday', dt), waves: [{ kind: 'fly', formations: [{ to: '06:00', ld: '07:25', br: '', aircraft: [{ p: '', w: 'waldo' }] }] }] }
    validate()
    sign(0); setDayApproved(0, true)                     // freeze the breach
    ;(DAYS[0] as any).waves[0].formations[0].to = '14:00'
    ;(DAYS[0] as any).waves[0].formations[0].ld = '15:25'  // working clears it — now zero working warnings
    validate()
    expect((officialWarn().byDay[0].warns as any[]).some((x: any) => x.code === 'CREW_REST'), 'official still has the breach').toBe(true)
    DWOPEN.add(0)
    const h = dayHTML(0, true, true)
    expect(h, 'the box renders even with no working warnings').toContain('to clear once signed')
    expect(h, 'and shows the cleared warning struck-through').toContain('goes away once signed')
  })
})

describe('Phase 6 — in-list "goes away / new once signed" markings on the working view', () => {
  afterEach(() => { DWOPEN.clear(); setPage('editsched') })

  it('a HIDDEN FIX marks the cleared warning "goes away once signed" on the working list', () => {
    const WK = wkFor(52)
    MOCKS[shiftWeekKey(WK, -1)] = weekOf(weekDateLabels(shiftWeekKey(WK, -1)), { 6: dutyRow('waldo', '1900', '2300') })
    setCurWeek(WK)
    flyMonday('waldo', '06:00', '07:25')
    validate()
    sign(0); setDayApproved(0, true)                     // freeze the breach
    ;(DAYS[0] as any).waves[0].formations[0].to = '14:00'
    ;(DAYS[0] as any).waves[0].formations[0].ld = '15:25'  // working clears it
    validate()
    DWOPEN.add(0); setPage('editsched')
    const h = dayHTML(0, true, true)                     // the edit-week working render
    expect(h, 'the warning the edit will clear is marked').toContain('goes away once signed')
  })

  it('a FRESH BREACH marks the added warning "new once signed" on the working list', () => {
    const WK = wkFor(53)
    MOCKS[shiftWeekKey(WK, -1)] = weekOf(weekDateLabels(shiftWeekKey(WK, -1)), { 6: dutyRow('waldo', '1900', '2300') })
    setCurWeek(WK)
    flyMonday('waldo', '14:00', '15:25')                 // clean at sign time
    validate()
    sign(0); setDayApproved(0, true)
    ;(DAYS[0] as any).waves[0].formations[0].to = '06:00'
    ;(DAYS[0] as any).waves[0].formations[0].ld = '07:25'  // working adds a breach
    validate()
    DWOPEN.add(0); setPage('editsched')
    const h = dayHTML(0, true, true)
    expect(h, 'the warning the edit introduces is marked').toContain('new once signed')
  })
})
