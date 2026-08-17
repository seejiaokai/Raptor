// Balances: what each person has left of each entitlement.
//
// A balance is DERIVED, never stored. It is the opening figure, plus what
// the ledger has granted, less what the grid has drawn. The grid is already
// the record of what leave was taken, so posting a second copy of that into
// the ledger would give two records of one fact — and two records of one
// fact disagree. The ledger holds only what the grid cannot know: top-ups,
// awards and corrections.
//
// The spec's §Counters says every change to a counter is a ledger entry.
// This narrows that to every change the grid does not already hold, for the
// reason above; the audit trail it exists for is intact, because "why is my
// annual 22" is answered by an opening figure, a list of grants, and the
// leave visible on the person's own row.
//
// OIL EARNED by working IS here now (sync wire 4, 17 Aug 26) — and it is
// derived, not posted: an FS/HS cell on the grid is the record that the
// duty stood, and each one's `earnsOil` (codes.ts) is summed straight into
// the OIL balance below. A ledger entry for the same fact would be the
// second record this header warns against. The standalone spec's
// knock-off-time sketch (later than 14:30 credits 1.0) is superseded by the
// owner's scheduled-hours rule, which lives on the Raptor side
// (`engine/oil.ts`, VCONF.oilFullMin) — this module only ever sees the
// FS or HS verdict, wherever the cell came from: the sync wire at publish,
// a hand-typed cell, or the seed.

import type { Grid } from './availability'
import { removesAvailability, stateOf, type States } from './bids'
import { codeOf, LEAVE_TYPES, parseCell, portionAmount, type CounterName } from './codes'

/**
 * The counters, in the order the interface cycles them.
 *
 * One fewer than there are leave types: `LL` and `OL` both spend the annual
 * pool, so a list of leave types would show the same figure twice under two
 * names. Derived from the catalogue rather than written out again, so a leave
 * type added or removed changes this list without anyone remembering the
 * file — removing `FCL` on 10 Aug 26 took its counter with it and needed no
 * edit here. Frozen for the same reason `STAGE_ORDER` is: an exported array
 * is mutable by whoever imports it.
 */
export const COUNTERS: readonly CounterName[] = Object.freeze(
  // `OFF` carries no counter — it is leave that spends no entitlement — so
  // the nulls are dropped rather than becoming a column of nothing.
  [...new Set(LEAVE_TYPES.map(t => t.counter).filter((c): c is CounterName => c !== null))],
)

const LABEL: Record<CounterName, string> = {
  annual: 'ANNUAL',
  oil: 'OIL',
  ccl: 'CCL',
  fcl: 'FCL',
  pl: 'PL',
  el: 'EL',
}

export function counterLabel(counter: CounterName): string {
  return LABEL[counter]
}

/** One movement on a counter that the grid cannot account for: a top-up, an
 *  award, or a correction. A correction is simply a negative amount rather
 *  than a second kind of thing. */
export interface LedgerEntry {
  id: string
  personId: string
  counter: CounterName
  amount: number
  date: string
  reason: string
  approvedBy: string
}

export type Ledger = LedgerEntry[]

/** `personId -> counter -> opening figure`. Sparse: an absent counter opens
 *  at nothing rather than being an error. */
export type Openings = Record<string, Partial<Record<CounterName, number>>>

export function grantedTo(ledger: Ledger, personId: string, counter: CounterName): number {
  let total = 0
  for (const e of ledger) {
    if (e.personId === personId && e.counter === counter) total += e.amount
  }
  return total
}

/** Just enough of a leave war to draw a counter from. `LeaveWar` satisfies
 *  it structurally, so callers pass their wars straight in. */
export interface LeaveSource {
  grid: Grid
  states: States
}

/**
 * How much of one counter this person's leave has spent, **across every
 * leave war**.
 *
 * Taking a list rather than one war is the whole point: entitlements are
 * continuous and leave wars are windows onto them. Annual leave does not
 * reset when a quarter closes, so leave bid in Jan–Mar still spends it while
 * someone is looking at Apr–Jun. A figure counting only the war on screen
 * would let the same twenty days be bid twice over, once in each.
 *
 * Which cells count is decided by `removesAvailability` — the SAME function
 * the manning rows use, not a second copy of the rule. So a refused bid
 * draws nothing, a pending one draws in full, and a half day draws 0.5,
 * exactly as the counts on screen already behave.
 */
