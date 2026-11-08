# The narrow re-read of the fixes — the schedule's marks and words (the pictures round's group 3), chat 13, 8 Nov 26

One brief, sent unchanged to two readers, each blind to the other (`raptor-port/docs/bug-check-order.md` §4, "What to do
with what they hand back" — the fixes are read again, narrowly): **Astra** (the standing reviewer, D1770) and **Sol 6.1**
(the second seat until Mon 9 Nov 26 19:00, D1743). Read-only: change, create or delete no file; do not commit. You may read
files and run read-only commands (`git diff`, `git show`, `grep`); you may run one unit file (`npx vitest run <file>` from
`raptor-port/`), nothing that builds. Where you would want the app driven, name the exact steps and what you expect.

## What to read

- The fixes: `git diff 19551d882 9d330d50c -- raptor-port/src` (branch `claude/pr-sched-marks-3205d7`). Read
  `raptor-port/src/ui/pendlist.ts` (`drawnRowKeys`, `inputWords`, `pendItemWords`, `pendListHTML`) and
  `raptor-port/src/ui/interactions.ts` (`jumpToChange`, the `[data-acc]` door) at `9d330d50c`, and their callers.
- The promise and the exclusions are those of the final read's brief,
  `raptor-port/docs/superpowers/briefs/2026-11-08-sched-marks-code-read.md` §The promise and §How to read it — read it.
- The findings the fixes answer, in the readers' own words: `raptor-port/docs/handpass/parts/2026-11-08-sched-marks-read-sol.md`,
  `…-read-astra.md`, `…-read-opus.md`. You may read these three; they are the claims under test.
- **Do NOT open:** `HANDOFF.md`, the evidence sheet `raptor-port/docs/handpass/2026-11-08-sched-marks.md`, the walkers'
  reports `raptor-port/docs/handpass/parts/2026-11-08-sched-marks-w*.md`, the picture folder, the `sm-*.mjs` scripts, and
  the other reader's report of this re-read.

## What the fixes claim (the builder's words — rule on each)

1. **One place.** A line about an input that has no place of its own gets the input's row after its words, in the
   `pendListHTML` loop (`drawnRowKeys`), for every kind of line — a filing's line as well as a details line; a man split out
   of a shared input still goes to his own new record first (`lead`).
2. **Only where the page draws the row.** Under Unavailable (`listedUnavail`) on every page; under Personal Inputs
   (`listedPersonal`) on Edit Schedule and the board only; never a SANS availability or an upchit; never on View-only Sched
   for Personal Inputs; a deleted or moved-off input, and a man taken out of an input, stay still.
3. **The fold.** The jump opens Personal Inputs only for an input listed there, and, for one accepted onto the programme,
   only on a day its programme row does not stand on.
4. **The damaged week.** Accept, Reject and → Unavail on a request that covers a protected date are refused at the door, in
   the grey note, in that week's own words (`protectedInput`), before any OIL question or dry run — and again in `run`, for
   an OIL answer that comes later.

## What to hand back

For each claim: **holds / does not hold**, with the line that settles it. For each new finding: severity; the failure
scenario (setup, action, expected, what is seen instead); cause, file and line; whether `19551d882` did the same; **exact,
step-by-step fix instructions**. A claim is a finding only with a concrete failure, its cause and its fix (D489). Look
above all for what the fixes newly break: a line that was a working button before `9d330d50c` and is still now, or one that
now lands somewhere wrong; a refusal now said twice, or a press now refused that should go through. Then explicit
negatives, and a tidiness note of the changed lines only (filed, not fixed).
