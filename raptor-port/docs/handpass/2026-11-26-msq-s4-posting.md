# Bug check — multi-squadron section 4: the Leave War's posting sheet in way C (26 Nov 26)

Branch `claude/msq-s4-posting-3ba6fa`, pull request 852 into `main`; built by chats 195–196 (Opus). His go: D2732 (with
D2648, D2653, D2659, D2660, D2727 — rows on the batch branch `claude/msq-b1-screens-135`). Coordinator: chat 193.

## The eight answers and the tier
1. Money (OIL, who counts present): NO — what each posting does on its date is unchanged; the posting calls are pinned
   the same (`msq-s4-posting.test.tsx` PT4, PT7; `po.test.tsx`); manning reads the posting as before.
2. The published record: NO — nothing on a schedule day changes.
3. Saved data: NO — the same writers, the same records; no new field.
4. A shared drawer: YES — the one-day bid window (`BidPicker.tsx`) and the drag window (`SelectSheet.tsx`) are shared
   by every leave action; the change hides their leave parts while a posting is open.
5. A new gesture or mode: YES — a removed mode (the grid's placing mode, D2727) and a redesigned control (Undo post out,
   D2660/D2732 Q1); the phone's keep-in-sight scroll now also runs as a posting opens (D1290).
6. A new surface: NO — the same sheets laid out anew.
7. Roles: NO — who may open a posting sheet does not change.
8. The warning list: NO.

**Tier: WALK.**

## The roll-call (§6) — every place the app draws a posting sheet or the removed control
| # | Surface | SHOW | USABLE | PAINTED there too |
|---|---|---|---|---|
| R1 | One-day window → ⋯ → Post out (new posting; `BidPicker` `bid-picker`) | | | |
| R2 | One-day window → ⋯ → Post in (new) | | | |
| R3 | An existing posting's sheet (`PostOutSheet`, `postout-sheet`) — Undo post out | | | |
| R4 | An existing post-in's sheet (`PostInSheet`, `postin-sheet`) — Undo post in; an earlier stint read-only | | | |
| R5 | The drag window → ⋯ → Post out (`SelectSheet`, `select-sheet`) | | | |
| R6 | The "Delete Cinch?" card from Post out (R1, R5, R3's date move) — "Delete Cinch now?" held red | | | |
| R7 | A tap on a gone day (after a posting-out date / before a post-in) — what opens now that "Place leave or OIL here instead…" is gone (D2727) | | | |
| R8 | A gone day that already holds an entry — opens its entry's window (D1722) | | | |
| R9 | The phone: the day kept in sight above the sheet as a posting opens (D1290) | | | |
| R10 | Every other place a posting's result shows: the grid's hatch and yellow line, Approvals, Admin → Users' row, the bell, the person window | | | |
| R11 | Admin → Users — draws no posting sheet in this build (way C there comes with its batch) | | | |
| R12 | A member: never reaches a posting sheet; his own tap on his own day outside his time opens the bid window (kept) | | | |

## The sizing lines (§7.0, the walk ledger)
1. Type of change: E (layout and look of six posting sheets) and C (a removed mode — the grid's placing mode, D2727 —
   and a redesigned control, Undo post out), with a one-line D1290 scroll added as a posting opens on a phone.
2. What only a walk could find here: the sheets as a person reaches them at each size (the bid window grows into a
   posting; the day under it — the phone fault the browser test found on 26 Nov); every way out (✕, Escape, a press on
   the day, a tap outside, Cancel on the card); the doors that reached the states the placing mode used to reach, now
   that it is gone (R7, R8); what lies over the sheet (the date calendar, the card hanging from the button); the
   narrow desktop width just above the phone split, where the chips may change row; a member's face. Already covered:
   the order and layout of a new Post out sheet, the chip rows, the main-button colour, the card's heights, the lone
   Undo and Q3 at two sizes (the browser test); the posting calls and the removed parts (unit tests PT1–PT10).
3. What the ledger says: layout walks (E) found a fault in four of ten, six faults; new controls (C) about half, the
   finds on wide jobs; his own look has found layout faults walks missed — so pictures at every size, each opened.
4. The walk chosen:
5. After the walk:

## The drawing check

## The scenarios (Astra and a fresh Fable, blind, combined)

## The orders walked

## Cases carried by a test

## The pictures

## The break tests

## Errors seen

## What was not walked, and why

## The code reads (Astra, a fresh Opus, a fresh Fable — blind)

## The coordinator's question: the three cut browser tests

## Gate counts

## What the walk found, and each disposition
