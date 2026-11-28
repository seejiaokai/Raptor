# Walker a — round 4 of the words pass: the bell's words (A1–A8), 24 Nov 26

The build under test was NEW (`D:/rw4/build-new`), bundle `index-2uyEcUJu.js`, logged in every world. Saber made every change on the desktop through the app's own controls. Ranger read each result on the phone (Chromium 402×874) and on the desktop (1440×900), and Hex read it on the phone. A8 was also walked in WebKit 402. Pictures: `docs/img/handpass/2026-11-24-words-r4-walk/a/<run>/`. Logs: `.tmp/wr4-a/<run>.log` and `.json`.
Cited runs: a1-r2, a2-r1, a34-r1, a5-r1, a6-r1, a6g-r3, a7-r3, a8-r1, sweep-r1, tap-r1. a1-r1 (Hex signed in with the wrong name), a6g-r1/r2 and a7-r1/r2 are earlier attempts, labelled as such and not cited.
**Totals: PASS 56 · FAIL 0 · RECORD about 90 · NOT WALKED 3.** Console errors, page errors and failed requests: none in any cited run.

## A1 — a kind change, no title (a1-r2)
- PASS on the phone. Ranger read bold "OL" "Wed 15 Jul" / "LL changed to OL · Saber" (`A1-ranger-bell-phone.png`).
- PASS. On the group LL (Ranger and Hex, Fri 17 Jul), Ranger read "LL changed to OL · Saber" on the phone and on the desktop (`A1-ranger-bell-desk.png`), and Hex read the same words (`A1-hex-bell-phone.png`).
- PASS. Saber's own bell held no line for the change (D769); his list was empty (`A1-saber-bell-desk.png`).
- Tap (tap-r1): a tap on the line opened that input's own window (type OL) with the Inputs page behind it. RECORD. The "right after the tap" pictures and the settled ones show no tint and nothing shifted (`A1-tap-*-pressed-phone.png` / `-settled-phone.png`).

## A2 — a kind change on a titled input (a2-r1)
- (i) "Brief": PASS. Bold "Brief", "Training changed to Meeting · Saber", for Ranger on the phone and the desktop and for Hex (`A2i-*.png`).
- (ii) "Meeting": PASS. "Training changed to Meeting · Saber", no "renamed" (`A2ii-ranger-bell-phone.png`). The saved input now has no title; it was dropped at the save because it matches the kind's name.
- (iii) "meeting": RECORD. Bold "Meeting", line 2 "Training changed to Meeting, renamed — was meeting · Saber" (`A2iii-ranger-bell-phone.png`). The title "meeting" was dropped at the save (it matches the kind, whatever the capitals), so the line says "renamed" although nobody touched the title. **This is for the host to judge against Q1.**
- (iv) "Training · Safety": PASS. "Training changed to Meeting · Saber", no "renamed", title kept (`A2iv-ranger-bell-phone.png`).

## A3 — a kind change that adds or drops what a kind has (RECORD; a34-r1, phone and desktop the same)
- (a) Training "Range brief" → LL: "LL Wed 15 Jul / Training changed to LL, renamed — was Range brief · Saber". The title was dropped; times stayed 09:00–10:00.
- (b) save 1: "LL Mon 13 Jul / Now LL (AM) · Saber". Save 2 (AM LL → Training): "Training Mon 13 Jul / Now 00:00–12:00, LL changed to Training · Saber".
- (c) Training 00:00–12:00 → LL: "Now LL (AM), Training changed to LL · Saber". The app made it a half day by itself.
- (d) all-day LL → OL and AM in one save: "Now OL (AM), LL changed to OL · Saber".
- (e) Attach "Exercise Kite", To "145 Sqn" → Training: "Exercise Kite Fri 17 Jul / Taken out of Unavailable, Attach changed to Training, and 1 more change · Saber". The saved input before and after each change is in `.tmp/wr4-a/a34-r1.json` (A3 verdicts).

