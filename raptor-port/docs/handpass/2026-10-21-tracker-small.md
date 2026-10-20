# Evidence sheet — the Tracker small fixes (`[TRK-PINCH-OLD-EDGES]`, `[TRK-REFUSALS-UNTESTED]`), 21 Oct 26

Branch `claude/tracker-small-1021`, one bug check for both (D994 — small fixes needing no answer or look from him; the
night of 21 Oct 26, "Low", D1104). Built by an Opus 5.5 helper of the night's coordinating chat (D1103); walked by ONE
Sonnet 5.5 walker (D787); read by ONE fresh, blind Opus reader (D790, D903). Pictures
`docs/img/handpass/2026-10-21-tracker-small/`; the walk's results `docs/handpass/parts/trk-small/`.

## Questions waiting for him

None.

## What changed

1. **`[TRK-PINCH-OLD-EDGES]`** (the chart's pinch, `src/tracker/app/core.js` `enablePinchZoom`):
   - **Edit chart layout switched on (or off) while two fingers are down** — a third finger on ✎ Edit chart layout — made
     every later move of the pinch throw (its start was taken for the other mode). Now the pinch remembers the mode it began
     in; once the mode has changed under it, it does nothing more: its moves are passed over, its lift settles nothing, and
     the zoom the switch set stands (even if the mode is switched back before the lift).
   - **A pinch ended by a lift lost to a redraw** (found at the next first finger) settled its zoom but left the zoom's
     % label showing the old figure, and did not mark the zoom as his — so the next redraw on a phone fitted the chart to
     the phone's width again, throwing his pinch away. It now ends the same way as an ordinary lift (one shared end).
   - Untouched (his rulings): the pinch take-back in Edit chart layout (D134); the pinch as a picture, laid out sharp at
     the lift, the spot under the fingers kept (D992).
2. **`[TRK-REFUSALS-UNTESTED]`** — tests only, no app change: the chart editor's refusals now each have a unit test
   (`src/tracker/trk-refusals.test.tsx`). A colon in a course name was already pinned (`tracker.test.tsx`, "colon
   relaxation (§8)").

## The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — a zoom moves no mark, date or credit; the refusals change nothing. |
| 2 | The published record | NO — the Tracker has none. |
| 3 | Saved data | NO — the zoom is not saved; the refusal tests add no code. |
| 4 | A shared drawer | NO — the pinch's end is one routine on one board (the chart's); the % label is drawn in one place (the zoom bar under the chart). |
| 5 | A new gesture or mode | YES — how an existing gesture (the pinch) ends: across a mode switch, and on a lost lift. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — the Tracker reads no role here (D121; the flex settings' gate, D1014, is not touched). |
| 8 | The warning list | NO. |

**Tier: WALK** (question 5), with the fresh Opus code read (D790). `[TRK-REFUSALS-UNTESTED]` alone would be NONE (tests
only); its words are looked at on screen in the same walk, cheaply, to tie each test's words to the screen's.

## The rulings swept

D134 (the pinch take-back stays as built; the finger left down after a pinch does nothing until it lifts) · D992 (the
pinch is a picture while the fingers move, laid out sharp at the lift, the spot under the fingers kept; Edit chart layout
pans as it does) · D989 (two fingers stop a glide; Edit chart layout untouched) · D158 (the test browser's
tap-after-drag quirk is not a finding) · D121 (no role in the Tracker) · D373 (a phone on its side folds Edit chart
layout's tools) · D56 (a problem only in stored demo data is not a finding).

## The roll-call — every place the pinch ends, and every place its zoom is shown

| Place | The ordinary lift | A lift lost to a redraw (the next first finger) | The mode switched under a pinch | What shares the pixels / shows the zoom |
|---|---|---|---|---|
| The chart, Flow tab, phone 390 × 844 | YES — P1 (the ball 0.5px from the fingers; 40% → 103%), P2 (Info → Flow keeps it), P5's fresh pinch, P7 (D134) | YES — P6 (synthetic, §7.9): 40% → 80%, the label right, the stretch gone; kept through Info → Flow and a marking pop-up opened and closed | YES — P5 (switched OFF under a pinch begun in Edit): 32 moves and the lift changed nothing (63% throughout) | the ✎ menu open over the chart's top left during P4/P5 — the pinch placed clear of it; the marking pop-up (P6) |
| The chart, Flow tab, desktop 1400 × 900 with touch (a touch-screen laptop) | YES — D1 (0.1px; 100% → 257%) | YES — D3 (synthetic): 100% → 200%, kept through a resize to phone width and back and a marking pop-up | YES, the same code as P5 — not walked again, because the switch-off path has no size-dependent step; the switch-on at this size is D2 | the right-hand Info panel beside the chart (untouched) |
| Edit chart layout's canvas, phone | YES — P3 (the canvas point 2.9px from the fingers), P4's fresh pinch (0.4 → 1.2) | MUST NOT need it, because the canvas's zoom has no label and is never re-fitted — the shared end runs only the canvas's own redraw there (unit-tested, not walked) | YES — P4 (switched ON under a pinch): 16 moves and the lift left the canvas exactly as the switch set it | the tool strip above the canvas |
| Edit chart layout's canvas, desktop with touch | YES — D2's fresh pinch (1.0 → 3.0, the cap) | as the phone row | YES — D2: the canvas unchanged by the moves and the lift | the tool strip |
| The zoom bar's % label (under the chart) | YES — equals the chart's zoom after every ordinary pinch (P1, D1, P5) and after leaving Edit (P3, P4, D2) | YES — the fix: P6 80%, D3 200% (it used to keep the old figure) | YES — unchanged across P5's switch, moves and lift | hidden in Edit chart layout (as built) |
| The Info half's own zoom | MUST NOT — the pinch is wired to the chart's board only; the Info half has its own − / + (unchanged) | MUST NOT, the same | MUST NOT, the same | — |
| A mouse (desktop, no touch) | MUST NOT — a mouse never pinches; the pinch passes mouse presses over (unchanged) | MUST NOT | MUST NOT | — |

## The five sizing lines (§7.0, `docs/walk-ledger.md`)

1. **The type of change:** C — a fix to how an existing gesture ends (the pinch), in both of the chart's modes. The refusal
   tests are no change to the app (no type).
2. **What only a walk could find here:** that real fingers through the browser still pinch in both modes at both widths
   after the end was rewritten; that switching Edit chart layout by its real button while two fingers are down leaves no
   page error and a working canvas, and the next pinch works; that the % label under the chart shows the zoom a pinch
   reached when its lift was lost, and that a redraw (Info → Flow, a mark) keeps it; the refusals' words on screen. The
   unit tests (`trk-pinch-edges.test.tsx`, jsdom, no layout) cover the order of events and the figures; they cannot
   show the canvas, the label in place, or real touch.
3. **What the ledger says:** three Tracker pinch walks (23 Sep 26 `trk-pinch.mjs` — the fault he reported plus 3 older
   filed; 23–24 Sep 26 `trk-pinch-ball.mjs`, FULL — 1 of its own; 18 Oct 26 `[TRK-CHART-FPS]` — 0 faults, 3 of the
   script's own, 8 break tests). Type C walks find faults when the gesture's states are driven for real; a lost lift
   cannot be made in Chromium (it retargets lifts to the board), so it is a synthetic step (the order's §7.9).
4. **The walk chosen:** ONE Sonnet 5.5 walker on the built app (port 4294), scripted real two-finger touch over CDP
   (worked example `scripts/handpass/trk-pinch.mjs`), phone 390 × 844 and desktop 1400 × 900 with touch; about twelve
   scenarios: the ordinary pinch in both modes (regression), the mode switched under a pinch (on, and off), the lost-lift
   end (synthetic per §7.9) then a redraw by real controls, the finger left down after a pinch (D134), and three refusals
   on screen (→ Connect "That link already exists.", the Edit poke-ball box's "No such event", "Keep at least one
   course."). A phone on its side is not walked: nothing in the change reads the screen's shape. Carried by tests:
   the rest of the refusals (`trk-refusals.test.tsx` — the engine's own functions and real click / pointer events in
   jsdom; each asserts the words and that the chart, the save mark and the undo list are unchanged).
5. **After the walk:** its row in `docs/walk-ledger.md` — below.

## The walk

ONE Sonnet 5.5 walker, `scripts/handpass/trk-small-walk.mjs` (`trk-small-walk v5`), on the built app at port 4294 (the
served page named the checkout's own bundle). Its full report, with every measured number:
`docs/handpass/parts/trk-small/walk-report.md`; results `docs/handpass/parts/trk-small/trk-small-walk.json`; 54 pictures in
`docs/img/handpass/2026-10-21-tracker-small/walk/`. The host opened P4-4, P6-2 and R3-2 and they match the readings.

**13 PASS, 0 FAIL**, no page, console or network error in any scenario:

| Scenario | Result |
|---|---|
| P1 phone, ordinary pinch on a ball | PASS — the ball 0.5px from the fingers' end; 40% → 103%, the label = the zoom |
| P2 phone, Info → Flow straight after | PASS — 103% kept, not re-fitted |
| P3 phone, Edit chart layout, pinch on empty canvas | PASS — the canvas point 2.9px from the fingers |
| P4 phone, Edit chart layout switched ON under a pinch | PASS — the canvas identical after the switch, 16 moves and the lift; a fresh pinch zooms it; ✓ Done editing chart: label = zoom |
| P5 phone, switched OFF under a pinch begun in Edit | PASS — 63% throughout the switch, 32 moves and the lift; a fresh ordinary pinch works (0.2px) |
| P6 phone, the lost lift (synthetic, §7.9) | PASS — 40% → 80%, the label right, the stretch gone; kept through Info → Flow and a pop-up opened and closed |
| P7 phone, D134: one finger lifted, the other moved 150px | PASS — the chart did not scroll and nothing opened; a next ordinary drag did scroll (the control) |
| D1 desktop with touch, as P1 | PASS — 0.1px; 100% → 257% |
| D2 desktop with touch, as P4 | PASS |
| D3 desktop with touch, as P6 | PASS — 100% → 200%, kept through a resize to phone width and back (this size has no Info / Flow tabs) and a pop-up |
| R1 → Connect on a pair already joined | PASS — "That link already exists."; lines, ✓ Save changes and Undo unchanged |
| R2 Edit poke-ball box, NOSUCH in its links | PASS — "No such event: NOSUCH", the box stays open |
| R3 Delete course with one course | PASS — "Keep at least one course."; the course still there |

**How the press under the pinch was made:** a third touch on ✎ Edit chart layout does not press it in Chromium (no click
from a tap while two other fingers are down), so the button was pressed by a mouse click with both touch fingers held —
a real control, the menu opened by a real tap first. Whether an iPhone makes a click from a third finger is not known;
either way, a mode switch under a pinch is what the fix covers.

**Faults of the walk's own, fixed and re-run:** P7's first run "lifted" a finger by leaving it out of a move, which the
test browser does not treat as a lift (below); R1's first read took the dialog's OK button into its text.

**A trap in the drivers, found here (written into `docs/walk-scripts.md` §4):** over Chromium's touch input, a move that
leaves a finger out does not lift it — only an end that names it does. The 18 Oct 26 walk's W4 (`trk-fps-walk.mjs`, the
finger left down after a pinch, D134) lifted its second finger that way, so it never lifted it; P7 here lifts it by name
and proves D134 on this build.

## Cases carried by a test

| Case | Test | What it proves | Through the app's controls? |
|---|---|---|---|
| The lost-lift end: the zoom reached, the % label, no re-fit on the next redraw | `trk-pinch-edges.test.tsx` "settles its zoom as the person's own…" | the label (the real zoom bar component) reads the zoom reached; a redraw keeps it | pointer events on the board (jsdom); the redraw called directly |
| The mode switched on under a pinch: no throw, the canvas not zoomed by the old pinch, the next pinch works | `trk-pinch-edges.test.tsx` "the pinch's moves do not throw…" | the moves and the lift after the switch change nothing; the next pinch doubles the zoom | pointer events; the switch called directly |
| The mode switched on and off again under one pinch, a move between | `trk-pinch-edges.test.tsx` "the pinch stays over…" | the zoom the switch back set stands | the same |
| The same with the fingers held still between the switches (the read's finding 1) | `trk-pinch-edges.test.tsx` "no move between the two switches…" | the lift settles nothing | the same (also walked: P8 of the re-walk) |
| → Connect: a link that exists; a loop | `trk-refusals.test.tsx` | the words; chart, save mark, undo unchanged | clicks on the balls (jsdom) |
| Edit lines: a line's end on the same event; on a link that exists; into a loop | `trk-refusals.test.tsx` | the hint's words; chart unchanged | pointer events on the line's end (jsdom) |
| Edit poke-ball: no such event; its own prerequisite; a loop | `trk-refusals.test.tsx` | the returned words; the box stays open; chart unchanged | the box's save function called directly |
| Courses: a name already used (add, rename); "Keep at least one course." | `trk-refusals.test.tsx` | the words; the course list unchanged | the add / rename / delete functions, answering their questions |
| A colon in a course name (add, rename) | `tracker.test.tsx` "colon relaxation (§8)" | already pinned before this job | the same |

## Break tests

| Broken on purpose | Caught by |
|---|---|
| The same-event guard on a line's end switched off | `trk-refusals.test.tsx` (1 red) |
| → Connect's "already exists" guard switched off | `trk-refusals.test.tsx` (1 red) |
| The Edit poke-ball box's "own prerequisite" guard switched off | `trk-refusals.test.tsx` (1 red) |
| "Keep at least one course." switched off | `trk-refusals.test.tsx` (2 red) |
| The rename's "already exists" guard removed | `trk-refusals.test.tsx` (1 red) |
| A line's end "would create a loop" guard switched off | `trk-refusals.test.tsx` (1 red) |
| The pinch fix itself, before it was written | `trk-pinch-edges.test.tsx` — both tests red on the old code (the label read 43% for 86%; the moves threw "Cannot read properties of undefined") |
| The mode switched back before the lift (the first fix settled the old pinch's zoom then) | `trk-pinch-edges.test.tsx` third test — red (2.58 for 1.72) until the lift's settle checked the mode too |
| The mode switched on and straight off with no move between (the read's finding 1, on the fix before it) | `trk-pinch-edges.test.tsx` fourth test — red (0.645 for 0.43) until the switches were counted |

## Errors seen

None — no page error, console error, network error or native dialog in any of the 13 scenarios.

## What was not walked, and why

- A phone on its side: nothing in the change reads the screen's shape.
- A lift really lost on an iPhone: Chromium retargets a lift to the board, so the lost lift is a synthetic step; his
  iPhone is the only real proof (not asked of him — the unit test and the synthetic step carry it).

## The code read

ONE fresh, blind Opus reader (D790), given this sheet and asked for absences as well as errors, told D56 and D489. It
read the whole of `enablePinchZoom` and everything it shares state with, and ran both new test files (3/3, 5/5). Its
report, saved as it arrived:

**Finding 1 (low) — Edit chart layout switched on and straight off again under a pinch is caught only if a finger moves in
between.** *Failure:* two fingers spread a little on the ordinary chart, then held still; ✎ Edit chart layout pressed,
then ✓ Done editing chart (the same place — a mouse double-click does it); the fingers lifted: the chart jumps to the
zoom the pinch had reached before the switch, scrolled by the pinch's out-of-date measurements, and that zoom is marked
as his — against the comment and this sheet ("even if the mode is switched back before the lift"). Nothing throws.
*Cause:* `sameMode` noticed a changed mode only when called while the mode differed; its callers are the pinch's move and
end, and a still finger sends no move — the third test passed only because it sent a move between the two switches.
*Fix:* count the switches (`arrangeFlips`, raised at the three places the mode is set), note the count at the pinch's
start, compare it; a test with no move between the switches.

No other findings.

**Met in passing (older behaviour, not changed or made worse by this job), each low:** (a) a third finger landing during
a pinch, then one of the first two lifting: the remaining pair carries on against the first pair's starting spread and
midpoint, so the zoom jumps; (b) after a lift lost on an iPad, a mouse or trackpad press never clears the pinch (the
mouse returns before the lost-lift check), so the chart's mouse handlers ignore presses until the next touch (Safari
only); (c) a session end during an ordinary pinch leaves it running, and its lift marks the zoom as the next person's.

**Checked and sound (the reader's list, shortened):** the ordinary pinch with no switch runs the old lift's exact steps
in the old order; the lost-lift end now marks the zoom, flushes the view and tells the label, and redraws nothing; the
cancel and the pointer leaving share the one end; the picture's inline stretch is cleared on the old chart in every end;
the drawing-speed mark (`perf`) never lingers; pointer capture rides the board, which a redraw never replaces; a session
end during an Edit chart layout pinch no longer throws; moves after a switch still hold the phone's own scroll off; D134
and D992 untouched; the pinch tests fail on the old code for real reasons (the board's width is stubbed so the phone fit
is real); every refusal the backlog lists is asserted by its own words (→ Connect has no "same event" refusal of its own
— the same ball twice cancels; that message lives on a line's end, tested), each with "nothing changed"; the roll-call is
complete. Confidence: high.

## Fixes after the read

| Finding | Disposition |
|---|---|
| 1 (low) — switched on and straight off with still fingers | **Fixed** as the reader proposed: the switches are counted (`arrangeFlips`, raised at the three places the mode is set — the session end and both halves of `toggleArrange`), a pinch notes the count at its start and compares it. Red first (the fourth test, 0.645 for 0.43). **The fix's own narrow read** (the same fresh reader, given only the fix commit and the finding — round one, the last): no findings; the count is raised at every writer of the mode, the ordinary pinch is unchanged, the test is red for the right reason; `start.arrange` is now only a label (left). |
| Met in passing (a), (b), (c) | **Filed** as `[TRK-PINCH-MORE-EDGES]` in `OUTSTANDING.md` (the fix read confirmed none is made worse by this job). |

**The re-walk** (the same walker, `trk-small-walk v6`, on the rebuilt app — the served page named the new bundle): P1, P4,
P5, D2 again and a new P8 (two fingers spread on the ordinary chart, held still while ✎ Edit chart layout and then ✓ Done
editing chart are pressed, then lifted): **5 of 5 PASS**, no error; P8 kept 40% (the pinch's own ~67% was not laid out).
Report `docs/handpass/parts/trk-small/rewalk/rewalk-report.md`; 30 pictures in
`docs/img/handpass/2026-10-21-tracker-small/rewalk/` (the host opened P8-5: 40%, the ordinary chart, no stretch).

## Gates

- **His PC (only what the job changes, D1086):** the Tracker's unit tests, `npx vitest run src/tracker` — 28 files, 544 of
  544 (after the read's fix); the two new files alone 4 / 4 and 5 / 5; `npm run build` for each walk.
- **GitHub's run of pull request 557 (the full set while the repo is public, D1086):** on the first pushed commit, every
  check green — build, the browser geometry sets (Leave War desktop 1/2 and 2/2, Leave War phone, the scheduler 1–4), the
  Tracker suite (1/2, 2/2), the unit sets (Leave War 1–4, the scheduler 1–6), the documents guard. The run on the last
  pushed commit: see the closing report.
- `npm run docsize`: OK — `Docs: OUTSTANDING 123 items (+1 −2, −2 all in ARCHIVE) · DECISIONS D1–D1097 · homes OK` ·
  `docsize: OVER by 2, deferred (D29)` (the over-size is `.claude/rules/shipping.md`'s, known and fixed elsewhere).

## Closing lines

`Walk: docs/handpass/2026-10-21-tracker-small.md · 84 pictures (54 + 30 re-walk) · 5 surfaces · 9 orders · MISSING: none (the read's 1 finding fixed red-first; 3 older filed [TRK-PINCH-MORE-EDGES])`

Rulings: none this job (D994's small fixes, no answer or look from him).
