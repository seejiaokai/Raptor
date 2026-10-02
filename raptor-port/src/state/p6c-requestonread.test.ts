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
import { SCHED, signOf, dayShownPendCount, dayPendingItems, dayCurVer, dayDiscardCount, daySnapOf } from '../engine/publish'
import { dayEvents } from '../engine/validate'
import { ELOG } from '../engine/editlog'
import { projectOilInputs, oilEvidenceOf, oilEarnedWork } from '../engine/oilev'
import { HOOKS } from '../engine/hooks'
import { ownershipViolation } from './perms'
import { acceptInput, unacceptInput } from '../engine/slots'
import { loadVersionToWorkingCopy, draftDup, draftSelect, dayDrafts } from '../engine/drafts'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeText, writeFill } from './store'
import { commitSetDayApproved, commitPublishALDay, schedWrite, schedBaselineClean, SCHED_TYPES } from './sched-commit'
import { setSession, setMe, DEFAULT_ME } from './auth'
import { hydrate, wirePersist, weekId } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Change as WbChange, Whiteboard } from '../storage/whiteboard'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import { afterSchedMutate } from './view'
import * as view from './view'
import { commitNewInput, commitInputEdit, draftOf, removeInput } from '../ui/inputedit'
import { deletePerson } from './person-delete'
import { validReportingFixture } from '../testing/reporting-fixture'
// D502: valid reporting precondition before baseline cloning; actions/assertions unchanged.
validReportingFixture()


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
afterEach(() => { _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null })

/* (c)'s red tests, drafted against v2 (30 Sep 26) and un-skipped by the chat that builds v3 (D467, 1 Oct 26); v3's own
   cases — the holder base — follow in the second block. */
