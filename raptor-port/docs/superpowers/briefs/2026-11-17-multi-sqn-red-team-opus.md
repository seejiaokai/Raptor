# Red team of the squadrons and detachments design — second seat (fresh, blind Opus reader)

Read: the design note whole; D2087–D2138 full rows; D281, D282, D288, D289, D290, D294, D296, D303, D1100, D1101,
D1373, D1374, D1695, D1971, D27, D37, D592, D2005, D2013, D2044; engine-rules (validation, crew rest, availability,
input types, DAYS_RUN, late mark, OIL and "which published version pays"); data-model §Squadrons, §9 (the day lock) and
§11; the Leave War and Tracker rulings and seams; rounds 3–4 pages; and, to check how a rule works today,
`engine/inputs.ts` (`restsInput`, `oilAsks`, `landsUnavail`), `leavewar/sync.ts` (`desiredOilCells`) and the Tracker's
people bridge. Findings in order, HIGH first.

---

## HIGH

### 1. The "Attach · 149" row is never defined as a thing — and the Attach input it copies earns OIL, can be deleted by the man, and counts him out
**Failure.** Saturday 18 Jul. 149 picks Viper (142) for its 14:00 sortie. Under D2098 Viper's home schedule gets
"Attach · 149" "as the Attach input does today". If it is built as an Attach input:
- an Attach on a weekend asks the OIL question (`oilAsks` = `restsInput`, which includes Attach): Viper's bell lights
  "does this deserve HO/FO?"; he answers Yes, and the credit pass pools an input claim beside 149's own published line —
  or, unanswered, his bell stays lit for good (`oilPendingFor`);
- Viper is a member and edits or deletes his own inputs: he deletes "Attach · 149" — 142's schedule shows him free at
  14:00 while 149's line still holds him; or he changes its times and 142's day reads whatever he typed;
- it wears LATE when the pick is inside 14 days (the late mark reads any input changed after its deadline);
- an Attach with a missing end is "away all day" (`awayAllDay` fails closed), so a line with no landing typed strikes
  him out of 142's whole day — D1695's half-day split breaks;
- it counts him out on the Leave War (D1357, D1374) — finding 10.

If instead it is a worked-out row, every rule that reads `INPUTS` (the ALL AVAIL crowd's commitment drop, crew rest's
`restsInput` side, the bell's OIL scan) misses it unless each is told.

**Cause.** D2098 says "as the Attach input does today" and "made by itself from 149's plan, changed only by it" — two
different things. Nothing says which.

**Fix.** State it in the note and to him:
1. The row is worked out on read from the other squadron's plan (data-model §9 rule 9 already works out a request's row
   this way); it is never an `Input` record, so nobody can edit or delete it, it never asks or earns OIL, never wears
   LATE, never has an all-day fallback.
2. One row per commitment, its words "Attach · 149 14:00–16:30" (report to debrief); availability and the checks read
   149's own line through "the checks follow the man" (D2092), never the row's times.
3. A line crossing midnight gives the next day its own row (as an input's `nx` copy does).
4. Leave War: finding 10.

**Weight.** HIGH — wrong OIL, and a member changing what only the other squadron's plan may change.

### 2. 142's published record can carry 149's unpublished draft (D2107 with D2098)
**Failure.** 142 has published Tuesday. Monday evening 149's scheduler, drafting, picks Viper for 14:00–16:00. D2107:
142's Tuesday reads "1 pending", its four sign-offs fall. 142's chain signs and issues AL1 with "Attach · 149
14:00–16:00". At 21:00 149 drops Viper from its draft, and 149 publishes Tuesday without him. 142's issued AL1 now
records an attachment that never went out. 142's day goes pending again, and its four sign-offs fall again. Each tweak in
149's draft knocks down 142's four signatures. The pick does the same in reverse, 142 to 149.

**Cause.** D2107 and D2098 work the row out from the other squadron's working copy, with no rule for which copy counts.
D2124/D2129 settled this for a shared wave ("Not yet published by 149"), but not for a pick.

**Fix — his choice:**
- **(A, recommended)** On a published home day the Attach row and its pending mark follow the other squadron's latest
  *published* version. 149's draft shows on 142's working copy as a dotted, unsigned row: "Attach · 149 (not yet
  published by 149)". It never counts as pending and never drops the sign-offs. When 149 publishes, it becomes a
  pending change on 142's day, as D2107 says. The checks still read 149's working copy, so a clash shows at once.
  This narrows D2107: the pick arrives when 149 publishes, not when it is made.
