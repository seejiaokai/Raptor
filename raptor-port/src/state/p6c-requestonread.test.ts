// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 6 (c) — A REQUEST'S ROW IS WORKED OUT FROM THE REQUEST WHEN ITS DAY IS READ (plan
   `docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` v2 §2.1, §2.2, §3 (c); data-model.md §9 rule 9, "a
   member's input").

   In the database a day is saved only by the scheduler holding it (D450). A member's filing, any edit of a request, a
   delete and a hand-over change the REQUEST only; what they do to the day (the landed row made, re-made or removed) is
   worked out after the command and at every read, by one body — so the person who acted sees it at once, a reload (in the
   database, another device) sees the same, and no day row is written. A scheduler's explicit placement (Accept, ✕, the
   board's Ground "+ Inputs") is his, inside his command, and is saved as always. Each case drives the app's own doors on a
   real saved store (the Memory backend behind the whiteboard) and reads what reached storage; a "reload" is a second boot
   from the same store. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayShownPendCount, dayPendingItems, dayCurVer } from '../engine/publish'
import { acceptInput, unacceptInput } from '../engine/slots'
import { loadVersionToWorkingCopy } from '../engine/drafts'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeText } from './store'
import { commitSetDayApproved, schedWrite, SCHED_TYPES } from './sched-commit'
import { setSession } from './auth'
import { hydrate, wirePersist, weekId } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Change as WbChange, Whiteboard } from '../storage/whiteboard'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import { afterSchedMutate } from './view'
import * as view from './view'
import { commitNewInput, commitInputEdit, draftOf, removeInput } from '../ui/inputedit'
import { deletePerson } from './person-delete'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026', W2 = '20/07/2026'
const WED = 2                                            // Wed 15 Jul
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

function resetWorld() {
  if (CURWEEK !== W1) loadWeek(W1)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  indexCallsigns()
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear()
  stashClear()
}
let groups: WbChange[][] = []
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
  groups = []
  wb.subscribe(g => groups.push(g))
  return wb
}
/* a reload: the store as saved, read by a fresh boot (in the database: another device) */
async function reload(be: MemoryBackend): Promise<Whiteboard> { await vi.advanceTimersByTimeAsync(1000); resetWorld(); return boot(be) }
const weekWrites = () => groups.flat().filter(c => c.collection === 'weeks').map(c => (c.value === null ? '-' : '') + c.id)
const clear = () => { groups = [] }
const rowOf = (iid: string, di?: number) => {
  for (let d = 0; d < DAYS.length; d++) { if (di != null && d !== di) continue; const r = ((DAYS[d] as any).ground || []).find((g: any) => g && g.src === iid); if (r) return { di: d, row: r } }
  return null
}
const rowsOf = (iid: string) => DAYS.reduce((n: number, d: any) => n + ((d.ground || []).filter((g: any) => g && g.src === iid).length), 0)
/* a member-shaped filing through the app's own door (commitNewInput — the Inputs page and the two + Add dialogs) */
const file = (r: any, toGround = false): string => {
  const d: any = draftOf({ person: 'bane', type: 'Meeting', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, remarks: 'p6c', ...r })
  expect(commitNewInput(d, toGround)).toBe(true)
  return String(inpId(INPUTS[0]))
}
const reqOf = (iid: string) => INPUTS.find((x: any) => String(inpId(x)) === iid) as any
const edit = (iid: string, change: any) => { const r = reqOf(iid); const d: any = { ...draftOf(r), ...change }; expect(commitInputEdit(r, d)).toBe(true) }
const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 13, 9, 0, 0)); resetWorld() })
afterEach(() => { _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null })

/* SKIPPED UNTIL (c) v3 IS BUILT (D467, 30 Sep 26): these are (c)'s red tests, drafted against v2 — 9 of 12 red on today's
   code, each for the right reason (a request's own command writes its day row; the "Load the week of…" refusal). (c) v3 adds
   a HOLDER BASE (round-2 dispositions, `docs/superpowers/briefs/2026-09-30-db-readiness-phase6-dispositions-r2.md`) — the
   chat that builds it un-skips this file first, adds v3's own cases (an Undo of a request delete restores the exact row;
   A → B → A marks; `kept`'s exit), and runs them red. */
