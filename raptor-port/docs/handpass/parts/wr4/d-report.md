# Walker d — re-walk after the fix, and three small checks (24 Nov 26)

Builds, proved by the bundle each world ran: fixed `D:/rw4/build-new2` = `index-BNHpQA1S.js`; before the fix
`D:/rw4/build-new` = `index-2uyEcUJu.js`; main `D:/rw4/build-main` (D4 only). Pictures: `docs/img/handpass/2026-11-24-words-r4-walk/d/<run>/`.
Scripts: `scripts/handpass/wr4-d-*.mjs` (d1, d2, d34, d4b; probe and probe2 only read where the rows live). Saber acts on the desktop.

## D1 — the fix (run d1-r1)
- Before the fix, phone and desktop: "Training changed to Meeting, renamed — was meeting · Saber" — the old words reproduced (`D1-before-ranger-bell-phone.png`, `-desk.png`).
- Fixed build, phone: PASS "Training changed to Meeting · Saber", bold name "Meeting", no "renamed" anywhere in the list (`D1-fixed-ranger-bell-phone.png`).
- Fixed build, desktop: PASS, the same words (`D1-fixed-ranger-bell-desk.png`).
- RECORD (same on both builds, not a words matter): the saved input loses its title "meeting" once its kind becomes Meeting (the record has no title after the save). The earlier "You were added" line still shows bold "meeting".

## D2 — nothing else moved (run d2-r1, fixed build; phone and desktop read the same words)
- Title "Meeting" → Meeting: PASS "Training changed to Meeting · Saber", no "renamed". (Its second row is below the fold of both pictures; read from the drawn list. Here too the saved title is dropped.)
- Title "Brief" → Meeting: PASS "Training changed to Meeting · Saber", bold "Brief" (`D2-ranger-bell-phone.png`).
- Title "Training · Safety" → Meeting: PASS "Training changed to Meeting · Saber", no "renamed".
- "Range brief" → LL: PASS "Training changed to LL, renamed — was Range brief · Saber" (bold "LL").
- No title given "Range brief": PASS "Renamed — was Training · Saber".
- "brief" retitled "Brief", kind left alone: RECORDED "Renamed — was brief · Saber" (bold "Brief").
- Ranger's all-day LL → OL: PASS "LL changed to OL · Saber". All-day LL → AM: PASS "Now LL (AM) · Saber".
- One save, day → Thu 16 Jul, title → "Range brief", remark changed: PASS "Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber" — two lines on the phone, two on the desktop (`D2-ranger-bell-phone.png`, `D2-ranger-bell-desk.png`).
  (Filed with the title "Training", the input was saved with no title — the app drops a title equal to its kind.)

## D3 — an input's start changed on the Scheduler Board (run d34-r3, fixed build)
- A Training for Ranger and Hex, 08:00–10:00 "Range brief", Wed 15 Jul, on the Ground Programme. On the Board, the
  Personal Inputs panel draws ONE row for the pair (keyed to Hex, both men on it); 0900 typed in its start box, Tab. Saved 09:00–10:00, no note.
- PASS: Hex (phone) reads "Now 09:00–10:00 · Saber" (`D3-hex-bell-phone.png`); Ranger (phone) reads the same (`D3-us-bell-phone.png`).
- RECORD: the Board has a pencil on that Personal Inputs row; pressed, it opens the input's own window showing Start 09:00
  (desk and phone, both builds); closed by Escape, nothing changed. Its picture failed to save (the crop found no box) — the reading stands on the log only.

## D4 — the lead: a stale time (runs d34-r3, d4b-r1, d4b-r2, d4b-r3; fixed and main, desk and phone)
The two rows are different things: the Ground Programme row is the day's programme copy of the accepted input (marked
"from an input"); the Personal Inputs row is the input itself (with Reject). The Inputs page's list opens on today's
fortnight, so the Inputs calendar's day card was read instead.
- Filed: every place 08:00–10:00 (week ground, week Personal Inputs, day card, Board ground, Board Personal Inputs).
- **A stale time IS shown — on the Board's own Ground Programme row, while the Board stays open.** After 0900 on the
  Board's Personal Inputs row: that row and the saved input read 09:00, the Board's Ground Programme row still reads
  08:00 (`d34-r3/D4-fixed-3-after-0900-on-board-board-ground-desk.png` beside `…-board-pi-desk.png`). It is one change
  behind, not frozen: 0900 → it shows 08:00; then 0800 → it shows 09:00; then 09:00 → it shows 08:00
  (`d4b-r3/D4b-main-v1-2-board-after-0800-board-ground-phone.png` shows 09:00 while the input is 08:00).
- Same on the fixed build and main, desk and phone — so not made by this change.
- Cleared by closing the Board (week ground and Personal Inputs then both 09:00, `D4-fixed-4-board-closed-week-*.png`),
  and by a reload (`D4-fixed-5-after-reload-week-ground-desk.png`); the Board reopened after either shows 09:00.
  Tapping the stale Board ground box and leaving it by Tab, typing nothing, did not write 08:00 back (d4b-r1 v2).
- The WEEK's Ground Programme copy was never stale in my runs: changed on the Board then closed, or changed on the
  week's own Personal Inputs box (0900, 0800, 09:00, read in place each time), it always matched the input.
  Walker c's picture (week ground 08:00, Personal Inputs 09:00) was NOT reproduced on the week. My guess, not proved:
  c's Board may not have closed (c's close looked only for two buttons), so c saw the Board's lagging copy's value.
- Picture names in d4b repeat "after-0900" for the first and third change; the file kept is the third.

## Errors seen
No console errors or page errors in any run (failed requests are not collected by the shared helpers; requests outside
the walk's own address are refused by the test set-up). The only script error: the pencil picture's crop (D3).

## Not walked
WebKit (not asked). The Inputs page's list row (opens on today's dates; the calendar's day card read instead).