- **(B)** Keep D2107 as ruled, but refuse 142's publish while an Attach row comes from a day 149 has not published.
  It names the line: "Viper's 149 line is not published yet."

**Weight.** HIGH — a wrong published record, and sign-offs falling without any change of the home squadron's own.

### 3. A free pick unlocks the other squadron's whole line (D2114's reading against D2098)
**Failure.** VL is 149's own formation in 149's wave. 142's scheduler picks nothing on it. Under D2114 VL is "149 only"
(round 4's table, item 4). 149 then picks Saber (142) into VL's back seat. By D2114's reading ("a line concerns both
when it … holds men of both"), 142's scheduler may now change VL's mission, area, times and 149's own crew. 142 can do
the same on purpose: D2091 lets either squadron pick freely, so 142 drops one of its men into any 149 line and gains
edit rights to it. Round 4 drew this both ways on one page. Item 4's table says VL is "149 only". Item 7 says "either
scheduler changes 149's VL, since it holds a 142 man", and draws VL whole on 142's schedule. D2098(a) says the event is
not shown at home at all: only the Attach row, a tap opening 149's schedule read only.

**Cause.** The agent's reading on D2114 (and D2123's reading built on it) contradicts D2098(a): "the line is 149's
alone … changed only by it". Round 4 item 7 contradicts D2098 and round 4's own table.

**Fix.**
1. Put to him: "concerns both" means one squadron's own line inside the other's wave. Nothing else qualifies.
2. A line that holds a borrowed man stays its own squadron's alone (D2098(a)). The home squadron fixes a clash on its own
   lines, or by phone. It can also take its man off the other's line, which is only taking back its own man, D2091's pick
   in reverse — owner's choice whether to allow it.
3. Correct round 4 item 7 to D2098: VL does not show whole on 142's schedule; Saber's Attach row does, and the dotted
   crew-rest ring sits on that row.

**Weight.** HIGH — someone editing what he must not.

### 4. "Access as a scheduler" to the other squadron makes a man its full admin — and §11 has no squadron at all
**Failure.** D2094: an admin gives Hawk (142) access to 149 "as a scheduler". In this app a scheduler is always an admin
(D785), and §11 has two working roles, admin and member. So Hawk is now 149's admin. He can:
- change 149's crew rest on 149's Logic (D2122 "each squadron's admin");
- approve or refuse 149's leave;
- make and close 149's detachments (D2093 "a squadron's own admins");
- archive, delete or rename 149's people on Admin → Users;
- tick 149's quals and file inputs for 149's men through D2131's door.

The other way round: §11 gives an admin C R U D on every `Person` and `QualMark`. Nothing stops a 149 admin archiving a
142 man or ticking his quals, though D281/D282 keep those with his own squadron. D2132 says these pages "stay on his own
squadron", but only for the screens; the write path has no squadron.

**Cause.** D2094 ("as a scheduler") against D785 and §11; the note's "the app enforces the limits" names no table.

**Fix.**
1. Write §11's squadron dimension before any more drawing. Every admin right holds only over the squadron(s) where the
   person is admin.
2. Make the grant D2094 names a separate one. Scheduler of 149 means: edit 149's schedule pages and lines (D2114's
   reach), and nothing else. No Logic, Leave War, Users, Quals, Squadrons or Inputs for 149's people.
