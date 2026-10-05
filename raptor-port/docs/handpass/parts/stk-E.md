# Walker E - the Codex stack walk (5 Oct 26) - report

Build walked: the frozen preview on http://localhost:4221. Admin `ad`/`a` and member `us`/`us`. Pictures: `raptor-port/docs/img/handpass/2026-10-05-codex-stack/E/` (352 files). Scripts: `raptor-port/scripts/handpass/stk-E-*.mjs`. Results with every figure: `raptor-port/docs/handpass/parts/stk-E.json`.
Method: a scripted real browser, desktop 1440x900 and phone 390x844 (touch emulation), plus 1280x700, 844x390, 390x568, 820/821 where the scenario names a short or crossing size. The phone swipes are real touch events sent through Chromium's own touch input; taps made after a swipe had to be mouse clicks, because in this emulation a touch tap straight after a CDP swipe produces no click (a control test with a plain vertical swipe behaved the same, so that is the harness, not the app).

## Verdicts

| Scenario | Size | What I did (the controls) | What the screen said | Verdict | Pictures |
|---|---|---|---|---|---|
| P4a-01 | both | Two fresh sessions: Tracker then Leave War, and Leave War then Tracker; Leave War settings sheet, Tracker Details and File menu operated | Same computed look (font, size, colours, padding, box size) for the Tracker's course picker and the Leave War's picker in either order and after both were loaded (e.g. Tracker course box 89x30, Arial 12.5px; Leave War picker 121x30, 12px 600) | PASS | `001..010-p4a01-*`, `011..014-p4a02-*` (cited by name in the json) |
| P4a-02 | both | Sign-in card; an unapproved identity; Request access filled and sent; waiting screen; admin visit to the scheduler and sign out; card again | Card box identical before and after a scheduler visit (544,374 352x231 desktop; 19,152 352x231 phone); no "Sign up" anywhere; Send request lands; waiting screen reads "Your request is with the admins"; no sideways scroll. The guest door only appears on the waiting screen once the admin ticks Guest view (see P4b-06). Not walked: the suspended-account screen | PASS (suspended screen NOT WALKED) | `011..014-p4a02-*` |
| P4a-03 | both | Built Saturday through the controls; hid one warning with its cross; selected a puck; signed four and Published; edited a mission (1 pending); looked at the issued Original; OIL Earn mode; the week face of the day | Warning list of 3 lines, one struck/hidden; every measured puck is what a finger lands on (7 desktop, 3-9 phone per view); issued preview draws frozen with the signed line "ORIG Ace Basher Bolt Cinch"; OIL bars/items drawn (1 bar, 41 items) and Publish AL1 / Unpublish / "Not yet signed" / "1 pending" all present; no mark painted over another | PASS | `001..007-p4a03-*` |
| P4a-04 | both | Inputs page: filed a plain leave and a medical (OML) with a PNG attached through Document; All dates; sorted; person filter + search; row editor; calendar day sheet; Medical view and the viewer (Zenith, 2 documents, pager 2 of 2); Quals scroll and Enable editing | 48 rows; headings 0px off their columns (desktop table); last row reaches the screen; filters narrow 48 to 2; pencil lands and opens the editor; Quals frozen heading row stays at the top while the page scrolls 435px and each heading sits over its column; viewer opens with the document. Phone shows cards, no sortable headings | PASS (but see F3 for the phone card) | `001..010-p4a04-*`, `001/002-docviewer-*` |
| P4a-05 | both | Logic: search "report", every filter, empty result, clear; Help: filled and sent a report; Admin: find box, a person row, config, Data with a date (pressed Clear old clutter) | Logic 75 > 12 of 75 for "report", filters 2/4/1/..., restored to 75; Help report appears in the list; Admin find "Rang" shows 1 row and the row opens; Clear old clutter said "No old clutter in that period" (nothing to clear, no destructive step) | PASS | `011..019-p4a05-*` |
| P4a-06 | both | Plans menu (made an Alt plan), day templates (saved Wednesday as a template, opened the window), changes window, ALL AVAIL window (moved by its grip, resized by its corner), week calendar, amendments box, duty/wave templates incl. the nested "new wave template", each at full size and at 1280x700 / 844x390 | Every window opens whole at both sizes: box on screen, readable body, last row reachable, close lands; ALL AVAIL moved 166px left / 82px down and resized 212x540 to 186x610; amendments box on desktop reads "1 day with changes to publish ... Publish AL1" and has no Discard marks; on the phone it is not drawn under 821px | PASS | `001..020-p4a06-*` |
| P4b-01 | phone | Saturday with every section populated; More > Desktop layout; each of the 10 sections scrolled into view and pressed | 5.notes 816x125, prog 816x242, waves 816x1121, duty 816x765, sims 816x442, ground 816x295, inputs 816x153 (after opening), avail 816x242, sans 816x88, unav 816x88 - all drawn, first control in each is what a finger lands on; SANS and Unavailable are empty lists today | PASS | `001..010-p4b01-*` |
| P4b-02 | phone | Real touch swipes from the schedule body, from the title strip and from the day-chip row; taps at the far-right (remarks) and far-left (callsign) fields | Swipe on the schedule body: 14px of 790. Title strip: 299 / 584 / 790px - Done comes into view at x=352; far-right field and far-left callsign take the caret. A swipe on the day-chip row panned 285px AND moved the board from Saturday to Thursday | FAIL (F1, F2) | `011..015-p4b02-*` |
| P4b-03 | phone | Published Original, edited the mission, published AL1; plan menu; looked at each version; Back to live copy | Menu lists "Original" and "AL1", both read only; frozen previews carry VIPER, FAMILY DAY and "WEEKEND - NO FLYING"; Original's line-1 mission is blank, AL1's is ACM; board stays 860px wide; back on the working copy 82 fields are editable and nothing is frozen | PASS | `001..004-p4b03-*` |
| P4b-04 | phone | Wednesday, scrolled low by touch (1740px); Phone > Desktop > Phone; 820 / 821 / 390 crossing; Done panned into view | Day stays Wednesday (SBDAY 2) at every step; board drawn at 820, 821 and back at 390; Done lands and returns to Edit Schedule. Scroll position goes back to the top on a layout change (O6) | PASS | `001..008-p4b04-*` |
| P4b-05 | phone 390x568 | Swiped the schedule, panned to the crew column, swiped the crew list, swiped the schedule again; put a crew puck on an empty seat; Phone layout CREW tab open and close | Schedule scrolled 0>235 with crew list at 0; crew list scrolled 0>265 (range 908 vs 304) with schedule at 235; schedule swipe left crew at 265; puck "dj" landed in seat 5.1.0.1.p; CREW drawer left 391>134>391 | PASS | `005..008-p4b05-*` (numbered 028..031 in the folder) |
| P4b-06 | phone | After the Desktop layout: Done, drawer > Switch to member view; Tab x40 + typing; a real member; a guest (admin ticks Guest view, new identity requests access, "view schedule") | Member view: board gone, 0 editable fields, Tab never lands in the board, schedule unchanged, no Edit Schedule door; real member: no door, no board; guest: schedule only, 0 editable fields, no door | PASS | `032..036-p4b06-*` |
| P4e-01 | both | New chart "E WALK CHART" through + Add syllabus; + Flight x2, + Test, + Acad, + Sim; Flow (zoomed with +), Details, Edit chart layout (zoomed by wheel) | In every mode 2 flights carry the wing and 3 events keep their plain symbol; each flight label sits fully on the wing (0 sampled ink pixels off the shape); edit-mode zoom 75>138>36px; label text passes pointer events to the ball | PASS | `001..006-p4e-*`, `p4e-*-closeup-*` |
| P4e-02 | both | Marked flight for student A (Marginal); pressed the wing wedge; marked B (DCO); back to A; pressed the label text | Wing press landed on the ball, switched to student B, opened no pop-up; A keeps Marginal, B has DCO; pressing the label opens the mark pop-up like the ball | PASS | `007/008-p4e-*` |
| P4e-03 | both | Custom label WNG-7 and font 9, Save changes; File > Export; reload; member account; File > Import of that backup | Stored chart equal after reload and after import; member sees the same labels; backup contains the chart (466 KB) and WNG-7 | PASS (O7) | `009..011-p4e-*` |
| P4e-04 | both | Logic scrolled 1400px; search; all five filters; empty result; clear; 320/390/820/821/1440 | Bar stays directly under the top bar (y 57 desktop, 49 phone); 7 controls land; phone bar <=115px; counts 75>12 and back; no sideways scroll at any width | PASS | `001..003-p4e04-*` |
| P4e-05 | both | Admin set the step to 1h10; member view through the badge / drawer; Tab x20; real member; admin again | Member view: no Edit rules button, 0 fields, sentence reads 1h10; Tab never reaches a rule field; real member sees 1h10 read only; admin sees 1h10 still (then reset) | PASS | `001..004-p4e05-*` |
| P4e-06 | both | Insights from View-only, Edit Schedule and the Board (direct button on a desktop, the three ⋯ menus on a phone); Show all; scrolled to the bottom (2073/2073); cross pressed | Cross on screen and what a finger lands on every time (x976 y88 desktop); window closes and the starting surface (page / Wednesday-Saturday board) is back | PASS | `008..010-p4e06-*` |
| P4e-07 | both | Insights, Duty templates and the empty Day templates window at 390x844, 390x568, 844x390 (phone) and 1440x900, 1280x700 (desktop) | Phone 390 wide, at 844 and at 568 high: tall Insights top 24px, bottom edge at the screen foot (820 / 544px tall); short Day templates 191px tall with 0 gap below (at the bottom); Duty templates 427px tall at the bottom, close reachable. 844x390 is above 820px so windows are centred with a 31px gap (O8). Desktop windows centred and inside | PASS | `005..013-p4e07-*` |
| P4e-08 | both | Each of the 13 surrounds: press inside, drag out, release; then press/release on the surround | All pass: still open after the drag, closed by the surround press: duty, wave, day templates, saved plans, document viewer, input editor, day details, Traffic, Insights, cancellation (CX), Sort all, week calendar - 12 on desktop, the drawer as the 13th on the phone (13/13) | PASS | `001..026-p4e08-*` |

