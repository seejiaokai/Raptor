# The Inputs batch [INPUTS-FIXES-1103] — the code read's brief (fresh, blind Opus), 3 Nov 26

Two readers, started together, blind to each other (bug-check order §4, D790, D1594 — the ChatGPT readers are out):
**Reader A** reads the whole batch for faults and absences; **Reader B** is D1411's security read — holes only.
Neither wrote this code; neither has seen the other's report. **Read only; change no file; commit nothing.** You may RUN
a single unit test file (`cd raptor-port && npx vitest run <file>`) to prove a claim — never a build, never a browser test
(another chat shares the PC's lock). Where a claim cannot be proved by running, name the exact input you would run.

## What to read

- The code: `git diff origin/main...1c81e6d82 -- raptor-port/src raptor-port/e2e` in
  `C:\Users\User\projects\Raptor\.claude\worktrees\backlog-pick-handoff-4b573a` (the tree is held at that commit while
  you read). About 90 files; the app files are `engine/canonical.ts`, `engine/restore.ts`, `engine/schema.ts`,
  `leavewar/sync.ts`, `state/changelines.ts`, `state/perms.ts`, `state/plan.ts`, `state/sched-commit.ts`,
  `state/view.ts`, `undo/describe.ts`, and in `ui/`: `App.tsx`, `FloatWindow.tsx`, `InputWindow.tsx`, `InputsCal.tsx`,
  `InputsSettings.tsx`, `RangeCal.tsx`, `SansCal.tsx`, `SansDay.tsx`, `SansSettings.tsx`, `board-html.ts`, `caldrag.ts`,
  `html.ts`, `inputedit.tsx`, `interactions.ts`, `pendlist.ts`, `pops.ts`, `winorder.ts`, `scheduler/19-availability.css`.
- The promise: `OUTSTANDING.md` item `### [INPUTS-FIXES-1103]` (F1–F10 and the answers), and the rulings D1578, D1581,
  D1582, D1583, D1585, D1586, D1588, D1592 — each in its FULL row: `grep -h '^| D1586 |' .claude/decisions-full/*.md`
  (the shell; the Grep tool hides a long row). Older rulings the batch must keep: D641, D792, D77, D45, D103, D178, D471,
  D19. The area rulings files: `.claude/rules/decisions/inputs.md`, `scheduler.md`, `people-accounts.md`, `leave-war.md`.
- The evidence sheet: `raptor-port/docs/handpass/2026-11-03-inputs-batch-check.md` — its roll-call (§3) is the list to
  read for ABSENCE; §13 K1–K12 are the walk's faults already fixed (read those fixes as new code).
- The architecture: `raptor-port/CLAUDE.md` §Architecture rules (the mutation funnel, the persistence funnel — a week, a
  request, a person is saved only by the command it runs in), `raptor-port/docs/undo-contract.md` §0.

## The finder brief (both readers)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
> or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

A claim is a finding only with a concrete failure, its cause and its fix (D489). For each finding give: severity; the
setup → action → wrong result; the cause (file and function); **exact, step-by-step fix instructions**; and the test that
would fail today. Then **explicit negatives** — "I checked X and found nothing" — for every area you read.
Not findings: wording you merely prefer; React Doctor style; the rules engine's verbatim style in `src/engine/`.

## Reader A — the whole batch

Weigh especially: the two new SAVED marks — the LATE drop on an input (`lateOff`, D1586) and Make public on a day's note
(`npub`, D1588/D1592) — through every writer and reader: save and reload, undo and redo, the change history's line,
what a View-only person and a member see, the published day (does anything leak onto the issued face before an
amendment; does it count as pending and wipe the sign-offs exactly when the rulings say), a plan saved and brought out,
a week change, the reset and restore of a day (`engine/restore.ts dayKeys`). Then Escape and the windows' order
(`ui/winorder.ts`, F-items, K7–K12): every window and calendar that should obey it, and one that was missed.
Then D1578 (OIL on a weekend no period covers, shown once a period exists — `leavewar/sync.ts`) and D1582 (Undo / Redo
words, `undo/describe.ts`).

## Reader B — the security read (D1411)

Holes only: who may do or see what, and what one person can see of another. Start at K4 — the member gate on the LATE
drop (`state/perms.ts`, `inputBreach` and its callers) — then every other permission the batch touches: can a member,
or View-only, set or clear `lateOff` or `npub` by any route (the window, a replayed change, undo/redo of an admin's
change, a plan brought out, a restore); can a member's change reach another man's input; is every refusal made at the
commit gate and not only at the screen; does `raptor-port/docs/data-model.md` §11 say the same as `perms.ts` for what
changed (`perms.test.ts`, `perms-scan.test.ts` pin this). Also: any user-typed string the batch newly prints (a note made
public, an input's words in Undo / Redo or the history) — is it escaped where it is built.
