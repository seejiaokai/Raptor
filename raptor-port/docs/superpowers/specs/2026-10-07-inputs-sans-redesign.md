# The Inputs calendar and the SANS availability calendar — his direction of 7 Oct 26

The design note for the Opus build of this job (D614, D615), on the branch `claude/inputs-sans-calendar`. It carries
what he said on 7 Oct 26 after seeing nothing yet of Codex's build but its description: his own reference pictures and
what he wants drawn. **Nothing here is built. Mock-ups come first (D620); his picks are recorded as rulings before any
build.** What Codex built on 5 Oct 26, and the rulings it was built under (D569–D585), are in
`2026-10-05-sans-commitment-calendar.md` and `../../handpass/2026-10-05-inputs-sans-claude-handoff.md`; where the two
differ, this note and the rulings it names are the later word (D90).

**His reference pictures** are of another squadron's app, with real callsigns: they are NOT in the repo. They sit on
his PC under `C:/Users/User/.claude/uploads/bf7991df-93b1-4ca2-8101-bcfabf358e44/` (ten pictures, 7 Oct 26) and are
described in words below.

## What a SANS calendar date shows — D617

His reference month: each date carries, top to bottom — the day number with a sun (day flying) or a moon (night
flying); a coloured pair such as `0/3`; then `F: 2/2`, `O: 1/3`, `A: 1/0`. **Every pair is pilots / WSOs.**

