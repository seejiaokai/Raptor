# The rulings audit — review 1: slices 1 (OIL), 2 (the published record), 9 (the bell)

Written 24 Nov 26 by a fresh Fable reviewer, blind to who wrote what. Reading only: nothing in the app, a drawing or a
rule was changed, nothing committed. Plan: `../plans/2026-11-24-rulings-audit-plan.md` §6 (with §3–§5, §10). Files
reviewed: `2026-11-24-rulings-audit-slice1.md`, `…-slice2.md`, `…-slice9.md`; the helpers' brief `…-slice-brief.md`.

**How each finding was checked:** the ruling's full row opened with the shell (and every row it names), the cited code
read at its lines in this working copy, the open branches searched where the finding turns on them
(`claude/allavail-sans-postout-141` for the SANS lines, `claude/words-pass-163` for D2521 and chat 170's four rulings,
which sit word for word in that branch's `HANDOFF.md` block and are in no rulings file yet). Nothing was run in the
app: reproduction is the host's step.

## 1. Counts

26 findings read (slice 1: 5 · slice 2: 8 · slice 9: 13).

| Verdict | Count | Which |
|---|---|---|
| REAL, as stated | 20 | S1-01, S1-02, S1-03, S1-04, S1-05, S2-05, S2-06, S2-07, S2-08, S9-M2, S9-M3, S9-M4, S9-M5, S9-O1, S9-O2, S9-O3, S9-O4, S9-O6, S9-O7, S9-O8 |
| REAL BUT RECLASSIFY | 4 | S2-01, S2-03, S9-M1, S9-O5 |
| DUPLICATE | 2 | S2-02 (of S1-03), S2-04 (of S1-01) |
| NOT A FINDING | 0 | — |

Marked LOW (harm changes nothing a person gets, or only in a rare corner): S1-04, S1-05, S2-03, S2-05, S9-O1, S9-O5,
S9-O6, S9-O7, S9-O8.

| Group | Count | What |
|---|---|---|
| (a) Faults — a clash with a clear ruling, fix list, no question | 2 | F1, F2 (both are words on screen) |
| (b) Questions for him | 6 | Q1–Q5 now, Q6 waiting for the database step's design round |
| (c) The low-harm list (one list, D2610) | 8 | L1–L8 |
| (d) Records fixes only | 6 findings + 5 found while sampling | R1–R11 |

**MATCH sampling:** every MATCH line's text in the three ledgers was read against the page line it cites (slice 1:
100 lines · slice 2: 112 · slice 9: 63), and the full row was opened for 38 of them — every one I judged could move
OIL, a published day or who is told. **No MATCH is wrong.** Three are flagged (§5). No slice goes back.

## 2. Verdict on every finding

### Slice 1 — OIL

| Id | Verdict | Why (what I opened) | Harm |
|---|---|---|---|
| S1-01 | **REAL** — OPEN READING, never asked | D2046's row and D2053's row both say in so many words "The agent's reading, not checked" for OIL. D2053's answer ("Insights and long day yes") names two things and OIL is not one. D2057 and D2071 approve the warnings' words and the order of the build, not what the assumed landing reaches. The words proposal (`specs/2026-11-15-warn-words-standalone.md`) never asks it. No later row answers it (searched "assumed landing", "no landing", "flight length" in every full-rows file, the archive, the backlog). Code confirmed: `engine/oil.ts` 187–190 — a blank landing becomes take-off plus the flight length for OIL. Against it stand D31 ("a credit would be invented rather than earned") and, closest of all, D360: an ALL AVAIL row with no end is *counted* over the assumed hour but "earns nobody OIL … nothing is credited from a guessed hour" — his own split between using an assumed time for a check and paying OIL from it. The Logic page states the built behaviour on screen (`ui/logic-html.ts` 60, 202), so it is visible, but he was never asked. | **OIL — high** |
| S1-02 | **REAL** — MISMATCH, a fault | D762: the one answer is "whoever filed it, or an admin"; D782: an admin answers from the day's one list, "stamped with who gave it". Code confirmed: `ui/oilmode.ts` 320 "Whoever filed this … answered No", 797 "<callsign> answered No", 803 "whoever filed … answered No" — each names the filer or the man when an admin may have answered. Who earns is right; only the words are wrong. | Told wrongly (words) |
| S1-03 | **REAL** — MISMATCH, a fault | D2, D142, D2044 ("the OIL moves only when the day is published again"). Code confirmed: `leavewar/ui/BidPicker.tsx` 1163–1164. Both sentences slip: "change the schedule and the OIL follows" and "change that input, not the schedule" — neither says the day must be published again. | Words only |
| S1-04 | **REAL, LOW** | D360's row: his words are "to the admin", and the built places are the two where an admin decides OIL. Reading (2) was "stated to him so he can correct them"; no answer found. As built does what his words say; the only open point is whether a member should also read it. | Low |
| S1-05 | **REAL, LOW** — joins Q4 | D2314 covers one, two, three-or-more people and ALL AVAIL; the "4 inputs have no OIL answer" count is only in a code note (`leavewar/sync.ts` 2604, 2634). Since chat 170 (24 Nov) he leans to naming things rather than counting them, and asked for every such place to be found — this is one. | Words only |

