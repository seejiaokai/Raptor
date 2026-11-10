# The small schedule-and-board fixes — the narrow read of the third and last fix round (11 Nov 26, chat 64)

*(Saved word for word from its final message — a fresh Opus reader that wrote none of it, handed only the commit `2668434f4` and the second narrow read's finding and points it answers (the order §5, "A fix is new code"; round 3, the last). No fault found.)*

**Narrow read of 2668434f4 (round 3): the change is right. I found no fault.**

**What I ran:** `npx vitest run src/ui/boardland.test.ts`, which gave 51 passed. I only read `land`, `drawingsOf`, `roomOf`, `unfoldFor`, `scrollToShow`, `findHistCell` and `findInputCell`, the board's markup, and the browser test's diff. I did not run the browser test.

**(1) Is the rule right and complete? Yes.**
- **Both directions:** `land` is the same code for Undo and Redo, and the unit tests loop over both.
- **Same measure:** every place the step changed is judged by the same `roomOf` that judged the first one. That covers the board's bar, the list's foot, a window standing on the screen's foot on a phone, and each drawing's own scroller. "In view" still means `scrollToShow` returns 0, so wholly on screen, as before. The pinch scale only matters for the scroll that is made, and that still comes from the first key's scroller (`rooms[0]`). The target is unchanged.
- **No drawing from another scroller is counted:** `root` is `.sb-boardwrap`. The desktop side column (`#sbSide`, which holds the issues list) and the changes and ALL AVAIL windows sit outside it, so none of their drawings can be counted as "in view". The sign-off and warning-line keys are skipped by `isLine` in the loop that collects these places.
- **Folded or not laid out:** these are filtered out by `laidOut` (height 0), the same as before. The new unit case checks it ("not laid out → −508").
- **An input with two drawings:** all of its drawings are already in `shown` and checked by `rooms.some`, as before.

**(2) Did it break anything? Nothing I could find.**
- **Same answer as before in every case without a second laid-out place:** `rest` only adds a reason to stay. When nothing is laid out, the loop still runs over every key, as it did before. So `drawn`, the unfold (folded Personal Inputs) and the sign-off and warning-line fall-back behave exactly as before. The only thing that changes `drawn` is the loop no longer breaking early, and `drawn` is read only when `shown` is empty.
- **No unrelated key can hold the screen:** every key in `rest` is one the step actually changed. For re-orders, `movedRowKeys` names only rows that moved. So I found no case where the change is wholly out of view and something a person would not call the change keeps the screen still.
- **Wider stays come from earlier rulings, not this commit:** an input key counts as in view by its SANS card, and by every box of its programme row. That is earlier settled behaviour (S1, the "any of its drawings" rule).

**(3) Do the tests test what their titles say? Yes.**
- **The three unit tests:** each puts the first-named place out of view and a later one in view, and expects `[]`. On the old code this gives −508, as the commit reports. Each also keeps "neither in view → −508" and "the first in view → []". The last of these passes on the old code too; it is a guard, which is fine.
- **The browser test:** it checks both of its conditions before pressing anything: the re-sorted Ground row is in view and `ap:0.0.prog` is above the screen. It then asserts that the scroll position is unchanged after Undo and after Redo. The commit says it failed at both sizes before the fix; I did not run it.
- **The two removed skips:** they are now hard expectations, so neither test can pass by skipping.
- **The real signed-day steps:** they are honestly described. The traffic change still lands nowhere. That is a known gap to file, not a fault in this round.

**Tidiness (filed, not fixed):** `histbubble.ts`'s comment near `findInputCell` still says the area and area-time keys (`ar:` / `at:`) are never drawn inside `.sb-boardwrap`. `board.ts:375` now draws `ar:` there, and the commit's own test says the board draws both, so the comment is stale. Separately, the loop in `land` now calls `drawingsOf` for every key of a large Sort all. It runs once per Undo and is cheap enough, but one helper returning the shown, other and drawn places would read more clearly.
