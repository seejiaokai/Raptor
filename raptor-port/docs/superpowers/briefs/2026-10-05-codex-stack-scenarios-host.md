# The host's notes on Astra's list, and the host's own scenarios — the Codex stack check — 5 Oct 26

Read after `2026-10-05-codex-stack-scenarios-astra.md`. The same for every walker.

## Notes on Astra's list — where a scenario is RECORDED, not judged

Three of Astra's scenarios test a promise the host's brief worded wrongly, and Astra said so. Walk each exactly as
written, report every figure the screen shows at every step — and mark it **RECORDED**, not PASS or FAIL. The host
judges them against the rulings.

- **P2-02 and P2-03 (an entered in-time or Rally and a weekend's earned leave).** Report, before the edit, after it, and
  after the amendment: the In-time / Rally line as shown; the person's figure on Insights' "Work hours" bar; and what the
  Leave War shows for that person on that day (the cell's letters — HO or FO — and the OIL tracker's line for him).
  *(The rulings: an entered clock starts the crew's day for the warnings and for work hours — D498; whether it moves
  earned leave was left as it was — the same D498, "no … changing earned-leave rules".)*
- **P2-08 (the "+ In-time / Rally" button on a wave that already has a reporting line).** Report the exact text each
  press fills in, and the Logic page's "nominal report before T/O" value at that moment.

Everything else on her list is judged as she wrote it. P2-01 (a published weekend's earned leave after a Logic value is
changed) is judged: report HO / FO at every step, with the picture of the Leave War cell and of the OIL tracker.

## The host's own scenarios

**H-01 — The fault this piece was built to fix: no negative work hours.**
Surface/ruling: the Scheduler Board, Insights, the day's warning list; `[WORKSPAN-NEGATIVE]`, D503, D509.
**SETUP:** A fresh world, nothing published. Open Monday on the Scheduler Board; find a wave whose reporting line carries
an evening clock (the demo's later wave) and note the line and the crew of one of its formations. **ACTION:** Change that
formation's take-off and landing to 10:00 and 11:25, leaving the wave's reporting line as it is. Open Insights.
**EXPECTED:** No person's Work-hours figure is negative and no bar runs full width for a short day; Monday's warning
list says something about that formation's reporting time (a red line), or the reporting line now reads as the previous
day. **DISPROVES:** a figure such as "-2h-30", a full-width bar, or a day that says nothing at all.

**H-02 — The Blue/Red answer draws no mark on the schedule.**
Surface/ruling: Edit Schedule's week, the Scheduler Board, View-only Sched, print; D519.
**SETUP:** Tracking on; one formation answered Red, one answered Blue, one unanswered. **ACTION:** Look at the three
formations' lines on each surface, and at the printed sheet's preview. **EXPECTED:** No red or blue indicator on any
line, puck or tag — the answer shows only in Insights and (while its Remarks box is being edited) as the Change button.
**DISPROVES:** any coloured mark, tag or outline that follows the answer.

**H-03 — A member never meets the question.**
Surface/ruling: Inputs, View-only Sched, Insights; D529, the roles table (a member reads the answer, never writes it).
**SETUP:** As admin: tracking on, one formation left unanswered with "DS for RU" in its Remarks, one answered Red. Sign
out; sign in as the member. **ACTION:** File a timed request on that day from the Inputs page; open View-only Sched;
open Insights from every door the member has (desktop and phone). **EXPECTED:** No question, no Choose / Change button
anywhere; Insights shows the same bars the admin sees. **DISPROVES:** a question or a role button offered to the member,
or bars that differ from the admin's.

**H-04 — Tab through a published weekend changes nothing, earned leave included.**
Surface/ruling: Edit Schedule's week and the Scheduler Board; the Leave War; D103, D45, D142.
**SETUP:** Put two people on Saturday's duty rows with times, add one flying line with take-off 12:00 and landing 13:00
and a crew, sign the four names and publish. Note, for each of those people, the Leave War's cell for that Saturday and
the day's bar ("0 pending", the sign-off line). **ACTION:** On the week, click into Saturday's first open text box and
press Tab until focus leaves the day, typing nothing; do the same on the Scheduler Board; then Shift+Tab all the way
back. **EXPECTED:** "0 pending" throughout, the four sign-offs still shown, no line in the changes window, no amendment
mark on any box, and every Leave War cell as noted. **DISPROVES:** any of them moving.

**H-05 — The button on a wave that flies just after midnight.**
Surface/ruling: both "+ In-time / Rally" buttons; D510, D503.
**SETUP:** A new wave on Tuesday with one formation, take-off 01:30, landing 02:30, a crew; Logic's nominal report at
180 minutes. **ACTION:** Press "+ In-time / Rally" on the week; read the line, the wave's header on the board, the day's
warning list and that crew's Work-hours figure. **EXPECTED:** The line reads 22:30 and every place that prints it says
it is the previous day; the work figure is about 4 hours plus the debrief, never negative and never about 28 hours.
**DISPROVES:** a clock with no day beside it, a negative figure, or a day-long span.

**H-06 — Words typed on Logic are drawn as words.**
Surface/ruling: Logic, both editors, View-only Sched, print; D511.
**SETUP:** On Logic set the button's words to `<b>BOLD</b> & "QUOTES" <img src=x onerror=alert(1)>`. **ACTION:** Press
"+ In-time / Rally" on a new wave; look at the line on the week, the board, View-only Sched, the changes window and the
print preview; reload. **EXPECTED:** Exactly those characters shown as text everywhere, nothing bold, no broken layout,
no dialog, no console error; the same after the reload. **DISPROVES:** any markup taking effect, or the setting lost.

**H-07 — A Logic change is one undo step and survives a reload.**
Surface/ruling: Logic and the top bar's Undo / Redo; D510, D511, D524.
**SETUP:** Note the nominal report value, the button's words and the tracking switch. **ACTION:** Change each in turn;
after each press Undo, then Redo; then reload and sign in again. **EXPECTED:** Each Undo puts back exactly that one
value and the bar says what it undid; Redo restores it; after the reload the three changed values are still there.
**DISPROVES:** Undo taking back more than one change, a value lost on reload, or the switch not undoable when the other
two are (report which).

**H-08 — The new timing warning can be hidden like any other.**
Surface/ruling: the day's warning list on Edit Schedule and the board; D469, D471, D472, D509.
**SETUP:** An unpublished day with one Rally-after-brief warning. **ACTION:** Tap ✕ on that line; reload; tap ↺. Then
publish the day with the warning showing, tap ✕, and read the day's bar. **EXPECTED:** Hidden: the line struck out and
not counted, still hidden after the reload, back with ↺. On the published day the hide reads as one pending change and
the published face keeps the warning until the amendment goes out. **DISPROVES:** no ✕ on the new kind of line, a hide
that does not survive the reload, or a published face that changes at once.