### Slice 2 — the published record

| Id | Verdict | Why | Harm |
|---|---|---|---|
| S2-01 | **REAL BUT RECLASSIFY** → not a fault today; a filed build for the database step, plus a records fix (R1) | The helper quotes AM4 and AM32 but not his ruling of 17 Sep 26 that sets when they bite: an Undo of a publish that the shared database has **not** registered is silent — "there isn't a need to put it in the records history"; only once the database registers it does the Undo leave a line (memory `undo-of-publish-semantics`; `docs/undo-contract.md` §4). There is no shared database yet, so today's silent removal is what he ruled. The backlog item `[UNDO-PUBLISH-ERASES-ISSUANCE]` says the same and places the build "before the Amendment table has another reader". Nothing to fix now, nothing to ask. The real gap is in the records: none of this has a ruling number or a line on the scheduler page. | None today |
| S2-02 | **DUPLICATE** of S1-03 | Same string, same rulings. | — |
| S2-03 | **REAL BUT RECLASSIFY** → LOW wording, not a clash with a ruling | D97 rules the marker on a *published* day's working copy; nothing rules the export's stamp. Code confirmed: `ui/export.ts` 74 stamps every never-published day "Working draft — not yet signed", signed or not. A plain slip in a held job: the PDF and export work waits on his word (D1644), so it rides `[FLAG-EXPORT]`. | Low |
| S2-04 | **DUPLICATE** of S1-01 | The same reading. Its second half (the flight length kept as a fourth value beside D2044's three) is not a separate decision: if OIL may read the assumed landing, a published day keeping that length follows from D2044 and D2005; if it may not, the fourth value goes. Folded into Q1. (Its standing is "never asked", as slice 1 has it — the rows say "not checked", which is not "told".) | — |
| S2-05 | **REAL, LOW** | D2005's own worked case is a rule across two days (Monday's end, Tuesday's rest) and his answer was that a published day is checked "by all the Logic settings it was published under", an unpublished one by today's. Judging the neighbour's end by the judged day's settings is the plain consequence of those words; the other choice (Monday's end by Monday's settings) would have a draft Tuesday checked partly by old settings, against "every unpublished day at once". Never put to him as its own point, and rare (an open-ended row late on a day beside a published one, then a setting changed). | Low |
| S2-06 | **REAL** — OPEN READING, disclosed, unanswered | D2052's row states the note's meaning, the late cut-off sentence in it; his answer was about who rewords. D2067 and D2071 are about the other sentence. So he has seen the sentence on pictures at least twice and never been asked. Code confirmed: `ui/LogicPage.tsx` 37. The nearest ruling is D1621 — a LATE mark a scheduler *drops* leaves a published day at once, nothing pending, sign-offs kept, his "as recommended" to the reason "dropping LATE changes nobody's day". D179's "freeze everything" row leaves "one's own hidden LATE mark" live. Neither names a changed cut-off. | A mark on a published day — middle |
| S2-07 | **REAL** — OPEN READING, disclosed, unanswered; not built | D1751's row: the rest of the lock "told to him, not yet checked with him … he may strike any". D2212 made the 30 minutes, "Done editing", sign-out and "an admin may ask to take it over" his; its row says "the take-over's further detail (one minute, 'Take over anyway', the saved plan) stays the agent's reading". Each open part was once his own answer (D356: frees on closing the page, the warning at 25 minutes; D451: a change takes a free day; D454: the minute, "Take over anyway", the saved plan) — the question is only whether his later "too much complexity" withdrew them. | Who may edit — but not built |
| S2-08 | **REAL** — OPEN READING | D2294: "Later asks no more that day". Nothing says what Save does to a row left unpicked. Code confirmed: `ui/oilsign.ts` 121–127 — the save marks every row still open as Later leaves it. "He saw the row and left it" and "told to him" in the code note point at a closing report, not a question (§3 step 5: never put). The list's foot says only what Later does (`ui/OilDayList.tsx` 87), so the scheduler is not told on screen either; the publish note does name the input afterwards. | **OIL** |

### Slice 9 — the bell

| Id | Verdict | Why | Harm |
|---|---|---|---|
| S9-M1 | **REAL BUT RECLASSIFY** → work in hand, not a new fault (R2) | True of `main`: `state/notices.ts` 1221 keeps the first two changes and says nothing of the rest; a change of kind reads "Renamed — was …" (1074). But D2521's wording is built on `claude/words-pass-163` and that branch's last commit records his "merge live" for it; and "says every change" is one of chat 170's four rulings, which he was told would be drawn on his iPhone's size first and built as a follow-up. So the fix is ruled and under way; what is missing is the record — chat 170's rulings are in a handoff block only. | Told in part — being fixed |
| S9-M2 | **REAL** → records (R3) | `docs/notifications-register.md` line 19 still gives the struck "taken back" look as the rule for every line. D2437 ("Yes, every line"), D2423 ("undone") and D2561 replace it. The register on all three branches lacks them. | Records |
| S9-M3 | **REAL** → records (R4) | D1151 makes the register the list of every place. Confirmed missing: the access request and the bug report on the bell (`ui/topstate.ts` 53–60, built), D2214, D2251, D2134, D2135, D2147's "when it is set", chat 170's undone line. | Records |
| S9-M4 | **REAL** → records (R5) | P15 still "proposed", one wording for both squadrons, one moment. D2215 treats it as the line 149 got; D2220 gives the receiving side "Posted in · from 142"; the scheduler page line 228 says "when it is set and on the date". P4's register words differ from the built and ruled ones (D1214); P10 and P12 still read "proposed" though built and resting on D1460. | Records |
| S9-M5 | **REAL** → records (R6) | Scheduler page line 183 (D2091: every pick "rings its schedulers' bell") against line 202 and D2219 ("told when the other squadron publishes, not at each draft change" — his "as recommended" to that stated reading). D2091's row carries no mark of D2219. Design only, nothing built. | Records |
| S9-O1 | **REAL, LOW** | D2223's row: "The agent's reading: the master stays an admin everywhere, so a master filer is still told" — not marked told. Code confirmed: `state/notices.ts` `adminThen` counts the master mark in every squadron; `state/accounts.ts` `adminsOf` counts a master through his home only (D2198). The two answer different questions — a line about an input *he filed* against a squadron's admin lines — and D2225 keeps a filer told of what he filed. Only a master admin who files for the other squadron's man meets it. | Low |
| S9-O2 | **REAL** — joins Q4 | `state/notices.ts` 1046: three or more names become "3 people". In no row, register line or page. Chat 170: "See what else in the app also has this existing numerical change and perhaps its better to say everything instead." | Told in part |
| S9-O3 | **REAL** — joins Q4 | D2342's row: "The agent's reading, as chat 147 recommended: past three days the line says 'and 2 more'" — inside wordings he set aside for his own (D2340, D2390), which name no cut. Still so on the SANS branch tip (`notices.ts` 1110, 1123). | Told in part |
| S9-O4 | **REAL** — OPEN READING, not yet put | D2437 (24 Nov, earlier that day): "an unread one simply goes, stands". Chat 170 (24 Nov, about 21:00): "if its undone perhaps we should also create a notification thats applicable to it" — said after being told a phone alert already sent cannot be taken back. His words do not say whether they reach a line he never read in the app. Chat 170's handoff itself flags the clash to search first. | Who is told |
| S9-O5 | **REAL BUT RECLASSIFY** → close to answered; LOW | D2338's row: his "Yes" was to the agent's answer to his own question "Should we tell the user **too**" — the admin's telling was already his own proposal (the crew list's note). "The man himself only" on the bell is the natural meaning of that exchange. Not word-for-word his, so it stays on the low list rather than MATCH. | Low |
| S9-O6 | **REAL, LOW** | D2228's row: "The agent's reading: 'that man's admin' is read on the input's own days … the filer an admin of that squadron today" — not marked told. A moved filer made admin only after the change: narrow. | Low |
| S9-O7 | **REAL, LOW** — rides its drawing | D2198's row: "by default" read as "he may switch another squadron's on (and his own off) himself — how, and where the switch sits, is drawn and shown to him first". Not built; the drawing is already owed and will carry the question. | Low |
| S9-O8 | **REAL, LOW** | D1460's row: the words are "the agent's, his to change". P10's line was built as "proposed, his to strike" and is covered in substance by D1460's "every other change to his leave by someone else". Words never shown as a question. | Words only |

