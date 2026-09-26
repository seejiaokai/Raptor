# Read brief — the finished `[POST-OUT-OUTCOMES]` code (FULL tier, both providers, blind to each other), 27 Sep 26

You are an independent reviewer of FINISHED CODE. You did not write it (Opus 5.5 did). Another reviewer from a different
provider reads the same code at the same time; you will not see each other's report. **Read-only: do not edit any file,
do not run git commands that change anything, and do NOT run tests or builds** (the PC is running the full gate set).
Reading and searching only.

## What to read

1. **The change:** `git log --oneline --grep=POST-OUT-OUTCOMES` on branch `claude/post-out-outcomes` — every commit
   whose message starts `[POST-OUT-OUTCOMES]` (Part A before the merge `4f3c40cc`, which brought PR #444's posting code in;
   Part B and the fixes after it). `git show <commit>` each. Start with `raptor-port/src/state/person-delete.ts`,
   `src/leavewar/sync.ts` (`postOut`, `postOutProblem`, `runPoOutcomes`, `restoreBody`, `restoreArchivedAs`,
   `undoPostOut`, `undoPostOutProblem`, `takeBack`, `availableFor`, the OIL pass's `creditable`, `wireLeaveWarSync`),
   `src/leavewar/state/store.ts` (`setPostOut`, `windowFor`, `markPostingDone`, `forgetPersonFrom`, the account and
   block lookups), `src/state/accounts.ts`, `src/state/perms.ts`, `src/state/store.ts` (`switchRoleView`),
   `src/engine/people.ts` (the callsign index), `src/state/roster-add.ts` (`callsignProblem`), `src/engine/publish.ts`
   (`peopleAttrsNow`), `src/engine/drafts.ts` + `src/engine/hooks.ts` (the load belt), `src/undo/timeline.ts`
   (`deadRefusal`, `undoWhy`), `src/state/quals-write.ts`, and the screens `src/leavewar/ui/{OutcomeChips,BidPicker,
   SelectSheet,Matrix}.tsx`, `src/ui/{UsersPanel,QualsPage,InputsPage,Shell,Drawer}.tsx`, `src/ui/postout.css`.
2. **The evidence sheet — the walk has already run:** `raptor-port/docs/handpass/2026-09-27-post-out-outcomes.md` (the
   roll-call of every place the change reaches, what the walk found and how each was disposed of, what was NOT walked).
   **Read for what is MISSING from it** as well as for what is wrong in the code.
3. **The plan:** `raptor-port/docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md` — its **Round 2** section wins
   over Round 1 and the text above it. The walk's scenario lists: `raptor-port/docs/superpowers/briefs/2026-09-27-post-out-outcomes-scenarios-{fable,astra}.md`.
4. **The owner's rulings** (a later one wins — D90): `.claude/rules/decisions/how-we-work.md` — **D229, D280, D281, D283,
   D284, D285, D286, D287, D290, D292, D294, D295, D297, D298, D299, D300, D301, D302**, with D166, D200, D201, D204, D214,
   D217, D226; `.claude/rules/decisions/leave-war.md` (its Settled and Architecture sections); `.claude/rules/decisions/
   scheduler.md` **D44, D45, D103, D186**; `.claude/rules/decisions/oil.md` **D2, D142, D25**. How the build must be done:
   `.claude/rules/raptor-executor.md`; how this project checks work: `raptor-port/docs/bug-check-order.md` (§2b, §4, §6).
5. **The permissions the database will be built from:** `raptor-port/docs/data-model.md` §3 (`Person`, `User`,
   `LeavePersonProfile`) and §11.

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

Weigh especially:
- **Saved data and atomicity** — the delete in ONE command over people, settings, the schedule, the week stash and the
  war; the posting pass's projection command (queued behind another command); what a reload reads back (the walk found
  the delete unsaved — is anything else written outside the save step?).
- **The published record** — a day he flew never pending; a day to come pending with its four down; the issued version
  never rewritten; the load belt; ALL AVAIL by date; no OIL from the cutoff.
- **Permissions** — `perms.ts` COMMAND_OPS for the four new command types and §11; can a member, a guest, a suspended
  account or the admin in the member view reach any new door, by the screen or by a hand-made call? Is authority decided
  anywhere outside `perms.ts`?
- **Undo** — a step that would bring a deleted man back passed over (never a wall) and said; overlapping older steps.
- **The posting's take-back** — only what the posting made (`archivedBy 'po'`, `offBy 'po'`, `sanBy 'po'`); a hand change
  never undone; `poDone` once per date and outcome.

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
