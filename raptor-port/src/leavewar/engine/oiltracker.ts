// The OIL TRACKER — one person's OIL as a LEDGER rather than a sum (owner,
// 2 Sep 26: "a tracker sheet which shows when the OIL was credited and
// reason … it will automatically use the oldest OIL that was given … set how
// long OIL can last").
//
// Nothing here is a second record. Every line is DERIVED from what the store
// already holds, the same three facts `counters.ts:balanceOf` sums:
//
//   credits  — the opening figure (`openings[p].oil`), each OIL grant in the
//              ledger (`counter: 'oil'`, positive), and every FO/HO cell the
//              publish wire wrote (a full or half day earned by weekend/PH
//              work — `earnsOil` in codes.ts). The FO/HO cell IS the credit
//              record; the tracker reads it, it never mints a ledger entry
//              for it (counters.ts's two-records-of-one-fact rule stands).
//   debits   — every OIL day on the grid (`OIL`, `*OIL`, `OIL*`, gated by
//              the SAME `removesAvailability` the manning rows use, so a
//              refused bid draws nothing and a half day draws 0.5), a
//              negative ledger entry (a correction), and a negative opening.
//
// Then two rules the plain sum cannot express:
//
//   FIFO     — each debit, in date order, draws down the OLDEST credit that
//              still has something left and has not expired by that date.
//              What no credit covers is `unbacked`: an overdraw. Balances go
//              negative in the squadron's own sheet and are never refused
//              (counters.ts), so overdraw is shown, not blocked.
//   EXPIRY   — the admin's `OilPolicy` says how long a credit lasts (N days
//              or N months from its own date) or forever. Whatever is left of
//              a credit on the day it expires is gone — `expired` — and the
//              balance no longer counts it. The opening figure never expires:
//              it is a carried-in number with no date of its own.
//
// With NO expiry policy the balance here is IDENTICAL to `balanceOf(…,'oil')`
// (pinned by test): FIFO only decides WHICH credit a day drew from, not how
// much was drawn. So nothing on screen changed for existing data when this
// module arrived; only a squadron that sets an expiry sees a difference, and
// then the breakdown gains an `expired` row so its parts still sum.
//
// Pure: no store, no clock. `asOf` (today) and the policy are passed in.
// Imports values from bids/codes/period only, and counters as TYPES only —
// counters.ts imports THIS module for the OIL BAL figure, so a value import
// back would be a cycle.

import { removesAvailability, stateOf } from './bids'
import { codeOf, parseCell, portionAmount } from './codes'
import type { FigureCtx } from './counters'
import { addDays, addMonths, isWeekend } from './period'

export type OilExpiryUnit = 'days' | 'months'

export interface OilPolicy {
  /** How long a credit lasts from its own date; `null` = forever. */
  expiry: { n: number; unit: OilExpiryUnit } | null
  /** The history window the tracker opens on: this many months back from
   *  today, or `null` for "from the first entry" — the default since 2 Sep
   *  26 (owner: "by default show from the first entry"). */
  historyMonths: number | null
}

export const DEFAULT_OIL_POLICY: OilPolicy = Object.freeze({ expiry: null, historyMonths: null })

/** Sanity bounds for the policy numbers — ten years is already "forever". */
export const MAX_EXPIRY_DAYS = 3660
export const MAX_EXPIRY_MONTHS = 120
export const MAX_HISTORY_MONTHS = 120

const isISO = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)

/** Read an untrusted stored policy: `null` for anything but the shape above,
 *  so the caller falls back to the default rather than half-trusting junk. */
export function readOilPolicy(x: unknown): OilPolicy | null {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return null
  const { expiry, historyMonths } = x as Record<string, unknown>
  let exp: OilPolicy['expiry']
  if (expiry === null || expiry === undefined) exp = null
  else {
    if (!expiry || typeof expiry !== 'object') return null
    const { n, unit } = expiry as Record<string, unknown>
    if (unit !== 'days' && unit !== 'months') return null
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) return null
    if (n > (unit === 'days' ? MAX_EXPIRY_DAYS : MAX_EXPIRY_MONTHS)) return null
    exp = { n, unit }
  }
  let hist: number | null
  if (historyMonths === null || historyMonths === undefined) hist = null
  else if (typeof historyMonths === 'number' && Number.isInteger(historyMonths) && historyMonths >= 1 && historyMonths <= MAX_HISTORY_MONTHS) hist = historyMonths
  else return null
  return { expiry: exp, historyMonths: hist }
}

