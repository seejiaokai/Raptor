# Red-team brief — the `[DRAFT-PENDING]` plan (28 Sep 26), round 1

You are reviewing a PLAN, before any code is written, for a React/TypeScript scheduling app (repo root
`C:\Users\User\projects\Raptor`, the app in `raptor-port/`). You did not write it. Read-only: change nothing, run
nothing that writes.

**Read first:**
- The plan: `raptor-port/docs/superpowers/plans/2026-09-28-draft-pending-plan.md`.
- The owner's rulings it builds: `.claude/rules/decisions/scheduler.md` rows **D99, D100, D105, D107, D116, D117, D118,
  D119, D167, D168, D169, D170, D171, D172, D263**; `.claude/rules/decisions/how-we-work.md` rows **D166, D204, D211,
  D215, D336**. Where two rulings conflict, the later one wins.
- The approved mock-ups: `raptor-port/docs/mock/changes-window.html` (option A is the design of record), `changes-doors.html`
  (narrowed by D171), `tags-ticks.html` (the OG tag); their pictures under `raptor-port/docs/mock/img/`.
- The code the plan names: `src/engine/editlog.ts`, `src/ui/pendlist.ts`, `src/ui/HistoryModal.tsx`,
  `src/ui/histbubble.ts`, `src/ui/AvailWindow.tsx`, `src/ui/html.ts` (`dayStatHTML`, `viewVerSelHTML`),
  `src/engine/publish.ts` (`dayPendingItems`, `dayShownPendCount`, `dayPendCount`, `alAttr`, `markEdit`),
  `src/engine/slots.ts` (`noteChange`), `src/state/store.ts` (`resetSession`, `initStore`, `loadWeek`),
  `src/command/` (`commit.ts`, `latch.ts`, `types.ts`), `src/state/sched-commit.ts`,
  `src/state/people-settings-commit.ts` (`SETTINGS_KEYS`), `src/state/perms.ts`, `src/state/accounts.ts` (the
  `seenBy` precedent), `src/ui/inputedit.tsx`, `src/leavewar/state/store.ts` (the `gesture()` commands), `src/ui/Shell.tsx`
  (`#histBtn`), `src/ui/SchedBoard.tsx` (`#sbHist`), `src/ui/interactions.ts` (`jumpToChange`), `src/undo/`.

**Your job — find what is WRONG and what is MISSING.** Do not merely review the plan's text. Starting from the owner's
promise and the rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer,
role, overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may be a
MISSING call site.** For each item, state where the visible sign and the working gesture should exist in the production
app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove
correctness. Start with the least-shared or most specialised surface.

Specifically ask:
1. Does the plan honour every ruling above — and does any ruling ask for something the plan leaves out or reads wrongly?
   Name the ruling and the gap.
2. Every WRITER of a change a person would want to see: does each one reach the history (a slot edit, a structural
   add/delete, a drag between days, a plan switch or a version load, a template applied, publish / unpublish / sign,
   an input from every door, the Leave War's every decision, an OIL award, a Quals change, an undo / redo)? Which should,
   and which the plan misses?
3. The durable log: its identity (`seq`) across reloads and two tabs; its dates across week switches; rollback; the
   cap; size in the browser's store; the admin sweep; what an undo does to it; a rename of a callsign; a deleted man.
4. "New to you": the seen record's shape, a new account, the admin's member view (D292 — the same person), two people
   on one browser, a person with no personId (guest, waiting), whether the command gate can stop a member writing
   another's entry.
5. The doors and the window: every surface that draws a day heading; phone and desktop; stacking over the board, the
   ALL AVAIL window, the bubble, modals, drawers; the window staying open across a jump, a week change, a page change.
6. The OG tag: which pucks, which surfaces, per-viewer rendering and the string-diffed week, a published day untouched.
7. Anything that makes the plan bigger than it needs to be, or a simpler design that serves every ruling as well.

**What is NOT a finding (the owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly".
If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**Your report:** findings ranked most severe first, each with an id, a severity, the evidence (file and line), the
concrete scenario, and **exact, step-by-step fix instructions** for the plan (not a direction). Then **explicit
negatives** — what you checked and found sound. Plain words where you can; the owner does not read code.
