# Two small designs: the year on the Leave War grid, and a month-and-year jump on the calendars (2 Nov 26)

His two asks of 1 Nov 26: **[LW-YEAR-CLEAR]** (D1559 — "can see if u can design something more intuitive for the year")
and **[CAL-MONTH-YEAR-JUMP]** (D1560 — a tap on "JUL 2027" on the Inputs and SANS calendars opens the month-and-year box,
"for faster navigation"). Design only; nothing in the app is changed. Every picture is the real app (a local build of
`main` at `bb6932e8c`, demo data), at his iPhone's size (402 × 874, WebKit) and a desktop's (1536 wide), with the new
parts laid on by script and outlined in dashed yellow. Pictures: `../../img/mock/2026-11-02-year/` (the composed pages
`lw-*.png` and `cal-*.png`; each single frame under `raw/`); the scripts that drew them sit beside them (`lw-year.mjs`,
`cal-jump.mjs`, `lib.mjs`) and redraw the whole set.

The design guide's rulings were followed: each new part is drawn the way the app already draws that kind of part (D1496),
nothing gets taller (§3), buttons keep their size (D487), each picture is cut to the area asked about (D1222).

## 1. The year on the Leave War grid — [LW-YEAR-CLEAR]

**What is true today (checked on the running app).** In the 2027 period, with the grid on 17–30 July, the month buttons
read JAN … DEC and the dates SAT 17 … FRI 30; the year is only in the View picker ("JAN - DEC 27") above the grid. Once
the page is scrolled down — as in his picture — the month buttons scroll away too (phone and desktop): the only thing left
pinned is the row of dates and its corner over the names ("CS/Name", "+LVE"). In the middle of a month that row names no
month either. (`lw-1-today.png`)

**The place.** The corner over the names is the one spot that stays in view whichever way the grid is scrolled, and it
sits at the start of the row of dates his eye is on. Both options put the year there, on a line above "CS/Name", in a
cell that already has room for two lines (the dates beside it have two) — no height is added.

- **A — the year alone, "2027", bright (recommended).** In the date numbers' white, bold. It answers exactly what went
  wrong, reads at a glance on a phone, and leaves room to spare (26 of the corner's 61 points on the phone), so Apple's
  slightly wider letters on his iPhone still fit. The month stays where it is today: the lit month button at the top,
  and the month's name on each month's first date.
- **B — the month and the year, "JUL 2027".** In the small cyan month label the first date of each month already wears.
  It also names the month when the page is scrolled down mid-month, but it is small and faint beside A (18 points to
  spare on the phone).

Both name the **first date in view** — the left edge of the dates — not the month the strip lights (on a desktop the
strip lights August while the screen starts at 17 July). (`lw-2-phone-options.png`, `lw-3-phone-top.png`,
`lw-4-desktop.png`)

**A period across two years.** Periods can run across a new year (one made with "+ New period", JUL 28 – JUN 29). Today
the month buttons then carry a two-digit year ("JAN 29") — but only while the page is at the top, and **on the iPhone
that strip runs past the right edge: MAY 29 and JUN 29 are out of view** (whether it can be swiped was not checked). With
A, the corner reads 2028 while the first date in view is in December and turns to 2029 once 1 January reaches the left
edge. Writing the year on 1 January's own heading was tried and dropped: on a phone it runs over 2 January's heading.
(`lw-5-two-years.png`) "2027" is written in full, not "27": in a grid of dates, "JUL 27" reads as the 27th of July
(his lesson 13 asks for two-digit years on dates; this is a year on its own, the agent's reading).

## 2. A month-and-year jump on the Inputs and SANS calendars — [CAL-MONTH-YEAR-JUMP]

**What is true today.** The title "JUL 2027" is plain words: a tap on it does nothing (the script tapped it — no window,
no change). Edit Schedule's "Jump to a date" window has the app's month-and-year wheels: its title "July 2026 ›" opens
them, and turns cyan with a ▾ while they are out. (`cal-3-real-and-sans.png`, left)

**How the title says it can be tapped (both options).** The title gains the small cyan ▾ the app's calendar title wears —
"JUL 2027 ▾" — on the Inputs and the SANS calendar alike, and its words turn cyan while the wheels are out, as that title
does. Not a › (it would sit beside the › of "next month"). The ‹ › arrows and Today keep their places (measured: they do
not move). On the phone the ▾ fits the title's fixed room with 3 points to spare in the test browser; on his iPhone the
build measures it, and if a long month does not fit, the room grows by a few points into the gap before the
Calendar / List switch. (`cal-1-phone.png`, second picture; `cal-3-real-and-sans.png`, right)

- **A — the app's floating calendar, opened straight on its wheels (recommended).** The same card the app floats over a
  date box: in the middle of the screen on a phone, just under the title on a desktop, showing the month-and-year wheels
  (a copy of Jump to a date's own, turned to July 2027) and its Today icon. **On a pick:** the calendar turns to the
  month as soon as the wheels stop (the title above changes with it); a tap outside, Escape, Enter or a second tap on the
  title closes the card; Today jumps to this month and closes it. One difference from the date box's card, named so he
  can rule it: there a tap outside changes nothing; here the month has already followed the wheels. Recommended because
  the days stay in place under a card that comes and goes, it is the part the app already floats, and it opens the same
  way on every page.
- **B — the wheels in place of the days.** A tap swaps the month's days for the wheels inside the calendar, as Jump to a
  date's own title does; a second tap on the title (or Enter) brings the days back on the month chosen. Nothing floats,
  but the whole month disappears while choosing, and on a desktop the wheels sit in one corner of a large empty area.
  (`cal-1-phone.png`, `cal-2-desktop.png`)

## On the platform the app is moving to (D1551)

Both are changes to the screens only — no new data and no new setting — so both can be built as they are in a Power Apps
code app on Dataverse.

## Not drawn

The SANS calendar is drawn for its title only (closed); its wheels would be the same card as the Inputs calendar's.
The keyboard set for the new jump (a key on the title opens the wheels, arrows turn them, Enter or Escape closes) follows
Jump to a date's own and was not drawn.


## His answer (2 Nov 26)

"all as recommended" on https://claude.ai/artifact/5ttQYE15no5APnZmboy9vJ: **1 — A** (his D1561), **2 — A** (his D1562). These drawings are the approved source for the build (D1478).
