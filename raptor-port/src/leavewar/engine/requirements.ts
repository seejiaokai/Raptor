// What the scheduler says each day needs.
//
// Since 19 Aug 26 (owner: "instead of hard coding these permutations, make it
// editable… and these counters can also be deleted") a manning rule is DATA,
// not code: who it counts is a `RuleCount` the admin builds in the counter
// form, and the whole set — the eleven seeded rows included — can be renamed,
// redefined, re-numbered or deleted. Two counting shapes cover everything the
// old hard-coded kinds expressed:
//
//   `people` — sum the availability of everyone matching one filter (the old
//              category / SXO / FL P / WM P rows are all this), and
//   `team`   — how many complete teams of DIFFERENT people the day can man,
//              each team built from slots ("2 pilots with SC DAY + 1 SXO…").
//              Crew sets are the two-slot case (1 pilot + 1 WSO), so the old
//              separate set rule folded into the list as the `sets` rule.
//
// A day takes the worst result of every rule that applies to it.

import type { Seat } from './people'

export interface Threshold {
  /** Below this, give the scheduler a heads-up. */
  amber: number
  /** Below this, the day is under-manned. */
  red: number
}

/**
 * Who a rule counts. Criteria AND together; an absent criterion matches
 * everyone. Ground crew never match anything — manning is aircrew-only, the
 * same skip `countsFor` has always applied.
 *
 * CATs are matched against the person's EFFECTIVE CAT (`effectiveCat`,
 * availability.ts): their Raptor CAT where the projection carries one, with
 * the instructor band standing in for a missing one. Qualification keys are
 * Raptor's own (`p.quals` — sxo, scDay, daar, plus anything the squadron adds
 * on the Quals page later), matched against `heldQuals`; a key nobody holds
 * simply counts no one, so a future qualification can be named before the
 * first tick without anything breaking.
 */
export interface CrewFilter {
  /** Only these seats. Absent = pilot or WSO alike. */
  seats?: Seat[]
  /** Effective CAT must be ONE of these. */
  cats?: string[]
  /** Effective CAT must be NONE of these ("everyone except…"). */
  notCats?: string[]
  /** Must hold ALL of these qualification keys. */
  quals?: string[]
  /** Must hold NONE of these. */
  notQuals?: string[]
}

/** One slot of a team: `count` people matching `filter`. */
export interface TeamSlot {
  count: number
  filter: CrewFilter
}

/** Teams beyond this are refused at the write path: the team maths walks
 *  every subset of slots (2^n), and no real crew combination needs more. */
export const MAX_TEAM_SLOTS = 6

export type RuleCount =
  /** Sum the availability of everyone matching the filter. */
  | { kind: 'people'; filter: CrewFilter }
  /** Complete teams of DIFFERENT people, one slot each. `show` picks what the
   *  cell displays (and what the thresholds judge): the number of teams, or
   *  the people inside them (teams × team size). `presence` counts someone
   *  standing SC duty as present — the SC-cover reading, where a man at work
   *  is the manning, not a gap — where absent/false only availability counts. */
  | { kind: 'team'; slots: TeamSlot[]; show?: 'teams' | 'people'; presence?: boolean }

export interface ManningRule {
  id: string
  label: string
  count: RuleCount
  threshold: Threshold
  /** Plain words for the tap-a-row sheet. The seeded rows carry the owner's
   *  own wording; a rule built or reworked in the counter form leaves this
   *  absent and the sheet writes the words from the definition itself
   *  (`describeRule`), so the explanation can never drift from the rule. */
  desc?: string
}

export interface Requirement {
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

/** The CAT ladder the filter chips offer, most senior first — Raptor's own
 *  QORDER order. Stable vocabulary: a CAT is a rung, not a squadron setting,
 *  unlike the qualification columns (which ARE dynamic and are projected). */
export const CAT_LADDER: readonly string[] = Object.freeze(['FI', 'IR', 'IP', 'IW', 'A', 'B', 'C', 'D', 'OCU'])

/** A qualification the filter chips can offer: Raptor's key plus the heading
 *  the Quals page shows for it. */
export interface QualDef {
  k: string
  label: string
}

/** The catalogue the standalone seed knows — the three keys its own people
 *  carry. On the live app the projection replaces this with Raptor's full
 *  set (every Quals-page column, the squadron's own additions included). */
export const SEED_QUAL_CATALOG: readonly QualDef[] = Object.freeze([
  { k: 'sxo', label: 'SXO' },
  { k: 'scDay', label: 'SC DAY' },
  { k: 'scNight', label: 'SC NIGHT' },
])

// ---- The sheet's plain words, written from the rule itself -----------------

const listWords = (xs: string[], joiner: string) =>
  xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${joiner} ${xs[xs.length - 1]}`

function seatWords(f: CrewFilter): string {
  const seats = f.seats?.filter(s => s !== 'gnd') ?? []
  if (seats.length !== 1) return 'crew (pilot or WSO)'
  return seats[0] === 'pilot' ? 'pilots' : 'WSOs'
}

/** One filter in plain words, e.g. "pilots with CAT A or B holding SC DAY". */
export function filterWords(f: CrewFilter, qualLabel: (k: string) => string): string {
  let s = seatWords(f)
  if (f.cats?.length) s += ` with CAT ${listWords(f.cats, 'or')}`
  if (f.notCats?.length) s += ` not CAT ${listWords(f.notCats, 'or')}`
  if (f.quals?.length) s += ` holding ${listWords(f.quals.map(qualLabel), 'and')}`
  if (f.notQuals?.length) s += ` without ${listWords(f.notQuals.map(qualLabel), 'or')}`
  return s
}

/**
 * The tap-a-row explanation for a rule with no hand-written `desc` — built
 * from the definition, so it is true by construction. Kept in the engine
 * beside the types it reads: a second copy of this logic in the interface
 * would be one more drift seam.
 */
export function describeRule(rule: ManningRule, qualLabel: (k: string) => string): string {
  if (rule.count.kind === 'people') {
    return `Counts available ${filterWords(rule.count.filter, qualLabel)}. Ground crew never counted; a half day of leave costs half a person.`
  }
  const { slots, show, presence } = rule.count
  const size = slots.reduce((n, s) => n + s.count, 0)
  const parts = slots.map(s => `${s.count} ${filterWords(s.filter, qualLabel)}`).join(' + ')
  const body = `One team is ${parts} — ${size} different people, ground crew never counted.`
  const shown = show === 'people'
    ? `The day's number is how many people fill complete teams (teams × ${size}).`
    : `The day's number is how many complete teams can still be manned.`
  const duty = presence
    ? ' Someone standing SC duty still counts — they are at work.'
    : ''
  return `${body} ${shown}${duty}`
}
