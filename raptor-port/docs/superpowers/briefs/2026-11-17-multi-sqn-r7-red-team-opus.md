# Red team, round 7 — the fresh, blind Opus reader (second seat), 17 Nov 26

Read whole: the design note, round 6's page (each recommendation taken as the design), D2087–D2149 and D2159 in full,
the older rulings named in the brief, the three earlier reports (to avoid repeating them). Code opened for every claim
about today's app; each is named. Nothing here repeats an earlier finding unless it shows that finding's recommended
fix is itself wrong, and says so.

Totals: 7 HIGH, 6 MEDIUM, 2 LOW; 10 questions.

---

## HIGH

### 1. An input's "Reject" is one switch on the man's own input, so one squadron's Reject — and Close's "clear the rows from inputs" — changes it on every schedule

**Failure.** Viper (142) files Training, Mon 13 Jul 14:00–15:00. 142's scheduler accepts it onto 142's ground
programme. 149 borrows Viper that morning, so his inputs show on 149's schedule too (the review's improvement 5,
"shown on every schedule that plans him"). 149's scheduler presses Reject on that row on 149's schedule. Today a
Reject writes the input record itself — `acc='r'`, "the explicit DORMANT state" (`src/engine/slots.ts`,
`unacceptInput`; the comment calls it a "global filing write"; `src/engine/inputs.ts`, `inputDormant`). So the
Training row leaves 142's ground programme too, the "Training but tasked" checks go quiet on 142's day, and 142's
published Monday reads pending — a 149 scheduler has changed 142's record and its man's input. The same happens
by design in round 6's F16: Close "clears every row of the day … rows from inputs". Built as today's remove, Close
parks every input of the six men on the cleared days — a medical downchit or a leave on Sat 25 Jul included — on
every schedule, home included, though the men only came home.

**Cause.** Improvement 5 (inputs belong to the person, shown on every schedule that plans him) and F16's "rows from
inputs" against today's one filing decision per input (D1393's Reject, D739/D740 — the row IS the input). Astra's
earlier question asked only about times and remarks typed on a shared row; Reject and Close were not covered.

**Fix.** (1) An input's filing decision (on the programme, under Unavailable, parked) becomes per schedule: the
input keeps its content once; each unit's schedule keeps its own landing of it. (2) On the other squadron's schedule a
borrowed man's inputs show only as "unavailable 14:00–15:00" (round 6's L item, "when, not why") with no Accept or
Reject; only his own squadron — or his detachment for a man on DET there — files them. (3) F16's "cleared" never
touches an input: lines, waves, programme rows not made from an input, desks; a row made from an input simply follows
the man home. (4) Name it in data-model §11 and the table list for the database step.

### 2. Closing a detachment the day after its "To" — the normal case — stretches every man's DET over days he was already home

**Failure.** 249 runs 13–31 Jul. On Fri 31 Jul the bell reminds its admins (D2134); the admin closes it on Mon 3 Aug.
F15: "their DET ends that day" (the closing day); F16's third step "then end their DET". For the six whose DET ended
on 31 Jul, "ends 3 Aug" is an extension: they show away at home on 1–3 Aug, cannot be planned there, 149's
published home days of 1–3 Aug go pending with each man's home lines wearing R4's red "not at its place" warning, and
if a scheduler amends them off to clear the warning they lose OIL for days they really flew at home. The card's line
1, "6 people back on 149's schedule from Tue 4 Aug", is false: they have been back since 1 Aug.

**Cause.** F15 and F16 (and D2135, "closing ends its people's DET that day") written for an early close only; D2134
makes a close on or after the "To" the everyday path. The same gap the other way: moving a detachment's "To"
earlier (R4 covers only extending) leaves DETs running past the detachment's dates, which D2146's reading (3) refuses.

**Fix.** (1) Close sets each DET's end to the earlier of its own end and the closing day — never later. (2) The card's
line 1 appears only for men whose DET it actually shortens, and reads their own dates. (3) Shortening "To" asks the
mirror of R4's question: "Shorten the 6 people's DET to 28 Jul?", yes by default, their home days after it going
pending. (4) A close after the "To" with nothing to shorten shows only "Kept under Past detachments".

