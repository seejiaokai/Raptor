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
   week nothing local backs" — is gone: correct for one browser, destructive once the store is shared. */
import { INPUTS } from '../engine/inputs'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { CURWEEK } from '../engine/waves'
import { HOOKS } from '../engine/hooks'
import { stashPut, stashHas, isPreservedWeek, setPreservedBlob } from '../engine/weekstash'
import { amFormatOf } from '../engine/publish'
import { PLANPUCKS, DAYRMK, seedPuckCounter } from './plan'
import type { Whiteboard } from '../storage/whiteboard'
import { storeInitialized } from '../storage/schema'
import { registerConverter } from '../storage/fold'
import { deferEffect, setTxnWrapper } from '../command'
import type { Change, LogicalCollection } from '../command/types'
import { wireRowConsumer, registerComposer, type RowWrite } from './rowmap'
import { schedRecordsNow } from './sched-commit'
import {
  joinWeek, parseRowId, rowSuffix, dayRowJSON, weekRowJSON, stashRows, weeksConverter, type WeekRows,
} from './weekrows'

/* the stash key is dd/mm/yyyy; '/' is the collection/id separator */
export const weekId = (key: string) => String(key).replace(/\//g, '-')
export const weekKey = (id: string) => id.replace(/-/g, '/')

/* the one-time conversion of an old store's whole-week records into rows (storage/fold.ts) — registered now; the fold
   runs only once every group-A converter is registered (the manifest), so until then no store is touched */
registerConverter(weeksConverter)

type Snapshots = { weekSnap: () => string; weekDirty: () => boolean }
let wbRef: Whiteboard | null = null
let hydrated = false
let unwireRows: (() => void) | null = null

export const isHydrated = () => hydrated

/* [DB-READINESS] group A, phase 0 (plan §2.8) — "has the Leave War's world already started?" for
   main.tsx's installDemoWorld. The store's stamp answers (storage/schema.ts); only a store stamped
   the old way (a bare number — every browser before this build, until its first seal) falls back to
   the old sniff of the war record. Once the war is one row per record (phase 3) there is no single
   `wars` record to sniff, and a started store must never get the demo world back. */
export function leaveWarStarted(wb: Whiteboard): boolean {
  return storeInitialized(wb) ?? wb.has('leavewar', 'wars')
}

function parse(json: string | null): any {
  if (json == null) return null
  try { return JSON.parse(json) } catch (e) { console.warn('persist: unreadable record ignored', e) ; return null }
}
const maxNum = (ids: string[], prefix: string) =>
  ids.reduce((m, id) => { const n = id.startsWith(prefix) ? Number(id.slice(prefix.length)) : NaN; return Number.isFinite(n) && n > m ? n : m }, 0)

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
     bare number, `null` here) still decides by whether its inputs record is there, exactly as before. */
  const started = storeInitialized(wb)
  hydrated = started === true
  /* a row that is not an object (a null from hand-edited storage) is dropped,
     not pushed: `r.iid` on it would throw out of here and main.tsx's boot
     guard would show the whole app the "could not load" screen for ever */
  const isRow = (r: any) => !!r && typeof r === 'object'
  const inputs = parse(wb.get('inputs', 'all'))
  if (Array.isArray(inputs)) {
    INPUTS.length = 0
    inputs.forEach((r: any) => { if (isRow(r)) INPUTS.push(r) })
    /* iid is opaque now (engine/newid.ts) — no counter to seed past stored ids;
       a stored iid is kept as-is and a row missing one mints via mintInpIds. */
    if (started === null) hydrated = true
  } else if (started === true) {
    INPUTS.length = 0
  }
  const people = parse(wb.get('people', 'all'))
  if (people && typeof people === 'object' && !Array.isArray(people)) {
    for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
    Object.assign(PEOPLE, people)
    /* the callsign index is built once, at module load, from the SEED roster
       (engine/people.ts) — rebuild it for the stored one, or a person added
       or renamed on the Quals page stops resolving after a reload while the
       old callsign still does (8 Sep 26 bug pass) */
    /* the ONE index body — the roster and the placeholders only ([POST-OUT-OUTCOMES], D286) */
    indexCallsigns()
  }
  const plan = parse(wb.get('plan', 'all'))
  if (plan && Array.isArray(plan.pp)) {
    PLANPUCKS.length = 0
    plan.pp.forEach((p: any) => { if (isRow(p)) PLANPUCKS.push(p) })
    for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
    Object.assign(DAYRMK, plan.dm && typeof plan.dm === 'object' ? plan.dm : {})
    seedPuckCounter(maxNum(PLANPUCKS.map((p: any) => String(p.id ?? '')), 'pp'))
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

/** module singletons → whiteboard; wired to every history step. The weeks are not here — they are rows written from
    the command stream (below). */
export function persistAll(): void {
  if (!wbRef) return
  wbRef.set('inputs', 'all', JSON.stringify(INPUTS))
  wbRef.set('people', 'all', JSON.stringify(PEOPLE))
  wbRef.set('plan', 'all', JSON.stringify({ pp: PLANPUCKS, dm: DAYRMK }))
}

/** the Quals page's writes are not history steps — it calls this itself */
export function persistPeople(): void {
  wbRef?.set('people', 'all', JSON.stringify(PEOPLE))
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

/** call AFTER initStore() (wireStore sets HOOKS.histPush there) */
export function wirePersist(wb: Whiteboard, _s?: Snapshots): void {
  wbRef = wb
  /* [ARCH-STACK-4] phase 0 (§20.1) — every command's durable writes become ONE
     all-or-nothing group: the command layer opens a whiteboard transaction per
     outermost command. */
  setTxnWrapper(wb)
  /* [DB-READINESS] group A (plan §2.2) — the stream consumer: each command's changes, mapped to the stored rows they
     live in, written inside the command's own group (state/rowmap.ts). Phase 1: the schedule's weeks. */
  registerComposer({ name: 'schedule', collections: [...LOADED_COLLS, 'weekstash'], rows: (changes) => scheduleRows(wb, changes) })
  unwireRows?.()
  unwireRows = wireRowConsumer(wb)
  const push = HOOKS.histPush
  /* §21.1c — the scheduler's persist joins the command's deferred effects, so a
     refused command discards it instead of writing its rolled-back world; outside
     a command it runs inline exactly as before. */
  HOOKS.histPush = () => { push(); if (!deferEffect(persistAll)) persistAll() }
  const applied = HOOKS.histApplied
  HOOKS.histApplied = () => { applied(); persistAll() }
  persistAll()
  writeLoadedWeekAtBoot(wb)
}
