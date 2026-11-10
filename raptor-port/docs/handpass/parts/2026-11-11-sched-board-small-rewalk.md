# The small schedule-and-board fixes: the re-walk of the reads' fixes — walker's notes (11 Nov 26, chat 64)

Build walked: `raptor-port/dist` as found (not rebuilt). No port: the build is served from inside the test browser (`WALK_DIR=dist`).
Scripts: `scripts/handpass/sb63-walk.mjs` (R1, run as `ONLY=w8,w9 SIZES=pc,phone,side`) and `scripts/handpass/sb64-rewalk.mjs`
(last version line: `sb64-rewalk v13`; R2–R9; one unfiltered run). Pictures: `docs/img/handpass/2026-11-10-sched-board-small/rewalk/`
(166 pictures). The R1 output is in the walker's scratch folder (`job1-walk/r1.txt`), the full run's in `job1-walk/final.txt`.
Sizes: `pc` 1536×730 Chromium; `phone` 402×874 WebKit with touch; `side` 874×402 WebKit; R2 only: 402×874 Chromium with touch
(the two-finger pinch needs the browser's own touch input, which WebKit cannot send — the e2e test does the same).

## Totals
R1: 27 PASS. R2–R9: 68 PASS, 0 FAIL, 2 NOT RUN. Together 95 PASS, 0 FAIL, 2 NOT RUN.

## Per scenario and size
- **R1 pc / phone / side — PASS** (27 assertions, W8 and W9/W9b): `w8-*`, `w9-*`, `w9b-*` (3 pictures per step). Phone window 320–862 × 12–390 (css px), box landed clear of it.
- **R2 phone (Chromium), pinched to 0.50 — PASS**: box from -767 to 83–96 under the bar, on top; Redo in view, list 1234 → 1234. `r2-small-1..5`.
- **R2 phone (Chromium), pinched to 2.00 — PASS**: box from -5017 to 83–131, on top; Redo list 1075 → 1075. `r2-twice-1..5`.
- **R3a Auto sort pc, phone — PASS**: Undo and Redo each bring a row that moved into view (box 114–138 pc, 83–107 phone). `r3a-pc-1..5`, `r3a-phone-1..5`.
- **R3b (b) pc — PASS**: the last Common Programme row dragged to the head; list at head; Undo goes to the foot, row at 698–722; Redo at the foot goes to the head (114–138) under the bar. `r3b-pc-1..5`.
- **R3b (b) phone — NOT RUN**: the grip lifted the row (lifted 1) but three drags (with an edge-scroll route on the phone) never re-ordered the list in WebKit. Pictures `r3b-phone-attempt1..3`. (An extra attempt in Chromium with a phone's size and touch also failed three times; its pictures were not kept.) Not a finding: the gesture was not driven.
- **R3b (c) pc, phone — PASS**: row 0 dragged to row 2 with both places in view; list 0 → 0 → 0. `r3b-pc-6..9`, `r3b-phone-6..9`.
- **R3d Sort all, Ground rows in view, rows far above pc, phone — PASS**: Undo and Redo move nothing (pc list 2690 → 2690 → 2690; phone 5031 → 5031 → 5031). `r3d-pc-1..5`, `r3d-phone-1..5`.
- **R4 pc, phone — PASS**: remark of a rejected Meeting retyped, panel folded, scrolled away; Undo opens the panel and the line is in view (pc 688–722, phone 780–866); Redo likewise; with the panel folded, Undo of a remark elsewhere leaves it folded. `r4-pc-1..7`, `r4-phone-1..7`. (On the phone the passing "Undid:" note lies over the lower part of the line for a moment — see Leads.)
- **R5a sign-off phone — PASS** (line 83–234 under the bar). `r5a-phone-1..3`.
- **R5b hidden warning phone — PASS** (the warning's own line 83–124). `r5b-phone-1..3`.
- **R5c pc — PASS**: last warning of a long list hidden, issues list at its head; Undo scrolls the issues list 0 → 585 and the line stands at 295–335; the board's list 0 → 0. `r5c-pc-1..3`.
- **R5d pc — PASS**: line in view; Undo moves neither list (board 3026 → 3026, issues 0 → 0). `r5d-pc-1..3`.
- **R6 SANS card pc, phone — PASS**: Undo brings the card into view (pc 679–722, phone 823–866); Redo and a second Undo with the card in view move nothing (pc 3026, phone 5849). `r6-pc-1..7`, `r6-phone-1..7`.
- **R7 accepted input on a Ground row pc, phone — PASS**: Undo and Redo move nothing (pc 2724, phone 5118). At this scroll Personal Inputs was IN view on the pc and out of view on the phone; the panel stayed folded. `r7-pc-1..5`, `r7-phone-1..5`.
- **R8 changes window open, below and above the screen, phone, pc — PASS** (4 steps): phone window 320–862 × 12–390, box lands at 288–312 (below case) or 83–107 (above case), on top; pc window 114–674 × 1140–1520, box at 855–1090 so clear of it (window covers the board's right column, the box does not). `r8below-*`, `r8above-*`.
- **R9 pc — PASS**: on one flying line a seat (a roster man dragged on: "stiff" → "beams"), its remark and its take-off time, all in view; Undo ×3 and Redo ×3, list 907 after every step, every change taken back and restored. `r9-pc-1..9`.
- **R9 phone — seat part NOT RUN, rest PASS**: the roster drag moved nothing in three attempts (`r9-phone-seat-attempt1..3`) and the tap route (arm the seat, tap a man) timed out on the first tap (`r9-phone-seat-armed`). A second time box stood in as the third change: remark, two times, all in view; Undo ×3, Redo ×3, list 1285 after every step. `r9-phone-1..9`.

## Console, page and network errors
None in any scenario (every scenario collected console errors, page errors, failed requests and HTTP ≥ 400).

## Leads (not findings — no fault reproduced)
- On a phone the passing "Undid: …" note lies over the foot of the list for a moment, where an Undo that lands a box "just clear of the foot" puts it (R4 phone, R6 phone, R5b phone). The box is wholly on screen and the note takes no presses; it is the passing note only. Pictures `r4-phone-3-after-undo`, `r6-phone-3-after-undo`.
- The walk's own world: a drag UP onto a Common Programme row only re-orders with the pointer on the row's very top edge and the row's edge away from the list's edge-scroll zone (a drop 4–8px inside it, or one made 64px under the bar, did nothing). Written in the script as such.
- The phone's WebKit mouse drag did not re-order the Common Programme list in 3 attempts (see R3b), though it did re-order the Ground Programme (R3d phone passed).
