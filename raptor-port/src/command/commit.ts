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
import { deriveActor } from './actor'
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
}
interface QueuedCommit {
  cmd: Command; actor: Actor; origin: Origin; causedBy?: number
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
    return enqueue(cmd, actor, origin, deliveringSeq)
  }
  /* outermost: run the pipeline, then drain everything it queued, synchronously.
     The finally is load-bearing (Fable-1): if a deferred legacy effect or a
     subscriber throws during phase 8/9 (a sync pass on odd data, a whiteboard
     quota error, a listener bug — things that today just log and let the edit
     stick), the exception must NOT leave the dispatcher wedged in 'post'/'reducer'
     — otherwise every later commit() enqueues into a dead txn (never applies) and
     every notify() defers into it (repaints stop). Reset unconditionally. */
  try {
    const result = runPipeline(cmd, actor, origin, undefined)
    drainQueue()
    return result
  } finally {
    phase = 'idle'
    active = null
  }
}

function enqueue(cmd: Command, actor: Actor, origin: Origin, causedBy?: number): CommitResult {
  let resolve!: (r: CommitResult) => void
  const done = new Promise<CommitResult>(r => { resolve = r })
  queue.push({ cmd, actor, origin, causedBy, resolve })
  return { queued: true, done }
}

function drainQueue(): void {
  /* strictly in enqueue order; each drained item may itself enqueue more. A
     throwing queued pipeline resolves as invalid rather than starving the rest
     of the queue (Fable-1). */
  while (queue.length) {
    const q = queue.shift()!
    let res: CommitResult
    try { res = runPipeline(q.cmd, q.actor, q.origin, q.causedBy) }
    catch (e) { res = errResult(e) }
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
}

function finalize(txn: TxnState): void {
  txn.env.seq = SEQ++
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
         txn.enlisted), the rollback, and the ONE envelope. */
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
    /* capture the restorable snapshot; for a string-snapshot store (all the ones
       we register: schedStore/settings/people, whose capture() === signature())
       the snapshot IS the signature, so this costs no extra serialization. */
    const snap = s.capture()
    const sig = typeof snap === 'string' ? snap : storeSignature(s)
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
class CmdError extends Error {
  kind: 'conflict' | 'invalid' | 'unauthorized'
  constructor(kind: 'conflict' | 'invalid' | 'unauthorized', message: string) {
    super(message); this.kind = kind
  }
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
