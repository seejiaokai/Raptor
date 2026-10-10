1. **Roll-call’s gaps**

   1.1. **Reading key:** YES means the path is connected in the source, not that its running screen passed. MISSING identifies absent handling. The scenarios below were not executed. Paths are relative to `raptor-port/`. No files were changed.

   1.2. **Inputs opened day — YES.** `src/ui/InputsCal.tsx` draws words, people, or both, and uses compact attribution on input cards. The unwalked risks are keyboard creation, overlapping edits, crowded notes and shared-input cards.

   1.3. **Inputs month — YES.** `InputsCal.tsx` draws a note’s words and people from the same saved record. Both representations can start a whole-note move through `src/ui/caldrag.ts`. Walk both starting points: a move must carry words and people together.

   1.4. **SANS opened day — YES; running coverage missing.** `src/ui/SansDay.tsx` uses the compact footer. Its “not counted” reason, expanded LATE explanation and long remarks introduce wrapping that the existing compact-card test does not exercise.

   1.5. **Medical calendar — NO-because it does not draw planning notes.** `src/ui/MedicalView.tsx` uses the calendar helper for date selection, not the planning-note display. Medical cards retain full attribution. No note conversion is missing there.

   1.6. **List, input editor and document viewer — NO-because compact attribution applies to the two opened-day views.** `src/ui/InputsPage.tsx`, `src/ui/inputedit.tsx` and `src/ui/DocViewer.tsx` retain full attribution. The List lists inputs, not planning notes.

   1.7. **Counts and search — NO-because their scope remains inputs.** `InputsCal.tsx` counts inputs separately from notes; its day announcement can therefore say “no inputs” on a day containing notes. Input searches and filters do not search or hide planning notes. That is existing scope, not evidence of a missed conversion.

   1.8. **Changes window and readable history — MISSING for note changes.** `src/state/changelines.ts` does not turn `plan` changes into readable lines, including note Undo/Redo. `src/state/changebatch.ts` retaining the underlying saved change is not the same as explaining it on screen. The concrete deletion case is scenario 2.3; ordinary note-history requirements should not be invented from this gap alone.

   1.9. **Undo/Redo record and label — YES; destination incomplete.** `src/state/sched-commit.ts` restores the complete note, and `src/undo/describe.ts` calls it “a note on the calendar.” However, `src/state/undo-wire.ts` selects Inputs Calendar without selecting the note’s month or revealing its day. Scenario 2.5 checks the resulting invisible restoration.

   1.10. **Saved weeks and loaded versions — NO-because notes are global calendar records.** `src/state/store.ts` excludes planning notes from the week snapshot. Switching weeks or loading a schedule version should leave current notes alone. `src/state/history.ts` also contains older whole-snapshot restoration; that compatibility route needs to remain distinct from loading a schedule version.

   1.11. **Saving and reopening — YES.** `src/state/persist.ts` saves each complete note, including words, people, gaps and order. Loading accepts records without checking that they contain words or people; section 3 explains the limit.

   1.12. **Deleting a person — YES for removing their puck; MISSING for explaining that removal.** `src/state/person-delete.ts` handles people on either old or new note shapes and removes a note left empty. It preserves earlier dates. The corresponding readable history line is absent from `changelines.ts`.

   1.13. **Leave War — NO-because planning-note people are not leave requests, absences or awards.** No planning-note reader appeared in the production reference search. Moving a person onto a note must not create a Leave War entry or alter their availability.

   1.14. **Print and export — NO-because these outputs have different scope.** `src/ui/export.ts` exports input rows or schedule data; `src/ui/printpdf.ts` prints schedule reports. Neither exports the planning-note display or compact card footer. These changes do not establish a new note-export requirement.

   1.15. **Bell — NO-because no planning-note notification is connected.** `src/ui/topbits.tsx` handles its existing notification sources, including access requests, reports and OIL questions. Adding somebody to a note does not itself announce anything through the bell.

   1.16. **Member and guest — YES for mutation gates; guest walk missing.** `InputsCal.tsx` hides note editing from members, while `src/state/plan.ts` and `src/state/perms.ts` also refuse unauthorized changes. The existing member walk does not establish what survives signing out, entering guest access or returning through browser history.

   1.17. **Second browser — NO-because demo storage is browser-local.** `src/storage/browser.ts` explicitly provides no sharing; the Sync control in `topbits.tsx` is a demonstration toggle. Two tabs sharing one browser’s storage are a separate concern: each can retain an older in-memory note. Scenario 2.13 checks stale replacement and Undo.

   1.18. **Admin clearing and its count — YES.** `src/ui/inputedit.tsx` clears whole planning-note records and day titles in the selected period, excluding the loaded week. A note containing thirty people still counts as one note, not thirty removed items.

