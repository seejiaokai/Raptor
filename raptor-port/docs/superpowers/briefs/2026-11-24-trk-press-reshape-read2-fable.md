# The Tracker press reshape — round 2, the fresh Fable reader (blind; chat 166, 24 Nov 26)

Brief: `2026-11-24-trk-press-reshape-read-brief.md`, the same as round 1, told the plan was revised (§3–§7, §8).
Saved verbatim from the helper's hand-back by the host. (The three round-1 report files were left in the readers' copy as
one-line placeholders; the reader says it opened none.)

---

**Copy read: C:/rc166, export of claude/msq-b1-screens-135 at 12dd76c58. Round 2, read-only; nothing changed, nothing run.**

Housekeeping: I opened no handoff file. The three round-1 reports (`…trk-press-reshape-read-{astra,opus,fable}.md`) are still present in the briefs folder, not removed; I did not open them. I did not read the rulings pages whole (only D134's line in `decisions/tracker.md`); the fix-list and first fix-read history I did not open. Code read: `core.js` around every function the brief names, `App.jsx`, `TrackerPage.tsx` l.160–186, the three press test files.

## Verdict

No HIGH found. The revised shape (input doors + waiting redraw + `chartGoing` + identity check kept) closes faults 1–5 as traced, and I found no path that writes one squadron's or chart's layout into another. Seven gaps remain, two MEDIUM. All are fixable in the plan text.

## Findings

**1. MEDIUM — a press whose lift is never heard now freezes the board.**
- Failure: on the phone a finger's ball press loses its lift (the code's own comments record Safari doing this). He then touches empty canvas (Move tool: a pan) or uses Connect / Line. Nothing ends the stuck press: the door skips a finger on the chart, and `pressBegin`'s belt only runs when the new touch starts a press kind. Because "a redraw asked for while a press is held waits", every redraw from then on is deferred — Connect's first-ball ring, a selected line, another person's marks — until he touches off the chart or a ball. Today the leaked press is invisible.
- Cause: 3.3's wait rule plus row 16's healing only "at the next press".
- Fix: (a) the door also ends a held finger press on any primary touch `pointerdown` (`e.isPrimary` — the test `enablePinchZoom` l.4217 already trusts); (b) better, the owner itself listens on `window`, capture, for `pointerup` / `pointercancel` of `held.pid`, so a lift is never lost to an element. Add a T2 case: finger press, lift never sent, primary touch on empty canvas, then `connectClick` — the ring is drawn.

