---
paths:
  - raptor-port/src/ui/Inputs*.tsx
  - raptor-port/src/ui/Input*.tsx
  - raptor-port/src/ui/input*.ts*
  - raptor-port/src/ui/Sans*.tsx
  - raptor-port/src/ui/sans*.ts*
  - raptor-port/src/ui/DaysWindow.tsx
  - raptor-port/src/ui/HolidaysPanel.tsx
  - raptor-port/src/ui/EveryWeekday.tsx
  - raptor-port/src/ui/PeoplePick.tsx
  - raptor-port/src/ui/RangeCal.tsx
  - raptor-port/src/ui/OilDayList.tsx
  - raptor-port/src/ui/cal*.ts*
  - raptor-port/src/ui/oilday.ts
  - raptor-port/src/ui/CutFields.tsx
  - raptor-port/src/ui/placed*.ts*
  - raptor-port/src/ui/whoplaced.test.tsx
  - raptor-port/src/ui/daysfmt.ts
  - raptor-port/src/ui/dayswindow.test.tsx
  - raptor-port/src/ui/sideswipe.ts
  - raptor-port/src/ui/TypeLegend.tsx
  - raptor-port/src/ui/holidayspanel.test.tsx
  - raptor-port/src/ui/everyweekday.test.tsx
  - raptor-port/src/ui/peoplepick.test.tsx
  - raptor-port/src/ui/memberinput.test.tsx
  - raptor-port/src/leavewar/engine/holidays.ts
  - raptor-port/src/leavewar/holidays.test.ts
  - raptor-port/src/ui/scheduler/*input*.css
  - raptor-port/src/ui/scheduler/*sans*.css
  - raptor-port/src/ui/scheduler/*days*.css
  - raptor-port/src/engine/input*.ts
  - raptor-port/src/engine/late*.test.ts
  - raptor-port/src/engine/sans*.test.ts
  - raptor-port/src/state/plan*.ts
  - raptor-port/src/state/cutoff.ts
  - raptor-port/src/state/memberfile*.ts
  - raptor-port/src/state/sansfly.test.ts
  - raptor-port/src/state/demosans.test.ts
  - raptor-port/src/state/flyplan*.ts
  - raptor-port/src/state/input*.ts
  - raptor-port/e2e/input*.spec.ts
  - raptor-port/e2e/inputs*.spec.ts
  - raptor-port/docs/**/*input*
  - raptor-port/docs/mock/note-with-pucks.html
  - raptor-port/docs/mock/card-questions.html
  - raptor-port/docs/mock/cal-swipe-fit.html
  - raptor-port/docs/**/*sans*
  - raptor-port/docs/**/*calendar*
---

# The Inputs pages — how it works now

<!-- shape: page -->
<!-- trial: built rulings by test -->

Loads by itself with a file of the Inputs pages (the `paths:` above): the Inputs list and calendar, the SANS calendar, the Medical tab, the Calendar window, an input's own window and its card. It holds his standing rules, what he likes, and what a fresh model would get wrong if not told, each line's rulings after it. What is built lives in the app and its tests, listed by number on the "Built, held by tests" line, each named by a test that holds it whole; one its tests hold only in part stays written out.

His words, the agent's readings (never stated here as his rule) and the history are in the full rows, `.claude/decisions-full/inputs.md`: open the row before acting on a rule's detail or asking him about it. The map: `DECISIONS.md`. A ruling that governs both an Inputs page and the schedule lives in `scheduler.md`, which loads with nearly every file this page loads with: this page points to it (the last section), never the other way round.

## What it keeps
- This page is the rules diet's trial on the Inputs rulings, in the shape he approved for the Tracker: it keeps his standing rules, likes and what a fresh model would get wrong; a built ruling leaves for the "Built, held by tests" line only when a test holds it whole; no other area changes until he says, one at a time [D1943, D1942, D1941].
- Every input and every SANS commitment shows who placed it and when; on an input's card only "By Saber", and only where someone other than its own person placed it — always on a card for several people, even where the filer is one of them — with the day and time left to the input's own window and the change history; the desktop list the same, for several people too; the Medical tab's cards carry no placed line [D629, D720, D723, D724, D729, D1787, D1841, D1840, D960, D965, D1137, D1300, D968, D967, D977].
- Wherever the app prints a date with its year the year is two digits — "15 Feb 27", "till 15 Feb 27" — the Inputs list's date column, its phone day headings, the LATE mark's note and any other place; a till date in the loaded week's own year carries no year; every date the app keeps keeps its full year [D1096, D1095].
- An input's card stays short: a long title or remark is never cut off by what stands at its right — it wraps and the card grows downward; a shared input's people are all named, wrapping, never "+1"; the title starts at the left on a row of its own [D719, D721, D722].
- The settings icon on these calendars reads as a gear, never like a Sun, because here the Sun means day flying [D635].

