# The Tracker's held press — a reshape (plan only, nothing built) — revised after the red team's three rounds

24 Nov 26. For `[MSQ-NIGHT-153-OPEN]` part (3), under his D2238: where rounds of fixes keep finding faults in one place,
the place is reshaped first, and the plan is read by three independent readers (Astra, a fresh Opus, a fresh Fable —
each blind) before anything is built. Round 1 said the shape is right and that it must not be built as first written
(§8). Round 2 read the revision: no reader asked for another shape; Astra asked for two gaps in the chart's protection
to be closed first, Opus and Fable found no HIGH (§9). Round 3, the last (his cap of about three), again asked for no
other shape; its findings are folded in and the build's code reads check them — there is no fourth round (§10). §3–§7
are the plan as it now stands, after all three. Written from
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
present or future. (Not every act of his hand is one of those: a voice or screen-reader "click" sends neither, so
round 3 added a third door, for a `click` heard while a press is still held (3.3); a second mouse button sends no
`pointerdown` and no `click`, and does nothing in the editor.) **Chosen: Fable's, with Opus's hardening for what no hand drives** (the load's start, the kept course-and-chart
check). What Astra asked for — nothing read before the press is ended — it gives for free.

One departure from Fable's cut: it kept a landing at the first line of `renderBoard` as the belt for no-hand events.
Here **a redraw asked for under a held press waits** instead. With the doors in place, such a redraw is never his
doing; landing there dropped his ball because someone else made a mark, needed a special case for a finger's waiting
save, and saved from inside another command's redraw (which two readers could not check).

Round 2 added **Fable's second cut, in part**: the owner itself hears the held pointer's lift and cancel (3.2), so a
lift is never lost to an element — which matters more now that a held press makes redraws wait. The kinds keep their
own move listeners (the ball's pointer capture is not re-proved). Round 3 added the owner's one look at the held
pointer's moves, for a mouse's lift the page never heard (3.3).

What the cut costs: (a) any key, not only one that does something, puts a held ball down — the one place in the app
where it does (his question Q3); (b) a squadron pick or Logout made by his own hand with a ball held now keeps the ball
where he held it, where today it goes back, and with a line's handle held the unsaved-edits question now appears (same
question); (c) the tests must send real key, pointer and click events to prove the rule — a direct call of a
function proves only a belt.

### 3.2 One owner, two ways out

One record, `held`, for the one press under way.

```
pressBegin({ kind, pid, finger, el, stop, commit }) // each kind's pointerdown: after its own stopPropagation /
                                                   // preventDefault (so a refused press never bubbles to the canvas's
                                                   // pan or box), before it changes anything
    answers null — the kind does nothing — while unitLeaving, !ready, a load, switch or save of the chart is under way
    (chartBusy, 3.4), or a press is still held (belt: that one is landed first; the new press is not begun);
    notes: storageUnit(), course, curSylId(), chartGen, the chart {syl, lay} (an Undo step needs both), sylDirty;
    listens on window, capture, for pointerup and pointercancel of pid — and, for a mouse's or a pen's press, for
    pointermove of pid (the lost lift, 3.3) — and on el (the ball, for a ball or a group) for lostpointercapture
pressMoved(point)                                  // each kind's move handler, and the edge pan's carry:
                                                   // held.moved = true, held.last = point
pressChanged()                                     // puts the press's ONE step on the list (through pushChartStep, so
                                                   // lastPush / dropRefusedStep work) — the note's { syl, lay }, both:
                                                   // applyHistData parses both, and a step with no syl throws at Undo
pressEnd(how, ev)                                  // THE ONLY EXIT.  how: 'land' | 'cancel'
```

