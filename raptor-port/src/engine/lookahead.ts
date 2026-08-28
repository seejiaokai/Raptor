/* HOW FAR AHEAD THE INPUTS PAGE LOOKS, as a squadron setting (owner, 28 Aug 26
   — "Can i set the default duration how many weeks to look ahead by default.
   but i can set it such that i can do weeks, or weeks plus till that week's
   sunday etc … and i am able to change the button function to show the set
   duration i can click by default by everyone, is customizable").
 *
 * The page used to open on a hard-coded today → +14 days, and its quick button
 * on a hard-coded today → +2 months. Both are now this one setting, so what the
 * page opens on and what the button offers can never disagree.
 *
 * TWO SHAPES, both asked for:
 *   - `weeks: N`                  → today → today + N×7 days.
 *   - `weeks: N, toSunday: true`  → the same, then run on to that week's
 *     SUNDAY, so the window always ends on a week boundary. A squadron plans
 *     in whole weeks; "two weeks" that stops on a Wednesday cuts the week it
 *     is meant to cover in half.
 *
 * The DEFAULT is 2 weeks, no Sunday extension — exactly the today+14 the page
 * has always opened on, so nothing moves until an admin changes it.
 *
 * Shape follows `engine/stores.ts` / `engine/wavetpl.ts`: a frozen STD, a
 * mutable CFG, `…AreStandard()`, save-null-when-standard, a load that treats
 * storage as untrusted, and a reset. Admin gating lives at the UI write path
 * (the same rule the rest of the config surfaces use).
 */

import { store } from './hooks'

export interface Lookahead {
  /** Whole weeks ahead of today. Bounded — see LOOK_MIN/LOOK_MAX. */
  weeks: number
  /** Run the window on to the end of that week (Sunday). */
  toSunday: boolean
}

export const LOOK_MIN = 1
export const LOOK_MAX = 52

/** The squadron standard: a fortnight, ending exactly where it lands. This IS
 *  the old `DEFAULT_SPAN_DAYS = 14`, expressed as weeks. */
export const LOOK_STD: Readonly<Lookahead> = Object.freeze({ weeks: 2, toSunday: false })

/** The live setting. Mutated in place (like `STORE_CFG`) so importers see the
 *  current value without re-reading a module binding. */
export const LOOK_CFG: Lookahead = { ...LOOK_STD }

/** Whether the squadron is still on the standard — what decides if anything is
 *  written to storage at all. */
export function lookaheadIsStandard(): boolean {
  return LOOK_CFG.weeks === LOOK_STD.weeks && LOOK_CFG.toSunday === LOOK_STD.toSunday
}

/** Clamp a typed number of weeks into the allowed range. A value that is not a
 *  finite number is refused (null), so the caller can put the live value back
 *  on screen rather than leaving a typo looking saved — the standing rule for
 *  every edited threshold in this app. */
export function lookaheadParse(v: string | number): number | null {
  const n = typeof v === 'number' ? v : Number(String(v).trim())
  if (!Number.isFinite(n)) return null
  const i = Math.round(n)
  if (i < LOOK_MIN || i > LOOK_MAX) return null
  return i
}

/** Set the look-ahead. Returns false (and changes nothing) for a refused week
 *  count. */
export function setLookahead(weeks: number | string, toSunday: boolean): boolean {
  const n = lookaheadParse(weeks)
  if (n === null) return false
  LOOK_CFG.weeks = n
  LOOK_CFG.toSunday = !!toSunday
  lookaheadSave()
  return true
}

const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/* Date normalises an overflow for us — 20 Dec + 3 weeks is 10 Jan, never a
   31st of February — which is what a "N weeks from now" window wants. */
const plusDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** Days from `d` to the END of its week, taking the week to end on SUNDAY (the
 *  squadron's own Mon–Sun week, the one `mondayOf` already assumes). 0 when it
 *  is already Sunday. */
function toWeekEnd(d: Date): number {
  const dow = d.getDay()            // 0 = Sunday
  return dow === 0 ? 0 : 7 - dow
}

/**
 * The window the page opens on, and the one its quick button applies.
 * `now` is injectable so tests need no clock faking.
 */
export function lookaheadRange(now = new Date(), cfg: Lookahead = LOOK_CFG): { from: string; to: string } {
  const end = plusDays(now, cfg.weeks * 7)
  return { from: isoOf(now), to: isoOf(cfg.toSunday ? plusDays(end, toWeekEnd(end)) : end) }
}

/** What the quick button says it will do, in the owner's own terms. */
export function lookaheadLabel(cfg: Lookahead = LOOK_CFG): string {
  const w = `Next ${cfg.weeks} week${cfg.weeks === 1 ? '' : 's'}`
  return cfg.toSunday ? `${w}, to Sunday` : w
}

/** Persist — nothing at all while the squadron is on the standard, so a later
 *  change to that standard is picked up rather than frozen in a browser. */
export function lookaheadSave(): void {
  store.set('lookahead', lookaheadIsStandard() ? null : { w: LOOK_CFG.weeks, s: LOOK_CFG.toSunday })
}

/** Load, treating storage as untrusted: a week count outside the bounds, or a
 *  non-number, leaves the standard in place. */
export function lookaheadLoad(): void {
  LOOK_CFG.weeks = LOOK_STD.weeks
  LOOK_CFG.toSunday = LOOK_STD.toSunday
  const raw: any = store.get('lookahead', null)
  if (!raw || typeof raw !== 'object') return
  const n = lookaheadParse(raw.w)
  if (n !== null) LOOK_CFG.weeks = n
  LOOK_CFG.toSunday = raw.s === true
}

/** Put it back to the squadron standard. */
export function lookaheadReset(): void {
  LOOK_CFG.weeks = LOOK_STD.weeks
  LOOK_CFG.toSunday = LOOK_STD.toSunday
  lookaheadSave()
}