describe('phase 6 (c) — a filing, an edit, a delete and a hand-over write the request only; the day is worked out', () => {
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

/* ---- v3: THE HOLDER BASE (plan §3 (c) v3 — round 2's dispositions). The week on screen is always worked out from the day
   as its holder last committed it, so a removal the view makes is undone by giving the request back: the exact row returns.
   Each case is checked right after the act AND after a reload (a second boot from the same store — in the database,
   another device), because the whole design rests on the two agreeing. ---- */
const member = () => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe('bane') }      // Ranger — his own requests
const admin = () => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff') }   // Saber
const groundIx = (iid: string, di: number) => ((DAYS[di] as any).ground || []).findIndex((g: any) => g && g.src === iid)
const pendKeys = (di: number, pfx: string) => Object.keys(SCHED.pending).filter(k => k.startsWith(`${pfx}:${di}.`))
/* the scheduler's own touches on a landed row: a hand-set time and an extra man — then the day is his, saved */
function placeByHand(iid: string) {
  const ri = groundIx(iid, WED)
  writeText(`gr:${WED}.${ri}.str`, '07:00')
  writeFill(`g:${WED}.${ri}.+`, 'pike')                // the row's "+": first free place, else one more
  const row = rowOf(iid, WED)!.row
  expect(row.str, 'the hand-set time').toBe('07:00')
  expect(row.more, 'the extra man').toEqual(['pike'])
  return { rid: row.rid, ri }
}

describe('phase 6 (c) v3 — the holder base: what a request does to its day is undone exactly', () => {
  it('Astra 1 — a day not published: delete the request, Undo: the SAME row comes back (id, place, time, extras); Redo takes it again; no day row either way', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    const { rid, ri } = placeByHand(iid)
    clear()
    expect(removeInput(reqOf(iid))).toBe(true)
    expect(rowOf(iid), 'gone from the screen').toBeNull()
    expect(globalUndo().ok).toBe(true)
    const back = rowOf(iid, WED)
    expect(back, 'back').toBeTruthy()
    expect(back!.row.rid, 'the same row').toBe(rid)
    expect(groundIx(iid, WED), 'in the same place').toBe(ri)
    expect(back!.row.str, 'with the time the scheduler set').toBe('07:00')
    expect(back!.row.more, 'and his extra man').toEqual(['pike'])
    expect(globalRedo().ok).toBe(true)
    expect(rowOf(iid), 'Redo takes it again').toBeNull()
    expect(globalUndo().ok).toBe(true)
    expect(weekWrites(), 'no day row written by the delete, its Undo or its Redo').toEqual([])
    await reload(be)
    const r = rowOf(iid, WED)
    expect(r && r.row.rid, 'after a reload: the same row').toBe(rid)
    expect(r!.row.str).toBe('07:00')
    expect(r!.row.more).toEqual(['pike'])
  })

  it('Astra 1 — a PUBLISHED day: delete reads pending; Undo puts the exact row back and nothing is pending — right after and after a reload', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    const { rid } = placeByHand(iid)
    publish(WED)
    expect(dayShownPendCount(WED)).toBe(0)
    expect(removeInput(reqOf(iid))).toBe(true)
    expect(dayShownPendCount(WED), 'the removal is one pending change (D114)').toBe(1)
    expect(globalUndo().ok).toBe(true)
    expect(rowOf(iid, WED)!.row.rid).toBe(rid)
    expect(dayShownPendCount(WED), 'back to what was published').toBe(0)
    expect(pendKeys(WED, 'del'), 'no tombstone left behind').toEqual([])
    expect(pendKeys(WED, 'gr'), 'no mark left on the row').toEqual([])
    await reload(be)
    expect(rowOf(iid, WED)!.row.rid).toBe(rid)
    expect(dayShownPendCount(WED)).toBe(0)
  })

  it('the base is what is stored — a load bakes nothing in: the request re-dated away, a RELOAD, then re-dated back — the same row returns', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    const { rid } = placeByHand(iid)                     // Wednesday saved with the row, its time and its extra
    edit(iid, { start: '2026-07-16' })                   // to Thursday: Wednesday's row taken away on screen only
    expect(rowOf(iid, WED), 'gone from Wednesday').toBeNull()
    await reload(be)                                     // the stored Wednesday still holds the row; the load works it out
    expect(rowOf(iid, WED), 'still gone after a reload').toBeNull()
    edit(iid, { start: '2026-07-15' })                   // back to Wednesday
    const back = rowOf(iid, WED)
    expect(back && back.row.rid, 'the stored row stands again — not a new one').toBe(rid)
    expect(back!.row.more).toEqual(['pike'])
    expect(rowsOf(iid)).toBe(1)
    await reload(be)
    expect(rowOf(iid, WED)!.row.rid).toBe(rid)
    expect(rowsOf(iid)).toBe(1)
  })

  it('Astra 2 — A → B → A on a published day: the mark comes and goes; nothing left behind, before and after a reload', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    publish(WED)
    edit(iid, { remarks: 'B' })
    expect(dayShownPendCount(WED), 'A → B is pending').toBe(1)
    expect(pendKeys(WED, 'gr').length, 'and marked on the row').toBeGreaterThan(0)
    edit(iid, { remarks: 'p6c' })
    expect(dayShownPendCount(WED), 'B → A: back to what was published').toBe(0)
    expect(pendKeys(WED, 'gr'), 'no hollow tag left').toEqual([])
    await reload(be)
    expect(dayShownPendCount(WED)).toBe(0)
    expect(pendKeys(WED, 'gr')).toEqual([])
  })

  it('Astra 2 — edit → Undo → Redo on a published day: the marks follow the request each way', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    publish(WED)
    edit(iid, { remarks: 'B' })
    const marked = pendKeys(WED, 'gr').length
    expect(marked).toBeGreaterThan(0)
    expect(globalUndo().ok).toBe(true)
    expect(dayShownPendCount(WED)).toBe(0)
    expect(pendKeys(WED, 'gr')).toEqual([])
    expect(globalRedo().ok).toBe(true)
    expect(dayShownPendCount(WED)).toBe(1)
    expect(pendKeys(WED, 'gr').length).toBe(marked)
    await reload(be)
    expect(dayShownPendCount(WED)).toBe(1)
    expect(rowOf(iid, WED)!.row.rmks).toBe('B')
  })

  it('Astra 3 — kept\'s exit: deleted, the old version loaded (the row kept, D363), the delete undone, then the request edited — the row follows the edit', async () => {
    const be = new MemoryBackend()
    await boot(be)
    member()
    const iid = file({})
    admin()
    publish(WED)
    member()
    expect(removeInput(reqOf(iid))).toBe(true)
    admin()
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(WED, dayCurVer(WED)); afterSchedMutate() })
    expect(rowOf(iid, WED)!.row.kept, 'the version\'s row, its request gone: kept').toBe(true)
    member()
    const u = globalUndo(); expect(u.ok, 'Ranger takes back his delete: ' + JSON.stringify(u)).toBe(true)
    expect(reqOf(iid)).toBeTruthy()
    edit(iid, { remarks: 'after the undo' })
    expect(rowOf(iid, WED)!.row.rmks, 'the row follows the request again').toBe('after the undo')
    expect(rowsOf(iid)).toBe(1)
    await reload(be)
    expect(rowOf(iid, WED)!.row.rmks).toBe('after the undo')
    expect(rowsOf(iid)).toBe(1)
  })

  it('Fable F6 — a kept row on a day its request no longer covers is a dead row: the request lands on its own new day, the dead row stays (D363)', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    publish(WED)
    edit(iid, { start: '2026-07-22' })                        // to Wed 22 Jul, week 2 — never opened
    expect(rowOf(iid), 'gone from week 1 at once').toBeNull()
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(WED, dayCurVer(WED)); afterSchedMutate() })
    expect(rowOf(iid, WED)!.row.kept, 'the version put it back — kept').toBe(true)
    loadWeek(W2)
    expect(rowOf(iid, 2), 'on week 2, it lands on its own day').toBeTruthy()
    loadWeek(W1)
    expect(rowOf(iid, WED), 'week 1 keeps the dead row the holder brought back').toBeTruthy()
    await reload(be)
    loadWeek(W2)
    expect(rowOf(iid, 2)).toBeTruthy()
  })

  it('Fable F1 — the request handed on, then the issued version loaded: the row is re-made for the new holder, before and after a reload', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({ person: 'pike' })
    publish(WED)
    edit(iid, { person: 'stiff' })
    expect(rowOf(iid, WED)!.row.who, 'handed on at once').toBe('stiff')
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(WED, dayCurVer(WED)); afterSchedMutate() })
    expect(rowOf(iid, WED)!.row.who, 'the version\'s row, re-made for the request as it is').toBe('stiff')
    expect(rowsOf(iid)).toBe(1)
    await reload(be)
    expect(rowOf(iid, WED)!.row.who).toBe('stiff')
  })

  it('Fable F5 — the load\'s confirm counts what the load really discards: nothing, when only a hand-over differs', async () => {
    await boot(new MemoryBackend())
    const iid = file({ person: 'pike' })
    publish(WED)
    edit(iid, { person: 'stiff' })
    expect(dayDiscardCount(WED), 'the load re-makes the row for Stiff again — it discards nothing').toBe(0)
  })

  it('Fable F3 — a re-made row and a landing write no change-history line of their own (the request\'s line is its record)', async () => {
    await boot(new MemoryBackend())
    const iid = file({})
    publish(WED)
    const before = ELOG.rows.filter((r: any) => String(r.key || '').startsWith('gr:') || String(r.key || '').startsWith('g:')).length
    edit(iid, { remarks: 'no cell lines' })
    expect(rowOf(iid, WED)!.row.rmks).toBe('no cell lines')
    const after = ELOG.rows.filter((r: any) => String(r.key || '').startsWith('gr:') || String(r.key || '').startsWith('g:')).length
    expect(after, 'no line for the row\'s cells').toBe(before)
  })

  it('Fable F4 — the checks see the landed row straight after the filing', async () => {
    await boot(new MemoryBackend())
    file({})
    expect(dayEvents(WED, 'bane').some((e: any) => e.kind === 'ground'), 'Ranger\'s meeting is an event on Wednesday').toBe(true)
  })

  it('a retype to a leave says its row has been removed', async () => {
    await boot(new MemoryBackend())
    const iid = file({})
    const said: string[] = []
    const was = HOOKS.toast
    HOOKS.toast = (m: any) => { said.push(String(m)) }
    try {
      edit(iid, { type: 'LL' })
      await Promise.resolve(); vi.runAllTicks(); await Promise.resolve()
    } finally { HOOKS.toast = was }
    expect(rowOf(iid), 'no row').toBeNull()
    expect(said.some(m => /does not go on the Ground Programme — its row has been removed/.test(m)), JSON.stringify(said)).toBe(true)
  })

  it('§11 — a member\'s command that carries a schedule record is refused; his own filing carries none', async () => {
    await boot(new MemoryBackend())
    member()
    clear()
    file({})
    expect(weekWrites(), 'the member\'s filing writes no day row').toEqual([])
    const env: any = { type: 'inputs.batch', actor: { id: 'us', role: 'member', personId: 'bane' },
      changes: [{ op: 'put', collection: 'days', id: `${W1}#${WED}`, before: {}, after: {} }] }
    expect(ownershipViolation(env), 'a day record in a member\'s command').toBeTruthy()
  })
})

