# The second wave — sixteen scenarios from the readers' leads — the Codex stack check — 5 Oct 26

Read after the walk brief. Four readers read the code and each named places where the app MAY do the wrong thing. None
of it is proven. You walk each one in the running app and report exactly what the screen did, with pictures — the host
decides what it means. Where a scenario says **RECORD**, report the facts and give no verdict; elsewhere judge PASS /
FAIL against the EXPECTED line.

**L-01 — A published weekend's earned leave, and three Logic values.**
SETUP: Fresh world. On Saturday 18 Jul put one named person on a flying line, take-off 10:00, landing 11:15; sign the
four names and publish. Leave War → that person's Saturday cell and the OIL tracker's line for him: note the letters (FO
or HO) and the hours shown. ACTION: On Logic → Edit rules change "Nominal report before T/O" from 3h to 2h30; read the
cell and the tracker again; read Saturday's bar (pending count, sign-off line). Put the value back. Then the same with
"Flight debrief after land" (shorten it by 30 minutes), and with the full-day OIL threshold (raise it by 30 minutes).
EXPECTED (D48, D142): the published Saturday keeps the earned leave it went out with after each change; nothing about
the day changes without an amendment. DISPROVES: FO becomes HO (or the reverse) with "0 pending" and the sign-offs
standing. Report the letters and hours at every step.

**L-02 — New words for the button, and the "RULES MODIFIED" stamp.**
SETUP: Fresh world; look at View-only Sched's and Edit Schedule's week banner and at the Logic page: note whether any
"rules modified" stamp or strip shows. ACTION: Logic → Edit rules → "Words the + In-time / Rally button fills in" →
`RALLY` → Done. Look at both banners again (desktop and phone) and at the Logic page's strip; then sign in as the member
and look. EXPECTED: no stamp and no "N rule changed … the schedule is being checked against these values" strip — no
rule was changed, only the button's words. DISPROVES: the stamp or the strip showing. Then change a NUMBER rule (the
brief lead) and confirm the stamp DOES show; reset.

**L-03 — "RALLY AFTER IN TIME" with a clock, on one formation's line.**
SETUP: A wave with two formations VL and RU, both take-off 11:00, landing 12:00, crews on both. Reporting lines, exactly:
`08:00H: IN TIME + WX/NOTAMS` and `08:30H: VL RALLY AFTER IN TIME`. ACTION: Open Insights; read the Work-hours figure of
a VL crew member and of an RU crew member; read the wave's header on the board. Swap the two lines' order and read again.
EXPECTED (D505 — a formation's Rally does not cancel the whole wave's in-time): both crews' day starts 08:00, so the two
figures are equal. DISPROVES: VL's figure 30 minutes shorter than RU's.

**L-04 — A reporting line on a wave with no take-off yet. RECORD.**
On the Scheduler Board: + Wave (its first line is blank) → "+ In-time / Rally" → type `0800` at the front of the new line
and leave the box. Report: the wave header's "In-time / Rally" text, whether the wave has a band in the Available-crew
panel, the day's warning list, and — after putting a person on the line — that person's Work-hours figure. Then type a
take-off 11:00 / landing 12:00 and report the same four things.

**L-05 — The name of the lines in four places. RECORD the exact words.**
Publish a day; change one of its reporting lines; delete another with its ✕. Report the exact words used for these
lines in: the changes window (both tabs, both groupings — the group heading and the line), the bubble on the gold dot
in History mode, the day's pending list, the toast after ✕, and the top bar's Undo tooltip or message.

**L-06 — How a Blue/Red answer is listed in the changes window. RECORD the exact words.**
Tracking on. On an unpublished day type `DS FOR VL` in a formation's Remarks, press Red; later change it to Blue. Open
the changes window: report the exact group heading and line for each of the two changes, under "Group by: Item" and
"Group by: Who". Do the same after applying a day template that carries an answered formation, and after one Undo.
EXPECTED: a heading that names the formation as the schedule does. DISPROVES: a heading with a code no person typed, or
one filed under another page's name.

**L-07 — An answer on a day nobody has touched, across a reload.**
SETUP: Fresh world, NOTHING edited. Logic → tracking on. Edit Schedule, Tuesday 14 Jul, the wave whose RU line's Remarks
reads `RED AIR`: click into that Remarks box, press "Choose mission role" → Red. Open Insights: note the bars of that
line's crew. ACTION: (a) reload and sign in again; read the same bars and whether the button under that Remarks now says
Choose or Change. (b) In a second fresh world do the same, but first change any other text box on Tuesday (so the day
has been saved once), then answer, then reload. (c) In a third, answer, go to the next week and back. EXPECTED (D530):
the answer is still there in all three. DISPROVES: the bars back to one plain bar and the button back to "Choose".

