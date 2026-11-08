---
paths:
  - raptor-port/src/tracker/**
  - raptor-port/docs/tracker/**
  - raptor-port/scripts/tracker/**
  - raptor-port/docs/**/*tracker*
  - raptor-port/docs/**/*tracker*/**
  - raptor-port/docs/**/*trk*
  - raptor-port/scripts/handpass/trk-*.mjs
  - raptor-port/src/ui/logout.ts
---

# The Tracker — how it works now

<!-- shape: page -->

Loads by itself whenever a chat reads a Tracker file (the `paths:` above) — its code, its documents and scripts, its
walks, and the app's logout, which asks about unsaved chart edits — so work that strays into the Tracker from anywhere
else picks these up too.

Each line is a rule as it stands today; the numbers after it are the rulings that set it. His words, the readings he was
told, each ruling's date and the history are in the full rows, `.claude/decisions-full/tracker.md` — open the row before
acting on a rule's detail or asking him about it (`grep -h '^| D1790 |' .claude/decisions-full/*.md`, the shell; the
Grep tool hides a long row).

The main rulings of other areas that bear on the Tracker are pointed to at the end, each stated on its own area's file.
The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every chat; the map of every ruling, and
how to record or retire one: `DECISIONS.md`.

**Where the detail lives:** its architecture and where it meets the rest of the app — `.claude/rules/seams/tracker.md`
(moved from `raptor-port/CLAUDE.md` on 24 Sep 26, to its own file on 7 Nov 26); its screen —
`raptor-port/docs/ui-contracts.md` §The Tracker tab; its gaps and carried-over traps —
`raptor-port/docs/tracker/known-gaps.md`; what it stores — `raptor-port/docs/data-schema.md` §World 3; the model for the
database step — `raptor-port/docs/data-model.md`; its browser suite — `raptor-port/scripts/tracker/smoke.mjs`; its files
— `raptor-port/docs/file-map.md`.

