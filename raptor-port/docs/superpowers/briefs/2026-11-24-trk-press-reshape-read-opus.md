# The Tracker press reshape plan: the fresh Opus reader's report (blind; 24 Nov 26, chat 162), saved from its hand-back

I read an exported copy of 91b5f476e (branch claude/msq-b1-screens-135) in C:\rc162. I found no handoff block and opened no other reader's report. I changed nothing and ran nothing; every point below comes from reading the plan and core.js.

**Verdict.** The idea is sound: one owner for a held press, and two ways out (LAND = finish it as if he let go; CANCEL = as if he never pressed). The plan's statements about today's code are almost all true. But three of its doors are in the wrong place or too narrow, so the family survives at least twice, and once it can write one chart's layout into another's.

**F1 — HIGH. The chart-change guard (R2) moves too late in a load, and the plan drops today's guard on course and chart.**

- **Who presses what.** A link's bend square (or any press) is held when a load of another chart starts. Doors that reach the load without the new cancel in leaveFlowEdits:
  - resumeForPerson (core.js l.1146–1150): no cancel at all, and a ball drag never marks the chart unsaved.
  - A switch queued behind a busy load chain.
  - openSylHere's `await savePlan()` when nobody is signed in as a person.
- **What happens in loadCourseNow:**
  - l.2271 wipes both Undo lists and l.2272 swaps `plan`, so `curSylId()` and `kLayout()` now point at the new chart.
  - It then awaits several reads before the content swap at l.2317, which is where the plan bumps `chartGen`.
  - A lift in that window: `chartGen` is unchanged, so `commit` → `saveLayout()` writes the old chart's layout under the new chart's key.
  - A system cancel or blur in that window (more likely now, since blur and pointercancel cancel): pressEnd step 5 puts back the old chart's Undo lists and unsaved mark. The load has already wiped the lists and will not wipe them again, so the new chart inherits the old chart's history. The next Undo applies the old chart's events and layout to the new chart and saves them (the cross-chart write loadCourseNow's own comment at l.2268–2270 exists to prevent).
- **Why today is safer.** Today's `cancelGestures` (l.4032) refuses to restore when `course` or `curSylId()` changed. The plan replaces that check with `p.gen !== chartGen`, so the reshape is weaker here than today.
- **Fix to the plan:**
  - Call `chartReplaced(true)` at the top of loadCourseNow, beside `loading = true` and before `course = c`. This also covers the null-course branch (l.2249), which never reaches l.2317.
  - Call it in openSylHere as well.
  - Keep the course and chart check beside the generation in pressEnd step 3.
  - Add a T7 variant that lifts, and one that cancels, after `loadCourse` has started but before it resolves.

**F2 — MEDIUM. R1 lands the press after an edit's Undo snapshot is already taken, so one Undo can still take back two changes.**

- **Cause.** `pushUndo()` (l.3324) builds the entry `{syl, lay}` before calling `pushChartStep`. The plan lands the press at the top of `pushChartStep`, after the snapshot.
- **Who presses what.**
  - A link's end handle, or a drawn line's end, is held and moved; he presses Delete, or changes the Font box.
  - The edit's snapshot holds the end unsnapped (drawn line: `L[key]=null`, no links worked out).
  - The landing then runs `applyEndSnap`, or the end's re-snap with `deriveLineLinks`, which changes the events' prerequisites. Then the stale snapshot is pushed.
  - One Undo of the Delete restores that snapshot: it takes back the Delete and the snap and its links together, and the button never named them.
- **Fix.** Land in `pushUndo` before the snapshot (`pressEnd('land')` as its first line). Keep the land in `pushChartStep` only as a belt. Add to T3b a case with a link's end lifted on a port.

**F3 — MEDIUM. R1 only watches pushes. Places that wipe or replace the Undo lists without a push are not covered.**

- **The places:**
  - `clearDirty` (l.6332), reached after awaits in persistSyl (l.6370 after `await sweepChart`), switchSylNow (l.6382), discardChartEdits (l.118) and l.6640.
  - removeStudent's filters (l.5785, l.5868).
