# The fresh, blind Opus read of the finished code — the night of 15 Oct 26 (`[DRAG-EDGE-SCROLL-ELSEWHERE]`, D896–D899)

A fresh Opus reader that did not write the code (D790), read-only, given the diff `e67e00e74..HEAD`, the roll-call and the
rules for a finding (D489, D56). Saved as it came back, before anything was done about it; the dispositions are in the
evidence sheet `docs/handpass/2026-10-15-edge-turn.md` §11.

**What it read:** the source diff and the walk script, each touched file whole around the change (`edgescroll.ts`,
`calpick.ts`, `caldrag.ts`, `caldays.ts`, the wiring and the month's step and slide in `InputsCal.tsx`; in
`tracker/app/core.js` `followEdge`, the six drag handlers, `wireBoard`, the pinch code — `enablePinchZoom`,
`takeBackFirstFinger`, `fingerStop` — `renderBoard`, `bounds`). The branch moved during the read: `5cf813bf4` (the Safari
fix, `heldOn` / `once`) landed and was read too. It fixes the most serious thing the reader had found on the Inputs side —
a turn removes the date a run started on (dates are keyed by the date), always a planning note, a bar unless the same
input lies in the same week row; Safari keeps sending a finger's events to the element it landed on, so the run or bar
would have frozen and the month turned every second. Right in principle; a Chromium walk cannot show it — his iPhone only.

## Findings, most severe first

**F1 (high) — each drag of an arrow's bend square adds more listeners, so each later edge pan runs 2×, 4×, 8×… as fast.**
Edit chart layout → ✎ Edit lines → pick an arrow → drag its blue bend square, let go → drag it again to the edge and hold:
the canvas pans at twice the speed; the third time 4×, the fifth 16×. The orange ends multiply the same way; with a pinch
`fingerStop` holds only the last copy's stop. *Cause:* the square's `up` calls `wireBoard()` (`core.js:3348`), which adds
a fresh arrow-function `pointerdown` to the same `.linehandle` / `.endhandle` elements — never redrawn (`schedDragPaint`
rewrites only `edgeLayer`); each copy's `up` calls `wireBoard` again, doubling. Before the change the copies already
pushed duplicate undo steps; now each also starts its own `edgePan`. The walk's T6 carried the square once. *Fix:*
`renderBoard()` instead of `wireBoard()` there (as `.lvert`, `.lend`, `.endhandle` already end); a walk step dragging the
same square three times, the third to the edge, pan speed as T1's, the undo count +1 a drag.

**F2 (medium) — a ball carried to the canvas's left or top edge lands at negative chart positions and disappears from the
chart outside Edit chart layout.** After ⤢ Fit (`view.x > 0`, `view.y = 8`), carry the left-most ball to the left edge and
hold ~1 s: ball x ≈ −900; drop, ✓ Done — the SVG is drawn from 0 to W only (`bounds()`, `core.js:2940`), so the ball is
clipped off the chart and ⤢ Fit cannot bring it back. The same for a line's end, a corner square or a bend dragged up or
left. The chart is his own work (D464). *Cause:* `followEdge`'s `onPan` (`core.js:3769`) — nothing limits a leftward or
upward pan. *Fix:* stop a leftward / upward pan once the chart's top-left corner reaches the canvas edge
(`view.x = dx < 0 ? Math.min(nx, Math.max(view.x, 0)) : nx`, the same for y); a walk step to the left edge after ⤢ Fit,
✓ Done, the ball still on the chart.

**F3 (medium-low) — the four handle drags heard on the window never hear a cancel, so a cancel at an edge leaves the canvas
panning and the line changing for good.** A `.lend`, `.lvert`, `.endhandle` or `.linehandle` held at an edge, then the
touch cancelled (a call, the OS): no `pointerup`, `stop` never runs, the `edgePan` loop runs on — panning ~900 px/s and,
through `move(last)`, rewriting `L.pts` / `edgeMeta[key].mid` every frame, after ✓ Done too; the next save writes it.
*Cause:* `core.js:3349, 3362, 3403, 3437` listen for `pointermove` and `pointerup` only (the ball and group drags hear
`pointercancel`). *Fix:* a `pointercancel` in each that clears `fingerStop`, stops, puts back what the drag changed
(`L.pts`/`L[key]` for `.lend`, `P0` for `.lvert`, the starting `mid` for the bend) and `renderBoard()`s — not through `up`
(a cancel's coordinates can be 0,0).

**F4 (low) — a bar dragged with a mouse and let go outside the month stays picked up, and the month turns under the free
mouse.** Drag a bar over the month's header and let go there; back over the grid with no button held the copy follows,
and resting in the side band turns the month each second; the next click drops it. *Cause:* `caldrag.ts:441` hears
`pointerup` on the grid only and a mouse has no implicit capture; `onPointerLeave` only parks the turn. The stuck lift is
older; the month turning by itself is new. *Fix:* hear the release on the window too (`onPointerUp` is `once`-wrapped;
outside the month it only clears the gesture).

## Checked and found sound
Every timer stops on every way a gesture ends (release, cancel, a new press, unmount, `drop` / `clearGesture`, the pinch's
`fingerStop` for single-copy handlers). A late turn or settle is guarded by `st !== s`; `live.current.step` is re-read at
each turn, the 1000 ms repeat giving React time to re-render. A drop in another month goes through `commitChipMove` as
any (by days, the OIL question first, the medical question, `markLand`, undo turning the month back, D672). The pan adds
no undo steps. Every handler re-run with the made-up event reads only `clientX` / `clientY` (`svgPt`). The pinch stops
ball and group drags first. The SANS calendar is not given `onTurn`. During the 240 ms slide the next repeat can come at
~840 ms instead of 1000 — harmless.

## Gaps — the roll-call and the walk
- The Tracker's ▣ Select box, "not a thing dragged": clashes with the app's precedent (the Leave War's drag selection
  scrolls at the edge; the Inputs month's run of days, a selection too, was given the turn) — MISSING, put to him.
- The empty-space pan: right, the reason "must not, because the drag is itself the pan".
- "Tracker view mode — no drags": the ⇅ Reorder window (`components/Modals.jsx:358`) has draggable rows in a scrolling box
  (52vh), both modes, not on the roll-call; on a phone they cannot be dragged at all (the ▲▼ buttons remain).
- Missing row: the people picker (`PeoplePick.tsx:151`, D685) — a drag across faces in a scrolling list; no edge scroll.
- The SANS calendar gets no turn, but `5cf813bf4` changed how its tap, pick and swipe events are delivered — walk those.
- The walk's 60/60 predates `5cf813bf4` (the host's note: it was walked again on `5cf813bf4`'s build, 60/60, before this
  read came back); the Safari case needs his iPhone; not walked: the same square dragged twice (F1), a carry left or up
  then ✓ Done (F2), a second finger during an edge pan, a mouse released off the month mid-carry (F4), a run carried
  across December into January.

## Seen in passing, not caused by this change
`endDrag` (`core.js:3889`) also calls `wireBoard()` after every ball move: another `wheel` listener on the canvas each time,
so after n ball moves one wheel step zooms n+1 times. The same `renderBoard()` swap fixes it, or `wireBoard` could mark
what it has wired.
