# [TRK-PINCH-DRAGS-BALL] — scenario-design brief (23 Sep 26)

Given to Astra (Codex), read-only. Bug-check order §4 rank 1: a model that did not build the fix
designs the test scenarios, hunting for what is MISSING. Kept in the repo so a later re-test re-uses it.

---

You are designing the test scenarios for a small fix in the **Tracker** tab of this app. You did not
build it. **Read-only: edit nothing, run nothing.** Another agent will execute your scenarios in the
real running app with real two-finger touch input (Chromium's own touch events, the same pointer
events a phone sends) at phone, sideways-phone and tablet sizes, and photograph each one. Your job is
to decide what that walk must cover — above all, what is MISSING.

## The bug being fixed

In the Tracker, a syllabus flow chart can be edited: Syllabus ✎ → "✎ Edit chart layout". That mode
has a tool strip (Move, Select, Connect, Delete, + Flight / + Acad / …, Text, Line, Edit lines, Arrow,
Merge, Unmerge, Select all, Font, Fit, Reset layout, Edit events) and a canvas you can pan with one
finger and zoom with a two-finger pinch.

**Found on 23 Sep 26 while walking an earlier pinch fix:** in Edit chart layout, a pinch whose FIRST
finger lands ON a ball also drags that ball. The ball moves (36px on a phone), an undo step appears
(the ↶ on the bar lights), and the move saves itself (a moved ball saves the moment it lands, by
design). The person only meant to zoom.

**The intended behaviour** (as filed; the owner has not ruled beyond it): the moment a second finger
lands, whatever the first finger had started is taken back — the ball is put back where it was, no
undo step is added, nothing is saved — and the two fingers just zoom (the chart point under the
fingers stays under them; that part was fixed the same day and must not regress).

## The rulings that apply (the owner's, in the app's words)

- A moved ball saves itself the moment it lands; ✓ Save changes is for STRUCTURE edits (events,
  prerequisites, drawn lines, arrows, fonts) and a ball drag never lights it (9 Sep 26).
- ONE undo history on the bar (↶ ↷) for everyone, marks and chart edits together; undoing a chart
  step lights ✓ Save changes; both stacks clear on a course/syllabus switch, an Import, and Save
  changes (9 Sep 26).
- The pinch zooms about the fingers, in both the normal chart and Edit chart layout; fingers that
  slide while pinching carry the chart with them (23 Sep 26).
- Everyone (admin and member) has the same Tracker access (D121, 23 Sep 26) — no role to walk.

## Where to read

`raptor-port/src/tracker/app/core.js` — the board is wired in `wireBoard`; the two-finger zoom is
`enablePinchZoom`; the ball drag is `startDrag` / `onDrag` / `endDrag`; group drag, the selection box,
the Line tool, the Edit lines handles and the drawn-line squares are all wired near them; the undo
history is `pushUndo` / `applyHist` and the comment block above them. The tool strip is
`raptor-port/src/tracker/components/ArrangeTools.jsx`. The earlier pinch fix's evidence sheet is
`raptor-port/docs/handpass/2026-09-23-tracker-pinch.md` (its §3 and §4 list what that walk covered).

## The brief — use this wording as your instruction

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Concretely for this fix: the thing is "a first finger in Edit chart layout, then a second one". List
EVERY way a first finger can start something there — every tool, every kind of thing under the
finger (a ball, a selected group, empty canvas, a drawn line, a line's squares or ends, a prerequisite
arrow, the orange/blue handles, a line already half-drawn) — and for each, what a pinch that begins
that way must leave behind: the chart, the stored layout, the undo/redo lists, ✓ Save changes, the
selection, and the zoom. Include the orders: the second finger landing at once vs after the first
has moved; landing on empty canvas vs on another ball; lifting one finger and carrying on with the
other; a pinch straight after an undo (is ↷ still there?). Include what happens to the NORMAL (not
editing) chart, which shares the pinch code.

## What is NOT a finding (owner, D56, 23 Sep 26)

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

## What to hand back

1. The enumeration (every first-finger start in Edit chart layout, and in the normal chart).
2. A ranked list of scenarios, each: setup, the exact finger actions, the expected result, and the
   observation that would prove it wrong. Mark which ones you expect to FAIL on the current code, and
   why, from your reading.
3. **Explicit negatives** — "I checked X and found nothing" — for every area you looked at and
   cleared.
4. Anything in the intended behaviour above you think is wrong or under-specified, as a question.
