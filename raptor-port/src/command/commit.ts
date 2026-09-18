/* [ARCH-STACK] Step 2 — the commit gate + transaction engine (design §3.2).

   commit(cmd) opens a transaction and drives the nine phases:
     1. derive actor+origin (§3.5); authorize cmd.type. Reject => nothing applied.
     2. snapshot by EXPLICIT enlistment (txn.enlist) — dynamic, covers the full
        transitive write set incl. causal children. A whole-world debug guard
        (signatures of registered stores) fails the commit if a change appears
        in an un-enlisted store.
     3. apply the reducer (synchronous). A commit/commitAs raised from inside the
        reducer JOINS this transaction (txn.child) — shared snapshot, shared
        rollback, ONE envelope. Causally-related mutations stay in one reducer.
     4. derive Change[] by per-record deep-equal over every enlisted record.
     5. conflict + hard-invariant checks. (put-once on issued records is NOT
        hard-enforced here — Step 3, §3.4.)
     6. on any failure: restore the snapshots, discard the latched effects, emit
        nothing.
     7. emit the envelope; assign seq; advance the per-record revision (§3.3).
     8. release the latch => today's histPush/persistAll/notify/toast run AS
        THEY ALWAYS DID (additive), each carrying its captured suppression token.
     9. drain the post-commit queue SYNCHRONOUSLY, inside the outermost commit():
        a commit a subscriber raises during delivery is ENQUEUED (not nested)
        and drained after, subscribers seeing envelopes strictly in order.

   Undo/redo are NOT routed through commit() at Step 2 (design §0). Legacy
   persistence + the snapshot undo stacks stay authoritative; this layer records
   ALONGSIDE them.
*/
import type {
  Command, CommitEnvelope, CommitResult, Actor, Origin, Change, Boundary,
  EnlistableStore, RecordEntry, Txn,
} from './types'
import { deriveActor, systemActor } from './actor'
import { authorize } from './permissions'
import { deepClone, deepEqual } from './util'
import { captureContexts, installContexts } from './latch'
import { checkHardInvariants } from './harness'

/* ---- module state -------------------------------------------------------- */
let SEQ = 0
type Phase = 'idle' | 'reducer' | 'post'
let phase: Phase = 'idle'
let active: TxnState | null = null
let deliveringSeq: number | undefined = undefined
/* [CMDL-FINISH] §2.1(1) — the CAUSE a phase-8/9-raised commit chains to. Unlike
   deliveringSeq (live only during phase-9 subscriber delivery), causalSeq is live
   across BOTH phase 8 (deferred legacy effects — the LW notify that wakes the
   reconciler) AND phase 9. Set to a pipeline's OWN seq at finalize; a no-op
   pipeline (nothing finalized) keeps its inherited cause so `N → no-op projection
   → changing projection` still chains to N (R2-009). Saved/restored around every
   runPipeline; never −1. */
let causalSeq: number | undefined = undefined

const stream: CommitEnvelope[] = []
const subscribers: Array<(env: CommitEnvelope) => void> = []
const guardedStores: EnlistableStore[] = []
const revisions = new Map<string, number>()
let conflictChecker: ((changes: Change[]) => string | null) | null = null

interface Enlisted { store: EnlistableStore; before: Map<string, RecordEntry>; snap: unknown }
interface Deferred { fn: () => void; snaps: unknown[] }
interface TxnState {
  cmd: Command
  actor: Actor
  origin: Origin
  enlisted: Map<string, Enlisted>
  deferred: Deferred[]
  boundary?: Boundary
  causedBy?: number
  env: CommitEnvelope
  api: Txn
  /* [CMDL-FINISH] CMDLF-012 — a joined child's expectedRevs, merged here so the
     phase-5 conflict check covers the child's staged base too, not only the
     root's (a child-joined command's optimistic guard was silently discarded). */
  childRevs?: Record<string, number>
}
interface QueuedCommit {
  cmd: Command; actor: Actor; origin: Origin; causedBy?: number
  /* [CMDL-FINISH] §2.1(4) / CMDLF-002 — the suppression contexts captured when
     this commit was enqueued (HIST.lock / lw.hist / …). Re-installed for the
     duration of its drained pipeline so a Raptor-driven LW projection's
     recordHistory sees the lock exactly as it did at raise time and pushes NO
     stray undo step. */
  snaps: unknown[]
  resolve: (r: CommitResult) => void
}
const queue: QueuedCommit[] = []

