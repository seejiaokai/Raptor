// Which MONTHS of the war the grid actually draws — the column window.
//
// Phase 2 of the Leave War speed work (owner, 3 Sep 26). Phase 1 measured the
// first open of the year grid and halved it; what remained was the browser's
// one style+layout of ~18,000 cells, and that only shrinks by drawing fewer
// of them. The rows are few (~80) and the columns are many (365), so the
// window is over COLUMNS, in whole months: the month is the unit the app
// already thinks in (the strip, the brackets, the row window), so a window
// edge always lands where a reader expects a seam anyway.
//
// The undrawn months are PLACEHOLDERS (owner, 5 Sep 26 — "do the placeholders",
// picked off a mockup of four scrolling styles): one empty cell per side in
// EVERY row, as wide as the months it stands in for, so the scroller spans the
// whole year from the first paint and a flick never runs into a drawn edge.
// Months are then drawn IN PLACE — while the scroll is still moving, in both
// directions — and the trailing ones pruned back to the placeholder at rest.
// The 3 Sep design deliberately refused spacers, and the reason still binds:
// a census of the drawn grid found 22 distinct day-column widths (24–38px;
// header text and chips like "*OIL" widen columns under auto table layout), so
// a spacer's width can only be ESTIMATED for a month never yet drawn, and the
// error would hop the content under the finger the moment the real month
// landed LEFT of the view. Two rules keep that from ever showing:
//  · a month that has been drawn before keeps its MEASURED width in the
//    placeholder (Matrix `monthPxRef`), so re-drawing it moves nothing — and
//    that is every month a reader scrolls back over;
//  · a month whose width is still an estimate is drawn LEFT of the view only
//    at rest, where the existing anchor correction (`anchorRef`) absorbs the
//    error invisibly; to the RIGHT of the view an estimate is harmless (nothing
//    on screen moves) and it is drawn mid-scroll (`stepAllowedInMotion`).
//
// This file is the arithmetic, kept pure so it is provable in jsdom (which
// computes no layout). Matrix.tsx does the measuring and the scrolling.

export type ColWin = { lo: number; hi: number } // inclusive month indices

/** Wars this short are drawn whole: the window's bookkeeping would cost more
 *  than the months it saved. */
export const WINDOW_FROM_MONTHS = 5

export function clampWin(w: ColWin, monthCount: number): ColWin {
  const last = Math.max(0, monthCount - 1)
  const lo = Math.max(0, Math.min(w.lo, last))
  const hi = Math.max(lo, Math.min(w.hi, last))
  return { lo, hi }
}

/** The window to draw around one month — the first open (month 0) and every
 *  month-strip jump: the month itself plus the one after it, which is what a
 *  landing view can show (the month sits at the frozen edge, so nothing to
 *  its left is on screen). Kept to two on purpose — a jump REBUILDS every
 *  row's cells for the new columns, so each extra month is a third more work
 *  before the reader sees anything; the fill engine (`stepToward`) adds the
 *  runway a beat later, off the paint. `null` when the war is short enough to
 *  draw whole. */
export function windowAround(monthCount: number, month: number): ColWin | null {
  if (monthCount < WINDOW_FROM_MONTHS) return null
  return clampWin({ lo: month, hi: month + 1 }, monthCount)
}

export function inWindow(w: ColWin | null, month: number): boolean {
  return !w || (month >= w.lo && month <= w.hi)
}

/** Is the whole year drawn? */
export function isFullYear(w: ColWin, monthCount: number): boolean {
  return w.lo === 0 && w.hi === monthCount - 1
}

/** One step of the drawn window toward an explicit TARGET window — the single
 *  engine behind every "draw more / draw less a beat at a time" path (owner,
 *  5 Sep 26): the desktop fill (target = the whole year), the phone rolling
 *  prefetch (target = the visible months plus a runway ahead — see
 *  `rollingTarget`), and the small cap the grid shrinks to while the tab is
 *  hidden. GROWS toward the target one month per call — the RIGHT edge first
 *  (the common forward-scroll direction), then the left — and, once at or past
 *  the target, PRUNES one month per call back toward it, keeping `hysteresis`
 *  months of slack so a reader parked on a seam does not see the window flap.
 *  Returns the same window when it already sits within [target ± hysteresis], so
 *  the caller's loop terminates. Pure, so the whole rolling/fill behaviour is
 *  provable in jsdom. */
export function stepToward(
  win: ColWin,
  monthCount: number,
  targetLo: number,
  targetHi: number,
  hysteresis = 1,
): ColWin {
  const last = Math.max(0, monthCount - 1)
  const tLo = Math.max(0, Math.min(targetLo, last))
  const tHi = Math.max(tLo, Math.min(targetHi, last))
  const { lo, hi } = win
  // grow toward the target — right edge first, then left
  if (hi < tHi) return clampWin({ lo, hi: hi + 1 }, monthCount)
  if (lo > tLo) return clampWin({ lo: lo - 1, hi }, monthCount)
  // at or past the target: prune one month back, past the hysteresis slack
  if (hi > tHi + hysteresis) return clampWin({ lo, hi: hi - 1 }, monthCount)
  if (lo < tLo - hysteresis) return clampWin({ lo: lo + 1, hi }, monthCount)
  return win
}

/** May the step `win → next` be applied while the scroll is still MOVING
 *  (owner, 5 Sep 26 — draw the next months mid-fling, not only once it stops)?
 *  Only GROWTH: a prune moves nothing the reader needs and, on the left, would
 *  need a scroll correction that kills a fling — it waits for rest. Growth on
 *  the RIGHT is always safe (nothing on screen moves). Growth on the LEFT is
 *  safe only when that month's width is already KNOWN — it was drawn before, so
 *  its placeholder is exactly as wide as the month and the swap moves nothing;
 *  an estimated width could be off by a few pixels and would hop the content
 *  under the finger, so that case waits for rest and the anchor correction. */
export function stepAllowedInMotion(win: ColWin, next: ColWin, widthKnown: (month: number) => boolean): boolean {
  const growsR = next.hi > win.hi
  const growsL = next.lo < win.lo
  if (!growsR && !growsL) return false
  if (growsL && !widthKnown(next.lo)) return false
  return true
}

/** The rolling target window for the phone (and for the small grid the desktop
 *  shrinks to while hidden): the visible months plus a runway — more AFTER than
 *  BEFORE, so the drawn edge sits a few months ahead of the finger and a normal
 *  flick never reaches it, while the trailing side is pruned to keep the phone's
 *  DOM light. Absolute month indices, clamped to the war. */
export function rollingTarget(
  monthCount: number,
  visLo: number,
  visHi: number,
  before: number,
  after: number,
): ColWin {
  const last = Math.max(0, monthCount - 1)
  return clampWin({ lo: visLo - before, hi: visHi + after }, monthCount)
}

/** The months whose spans overlap the viewport, from the cached content-space
 *  spans (`stripGeoRef` in Matrix — one span per month of the WAR, drawn or
 *  placeholder): [visLo, visHi] as indices INTO THE SPANS, or null if nothing
 *  overlaps — a zero-width layout (jsdom) or a scroller with no content. */
export function visibleSpan(
  spans: { left: number; right: number }[],
  viewL: number,
  viewR: number,
): { visLo: number; visHi: number } | null {
  let visLo = -1, visHi = -1
  for (let i = 0; i < spans.length; i++) {
    const s = spans[i]!
    if (Math.min(s.right, viewR) - Math.max(s.left, viewL) > 2) {
      if (visLo < 0) visLo = i
      visHi = i
    }
  }
  return visLo < 0 ? null : { visLo, visHi }
}
