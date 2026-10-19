# [KEYBOARD-SCROLL] Walker A — the box being typed in shows above the keyboard (D1048), on a phone

Walker A (Sonnet 5.5), 19 Oct 26. Served build proven first: `http://localhost:4333/` serves `assets/index-BhZr7pz_.js`.
Phone 402 x 874, `isMobile`, touch, scale 3, dark; the stand-in keyboard as the brief gives it (336 high, so the visible
screen is 0..538 and a box must end at or above 530 (+1)). Landscape 874 x 402 with keys 200 (visible 0..202, so 194).
Scripts: `raptor-port/scripts/handpass/kbs-A-*.mjs` (shared helper `kbs-A-lib.mjs`; every run's numbers are in
`kbs-A-results.jsonl`, last line per id is the one reported). Pictures: `raptor-port/docs/img/handpass/2026-10-19-keyboard-scroll/walk/A/`
(`<id>-1-before` after the tap, `<id>-2-after` keys up, `<id>-3-down` keys down). Token use: about 350k by the budget counter.

**One thing about the stand-in.** The brief's snippet reads `innerHeight` when the stand-in is built, which in this
browser is before the phone's layout (it came out as 2131 high on the phone and 451 on its side). After the page loads
(before sign-in, no event) I set the stand-in's `width`/`height` to the real `innerWidth`/`innerHeight`. A1 was walked
both ways (PASS both); A2 FAILed both ways with the same numbers.

Rects are `top-bottom` in px, from `getBoundingClientRect`. "Room" is the visible bottom (538, landscape 202). "page"
is `document.scrollingElement.scrollTop`. A PASS marked *in sight* means the box was already above the keys, so the
test is that it did not move, kept focus and nothing covered it (no surface in the brief puts these boxes low).

## Results

