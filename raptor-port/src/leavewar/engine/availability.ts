// How much of each person each day actually has, and the totals a day is
// judged on.
//
// The sheet this replaces counted EMPTY cells, so a half day of leave cost a
// whole person and SC duty — someone at work — was indistinguishable from
// someone on leave. Both are fixed here: availability is fractional, and duty
// is reported on its own line rather than hidden inside the shortfall.

import { removesAvailability, stateOf, type BidState, type States } from './bids'
import { codeOf, isDuty } from './codes'
import { categoryOf, inSquadron, pilotLead, type Category, type Person } from './people'
import type { CrewFilter, RuleCount, TeamSlot } from './requirements'

/** `personId -> date -> code`. Sparse: most cells are empty. */
export type Grid = Record<string, Record<string, string>>

export interface DayCounts {
  byCategory: Record<Category, number>
  /** Availability of everyone carrying the SXO flag, counted on top of their category. */
  sxo: number
  /** The lesser of available pilots and available WSOs. */
  sets: number
  /** Head count on SC duty — at work, off the flying programme. */
  duty: number
  /** Available flight-lead pilots — CAT B and above, instructors included (owner). */
  flp: number
  /** Available wingman pilots — CAT C and below. FL P + WM P is every pilot. */
  wmp: number
  /** Complete SC DAY teams the day can still man (owner, 19 Aug 26): one team
   *  is 2 SC-day-qualified pilots + 2 SC-day-qualified WSOs + 1 SXO + 1 more
   *  crew — six DIFFERENT people, ground crew never counted. Fractional like
   *  every other figure. See `scTeams` for how presence and overlap work. */
  scd: number
  /** As `scd`, for SC NIGHT (AVALON). */
  scn: number
}

/** The per-kind presence buckets `scTeams` judges. Each is a fractional sum
 *  of PRESENCE over the people qualifying for it; the union buckets exist
 *  because one person can hold two of the roles but fill only one. */
interface ScBuckets {
  /** SC-qualified pilots. */
  p: number
  /** SC-qualified WSOs. */
  w: number
  /** SC-qualified pilot OR SXO. */
  ps: number
  /** SC-qualified WSO OR SXO. */
  ws: number
  /** SC-qualified (either seat) OR SXO. */
  pws: number
}

function emptyBuckets(): ScBuckets {
  return { p: 0, w: 0, ps: 0, ws: 0, pws: 0 }
}

function addBucket(b: ScBuckets, qual: boolean, sxo: boolean, pilot: boolean, present: number): void {
  if (qual && pilot) b.p += present
  if (qual && !pilot) b.w += present
  if ((qual && pilot) || sxo) b.ps += present
  if ((qual && !pilot) || sxo) b.ws += present
  if (qual || sxo) b.pws += present
}

/**
 * How many complete SC teams the buckets can man. A team is 2 qualified
 * pilots + 2 qualified WSOs + 1 SXO + 1 more crew, six different people —
 * and "different" is the whole trick: the squadron's only SXO being one of
 * only two SC-day pilots means NO team, however the four simple counts read.
 * Each `min` term is one way to run out: the two seats, the SXO alone, and
 * then each union of roles against the people who can fill any of them —
 * pilots+SXO need 3 per team, WSOs+SXO 3, all five named roles 5, and the
 * whole six-body team 6 from the crew at large. (Hall's condition on the
 * role subsets; subsets containing the any-crew filler all reduce to the
 * last term.)
 */
function scTeams(b: ScBuckets, sxo: number, crew: number): number {
  const t = Math.min(b.p / 2, b.w / 2, sxo, b.ps / 3, b.ws / 3, b.pws / 5, crew / 6)
  // Never negative, and rounded to kill float dust (0.9999999 must read 1 —
  // a team the squadron actually has must not paint the day red).
  return Math.max(0, Math.round(t * 1000) / 1000)
}

