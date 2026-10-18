# Re-walk, walker F — share R2 (focus, notes, words, the caret) — 19 Oct 26

Build: `walk-676a92e43` served at `http://localhost:4240` (bundle `index-BHlvKWCJ.js`, checked against the served index page).
Driver: `scripts/handpass/lib.mjs` plus the first walk's own helpers (walker B's `blib`/`blib2` and its saved worlds `f2d` / `s209` for S2; walker C's `mylib` for S3; walker D's `common` for S4), copied into this walker's scratch folder. Sizes: D 1440×900 mouse; P 390×844 touch (finger taps at the element's box; the phone context has `hasTouch`/`isMobile`); L 844×390 touch (CDP finger).
Pictures: `docs/img/handpass/2026-10-19-sched-fixes/rewalk/F/` (the `R2-…` names are this re-walk's; the four `S3-02-*` and four `S3-03-*` are walker C's scripts re-run). Fixtures: S2 reused B's saved worlds (maxRun 3 and the late Thursday desk / SC in-time already filed); each run asserts what the fixture made (maxRun 3 vs 6, the line found) before judging.

Counts: **PASS 31 · FAIL 0 · RECORDED 2 · NOT WALKED 0.** One new observation outside the scenarios (stale box after Undo on a published day) is listed under "Surprises" for the host to reproduce.

| Id | Size | What I did | What the screen showed (observed) | Verdict | Picture |
|---|---|---|---|---|---|
| S2-10b | D 1440 week | maxRun 3, one man on Tue–Fri: Thursday's list opened; its run line "Breaks Friday — his 4th day in a row" tapped; the list closed by its strip | fixture maxRun 3, line found; list open: 433 pucks dim; tapped: 434 dim, 9 lit; **closed: 0 dim, 0 lit, 0 `.dim` elements, 0 lit-focus marks, 0 open lists** | PASS | R2-S2-10b-a-tapped-1440, R2-S2-10b-b-closed-1440 |
| S2-10f | P 390 week, finger | the same by finger | tapped 434 dim / 9 lit; **closed 0 / 0, 0 `.dim`, 0 focus marks** | PASS | R2-S2-10f-a-tapped-390, R2-S2-10f-b-closed-390 |
| S2-09 (control) | D 1440 week | late Thursday desk → Friday SC in-time breach; "Breaks Friday" crew-rest line tapped; list closed | tapped 434 / 9; closed 0 / 0, 0 `.dim` | PASS | R2-S2-09-control-a-tapped-1440, R2-S2-09-control-b-closed-1440 |
| S2-09 (control) | P 390 week, finger | the same by finger | tapped 434 / 9; closed 0 / 0 | PASS | R2-S2-09-control-P-a-tapped-390, R2-S2-09-control-P-b-closed-390 |
| S3-03 week A | P 390 | Edit Schedule: six edits; Undo; with its note showing, the changes window opened (All changes tab) | note before the window: foot (y 780); after opening: **note at the top (y 10, "at": top), window 309–832, no overlap** | PASS | S3-03-week-A-undo-then-window-P |
| S3-03 week B | P 390 | window first, then Undo | note at top, window 309–832, no overlap | PASS | S3-03-week-B-window-then-undo-P |
| S3-03 board A | P 390 | Scheduler Board, same as A | note foot → **top (y 10)** when the window opened; no overlap | PASS | S3-03-board-A-undo-then-window-P |
| S3-03 board B | P 390 | board, window first then Undo | note at top, no overlap | PASS | S3-03-board-B-window-then-undo-P |
| S3-10 SC B | D 1440 board | Fri published with Flying, SC, AVALON, BB waves; typed SC B 06:00; Undo; Redo | title "Undo — an in-time"; note "Undid: an in-time"; "Redid: an in-time" | PASS | R2-S3-10-SC-B-D |
| S3-10 flying B | D board | flying line B 08:30 | "Undo — a brief time"; "Undid: a brief time" | PASS | R2-S3-10-flying-B-D |
| S3-10 AVALON B | D board | AVALON B 17:30 | "a brief time" (title and Undid/Redid notes) | PASS | R2-S3-10-AVALON-B-D |
| S3-10 BB B | D board | BB B 07:15 | "a brief time" | PASS | R2-S3-10-BB-B-D |
| S3-10 take-off | D board | flying take-off 10:20 | "Undo — a take-off time"; "Undid: a take-off time" | PASS | R2-S3-10-takeoff-D |
| S3-10 (five rows) | P 390 board, finger | the same five edits by finger taps | identical words: "an in-time", "a brief time" ×3, "a take-off time", in title, Undid and Redid | PASS ×5 | R2-S3-10-*-P |
| S3-02b | D 1440 board | Saturday Meeting for Ranger; opened the input's own window from Personal Inputs, "Change…", answered No; Undo | title after: "Undo — an OIL answer"; note **"Undid: an OIL answer"**; the answer put back (0 → 0.5) | PASS | S3-02-4-undo-oil-D |
| S3-02a / c (controls, same run) | D | the swap by drag, Undo, Redo; then a remarks change, Undo | "Undid/Redid: swapping Ranger for Saber"; "Undid: a personal input" | PASS ×2 | S3-02-1…3, S3-02-5 |
| S4-04 | P 390 board, finger | Scheduler Board Tue: changed line 1's take-off, then ONE tap into: line 2's mission; line 2's callsign; line 1's landing; line 2's take-off; an In-time line (each preceded by a fresh take-off change, left by a tap on the "Sign-off" caption) | **every first tap put the caret in the tapped box** (`activeElement` = `ff:1.0.1.msn` textarea, `ff:1.0.1.cs` textarea, `ff:1.0.0.ld` input, `ff:1.0.1.to` input, the In-time span) and the typed marker landed (mission "BFM"→"BFMBFM"; callsign "RU"→"RUQX"; landing "10:05"→"10:105"; take-off "09:40"→"09:140"; In-time line gained "ITX"); the take-off change saved each time (09:15, 09:20, 09:25, 09:30, 09:35 as typed) | PASS ×5 | R2-S4-04-line2-mission-390, -line2-callsign-390, -line1-landing-390, -line2-takeoff-390, -intime-line-390 |
| S4-01 board half | D 1440 board, mouse | the same five targets by single click | same: focus on the clicked box each time, marker landed, take-off saved (09:15 … 09:35) | PASS ×5 | R2-S4-04-*-1440 |
| S3-16 crew puck | L 844×390 finger | Monday board (pane 204px tall, scrolled to 313); crew-list puck picked up with a finger, taken to the pane's centre line and held 40px, then 15px below the pane's top; each held 1.5 s still, then 1.5 s with the finger moving about 4px | 40px: scrollTop 313 → 313 still → 313 moving. **15px: 313 → 313 still → 313 after the few-pixel movement; the page's own scroll (163) and every other scroller unchanged.** The drag ghost (Comet) was up at the top of the pane in the picture. The pane does NOT scroll for a crew-list puck, still or moving | RECORDED | R2-S3-16-crew-hold40-L, R2-S3-16-crew-hold15-L |
| S3-16 seat puck | L 844×390 finger | the same with a puck lifted from a seat on the board | 40px: 313 → 313 still → 313 moving (no scroll). **15px: scrollTop on arrival 185 (it had scrolled 313 → 185 while the finger travelled up into the band); held perfectly still 1.5 s: 185 (no further scroll); then the finger moving about 4px: 0 (the pane ran to the top).** So a seated puck scrolls the pane at 15px once the finger moves a few pixels, not while perfectly still | RECORDED | R2-S3-16-seat-hold40-L, R2-S3-16-seat-hold15-L |

