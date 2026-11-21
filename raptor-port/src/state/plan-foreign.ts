/* THE PLANNING CALENDAR OF A SQUADRON NOT LOADED — the stored half of the ONE planning record (the reshape plan,
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-ii "The Inputs calendar", §6.2 "A delete reaches every
   squadron's planning calendar (B1)").

   The page holds ONE squadron's planning calendar in memory — the unit in view's, PLANPUCKS and DAYRMK (state/plan.ts) —
   and the schedule's own store (state/sched-commit.ts) is its writer. A note or a day title is ONE record whichever
   calendar holds it, `plan/<unit>@pp:<id>` or `plan/<unit>@dm:<iso>`: its id already names its squadron. So no second
   collection (Astra 2, Opus M1 of round 2): the schedule store's `plan` case ROUTES a record — the squadron loaded to the
   loaded calendar, as always; any other to that squadron's stored calendar, through this store, for its before-image and
   its write alike. Capture, revisions, conflict checks, the commit gate (perms.ts section 7 — an admin of the squadron in
   the id; a delete's strip, deleteStripsOnly), the row writer (state/persist.ts's `plan` mapper, which writes every `plan`
   change as the row it names) and Undo see one record whichever calendar holds it.

   WHAT IT HOLDS: the records of one squadron's stored calendar this store has LOADED, read fresh — from the copy the page
   kept when that squadron was left this session (below; state/store.ts switchUnit keeps it), else from the stored rows,
   else none — and, between a load and the commit, the command's edits of them.

   LOADED BEFORE IT JOINS (Opus 4 of round 3): asked to join a command or a restore, it FIRST loads that squadron's stored
   rows of the ids it will write, so its before-image is the record as stored — an edit is a change, never "created", and
   its Undo never deletes the note. Once joined, nothing more is loaded into it for that command: a write of an id it did
   not load is refused (CmdRefused), never guessed at.

   ITS WRITE: the command layer derives the changes (before vs after over its records); the row writer saves them inside
   the command's own group; on the commit this store brings the page's kept copy of that squadron's calendar up to date,
   so switching to it shows the change. A refused command rolls it back whole (capture / restore): no row is written, the
   kept copy is never touched.

   FOR HELPER "undo & roles" — the timeline's per-record store (§3.2 A-ii, §10): a `plan` record of a squadron not loaded
   goes to `storedPlan(unit)` directly, enlisted as its own store: before the restore, `load(locals)` with the local ids
   (`pp:<id>`, `dm:<iso>`) it will write (or `join(txn, locals)` from inside the restore's reducer, which loads them and
   enlists in one step), then its `write(entries, { restore: true })`. Its key is `plan-stored:<unit>`. It refuses the
   squadron loaded: that calendar is the schedule store's (sched-commit.ts). */
import { registerGuardedStore, onCommit, isEnlisted, CmdRefused } from '../command'
import type { EnlistableStore, RecordEntry, Txn } from '../command'
import { split } from '../storage/unitid'
import { UNIT } from '../engine/unitview'
import { sortByOrd } from '../command/ord'
import type { Whiteboard } from '../storage/whiteboard'

/* ---- THE CALENDARS KEPT FOR THE SQUADRONS LEFT THIS SESSION (moved here whole from state/store.ts PLAN_MEM) ----
   The planning calendar of a unit left is kept in memory as the stash keeps its weeks, so coming back shows it as it was;
   a unit never shown this session reads its rows from the whiteboard (state/persist.ts hydratePlan). It lives here, beside
   the stored half that reads and updates it, so neither imports state/store.ts (which imports the schedule store). */
export interface PlanCalendar { pucks: any[]; titles: Record<string, string> }
const KEPT = new Map<string, PlanCalendar>()
export const keepPlan = (unit: string, cal: PlanCalendar): void => { KEPT.set(unit, cal) }
export const keptPlan = (unit: string): PlanCalendar | undefined => KEPT.get(unit)
export const forgetKeptPlans = (): void => { KEPT.clear() }

/* the whiteboard the app saves to (state/store.ts hands persist.ts's over at its load) — null headless */
let WB: () => Whiteboard | null = () => null
export function setPlanStoreDoor(fn: (() => Whiteboard | null) | null): void { WB = fn || (() => null) }

