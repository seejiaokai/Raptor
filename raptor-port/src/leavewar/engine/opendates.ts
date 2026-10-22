// THE OPEN DATES — the days of a leave period open for bidding (owner, D1177, 21 Oct 26: "the stages go: members bid
// only on the open dates the admin sets in the 'Open for bidding' window; nothing is open until he opens it, and with
// nothing open the chip reads 'Bidding closed'"). They replace the four stages (draft / open / closed / published)
// and the one bidding window (bidFrom / bidTo) a period used to carry.
//
// A period holds a LIST of open stretches — each an inclusive `yyyy-mm-dd` range inside the period — kept in one
// normal form by `normaliseOpen`: sorted, never overlapping, never touching (two stretches with no closed day between
// them are one: "months next to each other join into one stretch on the list", D1168's reading). Every writer goes
// through that one function, so the grid's outline, the chip, the window's lines and the permission check all read
// the same list.
//
// EMPTY MEANS CLOSED (the red team's B2, 22 Oct 26). The old window read `null` as "the whole period is open" — the
// opposite of D1177. `isOpenOn` is the one rule that answers "is this day open", for the cell, the dim, the outline
// and the landing day alike.
//
// Pure: no store, no clock except `memberToday`, which is the one seam the tests pin.

import { addDays, localToday, type Period } from './period'

/** One open stretch, inclusive, inside its period. */
export interface OpenStretch {
  from: string
  to: string
}

/** What a tap on "Bidding closed" shows (D1177's reading: "the last open stretch and who closed it"): the days the
 *  admin's last closing took away, who did it (a person id, read as his live callsign) and when. */
export interface ClosedNote {
  from: string
  to: string
  by: string
  at: string
}

const ISO = /^\d{4}-\d{2}-\d{2}$/

/** The one normal form: clipped to the period, empty and backwards stretches dropped, sorted, and every pair that
 *  overlaps or touches joined. Never throws — a malformed entry is dropped. */
export function normaliseOpen(period: Pick<Period, 'start' | 'end'>, list: readonly OpenStretch[]): OpenStretch[] {
  const clipped: OpenStretch[] = []
  for (const s of list) {
    if (!s || typeof s.from !== 'string' || typeof s.to !== 'string' || !ISO.test(s.from) || !ISO.test(s.to)) continue
    const from = s.from < period.start ? period.start : s.from
    const to = s.to > period.end ? period.end : s.to
    if (to < from) continue
    clipped.push({ from, to })
  }
  clipped.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0))
  const out: OpenStretch[] = []
  for (const s of clipped) {
    const last = out[out.length - 1]
    // touching counts: no closed day between them
    if (last && s.from <= addDays(last.to, 1)) { if (s.to > last.to) last.to = s.to; continue }
    out.push({ ...s })
  }
  return out
}

/** Is this day open for bidding in this period? Empty means closed (B2). A day outside the period is never open. */
export function isOpenOn(period: Pick<Period, 'open'> | null | undefined, date: string): boolean {
  if (!period) return false
  for (const s of period.open) if (s.from <= date && date <= s.to) return true
  return false
}

/** The list with `from..to` opened too. */
export function withOpened(period: Pick<Period, 'start' | 'end' | 'open'>, from: string, to: string): OpenStretch[] {
  return normaliseOpen(period, [...period.open, { from, to }])
}

/** The list with `from..to` closed — a stretch it cuts through is split, one it covers goes. */
export function withClosed(period: Pick<Period, 'start' | 'end' | 'open'>, from: string, to: string): OpenStretch[] {
  const out: OpenStretch[] = []
  for (const s of period.open) {
    if (s.to < from || s.from > to) { out.push({ ...s }); continue }
    if (s.from < from) out.push({ from: s.from, to: addDays(from, -1) })
    if (s.to > to) out.push({ from: addDays(to, 1), to: s.to })
  }
  return normaliseOpen(period, out)
}

/** How many days a stretch holds, both ends counted. */
/** The runs of days open BEFORE and not AFTER, in date order — what a change of the open dates closed (M1's code read,
 *  L3 / F5: one first-to-last span named days that stayed open, or were never open). */
export function closedRuns(before: readonly OpenStretch[], after: readonly OpenStretch[]): OpenStretch[] {
  const runs: OpenStretch[] = []
  const stillOpen = (d: string) => after.some(s => s.from <= d && d <= s.to)
  for (const s of [...before].sort((a, b) => a.from.localeCompare(b.from))) {
    let run: OpenStretch | null = null
    for (let d = s.from; d <= s.to; d = addDays(d, 1)) {
      if (stillOpen(d)) { if (run) { runs.push(run); run = null } continue }
      run = run ? { from: run.from, to: d } : { from: d, to: d }
    }
    if (run) runs.push(run)
  }
  return runs
}

export function stretchDays(s: OpenStretch): number {
  let n = 0
  for (let d = s.from; d <= s.to; d = addDays(d, 1)) n++
  return n
}

/** The days of `from..to` that are open — what a closing actually takes away, for the closed note. Null when none. */
export function openPartOf(period: Pick<Period, 'open'>, from: string, to: string): OpenStretch | null {
  let lo: string | null = null, hi: string | null = null
  for (const s of period.open) {
    if (s.to < from || s.from > to) continue
    const a = s.from < from ? from : s.from, b = s.to > to ? to : s.to
    if (lo === null || a < lo) lo = a
    if (hi === null || b > hi) hi = b
  }
  return lo && hi ? { from: lo, to: hi } : null
}

/* ---- the period's months, as the "Open for bidding" window's buttons (D1168) ---------------------------------- */