export function availabilityOf(
  p: Person,
  date: string,
  code: string | undefined,
  state?: BidState,
): number {
  if (!inSquadron(p, date)) return 0
  const c = codeOf(code)
  // An unknown code must not remove anyone. A typo should look wrong on screen,
  // not quietly delete a person from the manning picture.
  if (!c) return 1
  if (c.duty) return 0
  // A refused bid gives the WHOLE person back, not the fraction the code
  // would have taken — he is at work all day, not half of one. This sits
  // after the two guards above on purpose: a refusal returns a man to the
  // programme, never to a squadron he has left or to a duty he is still on.
  if (!removesAvailability(code, state)) return 1
  return 1 - c.removes
}

// ---- The custom counters' maths (owner, 19 Aug 26) -------------------------
//
// Everything a `RuleCount` needs to read a day. `matchesFilter` is the one
// place a filter meets a person, so the counter form's preview, the count
// rows and the sheet's words can never disagree about who is in.

/**
 * The CAT a filter matches against: the person's Raptor CAT where the
 * projection carries one, with the instructor BAND standing in for a missing
 * one (the raw seed knows band but not CAT — same fallback `pilotLead` uses,
 * so a seeded instructor still reads as one). An ops person with no CAT reads
 * '' — matched by no `cats` list, excluded by no `notCats` list, which is the
 * junior default the FL P / WM P split has always applied.
 */
export function effectiveCat(p: Person): string {
  const q = (p.q || '').toUpperCase()
  if (q) return q
  if (p.band === 'instructor') return p.seat === 'pilot' ? 'IP' : 'IW'
  return ''
}

/** Every qualification key this person holds. The projected set (`xq`) plus
 *  the three flags older stores and the seed carry as booleans — kept in both
 *  places so a seed person and a projected person answer the same question
 *  the same way. */
export function heldQuals(p: Person): Set<string> {
  const out = new Set<string>(p.xq ?? [])
  if (p.sxo) out.add('sxo')
  if (p.scd) out.add('scDay')
  if (p.scn) out.add('scNight')
  return out
}

/** Whether this person is inside the filter. Aircrew only — callers skip
 *  ground crew before asking, same as every manning path. */
export function matchesFilter(p: Person, f: CrewFilter): boolean {
  if (f.seats?.length && !f.seats.includes(p.seat)) return false
  const cat = effectiveCat(p)
  if (f.cats?.length && !f.cats.includes(cat)) return false
  if (f.notCats?.length && f.notCats.includes(cat)) return false
  if (f.quals?.length || f.notQuals?.length) {
    const held = heldQuals(p)
    if (f.quals?.length && !f.quals.every(k => held.has(k))) return false
    if (f.notQuals?.length && f.notQuals.some(k => held.has(k))) return false
  }
  return true
}

/**
 * How many complete teams the day can man, each slot filled by a DIFFERENT
 * person. The exact generalisation of the SC-team maths: by Hall's condition
 * the answer is the worst ratio over every subset of slots — the people who
 * can fill ANY slot in the subset, against the bodies the subset needs. The
 * old `scTeams` hand-picked the subsets that matter for its one shape; this
 * walks them all (≤ 2^MAX_TEAM_SLOTS), which for that shape provably lands on
 * the same number (the extra subsets are dominated — pinned by test).
 *
 * `weight` is each person's fractional presence for this rule (availability,
 * or presence when the rule counts duty as present). Accumulated per
 * slot-membership BITMASK so the subset walk touches masks, not people.
 */
function teamsOf(slots: TeamSlot[], weightOf: (p: Person) => number, people: Person[]): number {
  const byMask = new Map<number, number>()
  for (const p of people) {
    if (p.pers || p.seat === 'gnd') continue
    const w = weightOf(p)
    if (w <= 0) continue
    let mask = 0
    for (let i = 0; i < slots.length; i++) if (matchesFilter(p, slots[i].filter)) mask |= 1 << i
    if (mask) byMask.set(mask, (byMask.get(mask) ?? 0) + w)
  }
  let teams = Infinity
  for (let s = 1; s < 1 << slots.length; s++) {
    let need = 0
    for (let i = 0; i < slots.length; i++) if (s & (1 << i)) need += slots[i].count
    if (need <= 0) continue
    let have = 0
    for (const [mask, w] of byMask) if (mask & s) have += w
    teams = Math.min(teams, have / need)
  }
  if (!Number.isFinite(teams)) return 0
  // Never negative, and rounded to kill float dust (0.9999999 must read 1 —
  // a team the squadron actually has must not paint the day red).
  return Math.max(0, Math.round(teams * 1000) / 1000)
}

