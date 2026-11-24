# Round 4 words walk — walker e (re-walk after three fixes), 24 Nov 26
Builds, proved per world by the bundle it ran: fixed `D:/rw4/build-new3` = `index-DIr933hk.js` (every fixed world);
before the fixes `D:/rw4/build-new2` (control worlds). Scripts `scripts/handpass/wr4-e-*.mjs` (`wr4-e-probe.mjs` only read
which empty places Monday draws). Pictures `docs/img/handpass/2026-11-24-words-r4-walk/e/<run>/`; cited runs: E1 `e1-111642`,
E2 `e2-112046` (+ `e2-112233` for the Board), E3 `e3-112329`. Earlier folders (e1-111243, e1-111432, e1-111628,
e2-111927, e2-112014) are attempts — not cited. Console errors, page errors: none in any cited run (`facts.json`).
Tally: 29 PASS · 0 FAIL against an EXPECTED line · 5 RECORDED · 0 NOT WALKED.

## E1 — a name dragged from the crew list onto the seat he holds (desktop; mouse drag, Saber)
Fixed build, Edit Schedule (crew list opened by its AIRCREW tab) and the Scheduler Board, Monday 13 Jul:
- Flying seat (Saber): "Saber — already in that seat" — PASS week and Board (`e1-fixed-fly-week-note.png`, `-fly-board-note.png`).
- Duty desk (Sidewinder): "Sidewinder — already in that seat" — PASS both. Ground row (Ace): "Ace — already in that seat" — PASS both.
- Each: the man still in the seat, the change count unchanged (2→2 week, 4→4 Board), Undo's state unchanged, the seat lit
  as a landed drop at the drop (its class "lift-land" read at once).
- (a) ALL AVAIL put in an empty sim seat (Board tap, walker c's recipe), its name dragged from the crew list onto it:
  "ALL AVAIL — already in that seat", nothing changed — PASS week and Board (`e1-fixed-placeholder-board-note.png`).
- (b) A free name (Comet) dragged onto a DIFFERENT empty place — the week's sim "+" place (the week draws no empty seat on
  Monday, only "+" places), the Board's empty sim seat: he lands there, the change count rises — PASS both
  (`e1-fixed-other-week-drop.png`, `e1-fixed-other-board-drop.png`). RECORDED the note: none showed (no note within 3 s
  of either drop). Undo then: "Undid: a change to the schedule", he is off that place — PASS both
  (`e1-fixed-other-*-undone.png`). (My first Undo check wrongly expected the change count to fall; Undo adds a change —
  the script's mistake, corrected before the cited run.)
- (c) A seat's own puck lifted and let go on its own seat: "Saber — already in that seat", unchanged — PASS week and Board.
- Before the fixes (`build-new2`), the same crew-list drag, flying seat and duty desk, week and Board: NO note, nothing
  changed, the seat lit — the fault reproduced, PASS as a control (`e1-before-fly-week-drop.png`: Saber ringed, no note).
- RECORDED, phone (Chromium 402, one finger by CDP, rested before the lift): a crew-list drag IS possible on the week and
  the Board. The crew list covers the screen while open and closes as the drag starts; dropped on his own seat: "Saber —
  already in that seat", nothing changed (`e1-phone-week-note.png`, `e1-phone-board-note.png`; the list reopens after
  the drop and the note sits over it; right-after-lift `e1-phone-*-drop-righttap.png`).

## E2 — the publish note behind another OIL line (week of 31 Jan 2028, Saturday 5 Feb)
Two ground rows made by the Board's "+ Item": row 1 08:00–16:00 with Ace; row 2 no times with Ace (the script's free-man
pick chose Ace both times) (`e2-fixed-rows.png`). Four sign-off boxes signed, published from the week.
- Fixed, desktop: "Saturday 5 Feb published and approved. The ground programme has no usable times, so nobody on it earns
  OIL. No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War." — PASS:
  a full stop between the two sentences, no ". ·", the no-period sentence once (`e2-fixed-publish-desk.png`).
- Before the fixes: "…so nobody on it earns OIL. · No Leave War period for 2028, …" — shows ". ·", PASS as a control
  (`e2-before-publish-desk.png`).
- Phone (published by a tap on the phone, the world carried over): the identical note, four lines, whole — PASS
  (`e2-fixed-publish-phone.png`, right-after-tap `e2-fixed-publish-phone-righttap.png`).
- One timed row only, from the week: "Saturday published and approved · No Leave War period for 2028, so no OIL can be
  earned for this day. Create the period on the Leave War." — PASS (`e2-one-publish-week-desk.png`).
- From the Scheduler Board: the identical note — PASS (`e2-112233/e2-one-publish-board-desk.png`).
- RECORDED the amendment (row remark typed "Kit check" on the Board, saved; published by the amendment's Publish without
  re-signing — it was not greyed): "Published AL1 · 1 item on Sat only · approved by Anvil · No Leave War period for
  2028, so no OIL can be earned for this day. Create the period on the Leave War." (`e2-amend-desk.png`).
- RECORDED, side: the note when the man is put on the timed row: "No Leave War period for 2028, so no
  OIL can be earned for this day. Create the period on the Leave War."; on the timeless row: "the ground programme has no
  usable times, so nobody on it earns OIL for this day" (starts with a small letter — a placing note, not this fix).

## E3 — the rename (Ranger reads on the phone; Saber acts; each case in its own fresh world, Wed 15 Jul)
- Training "Training · briefing" → Meeting AND retitled "Meeting · briefing" in one save: "Training changed to Meeting,
  renamed — was Training · briefing · Saber", bold "Meeting · briefing" — PASS (`e3-combo-ranger-bell-phone.png`, two rows).
- Before the fixes, the same: RECORDED "Training changed to Meeting · Saber" (`e3-combo-before-ranger-bell-phone.png`).
- Fixed, unchanged from the earlier walks, each PASS: "meeting" → Meeting "Training changed to Meeting · Saber", no
  "renamed"; "Training · Safety" → Meeting the same, no "renamed"; "Brief" → Meeting the same, bold "Brief"; "Range brief"
  → LL "Training changed to LL, renamed — was Range brief · Saber"; no title given "Range brief" "Renamed — was Training ·
  Saber"; Attach "Exercise Kite" (Ranger filed it with To "145 Sqn"), Saber's To → "146 Sqn": "Renamed — was Exercise Kite
  · 145 Sqn · Saber"; all-day LL → OL "LL changed to OL · Saber"; → AM "Now LL (AM) · Saber"; one save day → Thu 16 Jul,
  title "Range brief", remark changed: "Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber", two rows on
  the phone (`e3-*-ranger-bell-phone.png`).

## Not walked, and limits
- E3 read on the phone only (the brief asked for the phone reading). E2's phone note was not measured against the screen
  box (looked at in its picture only). WebKit not run (not asked).
- Pictures: I opened every deciding picture named above; the bulk of E1's "carried" / "drop" pictures were not each opened.
