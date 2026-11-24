I read an exported copy of `334353046`.

## 1. What I read
- All of `review/fixes.diff`. I read the non-test changes closely, and of the three new test files only the held-input one.
- The code around each change: `state/store.ts` (landing, `enterSquadron`, re-entry, bands), `state/pick.ts`, `state/belltap.ts`, the `state/perms.ts` helpers, `tracker/role.js`, `tracker/storage.js`, `tracker/TrackerPage.tsx`, `ui/logout.ts`, `ui/heldro.ts`, the `ui/InputWindow.tsx` hold and chip, `ui/SquadronMenu.tsx`, `leavewar/ui/Sheet.tsx`, the layering CSS.
- In `tracker/app/core.js`: the move, the questions, dialogs, gestures, undo, save, Export and Import.
- Full rows of D2395, D2388, D2389, D2396, D2400, D2318, D2323, D2381, D2317, D2243, D148.
- Not opened: the questions-page spec. Nothing was run; every finding is traced from the code.

## 2. Findings

### F1 · A lift lost to a redraw makes a later "Save them" throw away his edits · high
**Failure:**
1. In Edit chart layout, he holds the mouse on a ball and presses Ctrl+Z (or Ctrl+Y), then lets go.
2. He carries on editing: adds balls, links, lines.
3. He picks another squadron, or logs out, and answers **Save them**.
4. The chart goes back to how it stood at step 1, and that older chart is what is saved (or "no changes to save"). Every edit after step 1 is gone, with no error. The Undo lists go back too.

The same stale restore runs in `leaveSquadron`, so a draft can be dropped without the "could not be saved" mark.

**Cause (`core.js`):**
- `step()` calls `renderBoard()`, whose `board.innerHTML = ...` removes the ball holding the capture, so `endDrag` never runs and `drag.stop` stays in `liveGestures` for good.
- `notePress()` then returns early on every later press (`if (liveGestures.size) return`), so `pressSnap` stays the step 1 chart.
- `cancelGestures()` sees a "live" gesture and restores that snapshot. The dead `stop()` may also throw on a null `drag`; the `try` hides it.

**Fix:**
1. Make `liveGestures` a `Map` of stop to element, with `gestureBegan(stop, el = null)`. Pass `g` from `startDrag` and `startGroupDrag`, and `svg` from `startMarquee`. The four line handles pass nothing, because their lift listeners are on `window`.
2. In `startDrag`, use `const d = drag; d.stop = () => { gestureEnded(d.stop); d.fe.stop(); ...remove listeners...; if (drag === d) drag = null; alignGuides = []; perfOff(); }`. Do the same with `groupDrag` in `startGroupDrag`.
3. In `renderBoard`, immediately before `board.innerHTML =`, add: `for (const [stop, el] of [...liveGestures]) if (el) { try { stop(); } catch (_) {} } if (!liveGestures.size) pressSnap = null;`.
4. In `cancelGestures`, iterate `liveGestures.keys()`.

**Test that fails today:** hold a ball, run `doUndo`, send no lift, add a ball, answer Save on a pick's question, and expect the added ball in the stored chart.

