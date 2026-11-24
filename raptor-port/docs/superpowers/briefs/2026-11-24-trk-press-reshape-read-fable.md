# The Tracker press reshape plan: the fresh Fable reader's report (blind; 24 Nov 26, chat 162), saved from its hand-back

I read an exported copy of 91b5f476e (C:\rc162 only). Nothing run, nothing changed. Read: the plan whole; both second-round reads; the fix list; the first-round reads' headings only; in core.js the press, Undo, load, store-restore, squadron-move and editor functions with their callers; App.jsx, pick.ts, role.js; the three press test files. No handoff block met; no other reader's report opened.

VERDICT: the shape is right (one owner, two exits) and fault 5 is real. As written it leaves four members of the family alive and adds two regressions. Each has a small exact fix.

HIGH (by the brief's definition; both rare)

H1. A finger's stale note can cross a squadron move.
- Cause: today cancelGestures clears firstFinger and pan BEFORE asking whether a press is live. The plan makes cancelGestures = pressEnd('cancel'), which returns at "if (!p) return false"; step 6 clears firstFinger only for a finger's press.
- Failure: a finger rests on the editing canvas (a pan, or after a Line-tool tap: not presses). His midnight move or a right ending moves the Tracker. A second finger lands: takeBackFirstFinger lays the old squadron's chart, layout and Undo lists over the new one when course and chart ids match (an exported-and-imported course has the same ids, msq-night-gestures' own premise). The next layout save writes it there. Same route after a sign-out with a lost lift: the last person's Undo lists return.
- Fix: cancelGestures keeps `firstFinger = null; pan = null` unconditional, before pressEnd.
- Test: touch pointerdown on empty canvas through the board, pick 149, second touch; expect 149's chart and lists untouched.

H2. R2 is keyed to the SYL swap, but saveLayout keys on curSylId() when it writes.
- Cause: between the identity flip (openSylHere `plan.sylId = id`; loadCourseNow `course = c` l.2255, `plan =` l.2272) and chartReplaced at l.2317, the generation is unchanged. A lift there runs commit, and saveLayout writes the OLD chart's layout under the NEW chart's key. The plan also deletes today's course/chart guard.
- Doors reaching it with a press alive (no leaveFlowEdits): switchSylNow (Duplicate, Delete syllabus), Revert (l.6640), resumeForPerson.
- Reach: not by a real pointer today, only because the store answers within microtasks (storage.js get is sync inside; flushNow is empty). It opens at the database step and in any slow-store test.
- Fix: keep course and curSylId() in `held`; pressEnd step 3 treats a mismatch as gone; pressBegin refuses while the loaded chart's identity differs from course/curSylId(); bump at loadCourseNow's first line and in openSylHere as well.
- T7: add a lift dispatched BEFORE the load's awaits finish. On the same chart the bend is stored and sylDirty stays true, under the plan as today.

MEDIUM

M1. Fault 1 survives for the two line ends.
- Cause: R1 lands at the top of pushChartStep, but pushUndo builds its snapshot as the argument, before that.
- Failure: a link's end held over a port (or a drawn line's end, moved), a keyboard edit (Font box, Arrow), then one Undo. The edit's step holds the pre-landing chart, so the reconnect goes too; a drawn line's end comes back loose, mid-carry. Even unmoved, the snapshot holds `L[key] = null`.
- Fix: land inside pushUndo, before the snapshot (pushChartStep's only other callers are the press's own).
- Test: endhandle held on a port, setFont(9), one doUndo; expect the link still reconnected.

