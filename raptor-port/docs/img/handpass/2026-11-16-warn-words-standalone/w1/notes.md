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
