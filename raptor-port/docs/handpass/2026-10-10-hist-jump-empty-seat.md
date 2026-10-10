# A tap on a change whose seat is empty now lands on its row — the bug check (10 Oct 26)

`[HIST-JUMP-EMPTY-SEAT]` — HIS FIND, 10 Oct 26, on his iPhone: *"It says the detail is shown on the scheduler board. But
when I go to the schedule board and click the same thing it says the detail is shown on the week, not on the board."*
Built on `claude/hist-jump-empty-seat` (cut from `main`) by Opus 5.5 the same day; his one question answered first
(D733). Pictures: `docs/img/handpass/2026-10-10-hist-jump-empty-seat/` (47). The walk's script:
`scripts/handpass/hj-walk.mjs` — its checks are the RIGHT behaviour, so running it again is the re-walk. Astra's
scenario read: `docs/handpass/2026-10-10-hist-jump-empty-seat-astra.md`.

## 0. For him — six readings to say yes or no to (nothing waits on them)

1. **The new words on screen are "That seat is empty now"** — the agent's choice (few words, D726). Say other words
   and they change in one place.
2. **On View-only Sched, a row nobody is left on has nothing to ring** — a read-only page draws no "+ add" box — so
   the sentence alone is said. Everywhere else the row is ringed.
