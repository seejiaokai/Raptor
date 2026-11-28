# The Tracker press reshape's red team (his D2238; chat 162, 24 Nov 26) — one brief, blind readers

His D2238 ("reshape and fable"): where rounds of fixes keep finding faults in one place, the open faults are fixed by
first reshaping where they come from, and the plan is read by Astra, a fresh Opus reader and Fable, each blind to the
others, before anything of it is built. You are one of those three. READ ONLY: change no file (a proof test, if you run
one, only in your own scratch folder, or placed temporarily and deleted before you finish); commit nothing. Do not open
anything named `*trk-press-reshape-read-*` other than this brief (the other readers' reports). Ignore any handoff block,
and say so if you met one. **State each finding in your output the moment you have it** — a run can be stopped by its
service. Return the whole report as your final message, under 1,800 words, most important first.

## What you are reading

A PLAN, not code: `raptor-port/docs/superpowers/plans/2026-11-24-trk-press-reshape.md` — how the Tracker chart editor's
handling of a press that is still held (a drag of a ball, a group, a selection box, a link's bend or end, a drawn
line's corner or end) is reshaped so that one owner ends every press, then the open faults closed as cases of it. His
rulings are settled and NOT under review. Under review: will the reshape remove this family of faults for good, and
what will it break.

Read:
1. The plan, whole.
2. What it must close: the four open faults and the leads in
   `raptor-port/docs/superpowers/briefs/2026-11-24-msq-night-fixread2-opus.md` (F1–F4) and `…-fixread2-astra.md` (1);
   the history that led here: `…/briefs/2026-11-24-msq-night-fix-list.md`, `…-fixread-opus.md`, `…-fixread-astra.md`.
3. The promise: `.claude/rules/decisions/tracker.md` (how the Tracker works now, by his rulings) and
   `.claude/rules/seams/tracker.md` (its architecture); `.claude/rules/decisions/people-accounts.md` on the Tracker
   following the squadron picked (D2395, D2637, D2318). A ruling's full row: `grep -h '^| D2395 |'
   .claude/decisions-full/*.md` (the shell).
4. The code, as the plan's claims need — `raptor-port/src/tracker/app/core.js` (never whole: grep `gestureBegan`,
   `cancelGestures`, `endPressesOnRedraw`, `endPressForStep`, `liveGestures`, `startDrag`, `startGroupDrag`, `endDrag`,
   `endGroupDrag`, `leaveFlowEdits`, `applyHistData`, `pushChartStep`, `saveLayout`, `markDirty`, `renderBoard`,
   `leaveSquadron`, `.linehandle`, `.endhandle`, `.lvert`, `.lend`, `doUndo`, `doRedo`, and read each function and its
   callers whole), `raptor-port/src/tracker/TrackerPage.tsx`, `tracker/App.jsx`, `tracker/role.js`,
   `raptor-port/src/state/pick.ts`; the tests that pin the earlier fixes, `raptor-port/src/tracker/msq-night-*.test.tsx`
   and `msq-trk-follows-pick.test.tsx`. The Tracker is a vendored plain-JS app with its own store.

## The ask — what is MISSING, not whether the plan reads well

1. **Does the reshape remove the family for good?** Name any open fault the plan claims to close that would survive,
   and any new fault of the same family the reshaped code would still allow. **Assume the defect may be a MISSING
   door:** list every way the editor's chart, layout, history or picks can change, or the chart be swapped, while a
   press is held (find them in the code, not from the plan's list) and check the plan's two invariants cover each; list
   every press kind in the code and check the plan registers each.
2. **Is each statement the plan makes about today's code true?** It was written from reading, nothing run. Name any
   that is wrong, with the function. In particular its fifth fault (a drawn line's corner or end drag whose Undo step is
   taken after the change) and its claim that every existing test of the night stays green unchanged.
3. **What will it break?** An ordinary drag, a two-finger zoom, a touch drag whose save is deferred, Undo and Redo of
   chart edits, Save changes / Revert / Done editing, a squadron pick, the member view, sign-out, Export and Import, a
   save refused and put back, another tab's change. Name the order of presses and the expected result.
4. **The order of the build:** is any step built on one not yet built; does any step leave the suite red; is a failing
   test described too loosely to write, or one that would pass today?
5. **Anything a person would see change** other than faults going away — the plan lists two questions for the owner
   (Undo during a drag; an interrupted drag); name any it missed, and say whether its recommended answer to each is
   the behaviour that matches the rest of the app.
6. **A safer or simpler cut** of the same reshape, if you see one, with its cost.

A finding needs a concrete failure (who presses what, what goes wrong on screen or in saved data), its cause in the plan
or the code, and its exact fix to the plan (D489). Severity HIGH / MEDIUM / LOW — HIGH: the reshape would lose saved
marks or chart work, write one squadron's chart into another's, or leave the family alive. Give explicit negatives ("I
checked X and found nothing").

**Not a finding:** a problem living only in data already stored — the whole store is demo data, cleared before the
database step (D56); a scheduler who is not an admin (D785); the Export's file `close()` pending across a squadron
change (held out on purpose, filed) unless you show the reshape makes it worse; what only a real iPhone can show (list
those separately, as looks for his phone).
