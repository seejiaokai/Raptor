# The Inputs trial — the sorting table (9 Nov 26, D1943)

Step 1 of `2026-11-09-inputs-trial-brief.md`: each of the 165 rulings of the Inputs list at b87243496, sorted by the
Tracker trial's strict test — a ruling leaves for the "Built, held by tests" line only where a test asserts every part
of its rule (its conditions, exceptions, exclusions, scope, the words he chose); a test that only names it, holds an
example of a principle, or holds some of its parts leaves it stated. Unsure meant stated. "Named by" gives the first
test that names it; a ruling's other tests are found by `node scripts/rulecheck.mjs`'s finder.

Counts: 165 rulings — 17 held whole by tests, 148 stated on the page (1 not built, 9 spent or history, 12 settled,
15 standing, 9 answered directions stated with the ruling that answered them, the rest built with their tests holding
only part, or none).

**After the two blind reads (9 Nov 26, `2026-11-09-inputs-trial-fixes.md`):** 11 held whole by tests, 154 stated — six
came off the held line (D649, D651, D707, D968, D1179, D1622), and D569 and D621 became standing and left the archive
proposal (7 spent or history, 17 standing). The rows below carry a "read 9 Nov 26" note where they changed.

## The 17 held whole, and the test read (as first sorted — six struck off by the reads, marked)