3. Admin of 149 is a second grant, given only by a master admin or 149's own admins.
4. This narrows D785 (a scheduler is always an admin) for the other squadron — his word.
5. Add it to `perms.ts`'s table with the security read D1411 requires.

**Weight.** HIGH — editing what he must not, across squadrons.

### 5. OIL on a day worked for both squadrons: double or lost, and judged by whose rules?
**Failure.** Saturday, a non-working day.
- (a) Viper sits 142's Ops desk 08:00–10:00. Then he flies a 149 sim 10:30–12:00. Today the credit pools a man's spans
  for a date into one envelope (`desiredOilCells`: person|date → spans). 08:00–12:00 is 4 hours, so HO 0.5. If each
  squadron's published day is worked out on its own, he gets HO from each, 0.5 + 0.5 = 1.0: paid twice. If each pass
  writes the one Leave War cell for the date, the last pass wins and the other's credit is lost.
- (b) Today "one date comes from exactly one version" and the full-day line is that version's kept value (D592,
  D2044). Here two published versions hold the date, kept under 142's and 149's Logic. Which "Full day of OIL" judges
  the joined envelope is undefined.
- (c) Off days are a squadron's own (they come in by file, per war). 149's off day is a working day for 142. Viper
  flying 149's line that day: 149's frozen evidence says the day earns, his own squadron says it does not.
- (d) The per-person OIL Earn switch on 149's day sits with 149's scheduler. 149 decides 142's man's banked leave, and
  142's admin cannot.

