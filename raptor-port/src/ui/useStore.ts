import { useSyncExternalStore } from 'react'
import { subscribe, getVersion } from '../state/store'

/* one hook: components re-render whenever the store's version moves */
export function useVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion)
}
