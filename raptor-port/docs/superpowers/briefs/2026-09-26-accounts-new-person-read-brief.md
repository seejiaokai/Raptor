# Read brief — the finished `[ACCOUNTS-NEW-PERSON]` code (FULL tier, both providers, blind to each other), 26 Sep 26

You are an independent reviewer of FINISHED CODE. You did not write it (Opus 5.5 did). Another reviewer from a different
provider reads the same code at the same time; you will not see each other's report. **Read-only: do not edit any file,
do not run git commands that change anything.** Reading, searching and running the unit tests read-only
(`npx vitest run <file>` from `raptor-port/`) are fine; do not build or start servers.

## What to read

1. **The change:** `git diff origin/main...HEAD` on branch `claude/accounts-new-person` (the build commit is `09cc00e3`;
   the commits before it are the plan and the rulings). Start with `raptor-port/src/state/roster-add.ts`,
   `state/accounts.ts`, `state/perms.ts`, `state/people-settings-commit.ts`, `ui/UsersPanel.tsx`, `ui/AccessScreen.tsx`,
   `ui/AdminPage.tsx`, `ui/Shell.tsx` (the bell), `ui/QualsPage.tsx`, `ui/adminopen.ts`, `state/view.ts` (`ADMINOPEN`),
   `ui/scheduler.css` (`.login select`, `.acc-mode`, `.cs-long`, `.acc-note`), and their tests.
2. **The evidence sheet — the walk has already run:** `raptor-port/docs/handpass/2026-09-26-accounts-new-person.md`
   (the roll-call of every place the change reaches, the door check, what the walk found and how each was disposed of).
   Use it: **read for what is MISSING from it** as well as for what is wrong in the code.
3. **The plan it was built from:** `raptor-port/docs/superpowers/plans/2026-09-26-accounts-new-person-plan.md` (revised
   after the plan red team; §Round 1 lists every earlier finding and where it went).
4. **The owner's rulings** (a later one wins — D90): `.claude/rules/decisions/how-we-work.md` — **D214, D216, D217, D219,
   D220, D221, D222, D223, D224, D225, D226, D227**, and D165, D166, D200, D201, D202, D204; `.claude/rules/decisions/
   scheduler.md` — **D149, D218**. How the build must be done: `.claude/rules/raptor-executor.md`; how this project
   checks work: `raptor-port/docs/bug-check-order.md` (§2b, §4, §6).
5. **The permissions the database will be built from:** `raptor-port/docs/data-model.md` §3 (`AccessRequest`) and §11.

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

Weigh especially:
- **Saved data and atomicity** — a person and his account made in ONE command over two stores; a refusal inside; the
  request's new fields and `seenBy`; what a reload reads back.
- **Permissions** — `CommandOp.more`, the four new command types, the three corrected ones, §11; can a member, a guest, a
  pending person or a switched-off account reach any new door, by the screen or by a hand-made call? Is authority decided
  anywhere outside `perms.ts`?
- **The one add** — does every door that creates a person go through `state/roster-add.ts`? Any writer of a NEW
  `PEOPLE[...]` entry elsewhere?
- **The bell** — each admin's own; the phone's category list vs the list; the Admin page already up; a probe-made admin.
- **The words** — every place that asks for or heads the callsign/name, and the seat words.

**What is NOT a finding (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

## How to report

- One numbered finding per problem, ranked most serious first: **what**, **where** (file:line), **the failure scenario**
  (setup → action → what goes wrong, in the app's own words), whether it is **new in this change or already on `main`**,
  and **the exact, step-by-step fix** (not a direction).
- **Explicit negatives:** what you checked and found sound.
- A verdict: **CLEAN** (nothing found), **FIX FIRST** (findings to fix before his look), or **BLOCK** (say why).
