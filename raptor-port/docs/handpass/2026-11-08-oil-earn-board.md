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
| Board, phone, OIL Earn on, a day not yet published | YES — expected | YES — label, slider, keys | the bar's name OIL EARN, "✓ OIL done", the note under it when on | |
| Board, desktop, OIL Earn on | YES — expected | YES | as above | |
| Board, phone, OIL Earn off | NO, because the switch belongs to the mode (the bar holds Templates and OIL Earn) | NO, because not drawn | Templates, OIL Earn (C) | |
| Board, a published day, OIL Earn on | YES — expected | YES — a press is a change waiting for the next amendment | the amendment marks | |
| Board for someone who cannot edit (a member's read of the board, a look at an issued version) | NO, because OIL Earn is a scheduler's mode (the gate ahead of `dayBarHTML`'s button) | NO | — | |
| Edit Schedule's week, View-only Sched | NO, because OIL Earn is the board's alone | NO | — | |

### B. A puck in OIL Earn that cannot earn on its row (D1783) — one drawer, `oilSeatHTML`, five callers

Kinds: (i) no working hours to count from (`inertWhy`: no times, an ⓘ / information-only row, a cancelled row …), (ii) a
row with a start and no end (D360, "No OIL worked out — this row has no end time"), (iii) a placeholder ALL / ALL AVAIL
(the host's reading 1), (iv) masked by the day's switch (D845's words), (v) masked by its event's own OIL switched off.

| Place (caller) | SHOWS why | Tap USABLE (picks nothing, says why) | What else is PAINTED there | Evidence |
|---|---|---|---|---|
| A flying line's cockpit seat (`sbSlot`) | YES — hover title | YES — the passing note | warning rings, the AL tag, his own purple | |
| A duty desk, sim seat, ground row, extras (`sbSeat`) | YES | YES | as above | |
| A Common Programme row's people (`sbProgPanel`) | YES | YES | the row's time and remark boxes | |
| A Personal Inputs row (`sbInpRow`) | YES | YES | the row's input buttons, the LATE chip | |
| The ALL AVAIL window, its OIL tab (`AvailWindow.tsx`) | YES — its footer, as built (D65; the window is mounted beside the board, so the board's tap rule never sees its taps) | YES — the window's own tap: footer, nothing picked | the window's counter and reasons | |

### C. The phone day bar's Templates and OIL Earn (D1793) — `tplBtn` (`ui/board.ts`) and the rest button (`ui/oilmode.ts`)

| Place | SHOWS the marks | Gesture USABLE | What else is PAINTED there | Evidence |
|---|---|---|---|---|
| Board, phone, OIL Earn off | YES — the page of blocks, the ticket | YES — each opens as before | the bar's name THIS DAY | |
| Board, phone, OIL Earn on | NO, because the bar then holds "✓ OIL done" (no mark, as drawn) and the switch | YES | A's row | |
| Board, phone, read-only | Templates NO, because it is a scheduler's; OIL Earn per the gate | — | | |
| Board, desktop | NO, because the bar is hidden at rest; the top bar's own Templates and OIL Earn already wear the marks (D1703, D1704) | YES | | |

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

## 5. The cases carried by a test

## 6. The pictures

## 7. The break tests

## 8. Errors seen

## 9. What was not walked, and why

## 10. The gate counts

## 11. What the walk and the reads found, each disposition