## Who files an input, and who changes it
- A member files for other people only duties and commitments — never leave, never medical, never SANS availability (a SANS man files his own; an admin files it for one SANS man or several); a group filing is one shared input, one thing for everyone in it, the man himself, its filer and an admin changing or deleting it — but who is in it is changed only by its filer or a scheduler, each man free to take himself out; once a scheduler has moved a member's Other only a scheduler changes where it goes; its OIL answer: the scheduler's rulings [D655, D658, D763, D1388, D660, D762].
- A person who is the only named person in an input that also holds ALL AVAIL or ALL reads it and may take himself out, but does not change it for everyone — whoever filed it, or a scheduler, does [D770].
- ALL / ALL AVAIL is offered only for training, a meeting, an appointment, a duty and other, and for a one-day Personal input; never for an Attach (the old "Fly with", renamed) [D712, D778, D1373].
- A saved shared input's dates are changed in its own window, by whoever may change the input, for everyone in it at once [D681].

## Not built yet
- A date clicked on the Inputs or SANS calendar while a new input's window is open never looks picked while doing nothing: the click changes something the person can see, or nothing lights; what it does is his choice first (`[INP-CAL-CLICK-BEHIND-NEW]`) [D1298].

## Settled — leave as they are
- The Inputs list's cards keep their top line's right-hand marks as today — LATE, the document and the hours, each just before what follows it; the three-column layout once drawn is not built [D1721].
- On a phone held sideways a window over the Inputs or SANS calendar may cover the month's arrows and gear (it drags away; Undo and Redo stay clear), left as built; the SANS Highlight list fits the screen and scrolls inside itself [D1583].
- Where the window's Cancel / Add stand while the phone's keys are up is the phone's own doing — a long form's foot shows above the keys, a short one's stays under them; the app does not move the window to make them alike [D1413].
- On a phone an input's window opened from a day may reach the top and cover the day's bar, left as built: ✕ or Cancel shows the day again [D909].
- The list's date pop-up on a small phone is left as built: what runs past the foot is reached by one swipe, the dates one size, no scroll inside the pop-up, no smaller dates [D908].
- The new input pop-up is reachable by scrolling on his iPhone and needs no fix for that [D547].
- Another person's input, opened read only, draws its locked fields as values — no box, no arrow, tick boxes and buttons dimmed, not removed — kept as built [D364].
- A note of words alone keeps its small "+" (add people) beside its pencil and cross, as built [D709].
- The amber edge down the left of each cut line on the upchit sheet stays — the app's own warning-row mark, not a stripe to remove — and the design checker keeps skipping it there [D1025].
- "Delete" in an input's own window deletes at once and asks nothing, as built, Undo bringing it back — except an upchit whose delete gives a downchit its days back, which asks first on the upchit sheet [D792, D1022].
- No calendar is folded to a dates line: an input's window, and SANS "+ Commitment", keep their calendar showing; nothing else is folded, and the design guide carries no such rule [D916].
- An Attach keeps what D1374 built: under the schedule's Unavailable list by itself, counting him out on the Leave War (1, or 0.5 for half a day), with its "To" box — more than a new name for "Fly with", which never counted on the war [D1377, D1374].

## Built, stated here: their tests hold only part

