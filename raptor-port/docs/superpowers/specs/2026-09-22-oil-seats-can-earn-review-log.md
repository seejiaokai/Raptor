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

**Verdict: REVISE.** Seven must-fix, nine should-fix. 14 minutes, 49 tool calls, read-only, no
tests run. **Full text, verbatim:** `2026-09-22-oil-seats-can-earn-review-fable.md` — kept whole
because its fixes are step-by-step and the builder implements from those words.

It confirmed all four of the plan's findings F1–F4, and added a nuance to F2 the plan had missed:
the two bodies do not merely duplicate the rule, they read **different sources** — the mode reads
the live day, the money reads the frozen copy. They agree today only because publishing swaps one
for the other. So step 1 must consolidate onto the EVIDENCE, not onto the live day.

| # | What it says | Host disposition |
|---|---|---|
| **M1** | **A CLASH BETWEEN THE OWNER'S OWN RULINGS, and it moves money that already pays.** A placeholder on a ground row or a Common Programme row EARNS TODAY, by default. D28 says nothing may earn by default that does not earn today; D32/D33 (later) say the puck earns off by default everywhere. Both cannot hold for those two seats. Worse: on an ALREADY-ISSUED Saturday the frozen block holds the membership but no "on" mark — the type cannot even store one — so the new default would recompute those men as earning nothing and the reverse sweep would DELETE their landed credits, with no amendment and nothing on screen. | **CONFIRMED by the host** — `OilDecisions.items` is typed `Record<string, 0>`, and test OIL24 pins a no-mark ALL AVAIL ground row paying a full day. **THIS IS THE OWNER'S TO DECIDE, and it is the one blocking question.** Put to him. |
| **M2** | **D24 is unbuildable as written.** SC MAIN and SC SPARE sit in ONE formation and share ONE item address, so there is no line switch that can say "main on, spare off". | ACCEPTED. **Host decides (technical):** Fable's Option A — the default rides the SPAN, not the item, and an activated spare is credited by tapping the man. No new address, and D24's words ("click credit OIL") are satisfied. Option B (a spare sub-switch on the aircraft rid) is recorded as the fallback if tapping the man reads badly in the walk. |
| **M3** | **Where the kind's default comes from is unspecified**, and the `dflt` parameter that looks like it already exists means something else (the member's own answer on a claim). Gives the full step-2 spec: tag each span with `dflt` in the walk, widen the item mark to `0` or `1`, make `itemOn` three-valued, pass the span's own default instead of a hard `true`. | ACCEPTED WHOLE. **This replaces plan §5 steps 2–3**, and it is also the answer to Codex's OSE-01 (a mixed row) — the default belongs on the span, which is per-person-per-work, not on the item. Two reviewers reached the same place from different directions. |
| **M4** | **The fold would make a cockpit placeholder EARN**, and D33's refusal has no shape in this app: both doors PLANT FIRST and warn after (owner, 13 Aug 26), and copies (day template, parked plan) bypass both. Gives an 8-step fix including a non-expanding belt in the flying branch. | ACCEPTED WHOLE. **A second ruling clash** — D33's hard refusal against the 13 Aug plant-then-warn rule. Newest wins; the plan must say it is carving the first hard refusal out of that rule. **Reorders §5: the refusal ships before or with the fold, never after.** Complements Codex's OSE-04 (the swap's two writes) — same defect, and between them the fix is complete. |
| **M5** | **The mode does not open a placeholder into real pucks on duty desks, sims, passengers or any extras line.** Only the ground row and Common Programme do. So taking ONE man off the crowd on the owner's own Sunday desk is impossible — the item switch is the only door. | ACCEPTED. **Codex did not find this and it is arguably the most user-visible gap in the plan**: the whole `[ALL-AVAIL-WINDOW]` design (D38) assumes individual pucks can be tapped. Needs a fourth roll-call column. |
| **M6** | A published WEEKDAY has no frozen membership, so §6's "the count on an issued day reads the frozen list" cannot hold once the count shows every day. | ACCEPTED. **Same finding as Codex OSE-05, reached independently** — the strongest signal in the review that it is real. The two differ on the remedy: Fable recommends live on a non-earning day and frozen on an earning one; Codex wants membership made a first-class snapshot value inside signature and amendment tracking. **Host's position: Fable's is cheaper and matches D37 (the count is a starting point, not a promise); Codex's is safer. Unresolved — carry both into round 2.** |
| **M7** | The Leave War side is absent from the roll-call and the checks: a credited crowd lands 20+ cells, each through the clash rule, then the reverse sweep. | ACCEPTED. A cross-app change walked on one side only is precisely what the standing order forbids. |
| **S1–S9** | Nine smaller ones. The load-bearing: claim rows are a separate money path the fold never reaches (**S1, = Codex OSE-02**); there are FOUR exempt skips in `oil.ts`, not three (**S2** — the plan miscounted); **S5, an owner question** — an overnight AVALON/BB line, which day earns; **S4**, the count moves from weekend-in-mode to every day every repaint, so it must be memoised and cite the performance doc. | ALL ACCEPTED. S5 goes to the owner with M1. S2 is a plain factual correction to the plan. |

