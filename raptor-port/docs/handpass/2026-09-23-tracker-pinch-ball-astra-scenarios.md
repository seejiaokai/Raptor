# [TRK-PINCH-DRAGS-BALL] — Astra's scenario design (23 Sep 26)

**What this is.** Bug-check order §4 rank 1: a model that did NOT build the fix designs the test
scenarios, hunting for what is MISSING. Astra (Codex CLI, `codex exec -s read-only`, gpt-5.6-sol, high),
briefed with `docs/superpowers/briefs/2026-09-23-tracker-pinch-drags-ball-scenarios-brief.md`, before any
code was changed. Kept verbatim below; every item is dispositioned in the evidence sheet
`2026-09-23-tracker-pinch-ball.md`.

---

## Astra's report, verbatim

# Tracker pinch-cancellation scenario report

I completed the requested read-only inspection. I edited nothing and ran no app, tests, scripts, builds, or Git commands.

Sources inspected: the [brief](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/briefs/2026-09-23-tracker-pinch-drags-ball-scenarios-brief.md), [Tracker board code](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js), [Edit chart layout tools](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/components/ArrangeTools.jsx), and the [earlier pinch evidence sheet](/C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-23-tracker-pinch.md).

## Required result for every scenario

Take a “before” record immediately before the first finger lands. Once a second finger lands, the interaction becomes a pinch and must leave:

- Every ball, selected group, prerequisite arrow and drawn line exactly as it was before the first finger landed.
- The stored layout unchanged. After a reload or syllabus round trip, everything must still be in its original place.
- The undo and redo lists exactly unchanged. In particular, an existing Redo must survive.
- `✓ Save changes` exactly as it was before the gesture: absent if clean, still lit if an unrelated structure edit was already waiting.
- The prior ball, line, connection, merge and drawing selections unchanged.
- No leftover selection box, alignment guides, line preview, enlarged port, dialog or editor.
- No tap action after the fingers lift: no marking pop-up, Details bubble, editor, deletion question, connection or line selection.
- The zoom must change unless already at its limit. The chart point under the fingers when the second finger lands must remain under their current midpoint, including when both fingers slide.
- Reaching a zoom limit must still cancel the first-finger operation even though the scale itself cannot move.

For an existing half-drawn line, my recommended interpretation is “restore the state before the first finger landed”: the half-drawn line remains half-drawn, but the attempted finishing touch is taken back.

## 1. Complete first-finger enumeration

I have started with the least-shared, most specialised surfaces as instructed.

