# The night of 18 Oct 26 — pictures drawn before he slept (his word: "U can do the pictures now I'll answer them and u fold it into the overnight tasks")

Four helpers drew on the running app (this branch's build, served locally); each report is saved here as it arrived,
before anything was done about it. Scripts beside the pictures, in `raptor-port/scripts/handpass/`.

## 1. The Leave War top up to 700 wide (D1000) — `mock-lw-top-700.mjs`, `docs/img/handpass/2026-10-18-lw-top-700/`

Helper's report, as returned:

- Pictures (all opened and checked by the helper): `1-390-today.png` (an ordinary iPhone today, already the two-line top —
  real); `2-440-today.png` (the biggest iPhone today: "Period" line, then Stage over three lines — real);
  `3-440-proposed.png` (the phone's two-line top — drawn in with the app's own phone words and layout);
  `4-600-today.png` (Stage over two lines — real); `5-600-proposed.png` (drawn in the same way).
- Where the first roster row starts (px from the top): 390 — 428 (already two lines); 440 — 564 today, 469 proposed
  (95px gained, 3 more rows: 17 to 20); 600 — 494 today, 434 proposed (60px, 2 more rows: 20 to 22). The top shrinks
  from 171px (440) and 136px (600) to 76px, as on the phone.
- How "proposed" was made: the phone question answered "yes" up to 700 wide, and 23 rules copied from the phone's top
  layout in the built stylesheet; two left out because they change the grid card, not the top (its outer padding and the
  short button words "Rearrange", "OIL tracker").
- Not named by the ruling: the same "is this a phone?" switch also changes, up to 700 wide, the Required panel's shorter
  heading and the admin's "clashes with the schedule" note (its phone design; the demo has no clash, not drawn); the
  stage's two moves go behind the stage button, as on a phone.
- At 600 proposed: nothing runs off sideways, no words cut, the grid's columns the same widths as today.
- Its questions: (1) at 600 each line has a wide empty gap in the middle ("+" far from "Viewing as", "Under 0 days" far
  from "Legend") — acceptable? Recommended yes. (2) The top's controls start 10px from the screen edge, the grid card at
  20px — keep the 20px edge at 431–700 so the two line up? Recommended yes.
- Side observation, outside the ruling: at 440 the grid card's own button row breaks onto two lines ("−" and "+" fall to
  a second line, about 40px more).

## 2. The Tracker's down days (D1002-D1005) — `mock-trk-down-days.mjs`, `docs/img/handpass/2026-10-18-trk-down-days/`

Helper's report, as returned (condensed only where it repeated itself):

- Demo man: no Tracker student is a man on the roster, so the script adds Zenith with the real "+ Add"; he has the seed's
  ATT B 15-19 Jun and its upchit; in the throwaway browser only, four more inputs were filed for him (HL, a half-day OML,
  an ATT C cut by an upchit, an ATT B still running). Course start 1 Jun 2026; his total 14 1/2 days.
- Pictures: `1-today-desktop/phone` (real: the typed "12", the Upchit Date box, "Days since currency 10d (-12 down = 0d)"
  ringed); `2-proposed-desktop/phone` (drawn in: "Course start" in the Upchit box's place, cloned from the Last Flown
  (Syllabus) date box; "No. of Down Days" reads "14 1/2 days", cloned from the Last Flown (Currency) box with its arrow
  changed to a chevron; "Days since currency" 10d with nothing taken off; "(minus down days)" gone; no height added);
  `3r-real-failures-window-*` (the real Failures window, for comparison); `3-window-desktop/phone` (drawn in: the
  down-days window, cloned from the Failures window — one row per input: kind, dates, days, "1/2 day", a cut row "cut by an
  upchit on 23 Sep · filed to 25 Sep" struck, "still running · counted to today"; one style change: the third column sized
  to fit); `3b-window-wide-letters-phone` (letters a seventh wider: the middle text wraps, days and dates stay whole);
  `4-no-course-start-phone` (drawn in: "Pick a date", the number "—", "Set the course start to count them." — one line
  more); `5-add-box-desktop/phone` (drawn in: a "Course start" date box at the top of "+ Add", today by default — above
  the list because a tap on a name adds him at once).
