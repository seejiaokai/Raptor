# Round 2 — a course, an overseas duty and the unforeseen absence filed on the Leave War (24 Oct 26)

> **D1357 (25 Oct 26) — EVERY COMMITMENT UNDER UNAVAILABLE COUNTS HIM OUT.** His "2 yes": whatever its kind (Training, Meeting, Fly with, Duty, Event, Appointment, Personal, Other), a commitment under the schedule's Unavailable list counts him out on the Leave War, 1 or 0.5; only an Other gives its filer the choice (D1356); the rest are moved there by a scheduler. Filed as [LW-OTHER-UNAVAIL].

> **D1356 (25 Oct 26) — UNA GOES, AN "OTHER" UNDER UNAVAILABLE IN ITS PLACE (replacing D1338 below).** His "O1 yes" to the questions page: whoever files an Other picks the Ground Programme or Unavailable; an Other under Unavailable shows on the Leave War and counts him out (1, or 0.5 a half day), its remarks on the schedule's Unavailable list, the Inputs page and the Leave War alike; an admin files one from the bid window's ⋯, Grant OIL taking the third place. Filed as [LW-OTHER-UNAVAIL].

> **D1335 (24 Oct 26) — UNA REMOVED, "Other" in its place.** His words, in round 2's check: *"I think we should remove UNA. And change to OTH. Because they both mean the same. It's an open ended unavailable remarks. Perhaps when filed on the inputs, ask if this affect manning on leave war for full day AM or PM or some sort. From the leave war this can be put as well with the remarks indicated"*. So: an unforeseen absence is an "Other" (OTH), its remarks saying what it is; filed on the Inputs page it asks whether it takes him off the Leave War's manning (no, a whole day, AM or PM); one that does shows on the war and lowers its manning; the war's third button files one, with its remarks. Everything below about UNA as a kind of its own (the readings 5, its colour, its Legend line) is REPLACED and is to be reworked — [LW-OTH-MANNING]; the course and the overseas duty stand as written.
>
> **D1338 (24 Oct 26) — UNA STAYS, ON THE LEAVE WAR ONLY, AN ADMIN'S ALONE (replacing D1335, D1336 and D1337 below).** His words: *"it can be reasons like this person is under investigation for example and he’s put out of manning. And for people to see on the leave war so they don’t get confused on the counting. Maybe put UNA instead? But nowhere else"*, then *"Yes but members can read its remarks too and its admin input only."* So UNA is the war's own record, not an input kind: an admin places it (whole day, AM or PM — it counts 1 or 0.5 off the manning) from the row's third place, with the window's remarks; everyone sees its deep teal box and reads its remarks; the Inputs page, the schedule, the bell and the OIL work never see it. A member's third place is empty. The picture he answered: `raptor-port/docs/img/handpass/2026-10-24-lw-r2/oth-q/una-war-only.png`.
>
> **D1337 (24 Oct 26, replaced by D1338) — UNA REMOVED NOW, ITS PLACE KEPT EMPTY FOR OTH.** His words, once [LW-OTH-MANNING]'s four questions were put to him with pictures: *"UNA Remove it. Put in OTH"*, then *"Actually leave a space for oth now we will work it later u can continue the rest of the job now. I’m still thinking"*. So UNA leaves the app now — the kind, its button, its colour, its Legend line, its seed — and the row under the leaves reads CSE · OD · an empty place · ⋯ (a member's: CSE · OD and two empty places); OTH is built once he answers. The pictures of the questions: `raptor-port/docs/img/handpass/2026-10-24-lw-r2/oth-q/` (script `scripts/handpass/lw-oth-look.mjs`).
>
> **D1336 (24 Oct 26):** *"And the leave war will count if it’s 0.5 or 1 for manning"* — an OTH off the manning counts 0.5 or 1 on the war, by the half or halves it covers, whatever its exact hours (the war counts every absence by halves).

[LW-FILE-OD-CRS]. His rulings: D1299 (his intent — file them far ahead while bidding is open, because they lower manning),
D1303 (one more kind for an unforeseen absence, named apart from the Inputs page's "Other"), D1318 (filed straight, no
approval, any date, a member too, no document), D1324 (UNA filed as an OD is), D1325 (UNA deep teal), D1326 (the ⋯ in the
fourth place of the CSE · OD · UNA row — built with round 3). His drawing: `scripts/handpass/lw-round2-odcrs.mjs`
(`docs/img/handpass/2026-10-24-lw-declutter/r2-*.png` — the admin's day with UNA teal, a member's open day, a member's
closed day).

## What is built

