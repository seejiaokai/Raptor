# The read of the stack check's third round — three small changes Opus built on 6 Oct 26

*(One brief, word for word, for two readers who work apart — D590, D601. Do not open the other reader's report, and
do not look for it. Not to be edited after the reads start.)*

You are reading code **Opus 5.5 wrote**, as the reviewer who did not write it (D67). Work READ-ONLY: change nothing,
run no build, no test suite, no server; `git show` / `git diff` / `git log` only to read. The repo is at
`C:\Users\User\projects\Raptor`, on the branch `claude/codex-stack-review`.

## What was built, and why

Three commits, on top of `08c6599a` (which records the rulings):

| Commit | What | The ruling |
|---|---|---|
| `13f1c7fd` | `[PUCK-DOT-ZOOM]` — the dotted red ring on a puck ("this day breaks tomorrow's crew rest") is two screen pixels thick on a screen whose scaling is not a whole number; nothing changes on an unscaled, 2x or 3x screen. `src/ui/dotring.ts`, one line of `src/ui/scheduler/04-pucks-sections.css`, one call in `src/main.tsx` | his bug report, 6 Oct 26 (no ruling number): at Windows' 125% he could not see the dotted ring beside an advisory's amber ring |
| `b84e1602` | `[TAB-DAY-END]` — forward Tab from a day's last open text box, where that day has no control after it, keeps the caret in that box. `src/ui/schedule-tab.ts` | D597 (narrows D553) |
| `7482ee18` | `[ROLE-QUESTION-SECOND]` — several Blue/Red questions can be open at once, at most one per formation, each under its own formation. `src/ui/mission-role-offer.ts` | D598 (narrows D523); D599 is "as built", no code |

`git diff 08c6599a 7482ee18 -- raptor-port/src raptor-port/e2e` is the whole of it.

## Read first

1. The rulings, in full — the short lines are in `.claude/rules/decisions/scheduler.md` and `how-we-work.md`; the full
   rows: `grep -h '^| D597 |' .claude/decisions-full/*.md` (and D598, D599, D600, D601; and the rulings they narrow:
   D553, D535, D523, D529, D510, D590). Use the shell's grep — a long row is hidden by some search tools.
2. The contracts: `raptor-port/docs/ui-contracts.md` — "Schedule Tab route" (search `D597`), the Insights question
   lifecycle (search `D598`), "Three crew-rest rings" (search `PUCK-DOT-ZOOM`).
3. The three diffs, then each changed file WHOLE as it stands now, and its callers: `src/ui/textedit.ts`
   (`routeKeyDown`, `routeFocusIn`, `refreshTextDestination`, `editingText`), `src/ui/EditWeek.tsx` and
   `src/ui/SchedBoard.tsx` (the paint that waits for the caret, and the one that runs while it is in text),
   `src/state/mission-roles.ts`, `src/ui/html.ts` (`puck()` — the classes `boxdot`, `boxred`, `boxdash`, `warn`).
4. The evidence: the walk's table `raptor-port/docs/img/handpass/2026-10-06-codex-stack-r3/result.md` (38 steps, desktop
   and phone) and its script `raptor-port/scripts/handpass/stk3-walk.mjs`; the ring's measurements in the commit
   message of `13f1c7fd` and `raptor-port/docs/img/handpass/2026-10-06-puck-dot/`.

## What to answer

**A. Is each change right, and complete?** Read for what is ABSENT as much as for what is wrong:
- *The Tab change.* Every way the caret can be in "the day's last open text box": the week at desktop and phone width;
  the board at both; a day whose last box is an input's remark, a note, a programme row, an in-time line; a box the
  save redraws or removes (the remark cleared; the input deleted by the edit; a time that fails to parse); a save that
  opens a window (the weekend-duty OIL question — `windowOverSchedule`); a published day (pending marks, sign-offs); a
  day under preview, OIL Earn mode, a member's view (none should reach the route — check). Does keeping the caret in
  the box ever save twice, lose what was typed, move the page, or leave a block un-redrawn that used to be redrawn at
  that moment (the new `notify()` — is it enough on the BOARD as well as the week; can it loop or repaint under the
  caret)? Is Shift+Tab from a first box with nothing before it really unchanged?
- *The questions change.* Every place the old single slot was read or cleared: is there one left that still assumes one
  question, clears them all where it should clear one, or clears one where it should clear all? Two questions for the
  SAME formation (two aircraft's Remarks; a rename; a redraw that swaps the node) — can that happen? A question whose
  formation is deleted, moved, or whose day is re-published while another is open. An answer pressed on one question
  while the caret is in the other formation's Remarks (`saveVisibleText` — whose words does it save?). The published
  "door" (`[data-role-remarks]`) with a working question open beside it. The board's day change, a week change, sign-out,
  tracking Off — all must still end every open question. Memory: can `asking` grow without bound?
- *The ring change.* `dotRingWidth` at the edges (a scaling just off a whole number; under 0.5; above 3); the listener
  (does a zoom change always arrive; is anything left attached); does `--dot-w` reach every place a puck is drawn —
  windows that float, the drag ghost, a print or export view, the Leave War and the Tracker (should be untouched)?
  Does a two-pixel ring now collide with a neighbouring puck, a corner tag, the solid red box (`boxred`) or the dashed
  one (`boxdash`) in a way the one-pixel ring did not?

**B. The tests.** Does each new or changed test fail for the right reason without its fix, and could it pass while the
behaviour is wrong? One test's ending was CHANGED rather than added (`W9 …` in
`src/ui/mission-role-interim-fixes.test.tsx`) and one unit test's expectation reversed (`first reverse exits …` in
`src/ui/schedule-tab.test.tsx`): is each a ruled change (D598, D597) and nothing more, or was an assertion loosened?

**C. The words.** Five new short lines (D597–D601) were made from their full rows: read each short line against its
full row — does the line state the rule in force, without changing its meaning (D138)? Likewise the rewritten short
lines of D553, D535, D523, D510 and D590. And two lines added to a working guide,
`raptor-port/docs/bug-check-order.md` §4 ("Done, and answered … D601"): do they say what D601's full row says, and
contradict nothing around them?

## What is NOT a finding

- **A problem that lives only in data already stored** — the whole store is demo data, cleared before the database
  step (D56). Only if NEW data would be hurt too is it a finding.
- A fault that is the same on `main` and that these three commits neither made nor touched: name it in one line under
  "Older, not this change", no more.
- Style, naming, comment length, a refactor you would prefer.
- **A claim without a concrete failure.** A finding is: the exact steps (or inputs) → what happens → what should happen
  and which ruling says so → the cause, with file and line → the fix, step by step, exact enough to build from (D489).
  "This might be fragile" is not one.

## The report

Write it to the file named in the message that gave you this brief. Sections: **1. Findings** (most serious first;
each with severity, steps, cause, fix, and the test that would pin it); **2. Checked and sound** (one line each, with
how you checked); **3. Older, not this change**; **4. What I did not check.** Say plainly what you could not verify by
reading alone.