### F2 · A drag held through the switch to the member view raises an unseen box that kills Logout and picks · medium
**Failure:**
1. Hunter is on 149 by Plan, in Edit chart layout with an unsaved edit, holding a line's bend square or end.
2. He switches to the member view by keyboard (Tab to the chip, Enter). The Tracker is held and covered, but the drag stays alive.
3. He lifts. The drag calls `saveLayout()`, the gate refuses it (door 149, his page's squadron 142), and `trkRefused` raises "This change could not be saved." inside the hidden, inert Tracker.
4. `dlg` is now up and unseen. **Logout does nothing**, because the new `show` is a no-op where the Tracker is not offered. Every pick does nothing (`ask`: `if (dlg) return false`). Opening his own page bounces back. Only switching back to the admin view reveals the box.

**Cause:** `onStorageFollow.follow` in `core.js` returns `'held'` without cancelling gestures; only `leaveSquadron` cancels them. `TrackerPage` lifts the cover only for `switchAsking`, which a refusal box does not set.

**Fix:** in `follow(to, mayHold)`, after `unitWant = to`, add `const hadPress = liveGestures.size > 0; cancelGestures();`. Keep the existing hold test after it, and inside its branch, before `return 'held'`, add `if (hadPress) renderBoard();`.

**Test that fails today:** start a bend-square drag on a held-eligible draft, call `switchRoleView()`, dispatch `pointerup` on `window`, and expect `core.dlg` null and the stored layout unchanged.

### F3 · Fix 8 keeps the editor open but keeps its picks on balls just discarded, and a dropped ball can be saved as a prerequisite · medium
**Failure:**
1. In Edit chart layout he adds ball X (unsaved), takes Connect, and clicks X.
2. He presses + Add course, + Add syllabus or Rename course, answers OK to discard, then cancels the name box. He is still in the editor, X is gone, and nothing is shown as armed.
3. He clicks ball B. `connectClick` adds X to B's prerequisites and marks the chart unsaved.
4. Save stores it. B's details read "Prerequisites: X". If he later adds X again, which is likely after discarding it, B silently waits on X for every student on that chart.

Stale `selBalls` similarly writes a layout entry for the dropped ball on the next group drag, and a half-drawn line survives too.

**Cause:** `discardChartEdits(true)` skips `toggleArrange()`, which cleared `connectSrc`, and leaving the editor is what made the next entry's `setTool` clear the rest. `loadCourseNow` clears none of them.

**Fix:** in `leaveFlowEdits`, straight after the `uiConfirm` passes and before either branch, add `connectSrc = null; mergeFirst = null; drawing = null; selBalls = new Set(); selLine = null; selEdge = null;`. This also covers the `loadsNext` switch of chart or course, which carries the same stale pick today.

**Test that fails today:** arm Connect on an unsaved ball, discard through `addCourse` and cancel its prompt, click another ball, and expect its `prereqs` unchanged and `sylDirty` false.

### F4 · On a phone the held Input window still has no way back, so his typed words are lost · low
**Failure:**
1. On a phone, on 149's Inputs, he types in another man's input. A short window leaves ☰ reachable.
2. He opens ☰ and presses "Switch to the member view". He lands on View-only Sched and the window becomes the shaded dialog.
3. The band says "Switch back to the admin view to change this, or close it.", but the chip is hidden at 820px and below, and the shade covers ☰. His only exits are Close or a press on the shade, and both lose his words. This is the fault fix 7 closes on a desktop.

**Cause:** `InputEditor` in `ui/InputWindow.tsx` sets `chipAt` to null when `#roleBadge` has no width.

**Fix:**
1. Because this adds something he will see, draw it and show him first (D1625). Recommended: where `#roleBadge` has no width, the band carries one button using the ☰ menu's existing words, "Back to the admin view".
2. Once approved, render that button inside `.saveband.moveband` while `heldMv && !win && !chipAt`, with `onClick={() => switchRoleView()}`. It is already live, because `holdReadOnly` leaves the band unlocked.

**Test that fails today:** with `#roleBadge` at zero width, hold the window and expect a live control that returns to the admin view with the typed remark intact.

## 3. Unproven leads
- **Leave War window in the member view:** a blocking sheet's scrim (79) stands over the top bar (60) and Tab is held inside it, so the band's "switch back" may be unreachable there too. I found no route into that state with a blocking sheet; settle by walking one open across the switch.
- **Export abandoned after the picker:** if the browser has already created or emptied the chosen file, `gone()` leaves an empty file with no message, perhaps over an older backup. Settle by trying it in Chrome with an existing file.
- **A thrown save counts as "go on":** `trackerSwitchAsk` and `trackerMayLogOut` both proceed if `saveForQuestion` rejects, which would drop the draft. I could not establish that `persistSyl` can throw today.
- **A finger's waiting save:** `cancelGestures` sets `firstFinger = null` without making its held `saveLayout`, so "Save them" answered with another finger while one is held may miss a line delete or merge. Settle with a two-pointer test.
- **Stale picture after a refused Save:** `cancelGestures` restores the data but does not redraw, so a half-dragged ball can stay drawn until the next redraw. No saved data is affected.

## 4. Tidiness note (filed, not fixed)
- `saveCopyClick` checks `gone()` twice in a row after the picker.
- `cancelGestures` repeats the chart-restore lines of `takeBackFirstFinger`.
- The lifted chip re-creates the top bar's button by hand in `InputWindow.tsx`, so the two can drift apart.
