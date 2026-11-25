# The walk's three shares — one man's row of a shared absence (pull request 845), 25 Nov 26

The combined scenario list (Astra S01–S21, the Opus designer O-S1–O-S15, the Fable designer F-S1–F-S14), split by
surface. Each walker reads `2026-11-25-shared-row-walker-brief.md` first, then its share here, then the scenarios it
names in the three designs beside this file (`…-scenarios-astra.md`, `…-scenarios-opus.md`, `…-scenarios-fable.md`) —
the designers' own setup, presses and disproof lines are the detail; this file says which to walk and what the host
expects. The frozen build: `.tmp/build-6c7f3aac7` (bundle `index-BiU7Aj55.js`).

**The promise, for every scenario** (his rulings D737, D739, D755; `docs/ui-contracts.md` "own part"): on the
Unavailable list an input for several people is one row a man; a time or a remark typed on one man's row — and, since
this build, any button pressed on it — changes HIS part alone: he is given an input of his own and every later change
or press on his row reaches it; the others' input is never changed by it; where his part cannot be found, nothing is
saved. A row under Personal Inputs or on the Ground Programme is the input's ONE line, for everyone in it.

**The host's rules for judging, over the designers' EXPECTED lines:** where an EXPECTED cites a ruling or a contract,
judge it PASS or FAIL. **RECORD, never judge:** any count ("N pending", an Undo count), the exact words of any refusal,
note or bell line, every figure on a published day, and anything a designer marked RECORD. A designer's "M1–M6"
findings and Fable's "missing call site" rows were fixed in this build: walk them expecting the RIGHT behaviour.
**On a phone say, for every button tapped while a box holds the caret, whether the caret stayed in the box** (read
`document.activeElement` before and after the tap, in Chromium and in WebKit) — on an iPhone it stays; if the test
browser moves it, say so: the host then names that step for his own iPhone.

The fixture, unless a scenario says otherwise: signed in as the admin (`ad`), a leave (LL) for Ranger and Hex,
08:00–10:00, no remark, filed through the Inputs page's own window on Wednesday 15 Jul 26 (`L.WED`), as
`scripts/handpass/shr-w3.mjs` does.

## Share A — the Scheduler Board's Unavailable rows (letter `a`)

Desktop 1440×900 in Chromium for every scenario; phone 402×874 by touch for A1–A7 and A12, in Chromium AND WebKit.

