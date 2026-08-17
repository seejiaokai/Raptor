// A leave war period and the days inside it.
//
// Dates are `yyyy-mm-dd` strings throughout, never Date objects. Every parse
// goes through Date.UTC and every read uses a getUTC* accessor: local-time
// accessors shift the day for anyone east or west of UTC, which would silently
// move a weekend and therefore silently move an OIL credit.

export type Stage = 'draft' | 'open' | 'closed' | 'published'

/**
 * A MERGED event — one label shown as a single cell across a range of days, on
 * one of the two event lines (owner, Aug 26). The alternative a scheduler can
 * choose instead is a repeat: the same word written into each day's own
 * `events[line]`, which needs no band and no new shape. A band is the merged
 * look, so it is the piece that needed a home.
 *
 * `from`/`to` are inclusive `yyyy-mm-dd` and lie inside the period. Bands on
 * one line never overlap (the store refuses it), and a band suppresses the
 * per-day `events[line]` text under it — the store clears that text when the
 * band is made, so no hidden words linger beneath a merged label.
 */
export interface EventBand {
  line: 0 | 1
  from: string
  to: string
  text: string
}

export interface DayInfo {
  date: string
  /** Two free-text event lines, matching the two EVENT rows of the sheet. */
  events: [string, string]
  /** Leave is discouraged. Bids are still accepted — warn, never block. */
  blocked: boolean
  blockedReason: string
  /** A public holiday earns OIL for duty exactly as a weekend does. */
  ph: boolean
}

export interface Period {
  id: string
  name: string
  start: string
  end: string
  stage: Stage
  /**
   * The range of dates members may bid on, inside this period. `null` means
   * the whole period.
   *
   * A leave war is a WHOLE YEAR on screen, because that is how the owner
   * reads it — but the schedule firms up a quarter or a month at a time, and
   * bidding opens on that much of it. Those two facts used to fight: the only
   * way to open a quarter was to make the war a quarter, which meant never
   * seeing the year. Settled 10 Aug 26 — the year is the sheet, and this is
   * the window opened inside it.
   *
   * Both `null` on every war that predates this, which reads as "the whole
   * period is open" and is exactly the old behaviour.
   */
  bidFrom: string | null
  bidTo: string | null
  days: DayInfo[]
  /** Merged event labels — the spanning-cell alternative to per-day repeat.
   *  Empty on every war that predates the feature, read leniently in the
   *  store's `readWar` so an older stored war loads unchanged. */
  bands: EventBand[]
}

/** Whether a proposed band overlaps any existing band on the same line. The
 *  store refuses an overlap rather than trimming it — two merged labels
 *  fighting over one day has no single right answer, and silently shrinking
 *  one would hide the collision. */
export function bandOverlaps(bands: EventBand[], line: 0 | 1, from: string, to: string): boolean {
  return bands.some(b => b.line === line && from <= b.to && b.from <= to)
}

/** The band covering a date on a line, or null. A line holds at most one band
 *  over any day (no overlaps), so the first hit is the only hit. */
export function bandAt(bands: EventBand[], line: 0 | 1, date: string): EventBand | null {
  return bands.find(b => b.line === line && b.from <= date && date <= b.to) ?? null
}

function toUTC(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function fromUTC(ms: number): string {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`
}

const DAY_MS = 86_400_000

export function addDays(date: string, n: number): string {
  return fromUTC(toUTC(date) + n * DAY_MS)
}

export function isWeekend(date: string): boolean {
  const day = weekday(date)
  return day === 0 || day === 6
}

/** Day of the week, 0 = Sunday. The one place the UTC parse lives, so no
 *  caller has to remember to use `getUTCDay` over `getDay` — a local-time
 *  accessor names the wrong day for anyone east or west of UTC, which would
 *  silently move a weekend and therefore silently move an OIL credit. */
export function weekday(date: string): number {
  return new Date(toUTC(date)).getUTCDay()
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** `MON`, `TUE` — the day of the week, for the date header.
 *
 *  A year of columns numbered 01…31 twelve times over gives the eye nothing
 *  to hold on to; the weekend banding says where a week ends but not which
 *  day a given column is. Same UTC discipline as `isWeekend`, and for the
 *  same reason: a local-time accessor would name the wrong day for anyone
 *  east or west of UTC. */
export function dayName(date: string): string {
  return DAY_NAMES[weekday(date)]
}

/**
 * Whether this date is inside the period's bidding window.
 *
 * `null` bounds mean the whole period is open, which is what every war
 * created before the window existed carries. A window is clamped by the
 * caller, not here — this answers only the question it is asked.
 */
export function inBidWindow(period: Period, date: string): boolean {
  if (period.bidFrom && date < period.bidFrom) return false
  if (period.bidTo && date > period.bidTo) return false
  return true
}

/**
 * Whether a proposed bidding window is one this period can hold.
 *
 * Refused rather than clamped: an admin who typed dates outside the war has
 * made a mistake worth telling them about, and silently moving their dates to
 * the period's edges would leave them believing they opened something else.
 */
export function windowFits(period: Period, from: string, to: string): boolean {
  return to >= from && from >= period.start && to <= period.end
}

/** A period's empty band list. A named helper so the two constructors and the
 *  reader agree on the starting shape. */
export function emptyBands(): EventBand[] {
  return []
}

export function buildDays(start: string, end: string): DayInfo[] {
  const days: DayInfo[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push({ date: d, events: ['', ''], blocked: false, blockedReason: '', ph: false })
  }
  return days
}