/* ---- round 3's findings (Astra 1; Fable F1, F2, F3 — `docs/superpowers/briefs/2026-10-01-db-readiness-phase6c-…-r3-*.md`).
   A DEAD kept row — the holder's version row on a day its request cannot stand on (D363) — can now sit in the same week as
   the request's real row; every lookup that ACTS on "the request's row" must find the real one. ---- */
const THU = 3, SAT = 5, SUN = 6
/* the request's row on `di` published; the request moved to week 2; that day's version loaded (its row back, kept — D363);
   then the request moved back into week 1, onto `backIso`: the dead kept row on `di`, the real row landing on the new day */
function deadKeptRow(iid: string, di: number, awayIso: string, backIso: string) {
  publish(di)
  edit(iid, { start: awayIso })
  schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(di, dayCurVer(di)); afterSchedMutate() })
  expect(rowOf(iid, di)!.row.kept, 'the version put it back — kept').toBe(true)
  edit(iid, { start: backIso })
}

describe('phase 6 (c) v3, round 3 — a dead kept row is never the request\'s row', () => {
  it('Astra 1 — OIL: a dead CANCELLED row on Saturday does not stop the live Sunday landing earning', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({ type: 'Training', date: 'Jul 18', remarks: 'weekend course' })
    schedWrite(SCHED_TYPES.mutate, () => { const r = rowOf(iid, SAT)!.row; r.cx = true; afterSchedMutate() })
    deadKeptRow(iid, SAT, '2026-07-25', '2026-07-19')
    expect(rowOf(iid, SAT)!.row.cx, 'the dead row is the cancelled one').toBe(true)
    expect(rowOf(iid, SUN), 'the real row, on Sunday').toBeTruthy()
    const ev = () => projectOilInputs('2026-07-19').find((x: any) => x.iid === iid)
    expect(ev()!.stand, 'Sunday\'s claim stands on its live row').toBe('active')
    await reload(be)
    expect(ev()!.stand).toBe('active')
  })

  it('Fable F1 — the load puts the request\'s issued row back although a dead row of it sits on another day', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    deadKeptRow(iid, WED, '2026-07-22', '2026-07-16')             // dead on Wednesday, landed on Thursday
    publish(THU)
    writeText(`dn:${THU}.0`, 'EDITED SINCE')
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(THU, dayCurVer(THU)); afterSchedMutate() })
    expect(rowOf(iid, THU), 'Thursday\'s own row back').toBeTruthy()
    expect(dayShownPendCount(THU), 'Thursday is as issued').toBe(0)
  })

  it('Fable F1 — ✕ then Accept on the real day lands there; it never adopts the dead row on another day', async () => {
    await boot(new MemoryBackend())
    const iid = file({})
    deadKeptRow(iid, WED, '2026-07-22', '2026-07-16')
    publish(THU)                                                   // its issued Thursday holds the row — a read never puts it back
    const rid = rowOf(iid, THU)!.row.rid
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(THU, reqOf(iid)); afterSchedMutate() })
    expect(rowOf(iid, THU), 'taken off Thursday').toBeNull()
    expect(rowOf(iid, WED)!.row.kept, 'the dead row untouched by the ✕').toBe(true)
    schedWrite(SCHED_TYPES.mutate, () => { acceptInput(THU, reqOf(iid), 'g'); afterSchedMutate() })
    expect(rowOf(iid, THU), 'Accept puts it on Thursday').toBeTruthy()
    expect(rowOf(iid, THU)!.row.rid, 'the issued row, with its issued id').toBe(rid)
    expect(reqOf(iid).acc).toBe('g')
    expect(dayShownPendCount(THU), 'Thursday as issued').toBe(0)
  })

  it('Fable F2 — a two-day request shortened onto the published day it already covered moves there, pending — before and after a reload', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({ endDate: 'Jul 16' })                        // Wed–Thu, landed on Wednesday
    expect(reqOf(iid).endDate, 'a two-day request').toBe('Jul 16')
    expect(rowOf(iid, WED), 'landed on its start day').toBeTruthy()
    publish(WED); publish(THU)
    edit(iid, { start: '2026-07-16', end: '' })                    // Thursday only
    expect(rowOf(iid, WED), 'off Wednesday').toBeNull()
    expect(rowOf(iid, THU), 'on Thursday').toBeTruthy()
    expect(dayShownPendCount(THU), 'Thursday reads it pending').toBeGreaterThan(0)
    expect(dayShownPendCount(WED), 'and Wednesday its removal').toBeGreaterThan(0)
    await reload(be)
    expect(rowOf(iid, THU)).toBeTruthy()
    expect(rowOf(iid, WED)).toBeNull()
  })

  it('Fable F3 — the dead row and the landing never share an id; a member\'s later edit carries no day record', async () => {
    const be = new MemoryBackend()
    await boot(be)
    member()
    const iid = file({})
    admin()
    publish(WED)
    member()
    edit(iid, { start: '2026-07-22' })
    admin()
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(WED, dayCurVer(WED)); afterSchedMutate() })
    member()
    edit(iid, { start: '2026-07-16' })
    const dead = rowOf(iid, WED)!.row, live = rowOf(iid, THU)!.row
    expect(dead.rid, 'two rows, two ids').not.toBe(live.rid)
    clear()
    edit(iid, { remarks: 'his own words' })                         // refused if it carried a day record (§11)
    expect(rowOf(iid, THU)!.row.rmks).toBe('his own words')
    expect(weekWrites(), 'no day record').toEqual([])
    await reload(be)
    expect(rowOf(iid, WED)!.row.rid).not.toBe(rowOf(iid, THU)!.row.rid)
  })
})