## 3. What stands, grouped

### (a) Faults — clear ruling, fix list, told to him in one list, no question

Both are words a person reads: Opus drafts, a fresh Fable reviews and adjusts (D2441).

- **F1 — OIL Earn names the wrong person as having said No** (S1-02). When: an admin answers No from the day's one
  list, or "No to all" after a holiday is declared — a few times a month. Example: Ranger files a Training for
  ALL AVAIL on Sat 18 Jul and leaves the question open; Hunter picks "No to all". In OIL Earn the window reads
  "Whoever filed this Training answered No to OIL" — Ranger never answered; on a one-person input the puck reads
  "Ranger answered No". Fix: say the input was answered No without naming a person, or name the person the answer is
  stamped with. Three strings, `ui/oilmode.ts` 320, 797, 803.
- **F2 — the Leave War's OIL card says the OIL "follows" a change** (S1-03, S2-02). When: anyone taps an FO* / HO* box
  to see where it came from — weekly. Example: Ranger's FO* on Sat 18 Jul reads "change the schedule and the OIL
  follows"; the scheduler takes him off Saturday and nothing moves, because the day has not been published again.
  Fix: both sentences say "…and publish the day again". `leavewar/ui/BidPicker.tsx` 1163–1164. With it, look at the
  Logic page's "A Duty & commitments input earns once its OIL question is answered yes." (`ui/logic-html.ts` 207) —
  true only once the day is published; the line above it says so, so it is a judgement for the wording reviewer, not
  a fault.