- The coloured pair is **how many more are still needed to fly** — pilots / WSOs.
- `F`, `O`, `A` are **how many SANS have committed** to Fly, OFT and AMT that day — pilots / WSOs.
- **Still needed, for each seat by itself, never below zero** = the Leave War's **pax required** for the day (set by an
  admin) − those the Leave War shows **available** in that seat (everyone not on leave, a course, Att C and the like)
  − the SANS in that seat who have **committed to fly**.
  With made-up figures: required 12; pilots available 11, SANS pilots committed 2 → 0 needed; WSOs available 7, SANS
  WSOs committed 2 → 3 needed. The date reads `0/3`. (He worked a real day of his reference through in the chat; those
  figures are another squadron's and are kept out of the repo, which is public for now — D106.)
- "Or if you have better ideas" — his words. A better drawing of the same figures may be shown beside the reference's;
  he picks.

**What this changes in what Codex built:** the day's requirement is no longer a "Flying SANS required" box in the SANS
day panel; the F / O / A counts become pairs; the single "F offered / required" line goes.

**What the app has today, checked 7 Oct 26:** the Leave War already works out, for any day, how many pilots and WSOs
are available (its Manning figures — `src/leavewar/engine/availability.ts`, fractional for half days). It has NO
per-day "pax required": it judges a day by its manning rules (amber and red thresholds on each counter). So the figure
is new, and three points are his to settle from a picture:
1. where the admin types the day's pax required (his reference: a row at the head of the leave grid, one number a day);
2. ~~whether it is one number for both seats, as in his reference~~ — **settled the same day, D622: two figures, pilots
   required and WSOs required** (a squadron whose aircraft are partly single-seat sets them apart); one number typed can
   fill both — that convenience is drawn for him to confirm;
3. that "available" counts the squadron's own people and never a SANS man (who counts only through his commitment).

Standing from before: the requirement is for flying only (D570); colour follows how many more are needed (D571); a
person counts once a day, his hours shown (D572); sun is day flying and moon is night flying (D577).
**A new place where the two apps meet** — the SANS calendar reading the Leave War's figures, read-only: name it in the
Leave War's architecture (`.claude/rules/decisions/leave-war.md` §Architecture, "four seams, and only four") in the
change that builds it.

## The three colours and the settings icon — D618

Yellow, amber, red; set by an admin from a **settings icon at the top of the calendar**; one setting for the squadron.
The agent's reading of his reference: the colour follows the day's total still needed, pilots and WSOs together —
1 or 2 yellow, 3 or 4 amber, 5 or more red — so the starting numbers are 1 / 3 / 5. A day needing nobody, or with no
requirement set, is uncoloured. (Codex built two cut-offs, amber from 1 and red from 3, behind a "Colour settings"
button.)

## Highlight one SANS person — D619

A picker at the top ("No highlight" until a name is chosen). Every day that person has committed to wears a **cyan
ring**. In his reference the letters he offered that day (F, O, A) are also underlined. **His open question:** should
the picker also choose among F, O and A? Recommended: no — the ring plus the underlined letters shows both at one look.

## The layout — D620

One place to reach **Medical**, the **SANS calendar** and the **Inputs calendar**; each calendar opens on its calendar.
Inputs keeps its **List**. **SANS availability leaves the List** and is filed on the SANS calendar only. A list for the
SANS calendar is his open question — he leans no, because a list does not show the day's manpower. A few layout ideas
are drawn side by side; Codex's built layout is one of them.

## Ideas to draw, none chosen — D621

- **Inputs as bars on the month**, the way Google Calendar draws events (one bar across the days an input covers) —
  compared with today's chips; dropped if it is too cluttered on a phone.
- **Drag across dates to pick a range** straight on the calendar — built for the mouse; a phone needs its own way
  (a drag is how the month is swiped there).
- **An Instructions fold at the top** — his reference's four lines, refined to what applies here.
- **The keyboard** — Escape, Delete, the arrow keys.

## His picks from the first mock-ups, and his new points — D626 to D629 (7 Oct 26, afternoon)

**Picked (D626):** the date cell with lined-up columns, pilots left and WSOs right — but its words must stand out on the
yellow, amber and red days (the first drawing's tinted cells washed the grey figures out); three tabs across the top
(Inputs, SANS, Medical), less tall; inputs as bars, as Google Calendar does; in the opened day the row reads "Available"
with no bracket. "The rest not mentioned seems ok": the Highlight ring with underlined letters and no F / O / A chooser,
the opened day's working, the three colours from a settings icon (pilots and WSOs needed added together, from 1 / 3 / 5),
"available" never counting a SANS man, no list for the SANS calendar, hold-and-drag (mouse drag on a desktop) to pick
several days, the List for Inputs behind one small switch, the keyboard set. NOT taken: the title-as-a-menu and
bottom-bar layouts, the date cell written with slashes.

**The day's class, holidays and Off days in step (D627):** a day is day flying, night flying or NO FLY (NF). An NF day needs
nobody to fly — its counters read 0 and it shows "NF" — in step with the Leave War. Public holidays (green, as on the
Leave War) and Off days show on the SANS and the Inputs calendars too. Day or night shows on the SANS calendar ONLY.
*What the app has (checked 7 Oct 26):* the Leave War's Event rows already hold the record — a word typed on a day, classed
by `src/leavewar/engine/eventdefs.ts`: "PH" (kind `off`: the column light green, work earns OIL), "Off day" (kind `free`:
light grey, earns nothing), "No Leave" (orange), "SC" (a working commitment). The two calendars READ that record; NF and
the day / night class are new. Codex's per-day "flying period" on the SANS day panel moves to wherever the day is set.

**The late cut-off (D628):** settable as a number of days OR as a weekday of a number of weeks before (the Wednesday two
weeks prior); the "How this works" text states the cut-off as set, with a worked date. *Today:* one figure on the Logic
page (`VCONF.inputLead`, 14 days before the input's week's Monday), for every input; downchits and upchits are never late.

**Who placed it, and when (D629):** a small line on every input and every SANS commitment — who filed it, the day and
the time; where an entry is listed or opened, never on the month's cells.

**Three questions he put back, each drawn with the agent's pick in the second mock-ups:** (a) where the late cut-off is
set — pick: each calendar's settings icon holds its own, the Logic page lists both and opens the same setting; (b) one
door or three for the admin's per-day settings — pick: ONE, the day's own sheet on the Leave War (kind of day, flying,
required pilots and WSOs), with a button into it from the SANS calendar's opened day; the two squadron-wide settings
(colours, cut-off) sit behind the calendar's settings icon; (c) "do we need a SANS needed row on the Leave War?" — pick:
no; the Available figure turns red when it is under Required, and the SANS calendar carries what is still needed.

## In the bug check: mock-up beside build — D624

For every mock-up he approves, the check's evidence sheet carries a PAIR: the approved mock-up, and a picture of the built
screen at the same width (phone and desktop where both were drawn), with the same made-up data where the app can show it.
A difference seen in a pair is a walk finding — fixed, or put to him as a change to the approved design. It adds to the
walk and to his own look; it replaces neither. For this job; whether later jobs get the same is put to him afterwards.

## Where the mock-ups are

Shown to him on 7 Oct 26 as a private page of pictures (his preference: sharp, tap to zoom):
https://claude.ai/artifact/U3WNp6VARTdVeDP5cUoQvD — sixteen pictures: two drawings of the date cell (as his reference;
lined-up columns), the highlight, an opened day with its working, the three-colour settings, the instructions fold, the
Leave War's new "required" rows, three layouts (tabs across the top; the title as a menu; a bar at the bottom) beside
the layout as built, the Inputs calendar as bars beside today's, picking several days, the List, and two desktop
pictures with the keyboard set. Nine questions were put to him with them (the first four: the cell, the layout, the
highlight, bars or pills). **The drawings carry his reference month's figures, so their source is NOT in the repo while
it is public (D106):** it is on his PC under the chat's temporary folder and is redrawn from this note if lost. Once he
has picked, the chosen design is drawn again with made-up figures and kept under `raptor-port/docs/mock/`, his pick
recorded as a ruling.
