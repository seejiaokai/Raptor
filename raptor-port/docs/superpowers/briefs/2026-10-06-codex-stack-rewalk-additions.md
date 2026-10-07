# The re-walk's added scenarios (R-…) — the Codex stack — the host, 6 Oct 26

Written by the host from the roll-call, as assertions of the RIGHT behaviour. Each: SETUP · ACTION · EXPECTED ·
DISPROVES. Desktop 1440×900 unless it says phone (390×844). Every fixture through the app's own controls.

**R-01 — A week nobody has touched stays unsaved; an answer on it survives.**
SETUP: a fresh world, sign in as admin, change NOTHING. ACTION: (a) read what the browser's storage holds for the two
weeks (`localStorage` keys beginning `raptor:weeks/` — `dbrA-lib.mjs rows`), reload, sign in, read again. (b) Logic →
Edit rules → "Track Blue/Red sorties" On. Edit Schedule, Tuesday 14 Jul, the wave whose RU line's Remarks reads
`RED AIR`: click into that Remarks, press "Choose mission role" → Red. Open Insights, note that line's crew's bars.
Reload, sign in; read the bars and whether the button under that Remarks says Choose or Change. (c) Go to the week of
20 Jul and back; read again. (d) Read the stored week rows again.
EXPECTED: (a) no day row of either week is stored by merely opening and reloading the app; (b) and (c) the bars stay
split and the button reads "Change mission role" after the reload and after the week switch (D530 — the answer is
saved); (d) Tuesday's own day row is still not stored (an answer writes no day). DISPROVES: a day row written with no
edit; the answer gone, or "Choose", after a reload or a week switch.

**R-03 — A save that opens a window: where do the keys go?**
SETUP: Inputs page → file a request of type Duty for Ranger on Sat 18 Jul, 08:00–12:00 (answer its OIL question as you
like). Edit Schedule → Saturday → open its Personal Inputs so the request's own time boxes show.
ACTION: (a) click into the request's START box, type 0900, press Tab. Note what opens, and where the caret is
(`document.activeElement`, and whether it is inside the window). Type `XYZ`, press Tab twice. Read the request's
times, and whether any other box on the schedule changed or any "is not a time" message appeared. Close the window
with its ✕. (b) the same on the Scheduler Board for Saturday. (c) On the week again: change the START box and CLICK on
empty page instead of Tab; with the window open type `XYZ`; close it.
EXPECTED: the request's time is saved once; the OIL question opens; while it is open nothing typed reaches any
schedule box behind it, no toast about a time appears, and Tab moves among the window's own buttons; after closing,
the schedule is exactly as it was apart from the one time. DISPROVES: characters or Tabs landing in a box behind the
window; a second change saved; an error message.

**R-04 — The day keeps up while he tabs.**
SETUP: Edit Schedule, Monday 13 Jul, the day's issues list OPEN (tap its bar). Note the bar's words and the list.
ACTION: (a) click into the first wave's first In-time / Rally line, replace it with `<that formation's take-off>H:
<its callsign> IN TIME` (an in-time later than its brief), press Tab ONCE. WITHOUT pressing anything else: read the
bar and the list; read which box has the caret and its position on screen (its `getBoundingClientRect().top` before
the Tab landed there is not known — so instead: note the caret box's top, then press Tab through three more boxes
changing nothing, and confirm the list does not change again and the page does not jump: each next box is reached
without the previous box's top moving by more than 2px). Type `Q` in the box that has the caret and read it back.
(b) Press Escape; Undo from the top bar; read the bar and the list. (c) The same on the Scheduler Board for Monday
(its list is the panel beside / above the schedule). (d) Phone, the week: the same as (a). (e) A PUBLISHED day: sign
and publish Tuesday; click into a flying line's Remarks, type a word, Tab once; without leaving the text boxes read the
day's heading (its "N pending" count, "Not yet signed") and the sign-off strip.
EXPECTED: straight after the one Tab — the caret in the next box — the list names the new red line ("… in-time … is
later than … brief …") and the bar counts it; the typed `Q` is in the box that has the caret; (b) after Undo the bar
and list are as at the start; (c) and (d) the same; (e) the heading reads "1 pending" and "Not yet signed", the four
sign-offs empty, while the caret is still in a text box. DISPROVES: the list or the heading unchanged until the caret
leaves the text boxes; the caret lost, or the typed letter missing; the page jumping under him.

**R-11 — How a reporting line's clock is read.**
SETUP: Scheduler Board, Wednesday 15 Jul, a wave with two formations VL and RU, both with take-offs.
ACTION, one line at a time in that wave's In-time / Rally box, reading the wave header, the red/amber line under the
box, the day's issues list and Insights' Work hours for VL's crew after each: (a) `08:00H: IN TIME + WX/NOTAMS` and a
second line `08:30H: VL RALLY AFTER IN TIME`; then the two lines in the other order. (b) replace with one line
`8h00 VL IN TIME`; then `8.00 IN TIME`; then `0800IN TIME + WX/NOTAMS`. (c) replace with `IN TIME BLDG 12`; then
`RALLY AT FL240`. (d) "+ Wave", leave its first line with no take-off, press "+ In-time / Rally", type `0800 ` in front
of the words; read the new wave's header and whether Available crew shows a band for it; put a pilot on that line and
open Insights → Work hours.
EXPECTED: (a) VL's day starts 08:00 in either order (its work hours the same as RU's start; the header reads the
earliest, 08:00). (b) each is kept as typed and the day says, in the line under the box and in the issues list,
"… reporting line 1 has no recognised clock. Check the time." (c) no such message — those digits are not a clock.
(d) the header reads the line's time (08:00), the wave has its band, and no figure anywhere reads "NaN".
DISPROVES: VL starting 08:30; an unreadable clock accepted silently; a message about `BLDG 12` or `FL240`; a header
reading "—" beside a typed clock; "NaN".