3. **On a published day's "To go out" list** a line about a man taken off used to land on ANOTHER man of that desk
   (or on the row's name) and open that one's History. It lands on the row's people box now, with the sentence.
4. **If the Scheduler Board is looking at an older version** (a saved plan, the day as issued), a tap on a change now
   takes the board back to the working copy first — as Edit Schedule already did. Nothing of the older version is
   loaded or changed.
5. **In OIL Earn** the tap rings the man (or the row's name) and changes nothing — nobody's OIL moves.
6. **A man who IS in his seat on the board's AMT brief or debrief row** (the board draws no people there): the tap
   rings the row's name and says nothing.

## 1. The eight questions, and the tier

| # | Question | Answer |
|---|---|---|
| 1 | OIL, pay, how many count as present | NO — the tap moves the view and rings a place; it writes nothing. In OIL Earn it presses no switch: Saturday was byte for byte the same after the taps (step O5; the unit test compares the day before and after). |
| 2 | The published record | NO — nothing is published, signed or amended by a tap. A published day was walked because the "To go out" list is a door to the same tap (§5). |
| 3 | Saved data | NO — nothing is stored and nothing is read differently. |
| 4 | A shared drawer | **YES** — one "take me to this change" serves Edit Schedule, the Scheduler Board and View-only Sched, from All changes, New to you and To go out. |
| 5 | A new gesture or mode | NO new control — an existing door whose LANDING changes. Walked as one. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — who may open the window and tap is unchanged. A member was walked all the same (his page draws the rows differently). |
| 8 | The warning list | NO — the passing note is not a warning; no rule is read differently. |

**Tier: WALK.** One outside reader for the scenarios (the guide's §4: more than one surface) — Astra. No code read
by two is required at this tier, and none was run.

## 2. The rulings that apply, each checked in the running build

| Ruling | What it says | Result |
|---|---|---|
| D733 (10 Oct 26) | A place another man has since taken: the tap lands there, whoever stands there now; nothing is said | PASS — desktop board and phone week (R2, R3); the placeholders too (unit) |
| D107 | A tap on a change keeps him on the page he is on | PASS — no step left its page; the two sentences that sent him to the other page are said only where true |
| D167 | The window stays open; on a phone it drops to a bar | PASS — every landing measured clear of the window and of the bar |
| D168, D338 | One window; members read it, read only | PASS — M1–M3, I1–I2 |
| D339, D345 | The phone's Hide / Show; a gold dot on every detail with a history | PASS — "Show" brought the window back between taps; an open bubble on another detail is closed by the tap (unit) |
| D726 | Few words on screen | One sentence of five words |
| D672 | The screen moves only when the change is out of view | Not changed by this build (the scroll is the tap's own, as before) |
| D56 | Harm only in stored data is not a finding | In Astra's brief; nothing of the kind was raised |

No ruling is contradicted or narrowed. D733 is new and is recorded.

## 3. The roll-call — every kind of place a change line can name, on every page that draws it

Columns: where the tap lands when the place is EMPTY now · what proves it. "box" = the row's people box ("+ add").

| The place | Scheduler Board | Edit Schedule | View-only Sched | Proof |
|---|---|---|---|---|
| Common Programme row (his) | box + sentence | box + sentence | the people of the row if a man remains, else sentence only | walked D-B1/2, D-W1/2, P-W1/2, P-B1/2, M2; unit, every page |
| Duty desk — its own seat | box + sentence | box + sentence | as above | walked D-B3, D-W3, P-W3, X2, X3 |
| Duty desk — an extra man | box + sentence | box + sentence | people of the desk + sentence | walked D-B4, D-W4, P-B3, M3, I2 |
| Ground row — its own seat | box + sentence | box + sentence | as above | walked D-B5, D-W5, P-W4, P-B4 |
| Ground row — an extra man | box + sentence | box + sentence | as above | unit (same box, same route as the desk's extra — walked) |
| Sim — a seat (front / rear) | the seat itself (drawn empty), nothing said | box + sentence | as above | walked D-B6, D-W6, P-W5 |
| Sim — a passenger | the seat itself, nothing said | box + sentence | as above | walked D-B7, D-W7, P-B5 |
| Sim — an extra man | the spare seat itself (D50), nothing said | box + sentence | as above | unit |
| AMT brief / debrief row | **the row's name** (the board draws no people on it) | box + sentence | as above | unit, both pages |
| Flying seat | the seat itself ("+ FCP"), nothing said | the seat itself, nothing said | the other seat of the jet, else sentence only | walked D-B8, D-W8, P-W6 |
| An input's own row | unchanged — its own route (`iu:`), not a seat | unchanged | unchanged | the older tests (`dpfixes.test.tsx` F5), still green |
| A text box (name, time, remark) | its own box; "shown on the week" only for the programme's second line | its own box; "shown on the scheduler board" only for a standby line's B box | "not shown on this page" | the box roll-call test (every box either page draws, seven days + all three standby kinds) |
| The traffic line | "not shown on this page" | the same | the same | unit (found by the break test, §7) |

**Other states of the same door:** another man in the place (D733) — walked R2, R3; the row deleted — walked G2
("no longer on this day"); the row moved — unit; a published day's To go out lines — walked T3, T4; the board
looking at an older version — walked L2; a member on the issued face — walked I2; OIL Earn — walked O3, O4; a line
of another day — walked X2 (board), X3 (phone); Undo and Redo — walked U1–U3; a placeholder — unit; a bubble already
open — unit.

**What lies on the same pixels:** the changes window (desktop, movable) and its bar (phone). Every walked landing
was measured ON SCREEN, CLEAR of the window or bar, with NOTHING drawn over its centre. The passing note sits over
the phone bar's "Show" for its two seconds — older than this build, every note does (§8, filed).

No row is MISSING. Two are limits, said in §0 (2) and filed.

## 4. The sizing step (D607, D608)

*Said to him in the tier block before the walk; written here at its close.*

1. **The type of change:** C leading — an existing door whose landing changes — and D: the landing is drawn by two
   pages (and a read-only third), each by its own code.
2. **What only a walk could find:** that the place is brought ON SCREEN and not left under the window or the phone's
   bar; that the real route works — a man moved with the mouse, his line pressed at a point, on a phone by a finger;
   what each page really draws for an emptied seat. The unit tests cover which element is marked and what is said,
   for every kind, on both pages.
3. **What the ledger says:** type C — 15 walks, 8 found a real fault (31 faults); type D — 10 of 10 found one. No
   sheet records what a host's own scripted run costs.
4. **The walk chosen:** the host alone, by script; no helpers. Planned at about 20 steps; walked 44, then 19 more
   for Astra's scenarios — 63. Sizes: a desktop at his PC's 125% and a phone (390 × 844) by touch; no short screen
   (nothing viewport-tall was added). Carried by tests, §6.
5. **Its row** is in `docs/walk-ledger.md`.

**Out of order, said plainly:** the guide has the outside reader design the scenarios BEFORE the walk. The first 44
steps were walked first and Astra was asked what they missed; its scenarios were then walked as the second part. It
found three real gaps the first walk did not have — the order is the guide's for a reason.

## 5. What was walked, and what the screen said

The built app, served locally, by `hj-walk.mjs`; every line pressed AT A POINT proved to be that line. 63 steps,
all PASS on the final build; 0 browser errors.

**The fixture, through the app's own controls (F1–F9):** board, Monday — Ranger dragged from FLIGHT SAFETY
STAND-DOWN onto SODB, then on to WPNS & TACTICS SYNC (his own two rows now stand empty); an extra man added under
the SXO desk and taken off; men taken off (right-click) the SDO desk, HQ ENGAGEMENT, the OFT EP-4 front seat, an AMT
BOX passenger and a flying front seat. Saved, and reopened at each size and role (the history is kept, D338).

| Steps | Where | What was pressed | What the screen did |
|---|---|---|---|
| D-B1 – D-B8 | Desktop, Scheduler Board | each of the eight lines | rows that list their people: the row's "+ add" box ringed, "That seat is empty now"; the sim's seat, the passenger and the flying seat: the empty seat itself ringed, nothing said |
| D-W1 – D-W8 | Desktop, Edit Schedule | the same eight | the row's box ringed and the sentence for seven (the week draws no empty sim seat); the flying seat itself for the eighth |
| P-W1 – P-W6 | Phone, Edit Schedule, a finger | SODB, the stand-down, SDO, the ground row, the sim seat, the flying seat | the window drops to its bar; the box (or the seat) is ringed on screen above the bar; the sentence |
| P-B1 – P-B5 | Phone, Scheduler Board, a finger | SODB, the stand-down, the SXO extra, the ground row, the passenger | the same |
| M1 – M3 | Member (Ranger), View-only Sched | SODB; the SXO extra | SODB: the sentence, nothing ringed (§0 (2)); SXO: the desk's people ringed, the sentence |
| R1 – R3 | Board, then a phone | another man put on SODB; Ranger's line pressed | lands on the new man's puck; nothing said (D733) — the picture he asked for |
| G1 – G2 | Board | the SODB row deleted by its ✕; its line pressed | "That detail is no longer on this day"; nothing ringed |
| T1 – T4 | Board, a PUBLISHED Monday | To go out: the SXO extra taken off; MET + NOTAM's only man taken off | each row's box ringed, the sentence, no History bubble |
| L1 – L2 | Board looking at the Original | the SXO extra's line | the board goes back to the working copy; the box ringed; the sentence |
| I1 – I2 | Member, the issued face | the same line | Monday turns to its working draft; the SXO desk's people ringed; the sentence |
| O1 – O5 | Board, Saturday, OIL Earn on | the extra man's line (he is there); the desk's own man's line (taken off) | his own puck ringed, nothing said; the desk's name ringed, the sentence; Saturday unchanged, OIL Earn still on |
| X1 – X3 | Board on Monday / phone on Monday | Tuesday's line; Sunday's line | the board turns to Tuesday; the phone's week steps to Sunday; the box ringed on screen |
| U1 – U3 | Board | a man taken off; his line; Undo; the line; Redo; the line | empty: box + sentence → Undo puts him back: his puck, nothing said → Redo: box + sentence again |

**The pictures were opened** — 45 of the final run's 47, laid side by side: a ring on the named place in each, the
note where one is said, nothing over them. The other two (the refilled seat on a phone, and its drawn-only twin with
a note) were opened full size from the run before, when they were sent to him; the final run's are the same scene.
`r-phone-sodb-refilled-MOCK-note.png` is a DRAWING of the choice he did not take (D733) — the note in it was put on
screen by the script, never by the app.

## 6. What the tests carry

| The case | The test | What it proves, and how |
|---|---|---|
| Every kind of seat, emptied, on both pages | `histjump.test.tsx` — "a change whose seat is EMPTY now" × `KINDS` × 2 | which element is marked and what is said; the real window's own line clicked, the engine's own writers (the drop's and the tap-off's) |
| Ground extras, sim extras, the AMT brief row, a placeholder, a moved row, a bubble already open, a seated man on a brief row | the same file | the same route as a walked kind; their on-screen landing is the same people box (or name) already walked |
| The boxes one page alone draws | "every box one page draws and the other does not…" | every text box either page draws on seven days, with all three standby kinds added, set against the other page |
| On screen on a phone, under a finger | `e2e/changeswin.spec.ts` — "a change whose seat is empty now lands on its row" | a real browser, a touch at a point: on screen, clear of the bar, nothing over it — Edit Schedule and the board |

None of these stands in for a walked control: each kind's route on screen was driven at least once (§3).

## 7. The break tests, and errors seen

`scripts/handpass/hj-breaks.mjs` cuts each wire once and runs the tests that should go red: **13 of 13 RED** —
the row's people box; the people cell another man stands in; the row's name; the sentence on a landing; the sentence
where nothing can be landed on; the week-only box; the board-only box; "the other page only where it is true"; each
place of a To go out line in turn; the board leaving an older-version look; OIL Earn's row; OIL Earn's own man; a
seated man not called empty. **The first run had one wire with no test** ("only where it is true") — a test was
written for it (a detail no page draws).

Browser errors during the walk: none.

## 8. What was found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | Him | an emptied seat sends him from each page to the other | FIXED, red first (16 unit cases failed as he described) |
| 2 | The unit roll-call | the board's AMT brief / debrief rows draw no people at all — no box to land on | BUILT IN: the row's name |
| 3 | The box roll-call, with standby waves added | a standby line's B box is on the board only — the one true "shown on the scheduler board" | BUILT IN (`onlyOn`); the demo week flies no standby wave, so the test adds all three |
| 4 | Astra (1) | a To go out line landed on the desk's OWN man, or the row's name, with that one's History open | FIXED, red first (4 cases); walked T3, T4. Older behaviour, made inconsistent by this build |
| 5 | Astra (2) | with the board looking at an older version the tap said the seat was empty while the board still showed the man | FIXED, red first; walked L2. Before this build it said "shown on the week" there |
| 6 | Astra (3), reproduced by the walk | in OIL Earn a man in plain sight was "not shown on this page" | FIXED, red first; walked O3, O4 |
| 7 | Astra (4) | "the last fallback returns nothing" | NOT A FAULT — it read the file during the minute the host's break test had that line cut. The lesson is logged (observation 505): nothing rewrites the source while an outside reader reads it |
| 8 | The break tests | one wire had no test | FIXED — the test written |
| 9 | The walk, in passing | an extra man put under a desk and taken off reads "moved place 2 → place 2" in the window | FILED — `[HIST-JUMP-SEEN]` (older; words) |
| 10 | The build, in passing | on the board, lines about the area strip and the In-time / Rally are listed but are not buttons, though the board draws those boxes now | FILED — `[HIST-JUMP-SEEN]` (older) |
| 11 | Astra's (2), by reading beside it | the same older-version gap in the tap on a hidden-warning line, on the board | FILED — `[HIST-JUMP-SEEN]` (older; its own door) |
| 12 | The pictures | on a phone the passing note lies over the bar's "Show" for its two seconds | FILED — `[HIST-JUMP-SEEN]` (older; every note does) |

Astra's fifteen scenarios: 1, 2, 3, 5, 6, 7, 15 walked; 4, 8, 11, 13, 14 by unit test; 12 covered by D-W7 and M3;
9 (an input's row) is the unchanged route; 10 (free text in place of a man) — no control reaches it, not walked.

## 9. What was NOT walked, and why

- **His iPhone itself** — the walk's phone is Chromium at an iPhone's size, by touch. Nothing here depends on how an
  engine delivers a finger's lift; his look (§11) is the real device.
- **A phone on its side, and a short screen** — no surface of this build is viewport-tall; the landing is the tap's
  own scroll, unchanged.
- **Ground extras, sim extras, the AMT brief row, the placeholders, a moved row** — by unit test only (§6).
- **Free text typed where a man stood** — no control on screen replaces a seated man with typed words.
- **A guest** — a guest has no changes window; not checked again here.
- **The Leave War and the Tracker** — untouched; neither opens this window's tap.

## 10. The gates

The whole gate set, under the PC's lock with nothing else running, on `25381a4c` — the last code of this branch —
**WHOLLY GREEN: unit 9424 / 9424 (565 files) · build clean · tfin 728 / 0 · e2e 727 passed, 0 failed, 57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK.** The break tests (§7) were run before it and the source put back; the walk's final
run (63 PASS) is of the same code.

`Docs: OUTSTANDING 151 items (+2 −0) · DECISIONS D1–D733 (new: D733) · homes OK`
`docsize: OVER by 24381, deferred (D29)`

## 11. His look — two minutes, on his phone

1. **Edit Schedule, Monday.** Move a man from one Common Programme row to another, then on again. Open the clock,
   "All changes", tap "… moved in from …". *The page goes to that row, its "+ ADD" box is ringed, and it says "That
   seat is empty now".*
2. **Open the Scheduler Board on Monday and tap the same line.** *The same — and neither page sends you to the other.*
3. **Put another man in that place and tap the first man's line again.** *It lands on the new man's puck and says
   nothing (D733 — the picture you were sent).*
4. **On a published day, take a man off; open "To go out" and tap his line.** *The row's box is ringed, with the same
   sentence.*
