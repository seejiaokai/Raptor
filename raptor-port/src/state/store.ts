/* ---------------------------------------------------------------------------
   THE STORE — phase 3.
   One write path over the phase-2 engine, per CLAUDE.md's mutation funnel:
   every schedule write goes through the four functions below, each of which
   calls the verbatim engine function (which records its slot key via
   noteChange) and then afterSchedMutate() — selection drop, stale-arm
   put-down, validate, repaint. "Repaint" here is notify(): one version
   counter + listener set, shaped for React's useSyncExternalStore.

   Importing this module wires the engine's HOOKS: reflow/renderStatus and
   the view repaints map to notify(), histPush records history. The engine
   and view bodies stay verbatim; they gain store behaviour through the
   hooks alone. toast stays injectable (setToast) for the phase-4 UI.
   --------------------------------------------------------------------------- */
import { HOOKS } from '../engine/hooks'
import { slotVal, setSlotVal, fillSlot, txtSet } from '../engine/slots'
import { validate } from '../engine/validate'
import { lookaheadLoad } from '../engine/lookahead'
import { rulesLoad } from '../engine/rules'
import { mintInpIds, INPUTS, DATES, isPersonal, baseYear, dateIx } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { CURWEEK, setCurWeek } from '../engine/waves'
import { weekBundle, otherWeekInputs } from '../engine/weeks-data'
import { seedDemoSans, seedDemoMedical } from './demoseed'
import { docAdd } from './docs'
import { storesLoad, cxReasonsLoad, dutyTplLoad, waveTplLoad, dayTplLoad, autoAcceptSeedInputs, autoAcceptInput, inpKey, secOrder, moveSectionModel, reorderSectionTo, secDefaultLoad, waveDefaultLoad } from '../engine'
import { elogClear } from '../engine/editlog'
import { markDeletion, resetSched, SCHED, dayApproved } from '../engine/publish'
import { stashPut, stashGet, stashHas } from '../engine/weekstash'
import { afterSchedMutate } from './view'
import * as view from './view'
import { histPush, histInit, schedFields } from './history'
import { setSession as authSetSession, canEditSched, SESSION, ACCOUNTS, canToggleRole, setEffectiveRole, setLgEdit, setMe } from './auth'
import { setRole as lwSetRole } from '../leavewar/state/store'
import { clearPlan } from './plan'

let VERSION = 0
const listeners = new Set<() => void>()
let BOARD_VERSION = 0
const boardListeners = new Set<() => void>()

export function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } }
export function getVersion() { return VERSION }
export function notify() { VERSION++; listeners.forEach(f => f()) }
/* Day-to-day board navigation is view-only. Give the board a narrow repaint
   lane so a swipe does not wake every mounted store consumer (most notably
   EditWeek's seven large dayHTML calculations) while ordinary mutations still
   flow through notify() and repaint both the week and board. */
export function subscribeBoard(fn: () => void) { boardListeners.add(fn); return () => { boardListeners.delete(fn) } }
export function getBoardVersion() { return BOARD_VERSION }
export function notifyBoard() { BOARD_VERSION++; boardListeners.forEach(f => f()) }

/* ---- the one write path ---- */

/* a crew slot, by key — no-ops (same body already in the seat) do not mark,
   do not snapshot, do not repaint. The guard is the same one setSlotVal
   itself opens with, repeated here so the epilogue is skipped too. */
export function writeSlot(key: any, id: any) {
  if (slotVal(key) === (id || '')) return     // no-op — nothing moved
  setSlotVal(key, id)
  afterSchedMutate()
}

/* a people cell ("first free seat, else add one more") */
export function writeFill(key: any, id: any) {
  fillSlot(key, id)
  afterSchedMutate()
}

/* an inline text field; txtSet reports whether the model actually moved */
export function writeText(path: any, v: any) {
  const moved = txtSet(path, v)
  if (moved) afterSchedMutate()
  return moved
}

/* a structural delete. The caller does the splice + shiftKeys inside `fn`;
   an inert del: tombstone makes the removal publishable without marking the
   address now occupied by a shifted row. afterSchedMutate supplies the usual
   revalidate/history epilogue. */