**Cause.** The note says only "OIL … arrives when 149 publishes" (round 3, the agent's reading). D2109 judges lines, but
OIL is a judgment of the man's whole day. D2097's "never earns OIL twice" covers ALL AVAIL only, and is still a lean.

**Fix.** One rule:
1. A man's spans for a date are pooled from every published version that holds him, at any squadron. One envelope, one
   credit, one cell.
2. Whether the date earns follows his own squadron's calendar — the squadron whose leave he banks.
3. The full-day line is his own squadron's: as kept on its published day of that date, otherwise today's.
4. Each span keeps its own schedule's kept leads.
5. A change in the other squadron's version reaches his credit only through that squadron's publish (as now).
6. The OIL Earn switch for a borrowed man: owner's choice. Recommended: the line's scheduler sets it, and the man's home
   admins see it on the Leave War's OIL tab.

**Weight.** HIGH — wrong OIL.

### 6. A detachment's overseas duty asks OIL — one answer for six men for three weeks of weekends
**Failure.** 149's admin uses "+ Put people on it" (D2131) for six men, 13–31 Jul. An overseas duty is in `oilAsks`.
It covers four weekend days and one shared input carries one answer (D762: "one answer for everyone in an input", given
by the filer or an admin). The admin answers Yes / FO once, and all six bank FO on every weekend day, whatever 249's own
published schedule says. A man stood down that Sunday still earns. A man who flew 249's Saturday earns from both, and
the all-day input fills his envelope to a full day.

**Cause.** D2101/D2131 put a detachment's people on it through an overseas duty, which asks OIL as a staff trip does.
Now the detachment has its own published schedule, the stronger evidence ("only the issued schedule pays").

**Fix.**
1. An overseas duty naming a detachment never asks OIL. The detachment's published schedule pays, as the home schedule
   does.
2. "None" (a staff trip, D2101) keeps asking, as today.
3. Pin it in `oilAsks`'s rule beside the detachment choice.

**Weight.** HIGH — wrong OIL, for many men at once.

### 7. Closing a detachment early leaves its published future days paying, and nobody may amend them
**Failure.** 249 runs 13–31 Jul. Its scheduler has published Sat 25 and Sun 26 with six men flying. On Thu 23 the
exercise ends and the admin presses "Close detachment" (D2103). Its people's overseas duty ends that day (D2135) and
its schedules become read only under "Past detachments". 25 and 26 are still published, and the latest published
version pays (D142). All six earn weekend OIL for days they spent at home, and the days are read only, so no amendment
can take it back. The same lock blocks every later correction of a past detachment day (a wrong man, wrong times), which
today is the only way to change OIL already paid.

**Cause.** D2103 (always read only), D2135 (early close) and D142 (no lock, no clock).

**Fix.**
1. "Close detachment" first lists the detachment's published days after the close date.
2. Closing withdraws them in the same step: each becomes an amendment taking every man off, signed as amendments are,
   or the button waits until they are withdrawn — owner's choice; recommended: closing makes the amendments and drops
   their sign-offs, so they show pending to its signers.
3. "Read only" means closed to new planning. A past detachment day can still take an amendment from its squadron's
   admins, so its OIL can be corrected.

**Weight.** HIGH — wrong OIL that cannot be fixed.

### 8. The one-place rule is checked only at the moment of planning; five later events reach "a man at two places"
**Failure.** D2092 makes the app *refuse to plan* a man where he is not. These reach the forbidden state anyway:
1. Hawk (149) is on 149's published Wednesday. On Monday he files his own overseas duty naming 249 from Wednesday — a
   member may, as the backup (D2120), and it "takes effect at once" (D2101). He is now on 249's manpower and still on
   149's line.
2. He deletes that duty after 249 has planned him: still on 249's published line, now at home.
3. 149's place moves at once (D2119) while 142 men stand on 149's future lines.
4. A detachment closes early (D2135) — finding 7.
5. A transfer (D2136) to a squadron at another place.

A sixth: he files two overseas duties overlapping, one naming 249 and one naming a 142 detachment. He is at two places
by the inputs themselves.

**Cause.** D2092's refusal guards only the plan; inputs always go in (owner, 10 Aug 26), and the note gives no check
after the fact.

**Fix.**
1. A hard warning on every line that holds a man not at the line's place on that day, on both schedules. On a published
   day it reads as a pending change, as a late input does.
2. Refuse at save two overseas duties that overlap and name different detachments, or one naming a detachment over
   another naming "None".
3. The place move (D2119), "Close detachment" and the transfer each list, before the save, the lines that would break.

**Weight.** HIGH — a man planned at two places, on published records.

---

## MEDIUM

### 9. Crew rest and days in a row are never checked across the move to and from a detachment
**Failure.** Saber flies 149's night wave on Sunday, his day ending 23:30. His overseas duty naming 249 starts Monday,
and 249 plans him at 06:00 Monday — 6h30 of rest. 249 is at another place, and D2092 says units at different places
"never are" checked against each other. So neither schedule warns. The same for a run of days: six days at home then
days 7 and 8 on 249, and the break day never flags. Coming home after the close is the same.

**Cause.** D2092 (and D2088 "no conflicts flagged across") is about two units sharing a man on one day. The note
applies it to the man's own days too.

**Fix.**
1. "Never checked against each other" covers what two units at different places cannot both have: double booking,
   areas, sims.
2. The checks about the man across days — crew rest, the break day (`DAYS_RUN`), the long day, medical — read his last
   day at one place and his first at the next. The ring and warning show on both schedules.
3. Add the time zone question below.

**Weight.** MEDIUM — a safety check that misses.

### 10. Whether the Attach row counts him out on the Leave War contradicts a standing ruling
**Failure.** 149 picks Viper for 2 hours of academics on a Tuesday. Built "as the Attach input does today" (D2098),
D1357/D1374 count any commitment under Unavailable out by 0.5. 142's Available P row goes red and raises the manning
bubble on someone's leave bid, though Viper is at work at home. The note's recommendation, "not counted", was never
ruled (D2098's row), and it contradicts D1374 ("any commitment under the schedule's Unavailable list counts him out").

**Cause.** D2098 against D1357/D1374.

**Fix.** Put to him with a picture. Recommended: the Attach row from the other squadron's plan never counts on the Leave
War, narrowing D1374 for that row alone. A filed Attach (another squadron outside the app, an exercise) still counts.
If he wants a whole-day borrow counted, then only a commitment covering his whole working day counts — his call.

**Weight.** MEDIUM — wrong manning figures driving leave decisions.

### 11. D2123's "later line's schedule" does not match how crew rest is worked out, and the other per-man rules have no owner
**Failure.**
- (a) Crew rest anchors on the man's first commitment of the fly-day, of any kind, filed inputs included, and exists
  only if he flies that day. Monday: Saber's 149 night wave ends 23:00. Tuesday: 142's 07:00 meeting (a ground row),
  then a 149 sortie at 10:00. The meeting is the anchor and is 142's; the flying that makes the rule exist is 149's.
  The "later line" is ambiguous, and with a filed Meeting there is no schedule at all.
- (b) The break day after `maxRun` days, the long-day note, Insights' work hours (D482 today's Logic) and the full-day
  OIL line (finding 5) are worked out per man per day across both schedules, and D2109 only speaks of lines.

**Cause.** D2109, D2122, D2123 settle lines; the rules are about a man's day.

**Fix.**
1. Crew rest before a day: the settings of the schedule holding his first flying line that day — the line that makes
   the rule exist (D2123's worked case is unchanged).
2. Rules about the man's day or run (break day, long day, Insights hours): his own squadron's settings.
3. Put both to him as one question, with this case.

**Weight.** MEDIUM — a check judged by the wrong number.

### 12. The day lock is per day; cross-squadron edits need the other squadron's whole day
**Failure.** 149's scheduler Ranger is editing Tuesday (the lock mark, D355/D1751). 142's scheduler moves RU (142's line
in 149's wave, D2114). The change writes 149's day row (nothing but the holder writes a day — §9 rule 9), so it is
refused, "Ranger is editing Tuesday". Or 142's admin presses "Take over" (any admin may, §9 rule 7) and holds 149's whole
Tuesday, which also refuses 149's publish ("A day someone else holds cannot be published"). The round 3 page noted only
that the mark "must also cover a wave both squadrons fly in".

**Cause.** D2114 and D2089 against D355, D356, D451, D454 and D1751; the note's only concurrency line is the row-version
trial.

**Fix.**
1. A change to one's own line in the other's wave takes that day's mark as D451 does for a second day: refused, naming
   the holder, if held.
2. "Take over" reaches only one's own squadron's days.
3. The 149 holder sees "142 is waiting to change RU" (a request, no take-over).
4. A pick writes only the picking squadron's day; the home row is worked out on read (finding 1), so it needs no home
   lock.
5. Write this into §9 before the row-version trial.

**Weight.** MEDIUM — a blocked flow, or a whole day handed to the wrong squadron.

### 13. A man who is both "another squadron's" and "SANS" — two models for one man
**Failure.** Talc, a 149 pilot, flies with 142 every week. Today the only way is to keep him on 142's roster as SANS,
filing SANS Availability. Once 149 is in the app he is a 149 man borrowed freely (D2091). Callsigns are unique in the
community (D288), so he cannot be both a 142 SANS row and a 149 person. Post out's SANS chip ("another workplace but still
flying with us", D229) and "Transfer to Sqn" (D2136) both fit a 142 man moving to 149 and still flying with 142. The
ALL AVAIL crowd takes a SANS man "only when planned with us", but a borrowed man by his primary squadron (D2097's
recommendation).

**Cause.** SANS (D229, D1215) predates D2091; the note never places it.

**Fix.**
1. SANS stays for people outside the app's squadrons (a staff post, headquarters). A man of a squadron in the app is
   planned only by borrowing.
2. Post out refuses the SANS chip when he goes to one of the app's squadrons, pointing to "Transfer to Sqn".
3. The SANS calendar's need counts the other squadron's free people? — question below.

**Weight.** MEDIUM — the same man in two shapes, his callsign refused.

### 14. The Tracker has no squadron; D2132 keeps it on "his own squadron"
**Failure.** Courses and enrolments carry no squadron, and everyone does everything there (D121). Once both squadrons
are in one database, a 149 member opening the Tracker sees and marks 142's students, or, if the Tracker is cut to his
own squadron as D2132 says, nothing tells it which courses are whose. A transferred student (D2136) mid-course vanishes
from one side or stays where he no longer belongs. The agent's reading told to him in round 3 — "a sortie flown on
149's schedule counts on the student's own Tracker" — describes nothing that happens today: marks are typed by hand,
and the Tracker reads no schedule (its bridge carries only people and medical days).

**Cause.** D2132 against D121 and the Tracker's architecture; the round 3 reading.

**Fix.**
1. Each course carries its squadron.
2. D121's "everyone does everything" holds within one's own squadron's courses.
3. A student is enrolled where his course is (D2136 section).
4. Correct the round 3 reading to him: no sortie reaches the Tracker by itself today; whether it should is the Tracker
   expansion's question (D2086).

**Weight.** MEDIUM — training records editable across squadrons, and a reading given to him that is not true.

### 15. A place moved "at once" with no history re-judges past published days
**Failure.** Wednesday 10:00, a master admin moves 149 to "Exercise East" (D2119: no From). Last Monday 142's RU flew in
149's published wave with 142 men. Read now, that day holds 142 men at a place they were not at: past days show the new
"not at this place" warning (finding 8), and the cross-squadron checks on them vanish. A published record's checks change
with no amendment.

**Cause.** D2119 removed "From"; the note keeps no record of the old place.

**Fix.**
1. Keep D2119's "at once" on screen, and store each place with the moment it was saved.
2. Every day before that moment reads the place in force then.
3. The save card lists the lines from today on that the move breaks (finding 8).

**Weight.** MEDIUM.

### 16. An overseas duty's dates and its detachment's dates are never tied together
**Failure.** Hawk files an overseas duty naming 249 for 1–25 Jul. 249 is open 5–31 Jul. On 1–4 Jul he is "on 249" with
no 249 schedule, and gone from home. After 249's "To" (D2134: a planned end, never a close), men whose duty ended at the
old "To" are home while 249 is still open; men whose duty runs on stay.

**Cause.** D2101 ("a man with one naming a detachment is on that detachment's manpower for its dates" — whose dates?)
and D2134.

**Fix.**
1. An overseas duty naming a detachment is refused outside the detachment's open dates; D2131's door sets them.
2. Moving the detachment's "To" offers to move every man's duty that ended on the old one.
3. He is at the detachment's place only on days both are open.

**Weight.** MEDIUM.

---

## Questions the design never answers (each with the recommended answer)

- **The time zone of an overseas detachment.** Times stay local to each schedule. The checks across the move (finding 9)
  add the detachment's hour difference, and Admin → Squadrons asks it with the place.
- **A detachment at the same place as its own squadron.** Refuse it: a detachment's place must differ from its squadron's,
  or its "overseas duty" men would be both away and borrowable at home.
- **Which detachments a man's overseas duty may name.** Only his own squadron's. A 142 man joins 149's detachment only
  through 149's admins' door, his own admins told.
- **Does a detachment have its own Logic and its own signers?** Its own Logic, copied from its squadron's when it is
  made. Its signers are its squadron's admins on it.
- **Who may see a detachment's schedule?** Its own people, while on it, and its squadron's admins; others by grant
  (D2094).
- **Does a borrowed man's 142 line in 149's wave count toward 142's flying plan figures (D617) and 142's jets check
  (D2108)?** Yes, both, being 142's line and jets.
- **ALL AVAIL across squadrons (D2097's recommendation is still a lean).** Put it to him: each squadron's ALL AVAIL counts
  its own people only, and a man busy on the other's schedule is out of his own squadron's crowd.
- **The SANS calendar's need when the other squadron has free people.** Unchanged — its need counts own people only.
  Borrowing is a scheduler's choice, not supply.
- **Undo of "Close detachment" and of a place move.** Neither is an Undo step (like a posting, D350). Re-opening a
  detachment is its own button, for its admins, while its "To" is not past.
- **A bell line on a date with no change behind it** (D2134's "that day the bell reminds"; a transfer running on its
  date). §11 writes a notice only inside a change. Recommended: worked out on read from the date, like the posting's
  "off the manpower" line (D1696), never stored.
- **Insights for a borrowed man.** His own hours on both schedules show in his own squadron's Insights. Each squadron's
  totals count its own lines (round 3's reading) — confirm with him.
- **Two schedulers, one shared line, two devices at once.** Covered only by the row-version trial. Write what the loser
  sees: "RU was changed by 149 just now — your change was not saved", the change kept to copy.
- **A wrong primary squadron chosen at sign-up or by the admin.** Allow an admin to correct it on Admin → Users until
  the man has anything filed or planned. After that, only Post out (D2087).
- **The late mark on a detachment's group overseas duty** made at short notice. An input filed through D2131's door is
  a scheduler's and never LATE, as a change from a schedule row is (D741).

---

## D2136 — "Transfer to Sqn": what he carries, what stays, what must be refused or asked

Take Viper, a 142 pilot posted to 149 from Mon 3 Aug. His primary squadron should be **worked out from his posting
records by date**, never written by a pass on the day. No server code runs then (only scheduled flows), and the posting
pass's account writes already have an open security finding (OUTSTANDING `[REVIEW-LAYERS]`, 8 Nov security read). So
3 Aug turns over by itself for every reader, and "Undo post out" is the record going away.

**Carried with him (D281, "all his data"):**
- inputs and leave, filed and approved — they belong to the person;
- quals and currencies — but only the columns both squadrons have (see below);
- his OIL balance and leave ledger;
- his account, his callsign, already unique in the community (D288);
- medical days, and with them the Tracker's down days.

**Must be asked or listed on the posting sheet before "Post out":**
1. **142's future lines holding him after 3 Aug.** They are now 142 borrowing a 149 man, allowed at the same place
   (D2091). The sheet lists them, and on 149's side each becomes an Attach row (finding 1), arriving as pending on
   149's published days (D2107). If 149 is at another place, each is a "not at this place" line (finding 8). The sheet
   asks: keep as borrowing, or take him off.
2. **His leave on and after 3 Aug, approved by 142** (D1541: "the next squadron may still refuse it"). The sheet lists
   it, and 149's admins get it on their Approvals, marked "approved by 142".
3. **Bids in an open bidding round on months after 3 Aug.** Refused and returned, since 149's round is its own.
4. **His leave grade.** Grades are each squadron's own list. The sheet asks for his 149 grade (none by default), and
   1 January's roll-over uses it.
5. **Quals in a column only 142 has** (its Management tick, a squadron-own column). Kept, read only, under his 142 stint;
   never added to 149's columns by themselves.
6. **His Tracker course.** Owner's choice. Recommended: his enrolment moves with him to the same course run under 149,
   marks kept; or stays on 142's course, read only to 149's admins until he finishes.
7. **His roles.** Admin or scheduler of 142 ends on 3 Aug. Nothing in 149 is given by itself. 149's admins are told.
   The last-admin guard (D306) holds the posting if he is 142's last.
8. **An overseas duty naming a 142 detachment across 3 Aug.** Refused; end it first.
8a. **His access to view 142.** Recommended: kept as view only, since he flew with them; a 142 admin may remove it.
9. **A day he holds the lock on, and pending OIL questions on his inputs.** The lock clears on 3 Aug. His OIL answers
   stay his.

**Stays with 142:**
- every published day of 142 that holds him (issued versions keep him);
- his 142 stint on 142's Leave War, with "his last day" line, gone days counted out;
- the edit history.

**Refused:**
- Transfer to a squadron not in Admin → Squadrons, or to his own.
- A date inside an earlier stint (D328).
- Undo after 149 has planned him or he has filed anything in 149, without the sheet first listing what goes back.

**Undo post out (D321):** before 3 Aug, simple. After 3 Aug, it lists what 149 has done with him since — lines,
approvals, inputs — and asks, as the delete does today.