/** The first day a credit dated `date` can no longer be used, or `null` when
 *  it lasts forever (no policy, or an undated carried-in figure). A credit is
 *  usable on days STRICTLY BEFORE this: dated 1 Jan with "30 days" it serves
 *  through 30 Jan and is gone on 31 Jan. */
export function expiryOf(date: string, policy: OilPolicy): string | null {
  if (!policy.expiry || !isISO(date)) return null
  const { n, unit } = policy.expiry
  return unit === 'days' ? addDays(date, n) : addMonths(date, n)
}

export type OilSource = 'opening' | 'auto' | 'grant'

/** One thing that put OIL in: the carried-in figure, a day earned by
 *  weekend/PH work, or an admin's grant. */
export interface OilCredit {
  id: string
  /** `''` for the opening figure — it has no date and sorts first. */
  date: string
  amount: number
  reason: string
  source: OilSource
  /** Who recorded a grant (the admin's callsign). */
  approvedBy?: string
  /** Who GAVE a grant, when the admin named someone (owner, 2 Sep 26). */
  givenBy?: string
  /** An `auto` credit an admin typed by hand (no Raptor-owned record behind
   *  it), so its reason is theirs to write (`setCellNote`). */
  manual?: boolean
  /** First day it can no longer be used; `null` = never. */
  expires: string | null
  /** FIFO draws against it, oldest debit first. */
  used: { date: string; amount: number }[]
  /** What is still there as of `asOf`. */
  left: number
  /** What was left when it expired, if it did. */
  expired: number
  /** For a grant: the ledger entry behind it (the thing an admin edits). */
  ledgerId?: string
}

export type OilDebitSource = 'taken' | 'correction' | 'opening'

/** One thing that took OIL out: an OIL day on the grid, a negative ledger
 *  entry, or a negative carried-in figure. */
export interface OilDebit {
  id: string
  date: string
  amount: number
  reason: string
  source: OilDebitSource
  /** Which credits it drew from, in FIFO order. */
  from: { creditId: string; amount: number }[]
  /** What no credit covered — the overdraw. */
  unbacked: number
  ledgerId?: string
}

export interface OilLedger {
  /** Oldest first. */
  credits: OilCredit[]
  /** Oldest first. */
  debits: OilDebit[]
  /** Σ left − Σ unbacked, as of `asOf`. */
  balance: number
  earned: number
  granted: number
  taken: number
  expired: number
  overdrawn: number
  /** The earliest DATED entry, credit or debit — "from the first entry". */
  first: string | null
}

// Amounts are halves and wholes almost always, but a grant is "any number",
// so a long chain of subtractions is squared back to six places rather than
// carrying a 1e-17 that would render as "-0" or fail an equality.
const r6 = (x: number) => Math.round(x * 1e6) / 1e6 || 0

const CREDIT_RANK: Record<OilSource, number> = { opening: 0, auto: 1, grant: 2 }
const DEBIT_RANK: Record<OilDebitSource, number> = { opening: 0, taken: 1, correction: 2 }

/**
 * A person's whole OIL story: every credit and debit across every war, FIFO-
 * allocated, expiry applied as of `asOf`.
 */