## A4 — a real rename (a34-r1)
- PASS on the phone and the desktop: "Range brief Mon 20 Jul / Renamed — was Training · Saber". Note: the saved input had NO title before this save, because the filed title "Training" equals the kind and was dropped at filing. So this run is in effect "a title given", and its words happen to equal the ruled ones.
- RECORD, title given ("Sim"): "Renamed — was Training · Saber". Title taken away ("Brief"): "Training Wed 22 Jul / Renamed — was Brief · Saber".
- RECORD, an Attach's "To" changed: bold "Exercise Kite · 146 Sqn", "Renamed — was Exercise Kite · 145 Sqn · Saber". "To" given: "Exercise Hawk · 145 Sqn / Renamed — was Exercise Hawk · Saber".

## A5 — the half day (a5-r1; every line the same on the phone and the desktop)
- PASS "Now LL (AM) · Saber" · PASS "Now LL (PM) · Saber" · PASS "Now all day · Saber" · PASS "Now Thu 16 Jul (AM) · Saber" (`A5-ranger-bell-phone.png`, `-desk.png`).
- RECORD, AM → Custom 09:00–11:00 (the window allows it): "Now 09:00–11:00 · Saber". RECORD, an AM leave only moved: "LL Wed 22 Jul / Now Wed 22 Jul · Saber" (no "(AM)").
- PASS, a Training typed 00:00–12:00: "Now 00:00–12:00 · Saber", never "(AM)".
- Sweep (sweep-r1, Saber and Ranger alike). AM/PM is offered on LL, OL, OIL, CCL, PL, FCL, EL, CL, HL, OML, ATT C and ATT B. There is no SANS Availability kind in this window. The Title box is on Training, CSE, Meeting, Attach, Personal, Appointment, Duty, Event, OD and Other.
- PASS on HL (a medical kind), all day → AM: "Now HL (AM) · Saber".
- **No kind has both a Title box and AM/PM, so there is no door to a titled half day ("Now AM").**

## A6 — three or more changes in one save (a6-r1, a6g-r3)
- (a) PASS on the phone and the desktop: "Range brief Thu 16 Jul / Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber".
- (b) PASS: "Now Fri 17 Jul, renamed — was Training · Saber", with no "more".
- (c) PASS (it ends "and 2 more changes"). The whole line: "Now Thu 16 Jul, Ace added, and 2 more changes · Saber". The person added is said second and the rename is counted, not said. Callsign capital kept.
- (d) PASS: Ranger reads "Meeting Fri 17 Jul / Hex taken off, Training changed to Meeting, and 1 more change · Saber". Hex reads only "You were taken off · Saber" (PASS).
- (e) RECORD: "Now Tue 21 Jul, 3 people added, and 1 more change · Saber".
- (f) RECORD, only the remark: "Remark changed · Saber". RECORD, a leave's dates extended with its "till" tick left ticked: "Now Thu 23 Jul – Fri 24 Jul · Saber", then "Now Thu 23 Jul – Mon 27 Jul · Saber". No remark change was said or counted (PASS against D953).
- (g) RECORD: one save of the window cannot cancel an input. Its buttons are ✕, the people pucks, Delete, Cancel and Save, with no cancel-the-input control (`A6-g-window-desk.png`).
- (g) NOT WALKED: the schedule's own cancel. Three tries: (1) Edit Schedule had no CX on the input's row; (2) the Board opened from the Inputs page drew nothing; (3) the Board opened from Edit Schedule showed CX only on other rows. The script could not find the input's row's CX.

