// THE TWO AVAILABLE ROWS — who the squadron has, per seat, on a date (the build plan
// docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3; owner D617, D626, D637, D640).
//
// The SANS calendar's "still needed" is the required figure, less those the Leave War shows available, less the SANS
// committed to fly (D617). "Those the Leave War shows available" is THESE two rows: Available P and Available W.
//
// They are ORDINARY COUNT ROWS (D640): an admin renames them in free text and changes who they count — leaving out OCU,
// say — with the form every counter already has, and the SANS calendar uses whatever they then count. So they live in
// the squadron's own rule list under two FIXED ids once changed, and until then the built-in definition below serves —
// which is also what an older store or a damaged row falls back to ("Reset counters" did too, until it went with the
// built-in counters — D669, 8 Oct 26). Four things set them apart:
//   - A SANS MAN IS NEVER COUNTED, whatever the row's filter says (D626): he offers his availability on the SANS
//     calendar, and counting him here would count him twice — once as available, once as committed to fly.
//     `availHave` is the ONE sum, read by the war's rows and by the calendars alike, so the two never disagree.
//   - They count PEOPLE, never teams: the need is a head count per seat.
//   - Their amber and red are POINTS AGAINST THAT DAY'S REQUIRED, never a fixed threshold (D1190, D1191, D1202 — the
//     Leave War overhaul, 21 Oct 26): red under Required + n ("+ 0" by default, the rule they always had: red under
//     Required), amber, where set, under Required + m and not already red. `threshold` stays held at 0 — the points are
//     a field of their own (`points`), so a stored row without it reads as it always did. `availVerdict` is the ONE
//     answer, read by the grid's rows and by every later screen (the bid window, the day panel, Approvals).
//   - They cannot be deleted — the SANS calendar reads them.
// They are drawn with the Required rows in the Manning block (D665; D674 — a counter may stand among them), by
// ui/FlyRows.tsx and never by the block's own row list (`manningRowIds` leaves them out). Since D1213, narrowed by D1243,
// a day with one of them at RED counts towards the days breaking a manning rule (engine/evaluate.ts `redDays`); amber is
// never counted.

import { ruleHave, type Grid } from './availability'
import type { States } from './bids'
import type { Views } from './dayview'
import type { Person } from './people'
import type { AvailPoints, ManningRule } from './requirements'

export const AVAIL_P = 'availp'
export const AVAIL_W = 'availw'
export type AvailId = typeof AVAIL_P | typeof AVAIL_W
export const isAvailId = (id: string): id is AvailId => id === AVAIL_P || id === AVAIL_W

/** why one of the two cannot be deleted — said by the store's check and shown by the sheet */
export const AVAIL_DELETE_MSG = 'The SANS calendar reads this row — rename it or change who it counts'

/** the definition that serves until an admin changes the row: every pilot / every WSO */
export function builtinAvailRule(id: AvailId): ManningRule {
  return id === AVAIL_P
    ? { id: AVAIL_P, label: 'Available P', count: { kind: 'people', filter: { seats: ['pilot'] } }, threshold: { amber: 0, red: 0 } }
    : { id: AVAIL_W, label: 'Available W', count: { kind: 'people', filter: { seats: ['wso'] } }, threshold: { amber: 0, red: 0 } }
}

/* ---- the points (D1190, D1191, D1202) ---- */

/** today's rule, which a row with no points of its own keeps: red under Required, no amber */
export const DEFAULT_AVAIL_POINTS: AvailPoints = Object.freeze({ red: 0 })
/** the largest offset either way — a margin of more than this on a head count is a typing slip, not a setting */
export const AVAIL_POINT_MAX = 99

const isPoint = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= AVAIL_POINT_MAX

/** A stored or sent pair, MADE SAFE — or null where it is not a pair at all. Red is required (absent reads "+ 0");
 *  an amber that is not a number is left out (no amber). The store's reader and its writer both pass through here. */
export function readAvailPoints(x: unknown): AvailPoints | null {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return null
  const o = x as { amber?: unknown; red?: unknown }
  if (o.red !== undefined && !isPoint(o.red)) return null
  const out: AvailPoints = { red: o.red === undefined ? 0 : o.red }
  if (isPoint(o.amber)) out.amber = o.amber
  return out
}

