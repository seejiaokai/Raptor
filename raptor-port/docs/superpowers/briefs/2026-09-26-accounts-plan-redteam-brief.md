# Red-team brief — the `[ACCOUNTS]` plan (round 1), 26 Sep 26

You are an independent reviewer of a PLAN, before any code is written. You did not write it. Another reviewer from a
different provider is reading the same plan at the same time; you will not see each other's report. Read-only: do not
edit any file.

## What to read (live files — read them, do not rely on this brief's summary)

1. **The plan:** `raptor-port/docs/superpowers/plans/2026-09-26-accounts-plan.md` — the whole file.
2. **The owner's rulings** (the plan must obey every one; a later ruling wins over an earlier one — D90):
   - `.claude/rules/decisions/how-we-work.md` — especially **D165, D166, D173, D200, D201, D202, D203, D204, D210**.
   - `.claude/rules/decisions/scheduler.md` — especially **D149** (Quals own row), **D169, D170, D171** (the change
     history members read), **D104** (who is shown), and its §Settled "Inputs & Admin".
   - `.claude/rules/decisions/leave-war.md` (its §Architecture: the `viewer` mirror and the role seam) and
     `.claude/rules/decisions/oil.md` (D79, D82 — OIL awards).
   - `.claude/rules/raptor-executor.md` (how the build must be done) and `.claude/rules/bug-check.md`.
3. **What the database will be built from:** `raptor-port/docs/data-model.md` §3 (`User`), §7, §8, §10, §11 (the
   permissions table the plan rewrites), §12 question 3; `raptor-port/docs/handover-dataverse.md`;
   `raptor-port/docs/architecture-direction.md` (search "GUEST").
4. **Today's rules for roles:** `raptor-port/docs/engine-rules.md` §Auth / roles (search the heading).
5. **The code the plan changes** (read what you need): `raptor-port/src/state/auth.ts`, `state/users.ts`,
   `state/store.ts` (`resetSession`, `toggleRole`, `HOOKS.whoami`), `ui/Login.tsx`, `ui/App.tsx`, `ui/Shell.tsx`,
   `ui/Drawer.tsx`, `ui/AdminPage.tsx`, `ui/QualsPage.tsx`, `ui/InputsPage.tsx`, `ui/inputedit.tsx`, `ui/caldrag.ts`,
   `ui/DocViewer.tsx`, `command/actor.ts`, `undo/timeline.ts` (`mayReverse`), `engine/editlog.ts`,
   `state/people-settings-commit.ts` (the settings keys and their command store), `engine/hooks.ts` (`store`),
   `leavewar/sync.ts` (`wireLeaveWarSync`, `runPoArchive`, `restoreArchivedPerson`), `leavewar/engine/stages.ts`
   (`canEditRow`), `leavewar/state/store.ts` (`setRole`, `setViewer`, `approverName`, `ackReplacement`,
   `setManualCredit`), `leavewar/inputgate.ts` (`replaceBids`), `probe-bridge.ts`, `e2e/app.ts`.
6. **How this project checks work:** `raptor-port/docs/bug-check-order.md` (§2b, §5, §6, §7).

## Your job

Do not merely review the plan's text. **Starting from the owner's promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions** that "who is signed in" touches. **Assume every existing line may be correct and the defect may be a MISSING
call site** — a screen, a write path, a record or a rule the plan never names. For each item, say where the visible sign
and the working gesture should exist in the production app. Then rank concrete failure scenarios with setup, action,
expected result, and the observation that would disprove correctness. Start with the least-shared or most specialised
surface.

Attack in particular:
- **Rulings:** does the plan obey D166 (1)–(5), D204 and D200 (1)–(3) exactly, and D149? Anything it reads wrongly, a
  ruling it misses, a clash it fails to name, an older ruling it leaves stale (D201)?
- **Lock-out and escalation:** any order of actions that leaves the squadron with no admin who can sign in, lets a member
  (or a guest, or a person on no list) become an admin or act as another person, or lets a write bypass the gate.
- **The guest:** every page, panel, sheet, keyboard path and state-poke by which a guest could reach a write or a
  person-scoped screen; every reader that breaks on "no person".
- **Persistence and the command layer:** the three new settings keys — reload, the storage reset, undo/redo, the
  command store's rollback, the first boot, the legacy import.
- **The permissions module and its drift test:** is the design really "one place", or will scattered checks survive?
  Will the drift test catch a real drift, or can it pass while the app and §11 disagree?
- **The seeds and the test blast radius** (§The seeds): is keeping `us` → Ranger and moving `ad` → Saber sound, and
  what breaks?
- **The database step:** is anything here built so that the Dataverse / Microsoft sign-in step will have to undo it?
- **Anything the plan should NOT do** (scope creep, a product decision taken that is the owner's).

## What is NOT a finding — read before you start (owner, D56)

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. Passwords here are a stand-in for the
organisation's sign-in and are not security (the app sits behind the owner's own hosting sign-in); do not report "the
prototype's passwords are weak" — DO report a flow that would let one person act as another inside the app.

## How to report

- Numbered findings, most severe first. Each: **severity** (BLOCKER / MAJOR / MINOR), **what is missing or wrong**, the
  **ruling or file:line** it rests on, a **concrete failure scenario** (setup → action → wrong result), and **exact,
  step-by-step fix instructions for the plan** (what to add or change in the plan, and where in the code it lands) —
  not a direction.
- Then **explicit negatives**: the areas you checked and found sound, each in one line ("I checked X and found
  nothing").
- End with a one-line verdict: APPROVE / REVISE / BLOCK.
