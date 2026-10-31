/* THE BID WINDOWS' PLAIN HELPERS — moved out of BidBits.tsx so that file exports only its components (React's quick reload
   keeps a component's state only in a file of components): the "Approve what I enter" memory's key and read, and the drag
   window's short dates. BidBits.tsx's head comment still describes each. */

import { getState } from '../state/store'

/** the key his choice is kept under — per person on the device (one admin's choice is never another's) */
export const approveKey = (viewer: string | null | undefined) => `lw:approve:${viewer || '-'}`   // '-': an admin with no row of his own on the war (D1223's URHO) keeps it for the device

/** the admin's "Approve what I enter", as last left on this device (on where he never changed it — D1186) */
export function readApprove(viewer = getState().viewer): boolean {
  try { return localStorage.getItem(approveKey(viewer)) !== 'off' } catch { return true }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "9–11 Nov" (one month), "30 Nov – 2 Dec" (one year), "30 Dec 26 – 2 Jan 27" (across a year's end, where only the year
 *  tells the span from its mirror); one day reads "9 Nov". The window's own title — the one-day window's "Tue 3 Nov"
 *  carries no year either. */
export function compactSpan(from: string, to: string): string {
  const d = (iso: string) => Number(iso.slice(8, 10))
  const m = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1]
  if (from === to) return `${d(from)} ${m(from)}`
  if (from.slice(0, 4) !== to.slice(0, 4)) return `${d(from)} ${m(from)} ${from.slice(2, 4)} – ${d(to)} ${m(to)} ${to.slice(2, 4)}`
  if (from.slice(0, 7) === to.slice(0, 7)) return `${d(from)}–${d(to)} ${m(to)}`
  return `${d(from)} ${m(from)} – ${d(to)} ${m(to)}`
}
