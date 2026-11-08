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

Loads by itself when a chat reads a Tracker file (the `paths:` above). Each line is a rule as it stands, its rulings after it; his words, the agent's readings told to him (never stated here as his rule) and the history are in the full rows, `.claude/decisions-full/tracker.md`: open the row before acting on a rule's detail or asking him about it. Other areas' rulings are pointed to at the end, each stated on its own file; the architecture (moved whole 7 Nov 26) and the map of the Tracker's documents: `.claude/rules/seams/tracker.md`; the map: `DECISIONS.md`.

**No student name, mark or date may enter the repository** (public until he says otherwise, How we work's D106, D1530; collaborators read it anyway): `src/tracker/data/` is verbatim course content only.

## What it keeps
- Never again exported as a standalone app: it lives in the app for good, as a tab [D1538].
- A syllabus is one shared thing, one Syllabus row a chart: an edit reaches every course and student on it, never a copy per course (a variant: Duplicate); marks are the student's, filed under his enrolment (one student, course, chart) and the event's fixed code, so moving, redrawing or re-wording a ball keeps them, a new ball is ungraded, a deleted one loses them [D474, D124].
- The course list, each course's and chart's student list and each chart definition are saved one record a thing, each with its order [D462].
- An empty real database starts with no course, the first person adding one from the "No course yet" card; the demo course and its students exist only with the demo on, never in a shared store [D463].
- His charts, syllabi and ball details are kept: no change wipes them without putting them back, and he is told first so he can export a copy [D464, D120].
- The database route is export, wipe, import, so a fault it removes is not a finding: today's stored data, the converters of older stored data and older file formats are out of every check; what the app would do again to new data is a finding [D120, D56].
- The event box's hint reads "e.g. Lecture, OFT/AMT, 2 x F-15"; the syllabus data and the smoke lines checking it stay outside every privacy sweep [D64, D62, D63].
- Two faults wait for the database step, filed: an import saved as many groups, not one; a stale tab undoing the first save of the chart order [D983].
- A member can do everything an admin can, the File menu too: Import (a chart after its question, students and marks after one yes), Export (names and marks when ticked, the warning kept); only the flex settings are an admin's; the app's other roles are untouched [D121, D1014].

## Students
- Every student is a man on the roster, picked from it, none added by a typed name, so his down days come from the Inputs and the typed "No. of Down Days" box is gone for everyone [D1931, D1005].
- To build (`[TRK-NO-TYPED-STUDENT]`): + Add loses its "Or type a callsign" box, a search matching nobody adds nothing, with nobody on the roster to offer it adds nobody; until then the app still adds a typed name as a student linked to nobody, down days "—", none of it kept or extended [D1931].
- A course start is entered when a student is added (a date box atop "+ Add", today by default, above the list since a tap on a name adds him at once) and changed in the Info panel where the Upchit box was, no clear cross, no height added [D1003, D1004, D1005, D1018, D1931].
- A man deleted through Post out leaves every course where he has an event neither done (DCO, DPCO, Marginal) nor N.A., and stays, record kept, where all of his are: People and accounts' "a course still running" [D981, D299, D300, D1105].
- Each person reopens the Tracker on his own last course, chart and student, on that browser, never another's; someone new starts on the first course, its last-graded student, else the first; a half-typed day in Done on or Failed on is refused, never recorded as today, an empty box still meaning today [D376, D292, D377].

## Look
- Raptor's colours fully: backgrounds, text and the seven event colours, sim yellow to amber [D157].
- The flight balls' labels are made clearer, the reading goal kept; that alone approved no shape, size or palette; the blocky wide wing was rejected [D560, D564].
- The flight symbol is the tapered wing: sloping leading edges, a curved lower wing, the nose and tail as they were, a clear blue backing behind the label [D566].
- Ball and ring size, palette, his fonts, charts and details, and how a ball is marked and tapped stay unless he changes them [D566, D564].
- The private pictures behind the symbol stay outside the repository; no student name, mark or date is copied from them [D560, D564, D566].
- The Currency & flex bars take dark words on green, amber and red, white on grey, colours and words kept; a bar's colour and ink come from one place, so none takes one without the other [D982].

## Moving
- On a phone the chart and the Info half are scrolled by the phone itself, its frame rate, glide, bounce and touch-to-stop meeting the glide's rulings below [D992, D985, D986, D987].
- A finger scroll glides: it speeds up with the finger and slows to a stop after the lift, never stopping dead; a touch while it glides or bounces only stops it: nothing opens, no pop-up, no button; a second tap works; a touch that goes on to drag carries the view from where it stopped [D985, D986].
- A glide bounces a little past an end and springs back, like the iPhone's lists, the one bounce the design guide allows; only a finger or pen glides (a phone, an iPad, a touch laptop); a mouse drag stops where let go, no bounce; trackpad and mouse wheel are the browser's own [D987, D988].
- Two fingers stop a glide, the pinch and its take-back unchanged; the app's own move (a pick, a search, the keyboard, the zoom buttons) stops it and wins; it stays on when the phone asks for less motion; Edit chart layout is untouched; a lift after a drag or glide opens nothing [D989, D992].
- A pinch stretches the chart as a picture while the fingers move and lays it out sharp at the lift, the spot under the fingers kept; Edit chart layout pans as the chart does [D992].
- On a touch screen the chart draws no scroll bars yet scrolls, glides and pinches; the Info half, Show All and every window keep theirs; a desktop with a mouse keeps the chart's and the Info panel's; the stray bars were fixed first, before the iPhone keyboard fault and the Leave War overhaul's next step (its D1404), each pictured first, its place marked [D1406, D1405].
- The chart lands its event mid-box wherever it can, never with empty space above the chart's start in view (an event near the top sits as high as the chart goes); one body does every landing: a crew pick, a search, the start-up, a person's own place, the Tracker coming back on screen [D984].
- On a desktop one Tab stop (not one per event) takes the keys into the chart; → the next event along a line, ← the one it needs first, ↑ ↓ the one above or below, the event wearing the plain blue ring, no glow; Enter opens the pop-up, the keyboard inside; Escape returns to the same event; with two events to go to, the build chooses and says so [D980].

## Marking
- When the window would not fit below the event tapped, the chart slides the event up under the tabs with its own smooth scroll, only as far as needed, staying there after Close, and the window opens whole below it, phone and desktop; the landing is unchanged, the slide coming only as the window opens [D1790, D1861, D1290, D984].
- An event too near the chart's end to slide falls back to the page's option B: nothing moves, the window stands above the event [D1790, D1861].
- As built: above the event the window is whole where it fits, else held between the tabs and the event, scrolling inside, a desktop the same under the Tracker's bar, no new words; the chart's end may stop the slide short while the window still fits; while sliding the chart takes no press, no key but Escape and Tab; less motion jumps; the window shows once the chart rests [D1790, D1861].
- On a screen too short for the window (a phone on its side) the chart lifts the event as high as it may go and the window opens under it, scrolling inside itself, as built: the event stays in view, the grade buttons show first [D1861].
- The three date boxes (a course date, Done on, Failed on) open the app's one calendar: a tap picks and the calendar goes, no tick; the pop-up stays open, the box reading the date in words; his fallback stands: if a tap proves too easy to get wrong there, a tick at the top right of the calendar's head, the Tracker alone [D801, D796].
- A day after today is refused in Done on, Failed on, Last Flown (Syllabus) and Last Flown (Currency): the box goes back to what it had, one line says the day cannot be after today, nothing saved, no undo step; the end dates A and B take any day [D374, D56].
- The attempt history is what the pop-up keeps (each failure with its day, then the day it was done, each stamped with who marked it) with the Failures card; no second list; a grade changed later is a correction, not another try [D979].
- Failures follow their days: the earliest the plain code (ST-02), the next adds X; − takes back the one with the latest day; re-dating re-orders them [D371].
- The Failures card leaves out failures on an N.A. event, as the ball does (no chip, not in the total or the full list), and they come back, days and all, if the event is graded again [D370].
- Last Flown is the latest day actually flown, whatever order the marks were entered in [D123].

## Info panel
- The Upchit Date box is gone: down days are worked out from the Inputs (every medical day since his course start, ATT B included, a half-day medical half a day) for every student [D1002, D1003, D1004, D1005, D1931].
- "No. of Down Days" reads such as "14½ days", with a chevron; a tap opens the down-days window, a copy of the Failures window: one row an input with its kind, dates and days ("½ day"), a cut one "cut by an upchit on … · filed to …" with its old end struck, a running one "still running · counted to today" [D1018, D1002].
- The window only shows, the Inputs page edits; it counts the inputs as they stand, an upchit's cut included, a running one to today; before a course start it reads "—" and "Pick a date", with "Set the course start to count them." [D1018, D1002].
- The landing-currency bar counts only the days since his last currency or non-syllabus flight, down days taking no part; the down days are a figure of record with their window, feeding no bar [D1004, D1005, D1931].
- "Last flown currency" is typed by the member for a non-syllabus flight and moves only the IP requirement (landing currency) [D1005, D1931].
- The flex figures are editable, and one switch for the whole Tracker turns flex off, everything about flex then gone: bar, windows, words, the legend's part [D1006].
- They and the switch open from a settings icon in the Tracker's top bar (the app's one gear), and only an admin changes them; a member sees the window read only, no Save [D1014, D1018, D1509, D1707, D1006].
- That window copies the Inputs calendar's settings window, with the Logic page's on/off switch and Cancel / Save; only the six "From" days (7, 14, 21, 31, 60, 120) are typed, each "To" following from the next row, the band words fixed [D1018, D1006, D1014].
- With flex off the heading reads "Currency" and the flex bar goes, on a desktop the flex sentence too [D1018, D1006].
- The legend shows what each ball means (a flight and the other kinds), what currency a flight needs, when an IP is required and when a flex happens; with flex off its flex part goes; "Legend" sits beside Show All, a copy of the Leave War's Legend pop-out, and as drawn leaves out the ball's corner number (the agent's reading) [D1007, D1018].

## Bar and Find
- Every control on the bar is as tall as its dropdowns, 30 on a desktop, 26 on a phone, the bar no taller (except where a narrow desktop wraps it, Settled) and nothing moving; with the gear and Legend added it stays two rows on a phone, one on a desktop [D1170, D1171, D487, D1018].
- On a desktop the labels Crew, Course and Syllabus take the small spaced capitals of Quals' "Viewing" (size, weight, spacing, grey), words kept, nothing moved; the phone has no labels [D1136].
- The bar's buttons, the menu items and the Students card wear the app's line icons (the pencils the one solid pencil; ⓘ, ☰ before Show All, ⇪ before File, the bar's ^, the phone's "Flow chart" tab's map; Reorder, Duplicate, Import and the empty Tracker's "Import a file…", Export, Delete, the × on each student), nothing moving, no button changing what it does; on a phone the Flow chart, Info and Show All tabs sit joined in one box [D1132, D1134, D919, D1135].
- Each tool of Edit chart layout takes a drawn mark, as drawn: Move a hand, Select a dashed box, Select all a ticked box, Connect two joined points, Delete the bin, Line a line, Arrow a headed line, Edit lines a curve, Fit four corners, Reset layout a turning-back arrow, Edit events the list; Merge and Unmerge keep their words alone; the lull's Copy to… the copy mark, its × the drawn ✕; copy, bin, list and ✕ the Tracker's own, the rest new in the same style [D1705].
- The search magnifier is the app's own, its handle as long as every other search box's, the shorter drawing gone; on a phone the Find ✕ empties the box and puts Find away (keyboard down, tabs back) as Escape does, its hover words "Clear the search and close Find"; a pick from the list puts Find away on purpose; on a desktop nothing changes, the ✕ staying in the box [D1900, D1791, D1127].
- As built, as his question's page said (up to 1050 wide): the phone's way holds wherever Find is the strip, to 1050 wide, a narrow desktop too; wider, the ✕ only clears ("Clear the search"), the keys staying in the box or, from the keyboard, going back to the magnifier [D1791].

## Layout and reorder
- On a short screen (a phone on its side) Edit chart layout folds its tools into one row: the tool in use with its one-line hint, Fit and "Tools ▾", which opens the whole set over the chart (a tap outside closes it); the double-click note, hint line and Flow, Info and Show All tabs step aside; upright phones and computers keep the strip [D373].
- The chart's drags (a ball, a line's end, a bend handle) carried to the edge pan the chart at the feel of the app's other edge scrolls; a fix that would add a look waits for him [D899].
- Deleting a ball wipes its marks (a new ball with the same code starts ungraded, not counted in Overall) and its typed details, a built-in chart's shipped wording not being typed work; both at ✓ Save changes (and "Revert edits only", for the balls the edits had added); an undo before the save brings them back [D124, D130].
- The reorder windows (courses, syllabi, crew) take a finger drag in the app's own look: the grip ⠿, not ☰, the carried row ringed, one landing line in the gap, never a box, the list scrolling at its edge; a mouse drag wears the same; the grip's touch area is bigger than it looks, as drawn [D922, D924].
- "Drag a row, or use ▲/▼." is deleted from all three windows, each one's second sentence kept, "This sets the order of the Syllabus dropdown for every course." among them [D924].

