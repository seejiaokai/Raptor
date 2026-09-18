/* [ARCH-STACK] Step 3 — one global undo: public surface.

   installUndo() wires the timeline to the command stream (phase 1). The module
   cutover (phase 2+) calls setCutoverModules + registerUndoStore + setUndoHooks
   and retargets the legacy Undo/Redo entry points at globalUndo/globalRedo (§9).
*/
export {
  installUndo, globalUndo, globalRedo, undoState, mayReverse,
  registerUndoStore, setCutoverModules, setUndoHooks,
} from './timeline'
export type { UndoHooks, UndoResult } from './timeline'
export { describeEntry, bubbleText } from './describe'
export type { UndoEntry, RecordCtx, RecordOwner } from './types'