| id | from | what to walk | the host's expectation |
|---|---|---|---|
| A1 | Astra S05, O-S8 | start 0900 Tab, end 1100 Tab, remark Tab; then RELOAD and read again; record whether Ranger's row moves below Hex's when the section repaints | Ranger 09:00–11:00 with the remark on an input of his own; Hex 08:00–10:00, none; screen = store at every step and after the reload (the promise). The row order: RECORD |
| A2 | Astra S03, O-S4 | Escape after a typed-over end, start and remark; Shift+Tab back into his end box; on the phone tap between boxes | Escape puts back HIS saved value and saves nothing; a box arrived at shows HIS value (fixed: M1, M3) |
| A3 | Astra S04 | a time cleared, then Tab and Shift+Tab through his boxes untouched, then a new start | a cleared time makes HIS leave all day, both boxes empty; untouched traversal saves nothing; Hex untouched ("clearing a time means all day") |
| A4 | Astra S06, O-S11, O-S3 | three men (add Outlaw), rows typed in turn as O-S11 gives them | three inputs, each man's own values; Hex's (the last one in) changed in place, no fourth input |
| A5 | Astra S07, O-S9, F-S10 | refusals as the first change (end before start; `2570`) and after a good change; then, after EACH refusal: tap away, tap the box afresh, type the figure it shows | a refusal saves nothing, cuts nobody out (one input, both men, when it was the first change) and heals the box to HIS value; RECORD every refusal's words and whether a second note follows |
| A6 | Astra S08, O-S12, F-S8 | Undo and Redo between changes — on the Board press `#sbUndo` / `#sbRedo`; on the phone with the keyboard up | one change one Undo step; nothing ever written on Hex's; after the caret leaves, the row agrees with the Inputs page. What the held row SHOWS straight after an Undo: RECORD |
| A7 | F-S1, F-S2, F-S7, F-S11, Astra S09, O-S7 | THE BUTTONS ON HIS HELD ROW, each on a fresh fixture, after start 0900 and a tap into his end box (caret held): (a) the leave's name (LL) → which leave the window shows; then its Delete; (b) on a shared OVERSEAS DUTY: Reject on Ranger's row; (c) the LATE chip on Ranger's row; (d) his puck tapped, then a name tapped on the crew list; (e) desktop: a name DRAGGED from the crew list onto his puck. For each ALSO the control: the same press on a row NOT held (tap away first) | (a) the window is RANGER's leave, his name alone, 09:00–10:00; Delete removes his, Hex keeps 08:00–10:00. (b) Ranger's duty goes back to Personal Inputs, Hex's stays under Unavailable. (c) Ranger's LATE mark hides, Hex's stays. (d), (e) the name takes Ranger's place on Ranger's own input; Hex untouched. (All fixed in this build, pinned by `src/ui/sharedrow-buttons.test.tsx` — the walk proves them on the real screen.) RECORD the words of every note |
| A8 | O-S5, Astra S15 | the Board's day stepped with the caret in his held, untouched box; a valid end typed and the next day pressed at once; the same with `2570`; leave the page and week and come back | nothing saved by a step over an untouched box; a typed valid change commits once; a refused one saves nothing |
| A9 | F-S5 | `0800` typed over his row's 08:00, Tab | nothing changes: one leave, both men, no Undo step (fixed in this build). RECORD the Undo button's state |
| A10 | Astra S13, O-S10, F-S13 | the kinds, one pass each, through the app's own doors: an all-day shared leave; an AM half; an overseas duty and a course Mon–Wed typed on Wednesday; an Attach with its "To"; an Other filed under Unavailable; a commitment a scheduler moved to Unavailable | Ranger alone changed each time, his own input of the SAME kind, span, "To"; the second change on his own; RECORD anything about an OIL question (none should open) |
| A11 | O-S15 | Ranger signed in as a member, the Board on the day, his own row's boxes tapped | read-only: no box takes typing, nothing saved |
| A12 | the host's find | a shared overseas duty for Ranger and Hex: Reject it on a row NOT held (both go back), unfold Personal Inputs on the Board, type start 0900 on its ONE line | the duty is re-timed for BOTH men, still one input (D739, D661, D1393; fixed in this build) |
| A13 | the plain-user round | file the leave, open the Board, type on his row, open the input's window from the leave's name and close it by EACH of its ways (its Close or Cancel, its ✕, Escape, a tap outside), Undo, then look at the Inputs page, the week, the Leave War grid and the bell | RECORD what each shows; every way of closing closes that window and nothing else |

## Share B — Edit Schedule's week, the published day and the readers (letter `b`)

Desktop 1440×900 in Chromium; B1–B3 also at the phone size if the week's Unavailable cells can be typed there (say if not); B1 in WebKit too.

| id | from | what to walk | the host's expectation |
|---|---|---|---|
| B1 | Astra S05, O-S8 | the week's Unavailable cells of Ranger's row: start 0900 Tab, end 1100 Tab, remark Tab; reload | as A1, on the week |
| B2 | O-S1, O-S2, O-S3 | Shift+Tab back into his row; Escape; Hex's row typed and Shift+Tab back to Ranger's | as each scenario's Expected (fixed: M1, M2) |
| B3 | Astra S04, F-S10, F-S5 | a time cleared; refusals first and later, each followed by tap away, tap afresh, type the figure it shows; `0800` over 08:00 | as A3, A5, A9 |
| B4 | F-S9 | three men, an all-day leave Mon–Wed, the rows typed in turn in Tuesday's block as F-S9 gives them; then look at Monday's and Wednesday's blocks, the Leave War grid | each man's own values on every day his input covers; no fourth input; the other days agree at once |
| B5 | F-S1, F-S2 on the week | the leave's name and Reject on his held row of the week (after a typed start and a Tab) | as A7 (a), (b) |
| B6 | Astra S16, O-S13, F-S6 | THE PUBLISHED DAY: publish the fixture's day and sign it four times through the app's own controls; then start 0900 Tab, end 1100 Tab, remark Tab on Ranger's row (the Board), a picture and the pending figure after each; the changes window, its line tapped; the day as a member sees it; Undo all; then redo and publish the amendment | each change reads pending and the sign-offs fall (D45, D103); the issued face keeps both men at 08:00–10:00 until the amendment; the amendment carries Ranger's changes, nothing of Hex's. RECORD every count, every mark and on whose row, the changes line's words and where its tap lands, and whether the sign-offs come back after the Undos |
| B7 | Astra S17 | who counts as away: a seat that overlaps 10:30–10:45; Ranger's leave extended to 11:00; the crew list with the seat picked, ALL AVAIL's window, the warnings, the Leave War's figures | each reads Ranger's new hours and Hex's unchanged. RECORD the words |
| B8 | Astra S18, F-S13 (OIL) | a shared weekend overseas duty with an OIL answer, Ranger's hours changed on his row | no OIL question opens (D739 reading 4); Hex's figure unchanged. RECORD the figures |
| B9 | Astra S20, F-S14 | after the three changes: the changes window (press "All changes"), each line tapped; each man's bell (sign in as each, same tab); the view-only week | Hex is told nothing of Ranger's later changes. RECORD every line's words and where each tap lands |
| B10 | Astra S19, O-S14 | the whole-input rows: a shared Meeting's Ground Programme row and its Personal Inputs line typed; a one-man Unavailable row typed | the Ground and Personal rows change the input for EVERYONE (D739); the one-man row saves as before |
| B11 | Astra S14 | halves: a shared AM leave, Ranger's end changed away from the half and back; a shared leave Sun–Mon across the week's edge typed on each side | Ranger's alone changes; RECORD the half label and what the next week shows |
| B12 | the plain-user round | on the week: type his row, open the leave's window from its name, close it each way, Undo, look at the Inputs page, the Board, the bell | as A13 |