| Surface or tool | Where the first finger can land and what it starts | What the pinch must leave |
|---|---|---|
| **Edit lines — selected prerequisite arrow** | Blue middle square starts bending the arrow. Either orange end starts reconnecting it. | Original bend, endpoints, prerequisite pair and selection; no history, save or stored-layout change. |
| **Edit lines — selected drawn line** | An orange end detaches and moves the line end. A blue square reshapes an internal bend. | Original points, anchors, derived prerequisite and selection; no history, save or storage change. |
| **Edit lines — blue ball port** | The port is only a destination for a dragged end; it has no action of its own. | Pinch only. Ports remain visible and unchanged. |
| **Edit lines — line body** | A prerequisite arrow or drawn line becomes selected and gains handles. | The selection that existed before the first finger landed, not the newly touched line. |
| **Merge / Unmerge — first line** | Touching a drawn line arms it as the first half of a pair. A prerequisite arrow is armed through its line hit area/click. | Previous selection and previously armed pair, if any. No latent “first line” left after the pinch. |
| **Merge / Unmerge — second line** | If a first line is already armed, touching the second can immediately change crossing hops and can snap drawn lines flush. | Both lines exactly unchanged; the pre-pinch armed selection remains; no undo, save or stored write. |
| **Merge / Unmerge — one finger on each line** | The first finger can arm line one, then the second finger’s own down event can select line two before the board recognises the pinch. | Neither merge nor unmerge occurs. |
| **Line — no line in progress** | Empty canvas, a ball, a blue port, a prerequisite arrow or a loose line end can start a new line. A drawn-line body can select that line instead. | No new line or preview; pre-existing line selection remains. |
| **Line — line already half-drawn** | The next finger-down on empty space, a ball/port, drawn line, loose end or prerequisite arrow finishes and saves the line immediately. | The attempted finish is undone completely; recommended result is that the original half-drawn line remains waiting for its endpoint. |
| **Line / Edit lines — drawn-line orange end** | Detaches the line anchor immediately, before any movement. | Original anchor and geometry. |
| **Line / Edit lines — drawn-line blue square** | Moves an internal corner. | Original geometry and selection. |
| **Delete — drawn line** | Deletion occurs on finger-down, before a second finger can be recognised. | Line, anchors, derived prerequisites, selection and history unchanged. |
| **Delete — prerequisite arrow** | A tap can open the “Remove link?” question and then remove the prerequisite. | No question and no deletion. |
| **Delete — ball or selected group** | A tap can delete the ball or entire selected group. | No question/deletion; selection unchanged. |
| **Select — selected ball** | Starts dragging the entire selected group. | Every selected ball returns to its starting place; original selection remains. |
| **Select — unselected ball** | Immediately replaces the selection with that ball, then starts a group drag. | The old selection is restored; the touched ball does not remain selected or move. |
| **Select — empty canvas** | Starts the translucent selection box. | Previous selection remains; the selection rectangle disappears. |
| **Select — drawn-line body** | Because a drawn line is not excluded from the canvas path in this mode, it can also begin a selection box. | Same as empty canvas. |
| **Move — ball** | Starts a single-ball drag, alignment guides, an undo entry on first movement, and an automatic layout save on release. | Ball restored, guides gone, no history change, no automatic save. |
| **Move — second finger on another ball** | The second ball can replace the first as the active drag before pinch recognition. | Neither ball moves and no drag survives. |
| **Move — empty canvas or drawn-line body** | Starts panning the editing canvas. | Pinch zooms about the fingers. The treatment of any pan completed before the second finger lands needs an owner ruling below. |
| **Move — prerequisite arrow** | It is excluded from canvas pan and can become selected through its click path. | No new line selection or trailing click. |
| **Connect — first ball** | A tap chooses the prerequisite source. | Existing connection-source selection remains unchanged. |
| **Connect — second ball after a source is chosen** | A tap completes a prerequisite, clears the source and marks structure dirty. | No prerequisite is created and the original source remains selected. |
| **Connect — same source ball** | A tap normally clears the source. | Source remains selected. |
| **Connect — empty canvas or drawn line** | Starts canvas pan. | Pinch only; no connection state change. |
| **Text — ball** | A tap opens the event editor. | No editor; prior selection remains. |
| **Text — empty canvas or drawn line** | Starts canvas pan. | Pinch only. |
| **Any editing tool — empty canvas** | Depending on the active tool: pan, selection box or line start. | The applicable action above is cancelled and the pinch owns both fingers. |
| **Any editing tool — second finger on empty canvas** | The second finger should only turn the interaction into a pinch. | It must not begin a second pan, selection box or line. |
| **Any editing tool — second finger on another ball** | Its child-level handler runs before the board’s pinch handler. | It must not start a second drag, selection, connection, deletion or editor action. |
| **Alignment-guide overlay** | Appears while moving a ball. It is not itself a target. | Must disappear when the pinch cancels the drag. |
| **Selection-box overlay** | Appears during Select on empty space. | Must disappear without changing selection. |
| **Half-drawn-line preview** | Follows pointer movement while Line is active. | Restored to its pre-finger state, with no stray preview movement caused by the second finger. |
| **Loose amber line end** | Can be selected, snapped to, or used as a line endpoint. | Its line and anchor relationships remain unchanged. |

### Tool-strip controls that are not canvas gesture starts

I checked every tool-strip control.

- `+ Flight`, `+ Acad`, `+ Test`, `+ Sim`, and `+ CFT/IAT/EPT` open an add-event question.
- `Arrow` changes an already selected line.
- `Select all` changes selection.
- `Font` changes font size.
- `Fit` changes only the view.
- `Reset layout` asks before resetting the layout.
- `Edit events` opens the full editor.

They sit outside the board carrying the pinch listener, so they are not valid first-finger pinch starts. They are useful setup controls, but a two-finger gesture beginning on one of these buttons is outside this fix.

### Normal chart enumeration