/* ---- public + internal entry points -------------------------------------- */

/* public: forward user writes. Actor+origin derived internally. */
export function commit(cmd: Command): CommitResult {
  return dispatch(cmd, deriveActor(), 'user')
}

/* internal: sync/seed/restore/projection supply actor+origin explicitly.
   NOT exported from the module index. */
export function commitAs(cmd: Command, opts: { actor: Actor; origin: Origin }): CommitResult {
  return dispatch(cmd, opts.actor, opts.origin)
}

/* [CMDL-FINISH] §2.1(5) — a projection commit: the SYSTEM actor + `projection`
   origin. This is how a reconciler (LW sync, People auto-archive, Tracker) emits
   its causally-related child write: raised from inside a reducer it JOINS the
   parent (ONE envelope); raised at phase 8/9 it ENQUEUEs with the parent's seq as
   its cause. `commitAs` stays unexported — reconcilers use this narrow door. No
   `definePermission` is needed for projection types: the system actor
   short-circuits authorize (permissions.ts:49). */
export function commitProjection(cmd: Command): CommitResult {
  return dispatch(cmd, systemActor(), 'projection')
}

function dispatch(cmd: Command, actor: Actor, origin: Origin): CommitResult {
  /* a commit raised from INSIDE a running reducer JOINS the open transaction */
  if (phase === 'reducer' && active) {
    active.api.child(cmd)
    /* the child's changes are appended to the parent envelope at parent phase 4;
       nothing is sealed yet, so return a live reference to the parent env. */
    return { ok: true, seq: -1, envelope: active.env }
  }
  /* a commit raised while delivering envelopes (a subscriber reaction) is
     ENQUEUED, never nested (design §3.2 ph.9). */
  if (phase === 'post') {
    return enqueue(cmd, actor, origin)
  }
  /* outermost: run the pipeline, then drain everything it queued, synchronously.
     The finally is load-bearing (Fable-1): if a deferred legacy effect or a
     subscriber throws during phase 8/9 (a sync pass on odd data, a whiteboard
     quota error, a listener bug — things that today just log and let the edit
     stick), the exception must NOT leave the dispatcher wedged in 'post'/'reducer'
     — otherwise every later commit() enqueues into a dead txn (never applies) and
     every notify() defers into it (repaints stop). Reset unconditionally.
     [CMDL-FINISH] §2.1(3) / C6 — drainQueue runs in the finally, so a throw in
     phase 8/9 still drains the items an earlier subscriber enqueued (each drained
     pipeline is isolated), instead of leaving them to fire on the next unrelated
     commit with their stale captured cause. The pipeline's throw is rethrown
     AFTER the drain + reset. */
  let result!: CommitResult
  try {
    result = runPipeline(cmd, actor, origin, undefined)
  } finally {
    try { drainQueue() } finally { phase = 'idle'; active = null }
  }
  return result
}

function enqueue(cmd: Command, actor: Actor, origin: Origin): CommitResult {
  let resolve!: (r: CommitResult) => void
  const done = new Promise<CommitResult>(r => { resolve = r })
  /* [CMDL-FINISH] §2.1(2) / C10 — chain a cause to NON-`user` origins only. A
     projection/restore/seed raised in phase 8/9 belongs to the causal closure of
     the pipeline that raised it; a `user` commit raised then (a member editing
     their own row from a reaction) is its OWN undo entry, independent — never
     folded into another envelope's closure. causalSeq is the phase-8/9-live
     cause (fallback deliveringSeq for the phase-9 delivery window). */
  const causedBy = origin === 'user' ? undefined : (causalSeq ?? deliveringSeq)
  /* CMDLF-002 — capture the ambient suppression contexts NOW; drainQueue
     re-installs them so the drained pipeline records as it would have inline. */
  queue.push({ cmd, actor, origin, causedBy, snaps: captureContexts(), resolve })
  return { queued: true, done }
}

