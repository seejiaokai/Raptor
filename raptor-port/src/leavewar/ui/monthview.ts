// Which month the grid is currently showing.
//
// The month strip was a jump control only: twelve buttons that all looked the
// same wherever you were, so a year-long war told you where you could go and
// never where you were. This is the arithmetic behind the answer.
//
// Kept as a pure function on measured numbers rather than reading the DOM
// itself, because the DOM half cannot be tested: jsdom computes no layout and
// reports every rectangle as 0×0. The measuring lives in Matrix.tsx and is
// proved in the browser gate; the deciding lives here and is proved properly.

export interface MonthSpan {
  label: string
  /** Left and right edges, in whatever one coordinate space the caller is
   *  using for the view as well. Viewport pixels, in practice. */
  left: number
  right: number
}

/**
 * The month occupying most of the visible strip, or `null` if none does.
 *
 * Most-of-the-view rather than whichever month the left edge happens to sit
 * in: a screen showing three days of February and four weeks of March is a
 * March screen, and saying "FEB" there would be a readout nobody trusts.
 *
 * Ties go to the earlier month, which is what stops the label flickering
 * between two answers while the grid is dragged slowly across a boundary —
 * with a strict `>` the first month to reach the maximum keeps it.
 *
 * BUT FIRST, A SCREEN WIDE ENOUGH TO SHOW SEVERAL MONTHS (his find, 28 Oct 26, D1477 — "im looking at feb but the MAR month is
 * shown selected"): his desktop shows three or four months at once, so the month filling the most of it was a later
 * one — FEB pressed, February whole at the left, MAR lit; MAY pressed, JUL lit. So the first month (from the left) with
 * at least half of its OWN width on screen is the answer; only where no month is half on screen — a phone's two weeks
 * across a boundary — does the month filling most of the view decide, as above. A month pressed lands whole at the
 * left edge, so it is always the one lit.
 */
export function monthInView(spans: MonthSpan[], viewLeft: number, viewRight: number): string | null {
  if (viewRight <= viewLeft) return null

  let best: string | null = null
  let most = 0
  // Ordered by position, not by the order they arrive in: a caller building
  // spans from a map or a reversed list must get the same answer.
  for (const m of [...spans].sort((a, b) => a.left - b.left)) {
    const overlap = Math.min(m.right, viewRight) - Math.max(m.left, viewLeft)
    // the first month at least half on screen wins outright (a wide screen — see above)
    if (overlap > 0 && overlap * 2 >= m.right - m.left) return m.label
    if (overlap > most) {
      most = overlap
      best = m.label
    }
  }
  return best
}
