# [S4-BUGHUNT] — the RULES-FIRST red team's findings, merged (20 Sep 26)

> **Read `specs/2026-09-20-CURRENT-STATE.md` first.** Decisions in this session changed several
> times; that file is the destination and this one is part of the journey. Where they disagree, that
> one is right.


The first run of the standing rules-first sweep (`briefs/rules-first-red-team.md`), against
`specs/2026-09-20-one-absence-behaviour-register.md`. Fable 5.1 (high) and Codex 0.154.0 (high),
independently, read-only, same brief. Fable returned 9 findings and marked 28 rulings MATCHES;
Codex returned 8 and marked 29.

**This sweep found things two full code inspections and 5103 green tests did not.** Five findings
were reached by BOTH providers independently — the strongest signal in the set. Four of the twelve
are the same shape as the defect that prompted the sweep: **an earlier ruling still running after a
later one replaced it**, with the superseded reasoning still sitting in the code comment beside it.

## Reached by BOTH providers

### R1 — an overnight medical dropped its next-day tail (H6) · **FIXED**
Leave, courses and overseas duty all carried the past-midnight tail onto the second date; the
medical branch returned none. An HL filed 20:00–02:00 put nothing on the next day, so the next
morning's leave went straight over the hours the person was off sick — or, filed first, was never
cut. Fixed on this branch (`aa10858`), three tests, two confirmed red against the previous code.

### R2 — a hand-typed credit cannot be given work times (B8) · MISSING
B8 says "a manual credit **may** carry work times; none = the whole day". The record field exists
and every overlap test reads it correctly, but **nothing can write it**: the only writer is the
automatic OIL pass. An admin typing FO or HO gets a whole-day credit and no way to say which hours.
*Consequence:* every hand-typed credit blocks the whole day, so B4's "times do not overlap → allowed"
is unreachable for manual credits, and legal leave is refused. Needs a times field on the credit —
a small build, not a fix. **Owner's call whether to build it now.**

### R3 — a blocked credit leaves no amber on the box (B4, Mark) · DRIFT
B4: "Overlap → no credit, amber `!`". The first half is right. The second is not: because the
credit is never placed, the day has nothing to derive an amber from, so the box shows the leave with
a blank corner. Only the admin-only warning strip knows. A member never sees it.
**Worse, found by Fable:** the outcome depends on entry order. Medical first, then the work → no
credit, no amber. Work first, then the medical → both records kept, amber shown, **and the person
banks the OIL for hours they were off sick**. Same facts, two different balances. See question 2.

### R4 — leave outside someone's posting window (owner answer C, 20 Sep) · STALE, two ways
Answer C says leave may be dated before posting-in and after posting-out, **filed or bid**, shown in
the box, charged, never counted for manning. Two August rules still override it:
- *Codex:* the whole **row disappears** from the grid once the visible months move past the posting
  window (`rowInWindow`, owner 19 Aug: "once I hit the next month the row disappears"). Someone
  posted out in January with clearing leave in September is **charged for that leave and cannot be
  seen**. The box and the money disagree.
- *Both:* a blank **pre-posting-in cell cannot be tapped** (`actionable` excludes `notYetArrived`),
  with the pre-answer-C reasoning still in the comment beside it. Filing on the Inputs page works;
  the "or bid" half of answer C does not.

### R5 — a SANS offer over leave warns nobody (Q15) · MISSING
Q15: "a SANS offer on a leave day is a warning only". Everything else about Q15 is right — it is
never work, never earns OIL, never reaches the war. But the warning does not exist: the offer saves
silently over the person's own leave. Low consequence, trivially true.

## Found by one provider

### R6 — an acknowledged duty never replaces a bid (H1) · Fable MISSING / Codex MATCHES
**The two providers disagree, so this is a question, not a finding.** H1 lists "recorded work at the
same time" among the things that replace an undecided bid, and adds that an *unacknowledged* duty
request is not recorded work — which only means something if an acknowledged one is. Nothing does
this job today. Codex read H1 as satisfied, on answer A's wording ("published work"). See question 1.