function drainQueue(): void {
  /* strictly in enqueue order; each drained item may itself enqueue more. A
     throwing queued pipeline resolves as invalid rather than starving the rest
     of the queue (Fable-1). Each item's captured suppression contexts are
     installed for the duration of its pipeline (CMDLF-002). */
  while (queue.length) {
    const q = queue.shift()!
    const restore = installContexts(q.snaps)
    let res: CommitResult
    try { res = runPipeline(q.cmd, q.actor, q.origin, q.causedBy) }
    catch (e) { res = errResult(e) }
    finally { restore() }
    q.resolve(res)
  }
}

/* ---- the pipeline -------------------------------------------------------- */
function runPipeline(cmd: Command, actor: Actor, origin: Origin, causedBy?: number): CommitResult {
  const env: CommitEnvelope = {
    seq: -1, at: '', actor, origin, scope: cmd.scope, type: cmd.type,
    changes: [], causedBy, emit: origin !== 'remote',
  }
  const txn: TxnState = { cmd, actor, origin, enlisted: new Map(), deferred: [], env, api: null as any }
  txn.api = makeTxnApi(txn)
  active = txn
  phase = 'reducer'
  /* [CMDL-FINISH] §2.1(1) — this pipeline's causal context. INHERIT the cause it
     was raised with (a queued projection's captured causedBy); finalize replaces
     it with this pipeline's OWN seq once it emits. A no-op keeps the inherited
     cause so a no-op projection that raises a changing projection still chains to
     N (R2-009). Restored to the enclosing value in the finally — a drained
     pipeline never leaks its cause into the next drained item. */
  const savedCausal = causalSeq
  causalSeq = causedBy
  try {
   try {
    // phase 1 — authorize
    if (!authorize(cmd.type, actor, cmd.meta)) {
      throw new CmdError('unauthorized', `type ${cmd.type} not permitted for ${actor.role}`)
    }
    // phase 2 — whole-world guard: signatures of every registered store, pre-apply
    const guardBefore = guardSnapshot()
    // phase 3 — apply the reducer (children join via txn.child)
    cmd.apply(txn.api)
    // phase 2 (check) — a change in an un-enlisted registered store is a bug
    guardCheck(guardBefore, txn)
    // phase 4 — derive Change[] by per-record deep-equal over enlisted records
    txn.env.changes = deriveChanges(txn)
    // phase 5 — conflict + hard invariants
    // [CMDL-FINISH] §3 (F8) — the SCOPED, per-command optimistic-concurrency
    // guard: each expectedRevs entry must still match the current revision, else
    // the base the caller staged against has moved and this commit is a stale
    // conflict (rolled back, emits nothing). Checked against the PRE-finalize
    // revision map (finalize bumps them). The undo step is the consumer at Step 3.
    checkExpectedRevs(cmd.expectedRevs)     // the root command's staged base
    checkExpectedRevs(txn.childRevs)        // [CMDL-FINISH] CMDLF-012 — every joined child's too
    if (conflictChecker) {
      const c = conflictChecker(txn.env.changes)
      if (c) throw new CmdError('conflict', c)
    }
    const bad = checkHardInvariants(txn.env)
    if (bad) throw new CmdError('invalid', bad)
    // phase 7 — emit, UNLESS the command changed no record. An empty-change
    // commit (a refused/no-op write — e.g. an unsigned publish that toasted and
    // returned) records NO envelope: no seq, nothing on the stream, no revision
    // advance, no subscriber delivery — but its latched repaints STILL release
    // below, so a no-op that repainted looks exactly as it did pre-Step-2
    // (design approach decision #5). A reducer THROW is the separate path above
    // (rollback + emit nothing); this is the clean, non-throwing no-op.
    if (txn.env.changes.length) finalize(txn)
  } catch (e) {
    // phase 6 — rollback: restore snapshots, discard latched effects, emit nothing
    rollback(txn)
    active = null
    return errResult(e)
  }

  // phases 8 + subscriber delivery run at 'post' so a reaction enqueues
  const emitted = txn.env.changes.length > 0
  phase = 'post'
  let firstErr: unknown = undefined
  const take = (e: unknown) => { if (e !== undefined && firstErr === undefined) firstErr = e }
  try {
    take(releaseLatch(txn))              // phase 8 — legacy effects, with suppression tokens (always)
    if (emitted) take(deliver(txn.env))  // phase 9 — stream consumers (in order); reactions enqueue
    take(releaseLatch(txn))              // any effect a subscriber deferred DURING delivery (Fable-9)
  } finally {
    active = null                        // never leave a dead txn active (dispatch's finally also guards)
  }
  if (firstErr !== undefined) throw firstErr   // surface it AFTER the phase/active reset (Fable-1)
  // an un-emitted no-op returns ok with seq -1 (nothing was recorded)
  return { ok: true, seq: emitted ? txn.env.seq : -1, envelope: txn.env }
  } finally {
    causalSeq = savedCausal   // restore the enclosing cause (§2.1(1))
  }
}

