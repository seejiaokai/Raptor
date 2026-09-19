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
// A RUN is consecutive calendar days, each FULLY covered by LL/OL and holding
// no other leave type (owner Q13, 19 Sep 26 — "the 15-consecutive-days rule
// applies to LL and OL only … any other leave type breaks the run"; a morning
// of LL and an afternoon of OL is a full LL/OL day — clash check H4). Before
// 19 Sep 26 any single counter ran (15 days of OIL charged weekends) — fixed. A pilot's run of 15
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
import { isBiddable, stateOf, type States } from './bids'
import { codeOf, parseCell, type CounterName } from './codes'
import { dayView, AM, PM, FULL, type Contrib, type Views } from './dayview'
import { isNonWorkingDay, type EventDef } from './eventdefs'
import type { Person } from './people'
import { addDays, type DayInfo, type Period } from './period'

/** The run length from which a PILOT's leave charges every calendar day. */
export const LONG_LEAVE_DAYS = 15

/** Just enough of a leave war to draw a counter from. `LeaveWar` satisfies
 *  it structurally, so callers pass their wars straight in. `period` is
 *  what tells a holiday from a working day; a source without one (an old
 *  test fixture) still knows its weekends. */
export interface LeaveSource {
  grid: Grid
  states: States
  /** The day views ([ARCH-STACK] step 4) — what every figure reads. A merged
   *  war carries them; a bare grid/states fixture is converted on the fly
   *  (`viewsOf`), so there is ONE reading path either way. */
  views?: Views
  period?: Period
}

/* A bare grid/states source (the engine's own fixtures) as day views: one
   contribution per cell — a bid is a request (an approved one reads as an
   approved absence), FO/HO a credit, anything else an absence. Cached on the
   grid object. */
const LEGACY = new WeakMap<Grid, { states: States; views: Views }>()
export function legacyViews(grid: Grid, states: States): Views {
  const hit = LEGACY.get(grid)
  if (hit && hit.states === states) return hit.views
  const views: Views = {}
  for (const [pid, row] of Object.entries(grid)) {
    const out: Record<string, ReturnType<typeof dayView>> = {}
    for (const [date, code] of Object.entries(row)) {
      const cell = parseCell(code)
      if (!cell) continue
      const win = cell.portion === 'am' ? AM : cell.portion === 'pm' ? PM : FULL
      const st = stateOf(states, pid, date)
      const rec = states[pid]?.[date]
      let c: Contrib
      if (cell.type === 'FO' || cell.type === 'HO') c = { id: date, kind: 'credit', code: cell.type, win, ...(rec?.source === 'raptor' ? { auto: true } : {}), ...(rec?.note ? { note: rec.note } : {}) }
      else if (isBiddable(code) && st !== 'approved') c = { id: date, kind: 'request', code: cell.type, win, state: st ?? 'pending' }
      else c = { id: date, kind: 'absence', code: cell.type, win, lw: rec?.source !== 'raptor' }
      if (rec?.shiftedFrom) c.movedFrom = rec.shiftedFrom
      out[date] = dayView([c])
    }
    views[pid] = out
  }
  LEGACY.set(grid, { states, views })
  return views
}

