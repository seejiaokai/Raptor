# Bug check — questions at the button (D1627, D1628), 4 Nov 26

Branch `claude/ask-at-the-control`, pull request 630. The build: eight questions become a card hanging from the control
pressed (`ui/AskCard.tsx`) — the input window's swap (#2), Delete for all (#3) and Take me out (#4); the opened day's
Delete key (#5); the Leave War posting's delete from Post out in the day's and the drag sheet (#45, #46), from the Delete
chip (#47) and from a PO from date of today (#48). Numbers are the roll-call's of the look page
(https://claude.ai/artifact/1kU5EHYgJUVQCPejKhzuRi); his look at the build: https://claude.ai/artifact/NxHCM6u6fnpCbCURYi1qPN.

## The eight answers and the tier
1 money — NO: no OIL, leave or count changes; the posting's delete writes what it wrote before, through the same call.
2 published record — NO. 3 saved data — NO: no stored field added or changed. 4 shared drawer — YES: one card for eight
places, and a change to every floating window's come-forward (`ui/FloatWindow.tsx`) and every Leave War sheet's Escape
(`leavewar/ui/Sheet.tsx`). 5 new gesture — YES: the card's answers, Escape as the safe answer, the keyboard's return.
6 new surface — YES: the card. 7 roles — NO. 8 warnings — NO. **Tier: WALK.**

## The roll-call — every place these questions are drawn
| Place | Shows the card | Answers usable | What else is on its pixels |
|---|---|---|---|
| Input window (Inputs page) — Delete for all (#3) | YES (S1) | YES — Keep, Delete, Escape, Delete pressed twice | the form above the foot; covered only while up |
| Input window (the board's Personal Inputs — the schedule's pop-up) — #3 | YES (S9) | YES | the pop-up's form |
| Input window — Take me out (#4) | YES (S2) | YES — Stay in, Take me out, Escape, pressed twice | the button stays (aria-expanded) |
| Input window — swap from a calendar bar (#2, desktop) | YES (S3) | YES | drawn in the Inputs page, over the month |
| Input window — swap from the opened day's card (#2, phone) | YES (S3) | YES — the day keeps the front | the day's cards below the one pressed |
| Input window — swap from the day's + Input (#2) | YES (B3) | YES | the day's list |
| Input window — swap from the Inputs List row (#2) | YES desktop (S10) | YES | the list's next rows. Phone: NOT WALKED — the row lies under the window (D997, D909) |
| Opened day — Delete key on a card (#5) | YES (S4) | YES — Escape, Keep, Shift+Tab then Enter | the cards below |
| Leave War day window — Post out, Delete (#45) | YES (S5) | YES — Cancel, Escape (sheet stays), Post out twice, Delete | the sheet's lower rows |
| Leave War drag sheet — Post out, Delete (#46) | YES (S6) | YES | the sheet's lower rows |
| Leave War posted-out sheet — Delete chip (#47) | YES (S7) | YES — Cancel puts Overseas back; chip tapped again backs out | the outcome line |
| Leave War posted-out sheet — PO from today (#48) | YES (S8) | YES — Cancel puts the date back | the posting chips |
| A moved (dragged) Leave War sheet | YES (B2) | YES | — |
| Admin → Users' "Tap again to delete", the other 63 questions | MUST NOT change — D1627 "every other question stays as today" | unchanged | — |
| Other content a window draws in a portal (DateBox's floating calendar, MonthJump) | not a card — the come-forward change applies: a press on it no longer brings its window forward | its window is already in front when it is opened | — |

## Sizing (D607, §7.0)
1. Types C (new control: the card's answers, Escape, the keyboard's return), D (one card drawn in eight places), E (where
   it sits, at two sizes).
2. Only a walk finds: where each card stands against its control and what lies over it, at a phone's and a desktop's
   size; presses on a card drawn inside another window; Escape with the keyboard on and off the card; the keyboard's return.
3. The ledger: past C/E walks of floating surfaces found layering and focus faults that jsdom passed (lessons 4, 5, 19).
4. The host walked alone, one script (`scripts/handpass/ask-walk.mjs`): S1–S10 at both sizes and B1–B3. Carried by tests:
   the answers' effects in jsdom (`groupeditor.test.tsx`, `batch2.test.tsx` A1, `po.test.tsx`, `postout-date-delete.test.tsx`).
5. Its row is in `docs/walk-ledger.md`.

## What the walk found — six faults, all fixed and walked again
| # | Find | Cause | Fix |
|---|---|---|---|
| W1 | The keyboard was not on the safe answer (all cards) | the card was measured hidden, and a hidden button takes no focus | measured see-through (`27-ask-card.css`) |
| W2 | Phone: "Keep editing" did nothing on the swap card in the opened day | the input window came forward on any press React handed it, so it jumped over the card | a window comes forward only for a press inside its own box (`FloatWindow.tsx`) |
| W3 | Phone: Escape with the swap card up closed the opened day; the question stayed up unseen | the input window's Escape asked "am I in front?" and left it to the day | Escape answers the swap whichever window is in front; a question whose card's window closed goes with it (`InputWindow.tsx`) |
| W4 | Leave War: Escape on a posting's card closed the whole sheet | the sheet's own Escape, heard first | a sheet leaves Escape to a card in it; the card answers Escape wherever the keyboard is (`Sheet.tsx`, `AskCard.tsx onEscape`) |
| W5 | After the opened day's question, the keyboard went to the page, then the card's LATE chip | the card itself takes no focus | the keyboard goes back to what held it when asked |
| W6 | From the Inputs List the card hung from the small part of the row pressed, overlapping the row | the anchor was the pressed element | the anchor is the input as a whole (`closest('[data-iid]')`) |

GitHub's runs found two more: the code check (a helper exported from the card's file; a dialog finding on the wrong
line) and one older test (A1) asking for the input window in front — the design now keeps the opened day in front (as
drawn, D1627). Both fixed.

## The final walk
`docs/img/handpass/2026-11-04-ask-at-the-control/walk/A/` — 234 PASS · 0 FAIL · 1 NOT WALKED · 0 browser errors
(`results-ask-walk.txt` there). 50 pictures, a phone picture straight after each tap (D1281). The plain-user round
(D1557): after each go-ahead the other places were looked at — the opened day and the board's Personal Inputs no longer
show a deleted input (S1, S9), the day's card no longer names a man who took himself out (S2), Admin → Users reads
"auto delete" after a posting's Delete (S5, S6).

## The drawing check (D1495, D1426)
Each built card set beside his approved drawing on the look page (https://claude.ai/artifact/NxHCM6u6fnpCbCURYi1qPN),
by eye: the same card, place and words. No measured drawing-check run (the tool needs a drawing of the same screen state;
the drawings were made on today's screens with the card added). One difference, by design: in the phone walk of #2 the
input window had been pulled down to reach the other card, so it stands lower than in the drawing.

## Not walked
S10 on a phone — the List row lies under the input window (the app's own layout, D997, D909).

## Gates
GitHub's run of pull request 630 is the gate set (D1086). Unit tests of the touched files on the PC: green.
