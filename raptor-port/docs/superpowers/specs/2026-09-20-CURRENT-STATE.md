# [S4-BUGHUNT] — THE CURRENT STATE. Read this first. (20 Sep 26)

**This file wins over every other document dated 20 Sep 26.** The decisions below changed several
times in one session, and the other files record the journey rather than the destination. Where any
of them disagrees with this one, this one is right and the other is history.

Branch `claude/s4-bughunt`, off `main` at `e904d44`. Nothing merged.

## The one rule everything comes from

> **Two different facts fighting → let both in, and flag the day.
> The same fact twice → refuse it, and say what is in the way.**

Owner's own words for it, 20 Sep 26. Every decision below is that sentence applied.

---

## 1. BUILT and green on this branch

| # | What it does now | Commit |
|---|---|---|
| 1 | A medical's **real hours** decide every clash and every bid replacement. Its six-hour half still drives the box, manning and the medical total. | `28e230f` |
| 2 | A cut leaves the leave **the hours the medical does not cover** — a 09:00–14:00 medical leaves leave from 14:00. | `c47d3cf` |
| 3 | A medical past midnight **counts on the next day** too, for clashes only. | `aa10858` |
| 4 | Leave starting at exactly **12:00 is the afternoon** — half a day, half a man. | `9e5cf94` |
| 5 | An OIL credit **always lands**, even over leave. The day goes amber; it is banked until resolved. A credit can no longer outlive the hours that earned it. | `ee22b89` |
| 6 | Leave over recorded work is **filed and flagged**, not refused, on the Inputs page. | `ee22b89` |
| 7 | Recorded work **never bars a write anywhere** — bid, approve, move, all four doors. One predicate, `barsWrite`. | `fe378f0` |
| 8 | A refused bid **says why**, at every door it can be refused at. | `9644471` |
| 9 | A **hand-typed credit is never destroyed** — taken over in place, and handed back EXACTLY as the admin typed it (code, hours and reason) when the schedule stops backing it. | `a6e1c64`, `e63d462` |
| 10 | **One** warning list, derived from the day; the work is always the "earns" side. | `ee22b89` |

Process, also built: the **behaviour register**, `npm run rulecheck` (fails when a ruling has no
test naming it), and the **rules-first red team** as a standing third review.

| 11 | **A man on leave no longer mans a duty weekend.** A credit on a leave day was counting him fully present and on duty. | `ca6b4ff` |

Process, also built: see below.

**Gates at the last full run:** unit 321 files / 5128 tests green · `tfin` 728/0 · rulecheck OK.
One known flake, twice confirmed: `src/ui/inputscal.test.tsx` fails under parallel load and passes
alone, with and without this branch. **`npm run test:e2e`, `npm run perf` and `npm run smoke:tracker`
have NOT been run this session.**
**Not yet done: the hand-testing pass in the running app.** Everything above is proved by tests and
by reading, not by watching it on screen. That is owed before this merges.

---

## 2. TO BUILD, in this order

| # | What | Why it is next |
|---|---|---|
| A | **A member sees the clash WORDS on their own row**, not just the amber mark. | His own row currently shows the OIL credit in the box with his bid hidden behind the mark, so his leave request looks thrown out when it is still live. He is misled about his own leave. |
| B | **A person's row spans their records, not their posting window.** From the earlier of (joining, first record) to the later of (leaving, last record). **Needs Q2 answered first.** | A man posted out in January with clearing leave in September is charged for it and cannot be seen. The money and the screen disagree. |
| C | **Days outside the posting window are tappable** once the row shows, so leave there can be bid and not only filed. | Owner answer C says "filed **or** bid". Only filing works. |
| D | **The free half beside Inputs-filed leave is biddable.** | The read-only panel speaks for the whole day when it should speak only for the leave that came from the form. Most leave arrives that way, so this is the normal case. |
| E | **A box for the hours on a hand-typed OIL credit.** | Without it every hand-typed credit means the whole day, so rule 6 above fires far more often than it should. |

**Known consequence of B, accepted:** the row appears *because* a record is out there, so the very
first pre-join or post-out leave must be filed on the Inputs page. In practice an admin files it
anyway.

**Three constraints on B that both reviewers insisted on. They are not optional.**
1. **It is a DISPLAY span and nothing else.** Do not widen the person's posting dates to achieve it
   — that would put a posted-out man back into the manning counts, a worse bug than the one being
   fixed. Manning must still read zero for him.
2. **It runs per person per repaint**, inside the grid-speed rules in `docs/performance.md`. Compute
   the first and last record dates ONCE per absence-index change and memoise them; keep month
   granularity so scrolling inside a month never reshuffles rows.
3. **An archived person with no posting-out date is dropped by the roster projection altogether**, so
   "a row spans its records" cannot be satisfied for them at all. Decide what happens there before
   building.

**A constraint on D:** it opens the free half only. It must NOT make the Inputs-filed leave itself
editable from the grid, and must not weaken the lock that protects it.

**A constraint on E:** the provenance fix it depends on is now in (`e63d462`) — an admin's credit is
handed back exactly as typed. Build E on top of that, not beside it.

---

## 3. PARKED — decided, deliberately not built

- **A duty cancelling your own clashing bid.** Decided as: an **answered** Duty or "Fly with" entry
  takes the clashing part of the bid, **whichever way the OIL question was answered** — being at
  work and being paid for it are different things. Parked because an admin always decides a bid
  before the day arrives and the day is already amber when they do, so it saves a decision rather
  than preventing a mistake; and because item A above solves the real problem (the member not being
  able to tell) far more cheaply and far more safely.
