# Scenario-design brief — `[DRAFT-PENDING]`, built (28 Sep 26)

You design the WALK for a feature that is built and unit-tested, before it is driven in the running app. Read-only:
change nothing. The repo root is `C:\Users\User\projects\Raptor`; the app is `raptor-port/`; the branch is
`claude/draft-pending` (read its commits: `git log main..HEAD`).

**What was built:** the ONE changes window (the owner's D167, D168, D170, D171, D172, D116–D119, D263, D336 (b), D169 with
D211 — rows in `.claude/rules/decisions/scheduler.md` and `how-we-work.md`), planned in
`raptor-port/docs/superpowers/plans/2026-09-28-draft-pending-plan.md` (read §9, which overrides §2) with its red-team log
`raptor-port/docs/superpowers/specs/2026-09-28-draft-pending-plan-review-log.md`. The design of record:
`raptor-port/docs/mock/changes-window.html` (option A), `changes-doors.html` (narrowed by D171), `tags-ticks.html` (OG).
The code: `src/ui/ChangesWindow.tsx`, `src/ui/changesmodel.ts`, `src/ui/changesopen.ts`, `src/ui/floatwin.ts`,
`src/state/changes.ts`, `src/state/changelines.ts`, `src/engine/editlog.ts`, and the doors in `src/ui/html.ts`
(`dayStatHTML`), `src/ui/Shell.tsx` (`#histBtn`), `src/ui/SchedBoard.tsx` (`#sbHist`), `src/ui/interactions.ts`, the OG hook
in `src/engine/publish.ts alAttr`, the bubble wiring in `src/ui/EditWeek.tsx` and `src/ui/histbubble.ts`.

**Your job — find what is MISSING, as walk scenarios.** Do not merely review the code. Starting from the owner's promise
and the rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer, role,
overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may be a MISSING
call site.** For each item, state where the visible sign and the working gesture should exist in the production app.
Then rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove
correctness. Start with the least-shared or most specialised surface.

Cover at least: every writer that should leave a line (the schedule's cells and structure, a plan switch, a version
load, a template, publish / withdraw / sign, every input door, every Leave War decision, an OIL award on the grid and on
the ledger, a Quals change, Undo / Redo) and the exact count of lines each leaves; the day chip's four states on every
surface that draws a day heading (the edit week, the board, View-only Sched — issued face and working copy — desktop and
phone) for an admin, a member, a guest, a person waiting for access, the admin's member view (D292); the admin's icon
and its week count; the window's tabs, day picker, groupings, sittings, empty states, fold, the phone panel and bar, a
tap on every kind of line (and which are not buttons); "new to you" across two people, a sign-out, a reload, a week
change; the OG tag on every surface that draws a puck on a day not yet published, and never on a published day; History
mode (the bubbles) on the board and the edit week while the window is open; the window against the ALL AVAIL window,
the board, the bubble, a modal, the Leave War page.

**What is NOT a finding (the owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward** — no migration, no back-compat. If the app would do it again to NEW data,
report it. Also settled — do not re-raise: two tabs of one browser overwriting each other (the whole app's limit until
the database, filed).

**Your report:** a numbered list of walk scenarios (S1, S2 …) most likely to find a defect first, each with setup (through
the app's own controls where possible), the action, the expected result in the app's words, and the observation that
would disprove it; then your predicted defects, ranked; then explicit negatives. Plain words where you can.
