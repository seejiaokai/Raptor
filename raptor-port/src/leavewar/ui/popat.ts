// Where a SCREEN-FIXED popup's corner goes (owner's click-open popup rule,
// 4 Sep 26). Two of them now — the quals popover on a callsign chip and the
// drawer's column-title pop-up — and both are `position: fixed` for the same
// reason: the frozen columns and the sideways scroller would clip anything
// laid out inside the grid. Fixed also means nothing else keeps them ON the
// screen, so the clamp is not a nicety: a popup opened off one of the last
// columns of a 390px phone otherwise runs its own width off the right edge and
// the words are simply gone.
//
// One body, so the two cannot drift — the drawer's pop-up was written without
// the clamp and without the flip, and only the review caught it.

/** The gap between the anchor and the box, and the margin kept at the screen's
 *  edges. One number: it is the same "just clear of it" in both directions. */
const GAP = 6

/**
 * The fixed-position corner for a popup of `width` × about `estHeight`, opened
 * off `anchor`'s rect: under the anchor where there is room, flipped above it
 * where there is not, and always clamped onto the screen.
 *
 * `estHeight` is an ESTIMATE by design — the box is not in the DOM yet when
 * this is asked, and a frame of measuring it would show the popup jumping. It
 * only decides which side of the anchor to sit on, so being a few pixels out
 * costs nothing.
 */
export function popAt(anchor: DOMRect, width: number, estHeight: number): { x: number; y: number } {
  const x = Math.max(GAP, Math.min(anchor.left, window.innerWidth - width - GAP))
  const below = anchor.bottom + GAP
  const y = below + estHeight > window.innerHeight - GAP ? Math.max(GAP, anchor.top - estHeight - GAP) : below
  return { x, y }
}
