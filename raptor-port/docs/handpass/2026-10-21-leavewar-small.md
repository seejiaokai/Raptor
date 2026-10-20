# The Leave War small fixes — the FULL bug check (21 Oct 26, the night's job 2)

Branch `claude/leavewar-small-1021`, cut from `main` at b3db0675f, pull request 556. D994's small fixes for one area (the
Leave War), one branch, one check (D485, D1087): **[LW-SEL-HALF-LABELS]**, **[LW-SETTINGS-SMALL]**,
**[LW-HARNESS-VIEWER-PIN]**, **[LW-ROWS-STALE-NOTES]**, **[LW-DOZE-GUARDS]**, **[LW-PHONE-AWAY-ROW-MISSING]**,
**[PO-MOVE-DATE-DELETE-ASK]** (D1102 built — a person deleted for good, so the tier is FULL), **[BATCH-14OCT-LEFTOVERS]**
part (c). Built and checked unattended (D596); one fresh Opus helper per job (D1103).
Pictures: `docs/img/handpass/2026-10-21-leavewar-small/` (`repro/` the host's reproductions, `w1/` and `w2/` the walk).

## Questions waiting for him
(filled at the close)

## 1. The eight questions and the tier
1. Money (OIL): **NO, with a reason.** Nothing here changes what a man is credited or charged: the half-day chips print
   the same stored code; Reset order and the grid's rows are display; the clash note's name is words. A delete removes a
   man's future OIL as it always did (D299) — the delete itself is unchanged, only when it is asked.
2. The published record: **NO, with a reason.** No publish, sign-off or amendment path is touched; a delete's effect on
   published days (D297, D299) is the existing pass, unchanged.
3. Saved data: **YES.** A person deleted for good (D287) — the date ask decides whether a tap saves a posting and runs a
   delete. And the grid's row set after a saved roster change.
4. A shared drawer: **YES.** The grid's row set (one sequence the real grid and the frozen name column both read); the
   half-day chips (two sheets, one look — D264); the clash note (desktop strip and phone list, one name lookup).
5. A new gesture or mode: **YES.** The Post out sheet's date box gains a two-tap state (D1102); three armed questions now
   end on leaving the page.
6. A new surface: **NO, with a reason.** No new screen, sheet or kind of row; the date ask reuses the sheet's own
   "Tap again to delete" button.
7. Roles: **NO, with a reason.** Every posting door is an admin's, unchanged (`canEditRow`, the Post out sheet drawn only
   for an admin); Reset order an admin's; the bridge is the developer's PC only. `perms.test.ts` ran green.
8. The warning list: **NO, with a reason.** The clash note is the war's own strip, not the schedule's warning list; its
   wording is unchanged (D837), only the name in it.
**Tier: FULL** (question 3 — a person deleted for good).

## 2. Rulings swept (every one that applies)
D287 (a man leaving flying for good is deleted; the delete asks twice) · D1102 (the date that sets a delete off asks twice
too; a future date saves at once; backing out leaves the posting as it was — on the records branch, recorded 21 Oct 26) ·
D290, D297, D299 (kept as a hidden mark; flown days keep his puck; the past kept) · D229, D294, D298, D300, D303 (the four
outcomes, their chips and one line) · D306 (the last admin who can sign in is never deleted by a posting) · D310, D322,
D323 (one door; Archive on Admin → Users is "posted out from today"; Restore there) · D308, D320 (a post-in date; every
stint kept) · D350 (the one undo does not take back a delete or a posting) · D264, D331 (the two sheets share one format
and look) · D160, D274 (Reset order in ⚙ Settings, as built) · D159 (the desktop opens at zoom 1) · D166 (the war follows
the signed-in person) · D827, D837 (the clash note's design and words) · D56 (stored demo data is not a finding) · D790,
D903 (a fresh blind Opus read; no Fable).

## 3. The roll-call
| # | Place | SHOWS | USABLE | Same pixels |
|---|---|---|---|---|
| R1 | the drag-selection sheet's "Which leave" chips, How much AM / PM / Full (desktop, phone) | "<LL" / "LL>" / "LL", every type | the fill writes the stored code | the sheet over the grid |
| R2 | the one-day sheet's chips (the reference, unchanged) | "<LL" / "LL>" | — | — |
| R3 | ⚙ Settings → Reset order's line, judged over the men drawn in the months on screen (desktop, phone) | greyed / lit, the hint below | two taps | — |
| R4 | Reset order's "Really reset?" across a page switch | taken back | one tap after return only arms | — |
| R5 | the phone grid's rows after a roster change made with the page away (Admin → Users add, archive, restore) | his row in the month he is in | — | the frozen name column |
| R6 | the desktop grid's rows, the same change | his row | — | — |
| R7 | the frozen name column (the same row sequence) | names beside their rows | — | — |
| R8 | the group headings' counts | the rows drawn under each | — | — |
| R9 | the Post out sheet's date box, a Delete posting, a date today or earlier (desktop, phone) | the date picked in the box and the line; "Tap again to delete <cs>" | the second tap saves and deletes | the sheet over the grid |
| R10 | the same, a date still to come | saved at once, no ask | — | — |
| R11 | the same, a chip / ✕ / leaving the page while asked | back to the date that stands | — | — |
| R12 | the bid sheet's PO, an armed "Tap again to delete" across a page switch | taken back | — | — |
| R13 | the drag selection's PO, the same | taken back | — | — |
| R14 | downstream of a delete: Admin → Users (gone), a future day's seat (empty), a flown day (puck kept) | as D297, D299 | — | — |
| R15 | the clash strip (desktop): a man with no war row | his callsign | its instruction link | — |
| R16 | the phone's clash list: the same | his callsign in the names column | its row button | — |
| R17 | the OIL tracker's roster (reads the roster, not the month window) | must not change: untouched | — | — |
| R18 | the developer's-PC bridge (`w.raptorRole`, `w.lwSetViewer`) | no screen — carried by a test | — | — |

## 4. The door check
The Post out sheet: reached by an admin's tap on a struck (posted-out) day; its date box (the app's calendar), its four
chips, ✕, "Undo post out (PO)", "Place leave or OIL here instead…". The other two posting doors: the one-day sheet's PO
(a day of a man not posted out → PO), the drag selection's PO (one man's cells). Reset order: ⚙ on the grid's top row. The
roster change: Admin → Users (add with a post-in, the row's Archive, the Archived group's Restore with a post-in).

