# What else in the app DET affects — Fable's read (17 Nov 26)

Brief: `2026-11-17-multi-sqn-det-check.md`. Read only; nothing changed but this file. Blind: no other `*det-check*`
or `*red-team*` file was opened. Read: D2146's full row, the design note whole, the short lines D2087–D2149 and D2159
and the full rows of D2092, D2096, D2097, D2101, D2103, D2108, D2110, D2120, D2122, D2123, D2131–D2136, D2142–D2149,
D2159. Every "today" claim below was opened in the code unless marked **unchecked**. Paths are under `raptor-port/src/`.

**The one fact behind most findings.** Today the app has one schedule, so "the inputs on a date" is one unit-blind
funnel — `engine/inputs.ts inputsOn` / `inputLinesOn` — and "is he away" is one place-blind test, `isAway`. Every reader
below goes through them. DET is the first input that means *away here, present there*. The build needs the funnel to
take the schedule being read (home: his DET is an absence; the detachment it names: the DET is not drawn and he is
there; everyone without a DET to it is not), or each reader below must be handled by hand.

**The second fact.** A new kind joins several rules *by construction*: `isUnavail` is "any group but `act`",
`restsInput` / `oilAsks` are "anything not leave, medical, upchit, Personal, SANS Availability", `defaultAllday` is "off
for the Duty & other commitments group". A DET row added to `INPUT_META` beside OD inherits all of them unasked.

Counts: **3 HIGH, 13 MEDIUM, 3 LOW.**

---

## HIGH

### 1. A man keeps the home seats he held before his DET was filed — published, and paid

- **The failure.** 149 has published Sat 18 Jul two weeks ahead with Viper on the standby desk. On 6 Jul the scheduler
  presses "+ Put people on it" and files DET "249", 13–31 Jul, for six men, Viper among them. Nothing takes Viper off
  the Saturday desk: the home day reads "1 pending" and his seat wears a red flag, but the issued Saturday still shows
  him on the desk and has already credited him a full day of OIL. If 249 does not work that Saturday he keeps a day of
  OIL for a duty nobody stood, and the desk reads manned. The Leave War shows no amber: it flags leave or a medical
  over recorded work, never an away duty over it. With six men and nineteen days in one press this is the ordinary
  case, not the edge.
- **Where today.** The clash is a warning only — `engine/validate.ts`, the events loop that raises `INPUT_FLY`
  ("Conflict: … & …") and the `day.blank` loop for rows with no times; nothing unseats. The OIL evidence reads seats
  and asks no absence question (`engine/oilev.ts` — searched for `isAway`, none; **unchecked** whether a red-flagged
  seat is dropped by some other route). `leavewar/engine/dayview.ts forbiddenPair` pairs only leave and sick with a
  credit. D2092 promises a refusal; round 6's R4 made it a check after the fact — this is what "after the fact" costs.
