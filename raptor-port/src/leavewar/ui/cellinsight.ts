/* ON A PHONE THE TAPPED CELL STAYS IN SIGHT (his D1290; red-team fix A5, the phone half — M3 5.7): a bid window over the
   day it was opened from scrolls the page so that day sits just above the window's top edge. A cell already clear of it
   does not move; the desktop's window blocks nothing (D641), so callers ask only on a phone.

   Two moments call it: the window opening (`Matrix.tsx`, once per day opened — Undo leaves the grid where it is, D672),
   and the window becoming a posting (`BidPicker.tsx`, as Post out or Post in opens — chat 196's find: the posting's sheet
   is taller than the leave's, so it rose over the very day it was opened from, and his D2732 Q3 press on that day landed
   on the sheet).

   Whichever window is shown (chat 197, the three code reads' shared find): the one-day bid window, an existing posting's
   or post-in's window (Matrix opens them from the same tap, so its call reaches them) and the drag window (SelectSheet
   asks for itself, as it opens over one man's days and as it becomes a posting). Only one of them is up at a time. */
import { PHONE_QUERY } from './phone'

const SHEETS = ['bid-picker', 'postout-sheet', 'postin-sheet', 'select-sheet'].map(t => `[data-testid="${t}"]`).join(', ')
export function keepCellAboveSheet(personId: string, date: string): void {
  const cell = document.querySelector<HTMLElement>(`#page-leavewar [data-testid="cell-${personId}-${date}"]`)
  const sheet = document.querySelector<HTMLElement>(SHEETS)
  if (!cell || !sheet) return
  const c = cell.getBoundingClientRect(), w = sheet.getBoundingClientRect()
  if (!c.height || !w.height || c.bottom <= w.top - 4) return
  window.scrollBy(0, c.bottom - w.top + 8)
}

/** the width at which the Leave War takes its phone layout — the one query the Leave War calls a phone (`phone.ts`) */
export const isPhoneWidth = (): boolean => typeof window.matchMedia === 'function' && window.matchMedia(PHONE_QUERY).matches
