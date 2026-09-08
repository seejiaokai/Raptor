// src/state/persist.ts
/* LIVE SCHEDULER STATE ⇄ THE WHITEBOARD. Inputs, the roster, the planning
   layer and every week snapshot were session-only; they now ride the
   whiteboard (src/storage) like the settings always did. Two verbs:
   hydrate (boot: whiteboard → the module singletons, BEFORE initStore) and
   persistAll (every history step: singletons → whiteboard; the whiteboard
   ignores unchanged strings, so this is cheap and sends no idle letters).
   No import of state/store.ts here — store.ts imports isHydrated from us,
   and the two snapshot helpers it owns arrive through wirePersist. */
import { INPUTS, seedIidCounter } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { CURWEEK } from '../engine/waves'
import { HOOKS } from '../engine/hooks'
import { stashPut, stashKeys, stashGet, stashHas } from '../engine/weekstash'
import { PLANPUCKS, DAYRMK, seedPuckCounter } from './plan'
import type { Whiteboard } from '../storage/whiteboard'

/* the stash key is dd/mm/yyyy; '/' is the collection/id separator */
export const weekId = (key: string) => String(key).replace(/\//g, '-')
export const weekKey = (id: string) => id.replace(/-/g, '/')

type Snapshots = { weekSnap: () => string; weekDirty: () => boolean }
let wbRef: Whiteboard | null = null
let snaps: Snapshots | null = null
let hydrated = false

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
  const inputs = parse(wb.get('inputs', 'all'))
  if (Array.isArray(inputs)) {
    INPUTS.length = 0
    inputs.forEach((r: any) => INPUTS.push(r))
    seedIidCounter(maxNum(inputs.map((r: any) => String(r.iid ?? '')), 'i'))
    hydrated = true
  }
  const people = parse(wb.get('people', 'all'))
  if (people && typeof people === 'object' && !Array.isArray(people)) {
    for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
    Object.assign(PEOPLE, people)
  }
  const plan = parse(wb.get('plan', 'all'))
  if (plan && Array.isArray(plan.pp)) {
    PLANPUCKS.length = 0
    plan.pp.forEach((p: any) => PLANPUCKS.push(p))
    for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
    Object.assign(DAYRMK, plan.dm && typeof plan.dm === 'object' ? plan.dm : {})
    seedPuckCounter(maxNum(plan.pp.map((p: any) => String(p.id ?? '')), 'pp'))
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
  /* the loaded week: only once it has changed since load (or was already
     stashed) — a byte-copy of the pristine seed must never be persisted */
  if (stashHas(CURWEEK) || snaps.weekDirty()) wbRef.set('weeks', weekId(CURWEEK), snaps.weekSnap())
  for (const k of stashKeys()) {
    if (k === CURWEEK) continue
    const j = stashGet(k)
    if (j) wbRef.set('weeks', weekId(k), j)
  }
}

/** the Quals page's writes are not history steps — it calls this itself */
export function persistPeople(): void {
  wbRef?.set('people', 'all', JSON.stringify(PEOPLE))
}

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