- **The row under the leaves** carries CSE · OD · UNA in its first three places, the ⋯ in the fourth (an admin's; a
  member's fourth place stays empty) — in the one-day window, the drag-selection window and a member's closed-day window
  (which a member also gets on a day before today, D1211). Each button is filled, in its kind's colour, with no figure:
  nothing is spent and nothing waits.
- **A tap files it at once**, for the day tapped, the picked range, or every day of every man of a drag-selection, and the
  window closes. One command, one Undo. It is saved as the input it is — one Inputs-page record per man per run of days —
  never as a bid.
- **UNA, "Unavailable"**, is a new input kind, offered on the Inputs page under "Duty & other commitments" beside OD, and
  drawn deep teal on the grid, its button, the Legend and the Inputs calendar.

## The agent's readings (told to him; each his to strike)

1. **Who and when (D1318):** a member files on his own row only, an admin on any row; any date — open for bidding or not,
   and a day before today, as the Inputs page allows. *(Corrected in round 2's FULL check, 24 Oct 26 — the designer's G1:
   this said a day the man is not in the squadron, before his post-in or after his post-out, is skipped and said. The
   store's own rule for leave lets it be dated there — owner, 20 Sep 26, answer C, `store.ts leaveDateOk` — and an OD or
   a course is filed the same way, so such a day is filed.)* A day that already holds the same kind for him is left as
   it is and said (the designer's G2); a weekend or holiday asks its OIL question at once, as the Inputs page does
   (D804, D660 — the designer's G3).
2. **Whole days:** none of the three has halves on the Inputs page, so a tap files whole days whatever Duration shows.
3. **Its words:** the Remarks and till typed in the window go with it; a document attached goes too — never asked for.
4. **Once filed it is an Inputs-page input:** the war never changes a course or an overseas duty (design §5.4, owner §13
   Q1), so a tap on that day opens the window an OD filed on the Inputs page opens, and it is changed or deleted on the
   Inputs page; Undo takes it back straight away. A bid already on the day stays (a course or an OD never replaces a bid —
   the clash rule's step 3); the day then holds both.
5. **UNA is the overseas duty's twin in every rule** ("UNA can use the same as OD", D1324): out of reach — he cannot be
   planned for anything, an SC SPARE included; drawn under the schedule's Unavailable; it lowers the Leave War's manning
   (D998's list, now with UNA); on a weekend or a holiday it asks the OIL question as OD does; it takes a title.
   **One exception, by his own reason for the medical kinds:** the LATE mark skips UNA as it skips a downchit — an
   unforeseen absence cannot be filed before a deadline.

## Round 2b — UNA on the Leave War only (D1338): what is built (24 Oct 26)

Everything above about UNA as an input kind is REPLACED. UNA is the war's own record (`engine/warrecs.ts UnaRec`): an admin
places it from the third place of the row under the leaves (the one-day and drag windows; a member's third place is empty),
on the Duration's half, with the window's remarks, naming himself (`store.ts placeUna`, command `lw.una`); one a half (a UNA
on a half it takes is replaced). It takes the man out of the manning by 0.5 or 1 (`dayview.ts`), charges nothing, clashes with
nothing, asks nothing. A day holding one opens the day's list for everyone (another man's too): its box, "out of the manning ·
placed by …", its remarks read only — an admin's box to change them and his Delete (`setUnaRemarks`, `removeUna`). An admin's
one-day Clear and block Delete take it with the rest; a Move leaves it and says so. The day panel's Away list names it, with
no state word. The commit refuses any member's command that adds, changes or takes one (`perms.ts ownershipViolation`). The
Inputs page, the schedule, the bell and the OIL work never see it. **Not done, by D1338's "nowhere else":** no line in the
changes window's history (that history is the schedule's and the inputs'; the Undo names it, "a UNA"). Tests:
`src/leavewar/una.test.ts`, `src/engine/unagone.test.ts`, `ui/round2.test.tsx`, `e2e/round2-leavewar.spec.ts`.

## Where it lives

The kind: `src/engine/inputs.ts` (INPUT_META, `isLateInput`), `src/engine/schema.ts`, the reference's mirror
`src/testing/refwin.ts`. The war: `absences.ts warVisible`, `engine/dayview.ts` (AWAY_DUTY, OFF_WAR), `engine/codes.ts`
(its label and kind), `ui/matrix.css`, the Legend (`ui/Chrome.tsx`). The door: `state/store.ts fileStraight` → the absence
door's `file` (`sync.ts doorFile`) → the Inputs door (the clash rules run as for any input). The buttons:
`ui/LeaveButtons.tsx DutyButtons`, in `BidPicker`, `SelectSheet`, `ClosedNoteSheet`. The Inputs calendar's colour:
`src/ui/inputscal-model.ts`, `scheduler/25-inputs-calendar.css`.

**26 Oct 26, D1386:** an expand control on the Inputs calendar shows every input of each day in the month, the weeks growing taller and the page scrolling — drawn for him first. Filed as [INP-CAL-EXPAND].

**26 Oct 26, D1384 and D1385 (the Inputs page, his iPhone look):** each input card's square wears its kind's colour (D1384 — filed as [INP-CARD-SQUARE-COLOURS]); a day opened on the Inputs calendar widened to the list's edge space (D1385 — filed as [INP-DAY-WIDTH]).

**26 Oct 26, his "1 yes" (D1381):** a course a scheduler rejects counts him back in on the Leave War, as every other commitment taken back out of Unavailable does — `leavewar/absences.ts warVisible` is to stop counting a rejected course (acc 'r'); a course then moved onto the Ground Programme is put to him with the build. Filed as [LW-REJECTED-CSE].

**26 Oct 26, his "all as recommended" to the night's three questions (D1388–D1390):** an overseas duty a scheduler rejects counts him back in too, as a course does (D1390); a rejected course or overseas duty that a scheduler then moves onto the Ground Programme counts him in, as every commitment there does — only Unavailable counts him out (D1389); built together under [LW-REJECTED-CSE]. Once a scheduler has moved a member's Other, only a scheduler changes where it goes — the member's window shows where it sits and does not let him pick again; a retype into a kind that lands elsewhere by itself is held the same way (D1388) — filed as [LW-OTHER-GOES-TO-LOCK]; built 26 Oct 26 on `claude/lw-other-goes-to-lock` (every input a scheduler moved — Reject, → Ground, → Unavail, its Ground Programme row removed, his window's Goes to — carries the mark; the member's window shows where it stands with neither button, his save leaves it there, a kind that cannot stand there is refused; `ui/goesheld.test.tsx`).

**26 Oct 26 morning, his "all as recommended" to the look page (D1393, D1396):** an overseas duty gets Reject and → Ground as a course has, with `engine/inputs.ts isAway` changed in the same job (D1393, [LW-OD-REJECT]); the Inputs designs built as drawn — the expand ⤢ on the "How this works" row, the opened day edge to edge on a phone, each card's square in its kind's colour (D1396).

**25 Oct 26, his "All as recommended" to the questions page, version 7 (pictures `raptor-port/docs/img/handpass/2026-10-25-lw-drawings/q7/`):** D1369 — the Goes to buttons look C, the picked one solid in its colour, ordinary letters, 36px; D1370 — an Other (and every commitment under Unavailable the war counts, an Attach included) drawn on the grid outlined as the Inputs calendar draws a commitment (fill rgba(232,237,242,.05), edge 1.5px rgba(200,212,228,.78), words #E8EDF2), letters OTH; D1371 — the free-half window names a held half-day Other in one line (its box, its half, its remarks, "change it on the Inputs page"), admin and member alike; D1372 — a course lands under Unavailable by itself; D1373 — "Fly with" renamed "Attach" with one "To" box, shown "Attach · 145 Sqn"; D1374 — an Attach lands under Unavailable by itself and counts him out; D1375 — ATCH on the grid, outlined, made to fit a phone's day box; D1376 — Attach built with this batch. **D1377 (25 Oct 26, his "Sounds like A"):** asked again after he read an Attach as a rename, he kept D1374 — an Attach lands under Unavailable by itself and counts him out on the Leave War; its other schedule rules are Fly with’s, unchanged.

**25 Oct 26, D1368:** no separate "War manning reduced" tick (Q1 as recommended): the window asks once where an Other goes, and a grey line under the choice says what the Leave War does with it — "Counted as away on the Leave War" (Unavailable) / "Still counted in the Leave War's manning" (Ground Programme).

**25 Oct 26, D1367:** in the Inputs page's window for an Other, the two buttons that choose where it goes wear the schedule's colours for those lists — Ground Programme amber (#E5A83B), Unavailable red (#F0555F): at rest grey with their words in their colour, the picked one solid with dark words, as the lit Approve and Refuse (D1361). Drawn for him on the questions page, version 7 (Q1).

**25 Oct 26, D1365:** an Other filed from the Leave War's bid window goes straight under Unavailable — no choice there — with the window's Duration (whole day, AM, PM); any other time is changed in its input on the Inputs page. The choice of Ground Programme or Unavailable (D1356) is the Inputs page's.

**25 Oct 26, his "Yes all as recommended" — an Attach button on the Leave War (filed as [LW-ATTACH-BUTTON]):** D1378 — the bid window’s ⋯ offers Attach first, above Other, filed straight under Unavailable with no approval, as the war’s Other is; D1379 — an admin and a member alike, as an OD or a course (D1318), a member’s window getting a ⋯ that holds only Attach; D1380 — it takes the window’s Duration (whole day, AM, PM), and its "To" is added on the Inputs page, never asked on the war.
