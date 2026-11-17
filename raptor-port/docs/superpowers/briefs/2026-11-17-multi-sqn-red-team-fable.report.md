# Red team of the squadrons and detachments design — Fable's report (chat 99, 17 Nov 26)

Brief: `2026-11-17-multi-sqn-red-team.md` with `2026-11-17-multi-sqn-red-team-fable.md`. Read only; this file is the
only one written. Sections 1–3 were written blind: before them I opened neither of the two earlier reports, nor the
round 6 pictures page, nor the design note's `## Round 6` section, nor D2139–D2143. Section 4 ("The newest wording")
was added afterwards, from the one subsection and the five rulings the brief names.

What I read: the design note (all but Round 6); the full rows D2087–D2138 and D54, D148, D281, D282, D288, D289,
D294, D296, D303, D350, D785, D1100, D1101, D1393, D1695, D1751, D1971; the round 3 page whole and round 4's text;
`engine-rules.md` (crew rest, double bookings, the late-input mark, OIL — what pools, which published version pays —
publishing / amendments); `data-model.md` §Squadrons and §11; the OIL, People & accounts, Leave War and Tracker
pages; and the code named in each finding. "Checked:" in a finding says where I saw how the app works today;
"unchecked" marks what I could not open.

Count: sections 1–3, written blind — 6 HIGH, 7 MEDIUM, 1 LOW (findings 1–14). Section 4, the newest wording —
9 MEDIUM, 1 LOW (findings 15–24). In all 6 HIGH, 16 MEDIUM, 2 LOW.

---

## 1. Findings, HIGH first

### 1. HIGH — One man, one date, two published schedules: his OIL is worked out twice, each time from half his day

**The failure.** Saturday 18 Jul. Saber (142) is on 142's own morning line, 07:00–11:00, and 149 picks him for a
seat on 149's own line VL, 13:00–17:00. Both squadrons publish. His day at work is 07:00–17:00, ten hours, which his
rule makes a full day of OIL (FO, 1.0). The app works OIL out per schedule day: 142's Saturday sees four hours and
writes a half (HO), 149's Saturday sees four hours and writes a half. One Leave War cell for the date now has two
writers that never see each other's hours: he gets a half where he is owed a full day, or the two writers overwrite
each other on every pass. The same happens with 142's own formation RU flown in 149's wave (it is in 149's
published day, D2106) beside a 142 line in 142's own wave.
Two things make it worse:
- (a) D2098 makes his row on 142's schedule "as the Attach input does today". Today an Attach on a weekend or
  holiday is asked the OIL question, and a yes pays. So 142's side could also be asked "OIL?" for the hours 149's
  published line already pays.
- (b) Whether the date earns at all is frozen into each published day from that squadron's own Leave War calendar.
  If 142's admin has declared a holiday and 149's admin has not typed it yet, the 142 man on 149's line earns
  nothing for a day that is a holiday for him, and the reverse pays a man for an ordinary day.
- (c) The three kept Logic values (nominal report lead, debrief, the full-day line) are frozen from the schedule the
  line sits in (D2109), so a 142 man's OIL is measured by 149's full-day line when he flies in 149's wave.

**Checked.** `engine-rules.md` §Weekend/PH work earns OIL: the engine half is `dayOilCredits(day)` on ONE day's
record; the day is "the ENVELOPE of everything they did — FIRST start to LAST end", one threshold (`oilFullMin`,
default 361 min); "one envelope per day cannot pay twice". §Which published version pays: the kept values `rv`
frozen at each publication; "Never overwrites … the two reconcilers must not fight over one cell".
`src/engine/inputs.ts` — `oilAsks` is `restsInput`, which takes in Attach and OD. `src/leavewar/sync.ts`
`isNonWorkingISO` reads `war?.period.bands`; `data-model.md` §11 `LeaveWar` row: a holiday is written into the Leave
War period (`lw.holiday.add`).

**Cause.** D2098 and D2106 put one man's day on two published records; the design's only words on OIL are the
agent's reading "it arrives when 149 publishes" (round 3 §6); D2097's "never earns OIL twice" covers ALL AVAIL only.
D142 (the latest published version of *the* day decides) assumed one schedule per date.

**The fix.**
1. One OIL figure per man per date, measured across every published schedule he is on that date at his place: first
   start on any of them to last end on any of them, then the one threshold. Where the two squadrons' full-day lines
   differ — his choice: (A, recommended) the man's own squadron's values measure his day; (B) the stricter.
2. Each schedule's published version still decides its own part (D142 unchanged): when either squadron publishes,
   amends or takes him off, his figure for that date is worked out again from both latest published versions.
3. The row made by itself on the home schedule ("Attach · 149") is never asked the OIL question and earns nothing
   by itself — the other squadron's published line is its evidence.