// eslint-disable-next-line react-doctor/no-json-parse-stringify-clone -- a record as saving stores it (keys set to undefined dropped), the same image a reload reads
const cw = <T>(v: T): T => (v == null ? v : JSON.parse(JSON.stringify(v)))
const parse = (s: string | null): unknown => { if (s == null) return undefined; try { return JSON.parse(s) } catch { return undefined } }
const isRecord = (r: unknown): r is Record<string, any> => !!r && typeof r === 'object' && !Array.isArray(r)
const puckIdOf = (p: any) => p && p.id

/** a squadron's planning calendar AS STORED, read fresh (copies, never the kept objects): the copy kept since it was left
 *  this session, else its rows on the whiteboard (the same reading as state/persist.ts hydratePlan), else none */
export function storedCalendar(unit: string): PlanCalendar {
  const kept = KEPT.get(unit)
  if (kept) return { pucks: cw(kept.pucks), titles: { ...kept.titles } }
  const pucks: any[] = [], titles: Record<string, string> = {}
  const wb = WB()
  if (wb) for (const raw of wb.keys('plan')) {
    const r = split(raw)
    if (r.unit !== unit) continue
    if (r.local.startsWith('pp:')) { const p = parse(wb.get('plan', raw)); if (isRecord(p)) { if (p.id == null) p.id = r.local.slice(3); pucks.push(p) } }
    else if (r.local.startsWith('dm:')) { const t = parse(wb.get('plan', raw)); if (typeof t === 'string') titles[r.local.slice(3)] = t }
  }
  sortByOrd(pucks, puckIdOf)
  return { pucks, titles }
}
/* one calendar as its records, by local id (`pp:<id>` a note, `dm:<iso>` a day title) */
function recordsOf(cal: PlanCalendar): Map<string, unknown> {
  const m = new Map<string, unknown>()
  for (const p of cal.pucks) if (p && p.id != null) m.set(`pp:${p.id}`, p)
  for (const iso of Object.keys(cal.titles)) m.set(`dm:${iso}`, cal.titles[iso])
  return m
}

export interface StoredPlan extends EnlistableStore {
  readonly unit: string
  /** read the stored records afresh — every one (no argument), or just these local ids (an id not stored is loaded as
   *  absent, so writing it is a create). Before the store joins a command, never inside one it has joined. */
  load(locals?: readonly string[]): void
  /** load (unless already joined to this command) and enlist — the one way in from a reducer. Already joined: every id
   *  asked for must have been loaded at the join, else refused. */
  join(txn: Txn, locals?: readonly string[]): void
  /** a loaded record's value (undefined: not stored, or not loaded) */
  get(local: string): unknown
  /** the loaded notes (`pp:` records), as copies, each with its local id */
  notes(): Array<{ local: string; note: any }>
  put(local: string, value: unknown): void
  drop(local: string): void
  /** a batch of this squadron's planning records (a restore's, or the schedule store's routed write) — each loaded first */
  write(entries: RecordEntry[], opts?: { allowIssued?: boolean; restore?: boolean }): void
}

const STORES = new Map<string, StoredPlan>()
let WIRED = false

