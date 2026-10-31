/* THE BID WINDOWS' SKIP WORDS — moved out of BidPicker.tsx so that file exports only its components (React's quick
   reload keeps a component's state only in a file of components) */

/* WHY A FILL OR A DELETE SKIPPED DAYS — true for whoever reads it (M1's code read, L2 / F4, both readers): the open dates
   and his today bind a member's fill, never the admin's; a delete is stopped by a decided record or leave filed on the
   Inputs page, never by a closed day (a member deletes his own pending bid there — D1225). Shared by the range fill here
   and the drag-selected block's panel (SelectSheet). */
export function skipWhy(verb: string, role: 'admin' | 'member'): string {
  if (verb !== 'written') return 'already decided, or filed on the Inputs page'
  return role === 'member' ? 'closed for bidding, before today, or already holding leave or a medical' : 'already holding leave or a medical'
}
