# A narrow read of one fix round — the Quals page (11 Nov 26, chat 64, job 3)

You are a fresh reader. You did not write this code and have seen no other reader's report. READ ONLY: change no file
in the checkout, make no commit, run nothing that builds (no browser tests, no `npm run build`, no full unit suite).
You may run git read commands and read any source file. Do not open anything under
`raptor-port/docs/superpowers/briefs/` or `raptor-port/docs/handpass/` — those hold other readers' reports.

**The checkout:** `C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`
(always `cd` by this full path; Git Bash). **The change to read, and only this:**

```
git diff 7765901d1 c242ba658 -- raptor-port/src/ui/QualsPage.tsx
git diff 7765901d1 c242ba658 -- raptor-port/src/ui/quals.test.tsx raptor-port/e2e/geometry.spec.ts
```

Read the first diff whole, then the functions it touches whole in `raptor-port/src/ui/QualsPage.tsx` at `c242ba658`
(the file is long — read by section, never whole), and `raptor-port/src/ui/pinchzoom.ts` only where the diff's code
meets it. The tests diff is for judging what is and is not pinned.

## What the screen is
Quals is a table of people (rows) against qualifications (columns). When the page is scrolled down, a copy of the
heading row is pinned under the top bar (the "pinned row"; it sits OUTSIDE the table's scrolling wrap). In "Edit quals"
a heading can be dragged sideways to reorder the columns — from the table's own heading row and, since the commit
before this round, from the pinned row too. Separately, the page can be "sent" to one person's row (the admin's "Check
his quals", a member's "Check my quals", an Undo or Redo of a Quals change): that row is outlined, and the page makes
ONE trip to it if it is out of view.

## The three findings this round answers
- **F1.** With one finger holding a pinned heading mid-drag, a second finger put down on another pinned heading, moved
  and lifted alone wrote a column order (on the table's own heading row a second finger cancels the drag, because the
  pinch controller on the table's wrap sees it). The fix: the drag belongs to the pointer that began it; a second
  touch cancels it; moves and lifts from any other pointer are ignored; `pointercancel` cancels. NOT built on purpose:
  joining the pinned row to the pinch controller (two fingers on the pinned row do not zoom the table, as before).
- **F2.** If the filter box hid the man's row at the moment the page was sent to him, the "ask" was spent on a repaint
  that did not draw his row, so clearing the filter later outlined him without taking the page to him. The fix: the
  ask is spent only on the first repaint that DRAWS his row; then the outline, then the one trip if he is out of view.
  When the row is drawn by an edit of the filter box itself, the trip waits one frame (the browser brings the caret
  back into view at a keystroke's end, which would undo the trip). A newer ask replaces an older one.
- **F3.** A redraw during a drag begun on the pinned row (a resize, a store change) re-set the pinned copy's markup and
  wiped the picked-up look from the pressed heading. The fix: the pinned copy's markup is kept while it reads the
  same.

## The questions — for EACH of F1, F2, F3
1. Is the fix right, and is it complete for the finding as stated?
2. What did it break or leave open beside it? Look hard at the new logic:
   - **the pointer that owns a drag** — a mouse, a pen and a finger; a pointer id reused; the starter's lift never
     delivered (lost capture, the finger sliding off the window, the browser taking the touch for a scroll); after a
     second finger cancels, do the first finger's later moves begin a new drag or write anything; is the table's OWN
     heading drag (mouse and finger, and its pinch-cancel) changed in any way by this round; does a cancel always clear
     the lift frame, the landing mark, the picked-up look and the edge scroll, on both heading rows;
   - **the ask that waits** — an ask whose row is never drawn while the page is open (does it fire much later, at a
     moment the person would not expect — e.g. a tab change that draws him — and is that the rule as stated?); an ask
     that outlives leaving the page, a sign-out, another person's ask; the one-frame wait — a newer ask inside that
     frame, the row hidden again inside it, the page left inside it (a callback after unmount), two edits of the
     filter box in quick succession; any path where the trip is now made TWICE or NEVER for one ask; Undo and Redo of
     a change to a man the filter hides;
   - **the kept markup** — every input the pinned copy's markup depends on (the column order, sort marks, Edit quals
     on or off, the filter, the tab, a rename, an added or removed column, the role of the person signed in): can a
     stale pinned row now be shown, or stale press handlers be left on it, after any of them changes.
3. Is any new test hollow — one that would still pass with its fix reverted — or is a stated behaviour above pinned
   by no test?

## What is NOT a finding
- A problem that lives only in data already stored (the whole store is demo data).
- A scheduler who is not an admin (never set one up).
- Older behaviour this round did not touch: the ✕ inside a pinned heading does nothing; the outline never ends while
  the page stays open; no Escape cancels a column drag; finger drags in WebKit are undriven by the tests.
- The pinch not being joined to the pinned row — but DO say, in one short paragraph, what a person now sees with two
  fingers on the pinned row against two fingers on the table's own heading row, so the host can decide.

## Rulings in force here
- Undo and Redo leave the screen where it is when what they change is in view, and move to it only when it is out of
  view (D672).
- A drag shows one landing mark in one place; a drop marks one place once; carried near the box's edge it scrolls the
  box (D895).
- A pinned cell never turns see-through under a press (D1281). Only grids that zoom by their own pinch zoom (D1567).

## Your report — your final reply, under 500 words
Findings ranked, most serious first. Each one: the concrete case (who, what is pressed, in what order, at a desktop's
or a phone's size), what should happen, what the code does instead and why (function and line), and exact step-by-step
fix instructions, with the text of a test that would fail today. A suspicion you could not turn into a concrete case
goes in a separate short list, marked as such. If you find nothing, say "No findings" plainly and list what you
checked. Then the one paragraph on two fingers on the pinned row.