/* Found by the FULL check's walk (1 Oct 26 — `docs/handpass/2026-10-01-dbr-phase6c-check.md`, walk U): the landings were
   made in the request list's order, and a new filing goes to the FRONT of that list — so a request filed later landed
   ABOVE the rows landed earlier and pushed them down a line. The build before (c) appended each landing at its filing, so
   a row never moved when someone else filed (the board's "nothing re-orders itself", 10 Aug 26). */
describe('phase 6 (c) — the FULL check\'s walk: a landed row keeps its line when another request lands', () => {
  it('two all-day meetings on a day not published: the second lands BELOW the first, and the first does not move — right after and after a reload', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const a = file({ allday: true, remarks: 'first' })
    const aAt = rowOf(a, WED)!
    const aIx = (DAYS[WED] as any).ground.indexOf(aAt.row)
    const b = file({ person: 'yeti', allday: true, remarks: 'second' })
    const g = (DAYS[WED] as any).ground
    expect(g.findIndex((r: any) => r.src === a), 'the first keeps its place').toBe(aIx)
    expect(g.findIndex((r: any) => r.src === b), 'the second goes below it').toBeGreaterThan(aIx)
    await reload(be)
    const g2 = (DAYS[WED] as any).ground
    expect(g2.findIndex((r: any) => r.src === a), 'after a reload: the same').toBe(aIx)
    expect(g2.findIndex((r: any) => r.src === b)).toBeGreaterThan(aIx)
  })
})

