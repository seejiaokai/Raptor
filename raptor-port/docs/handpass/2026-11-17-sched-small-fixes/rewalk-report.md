# Re-walk after the reads' fixes — claude/sched-small-fixes c96154e0d (17 Nov 26, 04:20–04:30, one Sonnet walker)

Saved by the coordinator from the walker's report. No console errors, page errors or 4xx in any run. No faults found.

- R1 PASS (Chromium 820×864): ☰ over ALL AVAIL and over the changes window — Escape closes only the menu, a second Escape the window (rw1-aa-*, rw1-chg-*). The coordinator opened rw1-aa-after-esc1: the menu gone, the window up.
- R2 PASS (402×874 by touch, WebKit and Chromium): Edit Schedule's ⋯, View-only Sched's ⋯, the board's ⋯ over a window — Escape closes only the menu, the next the window; the board stays (rw2-*).
- R3 PASS (1536): ALL AVAIL open, a seat armed, the title bar pressed → Escape closes the window, the seat stays armed; a second Escape puts it down (rw3-*).
- R4 PASS: count A (Jul 22) then B (Jul 25), Tab into the window, Escape → the keys on B with the 2px cyan ring; again after a real edit that redrew the week (rw4-*).
- R5 NOT WALKED: the demo raised no holiday OIL-answer list (rw5-bell); carried by the three-window test in `src/ui/escwindows.test.tsx` (finding C).
- R6 PASS as two variants only: the input window is a dimmed modal over ALL AVAIL, so ALL AVAIL's ✕ cannot be pressed under it (rw6-both-open). Variant A (real controls: ALL AVAIL ✕, then the input window, Escape) closes the input window; variant B (a script click on the ✕) likewise. Nothing typed, so the question branch was not exercised here.
- R7 PASS: the first walk's smoke — the week, the clock, the board (stays on the first Escape), and the phone tap in WebKit and Chromium (rw7-*).

Not walked: a real iPhone; the phone's on-screen keyboard Escape (synthetic touches and keyboard).