/** The day views of a source — its own when merged, else derived. */
export function viewsOf(src: LeaveSource): Views {
  return src.views ?? legacyViews(src.grid, src.states)
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

/** One charge on a date, as the run walk sees it — a day may hold two
 *  (morning LL, afternoon OIL). `type` is the leave code; `half` says which
 *  half a half-day charge is. */
export interface Taken {
  date: string
  counter: CounterName
  amount: number
  type: string
  half?: 'am' | 'pm'
}

/**
 * A period's days, by date — built once per days ARRAY and remembered.
 *
 * This is the hot half of `chargedDays`: a year-long war holds 365 days and
 * two of them 730, and the walk below needs to look one date up at a time. It
 * used to build a fresh 730-entry map on EVERY call, and `figureLines` calls
 * `chargedDays` about twenty-three times per person (once per figure's value
 * and once per used line, medical included) — so a sixty-person roster with
 * the drawer open paid for ~1,400 rebuilds of the same map before every paint.
 * Measured on the seed store (16 people, 2 wars): one drawer pass 25.4 ms
 * against a closed column's 3.1 ms, ~8× for eight times the boxes when the
 * per-box work should have been nearly free.
 *
 * KEYED ON `period.days`, NOT on the period, and that choice is the whole
 * safety argument: a memo keyed on something that survives an edit is a silent
 * wrong-charge bug, which is far worse than the cost it saves. The index holds
 * exactly what that array holds, and every path that can change a day REPLACES
 * the array rather than writing into it:
 *   - the store's day writers (`setDayEvent`, the band writers, the blocked/PH
 *     edits) all rebuild with `days: w.period.days.map(…)`;
 *   - a new war comes from `makeWar` → `buildDays`, a fresh array;
 *   - undo/redo and a load from storage go through `JSON.parse`/`readWar`,
 *     which mint the whole graph anew;
 *   - `seedPeriod` is the ONE place that writes a day in place, and it does so
 *     before the array leaves the function.
 * `period.bands` is deliberately NOT in here — `nonWorking` reads it live off
 * the source's own period, so a merged event band lands immediately.
 * A caller that hand-edits a day IN PLACE after the period is in use would see
 * the stale index; nothing in production does, and the test fixtures tweak a
 * period before its first read for the same reason.
 *
 * A WeakMap so a war that is replaced or deleted takes its index with it.
 */
const DAY_INDEX = new WeakMap<Period['days'], Map<string, DayInfo>>()

function dayIndex(period: Period): Map<string, DayInfo> {
  let ix = DAY_INDEX.get(period.days)
  if (!ix) {
    ix = new Map(period.days.map(d => [d.date, d]))
    DAY_INDEX.set(period.days, ix)
  }
  return ix
}

/**
 * The dates on which this person's counter-bearing leave CHARGES, across
 * every source, keyed by date. A date absent from the map either holds no
 * counter-bearing leave, holds a refused bid, or is a weekend/PH the rule
 * excuses. The value is the counter and how much of a day it charges — the
 * two facts `drawnFrom` and `takenOf` need — so neither re-walks the runs.
 */
export function chargedDays(sources: readonly LeaveSource[], personId: string, ctx?: CountCtx): Map<string, Taken[]> {
  // 1. Every charge, merged across the wars — only THIS person's days, so it
  //    is cheap, and it comes FIRST: most people hold no leave in most calls.
  //    What a day charges is the day view's (a half charged ONCE, by the leave
  //    covering more of it — owner, 20 Sep 26).
  const taken = new Map<string, Taken[]>()
  const full = new Set<string>()
  for (const src of sources) {
    const row = viewsOf(src)[personId]
    if (!row) continue
    for (const [date, v] of Object.entries(row)) {
      if (v.charges.length) taken.set(date, v.charges.map(c => ({ date, counter: c.counter, amount: c.amount, type: c.code, ...(c.half ? { half: c.half } : {}) })))
      if (v.annualFull) full.add(date)
    }
  }
  if (taken.size === 0) return taken

  // The war holding a date, and its own record of that day (last source wins,
  // the merged map's old rule — the store refuses overlapping wars anyway).
  const held = (date: string): { period: Period; day: DayInfo } | undefined => {
    for (let i = sources.length - 1; i >= 0; i--) {
      const period = sources[i]!.period
      if (!period) continue
      const day = dayIndex(period).get(date)
      if (day) return { period, day }
    }
    return undefined
  }
  const nonWorking = (date: string): boolean => {
    const h = held(date)
    return isNonWorkingDay(date, h?.day, ctx?.eventDefs ?? [], h?.period.bands ?? [])
  }
  const pilot = isPilot(ctx, personId)

  // 2. Walk the dates in calendar order. A run is consecutive days each FULLY
  //    covered by LL/OL (`annualFull`); anything else — a half day, another
  //    leave type, a gap — ends it. A pilot's run of 15+ charges every day in
  //    it; otherwise a weekend/PH charges nothing.
  const dates = [...taken.keys()].sort()
  const out = new Map<string, Taken[]>()
  let run: string[] = []
  const flush = () => {
    const every = pilot && run.length >= LONG_LEAVE_DAYS
    for (const d of run) if (every || !nonWorking(d)) out.set(d, taken.get(d)!)
    run = []
  }
  for (const date of dates) {
    if (full.has(date)) {
      if (run.length && addDays(run[run.length - 1]!, 1) !== date) flush()
      run.push(date)
      continue
    }
    flush()
    if (!nonWorking(date)) out.set(date, taken.get(date)!)
  }
  flush()
  return out
}
