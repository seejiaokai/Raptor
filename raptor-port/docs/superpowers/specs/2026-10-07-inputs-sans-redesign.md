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

**Picked (D626):** the date cell with lined-up columns, pilots left and WSOs right — **in the first set's own colours (D630:
shown deeper tints and a solid bright patch for the still-needed pair, he found them too much contrast and asked for the
initial colours back — a soft wash over the day, the pair in that colour, the figures in the app's soft grey; if the
words trouble him again on the real build, offer the grey figures one shade lighter, never the bright patch)**; three tabs across the top
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

## The baseline is set once, not day by day — D631, D632 (7 Oct 26, afternoon)

He found the one-day sheet on the Leave War too tiring as the way to set a year ("Don't u think so?" — yes). **D631:** a day
is day flying by default unless night is selected; no-fly days can repeat (every Thursday from a date onward, no end); the
year's public holidays are seen and set in ONE list; one door, or a few for convenience, chosen by counting the admin's
steps. **The shape drawn in the third mock-ups — ONE home, "Days", three parts by how often each is used:**
- **Normal week** (rarely): for each weekday — day, night or no fly, and the required pilots and WSOs — with the date it
  applies from. "Thursdays no fly from 5 Nov onward" is one change here. The required numbers live here too (the agent's
  addition), so a figure is not typed on every day.
- **Holidays** (once a year): a list for the year — public holidays and Off days, each a name and a date or a run of
  dates. It is the same record the Leave War's Event row holds today (`eventdefs.ts`: PH, Off day), seen as a list.
- **Month** (when something is planned): pick several days at once, then give them a class or a requirement — a
  night-flying period, a week at a different number, a one-off no-fly day. A day that differs from the normal week is
  marked, and can be put back.
