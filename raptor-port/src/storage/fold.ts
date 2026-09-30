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
   - the fold writes ONE CONVERTER AT A TIME, each its own `putMany` (its rows first, the old blobs it replaces last),
     then the stamp at 6 — never one group the size of the whole store (the group-A final read, Fable F3, 30 Sep 26: the
     Browser backend journals a group in ONE string before applying it, so a store more than about half full could
     never convert, and showed "could not load" for ever — D401, D464). Before any write: every converter has run and
     been checked (one that throws or strays stops the boot, nothing written); the store is asked whether it can hold
     the largest group twice over (its journal and its rows — `Backend.canHold`), and if not the boot stops with
     `StoreFullError`, nothing written; and the store is marked STARTED (the stamp at 5, `initialized` decided now), so a
     fold interrupted part-way can never be read as a store that had not started. An interrupted fold resumes at the
     next boot — the stamp is still 5, a converter whose old blobs are gone has nothing left to do, one whose blobs
     remain writes the same rows again. An unfinished group's values are already overlaid on the snapshot and are folded
     WITH it, and every entry of that group no converter replaces rides in the first group — nothing is left to retry;
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

/** A store too full to convert: nothing was written. main.tsx says so, and warns against clearing the browser's data. */
export class StoreFullError extends Error {
  constructor(chars: number) { super(`the browser storage cannot take the ${chars} characters converting needs`); this.name = 'StoreFullError' }
}

/** The fold's groups, in the order they are written: the started mark (only when the stamp does not already say so), one
    group per converter that has anything to do — the first also carrying an unfinished group's entries no converter
    replaces — each its rows first and its removals last, and the stamp at 6. Every converter runs and is checked first. */
export function buildFoldGroups(snap: Snapshot, unfinished: Entry[] | null): Entry[][] {
  const claimed = new Map<string, string>()
  const per: Entry[][] = []
  for (const name of REQUIRED_CONVERTERS) {
    const c = REGISTRY.get(name)!
    const mine: Entry[] = []
    for (const e of c.convert(snap)) {
      if (!c.collections.includes(e.collection)) throw new Error(`fold: converter "${c.name}" wrote outside its collections (${e.collection}/${e.id})`)
      const k = recordKey(e.collection, e.id)
      const other = claimed.get(k)
      if (other) throw new Error(`fold: converters "${other}" and "${c.name}" both wrote ${k}`)
      claimed.set(k, c.name)
      mine.push(e)
    }
    per.push([...mine.filter(e => e.value !== null), ...mine.filter(e => e.value === null)])
  }
  const carried = (unfinished ?? []).filter(e => !claimed.has(recordKey(e.collection, e.id)) && recordKey(e.collection, e.id) !== recordKey(SCHEMA_KEY[0], SCHEMA_KEY[1]))
  const groups = per.filter(g => g.length)
  if (carried.length) { if (groups.length) groups[0] = [...carried, ...groups[0]!]; else groups.push(carried) }
  const meta = schemaOf(snap)
  const initialized = meta?.initialized ?? legacyStarted(snap)
  const stampAt = (format: number): Entry => ({ collection: SCHEMA_KEY[0], id: SCHEMA_KEY[1], value: schemaJSON(makeSchema(format, initialized)) })
  const out: Entry[][] = []
  if (!meta || meta.initialized !== initialized) out.push([stampAt(SCHEMA_VERSION)])
  out.push(...groups, [stampAt(FOLD_FORMAT)])
  return out
}

export function applyGroup(snap: Snapshot, group: Entry[]): void {
  for (const e of group) {
    if (e.value === null) delete snap[e.collection][e.id]
    else snap[e.collection][e.id] = e.value
  }
}

/** Fold `snap` in place and durably, one group at a time. Rejects (the boot's Retry) on any converter error or a failed
    write, and with StoreFullError — before anything is written — when the store cannot take the largest group. */
export async function runFold(backend: Backend, snap: Snapshot, unfinished: Entry[] | null): Promise<void> {
  const groups = buildFoldGroups(snap, unfinished)
  const need = Math.max(...groups.map(g => JSON.stringify(g).length)) * 2
  if (backend.canHold && !backend.canHold(need)) throw new StoreFullError(need)
  for (const group of groups) {
    await backend.putMany(group)
    applyGroup(snap, group)
  }
}

/** test-only: forget every registered converter */
export function _resetConvertersForTest(): void { REGISTRY.clear() }
