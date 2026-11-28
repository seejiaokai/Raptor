# The rulings audit — slice 5, inputs and SANS (24 Nov 26)

A fresh Opus helper, blind to the other slices' findings (slice 9's file was opened only to copy the record's shape and
to avoid re-filing what it already holds; where it overlaps, this file says so). Read-only apart from this file. The app
read is this working copy (`claude/readings-lapse-fix-fdbb3c` — `main`'s app plus the SANS words job before its round 5);
for the SANS reminder, `git show claude/allavail-sans-postout-141` (D2564's fix, commit `1d2ed3415`: the only source
difference between that tip and this copy is that commit — `engine/avail.ts daySansSeats` and `leavewar/sansunfiled.ts`).
Rulings read: the Inputs page whole; the scheduler page's SANS lines (101–111, 453–456); full rows D654 (archive), D655,
D681, D701, D704, D731, D755, D760, D763, D777, D605, D1720, D1728, D2313, D2327, D2329, D2338, D2340, D2341, D2342,
D2343, D2346, D2390, D2391, D2394, D2420, D2421, D2560, D2564, D2565, D2566, and D2568 (on the SANS branch only:
*"both as recommended"* — a seat or sim box counts before its times are typed; a cancelled line never). The drawing of
record for the SANS words, `raptor-port/docs/mock/2026-11-24-sans-words/index.html`, was read whole.

## Findings

| Id | Class | The item | Where | Ruling(s) and his words quoted | The difference, in one sentence | The reading's standing | Harm | The question it would become |
|---|---|---|---|---|---|---|---|---|
| S5-M1 | MISMATCH | Two refusals say fewer people may act on a one-man input than may: a bar dragged on the Inputs calendar — "Only a scheduler can move someone else's input"; the Delete key on an opened day's line — "Only Ranger or an admin can delete this input" | `raptor-port/src/ui/caldrag.ts:114`; `raptor-port/src/ui/InputsCal.tsx:982` | D655: *"Him, the filer, and an admin"* (who may change or delete an input filed for another man); D731 (8): "the filer … reads 'Filing for other people is switched off — an admin can change this.'" (said of a shared input) | The drag names only a scheduler (the man himself and the filer may too); the delete leaves out the filer; and to a filer whose right went with the members' switch, both say something other than the switch-off words every shared-input door uses (`sharedRefusal`) | Not a reading — the words state the rule short | Wording only: a member is told wrongly who may act | When: a member on his phone tidies the month. Outlaw filed a Training for Ranger alone while the members' switch was on; an admin then switches it off; Outlaw drags the bar to Thu 16 Jul and reads "Only a scheduler can move someone else's input" — Ranger himself still may, and the reason is the switch. Not a question: the two sentences to say who may (and the switch-off words where that is the reason), as the shared-input doors do |
| S5-M2 | MISMATCH | The Logic page's rule text: "Every input closes the man for the hours it covers, from the moment it is filed. One a scheduler has taken off the programme closes nothing." | `raptor-port/src/ui/logic-html.ts:184` | D760: "A CX the scheduler puts on a row that came from an input cancels the input itself … the red box and 'information only' go with the input too"; D814: "A cancelled input is never asked the OIL question … an information-only input the same" | The app closes nothing for a cancelled or information-only input either (`engine/inputs.ts inputSilent`; `engine/avail.ts personBusy` skips a cancelled row), so "every input" overstates the rule | Not a reading | Wording only (rule text a scheduler reads to judge the crew list) | Not a question: the line to name the cancelled and information-only inputs beside the one taken off. (Also slice 4 / 10's page — the Logic page.) |
| S5-O1 | OPEN READING | A SANS man with nothing filed, put in a flying seat or a sim, raises nothing on the warning list — only "not offering Fly/OFT/AMT today" and "available hh:mm–hh:mm only" raise | `raptor-port/src/engine/validate.ts:1526–1545` (its note, 14 Aug 26) | D605 (a man on leave or down "is flagged the moment he is seated anywhere"); D2420 (the crew list draws no reason line: "the strike and the '0 free' count already say it"); D2564 ("the same the crew list greys and the warning reads" — names the places, not this case) | The crew list strikes him and an armed seat refuses with the reason, but once he is in the seat (a drag with the seat not armed, or a copied week) nothing on the day says it; the silence is the builder's, its reasons "the owner's own example only ever describes planting against a filed record" and the demo week | Never put to him — only in the validator's code note; searched the rows ("nothing filed", "no availability", SANS + warning), the archive, the backlog, the SANS questions pages | Published record: a day can go out with a SANS man in a jet he never offered for, and nothing on the scheduler's list says so (his own reminder tells him, D2338) | When: a scheduler at his desk copies last week's waves into the week of 20 Jul; Hex (SANS, nothing filed for Tue 21 Jul) comes across in a WSO seat; the warning list is clear, and the day is published. Should the warning list flag a SANS man in a flying seat or sim with nothing filed, as it flags leave? (Question 15) |
| S5-O2 | OPEN READING | The Leave War decides who is SANS by today's tick for every date: who has a row in its SANS group, and whom its Available P / W rows leave out ("SANS people are never counted here") — the rows the SANS calendar's "still needed" figure subtracts; the Inputs calendar's people picker groups him the same way | `raptor-port/src/leavewar/state/raptorRoster.ts:62`; `raptor-port/src/leavewar/engine/availrows.ts:144–148`; `raptor-port/src/leavewar/ui/CounterForm.tsx:505`; `raptor-port/src/ui/InputsCal.tsx` (about 1248) | D2313: *"all as recommended"* — "A man counts as SANS only from the date his SANS starts, on every screen, and days before it are untouched … a SANS tick made by hand counts from the day it is made"; its row: "left on today's tick, the agent's reading: who may file SANS availability, the Quals tick itself and the Leave War's row"; D2327 confirmed only "the SANS highlight chip, and who may be filed" (filing since moved to by-the-day, D2340) | Every other reader asks "SANS on that day" (`engine/people.ts sansOnP`, the SANS calendar's committed count included — `state/flyplan.ts sansCommittedOn`), while the war's rows ask today's tick for every date; a posting set ahead is covered by his posting window, so the difference falls on hand ticks and unticks, and on days before his SANS date once it has run | Disclosed in D2313's row as the agent's reading; D2327's answer (page `docs/mock/2026-11-22-sans-readings/`, "the two places that go by today") did not show the war; never put | Counts shown wrongly on past days: the war's Available rows and the SANS calendar's "still needed" figure | When: an admin ticks Hex SANS on Quals on Wed 15 Jul (back to the reserves); the Leave War's Mon 13 and Tue 14 Jul then count one WSO fewer available and the SANS calendar shows one more still needed on those days, though Hex was a regular then; unticked again on Wed 22 Jul, Fri 17 Jul counts him both as available and as a SANS committed to fly. Should the war's rows ask whether he was SANS on that day, as every other screen now does? Low harm — for the one list |
| S5-O3 | OPEN READING | The SANS reminder reads the working copy of each week held; on a published day with an amendment waiting it can name a day his own View-only Sched does not show him on yet, and drop one it still shows | `raptor-port/src/leavewar/sansunfiled.ts` (the branch tip: `unfiledNow` → `daySansSeats` over `DAYS` and the saved weeks) | D2338: "on that date his bell tells him the planned days with nothing filed"; D2560 put to him with the case "a scheduler moving SANS men around while building the week" and "the one reminder line follows his planned days while unread"; D2566 (the other line): "as soon as he is planned" | For a week being built the working copy is what he approved (D2560); for a day already published, which copy "planned" reads was never said | Never put for the published-day case — only the code's note ("the schedule as it stands", D2338's row calls it the build's reading) | Told wrongly in a narrow case (a line that runs ahead of, or behind, the schedule he can see) | When: Sat 18 Jul is published with Ranger in the OFT; on Thu 16 Saber swaps Hex in on the working copy and has not issued the amendment. Ranger's reminder drops Sat 18 while his schedule still shows him in the OFT; Hex's names Sat 18 before his schedule shows it. Should the reminder follow the published day until the amendment goes out? Low harm — for the one list |
| S5-O4 | OPEN READING | An offer filed by an admin for two SANS men, one of whom is not SANS on a day it covers: the opened SANS day hides him, its placed line counts only the man shown — but the offer's own window, a tap away, still names both | `raptor-port/src/leavewar/sans-ahead-walk152.test.tsx:139` (comment C0143); the window `raptor-port/src/ui/InputWindow.tsx` | D2341: "it is hidden on every screen and in every count, as if deleted, and shows and counts again by itself once that day is SANS again" | Whether "every screen" reaches the window of the whole record; the builder's reason: hiding him there would let a save drop him from the record | Never put — "told to him" in a closing report only (§3: a closing report in passing is never put); searched D2341's row, the SANS pages, the backlog | Wording only — he is named in the window, not counted | When: Saber files one offer for Ranger and Hex for Fri 17–Sat 18 Jul; Hex's SANS date then moves to Sat 18. Opening Fri 17 shows Ranger alone, "Saber"; tapping it shows "Ranger, Hex". Is that what he wants? Low harm — for the one list |
| S5-O5 | OPEN READING (shared with slice 9's S9-O3) | Past three days, the SANS lines count the rest: the reminder "You're planned on Thu 16, Sat 18, Mon 20 Jul and 1 more with nothing filed."; and, by the same body, the "hidden" sentence of the posting-changed lines | `raptor-port/src/state/notices.ts:1119–1124` (`sansDaysWords`), used at 1105 and 1170–1177 | D2342's row: "The agent's reading, as chat 147 recommended: past three days the line says 'and 2 more'"; D2421 *"Go"* — "built as drawn"; the drawing showed the count ("…Mon 20 Jul and 1 more…", the ticked man's reminder); D2391's words list the hidden days; chat 170 (being recorded, D2600–D2609): *"See what else in the app also has this existing numerical change and perhaps its better to say everything instead."* | New evidence for slice 9: for the reminder the count was in a drawing he approved as drawn — but his newer words ask for every count to be looked at again; for the "hidden" sentence no drawing ever showed a count (each showed one or two days) | Reminder: approved in the drawing (D2421), reopened by chat 170's words. Hidden sentence: never put | Told wrongly in part: days he must file for, or that were hidden, go unnamed | Folds into S9-O3's question: name every day in both SANS lines? |