### The Inputs list
- On a desktop the list is closed by a thin line round the whole of it, in the colour of the lines between its rows, and "No document" stands inside its column, so its right end no longer looks as if the list runs on; no column changes width; the phone's cards are unchanged [D1843, D1842].
- On a desktop "+ Input" stands at the right end of its row, as "+ Medical" does; while its window is open the list makes room from about 1340 wide, Name, Start and End narrowing first, Remarks keeping a usable width; below about 1340 no room is made and the window covers the list, standing over "+ Input" while open; from 821 to 1099 wide with no window open Type narrows to 124, so Remarks stays readable with every word whole, and from 1100 keeps its 160; the phone is unchanged [D1787, D1841, D1840].
- On a desktop the column headings sort from the keyboard: Tab reaches each, Enter or Space sorts as a click does, the heading the keys are on wears the app's cyan ring inside its cell; a mouse click draws no ring [D1719].
- The design vet's five changes stand: the list's add form is one "+ Input" button (at its row's right end on a desktop); the desktop list says "By Saber" only where someone else filed it; the window's instructions go; a shared bar leads with its count and a timed bar is lighter; the settings and small words are shorter [D729, D1787, D1841, D1840].
- On the desktop list a shared input names everyone in it, never "Drifter +3", and the kind keeps its pill [D727].
- On a desktop the list's "+ Input" and dates button are 36 tall, as on a phone and the rest of the page; nothing moves and the words stay [D1139].
- On a phone the list's "+ Input" and dates buttons stand in the row of the calendar / list switch, the filter and the gear, at that row's button height; the desktop list is unchanged [D910].
- On a phone the list's day headings and cards take the screen's full width less the margin the filters and search box above them have [D1293].
- On a phone the Inputs page's tab row (Inputs · SANS · Medical) sits 4px under the app's top bar, as the Leave War's does, so the tabs stand in the same place on both pages [D1280].
- The "OIL?" sign: a small outlined "OIL?" tag on an input card's top line, left of the hours, where nobody has answered its OIL question — a day opened on the calendar and the list on a phone; the desktop list's "OIL?" button shows for an input of several people too; the month's bars get nothing [D777].
- Undo and Redo name what they take back by person and kind — "Undid: Drifter's ISR brief", "Undo — Ranger's OL" — and several at once by count, "Undid: 3 inputs", never "a personal input" [D1582].

### The Inputs and SANS calendars' month
- Three tabs across the top — Inputs, SANS, Medical — less tall, one place reaching all three, each calendar opening on its calendar; Inputs keeps its List; SANS availability is filed on the SANS calendar only, which has no list [D620, D626, D630, D576].
- The two calendars' top rows are built as drawn: on a desktop one row — the tabs, then ‹ month › and Today in the same place on both, then at the right end Inputs' Calendar / List, filters and gear, or SANS' Highlight and gear; the month's name in the Inputs style on both, desktop and phone; the buttons 36 tall [D1125, D1123].
- On the Inputs calendar's top row the filters and gear move as one group, at its right end where the row holds one line; where it wraps they start the second line at its left, together, so the gear is never alone and never under an open input window; from 1340 to 1439 wide the search box is a little narrower, so 1366 holds one line; a phone's row is unchanged [D1702, D1708].
- The month's title wears the small cyan ▾ of Jump to a date's title; a tap opens the app's own floating calendar on its month and year wheels: the month follows the wheels, a tap outside closes it, ‹ › and Today stay as they are [D1562, D1560].
- The row of buttons under the three tabs is drawn as tall as the tabs, not taller — on a phone 36, each button still answering a finger over 44; the month itself fills the screen as below [D698, D653, D664, D1386, D1396].
- On a phone the inputs calendar's month arrows, name and Today stand at the left of their row, as on the SANS calendar, the calendar / list switch at the right end, in the same place on the Calendar and the List, never moving under the finger that pressed it [D705, D687].
- On a phone the filter button and gear stay where they are when the filters open: the fields open on their own line under the row, and nothing on the row moves [D693].
- On a phone the month — Inputs and SANS alike — takes the full screen to its foot, fits whatever height the phone gives and is never a short box scrolled inside the page; the inputs month draws thin bars; expanded (⤢ at the end of the "How this works" row) its weeks grow as tall as their inputs need and the page scrolls, remembered per person [D653, D664, D1386, D1396, D698].
- The calendar's bars take the Leave War's colour for each kind, so a leave, an OIL, a course, an overseas duty or a medical looks the same on both pages; duties and other commitments are outlined — a dark bar, a light edge, light words [D1304, D1321, D1384, D1396].
- A drag across days held at the month's edge turns to the next month, or the last at the other edge, and the pick carries on into it, so a run of days crosses a month's end in one drag; a note or puck dragged in an opened day scrolls the day's list at its edge, and a column heading on Quals scrolls its table sideways [D897, D893].
- Four more drags follow the edge: the SANS calendar's pick across days turns the month; the Tracker's ▣ select box pans the chart in Edit chart layout; the Tracker's ⇅ Reorder list and the people picker's drag across faces scroll their list [D900].
- The month's bar wears only the plain just-added ring, no glowing landing flash; the desktop list draws one box round the whole row, not one round each cell; "OIL answer saved" stays; a man dragged off an input's row stays silent [D861].
- No "Input added" note where a new input is seen arriving, nor "Input updated" where the changed input is in view — its card wears the Scheduler Board's just-added mark; "Schedule updated" after the Board's ✓ done goes, nothing in its place; a puck's drop says nothing, the puck being the sign [D851, D854].

### A day opened on the Inputs calendar
- On a phone it opens tall, nearly the full screen; its "Day title" box and "+ Input" are slightly shorter; "+ Note" sits in its top bar right of the date, the separate "+ Pucks" gone since a note carries its own pucks [D683, D684].
- On a phone it runs edge to edge, its cards as far from the screen's edges as the list's; on it and on the list each card's small square wears its kind's colour, matching its bar and its Leave War box, outlined for a commitment [D1396, D1385, D1384].
- A note and its people are drawn compact, so what stands above the day's inputs never pushes them far down: the note carrying its own pucks is drawing A — four across under its words, the words' line no taller than a note's typing box [D688, D692, D684].
- In that note four pucks in a row have the same room on the right as on the left, the last never touching the border — found by moving the six dots and the box's left edge a little to the left [D694].
- A note may hold people and no words: then it has no line of words — its people, the "+", its pencil and cross — and the pencil adds words later [D695].
- A person is taken off a note as off a row of pucks: his puck dragged off it, or onto another puck to swap places [D689].
- Each input takes less height, so more show without scrolling — his direction, drawn for him first [D696].

### An input's window and its card
- A new input's window opens with OL as its type; where OL cannot be filed the window keeps its own start — several people, which never takes leave, and SANS "+ Commitment"; "+ Medical" opens ATT C [D917, D968].
- What is still to be filled — the time, the remarks — stands above the calendar for every kind and every way the window opens, the calendar showing below [D920, D916].
- The title box's pencil is inside the box at its right end, in the box's grey: the app's one solid pencil, never the ✏ emoji; the box keeps its full width and a tap on the pencil is a tap on the box [D919, D1134].
- The remarks box holds only what a person types; "till <date>" is never written into it — it shows in grey after the box from the input's dates, and every screen prints the remark then "till <date>" from the dates; a one-day duty or other commitment prints none; the card leaves the automatic till out of its remark [D948, D728].
- The till date has a tick box before the grey date, on by default except for a one-day duty or other commitment, the default following the dates, the person free to turn it either way; unticked, the date is struck through and no screen prints it; a date change that changes the default resets it; on a published day a change reads pending; whoever may change the input may tick it [D953, D952].
- On a phone the window on the Inputs page — "+ Input" or a tap on an input — stands in the middle of the screen, as the schedule's does, opening in the same place from every page [D996].
- On a phone the days of the window's calendar are a finger's size, as the list's pencil calendar had [D725].
- A cancelled input's window says so, read only: the small red CX tag and its reason in red, following the title, not the ✕; the input keeps its place in the day's order [D771, D849, D768].
- The input window's unsaved-changes question is design C, a card hanging from its ✕ — so too "Open the other input and lose them?", "Delete this input for all N people?" and "Take yourself out of this input?"; the rule itself is on the Screen design page [D1624, D1626, D1627, D1628].
- For an Other the window asks once where it goes, Ground Programme or Unavailable, with no separate tick, a grey line under the choice saying what the Leave War does with it; the buttons are look C — the picked one solid in its colour (amber, red) with dark words, the other its words in its colour, ordinary letters, 36px [D1368, D1369, D1367].
- "Fly with" is renamed "Attach", its window holding one short "To" box shown in its name on the schedule — "Attach · 145 Sqn"; an Attach, like a course (CSE), lands under the schedule's Unavailable list by itself and counts him out on the Leave War, its filer not asked; a course a scheduler rejects counts him back in [D1373, D1374, D1372, D1381].
- An input filed for a weekend no Leave War period covers asks its OIL question and saves the answer as on any day, never creating or offering a period; the OIL shows on the Leave War, his count and OIL earned once a period holds that date; the question says nothing about the missing period — the scheduler is told on the schedule [D1578, D1585, D19].
- The card, for the opened day and the list: a top line of who, the kind in small grey capitals, late and the hours; the title at the left on its own row, a remark after it; every name of a shared input; "By Saber", not "for Ranger"; on the list a heading a day, no pencil, no cross [D723, D720, D724].

### The people picker
- One person from an A-to-Z list by default; a switch for several shows the pucks in groups — Pilots, WSOs, SANS (a SANS man under SANS only), each A to Z, drawn compact — and a fourth, "Personnel", for ground crew, only where the roster holds ground crew [D656, D659].

### The SANS calendar
- Each date shows, as pilots / WSOs, how many more are still needed to fly — the Leave War's PAX required, less those it shows available, less the SANS committed to fly — and how many SANS have committed to F, O and A; the requirement and shortage colours are for flying only [D617, D581, D570].
- The days are coloured in three steps — yellow, amber, red — set by an admin from the gear, one setting for the squadron; the date cell keeps the first mock-ups' soft wash, the still-needed pair in its colour, in lined-up columns, pilots left, WSOs right [D618, D630, D626].
- The day's requirement is two figures, pilots and WSOs, so a squadron of partly single-seat aircraft sets them apart; one number typed can fill both [D622].
- A picker at the top chooses one SANS person, and every day he has committed to wears a cyan ring, the letters he offered underlined, with no second chooser for F, O or A [D619, D626, D630].
- A day opened on it lists everyone and scrolls, no "+ more"; on a phone it opens tall, its top bar bringing it down to two-thirds and back; each man is the schedule's own puck, its CAT chip attached, the puck smaller, in proportion with the words beside it [D648, D707, D647, D649, D650].
- Each line of the SANS day is laid out as drawing B: who placed it beside a short remark and under a long one, at the line's right end, the small print shortened to name, date and time — "Grit · 12 Jul, 14:42" — with a little less padding [D701].
- On a phone its "How this works" and colour key share one line, as the inputs calendar's do, the key's words shortened; "One commitment a day each." is gone from it, its last line the late cut-off alone, in bold [D697, D704].

### The Calendar window and the year's days
- A day is day flying by default, night flying, or no fly — exactly one; an NF day needs nobody, its counters 0, "NF", in step with the Leave War; public holidays (green) and off days show on the SANS and inputs calendars from one record; the sun and moon on the SANS calendar only [D627, D631, D633, D636, D638, D577].
- The baseline is set once: no-fly days repeat — Every Thursday from a date, no end; the holidays are seen and set in one list; each date carries its own select button, no normal-week view; the required pilots and WSOs are typed on the Leave War's own columns [D631, D633, D636, D638].
- On the days month a phone date carries one stepping button, a desktop date three; a weekday's heading sets repeating days; a public holiday and an off day each have two doors onto one record — the Leave War's Event row and the Holidays list; No Leave is on the Leave War only [D638].
- It stays open when he changes page, closing only with its ✕ or Escape, opened from several places and belonging to no one page [D1623].
- "Every <weekday>"'s from date and Until's "A date" are the app's own date field opening the app's own calendar, never the phone's box; any date may be picked, the weekday standing out [D795, D796].
- On a phone a sideways swipe anywhere on its month changes the month, on the Holidays list the year, never pressing a date; the "Every <weekday>" from box fits at any phone width [D786, D795, D796].
- The holiday form picks its dates on the Leave War Event sheet's one-calendar picker — a tap for the start, a tap for the end; its "Add a day" form carries the short form "On grid" beside the name [D671, D652].

### The late cut-off
- It is set as a number of days or as a weekday of a number of weeks before, behind each calendar's own gear (the SANS calendar and the Inputs calendar each their own), the Logic page listing both; it is the end of its day; the desktop inputs month is compact, no roomy / compact switch; "How this works" states it as set, nothing more [D628, D639, D646, D632].
- "How this works" states the cut-off as set — in bold — and nothing more: no worked example, no "later than that is marked late" [D646, D691, D628, D639].

### The Medical tab
- Built as drawn: no "Medical" heading, the "as of" button in the row under the tabs at 36; a card is its puck, then the kind and period on one row ("ATT C 13–17 Jul"); pending upchit drops "was down"; the period a range (Upchit Complete its one day), no placed line; nothing else on the tab changes [D965, D961, D927, D960, D967, D977, D968, D1137, D1300].
- "+ Medical", a filled cyan button, opens the same window as the Inputs tab with a medical kind set, the Inputs tab keeping its own door; on a phone it stands first at the left of its row; on a desktop at the right, its window clear of the cards, the new card wearing the plain just-added ring a few seconds [D963, D1137, D1300].
- The frame round the tab goes, its three sections keeping their boxes; the Inputs list's dates button wears the app's line calendar, not the 📅 emoji; on a desktop "+ Medical" stands at the right [D1137, D1300].
- Every card is one even width in all three sections — a third of the row on a phone, one fixed width on a desktop, words wrapping inside; two or more documents show one page drawing and the number, one document none [D977, D967].
- The words pass round 3: the Medical tab's grey lines under "medically down" and "pending upchit" go; help's "report a problem" line reads "spotted something wrong, or something that could work better? The schedulers see every report."; an empty bug-reports card says "no reports yet." [D959].
- The upchit and medical-clash questions lose the waiting-button hint and the small print, a day holding one status said another way; their answers sit flat [D848, D849].

## Done once — kept until he archives them
- The inputs / SANS design was accepted as shown, its build started in the next chat; the handoff explained his intent for a fresh challenge; the design was shown on desktop and phone, vetted, the header simplified with the design skill [D657, D584, D583, D582].
- A calendar view for Member Inputs beside the SANS calendar was designed, the entry flow recommended before building [D574].
- Ideas shown in the mock-ups: bars as Google calendar does, a drag across dates, a fold of instructions, keyboard use; bars and the drag were chosen [D621, D626, D630, D628, D639, D646].
- A SANS flying calendar: demand from the Leave War, three colours, each person counted once with his hours; members see day commitments and add their own with custom times; remarks have no placeholder; the counts for flying only [D569, D570, D617, D618, D572].
- In the calendar job's bug check each approved mock-up was set beside a picture of the built screen at the same size [D624].
- "Attach" was built with its batch, one full check with the "Other" work [D1376].

## Built, held by tests
- Built, held by tests (each named by a test that holds it whole; the detail is in the app and its full row): D572, D649, D651, D675, D685, D707, D732, D768, D773, D879, D968, D999, D1022, D1023, D1179, D1581, D1622.

## From other areas (each stated on its own area's file)
- The Leave War's Other, which goes to the Ground Programme or to Unavailable: D1356.
- The scheduler's one rule of a row that came from an input, and its people: D755, D756, D757, D759.
- The schedule's one row for a shared input — its pucks, time, remark and window: D734, D735, D736, D737, D739, D740, D742, D743, D748, D776.
- A cancelled row's CX cancels the input: D760.
- One row on the schedule, the changes window, the Unavailable list: D661, D662, D663.
- What an input is filed for — ALL, ALL AVAIL, Event, Personal, its title: D702, D711, D713, D714, D716, D717, D778.
- A cancelled input's look on its card, the list and the month's bar: D767.
- The small choices of these pages, answered "yes to all": D731.
- The scheduler's other rulings that reach these pages: D189, D660, D682, D753, D762.
- The late mark: the scheduler's Settled section, the cut-off itself on this page.
- OIL asked and answered on these pages: D781, D782, D783, D793, D470.
- The scheduler's earlier rulings on inputs: D174, D175, D176, D177, D178.
- The one date calendar the whole app shares: D796, D797, D800.
- More of the scheduler's that these pages follow: D641, D686, D703, D706, D769, D1080, D710.
- The Leave War's own pages, which these follow: D891, D890.
- The SANS calendar reads the Leave War's rows of these: D634, D636, D637, D640, D642, D644, D645, D665, D668.
- Settled before, for inputs and admin: the scheduler's Settled section, Inputs & Admin.
- From the Leave War's own work, rulings that govern these pages too — placing leave, the Other, the colours (each on the Leave War's file, or this page's where it is this area's): D1724, D1722, D1565, D1563, D1553, D1552, D1548, D1542, D1501, D1401, D1400, D1399, D1398, D1395, D1397, D1393, D1390, D1389, D1388, D1381, D1380, D1379, D1378, D1371, D1525, D1370, D1365, D1357, D1374, D1372.
- And more from the Leave War's work that these pages follow — the calendars, the people, the windows and the marks: D1354, D1353, D1352, D1350, D1328, D1327, D1323, D1322, D1321, D1318, D1317, D1316, D1307, D1299, D1226, D1212, D1211, D1176, D1225, D1175, D1291, D1166, D1177, D1159, D1155, D1500, D1154, D1150, D998, D418.