- **The press's own record holds everything its finish needs** — `moved`, `last`, and what the kind captured at
  pointerdown (the ball id and start places, the box's rectangle, the link's key, the line's id and index). `commit`
  reads only that record: never `drag`, `groupDrag`, `marquee`, **never a pick** (`applyEndSnap` takes the key the end
  captured, and does nothing if that link is no longer on the chart), never the tool or the mode.
- **The owner hears the lift, not the kind.** Its `window` capture listeners call `pressEnd('land', ev)` on the held
  pointer's `pointerup` and `pressEnd('cancel')` on its `pointercancel`; a `lostpointercapture` **of the ball itself**
  (`e.target === el`, the held pointer) that finds the press still held (after an ordinary lift it finds none — `held`
  is already null) is the pointer taken away: CANCEL. One that only bubbles up from a shape inside the ball is ignored
  — a finger is captured first by the shape it touched, and `setPointerCapture` on the ball moves the capture, which
  would otherwise cancel every finger's drag as it began. The kinds' own `pointerup` / `pointercancel` listeners go;
  their move listeners stay where they are. The owner's own move listener (a mouse's or pen's press only) does one
  thing: a move of the held pointer with no button down (`!(e.buttons & 1)`) is a lift the page missed — `pressEnd('land')`
  with no event, so it lands at the last point seen **with the button down** (3.3).
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
  4. `'land'`: for a finger's press the hold is ended **first**, by `releaseFirstFinger()` — **on its own lift too**
     (the take-back window closes; a save already parked on the hold is made, and the landing's own save is made now).
     The owner's `window` listener hears a lift before the pinch's `drop` on the board does (l.4260), so without this
     the lift's save would park on the hold (`saveLayout` l.1277) and be made only if `drop` heard the same lift.
     `TRK_REFUSED_N` is read **before** that release, so a parked save refused there counts. Then: from its own
     pointerup → `commit(p, ev)`; from anything else, a press that never moved, and a selection box always, → as
     `'cancel'`; a moved one → `commit(p, null)`;
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
  6. a redraw that waited (3.3) is made now — **but never inside an exit whose caller asked for none**: there the debt
     simply stays, and the caller's own redraw pays it (any redraw that runs clears it). So sign-out still draws
     nothing, and nothing is drawn in the middle of `trkWriteRecords`, where the store's copy is already new and the
     events on screen still old;
  7. it answers `{ step: p.step, refused }` — `refused` when `TRK_REFUSED_N` rose across the release of step 4 and
     `commit` (the landing's save was refused: `dropRefusedStep` has taken its step off and the store has put the chart
     back).

  Steps 2 and 6 are each in a `finally`: a `stop` or a `commit` that throws leaves no listener on and no redraw
  waiting for good.
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
nothing else — the swallow of 3.3 is made at the window), `gestureBegan`, `gestureEnded`, `endPressesOnRedraw`, `endPressForStep`, `fingerStop`
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
| **A lift the page missed, shown by his hand**: a mouse's or pen's move of the held pointer with no button down; or the next press (the row "any press" below) | LAND, at the last point seen with the button down — the button-less move's own point is never used | the owner's `pointermove` listener on `window`, capture (a mouse's or pen's press only); the pointerdown door | The right button's menu took the lift, or it came up in another program — how the Reorder rows already tell it (`Modals.jsx`, "(F2)", `!(ev.buttons & 1)`). They drop nothing, because where a row lands is decided where it is let go, which nobody saw; here the ball is already drawn where he left it. **One rule for a missed lift:** a button-less move or a fresh press *shows that his hand let go* — his own hand, LAND; a lost capture shows only that the browser took the pointer and says nothing of his hand — taken from him, CANCEL (below) |
| **Any key** (a bare Shift, Ctrl, Alt, ⌘ / OS, AltGraph, CapsLock, NumLock or Fn excepted; a key already down and repeating — `e.repeat` — excepted) | LAND | **the input door**: one `keydown` listener on `window`, capture, wired once in `wirePageOnce` | covers Undo / Redo, Delete, the Font box, a tool, Done, ✓ Save changes, every button and dropdown reached by Tab, a page or tab switch, a squadron pick, Logout — and whatever is added later. **Q1, Q3** |
| **Escape** | CANCEL, and the key does nothing else | the same listener | the Reorder windows' rule ("Escape ends the carry, not the window", `Modals.jsx`); today it does nothing. **Q3** |
| **Any press** — every `pointerdown` heard while a press is held, **whatever its pointer number** (the held press's own never meets `held`: the door runs before `pressBegin`): a mouse anywhere — a mouse is always the same number, so its next press after a lost lift is this case; a finger off the chart; a finger on the chart while the held press is a mouse's; a **primary** touch on the chart while a finger's press is held (the device saying no finger was down — the held one's lift was lost; the test `enablePinchZoom` l.4217 already trusts). **One exception**: a non-primary touch on the chart while a finger's press is held — the pinch's second finger (the row "A second finger on the chart" below) | LAND | **the input door**: one `pointerdown` listener on `window`, capture. A press that falls inside the board is **stopped there, at the window** (`stopPropagation()` + `preventDefault()`): the board has just been redrawn under it. Stopped at the canvas, as round 2 had it, the pinch had already counted it — its listener is a capture listener on the board, above the canvas (l.4208) — and taken a first-finger note for it. Stopped at the window it is no finger of a pinch and takes no note; and the door has the pinch forget whatever it still counts (the statements its own primary-touch branch runs, l.4217 — a stale count of the lost finger must not pair with the next one). The click that follows is dropped at the click door (next row); the "drop the click" flag is cleared at that pointer's own lift or cancel plus one task, so a swallowed press dragged away never eats his next real click | one press at a time, whatever the device; a lost lift heals at the next touch or press, which puts the stuck ball down and does nothing else. A second mouse *button* sends no `pointerdown` and does nothing to the drag, as today |
| **A click heard while a press is still held** — no key and no `pointerdown` came before it: voice control, a screen reader, a script | LAND | **the click door**: one `click` listener on `window`, capture — the same listener that drops the click after a swallowed press. A click on the chart itself is swallowed after the landing, like a press there | Select all "clicked" by voice under a held box would be overwritten by the box at its lift, and under a group drag the next move throws (`moveGroup` l.4644 reads a start place the new balls do not have); Arrow reads its target before it reaches `pushUndo`'s belt. An ordinary click never meets this door with a press held: its own `pointerdown` has already landed it |
| **A landing at a door whose save is refused** | the key, press or click is swallowed: `preventDefault()` + `stopPropagation()`, and the click after a press | the three door listeners read `pressEnd`'s `refused` | the store has already put his move back and said so; the Undo, tool or button he pressed must not then act on a chart he has not seen settle — else Ctrl+Z takes back the change before the drag as well (`handleUndoKey` runs after the door and finds no press) |
| A second finger on the chart | CANCEL through the pinch's take-back | `takeBackFirstFinger` | D134 — stays as built |
| **A redraw asked for while a press is held** | **waits** for the press to end | first line of `renderBoard` | **fault 2**: a redraw can no longer end a press at all; and someone else's mark must not drop his ball |
| **The chart is about to be swapped or its identity changed** | CANCEL, no redraw, then `chartGen++` | `chartGoing()` (3.4), before the first change | **a press only ever writes into the chart it began on** |
| A squadron pick, a right ending, his move at midnight, the hold, sign-out; Save / Discard on either question | CANCEL (as today) | `follow`, `leaveSquadron`, `endSession`, l.100, l.137 — unchanged | D2395, D2243, D2318, D148. Reached with a press still held only when no hand drove them (or by a direct call) |
| **The press is taken from him**: the system cancels the touch; the browser takes the ball's capture away; the window loses focus; the browser tab is hidden; the Tracker's page or its Flow half leaves the screen with no hand | CANCEL | the owner's `pointercancel` listener and its `lostpointercapture` listener (the ball's own only, 3.2); one `blur` listener on `window` (not capture, `e.target === window` — or every Tab would cancel) and one `visibilitychange`; `App.jsx`'s effect on `active` and `tab` | what the four handles, the box, the pinch and the Reorder windows already do. **Q2** |
| Belts, for a direct call — a test, or code no event drove (a "click" with no key or press before it now meets the click door) | LAND at the first line of `pushUndo` (before its snapshot), `doUndo`, `doRedo`, `persistSyl`, `leaveFlowEdits`, `setTool`, `toggleArrange` | seven lines | a landing whose save is refused stops `doUndo` / `doRedo` there (else `dropRefusedStep` and `step` take two); `setTool` and `toggleArrange` are the two whose own redraw would otherwise wait under the press |

