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
import { inputGate } from './inputgate-hook'
import { groupSnapshot, groupsTouched, groupBreach } from './inputgroup'
import { slotVal, setSlotVal, fillSlot, txtSet } from '../engine/slots'
import { validate } from '../engine/validate'
import { lookaheadLoad } from '../engine/lookahead'
import { rulesLoad } from '../engine/rules'
import { flyplanLoad } from './flyplan'
import { insightsLoad } from '../engine/insights-config'
import { registerMissionRoles } from './mission-roles'
import { mintInpIds, INPUTS, DATES, baseYear, dateIx, inputCoversDate, inpId } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { ensureRowIds, backfillSnapshotIds, migrateBookKeys, migrateLegacyIds } from '../engine/rowids'
import { CURWEEK, setCurWeek } from '../engine/waves'
import { weekBundle, otherWeekInputs, seedRids } from '../engine/weeks-data'
import { seedDemoSans, seedDemoMedical, seedDemoStamps, seedDemoGroup } from './demoseed'
import { docAdd } from './docs'
import { storesLoad, cxReasonsLoad, dutyTplLoad, waveTplLoad, dayTplLoad, secOrder, moveSectionModel, reorderSectionTo, secDefaultLoad, waveDefaultLoad } from '../engine'
import { qualColsLoad } from '../engine/qualcols'
import { elogFlush, elogLoad, setElogDefer, setElogDoor, elogAdoptHeld } from '../engine/editlog'
import { changesLoad } from './changes'
import { registerChangeLines } from './changelines'
import { markDeletion, resetSched, SCHED, dayApproved, protectedWeek, amFormatOf } from '../engine/publish'
import { inputProtected, protectedDates } from '../engine/quarantine'
import { stashPut, stashGet, stashHas, setPreservedBlob, clearPreservedBlob, isPreservedWeek, preservedBlob } from '../engine/weekstash'
import { baseReset, baseSnapshot, rederive } from './holderbase'
import { stashRows, joinWeek } from './weekrows'
import { afterSchedMutate } from './view'
import * as view from './view'
import { histPush, histInit, histSnap, histRestore, schedFields } from './history'
import { setSession as authSetSession, canEditSched, SESSION, setMe, DEFAULT_ME, setLgEdit } from './auth'
import { me, roleOf, isAdmin, mayViewAsMember, switchRoleInForce } from './perms'
import { endUndoSession } from '../undo/timeline'
import { setRole as lwSetRole } from '../leavewar/state/store'
import { endTrackerSession } from '../tracker/role.js'
import { isHydrated } from './persist'
import { deferEffect, CmdRefused, setPermissionResolver, commitProjection, onPipelineBegin, deriveActor, definePermission, anyone } from '../command'
/* internal wiring may raise a command as a named person (command/index.ts — commitAs stays off the public surface) */
import { commitAs } from '../command/commit'
import { defineInvariant } from '../command/harness'
import { cmdAuthorize, ownershipViolation } from './perms'
import type { EnlistableStore, RecordEntry, CommitResult } from '../command'
import { snapshotStash, restoreStash, stashEntries, writeStashRecords } from '../engine/weekstash'
import { registerSchedCommandLayer, commitSchedVoid, commitSchedValue, commitInputs, commitInputsProjection, commitInputsWith, SCHED_TYPES, resyncSchedBaseline } from './sched-commit'
import { registerPeopleSettingsCommandLayer, resyncPeopleBaseline, mintPeopleOrd } from './people-settings-commit'
import { mintOrd } from '../command/ord'
import { PLANPUCKS } from './plan'
import { accountsLoad, setAccountSeeds } from './accounts'

let VERSION = 0
const listeners = new Set<() => void>()
let BOARD_VERSION = 0
const boardListeners = new Set<() => void>()

export function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } }
export function getVersion() { return VERSION }
/* [ARCH-STACK] Step 2 (additive): while a commit() is in flight, the repaint is
   LATCHED and released in phase 8 so a rolled-back command leaves no repaint of a
   state that never happened. OUTSIDE a commit — every path not yet routed through
   the gate (loadWeek, initStore, toggleRole, …) — deferEffect returns false and
   notify runs inline exactly as before, so behaviour is unchanged. */
export function notify() { if (deferEffect(realNotify)) return; realNotify() }
function realNotify() { VERSION++; listeners.forEach(f => f()) }
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
  /* [ARCH-STACK] Step 2 (additive): the identical write, now inside commit() —
     enlist snapshot, run setSlotVal+afterSchedMutate exactly as before, emit the
     record-level change. The legacy histPush/persistAll/undo stack still run. */
  commitSchedVoid(SCHED_TYPES.slot, () => { setSlotVal(key, id); afterSchedMutate() })
}

/* a people cell ("first free seat, else add one more") */
export function writeFill(key: any, id: any) {
  commitSchedVoid(SCHED_TYPES.fill, () => { fillSlot(key, id); afterSchedMutate() })
}

/* an inline text field; txtSet reports whether the model actually moved */
export function writeText(path: any, v: any) {
  return commitSchedValue(SCHED_TYPES.text, () => {
    const moved = txtSet(path, v)
    if (moved) afterSchedMutate()
    return moved
  }, { key: String(path) })
}

/* a structural delete. The caller does the splice + shiftKeys inside `fn`;
   an inert del: tombstone makes the removal publishable without marking the
   address now occupied by a shifted row. afterSchedMutate supplies the usual
   revalidate/history epilogue. */
export function writeDelete(fn: () => void, di?: number, kind: any = 'programme') {
  commitSchedVoid(SCHED_TYPES.delete, () => {
    fn()
    if (di != null) markDeletion(di, kind)
    afterSchedMutate()
  })
}

/* ---- THE INPUT QUARANTINE CHOKE-POINT (P2-REV2-04, quarantine redesign) ----
   Every INPUTS mutation passes through one of the two funnels below for its
   render/reflow/history epilogue. The read-only quarantine is enforced HERE,
   ONCE, instead of at each of the ever-growing set of writers: three Codex
   rounds each found another INPUTS writer the per-site protectedInput() guards
   had missed (the Inputs-page Add's bare unshift, the medical creation cascade,
   the Leave-War outbound sync). Because those writers ALL end in this funnel,
   guarding the funnel catches every one of them — and any NEW writer added
   later — with no guard of its own, which is the convergence three rounds of
   spot-guards never reached.
   When any week is quarantined, the funnel snapshots the whole model before the
   batch and, if the batch added/removed/changed an input covering a protected
   date (or touched a protected LOADED week's schedule), rolls the model back and
   refuses. When nothing is quarantined — the overwhelmingly common case — it is
   a no-op fast path, byte-identical to the pre-redesign funnel, so ordinary
   weeks (and the never-quarantined parity harness) are untouched. */
