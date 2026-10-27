/* A DAY BROUGHT INTO VIEW AND RINGED (the overhaul's M4 — 8.5: a request's dates in Approvals; 9.6: a tap on the bell's
   Leave War line). The grid lands the date (store.ts focusDay — the one jump, clear of the frozen columns), and the man's
   cell on it wears the app's ONE just-added mark (D860 — the plain blue ring, no glow) for about six seconds.

   The ring is VIEW STATE, kept outside the person rows' memo (docs/performance.md §E): a class put on the one cell for six
   seconds, never a repaint of the grid. The cell exists only once its month is drawn, so it is looked for over a few
   frames after the jump. Then the page is scrolled up or down, only as far as needed, so the cell stands clear of the
   grid's frozen top and the slim bar at the foot (§7.11 lesson 5 — what is brought into sight must not land under a bar).
   Nothing is saved. */
import { focusDay } from '../state/store'

const RING_MS = 6000
let timer: ReturnType<typeof setTimeout> | null = null
let ringed: HTMLElement | null = null

function clearRing(): void {
  if (timer) { clearTimeout(timer); timer = null }
  if (ringed) { ringed.classList.remove('lw-ring'); ringed = null }
}

/** Bring this man's day into view on the grid and ring his cell. `bar` — the height kept clear at the foot (the slim bar). */
export function ringCell(personId: string, date: string, bar = 0): void {
  clearRing()
  focusDay(date)
  let tries = 0
  const look = () => {
    const cell = document.querySelector<HTMLElement>(`[data-testid="cell-${personId}-${date}"]`)
    if (!cell || cell.getBoundingClientRect().width === 0) {
      if (++tries < 40) requestAnimationFrame(look)
      return
    }
    /* up or down, only as far as needed: below the grid's frozen header, above the slim bar */
    const r = cell.getBoundingClientRect()
    const head = document.querySelector<HTMLElement>('#page-leavewar .lw-thead, #page-leavewar thead')
    const top = Math.max(120, head ? head.getBoundingClientRect().bottom + 8 : 120)
    const bottom = window.innerHeight - bar - 16
    if (r.top < top) window.scrollBy(0, r.top - top)
    else if (r.bottom > bottom) window.scrollBy(0, r.bottom - bottom)
    cell.classList.add('lw-ring')
    ringed = cell
    timer = setTimeout(clearRing, RING_MS)
  }
  requestAnimationFrame(look)
}
