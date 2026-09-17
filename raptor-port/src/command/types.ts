/* [ARCH-STACK] Step 2 — the one write/command layer (ADDITIVE).

   This module ADDS a command gate + a record-level change stream and runs them
   ALONGSIDE today's machinery (persistAll / HOOKS.histPush / the three snapshot
   undo stacks all stay and behave exactly as today). Every FORWARD write is
   routed through commit(), which calls today's in-place writers and then emits
   an envelope onto the stream. Undo/redo are NOT routed through commit() at
   Step 2 — they run exactly as now (design §0/§3.2).

   The stream is the foundation later steps consume (Step 3 global undo, Step 5
   record-level persistence + Dataverse). No cutover of persistence or undo
   happens here — those are Steps 3/5. Nothing here changes a rendered byte
   (tfin.js 728/0) or how persistence/undo currently behave.

   Design of record: docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md
*/

/* WHERE a change came from (design §3.3). Only `user` is an undo entry (Step 3
   consumes it); `remote` applies silently (emit:false, no echo); `projection`
   /`restore`/`seed` emit locally but are never undo entries. */
export type Origin = 'user' | 'remote' | 'projection' | 'restore' | 'seed'

/* The logical record collections — the DERIVED-from-code registry (design §3.1).
   A logical record is the unit undo/persistence/sync reason about; several may
   share one physical blob (the LOGICAL_TO_BLOB map in registry.ts). Rows are
   NESTED in the day record: a slot edit yields ONE `days` Change, not a day +
   a row Change (R3-6). */
export type LogicalCollection =
  // scheduler — mutable book + per-day/per-week records
  | 'days' | 'sched.book' | 'sched.mutes'
  // scheduler — issued (append-only-INTENDED; enforcement is Step 3, §3.4)
  | 'sched.orig' | 'sched.als'
  // the other scheduler-side stores
  | 'inputs' | 'plan' | 'people' | 'settings'
  // off-week session memory (the weekstash) — one record per stashed week, so a
  // protected-week clear that drops it rolls back atomically ([CMDL-FINISH] §6)
  | 'weekstash'
  // leave war (per-cell / per-bid so the revision map is cell-granular — R4-005)
  | 'lw.cell' | 'lw.bid' | 'lw.war'
  | 'lw.ledger' | 'lw.balances' | 'lw.oilpolicy' | 'lw.postouts' | 'lw.current' | 'lw.config'
  // tracker (the v3: keys)
  | 'trk.marks' | 'trk.dates' | 'trk.roster' | 'trk.layout' | 'trk.syls'
  | 'trk.plan' | 'trk.pace' | 'trk.lulls' | 'trk.eventinfo' | 'trk.catalogue' | 'trk.courses'

export type Module = 'sched' | 'inputs' | 'plan' | 'people' | 'settings' | 'lw' | 'trk'

/* The undo-scope key (design §3.7). Step 3 keys the retiring snapshot stacks on
   scope.module + origin so a foreign module's command never pushes another's
   stack; Step 2 only records it. */
export type Scope =
  | { module: 'sched'; weekId: string }
  | { module: 'inputs' }
  | { module: 'plan' }
  | { module: 'people' }
  | { module: 'settings' }
  | { module: 'lw'; warId: string }
  | { module: 'trk'; courseId: string; sylId: string; student?: string }

/* WHO made the change (design §3.5). Account id + effective role from SESSION
   (SESSION.role `main`->`member`); ownership personId from the ME/viewer
   binding (defense-in-depth parity only — real identity arrives with Step 5).
   The system/headless actor's personId is undefined (Fable R4-6). */
export interface Actor {
  id: string
  role: 'admin' | 'member' | 'system'
  personId?: string
  session: any
}

/* A derived per-record diff (design §3.1). `Change` is a DERIVED OUTPUT
   (per-record deep-equal after apply), never a Command input. */
export interface Change {
  op: 'put' | 'delete'
  collection: LogicalCollection
  id: string
  staged?: boolean
  before?: unknown
  after?: unknown
}

/* The publish boundary flag Step 3 reads to choose silent-reverse vs
   forward-withdrawal (design §3.4). `crossable` flips to false on an explicit,
   monotonic disclosure signal keyed by the issued id. */
export interface Boundary {
  kind: 'publish'
  ids: string[]
  crossable: boolean
}

/* One recorded envelope on the stream (design §3.1). */
export interface CommitEnvelope {
  seq: number
  at: string
  actor: Actor
  origin: Origin
  scope: Scope
  type: string
  changes: Change[]
  boundary?: Boundary
  causedBy?: number
  /* per-logical-record revisions AFTER this commit (design §3.3), keyed
     `${collection}/${id}`. Undo (Step 3) pins the causal result's revisions. */
  revs?: Record<string, number>
  /* remote changes apply silently — the fold/persistence subscriber does not
     echo them (design §3.3). Annotated now; consumed at Step 5. */
  emit?: boolean
}

