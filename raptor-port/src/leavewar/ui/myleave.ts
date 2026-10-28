/* "MY LEAVE" — the signed-in person's own figures at the top of the Leave War (D1141, narrowed by D1173, D1177, D1227,
   D1254): LVE left, OIL, the days pending, and the next leave. ONE reader, so the top row and its test read the same.
   - LVE is his War bal (the M5a build spec §1.4, D1479) — the one engine's answer (engine/leaveyear.ts, through the
     store's `leaveFiguresOf`), the SAME figure the grid shows beside his name, Approvals' LVE BAL and the bid windows'
     leave buttons; a bid already takes its leave off (D1153). OIL is not a typed kind (D1209): it stays the OIL tracker's
     ledger (`oilLedgerOf`, through `figureCtxOf`), as his OIL tracker reads it.
   - "pending" counts DAYS, not requests (D1217): each of his pending requests, across every period, as its own kind
     charges it — a weekend or a holiday free, a half day .5 (D1246) — the same count as each request's DAYS in Approvals
     (`approvals.ts ownDays`; the build spec's reading 14). NOT the tiles' Pending: a bid that lengthens a pilot's approved
     run past 15 days makes the run's weekends cost, which the tile's Pending shows and this count does not (reading 24 —
     §1.5 row 10, the one case the two differ). A refused bid is history and counts nothing.
   - "next" is the first day from today holding leave of his — filed, approved or still pending, never refused — across
     every period, so it is right whatever period is on screen.
   Kept to the ONE person: it walks his own rows of each war, never the whole roster (Chrome repaints on every store
   change — `docs/performance.md` §E), and his figures are the store's cached answer. */
import { oilLedgerOf } from '../engine'
import { isLeaveCode, type Views } from '../engine/dayview'
import type { Recs } from '../engine/warrecs'
import { figureCtxOf, leaveFiguresOf } from '../state/store'
import { linesOfWar, ownDays } from '../approvals'

export interface MyLeave {
  lve: number
  oil: number
  /** days pending a decision (a half day .5) */
  pending: number
  /** the next day from today with his leave on it, or null */
  next: string | null
}

type War = { period: { id: string }; recs: Recs; views: Views }

/** The days of his pending requests, each as its kind charges it — the sum of what Approvals shows on each of his lines. */
export function pendingDaysOf(wars: ReadonlyArray<Pick<War, 'period' | 'recs'>>, personId: string): number {
  let n = 0
  for (const w of wars) {
    const mine = w.recs[personId]
    if (!mine) continue
    for (const line of linesOfWar({ period: w.period, recs: { [personId]: mine } })) n += ownDays(personId, line.parts)
  }
  return Math.round(n * 2) / 2
}

/** The first day from `today` holding leave of his — filed, approved or pending, never refused. */
export function nextLeaveOf(wars: ReadonlyArray<Pick<War, 'views'>>, personId: string, today: string): string | null {
  let next: string | null = null
  for (const w of wars) {
    const rows = w.views[personId]
    if (!rows) continue
    for (const [date, v] of Object.entries(rows)) {
      if (date < today || (next !== null && date >= next)) continue
      if (v.all.some(c => isLeaveCode(c.code) && (c.kind === 'absence' || (c.kind === 'request' && c.state !== 'refused')))) next = date
    }
  }
  return next
}

export function myLeaveOf(wars: ReadonlyArray<War>, personId: string, today: string): MyLeave {
  return {
    lve: leaveFiguresOf(personId).kinds.LVE.war,
    oil: oilLedgerOf(figureCtxOf(), personId).balance,
    pending: pendingDaysOf(wars, personId),
    next: nextLeaveOf(wars, personId, today),
  }
}

/** A figure as the Leave War writes it: a whole number whole, a half .5 (D1246), never ½ or 14.50. */
export const fig = (n: number) => String(Math.round(n * 2) / 2)
