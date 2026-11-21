// src/leavewar/state/foreign.ts
/* ANOTHER SQUADRON'S STORED WAR, FOR ADMIN → USERS' FOUR DOORS (multi-squadron batch 1, A3 — Fable's design A, 19 Nov 26:
   docs/superpowers/briefs/2026-11-18-multi-sqn-b1-fixplan-fable-a3.md).

   The page holds ONE squadron's Leave War (store.ts — the war loaded, its unit `worldUnit()`). The master admin acts on
   every squadron's people from Admin → Users (D2197) while his own squadron's war stays loaded, so his Archive,
   Restore, Restore as and Delete of a 149 man once ran their war half on 142's war: 149's war never heard of it. Swapping
   the war in view inside one command is not clean (sync.ts swapWarWorld re-inits the store and runs its passes), so
   those four doors write the man's OWN squadron's stored war through this second, small store instead — the only
   writer of a war that is not loaded.

   What it holds: for each man a door has loaded, his saved posting window (`profile:<pid>`'s `post`), his war records
   (`rec:<war>:<recId>` rows carrying his pid) and his ledger entries (`ledger:<id>` rows carrying his personId), read
   fresh from that squadron's stored war (sync.ts's world door) just before the command. Its records:
     lwx.profile/<unit>@<pid>          his posting window (a Person, as the war's own `lw.postouts` record is)
     lwx.rec/<unit>@<warId>:<recId>    one of his war records, with its pid and date (the stored row's value)
     lwx.ledger/<unit>@<entryId>       one of his ledger entries
   A collection prefix of its own, so the war's own row writer (rows.ts lwRows, which reads `lw.` only) and the gate's
   war probe (perms.ts section 7b, which judges `lw.` by the war loaded) never take them for the loaded war's; ids
   qualified by the unit, so the gate's section 7 asks whether the actor is an admin of THAT squadron.

   Its write: on a committed command, each `lwx.*` change goes to that squadron's stored war as the row it is — a
   window into the profile row (its label kept as stored), a record or ledger row put or removed — and the stored
   worlds sync.ts reads are dropped so the next read sees it. Nothing runs the war's passes (absences, OIL, the posting
   pass) for that squadron here: they run, as on every load of a world, when its war is next opened (store.ts initStore
   keeps a profile even in a world not yet started). */
import { onCommit as cmdOnCommit, registerGuardedStore as cmdRegisterGuardedStore, registerRecord as cmdRegisterRecord } from '../../command'
import type { EnlistableStore, RecordEntry } from '../../command'
import type { Person } from '../engine'
import type { StorageBackend } from './storage'
import { REC, LEDGER, profileKey, profileJSON, parseRecKey } from './rows'
import { split } from '../../storage/unitid'
import { deepClone } from '../../command/util'

export const FX_PROFILE = 'lwx.profile'
export const FX_REC = 'lwx.rec'
export const FX_LEDGER = 'lwx.ledger'
const FX = [FX_PROFILE, FX_REC, FX_LEDGER] as const

/** one stored war record of his: the row's value (the record with its pid and date) */
export type ForeignRec = { id: string; pid: string; date: string; [k: string]: unknown }
/** one stored ledger entry of his */
export type ForeignEntry = { id: string; personId: string; counter: string; amount: number; date: string; [k: string]: unknown }
interface Slot { post: Person | null; recs: Record<string, ForeignRec>; ledger: Record<string, ForeignEntry> }

let DOOR: ((unit: string) => StorageBackend) | null = null
let WROTE: (() => void) | null = null
const STORES = new Map<string, ForeignWar>()
let WIRED = false

const parse = (b: StorageBackend, k: string): unknown => { try { return JSON.parse(b.read(k) ?? 'null') } catch { return undefined } }
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)

/** one man's part of a squadron's stored war, read fresh — pure of the store (Restore's refusal reads it too) */
export function readForeign(b: StorageBackend, pid: string): Slot {
  const prof = parse(b, profileKey(pid))
  const post = isObj(prof) && isObj(prof.post) ? (prof.post as unknown as Person) : null
  const recs: Record<string, ForeignRec> = {}
  const ledger: Record<string, ForeignEntry> = {}
  for (const k of b.keys()) {
    if (k.startsWith(REC)) {
      const at = parseRecKey(k), v = parse(b, k)
      if (at && isObj(v) && v.pid === pid && typeof v.date === 'string') recs[`${at.warId}:${at.recId}`] = v as ForeignRec
    } else if (k.startsWith(LEDGER)) {
      const v = parse(b, k)
      if (isObj(v) && v.personId === pid && typeof v.date === 'string') ledger[k.slice(LEDGER.length)] = v as ForeignEntry
    }
  }
  return { post, recs, ledger }
}

