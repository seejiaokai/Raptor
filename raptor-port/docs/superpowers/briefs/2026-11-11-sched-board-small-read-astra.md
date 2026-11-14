# The small schedule-and-board fixes — Astra's blind read (11 Nov 26, chat 63)

*(Saved word for word from his final message — `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`; brief `2026-11-11-sched-board-small-read-brief.md`, on `1d2cb16aa`. Blind to the walk and to the fresh Opus reader. Not yet acted on: the next chat reproduces each finding first.)*

**Changes requested: three medium-priority failures remain in the board’s Undo and Redo.** These are code-review findings; I have not reproduced them in a browser.

1. **A pinched board can leave the changed box off screen.**

   On a phone, select the board’s desktop layout, pinch smaller, edit a remark near the top, then scroll down and press Undo. The landing scrolls too little. When enlarged, it can scroll past the box.

   The new landing measures distance at the displayed size but applies it in the scrolling area’s unscaled units. An isolated calculation check confirmed that the same landing succeeds at normal size and misses at both half and double size.

   **Fix:** convert the measured distance using the scrolling area’s scale before applying either scrolling method. The app already has this conversion for pinch scrolling. Check Undo and Redo at both scales, including an already-visible box that must stay still.

2. **Undoing a row reorder supplies no destination.**

   Drag two Common Programme rows into a different order, scroll until that section is out of view, then press Undo or Redo. The order changes, but the new landing cannot bring either row into view.

   The comparison used to choose a destination deliberately gives reorder-only changes no clickable box. An isolated check with two surviving programme rows returned no destination in either direction. This is separate from the accepted limitation for removing a row.

   **Fix:** add destination handling for reorders when preparing the board’s Undo landing. Match the surviving rows by their identities and use their restored positions to select a visible box. Keep the existing changes-list treatment separate. Add checks for both directions.

3. **A changed Personal Input stays hidden inside its folded panel.**

   Edit the remarks of a rejected input under Personal Inputs, leave the box to save it, fold the panel, then press Undo. The remarks are restored, but the panel stays folded and there is no drawn row to scroll to. Redo has the same problem.

   The new landing names the input but does not open its panel. The existing action for tapping a change already performs that preparation.

   **Fix:** after restoring the input, open Personal Inputs on the destination day when that is where its row must appear. Repaint before locating and scrolling to it. Reuse the existing eligibility checks so an unrelated leave or a row already shown on the programme does not open the panel unnecessarily.

I found no additional issue with warning plurals beyond the two excluded places. The changes-window hint follows the same eligibility and folding checks as its clickable lines; the member’s read-only message and “Mark all as seen” remain intact. I found no further concrete failure in the day/week restoration routes or closed-board guards.

The supplied tests do not cover these three failures. I ran isolated checks of destination selection and scrolling calculations, but no test suite or browser walk. I did not open the other reviewer’s report or the walk report. The requested commit matched, and no file was changed.

**Next:** have the builder address these three findings, verify the scenarios in the browser, and return the fixes for review.

**Rulings:** none; read-only review.

**Tidiness:** the changes are needed where they sit, sensibly organised, and clearly explained. The landing’s separation from Undo restoration is useful. Reusing the existing scale conversion and panel-opening checks would prevent those behaviours drifting apart. These recommendations are recorded here only; nothing was changed.