### (b) Questions for him — highest harm first

**Q1. A weekend flight published with no landing typed: does it earn OIL?** (S1-01, S2-04)
- When: a scheduler publishes a weekend or holiday day and a flight's landing box is blank or "TBD" — rare, a few
  times a year, but it decides a man's OIL.
- Example: Sat 18 Jul, Ranger on VL BFM, take-off 09:00, no landing. Today: the app assumes he landed 10:00, adds the
  2-hour debrief, and credits him 06:00–12:00 — a half day — with no landing ever typed. Before 15 Nov the day named
  the line and he earned nothing until a landing was typed. And if an admin later changes "A flight" on the Logic page,
  that published Saturday reads "1 pending" and loses its four names.
- His words so far: the assumed landing was his answer about warnings ("B"), then Insights and the long day ("yes").
  OIL was never asked. His rule for a ground row with no end time is the opposite: counted over an assumed hour, but
  "earns nobody OIL".
- **Recommendation: it earns nothing and the day names the line until the landing is typed** — the same as the row
  with no end time, so OIL is never worked out from a guessed time; the fix for the scheduler is one box and a
  publish. If he prefers it as built, nothing changes and the record gets one line saying a published day also keeps
  its flight length.

**Q2. A sign-off that answers only some of the day's OIL questions: is the rest asked again?** (S2-08)
- When: a weekend or holiday with two or more duty inputs unanswered, at the first sign-off press — about weekly.
- Example: Sat 18 Jul, Ranger's Training and Bane's Duty both unanswered. Saber presses SKED CK, picks Yes for
  Ranger's, leaves Bane's untouched, presses Save. Today: the other three boxes do not ask about Bane's; Saturday
  publishes, the note says "Bane's Duty has no OIL answer, so nobody on it earns OIL." Nothing on the list told Saber
  that Save would leave Bane's as Later does.