/* A store that can be enlisted in a transaction (design §3.2). In-place
   singleton mutation has no write seam to auto-hook, so each wrapped writer
   calls txn.enlist(store) BEFORE mutating (Fable R4-3). */
export interface RecordEntry {
  collection: LogicalCollection
  id: string
  /* OPTIONAL only so a write() DELETE entry can omit it; a store's records()
     output and every 'put' entry always carry it. */
  value?: unknown
  /* [CMDL-FINISH] §3 — only meaningful in a write() ENTRY (the inverse record-set
     an undo applies): 'delete' REMOVES the record, 'put' (the default) creates or
     overwrites it. A store's records() output leaves it undefined (records are
     just current state). */
  op?: 'put' | 'delete'
}
export interface EnlistableStore {
  /* identity for the enlisted-set map (one per physical store) */
  key: string
  /* deep snapshot for rollback (opaque; only restore() reads it) */
  capture(): unknown
  /* roll back to a snapshot from capture() — real even with legacy persistAll
     installed, because the side-effects were latched, not executed (§3.2 ph.6) */
  restore(snap: unknown): void
  /* enumerate the store's current logical records, keyed `${collection}/${id}`.
     Used to derive Change[] (before vs after) and by the whole-world debug
     guard to catch a change in an un-enlisted store. */
  records(): Map<string, RecordEntry>
  /* OPTIONAL cheap whole-store signature for the debug guard (design §3.2):
     the scheduler's histSnap() / LW's historySnap() are already computed
     strings, so the guard compares them instead of deep-cloning records() of
     every registered store on every commit (keeps the perf ceilings). Falls
     back to a records()-derived signature when absent. */
  signature?(): string
  /* OPTIONAL batch, delete-aware, per-collection record write ([CMDL-FINISH] §3,
     F8/GU-007). Applies ALL entries to live state first, THEN one derived-index
     rebuild; persist + HOOKS.histPush + notify release at the TRANSACTION
     boundary (phase 8) via cmdDeferEffect, NEVER inline — so a multi-store
     restore never reconciles on a half-applied world. Called ONLY from a reducer
     that already enlisted this store, and never opens its own command. The undo
     step (Step 3) is the consumer; at CMDL-FINISH it is built + unit-tested but
     has no production caller (no stream-driven undo yet). `opts.allowIssued`
     lets the restore path write append-only-intended issued records
     (sched.orig/sched.als); a normal write refuses them (C7). */
  write?(entries: RecordEntry[], opts?: { allowIssued?: boolean }): void
}

/* The reducer's handle onto the open transaction (design §3.2). */
export interface Txn {
  /* snapshot a store before mutating it (dynamic enlistment) */
  enlist(store: EnlistableStore): void
  /* a commit/commitAs raised from inside the reducer JOINS this transaction
     (shared snapshot set, shared rollback, ONE envelope, changes appended). */
  child(cmd: Command): void
  /* declare the publish boundary for this commit (design §3.4) */
  boundary(b: Boundary): void
  /* the actor/origin this transaction is running as (read-only) */
  readonly actor: Actor
  readonly origin: Origin
}

/* apply = SYNCHRONOUS mutation only. Async prompts/reads (uiPrompt, confirms,
   await sSet) are moved OUTSIDE commit; causally-related mutations stay in ONE
   reducer (design §3.2 / R3-004). */
export interface Command {
  type: string
  scope: Scope
  meta?: any
  apply: (txn: Txn) => void
  /* OPTIONAL per-command optimistic-concurrency guard ([CMDL-FINISH] §3, F8):
     keyed `${collection}/${id}` → the revision the caller read before staging
     this command. Checked at phase 5 — a mismatch REJECTS as `conflict` and
     rolls back. The undo step (Step 3) is the consumer that pins these; at this
     step no production path sets it (the only checker in use is MemoryDoor in
     tests), so it is latent. */
  expectedRevs?: Record<string, number>
}

/* commit() outcome. A queued (subscriber-raised) commit returns
   { queued:true, done } — not a synchronous final result (R3-007); by the time
   the outer commit() returns, `done` is already resolved (synchronous drain,
   Fable R4-5). */
export type CommitResult =
  | { ok: true; seq: number; envelope: CommitEnvelope }
  | { ok: false; reason: 'conflict' | 'invalid' | 'unauthorized' | 'refused'; message?: string }
  | { queued: true; done: Promise<CommitResult> }

export function isOk(r: CommitResult): r is { ok: true; seq: number; envelope: CommitEnvelope } {
  return (r as any).ok === true
}
export function isQueued(r: CommitResult): r is { queued: true; done: Promise<CommitResult> } {
  return (r as any).queued === true
}
