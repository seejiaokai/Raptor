# Brief — the final code read of the change-recording build (Fable 5.1 and Astra, blind to each other)

You are reading the FINISHED code of a build you did not write, AFTER it was walked. The owner's standing order (D353):
risky work — here the published record, saved data and permissions — gets BOTH providers' reads, independently. Do not
read the other provider's report; it does not exist yet for you.

## What was built

Branch `claude/change-recording-retest`, repo `C:/Users/User/projects/Raptor`, app in `raptor-port/`. The diff against
`main`: `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e raptor-port/scripts` (the documents changed too:
`raptor-port/docs/undo-contract.md` §3.1, §4, §5; `raptor-port/docs/ui-contracts.md` §The top bar carries the bell and the
Undo / Redo pair; `raptor-port/docs/engine-rules.md` §History).

- **The plan of record:** `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md` — read it WHOLE; its
  §11–§13 (the red team's dispositions and the walkers' findings) win over §3–§6.
- **The evidence sheet:** `raptor-port/docs/handpass/2026-09-28-change-recording.md` — the tier, the rulings swept, the
  roll-call (§3), the walk and what it found.
- **The rulings** (read their FULL rows: `grep -h '^| D148 |' .claude/decisions-full/*.md`, and the same for D347, D348,
  D349, D350, D352, D286, D287, D292, D322): the area files `.claude/rules/decisions/how-we-work.md`, `scheduler.md`,
  `leave-war.md`, `tracker.md`, `people-accounts.md` and their full rows under `.claude/decisions-full/`. Codex: nothing
  loads by itself for you — open them.

The files that carry it: `src/undo/timeline.ts` (the dispatcher — own steps only, the named barriers, the stateless
revision check, the say-once-then-pass-over, D350's words, the restore rules asked twice), `src/undo/describe.ts` (the
words), `src/undo/types.ts`, `src/state/undo-wire.ts` (the stores cut over, the page an undo lands on, the name in a
refusal), `src/state/roster-restore.ts` + `src/state/accounts.ts` `accountsRestoreProblem` (what a roster / settings
restore re-checks), `src/state/person-delete.ts` `deletedRestoreProblem` (a delete stays final), `src/state/people-settings-commit.ts`
+ `src/engine/hooks.ts` `store.group` + `src/engine/wavetpl.ts` (one wave-template save = one step),
`src/leavewar/state/store.ts` + `src/state/perms.ts` (`lw.stage`), `src/command/commit.ts` + `types.ts` + `src/state/sched-commit.ts`
+ `src/state/store.ts` + `src/ui/textedit.ts` (a text command's key, as a fact), `src/state/changelines.ts` (an undo line
only where the change wrote one), `src/ui/QualsPage.tsx` (the LoX columns read live), `src/ui/topbits.tsx` + `src/ui/Shell.tsx`
+ `src/ui/SchedBoard.tsx` + `src/ui/scheduler.css` (the pair on every page, the board's bar, the ⋯ menu),
`src/leavewar/ui/Chrome.tsx` (its pair gone), `src/tracker/undo-bridge.js` + `core.js` (one line at the end of init) +
`components/Header.jsx` + `TrackerPage.tsx`, `src/ui/highlights.ts` `bringDayIntoView`.

## What to do — the finder wording (bug-check order §4, verbatim)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

Check the roll-call (the sheet's §3) for gaps: a page where a change is made but no pair; a command type a person makes
that is neither a step nor in `NOT_STEPS` nor in D350's five by mistake; a cross-record rule a restore could break that
`roster-restore.ts` does not ask; a door that navigates under the board; a store whose `write()` misses a derived index;
a refusal whose words are untrue; anything that differs between the top bar's pair and the board's.

## What is NOT a finding (owner, D56 — read before you spend anything)

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

Also not findings: the plan's decided calls (§11.5's say-once-then-pass-over — it goes on the owner's look card; §10's
"OK, seen" never a step; D350's scope); a difference from `main` the plan asked for.

## What to hand back

Write your report to `raptor-port/docs/superpowers/briefs/2026-09-28-change-recording-final-read-<fable|astra>.md`
from the start (not only in your reply). For each finding: severity; what; where (file and line); the concrete scenario
(setup, action, what shows, what should); whether `main` does the same (compare before calling it new); and **exact,
step-by-step fix instructions** — not a direction. Then **explicit negatives**: what you checked and found sound. Do not
edit any file other than your report. Run nothing that writes (reading tests is fine; do not start the app).
