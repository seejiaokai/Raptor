// words.mjs — every word the chat-176 drawings put on screen that no ruling has fixed ([MSQ-PICK-GUARD], 25 Nov 26).
// Drafted by the host (Opus); a fresh Fable reviews them (his D2441) — the host then edits THIS file and the drawer's
// scripts are re-run, so no drawing carries a word of its own. A key marked RULED quotes a ruling's own words.
export const W = {
  // D2626 — the greyed Plan button's reason, for one who may not give Plan of the squadron in view (draft in the ruling)
  planGreyed: n => `Only ${n}'s own admins or a master admin can give Plan of ${n}.`,
  // D2626 — the bell line to every admin of the squadron when Plan of it is given or ended (host's drafts)
  planGivenLine: { who: 'Hunter', words: n => `Given Plan of ${n}`, by: 'Kestrel' },
  planEndedLine: { who: 'Hunter', words: n => `Plan of ${n} ended`, by: 'Kestrel' },
  // D2628 C3 — "+ Commitment" greyed on a squadron with no SANS aircrew (draft in the ruling)
  noSansAircrew: n => `${n} has no SANS aircrew.`,
  // D2628 C7 — RULED
  badgeViewOnly: who => `${who} · View only`,
  // D2627 A6 — the Add a person note (draft in the ruling)
  addPersonNote: n => `Blocked: add the person or cancel, then pick ${n}.`,
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
}
