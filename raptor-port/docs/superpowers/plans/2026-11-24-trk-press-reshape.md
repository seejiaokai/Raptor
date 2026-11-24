# The Tracker's held press — a reshape (plan only, nothing built) — revised after the red team's rounds 1 and 2

24 Nov 26. For `[MSQ-NIGHT-153-OPEN]` part (3), under his D2238: where rounds of fixes keep finding faults in one place,
the place is reshaped first, and the plan is read by three independent readers (Astra, a fresh Opus, a fresh Fable —
each blind) before anything is built. Round 1 said the shape is right and that it must not be built as first written
(§8). Round 2 read the revision: no reader asked for another shape; Astra asked for two gaps in the chart's protection
to be closed first, Opus and Fable found no HIGH (§9). §3–§7 are the plan as it now stands, after both. Written from
`claude/msq-b1-screens-135` at `91b5f476e`. **Nothing was run for this plan**: every statement about today's behaviour is
marked **[code: function]** (read there, with its callers) or **[not checked]**.

Scope: `raptor-port/src/tracker/app/core.js` (the chart editor, "Edit chart layout") and one effect in `tracker/App.jsx`.
It adds no word, mark or control (D1625 does not apply); what a person would see differently is in his three questions
(§3.5).

## 1. The shape today

### 1.1 The presses

A **press** is a pointer held down on the editing canvas that goes on after its pointerdown. Seven kinds register
themselves in `liveGestures` (`gestureBegan(stop, el)`, l.4017); the chart as it stood is noted once by a capture
listener on the canvas (`notePress`, l.4019, wired in `wireBoard` l.3871) into `pressSnap`.

| Kind (handler) | Listens on | Registers | At pointerdown | While moving | At the lift | Its own "cancelled touch" |
|---|---|---|---|---|---|---|
| **Ball** (`startDrag` l.4653, Move tool) | the ball (pointer capture) | `stop` + the ball | own copy of the chart (`drag.snap`) | first move pushes the step (`pushChartStep(drag.snap)`); writes `layout[id]` | `endDrag`: if moved `saveLayout()`, `wireBoard()`; no unsaved mark (a moved ball saves itself) | **the lift's code** (`endDrag` is bound to `pointercancel`): saves |
| **Group** (`startGroupDrag` l.4623, Select tool on a ball) | the ball | `stop` + the ball | as the ball | as the ball, every selected ball | `endGroupDrag`: if moved `saveLayout()`, `renderBoard()` | the lift's code: saves |
| **Selection box** (`startMarquee` l.4592) | the canvas | `stop` + the canvas | — | draws the box | sets `selBalls`, redraws | selects nothing |
| **Link's bend square** (`.linehandle` l.3736) | `window` | `stop`, **no element** | **pushes the step now** (`pushUndo`) | writes `edgeMeta[key].mid` | `markDirty(); saveLayout(); renderBoard()` — even unmoved | puts its bend and its step back |
| **Link's end** (`.endhandle` l.3768) | `window` | `stop`, no element | — | moves the dot only | `applyEndSnap`, which reads the link from **`selEdge` as it is at the lift** (own `pushUndo`, change, `markDirty`, `saveLayout`, redraw) | redraw |
| **Drawn line's corner** (`.lvert` l.3801) | `window` | `stop`, no element | copies the points | **changes `L.pts` in place** | if moved: `pushUndo()` **after the change**, `markDirty`, `saveLayout`; redraw | puts the points back |
| **Drawn line's end** (`.lend` l.3830) | `window` | `stop`, no element | **`L[key] = null`** (a change at pointerdown) | rebuilds `L.pts` | `pushUndo()` **after those changes**, re-snap, `deriveLineLinks`, `markDirty`, `saveLayout`, redraw — even unmoved | puts points and link back |

All **[code]**. Outside this plan's data: the pan of empty canvas (`pan`, the view only), the pinch
(`enablePinchZoom`), the Line tool's half-drawn line (`drawing` — two clicks, a pick), the side panel's resizer, the
Reorder windows' drags (`Modals.jsx`, whole already).

Beside the presses sit the **picks** — `connectSrc`, `mergeFirst`, `drawing`, `selBalls`, `selLine`, `selEdge`: names of
things on the chart, waiting for the next click. A finger's press is also remembered by the pinch's take-back
(`holdFirstFinger` l.4044, `fingerStop` — set for a finger's press only), which keeps a second, wider copy of the chart;
while that hold is set, `saveLayout` waits (l.1277).

### 1.2 What can happen under a held press, and what decides it

Reachable with a mouse held and the keyboard, with a second finger off the chart, or with no hand at all (midnight, a
right ending, another tab's or person's change, the system).

LAND = the lift's own work, its save included. CANCEL = chart, both Undo lists and the unsaved mark put back as before the
press. STOP = listeners taken off only: what the press changed stays in memory, unsaved. LIVES = nothing ends it; its
later moves and its lift still act. **✗ = wrong.**

| # | Event | Ball / group | Box | The four line handles | Decided by |
|---|---|---|---|---|---|
| 1 | Second finger (a pinch) | CANCEL, selection too (a finger's press; a mouse's carries on) | CANCEL | CANCEL | `takeBackFirstFinger` l.4056 (D134) |
| 2 | The system cancels the touch | **LAND — saved ✗** (differs from every other kind) | cancel | own put-back | each kind's own `cancel` |
| 3 | Any redraw | **STOP ✗** — the move is drawn, has an Undo step, is never stored, nothing marked unsaved **(fault 2)** | STOP | **LIVES ✗** — its square is redrawn away; the data still follows the pointer | `renderBoard` → `endPressesOnRedraw` l.4039 |
| 4 | Tool change (`setTool`) | = 3 ✗ | = 3 | = 3 ✗ | `setTool` l.3488 → `renderBoard` |
| 5 | Done editing (`toggleArrange`) | = 3 ✗ | = 3 | LIVES ✗ | `toggleArrange` l.6717 |
| 6 | ✓ Save changes (`persistSyl`) | = 3 ✗ | = 3 | LIVES ✗ — the lift re-marks unsaved after the save; a later cancel brings the cleared history back | `persistSyl` l.6341 → `clearDirty`, `renderBoard` |
| 7 | Another chart edit by keyboard (Delete, the Font box, + event, the event list, the ball editor, Reset layout, Arrow) | STOP (the edit's own `saveLayout` happens to store the move) | STOP | **LIVES ✗** — a later cancel lays the press's old note over that edit **(fault 3, second half)** | each edit: `pushUndo` … `renderBoard`; none looks for a press |
| 8 | Undo / Redo | **CANCEL, then one step more ✗** wherever the press had put its step on the list — two changes go **(fault 1)** | CANCEL | link's bend: **same ✗** if it moved; others CANCEL then step | `endPressForStep` l.3471 → `cancelGestures` → `step` |
| 9 | Squadron pick, a right ending, his move at midnight — no chart work open | CANCEL ✓ | ✓ | ✓ | `follow` l.202, `leaveSquadron` l.279 → `cancelGestures` |
| 10 | Member view, or midnight, with chart work open (the hold) | CANCEL + redraw ✓ | ✓ | ✓ | `follow` l.208–209 |
| 11 | The pick's or the sign-out's question | LIVES while it is up; Save / Discard → CANCEL ✓; Stay → LIVES | same | same | l.137, l.100 |
| 12 | Sign-out, nothing unsaved | CANCEL, no redraw ([not checked] whether the half-moved ball is ever seen) | ✓ | ✓ | `endSession` l.150 |
| 13 | "Discard" through `leaveFlowEdits`, the chart kept (+ Add course, + Add syllabus, Rename / Delete course, Import) | dropped by the reload | STOP | **LIVES ✗** — the lift marks the discarded chart unsaved and stores its bend **(fault 3)**; a cancel that runs while it is still held lays the **pre-Discard** chart back | `leaveFlowEdits` l.6102: no `cancelGestures`; `cancelGestures` l.4032 guards on course and chart id only |
| 14 | Switch of chart or course; Duplicate, Delete syllabus, Revert; the next person's own place | dropped by the reload | STOP | **LIVES ✗** — a link bend's lift writes the old chart's link key into the **new** chart's layout | `switchSyllabus` l.6113, `switchSylNow` l.6378, Revert l.6640, `resumeForPerson` l.1139 → `loadCourseNow` l.2245: none ends a press |
| 15 | A refused save put back; another tab's or person's change read in; a departed person's courses left | dropped / STOP | STOP | LIVES ✗ (as 13) | `trkStore.restore` l.741, `trkWriteRecords` l.890 (its redraw runs for any incoming Tracker record), `leaveRunningCourses` l.5824 — **these redraw with no hand** |
| 16 | The Tracker's page, or on a phone its Flow half (the Info tab), leaves the screen; the window loses focus; the browser tab is hidden | **LIVES ✗** | LIVES | LIVES ✗ | nothing ends a press: the only `blur` listener in `core.js` (the board's, l.4306) hides the keyboard ring; `App.jsx` l.109–110 hides the details bubble. A lift the page never hears leaves the press listed for good; every later press then keeps the old note (`notePress`: `if (liveGestures.size) return`) |
| 17 | A second press while one is held (a mouse beside a finger; or after 16) | both live, the second with no note of its own ✗ | | | `notePress` l.4020 |
| 18 | Export | untouched ✓ | | | `saveCopyClick` reads only |
| 19 | Escape | nothing | | | `handleEscapeKey` l.6748 |

Rows 3–8 and 13–15 **[code]**, none run. Row 16's effect on a hidden page (the pointer measured against a canvas with no
size) is **[not checked]**.

