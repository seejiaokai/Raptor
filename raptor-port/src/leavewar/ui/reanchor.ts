/* HOW THE GRID PUTS ITS FIRST DAY BACK AFTER A REDRAW (Matrix.tsx, the anchor layout effect) — the decision alone, so a
   unit test can hold it (jsdom has no layout). Three answers:
   - 'skip'  — write nothing: on a touch screen a scroll write kills an inertial fling dead (iOS), so a redraw the
               person's own flick brought is left alone, unless a jump just ran or the months drawn on the left shifted;
   - 'edge'  — put the day back ON the frozen edge exactly (landOnEdge: rounded down, 0–1px clear, never under);
   - 'shift' — move by how far the day moved, when that is more than a pixel (the old rule).
   'edge' is for a landing a JUMP made, and only that ([LW-MONTHJUMP-SUBPIXEL]; fix read 3 — both readers): the day
   resting within a pixel of the edge is not enough, since the person's own scroll can leave a day there, and putting
   that back wrote a sub-pixel scroll the old rule never wrote — on a phone, in a coast's lull, stopping the fling.
   `landed` — the day is where a jump put it: set by the jump, cleared by the person's own scroll — a scroll event that
   leaves where the grid's own last write put it (leftTheLanding), a sideways wheel over the grid, a press on its scroll
   bar, and on a phone any touch, as before. Not by a click or a key that scrolls nothing (fix read 4's claim 5: a click
   on a day cell during the fill cleared it, and the day drifted under the frozen columns again). On a touch screen only
   inside the jump's own window too (`fromJump`); a desktop keeps a jumped day exact through the whole-year fill that
   follows, a month a beat. */
/* WHERE THE LANDING SCROLLS TO — rounded DOWN on the screen's own dot grid, never only on whole pixels (fix read 4's claim
   5, the 125% case, 19 Nov 26). The browser keeps the sideways scroll in whole screen dots: one pixel at a scaling of
   100%, 0.8px at his PC's 125%, and it rounds a write to the NEAREST dot — so a whole-pixel floor (6062.135 → 6062) still
   came back as 6062.4, the day 0.275px under the counter column. Flooring in dots (7577.67 → 7577 → 6061.6) puts the day
   0–1 dot clear, every time; at 100% it is the old whole-pixel floor exactly. The 0.01 absorbs float noise in the sum. */
export function landingScroll(exact: number, dpr: number): number {
  const d = dpr > 0 ? dpr : 1
  return Math.floor(exact * d + 0.01) / d
}

/* THE PERSON SCROLLED AWAY FROM THE LANDING — the "landed" mark's one test on a scroll event (fix read 4's claim 5): the
   grid stands where its own last write left it (`own`, read back after the write, so the browser's rounding is in it) or
   it does not. A click, a key or a window opening moves nothing, so it never clears the mark; any scroll that leaves the
   landing does — a sideways wheel, the scroll bar, arrow keys, Tab bringing a cell into view, a drag at the edge. */
export function leftTheLanding(scrollLeft: number, own: number | null): boolean {
  return own == null || Math.abs(scrollLeft - own) > 0.01
}

export type Reanchor = 'skip' | 'edge' | 'shift'

/* THE PLAN FOR ONE REDRAW, given where the grid stood when the first day was noted (Astra's read of chat 112's fix, 19 Nov
   26). The note (Matrix.tsx anchorNow) is taken at rest and applied a task later; a scroll in between — an arrow key, a
   drag at the edge, a wheel the early listeners missed — moved the day too, and the old correction read that move as the
   redraw's and undid it: the edge rule put a landed day back over a 1px key scroll (the mark then left on, since the
   grid's own write matched), and the shift rule reversed any larger one. Now a scroll since the note ends the landing,
   is never the edge rule's, and is kept: the shift corrects only what the redraw moved (`anchorLeft - moved` is where
   the day would stand after that scroll alone). */
export function reanchorPlan(o: {
  coarse: boolean; fromJump: boolean; colShift: boolean; edge: boolean; landed: boolean
  cellLeft: number; anchorLeft: number; anchorSl: number; nowSl: number
}): { mode: Reanchor; shift: number; landed: boolean } {
  const moved = o.nowSl - o.anchorSl
  const scrolled = Math.abs(moved) > 0.01
  const landed = o.landed && !scrolled
  const mode = reanchorMode({ coarse: o.coarse, fromJump: o.fromJump, colShift: o.colShift, edge: o.edge && !scrolled, landed })
  return { mode, shift: o.cellLeft - (o.anchorLeft - moved), landed }
}
export function reanchorMode(o: { coarse: boolean; fromJump: boolean; colShift: boolean; edge: boolean; landed: boolean }): Reanchor {
  if (o.coarse && !o.fromJump && !o.colShift) return 'skip'
  if (o.edge && o.landed && (o.fromJump || !o.coarse)) return 'edge'
  return 'shift'
}
