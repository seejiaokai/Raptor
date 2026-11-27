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
import { slotVal, setSlotVal, fillSlot, txtSet } from '../engine/slots'
import { validate } from '../engine/validate'
import { lookaheadLoad } from '../engine/lookahead'
import { rulesLoad } from '../engine/rules'
import { flyplanLoad } from './flyplan'
import { unitsLoad, setUnitSeeds, homeOn, todayIso, unitById } from './units'
import { UNIT, BOOT_UNIT, setUnitInView, inView } from '../engine/unitview'
import { isUnitId } from '../storage/unitid'
import { insightsLoad } from '../engine/insights-config'
import { registerMissionRoles } from './mission-roles'
import { mintInpIds, INPUTS, inputsOnFirstDay, inputsOnDay, inputAtIso, DATES, baseYear, dateIx, inputCoversDate, inpId, shapeProblem, tillSettle } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { ensureRowIds, backfillSnapshotIds, migrateBookKeys, migrateLegacyIds } from '../engine/rowids'
import { CURWEEK, setCurWeek } from '../engine/waves'
import { weekBundle, otherWeekInputs, seedRids } from '../engine/weeks-data'
import { seedDemoSans, seedDemoMedical, seedDemoStamps, seedDemoGroup, seedDemoPlaceholders, seedDemo149 } from './demoseed'
import { docAdd } from './docs'
import { storesLoad, cxReasonsLoad, dutyTplLoad, waveTplLoad, dayTplLoad, secOrder, moveSectionModel, reorderSectionTo, secDefaultLoad, waveDefaultLoad } from '../engine'
import { qualColsLoad } from '../engine/qualcols'
import { elogFlush, elogLoad, setElogDefer, setElogDoor, elogAdoptHeld } from '../engine/editlog'
import { changesLoad } from './changes'
import { noticeSeenLoad } from './noticeseen'
import { registerChangeLines } from './changelines'
import { markDeletion, resetSched, SCHED, dayApproved, protectedWeek, amFormatOf, lockedWeekNote } from '../engine/publish'
import { inputProtected, protectedDates } from '../engine/quarantine'
import { stashPut, stashGet, stashHas, setPreservedBlob, clearPreservedBlob, isPreservedWeek, preservedBlob } from '../engine/weekstash'
import { baseReset, baseSnapshot, rederive } from './holderbase'
import { stashRows, joinWeek } from './weekrows'
import { afterSchedMutate } from './view'
import * as view from './view'
import { histPush, histInit, histSnap, histRestore, schedFields } from './history'
import { setSession as authSetSession, canEditSched, SESSION, setMe, DEFAULT_ME, setLgEdit } from './auth'
import { me, roleOf, isAdmin, mayViewAsMember, switchRoleInForce, pageUnit, lwUnitNow, trkUnitNow, pickStandsOn, maySchedEditPage, trackerCoverKind, pageOffered, myUnit, heldByMemberView } from './perms'
import { holdNow, setBands, warBand, setHoldRelease, setEnteredByPick, enteredByPick, pickBand, memberViewBand, schedMoveBand, type MoveBand, type HoldKind, type TrkCover } from './typing-hold'
import { endUndoSession } from '../undo/timeline'
import { setRole as lwSetRole } from '../leavewar/state/store'
import { endTrackerSession, trackerSwitchAsk, trackerSwitchNeeds } from '../tracker/role.js'
import { refuse, closeShown, type GuardOpts } from './guard'
import { saveGoing, waitForSave, dropDoorWait } from './doorwait'
import { rebindStorageUnit, storageHeld } from '../tracker/storage.js'
import { isHydrated, hydratePlan, hydrateRolesFor, persistWb } from './persist'
import { deferEffect, CmdRefused, setPermissionResolver, commitProjection, onPipelineBegin, deriveActor, definePermission, anyone, activeEnvelope, isCommitting } from '../command'
/* internal wiring may raise a command as a named person (command/index.ts — commitAs stays off the public surface) */
import { commitAs } from '../command/commit'
import { defineInvariant } from '../command/harness'
import type { CommitEnvelope } from '../command/types'
import { cmdAuthorize, ownershipViolation, elogUnitAllowed, elogWriteProblem, elogOwnUnit } from './perms'
import type { EnlistableStore, RecordEntry, CommitResult } from '../command'
import { snapshotStash, restoreStash, stashEntries, writeStashRecords } from '../engine/weekstash'
import { registerSchedCommandLayer, commitSchedVoid, commitSchedValue, commitInputs, commitInputsProjection, commitInputsWith, SCHED_TYPES, resyncSchedBaseline } from './sched-commit'
import { resyncPeopleBaseline, mintPeopleOrd, reloadUnitSettings, setElogWriteGuard } from './people-settings-commit'
import { registerPeopleSettingsCommandLayer } from './people-settings-wire'
import { mintOrd } from '../command/ord'
import { PLANPUCKS, DAYRMK } from './plan'
import { keepPlan, keptPlan, forgetKeptPlans, dropStoredPlan, setPlanStoreDoor } from './plan-foreign'
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
function realNotify() { maybeReenter(); landOffEditSched(); landOnOfferedPage(); publishBands(); VERSION++; listeners.forEach(f => f()) }
/* THE PAGES A SQUADRON HE ONLY VIEWS OFFERS (his D2381 — its View-only Sched and Help alone; perms.ts viewOnlyPick,
   pageOffered), a standing check on every notify, beside the Edit Schedule landing above:
   - the squadron in view moved, or his rights did, under a page it does not offer (a pick — enterSquadron below lands
     the pick itself; a Plan lowered; the member view switched on) → its View-only Sched;
   - he opened one of his own pages from elsewhere — a bell line, a link, the OIL list, "Check my quals" — while it was
     picked (the page moved, the squadron did not) → his own squadron comes back into view, the page opened: those pages
     are always his own squadron's for a View holder (perms.ts pageUnit 'own'), and landing him on 149's schedule
     instead would drop the tap. */
let LANDED = { unit: '', page: '' }
/* an open Leave War window holds the landing while it is up — its words and its band stay in sight (D2243, D2323); once
   the last one goes the page is told, band or no band (the release handed to typing-hold.ts, at this file's
   setHoldRelease), and the landing runs then (the fresh Opus read of 23 Nov 26, F1; the fix rounds' read, Astra 1) */
const warHeld = (): boolean => view.CURPAGE === 'leavewar' && holdNow() === 'war'
function landOnOfferedPage(): void {
  const opened = view.CURPAGE !== LANDED.page && UNIT === LANDED.unit
  if (!pageOffered(view.CURPAGE) && !warHeld()) {
    if (opened && !ENTERING) landOnOwnPage()
    else view.setPage('viewsched')
  }
  LANDED = { unit: UNIT, page: view.CURPAGE }
}
/* HIS OWN SQUADRON COMES BACK FOR THE PAGE HE OPENED — but where the Tracker is held on the squadron in view for his
   unsaved chart edits (the member view), entering would drop them, so it asks first, the pick's own question over the page
   he is on (his D2318, D2637; the night of 24 Nov 26, Opus F1, Fable F1). He stays where he was until he answers: Save or
   Discard opens the page he tapped; Stay, or a Save the gate refuses, leaves him there with the draft. */
/* THROUGH THE PAGE DOOR (step K6 — the guard rail's plan §4.2 steps 5 and 6, §4.5 steps 3 and 5): a landing a door's press
   made (`kept` — the door and its opts, handed over by setPage below) ends the windows that only show things and the two
   edit modes in the run that enters his own squadron, never earlier: after the Tracker's question, so a Stay closed
   nothing; and after that question is answered Save or Discard it asks the guard again with the door it kept — a window
   or a failed save may have arrived while the question stood — and waits again for a save still going. Refused: nothing is
   entered, the page stays as it was, and the press's `then` never runs. A landing no door made (a test's raw page change)
   is as before. `want` — the page he opened; null for a press that opens no page (ownSquadronFirst). */