2. **Scenarios to walk, ranked**

   2.1. **Keyboard creation with words and people — admin, desktop.** Open a day, choose `+ Note`, type “Brief at 0800”, then press Tab to reach `+ people` and activate it with Enter. Select two people and confirm. **WRONG:** Tab saves the words and removes the button before it can open, loses focus, or produces separate notes. The new-note blur handler saves immediately; only pointer-down prevents that blur. **Repair if reproduced:** keep the draft alive while focus moves between the new-note controls, and finish it once.

   2.2. **Picker ownership and cancellation — admin, desktop with keyboard.** Create notes A and B. Begin a new note C with words, open its people picker, select somebody, then press Escape. Reopen it and compare Cancel, the cross and clicking outside. Also use Tab/Shift+Tab while the picker is open; if focus reaches B’s pencil, edit B before confirming the picker. **WRONG:** C’s words disappear, B receives C’s people, or confirming changes a different note/day. `InputsCal.tsx` shares one draft value, does not trap picker focus, and handles Escape differently from its other close routes. **Repair if reproduced:** bind draft and target together and give every close route an explicit, consistent outcome.

   2.3. **Delete somebody represented by different note shapes — admin, desktop.** Use dates yesterday, today and tomorrow relative to the real current date. Put the same person on a people-only note and a words-plus-people note; include another person after them to expose gap handling. Delete the person through both confirmations. Inspect all dates, the changes window, history, reload and Undo. **WRONG:** yesterday changes; today/tomorrow retain the person; the survivor shifts into an internal gap; a words-only remainder disappears; an empty note survives; or the removal has no dated history line. The last case is a source-supported gap. **Repair:** record each affected note removal alongside the deletion; retain the existing cutoff and empty-note handling. Deletion itself must remain non-undoable.

   2.4. **Shared card with mixed LATE explanations — admin and member, phone.** File a shared input whose participants do not all have the same LATE state or explanation. Open the day and tap each person’s LATE marker. Repeat with the entire group sharing one explanation. **WRONG:** a tap opens the editor, does nothing, or shows the wrong person’s explanation. In `InputsCal.tsx`, the individual markers are spans with hover titles, whereas the common explanation has a button. **Repair if reproduced:** make each individual explanation reachable by touch and keyboard without opening the card.

   2.5. **Undo into another month — admin, desktop and phone.** Create a combined note in October. Navigate to November, then press the actual top-bar Undo and Redo buttons. Repeat after removing the last person from a people-only note. **WRONG:** the operation succeeds but leaves November displayed with no visible affected item. `undo-wire.ts` selects the calendar but supplies no note date. **Repair:** derive the relevant date from the restored or removed note and reveal it when it is outside the current view. The existing walk calls Undo/Redo directly and cannot establish this behaviour.

   2.6. **Attribution’s difficult forms — admin and member, narrow phone and desktop.** Open newly filed inputs with short, long and absent remarks; include a long custom type, an input filed for someone else, and one subsequently edited by another admin. Include a legitimate previous-year placement. Expand the editor and compare its full attribution. **WRONG:** names or change details vanish, the wrong year disappears, text overlaps, or tapping the footer opens the wrong card. `placedShort` transforms the full sentence, while the existing geometry test covers simpler cases. Fix whichever formatter or wrapping rule causes the reproduced mismatch.

   2.7. **SANS reason plus expanded LATE — admin and member, phone.** Open a busy SANS day containing a “not counted” reason, a long remark and LATE. Expand LATE, scroll to the last person, rotate the phone, then reopen the input. **WRONG:** an explanation covers attribution, the last person becomes unreachable, the footer loses information, or a touch activates its neighbour. `SansDay.tsx` has additional text rows and enlarged LATE hit areas that are absent from the current walk.

   2.8. **Thirty people, long words and a scrolled drag — admin, phone; then member.** Make a note with thirty people and a long unbroken word. Add a second note and several inputs below it. Scroll within the opened day, drag a middle puck onto another slot, then drag one outside its own note. Cancel another drag by closing the day. **WRONG:** the wrong slot changes, scrolling removes a person, dropping over another note transfers them there, adjacent controls fire, or a cancelled drag later changes data. Check Undo and reload. The drag uses screen hit-testing against a scrollable note; CSS-only assertions cannot settle it.

   2.9. **Reorder mixed notes — admin, desktop and phone.** Make words-only A, people-only B and combined C, with a gap in C. Move C above A, then B below C. Undo and Redo using the toolbar, close/reopen the day and reload. **WRONG:** people or gaps attach to another note, another day’s order changes, or the displayed order differs after reload. Section order is saved separately from the people’s slot order.

   2.10. **Move a whole combined note across days — admin, desktop and phone.** Close the day and drag the note from its month-cell words onto another date. Undo; repeat starting from its month-cell people. Include a destination in the adjacent month shown on the grid. **WRONG:** only words or only people move, either representation is duplicated, or Undo returns only half the note. Both drag starts must address the same record in `caldrag.ts`.

   2.11. **Gap, words and duplicate selection — admin, desktop and phone.** On a combined note, remove the second of five people, edit the words, reopen the picker and try selecting an already seated person. Add somebody new; then clear the words. Undo each action individually and reload. Separately create people first and add words with the pencil. **WRONG:** editing closes the gap, somebody appears twice, clearing words removes people, or Undo changes several independent actions together. Existing unit coverage does not establish this entire screen sequence.

   2.12. **Rename, archive, restore and post out — admin, desktop.** Put one person on past and future combined notes. Rename them, archive and restore them, then post them out; inspect the same notes and picker after each action. Reuse the old callsign for a different person where the normal workflow permits it. **WRONG:** existing pucks switch identity, words disappear, or an unavailable person is silently newly added. Also check the Undo button’s disabled explanation: these lifecycle actions must not become globally undoable. Notes store person identifiers, while the picker filters the current roster.

   2.13. **Stale tab, picker and another admin’s Undo — two admins, two tabs in one desktop browser.** Open the same combined note in both tabs. In A, change its words and remove a person. Without refreshing B, add somebody through B’s already-open picker, then try B’s Undo. Reload both tabs. Repeat with A deleting the selected person before B confirms. **WRONG:** B silently restores old words or a removed/deleted person, or its Undo reverses A’s change without refusal. The note is saved as a whole record, and picker confirmation does not revalidate each selected person. Test separate browsers separately; their lack of demo synchronization is not itself this fault.

   2.14. **Week/version loading and Admin clearing — admin, desktop.** Create combined and people-only notes inside and outside the loaded week. Switch weeks, return, and load an older schedule version. Then clear a period containing the off-week notes through Admin, inspect the count, Undo, Redo and reload. **WRONG:** loading a schedule version restores old note contents, clearing splits a note, the count treats people as separate notes, or Undo fails to restore words, gaps and order. These operations use different save and restore routes.

   2.15. **Role change with work still open — admin, then member and guest, phone and desktop.** Leave a new-note draft or people picker open, sign out, and enter as a member; repeat with guest access enabled. Use browser Back and revisit any permitted calendar view. Attempt keyboard activation, right-click and dragging wherever notes remain visible. **WRONG:** the previous admin’s draft saves, their Undo remains available, an editing control survives, or a denied action changes data after reload. This extends the existing member check beyond a fresh, already-settled page.

