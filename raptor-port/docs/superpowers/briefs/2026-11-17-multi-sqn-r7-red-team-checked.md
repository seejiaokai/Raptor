# Round 7 red team, checked and merged — the claim-checker's report (17 Nov 26)

A fresh claim-checker read both round 7 reports (`…-r7-red-team-astra.md`, 3 findings and 4 questions;
`…-r7-red-team-opus.md`, 15 findings and 10 questions) against the code, the rulings' full rows, the design note, round
6's page and the three earlier reports. **Every round 6 recommendation is now his ruling ("all recommendations yes",
to be recorded as D2160)** — so the R and L items, F12, F15–F24, Q1, Q5, Q7, T and F13 are treated as rulings below.
Read only; nothing else changed.

Ids: **H** HIGH, **M** MEDIUM, **L** LOW. "A" = Astra's report, "O" = the Opus reader's (A1 = Astra's finding 1, AQ2 =
Astra's second question, O4 = Opus finding 4, OQ3 = Opus question 3).

## The table

| id | from | verdict | weight | the failure, one line | recommended fix | draw? |
|---|---|---|---|---|---|---|
| H1 | A3 + O7(a) | TRUE | HIGH | 249 is 7 h ahead; Ace presses Close at 23:00 home on Wed 22 Jul: by home's date (F12) Thu 23 is "after today", so the day 249 is flying at that moment is cleared, AL1 published, its OIL taken back | a place keeps its hour difference from home (asked on Admin → Squadrons); Close keeps every local detachment day already begun and clears only later ones; the card names the last kept day and the first home day. Other choice (his): keep home's date, but grey Close while it would clear a local day already begun, saying when it can be pressed | y |
| H2 | O3 | PARTLY | HIGH | 242's RU, crewed by Kite and Lark, flies in 249's wave on published Sat 25 Jul; Close of 249 clears every row (F16), so 242's line is deleted and Kite and Lark lose Saturday's OIL though 242 is still at the exercise and flying; F17 only rings 242 | Close moves each other unit's own line out of the cleared wave into a new wave of that unit, same times, that unit's day pending for its own scheduler; the card says so. Other choice (his): Close greyed while another unit's line stands in its waves after today, the card naming each | y |
| H3 | O1 (Close half) | PARTLY | HIGH | Hawk's medical downchit on Sat 25 Jul is a row on 249's cleared day; "rows from inputs" cleared by today's remove parks the input itself (dormant) for every schedule — at home from Fri 24 he can then be planned on that day with no medical warning | F16's "cleared" never touches an input: lines, waves, programme rows not made from an input, duty desks go; a row made from an input simply follows the man home | n |
| H4 | O5 | TRUE | HIGH | "+ Put people on it" files one DET record for the six; Spur goes home sick on 20 Jul and his end date is changed on the People list (F4's way off) — it changes the one record, so all six DETs end 19 Jul | the door files one DET per man (same window, grouped on the People list); a change there touches only that man; a man already on his own DET over the dates is skipped and named. Other choice: one record with an end date per person (changes every several-people input; not recommended) | y |
| H5 | A1 + O6 (second half) | TRUE | HIGH | Saber (142): 149's published Sat 28 Nov kept 142's full-day line at 6 h; 142 then changes it to 8 h and publishes his afternoon; Q1 pools 7 h into one credit, but F23 kept 6 h on one day and 8 h on the other — the rule does not say which, so it is a full day or a half | one set of full-day values per man per date. **His call:** (A, Astra) the first contributing issue fixes it and a later change needs a home republish showing old and new credit; or (B, Opus) the later of the two issues' kept values decides. Recommended A (nothing moves under an issued day); also state that report lead and debrief measure each line by its own schedule (D2109) while the full-day line is his own squadron's (Q1) | n (y only if B, a line on the Publish card) |
| H6 | O4(a) | PARTLY | HIGH | 142 presses "Take him off ACADEMICS" on 149's published Tuesday: the seat empties only in 149's working plan; the cross-squadron check reads that working plan, so 142 plans Saber on its own 14:30 line with no warning and publishes; if 149 never republishes, two issued schedules hold Saber 14:00–16:00 and Q1 pools both | the cross-squadron people check reads the other squadron's latest issue as well as its working plan ("Saber is still on 149's issued VL 14:00 — it changes when 149 publishes"); the Delete's line reads "His seat is left empty; 149 is told. Until 149 publishes, he stays on its issued VL." | y |
| H7 | AQ2 | TRUE | HIGH | 142 and 149 courses share one syllabus chart (D474); a 142 member deletes a ball and saves — D124 wipes every student's marks on that event, 149's students included, and R10's course ownership does not stop it | a chart edit that removes a ball (or marks) is allowed only to someone with rights over every course using that chart, else refused naming the other squadron's courses; narrows D121 (everyone does everything) for shared charts; D474 stays | n |
| M1 | A2 + O12 | PARTLY (each) | MEDIUM (A: HIGH) | Rune's transfer to 149 is set for 1 Dec; on 1 Dec he is 142's last admin: F13 makes him 149's from 1 Dec, Q7 makes the transfer wait (D306) — his membership, admin rights and OIL settings disagree; when it runs on 3 Dec, does it back-date to 1 Dec? and Q7 gives no cancel after the date | **CLASH** — see K4. Recommended (Opus): refuse at the sheet, and at any later action, what would make him 142's last admin before the date, so a transfer never waits; if one must, only his 142 admin rights wait (as D306 holds only the outcome today), his stints moving on the date. Other choice (Astra): requested date and effective date kept apart, he stays wholly 142's while held, "Transfer to 149 waiting" shown, cancel allowed until it runs | y |
| M2 | O2 (+ OQ5) | TRUE | MEDIUM (O: HIGH) | 249 runs 13–31 Jul; the admin closes it on Mon 3 Aug (the normal case — D2134's bell on the "To"); "their DET ends that day" (F15, D2135) stretches six DETs to 3 Aug, and the card's "back on 149's schedule from Tue 4 Aug" is false — they were home from 1 Aug | Close sets each DET's end to the earlier of its own end and the closing day; card line 1 only for men it shortens, with their dates; moving "To" (or "From") inward asks the mirror of R4's question ("Shorten the 6 people's DET to 28 Jul?", yes by default) | y |
| M3 | O8 | TRUE | MEDIUM | 142's RU and 149's VL both book NORTH 09:00–10:00: nothing warns — the app checks no area or sim double booking even inside one squadron, and areas are typed free text — yet D2108 (and R5) promise areas and sims checked across both | **His call:** (A, recommended) tell him now and file "area and sim clashes" as a build of its own at the database step: one list of areas (with overlaps) and sims per place, picked not typed; (B) narrow D2108 to people only | n (y at its own build) |
| M4 | O10 | PARTLY | MEDIUM | 149's admin types Fri 7 Aug into the shared holiday list (F1): 142's published Fri 7 Aug reads "Became a holiday after publishing — republish for its OIL", and D781 offers 149's admin, at that moment, the OIL answer for 142's men's inputs | every change to the shared list names, before saving, each squadron's published days it turns stale and tells both squadrons' admins; D781's "answer for everyone" at the declaration covers only the declaring admin's own squadron's inputs, the rest going to each squadron's own schedulers (D781 already bells what is left unanswered) | y |
| M5 | O11 | TRUE | MEDIUM | 149 has Viper (142) on its published lines 1–5 Dec; 142's admin deletes, archives or posts him out (not as a transfer): his seats on 149's days empty and 149's days go pending, unlisted on the sheet, and the bell goes only to admins | every Post out outcome, Archive and Delete lists the other squadron's lines and published days after the date before saving ("149 has him on 3 lines, 1–5 Dec") and rings that squadron's schedulers when set and when it runs | y |
| M6 | O7(b) | TRUE | MEDIUM | 249 is 7 h behind; Hawk's travel day ends Sun 24:00 local (Mon 07:00 home); 149 plans him at home Mon 14:00 — 7 h real rest, the app reads 14 h against 12 h and does not warn (R5 follows the man; F12 gave places no clock) | the same hour difference per place as H1; R5's cross-place gaps add it | y (same box as H1) |
| M7 | AQ3 | TRUE | MEDIUM | after Close cleared Sat 25 Jul with AL1, an admin presses Unpublish on that AL1: today an amendment withdrawn hands the day back to the version before it, so the cleared flying and its OIL come back with the detachment still closed | Unpublish is not offered on an amendment Close published (greyed, "Published when Exercise North was closed"), in line with F24; a correction is a new amendment (Q2) | y (the greyed reason) |
| L1 | O13 | PARTLY | LOW | Ranger (142) with the MANAGEMENT or SXO tick transfers to 149: T ends only "admin rights and Scheduler tick in 142"; F21 keeps his marks — so Management and SXO ticks arrive in 149, putting him in 149's Management group | on the date the appointment columns (SCHEDULER, MANAGEMENT, SXO) are cleared on his one record, the change history noting it and 149's admins told | n |
| L2 | AQ4 | TRUE (gap) | LOW | Viper (142) sees, read only, 149's line he is on (F20) — but not the wave's in-time, rally or reporting notes he needs to turn up | F20's view includes the wave's reporting instructions and names the issue; opened from the bell and his row | y |
| L3 | AQ1 | TRUE (gap) | LOW | 149 picks Viper during 142's published ALL AVAIL: F19 says the foreign row is never pending on 142's day, but not whether a change in 142's own ALL AVAIL crowd still raises pending (D44, D45) | F19's "never pending" covers only the foreign row; a change in 142's own issued crowd still reads pending | n |
| L4 | OQ1 | TRUE (gap) | LOW | where Q1's one pooled credit is kept and whose OIL tracker shows its evidence | once per man per date, on his own squadron's tracker, its evidence naming both days | n |
| L5 | OQ2 | TRUE (gap) | LOW | a 149 night line crossing midnight holds a 142 man: does his "VL · 149" row stand on 142's next day too? | one row per day for the part on that day; its Delete takes him off the whole line | n |
| L6 | OQ3 | TRUE (gap) | LOW | does 142's printed day carry the rows 149 has published there (F19)? L says print "shows only what is issued" — 149's row is issued, by 149 | yes, with 149's badge, as issued facts; say so beside the L line | n |
| L7 | OQ7 | TRUE (gap) | LOW | a week of shared flying rings 142's scheduler for each pick, each 149 publish (F19), each F8 and R4 change | one bell line a day a squadron, updated in place | n |
| L8 | OQ8 | ALREADY-FOUND, unanswered | LOW | who signs a detachment's day, and may a man of the other squadron on it sign? | its squadron's people with the SCHEDULER tick on it that day; never the other squadron's | n |
| L9 | O9 = K1 | PARTLY (clash TRUE, example wrong) | LOW | Saber's Tuesday holds a 149 sim at 08:00 and a 142 line at 14:00 after 142's 21:00 Monday: D2123 says the later line's schedule (149's 10 h) judges the gap; R8 says the stricter (142's 12 h) | name the clash to him in one line; by D90 R8 (the later ruling) stands and D2123 is narrowed for a day flown on both | n |
| L10 | O14 = K2 | TRUE | LOW | R7 makes a place move count from the next day; D2119 says the moment it is saved; round 4's card "Once saved, 142 and 149 can plan each other's people" is then false until midnight | name D2119 as narrowed by R7; the card reads "From tomorrow, …" | y (card words) |
| L11 | O15 = K3 | TRUE | LOW | Q5's "View only" removes D2094's "or as a scheduler" grant without naming D2094 | name D2094 as narrowed by Q5 in the record (D201) | n |
| L12 | checker, from A1/O6 = K5 | TRUE | LOW | Q1 takes the full-day line from his own squadron's settings; D2109 says a line is judged by the settings of the schedule it sits in — Q1 narrows D2109 for OIL without naming it | name D2109 as narrowed by Q1 (the full-day line); report lead and debrief still by the line's schedule | n |

## Clashes

Two of his rulings (or round 6 recommendations, now rulings) against each other. By D90 the later wins; by D201 each
must be named and the older one's text fixed.

| K | side 1 | side 2 | real? | recommended |
|---|---|---|---|---|
| K1 (L9) | **D2123** — "the crew rest of the later line's schedule judges the gap between them" (he chose it over "the stricter") | **R8** (D2160) — "if he flies on both that day, the stricter" | Yes, for a day after the gap flown on both squadrons (Opus's own worked case does not show it: his Tuesday is 142-only, where both give 142's) | R8 stands as the later ruling; tell him plainly it reverses his "Later line's" for that one case; narrow D2123's row |
| K2 (L10) | **D2119** — a new place takes effect "the moment a master admin saves it" | **R7** (D2160) — "a move counts from the next day's start" | Yes | R7 stands; narrow D2119; redraw round 4's card words |
| K3 (L11) | **D2094** — access to another squadron "to view or as a scheduler" | **Q5** (D2160) — access to the other squadron is "View" only | Yes | Q5 stands; narrow D2094 (Q5 named only D785) |
| K4 (M1) | **F13** (D2160) — whose man he is is read from his stints, "142 to 30 Nov, 149 from 1 Dec" | **Q7** (D2160) with **D2147** (5) and **D306** — the refusals "checked again on the date, the transfer waiting until the reason goes" | Yes | M1's fix; whichever he picks, one of the two is narrowed in words |
| K5 (L12) | **D2109** — "a line is judged by the Logic settings of the schedule it sits in, whoever flies it" | **Q1** (D2160) — "whether the day earns, and the full-day line, come from his own squadron's settings" | Yes, for the full-day line | Q1 stands for OIL; narrow D2109 |
| K6 (O4(b)) | **D45** — "things shouldn't change silently without the scheduler acknowledging it" (under D2107) | **F19** (D2160) — 149's row "never pending on 142's day" | **Not real**: 149's row is 149's issued fact with 149's badge, never in 142's issued record or signatures, so 142's own published record does not change; 142 is rung each time (F19), and a clash shows as a warning on both days (D2108). F19 already names that it changes D2107 | no change |
| K7 (O12 second half) | **Q7**'s refusal "a DET onto a 142 detachment across the date" | **L1** (D2160) — a DET may name either squadron's open detachments | **Not a contradiction**: a refusal stricter than L1 is coherent; it is only unneeded, since after the date he would be a 149 man on a 142 detachment, which L1 allows | his call, small: drop the refusal (Opus) or keep it; recommended drop, so the transfer has one fewer reason to wait (M1) |

## Evidence per finding

**H1 (A3 + O7(a)) — TRUE.** Round 6 page, F12 (now his ruling): "every date turn (Close, a planned end, a posting,
the late mark) goes by home's date; a detachment's schedule is typed in its local times, shown as typed". F16: "every
row of the day goes … Days after today". F15 protects only "the closing day". F12's own example and Fable's earlier
finding 12 both took a detachment **behind** home; a detachment ahead is new. Fable's finding 12 kept "a place carries
its offset from home" for crew rest; the page's F12 dropped it ("Other choice: a clock per place for everything; much
more to build") — so this shows the ruled F12 is itself wrong for a detachment ahead of home. No code claim (design).
Astra's offer (keep every local day begun, retained dates saved with the closure) and Opus's (one number per place,
used for a unit's own date turns; postings and the late mark stay on home's date) are one fix at two depths; the
merged fix takes Opus's storage and Astra's card.

**H2 (O3) — PARTLY.** True: F16 clears "lines, waves …"; F17 names the case and answers only "Sat 25 Jul holds a line
of 242's: its schedulers are told"; Q1 works OIL from the latest published days, so 242's men's Saturday goes. This
shows F17's answer (which met Fable's earlier finding 17) is itself wrong for a unit still flying. Wrong part: the
cause "against D2114/D2149" — D2149's full row: "a line concerns both squadrons only when it is one squadron's own
line inside the other's wave", and such a line "may be changed by either squadron's scheduler" (D2114), so 249 may
change 242's line; the harm is the deletion of a unit's flying and its OIL, not a breach of who may edit.

**H3 (O1) — PARTLY.** Code, `src/engine/slots.ts` `unacceptInput`: "read-only quarantine — global filing write" and
`inp.acc='r'` written on the input itself; `src/engine/inputs.ts` `inputDormant` — "acc==='r'", described as "the ONE
body that blanks it out of the engine". So a removed input row parks the input for every schedule — TRUE. The Close
half survives: F16 lists "rows from inputs" among what goes. The Reject half (149's scheduler Rejecting a 142 man's
Training) is **already answered**: round 6's L item "The other squadron's scheduler sees when a man is unavailable,
not why" (so no Accept or Reject there), D2114/D2149 ("everything else in a schedule is changed only by its own
squadron's scheduler"), and F4 for a DET at home. Weight kept HIGH: Close would change each man's own records on every
schedule, a medical or leave input included.

**H4 (O5) — TRUE.** Code, `src/engine/inputs.ts` `peopleOf`: `r.people` or `[{p,by,at,mod}]` — an entry holds the
person, who filed, when, and "his own late date"; no dates of his own. D756: "An input is stored as one record with
the list of its people". D2131 (narrowed by D2146): the door "files one … input for them all". Earlier, Astra said
only that a transfer must not move everyone in a group input (her §D2136); the early return through the People list
is new. Opus's side point (a man's own DET over the dates meets L's "two DETs over the same days: refused") is in the
fix (skip and name him).

**H5 (A1 + O6) — TRUE; O6's first half ALREADY-ON-PAGE.** Code, `src/leavewar/sync.ts` `desiredOilCells`: "iso -> the
issued block that date's work was read from. One date comes from exactly one version … the full-day line its
envelopes face is THAT version's own". `src/engine/oilev.ts` measures with `rv: oilKeptVals(ev)`;
`src/engine/publish.ts` checks `oilValsSame(was,n)` ("the four kept values (D2044 …)"); `src/engine/oil.ts`
`OilRuleVals`, `oilRuleValsNow` — all as both readers say. Q1 pools one span; F23 keeps values per published day —
two issued days can keep two values of the same 142 setting, and nothing picks one. Opus's first half ("no published
day of Sat 25 kept 142's line") is answered by F23 itself, whose example has 142's day keep 149's value for 149's man
("a published day keeps the values it went out with for every man on it"). Not in the earlier reports (Fable 1
settled whose settings, not which kept copy).

**H6 (O4(a)) — PARTLY.** True: D2149 — "on a day the other squadron has published, the change waits for it to
publish"; the design note (chat 98's Q3 knock-on): "the people check across both squadrons (D2108) reads 149's latest
working plan". Partly answered: F19 says "A change 149 has not published shows faint beside it, so the row and the
clash check always agree" — it points at the fix but never says the check reads the issue too, and the Delete's words
("His seat is left empty; 149 is told.") never say he stays on 149's issued line meanwhile. F8 rings 149 for a line
change, not for a take-off.

**H7 (AQ2) — TRUE.** D474: "an edit to it reaches every course and every student on it — never a copy per course";
D124: "Deleting a ball wipes its marks. Every student's grade, failures and dates on that event go with it"; D121
(narrowed by D1014): "In the Tracker a member can do everything an admin can". Code, `src/tracker/app/core.js`
`addModule`: "Press ✓ Save changes first (its marks are removed then)". Earlier Opus finding 14 gave courses a
squadron (now R10); the shared chart was not covered. Weight HIGH: another squadron's students' marks lost.

**M1 (A2 + O12) — PARTLY each.** Code, `src/leavewar/sync.ts` `poHeldReason` ("A posting that cannot be carried out
WHOLE does nothing at all") and `runPoOutcomes` (`if (held) { tellOnce(d.key, held); continue }`), while
`postingPendingTag` reads the record's own `w.to` — today the stint's dates are fixed when set and only the outcome
waits. So Opus is right that "as D306 does" today means dates fixed, outcome held; Astra's "D306's 'waits, whole'
keeps him wholly in 142" is not how D306 is built (its "whole" is the outcome, not the Leave War stint). Both are right
that F13 and Q7's wait disagree (K4), and Astra is right that Q7's "After it, no undo" leaves a held transfer with no
cancel. Opus's "contradicts L1" is wrong (K7). Weight MEDIUM: rare (last admin), and the outcome is a disagreement of
rights and settings rather than a wrong published record.

**M2 (O2) — TRUE.** F15: "their DET ends that day, and they are on 149's home schedule from the next day"; D2135:
"closing ends its people's DET that day"; D2134: "A detachment's 'To' date is its planned end, never a close by
itself: that day the bell reminds its admins". R4 covers only "Extend …". D2146 reading (3): DET "refused outside the
detachment's open dates". The rule as written lengthens a DET when Close comes after its end. Weight MEDIUM: a careful
builder may take "the earlier", but the card's line is false either way.

**M3 (O8) — TRUE.** Code, `src/engine/validate.ts` `WCODE` — people, quals, briefs, crew rest, OIL; no area, sim or jet
double booking (no area check anywhere in the validator); `src/engine/data.ts` seeds `area:'NORTH+EAST'` as text.
D2108: "At home people, areas and sims are checked across both squadrons". Searched the backlog and rulings: no
filed build for area or sim clashes. Not in the earlier reports (Astra's earlier table assumed the check exists).

**M4 (O10) — PARTLY.** Code, `src/engine/validate.ts`: `OIL_STALE_DAY: 'Became a holiday after publishing — republish
for its OIL'`. True that 149's admin's entry turns 142's published days stale. Wrong part: "142 learns of it only
from its own day" — D781 already sends "only what is left unanswered … to the schedulers and to whoever answers for
each input" (notifications register B10). The real gap is D781's "the admin declaring it is offered the answer for
everyone": on a shared list that is another squadron's admin answering 142's men's OIL questions.

**M5 (O11) — TRUE.** Code, `src/state/person-delete.ts` header, step 3: "takes him off every day ON OR AFTER THE
CUTOFF: the week on screen (its seats, landed rows, sign-offs …)". D297 (published days "read pending"), D321 (7)
(archive makes published days "read '1 pending'"), D1547 (the bell to "each admin"). Q7 lists the other schedule only
for Transfer. Not in the earlier reports.

**M6 (O7(b)) — TRUE.** Code, `src/engine/validate.ts`: `const earliest=pe+VCONF.crewRest-1440; // minutes into TODAY
that crew rest expires` — one clock for both days. R5: crew rest "follow[s] the man across places". F12 gave a place
no clock. Fable's earlier finding 12 kept the offset for exactly this; the page dropped it.

**M7 (AQ3) — TRUE.** Code, `src/engine/publish.ts` `unpublishBackTo`: "an amendment withdrawn hands the day back to
the version before it (priorVerId, exactly as unpublishDay does)"; `unpublishDay` retires the latest version. F24
covers Undo, Q2 covers a correcting amendment; neither names Unpublish.

**L1 (O13) — PARTLY.** Code, `src/engine/people.ts` `isScheduler`: `p.quals.sched` — one mark on his record;
`src/engine/qualcols.ts` `SCHED_KEY = 'sched'`, `MGMT_KEY = 'mgmt'`; `src/engine/publish.ts` `signRoleOk`:
`if(rr&&rr[2]&&!isScheduler(who))return false`. Wrong part: the Scheduler tick — T already says "His admin rights and
Scheduler tick in 142 end on the date", so it does not "arrive ticked" if T is built. Survives for MANAGEMENT (D1502)
and SXO, which T does not name and F21 keeps.

**L2–L8 — questions, unanswered on the page** (searched the rulings, the page's L list and the earlier reports).
L3: F16's example states the crowd is "fixed when the day is published"; D45 makes a later availability change read
pending. L6: L's "Print and export show only what is issued". L8 was asked by the earlier Opus reader ("Its signers are
its squadron's admins on it") and never put on the page.

**L9 (O9) — PARTLY.** Code, `src/engine/validate.ts`: "EACH DAY'S OWN CHECKS UNDER THE LOGIC SETTINGS IT IS JUDGED BY
(owner D2005 …) a published Tuesday's crew rest is measured with Tuesday's crew rest". The clash is real (K1) but only
when the day after the gap is flown on both squadrons; Opus's case (Tuesday 142-only) gives 142's settings under both
rulings. Weight LOW: R8 is stricter, so no check misses; the issue is recording a reversal of his explicit choice.

**L10 (O14), L11 (O15), L12 — TRUE.** D2119's row: "takes effect the moment a master admin saves it … with no 'From'
date". Round 4 item 8's card line as quoted. D2094's row: "to view or as a scheduler". D2109's row: "A line is judged
by the Logic settings of the schedule it sits in, whoever flies it." Round 6's Q5 names only D785; Q1 names no ruling.

## Dropped, and already answered

| from | verdict | reason |
|---|---|---|
| O4(b) | ALREADY-RULED (F19, D2160) | "pending on the day whose publish made the clash" re-opens F19, which he has just ruled; the clash itself already shows on both days (D2108); the D45 argument is not a real clash (K6) |
| O1, the Reject half | ALREADY-ON-PAGE | round 6's L item (the other squadron sees when, not why), D2114/D2149, F4; the Close half survives as H3 |
| O6, the first half | ALREADY-ON-PAGE (F23) | F23 keeps, on each published day, the values for every man on it, the other squadron's included; the second half survives in H5 |
| O12, "contradicts L1" | WRONG | a stricter refusal is not a contradiction (K7); the rest survives in M1 |
| OQ4 (a member's own DET only onto his own squadron's detachment) | ALREADY-RULED (L1, D2160) | L1 lets a DET name either squadron's open detachments; Opus's answer goes against it |
| OQ5 (moving "From" later) | merged | into M2 |
| OQ6 (a man on a group DET transferred or deleted) | merged | into H4 — one DET a man answers it |
| OQ9 (Close and someone editing a cleared day) | ALREADY-ON-PAGE (F17, D1751) | F17's card names "Jolt is editing Sun 26 Jul"; there is no lock to re-check (D1751) |
| OQ10 (past OIL answers after a transfer) | ALREADY-FOUND (Fable report §3) | "OIL from a past 142 day that 142 later amends — still moves … but 149's admins are told" |

D56: nothing here lives only in stored demo data.

Rulings: none recorded — a read-only check.
