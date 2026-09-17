/* [ARCH-STACK] Step 2 phase 2 — routing the SCHEDULER through the command gate
   (design §5.1, §8 item 2). ADDITIVE: the interim histPush/persistAll/snapshot
   undo stack are LEFT RUNNING; this only ADDS the auth gate + the record-level
   change stream around the existing write funnel.

   The scheduler's snapshot boundary already IS histSnap()/histRestore() (the
   whole-world undo snapshot). So the command layer models the scheduler as ONE
   EnlistableStore whose capture()/restore() are exactly those two primitives —
   rollback reuses the battle-tested restore rather than a second one that could
   drift — and whose records() decomposes that same world into the logical
   records the stream needs (design §3.1). Enlisting "the scheduler store" is
   therefore identical to taking the undo snapshot, and a command rollback is
   identical to an undo restore.

   Permissions at Step 2 are deliberately PERMISSIVE (anyone): the real edit gate
   (canEditSched at the write path / editMode in the UI) is UNCHANGED and still
   authoritative, so a tighter command permission here could only ADD a refusal
   the app never had and regress a legitimate write. The gate MECHANISM
   (adminOnly/ownOrAdmin, proven in command-auth.test.ts) is in place and every
   write passes through authorize(); its tightening lands with real auth at Step
   5 / stream-driven undo at Step 3. See design §3.5 "real auth at Step 5".

   Edit-log / toast latching is NOT wired here (they are engine-layer, append-
   only and order-insensitive, and a wrapped scheduler write does not roll back
   in live flow at Step 2 — the only rollbacks are the reducer-internal quarantine
   backstop, which restores itself, and a hard-invariant/guard failure that
   well-formed scheduler writes never trigger). Full effect latching lands with
   Step 3, when undo becomes stream-driven and rollback is routine. The MODEL and
   the HOOKS repaint/history effects ARE latched (below), so model atomicity holds.
*/
import type { EnlistableStore, RecordEntry, Scope, CommitResult, Command } from '../command'
import {
  commit, isCommitting, definePermission, anyone, registerRecord, registerGuardedStore,
  registerEffectContext, installBaselineInvariants,
} from '../command'
import { DAYS } from '../engine/data'
import { mintInpIds } from '../engine/inputs'
import { ensureRowIds } from '../engine/rowids'
import { SCHED, setDayApproved, publishALDay, discardPending } from '../engine/publish'
import { CURWEEK } from '../engine/waves'
import { HIST, histSnap, histRestore, setSchedResync } from './history'
import { setSchedEpilogueHook } from '../engine/hooks'
import { issuedDisclosed, discloseIssued } from './disclosure'

/* ---- the scheduler EnlistableStore (a LAGGING BASELINE, decomposed) --------
   [ARCH-STACK] follow-up #1: copy the People pattern. The unrouted board/text/
   stores paths mutate the model IN PLACE and then reach the epilogue, so reading
   LIVE DAYS/SCHED as the before-image would show no diff. Instead records()/
   capture() decompose a lagging BASELINE snapshot string (the last-persisted
   world), advanced to the live world at each command's apply-end (applyEnd) and
   re-synced whenever the world is replaced out-of-band (setSchedResync, via
   history.ts). signature() stays LIVE (histSnap) so the whole-world guard still
   fires (SR-005) — capture()/signature() are DIFFERENT functions now, which is
   why commit.ts guardSnapshot was fixed to read signature(), not the capture
   string. Invariant between commands: SCHED_BASELINE === histSnap(). */
let SCHED_BASELINE: string | null = null
function baseline(): string { return SCHED_BASELINE ?? histSnap() }
/* re-sync the baseline to the CURRENT live world. MUST run after any out-of-band
   replacement of DAYS/SCHED/INPUTS/WARNOFF that does not go through a command:
   registered as the history.ts callback (undo/redo/quarantine/loadWeek/boot BY
   construction) and called explicitly from resetSession + the demo overlay. */
