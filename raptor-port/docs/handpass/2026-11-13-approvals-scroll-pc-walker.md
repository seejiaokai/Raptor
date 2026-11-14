# The walker's report — W1–W13 (13 Nov 26, saved as it arrived)

The sheet: `2026-11-13-approvals-scroll-pc.md`. Paths it names under the host's scratch (`…/job1/`) were the builds and scripts of the night; its pictures are in `img/handpass/2026-11-13-approvals-scroll-pc/walker/`.


Build under test: AFTER = `.../job1/dist-pr` (BEFORE = `.../job1/dist-main`, used only where stated). Real headed Chrome window at 125% (`launchReal125`, 1550x917 -> page 1536x824) unless a scenario says otherwise. Nothing under `raptor-port/src` was touched; nothing committed or pushed; every browser I started is closed (checked: no test browser left running).

Pictures and logs: `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-approvals-scroll-pc/walker/` (prefix `appr-a-`; the shared clash script writes its own `r2-*` names into `fx-desk/`, `fx-phone/`, `fx-desk-m/`; `main-ref/` holds one BEFORE-build reference run). Scripts: `.../job1/walker-a/appr-a-*.mjs`.

## Counts (13 scenarios)
PASS 11 · FAIL 2 · NOT REACHED 0

- **W3 FAIL** — Pick dates… on a short window: the picker is cut off by the card at 680 and 560 and its late-month days cannot be reached at 560 (pictures `appr-a-w3-680-open.png`, `appr-a-w3-560-open.png`).
- **W2 FAIL on one clause only** — every neighbour held still; but Approve all's LEFT edge moves 5-7px when its words change (right edge fixed). Identical on BEFORE, so it is existing behaviour, not caused by this change — host to judge whether the brief's "keeps its left edge" was meant (pictures `appr-a-w2-*.png`).

(Window room was 0 — the window behind the page cannot scroll — in every PC step of every scenario.)

---

## W1 PASS — Approve and Refuse, mid-list
Wheeled 300px (real wheel). Lines in view 6-14; Approve on line 7, Refuse on line 9, Approve pressed again.
- Approve: line stays (top 353.2 -> 353.2), lit "Approved"; list scrollTop 300 -> 300; counts Approvals 21 -> 20, Approve all 19 -> 18; card foot 816 -> 816.
- Refuse: line stays (461.2 -> 461.2), lit "Refused"; scrollTop 300; counts 20 -> 19 and 18 -> 17.
- Lit Approved pressed again: back to "Approve", scrollTop 300, counts 19 -> 20 and 17 -> 18; card foot 816.
- Pictures: `appr-a-w1-0-before.png`, `-1-approved`, `-2-refused`, `-3-back-to-pending`.

## W2 FAIL (Approve all left edge only; everything else PASS)
Pressed New, All, Jan, Feb, Mar, All again, Pick dates… (open; range 12-16 Jan; then 5-9 Jan). Measured title, every chip, Pick dates…, Approve all, headings, card before and after each press.
- Title, all chips, Pick dates…, card: moved 0px on every press (all within 1px). Card foot 816 vs screen 824 (8px) at every state, including Jan/Mar (4 lines), New (3 lines), a 2-line range (5-9 Jan) and an empty range (12-16 Jan, "Nothing here for these dates."). With 2 lines the card still reaches 8px above the screen's foot, 432.8px empty below the last line (D2008).
- Approve all: right edge fixed at 1278.8; left edge and width follow its words — "Approve all 19": left 1142.25 / w 136.55; "…3": 1149.01 / 129.79; "…4": 1148.71 / 130.09; "…11": 1143.88 / 134.93; "…0/2": 1149.01 / 129.79. So the left edge moves up to 6.76px. BEFORE build (`appr-a-w2b-main-log.txt`) gives exactly the same numbers. FAIL against the brief's literal "must keep its left edge"; not a change of this build.
- Pick dates… chip itself widens to "12 Jan – 16 Jan" once a range is picked (its right edge 912.8 -> 927.5); nothing to its left moves. Looks intended.
- Picking a range when 12-16 Jan holds no request shows an empty list with the headings gone (picture `appr-a-w2-pick-closed.png`) — noted, not judged.
- Pictures: `appr-a-w2-0-initial`, `-new`, `-all`, `-jan`, `-feb`, `-mar`, `-all-again`, `-pick-open`, `-pick-start`, `-pick-range`, `-pick-closed`, `-pick-5to9`. Logs `appr-a-w2-log.txt`, `appr-a-w2b-after-log.txt`.