export interface ForeignWar extends EnlistableStore {
  readonly unit: string
  /** read his part of the squadron's stored war afresh — before the command, never inside it */
  load(pid: string): void
  post(pid: string): Person | null
  /** his posting window as it will be stored (null: none — the profile keeps only its label, or goes) */
  setPost(pid: string, next: Person | null): void
  recs(pid: string): Readonly<Record<string, ForeignRec>>
  dropRec(pid: string, key: string): void
  ledger(pid: string): Readonly<Record<string, ForeignEntry>>
  dropEntry(pid: string, id: string): void
  /** whether the squadron's war shows its SANS men (its own setting, as stored) */
  showSans(): boolean
}

function makeStore(unit: string): ForeignWar {
  let slots: Record<string, Slot> = {}
  const q = (local: string) => `${unit}@${local}`
  const slot = (pid: string): Slot => slots[pid] ?? (slots[pid] = { post: null, recs: {}, ledger: {} })
  const store: ForeignWar = {
    key: `lw-foreign:${unit}`,
    unit,
    capture: () => deepClone(slots),
    restore: snap => { slots = deepClone(snap as Record<string, Slot>) },
    records: () => {
      const m = new Map<string, RecordEntry>()
      for (const pid of Object.keys(slots)) {
        const s = slots[pid]!
        if (s.post) m.set(`${FX_PROFILE}/${q(pid)}`, { collection: FX_PROFILE, id: q(pid), value: s.post })
        for (const k of Object.keys(s.recs)) m.set(`${FX_REC}/${q(k)}`, { collection: FX_REC, id: q(k), value: s.recs[k] })
        for (const k of Object.keys(s.ledger)) m.set(`${FX_LEDGER}/${q(k)}`, { collection: FX_LEDGER, id: q(k), value: s.ledger[k] })
      }
      return m
    },
    load: pid => { if (DOOR) slots = { ...slots, [pid]: readForeign(DOOR(unit), pid) } },
    post: pid => slots[pid]?.post ?? null,
    /* (a squadron stint is never a posting — the reshape's A1: a row's `home`, laid by the projection, is never saved) */
    setPost: (pid, next) => { slot(pid).post = next && 'home' in next ? (({ home: _h, ...rest }) => rest)(next) : next },
    recs: pid => slots[pid]?.recs ?? {},
    dropRec: (pid, key) => { delete slot(pid).recs[key] },
    ledger: pid => slots[pid]?.ledger ?? {},
    dropEntry: (pid, id) => { delete slot(pid).ledger[id] },
    showSans: () => (DOOR ? parse(DOOR(unit), 'showsans') === true : false),
  }
  return store
}

/** the store for one squadron's stored war — one per unit for the page's life (the command layer's guard keeps it) */
export function foreignWar(unit: string): ForeignWar {
  let s = STORES.get(unit)
  if (!s) { s = makeStore(unit); STORES.set(unit, s); cmdRegisterGuardedStore(s) }
  return s
}

/** the doors to every squadron's stored war (sync.ts setWarWorldDoor hands them over) and what to drop once one is
 *  written (sync.ts's stored worlds). null — a single-squadron page: no door, nothing written. */
export function setForeignDoor(door: ((unit: string) => StorageBackend) | null, wrote: (() => void) | null): void {
  DOOR = door
  WROTE = wrote
  for (const s of STORES.values()) s.restore({})
  if (WIRED) return
  WIRED = true
  for (const c of FX) cmdRegisterRecord({ key: `leavewar-foreign:${c}`, cls: 'record', collection: c, module: 'leavewar' })
  cmdOnCommit(env => {
    if (env.emit === false || !DOOR) return
    let wrote = false
    for (const c of env.changes) {
      if (!(FX as readonly string[]).includes(c.collection)) continue
      const { unit, local } = split(String(c.id))
      if (!unit) continue
      const b = DOOR(unit)
      if (c.collection === FX_PROFILE) {
        const key = profileKey(local)
        const was = parse(b, key)
        const label = isObj(was) && typeof was.label === 'string' ? was.label : undefined
        const v = profileJSON({ post: c.op === 'delete' ? undefined : (c.after as Person), label })
        if (v === null) b.remove(key); else b.write(key, v)
      } else {
        const key = (c.collection === FX_REC ? REC : LEDGER) + local
        if (c.op === 'delete') b.remove(key); else b.write(key, JSON.stringify(c.after))
      }
      wrote = true
    }
    if (wrote && WROTE) WROTE()
  })
}
