# [TRK-PINCH-DRAGS-BALL] — Fable's final code read (24 Sep 26)

Bug-check order §4 rank 2 / §5 FULL. Fable 5.1 (a subagent), blind to Astra, read-only, given
`docs/superpowers/briefs/2026-09-23-tracker-pinch-ball-final-read-brief.md` and the sheet. Kept verbatim;
dispositioned in `2026-09-23-tracker-pinch-ball.md` §10.

---

# Final read — `[TRK-PINCH-DRAGS-BALL]` (Fable 5.1, blind, read-only)

Read: the diff (`core.js` only), its surroundings (`wireBoard`, `enablePinchZoom`, the drag/marquee/handle gestures, `saveLayout`/`sSet`/`trkWrite`/`delKey`/`trkRestoring`, `applyHist`/`pushUndo`, `renderBoard`, `toggleArrange`, `endSession`, `dragScroll`, `installGlobalPan`), the evidence sheet, Astra's scenarios, the walk driver, the smoke block, `undo-contract.md`, `tracker.css`, `App.jsx`, and main's version of the pinch for comparison.

---

## Findings, ranked

### F1 — HIGH (conditional on the owner's browser; not provable from here). The take-back redraws the board while both fingers are still down, and the capture-phase counter now counts fingers whose landing redraws the board. Safari routes a touch's later events to the element it landed on even after that element is removed; those events never reach the board.

**What the code does.** `takeBackFirstFinger` calls `renderBoard()` (which replaces everything under `#board` via `innerHTML`) while finger 1 and finger 2 are still touching. Separately, because the pinch now counts in the **capture** phase, it also counts a first finger whose own handler redraws the board on landing — Delete on a drawn line (`deleteLine → renderBoard`), Merge's second pick (`mergeClick → renderBoard`), finishing a line (`finishLine → renderBoard`), selecting a line in Line/Edit lines (`selLine = …; renderBoard()`). On `main`, every one of those handlers also called `e.stopPropagation()`, so the bubble-phase counter never saw those fingers; the move to the capture phase removes that accidental protection.

**Why it matters.** Chromium (what the walk used) re-targets a touch whose element was removed, so the board still hears its moves and its lift — E1–E19 pass. WebKit/iOS Safari keeps dispatching a touch's `pointermove`/`pointerup` to the original (now detached) element; a detached element's event path does not include `#board`, so the board's listeners never fire. If that holds on his iPhone (the device he reported the original bug from), then in Edit chart layout:

- A pinch that begins on a ball takes the ball back (good) but **does not zoom** — the board hears no more moves.
- Both fingers' lifts are lost: `pts` keeps them, `pinching` stays `true`, `firstFinger` keeps a stale snapshot. **Every later touch on the chart is treated as part of a pinch**: `startDrag` returns, the svg's pointerdown returns, the ordinary chart's finger-scroll (`dragScroll.pointermove` checks `pinching`) dies too. Nothing on the chart responds until a reload or logout/login (the only things that re-create `#board`).
- Worse: with one ghost finger held, the **next real finger is counted as the second finger** → `takeBackFirstFinger()` fires with the stale snapshot and puts the chart back to how it was when the ghost landed — reverting real work done in between, including a ✓ Save changes (undo lists and `sylDirty` restored to pre-save).
- Without any pinch at all: **one finger tapping Delete on a drawn line** → the tap's landing redraws the board → its lift goes to the detached element → one ghost → the next single finger is a "pinch".

**Scenario (his card, in this order).** Tracker → ✎ Edit chart layout, Move tool. Fingers: one finger on a ball, a second finger beside it, spread. Expected: the ball stays put and the chart zooms about the fingers. Observed-if-wrong: the ball stays put, the chart does **not** zoom; then one finger alone no longer drags a ball, does not pan, and back on the ordinary chart one finger no longer scrolls. Second scenario: Delete tool, one finger tap on a drawn line, lift, then one finger drag a ball — observed-if-wrong: the line goes but the ball will not drag.

**New or older.** New with this change (the redraw mid-gesture and the capture-phase counting are both new; on `main` no pointer that the pinch counted ever had its element removed before its lift).

