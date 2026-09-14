// src/command/types.ts
/* [ARCH-STACK] Step 2 — the ONE write/command layer (RC4).
   Module-agnostic contracts. The command core knows collections, ids, record
   VALUES and VERSIONS — nothing scheduler/LeaveWar/Tracker-specific. Each module
   supplies an adapter that maps its state to these records (increments 2/2b/2c).
   Plan: docs/superpowers/specs/2026-09-14-arch-stack-2-command-layer-spec.md (Rev 4). */

/** Where a change came from — provenance, NEVER authority (spec §2.3).
    - causal:  a user action; undoable.
    - derived: a deterministic projection produced by a hook INSIDE a causal
               command (§2.4 step 2); recomputed, never a separate undo entry.
    - system:  a producer with NO causal parent (the notify-driven sync passes,
               the post-out archive, week-landing); never an undo entry. This is
               what stops a Leave War undo from creating a scheduler undo step (RC1).
    - boot:    seed / migration. */
export type Origin = 'causal' | 'derived' | 'system' | 'boot'

export type Op = 'put' | 'delete'

/** One record-level change. `before`/`after` are WHOLE record values (enable
    inverse-patch undo and content diffing). `baseVersion` is the version the
    writer last read — the optimistic-concurrency precondition (0 for a create). */
export interface Change {
  collection: string
  id: string
  op: Op
  before: unknown | null
  after: unknown | null
  baseVersion: number
}

/** An atomic transaction: an ordered set of changes with metadata. Applied
    all-or-nothing through commit() (spec §2.3/§2.4). */
export interface Command {
  id: string
  ts: number
  /** The trusted SESSION identity, NOT whoami()'s account label (spec §2.3). */
  principal: string
  origin: Origin
  kind: string
  label?: string
  changes: Change[]
  /** Merge into the previous same-principal UNDO entry by key (the Tracker
      keystroke rule); audit keeps both. */
  coalesce?: { key: string; windowMs: number }
}

/** The current state of one record in the in-memory store. `version` is 0 and
    `snapshot` is null for a record that has never existed; a deleted record keeps
    a tombstone (deleted:true, value:null) at a monotonically-increasing version. */
export interface RecordState {
  value: unknown
  version: number
  deleted: boolean
}