## Findings

**F1 (P4b-02) - the Desktop layout on a phone does not pan from the schedule.** Phone 390x844, Saturday board, More > Desktop layout. A real sideways swipe begun on the schedule (y 130-800) moves the board 0-14px of 790; only a swipe begun on the thin title strip (y about 20-60) pans (275-299px a time). The scroller around the schedule has overscroll-behaviour contain, so the swipe does not pass up to the board. Expected: panning from anywhere. Pictures `011-p4b02-phone-wide-left-edge`, `012-p4b02-phone-wide-panned-by-top-bar`. Confirm on the iPhone: this is Chromium's touch behaviour.

**F2 (P4b-02) - panning along the day chips changes the day.** Same board; a leftward swipe along the Mon-Sun chip row pans 285px and moves the board from Saturday to Thursday; repeated swipes walked it Sat > Thu > Sun... > Mon. The title-strip swipe does not do this. Picture `015-p4b02-phone-wide-after-swipe-on-day-chips`.

**F3 (phone Inputs list) - the OIL chip sits on top of the date and time.** Phone 390x844, Inputs > All dates, the card of an input credited OIL (Torch, Training, 18 Jul 11:00-12:00): the green OIL chip overlaps the time text by 37x12px and hides part of the date. Pictures `oilchip-phone-torch-row`, `002-p4a04-phone-inputs-last-row`. (Desktop table: its own column, no overlap seen.)

