// WHO MAY DO WHAT ON THE LEAVE WAR — the pure half of the war's permissions. The store asks these at every write, the
// grid at every affordance, so a control drawn and the write it makes cannot disagree.
//
// Replaces the stage rules (owner, D1177, 21 Oct 26: "the Leave War's stages — draft, open for bidding, bidding closed,
// published — go"). What hung on the stage, and the rule each now follows (the build plan §3, batch 1; D1177's full
// row and the narrowed D418, D333, D352):
//   - a bid: a member only on his own row, on an OPEN day of the period holding that date, never before today (D1211);
//     an admin on any row, any day;
//   - a decision: the admin, at any time (D1177 — the old draft refusal went with the draft);
//   - approved leave: never frozen — the admin puts it back, moves or deletes it at any time ("published = finished
//     paperwork" went with the published stage); a member adds its remarks at any time and changes the leave itself on
//     the Inputs page (D418 narrowed, D1166);
//   - a member's own pending bid on a day since closed: he may delete it (D1225), never add or change one there;
//   - a member moves his own pending bid only while its days — where it is and where it lands — are open (D333 narrowed).
// Undo of opening or closing dates is the store's (the `lw.open` command — D352 narrowed).

import { isOpenOn } from './opendates'
import type { Period } from './period'

/**
 * Two roles, per the spec's §Roles. The scheduler and management both hold the admin account (D1223: the URHO who
 * runs the war is given one too — no war-only role).
 */
export type Role = 'member' | 'admin'

/**
 * Whether this role may write THIS DAY — the day half of a bid's permission (the row half is `canEditRow`).
 *
 * `period` is the period HOLDING `date`, never the one on screen (the red team's B3: a range 30 Dec – 5 Jan asked the
 * period on screen and wrote five days into the next period); null — a day no period holds — is never writable.
 *
 * **An admin is bound by neither the open dates nor today.** The open dates stop the squadron bidding where the
 * schedule has not reached or where the admin is deciding; they are not a lock on the people running the war.
 */
export function canEditCell(period: Pick<Period, 'open'> | null | undefined, role: Role, date: string, today: string): boolean {
  if (!period) return false
  if (role === 'admin') return true
  return date >= today && isOpenOn(period, date)
}

/**
 * Whether this role may write THIS PERSON'S row.
 *
 * A member edits only their OWN row — the SIGNED-IN person, which the war mirrors into `viewer` (since [ACCOUNTS],
 * 26 Sep 26 — D166 (4)). An admin edits any row. Checked at the store's write path as well as the grid's affordance:
 * the interface hiding a control is not the store refusing the write.
 *
 * `viewer === null` means the session is not scoped to any person — the raw-store / test state; production always
 * mirrors the signed-in person (or '' — no row — for someone signed in without access) before the grid renders.
 */
export function canEditRow(role: Role, viewer: string | null, personId: string): boolean {
  return role === 'admin' || viewer === null || personId === viewer
}

/** WHO MAY DECIDE A BID: the admin, at any time (D1177's reading; D418 narrowed — "the admin decides bids at any time
 *  once the stages go"). A member watching the same screen sees the outcome, not the buttons. */
export function canDecide(role: Role): boolean {
  return role === 'admin'
}
