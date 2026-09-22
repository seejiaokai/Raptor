# [OIL-SEATS-CAN-EARN] — plan review log (22 Sep 26)

Append-only. The plan under review is
`raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md`.

## Setup

| | |
|---|---|
| **Plan author** | Opus 5 (this session). **It therefore reviews nothing here** — house rule: the provider that wrote a thing never inspects it. |
| **Reviewers** | **Fable 5.1** and **Codex / GPT-6 Astra (high)**, independently, neither shown the other's answer. |
| **Why two** | The change is money under the standing order's tier question 1 — OIL is earned leave, and a wrong answer is still something a man is owed (D25). §4 of `raptor-port/docs/bug-check-order.md` puts two providers on money, published records, permissions and persistence. |
| **Authorisation** | The owner said "attack the plan", 22 Sep 26. **This authorises REVIEWING, not building.** Nothing is implemented off the back of this log without his separate go. |
| **Round cap** | 2 completed rounds. At the cap, unresolved findings are presented with the host's position rather than forced to converge (his ruling on capping design review rounds, 19 Sep 26). |
| **Codex boundary** | `exec -s read-only` — the reviewer can read the repo and cannot change it. |
| **Fable boundary** | A read-only subagent: no write, no edit, no shell. Told explicitly to write no code. |

**One asymmetry, recorded rather than hidden:** the two reviewers received the same
questions by different routes. Fable was given them in its prompt; Codex receives the plan
document itself, which opens by saying it is the thing to attack. The plan body both saw is
byte-identical. If their coverage diverges because of that, it is noted in the round below
rather than explained away.

**The questions both were asked**, in priority order:

- **A — what is MISSING.** Not "is this wrong". A step that must exist and is not listed; a
  surface the roll-call does not name; a ruling with no step implementing it; a path into the
  code that bypasses everything the plan changes.
- **B — verify findings F1–F4 against the real code**, the four load-bearing claims the plan
  is shaped around. Each returns CONFIRMED with what was read, or WRONG with what is true.
- **C — the roll-call (§4)**, attacked for absence: where can a puck or a person be PUT, not
  only where the demo fixture already has them. That omission is exactly how the owner found
  the original defect.
- **D — the order of work (§5)**, and specifically whether steps 1 and 2 really change no
  behaviour, and whether step 3 is really the first safe moment to let the exempt kinds in.
- **E — the publication freeze**, walked per newly-earning seat, with its failure mode.
- **F — the rulings** (D24/D27/D28/D31/D32/D33/D35/D36/D37): any contradiction, any one
  unbuildable as written, and whether the plan quietly violates D36.

**Output contract, both reviewers:** every finding carries an exact step-by-step fix — file,
function, what to change, how to prove it. A vague direction is not acceptable, because Opus
implements from their words. That is a standing rule, written after earlier reviews returned
directions too vague to act on.

---

## Round 1 — CODEX (GPT-6 Astra, high)

**Verdict: REVISE.** Seven findings — four high, three medium. Session
`01a0c7a0-8e8a-7c90-bbde-af51c2b1c30b`, CLI 0.154.0, plan SHA
`d6a087fd…7eb5bd0`, 226 s, repo HEAD `853bdd1`. Read-only; no files touched, no tests run.
Its own stated limits: it reviewed an unimplemented plan against current source, so rendering,
phone hit-testing, persistence round-trips and runtime credit reconciliation are unverified —
which is exactly the half the WALK owns, not a reviewer.

**The host verified the four load-bearing claims itself rather than taking them on trust.**
Three are confirmed below with the code read; the rest are accepted on the reviewer's evidence
and flagged as such.

| # | Sev | What it says | Host disposition |
|---|---|---|---|
| **OSE-01** | high | **An item-level default cannot serve a MIXED row.** A duty row's named man and an ALL AVAIL in its extras share ONE item key, so "default this item off" either strips the named man of what he earns today or pays the placeholder with no override. Same shape for a formation holding MAIN and SPARE. | **CONFIRMED by the host.** `engine/oil.ts` sets `item=rowItemKey(r.rid)` once per row and then `[r.id,...(r.more||[])]` all take it. **This breaks plan §5 steps 2–3**, which is the seam everything later hangs off. ACCEPTED — the default has to be decided per work-source, not per item. |
| **OSE-02** | high | **Folding expansion into `put` misses the accepted-input path entirely.** `dayOilWork` skips `g.src` ground rows; their extras are collected by `landedExtras`, which explicitly rejects specials, and paid through the input loop. A placeholder beside an accepted Training request would still pay nobody. | **CONFIRMED by the host** — `if(g.cx||g.src)return;` in `engine/oil.ts`. ACCEPTED. The plan's F3 claimed one helper covered every route; it does not. |
| **OSE-03** | high | **The new default changes ALREADY-ISSUED money.** An issued day freezes its membership but NOT the effective earning rule, and `oilEarnedWork` reinterprets it under whatever rules are current. Flipping the unset default from on to off can silently remove a credit already given, with no amendment. | ACCEPTED on its evidence. This is the freeze risk the plan named in §6 but did not carry into a step. It is the worst failure mode in the change: silent, retrospective, and about earned leave. |
| **OSE-04** | high | **A refusal inside `setSlotVal` corrupts a swap.** A swap is TWO independent writes; refusing one still runs the other, duplicating a person and losing the placeholder — and the caller reports success either way. | **CONFIRMED by the host.** `ui/drag.ts`: `setSlotVal(targetKey,a); setSlotVal(DRAG.key,b)`. ACCEPTED. D33's refusal must be decided BEFORE either write, not inside the writer. |
| **OSE-05** | med | Showing the count on non-earning days gives an issued weekday no FROZEN membership: the evidence returns empty on such days, its key is blank, and the canonical comparison excludes it — so the number would recompute from live state and sit outside signature and amendment tracking. | ACCEPTED on its evidence. D27's display half is bigger than the plan said: membership has to become a first-class snapshot value, not a by-product of the earning pass. |
| **OSE-06** | med | **The plan's claim that `oilCapableItems` already excludes zero-length seats is FALSE for flying lines.** The report/debrief padding is applied BEFORE the length test, so a line with the same take-off and landing yields a positive 5-hour window, reads as capable, and can pay. | **CONFIRMED by the host** by reading the arithmetic: `w2(st-180, en+120)` with `st==en` gives a positive span. So the plan's §4 sentence is wrong and D31 would be violated by a wording-only step 8. ACCEPTED. |
| **OSE-07** | med | **"The extra-people line beside ANY row" is not a real surface.** Flying rows have no extras at all — the key grammar excludes them, nothing renders them, and drag refuses roster drops below cockpit seats. The roll-call promises coverage that cannot exist. | ACCEPTED, and it is the host's own inconsistency: it had already told the owner flying lines have no extras line, then wrote "ANY row" into the roll-call. Scope must be narrowed to the row families that actually have extras. |

**Nothing is rejected.** All seven are warranted; four change the shape of the build rather
than its detail. The plan is NOT buildable as written.

**What this review could not do, said plainly:** it read code. It did not run the app. Every
finding above is a reasoning defect in the plan, which is what a pre-build review is for — the
class of defect that has repeatedly reached the owner (a surface never wired up) is still only
findable by the walk, and that stays in §7.

## Round 1 — FABLE 5.1

**Status: running.** Appended on return, with the host's disposition on each finding and a note
on where the two reviewers agreed and diverged.