export function writeDelete(fn: () => void, di?: number, kind: any = 'programme') {
  fn()
  if (di != null) markDeletion(di, kind)
  afterSchedMutate()
}

/* personal inputs (the Inputs page): mutate INPUTS, then the reference's
   add/delete epilogue — renderInputs(); reflow(); histPush(); */
export function writeInputs(fn: () => void) {
  fn()
  HOOKS.renderInputs(); HOOKS.reflow(); HOOKS.histPush()
}

/* Same as writeInputs, but for an action that calls engine helpers which push
   history of their OWN (markEdit does). Without this a single ✓ left two
   snapshots, so the first Undo landed the user in a half-applied state they
   never created — old fields, but already un-accepted. One action, one step. */
export function writeInputsBatch(fn: () => void) {
  const push = HOOKS.histPush
  HOOKS.histPush = () => {}
  try { fn() } finally { HOOKS.histPush = push }
  HOOKS.renderInputs(); HOOKS.reflow(); HOOKS.histPush()
}

/* THE SCHEDULE SECTION ORDER — its one write path (owner, 29 Aug 26). Re-arrange
   a day's big section panels (engine/order.ts SECTIONS/secOrder). This is LAYOUT,
   not an amendment: it mutates only d.secOrder and takes ONE undo snapshot
   (histSnap serialises DAYS, so d.secOrder rides undo and the week-stash), and
   deliberately does NOT run afterSchedMutate/markEdit — no pending mark, no AL,
   no re-validate, because the rule inputs are byte-identical (see order.ts). It
   never touches a slot key, which is exactly why reordering can't corrupt the
   rules. Gated at the write path too, per the role doctrine, not only in the UI. */
export function moveSection(di: number, key: string, dir: number) {
  if (!canEditSched()) return
  if (moveSectionModel(DAYS[di], key, dir)) { histPush(); notify() }
}

/* THE SECTION DISPLAY ORDER, dragged (owner, 29 Aug 26 pt.3 — the in-place drag
   that replaced the Arrange sheet). Same layout-only contract as moveSection: it
   mutates only d.secOrder, takes one undo snapshot, and never runs
   afterSchedMutate/markEdit — a section order is display, not an amendment (see
   engine/order.ts). The difference is only the reach: a drop can span several
   positions, so it routes through reorderSectionTo (fromKey → toKey) rather than a
   ±1 step. Gated at the write path per the role doctrine. */
export function moveSectionTo(di: number, fromKey: string, toKey: string): boolean {
  if (!canEditSched()) return false
  if (reorderSectionTo(DAYS[di], fromKey, toKey)) { histPush(); notify(); return true }
  return false
}

/* the ONE session-reset path. Login.tsx and Shell.tsx's logout both called
   setSession() from here, but Drawer.tsx's logout imported setSession
   straight from state/auth — a caller could change SESSION without any of
   the view state resetting behind it. CURPAGE in particular is never
   cleared by setSession itself (auth.ts only resets LGEDIT), so an admin
   who left the Edit Schedule page open and logged out handed the next
   member session a live, editable page the instant they signed in — the
   role gate on HOOKS.editMode() closes what renders, but the stale
   CURPAGE/SELID/WFOCUS/etc. is still a wrong picture for a new user to
   land on. Every login and logout now routes through here so a session
   change always drags the whole view back to a safe, page-1 default. */