/**
 * The day's number for one rule. `people` sums availability over the filter;
 * `team` runs the Hall walk above, on presence when the rule says duty
 * counts (the SC-cover reading) and on availability otherwise, then shows
 * either teams or the people inside them. The thresholds judge the SAME
 * number the cell shows, so what the admin typed is what turns amber.
 */
export function ruleHave(rc: RuleCount, people: Person[], grid: Grid, states: States, date: string): number {
  if (rc.kind === 'people') {
    let total = 0
    for (const p of people) {
      if (p.pers || p.seat === 'gnd') continue
      if (!matchesFilter(p, rc.filter)) continue
      total += availabilityOf(p, date, grid[p.id]?.[date], stateOf(states, p.id, date))
    }
    return Math.round(total * 1000) / 1000
  }
  const weightOf = (p: Person): number => {
    const code = grid[p.id]?.[date]
    const onDuty = inSquadron(p, date) && isDuty(code)
    const have = availabilityOf(p, date, code, stateOf(states, p.id, date))
    return rc.presence && onDuty ? 1 : have
  }
  const teams = teamsOf(rc.slots, weightOf, people)
  if (rc.show !== 'people') return teams
  const size = rc.slots.reduce((n, s) => n + s.count, 0)
  return Math.round(teams * size * 1000) / 1000
}

export function countsFor(people: Person[], grid: Grid, states: States, date: string): DayCounts {
  const byCategory = { IP: 0, OPSP: 0, IWSO: 0, OPSW: 0 } as Record<Category, number>
  let sxo = 0
  let duty = 0
  let pilots = 0
  let wsos = 0
  let flp = 0
  let wmp = 0
  // The SC team figures (owner, 19 Aug 26). They count PRESENCE, not flying
  // availability: a person standing SC duty reads 0 to every other figure —
  // off the flying programme — but they are AT WORK, and for "can the
  // squadron man SC" they are the manning, not a gap. Counting them absent
  // would turn a fully-manned duty weekend red, the exact confusion this
  // sheet exists to avoid.
  const dayB = emptyBuckets()
  const nightB = emptyBuckets()
  let sxoPresent = 0
  let crewPresent = 0

  for (const p of people) {
    // Ground crew ride the roster (owner, 18 Aug 26) but are not aircrew:
    // they fill no category, crew no set and stand no SC duty here, so the
    // manning picture must not see them at all. Skipping before the duty
    // tally, the category add and the seat count keeps every existing
    // threshold reading exactly the squadron it always did.
    if (p.pers || p.seat === 'gnd') continue
    const code = grid[p.id]?.[date]
    const onDuty = inSquadron(p, date) && isDuty(code)
    if (onDuty) duty += 1

    const have = availabilityOf(p, date, code, stateOf(states, p.id, date))
    const present = onDuty ? 1 : have
    if (present > 0) {
      crewPresent += present
      if (p.sxo) sxoPresent += present
      addBucket(dayB, !!p.scd, !!p.sxo, p.seat === 'pilot', present)
      addBucket(nightB, !!p.scn, !!p.sxo, p.seat === 'pilot', present)
    }
    if (have === 0) continue

    byCategory[categoryOf(p)] += have
    if (p.sxo) sxo += have
    if (p.seat === 'pilot') {
      pilots += have
      // FL P / WM P split every pilot by CAT (owner, 18 Aug 26). Fractional
      // like every other count, so a half-day of leave costs half a lead.
      if (pilotLead(p) === 'FLP') flp += have
      else wmp += have
    } else wsos += have
  }

  // A set is a crewed jet: one pilot and one WSO. Whichever seat runs out
  // first caps the number of sets, so the count is the lesser of the two.
  return {
    byCategory, sxo, sets: Math.min(pilots, wsos), duty, flp, wmp,
    scd: scTeams(dayB, sxoPresent, crewPresent),
    scn: scTeams(nightB, sxoPresent, crewPresent),
  }
}
