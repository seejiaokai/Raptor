# The small schedule-and-board fixes — the short read of the walk finding's fix (11 Nov 26, chat 64)

*(Saved word for word from its final message — a fresh Opus reader that wrote none of it, handed only the one commit `73d6e12a6` and the walk's finding W1 it answers (the order §5, "A fix is new code"). No fault found; one case not checked in a browser, at its end, given to the walker's short re-walk.)*

**Verdict: no fault found in commit 73d6e12a6.**

**1. Is the fix right and complete for W1?** Yes.
- **Order of events.** I followed the real path: the top bar's Undo, then `globalUndo` in `undo/timeline.ts`, then `snap` → `snapView`, which only books the landing on a 0 ms timer (`undo-wire.ts` line 280). Next `applyRestore` runs, and then `showBubble` → `toast()`, which sets the note's opacity to 1 and places it in the same turn. Redo follows the same order. So the note is already in the page and showing when the landing measures its room. The fix works in the real app, not only in a test that plants the note first. If the undo is refused, the landing does not run (the `entry.undone` guard), and the refusal note does not matter.
- **The note at the moment of measuring:**
  - Hidden, faded or fading: the opacity is '0', so the note counts for nothing.
  - Height 0, or no note element at all: also counts for nothing.
  - A note left from an earlier action: the Undo replaces its text in the same element before the landing measures it, so the box measured is the current note's.
- **Still rising into place.** The pattern that reads the note's transform takes the sixth number, the vertical shift. That is right for the desktop's centring shift plus the rise, and for a phone's plain rise. When no transform runs, nothing matches and it subtracts 0.
- **A note drawn at the top** (a phone with a window up) fails the "on the foot" test and plays no part. **The window on the foot** together with the note: the higher of the two wins, through `note < bottom`.
- **Pinched desktop layout on a phone.** The note and the box are both measured in screen pixels, and the existing division by the list's scale is unchanged.
- **A box taller than the room above the note.** The `note - top > box.height` guard keeps the old landing, which is the box's head on screen.
- **A box above the screen.** The landing moves the list down, so `dy` is negative and the new block is skipped. It is unchanged.

**2. Did it break anything that passed before?** No.
- The new block runs only when `dy > 0`. Since `note < bottom < box.bottom`, the new `dy` is still positive. So the "in view, nothing moves" decision (`rooms.some(r => !r.dy)` and the check on the step's other places) gives the same answer as before, including for a box in view under the note.
- The issues list on a desktop: a landing from below now rests about a note's height higher even where the note is not over that column. That is the builder's declared choice (call 2), not a fault.
- An inner scroller whose foot is above the note's top fails `note < bottom`, so nothing changes for it.

**3. Do the tests test what they say?** Yes.
- **Unit tests.** By arithmetic, the four new red cases expect 388 against the old 328 or 368: a 60px gap, which is the screen foot (600) less the note's top (540). The old code could not produce 388, so each would have failed before the fix. I did not run them against the old code. The guard cases (no note, faded note, box in view, box above, note at the top, window alone) do what their titles say.
- **New browser test.** It checks the actual boxes of the remark and the note, confirms the note is over the box's own columns, and confirms Redo of a box in view moves nothing.
- **The changed assertion is a fair replacement, and stricter, not weaker.** It now requires the note to be showing, the box's foot at or above the note's top, and the gap under 40px. The old test only asked for the box to rest within 40px of the screen's foot, which is the note's own place.

**What I ran:**
- `npx vitest run src/ui/boardland.test.ts`: 59 passed.
- I read the call order in `undo/timeline.ts`, `state/undo-wire.ts`, `ui/topstate.ts` and `ui/toast.ts`, plus `onscreen.ts` `scrollToShow`.
- No browser run, no build, no scratch probe needed.

**Not checked, at most a note:** a box within about 64px of the very end of its list, for example the last row of the last section on a desktop. The list cannot scroll further, so the box would still rest under the note. Before this commit it rested in the same place, so this is not a regression. It is not checked in a browser.

**Tidiness notes (filed, not fixed):**
1. `noteTop` treats "showing" as an inline opacity other than '0'. That couples it to how `toast.ts` fades the note. An exported "note showing" helper from `toast.ts` would keep the two in step.
2. The new-test helper `withNote` gives the window `left:0,right:300` but the note `left:12,right:288`. That is harmless, but the note's columns play no part in the rule, so the values suggest a column test that doesn't exist.