function landOnOwnPage(): void {
  const asked = landOwn(view.CURPAGE, KEPT)
  if (asked) LANDASK = asked
}
function landOwn(want: string | null, kept: KeptDoor | null): Promise<boolean> | null {
  const home = myUnit(todayIso())
  const trk = trkUnitNow()
  const asked = storageHeld() && trk && trk !== home ? trackerSwitchAsk(String(unitById(home)?.num ?? home)) : null
  if (!asked) { if (kept) closeShown(); enterSquadron(home, holdNow() === 'war', true); return null }
  if (want != null) view.setPage(pageOffered(LANDED.page) ? LANDED.page : 'viewsched')
  const done: Promise<boolean> = asked.then(go => {
    if (LANDASK === done) LANDASK = null
    return go ? landAfterAsk(want, kept, home) : false
  })
  return done
}
function landAfterAsk(want: string | null, kept: KeptDoor | null, home: string): boolean | Promise<boolean> {
  if (kept && refuse(kept.door, home, kept.opts)) return false
  if (kept && saveGoing()) return waitForSave().then(r => r === 'go' && landAfterAsk(want, kept, home))
  if (kept) closeShown()
  enterSquadron(home, holdNow() === 'war', true)
  if (want != null) view.setPage(want)
  notify()
  return true
}
/* …AND A TAP THAT OPENS A WINDOW ON THAT PAGE WAITS WITH IT (the night of 24 Nov 26, the re-walk's B1 — a bell line's
   input): while the question above is up this is its answer still to come — true once Save or Discard has opened the page
   he tapped, false after Stay or a refused Save; null with nothing asked. The window opened before the page was there
   stood under the question, noted as opened on the squadron he was leaving (ui/topstate.ts openInputOnPage). */
let LANDASK: Promise<boolean> | null = null
export const landingAsk = (): Promise<boolean> | null => LANDASK

/* ---- THE PAGE DOOR (step K6 — the guard rail's plan §4.1 rows 7–13 and 22, §4.2, §4.5; his D2403, D2590, D2627 A8, A9,
   A11, A19, D2621, D2729 Q7) ----
   A press that opens one of his own pages while a squadron he only views is picked brings his own squadron back (the
   landing above, landOnOwnPage). Before this step nothing was asked: the bar went to 142 with a window open, a row
   changed or a save failed, and whatever the press opened after its page — an input's window, its OIL question, its
   toast — opened all the same, a window standing live beside the "Blocked:" note when only the page was refused. So
   every page change by a press comes through setPage below, the door, which asks the guard where the page is one the
   squadron in view does not offer — exactly what the landing itself acts on (pageOffered) — and RUNS WHAT THE PRESS
   OPENS AFTER ITS PAGE (`then`), so nothing can open behind a refusal: `then` runs in one state only, the page asked for
   is the page shown. Its three answers: 'went' (the page is there, `then` has run), 'asked' (the Tracker's question, or a
   save still going: `then` runs once that is answered and the page is there), 'refused' (the note said, nothing changed,
   `then` dropped). ownSquadronFirst is the same door for a press that opens a window and no page (the holiday's line);
   ownPageRefused and ownSquadronRefused are its test alone, for a caller that sets something before the page (a line
   read, an intent, a tab and month) and so must ask first.
   The two rules for a caller (§4.5): what it sets before the page, it asks about first; what it opens after the page, it
   hands to the door as `then`. Inside this file the landings, the entry and the session reset keep calling view.setPage:
   the app's own moves, never a press (§4.1 row 20). */
export type PageGo = 'went' | 'asked' | 'refused'
/** a door's opts at the page door: which door the press came by (its note's ending and place — 'line', 'bell', 'card'; a
 *  plain page change 'page') with the guard's own opts (the pressed line, the rows it leaves out) */
export type PageOpts = GuardOpts & { door?: string }
type KeptDoor = { door: string; opts: GuardOpts }
/* the door and opts a passing press is going through, kept for the landing's second ask (§4.5 step 3) */
let KEPT: KeptDoor | null = null
/* THE PRESS THIS TURN WENT THROUGH (the kept door's source when a caller names none): a caller that asks first with its own
   door — a bell line ('line', its line), the bell ('bell') — then reaches a function of its own that asks again and
   changes the page with no door named (openAdminUsers, openWarAt). The second ask passes in the same turn; this keeps
   the first ask's door, so a refusal after the Tracker's question still says the line's or the bell's own ending, at its
   own control, never the page door's silence. Good for the synchronous turn it was set in. */
let PRESSED: KeptDoor | null = null
function pressDoor(door: string | undefined, opts: GuardOpts | undefined): KeptDoor {
  if (door === undefined && PRESSED) return PRESSED
  const k: KeptDoor = { door: door ?? 'page', opts: opts ?? {} }
  if (!PRESSED) { PRESSED = k; queueMicrotask(() => { PRESSED = null }) }
  return k
}
const doorOf = (o: PageOpts): { door: string | undefined; opts: GuardOpts | undefined } => {
  if (!o || Object.keys(o).length === 0) return { door: undefined, opts: undefined }
  const { door, ...g } = o
  return { door, opts: g }
}
/* the squadron in view is not his own pages' (a squadron he only views, or the member view's schedule of another) */
const awayFromOwn = (): boolean => UNIT !== pageUnit('own')
/* the door's ask, its note, and — where `again` is handed over — the wait for a save still going, the press run again
   once the saver has answered (§4.2 step 3; state/doorwait.ts, the doors' one wait) */
function ownRefused(k: KeptDoor, again?: () => void): boolean {
  if (refuse(k.door, myUnit(todayIso()), k.opts)) return true
  if (again && saveGoing()) { void waitForSave().then(r => { if (r === 'go') again() }); return true }
  return false
}
/** would the page door refuse `p` — asking, saying the note, changing nothing; a caller that sets something before the
 *  page calls it as its first statement and returns on true. `again` (the press run again) lets it wait for a save */
export function ownPageRefused(p: string, door?: string, opts?: GuardOpts, again?: () => void): boolean {
  if (p === view.CURPAGE || pageOffered(p)) return false
  return ownRefused(pressDoor(door, opts), again)
}
/** the same test for a press that brings his own squadron back without a page (the holiday's line) */
export function ownSquadronRefused(door?: string, opts?: GuardOpts, again?: () => void): boolean {
  if (!awayFromOwn()) return false
  return ownRefused(pressDoor(door, opts), again)
}
/** THE PAGE DOOR — every page change by a press */
export function setPage(p: string, o: PageOpts = {}, then?: (waited: boolean) => void): PageGo {
  if (p === view.CURPAGE || pageOffered(p)) {
    view.setPage(p)
    if (then) { notify(); then(false) }
    return 'went'
  }
  const { door, opts } = doorOf(o)
  return ownFirst(p, pressDoor(door, opts), () => { setPage(p, o, then) }, then)
}
/** THE SAME DOOR FOR A PRESS THAT OPENS A WINDOW AND NO PAGE (the holiday's bell line, D2627 A19): on his own pages'
 *  squadron `then` runs at once; on another, his own squadron comes back first — the guard, the wait, the Tracker's
 *  question and the second ask — and `then` only once it is in view */
