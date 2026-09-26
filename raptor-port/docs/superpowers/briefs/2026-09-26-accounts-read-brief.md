# Brief — `[ACCOUNTS]`: read the finished code (26 Sep 26) — FULL tier, both providers, blind to each other

You are an independent reviewer. You did not write this code. **Do not edit any file.** Read the LIVE files on the
branch `claude/accounts` in `C:\Users\User\projects\Raptor` (the app is `raptor-port/`).

## What was built, and the evidence in hand
- The rulings: `.claude/rules/decisions/how-we-work.md` rows **D165, D166, D200, D202 (spent), D204, D210, D211**, and
  D148 (undo reverses only your own; the list clears at sign-out), D56, D67; `.claude/rules/decisions/scheduler.md`
  **D149** (a member edits his own Quals row, every column), **D169** (members read the change history — narrowed by
  D211); `.claude/rules/raptor-executor.md`.
- The plan, red-teamed three rounds: `raptor-port/docs/superpowers/plans/2026-09-26-accounts-plan.md` (its §Roll-call,
  Doors and Orders are the promise).
- The behaviour register: `raptor-port/docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md` (AC1–AC15).
- **The evidence sheet, with the roll-call and the walk: `raptor-port/docs/handpass/2026-09-26-accounts.md`** — read §3
  (the roll-call) and look for rows that are wrong or MISSING; §6 lists what the walk found and fixed.
- The permissions table IT will build the database's security from: `raptor-port/docs/data-model.md` §11 and §3; the
  app mirrors it in `src/state/perms.ts` and `src/state/perms.test.ts` fails when they disagree.
- The diff: `git diff 0495e6b3..HEAD -- raptor-port/src` (plus the working tree). The heart of it: `src/state/perms.ts`,
  `accounts.ts`, `auth.ts`, `store.ts` (`resetSession`, `wireStore`, `initStore`), `quals-write.ts`,
  `people-settings-commit.ts`, `reports.ts`; `src/command/permissions.ts`, `actor.ts`, `types.ts`; `src/undo/timeline.ts`
  (`endUndoSession`); `src/ui/App.tsx`, `Login.tsx`, `AccessScreen.tsx`, `GuestApp.tsx`, `UsersPanel.tsx`,
  `AdminPage.tsx`, `Shell.tsx`, `Drawer.tsx`, `QualsPage.tsx`, `InputsPage.tsx`, `InputsCal.tsx`, `DocViewer.tsx`,
  `html.ts` (the guest branches, `hideMed`), `pops.ts`, `toast.ts`, `logout.ts`; `src/leavewar/sync.ts` (the viewer),
  `src/leavewar/inputgate.ts`; `src/probe-bridge.ts`, `src/main.tsx`.

## Your job
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

Especially, look for:
- **authority decided anywhere but `perms.ts`**, or a write path a member, a guest, a person waiting, or a switched-off
  account can still reach (the command gate, the ownership invariant, the Leave War's own writers, the Tracker, a
  settings key, an undo or redo of someone else's change, a stale button still on screen after a sign-in);
- **what the next person on the same browser inherits** after a sign-out and sign-in: a window, a selection, an armed
  seat, a half-typed form, the undo list, the Leave War viewer or role, the Tracker's session, a toast, "View as" state;
- **a way to lose access for everyone** (no admin left who can sign in), or to claim a person another account already
  holds, or to make two accounts one;
- **what is saved and what comes back after a reload** — the accounts, the requests, the guest switch; a rollback of a
  failed command putting the three keys back together;
- **the guest**: any route from the guest view to medical detail (D211), to the working copy, or to a write;
- **"who"**: every record that names who did something names the callsign, and the person's id beside it where the plan
  says so; a rename moves nothing;
- anything that breaks what worked before (the two sign-ins everyone uses, the e2e suites' access to the probe bridge on
  the developer's PC, the Leave War's own-row rules, performance of the sign-in).

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored
when the code is already correct going forward** — no migration, no back-compat, no "an existing record would read
wrongly". If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not
touch it.

**Also out of scope, by ruling:** the demo passwords are not security and the sign-in only stands for Microsoft's until
the database step (D166 (2)) — "anyone can type another account's sign-in name" is known and on the look card, not a
finding; accounts live in one browser until the database (so does everything).

## Hand back
- Findings ranked by consequence, each with setup / action / expected / what you observed or would observe, and
  **exact, step-by-step fix instructions** (file, function, what to change).
- **Explicit negatives:** what you checked and found sound, by name.
- Plain English; tight.