**No student name, mark or date may enter the repository.** Its seed data, `src/tracker/data/`, is verbatim course
content only, and the smoke suite and the chart-baking script check that the seed and the sample file carry placeholder
names only (`raptor-port/docs/tracker/known-gaps.md`). The reason given when the Tracker came in, that the repository is
public, holds again: it went private on 23 Sep 26, public again on 25 Sep 26, and stays public until he says otherwise
(How we work's D106, D1530); collaborators would read it in any case.

## What the Tracker is, and the data it keeps
- The Tracker is one of the app's tabs for good, with no standalone export, so a change no longer has to keep a
  standalone copy working [D1538].
- The agent's readings of that, not checked with him: it replaces the 9 Sep 26 passage on the standalone copy; the
  code is ordinary app code, its own store and storage doorway kept until the database step and the command layer decide
  them; the rulings that did not rest on the export stand; the standalone-only code, filed as
  `[TRK-STANDALONE-LEFTOVERS]`, was built in pull request 637 [D1538].
- A syllabus is one shared thing: an edit to it reaches every course and student on it, never a copy per course, and the
  marks belong to the student; a variant is made with Duplicate [D474].
- As stored: one Syllabus row a chart; an enrolment is one student on one course on one chart, his marks filed under the
  enrolment and the event's fixed code; the agent's advice, not a ruling: no "one file per save" [D474].
- Moving, redrawing or re-wording a ball keeps its marks, and a new ball shows ungraded; deleting a ball removes its
  marks (below) [D474, D124].
- The course list, each course's and each chart's student list and every chart definition are saved one record per
  thing, each with its order; marks, dates, pace and lulls were already one record per student [D462].
- An empty real database starts with no course and the first person adds one, the empty Tracker's "No course yet" card
  being the way in; the demo course is made only with the demo on, and never reaches a shared store [D463].
- His charts, syllabi and ball details are kept: no change may wipe them without putting them back, and he is told first
  so he can export a copy [D464].
- The agent's readings of that: a wipe of the saved data's shape never touches the Tracker; the database step moves the
  charts by his own export, wipe and import; he is reminded to export before a "merge live" [D464, D120].
- The route to the database is export, wipe and import, so a fault that route removes is not a finding: today's stored
  data, the converters of older stored data and the older file formats are dropped from every check [D120].
- The highest finding instead, the agent's reading: a current export or import that loses or changes a ball, a line, a
  position, a font, a chart name or an event detail; marking, students and dates must still work for new data [D120].
- The event box's hint reads "e.g. Lecture, OFT/AMT, 2 x F-15"; the syllabus data (`src/tracker/data/`) and the
  smoke-suite lines that check it stay outside every privacy sweep [D64, D62, D63].
- Two faults wait for the database step and stay filed until then: an import saved as many groups instead of one
  (`[TRK-IMPORT-ONE-GROUP]`) and a stale tab undoing the first save of the chart order (`[TRK-FIRST-ORDER-PLACE]`) [D983].

## Who may do what
- A member can do everything an admin can on the Tracker, the File menu too: Import (a chart after its question, students
  and marks after one yes) and Export (names and marks when ticked, the warning kept); only the flex settings are an
  admin's (below); the rest of the app's roles are untouched [D121, D1014].

## Students and courses
- Every student is a man on the roster, so his down days always come from the Inputs, and the typed "No. of Down Days"
  box is gone for everyone [D1005].
- When the + Add search matches nobody and "Or type a callsign" is empty, OK or Enter adds the typed name as a new crew
  member linked to nobody, "Nobody on the roster matches" saying so first; a name typed below always wins, and a search
  still matching someone adds nothing by itself [D191].
- A course start is entered when a student is added — a date box at the top of "+ Add", today by default, above the list
  because a tap on a name adds him at once — and is changed in the Info panel, where the Upchit box was, with no clear
  cross [D1003, D1004, D1005, D1018].
- A man deleted through Post out leaves every course where he still has an event neither done (DCO, DPCO, Marginal) nor
  N.A., and stays, his record kept, on a course where all of his are — what People and accounts' "a course still
  running" means [D981, D299, D300, D1105].
- The agent's readings of that: "leaves" is his place on the course's student list; the test is made at the delete, by
  his marks, with no date; whether his marks go is checked against the delete's rule and the import's (below) [D981].

## Each person's own place
- Each person reopens the Tracker on his own last course, chart and student, on that browser, never someone else's;
  someone new starts on the first course, with its last-graded student, else the first [D376].
- The agent's readings of that: the person is the account's, so a rename keeps his place; every way of picking counts —
  the Crew box, a slice tap, + Add, an undo that switches the picker; the admin's member view is the same person [D376,
  D292].
- The chart is part of a person's own place, and a half-typed day in Done on or Failed on is refused, never recorded as
  today; an empty box still means today [D377].

## The chart's look
- The Tracker takes Raptor's colours fully — backgrounds, text and the event colours: flight, academic, test, sim,
  device, marginal and fail move to Raptor's tones, sim from yellow to amber; he chose it over the recommended B, and
  that it reads at a glance on a phone is still to be checked [D157].
- The flight balls' labels are made clearer, the goal of reading them easily kept; that alone approved no shape, size or
  palette, and the blocky wide wing was rejected [D560, D564].
- The flight symbol is the tapered wing (option 4): sloping leading edges, a curved lower wing, the nose and tail as they
  were and a clear blue backing behind the label; the ball, rings, palette, fonts, charts, details and marking stay as
  they are [D566].
- The private pictures behind the flight symbol stay outside the repository, and no student name, mark or date is copied
  from them [D560, D564, D566].
- The bars take dark words on green, amber and red, and white words on grey, their colours and words kept — the amber
  chips' recipe [D982].

## Moving round the chart — scrolling, the glide and the pinch
- On a phone the chart and the Info half are scrolled by the phone itself — its frame rate, glide, bounce and
  touch-to-stop — which meets the glide's rulings below [D992, D985, D986, D987].