| First-finger start | Normal action | Pinch result required |
|---|---|---|
| Empty chart, line or background | One-finger drag-scroll | Pinch zooms about the fingers. After one finger lifts, the surviving-finger rule needs to be made explicit. |
| Ball centre or selected student’s wedge | Opens the marking pop-up | Pinch only; no pop-up. |
| Another student’s wedge | Switches the selected student | Pinch only; student unchanged. |
| Ball while Details mode is on | Opens the Details bubble | Pinch only; no bubble. |
| Ball with no students present | Shows the “No students” hint | Pinch only; no tap hint. |
| Second finger on another ball | Could otherwise produce a second tap target | Neither ball performs its tap action. |
| Pinch after an ordinary scroll | Starts from the newly viewed position | The point under the second-finger midpoint remains there throughout the pinch. |
| Pinch at 10% or 300% limit | Scale may be clamped | No tap action; chart remains stable. |
| Lift either finger, move the remaining finger | Continuous transition case | Requires the owner ruling below; it must at least never begin a chart edit. |

## 2. Ranked production scenarios

Use one sacrificial syllabus containing:

- Two ordinary balls with space between them.
- A three-ball selected group.
- A prerequisite arrow.
- A drawn line with an internal bend and a loose end.
- Two crossing drawn lines.
- A clean saved baseline.
- A second baseline with an unrelated unsaved structure edit.
- A history baseline with both Undo and Redo available.

Repeat at 390×844 phone, 844×390 sideways phone and 1366×1024 tablet. Photograph before and after every performed case. If sideways Edit chart layout still has no visible chart, photograph that blocked door and mark every editing scenario **BLOCKED**, not passed. Normal-chart cases remain executable sideways.

Use these two exact gesture orders:

- **Immediate:** Finger A down; within 30 ms Finger B down; spread from about 60 px to 180 px over 12 moves while sliding the midpoint about 30 px; lift B; move A another 50 px; lift A. Repeat lifting A first.
- **Delayed:** Finger A down; move it 30–40 px over at least four moves while keeping it down; Finger B down on the named target; perform the same pinch/slide and both lift orders.

### 1. Finish a half-drawn line, then pinch

- **Setup:** Line tool; create the first endpoint so the dashed preview is waiting. Record history, Save changes, selection and stored line list.
- **Action:** Immediate order with Finger A on each endpoint type in separate runs: empty canvas, ball/port, drawn line, loose end, prerequisite arrow. Finger B lands on empty canvas. Repeat one run with B on another ball.
- **Expected:** No line is committed. Recommended: the original half-drawn line remains waiting. Zoom follows the midpoint.
- **Wrong if:** A new line appears, a prerequisite is created, Undo changes, Save changes lights, the layout survives reload, or the draft disappears unexpectedly.
- **Current-code expectation:** **FAIL.** The finishing action is committed on Finger A’s down event before the board sees Finger B.

### 2. Merge and Unmerge across two lines

- **Setup:** Two crossing drawn lines; then repeat with a drawn line crossing a prerequisite arrow.
- **Action A:** Arm the first line normally. Put Finger A on the second line, then Finger B on empty canvas and pinch.
- **Action B:** No line armed. Put Finger A on line one and Finger B directly on line two, then pinch.
- **Expected:** Crossing style and geometry unchanged; the pre-pinch armed selection preserved exactly.
- **Wrong if:** A hop appears/disappears, a line snaps flush, history or Save changes changes, or the next ordinary tap unexpectedly completes an armed pair.
- **Current-code expectation:** **FAIL** for drawn lines. Their operation begins on pointer-down, and Finger B can execute the second half before pinch recognition.

### 3. Delete a drawn line

- **Setup:** Select Delete; use a drawn line whose removal would also affect a derived prerequisite.
- **Action:** Finger A down on the line body; before lifting it, Finger B down on empty canvas and pinch.
- **Expected:** Line and derived prerequisite remain; no history, dirty or stored-layout change.
- **Wrong if:** The line vanishes even briefly, Undo lights, Save changes appears, or it remains missing after reload.
- **Current-code expectation:** **FAIL.** Drawn-line deletion happens on Finger A down.

### 4. Edit a prerequisite arrow’s bend and ends