**2. MEDIUM — the pointer door does not hear a second mouse button, so 3.1's "no place for a door driven by his hand to forget" is overstated and W13's mouse column cannot be walked.**
- Failure: with the left button held on a ball, a right, middle or back-button press fires no `pointerdown` (browsers send extra buttons as `pointermove`). The same for any click with no pointer event (voice control, a screen reader's activate). The press LIVES. Harm is small because `commit` is self-contained, but a tool change or Done editing reached that way redraws nothing until the lift: he presses Done and still sees the editor.
- W13 "a second press on the chart puts the first down" and T2 "a second mouse press on another ball" are only reachable with a second device or after a lost lift.
- Fix: add `mousedown` (fires per button) to the door, or say plainly that the mouse case is a synthetic-test and touch-beside-mouse case and re-word W13. Add LAND belts to `setTool` and `toggleArrange` (two lines), since those are the two whose redraw would otherwise wait.

**3. LOW-MEDIUM — the "refused landing stops Undo" guard is unreachable from the door.**
- Failure: add B, drag A, Ctrl+Z, the landing's save refused. The door lands; `saveLayout` → `dropRefusedStep` removes A's step. Then `doUndo`'s belt finds nothing held, so it cannot know a landing was just refused, and `step` pops B: two changes gone. What prevents it today is only that `trkRefused` raises its alert and `handleUndoKey` returns on `dlg` — not true when `refusedBox` is already up or `refusedQuiet` is set, and unproven for a press on ↶.
- Cause: 3.3's belt row puts the guard in `doUndo` / `doRedo`, but the door has already consumed the press.
- Fix: the door compares `TRK_REFUSED_N` across `pressEnd`; if it rose, it swallows the key or press (and its click). T1's refused case must go through a real `keydown`, with `refusedQuiet` on.

**4. LOW — a cancelled press's step can come back through `trkStore.restore`.**
- Failure: ball held and moved (step S on the list); a command with no hand that enlisted the store is refused. `capture` (l.740) copied the list with S in it. `restore` → `chartGoing` removes S, then l.749 lays `snap.undo` back: S returns, a step that takes back nothing, and its Undo lights ✓ Save changes (`applyHistData` → `markDirty`).
- Fix: `chartGoing` returns the dead press's step; `restore` filters it from both restored lists. T7's refused-command case asserts the step count.

**5. LOW — a seventh identity change has no `chartGoing`.** Delete syllabus sets `plan = f.plan` (l.6656) after `await planSylSweep`, which changes `curSylId()`. A press begun during that wait is stopped only by the identity check (it is — I traced it dead). Revert's `await sweepChart` is the same window. Fix: raise `chartBusy` across Delete syllabus's and Revert's waits; add both to risk 4's list.

**6. LOW — unsaid details the builder will have to guess.**
- The swallow flag for "the click that follows" needs an end: clear it at that pointer's `pointerup` / `pointercancel` plus one task, or a press dragged away (no click) eats his next real click. Risk 8 leaves it unchecked.
- `cancelGestures()` now redraws inside `pressEnd('cancel')`. Row 12 (sign-out "no redraw") and `leaveSquadron` therefore change; harmless as far as I read, but 3.3 says "unchanged". State its return value too: `follow` reads `hadPress`.
- `fingerStop` is neither deleted nor redefined; with `held.finger` it is redundant. Say which.
- A key already auto-repeating when the press begins lands or cancels it at once. Except `e.repeat`.
- The door is wired in `wirePageOnce`, before `enablePinchZoom`'s l.4264 listener; the plan's "hold ended first" inside `pressEnd` covers the order — keep that sentence.

**7. LOW — T0's "a mouse-held ball under a two-finger zoom carries on" contradicts `pressBegin`'s belt** when the first finger lands on a ball: `startDrag` → `pressBegin` → "that one is landed first". Say the finger's `pressBegin` under a mouse press simply answers null without landing, or accept the landing and re-word T0.

## Whether each §8 verdict holds

Checked in the code and holding:
- `pushUndo` builds its entry before the push;
- `loadCourseNow` l.2255 / 2271–2272 and `openSylHere` l.2397;
- `cancelGestures` l.4028's three clears; five callers (l.100, 137, 150, 208, 280);
- `saveLayout` l.1277; `endDrag`'s `if (!drag) return`;
- `clearDirty` l.6332; `applyEndSnap` reading `selEdge`;
- `loading` with no `finally`;
- the no-hand redraws (`trkWriteRecords` l.947, `leaveRunningCourses` l.5880, `restore` l.765);
- `fingerStop` set for a finger only;
- the one FALSE verdict: `TrackerPage.tsx` l.184 does send `resize` on show, and `refitArrange` re-cuts the canvas.

Holding only in part:
- "Undo with a refused landing takes two → `doUndo` stops" — true for the belt only (finding 3).
- "Landing the old press redraws under the new → swallowed" — true for a mouse; a finger on the chart goes through `pressBegin`'s belt instead (findings 1, 7).
- "A redraw can no longer end a press" — true, and it is what creates finding 1.

The rest I accept from the plan text without separate proof.

## Statements about today's code

- Fault 5 is true: `L` is the live object in `layout.__lines` (`LINES()` l.2840, `lineById`); `.lvert` pushes after `shape` has changed `L.pts`; `.lend` sets `L[key] = null` at pointerdown and pushes after.
- Rows 2, 3, 7, 8, 13 match the code.
- "Every existing test stays green": I traced `msq-night-press-undo` (seven unmoved presses, direct `doUndo`), `press-held` and `gestures` l.245–255 — each holds. No existing Tracker test sends a `keydown` under a held press. Not checked: `tracker.test`, `trk-pinch-edges`, the smoke and the Playwright specs for two `pointerdown`s without a lift between.

## Explicit negatives

- No move handler calls `renderBoard` (`schedDragPaint`, `refreshLine`, `applyView` only), nor does the edge pan, the wheel zoom or the resize refit. A waiting redraw does not freeze a live drag.
- No timer changes the chart (the hint timer only notifies).
- I listed every assignment to `SYL`, `layout`, `course`, `plan`, `plan.sylId` and both lists. Apart from finding 5, each sits inside one of the six `chartGoing` functions or behind a by-hand door or belt.
- `leaveRunningCoursesNow`'s list filter (l.5868) is safe with removal by identity.
- The build order: no step is built on a later one; T7 fails after step 2 for the right reason (same course and chart, generation not yet bumped); T4(b) fails today.
- The Export lead is not made worse.

## Visible changes the three questions miss

- A press right after ✓ Save changes, or during a load, does nothing (`chartBusy`). Instant today; a dead tap at the database step. File it.
- After a lost lift, the next tap on the chart does nothing but put the ball down.
- Alt+Tab puts the ball back (blur), while an in-app page switch puts it down. Both are "his hand"; Q2 and Q3 should say so side by side.
- The recommended answers to Q1–Q3 match the rest of the app (Reorder lists, the handles, D134).

## A simpler cut

Let the owner hold the pointer listeners (move, up, cancel for `held.pid`, on `window`, capture); kinds supply only `move`, `commit`, `stop`. It removes lost lifts and finding 1 at the root, and deletes seven sets of add/remove pairs. Cost: step 1 grows by roughly two to three hours, and the ball's pointer capture must be re-proved on the phone.

## Looks for his iPhone

- Whether a second finger's tap on a button sends a `pointerdown` while the first holds a ball.
- Whether a lift is ever lost now that the ball is not redrawn away.
- Whether opening the Course or Syllabus picker blurs the window.
