// The Required rows' names, and how a cell is lifted clear of what is docked at the foot of the screen — shared by the
// one typing box (ui/FlyEdit.tsx, which has the whole story) and the Required panel (ui/ReqPanel.tsx). Kept out of
// FlyEdit.tsx so that file exports only components (React Doctor's only-export-components, D1534).

import { reqRowNames } from '../sync'
import { REQ_NAMES_ORIGINAL } from '../engine'

export type ReqRow = 'req-p' | 'req-w'

/** The Required rows' names as they START — an admin may rename them since D1193 (21 Oct 26, narrowing D668), so a
 *  window that names one reads `reqName` below; the short form is a phone's, shown only while the name is this one. */
export const REQ_NAME: Record<ReqRow, string> = { 'req-p': REQ_NAMES_ORIGINAL.p, 'req-w': REQ_NAMES_ORIGINAL.w }
export const REQ_SHORT: Record<ReqRow, string> = { 'req-p': 'Req P', 'req-w': 'Req W' }
/** a Required row's name as it stands (D1193) */
export const reqName = (row: ReqRow): string => reqRowNames()[row === 'req-p' ? 'p' : 'w']
/** what a phone shows for it: the short form while the name is the one it started with, else the name itself */
export const reqShort = (row: ReqRow): string => { const n = reqName(row); return n === REQ_NAME[row] ? REQ_SHORT[row] : n }

/** UP AND DOWN: scroll the page so `cell` sits clear of whatever is docked at the foot of the screen — the number
 *  pad's top edge, the Required panel's (`floorTop`), or the screen's own foot (null) — and clear of the app's bar at
 *  the head. By the exact distance: "centre it" is not enough on a phone, where the pad takes half the screen (found
 *  by the browser gate: the centred cell sat 6px under the pad). With something docked, ALL FOUR rows are brought
 *  above it where the screen allows: a Required figure is read against the Available one two rows below it. */
export function liftAbove(cell: HTMLElement, floorTop: number | null): void {
  const r = cell.getBoundingClientRect()
  const floor = (floorTop ?? window.innerHeight) - 14
  const foot = floorTop === null ? r.bottom : Math.max(r.bottom, footOfRows() ?? r.bottom)
  const dy = foot > floor ? Math.min(foot - floor, r.top - 64) : r.top < 64 ? r.top - 64 : 0
  if (dy) scrollerOf(cell).scrollBy(0, dy)
}
const footOfRows = () => document.querySelector<HTMLElement>('[data-testid="fly-row-avail-w"]')?.getBoundingClientRect().bottom ?? null
/* what scrolls the grid up and down: the nearest ancestor that scrolls on that axis, else the page itself */
function scrollerOf(el: HTMLElement): { scrollBy: (x: number, y: number) => void } {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY
    if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 1) return p
  }
  return window
}
