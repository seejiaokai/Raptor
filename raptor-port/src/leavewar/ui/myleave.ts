/* "MY LEAVE" — the signed-in person's own figures at the top of the Leave War (D1141, narrowed by D1173, D1177, D1227,
   D1254): LVE left, OIL, the days pending, and the next leave. ONE pure reader, so the top row and its test read the same.
   - LVE and OIL are the SAME figures the grid's balance column and the OIL tracker show (`FIGURES` 'lve' / 'oil' read
     through `figureCtxOf`), so My leave can never disagree with his row; a bid already takes its leave off (D1153).
   - "pending" counts DAYS, not requests (D1217): every undecided leave request of his, across every period, a half day .5
     (D1246) — a refused bid is history and counts nothing.
   - "next" is the first day from today holding leave of his — filed, approved or still pending, never refused — across
     every period, so it is right whatever period is on screen.
   Kept to the ONE person: the reader walks his own rows of each war's day views, never the whole roster (Chrome
   repaints on every store change — `docs/performance.md` §E). */
import { FIGURES, type FigureCtx } from '../engine'
import { isLeaveCode, portionOf, type Views } from '../engine/dayview'

export interface MyLeave {
  lve: number
  oil: number
  /** days pending a decision (a half day .5) */
  pending: number
  /** the next day from today with his leave on it, or null */
  next: string | null
}

const LVE = FIGURES.find(f => f.id === 'lve')!
const OIL = FIGURES.find(f => f.id === 'oil')!

export function myLeaveOf(ctx: FigureCtx, wars: ReadonlyArray<{ views: Views }>, personId: string, today: string): MyLeave {
  let pending = 0
  let next: string | null = null
  const seen = new Set<string>()
  for (const w of wars) {
    const rows = w.views[personId]
    if (!rows) continue
    for (const [date, v] of Object.entries(rows)) {
      if (seen.has(date)) continue
      let leaveHere = false
      let pendingHere = 0
      for (const c of v.all) {
        if (!isLeaveCode(c.code)) continue
        if (c.kind === 'request' && c.state === 'pending') pendingHere += portionOf(c.win) === 'full' ? 1 : 0.5
        if (c.kind === 'absence' || (c.kind === 'request' && c.state !== 'refused')) leaveHere = true
      }
      if (!leaveHere && !pendingHere) continue
      seen.add(date)
      pending += Math.min(1, pendingHere)
      if (leaveHere && date >= today && (next === null || date < next)) next = date
    }
  }
  return { lve: LVE.value(ctx, personId), oil: OIL.value(ctx, personId), pending, next }
}

/** A figure as the Leave War writes it: a whole number whole, a half .5 (D1246), never ½ or 14.50. */
export const fig = (n: number) => String(Math.round(n * 2) / 2)
