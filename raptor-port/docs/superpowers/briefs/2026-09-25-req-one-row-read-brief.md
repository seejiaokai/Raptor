# The code read — D174 + D175 (a request's row and its filing on a published day), 25 Sep 26

You are an independent reviewer of a finished change in the Raptor repo (`C:\Users\User\projects\Raptor`), branch
`claude/request-one-row`, commit `8fc6dba2` against `main` at `0a285741`. Opus 5.5 wrote it; you did not. Another reviewer
of a different provider reads the same change at the same time — you will not see each other's report, and you must not
open any file named `2026-09-25-req-one-row-*-read.md` other than your own output.

**Read-only.** Edit no file except your one report. Do not run the full test suites, the build, the browser tests or a
server (another chat shares this PC). You MAY run one test file at a time from `raptor-port/` (`npx vitest run <file>`),
and a throwaway probe test you delete afterwards, to confirm a behaviour on this revision.

## What changed, and what it must do
- `git diff 0a285741 8fc6dba2 -- raptor-port/src` — the code (`src/engine/publish.ts`, `src/engine/drafts.ts`,
  `src/ui/interactions.ts`, `src/ui/board.ts`) and the tests (`src/ui/reqonerow.test.tsx`, `src/ui/reqonerow-app.test.tsx`).
- The owner's two rulings, live: `.claude/rules/decisions/scheduler.md` rows **D174** and **D175** — and, because they
  govern the same ground, D98, D103, D109, D113, D114 in the same file; `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`
  AM1, AM6, AM11, AM20, AM23, AM27.
- The evidence sheet, with the roll-call, the walk (42/42 on desktop and phone), the break tests and the scenario round:
  `raptor-port/docs/handpass/2026-09-25-req-one-row.md`. The engine rules as now written:
  `raptor-port/docs/engine-rules.md` §Publishing / amendments, "A REQUEST'S ROW AND ITS FILING ON A PUBLISHED DAY".
- The rules files that govern these files (Codex loads none of them by itself): `.claude/rules/decisions/scheduler.md`,
  `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/how-we-work.md`, `.claude/rules/raptor-executor.md`,
  `.claude/rules/bug-check.md`; the house rules `raptor-port/CLAUDE.md` (the funnels, what persists).

## How to read — find what is MISSING, not only what is wrong
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

Check the roll-call in the evidence sheet (§3) for a row that should be there and is not.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it.

For every finding: whether it is NEW in `8fc6dba2` or OLDER (the same on `0a285741`), its severity, and **exact
step-by-step fix instructions** (file, function, what to change) plus the test that would pin it. Give **explicit
negatives** — "I checked X and found nothing". Already known and disposed of in the sheet (do not re-report unless you
think the disposition is wrong, and say why): G1 (a load of a version that never knew a request leaves it fresh), G2 (a
request taken off before publishing, then deleted, reads 1), G3 (the loaded-week bound), G4 (a plan keeps the left-out
row only until it is left), S9, S11, S13.

## Output
Write your report to `raptor-port/docs/handpass/2026-09-25-req-one-row-<you>-read.md` (`<you>` = `fable` or `astra`):
1. findings, ranked (each: NEW/OLDER, severity, scenario, fix steps, test); 2. the roll-call rows you would add, if any;
3. explicit negatives. Keep it tight — no restating the rulings.
