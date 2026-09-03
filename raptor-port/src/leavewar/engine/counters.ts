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
// derived, not posted: an FO/HO cell on the grid is the record that the
// duty stood, and each one's `earnsOil` (codes.ts) is summed straight into
// the OIL balance below. A ledger entry for the same fact would be the
// second record this header warns against. The standalone spec's
// knock-off-time sketch (later than 14:30 credits 1.0) is superseded by the
// owner's scheduled-hours rule, which lives on the Raptor side
// (`engine/oil.ts`, VCONF.oilFullMin) — this module only ever sees the
// FO or HO verdict, wherever the cell came from: the sync wire at publish,
// a hand-typed cell, or the seed.

import { cellAmount, cellCharges, chargedDays, type CountCtx, type LeaveSource } from './charge'
import { codeOf, LEAVE_TYPES, parseCell, type CounterName } from './codes'
import { DEFAULT_OIL_POLICY, oilLedgerFor, type OilPolicy } from './oiltracker'
import { localToday } from './period'

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
  cl: 'CL',
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
  /** Who recorded it — the admin's callsign. */
  approvedBy: string
  /** Who GAVE it, when that is someone else (owner, 2 Sep 26 — "who the
   *  OIL is given by, that's optional"): a name or a post, free text. */
  givenBy?: string
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

// `LeaveSource` and `CountCtx` moved to charge.ts on 3 Sep 26 (the
// weekend/PH charging rule lives there, and oiltracker.ts needs it as a VALUE
// while importing this module as types only). Re-exported so every existing
// import path still reads.
export type { LeaveSource, CountCtx } from './charge'

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
 * Which cells count is decided by `chargedDays` (charge.ts): first the SAME
 * `removesAvailability` the manning rows use (a refused bid draws nothing, a
 * pending one draws in full, a half day draws 0.5), then the owner's
 * weekend/PH rule (3 Sep 26) — a Saturday or holiday of leave draws nothing
 * unless a pilot is 15 days deep in one run of it.
 */
export function drawnFrom(sources: LeaveSource[], personId: string, counter: CounterName, ctx?: CountCtx): number {
  // Which cells count is decided by `chargedDays` (charge.ts): the SAME
  // `removesAvailability` gate the manning rows use, and then the owner's
  // weekend/PH rule — a Saturday of leave costs nothing unless a pilot is
  // 15 days deep in it. So a refused bid draws nothing, a pending one draws
  // in full, a half day draws 0.5, and a holiday draws nothing.
  let total = 0
  for (const t of chargedDays(sources, personId, ctx).values()) {
    if (t.counter === counter) total += t.amount
  }
  return total
}

/**
 * OIL earned by work stood on a non-working day, **across every leave war**
 * — the credit side of the FO/HO cells the sync wire (or a hand) writes.
 * A list of sources for the same reason `drawnFrom` takes one: OIL earned
 * standing a December weekend still belongs to the man in January. No state
 * gate — FO/HO are not bid (`bid: false`), so there is no refused state to
 * exclude; the cell existing is the work having stood.
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
  ctx?: CountCtx,
): number {
  const opening = openings[personId]?.[counter] ?? 0
  // Earned OIL joins the OIL balance only — no other counter is earned by
  // working, and adding a zero term for them would just be noise here.
  const earned = counter === 'oil' ? earnedOil(sources, personId) : 0
  return opening + grantedTo(ledger, personId, counter) + earned - drawnFrom(sources, personId, counter, ctx)
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
 * nothing and a half day counts 0.5. A counter-bearing type also obeys the
 * weekend/PH rule (charge.ts, 3 Sep 26) — "the leave is not taken" on a
 * holiday — so the USED figure and the balance it draws move together.
 * Counts the medical markers too, which spend no counter but are still days
 * taken, every day of the week.
 */
export function takenOf(sources: LeaveSource[], personId: string, type: string, ctx?: CountCtx): number {
  const charged = chargedDays(sources, personId, ctx)
  let total = 0
  for (const { grid, states } of sources) {
    for (const [date, code] of Object.entries(grid[personId] ?? {})) {
      if (typeOf(code) !== type) continue
      if (!cellCharges(charged, code, date, states, personId)) continue
      total += cellAmount(code)
    }
  }
  return total
}

/** The leave/medical TYPE a stored cell names, or '' for anything else. */
function typeOf(code: string): string {
  const cell = parseCell(code)
  return cell ? cell.type : ''
}