### 3. Close deletes another unit's own line in its waves, and that unit's men lose their OIL

**Failure.** Round 6's own F17 example: 249's published Sat 25 Jul holds a line of 242's (142's detachment at the same
exercise — D2092's "two detachments on the same exercise"). 242's RU, crewed by Kite and Lark, flies in 249's 1st wave;
249 publishes it (D2106). Close of 249 clears every row of Sat 25 (F16) and publishes AL1. RU is gone from both
schedules — 242's own line, deleted by 149's admin — and Q1's OIL (worked from the latest published days) takes
Saturday's OIL from Kite and Lark, though 242 is still at the exercise and still flying Saturday. The card counts "6
people" OIL taken back; 242's men are not on it. F17 only says "its schedulers are told".

**Cause.** F16 ("every row … lines, waves") and F17 against D2114/D2149 (only a line's own squadron, or the other for a
line concerning both, changes it) and D2106 (the wave's owner publishes the other's line in it). Closing one unit was
never meant to end another's flying.

**Fix (recommended).** On each cleared day Close moves every other unit's own line out of its waves into a new wave of
that unit, same times (as D2130 already has 142 plan in a wave of its own when 149 has none); that unit's day goes
pending for its own scheduler to publish; the card reads "Sat 25 Jul: 242's RU moves to a 242 wave — 242 publishes
it". **Other choice:** "Close detachment" greyed while another unit's line stands in its waves after today, the card
naming each to move or remove first.

### 4. Two published schedules can hold one man at one time, and neither day goes pending

**Failure (a), the take-off.** Both Tuesdays published; 149's VL holds Saber (142) 14:00–16:00. 142's scheduler presses
"Take him off ACADEMICS" (D2149). On a published 149 day "the change waits for 149 to publish it". The people check
across squadrons "reads 149's latest working plan" (the note, chat 98's Q3 knock-on), where Saber's seat is now
empty — so 142 plans Saber on its own 14:30 line with no warning and publishes. 149's scheduler has gone home (F8's
own example). Tuesday: Saber stands on 142's published line and on 149's published VL at the same time; his bell
(F20) tells him he is on VL; Q1's OIL counts both spans. The Delete's words, "His seat is left empty; 149 is told.",
never say he stays on 149's issued VL until 149 publishes — and per F19 the "ACADEMICS · 149" row stays on 142's day
after he pressed Delete, which the words do not prepare him for.

**Failure (b), F19.** 142's published Tuesday holds Viper on RU at 14:00. 149 picks Viper for its 14:00 academics
anyway (a clash is a warning, never a bar) and publishes. Under F19 the row arrives on 142's day "never pending on
142's day" — so two issued schedules task Viper at 14:00 and nothing on 142's published day asks for an amendment.
D2107 (which F19 replaces) at least turned 142's day pending; R4 turns a published day pending for a man "not at its
place", but F19 leaves no equivalent for a clash between two squadrons' issues. D45: "things shouldn't change
silently without the scheduler acknowledging it".

**Cause.** D2149 + F8 (take-off waits) with the check reading only the working plan; F19's "never pending".

**Fix.** (1) The cross-squadron people check reads both the other squadron's latest issue and its working plan, and
warns on either ("Saber is still on 149's issued VL 14:00 — it changes when 149 publishes"). (2) The Delete's second
line reads "His seat is left empty; 149 is told. Until 149 publishes, he stays on its issued VL." (3) A clash between
two issues shows as a red warning on both published days and on both Publish cards, and the bell rings both
squadrons' schedulers; product call for him: also pending on the day whose publish made the clash (recommended — the
D45 principle), or the warning alone.

### 5. "+ Put people on it" files ONE input for six men, so one man's early return changes all six

