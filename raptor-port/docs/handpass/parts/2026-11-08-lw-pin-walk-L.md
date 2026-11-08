# Walker L — the Leave War's pinned dates row (build of 56f738937, served on 4393)

Walked 8 Nov 26 in a scripted real browser: desktop 1536x864 Chromium, phone 402x874 Chromium with touch (scale 2), phone 402x874 WebKit for looks only. Script `raptor-port/scripts/handpass/lwpin-walk-l.mjs`; pictures `raptor-port/docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/L/` (names below are in that folder). Console errors, page errors and 4xx responses over every run: 0.

"Shown" = computed opacity above 0.5 and visibility not hidden. T = the scroll where the real date row meets the top bar's foot (175 desktop, 180.5 phone).

## Result in one line
One FAIL (L22: after the window is made narrower, or the phone is turned, the copy appears about 35-40px before it should and sits over the month buttons). Everything else passed or is recorded. Not walkable here: listed at the end.

## FAIL

**L22 turning and resizing (desktop 1536 -> 420 wide; phone 874x402 -> 402x874).** After the viewport changes width, the copy is SHOWN well before the real row reaches the bar, until the page is reloaded.
- Seen, desktop: loaded at 1536, window made 420 wide, scrolled to 37px short of T (y=152, T=189.3): copy opacity 1, copy top 49 = bar's top, over the month buttons (months at 49-71, covered), and two "2026 CS/Name" date rows on screen. The same scroll on a page freshly loaded at 420 wide (y=144, T=180.5): copy hidden, month buttons visible.
- Measured: after the width change the custom value (`--lwy-s`) and the animation range read correctly (189.3, "188.3px 189.3px"), yet the copy turns on at y=152, not 189. Sweep: fresh 1536 first shown at y=176; after 1536 -> 420 first shown at y=152; after going back to 1536 first shown at y=176 (right again); after a height-only change right. Stays wrong for any time waited (2 s) and after scrolling back and forth.
- Seen, phone (Chromium, turned sideways and back): at 402x874 y=145 with T=180: copy shown (want hidden). Desktop script line: at 420x864 y=184, T=189, shown.
- Expected: hidden until the real row reaches the bar's foot, at every size, from the first settled frame.
- Pictures: `L22-extra-narrowed420-37short.png` (fault) beside `L22-extra-fresh420-37short.png` (right); script pictures `L22-pc1536-ch-just_before_T-420x864.png`, `L22-ph402-ch-just_before_T-402x874.png`.
- Caveat: Chromium headless with a scripted viewport change; the iPhone (WebKit) turning was not walkable. A real narrowing of a desktop window and a phone turn are the cases it stands for.

## Table (one row per scenario; EXPECTED is the brief's)

