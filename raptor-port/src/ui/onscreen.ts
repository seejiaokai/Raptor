/* IS A ROW ALREADY ON SCREEN? (owner, D672, 8 Oct 26 — "if it's already in view, undo/redo don't need to snap to view.
   Unless it's outside the screen view then it's ok to snap into view").

   The one question the scheduler's pages ask before a landing moves the page (Quals' row, the Inputs list's row; the
   Leave War's grid asks its own sideways twin, leavewar/ui/inview.ts — D670). "On screen" = laid out, and WHOLLY
   between the bottom of whatever is fixed over the page's top and the bottom of the window. Half a pixel is forgiven.

   AND HOW FAR TO MOVE THE PAGE WHEN IT IS NOT (`scrollToShow`, `bringRowOnScreen`): the least that brings the row
   wholly on screen by those same two edges. The browser's own `scrollIntoView({ block: 'nearest' })` judges by the
   WINDOW's edges, so a row that was above the screen landed at the window's very top — behind the app's sticky top
   bar (found by the browser check of the Inputs list, 8 Oct 26: Undo lifted the input to the head of the list, the
   page came to it, and the row sat hidden under the bar). */

export interface VBox { top: number; bottom: number; height?: number }
const SLACK = 0.5
/** the air left between a row brought on screen and the edge it was brought to */
const GAP = 8

/** the pure rule: `top` = where the visible page begins (under the top bar, a stuck heading), `bottom` = the window's foot */
export function boxOnScreen(box: VBox | null, top: number, bottom: number): boolean {
  if (!box) return false
  if (!((box.height ?? box.bottom - box.top) > 0)) return false
  return box.top >= top - SLACK && box.bottom <= bottom + SLACK
}

/** How far the page scrolls (down is positive) to bring `box` wholly between `top` and `bottom` — 0 when it already
 *  is, or when nothing is laid out. A row above comes down to just under `top`; a row below comes up by just enough;
 *  a row taller than the room shows its HEAD (its top is never pushed above `top`). */
export function scrollToShow(box: VBox | null, top: number, bottom: number): number {
  if (!box || !((box.height ?? box.bottom - box.top) > 0)) return 0
  if (boxOnScreen(box, top, bottom)) return 0
  const toHead = box.top - top - GAP
  if (box.top < top) return Math.round(toHead)
  return Math.round(Math.min(box.bottom - bottom + GAP, toHead))
}

/* where the visible page begins: under the app's top bar, and under any further thing stuck over the top of the page
   (a table's heading), counted only while it IS stuck there */
function pageTop(under?: Element | null): number {
  const bar = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
  let top = Math.max(0, bar)
  if (under) {
    const u = under.getBoundingClientRect()
    if (u.height > 0 && u.top <= top + 1) top = Math.max(top, u.bottom)
  }
  return top
}
const pageBottom = () => window.innerHeight || document.documentElement.clientHeight

/** the same, asked of the page: `under` — any further thing stuck over the top of the page (a table's heading), counted
 *  only while it IS stuck there. jsdom lays nothing out (every box is 0 × 0), so there this answers "no" and the caller
 *  moves the page as it always did. */
export function rowOnScreen(el: Element | null, under?: Element | null): boolean {
  if (!el || typeof window === 'undefined') return false
  return boxOnScreen(el.getBoundingClientRect(), pageTop(under), pageBottom())
}

/** BRING A ROW ON SCREEN, with the least movement and clear of the top bar — for a page whose scroller is the window
 *  (the Inputs list). Where nothing is laid out (jsdom; a hidden page) there is no distance to work out, so the row is
 *  handed to the browser's own nearest-edge scroll, as before — guarded, because jsdom has no `scrollIntoView` at all. */
export function bringRowOnScreen(el: Element | null, under?: Element | null): void {
  if (!el || typeof window === 'undefined') return
  const box = el.getBoundingClientRect()
  if (!(box.height > 0)) {
    if (typeof (el as any).scrollIntoView === 'function') (el as any).scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    return
  }
  const dy = scrollToShow(box, pageTop(under), pageBottom())
  if (dy && typeof window.scrollBy === 'function') window.scrollBy({ top: dy, behavior: 'smooth' })
}
