/* [ARCH-STACK] Step 2 — the one write/command layer: public surface.

   commitAs() is deliberately NOT re-exported here (design §3.5): only internal
   wiring (sync/seed/restore) imports it from './commit'. The public forward-write
   entry point is commit().
*/
export type {
  Command, Change, CommitEnvelope, CommitResult, Actor, Origin, Scope, Module,
  LogicalCollection, Boundary, Txn, EnlistableStore, RecordEntry,
} from './types'
export { isOk, isQueued } from './types'

export {
  commit, onCommit, commandStream, revisionOf,
  deferEffect, isCommitting, registerGuardedStore, setConflictChecker,
} from './commit'

export { deriveActor, systemActor } from './actor'
export {
  definePermission, authorize, hasPermission, anyone, adminOnly, ownOrAdmin,
} from './permissions'
export { registerEffectContext } from './latch'
export {
  defineInvariant, invariants, checkHardInvariants, installBaselineInvariants,
} from './harness'
export {
  LOGICAL_TO_BLOB, registerRecord, registryEntries, recordEntries,
} from './registry'
export type { RegistryEntry, RegistryClass } from './registry'
export { MemoryDoor } from './door'
export type { Door, DoorRecord, DoorResult } from './door'