/* Found by the FULL check's walk (1 Oct 26, walk P): on a published day the marks of a request's change are rebuilt against
   the issued version (drafts.ts rebaseDayPending), which marks EVERY box of a row the issued day lacks — so a member's live
   filing wore a pending outline on its start, end and remarks and a hollow ALn tag on its puck, where the same row accepted
   by the scheduler (slots.ts acceptInput) wears the add on its item only, as the build before (c) drew the filing. */
describe('phase 6 (c) — the FULL check\'s walk: a request\'s new row on a published day is marked as its Accept marks it', () => {
  const dayKeysOf = (o: any, di: number) => Object.keys(o || {}).filter(k => k.startsWith(`gr:${di}.`) || k.startsWith(`g:${di}.`)).sort()
  it('a live filing: the add on its item only — the same marks as the scheduler\'s Accept; right after and after a reload', async () => {
    const be = new MemoryBackend()
    await boot(be)
    publish(WED)
    const iid = file({})
    const rid = rowOf(iid, WED)!.row.rid
    const filed = { p: dayKeysOf(SCHED.pending, WED), a: dayKeysOf(SCHED.added, WED) }
    expect(filed.p, 'the pending marks: the item only').toEqual([`gr:${WED}.${rid}.prog`])
    expect(filed.a, 'the add').toEqual([`gr:${WED}.${rid}.prog`])
    await reload(be)
    expect(dayKeysOf(SCHED.pending, WED), 'after a reload: the same').toEqual(filed.p)
    expect(dayKeysOf(SCHED.added, WED)).toEqual(filed.a)
    /* the scheduler's ✕ and Accept of it: the row his Accept makes wears exactly these */
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(WED, reqOf(iid)); afterSchedMutate() })
    schedWrite(SCHED_TYPES.mutate, () => { acceptInput(WED, reqOf(iid), 'g'); afterSchedMutate() })
    const rid2 = rowOf(iid, WED)!.row.rid
    expect(dayKeysOf(SCHED.pending, WED), 'Accept\'s marks, the same shape').toEqual([`gr:${WED}.${rid2}.prog`])
  })
  it('a field the scheduler set apart from the request keeps its mark; the member\'s edit of the request re-makes the rest unmarked', async () => {
    const be = new MemoryBackend()
    await boot(be)
    publish(WED)
    const iid = file({})
    const at = rowOf(iid, WED)!
    const ri = (DAYS[WED] as any).ground.indexOf(at.row)
    writeText(`gr:${WED}.${ri}.rmks`, 'SCHEDULER WORDS')           // the holder's own words on the row
    const rid = at.row.rid
    expect(dayKeysOf(SCHED.pending, WED)).toEqual([`gr:${WED}.${rid}.prog`, `gr:${WED}.${rid}.rmks`].sort())
    edit(iid, { remarks: 'member words' })                      // re-made: the six fields from the request again
    expect(rowOf(iid, WED)!.row.rmks).toBe('member words')
    expect(dayKeysOf(SCHED.pending, WED), 'back to the add alone').toEqual([`gr:${WED}.${rid}.prog`])
  })
})

