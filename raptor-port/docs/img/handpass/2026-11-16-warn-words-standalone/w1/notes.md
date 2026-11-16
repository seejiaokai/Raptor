## Walker's notes (W1)

### Verdict corrections (script's own mistakes, per walk-scripts §7)
- Scenario 3, the two FAIL rows "typed landing 23:40" (both sizes): the FAIL is the script's, not the app's. Ranger has his own demo Monday flying (report 05:40, VL BFM / VL ACM), so a crew-rest breach stays even after the Sunday landing is typed. The words are right: with 23:40 typed the line reads "Sunday landed 23:40 + 2h debrief (assumed) → ended 01:40 → clear 13:40" — no "landing assumed" (the "(assumed)" there is the debrief, not the landing). Verdict for the typed reading: PASS for "no assumed landing"; the "breach gone" half is NOT WALKED (needs a man with no Monday flying).
- Scenario 3 also used a Monday item at 14:00 (not the brief's 13:30) so a typed landing could clear it; as above, the clean-person premise did not hold.
- Scenario 1, sign-offs: the "4 to sign" line is already on screen right after the first publish (it is the next amendment's sign-off), so it cannot tell "sign-offs dropped". What changes with the Logic change is the amber "Not yet signed" chip beside "1 pending" (absent after the publish, present after the change). Judged on that chip: PASS.
- Scenario 1 on the phone: the OIL Earn button was not reachable from the phone board by the desktop's route; that step is NOT WALKED at 402 (walked on desktop).

### Things the host should look at (leads with pictures, not filed)
- Scenario 8, "both ends changed" (A flight 90→2h and rally 3h→2h45): the pending line reads "full day · 09:00–15:30 → full day · 09:15–16:00" and then the sentence "Still a full day of OIL. It counts from 09:15, not 09:00." — the sentence names only the start; the end move (15:30 → 16:00) is only in the range line above it. Both differences are visible in the row, but the sentence is start-only. Picture: s8-d/8-c-pendinglist-d.png.
- Scenario 8 (d)/(f): with a typed in-time R 08:30 pending as well, the Ranger line still compares 09:00–15:30 with 09:15–16:00 (published under today's values); the typed 08:30 does not enter it (by the brief's reading this is the "published OIL under today's values" comparison, not the combined working amendment). Order of Logic change vs schedule edit gave the same Ranger/Logic lines (PASS).
- The Logic page's "A flight" row text, and several "Note:" rows, still say "Clashes" / "clashes" (e.g. "Clashes, the tight turn, the debrief, crew rest…"; "A row that flies has its clashes and turns checked…"). The brief says warnings read "Conflict:", never "Clash:". These are explanation texts, not warnings; recorded for the host's ruling. Picture: s11-d/11-3-edit-d.png.
- Scenario 13: the equal-times warning reads "Times look wrong: WAVE 1 T/O and landing are both 12:00. The day still earns OIL from the report and debrief." — its own path, no "assumed". The Friday week strip had no lines for it at the time read (list empty); the board and hover title carry it. The print command called window.print 0 times (my stub) yet the print text held both rows (EQ FLT 12:00 12:00; BLANK FLT 15:00, no landing); CSV: EQ FLT carries 12:00, BLANK FLT's landing cell is empty, no "assumed" word in either.

### Not walked (budget of about 75 minutes reached)
- Scenario 2 (the 👁 looks, day details from every page, saved plan preview): NOT WALKED.
- Scenario 6 (the SC with START 20:00 and END blank, Friday/Saturday, flying and not, END typed and cleared, AVALON control): NOT WALKED.
- Scenario 3: Monday's OIL / duplicate-credit part (Sunday not published): NOT WALKED; the "newly published Sunday/Monday reading": NOT WALKED.
- Scenario 11 phone/desktop: all steps walked; the Logic row's box heights recorded only (A flight 92 / A sim 75 at 1536; 126 / 91 at 402 — rows differ because their texts differ; the value boxes inside are both 24 high).
- Plain-user round: only partly — the Logic row changed and Reset (both sizes), the pending list opened and closed by Escape only (taps outside, Done not tried), Insights opened/closed by Escape, print. Windows below were not all closed every way.

### Windows opened and how each closed
- Pending list (the board's "1 pending" popover): closed by Escape (both sizes). Other ways not tried.
- Leave War day sheet ("bid-picker" window for Ranger's cell): closed by Escape / a press outside it.
- Insights: closed by Escape.
- Logic: Edit mode closed by Done.
- Scheduler board: closed by its Done button.

## Second round — walker's notes (W1)

### Script mistakes found and corrected (walk-scripts §7), so these are NOT app findings
- Scenario 6, first run (runs s6-d / s6-p): I built the "SC shift" as a duty-block row (Duties, "SC Shift" template, row SXO AM). D2055 governs the STANDALONE SC wave (the + Wave menu's SC: take-off box = START, landing box = END). The duty-block row with END blank still "ends" at START + 1h (Friday duty ended 21:00 → clear 09:00 on Saturday; the line comes and goes the same on END typed 23:00). Kept in the report as a different shape (see the lead below). The real D2055 shape was walked in runs s6b-d / s6b-p (PASS both sizes).
- Scenario 2, runs s2-d / s2b-d (and the phone twins): the "same look 7 seconds later" FAIL was my check reading a toast that stays in the page but invisible; the later picture (s2b-p/2-2pv-later-p.png) shows no toast and no red chip. The "saved plan" FAIL was my filter counting the green line "No conflicts flagged for this day ✓". Both fixed in run s2c (PASS). Use s2c only.
- Scenario 5, first runs (s5, s5b): pending list "did not open" (my finder looked for one text leaf but the line holds a nested chip), then the Escape/outside rows; s5c is the corrected run (opens the day's "1 pending" chip, the Changes window).

### Rows marked FAIL in the second round that are NOT app findings
- s3b-d / s3b-p, "tapped Ranger's Sunday puck; the forward Breaks Monday rows" (a RECORD row, shown FAIL because the trace came back empty): the person is Ace, not Ranger (label is a typo of mine), and the helper's tap on his Sunday puck returned no trace rows twice; I did not confirm by picture that the puck was pressed. Treat as NOT WALKED for the "assumed" wording in the Sunday trace. The typed-landing Sunday trace in the same run did come back (and round 1's trace rows carry the "landed 23:40 + 2h debrief" wording).
- s6-d / s6-p FAIL rows: the duty-block shape, see above (a lead, not the D2055 shape).

### Leads for the host (not filed)
- A duty-block shift row (SC Shift template under Duties) with START typed and END blank still counts as ended at START + 1h for crew rest. If D2055 is meant to cover it too, it does not (the standalone SC wave does). Pictures: s6-d/6-2noend-satweek-d.png, s6-d/6-2noend-fritrace-d.png (Friday trace reads "Breaks Saturday Ace — ... Friday duty ended 21:00 → clear 09:00").
- The Changes window opened by a day's "1 pending" chip (title "Changes · Saturday 18/7", tabs New to you / All changes / To go out): its ✕ closes it; Escape does NOT close it (still open, page unchanged); a press on the page outside it does not close it either (the board stays live under it — a floating window). Round 1's "1 pending ▾" menu in the sign-off row is a different control and did close on Escape. Pictures: s5c-d/5-pendinglist-after-Escape-d.png, s5c-p/5-pendinglist-after-Escape-p.png. Whether Escape should close it is the host's call (rows are FAIL on Escape only because the brief's expectation was "closes").
- OIL Earn on the phone: it is not in the board's top bar (that bar holds calendar, ‹ ›, highlighter, ⋯, Undo, Redo, History, sync, bell, ✓) — it is a button in the "This day" row, beside Templates, reached by scrolling to it; its aria-label is empty, found by its words "OIL Earn". Worked at 402 by tap (4 OIL items appear). The id #sbOil is the desktop bar's button; there it worked at 1536.
- The pending line with the standalone SC, flying with B typed: the Friday shift's own "flies but has no END" line did not show among the board lines filtered by the callsign Ace (the line may not name him); not looked at without the filter.
- Day details of Saturday were read while Plan A was the live day (tapping a saved plan in the menu makes it the live day: toast "Saturday is now "Plan A". Nothing is pending: it matches the Original."), so they read clean ("Nothing flagged — this day is clean ✓"); the details of the conflicted live copy were read in round 1 (scenario 1). I did not get back to the live copy before opening them.

### Windows closed every way (round 2, run s5c-d / s5c-p, both sizes)
- Day's "1 pending" chip window (Changes · Saturday): ✕ closes (page under unchanged); Escape does not; a press outside does not (RECORDED).
- Leave War day sheet (bid-picker): ✕ closes; Escape closes; a press outside closes (RECORDED); page under unchanged each time.
- Insights: ✕ closes; Escape closes; a press outside closes; page under unchanged each time.
- Logic: A flight 75 then the row's Reset: box 1h15 with the pending strip, then 1h and the strip gone (PASS both sizes).
- All browsers I started were closed by the script's end (each run's final step closes its browser).
