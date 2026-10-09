/* The words and small date sums Days and "Every <weekday>" share (ui/DaysWindow.tsx, ui/EveryWeekday.tsx) — one place,
   so the two windows say a date and a class the same way. Pure: no store, no screen. */
import { addDays, weekdayOf, type FlyCls } from '../state/flyplan-model'

export const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const WD_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
/** the words a class is said in — to a screen reader, and in the phone button's "tap for …" */
export const SAY: Record<FlyCls, string> = { day: 'day flying', night: 'night flying', nf: 'no fly', none: 'no flying set' }

/** today's own date, local time — the viewer's day, as the Inputs calendar's Today has it */
export const isoToday = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
/** "Mon 2 Nov" */
export const sayDate = (iso: string): string => `${WD[weekdayOf(iso)]} ${+iso.slice(8, 10)} ${MONTHS[+iso.slice(5, 7) - 1].slice(0, 3)}`
/** "Mon 2 Nov 2026" */
export const sayDateY = (iso: string): string => `${sayDate(iso)} ${iso.slice(0, 4)}`
/** the first such weekday (0 = Monday) on or after a date — the date itself, when it is one */
export const firstWeekdayFrom = (wd: number, iso: string): string => addDays(iso, (wd - weekdayOf(iso) + 7) % 7)
