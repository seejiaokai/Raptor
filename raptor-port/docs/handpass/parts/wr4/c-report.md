# Round 4 words walk — walker c (the passing notes), 24 Nov 26
Build: NEW `D:/rw4/build-new`, bundle `index-2uyEcUJu.js` in every world (logged per world). OLD not used (no control needed).
Pictures: `docs/img/handpass/2026-11-24-words-r4-walk/c/<run>/` — runs named below. Scripts `scripts/handpass/wr4-c-*.mjs`.
Console errors, page errors, failed requests: none in any run (every `facts.json`).
Tally (final runs): 96 PASS · 0 FAIL against an EXPECTED line · 1 FINDING on a RECORD case (2 engines) · 1 surprising RECORD ·
about 35 RECORD · 2 NOT WALKED. Script FAILs re-read as the script's own mistakes are named where they occur.

## C1 — a time the app cannot read (runs c1-101635 desk, c1-101935 phone, c1-102153 Ranger)
- Take-off box of the week (q4a (1)), desk + phone: "2560 is not a time. Try 0900 or 09:00.", box back to 12:40 — PASS (`c1-takeoff-2560-desk.png`).
- Door 1, the input's row on Edit Schedule (a Training for Ranger, 10:00–11:00), desk: 2560 by Tab, 2560 by Enter, 0975 in End,
  abc, 25:00, 0960, "  2560  " → each "<typed> is not a time. Try 0900 or 09:00." (spaces trimmed: "2560 is …"), box back to what
  it held, record unchanged, 0 new bell lines — 10 × PASS (`c1-d1-week-desk-*.png`). Phone: the 3 main cases PASS.
- Door 2, the same row on the Scheduler Board: the same 10 cases, desk — PASS; phone, 3 — PASS (`c1-d2-board-*.png`).
- Door 3, ONE man's row of an LL shared by Ranger and Hex (Unavailable list, `…~bane`): 2560 Tab / Enter, 0975 — PASS on the week
  and the board, desk and phone. The shared Training draws as ONE row (D735): 2560 there — PASS.
- "Both bad": not reachable on a row — each box is refused as it is left, so the second box is never reached with the first bad. RECORD `9`: "9 is not a time. Try 0900 or 09:00." (box restored). RECORD 60 letters: the note repeats them whole, one line on the
  desk (`c1-d1-week-desk-long.png`); on the phone see FINDING 1.