- Open points, recommended: (a) course start set in "+ Add" (default today), changed in the Info panel, no clear cross;
  (b) the window only shows, the Inputs page edits; (c) before a course start: "—" and a one-line prompt; (d) an input
  still running counts to today.
- Not named by the note: how far an input ran before an upchit cut it is not stored (the cut overwrites the end date —
  the old end only in the change history; D999's build keeps the first end, which this can read); "+ Add" needs a date
  field above the list; course start is a new per-student record (export/import file, store, data-schema, data-model);
  the window needs a new reader from the Tracker into the Inputs — a fourth crossing, where the Tracker's architecture
  says three; the empty-state prompt and the window's footer are new words, a fresh read before they go in.

## 3. The Tracker's flex settings and legend (D1006, D1007, D1014) — `mock-trk-flex-legend.mjs`, `docs/img/handpass/2026-10-18-trk-flex-legend/` (with `facts.json`)

Helper's report, as returned (condensed only where it repeated itself):

- 20 pictures, each a desktop and a phone copy, all looked at; red rings mark what is new, a caption on each says real or
  drawn in. Student A's two "Last Flown" dates picked through the app's own date boxes, so the bars show real colours
  (flex red, 15 days; currency green, 3 days).
- `01-topbar-today` (real); `02-topbar-proposed` + `02b` (phone, letters a seventh wider): the settings cog and "Legend"
  drawn in — the cog a copy of the Tracker's own icon button wearing the Inputs page's cog, "Legend" a copy of "Show All";
  the phone bar stays two rows, the desktop one row; `03-flex-settings-admin` (a copy of the Inputs calendar's settings
  window, the Logic page's on/off switch, the Info panel's real flex bars, Cancel / Save); `04-flex-settings-member` (the
  same, read-only, no Save); `05-info-today` (real, rings on what goes) and `06-info-flex-off` (heading "Currency", the
  flex bar and "Days since syllabus" gone, and on desktop the flex sentence too); `07-legend`, `07b-legend-end`,
  `08-legend-flex-off` (a copy of the Leave War's Legend pop-out; its balls copies of real chart balls).
- Open points, recommended: (a) only the six "From" days (7, 14, 21, 31, 60, 120) editable — each "To" follows from the
  next row, each band's words fixed; (b) a member sees the read-only window (the alternative, no cog, looks like picture
  1); (c) "Legend" beside Show All — the desktop's colour strip under the bar moves into the pop-out, so the phone gets a
  legend too (none today); (d) the legend's words as drawn in 07 and 08.
- Not named by the note: the desktop colour strip moves into the pop-out; the Tracker has no other flex windows or words —
  flex lives only in the Info panel's card; "Days since syllabus" only feeds flex, so it is hidden when flex is off (the
  helper's reading, not his ruling); with flex off the currency bar takes the full width on desktop; the note under the
  bars still says "(minus down days)" (D1004 removes it separately); today's phone bar is already two rows by his own
  request; the legend leaves out the ball's optional corner number; a switched-off settings window (bands kept and
  dimmed?) was not drawn.

### 1b. One more Leave War picture, asked for by the host — `6-440-proposed-short-words.png`

Helper's report: the grid card's buttons read "⇅" and "OIL" (the phone's short-words rule, up to 700; the card's outer
padding still left out), so "−" and "+" stay on the first line. At 440 the first roster row starts at 434px — today 564
(17 rows), the two-line top alone 469 (20 rows), with the short words 434 (22 rows, 5 more than today). Grid columns
unchanged. **Not covered by his approval** (D1000 says "the grid unchanged", and this changes the grid card) — put to him
in the morning with this picture; not built tonight.

