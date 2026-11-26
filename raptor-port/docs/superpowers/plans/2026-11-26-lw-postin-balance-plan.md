# The leave balance of a man posted in — build plan (DRAFT, chat 200, 26 Nov 26)

**Status: a draft written while his answers to questions 10, 11, 12 and 16 (the one questions page, version 11) are
awaited.** It assumes the recommended answers; each alternative is noted where it would change the work. Steps 2 and 3 are rewritten
against his recorded answers (D2747, D2749, D2810, D2812); 10 and 11 (D2745, D2746) are still awaited. The build is its own job, on his word. Model: Opus, high
(medium risk — the balance is a figure he relies on, not money or OIL; the engine change in step 2 is the riskiest part).

## What is true today (checked on the running app, 26 Nov 26 — `raptor-port/docs/img/handpass/2026-11-26-lw-postin-balance/`)
- `leavewar/engine/leaveyear.ts personFigures`: App bal = the typed figure less every approved leave charged now that the
  snapshot taken at typing did not hold; never typed = 0 from 1 Jan of the war's first year (D1492's reading).
- `leavewar/state/store.ts setTypedBalance` keeps the figure, its day, who typed it and the snapshot.
- Nothing reads a man's posting dates: leave on a day before his post-in date comes off like any other.
- The person window (`leavewar/ui/PersonWindow.tsx`) and the Balances page (`leavewar/ui/BalancesPage.tsx`) say
  nothing about when the figure was typed or what came off since.

## Step 1 — question 11 A: "Not typed" (screens only)
- A kind with no typed figure and no old opening (`KindFigures.typed === null` and no `openings` entry) reads
  "Not typed" in amber where War bal stands, the boxes empty with "No grade"'s dashed amber edge — Balances page,
  person window, the grid's figure beside the name (the grid: a dash, its amber — to draw). Every kind, LVE first.
- The below-zero ask (the bid windows, the drag window) does not fire for a kind not typed.
- My leave and Approvals' LVE BAL show the same (roll-call at the build: every reader of `leaveFiguresOf`).
- D1492's reading "never typed counts from 0" is narrowed (D201): the engine may keep counting from 0 underneath;
  only the screens and the ask change. Drawing of record: the question's mock-up; the full drawing before the build.

## Step 2 — question 12 A, RULED (D2747): leave before his post-in date is never deducted (engine)
- In `personFigures`, drop from both the approved and the pending rows every date on which the man is not in the
  squadron and that falls before his current stint (`engine/people.ts beforeFirstStint` / `gapBeforeCurrent`); the
  Person comes from `ctx.people`. The snapshot keeps them out the same way, so the order never matters.
- A man back from overseas: his days away (the gap before the current stint) are dropped too; an earlier stint's
  days still count. A day after a posting out is NOT touched (D1541 — the next squadron may refuse it).
- The grid still draws the entry (D1720, D1722, D2743); Days taken leaves it out too (to confirm at the build).
- Tests first: his example both orders (posted in Mon 7 Dec, leave Wed 2 Dec, 24 typed → 24 either way); a gap
  between stints; a half day; a leave across the post-in date (only its days from the post-in date count).

## Step 3 — question 16, RULED (D2749, D2810, D2812): one line at the box, and "Official bal" (screens only)
- Where a balance can be typed (an admin always; a member on his own window and row while unlocked), one grey line is
  always shown: "Only leave after post-in is deducted." — in the person window under the LVE box, and once above the
  rows on the Balances page, phone and desktop. No other instruction line, no fold (D2749, settling D2748).
- No line under the figure names where or when it was typed — "from official leave app on <date>" is not built
  (D2812, narrowing D2749); no "−1" on leave rows, no sum line (the sum design was not chosen).
- The label "App bal" becomes "Official bal" everywhere it shows — the person window's tile, the Balances page's
  heading ("OFFICIAL BAL"), any other place found by a search of the screens; "War bal" unchanged (D2810). The
  reference docs (`ui-contracts.md`, `word-list.md`) are corrected in the same change.
- Drawn on the questions page (version 22) before the build, as D1625 asks; the words were written and checked by
  fresh Fables (`docs/superpowers/specs/2026-11-26-lw-balance-instructions-postin-*.md`); "Official bal" is his word.

## Question 10
- A (recommended): nothing to build. If B (a tick on every leave), it is a new control on the Inputs and Leave War
  leave windows — drawn first (D1625) and planned on its own.

## Checks (the bug-check order decides the tier at the build; expected WALK)
- Unit tests in `leaveyear.test.ts` for every case in the questions (his numbers), red first.
- A walk of both orders, both post-in positions, the Leave War route, a never-typed man, at his iPhone's size and a
  desktop, the scripts `scripts/handpass/lw-postin-bal-*.mjs` as the base.
- Reads: Astra and a fresh, blind Opus reader of the finished code; the words by a fresh Fable.
