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
// Why whole months and real widths, not fixed-width spacers: a census of the
// drawn grid found 22 distinct day-column widths (24–38px) — the header text
// and chips like "*OIL" widen columns under auto table layout — so a spacer
// standing in for an undrawn month can only ever be an estimate, and the
// estimate's error would hop the content under the finger the moment the real
// month was drawn. Drawing whole months at their real width has no such seam;
// the cost is that the scroller spans the window, not the year, so the year is
// crossed by the month strip and by the window GROWING at its edges.
//
// This file is the arithmetic, kept pure so it is provable in jsdom (which
// computes no layout). Matrix.tsx does the measuring and the scrolling.

export type ColWin = { lo: number; hi: number } // inclusive month indices

/** Wars this short are drawn whole: the window's bookkeeping would cost more
 *  than the months it saved. */
export const WINDOW_FROM_MONTHS = 5

/** How many months to keep drawn beyond the visible ones, per side. The left
 *  runway matters more on a touch screen, where the window only grows on the
 *  left once the scroll has actually hit its bound (see `growAtRest`). */
export function runway(coarse: boolean): { before: number; after: number } {
  return { before: coarse ? 2 : 1, after: 2 }
}

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
 *  before the reader sees anything; `growAtRest` adds the runway a beat
 *  later, off the paint. `null` when the war is short enough to draw whole. */
export function windowAround(monthCount: number, month: number): ColWin | null {
  if (monthCount < WINDOW_FROM_MONTHS) return null
  return clampWin({ lo: month, hi: month + 1 }, monthCount)
}

export function inWindow(w: ColWin | null, month: number): boolean {
  return !w || (month >= w.lo && month <= w.hi)
}

/** Is the whole year drawn? — the desktop background fill's stop condition. */
export function isFullYear(w: ColWin, monthCount: number): boolean {
  return w.lo === 0 && w.hi === monthCount - 1
}

/** One step of the desktop background fill (owner, 4 Sep 26 — "fill in the
 *  background"): widen the window by a SINGLE month toward the whole year, so
 *  the reader can scroll it smoothly a beat after the fast first open. The
 *  RIGHT edge grows first (the common forward-scroll direction), then the left;
 *  returns the same window once the year is fully drawn. One month per idle beat
 *  is the whole point — each added month is a small, non-blocking layout instead
 *  of the one big freeze a jump to a far month costs. Desktop only: the phone
 *  keeps the lazy runway window (`growAtRest`), whose reason to exist is that
 *  its perf budget cannot hold the whole year at once. */
export function fillStep(w: ColWin, monthCount: number): ColWin {
  const last = monthCount - 1
  if (w.hi < last) return { lo: w.lo, hi: w.hi + 1 }
  if (w.lo > 0) return { lo: w.lo - 1, hi: w.hi }
  return w
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

/**
 * The window after a scroll comes to REST, given which drawn months are on
 * screen. Grows toward the runway, shrinks past it — and never mid-scroll:
 * every change here that adds or removes columns LEFT of the viewport shifts
 * the content and needs a compensating scrollLeft write, which is invisible at
 * rest and deadly to a touch fling (matrix.css / Matrix.tsx anchorRef carry the
 * history). So:
 *  - the RIGHT side grows and prunes freely (nothing left of the viewport moves);
 *  - on a fine pointer the LEFT side grows and prunes at rest too, corrected by
 *    the anchor;
 *  - on a COARSE pointer the left side grows only once the scroll sits AT its
 *    left bound — the fling has already been stopped by the edge, so the
 *    correction that follows kills nothing — and never prunes, so a reader
 *    exploring leftwards can only ever gain months (the worst case is the whole
 *    year, which is exactly what the grid drew before this existed).
 * Pruning keeps one month of hysteresis beyond the runway so a reader parked
 * on a seam does not see the window flap on every settle.
 */
export function growAtRest(
  win: ColWin,
  monthCount: number,
  view: { visLo: number; visHi: number; atLeftBound: boolean },
  opts: { coarse: boolean; before: number; after: number },
): ColWin {
  const last = monthCount - 1
  const wantLo = Math.max(0, view.visLo - opts.before)
  const wantHi = Math.min(last, view.visHi + opts.after)
  let { lo, hi } = win
  // right: grow to the runway, prune past it (+1 hysteresis)
  if (wantHi > hi) hi = wantHi
  else if (hi > wantHi + 1) hi = wantHi
  // left
  if (wantLo < lo) {
    if (!opts.coarse || view.atLeftBound) lo = wantLo
  } else if (!opts.coarse && lo < wantLo - 1) {
    lo = wantLo
  }
  return clampWin({ lo, hi }, monthCount)
}

/** The drawn months' indices that overlap the viewport, from the cached
 *  content-space spans (`stripGeoRef` in Matrix): [visLo, visHi] as indices
 *  INTO THE SPANS (i.e. relative to the window's `lo`), or null if nothing
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