/* Astra's scenario design for the FULL check (1 Oct 26 — `docs/superpowers/briefs/2026-10-01-db-readiness-phase6c-check-
   scenarios-astra.md` §3 B): the load's filing restore (publish.ts filingRestorePlan) asked "is its row on any loaded day"
   of every row carrying the request's id — a DEAD kept row too (a version's row on a day the request no longer covers,
   D363). It is not the request's row, so a load that should put the issued filing back (D98) left it as filed. */
describe('phase 6 (c) — the FULL check: a dead kept row never decides the load\'s filing (D98)', () => {
  it('dead kept Wednesday, Thursday issued "taken off", now under Unavailable: loading Thursday\'s issue puts "taken off" back', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})                                            // lands Wednesday
    deadKeptRow(iid, WED, '2026-07-22', '2026-07-16')               // published, moved away, loaded back, moved to Thursday
    expect(rowOf(iid, WED)!.row.kept, 'Wednesday holds the version\'s row, dead').toBe(true)
    expect(rowOf(iid, THU), 'and the request stands on Thursday').toBeTruthy()
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(THU, reqOf(iid)); afterSchedMutate() })   // ✕ on Thursday
    expect(reqOf(iid).acc).toBe('r')
    publish(THU)                                                    // issued with it taken off
    schedWrite(SCHED_TYPES.mutate, () => { acceptInput(THU, reqOf(iid), 'u'); afterSchedMutate() })   // → Unavail
    expect(reqOf(iid).acc).toBe('u')
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(THU, dayCurVer(THU)); afterSchedMutate() })
    expect(reqOf(iid).acc, 'the issued filing is back (D98) — the dead Wednesday row is not its row').toBe('r')
    expect(rowOf(iid, WED)!.row.kept, 'the dead row stays').toBe(true)
    await reload(be)
    expect(reqOf(iid).acc).toBe('r')
  })
  it('the control: the version\'s own row on the loaded day, the filing now Unavailable — the load puts it back on the programme', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    publish(WED)                                                    // issued ON the programme
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(WED, reqOf(iid)); afterSchedMutate() })   // ✕, then → Unavail
    schedWrite(SCHED_TYPES.mutate, () => { acceptInput(WED, reqOf(iid), 'u'); afterSchedMutate() })
    expect(reqOf(iid).acc).toBe('u')
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(WED, dayCurVer(WED)); afterSchedMutate() })
    expect(reqOf(iid).acc, 'on the programme again').toBe('g')
    expect(rowOf(iid, WED), 'its row').toBeTruthy()
  })
})

/* Astra's scenario design §3 D (1 Oct 26): the retype message asked "is any row of it still on screen" of every row with
   its id — a dead kept row on another day too — so the removal of its REAL row went unsaid. */
describe('phase 6 (c) — the FULL check: a dead kept row does not silence the retype message', () => {
  it('dead kept Wednesday, standing Thursday: retyped to a leave, the Thursday row goes and the app says so — once', async () => {
    await boot(new MemoryBackend())
    const iid = file({})
    deadKeptRow(iid, WED, '2026-07-22', '2026-07-16')
    expect(rowOf(iid, THU), 'standing on Thursday').toBeTruthy()
    const said: string[] = []
    const was = HOOKS.toast
    HOOKS.toast = (m: any) => { said.push(String(m)) }
    try {
      edit(iid, { type: 'LL' })
      await Promise.resolve(); vi.runAllTicks(); await Promise.resolve()
    } finally { HOOKS.toast = was }
    expect(rowOf(iid, THU), 'Thursday\'s row is gone').toBeNull()
    expect(rowOf(iid, WED)!.row.kept, 'the dead Wednesday row stays (D363)').toBe(true)
    expect(said.filter(m => /does not go on the Ground Programme — its row has been removed/.test(m)).length, JSON.stringify(said)).toBe(1)
  })
})

