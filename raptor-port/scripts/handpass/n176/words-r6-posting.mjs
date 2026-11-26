// words-r6-posting.mjs - every word round 6's posting-sheet drawings put on screen (chat 188's fresh Fable through the
// design skill, 26 Nov 26; brief docs/superpowers/briefs/2026-11-26-msq-r6-posting-sheet-brief.md; his D2648). Drafted by
// the drawer; a SECOND fresh Fable reviews them before he sees them (his D2441) - the host then edits THIS file and
// draw-r6-posting.mjs is re-run, so no drawing carries a word of its own.
// APP = the app's own word today, kept as it is. R6 = already in round 6's words (words-r6-users.mjs), reused unchanged.
// NEW = first drawn here. The redesign changes the look and the layout, not the words: only ONE word is new.
export const WP = {
  // ---- the sheet's head, after his callsign (today the head reads the day pressed, "Mon 14 Dec")
  titleOut: 'Post out',                                                // R6 (W6.sheetTitle); also APP - the ⋯ menu's own row
  titleIn: 'Post in',                                                  // NEW as a head; APP as the ⋯ menu's row and the button
  // ---- the labels
  from: 'PO from',                                                     // APP (drawn in capitals by the label's look)
  fromIn: 'PI from',                                                   // APP
  posting: 'Posting',                                                  // APP
  to: 'To',                                                            // R6 (W6.sheetTo)
  // ---- the four outcomes
  overseas: 'Overseas Sqn', del: 'Delete', sans: 'SANS', transfer: 'Transfer to Sqn',   // APP (D294, D298)
  // ---- the one line of what happens (D300)
  transferLine: (d, n) => `On ${d}: moves to ${n} with his sign-in.`,  // R6 (W6.transferLine, Cinch holds no rights elsewhere)
  // every other outcome's line is read off the real sheet as the app writes it (APP):
  //   "On 14 Dec: archived, account suspended." / "On 14 Dec the app deletes him automatically, with his account. Days he
  //   flew keep his puck." / "On 14 Dec: becomes SANS." / "On 14 Dec: off the manpower, nothing else."
  // Post in's note is read off the real sheet too (APP): "Their first day in the squadron. Days before it are blank and
  //   count nobody — leave can still be dated there."
  // ---- the buttons
  postOut: 'Post out', postIn: 'Post in',                              // APP
  cancel: 'Cancel',                                                    // APP (Admin → Users' own row-foot Cancel; direction C's row only)
  rowPostOut: 'Post out…',                                             // R6 (W6.postOutBtn) - the row's button on Admin → Users
}
