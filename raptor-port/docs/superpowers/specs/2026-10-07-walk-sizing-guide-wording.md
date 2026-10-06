# The walk is sized per change — proposed wording for the checking guide (`[WALK-SIZING-GUIDE]`, D607)

**A DRAFT, 7 Oct 26, on `claude/docs-tidy-7-oct`. No guide has been changed.** It is a change to a working guide, so
it is read by Astra and by Sol 6.1, one round each, apart (D70, D590), and then put to him; only his word puts it in.
Written by Opus 5.5, so neither reader is its writer.

**The ruling (D607, 7 Oct 26)** — full row: `.claude/decisions-full/how-we-work.md`. Before any walk the agent says
what TYPE of change it is and Opus decides what kind of walk it needs; every walk is recorded so the figures show
which types of change a walk is useful for. The step and the record are in `raptor-port/docs/walk-ledger.md`. What
still says otherwise is the checking guide: `raptor-port/docs/bug-check-order.md` and `.claude/rules/bug-check.md`.

## What the wording must do, and must not

1. Put ONE new step between the roll-call and the walk — the sizing step — and point at the ledger for its five lines
   (one home; the guide does not repeat them).
2. Stop the guide saying "the full walk" as if every FULL check walked the same way.
3. **Change nothing else of the order.** The tier rule, the roll-call, the door check, the tests, the gates, the code
   reads, the evidence sheet, his look: untouched (D607's reading (2)). D5 stands — driving the app is still the bug
   test where a change needs it. D16 stands — it says HOW a walk of several is run, once one is chosen.
4. Not let "sized" become "skipped". A sizing step that can choose nothing is the old failure by a new door — three
   unwired screens reached him on 21 Sep 26 behind a code review and green tests. So the wording carries a floor.
5. Not rule what he did not rule. D607's reading (4): no table of "this type gets this walk" — a decision per change,
   made from the record.

## The proposed changes — each as "now" and "proposed"

### 1. `.claude/rules/bug-check.md` — the four steps under "Then, before you execute anything"

*(This file is two lines over its size marker, so the change is made inside existing lines — no line is added.)*

**Step 3, now:**
> 3. **Tell him, in one short block, what that tier means you are about to do** — the list of checks,
>    and roughly how long. He reads it; he does not have to choose it. If he wants less, he will say
>    so, and that is his call to make, not yours to assume.

**Step 3, proposed:**
> 3. **Tell him, in one short block, what that tier means you are about to do** — the list of checks, the
>    SIZE of the walk and why (D607 — step 4), and roughly how long. He reads it; he does not have to choose it.
>    If he wants less, he will say so, and that is his call to make, not yours to assume.

**Step 4, now:**
> 4. **Then execute it**, in the order §5 gives (roll-call and door check → walk → gates → the model
>    reads → fix → re-walk what the fixes touched → evidence sheet → his look).

**Step 4, proposed:**
> 4. **Then execute it**, in the order §5 gives (roll-call and door check → SIZE THE WALK, `raptor-port/docs/walk-ledger.md`
>    → walk → gates → the model reads → fix → re-walk what the fixes touched → evidence sheet → his look).

### 2. `bug-check-order.md` §0a — the same two steps

**Step 3, now:** "…what that tier means you are about to do — the checks, and roughly how long."
**Proposed:** "…what that tier means you are about to do — the checks, the size of the walk and why (§7.0), and
roughly how long."

*(Step 4 there says "in the order §5 gives" and needs no change.)*

### 3. `bug-check-order.md` §3 — the table's row for the walk

**Now:** "An agent drives the REAL built app in a real browser, phone and desktop width, on a day that has everything
on it, through every surface in the roll-call and every line of the order list, taking pictures."
**Proposed:** the same sentence, then: "How much of that is driven by helpers, by the host's own scripted run, or
carried by a named test is decided per change in the sizing step (§7.0, D607)."

### 4. `bug-check-order.md` §4 — the head of the fan-out paragraph (D16)

**Now:** "**A long walk is FANNED OUT across parallel helpers, not walked serially (owner, D16, 21 Sep 26).** The
helpers are …"
**Proposed:** one sentence before it: "**How many walk — the host alone, one helper, or several — is the sizing
step's answer (§7.0; owner, D607, 7 Oct 26); this paragraph says how a walk of several is run.**" The paragraph
itself is unchanged.

### 5. `bug-check-order.md` §5 — the tier table

**WALK row, now:** "…the walk of the touched surfaces at both widths; the new gesture in both orders; …"
**Proposed:** "…a walk of the touched surfaces at both widths, sized by the sizing step (§7.0); the new gesture in
both orders; …"

**FULL row, now:** "…the roll-call; the door check; the full walk; break tests; …"
**Proposed:** "…the roll-call; the door check; a walk sized by the sizing step (§7.0); break tests; …"

**The cost column** ("1–1½ h", "3–5 h of agent time"), **now** with no note. **Proposed:** one line under the
table: "The walk is the dearest part and the part whose cost varies most: what past walks of each type of change
cost and found is in `docs/walk-ledger.md` §The figures." *(The hours are left as they are: the ledger records tokens
for few past walks and hours for none, so there is nothing measured to replace them with.)*

### 6. `bug-check-order.md` §5 — "Order of steps in FULL"

