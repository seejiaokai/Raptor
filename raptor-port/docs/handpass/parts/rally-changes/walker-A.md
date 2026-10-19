# Walker A (desktop, mouse) — [RALLY-BOX-CHANGES], 19 Oct 26

Build served: `http://localhost:4312/`, bundle `index-D602A6a_.js` (proved from the served index page). Desktop Chromium 1440×900
(821, 820 and a browser started at 125% for scenario 21). Signed in as the admin. Pictures are in
`raptor-port/docs/img/handpass/2026-10-19-rally-changes/walk/A/` (cited as `A/<name>.png`). Scripts live in the walker's scratch
folder (`C:\Users\User\AppData\Local\Temp\claude\walkA\`), not in the repo. The browser error list (console errors, page errors,
HTTP 4xx) stayed empty in every run.

Conventions the walk used: a Saturday (Sat 18 Jul) is the "Pub Sat"; the SC wave puts a standby R on the SHIFT (all four rows of
a shift share one R; the board draws the box on every row). OIL is read from OIL Earn on the board and from the Leave War cell
(the OIL tracker's weekend credit, FO = full day, HO = half day).

## Verdict at a glance

| Scenario | Result |
|---|---|
| 1 SC MAIN rally earns OIL, both orders | PASS (a, b, c, d) |
| 2 SC SPARE / AVALON / BB earn nothing; the badge flip | PASS |
| 5 flash on a taken suggestion, desktop board | PASS (RECORD: Redo shows no ring; ring stays on the emptied box until its second ends) |
| 8 a redraw mid-flash, two tabs | RECORD — NOT WALKED as written: the two tabs did not sync; forced redraws instead (PASS on those) |
| 9 flash on the Edit Schedule week | PASS |
| 11 standby R by keyboard | PASS (same behaviour as the flying line, board and week) |
| 13 one value on every surface | PASS (board, week, View-only Sched, next-week peek, Excel, print page) |
| 14 Excel export and PDF of standby lines | PASS (print page: read as text and one picture of its top) |
| 15 a published standby R through its life | PASS, with RECORDs (gold-dot bubble not reached; changes window does not say MAIN or SPARE) |
| 17 SC in-time advisory reaching back to the rally | RECORD: it does reach back — same advisory for R as for B; clears with R |
| 21 layout (desktop parts) | PASS for the new cells; RECORD the 821 remarks squeeze (older, hits flying lines too) |
| 22 reload and the error list | PASS |
| Break 1, 2, 3, 7 | PASS (RECORD on `24:00`) |

No fault found that the build introduced. Four notes below are RECORDs for the host to rule on.

## 1. SC MAIN rally earns OIL — both orders

Fixture: Saturday, SC wave, START 08:30, END 14:30 (6 h), a man (Saber) on the first MAIN row's FCP seat, R and B empty.

| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| (a) unpublished, R empty; OIL Earn | half day | Saber HO | PASS | — |
| (a) type R 08:00 | OIL Earn full day | Saber FO | PASS | `A/A01a-R0800-unpublished.png` |
| (a) publish; Leave War cell | full day credited | FO | PASS | — |
| (b) publish with R empty; Leave War | half day | HO | PASS | — |
| (b) type R 08:00 on the published Saturday | pending mark, sign-offs fall, tracker still half | the day's button reads "Publish AL1", the changes list "1 pending", an amber "Not yet signed" chip appears; the R boxes of the shift wear the dotted pending ring; the sign-off line still lists the first version's names but is marked not yet signed; tracker still HO | PASS | `A/A01b-pending-top.png`, `A/A01b-pending-R0800.png` |
| (b) publish the amendment | full day | AL1 chip; tracker FO | PASS | `A/A01b-amended.png` |
| (b) first version's look (Original) | R empty | Original look: R empty, AL1 look: 08:00 | PASS | `A/A15-look-original.png`, `A/A15-look-AL1.png` |
| (c) as (b), Undo before amending | pending clears, OIL never moved | R empty again, the button back to "no change", tracker HO | PASS | `A/A01c-after-undo.png` |
| (d) START 08:30; R and B typed in turn; work hours (Insights) | the earlier of R and B counts | +30 min (R 08:00), +45 (R 08:00 + B 07:45), +60 (R 07:30 + B 07:45); OIL FO throughout | PASS | `A/A01d-R0800-B0745.png` |

## 2. SC SPARE / AVALON / BB earn nothing from R; the badge flip

Published Saturday: a man on the SC SPARE row (Blade), one on AVALON (Cinch), one on BB (Anvil); the three R boxes typed after publishing
(SC 06:00, AVALON 17:00, BB 07:00).

| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| type the three R | each reads pending (a printed time changed) | all three boxes carry "Edited — goes out as AL1"; the button reads "Publish AL1" | PASS | `A/A02-pending-three-R.png` |
| same | OIL Earn, tracker, crew rest / warnings, work hours do not move | OIL Earn (all three "—"), Leave War cells, warning list and the three men's work hours identical before and after | PASS | — |
| SC SPARE man, R 06:00, switch his OIL on in OIL Earn (D24) | the shift's written hours (half day), not from 06:00 | "Blade earns half a day" (HO) | PASS | `A/A02-spare-oil-on.png` |
| flip that row's badge SPARE to MAIN | R now starts his day | OIL Earn FO; work hours +510 min (06:00 to 14:30) | PASS | `A/A02-flipped-main.png` |
| flip back to SPARE | R stops counting | OIL HO, hours back | PASS | — |

RECORD for the host: another chat has just changed the OIL rulings file (D24 now reads "changed by D1042"); scenario 2's "switch the SPARE's OIL on" was walked on the build as served.

## 5. The flash on a taken suggestion — desktop board

Fixture: flying line, TO 12:00, R and B empty (faint suggestions 09:00 and 09:40). Ring read from the box's style and class, timed
with a class observer.

| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| click R | 09:00 placed in the typed colour; plain blue ring; caret after | 09:00; colour identical to the TO box (rgb 241,244,247); inset 2 px blue (30,134,255) ring on; caret after the text, nothing selected | PASS | `A/A05-board-R-just-tapped.png` |
| ring length | about one second, then nothing | on at 28 ms, off at 1236 ms (about 1.2 s); 6 s never seen | PASS | `A/A05-board-R-after-ring.png` |
| type 0830 | replaces | box reads 0830 (saved 08:30), never 09:000830 | PASS | — |
| click B, wait 3 s, type 0745 | placed, ring ends, typing still replaces | 09:40, ring then none, typed 0745 saved as 07:45 | PASS | `A/A05-2-click-B-ring.png` |
| Backspace after the tap | empties | box empty, nothing saved on leaving | PASS | — |
| Escape inside the ring | empty again, faint back, nothing saved | empty with the faint 09:00; nothing saved | PASS | — |
| Escape after the ring ended | RECORD | same result: empty, nothing saved | RECORD | — |
| tap then type 0915 at once | replaces | 0915 saved as 09:15 | PASS | — |
| one Undo, two Undos | the empty box and faint suggestion back | one Undo cleared B, a second R: each back to empty with its faint time | PASS | — |
| Redo | RECORD: ring again? | the value returned, no ring | RECORD | — |

RECORD: after a Backspace or an Escape inside the first second, the blue ring stays on the now-empty box until its second is up
(class still present, box empty). Small and short-lived.

## 8. A redraw replaces the box mid-flash

NOT WALKED as written. Two tabs in one browser context, both signed in, both on Saturday's board, "Sync · 1 s" switched on in both:
a change saved in tab B never reached tab A in 12 s (A kept the old START). The app shows no live tab-to-tab update here, so the
two-tab setup cannot make a redraw. What was done instead, on one tab: tap the faint R, 250 ms later force the board to redraw
through the app's own redraw (once with the data unchanged, once after changing another box of the same line, then a second later
redraw).

| Step | Expected | Seen | Result |
|---|---|---|---|
| redraw 250 ms after the tap | the taken time stays, ring ends, not replayed | box stays the same element, 09:00 kept, focus kept, ring on 28 ms to about 1.2 s | PASS |
| later redraws | no ring replayed | class observer logged nothing | PASS |
| type 0830 after the redraw | replaces; saved | saved 08:30 | PASS |
| tap R while a "Saving…" or "Undid" note is up | no ill effect | 09:10 placed, ring ended normally | PASS |

Picture: `A/A08-after-redraw.png`. The state in which a real sync would replace the box was therefore not reproduced (the redraw kept the
focused box); this is what the host should treat as unreached.

## 9. The flash on the Edit Schedule week (desktop)

| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| click faint R in the week | ordinary colour plus short ring | 09:00, colour equal to the TO box's, ring (inset 2 px blue) on, gone by 1.6 s | PASS | `A/A09-1-click-R-week.png` |
| type 0830, Tab | replaces, saved | 0830; model 08:30 | PASS | — |
| click faint B, wait, type 0745, Tab | same | 09:40 ring then none; typed replaces; saved 07:45 | PASS | `A/A09-week-B-just-tapped.png`, `A/A09-week-B-after-ring.png` |
| open the board | same value, same colour | R 08:30, B 07:45, R colour equals TO colour | PASS | — |

## 11. The standby R by keyboard

| Step | Expected | Seen | Result |
|---|---|---|---|
| board, flying / SC / AVALON / BB: Tab from the callsign | callsign, mission, R, B, TO, LD, remarks (R before B) | identical on all four | PASS |
| Shift+Tab | reverses | LD, TO, B | PASS |
| Enter on R | commits; stays on R as on the flying line | R saved 07:00; focus stays on R, on all four lines | PASS (parity) |
| type a new R, Escape | puts back the previous typed value | box back to 07:00, nothing new saved, on all four lines | PASS |
| week, SC / AVALON / BB: Tab from R | R then START then END | R, TO(START), LD(END), remarks | PASS |
| week: Enter on R; Escape on a new R | RECORD | Enter saves and leaves the box (focus goes to the page); Escape puts the old value back | RECORD |

## 13. One value on every surface

SC MAIN R 07:10 (and an SC B 06:50 typed on the board), AVALON R 17:30, BB R 07:30, a flying line R 08:30.

| Surface | Seen | Result | Picture |
|---|---|---|---|
| board | 07:10 / B 06:50 | PASS | `A/A13-board-all.png` |
| Edit Schedule week | R 07:10, START 07:00, END 13:00; no B for SC (as ruled) | PASS | `A/A13-week-sc.png` |
| View-only Sched | R 07:10 under "R START END"; the flying line prints its suggested brief (09:40), no standby line prints one | PASS | `A/A13-viewonly-top.png` |
| next-week peek (made by building the SC in the week of 20 Jul, then returning to 13 Jul) | heading "R / START" stacked, R 06:45 over START 07:00, END 13:00 | PASS | `A/A13-peek-saturday.png` |
| Excel export | Rally 07:10 on the SC rows, 17:30 AVALON, 07:30 BB (see 14) | PASS | — |
| printed page | same (see 14) | PASS | — |
| type on the week instead (R 07:20), open the board | board 07:20 | PASS | — |

RECORD: the read-only board for a member was not walked here (walker for members). View-only Sched's R boxes are drawn as editable
spans (the same markup as the week); whether a tap there is refused was not tested by this walker.

## 14. Excel export and PDF of standby lines

CSV read from the downloaded file (rows for Saturday; Rally / Brief / TO / Land):

| Moment | Seen | Result |
|---|---|---|
| published Saturday | SC AM rows `07:10 / — / 07:00 / 13:00`; AVALON `17:30 / — / 19:00 / 07:00`; BB `07:30 / — / 08:00 / 16:00`; flying `08:30 / 09:40 / 12:00 / 13:00` (suggested brief printed on the flying line only); SC PM (no R) blank | PASS |
| R changed to 07:20 and B typed on SC (06:50) and BB (07:15), not yet amended | export still carries the issued values: R 07:10, no brief | PASS |
| after publishing the amendment | SC AM `07:20 / 06:50`, BB `07:30 / 07:15`, AVALON unchanged | PASS |
| printed page (the app builds a print document in a hidden frame; its text and the top of the page picture were read) | the same values: SC AM R 07:20, brief 06:50; BB R 07:30, brief 07:15; AVALON R 17:30, no brief | PASS (`A/A14-print-saturday.png` shows only the top of the page; the Saturday rows were read as text) |

RECORD: the actual print dialog / saved PDF was not produced (headless); the print document the app generates was read instead.

## 15. A published standby R through its life

| Step | Expected | Seen | Result | Picture |
|---|---|---|---|---|
| Undo's words after changing R | "a rally time" | button reads "Undo — a rally time" | PASS | — |
| changes window ("1 pending") | names Rally on the SC line | "To go out — AL1": "SC · rally 08:00", with the person, date and time | PASS | `A/A15-pendlist.png` |
| same, MAIN or SPARE named? | RECORD | it does not say MAIN or SPARE (names the shift's line, "SC") | RECORD | same |
| gold-dot bubble jumps to the R box | RECORD | with the window open, small gold dots show on R, START and the man's puck; clicking the R box's corner opened nothing — not reached | RECORD | same |
| amend | AL mark on R | after the amendment the AL1 chip; the AL1 look shows 08:00 | PASS | `A/A15-look-AL1.png` |
| first version's look | old R | Original look: R empty, read-only | PASS | `A/A15-look-original.png` |
| roll the day back (the "Unpublish" button) | R and OIL return | OIL back to the first version (HO); the working copy keeps R 08:00 as a pending edit ("1 pending", chip ORIG) | PASS (RECORD: R is not wiped from the working copy — it is correct for "pull back to correct it") |

## 17. The SC in-time advisory reaching back to the rally

SC MAIN START 09:00, the same man also on the SDO desk 07:30 to 08:30.

| State | Seen | Result |
|---|---|---|
| no R, no B | no advisory | — |
| R 07:00 | "Fable reports 07:00 for SC AM — SDO duty (07:30–08:30) cuts into the in-time window before the 09:00 start" | RECORD (it does reach back) — `A/A17-R0700-warnings.png` |
| R cleared | advisory gone | PASS |
| B 07:00 instead | same advisory, same words | RECORD — `A/A17-B0700-warnings.png` |

## 21. Layout at the edges (desktop parts)

Measured with element rectangles on every board line, plus the week, then pictures.

| Size | Seen | Result | Picture |
|---|---|---|---|
| 1440 | SC / AVALON / BB R, B, TO, LD boxes on the same row and size (52×25) as the flying line; no overflow | PASS | `A/A21-d1440-board-sc.png` |
| 125% browser (started at 125%, page width 1440 CSS px, devicePixelRatio 1.25) | R box top within 1 px of the callsign box on every line; no overflow | PASS | `A/A21-d125-board-sc.png` |
| 820 wide | stacked phone layout: R over B, TO over LD; standby identical to flying; nothing outside the line | PASS | `A/A21-d820-board-sc.png` |
| 821 wide | R, B, TO, LD level with the callsign on the standby lines; the remarks box is squeezed to 16 px wide on EVERY line, flying included | RECORD — older, already filed as [BOARD-NARROW-DESKTOP-REMARKS] per the earlier job's note | `A/A21-d821-board-sc.png` |
| week at all four sizes | standby R over START in a 48 px cell, no overflow | PASS | `A/A21-d821-week-sc.png`, `A/A21-d820-week-sc.png`, `A/A21-d125-week-sc.png` |

Not walked: the phone sideways size (not mine).

## 22. Reload and the error list

Four lines with R typed, the day published, one SC R and one BB B typed afterwards (pending), then a reload: every R and B identical
(model and boxes, board and week), the pending button still "Publish AL1". Error list empty across all runs. PASS.

## Break tests

| Test | Seen | Result |
|---|---|---|
| 1 junk into SC MAIN R: `abc`, `7`, `0 7 1 0`, `07:10am` | each is refused (the box ends empty, nothing saved); the flying R and AVALON R do the same; no warning, work hours unchanged | PASS |
| 2 `25:90` | refused, as on a flying R | PASS |
| 2 `24:00` | accepted and saved as 24:00 on SC MAIN, AVALON and the flying line alike; on the flying line it is read as 00:00 and Blade's day becomes "00:00 to 15:00" long-day warning; on SC MAIN nothing moved (a later R counts for nothing) | RECORD (the same on the flying line is older) |
| 3 SC MAIN START 06:00, R 08:00 (later) | day still starts 06:00; OIL FO unchanged; work hours unchanged; no out-of-order warning | PASS — `A/A-break3-later-R.png` |
| 7 R 05:00 typed, START cleared, then restored | no crash, R still shown; with no START the shift counts for nothing ("the SC shift has no usable times — nobody on it earns OIL"); restoring START brings the count back | PASS — `A/A-break7-start-cleared.png` |

## Other things seen (not findings)

- A typed time on the board (`0830`) is shown as typed until the page redraws, and on an SC shift the other three rows' R/B/START boxes
  show the old values until a redraw (reload shows all four rows alike). The same happens for START on an SC shift, so it is older.
- The previous job's picture folder names were not reused.

## Faults found

None attributable to this build. Items for the host's ruling are the RECORD lines above: the ring staying on an emptied box (5),
the changes window not saying MAIN or SPARE (15), the gold-dot bubble not reached (15), `24:00` accepted (2), the 821 squeeze (21).

## Not walked, and why

- Scenario 8's two-tab sync: the app showed no live update between two tabs.
- The gold-dot bubble's jump to the R box (15): the dot could not be found as a clickable thing.
- The real print dialog / saved PDF file (14): headless; the print document was read.
- Phone-sized and member-account parts of every scenario: not this walker's.
