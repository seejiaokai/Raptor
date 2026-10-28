# Re-walk report — [LW-WHOLE-LEAVE-WINDOW], the two fixes (walker's part)

Build walked: branch `claude/lw-whole-leave-window` at a244cf5d1, built under the shared lock (exit 0), served on port 4184; the served index's bundle (`assets/index-zZ5m5ekL.js`) equalled `dist/index.html`'s.
Script: `raptor-port/scripts/handpass/lw-whole-rewalk.mjs` (new; it sets its own folder, loads no shared helper; one full run, 9 runs; raw record `docs/handpass/parts/lw-whole/rewalk-results.json`).
Phone = WebKit iPhone 13 at 402 x 874; desktop = Chromium 1536 x 864 at 1.25. Each run on a fresh page (`/?fresh=1`), signed in as admin.
Pictures: `raptor-port/docs/img/handpass/2026-10-28-lw-whole-leave/rewalk/` (a new folder; the first walk's pictures untouched). Every picture cited below was opened except those marked (not opened).
Page / console errors across all 9 runs: none. No source or e2e file changed. The preview server was stopped (port 4184 free) and every browser closed.

## Result table

| Scenario | phone | desktop | Pictures |
|---|---|---|---|
| R1 (W1 again): title, chips, calm line with no date, 4 cyan, scope-day | PASS | PASS | R1-phone-all, R1-phone-day-touch (not opened), R1-phone-day (not opened), R1-desk-all, R1-desk-day (not opened) |
| R2: one-day window on Fri 13, "Wedding" typed, Delete with no blur | PASS | PASS | R2-phone-before, R2-phone-after, R2-desk-before (not opened), R2-desk-after (not opened) |
| R3: same set-up, Approve with no blur | PASS | PASS | R3-phone-before (not opened), R3-phone-after (not opened), R3-desk-before (not opened), R3-desk-after |
| R4 (W15 again): single-day LL on Mon 16 | PASS | PASS | R4-phone-open (not opened), R4-desk-open (not opened) |
| R5 (W2 again, desktop only): Approve All, Undo once | not asked | PASS | R5-desk-approved (not opened), R5-desk-undo (not opened) |

Counts: 9 runs, 9 PASS, 0 FAIL.

## What was read (observed values)

- R1, both sizes: title `9–12 Feb`; `All 4 days` pressed; `Tue 10` not pressed; the manning line (`bid-dayline`) reads exactly "No manning row is amber or red"; `bid-dayline-when` is absent (null); 4 cells `td.selcell` (9, 10, 11, 12 Feb). After scope-day: title `Tue 10 Feb`, one cyan cell (Tue 10). Picture R1-phone-all shows the window with the calm line directly under the title and no date line above it.
- R2/R3 set-up (read back at each size): the four-day leave carries the Remarks "Wedding" (saved by Tab, read back after reopening Tue 10: title `9–12 Feb`, `All 4 days`); the separate bid on Fri 13 did not join it (Tue 10 still `All 4 days`, title `9–12 Feb`); five pending LL (9–13). Fri 13 opens a one-day window: title `Fri 13 Feb`, `Pick a range` shown, no chips, one cyan cell. The Remarks box held "Wedding" with focus still in it when the press was made; the press was the DOM click on the button (no blur, as an iPhone's tap).
- R2 after Delete (one press; no second press was needed): cells `LL:w, LL:w, LL:w, LL:w, empty`: Fri 13 gone; 9–12 still four pending, drawn dashed (class `s-w`, joined bar). Pictures R2-phone-before and R2-phone-after show the window on Fri 13 with "Wedding" in the box, then the grid with Fri 13 empty and the dashed 9–12 bar left.
- R3 after Approve: cells `LL:w x4, LL:a`: only Fri 13 approved (filled), 9–12 still pending (picture R3-desk-after: dashed bar then a solid LL on Fri 13).
- R4: `Pick a range` shown, no chips, title `Mon 16 Feb`, one cyan cell.
- R5 (desktop): Approve on All closed the window, all four `LL:a`; one top-bar Undo put all four back to `LL:w`.

## FAILs

None.

## Notes (no EXPECTED, nothing failed)

- On the desktop the floating window covers the right end of the leave in the picture (R1-desk-all), as in the first walk; the DOM has all four cells cyan.
- The phone touched-state picture (D1281) was taken once, after the scope-day tap (R1-phone-day-touch, not opened this time); other taps have settled pictures only.
- The window still shows "Placed Saber · Wed 28 Oct, 14:19" under the calm line on the leave; unchanged from the first walk.