3. **The saved record**

   3.1. **No normal single-session writer examined creates a new empty note.** `plan.ts` refuses empty creation and refuses removing the last words when no people remain. Removing the last person deletes a people-only note. `person-delete.ts` also deletes a note left with neither words nor people.

   3.2. **Gaps are not emptiness.** An internal empty slot with surviving people is intentional. Trailing empty slots are trimmed. A check must distinguish “no people remain” from “one slot is blank.”

   3.3. **Undo/Redo restores complete images.** `sched-commit.ts` restores the whole record; it does not merge one action’s words with another action’s people. I found no fresh-empty-note route through ordinary Undo/Redo. The person-deletion guard also refuses restoration of a deleted person on or after their cutoff.

   3.4. **Loading and restoration do not enforce the invariant themselves.** `persist.ts` accepts an object-shaped note, and restoration can replay its complete image. Therefore an already empty legacy record can remain stored while `InputsCal.tsx` hides it. That alone is excluded by D56. A fresh valid note becoming empty, or an old shape breaking loading, would qualify.

   3.5. **Two tabs can threaten contents without producing an empty record.** Replacing a newer valid note with an older valid note can lose words or resurrect people, yet both records still satisfy “words or people.” Empty-record testing alone will miss scenario 2.13. Separate browsers do not currently share the demo store.

   3.6. **No remaining production reader found that selects planning-note behaviour using its saved `kind`.** The compatibility field remains in `src/engine/schema.ts`. The `kind` checks in `caldrag.ts` distinguish an input drag from a planning-note drag; they do not distinguish the old note and pucks-row shapes. Old `kind: 'pucks'` records must still be walked through adding words, moving, deleting a person and reopening.

