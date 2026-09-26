# D260–D262 — the final code read (bug-check order §4 rank 2 and §4a): brief for Fable 5.1 and Astra, read blind

You are reading a finished, walked build in a React + TypeScript app ("Raptor", a flying-schedule planner; its "Leave
War" tab is a leave-bidding grid). Work READ-ONLY: do not edit files, do not run the app. You may run the unit tests of
the named files (`cd raptor-port && npx vitest run <file>`) if it helps you prove a claim. The other reviewer is reading
the same code at the same time; you will not see each other's report.

**Repo:** `C:\Users\User\projects\Raptor\.claude\worktrees\five-flags-batch-build-ef7d85` (the app under `raptor-port/`).
**What to read — the change:** `git diff 9f7814d9..HEAD -- raptor-port/src raptor-port/e2e` (six commits: D260
`6ad8491f`, D261 `2d7e92b3`, D262 `e7b70068`, `76478263`, `04f4cc5a`; the walk `d68af53c` is scripts and pictures only).
**The rulings (read the rows in full):** `.claude/rules/decisions/oil.md` D260 and D261 (the top two rows);
`.claude/rules/decisions/leave-war.md` D262 (the top row) and that file's §Architecture (how the Leave War's store,
records and absence door work). The general rules: `.claude/rules/decisions/how-we-work.md`, `.claude/rules/raptor-executor.md`,
`.claude/rules/bug-check.md`.
**The evidence sheet — read it first, it is your roll-call:** `raptor-port/docs/handpass/2026-09-27-d260-d262.md` (§2 the
agent's readings of each ruling, §3 what was found and fixed, §4 the roll-call — every place the change shows, §6 the
break tests, §7 what was not walked). **The scenario design Fable wrote before the build:**
`raptor-port/docs/superpowers/briefs/2026-09-27-d260-d262-scenarios-fable.md`.
**The contract as now written:** `raptor-port/docs/ui-contracts.md` §Selecting on the Leave War grid (search "D260" and
"ONE CHIP, ONE MOVE").

In short: D260 — a dragged block's Delete (`SelectSheet.tsx`) and the bid sheet's Clear, one day or a range
(`BidPicker.tsx`), remove the admin's hand-given OIL awards with everything else, and name each award first (asking
once); `store.ts awardsIn` is the question both ask; `clearCells` now also removes an award beneath leave and counts a
published war-approved leave it could not take. D261 — a member's tap on his own award opens a read-only `AwardSheet` at
every stage where the bid sheet does not open for him (`Matrix.tsx ownAwardOnly`, `cellOpenable`). D262 — the bid
sheet's Move has no date box and puts the one cell into the grid's move mode (`Matrix.tsx moveSel`, the drag-selection's
own, landing by `moveCells`); `select.ts wireMove` gains the mouse's edge scroll, a press-and-drag on the shared gesture
machine (`wireGesture`) that lands on the release, an empty-tap-outside cancel, a 400 ms double-click guard, a
mouse-only right-click cancel; `Matrix.tsx` ends a move when the Leave War leaves the screen and says "already on that
day" for its own day.

**The method — use it verbatim:**

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

**Where to look hardest (money, stored records, roles, a shared machine):**
1. Is what a confirm NAMES exactly what the clear then TAKES — every door, every role, every stage, a day whose top
   record is leave / a bid / an award / the schedule's own credit, a range crossing days outside the war or a posting?
   One Undo must bring every award back with its reason, giver and days.
2. Can any door still remove an award WITHOUT naming it (a door the build did not touch)? Can a member's clear take one?
3. D261: can a member open ANOTHER man's award, or reach any control that edits or removes his own? Any stage or
   posting where his own award is still dead to a tap, or where two sheets open at once?
4. D262: the one machine `wireMove` now serves three moves. Any path where a move lands where nobody chose (a click,
   a drag tail, a touch's trailing tap, a scroll), cancels when it should not, or stays on after the thing it moves is
   gone (Undo, a war / stage change, the tab left, the war's data changed underneath)? Any listener or animation frame
   that outlives the move? Does the press-and-drag conflict with the drag-select, the figure select or Rearrange?
5. The roll-call in the sheet: a row that is wrong, or a place missing from it.

**What to hand back:** findings ranked most severe first, each with (a) the file and line, (b) the concrete scenario
(setup through the app's own controls, action, what happens, what should), (c) whether it is new with this change or on
`9f7814d9` already, and (d) **exact, step-by-step fix instructions**. Then **explicit negatives** — what you checked and
found correct, by name. Keep it under ~200 lines. Write your report as your final reply.