function finalize(txn: TxnState): void {
  txn.env.seq = SEQ++
  // [CMDL-FINISH] §2.1(1) — this pipeline now HAS a seq; a commit its phase-8/9
  // effects raise chains to it (a no-op that never reached here keeps the cause
  // it inherited — R2-009).
  causalSeq = txn.env.seq
  txn.env.at = new Date().toISOString()
  if (txn.boundary) txn.env.boundary = txn.boundary
  // per-record revision map (§3.3): every authoritative write advances the
  // touched record's revision; the envelope pins the causal result's revisions.
  const revs: Record<string, number> = {}
  for (const c of txn.env.changes) {
    const key = `${c.collection}/${c.id}`
    const next = (revisions.get(key) || 0) + 1
    revisions.set(key, next)
    revs[key] = next
  }
  txn.env.revs = revs
  stream.push(txn.env)
}

function deliver(env: CommitEnvelope): unknown {
  deliveringSeq = env.seq
  let firstErr: unknown = undefined
  try {
    /* isolate each subscriber so one throwing consumer does not stop the others
       from seeing the envelope (Fable-1); return the first error afterwards. */
    for (const fn of subscribers.slice()) {
      try { fn(env) } catch (e) { if (firstErr === undefined) firstErr = e; console.error('[commit] subscriber threw', e) }
    }
  } finally {
    deliveringSeq = undefined
  }
  return firstErr
}

/* ---- the transaction API handed to reducers ------------------------------ */
function makeTxnApi(txn: TxnState): Txn {
  return {
    get actor() { return txn.actor },
    get origin() { return txn.origin },
    enlist(store: EnlistableStore) {
      if (txn.enlisted.has(store.key)) return
      txn.enlisted.set(store.key, {
        store,
        before: cloneRecords(store.records()),
        snap: store.capture(),
      })
    },
    child(cmd: Command) {
      /* a joined child inherits the PARENT's declared permission (Fable R4-7):
         no re-authorization. It shares the snapshot set (its enlist calls add to
         txn.enlisted), the rollback, and the ONE envelope. [CMDL-FINISH]
         CMDLF-012 — its expectedRevs join the parent's phase-5 conflict check
         (checked pre-finalize, same as the root's). */
      if (cmd.expectedRevs) txn.childRevs = Object.assign(txn.childRevs || {}, cmd.expectedRevs)
      cmd.apply(txn.api)
    },
    boundary(b: Boundary) { txn.boundary = b },
  }
}

/* ---- change derivation --------------------------------------------------- */
function cloneRecords(m: Map<string, RecordEntry>): Map<string, RecordEntry> {
  const out = new Map<string, RecordEntry>()
  for (const [k, e] of m) out.set(k, { collection: e.collection, id: e.id, value: deepClone(e.value) })
  return out
}

