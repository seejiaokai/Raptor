// src/state/persist.ts
/* LIVE SCHEDULER STATE ⇄ THE WHITEBOARD. Inputs, the roster, the planning
   layer and every week snapshot were session-only; they now ride the
   whiteboard (src/storage) like the settings always did. Two verbs:
   hydrate (boot: whiteboard → the module singletons, BEFORE initStore) and
   persistAll (every history step: singletons → whiteboard; the whiteboard
   ignores unchanged strings, so this is cheap and sends no idle letters).
   No import of state/store.ts here — store.ts imports isHydrated from us,
   and the two snapshot helpers it owns arrive through wirePersist. */
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { CURWEEK } from '../engine/waves'
import { HOOKS } from '../engine/hooks'
import { stashPut, stashKeys, stashGet, stashHas, isPreservedWeek, preservedBlob } from '../engine/weekstash'
import { PLANPUCKS, DAYRMK, seedPuckCounter } from './plan'
import type { Whiteboard } from '../storage/whiteboard'

/* the stash key is dd/mm/yyyy; '/' is the collection/id separator */
export const weekId = (key: string) => String(key).replace(/\//g, '-')
export const weekKey = (id: string) => id.replace(/-/g, '/')

type Snapshots = { weekSnap: () => string; weekDirty: () => boolean }
let wbRef: Whiteboard | null = null
let snaps: Snapshots | null = null
let hydrated = false
/* loadWeek's swap window (state/store.ts): between setCurWeek and the arriving
   week's baseline, CURWEEK already names the NEW week while DAYS, SCHED and
   weekBaseline still belong to the one being left — so the live-week line in
   persistAll would file the old days under the new id (8 Sep 26 bug pass:
   edit week A, click to a blank week B, reload → B shows A's schedule and A
   has lost it). Inside the window only the stash is written; the arriving
   week is filed once, by weekSwapEnd, after its baseline is set. */
let swapping = false

export const isHydrated = () => hydrated

function parse(json: string | null): any {
  if (json == null) return null
  try { return JSON.parse(json) } catch (e) { console.warn('persist: unreadable record ignored', e); return null }
}
const maxNum = (ids: string[], prefix: string) =>
  ids.reduce((m, id) => { const n = id.startsWith(prefix) ? Number(id.slice(prefix.length)) : NaN; return Number.isFinite(n) && n > m ? n : m }, 0)

/** whiteboard → module singletons; call BEFORE initStore() */
export function hydrate(wb: Whiteboard): void {
  hydrated = false
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
    hydrated = true
  }
  const people = parse(wb.get('people', 'all'))
  if (people && typeof people === 'object' && !Array.isArray(people)) {
    for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
    Object.assign(PEOPLE, people)
    /* the callsign index is built once, at module load, from the SEED roster
       (engine/people.ts) — rebuild it for the stored one, or a person added
       or renamed on the Quals page stops resolving after a reload while the
       old callsign still does (8 Sep 26 bug pass) */
    for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
    for (const id of Object.keys(PEOPLE)) {
      const cs = PEOPLE[id] && PEOPLE[id].cs
      if (typeof cs === 'string') ID_BY_CS[cs.toLowerCase()] = id
    }
  }
  const plan = parse(wb.get('plan', 'all'))
  if (plan && Array.isArray(plan.pp)) {
    PLANPUCKS.length = 0
    plan.pp.forEach((p: any) => { if (isRow(p)) PLANPUCKS.push(p) })
    for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
    Object.assign(DAYRMK, plan.dm && typeof plan.dm === 'object' ? plan.dm : {})
    seedPuckCounter(maxNum(PLANPUCKS.map((p: any) => String(p.id ?? '')), 'pp'))
  }
  for (const id of wb.keys('weeks')) {
    const json = wb.get('weeks', id)
    if (json) stashPut(weekKey(id), json)
  }
}

/** module singletons → whiteboard; wired to every history step */
export function persistAll(): void {
  if (!wbRef || !snaps) return
  wbRef.set('inputs', 'all', JSON.stringify(INPUTS))
  wbRef.set('people', 'all', JSON.stringify(PEOPLE))
  wbRef.set('plan', 'all', JSON.stringify({ pp: PLANPUCKS, dm: DAYRMK }))
  /* every stashed week, from its stash entry. The loaded week is filed from
     the live DAYS below instead — except inside the swap window, where its
     stash entry is the only true copy of it (see `swapping`) */
  const keep = new Set<string>()
  for (const k of stashKeys()) {
    if (k === CURWEEK && !swapping) continue
    /* a preserved (pre-Phase-2, byte-frozen) week is written from its retained
       ORIGINAL blob, never a re-serialization (P2-IMPL-02). */
    const j = isPreservedWeek(k) ? preservedBlob(k) : stashGet(k)
    if (j) { wbRef.set('weeks', weekId(k), j); keep.add(weekId(k)) }
  }
  if (swapping) return
  const live = weekId(CURWEEK)
  if (isPreservedWeek(CURWEEK)) {
    /* the loaded week is a byte-frozen pre-Phase-2 book: write its retained
       original blob verbatim, never weekSnap() (which would overwrite the
       recovery evidence with a reconstruction — P2-IMPL-02). */
    const j = preservedBlob(CURWEEK)
    if (j) { wbRef.set('weeks', live, j); keep.add(live) }
  } else if (stashHas(CURWEEK) || snaps.weekDirty()) {
    /* the loaded week: only once it has changed since load (or was already
       stashed) — a byte-copy of the pristine seed must never be persisted */
    wbRef.set('weeks', live, snaps.weekSnap()); keep.add(live)
  }
  /* a record nothing backs any more goes too: the loaded week undone back to
     its load state (its earlier dirty snapshot would come back on the next
     boot), or a week the Admin sweep dropped from the stash (8 Sep 26 bug
     pass: "Cleared N records", reload, all N were back) */
  for (const id of wbRef.keys('weeks')) if (!keep.has(id)) wbRef.delete('weeks', id)
}

/** the Quals page's writes are not history steps — it calls this itself */
export function persistPeople(): void {
  wbRef?.set('people', 'all', JSON.stringify(PEOPLE))
}

/** loadWeek's swap window — see `swapping` above; End files the arriving week */
export function weekSwapBegin(): void { swapping = true }
export function weekSwapEnd(): void { swapping = false; persistAll() }

/** call AFTER initStore() (wireStore sets HOOKS.histPush there) */
export function wirePersist(wb: Whiteboard, s: Snapshots): void {
  wbRef = wb
  snaps = s
  const push = HOOKS.histPush
  HOOKS.histPush = () => { push(); persistAll() }
  const applied = HOOKS.histApplied
  HOOKS.histApplied = () => { applied(); persistAll() }
  const swapped = HOOKS.weekSwapped
  HOOKS.weekSwapped = () => { swapped(); persistAll() }
  persistAll()
}