## Errors seen

None — the page, console and 4xx lists were empty on every run (`[]` printed by every script).

## Surprises (one line each, for the host to reproduce)

1. **Stale box after Undo on a PUBLISHED day (new, not in the scenarios).** Fri published (an unpublished day does not do it), a B typed on a line, then Undo: the Undo note, title and stored value are right (stored B back to blank), but the box still shows the typed time until a Redo. Seen on the board at 1440 (flying B 08:30 stays "08:30"; SC B 06:00 stays "06:00" in its first row) and on the phone board (picture `R2-S3-10-SC-B-P`; probe pictures `x6-stale-1`, `x7-week-after-undo`; shot straight after Undo shows 06:00 in the first SC row), and on Edit Schedule's week at 1440 (flying B 08:30, box "08:30", stored ""). On a draft day the box clears as expected; one draft run (SC typed, Undo, Redo, then flying B typed, Undo) also left the flying box stale. Cannot tell from here whether it predates this batch.
2. After Redo of an SC line's B the typed in-time shows in all four rows of the SC formation at once, though only the first row was typed (before the Redo only that row shows it, the stored value is for the whole formation) — the board draws the other rows late rather than wrongly.
3. S3-10: the three non-SC lines' words on the PHONE board come out the same as at 1440 — the earlier walk's "a change to the schedule" is gone from the board.
4. S3-16: the crew puck's drag takes the page/side list as its scroller, never the board pane (all scrollers unchanged at 15px); only a puck lifted from a seat scrolls the pane — as the first walk recorded.
5. On the phone board the ✓ Done button sits at the far right of the top bar exactly where my first "leave the box" tap landed (380, 60): it closed the board. A walker's blank-space tap there is not blank.

Scripts (not in the repo): `…/scratchpad/walk/F/` (`r210.mjs`, `r210p.mjs`), `F/c/` (`s3-03.mjs`, `s3-02-D.mjs`, `r310.mjs D|P`, `r316.mjs crew|seat`, probes `x2`–`x7`), `F/d/` (`r404.mjs P|D`). All browsers closed; no server touched.
