/* THE THREE EXISTING DOORS, RE-POINTED. Nothing above a door changes: the
   scheduler's `store` (engine/hooks.ts) still calls getItem/setItem with its
   sqn142_ prefix, Leave War's store still calls read/write, the Tracker's
   storage.js still exposes its async get/set/delete/list. Each now lands
   on the whiteboard, which is the one thing with a route to a backend. */
import type { Whiteboard } from './whiteboard'
import type { Collection } from './backend'
import type { StorageBackend } from '../leavewar/state/storage'
import { qualify, split } from './unitid'

const SQN = 'sqn142_'
const strip = (k: string) => (k.startsWith(SQN) ? k.slice(SQN.length) : k)

export function settingsAdapter(wb: Whiteboard): { getItem(k: string): string | null; setItem(k: string, v: string): void; keys(): string[] } {
  return {
    getItem: k => wb.get('settings', strip(k)),
    /* every settings key, in getItem's form ([DB-READINESS] group A, phase 4 — the records kept one row per thing) */
    keys: () => wb.keys('settings').map(k => SQN + k),
    /* a cleared setting (saved as null) removes its key — it reads as never set, which every reader treats the same
       ([DB-READINESS] group A, phase 2 — F3-07: once each setting is one row, a stored "null" would be a row that says
       nothing) */
    setItem: (k, v) => { if (v === 'null') wb.delete('settings', strip(k)); else wb.set('settings', strip(k), v) },
  }
}

/* A UNIT'S WHOLE WORLD, BEHIND ITS OWN DOOR (multi-squadron batch 1, step 4 — the plan §3.4 "The Leave War and the
   Tracker — each a whole world per unit"). The Leave War and the Tracker each keep ONE world per squadron, never one
   world filtered: every key either store writes is stored under its unit (`u149@war:2026`, `u142@v3:master:syls` —
   storage/unitid.ts, the encoding the schedule's weeks carry since step 2), and the door hands the store its own keys
   back as it always wrote them. So neither store knows a squadron exists — it reads and writes "war:2026" as before —
   and two squadrons' worlds can never meet: a key of another unit is never listed, read, written or removed through
   this door. A key with no unit (a browser's records from before step 4) is no unit's and is never read (D22 — the
   store is cleared once before the merge, step 6). Without `unit` the door is the whole collection, as before — the
   stores' own unit tests, which run one world alone. */
function unitDoor(wb: Whiteboard, coll: Collection, unit?: string) {
  if (unit == null) return {
    get: (k: string) => wb.get(coll, k),
    set: (k: string, v: string) => { wb.set(coll, k, v) },
    remove: (k: string) => { wb.delete(coll, k) },
    keys: () => wb.keys(coll),
  }
  return {
    get: (k: string) => wb.get(coll, qualify(unit, k)),
    set: (k: string, v: string) => { wb.set(coll, qualify(unit, k), v) },
    remove: (k: string) => { wb.delete(coll, qualify(unit, k)) },
    keys: () => { const out: string[] = []; for (const k of wb.keys(coll)) { const q = split(k); if (q.unit === unit) out.push(q.local) } return out },
  }
}

export function leavewarAdapter(wb: Whiteboard, unit?: string): StorageBackend {
  const d = unitDoor(wb, 'leavewar', unit)
  return { read: d.get, write: d.set, remove: d.remove, keys: d.keys }
}

/* the sync target tracker/storage.js's setStorageImpl accepts — one unit's Tracker with `unit` (src/boot.ts hands the
   doorway a maker of these, and the Tracker's page binds its own squadron's before the Tracker first loads) */
export function trackerTarget(wb: Whiteboard, unit?: string): { get(k: string): string | null; set(k: string, v: string): void; remove(k: string): void; keys(): string[] } {
  return unitDoor(wb, 'tracker', unit)
}
