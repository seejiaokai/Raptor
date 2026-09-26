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
  commitProjection, isInReducer, commitPhase, CmdRefused, setTxnWrapper,
} from './commit'
export type { TxnWrapper, TxnHandle, TxnSavepoint } from './commit'
/* [CMDL-FINISH] §2.3 — the reconciler/gesture wiring (LW router, Tracker
   trkGesture) reads the engine through these `cmd*` names. Aliases, not new
   behaviour: cmdCommit is the public forward-write, cmdIsCommitting/cmdDeferEffect
   the phase-8/9 latch primitives. */
export {
  commit as cmdCommit, isCommitting as cmdIsCommitting, deferEffect as cmdDeferEffect,
} from './commit'

export { deriveActor, systemActor } from './actor'
export {
  definePermission, authorize, hasPermission, anyone, adminOnly, ownOrAdmin,
  setPermissionResolver, registeredTypes,
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
