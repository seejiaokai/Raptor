# The OIL batch (20 Oct 26) — the fresh, blind code read's brief

You are a fresh reader of code another session wrote (D790). Read-only: **change no file except your one output file**
`raptor-port/docs/handpass/parts/oil-batch/read.md`. Do not run the full test suite or any browser test; you may run one
unit test file with `cd raptor-port && npx vitest run <file>` to prove a claim.

## What to read
- The finished change: `git diff main...claude/oil-small-fixes-1020 -- raptor-port/src raptor-port/e2e` (the branch is
  checked out here), and the files it touches, whole where they are small, around the change where they are large.
- The evidence sheet: `raptor-port/docs/handpass/2026-10-20-oil-batch.md` — its roll-call (§3) and what was NOT walked (§10)
  are your lists of what to check for absence.
- The rulings: `.claude/rules/decisions/oil.md` and the full rows (`grep -h '^| D142 |' .claude/decisions-full/*.md`, likewise
  D2, D31, D49, D101, D591, D592, D837, D932).
- The three backlog items in `OUTSTANDING.md`: `[UNPUB-WARN-AL-RESTORES]`, `[OIL-ZERO-SPAN-SORTIE]`, `[LW-OIL-DATECHIP-HIDDEN]`.

## The question
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness.

Look hardest at: (1) `leavewar/sync.ts` `desiredOilCells(back)` and `oilCreditBidAgainst` — is the surviving version read
exactly as the pass will land it (its own evidence, kept values, protected dates, other weeks), and can the reckoning and
the landed credit ever disagree; the "lowers him" rule; (2) `engine/oil.ts` `fltOilWin` replacing the inline window in
`dayOilWork` — is it byte-for-byte the same window for every flying line (evening-before reports, overnight lines,
kept values `rv`), and `fltMeasuresNothing` / `dayOilBlind`; (3) `state/view.ts` the arm's version; (4) the words in
`ui/interactions.ts` and `ui/html.ts` against D837 and each other; (5) `leavewar/engine/oiltracker.ts` `OilOmit` returning a
number — every other caller.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it.

## The report
Each finding: an id, severity (high / medium / low), the concrete failure (setup → action → what goes wrong), its cause
(file and line), and **the exact fix, step by step** — a claim without a concrete failure, its cause and its fix is not a
finding (D489). Then **explicit negatives**: "I checked X and found nothing, because…". Say whether the finding is new in
this branch or already on `main` (compare `git show main:<file>`).
