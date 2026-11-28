# Fresh, blind Opus code read — the end-time guard's three rulings (D2860, D2861, D2862)

Read: change.diff whole; build/raptor-port/src engine/timegaps.ts, ui/timegap-paint.ts, state/timeguard.ts, the Legend
in ui/html.ts and ui/Shell.tsx, the outline CSS (04-pucks-sections.css), engine/rowids.ts (rowsOf, ensureRowIds),
the week's and the board's time-box builders (html.ts plRow / ted / the formation cell; board.ts / board-html.ts
data-bfld inputs), every caller of dayTimeGaps / timeGapsOf / TIME_RED / carryTimeRed, the publish and sign refusals
(sched-commit.ts, oilsign.ts, interactions.ts), the duty and wave templates (dutytpl.ts, wavetpl.ts), overlay.ts
requestRowFields / landedRid, and the full rows of D2860, D2861, D2862, D2852, D2853, D2854, D2612. No test was run
(the copy is read-only and the runner writes caches). Other readers' briefs and the walk sheet were not opened.

## Result: no confirmed defect

I found no case where the screen or a refusal does the wrong thing against the three rulings. What I checked, and why
each holds:

### D2862 — any time typed asks for the other (engine/timegaps.ts line 61)
- The new branch sits behind `someone` false and fires only when the END holds a clock time and the START is empty
  (blank or "TBD"). A word in either box is neither (R2 unchanged, now pinned by a live test). Someone on the row is
  unchanged (both boxes already counted).
- Every exclusion runs BEFORE `item()`, so the end-only rule never reaches: an All-day input row (allhands and ground),
  a kept input row whose input is gone (R9), a cancelled or information-only row, a line whose every aircraft is
  cancelled (R7), the AMT block's BRIEF / DEBRIEF while nobody is on them. OFT rows labelled BRIEF are counted, as
  they were for start-only — not new.
- Every key the engine can now add (`ap…str`, `ff…to`, `dr…str`, `sr…str`, `gr…str`) has a typeable box on both
  surfaces: week (`ted(`ap:…str`)`, `ted(fp+'.to')`, plRow's `.str` for duty, sim and ground rows) and board
  (`data-bfld="${fp}.to"`, the `atm` str inputs). So nothing is counted that cannot be outlined, and the count-line
  tap (gapBoxesIn, engine order) still finds every box.
- Nothing in the app writes an end with an empty start by itself: no `str = ''` / `to = ''` writer exists; the
  built-in duty templates (Standard, SC Shift, AVALON) have both times or neither; wave templates start empty; input
  rows always carry their lead person (`who: leadOf(inp)`), so they were already counted both ways. The demo weeks are
  pinned clean by timegaps-demo.test.ts. A row already stored with only an end, on a day issued before this rule, now
  blocks that day's next Publish AL — data already stored, so not a finding (D56).
- Every other reader of the count (the greyed Publish day, the sign-off lock, the "N items missing a time" count line,
  the refusal words and the OIL backstop) reads the same function, so they move together. No warning, OIL or crew-rest
  code reads it.

### D2861 — red at once while the day shows red (ui/timegap-paint.ts line 103)
- Order within the memo is right: the prune runs first (a box typed leaves; a row still on the day but no longer
  missing leaves), then the spread, then the empty-set delete. So "shows red" means a box missing NOW whose name is red.
- A deleted row's kept name (row not on the day) never triggers the spread: `names` holds only boxes on the day.
- Emptied and refilled: the refill prunes the name; emptied again while another box is red, it is red again; emptied
  again after the last red box was typed, the set was deleted, so it is grey — what the ruling says.
- Undo: Undo of a typing while another box is red gives red (correct); Undo of the last typing gives grey (the ruling's
  "grey for next time"). Undo of a delete brings back a kept red name and spreads to boxes still empty — the LIFO
  order of Undo means those boxes were empty, and red, at that earlier moment too, so the day returns to how it looked.
- Plans: every key carries the plan id (`curDraftId`), so a plan's spread never reaches another plan; parked plans keep
  row ids but not keys; carryTimeRed copies the set including spread names, which is what the moved name should carry.
  A plan preview on the board is `.preview`, never painted, so the spread never runs off a preview.
- Days and squadrons: the key is squadron | date | plan; the test for Friday confirms another day stays grey.
- Board and week painting the same day share one memo entry, so the spread runs once per paint and both surfaces read
  the same set. A board panel is typeable or not as a whole (`ro` is the panel's), so there is no case where a red box
  is hidden on screen while the spread treats the day as "showing red".
- Sort, drag within a block, duplicate a wave: names follow row ids; a duplicated wave's rows briefly share ids until
  re-minted, and with the spread a copy's empty box on a red day is red anyway — which the ruling (a new row's box)
  wants.

### D2860 — the Legend line
- Added only to `#eLegend` (Edit Schedule, admin-only page); `#vLegend` still renders `legendHTML()` alone, and both
  sections are always in the page, so the View-only test is not vacuous. The reference-pinned `legendHTML()` is
  untouched. The two boxes use the same colours as the real outline (`--ink-3`, `--hard`).

## Considered, not findings (for the host to weigh)

1. Kept red names outlive "back to grey" (pre-existing, made a little wider). When the last red box leaves because its
   row was deleted, the day goes grey but the row's name is kept for Undo. If the row ever came back by a path other
   than Undo while other boxes stood empty, it would come back red AND now spread red to them, though the day had gone
   grey "for next time". I found no such path: rows cannot be dragged across days, a version brought back has its times
   (it was published), and Undo is in order. The one place a row id is recreated by rule is an input's row
   (`'r' + input id`, overlay.ts landedRid) when its input returns to the day; I could not build a case where that row
   was red, left, and came back without Undo. If the host finds one, the fix is to drop the whole set (kept names too)
   in the paint step when no box on the day is red: `if (![...names].some(n => red.has(n))) { TIME_RED.delete(k) }`
   after the prune. Test to add if a path exists: refuse Thursday with one red row X; move X's input to Friday; empty
   another box B on Thursday (grey); move the input back — expect B grey.
2. The spread happens only when the day is painted. Two changes made while the day is off screen (for example two
   Undos from another page) are judged together at the next paint, so their order is lost: a box emptied while red, and
   the red box typed after it, both off screen, come back grey. Every edit of a time box is made on a screen that
   paints the day, so I could not reach this with a scheduler's presses; noted only.

## Tidiness note (filed, not fixed)
- ui/html.ts `timeLegendHTML()`: the two boxes restate the outline's look in inline styles (`var(--ink-3)`,
  `var(--hard)`, the 4px corner, 1px inset) that 04-pucks-sections.css already holds for `.tg-miss` / `.tg-red`; if
  the outline's colour changes, the Legend drifts. A small `.tg-leg` / `.tg-leg.red` rule beside the outline's would
  keep one source.
- ui/timegap-paint.ts header lines 20–21 run well past the file's line width after the rewording; rewrap.
- engine/timegaps.test.ts: the new flying-line end-only test sits under `describe('a Common Programme row')`; it
  belongs under the flying-line block.
- engine/timegaps.ts header: "pinned by a skipped test" for R2 now sits beside a live R2 test as well; the wording could
  say both.