- **The fix.** Recommended: the DET window and the several-people picker list, before Save, each man's seats on his
  squadron's schedule inside the dates — "Viper: 2 lines, 1 desk, 14–18 Jul" — with "Take them off" (the default) and
  "Keep" (the transfer sheet's T2, reused); on a published day the taking-off is a pending change like any edit. And
  the OIL pass pays nothing from a seat on a day the man's DET puts him at another place. The other choice, his: leave
  it a red flag as an OD is today.
- **Weight: HIGH** — wrong published record, wrong OIL.

### 2. DET asks the OIL question, and a "yes" pays every weekend of the detachment — by construction

- **The failure.** DET is added to the kind table beside OD. The scheduler files it for six men over 13–31 Jul (three
  weekends). On saving, the app asks him the OIL question once for everyone (D762); the bell's holiday line and OIL
  Earn's one list ask again for each unanswered day. He answers yes: six men are credited a full day for each of six
  weekend days, worked or not, on top of what 249's published days pay. D2146 (2) rules "DET asks no OIL question";
  the code asks unless told otherwise.
- **Where today.** `engine/inputs.ts oilAsks` returns `restsInput`, which lets in every kind that is not leave,
  medical, an upchit, Personal or SANS Availability. Its readers: `engine/oilev.ts projectOilInputs` (the credit
  itself) and the placeholder scan beside it; `leavewar/sync.ts oilPendingFor` (the bell), `oilOpenOn` (OIL Earn's
  list), `oilAskPlan` and the list at its line ~2990; `engine/oil.ts voidedOil` and `repricedOil` (answers kept across
  an edit). An all-day input prices as a full day (`inputOilAmt`).
- **The fix.** DET is named out of `oilAsks` and of `restsInput` both (item 7 is why the second matters), each pinned
  by a test as `eventkind.test.ts` pins Event. An OD retyped to DET drops its answers — `voidedOil` already does that
  once `oilAsks('DET')` is false; test it.
- **Weight: HIGH** — wrong OIL.

### 3. An ALL AVAIL event at the detachment credits the people at home

- **The failure.** 249 publishes Sat 25 Jul with an all-available ground programme. The crowd behind the puck is
  worked out from the whole roster less whoever is away or busy: every 149 man at home with nothing on that Saturday
  stands in 249's crowd and earns OIL for it. The reverse is safe only by accident — at home a DET keeps its man out
  because any group but `act` reads as away.
- **Where today.** `leavewar/sync.ts availableFor` walks `Object.keys(PEOPLE)`, drops the archived, SANS not on the
  programme, those outside `inSquadron`, and those `keptOut` by an away input or a commitment. It is the engine's
  `HOOKS.oilSentinel`, and its answer is frozen into the issued day. Round 6's R6 names "a detachment's ALL AVAIL";
  this is where it lives and what it pays.
- **The fix.** The crowd of a unit's ALL AVAIL is the people at that unit that day: at the detachment, those whose DET
  names it and covers the date, less their own absences; at home, as today (DET already keeps a man out). One test
  each way. A DET shortened after the day was issued changes the frozen crowd — say whether that day then reads
  pending (item 10).
- **Weight: HIGH** — wrong OIL.

---

## MEDIUM

### 4. The Leave War has one question where DET needs two — "shows on the war" and "counts him out"

- **The failure.** Two ways to get it wrong. Copy OD: DET joins `warVisible` / `isAwayKind` and the away-duty codes,
  and the six are counted out — D2146 undone, the Available rows fall, the SANS need rises. Leave it out: `warCounts`
  is false, DET draws nothing on the war and an Undo of a DET does not repaint it. And a third thing, ruled but not
  thought through: counted in, the six also stand in the **team** rows. 149's "standby teams" row reads 2 teams on
  Sat 18 Jul with all six of its night-qualified crews at 249; an admin approves the last home crew's leave on a
  green row.
- **Where today.** `leavewar/absences.ts warVisible`, `isAwayKind`, `warCounts` (one predicate, named "show on the
  war, and count him out"; read by `sync.ts` at its two absence builds, `absences.ts contribsOfInput`, and
  `state/undo-wire.ts` to decide whether an Undo touches the war). `leavewar/engine/dayview.ts`: `AWAY_DUTY`,
  `levelOf` (an unknown code is level 8, "removes nobody"), the `removing` filter in `dayView` (ATT B is the standing
  example of shown-but-not-removing), `OFF_WAR`. `leavewar/engine/availability.ts haveOf` (1 − away) feeds `ruleHave`
  for people rows **and** team rows, and `countsFor`'s standby-team figures. A count row's filter
  (`matchesFilter`) knows seats, CATs and quals only — there is no way today to "leave DET out of a row", which
  D2146 (4) offers him. `leavewar/state/daypanel.ts` lists "Away · N" from `away > 0`, so the six are in no list.
- **The fix.** Split the predicate: shows (leave, medical, course, OD, DET) and counts out (all but DET). Give DET its
  own code on the war, a ladder level of its own outside `AWAY_DUTY`, and a place in `OFF_WAR` (changed on the Inputs
  page). Recommended for the rows: one tick on each count row, "Count people on DET" — on by default for people rows
  (his ruling), **off by default for team rows**, which answer "can we man it here"; the two Available rows keep his
  ruling. The day panel gains "On DET · 6" under Away. His call: the team rows' default.
- **Weight: MEDIUM.**

### 5. Leave for a man on DET is approved with no sight of the detachment

- **The failure.** Three of 249's six bid leave for Wed 22 Jul. The approver opens 149's Leave War: Available P reads
  27 of 20 needed — green, since DET men count in. He approves all three. 249 has three men left and cannot fly its
  programme; its scheduler learns when three rows appear under his Unavailable. The Leave War stays on the man's own
  squadron (D2132), so no screen an approver uses shows the detachment's manpower.
- **Where today.** `leavewar/engine/availrows.ts availHave` and `evaluate.ts` judge a bid against the squadron's rows
  only; the manning bubble (`leavewar/ui/bubblewords.ts`) names only rows it lowers.
- **The fix.** Recommended: on a day a man's DET covers, his bid window and Approvals line carry one more line —
  "On DET · 249: 6 there, 5 with this" — and the bubble names it. No new rule, no refusal. The other choice: a
  required figure of the detachment's own, later.
- **Weight: MEDIUM** — a check that misses, made by D2146 (4).

### 6. The Leave War's own "OD" button stays the quickest way to send a man away — the wrong one

- **The failure.** A member, or an admin picking six rows, has always filed a detachment on the Leave War with the OD
  button — D1318's own reason: "filed far ahead while bidding is open, since both lower manning". After the build he
  does the same. The six are counted out, are not on 249's manpower, and 249's scheduler cannot plan them; nothing
  says why.
- **Where today.** `leavewar/ui/LeaveButtons.tsx` (CSE · OD), `BidPicker.tsx`, `SelectSheet.tsx`,
  `ClosedNoteSheet.tsx`; `leavewar/state/store.ts fileStraight` / `FILED_STRAIGHT`; `leavewar/sync.ts doorFile`;
  `state/changelines.ts FILED_ON_WAR`; `leavewar/ui/bubblewords.ts FiledKind`.
- **The fix.** Recommended: the war's row reads CSE · OD · DET while his squadron has an open detachment covering a
  picked day; DET there asks which detachment only when there are two, files whole days inside its dates, and for
  several rows files the one shared DET (the same record the picker makes). The other choice: no door on the war, and
  an OD filed inside an open detachment's dates says once "Going on 249? File DET." His call.
- **Weight: MEDIUM.**

### 7. DET inherits the OD's doors and defaults, each of which can put a man in two places

- **The failure.** (a) *Times.* A new input of the "Duty & other commitments" group opens with All day **off**,
  06:00–18:00. A DET saved that way leaves the six "free" at home after 18:00 on every day — the home night wave
  offers them — and its typed times make it bear crew rest at home from 18:00. (b) *Reject / → Ground.* An OD has a
  Reject button on the schedule and may be moved onto the Ground Programme; either counts him back in on the crew list
  and the war. Pressed on a DET row at home, he is plannable at home while still on 249's manpower. (c) *Cancelled,
  information only.* Either mark makes an input silent to the rules; what a silent DET means at the detachment is
  undefined. (d) *Kind changed.* Retyping DET to OD, or back, moves a man off or onto a detachment with one dropdown.
  Round 6's F4 put Reject to him; the rest are the same family.
- **Where today.** `engine/inputs.ts defaultAllday`; `ui/InputWindow.tsx` (the "all day" box and time pair, shown for
  OD), `ui/inputedit.tsx newInputSeed`. `engine/inputs.ts odOut`, `placeOf`, `listedUnavail`; `engine/slots.ts`
  `acceptInput` / `unacceptInput` (the `isOD` branches); `ui/html.ts accCtl` and `ui/board-html.ts` (the Reject
  button); `engine/drafts.ts` and `engine/publish.ts` (`odGround` carried through plans and versions).
  `inputSilent` / `inputFlags`. `ui/inputedit.tsx commitInputEdit` (the `isOD(wasType)` retype branch).
  `restsInput` → `engine/validate.ts` crew-rest pass (`source.input.forEach`, typed times only).
- **The fix.** Recommended, one rule: a DET is whole days, always — no All day box, no times, no half; it has no
  Reject, no → Ground, no CX and no information-only mark; its kind cannot be changed once saved (delete and file
  again). It leaves only by Delete, by its dates, or by Close. Partial travel days wait for a later round.
- **Weight: MEDIUM** (two-place planning needs a second mistake to reach a published day).

### 8. Moving the detachment's dates leaves its people's DET behind

- **The failure.** D2134: on the planned end, 31 Jul, the bell tells the admins to close it "or move the date". The
  admin moves "To" to 7 Aug. The six DETs still end 31 Jul. On 1 Aug all six are back in 149's crew list as free, 249's
  crew list is empty, and every line 249 planned for 1–7 Aug holds men who are not there. Moving "To" earlier, or
  "From" later, leaves DETs outside the open dates that D2146 (3) says are refused.
- **Where today.** Nothing — a detachment's dates do not exist. The nearest rule is an input's own: it covers its last
  day (`engine/inputs.ts inputCoversDate`).
- **The fix.** Recommended: the date change says what it does and does it in the one press — "6 people's DET moves to
  7 Aug with it" for every DET that ended on the old "To" (ones ending earlier stay); a date moved inward trims the
  DETs past it, listed, and refuses while a published detachment day outside the new dates still stands (Close's own
  question, D2142). Each man is told by the bell's "Now …" line (B7).
- **Weight: MEDIUM.**

### 9. A man can put himself on a detachment, or take himself off, and no scheduler is told

- **The failure.** D2120 keeps the man's own DET as the backup. Saber, not picked for 249, files DET for himself: at
  once he is off 149's crew list and on 249's manpower. Neither scheduler's bell rings — the bell tells only the
  people in an input and its filer. Or Viper, on 249 and planned on its published Thursday, deletes his own DET from
  his phone: he is home on paper, and 249's published line holds a man who is "not there". A member may also file
  only in his primary squadron (D2087) — can a 142 man's DET name 149's "249" (item 15)?
- **Where today.** `state/notices.ts noticePass` / `common` — recipients are the input's people and filer (register
  rows B1–B9). A member changes and deletes his own input (`state/perms.ts mayEditInput`; the Inputs page's rule,
  D1388: "taking himself out and deleting stay the member's"); an input for several is the filer's or a scheduler's
  (`engine/inputs.ts onlyNamed`).