- His words so far: "Later asks no more that day." Nothing about a Save that leaves a row unpicked.
- **Recommendation: keep it as built, and say so on the list** — a foot line when a row is left unpicked, in the
  same few words as Later's. Asking again at the next box would have that answer clear the name just signed, the very
  thing his sign-off design avoids. New words, so drawn for him first.

**Q3. A change is undone before the man read its bell line: is he told anything?** (S9-O4)
- When: an admin presses Undo within minutes of a change that told someone — daily in the app; it matters once phone
  alerts go out by Teams at the database step.
- Example: 20:00, Saber approves Ranger's LL for Mon 20 Jul; Ranger's phone shows the alert; 20:05 Saber presses
  Undo; Ranger has not opened the app. As ruled that morning, the unread line simply goes and Ranger hears nothing
  more — but his phone already told him the leave was approved.
- His words so far: that morning, "an unread one simply goes" stands; that evening, "if its undone perhaps we should
  also create a notification".
- **Recommendation: in the app, as ruled — an unread line simply goes; once a phone alert has gone out for it, the
  undo sends its own alert ("Your LL on Mon 20 Jul is no longer approved.").** So nobody is left believing an alert
  the app took back, and nobody is told of something he never saw.

**Q4. Three places the app gives a number where it could name the things** (S9-O2, S9-O3, S1-05) — the first three
finds of the look he asked for on 24 Nov ("see what else in the app also has this"). One decision, three pictures.
- When: a scheduler adds three or more people to an input (weekly); a SANS man is planned on more than three days
  with nothing filed (monthly); a day is published with four or more inputs unanswered (rare).
- Examples: Ranger's bell, "Meeting · Thu 16 Jul / 3 people added · Saber" — not who. Ranger's SANS reminder,
  "You're planned on Sat 18, Mon 20, Tue 21 Jul and 2 more with nothing filed." — two days he must file for go
  unnamed. The publish note, "4 inputs have no OIL answer, so nobody on them earns OIL." — not which.
- His words so far: the changed-input line is to say every change, never "and N more"; none of these three was asked.
  (He did approve "Training for 3 people" in the publish note on 22 Nov — the look should show it beside these and
  ask whether it stays.)
- **Recommendation: name them in all three** — the days in the SANS reminder first, since he must act on each;
  drawn at his iPhone's size, worst case included, before any build.

**Q5. A changed late cut-off: does it move the LATE marks on published days at once?** (S2-06)
- When: an admin changes the late cut-off on the Inputs or SANS page mid-week — a few times a year.
- Example: Tuesday is published with Ranger's leave filed two days ahead, not late under a 1-day cut-off. The cut-off
  is raised to 3 days: Ranger's leave reads LATE on the published Tuesday at once, nothing pending, nobody signs.