/* Astra's FINAL code read (1 Oct 26 — its findings 1–4): a DEAD kept row can also sit on a day its request COVERS — a plan
   switched in (or a version loaded) brings back the row of a request filed under Unavailable since. The evidence sheet's
   "cannot happen" missed it. The one rule, everywhere: a row that carries `kept` is never the request's row — on the week
   on screen (the view clears `kept` from a row that can stand) and in an issued version (frozen as it was at issue). */
function deadUnavailRow(iid: string, di: number, extra?: string) {
  const ri = (DAYS[di] as any).ground.findIndex((g: any) => g && g.src === iid)
  expect(ri, 'its row is on the day').toBeGreaterThanOrEqual(0)
  if (extra) schedWrite(SCHED_TYPES.mutate, () => { (DAYS[di] as any).ground[ri].more = [extra]; afterSchedMutate() })
  schedWrite(SCHED_TYPES.mutate, () => { draftDup(di); afterSchedMutate() })                  // Plan A parked, with the row
  const a = dayDrafts(di).find((x: any) => (x.d.ground || []).some((g: any) => g && g.src === iid))
  expect(a, 'the parked plan holds it').toBeTruthy()
  schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(di, reqOf(iid)); afterSchedMutate() })   // ✕
  schedWrite(SCHED_TYPES.mutate, () => { acceptInput(di, reqOf(iid), 'u'); afterSchedMutate() }) // → Unavail
  return a
}
function bringBack(di: number, a: any) {
  schedWrite(SCHED_TYPES.mutate, () => { draftSelect(di, a.id); afterSchedMutate() })
  expect(reqOf(String(((DAYS[di] as any).ground.find((g: any) => g && g.kept) || {}).src)).acc, 'filed under Unavailable').toBe('u')
}
describe('phase 6 (c) — the FULL check\'s final read: a kept row on a day its request covers is not its row', () => {
  it('Astra final #1 — OIL: a second man on the dead row of a request filed under Unavailable earns nothing from it', async () => {
    await boot(new MemoryBackend())
    /* an earning Saturday, as the OIL tests make one (in the app a Leave War period covering it does — D19) */
    const earning = HOOKS.oilEarningDay, iso = HOOKS.oilDayISO
    HOOKS.oilEarningDay = (di: number) => di === SAT
    HOOKS.oilDayISO = (di: number) => (di === SAT ? '2026-07-18' : '2026-07-15')
    try {
    const iid = file({ type: 'Training', date: 'Jul 18', s: 540, e: 1020, remarks: 'weekend course' })
    schedWrite(SCHED_TYPES.mutate, () => { reqOf(iid).oil = { '2026-07-18': 1 }; afterSchedMutate() })   // his answer: yes
    const earnsFromIt = () => (oilEarnedWork(DAYS[SAT], oilEvidenceOf(SAT))['yeti'] || []).filter((w: any) => w.item === 'i:' + iid)
    const ri = (DAYS[SAT] as any).ground.findIndex((g: any) => g && g.src === iid)
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[SAT] as any).ground[ri].more = ['yeti']; afterSchedMutate() })
    expect(earnsFromIt().length, 'the premise: on the request\'s standing row Bolt earns (D18)').toBeGreaterThan(0)
    const a = deadUnavailRow(iid, SAT)
    bringBack(SAT, a)
    const dead = rowOf(iid, SAT)!.row
    expect(dead.kept, 'the dead row is back').toBe(true)
    expect(dead.more, 'with Bolt on it').toContain('yeti')
    expect(earnsFromIt(), 'Bolt earns nothing from a row that is not the request\'s').toEqual([])
    } finally { HOOKS.oilEarningDay = earning; HOOKS.oilDayISO = iso }
  })
  it('Astra final #2 — a version issued with that dead row and "Unavailable": Accepted since, the load puts both back (D98)', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    const a = deadUnavailRow(iid, WED)
    bringBack(WED, a)
    publish(WED)                                                      // issued: the dead row, filed under Unavailable
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(WED, reqOf(iid)); afterSchedMutate() })   // out of Unavailable
    schedWrite(SCHED_TYPES.mutate, () => { acceptInput(WED, reqOf(iid), 'g'); afterSchedMutate() }) // Accept
    expect(reqOf(iid).acc).toBe('g')
    /* the confirm counts it, or the load's button says the day "is already at" its version and never loads (walk K2) */
    expect(dayDiscardCount(WED), 'the load counts the filing it puts back').toBeGreaterThan(0)
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(WED, dayCurVer(WED)); afterSchedMutate() })
    expect(reqOf(iid).acc, 'the issued filing is back').toBe('u')
    expect(rowOf(iid, WED)!.row.kept, 'and its row, dead, as issued').toBe(true)
    expect(dayShownPendCount(WED), 'nothing pending — the day is as issued').toBe(0)
    await reload(be)
    expect(reqOf(iid).acc).toBe('u')
    expect(dayShownPendCount(WED)).toBe(0)
  })
  it('Astra final #3 — an issued DEAD row did not place the request: deleted since, the request back on the day lands, pending', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    publish(WED)
    edit(iid, { start: '2026-07-22' })                                // away
    schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(WED, dayCurVer(WED)); afterSchedMutate() })
    expect(rowOf(iid, WED)!.row.kept, 'the issued row back, dead').toBe(true)
    sign(WED)
    expect((commitPublishALDay(WED) as any).ok, 'AL1 issued WITH the dead row').toBe(true)
    expect(((daySnapOf(WED, dayCurVer(WED)) || {}).d.ground || []).some((g: any) => g.src === iid && g.kept), 'the issue holds it dead').toBe(true)
    const ri = (DAYS[WED] as any).ground.findIndex((g: any) => g && g.src === iid)
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[WED] as any).ground.splice(ri, 1); afterSchedMutate() })   // the holder deletes it
    edit(iid, { start: '2026-07-15' })                                // the request back on Wednesday
    expect(rowOf(iid, WED), 'it lands — the issued version never placed it').toBeTruthy()
    await reload(be)
    expect(rowOf(iid, WED), 'after a reload too').toBeTruthy()
  })
  it('Astra final #4 — another request\'s change leaves the dead row\'s own marks exactly as they were', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})
    const a = deadUnavailRow(iid, WED)
    publish(WED)                                                      // issued WITHOUT its row
    bringBack(WED, a)
    const rid = rowOf(iid, WED)!.row.rid
    const mine = () => Object.keys(SCHED.pending).filter(k => k.includes(`.${rid}`)).sort()
    const before = mine()
    expect(before.length, 'the dead row reads as an addition, every box').toBeGreaterThan(1)
    file({ person: 'yeti', s: 900, e: 960, remarks: 'another' })     // an unrelated filing on the same day
    expect(mine(), 'its marks unchanged').toEqual(before)
    await reload(be)
    expect(mine()).toEqual(before)
  })
})

