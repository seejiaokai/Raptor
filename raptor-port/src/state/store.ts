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
import { storesLoad } from '../engine'
import { afterSchedMutate } from './view'
import * as view from './view'
import { histPush, histInit } from './history'
import { setSession as authSetSession, canEditSched } from './auth'

let VERSION = 0
const listeners = new Set<() => void>()

export function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } }
export function getVersion() { return VERSION }
export function notify() { VERSION++; listeners.forEach(f => f()) }

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
   the epilogue is a bare markEdit() (history step, NO key — a delete must
   never re-mark the address it just removed) and the usual revalidate.
   afterSchedMutate() already opens with exactly that bare markEdit(). */
export function writeDelete(fn: () => void) {
  fn()
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
  /* the carried day too: setPage above captures whatever week the OUTGOING
     session was parked on, and a new session must open on the week's own
     opening position — on a phone that is today's column, which initPan
     scrolls to and a stale carry would immediately undo. */
  view.setCarryDay(null)
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
  /* the reference's isPhone() (matchMedia max-width:820px). It was never wired
     in the port, so the default `false` made every isPhone call site dead: a
     palette drag on a phone never parked the drawer — the drop could only land
     back on the drawer itself, a silent no-op — and arming a slot never slid
     the drawer open. Guarded for jsdom, which has no matchMedia. */
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