**Now:** "build → gates → roll-call and door check → walk, and fix what it finds → gates → the two reads, …"
**Proposed:** "build → gates → roll-call and door check → **the sizing step (§7.0)** → walk, and fix what it finds
→ gates → the two reads, …"

### 7. `bug-check-order.md` §7 — a new first part, before 7.1

> **7.0 Size the walk before it starts (owner, D607, 7 Oct 26).** A walk is the dearest part of a bug check and the
> only part that finds a screen nobody wired up, so its size is decided for THIS change — never by habit, in either
> direction. After the roll-call and before any walker starts, Opus (the host when the host is Opus, an Opus helper
> otherwise) writes the five sizing lines of `docs/walk-ledger.md` into the evidence sheet — the type of change, what
> only a walk could find here, what the ledger says about walks of that type, the walk chosen, and its row added
> afterwards — and the choice is told to him in the tier block (§0a, step 3).
>
> - **What can be chosen:** the host's own scripted before-and-after run; one walker; several (run as §4 says, D16);
>   how many scenarios; which sizes; and which orders are DRIVEN and which are carried by a named test.
> - **What cannot be chosen — the floor.** No walk at all is never a size: a WALK or FULL change always has at least
>   the host's own scripted run through the real controls on the real build, its pictures opened, and the `Walk:` line
>   (§9; D5). Every roll-call row still gets its mark by being SEEN on its own surface (§7.3) — the roll-call is not
>   sized. A new screen, a new control or mode, a mark drawn in several places, a layout change, or a change to who
>   may do or see something is walked on each surface and at each size the roll-call names — those are the faults
>   only a walk has ever found.
> - **What is left to a test is named.** An order or a route the sizing leaves out of the walk is written in the
>   sheet with the test that carries it (§9, "what was NOT walked and why"). An order carried by nothing is a gap,
>   not a saving.
> - **The size is reconsidered when the walk finds something.** A real fault found by a small walk, or a MISSING in
>   the roll-call, means the change is not the type it was taken for: say so in the sheet and widen the walk.
> - **It sizes the walk and nothing else.** The tier, the roll-call, the door check, the tests, the gates, the code
>   reads and his look are as this order gives them. It applies to the WALK and FULL tiers; a LOOK is already one
>   before-and-after picture, and a re-walk is already "only what the fixes touched" (§5).

### 8. `bug-check-order.md` §7.4 and §7.5 — which orders are driven

**7.4, now:** "**Walk every order.** Each action from each state; every PAIR of the feature's own actions in BOTH
orders, on a published day and an unpublished one; after each, undo, redo, reload; every action with an opposite
walked in the opposite direction AFTER publishing, because that is where money freezes."
**Proposed:** the same, then: "Which of these are driven in the walk and which are carried by a named test is
written in the sizing step (§7.0); none is left to nothing."

**7.5, now:** "**You have walked enough when** every roll-call row has a mark in every column, every order line has
a result, every MISSING has a disposition, the error list is empty or named, and the pictures exist. Not when it
feels fine."
**Proposed:** "…every order line has a result — from the walk, or from the test the sizing step named for it — …"
*(the rest unchanged)*

### 9. `bug-check-order.md` §9 — what the sheet holds

**Now:** "It holds: the eight answers and the tier · the roll-call table · the orders walked, …"
**Proposed:** "It holds: the eight answers and the tier · the roll-call table · **the five sizing lines (§7.0)** ·
the orders walked, …" The `Walk:` line is unchanged.

### 10. `bug-check-order.md` §10 — two anti-patterns added to the list

> **The walk by habit** — the same number of walkers and scenarios whatever the change: five walkers on a rule
> inside one calculation, 2.24 million tokens, no fault found in the rule (`[OIL-WORK-START]`, 6–7 Oct 26).
>
> **The walk sized to nothing** — the sizing step used to skip the walk on a change that had a surface to find. The
> floor in §7.0 is the answer; "the tests cover it" is how three unwired screens went out on 21 Sep 26.

### 11. `bug-check-order.md` §12 — one box of the checklist

**Now:** "- [ ] Every required order and route was walked, including after publishing."
**Proposed:** "- [ ] The walk was sized in writing before it started (§7.0), and every required order and route was
walked — or is carried by the test the sizing step named for it — including after publishing."

## What is deliberately NOT proposed

- No table of "type A gets this walk, type B gets that" (D607's reading (4)). The types and what a walk has to find
  in each are in the ledger and are corrected as the record grows.
- No change to who walks (Sonnet 5.5 — D588), who reproduces the finds (the host), or the rule that a helper's
  "found nothing" is weaker than the host's own look.
- No change to the tier rule or its eight questions.
- No new always-loaded text: `.claude/rules/bug-check.md` gains no line.

## Parked for him (D596) — none blocks the readers

1. **D607's five readings are the agent's, "not his words until he answers".** This wording rests on two of them:
   "Opus" means the planning model (the host when it is Opus), and the step sizes the walk and removes nothing else.
   *Recommended: confirm both.*
2. **The floor.** As drafted, a WALK or FULL change always has at least the host's own scripted run with its
   pictures opened; "no walk" is never a size. *Recommended: keep the floor* — the scripted run is the cheap part
   (minutes, the host's own tokens), and it is the part that reproduced the fault on screen before the fix on each
   of the last three jobs.

## For the readers

The brief is `raptor-port/docs/superpowers/briefs/2026-10-07-walk-sizing-wording-read-brief.md`.