export function resyncSchedBaseline(): void { SCHED_BASELINE = histSnap() }
/* dev/test guardrail (R2-06): between commands the baseline must equal live. An
   escape site (a durable write that opened no command) leaves it dirty, so a test
   asserting this after each gesture catches a missed route loudly. The whole-world
   guard does NOT catch this (it only sees changes DURING a command). */
export function schedBaselineClean(): boolean { return baseline() === histSnap() }

/* decompose a histSnap() STRING (the baseline), the same fields history.ts
   serialises (schedFields + d/i/wo/pp/dm). Reads each input row's r.iid DIRECTLY
   — never inpId(r), which MINTS an id as a side effect of being read (SR-006), a
   write to the live world during derivation. A row with no iid yet is skipped
   (R2-07): applyEnd mints them before advancing, so a real baseline never has
   any, and a transient un-minted row must not enter the stream half-formed. */
function decompose(snapStr: string): Map<string, RecordEntry> {
  const s = JSON.parse(snapStr)
  const m = new Map<string, RecordEntry>()
  const wk = CURWEEK
  const days = s.d || []
  for (let di = 0; di < days.length; di++) {
    const id = `${wk}#${di}`
    m.set(`days/${id}`, { collection: 'days', id, value: days[di] })
  }
  // the mutable book (excludes the issued orig/als, which are their own records)
  const book = {
    c: s.c, p: s.p, ad: s.ad, al: s.al, ok: s.ok,
    sg: s.sg, sb: s.sb, cv: s.cv, dr: s.dr, cd: s.cd, v: s.v, am: s.am,
  }
  m.set(`sched.book/${wk}`, { collection: 'sched.book', id: wk, value: book })
  m.set(`sched.mutes/${wk}`, { collection: 'sched.mutes', id: wk, value: (s.wo || []) })
  const orig = s.o || {}
  for (const di of Object.keys(orig)) {
    const id = `${wk}:${di}`
    m.set(`sched.orig/${id}`, { collection: 'sched.orig', id, value: orig[di] })
  }
  const als = (s.a as any[]) || []
  for (let n = 0; n < als.length; n++) {
    const id = `${wk}:${n}`
    m.set(`sched.als/${id}`, { collection: 'sched.als', id, value: als[n] })
  }
  for (const r of ((s.i as any[]) || [])) {
    const id = r && r.iid
    if (!id) continue
    m.set(`inputs/${id}`, { collection: 'inputs', id, value: r })
  }
  m.set('plan/all', { collection: 'plan', id: 'all', value: { pp: s.pp || [], dm: s.dm || {} } })
  return m
}
function schedRecords(): Map<string, RecordEntry> { return decompose(baseline()) }

export const schedStore: EnlistableStore = {
  key: 'scheduler',
  capture: () => baseline(),                          // the before-image + rollback source (lagging)
  restore: (snap) => { histRestore(snap as string) }, // histRestore re-syncs the baseline itself
  records: schedRecords,
  signature: () => histSnap(),                        // LIVE — keeps the whole-world guard (SR-005)
}

/* the ONE shared apply-end: mint the ids histPush would mint in phase 8 (but it
   is LATCHED until then, AFTER the baseline would advance — SR-006), then advance
   the baseline to the new live world. Folded into BOTH commitSched and
   commitPublish (SR-001), and idempotent so a nested child-join re-running it is
   harmless. materializeSigns is GONE — the sign readers are non-mutating now. */
function applyEnd(): void {
  ensureRowIds(DAYS)
  mintInpIds()
  SCHED_BASELINE = histSnap()
}

/* ---- command types + the commit helper ----------------------------------- */
export const SCHED_TYPES = {
  slot: 'sched.slot',
  fill: 'sched.fill',
  text: 'sched.text',
  delete: 'sched.delete',
  sectionMove: 'sched.section.move',
  sectionReorder: 'sched.section.reorder',
  inputsWrite: 'inputs.write',
  inputsBatch: 'inputs.batch',
  // phase 2b — the publish path (design §3.4)
  approve: 'sched.approve',
  publishAL: 'sched.publishAL',
  discard: 'sched.discard',
  // follow-up #1 — the previously-unrouted paths (rows A–G). Auto-registered by
  // the definePermission loop below. `mutate` is the afterSchedMutate backstop.
  mutate: 'sched.mutate',
  stores: 'sched.stores',
  sign: 'sched.sign',
  signClear: 'sched.signClear',
  warnMute: 'sched.warnMute',
  draftRename: 'sched.draft.rename',
  draftDelete: 'sched.draft.delete',
} as const