export function resetSession(s: any) {
  authSetSession(s)
  view.setPage('viewsched')
  view.setBoardDay(null)          // also disarms a slot armed on the outgoing session's day
  view.selDrop()                  // SELID, SELSEEN, SELPREV, PFOCUS, WFOCUS, DWOPEN
  view.clearOtherHL()             // HLSET, SEARCH (and SELID again — harmless)
  view.armDrop()                  // ARM (belt-and-braces: setBoardDay only disarms if ARM was already set)
  view.DPREV.clear()              // day-preview map — same in-place-mutation pattern as DWOPEN/HLSET
  view.VWORK.clear()              // view-page working-copy choices — back to the issued default
  view.AVSHUT.clear()             // Available-crew panels return to their open default
  view.PIOPEN.clear()             // Personal-Inputs panels fold back too
  /* the carried day too: setPage above captures whatever week the OUTGOING
     session was parked on, and a new session must open on the week's own
     opening position — on a phone that is today's column, which initPan
     scrolls to and a stale carry would immediately undo. */
  view.setCarryDay(null)
  view.setHistMode(false)         // the board's History toggle is a per-session view mode
  view.setHlOpen(false)           // the phone's Highlight fold shuts for the next session too
  view.LATEOFF.clear()            // dropped LATE marks come back for the next session, like every other view mode
  view.BELLLIT.clear()            // notification glows never carry across a login/logout
  view.WARNOFF.clear()            // muted board warnings come back for the next session
  view.WMOPEN.clear()
  view.NOTEPUB.clear()            // "public" scheduler-note flags reset with the session
  /* the Inputs-calendar planning layer is a scratch pad, not a record — a
     login/logout must not hand the next user the previous user's open
     calendar month or its half-planned pucks and remarks. */
  view.setInpView('table')
  view.setCalMonth(null)
  view.setMedAsOf(null)
  clearPlan()
  /* the "View as" IDENTITY goes back to the boot default too. It is what
     every member-own gate keys on — the Inputs page's person filter and
     edit/delete reach, the Leave War's own-row rule (mirrored into its
     `viewer` by the sync) — so carrying it across a logout handed the next
     login the PREVIOUS session's person: an admin who left "View as ranger"
     open bequeathed ranger's identity, filter and war row to the next member
     to sign in on that browser. The picker still offers any person (the
     prototype has no per-person accounts, known-gaps); this only stops a
     session INHERITING one nobody chose. */
  setMe('bane')
  /* the Leave War page's role rides the Raptor session: an admin login is a
     Leave War admin, everyone else (and a logout) is a member. This is the
     ONE production writer of that role — the standalone app's own toggle was
     removed at the merge (see leavewar/ui/Chrome.tsx), and the leavewar
     store neither persists nor re-reads it, so nothing can disagree with
     the session that is actually looking at the page. */
  lwSetRole(s && s.role === 'admin' ? 'admin' : 'member')
  /* and the log itself goes. It is stamped with WHO made each change, so
     carrying it across a logout would show the incoming user a list of
     someone else's work under their own board — and the schedule those
     entries describe is still there, which makes it read as fact rather
     than as leftovers. Clearing is the honest half-measure while the app
     has no server to keep a real per-person record. */
  elogClear()
}

/* ---- THE ADMIN'S ROLE TOGGLE (owner, 27 Aug 26) --------------------------
   Clicking the role badge flips a REAL admin between admin and member view,
   so he can check what a member sees without logging out; a member account
   has no toggle at all (auth.ts's canToggleRole — LOGINROLE is the ceiling,
   captured at login and untouched here, so the way back always exists and a
   member can never climb).
   Only the EFFECTIVE role moves. Every gate in the app reads SESSION.role
   live (canEditSched, lgCanEdit, HOOKS.editMode), so the flip reaches them
   with no second switch — but three pieces of state don't re-derive and are
   walked here, the resetSession discipline in miniature:
   - an admin-only PAGE left open would render as a dead editable surface
     for the member view → fall back to View-only Sched;
   - an ARMED slot is edit machinery mid-gesture → disarm;
   - the Logic tab's edit mode is admin-only → off.
   The Leave War's role follows the effective role through the same lwSetRole
   seam resetSession drives — an admin viewing as member must read the war as
   a member too, or the preview lies. That makes this the SECOND (and last)
   production writer of that role; both write what the current view of the
   session is entitled to.
   Deliberately NOT a full resetSession: the week, selection, filters and
   undo history all stay — the whole point is looking at the SAME screen
   through the other role's eyes. */
export function toggleRole() {
  if (!canToggleRole()) return
  const toAdmin = !(SESSION && SESSION.role === 'admin')
  setEffectiveRole(toAdmin ? 'admin' : 'main')
  if (!toAdmin) {
    if (view.CURPAGE === 'editsched' || view.CURPAGE === 'admin') view.setPage('viewsched')
    view.armDrop()
    setLgEdit(false)
  }
  lwSetRole(toAdmin ? 'admin' : 'member')
  notify()
}

