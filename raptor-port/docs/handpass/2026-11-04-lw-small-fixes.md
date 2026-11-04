# The Leave War small fixes — bug check (4 Nov 26)

Branch `claude/leave-war-small-fixes`, pull request 632. The batch: [LW-PAD-SHOWS-FIGURE] (D1584, D1629, D1630),
[LAZY-PAGE-LOAD-FAIL] (D1631, D1632), [TALON-CLAW-SPOKEN], [LW-ZOOM-E2E-SLOW-RUNNER]; the Leave War's code-check warnings
(D1534) were already 0 (pull request 607). Approved drawings: https://claude.ai/artifact/Q4rDCbkPAhoSwPuohXhDR6 (version 2),
pictures and scripts `docs/img/handpass/2026-11-04-lw-small-fixes-mock/`, `scripts/handpass/lwsf-mock.mjs`, `lwsf-mock-caret.mjs`.

## The eight questions and the tier

1 OIL or who counts — NO: no figure is worked out differently; the pad saves through the same commands as before.
2 The published record — NO. 3 Saved data — NO: nothing new is stored. 4 A shared drawer — YES, narrowly: the claw is one
overlay for two pages, and the catch wraps both. 5 A new gesture or control — YES: Retry; the pad's box (a look, not a
control: a tap on it does nothing). 6 A new surface — YES: the failed-download card; "Still loading…". 7 Roles — NO (the
pad is an admin's, unchanged). 8 The warning list — NO.
**Tier: WALK.** The fresh blind Opus code read is added (D790, D1594): the Retry logic decides between a download and a
reload.

## The roll-call — every place the app draws what this batch touched

| Place | The figure box / highlight / typing line | The failed-download card | "Still loading…" | The spoken claw |
|---|---|---|---|---|
| The pad's top line, a phone held sideways (844 × 390) | HAS (D1584, D1629, D1630) | — | — | — |
| The pad's top line, an upright phone (402, 375, 320 wide) | HAS — the line is wanted whatever the turn (D1584's reading) | — | — | — |
| The cell's own box over the grid, on touch | HAS the highlight only; keeps its thin caret (since D636), hidden while highlighted (D1630) | — | — | — |
| A desktop's box over the cell | MUST NOT — the input itself is typed in and has its own caret (flytype.test) | — | — | — |
| The Required panel for several picked cells | MUST NOT — a sheet with its own box, typed with the phone's keyboard (ReqPanel.tsx) | — | — | — |
| The Leave War page (phone, desktop) | — | HAS (D1631) | HAS (D1632) | HAS |
| The Tracker page (phone, desktop) | — | HAS (D1631) | HAS (D1632) | HAS |
| The desktop's hidden pre-warm of the Leave War | — | MUST NOT show; retried on open (D1631) | MUST NOT (no claw while hidden) | MUST NOT |
| Every other page | — | MUST NOT — drawn at the tap, never downloaded separately | MUST NOT | MUST NOT |
| The start-up claw (index.html #bootclaw) | — | — | MUST NOT — the app's first download is not this catch's | keeps its own label "TALON is loading" |

## The sizing step (D607)

1. **Type of change:** C (a new control, Retry; a new look on the pad that tells what the next key does), B (a new card),
   D, narrowly (the claw and the catch serve two pages, each wired in `Shell.tsx`).
2. **What only a walk could find:** the box in the pad's top line at each phone width, iPhone-wide letters included (does
   ‹ › Done stay put; does it wrap); the highlight and line through a real tap sequence; the cell's caret hidden while
   highlighted; the card on a real refused download in each page, the top bar working past it, Retry both ways (still
   refused; then allowed); the desktop pre-warm failing silent and retrying on open; the "updated app" reload; "Still
   loading…" on a slowed download; the claw's words read from the page; keyboard reach of Retry; the plain-user round of
   opening both pages normally. The unit tests carry: the highlight / line / dash rules (flytype.test.tsx, 5 cases), the
   catch's choices (pageload.test.tsx, 8), the claw's words, busy mark and 8 s line (pageclaw.test.tsx, 4). The browser
   test carries the figure box on a phone with Done unmoved (leavewar.spec.ts, the Required figure test).
3. **The ledger:** C walks found a real fault in 8 of 15; B in 4 of 5 — new surfaces are where walks pay.
4. **The walk chosen:** one Sonnet walker (D588) runs a scripted walk on the built app, Chromium at a phone sideways and
   upright (402, and 375 with letters a seventh wider), a desktop 1440 × 900, and WebKit at the iPhone's size for the pad
   and the card; about 24 scenarios (below), every press pictured, the phone's taps also within 100 ms of the lift (§7.10);
   the host opens every picture that decides something. The drawing check (§7.10, D1495) is run by a second helper on the
   two drawn parts (the pad's box, the card). Repeated digit cases are carried by flytype.test.tsx.
5. **After the walk:** its row in `docs/walk-ledger.md` — added at the end of this sheet's work.

**§7.11's lessons, each against this change:** 1 (one state only) — the box is walked opened, typed, emptied, moved by ›
and reopened; the card both on screen and hidden, before and after Retry. 2 (one speed) — taps in quick succession on the
pad (three keys inside a second). 3 (feedback) — the point of the pad's change; the card's Retry shows the claw while it
tries. 4 (a press behind an open window) — a tap on another Required cell with the pad up. 5 (brought into sight) — the
box checked against the pad's own buttons at every width. 6 (only the real phone draws) — the caret's blink and iPhone
letters: WebKit and the wider letters here; his iPhone look before merge. 7 (a model of the phone) — not applicable: nothing
steers against the phone's own motion. 8 (a fix that reshaped a drawing) — the drawing check. 9 (alignment by eye) — the
box's and the day's middles measured, not looked at.

## Scenarios (the walk's own list)

Written for the walker's brief; results under §Walk below.