**Failure.** D2131/D2146: the door files one DET input for the six. Today a several-people input is one record with
one set of dates; each person's entry holds only who, by whom, when and a late date (`src/engine/inputs.ts`,
`peopleOf`, `entryOf`; D755/D756 "ONE record with the list of its people"). Spur goes home sick on 20 Jul. F4: "the way
off is the detachment's People list or the DET's dates". Changing Spur's end on the People list changes the record —
all six DETs end 19 Jul; the other five show free at home from 20 Jul and their 249 lines 20–31 Jul wear R4's red
warning, pending on published days. The only per-man action today is taking him out of the input, which removes his
DET for 13–19 Jul too — his past detachment days then show him "not at its place". Also: if Spur had filed his own DET
first (D2120's backup), the group filing hits L's "two DETs over the same days: refused" — the design never says
whether the whole door fails or skips him.

**Cause.** D2131 (one input for all) with F4 and D2120, against how a several-people input is stored.

**Fix.** The detachment's door files one DET per man (the same window, six records, grouped on the People list for
display); a change on the People list touches only that man's DET; a man who already has his own DET over the dates is
skipped and named ("Spur already on 249 from 13 Jul"). Other choice: keep one record and give each entry its own
end date — a change to how every several-people input is stored; not recommended.

### 6. Pooled OIL (Q1) has no kept copy of "his own squadron's" full-day line on the other squadron's published day

**Failure.** Saber (142) works only for 149 on Sat 25 Jul: a 149 sim and a 149 line, nothing on 142's day. 149 publishes
Friday. Today a published day keeps the OIL values it went out with — report lead, debrief, full-day line, assumed
flight length — in its own evidence block (`src/engine/oil.ts`, `OilRuleVals`; D592 (4), D2044). 149's block keeps
149's values. Q1 says the full-day line comes from his own squadron's — 142's — which no published day of Sat 25
kept. So it is read from 142's settings today (`oilRuleValsNow`). On Monday 142's admin moves the full-day line from 5h
to 4h: Saber's Saturday, 4h30 of work, silently turns from half a day to a full day on a day 142 never published and
149 never changed — no pending, because the pending reading compares each day with its own kept values. With work on
both days, the two kept blocks may also hold two different values of the same 142 setting (each kept at its own
publish), and Q1 does not say which wins.

**Cause.** Q1 ("his own squadron's settings") with F23 ("a published day keeps the values it went out with for every
man on it") against how values are kept per day.

**Fix (recommended).** Each published day's evidence block also keeps, for every man on it from another squadron, his
own squadron's full-day line at that publish; a pooled credit uses the values kept by the later of the two issues it
pools; a change in his squadron's Logic reaches a pooled day only when either day is next published (the D2005 and F23
rule). Other choice: the pooled credit uses the full-day line of the schedule where the day's last work sits (D2109's
logic) — simpler, but a man's Saturday then depends on where he worked.

### 7. F12's "home's date for every date turn" clears a day being flown at a detachment that is ahead of home; R5's crew rest is wrong by the hour difference

**Failure (a).** 249 is 7 hours ahead of home. At 23:00 home time Wed 22 Jul (06:00 Thu 23 at the detachment, crews
briefing for the 07:00 wave) the admin presses Close. By home's date "today" is Wed 22, so Thu 23 is "after today":
cleared, AL1 published empty, OIL taken back — for the day the detachment is flying. Round 6's F12 example tested only
a detachment behind home.

**Failure (b).** A detachment 7 hours behind. Hawk's DET ends Sun 26 Jul; R5's travel day ends at 24:00 — typed local,
which is Mon 07:00 at home. 149 plans him at home Mon 14:00: real rest 7h, but the app reads one clock for both
(`src/engine/validate.ts`, crew rest `pe+VCONF.crewRest-1440`) and sees 14h — no warning against 12h.

**Cause.** F12 (no clock per place, "much more to build") with R5 (crew rest and the long day follow the man across
places). The earlier Opus answer (store the hour difference with the place) was dropped without its cost being met.

**Fix.** One number per place, its hour difference from home, asked on Admin → Squadrons with the place (D2110). Date
turns that act on a unit's own days — Close's "after today", a DET's first and last day, R4 — use that unit's local
date; postings and the late mark stay on home's date (F12 as written). R5's cross-place gaps add the difference.

---

## MEDIUM

### 8. D2108 checks "areas and sims across both squadrons" — today's app checks neither, even within one squadron

