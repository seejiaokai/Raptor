// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 6 (b) — A FILING UNDER UNAVAILABLE IS COUNTED FROM THE FILING, NEVER MARKED ON THE DAYS
   (plan `docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` §3 (b); data-model.md §3 ScheduleWeek, "not
   stored at all — worked out on read: … the input landings' pending marks (`inp:`)").

   Filing an "Other" request under Unavailable (or taking it back off) used to write an `inp:<di>.<id>` mark into the
   book of EVERY loaded day the request covers — a scheduler's one act writing days it does not hold (D450). The marks
   were already cosmetic: a published day's count, its pending list and its sign-offs come from the filing axis
   (`publish.ts filingDelta` against the issued version's `fil`). So the mark goes; everything a person sees stays. Each
   case drives the app's own doors on a real saved store and reads what reached storage. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayPendingItems, dayShownPendCount, discardableCount } from '../engine/publish'
import { acceptInput, unacceptInput } from '../engine/slots'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeInputsBatch } from './store'
import { commitSetDayApproved, commitPublishALDay, commitUnpublish, schedWrite, SCHED_TYPES } from './sched-commit'
import { setSession } from './auth'
import { hydrate, wirePersist, weekId } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Whiteboard } from '../storage/whiteboard'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import { afterSchedMutate } from './view'
import * as view from './view'
import { validReportingFixture } from '../testing/reporting-fixture'
// D502: valid reporting precondition before baseline cloning; actions/assertions unchanged.
validReportingFixture()


const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

function resetWorld() {
  if (CURWEEK !== W1) loadWeek(W1)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) ID_BY_CS[PEOPLE[id].cs.toLowerCase()] = id
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear()
  stashClear()
}
async function boot(be: MemoryBackend): Promise<Whiteboard> {
  if (!be.peek('settings', 'schema')) be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
  setSession({ user: 'ad', role: 'admin' })
  return wb
}
beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null })

/* an "Other" request — the one kind a scheduler files under Unavailable ("→ Unavail", ui/html.ts) */
const plant = (r: any) => { const row: any = { allday: true, remarks: 'filing', mod: 'now', yr: 2026, type: 'Other', ...r }; inpId(row); writeInputsBatch(() => { INPUTS.unshift(row) }); return INPUTS[0] }
/* the board's door (ui/interactions.ts, data-acc): the write, then the catch-all command */
/* since [DB-READINESS] phase 6 (c) an activity request (an Other) is on the programme the moment it is filed — the card then
   offers ✕, and → Unavail after it: the take-off first, as the app's own door runs it */
