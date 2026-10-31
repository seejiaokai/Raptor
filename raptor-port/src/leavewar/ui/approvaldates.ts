/* THE APPROVALS PAGE'S DATES, IN WORDS — the "Pick dates…" chip's span and a request's dates as the list writes them
   (ApprovalsPage.tsx's head comment has the page and its rulings), moved here so that file exports only its components
   (React's quick reload keeps a component's state only in a file of components). */
import { parseCell } from '../engine'

export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const dow = (iso: string) => DOW[new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))).getUTCDay()]
export const dm = (iso: string) => `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}`

/** the "Pick dates…" chip once a span is picked: "13 Jan – 15 Jan"; one day is one day, "13 Jan" (the walk, 27 Oct 26 — it
 *  read "13 Jan – 13 Jan") */
export function rangeWords(from: string, to: string): string {
  return from === to ? dm(from) : `${dm(from)} – ${dm(to)}`
}
/* "Thu 22 – Fri 23 Jan" · "Fri 23 Jan, AM" on a desktop; "22–23 Jan" · "23 Jan AM" on a phone (as drawn) */
export function datesWords(code: string, from: string, to: string, phone: boolean): string {
  const half = parseCell(code)?.portion
  const h = half === 'am' ? 'AM' : half === 'pm' ? 'PM' : ''
  const sameMonth = from.slice(0, 7) === to.slice(0, 7)
  if (phone) {
    const run = from === to ? dm(from) : sameMonth ? `${+from.slice(8, 10)}–${dm(to)}` : `${dm(from)}–${dm(to)}`
    return h ? `${run} ${h}` : run
  }
  const run = from === to ? `${dow(from)} ${dm(from)}` : sameMonth ? `${dow(from)} ${+from.slice(8, 10)} – ${dow(to)} ${dm(to)}` : `${dow(from)} ${dm(from)} – ${dow(to)} ${dm(to)}`
  return h ? `${run}, ${h}` : run
}