- **Setup:** Edit lines; select a prerequisite arrow so its blue square and orange ends show.
- **Action:** Run immediate and delayed gestures beginning on the blue square, then each orange end. For delayed end tests, move toward a different ball port before Finger B lands.
- **Expected:** Arrow route, source, destination and selection restored; no history/save/storage change.
- **Wrong if:** The blue square moves, either end reconnects, the prerequisite changes, or a new undo step appears.
- **Current-code expectation:** **FAIL** for the blue square: it creates history immediately and has no pinch cancellation. End reconnection is also at high risk because its move/up handlers do not distinguish the two fingers.

### 5. Edit a drawn line’s ends and bend squares

- **Setup:** Select a drawn line with an attached end, loose end and internal bend.
- **Action:** Immediate and delayed gestures from each orange end and each blue bend square. Land Finger B first on empty canvas, then on a ball.
- **Expected:** Original points and anchors restored; no derived-link change.
- **Wrong if:** An end becomes loose, snaps somewhere new, a corner moves, or anything persists.
- **Current-code expectation:** **FAIL.** An end is detached on Finger A down; bend movements continue during the pinch and are committed on pointer-up.

### 6. Selected-group drag

- **Setup:** Select three balls; record all positions and the visible dashed selection rings.
- **Action:** Delayed order from one selected ball. First land B on empty canvas; repeat with B on a fourth, unselected ball. Run both lift orders.
- **Expected:** All positions and the original three-ball selection restored; zoom follows the midpoint.
- **Wrong if:** Any ball moves, the fourth ball replaces the selection, history changes, or a moved position returns after reload.
- **Current-code expectation:** **FAIL.** Group drag has no pinch guard or rollback, and B on another ball can replace the active group drag.

### 7. Selection-box pinch

- **Setup:** Select two balls, then keep Select active.
- **Action:** Finger A down on empty space and move far enough to show the translucent box. While holding A, put B first on empty space and then, in a second run, on another ball. Pinch and use both lift orders.
- **Expected:** Box disappears; original two-ball selection remains.
- **Wrong if:** A new set becomes selected, selection clears, the rectangle remains, or a ball moves.
- **Current-code expectation:** **FAIL.** The marquee has no pinch check, does not filter pointer identity, and either finger’s lift can complete it.

### 8. Single-ball drag, including the known bug

- **Setup:** Move tool; clean saved layout; Undo and Redo initially off.
- **Action:** Immediate and delayed orders from the centre of a ball. B lands on empty canvas in one run and a second ball in another. Run both lift orders.
- **Expected:** Both balls retain their exact positions; Undo/Redo remain off; Save changes remains absent; reload shows the originals; pinch anchor stays under the midpoint.
- **Wrong if:** A ball moves, Undo lights, storage changes, Save changes lights, or zoom drifts.
- **Current-code expectation:** **FAIL.** This is the observed defect. The move handler continues during the pinch, adds history, and the drop saves the layout.

### 9. Pinch directly after Undo

- **Setup:** Make two distinguishable chart edits, press Undo once so Redo is visibly available, then enter Move.
- **Action:** Perform the delayed ball-drag-to-pinch order. Repeat with a selected group.
- **Expected:** Redo stays available and still redoes the original second edit. Undo still names the original first edit. No pinch step enters either list.
- **Wrong if:** Redo greys out, redoes a ball movement, Undo gains a step, or the old history order changes.
- **Current-code expectation:** **FAIL.** The first drag movement explicitly clears Redo while adding its own Undo snapshot.

### 10. Preserve an already-dirty editing session

- **Setup:** Make an unrelated structure edit so `✓ Save changes` is already lit. Record the draft and history.
- **Action:** Repeat the single-ball, group, selected-line-handle and half-drawn-line pinch cases.
- **Expected:** The existing Save button remains lit and the unrelated draft remains intact, but the pinch adds nothing to it.
- **Wrong if:** Save changes disappears, the draft is lost, an extra edit is included, or the pinch adds/removes history.
- **Current-code expectation:** **FAIL** for the object changes. This case is essential because a repair that simply restores an old stored layout or clears dirty state would destroy valid pending work.

### 11. Connect tool, both stages

- **Setup A:** No source selected.  
  **Setup B:** One source ball already selected.
