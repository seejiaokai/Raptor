/* [ARCH-STACK] Step 2 — the DERIVED record registry (design §3.1).

   The registry is DERIVED FROM CODE, not hand-listed (Codex R4-004 / Fable
   R4-4): every sSet/persist()/store.set key builder is classified as one of
   - RECORD          — a durable logical record; every write yields a Change
   - BOOT_MIGRATION  — seed origin, exempt (migration flags, seedstamp)
   - VIEW_PREFERENCE — exempt but listed (Tracker kLast/kLastStudent, LW current)

   Completeness is proven by RECONSTRUCTING the persisted state from the
   envelope stream and comparing it to the legacy serializer — NOT "≥1 Change",
   which misses an omitted field (e.g. SCHED.changes). This table is the map
   from logical collection to the physical blob that owns it (LOGICAL_TO_BLOB),
   used by the Step-5 fold subscriber (defined, activated later — design §4).
*/
import type { LogicalCollection } from './types'

/* logical collection -> the physical storage blob that owns it. Several logical
   records can share one blob; the fold subscriber (Step 5) groups changes by
   blob, re-serializes each once. */
export const LOGICAL_TO_BLOB: Record<LogicalCollection, string> = {
  // scheduler — the week blob owns days + the mutable book + issued records + mutes
  'days': 'weeks',
  'sched.book': 'weeks',
  'sched.mutes': 'weeks',
  'sched.orig': 'weeks',
  'sched.als': 'weeks',
  'sched.retired': 'weeks',
  // inputs / plan / people
  'inputs': 'inputs',
  'plan': 'plan',
  'people': 'people',
  // settings — one blob per key
  'settings': 'settings',
  // off-week session memory — stored per week under the weeks blob ([CMDL-FINISH] §6)
  'weekstash': 'weeks',
  // leave war
  'lw.cell': 'leavewar/wars',
  'lw.bid': 'leavewar/wars',
  'lw.war': 'leavewar/wars',
  'lw.ledger': 'leavewar/ledger',
  'lw.balances': 'leavewar/balances',
  'lw.oilpolicy': 'leavewar/oilpolicy',
  'lw.postouts': 'leavewar/postouts',
  'lw.current': 'leavewar/current',
  'lw.config': 'leavewar/config',
  // tracker (the v3: keys)
  'trk.marks': 'tracker/marks',
  'trk.dates': 'tracker/dates',
  'trk.roster': 'tracker/roster',
  'trk.layout': 'tracker/layout',
  'trk.syls': 'tracker/syls',
  'trk.plan': 'tracker/plan',
  'trk.pace': 'tracker/pace',
  'trk.lulls': 'tracker/lulls',
  'trk.eventinfo': 'tracker/eventinfo',
  'trk.catalogue': 'tracker/catalogue',
  'trk.courses': 'tracker/courses',
}

export type RegistryClass = 'record' | 'boot-migration' | 'view-preference'

/* An entry in the derived registry. `key` is the code-level storage key builder
   or hydration key (as a stable string or a documented pattern); `collection`
   is its logical collection when it is a record. As each module is adopted
   (phases 2-5) it registers its writers here; the completeness test
   (reconstruct-and-compare) is what actually proves nothing was missed. */
export interface RegistryEntry {
  key: string
  cls: RegistryClass
  collection?: LogicalCollection
  module: string
  note?: string
}

const ENTRIES: RegistryEntry[] = []

export function registerRecord(e: RegistryEntry): void {
  /* a record entry MUST name its logical collection */
  if (e.cls === 'record' && !e.collection) {
    throw new Error(`registry: record ${e.key} must name a collection`)
  }
  const dup = ENTRIES.find(x => x.key === e.key)
  if (dup) {
    /* re-registering the same key with the same classification is idempotent
       (module hot-reload / repeated boot in tests); a CONFLICTING re-register
       is a bug worth surfacing. */
    if (dup.cls !== e.cls || dup.collection !== e.collection) {
      throw new Error(`registry: conflicting re-register of ${e.key}`)
    }
    return
  }
  ENTRIES.push(e)
}

export function registryEntries(): readonly RegistryEntry[] {
  return ENTRIES
}
export function recordEntries(): RegistryEntry[] {
  return ENTRIES.filter(e => e.cls === 'record')
}
/* test-only: clear the registry between suites */
export function _resetRegistry(): void {
  ENTRIES.length = 0
}
