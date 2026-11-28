# w14d report — the calendar's doors, the merged bell, the plain-user round (chat 174, 25 Nov 26)

Table: `raptor-port/docs/handpass/parts/swd/w14d-walk.md` (per-scenario summary, finding-candidates, lessons, every step).
Pictures: `raptor-port/docs/img/handpass/2026-11-24-sans-words/w14d/` (226, cropped bells); raw runs
`D:/raptor-work/c174-walk/w14d/` — cited: desktop `run2` + `run3` (a8b) + `run4` (E2); phone `run1p` + `run3p` (a8b, D1) +
`run4p` (E2). Earlier attempts not cited: `run1` (v1), and run1p's D1 / E2 (script faults, named in the sheet). Scripts
`raptor-port/scripts/handpass/swd-w14d*.mjs` (uncommitted). Server on 4814 stopped by its port. Recipes appended to
`D:/raptor-work/c174-walk/recipes.md` (§From w14d).

## Counts
211 judged steps (both sizes): PASS 160 · FAIL 0 · RECORDED 49 · NOT WALKED 2. Plus 106 set-up steps (all landed), 26 error
watches (no console error, page error or failed request in any cited run).

## Faults
None. The one red the scripts printed in the cited runs — a8.02 "never a Fly offer saved on a no-fly day", both sizes — rests
on no ruling (D642, read whole, says only that a no-fly day "still shows and takes OFT and AMT commitments"), so it is
RECORDED for him (D2611) as candidate 1. The other reds were the script's own (run1's B5 door, run1p's d1.9 month regex and
E2's covered bell), each re-walked and passing.

## Probes
- P9 YES — SANS day → "Calendar…" → the Calendar window → the date's NF key (desktop) / stepping button (phone).
- P10 — a member's window over a shared offer filed for him has no Save or Delete ("Only Saber — who filed it — or an admin can
  change this for everyone.").

## RECORDED finding-candidates
1. A8 / a8b: a Fly offer saves on a no-fly day, with or without a cut, and counts in "SANS committed to fly" (1) while the day
   needs nobody (NF / NF). Cut note on the drag: "Saved Fri 17 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul."
2. B5: a saved one-man filing's window has no Dates calendar ("To change its dates, delete it and add it again on the SANS
   calendar.") for Ranger and Saber alike — the edit-stretch cut (round 1 item 5) has no door on screen.
3. A4: a member cannot edit a shared offer at all, so D2394 Q10's refusal is reachable only by an admin.
4. D1 / D3: where the reminder sits — top of Ranger's bell (no age shown), bottom of Hex's (age "9 h", the seat placed minutes
   before; a lead on what that age counts from). Not ruled.
5. D1 (5): "Now Thu 30 Jul, renamed — was Training, and 1 more change · Saber" — D2521's count as built; D2600 not built.
6. D3: the deleted input's line "Meeting · Mon 27 Jul · Deleted · Saber" (D2563 not built); its tap "That input is gone".
7. E: Escape does not leave Quals' Edit quals (Done does), both sizes.
8. E5 ([SANS-WORDS-LEFTOVERS] (5)): the passing note covers the phone day window's date and ✕ for its seconds; it takes no
   presses, and a tap on the ✕ beneath it closed the window — the tap lands.
9. Lead seen again: View-only Sched heads "Monday Jul 13 · Today" with the clock at Wed 15 (w14c's lead 9).

## PASSes worth naming
B6's three after-cut saves never leak the cut note. A3: Saber's window opened on Zenith, Ranger picked, one filing Fri 17 –
Sat 18 with "Wed 15 – Thu 16 Jul were left out because Ranger is SANS from Fri 17 Jul.". A6: greyed words follow both moves
(D2394 Q4 / D2421), Saber never grey. A9: gap refused whole, the cut saves Fri 17 – Sat 18. D1: D2521's lines exact, newest
first, each written at once (D2562), taps and Mark all read survive a reload. D2: Undo takes back the input's move, the A line
untouched, the posting's Undo greyed with D350's reason. E: every window closes each way; D2560 holds after the delete.

## Not walked
B5's stretch (no door — RECORDED). D2's read case (P6 NO, test-only). A6's second phone height was not reached by the tap in
A6 itself; it was read in A9 (lower height, words inside).