- **Action:** Pinch with A on a ball and B on empty canvas; repeat with B on another ball and on the already selected source.
- **Expected:** Setup A remains with no source. Setup B keeps the same source and creates no prerequisite.
- **Wrong if:** A cyan source ring appears/disappears, a link is created, Save changes lights, or a dialog appears.
- **Current-code expectation:** **UNCERTAIN.** Connection is click-driven rather than movement-driven, so Chromium may suppress the click after a pinch. There is no explicit pinch protection, so it must be walked.

### 12. Text and Delete on balls and prerequisite arrows

- **Setup:** Text on a ball; Delete on a single ball, selected group and prerequisite arrow.
- **Action:** Immediate and delayed pinch from each target, with B alternating between empty canvas and another ball.
- **Expected:** No editor, deletion question, deletion or selection change.
- **Wrong if:** Any modal opens or any item is deleted.
- **Current-code expectation:** **UNCERTAIN.** These are click-driven except drawn-line deletion. The code relies on the browser suppressing a pinch-generated click rather than explicitly suppressing it.

### 13. Empty-canvas pan changing into a pinch

- **Setup:** Move, Connect and Text in separate runs.
- **Action:** A down on empty canvas. Run immediate and delayed versions; in the delayed version pan 40 px before B lands. Pinch, lift B, continue moving A 50 px, then lift. Repeat lifting A first.
- **Expected:** Zoom anchor remains correct. No object or selection changes. The pre-second-finger pan and surviving-finger behaviour depend on the ruling below.
- **Wrong if:** The chart jumps, a stale grab cursor/fast-render state remains, or the surviving finger unexpectedly edits an object.
- **Current-code expectation:** **LIKELY FAIL** for continuous one-finger carry-on. The pan is cancelled during pinch and is not re-established for the finger that remains down.

### 14. Normal chart: ball, empty chart and Details mode

- **Setup:** Normal chart with a student selected; repeat in Details mode and with no students.
- **Action:** Immediate and delayed pinches beginning with A on the ball centre, the selected student’s wedge, another student’s wedge and empty chart. Alternate B between empty space and another ball.
- **Expected:** No marking pop-up, student switch, Details bubble or hint. Zoom anchor remains correct.
- **Wrong if:** Any tap action occurs after the fingers lift, or the chart point drifts.
- **Current-code expectation:** **Anchor should pass** based on the shared anchor code and earlier walk. Tap suppression is **UNCERTAIN** because it is delegated to browser click behaviour.

### 15. Normal chart: lift one finger and continue with the other

- **Setup:** Start a normal pinch on empty chart.
- **Action:** Pinch and slide, lift B while A stays down, move A 80 px, then lift. Repeat lifting A and moving B.
- **Expected:** Apply the owner ruling below; the interaction must be smooth and must not generate a ball tap.
- **Wrong if:** It jumps, remains inert when continuation is meant to pan, or opens a ball action.
- **Current-code expectation:** **LIKELY FAIL** if continuation is supposed to scroll. Normal drag-scroll discards its one-finger state during the pinch and does not recreate it until a fresh finger-down.

### 16. Zoom limits

- **Setup:** Put Edit chart layout at 10% and 400%; normal chart at 10% and 300%.
- **Action:** Begin a qualifying object gesture, then pinch farther beyond the active limit.
- **Expected:** The object gesture is still cancelled even if zoom remains numerically unchanged.
- **Wrong if:** A ball, line, selection or history changes because “no scale change” was treated as “not a pinch.”
- **Current-code expectation:** **FAIL** for the same object paths; the pinch flag is set, but those paths do not consult it.

### 17. Persistence and downstream readback

- **Setup:** Use clean copies of the ball, group, line, arrow and half-drawn-line cases.
- **Action:** Perform the pinch, leave Edit chart layout, reload, and switch away from and back to the syllabus.
- **Expected:** Normal chart, re-entered Edit chart layout and any exported layout all show the original geometry and structure.
- **Wrong if:** Any cancelled change returns after reload or syllabus switching.
- **Current-code expectation:** **FAIL** wherever a current handler calls the automatic layout save before or after the pinch.

## Why I expect the current code to fail

