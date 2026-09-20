# The one-absence model — every behaviour the owner ruled, in plain words (20 Sep 26)

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
  login-to-person map yet.

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

### N4 — leave onto a worked day: allowed when the hours really miss
Filing leave onto a day the person is recorded working is **allowed when the real hours do not
overlap** (work 08:00–10:00, leave 13:00–15:00) and **still refused when they genuinely do**.
*Note the deliberate asymmetry with N2:* work arriving onto leave is allowed and flagged; leave
arriving onto overlapping work is refused. That is the owner's choice and not a defect — work
already recorded is harder evidence, and a person should not be able to claim leave over hours they
are recorded as working, while management publishing work over someone's leave is a real situation
that must be surfaced rather than blocked.
*Already true in code:* the refusal has always compared real hours. What made it behave as a
whole-day block is N5.

### N5 — a hand-typed credit can be given its hours
The credit box gains a **start and end time**, so an admin can record "worked 08:00–10:00". Until
now B8's "a manual credit MAY carry work times" had no door: the field existed and every check read
it, but nothing could write it, so every hand-typed credit meant the whole day and blocked leave
that did not really clash. **Owner: build it now.**
*Settles:* B8, which the register had marked as named by no test, and which both reviewers
independently found MISSING.