export function oilLedgerFor(ctx: FigureCtx, personId: string, policy: OilPolicy, asOf: string): OilLedger {
  const credits: OilCredit[] = []
  const debits: OilDebit[] = []

  const opening = ctx.openings[personId]?.oil ?? 0
  if (opening > 0) {
    credits.push({ id: `open:${personId}`, date: '', amount: opening, reason: 'opening figure', source: 'opening', expires: null, used: [], left: opening, expired: 0 })
  } else if (opening < 0) {
    debits.push({ id: `open:${personId}`, date: '', amount: -opening, reason: 'opening figure', source: 'opening', from: [], unbacked: 0 })
  }

  for (const e of ctx.ledger) {
    if (e.personId !== personId || e.counter !== 'oil' || !e.amount) continue
    if (e.amount > 0) {
      credits.push({ id: e.id, ledgerId: e.id, date: e.date, amount: e.amount, reason: e.reason, source: 'grant', approvedBy: e.approvedBy, ...(e.givenBy ? { givenBy: e.givenBy } : {}), expires: expiryOf(e.date, policy), used: [], left: e.amount, expired: 0 })
    } else {
      debits.push({ id: e.id, ledgerId: e.id, date: e.date, amount: -e.amount, reason: e.reason, source: 'correction', from: [], unbacked: 0 })
    }
  }

  ctx.sources.forEach(({ grid, states }, wi) => {
    for (const [date, code] of Object.entries(grid[personId] ?? {})) {
      const earns = codeOf(code)?.earnsOil ?? 0
      if (earns > 0) {
        // The reason is the sync wire's note (`FLT`, `SIM + Duty`, an input's
        // type — owner, 2 Sep 26) or the admin's on a hand-typed cell; a cell
        // with no note falls back to the day's kind.
        const rec = states[personId]?.[date]
        const manual = rec?.source !== 'raptor'
        const reason = rec?.note ?? (isWeekend(date) ? 'weekend duty' : 'PH duty')
        credits.push({ id: `auto:${wi}:${date}`, date, amount: earns, reason, source: 'auto', ...(manual ? { manual } : {}), expires: expiryOf(date, policy), used: [], left: earns, expired: 0 })
        continue
      }
      const cell = parseCell(code)
      if (!cell || cell.type !== 'OIL') continue
      if (!removesAvailability(code, stateOf(states, personId, date))) continue
      const amount = portionAmount(cell.portion)
      debits.push({ id: `take:${wi}:${date}`, date, amount, reason: cell.portion === 'full' ? 'OIL taken' : `OIL taken (${cell.portion.toUpperCase()})`, source: 'taken', from: [], unbacked: 0 })
    }
  })

  credits.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : CREDIT_RANK[a.source] - CREDIT_RANK[b.source] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)))
  debits.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : DEBIT_RANK[a.source] - DEBIT_RANK[b.source] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)))

  // FIFO: each debit walks the credits oldest-first and takes what it can
  // from any that still has something left and is still alive on that day.
  for (const d of debits) {
    let need = d.amount
    for (const c of credits) {
      if (need <= 0) break
      if (c.left <= 0) continue
      if (c.expires !== null && d.date >= c.expires) continue
      const take = Math.min(c.left, need)
      c.left = r6(c.left - take)
      c.used.push({ date: d.date, amount: take })
      d.from.push({ creditId: c.id, amount: take })
      need = r6(need - take)
    }
    d.unbacked = need
  }

  // Expiry, as of today: whatever is left of a credit past its date is gone.
  for (const c of credits) {
    if (c.left > 0 && c.expires !== null && asOf >= c.expires) {
      c.expired = c.left
      c.left = 0
    }
  }

  let earned = 0, granted = 0, taken = 0, expired = 0, overdrawn = 0, left = 0
  for (const c of credits) {
    if (c.source === 'auto') earned += c.amount
    else if (c.source === 'grant') granted += c.amount
    expired += c.expired
    left += c.left
  }
  for (const d of debits) {
    if (d.source === 'taken') taken += d.amount
    else if (d.source === 'correction') granted -= d.amount
    overdrawn += d.unbacked
  }
  const dated = [...credits, ...debits].map(x => x.date).filter(Boolean).sort()
  return {
    credits, debits,
    balance: r6(left - overdrawn),
    earned: r6(earned), granted: r6(granted), taken: r6(taken), expired: r6(expired), overdrawn: r6(overdrawn),
    first: dated[0] ?? null,
  }
}

/** The OIL BAL figure: what is left as of `asOf` under the policy. */
export function oilBalanceOf(ctx: FigureCtx, personId: string, policy: OilPolicy, asOf: string): number {
  return oilLedgerFor(ctx, personId, policy, asOf).balance
}

/** Whether a dated entry falls inside a `[from, to]` window (either bound
 *  open when `null`). The undated opening figure is always inside — it is
 *  the carry-in, and a window that hid it would make the balance look wrong
 *  by exactly that much. */
export function inWindow(date: string, from: string | null, to: string | null): boolean {
  if (!date) return true
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

/** The window the tracker opens on: `historyMonths` back from `asOf`, or
 *  from the first entry (`null` from) when the policy says all. */
export function defaultWindowFrom(policy: OilPolicy, asOf: string): string | null {
  return policy.historyMonths === null ? null : addMonths(asOf, -policy.historyMonths)
}
