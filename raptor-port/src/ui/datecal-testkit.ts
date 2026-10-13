/* TEST-ONLY: how a unit test works the app's one date calendar (ui/DateCal.tsx) and its date box (ui/DateBox.tsx) the
   way a person does — open the box, turn to the month, tap the date. A test that once typed a date into the phone's
   own date box is re-expressed through these (the design of record, docs/superpowers/specs/2026-10-13-one-date-calendar.md
   §Notes for the build: "re-expressed to open the calendar and tap a date (never weakened)").
   One floating calendar is up at a time, so its test ids are the plain `dcal-…`; a calendar drawn inside a form is
   given its own prefix by the form. */
import { fireEvent, screen } from '@testing-library/react'

const el = (id: string) => screen.getByTestId(id)

/** the month a calendar is showing, as "2026-11" */
export const calMonth = (tid = 'dcal'): string => el(tid).getAttribute('data-month') || ''

/** turn a calendar to a month by its two arrows (bringing the dates back first, if its lists are open) */
export function calPage(y: number, m: number, tid = 'dcal'): void {
  if (screen.queryByTestId(`${tid}-lists`)) fireEvent.click(el(`${tid}-title`))
  for (let guard = 0; guard < 2400; guard++) {
    const at = calMonth(tid)
    const d = (y * 12 + m) - (+at.slice(0, 4) * 12 + +at.slice(5, 7))
    if (!d) return
    fireEvent.click(el(d > 0 ? `${tid}-next` : `${tid}-prev`))
  }
  throw new Error(`the calendar never reached ${y}-${m}`)
}
export const calShow = calPage

/** the row of a month-and-year list that reads `text` — of the copies a list that goes round holds, the nearest to the
 *  chosen row, which is the one a finger would reach */
export function calRow(which: 'months' | 'years', text: string, tid = 'dcal'): HTMLElement {
  const rows = [...el(`${tid}-${which}`).querySelectorAll<HTMLElement>('[role="option"]')]
  const at = rows.findIndex(r => r.getAttribute('aria-selected') === 'true')
  let best = -1
  rows.forEach((r, i) => { if (r.textContent === text && (best < 0 || Math.abs(i - at) < Math.abs(best - at))) best = i })
  if (best < 0) throw new Error(`no "${text}" in the ${which} list`)
  return rows[best]
}

/** what a date box holds, as the "yyyy-mm-dd" its form is given ('' = none picked) */
export const boxValue = (box: HTMLElement): string => box.getAttribute('data-value') || ''

/** open a date box and tap a date on its calendar — the calendar closes by itself (a tap picks) */
export function pickDate(box: HTMLElement, iso: string): void {
  if (box.getAttribute('aria-expanded') !== 'true') fireEvent.click(box)
  calPage(+iso.slice(0, 4), +iso.slice(5, 7))
  fireEvent.click(el(`dcal-day-${iso}`))
}

/** tap a date on a calendar that is drawn inside its form */
export function tapDay(iso: string, tid: string): void {
  calPage(+iso.slice(0, 4), +iso.slice(5, 7), tid)
  fireEvent.click(el(`${tid}-day-${iso}`))
}