export function drawnFrom(
  sources: LeaveSource[],
  personId: string,
  counter: CounterName,
): number {
  let total = 0
  for (const { grid, states } of sources) {
    for (const [date, code] of Object.entries(grid[personId] ?? {})) {
      const spends = codeOf(code)?.spends
      if (!spends || spends.counter !== counter) continue
      if (!removesAvailability(code, stateOf(states, personId, date))) continue
      total += spends.amount
    }
  }
  return total
}

/**
 * OIL earned by duty stood on a non-working day, **across every leave war**
 * — the credit side of the FS/HS cells the sync wire (or a hand) writes.
 * A list of sources for the same reason `drawnFrom` takes one: OIL earned
 * standing a December weekend still belongs to the man in January. No state
 * gate — FS/HS are not bid (`bid: false`), so there is no refused state to
 * exclude; the cell existing is the duty having stood.
 */
export function earnedOil(sources: LeaveSource[], personId: string): number {
  let total = 0
  for (const { grid } of sources) {
    for (const code of Object.values(grid[personId] ?? {})) {
      total += codeOf(code)?.earnsOil ?? 0
    }
  }
  return total
}

/**
 * What this person has left of this counter.
 *
 * Never clamped: balances already go negative in the squadron's own sheet —
 * annual at −14, OIL at −5.5 — and §Counters is explicit that negative shows
 * red and is never refused. Clamping here would hide the very thing the
 * figure exists to show.
 */
export function balanceOf(
  openings: Openings,
  ledger: Ledger,
  sources: LeaveSource[],
  personId: string,
  counter: CounterName,
): number {
  const opening = openings[personId]?.[counter] ?? 0
  // Earned OIL joins the OIL balance only — no other counter is earned by
  // working, and adding a zero term for them would just be noise here.
  const earned = counter === 'oil' ? earnedOil(sources, personId) : 0
  return opening + grantedTo(ledger, personId, counter) + earned - drawnFrom(sources, personId, counter)
}

// ── The counter column's figures ────────────────────────────────────────────
//
// The column shows one figure at a time (picked in `CounterSheet`), and the
// owner's set (Aug 26) is neither the raw counters nor a 1:1 map onto them:
// most rows are DAYS CONSUMED of a single code, two are consumed AGGREGATES
// (medical, and total leave), and only one is a balance. So the column reads
// from this `FIGURES` catalogue rather than from `COUNTERS` — which stays as
// the counter-name vocabulary the balance/bid math still uses.
//
// Suffix convention, owner's own: `USED` = days taken, `BAL` = balance left.

/**
 * Days of ONE code TYPE this person has taken, across every war — the
 * per-type twin of `drawnFrom` (which keys on the COUNTER, so it cannot tell
 * LL from OL, both of which spend `annual`). Portion-aware and gated by the
 * SAME `removesAvailability` the manning rows use, so a refused bid counts
 * nothing and a half day counts 0.5. Counts free/marker codes too (OFF, and
 * the medical markers), which spend no counter but are still days taken.
 */
export function takenOf(sources: LeaveSource[], personId: string, type: string): number {
  let total = 0
  for (const { grid, states } of sources) {
    for (const [date, code] of Object.entries(grid[personId] ?? {})) {
      const cell = parseCell(code)
      if (!cell || cell.type !== type) continue
      if (!removesAvailability(code, stateOf(states, personId, date))) continue
      total += portionAmount(cell.portion)
    }
  }
  return total
}

// The three medical markers that make up MED USED, and the seven leave codes
// that make up LVE USED. Kept as literals here (not derived) because these two
// aggregates are the owner's exact groupings — LVE USED deliberately excludes
// OML/medical, and MED USED deliberately excludes everything else.
const MED_CON_TYPES = ['ATTC', 'HL', 'OML'] as const
const LVE_CON_TYPES = ['LL', 'OL', 'OIL', 'OFF', 'CCL', 'PL', 'FCL'] as const

/** Medical days consumed = ATT C + HL + OML taken. */
export function medConOf(sources: LeaveSource[], personId: string): number {
  return MED_CON_TYPES.reduce((sum, t) => sum + takenOf(sources, personId, t), 0)
}

