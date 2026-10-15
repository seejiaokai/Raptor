# Calendar step two — the fresh, blind Opus read of D910 (15 Oct 26, night)

**What was read:** the D910 change (commit 68bc6ad4b — on a phone the Inputs list's "+ Input" and dates button in the
tabs' top row) and its re-expressed tests, by a fresh Opus reader that did not write it (D790; no Fable — D903). Read
only; it ran nothing. Its whole report is kept in the chat; the findings and the disposition of each are here.

## Findings, and what was done

| # | Finding (the reader's) | Disposition |
|---|---|---|
| F1 | The gear's ⚙ drawn at 12px instead of 17px on the List AND the Calendar, at every width, the desktop included: the row's rules gained specificity from `:not(.inrange-pop .abtn)` (a `:not()` takes its argument's weight) and beat `.inputs-top .inputs-gear{font-size:17px;padding:0}`. | **CONFIRMED by measurement** (this build 12px / 8px 7px; the live app's copy 17px / 0) — **FIXED**: every exclusion is `:where(:not(.inrange-pop .abtn))`, which adds no weight. Pinned: `e2e/inputs-calendar.spec.ts` "D910 — a phone … the gear keeps its glyph" (390, 375). |
| F2 | A dates label that prints a year ("28 Dec → 11 Jan 2027") is wider than the room left on a 390 phone: the wrapping row drops the gear to a line of its own (D687, D693), and the label could not ellipsize (an anonymous box, centred). | **FIXED**: `.inputs-top>.inrange{flex:1 1 0}` (a zero basis never forces the wrap — the dates button yields), the label in `.inrange-t` with "…" as a last resort, `justify-content:flex-start`; and on any phone a label that prints a year takes the short form ("28 Dec–11 Jan 2027"). Pinned: the same browser test (a window into next year: all five on one line, the switch, filter and gear where they were) and `inputslist.test.tsx` "on any phone a window that prints a year…". |
| F3 | On a phone the page order put the two buttons after the switch while the screen draws them before it — Tab and a screen reader jumped. | **FIXED**: `{tabsRow}{phone && listTools}{views}{tools}`. Pinned: `inputslist.test.tsx` "the page reads the two buttons before the switch". (The Calendar head's same mismatch is older, D705 — not this change.) |
| F4 | On a phone (≤700) with the filter fields open, the date pop-up opened under the fields, not under the button's row; at 568 "All dates" then fell below the screen. | **FIXED**: on a phone, opening the dates closes the filter fields (they stay applied; the summary line shows them). Pinned: `inputslist.test.tsx` "opening the dates closes the open filter fields". |
| F5 | Test A1, moved to a 932-tall phone, still asserted "Keep editing" ≤ 844. | **FIXED**: compared with the screen's own height. |

**Notes taken:** the D909 test no longer REQUIRES the input's window to cover the day (D909 allows it; it does not order
it); a one-day window reads its day once ("15 Oct"). **Notes left as they are:** the two buttons are rebuilt when a
screen crosses 820 wide with the pop-up open (its half-picked range is lost) — rare, a turned tablet; the Calendar
head's older page-order mismatch (D705).

**The fixes are new code** (the order §5): a second fresh, blind Opus reader reads the fix diff —
`read-opus-d910-fixes.md`.
