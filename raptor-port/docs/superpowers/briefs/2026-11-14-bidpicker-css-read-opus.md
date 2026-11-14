# Job 1 (the night of 14 Nov 26) — the fresh, blind Opus read of commit 237317147

Brief: `2026-11-14-bidpicker-css-read-brief.md` (beside this file). Saved by the coordinator (chat 72) as the reader returned it, condensed only in layout.

## Findings

**1. (Low to medium, cosmetic) The OIL-detail rows in the bid window lose 8px of top padding each.**
- Element and state: an admin taps a cell holding an OIL credit (the schedule's own credit, which opens the bid window — Matrix.tsx's "N16" comment — or a single award). The bid window shows `BidPicker.tsx` lines ~1129–1179: `div.bidsheet-oil-detail`, whose rows ("Where it came from", "Reason", "Given by", "Entered by", "Days") are each `div.bidsheet-row.postout`.
- Before: `padding-top: 10px` from the wrapped `#page-leavewar .bidsheet .bidsheet-row.postout` (1,3,0, line 344); the then-unwrapped `.bidsheet .bidsheet-oil-detail .bidsheet-row` (0,3,0) lost on that property.
- After: the moved rule is `#page-leavewar .bidsheet .bidsheet-oil-detail .bidsheet-row` (1,3,0, line 1397) — equal weight, later, so it wins: `padding-top: 2px`. Each row's top line sits 2px above its words instead of 10px; the block is about 32–40px shorter.
- Why the 78 states missed it: no captured state shows this block (the `oil-award` state has no OIL-detail rows; `daylist-oil` rows are plain `.bidsheet-row` without `.postout`).
- Fix: split the rule — `padding-bottom: 2px` at full weight, `padding-top: 2px` under `:where(...)`; a "MOVED INSIDE" note; a capture state "admin taps a cell holding one OIL award or a schedule credit, bid window open".
- Note: the old comment above the rule says it sits inside the nesting "so it cannot lose to its own neighbours" — 2px may have been the intent; keeping it would be his choice, not a silent result.
- Failing test: in that state, the row's computed `paddingTop` — 10px before, 2px after.

## Checked, no change
Hover / focus / focus-visible pairs; the 430, 700, 1100 and hover media blocks; no `!important`, `&`, `@keyframes` or `:has()` in the moved range (the three `body:has()` pop-up rules stay outside on purpose); the 15 selectors that lost the page prefix keep their weight; none of the moved classes is drawn outside `#page-leavewar`; each deleted declaration had an unconditional wrapped competitor (dead before); the two `:where()` rules come out at (1,0,0) and keep their outcomes; the guard passes 7/7, `KEPT_MAX` pinned at 0 and the list `{}` — a rule appended after the close is caught; the `deletesure` and `eventslist` test edits only re-point at the same values.

## Tidiness note (filed, not fixed)
- Written twice: each "MOVED INSIDE" comment quotes the deleted CSS in full and repeats the same reason, the head comment a third time — one line naming the winning rule would do.
- No longer applies: the guard test's long rule-5 text and list-shrink machinery now guard an empty list pinned at 0; the deletesure test's name still says the Delete's words "wrap, in every window"; the history notes on `.secdef-snack`, `.lwday-more`, `.bidsheet.fullpage` ("named with the page before").
- Harder to read: the armed Delete split into a weighted `line-height` rule and a `:where()` `white-space` rule, and `.dl-acts .dchip` relying on `:where()` weighing (1,0,0) — one shared note on the pattern would help.
