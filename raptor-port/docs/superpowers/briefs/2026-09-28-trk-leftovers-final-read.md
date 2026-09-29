# Final-read brief — the Tracker leftovers, the finished code (28 Sep 26)

You are reading FINISHED CODE for the Tracker tab of a React/JavaScript app (a fighter squadron's course-progress
tracker: flow charts of "poké-ball" events, students' marks, dates, pace), which you did not write. The worktree is
`C:\Users\User\projects\Raptor\.claude\worktrees\tracker-palette-prompt-a0c90f` (branch
`claude/tracker-leftovers-f79d36`), the app in `raptor-port/`. **Read-only: change nothing, run nothing that writes,
start no server.** (You may run ONE test file if it helps: `npx vitest run <file>` from `raptor-port/`.)

**What changed:** `git diff origin/main...HEAD` (main was merged in at `69a44200`; everything else on the branch is
this work). The code is under `raptor-port/src/tracker/` (above all `app/core.js`, `components/DateBox.jsx`,
`components/keys.js`, `components/Modals.jsx`, `components/Pop.jsx`, `components/SidePanel.jsx`,
`components/ArrangeTools.jsx`, `components/Header.jsx`, `components/ShowAllPanel.jsx`, `App.jsx`, `people.js`,
`peoplewire.ts`, `tracker.css`), `raptor-port/src/ui/TrackerPage.tsx`, `raptor-port/src/ui/scheduler.css` (one
comment), `raptor-port/scripts/tracker/bake-lib.mjs` and `bake-user-charts.mjs`, `raptor-port/scripts/tracker/smoke.mjs`.
Tests: `raptor-port/src/tracker/leftovers.test.tsx` (new), `retest.test.tsx`, `tracker.test.tsx`.

**Read first:**
- **The evidence sheet — the roll-calls, the orders walked, what the walk found and each disposition, what was NOT
  walked:** `raptor-port/docs/handpass/2026-09-28-trk-leftovers.md`.
- The plan and what its red team changed: `raptor-port/docs/superpowers/plans/2026-09-28-tracker-leftovers-plan.md`
  (§6 the dispositions).
- **The owner's rulings for the Tracker:** `.claude/rules/decisions/tracker.md` — D370–D376 above all (every row,
  with the readings stated to him), and its §Architecture; the Tracker's register
  `raptor-port/docs/handpass/2026-09-23-tracker-rulings.md` (R26, R42, R43, R47, R50, R52, R62, R109, R110). The
  general rulings `.claude/rules/decisions/how-we-work.md` (D56, D90, D201). Where two rulings conflict, the later wins.
- The contract: `raptor-port/docs/ui-contracts.md` §The Tracker tab; the gaps `raptor-port/docs/tracker/known-gaps.md`.
- The rules for building here (Codex loads none of this by itself): `.claude/rules/raptor-executor.md`,
  `.claude/rules/bug-check.md`, `raptor-port/docs/bug-check-order.md`.

**Your job — find what is WRONG and what is MISSING.** Do not merely review the changed lines. Starting from the
user promise and the rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
consumer, overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may be a
MISSING call site.** Then rank concrete failure scenarios with setup, action, expected result, and the observation
that would disprove correctness. **Check the sheet's roll-calls (§3) for gaps** — a row missing, a "NO — because"
the code does not actually hold, a door the walk never reached.

Specifically:
1. **Each person's own place (D376):** `pickKey`, `whoamiId` (people.js / peoplewire.ts), `resumeForPerson`,
   `pickOwner`, `resuming`, App.jsx's two effects, `init`, `loadCourseNow`, every writer of `lastCourse` / `lastCrew:`
   (setActive, addStudent, removeStudent, applyMarkHist), `endSession`. Races with `onChain`, a load in flight, an
   unsaved chart edit (D129), an import, the admin's member view (D292), a sign-in while the Tracker is on screen vs
   off it, a callsign rename, the standalone Tracker.
2. **The question box:** `_dlgShow`'s queue, `dlgClose`, `dlgCancelAll`, `_dlgCancelled`; `DlgModal`'s inert pass and
   Tab trap; `isComposing` at every Enter. Every caller of `uiPrompt` / `uiConfirm` / `uiChoice` / `uiPick` / `uiAlert`:
   does any do harm when a WAITING question is cancelled at a session end, or when it is answered after the thing it
   asked about changed?
3. **The dates:** `isWholeDay`, `afterToday`, `isoToday` (the squadron's day, Singapore), `NOT_YET`, `NOT_WHOLE`,
   `popDayProblem`, `popDoneChanged` / `popDoneCommit` / `popFailDateChanged` / `popFailCommit`, `popGrade`, `popFail`,
   the side-panel setters and their no-change guards, `DateBox` (the part-typed flag, commit on leave / Enter /
   unmount, the line clearing). Every date box in the roll-call (§3.3).
4. **Failures (D370, D371):** `sortFails`, `failDates`, `failList`, `popFail`'s −, `setFailDate`, the Failures card, the
   full list, the pop-up, the bubble, the ball's ticks.
5. **Undo (D372):** `markSnap` (pace, lulls), `pushGroupUndo`, `restoreSnap`, `applyGroupHist`, `reverseOf`, `whatOf`,
   `liveEntry`, `removeStudent`'s filtering; the redo stack; the chart-edit undo beside it. (A parallel chat is moving
   the Tracker's ↶ ↷ BUTTONS into the app's top bar — those two buttons in `Header.jsx` are not this branch's.)
6. **The folded tools (D373):** `ArrangeTools.jsx`, `toolsOpen`, `setToolsOpen`, `flashHint`, the outside press, the
   Escape order, `noteArrBox`, `refitArrange`, `canvasSize`, the resize listener.
7. The smaller pieces: a tick press (C6), a new lull period's month (C7), + Add's live list (C11), the save words
   (C14), the bake script (E).

**What is NOT a finding (the owner, D56 and D120):** the Tracker's whole stored world is DEMO DATA, cleared before
the database step, and its charts reach the database by export → wipe → import. **Do not report a problem whose harm
exists only in data already stored when the code is already correct going forward** — no migration, no back-compat,
no older stored shape, no older file format, no old unprefixed pick key. If the app would do it again to NEW data,
report it: that is a real finding. **Also not a finding:** that the Tracker has no role gate (D121 — everyone does
everything).

**Your report:** findings ranked most severe first, each with an id, a severity, the evidence (file and line), the
concrete scenario, and **exact, step-by-step fix instructions**. Then **explicit negatives** — what you checked and
found sound. Plain words where you can; the owner does not read code.