| id | What I did | EXPECTED | What I saw | Verdict | Pictures |
|---|---|---|---|---|---|
| A1 | Scheduler Board, a flying line's remarks box (`textarea.nts`), brought low by the board's own scroll, tapped, keys up | box focused, bottom <= 530, not covered, page behind unchanged | box 788-812 before; 505-529 after; page 120 -> 120; focused; nothing covers its centre; no translate | PASS | A1-1-before, A1-2-after, A1-3-down |
| A2 | Same, phone on its side (874x402, keys 200), a time box (`input.tm`) low | bottom <= 194, in sight | box 358-383 before; 194-219 after (needs <= 194): moved up 164 only. The board shrank to 0-202 and its header takes the first 186px, so the scrolling part is 16px tall (186-202). The box sits outside it, centre at 206: `elementFromPoint` there is the page shell, not the box. Same for three different boxes (A2b-3, -6, -12). Keys down: nothing was changed, box where it was | FAIL | A2-1-before, A2-2-after, A2-3-down, A2b-3/6/12 |
| A3 | Edit Schedule week, a remarks cell (typing cell, `span.ntx.txed[data-txt*=rmks]`) low on the day | as A1 (the page scrolls) | cell 736-747 (11 high) -> 519-530; page 0 -> 217; focused (the cell is a contenteditable span) | PASS | A3-1-before, A3-2-after, A3-3-down |
| A4a | Board -> Personal Inputs (unfolded) -> the input's own window ("Gambit · 13 Jul"); its remarks box (`#inpEditRmk`) | lifted if covered; window raised and put back | box 529-562 -> 497-530; window raised by `style.translate: 0px -32px` (on `.airpop-box`); page 120 -> 120. Keys down: translate empty, box 529-562 as before | PASS | A4a-1-before, A4a-2-after, A4a-3-down |
| A4b | Same window, "all day" unticked, Start time box (`#inpEditStart`, native time) | in sight, must not move | 482-520 before and after (already above 530); no translate; focused. In sight only | PASS (in sight) | A4b-1/2/3, A4-times-revealed |
| A5a | Inputs page, Jul 2026, tap 13 Jul: the day's title box (`#icRmkEdit`) | in sight, must not move | 74-112 before and after; page 0; focused | PASS (in sight) | A5a-1/2/3 |
| A5b | Same day, "+ Note": the new note's box | in sight, must not move | 178-208 before and after; focused | PASS (in sight) | A5b-1/2/3, A5-note-added |
| A5c | Same day, 12 notes added, the pencil of the lowest note (618-646) tapped, its edit box (`.ic-poppuck-edit`), keys up | bottom <= 530 | box 509-537 after: **1px above the keys' top (538), not the 8px gap**. The day's list (`sd-list`) is at its very end (scrollTop 109 of max 109) so it cannot rise further. Box visible, uncovered, focused; the day panel and page did not move | FAIL (gap 1px not 8; box visible) | A5c-1-before, A5c-2-after, A5c-3-down, A5c-many-notes |
| A6a | Inputs page "+ Input" window (day panel > "+ Input"), remarks box (`#inpEditRmk`) | in sight, must not move | 340-373 before and after; focused; page 0. The window is tall, the remarks box never low | PASS (in sight) | A6a-1/2/3 |
| A6b | Same window with "CUSTOM" picked (time boxes added above the remarks) | same | 362-395 before and after | PASS (in sight) | A6b-1/2/3, A6-custom |
| A7a | SANS tab, Jul 2026, tap 13 Jul, "+ Commitment" window: remarks box | in sight, must not move | 363-396 before and after; focused | PASS (in sight) | A7a-1/2/3, A7-day, A7-commit-window |
| A7b | SANS ⚙ settings, "Red from" number (`[data-testid=sset-red]`) | in sight, must not move | 396-434 before and after; focused. (The two cut-off boxes lower in that sheet are selects, not typing boxes) | PASS (in sight) | A7b-1/2/3, A7-gear-open |
| A8a | Logic page, ✎ Edit pressed, the last setting box (`input.lgin`) brought low by the page's own scroll | as A1 (page scrolls) | box 782-818 -> 494-530; page 1642 -> 1930; focused | PASS | A8a-1/2/3 |
| A8b | Logic search box (`#lgSearch`) at the top | in sight, must not move | 67-83 before and after; page 0 | PASS | A8b-1/2/3 |
| A9 | Admin -> Duty templates (`#admDutyTpl` pressed through the page), STANDARD tab, last role's End time (`input.tm`) | window rises, then goes back down with the keys | End 516-544 before (6px under the keys); keys up: window raised by `.modal-box` `translate: 0px -14px` (box top 224 -> 210), End 502-530; page 0 -> 0. Keys down: translate empty, box top 224, End 516-544 | PASS | A9-1-before, A9-2-after, A9-raised-detail, A9-3-keys-down |
| A9b | AVALON tab, "+ Add role" until 14 roles; the window scrolled to its foot; last role's End time | box above keys; window held to the visible screen; **its title stays on screen**; all put back with keys down | Before: window 18-856, its own `overflow:auto` but nothing to scroll; End 722-750. Keys up: window 8-530 (maxHeight 522, translate -168), its own body scrolled to 218 of 316; End 494-522, focused, not covered. **The window's title "Duty templates" is at -195..-174 and its close ✕ at -194..-174: both scrolled out of sight (the title is inside the scrolling body, not fixed).** Keys down: window 18-856, translate empty, scroll 0, End 722-750 | FAIL (box fine; title not on screen) | A9b-14roles, A9b-1-before, A9b-2-after, A9b-3-down |
| A10 | Admin -> Wave templates, "+ New wave template", "+ Add line" x3 (4 lines), last line's LD box (`input.tm[placeholder=LD]`) | box above keys, window back after | LD 784-816 -> 490-522 keys up; window box 12-862 -> 8-530, `translate 0px -168px`, own body scrolled 162 -> 478 (max 586). Keys down: translate empty, box 12-862, body scroll 258 (kept at its foot), LD 714-746. (I did not find the window's title element to measure it: the same hidden-title question as A9b may apply) | PASS | A10-lines, A10-1-before, A10-2-after, A10-3-down |
| A11 | Admin -> Users, the new person form's lowest box (`#accAddName`, sign-in name) brought low by the page | bottom <= 530 | box 784-817 -> 510-543: **5px under the keys' top (538), bottom 13px past the 530 line**. The page is at its scroll end (scrollTop 3113 of max 3113); 331px of the page (the form's other rows and buttons) lies below the box, so the page cannot rise more. Focused, `elementFromPoint` at the centre (526) is the box | FAIL | A11-1-before, A11-2-after, A11-3-down |
| A12 | Quals page, "Enable editing", an initials cell (`input.qinit`, 20th) brought low | focused, bottom <= 530 | tap focused it (focus event, active element = the box). Then keys up: the table is **redrawn: the box element is removed from the page and the focus drops to the body** (focusout 6ms after the keys-up event; `isConnected` false). The page scrolled 82 -> 362 and a new cell stands at 511-529, but nothing is focused: whatever he types next goes nowhere. Controls: keys up with nothing focused leaves the box in place; a scroll of the page while focused leaves it focused; so it is the keys-up with a focused cell that redraws | FAIL (focus lost) | A12-1-before, A12-2-after, A12-3-down |
| A13 | Leave War ⚙ -> "＋ Counter" ("New counter" sheet), "Red below" (`cform-red`) at the sheet's foot | box in sight; sheet put back | sheet 273-860 -> 57-530 (it reshaped itself: `bottom: auto`, `maxHeight 473px`), its own body scrolled 0 -> 59 of 114; Red below 757-797 -> 482-522; page 0. Keys down: sheet 273-860, Red below 757-797 as before | PASS | A13-1-before, A13-2-after, A13-3-down |
| A14 | Leave War -> "◷ OIL tracker" -> a person's name (Reaper) -> the credit form's days box (`oil-amt`) | box in sight | box 755-785 -> 411-441; sheet 0-874 -> 57-530 (`maxHeight 473px`). Keys down: sheet 0-874, box 755-785 | PASS | A14-1-before, A14-2-after, A14-3-down |
| A15a | Tracker, search icon pressed, search box (`#hSearch`) | in sight, must not move | 130-154 before and after; focused | PASS (in sight) | A15a-1/2/3 |
| A15b | Tracker, a ball pressed, "Edit details", the Prerequisites box (low in that dialog) | lifted, put back | box 487-539 -> 478-530; dialog translate `0px -9px` (on `#infoModal`'s box); keys down: translate empty, box 487-539 | PASS | A15b-1-before, A15b-2-after |
| A16 | Help (menu -> Help) "report a problem", the text box (`#bugText`) | in sight, must not move | 275-353 before and after | PASS (in sight) | A16-1/2/3 |
| A17 | Signed out, sign-in page, password box (`#lpass`) | in sight, must not move | 262-302 before and after; focused | PASS (in sight) | A17-1/2/3 |
| O1 | A9 window: Start/End of the first role tapped (444-472, in sight), keys up, then the LAST role's End tapped with the keys already up | the second box is brought up too | second End 516-544 -> 502-530 on the tap, window `translate 0px -14px`, focused, not covered | PASS | O1-1-first-box-keys-up, O1-2-second-box-tapped-keys-up |
| O2 | A9 window raised (translate -14, box top 210), keys still up, the template-name box near the top tapped | window comes back down towards where it stood, never below | translate went empty, box top 224 (where it stood); name box 329-363 focused, in sight | PASS | O2-name-box-tapped |
| O3 | A9 window raised again, then blank text inside the window tapped ("An ordinary desk — every row…") | window goes back where it stood | translate empty, top 224; the focus is on the body | PASS | O3-raised-again, O3-after-blank-tap |
| O4 | A1's box focused, keys up (box 505-529); 3 seconds later the stand-in's keys changed to 300 high (vv height 574) | nothing moves | rect 505-529 before and after; board scroll 1606 -> 1606, page 120 -> 120 | PASS | O4-after-late-resize |
| O5a | Desktop 1440x900, no stand-in; A1's board box brought low, mouse-clicked | nothing scrolls | box 808-832 before and after; board scroll (`.sb-boardwrap` 358), page 0 unchanged; focused | PASS | O5-desktop-board-click |
| O5b | Desktop, A8's last Logic box brought low, clicked | nothing scrolls | box 804-836 before and after; page 434 -> 434; focused | PASS | O5-desktop-logic-click |
| O6 | A1's box brought low and tapped; stand-in `scale = 2`; keys up | nothing moves | box 788-812 before and after (still low, under the keys: nothing lifted); board scroll 1323 -> 1323; page 120; focused | PASS | O6-pinch-keys-up |
| BREAK-a | A1: after the tap, the keys' height set (538) and **no resize event dispatched** | the box stays covered (A1's check goes red) | box stays 788-812 for 1.2s; A1's check RED (bottom 812 > 530). Control: dispatching the event after that did not lift it either, because it came more than 1.5s after the focus (the same rule as O4) | PASS (the event is what drives it; step red) | BREAK-a-no-event |
| BREAK-b | A9 lifted (translate 0px -14px, box 502-530, check green); console step sets the window's `style.translate = ''` | the box is covered again (check red) | box back to 516-544; check RED (bottom 544 > 530) | PASS (the raise is what shows it; step red) | BREAK-b-translate-cleared |

Counts: 29 rows PASS (20 scenario rows, 7 order rows, 2 break tests; 10 of the scenario rows are "in sight" only), 5 FAIL (A2, A5c, A9b, A11, A12),
0 NOT REACHED. Orders O1-O6 all PASS; both break tests went red as they should.

## FAILs, with exact steps

**A2 — landscape board, the keys hide the box (no way to see it).**
1. New phone context 874 x 402, `isMobile`, touch, the stand-in installed; sign in `ad` / `a`; `go('editsched')`; `openScheduler(0)`.
2. Scroll the board's own scroll area (`.sb-boardwrap`) until a time box (`#schedBoard input.tm`, e.g. the 7th) is near the foot (bottom 383); tap it.
3. Keys up: `__vv.height = 402 - 200; dispatch resize`; wait.
4. The board shrinks to 0-202, its header (title, day chips, CAT/TYPE/QUALS, the button row) fills the top 186px, the content area is 16px tall, and the box is at 194-219 outside it. Picture `A2-2-after`. The box cannot be seen or reached. (Expected: box bottom <= 194.)

**A5c — Inputs calendar opened day, a low note's edit box ends 1px above the keys, not 8.**
1. Phone, sign in, `go('inputs')`, step the month back three times to Jul 2026, tap 13 Jul.
2. Press "+ Note" 12 times, typing a word and Enter each time.
3. Tap the pencil of the lowest note (618-646); the edit box becomes focused.
4. Keys up: the day's list scrolls to its end (109 of 109) and the box ends at 509-537 (keys' top 538). Needs <= 530. Cause: the list has no room below its last row, so it stops.

