// IS A DAY'S COLUMN ALREADY ON SCREEN? (owner, D670, 8 Oct 26 — "if the change was already in view for the undo and
// redo, the screen should just remain there and show the undo/redo item, instead of snapping the change to the left of
// the screen").
//
// The grid's jump always puts a day at the left, just past the frozen name columns. An Undo or a Redo asks first
// whether the day is in view, and jumps only when it is not. "In view" = its column is drawn, has a width (a hidden
// page lays nothing out), and sits WHOLLY in the part of the scroller he can see: right of everything frozen over the
// days, left of the scroller's right edge. Half a pixel is forgiven — a zoomed grid lays its columns out on fractions.
//
// Pure, on plain boxes, so the rule is tested without a browser; Matrix.tsx hands it the real ones.

export interface Box { left: number; right: number; width?: number }

const SLACK = 0.5

/** `col` — the day's header cell (null = its month is not drawn); `wrap` — the grid's scroller; `frozen` — the width
 *  painted over the days at the scroller's left (the name and counter columns, or the figures drawer) */
export function columnInView(col: Box | null, wrap: Box, frozen: number): boolean {
  if (!col) return false
  if (!((col.width ?? col.right - col.left) > 0)) return false
  return col.left >= wrap.left + frozen - SLACK && col.right <= wrap.right + SLACK
}