**Verified vs assumed.** The Chromium behaviour is verified by the walk. The WebKit behaviour is my reading of a documented WebKit trait, not something I could run. The sheet says the iPhone was not walked and D133 waived his look — so as it stands this ships to the one device where the doubt is, unchecked. The 30-second card above is the check.

**Fix (three parts; the first two are load-bearing).**

1. **Hold the fingers on the board before redrawing** — `enablePinchZoom`, the `pts.size === 2` branch: after `takeBackFirstFinger()` and before `perfOn()`, `for (const id of pts.keys()) { try { el.setPointerCapture(id); } catch (_) {} }`. Explicit capture to `#board` (which is never removed) is honoured for touch pointers in WebKit and Chromium, so both fingers' moves and lifts reach the board whatever happened to the elements they landed on. Do this **only at the second finger** — a pinch produces no click, so nothing is lost; capturing at the *first* finger would steal the tap's click from the ball (Chromium sends the click to the capturing element) and break every ball tap. `pointerleave` stays as it is (it will not fire for a captured pointer, which is fine — the lift comes as `pointerup` on the board). E18's window-listener experiment (B8) would not have helped here: a detached element's event path does not reach `window` either.
2. **Self-heal on a primary touch** — same `pointerdown` handler, before `pts.set`: `if (e.isPrimary && pts.size) { pts.clear(); start = null; firstFinger = null; if (pinching) { pinching = false; perfOff(); } }`. A touch with `isPrimary === true` is the OS saying no other finger is down, so anything still in `pts` is a lost lift. This covers the one-finger Delete/Merge/finish/select tap (which redraws on landing and needs no pinch to leave a ghost) and is a floor under any future redraw-mid-touch.
3. **Optional, cheaper and kinder to the DOM**: in `takeBackFirstFinger`, when `same` is true, do not `renderBoard()`; instead clear in place (`flushDragPaint()`, empty `#bandLayer`, put the dragged ball's `transform` back from `nodePos(drag.id)`, `highlightPort({x:1e9,y:1e9})` or a plain re-render of `#overlayLayer`). Then a pinch on a ball that never moved (the common case) detaches nothing. The `!same` case still needs the rebuild, so (1) stays.

**Tests that should go red first.**
- For (2), in the smoke block: dispatch synthetic pointer events via `pp.evaluate` to *simulate* a lost lift — `pointerdown` id 901 `isPrimary:true` on a ball, `pointerdown` id 902 `isPrimary:false` on `#flowSvg`, **no** `pointerup` for either — then a real CDP one-finger drag on a ball (E17's gesture) and assert the ball moved and undo rose by one. Today: `pts` holds two ghosts, `pinching` is true, `startDrag` returns → red.
- For (1) there is no Chromium test that can exercise Safari's routing; the test is **the card on his iPhone, steps 1 and 5, before the merge**, and a note in the sheet §8 that the device check is the gate for this finding.

---

### F2 — MEDIUM-LOW. Two of the new wires go red only in the walk driver, which is not a gate.

Break tests B3 (`fingerStop` stops the first finger's gesture) and B4 (the `pinching` guard in `startDrag`) each went red in exactly one walk row (E12, E15) and in **no** smoke check. The smoke block (`scripts/tracker/smoke.mjs`, the CI gate) covers M1, E1, E2, E5, Delete, Line, M2, M3 — not a line handle, not "lift one finger and carry on", not the half-drawn line, not undo/redo, not the selection box. A later edit could cut B3 or B4 with CI green.

**Scenario.** Edit lines, tap a drawn line, one finger on its orange end square, a second finger lands. Expected: nothing moves, the chart zooms. Observed-if-wrong (B3 cut): the end square keeps following finger 1 and reconnects on lift.

**New or older.** New (the wires are new).

**Fix.** Add two `ok(...)` checks to the `[TRK-PINCH-DRAGS-BALL]` smoke block, copied from the walk: E12 (`lend` square of a selected drawn line) and E15 (pinch, lift finger 2, move finger 1 50 px, lift; `look()` unchanged). ~30 lines. They go red when B3/B4 are cut and green now.

---

### F3 — LOW (two-handed, contrived). A change made by something *other than* the first finger, between the first finger landing and the second, is reverted by the take-back.

`holdFirstFinger` snapshots SYL, layout, both undo lists and `sylDirty` at the first finger's landing; `takeBackFirstFinger` restores all of them if *anything* differs, without asking who changed it. `clearDirty()` (✓ Save changes) empties both undo lists and clears `sylDirty`; `doUndo`/`doRedo` change all three.

**Scenario.** Edit chart layout with an unsaved edit waiting. One finger holds a ball (no movement). With the other hand, tap ✓ Save changes on the bar (the chart is written to the store, Save changes goes out, undo lists clear). Then a second finger lands on the board. Expected: the save stands. Observed-if-wrong: Save changes re-lights, ↶ comes back, the on-screen chart is the pre-save draft; the store holds the saved chart. The next ✓ Save changes writes the old draft over the new one — the save is quietly undone.

**New or older.** New.

**Fix.** In `clearDirty()`, `doUndo()` and `doRedo()` (and `persistSyl` if it does not go through `clearDirty`), add `firstFinger = null;` so a take-back after a bar action restores nothing (the finger's own gesture is still stopped by `fingerStop`). Test (smoke): CDP `touchStart` one finger on a ball, `pp.click('#saveChanges')`, `touchStart` adding a second finger, `touchEnd`; assert `look().save === false` and `look().undo === 0`. Red today.

---

### F4 — LOW (mouse + touch at once, contrived). `fingerStop` is one global, and the mouse sets it too.

`startDrag` / `startGroupDrag` / `startMarquee` / the handles set `fingerStop` for a **mouse** gesture as well (the pinch ignores the mouse, but these handlers do not). A take-back then calls the mouse drag's stop: `drag = null`, listeners removed. The mouse's `pointerup` reaches `endDrag`, which returns on `!drag` — the move is never saved.

**Scenario.** Desktop with touch. Mouse down on a ball and move it 40 px (undo step pushed); while holding the mouse, two fingers land on the board. Expected: the mouse drag is left alone (or completed). Observed-if-wrong: the ball sits where the mouse left it, ↶ is lit, the store still has the old place — a reload loses the move.

**New or older.** New (the stop path is new).

**Fix.** Set `fingerStop` only when `ev.pointerType !== 'mouse'` in `startDrag`, `startGroupDrag`, `startMarquee` and the four handle handlers (or key `fingerStop` by `pointerId` and have `takeBackFirstFinger` call only the first *touch* finger's). Test (jsdom, `retest.test.tsx` style): dispatch a mouse `pointerdown`+`pointermove` on a ball, then two touch `pointerdown`s on `#board`, then mouse `pointerup`; assert the layout key in `mem` carries the new position. Red today.

---

## Explicit negatives — checked and found nothing

- **The stored layout and the screen agree after a take-back.** `saveLayout` stores a JSON *string*, so `mem[f.key] !== f.stored` is a value comparison; `sSet`'s `mem` write is synchronous (`trkWrite`), so a Delete/Merge/finish-line save on landing is visible to the take-back; the restore puts the exact string back or deletes the key when it did not exist (`f.had` is reliable because `loadLayout → sGet` mirrors the current chart's key into `mem`). The two `storage.set` calls (the landing's, then the restore's) are issued in order.
- **Everything a first finger can change is inside the snapshot.** Drawn lines (`layout.__lines`), corners and loose ends (line `pts`/`a`/`b`), arrow bends and sides (`layout.__edgeMeta` — after any save `edgeMeta` *is* that object, so a bend moved on screen is in `JSON.stringify(layout)`), merges/unmerges (`__merges`/`__unmerges`), derived links (`__derived`, and SYL prereqs via `deriveLineLinks`), the selection, the armed merge line, the half-drawn line. `loadEdgeMeta()` rebuilds the Sets from the restored layout exactly as `applyHist` does.
- **The only store key a first finger can write is the layout key.** Checked `deleteLine`, `mergeClick`, `finishLine`, `insertBend`, `applyEndSnap`, `endDrag`, `endGroupDrag`, the `lvert`/`lend`/`linehandle` ups: all write through `saveLayout()`; SYL edits are draft-only (`sylDirty`) until ✓ Save changes; `pushUndo` is memory only.
- **Undo lists.** `pushUndo` pushes a fresh object and replaces `redoStack` with a new array, so the top-of-stack identity check is sound and E14's ↷ comes back from the slice.
- **`perfOn`/`perfOff` is a class toggle, not a counter** — a stopped gesture's missing `perfOff` cannot wedge it, and the take-back orders stop → `renderBoard()` → `perfOn()` so the *new* svg wears the class.
- **The pan.** `pan = null` at the take-back; `installGlobalPan`'s `end` returns on `!pan`; the svg's own `endPan` resets the cursor. The kept pan is the view the zoom anchors on (`start.p` is read after the take-back).
- **Every second-finger landing target in Edit chart layout starts nothing**: ball (`startDrag` guard), svg (guard before the Line branch), `.linehit`, `.lvert`, `.lend`, `.linehandle`, `.endhandle` (guards); `.edgehit` and `.port` are click-only / inert; the tool strip is outside `#board`.
- **Ways out of Edit chart layout.** Only `toggleArrange` (✓ Done, and the Logout "Discard unsaved edits" path at core.js:87 which calls it) and `endSession` set `arrangeMode = false`; both leave `view` at the identity, and `renderBoard` forces the identity on every ordinary-chart redraw regardless — no path can leave the edit pan/zoom on the ordinary chart. A syllabus switch keeps Edit chart layout (older behaviour), so nothing leaks there. `flushView()` in `drop` on the ordinary chart writes the identity — harmless.
- **Going in and out.** Canvas points and chart points are the same coordinate space (chart units), so `chartPointAt → placeCanvasPoint` and `canvasPointAt → placeChartPoint` hold the same point; `mid()`/`midOnScreen()` re-read the board after React moves it; the rAF re-place is guarded against a mode flip in between; `k` is clamped to the chart's 300 %; `zoomIsMine` is set only when the zoom actually changed, so an untouched zoom keeps auto-fitting on a rotate.
- **Capture-phase listeners and other input.** The mouse is ignored by pointer type in both modes (a mouse drag/pan is unchanged); `drop` now ignores pointers it never counted (on `main` a mouse `pointerup` cleared `start` harmlessly); `pointerleave` is deliberately non-capture so it fires only when leaving the board. The ordinary chart's `dragScroll` has no `pinching` check on pointerdown, but its pointermove nulls its state during a pinch and its `stop` returns on null state, so the changed listener order (drop before stop) has no interplay. `.board` and `#flowSvg.arrange` carry `touch-action: none`, so no native gesture cancels the pointers.
- **Concurrent actors that are not the other hand.** `flashHint`'s timer, the people bridge, `setSaveStatus`, `hintT` — none touch a snapshot field. `#board` persists across the Info tab (`display:none`), so the pinch's counter lives for the session.
- **Snapshot cost.** `JSON.stringify(SYL)`/`layout` on every first touch in edit mode duplicates what `startDrag` already does — a few ms at most.
- **D56 / filed exclusions.** Nothing here is a stored-data-only problem; `[TRK-EDIT-SIDEWAYS]` and `[TRK-TAP-AFTER-DRAG]` are not re-raised.
- **Astra's 17 scenarios and 6 questions** are each dispositioned in the sheet; I found no scenario of Astra's left unaddressed in code (F1 is a browser-routing risk Astra did not raise).

## Questions on the promise

1. **"Whatever the first finger started is taken back, however long it had been down."** There is no time or distance threshold: a ball dragged deliberately for two seconds, then joined by a second finger to zoom in and place it precisely, snaps back. The sheet states this to him; I flag it because the *pan* is kept on exactly the "it changes nothing" argument, while a deliberate long drag is the one first-finger act a person may want to keep. Product call — is "any second finger, ever" the intended trigger, or "a second finger within a short window"?
2. **D133 waived his look.** F1 can only be settled on his iPhone (Safari), which no walk here can drive. Should the two-step card (pinch on a ball → zooms; then one finger alone drags) run **before** the merge rather than after? It is thirty seconds and it is the whole risk.
3. **Undo contract.** The take-back's store write takes the raw branch (off the command stream), as `applyHist` does under N7. The stream therefore holds a `user` envelope for the landing's write with no `restore` envelope after it. The step-3 global undo would see a change that is no longer in effect. Same shape as today's legacy undo, so not new — but is that the intended shape for the Tracker until step 3 retires the legacy stacks, or should the take-back emit a `restore`-origin envelope?
