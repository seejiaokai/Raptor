# The second re-walk of the rules check's fixes — the walker's brief (12 Nov 26)

You are a Sonnet walker. Same rules as the first re-walk's brief,
`raptor-port/docs/superpowers/briefs/2026-11-12-rules-check-fixes-rewalk-brief.md` — read it whole, and the files it
names — with these changes:

- The build is commit `a557e8d02`, served at **`http://localhost:4293/`**; its main bundle is `index-DS0eXMao.js`.
- Scripts: `raptor-port/scripts/handpass/rcf/rcf-rw2-*.mjs` (copy and adapt the first re-walk's `rcf-rw-*.mjs`; do
  not edit them). Pictures: `raptor-port/docs/img/handpass/2026-11-12-rules-check-fixes/rewalk2/`. Report:
  `raptor-port/docs/handpass/parts/2026-11-12-rcf-rewalk2.md`. Stop at about 35 minutes.

The code changed again after the first re-walk, in four places. Walk only these.

**Q1 — two clashes worded the same are now two lines (D2001: a hidden clash stays hidden while the same man is on the
same two items, and comes back when the man or either item is a different one).** Board, a clean weekday, desktop.
1. Ranger on VL BFM 12:00–13:00 and on a BRIEFING row 12:00–12:30: one red line "Ranger — VL BFM & BRIEFING clash".
2. Hide it (✕): struck, pucks plain.
3. Add a second BRIEFING row 12:30–13:00 and put Ranger on it by the crew list (arm the people cell, press Ranger).
   Expected:
   - TWO lines worded the same: the first still struck, the second live and red.
   - Ranger's pucks red.
   - A RED passing message at the drop naming the clash, not only the amber "already on …" note. Take a picture right
     after the press.
4. Hide the second line too: both struck, pucks plain.
5. Move the second BRIEFING row to 15:00–15:30: one line left, struck; pucks plain.
6. Move it back to 12:30–13:00: two lines, both struck (the same two items as before, whatever their times).
7. Delete the second BRIEFING row: one line, struck.
8. Reset arrow on it: live and red.
9. Undo, then Redo: struck, then live and red.

**Q2 — a flying standby row is red whatever the "SC MAIN clashes" settings say (D1996).**
1. Logic → ✎ Edit → under "SC MAIN clashes" untick "a flight" (it reads Advisory); leave "another shift" at Warning.
2. Board: SC wave, AM R 06:30, PM START 09:00 END 15:00, Ranger on the MAIN seat of both. Expected: red line, red
   pucks.
3. Clear AM's R. Expected: the line follows "another shift" (Warning → red).
4. Restore "a flight" (ticked, Warning).
5. Picture the Logic page's "SC MAIN clashes" setting line, with its last sentence "Once his shift flies, every clash
   is red."
Desktop.

**Q3 — View-only Sched's next-week preview prints a published day's B as it went out (D1991, D186).**
1. Week of 20 Jul: Monday, a VL BFM line take-off 12:00, landing 13:00, B blank, someone on it; publish Monday with the
   four sign-offs (the first re-walk's R5 path).
2. Back to the week of 13 Jul, View-only Sched: the next-week preview's Monday shows B 09:40 (the brief lead 2h20).
3. Logic: "Brief before take-off" to 3h20.
4. View-only Sched, the preview's Monday: still B 09:40. Edit Schedule's preview (the working copy): RECORD what it
   shows (expected 08:40).
5. Restore 2h20.
Desktop, and step 4's View-only picture again at phone 402 if the preview shows there.

**Q4 — a quick look that the AVALON desk ring (the first re-walk's R3, step 2) still rings red on the board.** One
picture, desktop.

Hand-back as the first brief says. Your final message: one line per scenario with its verdict, and the report's path.
