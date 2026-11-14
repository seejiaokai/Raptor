Re-walk report, job 4

Setup: preview on port 4393 from the built dist, now stopped (only TimeWait sockets remain). Chromium, phone 402x874 with real touch (CDP and touchscreen). WebKit ran for R2 (person ✕ and event ✕). No console, page or request errors in any run except the one crash noted under R5 desktop. All pictures are under raptor-port/docs/img/handpass/2026-11-11-lw-doubletap-windows/. Scripts and logs are in the scratchpad job4/rewalk folder.

R1 (fixed case): all PASS.
- R1a, three events: finger on the box, swipe up 135px, the box closed, a day tap 5-7px from the first touch within about 200ms opened the bid window. Pictures in rw-r1 (002-003, 005-006, 008-009).
- R1b: the name tap kept the box open, the pinch closed it, a day 32px away opened at 150ms. rw-r1 010-011.
- R1c, touch laptop 1280x800: the name tap kept the box, Escape closed it, the next touch opened the window. Caveat: the nearest day was 68px (rw-r1c) and 76px (rw-r1) from the event touch, not within 30px. The event row sits apart from the day rows, so "within 30px" could not be reached. The guard's 32px reach was not exercised on desktop. rw-r1c 001-002, rw-r1 012-013.
- R1d: the grid tap that closed the box also opened that day's window (OBSERVED). The next tap on a day 60px or more away, 150ms later, opened. rw-r1 014-016.
- R1e: one tap on Edit, the event window opens and stays (PASS, rw-r1 018-019). Double tap at 120ms: no window open afterwards, no event window and no bid window (OBSERVED, matches the known case; rw-r1 020-021).

R2 (guard still guards, second tap 120ms later, nothing opened): PASS for the person ✕ (Chromium and WebKit), ⚙ Settings ✕, event ✕ (Chromium and WebKit), event Save (this saved one event, so Undo changed as expected), counter Cancel, Manning ✕, one-day window ✕. The 1.3s hold on the person ✕ then a tap 120ms later: nothing opened, PASS. Pictures: rw-r2-cr (14), rw-r2-wk (4), rw-r2hold (2).

R3 (rw-r3):
- Same spot after 800ms opened the day. PASS.
- A day 252px away at 100ms opened. PASS. (The distance was far beyond the 60px minimum.)
- Undo answered at once (enabled to disabled). The bell opened its list ("Nothing new"). The menu button opened the drawer. All PASS by picture.
- Not part of the brief: closing a window with a tap on the grid beside it and tapping again at once opened the day for the event window and left Settings open. OBSERVED only.
- Not part of the brief: with the person window just closed, a touch scroll did not move the page. This matches the first walk's control probe. The pinch changed the grid width from 7733 to 4719.

R4:
- R4a, drag window (long press 700ms then drag across 3 days, rw-r4b): the drag window (select-sheet) opened. The double tap on its ✕ at 120ms left nothing open. PASS. Pictures: rw-r4b 001-003. rw-r4 is the failed first attempt: my script did not list the drag window, so it reported NOT RUN. Do not cite it.
- R4b, person window: a leave line was tapped twice at 120ms. The window closed and the second tap opened nothing (OBSERVED). rw-r4b 004-006.

R5 plain-user round (rw-r5, rw-r5b, rw-r5c):
- Phone: day open and close, a tap on a day 1s after each close opened it. This held after place leave, Undo, Redo, Undo (Undo enabled, disabled, enabled, disabled), person, ＋ Counter, Events… with an event from the list, Calendar…, Manning and its Edit counter…, OIL, and all four tabs. Each window opened, closed and reopened. The grid was never dead. PASS.
- Desktop by mouse: the same sequence in R5b and R5c, apart from the gap below. A day tap after Manning/Edit counter was not run on desktop (my script found no cell). Day opens after the tabs and after OIL PASS in R5c.
- OBSERVED, not a fault: pressing Cancel on the ＋ Counter form closes Settings too. Both sizes (rw-r5b "after-counter-cancel", rw-r5 015).
- Gap: the first R5 script's desktop run (rw-r5, 29-54) ended with "Target crashed" in the browser tab at the very last step. That was while a stuck wait on a missing day cell ran 30s, with several other runs going. It did not recur in R5b/R5c.

Citable folders: rw-r1 (21, covers R1a, R1b, R1d, R1e and an earlier R1c), rw-r1c (2), rw-r2-cr (14), rw-r2-wk (4), rw-r2hold (2), rw-r3 (11), rw-r4b (6), rw-r5 (54, phone fully valid, desktop up to its last step), rw-r5b (21), rw-r5c (2). Not citable: rw-r4.

Not run: nothing from the brief was dropped, apart from the two gaps above (R1c 30px, R5 desktop day tap after Manning).
