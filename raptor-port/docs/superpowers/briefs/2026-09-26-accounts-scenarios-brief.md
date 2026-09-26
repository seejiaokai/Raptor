# Brief — design the test scenarios for `[ACCOUNTS]` (bug-check order §4 rank 1)

You are one reviewing model. The builder (another model) built `[ACCOUNTS]` on the branch `claude/accounts` in
`C:\Users\User\projects\Raptor` (the app is `raptor-port/`). **You do not review the code for correctness here — a
separate read does that later. Your job is to hunt for what is MISSING from the builder's test scenarios**, so the
walk of the running app is driven by more than the builder's own picture of the feature. You may read any file; change
nothing.

## The finder instruction (verbatim, bug-check order §4)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## What is NOT a finding (owner, D56 — verbatim)

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again
> to NEW data, report it: that is a real finding and this exclusion does not touch it.

Also out of scope: the demo passwords are not security and never real (the sign-in stands for Microsoft's until the
database step — D166 (2)); accounts live in one browser until the database (everything does).

## The user promise — read these first

- The rulings: `.claude/rules/decisions/how-we-work.md` rows **D165, D166, D200, D204, D210, D211** (and D148 for undo);
  `.claude/rules/decisions/scheduler.md` rows **D149** (a member edits his own Quals row, every column) and **D169**
  (members read the change history; narrowed by D211).
- The plan: `raptor-port/docs/superpowers/plans/2026-09-26-accounts-plan.md` — especially §Roll-call (39 readers of
  "who is signed in"), the Doors, and the Orders to walk.
- The behaviour register: `raptor-port/docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md` (AC1–AC15).
- The permissions table IT will build the database's security from: `raptor-port/docs/data-model.md` §11 (and §3 User,
  AccessRequest). The app mirrors it in `raptor-port/src/state/perms.ts`.
- The code: `src/state/accounts.ts`, `auth.ts`, `perms.ts`, `store.ts` (`resetSession`, `wireStore`, `initStore`),
  `quals-write.ts`, `people-settings-commit.ts`; `src/command/permissions.ts`, `actor.ts`; `src/undo/timeline.ts`
  (`endUndoSession`); `src/ui/App.tsx`, `Login.tsx`, `AccessScreen.tsx`, `GuestApp.tsx`, `UsersPanel.tsx`,
  `AdminPage.tsx`, `Shell.tsx`, `Drawer.tsx`, `QualsPage.tsx`, `InputsPage.tsx`, `html.ts` (the guest branches, `hideMed`),
  `pops.ts`, `toast.ts`; `src/leavewar/sync.ts` (the viewer), `src/leavewar/inputgate.ts`; `src/probe-bridge.ts`.
  `git diff main...claude/accounts --stat` shows everything the build touched.

## What the builder has already walked (so you can aim past it)

The walk script `raptor-port/scripts/handpass/acc-walk.mjs` (38 steps, all passing on the current build) covers: the
sign-in card; the admin's top bar (no "View as", an inert "Saber · Admin" badge) and his purple "this is you" puck on
View-only Sched; a wrong password refused; request access → waiting → signing in again shows the waiting screen; the
Admin tab's waiting count; Admin → Users (the request, the accounts, his own account read-only, add, the guest switch);
approve refused with no puck picked; approve → the person signs in as the puck the admin picked; decline → request
again; adding an account for a waiting name clears the request; switch off → the switched-off screen → switch on; a
reload keeps the accounts; a member's top bar (no Edit Schedule, no Admin); Quals: his own row editable, others text, a
tick on another's row refused with its reason; Inputs: his Person fixed to himself; Leave War: "Viewing as" names him;
undo empty after sign-out and sign-in; the guest view (walled off, published day only, "Not published yet", medical
reads "Unavailable", no working-draft picker, no dead ⓘ / warning line); a member sees the medical input in full
(D211); Edit history names the admin's callsign; phone: the drawer (no View-as chips, "Signed in as Saber · Admin"),
the request and waiting cards fit, Admin → Users drills in, the drawer's waiting count, the guest view fits.

Walk findings already fixed on this branch: added accounts were forgotten at a reload (the loader was never called at
start-up); the guest view drew an ⓘ button and a "tap to review" line that did nothing; a toast raised by one person
stayed on screen for the next person to sign in.

## What to hand back

1. **The roll-call gaps** — any reader or door of "who is signed in" the plan's §Roll-call (39 rows) and Doors do NOT
   list. Name the file and the line.
2. **A ranked list of scenarios** (most likely to find a real defect first), each: **setup** (through the app's own
   controls where possible), **action** (clicks, in order, on desktop or phone), **expected** (what the screen should
   show, in the app's words), **the observation that would disprove correctness**, and **the ruling** it tests. Aim at
   what the walk above has NOT covered: orders (both directions), a sign-out in the middle of something, a reload in
   the middle, two accounts on one browser one after the other, the last admin, renames and relinks, a posted-out
   person, the Leave War and the Tracker as a member and as a guest, the bell, Help "Your reports", documents and the
   medical view, the undo list, what the next person inherits.
3. **Explicit negatives** — "I checked X and found no gap" — for every area you looked at and found covered.

Keep the scenarios concrete and walkable by a script against the served production build (sign-ins are `ad`/`a`
admin Saber, `us`/`us` member Ranger, `outlaw` and `hex` members with any password; any other name lands on "Request
access").