- His words so far: every Logic setting reaches a published day only from its next amendment; and, separately, a
  LATE mark a scheduler drops leaves a published day at once because it "changes nobody's day". The Logic page has
  said "A changed late cut-off moves the LATE marks at once, on published days too" since 14 Nov and he has seen it,
  but was never asked.
- **Recommendation: as built** — LATE is a mark, not a check, and by his own reasoning for a dropped mark it costs
  no new signatures.

**Q6 (waits for the database step's design round). The day lock's take-over details** (S2-07)
- When: once two schedulers work at the same time, daily.
- Example: Hunter holds Tuesday and steps away; Saber asks to take over; after one minute unanswered Tuesday passes
  to Saber and a saved plan "Hunter — at take-over 10:42" appears.
- His words so far: each detail was his own answer on 29 Sep; on 8 Nov "too much complexity for a relatively simple
  problem"; on 19 Nov he confirmed one editor per day, the 30 minutes, "Done editing", sign-out and that an admin may
  ask to take over.
- **Recommendation: keep them all** — the one-minute hand-over, "Take over anyway", the saved plan, freeing on
  closing the page, the warning at 25 minutes, a change taking a free day. Nothing is built before that step, so it
  costs nothing to ask then, with the drawing.

### (c) The low-harm list — one list he can take whole; each recommended as built unless said

| # | From | In one line | Recommendation |
|---|---|---|---|
| L1 | S1-04 | A row with no end time says "No OIL worked out" only where an admin decides OIL; a member opening "who's available" sees only "an hour assumed". | As built — his words were "to the admin". |
| L2 | S2-03 | The schedule export stamps a day all four have signed but nobody has published "not yet signed". | Change to "Working draft — not yet published" when the export work resumes (held on his word). |
| L3 | S2-05 | After a setting change, a day's crew rest reads the day before by the judged day's own settings. | As built — it is what "a published day is checked by the settings it was published under" gives. |
| L4 | S9-O1 | A master admin who files an input for the other squadron's man is told of changes to it, though that squadron's admin lines are off for him by default. | As built — he filed it. |
| L5 | S9-O5 | The SANS reminder goes to the man only; the admin sees the crew list's note, no bell line. | As built — his "Should we tell the user too" and "Yes". |
| L6 | S9-O6 | A filer who moved with his man counts as that man's admin by his role on the day the input changes. | As built. |
| L7 | S9-O7 | A master admin may switch another squadron's bell lines on, and his own off, himself. | Settle on the switch's drawing, already owed. |
| L8 | S9-O8 | The words "LL bid changed to OL", "LL bid moved to Thu 29 Jan", "LL bid deleted" were never shown to him. | As built; they follow the bell's other leave lines. |

### (d) Records fixes only — no question, no change to the app

| # | From | The stale or missing record | The fix |
|---|---|---|---|
| R1 | S2-01 | Undo of a publish: "an issued version is never erased", "Undo of a published day is an Unpublish", and his 17 Sep boundary (silent until the shared database registers it) have no ruling number and no line on the scheduler page — only the amendment register, the undo contract and a memory note. | Record them as rulings with their dates; one line on the scheduler page; `[UNDO-PUBLISH-ERASES-ISSUANCE]` stays filed for the database step and its text gains the 17 Sep boundary. |
| R2 | S9-M1 | Chat 170's four rulings of 24 Nov (Teams for phone alerts; an undone change gets its own notification; the changed-input line says every change, replacing D2521's count; a look for every other count) are in a handoff block on `claude/words-pass-163` only. | Record them first (free numbers checked against every open branch), fix what D2521's count left behind (the register, `ui-contracts.md` §the bell, the scheduler page), file the build and the look. |
| R3 | S9-M2 | The register's head gives the struck "taken back" look as the rule to build. | Rewrite to D2437, D2423, D2561; name the struck look as what is built today. |
| R4 | S9-M3 | The register lacks: the access request and the bug report on the bell (built); D2214; D2251; D2134; D2135; a transfer told when set (D2147); the undone line (R2). | Add each with its ruling. |
| R5 | S9-M4 | P15 still "proposed", one wording, one moment; P4's words differ from the built and ruled ones; P10 and P12 still "proposed". | P15 to "Ruled, not built" with D2147, D2215, D2220; P4's words to D1214's; P10 and P12 marked built on D1460. |
| R6 | S9-M5 | Scheduler page line 183 says a pick rings the home schedulers' bell; line 202 and D2219 say when the other squadron publishes. | D2091's row marked narrowed by D2219; line 183 reworded. |
| R7 | sampling | Scheduler page line 158 says D2054's pending-list line is "not built"; it is built (`ui/pendlist.ts` 537–551). | Correct the line. |
| R8 | sampling | `engine/rules.ts` 117–118 still calls a published day's OIL after a setting change "the owner's question"; D2044 answered it. | Rewrite the comment to cite D2044 (a comment only — no behaviour). |
| R9 | sampling | OIL expiry ("OIL lasts": forever by default, else oldest credit first, each from its own date, the opening figure never expiring) rests on a commit note of 2 Sep 26 ("Owner asks") — no ruling row, no line on the OIL page. | Record his ask as a ruling with the date; mark the three details as readings to put to him on the low list if he ever sets a limit (while it is "forever" nobody loses OIL). The backlog's `[LW-OIL-OPENING-AWARD]` already holds one question on it. |
| R10 | sampling | Slice 2's ledger says of "Out of order is red, but it never stops a day being published" that no ruling was found. | The ruling is D509, D502 (scheduler page line 352). MATCH stands; the ledger line corrected. |
| R11 | sampling | `published-day-logic-reads.test.ts` — a test title that says the opposite of what it checks (slice 2's C0176). | Reword the title with the next change to that file. |

## 4. Open readings to mark in their rows (plan §6 — once the method fix's §C1 is live)

D2046 and D2053 (OIL reads the assumed landing; the flight length as a fourth kept value) · D2294 (a Save that leaves
a row unpicked) · D2437 with chat 170's ruling (an unread line undone) · D2342 ("and 2 more") · D2314 (four or more
counted) · D769's line (three or more people counted) · D2052 (the late cut-off at once on published days) · D1751 and
D2212 (the take-over's detail) · D360 reading 2 · D2223 (the master filer) · D2228 (the role's day) · D2198 (the
switch) · D1460 (the words) · D2338 (the man only).