/** Total leave days consumed = LL + OL + OIL + OFF + CCL + PL + FCL taken
 *  (medical is its own MED USED tally, so it is not in here). */
export function lveConOf(sources: LeaveSource[], personId: string): number {
  return LVE_CON_TYPES.reduce((sum, t) => sum + takenOf(sources, personId, t), 0)
}

/** Everything a figure needs to read a person's number. `LeaveWar`-shaped
 *  callers already hold all three. */
export interface FigureCtx {
  openings: Openings
  ledger: Ledger
  sources: LeaveSource[]
}

export interface Figure {
  /** Stable id — the persisted display order is a list of these, so renaming
   *  one silently drops it from a saved order. Don't. */
  id: string
  label: string
  kind: 'bal' | 'con'
  /** Plain-words caption for the picker/legend when there is no composition. */
  desc: string
  /** For an aggregate: what it is made of, shown as the legend "bubble". */
  legend?: string
  value: (ctx: FigureCtx, personId: string) => number
}

/**
 * The counter column's figures, in their default order (owner, Aug 26).
 * Frozen for the same reason `COUNTERS` is — an exported array is mutable by
 * whoever imports it. The DISPLAY order is a separate persisted list; this is
 * the fixed definition set `orderedFigures` arranges.
 */
export const FIGURES: readonly Figure[] = Object.freeze([
  { id: 'll',  label: 'LL USED',  kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'LL') },
  { id: 'ol',  label: 'OL USED',  kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'OL') },
  { id: 'oil', label: 'OIL USED', kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'OIL') },
  // Wire 4's landing strip: without a balance figure the earned credit would
  // move nothing anyone can see in the frozen column. A saved figure order
  // from before this id existed shows it appended at the end (orderedFigures'
  // tail rule) rather than losing it.
  { id: 'oilbal', label: 'OIL BAL', kind: 'bal', desc: 'balance available to take', legend: 'earned by weekend/PH duty + granted − taken', value: (c, p) => balanceOf(c.openings, c.ledger, c.sources, p, 'oil') },
  { id: 'off', label: 'OFF USED', kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'OFF') },
  { id: 'ccl', label: 'CCL USED', kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'CCL') },
  { id: 'pl',  label: 'PL USED',  kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'PL') },
  { id: 'fcl', label: 'FCL USED', kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'FCL') },
  { id: 'med', label: 'MED USED', kind: 'con', desc: 'days taken', legend: 'ATT C + HL + OML', value: (c, p) => medConOf(c.sources, p) },
  { id: 'oml', label: 'OML USED', kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'OML') },
  { id: 'lvebal', label: 'LVE BAL', kind: 'bal', desc: 'balance available to take', value: (c, p) => balanceOf(c.openings, c.ledger, c.sources, p, 'annual') },
  { id: 'lvecon', label: 'LVE USED', kind: 'con', desc: 'days taken', legend: 'LL + OL + OIL + OFF + CCL + PL + FCL', value: (c, p) => lveConOf(c.sources, p) },
])

/** The figure the column opens on: how much leave is left. */
export const DEFAULT_FIGURE_ID = 'lvebal'

const FIGURE_BY_ID: Record<string, Figure> = Object.fromEntries(FIGURES.map(f => [f.id, f]))

/** The catalogue order, as a list of ids — the persisted display order's default. */
export const DEFAULT_FIGURE_ORDER: readonly string[] = Object.freeze(FIGURES.map(f => f.id))

/**
 * The figures arranged by a saved id order. Tolerant on both sides so a stale
 * saved order never breaks the column: an unknown id (a figure since removed)
 * is skipped, and any catalogue figure the saved order does not mention (a
 * figure since added) is appended in catalogue order. Same forward-compat rule
 * the stores list uses.
 */
export function orderedFigures(order: readonly string[]): Figure[] {
  const seen = new Set<string>()
  const out: Figure[] = []
  for (const id of order) {
    const f = FIGURE_BY_ID[id]
    if (f && !seen.has(id)) { out.push(f); seen.add(id) }
  }
  for (const f of FIGURES) if (!seen.has(f.id)) out.push(f)
  return out
}