- **The fix.** Recommended: a DET filed, changed or deleted rings the schedulers of the detachment and of his
  squadron — "Saber · on 249 · 13–31 Jul" — one line each. A member may file and lengthen his own DET; shortening or
  deleting one that covers a day he is planned on at the detachment is the scheduler's (the window says "You are
  planned on 249 that day — ask its scheduler"). The other choice: his to delete freely, the detachment's day going
  pending.
- **Weight: MEDIUM.**

### 10. What a DET change does to a published day — at home it over-reports, at the detachment it is undefined

- **The failure.** *Home:* the picker files one shared record. Adding a seventh man on 20 Jul changes "who is in it",
  so every published 149 day the record covers reads "1 pending" and loses its four sign-offs — nineteen days to
  re-publish for a row under Unavailable. *Detachment:* the DET is not drawn there, but it is what makes a man part of
  that day. If the DETs are frozen into 249's issued day, adding a man unsigns 249's published days though nothing on
  them changed; if they are not, taking away a man seated on a published line changes nothing and the issued day lies.
  *Late:* Close, or a moved date, rewrites the DET; the stamp the LATE mark reads is rewritten with it, so the six read
  LATE at home for the admin's act. (Whether a DET filed late reads LATE at all is already put to him.)
- **Where today.** `engine/inputs.ts inpDetailKey` (its `whoKey`), `frozenInputMatch`; `engine/publish.ts daySnap`
  (freezes the inputs covering the date). `inputStampISO` / `isLateInput`; each person carries his own stamp
  (`peopleOf`'s `mod`), and a scheduler's `lateOff` exists.
- **The fix.** Recommended: at home, as every input (D178) — but the picker files **one DET a man**, so one man's
  change is one man's row and stamp. At the detachment, an issued day freezes who was there; a man *added* is no
  change to it; a man *removed* is a pending change only on days he is seated. An act of the app (Close, a moved date)
  never moves the late stamp. `inpDetailKey` gains the detachment named, so a DET re-pointed reads as a change.
- **Weight: MEDIUM.**

### 11. The detachment may have nobody its sign-off boxes will take

- **The failure.** Six go to 249; none holds the Scheduler tick. Three of the four boxes count only a name that is an
  appointed scheduler, and publishing needs all four. If 249's boxes offer the people at 249, it can never publish:
  no issued schedule, no weekend OIL (D2146 (2) makes its published days the only thing that pays).
- **Where today.** `engine/publish.ts SIGN_ROLES` (three roles need the tick), `signRoleOk` (`isScheduler(who)`),
  `signMissing`, `daySigned`. The host's own check in the design note: publish is refused without four sign-offs.
- **The fix.** Recommended: the detachment's boxes offer its squadron's qualified people wherever they are — a man at
  home may check and approve — the ones at the detachment listed first. The other choice: only people on its DET, and
  "+ New detachment" warns while none of them holds the tick.
- **Weight: MEDIUM.**

### 12. On his phone the man sees himself "DET" and none of his flying

- **The failure.** Viper, a member, may see one schedule, so his TALON mark has no "▾" (D2132). At 249 he opens the
  app: 149's Monday, himself under Unavailable — "249 · Exercise North / DET". His lines are on a schedule nothing has
  given him. The bell's "You were added" for a 249 line opens a day he cannot reach. After Close the same lines sit
  under "Past detachments", which he may not open either.
- **Where today.** Access to another schedule is an admin's grant on Admin → Users (D2087, D2094); nothing ties it to
  an input. Round 1's "anyone sees a day he is planned on" was recommended, never ruled.
- **The fix.** Recommended: a DET itself gives view of that detachment's schedule, from the day it is filed (he reads
  the plan before he leaves) and afterwards as a past detachment; on a day his DET covers, the schedule pages open on
  the detachment's; a bell line opens the schedule it is about. At home before and after: his row under Unavailable,
  a tap opening the detachment's day.