4. One holiday list for the whole deployment (a holiday typed once, by either squadron's admin or a master admin),
   not one per squadron's Leave War — his choice; recommended one list, since the two squadrons share public
   holidays. An "Off day" (D21) stays each squadron's own.
5. At the database step D1579 already makes earned OIL "a row a person and date": state there that the row has
   more than one source schedule.

### 2. HIGH — A man on a detachment can be paid OIL twice for one weekend: by his overseas duty input and by the detachment's schedule

**The failure.** Anvil (149) is on detachment 249, 13–31 Jul, through the "+ Put people on it" door (D2131): one
overseas duty input for six men. That input covers weekends, so the app asks its OIL question; the admin answers
yes, full day. On Sat 18 Jul 249's published schedule has Anvil flying four hours — a half day by the schedule. Two
automatic sources now claim the one cell for 18 Jul: FO from the input's answer, HO from 249's published day. And
because D2131 files one input for all six with one answer, the two men who did not work that Saturday get the same
full day as the four who flew.

**Checked.** `.claude/rules/decisions/oil.md` §The OIL question: "Every kind that can earn — … Overseas duty and
Other — is asked the OIL question and its answer decides"; "A several-people input is one line with its one
answer". `src/engine/inputs.ts`: `'OD'` is in `restsInput` / `oilAsks`. Today the two never meet because a man on
overseas duty "cannot be planned for anything at all" (the same file, the OD row) — D2101 is what ends that.

**Cause.** D2101 / D2102 / D2131 reuse the overseas duty input unchanged; D2088 gives the detachment a schedule of
its own that publishes; nothing says which of the two is the OIL evidence.

**The fix** (his choice):
- (A, recommended) An overseas duty naming a detachment is never asked the OIL question: on a detachment the
  published detachment schedule alone pays, as at home. "None" (a staff trip, D2101) keeps today's question.
- (B) The input's answer pays and the detachment's schedule never does — simpler to build, but a man's worked
  weekend then depends on someone answering a question, and an amendment on the detachment's schedule changes
  nothing.
Either way: say whether the detachment's own weekend and holiday calendar is home's (recommended: home's — OIL is
his home entitlement).

### 3. HIGH — Closing a detachment leaves its days after today published, read only, and still counted

**The failure.** 249 has published through Sun 26 Jul. The exercise ends early; 149's admin presses "Close
detachment" on Wed 22 Jul. D2103: its schedules are "always kept, read only"; D2135: the men's overseas duty ends
that day. But 23–26 Jul stay published on 249's schedule with six men in seats, and nobody can amend them any more
(read only). By D142 "the published record is what happened, with no test of whether the day was worked": Sat 25
Jul still pays each of them OIL for flying that never happens. The same six are back on 149's crew lists from 22
Jul, so each is on two published schedules at two places for 23–26 Jul.

**Checked.** `.claude/rules/decisions/oil.md` [D142]: "no lock, no clock … with no test of whether the day was
worked". `engine-rules.md` §Which published version pays: the credit pass reads the frozen block of each published
date.

**Cause.** D2103 and D2135 say what happens to the people and to the record's keeping, not to the detachment's
days after the close.

**The fix.** Closing is an amendment, not only a lock: (1) the question at the button names the published days
after today ("4 published days after today will be cleared: 23–26 Jul"); (2) on Yes each of those days is emptied
and published as its next amendment in the same step, signed as the closing admin's act, so the record says
"cancelled" rather than "flown" and the OIL goes with it; (3) today's and earlier days stay exactly as published;
(4) days never published are simply dropped from view. His choice inside it: whether today's own lines after the
hour of closing are cleared too (recommended: no — close at the end of the last flying day).

### 4. HIGH — A man can leave a detachment's manpower while still seated on its published days, and is then planned at two places with no check

**The failure**, three doors, one hole:
- (a) Anvil edits his own overseas duty to end 14 Jul instead of 21 Jul (his own input — a member may change it).
  249's published 15–21 Jul keep him in seats. From 15 Jul 149's crew list at home offers him again; 149 plans him.
  D2092: units at different places are never checked against each other — no warning anywhere.
- (b) 149's home scheduler presses Reject on Anvil's overseas duty row (he may, D1393: a scheduler can take an
  overseas duty out of Unavailable, and it "counts him IN" again). Same result.
- (c) 149's admin moves 249's "To" from 21 Jul to 28 Jul (D2134 lets him). The six inputs still end 21 Jul; from
  22 Jul the men drop off 249's manpower and reappear at home while 249 plans them for the extra week.
"The app refuses to plan a man at a place he is not at" (D2092) guards the moment of a pick only; it says nothing
about a man who stops being at the place after he was planned.

**Checked.** `src/engine/inputs.ts`: `odOut` (an overseas duty with `acc` 'r' / 'g' or `odGround` is not away) and
`isAway`; D1393's full row; `data-model.md` §11 `Input` row (a member creates, changes and deletes his own).

**Cause.** D2101 makes the input the one record of who is on a detachment; D2092's refusal is a check at the door;
D1393 and a member's right to edit his own input were written when an overseas duty had no schedule behind it.

**The fix.**
1. A standing check, not only a refusal: a man seated on a schedule at a place he is not at that day shows a red
   warning on that schedule ("Anvil is not on 249 on 16 Jul"), reads pending on its published days (as a man
   archived under a published day does today, D321, D327) and rings its schedulers' bell.
2. A change that takes a man off a detachment for days he is seated there — his own edit, a delete, a Reject —
   says so first: "You are planned on 249 on 16 and 17 Jul. 249's schedulers are told." His choice: (A,
   recommended) it goes ahead and 249 is told; (B) a member's own edit is refused and he asks 249's scheduler.
3. Reject / → Ground on an overseas duty that names a detachment: not offered at home (recommended) — the way off
   a detachment is its People list or the input's dates.
4. Moving "To" asks: "Extend the 6 people's overseas duty to 28 Jul?" Yes by default.
5. Say in the rule which dates count: he is on the detachment for the days his input and the detachment's dates
   both cover.

### 5. HIGH — A squadron's place has no dates, so one press re-reads the past and strands the future

**The failure.** 142 and 149 share home through November, with shared waves most days. On 1 Dec 149 moves away for
three months and the master admin saves the new place (D2119: at once, no "From"). From that second the two are
"at different places", which "never" share people and are "never" checked against each other (D2092):
- Every day already planned or published for December with a 142 line in a 149 wave, or a 142 man in a 149 seat,
  is now a state the rules call impossible. Nothing says whether those lines vanish, stay, or warn.
- November's days are read by the same rule. A place with no date makes the past "different places" too: the
  "Attach · 149" rows made by themselves, the cross-squadron warnings and the other squadron's lines on past days
  all depend on "same place". Each past published 142 day that carried such a row now differs from its issued
  version — pending with its sign-offs down, across weeks — or, if the row is only worked out on read, changes
  with nothing pending at all.
- The save happens at some hour of 1 Dec; a man who flew a shared wave that morning is at two places that day.

**Checked.** Nothing of place exists today (the rulings say so). What I checked is the pattern the app already
uses for a fact that changes on a date: a man's time in the squadron is kept as dated stints, and a published day
compares "roster attributes as they stood when the day was issued" (`engine-rules.md` §Publishing / amendments,
first paragraph; D308, D320, D327).

**Cause.** D2119 against D2092; round 3's Q1 recommended a "From" and he leaned against it for simplicity.

**The fix.** Keep his answer — no "From" box, it takes effect on saving — but store the place *with the day it
was saved*, as history: a day is always read by the place its squadron had on that day. Then the past cannot
change. For the future, the save's one line counts what it strands: "9 days after today hold lines shared with
142" and his choice: (A, recommended) they stay as planned, each wearing the standing warning of finding 4 until a
scheduler clears it; (B) Save is refused until they are cleared. A move takes effect from the next day's start
(recommended), so no day is split between two places.

### 6. HIGH — "Transfer to Sqn" and "access as a scheduler" can make a man an admin of a squadron whose admins never chose him

**The failure.**
- (a) Rune is an admin and scheduler of 142. 142's admin posts him out, "Transfer to Sqn" → 149, 1 Dec (D2136).
  "All his data goes with him" (D281) and his account is one row with one role. On 1 Dec he is an admin of 149 —
  its Logic, its Admin → Users, its Leave War approvals — and no 149 admin did anything. An admin of 142 can do
  this to any 142 man, himself included.
- (b) D2094: an admin gives a man of the other squadron access "to view or as a scheduler". D785: "A scheduler is
  always an admin." So "as a scheduler" on 149 either makes a 142 man an admin of 149 (he can then change 149's
  crew rest and full-day OIL line in Logic — D2132 says Logic follows the pick — give others access, open and
  close 149's detachments, D2093), or creates the scheduler-who-is-not-an-admin that D785 says the app is not
  built for. The design does not say which.

**Checked.** `data-model.md` §11: four roles, admin / member / guest / pending — no scheduler role apart from
admin; the SCHEDULER tick is a qual mark only an admin sets (D1651). D785's full row. `src/state/perms.ts`
`PASS_FIELDS`: a posting's run may change only named fields, and "'transfer' is not an outcome yet".

**Cause.** D2136 with D281; D2094 with D785 and D2114.

**The fix.**
1. Transfer: his role in the new squadron starts as member, whatever it was; his admin rights and SCHEDULER tick in
   the old squadron end on the date; 149's admins get the bell line when the transfer is set and when it runs
   (D1546's "nobody is ever gone silently", now also "nobody arrives silently"). The existing guard "a posting
   that would remove the last admin able to sign in waits" (D306) is asked per squadron.
2. Access to the other squadron — his choice: (A, recommended) two levels only, "view" and "scheduler", where
   scheduler means: change that squadron's schedule pages and nothing else — not its Logic, Users, Squadrons page,
   Leave War, Quals or Tracker. That is a new, narrow exception to D785 and should be recorded as one. (B) only
   "view"; cross-squadron planning needs nothing more, because D2091 and D2114 already let a scheduler pick the
   other's men and change a shared line from his own schedule.
   B is the smaller design and I would take it unless he has a case that needs A.

### 7. MEDIUM — "A line that concerns both" is read so widely that one borrowed man opens another squadron's own line to edit

**The failure.** 149 puts Saber (142) in the back seat of 149's own VL. By D2114's reading ("a line concerns both
when it … holds men of both") and round 4's item 7 ("either scheduler changes 149's VL, since it holds a 142 man"),
142's scheduler may now change VL — its take-off, its mission, 149's own pilot. D2098 says the opposite for the
same line: on 142's schedule it is one row, "Attach · 149", and "a tap opens the other squadron's schedule at that
line, read only". Round 4's picture 7b also draws VL on 142's schedule with 149's badge, which D2098 says is not
shown there.

**Checked.** The full rows of D2098, D2114, D2123; round 4's page text, item 7 ("my reading").

**Cause.** D2114's agent reading and D2123's "either scheduler may fix it" against D2098.

**The fix.** Narrow "concerns both" to one case: a squadron's own line in the other's wave (RU). On the other
squadron's own line that holds your man (VL), your scheduler may do one thing — take his own man off it, from the
Attach row — and nothing else. Recommended; the other choice is to keep the wide reading and withdraw D2098's
"read only", and then VL must show whole on 142's schedule.

### 8. MEDIUM — After both squadrons have published, a change to 142's line in 149's wave has no mark on 142's schedule and only 149 can send it

**The failure.** Sunday night, both Mondays published. 142's scheduler swaps RU's pilot, Viper for Tally. D2106:
the change "reads pending on 149's day" and never makes 142's day pending. 142's day head still reads ✓ ORIG,
nothing pending; the grey line under the wave reads "Published by 149." (D2124 has three sentences; none for this
state). 142's scheduler believes it is out. It is not: only 149 can publish it, and 149's scheduler has gone home.
Monday morning 142's members read the issued RU — Viper — and Tally is not told.

**Checked.** D2106, D2124, D2129 full rows; `engine-rules.md` §Publishing / amendments (the pending count reads
the day's own record against its issued version — RU is in 149's day).

**Cause.** D2106 with D2124 / D2129: three states drawn, the fourth (published, then changed) not.

**The fix.** (1) A fourth sentence, on both schedules: "RU changed · goes out when 149 publishes AL1." (2) The
changed cells wear the usual pending dots on 142's schedule too. (3) 149's schedulers' bell: "142 changed RU on Mon
13 Jul — publish to send it." (4) His choice, to ask: may 142 publish an amendment that holds only its own line in
149's wave? Recommended no (it keeps D2106's "one owner signs"), but then (1)–(3) are needed.

### 9. MEDIUM — Two schedulers on one line: the day's "who is editing" mark is one per day, and a publish can catch the other squadron mid-edit

**The failure.** 149's scheduler is building 149's Monday and holds it ("Jolt – editing"). 142's scheduler presses
"+ Wave → Join a 149 wave" or changes RU. Today's rule is "only the day's holder saves a day": either 142 is
refused for as long as 149 is editing (up to 30 minutes idle), or 142 takes over the whole of 149's Monday to
change one line, or the shared line is saved outside the mark — and then 149 can press Publish while RU is half
typed, and a line with an empty seat goes out under 149's four signatures.

**Checked.** D1751's full row and the scheduler page's lines on the day lock ("only the day's holder saves a day",
freed after 30 minutes); `data-model.md` §11 ScheduleWeek row ("saved only by the day's holder"). Round 3's page §6
names the need ("the mark … must also cover a wave both squadrons fly in") and gives no answer; the design note
says the row-version check is "unproven" on a code app.

**Cause.** D2114 and D2106 against D1751.

**The fix.** A squadron's own line in the other's wave is a record of its own with its own "editing" mark, apart
from the day's: 142 edits RU without holding 149's day; 149's Publish is held (with the reason, "Saber is editing
RU") while that mark is up; the row-version trial the note already asks for is run on exactly this case before
anything is built on it.

### 10. MEDIUM — Crew rest and days-in-a-row stop at the place boundary: no check on the first day out, the first day back, or an early close

**The failure.** Anvil flies 249's night wave on Tue 21 Jul, landing 23:30 overseas. His overseas duty ends that
day. 149 at home plans him for Wed 22 Jul, in at 07:00. D2092: units at different places "never are" checked
against each other — no crew-rest warning, though by the rule he flies on under eight hours' rest (less, with
travel). The same on the day a detachment is closed early (D2135: "back … from that day"), and for the count of
days worked in a row, which starts again from nothing on each move.

**Checked.** `engine-rules.md` §Crew rest: it "runs off the last commitment of ANY kind the day before"; the
break-day rule (DAYS_RUN) under §Chip ranking. Both read the man's previous days on the one schedule there is today.

**Cause.** D2092's "never" was his answer to D2088's question about clashes at the same hour ("there isn't a need
to show conflicts across?"); the agent's reading stretched it to every check about the man.

**The fix.** Split the rule in two and ask him: checks about the *same hour* (double booking, areas, sims) never
cross places; checks about the *man's days* (crew rest, days in a row) read his day before wherever it was. His
choice whether a travel day counts as a commitment (recommended: the overseas duty's last day ends his day at
24:00 unless the detachment's schedule shows less).

### 11. MEDIUM — D2123's "the later line" does not say which schedule judges under the rule as built

**The failure.** 149's crew rest is 10 hours, 142's is 12. Saber's Monday ends 21:00 on 142's schedule. Tuesday:
08:00 he teaches academics on 149's ground programme (a pick); 14:00 he flies a 142 line. The engine anchors crew
rest on "the man's first commitment of the fly-day" of any kind — the 08:00 event, on 149's schedule — while the
rule "only exists when he FLIES that day" — the 142 flight. The gap is 11 hours. Is "the later line" the 08:00
event (149's 10 hours: no warning) or the flight (142's 12 hours: a breach)? Two builders would answer
differently.

**Checked.** `engine-rules.md` §Crew rest, first bullet (the quotes are from it).

**Cause.** D2123 was ruled on a case with two flying lines only.

**The fix.** Ask him with this case. Recommended: the schedule of the line he *flies* that day judges (the flight
is why the rule exists); if he flies on both that day, the stricter of the two. The same answer should be given
for the long-day and turn-time settings, which D2123 does not mention and D2109 alone cannot decide for a day
spread over two schedules.

### 12. MEDIUM — "Today" is each device's own date, and a detachment can be in another time zone

**The failure.** 249 is overseas, some hours behind home. 149's admin at home presses "Close detachment" at 07:00
home time on 22 Jul; for the men it is still the evening of 21 Jul and their last wave is airborne. "Their overseas
duty ends that day" — whose day? The planned-end bell (D2134), a posting or transfer "on the date" (D2136), the
late mark on an input filed from the detachment, and "pending from today" all turn on "today", and the app takes
today from the device in the user's hand. Two people looking at one record get two answers, and a dated change
that is "worked out when the app is opened" (the note's platform section) is carried out by whichever device opens
first.

**Checked.** `src/engine/inputs.ts` `nowStamp()`, `src/state/changelines.ts` `localToday`, `src/state/perms.ts`
`localIsoToday` (the posting pass acts on a date "already come" by the device's local date). Times of day are
stored as plain clock times with no zone (`engine-rules.md` throughout). I found no ruling on time zones (searched
`.claude/decisions-full/`, `OUTSTANDING.md`).

**Cause.** D2088 / D2092 put a unit at another place; nothing gives a place a clock.

**The fix.** His choice: (A, recommended) every date-turn in the app — close, planned end, posting, late mark —
goes by home's date, whatever the device says, and a detachment's schedule is typed in its own local times, shown
as typed; a place carries its offset from home only so that finding 10's crew rest across the move can be worked
out. (B) Each place has its own clock for everything — truer, much more to build.

### 13. MEDIUM — The transfer is drawn as a change made on a date; it should be a dated fact, or the past changes with him

**The failure.** Rune transfers 142 → 149 on 1 Dec (D2136: "on the posting date moves his primary squadron"). If
that is one field on his row that flips, then on every November day — published days included — he is now "a 149
man on 142's lines": the grey badge and lighter shade (D2104), a row on 149's schedule for each (D2098), 149's
count beside 142's (D2096), Insights' "each squadron's totals count only its own" re-cut backwards. And the flip
itself is carried out "when the app is opened" by whichever device gets there first.

**Checked.** `src/state/perms.ts` `postingPassViolation` (how a posting is carried out today: any client, once the
date has come); the People & accounts page [D320, D308]: the Leave War already "keeps every stint a man has";
`engine-rules.md` §Publishing: an archived man "is read … by his stints".

**Cause.** D2136's wording; D2087 "on a specific date".

**The fix.** State it as: his squadron is read by date from his stints — 142 until 30 Nov, 149 from 1 Dec — never
a field that changes. Nothing needs to "run" on the date; every screen asks "whose man was he on this day". The
rest of what he carries is section 3.

### 14. LOW — The Tracker ripple rests on a link that does not exist today

**The failure.** The note says "a sortie flown on the other squadron's schedule counts on the student's own
Tracker". Today no sortie reaches the Tracker from any schedule: marks are entered by hand ("Done on"), and the
Tracker's only tie to the rest of the app is the roster list and down days from Inputs. A builder reading the note
would look for a wire to extend.

**Checked.** `src/tracker/peoplewire.ts` is the only file under `src/tracker/` that reads the app's roster or
store; `.claude/rules/decisions/tracker.md` (marks filed by hand under the enrolment).

**Cause.** Round 3 §6's reading, carried into the note.

**The fix.** Reword the note: nothing to do until the Tracker expansion links sorties to the schedule; when it
does, the link follows the man, not the schedule. The real Tracker question for two squadrons is in section 3
(a transferred student) and section 2 (who may open whose courses).

---

## 2. Questions the design never answers (each with my recommended answer)

1. Which detachments does a man's overseas duty offer — only his own squadron's, or the other's too (a 142 man on
   149's "249")? Recommended: both squadrons' open detachments; D2092 already lets two units at one place share.
2. Two overseas duties over the same days naming two detachments, or one naming a detachment outside its dates or
   already closed? Recommended: refused at the save, with the reason.
3. May an overseas duty naming a detachment be part of a day (the input allows typed hours today —
   `inputs.ts awayAllDay`)? Recommended: whole days only when a detachment is named, so "one place on any day" holds.
4. Does a man on a detachment see its schedule by himself, for its dates? Recommended: yes, and his own past
   detachments afterwards; nobody has to give him access.
5. Does a detachment have its own Logic settings, areas, sims, duty-desk templates and jets? Recommended: it starts
   as a copy of its squadron's Logic and lists on the day it is made, then its admins change it; jets are picked
   for it from the squadron's (a tail on the detachment is not offered at home).
6. D2097's "each squadron's ALL AVAIL counts its own people only" was recommended and never ruled. Recommended:
   rule it as written; a detachment's ALL AVAIL counts the people on the detachment that day.
7. Whose late cut-off marks a man's input LATE when he is shown on the other squadron's schedule? Recommended: his
   own squadron's, everywhere.
8. Does the other squadron's scheduler see *why* a man is unavailable (leave kind, medical) or only when?
   Recommended: only the hours ("unavailable 08:00–12:00") for a man of the other squadron; this is the kind of
   change D1411 wants a security read on.
9. May 149 pick 142's SANS men, and by which SANS cut-off? Recommended: yes, where they have offered availability;
   142's cut-off.
10. Does print and export of 142's day include a line that 149 has not published ("RU goes out when…")?
    Recommended: no — paper shows only what is issued, with the grey sentence in its place.
11. A detachment's number (D2116): may it equal a squadron's or another open detachment's? Recommended: refused.
12. Do the other squadron's lines take line numbers of the schedule's own (D2096 left it "still to confirm")?
    Recommended: no, as on his paper schedules.
13. Insights: do a detachment's lines count in its squadron's totals? Recommended: yes, with a split by place.
14. "✕ Wave" (D2113) says "Undo puts it back": what if 142 changed RU in the minute before? Recommended: Undo
    puts back the wave as it stood at the press, and D148's refusal covers the rest; say so on the card only if
    asked.
15. A master admin's own primary squadron, and whether "Request access" can reach a master admin when a squadron
    has no admin yet. Recommended: the master admin who makes a squadron is its first admin until he names one.

---

## 3. D2136, the transfer — what he carries, what stays, what is refused or asked

How a posting works today (checked: People & accounts page §Posting out; `src/state/perms.ts`; D303, D350, D328):
set on the Leave War's Post out sheet with a date; carried out by itself once the date has come; "Undo post out"
on the sheet, never on the Undo button; every stint kept; an earlier stint's dates read only.

Recommended design, one line each. Items marked **ask** are his product choices.

| What | Recommended |
|---|---|
| His squadron | A new stint: 142 to the day before, 149 from the date (finding 13). Nothing flips. |
| Past days on 142's schedule | Unchanged for ever — his puck, his signatures, the published record, his OIL earned there. |
| Seats after the date on 142's schedule | **Ask.** (A, recommended) they stay; from the date he is a borrowed 149 man on them — badge, a row on 149's schedule, pending on any published day he is named on (as D321 does today). (B) cleared on the date, 142's published days reading pending. If the two squadrons are at different places on the date, B is forced. |
| Seats after the date on 149's schedule (he was borrowed) | Become ordinary seats; the "Attach · 149" rows on 142's schedule go. |
| Inputs | Go with him — they are the person's (the review's point 5). A row an input landed on 142's ground programme after the date moves to 149's day. An overseas duty naming a 142 detachment across the date: the transfer is refused until it is ended ("He is on Exercise North until 21 Jul"). |
| Leave already approved after the date | Goes with him as approved; 149's Leave War shows it from the date; if 149's period for those months is not made or its manning limit is passed, it stands and is flagged to 149's admins, never dropped. |
| Bids not yet decided, after the date | **Ask.** (A, recommended) they become bids in 149's war if its bidding is open, else they wait as requests for 149's admin. (B) dropped, and he is told. |
| Leave balances, leave grade, OIL balance, awards | Go with him whole (they are per person; D1579 already unties earned OIL from a Leave War period). |
| OIL from a past 142 day that 142 later amends | Still moves by D142 (take him off the day, the OIL goes) — but 149's admins are told, since it is now their man's balance. |
| 142's Leave War | Shows him to the day before, "PO" after, as any posting. 149's shows him from the date; the earlier months of the same period read "not here yet". |
| Quals | The marks go with him where 149 has the same column; a mark under a column 149 does not have is kept on his record, shown greyed, never deleted (each squadron edits its own columns — `data-model.md` §11 `Qualification`). **Ask** whether the two squadrons should share one column list instead. CAT, initials, seat: go with him. |
| Currencies, medical record | Go with him. |
| Role | Member in 149; admin and SCHEDULER tick end in 142 (finding 6). |
| Access to 142 afterwards | None, unless 149's or 142's admin gives "view" — **ask**; recommended view for a month is not worth building: none. |
| Account and sign-in | The same account; his bell keeps his own lines; lines about 142's schedule stop from the date. |
| Callsign | No change, provided "unique within the community" (D288) is enforced across both squadrons from the first day — including Restore of an archived man and "his callsign may go to a new person" (D286), which today check one roster. |
| Tracker | **Ask.** (A, recommended) his enrolment and marks stay in the course he is on; that one course shows in 149's Tracker for him and stays in 142's. (B) he is moved to a 149 course on the same syllabus, marks kept (the marks are filed under the syllabus event's fixed code, D474, so this is possible). |
| Who is told | 142's and 149's admins when it is set and when the date comes (D1546). 149 is never asked to accept — consistent with his "it runs by itself" (D1547) — **ask** only if he wants an accept step for the receiving squadron. |
| Undo | Before the date: "Undo post out", as today. After: no undo; the way back is a transfer from 149, set by 149's admin, and the sheet says so (the earlier stint is read only, D328). Never a step of the Undo button (D350). |
| A date in the past | Refused for a transfer — it would re-cut published days. (Unchecked: whether today's sheet takes a past date for the other outcomes.) |
| The four chips | Transfer is one outcome; picking it shows a squadron picker with his own squadron left out (D2136's reading). With only two squadrons the picker has one entry — show the name, no picker. |
| A ground-crew man | Transfers the same way. |
| A man with open detachments' admin duties, or the last admin of 142 | The existing "last admin" wait (D306), asked for 142. |

---

## 4. The newest wording

Read after sections 1–3 were written: the design note's subsection "Chat 98's wording, put to him before his round 6
answers" only, and the full rows D2139–D2143 (with D212, D1541 and D1690, which it cites). I did not read the rest of
Round 6, so where the subsection leans on "Q1", "Q2", "R4" or "B12" I took its own words for them.

**How it stands against sections 1–3.** D2142 is the fix finding 3 asks for (one press clears the published days
after today and publishes the next amendment on each). The transfer sheet's "2 of 142's lines keep him, as a borrowed
149 man" is option A of section 3. The findings below are what the new wording still gets wrong or leaves out.
Numbering continues.

**Facts the subsection states, checked.** "An amendment's label runs per day" — true (`engine-rules.md` §The
amendment book: an AL "covers exactly one day"). "A weekend published ahead has already credited its OIL" — true
(D142, "no clock"; `src/leavewar/engine/oiltracker.ts`: the walk takes each debit from the oldest credit with no test
that the credit's date has come, and only expiry reads today). "His OIL goes to −1" — possible as built (the same
file's header: "Balances go negative … and are never refused"; today's Unpublish already warns in this case,
`engine-rules.md` §The amendment book, `oilCreditBidAgainst`). "An admin picks all four names" — true (D212).

### 15. MEDIUM — The Close card says three different things about the closing day

**The failure.** Thu 23 Jul, the card's own example. Line 1: "6 people back on 149's schedule today. Their overseas
duty ends today." The knock-on list: "the Leave War counts them back in from the next day". Point (3) put to him:
"the 6 counted back home from today … and the one-man-one-place check not raised for that day". An overseas duty
that "ends today" covers today as the app reads an input's last day (`src/engine/inputs.ts awayAllDay`: an overseas
duty is the whole of each day it covers) — so at home they are still away on Thursday, which is what the Leave War
line says and the opposite of line 1. If instead the input is cut to end Wednesday so that they are home "today",
then 149's own published Thursday must go pending too, and the card lists only Fri 24 and Sat 25. And with the
place check switched off for the day, 149 can plan Anvil at home for 19:00 on the day he flew 249's 14:00 wave
overseas — the app silent by design (finding 10).

**Cause.** D2103's "from that day" and D2135's "ends … that day" read two ways; the card tries to keep both. This
is D2140's own test (each line against the rest of the proposal).

**The fix.** One statement, everywhere: the closing day stays wholly the detachment's — the overseas duty's last
day is the closing day, the men are on 149's schedule and the Leave War's count from the next day, and the card
reads "6 people back on 149's schedule from Fri 24 Jul. Their overseas duty ends today." Then nothing is suppressed
and point (3) is not needed. If he wants them home the same day, the other choice is honest too, but it must cut
the input to yesterday, list 149's published Thursday as going pending, and keep the place check on.

### 16. MEDIUM — "Everyone taken off" does not by itself take the OIL away, and the order of the press's steps is not stated

**The failure.** 249's published Sat 25 Jul holds two flying lines and a Common Programme row for ALL AVAIL. The
card says "everyone taken off … Their OIL for those days goes". Names can be taken off seats; a placeholder row
names nobody — who stands behind it is frozen when the day is published. If the press publishes AL1 while the six
are still on the detachment (their overseas duty not yet shortened), AL1 freezes a crowd of six on that row and
each still earns Saturday's OIL: the card's third line is false. If the press shortens the overseas duty first,
the crowd is empty — but then the sign-off boxes of a detachment nobody is on any more offer no names at all, and
the recommended "names on each day's last issue" are names the box no longer offers.

**Checked.** The scheduler page line 78 ("who stood behind a placeholder is frozen at publication"); the OIL page
(a placeholder "earns for the men it stands for"); D212 (each box offers only the people its Quals ticks allow).
Unchecked: which people a detachment's boxes would offer — nothing of it is designed.

**Cause.** D2142's "clears"; the card's "everyone taken off"; the order inside "one press" never written.

**The fix.** Say "cleared" and define it: every row of the day goes — lines, waves, programme rows, duty desks,
rows landed from inputs — not only the names. State the order: (1) clear the days; (2) publish each with its four
names; (3) then end the overseas duty and return the people. And decide the names with finding 18.

### 17. MEDIUM — The card counts "6 people", but the press reaches people and schedules it does not name

**The failure**, each from the card's own example:
- A seventh man filed his own overseas duty naming 249 from Mon 27 Jul (D2120's backup door). He is not one of the
  "6 people back today". After Close his input still names a closed detachment: he is off 149's manpower for a week
  to a place that has no schedule. Nothing tells him or ends his input.
- If another unit shares the place (D2092's third case, two detachments on one exercise), 249's cleared Saturday
  can hold that unit's line or its man. Clearing removes them with no question — the very thing D2113 makes
  "✕ Wave" ask about — and that unit's schedule loses its row and goes pending, unnamed on the card.
- "Their OIL for those days goes: 6 people, 1 day each" — two days are cleared (Sat and Sun); the figure has to be
  each man's real loss per day (a half or a full day, not all six alike).
- The card is one press that publishes on several days. Today "publishing is per-day; there is deliberately no
  'publish all days'" (`engine-rules.md` §The amendment book) — this is the first exception and should be recorded
  as one. And a cleared day may be held by a scheduler editing it at that moment (D1751): the press must say so
  or take it over.

**Cause.** D2142 with D2120, D2092, D2113, D1751; D2143's "second and third step".

**The fix.** The card's lines are built from what the press will really touch: "1 more person was due to join on
27 Jul: his overseas duty is removed and he is told"; "Sat 25 Jul holds 142's RU: 142's schedulers are told"; the
OIL line with real figures ("Sat 25 Jul: 4 people lose 1 day, 2 lose ½"); a day someone is editing named with who.

### 18. MEDIUM — Whose four names: the recommended answer rests on a claim that is not always true

**The failure.** The subsection recommends "the names on each day's last issue (always names the box offers)". Not
always: a signer on the last issue may since have lost the Quals tick, been posted out, or — after this very press
— no longer be on the detachment at all (finding 16). And those four people checked a day with flying on it; the
record would now show their names under an amendment that empties it, which none of them saw.

**Checked.** D212's full row (who is offered in each box follows the Quals ticks, which change).

**Cause.** The subsection's point (1); D2140 ("no fact stated that has not been checked").

**The fix** — his choice of three, the third recommended: (A) the last issue's names, as proposed, with a rule for
a name no longer offered; (B) the pressing admin in all four; (C) the amendment made by Close carries no four names
at all: in their place one line, "Cleared when Exercise North was closed · <admin> · Thu 23 Jul". It is the only
amendment in the app that nobody planned or checked, and saying so is truer than either set of names. (Unchecked:
whether today's publish can go out with the four boxes empty; if it cannot, C needs that one exception.)

### 19. MEDIUM — Q3 as corrected moves the pending from the pick to the other squadron's publish — a change to D2107, with a cost nobody has shown him

**The failure.** D2107 as ruled: a pick onto a day the home squadron has published "arrives as a pending change" —
at the pick. The corrected wording: the row is faint grey, "not yet published by 149", nothing pending, until 149
publishes; then 142's day goes pending. That is a different rule, put as a correction of a drawing. Its knock-on,
worked through: on any day where 149 borrows a 142 man and publishes after 142 — the usual order is whoever is
ready first — 142's published day goes pending when 149 publishes, its four sign-offs fall, and 142 must sign and
publish an amendment that changes nothing 142 planned. Then "each later 149 amendment that changes Viper's time
away does the same". On a week of shared flying, 142's ORIG is almost never its last word for a day, and 142's
amendment numbers stop meaning "142 changed its plan".
A second gap in the same wording: it says the cross-check "reads 149's latest working plan" while the row shows
149's published state. So when 149 takes Viper off a published line but has not published that, 142's row still
says he is taken and the check says he is free — two answers on one screen.

**Checked.** D2107, D2098 (its reason: "nothing of the other squadron enters its … publishing or signatures" —
yet the row does enter both), the scheduler page line 78 (anything pending wipes the four sign-offs).

**Cause.** The subsection's Q3 against D2107 and D2098's stated reason.

**The fix.** Put it to him as a choice, with the count: (A) as now worded — pending on 142's day each time 149
publishes a change to his time away; (B, recommended) the row is 149's published fact, shown on 142's schedule
the moment 149 publishes, wearing 149's grey badge, never pending on 142's day and never in 142's signature —
exactly how D2106 already treats 142's own line in 149's wave — with a bell line to 142's schedulers each time.
B needs D2107 changed, on his word. Either way: the row shows 149's issued state solid and an unpublished change
faint beside it, so the row and the check never disagree.

### 20. MEDIUM — The man who is picked is never told, and may not be able to see his own tasking

**The failure.** Sunday evening 149 picks Viper (142) for Monday 13:00 and publishes. By D2091 the bell rings 142's
*schedulers*. Viper is a member with no access to 149's schedule (access is given by an admin, D2087, D2094). His
own squadron's issued Monday does not show the row until 142 publishes its amendment (the corrected Q3: "its issue
never holds it"). If 142's scheduler does not publish before Monday noon, Viper's only schedule says he is free at
13:00.

**Checked.** D2091 ("rings its schedulers' bell"), D2087, D2094; round 1's Q3 recommended "anyone sees, read only, a
day of the other squadron he is planned on himself" — never put to him or ruled.

**Cause.** D2091, D2098, D2107 and the corrected Q3 together; round 1's Q3 overtaken.

**The fix.** (1) Rule round 1's clause: a man always sees, read only, the other squadron's published line he is on.
(2) When the other squadron publishes a day that names him, or changes his line, his own bell gets a line ("149
planned you · Mon 13 Jul 13:00"). With finding 19's option B the row is also on his own issued schedule at once.

### 21. MEDIUM — The transfer sheet's first line promises three things that do not move as it says

**The failure.** X4: "moves to 149, with his account, leave, OIL, quals, inputs and Tracker course."
- "account": his account's role goes too. An admin of 142 arrives as an admin of 149 (finding 6); the sheet's only
  line on rights is "His access to 142 ends".
- "quals": each squadron edits its own list of qualification columns today (`data-model.md` §11 `Qualification`,
  Quals → Edit quals). A mark under a column 149 does not have has nowhere to show.
- "Tracker course": a course is shared by its students and stays where it is; what can move is his place and his
  marks (the Tracker page: marks are "filed under his enrolment"). D2132 keeps the Tracker "on his own squadron",
  which from 3 Apr is 149 — so read literally he loses sight of the course he is on.

**Cause.** The sheet's X4 against D785 / D1971, the Quals table as built, D2132.

**The fix.** Section 3's rows for role, quals and Tracker, and X4 reworded to what is true: "…with his leave, OIL,
inputs and sign-in. He joins 149 as a member." plus lines only when they apply: "2 quals 149 does not list are
kept on his record" · "He stays on <course>; 149's instructors can open it."

### 22. MEDIUM — "1 leave 142 approved goes to 149's Approvals; 149 may still refuse it" — not always possible as the Leave War works today

**The failure.** Rune's leave 20–24 Apr was approved in 142's war, and that war is published. On 3 Apr it "goes to
149's Approvals". Two readings, both with a problem. If it arrives as approved: on a published war an approved
leave cannot be sent back from the sheet — the app's own words are "the leave is published: step the war back to
BIDDING CLOSED to change it" — so 149's "may still refuse" means stepping its whole war back for one man. If it
arrives as waiting again: his balance, which D1541 kept precisely so "he can see how much leave is left after
applying", changes on the date, and a leave he was told was approved is no longer. The line also leaves out 149's
period for those months not existing yet ("No leave period yet"), or being at a different stage from 142's.

**Checked.** `engine-rules.md` §Which published version pays, the clash lines (`sync.ts clashWayOut`: the four
ways out by the war's stage); D1541's full row.

**Cause.** The sheet's X5 against D1541 and the war's stages.

**The fix.** Ask him: (A, recommended) it arrives approved and stays counted; 149's admins get it on Approvals
marked "approved by 142 before he joined" with a Refuse that works at any stage of 149's war for this one case;
(B) it arrives waiting, and the sheet says so to the man. If 149 has no period for those dates, the leave waits
on his record and lands when the period is made — never dropped.

### 23. MEDIUM — "A weekend he works for 142 after the date is judged by 149's OIL settings": the third step is missing

**The failure.** After 3 Apr Rune, now 149's, stays on a 142 line on Sat 10 Apr. 142 publishes that day. A
published day keeps the Logic values its OIL was worked out from, and tells the scheduler when today's values
would pay differently: the day reads one pending change, "OIL on this day · Logic values changed since it was
published", and its four sign-offs fall. If Rune's OIL on 142's day is judged by 149's values, then 142's published
Saturday must keep 149's values for him — and when 149's admin later changes 149's full-day line, 142's published
Saturday goes pending with its signatures down, for a change made in the other squadron's Logic by someone with no
rights on 142's schedule.

**Checked.** `engine-rules.md` §Which published version pays — "kept", "told", "signed" (`OilEvidence.rv`,
`publish.ts oilRuleDelta`, `oilRvBoundOk`).

**Cause.** The subsection's last knock-on (and finding 1's fix option A, which has the same third step) against
D592 and D2109.

**The fix.** Keep "his own squadron's values" but name the step and choose: (A, recommended) the published day
keeps the values it went out with for every man on it, his own squadron's among them, and a later change to the
other squadron's Logic never reaches back into this squadron's published days — it applies from the next
publication; (B) it does reach back and reads pending, as a change to the day's own Logic does today. A is a small,
stated exception to D592 for borrowed men only.

### 24. LOW — Two smaller points of the wording

- Viper is one of 249's six (149's people) on the Close card and a 142 man lent to 149 in Q3, in the same
  subsection. Unless a 142 man may join 149's detachment (question 1, unanswered), one of the two is wrong — the
  kind of slip D2140 names.
- "Undo of Close … must now also withdraw the amendments it published": possible by today's Unpublish (the
  version before becomes current again and its OIL pays). But by then 149's scheduler may have published the home
  days with the six planned on them; Undo would put six men back overseas under 149's published days. Recommended:
  Close is not a step of the Undo button, as a posting is not (D350); "Keep open" is its safety, and the way back
  is a new detachment. To put to him with the Undo round.

---

Totals — sections 1–3 (written blind): 6 HIGH, 7 MEDIUM, 1 LOW. Section 4 (the newest wording): 9 MEDIUM, 1 LOW.
