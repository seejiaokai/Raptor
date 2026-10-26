# M3 walk, Walker C: the day panel, the folded items, speed (build addf330a5, served on port 4303, now stopped)

Pictures: `raptor-port/docs/img/handpass/2026-10-24-lw-m3/C/` (abbreviated `C/` below). Scripts: `raptor-port/scripts/handpass/lw-m3-walk-c*.mjs`
(library `lw-m3-walk-c-lib.mjs`). Sizes: phone 402x874 (touch), desktop 1440x900. Chromium for every step; WebKit for the phone taps of 20 and 23
(and, as extra, 24, 27, 28 and the pressed-state set). Admin `ad`, member `us` (Ranger). Console, page errors and 4xx/5xx watched in every run: **none seen**.
The demo world has the first quarter of 2026 open for bidding (all past from today, 23 Oct 26), so panel days in Jan to Mar carry no "Not open for bidding" line; every
day from April on does. That is the world, not a fault. Line 25 skipped as told.

## Results

| # | Size | Engine | Verdict | Pictures (in `C/`) | What the picture shows |
|---|---|---|---|---|---|
| 20 | desk | Chromium | PASS | `s20-desk-chromium-01-jul15`, `-10-jan01-27`, `-12-jan02`, `-14-dec31-25` | Floating panel top right: "Wed 15 Jul", "Not open for bidding", Required/Available P and W (25 / 17), "AWAY 4" with four lines (puck, kind box, dates, days, Approved). Stepping Oct 30 > 31 > Nov 1, Dec 30 > 31 > 1 Jan 27 (next period's figures) and back, 2 Jan 26 > 1 Jan > 31 Dec 25 ("No leave period covers this date", all four figures "-", no Away list) and forward again all land on the right day |
| 20 | phone | Chromium | PASS, with fault F1 | `s20-phone-chromium-01-jul15-tap`, `-01-jul15`, `-14-dec31-25`, `-10-jan01-27` | Same content in the foot panel. Same step results. F1 below is a heading-tap fault found while doing 20 |
| 20 | phone | WebKit | PASS, with fault F1 | `s20-phone-webkit-01-jul15-tap`, `-10-jan01-27`, `-14-dec31-25` | Same as Chromium; the 2 Jan heading tap lands on 1 Jan (F1) |
| 23 | desk | Chromium | PASS | `s23-desk-chromium-02-open`, `-04-dragged`, `-05-cell-tap-with-panel` | Panel floats (440x332 at top right), is dragged by its bar (moved from 984,96 to 584,274), the page scrolls with the wheel and the grid scrolls sideways with it open, and a tap on a grid cell opens the bid window in front of the panel with the panel still open |
| 23 | phone | Chromium | FAIL (as the line is written; see F2) | `s23-phone-chromium-02-open`, `-03-after-strip-swipe`, `-04-after-panel-swipes` | The panel is 378x854 of an 874-high screen (8px under the top, 12px above the foot): it covers all of the grid but a 12px strip at the bottom. Its content ends at about 340px; the other 500px are blank. A sideways swipe on the 12px strip scrolls the grid (+185px) and the picture shows the strip's cells change. A swipe on the panel's blank area does nothing to the grid |
| 23 | phone | WebKit | FAIL (same as Chromium) | `s23-phone-webkit-01-open-tap`, `-02-open` | Same panel box (378x854 at 12,8). Swipes not scripted in WebKit (no touch swipe in the driver): NOT RUN for the scroll |
| 24 | desk | Chromium | PASS | `s24-desk-chromium-01-rearrange-on`, `-03-after-heading-tap`, `-07-heading-drag-end` | With Rearrange on (grips on rows and groups, "Done" on the bar) a heading tap opens the panel for that day and nothing else: no row drag, no selection, no sheet, row order unchanged, Undo still disabled (nothing written). A second heading tap steps the panel to the new day. A press-drag across a heading with the panel open does nothing. The default panel place covers the "Done" button (F5) |
| 24 | phone | Chromium | PASS | `s24-phone-chromium-01-rearrange-on`, `-02-heading-tap` | Rearrange on (grips, "Done"), heading tap opens the panel, nothing else happens (no row picked up, no selection, Undo disabled). The panel then covers "Done" until it is closed |
| 24 | phone | WebKit | PASS | `s24-phone-webkit-02-heading-tap` | Same |
| 26 | desk | Chromium | PASS (landing half only) | `s26-desk-chromium-03b-the-ask`, `-04-after-save` | A member with a pending LL on 20 Mar files an LL for the same day on the Inputs page, answers the "No document" ask; the amber note reads once: "This replaces your LL bid on 20 Mar on the Leave War, Input added" (one occurrence), the row shows "No document" and a LATE tag. The refused half ("a filing the commit refuses shows no note") is **NOT RUN**: the only refusal in the test is a member filing leave for another man, and the app gives him no way to do that (D655), so it cannot be reached through the controls |
| 27 | desk | Chromium | PASS | `s27-desk-chromium-09-closed-day-tapped`, `-11-open-day-tapped` | Member (today moved to 15 Mar by the bridge), LL on 20 Mar, Move, April, tap 8 Apr: the bar at the foot reads "That day is closed for bidding. Pick an open day." with Cancel. Tapping open 25 Mar moves the LL there |
| 27 | phone | Chromium, WebKit | PASS | `s27-phone-chromium-09-closed-day-tapped`, `s27-phone-webkit-09-closed-day-tapped` | Same words in the foot bar, on two lines. An open day then asks "Move 1 entry here? Confirm / Cancel" (the desktop moves at once; not examined further) |
| 28 | desk | Chromium | PASS | `s28-desk-chromium-PacificMidway-02-award-window`, `s28-desk-chromium-AsiaSingapore-02-award-window` | Browser zone set (Pacific/Midway, clock 23 Oct 03:00 UTC = 22 Oct 16:00 local): an award given by Saber and opened in the day's list reads "ENTERED BY Saber, 22 Oct 26" (the local day, not the UTC day). Singapore at 22 Oct 20:30 UTC = 23 Oct 04:30 local reads "23 Oct 26" |
| 28 | phone | Chromium (Singapore), WebKit (Midway) | PASS | `s28-phone-chromium-AsiaSingapore-02-award-window`, `s28-phone-webkit-PacificMidway-02-award-window` | "Saber, 23 Oct 26" and "Saber, 22 Oct 26" respectively. Seen in passing: the bid window's own award detail ("ENTERED BY Saber") has no date; only the day's list has one |
| Speed | desk, phone | Chromium | numbers below | `speed-desk-01-panel-open`, `speed-desk-02-window-open`, `speed-phone-01-panel-open` | See Speed |
| D1281 pressed pictures | phone | Chromium, WebKit | PASS | `d1281-phone-chromium-01..06`, `d1281-phone-webkit-01..06` | Picture at ~100 ms after each tap (heading, next, prev, close cross) and settled. Panel opens inside the 100 ms picture, so the tapped heading's pressed look is never seen. After the close cross, the 100 ms picture (`-05-close-100ms`) shows the pinned names column, the frozen date row and the corner opaque and untinted in both engines; the pointer was left on the cross's place over the grid, nothing see-through or shifted |

## Speed (built bundle, Chromium, after the 1500 ms the grid needs after a month jump; median of three, time from the lift to the target being in the page / painted two frames later)

| | Desktop | Phone (CDP touch) |
|---|---|---|
| Nodes under the Leave War page, panel closed | 22,181 | 11,227 |
| Same, panel open | 22,243 (+62) | 11,289 (+62) |
| Same, panel closed again | 22,181 | 11,227 |
| Same, bid window open | 22,251 (+70) | 11,297 (+70) |
| Cell tap to bid window up | 16 ms (painted 37 ms); runs 26.5 / 16.3 / 16.1 | 26 ms (painted 39 ms); runs 27.9 / 26.3 / 22.8 |
| Heading tap to panel up | 51 ms (painted 66 ms); runs 58.7 / 30 / 51 | 18.5 ms (painted 29 ms); runs 33 / 18.5 / 16.9 |
| One bid placed (LL, after the "tap again" because Saber goes to -1) | 25 page changes, touching 3 cells: the bid's own cell, its balance figure and its day's Available P figure | 29 page changes, 4 cells: bid's cell, balance, balance box twice |
| Node count after the bid | 22,184 (+3 vs closed) | 11,232 (+5) |

No whole-grid redraw is visible in what the page touched (the count is of changed cells in the page, not of the app's own draws; the app's draw count was not reachable from outside). A before-M3 figure was not taken (no old build on hand), so these are the built bundle's own numbers.
Opening the panel after a jump to another month at desktop width also draws more months (a +1,857 node jump seen once): that is the window engine drawing, not the panel.

## Faults

**F1. Phone: a tap on the left part of the "2 Jan" date heading opens the 1 Jan day panel (Chromium and WebKit).**
Steps: phone 402 wide, admin, press JAN so the grid starts at 1 Jan; tap the 2 Jan heading (the box is x 127.8 to 147, 19 wide) about 5 px in from its left edge.
Seen: the panel opens "Thu 1 Jan" (PH, Drifter OL). Taps by distance in from the left edge, each in a fresh page: WebKit 2 to 10 px opens 1 Jan, 12 to 16 px opens 2 Jan, 18 px (x 146) opens 3 Jan; Chromium 2 to 5 px opens 1 Jan, 8 to 18 px opens 2 Jan. Centre (9.6 px): Chromium opens 2 Jan, **WebKit opens 1 Jan** (the scripted centre tap of the first run). The hit test at the same point names the 2 Jan heading as the element under the finger.
Expected: any tap inside the 2 Jan heading opens 2 Jan. Other headings do not do it: 1 Jan, 3 Jan, 5 Jan and 2 Jul (also 19 wide) all open their own day over their whole width. Only 2 Jan was found; not every date was swept.
Pictures: `C/fault-jan2-phone-chromium-01-where-the-finger-lands-yellow-box-is-the-2-Jan-heading.png` (red dot = finger, yellow box = the 2 Jan heading), `-03-settled.png` (panel "Thu 1 Jan"), same set for webkit. Engine: both.

**F2. Phone: the day panel fills the screen, so the grid cannot be used behind it (line 23).**
Steps: phone, tap any date heading. Seen: panel 378 wide, 854 high on an 874 screen; content ends about 340 px down, 500 px blank; only a 12 px strip of grid shows at the foot (a swipe on that strip scrolls the grid; a swipe on the panel does not). The names, rows and other headings are all under it, so the next day cannot be picked from the grid without closing it (the panel's own ‹ › step days). Expected (line 23): from the foot, the grid still scrolls behind it. Pictures: `C/s23-phone-chromium-02-open.png`, `-03-after-strip-swipe.png`, WebKit `-01-open-tap.png`. Engine: both. (Whether it should be shorter is the host's call; I only report what the picture shows.)

**F3. (found on the way, belongs to Walker A's lines 3 and 4) The "Approve what I enter" tick cannot be unticked by a mouse click on a desktop, or by a tap in WebKit.**
Steps: admin, open an empty cell's bid window (Saber, 28 Oct or 20 Jul), click the tick or its label. Seen: it stays ticked. Desktop Chromium and desktop WebKit (mouse), and phone WebKit (a tap): no change in four tries each. A log of the page's events shows the press lands on the tick box but the click event is delivered to the window's title bar (`DIV.bidsheet-hd`), so the box never receives it. Phone Chromium with a touch (CDP) does untick it (ticked > unticked > ticked on two presses). Expected: the tick toggles on each press. Pictures: `C/s26p-desk-chromium-01-initial.png`, `-03-after-press.png`, `-05-after-press-2.png` (still ticked), `s26p-phone-chromium-03-after-press.png` (unticked, for contrast). Engines: Chromium desktop, WebKit desktop and phone. Walker A should confirm on their lines; I could not place a pending admin bid because of it, so my line 26 used a member's pending bid.

**F4. (small) The panel's ‹ and › are the browser's default grey buttons,** unlike the ✕ beside them: Chromium bg grey (107,107,107), 2 px white outset border, 28x21 px; WebKit bg (192,192,192), 28x24 px. On a phone that is a 21 to 24 px high tap target. Pictures: `s20-phone-chromium-01-jul15.png` vs `s20-phone-webkit-...` (darker in WebKit's render).

**F5. (small) The desktop panel's first place covers the page's top-right controls:** ⚙, "My leave", Legend and, with Rearrange on, "Done" (`s24-desk-chromium-03-after-heading-tap.png`). It is draggable, so it can be moved; on a phone the same holds for "Done" with the panel up.

**F6. (small) The panel's title and its Away dates carry no year** ("Fri 1 Jan", "15 Jul"). Stepping from Dec 26 into 2027 shows "Fri 1 Jan" while the grid behind stays on the 26 period (`s20-desk-chromium-10-jan01-27.png`), and "Wed 31 Dec" for the uncovered 2025 day. Nothing on the panel says which year.

**Seen in passing (Walker B's ground, not walked):** the new-leave ask's body is drawn in capitals with letter spacing ("ATTACH THE APPROVAL FROM THE LEAVE APP NOW, OR FILE IT AND ATTACH IT LATER.", `s26-desk-chromium-03b-the-ask.png`); the quiet "No document" in the Inputs list row sits against the row's right edge (`s26-desk-chromium-04-after-save.png`).

## Not run / limits

- Line 25 skipped as told. Line 26's refused half: not reachable (above). WebKit swipes: not possible with the driver, so 23's grid scroll behind the panel was tested in Chromium only. The member's "today" for 27 was moved with the developer bridge (`lwSetMemberToday`), as the earlier walks did; every bid and Move was a real press.
- Console errors, page errors, failed requests: none in any run.
