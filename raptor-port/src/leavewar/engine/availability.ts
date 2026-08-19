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