/* ---- PER-WEEK SESSION STASH (the other half of the .wk selector) ----
   loadWeek used to always rebuild DAYS from weekBundle's PURE seed on a
   switch, which silently discarded any edit made to a week once you left it
   — reported bug: a duty added on the Sunday of an unauthored week vanished
   after scrolling one week forward and back. weekstash.ts is the dumb
   per-week store (keyed by week-start; SESSION-ONLY on purpose — see its
   header: the owner keeps the whole app's forget-on-exit rule, this fix is
   about navigation, not reloads); these two helpers are the state-layer
   half that knows what belongs in a snapshot, because WARNOFF lives in
   state/view.ts and the engine may not import state/. */

/* Everything a week's own stash entry needs — DAYS plus the eleven SCHED
   fields (schedFields, shared with history.ts's histSnap so the two cannot
   drift) plus WARNOFF. Deliberately NOT `i:INPUTS`/`pp:PLANPUCKS`/`dm:DAYRMK`
   the way histSnap's whole-history snapshot is — those three are GLOBAL, not
   week-scoped (CLAUDE.md's "Personal INPUTS are GLOBAL" decision), and
   restoring them here would roll back edits made to them while the user was
   on a DIFFERENT week. */
/* WHICH OF THIS WEEK'S PERSONAL INPUTS THE SCHEDULER DELIBERATELY TOOK OFF THE
   GROUND (review fix, 24 Aug 26). A personal activity input auto-lands on its
   day, but a scheduler may unaccept it (slots.ts unacceptInput removes the
   ground row and drops `acc`) — a real decision. INPUTS is global and NOT
   carried in the stash, so on the way back into this week the blanket
   auto-land pass below used to re-land exactly those rows, silently undoing
   the removal. So the stash remembers, by content key, which in-week personal
   rows carry the explicit removal mark (acc 'r') on an editable day, and the
   restore skips the auto-land for those. A row NEW since this week was last open is not in the
   set (it had no chance to be unaccepted here), so it still lands as intended.
   Content key (inpKey), so an id renumber between visits can't lose the mark. */
function unacceptedKeys(): string[] {
  const out: string[] = []
  INPUTS.forEach((r: any) => {
    /* ONLY the explicit 'r' mark (removed — dormant, engine/inputs.ts
       inputDormant) goes in: it is the one shape that provably records a
       deliberate removal. An ACC-LESS unlanded row is NOT recorded — it can
       also mean "never landed" (an input filed onto a then-published day that
       has since been reopened), and recording it re-parked exactly those as
       dormant after a week round-trip: an input no scheduler ever removed
       silently stopped flagging (26 Aug 26 bug pass). Nothing is lost by the
       narrowing — every removal this build writes is 'r', the acc-clear on
       week entry deliberately preserves 'r' (below), and the stash is
       session-memory only, so no older shape can reach this function. */
    if (!isPersonal(r.type) || r.acc !== 'r') return
    const di = dateIx(r.date, r.yr)
    if (di < 0 || dayApproved(di)) return
    /* the landed filter stays: content keys are not unique, so an 'r' row
       whose key a landed TWIN also wears must not be recorded — the restore
       loop matches by key and would re-park the twin under its live row */
    const key = inpKey(r)
    const landed = DAYS.some((d: any) => ((d && d.ground) || []).some((g: any) => g.src === key))
    if (!landed) out.push(key)
  })
  return out
}
function weekStashSnap() {
  return JSON.stringify({ d: DAYS, ...schedFields(), wo: [...view.WARNOFF], un: unacceptedKeys() })
}

/* WHAT THIS WEEK LOOKED LIKE THE MOMENT IT FINISHED LOADING — the yardstick
   loadWeek's stash-on-leave compares against. Stashing every week
   unconditionally would store a byte-copy of the pure seed for weeks nobody
   touched, and a PERSISTED pristine copy is a trap: the day a deploy updates
   the built-in demo weeks, every browser that ever scrolled past one would
   go on seeing the old content forever (the stash outranks the seed by
   design). So a week is stashed on the way out only when it CHANGED since
   load, or when it already has a stash entry to keep current. Captured after
   the model is applied and WARNOFF restored — the same fields the snapshot
   serializes — in both loadWeek and initStore. */
