# The one-absence model — every behaviour the owner ruled, in plain words (20 Sep 26)

> **Read `specs/2026-09-20-CURRENT-STATE.md` first.** Decisions in this session changed several
> times; that file is the destination and this one is part of the journey. Where they disagree, that
> one is right.


Why this file exists: the [S4-BUGHUNT] planning step found a bug that two full cross-provider code
inspections had missed, because it was not a coding mistake. The build had taken one ruling (a
medical cuts leave in half-day steps) and used it for a job that ruling never claimed (deciding
whether a medical and a leave clash at all), and a LATER ruling on the same day said that job runs on
real times. Nothing in the code looked wrong; the rules had drifted apart and nobody held them up
against each other.

So this is the register: **one line per behaviour the owner actually ruled**, in the words the app
uses, with the rule's own id so a test can name it, and an honest note where **no test names it**.
"No test names it" does not mean untested — it means nothing in the suite points at that ruling, so
if the ruling changes, nothing fails. That is the gap the medical bug lived in.

Source documents, in precedence order (newest wins):
1. `specs/2026-09-20-arch-stack-4-clash-check.md` — B1–B9, H1–H6, owner answers A–D.
2. This file's §7 — the 20 Sep ruling on medical times, which narrows H2.
3. `specs/2026-09-19-arch-stack-4-clash-catalogue.md` — the owner rule and answers Q1–Q15.
4. `specs/2026-09-19-arch-stack-4-one-absence-design.md` — the design.

`[no test names it]` marks a ruling nothing in the suite cites by id.

## 1. What a day can hold

- **B1** — One person, one day can hold several records at once, each with its own code, its part of
  the day and its own state. The box shows one of them; the rest sit behind a grey count.
- **B3** — Two records covering different parts of the day sit side by side. That is not a clash and
  it never goes amber. Each one is charged its own part. `[no test names it]`
- **Ladder** — What the box shows, top first: leave · off sick · OIL earned · away on duty or a
  course · ATT B · an undecided bid · a refused bid. A notice is never the box. Between two at the
  same level, a full day beats a half, and between two halves the earlier start shows.
- **Mark** — A grey `+n` counts the other records. An amber `!` replaces it whenever something on the
  day needs an admin to look.
- **B2** — Courses and overseas duty show on the war, taken off manning, and cost no leave.
- **Q8** — Leave is allowed during a course or overseas duty. The leave shows as the box and is
  charged; the course sits behind the count.

## 2. When two things clash

- **B7** — The same rules apply at every door: the Inputs page, the calendar, reassign, the war's own
  gestures, and redo. No two of one person's leaves or medicals may overlap, and no leave may sit over
  a medical. A refusal refuses the whole thing and names what is in the way.
- **H3, as overruled by the owner (20 Sep 26)** — Two leaves in the same half at times that do **not**
  overlap are allowed. Overlap is judged on the **real times**: a half preset means that whole half, a
  full day means the whole day.
- **§7 below** — The same is true of leave against a medical.
- **Owner answer D** — When two leaves share a half, the half is charged **once**, to the one covering
  more of it; a tie goes to the earlier start. The other shows but charges nothing for that half.
- **Back to back is not a clash** — a leave ending 10:00 and another starting 10:00 do not overlap.
  The halves never meet: morning ends 12:00, afternoon starts 12:01.
- **H6** — A record running past midnight counts on the second date too, for clashes. It is shown and
  charged on its own date. Leave filed over part of a medical is refused whole, naming the medical.
- **Q6** — A medical on a day the schedule says the person worked keeps both and goes amber. ATT B
  beside work is fine.

## 3. Medicals

- **H2** — A medical cuts leave in **half-day steps**. A full-day medical removes the leave day; a
  half-day medical turns a full leave day into the other half, or removes a same-half leave. The cut
  leave goes back to the balance.
- **Six-hour rule** — A medical recorded with times counts as half a day at six hours or less, a full
  day past that. Which half: the side of noon it sits on, its midpoint deciding a straddler.