**L-08 — A second line while one question is open.**
Tracking on. On Edit Schedule's week type `DS FOR VL` in line A's Remarks and leave the box: A's question appears; do not
answer. Click into the Remarks of another formation B on the same day whose Mission or Remarks also needs an answer.
EXPECTED (D527, D529): a "Choose mission role" (or "Change") button shows under B while its box is edited; A's question
stays. Repeat on the Scheduler Board, and on the phone's week (390 wide): there, with A's question open, swipe to the
next day and click into a Remarks box that needs an answer. DISPROVES: no button under B at all.

**L-09 — Four confirmation windows and a drag that ends outside.**
Open each of: the "OIL — <name>" question (Inputs → file a duty on a weekend); the upchit confirmation; the "covers
other days" confirmation for a medical that overlaps another status; the "no document" question for a medical with no
file. In each: press on text INSIDE the window, drag past its edge, release on the dark surround. EXPECTED (D538): the
window stays open. Then a plain click on the surround — report what that does in each. DISPROVES: the drag closes it.

**L-10 — A box that still shows the old copy, entered by a CLICK.**
(a) Edit Schedule, desktop: a formation whose Area time shows a window worked out from its times (for example
`1240-1405`). Type a new take-off 15 minutes later, then click straight into that formation's Area time box, then click
on empty page. EXPECTED: the window follows the new take-off and nothing is stored as typed (no new line in the changes
window for the area time). (b) A leave or request shown on two days: change its remark on the first day's row, click
straight into the same remark on the second day's row, click away. EXPECTED: the new remark stays on both. (c) A
request accepted to Ground and also listed in Personal Inputs: change its remark in Personal Inputs, click into the
Ground row's Remarks, click away. EXPECTED: the new remark stays. DISPROVES: the old words coming back, or an extra
change recorded. Do (a) on a PUBLISHED day too and report the pending count.

**L-11 — A remark with a double space, and Tab.**
Inputs → file a personal request with the remark `Dental review.  Back by 1400` (two spaces after the full stop).
Accept it to Ground on its day; sign and publish the day. On Edit Schedule click into the day's first text box and Tab
through the whole day typing nothing. EXPECTED (D103): "0 pending", the four sign-offs standing, no new line in the
changes window. DISPROVES: "1 pending", sign-offs gone, or a change line whose before and after look the same.

**L-12 — Where the last Tab lands. RECORD.**
(a) Edit Schedule's week, Monday, nothing changed: Tab from the last open text box. Report what has the focus afterwards
(its words and kind, or "nothing — the page body") and whether another Tab then moves on. (b) Change one box earlier in
the day, then Tab to the end: report the same, and again half a second later. (c) The same two on the Scheduler Board.
(d) Shift+Tab from the day's first box: what has the focus.

**L-13 — What the day shows while he is still tabbing. RECORD.**
On an unpublished day type a take-off that puts one person in two places at once, press Tab (do not click). Report,
before leaving the text boxes: the day's issue count and warning list, the ring on that person's puck. Then press Escape
or click away and report them again. The same on a PUBLISHED day: the "N pending" chip and the sign-off line, during
the run and after it.

**L-14 — A save that opens a window, then more Tabs.**
A duty-type request filed on Saturday (a day that can earn). On Edit Schedule, in Personal Inputs, change its start time
and press Tab. Report: whether a window with the OIL question opens; where the caret is (inside the window, or in a box
behind it); then type `X` and press Tab twice more and report what changed behind the window. EXPECTED: with a window
open, typing does not go into the schedule behind it.

**L-15 — Tab into a wrapped box. RECORD.**
Give a flying line a Remarks long enough to wrap onto two lines on the week, and a callsign long enough to wrap. At
1440 and at 390 wide, with the box in plain view, Tab into each from the box before it. Report the page's and the week's
scroll position before and after each Tab (numbers), and whether the view jumped.

**L-16 — The warning band on the phone board's Desktop layout.**
Phone 390×844: Edit Schedule → open a day on the Scheduler Board → ⋯ More → Desktop layout. Force a failed save (the
recipe in `sn-cover.mjs`). Report where "Not saved — keep this page open" and its Retry button sit: each one's left and
right edge in pixels against the 390-wide screen, without scrolling; then whether Retry can be reached by panning, and
whether pressing it there works. EXPECTED (D587): the warning WITH Retry visible under the board's bar.
