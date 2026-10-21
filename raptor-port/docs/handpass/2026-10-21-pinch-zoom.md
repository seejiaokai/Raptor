# Pinch to zoom on a phone — the board's desktop layout and Quals (`[BOARD-PHONE-PINCH-ZOOM]`, 21 Oct 26)

**His words:** D1107 (the board's desktop layout on a phone pinches; a dragged puck at the edge scrolls it), D1108 (Quals
pinches too); his "Yes to all" to the question page (D1109 the board, D1110 Quals) — the page and its pictures:
`docs/img/handpass/2026-10-21-pinch-zoom/questions-page.html` (published as his look page, https://claude.ai/artifact/CToLxASKAPs16wkGokL3K2).
**Branch:** `claude/board-pinch-zoom`, pull request 561.

## Questions waiting for him
None.

## 1. What was built
- **The board's desktop layout on a phone** (`ui/pinchzoom.ts`, wired in `ui/SchedBoard.tsx` on `.sb-main`; `board.ts SBZOOM`):
  two fingers on the day zoom it — out until the day's whole width fits the screen (402 ÷ 1180 = 0.34 on his iPhone), in to
  2; stretched as a picture while the fingers move, laid out once at the lift, the spot under the fingers kept under them.
  The bar is the phone layout's own bar, screen-wide, held at the left while the day slides under it (13-board-rows-responsive.css,
  up to 820 wide only). Opens at 1; kept across days; dropped when the board closes (✓ Done or a page change), on a change
  of layout and at a sign-in or sign-out.
- **The edge** (`ui/drag.ts tdWideLoop`): while a finger carries a puck over the desktop layout, a frame loop slides the board
  near the screen's left and right edges, and the list under the finger near its top and foot, at the finger band and ramp
  of `ui/edgescroll.ts`; the band the puck was picked up in is dead until the finger leaves it. A second finger during the
  hold lets the hold go (a pinch, not a pick-up); no pinch starts over a puck already picked up.
- **Quals on a phone** (`ui/QualsPage.tsx`): the table's zoom, the same pinch body; the pinned heading row wears the same
  zoom, its measured widths and its travel written in its own pixels; at the smallest zoom the table is measured again and
  brought in (it lays out about 10px wider than the zoom alone gives). Kept while he stays on Quals; a change of view keeps it.
- **Inside the zoom** (`ui/kbscroll.ts lift`): the box raised above a phone's keys moves in screen pixels.
- **Found by the walk and fixed:** a sideways swipe on the day itself never slid the desktop layout — the phone rules'
  `overscroll-behavior:contain` on the day (the 11 Aug 26 leak fix) made it a dead end sideways; only a swipe on the bar
  moved it. Older than this job (on `main` today). Now `overscroll-behavior-x:auto` on the day in the desktop layout.

## 2. The tier — the eight questions (the order's §5)
1 money NO (no OIL, nothing earned) · 2 published record NO · 3 saved data NO (the zoom is session view state, not
saved) · 4 shared drawer YES (the touch-drag machine every puck uses; the board's bar) · 5 new gesture YES (the pinch, the
edge scroll) · 6 new surface NO · 7 roles NO · 8 warnings NO. **WALK.** The fresh blind Opus read was run anyway (a new
gesture beside the drag machine) — §8.

## 3. The roll-call — every place the pinch or the edge could reach
| Place | Has it / must not, because… |
|---|---|
| The board's desktop layout, phone (≤820) | HAS IT — the day zooms; the phone bar; the edge scroll (walk B1–B9) |
| The board's phone layout | MUST NOT — his ruling keeps it; a pinch there changes nothing (walk B10) |
| The board at a desktop / tablet width (>820) | MUST NOT — `canStart` asks for ≤820; the bar rule is inside `max-width:820px` |
| The board's bar | MUST NOT zoom — `.sb-top` is outside `.sb-main` (walk B2: 402 × 75 at every zoom) |
| The windows over the board (ALL AVAIL, changes) | MUST NOT zoom — drawn on the body, not in the day; on a phone they are the bottom panel |
| Menus and sheets opened from the zoomed day (+ Wave, Templates, CX, Traffic) | MUST NOT zoom, and land at their button — `scripts/handpass/pz-pops.mjs` at 0.6: each opens just under the press, on the body |
| The failed-save and OIL bands in the board's bar | HAS THEM — `e2e/save-note.spec.ts` "on the board's Desktop layout the warning and its Retry are on screen together, at any pan" green with the new bar |
| The keyboard lift inside the zoom | HAS IT — `kbscroll.ts lift` divides by the list's scale; Chromium cannot raise an iPhone keyboard — his iPhone look |
| Quals' table, phone | HAS IT (walk Q1–Q6) |
| Quals' pinned heading row and name column | HAS IT — lined up within 1px at 1.24 (walk Q4); the name column at the left |
| Quals at a desktop width | MUST NOT — `canStart` asks for ≤820 |
| The puck drag at zoom 1 / the phone layout / a mouse | MUST NOT change — `tdWideLoop` only for a finger over `#schedBoard.sb-wide`; `e2e` drag files green |

