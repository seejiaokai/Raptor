// Which leave days CHARGE a counter (owner, 3 Sep 26).
//
// A leave cell on the grid is two facts at once: the person is away (the
// manning rows read that, through `removesAvailability`, and nothing here
// changes it), and — for a code that spends a counter — the entitlement is
// drawn down. Until 3 Sep 26 the two were the same fact: every leave cell
// drew. The owner's rule splits them:
//
//   "If the type of leave has a counter … do not deduct from the balance,
//    and the leave is not taken, if it falls on a weekend or a PH."
//
// So a Saturday of LL still removes the man from the manning picture (he is
// away), but it costs him nothing and shows in no USED figure. A public
// holiday is whatever the war holding the date says — its `ph` flag, or an
// event word on it tagged `off` (the admin's own input path for holidays,
// seeded as `PH`). The admin can mark a PH AFTER the leave was approved;
// because every counter is DERIVED (counters.ts), that re-reads the moment
// the tag lands — there is no stored balance to go stale.
//
// The one exception, and it is the owner's exact wording:
//
//   "For pilots only. If the leave taken is 15 days or more, count every
//    single day … I can break the counting by having an OIL/FCL/CCL/EL/PL/
//    CL, then continuing with OL or LL."
//
// A RUN is consecutive calendar days, each holding a taken (not refused)
// cell that spends the SAME counter. LL and OL both spend the annual pool,
// so LL → OL continues a run; a day of anything else — a different counter,
// medical, a course, a blank, a refused bid — ends it. A pilot's run of 15
// days or more charges every day in it, weekends and holidays included; a
// shorter run, or anyone who is not a pilot, charges working days only. A
// run may cross a war boundary (entitlements are continuous and wars are
// windows onto them — counters.ts §drawnFrom), which is why the walk merges
// every source before it looks for runs. A RUN is CONTINUOUS FULL DAYS: a
// half day BREAKS it (owner, 3 Sep 26 — "the 14-day run is a continuous run;
// if there is a half day in the middle of that run, it breaks the rule").
// The man was at work for half that day, so the run is not unbroken. A half
// day is never part of a long run and so never earns the weekend/PH charge;
// it still charges its own half on a working day by the plain rule.
//
// Medical markers spend no counter and are untouched: hospitalisation over a
// weekend is still hospitalisation, and MED USED counts it as before.

import type { Grid } from './availability'
import { removesAvailability, stateOf, type States } from './bids'
import { codeOf, portionAmount, parseCell, type CounterName } from './codes'
import { isNonWorkingDay, type EventDef } from './eventdefs'
import type { Person } from './people'
import { addDays, type Period } from './period'

/** The run length from which a PILOT's leave charges every calendar day. */
export const LONG_LEAVE_DAYS = 15

/** Just enough of a leave war to draw a counter from. `LeaveWar` satisfies
 *  it structurally, so callers pass their wars straight in. `period` is
 *  what tells a holiday from a working day; a source without one (an old
 *  test fixture) still knows its weekends. */
export interface LeaveSource {
  grid: Grid
  states: States
  period?: Period
}

/** What the charging rule needs beyond the grid: the squadron's event-type
 *  library (which typed words mean a public holiday) and the roster (who is
 *  a pilot). Both optional so a caller that has neither — an engine test —
 *  still gets the weekend rule; production hands both in through the
 *  store's `figureCtxOf()`, the ONE builder every figure surface uses. */
export interface CountCtx {
  eventDefs?: readonly EventDef[]
  people?: readonly Person[]
}

export function isPilot(ctx: CountCtx | undefined, personId: string): boolean {
  return ctx?.people?.find(p => p.id === personId)?.seat === 'pilot'
}

/** One taken, counter-bearing cell, as the run walk sees it. */
interface Taken {
  date: string
  counter: CounterName
  amount: number
}

/**
 * The dates on which this person's counter-bearing leave CHARGES, across
 * every source, keyed by date. A date absent from the map either holds no
 * counter-bearing leave, holds a refused bid, or is a weekend/PH the rule
 * excuses. The value is the counter and how much of a day it charges — the
 * two facts `drawnFrom` and `takenOf` need — so neither re-walks the runs.
 */
export function chargedDays(sources: readonly LeaveSource[], personId: string, ctx?: CountCtx): Map<string, Taken> {
  // 1. Every taken counter-bearing cell, merged across the wars, and every
  //    day's calendar facts from the war that holds it.
  const taken = new Map<string, Taken>()
  const days = new Map<string, { period: Period; day: Period['days'][number] }>()
  for (const src of sources) {
    if (src.period) for (const day of src.period.days) days.set(day.date, { period: src.period, day })
    for (const [date, code] of Object.entries(src.grid[personId] ?? {})) {
      const spends = codeOf(code)?.spends
      if (!spends) continue
      if (!removesAvailability(code, stateOf(src.states, personId, date))) continue
      taken.set(date, { date, counter: spends.counter, amount: spends.amount })
    }
  }
  if (taken.size === 0) return taken

  const nonWorking = (date: string): boolean => {
    const held = days.get(date)
    return isNonWorkingDay(date, held?.day, ctx?.eventDefs ?? [], held?.period.bands ?? [])
  }
  const pilot = isPilot(ctx, personId)

  // 2. Walk the dates in calendar order, cutting runs where the day before
  //    is missing, spends a different counter, or is not a full day — a half
  //    day breaks the run on both sides, so it forms a run of one that can
  //    never reach LONG_LEAVE_DAYS. `yyyy-mm-dd` sorts as a date;
  //    `Object.entries` order is insertion order, so sort explicitly (the
  //    engine/raptor.ts precedent).
  const dates = [...taken.keys()].sort()
  const out = new Map<string, Taken>()
  let run: Taken[] = []
  const flush = () => {
    const every = pilot && run.length >= LONG_LEAVE_DAYS
    for (const t of run) if (every || !nonWorking(t.date)) out.set(t.date, t)
    run = []
  }
  for (const date of dates) {
    const t = taken.get(date)!
    const prev = run[run.length - 1]
    const continues = prev && addDays(prev.date, 1) === date && prev.counter === t.counter && prev.amount === 1 && t.amount === 1
    if (prev && !continues) flush()
    run.push(t)
  }
  flush()
  return out
}

/**
 * Whether ONE cell charges — the per-cell view of `chargedDays`, for a
 * caller that already holds the map. A cell that spends no counter (medical)
 * charges nothing but is still "taken" whenever it removes availability,
 * which is what the USED figures for medical count.
 */
export function cellCharges(charged: Map<string, Taken>, code: string, date: string, states: States, personId: string): boolean {
  const cell = parseCell(code)
  if (!cell) return false
  const spends = codeOf(code)?.spends
  // Matched on the counter too, not the date alone: should two sources ever
  // hold one date for one person (hand-edited storage — the store refuses
  // overlapping wars), the per-type readers must not charge a cell the map
  // charged for a different counter.
  if (spends) return charged.get(date)?.counter === spends.counter
  return removesAvailability(code, stateOf(states, personId, date))
}

/** How much of the day a taken cell counts as, for the USED figures. */
export function cellAmount(code: string): number {
  const cell = parseCell(code)
  return cell ? portionAmount(cell.portion) : 0
}