## A7 — every door (a7-r3; Ranger on the phone and the desktop and Hex on the phone read the same)
- (i) the Inputs list's row → window: "Door list Mon 13 Jul / Now 08:00–10:00 · Saber".
- (ii) the calendar's day card: "Now 08:00–10:00 · Saber" (the baseline). (iii) Edit Schedule's pencil → window: the same words.
- In-place start box on Edit Schedule's row: the same words; the passing note read "Input updated". A shared input of two draws ONE row on Edit Schedule (keyed to Hex, showing both men), so there is no single man's row to change. Both Ranger and Hex were told.
- (iv) the Scheduler Board's pencil and its in-place start box: **NOT WALKED.** The script could not press the pencil after 3 tries; the board was open on Thu 16 with its Personal Inputs panel below the fold (`A7-iv-board-nowindow-desk.png`). The script's failure, not the app's.
- A bar dragged on the Inputs calendar and taken back by Escape mid-carry: no question was asked, nothing changed, no line (PASS).
- Dropped on Tue 21: no question, note "Moved to 21 Jul", line "LL Tue 21 Jul / Now Tue 21 Jul · Saber".
- An AM leave dragged: "LL Thu 23 Jul / Now Thu 23 Jul · Saber" (no "(AM)", as in A5).
- (v) A tap on Ranger's bell line opens that input's window on the Inputs page (`A7-v-bell-tap-desk.png`). No change was made through it.

## A8 — the long line (a8-r1; 11 lines in the list)
- PASS on Chromium 402, WebKit 402 and the desktop: A6 (a)'s line 2 is two lines in its box (307px wide on the phone, 308 in WebKit, 269 on the desktop), whole, with "· Saber" shown (`A8-top-phone.png`, `A8-top-wk.png`, `A8-top-desk.png`).
- PASS on all three: nothing cut with "…" or clipped (names included); the age overlaps no words and no dot; no sideways scroll of the list or the page; "Mark all read" not covered; the "↓ 4 more" foot not covered.
- Scrolled to its foot, the list moved (scrollTop 163 on the phone, 180 on the desktop) and "↓ N more" then went away (`A8-foot-*.png`). On the phone the list's scroll was set directly (the touch scroll is not proved here); on the desktop it was a mouse wheel.
- RECORD, the longest case (40-letter title, 29 Jul → Thu 30 Jul–Mon 3 Aug, start 08:00, remark): "Advanced range safety procedures brief 1" "Thu 30 Jul" / "Now Thu 30 Jul – Mon 3 Aug 08:00–10:00, renamed — was Training, and 1 more change · Saber". Line 2 is 2 lines on the phone and in WebKit, 3 on the desktop. A6 (c) is 2 lines everywhere.
- RECORD, look: in WebKit line 1 of the 40-letter case wraps its date ("Thu 30 / Jul"); on the desktop the name breaks before its last word ("brief / 1 Thu 30 Jul"). Nothing is cut either way.

## Findings
None against an EXPECTED line. For the host to judge (RECORD):
(1) A2 (iii): a title that matches the new kind ("meeting") is dropped by the save, and the line then says "renamed — was meeting", although nobody touched the title (`a2-r1/A2iii-ranger-bell-phone.png`).
(2) A3 (c): changing a Training typed 00:00–12:00 to LL makes it a half day by itself ("Now LL (AM), …").

To check, not a finding: in the input window on the phone, the footer line "Placed by Ranger · … · changed by Saber · 24 Nov 26," seems to run off the box's right edge (`tap-r1/A1-tap-line-settled-phone.png`). It was not measured.

## Not walked
A6 (g) the schedule's own cancel; A7 (iv) the Board's pencil and its in-place start box (both: three tries each, the script could not reach the control); A7 the cancel-at-question of a drag (no question is asked; Escape was walked instead).

## The lessons line (§7.11)
1 — each line kind × each reader (Ranger and Hex), × phone / desktop / WebKit. 3 — the passing note read after each save and the bell read after each act. 9 — the bell list measured row by row, every kind of row, phone and desktop (A8). 16 — not mine: no refusal at a box (C1's). 22 — fit judged by drawn boxes: each row's line-2, age and dot boxes, plus elementFromPoint on the foot. 23 — a tap on a line opens that input's own window, Inputs behind (A1 tap, A7 v). 25 — the change made through every door I could reach (A7), on leave, medical and timed kinds (A5 sweep). 28 — the bell list was shown on screen before anything in it was pressed. 30 — the phone tap pictures in `tap-r1`. The other lessons cover gestures, layout or motion this change does not touch; I agree.