## W3 FAIL — Pick dates… on a short window (lesson 17)
The calendar opens inline inside the card and is 350x370.5 px; the card now has a fixed height. Window room 0 at both heights.
- **1550x680** (page 586 tall, card 136-578): picker 250-620.5, i.e. its foot is 42px below the card's foot and is cut off (the "Pick a start date" line is not visible, the card edge cuts the picker's frame). Every day button and both month arrows are wholly visible and pressable (next -> February, prev -> January, pressed day 30). Scroller height with picker open: 28px (less than the headings' 35px) — the list has no visible room at all, and a wheel over it does nothing (list 0 -> 0). After the picker closed the wheel scrolled the list (0 -> 150.4).
- **1550x560** (page 466 tall, card 136-458): picker 250-620.5 — more than 160px past the card's foot. The calendar shows only weeks 1-18 Jan; days 19-31 (13 buttons, boxes 453-541 against a 466 screen) are off screen and not hit-testable ("elementFromPoint" returns the page). Scroller height 28px. **A real person cannot reach them:** wheel over the picker, wheel beside it, window scroll — all moved nothing (`appr-a-w3b-after-log.txt`: card/page/scroller scrollTop 0, window 0). Only the keyboard reached them, by Tab scrolling the card by itself to 200px (card scrolled out from under its own heading). My first run "pressed" day 30 only because Playwright scrolls an off-screen button into view itself — script's world, not counted as a pass; the real-input check is `appr-a-w3b-*`.
- On BEFORE (`appr-a-w3b-main-log.txt`) the same height has window room 1451 and the wheel scrolls the page, so the picker was fully reachable: this is new with the change.
- Pictures: `appr-a-w3-680-open.png`, `appr-a-w3-680-day-picked.png`, `appr-a-w3-680-after.png`, `appr-a-w3-560-open.png`, `appr-a-w3-560-day-picked.png`, `appr-a-w3-560-after.png`, `appr-a-w3b-after-560-after-wheels.png`, `appr-a-w3b-after-560-after-tab.png`, `appr-a-w3b-main-560-after-wheels.png` (BEFORE for comparison). Logs `appr-a-w3-log.txt`, `appr-a-w3b-*-log.txt`.

## W4 PASS — Approve all
Armed: background rgb(229,168,59) amber, words "Approve 19 — tap again", top 191.2 and right edge 1278.8 unchanged (the box grows to the left, left edge 1142.25 -> 1076.5, no overlap with the chips), card foot 816, window room 0. Second press: all 19 lines lit "Approved", counts Approvals 2 / Approve all 0, card foot 816, room 0. Wheel to the list's foot (514.4 of 514): last line (idx 18, 732.8-786.8) wholly in view and lit; wheel up at once 514.4 -> 314.4. Pictures `appr-a-w4-0-before`, `-1-armed`, `-2-after-second`, `-3-list-foot`.

## W5 PASS — a request's dates, and back (D1231, D1421)
List at 400; line 9 approved; dates of line 11 ("Wed 11 – Fri 13 Feb") pressed: grid opened with the cell ringed (`cell-bane-2026-02-11`) and the slim bar "Approvals 18 pending · 3 new  Back ▴  ✕". Back: Approvals returned, list 400 -> 400, decided line still "Approved", room 0, card foot 816. Second trip then ✕: the grid is shown, no bar, Approvals page hidden. Then the Approvals tab: a NEW visit — 18 lines (the approved one gone), no lit line, list at 0, chip All, room 0. Pictures `appr-a-w5-0-decided`, `-1-grid-opened`, `-2-back`, `-3-after-x`, `-4-approvals-tab-again`.

## W6 PASS — change made while Approvals is hidden, then a wait (lesson 10)
List at 200. Line 6 (Gambit OIL Tue 24 Feb) dates pressed; on the grid the ringed cell tapped, the day's own window opened, "Approve" pressed there (window closed itself); Escape; slim bar still there; Back. Approvals shows that line as "Gambit C OIL Tue 24 Feb › Already approved by Saber" with Approve/Refuse greyed (D1467's wording), same top 399.2, list 200 -> 200, room 0, counts 21 -> 20 / 19 -> 18. After 6 seconds untouched the wheel moved the list 200 -> 350.4 at once, window scrollY 0. Pictures `appr-a-w6-1-day-window`, `-2-decided-in-window`, `-3-back`, `-4-after-wait-wheel`. (Only the Approve variant was walked.)