- **What goes wrong.** A press begun during persistSyl's await survives clearDirty. Its later CANCEL (blur, system cancel, a pick's Discard) puts back the pre-Save Undo lists and `sylDirty = true`. The just-saved chart then reads unsaved, and Undo walks history that ✓ Save changes is supposed to end.
- **[Not checked]** whether sweepChart really yields to the event loop in a browser.
- **Fix:** either `clearDirty` lands any held press first, or the cancel puts back lists only when the press's own step is still the newest and the lists under it are the ones it noted; otherwise it removes its own step by `lastIndexOf`, as the bend's cancel does today (l.3759). The second is the safer general rule; the plan's "R1 guarantees it is newest" is not true.

**F4 — MEDIUM. Narrowing `cancelGestures` widens the filed lead about a finger's waiting save.**

- **Today.** l.4028 clears `firstFinger`, `fingerStop` and `pan` unconditionally, before the "no press" return.
- **The plan.** `pressEnd` returns early when nothing is held, and step 6 clears the finger hold only for a finger's press.
- **What goes wrong.** Take a finger that did a Delete or Merge tap in the editor (its save waits, `firstFinger.save`) and is still down at a midnight move, a right ending or a sign-out. The waiting save is no longer dropped. When the finger lifts, `releaseFirstFinger` → `saveLayout()` writes whatever `layout` then is (`{}` after emptyForMove, or the next squadron's) into the new squadron's record.
- **Fix.** `cancelGestures` keeps today's three unconditional clears, then calls `pressEnd('cancel')`.

**F5 — MEDIUM. Landing the old press when a new one begins redraws the board under the new press.**

- **Cause.** `pressBegin` LANDs the held press. For a group, a link's bend, a link's end and the drawn-line handles, that landing redraws the board (`renderBoard`), and the plan gives it no `repaint=false`.
- **What goes wrong.** The new press's element is removed while its own pointerdown runs:
  - `setPointerCapture` on a removed element fails silently.
  - Its moves and lift never arrive, so it becomes the next lost press.
  - The healing "a lost lift heals at the next press" then breaks the next press.
- **Fix.** `pressBegin` lands with `repaint=false`, and the redraw is deferred to the new press's end, or to the next frame.

**F6 — MEDIUM. `loading` becomes load-bearing but is never reset on failure.**

- **Cause.** loadCourseNow sets `loading = true` (l.2254) and clears it only at l.2369, with no `try/finally`. `onChain` swallows the error.
- **What goes wrong.** A load that throws (a migration read or write refused) leaves `loading` stuck. Today that is harmless. Under the plan, `pressBegin` then refuses every press for the rest of the session: every drag in the editor silently does nothing.
- **Fix.** Wrap loadCourseNow in `try/finally`.

**F7 — LOW–MEDIUM. A landing from outside reads choices the caller has already changed.**

- **Cause.** The link end's commit (`applyEndSnap`) reads the global `selEdge` at landing time. Many callers change a choice and then redraw: the link's click handler at l.3729, mergeClick at l.2871–2875, connectClick.
- **What goes wrong.** Landing at renderBoard's first line runs after that change. Example: a mouse holds an end while a finger taps another link, and the wrong link is reconnected.
- **Fix.** Capture the link's key at `pressBegin` (as the bend already does with `key`), and have the commit check that it is still on the chart.

**F8 — LOW. Gaps in the spec a builder will have to guess at.**

- **How "moved" is known.** The bend calls `pressChanged` at pointerdown and the line end changes the chart at pointerdown, so "changed" is not "moved". pressEnd needs a separate `pressMoved()` or flag.
- **`moved` must be captured before `stop()` clears `drag` and `groupDrag`.**
- **Order inside takeBackFirstFinger.** It must capture `f` before `pressEnd` nulls `firstFinger`.
- **applyHistData's `selEdge = null`.** Say whether it stays. Today a selected link is always deselected by an Undo; under the plan's pruning it would stay selected, which he would see.

**The missing-door check (ask 1)**

Ways the chart, history or picks can change while a press is held, and whether the plan covers each:
- **Covered:** keyboard edits (Delete, Font, + event, event list, ball editor, Reset layout, Arrow, Escape finishing a line); Undo and Redo; a tool change; Select all; Done editing; ✓ Save changes; a pick and the hold; sign-out; another tab's change; a refused save put back; the pinch.
- **Not covered:** the list wipes (F3); the load's early mutations and resumeForPerson (F1).
- **Not covered, a phone look:** the Tracker's own Flow → Info tab hides the board without ending the press (App.jsx l.109); only the whole page leaving the screen is covered.
- **[Not checked]:** a landing inside `trkWriteRecords`' delayed redraw (l.937–947, marks-only path) opens a new save command at the end of another command's transaction.

Press kinds: I count the same seven. The canvas pan, the pinch, the view-mode drag-scroll, the side-panel resizer and the Reorder windows' drags are correctly outside the plan.

**Is what it says about today true? (ask 2)**

- Every row of the 1.1 table checks out against the code, including the fifth fault: `.lvert` l.3823 and `.lend` l.3855 take their Undo step after the drag has changed the line. T5 should fail today.
- Two small corrections:
  - `cancelGestures` has five callers once `endPressForStep` is removed, not six.
  - The l.3375 claim is right, but see F8 on `selEdge`.
- **Tests "green unchanged":**
  - `msq-night-press-undo` holds every press without a move, so it should hold.
  - `msq-night-gestures` "a press under way when another squadron is picked" moves each press. It holds only because nothing redraws before follow's cancel. I checked and found no redraw on that path.
  - No existing test pins today's "a ball's cancelled touch saves".
  - The list omits the Playwright specs that touch the chart (`e2e/geometry.spec.ts`, `e2e/trk-scrollbars.spec.ts`).

**What it will break (ask 3)**

- An ordinary press–move–lift is unchanged.
- Undo during a touch drag still saves correctly: the window listener (l.4265) releases the finger hold first.
- A two-finger zoom is unchanged.
- One new double-Undo path: Undo with a moved ball whose landing save is refused. `dropRefusedStep` pops the drag's step, then `step()` pops the previous edit, so two changes go. Fix: `doUndo` stops after a refused landing.

**Build order (ask 4)**

- Step 1 says "nothing else moves", but its `pressBegin` landing already changes how two presses behave. That is fine; the plan says so for T6.
- T7 as written passes for the wrong reason: l.2271 wipes the step regardless. It needs F1's mid-load variant.
- T2's group case and T3a's line cases need `drawnLine()` (which saves) before the edit that makes the chart unsaved.

**Things a person would see that the plan's two questions miss (ask 5)**

- A selection box under a redraw, Undo or tool change now selects what it covers, instead of vanishing.
- On a clean chart, Rename course or Add syllabus pressed with a ball still held now cancels the drag. The chart stays on screen, so by the plan's own rule this should LAND.
- A link may stay selected after Undo (F8).
- Q1 and Q2: the plan's recommended answers match the rest of the app — the line handles, the box, the two-finger zoom and the Reorder lists already behave that way.

**Looks for his phone:** whether opening a native drop-down or the file picker fires a window blur (it would cancel a held drag); whether iOS sends a cancel to the first finger when a second lands; the Flow → Info tab hiding the board under a held press.

**A simpler, safer cut (ask 6):** keep the single owner and the two exits, but:
- land in `pushUndo` and in `clearDirty`;
- bump the chart generation at the start of a load, not at its middle;
- keep the course and chart check;
- have every landing that did not come from his own lift skip its redraw (`repaint=false`).

That costs about four extra one-line call sites and two more tests. It removes F1–F5 without touching the 89 redraw callers any further.

**Explicit negatives:** I found no timer or effect that redraws during an ordinary drag (App.jsx l.91, l.95, l.98, the resize listeners l.7824–7848, flashHint, the edge pan). There is no window blur or visibilitychange listener in core.js today. The Export lead is correctly left out.