- **§7 below** — but which halves a cut takes is read from the real hours, not from the half the
  six-hour rule draws the medical in.
- **Same type twice** — A second medical of the same type over the same days is refused: edit the
  first one instead and attach the new document to it.
- **Upchit** — An upchit is not work. It never earns OIL, never counts as being at work, never blocks
  leave. It only ends a covering medical early. `[no test names it]`

## 4. Bids

- **Owner rule (19 Sep 26)** — An undecided bid loses to any clashing input, in the same action, and
  the filer is told which bid went. One undo brings it back. An **approved** leave is not touched
  (overlapping leave is refused; a medical still cuts it) and a **refused** bid never blocks anything
  — it stays as history.
- **H1** — An input replaces a bid only where the leave could not have sat beside it if it had been
  approved: another leave on the same time, ATT C / HL / OML, and recorded work at the same time.
  Overseas duty, a course, ATT B, appointments, meetings, training, upchit and SANS leave a bid alone.
  An unacknowledged Duty or Fly request is not recorded work.
- **Owner answer B** — Only the clashing half or dates of a bid are removed. The rest keeps its state.
- **B6** — When someone else's action replaces a bid, a notice sits on that day with an amber mark
  until the person or an admin taps "OK, seen". Its wording is frozen when it is made, it survives a
  reload and the later deletion of whatever replaced it, and undo of the replacer removes it. When the
  person replaces their own bid there is no notice, only a message to them.
- **B5** — Publishing is a door: bid replacement happens inside the publish, so undoing the publish
  brings the bid back. The OIL pass never deletes a bid.
- **Owner answer A** — Published work replaces a bid only on weekends and public holidays. Weekday
  work against an absence stays a warning on the schedule.
- **Q2** — A member may bid each half separately, and may bid the free half beside filed leave.
  `[no test names it]`

## 5. Money — balances, manning and the long-run rule

- **Figures read the records, never the box.** Every balance, every total and the manning verdict
  count what is actually on the day, not the one code on display.
- **Q1** — Two half-day leaves of different types on one day both come off their own balances.
- **H4 / Q13** — The 15-day rule is for pilots only, and only for LL and OL. Once a run of LL/OL
  reaches 15 days in a row, the weekends and public holidays inside it are charged too. A day covered
  morning-LL and afternoon-OL is a full day and continues the run. Any other leave type, or a
  half-covered day, breaks it.
- **Q9, as changed, and owner answer C** — Leave may be dated **before** someone's posting-in and
  **after** their posting-out, filed or bid. It shows as the leave code, it is charged, and it is
  never counted for manning. After posting-out the box carries the PO mark; before posting-in the box
  is otherwise blank. `[no test names the Q9 form; owner answer C is named]`
- **Q10** — Per-year balances and carry-over are deliberately not built. One running balance per
  person. Parked as `[LEAVE-YEAR]`.

## 6. OIL

- **B4** — A worked day beside an absence earns its credit as long as the **times** do not overlap. If
  they do overlap there is no credit and the day goes amber.
- **B8 / Q7** — A hand-typed credit may carry work times. With **no** times it means the whole day, so
  leave anywhere that day is refused. `[no test names B8]`
- **The ask** — A duty covering a weekend or public holiday is never credited silently. The person is
  asked before anything is written, and the answer is part of the same action, so one undo takes both.
  An unanswered day credits nothing.
- **Q15** — A SANS offer is never work: it never earns OIL and never counts as worked for the
  time-overlap rules. A SANS offer on a leave day is a warning only. `[no test names it]`

## 7. Medical times — the ruling of 20 Sep 26 (this hunt)

Put to the owner during the [S4-BUGHUNT] planning step, because H2 and the H3 overrule had been read
as one rule and are two:

> A medical recorded 08:00–10:00, and leave from 10:30–11:30 the same morning — allow both?
> **Owner: "Allow both — judge on real times."**

So, exactly:

- A medical's **real hours** decide every clash and every bid replacement. Leave that does not overlap
  those hours is allowed, whichever was filed first, and is never cut.
- A medical's **half**, by the six-hour rule, decides what the box shows, what manning removes and
  what the medical total counts. Unchanged.
- **Which halves a cut takes is read from the real hours too.** A five-hour medical from 09:00 to
  14:00 is drawn as a morning, but its hours run into the afternoon, so the whole leave day goes. The
  step size is still half-days — the app never leaves a leave with a two-hour hole in it.
- This narrows **H2**: H2 governs the step size of a cut, and nothing else. It does not decide whether
  a medical and a leave meet.

## 8. The rest

- **Q11** — Moving a bid from one war into the next is refused. `[no test names it]`
- **Q12** — Leave on a "no leave" day is a warning only, and an admin may still approve it.
  `[no test names it]`
- **Q14** — A member may file leave on the Inputs page for any date, even when the war is closed or
  outside the bidding window, and it counts as already approved with no admin step. `[no test names it]`
- **Deliberate, not bugs** — one undecided plus one refused request may share a half; windows that
  only touch do not clash; a notice says "(an admin)" rather than a name, because there is no
  login-to-person map yet. *(That last one SET ASIDE 26 Sep 26 by D166: the notice names who did it by
  callsign — §11.)*

## 9. What nothing points at

Rulings no test names by id, so nothing would fail if they silently changed:

**B3 · B8 · Q2 · Q9 · Q11 · Q12 · Q14 · Q15 · the upchit side-note**

`scripts/rulecheck.mjs` prints this list and fails when it grows. Two of them — **B8** (hand-typed
credit times) and **B3** (different parts of the day sitting side by side) — are already in the
[S4-BUGHUNT] plan's batch A and F, so they get named tests in this hunt.

## 10. Rulings made DURING this hunt (20 Sep 26) — newest, and they win

Five rulings the owner gave while the [S4-BUGHUNT] sweeps were running. Each names what it sets
aside. These are the LATEST word and beat anything above them.

### N1 — noon belongs to the afternoon
Leave recorded as starting at exactly **12:00** is the **afternoon**: half a day of balance, half a
person off the manning count. A window that ENDS at 12:00 is still a morning, and both half presets
are untouched.
*Sets aside:* nothing written — the app simply answered two ways about that minute. The clash test
said it was not the morning; the box, the charge and the manning count said it was, so a two-hour
afternoon cost a whole day. **BUILT** (`9e5cf94`).

### N2 — work and an absence on the same hours: the credit LANDS
> Owner: "If someone is working, even tho they have leave on that day. It should still bank the OIL
> credit. Until that thing is resolved — which means that if work is removed, then no OIL credit. If
> leave is removed then OIL still credits."

So when work and an absence cover the same hours: the **credit is created**, the day carries the
**amber mark**, the warning list names it, and it **stays banked until someone resolves it**. Remove
the work → the credit goes. Remove the leave → the credit stays.
*Sets aside:* **B4's "Overlap → no credit"**, which is now wrong. B4's time test itself stands — the
credit only clashes when the hours really meet.
*Also sets aside:* the fix made earlier the same day that deleted a stale credit on a clash. Under
N2 there is no refusal, so the pass simply writes the credit with its current hours and the stale
one is overwritten — the original defect (a credit showing hours nobody worked) is still fixed, by a
simpler route.

### N3 — an acknowledged duty replaces the person's own undecided bid
When someone files a duty on a weekend or public holiday and answers **"yes, this earns OIL"**, the
clashing part of their own undecided leave **bid on that day is removed in the same action**, exactly
as publishing the schedule over it would, and they are told. Someone else filing it for them leaves
the notice with its amber mark until "OK, seen".
*Settles:* H1's "recorded work at the same time". The two reviewers disagreed on whether an
acknowledged input counted; the owner says it does.

### N4 — leave onto a worked day: FLAGGED, not refused

