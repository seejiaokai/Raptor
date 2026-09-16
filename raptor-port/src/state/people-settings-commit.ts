/* [ARCH-STACK] Step 2 phase 3 — routing PEOPLE + VCONF + the full SETTINGS
   inventory through the command gate (design §5.2, §8 item 3). ADDITIVE: the
   in-place people/settings writers run UNCHANGED; this only ADDS the auth gate +
   the record-level change stream around them, at the ONE persist seam each
   module already funnels through — so the ~30 UI call sites are untouched and no
   durable write can bypass the layer (the design's "forbid the raw settingsAdapter
   back door", enforced structurally rather than site-by-site). The legacy persist
   seams (the settingsAdapter store.set; persistPeople) are LEFT RUNNING — no
   cutover (Steps 3/5).

   TWO EnlistableStores, each keyed onto its module's persisted representation:

   - SETTINGS is ONE store over the 11 durable keys. Every settings writer ends in
     `store.set(key, …)`; engine/hooks.ts now routes that through an injected
     write hook (installed below) which, outside a running command, opens a named
     `settings.<key>` command that enlists the settings store and does the raw
     write. The store's records()/capture() read the PERSISTED value (store.get) —
     which is exactly the record source — so a command's before-image is the old
     persisted value and its after-image the new one; rollback writes the snapshot
     back AND re-runs every xLoad() to rebuild the module CFGs (correct even for a
     throw between a mutation and its save, since the mutators don't save
     internally and xLoad re-derives the CFG from the unchanged store).

   - PEOPLE is ONE store over the roster. Every people writer ends in
     persistPeople(); the wrapped persistPeople below opens a `people.edit` command
     that enlists the people store and does the raw persist. The store's
     records()/capture() read a module-level BASELINE string (the last-persisted
     roster), NOT the live PEOPLE object — because PEOPLE is mutated in place
     BEFORE persistPeople is called, so reading live PEOPLE as the before-image
     would show no diff. persistPeople updates the baseline inside the command, so
     the before-image is the pre-edit roster and the after-image the post-edit one;
     rollback rebuilds PEOPLE (and its ID_BY_CS index) from the snapshot.

   Permissions are PERMISSIVE (anyone) at Step 2, exactly as the scheduler phases:
   the real gates (the admin-only Admin/Quals pages at the write path) are
   UNCHANGED and authoritative, so a tighter command permission here could only ADD
   a refusal and regress a legitimate write. Each type is still EXPLICITLY
   registered (the registry refuses an unregistered type). Real auth is Step 5. */
import type { EnlistableStore, RecordEntry, Scope, CommitResult, Command } from '../command'
import {
  commit, isCommitting, definePermission, anyone, registerRecord, registerGuardedStore,
} from '../command'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { store, setSettingsWriteHook } from '../engine/hooks'
import { rulesLoad } from '../engine/rules'
import { lookaheadLoad } from '../engine/lookahead'
import { qualColsLoad } from '../engine/qualcols'
import {
  storesLoad, cxReasonsLoad, dutyTplLoad, waveTplLoad, dayTplLoad,
  secDefaultLoad, waveDefaultLoad,
} from '../engine'
import { persistPeople as rawPersistPeople } from './persist'

/* ---- the SETTINGS EnlistableStore ---------------------------------------- */
/* the 11 durable settings keys (design §3.1). `wavetpl` + `wavehide` are two
   records written by one save (waveTplSave, two store.set calls) and rebuilt by
   one load (waveTplLoad). */
export const SETTINGS_KEYS = [
  'rules', 'stores', 'cxreasons', 'daytpl', 'dutytpl', 'wavetpl', 'wavehide',
  'qualcols', 'lookahead', 'secdefault', 'wavedefault',
] as const
/* every xLoad(), run to rebuild the module CFGs from the (restored) store on a
   rollback — deduped (waveTplLoad rebuilds both wavetpl + wavehide). */
const SETTINGS_LOADERS: Array<() => void> = [
  rulesLoad, storesLoad, cxReasonsLoad, dayTplLoad, dutyTplLoad, waveTplLoad,
  qualColsLoad, lookaheadLoad, secDefaultLoad, waveDefaultLoad,
]
function settingsRecords(): Map<string, RecordEntry> {
  const m = new Map<string, RecordEntry>()
  for (const k of SETTINGS_KEYS) {
    m.set(`settings/${k}`, { collection: 'settings', id: k, value: store.get(k, null) })
  }
  return m
}
function captureSettings(): string {
  const o: Record<string, unknown> = {}
  for (const k of SETTINGS_KEYS) o[k] = store.get(k, null)
  return JSON.stringify(o)
}
/* rollback: restore each key's persisted value, then re-derive every module CFG
   from the store (undoes a CFG mutation whose save had already run — or one whose
   save had NOT run, since the CFG is rebuilt from the unchanged store). Writes go
   through the raw setter (the hook is inert while committing) so nothing nests. */
