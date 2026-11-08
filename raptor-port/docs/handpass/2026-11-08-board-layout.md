# The board's layout — the pictures round's group 1 (chat 11, 8 Nov 26)

D1780 (a phone on its side: the head scrolls away, the bar stays), D1781 (821 to 1099 wide: the remarks on their own row,
the times stacked), [BOARD-KEYS-LOOKS] (D1771 the cyan keyboard ring; D1772 nothing to build), the tidy-up of the ⋯ menu's
item list. Branch `claude/pr-board-layout-62eb71`. Plan: `docs/superpowers/plans/2026-11-08-board-layout-group1.md`.
Pictures: `docs/img/handpass/2026-11-08-board-layout/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL, who counts present) | NO — layout and rings only; nothing counted is touched |
| 2 | The published record | NO — nothing published or printed changes |
| 3 | Saved data | NO — nothing stored changes |
| 4 | A shared drawer | YES — the ⋯ ring reaches the week's ⋯ too; the jet's line is drawn for every flying and standby wave |
| 5 | A new gesture or mode | YES — on a phone on its side the board scrolls as one page |
| 6 | A new surface | NO |
| 7 | Roles | NO |
| 8 | The warning list | NO — what the warnings say and how a rule is read are untouched |

**Tier: WALK** (told to him 8 Nov 26).

## 2. The roll-call

Three things touched: **(A)** a jet's line on the desktop board 821–1099 wide; **(B)** the board's top and what scrolls
on a phone on its side; **(C)** the cyan keyboard ring. Each place the app draws them, and what must and must not change.
SHOW = drawn as it should be · USABLE = the gesture works · PAINTED = what else is drawn there. "—" = to be walked.

| # | Place | Should | SHOW | USABLE | PAINTED |
|---|---|---|---|---|---|
| A1 | Board, desktop look, 821–1099 wide, a flying jet's line | remarks own row; R/B, TO/LD stacked (D1781) | — | — | — |
| A2 | The same, a standby line (SC, AVALON, BB — R · B · START · END, D1085) | stacked the same way | — | — | — |
| A3 | The same, the in-time lines over a wave | unchanged | — | — | — |
| A4 | Board, desktop look, 1100 and wider | must not change (D1029) | — | — | — |
| A5 | Board, phone look (820 and narrower) | must not change | — | — | — |
| A6 | Board's desktop layout switch on a phone (`.sb-wide`) | must not change, because the band is on the desktop look only | — | — | — |
| A7 | Edit Schedule's week, View-only Sched, the next-week peek | must not change, because they are drawn by the week's own builder | — | — | — |
| A8 | Board, a look at a published version (👁) at 821–1099 | stacked as A1 (same lines, read only) | — | — | — |
| A9 | History on: gold dots on a stacked line's boxes | each dot on its own box | — | — | — |
| B1 | Board on a phone on its side, ≥821 wide (his 874 × 402; 844 × 390) | head scrolls away, bar stays ~51px (D1780) | — | — | — |
| B2 | The same, a box tapped with the keys up | rises above the keys; nothing jumps (D1081, D1412) | — | — | — |
| B3 | The same, the crew and issues column | stands under the bar; its lists scroll inside it | — | — | — |
| B4 | The same, the "Not saved" band and the OIL bar under the bar | stay with the bar | — | — | — |
| B5 | The same, a window opened over the board (ALL AVAIL, changes) | opens below the board's bar (D1106) | — | — | — |
| B6 | The same, a puck or a row dragged to the top or foot | the board scrolls under it (D895 §5A) | — | — | — |
| B7 | The same, a warning's tap, a change's tap, an Undo | the row lands below the bar (D672) | — | — | — |
| B8 | The same, History's bubble on a box, then the board scrolled | the bubble follows its box | — | — | — |
| B9 | The same, the day changed (‹ › or a chip) | the new day shows; nothing left stuck | — | — | — |
| B10 | Phone upright (402 × 874) | must not change, because the query is landscape only | — | — | — |
| B11 | A desktop with a mouse, any size | must not change, because the query needs a coarse pointer | — | — | — |
| B12 | A tablet on its side (taller than 500) | must not change, because the query needs a short screen | — | — | — |
| B13 | The desktop layout switch on a phone on its side (`.sb-wide`) | must not change (its own pinch-zoom scroller, D1107, D1109) — filed | — | — | — |
| C1 | The board's ⋯ menu, an item under the keys | raised row + cyan ring (D1771) | — | — | — |
| C2 | The week's ⋯ menu (Edit Schedule, View-only Sched), an item under the keys | raised row + cyan ring (D1771) | — | — | — |
| C3 | + Block (a duty section; the AMT section) | cyan ring (D1771) | — | — | — |
| C4 | Templates — the desktop bar's, the phone day bar's | cyan ring (D1771) | — | — | — |
| C5 | + Wave, the plans selector, a jet's stores, the duty role box | cyan ring (D1646 — D1771's side note) | — | — | — |
| C6 | Any of the above pressed by a mouse or a finger | no ring | — | — | — |

## 3. The five sizing lines (§7.0)

## 4. The door check

## 5. The orders walked

## 6. The plain-user round (§7.0a)

## 7. The drawing check

The approved drawings (`docs/img/handpass/2026-11-07-pictures-round/`, drawn by `scripts/handpass/pr-board.mjs`, figures in
`pr-board-measured.json`) have no part list under `scripts/drawcheck/specs/`; the check here measures the built app with
the drawing script's own measure, copied whole (`scripts/handpass/bl-drawcheck.mjs`), against those figures, 2px.
Pictures: `docs/img/handpass/2026-11-08-board-layout/drawcheck/` (built-821 … built-1099 cut as the drawing's
`q-narrow-c-*.png`; built-sideways-rest / -scrolled / -keys).

**Run 1 (8 Nov 26, the build of commit f2ed9d815): 78 figures, 77 within 2px.** D1781 at 821, 874, 900, 1000, 1099 — each
of six lines' height (111), the line's width, the remarks' width (323 / 355 / 368 / 418 / 468), the buttons and the back
seat inside, nothing cut, the crew column's edge — all as drawn. D1780 — the top at rest 146; scrolled, the bar's foot at
51 and its two parts' place and width — as drawn. **One difference, named to him at his look:** with the keys up after a
tap on the drawn box (the first jet's LD, which already stands above the keys), the list shows 56, not 151 — the box does
not move because it is not covered (D1412), so the head stays until he scrolls; scrolled, the list has the drawn 151
(`e2e/board-layout.spec.ts`, the keys test, with a box low on the screen). This is D1780's own reading ("scroll away with
the list, as any page does"); the drawing's 151 is the scrolled state.

## 8. Cases carried by a test

## 9. The keyboard walk

## 10. Break tests

## 11. Errors seen

## 12. What was NOT walked, and why

## 13. The gate counts

## 14. What the walk found, and each disposition

## 15. The reads

## Walk line
