// src/state/persist.ts
/* LIVE SCHEDULER STATE ⇄ THE WHITEBOARD. Inputs, the roster, the planning
   layer and every week snapshot were session-only; they now ride the
   whiteboard (src/storage) like the settings always did. Two verbs:
   hydrate (boot: whiteboard → the module singletons, BEFORE initStore) and
   persistAll (every history step: singletons → whiteboard; the whiteboard
   ignores unchanged strings, so this is cheap and sends no idle letters).
   No import of state/store.ts here — store.ts imports isHydrated from us.

   THE WEEKS ARE ROWS, WRITTEN FROM THE COMMAND STREAM ([DB-READINESS] group A, phase 1 — plan §2.2, §2.5). A week is
   stored as the rows of IT's tables (state/weekrows.ts): its week row, seven day rows, one row per issued version and
   one per Unpublish. persistAll no longer writes weeks and no longer deletes one: every command's changes to a week are
   mapped to exactly the rows they touch at phase 9 of that command, inside its one saved group (the composer below,
   through state/rowmap.ts), and a row is removed only for an explicit delete. The old reconcile — "delete every stored
   week nothing local backs" — is gone: correct for one browser, destructive once the store is shared.

   AND SO ARE THE REQUESTS, THE ROSTER AND THE PLANNING CALENDAR (phase 2 — plan §2.5): one row per request
   (`inputs/<iid>`), per person (`people/<pid>` — the two placeholder pucks ALL and ALL AVAIL are code, never rows), per
   planning note or pucks row (`plan/pp:<id>`) and per day title (`plan/dm:<iso>`), each carrying its place in its list
   (`ord` — state/ord.ts). Written by the same stream consumer; `persistAll` is gone. A first boot stores the seed's rows
   in the boot's one group (wirePersist). */
import { INPUTS, mintInpIds } from '../engine/inputs'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { CURWEEK } from '../engine/waves'
import { stashPut, stashHas, isPreservedWeek, setPreservedBlob } from '../engine/weekstash'
import { amFormatOf } from '../engine/publish'
import { PLANPUCKS, DAYRMK } from './plan'
import type { Whiteboard } from '../storage/whiteboard'
import { storeInitialized } from '../storage/schema'
import { registerConverter, type Converter } from '../storage/fold'
import type { Entry } from '../storage/backend'
import type { Change, LogicalCollection } from '../command/types'
import { wireChangeBatches } from './changebatch'
/* the change history's and the accounts' one-time conversions (the fold's `elog` and `accounts` converters — phase 4) */
import './settingsrows'
import { wireRowConsumer, registerComposer, registerMapper, type RowWrite } from './rowmap'
import { schedRecordsNow, resyncSchedBaseline } from './sched-commit'
import { mintOrd, sortByOrd, byOrd } from '../command/ord'
import {
  joinWeek, parseRowId, rowSuffix, dayRowJSON, weekRowJSON, stashRows, weeksConverter, type WeekRows,
} from './weekrows'

