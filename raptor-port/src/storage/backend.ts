// src/storage/backend.ts
/* THE STORAGE CONTRACT. Every backend — the Memory mock, the Browser store,
   the Dataverse adapter (stage 4) — implements exactly this. Values are JSON
   strings, never objects: a backend is a dumb key/value store and the record
   shapes (docs/data-schema.md) stay the app's business. */
export type Collection = 'settings' | 'weeks' | 'inputs' | 'people' | 'plan' | 'leavewar' | 'tracker'
export const COLLECTIONS: Collection[] = ['settings', 'weeks', 'inputs', 'people', 'plan', 'leavewar', 'tracker']

export type Snapshot = Record<Collection, Record<string, string>>

/* One entry of an all-or-nothing group: a value to store, or null = remove. */
export type Entry = { collection: Collection; id: string; value: string | null }

export interface Backend {
  /** Everything, once, at boot. Finishes (replays) an unfinished group first —
      see `unfinished`. */
  loadAll(): Promise<Snapshot>
  put(collection: Collection, id: string, json: string): Promise<void>
  remove(collection: Collection, id: string): Promise<void>
  /** [ARCH-STACK-4] §19/§20.4 — ONE command's saves, all-or-nothing. REQUIRED
      (no sequential fallback, §20 OA5-004): after a failure the stored world is
      exactly before the group (the journal never landed → the postman retries
      it whole) or is completed to exactly after it by the next `loadAll`. A
      future backend (Dataverse `$batch` changeset) must meet the same contract
      (`contract.test.ts`). */
  putMany(entries: Entry[]): Promise<void>
  /** §21.2 — the group the last `loadAll` found in the journal but could NOT
      finish applying (its values are already overlaid onto that snapshot), or
      null. The boot hands it to the postman as its first, failed, group. */
  unfinished(): Entry[] | null
  /** §22.2b — replace the stored journal (null removes it). Only the boot's
      selective-reset filter calls this, before the reset removals run. */
  writeJournal(group: Entry[] | null): Promise<void>
}

/* A stored journal is untrusted text: anything but a list of well-formed
   entries is dropped whole (§20.3 "a malformed journal is dropped"). */
export function parseGroup(raw: string | null): Entry[] | null {
  if (raw == null) return null
  let a: unknown
  try { a = JSON.parse(raw) } catch (e) { return null }
  if (!Array.isArray(a)) return null
  const ok = a.every((e: any) => e && typeof e === 'object' && isCollection(e.collection) &&
    typeof e.id === 'string' && (e.value === null || typeof e.value === 'string'))
  return ok ? (a as Entry[]) : null
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
