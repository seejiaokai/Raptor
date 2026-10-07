/* A PLAIN CLICK ON A CELL OF THE GRID CLOSES A NON-BLOCKING PANEL (the Inputs / SANS redesign, plan §3.3; owner D641,
   D642 — 7 Oct 26).

   The Leave War's two windows that no longer block the page — the Required panel, and the panel for a picked block of
   people's days — leave the grid behind them live. The plan settles what a press there does: a new DRAG replaces what
   the panel is acting on (the grid's own gesture hands the new pick over), and "a plain click on a cell opens that
   cell's own sheet and closes the panel". This is the second half, once, for both.

   On the document's BUBBLE phase, deliberately: the click a finished drag leaves behind is swallowed at the capture
   phase with stopImmediatePropagation (select.ts swallowNextClick), so it never arrives here — a panel just opened or
   re-aimed by a drag is not closed by that drag's own trailing click. A cell is a `td` of the grid whose id is a
   roster cell's, an event cell's, or one of the four rows' (`cell-`, `event-`, `req-`, `avail-`): the things a click
   opens something on. A press on the month buttons, a heading or the toolbar leaves the panel up. */
import { useEffect, useRef } from 'react'

const CELL = /^(cell|event|req|avail)-/

export function useCloseOnCellClick(onClose: () => void): void {
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      const td = t && typeof t.closest === 'function' ? t.closest('.mx td[data-testid]') : null
      if (td && CELL.test(td.getAttribute('data-testid') ?? '')) close.current()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