let weekBaseline = ''

/* THE autoAcceptSeedInputs LANDING-MECHANICS GOTCHA a stash restore runs
   into: acceptInput (engine/slots.ts) does not just set `row.acc='g'`, it
   PUSHES a real ground row onto DAYS. A stash restore hands back DAYS with
   that row ALREADY on it (it was there when the week was last left), but the
   epilogue below still clears every input's `acc` first (see its own
   comment) so a genuinely NEW input can land — which means the already-
   landed row's `acc` reads false too. Calling acceptInput again for it does
   NOT duplicate the row (acceptInput's own dedup guard, keyed on the row's
   content, refuses a second push) — but it also leaves `acc` unset, so the
   Inputs page would offer to "Accept" a row that is already sitting on the
   board. This reconciles that BEFORE the real landing pass runs, by reading
   `acc` straight off whether a matching ground row already exists — no call
   into acceptInput, so no duplicate write, no edit-log entry, no flashAdded
   for something that was never actually re-added. */
function reconcileLandedAcc() {
  INPUTS.forEach((r: any) => {
    if (r.acc || !isPersonal(r.type)) return
    const di = dateIx(r.date, r.yr)
    if (di < 0) return
    const key = inpKey(r)
    if (DAYS.some((d: any) => ((d && d.ground) || []).some((g: any) => g.src === key))) r.acc = 'g'
  })
}

/* THE ONE PLACE THE SCHEDULE MODEL FOR WEEK v GETS BUILT — loadWeek's one
   entry to both the restore path and the pure-seed path, so the two cannot
   drift apart. Takes DAYS,
   DATES and every SCHED field from the stash if one exists for v, otherwise
   from the pure weekBundle seed exactly as before. Either way it also runs
   the INPUTS acc-clear/relanding epilogue (mintInpIds + either the ordinary
   autoAcceptSeedInputs or, on a restore, the same landing pass with the
   amendment-tracking fields (pending/changes/added) protected — a row landed
   just now because it is NEW since this week was last open must read as
   BASELINE, the same rule autoAcceptSeedInputs itself already enforces on a
   fresh week, not as a pending edit the scheduler just made; the fields this
   stash actually restored are snapshotted first and put back after, so only
   what THIS pass adds is undone). Returns the parsed stash object (or null)
   so the caller can also restore WARNOFF from its `wo` field — the one piece
   of view state the stash carries, because it lives in state/view.ts and
   this function stays inside the DAYS/DATES/SCHED/INPUTS layer its callers
   already touch. Callers own everything else: which view-state clears run,
   validate(), histInit(), notify() — they differ enough (initStore also does
   its own boot-only merges first) that folding them in here would cost more
   than it saves. */
