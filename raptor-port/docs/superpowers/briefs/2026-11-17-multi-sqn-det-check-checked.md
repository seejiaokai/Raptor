# What else in the app DET affects — the two reads, checked and merged (17 Nov 26)

Brief: `2026-11-17-multi-sqn-det-check.md`. Reports checked: `…-det-check-fable.md` (19 findings: 3 HIGH, 13 MEDIUM, 3
LOW) and `…-det-check-astra.md` (7 findings: 3 HIGH, 4 MEDIUM, plus a coverage table). Read only; this file is the only
change. Every "today" claim below was opened in the code or document named; rulings read from their full rows
(`.claude/decisions-full/`); "on the page" means round 6's page `raptor-port/docs/mock/2026-11-17-multi-sqn-r6/page.html`
or the design note §Round 6. Paths are under `raptor-port/src/` unless written in full. D56: no finding below lives only
in stored demo data.

**Counts:** 17 survive — 1 HIGH, 10 MEDIUM, 6 LOW. 6 already ruled or already on the page (build notes kept). 1 dropped.

## The merged list

| id | from | verdict | weight | the failure, one line | recommended fix | needs drawing |
|---|---|---|---|---|---|---|
| M1 | Astra 1, Fable 10 (detachment part) | TRUE | HIGH | Viper's DET is moved from 249 to another detachment for a published Tuesday; nothing the published-day comparison reads changes, so the home day keeps the old detachment's name with its four sign-offs standing, and 249's issued day is never told he left. | The detachment a DET names (by its identity, not its shown name) is part of what a published day compares; every home and detachment day whose face or checks change goes pending; each issue keeps the destination and membership it went out with. Owner's call (with M1): whether a man *added* to a detachment's published day is a change there (Fable: no, only a man removed who is seated). | n |
| M2 | Fable 1 | PARTLY (weight lowered: round 6's R4 already makes the clash red, pending and rung) | MEDIUM | 149 has published Sat 18 Jul with Viper on the standby desk; on 6 Jul he is put on DET 13–31 Jul; the issued Saturday still shows him on the desk and has credited his OIL until the scheduler re-publishes. | The DET window and the several-people picker list each man's home seats inside the dates before Save — "Take them off" (default) or "Keep"; OIL pays nothing from a home seat on a day his DET puts him elsewhere. Other choice: leave it to R4's red warning, as an OD is today. | y |
| M3 | Fable 4, Astra 4 | TRUE; PARTLY already on the page (D2146 (4), L "whether count rows include it") | MEDIUM | Copying OD's place in the Leave War's code either counts the six out (D2146 undone) or draws nothing; and counted in, they also fill 149's standby-team row, so the last home crew's leave is approved on a green row. | Split "shows on the war" from "counts him out"; DET its own code, ladder level and mark (D2146 (4)). A count row's choice "Count people on DET" needs a new control — today's row filter knows only seats, CATs and quals. Recommended: on by default for people rows, off for team rows; the day panel gains "On DET · N". Owner's call: the team rows' default; or keep every row as is and drop the promise that a row can leave DET out. | y |
| M4 | Fable 5 | TRUE | MEDIUM | Three of 249's six bid leave for Wed 22 Jul; 149's approver sees Available green (DET men count in) and approves; 249 cannot fly its programme and learns only from three new Unavailable rows. | On a day a man's DET covers, his bid window and Approvals line say "On DET · 249: 6 there, 5 with this". Other choice: a required figure for the detachment itself, later. | y |
| M5 | Fable 6 | TRUE | MEDIUM | A member files his detachment on the Leave War's own "OD" button, as he always has (D1318); he is counted out at home and 249 cannot plan him; nothing says why. | The war's button row reads CSE · OD · DET while his squadron has an open detachment over the picked day. Owner's call: that, or no DET door on the war and an OD filed inside an open detachment's dates says once "Going on 249? File DET." | y |
| M6 | Fable 7, Astra 5, Fable 2's crew-rest half | PARTLY already on the page (L "a DET is whole days only"; F4 "no Reject") | MEDIUM | DET added beside OD inherits OD's doors: it opens with All day off at 06:00–18:00 (so the six look free at home after 18:00 and bear crew rest from a made-up finish), can be moved onto the Ground Programme, cancelled, marked information only, or retyped to OD with one dropdown — each leaving a man in two places or none. | A DET is a whole-day place record: no All day box or times, no Reject (F4), no → Ground, no CX or information-only mark, its kind fixed once saved; named out of the crew-rest set and the OIL question both (D2146 (2)), each pinned by a test. | y (the DET input is already to be drawn, D2146 (7)) |
| M7 | Fable 8 | PARTLY already on the page (R4: moving "To" later asks "Extend the 6 people's DET to 28 Jul?") | LOW | 249's "To" is moved earlier, or its "From" later; the six DETs now run outside the detachment's dates, which D2146 (3) says are refused at filing. | A date moved inward lists the DETs it trims and trims them in the same press; it is refused while a published detachment day outside the new dates stands (Close's own question, D2142). | y |
| M8 | Fable 9, Astra 7 | TRUE; PARTLY already on the page (R4 tells 249's schedulers when a seated man is taken off) | MEDIUM | Saber, not picked, files DET for himself: he leaves 149's crew list and joins 249's manpower, and neither scheduler's bell rings (today the bell tells only the input's people). A changed destination or an early end reads as a plain "dates changed". | A DET filed, changed or deleted rings the schedulers of the detachment and of his squadron, one line each, saying joining / moving / back home and the dates. Owner's call: a member may file and lengthen his own DET but not shorten or delete it over a day he is planned on there (the window says so), or he may freely, the detachment's day going pending. | y |
| M9 | Fable 11 | TRUE | MEDIUM | Six go to 249 and none holds the Scheduler tick; three of the four sign-off boxes count only a ticked scheduler, so 249 can never publish and its weekends never pay OIL (D2146 (2)). | The detachment's boxes offer its squadron's qualified people wherever they are, those at the detachment first. Other choice: only people on its DET, and "+ New detachment" warns while none of them holds the tick. | n |
| M10 | Fable 13, Astra 6 | TRUE; PARTLY already on the page (L "Insights for a borrowed man, and a detachment's lines in its squadron's totals"; R8 "Insights' hours by his own squadron's") | MEDIUM | Week of 13 Jul: Viper flies 149's Monday then nine sorties at 249; 149's Insights lists him a low flyer and the five who left Sunday as "not flying"; no screen has his week. | Figures about a schedule stay that schedule's, each formation counted once, the scope said beside them; a DET man is marked "249", never "not flying". Owner's call: a separate whole-person weekly hours figure across schedules (recommended by both), or schedule-only hours labelled plainly. | y |
| M11 | Fable 14 | PARTLY (its "no passage names a time zone" is wrong: round 6's F12 does) | MEDIUM | 249 is eight hours behind home; Viper lands 249's last line at 22:00 local Thu 30 Jul and 149 plans him 07:00 Sat 1 Aug; R5 has crew rest follow him across places, but every time is minutes from a midnight with no clock, so the gap is out by eight hours — a breach missed or a false one. | F12 (on the page) already keeps local times as typed and every date turn on home's date; add: across two places, crew rest is not summed (travel lies between) and the first home line after a DET says so — or a place carries its hours from home (0 by default) for cross-place checks only. Owner's call between the two. | y |
| M12 | Astra 3 | TRUE (not DET-only: every squadron's print) | MEDIUM | 249's (or 149's) published day printed from the schedule reads "142 Flying Programme" in its title and heading; exported rows carry no owner. | The print title, heading and file name carry the selected schedule's number and name; exported rows carry the line's owning squadron or detachment. | y |
| M13 | Astra 2 | PARTLY (the code is as said, but R4's after-the-fact red warning catches the result; not silent) | LOW | Saber's DET is removed; another scheduler plans him at home; the filer presses Undo and the DET comes back with the home seat standing. Loading an old home plan after a DET is filed does the same. | Name Undo, Redo and loading a plan among R4's doors that list what they break before acting. Astra's refusal is the other choice; it goes further than R4 and D148. | n |
| M14 | Fable 16 | PARTLY ("his seats still standing" is wrong: a delete empties his seats from the cutoff) | LOW | Ranger, on 249 until 31 Jul, is posted out "Delete" on 20 Jul: his DET is ended the day before and he leaves 249 mid-detachment, its published days going pending, while the transfer outcome is refused across a DET. | Owner's call: the same refusal for every posting outcome ("On DET · 249 until 31 Jul"), the posting waiting as D306 does; or the outcome runs as today, the detachment's days going pending. | n |
| M15 | Fable 15 | PARTLY already on the page (L "which detachments a DET may name: both squadrons' open ones") | LOW | (a) If a DET may name the other squadron's detachment (L's recommendation), the transfer sheet's refusal "a DET onto a 142 detachment across the date" (D2146 (6)) no longer has a reason — the two disagree. (b) A SANS man on DET is closed to every line there until he files SANS availability day by day. | (a) Settle L first; if any open detachment, the transfer refusal goes. (b) Owner's call: his SANS availability goes on governing as today (he files it there too), or a DET makes him available there, or SANS people are not offered in the DET picker. | n |
| M16 | Fable 17 | TRUE; PARTLY already on the page (the Leave War mark, D2146 (4)) | LOW | A DET man left on a home seat reads "Overseas + planned: …"; the kind legend says "out of reach — cannot be planned for anything"; the war's days-taken table has an OD column and none for DET. | DET's own words ("On detachment + planned", "at 249 — cannot be planned here"); its legend, colour and type filter; a DET column in days taken (owner's call: or none). | y |
| M17 | Fable 18, Astra's table (11) | TRUE | LOW | The table list goes to the IT side with no way for an input to say which detachment. | Add to `data-model.md` and `handover-dataverse.md`: a unit table (squadron or detachment, place, parent, dates, closed), a DET's detachment reference (required for DET only), the owning unit on schedule days, settings and issued versions, the count row's DET choice (M3), and who may file, change and delete a DET (M8). | n |

## Evidence per finding

### M1 — the detachment must be part of what a published day compares (Astra 1; Fable 10, detachment part)
- `engine/inputs.ts inpDetailKey` (line 197) names a destination only for Attach:
  `...(isFly(inp.type)&&toOf(inp.to)?{to:toOf(inp.to)}:{})`, and `isFly` is `/^Attach$/i` (line 484). A DET built the
  same way would compare equal when only its detachment changes.
- D2146 (1): at home he shows "as one row titled by the detachment" — so the detachment is something a reader of the
  home day sees, which D178 makes a pending change.
- `frozenInputMatch` (line 236) and `engine/publish.ts` (`currentBindNow`, `signMissing`) read these keys to decide
  what is pending and unsigned — as both said.
- Not on the page: round 6 says nothing of what a re-pointed DET or a membership change does to an issued detachment
  day. Kept HIGH: wrong published record.

### M2 — a DET filed over home seats already published (Fable 1)
- Nothing unseats: `engine/validate.ts` raises `INPUT_FLY` / `LEAVE_FLY` as `add('hard', …)` warnings (lines 1003–1118).
- The OIL walk reads seats with no absence test: `engine/oil.ts dayOilWork` (line 236) puts every real person on a row
  with times; `engine/oilev.ts oilEarnedWork` (line 1233) credits that work. No `isAway` in `oilev.ts`.
- The Leave War flags only leave or sick over work: `leavewar/engine/dayview.ts forbiddenPair` pairs `leaveLike` and
  `sick` with `work` (lines 197–202).
- Lowered from HIGH: round 6's R4 (on the page, "I design these as written unless you say no") gives "a red warning on
  any line holding a man not at its place, pending on a published day, and its schedulers' bell rung". The published
  day goes pending; the wrong OIL lasts only until it is re-published, as for any late input (D178). What R4 lacks is
  the list before Save when a man *joins* (it lists only place moves, Close and a transfer, and a man taken *off* a
  detachment).

### M3 — "shows on the war" and "counts him out" are one switch today (Fable 4; Astra 4)
- `leavewar/absences.ts warVisible` (line 120): `return t === 'CSE' || t === 'OD'` after leave and medical;
  `warCounts` (line 135) gates `contribsOfInput` (line 218: `!warCounts(row) … return []`), the two absence builds in
  `leavewar/sync.ts` (lines 211, 264) and `state/undo-wire.ts` (line 250).
- `leavewar/engine/dayview.ts`: `AWAY_DUTY = new Set(['OD', 'CSE', …])`, `levelOf` returns 8 for an unknown code
  ("shown last, removes nobody"), `OFF_WAR` holds 'OD'.
- `leavewar/engine/requirements.ts CrewFilter` (line 41) has seats, cats, notCats, quals, notQuals only.
  `availability.ts haveOf` (`1 - v.away`) feeds both `ruleHave` and the team weight (line 236).
- Already ruled / on the page: D2146 (4) — a mark of its own, counted in the Available rows, and "an admin's choice of
  who a count row counts … could leave DET out of a row, put to him"; L "DET on the Leave War: its mark, whether count
  rows include it". New here: the control does not exist today, the team rows, and the day panel line.

### M4 — leave for a man on DET (Fable 5)
- `leavewar/engine/availrows.ts` and `evaluate.ts` judge a bid against the squadron's rows; D2132 keeps the Leave War
  on his own squadron. D2146 (4)'s told cost is the other way round (leave at *home* approved while men are away), so
  this case is not yet put to him.

### M5 — the Leave War's OD button (Fable 6)
- `leavewar/ui/LeaveButtons.tsx` line 63: `{ code: 'OD', title: 'Overseas duty' }`; `leavewar/state/store.ts`
  `FILED_STRAIGHT = ['CSE', 'OD', 'OTH', 'ATCH']` (line 3798). D1318's full row: an OD on the war "can go anytime.
  member can file it too" — filed far ahead "since both lower manning". Not on the page.

### M6 — DET must not inherit OD's doors (Fable 7, Astra 5, Fable 2's crew-rest half)
- Times: `engine/inputs.ts defaultAllday` (line 692) is off for the "Duty & other commitments" group; OD's row is
  `grp:'duty'` (line 406), so `typeGroup` reads 'other'. `ui/inputedit.tsx newInputSeed` (line 808):
  `allday: defaultAllday(t), s: 360, e: 1080` (06:00–18:00).
- Crew rest: `restsInput` (line 705) takes every kind but leave, medical, upchit, Personal and SANS Availability;
  `engine/validate.ts` line 583: `if(i.nx||i.pv||!restsInput(i.type))return;` then sets `prevFlyEnd` from typed times.
- Reject and → Ground: `engine/slots.ts` lines 530, 540 (`if(isOD(inp.type))inp.odGround=true`), line 680 (Reject
  parks an OD); `goesOnProg` reads `odGround`.
- Silent marks: `inputSilent` = `!!inp.cx||!!inp.info` (line 876). Retype: `ui/inputedit.tsx commitInputEdit` line
  1343 (`isOD(wasType) || isOD(r.type)`).
- Already on the page: L "A DET is whole days only" (covers the times, and so the crew rest from them); F4 "no Reject
  on a DET at home"; D2146 (2) "DET asks no OIL question". New: → Ground, CX / information-only, the retype, and naming
  DET out of `restsInput` as well as `oilAsks` so a new row added beside OD cannot pick either up by construction.

### M7 — moving a detachment's dates (Fable 8)
- Round 6's R4: "Moving a detachment's 'To' asks 'Extend the 6 people's DET to 28 Jul?', yes by default." Covers the
  outward move. D2146 (3) refuses a DET outside the open dates at filing; nothing says what an inward move does.
  `engine/inputs.ts inputCoversDate` (line 1000): an input covers its last day. Lowered to LOW: only the inward case is
  left.

### M8 — the bell for a DET (Fable 9; Astra 7)
- `state/notices.ts noticePass` (line 197): new inputs tell `for (const p of ids(a)) tell(p, a, [{ k: 'in' }])` — the
  people in it, never the actor; `common` (line 129) compares cancel, OD in/out, dates, times, people, title (`inpLabel`)
  and remarks — no destination.
- Rights: `state/perms.ts mayChangeInput` (line 313): "the man himself, in full — 'himself' is the input's ONLY NAMED
  PERSON"; `mayEditInput` / `mayDeleteInput` (lines 324–325). A shared DET from the picker is nobody's own, so only a
  self-filed one is his to delete.
- On the page: R4 — "A change that takes a man off a detachment for days he is seated there says so first … 249's
  schedulers are told". Not covered: joining, a moved destination, and telling his home squadron's schedulers.

### M9 — the detachment's sign-offs (Fable 11)
- `engine/publish.ts SIGN_ROLES` (line 1529): `['sked',…,true],['plan',…,true],['appr',…,true]`; `signRoleOk` line
  1684: `if(rr&&rr[2]&&!isScheduler(who))return false`. Round 6's F18 is about Close's amendments only; who signs a
  detachment's ordinary days is not on the page.

### M10 — Insights (Fable 13; Astra 6)
- `engine/insights.ts computeInsights` line 20: one `issuedWorld()`; line 72:
  `const idle=ROSTER.filter((id:any)=>PEOPLE[id]&&!fc[id])` — no input read; hours from `validate.ts workSpan`.
- On the page: L "Insights for a borrowed man, and a detachment's lines in its squadron's totals"; R8 "Days in a row and
  Insights' hours by his own squadron's". New: "not flying" mislabelling a DET man, and a whole-person week.

### M11 — two places, two clocks (Fable 14)
- `engine/validate.ts` line 595: `const cl=prevFlyEnd[id]+VCONF.crewRest-1440;` — minutes from a midnight, no clock.
- Fable's "No ruling, backlog item or design passage names a time zone" is wrong: round 6's F12 ("249 is some hours
  behind home … every date turn goes by home's date; a detachment's schedule is typed in its local times, shown as
  typed") and F1 ("a detachment uses home's holidays and weekends"). What is left is R5 (crew rest follows the man) read
  with F12 (no conversion): the cross-place sum is wrong by the time difference.

### M12 — the print title (Astra 3)
- `ui/printpdf.ts schedPrintHTML` line 71: `<title>142 Flying Programme — …`; line 98:
  `<h1>142 — Flying Programme</h1>`. `printSchedPDF` (line 104) takes rows from `ui/export.ts publishedDays` /
  `schedRows`. The page's L line "Print and export show only what is issued" does not cover it; nothing in the backlog.
  Not DET-only: 149's print reads "142" too.

### M13 — Undo and loading an old plan (Astra 2)
- `state/sched-commit.ts decompose` (line 102) and `schedWriteRecords` (line 216, `vetRestore` on restore, line 344);
  `leavewar/inputgate.ts vetRestore` (line 409) runs the war's gate, which "Nothing is refused here" (line ~397);
  `engine/drafts.ts loadVersionToWorkingCopy` (line 684) restores the day's rows, inputs staying as now. So the claims
  hold — but R4's red warning "on any line holding a man not at its place" fires on the result, so it is not silent.
  Astra's refusal goes beyond R4 and D148 (which refuses only where the very same thing was changed since).

### M14 — posting out mid-detachment (Fable 16)
- `state/person-delete.ts`: inputs from the cutoff go; one spanning it ends the day before, `r.mod = nowStamp()`
  (line 256); his seats "go from his cutoff" through the after-command pass (comment above line 250). So his 249 seats
  do not stand — Fable's "still standing" is wrong; the days go pending. The design note's transfer refusal (round 6
  table "Refused") covers the transfer only.

### M15 — whom a DET may name; SANS on DET (Fable 15)
- L on the page: "Which detachments a DET may name: both squadrons' open ones (recommended …), or his own squadron's
  only." D2146 (6): the transfer refusal reads "a DET onto a 142 detachment across the date".
- `engine/avail.ts sansGate` (line 340): `const rec=sansAvailOn(id,dt); if(!rec)return {status:'none'};`.

### M16 — words (Fable 17)
- `engine/validate.ts` lines 1088 and 1118: `` `${dn?'Downchit':'Overseas'} + planned: …` ``; `engine/inputs.ts
  inputRuleText` line 461: "out of reach — cannot be planned for anything, an SC SPARE included";
  `leavewar/engine/leaveyear.ts DAYS_TAKEN_COLS` (line 367) ends `'MED', 'CSE', 'OD'`.

### M17 — the IT side's table list (Fable 18; Astra's table, area 11)
- `raptor-port/docs/data-model.md` and `raptor-port/docs/handover-dataverse.md`: zero mentions of "detachment"
  (`grep -c -i`). §Input at line 562; §Squadrons at line 1010.

## Already ruled or already on the page (not new findings — build notes kept)

| from | marked | why, and the note for the build |
|---|---|---|
| Fable 2 (DET asks the OIL question by construction) | ALREADY-RULED D2146 (2) | TRUE today: `oilAsks` returns `restsInput` (`engine/inputs.ts` line 714), read by `oilev.ts projectOilInputs`, `leavewar/sync.ts oilPendingFor` / `oilOpenOn` / line 2990, `oil.ts` lines 126, 142 and the input window. The ruling says no OIL question; the build must name DET out and pin it (M6 carries the crew-rest half). |
| Fable 3 (an ALL AVAIL at the detachment credits people at home) | ALREADY-ON-PAGE R6 (with D2097's recommendation) | TRUE today: `leavewar/sync.ts availableFor` (line 1534) walks `Object.keys(PEOPLE)` less those kept out; it is `HOOKS.oilSentinel` (line 321). R6: "A detachment's ALL AVAIL counts the men on it; each home ALL AVAIL counts its own men at home." Build note: this is where it lives. |
| Fable 12 (his phone view) | ALREADY-ON-PAGE (L "A man on a detachment sees its schedule by himself, for its dates"; F20) | D2132 confirms one schedule, no ▾. Note for round 7: say whether that view starts when the DET is filed and stays after Close (Fable's and Astra's recommendation). |
| Fable 19 (a new detachment's Logic) | ALREADY-ON-PAGE (L "A detachment's Logic, areas, sims, duty desks and jets start as a copy of its squadron's") | — |
| Astra's table, area 2 (one OIL evidence block per date) | ALREADY-ON-PAGE Q1 (one pooled span) | Astra says so itself. `leavewar/sync.ts desiredOilCells` (line 1724) is where the build gathers both schedules. |
| Astra's table, area 10, and Fable 10's late-stamp part (whose cut-off; Close moving the stamp) | ALREADY-ON-PAGE (L "Whose late cut-off judges a borrowed man's input … his own squadron's"; D2146's open "whether a DET filed late reads LATE") | Note: an act of the app moves the stamp today — `state/person-delete.ts` line 256 `r.mod = nowStamp()` — so if a late DET reads LATE, Close and a moved date must not re-stamp it. |

## Dropped

- **Fable 10, home part — WRONG.** It says adding a seventh man to the shared DET makes nineteen published home days
  "1 pending" for nothing, and recommends one DET a man. The pending mark is right: the seventh man is newly away at
  home on every one of those days, a real change to the published record (D178). The fix also goes against D2131 and
  D2146 ("the several-people picker files one DET input") with no failure to justify it.

Astra's coverage table and both readers' "not affected" lists (the Tracker, quals and currencies, the day's aircraft
count, print beyond M12, D350's personnel Undo) were checked and agree with each other and the code; nothing to add.
