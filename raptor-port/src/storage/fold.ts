// src/storage/fold.ts
/* THE FOLD ([DB-READINESS] group A, phase 0 — plan §2.6; Fable F13, F2-11; Astra R2-02).
   Group A turns every big stored blob (all inputs in one record, the whole roster in one, one record
   per week, every war in one …) into ONE ROW PER THING, the shape of the tables IT is designing.
   A browser that already holds the old blobs is converted ONCE, at boot, BEFORE the whiteboard fills:

   - ONE converter per old kind of record, each a pure function of the snapshot returning the new
     rows and a `null` for every old blob it replaces — and writing ONLY its own collections;
   - the format becomes 6 ONLY in the build that registers EVERY converter the manifest names. While
     any is missing the target stays 5, no fold is due, and the app boots exactly as today — so a
     half-built group A can never leave a store half converted (the phases land one at a time);
   - the fold is ONE `putMany` through the real backend: every new row, every old blob removed, and
     the schema stamp at 6, all or nothing. A crash after its journal is written is finished by the
     next boot's replay. At a fold boot the reset's journal filter does not run: an unfinished group's
     values are already overlaid on the snapshot and are folded WITH it, and the fold's group carries
     every entry of that group it does not itself replace — so it is a superset, and nothing is left
     to retry;
   - a store at 6 never looks for old blobs again.
   Each phase that changed a record's shape registered its own converter; the Tracker's (phase 5b, src/tracker/fold.ts,
   registered by src/boot.ts) completed the manifest on 30 Sep 26 — the app now writes format 6 and folds a format-5 store. */
import type { Backend, Collection, Entry, Snapshot } from './backend'
import { recordKey } from './backend'
import { SCHEMA_VERSION } from './reset'
import { SCHEMA_KEY, makeSchema, schemaJSON, schemaOf, storedFormat } from './schema'

/** the format a store is in once every record is one row per thing */
export const FOLD_FORMAT = 6

/* every old kind of record group A re-shapes — the manifest. The Tracker joined with D462. */
export const REQUIRED_CONVERTERS = ['weeks', 'inputs', 'people', 'plan', 'leavewar', 'elog', 'accounts', 'tracker'] as const
export type ConverterName = typeof REQUIRED_CONVERTERS[number]

export type Converter = {
  name: string
  /** the only collections its entries may name */
  collections: Collection[]
  /** pure: the new rows, and `value: null` for each old blob it replaces. May throw — the boot then stops. */
  convert(snap: Snapshot): Entry[]
}

const REGISTRY = new Map<string, Converter>()

export function registerConverter(c: Converter): void {
  if (!(REQUIRED_CONVERTERS as readonly string[]).includes(c.name)) throw new Error(`fold: no converter named "${c.name}" is in the manifest`)
  if (REGISTRY.has(c.name)) throw new Error(`fold: converter "${c.name}" registered twice`)
  REGISTRY.set(c.name, c)
}
export function missingConverters(): string[] { return REQUIRED_CONVERTERS.filter(n => !REGISTRY.has(n)) }
/** 6 only when the manifest is complete; otherwise the format this build already writes */
export function targetFormat(): number { return missingConverters().length === 0 ? FOLD_FORMAT : SCHEMA_VERSION }
/** a store exactly one format behind a build that can fold it (below 5 is the wipe's, not the fold's) */
export function foldDue(snap: Snapshot): boolean { return targetFormat() === FOLD_FORMAT && storedFormat(snap) === SCHEMA_VERSION }

/* the old sniffs, for a legacy bare-number stamp only: a store holding either blob had started */
const legacyStarted = (snap: Snapshot) => snap.inputs.all != null || snap.leavewar.wars != null

/** The fold's ONE group: the unfinished group's entries (if any) under every converter's, plus the stamp. */
export function buildFoldGroup(snap: Snapshot, unfinished: Entry[] | null): Entry[] {
  const out = new Map<string, Entry>()
  for (const e of unfinished ?? []) out.set(recordKey(e.collection, e.id), e)
  const claimed = new Map<string, string>()
  for (const name of REQUIRED_CONVERTERS) {
    const c = REGISTRY.get(name)!
    for (const e of c.convert(snap)) {
      if (!c.collections.includes(e.collection)) throw new Error(`fold: converter "${c.name}" wrote outside its collections (${e.collection}/${e.id})`)
      const k = recordKey(e.collection, e.id)
      const other = claimed.get(k)
      if (other) throw new Error(`fold: converters "${other}" and "${c.name}" both wrote ${k}`)
      claimed.set(k, c.name)
      out.delete(k)                                  // re-insert: a converter's entry wins over the unfinished one
      out.set(k, e)
    }
  }
  const meta = schemaOf(snap)
  const initialized = meta?.initialized ?? legacyStarted(snap)
  const stamp: Entry = { collection: SCHEMA_KEY[0], id: SCHEMA_KEY[1], value: schemaJSON(makeSchema(FOLD_FORMAT, initialized)) }
  out.delete(recordKey(stamp.collection, stamp.id))
  out.set(recordKey(stamp.collection, stamp.id), stamp)
  return [...out.values()]
}

export function applyGroup(snap: Snapshot, group: Entry[]): void {
  for (const e of group) {
    if (e.value === null) delete snap[e.collection][e.id]
    else snap[e.collection][e.id] = e.value
  }
}

/** Fold `snap` in place and durably. Rejects (the boot's Retry) on any converter error or a failed write. */
export async function runFold(backend: Backend, snap: Snapshot, unfinished: Entry[] | null): Promise<void> {
  const group = buildFoldGroup(snap, unfinished)
  await backend.putMany(group)
  applyGroup(snap, group)
}

/** test-only: forget every registered converter */
export function _resetConvertersForTest(): void { REGISTRY.clear() }
