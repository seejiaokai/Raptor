// A leave war period and the days inside it.
//
// Dates are `yyyy-mm-dd` strings throughout, never Date objects. Every parse
// goes through Date.UTC and every read uses a getUTC* accessor: local-time
// accessors shift the day for anyone east or west of UTC, which would silently
// move a weekend and therefore silently move an OIL credit.

export type Stage = 'draft' | 'open' | 'closed' | 'published'

// Type-only — eventdefs.ts imports DayInfo from here the same way; both
// directions are erased at compile so there is no runtime cycle.
import type { EventKind } from './eventdefs'

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
  /** Which event row (0-based). Two rows until 18 Aug 26; an admin can add
   *  more now (store's `eventRows`), so this is a plain index, not `0 | 1`. */
  line: number
  from: string
  to: string
  text: string
  /** THIS band's own tag (owner, 18 Aug 26 — "I don't want u to save it as a
   *  type"). Tagging a one-off event used to silently add its word to the
   *  squadron's type library; now the tag lives on the event instance itself.
   *  `null`/absent means untagged — the word still classifies through the
   *  library if it matches a type there (instance wins over library). */
  kind?: EventKind | null
}

export interface DayInfo {
  date: string
  /** The free-text event lines, one string per EVENT row. Variable length
   *  since 18 Aug 26 — an admin can add rows; a line past the array's end
   *  reads as '' (see `dayEvent`). Old wars stored a fixed 2-tuple, which is
   *  just a length-2 array and loads unchanged. */
  events: string[]
  /** Per-slot tags for `events`, same index (owner, 18 Aug 26 — the tag on a
   *  typed one-off event, stored on the event rather than minted into the
   *  type library). Sparse and optional: a missing entry (or the whole array
   *  absent, as on every older war) means untagged, and the word still
   *  classifies through the library. Read via `dayEventKind`. */
  eventKinds?: (EventKind | null)[]
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
export function bandOverlaps(bands: EventBand[], line: number, from: string, to: string): boolean {
  return bands.some(b => b.line === line && from <= b.to && b.from <= to)
}

/** The band covering a date on a line, or null. A line holds at most one band
 *  over any day (no overlaps), so the first hit is the only hit. */
export function bandAt(bands: EventBand[], line: number, date: string): EventBand | null {
  return bands.find(b => b.line === line && b.from <= date && date <= b.to) ?? null
}

/** One day's text on an event row, '' past the end of the stored array. The
 *  one place a `day.events[line]` read is bounds-checked, so a row added
 *  beyond what a day's array holds reads blank rather than `undefined`. */
export function dayEvent(day: DayInfo, line: number): string {
  return day.events[line] ?? ''
}

/** One day's INSTANCE tag on an event row, `null` past the end or where none
 *  was set — the bounds-checked read `dayEvent` is for text, for the same
 *  reason. `null` does not mean "no colour": the word may still match a
 *  library type; callers fold the two (`instance ?? classifyEvent`). */
export function dayEventKind(day: DayInfo, line: number): EventKind | null {
  return day.eventKinds?.[line] ?? null
}

// CACHED (3 Sep 26). The grid calls `addDays` / `weekday` for every one of
// its ~18,000 cells on every build, and each call parsed the same ISO string
// again — measured at ~250ms of a 10s first open on a 4x-throttled CPU, the
// single largest engine frame in the profile. A war's dates are a few
// hundred distinct strings, so a plain map turns the parse into a lookup.
// Bounded so a pathological caller can never grow it without limit; the
// cap is far above any real war and clearing it is only a cache miss.
const UTC_CACHE = new Map<string, number>()
function toUTC(date: string): number {
  const hit = UTC_CACHE.get(date)
  if (hit !== undefined) return hit
  const [y, m, d] = date.split('-').map(Number)
  const ms = Date.UTC(y, m - 1, d)
  if (UTC_CACHE.size >= 8192) UTC_CACHE.clear()
  UTC_CACHE.set(date, ms)
  return ms
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

/**
 * The same calendar day `n` months on (or back, for a negative `n`), CLAMPED
 * to the last day of the target month: 31 Jan + 1 month is 28 Feb (29 in a
 * leap year), never "3 Mar" — `Date.UTC(y, m + 1, 31)` would roll over
 * silently and an OIL credit dated the 31st would then outlive its neighbours
 * by three days. Exists for the OIL tracker's expiry ("lasts N months") and
 * its default history window; the day-walk in months.ts is a different job.
 */
export function addMonths(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  const ty = Math.floor(total / 12)
  const tm = total - ty * 12
  const last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate()
  return fromUTC(Date.UTC(ty, tm, Math.min(d, last)))
}

/**
 * Today's calendar date as the person at the keyboard sees it — LOCAL time,
 * the one deliberate exception to this file's UTC rule. Every other function
 * here parses a `yyyy-mm-dd` it was GIVEN, where UTC keeps the day steady;
 * this one names the day that is happening, and a squadron east of UTC
 * whose "today" arrived at midnight would otherwise be told it is still
 * yesterday until 08:00. Same convention as engine/inputs.ts's `now` and the
 * post-out auto-archive (sync.ts). The OIL tracker reads expiry against it.
 */
export function localToday(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
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
  // Arithmetic on the cached UTC millis, no Date allocation: the epoch
  // (1 Jan 1970) was a Thursday, so day-count + 4 mod 7 is the UTC weekday.
  // `toUTC` is always a whole-day multiple, so the division is exact.
  return (toUTC(date) / DAY_MS + 4) % 7
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
    // (seeded length 2 — the default row count; extra rows read '' via dayEvent)
  }
  return days
}
