# Job 3's re-walk of the reads' fixes (a fresh Sonnet walker, 15 Nov 26, ~06:50–07:00)

Its brief: `raptor-port/docs/superpowers/briefs/2026-11-15-lw-doubletap-more-rewalk-brief.md`. Build `65e90282c`, served
by `vite preview`. Pictures: `raptor-port/docs/img/handpass/2026-11-15-lw-doubletap-more/rewalk/` (77, all citable).
No console errors, page errors or failed requests.

**R1 — PASS (tablet 1024×768, touch and keyboard, Chromium).** The test was the same for each window:

1. press with a finger inside the window;
2. press Escape;
3. tap the same spot about 160 ms later.

The six windows: the number pad (on digit 5, figure unchanged before and after), the selection panel, the rename form, the day panel, New period and a move banner. In every case the window went with Escape and the next tap opened what lay under the spot. The host opened `R1-padDigit-quick.png`: Sidewinder's 12 Jan window is open, and Required P still reads –.

**R2 — PASS (phone 402×874, real touch, Chromium and WebKit).** The slim Approvals bar's ✕, double tapped at 120 and at 350 ms:
- nothing opened behind;
- 800 ms later the same spot opened its day;
- "Back ▴" returns to Approvals;
- a tap 150 px away, 100 ms after the close, opened a day.

**R3 — PASS (phone, Chromium, the grid scrolled so the ✕ stands over a date heading).** The Calendar window's ✕, double tapped at 120 and at 350 ms: nothing opened. 800 ms later the same spot opened that day's panel. Not run on its own: reopening it at once from ⚙ (R5 opened it from ⚙ fine).

**R4 — PASS (phone, Chromium).** Each of the first walk's cases, double tapped at 120 ms, opened nothing behind: Apply, Done, the day panel's ✕, an under-manned row, a move's Cancel, New period's ✕. A far tap right after each close opened what lay under it.

Two of the walker's first far taps landed where nothing opens even with no window up, so they were discounted:
- one on a cell of the Dice row on 6 Jan;
- one on the frozen names column.

Both passed again at 80 px.

**R5 — the plain-user round.**
- **Phone — PASS:** a Required figure set and undone; the slim bar out and Back; ⚙ → Calendar… opened and closed; the day panel stepped and closed; a bid moved and Confirmed. After each, a grid tap 1 s later opened.
- **Desktop 1536×864 — PASS** for Required, the slim bar, Calendar and the day panel. The move step timed out in the script, because it waited for a phone's move banner; a desktop lands the move on the clicked day with no banner. The first walk's M7 desktop round (`run1/m7b-*`) proved the desktop move.

**Not run:** WebKit for R3 and R4; reopening the slim bar and New period at once.