## Undo, import and export
- A change to a student's pace, either end date or his lull periods is an undo step (↶ / Ctrl+Z, ↷ / Ctrl+Y) from the app's top bar, the Tracker's own pair gone; not undoable: adding, removing or renaming students, courses and syllabi; event details; Import [D372, D347, D348, D1538].
- An import may reset student marks but never wipes an event's typed details (hours, prerequisites, crew pairing, name, type and format); event details belong to the chart they were typed on, one code being a different sortie on another chart; a change wanted everywhere is typed once per chart, the cost he accepted; an export carries each chart's own detail edits, an import writes only the imported charts' [D122, D126].
- An import never deletes marks, and a chart import writes none: "Replace it" leaves a dropped ball's marks stored out of sight, importing the old chart back brings them back (the catch accepted: a new ball with that code shows the old marks); a ball's wipe is a Save changes or Revert thing only [D132, D124].
- The import's refusal reads "Student marks not brought in: they belong to a chart this file doesn't carry. Export a fresh backup that includes its charts, and import that."; the not-found, deleted-chart and two-onto-one cases get those words too; a file really saved by an older version keeps its own; the export file remembers a deleted built-in chart, which stays deleted and restorable after the import [D1015, D127].
- A deleted course is restored from the courses' Reorder window, its Restore wearing the drawn Reset arrow; it comes back with its students and marks, under its own id, and the delete question says so; that question and an import's note on a deleted course drop their typed ↺ and ⇅, reading "Restore in Reorder courses brings it back…" and "(Restore in Reorder brings it back)", every other word kept [D128, D1860, D1792].
- Logging out with unsaved chart edits asks first: Save them, Discard them or Stay [D129].

