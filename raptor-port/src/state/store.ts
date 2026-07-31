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
import { afterSchedMutate } from './view'
import { histPush, histInit } from './history'

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

/* ---- wiring ---- */
export function wireStore() {
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
}
export function setToast(fn: (...a: any[]) => any) { HOOKS.toast = fn }

/* boot: wire, validate once, take the baseline history snapshot — the same
   order the reference's bootApp establishes */
export function initStore() {
  wireStore()
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
