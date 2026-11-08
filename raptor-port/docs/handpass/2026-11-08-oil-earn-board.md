# Evidence sheet — OIL Earn on the Scheduler Board: the day switch, a tap that cannot earn, the phone bar's marks

Chat 5, 8 Nov 26, branch `claude/pr-oil-earn-ffbf07`, pull request 679. Rulings D1782, D1783, D1793 (the pictures
round's group 2). Pictures: `docs/img/handpass/2026-11-08-oil-earn-board/`. Laid down before the walk (§9): an empty
cell is a row nobody has walked yet.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL included) | **YES** — the switch writes the day's "No OIL earned" (`setOilBlanket`), through a new press handler; the inert tap sits in OIL Earn's own tap path, beside the tap that switches a man |
| 2 | The published record | YES by reach — the switch on a published day is a change waiting for the next amendment, as the old button's was (unchanged write) |
| 3 | Saved data | NO — the same stored field (the day's blanket), the same write; nothing stored is added or read differently |
| 4 | A shared drawer | **YES** — every inert puck's markup (`oilSeatHTML`), drawn by five callers (§2) |
| 5 | A new gesture or mode | **YES** — the switch (label, slider, keyboard); the inert tap now refuses with a note |
| 6 | A new surface | NO — the switch takes the old button's place; the note is the app's passing note |
| 7 | Roles | NO — the same scheduler-only gate (`canEditSched()` and the board's edit mode) ahead of both |
| 8 | The warning list | NO — no warning, no rule's reading changes |

**Tier: FULL** (1). Readers: the scenarios by Astra (one reader, D353); the code by Astra, Sol 6.1 (D1743, until Mon 9
Nov 26 19:00) and a fresh blind Opus reader (D790), blind to each other, after the walk.

## 2. The roll-call

### A. OIL Earn's day switch, "No OIL earned" (D1782) — one drawer, `dayBarHTML` (`ui/oilmode.ts`), one caller (`ui/board.ts` boardHTML)

| Place | SHOWS the switch | Gesture USABLE | What else is PAINTED there | Evidence |
|---|---|---|---|---|
| Board, phone, OIL Earn on, a day not yet published | YES — expected | YES — label, slider, keys | the bar's name OIL EARN, "✓ OIL done", the note under it when on | W1.1d, W1.2–W1.8, A13 (phone) PASS — `w1/W1.2-phone-words-on-now.png` |
| Board, desktop, OIL Earn on | YES — expected | YES | as above | W1.2–W1.8, A13 (PC) PASS; keys W1.4 PASS, its white ring FIXED (cyan, `d499b1c61`) — `w1/W1.2-pc-words-on-now.png`, `w1/W1.4-pc-ring.png` |
| Board, phone, OIL Earn off | NO, because the switch belongs to the mode (the bar holds Templates and OIL Earn) | NO, because not drawn | Templates, OIL Earn (C) | W1.1a PASS (no switch at rest) — `w1/W1.1-phone-bar-rest.png` |
| Board, a published day, OIL Earn on | YES — expected | YES — a press is a change waiting for the next amendment | the amendment marks | W1.9, A5/A6 both sizes PASS: on raises "Publish AL1", off is the published day exactly — `w1/W1.9-pc-switch-on.png`, `-switch-off.png` |
| Board for someone who cannot edit (a member's read of the board, a look at an issued version) | NO, because OIL Earn is a scheduler's mode (the gate ahead of `dayBarHTML`'s button) | NO | — | A24 both sizes PASS: no board is offered to a member, nor on View-only Sched — `w1/A24-pc-member-board.png` |
| Edit Schedule's week, View-only Sched | NO, because OIL Earn is the board's alone | NO | — | A24 PASS (View-only: no board, no switch); the week draws no day bar — `w1/A24-pc-admin-viewonly-board.png` |

### B. A puck in OIL Earn that cannot earn on its row (D1783) — one drawer, `oilSeatHTML`, five callers

Kinds: (i) no working hours to count from (`inertWhy`: no times, an ⓘ / information-only row, a cancelled row …), (ii) a
row with a start and no end (D360, "No OIL worked out — this row has no end time"), (iii) a placeholder ALL / ALL AVAIL
(the host's reading 1), (iv) masked by the day's switch (D845's words), (v) masked by its event's own OIL switched off.

| Place (caller) | SHOWS why | Tap USABLE (picks nothing, says why) | What else is PAINTED there | Evidence |
|---|---|---|---|---|
| A flying line's cockpit seat (`sbSlot`) | YES — hover title | YES — the passing note | warning rings, the AL tag, his own purple | W2.3 both sizes: the no-times note, nobody picked — `w2/s3-fcp-ranger-phone-phone-note.png` |
| A duty desk, sim seat, ground row, extras (`sbSeat`) | YES | YES | as above | W2.1, W2.2, A17, A18, A19 (ground), A23 both sizes PASS; extras NOT WALKED (§9) — `w2/w21-pc-tap-fable-pc-note.png`, `w2/s18-box-cinch-phone-phone-note.png` |
| A Common Programme row's people (`sbProgPanel`) | YES | YES | the row's time and remark boxes | A19, W2.5 (event off), A9, A10, W2.6 / A2 (placeholder) both sizes PASS — `w2/s19-cp-saber-phone-phone-note.png`, `w2/s6-allavail-body-pc-pc-note.png` |
| A Personal Inputs row (`sbInpRow`) | YES | YES | the row's input buttons, the LATE chip | A1 (Personal, and leave and medical under Unavailable) both sizes PASS; A8 (an earning input switches, not inert) PASS — `w2/a1-Comet-oil-phone-phone-note.png`, `w2/a1-Ace-oil-phone-phone-note.png` |
| The ALL AVAIL window, its OIL tab (`AvailWindow.tsx`) | YES — its footer, as built (D65; the window is mounted beside the board, so the board's tap rule never sees its taps) | YES — the window's own tap: footer, nothing picked | the window's counter and reasons | W2.7, A3, A9 both sizes PASS: footer, nothing picked, the window stays — `w2/a3-cp-noend-inert-seat-phone-after.png` |

### C. The phone day bar's Templates and OIL Earn (D1793) — `tplBtn` (`ui/board.ts`) and the rest button (`ui/oilmode.ts`)

| Place | SHOWS the marks | Gesture USABLE | What else is PAINTED there | Evidence |
|---|---|---|---|---|
| Board, phone, OIL Earn off | YES — the page of blocks, the ticket | YES — each opens as before | the bar's name THIS DAY | W1.1a, A27 PASS (one row, 23 tall, marks 12px; mark and word both open) — `w1/W1.1-phone-bar-rest.png`, `w1/A27-phone-oil-mark.png` |
| Board, phone, OIL Earn on | NO, because the bar then holds "✓ OIL done" (no mark, as drawn) and the switch | YES | A's row | W1.1d PASS — `w1/W1.1-phone-oil-settled.png` |
| Board, phone, read-only | Templates NO, because it is a scheduler's; OIL Earn per the gate | — | | A24: no board is offered read-only — `w1/A24-phone-member-board.png` |
| Board, desktop | NO, because the bar is hidden at rest; the top bar's own Templates and OIL Earn already wear the marks (D1703, D1704) | YES | | W1 notes: the bar hidden at rest on a PC; the drawing check `switch-off-desk` — `docs/img/handpass/2026-11-07-pictures-round/drawcheck/` |

### D. Rows by kind of change (§6), whatever the tier

- **A wording ruling — every place that says it:** D845's "Nothing on this day earns. Turn off the switch first." — a
  man's puck (board: the new inert branch and the switch's `[data-oilp]` refusal), an event's own OIL mark, a man in the
  ALL AVAIL window (`AvailWindow.tsx`, the same `DAY_EARNS_NOTHING`); "This event earns nobody any OIL. Turn the event
  back on first." — board (`EVENT_EARNS_NOBODY`) and the window (its own copy). The old "nothing measurable to earn from
  here": left only in code comments and test titles (`oilmode.ts`, three test files) and in `engine/oilev.ts` (chat 6's
  area) — to correct or file.
- **A removed control — the old "Nothing today earns" button:** what it gave (a scheduler, phone and desktop, in the
  mode: the day's blanket on and off, its hover, amber when on) → now the switch; what stood below it (the note) → the
  same note, new words; what ran on its press (`setOilBlanket`, `notify`, the passing note through `act`) → still runs,
  once, plus the keys put back on the switch.
- **A new branch that skips a call:** the inert tap skips the selection (`routeClick`'s `selectPerson`) — on purpose
  (D65, D1783); it skips nothing else the old path ran (the old path wrote nothing).

## 3. The five sizing lines (§7.0)

1. **Type:** C (a new control — the switch — and a new answer to a tap), D (the inert puck's reason, drawn by one drawer
   for five callers), E (the switch's look and the phone bar's marks), with G by reach (the switch on a published day
   waits for the next amendment; Undo and Redo of it).
2. **What only a walk could find:** the switch pressed by a finger on the words and on the slider, and by the keys —
   once per press, the keys left on it after the bar redraws; the note under the bar; the switch on a published day and
   its "N pending"; the day changed and the mode left and entered with the switch on; the inert tap on each board drawer
   (cockpit seat, desk, Common Programme row, Personal Inputs row) picking nobody and saying why, for each kind; the
   masked taps' ruled words; a placeholder's count still opening the ALL AVAIL window, and that window's own inert man
   unchanged; the phone bar's marks with an iPhone's letters (WebKit) and the buttons still opening Templates and OIL
   Earn. The drawing check already proves the drawn look (§6); the unit tests prove each kind's sentence.
3. **The ledger:** OIL and board walks — the keyboard and windows batch (5 Nov 26, C D H E, one Sonnet walker, 152
   checks, 0 new faults, the fresh read 5), the member and guest build (5 Nov 26, FULL, two walkers, 4 faults), the first
   OIL Earn walk (22 Sep 26, several faults in shared drawers — the reason a shared drawer is walked caller by caller).
4. **The walk chosen:** two Sonnet walkers, each in its own world, on a build folder frozen and named for the commit, at
   his iPhone's 402 × 874 in WebKit (touch, a picture right after each tap) and his PC's 1536 × 864 at 1.25 (mouse and
   keys): **W1** the switch (A), the phone bar (C) and the plain-user round of OIL Earn (enter, switch on and off by
   words / slider / keys, Undo, Redo, a published day's pending count, another day and back, ✓ OIL done, Templates
   opened and closed, the ALL AVAIL window opened and closed by each of its ways); **W2** the inert tap (B) on each of
   the four board drawers for each kind that drawer can hold, the masked kinds, the placeholder, and the ALL AVAIL
   window's inert man. Astra's scenarios shared between them. No size beyond the required two: nothing new is pinned or
   floats. Carried by a test, not walked again: each kind's exact sentence (`oilmode.test.tsx`, the last block — the
   board's own markup pressed through the real click handler in jsdom), one per kind beyond the one walked per drawer.
5. **After the walk:** the ledger's row — added at the close.

## 4. The orders walked — what the screen said, what OIL said

Two Sonnet walkers, 8 Nov 26 ~09:10–10:00, on the frozen build of `a827307a5`, each in its own browser world (W1
origins 4381 / 4173, W2 4382 / 4173), his iPhone's 402 × 874 in WebKit by touch and his PC's 1536 × 864 at 1.25 by
mouse and keys. Their whole tables: `parts/2026-11-08-oil-earn-w1.md` (30 PASS, 0 FAIL, 15 RECORDED, 3 not walked —
each a size the brief marked phone-only or PC-only) and `parts/2026-11-08-oil-earn-w2.md` (33 PASS, 0 FAIL, 12
RECORDED, 5 not walked — §9).
- **The switch, every order (W1):** by its words, its slider and Space, once per press (A13: two quick presses 120 ms
  apart change it twice, back where it was); Undo and Redo step it ("Undid: an OIL decision"); another day and back,
  the mode left and entered, ✓ Done and the board reopened, a reload and sign-in — the day keeps its switch (A15). On a
  published day the switch raises "Publish AL1" and the issues count moves 3 → 2; off, the day is the published one
  exactly (W1.9, A5/A6). What OIL said: on, 0 earning and 29 faded; off, the 19 / 7 / 3 of before (W1.9 figures).
- **The inert tap, every drawer and kind (W2):** cockpit seat, desk, sim seat, ground row, Common Programme row,
  Personal Inputs, Unavailable; no end time, no times, cancelled, ⓘ, a desk 07:00–07:00; an event switched off; the day
  switch; a placeholder's body and count; the ALL AVAIL window's faded man. Every note as ruled, nobody picked, the
  day's stored data the same before and after the tap (W2 compared it).
- **The fixes before the walk, re-walked (W2 A1, A2):** leave, medical and Personal requests filed on the Inputs page —
  "Leave earns no OIL.", "A medical request earns no OIL.", "A personal request earns no OIL.", nobody picked; outside
  the mode the Unavailable tap arms his seat and the Personal one picks him, as before. The placeholder's body on the
  Common Programme, a ground row and a duty desk: the placeholder's note, D845's words under the switch; its count
  still opens the window.
- **The plain-user round (W1):** enter OIL Earn by the bar's mark and word, switch on and off, ✓ OIL done, Templates
  opened and closed, the ALL AVAIL window opened by its count and closed by ✕, another day, Undo, Redo, publish.

## 5. The cases carried by a test

`src/ui/oilmode.test.tsx` (the last describe blocks — the board's own markup pressed through the real click handler):
each kind's exact sentence, the switch's one press, its keys after the redraw, the placeholder's note on and off the
switch, leave / medical / Personal in and outside the mode (outside: the seat arms, `armedKey()` `iu:…`).
`src/ui/oilswitch-ring-css.test.ts`: the switch's cyan keyboard ring (W1.4's find). `src/ui/noteswords.test.ts`: D845's
words in every place they are said (now 6 on the board). Checked to exist: all three files.

## 6. The pictures

`raptor-port/docs/img/handpass/2026-11-08-oil-earn-board/w1/` and `/w2/` (about 230); each row of the two reports names
its own. Opened by the host and agreeing with their rows: `w1/W1.1-phone-bar-rest.png`, `w1/W1.2-phone-words-on-now.png`,
`w1/W1.4-pc-ring.png` (the white ring — the find), `w1/A11-phone-tap-now.png`, `w1/A27-phone-desktop-layout.png`,
`w2/a1-Ace-oil-phone-phone-note.png`, `w2/s6-allavail-body-pc-pc-note.png`. The drawing check's: §3, GREEN.

## 7. The break tests

The host's reproduction before the walk (`a827307a5`'s two fixes) broke the build on purpose by tapping every drawn
puck kind in the mode (`<scratchpad>/host-repro.mjs`): two kinds still picked a man — fixed red-first. W2 A23 tapped a
faded puck on its letters, its edge and its body; A13 pressed the switch twice in 120 ms.

## 8. Errors seen

No page error on either size (both reports). The test WebKit's "Couldn't save that document: your browser storage may
be full…" after taps outside the mode (W2.8) is the known test-browser fact (`docs/walk-scripts.md` §7a), not the app.

## 9. What was not walked, and why

- ALL AVAIL dropped onto a ground row or desk **on a phone**: the test WebKit runs no touch drag; walked on the PC (A2).
- The plain **ALL** tile in a row: the same class and branch as ALL AVAIL (`.puck.allavail`, `board.ts boardArmClick`).
- A named man in a desk's **extras**: drawn by the desk's own drawer (`sbSeat`), walked on the desk.
- An **OD** input: the same Personal Inputs branch as Duty and Training, walked (A8).
- A **warning mark on a faded puck**: none on the board in either world; the inert wrapper encloses the puck whole.
- Astra's scenarios set aside in the brief, each with its reason there (4, 7, 16, 20, 22, 28 — figures and publication
  sums this build does not touch) and A5's amendment publication.

## 10. The gate counts

(At the close: GitHub's run on the last pushed commit.)

## 11. What the walk and the reads found, each disposition

**The walk:** (W1.4) the switch under the keys wore the browser's white ring — confirmed-new, FIXED red-first
(`d499b1c61`). (W1) Escape leaves the ALL AVAIL window open, and it stays up after ✓ Done — as built and written
(`docs/ui-contracts.md`: the movable windows leave Escape; D66 lists what closes it). (W1) In the board's desktop
layout on a phone, Templates and OIL Earn stand off the right edge — confirmed-pre-existing (`main` 650–818 on a 402
screen), FILED. (W2) A cancelled or ⓘ row with times says "This row gives him no working hours to count OIL from" — as
ruled (D1783's full row), a finer reason FILED as a question. (W2) the window's faded man: footer, no passing note — as
built (D65). (W2) an input's ground row cleared of times still earns: its cleared time reads "all day", older, as built.
**The reads:** (to come — Astra, Sol 6.1, a fresh Opus reader on `e4677d032`, blind to each other and to this sheet.)
