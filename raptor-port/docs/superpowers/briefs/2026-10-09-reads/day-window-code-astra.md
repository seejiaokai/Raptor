1. **Medium severity — dragging a past note can restore a deleted person to a future plan.** This occurs whenever that sequence is followed and leaves an incorrect saved record.

   **Reproduction:** Create an 8 October note containing “Past briefing” and Hex. Delete Hex on 9 October. Drag the note to 10 October. The move succeeds, and the saved note still contains Hex’s person ID. I reproduced this through the actual delete, drag-command and persistence code using isolated in-memory storage.

   **Cause:** [`commitChipMove`](C:/Users/User/projects/Raptor/raptor-port/src/ui/caldrag.ts:73) delegates directly to [`movePlanPuck`](C:/Users/User/projects/Raptor/raptor-port/src/state/plan.ts:109), which changes the date without checking the people against their deletion dates. The equivalent protection exists for Undo, but this forward move bypasses it.

   **Exact fix:** In `commitChipMove`’s note branch, before `writeInputs`, look up the note in `PLANPUCKS`. Check each nonblank person ID against `PEOPLE`. If a person is deleted and `toIso >= String(person.deletedFrom || '')`, refuse the whole move, return `false`, and show a message naming that person. Preserve the original date, words, people and gaps. Add regression coverage for words-and-people and people-only notes, asserting that refusal leaves both memory and saved storage unchanged; also verify that moving between dates before deletion remains allowed.

   **Ruling:** D299: “A DELETE TAKES HIM OUT OF TODAY AND THE FUTURE; THE PAST KEEPS ITS RECORD OF HIM.” The missing combined check is **delete a person, then move a retained past note forward**. This reproduces with newly created records, so D56 does not exclude it.

2. Nothing else found in saved-record invariants, deduplication or gap preservation. The focused persistence check confirmed that deleting the last person from a people-only note removes its saved row; a note with words retains those words.

3. Nothing found in the specified old record shapes: people-only records and text records without `ids`.

4. Nothing found in the current picker/new-note handling, including keyboard blur, cancellation, competing note controls and closing the day.

5. Nothing found in Undo’s current landing logic for notes, day titles, cross-month moves or changes containing both notes and inputs.

6. Nothing found in shortened attribution for currently permitted callsigns, another year, shared inputs, changed-by forms or missing stamps.

7. Nothing found in the reviewed card-layout rules for LATE information, “not counted” reasons, shared pucks or deletion questions. This was a code review; I did not repeat the recorded browser walks.

8. Nothing further found against the named rulings. No files were changed, and no other reviewer’s report was read.

Rulings: none this session