## Side-by-side tables (step B's questions 14–19; 11 is slice 3's)

### 14. Is a SANS man "planned" on this day

| Surface | What "planned" covers | The ruling it rests on |
|---|---|---|
| The SANS reminder — the branch tip (`1d2ed3415`, `engine/avail.ts daySansSeats`) | a flying seat not cancelled and not exempt (an SC SPARE, a whole AVALON / BB wave stand by unless the row flies), or an OFT / AMT row not cancelled — in a seat, a passenger, or under it; times typed or not | D2564, D2568 (*"both as recommended"*) |
| The SANS reminder — this working copy and `main`'s next merge before the branch lands | any row he is busy on (`dayEngaged`): ground, duty desk, all hands too | the first build's reading, replaced by D2564 — fixed on the branch, not merged |
| An armed seat, the drag's reason | a flying key or a sim key, a spare-like seat carved out | D2564 (the same places) |
| The warning list | the day's flying list and its sim entries (`sansChecks`) | D2564 |
| The crew list, no seat picked | not asked: every SANS man with nothing filed is struck, planned or not | D2420 (no reason line) |
| The ALL AVAIL crowd | any row (`dayEngaged`) | D2329 (*"if hes planned like briefing, hes going to be counted"*) — a different question, ruled |
| A ground row, a duty desk, all hands — his own line | not built | D2566, filed [SANS-INFO-LINE] |
| Which copy the reminder reads | the working copy of each week held | D2560 for a week being built; published day — S5-O3 |

**Verdict: AGREE at the branch tip** (a test there holds the reminder's set equal to the checks' and the armed seat's on
the same days); the crowd's wider set is his. **DIFFER** on which copy — S5-O3. The fix must merge before this copy's
reminder stops counting ground rows (not a new finding: D2564 is filed and built there).

### 15. Is a SANS man with nothing filed, put in a flying seat or a sim, flagged

| Surface | The rule | The ruling it rests on |
|---|---|---|
| The crew list | struck; no reason line | D2420 |
| An armed seat, the drag's reason, the toast | refused, with the reason | the reference app's rule, D2338 / D2340 (the words) |
| The warning list | nothing | none found — S5-O1 |
| His own bell | the reminder | D2338, D2340, D2564 |

**Verdict: DIFFER**, no ruling — S5-O1.

### 16. Is he SANS on this day

| Surface | The rule | The ruling it rests on |
|---|---|---|
| Crew list, seat check, warning list, ALL AVAIL crowd, the reminder, a filing shown or hidden, the SANS calendar's committed count and day list | by the day (`sansOnP`) | D2313, D2329, D2341 |
| Who may be filed for | the day filed (`sansFiler`) | D2340 |
| The SANS highlight chip | today's tick | D2327 |
| The faded days before his date (his view) | his posting not yet run, the day before it | D2343, D2346 |
| The Leave War's SANS group and its Available P / W rows | today's tick, every date | D2313's row, the agent's reading — S5-O2 |
| The Inputs calendar's people groups | today's tick | none found — S5-O2 |

**Verdict: DIFFER** — S5-O2. The war's case is narrower than step B feared: a posting set ahead ends his window on the
war (`leavewar/engine/people.ts inSquadron`), so only hand ticks, unticks and the days before a posting that has run
are read differently.

### 17. Has he filed SANS availability for this day, and does it cover this seat

| Surface | The rule | The ruling it rests on |
|---|---|---|
| Crew list's badge and strike, seat check, warning list | one record a day; the ticked kinds; the window must hold the slot (all day covers a slot past midnight) | the SANS lines of the Inputs page; D2341 |
| The reminder's "nothing filed" | no record on the day (`sansAvailOn`; at the branch tip asked by a label carrying its year) | D2338, D2564 |
| The SANS calendar's figures and day | a record covering the date, shown only where he is SANS that day (`state/flyplan.ts sansCommittedOn`, `ui/sanscal-model.ts sansDayGroups`) | D617, D2341 |
| A second filing for a day | refused, "edit that entry instead" | one commitment a day (on the drawing he approved — D704) |

**Verdict: AGREE.** Step B's unopened half (the calendar's own reading) asks the same record and the same by-the-day
test.

### 18. Is this input late

Step B's table stands as read (the Inputs page always prints LATE; the week's printers obey a scheduler's drop).
**DIFFER, RULED** — D1586, D1620, D1621. The strings that say so (W2067, W2443) match. Medical and upchits are never late
(`engine/inputs.ts isLateInput`, owner 9 Aug 26); the cut-off line says so (W2326).

### 19. Where does this input stand, and does it count him away

Step B read four bodies side by side (`isAway`, `inputFlags`, the crowd's `keptOut`, the war's `warCounts`) and found them
AGREE; not re-read whole here. Spot check: `isAway` and `inputFlags` both skip a cancelled or information-only input
(`inputSilent`) and a rejected one (`inputDormant`); the strings that state it (W1634, W2123, W2131, W2134, W2357,
W0163) match D760, D1374, D1381, D1388. The one place that states it too broadly is the Logic page's line — S5-M2.
**Verdict: AGREE**, with the note that four copies of one rule must all take any new kind or mark.

## Readings checked and found approved (no finding)

- The reminder's title after his SANS date has come: "Your SANS availability is needed." (`sansunfiled.ts`, "the
  coordinator's reading 5, for him to confirm") — D2394 2b's own words cover it: "a man with no SANS date ahead titled
  'Your SANS availability is needed.'"; D2340's older "the words stay the same after the date" was a reading, set aside.
