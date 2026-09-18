import { useSyncExternalStore } from 'react'
import { subscribe, getVersion, subscribeBoard, getBoardVersion } from '../state/store'
import { subscribeUndo, getUndoVersion } from '../undo'

/* one hook: components re-render whenever the store's version moves */
export function useVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion)
}

/* [GLOBAL-UNDO] §13 phase 2 (C4) — the retargeted Undo/Redo buttons re-render on
   the TIMELINE's own version, not a domain notify: a pure-Leave-War undo bumps
   only the LW store, which would leave the scheduler's Undo label/disabled stale
   (and vice-versa), and notifying both domain stores just to refresh a button
   would run their reconcilers on every record/undo/redo. This is a plain version
   counter over undoState(). */
export function useUndoVersion() {
  return useSyncExternalStore(subscribeUndo, getUndoVersion, getUndoVersion)
}

/* Board-only view changes (currently day navigation) do not invalidate the
   heavy week subscribers behind the full-screen board. */
export function useBoardVersion() {
  return useSyncExternalStore(subscribeBoard, getBoardVersion, getBoardVersion)
}