4. **Contradictions with the named rulings**

   4.1. **D337 — missing deletion explanation.** Its line is: **“DELETING A MAN LISTS EVERYTHING THE DELETE TOOK AWAY, ONE LINE EACH, AS BUILT.”** Deleting someone now changes or removes their planning notes, but `changelines.ts` emits no corresponding note line. Scenario 2.3 supplies the concrete case. The required correction is a dated line for each affected note, preserving any surviving words and people.

   4.2. **D148 — stale-tab refusal must be established.** Its line is: **“Undo reverses only the signed-in person's own changes (the list clears at sign-out); it never undoes another person's change, and if someone has since changed the same thing it refuses and says who.”** The browser-local storage boundary does not prove that two tabs sharing storage satisfy this. Scenario 2.13 is required before claiming the rule holds for combined notes; this is an unexecuted risk, not a reported runtime failure.

   4.3. **D695 — the mock still presents a settled choice as open.** Its line is: **“A NOTE MAY HOLD PEOPLE AND NO WORDS … AND THE PENCIL ADDS WORDS LATER.”** The unresolved wording in `docs/mock/note-with-pucks.html` should no longer ask whether people-only notes are allowed. Update the explanatory text to the settled decision; do not ask the owner again.

   4.4. **D701 — the compact-card mock retains superseded questions.** Its line specifies **“THE SHORTER INPUT IS DRAWING B”** and **“A DAY OPENED ON THE SANS CALENDAR IS LAID OUT THE SAME WAY.”** `docs/mock/day-inputs-compact.html` should identify B and SANS parity as decided, rather than leaving those choices open.

   4.5. **D690 is not a build-order finding here.** Although its earlier line says the note job follows the calendar’s “merge live,” D708 explicitly authorizes the separate overnight branch for these two jobs before that merge. Applying D690 without that later ruling would manufacture a contradiction.

   4.6. **Rulings: none this session.**

