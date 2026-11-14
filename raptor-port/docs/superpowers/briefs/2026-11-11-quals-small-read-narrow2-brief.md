# A narrow read of a second, small fix round — the Quals page (11 Nov 26, chat 64, job 3)

You are a fresh reader. You did not write this code and have seen no other reader's report. READ ONLY: change no file
in the checkout, make no commit, run nothing that builds (no browser tests, no `npm run build`, no full unit suite).
You may run git read commands and read any source file. Do not open anything under
`raptor-port/docs/superpowers/briefs/` or `raptor-port/docs/handpass/`.

**The checkout:** `C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`
(always `cd` by this full path; Git Bash). **The change to read, and only this:**

```
git diff c242ba658 8ed7b7688 -- raptor-port/src/ui/QualsPage.tsx
git diff c242ba658 8ed7b7688 -- raptor-port/src/ui/quals.test.tsx raptor-port/e2e/geometry.spec.ts
```

Read the first diff whole, then the functions it touches whole in `raptor-port/src/ui/QualsPage.tsx` at `8ed7b7688`
(a long file — read by section). The tests diff is for judging what is pinned.

## What the screen is
Quals is a table of people (rows) against qualifications (columns). Scrolled down, a copy of the heading row is pinned
under the top bar (the "pinned row", outside the table's scrolling wrap). In "Edit quals" a heading is dragged sideways
to reorder the columns, from the table's own heading row or the pinned row; the drag belongs to the pointer that began
it, and a second finger cancels it. Separately the page can be "sent" to one person's row ("Check his quals", "Check my
quals", an Undo or Redo): the row is outlined and the page makes ONE trip to it if it is out of view, on the first
repaint that draws his row; when that repaint comes from an edit of the filter box the trip waits one frame.

## The four findings this round answers
- **G1.** A redraw that changes the column widths mid-drag (a wide desktop narrowed) set the pinned row's markup again
  and wiped the picked-up look and the landing mark. Fix: whenever the pinned row's markup is set again, a live drag
  puts its look and landing mark back (`reapplyDrag`, a layout effect, cleared on cleanup).
- **G2a.** A row drawn by an edit of the filter box and hidden again before the waiting frame ran lost its trip for
  good. Fix: a waiting trip that finds no row leaves the ask unspent.
- **G2b.** A newer ask arriving inside the waiting frame was followed by the older ask's trip; and a page left inside
  the frame still made it. Fix: a newer ask cancels the older waiting frame, the trip checks its ask still stands, and
  the frame is cancelled when the page is left.
- **G3.** A press by another kind of pointer (a mouse on a touch-screen laptop) during a finger's drag took the drag
  over without cancelling it. Fix: a press during a live drag cancels it, and that press starts none.

## The questions — for each of G1, G2a, G2b, G3
1. Is the fix right and complete for the finding as stated?
2. What did it break or leave open beside it? In particular: can an ask now be left unspent for ever and trip at a
   moment far from the press (and is that the rule above, or a surprise); can a trip now be made twice for one ask;
   does `reapplyDrag` ever put a look on the wrong heading (the column order changed under the drag, the dragged
   column removed, the tab changed) or run after the drag ended; does "a press during a live drag cancels it" stop a
   NORMAL press that follows a finished drag, a tap that sorts, a press on the ✕ in a heading, or the SAME pointer's
   own events; is anything left behind on screen by any cancel.
3. Is any new test hollow — passing with its fix reverted?

## What is NOT a finding
Data already stored (demo data); a scheduler who is not an admin; older behaviour this round did not touch (the ✕
inside a pinned heading does nothing; the outline never ends while the page stays open; no Escape cancels a column
drag; two fingers on the pinned row do not zoom; the lift frame keeping its place after a resize).

## Your report — your final reply, under 350 words
Findings ranked, each a concrete case (who, what is pressed, in what order, at what size), what should happen, what
the code does and why (function and line), exact fix steps, and the text of a test that fails today. Suspicions you
could not turn into a case, apart and marked. If nothing: "No findings", and what you checked.
