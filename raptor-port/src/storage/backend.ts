// src/storage/backend.ts
/* THE STORAGE CONTRACT. Every backend — the Memory mock, the Browser store,
   the Dataverse adapter (stage 4) — implements exactly this. Values are JSON
   strings, never objects: a backend is a dumb key/value store and the record
   shapes (docs/data-schema.md) stay the app's business. */
export type Collection = 'settings' | 'weeks' | 'inputs' | 'people' | 'plan' | 'leavewar' | 'tracker'
export const COLLECTIONS: Collection[] = ['settings', 'weeks', 'inputs', 'people', 'plan', 'leavewar', 'tracker']

export type Snapshot = Record<Collection, Record<string, string>>

export interface Backend {
  /** Everything, once, at boot. */
  loadAll(): Promise<Snapshot>
  put(collection: Collection, id: string, json: string): Promise<void>
  remove(collection: Collection, id: string): Promise<void>
}

export function emptySnapshot(): Snapshot {
  const s = {} as Snapshot
  for (const c of COLLECTIONS) s[c] = {}
  return s
}

export const isCollection = (x: string): x is Collection => (COLLECTIONS as string[]).includes(x)

/* `collection/id` — the id may itself contain '/' (none do today, but the
   Tracker's free-text keys could), so split on the FIRST separator only. */
export const recordKey = (collection: Collection, id: string) => `${collection}/${id}`
export function splitKey(key: string): [Collection, string] {
  const i = key.indexOf('/')
  return [key.slice(0, i) as Collection, key.slice(i + 1)]
}