**SUPERSEDED THE SAME DAY by the owner, and this entry is corrected rather than
deleted so the reversal is readable.** N4 was first recorded as "allowed when the real hours miss,
refused when they meet", with the asymmetry against N2 called deliberate. The owner then reversed
it on the app's own doctrine:

> "Does making a hard refusal be a bit contradicting to what I'm allowing for the schedule?
> Currently on the schedule if there's a clash I still allow planning but there is just flagging."

So: filing leave onto a day the person is recorded working is **written**, the day goes **amber**,
and the filer is told in the same breath. There is no asymmetry between the two directions at the
Inputs door any more — which was the point.

**SETTLED — this paragraph used to say the war's doors were untouched and the question was open.
Both halves are now false, and the text is corrected rather than deleted so the sequence stays
readable.** The owner was asked and overruled B5 in BOTH its halves:

| Door | Leave over recorded work |
|---|---|
| The Inputs page (filing) | **Filed and flagged** |
| The war's bid door | **Filed and flagged** — B5's first half set aside, one predicate `barsWrite` |
| The war's approve / move doors | **Filed and flagged** — the same predicate, so they cannot drift |
| Publishing, over an undecided bid | **Kept and flagged** — B5's SECOND half set aside (see N9) |

There is no asymmetry left: the same two facts get the same answer whichever screen they arrive
from and whichever came first.

### N5 — a hand-typed credit can be given its hours
The credit box gains a **start and end time**, so an admin can record "worked 08:00–10:00". Until
now B8's "a manual credit MAY carry work times" had no door: the field existed and every check read
it, but nothing could write it, so every hand-typed credit meant the whole day and blocked leave
that did not really clash. **Owner: build it now.**
*Settles:* B8, which the register had marked as named by no test, and which both reviewers
independently found MISSING.

### N6 — a day counts as a full annual day when leave TOUCHES both halves
Put to the owner because the plain-language rule said "covered all day" while the app has always
said "touches both halves": LL 08:00–10:00 plus OL 14:00–16:00 is charged as a full day, removes a
whole man from manning, and continues a pilot's 15-day run, with four hours in the middle
uncovered. **Owner: leave it as it is.** The app counts leave in HALVES — each of those records
costs half a day, and half plus half is a day — so the current reading is the halves model applied
consistently, not a bug. Nothing in the app changed; the plain-language wording was corrected to
say "touches".
*Settles:* H4 / owner Q13's `annualFull`, and the `dayview` test that pins it.

### N7 — there is a POST IN date, and it is set by hand
> "We need a post in button just like post out."

The app had no joining date at all. `Person.from` existed and every manning path already read it,
but nothing ever wrote it — the Raptor roster has no joining date to give — so every person read as
having always been here. `setPostIn` is the mirror of `setPostOut`, in the same sheet family and
the same stored record. Both ends now refuse a window that CLOSES before it opens.
*Settles:* the missing half of the squadron window. It also gives owner answer C something to stand
on: there were no pre-joining days to bid on before, because nobody had a joining date.

### N8 — the posting dates are OFFICIAL, and they gate NOTHING
> "Because those dates are official dates. But they can be for e.g still taking leave after or
> before they post in or out."

So the two dates decide MANNING and the grey hatch, and nothing else. A record dated outside them is
allowed, shown and charged exactly as one inside them; the person's ROW stretches to reach it
(a display span only — the dates themselves never move, or a posted-out man would be back in the
manning counts). Setting a posting date must never become a way of refusing a record.
*Settles:* CURRENT-STATE item B, and the five sub-questions of Q2 — the row reaches anything the war
SHOWS, which excludes only the hidden tail of a record running past midnight, since that is never
shown or charged on the second date.

