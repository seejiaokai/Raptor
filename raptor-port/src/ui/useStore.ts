import { useSyncExternalStore } from 'react'
import { subscribe, getVersion, subscribeBoard, getBoardVersion } from '../state/store'

/* one hook: components re-render whenever the store's version moves */
export function useVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion)
}

/* Board-only view changes (currently day navigation) do not invalidate the
   heavy week subscribers behind the full-screen board. */
export function useBoardVersion() {
  return useSyncExternalStore(subscribeBoard, getBoardVersion, getBoardVersion)
}
