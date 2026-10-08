/* IS A ROW ALREADY ON SCREEN? (owner, D672, 8 Oct 26 — "if it's already in view, undo/redo don't need to snap to view.
   Unless it's outside the screen view then it's ok to snap into view").

   The one question the scheduler's pages ask before a landing moves the page (Quals' row, the Inputs list's row; the
   Leave War's grid asks its own sideways twin, leavewar/ui/inview.ts — D670). "On screen" = laid out, and WHOLLY
   between the bottom of whatever is fixed over the page's top and the bottom of the window. Half a pixel is forgiven. */

export interface VBox { top: number; bottom: number; height?: number }
const SLACK = 0.5

/** the pure rule: `top` = where the visible page begins (under the top bar, a stuck heading), `bottom` = the window's foot */
export function boxOnScreen(box: VBox | null, top: number, bottom: number): boolean {
  if (!box) return false
  if (!((box.height ?? box.bottom - box.top) > 0)) return false
  return box.top >= top - SLACK && box.bottom <= bottom + SLACK
}

/** the same, asked of the page: `under` — any further thing stuck over the top of the page (a table's heading), counted
 *  only while it IS stuck there. jsdom lays nothing out (every box is 0 × 0), so there this answers "no" and the caller
 *  moves the page as it always did. */
export function rowOnScreen(el: Element | null, under?: Element | null): boolean {
  if (!el || typeof window === 'undefined') return false
  const bar = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
  let top = Math.max(0, bar)
  if (under) {
    const u = under.getBoundingClientRect()
    if (u.height > 0 && u.top <= top + 1) top = Math.max(top, u.bottom)
  }
  return boxOnScreen(el.getBoundingClientRect(), top, window.innerHeight || document.documentElement.clientHeight)
}
