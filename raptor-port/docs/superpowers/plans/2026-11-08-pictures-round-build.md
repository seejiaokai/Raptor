# The pictures round's build — D1780–D1793 (his "All as recommended", 8 Nov 26)

Each answer is a ruling in its area file (open its full row before building: `grep -h '^| D1780 |' .claude/decisions-full/*.md`);
its drawing, notes and measures are in `raptor-port/docs/img/handpass/2026-11-07-pictures-round/` (`notes-*.md`, the
page `index.html`, the scripts `raptor-port/scripts/handpass/pr-*.mjs`). Build each to its drawing and check it beside
it (D1424, D1495); anything the drawing did not draw is drawn for him first (D1625).

## How it runs

- **One chat per group, each on its own branch from `main`, after pull request 666 (this plan and the rulings) is live.**
  Each chat takes the next free chat number from `HANDOFF.md` (D1744) and, before its first ruling or design lesson, its
  own range: group 1 D1800–D1809, 2 D1810–D1819, 3 D1820–D1829, 4 D1830–D1839, 5 D1840–D1849, 6 D1850–D1859,
  7 D1860–D1869 (check every branch first — `DECISIONS.md`).
- **Two waves, because groups 1, 2 and 3 share the Scheduler Board's files** (`ui/board.ts`, `ui/board-html.ts`,
  `ui/SchedBoard.tsx`, the board's CSS). Wave 1: groups 2, 4, 5, 6, 7 — no two touch the same files. Wave 2: groups 1
  and 3, started once group 2 has merged (or run together, each messaging the other before touching a shared file —
  `shipping.md`, D302).
- **Every group:** the bug-check order by its checklist (tier stated, the roll-call, a walk with pictures, the plain-user
  round — D1557), the drawing check where a drawing exists, the fresh blind Opus code read, and — until Mon 9 Nov 26
  19:00 — Astra too, Sol 6.1 second where two readers are required (D1743): OIL, the published record, the rules engine.
  Opus 5.5, high, builds; Sonnet walks. Each merges on his "merge live" alone, one at a time; the later one merges `main`
  first (D78).

## The groups

1. **The board's layout** — D1780 (a phone on its side: the head scrolls away, the bar stays; to look at on his iPhone,
   the real keyboard), D1781 (821–1099 wide: remarks on their own row, the times stacked). Items [BOARD-SIDEWAYS-KEYS],
   [BOARD-NARROW-DESKTOP-REMARKS]. Notes: `notes-board.md` Q1, Q2.
2. **OIL Earn on the board** — D1782 (the slider switch "No OIL earned"), D1783 (a tap on a puck that cannot earn says why),
   D1793 (the phone day bar's two marks). Items [OIL-EARN-DAY-SWITCH-WORDS], [OIL-INERT-TAP-SILENT], [UI-CONSISTENCY-LOOK]
   (its round-5 line). OIL: two readers. Notes: `notes-board.md` Q3, Q4 §(g); `notes-marks.md` (the day bar).
3. **The schedule's marks and words** — D1784 (the waiting mark on Unavailable, week and board), D1785 (the unreadable
   week's words, the refusal grey), D1792 (a) the published-version 👁 and (d) a hidden warning's ↺. Items
   [SCHED-UNAV-PENDING-MARK], [READONLY-WEEK-WORDS], [UI-CONSISTENCY-LOOK]. The published record: two readers. Notes:
   `notes-sched.md` Q1, Q2; `notes-marks.md`.
4. **Where a day with nothing entered starts** — D1786, the rules engine (HEAVY: the robustness doctrine, the original's
   728, D179 on a published day, Insights moving at once — D482), the Logic page's words. Item
   [LOGIC-WORDS-WORKHOURS]. Two readers. Notes: `notes-sched.md` Q3 §(g); `raptor-port/docs/engine-rules.md` §Where a
   day with nothing entered starts.
5. **The Inputs page** — D1787 ("+ Input" at the right; room made from about 1340 wide, Name 110 / Start 140 / End 90
   while open; the older narrow-list fault fixed by the same narrowing at any desktop width; confirm at his look that the
   smaller-screen safety is part of his answer), D1792 (b) the Inputs calendar's ⤢ / ⤡. Items [INP-ADD-RIGHT],
   [UI-CONSISTENCY-LOOK]. Notes: `notes-sched.md` Q4; `pr-sched.mjs` q4, q4n, q4f, q4t, q4m.
6. **The Leave War** — D1788 (the bell's grey foot for "↓ N more"; the bell's own cue follows), D1789 (the pinned dates
   row in the same frame, frames measured before and after at both sizes, stop if scrolling slows). Items
   [LW-MORE-BELOW-CUE], [LW-FROZEN-BAR-GAP]; also archive [LW-TWO-BOX-LETTERS] (overtaken by D1727). Notes: `notes-lw.md`.
7. **The Tracker** — D1790 (the chart slides the event up; the window opens whole below), D1791 (Find's ✕ puts Find
   away on a phone), D1792 (c) ↺ Restore. Item [TRK-ROUND-SEEN] (2) and (3), [UI-CONSISTENCY-LOOK]. Notes:
   `notes-marks.md`.