## 4. Sizing the walk (D607 — `docs/walk-ledger.md`)
Type E (a gesture on a shared machine) and C (one layout rule). **SIZED SMALL by Opus:** the host alone, one scripted walk
by real fingers over CDP (two-finger pinches, a held puck) at his iPhone's size (402 × 874), the board's desktop and phone
layouts and Quals; every press a real touch; pictures each step.

## 5. The walk — 33 PASS, 0 FAIL, no browser error (`scripts/handpass/pz-walk.mjs`)
Pictures in `docs/img/handpass/2026-10-21-pinch-zoom/walk/` (opened: b1, b2, b7, q4).
- B1 the bar is the screen's width; ✓ Done, the next-day arrow and the calendar take a press at once; the day opens at 1.
- B2 a pinch out stops where the whole day fits (0.341, nothing left to slide); the stretch gone at the lift; the bar 402 × 75; ✓ Done pressable.
- B3 a pinch in three times wider comes back near 1 (1.022); a further pinch stops at 2.
- B4 what was under the fingers is still under them after a pinch (the same remark box at 1.20 and 0.80).
- B5 the next day keeps the zoom. B6 one finger slides the day sideways (after the overscroll fix — it failed first).
- B7 a crew puck (Comet) carried to the left edge and held: the day slid back to its start; over an empty Common Programme row it lit as the target, and Comet landed there.
- B8 a finger on a puck and a second finger: a pinch, no puck lifted.
- B9 after ✓ Done the board opens at 1. B10 the phone layout keeps no zoom; the page never zoomed.
- Q1 Quals opens at 1. Q2 a pinch out fits the whole table (after the re-measure — it was 372 for 362 first); the buttons and the switch unchanged. Q3 in to 2. Q4 scrolled down and sideways at 1.24: the pinned headings over their columns, the name column at the left. Q5 WSOs keeps it. Q6 back on Quals: 1.
- Found by the walk: the swipe dead end (B6, fixed — §1); the table's fit 10px wide (Q2, fixed); a second finger landing off the table never started a pinch (fixed: a pinch starts on the first move of two fingers too).

## 6. Break tests — 5 of 5 caught (`e2e/pinchzoom.spec.ts`)
The bar rule taken out (2 tests red); the sideways overscroll fix taken out (1); the edge loop not started (1); the hold
not let go by a second finger (1); Quals' pinned widths not divided by the zoom (1). Each put back; all 5 green.

## 7. Gates
Unit: `src/ui/pinchzoom.test.ts` 9 new; the touched files (drag, kbscroll, quals, board, rowdrag, interact and 15 more) 589 green.
Browser: `e2e/pinchzoom.spec.ts` 5, with geometry, save-note, schedule-tab, kbscroll — 262 green. The full set: GitHub's run of
pull request 561 (D1086).

## 8. The code read
A fresh, blind Opus reader of the build commit — see §9 for its findings and each disposition.

## 9. Found, and each disposition
(filled after the read)

## 10. His look
On his iPhone (the walk cannot copy an iPhone's touch and scrolling — Safari's own pinch, its zoom, its keyboard): the
board's desktop layout — pinch out to the whole day and back in, ✓ Done always in reach, a puck carried to the edge; Quals —
pinch, scroll down, the headings over their columns.

Walk: docs/handpass/2026-10-21-pinch-zoom.md · 11 pictures · 3 surfaces (the board's desktop layout, its phone layout, Quals) · 1 size (402, touch) · MISSING: none