## 4. The crew-rest ring on every copy (D1013) — `mock-rest-ring-copies.mjs`, `docs/img/handpass/2026-10-18-rest-ring-copies/`

Helper's report, as returned (condensed only where it repeated itself):

- The case, set up through the board's own buttons: Scribe, Monday 20:00-22:30 and Tuesday brief 05:00 (Monday causes the
  breach — his seat dotted); Otter, Tuesday with LATE SHOW typed (his seat dashed); each also given a SANS card, a
  part-day LL and a Personal input on his day; the rest of the demo stays in the frames (another man's dotted ring,
  several solid red and amber rings).
- Real: (a) and (c); drawn in: (b) and both (d)s — the seat's own ring and chip moved onto the copies, plus two small
  style rules for the open list. `dk-01/02` and `dk-03/04`: the board at 1440x900, list shut, today / proposed (Scribe on
  Monday, Otter on Tuesday), red boxes round the rows; `dk-05-07` (Scribe) and `dk-08-10` (Otter): Edit Schedule with the
  day's list open — today, option A, option B (the seat only; the copies with the list open are in `dk2x-02` and
  `dk2x-04`); `dk2x-01` to `04`: 2x close-ups of every copy side by side (the 1x frames cannot show a 1.5px dotted ring);
  `ph-01-10`: the same on a phone, 390x844 at 3x.
- Reached: the seat, the Ground row, the Personal Inputs row, the SANS card, the Unavailable row and the board's crew
  list. Not drawn: Edit Schedule's crew column with the list open — the list never lights crew-list pucks.
- Classes reused: `boxdot`, `boxdash`, `boxred`, the seat's own `warn` / `hard` / `note` and `.lchip`; no new style for
  the copies.
- The open list's light (`.puck.wfoc`) is an outline, as the dotted and dashed rings are, so it replaces them. **Option A
  (recommended):** a lit puck wearing a dotted or dashed ring keeps it; it still stands out because everything the list
  does not name dims, as today — no new look, two style rules. **Option B:** a new solid ring 4px outside the rest ring in
  the light's colour — a new look, reaching 6px, past the 3px gap between two crew pucks.
- Its questions, recommended answers: (1) on Monday the crew list shows Scribe with an "L" (leave) chip and no ring —
  should copies wear the seat's chip as well as its ring ("R" there)? Yes: one puck, one mark. (2) The faded Personal
  Inputs row (already on the programme) still wears the ring? Yes, as drawn. (3) Today a copy draws only its own day's
  issues; building this means every copy reads the same four marks as the seat, so the R chip and dotted ring follow
  everywhere — wanted? Yes.

## His answer (18 Oct 26, before he slept)

*"Nvm I approve the mock ups as recommended. Do the recommended jobs and allow the chat to auto compact at 97% and
continue working I'm sleeping"* — given before the page of pictures reached him. Recorded as **D1016** (the Leave War top,
section 1 — not 1b), **D1017** (the crew-rest ring on every copy, section 4, option A) and **D1018** (the Tracker's down
days, flex settings and legend, sections 2 and 3).

## The fresh read of design lesson 6's widening and of D1016–D1018 (18 Oct 26, night — one fresh Opus reader)

Report, as returned: (A) lesson 6 — the older sentences of the lesson ("narrows D537 … for that window only", "other
places … not changed: '+ Input' … Insights") still stood unmarked and said the opposite of the widening; fix: mark them as
overtaken by D996–D997; also name the day panels as D997 does ("the day panels pulled up and down by their bar (the Inputs
and SANS calendars' day)" — "the calendars' day panels" could take in the Calendar window, which moves to the middle), and
say the Leave War's own sheets are not read into it (D997's reading 2). D1016: OK (it does not claim section 1b's short
words). D1017: OK. D1018: the short line OK; its full row's reading (3) rewrote the legend's words where he approved them
"as drawn" — fix: "the legend's words as drawn; any change to them is put to him first". **All three fixes made the same
night** (`raptor-port/docs/design-practices.md` §9 lesson 6; D1018's full row).