function applyWeekModel(v: any): any {
  const stashedJson = stashGet(v)
  /* guarded like weekstash's own stashDays: an entry that fails to parse
     reads as "never stashed" and the week loads from the pure seed —
     loadWeek must never throw over a bad snapshot */
  let s: any = null
  try { s = stashedJson ? JSON.parse(stashedJson) : null } catch (_e) { s = null }
  if (s && !Array.isArray(s.d)) s = null
  if (s) {
    DAYS.length = 0; s.d.forEach((d: any) => DAYS.push(d))
    /* DATES is not carried in the stash at all (weekstash.ts's own comment)
       — it is a pure function of v, so weekBundle(v).dates is exactly right
       whether v is authored or blank, restore or fresh. */
    DATES.length = 0; weekBundle(v).dates.forEach((x: any) => DATES.push(x))
    /* re-label the restored days from the fresh DATES (24 Aug 26): dt is
       index-determined, and although a stash written and restored for the
       SAME week derives identical labels today, enforcing the invariant here
       costs one line and removes the assumption. */
    s.d.forEach((d: any, i: number) => { if (d && DATES[i] != null) d.dt = DATES[i] })
    SCHED.changes = s.c || {}; SCHED.pending = s.p || {}; SCHED.added = s.ad || {}
    SCHED.als = s.a || []; SCHED.al = s.al || 0; SCHED.dayOK = s.ok || {}
    SCHED.sign = s.sg || {}; SCHED.orig = s.o || {}; SCHED.cur = s.cv || {}
    SCHED.drafts = s.dr || {}; SCHED.curDraft = s.cd || {}
  } else {
    const wk = weekBundle(v)
    DAYS.length = 0; wk.days.forEach((d: any) => DAYS.push(d))
    DATES.length = 0; wk.dates.forEach((x: any) => DATES.push(x))
    resetSched()
  }
  /* INPUTS IS GLOBAL (owner, 22 Aug 26) — NOT swapped with the week. The
     Inputs page shows every week's inputs; each week's schedule still shows
     only its own because autoAcceptSeedInputs and the day builders match by
     date. `acc` records the LOADED week's landing only (weekctx.ts's own
     comment says the same) — clear it so autoAcceptSeedInputs (or the
     restore-landing pass below) re-derives it fresh for THIS week's DAYS,
     whichever shape they just took above. 'r' (removed — dormant, engine/
     inputs.ts inputDormant) is the one value that SURVIVES the clear: it is
     not a landing record but a mark on the input itself, and keeping it is
     what lets the cross-week seeds (weekctx.ts) and autoAccept's truthy-acc
     guard honour a removal without re-deriving it from the stash. */
  INPUTS.forEach((r: any) => { if (r.acc && r.acc !== 'r') delete r.acc })
  reconcileLandedAcc()
  mintInpIds()
  if (s) {
    /* a row this week deliberately unaccepted before must NOT be auto-landed
       again on the way back in (see unacceptedKeys) — everything else lands,
       including a row that is brand new since this week was last open */
    const un = new Set<string>(Array.isArray(s.un) ? s.un : [])
    const savedPending = { ...SCHED.pending }, savedChanges = { ...SCHED.changes }, savedAdded = { ...SCHED.added }
    /* an un-hit row is re-PARKED as 'r', not left acc-less: the acc-clear
       above wiped its dormancy marker, and without putting it back the input
       would read as fresh and start flagging again the moment the week is
       re-entered — the exact surprise the owner reported (26 Aug 26). */
    INPUTS.forEach((r: any) => {
      if (un.has(inpKey(r))) { if (isPersonal(r.type)) r.acc = 'r' }
      else autoAcceptInput(r)
    })
    SCHED.pending = savedPending; SCHED.changes = savedChanges; SCHED.added = savedAdded
  } else {
    autoAcceptSeedInputs()      // land activity inputs on ground (dayApproved now clean)
  }
  return s
}

/* ---- LOAD A WEEK (the .wk selector) ----
   Swap the whole loaded week — the schedule model AND everything keyed to it —
   then recompute and repaint. DAYS/DATES/INPUTS are all week-scoped and mutate
   IN PLACE (they are live bindings every reader holds; the same idiom histApply
   uses). resetSched() (inside applyWeekModel, on a non-restored week) closes
   the day-index leak (one week's approvals/AL/pending must not paint another's
   identical indices); histInit() re-baselines so Undo cannot cross weeks; the
   view-state clears drop any pointer into a row that no longer exists (armed
   slot, selection, board day, per-day panels, dropped-late iids). Session, page
   and role are deliberately untouched — this is a data swap, not a login.
   Nothing here runs at module load, so DAYS still initialises to the seed week
   and the parity/e2e "seven days" pins stay exact until a user actually clicks
   a chip.

   THE WEEK BEING LEFT IS STASHED FIRST, before setCurWeek moves CURWEEK off
   it — this is the fix for the vanishing-duty bug: a session edit used to
   live only in the DAYS objects this function was about to discard and
   rebuild from the pure seed. applyWeekModel then either restores v's own
   stash (if this week has been visited and edited before) or falls back to
   the same pure-bundle path as always. */