The pinch handler currently records the two fingers and changes zoom. It does not take a pre-gesture snapshot and does not cancel or roll back ball drag, group drag, selection box, line drawing, line handles, deletion, merge/unmerge, selection or their history changes.

Only canvas pan and normal-chart drag-scroll explicitly notice that a pinch is happening. Even those discard their one-finger state rather than handing the remaining finger a smooth continuation.

There are two particularly risky ordering problems:

1. A child object handles Finger B’s `pointerdown` before that event reaches the board and turns on pinch mode. Finger B can therefore start or complete another edit.
2. Several line and selection handlers listen to general move/up events without checking which finger generated them. Either finger can move or commit the first finger’s edit.

## 3. Explicit negatives

- I checked both flow-chart renderings and found no third chart renderer: the normal chart and Edit chart layout share the same board and pinch handler.
- I checked Tracker access and found no role split to walk. Admin and member use the same Tracker surface and writers.
- I checked the normal chart and found no ball-position writer there. Its ball actions are marking, student selection or Details; layout writing is an Edit chart layout problem.
- I checked zoom persistence and found no stored zoom record. Normal `flowZoom` and editing `view` are session/view state.
- I checked the previously repaired anchor calculation and found both normal and editing pinch paths using the intended chart/canvas origins. I found no additional zoom anchor copy.
- I checked `+`/`−`, Reset zoom and mouse-wheel zoom. They are not first-finger touch-edit starts for this fix.
- I checked `Fit` and found it intentionally frames the entire editing chart rather than zooming about a finger anchor.
- I checked the side panel’s own zoom and found it separate from flow-chart pinch.
- I checked every toolbar button and found no board pinch listener on the toolbar itself.
- I checked selection rings, alignment guides, marquee, ports and line handles. Their drawing alone does not write storage; the danger is the gesture handler that changes the underlying item.
- I checked the history contract and found the intended single shared Undo/Redo stack, including clearing on course/syllabus changes and Save changes. I found no separate editing-only history that also needs coverage.
- I checked Save changes semantics and found the stated ruling represented: a moved ball saves its position on landing without lighting Save changes; structure edits light Save changes.
- I checked the existing automated pinch coverage and found it tests the anchor on the normal chart and empty editing canvas. It deliberately avoids starting on an editing ball and does not cover cancellation of the specialised object gestures above.
- I checked the earlier evidence sheet and found the sideways-phone editing surface already filed as having no chart room. That is a blocked production door, not evidence that these pinch cases pass there.
- I found no migration or older-record-only issue. Every predicted failure can be produced again with newly created data, so none is excluded by the demo-data ruling.
- I did not treat three fingers, a pinch starting on a toolbar button, desktop trackpad page zoom, or the side panel as findings for this fix.

## 4. Questions and under-specified behaviour

1. **Pan before the second finger lands:** If Finger A has already panned the chart 40 px, should Finger B undo that pan, or should the pinch begin from the newly panned view?  
   Recommendation: preserve the completed pan and begin the pinch from the view at Finger B’s landing. Roll back only editable objects and state.

2. **One finger remains after a pinch:** Should the remaining finger immediately pan the chart, or should nothing happen until it is lifted and pressed again?  
   Recommendation: it should pan smoothly from its current location, in both normal and Edit chart layout, but must never resume a cancelled ball or line edit.

3. **Half-drawn line:** Should pinching preserve the already half-drawn line, or cancel line drawing completely?  
   Recommendation: preserve the draft exactly as it existed before the attempted finishing touch. That is the literal rollback of “whatever the first finger started.”

4. **Normal-chart ball taps:** The filed promise names Edit chart layout, but a normal pinch can also begin on a ball that normally opens marking, selects a student or opens Details. Should all resulting taps be expressly suppressed?  
   Recommendation: yes. A two-finger gesture should produce zoom only.

5. **Immediate pointer-down operations:** Does “whatever the first finger had started” include Delete, Merge/Unmerge and finishing a line when those actions commit on finger-down before the second finger arrives?  
   Recommendation: yes, while Finger A is still held. Otherwise the promise depends on the tool’s internal timing rather than the person’s gesture.

6. **Zoom limit:** Should the second finger cancel the first action even when the chart is already at minimum or maximum zoom?  
   Recommendation: yes. Two fingers define the gesture even when clamping prevents a numerical zoom change.

