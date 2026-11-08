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
<!-- trial: built rulings by test -->

Loads by itself with a Tracker file (the `paths:` above). It holds his standing rules, what he likes, and what a fresh model would get wrong if not told, each line's rulings after it. What is built lives in the app and its tests, listed by number on the "Built, held by tests" line, each named by a test.

His words, the agent's readings (never stated here as his rule) and the history are in the full rows, `.claude/decisions-full/tracker.md`: open the row before acting on a rule's detail or asking him about it. The architecture and the Tracker's documents: `.claude/rules/seams/tracker.md`; the map: `DECISIONS.md`.

**No student name, mark or date may enter the repository** (public until he says otherwise, How we work's D106, D1530; collaborators read it anyway): `src/tracker/data/` is verbatim course content only.

## What it keeps
- Never again exported as a standalone app: it lives in the app for good, as a tab [D1538].
- A syllabus is one shared thing, one Syllabus row a chart: an edit reaches every course and student on it, never a copy per course (a variant: Duplicate); marks are the student's, never the chart's [D474].
- His charts, syllabi and ball details are kept: no change wipes them without putting them back, and he is told first so he can export a copy [D464, D120].
- The database route is export, wipe, import, so a fault it removes is not a finding: today's stored data, the converters of older stored data and older file formats are out of every check; what the app would do again to new data is a finding [D120, D56].
- Two faults wait for the database step, filed (`[TRK-IMPORT-ONE-GROUP]`, `[TRK-FIRST-ORDER-PLACE]`): an import saved as many groups, not one; a stale tab undoing the first save of the chart order [D983].

## Students
- Every student is a man on the roster, picked from it, none added by a typed name, so his down days come from the Inputs and the typed "No. of Down Days" box is gone for everyone [D1931, D1005].
- To build (`[TRK-NO-TYPED-STUDENT]`): + Add loses its "Or type a callsign" box, a search matching nobody adds nothing, with nobody on the roster to offer it adds nobody; until then the app still adds a typed name as a student linked to nobody, down days "—", none of it kept or extended [D1931].
- "Last flown currency" is typed by the member for a non-syllabus flight and moves only the IP requirement (landing currency) [D1005, D1931].
- A half-typed day in Done on or Failed on is refused, never recorded as today, an empty box still meaning today [D377].

## Look
- The flight balls' labels are made clearer, the reading goal kept; that alone approved no shape, size or palette; the blocky wide wing was rejected [D560, D564].
- Ball and ring size, palette, his fonts, charts and details, and how a ball is marked and tapped stay unless he changes them [D566, D564].
- The private pictures behind the symbol stay outside the repository; no student name, mark or date is copied from them [D560, D564, D566].

## Moving
- On a phone the chart and the Info half are scrolled by the phone itself, its frame rate, glide, bounce and touch-to-stop meeting the glide's rulings below [D992, D985, D986, D987].
- A finger scroll glides: it speeds up with the finger and slows to a stop after the lift, never stopping dead; a touch while it glides or bounces only stops it: nothing opens, no pop-up, no button; a second tap works; a touch that goes on to drag carries the view from where it stopped [D985, D986].
- A glide bounces a little past an end and springs back, like the iPhone's lists, the one bounce the design guide allows; only a finger or pen glides (a phone, an iPad, a touch laptop); a mouse drag stops where let go, no bounce; trackpad and mouse wheel are the browser's own [D987, D988].
- Two fingers stop a glide, the pinch and its take-back unchanged; the app's own move (a pick, a search, the keyboard, the zoom buttons) stops it and wins; it stays on when the phone asks for less motion; Edit chart layout is untouched; a lift after a drag or glide opens nothing [D989, D992].
- A pinch stretches the chart as a picture while the fingers move and lays it out sharp at the lift, the spot under the fingers kept; Edit chart layout pans as the chart does [D992].
- The chart lands its event mid-box wherever it can, never with empty space above the chart's start in view (an event near the top sits as high as the chart goes); one body does every landing: a crew pick, a search, the start-up, a person's own place, the Tracker coming back on screen [D984].

## Marking
- When the window would not fit below the event tapped, the chart slides the event up under the tabs with its own smooth scroll, only as far as needed, staying there after Close, and the window opens whole below it, phone and desktop; the landing is unchanged, the slide coming only as the window opens [D1790, D1861, D1935, D1290, D984].
- An event too near the chart's end to slide falls back to the page's option B: nothing moves, the window stands above the event — kept, his word [D1790, D1861, D1935].
- As built: above the event the window is whole where it fits, else held between the tabs and the event, scrolling inside, a desktop the same under the Tracker's bar, no new words; the chart's end may stop the slide short while the window still fits; while sliding the chart takes no press, no key but Escape and Tab; less motion jumps; the window shows once the chart rests [D1790, D1861, D1935].
- On a screen too short for the window (a phone on its side) the chart lifts the event as high as it may go and the window opens under it, scrolling inside itself, as built: the event stays in view, the grade buttons show first [D1861].
- The three date boxes (a course date, Done on, Failed on) open the app's one calendar, a tap picking; his fallback stands: if a tap proves too easy to get wrong there, a tick at the top right of the calendar's head, the Tracker alone [D801, D796].
- The attempt history is what the pop-up keeps (each failure with its day, then the day it was done, each stamped with who marked it) with the Failures card; no second list; a grade changed later is a correction, not another try [D979].

## Bar and Find
- On a desktop the labels Crew, Course and Syllabus take the small spaced capitals of Quals' "Viewing" (size, weight, spacing, grey), words kept, nothing moved; the phone has no labels [D1136].
- The search magnifier is the app's own, its handle as long as every other search box's, the shorter drawing gone; on a phone the Find ✕ empties the box and puts Find away (keyboard down, tabs back) as Escape does, its hover words "Clear the search and close Find"; a pick from the list puts Find away on purpose [D1900, D1791, D1935, D1127].
- Kept as built, his word: the phone's way holds wherever Find is the strip, up to 1050 wide, a narrow desktop too; wider, the ✕ stays in the box and only clears ("Clear the search"), the keys staying in the box or, from the keyboard, going back to the magnifier [D1791, D1935].

## Layout and import
- The chart's drags (a ball, a line's end, a bend handle) carried to the edge pan the chart at the feel of the app's other edge scrolls; a fix that would add a look waits for him [D899].
- An import never deletes marks, and a chart import writes none: "Replace it" leaves a dropped ball's marks stored out of sight, importing the old chart back brings them back (the catch accepted: a new ball with that code shows the old marks); a ball's wipe is a Save changes or Revert thing only [D132, D124].

