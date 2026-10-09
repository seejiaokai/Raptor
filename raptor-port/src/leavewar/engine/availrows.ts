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
//   - They carry no amber or red of their own (their red comes from the Required row above them, never a threshold).
//   - They cannot be deleted — the SANS calendar reads them.
// They are drawn with the Required rows at the FOOT of the Manning block (D665, 8 Oct 26 — first under the Event rows),
// by ui/FlyRows.tsx and never by the block's own row list (`manningRowIds` leaves them out); no day is judged by them.

import { ruleHave, type Grid } from './availability'
import type { States } from './bids'
import type { Views } from './dayview'
import type { Person } from './people'
import type { ManningRule } from './requirements'

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

/** A stored row under one of the two ids, MADE SAFE: a people count with no amber or red — or null where it is not a
 *  people count at all (the built-in one then serves). The save and the load both pass through here, so the form cannot
 *  save a shape a reload would read differently. */
export function cleanAvailRule(rule: ManningRule): ManningRule | null {
  if (!isAvailId(rule.id) || rule.count.kind !== 'people') return null
  const out: ManningRule = { id: rule.id, label: rule.label, count: rule.count, threshold: { amber: 0, red: 0 } }
  if (rule.desc !== undefined) out.desc = rule.desc
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
