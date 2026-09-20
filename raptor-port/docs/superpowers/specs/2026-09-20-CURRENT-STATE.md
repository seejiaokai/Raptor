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
| 9 | A **hand-typed credit is never destroyed** — taken over in place, handed back when the schedule stops backing it, the admin's own reason kept. | `a6e1c64` |
| 10 | **One** warning list, derived from the day; the work is always the "earns" side. | `ee22b89` |

Process, also built: the **behaviour register**, `npm run rulecheck` (fails when a ruling has no
test naming it), and the **rules-first red team** as a standing third review.

**Gates at the last full run:** unit 321 files / 5126 tests green · `tfin` 728/0 · rulecheck OK.
**Not yet done: the hand-testing pass in the running app.** Everything above is proved by tests and
by reading, not by watching it on screen. That is owed before this merges.

---

## 2. TO BUILD, in this order

| # | What | Why it is next |
|---|---|---|
| A | **A member sees the clash WORDS on their own row**, not just the amber mark. | His own row currently shows the OIL credit in the box with his bid hidden behind the mark, so his leave request looks thrown out when it is still live. He is misled about his own leave. |
| B | **A person's row spans their records, not their posting window.** From the earlier of (joining, first record) to the later of (leaving, last record). | A man posted out in January with clearing leave in September is charged for it and cannot be seen. The money and the screen disagree. |
| C | **Days outside the posting window are tappable** once the row shows, so leave there can be bid and not only filed. | Owner answer C says "filed **or** bid". Only filing works. |
| D | **The free half beside Inputs-filed leave is biddable.** | The read-only panel speaks for the whole day when it should speak only for the leave that came from the form. Most leave arrives that way, so this is the normal case. |
| E | **A box for the hours on a hand-typed OIL credit.** | Without it every hand-typed credit means the whole day, so rule 6 above fires far more often than it should. |

**Known consequence of B, accepted:** the row appears *because* a record is out there, so the very
first pre-join or post-out leave must be filed on the Inputs page. In practice an admin files it
anyway.

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

## 6. What is NOT settled and needs the owner

Nothing. Every question raised in this session has been answered. The next session builds items
A–E, hand-tests everything against §1 and §2 in the running app, and re-runs the gates.

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