## Settled — leave as they are
- A students import puts a new course at the bottom of the Course list, the courses already there keeping their places, Reorder moving it: not a defect, not to be re-filed [D375].
- A backup does not carry deleted courses; leave it: Restore before exporting [D131].
- The pinch's take-back stays as built: a ball dragged on purpose in Edit chart layout then joined by a second finger goes back to where the drag began (any second finger, however long the first was down, means a zoom), and after a pinch the finger left down does nothing until it lifts, in both modes; neither re-proposed, the second back to him only if the phone will not allow it [D134, D992].
- The tap after a drag is closed as a quirk of the test browser, reopened only if he sees it on a real phone [D158].
- On his iPhone the student, course and year dropdowns draw their words whole: the cut words were the test browser's, nothing changed [D1564].
- At about 1051–1200 wide the bar wraps onto two lines and may be 2 taller (87 to 89), as built, its lines not moved closer; at 1536, at 1050 and under and on a phone, unchanged [D1171].

## Built, held by tests
- Built, held by tests (each named by a test; the detail is in the app and its full row): D64, D121, D122, D123, D124, D126, D127, D128, D129, D130, D157, D370, D371, D372, D373, D374, D376, D462, D463, D922, D924, D980, D981, D982, D1002, D1003, D1004, D1006, D1007, D1014, D1015, D1018, D1132, D1135, D1170, D1405, D1406, D1705, D1860.

## From other areas (each stated on its own area's file)
- The design file's (the screen rules the Tracker shares: bands, marks, menus, legends, search boxes, rings, drags, the gear): D1901, D1655, D1667, D347, D348, D672, D1706, D1703, D1793, D1700, D1792, D1704, D1701, D926, D1134, D1127, D1122, D1567, D1607, D1610, D1611, D1632, D1631, D1633, D1638, D1635, D876, D887, D1614, D895, D1509, D1707.
- The Inputs pages' (edge lists, title pencil, cut inputs): D900, D893, D897, D919, D999.
- The Leave War's (glow, pinch, scroll, order, the day in view; the half as .5, the Tracker's ½ kept until he says): D881, D1287, D1246, D1397, D1290, D1404, D1449.
- The scheduler's (the one calendar, the 13 Oct fixes, names at the time, the keys, a flash): D796, D797, D800, D824, D1012, D1020, D830, D1589, D1081, D1412, D1038.
- People and accounts' (a deleted man, one database): D299, D300, D1105, D1101, D292.
- The IT flow guide's (the Tracker in full, checked in the app): D414.
- How we work's (privacy, the one table, React Doctor, strict checks, the lock, the graph, pinned cells, stored data, the public repo): D62, D63, D1587, D473, D1534, D1537, D228, D774, D1281, D487, D56, D106, D1530.