| Scenario | Size / engine | What I did | What I saw | Verdict | Pictures |
|---|---|---|---|---|---|
| L1 reduce motion | pc, phone Chromium | scroll across T with reduced motion | hidden above T (opacity 0, top at bar's top), shown from T, no animation difference | PASS | L1-*.png |
| L3 keys / reader | pc Chromium | 70 Tabs from Grid tab; hidden steps judged per step | with copy hidden: inert, never focused (43 hidden steps); past T inert is true and 40 Tabs never reached into it. (An earlier run line "Tab at top" said FAIL: my script judged it wrongly, the page had scrolled while tabbing so the copy was rightly shown; superseded by the per-step run.) Phone not walked (no keyboard). | PASS (pc), RECORDED | L3-*.png |
| L-height | pc, phone Chromium | measure copy against real row | pc 45 / 45; phone Chromium 44.1875 / 44.1875; phone WebKit see L-foot pictures (copy same height, aligned) | PASS | Lheight-*.png |
| L4/L5 pinch | phone Chromium | 7 pinch cases: out/in pinned, across T both ways, begun before T released/cancelled, begun pinned cancelled | copy never drawn over the month buttons (0 steps), gap to the bar's foot 0 while shown, settled state correct, widths aligned after lift | PASS (all 7) | L4-*.png |
| L6 failed-save band | pc, phone | `/?savefail`, saved a cell, pinned | bar foot = copy top (93 / 85), shown iff real row under bar | PASS | L6-*.png |
| L8 Manning, folds | pc, phone | toggles at T+2 and T-2, frames logged | no frame with state wrong | PASS | L8-*.png |
| L10 fast crossings | pc, phone | 10 fast crossings with reversals, rAF frames | no frame with the real row under the bar and copy hidden | PASS | L10-*.png |
| L11 fractional seam | phone Chromium + WebKit, scale 2 and 3 | try T-1, T-0.75 etc | RECORDED: the browser snaps scroll to whole pixels so fractional offsets cannot be reached; at the whole pixel either side the copy is right. Zoom out/in not walked. | RECORDED | L11-*.png |
| L12 diagonal | pc, phone | vertical plus sideways across T | aligned, shown | PASS | L12-*.png |
| L13 tap a date | pc, phone | real and copy dates at T-40 etc | one window opens, one copy afterwards | PASS | L13-*.png |
| L15 Rearrange | pc, phone | real drag of a person, Done, Undo, Redo | order changed, copy aligned (n=54 / 15, delta 0) throughout | PASS (second finger during a phone drag NOT WALKED) | L15-*.png |
| L16 months / periods | pc, phone | month buttons and period picker before and after T | right state each time | PASS | L16-*.png |
| L17 edits, Undo, Redo | pc, phone | | aligned | PASS | L17-*.png |
| L18 away and back | pc, phone Chromium, phone WebKit | leave Leave War and return | one copy, aligned. A real Quals change was not made (no "Enable editing" button found). | PASS | L18-*.png |
| L19 other tabs | pc, phone | Approvals, Balances, OIL, My leave | the grid's copy is not drawn on top of other tabs. After OIL opens the copy stays mounted and passes the shown test beneath the opaque OIL window (not drawn). | PASS | L19-*.png |
| L20 windows over the grid | pc, phone | day panel closed by x, Escape and outside tap; person window; bid window with its menu | window drawn above the copy in every case (elementFromPoint), one copy in place after each close. The script's FAIL came from the day panel staying open after an outside tap: reproduced at the page's top with no pinned row, so it is the app's own behaviour, not this change. Phone Required keypad: its row is out of view while pinned, NOT WALKED. | PASS (outside-tap note) | L20-*.png |
| L22 turning / resizing | pc, phone Chromium | see FAIL above | copy shown early after narrowing | FAIL | see above |
| L22 Safari address bar | his iPhone | none | not walkable on this PC | NOT WALKED | none |
| L23 a member | pc, phone | member sign-in, T-40, T+3, T+150, day panel by x and Escape | as the admin; copy and real row have the same 365 / 153 days and the copy has 0 buttons of its own; panel opens and closes, copy aligned | PASS | L23-*.png |
| L24 the old way | pc, phone, full and partial stand-in | CSS.supports patched; cross T, sideways, pinch (phone), OIL and back | one working copy each time, shown iff past T, aligned; phone pinch 12/12 steps, none over month buttons. Stand-in only, not a real browser. | PASS (4) | L24-*.png |
| L-plain admin, member | pc, phone | scroll 900px, day by date closed by x and Escape, bid, decide, person, top, leave and return | dates row there whenever dates under the bar, never over the month buttons, one copy throughout. Admin: the bid placed and counted as already approved (no Approve button seen). Member: no leave button (bidding closed for him), so placing and deciding NOT WALKED. | PASS | Lplain-*.png |
| L-foot | pc, phone Chromium, phone WebKit | to the page's foot, bar carried off 90px with a resize event, put back | at the foot the copy is shown with top at the bar's foot (gap 0); while the bar is carried off it stays at the bar's own top (49 / 57), never up under it; gap 0 again after the bar is back and at T+40. The PC has no bounce: his iPhone is the look for the bounce itself. | PASS | Lfoot-*.png |

## Not done on this PC
- Safari's folding address bar and the iPhone's page bounce (his iPhone only).
- A fling: a headless finger makes none.
- 2560x1440 zoomed out: not walked.
- L3 on the phone, L11 zoom out/in, a second finger during a phone Rearrange drag, a real Quals change in L18, the Required keypad pinned, a member's bid.
- L24 is a patched stand-in, not a browser without the scroll timeline.