### R7 — the free half beside Inputs-filed leave cannot be bid from the cell (Q2) · Fable DRIFT
Q2 allows bidding the free half beside filed leave. The store allows it. But tapping a day whose
leave came from the Inputs page opens the read-only "approved on the Inputs page" sheet instead of
the bid picker, so the only way to reach the rule is a drag-fill nobody would think to use. Most
leave arrives through the Inputs page, so this is the common case.

### R8 — a leave starting at exactly 12:00 costs a whole day · Fable DRIFT
The minute 12:00 is treated as "not overlapping the morning" when clashes are judged, but as
"touching the morning" when the day is charged and manning is counted. So `OL` 12:00–14:00 shows as
a full day, costs a full day of balance and removes a whole person from manning — while a morning
bid on the same day would still be allowed beside it. See question 3.

### R9 — a publish replacement freezes no actor (B6) · Codex DRIFT, medium
B6 says the notice holds "the actor's frozen label". An Inputs-page replacement freezes "an admin"
or the member's callsign; a **publish** replacement freezes an empty actor, so the notice reads
"replaced by the published schedule" with nobody named. Arguably intended — the schedule may be the
whole actor. Low.

### R10 — weekday work never reaches the war, so Q6's amber cannot happen there · Codex DRIFT
Q6 wants a medical on a worked day to keep both and go amber. The war only ever learns about work
that became an OIL credit, and that only happens on weekends and public holidays (answer A). On an
ordinary weekday the war holds only the medical, with no mark. Consistent with answer A confining
the war to the days that earn OIL; noted rather than filed.

### R11 — undo/redo is not checked against recorded work (B7) · Fable DRIFT, low
The restore path runs the invariant with the recorded-work half switched off, so a redo could in
principle put leave back over a credit's hours. Hard to reach in practice — a credit that landed
because of a command folds into that command's undo — but the flag is off deliberately and the
reason no longer holds.

## Where the two disagreed, and what that means

| Ruling | Fable | Codex | Reading |
|---|---|---|---|
| H1 | MISSING | MATCHES | A real ambiguity in the rule → **question 1** |
| Q2 | DRIFT | MATCHES | Fable read the screen, Codex the store. Fable is right: the store allows it, the tap does not. Verified. |
| H5 / answer C | MATCHES | STALE | Codex found the disappearing row; Fable found the untappable cell. Both real, different halves. Verified. |
| Back to back | DRIFT | MATCHES | Fable's 12:00 case is a genuine two-function disagreement → **question 3** |
| B6 | MATCHES | DRIFT | Codex's reading is stricter. Low either way. |

Where they disagree, one of them has usually read a different surface. Neither was wrong about what
it read; the merge is what makes the pair worth running.

## The three questions for the owner

1. **Acknowledged duty vs a bid.** When someone files a Saturday duty and answers "yes, this earns
   OIL", should that take their own undecided leave bid off that Saturday — the way publishing the
   schedule does? Today nothing happens: the bid stays, the credit is blocked, and only the admin's
   warning list shows it.
2. **The amber when work and an absence share hours.** Should the day itself carry the amber mark,
   or is the admin's warning list enough? And separately: today, if the credit arrived first, the
   person keeps the OIL for hours they were off sick. That looks wrong under any reading.
3. **A leave starting at exactly 12:00.** Morning or afternoon? Today it costs a whole day of
   balance and removes a whole person from manning.

## Status

| # | Ruling | Kind | State |
|---|---|---|---|
| R1 | H6 | DRIFT | **FIXED** `aa10858` |
| R2 | B8 | MISSING | needs a small build — owner's call |
| R3 | B4 / Mark | DRIFT | question 2 |
| R4 | answer C | STALE ×2 | clear fix, both halves |
| R5 | Q15 | MISSING | clear fix |
| R6 | H1 | disputed | question 1 |
| R7 | Q2 | DRIFT | clear fix |
| R8 | 12:00 | DRIFT | question 3 |
| R9 | B6 | DRIFT | low, park |
| R10 | Q6 | DRIFT | by design, noted |
| R11 | B7 | DRIFT | low, clear fix |
