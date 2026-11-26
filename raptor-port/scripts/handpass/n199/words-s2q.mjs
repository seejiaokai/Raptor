// words-s2q - every sentence the three section 2 questions draw (chat 199, 26 Nov 26), held once. Drafts (Opus) for a
// fresh Fable's read before he sees them (D2441), save B's, which are the app's own words today (undo/timeline.ts
// OUT_OF_BAND, the words masterRightRefusal's outOfBandWords answers where it names nobody - his D2730 Q11).
export const WQ = {
  // ---- A: a Plan holder where he may no longer make an admin (D2730 Q8). Pattern: the approved Plan reason
  //      "Only 149's own admins or a master admin can give or end Plan of 149." (n176/words.mjs planGreyed)
  roleReason: n => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`,          // recommended
  roleReasonAlt: n => `Only ${n}'s own admins or a master admin can make him an admin.`,           // the alternative wording
  roleRefused: n => `Blocked: only ${n}'s own admins or a master admin can make an admin of ${n}.`, // the other choice: Save refused
  roleChoices: ['Member', 'Admin', 'Master admin'],                                                   // the Role box's own three (ui/UserAccess.tsx RoleBox)
  // ---- B: today's words, unchanged (no new words)
  undoRefused: 'Something else changed this after your action — it can’t be undone now.',
  // ---- C: the bell line when Plan ends by an archive, an overseas posting, a delete or the master mark - the approved
  //      shape "Plan of 149 ended" + ": <why>" + " · <who pressed>" (unsigned where the app ran it on its date)
  planEndArchived: n => `Plan of ${n} ended: archived`,              // signed · <the admin who archived him>
  planEndOverseas: n => `Plan of ${n} ended: posted overseas`,       // signed where Post out ran it at once; unsigned on its date
  planEndDeleted: n => `Plan of ${n} ended: deleted`,                // signed by the delete's presser; unsigned where a posting's Delete ran on its date
  planEndMaster: n => `Plan of ${n} ended: master admin covers every squadron`,   // his own bell's ruled words (D2396 (n)), signed · <the master admin>
}