- The finger's scroll glides: it picks up speed with the finger and slows to a stop after the lift; a faster flick goes
  further, and a slow drag stopped before the lift does not glide [D985].
- A touch while the chart glides or bounces only stops it — nothing opens, no pop-up and no button; a second tap works,
  and a touch that goes on to drag carries the view from where it stopped [D986].
- The glide bounces a little past an end and springs back, like the iPhone's lists — the one bounce the design guide
  allows, his choice over the recommended no bounce; the agent's readings: at all four ends and on the Info half, a
  finger pulled past an end giving the same stretch [D987].
- Only a finger or a pen glides — a phone, an iPad, a touch laptop; a mouse drag stops where it is let go, with no
  bounce, and the trackpad and the mouse wheel are the browser's own [D988].
- Two fingers stop a glide; the app's own move — a pick, a search, the keyboard, the zoom buttons — stops it and wins;
  the glide stays on for a reader who asked for less motion; Edit chart layout is untouched; a lift after a drag or a
  glide opens nothing [D989, D992].
- A pinch stretches the chart as a picture while the fingers move and lays it out sharp once at the lift, the spot under
  the fingers kept; Edit chart layout pans as the chart does; told to him: zoomed in it looks soft until the lift, and the
  pinch runs at up to 60 frames in Chrome — his look, "Yes this feels good" [D992].
- On a touch screen the chart draws no scroll bars and still scrolls, glides and pinches; the Info half, Show All and
  every window keep their normal bars, and a desktop with a mouse keeps the chart's and the Info panel's [D1406, D1405].
- The agent's readings of that: a touch screen is one whose only pointer is a finger, so a touch-screen laptop with a
  mouse keeps its bars; not checked on an iPad [D1406].
- The stray bars were fixed first, ahead of the iPhone keyboard fault and the Leave War overhaul's next step (the Leave
  War's D1404), each shown in a picture with its place marked first; that a bar which scrolls something real stays was
  the agent's reading [D1405, D1406].

## Where the chart lands
- The chart lands its event in the middle of the chart box wherever it can, never with empty space above the chart's
  start in view, an event near the top sitting as high as the chart goes; the left edge too is the agent's reading [D984].
- One body does every landing — a crew pick, a search, the start-up, a person's own place and the Tracker coming back on
  screen [D984].

## The keyboard
- One Tab stop takes the keys into the chart, not one per event: → goes to the next event along a line, ← back to the
  event it needs first, ↑ and ↓ to the event above or below, the event wearing the plain blue ring with no glow [D980].
- Enter opens the pop-up with the keyboard inside it, and Escape returns to the same event; where an arrow has two
  events to go to, the build chooses and says so [D980].

## The marking window
- When the marking window would not fit below the event tapped, the chart slides the event up under the tabs with its
  own smooth scroll, only as far as needed, and it stays there after Close; the window opens whole below it, on a phone
  and a desktop [D1790, D1861].
- An event too near the chart's end to slide falls back to the page's option B: nothing moves, and the window is held
  between the tabs and the event, its lower part scrolling inside; on a desktop the same, under the Tracker's bar; no new
  words [D1790, D1861].
- As built: the window opens 4px under the event; the slide brings the event's top to 22px under the chart box's top;
  while it slides the chart takes no press and no key but Escape and Tab; for less motion it jumps; the window shows only
  once the chart rests [D1790, D1861].
- It follows the Leave War's rule that a window never hides what it is about; where the chart lands is unchanged, since
  the slide comes only when the window opens [D1790, D1861, D1290, D984].
- On a screen too short for the window — a phone on its side — the chart lifts the event as high as it may go and the
  window opens under it, scrolling inside itself, as built: the event stays in view and the grade buttons show first
  [D1861].
- The three date boxes — a course date, Done on and Failed on — open the app's one calendar: a tap picks and the calendar
  goes, with no tick; the pop-up stays open and the box reads the date in words; the fallback, for the Tracker alone, is
  a tick at the top right of the calendar's head [D801].