// The three medical markers that make up MED USED, and the seven leave codes
// that make up LVE USED (CL joined 3 Sep 26 — it is leave taken, from its own pool) (OFF left the list on 2 Sep 26 — it is a management
// Off day event now, never a person's leave). Kept as literals here (not derived) because these two
// aggregates are the owner's exact groupings — LVE USED deliberately excludes
// OML/medical, and MED USED deliberately excludes everything else.
const MED_CON_TYPES = ['ATTC', 'HL', 'OML'] as const
const LVE_CON_TYPES = ['LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'CL'] as const

/** Medical days consumed = ATT C + HL + OML taken. */
export function medConOf(sources: LeaveSource[], personId: string, ctx?: CountCtx): number {
  return MED_CON_TYPES.reduce((sum, t) => sum + takenOf(sources, personId, t, ctx), 0)
}

/** Total leave days consumed = LL + OL + OIL + CCL + PL + FCL + CL taken
 *  (medical is its own MED USED tally, so it is not in here). */
export function lveConOf(sources: LeaveSource[], personId: string, ctx?: CountCtx): number {
  return LVE_CON_TYPES.reduce((sum, t) => sum + takenOf(sources, personId, t, ctx), 0)
}

/** Everything a figure needs to read a person's number. `LeaveWar`-shaped
 *  callers already hold all three. */
export interface FigureCtx extends CountCtx {
  openings: Openings
  ledger: Ledger
  sources: LeaveSource[]
  /** The admin's OIL expiry/history policy (oiltracker.ts). Absent reads as
   *  the default — no expiry — so a caller that built the ctx before the
   *  tracker existed sees exactly the sum it always saw. */
  oilPolicy?: OilPolicy
  /** "Today" for expiry, `yyyy-mm-dd`; absent reads the local clock. Tests
   *  pin it so an OIL balance does not drift with the calendar. */
  asOf?: string
}

/** The OIL ledger this ctx describes for one person — FIFO-allocated and
 *  expiry-applied. The OIL BAL figure and its breakdown both read from here,
 *  so the column and the tracker sheet cannot disagree. */
export function oilLedgerOf(ctx: FigureCtx, personId: string) {
  return oilLedgerFor(ctx, personId, ctx.oilPolicy ?? DEFAULT_OIL_POLICY, ctx.asOf ?? localToday())
}

export interface Figure {
  /** Stable id — the persisted display order is a list of these, so renaming
   *  one silently drops it from a saved order. Don't. */
  id: string
  label: string
  kind: 'bal' | 'con'
  /** For a balance: the counter it reads. What lets the Cinch sheet offer an
   *  admin a Set button on every plain-sum balance (LVE BAL, CL BAL) and
   *  hand OIL BAL to the tracker instead — by fact, not by figure id. */
  counter?: CounterName
  /** Plain-words caption for the picker/legend when there is no composition. */
  desc: string
  /** For an aggregate: what it is made of, shown as the legend "bubble". */
  legend?: string
  value: (ctx: FigureCtx, personId: string) => number
  /** The per-person breakdown, where a figure has one — the rows the tap-a-
   *  counter sheet shows. SIGNED so the parts always sum to `value`: a
   *  balance's "taken" row is negative, which is also how it reads. */
  parts?: (ctx: FigureCtx, personId: string) => FigurePart[]
}

/** One labelled component of a figure's number. */
export interface FigurePart {
  label: string
  value: number
}

// The breakdown builders. One per shape rather than one per figure, so the
// aggregates cannot drift from the type lists they sum (`MED_CON_TYPES` /
// `LVE_CON_TYPES` feed both the value and its parts).
const PART_LABEL: Record<string, string> = { ATTC: 'ATT C', ATTB: 'ATT B' }
const typeParts = (types: readonly string[]) => (c: FigureCtx, p: string): FigurePart[] =>
  types.map(t => ({ label: PART_LABEL[t] ?? t, value: takenOf(c.sources, p, t, c) }))
const balParts = (counter: CounterName, earns: boolean) => (c: FigureCtx, p: string): FigurePart[] => {
  const parts: FigurePart[] = [
    { label: 'opening figure', value: c.openings[p]?.[counter] ?? 0 },
    { label: 'granted', value: grantedTo(c.ledger, p, counter) },
  ]
  if (earns) parts.push({ label: 'earned by weekend/PH work', value: earnedOil(c.sources, p) })
  // `0 - x`, not `-x`: a person whose every leave day is excused draws 0,
  // and `-0` would print as a minus sign on some paths.
  parts.push({ label: 'taken', value: 0 - drawnFrom(c.sources, p, counter, c) })
  // OIL alone can EXPIRE (the tracker's policy, 2 Sep 26). The row appears
  // only when something did, so a squadron with no expiry sees the same four
  // rows it always saw — and when it does appear the rows still sum to the
  // figure, which is the whole contract of a breakdown.
  if (counter === 'oil') {
    const expired = oilLedgerOf(c, p).expired
    if (expired) parts.push({ label: 'expired', value: -expired })
  }
  return parts
}

/**
 * The rows the tap-a-person's-counter sheet shows: the figure's own parts
 * where it has them (the owner's ask was MED USED — "when I click on the
 * individual personnel counter, I should be able to see the breakdown"), or
 * the figure restated as its one line where it is already a single number.
 * The parts are signed and always sum to the figure's value, pinned by test —
 * a breakdown that did not add up would be worse than none.
 */
export function figureParts(f: Figure, ctx: FigureCtx, personId: string): FigurePart[] {
  if (f.parts) return f.parts(ctx, personId)
  return [{ label: f.kind === 'bal' ? 'balance' : 'days taken', value: f.value(ctx, personId) }]
}

/**
 * The counter column's figures, in their default order (owner, Aug 26).
 * Frozen for the same reason `COUNTERS` is — an exported array is mutable by
 * whoever imports it. The DISPLAY order is a separate persisted list; this is
 * the fixed definition set `orderedFigures` arranges.
 */
export const FIGURES: readonly Figure[] = Object.freeze([
  { id: 'll',  label: 'LL USED',  kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'LL', c) },
  { id: 'ol',  label: 'OL USED',  kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'OL', c) },
  { id: 'oil', label: 'OIL USED', kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'OIL', c) },
  // Wire 4's landing strip: without a balance figure the earned credit would
  // move nothing anyone can see in the frozen column. A saved figure order
  // from before this id existed shows it appended at the end (orderedFigures'
  // tail rule) rather than losing it.
  // Since 2 Sep 26 the value is the TRACKER's balance (oiltracker.ts): the
  // same opening + granted + earned − taken, less whatever the admin's expiry
  // policy has retired. With no policy the two are the same number.
  { id: 'oilbal', label: 'OIL BAL', kind: 'bal', desc: 'balance available to take', legend: 'earned by weekend/PH work + granted − taken − expired', counter: 'oil', value: (c, p) => oilLedgerOf(c, p).balance, parts: balParts('oil', true) },
  // `OFF USED` sat here until 2 Sep 26 (owner: "remove the OFF used
  // counter"), and OFF itself stopped being a leave code the same day. A
  // saved figure order naming 'off' skips it (orderedFigures).
  { id: 'ccl', label: 'CCL USED', kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'CCL', c) },
  { id: 'pl',  label: 'PL USED',  kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'PL', c) },
  { id: 'fcl', label: 'FCL USED', kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'FCL', c) },
  // Compassionate leave (owner, 3 Sep 26 — "2 counters to show the balance
  // and used, called CL BAL & CL USED"). Its own pool, so unlike LL/OL it
  // gets a balance of its own beside the days taken; the admin sets it the
  // way LVE BAL is set. A saved figure order from before these ids existed
  // shows them appended at the end (orderedFigures' tail rule).
  { id: 'clbal', label: 'CL BAL', kind: 'bal', desc: 'balance available to take', counter: 'cl', value: (c, p) => balanceOf(c.openings, c.ledger, c.sources, p, 'cl', c), parts: balParts('cl', false) },
  { id: 'cl',  label: 'CL USED',  kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'CL', c) },
  { id: 'med', label: 'MED USED', kind: 'con', desc: 'days taken', legend: 'ATT C + HL + OML', value: (c, p) => medConOf(c.sources, p, c), parts: typeParts(MED_CON_TYPES) },
  { id: 'oml', label: 'OML USED', kind: 'con', desc: 'days taken', value: (c, p) => takenOf(c.sources, p, 'OML', c) },
  { id: 'lvebal', label: 'LVE BAL', kind: 'bal', desc: 'balance available to take', counter: 'annual', value: (c, p) => balanceOf(c.openings, c.ledger, c.sources, p, 'annual', c), parts: balParts('annual', false) },
  { id: 'lvecon', label: 'LVE USED', kind: 'con', desc: 'days taken', legend: 'LL + OL + OIL + CCL + PL + FCL + CL', value: (c, p) => lveConOf(c.sources, p, c), parts: typeParts(LVE_CON_TYPES) },
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
