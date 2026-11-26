# The leave balance of a man posted in — build plan (DRAFT, chat 200, 26 Nov 26)

**Status: a draft written while his answers to questions 10, 11, 12 and 16 (the one questions page, version 11) are
awaited.** It assumes the recommended answers; each alternative is noted where it would change the work. Rewrite it
against his recorded answers (D2745–D2748) before any build. The build is its own job, on his word. Model: Opus, high
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

## Step 2 — question 12 A: leave before his post-in date never comes off (engine)
- In `personFigures`, drop from both the approved and the pending rows every date on which the man is not in the
  squadron and that falls before his current stint (`engine/people.ts beforeFirstStint` / `gapBeforeCurrent`); the
  Person comes from `ctx.people`. The snapshot keeps them out the same way, so the order never matters.
- A man back from overseas: his days away (the gap before the current stint) are dropped too; an earlier stint's
  days still count. A day after a posting out is NOT touched (D1541 — the next squadron may refuse it).
- The grid still draws the entry (D1720, D1722, D2743); Days taken leaves it out too (to confirm at the build).
- Tests first: his example both orders (posted in Mon 7 Dec, leave Wed 2 Dec, 24 typed → 24 either way); a gap
  between stints; a half day; a leave across the post-in date (only its days from the post-in date count).

## Step 3 — question 16 A: the balance shows its own sum (engine output + screens)
- The engine returns, per kind, the dates (and halves) whose charge came off since typing — the positive deltas
  against the snapshot — and their total. After a 1 Jan roll-over the line counts from that 1 Jan (Fable's reading,
  to settle at the build).
- Person window, LVE tile, last line, grey: "typed 26 Nov"; with something since, "24 typed 26 Nov · 1 day approved
  since" (.5 / days by D1246); not typed and a box shown: "Type what the official leave app shows" in amber.
  On a phone its own line; measure on his iPhone's letters (it may need two lines).
- Person window leave list: each leave that came off carries "−1" (−0.5) at its row's right, the tile's white.
- Balances page: one closed "How it works" fold at the page's foot, its four sentences as in the question's card.
- Words: as the second Fable left them (`2026-11-26-lw-balance-shows-its-sum-words-review.md`); any change goes
  through a fresh Fable again (D2441). Rulings it touches: D1479's "no added line" and the tile's lines (D1241,
  D1252, D1520) — his answer is the word for it.
- If he picks C: the tap on "−1" — "Already off his official balance" — adds the day to the snapshot (an admin's
  command, its own Undo line); drawn first. If B: one sentence at the box plus "Typed 26 Nov", no engine change.

## Question 10
- A (recommended): nothing to build. If B (a tick on every leave), it is a new control on the Inputs and Leave War
  leave windows — drawn first (D1625) and planned on its own.

## Checks (the bug-check order decides the tier at the build; expected WALK)
- Unit tests in `leaveyear.test.ts` for every case in the questions (his numbers), red first.
- A walk of both orders, both post-in positions, the Leave War route, a never-typed man, at his iPhone's size and a
  desktop, the scripts `scripts/handpass/lw-postin-bal-*.mjs` as the base.
- Reads: Astra and a fresh, blind Opus reader of the finished code; the words by a fresh Fable.
