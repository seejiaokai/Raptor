I read an exported copy of `abc44cea3`.

**1. What I read.** I read the whole of `review/fixes.diff` (commits 334353046..abc44cea3) and, for each change, the whole function or file around it:
- the Tracker engine: the gesture and press code, Undo and Redo, the squadron move and hold, `leaveFlowEdits` and its callers, Connect, merge and the layout save, and the Export;
- `fileStore.js` whole and `topstate.ts` whole;
- in `store.ts`: the landing, `enterSquadron`, `maybeReenter` and `switchRoleView`;
- `pick.ts`, `belltap.ts` and the Tracker's storage follow;
- `InputWindow.tsx`: the held note, the swap question, every save and delete door, and the sheets;
- in `perms.ts`: `pageUnit` and `heldByMemberView`;
- the other places that open an input's window: the OIL day list, the two in the Leave War sync code, and `inputedit.tsx`.

I also read rulings D2323, D2389, D2395, D2637, D2381, D2318, D2317 and D148. I ran nothing.

**2. Findings**

F1 · One Undo during a drag takes back two changes · medium
- Failure: in Edit chart layout he adds ball B, then drags ball A part-way with the mouse still down, and presses Ctrl+Z. Ball A jumps back, which is the drag being cancelled as "never happened", and ball B also disappears. Two changes go, and only the drag was named on the button ("Undo a chart edit"). B can be got back only by Redo. The drag has left no trace in the history.
- Cause: `core.js` `endPressForStep`, called by `doUndo` and `doRedo`. `cancelGestures()` puts back the chart and both Undo lists as they were before the press, which removes the step the drag pushed at its first move (`pushChartStep` in `moveBall` or `moveGroup`). `step()` then pops the step before it.
- Fix:
  1. In `endPressForStep`, first take `const was = JSON.stringify(SYL) + JSON.stringify(layout) + JSON.stringify(edgeMeta)`.
  2. Then run `const had = cancelGestures()`.
  3. If `had`, call `renderBoard(); notify();`, and if the same string taken again now differs from `was`, return true: the cancel was this Undo.
  4. Make `endPressForStep` return that true, and in `doUndo` and `doRedo` write `if (endPressForStep()) return true;` before `step(...)`.
  5. A press that changed nothing (a handle pressed but not moved) still goes on to `step`, so the existing press-and-Undo test stays green.
- Test that fails today: Move tool; add ball B; press ball A and move it 60px with the button held; `doUndo()`; expect `byid[B]` to still exist (today it is gone).

F2 · Connect, merge and selection picks survive an Undo and a switch of chart or course with nothing unsaved · low
- Failure: on the Connect tool he clicks a ball X he just added (it is armed), then presses Ctrl+Z, which takes X away. He clicks ball Y: Y gains X as a prerequisite. Save stores a link to an event that does not exist. If an event later gets the name X, it silently becomes Y's prerequisite.
- The same happens when the chart or course is switched with nothing unsaved and X is not on the new chart. Fix 5's own comment says the chart and course switches "carried the same stale picks", but its clearing only runs when there are unsaved edits.
- Cause: `core.js` `leaveFlowEdits` returns at `if (!sylDirty) return true` before the new clearing line, and `applyHistData` (a chart step undone or redone) clears only `selEdge`.
- Fix:
  1. Move the picks-clearing line into a helper `clearPicks()`.
  2. Call it in `leaveFlowEdits` both in the clean branch (`if (!sylDirty) { clearPicks(); return true; }`) and where it is now, after the confirm.
  3. Call it at the end of `applyHistData` too.
- Test that fails today: `setTool('connect')`; `addModule` X; click X; `doUndo()`; click `SYL[0]`; expect its prerequisites unchanged.

F3 · A redraw that ends a ball or group drag leaves the move unsaved, contrary to its comment ("what it had done stands, as at a lift") · low
- Failure: with a ball held and moved, he switches the tool by keyboard. `setTool` redraws the chart, which ends the drag. The ball is drawn in its new place and an Undo step exists, but the layout is never written and nothing says "unsaved". A later squadron pick asks nothing, and the move is lost.
- Cause: `endPressesOnRedraw` runs the press's `stop` only. The work a lift does (`saveLayout()` in `endDrag` and `endGroupDrag`) never runs.
- Fix:
  1. Make `gestureBegan(stop, el, land)` store an optional `land` function.
  2. In `startDrag`, set `land = () => { const m = d.moved; d.stop(); if (m) saveLayout(); }`, and the same with `gd` in `startGroupDrag`.
  3. Have `endPressesOnRedraw` call `land` when there is one, otherwise `stop`.
- Test that fails today: drag a ball 60px with the button held; `setTool('select')`; expect the stored layout record for that chart to hold the ball's new x.

F4 · A line-handle press still outlives a Discard and other edits · low
- The four handle presses (a link's bend, a link's end, a drawn line's bend and its end) register with no element, so a redraw never ends them. Only Undo, Redo, a pick and a sign-out do.
- Failure (keyboard used while the mouse is held, the same premise as the night's fixes):
  1. He holds a link's bend handle and moves it.
  2. By keyboard he presses + Add course and answers "Discard them".
  3. He lets go. The lift runs `markDirty(); saveLayout()` and writes the bend into the chart he has just discarded.
  - Or, a ball added by keyboard while he holds the handle is wiped by a later "Save them", which cancels the press and lays its old note over the chart.
- Cause: `gestureBegan(stop)` is called with no element in the `.linehandle`, `.endhandle`, `.lvert` and `.lend` handlers, and `leaveFlowEdits` never calls `cancelGestures`.
- Fix:
  1. Pass `lh` or `h` as the element in each of the four `gestureBegan` calls, so a redraw ends them, using F3's `land`.
  2. In `leaveFlowEdits`, after the confirm, call `if (cancelGestures()) renderBoard();` before the discard.
- Test that fails today: select a link, press its bend handle and move it, run `addCourse()`, Discard, cancel the name, then send a pointerup on the window; expect `sylDirty` false and nothing written into the stored layout.

No finding on fix 1 (the input swap question and the hold checks) or fix 6 (the Export abort). Their doors and guards hold on every path I traced.

**3. Unproven leads**
- A bell line is marked read before the Tracker question is asked, so Stay leaves it read with nothing opened. To settle: check whether read lines stay in the bell's list.
- The OIL day list's link to an input sets the window before the page (the old B1 order). It matters only if that list can stand open in the member view on another squadron; I did not establish that.
- The Leave War's own link to an input window uses the same order. I believe it is reachable only from a held war window, whose controls are greyed.
- A bell line that opens Leave War, answered Stay, may leave the war's pending day and ring armed for the next visit. Not traced.

**4. Tidiness (filed, not fixed)**
- `endPressForStep` is an arrow function sitting among the exported Undo functions, while `endPressesOnRedraw` is a declared function. They are a matched pair of helpers in two shapes.
- `liveGestures` keeps the element only to test whether one was given; the element itself is never used.
- `writeTo` returns false on abort, but `saveCopyClick` ignores that and relies only on its own `gone()` check.