describe.skip('phase 6 (c) — a filing, an edit, a delete and a hand-over write the request only; the day is worked out', () => {
  it('a filing on the week on screen: its row shows at once, NO day row is written, a reload shows the same row', async () => {
    const be = new MemoryBackend()
    await boot(be)
    clear()
    const iid = file({})
    expect(rowOf(iid, WED), 'landed on Wednesday at once').toBeTruthy()
    expect(weekWrites(), 'the filing writes no week or day row').toEqual([])
    await reload(be)
    const back = rowOf(iid, WED)
    expect(back, 'after a reload: the same row, worked out from the request').toBeTruthy()
    expect(back!.row.rmks).toBe('p6c')
  })

  it('a filing on a PUBLISHED day: one pending and a mark on its row — before AND after a reload (16 Sep 26)', async () => {
    const be = new MemoryBackend()
    await boot(be)
    publish(WED)
    clear()
    const iid = file({})
    expect(weekWrites(), 'no day row').toEqual([])
    expect(dayShownPendCount(WED), 'the live filing is one pending change').toBe(1)
    const marksBefore = Object.keys(SCHED.pending).filter(k => k.startsWith(`gr:${WED}.`)).length
    expect(marksBefore, 'its row wears the pending mark').toBeGreaterThan(0)
    await reload(be)
    expect(rowOf(iid, WED), 'after a reload the working copy still carries it').toBeTruthy()
    expect(dayShownPendCount(WED), 'still one pending').toBe(1)
    expect(Object.keys(SCHED.pending).filter(k => k.startsWith(`gr:${WED}.`)).length, 'and its mark').toBe(marksBefore)
  })

  it('an edit of its remarks writes no day row; a reload shows the new remarks on the row', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    writeText(`dn:${WED}.0`, 'SAVED ONCE')                // the day is saved by its holder, landing and all
    clear()
    edit(iid, { remarks: 'p6c changed' })
    expect(weekWrites(), 'the edit writes no day row').toEqual([])
    expect(rowOf(iid, WED)!.row.rmks, 'at once').toBe('p6c changed')
    await reload(be)
    expect(rowOf(iid, WED)!.row.rmks, 'after a reload').toBe('p6c changed')
  })

  it('the scheduler re-timed the row by hand; the member then edits only the remarks — the row is re-made (today\'s relink rule), its id kept', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    const { row } = rowOf(iid, WED)!
    const rid = row.rid
    writeText(`gr:${WED}.${(DAYS[WED] as any).ground.indexOf(row)}.str`, '07:00')
    edit(iid, { remarks: 'p6c again' })
    const now = rowOf(iid, WED)!.row
    expect(now.str, 'the request\'s own time again').toBe('10:00')
    expect(now.rid, 'the same row').toBe(rid)
    await reload(be)
    expect(rowOf(iid, WED)!.row.str).toBe('10:00')
    expect(rowOf(iid, WED)!.row.rid).toBe(rid)
  })

  it('a delete writes no day row; the row is gone at once and after a reload; on a published day it reads pending', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    publish(WED)
    clear()
    expect(removeInput(reqOf(iid))).toBe(true)
    expect(weekWrites(), 'no day row').toEqual([])
    expect(rowOf(iid), 'gone at once').toBeNull()
    expect(dayPendingItems(WED).length, 'a removal from the published day is pending').toBeGreaterThan(0)
    await reload(be)
    expect(rowOf(iid), 'gone after a reload').toBeNull()
    expect(dayPendingItems(WED).length).toBeGreaterThan(0)
  })

  it('the board\'s Ground "+ Inputs" is the scheduler\'s placement: the request AND the day row are saved (Astra 3)', async () => {
    await boot(new MemoryBackend())
    clear()
    const iid = file({}, true)
    expect(rowOf(iid, WED)).toBeTruthy()
    expect(weekWrites(), 'the day it was placed on is saved').toContain(`${weekId(W1)}#${WED}`)
  })

  it('Accept and ✕ are the scheduler\'s: the day row is saved with each', async () => {
    await boot(new MemoryBackend())
    const iid = file({})
    clear()
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(WED, reqOf(iid)); afterSchedMutate() })
    expect(weekWrites()).toContain(`${weekId(W1)}#${WED}`)
    expect(rowOf(iid)).toBeNull()
    clear()
    schedWrite(SCHED_TYPES.mutate, () => { acceptInput(WED, reqOf(iid), 'g'); afterSchedMutate() })
    expect(weekWrites()).toContain(`${weekId(W1)}#${WED}`)
    expect(rowOf(iid, WED)).toBeTruthy()
  })

  it('D363 — a version loaded onto the working copy puts back a deleted request\'s row, and a reload keeps it', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    publish(WED)
    expect(removeInput(reqOf(iid))).toBe(true)
    expect(rowOf(iid)).toBeNull()
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(WED, dayCurVer(WED)); afterSchedMutate() })
    expect(rowOf(iid, WED), 'the version\'s row is back').toBeTruthy()
    await reload(be)
    expect(rowOf(iid, WED), 'and still there after a reload — the holder brought it back').toBeTruthy()
  })

  it('a request whose row is on a saved week NOT on screen: edited from here (no "Load the week of…"), that week shows the change', async () => {
    const be = new MemoryBackend()
    await boot(be)
    loadWeek(W2)
    const iid = file({ date: 'Jul 22' })                   // Wed 22 Jul, week 2
    writeText('dn:2.0', 'W2 SAVED')                        // week 2's Wednesday saved, landing and all
    loadWeek(W1)
    edit(iid, { remarks: 'from week 1', person: 'stiff' })
    loadWeek(W2)
    const r = rowOf(iid, 2)
    expect(r, 'still one row on week 2').toBeTruthy()
    expect(rowsOf(iid)).toBe(1)
    expect(r!.row.rmks).toBe('from week 1')
    expect(r!.row.who, 'the new man drawn').toBe('stiff')
    await reload(be)
    loadWeek(W2)
    expect(rowOf(iid, 2)!.row.who).toBe('stiff')
  })

  it('a request moved from week 2 to week 1: it lands on week 1, and week 2\'s stale row goes', async () => {
    const be = new MemoryBackend()
    await boot(be)
    loadWeek(W2)
    const iid = file({ date: 'Jul 22' })
    writeText('dn:2.0', 'W2 SAVED')
    loadWeek(W1)
    edit(iid, { start: '2026-07-15' })                     // to Wed 15 Jul
    expect(rowOf(iid, WED), 'landed on week 1').toBeTruthy()
    loadWeek(W2)
    expect(rowOf(iid), 'not on week 2 any more').toBeNull()
    await reload(be)
    expect(rowOf(iid, WED)).toBeTruthy()
  })

  it('A\'s request handed to B, then A deleted: B\'s row stays (Astra 2) — on the week on screen', async () => {
    await boot(new MemoryBackend())
    vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0))       // Tue 14: Wednesday is a day to come
    const iid = file({ person: 'pike' })                     // not the signed-in admin's own person
    edit(iid, { person: 'stiff' })
    expect(deletePerson('pike')).toBe(null)
    const r = rowOf(iid, WED)
    expect(r, 'Stiff\'s row stays').toBeTruthy()
    expect(r!.row.who).toBe('stiff')
  })

  it('the Undo of an edit writes no day row; the week on screen shows the request as it was', async () => {
    await boot(new MemoryBackend())
    const iid = file({})
    edit(iid, { remarks: 'undo me' })
    clear()
    expect(globalUndo().ok).toBe(true)
    expect(weekWrites(), 'no day row').toEqual([])
    expect(rowOf(iid, WED)!.row.rmks).toBe('p6c')
  })
})