const fileUnavail = (di: number, inp: any) => {
  if (inp.acc === 'g') schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(di, inp); afterSchedMutate() })
  let ok = false; schedWrite(SCHED_TYPES.mutate, () => { ok = acceptInput(di, inp, 'u'); afterSchedMutate() }); return ok
}
const unfile = (di: number, inp: any) => { let ok = false; schedWrite(SCHED_TYPES.mutate, () => { ok = unacceptInput(di, inp); afterSchedMutate() }); return ok }
const inpMarks = () => Object.keys(SCHED.pending).concat(Object.keys(SCHED.changes)).filter(k => k.startsWith('inp:'))
/* every `inp:` key in the stored day rows' books */
const storedInpMarks = (wb: Whiteboard) => wb.keys('weeks').flatMap(k => { const v = wb.get('weeks', k) || ''; return (v.match(/"inp:[^"]*"/g) || []) })

describe('phase 6 (b) — a filing under Unavailable is counted, never marked', () => {
  it('on a PUBLISHED day: one pending, the list names it — and no day carries a mark', async () => {
    const wb = await boot(new MemoryBackend())
    const inp = plant({ person: 'waldo', date: 'Jul 13' })
    sign(0); commitSetDayApproved(0, true)
    expect(dayShownPendCount(0), 'published clean').toBe(0)
    sign(0)
    expect(fileUnavail(0, inp)).toBe(true)
    expect(inp.acc).toBe('u')
    expect(dayShownPendCount(0), 'the filing is one pending change').toBe(1)
    /* since phase 6 (c) the request stood on the day when it was published, so the scheduler's ✕ took its row off first: the
       filing and that removal are ONE item (D114 — the filing folded into its row's) */
    expect(dayPendingItems(0).some((e: any) => e.kind === 'input' || !!e.inp), 'the pending list names it as a request').toBe(true)
    expect(inpMarks(), 'no mark in the book').toEqual([])
    expect(storedInpMarks(wb), 'and none reached storage').toEqual([])
  })

  it('filed since publication, then taken back off: 0 again — D174 — with no mark either way', async () => {
    await boot(new MemoryBackend())
    sign(0); commitSetDayApproved(0, true)
    const inp = plant({ person: 'waldo', date: 'Jul 13' })   // not there when the day was published
    fileUnavail(0, inp)
    expect(unfile(0, inp)).toBe(true)
    expect(dayShownPendCount(0), 'filed since publication and taken off: nothing pending (D174)').toBe(0)
    expect(inpMarks()).toEqual([])
  })

  it('a multi-day filing marks none of the days it covers; each published one reads pending', async () => {
    const wb = await boot(new MemoryBackend())
    const inp = plant({ person: 'stiff', date: 'Jul 14', endDate: 'Jul 16' })
    for (const di of [1, 2, 3]) { sign(di); commitSetDayApproved(di, true) }
    expect(fileUnavail(1, inp)).toBe(true)
    expect([1, 2, 3].map(di => dayShownPendCount(di)), 'each covered published day reads its one change').toEqual([1, 1, 1])
    expect(inpMarks()).toEqual([])
    expect(storedInpMarks(wb)).toEqual([])
  })

  it('on a NEVER-published day: no mark, and "Discard marks" has nothing of the filing to clear', async () => {
    await boot(new MemoryBackend())
    const inp = plant({ person: 'waldo', date: 'Jul 13' })
    /* the ✕ that takes its row off first is a removal like any other on the day (plan §8 item 11 — phase 6 (c)); the filing
       itself adds nothing */
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(0, inp); afterSchedMutate() })
    const before = discardableCount()
    expect(fileUnavail(0, inp)).toBe(true)
    expect(inpMarks()).toEqual([])
    expect(discardableCount(), 'the filing is not a draft mark').toBe(before)
  })

  it('published as an AL, then Unpublished: the filing reads pending again, from the filing itself', async () => {
    await boot(new MemoryBackend())
    const inp = plant({ person: 'waldo', date: 'Jul 13' })
    sign(0); commitSetDayApproved(0, true)
    sign(0); fileUnavail(0, inp)
    sign(0)
    commitPublishALDay(0)
    expect(dayShownPendCount(0), 'issued: nothing waiting').toBe(0)
    commitUnpublish(0)
    expect(dayShownPendCount(0), 'the withdrawn AL\'s filing is waiting again').toBe(1)
    expect(inpMarks()).toEqual([])
  })

  it('the Undo of a filing restores the count and writes no mark (the global Undo)', async () => {
    await boot(new MemoryBackend())
    const inp = plant({ person: 'waldo', date: 'Jul 13' })
    sign(0); commitSetDayApproved(0, true)
    fileUnavail(0, inp)                                  // ✕, then → Unavail — two steps (phase 6 (c): it stood on the day)
    expect(globalUndo().ok).toBe(true)
    expect((INPUTS.find((r: any) => r.iid === inp.iid) as any).acc, 'unfiled — taken off, as before the filing').toBe('r')
    expect(inpMarks()).toEqual([])
    expect(globalUndo().ok).toBe(true)
    expect((INPUTS.find((r: any) => r.iid === inp.iid) as any).acc, 'back on the programme').toBe('g')
    expect(dayShownPendCount(0)).toBe(0)
    expect(inpMarks()).toEqual([])
  })
})
