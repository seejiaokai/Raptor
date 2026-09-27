# [LW-MOVE-STANDARD] — the final code read (bug-check order §4 rank 2 and §4a): brief for Fable 5.1 and Astra, read blind

You are reading a finished, walked build in a React + TypeScript app ("Raptor", a flying-schedule planner; its "Leave
War" tab is a leave-bidding grid). Work READ-ONLY: do not edit files, do not run the app. **Do not run the test suite:
the owner's PC is running the full checks at the same time and a second heavy run gives false failures.** You may run ONE
named test file if you must prove a claim (`cd raptor-port && npx vitest run <file>`). The other reviewer reads the same
code at the same time; you will not see each other's report.

**Repo:** `C:\Users\User\projects\Raptor\.claude\worktrees\five-flags-batch-continue-2cfa70` (the app under `raptor-port/`).
**What to read — the change:** `git diff 818dbb04..HEAD -- raptor-port/src` (the build `fcba6bc7`; the later commits add
tests, the walk script, pictures and documents).
**The rulings (read the rows in full):** `.claude/rules/decisions/leave-war.md` — D264, D265, D266, D330, D331, D332, D333,
D334, D335 (the top rows), and that file's §Architecture (the Leave War's store, its records, the absence door);
`.claude/rules/decisions/oil.md` D260 (a Delete takes OIL awards and names them first; awards never move). General:
`.claude/rules/decisions/how-we-work.md`, `.claude/rules/raptor-executor.md`, `.claude/rules/bug-check.md`.
**The approved design:** `raptor-port/docs/mock/lw-move-standard.html` (its pictures in `docs/mock/img/lw-move-standard/`),
including its "What I read into your words" list, which the owner left uncorrected.
**The evidence sheet — read it first, it is your roll-call:** `raptor-port/docs/handpass/2026-09-27-lw-move-standard.md`
(§2 the readings, §3 what changed, §4 the roll-call, §5 the door check, §5a the walk, §6 the break tests, §7 not walked).
**The scenario design Fable wrote before the build:** `raptor-port/docs/superpowers/specs/2026-09-27-lw-move-standard-scenarios-fable.md`
(§5 its six contradictions and, at the foot, how each was taken).
**The contract as now written:** `raptor-port/docs/ui-contracts.md` §Selecting on the Leave War grid (search "A MOVE
CARRIES THE RECORDS" and "ONE FORMAT AND LOOK").

In short: every grid move used to read the day's TOP record; now a move carries RECORDS (`store.ts movableRecords` /
`moveRecords` / `moveRecordsProblem`; `moveCells` / `moveProblem` / `movableCells` read them too), so a bid beside an OIL
award, leave filed on the Inputs page, a medical, or in the other half of approved leave moves alone; the day's list's
Move picks ONE record by its id into the grid's move mode (`Matrix.tsx moveSel.only`), its date box gone; who may move is
one rule at every door (`requestMovable`, `absenceMovable`); `stayingIn` names what stays for the banner; `deletableIn`
decides where Delete is drawn. The one-day sheet (`BidPicker.tsx`) and the drag-selection sheet (`SelectSheet.tsx`) follow
order A with one shared Move and Delete (`SheetActions.tsx`); the one-day sheet's picked range widens Decide, Move and
Delete. The day's list (`DayList.tsx`) uses the same two buttons in the sheets' order.

**The brief (the project's standing wording — follow it):**
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

**What is NOT a finding:** This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED
before the database step. **Do not report a problem whose harm exists only in data already stored when the code is
already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app
would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**Also look hard at:** (1) atomicity and undo — one move is one undo step, a refused move writes nothing, a move of two
records from one day, of a request and an approved leave together; (2) `moveRecordsProblem` vs the commit — can the
preview accept what the commit refuses, or the reverse, now that two records can land on one day; (3) the landing check
for two moving records from DIFFERENT days landing on the same day, and a request landing where a moving approved leave
arrives; (4) the member path (D333) — can a member reach anything not his own through any door, at any stage; (5) the
refused-bid rule (a refused bid moves unless a live bid holds its half) — every door; (6) a stale `moveSel.only` after the
record changed or went; (7) every surface in the roll-call §4 against the code — a door that still reads the day's top
record; (8) what the mock-up promised that the build does not show.

**What I need back (one report, plain text):** findings ranked most severe first, each with the file and line, a
concrete scenario (setup → action → expected → observed), whether it is NEW in this change or already on `818dbb04`, and
**exact, step-by-step fix instructions** — not a direction. Then **explicit negatives**: "I checked X and found nothing",
for every area you examined. Keep it under ~2,000 words.