## Share C — the Leave War's windows (letter `c`)

Phone 402×874 by touch (Chromium; WebKit for C1) and desktop 1440×900. Document steps in Chromium only.

| id | from | what to walk | the host's expectation |
|---|---|---|---|
| C1 | Astra S01, O-S6, F-S4 | THE MEMBER'S OWN WINDOW: the fixture leave Mon–Wed; Ranger signed in; his own cell → the remark typed and left, typed again, a document added, the till ticked, the remark changed, close, reopen; then Hex signed in: his cell; then the admin: the Inputs page | all of it on Ranger's own leave; the box shows what he typed after every step; Hex's window empty, his leave untouched; two leaves on the Inputs page. RECORD who the bell tells on the first save |
| C2 | Astra S02 | remark, document, till in other orders; a document opened and the viewer closed by EACH of its ways (Close, ✕, Escape, a tap outside) on the phone and the desktop | Ranger's latest words, documents and tick survive every later save; the viewer alone closes, the window under it as it was |
| C3 | F-S3, Astra S11, O-S6 | THE ADMIN'S WINDOW on Ranger's cell: a remark typed and left, changed, the till ticked — then, WITHOUT closing, each of the window's other buttons in separate fresh fixtures (Delete, Refuse, Approved, Move — whichever the window offers for this leave; say which it offers); the same from the day's list where a day holds two entries; a closed day's window | the words on Ranger's own leave; each button acts on RANGER's leave or refuses in words — never Hex's, never silent. RECORD which buttons the window offers and every note |
| C4 | Astra S12 | the drag window: Ranger's days dragged over the shared leave; words typed; closed; the same before Move | the shared, Inputs-page leave is left alone or changed for Ranger only; RECORD exactly what the window shows and saves |
| C5 | Astra S10, S21, F-S12 (one window) | his part taken away by another door, in ONE tab: after Ranger's split, delete Hex's leave on the Inputs page, come back and type on Ranger's row; then delete Ranger's own and try once more from a window or row that still shows him | Ranger's own stays editable after Hex's is deleted; with Ranger's own gone, nothing is saved and nothing of Hex's changes. (Two live tabs are two devices that never sync — not walked; `src/leavewar/sharedrow-follows.test.ts` "taken out by another door" carries it) |
| C6 | O-S14 (a) | a one-man leave's remark from Ranger's own cell | saves as before; RECORD any refusal |
| C7 | lesson 12 | every page the remark window can be opened from (the grid's cell, the day's list, My leave, any other you find): open it from each, save a remark, close it | the window in sight, the page under it the one left. RECORD the list |
| C8 | the plain-user round | file a leave for two, open the Leave War, the remark window, type, close by each way, then look at the Inputs page, the schedule's Unavailable list and the bell | RECORD what each shows |

## Set aside, each with its reason

- Astra S21's "another user's change arriving meanwhile" and Fable S12's two windows: the app has no live sync between
  two open windows (each reads the store when it opens), so it cannot be reached on one page; the save's refusal where
  his part is gone is carried by `src/leavewar/sharedrow-follows.test.ts` (through the one save every door uses).
- The original fault on the Board (Astra S05's Board half): walked by the host on `f3cbe7b40` in four combinations and
  again on this build (`scripts/handpass/shr-w3.mjs`); A1 adds the reload.
