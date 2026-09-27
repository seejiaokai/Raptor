# Red-team brief — the `[ONE-DOOR]` plan (27 Sep 26), round 1

You are reviewing a PLAN before any code is written. You did not write it. Read-only: change no file.

**Read, in this order (the live files on disk — they are the truth, not this brief):**
1. The plan: `raptor-port/docs/superpowers/plans/2026-09-27-one-door-plan.md`.
2. The owner's rulings it builds: `.claude/rules/decisions/how-we-work.md` rows **D320, D321, D322, D310, D309, D308,
   D305, D307, D306, D299, D298, D297, D295, D290, D287, D286, D285, D284, D283, D280, D229, D227, D226, D225, D224,
   D222, D221, D220, D219, D217, D216, D214, D204, D201, D200, D166, D149** (search the file by D-number); also
   `.claude/rules/decisions/scheduler.md` D218, D45, D103 and `.claude/rules/decisions/leave-war.md` (its "Also read" and
   §Architecture). Where two rulings clash the later-dated wins (D90).
3. The approved design: `raptor-port/docs/mock/one-door.html` (pictures in `raptor-port/docs/mock/img/one-door/`).
4. The code the plan changes: `raptor-port/src/ui/UsersPanel.tsx`, `raptor-port/src/ui/QualsPage.tsx`,
   `raptor-port/src/state/accounts.ts`, `raptor-port/src/state/roster-add.ts`, `raptor-port/src/state/person-delete.ts`,
   `raptor-port/src/state/perms.ts`, `raptor-port/src/state/view.ts` (BACKPROMPT, ADMINOPEN),
   `raptor-port/src/leavewar/sync.ts` (restoreBody, undoPostOut, postOut, takeBack, runPoOutcomes, poDueNow,
   reprojectRoster, deletePersonOnWar), `raptor-port/src/leavewar/state/store.ts` (setPostOut, setPostIn, postingProblem,
   windowRecord, windowFor, readPostOuts, setPeople, forgetPersonFrom, markPostingDone),
   `raptor-port/src/leavewar/engine/people.ts` (Person, inSquadron, outcomeOf), `raptor-port/src/leavewar/ui/Matrix.tsx`
   (rowInWindow, PersonMonth's day cell, the posting-sheet routing), `raptor-port/src/leavewar/state/raptorRoster.ts`.
   Standing rules for this repo: `raptor-port/CLAUDE.md` (the store, the mutation and persistence funnels, one command
   layer), `raptor-port/docs/bug-check-order.md` §4.

**Your job.** Do not merely review the plan's text. Starting from the user promise and the applicable rulings, enumerate
every qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
of actions. **Assume every existing line may be correct and the defect may be a MISSING call site** — a reader of a
man's in/out dates the plan's table does not list; a door the old Quals archive offered that the new one does not; a
state the data allows with no button; a ruling the plan contradicts or silently narrows; an order of actions (archive →
restore → archive; restore with a post-in date → Undo post out; a posting to come → Archive; delete from the Archived
group; a member signed in when he is archived; the admin viewing as a member) whose result the plan does not decide.
For each item, state where the visible sign and the working gesture should exist in the production app. Then rank
concrete failure scenarios with setup, action, expected result, and the observation that would disprove correctness.
Start with the least-shared or most specialised surface.

Pay particular attention to: (a) the D320 stint design in §C — does `from`/`to` staying the CURRENT stint really leave
every other reader right, and is every reader of a past stint found? (b) Archive's war half (closing the stint; a
posting still to come; a man not yet posted in); (c) Restore's two modes (Restore with a post-in date vs Undo post out);
(d) the account's suspension and enabling (who suspended it, the last admin, D306); (e) the welcome note's record and
who may clear it (a member may change only his own Person row); (f) permissions — perms.ts and data-model §11 move
together (a drift test fails otherwise); (g) the published record — archiving reads "1 pending" on published days (kept,
D321).

**What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will
be CLEARED before the database step. Do not report a problem whose harm exists only in data already stored when the code
is already correct going forward — no migration, no back-compat, no "an existing record would read wrongly". If the app
would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**Deliver:** a ranked list of findings, each with — the ruling or promise it concerns; setup / action / expected / the
observation that disproves correctness; and **exact, step-by-step fix instructions for the PLAN** (which section, what
to add or change), not a direction. Then **explicit negatives**: "I checked X and found nothing". Keep it plain; the
owner is not technical, but this report is for the builder.