M2. Touch: a landed save can be dropped.
- Cause: commit calls saveLayout, which defers while firstFinger is set (l.1277); step 6 then nulls firstFinger, so it is never stored. Fault 2 again.
- Reached by a no-hand redraw under a finger (trkWriteRecords' deferred renderBoard, trkStore.restore) and by lost-lift healing at pressBegin.
- Fix: for a LAND not from its own pointerup, `firstFinger = null` BEFORE commit (the built rule: something else done ends the take-back window and the finger's work stands). Step 6 afterwards only for cancel.
- Test: T2 by touch through the board, then C.renderBoard().

M3. The landing reads picks the caller changed before renderBoard's first line.
- Cause: applyEndSnap reads selEdge at commit.
- Failure (mouse beside a finger, row 17's premise): an end handle held near a port, a finger taps another link (`selEdge = k; renderBoard()`), and the OTHER link is reconnected. Same ordering: selectAllClick, then a held box's landing overwrites the selection.
- Fix: the end handle captures its key at pointerdown, as the bend does; the canvas capture listener lands a held press on any other pointer's pointerdown.

M4. "Moved" is undefined.
- Failure: if derived from pressChanged, the bend (and after step 6 the drawn line's end) is "moved" at pointerdown. doUndo then lands it and pops its own no-op step, and msq-night-press-undo's bend case goes red (STEP stays).
- Fix: an explicit `held.moved`, set by each kind's move handler.

M5. The page leaving the screen redraws a hidden board.
- Cause: the section is display:none; renderBoard in the editor cuts the canvas at canvasSize's floor (300×100); nothing refits on return (refitAfterShow returns in arrangeMode).
- Failure: W10 shows a small canvas after coming back.
- Fix: off screen, cancel without the redraw and redraw when shown (as landOwed). endSession gains the same redraw.

M6. chartReplaced's kill leaves a half-done layout where only SYL is replaced.
- Failure: at trkWriteRecords l.932 (another tab saves the chart's events), a moved ball or `L[key] = null` stays in memory, its step removed, and is stored by the next save.
- Fix: the kill is a cancel without redraw (layout back from the note), called before the swap. That restores Redo too.

M7. Build order.
- Step 1 deletes fingerStop but step 7 moves takeBackFirstFinger. Between them `held` is stale after a pinch; from step 2 the take-back's own redraw lands and saves it, breaking D134's "nothing on the command stream". Move it to step 1.
- Step 1's cancel needs chartGen/chartReplaced (step 4), and drops the course/chart guard three steps before its replacement.
- "Pointerup body becomes commit verbatim" contradicts "stop runs first and clears drag/marquee": endDrag begins `if (!drag) return`. Commit must close over its own record.

LOW
- Mouse press plus a two-finger zoom: takeBack must end the press only if `held.finger` (today a mouse drag carries on).
- The "no eleventh" grep shows more: deleteEvents l.6875, restore l.762, l.2365, and loadCourseNow's `c == null` return (course gone, no swap).
- Say whether chartReplaced runs before or after the swap; pruning needs after.
- pressChanged must go through pushChartStep (lastPush), or a refused landing leaves a dead step.
- The blur listener must not be capture (or must test target === window), else every Tab cancels a drag.
- Row 18 changes: Export's file picker blurs the window and cancels a held drag [browser behaviour not checked].
- Lead, unproven: dupSyl copies the chart as on screen (defCopy from live SYL), so a held press's half-done change may go into the copy. Land at its start.
- Lead, unproven: a landing's save issued inside another command (pushMarkUndo inside a gesture; trkWriteRecords' deferred redraw) joins that command; its refusal leaves the press's step. Check sSetOne under TRK_GESTURE_PENDING.

THE PLAN'S STATEMENTS ABOUT TODAY'S CODE
- True by reading: table 1.1; rows 3–17; fault 5 (pushUndo after the change, L live inside layout.__lines); the press-undo file holds every press unmoved; no unit test, and nothing in the smoke, sends pointercancel to a ball.
- Wrong, §6: a click on a drawn line's end does not add a step that "takes back nothing". Its step holds `L[key] = null`, so Undo after a mere click leaves the end loose. Step 6 mends it.
- Wrong, risk 1 "none fires by itself": trkWriteRecords' deferred renderBoard runs for any incoming Tracker record (a mark), and trkStore.restore for a refused command.
- Wrong but harmless, "no blur listener": the board has one (l.4306, the keyboard ring).
- Row 1: the take-back ends finger presses only.
- "Every night test stays green": holds for the three press files, given M4 and M7. I did not read the other fourteen files press by press.

HIS QUESTIONS
- Q1: the recommendation matches the app. The pinch code already rules that a key pressed under a held finger means the finger's work stands (releaseFirstFinger, walked E20).
- Q2: matches (ui-contracts: a cancelled touch moves nothing, everywhere else). But its example omits a page switch by his own hand. That is not an interruption; the plan's own rule would land it. Put it to him, or land it.
- Missed visible change: once the store is shared, another person's mark ends his drag mid-carry (today too, unsaved; under the plan saved where it was).

A SIMPLER, SAFER CUT
- Land at the input doors: the window capture keydown and pointerdown listeners that already end the take-back window (l.4264–4265). Any key, or another pointer's press, lands the held press before any handler changes anything.
- It removes the ordering hazards (M1, M3); the first-line landings in setTool, toggleArrange, persistSyl, doUndo and renderBoard become the belt for no-hand events and direct calls.
- Cost: about six lines; any key (an arrow, Shift) drops the ball where it is. That is a visible change, so it is his question.

CHECKED, NOTHING FOUND
- Pick → follow → cancel (no redraw runs before it); the questions' Stay; the hold; leaveSquadron.
- R1 against lastPush/dropRefusedStep on a refused landing; re-entry through restore with `held = null` first; Redo.
- msq-night-gestures' and press-held's expectations.
- No timer or React effect redraws during a drag (flashHint, resize, App's effects).

LOOKS FOR HIS IPHONE
- The plan's three.
- Whether iOS cancels the touch when a ball is carried to the left screen edge (back-swipe) or the bottom bar. Under Q2 it would snap back where today it saves, and D899 invites carrying to the edge.