/* Fable's FINAL code read (1 Oct 26 — its F1 and F2) */
describe('phase 6 (c) — the FULL check\'s final read (Fable)', () => {
  it('F1 — a request moved to another day never lands with an id the old day\'s stored row still holds: the holder\'s next save keeps its row and its marks', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = file({})                                            // lands Wednesday
    writeText(`dn:${WED}.0`, 'SAVED')                               // the holder saves Wednesday, its row with it
    publish(THU)
    edit(iid, { start: '2026-07-16' })                              // moved to published Thursday: lands there, pending
    const rid = rowOf(iid, THU)!.row.rid
    expect(Object.keys(SCHED.pending).some(k => k === `gr:${THU}.${rid}.prog`), 'its add is marked').toBe(true)
    writeText(`dn:${THU}.0`, 'THURSDAY SAVED')                      // the holder saves Thursday
    expect(rowOf(iid, THU)!.row.rid, 'the same row, the same id').toBe(rid)
    expect(Object.keys(SCHED.pending).some(k => k === `gr:${THU}.${rid}.prog`), 'and still its mark').toBe(true)
    await reload(be)
    expect(rowOf(iid, THU)!.row.rid).toBe(rid)
  })
  it('F2 — a delete that takes away only a sign-off leaves the command layer in step: the next edit carries nothing of it', async () => {
    await boot(new MemoryBackend())
    const onWeek = JSON.stringify(DAYS)
    const pid = Object.keys(PEOPLE).find(id => id !== 'stiff' && id !== 'bane' && !onWeek.includes(`"${id}"`))!
    expect(pid, 'a man with no seat on the week').toBeTruthy()
    schedWrite(SCHED_TYPES.mutate, () => { const g = signOf(WED); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = pid; afterSchedMutate() })
    expect(signOf(WED).appr).toBe(pid)
    expect(deletePerson(pid), 'deleted').toBeNull()
    expect(signOf(WED).appr, 'his sign-off is gone from the day').toBeFalsy()
    expect(schedBaselineClean(), 'and the command layer knows it — the next edit is not charged with it').toBe(true)
  })
})
