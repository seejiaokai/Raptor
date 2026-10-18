# The re-walk of the Schedule-and-amendments batch's fixes (19 Oct 26)

Same brief as the first walk (`2026-10-19-sched-fixes-walkers.md` — read it whole), on the NEW frozen build
`walk-676a92e43` served at `http://localhost:4240` (bundle `index-BHlvKWCJ.js`). Pictures:
`raptor-port/docs/img/handpass/2026-10-19-sched-fixes/rewalk/<letter>/`; report:
`raptor-port/docs/handpass/parts/2026-10-19-sched-fixes-rewalk-<letter>.md` (if the harness refuses the write, return the
whole report as text). Each scenario is in the designer's report (`2026-10-19-sched-fixes-scenarios-report.md`) under
its id; the first walk's sheets (`docs/handpass/parts/2026-10-19-sched-fixes-<A–D>.md`) show how each was driven and the
fixture used — reuse that route. Every row now asserts the FIXED behaviour below.

## Share R1 — the In-time / Rally lines and the drags (walker E)
- S1-01a, S1-01b, S1-01c (desktop 1440 and phone 390 by finger): the caret in a line, another line dragged — the board
  shows the new order at once, and after leaving the line every line keeps its own words (none lost, none doubled).
- S1-02: the same with the wave's ⇅ and with Sort all (desktop; phone by finger for ⇅).
- S1-08: Sort all writes ONE history line for the day ("Every section on <day> sorted"), none from the In-time sort.
- S1-03 and S3-17 (a phone on its side 844×390, by finger): a row, a section, a wave and an In-time line held still 40px
  below the top of the ~200px board pane do NOT scroll it; at 15px they do.
- His find: the board's In-time / Rally rows run the panel's width from its left — measure each row's left edge and width
  against the block at 1440 and 390 (left within 16px of the block, width within 2px of the block's inner width).

## Share R2 — focus, notes, words, the caret (walker F)
- S2-10b (1440) and S2-10f (390 by finger): the run-of-days "Breaks <day>" line tapped, then its list closed — nothing
  stays lit, nothing dim. S2-09 again as the control.
- S3-03 (week and board, phone 390 by finger): Undo, then open the changes window while its note shows — the note moves
  to the top, off the window.
- S3-10 (board, 1440 and 390): after a B typed on a flying line, Undo says "Undid: a brief time"; on an SC line "an
  in-time"; after a take-off "a take-off time".
- S3-02b (1440): an OIL answer given in the input's own window ("Change…"), then Undo — "Undid: an OIL answer".
- S4-04 (phone 390, the Scheduler Board, by finger): a changed box, then ONE tap into another line's mission and
  callsign — the caret is there and typing lands. Also on the desktop board by mouse (S4-01's board half).
- S3-16 (844×390 by finger): a crew-list puck held STILL 15px below the board pane's top — RECORD whether the pane
  scrolls, and the same with a seat's puck; and whether either scrolls once the finger moves a few pixels.
