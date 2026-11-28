// words-r6-misc.mjs - every NEW word round 6's misc drawings (chat 188, 26 Nov 26) put on screen. Drafted by the Opus
// drawer; a fresh Fable reviews them before he sees them (his D2441) - the host then edits THIS file and the scripts are
// re-run, so no drawing carries a word of its own. Words already settled (round 5's ./words.mjs) are imported, not copied.
export { W } from './words.mjs'
export const W6 = {
  // D8 (D2632, D2633, D2643) - the two answers under "Is this him?" on 149's Add a person form
  itsHim: "It's him",                                  // the answer D2632 names ("it's him"), as a button
  // D8 b - after "It's him": the form folds shut, nothing added; the app's passing note says
  askedNote: (who, from, to) => `Asked ${from}'s admins to restore ${who} and post him to ${to}. Nothing is added yet.`,   // (second fresh Fable, 26 Nov: "restore", the app's word and the button's, not "bring back")
  // D8 c - the line on 142's admins' bell: the man's name in the line's name place, then these words, then "· Kestrel"
  askLine: to => `Restore him and post him to ${to}?`,
  // D8 c - what the tap opens: Jester's archived row on 142, the request said above its buttons
  askRowNote: (asker, to) => `${asker} of ${to} asks you to restore him and post him to ${to}.`,   // (second fresh Fable: "have him back" read as if he had been 149's; the two verbs are the button's)
  restoreAndPost: to => `Restore and post to ${to}`,   // the row's new main button
  // D8 d - the Leave War's own posting sheet, Transfer to Sqn chosen: the new "To" row and the sheet's one line
  toLabel: 'To',                                       // the row's label, in the sheet's own small capitals
  transferLine: (date, from, to) => `Restored on ${from} now. On ${date}: moves to ${to}.`,   // (second fresh Fable: the restore is at the press, not on the date; "On <date>: moves to <n>" is the users sheet's shape)
  // D12 - the empty first line of the app's own drop-down (today's sign-off boxes' own words, reused for the Person box)
  noName: '— name —',
}
