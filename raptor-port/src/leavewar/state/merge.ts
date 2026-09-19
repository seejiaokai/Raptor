// THE ONE READ DOOR'S MERGE ([ARCH-STACK] step 4, phase 3; design §4.2–§4.3).
//
// The store keeps each war RAW — its own records only (`recs`). What every
// screen and every figure reads is the MERGED war: those records together with
// the absences derived from the Inputs (`absences.ts`), one `DayView` per
// person/date, plus two projections the existing grid code already reads:
//   `grid[pid][date]`   — the main code's notation (what the box prints),
//   `states[pid][date]` — the main record's colour state, its moved-from date,
//                         its note, and `source: 'raptor'` when the war may not
//                         change it (filed on the Inputs page / medical / a
//                         generated credit — the blue edge, design §5.4).
// Nothing here is ever persisted or diffed into a command: writers, undo and
// storage keep reading the raw state.
//
// Cost (design §4.3, a named gate): cached per (raw war, absence index), and
// within that per person — a person whose raw row AND absence row are both
// unchanged keeps last time's merged rows, so a bid keystroke re-merges one
// person, not the squadron.

import type { BidRecord, Grid, LeaveWar, States } from '../engine'
import { dayView, type Contrib, type DayView, type Views } from '../engine/dayview'
import { recContribs, type Recs, type WarRec } from '../engine/warrecs'

export type { Views }
export interface MergedWar extends LeaveWar {
  grid: Grid
  states: States
  views: Views
}
/** personId → date → the absences on it (derived from the Inputs). */
export type AbsenceRows = ReadonlyMap<string, ReadonlyMap<string, readonly Contrib[]>>

const NO_ABS: AbsenceRows = new Map()
let ABS: AbsenceRows = NO_ABS
let ABS_VER = 0

/** Install a new absence index (sync.ts, on any Inputs change). Persons whose
 *  row is the SAME object as before keep their merged rows. */
export function setAbsenceRows(ix: AbsenceRows): void { ABS = ix; ABS_VER++ }
export function absenceRows(): AbsenceRows { return ABS }
export function absenceVersion(): number { return ABS_VER }
/** The absences on one person/date, war-agnostic (design §3.1 `absenceAt`). */
export function absencesAt(personId: string, date: string): readonly Contrib[] {
  return ABS.get(personId)?.get(date) ?? []
}

/* per war+person: the inputs last merged and what they produced */
interface RowCache {
  raw: Record<string, WarRec[]> | undefined
  abs: ReadonlyMap<string, readonly Contrib[]> | undefined
  start: string
  end: string
  grid: Record<string, string>
  states: Record<string, BidRecord>
  views: Record<string, DayView>
}
const ROWS = new Map<string, RowCache>()
const WARS = new WeakMap<LeaveWar, { ver: number; merged: MergedWar }>()

/** Test/reset hook: forget every cached row (a world swap). */
export function resetMergeCache(): void { ROWS.clear() }

function projRecord(v: DayView): BidRecord | undefined {
  const m = v.main
  if (!m) return undefined
  if (m.kind === 'request') {
    const r: BidRecord = { state: m.state!, source: 'bid' }
    if (m.movedFrom) r.shiftedFrom = m.movedFrom
    return r
  }
  if (m.kind === 'credit') {
    const r: BidRecord = { state: 'approved', source: m.auto ? 'raptor' : 'bid' }
    if (m.note) r.note = m.note
    return r
  }
  /* an absence: war-editable only when approved on the war (`lw`) and not
     medical, course or OD — everything else says "change it on the Inputs
     page" (design §5.4, owner §13 Q1) */
  const locked = !m.lw || !(v.all.every(c => c.kind !== 'absence' || c.lw))
    || ['ATTC', 'ATTB', 'HL', 'OML', 'CSE', 'OD'].includes(m.code)
  const r: BidRecord = { state: 'approved', source: locked ? 'raptor' : 'bid' }
  if (m.movedFrom) r.shiftedFrom = m.movedFrom
  return r
}

function mergeRow(war: LeaveWar, pid: string, raw: Record<string, WarRec[]> | undefined,
  abs: ReadonlyMap<string, readonly Contrib[]> | undefined): RowCache {
  const { start, end } = war.period
  const key = `${war.period.id}|${pid}`
  const hit = ROWS.get(key)
  if (hit && hit.raw === raw && hit.abs === abs && hit.start === start && hit.end === end) return hit
  const dates = new Set<string>(raw ? Object.keys(raw) : [])
  if (abs) for (const d of abs.keys()) if (d >= start && d <= end) dates.add(d)
  const grid: Record<string, string> = {}
  const states: Record<string, BidRecord> = {}
  const views: Record<string, DayView> = {}
  for (const d of dates) {
    const own = raw?.[d]
    const contribs = [...(own ? recContribs(own) : []), ...(abs?.get(d) ?? [])]
    if (!contribs.length) continue
    const v = dayView(contribs)
    views[d] = v
    if (v.code) grid[d] = v.code
    const r = projRecord(v)
    if (r) states[d] = r
  }
  const out: RowCache = { raw, abs, start, end, grid, states, views }
  ROWS.set(key, out)
  return out
}

/** The merged view of one raw war — cached on the war object and the index
 *  version, so a view-only render pays nothing. */
export function mergeWar(war: LeaveWar): MergedWar {
  const hit = WARS.get(war)
  if (hit && hit.ver === ABS_VER) return hit.merged
  const recs: Recs = war.recs
  const people = new Set<string>(Object.keys(recs))
  for (const [pid, rows] of ABS) {
    for (const d of rows.keys()) if (d >= war.period.start && d <= war.period.end) { people.add(pid); break }
  }
  const grid: Grid = {}, states: States = {}, views: Views = {}
  for (const pid of people) {
    const row = mergeRow(war, pid, recs[pid], ABS.get(pid))
    if (Object.keys(row.grid).length) grid[pid] = row.grid
    if (Object.keys(row.states).length) states[pid] = row.states
    if (Object.keys(row.views).length) views[pid] = row.views
  }
  const merged: MergedWar = { ...war, grid, states, views }
  WARS.set(war, { ver: ABS_VER, merged })
  return merged
}