### N9 — publishing FLAGS an undecided bid; it no longer takes it
Publishing a weekend or PH day used to remove the clashing part of an undecided leave bid and leave
a "the schedule took your bid" notice — while a bid placed AFTER the publish was kept and flagged.
The same two facts, opposite outcomes, decided only by which came first. **Owner: "keep the bid and
flag the day, both ways."**
*Settles:* the second half of B5. The amber needs no new machinery — the OIL credit lands on the day
regardless and a credit overlapping an undecided bid is already a forbidden pair — so the door now
only TELLS the admin at the moment of publishing. With nothing removed there is nothing for an undo
of the publish to bring back.

### N10 — a member is told what a clash means for HIS OWN leave
The sheet behind the amber mark listed every record all along, but its one explanatory line was
written for an admin — "an admin needs to change one" — whoever opened it. On a member's own day
that is the wrong news: his box shows the OIL credit with his bid behind the mark, so the day reads
as though his leave had been thrown out, when since N4 it is still live. The line now names his own
live bids and says so; an admin still gets the instruction, because for him it is one.
*Settles:* CURRENT-STATE item A, and with it the reason the duty-cancels-your-bid feature was
parked — telling the man was the cheap half of that problem.

### N11 — an admin can RECORD that someone worked, on ANY day (DECISIONS D79)
*(What a credited day says when clicked — reason, given by, days; the app's own credits too, and in the OIL tracker —
built in PRs #422/#423, 21 Sep 26: backlog item `[LW-OIL-DETAIL]`, archived 24 Sep 26; `raptor-port/docs/ui-contracts.md`.)*
> "Should we have an option for admin to put FO HO with the ability to input reason, given by.
> Similar to oil tracker" — and: "the admin can also credit OIL on the leave sheet for convenience.
> We should enable that even on any day."

B8 gave a hand-typed credit its hours and N5 built the box for them; neither noticed that **nothing
in the app could create a hand-typed credit at all**. The only writers were the automatic pass and
the demo seed, so the reason editor, the hours box and the hand-back machinery could only ever
reach credits nobody was able to type. The door now takes the code, the reason, who said so and the
hours as ONE command.

*Settles:* B8 completely, and the assumption — never a ruling — that OIL is only earned on a weekend
or a public holiday. That restriction is the AUTOMATIC pass's, because it reads the published
schedule. A credit the squadron types has no schedule behind it, which is exactly why it names a
reason and a person, and it moves the balance on any day.

### N12 — an admin can place leave or OIL on a day outside the posting dates
> "We should also allow putting inputs when we click on days that were posted out."

N8 already made this the rule and it was already true in three of four places: the Inputs page takes
any date, the person's own tap on their own day opens the bid sheet, and a day out there that
already holds leave opens its record list. The fourth — an admin tapping a BLANK day out there —
was taken by the posting sheet, which is right nine times out of ten and left him no way to file the
clearing leave that made him open the day. One button through, for that cell only.
*Settles:* the last asymmetry in N8.

### N13 — an OIL AWARD owes a man a day; it does not say he was at work (DECISIONS D80)
> "i want an award of an OIL to stop flagging a leave day. That makes sense." — and, later the
> same night: "OIL that is credited should just be as simple as he is credited OIL. It shouldn't
> by default take him as on duty. Affecting the manning present count … It also makes him
> available to work if he has nothing else that day planned … But if i add like FO or HO on the
> leave war or the oil tracker it shouldn't be counting that person as working by default unless
> its stated in the input or the schedule."

Two kinds of OIL credit now behave differently, and the line between them is WHO SAYS HE WAS AT
WORK. A credit the app earned off the PUBLISHED SCHEDULE (`auto`) says he was: it still flags a
leave day, it still stands him down from flying, and it still counts him in the duty manning.
A credit a person TYPED (an award) says only that he is OWED a day: it flags nothing, stands him
down from nothing, and with an empty day he is available to work.

Measured consequence, and the reason the duty half needed its own ruling: exempting the amber alone
moved nine tests; the duty half moved eight more, all manning figures. One of them is visible on
first run — 3 January leaves the under-manned list, because RAMP's hand-typed FO was reddening the
day by standing the only SXO down.

*Settles:* B4's last assumption that a credit is evidence of attendance whoever entered it. *Leaves
untouched:* the automatic pass — weekend and public-holiday work credits exactly as before.
*Reverses nothing:* N11's "an admin may credit OIL on any day" is what makes the distinction
necessary, not what it overturns.

### N14 — a worked day that earns nobody anything says so (DECISIONS D81)
> "Yes i want a warning." … "I would also like u to give the warning On the day itself, while
> you're building it And At the moment you publish."

He put a man on the SDO desk for a Sunday, published the day, and no OIL appeared. The desk had no
start and no end time, so it measured nothing and minted nothing — correct, because money must not
come from a guess, and completely silent. A man's leave balance was short and no screen admitted it.

The day's own warning strip now names the desk while the day is being built, which is where the fix
is free; the publish moment says it again as a backstop. Weekends and public holidays only — they
are the only days that earn OIL at all, so a blank desk on a Tuesday is ordinary and says nothing.
An empty desk says nothing either: an empty desk owes no one.

*Settles:* the silent half of the rule in `engine/oil.ts` that "a row with no readable times earns
nothing". The rule is unchanged; the app simply stopped keeping it to itself.

### N15 — one window for an input, in every stage
*(Built in PR #422, 21 Sep 26 — backlog item `[LW-UI-WINDOW]`, archived 24 Sep 26.)*
> "Can u change the term Pending to Ack (which is Acknowledged). When i click on an input in the
> leave war, it should also allow me to Have the buttons Ack, Approve, Refuse and Move … enable it
> in all Stage on leave war … Try to keep the window the same size and squeeze the extra info and
> buttons into it."

The decision used to live on a SEPARATE sheet that opened only once bidding had closed, so the same
input answered to different controls depending on which day of the cycle you clicked it, and moving
one man's one day took a drag-select. The four answers — Ack, Approve, Refuse, Move — now sit on
one row at the top of the day window, above what was asked for, in every stage the war runs in.

*Reverses:* his own 27 Aug 26 naming of that button as "Pending" (the stored state token is
untouched — still `acknowledged`), and the design rule that decisions wait for bidding to close.
That rule was never about permission: an admin could always close the stage, decide, and reopen it.
*Leaves untouched, and it is his own exception:* an input APPROVED and PUBLISHED offers remarks and
nothing else — to change it an admin reopens the war. One not yet approved stays fully editable.


### N16 — an award and a worked day ADD UP (21 Sep 26; DECISIONS D82)
> "Yes an award and a worked day add up. So it's 4. The auto oil credits don't get affected by
> manual OIL inputs."

*The ruling as first given, and the reasoning before it was built (PR #423): backlog `[OIL-AWARD-ADD-RULING]`, in
`OUTSTANDING-ARCHIVE.md` since 24 Sep 26.*

A 3-day award on a Saturday the man then works is worth **four** — the award's three plus the
day's one. The two are INDEPENDENT: what the published schedule earns is never changed by what a
person typed, and what a person typed is never changed by the schedule.

So a person/date now holds **one earned credit and one award, side by side**, each keeping its own
worth, reason and giver. It was one record, and the schedule TOOK AN AWARD OVER when it earned one,
stashing the award in a snapshot for the unpublish hand-back. Two records make that machinery
unnecessary and it retires — which matters, because the snapshot is where both of the silent
balance bugs of 20–21 Sep lived.

The box still shows ONE code: the app's own, with the award behind the `+1` mark. That is not
cosmetic — the top record is what makes the cell read as owned by the schedule, which is what locks
it.

*Reverses:* the 21 Sep holding position that a day carrying both is worth the LARGER of the two.
That was only ever the safe reading of a defect, pending this decision.
*Settles:* the refusal "That day already earns OIL from the published schedule", which under this
ruling was the app declining to record a fact the owner has ruled is separate.
*Leaves untouched:* N13 entirely. An award still flags nothing, stands nobody down and counts
nobody on duty; the earned credit still does all three. The weekend / public-holiday restriction
still belongs to the AUTOMATIC pass alone (N11).
*Consequence, and it was already live:* the Inputs page told a filer "X is recorded as working on
that day — this leave is filed anyway and flagged for someone to resolve" for ANY credit, award
included. Under N13 neither half is true of an award: nothing flags it and there is nothing to
resolve. That note now fires only for a credit the schedule earned.

### N17 — the manning counts BODIES; only a planned absence takes one away (21 Sep 26)
> "you dont need to take him off the manning. The planner only needs to know if this current day
> can be fulfilled with the amount of manpower they have as a whole. Doesnt make sense that after
> the admin plans a day and leave war manning starts to become red, which is weird."

and, asked whether the duty-desk half of N13 should go with it:

> "Dont need that gone. The manning should only reduce if they are like planned by things like
> leave, duty & commitments."

An OIL credit no longer takes a man out of the manning. Publishing a day used to drop him to zero
available, so the Leave War went red as a direct consequence of the admin planning it — the count
answered "who can fly" while the admin was asking "have we the people". It answers the second
question now, and only LEAVE and a duty-and-commitments input reduce it.

Both reading paths moved together — the one off the day's records and the one off a bare grid —
because a manning figure that changed depending on which one answered is the drift seam the house
rules name. The presence branch inside the day counts collapsed into availability, since the two
are now the same answer.

*Narrows:* N13's duty half, which said an earned credit "stands him down from flying and counts him
in the duty manning". Only the standing-down went. *Leaves untouched, and it is his own exception:*
the DUTY LINE still counts a credited man, which is what tells an admin the desk is covered.
*Leaves untouched:* everything about flying eligibility on the schedule itself — this is the Leave
War's manning picture, not the crew picker.

### N18 — a clash note holds long enough to read, and looks like a warning (21 Sep 26)
> "the inputs bubble warning timing is abit too short as well to read it. Maybe increase the timing
> abit if conflicts are recognised."

The clash notes went out on the plain face — the one used for "Saved" — and held for 2.6 seconds.
They are whole sentences, and several can arrive joined end to end, so the more there was to read
the less time there was to read it. They are AMBER now, which is what they always were, and the
hold grows with the message: the old time as a floor, reading time on top, capped at twelve seconds
so a runaway message cannot park a toast on screen.

*Context he gave for it, worth keeping:* "even if the leave war is published, it's still a live
current view of all the inputs and forecast … having the multiple guard rails that if the person
works on a weekend and attempts to take a leave is a bonus to tell the admin or member to correct
an error." The warnings are a FEATURE, not noise — which is why the answer was to make them
readable rather than fewer.

### N19 — an award is ONE number, and it comes in halves (21 Sep 26)
> "this is confusing, the number of days when u click on HO. Any recommendation on how to present
> this correctly? Should we just have number of days to input? Then it shows HO or FO as require
> based on what was input?"

and, after one round of getting it wrong:

> "For any type of leave, be it on the inputs or oil tracker or leave war or oil credits it should
> always round off … This is to prevent bugs and calculation of the leave balances easier."
> — "So put a guard rail to make sure that only 0.5 multiples can be input just like the oil
> tracker"

**ONE CONTROL.** The sheet had TWO for one fact: an FO / HO pair, which already mean a day and half
a day, and a days box, which also means a quantity. So "HO" beside a "1" read as nonsense, and every
attempt to rank one over the other produced a different surprise.

For an AWARD the code is now only a LABEL — it is what the grid square shows and nothing else,
because the worth comes from the quantity and an award clashes with nothing, stands nobody down and
moves no manning (N13, N16, N17). So **the quantity is the fact and the code follows it**: under a
day reads HO, a day or more reads FO, and the one button says which before it is pressed.

**HALVES, AND IT IS A GUARD RAIL.** A half day is the smallest thing the grid ever CHARGES, so an
odd quantity can never be drawn down cleanly — a remainder under a half strands in the balance and
every figure that touches it carries a fraction nobody can spend. Refused, **not silently
corrected**: he asked for a guard rail, and a number quietly changed after it was typed is the very
thing this session spent two days removing.

*Restores and extends:* his 6 Sep 26 "days come in halves — one rule for every pool". The war's
award had escaped it and worded its own refusal; there is now ONE rule and ONE sentence across the
war's award, the OIL tracker's grant, a correction and every other leave type. Two sentences for one
rule drift apart the moment one is edited.
*Withdraws:* his own ask earlier the same day that an odd number be ACCEPTED — reversed by him
within the hour, once the cost was put to him.
*Leaves untouched:* the Inputs page, where leave is whole or half days by construction with no
quantity to type; and the AUTOMATIC credit, where the published schedule still decides FO or HO by
the six-hour rule.

## 11. Rulings since the hunt (21–26 Sep 26) — what they did to an absence

Added 26 Sep 26 by the absence-record re-test (`[HUMAN-RETEST]` with `[S4-HUNT-REST]`; the plan
`plans/2026-09-26-absence-retest-plan.md` §3). The rules sweep's output: each later ruling that reaches an
absence, in the words the app uses. Newest wins (D90); where one changes a line above, that line is named.

- **D79–D82 (recorded 23 Sep 26)** — the ids for N11, N13, N14, N16 above. Nothing new.
- **D142 (24 Sep 26)** — a day's OIL comes from its LATEST published version, however long ago: an AL that takes a
  man off a worked weekend takes his credit with it (and with it the amber on a leave beside that work, N2).
- **D163 (24 Sep 26)** — two demo oddities (awards dated after the demo week; a man flying in July though posted out
  in January) are demo data only. Not findings.
- **D166 (25 Sep 26; built 26 Sep in `[ACCOUNTS]`)** — the war follows the SIGNED-IN callsign, not "View as" (gone):
  a member bids, files and clears only on HIS own row; whose bid was replaced is decided by the signed-in person, so
  a notice now names who did it BY CALLSIGN. **Sets aside §8's "a notice says (an admin) rather than a name"** — the
  login-to-person map exists now (`leavewar/inputgate.ts replaceBids`).
- **D174, D176 (25 Sep 26)** — a request filed on a published day since it was published, then taken off or
  deleted, reads nothing pending.
- **D177, D178, D179 (25 Sep 26), D185 (26 Sep 26)** — every input change after a day is published — filed, edited,
  deleted, moved, from any door — reads "1 pending" on the admin's working copy and drops the four sign-offs; the
  published face (View-only Sched, the issued version) keeps what it went out with until the next AL. **A medical
  downchit freezes too** (D179, D185) — D177's own reading that it "stays live" is set aside, marked in its row.
  Taking a late input back out reads 0 (D98).
- **D189 (26 Sep 26)** — stretching or trimming a leave or a downchit rewrites its "till <date>" remark, and each
  published day it still covers reads pending for that reason.
- **D103 (25 Sep 26)** — any change that shows as pending on a published day wipes the sign-offs.
- **D211, D213, D215 (26 Sep 26)** — every member sees a medical input's type, remarks and documents; a guest sees a
  medical row on View-only Sched as a member does, read only.
- **D148 (24 Sep 26)** — undo reverses only your own changes. DECIDED, NOT BUILT: the change-recording re-test's.
- **`[PUB-UNAVAIL]` (19 Sep 26, filed)** — "a new absence silently changes a published day's Unavailable list" is
  what D177–D179 built against (`[LEAVE-LATE-PUBLISHED]`, PR #438). The re-test confirms it on screen before the
  item is archived.
- **N5 / B8 (the hours on a hand-typed credit)** — no longer live. N13 (the same night) left an award nothing to clash
  with and N19 (21 Sep) made it ONE number in halves; the build took the hours box away with them (the bid sheet's award
  asks a quantity, a reason and a giver only — `leavewar/ui/BidPicker.tsx`). Found by Astra's plan read (26 Sep 26).
  Not a finding; the re-test does not test it as live.