### Where the two reviewers AGREED — the strongest findings

Independently, from different directions:

- **The item-level default cannot work** (Codex OSE-01, Fable M3). Codex found it via a mixed
  row; Fable found it via the missing default source. Both land on: the default belongs to the span.
- **The accepted-input claim path is a separate money route the fold never reaches** (OSE-02, S1).
- **A published non-earning day has no frozen membership** (OSE-05, M6).
- **The refusal cannot live inside the writer** (OSE-04's two-write swap, M4's plant-then-warn).
  Between them the fix is complete; neither alone is.

### Where they DIVERGED

- **Fable alone** found M1 (the ruling clash and the retrospective credit deletion), M5 (the mode
  cannot open a crowd into pucks), M7 (Leave War unwalked), S2 (four skips, not three), S4
  (performance), S5 (overnight).
- **Codex alone** found OSE-03 stated as an evidence-versioning problem, OSE-06 (zero-length flying
  lines pass the capability test because padding is applied first — Fable did not test that
  arithmetic), and OSE-07 ("extras beside ANY row" is not a real surface) as a scope defect.
- **On M6/OSE-05 they agree the defect exists and disagree on the remedy** — unresolved, round 2.

**Neither reviewer was shown the other's answer.** The overlap is therefore evidence, not echo —
and the four agreed findings are the ones to treat as certain.

### The host's own errors, listed because they were in a document it had already checked

- Claimed the capability walk excludes zero-length seats. It does not, for flying lines (OSE-06).
- Wrote "the extra-people line beside ANY row" after telling the owner flying lines have none (OSE-07).
- Counted three exempt skips in `oil.ts`; there are four (S2).
- Named the freeze as a risk in §6 but carried it into no step (OSE-03, M1).

---

## Round 1 — outcome

**Both reviewers: REVISE. The plan is not buildable as written.** Nothing rejected on either side.

**BOTH OWNER QUESTIONS ANSWERED, 22 Sep 26 — and his answer to M1 went against BOTH the
reviewer's recommendation and the host's.**

**M1 — CLOSED by D43.** He ruled the placeholder pucks behave exactly like named people: **ON by
default, everywhere they can land.** Duty desks, sims, passengers, every extra-people line, ground
rows and Common Programme rows — all on; switch one off deliberately if you do not want it. His
reasoning, and it is better than either recommendation: a crowd behind the puck on a weekend event
is doing the same work as a man whose name is typed there, so it earns the same way.

**This closes the worst finding in the entire review rather than answering it.** M1's real danger
was never the clash — it was that switching those two seats OFF would recompute already-issued
Saturdays and silently delete landed credits from the Leave War with no amendment. Nothing is
switched off, so that path cannot be taken. **No data reset, no upgrade guard, no before/after
published-credit test needed** — M1's fix steps 2 and 3 fall away with it.

**What it does NOT touch:** D24 stands whole. The four exempt KINDS — SC SPARE, AVALON lines,
AVALON desks, BB lines, and a block minted from an AVALON template (D35) — still default OFF with
the switch offered. Those are about the kind of WORK, not about who is standing on it. M2 and M3
are unaffected and still required.

**It simplifies M3.** The span default is ON for everything except the four exempt kinds, so the
placeholder needs no default of its own — it inherits the seat's. One rule, not two.

**The flying line does not arise**, in his words: D33 refuses the puck there, so no default is
needed. Fable M4's non-expanding belt on that branch is kept anyway, for data that arrived by copy
before the refusal existed.

**S5 — CLOSED by D42.** An overnight line earns the day it SITS ON, and the day the hours spill
into earns nothing from it. A Sunday-night 19:00–07:00 line earns Sunday; Monday earns nothing.
Recorded in his framing — the host stated the rule wrongly when putting it to him.

**Still open, and the host's to settle in round 2:** M6/OSE-05's remedy — whether the count on a
published non-earning day reads live or frozen. The two reviewers agree the defect is real and
disagree on the fix.

**Host decisions taken, not put to him:** M2 Option A (the span carries the default; credit a
spare by tapping the man), and M3's step-2 spec adopted whole in place of plan §5 steps 2–3.