- D572 — sansfly.test.ts (once a day, two filings or a short commitment one man), sanscal-model.test.ts (his hours).
- ~~D649, D651~~ (struck 9 Nov 26: the chip checked only if he has a CAT, one puck's size, the edge a class — Opus 10, Astra 5) — sansday.test.tsx "each man is the schedule's own puck": one fixed size, the CAT chip, the SANS edge.
- D675 — dayswindow.test.tsx (title and label "Calendar"), inputssettings.test.tsx ("Calendar…" door), daysline.test.tsx.
- D685 — peoplepick.test.tsx (mouse both ways, un-pick, never the last, a vertical finger scrolls), e2e inputs-calendar.spec.ts (a real finger).
- ~~D707~~ (struck 9 Nov 26: the lowered height bounded above only — Astra 7) — sansday.test.tsx (opens tall; the bar brings it down and back), e2e inputs-sans-calendar.spec.ts.
- D732 — batch2.test.tsx, e2e inputs-batch2.spec.ts (first Escape puts back, the day stays; second closes).
- D768 — inputcx.test.tsx (the model's order), inputcx-scenarios.test.tsx (opened day and phone list keep the place).
- D773 — inputs.test.tsx (no export control, no export button), inputs-calendar-flow.test.tsx, export.test.ts.
- D879 — glowoff-css.test.ts (the picked chip keeps the 1px ring, no blur layer).
- ~~D968~~ (struck 9 Nov 26: the "+ Input" half held only by tests that do not name it — Opus 10) — medicalview.test.tsx ("+ Medical" opens ATT C for admin and member); "+ Input" staying OL by inputnewdefaults' D917 cases.
- D999 — medwrite.test.ts (grows to the day before, never past the first end, plan before write), upchitcuts.test.tsx (the calendar drag and the window's Save, the sheet first).
- D1022 — medwrite.test.ts (back to the first end, stops short of another medical, one Undo), upchitdelete.test.tsx (the sheet says so before anything changes).
- D1023 — upchitcuts.test.tsx (each leave and each bid one line, nothing written by asking, a give-back cutting nothing lists nothing).
- ~~D1179~~ (struck 9 Nov 26: two kinds of each family only — Astra 1) — inputs-docs.test.tsx ("All leave", "All medical" pick their families).
- D1581 — caldrag.test.tsx (Escape while carried: the ghost goes, nothing moves, no tap).
- ~~D1622~~ (struck 9 Nov 26: the question's words never asserted — Astra 6) — inputskeys.test.tsx (✕ asks Escape's question; Keep editing; Discard; nothing typed closes; Cancel at once).

## Read and kept stated (their tests hold only part)

D1582 (the words "Undid:" and "Undo —" not asserted, only the names); D917 (the two exceptions not asserted); D1280 (the
tabs' top matched to the Leave War's, not the 4px itself); D770 (the scheduler asserted, not "whoever filed it"); D659
(the heading asserted, not its absence where there is no ground crew); D792 (only the upchit case); the principles and
permissions (D629, D655, D658, D763, D719, D721) are held by examples only (the Tracker readers' lesson, D121); every
layout rule saying "nothing moves", "the phone unchanged" or "any other place" (D1843, D1840, D1702, D1708, D1139, D1096,
D927, D1137, D861, D777) — the unchanged parts are not measured.

## Proposed to archive — his word first (each still stated briefly on the page)

- Spent: D1376 (Attach built with its batch), D657 (design accepted, build next chat), D584, D583, D582 (the handoff,
  the showing and the header of the first design round), D574 (design a calendar view), D624 (that job's bug check).
- ~~History, each part restated by later rulings: D621 (ideas, chosen by D626, D628), D569 (the SANS calendar request,
  restated by D570, D572, D617, D618 — but How we work's batch-order line cites it).~~ Struck 9 Nov 26 by the reads: D569's
  "no faded words on remarks" is restated by none of the four (Opus 3), and D621's fold and keyboard set "stand as drawn"
  on nothing else (Opus 6, Astra 2) — both now standing, stated on the page, not proposed to archive.
- Answered directions, each restated in full by the ruling that answered it (a fresh reader to check each, D971): D1842
  (D1843), D1560 (D1562), D1386 (read 9 Nov 26: its "in place of '+n more'" is not in D1396's own words — the D971 reader to weigh it), D1385, D1384 (D1396), D1367 (D1368, D1369), D1123 (D1125), D961 (D965 — read 9 Nov 26: its "no 'upchitted'" is stated only in D961's answered mark — the D971 reader to weigh it), D1624 (D1626).
- Spent parts inside live rulings (the ruling stays): D851's "built in the next chat, one merge live"; D893's "built on
  the same branch"; D681's "built before the calendar job's merge live"; D910's "in the calendar job".

## The table

| # | In a few words | Kind | Named by (file — test) | Pins it? | Verdict |
|---|---|---|---|---|---|
| D1943 | The Inputs rulings become a page in the Tracker trial's shape: his … | standing | — (no test names it) | no | stated; read 9 Nov 26: "the documents check eased for this page only" put back (Opus 9) |
| D1843 | On a desktop the Inputs list is closed by a thin line … | built | inputs-calendar.spec.ts:1606 | part | stated (Built, stated here) |
| D1842 | His direction: the desktop Inputs list's right end must not look as … | built, through D1843 | inputs-calendar.spec.ts:1606 | part | stated with D1843 |
| D1840 | On a desktop from 821 to 1099 wide, with no input window … | built | inputs-calendar.spec.ts:1571 | part | stated (Built, stated here) |
| D1841 | The safety for smaller screens is part of his D1787 answer: below … | built | — (no test names it) | no test | stated (Built, stated here); read 9 Nov 26: the window over "+ Input" holds at any width, not below 1340 only (Opus 7) |
| D1787 | On a desktop the Inputs list's "+ Input" stands at the right … | built | inputs.test.tsx:112 | part | stated (Built, stated here) |
| D1721 | The Inputs list's cards keep their top line's right-hand marks as they … | standing (leave as built) | — (no test names it) | no | stated (Settled) |
| D1719 | On a desktop the Inputs List's column headings sort from the keyboard … | built | — (no test names it) | no test | stated (Built, stated here) |
| D1708 | Where the Inputs calendar's top row is too narrow for one line, … | built | consistency-heights.spec.ts:92 | part | stated (Built, stated here) |
| D1702 | On the Inputs calendar's top row the filters and the settings gear … | built | inputstabs.test.tsx:141 | part | stated (Built, stated here) |
| D1624 | The input window's unsaved-changes question — "Close it and lose them?", and … | built, through D1626 | — (no test names it) | no | stated with D1626 |
| D1623 | The Calendar window stays open when he changes page; it closes only … | built | — (no test names it) | no test | stated (Built, stated here) |
| D1622 | An input's window with anything typed and not saved asks before ✕ … | built | inputskeys.test.tsx:247 | part — the question's words not asserted | stated (Built, stated here); read 9 Nov 26: off the held line — the tests check the question element, never its words "Close it and lose them?" (Astra 6) |
| D1585 | On the Inputs page the OIL question of a weekend no Leave … | built | — (no test names it) | no test | stated (Built, stated here) |
| D1583 | On a phone held sideways a window over the Inputs or SANS … | standing (leave as built) | sanscal.test.tsx:356 | part | stated (Settled) |
| D1582 | Undo and Redo name the input they take back by its person … | built | undo-wire.test.ts:505 | part | stated (Built, stated here) |
| D1581 | On the Inputs calendar, Escape while a bar is carried puts it … | built | caldrag.test.tsx:285 | yes — every part asserted | Built, held by tests |
| D1578 | An input filed for a weekend no Leave War period covers asks … | built | oilsync.test.ts:746 | part | stated (Built, stated here) |
| D1562 | On the Inputs and SANS calendars the month's title wears the small … | built | inputscal.test.tsx:162 | part | stated (Built, stated here) |
| D1560 | On the Inputs calendar and the SANS calendar a tap on the … | built, through D1562 | — (no test names it) | no | stated with D1562 |
| D1413 | Where the input window's Cancel / Add stand while the keys are … | standing (leave as built) | — (no test names it) | no | stated (Settled) |
| D1396 | The Inputs pages' three designs of the 26 Oct 26 look page … | built | cardsquare.test.tsx:2 | part | stated (Built, stated here); read 9 Nov 26: ⤢ given a line of its own, on a phone and a desktop, no "+n more" (Opus 5) |
| D1386 | The Inputs calendar gets an expand control that shows every input of … | built, through D1396 | inputsmonth.test.tsx:67 | part | stated with D1396; read 9 Nov 26: not phone-only — its own line with D1396 (Opus 5) |
| D1385 | On a phone a day opened on the Inputs calendar is widened … | built, through D1396 | daywidth-css.test.ts:1 | part | stated with D1396 |
| D1384 | On the Inputs calendar's opened day and on the Inputs list, the … | built, through D1396 | cardsquare.test.tsx:2 | part | stated with D1396 |
| D1377 | An Attach keeps D1374 as built: it lands under the schedule’s Unavailable … | standing (leave as built) | — (no test names it) | no | stated (Settled) |
| D1376 | "Attach" is built with this batch on `claude/lw-m3-placing-leave`, one FULL check with … | spent / history | — (no test names it) | no | stated briefly (Done once); proposed to archive |
| D1374 | An Attach lands under the schedule's Unavailable list by itself, as an … | built | m3read.test.tsx:41 | part | stated (Built, stated here) |
| D1373 | The input kind "Fly with" is renamed "Attach" (attached to another squadron, … | built | otherunavail.test.tsx:102 | part | stated (Built, stated here) |
| D1372 | A course (CSE) filed on the Inputs page lands under the schedule's … | built | unavaway.test.ts:2 | part | stated (Built, stated here) |
| D1369 | The Goes to buttons for an Other are drawn as look C: … | built | inputtitle.test.tsx:657 | part | stated (Built, stated here) |
| D1368 | No separate "War manning reduced" tick: the Inputs page's window for an … | built | — (no test names it) | no test | stated (Built, stated here) |
| D1367 | In the Inputs page's window for an Other, the two buttons that … | built, through D1369, D1368 | inputtitle.test.tsx:657 | part | stated with D1369, D1368 |
| D1304 | The Inputs calendar's bars take the Leave War's colour for each kind, … | built | inputscal-model.test.ts:285 | part | stated (Built, stated here) |
| D1300 | On a desktop the Medical tab's "+ Medical" stands at the right … | built | inputs.test.tsx:112 | part | stated (Built, stated here) |
| D1298 | A date clicked on the Inputs calendar or the SANS calendar while … | not built [INP-CAL-CLICK-BEHIND-NEW] | — (no test names it) | no | stated (Not built yet) |
| D1293 | On a phone the Inputs list's day headings and input cards take … | built | inputs-calendar.spec.ts:1519 | part | stated (Built, stated here) |
| D1280 | On a phone the Inputs page's tab row (Inputs · SANS · … | built | leavewar.spec.ts:847 | part | stated (Built, stated here) |
| D1179 | The Inputs page's type filter can pick a whole family — every … | built | inputs-docs.test.tsx:128 | part — two kinds of each family only | stated (Built, stated here); read 9 Nov 26: off the held line — the test supplies LL, OL and ATT C only, so a filter missing CCL, HL or OML passes (Astra 1) |
| D1139 | On a desktop the Inputs list's "+ Input" and dates button are … | built | consistency-heights.spec.ts:4 | part | stated (Built, stated here) |
| D1137 | On the Medical tab "+ Medical" stands first, at the left of … | built | inputslist.test.tsx:557 | part | stated (Built, stated here) |
| D1125 | The Inputs and SANS calendars' top rows are built as drawn: on … | built | inputstabs.test.tsx:212 | part | stated (Built, stated here) |
| D1123 | The Inputs and SANS calendars' top rows are laid out alike, on … | built, through D1125 | — (no test names it) | no | stated with D1125 |
| D1096 | Wherever the app prints a date with its year, the year is … | standing | audit-e-window-sort.test.tsx:230 | part — examples, not the rule | stated |
| D1095 | Where an input's "till <date>" carries its year, the year is two … | standing | newyear-till.test.tsx:2 | part — examples, not the rule | stated |
| D1025 | The amber edge down the left of each cut line on the … | standing (leave as built) | — (no test names it) | no | stated (Settled) |
| D1023 | Before an upchit moved later or deleted gives a downchit its days … | built | upchitcuts.test.tsx:2 | yes — every part asserted | Built, held by tests |
| D1022 | A deleted upchit gives the downchit it cut its days back, as … | built | medwrite.test.ts:433 | yes — every part asserted | Built, held by tests |
| D999 | When an upchit is moved to a later date, the downchit it … | built | trk-down-days.test.tsx:11 | yes — every part asserted | Built, held by tests |
| D996 | On a phone the input's own window on the Inputs page — … | built | — (no test names it) | no test | stated (Built, stated here) |
| D977 | Every card on the Medical tab is one even width, in all … | built | medical.spec.ts:41 | part | stated (Built, stated here) |
| D968 | The Medical tab's "+ Medical" opens the input window set to ATT … | built | medicalview.test.tsx:231 | part — "+ Input stays on OL" held by D917's cases only | stated (Built, stated here); read 9 Nov 26: off the held line — no test naming D968 asserts the "+ Input" half; it was already stated whole on the page (Opus 10) |
| D967 | On the Medical tab a card with two or more documents shows … | built | medicalview.test.tsx:199 | part | stated (Built, stated here) |
| D965 | The Medical tab is built as drawn: a card is its puck, … | built | medicalview.test.tsx:88 | part | stated (Built, stated here); read 9 Nov 26: Upchit Complete's date and documents only, no kind, no "upchitted", put back (Astra 4) |
| D963 | The Medical tab gets a "+ Medical" button beside its "as of" … | built | medicalview.test.tsx:88 | part | stated (Built, stated here) |
| D961 | His direction for the Medical tab's cards: on a phone three cards … | built, through D965 | medicalview.test.tsx:98 | part | stated with D965; read 9 Nov 26: its "upchitted" and kind gone from Upchit Complete now stated (Astra 4) |
| D960 | On the Medical tab's cards the "Placed by <name> · <date>, <time>" … | built | medicalview.test.tsx:93 | part | stated (Built, stated here) |
| D959 | Round 3 of the words pass is built as recommended: the Medical … | built | help.test.tsx:102 | part | stated (Built, stated here) |
| D953 | The till-date switch is a tick box before the grey date after … | built | accept.test.ts:88 | part | stated (Built, stated here) |
| D952 | Every input carries a switch for its "till <date>": on by default … | built | inputs.test.tsx:1466 | part | stated (Built, stated here) |
| D948 | An input's remarks box holds only what a person types; "till <date>" … | built | accept.test.ts:88 | part | stated (Built, stated here) |
| D927 | The Medical tab is built as drawn (D912): its "Medical" heading goes … | built | medicalview.test.tsx:76 | part | stated (Built, stated here) |
| D920 | In an input's window what is still to be filled in — … | built | inputnewdefaults.test.tsx:9 | part | stated (Built, stated here) |
| D919 | The title box's pencil is inside the box, at its right end, … | built | inputnewdefaults.test.tsx:6 | part | stated (Built, stated here) |
| D917 | A new input's window opens with OL (overseas leave) as its type … | built | inputnewdefaults.test.tsx:4 | part | stated (Built, stated here) |
| D916 | No calendar is folded to a dates line: an input's window — … | standing (leave as built) | — (no test names it) | no | stated (Settled) |
| D910 | On a phone the inputs list's "+ Input" and dates buttons are … | built | inputs.test.tsx:114 | part | stated (Built, stated here) |
| D909 | On a phone an input's window opened from a day may reach … | standing (leave as built) | inputs-batch2.spec.ts:258 | part | stated (Settled) |
| D908 | The inputs list's date pop-up on a small phone is left as … | standing (leave as built) | inputs-batch2.spec.ts:130 | part | stated (Settled) |
| D900 | Four more drags follow the edge as the others do (the design … | built | retest.test.tsx:965 | part | stated (Built, stated here) |
| D897 | On the inputs month calendar, a drag across days held at the … | built | caldrag.test.tsx:490 | part | stated (Built, stated here) |
| D893 | A note or a puck dragged in a day opened on the … | built | edgescroll.test.ts:5 | part | stated (Built, stated here) |
| D879 | The picked person's chip in the inputs calendar's "Add people" window loses … | built | glowoff-css.test.ts:10 | yes — every part asserted | Built, held by tests |
| D861 | The month's bar wears only the plain just-added ring — no glowing … | built | markring-css.test.ts:36 | part | stated (Built, stated here) |
| D854 | Three more passing notes go: "Input updated" where the changed input is … | built | oilclaimcrowd.test.ts:484 | part | stated (Built, stated here) |
| D851 | Where a new input can be seen arriving no "Input added" note … | built | inputsvet.test.tsx:505 | part | stated (Built, stated here) |
| D849 | Two of the three leftover questions are answered yes, as drawn: (2) … | built | inputcx.test.tsx:307 | part | stated (Built, stated here) |
| D848 | The three texts are deleted — the waiting-button hint on the upchit … | built | medmove.test.tsx:71 | part | stated (Built, stated here) |
| D795 | In the Calendar window, as drawn: "Every <weekday>"'s from date and Until's … | built | datebox.test.tsx:5 | part | stated (Built, stated here) |
| D792 | "Delete" in an input’s own window deletes at once and asks nothing … | standing (leave as built) | upchitdelete.test.tsx:7 | part | stated (Settled) |
| D786 | In the Calendar window on a phone, a swipe sideways on the … | built | dayswipe.test.tsx:5 | part | stated (Built, stated here) |
| D777 | The "OIL?" sign is approved as drawn: on an input's card — … | built | inputsday.test.tsx:536 | part | stated (Built, stated here) |
| D773 | The inputs list's "Export to Excel" button and the file it writes … | built | export.test.ts:49 | yes — every part asserted | Built, held by tests |
| D771 | A cancelled input's own window says it is cancelled: the same small … | built | inputcx.test.tsx:304 | part | stated (Built, stated here) |
| D770 | A person who is the only named person in an input that … | standing | onerecord-write.test.ts:203 | part — examples, not the rule | stated |
| D768 | A cancelled input keeps its place in the day's order on the … | built | inputcx-scenarios.test.tsx:14 | yes — every part asserted | Built, held by tests |
| D763 | Who is in an input is changed only by whoever filed it … | standing | groupinput.test.ts:16 | part — examples, not the rule | stated |
| D732 | Escape while the day's title is being typed puts the title back … | built | batch2.test.tsx:21 | yes — every part asserted | Built, held by tests |
| D729 | The design vet's five changes to the Inputs calendar and list are … | built | audit-e-window-sort.test.tsx:207 | part | stated (Built, stated here) |
| D728 | On an input's card the automatic "till <date>" is left out of … | built | tilldate.test.ts:2 | part | stated (Built, stated here) |
| D727 | On the desktop Inputs list a shared input names everyone in it … | built | grouprows.test.ts:5 | part | stated (Built, stated here) |
| D725 | On a phone the days of the calendar in an input's window … | built | inputs-batch2.spec.ts:103 | part | stated (Built, stated here) |
| D724 | On the card of an input filed for several people, who filed … | built | inputcard-model.test.ts:1 | part | stated (Built, stated here) |
| D723 | The input card is approved as pictured, for the opened day and … | built | audit-e-window-sort.test.tsx:171 | part | stated (Built, stated here) |
| D722 | On an input's card the title always starts at the left, on … | standing | inputcard-model.test.ts:78 | part — examples, not the rule | stated |
| D721 | His direction: on an input's card, the people of a shared input … | standing | batch2.test.tsx:102 | part — examples, not the rule | stated |
| D720 | On an input's card the small print says "By Saber" — not … | built | inputcard-model.test.ts:6 | part | stated (Built, stated here) |
| D719 | What an input's card must do, in his words: stay short; and … | standing | inputcx-scenarios.test.tsx:212 | part — examples, not the rule | stated |
| D712 | ALL / ALL AVAIL is not offered for a "Fly with" or … | standing | oilpersonalcrowd.test.ts:9 | part — examples, not the rule | stated; read 9 Nov 26: Event added, one day for every kind, no overseas duty or course, with D713, D711 (Opus 2) |
| D709 | A note of words alone keeps its small "+" (add people) beside … | standing (leave as built) | — (no test names it) | no | stated (Settled) |
| D707 | On a phone a day opened on the SANS calendar opens tall … | built | sansday.test.tsx:254 | part — the lowered height bounded above only | stated (Built, stated here); read 9 Nov 26: off the held line — the browser test accepts any height under 72%, so half height passes (Astra 7) |
| D705 | On a phone the inputs calendar’s month arrows, month name and "today" … | built | inputs-calendar.spec.ts:1024 | part | stated (Built, stated here); read 9 Nov 26: joined with D687 on one line, the switch's rule on a phone and a desktop (Opus 4) |
| D704 | "One commitment a day each." Is removed from the SANS calendar’s "How … | built | sanscal.test.tsx:470 | part | stated (Built, stated here) |
| D701 | The shorter input is drawing B: "Placed by" beside a short remark … | built | placedline.test.ts:52 | part | stated (Built, stated here) |
| D698 | On the Inputs calendar and the SANS calendar the row of buttons … | built | consistency-heights.spec.ts:60 | part | stated (Built, stated here) |
| D697 | On a phone the SANS calendar’s "How this works" and its colour … | built | sanscal.test.tsx:150 | part | stated (Built, stated here) |
| D696 | His direction: in a day opened on the Inputs calendar each input … | standing | — (no test names it) | no | stated |
| D695 | A note may hold people and no words: it is then drawn … | built | plan.test.ts:117 | part | stated (Built, stated here) |
| D694 | In the note that carries its own pucks, four pucks in a … | built | inputs-calendar.spec.ts:1188 | part | stated (Built, stated here) |
| D693 | On a phone the filter button and the settings gear stay where … | built | inputs-calendar.spec.ts:1038 | part | stated (Built, stated here) |
| D692 | The note that carries its own pucks is drawing A — compact, … | built | inputsday.test.tsx:318 | part | stated (Built, stated here) |
| D691 | In "How this works", the late cut-off as it is set is … | built | inputsmonth.test.tsx:396 | part | stated (Built, stated here) |
| D689 | A person is taken off a note as he is taken off … | built | inputsday.test.tsx:318 | part | stated (Built, stated here) |
| D688 | In a day opened on the Inputs calendar, a note and its … | built | inputsday.test.tsx:318 | part | stated (Built, stated here) |
| D687 | The calendar / list switch on the Inputs tab stays in the … | built | inputstabs.test.tsx:209 | part | stated (Built, stated here); read 9 Nov 26: no longer read as phone-only — on a phone and a desktop (Opus 4) |
| D685 | In the people picker, dragging across the pucks picks every puck the … | built | peoplepick.test.tsx:274 | yes — every part asserted | Built, held by tests |
| D684 | His direction, said as "perhaps": in a day opened on the Inputs … | built | person-delete.test.ts:144 | part | stated (Built, stated here) |
| D683 | On a phone a day opened on the Inputs calendar opens tall … | built | inputscal.test.tsx:376 | part | stated (Built, stated here) |
| D681 | A saved shared input’s dates can be changed — in the input’s … | standing | groupeditor.test.tsx:537 | part — examples, not the rule | stated |
| D675 | The window that sets each date's day, night or no fly and … | built | daysline.test.tsx:32 | yes — every part asserted | Built, held by tests |
| D671 | The holiday form in days picks its dates on the same one-calendar … | built | holidayspanel.test.tsx:69 | part | stated (Built, stated here) |
| D664 | On a phone the calendar — the SANS calendar and the Inputs … | built | inputscal-model.test.ts:2 | part | stated (Built, stated here) |
| D659 | The "Several people" picker has a fourth heading, "Personnel", for ground crew … | built | peoplepick.test.tsx:2 | part | stated (Built, stated here) |
| D658 | A member never files SANS availability for another man — a SANS … | standing | inputlines.test.ts:113 | part — examples, not the rule | stated |
| D657 | The design of the inputs and SANS calendar job is accepted as … | spent / history | — (no test names it) | no | stated briefly (Done once); proposed to archive |
| D656 | The person picker is a hybrid: by default one person from an … | built | editorwindow.test.tsx:284 | part | stated (Built, stated here) |
| D655 | A member may file for other people only duties and commitments — … | standing | onerecord.test.ts:82 | part — examples, not the rule | stated; read 9 Nov 26: its line now cites D1388, D1398, which narrow it, and the lock stands on the next line (Opus 1) |
| D653 | On a phone the inputs month fills the screen's height and draws … | built | inputscal-model.test.ts:2 | part | stated (Built, stated here) |
| D652 | The Holidays list's "Add a day" form carries the short form too … | built | eventshort-store.test.ts:3 | part | stated (Built, stated here) |
| D651 | A SANS person's puck wears the SANS purple edge on its right … | built | inputscal.test.tsx:205 | part — the edge as a class only, not its place inside the frame | stated (Built, stated here); read 9 Nov 26: off the held line — classes only, nothing measures the edge inside the frame (Astra 5) |
| D650 | The puck on the SANS day is smaller — in proportion with … | built | — (no test names it) | no test | stated (Built, stated here) |
| D649 | On the SANS day each person is the schedule's own puck — … | built | inputscal.test.tsx:205 | part — one puck's size class; the chip checked only if he has a CAT | stated (Built, stated here); read 9 Nov 26: off the held line — the chip assertion is conditional and one puck's size only (Opus 10, Astra 5) |
| D648 | A day opened on the SANS calendar lists everyone and scrolls — … | built | inputs-calendar-flow.test.tsx:94 | part | stated (Built, stated here) |
| D647 | On the SANS calendar's opened day each committed person is shown as … | built | sanscal.test.tsx:353 | part | stated (Built, stated here) |
| D646 | "How this works" is shorter: the worked example ("for the week of … | built | inputcard-model.test.ts:157 | part | stated (Built, stated here); read 9 Nov 26: "nothing more" narrowed to the cut-off line, not the whole fold (Astra 3) |
| D639 | The late cut-off is set behind each calendar's own settings gear — … | built | latecut.test.ts:1 | part | stated (Built, stated here) |
| D638 | On the days month a phone date carries one button that steps … | built | holidays.test.ts:3 | part | stated (Built, stated here) |
| D635 | The settings icon must read as a gear — the app's own … | standing | trk-flex-setting.test.tsx:75 | part — examples, not the rule | stated |
| D633 | The month carries a select button on every day — day, night … | built | dayswindow.test.tsx:3 | part | stated (Built, stated here) |
| D632 | On a desktop the Inputs calendar may show more inputs in each … | built | inputscal-model.test.ts:2 | part | stated (Built, stated here) |
| D631 | The baseline is set once, not day by day: a day is … | built | holidays.test.ts:3 | part | stated (Built, stated here) |
| D630 | The SANS date cell keeps the first mock-ups' colours — a soft … | built | sanscal.test.tsx:3 | part | stated (Built, stated here) |
| D629 | Every input and every SANS commitment shows, in small print, who placed … | standing | schema.test.ts:104 | part — examples, not the rule | stated |
| D628 | The late cut-off can be set either as a number of days … | built | latecut.test.ts:1 | part | stated (Built, stated here) |
| D627 | A day is classed day flying, night flying or no fly (NF): … | built | dayfacts.test.ts:3 | part | stated (Built, stated here) |
| D626 | His picks from the first mock-ups: the date cell with lined-up columns … | built | dayfacts.test.ts:3 | part | stated (Built, stated here); read 9 Nov 26: "the rest of the drawings stand as drawn" put back (Opus 6) |
| D624 | In the inputs / SANS calendar's bug check, each approved mock-up is … | spent / history | changesmodel.test.ts:368 | part | stated briefly (Done once); proposed to archive |
| D622 | The day's requirement is kept as two figures — pilots required and … | built | reqpanel.test.tsx:3 | part | stated (Built, stated here) |
| D621 | Ideas he wants shown in the mock-ups, none chosen yet: inputs drawn … | standing (the fold and the keyboard set stand as drawn) | calpick.test.ts:3 | part | stated; read 9 Nov 26: no longer proposed to archive — the fold and the keyboard set stand as drawn, a line of their own (Opus 6, Astra 2) |
| D620 | The inputs layout is shown to him as mock-ups, a few ideas … | built | inputcx-scenarios.test.tsx:542 | part | stated (Built, stated here) |
| D619 | The SANS calendar has a picker at the top to choose one … | built | sanscal.test.tsx:352 | part | stated (Built, stated here) |
| D618 | The SANS calendar's days are coloured in three steps — yellow, amber, … | built | inputs-calendar-flow.test.tsx:30 | part | stated (Built, stated here) |
| D617 | Each SANS calendar date shows, as pilots / WSOs, how many more … | built | dayfacts.test.ts:2 | part | stated (Built, stated here) |
| D584 | The Claude handoff must explain the owner's product intent and context so … | spent / history | — (no test names it) | no | stated briefly (Done once); proposed to archive |
| D583 | Show the finished inputs/SANS design on desktop and mobile, then bring it … | spent / history | — (no test names it) | no | stated briefly (Done once); proposed to archive |
| D582 | Simplify the Inputs page's entry and header hierarchy using Impeccable; the current … | spent / history | inputs-calendar-flow.test.tsx:106 | part | stated briefly (Done once); proposed to archive |
| D581 | Show the daily F/O/a availability counts on every SANS calendar date. | built | sansfly.test.ts:2 | part | stated (Built, stated here) |
| D577 | On this calendar, Sun means day flying and moon means night flying. | built | — (no test names it) | no test | stated (Built, stated here) |
| D576 | Consider keeping the current Inputs list as a secondary view in the … | built | — (no test names it) | no test | stated (Built, stated here) |
| D574 | Design a calendar view for Member Inputs alongside the SANS calendar, with … | spent / history | save-note.spec.ts:341 | part | stated briefly (Done once); proposed to archive |
| D572 | Count each person offering flying once for the day, even for a … | built | sansfly.test.ts:2 | yes — every part asserted | Built, held by tests |
| D570 | The SANS calendar's daily requirement and shortage colours are for flying only. | built | — (no test names it) | no test | stated (Built, stated here) |
| D569 | Add a SANS flying calendar with admin-set daily demand and editable deficit-based … | standing (remarks have no placeholder) | — (no test names it) | no | stated in the SANS section; read 9 Nov 26: no longer proposed to archive — no later ruling restates "no faded words on remarks" (Opus 3) |
| D547 | The new input popup is reachable by scrolling on the owner's iPhone … | standing (leave as built) | — (no test names it) | no | stated (Settled) |
| D364 | Another person's input, opened read only, draws its locked fields as values … | standing (leave as built) | inputcx-scenarios.test.tsx:512 | part | stated (Settled) |
