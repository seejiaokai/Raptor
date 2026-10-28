# [LW-WHOLE-LEAVE-WINDOW] — scenario design (28 Oct 26)

A fresh, blind Opus reader (the order's §4: scenario design asks what is MISSING; Astra out — D790, the [NO-ASTRA-LIST]
row) read the build spec `docs/superpowers/plans/2026-10-28-lw-whole-leave-build-spec.md`, the rulings and the code before
the build. Its report, condensed by the host (each gap's failure and fix kept); the dispositions are the host's.

## Gaps — and what was done

| # | The gap (failure → fix) | Disposition |
|---|---|---|
| G1 | Building "All" as a picked range would unlight Approved, empty the words box and hide the placed line → keep a separate target | Built so from the start (`whole`, never `span`); tests 4, 5 and the words case pin it |
| G2 | A mark put on cells by hand is lost when React rebuilds a row's class, when a month is drawn later, or under a drag's own clear → keep it alive | Fixed: the mark is laid on again by an observer of the grid while the window is open (not a `<style>` rule — the joined bar's `td:not(.selcell)` rules must see the class) |
| G3 | A new command type would be refused or tell the member nothing → run `clearRecords` as `lw.edit`, filter before the command | Built so (`lw.edit`, `recordTakeable` filters first) |
| G4 | The leave is worked out at render; words flushed at the press can join a neighbour, and another tab can change it → re-read after the flush | Fixed: re-read at every press after `flushWords` |
| G5 | On a free-half day beside leave filed on the Inputs page there is no choice and no Approve | Reading R6 (that day's window is the free half's, as built) — put to him |
| G6 | The lit leave button on "All" with Auto-approve off reads "None of those days could be written" | Fixed: closes, nothing written |
| G7 | Switching chips must take back armed asks | Built so |
| G8 | (a) a refusal of the whole leave should say nothing was decided; (b) a part-delete on a locked week must say so; (c) a passing note for days out of view; (d) the stale fallback | (a) "Nothing was decided." before the reason; (b) the door's own reason; (c) not built — the design guide's D850 asks for a note only where the screen does not show it, and the tapped day's bar does — said to him; (d) left |
| G9 | A day of the leave holding a second entry opens the day's list, deciding one record — against "any day" | Reading R6 — put to him with a picture |
| G10 | Approvals' Back after deciding in the window shows the line grey, "Already approved by Saber" | As built for any decision made on the grid; said to him |
| G11 | The chips are heard as durations; "Tue 13" has no month | Fixed: their own group "What it acts on", full names ("All 4 days, 9 to 12 Feb", "Only Tue 10 Feb") |
| G12 | The phone check needs the worst labels ("All 14 days" beside "Wed 30", "All 120 days"), a free-half day, a cross-year title | In the walk |
| G13 | D1290 not built | Wrong: it is (Matrix's phone scroll, M3 5.7) — walked |
| G14 | "moved from" and "placed by" name the tapped day's | Left: each is true of the day tapped; noted |

Readings added for him: R6 the days that open another window (G5, G9); R7 "All n days" counts calendar days (a Fri–Mon LL
reads 4, its charge 2); R8 a leave of several days can no longer be widened from its own window (no "Pick a range") — from
an empty day or a drag.

## Scenarios for the walk (S1–S20, the reader's)

S1 Delete on "All" of an approved LL — gone, one Undo, the member's one bell line. S2 words typed and not left join a
neighbour, Approve on "All" approves the five days. S3 award day: Delete armed → All → day → Delete asks again. S4 the lit LL
on "All", Auto-approve off then on. S5 OL on "All" over an approved run — a sensible reason. S6 morning run with an Inputs
afternoon on one day (R6). S7 a day with an award / second bid / amber "!" (R6). S8 a locked week inside the leave —
Approve: nothing, said; Delete: part, said. S9 approve one day, reopen ("All 2 days"), decide the rest, Undo each. S10
refuse one day, unrefuse — the bar joins again. S11 Approvals → dates → window → Back. S12 window open, top-bar Undo / Redo
of the placing. S13 another tab changes day 3 while open. S14 a member's run into closed days — Move, Delete, the closed
day's window. S15 phone 402 WebKit, worst labels, height equal to the one-day window. S16 marks across month redraws, a
remark saved, a drag. S17 a run across the period's end. S18 a morning run with an afternoon bid on one day — the cyan
covers the whole cell, Delete leaves the afternoon. S19 two next-door wordless bids by different people. S20 keyboard only.
