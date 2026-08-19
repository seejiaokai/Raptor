// What the scheduler says each day needs.
//
// Two kinds of rule are live at once: a SET requirement (a set is a pilot plus
// a WSO, counted fractionally, which is why "4.5 sets" is expressible at all)
// and CATEGORY minimums, including combinations like IP + IWSO and named roles
// like SXO. A day takes the worst result of every rule that applies to it.

import type { Category } from './people'

export interface Threshold {
  /** Below this, give the scheduler a heads-up. */
  amber: number
  /** Below this, the day is under-manned. */
  red: number
}

export type RuleTarget =
  /** Sum the availability of everyone in any of these categories. */
  | { kind: 'category'; categories: Category[] }
  /** Sum the availability of everyone carrying the SXO flag. */
  | { kind: 'sxo' }
  /** Available flight-lead pilots (CAT B and above, instructors included). */
  | { kind: 'flp' }
  /** Available wingman pilots (CAT C and below). */
  | { kind: 'wmp' }
  /** Complete SC DAY teams (2 SC-day pilots + 2 SC-day WSOs + 1 SXO + 1 more
   *  crew, six different people — availability.ts:scTeams). */
  | { kind: 'scd' }
  /** As `scd`, for SC NIGHT (AVALON). */
  | { kind: 'scn' }

export interface ManningRule {
  id: string
  label: string
  target: RuleTarget
  threshold: Threshold
  /** Plain words for the tap-a-row sheet: what this row counts (owner,
   *  19 Aug 26 — "crew sets means Pilot + Wso", spelt out for every row). */
  desc?: string
}

/** What the CREW SETS row counts, for the same sheet — the set rule is a
 *  `Threshold` on the requirement rather than a `ManningRule`, so its words
 *  cannot ride a rule object. */
export const SETS_DESC =
  'One set is one pilot plus one WSO — a jet you can crew. The day\'s number is whichever seat runs out first.'

export interface Requirement {
  /** In sets, where one set is a pilot plus a WSO. `null` means no set rule. */
  sets: Threshold | null
  rules: ManningRule[]
}

export interface Requirements {
  default: Requirement
  /** Keyed by `yyyy-mm-dd`. Only days that differ from the default appear. */
  overrides: Record<string, Requirement>
}

export function requirementFor(reqs: Requirements, date: string): Requirement {
  return reqs.overrides[date] ?? reqs.default
}