**The picks** are cleared by `setTool` (per tool), `endSession`, `emptyForMove`, and `leaveFlowEdits` *after* its
question; **not** by an Undo or Redo step (`applyHistData` l.3375 clears `selEdge` alone), by `loadCourseNow`, by
`leaveFlowEdits`' clean path, by `cancelGestures`, nor by a delete from the ball editor (`deleteFromEditModal` l.4745 →
`deleteEvents` l.6861 clears `selBalls` alone) ✗ **(fault 4)**: Connect armed on a ball that is then removed, or that
the next chart lacks, makes the next ball clicked depend on an event that is not there **[code: `connectClick`
l.4558–4570 never asks whether its first ball is still on the chart]**.

**Found while reading, not in the four** **[code, not run]**: the Undo step of a drawn line's corner or end drag is
taken *after* the drag has changed the line (`.lvert` l.3823, `.lend` l.3855 — `L` is the live object inside
`layout.__lines`, l.2840): Undo of a corner drag takes back nothing; Undo of an end drag — or of a mere click on an end —
leaves the end loose where the pointer last was. All three readers confirmed it by reading. No test pins it.

## 2. Why this shape breeds faults

**A held press has no owner.** Each kind keeps its own listeners, its own in-flight state and its own idea of where its
Undo step goes, and gives the rest of the editor one handle on itself: a `stop` that takes its listeners off. That one
handle is used for two opposite things — "finish it" and "it never happened" — so the *finishing* half (the save, the
step, the unsaved mark) lives only inside each kind's pointerup listener and cannot be called by anyone else, and the
*never happened* half is done from outside by laying a note of the whole chart and both Undo lists back, which is only
right if nothing else has changed since the note was taken. Nothing guarantees that: every door of the editor (some 89
redraw calls, some 20 history pushes, the loads, the restores) can run under a held press, and each night's fix taught
one more door to look for a press — so the door not yet taught is always the next fault.

Round 1 showed the first draft of this plan had the same disease in a milder form: it ended the press at the *inside* of
chosen functions (the history push, the redraw), which is after the caller has already read the chart, taken its
snapshot or changed a pick. **A press must be ended before anything else starts, not inside it.**

## 3. The reshape

### 3.1 The cut chosen, and why

Three cuts were offered. **Astra's** — finish the press at the start of *each action* — is right about *when*, but it is
one more line in every door: the most places a future door can forget. **Opus's** — keep the first draft, move its
landing into `pushUndo` and `clearDirty`, bump the generation at a load's start — mends the five faults it names with
four lines, but a future door that reads and then changes without `pushUndo` (a selection, a pick, a tool) still
forgets. **Fable's** — end the press at the **input doors**: the two `window` capture listeners every key and every
press passes through before any handler runs — leaves no place for a door driven by a key or a fresh press to forget,
present or future. (Not every act of his hand is one of those: a second mouse button sends no `pointerdown`, and a
voice or screen-reader "click" sends neither — 3.3's belts and the waiting redraw cover those.) **Chosen: Fable's, with Opus's hardening for what no hand drives** (the load's start, the kept course-and-chart
check). What Astra asked for — nothing read before the press is ended — it gives for free.

One departure from Fable's cut: it kept a landing at the first line of `renderBoard` as the belt for no-hand events.
Here **a redraw asked for under a held press waits** instead. With the doors in place, such a redraw is never his
doing; landing there dropped his ball because someone else made a mark, needed a special case for a finger's waiting
save, and saved from inside another command's redraw (which two readers could not check).

Round 2 added **Fable's second cut, in part**: the owner itself hears the held pointer's lift and cancel (3.2), so a
lift is never lost to an element — which matters more now that a held press makes redraws wait. The kinds keep their
own move listeners (the ball's pointer capture is not re-proved).

What the cut costs: (a) any key, not only one that does something, puts a held ball down — the one place in the app
where it does (his question Q3); (b) a squadron pick or Logout made by his own hand with a ball held now keeps the ball
where he held it, where today it goes back, and with a line's handle held the unsaved-edits question now appears (same
question); (c) the tests must send real key and pointer events to prove the rule — a direct call of a
function proves only a belt.

### 3.2 One owner, two ways out

One record, `held`, for the one press under way.

```
pressBegin({ kind, pid, finger, el, stop, commit }) // each kind's pointerdown: after its own stopPropagation /
                                                   // preventDefault (so a refused press never bubbles to the canvas's
                                                   // pan or box), before it changes anything
    answers null — the kind does nothing — while unitLeaving, !ready, a load, switch or save of the chart is under way
    (chartBusy, 3.4), or a press is still held (belt: that one is landed first; the new press is not begun);
    notes: storageUnit(), course, curSylId(), chartGen, the layout {lay}, sylDirty;
    listens on window, capture, for pointerup and pointercancel of pid, and on el (the ball, for a ball or a group)
    for lostpointercapture
pressMoved(point)                                  // each kind's move handler, and the edge pan's carry:
                                                   // held.moved = true, held.last = point
pressChanged()                                     // puts the press's ONE step on the list (through pushChartStep, so
                                                   // lastPush / dropRefusedStep work) — the chart as noted at pressBegin
pressEnd(how, ev)                                  // THE ONLY EXIT.  how: 'land' | 'cancel'
```

