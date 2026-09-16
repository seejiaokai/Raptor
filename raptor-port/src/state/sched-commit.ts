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
  commit, definePermission, anyone, registerRecord, registerGuardedStore,
  registerEffectContext, installBaselineInvariants,
} from '../command'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { CURWEEK } from '../engine/waves'
import { WARNOFF } from './view'
import { PLANPUCKS, DAYRMK } from './plan'
import { HIST, histSnap, histRestore } from './history'

/* ---- the scheduler EnlistableStore (the histSnap world, decomposed) ------- */
function schedRecords(): Map<string, RecordEntry> {
  const m = new Map<string, RecordEntry>()
  const wk = CURWEEK
  // days — the whole day, incl rows + secOrder (rows are NESTED, design §3.1)
  for (let di = 0; di < DAYS.length; di++) {
    const id = `${wk}#${di}`
    m.set(`days/${id}`, { collection: 'days', id, value: DAYS[di] })
  }
  // the mutable book (excludes the issued orig/als, which are their own records)
  const book = {
    c: SCHED.changes, p: SCHED.pending, ad: SCHED.added, al: SCHED.al, ok: SCHED.dayOK,
    sg: SCHED.sign, sb: SCHED.signBind, cv: SCHED.cur, dr: SCHED.drafts, cd: SCHED.curDraft,
    v: SCHED.ridV, am: SCHED.amV,
  }
  m.set(`sched.book/${wk}`, { collection: 'sched.book', id: wk, value: book })
  // muted checks (WARNOFF)
  m.set(`sched.mutes/${wk}`, { collection: 'sched.mutes', id: wk, value: [...WARNOFF] })
  // issued records — append-only-INTENDED (put-once enforcement is Step 3, §3.4)
  for (const di of Object.keys(SCHED.orig || {})) {
    const id = `${wk}:${di}`
    m.set(`sched.orig/${id}`, { collection: 'sched.orig', id, value: (SCHED.orig as any)[di] })
  }
  const als = (SCHED.als as any[]) || []
  for (let n = 0; n < als.length; n++) {
    const id = `${wk}:${n}`
    m.set(`sched.als/${id}`, { collection: 'sched.als', id, value: als[n] })
  }
  // inputs are GLOBAL and ride the same histSnap world (own scope in the envelope)
  for (const r of INPUTS as any[]) {
    const id = inpId(r)
    m.set(`inputs/${id}`, { collection: 'inputs', id, value: r })
  }
  // the Inputs-calendar planning layer
  m.set('plan/all', { collection: 'plan', id: 'all', value: { pp: PLANPUCKS, dm: DAYRMK } })
  return m
}

export const schedStore: EnlistableStore = {
  key: 'scheduler',
  capture: () => histSnap(),
  restore: (snap) => { histRestore(snap as string) },
  records: schedRecords,
  signature: () => histSnap(),
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
} as const

const schedScope = (): Scope => ({ module: 'sched', weekId: CURWEEK })
const inputsScope = (): Scope => ({ module: 'inputs' })

/* run a scheduler mutation `fn` inside a command: enlist the scheduler store
   (snapshot), run the existing in-place write (its HOOKS effects latch and
   release in phase 8), derive the record-level changes, emit. `fn` may return a
   value (writeInputs returns a boolean) which is captured and returned. */
function commitSched<T>(type: string, scope: Scope, fn: () => T): { result: CommitResult; value: T } {
  let value!: T
  const cmd: Command = { type, scope, apply: (txn) => { txn.enlist(schedStore); value = fn() } }
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

/* ---- one-time registration (called from initStore) ----------------------- */
let registered = false
export function registerSchedCommandLayer(): void {
  if (registered) return
  registered = true
  installBaselineInvariants()
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
