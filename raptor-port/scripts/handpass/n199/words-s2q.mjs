// words-s2q - every sentence section 2's three questions draw, held once. Questions 13, 14 and 15 on the one questions
// page (first written as 10-12; renumbered 26 Nov 26, the coordinator's word). Opus drafted them (chat 199); a fresh
// Fable reviewed and adjusted them (D2441) - its final column is the one used here, word for word:
// docs/superpowers/briefs/2026-11-26-msq-s2-questions-words-review.md §1. New words (B's sentence, the last-admin line)
// are his to approve on the cards.
export const WQ = {
  // ---- 13: a Plan holder where he may no longer make an admin (D2730 Q8). Pattern: the approved Plan reason
  //      "Only 149's own admins or a master admin can give or end Plan of 149." (n176/words.mjs planGreyed)
  roleReason: n => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`,          // recommended: under the Role box
  // The other choice: the Save refused. A refused Save on Admin → Users today is the amber passing note with the bare
  // sentence and no "Blocked:" (ui/UsersPanel.tsx done → HOOKS.toast(bad, 'warn'), the last-admin refusal's own look),
  // so the words are the bare sentence, exactly the line above (the review §1 row 3, §3 point 3; chat 199's prep).
  roleRefused: n => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`,
  // The review's "Blocked:" form, kept only in case the builder takes the guard rail's grey note instead - not drawn.
  roleRefusedBlocked: n => `Blocked: only ${n}'s own admins or a master admin can make an admin of ${n}.`,
  roleChoices: ['Member', 'Admin', 'Master admin'],                                                   // the Role box's own three (ui/UserAccess.tsx RoleBox)
  // The last-admin line to one who cannot make an admin of that squadron (his D2246, today's state/accounts.ts lockWords
  // tail "Only a master admin or an admin of 149 can make another."). Q8 makes it untrue for a Plan holder (he IS "an
  // admin of 149" there yet cannot make one), so the review rewords it - owed his yes, rides on card 13.
  lastAdmin: (cs, n) => `${cs} is ${n}'s last admin. Only ${n}'s own admins or a master admin can make another.`,
  // ---- 14: his Undo of his own "made a member" refused. Today's Undo sentence (undo/timeline.ts OUT_OF_BAND) is NOT
  //      true here - nothing changed after his Save - so the review drafts a new one (his to approve). Today's is kept
  //      only to be quoted on the card, never drawn.
  undoRefusedPlan: n => `Only ${n}'s own admins or a master admin can make an admin of ${n}, so this can’t be undone.`,
  undoToday: 'Something else changed this after your action — it can’t be undone now.',
  // ---- 15: the bell line when Plan ends by an archive, an overseas posting, a delete or a master admin's making - the
  //      approved shape "Plan of 149 ended" + ": <why>" + " · <who pressed>" (unsigned where the app ran it on its date)
  planEndArchived: n => `Plan of ${n} ended: archived`,              // signed · <the admin who archived him>
  planEndOverseas: n => `Plan of ${n} ended: posted out overseas`,   // signed where Post out ran it at once; unsigned on its date
  planEndDeleted: n => `Plan of ${n} ended: deleted`,                // signed by the delete's presser; unsigned where a posting's Delete ran on its date
  planEndMaster: n => `Plan of ${n} ended: made a master admin`,     // signed · <the master admin> (recommended wording)
  planEndMasterAlt: n => `Plan of ${n} ended: master admin covers every squadron`,   // his own bell's ruled words (D2396 (n)) - the other wording, named on the card, not drawn
}
