# The read of the Tracker's date boxes' finished code — the reader's brief (13 Oct 26, D801)

You are a fresh reader. You did not write this code, and you read it BLIND: do not open
`raptor-port/docs/handpass/2026-10-13-tracker-date-boxes.md` (the builder's own check) or anything under
`raptor-port/docs/handpass/parts/` — your report must not be shaped by them. Read the code at the commit you are given;
change no file of the app; write ONE file, your report (below).

## The promise

Open the full row first, in the shell from the repository root: `grep -h '^| D801 |' .claude/decisions-full/*.md`.

- **D801 (owner, 13 Oct 26)** — the Tracker's date boxes — a date on a course, "Done on" and "Failed on" in the marking
  pop-up — are the app's own date box, opening the app's one calendar: a tap picks and the calendar goes, no tick; the
  pop-up stays open and the box reads the date in words.
- **The rulings that already governed these boxes and must still hold:** D374 (a day after the squadron's day is refused
  in Done on, Failed on — the failures list's rows too — and both Last Flown boxes: one line says why, nothing is saved,
  no undo step; Upchit and End date A / B take any day), D377 (an empty Done on / Failed on means today; a day that is
  not whole is refused, never recorded as today), D372 (a change to Last Flown, Upchit, the pace or an end date is ONE
  undo step), D371 (a student's failures on an event stay in the order of their days; re-dating re-orders them), D123
  (Last Flown is the latest day actually flown). Their one-line forms: `.claude/rules/decisions/tracker.md`; the screen
  contract: `raptor-port/docs/ui-contracts.md` §The Tracker tab → Marking; the Tracker's own traps:
  `raptor-port/docs/tracker/known-gaps.md` (its last section is this change).
- *The builder's readings (rule each: supported / contradicted / the owner's to decide):* a date is saved the moment it
  is picked (it was saved when the typed box was left); a box that holds a date carries a small "take this date off" (✕)
  INSIDE its right end, because the app's calendar has no Clear and an emptied box still means something here (no
  upchit, no end date, a failure with no day); Done on and Failed on carry none (empty there means today, and the box is
  never empty); End date A and B, three across in their card, show the date without its weekday so it is never cut
  short; a refused day in Done on / Failed on of an event NOT yet done stays in the box with its line (the store's rule
  of 28 Sep 26); the Tracker's other dates stay dd/mm/yy; the lull periods' own calendar is not touched.

## What to read

The change is `git diff origin/claude/one-date-calendar-step-one-55ba13...HEAD -- raptor-port/src raptor-port/scripts/tracker`
(from the repository root). This branch is CUT FROM the calendar's own branch: `ui/DateBox.tsx`, `ui/DateCal.tsx` and
`ui/scheduler/26-date-calendar.css` came with that branch and were read there — read them now as what the Tracker
stands on, and report against them only where the Tracker's use breaks. The changed files: `tracker/components/DateBox.jsx`
(whole), `tracker/components/Pop.jsx`, `tracker/components/SidePanel.jsx` (two lines), `tracker/tracker.css`,
`ui/DateBox.tsx` (one new prop, `noWeekday`). Read the surroundings: `tracker/App.jsx` (every document-level listener —
Escape, Delete, Undo, "a click outside the pop-up"), `tracker/app/core.js` (`popDoneChanged`, `popDoneCommit`,
`popFailDateChanged`, `popFailCommit`, `popGrade`, `popFail`, `setLastSyll`, `setLastCurr`, `setUpchit`, `setTarget`,
`setTarget2`, `setFailDate`, `handleEsc` and its order, `openPop` / `closePop`, the undo step each makes),
`tracker/components/SidePanel.jsx` (the failures list `#failLog`, which re-sorts its rows when a day changes),
`tracker/TrackerPage.tsx` (the page is KEPT MOUNTED after it is first visited — what a calendar left open does when the
person changes page, signs out, or another person signs in).

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

**And the state table.** For each STATE (no calendar; a calendar open from a side-panel box; from a failures-list row;
from Done on; from Failed on; a refusal's line showing) × each EVENT that can arrive in it (a pick; the same day picked
again; a pick of a day after today; "take this date off"; Escape, once and twice; a press on the page behind; Undo and
Redo from the keyboard and the top bar; the Delete key; the Crew, Course or Syllabus picker changed; the phone's Flow
chart / Info tabs; the failures list re-sorting under an open calendar; the marking pop-up closed by a grade while a
calendar is open over it; a mark step restored that closes the pop-up; a page change, a sign-out, another person signing
in; today's date turning over; a time zone west of UTC) — say what the code does, and whether that is right.

**Look hardest at:** what REMOVING the typed box took away at each caller (read the removed lines in the diff — the old
box saved on blur and Enter, the pop-up's also on Escape, and told the store when it was part-typed); the order of the
two store calls on a pick in the pop-up, and what each `notify()` re-draws between them; an `onCommit` that is async and
answers after the box has gone or its row has moved; a double press on "take this date off"; the ✕ laid over the box
(which of the two takes a press at their edge; the keyboard's order; what a screen reader hears); a calendar left open
when the thing it belongs to goes away; Escape's order between the calendar, the failures list and the pop-up; the undo
history (one pick, one step — and none for a refused pick).

## What a finding is

A claim is a finding only with **a concrete failure** (setup, action, what happens, what should), **its cause** (file and
line), and **its exact fix, step by step** — not a direction. Give your confidence, and say whether it is new in this
change or older code the change has made reachable (compare with `origin/main` before saying "new"). You may run a single
existing unit-test file (`cd raptor-port && npx vitest run <file>`); you may NOT build, run the browser tests, start a
server, or edit any file under `raptor-port/src`, `raptor-port/e2e` or `raptor-port/scripts`. Where you could not run
something, name the exact input you would run — the host runs every such case before it is believed.

**Give explicit negatives too:** for each thing in "Look hardest at", if you checked it and found nothing, say so and
say what you checked.

## Your report

`raptor-port/docs/handpass/parts/trk-datebox/read-opus.md` — the findings ranked, each as above; then the builder's
readings each ruled; then the state table's cells that are wrong or unproved; then the explicit negatives; then what you
did not read. Reply to the host with at most six lines: how many findings by severity, and the two to look at first.