"Stay" on either question: by his hand the press has already landed at the key or press that raised the question.

### 3.4 The chart's identity, and the picks

**`chartGoing()`** — `pressEnd('cancel')` without the redraw, then `firstFinger = null` **press or no press** (a finger
resting on empty canvas holds a note of the whole chart and both lists; left alive, a second finger would lay the old
chart back over the swap — a parked save goes with it, as §6 already accepts), then `chartGen++`; it answers the
cancelled press's step, or null — is the first line of every function that swaps the chart or changes which chart is
meant, *before* its first change or wait:
`loadCourseNow` (l.2245 — before `course = c`; covers its null-course return, its wipe of the lists at l.2271, the swap
of `plan` at l.2272 and everything after), `openSylHere` (l.2396, before `plan.sylId = id`), `emptyForMove` (l.300),
`trkStore.restore` (l.741), `trkWriteRecords` at four points — before `course` is re-pointed when the course on
screen has gone (l.903, `if (courseGone)`: round 3 — the l.908 call came after that assignment, leaving the press to
be judged dead rather than cancelled), and the three branches that swap `SYL` or `layout` (l.908, l.919, l.932 — not
its marks-only path; `customDefs`, re-read at l.904, is not something a press reads) — and `clearDirty` (l.6331 — the
history is being ended). Cancelling *before* the swap puts the
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
reload; in Revert from before `sweepChart` (l.6638) to the end of its `loadCourse`; round the whole body of Import's
`applyCharts` (l.7127 — it stores the chart's layout at l.7151, then waits on five more writes before its
`loadCourse` at l.7200, with course, chart and generation unchanged: a ball dragged and let go in that wait would
store the old layout over the imported one; not reachable while the store answers at once); round `loadCourseNow`'s
body; and round `persistSyl`'s. A counter, so the nesting is harmless. It is the plan's own; `loading` (never reset when a load
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

Each is one decision, with a recommendation the build can go on as the agent's reading. All three readers, in all
three rounds, agreed with the recommendations; rounds 2 and 3 asked for the wording below, which names every visible
change.

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
  - **Any key at all** puts it down. The only keys that do not: a Shift, Ctrl, Alt, ⌘ / Windows key, AltGr, Caps Lock,
    Num Lock or Fn pressed by itself, and a key that was already held down before the drag and is still repeating.
    The Tracker's chart would be the one place in the app where that is so: the calendar drags and the Reorder lists
    end on Escape only and ignore other keys. Here the keys that act must end the drag, and "any key" is the rule
    that cannot miss one.
  - **A selection box being drawn disappears on any key or other press, selecting nothing** — he draws it again.
    Today a key does nothing to a box.
  - **A squadron picked, or Logout pressed, with a ball held** keeps the ball where he held it, where today it goes
    back. With a **line's handle** held, the handle is put down as an unsaved edit — so the "You have unsaved chart
    edits…" question now appears before the pick or the Logout, where today nothing was asked.
  - **On a phone, a thumb resting on the header or the Info half** while another finger carries a ball puts the ball
    down mid-drag. Today that touch does nothing to it.
  - **A second press on the chart itself** — a finger beside the mouse, or the next tap after the phone lost a lift —
    puts the held ball down and does **nothing else**: that press is used up, and he presses again for what he meant.
    With one mouse it happens only after a let-go the page never heard (the right button's menu took it, or it came
    up in another program): the ball is put down where he let go as soon as the mouse next moves — today it sticks
    to the pointer. A second mouse button by itself does nothing to the drag, as today.
  - **A tap on the chart in the instant it is being saved or loaded** does nothing; he taps again. Nothing to see
    today, when both are instant; it could be felt once the database is in. Filed.

Decided here, the same rule he would already expect: a selection box ended by anything but its own lift selects
nothing (what is new is only that a key now ends it — named in Q3); a page or tab switch by his own hand puts the ball
down like any other key or press; a finger on the chart while the *mouse* holds a ball puts the ball down (today the
two carried on together); and, from step 6, **a mere click or tap on a drawn line's end changes nothing** — today it
re-seats the end where the click fell and lights ✓ Save changes, with nothing for Undo to take back. So that a
finger's tap, which always carries a pixel or two of movement, is a tap here too, the end does not start to move until
the pointer has gone **4px** from where it pressed — the Reorder rows' own measure (`Modals.jsx`); to attach a loose
end he drags it that far or more (§9, §10; the agent's reading — his to overturn). The other six kinds keep today's
"any movement is a move".

## 4. How every fault and every earlier fix comes out

| Fault | Under the reshape |
|---|---|
| 1. One Undo during a drag takes back two changes | the Z's keydown (or the press on ↶) lands the drag at the door; `step` pops exactly that step |
| 2. A redraw ends a drag unsaved | no redraw ends a press: his own key or press lands it first; another's redraw waits |
| 3a. A handle's press outlives a Discard | it landed at the key or press that opened + Add course, before the question; nothing of it is left to lift |
| 3b. A later Save lays the press's old note over newer work | the newer work's own key landed the press first; the note lives and dies with `held`, and whole lists are never laid back |
| 4. Picks survive an Undo, a clean switch, a delete from the ball editor | pruned at the redraw each of them makes; cleared at a load |
| 5 (found here). A drawn line's handle drag cannot be undone | its step is the note taken at `pressBegin` (step 6); a mere click on an end changes nothing, so needs no step |
| Rows 14–17 | `chartGoing` before any change of identity, and no press begun while one is under way (`chartBusy`); interruption cancels; any next press lands the old, its own pointer's included; a lift is heard by the owner, so none is lost to an element, and a mouse's missed lift is seen at its next move |
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
the reshape, by the round-2 and round-3 readers too (their lifts are sent with `bubbles: true` or on `window`, so the
owner's listener hears them); the others were **not read press by press** — the suite decides, and nothing is called
green until it has run. Two things could turn one of them red without the app being wrong, and neither is mended
silently: (a) a test that leaves a press held from one case into the next — every file here uses one pointer number
for everything, and the next case's first press would now put the old one down and be used up; (b) a harness whose
mouse moves carry no `buttons` (`trk-batch-ui`, `msq-fix2-trksave`, `trk-refusals` and the mouse helper of
`trk-pinch-edges` build them so **[code: grep]**; the three press files and `tracker` send `buttons: 1`) — under a
held press such a move now reads as a lift the page missed. A real mouse's drag always carries the button, so for (b)
the harness line gains `buttons: 1` and no expectation is touched. Either case is **reported to him by name, never
edited to pass**.

## 5. The build order

Every step: its tests written first and seen failing (a test that will not fail is reported and its fault struck), then
the step, then the whole unit suite green. A test marked *(protection)* passes today and must go on passing — it is
not expected to fail first. New tests go in `src/tracker/trk-press-owner.test.tsx`, harness copied from
`msq-night-press-undo.test.tsx`. A test of the *rule* sends a real `keydown` or `pointerdown` through `window`; a direct
call tests a belt and says so. `drawnLine()` saves, so it is called before whatever makes the chart unsaved.
**Two things about the test browser**, said once: (1) a `keydown` there activates nothing — every "by key" test sends
the `keydown` through `window` (the door) **and then** makes the click or the call the key would have made; (2) the
copied harness never mounts `App.jsx`, where Undo's, Delete's and Escape's keys are bound (`App.jsx` l.139–141, on
`document`) — the new file binds `handleUndoKey` and the other two on `document` as `App.jsx` does, or a real Ctrl+Z
lands the press and no Undo follows.

**Step 1 — the owner, whole; an ordinary press does what it does today.** (It is not "no change of behaviour": two
things change here and are tested failing-first — a lift is heard on `window` for every kind, and one press is held at
a time.)
Before: **T0a** (protection, green today): an ordinary press–move–lift for each of the seven kinds, the lift sent
where today's listener hears it (on the element for a ball, a group and the box; on `window` for the four handles) —
the stored layout, the step count, the unsaved mark, the selection, **then one Undo and one Redo** (the step carries
the events as well as the layout); a finger resting on empty canvas across a squadron pick, then a second finger — the
squadron entered untouched (the unconditional clears); a refused press (`unitLeaving`) on a drawn line's corner starts
no pan and no box. **T0b** (failing today): the lift sent on `window` for a ball, a group and the box — heard (today
their lift listeners sit on the element, l.4658, l.4628, l.4621, which a `window` event never reaches); a **finger's**
ball lifted with the lift sent on `window` only — stored at once, by one command, without the board's own listener
hearing it; a second press while one is held (row 17) — the first is put down, the second does not begin; a
`lostpointercapture` that bubbles from a shape inside a held ball — the press goes on; a lift sent without `bubbles`
on an element still on the page — heard; a lift sent on an element taken off the page — not heard, and the next press
puts the ball down (risk 9).
Build: `held` with its own record — **all** the finishing data in it from this step — `pressBegin` / `pressMoved`
(the edge pan's carry too) / `pressChanged` / `pressEnd` (the finger's hold released before every landing, its own
lift included), the owner's own lift, cancel and lost-capture listeners (a
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
— the mouse's ball stored where it was, the finger drags nothing, **takes no first-finger note and is no finger of a
pinch**: a second finger then starts no zoom with it and takes nothing back, and an edit made while it rests is
stored at once, not parked; *(protection)* a finger's ball held and a real second finger on the chart — the drag is
taken back and the two zoom (D134).
**A click with nothing before it**: a box held and moved, a bare `click` on Select all (no `keydown`, no
`pointerdown`), then the box's late move and lift — all selected, the box selects nothing; the same under a held,
moved group — the group is stored where it was, all selected, the late move throws nothing and moves nothing; a bare
`click` on Arrow with a line's corner held and moved — the corner stored, then the arrow, two steps in that order; a
bare click whose landing is refused — the button does not act.
**A lost lift**: a finger's ball press moved, its lift never sent; a primary touch on empty canvas — the ball is
stored there; then Connect's first click — its ring is drawn (no redraw left waiting). The same with the new press
carrying the **same pointer number**, by touch and by mouse: a mouse's line handle moved, the lift withheld, a second
`pointerdown` of that number on a link — the handle is stored where it was last carried, the press is used up, the
selection is unchanged, the old press's late move and lift change nothing, and Connect's ring then draws; the same
with the second press on a toolbar button — the handle is stored at its last carried place, **not** under the
toolbar, and the button acts. A mouse's ball moved, then a `pointermove` of its number with `buttons: 0` at another
place — stored where it was last carried with the button down, and later moves move nothing; *(protection)* a
finger's move with `buttons: 0` ends nothing. `lostpointercapture` on a held ball itself — back where it began,
nothing stored.
Build: the three door listeners with their refused-landing swallow, the stop at the window of a press inside the
board (the pinch told to forget its count) and the dropped click's flag, the owner's button-less-move check, the
waiting redraw, the seven belts, every `commit` reading its own record (the link's end its captured key).

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
while ✓ Save changes is waiting on a slow store — it does not begin. A press tried inside Import's replace of the
chart on screen, on a store made slow — it does not begin, and the imported layout is what is stored. Another tab's
change that removes the course on screen, under a held, moved ball — nothing of his is stored under the course the
app moves to, and no step of his is left. *(protection)* A load that throws, and a switch that throws — the next
press still begins. A waiting redraw and a `chartGoing` together: an incoming mark, then an incoming change to the
events, both under a held ball — his ball goes back, and the board then shows the mark and the new events (the redraw that
waited is paid by the incoming change's own redraw, not in the middle of it).
Build: `chartGoing` at its six functions (the finger hold ended in it; `trkWriteRecords` at its four points),
`trkStore.restore`'s removal of the dead step, `chartBusy` round the two switches, Delete syllabus, Revert, Import's
`applyCharts`, the load and the save.

**Step 4 — the picks.**
Before: **T4** (a) Connect, + event X, click X, Undo, click another ball — that last click adds no prerequisite and
no Undo step (`canUndo`'s depth unchanged; the chart is already unsaved by then — + event and the Undo each mark it,
`applyHistData` l.3375 — so "nothing marked unsaved" cannot be the test);
(b) Connect armed, a clean switch to a chart without that ball, a click — nothing; (d) Connect armed on a ball, its
editor opened by double-click, Delete there, a click on another ball — nothing. (c) is protection, green today and
after: a group selected, moved, Undo — still selected; a link selected, Undo — deselected.
Build: `prunePicks`, the clear in `loadCourseNow`, `connectClick`'s check.

**Step 5 — interruptions** (on Q2's answer, or its recommendation).
Before: **T6**: a ball moved, `pointercancel` — back where it began, nothing stored, no step; `blur` on `window` — the
same, and a later move moves nothing; *(protection)* a `blur` whose target is a button — nothing ends; the Tracker hidden with a press
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
Undo then takes B; **the same with a move of 3px between press and lift** (a finger's tap), by touch and by mouse;
and a move of 6px — the end follows from that move on, and its lift attaches it. Expected to fail today **[not run]**.
Build: `pressChanged` at the corner's first move and the end's first move; **the end's first move is the first that is
more than 4px, on screen, from where it pressed** (`Math.abs` on each axis, as the Reorder rows' `rowDown`): until
then `pressMoved` is not called and the dot does not follow; the end frees its link (`L[key] = null`) at
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
| W13 | A ball held: a bare Shift (nothing), a key already held down before the press (nothing), an arrow key (put down), Escape (back), the right mouse button (nothing, as today). A second press on the chart puts the first down and does nothing else, and no click follows — one mouse cannot make it: driven by the walk script as a finger beside the held mouse, and by a lift withheld, then a tap. **By hand, the mouse's missed lift**: a line's handle held with the left button, the right button pressed (the browser's menu opens), the left let go over the menu, the menu closed, the mouse moved — the handle is put down where he let go and no longer follows; then a click on a link selects it. **A click with nothing before it** (the script sends a bare click on Select all under a held box, then under a held group) — all selected, nothing thrown | yes (by hand and script) | the withheld lift, then a tap on empty canvas, then Connect — its ring shows; then a second finger beside the used-up tap — no zoom jump |
| W14 | A ball held while (a) a mark is made by someone else — the drag carries on, the chart catches up at the lift; (b) someone else moves a ball on the same chart — his held ball goes back, theirs shows. This build's store does not bring another tab's change in live (`loadLatest` is empty, `storage.js` l.157), so the walk script hands the incoming record to the Tracker through the store's own door and first shows that it arrived; real two-tab delivery is a look of its own at the database step | yes (script) | — |
| W15 | A line's handle held, a squadron picked by keyboard — the handle is put down, the unsaved-edits question appears; Stay, then Discard | keyboard | second finger on ☰ |
| W16 | A thumb resting on the header, then on the Info half, while another finger carries a ball — the ball is put down | — | yes |
| W17 | A drawn line's loose end clicked without moving, near a port and away from one — nothing changes, ✓ Save changes stays unlit; then dragged onto the port (more than 4px) — attached, one Undo takes it back | yes | yes — a **tap**, several times: in the test browser a tap carries no movement, so this proves the rule and not his finger (the iPhone look below) |
| W18 | Import that replaces the chart on screen, then at once a ball dragged — the imported layout is what shows after a reload (on today's instant store this is plain use; the wait itself is a unit test) | yes | — |

**What a finger on a phone cannot reach:** every keyboard path; the mouse beside a finger.
**Looks for his iPhone** [cannot be established in the test browser]: whether iOS gives a second finger's tap to a
button while the first holds a ball (W2–W4, W9, W10 by finger); whether the Course and Syllabus pickers, or the file
picker, open under a held finger and whether opening one counts as the window losing focus; whether iOS cancels the
first finger's touch when a second lands; a real interruption (a call); a ball carried to the left screen edge or the
bottom bar, and a ball held still for some seconds — whether iOS takes the touch (Q2); a thumb resting off the chart
(Q3, W16); whether a lift is ever lost now that the ball is not redrawn away under the finger; whether a finger's
ball drag ever goes back by itself as it begins (the capture moving from the touched shape to the ball — 3.2 ignores
that one; any other lost capture now cancels); whether a tap on a drawn line's end stays a tap under the 4px measure,
and whether 4px is felt as a dead spot when he means to drag it (W17); whether a press on the Syllabus or squadron
picker still opens it after a landing the app could not save (risk 8).

## 6. What is deliberately not changed, and the risks

**Not changed**
- What an ordinary lift does, kind by kind — but for the mere click on a drawn line's end (step 6) — including one
  oddity left, in two places: a click on a link's bend square without moving marks the chart unsaved and adds an Undo
  step that takes back nothing; and a still click on a **link's end** (the same orange dot as a drawn line's) still
  runs `applyEndSnap`, whose same-ball branch does the same. Not mended here — `trk-refusals` drops link ends with no
  move and relies on `applyEndSnap` running. Both to file, together.
- The pinch and its take-back (D134), the pan of empty canvas, the chart's scroll and glide outside the editor, the edge
  pan (`followEdge`, D899), the Line tool's two clicks, the Reorder windows' drags.
- Undo's own machinery (`step`, the restore command, `lastPush` / `dropRefusedStep`, the parked history per squadron),
  `saveLayout`, the squadron move's order, the two questions and their words, Export, `loading`; Import but for the
  `chartBusy` round `applyCharts`.
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
   then simply stays held; the belts cover the actions that matter. The click door is the third: it acts only while a
   press is held, which an ordinary click never finds.
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
8. **A press swallowed** at the door (a press on the chart that put another down) is stopped at the window, so the
   pinch never counts it (round 2's text said so while stopping it at the canvas, below the pinch's listener — wrong
   in fact, round 3). The pinch's count lives inside `enablePinchZoom`; the door reaches it through one small function
   the build adds there, and the finger's later lift is ignored by `drop` as "not a finger this board is counting"
   (l.4252). Whether a click still follows a swallowed press is **[not checked]** — W13 looks; the flag that drops it
   ends with that pointer's lift, so it cannot outlive the press it was set for. `preventDefault` on a press does
   **not** stop a native dropdown opening in every browser **[not checked]**: after a landing the app could not save,
   a press on the Syllabus or squadron picker may still open it. No data is at risk — the store has already put the
   chart back, and only Undo could have taken two.
9. **The owner's lift listener is on `window`, capture.** It hears a lift sent to any element still on the page,
   whether or not that event bubbles; only a lift sent to an element that has **left** the page never reaches it
   (Safari has done this — the pinch's own comment, l.4213), and the next press, the button-less move and the
   lost-capture cancel are what heal that. T0b sends one of each (on an attached element without `bubbles`, and on a
   detached one).
10. **A click on a drawn line's end no longer re-seats it** (step 6), and the end does not move for the first 4px. If
   he used the click to attach a loose end, he now drags it. Named in 3.5 and W17.
11. **The button-less move is trusted as "he let go".** A real mouse or pen drag always carries its button; a test
   harness may not (§4, "must stay green"). A browser that sent a held mouse's move with `buttons` 0 would end the
   drag early, put down where it was — the Reorder rows have run on the same test since they were built.
12. **A lift the page missed has two outcomes by design** — put down when his hand shows it (the next move or press),
   put back when only the browser's lost capture does. On a device that sends both for one event, whichever arrives
   first decides. An iPhone look.

## 7. Size

`tracker/app/core.js` — about 40 functions touched (the seven kinds and the canvas's capture listener, `cancelGestures`,
`holdFirstFinger`, `takeBackFirstFinger`, `enablePinchZoom` (the one function that forgets its count), `renderBoard`,
`pushUndo`, `doUndo`, `doRedo`, `persistSyl`, `leaveFlowEdits`, `setTool`, `toggleArrange`, `loadCourseNow`,
`openSylHere`, `switchSyllabus`, `switchSylNow`, Delete syllabus, Revert, Import's `applyCharts`, `emptyForMove`,
`trkStore.restore`, `trkWriteRecords`, `clearDirty`, `connectClick`, `applyEndSnap`, `followEdge`, `wirePageOnce`,
`landIfOwed`), about 270 lines in and 115 out (the kinds lose their lift and cancel listeners); `tracker/App.jsx` —
two effects. Two new test files (about 850 lines of unit tests, one small Playwright spec), two documents; possibly
one line in each of up to four older test harnesses (`buttons: 1`, §4 — named to him if so).

One builder: the tests, step by step, 8 h; step 1, 6 h (the owner hears the lift); step 2, 5 h (three doors, the
missed lift); steps 3–4, 4 h; steps 5–7, 3 h; the unit suite, the Playwright specs and the Tracker smoke between
steps, 2–3 h — **about 29 hours**, before the reads. The walk: about 5½ hours at two widths, mouse and finger, the
script's incoming records for W14 and its bare clicks for W13. (The first draft said 12 and 3; round 1's revision, 22
and 4; round 2's, 27 and 5.)

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

## 10. The red team, round 3 (24 Nov 26) — folded, no further round

Reports: `docs/superpowers/briefs/2026-11-24-trk-press-reshape-read3-{astra,opus,fable}.md`. No reader asked for
another shape; Astra asked for four corrections before a build, Opus and Fable found nothing that should stop one.
Each finding was opened in the code before a verdict; duplicates are one row. A = Astra, O = Opus, F = Fable, with the
reader's own number. None was judged false; three are accepted in part. This was the last round (his cap of about
three): what follows is folded into §3–§7, and the build's code reads check it.

| Finding | Readers | Verdict | Where the plan now answers it |
|---|---|---|---|
| A lost lift is not healed when the next press is the **same pointer** — a mouse always is, a touch number can be reused: the door looked only for "a pointer other than the held one". A mouse's handle then sticks to the pointer, redraws wait, and the next click's own lift re-seats the handle under the toolbar | A 2 (HIGH), O 1 (MEDIUM), F 2 (MEDIUM) | accepted **[code: every kind's move listener asks only `pointerId` — l.3847 — never the button; the Reorder rows do ask, `Modals.jsx` l.439, l.490; `core.js` has no `contextmenu` listener]**. One rule for a missed lift: his hand shows it (a button-less move, any fresh press) → LAND at the last point seen with the button down; only the browser's lost capture shows it → CANCEL, because that says nothing of his hand | 3.2 (the owner's move listener; `lostpointercapture` of the ball itself only); 3.3 (the rows "a lift the page missed" and "any press"); step 2's "a lost lift"; W13; risks 11, 12 |
| A "click" with no key or press before it (voice control, a screen reader) passes every door: Select all under a held box is overwritten at the box's lift, and under a group drag the next move throws | A 1 (HIGH) | accepted **[code: `selectAllClick` l.6830 changes the selection and pushes nothing, so no belt sees it; `moveGroup` l.4644 reads `groupDrag.start[bid]` with no test for a ball that was not selected at the press]**. Not reachable by mouse, finger or keyboard — each sends a key or press first | 3.1; 3.3 (the click door, on `window`, capture, acting only while a press is held); step 2's "a click with nothing before it"; W13 |
| The press swallowed on the chart is counted by the pinch all the same; risk 8 said the opposite | A 3 (MEDIUM), O 2, F (note to §9) | accepted **[code: the pinch's `pointerdown` listener is a capture listener on the board, l.4208 with l.3932, above the canvas whose capture listener was to drop the press]**. Of the two fixes, **stopped at the window**: one place decides, and nothing below hears a press that is to do nothing. The pinch is told to forget its count, or the lost finger's stale count would pair with the next finger | 3.3 ("any press"); 3.2 (Deleted); step 2's mouse-and-finger test; risk 8 |
| T0 called "protection, green today" what fails today, and step 1 "no change of behaviour" | A 4 (MEDIUM), O 3 | accepted **[code: the ball's, the group's and the box's lift listeners are on the element — l.4658, l.4628, l.4621]** | step 1 (T0a protection, T0b failing-first; the two behaviours it does change, named) |
| Import's replace of the chart on screen waits on the store with the chart's identity unchanged: a ball let go in that wait stores the old layout over the imported one | F 1 (MEDIUM, slow store) | accepted **[code: `applyCharts` l.7151 stores the layout, then five more waits before `loadCourse` at l.7200]**. Not reachable while the store answers at once; today's code has it too | 3.4 (`chartBusy`); step 3; W18; §6 |
| A finger's own lift: the owner hears it before the pinch's `drop`, so the lift's save parks on the hold and is made only if `drop` hears the same lift | F 3, O (noted as benign) | accepted **[code: `saveLayout` l.1277; `drop` l.4260 is on the board, below the window]** | 3.2 step 4 (the hold released before every landing, `refused` read from before it); T0b |
| The press's step must carry the events too, or Undo throws | F 4, O 6 | accepted **[code: `pushUndo` l.3324 pushes `{ syl, lay }`; `applyHistData` l.3375 parses both]** | 3.2 (`pressBegin`'s note, `pressChanged`); T0a's Undo and Redo |
| A redraw that waited is paid inside exits that asked for none (sign-out; the middle of `trkWriteRecords`); a `commit` that throws | F 5 | accepted | 3.2 steps 6 and 7 (the debt stays for the caller's redraw; `finally`); step 3's last test |
| `trkWriteRecords` re-points `course` before the place `chartGoing` was put | O 7 | accepted in part **[code: l.902–904]**: `chartGoing` is added before `course` is re-pointed (the condition is already worked out one line above). `customDefs`, re-read before any branch, is left — no press reads it and it is no part of the chart's identity | 3.4; step 3 |
| Risk 9: a lift that does not bubble **is** heard by a capture listener on `window` if its element is on the page; only a detached element's is not | A 4, O | accepted (how the browser dispatches; nothing in the code says otherwise) | risk 9; T0b |
| Test wording: a `keydown` activates nothing in the test browser; the harness binds no Undo key; T4 (a) cannot pass as written; two unmarked protections; a press left held between cases | F 6, O 4, O 5 | accepted **[code: `handleUndoKey` is bound in `App.jsx` l.141 only; `applyHistData` marks the chart unsaved]** | §5's opening; step 3; step 4; step 5; §4 "must stay green" |
| A native dropdown may still open after a landing the app could not save | F 7 | accepted as a note **[not checked in a browser]** — no data at risk | risk 8; the iPhone looks |
| A still click on a **link's** end still re-seats it, with a step that takes back nothing | O (caveat) | accepted as found-not-fixed **[code: `applyEndSnap` l.3265, its same-ball branch]** — `trk-refusals` relies on it running | §6 "not changed" |
| A finger's tap on a drawn line's end carries a pixel of movement and would count as a drag | O (caveat), F (W17) | accepted, by a **4px** measure for that kind only — the Reorder rows' own. Without it, "a mere click changes nothing" would hold for a mouse and not for his phone | 3.5 "Decided here"; step 6 and T5; W17; risk 10 |
| A finger's drag may get a `lostpointercapture` as it begins (the capture moving from the touched shape to the ball), which would cancel every such drag | F (iPhone look) | accepted in part: the owner heeds only the ball's own lost capture, not one bubbling from inside it. Whether iOS sends any other is a look | 3.2; T0b; the iPhone looks |
| Q3 must name the selection box disappearing on any key, and the full list of keys that do not put a ball down | F ("Decided here" 1), A (§9 row 10) | accepted | Q3; 3.5 "Decided here" |
| "Must stay green, unchanged" is unproven where a test leaves a press held between cases | F 6 | accepted — and the round's own fix adds a second such case: a harness whose mouse moves carry no `buttons` **[code: grep of `src/tracker/*.test.tsx`]** | §4 (reported by name, never edited to pass); risk 11; §7 |

**What no plan read could check — for the build's code reads and the walk**

1. The suite itself: nothing in §4's "must stay green" list has been run against this shape. The two named ways a
   green test could turn red (a press left held between cases; a mouse move with no `buttons`) are looked for first.
2. Every caller that asks `pressEnd` for no redraw does redraw afterwards, so a debt left by step 6 is always paid —
   `follow`, `leaveSquadron`, the two questions' Save / Discard, each `chartGoing` site. Sign-out is the one that
   draws nothing, by design.
3. The door's reach into the pinch: that forgetting the count mid-press cannot leave a pinch half-begun (`start`,
   `pinching`), and that the swallowed finger's lift really is ignored.
4. That every kind's `commit` reads its own record and nothing else — no pick, no `drag` / `groupDrag` / `marquee`,
   no tool — and that every one of the seven calls `pressBegin` (plain JavaScript: only T0 says so).
5. That `chartBusy` is lowered on every way out of each operation, a throw included, and that no eighth operation
   re-points the chart across a wait (Import was the seventh, found in round 3).
6. On his iPhone, which no test browser shows: a second finger's tap on a button while the first holds a ball; the
   pickers and the file picker under a held finger; whether iOS cancels the first touch when a second lands; a call
   coming in; a ball at the left edge or the bottom bar, or held still; a thumb resting off the chart; a lost
   capture as a drag begins, or at a lift; a tap on a drawn line's end under the 4px measure; a native picker after
   a refused landing.
7. A real mouse's missed lift (W13, by hand): that the browser does send button-less moves after the right button's
   menu closes, and what the handle does until it does.
8. Real two-tab delivery (W14) — at the database step, with the slow-store tests of step 3 run again against the real
   store.