function protectedTouched(before: any, prot: string[]): boolean {
  /* the LOADED week is itself protected and its schedule was mutated (an input
     auto-landing a ground row onto a frozen day). Only fires when protectedWeek()
     — an edit on a different, unprotected week never changes the loaded DAYS. */
  if (protectedWeek() && JSON.stringify(DAYS) !== JSON.stringify(before.d)) return true
  /* the sorted multiset of inputs covering a protected date must be unchanged.
     A row added onto, removed from, edited on, or MOVED off a protected date all
     change this set; a pure reorder of unrelated rows (unshift) does not. */
  const cover = (rows: any[]) => {
    const sig: string[] = []
    for (const r of rows || []) if (r && prot.some(dt => inputCoversDate(r, dt))) sig.push(JSON.stringify(r))
    return sig.sort()
  }
  const a = cover(before.i), b = cover(INPUTS)
  if (a.length !== b.length) return true
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return true
  return false
}
/* run the caller's INPUTS mutation `fn` behind the quarantine backstop, then the
   `renderInputs/reflow/histPush` epilogue only if the batch was legal. Rolls the
   whole model back (the same restore undo runs) on an illegal touch, pushing no
   history and persisting nothing — the write never happened. `suppressHist`
   swallows engine helpers' own history pushes so a batch action is ONE undo
   step (writeInputsBatch's original reason to exist). */
function runInputWrite(fn: () => void, suppressHist: boolean): boolean {
  const prot = protectedDates()
  /* snapshot whenever a quarantine is active — used to roll back an illegal batch
     below, AND to restore a half-mutated model if fn() THROWS (P2-QREV/Fable-13):
     without this a mid-batch exception left the model partly written with no undo
     step to recover it. */
  const snap = prot.length ? histSnap() : null
  const push = HOOKS.histPush
  if (suppressHist) HOOKS.histPush = () => {}
  /* [ARCH-STACK] step 4 — the absence rules (inputgate-hook.ts): snapshot
     before, enforce after, inside this same command */
  const gate = inputGate()
  const gateSnap = gate ? gate.snapshot() : null
  /* ONE MAN ONCE AN ENTRY, ONE FILER A GROUP — held HERE, at the write, beside the absence rules (the group input:
     owner D654, D655; the build plan §3.13 "Records", Astra's finding G5). A group is one record per man tied by a
     group id, and what the Inputs page shows as one shared input is worked out on read (state/inputgroup.ts). Two
     doors that each look innocent — a man's record changed alone, the same man added to the entry again, his first
     record changed back — would leave two inputs for one man where the screen shows one. So for every group this
     write touched, no two live records may name the same man with the same shared fields, and every record carries
     the group's one filer; a write that would break either is refused whole, with its sentence. The same check sits
     in the Undo / Redo restore (state/sched-commit.ts). */
  const grpSnap = groupSnapshot(INPUTS)
  try {
    fn(); if (gate) gate.apply(gateSnap)
    const breach = groupBreach(INPUTS, groupsTouched(grpSnap, INPUTS))
    if (breach) { HOOKS.toast(breach, 'warn'); throw new CmdRefused(breach) }
  }
  catch (e) { if (snap) { histRestore(snap); view.armDrop() } HOOKS.histPush = push; HOOKS.renderInputs(); HOOKS.reflow(); throw e }
  finally { if (suppressHist) HOOKS.histPush = push }
  if (snap && protectedTouched(JSON.parse(snap), prot)) {
    /* [CMDL-FINISH] §6/N5 — THROW (a silent CmdRefused) instead of a soft return:
       commit's phase-6 rollback then restores EVERY enlisted store — the scheduler
       AND the weekstash a clear enlists — not just the scheduler runInputWrite
       could restore on its own (the C11 gap where the input batch rolled back but
       the stash drop, done outside it, stuck). The toast fires now (HOOKS.toast is
       not latched, so it survives the rollback); the wrapper repaints the reverted
       model. NO history step, nothing persisted — the write never happened. */
    HOOKS.toast('This week is locked — it was published by an older version and can’t be edited', 'warn')
    throw new CmdRefused('protected-week write refused')
  }
  HOOKS.renderInputs(); HOOKS.reflow(); HOOKS.histPush()
  return true
}

/* map a batch command's result to the caller's boolean. A refusal/rejection
   (ok:false, incl. the silent CmdRefused) reverted the model in phase-6 but ran
   no latched repaint, so repaint the reverted grid here and report false. */
function batchResult(r: CommitResult): boolean {
  if ((r as any).ok === false) { view.armDrop(); HOOKS.renderInputs(); HOOKS.reflow(); return false }
  return true
}

/* personal inputs (the Inputs page): mutate INPUTS, then the reference's
   add/delete epilogue — renderInputs(); reflow(); histPush(); */
export function writeInputs(fn: () => void): boolean {
  return batchResult(commitInputsWith([], SCHED_TYPES.inputsWrite, () => { runInputWrite(fn, false) }))
}

/* Same as writeInputs, but for an action that calls engine helpers which push
   history of their OWN (markEdit does). Without this a single ✓ left two
   snapshots, so the first Undo landed the user in a half-applied state they
   never created — old fields, but already un-accepted. One action, one step. */
export function writeInputsBatch(fn: () => void): boolean {
  return batchResult(commitInputsWith([], SCHED_TYPES.inputsBatch, () => { runInputWrite(fn, true) }))
}

/* [CMDL-FINISH] §6 — the off-week session-memory store, enlisted in an input
   batch (not a guarded store): a protected-week clear that drops a stashed week
   does so INSIDE the batch, so a phase-6 refusal rolls the drop back with it.
   ITS RECORDS ARE THE SAVED WEEK'S ROWS ([DB-READINESS] group A, phase 1 — plan §2.9): `weekstash/<wk>` (the week
   row), `weekstash/<wk>#<di>` (a day row), `weekstash/<wk>:is:<verId>~<n>` / `:rx:…` (an issued version, an
   Unpublish) — each value the stored row itself (state/weekrows.ts), so the row writer copies it as it is and an Undo
   names days. A preserved (read-only) week, and one that will not split, has no records: nothing may change it. */