/** One month button: its calendar month (`yyyy-mm`), and the part of it inside the period (a period need not start on
 *  the 1st). */
export interface PeriodMonth {
  key: string
  from: string
  to: string
}

/** The period's months in calendar order, each clipped to the period. */
export function periodMonths(period: Pick<Period, 'start' | 'end'>): PeriodMonth[] {
  const out: PeriodMonth[] = []
  if (!period.start || !period.end || period.end < period.start) return out
  let y = +period.start.slice(0, 4), m = +period.start.slice(5, 7)
  for (;;) {
    const key = `${y}-${String(m).padStart(2, '0')}`
    const first = `${key}-01`
    const last = addDays(m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`, -1)
    if (first > period.end) break
    out.push({ key, from: first < period.start ? period.start : first, to: last > period.end ? period.end : last })
    if (++m > 12) { m = 1; y++ }
  }
  return out
}

/** A month button's state: wholly open, part open (lit with a dotted edge, D1168's reading), or closed. */
export type MonthState = 'open' | 'part' | 'closed'

export function monthState(period: Pick<Period, 'open'>, month: PeriodMonth): MonthState {
  let n = 0, all = 0
  for (let d = month.from; d <= month.to; d = addDays(d, 1)) { all++; if (isOpenOn(period, d)) n++ }
  return n === 0 ? 'closed' : n === all ? 'open' : 'part'
}

/** A DRAG ACROSS THE MONTH BUTTONS (D1169) takes every month from the one it started on to the one under the finger,
 *  in CALENDAR order — never only the months the finger's path crossed (the red team's A7b: on a phone's two rows of
 *  six a finger going from MAY on the first row to SEP on the second never touches JUL or AUG). */
export function monthSpan(months: readonly PeriodMonth[], a: number, b: number): OpenStretch | null {
  if (!months.length) return null
  const lo = Math.max(0, Math.min(a, b)), hi = Math.min(months.length - 1, Math.max(a, b))
  if (lo > hi) return null
  return { from: months[lo]!.from, to: months[hi]!.to }
}

/** "1 Jan – 31 Mar" — a stretch as the chip and the window's lines print it. The year is left out: the period picker
 *  says it. A one-day stretch is one date. */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function shortDate(iso: string): string {
  return `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}`
}
export function stretchLabel(s: OpenStretch): string {
  return s.from === s.to ? shortDate(s.from) : `${shortDate(s.from)} – ${shortDate(s.to)}`
}

/* ---- today, for a member (D1211) ---------------------------------------------------------------------------- */

let TODAY_OVERRIDE: string | null = null

/** THE DAY BEFORE WHICH A MEMBER NEVER BIDS (owner, D1211, 22 Oct 26: "a member never bids on a day before today, even
 *  inside an open month; an admin may"). Local time, as `localToday` is. The one seam the tests pin: a unit test that
 *  bids as a member on a fixed 2026 date sets it, or the test would rot the day the calendar passed that date. */
export function memberToday(): string {
  return TODAY_OVERRIDE ?? localToday()
}

/** Tests only — pin (or with null, release) the day `memberToday` answers. */
export function setMemberTodayForTests(iso: string | null): void {
  TODAY_OVERRIDE = iso
}

/** The first open day of this period on or after `today`, or null. */
export function firstOpenFrom(period: Pick<Period, 'open'>, today: string): string | null {
  for (const s of period.open) {
    if (s.to < today) continue
    return s.from >= today ? s.from : today
  }
  return null
}

/* ---- where the page opens (D1177's reading: "the page opens on the first open date from today, else on today") ---- */

type Landable = Pick<Period, 'id' | 'start' | 'end' | 'open'>

/** The day a period's grid lands on when it is chosen: its first open day from today; else today, when the period
 *  holds it; else its first day. */
export function focusDateOf(period: Pick<Period, 'start' | 'end' | 'open'>, today: string): string {
  const open = firstOpenFrom(period, today)
  if (open) return open
  if (period.start <= today && today <= period.end) return today
  return period.start
}

/** Which period the page opens on, and where: the period holding the FIRST open day from today across them all (in
 *  whichever period holds it); else the period holding today; else the next period to start, else the last to end.
 *  Ties go to the earlier start, then the id, so a reload never resolves differently. Null only for no period. */
export function landingOf(periods: readonly Landable[], today: string): { periodId: string; date: string } | null {
  if (!periods.length) return null
  const byStart = [...periods].sort((a, b) => (a.start !== b.start ? (a.start < b.start ? -1 : 1) : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  let best: { periodId: string; date: string } | null = null
  for (const p of byStart) {
    const d = firstOpenFrom(p, today)
    if (d && (!best || d < best.date)) best = { periodId: p.id, date: d }
  }
  if (best) return best
  const holding = byStart.find(p => p.start <= today && today <= p.end)
  if (holding) return { periodId: holding.id, date: today }
  const next = byStart.find(p => p.start > today)
  if (next) return { periodId: next.id, date: next.start }
  const last = [...byStart].sort((a, b) => (a.end < b.end ? 1 : a.end > b.end ? -1 : 0))[0]!
  return { periodId: last.id, date: last.start }
}

/** The open stretches as a MEMBER sees them: from today on (D1211 — he never bids before today; the outline, the chip
 *  and the window read the same list). */
export function openFrom(period: Pick<Period, 'open'>, today: string): OpenStretch[] {
  const out: OpenStretch[] = []
  for (const s of period.open) {
    if (s.to < today) continue
    out.push({ from: s.from < today ? today : s.from, to: s.to })
  }
  return out
}