- **The Leave War cannot see ordinary weekday work at all.** Work only reaches that grid as an OIL
  credit, and credits only happen on weekends and public holidays. A man flying every Tuesday has
  nothing on his row to show it. Real limitation, bigger than everything else on this page put
  together, its own piece of work.
- **`[LW-LOCKMARK]`** (already in OUTSTANDING): the grid locks by DAY rather than by RECORD. Item D
  is the first real consequence of it; D works around it rather than fixing it.

## 4. CLOSED — looked at, not a defect

- **OIL may go negative.** Owner, 20 Sep 26: "it's ok to go negative OIL, because OIL can be earned
  back in the future." So a resolution that withdraws a credit someone has already spent needs no
  guard. The existing notice on the Unpublish button stays as information.

---

## 5. RULES SET ASIDE TODAY — do not re-apply these

This is the most important section for whoever works on this next. Each of these reads as live in an
older document and is **dead**. The standing order is that the newest ruling wins and that the stale
text gets fixed in the same change; these are the ones that changed.

| Rule as written | What replaced it |
|---|---|
| **B4** — "Overlap → no credit" | The credit **lands**, the day is flagged, it stays until resolved. B4's TIME test itself stands and is what raises the flag. |
| **B5** — "a bid made after the publish that overlaps published work is refused at the bid door" | Nothing is refused for recorded work, on any screen. B5's **other** half — publishing is the door that replaces an undecided bid, so undo of the publish brings it back — is untouched. |
| **§26.3** — leave over recorded work is refused | Filed and flagged. |
| **Q5 / §26.3** — approving a bid on a day later credited as worked **skips** that day | It is granted, and the day is flagged. |
| **H2** used to decide *whether* a medical and leave clash | H2 sets the **step** of a cut only. Real hours decide whether they meet, and where the surviving piece starts. |
| **H3** original — two leaves in one half refused even at different times | Overruled by the owner before this session: judged on real times. |
| **Aug 19** — "once I hit the next month the row disappears" | The row follows the person's records (item B). |
| **Aug 18** — a pre-join day is blank so nothing there to act on | Answer C: leave there may be filed **or bid** (item C). |

## 6. What is NOT settled — THREE OWNER QUESTIONS

**This section previously said "nothing". That was wrong.** Both providers' review of this
consolidation found real questions hiding inside the items above, and one of them changes how leave
is charged. **Do not build items B or C until Q2 is answered.**

**Q1 — The 15-day rule: "touches both halves", or "covered all day"?**
Today a day counts as a full annual day if *some* leave touches the morning and *some* touches the
afternoon. So **LL 08:00–10:00 plus OL 14:00–16:00 is charged as a full day**, removes a whole man
and continues a 15-day run — with four hours in the middle uncovered. The plain-language rule says
"covered". The code says "touches". This changes leave CHARGING, so it is the owner's call and must
not be settled inside a build. An existing day-view test pins the current reading, so whichever way
he rules, that test states the rule.

**Q2 — Item B: WHICH records extend a row?**
"From the earliest of (joining, first record) to the latest of (leaving, last record)" never says
what counts as a record. Each of these needs a yes or no: a **refused bid** six months after posting
out; an unacknowledged **replacement notice**; an **OIL credit** outside the posting window; an
overnight medical's **invisible spill** onto the next date (this one probably should NOT); an Inputs
record in a year **no war exists for**. Guessing gives a row that appears for the wrong reason, or
fails to appear for the right one.

**Q3 — Publishing still REMOVES an undecided bid, while a bid placed afterwards is kept and flagged.**
Same two facts, opposite outcomes decided by which came first — the exact thing the owner's "flag it
everywhere" ruling was meant to kill. It survives because the removal is B5's OTHER half, plus owner
answer A and the 19 Sep owner rule, none of which he was asked about. Either publishing should flag
rather than remove, or a bid over published work should be removed rather than flagged. Today the
app does both.

---

## 7. The other documents, and what each is now good for

| File | Status |
|---|---|
| `2026-09-20-agreed-rules-plain.md` | The readable statement of the rules themselves, by screen and by type. Still good; **this file overrides its status lists.** |
| `2026-09-20-one-absence-behaviour-register.md` | The formal register with rule ids. §10 holds the session's rulings. **Its N4 entry describes the war's doors as unchanged — they were changed afterwards; see §5 above.** |
| `2026-09-20-clash-doctrine-change.md` | Written for the review. Its "is it built" list is **superseded by §1 here**. |
| `plans/2026-09-20-s4-bughunt-plan.md` | The merged Fable+Codex scenario plan. **Still live** — most of its ground is untouched. |
| `plans/2026-09-20-s4-rules-redteam-findings.md` | The rules sweep's findings. Status column **superseded by §1–§4 here**. |
| `plans/2026-09-20-s4-batch2-rule-sheet.md` | The per-item rule list written before building. **Its N4 row is stale** (§5 above). Otherwise a good model of the standing order. |
| `briefs/rules-first-red-team.md` | Reusable. Unchanged. |
| `specs/2026-09-20-arch-stack-4-clash-check.md` | The original rules of record. **B4, B5 and §26.3 in it are partly dead — see §5.** |