function deriveChanges(txn: TxnState): Change[] {
  const changes: Change[] = []
  for (const { store, before } of txn.enlisted.values()) {
    const after = store.records()
    const keys = new Set<string>([...before.keys(), ...after.keys()])
    for (const k of keys) {
      const b = before.get(k)
      const a = after.get(k)
      if (a && !b) {
        changes.push({ op: 'put', collection: a.collection, id: a.id, after: deepClone(a.value) })
      } else if (b && !a) {
        changes.push({ op: 'delete', collection: b.collection, id: b.id, before: b.value })
      } else if (b && a && !deepEqual(b.value, a.value)) {
        changes.push({ op: 'put', collection: a.collection, id: a.id, before: b.value, after: deepClone(a.value) })
      }
    }
  }
  return changes
}

/* ---- the whole-world debug guard ----------------------------------------- */
function storeSignature(s: EnlistableStore): string {
  if (s.signature) return s.signature()
  const parts: string[] = []
  for (const [k, e] of s.records()) parts.push(k + '=' + JSON.stringify(e.value))
  parts.sort()
  return parts.join('')
}
interface GuardEntry { sig: string; snap: unknown; store: EnlistableStore }
function guardSnapshot(): Map<string, GuardEntry> {
  const m = new Map<string, GuardEntry>()
  for (const s of guardedStores) {
    /* capture the restorable snapshot AND, separately, the guard signature.
       [ARCH-STACK] follow-up #1 (SR-005): the signature must come from
       storeSignature(s) (i.e. s.signature()), NOT the capture() string. The old
       `typeof snap==='string' ? snap : …` shortcut was only valid while
       capture()===signature(); the scheduler store now returns a LAGGING BASELINE
       from capture() while signature() stays LIVE (histSnap()), so reading the
       signature off capture() would compare the stale baseline before and after
       and blind the whole-world guard. guardCheck below also compares against
       storeSignature(s), so both ends must use the same (live) function. */
    const snap = s.capture()
    const sig = storeSignature(s)
    m.set(s.key, { sig, snap, store: s })
  }
  return m
}
function guardCheck(before: Map<string, GuardEntry>, txn: TxnState): void {
  /* a change in an un-enlisted registered store is a missing txn.enlist() (a
     programming bug). Restore the offending store from its snapshot BEFORE
     throwing so the guard failure is all-or-nothing (Codex-1) — otherwise the
     un-enlisted store stays mutated while the commit returns invalid, defeating
     the guard and the atomicity contract. The throw then rolls back the enlisted
     stores too. */
  let bad: string | null = null
  for (const s of guardedStores) {
    if (txn.enlisted.has(s.key)) continue // enlisted stores are allowed to change
    const rec = before.get(s.key)
    if (rec && rec.sig !== storeSignature(s)) {
      rec.store.restore(rec.snap)
      if (!bad) bad = s.key
    }
  }
  if (bad) throw new CmdError('invalid', `un-enlisted store "${bad}" changed during ${txn.cmd.type} — a txn.enlist() is missing`)
}

/* [CMDL-FINISH] §3 (F8) — the scoped optimistic-concurrency check, against the
   PRE-finalize revision map (finalize bumps them). Shared by the root command
   and every joined child (CMDLF-012). */
function checkExpectedRevs(exp: Record<string, number> | undefined): void {
  if (!exp) return
  for (const key of Object.keys(exp)) {
    const have = revisions.get(key) || 0
    if (have !== exp[key]) throw new CmdError('conflict', `stale revision for ${key}: expected ${exp[key]}, have ${have}`)
  }
}

/* ---- latch release + rollback -------------------------------------------- */
function releaseLatch(txn: TxnState): unknown {
  /* run EVERY deferred effect even if one throws (Fable-1): one bad subscriber
     must not starve the others (histPush/persistAll/notify all need to run).
     Return the first error (the tail aggregates + rethrows once, after the phase
     reset) to preserve today's error visibility without wedging the dispatcher. */
  let firstErr: unknown = undefined
  const batch = txn.deferred.splice(0)   // effects deferred DURING this drain re-queue onto txn.deferred
  for (const d of batch) {
    const restore = installContexts(d.snaps)
    try { d.fn() } catch (e) { if (firstErr === undefined) firstErr = e; console.error('[commit] deferred effect threw', e) } finally { restore() }
  }
  return firstErr
}
function rollback(txn: TxnState): void {
  for (const { store, snap } of txn.enlisted.values()) store.restore(snap)
  txn.deferred.length = 0 // discarded, never run
}