- **Weight: MEDIUM.**

### 13. Insights splits the man in two: "not flying" at home, and half a week's hours on each side

- **The failure.** Week of 13 Jul: Viper flies 149's Monday, then nine sorties at 249. 149's Insights lists him among
  the low flyers with one sortie and Monday's hours; the five who left on Sunday stand in "not flying" all week.
  249's Insights shows Tue–Sun. No screen has his week, which is the figure work hours exist to show.
- **Where today.** `engine/insights.ts computeInsights` — sorties and hours from one schedule's `issuedWorld()` days;
  `idle` is that world's roster less anyone with a sortie, no input asked; hours are `validate.ts workSpan` per day.
- **The fix.** Recommended: figures about a *person* (work hours, sorties, not flying) follow the man across his
  squadron's schedule and its detachments — each at its latest published version (D477) — and the squadron's Insights
  marks a DET man "249" instead of listing him as not flying; figures about a *schedule* (sorties a day, warnings)
  stay that schedule's. His call: whether 149's totals include 249's sorties.
- **Weight: MEDIUM.**

### 14. Two places, one clock

- **The failure.** 249 is eight hours behind home. Viper lands 249's last line at 22:00 local on Thu 30 Jul and 149
  plans him at 07:00 on Sat 1 Aug. Round 6's R5 has crew rest follow the man across places, by the later line's
  settings (D2123) — the sum treats both times as one clock, so the gap is wrong by eight hours either way: a breach
  missed or a false one. The same for "which day is Saturday" when 249's published day pays OIL, and for the public
  holidays that make a day earn (they are the home war's).
- **Where today.** Every time is minutes from a day's midnight with no zone: `engine/validate.ts` crew-rest pass
  (`prevEnd`, `prevFlyEnd`, the 1440 offset), `engine/weekctx.ts workedSet` (days in a row), `leavewar/sync.ts
  isNonWorkingISO` (weekend and holiday). No ruling, backlog item or design passage names a time zone (searched the
  full rows, the archive, the backlog and the design note).
- **The fix.** Recommended: say it rather than build it — a place carries its hours from home (0 by default); checks
  *across* places use it; a detachment's own days, OIL and holidays are judged on its local date with its squadron's
  holidays. The cheaper choice: across two places only days in a row is checked, crew rest is not (travel lies
  between), and the app says so on the first home line after a DET.
- **Weight: MEDIUM.**

### 15. Whom a DET may name, and who may be named

- **The failure.** (a) Saber (142) goes with 149's detachment as the one extra man. If the DET picker lists only his
  own squadron's detachments he must file OD — counted out at 142, and 249 cannot plan him (different place, no
  borrowing). If it lists every open detachment, a 142 man is on 249's manpower: whose Leave War row, whose OIL
  settings, whose admins may put him there? The transfer sheet's refusal ("a DET onto a 142 detachment") assumes the
  first. (b) A SANS man is planned only where he has filed availability for the slot; on a DET he would be at 249
  yet closed to every line until he files SANS availability day by day.