function makeStore(unit: string): StoredPlan {
  let slots = new Map<string, unknown>()   // loaded local id → value (absent: not stored)
  let loaded = new Set<string>()           // the local ids read at the last load
  let all = false                          // …or the whole calendar
  let gen = 0                              // bumped on every change — the whole-world guard's cheap signature
  const q = (local: string) => `${unit}@${local}`
  const mayWrite = (local: string) => {
    if (!(all || loaded.has(local))) throw new CmdRefused(`planning record ${q(local)} was not loaded before its write`)
  }
  const refuseLoaded = () => {
    if (unit === UNIT) throw new CmdRefused(`the planning calendar of ${unit} is loaded — it is written by the schedule's store`)
  }
  const store: StoredPlan = {
    key: `plan-stored:${unit}`,
    unit,
    capture: () => ({ slots: cw([...slots]), loaded: [...loaded], all, gen }),
    restore: (snap: any) => {
      slots = new Map(snap && Array.isArray(snap.slots) ? cw(snap.slots) : [])
      loaded = new Set(snap && Array.isArray(snap.loaded) ? snap.loaded : [])
      all = !!(snap && snap.all)
      gen++
    },
    records: () => {
      const m = new Map<string, RecordEntry>()
      for (const [local, value] of slots) if (value !== undefined) m.set(`plan/${q(local)}`, { collection: 'plan', id: q(local), value })
      return m
    },
    signature: () => `${unit}#${gen}`,
    load: (locals) => {
      if (isEnlisted(store.key)) throw new CmdRefused(`the stored planning calendar of ${unit} is already joined — it loads before it joins`)
      refuseLoaded()
      const cal = recordsOf(storedCalendar(unit))
      if (!locals) { slots = cal; loaded = new Set(); all = true }
      else {
        slots = new Map(); loaded = new Set(locals); all = false
        for (const l of locals) if (cal.has(l)) slots.set(l, cal.get(l))
      }
      gen++
    },
    join: (txn, locals) => {
      if (isEnlisted(store.key)) {
        for (const l of locals ?? []) mayWrite(l)
        if (!locals && !all) throw new CmdRefused(`the stored planning calendar of ${unit} was joined for some records only`)
        return
      }
      store.load(locals)
      txn.enlist(store)
    },
    get: (local) => cw(slots.get(local)),
    notes: () => [...slots].filter(([l, v]) => l.startsWith('pp:') && isRecord(v)).map(([local, note]) => ({ local, note: cw(note) })),
    put: (local, value) => { mayWrite(local); slots.set(local, cw(value)); gen++ },
    drop: (local) => { mayWrite(local); slots.delete(local); gen++ },
    /* a restore's (or the schedule store's routed) batch write: each entry is one of this squadron's planning records */
    write: (entries) => {
      for (const e of entries) {
        const { unit: u, local } = split(String(e.id))
        if (e.collection !== 'plan' || u !== unit) throw new CmdRefused(`stored planning write: not ${unit}'s planning record ${e.id}`)
        if (!local.startsWith('pp:') && !local.startsWith('dm:')) throw new CmdRefused(`stored planning write: no planning record ${e.id}`)
        if (e.op === 'delete' || e.value == null) store.drop(local); else store.put(local, e.value)
      }
    },
  }
  return store
}

/* ON THE COMMIT: the page's kept copy of each squadron's calendar this command changed — not the squadron loaded, whose
   calendar is in PLANPUCKS / DAYRMK — is brought up to date, so switching to it shows the change (its rows were written by
   the row writer inside the command's own group). A calendar never kept this session is read from its rows next time. */
function wire(): void {
  if (WIRED) return
  WIRED = true
  onCommit(env => {
    if (env.emit === false) return
    const touched = new Set<string>()
    for (const c of env.changes) {
      if (c.collection !== 'plan') continue
      const { unit, local } = split(String(c.id))
      if (!unit || unit === UNIT) continue
      const kept = KEPT.get(unit)
      if (!kept) continue
      if (local.startsWith('dm:')) {
        const iso = local.slice(3)
        if (c.op === 'delete' || c.after == null) delete kept.titles[iso]; else kept.titles[iso] = cw(c.after) as string
      } else if (local.startsWith('pp:')) {
        const id = local.slice(3), ix = kept.pucks.findIndex((p: any) => p && String(p.id) === id)
        if (c.op === 'delete' || c.after == null) { if (ix >= 0) kept.pucks.splice(ix, 1) }
        else if (ix >= 0) kept.pucks[ix] = cw(c.after); else kept.pucks.push(cw(c.after))
        touched.add(unit)
      }
    }
    for (const u of touched) sortByOrd(KEPT.get(u)!.pucks, puckIdOf)
  })
}

/** the stored half of one squadron's planning calendar — one per unit for the page's life (the command layer's guard
 *  keeps it) */
export function storedPlan(unit: string): StoredPlan {
  let s = STORES.get(unit)
  if (!s) { s = makeStore(unit); STORES.set(unit, s); registerGuardedStore(s); wire() }
  return s
}
/** the stored half of `unit` when it is joined to the command now running — the schedule store's `plan` case routes a
 *  record of a squadron not loaded to it (sched-commit.ts); null when it is not joined */
export function storedPlanJoined(unit: string): StoredPlan | null {
  const s = STORES.get(unit)
  return s && isEnlisted(s.key) ? s : null
}
/** a squadron entered: its stored half holds nothing (its calendar is now the loaded one, the schedule store's) —
 *  state/store.ts switchUnit, between commands */
export function dropStoredPlan(unit: string): void {
  const s = STORES.get(unit)
  if (s && !isEnlisted(s.key)) s.restore({ slots: [], loaded: [], all: false })
}