Smaller observations (not failures): O1 Quals date box is the browser's default grey inset box (no style rule exists for it); O2 Admin > Squadron config order lists show the position number against the name ("Overall notes1", no rule exists for it); O3 a change of background tone below short pages (Inputs, Help, Admin Data); O4 passing toasts lie over windows on the phone for a few seconds; O5 the Tracker opens with the first ball centred and a wide empty band above; O6 a layout switch returns the phone board to the top of the day; O7 at font 9 an 8-character flight label slightly leaves the wing (15 of 334 sampled pixels); O8 844x390 windows are centred, not strip/bottom.

## Every-screen table (looks whole = nothing cut off, overlapping, unstyled, off screen, two-row bar or sideways-scrolling page)

| Screen | Desktop 1440x900 picture | Phone 390x844 picture | Desktop | Phone |
|---|---|---|---|---|
| Sign-in card | 001-desktop-sign-in-card | 001-phone-sign-in-card | looks whole | looks whole |
| View-only Sched | 002-desktop-view-only-sched | 001-r2-phone-view-only-sched | looks whole | looks whole |
| View-only Insights window | 003-desktop-insights | 005-phone-insights-from-view-only-more-menu | looks whole | looks whole |
| View-only phone menu (one item) | n/a | 004-phone-view-only-sched-more-menu | n/a | looks whole |
| Week calendar | 004-desktop-week-calendar | 003-r2-phone-week-calendar | looks whole | looks whole |
| Phone drawer (no WEEK section) | n/a | 003-phone-phone-drawer | n/a | looks whole |
| Edit Schedule | 005-desktop-edit-schedule | 007-phone-edit-schedule | looks whole | looks whole |
| Edit Schedule phone menu | n/a | 009-phone-edit-schedule-more-menu | n/a | looks whole |
| Amendments box | 006-desktop-amendments-box, 015-p4a06-desktop-amendments-box | 008-phone-amendments-box (not drawn under 821px by its own rule) | looks whole | not drawn on a phone, by design |
| Saved plans menu | 007-desktop-saved-plans-menu | 010-phone-saved-plans-menu | looks whole | looks whole |
| Day details window | 008-desktop-day-details-window | 011-phone-day-details-window | looks whole | looks whole |
| Day template menu | 009-desktop-day-template-window | 012-phone-day-template-window | looks whole | looks whole |
| Scheduler Board | 010-desktop-scheduler-board | 013-phone-scheduler-board | looks whole | looks whole |
| Board, Desktop layout on the phone | n/a | 015-phone-scheduler-board-desktop-layout, 016 (panned) | n/a | looks whole (toolbar/Done 790px right; F1, F2) |
| Board menu | n/a | 014-phone-scheduler-board-more-menu | n/a | looks whole |
| Board Insights | 011-desktop-scheduler-board-insights | 017-phone-scheduler-board-insights-board-more | looks whole | looks whole (hint toast over the foot) |
| Changes window | 012-desktop-changes-window | 018-phone-changes-window | looks whole | looks whole |
| Traffic window | 013-desktop-traffic-window | 019-phone-traffic-window | looks whole | looks whole |
| Board saved plans menu | 014-desktop-board-saved-plans-menu | 020-phone-board-saved-plans-menu | looks whole | looks whole |
| Board OIL Earn (published day) | 006-p4a03-desktop-board-oil-earn | 006-p4a03-phone-board-oil-earn | looks whole | looks whole |
| Board highlight chips | 001-desktop-board-highlight | 022-phone-board-highlight | looks whole | looks whole |
| Board New input sheet | 001-newinput-desktop-board-new-input-sheet | 002-newinput-phone-board-new-input-sheet | looks whole | looks whole |
| ALL AVAIL window | 010-p4a06-desktop-all-avail-window-full | 010-p4a06-phone-all-avail-window-full | looks whole | looks whole |
| Inputs list and form | 017-desktop-inputs-list-and-form | 023-phone-inputs-list-and-form | looks whole (O3) | looks whole |
| Inputs card with an OIL credit | n/a (table) | oilchip-phone-torch-row | n/a | BROKEN: OIL chip painted over date and time (F3) |
| Inputs calendar | 018-desktop-inputs-calendar | 024-phone-inputs-calendar | looks whole | looks whole |
| Inputs period picker | 020-desktop-inputs-period-picker | 026-phone-inputs-period-picker | looks whole | looks whole |
| Medical view | 019-desktop-medical-view | 025-phone-medical-view | looks whole | looks whole |
| Medical document viewer | 001-docviewer-desktop-zenith-2-documents | 002-docviewer-phone-zenith-2-documents | looks whole | looks whole |
| Quals | 021-desktop-quals | 004-r2-phone-quals | grey default date box (O1) | same (O1) |
| Logic | 022-desktop-logic | 005-r2-phone-logic | looks whole | looks whole |
| Logic scrolled | 023-desktop-logic-scrolled | 006-r2-phone-logic-scrolled | looks whole | looks whole |
| Leave War grid | 024-desktop-leave-war-grid | 030-phone-leave-war-grid | looks whole | looks whole |
| Leave War one-day sheet | 002-desktop-leave-war-one-day-sheet | 007-r2-phone-leave-war-one-day-sheet | looks whole | looks whole |
| Leave War Settings | 026-desktop-leave-war-settings | 032-phone-leave-war-settings | looks whole | looks whole |
| Leave War OIL tracker | 027-desktop-leave-war-oil-tracker | 033-phone-leave-war-oil-tracker | looks whole | looks whole |
| Tracker Flow | 003-desktop-tracker-flow | 008-r2-phone-tracker-flow | looks whole (O5) | looks whole (tiny labels at 40%) |
| Tracker Details | 029-desktop-tracker-details | 035-phone-tracker-details | looks whole | looks whole |
| Tracker Edit chart layout | 030-desktop-tracker-edit-chart-layout | 036-phone-tracker-edit-chart-layout | looks whole | looks whole |
| Help | 031-desktop-help | 037-phone-help | looks whole (O3) | looks whole |
| Admin Users | 032-desktop-admin-users | 038-phone-admin-users | looks whole | looks whole |
| Admin Squadron config | 033-desktop-admin-squadron-config | 039-phone-admin-squadron-config | numbers glued to names (O2) | same (O2) |
| Admin Duty templates window | 034-desktop-duty-template-window | 040-phone-duty-template-window | looks whole | looks whole |
| Admin Day templates window | 035-desktop-day-template-window-admin | 041-phone-day-template-window-admin | looks whole | looks whole |
| Admin Wave templates window | 036-desktop-wave-template-window | 042-phone-wave-template-window | looks whole | looks whole |
| Admin Data | 037-desktop-admin-data | 043-phone-admin-data | looks whole (O3) | looks whole |
| Request access / waiting | 012/013-p4a02-desktop-* | 012/013-p4a02-phone-* | looks whole | looks whole |

(Picture files carry a leading serial number in the folder; the names above are the part after it. The sideways-scroll check of the page itself found no screen whose document scrolls sideways.)

## Errors seen
None: no console error, page error or 4xx in any of the sessions (every run printed an empty error list). The forced-save-failure recipe belongs to the P5 walkers and was not used.

## Not walked, and why
- A real iPhone (Safari bars, hardware keyboard, real fling momentum): F1/F2 and P4e-07 are Chromium emulation only.
- P4a-02: the suspended-account screen.
- P4a-03: "long callsigns" used the longest in the demo (Sidewinder, Wildcard), no extra-long name was made.
- P4b-05: a crew puck was placed on the Desktop layout only; on the Phone layout the CREW drawer was opened and closed but not used to place.
- P4a-05: Help has no search or filter, so none was tried.

## Counts
352 pictures saved; about 155 opened and looked at (every picture cited in a table row above, plus the first frame of each walk). Not individually opened: the short-height twins in P4a-06 and P4e-07, 8 of the 10 P4b-01 section frames (their figures are in the json), the intermediate frames of P4e-08 (24 of 26), and some P4a-01 frames.