The day's sheet on the Leave War, and "Day settings" on the SANS calendar's opened day, stay as the QUICK door for one day.
**Readings to confirm:** a public holiday or an Off day takes no flying and no requirement from the normal week (this
changes D627's reading 5); Saturday and Sunday start with no flying set. Nothing changes what earns OIL.
**The step counts shown to him** (taps, the agent's own count from the drawings, not measured on a build): the year's
ten public holidays — about 40 on the Leave War day by day, across twelve months, about 30 in the list on one screen, and checkable at one look; Thursdays no fly for good
— not possible day by day (52 days a year), 5 in the normal week; a three-day night period — 9 day by day, 4 in the month;
one day's figure from the Leave War — 3 either way.

**D632 — the desktop Inputs month, denser:** smaller text and shorter bars where there is room, so more inputs show before
"+N more". Drawn compact with no roomy / compact switch (the agent's pick). Not chosen yet.

## No normal-week view: a select button on every day — D633 (7 Oct 26, afternoon)

Shown the third set, he asked for the month to work like his reference's day-classification page — **each date carries its
own select button, Day / Night / No fly — "then we don't need a week view"; "the P and W required is set on the leave war
columns"; and "where should off and no leave be set?"** The shape drawn in the fourth mock-ups:
- **Days ▸ Month:** the class is chosen on the date itself. On a desktop, three buttons side by side on each date (D, N,
  NF), as his reference. On a phone seven dates across leave no room for three (his reference shows four across and scrolls
  sideways), so each date carries ONE button that steps Day → Night → No fly at a tap. **The weekday's heading sets every
  such day from a date onward, with no end** — how "Thursdays no fly from 5 Nov" is done now there is no normal week.
- **Days ▸ Holidays:** the year's list, as drawn for D631 — public holidays and Off days.
- **On the Leave War's columns:** Required P and Required W rows; a typed figure offers "this day", "this week" or "from
  this day on", so the usual number is typed once. The Event row stays the place for No Leave (only leave bidding uses it),
  and still shows — and can still take — a public holiday or an Off day (the same record as the list).
**D634 — the Leave War's Event sheet stays as built.** The fourth set drew a simplified Event sheet (plain chips, no
"Edit types") without opening the real one; he caught it. The real sheet — a typed event, the coloured type chips (PH green,
Off day grey, No Leave orange, SC red), the Tag row, "Edit types", "This day" or "A range" — already sets No Leave, an Off
day or a public holiday on a day or a range, and is NOT changed in this job. **For every mock-up from here: a surface the
app already has is shown as a real picture from the app; a drawing is only for what is new or changed, and says so.**
**D635 — the settings icon is a gear.** The mock-ups drew it as a circle with rays; he read it as a sun, which on these
calendars means day flying. The build uses the app's own cog, and its check looks at the gear beside a day-flying sun at
phone size.
**The rule of thumb told to him:** what every calendar shows is set in Days; what only the Leave War uses stays on the
Leave War. **Readings to confirm:** the one stepping button on a phone; the weekday heading for repeating days; "from this
day on" for the required figures; a public holiday or an Off day shows its tag in place of the select button.

## In the bug check: mock-up beside build — D624

For every mock-up he approves, the check's evidence sheet carries a PAIR: the approved mock-up, and a picture of the built
screen at the same width (phone and desktop where both were drawn), with the same made-up data where the app can show it.
A difference seen in a pair is a walk finding — fixed, or put to him as a change to the approved design. It adds to the
walk and to his own look; it replaces neither. For this job; whether later jobs get the same is put to him afterwards.

## Where the mock-ups are

**The fourth set (7 Oct 26, the last of the day) is at the head of the same private page**, the earlier three folded
beneath. Six pictures: the way in (the settings gear, then "Days" — the same line in the SANS calendar's, the Inputs
calendar's and the Leave War's settings; admins only); the Month on a phone (one stepping button on each date) and on a
desktop (D / N / NF on each date, the year's Holidays list beside it); the sheet a weekday's heading opens ("Every
Thursday": day, night or no fly; from a date; until — no end, or a date); the Leave War's Required cell ("this day",
"this week", "from this day on"); and the Leave War's Event row (PH, Off day, No Leave, SC; a run of dates). Its source
is `…/scratchpad/mock/mock4.html` with `mock4-extra.js`, on his PC only. **He also asked "how did u get into this
setting page" and "how do u set recurring NF days" — both are answered by pictures in this set.**


**The third set (7 Oct 26, later that afternoon) is at the head of the same private page**, the second and the first folded
beneath. Six pictures: "Days" on a phone — the Normal week (weekday rows, Thursday set to no fly with its numbers locked
at 0, "applies from Mon 2 Nov 2026"), the Holidays list for the year (date, name, PH or OFF; past ones dimmed), the sheet
that adds one (kind, name, from and to, "Save and add another"), and the Month (November: Thursdays NF from the normal
week, a public holiday green, one day marked as changed, three days picked with a bar to set night flying and "Apply to 3
days", "Back to normal week"); "Days" on a desktop with the three parts side by side; and the denser desktop Inputs month
with a pointer showing who placed a bar. The page also carries two step-count tables (the admin's set-up jobs, and
everyday use). Its source is `…/scratchpad/mock/mock3.html` with `mock3-extra.js`, on his PC only.


**The second set (7 Oct 26, afternoon) is at the head of the same private page**, the first folded at its foot. Twelve
pictures at first, eleven since D630: the SANS month in the first set's colours (the deep-tint and pair-only drawings were
withdrawn the same afternoon), with PH green, an Off day grey and NF tagged; one
person highlighted; a day opened ("Available", who placed each commitment and when, an admin's "Day settings" button);
"How this works" stating the cut-off from the setting with a worked date; the settings sheet (three colours; the late
cut-off as days or as a weekday of a week before); THE DAY'S SHEET on the Leave War (kind of day; flying — day, night, no
fly; required pilots and WSOs, same-for-both ticked; apply to a day, a week or picked days) and the same sheet with no fly
chosen (required locked at 0); the Leave War's rows (an Event row, Required P, Required W, Available turning red where
short, a tap showing the working — no "SANS needed" row, no sun or moon); the Inputs month as bars with the same day
kinds; a day's inputs with who placed each; the desktop SANS calendar. Its source is `…/scratchpad/mock/mock2.html`
beside the first set's, on his PC only.

*The first set:*

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
