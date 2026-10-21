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

# Rulings — the Inputs pages

**Loads by itself** whenever a session reads a file of the Inputs pages (the `paths:` at the top of this file): the
Inputs list and calendar, the SANS calendar, the Calendar window (each date's day, night or no fly; the year's holidays),
an input's own window and its card. The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every
session; the map of every ruling and how to add or retire one: `DECISIONS.md`.
**One line per ruling — its number, its date, the rule as it stands (D390). Its full row** — his words, the readings he
was told, where it lives — **is in `.claude/decisions-full/inputs.md`, never loaded by itself: open it before acting on a
ruling's detail or asking him about it** (`grep -h '^| D… |' .claude/decisions-full/*.md` — the shell; the Grep tool
hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.

**A file of its own since 13 Oct 26 (owner D802 — "All as recommended"):** these lines were moved out of the scheduler's
file whole, by the script, none reworded. **A ruling that governs BOTH an Inputs page and the schedule stayed in
`scheduler.md`** — this file points at it, never the other way round — so:

**Also read** — in `scheduler.md` (it loads with every file under `raptor-port/src/ui`, so with nearly every file this
one loads with): the one rule of a row that came from an input — **D755, D756, D757, D759** (a row that came from an
input IS the input; one record with its people), **D734–D745, D748, D776** (the schedule's one row for a shared input:
its pucks are its people, its time and remark are the input's, a tap opens the input's own window), **D760** (a CX on
its row cancels the input), **D661–D663, D736, D737** (one row; the changes window; the Unavailable list); what an input
is filed FOR — **D700, D702, D711, D713, D714, D716, D717, D778** (ALL / ALL AVAIL; the kind "Event"; a Personal input
like an Event for its people; an input's own title wherever the kind's name stands, and the kind under it on the
schedule's row); a cancelled input's look on its card, the list and the month's bar — **D767** (its place and its
window are here: D768, D771); the small choices of these pages answered "yes to all" — **D731** (it settles a shared
input's OIL line and the day title's Escape too); a request moved to another day — **D468**; a leave stretched or
trimmed over a published day — **D189**; the LATE mark's own rules (it is a mark, not a warning; it measures the
input's last change; downchits are exempt; the Inputs page keeps printing it) — `scheduler.md` §Settled before this
list → The late-input mark (the cut-off's rulings are here: D628, D639); the OIL question an input raises — **D660, D682, D753, D762** (one answer for everyone in it) and, in
`oil.md`, **D780–D783, D793**, and who earns from a request's row — **D18, D46, D470**; inputs on a published day — **D174–D178**; the app's one date calendar — **D796, D797,
D800** (this file keeps the Calendar window's own: D786, D795); the windows of these pages can be dragged and leave the page behind them working — **D641**; every window on a phone —
**D686, D703, D706**;
the bell — **D769**; one tap then typing replaces the SANS settings' and the late cut-off's numbers, as the schedule's time boxes do — **D1080**; a delete's list — **D710**. In `leave-war.md`: **D891** (a day's notes dragged to reorder show ONE
landing bar a gap, as the Leave War's lists do — D890). The Leave War's rows the SANS calendar reads, and its event sheet —
**D634, D636, D637, D640, D642–D645, D665, D668**, in `scheduler.md` too. Settled before the rulings list began (the
Inputs month calendar's day popover, "no repeat-weeks", Manage users on Admin): `scheduler.md` §Settled before this list
→ Inputs & Admin.

**Where the detail lives:** how each surface renders and edits — `raptor-port/docs/ui-contracts.md` (§The Inputs month
calendar, §Days — the month, §The SANS calendar); what a change touches — `raptor-port/docs/feature-impact.md`; what is
stored — `raptor-port/docs/data-schema.md`; the files — `raptor-port/docs/file-map.md`.

| # | Date | The rule |
|---|---|---|
| D1179 | 21 Oct 26 | The Inputs page's type filter can pick a whole family — every kind of leave at once, and every kind of medical — so in one view an admin sees which inputs carry their document and which do not. |
| D1125 | 21 Oct 26 | The Inputs and SANS calendars' top rows are built as drawn: on a desktop one row — the tabs, then ‹ month › and Today in the same place on both, then at the right end Inputs' Calendar / List, filters and gear, or SANS' Highlight and gear; the month's name in the Inputs style on both, desktop and phone; the buttons drawn 36 tall. |
| D1123 | 21 Oct 26 | The Inputs and SANS calendars' top rows are laid out alike, on a desktop as on a phone: the tabs, the month's ‹ name › and Today, and the buttons at the right end in the same places and the same look on both, the month's name in one style; how it is drawn is put to him with pictures before it is built. — changed by D1125 |
| D1096 | 20 Oct 26 | Wherever the app prints a date with its year, the year is two digits — "15 Feb 27" — as the till date does (D1095): the Inputs list's date column and its phone day headings and the LATE mark's note first, and any other place found printing a four-digit year after a date. |
| D1095 | 20 Oct 26 | Where an input's "till <date>" carries its year, the year is two digits — "till 15 Feb 27", not "till 15 Feb 2027" — on every screen and in the input's own window; a last day in the loaded week's own year still carries no year. — changed by D1096 |
| D1025 | 18 Oct 26 | The amber edge down the left of each cut line on the upchit sheet stays as built, and the design checker keeps skipping it there; it is the app's own warning-row mark, not a stripe to remove. |
| D1023 | 18 Oct 26 | Before an upchit moved later or deleted gives a downchit its days back, the upchit sheet also lists each leave and each bid of his that the days given back will cut, one line each, before anything changes; nothing about the cut itself changes. |
| D1022 | 18 Oct 26 | A deleted upchit gives the downchit it cut its days back, as a moved one does (D999): the downchit grows back to the end it had before the cut, never past it and never into another medical of his in the gap; the save sheet says so before anything changes. |
| D999 | 18 Oct 26 | When an upchit is moved to a later date, the downchit it had cut grows back to the day before the new date, never past its own first end, and the upchit's save sheet says so before anything changes; a drag of the upchit on the Inputs calendar does the same. |
| D996 | 18 Oct 26 | On a phone the input's own window on the Inputs page — "+ Input", and a tap on an input — stands in the middle of the screen too, as the schedule's does (D995): the same window opens in the same place from every page. |
| D977 | 17 Oct 26 | Every card on the Medical tab is one even width, in all three sections, so the cards stand in columns that line up from one section to the next: on a phone exactly a third of the row, on a desktop one fixed width; words longer than the card wrap inside it. |
| D968 | 17 Oct 26 | The Medical tab's "+ Medical" opens the input window set to ATT C, the most common medical kind — not the first of the list (HL); the Inputs tab's "+ Input" stays on OL. |
| D967 | 17 Oct 26 | On the Medical tab a card with two or more documents shows one page drawing and the number ("2"), the same in all three sections, and a card with one document shows none; on a phone a card is exactly a third of the row (D977), a long period going on the line under its kind. — changed by D977 |
| D965 | 17 Oct 26 | The Medical tab is built as drawn: a card is its puck, then the kind and period on one row ("ATT C 13–17 Jul"), three a row on a phone; pending upchit drops "was down"; Upchit Complete is the date and one document icon a document; "+ Medical" is a filled cyan button at the "as of" row's right end. — changed by D968, D967, D966 |
| D963 | 17 Oct 26 | The Medical tab gets a "+ Medical" button beside its "as of" button, at that row's height, opening the same input window as the Inputs tab with a medical kind already set; the Inputs tab keeps its own door; the button takes the place of D962's title. |
| D961 | 17 Oct 26 | His direction for the Medical tab's cards: on a phone three cards stand in a row, not two; Upchit Complete's card loses the word "upchitted" (its kind already says upchit); "2 documents" becomes two document icons on the date's row, so the card is two rows. How three fit is drawn for him on the real app before it is built (D853). — changed by D965 |
| D960 | 17 Oct 26 | On the Medical tab's cards the "Placed by <name> · <date>, <time>" line goes, with nothing in its place (a documents mark or typed remark stays), and the card's date line says the period as a range — "15–17 Jul" (Upchit Complete keeps its one day); who placed it and when stays in the input's window. — changed by D966, D965 |
| D959 | 17 Oct 26 | Round 3 of the words pass is built as recommended: the Medical tab's grey lines under "medically down" and "pending upchit" go; help's "report a problem" line reads "spotted something wrong, or something that could work better? The schedulers see every report."; the empty "bug reports" card says "no reports yet." |
| D953 | 17 Oct 26 | The till-date switch is a tick box before the grey date after the remarks box, like the window's "all day" tick; unticked, the date is struck through there and no screen prints it; a date change that changes the default resets it; on a published day a change reads pending; whoever may change the input may tick it. |
| D952 | 17 Oct 26 | Every input carries a switch for its "till <date>": on by default for every kind, except a one-day duty or other commitment (off); the default follows the dates by itself, and the person can still turn it either way. — changed by D953 |
| D948 | 16 Oct 26 | An input's remarks box holds only what a person types; "till <date>" is never typed or written into it — it is shown in grey after the box the moment any input's window opens, from its dates, one-day inputs included; every screen prints the remark then "till <date>" from the dates — a one-day duty or commitment prints none (D951). — changed by D951 |
| D927 | 15 Oct 26 | The Medical tab is built as drawn (D912): its "Medical" heading goes and the "as of" date button stands alone in the row under the tabs at 36 tall; nothing else on the tab changes. |
| D920 | 15 Oct 26 | In an input's window what is still to be filled in — the time, the remarks — stands above the calendar, for every kind of input and every way the window opens; the calendar keeps showing (D916), below them. |
| D919 | 15 Oct 26 | The title box's pencil is inside the box, at its right end, in the box's own grey — a line drawing in the app's icon style, never the ✏ glyph (an emoji on an iPhone); the box keeps its full width and a tap on the pencil is a tap on the box. |
| D917 | 15 Oct 26 | A new input's window opens with OL (overseas leave) as its type — the most common leave — instead of the list's first kind; where OL cannot be filed the window keeps its own start (several people, which never takes leave — D655; SANS "+ Commitment", which is SANS availability). |
| D916 | 15 Oct 26 | No calendar is folded to a dates line: an input's window — and SANS "+ Commitment" — keeps its calendar showing, as built; nothing else is folded, and the design guide carries no such rule. |
| D910 | 15 Oct 26 | On a phone the inputs list's "+ Input" and dates buttons are built in the row of the calendar / list switch, the filter and the gear, as drawn, at that row's button height, in the calendar job; the desktop list is unchanged. |
| D909 | 15 Oct 26 | On a phone an input's window opened from a day may reach the top of the screen and cover the day's bar — left as built: ✕ or cancel shows the day again; the window is not held below the day's bar. |
| D908 | 15 Oct 26 | The inputs list's date pop-up on a small phone is left as built: what runs past the screen's foot is reached by one swipe, which scrolls the page with the pop-up open; the dates stay one size (D901); no scrolling inside the pop-up, no smaller dates. |
| D900 | 15 Oct 26 | Four more drags follow the edge as the others do (the design guide §5A, D895): the SANS calendar's pick across days turns the month at its side, as the inputs month does (D897); the Tracker's ▣ select box pans edit chart layout at its edge (D899); the Tracker's ⇅ Reorder list and the people picker's drag across faces scroll their list. |
| D897 | 15 Oct 26 | On the inputs month calendar, a drag across days held at the month's edge turns to the next month — or the last, at the other edge — and the pick carries on into it, so a run of days can cross a month's end in one drag. — changed by D898 |
| D893 | 15 Oct 26 | A note or a puck dragged in a day opened on the Inputs calendar, and a column heading dragged on Quals, scroll what they sit in when carried to its edge — the day's list up and down, Quals' table sideways — as the Leave War's Rearrange now does (D892); built on the same branch, one "merge live". |
| D879 | 15 Oct 26 | The picked person's chip in the inputs calendar's "Add people" window loses its glow and keeps its thin blue ring, as the Scheduler Board's marks did (D877). |
| D861 | 15 Oct 26 | The month's bar wears only the plain just-added ring — no glowing landing flash before it; the desktop Inputs list draws one box round the whole row, not one round each cell, so the mark is the same everywhere; "OIL answer saved" stays; a man dragged off an input's row stays silent. |
| D854 | 14 Oct 26 | Three more passing notes go: "Input updated" where the changed input is in view — its card wears the just-added mark instead; "Schedule updated" after the Scheduler Board's ✓ done — nothing in its place; and "<name> added to <row>" / "<name> taken out of <row>" on a puck's drop — no mark, the puck is the sign. |
| D851 | 14 Oct 26 | Where a new input can be seen arriving no "Input added" note is shown and its card wears the Scheduler Board's just-added mark; and the leftovers are built in the next chat on the same branch without merging first — one "merge live" then carries the three builds and the leftovers together. |
| D849 | 14 Oct 26 | Two of the three leftover questions are answered yes, as drawn: (2) in a cancelled input's own window the red CX tag and its reason follow the title, not the ✕; (3) the answers of the upchit question and the medical-clash question sit flat — no darker patch, no line under them. |
| D848 | 14 Oct 26 | The three texts are deleted — the waiting-button hint on the upchit question and on the medical-clash question, and the medical-clash question's small print — and the one fact he wants kept, that a day holds one status, is said some other way on that sheet. |
| D795 | 13 Oct 26 | In the Calendar window, as drawn: "Every <weekday>"'s from date and Until's "A date" are the app's own date field, opening the app's own calendar (D796) — not the phone's date box; any date may be picked, the weekday standing out; the swipe is the inputs calendar's, anywhere on the month or the Holidays list, and never presses a date's button. — changed by D796 |
| D792 | 13 Oct 26 | "Delete" in an input’s own window deletes at once and asks nothing — as built; undo brings the input back — save an upchit whose delete gives a downchit its days back, which asks first on the upchit sheet (D1022). — changed by D1022 |
| D786 | 13 Oct 26 | In the Calendar window on a phone, a swipe sideways on the month goes to the next or the last month, and on the Holidays list to the next or the last year; and the "Every <weekday>" window’s from date box fits inside the window at any phone width. |
| D777 | 12 Oct 26 | The "OIL?" sign is approved as drawn: on an input's card — a day opened on the Inputs calendar, and the Inputs list on a phone — a small outlined "OIL?" tag on the top line, left of the hours, where nobody has answered its OIL question; and the desktop list's "OIL?" button shows for an input of several people too. The month's bars get nothing. |
| D773 | 12 Oct 26 | The inputs list's "Export to Excel" button and the file it writes are removed — he does not need an export of inputs. |
| D771 | 12 Oct 26 | A cancelled input's own window says it is cancelled: the same small red CX tag and its reason in red, beside the window's title — read only. |
| D770 | 12 Oct 26 | A person who is the only named person in an input that also holds ALL AVAIL or ALL reads the input and may take himself out, but does not change it for everyone — whoever filed it, or a scheduler, does. |
| D768 | 12 Oct 26 | A cancelled input keeps its place in the day's order on the Inputs calendar — it is not sorted last, on a phone or a desktop. |
| D763 | 11 Oct 26 | Who is in an input is changed only by whoever filed it or by a scheduler: a person who is in a shared input he did not file does not add anyone to it — he may always take himself out. |
| D732 | 10 Oct 26 | Escape while the day's title is being typed puts the title back as it was and leaves the day open; a second Escape closes the day — the same manners as a planning note's box (D731 (9)). |
| D729 | 10 Oct 26 | The design vet's five changes to the Inputs calendar and list are approved as drawn: the list's own add form becomes one "+ Input" button; the desktop list says "By Saber" only where someone else filed it; the window's instructions go; a shared bar leads with its count and a timed bar is lighter; the settings and small words are shorter. |
| D728 | 10 Oct 26 | On an input's card the automatic "till <date>" is left out of the remark — the card's corner already says it; and later, as its own job, the app stops writing "till <date>" into remarks and every screen prints it from the input's own dates. |
| D727 | 10 Oct 26 | On the desktop Inputs list a shared input names everyone in it — never "Drifter +3" — and the kind keeps its pill there (drawing A). |
| D725 | 10 Oct 26 | On a phone the days of the calendar in an input's window are made bigger — a finger's size, as the inputs list's pencil calendar had. |
| D724 | 10 Oct 26 | On the card of an input filed for several people, who filed it is always said — "By Saber" — even where the filer is one of the people in it. |
| D723 | 10 Oct 26 | The input card is approved as pictured, for the opened day and the list: a top line (who, the kind in small grey capitals, late, the hours); the title at the left on its own row, a remark after it; every name of a shared input; "By Saber" where someone else placed it or it is for several people; on the list a heading a day, no pencil, no cross. — changed by D724 |
| D722 | 10 Oct 26 | On an input's card the title always starts at the left, on a row of its own — never trailing after the names and the kind on their line. |
| D721 | 10 Oct 26 | His direction: on an input's card, the people of a shared input are all named — the names wrap and the card grows downward — never "+1" hiding who is in it. A mock-up is put to him; not built until he chooses. |
| D720 | 9 Oct 26 | On an input's card the small print says "By Saber" — not "for Ranger": the card already names the person it is for, and the room is saved. |
| D719 | 9 Oct 26 | What an input's card must do, in his words: stay short; and a long title or a long remark is never cut off by what stands at its right — it wraps and the card grows downward. Ideas are put to him as a proper mock-up before anything is built. |
| D712 | 9 Oct 26 | ALL / ALL AVAIL is not offered for a "Fly with" or a "Personal" input — only for Training, meeting, appointment, duty and other. — changed by D778 |
| D709 | 9 Oct 26 | A note of words alone keeps its small "+" (add people) beside its pencil and cross — as built. |
| D707 | 9 Oct 26 | On a phone a day opened on the SANS calendar opens tall — nearly the full screen — as a day opened on the Inputs calendar does (D683); its top bar still brings it down to two-thirds and back. |
| D705 | 9 Oct 26 | On a phone the inputs calendar’s month arrows, month name and "today" stand at the left of their row, in the same places as on the SANS calendar; the calendar / list switch moves to their right. |
| D704 | 9 Oct 26 | "One commitment a day each." Is removed from the SANS calendar’s "How this works": its last line is the late cut-off alone, the cut-off in bold (D691). |
| D701 | 9 Oct 26 | The shorter input is drawing B: "Placed by" beside a short remark and under a long one, at the card’s right end (D699), with the small print shortened to the name, the date and the time — "Grit · 12 Jul, 14:42" — and a little less padding in each card; a day opened on the SANS calendar is laid out the same way. |
| D698 | 9 Oct 26 | On the Inputs calendar and the SANS calendar the row of buttons under the three tabs — the calendar / list switch, the month’s arrows and name, today, the filter or highlight button, the gear — is drawn as tall as the tabs above it, not taller. |
| D697 | 9 Oct 26 | On a phone the SANS calendar’s "How this works" and its colour key share one line, as the inputs calendar’s do — the same height above the month and the same alignment on both calendars; the key’s words are shortened to fit. |
| D696 | 9 Oct 26 | His direction: in a day opened on the Inputs calendar each input takes less height — fewer lines a card, or its words shortened — so more inputs show without scrolling; a drawing with ways to do it is put to him before it is built. |
| D695 | 9 Oct 26 | A note may hold people and no words: it is then drawn with no line of words at all — its people, the "+", and the note’s pencil and cross — and the pencil adds words later. |
| D694 | 9 Oct 26 | In the note that carries its own pucks, four pucks in a row sit with the same room on the right as on the left — the last puck never touches the box’s border; the room is found by moving the six dots, and the box’s left edge, a little to the left. |
| D693 | 9 Oct 26 | On a phone the filter button and the settings gear stay where they are when the filters are opened — the filter fields open on their own line under the row, and nothing on the row moves. |
| D692 | 9 Oct 26 | The note that carries its own pucks is drawing A — compact, its people shown four across under its words — and the line that holds its words is slimmer still: no taller than the box a note is typed in. |
| D691 | 9 Oct 26 | In "How this works", the late cut-off as it is set is in bold — "the end of the Wednesday two weeks before" — so the one thing a man must remember stands out of the sentence. |
| D689 | 9 Oct 26 | A person is taken off a note as he is taken off a row of pucks today — his puck dragged off it, or onto another puck to swap places; nothing new to learn. |
| D688 | 9 Oct 26 | In a day opened on the Inputs calendar, a note and its people are drawn compact: what stands above the day’s inputs must not push them far down the window — a day will hold many inputs, and nobody should have to scroll a long way to reach them. |
| D687 | 9 Oct 26 | The calendar / list switch on the Inputs tab stays in the same place whichever of the two is shown — it never moves under the finger that pressed it. — changed by D705 |
| D685 | 9 Oct 26 | In the people picker, dragging across the pucks picks every puck the finger or the mouse passes over — not one tap for each. |
| D684 | 9 Oct 26 | His direction, said as "perhaps": in a day opened on the Inputs calendar a note carries its own pucks — people are added on the note that was written — and the separate "+ Pucks" button goes; a picture is put to him before it is built. |
| D683 | 9 Oct 26 | On a phone a day opened on the Inputs calendar opens tall — nearly the full screen, not two-thirds high; its "Day title" box and its "+ Input" button are slightly shorter; and "+ Note" and "+ Pucks" sit in the window’s top bar, to the right of the date. |
| D681 | 9 Oct 26 | A saved shared input’s dates can be changed — in the input’s own window, by whoever may change the input, for everyone in it at once — and this is built before the calendar job’s "merge live". |
| D675 | 8 Oct 26 | The window that sets each date's day, night or no fly and the year's holidays is called "Calendar" on screen — not "days". |
| D671 | 8 Oct 26 | The holiday form in days picks its dates on the same one-calendar picker as the Leave War's Event sheet — a tap for the start, a tap for the end — not two date boxes. |
| D664 | 7 Oct 26 | On a phone the calendar — the SANS calendar and the Inputs calendar alike — is never a short box scrolled inside the page: the month takes the phone's full screen, down to its foot. |
| D659 | 7 Oct 26 | The "Several people" picker has a fourth heading, "Personnel", for ground crew — shown only where the roster holds ground crew — so an input for everyone is one filing. |
| D658 | 7 Oct 26 | A member never files SANS availability for another man — a SANS member files his own only; an admin may file it for one SANS man or for several at once. |
| D657 | 7 Oct 26 | The design of the inputs and SANS calendar job is accepted as shown on the "what we decided" page, and the build starts in the next chat. |
| D656 | 7 Oct 26 | The person picker is a hybrid: by default one person from an A-to-Z list, as today; a switch for several people then shows the pucks in groups — pilots, WSOs and SANS, and personnel where the roster holds ground crew (D659) — each in A-to-Z order, drawn compact to save space. — changed by D659 |
| D655 | 7 Oct 26 | A member may file for other people only duties and commitments — never leave, never medical, never SANS availability (D658); a group filing is one shared input, shown and edited as one thing for everyone in it; the man himself, whoever filed it and an admin may change or delete it. — changed by D763, D762, D660, D658 |
| D653 | 7 Oct 26 | On a phone the inputs month fills the screen's height and draws its inputs as thin bars, so more show in a day — and it fits itself to whatever height the phone gives, never built for one screen. — changed by D698, D664 |
| D652 | 7 Oct 26 | The Holidays list's "Add a day" form carries the short form too — "On grid" beside the name — because it writes the same record the Leave War's Event sheet does. |
| D651 | 7 Oct 26 | A SANS person's puck wears the SANS purple edge on its right on the SANS calendar too — exactly as it does on the schedule. |
| D650 | 7 Oct 26 | The puck on the SANS day is smaller — in proportion with the letters and the small print beside it, not the biggest thing on the row. |
| D649 | 7 Oct 26 | On the SANS day each person is the schedule's own puck — the CAT chip attached to its end, every puck the same size — not a name with a separate badge. |
| D648 | 7 Oct 26 | A day opened on the SANS calendar lists everyone and scrolls — no "+ more" line; it does not open full screen, but on a phone it can be pulled up by its top bar to nearly the full screen and back down. — changed by D707 |
| D647 | 7 Oct 26 | On the SANS calendar's opened day each committed person is shown as his puck with his CAT — not a bare name — so an instructor is told from the rest at a glance. — changed by D649 |
| D646 | 7 Oct 26 | "How this works" is shorter: the worked example ("for the week of … that is …") and "later than that is marked late" go — the cut-off line only states the rule as it is set. |
| D639 | 7 Oct 26 | The late cut-off is set behind each calendar's own settings gear — the SANS calendar and the Inputs calendar each have their own — and the Logic page lists both; a cut-off is the end of its day; the desktop inputs month is compact, with no roomy / compact switch. |
| D638 | 7 Oct 26 | On the days month a phone date carries one button that steps day, night, no fly and a desktop date three buttons; three choices are enough — no "day and night"; a weekday's heading sets repeating days; a public holiday and an off day each have two doors onto one record — the Leave War's Event row, the Holidays list; no leave: the Leave War only. |
| D635 | 7 Oct 26 | The settings icon must read as a gear — the app's own cog — and never like a Sun, because on these calendars the Sun means day flying. |
| D633 | 7 Oct 26 | The month carries a select button on every day — day, night or no fly, chosen right on the date, as in his reference — so there is no separate normal-week view; and the required pilots and WSOs are set on the Leave War's own columns. — changed by D638, D636 |
| D632 | 7 Oct 26 | On a desktop the Inputs calendar shows more inputs in each day — smaller text and shorter bars — because there is room: compact, with no roomy / compact switch (D639). — changed by D639 |
| D631 | 7 Oct 26 | The baseline is set once, not day by day: a day is day flying by default unless night is selected; no-fly days can repeat — Every Thursday from a date onward, with no end; the year's public holidays are seen and set in one list; the doors — one, or a few for convenience — are chosen by counting the admin's steps. — changed by D633 |
| D630 | 7 Oct 26 | The SANS date cell keeps the first mock-ups' colours — a soft yellow, amber or red wash over the day, the still-needed pair in that colour — not the deep tints and the solid bright patch of the second set, which were too much contrast. |
| D629 | 7 Oct 26 | Every input and every SANS commitment shows, in small print, who placed it and on what day and at what time. — changed by D960, D729, D723, D720 |
| D628 | 7 Oct 26 | The late cut-off can be set either as a number of days or as a weekday of a number of weeks before (for example the Wednesday two weeks prior), and the "How this works" text on a calendar always states the cut-off as it is set — it changes when the setting changes. — changed by D646, D639 |
| D627 | 7 Oct 26 | A day is classed day flying, night flying or no fly (NF): an NF day needs nobody to fly, so its counters read 0 and it shows "NF", in step with the Leave War; public holidays (green, as on the Leave War) and off days show on the SANS and the inputs calendars too, from the one record; day or night shows on the SANS calendar only. — changed by D638, D631 |
| D626 | 7 Oct 26 | His picks from the first mock-ups: the date cell with lined-up columns (pilots left, WSOs right), in the first set's own colours (D630); three tabs across the top (Inputs, SANS, Medical), less tall; inputs drawn as bars, as Google calendar does; the rest of the drawings stand as drawn. — changed by D630 |
| D624 | 7 Oct 26 | In the inputs / SANS calendar's bug check, each approved mock-up is set beside a picture of the built screen at the same size, in the check's evidence — so he and the reviewers compare the two directly instead of trusting the builder's eye. |
| D622 | 7 Oct 26 | The day's requirement is kept as two figures — pilots required and WSOs required — so a squadron whose aircraft are partly single-seat can set them apart; one number typed can still fill both. |
| D621 | 7 Oct 26 | Of the ideas he wanted drawn: inputs are bars, as Google calendar does, and several days are picked by dragging on the calendar (D626); the instructions fold stays and states the late cut-off as set (D628); the keyboard set — arrows, enter, delete, Escape — stands as drawn. — changed by D628, D626 |
| D620 | 7 Oct 26 | One place reaches medical, the SANS calendar and the Inputs calendar — three tabs across the top, less tall (D626) — each calendar opening on its calendar; inputs keeps its list; SANS availability leaves the list and is filed on the SANS calendar only, which has no list of its own; mock-ups come before any build. — changed by D626 |
| D619 | 7 Oct 26 | The SANS calendar has a picker at the top to choose one SANS person; every day he has committed to then wears a cyan ring, the letters he offered underlined — no second chooser for F, O or A (D626). — changed by D626 |
| D618 | 7 Oct 26 | The SANS calendar's days are coloured in three steps — yellow, amber, red — and an admin sets the three from a settings icon at the top of the calendar; the setting is one for the whole squadron. |
| D617 | 7 Oct 26 | Each SANS calendar date shows, as pilots / WSOs, how many more are still needed to fly and how many SANS have committed to F, O and A — as his reference does, unless a better idea shown to him is chosen. Still needed = the Leave War's admin-set PAX required, less those the Leave War shows available, less the SANS committed to fly. |
| D584 | 5 Oct 26 | The Claude handoff must explain the owner's product intent and context so Claude can challenge how to tackle the change with fresh eyes. |
| D583 | 5 Oct 26 | Show the finished inputs/SANS design on desktop and mobile, then bring it to Claude for vetting. |
| D582 | 5 Oct 26 | Simplify the Inputs page's entry and header hierarchy using Impeccable; the current stack of large controls is too cluttered. |
| D581 | 5 Oct 26 | Show the daily F/O/a availability counts on every SANS calendar date — each as pilots / WSOs (D617). — changed by D617 |
| D577 | 5 Oct 26 | On the SANS calendar, Sun means day flying and moon means night flying — shown there only, not on the Leave War or the Inputs calendar (D627). — changed by D627 |
| D576 | 5 Oct 26 | Keep the current Inputs list as a secondary view of inputs; SANS availability leaves the list and is filed on the SANS calendar only (D620). — changed by D620 |
| D574 | 5 Oct 26 | Design a calendar view for Member Inputs alongside the SANS calendar, with day details, + input and multi-day date selection; recommend the entry flow before implementing it. |
| D572 | 5 Oct 26 | Count each person offering flying once for the day, even for a short commitment; show their available hours. |
| D570 | 5 Oct 26 | The SANS calendar's daily requirement and shortage colours are for flying only. |
| D569 | 5 Oct 26 | Add a SANS flying calendar: the day's demand comes from the Leave War, for pilots and WSOs each (D617), with editable yellow / amber / red baselines by how many more are needed (D618). Count each person once with their hours visible; members see day commitments and add their own with custom times. Remarks has no placeholder. — changed by D618, D617, D573, D572, D571, D570 |
| D547 | 4 Oct 26 | The new input popup is reachable by scrolling on the owner's iPhone and needs no fix for that behaviour. |
| D364 | 29 Sep 26 | Another person's input, opened read only, draws its locked fields as values — no box, no arrow, tick boxes and buttons dimmed, not removed — kept as built. |