**Unresolved between the reviewers:** M6/OSE-05's remedy. Carried to round 2.

---

## Round 2 — CODEX (GPT-6 Astra, high), on the rewritten plan

**Verdict: REVISE.** Five findings — four high, one medium. It confirmed three of its round-1
findings as adequately addressed: the narrower seat scope, the atomic swap preflight, and **the
live-weekday count with its label** — so the host's arbitration on OSE-05 was tested and stands.
It also confirmed §9 maps every round-1 finding.

**Three of the five are the host's own errors IN THE REWRITE.** The rewrite fixed the shape and
introduced new mistakes; that is worth stating plainly, because it is the argument for the second
round existing at all.

| # | Sev | What it says | Host disposition |
|---|---|---|---|
| **OSE-R2-01** | high | **The new precedence breaks the INVERSE operation.** `toggleOilPerson` deletes a man's override whenever the wanted state equals the default (`if (want === dflt) delete`). Force an SC item on with `1`, then tap a default-off SPARE man off: want=false, dflt=false, his override is deleted — and the item's `1` immediately makes him earn again. Separately, making `oilItemOn` three-valued breaks every `!oilItemOn` guard, which would read "inherit" as an explicit refusal and refuse every tap on an unset item. | **CONFIRMED by the host**, both halves, by reading `ui/oilmode.ts`. ACCEPTED. The design changed the READ and left the WRITE alone — the classic half-migration. Needs separate raw-override and effective-result functions, and the guards must reject only an explicit false. |
| **OSE-R2-02** | high | **The span-default predicate omits formation-level `f.spare`.** The old exclusion checks BOTH: `if(ac.cx\|\|f.spare\|\|ac.spare)return`. A saved SC formation with `f.spare` and no aircraft-level flag would get every occupant defaulting ON. **This disproves §6's claim that exempt issued days compute identically.** | **CONFIRMED by the host** — the line reads exactly that. ACCEPTED, and it is the host's own error: it wrote the predicate from memory of one branch. |
| **OSE-R2-03** | high | **§6's blanket "no historical-credit checks needed" is WRONG.** D43 closed the placeholder route, but **step 8 reopens the same danger by a different one**: an issued Saturday flight with take-off and landing at the same minute pays HO today and would pay nothing after step 8, because the money is recomputed from the frozen day. The reverse sweep then deletes that credit with no amendment, and the existing upgrade guard only checks input eligibility, so it does not catch a schedule change. | ACCEPTED, and it is the sharpest finding of round 2. **The host over-claimed in the rewrite** — it declared the retrospective risk closed when only one of its two routes had been closed. Step 8 needs old issued evidence held to the rule it was issued under, and the correction must be visible in the signature and the amendment comparison. |
| **OSE-R2-04** | high | **Half of Fable S1 was LOST in the rewrite.** Step 6 says "placeholder extras" — but a placeholder can also sit in an accepted request's PRIMARY `who` seat, which D33 still permits and `setSlotVal` still allows. The claim collector walks `row.more` only, so the primary position would still have no frozen membership and no crowd earnings. §9 maps the finding, but only half of it survived. | ACCEPTED. **This is exactly what round 2 was asked to look for** — a finding handled in name only. The host's §9 table said S1 was covered; it was covered halfway. |
| **OSE-R2-05** | med | **The frozen count does not survive TAPPING the chip.** The chip carries day and item but no version; the snapshot is installed only while the HTML is generated and then the live day is restored, so the tap re-reads live evidence. An issued day's chip can show 2 while its tap-through lists 1. | ACCEPTED. The promise in §4 is a drawing-time promise only; the read behind it has to carry the same snapshot. |

**What it confirmed as settled:** the live/frozen arbitration (OSE-05 round 1) — it did not re-argue
it despite being explicitly invited to. That is the strongest possible endorsement of the host's
position, since the invitation was open.

## Round 2 — FABLE 5.1, on the rewritten plan

**Verdict: REVISE.** Five must-fix, four should-fix. It confirms §9 carries all twenty round-1
findings and names **two that were carried in name only** — the thing round 2 was asked to hunt.
Full text in the agent transcript; the load-bearing content is below.