## 5. The MATCH lines sampled

Read in full: every MATCH line's on-screen text or comment against the page line cited. Rows opened: D2, D31, D97,
D101, D103, D109, D142, D179, D184, D185, D360, D470, D482, D509 (by its page line), D591, D711, D762, D769, D776,
D782, D1010, D1142, D1199, D1208, D1214, D1231, D1460, D2002, D2005, D2013, D2014, D2015, D2044, D2054, D2071,
D2193, D2198, D2202, D2225. Code read for the two audience bodies behind the bell's "which admins" lines.

- **Wrong:** none.
- **Flagged, slice 1:** W0438 ("OIL lasts") — MATCH on a commit note, not a ruling (R9). W2550 — true only with the
  line above it (see F2).
- **Flagged, slice 2:** W2518 — right class, the ruling missed (R10).
- **Slice 9:** GR010 and GR012 (which admins) agree with `adminsOf` as D2198 and D2202 give it; GR019 rests on D1231
  answering D1199, confirmed.

Not done by this review: nothing was run in the app; the rows behind the other MATCH lines were not opened one by one
— the wide read was of the words against the page, the deep read of the 38 above.

## 6. For the host's reproduction — the case for each

F1: Sat with an ALL AVAIL Training, "No to all" by a second admin, then OIL Earn's window and a one-person puck's
title. F2: tap an FO* box on the Leave War. Q1: a Saturday flight with take-off 09:00 and a blank landing, published;
then "A flight" changed. Q2: two unanswered inputs, one picked, Save, then a second box. Q3: approve, Undo unread —
the bell before and after. Q4: the three lines as they read today. Q5: a published day, the cut-off raised. L2: export
a signed, unpublished day beside the screen.
