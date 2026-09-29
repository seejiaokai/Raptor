// src/storage/schema.ts
/* THE STORE'S OWN METADATA ([DB-READINESS] group A, phase 0 — plan §2.6, §2.8; Astra R3-03).
   One record, `settings/schema`, holds ONE object — the design's `SchemaVersion` table's one row:
   - `stage`             which stage of the database step wrote it (1 = this app, rows as IT designs them);
   - `dataFormatVersion` the shape the records are in (5 today; 6 once the fold has run — storage/fold.ts);
   - `initialized`       whether the store has STARTED — seeded, folded or bootstrapped. This replaces
                         both old sniffs ("does `inputs/all` exist?", "does `leavewar/wars` exist?"),
                         which stop meaning anything once those blobs are split into rows;
   - `appliedAt`         when that format was applied;
   - `minClient`         the oldest client format that may still write to it.
   It replaces the bare number every store carried before (a bare number still READS — as `legacy`,
   `initialized` unknown — so every browser in use today boots exactly as before and is upgraded to
   the object at its first boot's seal).
   Reset and fold decisions compare `dataFormatVersion`, never `stage` (plan §2.8). */
import type { Collection, Snapshot } from './backend'
import type { Whiteboard } from './whiteboard'

export const SCHEMA_KEY: [Collection, string] = ['settings', 'schema']
/** this build writes stage-1 records */
export const STAGE = 1

export type SchemaMeta = {
  stage: number
  dataFormatVersion: number
  initialized: boolean
  appliedAt: string
  minClient: number
}
/** what a stored stamp READS as: the object, or a legacy bare number (initialized unknown) */
export type ReadMeta = Omit<SchemaMeta, 'initialized'> & { initialized: boolean | null; legacy: boolean }

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

/** a stored stamp, or null when there is none or it cannot be read (both read as format 0: the wipe path) */
export function readSchema(raw: string | null | undefined): ReadMeta | null {
  if (raw == null) return null
  let v: unknown
  try { v = JSON.parse(raw) } catch { return null }
  if (isNum(v)) return { stage: STAGE, dataFormatVersion: v, initialized: null, appliedAt: '', minClient: v, legacy: true }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  const o = v as Record<string, unknown>
  if (!isNum(o.stage) || !isNum(o.dataFormatVersion) || typeof o.initialized !== 'boolean') return null
  return {
    stage: o.stage,
    dataFormatVersion: o.dataFormatVersion,
    initialized: o.initialized,
    appliedAt: typeof o.appliedAt === 'string' ? o.appliedAt : '',
    minClient: isNum(o.minClient) ? o.minClient : o.dataFormatVersion,
    legacy: false,
  }
}

export const schemaOf = (snap: Snapshot): ReadMeta | null => readSchema(snap[SCHEMA_KEY[0]]?.[SCHEMA_KEY[1]])
export const storedFormat = (snap: Snapshot): number => schemaOf(snap)?.dataFormatVersion ?? 0

export function makeSchema(format: number, initialized: boolean, appliedAt = new Date().toISOString()): SchemaMeta {
  return { stage: STAGE, dataFormatVersion: format, initialized, appliedAt, minClient: format }
}
export const schemaJSON = (m: SchemaMeta): string =>
  JSON.stringify({ stage: m.stage, dataFormatVersion: m.dataFormatVersion, initialized: m.initialized, appliedAt: m.appliedAt, minClient: m.minClient })

/* A store written by a NEWER build — a later stage, a later format, or one that says this build is
   too old to write to it. Touching it could only damage it (an old reader would find none of the
   blobs it looks for and seed the demo over real data), so the boot refuses and main.tsx asks for
   a reload, which fetches the newer app. */
export class StoreAheadError extends Error {
  constructor(message: string) { super(message); this.name = 'StoreAheadError' }
}
export function refuseAhead(meta: ReadMeta | null, buildFormat: number): void {
  if (!meta) return
  if (meta.stage > STAGE) throw new StoreAheadError(`store stage ${meta.stage} is ahead of this build (${STAGE})`)
  if (meta.dataFormatVersion > buildFormat) throw new StoreAheadError(`store format ${meta.dataFormatVersion} is ahead of this build (${buildFormat})`)
  if (meta.minClient > buildFormat) throw new StoreAheadError(`store needs a client of format ${meta.minClient}; this build is ${buildFormat}`)
}

/** Has this store started? true / false from the stamp; null for a legacy bare-number stamp — the
    caller then falls back to the old sniff of its own record, exactly as before this build. */
export function storeInitialized(wb: Whiteboard): boolean | null {
  const m = readSchema(wb.get(SCHEMA_KEY[0], SCHEMA_KEY[1]))
  return m ? m.initialized : false
}

/* THE BOOT GROUP (plan §2.8 — "set by the seed in its own group"). On a store that has not started,
   main.tsx opens ONE whiteboard transaction right after the storage boot and seals it once the
   boot sequence has written its seed (the scheduler's inputs/roster/plan, the Leave War's world):
   the seal stamps `initialized` and commits, so the seed and the stamp reach storage as ONE
   all-or-nothing group. A boot that dies before its seal leaves nothing — the next boot is a first
   boot again. Every command dispatched during the boot joins this transaction (a nested whiteboard
   transaction never emits on its own). A started store opens nothing: its boot writes go out as
   they always did. */
export function openBootGroup(wb: Whiteboard): { seal(): void } {
  if (storeInitialized(wb) === true) return { seal() {} }
  const tx = wb.transaction()
  let done = false
  return {
    seal() {
      if (done) return
      done = true
      const m = readSchema(wb.get(SCHEMA_KEY[0], SCHEMA_KEY[1]))
      if (!m) { tx.abort(); throw new Error('boot group: the store carries no schema stamp') }
      /* the format, its date and its floor are kept; only `initialized` changes (a legacy stamp has
         no date, so it gets today's) */
      const next = makeSchema(m.dataFormatVersion, true, m.appliedAt || undefined)
      wb.set(SCHEMA_KEY[0], SCHEMA_KEY[1], schemaJSON({ ...next, stage: m.stage, minClient: m.minClient }))
      tx.commit()
    },
  }
}