## 5. Sizing the walk (D607)
1. **The type of change:** G (a delete — saved data, final) and C (the date box's two-tap state; three armed questions that
   end on leaving the page) for item 7; D (one row sequence read by the grid and the frozen column; one name lookup read by
   the desktop strip and the phone list) for items 6 and 8; E / D for item 1 (one chip row, drawn by two sheets); C for
   item 2's arm. Items 3, 4 and 5 have no surface (a test bridge, words in comments, a check that closed with no change).
2. **What only a walk could find here:** the date box's calendar and the ask on a real phone and desktop, the line and the
   button reading the date picked; the back-outs done with real presses; the delete's downstream on Admin → Users and the
   schedule; an armed question across a real page switch (the page kept mounted, the sheet left open); the phone grid's
   rows after a roster change made on Admin → Users with the page away; the half-day chips on both sheets side by side;
   the clash note for a man with no row on both layouts.
3. **What the ledger says:** C walks find order-of-action faults the tests missed in about half the rows; D walks find a
   surface left behind in most; G walks find the save path's gaps when a reload is part of the walk. A row of type A in a
   display rule found nothing beyond its tests.
4. **The walk chosen:** two Sonnet 5.5 walkers (D787), in parallel, each on its own fresh world against the exact build
   (`npx vite preview --port 4292`, built at 7b9264cc7), both widths — **W1** item 7 (the designer's scenarios 1–3, 5–7, 9,
   11, 14, 17, 19, 20, then 4 last; 12 and 16 by the host's reading of the code: see §10), **W2** items 1, 2, 6, 8
   (scenarios 21, 22 (a) (c) (h), 23, 25, 27, 30, 32, 33, 34). Carried by tests (named in §7): the today / yesterday edge,
   the chip back-outs one by one, the stale ask after a change underneath, the bridge pin, the half-labels' every type.
   The check lock is taken for the fanned-out walk.
5. **After the walk:** its row is in `docs/walk-ledger.md`.

## 6. The orders walked
(filled from the walkers' tables)

## 7. Cases carried by a test
- The date ask's edges — today asks, an earlier day asks, a date to come saves at once, a non-Delete posting saves a past
  date at once; the second tap saves the PICKED date and deletes (deletedFrom = today); a chip, ✕, a date to come picked
  while asked; leaving the page; the posting changed under the question; the bid sheet's and the drag selection's arms on
  leaving the page — `leavewar/ui/postout-date-delete.test.tsx` (the real sheet in the wired world, the app's calendar
  pressed; the delete run by the sync's own pass).
- Reset order over the men drawn; leaving the page takes "Really reset?" back — `leavewar/roster.test.ts` (the store's
  answer with a row test), `leavewar/ui/settingssheet.test.tsx` (the sheet, the page signal flipped as the Shell flips it).
- The phone's row set after a roster change, both ways round — `leavewar/ui/rowwindow.test.tsx` (the grid's own measure
  over stated geometry, one month in view; the dates moved by the store's posting writer).
- The half-day chips' words — `leavewar/ui/movestandard.test.tsx` (the drag sheet rendered, How much pressed).
- The clash name on both layouts — `leavewar/clashwayout.test.tsx` (both real stores, a real clash).
- The bridge's role switch keeps the pin — `probe-bridge-viewerpin.test.ts` (the bridge's own globals).

## 8. Break tests
(filled at the close)

## 9. Errors seen
(filled from the walk)

## 10. What was NOT walked, and why
(filled at the close)

## 11. Gates
(filled at the close)

## 12. The model reads
- **The scenario designer:** a fresh, blind Opus (`parts/lws/scenarios.md`) — 36 scenarios, 11 breaks, 7 "may be missing".
- **The fresh, blind Opus read** of the finished code: (to come).

## 13. Findings and dispositions
(filled at the close)

## 14. His look — the card
(filled at the close)

## Walk line
(filled at the close)