/* ---- errors -------------------------------------------------------------- */
type CmdErrorKind = 'conflict' | 'invalid' | 'unauthorized' | 'refused'
class CmdError extends Error {
  kind: CmdErrorKind
  constructor(kind: CmdErrorKind, message: string) {
    super(message); this.kind = kind
  }
}
/* [CMDL-FINISH] §6 / R3-003 — a DELIBERATE refusal (a protected-week clear, an
   off-week edit), NOT a bug. Thrown from a reducer it triggers the same phase-6
   rollback as any CmdError (every enlisted store is restored), but it is SILENT:
   errResult maps it to `{ok:false, reason:'refused'}` and — being a CmdError —
   it never hits the bug-shaped console.error below. The wrapper reads the result
   and maps `ok:false`→false rather than surfacing a scary log. */
export class CmdRefused extends CmdError {
  constructor(message: string) { super('refused', message) }
}
function errResult(e: unknown): CommitResult {
  if (e instanceof CmdError) return { ok: false, reason: e.kind, message: e.message }
  // a reducer that threw mid-way is a rolled-back, invalid command (property (a)).
  // Surface it — the {ok:false} is not read by today's call sites, so without this
  // a reducer bug that used to reach the console goes silent (Fable-12).
  console.error('[commit] reducer threw (rolled back)', e)
  return { ok: false, reason: 'invalid', message: (e as any)?.message || String(e) }
}

/* ---- latch API for wired legacy effects (phases 2-5) --------------------- */
/* a legacy side-effect calls this: if a commit is in flight, the effect is
   deferred (to run at phase 8 with its captured suppression token) and true is
   returned; otherwise false and the caller runs it inline exactly as today. */
export function deferEffect(fn: () => void): boolean {
  if (active && (phase === 'reducer' || phase === 'post')) {
    active.deferred.push({ fn, snaps: captureContexts() })
    return true
  }
  return false
}
export function isCommitting(): boolean {
  return active != null && (phase === 'reducer' || phase === 'post')
}
/* [CMDL-FINISH] §2.1(5) — a reconciler router needs to tell a NESTED causal child
   (raised while the reducer is still running → child-joins the parent) from a
   phase-8/9 raise (→ enqueues). `isInReducer()` is true only during phase 3. */
export function isInReducer(): boolean {
  return active != null && phase === 'reducer'
}
export function commitPhase(): 'idle' | 'reducer' | 'post' { return phase }

/* ---- stream + subscriptions ---------------------------------------------- */
export function onCommit(fn: (env: CommitEnvelope) => void): () => void {
  subscribers.push(fn)
  return () => { const i = subscribers.indexOf(fn); if (i >= 0) subscribers.splice(i, 1) }
}
export function commandStream(): readonly CommitEnvelope[] { return stream }
export function revisionOf(collection: string, id: string): number {
  return revisions.get(`${collection}/${id}`) || 0
}

/* ---- store registration for the debug guard ------------------------------ */
export function registerGuardedStore(s: EnlistableStore): void {
  if (!guardedStores.some(x => x.key === s.key)) guardedStores.push(s)
}

/* ---- conflict checker (MemoryDoor in tests; Step 5 real) ----------------- */
export function setConflictChecker(fn: ((changes: Change[]) => string | null) | null): void {
  conflictChecker = fn
}

/* ---- test-only reset ----------------------------------------------------- */
export function _resetCommandEngine(): void {
  SEQ = 0; phase = 'idle'; active = null; deliveringSeq = undefined
  stream.length = 0; subscribers.length = 0; guardedStores.length = 0
  revisions.clear(); queue.length = 0; conflictChecker = null
}
