/* THE POSTING'S ONE LINE — what the chosen outcome does on the date (OutcomeChips.tsx's head comment says the row and its
   rulings), moved here so that file exports only its component (React's quick reload keeps a component's state only in a
   file of components). */
import type { PostOutcome } from '../engine'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/* "14 Oct" — the approved line's own date voice */
const dayMon = (iso: string): string => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]}` : '')
/* THE ONE LINE — what the chosen outcome does on the date (D300's words, the approved picture); '' with no date */
export function outcomeLine(outcome: PostOutcome, poDate: string, hasAccount: boolean): string {
  const day = dayMon(poDate)
  if (!day) return ''
  switch (outcome) {
    /* "archived", no longer "archived on Quals": Quals lost its archive to Admin → Users (D310, [ONE-DOOR]) */
    case 'overseas': return `On ${day}: archived${hasAccount ? ', account suspended' : ''}.`
    /* his D1105 (21 Oct 26 — "Perhaps it should show auto delete", then "A"): the Delete says the app does it by itself
       on the date; the button stays "Delete" (D298) — [PO-AUTO-DELETE-WORDS] */
    case 'delete': return `On ${day} the app deletes him automatically${hasAccount ? ', with his account' : ''}. Days he flew keep his puck.`
    case 'sans': return `On ${day}: becomes SANS.`
    default: return `On ${day}: off the manpower, nothing else.`
  }
}
