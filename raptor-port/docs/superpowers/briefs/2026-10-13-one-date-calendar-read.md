# The read of `[ONE-DATE-CALENDAR]` step one's finished code — the reader's brief (13 Oct 26)

You are a fresh reader. You did not write this code, and you read it BLIND: do not open anything under
`raptor-port/docs/handpass/parts/odc/` (the walkers' reports) — your report must not be shaped by theirs. Read the code
at the commit you are given; change no file of the app; write ONE file, your report (below).

## The promise (what the owner asked for — each sentence is from his ruling's full row, or marked as the builder's reading)

Open the full rows first: `grep -h '^| D786 |\|^| D795 |\|^| D796 |\|^| D797 |\|^| D798 |' .claude/decisions-full/*.md`
(run in the shell from the repository root). The design of record: `raptor-port/docs/superpowers/specs/2026-10-13-one-date-calendar.md`.

- **D786** — in the Calendar window on a phone, a swipe sideways on the month goes to the next or the last month, and on
  the Holidays list to the next or the last year; the "Every <weekday>" From box fits inside the window at any phone width.
- **D795** — From and Until's "A date" are the app's own date field, not the phone's date box; any date may be picked, the
  weekday standing out; the swipe is the Inputs calendar's, anywhere on the month or the Holidays list, and never presses a
  date's button.
- **D796** — one date calendar of the app's own: the month and year as a title that opens a month-and-year chooser (two
  scrolled lists), a Today icon right of the year, no Reset, no tick — a tap picks.
- **D797** — one box among others opens the calendar OVER the form (a tap picks and it goes; a tap outside closes it and
  changes nothing); where the dates are what the form is for, it stays inside; weeks start on Monday; STEP ONE is the
  Calendar window's swipe and every date box that was still the phone's own.
- **D798** — a note, not a choice: the Tracker's three date boxes are NOT in this step.
- *The builder's readings (rule each: supported / contradicted / the owner's to decide):* the Today icon goes to today's
  month and picks nothing; Escape closes an open calendar first and the window behind it on a second press; the calendar
  closes on the CLICK on its veil, not on the press; on a desktop the veil is a light dim; a run of dates is always whole
  (one tap is a run of one day; a tap before it starts over — the Leave War's range calendar's own rules); the page that
  arrives after a swipe slides in, an arrow press does not slide; Admin's "A date range" keeps a date already picked in
  another mode as a run of that one day; the fifth Leave War posting date (the dragged-block panel's "PO from") is in
  step one though the design's list missed it; the new calendar itself does not turn its month on a swipe.

## What to read

The change is `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e` (from the repository root; the branch
also carries documents and pictures — not your subject). The new files, whole: `raptor-port/src/ui/DateCal.tsx`,
`DateBox.tsx`, `sideswipe.ts`, `scheduler/26-date-calendar.css`. The places they are used: `ui/EveryWeekday.tsx`,
`ui/DaysWindow.tsx`, `ui/HolidaysPanel.tsx`, `ui/UsersPanel.tsx`, `ui/AdminPage.tsx` (`ClearControl`), `ui/inputedit.tsx`
(the upchit date), `leavewar/ui/BidPicker.tsx` (four boxes), `leavewar/ui/SelectSheet.tsx`, `leavewar/ui/Sheet.tsx` (the
tap shield). Read each CALLER'S surroundings too: what its form does with the date, what else listens on that surface
(the windows shell `ui/FloatWindow.tsx` and `ui/floatwin.ts`; the Leave War's `Sheet.tsx`; every document- or
window-level listener — `grep -rn "addEventListener('\(pointerdown\|mousedown\|click\|keydown\|touchstart\)'" raptor-port/src | grep "document\.\|window\."`).
The roll-call of every place and what proves it: `raptor-port/docs/handpass/2026-10-13-one-date-calendar.md` §3, §4.
The rules that govern the areas: `.claude/rules/decisions/scheduler.md`, `leave-war.md`, `people-accounts.md`,
`raptor-port/CLAUDE.md` (the standing UI rules), `.claude/rules/raptor-executor.md` (date maths stays
timezone-independent — the Leave War's tests run under a hostile time zone).

## How to read — use this wording as your method

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
> or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

**And the state table.** The date box and the calendar hold state between presses. For each STATE (closed; open on the
dates; open on the lists; a run half-way — one day, a finished run; a swipe just made, its guard still up) × each EVENT
that can arrive in it (its own presses and keys; a press on the page behind, on a second window, on a sheet's own
listeners; the form re-drawn or unmounted behind it; the value changed behind it; the window resized across the phone
width; the page scrolled; a second date box; Undo; a sign-out or a page change with it open; the box switched off while
open; today's date turning over; a time zone west of UTC) — say what the code does, and whether that is right.

**Look hardest at:** what REMOVING the phone's own date box took away at each caller (read the removed lines in the
diff, not memory); every listener added above its component (while its surface is hidden, covered or not in front, who
is entitled to the input); React handing a portal's events to the form that drew it; focus when the calendar closes;
what a keyboard-only or screen-reader user can and cannot do; the scrolled lists' arithmetic (the window of rows, its
re-centre, a list scrolled while a tap arrives); the swipe's guard that swallows one click; date arithmetic near a
month's or a year's end and in a time zone west of UTC; a caller that still expects "" from a box that can no longer be
emptied, or that committed on every keystroke and now commits once.

## What a finding is

A claim is a finding only with **a concrete failure** (setup, action, what happens, what should), **its cause** (file and
line), and **its exact fix, step by step** — not a direction. Give your confidence, and say whether you think it is new in
this change or older code the change has made reachable (compare with `origin/main` before saying "new"). You may run a
single existing unit-test file (`cd raptor-port && npx vitest run <file>`); you may NOT build, run the browser tests,
start a server, or edit any file under `raptor-port/src` or `raptor-port/e2e`. Where you could not run something, name
the exact input you would run — the host runs every such case before it is believed.

**Give explicit negatives too:** for each thing in "Look hardest at", if you checked it and found nothing, say so and
say what you checked ("I checked X in Y and found nothing").

## Your report

`raptor-port/docs/handpass/parts/odc/read-opus.md` — the findings ranked, each as above; then the builder's readings each
ruled; then the state table's cells that are wrong or unproved; then the explicit negatives; then what you did not
read. Reply to the host with at most six lines: how many findings by severity, and the two to look at first.
