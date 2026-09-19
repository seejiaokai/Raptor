# ARCH-STACK step 4 — focused check of the owner's clash rules (19–20 Sep 26)

ONE round, owner-requested ("yes focused check"), scoped to the clash catalogue's owner answers, the
main-code order and design §25–§26. Codex (codex-cli 0.154.0, high — verdict REVISE, 12 findings) and
Fable 5.1 (high — APPROVED WITH FIXES, 13 findings) worked independently, read-only. The brief was
`step4-clash-focused-check.md` (session scratchpad). **This file overrides the design and the
catalogue where they differ** (newest wins). No further design round — the rest is caught at the
cross-provider CODE inspection.

## Agreed by both → build rules (host decisions; build-level)

B1. **Several stored records per person/day** (Codex CLASH-001, Fable 1 — both HIGH). The war's stored
leaf becomes a LIST of records, each with its own code, portion (or own times) and state; `war.grid` is
no longer stored — the displayed main code is derived by the agreed order. Variants: **Request**
(`pending|acknowledged|refused`, `code`, `portion`, `shiftedFrom?`, `carried?`, `note?`), **Credit**
(`oil:'auto'|'manual'`, `code: FO|HO`, `note?`, manual `spans?`), **Notice** (B6). Per address at most
one request per portion (a full-day request excludes both halves), one credit, notices unlimited.
`readRecord` validates each entry by variant; a malformed or contradictory list rejects the blob
(reset, don't migrate). Every writer, `records()/capture()/write()`, move, figures reader and the tap
list work per record.

B2. **Courses and overseas duty join the war view** (Codex CLASH-002). One "shows on the war"
predicate = leave ∪ medical ∪ CSE ∪ OD, used by `cellFor`, the index and its signature. CSE/OD remove
their portion from manning and charge no leave.

B3. **Different-type halves are compatible, not a clash** (Codex CLASH-004). `cellFor` returns the main
contribution + the ordered list of every contribution + a conflict flag. Amber only for a genuinely
forbidden or unresolved overlap. Figures charge each contribution its own portion.

B4. **The OIL pass credits worked time beside a non-overlapping absence** (Fable 3). "Never place a
credit on an absence day" is replaced by a TIME test: refuse only when the work overlaps the absence's
time; otherwise the credit is stored beside it. Overlap → no credit, amber `!` (derived, not stored).

B5. **Publishing is an enforcement door** (Codex CLASH-003, Fable 2). Bid replacement by published work
runs INSIDE the publish command (first publish and AL), `lwStore` enlisted, the request removal and its
notice in the same group — so undoing the publish brings the bid back. `runOilPass` never deletes a
request. A bid made after the publish that overlaps published work is refused at the bid door.
Scope of "published work": **OWNER QUESTION A**.

B6. **The replaced-bid notice is its own record** (Codex CLASH-005, Fable 6). Stored in the war's list,
exempt from the occupancy check, skipped by figures/availability. Created only by the replacing
command, only when the LOGIN (not "View as") is not the bid's person. Holds the replaced
code/portion/state, the replacer's type, the actor's frozen label, the envelope seq. Text frozen at
creation; stays through reload, archive and later deletion of the replacer, until "OK, seen" (the
person or an admin — `lw.ackReplacement`), which clears every notice from that same envelope. Undo of
the replacer removes them; redo restores the original actor.

B7. **Every door applies the same rules, including redo** (Fable 8). A hard invariant on the `inputs`
collection (persons named in the envelope): no two leave/medical records of one person overlapping on
the same half, no leave over a medical. A redo that would break it is refused, naming the blocker.

B8. **Hand-typed credit times** (Codex CLASH-008). A manual credit may carry work times; none = the
whole day for overlap checks (owner Q7).

B9. **Canonical main-code order** (Codex CLASH-011). The agreed ladder wins: leave, sick, OIL credit,
OD/CSE, ATT B, undecided bid, refused bid. PO is never a main code (an overlay). Build rule 2's older
text and the first comp's PO cell are stale. Post-out clearing leave alone is NOT amber.

## Host decisions where the reviewers split or left it open (heads-up to the owner)

H1. **Which inputs replace an undecided bid** (Codex CLASH-010 asked the owner; Fable 5). Decided from
the owner's own rules, not a new choice: an input replaces a bid only where it could not sit beside
that leave if it were approved — another leave on the same half, ATT C/HL/OML, and recorded work at
the same time. OD, course (owner Q8: leave allowed during them), ATT B, appointments/meetings/training,
upchit and SANS leave a bid alone. Unacknowledged Duty/Fly requests are not recorded work.

H2. **Medical cuts leave in half-day steps** (Fable 4 portion-level; Codex CLASH-007 exact minutes).
Half-day steps chosen: the war and the balance only know halves, so a minute-level cut would create
leave fragments nothing else can show. A full-day medical removes the day; a half-day medical (the
existing six-hour rule) turns a full leave day into the other half, or removes a same-half leave. The
leave's half-day comes back to the balance.

H3. **Two leaves in the same half are refused even at different times** (Fable 7). Leave vs leave and
leave vs medical are judged by HALVES (a morning is a morning); exact times apply only to leave vs
recorded work (where the owner's "time de-conflicted" words came from). Stops a three-hour morning
charging a full day.

H4. **15-day rule** (Fable 10, Codex CLASH-009): pilots only (today's rule, kept); the run counts days
fully covered by LL/OL — AM LL + PM OL is a full day and continues it; any other leave type or a
half-only day breaks it.

H5. **Filing leave for a posted-out person** (Fable 9, Codex CLASH-012 part): an admin can still pick a
posted-out person on the Inputs form; the box shows the leave code with the PO tag; manning ignores
them. A separate leave-date eligibility check, never a loosened "in squadron".

H6. Small pins (Fable 11–13): requests are per date, so a multi-day bid loses only the clashing dates;
overnight records count on the second date for overlap; leave filed over part of a medical is refused
whole, naming the medical.

## Owner questions (asked 20 Sep 26)

- **A.** Published work replacing a leave bid: weekends and public holidays only (the days that earn
  OIL — recommended), or any published day including ordinary weekdays?
- **B.** A full-day bid when only the morning clashes: remove only the clashing half and keep the
  afternoon bid (recommended — matches "one bid per half"), or replace the whole day?
- **C.** Leave dated before someone's posting-in date: refuse (recommended), or allow? And after
  posting-out: may a member BID clearing leave too (recommended — same as filing), or only have it
  filed?

Owner answers (20 Sep 26):
- **A — recommended:** published work replaces a bid only on weekends and public holidays (the days
  that earn OIL). Weekday work vs an absence stays the schedule's own warning (+ the Q6 amber for
  ATT C/HL/OML).
- **B — recommended:** only the clashing half/dates of a bid are removed; the rest stays with its state.
- **C — CHANGED: leave may be dated BEFORE posting-in and AFTER posting-out** — filed or bid. Shown as
  the leave code (before posting-in the box is otherwise blank; after posting-out it carries the PO
  mark); charged; never counted for manning. A leave-date eligibility check, never a loosened "in
  squadron".
- **H1, H2, H4, H5, H6 — confirmed.**
- **H3 — OVERRULED:** two leaves in the SAME half at times that do NOT overlap are ALLOWED ("LL
  08:00–10:00 and OL 10:30–11:30 is allowed since the timings don't clash … total 3 hours. Half day of
  leave is being deducted"). So: leave vs leave (and leave vs medical) overlap is judged on REAL TIMES
  (a half preset = its whole half; a full day = the whole day); a half of a day is CHARGED ONCE however
  many leave records share it — never two halves for one morning. Which balance pays when the sharing
  records spend different balances: asked (D, below). The 15-day rule reads "is this half covered by
  LL/OL", so a shared morning counts once — unchanged. Display: main code by the ladder, ties inside a
  half by the earlier start time; grey `+n`; the tap list shows each record with its times.
- **D (asked 20 Sep 26):** a half shared by leaves on DIFFERENT balances (e.g. LL 08:00–10:00 + OIL
  10:30–11:30): recommended — the half day comes off the balance of the leave covering more time
  (a tie → the earlier one); the other is shown but charges nothing that half. **Answer: recommended
  (owner, 20 Sep 26).** Owner also confirmed C: a leave dated before posting-in SHOWS on the war as
  the leave code in that otherwise-blank box.