**Failure.** 142's RU and 149's VL both book NORTH 09:00–10:00 on Mon 13 Jul. Nothing warns, and nothing would: the
warning list is entirely about people (`src/engine/validate.ts`, `WCODE` — Conflict, crew rest, quals, briefs, OIL;
no area or sim double booking), and a formation's area is free text ("NORTH+EAST", `src/engine/data.ts`) — his own
real example showed one area written two ways on the two squadrons' papers (D2090). The owner reads D2108 as a
promise the app will catch a shared area or sim clash.

**Cause.** D2108 assumes a rule family that does not exist.

**Fix (his call).** (A, recommended) say so to him now and file "area and sim clashes" as a build of its own at the
database step: one list of areas (with which overlap) and sims per place, picked not typed, checked across every unit
at the place. (B) narrow D2108 to people only; areas and sims shown side by side for the schedulers to judge.

### 9. R8's "if he flies on both that day, the stricter" overrides his explicit "Later line's" (D2123)

**Failure.** Saber flies 149's morning line Monday (149's crew rest 10h) and 142's evening line Monday, then 142's
early line Tuesday. He chose "the later line's schedule judges" over "the stricter" (D2123, round 3's Q7 put with both
choices). R8 brings back "the stricter" for a day flown on both. Today crew rest is judged by the later day's own
settings (`src/engine/validate.ts`, "EACH DAY'S OWN CHECKS UNDER THE LOGIC SETTINGS IT IS JUDGED BY", D2005) — D2123
matches it.

**Cause.** R8 (Fable's, adopted) against D2123; no clash named (D90, D201).

**Fix.** R8 reads: crew rest by the schedule of the later line (D2123); the long day and turn time by the schedule of
the line he flies, the later line where he flies on both; days in a row and Insights by his own squadron's. If he
wants "the stricter" back, it is put to him as a change of D2123.

### 10. F1's one holiday list makes one squadron's admin re-open the other's published OIL

**Failure.** 149's admin types Fri 7 Aug as a holiday in the shared list. 142's published Fri 7 Aug at once reads
"Became a holiday after publishing — republish for its OIL" (`src/engine/validate.ts`, `OIL_STALE_DAY`), the inputs
on it need an OIL answer (D781), and 142 learns of it only from its own day. This is exactly what F23 refuses for
Logic ("the other squadron's change applies from that day's next publication only").

**Cause.** F1 (one list per place, typed by either admin) with F23 and D781.

**Fix.** Keep F1, and: every change to the shared list tells both squadrons' admins (the D781 bell, for each squadron's
own published days and inputs it touches); the change names, before saving, the published days of each squadron it
turns stale.

### 11. Delete, Archive and every Post-out outcome other than Transfer reach into the other squadron's schedule, unannounced

**Failure.** 149 has Viper (142) on its published lines 1–5 Dec. 142's admin posts him out as Overseas Sqn from 1 Dec,
or deletes or archives him on Admin → Users. Today a delete "takes him off every day on or after the cutoff" and a
published day then reads pending (`src/state/person-delete.ts`, step 3; D297, D321 (7) for archive). Across two
squadrons that empties 149's seats and drops 149's sign-offs — a 142 admin changing 149's schedule (D2114 gives that
to 149's scheduler only) — and the bell (D1547) goes to "each admin", not to 149's schedulers. The transfer sheet
(Q7) lists 149's lines; the other outcomes list nothing.

**Cause.** The posting and account doors designed for one squadron; only Transfer (D2136) was redrawn.

**Fix.** Every Post-out outcome, Archive and Delete names the other squadron's lines and published days after the
date before saving ("149 has him on 3 lines, 1–5 Dec: his seats there are left empty"), and rings that squadron's
schedulers when set and when run; the seats empty on the other schedule as an ordinary change there, pending on its
published days.

### 12. The transfer "waits on its date" (Q7) but F13 makes it a dated fact; and one of its two refusals contradicts L1

**Failure.** Ranger's transfer to 149 is set for 1 Dec. On 1 Dec he is still on a DET onto 142's detachment. Q7: the
transfer "waits until the reason goes (as D306 does)". F13: whose man he is "read from his stints, 142 to 30 Nov, 149
from 1 Dec". Both cannot hold: today the posting record's dates are written when it is set and only the outcome waits
(`src/leavewar/sync.ts`, `postingPendingTag` reads `to`; `poHeldReason` holds the outcome) — so on 1 Dec the Leave War
and the stints say 149 while the "waiting" transfer says 142, and each schedule reads him differently. And the
reason itself is moot: L's first item recommends a DET may name either squadron's open detachments, so a 149 man on a
142 detachment is allowed anyway.