export function loadWeek(v: any) {
  const leaveSnap = weekStashSnap()
  if (stashHas(CURWEEK) || leaveSnap !== weekBaseline) stashPut(CURWEEK, leaveSnap)
  setCurWeek(v)
  HOOKS.weekSwapped()         // pan.ts drops its arrow-burst corridor (stale-target fix)
  const s = applyWeekModel(v)
  view.setBoardDay(null)      // closes the phone board and disarms
  view.armDrop()
  view.selDrop()
  view.clearOtherHL()
  view.setSecDefOffer(null)   // a "set default?" offer keyed by day index must not outlive its week
  view.DPREV.clear()
  view.VWORK.clear()
  view.AVSHUT.clear()
  view.PIOPEN.clear()
  view.BELLLIT.clear()
  /* the muted-warnings set is the one view-state field a stash restores
     (weekStashSnap) — a scheduler who quieted a check on this week should
     not have it reappear just because they looked away and came back. */
  view.WARNOFF.clear()
  if (s) (s.wo || []).forEach((k: any) => view.WARNOFF.add(k))
  view.WMOPEN.clear()
  view.NOTEPUB.clear()
  view.setCarryDay(null)
  view.setHistMode(false)
  view.setRosDay(0)
  view.LATEOFF.clear()
  weekBaseline = weekStashSnap()   // the stash-on-leave yardstick (see its comment)
  validate()
  histInit()                  // new baseline for this week — Undo starts here
  notify()
}

/* ---- wiring ---- */
export function wireStore() {
  /* the reference's editMode(): the edit page is open. The reference also
     ANDed its #editToggle switch here; that toggle was removed 9 Aug 26
     (owner) — being on Edit Schedule is the intent to edit, and View-only
     Sched is the read-only mode. The role test is this port's own addition:
     a session change on the SAME running page (logout/login without a
     reload) can leave CURPAGE sitting on 'editsched' from the outgoing user.
     editMode() is what drives every draggable="true" / contenteditable="true"
     attribute in html.ts, so one canEditSched() check here closes them all at
     once rather than patching each rendered surface individually. */
  HOOKS.editMode = () => canEditSched() && view.CURPAGE === 'editsched'
  HOOKS.reflow = () => { validate(); notify() }
  HOOKS.renderStatus = () => notify()
  HOOKS.histPush = () => histPush()
  HOOKS.syncHistBtns = () => notify()
  HOOKS.paintArm = () => notify()
  HOOKS.renderRosters = () => notify()
  HOOKS.renderScheduler = () => notify()
  HOOKS.renderEditWeek = () => notify()
  HOOKS.renderSchedule = () => notify()
  HOOKS.renderInputs = () => notify()
  /* view state that addresses a row by key would ride the same renumbering the
     amendment book and the edit log do (engine/keys.ts). RMKOPEN — the one
     empty remarks box a phone user asked back — used to be that value, but the
     board now shows every remarks box at all times (owner, 16 Aug 26), so it
     is gone and no transient view state addresses a board row by key today.
     The hook stays wired (keys.ts still calls it) as a no-op; restore this
     body the moment a new key-addressed view value appears. */
  HOOKS.remapViewKeys = (_move) => {}
  /* the just-added blue box (owner, 14 Aug 26): markStructuralAdd hands every
     add's key here, view.ts holds it for ~6s, highlights.ts hangs the box */
  HOOKS.flashAdded = (key) => view.flashAdded(key)
  /* the reference's isPhone() (matchMedia max-width:820px). It was never wired
     in the port, so the default `false` made every isPhone call site dead: a
     palette drag on a phone never parked the drawer — the drop could only land
     back on the drawer itself, a silent no-op — and arming a slot never slid
     the drawer open. Guarded for jsdom, which has no matchMedia. */
  /* the name the edit log stamps on every change. The accounts are hard-coded
     and there are two of them, so today this is only ever "Admin" or
     "Squadron member" — which is the truth of a prototype login, not a
     placeholder standing in for something better. When accounts become real
     this returns a person's name and the whole log starts naming people, with
     no change anywhere else. */
  HOOKS.whoami = () => {
    if (!SESSION) return 'Unknown'
    return (ACCOUNTS[SESSION.user] && ACCOUNTS[SESSION.user].label) || String(SESSION.user)
  }
  HOOKS.isPhone = () => {
    if (typeof window === 'undefined') return false
    try { if (window.matchMedia) return window.matchMedia('(max-width:820px)').matches } catch (_) {}
    return (window.innerWidth || 821) <= 820
  }
}
export function setToast(fn: (...a: any[]) => any) { HOOKS.toast = fn }