/** the row's points as they stand — today's rule where it has none */
export function availPointsOf(rule: ManningRule): AvailPoints {
  return rule.points ?? DEFAULT_AVAIL_POINTS
}

/** Amber set at or under red never shows: every day under Required + amber is already under Required + red. The row's
 *  window says so (ui/CounterForm.tsx). */
export function amberHidden(p: AvailPoints): boolean {
  return p.amber !== undefined && p.amber <= p.red
}

export type AvailVerdict = '' | 'amber' | 'red'

/** THE ONE ANSWER for an Available row on a day: red where it is under Required + red, else amber where amber is set
 *  and it is under Required + amber, else nothing. A day with no Required — none typed, a no-fly day (the caller passes
 *  null for one), or no period to count in (`have` null) — shows neither (D1191). Meeting a point exactly is met. */
export function availVerdict(have: number | null, required: number | null, points: AvailPoints = DEFAULT_AVAIL_POINTS): AvailVerdict {
  if (have === null || required === null) return ''
  if (have < required + points.red) return 'red'
  if (points.amber !== undefined && have < required + points.amber) return 'amber'
  return ''
}

/** One row a red day is red by, with the figure that broke it — the list's line ("Available P 23"). */
export interface RedLine {
  /** an Available row's line: the day's Required, so the list reads "Available P 23 of 24" as drawn (r19c, D1243) */
  need?: number
  ruleId: string
  label: string
  have: number
}
/** One seat's day as the Available row reads it: who is available and what is required (null where neither shows). */
export interface AvailSeatDay { have: number | null; required: number | null }

/** The Available rows at RED on one day, P before W, each named with its figure — what the days breaking a manning
 *  rule add to the Manning rows' own (D1243: red only, never amber). */
export function availRedLines(rules: { p: ManningRule; w: ManningRule }, day: { p: AvailSeatDay; w: AvailSeatDay }): RedLine[] {
  const out: RedLine[] = []
  for (const s of ['p', 'w'] as const) {
    const d = day[s]
    if (availVerdict(d.have, d.required, availPointsOf(rules[s])) === 'red') out.push({ ruleId: rules[s].id, label: rules[s].label, have: d.have!, need: d.required! })
  }
  return out
}

/** A stored row under one of the two ids, MADE SAFE: a people count with its threshold held at 0 and its points kept
 *  where they are a pair — or null where it is not a people count at all (the built-in one then serves). The save and
 *  the load both pass through here, so the form cannot save a shape a reload would read differently. */
export function cleanAvailRule(rule: ManningRule): ManningRule | null {
  if (!isAvailId(rule.id) || rule.count.kind !== 'people') return null
  const out: ManningRule = { id: rule.id, label: rule.label, count: rule.count, threshold: { amber: 0, red: 0 } }
  if (rule.desc !== undefined) out.desc = rule.desc
  /* today's rule is not written down: a row whose points say only "red + 0" is stored as one without them, so a store
     that never set a point and one that set it back read the same */
  const p = rule.points === undefined ? null : readAvailPoints(rule.points)
  if (p && (p.red !== 0 || p.amber !== undefined)) out.points = p
  return out
}

/** the row as it stands: the squadron's own where its list holds one, else the built-in */
export function availRuleOf(rules: readonly ManningRule[], id: AvailId): ManningRule {
  const own = rules.find(r => r.id === id)
  return (own && cleanAvailRule(own)) || builtinAvailRule(id)
}

/** THE ONE SUM. The row's count over everyone but the SANS (and, as in every manning count, ground crew — `ruleHave`
 *  skips them). Fractional: a half day of leave is half a man. */
export function availHave(rule: ManningRule, people: Person[], grid: Grid, states: States, date: string, views?: Views): number {
  return ruleHave(rule.count, withoutSans(people), grid, states, date, views)
}
/* kept per roster: the rows ask this for every drawn day, and the roster is the same array until it is re-projected */
const NO_SANS = new WeakMap<Person[], Person[]>()
function withoutSans(people: Person[]): Person[] {
  let out = NO_SANS.get(people)
  if (!out) { out = people.some(p => p.san) ? people.filter(p => !p.san) : people; NO_SANS.set(people, out) }
  return out
}