const weekstashStore: EnlistableStore = {
  key: 'weekstash',
  capture: () => snapshotStash(),
  restore: (snap) => restoreStash(snap as any),
  records: () => {
    const m = new Map<string, RecordEntry>()
    for (const [wk] of stashEntries()) {
      if (isPreservedWeek(wk)) continue
      const rows = stashRows(wk)
      if (!rows) continue
      for (const sfx of Object.keys(rows)) m.set(`weekstash/${wk}${sfx}`, { collection: 'weekstash', id: wk + sfx, value: rows[sfx] })
    }
    return m
  },
  /* [GLOBAL-UNDO] §13 phase 1 — the undo/restore write() seam (finding I: an
     off-week edit captured on the stream round-trips through the stash).
     C7 — refuse writing the stash for the LOADED week: for CURWEEK the live
     DAYS/SCHED are authoritative and the stash blob is stale, so writing it
     would be silently lost (the next leave re-stashes the live week over it).
     An off-week undo applies to the stash while that week is off
     screen; the restore's loadContext must NOT load a weekstash-only context
     first (else it would make the target week CURWEEK and hit this guard).
     Each week's rows are put back, then joined into its saved copy; a week left with no rows is dropped. */
  write: (entries) => {
    const byWeek = new Map<string, Array<{ id: string; value?: any; op?: string }>>()
    for (const e of entries) {
      const wk = e.id.split(/[:#]/)[0]
      if (wk === CURWEEK) throw new CmdRefused(`weekstash write to the loaded week ${wk} — undo it from another week`)
      if (isPreservedWeek(wk)) throw new CmdRefused(`weekstash write to a read-only week ${wk}`)
      let l = byWeek.get(wk)
      if (!l) byWeek.set(wk, l = [])
      l.push(e)
    }
    for (const [wk, es] of byWeek) {
      const rows = { ...(stashRows(wk) || {}) }
      for (const e of es) { const sfx = e.id.slice(wk.length); if (e.op === 'delete') delete rows[sfx]; else rows[sfx] = String(e.value) }
      writeStashRecords(Object.keys(rows).length ? [{ id: wk, value: JSON.stringify(joinWeek(rows, wk)) }] : [{ id: wk, op: 'delete' }])
    }
  },
}
/* run an input batch that ALSO enlists extra stores (the weekstash), rolling
   every enlisted store back together on a refusal (§6, C11/N5). */
export function writeInputsBatchWith(stores: EnlistableStore[], fn: () => void): boolean {
  return batchResult(commitInputsWith(stores, SCHED_TYPES.inputsBatch, () => { runInputWrite(fn, true) }))
}
export { weekstashStore }
/* [CMDL-FINISH] §2.2 — the PROJECTION variant, for the LW-originated reconciler
   (historically sync.ts runOutbound — deleted in [ARCH-STACK] step 4; kept for any
   future LW-side reconciler) so its Raptor input write chains causally to the
   Leave War edit that triggered it, instead of standing as an orphan user edit. */
export function writeInputsBatchProjection(fn: () => void): boolean {
  return commitInputsProjection(SCHED_TYPES.inputsBatch, () => runInputWrite(fn, true))
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
  /* HOOKS.histPush, not the raw histPush: the storage seam's persist wrapper
     rides the hook, and the raw call left a reorder unsaved (8 Sep 26 bug pass) */
  commitSchedVoid(SCHED_TYPES.sectionMove, () => {
    if (moveSectionModel(DAYS[di], key, dir)) { HOOKS.histPush(); notify() }
  })
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
  return commitSchedValue(SCHED_TYPES.sectionReorder, () => {
    if (reorderSectionTo(DAYS[di], fromKey, toKey)) { HOOKS.histPush(); notify(); return true }
    return false
  })
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
  /* OWNER RULING 17 Sep 26: a session ending is NOT a boundary event — only the
     shared database registering a publish is. The old discloseCurrentIssued()
     call here is gone; see state/disclosure.ts. */
  authSetSession(s)
  view.bumpNav()                  // a session change invalidates a pending day-template-apply confirm (P2-REV2-07)
  view.setPage('viewsched')
  view.setBoardDay(null)          // also disarms a slot armed on the outgoing session's day
  view.selDrop()                  // SELID, SELSEEN, SELPREV, PFOCUS, WFOCUS, DWOPEN
  view.clearOtherHL()             // HLSET, SEARCH (and SELID again — harmless)
  view.armDrop()                  // ARM (belt-and-braces: setBoardDay only disarms if ARM was already set)
  /* every transient view-state field with a 'session' policy — the panel and
     preview sets, the board's History toggle, the carried day, the Inputs-page
     view (table/calendar/medical, its open month, its as-of date) and the
     Highlight-strip fold. The list and the reason each resets live in ONE place
     now, view.ts's VIEW_RESET, so this path and loadWeek can never drift apart.
     Runs AFTER setPage, which may itself have written CARRYDAY (closing the
     board carries its day) — the registry then clears it, matching the old
     order. The planning layer's pucks and remarks are deliberately NOT in the
     registry: since the storage seam they are saved squadron data like INPUTS,
     and clearing them here wiped the saved copy on the next history step
     (8 Sep 26 bug pass). */
  view.resetViewState('session')
  /* [ARCH-STACK] follow-up #1 (SR-007): re-sync the command layer's baseline after the view reset. The reset no longer
     touches WARNOFF (a hidden warning is kept through a sign-in — D469, 1 Oct 26), so this is a no-op for the hides; it
     stays as the belt for any future session-scoped field that rides the baseline. */
  resyncSchedBaseline()
  /* THE SIGNED-IN PERSON ([ACCOUNTS], D166 (3), 26 Sep 26): signing in makes you that
     callsign — `s.pid` is the account's person (null for someone signed in without
     access: pending, a guest, an account switched off). It is what every own-row rule
     asks (state/perms.ts), and what the Leave War's own-row rule reads (the sync mirrors
     it into the war's `viewer`). "View as" is retired, so nothing else sets it in
     production. A logout, or a headless call with no `pid` (the unit tests' bare
     { user, role }), puts back the headless default. */
  setMe(s && Object.prototype.hasOwnProperty.call(s, 'pid') ? s.pid : DEFAULT_ME)
  /* the undo list is per sign-in (13 Sep 26; D148 — "the list clears when they sign
     out"): the global undo never cleared it, so an admin signing in after a member
     could reverse the member's change (Fable R1-7, Astra R1-10) */
  endUndoSession()
  /* (every window and sheet the outgoing person left open closed above, in
     resetViewState('session') — ui/pops.ts registers its POPS_RESET list there, so
     the next person never inherits an open input editor, document or history list —
     Astra R1-3) */
  /* the Leave War page's role rides the Raptor session: an admin login is a
     Leave War admin, everyone else (and a logout) is a member. This is the
     ONE production writer of that role — the standalone app's own toggle was
     removed at the merge (see leavewar/ui/Chrome.tsx), and the leavewar
     store neither persists nor re-reads it, so nothing can disagree with
     the session that is actually looking at the page. */
  lwSetRole(roleOf(s) === 'admin' ? 'admin' : 'member')
  /* the Tracker tab rides the same seam (7 Sep 26), but reads NO role: admin
     and member have the same access there, File menu included (owner,
     23 Sep 26 — D121, superseding the 7 Sep "file portion is the admin's" lock
     that used to be written here and in toggleRole). What it takes from a
     login or logout is the end of its own SESSION — its undo history, open
     windows and modes (undo is per login session, owner 13 Sep 26;
     [HUMAN-RETEST] F10). The admin's member-view switch (switchRoleView, D292 — the old
     toggleRole's successor) does NOT end it: the same person looking through the other
     role's eyes. */
  endTrackerSession()
  /* THE CHANGE HISTORY IS KEPT ([DRAFT-PENDING], 28 Sep 26 — D336 (b), built on yes and put on his look card). It
     used to be cleared here — "a half-measure while the app has no server to keep a real per-person record". The one
     changes window IS that record now: every line names who made it (by person, D166 (5)), members read it too
     (D169), and what is NEW is per person (state/changes.ts), so the next person signing in sees the squadron's
     history as it is, with only other people's changes marked new to them. (Each line is saved as it is kept, inside its
     command, since [DB-READINESS] group A phase 4.3 — this flush has nothing left to write, and stays for its callers.) */
  elogFlush()
}

/* ---- THE ADMIN'S MEMBER VIEW (owner D292, 27 Sep 26 — "6. yes") -------------------
   The old role toggle (27 Aug 26) was removed with [ACCOUNTS] (D166 (3), "There isint a
   need for preview as a member"); D292 brings it back in the new form: an admin taps his
   name badge ("SABER · ADMIN" ↔ "SABER · MEMBER"; on a phone the drawer's switch) and the
   app behaves exactly as for a member; a tap switches back; every sign-in starts as admin.
   WHO may switch is perms.ts's (mayViewAsMember — the session's ACCOUNT is an admin's;
   switchRoleInForce refuses anything else, a hand-made call included). What moves is the
   role in force only; three pieces of state don't re-derive and are walked here, the
   resetSession discipline in miniature (the old toggle's list):
   - an admin-only PAGE left open (Edit Schedule, Admin) would render as a dead surface
     for the member view → View-only Sched;
   - an ARMED slot is edit machinery mid-gesture → disarm; the Logic tab's edit mode off;
   - an Admin → Users opening intent (ADMINOPEN) is admin-only → cleared.
   The Leave War's role follows the role in force through the same seam resetSession
   drives (lwSetRole — the SECOND production writer of that role, as it was). Deliberately
   NOT a resetSession: the week, the selection, the filters and the undo list all stay —
   the same person looking through the other role's eyes. It is not a logout either, so the
   Tracker's session and its unsaved-edits question are untouched (D129). This file never
   reads the session's role itself (the perms scan): it asks perms.ts. */
export function switchRoleView() {
  if (!mayViewAsMember()) return
  const toMember = isAdmin()
  if (!switchRoleInForce(toMember ? 'main' : 'admin')) return
  view.bumpNav()                  // a role change invalidates a pending day-template-apply confirm (P2-REV2-07)
  if (toMember) {
    if (view.CURPAGE === 'editsched' || view.CURPAGE === 'admin') view.setPage('viewsched')
    view.armDrop()
    setLgEdit(false)
    view.clearAdminOpen()
  }
  lwSetRole(isAdmin() ? 'admin' : 'member')
  notify()
}

/* ---- PER-WEEK SESSION STASH (the other half of the .wk selector) ----
   loadWeek used to always rebuild DAYS from weekBundle's PURE seed on a
   switch, which silently discarded any edit made to a week once you left it
   — reported bug: a duty added on the Sunday of an unauthored week vanished
   after scrolling one week forward and back. weekstash.ts is the dumb
   per-week store (keyed by week-start. CORRECTED 17 Sep 26: it is NOT
   session-only — the 8 Sep 26 storage work SUPERSEDED the forget-on-exit rule
   and persistAll now files every stash entry under weeks/<wk>. A week persists
   once it has CHANGED since load, or already had an entry; a pristine seed copy
   is still deliberately never written); these two helpers are the state-layer
   half that knows what belongs in a snapshot, because WARNOFF lives in
   state/view.ts and the engine may not import state/. */

/* Everything a week's own stash entry needs — DAYS plus the SIXTEEN SCHED
   fields (schedFields, shared with history.ts's histSnap so the two cannot
   drift; corrected 30 Sep 26 — it said fourteen) plus WARNOFF. Deliberately NOT `i:INPUTS`/`pp:PLANPUCKS`/`dm:DAYRMK`
   the way histSnap's whole-history snapshot is — those three are GLOBAL, not
   week-scoped (CLAUDE.md's "Personal INPUTS are GLOBAL" decision), and
   restoring them here would roll back edits made to them while the user was
   on a DIFFERENT week. */
/* A REQUEST A SCHEDULER TOOK OFF ('r' — slots.ts unacceptInput) stays off: the working-out after every command and at every
   load never lands an 'r' request (engine/overlay.ts viewOfWeek). The load's own list of them (takenOff, and the saved
   week's `un` before it) went with the load's landing pass ([DB-READINESS] group A, phase 6 (c)). */
/* THE WEEK'S COPY IN MEMORY IS ITS HOLDER BASE ([DB-READINESS] group A, phase 6 (c) v3 — state/holderbase.ts): the days and
   their marks as the holder last committed them, never the week as worked out on screen. So a return to the week, and every
   cross-week read of it, starts from what is stored and works the requests out again — as a reload does; a copy of the
   screen would carry a request's derived removal, and an Undo of it could never bring the exact row back (Astra's round 2). */
export function weekStashSnap() {
  const b = baseSnapshot()
  if (!b) return JSON.stringify({ d: DAYS, ...schedFields(), wo: [...view.WARNOFF] })
  return JSON.stringify({ d: b.d, ...schedFields(), c: b.marks.c, p: b.marks.p, ad: b.marks.ad, wo: [...view.WARNOFF] })
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
/* has the loaded week changed since it was loaded — the stash-on-leave
   yardstick, exposed for state/persist.ts (a pristine seed week is never
   persisted; see weekstash.ts's "persisted pristine copy is a trap") */
export function weekDirty() { return weekStashSnap() !== weekBaseline }


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
function applyWeekModel(v: any, opts?: { landLater?: boolean }): any {
  const stashedJson = stashGet(v)
  /* DISTINGUISH MISSING FROM UNREADABLE (P2-REV2-01). A week with NO stash entry
     is genuinely absent → load the pure seed, editable. A week WITH a stash entry
     that will not parse (truncated/foreign JSON) or parses without a days array is
     DAMAGED, not absent: it must NOT be treated as never-stashed and seeded over —
     that destroyed the saved book and let persistAll serialize the seed on top of
     it. It loads the seed as a best-effort placeholder VIEW, but its ORIGINAL
     bytes are byte-preserved below and the week is held read-only (protectedWeek
     via isPreservedWeek), so the damaged data round-trips untouched and no edit or
     seed re-serialization can overwrite it. */
  let s: any = null
  let unreadable = false
  /* PRESENCE is decided by the stored bytes, NOT by the parsed value's
     truthiness (P2-QREV-06): the JSON texts 'null'/'false'/'0' parse to falsy
     values that the old `stashedJson ? …` / `s && …` tests skipped, so a damaged
     record slipped to the seed branch and was overwritten. Any PRESENT blob that
     is not an object carrying a `d` days array is DAMAGED — preserved + read-only,
     never seeded over. */
  if (stashedJson != null) {
    try { s = JSON.parse(stashedJson) } catch (_e) { s = null; unreadable = true }
    if (!unreadable && (!s || typeof s !== 'object' || !Array.isArray(s.d))) { s = null; unreadable = true }
  }
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
    SCHED.sign = s.sg || {}; SCHED.signBind = s.sb || {}; SCHED.orig = s.o || {}; SCHED.cur = s.cv || {}
    SCHED.drafts = s.dr || {}; SCHED.curDraft = s.cd || {}; SCHED.ridV = s.v   // undefined on a foundation-era book → migrateLegacyIds runs
    SCHED.amV = s.am   // undefined on a PRE-Phase-2 book → amFormatOf flags it unsupported (read-only, §5)
    SCHED.retired = s.rt || {}; SCHED.correcting = s.cr || {}   // [GLOBAL-UNDO] §6.1 — issuance log + correction flags hydrate with the week
  } else {
    const wk = weekBundle(v)
    DAYS.length = 0; wk.days.forEach((d: any) => DAYS.push(d))
    DATES.length = 0; wk.dates.forEach((x: any) => DATES.push(x))
    resetSched()
  }
  /* PRESERVATION (P2-IMPL-02 + P2-REV2-01): byte-freeze the ORIGINAL blob so
     loadWeek skips its id migrations and state/persist.ts writes it back verbatim,
     never a re-serialization that would overwrite the recovery evidence, for
     EITHER quarantine case:
       · a restored book that classifies UNSUPPORTED (a pre-Phase-2 / wrong-week
         snapshot); or
       · a DAMAGED saved week (stash present but unreadable) — the seed loaded
         above is only a placeholder view; the real bytes are these.
     A missing week (no stash) or a clean current-format one is never preserved. */
  if ((unreadable && stashedJson) || (s && stashedJson && amFormatOf(SCHED, v) === 'unsupported')) setPreservedBlob(v, stashedJson)
  else clearPreservedBlob(v)
  /* WHAT A REQUEST OR A DELETE DOES TO THE WEEK IS WORKED OUT ON READ ([DB-READINESS] group A, phase 6 (c) and (d);
     data-model.md §9 rule 9). Neither writes the weeks — so the week is installed here AS STORED, and its caller (loadWeek,
     initStore) makes it the holder base and works it out (state/holderbase.ts: the requests' rows reconciled and landed, a
     deleted man taken off from his cutoff) once its row ids are minted, before the command layer's baseline: it is
     nobody's change, and the day's holder saves it, worked out, at his next change to that day. A byte-preserved
     (read-only) week is shown as it is saved. */
  /* INPUTS IS GLOBAL (owner, 22 Aug 26) — NOT swapped with the week. The
     Inputs page shows every week's inputs; each week's schedule still shows
     only its own because autoAcceptSeedInputs and the day builders match by
     date. `acc` records the LOADED week's landing only (weekctx.ts's own
     comment says the same) — clear it so autoAcceptSeedInputs (or the
     restore-landing pass below) re-derives it fresh for THIS week's DAYS,
     whichever shape they just took above. 'r' (removed — dormant, engine/
     inputs.ts inputDormant) and 'u' (FILED unavailable, engine/slots.ts
     acceptInput dest='u') are the two values that SURVIVE the clear: neither is
     a per-week ground-LANDING record — both are filing DECISIONS on the input
     itself. Only 'g' (the auto-landed ground row) is re-derived per week.
     Keeping 'u' is P2-IMPL-05: without it, navigation wiped a filed-unavailable
     input, so its issued filing fingerprint read fresh on return and a phantom
     amendment appeared from navigation alone. reconcileLandedAcc and
     autoAcceptInput both skip a truthy acc, so a kept 'u' is never re-landed. */
  /* Ground rows belong to the loaded week; acc belongs to the global input.
     A protected-spanning row keeps its filing even when this week has no landing. */
  INPUTS.forEach((r: any) => { if (r.acc && r.acc !== 'r' && r.acc !== 'u' && !inputProtected(r)) delete r.acc })
  mintInpIds()
  /* [ARCH-STACK] f/u#1 (F-01): the command-layer baseline advanced to the freshly-swapped week at once, so nothing that
     runs before the caller's own re-baseline diffs the OLD week against the new one */
  resyncSchedBaseline()
  return s
}
/* THE WEEK AS ITS HOLDER LEFT IT, THEN WORKED OUT — the week load's and the boot's last step before the baseline: the
   installed week becomes the holder base, and the pass works it out (state/holderbase.ts): each request's row reconciled
   with the request, a deleted man taken off, and every request with no row landed on its start day — a published day's
   only if its current issued version never saw it (the 16 Sep 26 rule, after a reload too). It is out of band and paints
   nothing (no mark on a day not published, no history line, no notify), so it needs no command: the sched.load command
   it replaces existed to latch the old landing's repaint. Nothing it does is saved — it is worked out again at every
   load. */
function workOutLoadedWeek(): void {
  /* the housekeeping the load's own command used to do at its apply-end, done here as the boot does it: every request's id
     and place, every planning note's place — or the next command would mint them inside itself, whoever's it is (a
     member's is then refused, §11 — found when sched.load went) */
  mintInpIds()
  mintOrd(PLANPUCKS, (p: any) => p.id)
  baseReset()
  rederive({ live: false })
  resyncSchedBaseline()
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
  /* a preserved (byte-frozen) week keeps its ORIGINAL blob in the stash, never a
     re-serialization of the un-migrated live model (P2-IMPL-02). */
  if (stashHas(CURWEEK) || leaveSnap !== weekBaseline) stashPut(CURWEEK, isPreservedWeek(CURWEEK) ? (preservedBlob(CURWEEK) ?? leaveSnap) : leaveSnap)
  /* WEEK NAVIGATION IS READ-ONLY ([DB-READINESS] group A, phase 1 — R3-01, F3-01). The week being left has nothing to
     save: every change to it went out, as its rows, with the command that made it; its saved copy above is memory.
     The arriving week is installed with no store enlisted across the change of week, and its landing pass runs as ONE
     `sched.load` command on its own fresh baseline — which SAVES NOTHING: the landing is worked out again at every load
     (state/persist.ts scheduleRows and the inputs mapper — the group-A final read, Fable F2, 30 Sep 26). A week never
     saved lands as part of the load and stays unsaved
     (a pristine week is never stored — weekstash.ts). The command needs the command layer idle: from inside another
     command it would join or queue behind it, so there the landing runs as part of the load, unsaved, and says so. */
  setCurWeek(v)
  /* OIL mode belongs to one day of ONE week, so it can never survive a week
     swap — whichever route got us here (Fable, 21 Sep 26). The board's own
     step clears it too; this is the backstop for every other caller. */
  view.setOilDay(null)
  HOOKS.weekSwapped()         // pan.ts drops its arrow-burst corridor (stale-target fix)
  const s = applyWeekModel(v)
  view.bumpNav()              // a week swap invalidates a pending day-template-apply confirm (P2-REV2-07)
  view.setBoardDay(null)      // closes the phone board and disarms
  view.armDrop()
  view.selDrop()
  view.clearOtherHL()
  /* every transient view-state field with a 'week' policy — declared once in
     view.ts's VIEW_RESET and shared with resetSession, so the two clear-lists
     cannot drift. Includes the "set default?" offer (keyed by day index, so it
     must not outlive its week), the palette day, the panel and preview sets,
     the History toggle and the carried day. The Inputs-page view and the
     Highlight fold are session-only and deliberately survive a week swap, so
     they are NOT in the 'week' scope. */
  view.resetViewState('week')
  /* WARNOFF is the one field a stash RESTORES: a scheduler who quieted a check
     on this week should not have it reappear just because they looked away and
     came back — re-add the stashed mutes right after the registry cleared them
     (weekStashSnap collected them on the way out). */
  if (s) (s.wo || []).forEach((k: any) => view.WARNOFF.add(k))
  /* stable row ids (engine/rowids.ts) BEFORE the baseline — same trap as
     initStore's: a mint after the yardstick would read a just-loaded,
     untouched week as edited and get it persisted.
     P2-IMPL-02: an UNSUPPORTED (pre-Phase-2) book is byte-frozen and read-only
     — skip EVERY id migration/normalization so DAYS/SCHED stay exactly as
     loaded; applyWeekModel registered its original blob and the row writer
     never writes it. Its ids cannot be safely re-keyed and it takes
     no new edit, so it needs none. */
  if (!protectedWeek()) {
    /* ADDRESSING BY rid (task 5): a FOUNDATION-era book (no ridV) re-minted its
       parked drafts, so its identities are inconsistent with keep-ids — strip
       them ALL first (gated on the version, so a modern book is never touched),
       then ensureRowIds + backfill rebuild one consistent id-space by position. */
    const wasLegacy = migrateLegacyIds(SCHED, DAYS)
    ensureRowIds(DAYS)
    /* THE BACKFILL (review finding 6, engine/rowids.ts backfillSnapshotIds):
       a week's amendment book — SCHED.orig, every AL's day snapshots, the
       drafts — rides this same stash, so a book written before ids existed
       must be given them here too, still before the baseline, or every
       restore off it would mint a fresh id instead of the stable one. */
    backfillSnapshotIds(SCHED, DAYS)
    /* ADDRESSING BY rid (task 5): rewrite a positional book to rid form — ONLY
       when this boot actually upgraded a legacy book. A modern book is already
       rid-keyed (every runtime write goes through ridWriteKey), and re-running
       the rewrite every boot would let a leftover positional-fallback key
       silently RE-BIND to whatever new row later occupies that index (a stale
       AL structAdd claiming a fresh row). Runs AFTER the backfill (every row has
       a rid) and BEFORE the baseline (so the re-keying is not read as a dirtying
       edit). */
    if (wasLegacy) migrateBookKeys(SCHED, DAYS)
  }
  /* the week as stored becomes the holder base, and is worked out (requests' rows, a deleted man) */
  workOutLoadedWeek()
  weekBaseline = weekStashSnap()   // the stash-on-leave yardstick (see its comment)
  validate()
  histInit()                  // new baseline for this week — Undo starts here
  notify()
}

/* ---- wiring ---- */
let ELOG_ADOPT_WIRED = false
export function wireStore() {
  /* [ARCH-STACK] Step 2: register the scheduler's command layer (permissions,
     records, guarded store, the HIST.lock suppression context). Idempotent. */
  registerSchedCommandLayer()
  /* phase 3: the PEOPLE + SETTINGS command layer (their own enlistable stores,
     record registry, permissions). Idempotent. */
  registerPeopleSettingsCommandLayer()
  registerMissionRoles()
  /* [ACCOUNTS] D200 (3): the command gate's authority is the ONE permissions matrix
     (state/perms.ts, which mirrors data-model.md §11). From here on every non-system
     command — the scheduler's, the roster's, the settings', undo's, the Leave War's
     and the Tracker's — is decided by perms.ts COMMAND_OPS; a type it does not know is
     refused. */
  setPermissionResolver(cmdAuthorize)
  /* and what a member's command actually changed — never another person's record
     (perms.ts ownershipViolation; a HARD invariant, so a breach rolls it back) */
  defineInvariant({ id: 'member-writes-own', cls: 'hard', check: ownershipViolation })
  /* the reference's editMode(): the edit page is open. The reference also
     ANDed its #editToggle switch here; that toggle was removed 9 Aug 26
     (owner) — being on Edit Schedule is the intent to edit, and View-only
     Sched is the read-only mode. The role test is this port's own addition:
     a session change on the SAME running page (logout/login without a
     reload) can leave CURPAGE sitting on 'editsched' from the outgoing user.
     editMode() is what drives every data-drag="1" / contenteditable="true"
     attribute in html.ts, so one canEditSched() check here closes them all at
     once rather than patching each rendered surface individually.
     `!protectedWeek()` makes a PRE-Phase-2 (unsupported) week READ-ONLY (§5,
     P2-R3-02): its data cannot be safely re-keyed by the new engine, so no new
     edit is accepted onto it (its existing content round-trips untouched, and
     the verId resolvers already suppress publication for it). Inert for every
     current-format week — amFormatOf only flags a content-bearing un-stamped
     book, which a fresh book never is. */
  HOOKS.editMode = () => canEditSched() && view.CURPAGE === 'editsched' && !protectedWeek()
  HOOKS.reflow = () => { validate(); notify() }
  HOOKS.renderStatus = () => notify()
  /* [ARCH-STACK] Step 2 (additive): latch histPush while a commit is in flight,
     so a rolled-back command takes no undo snapshot; the deferred call carries
     the HIST.lock token captured at raise time (registerEffectContext), so a
     lock-wrapped batch still records exactly as today. Outside a commit it runs
     inline, unchanged. */
  HOOKS.histPush = () => { if (!deferEffect(histPush)) histPush() }
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
  /* the name the edit log (and a bug report, and the Tracker's mark stamps) records:
     since [ACCOUNTS] (D166 (5), 26 Sep 26) the signed-in CALLSIGN — replacing D104's
     shared "Admin" / "Squadron member". A guest reads "Guest". */
  HOOKS.whoami = () => {
    if (!SESSION) return 'Unknown'
    if (roleOf() === 'guest') return 'Guest'
    const pid = me()
    const p = pid ? (PEOPLE as any)[pid] : null
    return p ? String(p.cs) : String(SESSION.name || SESSION.user)
  }
  /* the person behind whoami — kept beside the name on every record that stores a
     "who", so a callsign rename moves nothing and a reused callsign inherits nothing
     (the one-identity rule; Astra R1-9) */
  HOOKS.whoamiId = () => me()
  /* a line written while a command runs is kept only if the command commits ([DRAFT-PENDING] — the history is
     durable now, so a refused command's lines would otherwise stand for good) */
  setElogDefer(deferEffect)
  /* …and a line kept with no command running (an idle toggle's line, the Admin → Data history sweep) is written inside
     a command of its own, so it is a saved group with its change-log batch, never a bare write ([DB-READINESS] group A,
     phase 4.3). The app's own act (the system actor): the line itself names who did it. */
  /* …except the Admin → Data history sweep, which is the admin's own act: it runs as HIM (origin `projection`, so it is
     no Undo step), and its change-log batch names who cleared the history (the group-A final read, Fable F1 step 4,
     30 Sep 26). Its authority is perms.ts COMMAND_OPS — a delete on EditLog, an admin's alone. */
  setElogDoor((type, fn) => {
    const cmd = { type, scope: { module: 'settings' }, apply: () => { fn() } } as any
    const actor = deriveActor()
    if (type === 'elog.sweep' && actor.role !== 'system') { commitAs(cmd, { actor, origin: 'projection' }); return }
    commitProjection(cmd)
  })
  definePermission('elog.sweep', anyone)
  /* …and a line given just BEFORE its command opens (the board's in-place edits, a text box) joins that command's group
     (engine/editlog.ts hold — the group-wide walk's finding H2) */
  if (!ELOG_ADOPT_WIRED) { ELOG_ADOPT_WIRED = true; onPipelineBegin(elogAdoptHeld) }
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
/* `seedDemo` — the boot policy's ([DB-READINESS] group A, phase 5 — src/bootpolicy.ts): false on a shared store, where
   the demo merges below never run (the landing pass still does — it lands REAL requests too: P5-LANDING, Fable F3-04)
   and the accounts read no seeded list. The default is the demo, as every test and his preview have always booted. */
export function initStore(policy: { seedDemo: boolean } = { seedDemo: true }) {
  wireStore()
  setAccountSeeds(policy.seedDemo)
  /* every person's place in the roster's order, before the people baseline is taken ([DB-READINESS] group A, phase 2) */
  mintPeopleOrd()
  /* [ARCH-STACK] Fable-5: the people command layer captured its baseline from the
     SEED roster when this module was imported (wireStore runs at eval, before boot);
     hydrate() has since replaced PEOPLE with the stored roster. Re-sync now — this
     runs after hydrate() in main.tsx's boot — so the first people command diffs
     against the real roster, not the seed. */
  resyncPeopleBaseline()
  rulesLoad()
  insightsLoad()
  flyplanLoad()      // the flying plan is re-read from the rows this store holds (state/flyplan.ts)
  storesLoad()
  lookaheadLoad()
  cxReasonsLoad()
  dutyTplLoad()
  waveTplLoad()
  dayTplLoad()
  qualColsLoad()
  /* the admin-set DEFAULT arrangement (owner, 29 Aug 26 pt.2) — the global section
     order secOrder falls back to, and the global wave order a new wave is placed by.
     Both default to "un-customised" (canonical sections / no wave order = append),
     so a squadron that never touches the Admin panel behaves exactly as before, and
     the never-booting parity harness stays blind to them. */
  secDefaultLoad()
  waveDefaultLoad()
  /* [ACCOUNTS] (26 Sep 26): the accounts, the access requests and the guest switch
     (three durable settings keys) load here like every other setting. The loader sat
     only in the settings rollback list, so a built site forgot every account the admin
     added at the next reload — found by the walk, not by any test (every test ran in
     one page life). After hydrate(): the lock-out check reads the stored roster. */
  accountsLoad()
  /* THE CHANGE HISTORY ([DRAFT-PENDING], 28 Sep 26 — D336 (b)): saved, so it is loaded here with every other setting */
  elogLoad()
  changesLoad()
  /* the lines the cell funnels never see — absences, the Leave War, Quals, a publish — from the command stream */
  registerChangeLines()
  /* THE SEED MERGES ARE SKIPPED WHEN STATE CAME BACK FROM STORAGE (the
     storage seam, 8 Sep 26). A hydrated INPUTS already carries every week's
     rows and the demo SANS/medical lifecycle that were saved last session;
     re-running the seeds here would push the demo rows back on top of a
     roster the squadron has since curated. When NOT hydrated (a fresh
     backend) they run exactly as before, which is what keeps the un-booted
     parity harness and stores-boot.test.ts unchanged. */
  if (!isHydrated() && policy.seedDemo) {
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
    /* one input filed for several people, so every list shows a shared input from the first look (state/demoseed.ts) */
    seedDemoGroup()
    /* who placed each demo input, and when — made up, as they are (D629; state/demoseed.ts says why and what it never
       does). After the seeds above, so every one of their rows is there to stamp. */
    seedDemoStamps()
  }
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
  mintInpIds()   // …and every request's place in the list, minted with its id ([DB-READINESS] group A, phase 2)
  /* every planning note's place, for the same reason */
  mintOrd(PLANPUCKS, (p: any) => p.id)
  /* land every activity input on its day's ground programme before the first
     validate + baseline — boot-only, so parity (which never boots) stays blind;
     SCHED is fresh here, so every day reads editable. See autoAcceptSeedInputs. */
  /* a week that came back from storage (state/persist.ts hydrate stashed
     it) is restored exactly as loadWeek would — applyWeekModel also
     re-lands the inputs — otherwise the seed lands as before */
  /* …and its HIDDEN WARNINGS with it ([WARN-HIDE-KEPT], owner D469, 1 Oct 26 — "it can be hidden until another person
     unhides it"): the week's saved hides (`wo`) go back into the set BEFORE the baseline below, exactly as loadWeek does.
     The boot used to throw this return value away — the hides were not only unread: the baseline was then taken without
     them, so the next edit of that day rewrote its row with none and they were gone from storage for good. */
  view.WARNOFF.clear()
  const booted = stashHas(CURWEEK) ? applyWeekModel(CURWEEK) : null
  if (booted) ((booted as any).wo || []).forEach((k: any) => view.WARNOFF.add(k))
  if (!stashHas(CURWEEK)) {
    /* CLEAR a hydrated 'g' BEFORE the seed lands (13 Sep 26, Astra/Fable inspect
       SID-IR-01/finding 5). INPUTS is global and persisted with its acc; a
       pristine CURWEEK is deliberately NOT stashed, so on a plain reload the
       accepted inputs come back 'g' while the seed week has no rows for them —
       and autoAcceptSeedInputs skips a truthy acc, leaving every auto-landed
       input "accepted with no ground row" (the validator/picker then lose those
       commitments). applyWeekModel already does this clear for a stashed week
       (its INPUTS acc-clear above reconcileLandedAcc); mirror it here so the
       no-stash boot re-lands too. 'r'/'u' are deliberate decisions, kept. */
    INPUTS.forEach((r: any) => { if (r.acc && r.acc !== 'r' && r.acc !== 'u' && !inputProtected(r)) delete r.acc })
  }
  /* stable row ids (engine/rowids.ts) BEFORE the baseline: the walk mutates
     DAYS, and a mint after the yardstick would make the pristine seed week
     read as edited and get persisted — the trap weekstash.ts documents */
  /* ADDRESSING BY rid (task 5) — same as loadWeek's twin: a foundation-era book
     (no ridV) has inconsistent identities, so strip them first (gated on the
     version), then rebuild one id-space via ensureRowIds + backfill. */
  const wasLegacy = migrateLegacyIds(SCHED, DAYS)
  /* the boot reads the built-in week from the module's own literal, not from weekBundle — give its rows the same
     repeatable ids weekBundle hands out (W8; engine/weeks-data.ts seedRids), before the random mint below */
  if (!stashHas(CURWEEK)) seedRids(DAYS, CURWEEK)
  ensureRowIds(DAYS)
  /* THE BACKFILL — same reasoning as loadWeek's own call just above this
     comment's twin: SCHED can arrive here already carrying an amendment book
     (a hydrated boot, engine/rowids.ts backfillSnapshotIds's own header) from
     before ids existed, and it must be given them before the baseline too. */
  backfillSnapshotIds(SCHED, DAYS)
  /* ADDRESSING BY rid (task 5) — same as loadWeek's twin above: rewrite a
     positional book to rid form ONLY on an actual legacy upgrade, never every
     boot (a modern book is already rid-keyed, and re-running would let a
     leftover positional-fallback key re-bind to a later row). */
  if (wasLegacy) migrateBookKeys(SCHED, DAYS)
  /* the week as stored (or the seed) becomes the holder base, and is worked out — the seed week's requests land here, a
     deleted man goes (phase 6 (c), (d)) */
  workOutLoadedWeek()
  weekBaseline = weekStashSnap()   // the stash-on-leave yardstick (see its comment)
  validate()
  histInit()
  notify()
}
wireStore()

/* the store's public surface: the writes above, plus the engine's publish
   actions and the history verbs, re-exported so the UI has one import.
   markEdit stays the raw engine action; the publish verbs the UI calls are the
   command-routed wrappers (phase 2b — additive: they run the SAME engine
   setDayApproved/publishALDay inside commit()). */
export { markEdit } from '../engine/publish'
export {
  commitSetDayApproved, commitPublishALDay,
} from './sched-commit'
/* the quarantine classifier lives in the engine (so the engine's filing
   primitives share it) but the UI imports it from here, its established home.
   protectedDates is imported above for internal use (runInputWrite) and
   re-exported here so ui/inputedit.tsx and ui/InputsPage.tsx keep their import. */
export { protectedDates }
export { inputProtected, stashProtected } from '../engine/quarantine'
export { undo, redo, histInit, histApply, HIST } from './history'
export { armSlot, disarmSlot, armedKey, placeArmed, selectPerson, selKeep, selRestore, selClear, selDrop, setBoardDay, setPage, afterSchedMutate } from './view'
export { setSession, canEditSched, LGEDIT, setLgEdit } from './auth'
