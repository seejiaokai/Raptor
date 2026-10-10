1. **Changes required: three findings.** I reproduced the state failures using the live source with React/jsdom and an in-memory backend. These checks do not replace the recorded browser walk. No file was changed, and no other reviewer’s report was opened.

2. **Medium — switching picker targets loses a new note’s words.**  
   **Failure:** Create an existing note. Start another note, type words and press **+ people**. While its picker is open, use the keyboard to activate the existing note’s **+** beneath it. Select someone and press **Add**. The person goes onto the existing note; the new note’s words disappear. **Cancel** also loses those words after the target changes. This happens whenever that sequence is followed.

   **Cause:** In [InputsCal.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:779), the existing note’s `pick` handler overwrites `pickFor` without settling the pending new note. `confirmPick` and `cancelPick` then follow the replacement target, and `shutPick` clears `pickWords`. The picker does not contain keyboard focus.

   **Exact fix:** Put both picker-opening handlers through one guarded opener. If a picker already owns a note, return **before changing any draft or picker state**. Keep keyboard focus inside the picker until it ends, then restore focus to its opener. Add checks that activate an older note’s **+** during a pending new-note picker: Add must still create the intended new note; Cancel must retain its words alone; the older note must remain unchanged.

3. **Medium — a picker survives closing its day and can write afterward.**  
   **Failure:** Start a note, type “Keep these words” and press **+ people**. Reach the day window’s close button by keyboard and activate it. The day closes, but the picker remains. Pressing Cancel or Escape now saves a note onto the closed day; Add can save its words and selected people there. This happens whenever the day closes with an active picker.

   **Cause:** [InputsCal.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:343) `closePop` closes only the day. The picker renders independently of `popIso`, and `finishNewNote` retains the old `pickIso`.

   **Exact fix:** In the common day transition, settle an active picker **before** closing or changing its day. Use the agreed Cancel behavior: retain a new note’s words once, discard unconfirmed people, then clear all picker state and ownership before changing `popIso`. Require Add to belong to the still-active day and picker session. Check day closure and day switching, followed by stale Add/Escape actions: no picker may remain and no later write may occur.

4. **Medium — Undo/Redo leaves the wrong day window open when it covers the change.**  
   **Failure:** Create a note on 14 October, then open 15 October. Undo and Redo correctly remove and restore the note, but the opened window still shows 15 October and contains no changed note. Where that window covers the changed calendar cell, the change remains outside the visible working area. Repeated Undo/Redo preserves this wrong landing.

   **Cause:** [undo-wire.ts](/C:/Users/User/projects/Raptor/raptor-port/src/state/undo-wire.ts:167) `landingOf` selects the directional date but only sets the calendar month. It neither checks nor updates the day held locally by `InputsCal`.

   **Ruling contradicted:** D672: “UNDO AND REDO LEAVE THE SCREEN WHERE IT IS WHEN WHAT THEY CHANGE IS ALREADY IN VIEW; THE SCREEN MOVES TO THE CHANGE ONLY WHEN IT IS OUT OF VIEW.”

   **Exact fix:** Carry the calculated date and changed note/title identity in a calendar reveal request. Consume it in `InputsCal` after restoration. If the changed item is already wholly visible, leave the screen unchanged. Otherwise, when another opened day covers it, repoint that window to the changed date and reload its title/drafts. For a removed item, reveal and outline its day. Add checks for Undo and Redo with another day open, including a covering phone window, month-crossing moves and day titles.

5. Nothing further found in saved-record writers, deduplication, interior-gap preservation, person-delete persistence, or restored record images.

6. Nothing found in old-shape handling for people-only records or words-only records without `ids`.

7. Nothing found in short small print for valid callsigns, other-year stamps, “for N people”, “changed by”, or unstamped records.

8. Nothing further found in card-layout source; I did not perform a new browser geometry check.

9. Nothing further found against the named rulings. The coverage omissions exposed here are picker retargeting, picker ownership across day closure/change, and Undo visibility with another day window open.

Rulings: none this session