- The agent's readings of that: a date is saved the moment it is picked; each box keeps its own "today"; where emptying a
  box means something, the way to empty it stays beside the box, the calendar having no Clear [D801, D796].
- A day after the squadron's own (Singapore's) is refused in Done on, Failed on (the full failures list's rows too), Last
  Flown (Syllabus) and Last Flown (Currency): the box goes back, one line says why, nothing is saved, no undo step; the
  end dates A and B take any day [D374].
- A future day already stored is not rewritten by that rule (How we work's rule on data already stored) [D374, D56].
- The attempt history is what the pop-up keeps — each failure with its day, then the day it was done, each stamped with
  who marked it — with the Failures card; no second list, and a grade changed later is a correction, not another try
  [D979].
- Failures follow their days: the earliest is the plain code (ST-02), the next adds X; − takes back the one with the
  latest day, and re-dating re-orders them; undated failures follow the dated ones, same-day ones in the order they were
  recorded [D371].
- The Failures card leaves out failures on an N.A. event, as the ball does — no chip, not in the total, not in the full
  list — and they come back, days and all, if the event is graded again [D370].
- Last Flown is the latest day actually flown, whatever the order the marks were entered in; the agent's readings: worked
  out from the flights marked done, a box left briefly empty not being a day flown [D123].

## The Info panel — down days, currency, flex and the legend
- The Upchit Date box is gone: the down days are worked out from the Inputs — every medical day since his course start,
  ATT B included, a half-day medical counting as half a day [D1002, D1003, D1004, D1005].
- "No. of Down Days" reads such as "14 1/2 days", with a chevron; a tap opens the down-days window, a copy of the Failures
  window: one row an input with its kind, dates and days ("1/2 day"), a struck row "cut by an upchit on … · filed to …",
  and a running one "still running · counted to today" [D1018, D1002].
- The window only shows, the Inputs page edits; it counts the inputs as they stand, an upchit's cut included, a running
  one to today; before a course start it reads "—" and "Pick a date", with the line "Set the course start to count
  them." [D1018, D1002].
- The agent's readings of that: the window shows how far a cut input first ran once its first end is kept (the Inputs
  pages' D999), and it reads the Inputs through the people bridge, a rider on a seam, not a fourth seam [D1018].
- The landing-currency bar counts only the days since his last currency or non-syllabus flight, medical down days taking
  no part — "(−5 down = 5d)" and "(minus down days)" are gone; the down days are a figure of record with their window,
  feeding no bar [D1004].
- Whether a non-syllabus flight graded on the chart moves "Last currency" by itself was left to the build to check —
  the agent's reading [D1004].
- "Last flown currency" is typed by the member for a non-syllabus flight and moves only the IP requirement (landing
  currency); a syllabus flight moves both the IP requirement and the flex [D1005].
- The flex figures are editable, and one switch for the whole Tracker turns flex off, everything about flex then gone —
  its bar, windows, words and the legend's part [D1006].
- The agent's reading of today's limits: under 7 days current; 7–13 one optional flex; 14–20 one mandatory; 21–30 two;
  31–59 two mandatory; 60–119 a short refresher; beyond, a re-course [D1006].
- The flex figures and the switch open from a settings icon in the Tracker's top bar — the app's one drawn gear, white
  there — and only an admin changes them; a member sees the window read only, with no Save [D1014, D1018, D1509, D1707].
- That window is a copy of the Inputs calendar's settings window, with the Logic page's on/off switch and Cancel / Save;
  only the six "From" days (7, 14, 21, 31, 60, 120) are typed, each "To" following from the next row, the band words
  fixed [D1018].
- With flex off the heading reads "Currency", the flex bar and "Days since syllabus" go — on a desktop the flex sentence
  too — and the currency bar takes the full width [D1018, D1006].
- The legend shows what each ball means (a flight and the other kinds), what currency a flight needs, when an IP is
  required and when a flex happens; with flex off, its flex part goes [D1007].
- "Legend" sits beside Show All, a copy of the Leave War's Legend pop-out, the desktop's colour strip moved into it so a
  phone has a legend too; it leaves out the ball's corner number; its words are as drawn (pictures 07 and 08), and any
  change is put to him first [D1018].
- The phone's bar stays two rows and the desktop's one, all of it built as the night-pictures brief drew it [D1018].

## The bar and its controls
- Every control on the bar is as tall as its dropdowns, 30 on a desktop and 26 on a phone, the bar growing no taller and
  nothing moving — his word for a button's size; before, the pencils, ⓘ, Show All and File were 23, Legend 20, the gear
  22 [D1170, D1171, D487].
- On a desktop the labels Crew, Course and Syllabus take the small spaced capitals of Quals' "Viewing" — its size,
  weight, spacing and grey — the words kept and nothing moved; the phone has no labels [D1136].
- The bar's buttons wear the app's line icons — its pencils the one solid pencil, ⓘ, ☰ before Show All, ⇪ before File,
  the bar's ^ and the map on the phone's "Flow chart" tab — nothing moving; the Inputs pages' title pencil is the
  precedent [D1132, D1134, D919].
- On a phone the Flow chart, Info and Show All tabs sit joined in one box, as the Inputs tabs do [D1132, D1134].
- The menu items and the Students card wear line icons in the bar's style — Reorder, Duplicate, Import (and the empty
  Tracker's "Import a file…"), Export, Delete and the × on each student — nothing moving and no button changing what it
  does; the pencils are the one solid pencil [D1135, D1134].
- Each tool of Edit chart layout takes a drawn mark, as drawn: Move a hand, Select a dashed box, Select all the box with
  a tick, Connect two points joined, Delete the bin, Line a line, Arrow a line with a head, Edit lines a curve, Fit four
  corners, Reset layout an arrow turning back, Edit events the list [D1705].
- Merge and Unmerge keep their words alone; the lull's Copy to… takes the copy mark and its × the drawn ✕; the copy, the
  bin, the list and the ✕ are the Tracker's own drawn marks [D1705].
- The Tracker's search magnifier is the app's own, its handle as long as every other search box's, the Tracker's shorter
  drawing gone — the handle grows by under a pixel; built in chat 28 (pull request 706), not yet live [D1900, D1127].

## Find
- On a phone the Find ✕ empties the box and puts Find away — the keyboard down, the tabs back — as Escape does, its
  hover words "Clear the search and close Find"; a pick from the list puts Find away on purpose; on a desktop nothing
  changes, and the ✕ stays in the box [D1791, D1127].
- As built: that holds wherever Find is the strip, up to 1050 wide; wider, the ✕ clears and keeps the keys in the box,
  its words "Clear the search"; from the keyboard, the keys go back to the magnifier [D1791].

## Edit chart layout and its drags
- Under about 500px tall, Edit chart layout folds to one row — the tool in use with its hint, Fit and "Tools ▾"; Tools ▾
  opens the whole set over the chart and closes on a choice or a tap outside; the double-click note, the hint line and
  the Flow, Info and Show All tabs step aside; upright phones and computers keep the strip [D373].
- The chart's drags — a ball, a line's end, a bend handle — carried to the edge pan the chart at the feel of the app's
  other edge scrolls; a fix that would add a look waits for him [D899].
- Deleting a ball wipes its marks — a new ball with the same code starts ungraded and is not counted in Overall — and
  deletes its typed details, a built-in chart's shipped wording not being typed work [D124, D130].
- Both happen at ✓ Save changes (and "Revert edits only"), and an undo before the save brings them back [D124, D130].

## The reorder windows
- The reorder windows — courses, syllabi and crew — take a finger drag with the app's own look: the grip ⠿, not ☰, the
  carried row ringed, one landing line in the gap, never a box, the list scrolling at its edge; a mouse drag wears the
  finger's look [D922, D924].
- The agent's readings, as drawn: only the grip drags, a press elsewhere scrolling; the grip has a bigger invisible area
  for a thumb but looks no bigger; ▲ and ▼ stay, the keyboard's way; Save order and Cancel are unchanged [D924, D922].
- "Drag a row, or use ▲/▼." is deleted from all three windows, each one's second sentence kept — "This sets the order of
  the Syllabus dropdown for every course." among them [D924].

## Undo
- Pace, either end date and the lull periods are undo steps from either bar (↶ or Ctrl+Z, ↷ or Ctrl+Y): keystrokes in
  one box within two seconds are one step; a lull set, changed or removed is one step, its removal still asking; Copy to…
  is one step for all it ticked [D372].
- Not undoable, as before: adding, removing or renaming students, courses and syllabi; event details; Import [D372].

## Import, export and backups
- An import may reset student marks but never wipes an event's typed details — hours, prerequisites, crew pairing,
  name, type and format — and never overwrites them with the shipped wording (the agent's reading) [D122].
- Event details belong to the chart they were typed on, since one code can be a different sortie on another chart; a
  change wanted on every chart is typed once per chart, the cost he accepted [D126].
- An export carries each chart's own detail edits, and an import writes only the imported charts' details [D126, D122].
- An import never deletes marks: "Replace it" leaves a dropped ball's marks stored out of sight, and importing the old
  chart back brings them back; the catch accepted: a new ball with that code shows the old marks; a ball's wipe is a
  Save changes or Revert thing only [D132, D124].
- The import's refusal reads "Student marks not brought in: they belong to a chart this file doesn't carry. Export a
  fresh backup that includes its charts, and import that."; a file really saved by an older version keeps its own words
  [D1015].
- The not-found, deleted-chart and two-onto-one cases get those new words too [D1015].
- The export file remembers a deleted built-in chart, which stays deleted and restorable after the import [D127].

## Deleting and restoring a course
- A deleted course is restored from the courses' Reorder window, its Restore wearing the drawn Reset arrow; it comes
  back with its students and marks, under its own id, and the delete question says so [D128, D1792].
- The "Delete course" question and an import's note on a deleted course drop their typed ↺ and ⇅: they read "Restore in
  Reorder courses brings it back…" and "(Restore in Reorder brings it back)", every other word kept, since a message
  cannot draw a mark; built and live (pull request 696) [D1860, D1792].

## Logging out
- Logging out with unsaved chart edits asks first — Save them, Discard them or Stay; the agent's reading: the app's
  Logout asks, while a reload or a closed tab keeps the browser's own question [D129].

## Settled — leave as they are
- A students import puts a new course at the bottom of the Course list, the courses already there keeping their places,
  and Reorder moves it — not a defect, not to be re-filed; students do not travel the database route [D375].
- A backup does not carry deleted courses — leave it: Restore before exporting, and the delete question says "in this
  browser" [D131].
- The pinch's take-back stays as built: in Edit chart layout a ball dragged on purpose and then joined by a second finger
  goes back to where the drag began, and after a pinch the finger left down does nothing until it lifts — not to be
  re-proposed [D134].
- The tap after a drag (`[TRK-TAP-AFTER-DRAG]`) is closed as a quirk of the test browser, reopened only if he sees it on
  a real phone [D158].
- On his iPhone the student, course and year dropdowns draw their words whole; the cut words seen were the test
  browser's own drawing, and nothing changed [D1564].
- At about 1051 to 1200 wide the bar wraps onto two lines and may be 2 taller (87 to 89), as built — its lines are not
  moved closer; at 1536, at 1050 and under, and on a phone, its height is unchanged [D1171, D1170].

## From other areas (each stated on its own area's file)
- The design file's: in a browser that keeps nothing, every page shows the "Not kept" band under the top bar, and the
  Tracker's corner shows nothing while it is up; not built yet (filed) [D1901, D1655, D1667].
- The design file's: every Undo / Redo pair, the Tracker's own included, sits in the app's top bar in the place and look
  of Edit Schedule's, the Tracker's still taking back only the Tracker's own changes [D347, D348].
- The design file's: the Tracker's Undo moves nothing [D672].
- The design file's: the Tracker's File and two pencil menus take the board's menu look, plain rows in one panel, rows 38
  tall, what each item does unchanged [D1706].
- The design file's: every ⇅ on the board takes the Tracker's Reorder mark, and the reset arrow — Reset layout, the
  Tracker's Restore — means "put back" wherever it stands [D1703, D1793, D1700, D1792, D1704].
- The design file's: the app's four legends — the Leave War's and the Tracker's Legend buttons open the same panel
  [D1701, D926].
- The design file's: a ✎ after an edited chart's name in the Tracker's Syllabus list stays typed [D1134].
- The design file's: every search box looks like the Edit Schedule week's, the Tracker's ✕ that clears its search kept
  [D1127].
- The design file's: arrows either side of words that change keep their place, the Tracker's among those swept [D1122].
- The design file's: on a phone the page never zooms, the Tracker's chart among the grids that zoom by their own pinch
  [D1567].
- The design file's: the start-up claw shows over the Tracker's first open after sign-in, in the blank moment before it
  is drawn, and "Still loading…" under it after 8 seconds [D1607, D1610, D1611, D1632].
- The design file's: when the Tracker's own download fails, only its page shows a card copying the Tracker's "No course
  yet" card, with Retry [D1631, D1633, D1638].
- The design file's: the just-added mark is the plain blue ring — a taken suggestion flashing it about a second, the
  Leave War's day brought into view in its cyan — and no mark in the app glows [D876, D1038, D1449, D887, D1614].
- The design file's: a thing dragged shows one landing line and scrolls its box at the edge — the design guide's §5A
  [D895].
- The Inputs pages': the Tracker's Select box and its Reorder list follow the edge too, with the SANS calendar's pick and
  the people picker [D900, D893, D897].
- The Leave War's: the Tracker's gold "can fly next" and turquoise "search found" rings lose their glow, keeping their
  lines [D881].
- The Leave War's: the pinned-parts rule for a pinch was put to him for Quals' and the Tracker's pinch as a suggestion,
  not built [D1287].
- The scheduler's: the app's one date calendar, its weeks starting on Monday, a sideways finger turning its month, and
  Escape closing its month or year list first [D796, D797, D800, D824, D1012, D1020].
- The scheduler's: the design look of 13 Oct 26 took, among its fixes, a future day faint in the Tracker's four date
  boxes, a date dim until a mark carries it, and one width for the side panel's boxes [D830].
- The scheduler's: the change history and every other record of who did something show the name as it was at the time,
  the person kept underneath [D1589].
- People and accounts': a man deleted keeps his Tracker record from the courses he finished, and loses his place on any
  course still running [D299, D300, D1105, D981].
- People and accounts': "one database" meant one deployment's schedule, Leave War and Tracker [D1101].
- How we work: the Tracker's syllabus data is outside every privacy sweep, and the aircraft type elsewhere reads the bare
  "F-15" or "a fighter squadron" [D62, D63, D64].
- How we work: what does not read the one table — a Tracker student read from the person among it — is one item for the
  database step [D1587, D473].
- How we work: every React Doctor finding in the Tracker went into the one clean-up batch before new feature work, and
  new and changed code follows its rules [D1534].
- How we work: strict checking of every value's kind reaches the Tracker, plain JavaScript today, when it is next worked
  on — the agent's reading [D1537].
- How we work: the Tracker smoke runs under the checks lock [D228]; the Tracker's progress graph is not started until he
  says [D774].
- How we work: the standing see-through test for a dense screen is added for the Tracker when it is next worked on
  [D1281].

**Architecture** — moved whole on 7 Nov 26 to `.claude/rules/seams/tracker.md`, which loads with this area's files and where the Tracker meets the rest of the app (the rules-diet plan §2).
