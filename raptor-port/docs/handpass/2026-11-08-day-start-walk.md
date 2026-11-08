# Walk of D1786 — a flying line with no in-time and no rally starts the day at take-off less the default rally

Branch `claude/pr-day-start-7b064c`, built bundle served on port 4296, driven by `raptor-port/scripts/handpass/ds-walk.mjs`
(run from `raptor-port/`: `HP_URL=http://localhost:4296 node scripts/handpass/ds-walk.mjs`). Admin sign-in, Chromium, desktop
1536x864, phone 390x844 where said. Pictures: `raptor-port/docs/img/handpass/2026-11-08-day-start/` (the run empties that folder first;
the script's own readings are in `_results.json` there). Baseline before the fixture (Friday empty): Saint 12h30, Echo 21h25.

| Scenario | Did | Expected | Saw | Result | Pictures |
|---|---|---|---|---|---|
| S1 drawn example | Friday: + Wave, flying wave, VL 12:00 / 13:00, Saint front, Echo back, nothing else; Insights | R box faint 09:00; Saint 18h30, Echo 27h25 | R box empty with faint 09:00; Saint 18h30, Echo 27h25 | PASS | s1-line-on-board, s1-insights-rows |
| S2 accept the suggestion | typed 09:00 in R; Insights; cleared R | unchanged | Saint 18h30, Echo 27h25; R cleared to empty | PASS | s2-r-typed-0900, s2-insights-after-0900 |
| S3a long day from the default rally | VL to 08:00 / 15:30; issues list | grey notes 12h30, 05:00 to 17:30, both men; long-day chip | both notes word for word; Saint's puck title "Long work day (>12h)" (Echo's puck is also red for a crew-rest breach, which is Thursday's landing, not this change) | PASS | s3-board-line-0800-1530, s3-board-issues-list |
| S3b Edit Schedule week | Friday in the week | day shows the notes | Friday header "3 issues · 1 warning" (folded); pucks drawn; the week was not opened further | PASS (by eye) | s3-editschedule-friday |
| S3c R box | typed 07:00, then cleared | notes go at 07:00 (10h30), back when cleared | none with 07:00; both back when cleared | PASS | s3-r-0700-notes-gone, s3-r-cleared-notes-back |
| S4a Logic row | Logic on desktop and phone | row words as ruled | words match exactly; phone row wraps fully, nothing cut | PASS | s4-logic-row-desktop, s4-logic-row-phone |
| S4b 3h to 2h30 | set 2h30; Insights; Friday issues | Saint 30 min lower, long-day notes gone | Saint 25h to 24h30, Echo 33h55 to 33h25; no long-day notes (12h00 not over 12h) | PASS | s4-logic-2h30-editing, s4-insights-2h30, s4-board-issues-2h30 |
| S4c back to 3h | set 3h | hours and notes return | Saint 25h, Echo 33h55, both notes back | PASS | s4-insights-back-3h |
| S5 published day | published Friday (four sign-off names picked, "Friday published and approved", version ORIG); default rally to 3h30 | view-only keeps 12h30; Edit Schedule working copy 13h00; Insights +30 min | view-only Friday (issues opened) shows 12h30, 05:00 to 17:30 for both; working copy board shows 13h00, 04:30 to 17:30; Insights Saint 25h30, Echo 34h25 (+30 each) | PASS | s5-published-friday-board, s5-board-working-3h30, s5-editschedule-friday-3h30, s5-viewonly-friday-published, s5-insights-3h30 |
| S5 note, not judged | after the 3h30 change Friday's board reads: ORIG chip, "Not yet signed", the four sign-off boxes empty, "1 pending", button "Publish AL1" (before the change it read signed, "17 changes", "Unpublish") | recorded only | as left | recorded | s5-published-friday-board, s5-board-working-3h30 |
| S5 restore | default rally back to 3h | | Saint 25h, Echo 33h55 | done | |
| S6 plain-user round | Insights open/close from the board, Edit Schedule and View-only Sched; ✓ Done; three of the four Logic folds opened and closed; phone: Edit Schedule's ⋯ menu and View-only's ⋯ menu to Insights | all open and close; board closes; phone fits | all opened and closed; Done left the board; phone Insights 390 wide fits, no side scroll, Saint 25h, Echo 33h55 (highlighted) | PASS | s6-insights-from-board, s6-insights-from-editschedule, s6-insights-from-viewsched, s6-after-done, s6-logic-fold-open, s6-logic-folds-closed, s6-phone-menu, s6-phone-menu-viewonly, s6-phone-insights, s6-phone-insights-viewonly |

Hours in S4 to S6 sit 6h30 above S1's (Saint 25h, not 18h30) because S3 moved the line to 08:00 / 15:30; the changes between settings are what S4 and S5 judge.

## Errors
Console errors, page errors and 4xx responses over the whole run: none.

## Not walked, or limits
- View-only Sched has no door into a day's board, so the published notes were read from the week's own issues box (opened by its header), not a board.
- The Edit Schedule week's issues box stays folded; its notes were not opened there (the board's list was read instead).
- Phone taps were not pictured at 100 ms after the lift (D1281); the phone steps use Playwright clicks on a 390-wide window, not touch emulation.
- Only the settled screens were pictured. Eleven earlier script attempts (wrong expected hours, a hidden board counted as open, phone menu ids) were the script's own; the final run is the one cited.

## Re-walk after the readers' fixes

Bundle at commit 273b2e7cd (not rebuilt), served on port 4296; script `raptor-port/scripts/handpass/ds-rewalk.mjs` (adds r1-, r2-, r3- pictures, empties nothing; readings in `_rewalk-results.json`). Fresh sign-in as admin each time, Friday 17 Jul, Insights read before anything was added: Saint 12h30, Echo 21h25.

| Scenario | Did | Expected | Saw | Result | Pictures |
|---|---|---|---|---|---|
| R1 | + Wave, VL, take-off 05:00, landing blank, Saint front, Echo back | hours equal baseline; no long-day note | Saint 12h30, Echo 21h25; no long-day note | PASS | r1-line-on-board, r1-insights-rows |
| R2 | same line, take-off blank, landing 13:00, R 08:00 typed | hours equal baseline; no long-day note | Saint 12h30, Echo 21h25; no long-day note | PASS | r2-line-on-board, r2-insights-rows |
| R3 | then take-off 12:00 on the R2 line | both rise 7h (08:00 to 13:00 + 2h debrief) | Saint 19h30, Echo 28h25 (each +7h); no long-day note | PASS | r3-line-on-board, r3-insights-rows |

Console errors, page errors and 4xx over the re-walk: none.
