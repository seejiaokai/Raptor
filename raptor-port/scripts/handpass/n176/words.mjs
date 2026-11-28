// words.mjs — every word the chat-176 drawings put on screen that no ruling has fixed ([MSQ-PICK-GUARD], 25 Nov 26).
// Drafted by the host (Opus); a fresh Fable reviews them (his D2441) — the host then edits THIS file and the drawer's
// scripts are re-run, so no drawing carries a word of its own. A key marked RULED quotes a ruling's own words.
export const W = {
  // D2626 — the greyed Plan button's reason, for one who may not give Plan of the squadron in view (draft in the ruling)
  // (fresh Fable, 25 Nov: "give or end" — a Plan already held is locked for him too)
  planGreyed: n => `Only ${n}'s own admins or a master admin can give or end Plan of ${n}.`,
  // D2626 — the roles table's note 5, today "Only a master admin makes squadrons, gives Plan or makes a master admin." (Fable's words)
  rolesNote: 'Only a master admin makes squadrons or master admins. Plan of a squadron is given by its own admins or a master admin.',
  // D2626 — the app's own endings on the admins' bell (Fable): "…ended: he moved to 150"; ended from outside by being made a member
  planEndedMoved: (n, to) => `Plan of ${n} ended: he moved to ${to}`,
  planEndedMember: n => `Plan of ${n} ended: made a member`,
  // D2626 — the bell line to every admin of the squadron when Plan of it is given or ended (host's drafts)
  planGivenLine: { who: 'Hunter', words: n => `Given Plan of ${n}`, by: 'Kestrel' },
  planEndedLine: { who: 'Hunter', words: n => `Plan of ${n} ended`, by: 'Kestrel' },
  // D2628 C3 — "+ Commitment" greyed on a squadron with no SANS aircrew (draft in the ruling)
  noSansAircrew: n => `${n} has no SANS aircrew.`,
  // D2628 C7 — RULED
  badgeViewOnly: who => `${who} · View only`,
  // D2627 A6 — the Add a person note (draft in the ruling)
  // (fresh Fable, 25 Nov: its sibling's shape, both verbs the form's buttons)
  addPersonNote: n => `Blocked: add or cancel the new person, then pick ${n}.`,
  // D2628 C11 — RULED
  addButton: '+ Add a person', addSave: 'Add person', addCancel: 'Cancel',
  // D2629 — RULED shape "▸ 142 · 38 people"
  folded: (n, c) => `▸ ${n} · ${c} people`,
  // D2632 / D2633 — a fresh Fable's words (briefs/2026-11-25-msq-c6-words-fable-report.md), not yet his
  archivedNote: (n, who, seat, cat, date) => `${n} has an archived ${who}: ${seat}, CAT ${cat}, archived ${date}. Is this him?`,
  archivedMany: who => `More than one archived man is called ${who}. Is this one of them?`,
  someoneNew: 'Someone new: add him',
  askAdmin: n => `If this is him, ask ${n}'s admin`,
  someoneNewLine: (n, who) => `${n} added a new ${who}. Delete yours if he has left flying for good`,
  taken: (who, n) => `${who} is already taken on ${n}`,
  // ---- round 5 (chat 187, 25 Nov 26): settled by a second fresh Fable (briefs/2026-11-25-msq-q3-r5b-words-fable.md),
  // copied from the redraw brief's "Words" section exactly; the keys above stay as the first way's pictures drew them
  alsoViews: n => `also views ${n}`,                                   // item 2: a View holder's closed row "Pilot · CAT IP · also views 149"
  noSignInOpened: n => `No sign-in. Ask ${n}'s admin to give him one first.`,   // item 2: a no-sign-in man opened (Cancel only)
  plannedByName: (who, n) => `${who} · ${n}`,                          // item 5: "Hunter · 142", "Saber · 142" in the browser's list
  someoneNewR5: 'Someone new',                                         // items 6 and 8: the button answering "Is this him?"
  answerFirst: 'Answer “Is this him?” first.',               // item 8: under the greyed "Add person"
  newOneTold: (who, n) => `A new ${who}. ${n}'s admins are told when you add him.`,   // item 8 (e6a2)
  newOneToldTwo: (who, a, b) => `A new ${who}. ${a}'s and ${b}'s admins are told when you add him.`,   // item 6 (e6b2)
  // item 6: each archived man one line in e6a's note's shape (item 6's own words), the question left to the line above
  archivedLine: (n, who, seat, cat, date) => `${n} has an archived ${who}: ${seat}, CAT ${cat}, archived ${date}.`,
}
