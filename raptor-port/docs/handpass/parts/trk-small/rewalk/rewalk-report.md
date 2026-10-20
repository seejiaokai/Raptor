# Re-walk report: the Tracker pinch after the mode-switch counting fix (21 Oct 26, Sonnet 5.5)

**Script version line:** `trk-small-walk v6 (re-walk)` (`raptor-port/scripts/handpass/trk-small-walk.mjs`, run with `ONLY=P1,P4,P5,P8,D2`). JSON results: `raptor-port/docs/handpass/parts/trk-small/rewalk/trk-small-walk.json`. Pictures (30): `raptor-port/docs/img/handpass/2026-10-21-tracker-small/rewalk/`. The first walk's pictures and report are untouched.
**Result: 5 PASS, 0 FAIL.** No page, console, HTTP error or native dialog in any scenario.

**Build proof:** the page at `http://localhost:4294/` names `assets/index-B_5qC1GR.js` (the script refuses to run unless it does); it also equals the checkout's `dist` bundle.

**Contexts and presses:** as in the first walk. Phone 390x844 touch; desktop with touch 1400x900 `hasTouch`, not mobile. The button pressed under the pinch was pressed by method (b), a mouse click while the two touch fingers were held (a third touch point makes no click in Chromium). P8 uses mouse clicks on "✎" and then the menu items, as asked.

| Scenario | EXPECTED | What happened (measured) | Result | Pictures |
|---|---|---|---|---|
| P1 phone, ordinary pinch (sanity) | ball stays under the fingers within 6px; label changes and = round(zoom x 100) | ball CFT-01 0.5px off; zoom 0.4 to 1.029; label 40% to 103% (= round(102.9)); wrap transform "" | PASS | P1-1-before, P1-2-after |
| P4 phone, Edit chart layout switched ON under a pinch | no page error; `#viewport` unchanged by the moves after the switch and by the lift; fresh canvas pinch zooms; Done restores the ordinary chart with label = zoom | 16 pointer-moves reached the board after the switch; `#viewport` `translate(-1.0,-85.0) scale(0.400)` identical after the switch, after the moves and after the lift; fresh pinch: point moved 2.9px, scale 0.400 to 1.200; Done: ordinary chart, label 120% = zoom 1.2 | PASS | P4-1-before, P4-2-two-fingers-spread-menu-open, P4-3-after-the-switch-fingers-still-down, P4-4-after-more-moves-fingers-still-down, P4-5-after-the-lift, P4-6-fresh-edit-pinch-1-before, P4-6-fresh-edit-pinch-2-after, P4-7-back-to-the-ordinary-chart |
| P5 phone, switched OFF under a pinch | no page error; ordinary chart back; label and zoom unchanged by the moves and the lift; a fresh ordinary pinch works | 32 pointer-moves after the switch; zoom 0.633333 and label 63% identical after the switch, the moves and the lift; wrap transform ""; fresh ordinary pinch: ball 0.2px off, zoom 0.633 to 1.629, label 63% to 163% | PASS | P5-1-before, P5-2-two-fingers-spread-menu-open, P5-3-after-the-switch-fingers-still-down, P5-4-after-more-moves-fingers-still-down, P5-5-after-the-lift, P5-6-fresh-ordinary-pinch-1-before, P5-6-fresh-ordinary-pinch-2-after |
| **P8 (new)** phone, Edit chart layout switched ON then straight OFF again under a pinch, both fingers held still | no page error; after the lift label and zoom equal what they were right after the second press; no inline transform left | after a real tap on "reset": zoom 0.4, label 40%. Two fingers down, spread 60 to 100px in six moves: the chart was a stretched picture (wrap transform `translate(0px, 0px) scale(1.6675)`, proof the pinch was under way). Fingers held still (no touchMove): click "✎", click "Edit chart layout" -> Edit chart layout on (confirmed); click "✎", click "✓ Done editing chart" -> ordinary chart back, button reads "✎ Edit chart layout". Then the lift: zoom 0.4 to 0.4, label 40% to 40% (= round(zoom x 100)), wrap transform "", still the ordinary chart. The pinch's own 0.667 zoom was not laid out. 0 errors | PASS | P8-1-before, P8-2-two-fingers-spread-chart-stretched, P8-3-edit-chart-layout-on-fingers-held-still, P8-4-switched-off-again-fingers-still-held, P8-5-after-the-lift |
| D2 desktop with touch, as P4 | as P4 | method (b); 16 pointer-moves after the switch; `#viewport` `translate(-1.0,-51.5) scale(1.000)` unchanged by the moves and the lift; fresh pinch: point moved 2.8px, scale 1.0 to 3.0; Done: ordinary chart, label 300% = zoom 3 | PASS | D2-1-before, D2-2-two-fingers-spread-menu-open, D2-3-after-the-switch-fingers-still-down, D2-4-after-more-moves-fingers-still-down, D2-5-after-the-lift, D2-6-fresh-edit-pinch-1-before, D2-6-fresh-edit-pinch-2-after, D2-7-back-to-the-ordinary-chart |

## Page and console errors per scenario
None (P1, P4, P5, P8, D2 all 0).

## Anything else noticed
- Nothing new. P8 opened and viewed: P8-2 (chart stretched while the fingers are held) and P8-5 (chart back at 40%, plain, no stretch).
- P8 was not walked on desktop with touch (not asked).