**A9b — Duty templates window, 14 roles: the title is not on screen with the keys up.**
1. Phone, sign in, `go('admin')`, press `#admDutyTpl` through the page, tap AVALON, press "+ ADD ROLE" until 14 roles.
2. Tap the last role's End time (at 722-750), keys up.
3. The window holds itself to the visible screen (box 8-530) and scrolls its own body (218 of 316): the End box is at 494-522, fine, but the title "Duty templates" and its ✕ are at -195..-174, off the top; picture `A9b-2-after`. (Expected: the title stays on screen.) Keys down puts everything back (box 18-856, scroll 0).

**A11 — Admin -> Users, the new person form's lowest box ends 5px under the keys' top.**
1. Phone, sign in, `go('admin')`, tap the "Users" card, scroll the page until the sign-in name box `#accAddName` is at 784-817 (page scroll 2839), tap it.
2. Keys up: the page scrolls to its very end (3113 of 3113) and the box is at 510-543 (keys' top 538); the lower 5px are under the keys. The box's centre (526) is above the keys and nothing covers it. 331px of page remain below the box, so the page had no more to give.

**A12 — Quals (edit): the focused cell is torn out of the page when the keys come up.**
1. Phone, sign in, `go('quals')`, press "Enable editing" (`#qEdit`).
2. Scroll the page until an initials cell (`input.qinit`, e.g. the 20th) is low (791-809); tap it: it takes the focus.
3. Keys up (`__vv.height = 538; dispatch resize`): within about 6ms the focus moves to the body and the cell I tapped is no longer in the page (the table was redrawn). A fresh, unfocused cell stands at 511-529. Typing now would go nowhere.
Controls: the same keys-up with nothing focused leaves the cell in place; scrolling the page 40px while the cell is focused leaves it focused; refocusing and then keys up detaches it again. I did not check other Quals cells (callsign, level select) or the other redrawing tables.

## Passing, but worth knowing

- A4a/A9/A10/A13/A14/A15b: on keys down the window or sheet went back exactly (translate empty, rect as before). A10 and A9b keep the window body's scroll position they had (not put back to the top); that is the page's own scroll, not a fault.
- A2b (three other boxes in the landscape board) all ended at 194-219, the same 25px short.
- Boxes that the brief calls "low" in A5, A6, A7, A16, A17 are in sight at the phone size in this build, so those rows test "must not move" only; A5c is the one low box I could make in A5.
- No console errors, page errors or 4xx on any run (`errors []` every time).
- Two small things in passing, not failures: the Duty templates window has no ✕ visible while raised in A9b (title bar scrolled away, see A9b); the Quals table's redraw on keys up (A12) was the only surface where focus was lost.

Browsers: every script closes its own; no browser of mine is left running (no servers started or stopped).
