// THE ABSENCE LAYER'S READ OF THE INPUTS PAGE ([ARCH-STACK] step 4, phase 1).
//
// An absence is ONE record — the Raptor Input. The Leave War never stores a
// copy of it; it DERIVES what each person/date shows from the Inputs, here,
// on read (design §1, §3). This module is the one statement of "which Inputs
// show on the war, on which dates, over which part of the day":
//   - war-visible types = leave ∪ medical ∪ course (CSE) ∪ overseas duty (OD)
//     (clash check B2, owner Q8);
//   - each covered date gets the Input's daily window in minutes; an overnight
//     window also leaves a SPILL tail on the next date, which counts for
//     clashes there but is shown and charged on its own date (H6);
//   - a medical Input reads by the owner's six-hour half rule (the war and the
//     balances only know halves — clash check H2); leave, course and OD keep
//     their real times (owner, 20 Sep 26: two leaves in one morning at times
//     that do not overlap are allowed).
// Everything that decides what the combination MEANS is `engine/dayview.ts`.

import { dateOrd, inpWin, isDownchit, isLeave } from '../engine/inputs'
import { addDays } from './engine'
import { AM, PM, FULL, type Contrib, type Win } from './engine/dayview'
import type { Portion } from './engine'

/* 'Feb 11' -> '2026-02-11', through dateOrd so the two directions cannot
   disagree about what a label means. Null for anything unreadable. `yr` is
   the ROW'S anchor year (engine/inputs.ts, 24 Aug 26) — a bare label on an
   input belongs to the year the row was created under, not to whatever week
   Raptor happens to have loaded when the sync runs. */
export function labelToISO(lbl: unknown, yr?: unknown): string | null {
  const ord = dateOrd(lbl, yr)
  if (ord == null) return null
  const p = (n: number) => String(n).padStart(2, '0')
  return `${Math.floor(ord / 10000)}-${p(Math.floor(ord / 100) % 100)}-${p(ord % 100)}`
}

/* Which portion of the day an input row covers. allday and the two half
   presets are exact; a CUSTOM window rounds OUT to the halves it touches
   (a 10:00–14:00 leave covers both, so it reads as the full day) — rounding
   out never under-reports an absence, and the schedule keeps the exact
   window. The half minutes are HALF_AM/HALF_PM's own: [0,720] / [721,1439].
   A thin row with neither flag nor times fails closed to the whole day,
   the same call inpWin itself makes. */
export function rowPortion(row: any): Portion {
  if (row.allday) return 'full'
  if (row.half === 'am') return 'am'
  if (row.half === 'pm') return 'pm'
  if (row.s != null && row.e != null) {
    const w = inpWin(row)
    if (w) {
      if (w[1] <= 720) return 'am'
      if (w[0] >= 721) return 'pm'
    }
  }
  return 'full'
}

/* A MEDICAL row's portion runs on the owner's own rule instead (17 Aug 26):
   AM/PM are the halves, and a CUSTOM window — "which they should not" file,
   but the form allows — counts as a half day at six hours or less ("6 hours
   or less as half day"; exactly six is a half) and a full day past that.
   Which half: the side of noon the window sits on, its midpoint deciding a
   straddler. Leave keeps its round-OUT rule above untouched — the owner
   stated this one for the medical types. */
export function medRowPortion(row: any): Portion {
  if (row.allday) return 'full'
  if (row.half === 'am') return 'am'
  if (row.half === 'pm') return 'pm'
  if (row.s != null && row.e != null) {
    const w = inpWin(row)
    if (w && w[1] - w[0] <= 360) {
      if (w[1] <= 720) return 'am'
      if (w[0] >= 721) return 'pm'
      return (w[0] + w[1]) / 2 <= 720 ? 'am' : 'pm'
    }
  }
  return 'full'
}

/* Raptor spells two medical types with a space; the war stores them
   spaceless so `parseCell` round-trips. Everything else maps through. */
const LW_FOR_INPUT: Record<string, string> = { 'ATT B': 'ATTB', 'ATT C': 'ATTC' }
export function warCodeOf(rawType: unknown): string {
  const t = String(rawType).trim().toUpperCase()
  return LW_FOR_INPUT[t] ?? t
}

/** Does this Input type show on the war? Leave, medical, course, overseas
 *  duty (clash check B2). Upchit, SANS, appointments, meetings, training,
 *  local Duty and "Fly with" never do (catalogue rule 6, owner Q15). */
export function warVisible(type: unknown): boolean {
  if (isLeave(type) || isDownchit(type)) return true
  const t = String(type ?? '').trim().toUpperCase()
  return t === 'CSE' || t === 'OD'
}

const halfWin = (p: Portion): Win => (p === 'am' ? AM : p === 'pm' ? PM : FULL)

/** The part of EACH covered date an Input takes, plus the overnight tail it
 *  leaves on the following date (null when it ends by midnight). */
export function inputWindow(row: any): { win: Win; tail: Win | null } {
  if (isDownchit(row.type)) return { win: halfWin(medRowPortion(row)), tail: null }
  if (row.allday) return { win: FULL, tail: null }
  if (row.half === 'am') return { win: AM, tail: null }
  if (row.half === 'pm') return { win: PM, tail: null }
  const w = inpWin(row)
  if (!w || row.s == null || row.e == null) return { win: FULL, tail: null }
  if (w[1] <= 1439) return { win: [w[0], w[1]], tail: null }
  return { win: [w[0], 1439], tail: [0, w[1] - 1440] }
}

