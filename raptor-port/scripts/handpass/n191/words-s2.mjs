// words-s2.mjs - every on-screen word section 2's drawings (chat 191, 26 Nov 26) add that round 5's and round 6's reviewed
// word files (n176/words.mjs W, words-r6-users.mjs W6, words-r6-nav.mjs WN) do not already hold. Drafted by the drawer (a
// fresh Fable). EVERY KEY NOT MARKED "APP" OR "PLAN" IS A DRAFT - OWED A FRESH FABLE REVIEW (D2441) before he sees it; the
// host then edits THIS file and the draw-s2*.mjs scripts are re-run, so no drawing carries a word of its own.
//   APP   the app's own word today, reused unchanged
//   PLAN  written in the build plan (§19) or a ruling as a draft - still owed its fresh Fable review (D2441)
export const WS = {
  // ---- 2.7: nothing matches the search anywhere on the page
  nobodyMatches: 'Nobody matches.',                                     // APP (Admin → Users today, under "People")
  // ---- 2.23: Outgoing rows the first build can already show - the amber tag's last part is the app's own outcome word
  postingOutOverseas: d => `posting out ${d} · Overseas Sqn`,            // APP
  postingOutSans: d => `posting out ${d} · SANS`,                        // APP
  postingOutDelete: d => `posting out ${d} · auto delete`,               // APP (his D1105: a Delete still to come reads "auto delete")
  postingIn: d => `posting in ${d}`,                                     // APP
  // ---- 2.2: the new Admin card (section 3's page; round 5's words, e3g)
  displayCard: ['Display', 'Squadron colours'],                          // PLAN (round 5's drawing e3g) - section 3's words, shown here only in the left column
  // ---- 2.29: the Give access form. REVIEWED 26 Nov (briefs/2026-11-26-msq-sections-words-review.md §2): NO twin - the
  // form shows round 5's reviewed line itself, W.newOneTold ("A new Jester. 142's admins are told when you add him."):
  // its button reads "Add person and give access", and "approve" is a word he took off this form (D309, D310)
  // ---- 2.30 (V-Q2): the callsign note for one who is ALSO an admin of the archived man's squadron (Hunter by Plan; Saber)
  // draft - owed a fresh Fable review (D2441); the question itself is his (never asked)
  bothAcross: n => `If this is him, restore him on ${n} →`,              // KEPT by the review of 26 Nov. the recommended answer: a way straight to his archived row, in the look of "Edit on 142 →"
  bothPlain: n => `If this is him, restore him on ${n}`,                 // the other answer: words only. REVIEWED 26 Nov (no "first", no "142's page", no full stop - as its pair)
  bothAfter: who => `A new ${who}.`,                                     // PLAN §19.4 ("nobody else is told there, so the line after the answer is 'A new Ace.' alone")
  // ---- 2.33: the app's own endings of Plan, on the admins' bell (round 5's words.mjs planEndedMoved / planEndedMember, drafts - E9 l)
  // (taken from n176/words.mjs W, not repeated here)
  // ---- 2.36: Save on another squadron's man whose home squadron changed while his row stood open
  // REVIEWED 26 Nov (the words review §2; longer than the plan's draft, 9 words → 14 - a line for him, its §6 a): the
  // callsign from the row; true only because the row closes at the refusal (the plan §19.2)
  changedWhileOpen: who => `${who}’s row changed while it was open, so nothing was saved. Open it again.`,
  // ---- 2.11: nothing new - the jumps keep round 6's words ("People", "Outgoing", "Incoming", "Others")
  // ---- the captions on a picture that puts two cuts side by side or one above the other (the picture's words, not the app's)
  capTap: 'A tap on the line',
  capLands: n => `opens ${n}'s Admin → Users at his row`,
}
