// words-q22 - every sentence question 22 draws, held once, copied character for character from the card
// docs/superpowers/briefs/2026-11-27-msq-s2-questions-card-22.md (straight apostrophes as written there).
export const W22 = {
  // 22A - the last-admin note, a squadron with no admin of its own (Kestrel holds 151 by Plan only)
  lastA: 'Kestrel is 151\'s last admin. Only a master admin can make another.',                               // recommended
  lastB: 'Kestrel is 151\'s last admin. Only 151\'s own admins or a master admin can make another.',          // the other choice
  // 22B - note 5 under "What each role allows"
  note5A: 'Only a master admin makes squadrons or master admins. Only a squadron\'s own admins or a master admin can give Plan of it or make its admins.',   // recommended
  note5B: 'Only a master admin makes squadrons or master admins. Plan of a squadron is given by its own admins or a master admin.',                          // approved words
  // the greyed "Admin" in the Role box's one grey line (question 13's approved drawing, n199 words-s2q roleReason)
  roleReason: n => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`,
}
