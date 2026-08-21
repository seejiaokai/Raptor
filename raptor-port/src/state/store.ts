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
import { rulesLoad } from '../engine/rules'
import { mintInpIds, INPUTS, DATES } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { setCurWeek } from '../engine/waves'
import { weekBundle } from '../engine/weeks-data'
import { seedDemoSans } from './demoseed'
import { storesLoad, dutyTplLoad, dayTplLoad, autoAcceptSeedInputs } from '../engine'
import { elogClear } from '../engine/editlog'
import { markDeletion, resetSched } from '../engine/publish'
import { afterSchedMutate } from './view'
import * as view from './view'
import { histPush, histInit } from './history'
import { setSession as authSetSession, canEditSched, SESSION, ACCOUNTS } from './auth'
import { setRole as lwSetRole } from '../leavewar/state/store'

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
  view.AVOPEN.clear()             // Available-crew panels fold back to their one-line default
  view.PIOPEN.clear()             // Personal-Inputs panels fold back too
  /* the carried day too: setPage above captures whatever week the OUTGOING
     session was parked on, and a new session must open on the week's own
     opening position — on a phone that is today's column, which initPan
     scrolls to and a stale carry would immediately undo. */
  view.setCarryDay(null)
  view.setHistMode(false)         // the board's History toggle is a per-session view mode
  view.LATEOFF.clear()            // dropped LATE marks come back for the next session, like every other view mode
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

/* ---- LOAD A WEEK (the .wk selector) ----
   Swap the whole loaded week — the schedule model AND everything keyed to it —
   then recompute and repaint. DAYS/DATES/INPUTS are all week-scoped and mutate
   IN PLACE (they are live bindings every reader holds; the same idiom histApply
   uses). resetSched() closes the day-index leak (one week's approvals/AL/pending
   must not paint another's identical indices); histInit() re-baselines so Undo
   cannot cross weeks; the view-state clears drop any pointer into a row that no
   longer exists (armed slot, selection, board day, per-day panels, dropped-late
   iids). Session, page and role are deliberately untouched — this is a data
   swap, not a login. Nothing here runs at module load, so DAYS still initialises
   to the seed week and the parity/e2e "seven days" pins stay exact until a user
   actually clicks a chip. */
export function loadWeek(v: any) {
  setCurWeek(v)
  const wk = weekBundle(v)
  DAYS.length = 0; wk.days.forEach((d: any) => DAYS.push(d))
  DATES.length = 0; wk.dates.forEach((x: any) => DATES.push(x))
  INPUTS.length = 0; wk.inputs.forEach((r: any) => INPUTS.push(r))
  if (wk.seedSans) seedDemoSans()
  mintInpIds()
  resetSched()
  autoAcceptSeedInputs()      // land activity inputs on ground (dayApproved now clean)
  view.setBoardDay(null)      // closes the phone board and disarms
  view.armDrop()
  view.selDrop()
  view.clearOtherHL()
  view.DPREV.clear()
  view.VWORK.clear()
  view.AVOPEN.clear()
  view.PIOPEN.clear()
  view.setCarryDay(null)
  view.setHistMode(false)
  view.setRosDay(0)
  view.LATEOFF.clear()
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
  dutyTplLoad()
  dayTplLoad()
  /* demo-only SANS Availability rows (see state/demoseed.ts for why this
     lives here and not in engine/inputs.ts's INPUTS array) — pushed before
     mintInpIds so they mint an iid exactly like every other seed row */
  seedDemoSans()
  /* before histInit, so the FIRST snapshot already carries every input's
     address — see mintInpIds in engine/inputs.ts for why an id minted later
     than the snapshot it should be in is worse than no id at all */
  mintInpIds()
  /* land every activity input on its day's ground programme before the first
     validate + baseline — boot-only, so parity (which never boots) stays blind;
     SCHED is fresh here, so every day reads editable. See autoAcceptSeedInputs. */
  autoAcceptSeedInputs()
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