**Cause.** Q7's refusal list (D2147's knock-on (5)) against F13 and round 6's L1.

**Fix.** Drop the DET refusal (L1 covers it). For the last-admin case, refuse at the sheet and at any later action
that would make him 142's last admin before the date ("Ranger moves to 149 on 1 Dec — 142 would have no admin"),
so the transfer never has to wait; if it must, only his 142 admin rights wait, as D306 holds only the outcome today.

### 13. His SCHEDULER tick is a qual, so it goes with him — but the T rule says it ends

**Failure.** Ranger, a 142 member with the SCHEDULER tick, transfers to 149. The T rule: "His admin rights and
Scheduler tick in 142 end on the date". Q7: his quals go with him; F21: marks kept. The tick is a qual mark on his own
record (`src/engine/people.ts`, `isScheduler` reads `quals.sched`; the column in `src/engine/qualcols.ts`), so it
arrives ticked: from 1 Dec he is offered in 149's sign-off boxes (`src/engine/publish.ts`, `signRoleOk`), where 149's
admins never chose him. The Management tick (D1502) the same.

**Cause.** The T rule against Q7's carry list and F21.

**Fix.** On the date the appointment columns (SCHEDULER, MANAGEMENT, SXO) are cleared on his record, the change history
noting it, and 149's admins told; his flying quals and currencies go with him as Q7 says.

---

## LOW

### 14. R7 moves a place "from the next day's start" — D2119 (his "effective immediately") is narrowed without being named, and round 4's card words stop being true

R7 (Fable's, adopted) has a move count from the next day; D2119 has it take effect "the moment a master admin saves
it". Round 4's drawn line, "Once saved, 142 and 149 can plan each other's people", would then be false until midnight.
Fix: name D2119 as narrowed in R7, and the card reads "From tomorrow, 142 and 149 can plan each other's people".

### 15. Q5's "View only" removes D2094's "as a scheduler" grant without naming D2094

Q5's recommendation names only D785 as kept whole; D2094 (and the round 3 drawings of "as a scheduler") is narrowed
by it. Fix: name D2094 on the page as the ruling the recommendation changes (D201), so his answer settles both.

---

## Questions the design never answers

1. Where is a pooled OIL credit (Q1) stored and whose OIL tracker shows its evidence? — Once per man per date, on his
   own squadron's tracker, its evidence naming both days.
2. A 149 night line crossing midnight holding a 142 man: does "VL · 149" also stand on 142's next day? — Yes, one row
   per day for the part on that day; its Delete takes him off the whole line.
3. Does 142's printed or exported day carry the rows 149 has published there (F19)? — Yes, marked with 149's badge, as
   issued facts; round 6's "print shows only what is issued" should say so.
4. May a member put himself, by his own DET, on the other squadron's detachment (D2101 "at once" with L1)? — By
   himself, only his own squadron's; the other squadron's only through its People door.
5. Moving a detachment's "From" later: what of DETs that now start before it? — The same card as shortening (finding 2),
   their first days cut, yes by default.
6. A man on a group-filed DET is transferred or deleted: does that touch the others? — No; with finding 5's one DET a
   man, it cannot.
7. How many bell lines does 142's scheduler get in a week of shared flying (a pick, each 149 publish under F19, F8, R4)?
   — One line a day a squadron, updated in place.
8. Who signs a detachment's day, and may a man of the other squadron on it sign? — Its squadron's people with the
   SCHEDULER tick who are on it that day; never the other squadron's.
9. Does Close re-check the day lock across squadrons for the days it clears (F17's "Jolt is editing")? — Yes, and a
   held day is named on the card, never skipped silently.
10. After a transfer, do his past days' OIL answers and manual awards (D82) on 142's days stay editable by 142's admins?
    — Yes, by 142's, the change telling 149's admins (his balance is now theirs to read).

Rulings: none recorded — a read-only review.