- Lesson 16 (tap away, tap afresh): `0900` → saved 09:00, box 09:00; `09:00` → saved 09:00 — PASS doors 1 and 2, desk and phone.
  Door 3: `0900` typed on Ranger's row of the shared LL split him off into his own record (D737, "that man's record alone"); the box
  shows 09:00. My script read the old record (Hex's) and printed FAIL — the script's mistake, not the app's.
- Door 4, Inputs page list: no in-place time box (0 found), Saber and Ranger (`c1-d4-list-*.png`). Door 5, the input's window: its Start/End are the browser's time pickers. RECORD: typing `2560` into Start cannot hold 2560 —
  Chromium's picker turned the keys into "09:00 pm" (Saber, from 09:00) / "10:00 pm" (Ranger, from 10:00); Save then saved Start
  21:00 / 22:00 with End 11:00, with NO note, no question, and wrote 1 bell line (`c1-d5-typed-saber-desk.png`). Surprising for the
  host: a start after its end saved silently. The phone's own picker (a wheel on his iPhone) cannot be typed into — device-only.
- Ranger (member): no editable time box on Edit Schedule or the board (0 found); his window behaves as door 5. Lead, to check (not my scenario): on the phone, after the board saved the Training's start as 09:00, the week's GROUND PROGRAMME
  copy of that accepted input still read 08:00 while Personal Inputs read 09:00 (`c1-101935/c1-d1-week-phone-long.png`, top row).

## C2 — a puck dragged back onto its own seat (run c2-102847; earlier runs are attempts)
- Edit Schedule and the Board, desk, each kind: flying seat "Saber — already in that seat", duty desk "Sidewinder — …", ground row
  "Ace — …", its second man (put there by the board's "+") "Anvil — …", sim seat "Talisman — …", sim passenger "Hunter — …", alert
  "Warden — …", placeholder "ALL AVAIL — already in that seat" — 18 × PASS: the man still there, the app's change count unchanged
  (2→2, 3→3). The carried puck is pictured off its seat (`c2-*-carried.png`).
- RECORD the seat at the drop: the landing ring, the man in place (`c2-fly-board-desk-drop.png`). The placeholder's tap twin
  (q4b (1)): "ALL AVAIL — already in that seat" — PASS.
- RECORD one man of an input's own row (an Unavailable row): his puck does not lift; a press only arms the seat; no note, nothing
  changed (`c2-inputrow-week-desk-carried.png`). The app treats that row's seat as a drop target only.
- Phone, a finger drag (Chromium touch) on the board: possible; "Ranger — already in that seat", ringed (`c2-drag-drop-phone.png`). Script mistake in run c2-102400: the sim seats on the board read "Talisman removed" — the board scrolled under the carried puck and
  my fixed point let go off the seat; re-aimed at the seat's live box, both PASS.

## C3 — the look-ahead (run c3-101316) — desk and phone, each PASS
- 4 weeks ticked "Everyone now opens on the next 4 weeks, to Sunday"; 1 ticked "Everyone now opens on the next week, to Sunday";
  1 unticked "Everyone now opens on the next week"; 2 unticked "Everyone now opens on the next 2 weeks" (`c3-*-desk|phone.png`).
- RECORD bad figures 0, 53, x: "Give a number of weeks between 1 and 52", box put back to 2, nothing saved (PASS). Cancel with 7 and the tick changed: nothing changed (PASS). Ranger: no "Default window" pencil (PASS); RECORD his page opens on
  "24 Nov → 8 Dec", quick button "Next 2 weeks" (`c3-ranger-pop-phone.png`).

## C4 — publishing a day no Leave War period covers (runs c4-103028, c4-103239, c4-103514)
- (a) desk: "Saturday published and approved · No Leave War period for 2028, so no OIL can be earned for this day. Create the
  period on the Leave War." — PASS, one full stop at its end (`c4-a-publish-desk.png`). The board's warning list carries the
  identical sentence — PASS (`c4-warnlist-board-desk-5.png`); the week's list reads "No OIL — no Leave War period covers this date"
  then the same sentence and "Create the 2028 period" (C5 run). RECORD the man's planting note: the same sentence alone.
- (b) NOT WALKED after 3 attempts: Saber at the OIL question pressing "Back" (window stays, nothing filed); Ranger (the helper answered
  Yes for him); Ranger pressing "Back" then ✕ (window stays, nothing filed). No door left an input filed with its question open.
  A side reading with Ranger's answered Saturday input: the publish note held the sentence once, no "..", no small-letter start.
- (c) from the Scheduler Board: the identical note — PASS (`c4-103239/c4-c-publish-board-desk.png`).
- (d) RECORD the amendment: "Published AL1 · 1 item on Sat only · approved by Anvil · Saturday 5 Feb: the ground programme has no
  usable times, so nobody on it earns OIL · No Leave War period for 2028, so no OIL can be earned for this day. Create the period
  on the Leave War." (`c4-d-amend-desk.png`; my second man landed in a timeless ground item, hence the middle part.)
- (e) Monday of that week: "Monday published and approved" — no such sentence, PASS. (f) phone: the identical note — PASS; its box 12–390 × 778–848 inside 402 × 874, no sideways scroll, text inside (376/376) — PASS
  (`c4-f-publish-phone.png`, right-after-tap `c4-f-publish-phone-righttap.png`: nothing tinted, "Saving…" chip only).

## C5 — "Create the 2028 period" (runs c5-103150 week, c5-103514 board, c5-103647 Ranger)
- Hover, week's list and Board's: "Creates the 2028 Leave War period, with nothing open for bidding, and takes you to the Leave War
  to open its dates" — 2 × PASS (title read; the browser's own tooltip is not drawn in pictures).
- Press, both: "The 2028 Leave War period is created. Open its dates for bidding here." — 2 × PASS; the Leave War opens on 2028,
  January, "Bidding closed" — nothing open (`c5-103150/c5-week-after-desk.png`).
- RECORD Undo's hover after: "Undo — a new Leave War period". RECORD a second press in another fresh world's Board: once made, the
  button is no longer drawn (0 buttons) — no second press possible; the same holds in the first world.
- Ranger: the week's warning line shows, no button — PASS (`c5-ranger-desk.png`). The refusal "Only a scheduler can create a Leave
  War period" was not reached by any real route.

## C6 — the OIL day list (run c6c7-103612) — RECORD only
- Saber: NOT WALKED — the list opens on a new holiday, a holiday's bell line, a sign-off over unanswered OIL, or a version loaded
  back; I could not make an unanswered input (C4 (b)) and did not drive making a holiday on the Leave War. Ranger: not reachable — no list, no sign-off boxes, no OIL chips on View-only Sched, Edit Schedule, Inputs or the Leave War;
  his bell empty (`c6-ranger-bell-phone.png`).

## C7 — the plain-user round for these notes
- Each note readable while it shows; one line on the desktop, two or three on the phone. It sits at the foot, never over the box
  just typed in or the button pressed; on the board it can sit over seats low on screen (`c2-fly-board-desk-note.png`).
- A second note replaces the first cleanly (60 letters then 2560): PASS on Chromium phone and WebKit. FINDING 1 (phone, Chromium AND WebKit): the 60-letter bad time overflows the note. Steps: Saber, phone, Edit Schedule, a take-off
  box, type 60 letters with no space, Tab. Shown: the letters run about 10px past the note's right border to the screen edge
  (ink right 399–400, box right 390). Expected (C1 "picture how the long note sits"): inside its box. Contrived input; the host
  judges (`c6c7-103612/c7-longnote-wk.png`, `c7-longnote-phone.png`; also `c1-101935/c1-d1-week-phone-long.png`).
## Lessons (§7.11)
1 — each note's states walked: shown, replaced by a second (C7), refused then good (C1). 3 — every press pictured with its note.
9 — no list or table changed; the note's box measured instead (C4 f, C7). 16 — C1's tap-away-then-0900/09:00 at doors 1–3.
22 — notes read only at opacity > 0.5 and pictured; the long note measured on its ink. 23 — no tap opens an entry here; C5's press
opens the Leave War, checked against the hover's words. 25 — every seat kind (C2) and every door (C1), not only the demo's.
28 — C4 f's publish tap proved on screen; nothing pressed inside a pop-up. 30 — right-after-tap picture taken for the phone publish
(C4 f) only; C1/C3 phone taps had settled pictures only — a gap. The rest concern gestures, layout or motion this change does not touch.
Not walked: C4 (b) (no door to an unanswered input, 3 tries), C6 Saber (the list's fixture).