/* the stash key is dd/mm/yyyy; '/' is the collection/id separator */
export const weekId = (key: string) => String(key).replace(/\//g, '-')
export const weekKey = (id: string) => id.replace(/-/g, '/')

/* the one-time conversion of an old store's whole-week records into rows (storage/fold.ts) — registered now; the fold
   runs only once every group-A converter is registered (the manifest), so until then no store is touched */
registerConverter(weeksConverter)

const iidOf = (r: any) => r && r.iid
const puckIdOf = (p: any) => p && p.id
/* the roster's placeholder pucks (ALL, ALL AVAIL — engine/people.ts `special`) are code: never stored, never read back */
const isPlaceholder = (id: string, p?: any) => id === 'all' || id === 'allavail' || !!(p && p.special)

/* the one-time conversions of an old store's whole-list records (storage/fold.ts): each list becomes one row per item,
   in its old order (`ord` minted from the list's order — state/ord.ts), and the old record is removed in the same
   group. An old record that will not read is left as it is (the reader never reads it). Pure; each writes its own
   collection only. */
const fromList = (raw: string | undefined): any => { if (raw == null) return null; try { return JSON.parse(raw) } catch { return null } }
export const inputsConverter: Converter = {
  name: 'inputs', collections: ['inputs'],
  convert(snap) {
    const list = fromList(snap.inputs?.all)
    if (!Array.isArray(list)) return []
    const rows = list.filter((r: any) => r && typeof r === 'object' && !Array.isArray(r))
      .map((r: any, i: number) => ({ ...r, iid: r.iid ?? `ifold${i}` }))
    for (const r of rows) delete r.ord
    mintOrd(rows, iidOf)
    const out: Entry[] = rows.map((r: any) => ({ collection: 'inputs', id: String(r.iid), value: JSON.stringify(r) }))
    out.push({ collection: 'inputs', id: 'all', value: null })
    return out
  },
}
export const peopleConverter: Converter = {
  name: 'people', collections: ['people'],
  convert(snap) {
    const obj = fromList(snap.people?.all)
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return []
    const ids = Object.keys(obj).filter(id => obj[id] && typeof obj[id] === 'object' && !isPlaceholder(id, obj[id]))
    const rows = ids.map(id => { const p = { ...obj[id] }; delete p.ord; return p })
    const idOf = new Map(rows.map((p, i) => [p, ids[i]]))
    mintOrd(rows, p => idOf.get(p)!)
    /* the old record's key IS a placeholder's id (ALL is `all`): its row is the removal, never a person */
    const out: Entry[] = [{ collection: 'people', id: 'all', value: null }]
    rows.forEach((p, i) => out.push({ collection: 'people', id: ids[i], value: JSON.stringify(p) }))
    return out
  },
}
export const planConverter: Converter = {
  name: 'plan', collections: ['plan'],
  convert(snap) {
    const plan = fromList(snap.plan?.all)
    if (!plan || typeof plan !== 'object') return []
    const pucks = (Array.isArray(plan.pp) ? plan.pp : []).filter((p: any) => p && typeof p === 'object' && p.id != null)
      .map((p: any) => { const c = { ...p }; delete c.ord; return c })
    mintOrd(pucks, puckIdOf)
    const out: Entry[] = pucks.map((p: any) => ({ collection: 'plan', id: `pp:${p.id}`, value: JSON.stringify(p) }))
    const dm = plan.dm && typeof plan.dm === 'object' ? plan.dm : {}
    for (const iso of Object.keys(dm)) if (typeof dm[iso] === 'string') out.push({ collection: 'plan', id: `dm:${iso}`, value: JSON.stringify(dm[iso]) })
    out.push({ collection: 'plan', id: 'all', value: null })
    return out
  },
}
registerConverter(inputsConverter)
registerConverter(peopleConverter)
registerConverter(planConverter)

type Snapshots = { weekSnap: () => string; weekDirty: () => boolean }
let wbRef: Whiteboard | null = null
let hydrated = false
let unwireRows: (() => void) | null = null
let wiredTo: Whiteboard | null = null

export const isHydrated = () => hydrated

/* [DB-READINESS] group A, phase 0 (plan §2.8) — "has the Leave War's world already started?" for
   main.tsx's installDemoWorld. The store's stamp answers (storage/schema.ts); only a store stamped
   the old way (a bare number — every browser before this build, until its first seal) falls back to
   the old sniff: the war's old whole record, or — since the war is one row per record (phase 3) — any
   war row. A started store must never get the demo world back. */
export function leaveWarStarted(wb: Whiteboard): boolean {
  return storeInitialized(wb) ?? (wb.has('leavewar', 'wars') || wb.keys('leavewar').some(k => k.startsWith('war:')))
}

function parse(json: string | null): any {
  if (json == null) return null
  try { return JSON.parse(json) } catch (e) { console.warn('persist: unreadable record ignored', e) ; return null }
}

/* A saved week that cannot be shown as it is saved still loads — READ-ONLY, and its rows are never written again
   (P2-IMPL-02, P2-REV2-01, kept per week — F2-08). Decided HERE, per week, before anything reads it:
   - a row that will not read, or an id the join cannot place → the stash takes a record with no days, so the week
     loads the seed as a placeholder view, held read-only (state/store.ts applyWeekModel's unreadable branch);
   - a week row that still carries the whole week (an old record the fold could not split) → the stash takes that
     record as it is: shown, read-only;
   - a week that joins but was published by an older build (amFormatOf 'unsupported') → shown, read-only.
   Its stored rows are left byte-for-byte: the row writer never writes a preserved week. */
const UNREADABLE = '{"unreadable":true}'
function readStoredWeek(rows: WeekRows, wk: string): { json: string; preserved: boolean } {
  const head = rows[''] != null ? parse(rows['']) : null
  if (head && typeof head === 'object' && Array.isArray(head.d)) return { json: rows[''], preserved: true }
  try {
    const b = joinWeek(rows, wk)
    const json = JSON.stringify(b)
    return { json, preserved: amFormatOf({ amV: b.am, als: b.a, orig: b.o, cur: b.cv }, wk) === 'unsupported' }
  } catch (e) {
    console.warn(`persist: saved week ${wk} will not read — kept as it is, shown read-only`, e)
    return { json: UNREADABLE, preserved: true }
  }
}

/** whiteboard → module singletons; call BEFORE initStore() */
export function hydrate(wb: Whiteboard): void {
  /* [DB-READINESS] group A, phase 0 (plan §2.8) — "already started" is the stamp's `initialized`,
     which seeds skip on (state/store.ts initStore). A STARTED store holding no inputs record has no
     inputs — the seed module's rows are cleared, never shown. Only a store stamped the old way (a
     bare number, `null` here) still decides by whether it holds any request rows. */
  const started = storeInitialized(wb)
  hydrated = started === true
  /* a row that is not a record (a null, or bytes that will not read) is left in storage as it is and not read —
     never pushed: `r.iid` on it would throw out of here and main.tsx's boot guard would show the whole app the "could
     not load" screen for ever; never deleted: nothing but an explicit delete removes a row (plan §2.2) */
  const isRecord = (r: any) => !!r && typeof r === 'object' && !Array.isArray(r)
  /* the requests — one row each, in their saved order (ord, iid). `all` is an old whole-list record the fold replaces:
     never read as a request. iid is opaque (engine/newid.ts); a row missing one takes its row id. */
  const inputs: any[] = []
  for (const id of wb.keys('inputs')) {
    if (id === 'all') continue
    const r = parse(wb.get('inputs', id))
    if (isRecord(r)) { if (r.iid == null) r.iid = id; inputs.push(r) }
  }
  /* started: the stamp says so — or, on a store stamped the old way (a bare number, `null`), it holds requests, as rows
     or as the old whole-list record (the sniff it always made; the fold turns that record into rows) */
  const startedNow = started === true || (started === null && (inputs.length > 0 || wb.has('inputs', 'all')))
  hydrated = startedNow
  if (startedNow) {
    sortByOrd(inputs, iidOf)
    INPUTS.length = 0
    inputs.forEach(r => INPUTS.push(r))
  }
  /* the roster — one row per person, in their saved order; the placeholder pucks come from the code, last, as the seed
     roster holds them */
  const people: Array<[string, any]> = []
  for (const id of wb.keys('people')) {
    if (isPlaceholder(id, PEOPLE[id])) continue
    const p = parse(wb.get('people', id))
    if (isRecord(p)) people.push([id, p])
  }
  /* the stored roster replaces the seed's only when there is one — a roster is never emptied by a store that holds none */
  if (people.length) {
    const cmp = byOrd((row: any) => row.__pid)
    people.sort((a, b) => cmp({ ord: a[1].ord, __pid: a[0] }, { ord: b[1].ord, __pid: b[0] }))
    const placeholders = Object.keys(PEOPLE).filter(k => isPlaceholder(k, PEOPLE[k])).map(k => [k, PEOPLE[k]] as [string, any])
    for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
    for (const [id, p] of people) PEOPLE[id] = p
    for (const [id, p] of placeholders) PEOPLE[id] = p
    /* the callsign index is built once, at module load, from the SEED roster
       (engine/people.ts) — rebuild it for the stored one, or a person added
       or renamed on the Quals page stops resolving after a reload while the
       old callsign still does (8 Sep 26 bug pass) */
    /* the ONE index body — the roster and the placeholders only ([POST-OUT-OUTCOMES], D286) */
    indexCallsigns()
  }
  /* the planning calendar — one row per note or pucks row (`pp:<id>`), per day title (`dm:<iso>`) */
  const pucks: any[] = [], titles: Record<string, string> = {}
  for (const id of wb.keys('plan')) {
    if (id.startsWith('pp:')) { const p = parse(wb.get('plan', id)); if (isRecord(p)) { if (p.id == null) p.id = id.slice(3); pucks.push(p) } }
    else if (id.startsWith('dm:')) { const t = parse(wb.get('plan', id)); if (typeof t === 'string') titles[id.slice(3)] = t }
  }
  if (pucks.length || Object.keys(titles).length || startedNow) {
    sortByOrd(pucks, puckIdOf)
    PLANPUCKS.length = 0
    pucks.forEach(p => PLANPUCKS.push(p))
    for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
    Object.assign(DAYRMK, titles)
  }
  /* every saved week: its rows joined back into the one record the app keeps in memory (the stash), per week */
  const byWeek = new Map<string, WeekRows>()
  for (const id of wb.keys('weeks')) {
    const r = parseRowId(id)
    const raw = wb.get('weeks', id)
    if (!r || raw == null) { if (!r) console.warn(`persist: a saved week row this build cannot place is kept, not read: ${id}`); continue }
    let rows = byWeek.get(r.week)
    if (!rows) byWeek.set(r.week, rows = {})
    rows[rowSuffix(r)] = raw
  }
  for (const [wid, rows] of byWeek) {
    const wk = weekKey(wid)
    const { json, preserved } = readStoredWeek(rows, wk)
    stashPut(wk, json)
    if (preserved) setPreservedBlob(wk, json)
  }
}

/* ---- the requests, the roster and the planning calendar: one row each, from the command stream (phase 2) ---- */

/* the rows one change lands in. A put writes the record as it now stands; a delete removes its row — never inferred.
   A placeholder puck is code and is never written. */
const rowOf = (collection: 'inputs' | 'people' | 'plan') => (c: Change): RowWrite[] => {
  if (collection === 'inputs' && c.id === '__order') return []
  if (collection === 'people' && isPlaceholder(c.id, (c.after ?? c.before) as any)) return []
  return [{ collection, id: c.id, value: c.op === 'delete' ? null : JSON.stringify(c.after) }]
}

/* THE FIRST BOOT'S SEED, AS ROWS (plan §2.8 — "set by the seed in its own group"). A store that has not started gets
   every seed request, person and planning row written once, inside the boot's one group (main.tsx openBootGroup),
   after the boot has placed and ordered them. Named here because it is a write outside any command: the only one the
   rows have besides the fold. */
export function writeSeedRows(wb: Whiteboard): void {
  mintInpIds()   // ids and places in the list (engine/inputs.ts)
  mintOrd(PLANPUCKS, puckIdOf)
  resyncSchedBaseline()
  for (const r of INPUTS) if (r && r.iid != null) wb.set('inputs', String(r.iid), JSON.stringify(r))
  for (const id of Object.keys(PEOPLE)) if (!isPlaceholder(id, PEOPLE[id])) wb.set('people', id, JSON.stringify(PEOPLE[id]))
  for (const p of PLANPUCKS) if (p && p.id != null) wb.set('plan', `pp:${p.id}`, JSON.stringify(p))
  for (const iso of Object.keys(DAYRMK)) wb.set('plan', `dm:${iso}`, JSON.stringify(DAYRMK[iso]))
}

/* ---- the week's rows, written from the command stream ---------------------------------------------------------- */

const LOADED_COLLS: LogicalCollection[] = ['days', 'sched.book', 'sched.mutes', 'sched.week', 'sched.issuance', 'sched.retraction']
const weekOfId = (id: string) => id.split(/[:#]/)[0]

/* every row of the LOADED week, as the command left it (its records — state/sched-commit.ts), or null for a week that
   is one opaque record (read-only, never written) */
function loadedRows(wk: string): WeekRows | null {
  const recs = schedRecordsNow()
  const val = (k: string) => recs.get(k)?.value
  const week: any = val(`sched.week/${wk}`)
  if (!week || week.frozen) return null
  const rows: WeekRows = { '': weekRowJSON(week) }
  for (let di = 0; di < 7; di++) rows[`#${di}`] = dayRowJSON({ d: val(`days/${wk}#${di}`), book: val(`sched.book/${wk}#${di}`) || {}, wo: (val(`sched.mutes/${wk}#${di}`) as string[]) || [] })
  for (const [k, e] of recs) {
    if (e.collection === 'sched.issuance') rows[`:is:${e.id.slice(e.id.indexOf(':') + 1)}`] = JSON.stringify(e.value)
    else if (e.collection === 'sched.retraction') rows[`:rx:${e.id.slice(e.id.indexOf(':') + 1)}`] = JSON.stringify(e.value)
    void k
  }
  return rows
}

/* THE ROWS ONE COMMAND'S SCHEDULE CHANGES LAND IN (plan §2.5 matrix):
   - the loaded week — a day's content, its book slice or its mutes → that day's row, rebuilt whole from what the
     command committed; its stamps → the week row; an issued version or an Unpublish → its own row, a delete (an Undo
     of a publish or of an Unpublish) removing that row alone;
   - a saved week not on screen (`weekstash`, already in row form) → the same rows of that week;
   - a week saved for the FIRST time → its week row and all seven day rows together (and every issued row it has), so
     a stored week is never a part of one;
   - a preserved week (read-only, P2-IMPL-02) → nothing, ever. */
function scheduleRows(wb: Whiteboard, changes: readonly Change[]): RowWrite[] {
  const out: RowWrite[] = []
  const put = (id: string, value: string | null) => out.push({ collection: 'weeks', id, value })
  const loaded = new Map<string, { days: Set<number>; week: boolean; issued: Change[] }>()
  const saved = new Map<string, Change[]>()
  for (const c of changes) {
    const wk = weekOfId(c.id)
    if (c.collection === 'weekstash') { let l = saved.get(wk); if (!l) saved.set(wk, l = []); l.push(c); continue }
    let t = loaded.get(wk)
    if (!t) loaded.set(wk, t = { days: new Set(), week: false, issued: [] })
    if (c.collection === 'sched.week') t.week = true
    else if (c.collection === 'sched.issuance' || c.collection === 'sched.retraction') t.issued.push(c)
    else t.days.add(Number(c.id.slice(c.id.indexOf('#') + 1)))
  }
  for (const [wk, t] of loaded) {
    /* a loaded-week record names the week on screen; one that does not (never expected) is not guessed at */
    if (wk !== CURWEEK) { console.warn(`persist: a change to week ${wk} arrived while ${CURWEEK} is loaded — not saved`); continue }
    if (isPreservedWeek(wk)) continue
    const rows = loadedRows(wk)
    if (!rows) continue
    const wid = weekId(wk)
    if (!wb.has('weeks', wid)) { for (const sfx of Object.keys(rows)) put(wid + sfx, rows[sfx]); continue }
    if (t.week) put(wid, rows[''])
    for (const di of t.days) put(`${wid}#${di}`, rows[`#${di}`])
    for (const c of t.issued) {
      const sfx = `:${c.collection === 'sched.issuance' ? 'is' : 'rx'}:${c.id.slice(c.id.indexOf(':') + 1)}`
      put(wid + sfx, c.op === 'delete' ? null : (rows[sfx] ?? JSON.stringify(c.after)))
    }
  }
  for (const [wk, cs] of saved) {
    if (isPreservedWeek(wk)) continue
    const wid = weekId(wk)
    if (!wb.has('weeks', wid) && stashHas(wk)) {
      const rows = stashRows(wk)
      if (rows) { for (const sfx of Object.keys(rows)) put(wid + sfx, rows[sfx]); continue }
    }
    for (const c of cs) put(wid + c.id.slice(wk.length), c.op === 'delete' ? null : String(c.after))
  }
  return out
}

/* the loaded week's rows, written once at boot when that week is already saved: the boot re-lands the requests filed
   on it since it was saved (state/store.ts applyWeekModel) outside any command, so its changed rows go out here — the
   whiteboard sends only the rows whose bytes differ. A week never saved stays unsaved (a pristine week is never
   stored); a preserved one is never written. */
function writeLoadedWeekAtBoot(wb: Whiteboard): void {
  if (!stashHas(CURWEEK) || isPreservedWeek(CURWEEK)) return
  const rows = loadedRows(CURWEEK)
  if (!rows) return
  const wid = weekId(CURWEEK)
  for (const sfx of Object.keys(rows)) wb.set('weeks', wid + sfx, rows[sfx])
}

/** THE STREAM CONSUMER, wired to the whiteboard — as early in the boot as the whiteboard exists (main.tsx calls it
    right after hydrate), so every command the boot itself runs (the Leave War's boot sync) saves its rows. Idempotent. */
export function wireRows(wb: Whiteboard): void {
  if (wiredTo === wb) return
  wiredTo = wb
  /* [ARCH-STACK-4] phase 0 (§20.1) — every command's durable writes become ONE
     all-or-nothing group: the command layer opens a whiteboard transaction per
     outermost command. [DB-READINESS] group A, phase 4.1 — and every such group carries ONE change-log batch naming
     its rows (state/changebatch.ts: the wrapper, the sealer and the envelope collector). */
  wireChangeBatches(wb)
  /* [DB-READINESS] group A (plan §2.2) — each command's changes, mapped to the stored rows they live in, written inside
     the command's own group (state/rowmap.ts). Phase 1: the schedule's weeks (a composer — a day row is three records);
     phase 2: the requests, the roster, the planning calendar. */
  registerComposer({ name: 'schedule', collections: [...LOADED_COLLS, 'weekstash'], rows: (changes) => scheduleRows(wb, changes) })
  registerMapper('inputs', rowOf('inputs'))
  registerMapper('people', rowOf('people'))
  registerMapper('plan', rowOf('plan'))
  unwireRows?.()
  unwireRows = wireRowConsumer(wb)
}

/** call AFTER initStore() (wireStore sets HOOKS.histPush there) */
export function wirePersist(wb: Whiteboard, _s?: Snapshots): void {
  wbRef = wb
  wireRows(wb)
  /* a store that had not started: the seed's rows, once, in the boot's group */
  if (!hydrated) writeSeedRows(wb)
  writeLoadedWeekAtBoot(wb)
}