/** The ISO dates an Input covers, start to end (a capped walk, so a malformed
 *  span cannot spin a read; 400 covers any real year-crossing leave). */
export function inputDates(row: any): string[] {
  const start = labelToISO(row.date, row.yr)
  if (!start) return []
  let end = row.endDate ? labelToISO(row.endDate, row.yr) ?? start : start
  if (end < start) end = start
  const out: string[] = []
  for (let d = start, n = 0; d <= end && n < 400; d = addDays(d, 1), n++) out.push(d)
  return out
}

/** personId → date → the absences on it (spill tails included). */
export type AbsenceIndex = Map<string, Map<string, Contrib[]>>

/** One Input's contributions, date by date. */
export function contribsOfInput(row: any): Array<[string, Contrib]> {
  if (!row || typeof row !== 'object' || !warVisible(row.type) || !row.person || !row.iid) return []
  const { win, tail } = inputWindow(row)
  const code = warCodeOf(row.type)
  const moved: Record<string, string> = row.lwMoved && typeof row.lwMoved === 'object' ? row.lwMoved : {}
  const out: Array<[string, Contrib]> = []
  for (const d of inputDates(row)) {
    const c: Contrib = { id: String(row.iid), kind: 'absence', code, win }
    if (row.lw) c.lw = true
    if (moved[d]) c.movedFrom = moved[d]
    out.push([d, c])
    if (tail) out.push([addDays(d, 1), { id: String(row.iid), kind: 'absence', code, win: tail, spill: true }])
  }
  return out
}

/** Build the whole index from a list of Inputs (boot, a reset, `loadWars`). */
export function buildAbsenceIndex(rows: readonly any[]): AbsenceIndex {
  const ix: AbsenceIndex = new Map()
  for (const row of rows) addInput(ix, row)
  return ix
}

export function addInput(ix: AbsenceIndex, row: any): void {
  const person = row && String(row.person)
  for (const [d, c] of contribsOfInput(row)) {
    let byDate = ix.get(person)
    if (!byDate) { byDate = new Map(); ix.set(person, byDate) }
    const list = byDate.get(d)
    if (list) list.push(c)
    else byDate.set(d, [c])
  }
}

/** What makes a leave the SAME leave: who, what type, which days, which part
 *  of the day — everything but its remarks, documents and bookkeeping. A
 *  remarks-only edit keeps it; the Inputs editor uses it to tell the two
 *  apart (design §5.4). */
export function leaveKey(row: any): string {
  return [row.person, warCodeOf(row.type), labelToISO(row.date, row.yr), row.endDate ? labelToISO(row.endDate, row.yr) : '',
    row.allday ? 1 : 0, row.half ?? '', row.allday ? '' : row.s ?? '', row.allday ? '' : row.e ?? ''].join('|')
}

/** Only the Input fields `contribsOfInput` reads — the per-person signature
 *  the index rebuilds on (design §4.1, FB2-08: remarks, docs, acc, mod … are
 *  deliberately out, so a remarks edit never rebuilds anything). */
export function absenceSignature(row: any): string {
  if (!row || !warVisible(row.type)) return ''
  return [row.iid, row.type, row.date, row.endDate ?? '', row.yr ?? '', row.allday ? 1 : 0,
    row.half ?? '', row.s ?? '', row.e ?? '', row.lw ? 1 : 0, JSON.stringify(row.lwMoved ?? null)].join('|')
}

/* ---- the other direction: a war leave → the one Input ------------------- */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const INPUT_FOR_WAR: Record<string, string> = { ATTB: 'ATT B', ATTC: 'ATT C' }

/** '2026-07-15' → the Input's label + its anchor year ('Jul 15', 2026). The
 *  year rides `yr`, so the label never needs a suffix and never re-anchors
 *  when another week is loaded (engine/inputs.ts, 24 Aug 26). */
export function isoToInputDate(iso: string): { date: string; yr: number } {
  return { date: `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`, yr: +iso.slice(0, 4) }
}
/** An end date on the SAME anchor year as the start: a span crossing 31 Dec
 *  carries the year suffix dateOrd reads. */
function endLabel(startIso: string, endIso: string): string {
  const { date, yr } = isoToInputDate(endIso)
  return yr === +startIso.slice(0, 4) ? date : `${date} ${yr}`
}

export interface WarLeave {
  person: string
  /** war notation, portion marks included: LL, *LL, OL*, ATTC … */
  code: string
  from: string
  to: string
  /** the war it was approved in (provenance, design §5.4); none = filed on
   *  the Inputs page */
  lw?: string
  remarks?: string
  lwMoved?: Record<string, string>
  mod?: string
}

/** The Input row a war leave is — the ONE absence record. `iid` is left for
 *  the inputs door to mint. */
export function inputRowFor(w: WarLeave): any {
  const lead = w.code.startsWith('*'), trail = w.code.endsWith('*')
  const bare = w.code.replace(/\*/g, '')
  const { date, yr } = isoToInputDate(w.from)
  const row: any = { person: w.person, date, yr, type: INPUT_FOR_WAR[bare] ?? bare, remarks: w.remarks ?? '' }
  if (w.to > w.from) row.endDate = endLabel(w.from, w.to)
  if (lead) { row.allday = false; row.half = 'am'; row.s = 0; row.e = 720 }
  else if (trail) { row.allday = false; row.half = 'pm'; row.s = 721; row.e = 1439 }
  else row.allday = true
  if (w.lw) row.lw = w.lw
  if (w.lwMoved && Object.keys(w.lwMoved).length) row.lwMoved = { ...w.lwMoved }
  if (w.mod) row.mod = w.mod
  return row
}