- **The press's own record holds everything its finish needs** — `moved`, `last`, and what the kind captured at
  pointerdown (the ball id and start places, the box's rectangle, the link's key, the line's id and index). `commit`
  reads only that record: never `drag`, `groupDrag`, `marquee`, **never a pick** (`applyEndSnap` takes the key the end
  captured, and does nothing if that link is no longer on the chart), never the tool or the mode.
- **The owner hears the lift, not the kind.** Its `window` capture listeners call `pressEnd('land', ev)` on the held
  pointer's `pointerup` and `pressEnd('cancel')` on its `pointercancel`; a `lostpointercapture` that finds the press
  still held (after an ordinary lift it finds none — `held` is already null) is a lift that was lost: CANCEL. The kinds'
  own `pointerup` / `pointercancel` listeners go; their move listeners stay where they are.
- `stop()` — the kind's move listener off, edge pan off, the module's in-flight state cleared (`drag`, `groupDrag`, `marquee`, guides,
  the perf class). Never touches the chart, the lists or the store.
- `commit(p, ev)` — the lift's data work: the same statements as today's pointerup body, reading `p` (the "verbatim"
  of the first draft is withdrawn: `endDrag` begins `if (!drag) return`). With no `ev`, the point is `p.last`.
- `pressChanged()` is called as each kind's step is timed today, so an ordinary press reads the same on the Undo button:
  ball and group at the first move; the link's bend at pointerdown; the link's end never (`applyEndSnap` pushes its own
  inside `commit`); the drawn line's corner and end keep their own `pushUndo` inside `commit` until step 6. It answers
  the entry it pushed, kept on the record as `p.step`.
- `pressEnd`:
  1. `const p = held; if (!p) return null; held = null;` — first, so nothing it calls can find the press again;
  2. the owner's three listeners off, `p.stop()`;
  3. **dead** — `p.gen !== chartGen`, or squadron, course or chart id no longer the ones noted (today's guard, kept
     beside the generation): its step is taken off if still on the list; it writes nothing and restores nothing;
  4. `'land'` from its own pointerup → `commit(p, ev)`. From anything else: the finger hold is ended **first**, by
     `releaseFirstFinger()` (the take-back window closes; a save already parked on the hold is made, and the landing's
     own save is made now, never left waiting on a hold that is then dropped); then a press that never moved, and a
     selection box always, → as `'cancel'`; a moved one → `commit(p, null)`;
  5. `'cancel'`: its own step removed **by identity** — if it is the newest and the Redo list is still the one its push
     emptied, both lists are put back exactly (the 60-step trim too); otherwise it is spliced out and nothing else is
     touched (the link bend's own cancel does this today, l.3759). The whole lists are never laid back. Then, **only if
     the press moved** (or, until step 6, is a drawn line's end, which changes the chart at pointerdown): the layout
     (`layout`, then `loadEdgeMeta()`) and the unsaved mark from the note, `chartGen++`. The events (`SYL`) are never
     laid back — no kind changes them before its `commit` (`applyEndSnap` and `deriveLineLinks` run there) — so no event
     object is replaced under a caller. An unmoved press's cancel replaces no object at all. Where the lists were
     filtered with no hand since the push (`leaveRunningCourses`), the splice path runs and the Redo list of before the
     press is not brought back — accepted. A finger's hold is dropped unsaved. **The board is redrawn here** unless the
     caller asked for none (`cancelGestures`, `chartGoing` — their callers redraw, as today) or it is off screen (no
     size): then the redraw is owed and made when the board is next shown — the Tracker's page (beside `landIfOwed`) or,
     on a phone, the return to the Flow half (`App.jsx`'s `[tab]` effect, before `refitAfterShow`'s early return);
  6. a redraw that waited (3.3) is made now;
  7. it answers `{ step: p.step, refused }` — `refused` when `TRK_REFUSED_N` rose across `commit` (the landing's save
     was refused: `dropRefusedStep` has taken its step off and the store has put the chart back).
- **`cancelGestures()` keeps today's unconditional clears** — `firstFinger = null; pan = null` — **before**
  `pressEnd('cancel')` with no redraw, press or no press (l.4028). It answers true where a press was ended, as today
  (`follow` reads it and redraws); its five callers do not move, and sign-out still makes no redraw of its own.
- **The finger's note is the second thing that can lay a chart back, so it obeys the same rule as the press.**
  `holdFirstFinger` notes `chartGen`; `takeBackFirstFinger` takes its note (`f`) first and restores nothing unless
  `f.gen === chartGen` as well as course and chart id — read **before** it ends the press, whose own cancel bumps the
  generation; then it ends the press through the owner (only a finger's can be held there — below), then restores its
  own wider note. `chartGoing` (3.4) ends the hold, press or no press.
- **One press at a time, whatever the device.** A finger that lands on the chart while a *mouse's* press is held puts
  the mouse's press down at the door (3.3) and does nothing else. Round 1's "a mouse's press carries on under a
  two-finger zoom" is withdrawn: the first of those two fingers, landing on a ball, met `pressBegin`'s belt, and the
  finger's wider note would have been laid over what the mouse had moved (§9).

Deleted: `liveGestures`, `pressSnap`, `notePress` (the canvas's capture listener keeps its `unitLeaving` guard and
gains the swallow of 3.3), `gestureBegan`, `gestureEnded`, `endPressesOnRedraw`, `endPressForStep`, `fingerStop`
(`held.finger` says it), `drag.snap` / `pushed`, the seven kinds' own lift and cancel listeners, the four handles'
private put-back code.

### 3.3 The rule

**By his own hand → LAND, at the door, before anything else runs.** "As if he had let go first": what he sees is kept
and saved, then the thing he pressed happens.
**Not by his hand → CANCEL.** "As if he had never pressed": the chart is being taken or swapped under him, or the press
was taken from him.

| Event | Rule | Where (once) | Why / ruling |
|---|---|---|---|
| The lift | LAND | the owner's `pointerup` listener on `window`, capture → `pressEnd('land', ev)` | heard whatever element the pointer is over or captured by |
| **Any key** (a bare Shift, Ctrl, Alt, ⌘ / OS, AltGraph, CapsLock, NumLock or Fn excepted; a key already down and repeating — `e.repeat` — excepted) | LAND | **the input door**: one `keydown` listener on `window`, capture, wired once in `wirePageOnce` | covers Undo / Redo, Delete, the Font box, a tool, Done, ✓ Save changes, every button and dropdown reached by Tab, a page or tab switch, a squadron pick, Logout — and whatever is added later. **Q1, Q3** |
| **Escape** | CANCEL, and the key does nothing else | the same listener | the Reorder windows' rule ("Escape ends the carry, not the window", `Modals.jsx`); today it does nothing. **Q3** |
| **Any other press** — a `pointerdown` of a pointer other than the held one: a mouse anywhere; a finger off the chart; a finger on the chart while the held press is a mouse's; a **primary** touch on the chart while a finger's press is held (the device saying no finger was down — the held one's lift was lost; the test `enablePinchZoom` l.4217 already trusts) | LAND | **the input door**: one `pointerdown` listener on `window`, capture. A press that lands on the chart itself is then dropped by the canvas's capture listener, with the click that follows it: the board has just been redrawn under it. The "drop the click" flag is cleared at that pointer's own lift or cancel plus one task, so a swallowed press dragged away never eats his next real click | one press at a time, whatever the device; a lost lift heals at the next touch or press, which puts the stuck ball down and does nothing else. A second mouse *button* sends no `pointerdown` and does nothing to the drag, as today |
| **A landing at the door whose save is refused** | the key or press is swallowed: `preventDefault()` + `stopPropagation()`, and the click after a press | the two door listeners read `pressEnd`'s `refused` | the store has already put his move back and said so; the Undo, tool or button he pressed must not then act on a chart he has not seen settle — else Ctrl+Z takes back the change before the drag as well (`handleUndoKey` runs after the door and finds no press) |
| A second finger on the chart | CANCEL through the pinch's take-back | `takeBackFirstFinger` | D134 — stays as built |
| **A redraw asked for while a press is held** | **waits** for the press to end | first line of `renderBoard` | **fault 2**: a redraw can no longer end a press at all; and someone else's mark must not drop his ball |
| **The chart is about to be swapped or its identity changed** | CANCEL, no redraw, then `chartGen++` | `chartGoing()` (3.4), before the first change | **a press only ever writes into the chart it began on** |
| A squadron pick, a right ending, his move at midnight, the hold, sign-out; Save / Discard on either question | CANCEL (as today) | `follow`, `leaveSquadron`, `endSession`, l.100, l.137 — unchanged | D2395, D2243, D2318, D148. Reached with a press still held only when no hand drove them (or by a direct call) |
| **The press is taken from him**: the system cancels the touch; the lift is lost with the ball's capture; the window loses focus; the browser tab is hidden; the Tracker's page or its Flow half leaves the screen with no hand | CANCEL | the owner's `pointercancel` and `lostpointercapture` listeners; one `blur` listener on `window` (not capture, `e.target === window` — or every Tab would cancel) and one `visibilitychange`; `App.jsx`'s effect on `active` and `tab` | what the four handles, the box, the pinch and the Reorder windows already do. **Q2** |
| Belts, for a direct call, or a "click" that no key or `pointerdown` preceded (a second mouse button, voice control, a screen reader) | LAND at the first line of `pushUndo` (before its snapshot), `doUndo`, `doRedo`, `persistSyl`, `leaveFlowEdits`, `setTool`, `toggleArrange` | seven lines | a landing whose save is refused stops `doUndo` / `doRedo` there (else `dropRefusedStep` and `step` take two); `setTool` and `toggleArrange` are the two whose own redraw would otherwise wait under the press |

"Stay" on either question: by his hand the press has already landed at the key or press that raised the question.

### 3.4 The chart's identity, and the picks

**`chartGoing()`** — `pressEnd('cancel')` without the redraw, then `firstFinger = null` **press or no press** (a finger
resting on empty canvas holds a note of the whole chart and both lists; left alive, a second finger would lay the old
chart back over the swap — a parked save goes with it, as §6 already accepts), then `chartGen++`; it answers the
cancelled press's step, or null — is the first line of every function that swaps the chart or changes which chart is
meant, *before* its first change or wait:
`loadCourseNow` (l.2245 — before `course = c`; covers its null-course return, its wipe of the lists at l.2271, the swap
of `plan` at l.2272 and everything after), `openSylHere` (l.2396, before `plan.sylId = id`), `emptyForMove` (l.300),
`trkStore.restore` (l.741), the three branches of `trkWriteRecords` that swap `SYL` or `layout` (l.908, l.919, l.932 —
not its marks-only path), and `clearDirty` (l.6331 — the history is being ended). Cancelling *before* the swap puts the
press's half-done change back, so a swap of the events alone cannot leave a half-moved layout to be stored later.

`trkStore.restore` then lays back the lists its snapshot copied (`capture` l.740 — taken while the press was held, so
the press's step is in them, l.749): right after that assignment it removes the step `chartGoing` answered from the
restored lists, by the same remove-by-identity as `pressEnd`'s step 5 (newest, with the Redo list its push left → the
Redo list of before the press back too; otherwise spliced). Every other entry is left as restored.

**`chartBusy`** — a counter raised and lowered in `try / finally`: no press begins while the chart is being loaded,
switched or saved. It is raised for the **whole** of each operation that changes which chart is meant, waits included,
not only for the load inside it: round the `onChain` body of `switchSyllabus` (l.6119) and of `switchSylNow` (l.6379 —
`openSylHere` re-points `plan.sylId`, and with nobody signed in as a person waits on `savePlan`, before the load
begins; a press begun in that gap would note the new chart's id over the old chart's layout and pass the identity
check); in Delete syllabus from before `planSylSweep` (l.6653 — `plan = f.plan` follows the wait) to the end of its
reload; in Revert from before `sweepChart` (l.6638) to the end of its `loadCourse`; round `loadCourseNow`'s body; and
round `persistSyl`'s. A counter, so the nesting is harmless. It is the plan's own; `loading` (never reset when a load
throws, l.2254 / l.2369) is not leaned on.

**The picks** need no list of places:
1. `prunePicks()` at the first line of every redraw that runs: each pick is kept only if what it names is still on the
   chart (`connectSrc` in `byid`; `selBalls` filtered; `selLine` in `LINES()`; `selEdge` and `mergeFirst` among
   `edgeList()` and the line keys; `drawing` dropped if an end names something gone). Every change to the chart redraws
   before the next click.
2. `loadCourseNow` clears all six at its swap (a pick belongs to its chart).
3. `connectClick` refuses a first ball that is no longer on the chart.

`applyHistData` keeps its `selEdge = null`: an Undo deselects a link as today; a group or a drawn line stays selected
across an Undo as today.

### 3.5 Questions that are his

Each is one decision, with a recommendation the build can go on as the agent's reading. All three readers, both
rounds, agreed with the recommendations; round 2 asked for the wording below, which names every visible change.

- **Q1. Undo pressed while a ball is still being dragged.** He adds event X, drags BFM-3 half-way and, still holding,
  presses Ctrl+Z. Today BFM-3 jumps back **and X disappears**. Recommended: BFM-3 goes back to where the drag began and
  X stays — the same as letting go, then Undo; Redo puts BFM-3 where he had carried it. (If the app cannot save where
  he put it down, it says so as it does today, BFM-3 goes back, and that Ctrl+Z does nothing more — X stays.)
- **Q2. A drag that is taken from him — he did not let go and did not press anything in the app.** Example: a call
  comes in while his finger holds BFM-3. Today the ball stays, saved, where it was, while a line's handle goes back.
  Recommended: everything goes back to where the drag began, as the line handles, the selection box, the two-finger
  zoom (D134) and the Reorder lists already do. The same answer then covers three more cases:
  - **Alt+Tab, or a click in another window, with the mouse held.** Today nothing ends the drag — it carries on when he
    comes back, or sticks to the pointer. It would go back. (Another *page of this app*, or the phone's Info tab, is
    different: that is a key or press in the app — Q3 — and puts the ball down where it is.)
  - **Someone else, or his own second tab, moves a ball or saves the events of the same chart while he holds BFM-3.**
    Today his move rides on top of theirs. His ball would go back and their change show; he drags again. A *mark* made
    by someone else does not touch his drag — the chart catches up when he lets go.
  - **The phone takes the touch for itself.** Only his iPhone can show which holds count: a ball carried to the
    screen's left edge or the bottom bar, or held still for some seconds. Each would then go back, where today it
    saves.
- **Q3. A key, or a press somewhere else, while he holds a ball or a line's handle.** Example: he holds BFM-3 half-way
  across the chart and presses Tab, or clicks a tool with a second finger. Today most keys do nothing to the drag, and
  the few that act (Undo, a tool, a squadron pick) each ended it differently — the faults above. Recommended: any key
  or other press puts it down where it is, saved, as if he had let go — then does what it does. Escape alone puts it
  back where it began. What that means on screen:
  - **Any key at all** (a bare Shift, Ctrl or Alt excepted) puts it down. The Tracker's chart would be the one place in
    the app where that is so: the calendar drags and the Reorder lists end on Escape only and ignore other keys. Here
    the keys that act must end the drag, and "any key" is the rule that cannot miss one.
  - **A squadron picked, or Logout pressed, with a ball held** keeps the ball where he held it, where today it goes
    back. With a **line's handle** held, the handle is put down as an unsaved edit — so the "You have unsaved chart
    edits…" question now appears before the pick or the Logout, where today nothing was asked.
  - **On a phone, a thumb resting on the header or the Info half** while another finger carries a ball puts the ball
    down mid-drag. Today that touch does nothing to it.
  - **A second press on the chart itself** — a finger beside the mouse, or the next tap after the phone lost a lift —
    puts the held ball down and does **nothing else**: that press is used up, and he presses again for what he meant.
    With one mouse it cannot happen (a second mouse button does nothing to the drag, as today).
  - **A tap on the chart in the instant it is being saved or loaded** does nothing; he taps again. Nothing to see
    today, when both are instant; it could be felt once the database is in. Filed.

Decided here, the same rule he would already expect: a selection box ended by anything but its own lift selects
nothing, as today; a page or tab switch by his own hand puts the ball down like any other key or press; a finger on the
chart while the *mouse* holds a ball puts the ball down (today the two carried on together); and, from step 6, **a mere
click on a drawn line's end changes nothing** — today it re-seats the end where the click fell and lights ✓ Save
changes, with nothing for Undo to take back; to attach a loose end he drags it, however little (§9, the agent's
reading — his to overturn).

## 4. How every fault and every earlier fix comes out

| Fault | Under the reshape |
|---|---|
| 1. One Undo during a drag takes back two changes | the Z's keydown (or the press on ↶) lands the drag at the door; `step` pops exactly that step |
| 2. A redraw ends a drag unsaved | no redraw ends a press: his own key or press lands it first; another's redraw waits |
| 3a. A handle's press outlives a Discard | it landed at the key or press that opened + Add course, before the question; nothing of it is left to lift |
| 3b. A later Save lays the press's old note over newer work | the newer work's own key landed the press first; the note lives and dies with `held`, and whole lists are never laid back |
| 4. Picks survive an Undo, a clean switch, a delete from the ball editor | pruned at the redraw each of them makes; cleared at a load |
| 5 (found here). A drawn line's handle drag cannot be undone | its step is the note taken at `pressBegin` (step 6); a mere click on an end changes nothing, so needs no step |
| Rows 14–17 | `chartGoing` before any change of identity, and no press begun while one is under way (`chartBusy`); interruption cancels; another press lands the old; a lift is heard by the owner, so none is lost to an element |
| Astra's Export lead (`close()` pending across a squadron change) | **not in this reshape** — a file write's lifetime, not a press; no shared state; the browser cannot abort a `close()` already asked for. Stays filed. None of the three readers found the reshape makes it worse |

**The night's earlier fixes in this code** — none undone:

| Fix | Kept by |
|---|---|
| Fix list 1 — a press never crosses a squadron change | `follow` / `leaveSquadron` → CANCEL, unchanged; the identity check as belt. Pin: `msq-night-gestures.test.tsx` "a press under way…" (its picks are direct calls, so the cancel path is what it proves; no redraw runs before `follow`'s cancel — checked by two readers) |
| Fix list 2, 3 — the held draft is asked about, over the page he is on | untouched. Pin: `msq-night-memberview.test.tsx` |
| Fix list 5 and round two's Export abort | untouched. Pins: `msq-night-gestures` (Export), `msq-night-export-abort` |
| Fix list 8 — Discard keeps him in the editor | untouched. Pin: `msq-night-gestures` "Discard from a flow…" |
| Fable's lead — a dropped draft not left drawn | untouched (`runFollow` l.253). Pin: `msq-night-memberview` |
| Round two — Undo, Redo end the press | the door, and `doUndo` / `doRedo`'s belt (in step 1, before the belts exist, both still cancel as today). Pin: `msq-night-press-undo` — all seven presses there are held **without a move** and its calls are direct, so the belt lands, an unmoved press is a cancel, and each expectation holds as written (given `held.moved` apart from "has a step") |
| Round two — a redraw ends a press whose element it removes | replaced: the element is not removed while a press is held |
| Round two — the hold ends a held press | `follow` → CANCEL, unchanged. Pin: `msq-night-press-held` |
| Round two — a Discard that keeps the editor drops its picks | the line in `leaveFlowEdits` stays. Pin: `msq-night-press-held` "Discard that keeps him…" |

**Must stay green, unchanged**: `msq-night-gestures`, `msq-night-press-undo`, `msq-night-press-held`,
`msq-night-memberview`, `msq-night-export-abort`, `msq-trk-follows-pick`, `msq-trk-pick-ask`, `msq-fix2-trksave`,
`msq-warfix-trk-refused`, `trk-pinch-edges`, `trk-chart-fps`, `trk-refusals`, `retest`, `leftovers`, `reorderdrag`,
`tracker` (all `src/tracker/*.test.tsx`), `src/ui/edgeturn.test.ts`, the Playwright specs `e2e/geometry.spec.ts` and
`e2e/trk-scrollbars.spec.ts`, and the Tracker smoke (`npm run smoke:tracker`). The three press files were read against
the reshape, by the round-2 readers too (their lifts are sent with `bubbles: true` or on `window`, so the owner's
listener hears them); the others were **not read press by press** — the suite decides, and nothing is called green
until it has run.

## 5. The build order

Every step: its tests written first and seen failing (a test that will not fail is reported and its fault struck), then
the step, then the whole unit suite green. A test marked *(protection)* passes today and must go on passing — it is
not expected to fail first. New tests go in `src/tracker/trk-press-owner.test.tsx`, harness copied from
`msq-night-press-undo.test.tsx`. A test of the *rule* sends a real `keydown` or `pointerdown` through `window`; a direct
call tests a belt and says so. `drawnLine()` saves, so it is called before whatever makes the chart unsaved.

**Step 1 — the owner, whole, no change of behaviour.**
Before: **T0** (protection, green today): an ordinary press–move–lift for each of the seven kinds — the stored layout,
the step count, the unsaved mark, the selection; a finger resting on empty canvas across a squadron pick, then a second
finger — the squadron entered untouched (the unconditional clears); for each kind, the lift sent on the element and sent on
`window` — both heard; a refused press (`unitLeaving`) on a drawn line's corner starts no pan and no box.
Build: `held` with its own record — **all** the finishing data in it from this step — `pressBegin` / `pressMoved`
(the edge pan's carry too) / `pressChanged` / `pressEnd`, the owner's own lift, cancel and lost-capture listeners (a
ball's and a group's `pointercancel` still **lands** until step 5, as today), the dead check (generation and identity
together), `cancelGestures` with its clears, `takeBackFirstFinger` through the owner with its generation check;
the seven kinds moved over one at a time. A redraw still only *stops* the three element kinds (a temporary third
`how`), and `doUndo` / `doRedo` still **cancel** a held press and redraw, as `endPressForStep` does today — so
`msq-night-press-undo` stays green between steps 1 and 2.

**Step 2 — the input doors; a redraw waits; the belts.**
Before: **T1** (fault 1): `addBall('B')`; ball A down, moved 60px; `keydown` Ctrl, then Z — B still there, A back,
`canRedo()`; Redo puts A where carried. The same for a group and a moved link's bend. A landing whose save is refused,
sent as a real `keydown` Ctrl, then Z (once with the "could not be saved" box already up, once inside `trkQuietly`, so
no box stops `handleUndoKey`): A back, **B still there**, the key's default prevented; the same by a `pointerdown` and
`click` on ↶; and the belt, by `doUndo()` called directly. **T2** (fault 2): a ball, then a group, held and moved; a
`pointerdown` on a tool button (a second pointer id — with one mouse this is a synthetic case; by hand it is a finger
beside the mouse) — the place is stored, one step, the late lift changes nothing. `setTool('select')` and
`toggleArrange()` called directly under a held, moved ball (the belts) — stored, and the redraw made. `renderBoard()` called directly under a held ball — the
press is still alive, a further move still moves it, the lift stores it. By touch: a finger's ball moved, a no-hand
redraw (an incoming mark through `trkWriteRecords`), the late lift, a reload — the place is stored, by one command.
`keydown` Enter on ✓ Save changes with a link's bend held and moved — the bend stored, `sylDirty` false after the late
lift. **T3a** (fault 3): an unsaved chart; each of the four handles held and moved (the link's end lifted over a port);
the key that opens + Add course, Discard, the name cancelled; the late lift — nothing is written after the Discard, no
step, `sylDirty` false. **T3b**: a link's bend held and moved; + event by key ('K'); the pick's question, "Save them" —
K stored. **The order tests**: a link's end held over a port, the Font box changed by key, one Undo — the font back,
the link still reconnected; the same through the `pushUndo` belt (`setFont(9)` called directly); *(protection)* an
unmoved press, then the ball editor's Save — the edit is kept (no object replaced under it); *(protection)* a box
held, Select all — all selected.
**The door itself**: *(protection)* a bare Shift does not end a press; nor does a `keydown` with `repeat` set, nor
CapsLock; Escape puts a moved ball back and closes nothing; a press by a second pointer on another ball lands the
first, stored before the second lifts, and itself drags nothing — and the click after it is dropped, while a click
made after that pointer has lifted elsewhere is **not**; a mouse-held, moved ball and a finger landing on another ball
— the mouse's ball stored where it was, the finger drags nothing, a second finger then takes nothing back.
**A lost lift**: a finger's ball press moved, its lift never sent; a primary touch on empty canvas — the ball is
stored there; then Connect's first click — its ring is drawn (no redraw left waiting). `lostpointercapture` on a held
ball — back where it began, nothing stored.
Build: the two listeners with their refused-landing swallow, the swallow of a press on the chart and its flag's end,
the waiting redraw, the seven belts, every `commit` reading its own record (the link's end its captured key).

**Step 3 — the chart's identity.**
Before: **T7**: a link's bend held and moved, `loadCourse(course)` called directly, then the lift — nothing stored, no
step, `sylDirty` false; **the same with the lift sent while the load is still waiting** (a store made slow), and with a
`pointercancel` sent there — the chart loaded has neither the old layout nor the old history; the same across
`switchSylNow` (Duplicate) and `resumeForPerson`; a refused command put back under a held press (the harness of
`msq-warfix-trk-refused`); another tab's change to the chart's events under a moved ball — the ball's half-move is not
stored later; another tab's move of a ball on the same chart under his held, moved ball — his goes back, theirs is
shown, nothing of his is stored at the late lift. **The refused command, exactly**: `addBall('B')`, a ball held and
moved, a no-hand command refused and put back — the ball back, and then one Undo takes **B** away (not a step that does
nothing), Redo brings B back; with a Redo list standing before the press, it stands after. **The resting finger**: a
finger on empty canvas (no press), the chart's events replaced under the same course and chart, a second finger, then a
save — the replacement is on screen and stored; the same across a refused command put back. **A new press in a wait**
(a store made slow): a ball press tried between `switchSylNow`'s re-pointing and its load — it does not begin, and
nothing is written under the new chart's key; the same inside Delete syllabus's and Revert's waits. A press tried
while ✓ Save changes is waiting on a slow store — it does not begin. A load that throws, and a switch that throws —
the next press still begins.
Build: `chartGoing` at its six functions (the finger hold ended in it), `trkStore.restore`'s removal of the dead
step, `chartBusy` round the two switches, Delete syllabus, Revert, the load and the save.

**Step 4 — the picks.**
Before: **T4** (a) Connect, + event X, click X, Undo, click another ball — no prerequisite, nothing marked unsaved;
(b) Connect armed, a clean switch to a chart without that ball, a click — nothing; (d) Connect armed on a ball, its
editor opened by double-click, Delete there, a click on another ball — nothing. (c) is protection, green today and
after: a group selected, moved, Undo — still selected; a link selected, Undo — deselected.
Build: `prunePicks`, the clear in `loadCourseNow`, `connectClick`'s check.

**Step 5 — interruptions** (on Q2's answer, or its recommendation).
Before: **T6**: a ball moved, `pointercancel` — back where it began, nothing stored, no step; `blur` on `window` — the
same, and a later move moves nothing; a `blur` whose target is a button — nothing ends; the Tracker hidden with a press
held and no input event — cancelled, no redraw until shown; the same with the Flow half hidden by `tab` and shown
again — the owed redraw is made on the return. In a browser at 402 wide (a Playwright spec beside
`e2e/trk-scrollbars.spec.ts`): a line handle held by the mouse, the Info tab reached by keyboard — the handle lands at
that key; later moves and the lift change nothing.
Build: the owner's `pointercancel` cancels for every kind (the ball and the group no longer land on it), the `blur`
and `visibilitychange` listeners, `App.jsx`'s effect on `active` and `tab`, the owed redraw paid at both.

**Step 6 — the step is the owner's, for a drawn line's corner and end.**
Before: **T5**, each after an earlier, unrelated edit (`addBall('B')`) that must survive: a corner dragged and lifted;
an end dragged onto a ball's port (so a prerequisite is derived). For each: Undo — the points, the end's attachment
**and the prerequisites** as before the press, **B still there**; Redo — as after it; a reload — the stored layout
matches what is on screen. And a loose end **merely clicked**, a few pixels off its centre and within reach of a port:
the stored layout, the end's attachment, the prerequisites, `canUndo()`'s answer and `sylDirty` all unchanged, and one
Undo then takes B. Expected to fail today **[not run]**.
Build: `pressChanged` at the corner's first move and the end's first move; the end frees its link (`L[key] = null`) at
its first move, not at pointerdown; **the end's `commit` does nothing unless the press moved**, as the corner's already
does (`if (moved)`) — after which no kind changes the chart before it has moved, and none changes it at a lift it did
not move before. (The other fix offered — take the step before a change made only at the lift — would keep a click
re-seating the end; a click that moves and unsaves the chart is what nobody expects of a click, so it is not kept.)

**Step 7 — tidy and records.** The two comment blocks at l.3997–4014 replaced by the rule table of 3.3;
`docs/ui-contracts.md` §The Tracker's Edit chart layout (l.8407) gains it; `docs/file-map.md` the new test files;
`[MSQ-NIGHT-153-OPEN]` part (3) closed with its pointer; the found-not-fixed below filed.

Then the bug-check order in full before anything is called ready.

### The walk for this change

Edit chart layout, on 142 and on 149 by Plan, a picture after each press and each settle. Undo and Redo are looked at
**before** any reload (a reload ends the history), the reload after.

| # | Scenario | Mouse, 1536 | Finger, 402 |
|---|---|---|---|
| W1 | Plain use, each of the seven presses: press, carry to the canvas edge (it pans), hold some seconds, lift; Undo, Redo; then reload | all seven | all seven (tools from "Tools ▾") |
| W2 | A ball held, an event added before it; Ctrl+Z, then Ctrl+Y | keyboard | a second finger taps ↶, then ↷ |
| W3 | A ball / a group / each line handle held, then: a tool, Select all, Done, ✓ Save changes, the Font box | Tab + Enter | second finger on the strip |
| W4 | Each line handle held, + Add course → Discard → cancel the name; lift | Tab + Enter | second finger |
| W5 | A link's bend held, switch chart (clean, then unsaved); look at the other chart | the Syllabus dropdown by keyboard | [his iPhone] |
| W6 | Connect armed on a new event, Undo, click another; across a clean chart switch; after a delete from the ball's editor | yes | yes |
| W7 | A group selected, moved, Undo — still selected | yes | yes |
| W8 | A drawn line's corner and end dragged, then Undo, Redo | yes | yes |
| W9 | A ball held, a squadron picked; the member view; Logout with and without unsaved edits (Stay, Discard, Save) | keyboard | second finger on ☰ |
| W10 | A ball held, another page of the app and back (put down where held); on the phone the Info tab and back (the same); another window (Alt+Tab) and back (back where it began) — the two looked at side by side | yes | by second finger |
| W11 | A ball held by one finger, a second finger on the chart (the zoom takes the drag back — D134 unchanged) | — | yes |
| W12 | A touch cancelled by the system | — | sent by the walk script through the browser's own protocol |
| W13 | A ball held: a bare Shift (nothing), a key already held down before the press (nothing), an arrow key (put down), Escape (back), the right mouse button (nothing, as today). A second press on the chart puts the first down and does nothing else, and no click follows — one mouse cannot make it: driven by the walk script as a finger beside the held mouse, and by a lift withheld, then a tap | yes (script) | the withheld lift, then a tap on empty canvas, then Connect — its ring shows |
| W14 | A ball held while (a) a mark is made by someone else — the drag carries on, the chart catches up at the lift; (b) someone else moves a ball on the same chart — his held ball goes back, theirs shows. This build's store does not bring another tab's change in live (`loadLatest` is empty, `storage.js` l.157), so the walk script hands the incoming record to the Tracker through the store's own door and first shows that it arrived; real two-tab delivery is a look of its own at the database step | yes (script) | — |
| W15 | A line's handle held, a squadron picked by keyboard — the handle is put down, the unsaved-edits question appears; Stay, then Discard | keyboard | second finger on ☰ |
| W16 | A thumb resting on the header, then on the Info half, while another finger carries a ball — the ball is put down | — | yes |
| W17 | A drawn line's loose end clicked without moving, near a port and away from one — nothing changes, ✓ Save changes stays unlit; then dragged a little onto the port — attached, one Undo takes it back | yes | yes |

**What a finger on a phone cannot reach:** every keyboard path; the mouse beside a finger.
**Looks for his iPhone** [cannot be established in the test browser]: whether iOS gives a second finger's tap to a
button while the first holds a ball (W2–W4, W9, W10 by finger); whether the Course and Syllabus pickers, or the file
picker, open under a held finger and whether opening one counts as the window losing focus; whether iOS cancels the
first finger's touch when a second lands; a real interruption (a call); a ball carried to the left screen edge or the
bottom bar, and a ball held still for some seconds — whether iOS takes the touch (Q2); a thumb resting off the chart
(Q3, W16); whether a lift is ever lost now that the ball is not redrawn away under the finger.

## 6. What is deliberately not changed, and the risks

**Not changed**
- What an ordinary lift does, kind by kind — but for the mere click on a drawn line's end (step 6) — including one
  oddity left: a click on a link's bend square without moving marks the chart unsaved and adds an Undo step that takes
  back nothing. To file.
- The pinch and its take-back (D134), the pan of empty canvas, the chart's scroll and glide outside the editor, the edge
  pan (`followEdge`, D899), the Line tool's two clicks, the Reorder windows' drags.
- Undo's own machinery (`step`, the restore command, `lastPush` / `dropRefusedStep`, the parked history per squadron),
  `saveLayout`, the squadron move's order, the two questions and their words, Export, Import, `loading`.
- A finger's waiting layout save dropped by a cancel with no press held (Opus's lead of the first night): as today.
- The rest of the Tracker, its store, the command layer, every other page.

**Found, to file, not fixed here** **[code, not run]**: "Discard" does not take back a line, bend, font or merge edit —
each is stored the moment it is made (`saveLayout` l.1275) and the reload reads it back; only events and prerequisites
are discarded. ✓ Save changes copies the chart before its wait and clears the unsaved mark after it, so an edit made in
between would be lost (not reachable while the store answers at once; it opens at the database step).

**Risks**
1. **The doors are new global listeners.** A key pressed for something unrelated ends a drag (Q3's cost). Other
   `window` capture key listeners exist in the app — the date calendar's, the Leave War's sheets', `ui/boardescape.ts`
   **[code: grep]**; one wired earlier runs before the door, and if it stops the key the door never hears it. The press
   then simply stays held; the belts cover the actions that matter.
2. **A redraw that waits** leaves the board as drawn until the press ends. A caller that redraws and then measures the
   new board, reached with no hand while a press is held, would measure the old one — none was found among the no-hand
   callers of row 15 **[not checked for all 89]**, but one acts on it: `leaveRunningCoursesNow` redraws (it waits),
   then `landChart()` scrolls to an event on the board as still drawn — the view can jump under a held press; no data
   is touched. W14 shows the one that matters. A press whose lift is lost no longer leaves redraws waiting for long:
   the owner hears the lift on `window`, a lost capture cancels, and the next touch or press heals what is left.
3. **Re-entry.** `commit` → `saveLayout` → a refused save → `trkStore.restore` → `chartGoing` → `pressEnd`. Safe only
   because `held = null` is `pressEnd`'s first act.
4. **A `chartGoing` site missed** leaves today's fault at that one door for a no-hand event, no worse; the identity
   check still stops a write into another chart. The six are found by what they *do* (swap or re-point), not by a grep
   of one spelling. Two more re-point the chart after a wait — Delete syllabus (`plan = f.plan`, l.6656) and Revert —
   and reach `chartGoing` only at their reload: `chartBusy` is held across both, so no press begins in between, and one
   held from before is dead by the identity check. For the rest: `deleteEvents`, the event list and Reset layout also replace or filter `SYL` / `layout`, but they
   are his own edits — a press has landed before them and the picks are pruned at their redraw.
5. **A landing with no pointer event** uses the last point the pointer was at; for a line's end that decides the port.
6. **`blur`**: a second page taking focus during the smoke would cancel a drag in flight. The listener stays — a window
   can lose focus while its tab is still shown; if the smoke trips on it, the smoke's focus handling is mended.
7. **Vendored plain JavaScript, no types**: nothing but the tests says a kind forgot `pressBegin`; T0 holds all seven.
8. **A press swallowed** at the door (the second press on the chart) is not counted by the pinch either. Whether a
   click still follows a swallowed press is **[not checked]** — W13 looks; the flag that drops it ends with that
   pointer's lift, so it cannot outlive the press it was set for.
9. **The owner's lift listener is on `window`.** A lift sent to an element that has left the page never reaches it
   (Safari has done this — the pinch's own comment, l.4213): the lost-capture cancel and the next touch are what heal
   that. A test that sends a lift without `bubbles` would not be heard either; none was found in the three press files.
10. **A click on a drawn line's end no longer re-seats it** (step 6). If he used that to attach a loose end, he now
   drags it. Named in 3.5 and W17.

## 7. Size

`tracker/app/core.js` — about 38 functions touched (the seven kinds and the canvas's capture listener, `cancelGestures`,
`holdFirstFinger`, `takeBackFirstFinger`, `renderBoard`, `pushUndo`, `doUndo`, `doRedo`, `persistSyl`, `leaveFlowEdits`,
`setTool`, `toggleArrange`, `loadCourseNow`, `openSylHere`, `switchSyllabus`, `switchSylNow`, Delete syllabus, Revert,
`emptyForMove`, `trkStore.restore`, `trkWriteRecords`, `clearDirty`, `connectClick`, `applyEndSnap`, `followEdge`,
`wirePageOnce`, `landIfOwed`), about 240 lines in and 115 out (the kinds lose their lift and cancel listeners);
`tracker/App.jsx` — two effects. Two new test files (about 700 lines of unit tests, one small Playwright spec), two
documents.

One builder: the tests, step by step, 7 h; step 1, 6 h (the owner hears the lift); step 2, 4 h; steps 3–4, 4 h; steps
5–7, 3 h; the unit suite, the Playwright specs and the Tracker smoke between steps, 2–3 h — **about 27 hours**, before
the reads. The walk: about 5 hours at two widths, mouse and finger, the script's incoming records for W14. (The first
draft said 12 and 3; round 1's revision, 22 and 4.)

## 8. The red team, round 1 (24 Nov 26)

Reports: `docs/superpowers/briefs/2026-11-24-trk-press-reshape-read-{astra,opus,fable}.md`. Each finding was opened in
the code before a verdict. TRUE = the plan changed. O = Opus, A = Astra, F = Fable.

**Found by two or three readers independently**

| Finding | Readers | Verdict | What changed |
|---|---|---|---|
| The landing sat after `pushUndo`'s snapshot: one Undo could still take two changes | O F2, A 2, F M1 | TRUE **[code: `pushUndo` l.3324 builds its entry before `pushChartStep`]** | the press is ended at the input door, before any handler; belt at `pushUndo`'s first line (3.3) |
| The chart's identity changes before the generation bump; today's course-and-chart guard was dropped | O F1, A 4, F H2 | TRUE **[code: `loadCourseNow` l.2255, l.2271–2272; `openSylHere` l.2397]** | `chartGoing` is the first line of both; the identity check kept beside the generation (3.2, 3.4); T7's mid-load variants |
| `cancelGestures` lost its unconditional clears of the finger hold and the pan | O F4, A 3, F H1 | TRUE **[code: l.4028]** | kept, before `pressEnd` (3.2); T0's resting-finger test |
| A touch landing whose waiting save is then dropped | A 3, F M2 | TRUE **[code: `saveLayout` l.1277]** | an outside landing ends the finger hold first; a no-hand redraw no longer lands at all |
| `stop` cleared what `commit` then reads | A 1, F M7, O F8 | TRUE **[code: `endDrag` l.4686 `if (!drag) return`]** | the record holds the finishing data; "verbatim" withdrawn; T0 before any outside event |
| "Moved" was never defined | O F8, F M4 | TRUE | `held.moved`, set by the move handlers, apart from "has a step" |
| The Flow → Info tab hides the board with the page still "active" | O, A 6 | TRUE **[code: `App.jsx` l.55–56, l.109]** | the tap or key lands at the door; the effect watches `tab` too; a browser test at 402 |
| `deleteEvents` and other swaps missing from the list | A 5, F LOW | TRUE **[code: `deleteFromEditModal` l.4745 → `deleteEvents` l.6861]** | the picks no longer depend on a list: pruned at every redraw; Connect checks its first ball; T4 (d) |
| The build order could not stay green | A 7, F M7 | TRUE | §5: each test before its own step; the owner whole, pinch included, in step 1 |

**Found by one reader**

| Finding | Reader | Verdict | What changed |
|---|---|---|---|
| Landing the old press redraws the board under the new one | O F5 | TRUE in principle **[not run]** | the door lands it; a press on the chart that does so is swallowed (3.3) |
| `loading` never reset when a load throws | O F6 | TRUE **[code: l.2254, l.2369, no `finally`]** | the plan's own `chartBusy` in `try / finally`; `loading` untouched |
| List wipes that are not pushes (`clearDirty`, `removeStudent`'s filters) | O F3, A 2 | TRUE **[code: l.6332]** | the cancel removes its own step by identity and never lays whole lists back; `clearDirty` calls `chartGoing`; no press begins during a save |
| A landing read picks its caller had already changed | O F7, F M3 | TRUE **[code: `applyEndSnap` l.3266 reads `selEdge`]** | the end captures its key; `commit` reads no pick; the door runs before the caller |
| A cancel of an unmoved press replaced objects a caller still held (`saveEdit`, the Arrow button) | A 2 | TRUE of the first draft | an unmoved press's cancel restores nothing; after step 6 no kind changes the chart before it moves |
| A box finished at a redraw overwrote Select all | A 2 | TRUE of the first draft | a box ended by anything but its own lift selects nothing, as today |
| A redraw does fire by itself (`leaveRunningCourses`; `trkWriteRecords`' redraw for any incoming record; `trkStore.restore`) | A 3, F | TRUE — the plan's "none found" was wrong **[code: l.5880, l.947, l.765]** | row 15 and risk 2 rewritten; a redraw under a held press waits |
| The page leaving the screen redraws a hidden board, and "nothing refits on return" | F M5 | **FALSE in its failure, kept in its fix**: the page seam sends a `resize` on show (`TrackerPage.tsx` l.170) and the editor re-cuts its canvas on it (`core.js` l.7824–7838 → `refitArrange` l.3962) | still: a cancel off screen does not redraw; the redraw is owed until shown |
| The kill at a swap of the events alone left a half-done layout | F M6 | TRUE **[code: `trkWriteRecords` l.932]** | `chartGoing` is a cancel, before the swap |
| Undo with a landing whose save is refused takes two | O | TRUE **[code: `dropRefusedStep` l.3337, then `step`]** | `doUndo` / `doRedo` stop after a refused landing; in T1 |
| On a clean chart, Rename course cancelled a held drag though the chart stays | O | TRUE | it lands (the door; `leaveFlowEdits`' belt lands) |
| `takeBackFirstFinger` must take its note before the owner clears the hold; say whether `selEdge = null` stays | O F8 | TRUE | 3.2; it stays (3.4) |
| A mouse's press under a two-finger zoom must carry on | F LOW | TRUE **[code: `fingerStop` is set for a finger only]** | the take-back ends the press only if `held.finger`; in T0 |
| Before or after the swap? | F LOW | TRUE (unsaid) | `chartGoing` before; the pruning after, at the redraw |
| The press's step must go through `pushChartStep` | F LOW | TRUE | 3.2 |
| A capture `blur` listener would fire on every Tab | F LOW | TRUE | not capture, `e.target === window`; in T6 |
| Export's file picker would blur the window and cancel a held drag | F LOW | TRUE of the first draft [browser not checked]; moot now | the press on Export lands the drag first; the pickers are an iPhone look |
| Duplicate copies the chart as on screen, a held press's half-change with it | F lead | covered | the key or press that opens Duplicate lands first |
| A landing's save issued inside another command | F lead, O | [not checked] by either; avoided | no landing happens with no hand; the belts are first lines of his own actions |
| Keep the window-focus cancel; mend the smoke instead | A 6 | TRUE | risk 6 |
| T4c is protection, not a failing test; W1 must look at Undo before a reload; T7 passed for the wrong reason; `drawnLine()` before the edit | A 7, O | TRUE | §5 |
| §6: a click on a drawn line's end "takes back nothing" | F | TRUE — it leaves the end loose | §1 corrected; step 6 mends it |
| "No `blur` listener"; "six callers"; row 1; the two Playwright specs | F, O | TRUE | row 16, 3.2 (five), row 1, §4 |
| Visible changes the two questions missed: the box; a link staying selected after Undo; another person's mark ending his drag | O, A, F | TRUE of the first draft | none of the three happens now (3.5's last paragraph); what the door changes is Q3 |
| Q2 misdescribed a window switch as saving the ball; a page switch by his own hand is not an interruption | A, F | TRUE | Q2 rewritten; the page switch lands |

## 9. The red team, round 2 (24 Nov 26)

Reports: `docs/superpowers/briefs/2026-11-24-trk-press-reshape-read2-{astra,opus,fable}.md`. No reader asked for
another shape. Each finding was opened in the code before a verdict; duplicates are one row. A = Astra, O = Opus,
F = Fable, with the reader's own number. None was judged false.

| Finding | Readers | Verdict | Where the plan now answers it |
|---|---|---|---|
| The first finger's note is a second, unguarded way to lay an old chart back: a finger resting on empty canvas, a swap or a put-back, then a second finger | A 1 (HIGH) | accepted **[code: `takeBackFirstFinger` l.4060 checks course and chart id only; `holdFirstFinger` l.4045 copies the chart and both lists; `chartGoing` → `pressEnd` returns at once with no press]** | 3.2 (the note carries the generation, checked before the press is ended); 3.4 (`chartGoing` ends the hold, press or no press); step 3's resting-finger test |
| The chart is re-pointed before `chartBusy` is raised: a **new** press can begin in the wait and store the old layout under the new chart's key | A 2 (HIGH, slow store), O 10, F 5 | accepted **[code: `switchSylNow` l.6380–6382 and `switchSyllabus` l.6119 run `openSylHere` (l.2397; `await savePlan()` with nobody signed in as a person) before the load; Delete syllabus l.6653–6656; Revert l.6638]**. Not reachable while the store answers at once | 3.4 (`chartBusy` round the whole of both switches, Delete syllabus and Revert); step 3's "a new press in a wait"; risk 4 |
| A refused landing, then Undo, still takes two on the real key path — the guard sat in the belts, which the door has already emptied | O 1, F 3 | accepted **[code: `handleUndoKey` l.3478 is a `document` listener, after the door; it stops only on `dlg`, which the refusal's box does not raise when a box is already up or under `trkQuietly` (l.693)]**; §8's row held for the belt only | 3.2 step 7 (`refused`); 3.3's new row (the swallow in the door, Opus's simpler cut); T1 by real keys |
| A drawn line's end changed at the lift with no Undo step, once step 6 moves the step to the first move | O 2, A 4 | accepted **[code: `.lend`'s lift l.3852–3860 re-snaps and saves with no test of movement]**. Of the two fixes, **Opus's**: the end's lift does nothing unless it moved, as the corner's (`if (moved)`). Astra's (take the step before a lift-only change) keeps a click that moves the end and lights ✓ Save changes — not what a click is expected to do. The agent's reading; named to him in 3.5 | step 6 and T5; 3.5 "Decided here"; W17; risk 10 |
| A put-back lays the cancelled press's step back onto the Undo list | A 3, F 4 | accepted **[code: `capture` l.740 copies the list with the step in it; `restore` l.749 assigns it after the proposed first line]** | 3.4 (`chartGoing` answers the step; `restore` removes it by identity, the Redo list of before the press kept); step 3's "the refused command, exactly" |
| "A mouse's press carries on under a two-finger zoom" cannot hold beside `pressBegin`'s belt when the first finger lands on a ball; the finger's wider note would also lay back over the mouse's move | A 5, F 7 | accepted — and **round 1's row is withdrawn** rather than patched: one press at a time, whatever the device. A finger on the chart puts the mouse's press down at the door. No test pins today's behaviour **[grep: none of `src/tracker/*.test.tsx` holds a mouse drag under a pinch]** | 3.2 (last bullet); 3.3's "any other press"; step 2's door test; 3.5 "Decided here" |
| A press whose lift is never heard now leaves every later redraw waiting | F 1 (MEDIUM), O 8 | accepted, by **Fable's second cut in part**: the owner hears the held pointer's `pointerup` / `pointercancel` on `window`, capture, and a lost capture; and the door treats a primary touch on the chart as the lost lift's healing. The kinds keep their move listeners (the larger cut would re-prove the ball's capture on the phone) | 3.1; 3.2 (`pressBegin`, "the owner hears the lift"); 3.3; step 1; step 2's "a lost lift"; risks 2, 9 |
| A second mouse button sends no `pointerdown`: "no place to forget" was overstated, and W13 / T2 describe a press one mouse cannot make | F 2 (MEDIUM), O 9 | accepted in part: the claim and the tests are reworded, and `setTool` / `toggleArrange` gain belts. **No `mousedown` listener** — the held press's own compatibility `mousedown` would have to be told from a second button's, and a second button activates nothing in the editor | 3.1; 3.3 (belts, seven); T2; W13 |
| Another tab's or person's move or save of the same chart cancels his drag — against "someone else's change does not end his drag" | O 3 | accepted **[code: `trkWriteRecords` l.919 layout branch, l.932 events]**. The cancel stays (a line handle would otherwise write into a line no longer on the chart); the sentence is corrected and the change put to him | Q2; step 3; W14 (b) |
| Visible changes missing from the questions: the second press used up; a resting thumb; the unsaved-edits question after a line handle held through his own squadron pick; any key, here only; Alt+Tab beside a page switch; a dead tap during a save or load; a ball held still on iOS | A (Q3), O 4, F | accepted | Q2, Q3 (no fourth question needed); W15, W16; the iPhone looks |
| Step 1 deletes `endPressForStep` before the belts exist: `msq-night-press-undo` would go red | O 5 | accepted | step 1's build line; §4 |
| A refused `pressBegin` must not bubble to the canvas's pan or box | O 6 | accepted **[code: the canvas's own pointerdown skip list, l.3900, names no `.lvert` / `.lend`]** | 3.2 (`pressBegin` after the kind's own `stopPropagation`); T0 |
| The key door: a key already repeating, and more modifier keys | O 7, F 6 | accepted | 3.3's "any key"; step 2; W13 |
| W14 cannot prove a live cross-tab change in this build | A | accepted **[code: `loadLatest` is empty, `storage.js` l.157]** | W14 |
| The swallow flag needs an end | F 6 | accepted | 3.3; step 2; risk 8 |
| `cancelGestures` would now redraw inside `pressEnd`; its answer unsaid; `fingerStop` neither kept nor deleted | F 6 | accepted | 3.2 (no redraw, answers as today; `fingerStop` deleted) |
| A landing should end the hold by `releaseFirstFinger()`, so a parked save is made | O 11 | accepted **[code: l.4052]** | 3.2 step 4 |
| An owed redraw is paid on `active` only, not on the phone's return to Flow | O 11 | accepted **[code: `App.jsx` l.109 → `refitAfterShow` returns early in the editor]** | 3.2 step 5; step 5 |
| Risk 2's "none found": `leaveRunningCoursesNow` scrolls the old board | O 11 | accepted — a view jump, no data | risk 2 |
| Three of step 2's tests pass today | O 11 | accepted | §5, *(protection)* |
| A cancel need not lay the events back | O 11 | accepted — no kind changes them before `commit` | 3.2 step 5 |
| After a no-hand filter of the lists, a cancel loses the Redo list of before the press | O 11 | accepted as a cost, noted | 3.2 step 5 |
| The edge pan must report movement through the owner | A | accepted | 3.2 (`pressMoved`) |
| Step 1 must already hold all finishing data; no "stays green" claim before the suite runs | A | accepted | step 1; §4 |
| The door is wired before the pinch's own listener; keep "the hold is ended first" | F 6 | holds as written | 3.2 step 4 |
