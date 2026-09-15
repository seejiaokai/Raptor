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
