// words-s1 - every word the section-1 drawings (Core, the guard rail) put on screen (chat 191, 26 Nov 26).
// RULED = his ruling's own words (named); REVIEWED = words a fresh Fable already read (named) - never reworded here;
// DRAFT = "draft - owed a fresh Fable review (D2441)". A drawing takes its words only from this file.
const P = n => `then pick ${n}.`
export const S1 = {
  /* the note's two halves (plan §4.6) - RULED unless marked */
  lead: {
    window: 'close the open window',                                   // RULED D2590
    row: 'save or cancel the open row',                                // RULED D2627 A6
    // DRAFT - owed a fresh Fable review (D2441): the reviser's draft for a Tracker window behind its Flow chart tab (1.28)
    infoTab: 'close the open window on the Tracker’s Info tab',
    // DRAFT - owed a fresh Fable review (D2441): the third read's fold, words in Quals' "Add qualification" box (1.30)
    qual: 'add or clear the new qualification',
    // E1, the Calendar's unfinished work - DRAFT - owed a fresh Fable review (D2441): the round-6 page's own drafts (1.27)
    holNew: 'save or cancel the new holiday',
    holChanged: 'save or cancel the changed holiday',
    everyMonday: 'save or cancel “Every Monday”',
    sheet: 'add or cancel the sheet’s holidays',
    // REVIEWED (the fresh Fable words review, 26 Nov - briefs/2026-11-26-msq-sections-words-review.md): "create", as the
    // waiting form's own button reads "Create the 2028 leave period"
    holNoLeave: 'cancel the new holiday, or create its leave period',
    // E1, a settings window with a change - REVIEWED (r5b words review 1, kept: the window's own title, its Save and Cancel)
    inputsSettings: 'save or cancel Inputs calendar settings',
    // DRAFT - owed a fresh Fable review (D2441): its SANS twin, the r5b review's gap 1b, read by no one
    sansSettings: 'save or cancel SANS calendar settings',
    // REVIEWED (the fresh Fable words review, 26 Nov): gap 1a's other wording for a phone, where the settings window lies
    // under the Calendar - the Calendar named first, one "then" only (1.27, the question)
    calThenSettings: 'close the Calendar, save or cancel Inputs calendar settings',
    // DRAFT - owed a fresh Fable review (D2441): the holiday lead joined to the Undo ending - §4.6's rule (with "press Undo
    // again" a row or form lead offers only the way that adds no Undo step), applied to E1's "save or cancel the new holiday"
    holNewUndo: 'cancel the new holiday',
  },
  end: {
    pick: P,                                                           // RULED D2590
    line: 'then press this line again.',                               // RULED D2590
    bell: 'then press the bell again.',                                // RULED D2627 A8
    // REVIEWED (r5b words review 2, kept): the Undo ending; DRAFT as a whole note with its lead (D2654 E7: "a draft")
    undo: 'then press Undo again.',
  },
  note: (lead, end) => `Blocked: ${lead}, ${end}`,
  /* 1.14 - RULED D2628 C11, D2652 N11 */
  addButton: '+ Add a person', addSave: 'Add person', addCancel: 'Cancel',
  /* 1.23 - RULED D2627 A20 (the question of D2318, the member-view wording drawn 24 Nov, p5) */
  chartAsk: 'You have unsaved chart edits on “2026”. Save them before switching to the member view?',
  chartButtons: ['Stay', 'Discard them', 'Save them'],
  /* 1.21 / 1.22 - REVIEWED (round 5's Fable reviews read "150 has no SANS aircrew."; D2655 D11 took it as drawn) - the
     drag's passing note uses the same words, nothing added */
  noSans: n => `${n} has no SANS aircrew.`,
  /* 1.20 (a) the empty Person box's first line - DRAFT - owed a fresh Fable review (D2441): the app's own word for an
     empty choice ("Pick…", Admin → Users' Add a person: PILOT, WSO OR PERSONNEL and CAT) */
  personEmpty: 'Pick…',
  /* 1.20 (b) what Add says with nobody picked - THE APP'S OWN, today's refusal for an input with nobody in it
     (ui/inputedit.tsx commitInput, a 'warn' note, today reached with "Several people" and none picked); nothing new */
  nobodyPicked: 'Pick at least one person',
}
