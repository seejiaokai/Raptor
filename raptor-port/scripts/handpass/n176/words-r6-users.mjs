// words-r6-users.mjs - every word round 6's Admin → Users drawings put on screen (chat 188, 26 Nov 26; brief
// docs/superpowers/briefs/2026-11-26-msq-r6-users-draw-brief.md). Drafted by the drawer (a fresh Fable); a SECOND fresh
// Fable reviews them before he sees them (his D2441) - the host then edits THIS file and draw-r6-users.mjs is re-run, so
// no drawing carries a word of its own. A key marked APP is the app's own word today, reused; RULED quotes a ruling.
export const W6 = {
  // ---- the block at the top of a squadron's page (D2641)
  fromOther: c => `From other squadrons · ${c}`,                       // heading, in the page's own heading look ("People · 10")
  nobodyOutside: n => `Nobody from another squadron plans or views ${n}.`,   // the block with nobody in it (the look of "Nobody is waiting for access.")
  viewOnly: c => `▸ View only · ${c} ${c === 1 ? 'person' : 'people'}`,        // the fold, in the folded headings' look
  // ---- a short row's second line: seat · CAT, then his role in words, then what he holds of the squadron in view
  roleAdmin: 'admin',                                                  // the brief's "Pilot · CAT IP · admin"; a member and a man with no sign-in add nothing
  roleMaster: 'master admin, full access',                             // a master admin of another squadron
  alsoPlans: n => `also plans ${n}`,                                   // APP (today's row words)
  alsoViews: n => `also views ${n}`,                                   // round 5's words (words.mjs alsoViews)
  // ---- Incoming and Outgoing (D2643)
  incoming: c => `Incoming · ${c}`,
  outgoing: c => `Outgoing · ${c}`,
  postingIn: d => `posting in ${d}`,                                   // APP (the row's amber tag today: "posting in 19 Oct")
  postingOutTo: (d, n) => `posting out ${d} · to ${n}`,                // APP's shape ("posting out 14 Oct · Overseas Sqn"), its last part new
  undoPostOut: 'Undo post out',                                        // APP's Leave War button reads "Undo post out (PO)"; "(PO)" left off here
  // ---- the folded squadrons (D2629, RULED shape)
  folded: (n, c) => `▸ ${n} · ${c} people`,
  // ---- E8's way across (round 5)
  editOn: n => `Edit on ${n} →`,
  // ---- posting out from Admin → Users (D2634)
  postOutBtn: 'Post out…',
  sheetTitle: 'Post out',                                              // the sheet's head, after his callsign
  sheetTo: 'To',                                                       // the new line's label, beside "PO from" and "Posting" (APP)
  transferLine: (d, n) => `On ${d}: moves to ${n} with his sign-in. His View and Plan of other squadrons end.`,   // the sheet's one line, in the shape of APP's "On 14 Dec: archived."
  // ---- asking for a man (new - needs his word)
  askPost: n => `Ask ${n} to post him here`,
  askBell: n => `${n} asks you to post him there`,                     // the line his squadron's admins get; the asker's name follows, as every line's signer does
  // ---- the two captions on the picture that puts both pages side by side (the picture's words, not the app's)
  capPage: (n, who) => `${n}'s page · ${who}`,
}