/* boot: wire, reload any persisted rule overrides, validate once, take the
   baseline history snapshot — the same order the reference establishes
   (rulesLoad() runs at its module scope, before bootApp's validate). Without
   the rulesLoad an edited threshold silently reverted to standard on every
   reload — caught by the audit2 probe (#6 "the override reloaded"). */
export function initStore() {
  wireStore()
  rulesLoad()
  storesLoad()
  lookaheadLoad()
  cxReasonsLoad()
  dutyTplLoad()
  waveTplLoad()
  dayTplLoad()
  /* the admin-set DEFAULT arrangement (owner, 29 Aug 26 pt.2) — the global section
     order secOrder falls back to, and the global wave order a new wave is placed by.
     Both default to "un-customised" (canonical sections / no wave order = append),
     so a squadron that never touches the Admin panel behaves exactly as before, and
     the never-booting parity harness stays blind to them. */
  secDefaultLoad()
  waveDefaultLoad()
  /* GLOBAL INPUTS (owner, 22 Aug 26 — "show all inputs regardless of which week
     I am selected on"). The module-load INPUTS array is week 1's; merge every
     OTHER authored week's inputs in ONCE here so the Inputs page carries them
     all. Each week's SCHEDULE still shows only its own, because inputCoversDate
     matches by date and a week only loads its seven days. Idempotent (initStore
     may run twice in tests) — guarded on the same person|date|type|start
     identity seedDemoSans guards on. Boot-only, so the parity harness (which
     never boots) stays blind, exactly like seedDemoSans and autoAcceptSeedInputs. */
  otherWeekInputs().forEach((r: any) => {
    const dup = INPUTS.some((x: any) => x.person === r.person && x.date === r.date && x.type === r.type && (x.s ?? '') === (r.s ?? ''))
    if (!dup) INPUTS.push(r)
  })
  /* demo-only SANS Availability rows (see state/demoseed.ts for why this
     lives here and not in engine/inputs.ts's INPUTS array) — pushed before
     mintInpIds so they mint an iid exactly like every other seed row */
  seedDemoSans()
  /* demo-only medical lifecycle rows + placeholder documents (same boot-only
     home and blindness guarantee — see state/demoseed.ts) */
  seedDemoMedical(docAdd)
  /* ANCHOR EVERY SEED INPUT TO ITS YEAR (24 Aug 26). A bare 'Jul 13' label
     is resolved through the row's `yr`; at boot CURWEEK is the seed week, so
     baseYear() is exactly the year every demo/authored/SANS seed row means.
     Idempotent (initStore may run twice in tests), and boot-only so the
     parity harness — which never boots — still reads the pristine INPUTS
     literals, the same guarantee seedDemoSans leans on. */
  INPUTS.forEach((r: any) => { if (r.yr == null) r.yr = baseYear() })
  /* before histInit, so the FIRST snapshot already carries every input's
     address — see mintInpIds in engine/inputs.ts for why an id minted later
     than the snapshot it should be in is worse than no id at all */
  mintInpIds()
  /* land every activity input on its day's ground programme before the first
     validate + baseline — boot-only, so parity (which never boots) stays blind;
     SCHED is fresh here, so every day reads editable. See autoAcceptSeedInputs. */
  autoAcceptSeedInputs()
  weekBaseline = weekStashSnap()   // the stash-on-leave yardstick (see its comment)
  validate()
  histInit()
  notify()
}
wireStore()

/* the store's public surface: the writes above, plus the engine's publish
   actions and the history verbs, re-exported so the UI has one import */
export { setDayApproved, publishAL, publishALDay, unpublishAL, discardPending, markEdit } from '../engine/publish'
export { undo, redo, histInit, histApply, HIST } from './history'
export { armSlot, disarmSlot, armedKey, placeArmed, selectPerson, selKeep, selRestore, selClear, selDrop, setBoardDay, setPage, afterSchedMutate } from './view'
export { setSession, canEditSched, LGEDIT, setLgEdit } from './auth'
