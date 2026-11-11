# The re-walk of the two small Quals fixes, after two fix rounds — the walker's report (11 Nov 26, chat 64, job 3)

The Sonnet walker's hand-back, saved as it arrived (its brief: `docs/superpowers/briefs/2026-11-11-quals-small-rewalk-brief.md`). The app built from `8ed7b7688` (the walker's flag about the checkout's head: the commit after it, `0c86548be`, changed only briefs — the host checked that no app file differs). Two of its phone lines (R5a's third tap, R5c's drag of the added column) were its script's aim under the pinned name heading — the host's look, `r-host/`, the sheet's §12.

RE-WALK REPORT, job 3. Server on port 4391 is stopped. I did not build. One flag first: `git rev-parse` in the checkout printed 0c86548be, not the 8ed7b7688 your brief names. I did not check which build `dist` actually is.

Pictures: 19 `r-*` folders, nothing deleted. Citable: r-filter-pc, r-filter-phone, r-filter-wk, r-filter-wide, r-trip-pc, r-trip-phone, r-2f2, r-drag-pc, r-drag-phone, r-drag-edge, r-pin, r-pin-pc, r-pin-phone, r-lw, r-misc-ppc, r-misc-pphone, r-misc2. Superseded: r-2f (first run, its own-heading and body pinch steps failed), r-misc (empty).

**R1 filter case (pc, phone, WK): PASS.**
- a: With the filter "ace" hiding Zenith (the last pilot, vinci), "Check his quals" left the page at y=0 and nothing was outlined, on all three. b: a tick elsewhere in Edit and a sort kept y=0, still nothing outlined.
- c: Backspacing one key at a time, at the key that drew his row (the third) he was outlined and the page went to him once. The page went y 0 → 677 (pc), 587 (phone), 847 (WK). His row was clear of the bar and pinned heading (pc top 423 vs 127). Picture r-filter-pc.
- d: Select-all then Delete gave the same, once: 524 (pc), 434 (phone), 467 (WK). The box has no clear control.
- OBSERVED (c and d): the page goes to him but the filter box is then scrolled out of view (top -556) while it still has focus and the caret at 0. This was the same on all three sizes.
- e: After the trip, a tick, a sort, and the filter typed and cleared again, all from y=0 with him off screen: the page stayed at y=0. He stayed outlined.
- f: With the filter hiding the man, Undo and Redo outlined nothing and left y=0. On clearing, he was outlined (row top 263 pc, 247 phone) and the page stayed because he was in view. NOT fully tested: a one-row filter leaves a page that can't scroll, so the "goes there once if out of view" case could not be made. I did not try a milder filter that hides him.
- g: Covered through e, plus entering and leaving Edit in the first-walk A2 script. I did not re-run the A1/A2 sequence on this build.
- h: OBSERVED, not a valid test. A second Check for casper needs a trip through Admin, which resets the page to y=0, and casper's row (top 687) was already in view.
- i: At 2560×1440 the page doesn't scroll (docH 1440). "Check his quals" for Zenith left y=0 with his row in view and outlined (top 1091). A tick elsewhere: y stayed 0. PASS.

**R2 pinned drag: PASS.**
- pc: A three-column drag gave one lift frame and one landing mark, and the order was the same in the pinned row and the table. Undo, Redo, a left drag, a drop on itself, a press-and-release, a slow drag and a flick all behaved as expected. y stayed 320. In a drag carried to the right edge, the table scrolled sideways to 201 and the pinned row stayed in step, for both the pinned and the table's own heading.
- phone: The finger drag, a slow drag and a flick all worked, and y stayed 320.
- Phone edge-scroll: NOT RUN. The edge-scroll test (R2c) was run on desktop only.

**R3 second finger: PASS (a, b, c, e).**
- In a, b and c the second finger cancelled the drag. No column moved, Undo gained nothing, and no lift frame, landing mark or picked-up look was left. A fresh one-finger drag worked straight after (a and b on the pinned row, c on the own heading after scrolling to the top).
- OBSERVED (c): the two-finger gesture on the table's own heading moved the page 13px (y 0 → 13).
- d (record only): With two fingers pinching apart, nothing changed on the pinned row, the table's own heading or the table body. Table width stayed 2880, viewport scale stayed 1, and no column moved. No zoom was seen.
- e: A live finger drag, then a mouse press on another pinned heading, cancelled it. Nothing was left and no column moved.

**R4 and R4b: PASS.** In both, one lift frame and one landing mark stayed through the resize, and the pressed heading kept its picked-up look. The drop wrote the order and Undo restored it. In R4b (2400×900 narrowed to 2100) the landing mark moved from the Scheduler heading to the SC DAY heading after the 1px move. I did not check whether the columns relaid out.

**R5.** pc is PASS throughout.
- a: A tap on a pinned heading shows its sort mark at once.
- b: In Edit the pinned row shows 20 ✕ and drags. After Done it shows 0 ✕, no draggable headings, and a view-mode drag lifts nothing.
- c: After adding a column and after removing one with the table's own ✕, the pinned row and the table showed the same columns (17 each). The added column dragged by its pinned heading, and Undo put it back.
- d: Across all four tabs and a filter, pinned and table headings matched in text, left edges and widths.
- Phone: b and d are PASS, and e is PASS (after pinching out and in, pinned lefts and widths equalled the table's, and the pinch changed the scroll position and the column left edges).
- Phone OBSERVED: the third tap in R5a showed the sort mark still on cat, and the added column's pinned drag moved nothing. Both are likely my script aiming under the frozen name column, so I would not call them findings.
- f: NOT RUN. The earlier pinch-in left the page unscrollable (y=0), so the flick test was invalid.

**R6.**
- a: NOT RUN. I moved a column by its pinned heading (Quals order became SANS, Management, Scheduler, SC DAY, SC NIGHT, SXO …), but I could not find a per-person quals list on the Leave War. A click on a person puck failed. The qualification words appear on that page only as puck labels and grid text. Pictures are in r-lw.
- b and c (phone): PASS. "Check my quals" went to his row once and outlined it. The member sees no Edit quals, no ✕ on the pinned row, and a drag lifts nothing.

**R7:** Same as the first walk on both sizes (34/24/3/61 tab rows, tick/undo/redo, sort, add and remove a column, Done, a csv export, "+ Add person" going to Admin). No differences.

Errors: no page, console or network errors in any run.