function restoreSettings(snap: string): void {
  const o = JSON.parse(snap)
  for (const k of SETTINGS_KEYS) store.set(k, k in o ? o[k] : null)
  for (const load of SETTINGS_LOADERS) load()
}
export const settingsStore: EnlistableStore = {
  key: 'settings',
  capture: captureSettings,
  restore: (snap) => restoreSettings(snap as string),
  records: settingsRecords,
  signature: captureSettings,
}

/* ---- the PEOPLE EnlistableStore ------------------------------------------ */
/* the last-persisted roster, the record source (see the header). Initialised at
   registration; advanced inside each people command; snapshot on rollback. */
let PEOPLE_BASELINE: string | null = null
function baseline(): string { return PEOPLE_BASELINE ?? JSON.stringify(PEOPLE) }
function peopleRecords(): Map<string, RecordEntry> {
  const m = new Map<string, RecordEntry>()
  const roster = JSON.parse(baseline())
  for (const id of Object.keys(roster)) {
    m.set(`people/${id}`, { collection: 'people', id, value: roster[id] })
  }
  return m
}
/* rebuild PEOPLE + its callsign index from a snapshot, exactly as persist.ts's
   hydrate does (a stored callsign must resolve after a restore). */
function restorePeople(snap: string): void {
  PEOPLE_BASELINE = snap
  const obj = JSON.parse(snap)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, obj)
  for (const k of Object.keys(ID_BY_CS)) delete (ID_BY_CS as any)[k]
  for (const id of Object.keys(PEOPLE)) {
    const cs = (PEOPLE as any)[id] && (PEOPLE as any)[id].cs
    if (typeof cs === 'string') (ID_BY_CS as any)[cs.toLowerCase()] = id
  }
}
export const peopleStore: EnlistableStore = {
  key: 'people',
  capture: () => baseline(),
  restore: (snap) => restorePeople(snap as string),
  records: peopleRecords,
  signature: () => baseline(),
}

/* ---- command types + the commit helpers ---------------------------------- */
export const PEOPLE_TYPES = { edit: 'people.edit' } as const
const settingsType = (k: string) => `settings.${k}`

const peopleScope = (): Scope => ({ module: 'people' })
const settingsScope = (): Scope => ({ module: 'settings' })

function commitSettings(type: string, fn: () => void): CommitResult {
  const cmd: Command = { type, scope: settingsScope(), apply: (txn) => { txn.enlist(settingsStore); fn() } }
  return commit(cmd)
}
function commitPeople(type: string, fn: () => void): CommitResult {
  const cmd: Command = { type, scope: peopleScope(), apply: (txn) => { txn.enlist(peopleStore); fn() } }
  return commit(cmd)
}

/* the wrapped persistPeople the people writers (QualsPage, Leave War sync) call
   instead of the raw one: a durable roster write, routed through a command. When
   already inside a command (a rollback, or a future people child) it just does
   the raw persist + baseline advance, so nothing nests. */
export function persistPeople(): void {
  if (isCommitting()) { rawPersistPeople(); PEOPLE_BASELINE = JSON.stringify(PEOPLE); return }
  commitPeople(PEOPLE_TYPES.edit, () => { rawPersistPeople(); PEOPLE_BASELINE = JSON.stringify(PEOPLE) })
}

/* ---- one-time registration (called from initStore, after the scheduler) --- */
let registered = false
export function registerPeopleSettingsCommandLayer(): void {
  if (registered) return
  registered = true
  PEOPLE_BASELINE = JSON.stringify(PEOPLE)   // the seed/hydrated roster is the first baseline
  definePermission(PEOPLE_TYPES.edit, anyone)
  for (const k of SETTINGS_KEYS) definePermission(settingsType(k), anyone)
  registerGuardedStore(peopleStore)
  registerGuardedStore(settingsStore)
  // route every durable settings write (store.set) through a named command.
  // Inside a running command (a rollback, or a save nested in another command)
  // or for an unknown key, write raw so nothing nests or is refused-and-lost.
  setSettingsWriteHook((k, v, raw) => {
    if (isCommitting() || !(SETTINGS_KEYS as readonly string[]).includes(k)) { raw(k, v); return }
    commitSettings(settingsType(k), () => raw(k, v))
  })
  // the derived registry entries (§3.1)
  registerRecord({ key: 'people:<personId>', cls: 'record', collection: 'people', module: 'people' })
  for (const k of SETTINGS_KEYS) {
    registerRecord({ key: `settings:${k}`, cls: 'record', collection: 'settings', module: 'settings' })
  }
}

/* test-only: re-sync the people baseline to the current PEOPLE (a test that
   restores the roster out-of-band must resync, or the next command's before-image
   is stale). Never called in production — persistPeople keeps the baseline live. */
export function _resetPeopleBaseline(): void { PEOPLE_BASELINE = JSON.stringify(PEOPLE) }
