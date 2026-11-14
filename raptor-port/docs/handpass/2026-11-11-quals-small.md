# Evidence sheet — two small Quals faults (`claude/quals-small-1111`, pull request 758) — 11 Nov 26, chat 64, job 3

`[QUALS-OUTLINE-RESCROLL]` — the outline after "Check his quals", "Check my quals" or an Undo takes the page to its row
once. `[QUALS-PINNED-HEAD-NO-DRAG]` — in Edit quals, scrolled down, a heading in the pinned row under the top bar drags
its column as the table's own heading does. Pictures: `docs/img/handpass/2026-11-11-quals-small/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money / OIL / who counts as present | NO — Quals' page scroll and a heading's press; no figure is worked out |
| 2 | The published record | NO — nothing of a schedule is read or written |
| 3 | Saved data | NO — the column order is saved by the same writer the table's own heading already uses; no new field |
| 4 | A shared drawer | NO new one — but the heading is drawn in copies (the table's own row, the pinned copy), so §6's "a part drawn in more than one copy" row is run |
| 5 | A new gesture or mode | **YES** — a new place to press: the pinned heading now starts the column drag |
| 6 | A new surface | NO |
| 7 | Roles | NO — who may edit quals is untouched (checked in the walk: a member gets no drag from the pinned row) |
| 8 | The warning list | NO |

**Tier: WALK.** The night's plan adds Astra's read and a fresh, blind Opus read of the finished code (D1770, D790).

## 2. The rulings that apply

Run ids: A and B are the first walk's (on the first build), R the re-walk's (on the last build, `8ed7b7688`), H1 the
host's own short look. Sizes: pc 1280×800, ph a phone 402×874 by touch, WK WebKit at the phone's size.

| Ruling | In the app's words | Result |
|---|---|---|
| D672 | Undo and Redo leave the screen where it is when what they change is in view, and move to the change only when it is out of view | PASS — Undo at the page's foot took the page to the changed row (pc 677 → 0, ph 587 → 0, WK 847 → 0); Redo with the row in view left it; Redo with it out of view went (A6); from Edit Schedule the app opens Quals on the row (A7); with the filter hiding the man nothing moved, and on clearing he was outlined and the page stayed, his row being in view (R1f) |
| D895 | The drag rules — a drag lifts what is pressed, shows where it will land, and a tap moves nothing | PASS — one lift frame, one landing mark on the heading under the pointer, a press and release lifts nothing, a drop on itself changes nothing and leaves Undo grey, the edge scroll carries the table and the pinned row together (B2, B3, R2). Named, not changed: a window resized in the middle of a drag leaves the lift frame at its old place until the drop (filed, `[QUALS-DRAG-LEFTOVERS]`) |
| D1281 | On a phone a pinned cell never turns see-through while pressed | PASS — the pinned cells opaque mid-drag and within about 100ms of the lift (`b-phone4/B3-phone-4-early-100ms`, `r-drag-phone/B3-phone-4-early-100ms`), and through a pinch (R5e) |
| D785 | A scheduler is always an admin; a member edits only his own Quals row | PASS — the member sees no Edit quals, no ✕ on the pinned row, and a drag lifts nothing (B6 pc, R6c ph) |
| D1557 | The plain-user round of the screen | PASS — the filter, the four tabs (34 / 24 / 3 / 61 rows), tick, untick, Undo, Redo, a sort, a column added and removed, Done, Export, "+ Add person", on pc and ph, on the first build and again on the last (R7) |
| D1567 | Only the grids that zoom by their own pinch zoom | as on `main`: two fingers on the pinned row do not zoom the table (the table's own rows do); a drag is now cancelled by the second finger on both heading rows. Joining the pinned row to the pinch is not built — filed (`[QUALS-DRAG-LEFTOVERS]`) |

(The Quals page's own rulings the walker and the readers open: `.claude/rules/decisions/people-accounts.md`.)

## 3. The roll-call

The things: (a) Quals' row outline and its one trip; (b) a column heading, in each copy the page draws.

| # | Place | Shows | Usable | What else is painted there |
|---|---|---|---|---|
| a1 | The outline after the admin's "Check his quals" (from Enable / Restore on Admin → Users) | has it — the row outlined, one trip (pc 0 → 524, ph 434, WK 467), the row clear of the top bar and the pinned heading | later changes of every kind leave the page (A2, R1e); a second Check goes again (A4) | the passing note "Zenith can sign in again" at the foot; the pinned heading above the row |
| a2 | The outline after a man's own "Check my quals" welcome note | has it — his row outlined and in view (A5 pc; R6b ph: one trip) | a tick on his own row: no jump (R6b) | the welcome note, gone once pressed |
| a3 | The outline after Undo of a Quals change, on the Quals page | has it — at the foot, Undo takes the page to the row (A6) | a tick elsewhere after it leaves the page (677 pc, 587 ph) | Undo and Redo in the top bar |
| a4 | The outline after Redo of a Quals change, on the Quals page | has it — in view: the page stays; out of view: it goes (A6) | as a3 | — |
| a5 | Undo / Redo of a Quals change pressed from another page | has it — pressed on Edit Schedule, the app opens Quals with the changed row outlined, in view (A7) | a tick elsewhere: no jump | — |
| b1 | The table's own heading row (Edit quals) | has it — the drag as before | a second finger cancels the drag (R3c) | each heading's ✕, which removes the column at once (Undo brings it back) |
| b2 | The pinned copy's moving row of headings (Edit quals, scrolled down) | has it — the same drag, by mouse and by a finger (B2, B3, R2) | one lift frame, one landing mark, Undo and Redo; a second finger cancels it (R3a, R3b) | each heading's ✕ — **MISSING, older than this change: a press on it does nothing** (the table's own ✕ removes the column); filed, `[QUALS-PINNED-X-DEAD]` |
| b3 | The pinned copy's still name heading | must not drag, because it is not a qualification column — a press sorts by callsign, as the table's own does (B4) | — | on a phone it covers the headings slid under it (its right edge at 144 of 402 — H1) |
| b4 | The lift frame and the landing mark during a drag from the pinned row | has it — one of each, the landing mark on the heading under the pointer (`a-pc4/A2-pc-13-drag-pinned`, `b-phone4/B2-phone-5-mid-drag`) | kept through a redraw and a window narrowed mid-drag (R4, R4b) | the frame keeps its old place after a resize mid-drag (filed) |
| b5 | The pinned headings outside Edit quals (view) and for a member | must not drag, because only Edit quals reorders columns — a tap sorts, the mark showing on the tapped heading at once (B5, R5a, H1); a member: no ✕, no drag (B6, R6c) | — | the sort mark |
| b6 | Where the column order shows after the drop: the table, the pinned row, the Leave War's quals list, Export | the table and the pinned row: the same order, left edges equal (B2, B8, R5d); Export's heading row follows it (B9) | — | the Leave War's list of quals (in its settings) was not found by the walker — §12 |

One row per opener of the trip (a1–a5): the person is still on the page they started from in each — only a5 changes
page, by design (Undo opens the page its change is on).

## 4. The door check (the new place to press)

| State | Press on a pinned heading | Result |
|---|---|---|
| Edit quals, admin, desktop, mouse — drag | lifts, shows where it lands, drops, the order changes in both rows; slow, a flick, left, right, to the edge | PASS (B2, R2a, R2c) |
| Edit quals, admin, phone, finger — drag | the same by a finger at an ordinary speed, slowly and as a flick; the page's place unchanged (320) | PASS (B3, R2b) |
| Edit quals — a tap, no movement | lifts nothing, writes nothing | PASS (B2) |
| Edit quals — the ✕ inside a pinned heading | does nothing — older, the table's own ✕ removes the column | filed, `[QUALS-PINNED-X-DEAD]` |
| Edit quals — the still name heading | sorts by callsign, no drag | PASS (B4) |
| Edit quals — a second finger during the drag | the drag is cancelled: no column moves, Undo gains nothing, nothing is left on screen, and a fresh drag works at once | PASS (R3a, R3b; the table's own row R3c) |
| Edit quals — a mouse press during a finger's drag | the drag is cancelled, the press starts none | PASS (R3e) |
| View (not Edit quals), admin | a tap sorts; a drag lifts nothing | PASS (B5, R5b) |
| A member | no ✕, no drag, the order unchanged | PASS (B6 pc, R6c ph) |
| With the filter box holding text; with a sort on | the drag moves the column (the filter "a" typed) | PASS on pc (B7); on a phone the filter shortens the page and the pinned row hides; a sort on: not run |

## 5. The five sizing lines (D607)

1. **Type:** C (a new place to press for an existing gesture) and E in part (what scrolls, and when); the outline fix is a behaviour fix on one page.
2. **What only a walk could find:** the pinned copy against the table's own heading at each size and by finger; the page's own scrolling under a finger's drag; WebKit (the builder's browser tests ran in Chromium); every opener of the outline's trip; what a later change of each kind does to the page's place. The tests already carry: the trip made once (unit and browser, desktop and phone), the pinned drag's lift frame and landing by mouse and by finger in Chromium.
3. **What the ledger says:** 15 walks of type C recorded, about half found something; the 6 Nov 26 walk of this same page (a heading dragged by a finger, the pinned name heading) found faults a test browser's touch showed.
4. **The walk chosen:** one Sonnet walker, scripted, on the served production build: desktop 1280×800 and a phone 402×874 by touch in Chromium, the pinned-heading drag and the outline's trip again in WebKit at the phone's size; about 30 scenarios with the plain-user round; no case left to a test alone.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 6. The lessons of §7.11 — each against this change

| # | The lesson, short | What covers it here — or why it cannot apply |
|---|---|---|
| 1 | every state × every reading | the ask's states walked: his row in view (A4 — no move), out of view (A1), hidden by the filter (A8, re-walk R1), a second ask (A4, R1h); the pinned heading's states: view, Edit quals, a member (B5, B6, R5b, R6c) |
| 2 | a gesture at a person's speed | the pinned drag slow (40 steps) and as a flick (2 steps) by mouse (B2), by a finger at ordinary speed and as a flick (B3, R2b) |
| 3 | feedback looked for | the lift frame, the one landing mark, the picked-up look and the row's outline each pictured (B2, B3, A1) |
| 4 | the page behind an open window | cannot apply — no window is opened by either fix |
| 5 | a thing brought into sight against what stands over it | the trip's resting place measured clear of the top bar and the pinned heading: desktop row top 613 against 127, phone 687 against 73, the short screen 413–440 against 127 (A1, A10); again after the filter's trip (R1c) |
| 6 | what only the real phone draws | nothing is handed to the phone; a finger's drag on the pinned row in Safari is undriven by any test browser — on his look card |
| 7 | a mechanism tuned to a model of the phone | the trip's one-frame wait after an edit of the filter box answers the browser's own "bring the cursor back into view" — walked in Chromium and WebKit (R1 WK), and named for his iPhone look, since only his phone shows what Safari does there |
| 8 | an approved drawing | cannot apply — no look changes, no drawing |
| 9 | a list measured, in every kind | the pinned headings' left edges measured against their columns' cells after a drag, at the foot and the top, desktop, phone and WebKit (B8), again after the fixes, a tab change, the filter and a pinch (R5d, R5e) |
| 10 | a way back to a page | left for Logic and returned, and a reload: no outline, no scroll (A9) |
| 11 | a reading that depends on how much fits | "is his row in view" walked at the short screen 1280×600 (A10) and at 2560×1440 (R1i) |
| 12 | a window opened from one page only | no window; the trip's openers are each walked — Admin → Users' prompt (A1), the welcome note (A5, R6b), Undo / Redo on Quals (A6) and from Edit Schedule (A7) |
| 13 | a pinch part-way down a list | R5e — the table pinched part-way down, fingers drifting, pictured mid-pinch, the pinned row measured after |
| 14 | every box to type in | cannot apply — no new box; the filter box is typed in on the phone (R1c) |
| 15 | a pinned bar by what it lets through | the pinned cells opaque mid-drag (B3) and during a pinch and a flick to the foot (R5e, R5f) |
| 16 | a warning cleared only by a new value | cannot apply — no warning or refusal |
| 17 | a control that changes a page's width | cannot apply — neither fix shows, hides or resizes a part; the edge scroll under a drag keeps the pinned row in step (B2, R2c) |
| 18 | what only a real print or download shows | Export's file read after a pinned drag — its heading row follows the new order (B9) |
| 19 | a window over a window | cannot apply |
| 20 | a gesture the ways a hand does it | slow, a flick, a 40px wobble (the fix round's test: the same on both heading rows), a second finger (R3), and a fresh drag at once after a cancelled one (R3) |
| 21 | a test browser's touch is not his phone's | said on the sheet's §12 and on his look card: a finger's drag and a second finger on the pinned row on his iPhone |
| 22 | "shown" judged by what is drawn | the outline read as painted (a 2px cyan line inside the row's cells) and pictured; the lift frame and landing mark pictured mid-drag, the host opening them |
| 23 | what a tap opens, against the rulings | no window; the ruled behaviour for Undo / Redo (D672 — stay when the change is in view, go only when it is not) is the expected one in A6, A7 and R1f |
| 23 (second) | a fault in the picture, looked past | the host opened the deciding pictures and looked at the whole screen in each (§9) |
| 24 | a flick to the page's foot on a phone | R5f; the bounce and the folding toolbar are his iPhone's — on his look card |
| 25 | only where the demo already had it | the man sent to was given his sign-in through Admin → Users, not seeded (A1); a column added by hand is dragged by its pinned heading (R5c) |
| 26 | a gesture by where the thing went | the landing mark stands on the heading under the finger, the lift frame follows it, and the column lands there (B3, R2) |
| 27 | a control's place across the change beside it | the pinned headings' boxes measured before and after a drag (B8); no other control stands beside them |
| 28 | a press by a script that scrolls first | the phone's presses are fingers at points on the pinned row, which is on screen by its nature; the page's place is recorded before and after each |
| 29 | a page left open while the day turns | cannot apply — nothing here reads today |
| 30 | a tint left by a press | the phone pictured within about 100ms of the lift, the finger's place left (B3 `…early-100ms`, the re-walk's phone pictures) |

## 7. The orders walked

No figure is worked out by either fix; each line is what the screen did.

| # | The order | Where | Result |
|---|---|---|---|
| 1 | "Check his quals" → the page goes to him → a sort twice, the filter typed and cleared, into Edit, a tick, an untick, into Edit quals, a drag, out of Edit | pc, ph, WK (A1, A2) | one trip; nothing after it moved the page; the outline stayed on him |
| 2 | A second "Check his quals" for the same man | pc, ph (A4) | goes again (0 → 524, 0 → 434) |
| 3 | "Check my quals" → a tick on his own row | pc (A5), ph (R6b) | one trip, outlined; no jump |
| 4 | A tick at the top → the page's foot → Undo → a tick elsewhere → Redo in view → Redo out of view | pc, ph, WK (A6) | Undo goes to the row; the tick leaves the page; Redo stays when in view and goes when not |
| 5 | Undo pressed on Edit Schedule | pc, ph (A7) | Quals opens, the changed row outlined |
| 6 | The filter hiding him → "Check his quals" → a tick, a sort → the filter cleared a key at a time → a tick, a sort, the filter typed and cleared again | pc, ph, WK (R1a–c, e) | nothing while he is hidden; at the key that draws his row he is outlined and the page goes once (0 → 677 pc, 587 ph, 847 WK), his row clear of the bar and the pinned heading; nothing after |
| 7 | The same, the filter cleared by selecting all its text and deleting | pc, ph, WK (R1d) | the same, once (524, 434, 467) |
| 8 | The filter hiding him → Undo, Redo → the filter cleared | pc, ph (R1f) | nothing while hidden; outlined on clearing, the page staying (his row in view) |
| 9 | Leave Quals for Logic and return; reload | pc, ph (A9) | no outline, no scroll |
| 10 | The short screen 1280×600; the wide screen 2560×1440 | A10, R1i | the trip lands clear of the bar; at 2560 nothing needs to move and nothing does |
| 11 | A pinned heading dragged by mouse: three right, left, on itself, press and release, slowly, a flick, to the edge; Undo, Redo | pc (B2, R2a, R2c) | each as the table's own heading |
| 12 | A pinned heading dragged by a finger: ordinary, slow, a flick | ph (B3, R2b) | the column moves, the page stays at 320 |
| 13 | A second finger during the drag — on another pinned heading, on the table below, and begun on the table's own heading; then the first finger again; then a fresh drag | ph, two real fingers (R3a–c) | cancelled each time, nothing written, nothing left on screen, the fresh drag works |
| 14 | A mouse press during a finger's drag | ph size (R3e) | cancelled, nothing left |
| 15 | The window's size changed mid-drag; a wide desktop narrowed mid-drag (2400 → 2100) | pc (R4, R4b) | the picked-up look, one landing mark and the frame stay; the drop writes; Undo |
| 16 | The pinned row keeps up: three sort taps; into and out of Edit quals; a column added, one removed, the added one dragged by its pinned heading; the four tabs and the filter; a pinch out and in | pc and ph (R5a–e; the phone's taps by the host, H1) | the pinned row matches the table in words, left edges and widths each time |
| 17 | The view and the member's doors | pc, ph (B5, B6, R5b, R6c) | shut |
| 18 | Export after a pinned drag | pc (B9) | the file's heading row follows the new order |

## 8. The cases carried by a test

Browser tests: `e2e/geometry.spec.ts`, the block "Quals: the outline's one trip, and a column dragged by a pinned
heading". Unit tests: `src/ui/quals.test.tsx`. Each was seen red before its fix.

| Case | Test | What it proves |
|---|---|---|
| After "Check his quals", a tick on another man's row leaves the page where it is (desktop 1000×700, phone 402×700) | browser, `[QUALS-OUTLINE-RESCROLL] …: after "Check his quals" a tick on another man's row leaves the page where it is` | the page's scroll, read in a real browser, before and after the tick |
| After an Undo outlines a row, a tick elsewhere and a sort leave the page (both sizes) | browser, `… after an Undo outlines a row, a tick elsewhere and a sort leave the page where it is` | the same for Undo's ask |
| A later repaint puts the outline back and makes no trip; a new ask goes again | unit, `a later repaint, a tick elsewhere and a sort put the outline back and leave the page alone; a new ask goes again` | one trip an ask, counted |
| The filter hiding his row: no trip, no outline while hidden; one trip when cleared; none after — "Check his quals", Undo and Redo | browser, `… with the filter hiding his row, "Check his quals" and an Undo take the page to him once the filter is cleared, and only once`; unit, `"Check his quals" with the filter hiding his row…` and `Undo and Redo of a change to a man the filter hides…` | the ask waits for his row and is spent once |
| Inside the one waiting frame: the row hidden again; a newer ask; the page left | unit, `drawn by an edit of the filter box, then hidden again before the waiting frame runs…`, `a newer ask arriving inside the waiting frame…`, `the page left and opened again inside the waiting frame…` | three cases no hand can drive — they happen inside a sixtieth of a second |
| A pinned heading dragged by mouse moves its column as the table's own does | browser, `[QUALS-PINNED-HEAD-NO-DRAG] desktop: a heading pressed in the pinned row drags its column as the table's own heading does` | the lift frame, the landing mark, the new order |
| The same by a finger | browser, `… phone: a finger on a pinned heading, slid along the row, moves its column` | a real finger (CDP touch) in Chromium |
| A second finger put down, moved and lifted alone writes nothing (on a pinned heading; on the table below) | browser, `… phone, <where>: a second finger put down, moved and lifted alone writes no column order`; unit, `only the pointer that began a column drag moves or drops it; a second finger, or a cancelled pointer, ends it with nothing written` | two real fingers; the order and Undo read after |
| A wobbling finger's drag does on a pinned heading what it does on the table's own | browser, `… phone: a finger's drag that wobbles up and down does on a pinned heading what it does on the table's own` | the two heading rows compared — no difference |
| The page drawn again during a drag keeps the picked-up look and one landing mark; a wide desktop narrowed mid-drag too (from the pinned row, and from the table's own with the pinned row showing) | browser, `… desktop: the page drawn again during a drag begun on a pinned heading…`, `… wide desktop: the window narrowed during a drag begun on a pinned heading…`, `… wide desktop: the window narrowed during a drag begun on the table's own heading…` | the drag's look read mid-drag after the redraw |
| A press by another kind of pointer during a finger's drag cancels it and starts none | browser, `… phone: a mouse pressed on another pinned heading during a finger's drag cancels the drag and starts none`; unit, `a press by another kind of pointer during a finger's drag cancels it cleanly and starts none` | a touch-screen laptop's case, which the walk cannot make |
| A pinned heading carried to the edge scrolls the table and the pinned row together, drops, and Undo puts it back | browser, `… desktop: a pinned heading carried to the edge scrolls the table and the pinned row sideways together…` | the edge scroll and the drop |
| A member, and an admin outside Edit quals: a press moved along a pinned heading lifts nothing and writes nothing | browser, `… desktop, <who>: a press on a pinned heading moved along the row lifts nothing and writes nothing` | the doors that must stay shut |

## 9. The pictures

287 pictures in `docs/img/handpass/2026-11-11-quals-small/`. The first walk's 145 are in `a-pc4`, `a-phone`, `a6-pc2`,
`a6-phone`, `a8-pc`, `a8-phone`, `a5-pc3`, `a10`, `b-pc`, `b-phone4`, `b3`, `wk2`, `p-pc`, `p-phone`; the re-walk's 140
in `r-filter-pc`, `r-filter-phone`, `r-filter-wk`, `r-filter-wide`, `r-trip-pc`, `r-trip-phone`, `r-2f2`, `r-drag-pc`,
`r-drag-phone`, `r-drag-edge`, `r-pin`, `r-pin-pc`, `r-pin-phone`, `r-lw`, `r-misc-ppc`, `r-misc-pphone`, `r-misc2`;
the host's look, 2, in `r-host`.

The host opened the seven that decide something, and looked at the whole screen in each:
- `a-pc4/A1-pc-1-arrived-outlined.png` — after "Check his quals": Zenith outlined, in view, the pinned heading above.
- `a8-pc/A8-pc-4-filter-cleared.png` — the first build's fault: outlined, but the page not taken to him.
- `r-filter-phone/R1c-phone-4-plus1s.png` — the same case on the last build, a second after the filter is cleared:
  he is outlined and in view on the phone.
- `a-pc4/A2-pc-13-drag-pinned.png`, `b-phone4/B2-phone-5-mid-drag.png` — a pinned heading mid-drag by mouse and by a
  finger: the frame and the landing mark.
- `r-2f2/R3a-phone-3-f2-moved.png` — the second finger moved: no frame, no landing mark, no picked-up look left.
- `r-pin/R4b-pc-1-mid-drag-after-resize.png` — a wide desktop narrowed mid-drag: the picked-up look and the landing
  mark kept; the frame standing one column off (filed).

## 10. The break tests

Every fix was seen failing first, on the build before it:
- the outline's trip — after "Check his quals", the page at its top, a tick on another man's row threw the page to 486
  (desktop) and 470 (phone); after an Undo at the foot, 777 → 0 and 587 → 0;
- the pinned heading — by mouse no lift frame appeared; by a finger no landing heading lit;
- a second finger on a pinned heading — the column order changed and Undo gained a step (the table's own heading: no);
- the filter case — the filter cleared, he was outlined and the page did not move;
- a redraw mid-drag — the picked-up look gone (`held: false`); a wide desktop narrowed — the look and the landing mark
  gone (`held: false, lit: 0`);
- inside the waiting frame — the trip lost when the row hid again; an older ask's trip made after a newer one; a trip
  made after the page was left;
- a mouse press during a finger's drag — the frame left standing and two marks on the pinned row.

## 11. Errors seen

None — no page error, console error, failed request or 4xx in the walk, the re-walk or the host's look.

## 12. What was not walked, and why

- **Only his iPhone can show (on his look card):** a finger's drag and a second finger on a pinned heading in Safari
  (the test browser cannot make a finger's drag there); what Safari does with the typing cursor when the page leaves
  the filter box for the man it was sent to; a hard flick to the page's foot with the pinned row showing (the re-walk's
  flick ran on a page a pinch had left too short to scroll; the first walk measured the pinned row at the foot and the
  top).
- **The Leave War's list of quals after a pinned drag** — the walker could not find it (it is the list a group or a
  requirement picks from, in the Leave War's settings). The pinned heading writes the order through the same one
  writer as the table's own heading, and Export, which reads the same order, was read after a pinned drag.
- **After an Undo with the filter hiding the man, the trip on clearing when he is out of view** — a filter that leaves
  one row leaves a page too short to scroll; carried by the unit and browser tests (§8).
- **A second ask for a different man who is off screen** — asking again goes through Admin, and the next man's row was
  in view; carried by the unit tests "a new ask goes again" and "a newer ask…".
- **The first walk's plain order (1) on the last build** — not driven again; carried on that build by the two browser
  tests of §8's first rows, and by the re-walk's orders 3 and 6.
- **On a phone: the added column dragged by its pinned heading, and a finger's drag to the edge** — the walker's script
  aimed under the pinned name heading (its right edge at 144; the script's points at 108 and at 438 of a 402 screen);
  the host's look showed the sort mark follows each tap there (H1); both drags were walked on a desktop.
- **A rename** — pressing a column's words opens no rename box. **The other places a tick shows** (Admin → Users, a
  seat's qual warning) — neither fix touches a tick.

## 13. The gate counts

| Where | On | Result |
|---|---|---|
| His PC, under the checks lock | the first build, `7765901d1` | whole unit suite 815 files, 14,086 passed, 20 skipped, 0 failed; the build; browser files geometry, pinchzoom, onedoor 214 passed; `tsc -b`, `lint:changed`, docsize clean |
| His PC, under the lock | the fix round, `c242ba658` | whole unit suite 815 files, 14,089 passed, 20 skipped, 0 failed; the build; the same three browser files 224 passed; `tsc -b`, `lint:changed`, docsize clean |
| His PC, under the lock | the second fix round, `8ed7b7688` | `quals.test.tsx` 83 passed; the build; `geometry.spec.ts` 209 passed; `tsc -b`, `lint:changed`, docsize clean (a small follow-up — GitHub's run is its full check, D902) |
| GitHub's run of pull request 758 | `d4824ec68` (the first build), `ae996bffb`, `a15a668e7` (the fix round), `8ed7b7688` (the second fix round — the last change to the app) | green each time — the build, the original's 728, unit, browser, the Tracker's, the rule and document checks |
| GitHub's run | the last pushed commit (the records) | read before the morning report, never on a guess |

## 14. The reads

All four reports are saved whole in `docs/superpowers/briefs/`, each beside its brief (`2026-11-11-quals-small-…`).

- **Astra's read of the finished code** (`…-read-astra.md`; brief `…-read-brief.md`) — three findings: (1) a second
  finger on the pinned headings can commit a column order; (2) the filter case — the ask is spent before his row is
  found; (3) a stale line in `docs/ui-contracts.md`.
- **A fresh, blind Opus read, the same brief** (`…-read-opus.md`) — three findings: (1) the same stale line; (2) a
  redraw during a drag wipes the picked-up look from the pinned heading; (3) the filter case, read as in keeping with
  D672 — "keep as built, tell him"; and five tests it found missing.
- **Where the two disagreed:** the second finger — Astra said a column order is written, the Opus reader said nothing
  had changed. Settled by a red test with two real fingers at the phone's size: Astra was right (the table's own
  heading cancels the drag; the pinned row wrote an order and Undo gained a step).
- **A narrow read of the fix round** by a fresh Opus reader handed only that change and the findings it answers
  (`…-read-narrow1.md`): the second finger's and the filter case's fixes right and complete; the redraw's fix
  incomplete where the redraw changes the column widths; three suspicions (two races inside the one waiting frame; a
  press by another kind of pointer during a finger's drag; what Safari does with the typing cursor).
- **A narrow read of the second fix round** by another fresh Opus reader (`…-read-narrow2.md`): no findings; two
  suspicions, both filed (§15).
- **Reads owed:** none — Astra read the finished code, and a fresh, blind Opus reader beside him.

## 15. What the walk and the reads found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | the walk (A8), Astra, the Opus reader | With the filter box hiding the man when the page is sent to him, clearing the filter outlined him without taking the page to him (before this change it went) | FIXED — the trip is made on the first repaint that draws his row, once. The host's decision (the Opus reader had read "keep as built"); **told to him, his to change:** clearing a filter that hid the man takes the page to him, away from the filter box he is typing in |
| 2 | Astra (the Opus reader read it the other way) | A second finger on a pinned heading during a drag wrote a column order | REPRODUCED with two real fingers, FIXED — the drag belongs to the pointer that began it; a second finger cancels it, on both heading rows |
| 3 | the Opus reader | A redraw during a drag wiped the picked-up look from the pinned heading | REPRODUCED, FIXED; the narrow read found it incomplete where the redraw changes the column widths — reproduced on a wide desktop, FIXED |
| 4 | Astra, the Opus reader | A line of `docs/ui-contracts.md` still said the pinned copy takes no drag | CORRECTED, with the lines beside it |
| 5 | the walk (B3) | A finger's drag with about 40px of wobble lifted nothing on a pinned heading | NOT A FAULT — the same drag does the same on the table's own heading; a test now holds the two alike |
| 6 | the Opus reader | Tests missing: the edge carry, the member's and the view's doors, a redraw mid-drag | ADDED (§8) |
| 7 | the narrow read of the fix round | Inside the one waiting frame: the row hidden again loses the trip; a newer ask is followed by the older ask's trip; the page left still trips | each REPRODUCED in a unit test, FIXED |
| 8 | the narrow read of the fix round | A mouse press during a finger's drag takes the drag over | REPRODUCED on both heading rows, FIXED — the press cancels the drag and starts none |
| 9 | the narrow read of the second round | No findings. Two cases no test holds: a newer ask whose row is not drawn, arriving inside the waiting frame; a release just after the pinned row goes mid-drag (it now writes nothing) | FILED, `[QUALS-DRAG-LEFTOVERS]` |
| 10 | the walk (B4) — older than this change | The ✕ inside a pinned heading does nothing | FILED, `[QUALS-PINNED-X-DEAD]` |
| 11 | the builder, the host's picture | A window resized mid-drag leaves the lift frame at its old place until the drop | FILED, `[QUALS-DRAG-LEFTOVERS]` |
| 12 | Astra's fix steps, the host's call | Two fingers on the pinned row do not zoom the table (as on `main`) | NOT BUILT — a new behaviour in the pinch shared by five screens; FILED, `[QUALS-DRAG-LEFTOVERS]` |
| 13 | the Opus reader, the walk — older | No Escape cancels a column drag; the outline after "Check his quals" stays on while the page is open (seen for 65 s); the browser tests of the pinned row run only where the browser pins it by scroll-driven animation; two fingers on the table's own heading moved the page 13px | FILED, `[QUALS-DRAG-LEFTOVERS]` |
| 14 | the re-walk | After the filter's trip the filter box is off screen while it still holds the typing cursor | the known cost of finding 1's fix — in the one line told to him |

## 16. `Walk:` line

`Walk: docs/handpass/2026-11-11-quals-small.md · 287 pictures · 11 surfaces · 18 orders · MISSING: 1, older — the ✕ inside a pinned heading, filed [QUALS-PINNED-X-DEAD]`