- **Where today.** `engine/avail.ts sansGate` ('none' with no record for the day); `leavewar/engine/availrows.ts`
  (a SANS man is never counted, D626). Nothing for (a).
- **The fix.** Recommended: (a) a DET may name any open detachment; he stays his own squadron's manpower, leave and
  OIL (D2146's rule, unchanged), the detachment's admins or his own may file it, and both squadrons' schedulers are
  told (item 9). (b) a SANS man's DET makes him available at the detachment for its dates like anyone there; his SANS
  availability goes on governing home only. The other choice for (b): SANS people are not offered in the DET picker.
- **Weight: MEDIUM.**

### 16. Posting out while on a detachment — three of the four outcomes are not covered

- **The failure.** The transfer is refused across a DET (D2147 (5)). The other three are not. Ranger, on 249 until
  31 Jul, is posted out "Delete" on 20 Jul: on the date his inputs from then are deleted and the one spanning it is
  ended the day before — the DET with them. He drops off 249's manpower with his seats on its published 20–31 Jul
  still standing. "Overseas Sqn" and "SANS" are the same question.
- **Where today.** `state/person-delete.ts` (step 4: deletes his inputs from the cutoff, ends a spanning one the day
  before); the posting pass `leavewar/sync.ts runPoOutcomes`. **Unchecked:** what each outcome does today to seats he
  holds after the date.
- **The fix.** Recommended: the same refusal as the transfer, for every outcome — "On DET · 249 until 31 Jul" —
  the posting waiting until the DET ends or is cut, as D306 waits. The other choice: the outcome runs, his DET ends
  the day before, and the detachment's days he is on go pending.
- **Weight: MEDIUM.**

---

## LOW

### 17. Words and lists that say "overseas" or leave DET out

- **The failure.** A DET man left on a home AVALON seat reads "Overseas + planned: AVALON …" under the leave code;
  his crossed-out reason and the kind legend read "out of reach — cannot be planned for anything"; the war's "days
  taken" table has an OD column and none for DET; the war's legend, the Inputs calendar's colours and the type filter
  know no DET. A detachment need not be overseas.
- **Where today.** `engine/validate.ts` (the `day.sacrew` loop and the `b.av` branch print "Overseas"; code
  `LEAVE_FLY`); `engine/inputs.ts inputRuleText`, `offWord`, `canSpare` (`local`); `ui/TypeLegend.tsx`;
  `leavewar/engine/leaveyear.ts DAYS_TAKEN_COLS`; `leavewar/ui/Chrome.tsx` legend; `leavewar/engine/codes.ts` (names,
  `KIND`); `ui/board-html.ts inTypeCls`; `ui/inputscal-model.ts toneOf`. Hand-kept lists a new kind must join:
  `engine/schema.ts INPUT_TYPES`, `testing/refwin.ts` (the crew-rest set), `engine/inputs.ts PLACEHOLDER_KINDS`
  (DET stays out — right).
- **The fix.** DET's own words: "On detachment + planned: …", "at 249 — cannot be planned here"; a DET column in days
  taken (his call: or none); the legend, colour and filter drawn with its mark (D1625).
- **Weight: LOW.**

### 18. The IT side's table list — what DET adds

- **The failure.** The handover goes out without it and the IT side builds an `Input` that cannot say which
  detachment.
- **Where today.** `docs/data-model.md` §Input (no detachment column; `InputType` flags `work`, `local`, `ground`,
  `half`, `shiftHard`), §Squadrons (direction only); `docs/handover-dataverse.md` has no detachment at all.
- **The fix.** Add: a `Unit` table (squadron or detachment: number, name, place, parent squadron, from, to, closed
  at, closed by); `Input.detachmentId` (plain lookup to `Unit`, required for DET and only for it — a code app takes no
  polymorphic lookup); an `InputType` row DET with flags for "shows on the war / counts out" and "asks OIL" rather
  than the kind's name tested in code; the unit on `ScheduleWeek` and its children, on `Setting`, on the issued
  version's frozen people; the count row's "count people on DET" (item 4). Say how a detachment's day is fetched: its
  DET inputs first (by `detachmentId` and date), then those people's other inputs — two filtered reads, inside the
  2,000-row page. §11 gains who may file, change and delete a DET (item 9).
- **Weight: LOW.**

### 19. A new detachment's Logic settings

- **The failure.** "249" is made on Admin → Squadrons and its lines are judged by the schedule they sit in (D2109).
  If its Logic starts at the app's defaults, 149's crew rest of 12 h reads 10 h at 249 from the first day, and the
  full-day line for OIL differs from the squadron's. **Unchecked** whether round 6's R8 already says this.
- **Where today.** `engine/validate.ts` reads one `VCONF`; `engine/oil.ts uniformOil` reads `ruleNow('oilFullMin')`.
- **The fix.** A new detachment starts as a copy of its squadron's Logic, then its own to change.
- **Weight: LOW.**

---

## Places DET does not affect, or affects only through what is already ruled

- **1 — bids, months:** leave may already be bid over a day held by an away duty (`leavewar/ui/matrixrowparts.ts
  inputsFilledDay`), and only leave or a medical replaces a bid (`inputgate.ts replaceBids`) — DET needs neither
  changed.
- **1 — the SANS calendar's need:** it reads the two Available rows (`availrows.ts`); D2146 (4) rules it and its cost
  was told to him. Nothing more.
- **2 — a DET crossing a weekend with no work:** earns nothing once finding 2 is done; ruled by D2146 (2).
- **4 — the Tracker:** it reads people and medical inputs only (`tracker/peoplewire.ts medForTracker`); no sortie
  reaches it by itself (round 6's R10). A DET changes nothing there.
- **5 — quals and currencies:** quals are ticks an admin gives, with no expiry and nothing derived from sorties
  (`engine/people.ts`); the Tracker's "last flown" is typed. Nothing runs out while he is away.
- **6 — crew rest, days in a row, the long day:** round 6's R5 already has them follow the man; where it lands is
  `validate.ts`'s crew-rest pass and `weekctx.ts workedSet`. DET adds only findings 7 (typed times) and 14 (the clock).
- **9 — the day's count (D2096):** counts aircraft in waves (`ui/html.ts`); no input is read.
- **12 — print and export:** both carry flying lines only (`ui/printpdf.ts`, `ui/export.ts`; the Inputs export went,
  D773).
- **12 — Undo:** a DET filed or deleted is one input change and undoes as any (D148); Undo of Close is already a
  later-round question.
- **12 — the people check across squadrons (D2108), the free-people group (D2133):** they must read the lender's
  inputs, DET among them — the design's "inputs follow the person"; no rule of DET's own.
- **12 — ALL / ALL AVAIL as a DET's person:** already refused — the placeholder kinds are a fixed list
  (`engine/inputs.ts PLACEHOLDER_KINDS`).
- **12 — the transfer, Close:** worked through in D2146 (5), (6) and D2147; findings 8 and 16 are the neighbours they
  left.