const schedScope = (): Scope => ({ module: 'sched', weekId: CURWEEK })
const inputsScope = (): Scope => ({ module: 'inputs' })

/* run a scheduler mutation `fn` inside a command: enlist the scheduler store
   (snapshot), run the existing in-place write (its HOOKS effects latch and
   release in phase 8), derive the record-level changes, emit. `fn` may return a
   value (writeInputs returns a boolean) which is captured and returned. */
function commitSched<T>(type: string, scope: Scope, fn: () => T): { result: CommitResult; value: T } {
  let value!: T
  const cmd: Command = { type, scope, apply: (txn) => { txn.enlist(schedStore); value = fn(); applyEnd() } }
  const result = commit(cmd)
  return { result, value }
}
export function commitSchedVoid(type: string, fn: () => void): CommitResult {
  return commitSched(type, schedScope(), fn).result
}
export function commitInputs<T>(type: string, fn: () => T): T {
  return commitSched(type, inputsScope(), fn).value
}
export function commitSchedValue<T>(type: string, fn: () => T): T {
  return commitSched(type, schedScope(), fn).value
}

/* the seam for the previously-unrouted paths. schedWrite is JUST commitSchedVoid
   — no isInReducer branch (R2-03): dispatch already child-joins a reducer-time
   commit (enlisting schedStore into the parent) and enqueues a post-phase one, so
   a raw branch that skipped enlist would trip the whole-world guard when the
   parent is a NON-scheduler command. schedWriteValue captures the return value
   the toasts read (a draft rename/delete label, toggleWarnOff's bool — R2-11). */
export function schedWrite(type: string, fn: () => void): void { commitSchedVoid(type, fn) }
export function schedWriteValue<T>(type: string, fn: () => T): T { return commitSchedValue(type, fn) }

/* ---- phase 2b: the PUBLISH path (design §3.4) ---------------------------- */
/* the set of issued verIds currently on the loaded week's book — orig[di].id +
   every als[n].id. The Step-5 database adapter reports these ids as ON THE RECORD
   once the backend acknowledges their write (state/disclosure.ts). */
function issuedIdSet(): Set<string> {
  const s = new Set<string>()
  const orig: any = SCHED.orig || {}
  for (const di of Object.keys(orig)) { const id = orig[di] && orig[di].id; if (id) s.add(String(id)) }
  for (const a of ((SCHED.als as any[]) || [])) { if (a && a.id) s.add(String(a.id)) }
  return s
}
/* the loaded week's issued verIds — what a disclosing path (export/print/session
   -end) reports to the disclosure registry (design §3.4). */
export function currentIssuedIds(): string[] {
  return [...issuedIdSet()]
}

/* report the loaded week's issued versions as ON THE SHARED RECORD.
   OWNER RULING 17 Sep 26: the ONLY caller of this is the Step-5 database adapter,
   on a write the backend has acknowledged. Exports, printing and the session
   ending are NOT boundary events and no longer call it (state/disclosure.ts names
   the superseded rule). Unwired at Step 2: with no shared database, nothing can be
   registered, so every issued version stays freely reversible. */
export function discloseCurrentIssued(): void {
  discloseIssued(currentIssuedIds())
}

/* run a publish writer `fn` inside a command: enlist the scheduler store, run the
   existing in-place publish (its histPush/notify latch + release in phase 8 as
   today; toast stays inline), then — if the write actually MINTED a new issued
   version — declare the publish boundary carrying the new ids (design §3.4). A
   refused/no-op publish mints nothing, so no boundary is declared and (with no
   record change) the commit emits nothing. `crossable` is true while none of the
   new ids is on the shared record yet — which at Step 2 is always, there being no
   shared database. Step 3 reads it to choose silent-reverse vs on-the-record undo. */