export function ownSquadronFirst(o: PageOpts, then: (waited: boolean) => void): PageGo {
  if (!awayFromOwn()) { then(false); return 'went' }
  const { door, opts } = doorOf(o)
  return ownFirst(null, pressDoor(door, opts), () => { ownSquadronFirst(o, then) }, then)
}
/* one body for both (§4.5: the page door is ownSquadronFirst plus view.setPage, so the two can never differ) */
function ownFirst(p: string | null, k: KeptDoor, again: () => void, then?: (waited: boolean) => void): PageGo {
  if (refuse(k.door, myUnit(todayIso()), k.opts)) return 'refused'
  if (saveGoing()) { void waitForSave().then(r => { if (r === 'go') again() }); return 'asked' }
  const was = LANDASK
  let asked: Promise<boolean> | null
  if (p != null) {
    KEPT = k
    try { view.setPage(p); notify() } finally { KEPT = null }
    asked = LANDASK !== was ? LANDASK : null
  } else {
    asked = landOwn(null, k)
    if (asked) LANDASK = asked
    else notify()
  }
  if (asked) { void asked.then(go => { if (go) then?.(true) }); return 'asked' }
  /* (the page asked for is the page shown — or, with no page, his own squadron is in view — before `then` runs) */
  if (p != null ? view.CURPAGE !== p : awayFromOwn()) return 'refused'
  then?.(false)
  return 'went'
}
/* THE LANDING IS A STANDING CHECK (the second-half plan §2 item 3, §15 D8; D2253): wherever the page is Edit Schedule and
   he is not an admin of the squadron in view (perms.ts maySchedEditPage) — a pick of a squadron he holds View of, R6's
   re-entry, a Plan lowered while he is on the page — he lands on View-only Sched. Run after every enterSquadron and on
   every notify. The Admin page's half (refreshAccess, switchRoleView below) keeps asking the role. */
function landOffEditSched(): void {
  /* the squadron's question only: the role in force is an admin's (a member's landing is the role's, refreshAccess and
     switchRoleView below; nobody signed in — a headless test — is no one's page) */
  if (view.CURPAGE === 'editsched' && isAdmin() && !maySchedEditPage()) view.setPage('viewsched')
}
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
  /* a place on a row that came from an input: the INPUT changes, through its door (owner D755; first D734 —
     ui/reqdoor.ts rowWrite, lent through HOOKS.inputRow as the typed box's door is). Its answer is this writer's: never
     on to setSlotVal, which refuses such a place (the belt, engine/slots.ts inputSeatBar). */
  if (HOOKS.inputRow && HOOKS.inputRow.write(key, id) !== 'none') return
  /* [ARCH-STACK] Step 2 (additive): the identical write, now inside commit() —
     enlist snapshot, run setSlotVal+afterSchedMutate exactly as before, emit the
     record-level change. The legacy histPush/persistAll/undo stack still run. */
  commitSchedVoid(SCHED_TYPES.slot, () => { setSlotVal(key, id); afterSchedMutate() })
}

/* a people cell ("first free seat, else add one more") */
export function writeFill(key: any, id: any) {
  if (HOOKS.inputRow && HOOKS.inputRow.write(key, id) !== 'none') return     // someone on an input's row: the input's door (D755)
  commitSchedVoid(SCHED_TYPES.fill, () => { fillSlot(key, id); afterSchedMutate() })
}

