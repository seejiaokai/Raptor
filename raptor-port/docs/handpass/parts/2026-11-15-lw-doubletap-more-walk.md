# Job 3's walk — the Leave War's double-tap guard on six more windows (a Sonnet walker, 15 Nov 26, ~05:00–05:20)

The walker's report, saved as received (lightly trimmed of nothing; its brief:
`raptor-port/docs/superpowers/briefs/2026-11-15-lw-doubletap-more-walker-brief.md`). Build: `claude/lw-doubletap-more`
at `a9d6937a0`, served by `vite preview`. Pictures: `raptor-port/docs/img/handpass/2026-11-15-lw-doubletap-more/run1/`
(315; fast = ~90 ms after the second tap, settled = ~650 ms later). Scripts and raw output stayed in the night's
scratch folder.

**Summary:** no FAIL in any scenario as briefed. Every guarded double tap opened nothing behind the window; nothing
was left dead. No console errors, page errors or failed requests in any run.

**M1 (phone 402×874, real touch, gaps ~120 and ~350 ms) — all PASS in Chromium:**
- the selection panel's ✕, Apply (figure 14 saved, Undo gained 1) and Clear;
- the rename form's ✕, Save (name saved, Undo 1) and Cancel;
- the number pad's Done (figure 5 saved, Undo 1);
- the day panel's ✕, and its ‹ and › (each stepped two days, 12→10 and 12→14, and stayed open);
- an under-manned row (the grid went to that day, nothing else opened);
- a record move's Confirm (landed, Undo 1) and Cancel;
- an event move's Confirm (landed, Undo 1) and Cancel;
- New period's ✕ and Create (period made, Undo 1).

In each case nothing opened behind, and Undo gained only the window's own action. The raw log reads 8 for the under-manned case; that is the script's counter set-up, not the tap.

WebKit at the same size: rename Save, pad Done, day panel ✕, under-manned row, record-move Cancel and New period ✕ all PASS at both gaps. The selection panel's ✕ was NOT RUN in WebKit, because opening that panel needs a long-press drag the script can drive only in Chromium.

Open for bidding ✕ on the phone is OBSERVED, not judged. It fills the screen, so no part of the grid is under the ✕, and the second tap opened nothing at either gap.

**M2 (tablet 820×1180, touch):** Open for bidding's ✕ and the day panel's ✕ both PASS; nothing opened behind.

**M3 (phone, Chromium):**
- **a — PASS.** 800 ms after a guarded close, a tap on the same spot opened what the grid holds there. The move banners behaved the same.
- **b — PASS.** About 60 ms after the close, a tap on a day 90+ px away opened it, for all eight windows.
- **c — all answered.**
  - Right after an Apply, Undo took the Apply back.
  - The bell opened its list.
  - The menu button opened the side menu. The walker was unsure of this one; the host opened `m3c-menu.png` and it shows the menu open.
- **d — Escape.** Escape closes all nine windows, and the next real tap on a far day opened it each time (PASS). The two move banners passed in a second pass, `m3x`.
- **d — a swipe.** A swipe of the grid closes none of the windows, so the stale-press case cannot arise there. Where a day was reachable, a far tap still opened it.
- **d — a tap beside.** A tap beside a window closed some of them. Where it did, the next far tap on a day opened it (PASS). The day panel and Open for bidding do not close on an outside tap.
- **d — not run.** A pinch close was not run (a two-finger pinch could not be driven reliably). A day tap after the day panel or Open for bidding closes by an outside tap was not run, because no day is reachable there. The first "outside" tries landed on the Balances tab by the script's own aim; they were discarded and run again.
- **e — the panel does not block the page.** With the selection panel up, a tap on another Required cell opens the pad (OBSERVED). A tap on a day opens its bid window (PASS). Dragging another block re-targets the panel to the new days.
- **f — PASS.** Eight presses inside the day panel (rows, ‹ ›, middle, corners, one quick double) left only the day panel open.
- **g — PASS.** Closing a window and reopening it at once by its own control opened it every time, for all eight windows.

**M4 (phone; Apply, the day panel's ✕, a record move's Cancel):**
- A triple tap: nothing behind.
- A second finger 20 px off: nothing behind.
- A 550 ms gap: still guarded.
- A 700 ms gap: the second tap gets through on all three (a day window opened), so the guard's edge falls between about 550 and 700 ms, as designed.
- A 600 ms hold, then a tap: the hold acted as the press that closed the window, and the tap after it opened nothing.

**M5 (desktop 1536×864, mouse):** a double click on the selection panel's ✕, the rename form's ✕, the day panel's ✕, a record move's Cancel, New period's ✕, Open for bidding's ✕ and an under-manned row opened nothing behind. In several the spot behind held little that could open (a group heading, an empty Event cell). The desktop figure editor, closed by Enter and then clicked on the same cell, opened nothing and kept 7. On a desktop a move lands on the clicked day with no Confirm banner; that is the build's design (the banner is a phone's).

**M6 (member `us`, phone):**
- The day panel's ✕ passes.
- The under-manned list cannot be opened (OBSERVED): the member's demo world has no red days, so its chip is absent.
- His own bid, moved, with Confirm and Cancel each double tapped: nothing opened behind. A tap on his own day 1 s later opened its window (PASS).

**M7 (the plain-user round) — all PASS, phone then desktop:**
- one Required figure;
- a dragged run with Apply (both cells 11);
- a rename and back (REQ P → PILOTS Q → REQ P);
- the day panel opened, stepped and closed;
- a bid moved, with Confirm and with Cancel;
- New period opened and closed;
- Open for bidding with a month turned on and back;
- a person window;
- Undo and Redo.

After every close, a day tap 1 s later opened. On the desktop, the first move step timed out because there is no Confirm banner there; it was checked again in `m7b`.

**NOT RUN:** the selection panel in WebKit; closing by a pinch; the member's under-manned list; Undo as a measure for Open for bidding's ✕.

**Opened by the host (cropped where it mattered):**
- `chromium-under-row-g120-fast.png`: the grid at the day, nothing open.
- `m4-day-x-gap700-settled.png`: at 700 ms the second tap opens Reaper's 13 Jan window, through by design.
- `m3c-menu.png`: the side menu open right after a close.