function commitPublish(type: string, fn: () => void): CommitResult {
  const cmd: Command = {
    type, scope: schedScope(),
    apply: (txn) => {
      txn.enlist(schedStore)
      const before = issuedIdSet()
      fn()
      const added: string[] = []
      for (const id of issuedIdSet()) if (!before.has(id)) added.push(id)
      if (added.length) {
        txn.boundary({ kind: 'publish', ids: added, crossable: !added.some(issuedDisclosed) })
      }
      applyEnd()   // SR-001: commitPublish builds its OWN Command, so it needs the shared advance too
    },
  }
  return commit(cmd)
}

/* first-publish a day (stamps its frozen Original — a sched.orig record + the
   publish boundary). Routed additively: the engine setDayApproved runs unchanged
   inside the command. */
export function commitSetDayApproved(di: number, on: any): CommitResult {
  return commitPublish(SCHED_TYPES.approve, () => setDayApproved(di, on))
}

/* publish one day's changes as its next per-day AL (appends a sched.als record +
   the publish boundary). */
export function commitPublishALDay(di: number): CommitResult {
  return commitPublish(SCHED_TYPES.publishAL, () => publishALDay(di))
}

/* clear a never-published day's draft marks. Not a publish (mints no issued id,
   declares no boundary) — routed through commit only so the pending-book change
   reaches the stream. */
export function commitDiscardPending(): CommitResult {
  return commitSchedVoid(SCHED_TYPES.discard, () => discardPending())
}

/* ---- one-time registration (called from initStore) ----------------------- */
let registered = false
export function registerSchedCommandLayer(): void {
  if (registered) return
  registered = true
  installBaselineInvariants()
  SCHED_BASELINE = histSnap()   // the seed/hydrated world is the first baseline (mirrors People)
  // the re-sync callback fires from history.ts histInit/histRestore, covering
  // undo/redo/quarantine/loadWeek/boot by construction (R2-07: registered at
  // module-eval via wireStore, so a loadWeek/histInit without initStore is covered)
  setSchedResync(resyncSchedBaseline)
  // the afterSchedMutate BACKSTOP (rows A/A2/B): when the board epilogue runs
  // OUTSIDE a command, wrap it so the preceding in-place mutation is captured.
  // isCommitting => already inside a command (a scheduler reducer, or delivery),
  // run raw so nothing double-opens; the enclosing scheduler command's applyEnd
  // advances the baseline. Idle => open the backstop command.
  setSchedEpilogueHook((raw) => {
    if (isCommitting()) raw()
    else commitSchedVoid(SCHED_TYPES.mutate, raw)
  })
  // permissive gate at Step 2 (see the file header) — the real gate is unchanged
  for (const t of Object.values(SCHED_TYPES)) definePermission(t, anyone)
  registerGuardedStore(schedStore)
  // the suppression-context token: a deferred histPush must see HIST.lock as it
  // was when the effect was raised, so a lock-wrapped forward batch records
  // exactly as today (Codex R4-001 / Fable R4-2).
  registerEffectContext({
    key: 'HIST.lock',
    capture: () => HIST.lock,
    install: (snap) => { const prev = HIST.lock; HIST.lock = snap as boolean; return () => { HIST.lock = prev } },
  })
  // the derived registry entries for the scheduler's logical records (§3.1)
  registerRecord({ key: 'weeks:<wk>#<di>', cls: 'record', collection: 'days', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.book/<wk>', cls: 'record', collection: 'sched.book', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.mutes/<wk>', cls: 'record', collection: 'sched.mutes', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.orig/<wk>:<di>', cls: 'record', collection: 'sched.orig', module: 'scheduler' })
  registerRecord({ key: 'weeks:sched.als/<wk>:<n>', cls: 'record', collection: 'sched.als', module: 'scheduler' })
  registerRecord({ key: 'inputs:<iid>', cls: 'record', collection: 'inputs', module: 'inputs' })
  registerRecord({ key: 'plan:all', cls: 'record', collection: 'plan', module: 'plan' })
}