## W7 PASS — clash note's "Decide it in Approvals ›" (D1542)
`lw-fx1031-2.mjs` on the AFTER build, SIZE=desk and SIZE=phone: R2-5, R2-6, R2-7, R2-8, R2-10, R2-11 all PASS at both sizes. R2-6 desk result `{up:true, ringed:["appr-line-vinci"], ringInView:true}`; phone the same. Errors: none. Outputs `appr-a-w7-desk-out.txt`, `appr-a-w7-phone-out.txt`; pictures in `fx-desk/`, `fx-phone/`.
Extra measure on desk (copy `appr-a-w7m.mjs`, picture `fx-desk-m/r2-desk-6-tap-sans-off.png`; that script's own emulated 1536x730 window): right after the tap the ringed line is at 639-693, the pinned headings end at 277.0 (line wholly below them), the card's foot fade starts at 694 (card 722 minus its 28px fade) — line wholly above it, **with only 1px to spare** (the ringed line is the last line of the list, scrollTop 232). Noted because the margin is that thin.

## W8 PASS — OIL tracker over Approvals (D1503, D1506)
Dates picked first (5 Jan – 31 Mar via the calendar -> 19 lines), list wheeled to 300, line 7 approved.
(a) OIL tab then the tracker's ✕: Approvals back, decided line still lit, chip "5 Jan – 31 Mar", list 300 -> 300, room 0.
(b) My leave -> person window -> its OIL line (the person window gave way to the tracker) -> tracker ✕: same (lit, chip, list 300, room 0); no person window left over.
(c) Balances tab then Approvals tab: a NEW visit — 18 lines (approved one gone), no lit line, chip "All", list at 0, room 0 (Balances room 0 too).
Pictures `appr-a-w8-0-base`, `-1a-oil-open`, `-2a-closed`, `-3b-person-window`, `-4b-oil-open-from-person`, `-5b-closed`, `-6c-balances`, `-7c-approvals-again`. (My first run with 15 lines had the list already at its foot at "300"; rerun with 19 lines used.) Tapping a line's name puck opens nothing on Approvals on a PC — on BEFORE it is the same (`appr-a-w8x-main-log.txt`), so I used My leave as the brief allows.

## W9 PASS — the keyboard
Clicked the empty gap left of Approve all, then Tab: 17 stops of chips came first (New, All, 12 months, Pick dates…) before the list; counted 15 stops from the list's first stop (dates, Approve, Refuse for five lines): every focused box wholly inside the scroller — top 283.8 or more against headings' foot 275.2, bottom 535.8 or less against the scroller's foot 815.2 and the fade's start 788; focus ring visible on all (solid 1.6px cyan outline); window scrollY 0 and room 0 throughout; Shift+Tab back through all of them, same, ending on Approve all. Extra: 100 Tab stops straight through the whole list (all 19 lines to the foot): 0 offenders. Pictures `appr-a-w9b-tab5/9/15.png`, `appr-a-w9b-shifttab-end.png`, `appr-a-w9b-extra-foot.png`. (`appr-a-w9-log.txt` is my first run, which only reached the chips — script's own world, not a finding; `appr-a-w9b-log.txt` is the real run.)

## W10 PASS — column alignment (lesson 9)
Measure copied from `lw-m4-colalign.mjs` (per line kind), emulated desktop 1536x733 (`launchDesk`), same world, BEFORE and AFTER, at the top and after wheeling 250px, undecided and with one line decided. Kinds covered: OIL, CCL, PL, CL, LL, half day, several-day, "by Saber", decided. Columns NAME, KIND, DATES, DAYS, LVE BAL, LOWEST AVAIL, PLACED. 260 cell comparisons: worst gap 0.00px on both builds, AFTER minus BEFORE 0.00px everywhere. Data `appr-a-w10-after-data.json`, `appr-a-w10-before-data.json`; pictures `appr-a-w10-after-*.png`, `appr-a-w10-before-*.png`.

## W11 PASS — nothing pinned leaks (D1518, lesson 15)
Line 2 decided (lit fill); list wheeled 0 -> 400 in 40px steps (11 steps). At each step the crop from the chips' lower edge to the headings' foot (1240 wide, scrollbar excluded) and the headings strip alone were compared byte for byte with step 0: identical at all 11 steps. The lit line crossed the headings at steps 120, 160 and 200 (top 263 / 223 / 183 against headings' foot 275.2), so the crossing was covered. Strips `appr-a-w11-strip-000.png` ... `-400.png`; whole-page `appr-a-w11-full-at-400.png`. (First run included the scrollbar's thumb and 4px of list in the crop and reported a difference — my crop's fault, fixed.)

## W12 PASS — the phone, plain-user round (AFTER)
WebKit (iPhone 402x874) and Chromium phone, both: no inner scroller (`geo.scroller` null, body class empty), 19 lines; the whole page scrolls (room 1241 WebKit / 1281 Chromium); at the foot the last line is wholly on screen (WebKit 560.8-650.8, Chromium 556.3-651.3 of 874) with the card's foot 658; back to the top ok; tap Approve -> "Approved", page did not jump; Feb chip -> 10 lines, still whole-page scroll, last line reachable; dates -> grid with slim bar and ring; Back -> Approvals with the decided line still "Approved". Pictures right after each tap and settled: `appr-a-w12-webkit-*.png`, `appr-a-w12-chromium-*.png`. Phone foot numbers equal the BEFORE build exactly (`main-ref/appr-a-w12-chromium-log.txt`).
How the page was moved: mobile WebKit accepts no wheel and no scripted touch scroll (walk-scripts §4), so in WebKit the script moved the page with its own `scrollBy` — not a finger. In Chromium a CDP touch-scroll gesture did nothing in this emulation, so the real mouse wheel was used. Neither is a real iPhone flick.

## W13 PASS — Balances unchanged on a PC
Balances tab (`[data-testid="bal-scroll"].bp-scroll`, 1 element), window heights 905-911 (page 812, 813.6, 813.6, 814.4, 816, 817.6, 817.6 — fractions included). At every height: window room 0; wheel to the list's foot (e.g. 1676/1676, 1675.2/1675) with window scrollY 0, then wheel up at once moved the list (-200) and not the window. Before each height step I set the list's scrollTop to 0 by script (placing it before the step, as allowed). Pictures `appr-a-w13-after-balances-917.png`, `appr-a-w13-after-balances-911.png`.

---

## Seen besides
1. **Short window, keyboard (follows W3):** at 560 a Tab through the picker scrolls the card's own contents 200px out from under its heading (card scrollTop 200, headings gone from view) — `appr-a-w3b-after-560-after-tab.png`.
2. **Approve all armed:** the armed box widens by about 66px to the left (right edge fixed); no overlap with the chips. Matches D1431 as I read it; mentioned only because its left edge moves.
3. **W7 desk:** ringed line only 1px clear of the fade (see W7).
4. **Page errors:** none on any run (every script watched the page's errors and console).
5. Name puck tap on Approvals does nothing on a PC — same on the BEFORE build, so not new.
6. My own scripts' slips (not findings): first W9 run never reached the list; first W11 crop included the scrollbar; first W8 had a list already at its foot; first W6 looked at the wrong line text. All reran; the final results are above.

---

# The walker's re-walk of the W3 fix — F1–F6 (saved as it arrived)

Its pictures: `img/handpass/2026-11-13-approvals-scroll-pc/walker-fix1/`.


Build: `.../job1/dist-fix1` (bundle index-Brg6lNU6.js). BEFORE comparisons: `dist-main` (F6, arrows) and `dist-pr` (arrows). Real headed Chrome at 125% (page = window minus 14: 1550x917 -> 824 high, 680 -> 586, 560 -> 466), windows set with the browser's own window control. Pictures and logs (prefix `appr-a-f1-` for F1 etc., all start `appr-a-`): `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-approvals-scroll-pc/walker-fix1/`. Scripts `.../job1/walker-a/appr-a-f1.mjs, f2, f345, f5x, f6, f6b, f6c, f1y`. Nothing under `raptor-port/src` touched; nothing committed; every browser closed.

## Result: F1 PASS, F2 PASS, F3 PASS, F4 PASS, F5 PASS, F6 PASS (6 of 6). No FAIL, nothing NOT REACHED. No page errors in any run.

## F1 PASS (W3 again) — both heights
List first wheeled by the real wheel to 300, then Pick dates…. Window room 0 in every step.
- **At open (both heights):** list 300 -> 0 (box back at its top); the calendar is inside `.appr-scroll` (parent chain DIV.dcal-inline > DIV.appr-pickpop > DIV.appr-scroll), top 250, i.e. 10px under the chips' foot (240); the column headings come after it (630.5); card.scrollTop 0. Pictures `appr-a-f1-680-1-open.png`, `appr-a-f1-560-1-open.png`.
- **1550x680** (page 586, card 136-578, list box 240-577.2): day 31 sits at 496.8-540.8 with no wheel needed — wholly inside the box and above the foot fade (starts 550); a hit test at its centre lands on it. Wheel 100: the calendar's own foot (picker bottom 520.5) comes within the box and above the fade (the earlier fault: it ended 42px past the card). `appr-a-f1-680-2-last-week.png`, `-3b-calendar-foot.png`.
- **1550x560** (page 466, card 136-458, list box 240-457.2, fade from 430): after 2 real wheel ticks (list 200) day 31 is at 296.8-340.8, wholly in the box, above the fade and the screen; hit test lands on it. Calendar's foot reached (bottom 420.5 <= 430 at list 200). `appr-a-f1-560-2-last-week.png`, `-3b-calendar-foot.png`. (Earlier: days 19-31 were off screen and unreachable.)
- **Wheel further:** headings pin at the box's top — headings top 240 = box top 240 at list 400 (trail at 680: 530.5, 430.5, 330.5, 240; at 560: 330.5, 240), the first line at 265.7 is under the headings' foot 275.2, i.e. lines scroll under them; list room 1143 / 1263. `appr-a-f1-680-3-headings-pinned.png`, `-560-3-...`.
- **Tab through the calendar's days:** Tab order from Pick dates…: Approve all, calendar title, Today, previous month, next month, one day stop (the grid has one tab stop, day 1), then straight on into the list (dates, Approve, Refuse...). 40 stops each height: card.scrollTop 0 at every stop, window scrollY 0, every focused thing wholly inside the list box (not under headings or fade). Arrow keys then walk the days (8 different days, down to Feb): card.scrollTop 0 throughout. `appr-a-f1-*-4-after-tab.png`, `-4b-arrow-walk.png`.
- **Real mouse clicks, no script scroll:** day 29 then day 31 in the last row (wheel placed the box; each button hit-tested as itself before the click): calendar closes, chip "29 Jan – 31 Jan", 1 line, window room 0, card.scrollTop 0. At 560 the first click happened after 2 wheel ticks. `appr-a-f1-680-5-day29-pressed.png`, `-6-range-done.png` and the 560 pair.

## F2 PASS — the box's scroll bar, calendar open at 560
Classic 15px bar at the box's right edge (box 240-457.2, thumb 27px). Real mouse: press on the thumb, move down in 8 steps of 8px (64px), lift: list 0 -> 65.6, 130.4, 196.8, 261.6, 326.4, 392.8, 457.6, 523.2 — the box scrolls with the pointer and the calendar stayed open throughout and after. Also: press in the track below the thumb 523.2 -> 713.6 (open); press on the bottom arrow 713.6 -> 753.6 (open); card.scrollTop 0, window room 0. Control: a press outside the card (right margin) still closes the calendar. `appr-a-f2-1-bar-zoom.png`, `-2-dragging.png`, `-3-after-drag.png`, `-4-track-click.png`, `-5-outside-press.png`.

## F3 PASS — Approve under or near the open calendar, 917
(a) List at top, calendar 250-620.5, line 0's Approve at 674-710 (54px below the calendar's foot): first press: calendar closes, decided lines 0 -> 0, Tab count "Approvals 21" and "Approve all 19" unchanged. Second press on line 0's Approve: decided 1, "Approve all 18", tab "Approvals 20". (b) calendar scrolled up under the pinned headings (list 300, calendar -50 to 320.5, a line's Approve at 374-410, directly under it): same — first press only closes (0 -> 0, counts unchanged), second press decides (18). `appr-a-f3-a-list-top-1-open.png`, `-2-first-press.png`, `-3-second-press.png`, and `f3-b-wheeled-after-open-*`.

## F4 PASS — range by two day presses, 917
Before: All chip, calendar closed. Open the calendar: title, every chip, card and Pick chip within 1px (unmoved). Real presses on 5 Jan then 9 Jan (each hit-tested as the day button): calendar closes; chip reads "5 Jan – 9 Jan"; 2 lines listed; title/chips/card unmoved on open and after; card foot 816 = screen 824 - 8; window room 0; list at 0. Only differences: the Pick chip widens (right edge 912.8 -> 917.0), same as W2; Approve all's right edge fixed 1278.8. `appr-a-f4-1-open.png`, `-2-start-picked.png`, `-3-range-done.png`.

## F5 PASS — keyboard with the calendar open, 917
45 Tab stops forward and 45 Shift+Tab back: 5 calendar stops (title, Today, prev, next, day 1), then the list's dates/Approve/Refuse for several lines; every focused thing wholly visible (0 hidden; none under the headings or foot fade), card.scrollTop 0 at every stop, window scrollY 0, calendar stayed open at every stop. Focus rings: 1.6px cyan outline on every stop except the calendar's title and day, which draw their own ring on an inner element — checked by eye (`appr-a-f5x-fix1-title.png`, `appr-a-f5x-fix1-day-2026-01-01.png`) and identical on main (`appr-a-f5x-main-*`). `appr-a-f5-1-tab-45.png`, `-2-shifttab-back.png`.

## F6 PASS — the phone (iPhone 13 emulation, WebKit 402x874)
- W12 round again on fix1: no inner scroller, 19 lines; page scrolls as a whole to its foot (scrollY 1241 of 1241), last line 560.8-650.8 within 874; scroll back to 0; tap Approve -> "Approved", page did not jump; Feb chip -> 10 lines; Feb foot reachable (539 of 539); dates -> grid with the slim bar and ring; Back -> 18 lines, decided line still "Approved". 8 of 8 checks. (WebKit takes no wheel or scripted touch; the page was moved by the script's own `window.scrollBy`, not a finger — as in W12.) `appr-a-f6-webkit-*.png`.
- Pick dates… on the phone: the calendar stands in the card between the chips (foot 304.8) and the headings: calendar 314.8-685.7, headings top 695.7, first line 728.7, card 141.8-2289.7; no inner scroller; calendar's parent `appr-pickpop`. **dist-main gives the same numbers to the decimal** (calendar 314.8-685.7, headings 695.7, card 141.8-2289.7). Pictures `appr-a-f6b-fix1-calendar-open.png` against `appr-a-f6b-main-calendar-open.png` (and `-full.png`). Two taps (5, 9 Jan): calendar closes, 2 lines, chip "5 Jan – 9 Jan" (`appr-a-f6c-range-done.png`).

## Seen besides
1. **Arrow keys in the calendar at the short window (560), not caused by this change.** With the calendar open and focus on a day, ArrowDown moves focus to days 22 and 29 (boxes 452.8-496.8, 496.8-540.8) which sit below the list box (foot 457.2) and the screen (466); the box does not scroll to follow, so the focused day is out of sight (6 of 8 arrow stops hidden at 560; 0 of 8 at 680). Same on dist-main (days at 452.8 and 496.8 off screen, window not scrolled) and on dist-pr (`appr-a-f1y-main-log.txt`, `-pr-log.txt`, `-fix1-log.txt`; picture `appr-a-f1y-fix1-560-arrows.png`). Tab itself is fine (F1/F5). The wheel reaches them, so a keyboard user at that height must also scroll.
2. A one-day range (press day 31 twice) left the calendar open with chip "31 Jan" and 0 lines in my first F1 run (before I switched to 29 -> 31). Not checked on other builds; may be intended.
3. W7 note still stands: the ringed line from "Decide it in Approvals" sat 1px clear of the foot fade on the earlier build (not re-run here; F1-F6 do not touch it).
4. My slips (script world): first F1 required >=25 Tab stops on the days (the grid has one stop); the arrow walk reached February so the first click step needed a fresh open; F5's ring check ignored the calendar's own inner ring. All fixed and re-run; the logs hold the final results.