| # | What it says | Host disposition |
|---|---|---|
| **R2-1** | **The person-default half of M3 was dropped, and it makes D24's only door unbuildable.** §4 rewrote the MONEY's default but left the MODE's (`itemDefaultFor`, which returns `true` when there is no claim). Traced: a default-off SPARE man draws GLOWING, the money pays him nothing, and the per-man tap writes `deny` for a credit he never had — `allow` is unreachable, so "credit the spare by tapping the man" cannot happen. | **ACCEPTED, and it is the sharpest finding of round 2.** Same root as Codex OSE-R2-01, found from the opposite end: Codex traced the WRITER deleting overrides, Fable traced the READER glowing. **Two reviewers, two routes, one defect — treat as certain.** The design changed the read and left the write; it also changed the money and left the screen. |
| **R2-2** | **Three-state `itemOn` breaks six boolean callers, and nothing writes the `1`.** With `undefined` for every unmarked item, `!undefined` is true — every puck inert, every item tap toasts "masked". And `toggleOilItem` today only writes `0` or deletes, so **an AVALON line could never be switched ON**: D24's switch would draw and do nothing. Also kills step 3's "land it green" proof unless the suite never opens the mode, in which case the proof is worthless. | ACCEPTED WHOLE, including its fix: **split into two functions** — a boolean mask for the four guards (unchanged semantics) and a three-valued mark for the switch — plus an `itemState` of on/off/mixed for drawing, the full toggle cycle, and five titles. |
| **R2-3** | **§6's "an issued day computes identically" holds for the money but not the amendment book.** After steps 4–5 an already-issued day gains a live membership entry the frozen block lacks, so it reads pending — correct under the amendment model, but the walk will report it as a defect unless it is a named expectation. And on an EXEMPT desk it offers an amendment for a decision that moves no money, which §6 itself forbids. | ACCEPTED. **Its fix 1 is now SUPERSEDED by D44** (record membership everywhere, not only where money-bearing). Its fix 2 — restore the before/after published test, in the additive direction — stands and is needed. Third time the host's "computes identically" claim has been holed; it is deleted rather than re-qualified. |
| **R2-4** | **A NEW PRODUCT QUESTION the rewrite created.** D43 turned step 6 from "pays nobody" into "pays everyone by default": a placeholder mis-dropped in ONE man's accepted request row would credit the whole squadron for his appointment window. Recommends refusing the puck on a request row. | **THE OWNER'S TO ANSWER — put to him.** The host agrees it is a real consequence and that D33's "ground rows" was said before D43 made this the result. |
| **R2-5** | **D43 was never written into the four rulings it supersedes** — D27, D28, D32, D33 all still read "off by default", and D28's "nothing earns by default that does not earn today" is now false for the placeholder. | **ACCEPTED AND FIXED IMMEDIATELY.** This is the owner's own standing rule (fix the stale text in the same change) and the host broke it. All four rows now carry the amendment. |
| **R2-7–10** | Memoise in step 1, not step 9 (consolidating onto the evidence turns an O(1) read into a full evidence build per row and per puck). The rid-less row is closed by construction — pin it rather than list it as open. Roll-call still missing a SURFACE axis (the version preview especially, the only place "as issued" shows), the Available-crew panel's second "free" count, an SC-template control row, a cockpit holding a copied placeholder, and OIL8 on a sim row at phone width. Wording moved too late — the five-state switch is on screen from step 3. | ALL ACCEPTED. |

**The arbitration: attacked, and it did NOT survive — but not for any reason a reviewer found.**
Fable tested it, found it holds, and even pre-empted the case it expected Codex to raise. Codex
declined to re-argue it. **Both reviewers left the host's position standing — and the OWNER then
overturned it (D44)** with a fact neither model had: the squadron reviews every change at the close
of the day and issues an EOD version as the record of what happened, so the pending mark is the
signal that process runs on. Fable's correction 1 (frozen in the ISSUED version, live on the WORKING
copy, the difference showing as pending) turns out to be exactly his description and survives whole;
its correction 2 (one resolver behind all four readers) also stands.

**Explicit negatives Fable checked and cleared:** D42 needs nothing built on either side — the Leave
War already computes from the unclipped envelope and clips before ingest, so an overnight credit is
never dropped. D43 creates no double credit on a mixed row (a named man is excluded from the crowd
by the availability walk) and none across overlapping placeholder rows. The refusal's preflight
reaches every alias. Seeds and parity unchanged.

---

## Round 2 — outcome, and the round cap

**Both reviewers: REVISE.** Codex 5 (4 high), Fable 5 must-fix + 4 should-fix. Nothing rejected.
**Both independently found the same defect from opposite ends** (the read/write half-migration), which
is the strongest signal in either round.

**THE CAP IS REACHED.** The owner capped design red-teaming at about three rounds (19 Sep 26) and
this loop was set to two. **There is no round 3.** The findings are folded into the plan and into the
build, and what remains is caught by the post-build inspection — a different check that finds
different things — and by the WALK, which is the only thing that finds a surface nobody wired up.

**One question still the owner's: R2-4**, the placeholder on an accepted request row.