/* an inline text field; txtSet reports whether the model actually moved */
export function writeText(path: any, v: any) {
  /* a request's row: its name, its times and its remark are the REQUEST's (owner D739, D740) — the door is asked first
     (ui/reqrow.ts, lent through HOOKS: state/ may not import ui/), and its answer is this writer's: the request moved,
     or nothing did. Never on to txtSet, which refuses such a box (the belt). */
  const rq = HOOKS.reqRowText ? HOOKS.reqRowText(path, v) : 'none'
  if (rq !== 'none') return rq === 'saved'
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
/* THE REQUESTS THE LOADED WEEK LANDS — each read on its FIRST day, the day a request lands (the reshape plan §3.2 A-iii;
   Fable F4): a body that rewrites an input's accepted mark never iterates the inputs a squadron's list "touches" — one
   input across a move is two squadrons', and a writer run over it from each squadron's load would undo the other's.
   So the week load and the boot clear the landing of exactly the inputs that are the schedule in view's on their first
   day — today's answer (engine/inputs.ts inputsOnFirstDay IS inputOnDay(r, unit, its first day)); the alias it stood on
   until the core gave the first-day list its own name went with phase 3's contract, which took inputsFor's
   no-day form. */
const landingInputs = (): any[] => inputsOnFirstDay(UNIT)
function protectedTouched(before: any, prot: string[]): boolean {
  /* the LOADED week is itself protected and its schedule was mutated (an input
     auto-landing a ground row onto a frozen day). Only fires when protectedWeek()
     — an edit on a different, unprotected week never changes the loaded DAYS. */
  if (protectedWeek() && JSON.stringify(DAYS) !== JSON.stringify(before.d)) return true
  /* the sorted multiset of inputs covering a protected date must be unchanged.
     A row added onto, removed from, edited on, or MOVED off a protected date all
     change this set; a pure reorder of unrelated rows (unshift) does not. */
  /* the protected days are the loaded week's: only the schedule in view's requests can change them (multi-squadron step 3)
     — and an input is the schedule in view's ON EACH protected day it covers, read on that day (the reshape plan §3.2
     A-iii — the protected days' signature asks inputOnDay per protected date): a leave across a man's move is 142's on
     its days before the move and 149's after, so a protected 149 day is guarded against it, a protected 142 day too */
  const cover = (list?: any[]) => {
    const on = new Set<any>()
    for (const dt of prot) for (const r of inputsOnDay(UNIT, inputAtIso(dt) ?? todayIso(), list)) if (inputCoversDate(r, dt)) on.add(r)
    return [...on].map(r => JSON.stringify(r)).sort()
  }
  const a = cover(before.i || []), b = cover()
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
  /* (WHAT ONE RECORD MAY HOLD is held at the save boundary, for every command — placeholderShapeViolation, below. The
     check that kept a group of one-record-a-man honest — one man once an entry, one filer a group — went with the
     group: the one-rule build, step 2 (g).) */
  try {
    fn(); if (gate) gate.apply(gateSnap)
    /* a till-date tick the change just overtook — a one-day commitment stretched, a kind moved out of its group — is
       replaced by the new default (owner D953 reading 2; engine/inputs.ts tillSettle). Here, after the absence rules'
       own cuts, so every door that writes an input is held by it; only a record whose default flipped carries one. */
    for (const r of INPUTS) tillSettle(r)
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
       model. NO history step, nothing persisted — the write never happened. Said in the grey "Blocked:" note, in the
       words of why the week is read-only (D1785, D1667–D1669 — engine/publish.ts lockedWeekNote). */
    HOOKS.toast(lockedWeekNote(), 'blocked')
    throw new CmdRefused('protected-week write refused')
  }
  HOOKS.renderInputs(); HOOKS.reflow(); HOOKS.histPush()
  return true
}

/* map a batch command's result to the caller's boolean. A refusal/rejection
   (ok:false, incl. the silent CmdRefused) reverted the model in phase-6 but ran
   no latched repaint, so repaint the reverted grid here and report false. */
function batchResult(r: CommitResult): boolean {
  if ((r as any).ok === false) {
    /* the placeholder check's refusal is a sentence a person can read (below) — said here, once, for any door that did
       not say it first */
    const msg = String((r as any).message || '')
    if (msg.startsWith(PLACEHOLDER_SHAPE + ': ')) HOOKS.toast(msg.slice(PLACEHOLDER_SHAPE.length + 2), 'warn')
    view.armDrop(); HOOKS.renderInputs(); HOOKS.reflow(); return false
  }
  return true
}

/* AN INPUT FILED FOR "ALL AVAIL" / "ALL" KEEPS ITS SHAPE, WHOEVER SAVES IT AND BY WHATEVER DOOR ([INPUT-ALL-AVAIL]; owner
   D700, D711, D712, D713 — 9 Oct 26; the plan docs/superpowers/plans/2026-10-09-input-all-avail-plan.md §3.2). One of seven (six until D778, 12 Oct 26 — Personal joined)
   kinds, one day, never in a group: engine/inputs.ts placeholderProblem is the one body, and every save door asks it
   first, with its sentence. THIS is the layer behind the doors — a HARD check on what a command really changed, kept
   beside the member's ownership check (wireStore below). It reads no role, so an admin is held as a member is (the
   ownership check skips admins — which is how the first plan would have let an admin's List form save a several-day
   one); it runs for every command, so an Undo / Redo, the Leave War's door and the test bridge are held too; and it
   judges only records the command PUT, so an untouched stored record is never judged (D56). A breach rolls the whole
   command back: no record, no history line, no Undo step, no half-filed group. */
const PLACEHOLDER_SHAPE = 'placeholder-input-shape'
export function placeholderShapeViolation(env: CommitEnvelope): string | null {
  for (const c of env.changes) {
    if (c.collection !== 'inputs' || c.op !== 'put' || !c.after) continue
    /* …AND EVERYTHING ELSE ONE RECORD MAY HOLD (step 2 (a) of the one-rule build — engine/inputs.ts shapeProblem, which
       asks the placeholder's rules first): at least one person, nobody twice, one placeholder at most, a medical
       entry or a Personal input one person's. The same layer, for the same reason: whoever saves it, by whatever door. */
    const why = shapeProblem(c.after)
    if (why) return why
  }
  return null
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

/* The same funnel under a command type of its own — for an input write whose step is named apart (the LATE chip,
   `inputs.lateOff`, D1586: the code read of 3 Nov 26 found it the one input write that skipped the locked-week refusal
   and the absence rules). */
export function writeInputsAs(type: string, fn: () => void): boolean {
  return batchResult(commitInputsWith([], type, () => { runInputWrite(fn, true) }))
}

/* A SAVE TRIED AND THROWN AWAY ([OIL-ASK-NOTIFY] — owner D783: a swap or an add that raises the OIL question "is not
   made until the question is answered"; Fable's read of the plan, A2). The door must know, BEFORE it asks, that the
   change would go through — or a man answers a question for a change that is then refused (leave over recorded work,
   ALL AVAIL on an input longer than a day, a locked week: refusals made INSIDE the save, which no check outside it can
   see). So the door's own body is run here for real, inside an input batch, and the batch is then refused on purpose:
   every enlisted store goes back as it was, no effect is released, no Undo step, no row written, nobody told.
   `fn` answers false where its own save refused. The absence rules run where they always do (runInputWrite, after
   `fn`), so they are tried too. NOT through batchResult: a tried save is no refusal the person made — the armed place
   stays armed and nothing repaints. True: it would be saved. */
const TRIED = 'tried — thrown away'
export function tryInputsBatch(fn: () => boolean | void): boolean {
  let passed = false
  /* …and the "just added" flash is not armed for a row that was only tried (the Opus read of the Inputs batch, F4 —
     13 Oct 26): the set it lights is view state, no part of what the rollback puts back, and a put-back tried here
     (ui/interactions.ts — the first tried door to reach a landing) left it lit for six seconds over nothing. */
  const flash = HOOKS.flashAdded
  HOOKS.flashAdded = () => {}
  try {
    commitInputsWith([], SCHED_TYPES.inputsBatch, () => {
      runInputWrite(() => { if (fn() === false) throw new CmdRefused(TRIED) }, true)
      passed = true
      throw new CmdRefused(TRIED)
    })
  } finally { HOOKS.flashAdded = flash }
  /* …AND THE RULES ARE RUN AGAIN, ON THE WORLD AS IT STANDS (the Opus read of the finished code, F1 — 13 Oct 26). The
     save's own epilogue ran them INSIDE the batch, on the tried world (HOOKS.reflow → validate()), and what they find —
     WARN, REST, EVD — is module state, no part of what the rollback puts back. With nothing after it, every screen then
     repainted the day's issues and the rings on its pucks from a change that was never made: behind the question, and
     for as long as the bar stood. "Nothing moves" (D783) is what the screen must say too. No repaint of its own — the
     caller notifies; not through batchResult, which would put the armed place down (above). */
  validate()
  return passed
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
  /* every unit's saved weeks — stashEntries keys each by its unit (`u149@13/07/2026`), so the records do too */
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
      /* every record names its week with its unit (`u149@13/07/2026#3` — storage/unitid.ts, step 2), so another unit's
         week of the same dates is another week, written through the stash like any week off screen */
      const wk = e.id.split(/[:#]/)[0]
      if (wk === inView(CURWEEK)) throw new CmdRefused(`weekstash write to the loaded week ${wk} — undo it from another week`)
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
  LANDED = { unit: '', page: '' } // the landing's last page and squadron are the person's who signed in (Fable's read, 23 Nov 26)
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
     access: pending, an account switched off — the guest view is removed, D2239). It is what every own-row rule
     asks (state/perms.ts), and what the Leave War's own-row rule reads (the sync mirrors
     it into the war's `viewer`). "View as" is retired, so nothing else sets it in
     production. A logout, or a headless call with no `pid` (the unit tests' bare
     { user, role }), puts back the headless default. */
  setMe(s && Object.prototype.hasOwnProperty.call(s, 'pid') ? s.pid : DEFAULT_ME)
  /* THE UNIT IN VIEW STARTS AS HIS HOME (multi-squadron batch 1, step 2): the signed-in person's home unit today
     (state/units.ts homeOn), the boot unit for a logout, a headless call or someone with no home. Already there — every
     sign-in on the demo today — it moves nothing.
     …AND HIS OWN SQUADRON'S LEAVE WAR (multi-squadron batch 1, step 4 — D2132: the Leave War stays on his own squadron
     whatever schedule is in view). The war is a world per squadron and the boot loaded the boot unit's before anyone
     signed in; the sync loads his own in its place (leavewar/sync.ts swapWarWorld — installed by its wiring, so this
     file never imports the war's sync). Before the Undo list is cleared below, so the swap's own passes are no step
     of his. Nothing when it is already loaded — every 142 sign-in on the demo.
     Both — and the Tracker — through the ONE entry for the open page, enterSquadron (the reshape plan §3.2 A-iv, below),
     which records HIS HOME AT ENTRY, never the pick (Opus L2), so step 5's master admin pick is never pulled back to his
     home by the midnight check. */
  HOME_AT_ENTRY = s && s.pid ? sessionUnit(s.pid) : null
  ENTRY_TRIED = ''
  /* a sign-in is no pick: a window held from here on reads its own words, not a pick's (state/typing-hold.ts) */
  setEnteredByPick(false)
  enterSquadron(sessionUnit(s && s.pid))
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
/* ---- THE SAME PERSON, WITH WHAT HIS ACCOUNT NOW GIVES (fix read 2 — Astra 2's finding 1) ----
   accounts.ts sessionNow makes a session again when the role its account gives has changed while he is signed in: his own
   move's day come (K3 — an admin joins as a member), or another admin made him an admin or a member. That is no sign-out:
   the same account, the same person — so his Undo list stays (D148: "the list clears when they sign out"; no ruling
   clears it on a change of role), and so do the week, the selection and the open windows, as for the admin's own member
   view above. The full reset stays for a sign-in, a sign-out, a suspension and an account put on another person
   (ui/App.tsx chooses). What moves is the role in force; the same three pieces of state as the member view are walked
   when he is no longer an admin. His squadron is entered by the midnight check (enterSquadron, below), which keeps the
   typing hold; a step of his he can no longer reach is blocked for good by the timeline (undo-wire.ts stepStuck). */
export function refreshAccess(s: any) {
  authSetSession(s)
  view.bumpNav()
  if (!isAdmin()) {
    if (view.CURPAGE === 'editsched' || view.CURPAGE === 'admin') view.setPage('viewsched')
    view.armDrop()
    view.clearAdminOpen()
  }
  lwSetRole(isAdmin() ? 'admin' : 'member')
}
/* THE SWITCH ITSELF — the body the switch had before it asked anything (above): true once the role in force has moved */
function switchRoleBody(): boolean {
  if (!mayViewAsMember()) return false
  const toMember = isAdmin()
  if (!switchRoleInForce(toMember ? 'main' : 'admin')) return false
  view.bumpNav()                  // a role change invalidates a pending day-template-apply confirm (P2-REV2-07)
  if (toMember) {
    if (view.CURPAGE === 'editsched' || view.CURPAGE === 'admin') view.setPage('viewsched')
    view.armDrop()
    setLgEdit(false)
    view.clearAdminOpen()
  }
  lwSetRole(isAdmin() ? 'admin' : 'member')
  return true
}
/** THE RAW SWITCH — the body alone, then notify(), asking nothing and closing nothing: the switch exactly as it was before
 *  the guard rail. No control calls it. Tests that need a state no press reaches since D2403 and D2627 A20 (a draft held in
 *  the member view, a window the member view holds) make it with this, as the raw pick is enterSquadron — the checker's
 *  allow-list names it (step K7) */
export function switchRoleViewRaw(): void {
  if (switchRoleBody()) notify()
}
/** the view switch would ask the Tracker's question: unsaved chart edits, whichever squadron — both ways, on his own
 *  squadron too (his D2627 A20) */
export const viewSwitchAsks = (): boolean => trackerSwitchNeeds()
/* THE SWITCH'S LAST STEP (§4.2 step 6, §4.4 steps 4–6): the windows that only show things close (D2596, D2597) and Logic's
   and Quals' edit modes end (D2627 A4, §18.1 — the guard's closeShown runs each mode's end()), then the switch, the two in
   one synchronous run and never earlier: a Stay, or a refusal after the question, has closed nothing. WHERE THE SWITCH MOVES
   HIS OWN PAGES — a Plan holder or a master admin with another squadron in view, whose pages are that squadron's in the
   admin view and his home's in the member view — they are entered at once, as his own press (byPick): the Tracker follows
   them and a chart editor open with nothing unsaved closes, as at a pick (his D2654 E3). Left to the check notify() runs,
   that entry was not his press, and the Tracker waited under the member view's cover for the open editor — the state his
   D2403 says his own switch must not leave. */
function enterRoleView(): void {
  closeShown()
  const iso = todayIso()
  const ownWas = pageUnit('own', iso)
  if (!switchRoleBody()) return
  if (pageUnit('own', iso) !== ownWas) { enterSquadron(UNIT, false, true); markEntryTried() }
  notify()
}
/* THE VIEW SWITCH'S DOOR — the name badge, the ☰ menu's "Switch to the member view" / "Back to the admin view", and the
   Input window's own "Back to the admin view" chip (the guard rail's plan §4.1 rows 3–5, §4.2, §4.4; his D2403, D2590,
   D2627 A9, A10, A20). In this order, each check made again after anything that waited — the pick's door's order
   (state/pick.ts):
   1. a person who may not switch → nothing, as today;
   2. the guard: a window that counts open, a row or form holding a change, a failed save → refused, its "Blocked:" note
      said by the seam ("…then switch to the member view." / "…then switch back to the admin view."), the press ending
      having changed nothing. The chip passes `skip` — the Input window it is drawn on — and still asks every other row;
   3. a save still going → the doors' one wait (state/doorwait.ts — the saver's own answer, never a timer, D87), then start
      again from 1; dropped by his next press;
   4. the Tracker's question, ALWAYS where there are unsaved chart edits, both ways, on his own squadron too (D2627 A20):
      "…Save them before switching to the member view?" / "…before switching back to the admin view?" — Stay: nothing;
      Discard them: the chart back to its last save, then the switch; Save them: saved, then the switch; a Save that does
      not take: he stays;
   5. after Save or Discard, 1 and 2 again — a window or a failed save may have arrived while the question stood — and 3
      again if a save is then going;
   6. the switch (enterRoleView).
   With nothing to refuse, wait for or ask, the switch stays synchronous, as before: the role has moved when this returns. */
export function switchRoleView(opts: GuardOpts = {}): void | Promise<void> {
  /* a press of a door drops a press still waiting for a save (the plan's reading, named for him) */
  dropDoorWait()
  return switchFrom(opts)
}
function switchFrom(opts: GuardOpts): void | Promise<void> {
  if (!mayViewAsMember()) return
  const toMember = isAdmin()
  if (refuse(toMember ? 'toMember' : 'toAdmin', '', opts)) return
  if (saveGoing()) return waitForSave().then(r => { if (r === 'go') return switchFrom(opts) })
  const ask = viewSwitchAsks() ? trackerSwitchAsk(toMember ? 'the member view' : 'the admin view', !toMember) : null
  if (!ask) { enterRoleView(); return }
  return ask.then(go => { if (go) return afterSwitchAsk(toMember, opts) })
}
function afterSwitchAsk(toMember: boolean, opts: GuardOpts): void | Promise<void> {
  if (!mayViewAsMember() || isAdmin() !== toMember) return
  if (refuse(toMember ? 'toMember' : 'toAdmin', '', opts)) return
  if (saveGoing()) return waitForSave().then(r => { if (r === 'go') return afterSwitchAsk(toMember, opts) })
  enterRoleView()
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
  /* (the week loaded is the schedule in view's: only ITS requests' landings are re-derived — another squadron's 'g'
     belongs to that squadron's rows; multi-squadron step 3) */
  landingInputs().forEach((r: any) => { if (r.acc && r.acc !== 'r' && r.acc !== 'u' && !inputProtected(r)) delete r.acc })
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
  leaveWeek()
  enterWeek(v)
}
/* the week on screen, kept in the stash under the unit in view as it is left (by a week load or a change of unit) */
function leaveWeek(): void {
  const leaveSnap = weekStashSnap()
  /* a preserved (byte-frozen) week keeps its ORIGINAL blob in the stash, never a
     re-serialization of the un-migrated live model (P2-IMPL-02). */
  if (stashHas(CURWEEK) || leaveSnap !== weekBaseline) stashPut(CURWEEK, isPreservedWeek(CURWEEK) ? (preservedBlob(CURWEEK) ?? leaveSnap) : leaveSnap)
}
/* the week `v` of the unit in view, installed and worked out — loadWeek's second half, and switchUnit's */
function enterWeek(v: any): void {
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

/* ---- THE UNIT IN VIEW (multi-squadron batch 1, step 2) ----
   The scheduler's singletons — the loaded week (DAYS, SCHED, DATES, CURWEEK), the planning calendar (PLANPUCKS, DAYRMK)
   and every setting held in memory (VCONF / SHIFT_HARD, the templates, the flying plan) — hold ONE unit, the unit in
   view (engine/unitview.ts; storage/keyowner.ts UNIT_SINGLETONS), as they hold one week. Changing it is a load, by the
   path a week load takes: the week on screen is kept in the stash under the unit being left, the unit's settings and
   planning calendar are read again, and the same dates are entered for the new unit — its saved copy if it has one, else
   its untouched week (engine/weeks-data.ts weekBundle: the demo's authored weeks are the demo squadron's only). Like a
   week load it is navigation: no command, nothing saved, every record of each unit already saved by the command that
   made it. Undo is NOT cleared by it: there is one change stream, and a person's Undo on a schedule steps back his own
   changes in the unit in view (undo/timeline.ts, D148).
   The planning calendar of a unit left is kept in memory (state/plan-foreign.ts keepPlan — kept there since the reshape's
   routed planning record, §3.2 A-ii, so the stored half reads and updates it) as the stash keeps its weeks, so coming back shows
   it as it was; a unit never shown this session reads its rows from the whiteboard (state/persist.ts hydratePlan), and
   headless — no whiteboard — starts empty. Who may look at a unit is the "▾" menu's question (step 5), not this one's:
   this function only changes what is held in memory. */
export function switchUnit(unit: string): void {
  if (!isUnitId(unit)) throw new Error(`switchUnit: not a unit id: ${unit}`)
  if (unit === UNIT) return
  leaveWeek()
  // eslint-disable-next-line react-doctor/no-json-parse-stringify-clone -- the unit left keeps its planning calendar as saving stores it (keys set to undefined dropped), the same image a reload of that unit reads; structuredClone would keep them
  const keptPucks = JSON.parse(JSON.stringify(PLANPUCKS))
  keepPlan(UNIT, { pucks: keptPucks, titles: { ...DAYRMK } })
  /* the change history in memory is the unit in view's (engine/editlog.ts elogLoad): the lines held for the unit left
     are kept first, then the list is read again for the unit entered (the full check, 18 Nov 26) */
  elogFlush()
  setUnitInView(unit)
  elogLoad()
  reloadUnitSettings()
  /* the blue/red answers held in memory are the unit in view's (state/persist.ts hydrateRolesFor) */
  { const wb = persistWb(); if (wb) hydrateRolesFor(wb, unit) }
  const kept = keptPlan(unit)
  if (kept) {
    PLANPUCKS.length = 0; kept.pucks.forEach(p => PLANPUCKS.push(p))
    for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
    Object.assign(DAYRMK, kept.titles)
  } else {
    const wb = persistWb()
    if (wb) hydratePlan(wb, unit, true)
    else { PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k] }
  }
  /* the squadron entered is the loaded calendar now: its stored half holds nothing of it (state/plan-foreign.ts) */
  dropStoredPlan(unit)
  enterWeek(CURWEEK)
}
/* the unit a session starts in: the signed-in person's home today (state/units.ts homeOn — D2094), else the boot unit
   (headless, nobody signed in, a person with no home) */
/* the hook the Leave War's sync installs to load a squadron's world at sign-in (resetSession, above) — null until it is
   wired (a test that never boots the war) */
let SESSION_WORLD: ((unit: string) => void) | null = null
export function setSessionWorldHook(fn: ((unit: string) => void) | null): void { SESSION_WORLD = fn }
function sessionUnit(pid: string | null | undefined): string {
  const h = pid ? homeOn(String(pid), todayIso()) : null
  return h && isUnitId(h) ? h : BOOT_UNIT
}

/* ---- ENTERING A SQUADRON — ONE ENTRY FOR THE OPEN PAGE (the reshape plan §3.2 A-iv) ----
   Three things say which squadron the open page holds, each set once at sign-in until now: the schedule in view (UNIT —
   switchUnit), the Leave War's world (the sync's swapWarWorld) and the Tracker's door (tracker/storage.js). They move
   together here, in a fixed order: the schedule in view first, then the war and the Tracker to the page's own squadron
   (state/perms.ts pageUnit('own') — his home, or the pick for a master admin or a Plan holder of it that day; equal to
   his home today, as nothing picks yet). resetSession enters at sign-in; the midnight check below enters again when his
   own move takes effect (A2) — it does NOT reset the page or clear the Undo list: his steps in the old squadron wait
   there, by their stamp (A-v).
   THE TRACKER FOLLOWS (his D2395 — tracker/storage.js rebindStorageUnit, tracker/app/core.js followUnit): once loaded it
   leaves this squadron and reads the next on its own, after this returns ('moved'), or waits where chart work is open that
   cannot be asked about — his own move at midnight or the member view ('held'; trkMayHold, below). A pick has asked
   already (state/pick.ts). The answer is handed back, so a caller can tell. */
export type TrackerEntry = 'none' | 'same' | 'later' | 'bound' | 'kept' | 'moved' | 'held'
export interface Entered { unit: string; own: string; tracker: TrackerEntry }
let ENTERING = false
/* `holdWar` (phase 3 — the plan §3.2 A-iv "Typed work at the swap"; state/typing-hold.ts): an open Leave War window holds
   the WAR'S step only, so nothing typed in it is ever saved into the new squadron; the schedule in view and the Tracker
   still move. The war is entered once the window goes (the check below finds the war not the page's own squadron). */
/* `byPick` (§16 D2, his D2323): the entry is his own pick in the Schedules menu or a bell tap (state/pick.ts,
   state/belltap.ts) — recorded only when the schedule in view changes, so the re-entry the check below makes for the same
   pick (the war held by a window) keeps it, and his midnight move or a right ended clears it */
export function enterSquadron(scheduleUnit: string, holdWar = false, byPick = false): Entered {
  if (ENTERING) return { unit: UNIT, own: pageUnit('own', todayIso()), tracker: 'none' }
  ENTERING = true
  try {
    if (scheduleUnit !== UNIT) setEnteredByPick(byPick)
    switchUnit(scheduleUnit)
    const own = pageUnit('own', todayIso())
    if (!holdWar) {
      const before = lwUnitNow()
      SESSION_WORLD?.(own)
      /* A WAR LOADED AFRESH STARTS WITH A MEMBER'S ROLE (leavewar/state/store.ts initStore): the role in force is set on it
         again, as a sign-in and the member-view switch set it — found switching the midnight swap on: Hunter, an admin,
         was a member in his new squadron's war after midnight and every admin change there was refused */
      if (lwUnitNow() !== before) lwSetRole(isAdmin() ? 'admin' : 'member')
    }
    landOffEditSched()
    /* a squadron he only views, entered on a page it does not offer, lands on its View-only Sched (D2381) */
    if (!pageOffered(view.CURPAGE) && !warHeld()) view.setPage('viewsched')
    return { unit: UNIT, own, tracker: rebindStorageUnit(own, !byPick && trkMayHold()) as TrackerEntry }
  } finally { ENTERING = false }
}
/* MAY THE TRACKER WAIT ON THE SQUADRON IT IS ON, for chart work still open there (his D2395, with D2243 and D2253): his own
   move taking effect today, whose band across the chart editor says it can't be saved; or the member view, which leaving
   gives back. A right taken away never waits: he is no longer to be shown that squadron's chart. */
function trkMayHold(): boolean {
  const trk = trkUnitNow(), m = me()
  if (!trk || !m) return false
  return !!moveWords(trk, 'Tracker', m, todayIso()) || !!trackerCoverKind()
}

/* HIS HOME AT ENTRY — recorded by resetSession, never the pick (Opus L2); null nobody signed in (or a sign-in with no
   person). The midnight check compares his home today with it. */
let HOME_AT_ENTRY: string | null = null
export const homeAtEntry = (): string | null => HOME_AT_ENTRY
/* THE MIDNIGHT TRIGGER — ON SINCE PHASE 3 (the reshape plan §3.2 A-iv "Switched on only after A-v", §10): helper "undo &
   roles" has merged A-v — every Leave War and Tracker step carries its squadron, so an Undo after the swap never writes a
   142 step into 149 (Fable F2, Astra 2). A test that needs the page held where it is switches it off for itself. */
let ENTRY_TRIGGER = true
export function setEntryTrigger(on: boolean): void { ENTRY_TRIGGER = !!on }
/* THE HOLD (state/typing-hold.ts): an open Leave War window holds the war's swap, whatever is typed in it (Astra 7,
   Fable F9). A test may hand its own; `null` puts the app's own back. 'tracker' holds nothing of its own here: the
   Tracker's chart work holds its own door (his D2395 — trkMayHold, above). */
export type EntryHold = HoldKind
let ENTRY_HOLD: () => EntryHold = holdNow
export function setEntryHold(fn: (() => EntryHold) | null): void { ENTRY_HOLD = fn || holdNow }
/* one try per day, squadron pair and hold, so a war that will not load is not tried again on every notify — and a war
   held by a window is tried again the moment the window goes */
let ENTRY_TRIED = ''

/* WHERE THE PICK GOES WHEN HIS OWN MOVE TAKES EFFECT (Fable 9; the Plan audit, D2242): it moves to his new home only where
   it stood on his old home; a pick of another squadron stays where a right still reaches it on the new day — a master
   admin's always — else it moves home. His own move ends every View and Plan he held (D2203, from the start of his move
   day — D2243 Q4), so for his own move pageUnit('own') on the new day answers it: the pick is his own page's squadron
   only for a master admin or a Plan holder whose Plan still holds (Hunter, 142's admin with Plan of 149, 149 picked,
   moved to 150 at midnight, goes to 150). Dormant until step 5's menu: today the pick is always his home. */
function pickAfterMove(pick: string, oldHome: string, newHome: string, iso: string): string {
  if (pick === oldHome) return newHome
  return pageUnit('own', iso) === pick ? pick : newHome
}

/* THE CHECK notify() RUNS while the trigger is on: the squadron to enter now, or null.
   - his own move (A2): his home today is not his home at entry → the pick by the rule above;
   - the blind read's R6 (the plan §19b; dormant until P1/P3 — nothing in the app makes these cases yet), three halves:
     the pick has no readable right behind it today (perms.ts pickStandsOn — a View or Plan taken away or ended while he
     is on that squadron's pages) → his home, entered again; the page's own squadron is not the Leave War's loaded one —
     a right lowered, removed or raised mid-day, or a war held by a window that has since gone — → the same pick, entered
     again; or not the Tracker's bound one → the same pick, entered again, the Tracker following it (his D2395 —
     tracker/storage.js rebindStorageUnit; where chart work holds it, core.js moves it itself once that is gone, and the
     key in maybeReenter stops a second try meanwhile). */
function entryDue(): string | null {
  const m = me()
  if (!m || HOME_AT_ENTRY == null) return null
  const iso = todayIso()
  const home = homeOn(m, iso)
  if (!home || !isUnitId(home)) return null
  if (home !== HOME_AT_ENTRY) return pickAfterMove(UNIT, HOME_AT_ENTRY, home, iso)
  if (!pickStandsOn(iso)) return home
  const own = pageUnit('own', iso)
  const war = lwUnitNow()
  if (war && war !== own) return UNIT
  const trk = trkUnitNow()
  if (trk && trk !== own) return UNIT
  return null
}
/* the try the check records — the day, the squadron due, his pages' squadron, the war's and the Tracker's, who, the hold */
function entryKey(to: string, held: boolean): string {
  const iso = todayIso()
  return `${iso}|${to}|${pageUnit('own', iso)}|${lwUnitNow() ?? ''}|${trkUnitNow() ?? ''}|${me() ?? ''}|${held ? 'held' : ''}|${trkMayHold() ? 'mayhold' : ''}`
}
/* THE VIEW SWITCH'S OWN ENTRY COUNTS AS THIS CHECK'S TRY (step K5, B14 — found by the test, against the plan §4.4 step 5's
   "unproved" note): the switch enters his pages' squadron by his own press, the Tracker sent after them; its move waits a
   beat before it leaves (core.js runFollow), so the check the same notify runs still saw the Tracker off his pages, entered
   once more — not his press — and, the member view's cover allowing it, held the Tracker for the chart editor still open,
   undoing the move. Recorded as tried, that same entry is not made again; anything else due is, as before. */
function markEntryTried(): void { ENTRY_TRIED = entryKey(UNIT, ENTRY_HOLD() === 'war') }
/* run from realNotify — never inside a command (a swap loads a week and a war, which are no one's command), never while
   entering; an open war window holds the war's step (above). The midnight wake (leavewar/sync.ts installPostingClock)
   calls notify() at 00:00:01 and whenever the page is shown or focused on a new day, so the swap needs no click (Fable
   F8, Opus L2) */
function maybeReenter(): void {
  if (!ENTRY_TRIGGER || ENTERING || isCommitting()) return
  const to = entryDue()
  if (to == null) return
  const held = ENTRY_HOLD() === 'war'
  /* the page's own squadron is part of the try: back from the member view over a held draft the door has not moved, so
     without it the key matched the last try, and the Leave War stayed on his home under the squadron picked, its Approve
     writing there (the night's security read, F1). Whether the Tracker may hold is too: a right lowered during the hold
     must release it (trkMayHold). */
  const key = entryKey(to, held)
  if (key === ENTRY_TRIED) return
  ENTRY_TRIED = key
  const m = me()
  /* a re-entry that keeps the squadron in view leaves the page to the two landings run next in this same notify: its own
     landing would swallow a page he has just opened, the tap landOnOfferedPage is there to answer (the night's Opus F1) */
  const unitWas = UNIT, pageWas = view.CURPAGE
  enterSquadron(to, held)
  if (UNIT === unitWas && view.CURPAGE !== pageWas) view.setPage(pageWas)
  if (m) HOME_AT_ENTRY = sessionUnit(m)
}

/* THE BAND (state/typing-hold.ts; D2243 Q7 — the approved drawing's words, D1478): while the world a page holds is not
   the page's own squadron — the war under a window that held its swap, or the Tracker where chart work holds it at his
   own move (his D2395) — its open window or chart editor says so. Written after every check, so a surface reads the band
   of the page as it stands. */
const isoDayBefore = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(y!, m! - 1, d! - 1)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
const unitNum = (u: string): string => unitById(u)?.num ?? u
/* His own move taking effect today, out of the squadron the world belongs to: the drawing's words — "You are 149's from
   today. This can't be saved in 142's Leave War." (or "…in 142's Tracker."). Any other way the world stopped being his
   page's own (R6: a right ended mid-day — dormant) has no approved words, so it reads the app's generic "This change could
   not be saved." (the phase-2 helpers' brief, named in the report). */
function moveWords(world: string, page: 'Leave War' | 'Tracker', pid: string, iso: string): MoveBand {
  const home = homeOn(pid, iso)
  const was = homeOn(pid, isoDayBefore(iso))
  if (home && was && home !== was && world === was) {
    return { lead: `You are ${unitNum(home)}'s from today.`, rest: `This can't be saved in ${unitNum(world)}'s ${page}.` }
  }
  return null
}
/* (batch 1's second half §16 D2, his D2323 — the drawing f7a): a Leave War window open when HIS PICK (or a bell tap) took
   the page to another squadron reads "This is 142's. You picked 149 — close this to go on.", its controls greyed
   (typing-hold.ts pickBand) — in place of the generic words, which said a change had failed when nothing was tried */
/* "You picked 149" only where the pick is what moved the window off its squadron — the squadron in view, reached by his
   pick, is not the window's own; a right lowered under a window on the squadron he picked (R6) keeps the generic words */
const heldByPick = (world: string): boolean => enteredByPick() && UNIT !== world
/* …and his D2389: a window on the squadron in view that the switch to the member view left behind reads "Member view."
   (typing-hold.ts memberViewBand; perms.ts heldByMemberView says when) — one body for the Leave War's and the Input's */
const heldWords = (world: string): NonNullable<MoveBand> =>
  heldByPick(world) ? pickBand(unitNum(world), unitNum(UNIT)) : heldByMemberView(world) ? memberViewBand() : schedMoveBand()
function bandWords(world: string, page: 'Leave War' | 'Tracker', pid: string, iso: string): MoveBand {
  return moveWords(world, page, pid, iso) ?? heldWords(world)
}
/** the band of an Input window held across a change of squadron (ui/InputWindow.tsx): a pick's words where his pick (or
 *  a bell tap) moved the page — `opened`, the squadron the window opened on — the member view's where the switch to it
 *  did (D2389), else the generic words, as before */
export function heldWindowBand(opened: string): NonNullable<MoveBand> {
  return heldWords(opened)
}
/* THE TRACKER'S ONE COVER LEFT (his D2395 took away D2318's two bands; state/perms.ts trackerCoverKind): the member view
   over his unsaved edits, only while the door is held for them — during an ordinary move the page shows its own
   "Loading…". His own move taking effect at midnight keeps the band drawn for it across the chart editor (D2243 Q7, above)
   and no cover. */
function coverWords(): TrkCover {
  if (!storageHeld()) return null
  const c = trackerCoverKind()
  if (!c) return null
  return { kind: 'member', lead: `This is ${unitNum(c.bound)}'s Tracker.`, rest: 'Leave the member view to open it.' }
}
function publishBands(): void {
  const m = me()
  if (!ENTRY_TRIGGER || !m || HOME_AT_ENTRY == null) { setBands(null, null); return }
  const iso = todayIso()
  const own = pageUnit('own', iso)
  const war = lwUnitNow(), trk = trkUnitNow()
  const trkMove = trk && trk !== own ? moveWords(trk, 'Tracker', m, iso) : null
  /* …AND A WAR WINDOW LEFT OPEN OVER A SQUADRON HE ONLY VIEWS (D2323, D2381 — the fix rounds' read of 23 Nov 26, the twin
     of its Input-window finding): a View holder's war is his own squadron's before and after a pick, so "the war loaded
     is not his pages' squadron" never said his window was left behind — it stood live under 149's number. While the
     squadron in view does not offer the Leave War, a window still open on it wears the band too (a war window opens
     only on the Leave War page, so it was open before the page stopped being offered). */
  const warBehind = !!war && (war !== own || !pageOffered('leavewar'))
  setBands(warBehind ? bandWords(war, 'Leave War', m, iso) : null, trkMove, trk && trk !== own && !trkMove ? coverWords() : null)
}
/* the last war window goes (typing-hold.ts warWindowGone): the check runs again at once where the window held something —
   the war's swap (a band was up over it), or the landing off a page the squadron in view does not offer (warHeld above:
   a View holder's own pages and war never move at a pick, so no band says it — the fix rounds' read of 23 Nov 26,
   Astra 1). An ordinary close holds neither and repaints nothing. */
setHoldRelease(() => { if (warBand() || !pageOffered(view.CURPAGE)) notify() })
/** the planning calendars kept for units left this session — cleared with the session (tests and sign-out) */
export function forgetUnitPlans(): void { forgetKeptPlans() }
/* the stored half of another squadron's planning calendar reads its rows from the whiteboard this app saves to (none
   headless) — handed over here, since state/plan-foreign.ts may not import state/persist.ts (which imports the schedule
   store that imports it) */
setPlanStoreDoor(() => persistWb())

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
  /* …and an input filed for ALL AVAIL / ALL keeps its shape, whoever saves it (placeholderShapeViolation above) */
  defineInvariant({ id: PLACEHOLDER_SHAPE, cls: 'hard', check: placeholderShapeViolation })
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
     shared "Admin" / "Squadron member". (The guest view is removed — D2239.) */
  HOOKS.whoami = () => {
    if (!SESSION) return 'Unknown'
    const pid = me()
    const p = pid ? (PEOPLE as any)[pid] : null
    return p ? String(p.cs) : String(SESSION.name || SESSION.user)
  }
  /* the person behind whoami — kept beside the name on every record that stores a
     "who", so a callsign rename moves nothing and a reused callsign inherits nothing
     (the one-identity rule; Astra R1-9) */
  HOOKS.whoamiId = () => me()
  /* a history line names another squadron only where the person giving it may file there, and a line kept, rewritten or
     deleted inside a person's command is judged by its squadron (the second fix read, security H5 — state/perms.ts 7d) */
  HOOKS.elogUnitOk = (u: string) => elogUnitAllowed(activeEnvelope()?.actor ?? deriveActor(), u)
  /* …and the giver's own squadron, where a line naming nobody (an Undo's own line) cannot be filed in the squadron in view:
     a 142 member with View of 149, 149 in view, undoing his own input's change kept no line at all (job 2's fix read, 1) */
  HOOKS.elogOwnUnit = () => elogOwnUnit(activeEnvelope()?.actor ?? deriveActor())
  setElogWriteGuard((key, v) => elogWriteProblem(activeEnvelope()?.actor ?? deriveActor(), key, v))
  /* a line written while a command runs is kept only if the command commits ([DRAFT-PENDING] — the history is
     durable now, so a refused command's lines would otherwise stand for good) */
  setElogDefer(deferEffect)
  /* …and a line kept with no command running (an idle toggle's line, the Admin → Data history sweep) is written inside
     a command of its own, so it is a saved group with its change-log batch, never a bare write ([DB-READINESS] group A,
     phase 4.3). The app's own act (the system actor): the line itself names who did it. */
  /* …except the Admin → Data history sweep, which is the admin's own act: it runs as HIM (origin `projection`, so it is
     no Undo step), and its change-log batch names who cleared the history (the group-A final read, Fable F1 step 4,
     30 Sep 26). Its authority is perms.ts COMMAND_OPS — a delete on EditLog, an admin's alone. */
  /* (it answers whether the save went through: a refused sweep is then said as not saved, never as "Cleared") */
  setElogDoor((type, fn) => {
    const cmd = { type, scope: { module: 'settings' }, apply: () => { fn() } } as any
    const actor = deriveActor()
    if (type === 'elog.sweep' && actor.role !== 'system') return (commitAs(cmd, { actor, origin: 'projection' }) as any).ok !== false
    return (commitProjection(cmd) as any).ok !== false
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
  setUnitSeeds(policy.seedDemo)   // the units' seeds follow the accounts' (state/units.ts; it also drops the read rows)
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
  unitsLoad()        // the units, places, homes and rights the same (state/units.ts)
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
  /* [ACCOUNTS] (26 Sep 26): the accounts and the access requests (durable settings rows —
     the guest switch, once the third, went with the guest view, D2239) load here like
     every other setting. The loader sat
     only in the settings rollback list, so a built site forgot every account the admin
     added at the next reload — found by the walk, not by any test (every test ran in
     one page life). After hydrate(): the lock-out check reads the stored roster. */
  accountsLoad()
  /* THE CHANGE HISTORY ([DRAFT-PENDING], 28 Sep 26 — D336 (b)): saved, so it is loaded here with every other setting */
  elogLoad()
  changesLoad()
  noticeSeenLoad()   // what each person has read of his bell's notices (state/noticeseen.ts)
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
    /* an input filed for ALL AVAIL and an Event filed for ALL, so both are on every list from the first look */
    seedDemoPlaceholders()
    /* the second demo squadron's people and their two inputs (multi-squadron batch 1, step 4 — state/demoseed.ts) */
    seedDemo149()
    /* …people the roster did not hold when its order and the people baseline were taken above: each gets his place in
       the order, and the baseline is taken again — so the first people command writes only what it changed, never the
       ten seeded people (they are stored with the seed's rows, state/persist.ts writeSeedRows) */
    mintPeopleOrd(); resyncPeopleBaseline()
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
    landingInputs().forEach((r: any) => { if (r.acc && r.acc !== 'r' && r.acc !== 'u' && !inputProtected(r)) delete r.acc })
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
export { armSlot, disarmSlot, armedKey, placeArmed, selectPerson, selKeep, selRestore, selClear, selDrop, setBoardDay, afterSchedMutate } from './view'
/* (setPage is no longer view.ts's re-exported here: it is the page door above, step K6) */
export { setSession, canEditSched, LGEDIT, setLgEdit } from './auth'
