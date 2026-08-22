/* WEEK NAVIGATION MATH — the one place that maps between a date and "the week
   it belongs to", and the only source of the week-button labels.

   The app keys a loaded week by the MONDAY of that week, as a `dd/mm/yyyy`
   string (`CURWEEK`, engine/waves.ts) — `loadWeek(v)` (state/store.ts) takes
   exactly that and `weekBundle(v)` (engine/weeks-data.ts) builds any week from
   it, so navigation is unbounded: prev/next is just ±7 days, and a calendar
   pick is the Monday of whatever day was tapped.

   Date.UTC, not the local clock, and not a hand-walked calendar: the port's
   RangeCal.tsx already does its month grid this way (Mon-first via
   `(getUTCDay()+6)%7`), so this matches it. UTC keeps the arithmetic free of the
   timezone drift that would otherwise move a Monday for a reader east or west of
   UTC. This is UI-layer date math and deliberately stays out of `src/engine/`,
   whose weeks-data walker is kept `Date`-free for its own reasons. */

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DAY_MS = 86_400_000

/** A `dd/mm/yyyy` string → a UTC millisecond timestamp at midnight. */
function toMs(ddmmyyyy: string): number {
  const [d, m, y] = ddmmyyyy.split('/').map(x => parseInt(x, 10))
  return Date.UTC(y, m - 1, d)
}

/** A UTC timestamp → a `dd/mm/yyyy` string. */
function fromMs(ms: number): string {
  const dt = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(dt.getUTCDate())}/${p(dt.getUTCMonth() + 1)}/${dt.getUTCFullYear()}`
}

/** `yyyy-mm-dd` (the calendar's format) → `dd/mm/yyyy` (a week key's format). */
export function isoToKey(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** `dd/mm/yyyy` → `yyyy-mm-dd`. */
export function keyToIso(key: string): string {
  const [d, m, y] = key.split('/')
  return `${y}-${m}-${d}`
}

/** The Monday of the week that `v` falls in, as `dd/mm/yyyy`. Accepts either a
 *  `dd/mm/yyyy` week key or a `yyyy-mm-dd` calendar date. */
export function mondayOf(v: string): string {
  const key = v.includes('-') ? isoToKey(v) : v
  const ms = toMs(key)
  // getUTCDay(): Sun=0…Sat=6. Monday-first offset back to Monday.
  const backToMon = (new Date(ms).getUTCDay() + 6) % 7
  return fromMs(ms - backToMon * DAY_MS)
}

/* The squadron's notional "today" — the seed week's `today:true` day (Jul 13
   2026, engine/data.ts). The app has no clock by design, so "the week the
   current day is in" is a fixed point, not `new Date()`. One literal, here, so
   the today-highlight and any future today-jump never disagree. Declared after
   `mondayOf`/`DAY_MS` so the module-init call sees them initialised. */
export const TODAY = '13/07/2026'
export const TODAY_WEEK = mondayOf(TODAY)

/** `v` shifted by `n` whole weeks (±7·n days), as a `dd/mm/yyyy` Monday. `v`
 *  is assumed to be a Monday already (every week key is); the shift preserves
 *  that. Unbounded — this is what makes the arrows continuous. */
export function shiftWeek(v: string, n: number): string {
  return fromMs(toMs(v) + n * 7 * DAY_MS)
}

/** `Mon DD` label for a week key, e.g. `13/07/2026` → `Jul 13`. Matches the
 *  old WEEKS chip labels (`Jul 06`, day zero-padded). */
export function weekLabel(v: string): string {
  const [d, m] = v.split('/')
  return `${MON[parseInt(m, 10) - 1]} ${d}`
}

export interface WeekBtn { v: string; lbl: string; sel: boolean; today: boolean }

/** The desktop rolling window: prev, current, +1, +2 relative to the loaded
 *  week `cur`. `sel` marks the loaded week; `today` marks the week the notional
 *  today falls in, so a scheduler can always spot the way back to now. */
export function weekWindow(cur: string): WeekBtn[] {
  const mon = mondayOf(cur)
  return [-1, 0, 1, 2].map(n => {
    const v = shiftWeek(mon, n)
    return { v, lbl: weekLabel(v), sel: v === mon, today: v === TODAY_WEEK }
  })
}

/** 0..6 (Mon..Sun) — where `iso` sits within the week keyed by `weekMon`. Used
 *  to open the board on the tapped day after a calendar pick snaps to its week. */
export function dayIndexInWeek(weekMon: string, iso: string): number {
  const diff = Math.round((toMs(isoToKey(iso)) - toMs(mondayOf(weekMon))) / DAY_MS)
  return Math.max(0, Math.min(6, diff))
}
