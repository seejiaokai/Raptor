# Red-team + scenarios brief — the Tracker leftovers plan (28 Sep 26), round 1

You are reviewing a PLAN, before any code is written, for the Tracker tab of a React/JavaScript app (a flying
squadron's course-progress tracker: flow charts of "poké-ball" events, students' marks, dates, pace). The repo is the
worktree `C:\Users\User\projects\Raptor\.claude\worktrees\tracker-palette-prompt-a0c90f` (branch
`claude/tracker-leftovers-f79d36`, cut from `main`), the app in `raptor-port/`. You did not write the plan.
**Read-only: change nothing, run nothing that writes, start no server, run no test suite.**

**Read first:**
- The plan: `raptor-port/docs/superpowers/plans/2026-09-28-tracker-leftovers-plan.md`.
- The backlog items it builds: `OUTSTANDING.md` — `[TRK-RETEST-NOTES]`, `[TRK-EDIT-SIDEWAYS]`, `[TRK-SESSION-PICK]`,
  `[TRK-DLG-LEFTOVERS]`, `[TRK-BAKE-STALE]`.
- The owner's rulings for the Tracker: `.claude/rules/decisions/tracker.md` (every row, and its §Architecture); the
  Tracker's behaviour register `raptor-port/docs/handpass/2026-09-23-tracker-rulings.md` (R-rows; R26, R42, R43, R46,
  R47, R50–R54, R62, R108–R115 above all); the general rulings `.claude/rules/decisions/how-we-work.md` (D56, D90,
  D201). Where two rulings conflict, the later one wins.
- The walk notes the items came from: `raptor-port/docs/handpass/parts/tracker/w1.md`, `w2.md`, `w3.md`; the earlier
  evidence sheets `raptor-port/docs/handpass/2026-09-23-tracker.md` and `2026-09-25-trk-add-race.md` (§8).
- The code the plan names: `raptor-port/src/tracker/app/core.js` (`endSession`, `prefGet`/`prefSet` and every
  `lastCourse` / `lastCrew:` use, `loadCourseNow`, `init`, `_dlgShow`/`dlgClose`/`uiPrompt`/`uiPick`/`uiChoice`,
  `popFail`, `popDoneChanged`, `isWholeDay`, `setDoneDate`, `setFailDate`, `setLastSyll`/`setLastCurr`/`setUpchit`/
  `setDownDays`, `setEpw`/`setTarget`/`setTarget2`, `openLullPicker`, `lullDayClick`, the undo section
  (`pushMarkUndo`, `markSnap`, `applyMarkHist`, `handleUndoKey`), `ballGroup`, `ballTap`, `addStudent`,
  `applyStudents`, `toggleArrange`), `src/tracker/role.js`, `src/tracker/people.js`, `src/tracker/peoplewire.ts`,
  `src/tracker/App.jsx`, `src/tracker/components/Modals.jsx` (`DlgModal`), `Header.jsx`, `SidePanel.jsx`, `Pop.jsx`,
  `ArrangeTools.jsx`, `src/tracker/tracker.css`, `src/state/store.ts` (`resetSession`), `scripts/tracker/smoke.mjs`,
  `scripts/tracker/bake-user-charts.mjs`, `src/tracker/data/*.js`, `src/tracker/app/sylIds.js`,
  `src/tracker/app/eventDetails.js`, `src/tracker/app/fileFormat.js`, `src/tracker/retest.test.tsx`.
- The rules for building in this area (Codex does not load these by itself): `.claude/rules/raptor-executor.md`,
  `.claude/rules/decisions/tracker.md`, `.claude/rules/bug-check.md`, `raptor-port/docs/bug-check-order.md`.

**Two jobs, in one report.**

**Job 1 — design the test SCENARIOS (the more valuable half).** Hunt for what is MISSING, not what is wrong in the
text. Do not merely review the plan. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
least-shared or most specialised surface. Give at least one scenario per plan item (A, B1, B2, C1–C15, D, E), and name
the ORDERS that matter (e.g. log out with a question open; switch student while a date box is half-typed; remove the
picked student then log in as someone else).

**Job 2 — red-team the plan.** Ask specifically:
1. **A (the per-person pick).** Is `whoamiId` the right identity (a rename, an archived or deleted person, a guest, a
   pending account, the admin's member view D292, the standalone Tracker with no bridge)? Is the remount
   (`App.jsx`'s ready effect) the only way a new person reaches a Tracker whose engine is already loaded — what about a
   login while the Tracker section was never unmounted, a sign-in straight onto another page and the Tracker opened
   later, two logins without opening the Tracker in between? What does `resumeForPerson` race with (`onChain`, a load in
   flight, an unsaved chart edit — D129's question has already been answered by then)? Every writer of the pick.
2. **B1.** Answering the first question as cancelled — every caller of `_dlgShow`/`uiPrompt`/`uiConfirm`/`uiAlert`/
   `uiPick`/`uiChoice`: does any of them do something harmful on "cancel" (a delete, an import, the logout question
   D129)? Is "cancel the first" or "refuse the second" right for each? Could the first's continuation open a third?
3. **C5 (the date boxes).** Is the roll-call of date boxes complete? Does a controlled `DateBox` with a local draft
   behave on Chrome, Safari (iOS wheel picker), Firefox; with the ↶ button while a draft is shown; with a Crew switch;
   with a reload mid-draft? Is "a year from 1900" the right whole-day test? What about the Last Flown ratchet (D123,
   R50) — does a whole day saved at once change what Last Flown does?
4. **C6, C7, C10, C11, C13, C14, C15, D, E** — each: is the fix complete, and what else draws or reads the same thing?
5. **The questions for the owner (§3):** is each genuinely his (no ruling already answers it), and is each
   recommendation consistent with the rulings? Is anything the plan decided itself actually his?
6. What makes the plan bigger than it needs to be, or a simpler design that serves every item as well.

**What is NOT a finding (the owner, D56 and D120):** This app is pre-promulgation and its entire stored world is DEMO
DATA that will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already
stored when the code is already correct going forward** — no migration, no back-compat, no "an existing record would
read wrongly", no older file format. If the app would do it again to NEW data, report it: that is a real finding and
this exclusion does not touch it.

**Your report:** findings ranked most severe first, each with an id, a severity, the evidence (file and line), the
concrete scenario, and **exact, step-by-step fix instructions** for the plan (not a direction). Then the scenario list
(Job 1). Then **explicit negatives** — what you checked and found sound. Plain words where you can; the owner does not
read code.
