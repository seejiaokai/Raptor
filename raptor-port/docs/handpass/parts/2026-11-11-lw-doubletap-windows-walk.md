Walk report, job 4 (branch claude/lw-doubletap-windows, dist as built). Preview on port 4392 stopped (only TimeWait sockets left). W1 to W5 were run. W6 was NOT RUN: over time, and no dedicated plain-user round was made. W2 e (finger scroll) is not proven (see W2).

Pictures: folder base is raptor-port/docs/img/handpass/2026-11-11-lw-doubletap-windows/. Every case has two pictures: a100ms (about 100ms after the second tap) and b-settled.
CITABLE:
- run2-w1-chromium (64 pictures: W1 phone Chromium, all windows, gaps 120 and 350)
- run3-w1-peek-save (8: re-run of event box Edit and counter Save without the page scroll)
- run5-w1-webkit (8: WebKit, gap 120 only)
- run6-w2 (11)
- run9-w3 (30)
- run12-w4 (16: desktop)
- run13-w5 (5: member)
- run4-probe (2: single tap on the event box's Edit)
NOT citable: run1 (12, partial early test), and run7, run8, run10, run11 (empty; they hold no pictures).

W1, phone Chromium, gaps 120 and 350, all PASS: after the window closed nothing opened behind it and the grid was left alone. This held for the person window ✕, Settings ✕, Settings Rearrange, event window ✕, Save and Delete, counter form ✕, Cancel, Save and Delete, Manning ✕, and the one-day window ✕ (bid-cancel, which is the window's ✕; "Cancel" there is the same control, so one control was tested twice). Each case had a day under the button except Events and OIL, which have none.
- Undo: unchanged (title and state compared) for the plain closes. Event Save added one step ("the event 'Range day'"), Delete changed it to "removing the event". Counter Save added one step. Counter Delete's Undo label did not change (still "a Leave War setting"), so "gains nothing" is not proven for it.
- Event Move: the window closed, nothing opened, Undo unchanged.
- Events list ✕: OBSERVED. The window closes and the second tap opens the bell's list ("Nothing new"), picture 041 in run2. Nothing of the grid opens.
- OIL tracker ✕: PASS, window closes, nothing opens; second tap meets nothing visible. Pictures 047 to 050.
- Event box Edit (run3 pictures 005 to 008, run2 053 to 056): OBSERVED, probably a FAIL against the brief ("the event window opens, nothing behind it does"). After the double tap the event window is NOT open at 100ms or settled, at gaps 120 and 350. A single tap on Edit does open it (run4-probe). So the second tap seems to close the window it just opened. Nothing opens behind it. Repeat: a saved event on an empty cell, tap the cell (the box opens), double tap Edit.
- WebKit (iPhone engine), gap 120: person ✕, Settings ✕, event ✕ and Manning ✕ all PASS, nothing opened.
- Leave line / OIL line in the person window: NOT RUN (the OIL line opens the tracker, it does not close the window).
- Drag window: NOT RUN (needs a drag selection by finger).

W2, phone:
- a PASS: after 800ms the same spot opens the day's bid window.
- b PASS: a tap on a day 252px away, 150ms after the close, opens the bid window.
- c PASS: Undo (it undid the event), the bell (list opens) and the menu button (drawer opens) all answer right after a close. Pictures 003 to 005.
- d OBSERVED: ⚙ Settings is not closed by a tap on the grid beside it; it stays open, and the second tap leaves it open too. The event window is closed by the first tap, and the second tap opens that day's bid window (as said: on purpose).
- e: a pinch right after a close works (grid width 7733 to 4719). The finger scroll is NOT PROVEN: my scripted scroll moved nothing even with no window opened (control 0 to 0), so that is the script's limit, not the app's.
- f PASS: close, then open again at once, and it opens.

W3, phone Chromium (person window, counter form, event window, identical on all three):
- Triple tap: nothing opens.
- Second finger 20px off: swallowed, nothing opens.
- Gap 550ms: swallowed, nothing opens.
- Gap 700ms: gets through and the day's bid window opens. So the guard's edge falls between 550 and 700.
- Hold 600ms then a tap after 100ms: swallowed, nothing opens.

W4, desktop 1280x800, double click on ✕: all PASS, nothing opens behind it for the person window, Settings, event, counter form, Events list, Manning and OIL. The event box's Edit opens the event window and it stays open (unlike the phone). Undo unchanged throughout.

W5, member (us, Bane's row is the one matched; picked by name Ranger):
- His own person window ✕ double tap: nothing opens.
- A day's bid window opened and closed by double tap on ✕: nothing opens behind it, and after 1s a tap on a day opens the bid window.

Errors: no console errors, page errors or failed requests seen in the runs that listed them (W4, W5 recorded none; the W1 to W3 logs also show none).

Not run: W6; the drag window; W3 hold variants beyond the three windows; WebKit for W2 to W5.

Logs and scripts are in the scratchpad job4/walk folder.