## Settled — leave as they are
- A students import puts a new course at the bottom of the Course list, the courses already there keeping their places, Reorder moving it: not a defect, not to be re-filed [D375].
- A backup does not carry deleted courses; leave it: Restore before exporting [D131].
- The pinch's take-back stays as built: a ball dragged on purpose in Edit chart layout then joined by a second finger goes back to where the drag began (any second finger, however long the first was down, means a zoom), and after a pinch the finger left down does nothing until it lifts, in both modes; neither re-proposed, the second back to him only if the phone will not allow it [D134, D992].
- The tap after a drag is closed as a quirk of the test browser, reopened only if he sees it on a real phone [D158].
- On his iPhone the student, course and year dropdowns draw their words whole: the cut words were the test browser's, nothing changed [D1564].
- At about 1051–1200 wide the bar wraps onto two lines and may be 2 taller (87 to 89), as built, its lines not moved closer; at 1536, at 1050 and under and on a phone, unchanged [D1171, D1170].

## From other areas (each stated on its own area's file)
- The design file's (the screen rules the Tracker shares: bands, marks, menus, legends, search boxes, rings, drags, the gear): D1901, D1655, D1667, D347, D348, D672, D1706, D1703, D1793, D1700, D1792, D1704, D1701, D926, D1134, D1127, D1122, D1567, D1607, D1610, D1611, D1632, D1631, D1633, D1638, D1635, D876, D887, D1614, D895, D1509, D1707.
- The Inputs pages' (edge lists, title pencil, cut inputs): D900, D893, D897, D919, D999.
- The Leave War's (glow, pinch, scroll, order, the day in view; the half as .5, the Tracker's ½ kept until he says): D881, D1287, D1246, D1397, D1290, D1404, D1449.
- The scheduler's (the one calendar, the 13 Oct fixes, names at the time, the keys, a flash): D796, D797, D800, D824, D1012, D1020, D830, D1589, D1081, D1412, D1038.
- People and accounts' (a deleted man, one database): D299, D300, D1105, D1101, D292.
- The IT flow guide's (the Tracker in full, checked in the app): D414.
- How we work's (privacy, the one table, React Doctor, strict checks, the lock, the graph, pinned cells, stored data, the public repo): D62, D63, D1587, D473, D1534, D1537, D228, D774, D1281, D487, D56, D106, D1530.
