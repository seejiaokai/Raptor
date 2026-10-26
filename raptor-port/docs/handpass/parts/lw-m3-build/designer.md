# The M3 build of 25 Oct 26 — the independent scenario designer's part

For `docs/handpass/2026-10-25-lw-m3-build.md` (FULL). Written by a fresh Opus reader who did not build it. **Not a finding
(§2b, D56):** a "Fly with" or UNA record already in the store, or any harm living only in stored demo data where the code
is right going forward. Roles: admin `ad`/`a` (Saber), member `us`/`us` (Ranger). Phone 402×874, desktop 1536×864 (his PC
at 125%). After every scenario marked ↺: Undo, Redo, reload — the screen right after each. Phone taps: a picture within
100 ms of the lift as well as settled (§7.10).

## (a) Roll-call rows the sheet's table is missing

Each needs its own mark — show / control usable / what else is painted there.

| # | Surface (missing from the sheet) | Why it needs a row |
|---|---|---|
| R1 | Edit Schedule's **published** day: the amendment panel's change list and the AL marks on an Unavailable row | `acc` is a filing change (publish.ts filingDelta) — every new route to `acc:'u'` (Goes to, a course or an Attach by itself, an Other from the war, → Unavail on every kind) must read as a pending amendment |
| R2 | The issued face (View-only Sched, a member's view) beside the working copy | a filing change on a published day must not move the issued face until it is published |
| R3 | The Scheduler Board's Unavailable, Personal Inputs, Ground Programme and Common Programme panels, separately from the week | the board builds its own rows (board.ts); → Ground · → Unavail drawn by `accCtl` in both |
| R4 | The changes window (the changes clock) and the bell | the lines for "→ Unavail" on a non-Other kind, a course or an Attach filed straight under Unavailable, a war-filed Other |
| R5 | The Undo / Redo name in the top bar, and where Undo lands | `lw.file` now "filing a course, an overseas duty or an Other"; landing reads `warVisible` (gap G1) |
| R6 | The input's own window opened from three doors — the Inputs list, the Inputs calendar, the schedule row's tap — for an Attach (To) and an Other (Goes to) | three openers of one window (§6 navigating-action rule) |
| R7 | The Inputs list card and the Inputs calendar bar of an Attach | "Attach · 145 Sqn" (`inpLabel`) must read the same on the card, the bar, the Unavailable row, the war's day list |
| R8 | The input window's type list | "Fly with" gone, "Attach" in its place, ALL / ALL AVAIL not offered for it (D712) |
| R9 | The Leave War's Available / Manning rows and their figures, per half | a commitment counts 1 or 0.5; a timed one counts by the half it touches (gap G7) |
| R10 | The Leave War's Codes list (the glossary), beside the Legend | new group "Under Unavailable on the schedule — out of the manning" |
| R11 | The OIL question window and the bell's OIL list after a war-filed Other on a weekend / public holiday | `askFiledOil` now runs for an Other too |
| R12 | The OIL tracker and the balance bar | a commitment must spend nothing and earn nothing on the war (an FO\* from a worked weekend aside) |
| R13 | A member's phone: "My leave" strip and his own row | outlined OTH/ATCH on his own row; the member's bid row CSE · OD only |
| R14 | The Leave War grid's pinned columns while a decided button or the bubble stands | the standing see-through test (§7.10) |
| R15 | The SANS calendar's day (SansDay) as well as its month's "still needed" | both read the war's Available row |
| R16 | The drag window over several men | ⋯ Other files one input a man; Post out only for one man |

## (b) Scenarios

| # | Role · size | Steps (real controls) | Right if… | Ruling |
|---|---|---|---|---|
| 1 | ad · phone | Leave War, a day with Ranger's pending LL bid → tap → Approve. ↺. Then tap Approve again | Approve solid green, "Approved", Refuse grey with red words; second tap → back to waiting, both grey | D1361, D1330 |
| 2 | ad · phone | the same bid → Refuse; tap the lit Refuse again. ↺ after each tap | Refused solid red, leave button ringed; second tap → waiting, nothing lit; the war's box goes from struck grey back to pending | D1361, D1355 |
| 3 | ad · desktop | both orders: Approve then Refuse, and Refuse then Approve, on one bid, in the one-day window **and** in the day's list | each tap moves the lit one; never two lit; the day's list and the one-day window agree after each | D1361 |
| 4 | ad · phone | drag over three days of one man holding approved + pending + refused | nothing lit in the drag window (a picked range lights nothing) | D1361 |
| 5 | us · phone | Ranger opens his own refused bid | nothing lit, no ring (a member's own refused bid lights nothing) | ui-contracts as built |
| 6 | ad · phone | a day with Ranger's held **afternoon** bid: tap the day → window opens on the morning; type "Dentist" in Remarks; switch to the afternoon; Add | "Dentist" goes on the morning bid only; the afternoon bid keeps its own words; reopen each half to check | [LW-NIGHT1025-OLDER] (a) |
| 7 | ad · phone | place a bid that turns Available P red while the Manning rows are folded and scrolled out of view | the bubble at the foot, red, "This bid: Available P 27 → 26"; Show › present; press Show › → rows in view, bubble gone, no second tap opens a day | D1358, D1360, D1364 |
| 8 | ad · phone | as 7 but scroll the Manning rows into view while the bubble stands, then out again | Show › disappears in view, comes back out of view; the bubble never moves under the finger | D1358 |
| 9 | ad · phone | open a day panel (resting at the foot), then place a bid that turns two rows amber/red | the bubble stands just above the panel's top, both pairs ("IP 16 → 15 · SXO 12 → 11"), each in its colour, box in the worst colour; nothing covers the panel's controls | D1360, (g) |
| 10 | ad · desktop | a second bid on a day already red (27 → 26 → 25) | bubble raised again, "Available P 26 → 25" | D1345, D1364 |
| 11 | ad · phone | refuse a bid on a red day, then tap the lit Refuse again (back to waiting) | the send-back lowers the row again — does the bubble come? (record what it does; D1345 says a bid taking a row lower raises it) | D1345, D1361 |
| 12 | ad · phone | Undo, then Redo, a bid that turned a row red | record whether the bubble comes on Redo (gap G6) | D1345 |
| 13 | ad · desktop | Inputs page → New → Other, Ranger, a weekday D, whole day; Goes to: Unavailable (grey line "Counted as away…"); Add. Then Leave War. ↺ | Edit Schedule's Unavailable list holds it with its remarks; the war's box OTH outlined, Available P −1; SANS "still needed" +1 that day | D1356, D1357, D1368–D1370, D1352 |
| 14 | ad · desktop | reopen 13's Other, flip Goes to → Ground Programme, Save; then flip back. ↺ each | Ground: on the Ground Programme, the war's box gone, manning back; back: under Unavailable again. Both directions on an **unpublished** day | D1356, D1357 |
| 15 | ad · desktop | as 14 on a **published** day | each flip reads as a pending amendment on that day (amendment count rises, the row marked); the issued face (View-only Sched) unchanged until published; publish the AL — the war still agrees | D1357, memory "published-day input = pending amendment" |
| 16 | ad · desktop | Edit Schedule: a Training (Ranger) on the Ground Programme → Reject → → Unavail. Then → Ground. ↺ each; then the same on the Scheduler Board | → Unavail: on the Unavailable list, war box TRG outlined, Available −1; → Ground: war box gone. The board offers the same pair | D1357 |
| 17 | ad · desktop | repeat 16 for each kind: Meeting, Personal, Appointment, Duty, Event, Attach | letters MTG, PERS, APPT, DTY, EVT, ATCH; four-letter ones fit the box on a phone, a step smaller | D1357, D1375 |
| 18 | ad · desktop | Inputs → New → CSE, Ranger, a two-day run; and → Attach, To "145 Sqn" | both land under Unavailable without being asked; "Attach · 145 Sqn" on the Unavailable row, the Inputs card, the calendar bar; war ATCH outlined, CSE as before | D1372–D1374 |
| 19 | ad · desktop | the Attach of 18: Reject, → Ground, then → Unavail | out of the war's count on Ground, back in on Unavail | D1374, D1357 |
| 20 | ad · desktop | Inputs → Other for **ALL AVAIL** (one day) | no Goes to row; schedule offers "→ Common" only; never under Unavailable; nothing on the war | D712, [INPUT-ALL-AVAIL] |
| 21 | ad · desktop | Inputs → Other for Ranger **and** ALL AVAIL; Goes to Unavailable; Add | record what happens (gap G3): the save refused with the "cannot be filed under Unavailable" sentence, or the row hidden — never a placeholder under Unavailable | placeholderProblem |
| 22 | ad · desktop | Inputs → Other for Ranger + two named men, Goes to Unavailable | each man counted out on the war (three OTH boxes), each his own row on the Unavailable list | D737, D1357 |
| 23 | us · phone | Ranger: Inputs → New → Other, his own, AM half if offered else 09:00–11:00, Goes to Unavailable; then the war | his row shows OTH in the morning half, Available −0.5; his war bid row still CSE · OD only (no Other, no Grant OIL) | D1356, D1365 |
| 24 | ad · phone | war: tap a free weekday for Ranger → ⋯ → Other, Duration AM, Remarks "Brief"; Add. ↺ | filed straight under Unavailable as a morning; war box OTH top half; bubble "This Other: …" if a row falls; the Inputs page shows it with AM and "Brief" | D1365, D1349 |
| 25 | ad · phone | tap 24's day | free-half window on the afternoon with one line: the OTH box, "Morning", "Brief", "change it on the Inputs page"; afternoon bid placeable | D1371, D1353 |
| 26 | ad · phone | war: a day holding a **whole-day** TRG under Unavailable → tap | the day's list opens, remarks read only, no Delete / Approve for it; same for Ranger | ui-contracts as built |
| 27 | ad · desktop | drag over Ranger's free day + his whole-day OTH day + a third day; ⋯ → Other | files the free days, leaves the OTH day "already holds an Other — left as it is", splits the run; two inputs | doorFile G2 |
| 28 | ad · desktop | drag over three men × two days → ⋯ → Other; ⋯ shows no Post out | one input a man; six OTH boxes; one Undo takes back all | D1365 |
| 29 | ad · phone | war: ⋯ → Other on a **Saturday** and on a public holiday | the OIL question comes once filed (one window; several men: the one list) — answer Yes: OIL appears where it should, nothing double | D804, D660, askFiledOil |
| 30 | ad · desktop | Inputs: a Training for Ranger on a Saturday, answer the OIL question Yes, publish the weekend, then → Unavail | the war's Saturday shows TRG outlined and the credit; the count right for a weekend; OIL tracker unchanged by the move | D1357, OIL rulings |
| 31 | ad · desktop | a drag over a day holding Ranger's whole-day TRG under Unavailable → LL | record: is the bid placed beside the TRG (two entries) or refused? (gap G2) | D1357 |
| 32 | ad · desktop | an Appointment 10:00–11:00 and a Meeting 09:00–17:00 under Unavailable; an overnight Duty 22:00–02:00 | record the war's count each half and on the next morning (gap G7) | D1357 |
| 33 | ad · desktop | Ranger: LL bid run 29–31 of a month, one remark, continuing 1–2 of the next (one run); view both months | joined bar to the month's last day and on from the 1st, not squared off at the edge (gap G8); code once at each piece's start | D1359 |
| 34 | ad · phone | two **separate** next-door LL inputs (two filings) on Mon and Tue | two boxes, not joined; one input Mon–Fri with a second entry on Wed: bar breaks round Wed; a half-day run joins top to top | D1359, D1346 |
| 35 | ad · phone | drag-select across a joined bar | the selected days drawn as their own boxes with cyan; on release the bar joins again | D1359, D1340 |
| 36 | ad · desktop | drag over Ranger's two entries "Wedding" (9–10) and "Moving" (12); and a third with no remark | two grey lines with dates, empty box; the no-remark entry not listed; type "Away" → Approve → both entries carry "Away", still separate. Over one entry: box opens with its words | D1362, D1341, D1347 |
| 37 | ad · phone | tap every control of a bid window, the day list and the bubble, pointer left on each | picture at ~100 ms: no tint or see-through cell only the pressed state shows; decided buttons keep their colours | D1281 |
| 38 | ad · desktop | reload after 13, 16, 18, 24 | every OTH / TRG / ATCH box and count back as before reload; Goes to reopens on what was saved | persistence |
| 39 | ad · desktop | Legend and Codes on the war | "Under Unavailable on the schedule: OTH, ATCH and the rest…" in the Legend; the Codes group lists all eight; no UNA anywhere | D1370, D1356 |
| 41 | ad · desktop | a Meeting / Duty / Event (not an Other) on the Ground Programme of a Saturday or public holiday, no OIL answer yet → Reject → → Unavail; and a course filed on a Saturday from the Inputs page (lands under Unavailable by itself) | → Unavail puts the OIL question first, nothing moved until answered (now that every kind has → Unavail); the course asks it at the save | D804, D793, D1372 |
| 40 | ad · phone | Inputs window: an Attach's To box and an Other's Goes to on a phone with the keys up | box lifted clear of the keys **and** of the window's own Cancel / Add (§7.11 lesson 5) | lesson 5 |

§7.11 lessons covered: 1 → 1–3, 11, 25 (states × readings); 2 → 33, 35 (drag at a person's speed); 3 → 7–9, 37; 4 → press the
Inputs calendar behind 18's open window; 5 → 40.

## (c) Gaps between a ruling and the build — questions, not fixes

| # | Where | Question |
|---|---|---|
| G1 | `src/state/undo-wire.ts:249` | Undo's landing still asks `warVisible`, not `warCounts`: undoing a commitment's filing (an Other under Unavailable, a Training → Unavail) does not count the Leave War as a page that shows it — does Undo pressed on the war jump to another page? |
| G2 | `src/leavewar/inputgate.ts:198, 356, 364` | The war's clash check and bid replacement still read `warVisible`: a commitment under Unavailable never clashes with, or replaces, a bid on the same half. A course does (it is `warVisible`). Should a TRG / OTH under Unavailable treat a bid as a course does? |
| G3 | `src/ui/inputedit.tsx:1036, 3040` | Goes to is shown, and `acc:'u'` written, from the lead person only; an Other holding a named man and ALL AVAIL then meets the save refusal (`engine/inputs.ts:720`). Hide Goes to there, or is the refusal the intended route? |
| G4 | `src/ui/inputedit.tsx:1390–1396` | An Other its filer put under Unavailable, retyped to Training: no branch clears `acc`, so the Training stays under Unavailable and counts him out. D1357 says the rest land on the Ground Programme until a scheduler moves one. Keep it, or send it back? |
| G5 | `src/ui/inputedit.tsx:502, 1393` | A scheduler's Reject (`acc:'r'`) or → Ground reads in the window as "Ground Programme"; a member's flip to Unavailable overwrites the scheduler's decision. May the filer override the scheduler? |
| G6 | `src/leavewar/ui/Matrix.tsx` (raise on a sheet closing or a move) | Redo of a bid, and a lit Refuse sent back to waiting, can lower a row with no bubble. D1345 says every bid or filing that lowers a row raises it — do these count? |
| G7 | `src/leavewar/absences.ts:149–172` | A timed commitment counts by the half it touches: a one-hour appointment under Unavailable takes half a man; an overnight Duty's tail falls on the next morning. D1357 says "1 or 0.5 for a half day" — is a one-hour appointment half a day? |
| G8 | `src/leavewar/ui/MatrixRows.tsx:270–280` | `joinClasses` reads the next and the day before from the views on screen; at a month's or a war's edge the next day may not be there, so the bar ends square. Is the edge of a month meant to break it? |
| G9 | `src/leavewar/sync.ts:196` (reads the live inputs) | A → Unavail on a published day counts him out on the war at once, before the amendment is published. Should the war follow the working copy or the issued face? |
| G10 | `src/ui/html.ts:2406` | → Ground on a course or an OD changes the schedule but not the war (a course and an OD count him out wherever they sit — D1357's reading). Is that what a scheduler expects from → Ground on a course? |