- Which weeks the reminder looks at (the week loaded and his squadron's saved weeks) — D2564's row: "only a scheduler
  puts a man in a seat or a sim, and that makes the week one the app keeps."
- The man himself only, never an admin's bell — slice 9's S9-O5; not filed twice.
- A shared input's list, once a scheduler has added others, is the scheduler's — D755 (3), "taken by his word".
- One man's SANS commitment keeps no date picker (delete and add again) — D681's reading (7) and D620.
- The faded days: his view only, gone from his date — D2346, "shown in the drawing and not changed by him".
- "For now" of the members' switch — his own word (D654, restated in D655 reading 6).

## Coverage ledger

Items: every inventory line whose Slice column names 5 (499: comments 65, words 389, drawings 5, ruled-not-built 34,
specs 6 — 370 of them with 5 first). Each line: id · where · class · ruling. "dropped to slice N" means plainly that
slice's subject; "passed" means a label, heading, button, description or code fragment that states no rule. Added by
this slice beyond the inventory: the SANS words drawing read whole (GD045's strings, each compared with D2340, D2390,
D2391, D2394, D2421, D2564); the branch tip's reminder; step B's questions 14–19.

Counts: MATCH 177 · passed 239 · MISMATCH 3 (two findings) · OPEN READING 2 lines (five findings, three from step B's
questions) · dropped to another slice 78. Items left: none.

- C0019 · src/engine/assumedlanding.test.ts:159 · MATCH · test title; the busy reading of the assumed landing is D2046 (slice 4/13)
- C0025 · src/engine/avail.ts:36 · MATCH · D2046 as ruled
- C0026 · src/engine/avail.ts:288 · MATCH · D2046 as ruled
- C0034 · src/engine/dutyrest.test.ts:314 · MATCH · ordinary "assumed" (D2046 family; slice 13)
- C0035 · src/engine/eventkind.test.ts:8 · MATCH · "assumed" in its ordinary sense
- C0054 (slice 5 named second or later) · src/engine/oilflighttimes.test.ts:16 · MATCH · history of D36/D44 (slice 1)
- C0056 · src/engine/oilopenrow.test.ts:51 · MATCH · D360 assumed length (slice 1/13)
- C0059 (slice 5 named second or later) · src/engine/oilpersonalcrowd.test.ts:14 · dropped to slice 1 · Personal input earns no OIL
- C0060 · src/engine/oilplaceholderclaim.test.ts:426 · MATCH · "his call" = callsign; D854 note words (slice 1)
- C0064 (slice 5 named second or later) · src/engine/publish.ts:569 · dropped to slice 2 · D177–D179 "for now" is his own word
- C0093 · src/engine/rulesfirst-4-availability.test.ts:141 · MATCH · D360, D361
- C0094 · src/engine/rulesfirst-4-availability.test.ts:145 · MATCH · D360
- C0125 (slice 5 named second or later) · src/leavewar/groupinput.test.ts:158 · MATCH · possessive "his to change"; D654/D655 switch
- C0126 (slice 5 named second or later) · src/leavewar/groupinput.test.ts:207-209 · MATCH · D763, D755 (3)
- C0127 (slice 5 named second or later) · src/leavewar/groupinput.test.ts:336 · MATCH · D763
- C0128 (slice 5 named second or later) · src/leavewar/groupinput.test.ts:352-353 · MATCH · D655 filer changes the whole
- C0136 (slice 5 named second or later) · src/leavewar/onerecord-write.test.ts:212 · MATCH · D655 reading 2, D763
- C0137 (slice 5 named second or later) · src/leavewar/onerecord-write.test.ts:234 · MATCH · D655 reading 2
- C0138 (slice 5 named second or later) · src/leavewar/personalseveral.test.ts:139 · MATCH · D763
- C0143 (slice 5 named second or later) · src/leavewar/sans-ahead-walk152.test.tsx:139 · OPEN READING · S5-O4
- C0144 (slice 5 named second or later) · src/leavewar/sans-before.test.tsx:5 · MATCH · D2346 (readings shown in the drawing and kept)
- C0145 (slice 5 named second or later) · src/leavewar/sans-from-date.test.ts:10 · MATCH · D2327 answered (b)
- C0155 (slice 5 named second or later) · src/leavewar/ui/bubblewords.ts:4 · dropped to slice 6 · the bid bubble
- C0160 (slice 5 named second or later) · src/leavewar/ui/flyrows.test.tsx:203 · MATCH · D640 (an admin renames the rows)
- C0167 (slice 5 named second or later) · src/leavewar/ui/namepuck.test.tsx:93 · MATCH · D1697, D1698 ("his call" = callsign)
- C0179 (slice 5 named second or later) · src/state/corelines-bell-moved-admin.test.ts:2 · dropped to slice 9/3 · D2160 bell audit
- C0180 (slice 5 named second or later) · src/state/memberfile.test.ts:3 · MATCH · "for now" is his own word (D654, restated in D655 reading 6)
- C0181 (slice 5 named second or later) · src/state/multi-sqn-job2-inputs.test.ts:82 · dropped to slice 3 · move rules
- C0182 (slice 5 named second or later) · src/state/multi-sqn-job2-inputs.test.ts:93 · dropped to slice 3
- C0183 (slice 5 named second or later) · src/state/notices.ts:149 · dropped to slice 9 (S9-O1/O6 cover it)
- C0184 (slice 5 named second or later) · src/state/notices.ts:179 · dropped to slice 9 (S9-O6)
- C0189 (slice 5 named second or later) · src/state/perms.ts:439 · dropped to slice 3 · question 11 (who may file)
- C0208 · src/ui/audit-e-commit-relink.test.tsx:264 · MATCH · D951, D953
- C0209 (slice 5 named second or later) · src/ui/availopenrow.test.tsx:3 · MATCH · D360 (slice 1)
- C0210 · src/ui/availopenrow.test.tsx:7 · MATCH · D360 words
- C0211 · src/ui/availopenrow.test.tsx:92 · MATCH · D360
- C0212 · src/ui/availopenrow.test.tsx:96 · MATCH · D360
- C0213 (slice 5 named second or later) · src/ui/availopenrow.test.tsx:134 · MATCH · D360
- C0214 · src/ui/availwin.test.tsx:806-808 · MATCH · D360
- C0215 · src/ui/availwin.test.tsx:813 · MATCH · D360
- C0216 (slice 5 named second or later) · src/ui/batch2.test.tsx:410 · MATCH · possessive; D762
- C0217 · src/ui/bellnotices-scenarios.test.tsx:431 · dropped to slice 9 · the bell keeps callsigns of today
- C0221 · src/ui/glowoff-css.test.ts:12 · passed · design (D882), no rule of this slice
- C0225 (slice 5 named second or later) · src/ui/groupeditor.test.tsx:1131 · MATCH · D658 (a SANS member files his own only)
- C0230 · src/ui/inputcard-model.test.ts:29 · MATCH · "his call" = callsign
- C0231 (slice 5 named second or later) · src/ui/inputcx-scenarios.test.tsx:209 · MATCH · D702 wording
- C0232 · src/ui/inputedit.tsx:2222 · MATCH · D702 (ALL AVAIL is nobody to count)
- C0233 (slice 5 named second or later) · src/ui/inputs.test.tsx:487 · MATCH · possessive
- C0234 · src/ui/inputscal-model.ts:147 · MATCH · D702
- C0235 · src/ui/inputscal-model.ts:232 · MATCH · D702
- C0236 (slice 5 named second or later) · src/ui/inputslist.test.tsx:403 · dropped to slice 1 · the OIL? sign, D777 (its readings "to tell him at the build")
- C0237 (slice 5 named second or later) · src/ui/inputssettings.test.tsx:8 · MATCH · D654/D655 "for now" his word; D635, D641, D675
- C0238 (slice 5 named second or later) · src/ui/latepub.test.tsx:6 · dropped to slice 2 · D179 "for now, provisional" is his own word
- C0247 · src/ui/oilclaimcrowd.test.tsx:192 · dropped to slice 1 · OIL claim crowd, "not ruled"
- C0249 · src/ui/oilmode.ts:952 · MATCH · D360 words
- C0253 · src/ui/oilsign.test.tsx:204 · dropped to slice 1 · the OIL sign asked again
- C0254 (slice 5 named second or later) · src/ui/oilsign.ts:121 · dropped to slice 2/1 · D2294 order of save
- C0259 · src/ui/PeoplePick.tsx:48 · passed · "reading of" in its ordinary sense
- C0260 (slice 5 named second or later) · src/ui/phmember.test.tsx:362 · MATCH · D702
- C0263 (slice 5 named second or later) · src/ui/placeholderdoors.test.tsx:775 · MATCH · possessive
- C0268 (slice 5 named second or later) · src/ui/sanscal-model.ts:1 · MATCH · "reading of" ordinary; question 17 AGREE (the calendar asks sansOnP by the day)
- C0269 (slice 5 named second or later) · src/ui/sanscal-model.ts:67 · MATCH · D2346 (readings shown in the drawing and kept)
- C0270 · src/ui/schedule-tab.test.tsx:395 · passed · keyboard route, no rule of this slice
- C0274 (slice 5 named second or later) · src/ui/windowreads.test.tsx:220 · MATCH · possessive
- C0275 (slice 5 named second or later) · src/ui/windowreads.test.tsx:244 · MATCH · D762 (slice 1)
- W0012 (slice 5 named second or later) · src/leavewar/ui/ApprovalsPage.tsx:474 · passed · a label, heading, button or description — states no rule
- W0021 (slice 5 named second or later) · src/leavewar/ui/ApprovalsPage.tsx:569 · MATCH · D2313 / question 16 (the war's SANS row) — see S5-O2
- W0058 (slice 5 named second or later) · src/leavewar/ui/BidPicker.tsx:92 · passed · a label, heading, button or description — states no rule
- W0068 (slice 5 named second or later) · src/leavewar/ui/BidPicker.tsx:702 · dropped to slice 6
- W0100 (slice 5 named second or later) · src/leavewar/ui/BidPicker.tsx:1163 · dropped to slice 6/1
- W0106 (slice 5 named second or later) · src/leavewar/ui/BidPicker.tsx:1250 · passed · a label, heading, button or description — states no rule
- W0108 (slice 5 named second or later) · src/leavewar/ui/BidPicker.tsx:1276 · dropped to slice 6
- W0109 (slice 5 named second or later) · src/leavewar/ui/BidPicker.tsx:1280 · passed · a label, heading, button or description — states no rule
- W0110 (slice 5 named second or later) · src/leavewar/ui/BidPicker.tsx:1281 · dropped to slice 6
- W0125 (slice 5 named second or later) · src/leavewar/ui/Chrome.tsx:56 · passed · a label, heading, button or description — states no rule
- W0163 (slice 5 named second or later) · src/leavewar/ui/Chrome.tsx:580 · MATCH · D1374, D1381 (question 19)
- W0178 (slice 5 named second or later) · src/leavewar/ui/Chrome.tsx:598 · dropped to slice 6
- W0190 (slice 5 named second or later) · src/leavewar/ui/clashwhat.ts:14 · dropped to slice 6/1
- W0191 (slice 5 named second or later) · src/leavewar/ui/clashwhat.ts:15 · dropped to slice 6
- W0192 (slice 5 named second or later) · src/leavewar/ui/ClosedNoteSheet.tsx:26 · dropped to slice 6
- W0202 (slice 5 named second or later) · src/leavewar/ui/ClosedNoteSheet.tsx:115 · passed · a label, heading, button or description — states no rule
- W0233 (slice 5 named second or later) · src/leavewar/ui/CounterForm.tsx:505 · OPEN READING · S5-O2 ("never counted" by today's tick)
- W0240 (slice 5 named second or later) · src/leavewar/ui/CountRows.tsx:202 · dropped to slice 6
- W0259 (slice 5 named second or later) · src/leavewar/ui/DayList.tsx:304 · passed · a label, heading, button or description — states no rule
- W0348 (slice 5 named second or later) · src/leavewar/ui/FlyRows.tsx:399 · passed · a label, heading, button or description — states no rule
- W0349 (slice 5 named second or later) · src/leavewar/ui/FlyRows.tsx:400 · passed · a label, heading, button or description — states no rule
- W0367 (slice 5 named second or later) · src/leavewar/ui/LeaveButtons.tsx:84 · dropped to slice 6
- W0379 (slice 5 named second or later) · src/leavewar/ui/Matrix.tsx:97 · dropped to slice 6
- W0426 (slice 5 named second or later) · src/leavewar/ui/NamePuck.tsx:42 · passed · a label, heading, button or description — states no rule
- W0498 (slice 5 named second or later) · src/leavewar/ui/outcomewords.ts:19 · MATCH · D283 (the posting line)
- W0545 (slice 5 named second or later) · src/leavewar/ui/ReqWords.tsx:212 · dropped to slice 6
- W0556 (slice 5 named second or later) · src/leavewar/ui/SelectSheet.tsx:406 · dropped to slice 6
- W0557 (slice 5 named second or later) · src/leavewar/ui/SelectSheet.tsx:408 · dropped to slice 6
- W0605 (slice 5 named second or later) · src/leavewar/ui/SettingsSheet.tsx:368 · passed · a label, heading, button or description — states no rule
- W0613 (slice 5 named second or later) · src/leavewar/ui/SettingsSheet.tsx:458 · MATCH · the war's SANS group setting (owner 18 Aug 26)
- W0724 · src/state/inputgate-hook.ts:21 · passed · a label, heading, button or description — states no rule
- W0738 · src/state/notices.ts:895 · MATCH · D2342 name
- W0744 · src/state/notices.ts:1065 · MATCH · bell label (slice 9)
- W0745 · src/state/notices.ts:1066 · MATCH · bell label (slice 9)
- W0747 (slice 5 named second or later) · src/state/notices.ts:1077 · dropped to slice 1/9
- W0748 · src/state/notices.ts:1161 · MATCH · D2391 A, D
- W0749 · src/state/notices.ts:1163 · MATCH · D2391 B, E
- W0750 · src/state/notices.ts:1172 · MATCH · D2391 words
- W0751 · src/state/notices.ts:1175 · MATCH · D2391 A
- W0752 · src/state/notices.ts:1177 · MATCH · D2391 B, C
- W0753 · src/state/notices.ts:1215 · MATCH · D2340 title
- W0754 · src/state/notices.ts:1215 · MATCH · D2394 2b title
- W0756 · src/state/people-settings-commit.ts:388 · passed · an internal refusal no person reads in use
- W0783 · src/state/reports.ts:34 · passed · a label, heading, button or description — states no rule
- W0796 · src/state/roster-restore.ts:96 · dropped to slice 3
- W0834 · src/state/view.ts:1441 · passed · a label
- W1171 (slice 5 named second or later) · src/tracker/components/Modals.jsx:254 · dropped to slice 8
- W1255 (slice 5 named second or later) · src/tracker/components/SidePanel.jsx:282 · dropped to slice 8
- W1327 (slice 5 named second or later) · src/tracker/data/eventInfo.js:2 · dropped to slice 8
- W1528 (slice 5 named second or later) · src/ui/AdminPage.tsx:185 · dropped to slice 10
- W1561 · src/ui/AvailWindow.tsx:50 · passed · code, not words
- W1562 · src/ui/AvailWindow.tsx:223 · passed · a label, heading, button or description — states no rule
- W1563 · src/ui/AvailWindow.tsx:225 · MATCH · D760 (a cancelled row works out nobody)
- W1564 · src/ui/AvailWindow.tsx:226 · MATCH · D814, D816
- W1565 · src/ui/AvailWindow.tsx:227 · MATCH
- W1566 · src/ui/AvailWindow.tsx:228 · MATCH · D360
- W1567 · src/ui/AvailWindow.tsx:279 · dropped to slice 1
- W1568 · src/ui/AvailWindow.tsx:280 · passed · a label, heading, button or description — states no rule
- W1569 (slice 5 named second or later) · src/ui/AvailWindow.tsx:289 · dropped to slice 1
- W1570 · src/ui/AvailWindow.tsx:325 · dropped to slice 1
- W1571 (slice 5 named second or later) · src/ui/AvailWindow.tsx:345 · dropped to slice 1
- W1572 · src/ui/AvailWindow.tsx:347 · dropped to slice 1
- W1573 · src/ui/AvailWindow.tsx:348 · dropped to slice 1
- W1574 · src/ui/AvailWindow.tsx:352 · dropped to slice 1
- W1575 · src/ui/AvailWindow.tsx:355 · passed · a label, heading, button or description — states no rule
- W1576 · src/ui/AvailWindow.tsx:365 · MATCH · label
- W1577 · src/ui/AvailWindow.tsx:380 · passed · a label, heading, button or description — states no rule
- W1578 · src/ui/AvailWindow.tsx:388 · passed · a label, heading, button or description — states no rule
- W1579 (slice 5 named second or later) · src/ui/AvailWindow.tsx:392 · passed · a label, heading, button or description — states no rule
- W1580 · src/ui/AvailWindow.tsx:408 · passed · a label, heading, button or description — states no rule
- W1583 · src/ui/board-html.ts:131 · passed · a label, heading, button or description — states no rule
- W1585 · src/ui/board-html.ts:141 · MATCH · empty state
- W1627 · src/ui/board-html.ts:635 · MATCH · D1356 (a personal input lands on the Ground Programme)
- W1629 · src/ui/board-html.ts:635 · passed · a label, heading, button or description — states no rule
- W1633 · src/ui/board-html.ts:838 · passed · a label, heading, button or description — states no rule
- W1634 · src/ui/board-html.ts:844 · MATCH · question 19 (a rejected input is dormant)
- W1635 · src/ui/board-html.ts:859 · MATCH · description
- W1637 · src/ui/board-html.ts:861 · passed · a label, heading, button or description — states no rule
- W1638 · src/ui/board-html.ts:884 · passed · a label, heading, button or description — states no rule
- W1639 · src/ui/board-html.ts:889 · MATCH · empty state
- W1701 · src/ui/board.ts:1628 · dropped to slice 4
- W1736 · src/ui/caldrag.ts:114 · MISMATCH · S5-M1
- W1801 · src/ui/DocConfirm.tsx:48 · MATCH · document door (D965)
- W1809 · src/ui/DocViewer.tsx:183 · passed · a label, heading, button or description — states no rule
- W1906 (slice 5 named second or later) · src/ui/hlchips-model.ts:17 · passed · a label, heading, button or description — states no rule
- W2021 · src/ui/html.ts:936 · passed · a label, heading, button or description — states no rule
- W2022 · src/ui/html.ts:943 · MATCH · description
- W2026 · src/ui/html.ts:1006 · MATCH · label
- W2027 · src/ui/html.ts:1022 · passed · a label, heading, button or description — states no rule
- W2055 · src/ui/html.ts:1462 · dropped to slice 4
- W2067 · src/ui/html.ts:1550 · MATCH · D1586, D1620, D1621 (question 18)
- W2123 · src/ui/html.ts:2239 · MATCH · question 19
- W2125 · src/ui/html.ts:2281 · passed · a label, heading, button or description — states no rule
- W2130 · src/ui/html.ts:2378 · passed · a label, heading, button or description — states no rule
- W2131 · src/ui/html.ts:2410 · MATCH · question 19
- W2134 · src/ui/html.ts:2474 · MATCH · D1388
- W2136 · src/ui/html.ts:2475 · MATCH · D1388
- W2141 · src/ui/html.ts:2496 · passed · a label, heading, button or description — states no rule
- W2159 · src/ui/inputcard-model.ts:153 · passed · a label, heading, button or description — states no rule
- W2160 · src/ui/InputCard.tsx:81 · passed · a label, heading, button or description — states no rule
- W2161 (slice 5 named second or later) · src/ui/InputCard.tsx:82 · passed · a label, heading, button or description — states no rule
- W2162 · src/ui/InputCard.tsx:83 · passed · a label, heading, button or description — states no rule
- W2163 · src/ui/InputCard.tsx:84 · passed · a label, heading, button or description — states no rule
- W2164 (slice 5 named second or later) · src/ui/inputedit.tsx:170 · dropped to slice 3 · leave across a move
- W2165 · src/ui/inputedit.tsx:263 · passed · a label, heading, button or description — states no rule
- W2166 · src/ui/inputedit.tsx:265 · passed · a label, heading, button or description — states no rule
- W2167 · src/ui/inputedit.tsx:266 · passed · a label, heading, button or description — states no rule
- W2168 · src/ui/inputedit.tsx:319 · MATCH · D2340 (by the day filed)
- W2169 · src/ui/inputedit.tsx:345 · MATCH · D2394 Q10 words
- W2170 · src/ui/inputedit.tsx:349 · passed · a label, heading, button or description — states no rule
- W2171 · src/ui/inputedit.tsx:397 · MATCH · D2394 Q1, D2388 words
- W2172 · src/ui/inputedit.tsx:432 · MATCH · one commitment a day (on the drawing he approved; D704)
- W2173 · src/ui/inputedit.tsx:461 · MATCH
- W2174 · src/ui/inputedit.tsx:478 · MATCH
- W2175 · src/ui/inputedit.tsx:485 · MATCH
- W2176 · src/ui/inputedit.tsx:488 · MATCH
- W2177 · src/ui/inputedit.tsx:508 · MATCH
- W2178 · src/ui/inputedit.tsx:614 · MATCH
- W2179 · src/ui/inputedit.tsx:755 · MATCH
- W2180 · src/ui/inputedit.tsx:772 · MATCH
- W2181 · src/ui/inputedit.tsx:780 · passed · a label, heading, button or description — states no rule
- W2182 · src/ui/inputedit.tsx:787 · MATCH · D655 reading 4 (medical is its own)
- W2183 · src/ui/inputedit.tsx:790 · MATCH
- W2184 · src/ui/inputedit.tsx:811 · MATCH
- W2185 · src/ui/inputedit.tsx:837 · MATCH · D965
- W2186 (slice 5 named second or later) · src/ui/inputedit.tsx:982 · dropped to slice 1
- W2187 · src/ui/inputedit.tsx:1139 · MATCH · D654/D655 switch
- W2188 · src/ui/inputedit.tsx:1141 · passed · a label, heading, button or description — states no rule
- W2189 (slice 5 named second or later) · src/ui/inputedit.tsx:1174 · MATCH
- W2190 · src/ui/inputedit.tsx:1262 · MATCH · D1356 family
- W2191 · src/ui/inputedit.tsx:1315 · MATCH
- W2192 · src/ui/inputedit.tsx:1336 · passed · a label, heading, button or description — states no rule
- W2193 · src/ui/inputedit.tsx:1346 · MATCH · D681
- W2194 · src/ui/inputedit.tsx:1357 · MATCH · D755 (2) swap is a scheduler's
- W2195 · src/ui/inputedit.tsx:1373 · MATCH · D1388
- W2196 · src/ui/inputedit.tsx:1709 · passed · a label, heading, button or description — states no rule
- W2197 · src/ui/inputedit.tsx:1710 · MATCH
- W2198 · src/ui/inputedit.tsx:1713 · MATCH
- W2199 · src/ui/inputedit.tsx:1779 · passed · a label, heading, button or description — states no rule
- W2200 · src/ui/inputedit.tsx:1855 · MATCH
- W2201 · src/ui/inputedit.tsx:1867 · MATCH
- W2202 · src/ui/inputedit.tsx:1871 · MATCH · D681
- W2203 · src/ui/inputedit.tsx:2094 · passed · a label, heading, button or description — states no rule
- W2204 · src/ui/inputedit.tsx:2105 · passed · a label, heading, button or description — states no rule
- W2205 (slice 5 named second or later) · src/ui/inputedit.tsx:2155 · MATCH · D731 (8) words
- W2206 (slice 5 named second or later) · src/ui/inputedit.tsx:2159 · MATCH · D755 (3)
- W2207 (slice 5 named second or later) · src/ui/inputedit.tsx:2161 · MATCH · D655, D763
- W2208 · src/ui/inputedit.tsx:2238 · passed · a label, heading, button or description — states no rule
- W2209 · src/ui/inputedit.tsx:2261 · passed · a label, heading, button or description — states no rule
- W2210 · src/ui/inputedit.tsx:2274 · MATCH · D1388 (a placeholder is never under Unavailable)
- W2211 · src/ui/inputedit.tsx:2560 · passed · a label, heading, button or description — states no rule
- W2212 · src/ui/inputscal-model.ts:199 · passed · a label, heading, button or description — states no rule
- W2213 · src/ui/InputsCal.tsx:531 · passed · a label, heading, button or description — states no rule
- W2214 (slice 5 named second or later) · src/ui/InputsCal.tsx:982 · MISMATCH · S5-M1
- W2215 · src/ui/InputsCal.tsx:1003 · passed · a label, heading, button or description — states no rule
- W2216 · src/ui/InputsCal.tsx:1004 · passed · a label, heading, button or description — states no rule
- W2217 · src/ui/InputsCal.tsx:1013 · passed · a label, heading, button or description — states no rule
- W2218 · src/ui/InputsCal.tsx:1028 · passed · a label, heading, button or description — states no rule
- W2219 · src/ui/InputsCal.tsx:1036 · passed · a label, heading, button or description — states no rule
- W2220 · src/ui/InputsCal.tsx:1037 · passed · a label, heading, button or description — states no rule
- W2221 · src/ui/InputsCal.tsx:1050 · passed · a label, heading, button or description — states no rule
- W2222 · src/ui/InputsCal.tsx:1074 · passed · a label, heading, button or description — states no rule
- W2223 · src/ui/InputsCal.tsx:1074 · passed · a label, heading, button or description — states no rule
- W2224 · src/ui/InputsCal.tsx:1075 · passed · a label, heading, button or description — states no rule
- W2225 · src/ui/InputsCal.tsx:1077 · passed · a label, heading, button or description — states no rule
- W2226 · src/ui/InputsCal.tsx:1077 · passed · a label, heading, button or description — states no rule
- W2227 · src/ui/InputsCal.tsx:1083 · passed · a label, heading, button or description — states no rule
- W2228 · src/ui/InputsCal.tsx:1092 · passed · a label, heading, button or description — states no rule
- W2229 · src/ui/InputsCal.tsx:1153 · passed · a label, heading, button or description — states no rule
- W2230 · src/ui/InputsCal.tsx:1154 · passed · a label, heading, button or description — states no rule
- W2231 · src/ui/InputsCal.tsx:1158 · passed · a label, heading, button or description — states no rule
- W2232 · src/ui/InputsCal.tsx:1168 · passed · a label, heading, button or description — states no rule
- W2233 · src/ui/InputsCal.tsx:1169 · MATCH · empty state
- W2234 · src/ui/InputsCal.tsx:1176 · passed · a label, heading, button or description — states no rule
- W2235 · src/ui/InputsCal.tsx:1195 · passed · a label, heading, button or description — states no rule
- W2236 · src/ui/InputsCal.tsx:1197 · MATCH · D1624 family; D702 count
- W2237 · src/ui/InputsCal.tsx:1197 · passed · a label, heading, button or description — states no rule
- W2238 · src/ui/InputsCal.tsx:1257 · passed · a label, heading, button or description — states no rule
- W2239 · src/ui/InputsCal.tsx:1265 · passed · a label, heading, button or description — states no rule
- W2240 · src/ui/InputsCal.tsx:1278 · passed · a label, heading, button or description — states no rule
- W2241 · src/ui/InputsCal.tsx:1281 · passed · a label, heading, button or description — states no rule
- W2242 · src/ui/InputsCal.tsx:1293 · MATCH · label
- W2243 · src/ui/InputsCal.tsx:1312 · passed · a label, heading, button or description — states no rule
- W2244 · src/ui/InputsCal.tsx:1329 · passed · a label, heading, button or description — states no rule
- W2245 · src/ui/InputsCal.tsx:1333 · passed · a label, heading, button or description — states no rule
- W2246 · src/ui/InputsCal.tsx:1334 · passed · a label, heading, button or description — states no rule
- W2247 · src/ui/InputsCal.tsx:1338 · passed · a label, heading, button or description — states no rule
- W2248 · src/ui/InputsCal.tsx:1350 · passed · a label, heading, button or description — states no rule
- W2249 · src/ui/InputsCal.tsx:1351 · passed · a label, heading, button or description — states no rule
- W2250 · src/ui/InputsCal.tsx:1354 · passed · a label, heading, button or description — states no rule
- W2251 · src/ui/InputsCal.tsx:1354 · passed · a label, heading, button or description — states no rule
- W2252 · src/ui/InputsCal.tsx:1360 · passed · a label, heading, button or description — states no rule
- W2253 · src/ui/InputsCal.tsx:1360 · passed · a label, heading, button or description — states no rule
- W2254 · src/ui/InputsCal.tsx:1360 · passed · a label, heading, button or description — states no rule
- W2255 · src/ui/InputsCal.tsx:1361 · passed · a label, heading, button or description — states no rule
- W2256 · src/ui/InputsCal.tsx:1361 · MATCH · D621
- W2257 · src/ui/InputsCal.tsx:1362 · MATCH · D627, D665
- W2258 · src/ui/InputsCal.tsx:1447 · MATCH · D1386
- W2259 · src/ui/InputsPage.tsx:87 · passed · a label, heading, button or description — states no rule
- W2260 · src/ui/InputsPage.tsx:98 · passed · a label, heading, button or description — states no rule
- W2261 (slice 5 named second or later) · src/ui/InputsPage.tsx:447 · passed · a label, heading, button or description — states no rule
- W2262 · src/ui/InputsPage.tsx:500 · passed · a label, heading, button or description — states no rule
- W2263 · src/ui/InputsPage.tsx:552 · passed · a label, heading, button or description — states no rule
- W2264 · src/ui/InputsPage.tsx:590 · passed · a label, heading, button or description — states no rule
- W2265 · src/ui/InputsPage.tsx:593 · MATCH · tab description
- W2266 · src/ui/InputsPage.tsx:593 · MATCH · D617
- W2267 · src/ui/InputsPage.tsx:594 · MATCH · D965
- W2268 · src/ui/InputsPage.tsx:596 · passed · a label, heading, button or description — states no rule
- W2269 · src/ui/InputsPage.tsx:600 · passed · a label, heading, button or description — states no rule
- W2270 · src/ui/InputsPage.tsx:601 · passed · a label, heading, button or description — states no rule
- W2271 · src/ui/InputsPage.tsx:617 · passed · a label, heading, button or description — states no rule
- W2272 · src/ui/InputsPage.tsx:618 · passed · a label, heading, button or description — states no rule
- W2273 · src/ui/InputsPage.tsx:618 · passed · a label, heading, button or description — states no rule
- W2274 · src/ui/InputsPage.tsx:620 · passed · a label, heading, button or description — states no rule
- W2275 · src/ui/InputsPage.tsx:636 · passed · a label, heading, button or description — states no rule
- W2276 · src/ui/InputsPage.tsx:648 · passed · a label, heading, button or description — states no rule
- W2277 · src/ui/InputsPage.tsx:652 · passed · a label, heading, button or description — states no rule
- W2278 · src/ui/InputsPage.tsx:653 · passed · a label, heading, button or description — states no rule
- W2279 · src/ui/InputsPage.tsx:659 · passed · a label, heading, button or description — states no rule
- W2280 · src/ui/InputsPage.tsx:660 · passed · a label, heading, button or description — states no rule
- W2281 · src/ui/InputsPage.tsx:662 · passed · a label, heading, button or description — states no rule
- W2282 · src/ui/InputsPage.tsx:669 · MATCH · D628, D654, D675
- W2283 · src/ui/InputsPage.tsx:670 · passed · a label, heading, button or description — states no rule
- W2284 · src/ui/InputsPage.tsx:677 · passed · a label, heading, button or description — states no rule
- W2285 · src/ui/InputsPage.tsx:693 · passed · a label, heading, button or description — states no rule
- W2286 · src/ui/InputsPage.tsx:726 · passed · a label, heading, button or description — states no rule
- W2287 · src/ui/InputsPage.tsx:741 · MATCH
- W2288 · src/ui/InputsPage.tsx:741 · passed · a label, heading, button or description — states no rule
- W2289 · src/ui/InputsPage.tsx:746 · MATCH
- W2290 · src/ui/InputsPage.tsx:748 · passed · a label, heading, button or description — states no rule
- W2291 · src/ui/InputsPage.tsx:749 · passed · a label, heading, button or description — states no rule
- W2292 · src/ui/InputsPage.tsx:783 · passed · a quoted note of his in code (export removed on his word)
- W2293 · src/ui/InputsPage.tsx:784 · passed · a label, heading, button or description — states no rule
- W2294 · src/ui/InputsPage.tsx:881 · passed · a label, heading, button or description — states no rule
- W2295 · src/ui/InputsPage.tsx:884 · passed · a label, heading, button or description — states no rule
- W2296 · src/ui/InputsPage.tsx:885 · passed · a label, heading, button or description — states no rule
- W2297 · src/ui/InputsPage.tsx:885 · passed · a label, heading, button or description — states no rule
- W2298 · src/ui/InputsPage.tsx:899 · passed · code
- W2299 · src/ui/InputsPage.tsx:917 · passed · a label, heading, button or description — states no rule
- W2300 · src/ui/InputsPage.tsx:917 · passed · a label, heading, button or description — states no rule
- W2301 · src/ui/InputsPage.tsx:918 · passed · a label, heading, button or description — states no rule
- W2302 · src/ui/InputsPage.tsx:918 · passed · a label, heading, button or description — states no rule
- W2303 · src/ui/InputsPage.tsx:920 · passed · a label, heading, button or description — states no rule
- W2304 · src/ui/InputsPage.tsx:929 · passed · a label, heading, button or description — states no rule
- W2305 · src/ui/InputsPage.tsx:930 · passed · a label, heading, button or description — states no rule
- W2306 · src/ui/InputsPage.tsx:932 · passed · a label, heading, button or description — states no rule
- W2307 · src/ui/InputsPage.tsx:940 · passed · a label, heading, button or description — states no rule
- W2308 · src/ui/InputsPage.tsx:945 · passed · a label, heading, button or description — states no rule
- W2309 (slice 5 named second or later) · src/ui/InputsPage.tsx:964 · passed · a label, heading, button or description — states no rule
- W2310 (slice 5 named second or later) · src/ui/InputsPage.tsx:965 · passed · a label, heading, button or description — states no rule
- W2311 (slice 5 named second or later) · src/ui/InputsPage.tsx:975 · dropped to slice 1
- W2312 (slice 5 named second or later) · src/ui/InputsPage.tsx:976 · dropped to slice 1
- W2313 (slice 5 named second or later) · src/ui/InputsPage.tsx:977 · passed · a label, heading, button or description — states no rule
- W2314 · src/ui/InputsPage.tsx:985 · dropped to slice 1
- W2315 (slice 5 named second or later) · src/ui/InputsPage.tsx:986 · dropped to slice 1
- W2316 · src/ui/InputsPage.tsx:998 · MATCH · empty state
- W2317 · src/ui/InputsPage.tsx:1000 · MATCH · empty state
- W2318 · src/ui/InputsPage.tsx:1001 · passed · a label, heading, button or description — states no rule
- W2319 · src/ui/InputsSettings.tsx:66 · MATCH
- W2320 · src/ui/InputsSettings.tsx:68 · MATCH
- W2321 · src/ui/InputsSettings.tsx:83 · passed · a label, heading, button or description — states no rule
- W2322 · src/ui/InputsSettings.tsx:85 · passed · a label, heading, button or description — states no rule
- W2323 · src/ui/InputsSettings.tsx:87 · passed · a label, heading, button or description — states no rule
- W2324 · src/ui/InputsSettings.tsx:92 · MATCH · D675
- W2325 · src/ui/InputsSettings.tsx:95 · passed · a label, heading, button or description — states no rule
- W2326 · src/ui/InputsSettings.tsx:97 · MATCH · late rule (owner 9 Aug 26: medical decided by the medical officer)
- W2327 · src/ui/InputsSettings.tsx:99 · passed · a label, heading, button or description — states no rule
- W2328 (slice 5 named second or later) · src/ui/InputsSettings.tsx:102 · MATCH · D655 (the switch, its words shortened by D729)
- W2329 · src/ui/InputsSettings.tsx:104 · MATCH · D655, D658
- W2330 · src/ui/InputsSettings.tsx:108 · passed · a label, heading, button or description — states no rule
- W2331 · src/ui/InputsSettings.tsx:109 · passed · a label, heading, button or description — states no rule
- W2332 · src/ui/InputWindow.tsx:63 · passed · a label, heading, button or description — states no rule
- W2333 · src/ui/InputWindow.tsx:77 · passed · a label, heading, button or description — states no rule
- W2334 · src/ui/InputWindow.tsx:128 · passed · a label, heading, button or description — states no rule
- W2335 · src/ui/InputWindow.tsx:130 · passed · a label, heading, button or description — states no rule
- W2336 · src/ui/InputWindow.tsx:135 · passed · a label, heading, button or description — states no rule
- W2337 · src/ui/InputWindow.tsx:135 · MATCH
- W2338 · src/ui/InputWindow.tsx:376 · MATCH
- W2339 · src/ui/InputWindow.tsx:390 · MATCH
- W2340 · src/ui/InputWindow.tsx:431 · MATCH
- W2341 · src/ui/InputWindow.tsx:572 · passed · a label, heading, button or description — states no rule
- W2342 · src/ui/InputWindow.tsx:592 · passed · a label, heading, button or description — states no rule
- W2343 · src/ui/InputWindow.tsx:592 · MATCH
- W2344 · src/ui/InputWindow.tsx:673 · passed · a label, heading, button or description — states no rule
- W2345 · src/ui/InputWindow.tsx:703 · MATCH · D655 reading 4
- W2346 · src/ui/InputWindow.tsx:797 · passed · a label, heading, button or description — states no rule
- W2347 · src/ui/InputWindow.tsx:822 · passed · a label, heading, button or description — states no rule
- W2348 · src/ui/InputWindow.tsx:921 · passed · a label, heading, button or description — states no rule
- W2349 · src/ui/InputWindow.tsx:933 · passed · a label, heading, button or description — states no rule
- W2350 · src/ui/InputWindow.tsx:950 · passed · a label, heading, button or description — states no rule
- W2351 · src/ui/InputWindow.tsx:988 · passed · a label, heading, button or description — states no rule
- W2352 · src/ui/InputWindow.tsx:996 · passed · a label, heading, button or description — states no rule
- W2353 · src/ui/InputWindow.tsx:1018 · passed · a label, heading, button or description — states no rule
- W2354 (slice 5 named second or later) · src/ui/InputWindow.tsx:1018 · passed · a label, heading, button or description — states no rule
- W2355 · src/ui/InputWindow.tsx:1029 · passed · a label, heading, button or description — states no rule
- W2356 · src/ui/InputWindow.tsx:1039 · passed · a label, heading, button or description — states no rule
- W2357 · src/ui/InputWindow.tsx:1040 · MATCH · D1374, D1388
- W2358 · src/ui/InputWindow.tsx:1041 · passed · a label, heading, button or description — states no rule
- W2359 · src/ui/InputWindow.tsx:1041 · MATCH · D1374
- W2360 · src/ui/InputWindow.tsx:1050 · passed · a label, heading, button or description — states no rule
- W2361 · src/ui/InputWindow.tsx:1052 · passed · a label, heading, button or description — states no rule
- W2362 · src/ui/InputWindow.tsx:1061 · passed · a label, heading, button or description — states no rule
- W2363 · src/ui/InputWindow.tsx:1081 · passed · a label, heading, button or description — states no rule
- W2364 · src/ui/InputWindow.tsx:1083 · passed · a label, heading, button or description — states no rule
- W2365 · src/ui/InputWindow.tsx:1085 · passed · a label, heading, button or description — states no rule
- W2366 · src/ui/InputWindow.tsx:1097 · passed · a label, heading, button or description — states no rule
- W2367 · src/ui/InputWindow.tsx:1120 · passed · a label, heading, button or description — states no rule
- W2368 · src/ui/InputWindow.tsx:1152 · passed · a label, heading, button or description — states no rule
- W2369 (slice 5 named second or later) · src/ui/InputWindow.tsx:1174 · passed · a label, heading, button or description — states no rule
- W2370 · src/ui/InputWindow.tsx:1178 · passed · a label, heading, button or description — states no rule
- W2371 · src/ui/InputWindow.tsx:1194 · passed · a label, heading, button or description — states no rule
- W2372 · src/ui/InputWindow.tsx:1204 · passed · a label, heading, button or description — states no rule
- W2373 · src/ui/InputWindow.tsx:1205 · passed · a label, heading, button or description — states no rule
- W2374 · src/ui/InputWindow.tsx:1206 · passed · code comment fragment
- W2375 · src/ui/InputWindow.tsx:1217 · MATCH · D681 family (one input for the range)
- W2376 · src/ui/InputWindow.tsx:1220 · MATCH · upchit (D1022)
- W2377 · src/ui/InputWindow.tsx:1222 · MATCH
- W2378 · src/ui/InputWindow.tsx:1224 · MATCH
- W2379 · src/ui/InputWindow.tsx:1225 · MATCH
- W2380 · src/ui/InputWindow.tsx:1229 · MATCH · D681
- W2381 · src/ui/InputWindow.tsx:1229 · MATCH · D681
- W2382 · src/ui/InputWindow.tsx:1231 · MATCH · D681 reading (7); D620 (one man's SANS commitment)
- W2383 · src/ui/InputWindow.tsx:1233 · MATCH
- W2384 · src/ui/InputWindow.tsx:1234 · MATCH
- W2385 · src/ui/InputWindow.tsx:1241 · passed · a label, heading, button or description — states no rule
- W2386 · src/ui/InputWindow.tsx:1243 · passed · a label, heading, button or description — states no rule
- W2387 · src/ui/InputWindow.tsx:1244 · passed · a label, heading, button or description — states no rule
- W2388 · src/ui/InputWindow.tsx:1250 · passed · a label, heading, button or description — states no rule
- W2389 · src/ui/InputWindow.tsx:1252 · passed · a label, heading, button or description — states no rule
- W2390 · src/ui/InputWindow.tsx:1253 · passed · a label, heading, button or description — states no rule
- W2391 · src/ui/InputWindow.tsx:1268 · passed · a label, heading, button or description — states no rule
- W2392 (slice 5 named second or later) · src/ui/InputWindow.tsx:1274 · MATCH · D655
- W2393 · src/ui/InputWindow.tsx:1352 · passed · a label, heading, button or description — states no rule
- W2394 · src/ui/InputWindow.tsx:1355 · passed · a label, heading, button or description — states no rule
- W2395 · src/ui/InputWindow.tsx:1356 · passed · a label, heading, button or description — states no rule
- W2396 · src/ui/InputWindow.tsx:1368 · MATCH · D1622
- W2397 · src/ui/InputWindow.tsx:1370 · passed · a label, heading, button or description — states no rule
- W2398 · src/ui/InputWindow.tsx:1380 · passed · a label, heading, button or description — states no rule
- W2399 · src/ui/InputWindow.tsx:1386 · passed · a label, heading, button or description — states no rule
- W2400 · src/ui/InputWindow.tsx:1393 · passed · a label, heading, button or description — states no rule
- W2401 · src/ui/InputWindow.tsx:1412 · passed · a label, heading, button or description — states no rule
- W2425 · src/ui/interactions.ts:225 · passed · a label, heading, button or description — states no rule
- W2439 · src/ui/interactions.ts:1045 · passed · a label, heading, button or description — states no rule
- W2440 · src/ui/interactions.ts:1048 · passed · a label, heading, button or description — states no rule
- W2443 · src/ui/interactions.ts:1262 · MATCH · D1586 (question 18)
- W2446 · src/ui/interactions.ts:1341 · MATCH
- W2448 · src/ui/interactions.ts:1352 · passed · a label, heading, button or description — states no rule
- W2449 · src/ui/interactions.ts:1352 · MATCH
- W2450 · src/ui/interactions.ts:1386 · MATCH
- W2458 (slice 5 named second or later) · src/ui/interactions.ts:1620 · passed · a label, heading, button or description — states no rule
- W2460 · src/ui/interactions.ts:1678 · passed · a label, heading, button or description — states no rule
- W2478 · src/ui/interactions.ts:2060 · dropped to slice 4
- W2495 · src/ui/logic-html.ts:69 · passed · a label, heading, button or description — states no rule
- W2496 · src/ui/logic-html.ts:70 · passed · a label, heading, button or description — states no rule
- W2504 · src/ui/logic-html.ts:109 · dropped to slice 4 · crew-rest rule text
- W2536 · src/ui/logic-html.ts:183 · passed · a label, heading, button or description — states no rule
- W2537 · src/ui/logic-html.ts:184 · passed · a label, heading, button or description — states no rule
- W2538 · src/ui/logic-html.ts:184 · MISMATCH · S5-M2 (wording only)
- W2550 (slice 5 named second or later) · src/ui/logic-html.ts:207 · dropped to slice 1
- W2557 (slice 5 named second or later) · src/ui/logic-html.ts:215 · dropped to slice 1
- W2566 · src/ui/LogicPage.tsx:105 · MATCH · label
- W2630 · src/ui/MedMoveConfirm.tsx:36 · MATCH
- W2659 (slice 5 named second or later) · src/ui/oilday.ts:63 · passed · a label, heading, button or description — states no rule
- W2660 (slice 5 named second or later) · src/ui/oilday.ts:63 · passed · a label, heading, button or description — states no rule
- W2721 · src/ui/oilwait.ts:48 · passed · a label, heading, button or description — states no rule
- W2722 · src/ui/oilwait.ts:49 · passed · a label, heading, button or description — states no rule
- W2723 · src/ui/oilwait.ts:50 · MATCH
- W2724 · src/ui/oilwait.ts:51 · passed · a label, heading, button or description — states no rule
- W2766 · src/ui/pendlist.ts:395 · passed · a label, heading, button or description — states no rule
- W2777 · src/ui/peoplepick-model.ts:58 · passed · a label, heading, button or description — states no rule
- W2838 · src/ui/reqdoor.ts:103 · passed · a label, heading, button or description — states no rule
- W2842 · src/ui/reqdoor.ts:306 · MATCH · D755
- W2844 · src/ui/reqdoor.ts:452 · MATCH · D814
- W2853 · src/ui/SansCal.tsx:119 · passed · a label, heading, button or description — states no rule
- W2854 · src/ui/SansCal.tsx:121 · passed · a label, heading, button or description — states no rule
- W2856 · src/ui/SansCal.tsx:129 · passed · a label, heading, button or description — states no rule
- W2860 · src/ui/SansCal.tsx:314 · MATCH · D618, D628, D675
- W2861 · src/ui/SansCal.tsx:315 · passed · a label, heading, button or description — states no rule
- W2870 · src/ui/SansCal.tsx:338 · passed · a label, heading, button or description — states no rule
- W2876 · src/ui/SansDay.tsx:116 · passed · a label, heading, button or description — states no rule
- W2881 · src/ui/SansDay.tsx:143 · passed · a label, heading, button or description — states no rule
- W2882 · src/ui/SansDay.tsx:144 · passed · a label, heading, button or description — states no rule
- W2884 · src/ui/SansDay.tsx:152 · MATCH · D1578 family (no period, no figures)
- W2893 · src/ui/SansSettings.tsx:99 · passed · a label, heading, button or description — states no rule
- W2899 · src/ui/SansSettings.tsx:113 · passed · a label, heading, button or description — states no rule
- W2954 · src/ui/SchedBoard.tsx:828 · passed · code fragment
- W2991 · src/ui/Shell.tsx:372 · passed · a label, heading, button or description — states no rule
- W3038 · src/ui/topstate.ts:135 · passed · a label, heading, button or description — states no rule
- W3063 (slice 5 named second or later) · src/ui/UsersPanel.tsx:65 · passed · a label, heading, button or description — states no rule
- GD004 · MATCH · D1702, D1708 (built as drawn)
- GD012 · passed · drawing of a look since replaced on his word (D2391, D2423, D2437)
- GD042 · MATCH · D2327 (its filing-by-today part since narrowed by D2340 on his word)
- GD044 · MATCH · D2346 built as drawn, drawing check green
- GD045 · MATCH · D2421 built as drawn here (every string compared) — one count it shows is S5-O5
- GN003 · MATCH · [INP-CAL-CLICK-BEHIND-NEW] waits on his choice (D1298); no reading
- GN004 · MATCH · D1721
- GN005 (slice 5 named second or later) · MATCH · D2388 built on the SANS words job (inputedit.tsx, the "Saved … left out" note); the page will say built at its merge
- GN006 (slice 5 named second or later) · MATCH · D2394, D2420, D2421, D2560, D2564 words built here as drawn (SansDay, inputedit)
- GN011 · dropped to slice 6
- GN016 (slice 5 named second or later) · dropped to slice 6/3
- GN022 (slice 5 named second or later) · dropped to slice 3
- GN025 (slice 5 named second or later) · dropped to slice 3
- GN027 (slice 5 named second or later) · dropped to slice 3
- GN038 (slice 5 named second or later) · dropped to slice 3
- GN040 · MATCH · D2391 A–E built here as drawn (notices.ts sansBackWords); the struck untick take-back is slice 9 (D2423, D2437, D2561)
- GN041 · MATCH · D2560 built here (sansunfiled readOf); D2394 2b title switch follows "no SANS date ahead"
- GN042 · MATCH · D2564 built on the branch tip (daySansSeats), D2568 too; D2566 filed [SANS-INFO-LINE], not built — see question 14
- GN048 (slice 5 named second or later) · dropped to slice 3/4 · the dated status record
- GN049 (slice 5 named second or later) · dropped to slice 4/1
- GN050 (slice 5 named second or later) · dropped to slice 4
- GN051 (slice 5 named second or later) · dropped to slice 4/1
- GN056 (slice 5 named second or later) · dropped to slice 3/9 (S9-M5 names it)
- GN057 (slice 5 named second or later) · dropped to slice 4/7
- GN058 (slice 5 named second or later) · MATCH · design only (D2145); nothing built or drawn in this slice
- GN059 (slice 5 named second or later) · dropped to slice 9
- GN061 (slice 5 named second or later) · dropped to slice 9
- GN065 · MATCH · design only (D2163)
- GN069 (slice 5 named second or later) · dropped to slice 4
- GN079 · MATCH · design only (D2169)
- GN086 (slice 5 named second or later) · MATCH · design only (D2182)
- GN094 · dropped to slice 4
- GN098 (slice 5 named second or later) · dropped to slice 3
- GN103 (slice 5 named second or later) · MATCH · design only (D2163)
- GN107 (slice 5 named second or later) · dropped to slice 4
- GN111 (slice 5 named second or later) · dropped to slice 4
- GN127 · dropped to slice 4/1
- GN130 (slice 5 named second or later) · dropped to slice 9
- GN131 · dropped to slice 9 (D2561, not built)
- GS008 · passed · stable ids, nothing a person sees or a rule
- GS038 (slice 5 named second or later) · dropped to slice 2
- GS050 · passed · spec of screens built since; the open item is the non-blocking windows, D641/D642 as built
- GS063 · dropped to slice 4 · [ROW-NO-TIME-MARK]
- GS088 (slice 5 named second or later) · passed · as GS050
- GS089 (slice 5 named second or later) · passed · the one-rule plan, built (D755, D763 read: MATCH)
