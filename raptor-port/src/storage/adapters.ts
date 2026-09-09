/* THE THREE EXISTING DOORS, RE-POINTED. Nothing above a door changes: the
   scheduler's `store` (engine/hooks.ts) still calls getItem/setItem with its
   sqn142_ prefix, Leave War's store still calls read/write, the Tracker's
   storage.js still exposes its async get/set/delete/list. Each now lands
   on the whiteboard, which is the one thing with a route to a backend. */
import type { Whiteboard } from './whiteboard'
import type { StorageBackend } from '../leavewar/state/storage'

const SQN = 'sqn142_'
const strip = (k: string) => (k.startsWith(SQN) ? k.slice(SQN.length) : k)

export function settingsAdapter(wb: Whiteboard): { getItem(k: string): string | null; setItem(k: string, v: string): void } {
  return {
    getItem: k => wb.get('settings', strip(k)),
    setItem: (k, v) => { wb.set('settings', strip(k), v) },
  }
}

export function leavewarAdapter(wb: Whiteboard): StorageBackend {
  return {
    read: key => wb.get('leavewar', key),
    write: (key, value) => { wb.set('leavewar', key, value) },
  }
}

/* the sync target tracker/storage.js's useStorageImpl accepts */
export function trackerTarget(wb: Whiteboard): { get(k: string): string | null; set(k: string, v: string): void; remove(k: string): void; keys(): string[] } {
  return {
    get: k => wb.get('tracker', k),
    set: (k, v) => { wb.set('tracker', k, v) },
    remove: k => { wb.delete('tracker', k) },
    keys: () => wb.keys('tracker'),
  }
}
