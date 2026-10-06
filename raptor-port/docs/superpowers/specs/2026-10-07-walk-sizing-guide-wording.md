# The walk is sized per change — proposed wording for the checking guide (`[WALK-SIZING-GUIDE]`, D607)

**A DRAFT — version 2, 7 Oct 26, on `claude/docs-tidy-7-oct`. No guide has been changed.** It is a change to a working
guide, so it was read by Astra and by Sol 6.1, one round each, apart (D70, D590). **Both said CHANGES REQUIRED;** this
version is the draft with their findings worked in — what each asked for and what was done is at the foot. The cap is
one round each, so **this second version has had no read of its own**; most of its changed sentences are the readers'
own replacement wording. Only his word puts any of it into the guide.

**The ruling (D607, 7 Oct 26)** — full row: `.claude/decisions-full/how-we-work.md`. Before any walk the agent says
what TYPE of change it is and Opus decides what kind of walk it needs; every walk is recorded so the figures show
which types of change a walk is useful for. The step and the record are in `raptor-port/docs/walk-ledger.md`. What
still says otherwise is the checking guide: `raptor-port/docs/bug-check-order.md`, `.claude/rules/bug-check.md`, and
two passages of the project guide's full text (`raptor-port/docs/guide-full.md`).

## What the wording must do, and must not

1. Put ONE new step between the roll-call and the walk — the sizing step — and point at the ledger for its five lines
   (one home; the guide does not repeat them).
2. Stop the guide ordering the same walk whatever the change — in "the full walk", and in every other sentence that
   says "every order" or "ruling by ruling" as if it were always driven by hand *(the readers found seven such
   sentences the first draft had left)*.
3. **Change nothing else of the order.** The tier rule, the roll-call, the door check, the tests, the gates, the code
   reads, the evidence sheet, his look: untouched (D607's reading (2)). D5 stands — driving the app is still the bug
   test where a change needs it. D16 stands — a long pass is fanned out.
4. Not let "sized" become "skipped". Two guards: a floor (a WALK or FULL change always has a real walk), and **a
   limit on what a test may stand in for** — a test that changes the data directly never proves that a screen offers
   a working control *(both readers' first finding)*.
5. Not rule what he did not rule. D607's reading (4): no table of "this type gets this walk", no ceiling on walkers
   — a decision per change, made from the record.

## The proposed changes — each as "now" and "proposed"

### 1. `.claude/rules/bug-check.md` — the steps under "Then, before you execute anything"

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
>    **Sizing never means no walk, and a test that changes the data directly never stands in for pressing a control
>    on screen** (the order's §7.0).

*(This file is two lines over its size marker. The marker is a tripwire, not a target (D141): the sentence above
belongs in the always-loaded reminder, so the marker is raised by the lines it adds, with that reason. — Astra's
finding 8: the first draft had treated the marker as a limit.)*

### 2. `bug-check-order.md` §0 — the one sentence

**Now:** "**A build is not checked until someone has driven the real app across every place the feature shows, in
every order it can be used, on a day that has everything on it — and left the pictures and the table that prove
it.** (D5)"

**Proposed:** "**A build is not checked until someone has driven the real app across every place the feature shows,
on a day that has everything on it — every required surface seen and operated, every required order given a result
by that walk or by a test allowed to carry it (§7.0) — and left the pictures and the table that prove it, the table
saying which proof was used.** (D5, D607)"

### 3. `bug-check-order.md` §0a — step 3

**Now:** "…what that tier means you are about to do — the checks, and roughly how long."
**Proposed:** "…what that tier means you are about to do — the checks, the size of the walk and why (§7.0), and
roughly how long."

### 4. `bug-check-order.md` §2a — one sentence under "Read this table as…"

**Proposed, added:** "The table says what must be COVERED for each kind of work; how much of it is driven, at what
sizes beyond the required ones, and by how many, is decided per change in the sizing step (§7.0, D607)."

### 5. `bug-check-order.md` §3 — the table's row for the walk

**Now:** "An agent drives the REAL built app in a real browser, phone and desktop width, on a day that has everything
on it, through every surface in the roll-call and every line of the order list, taking pictures."
**Proposed (replaced, not added to):** "An agent drives the REAL built app in a real browser, phone and desktop
width, on a day that has everything on it, through every surface in the roll-call and through the controls, states
and orders the sizing step chose (§7.0), taking pictures."

### 6. `bug-check-order.md` §4 — the head of the fan-out paragraph (D16)

**Proposed, one sentence before it:** "**Opus sizes the coverage for this change (§7.0; owner, D607, 7 Oct 26). A
short walk may be run by the host or by one helper; if the chosen pass is long, D16 requires parallel helpers, as
below.**" The paragraph itself is unchanged.

### 7. `bug-check-order.md` §5 — the tier table

**WALK row, now:** "…the walk of the touched surfaces at both widths; the new gesture in both orders; …"
**Proposed:** "…a walk of the touched surfaces at both widths, sized by the sizing step (§7.0); the new gesture in
both orders; …"

**FULL row, now:** "…the roll-call; the door check; the full walk; break tests; …"
**Proposed:** "…the roll-call; the door check; a walk sized by the sizing step (§7.0); break tests; …"

**Under the table, added:** "The walk is the dearest part and the part whose cost varies most: what past walks of
each type of change cost and found is in `docs/walk-ledger.md` §The figures." *(The hours in the cost column are left
as they are: no sheet records how long a whole check took. One comparison records two walkers' own times, 76 and 64
minutes, and a trial 54 and 31 — too little to replace the column with.)*

### 8. `bug-check-order.md` §5 — "Order of steps in FULL"

**Now:** "build → gates → roll-call and door check → walk, and fix what it finds → …"
**Proposed:** "build → gates → roll-call and door check → **the sizing step (§7.0)** → walk, and fix what it finds → …"

### 9. `bug-check-order.md` §7 — a new first part, before 7.1

> **7.0 Size the walk before it starts (owner, D607, 7 Oct 26).** A walk is the dearest part of a bug check and the
> only part that finds a screen nobody wired up, so its size is decided for THIS change — never by habit, in either
> direction. After the roll-call and before any walker starts, Opus (the host when the host is Opus, an Opus helper
> otherwise) writes the five sizing lines of `docs/walk-ledger.md` into the evidence sheet — the type of change, what
> only a walk could find here, what the ledger says about walks of that type, the walk chosen, and its row added
> afterwards — and the choice is told to him in the tier block (§0a, step 3).
>
> - **What can be chosen:** who walks — the host, one helper, or several (a long pass is fanned out, §4, D16); how
>   many scenarios; which sizes are useful BEYOND the required ones (phone and desktop width always, and §7.2's short
>   screen where it applies); and which repeated cases are driven and which are carried by a test.
> - **The floor.** A WALK or FULL change cannot have no walk. The host or the assigned helpers drive the required
>   real controls on the exact build and open the pictures; the host checks a helper's evidence and reproduces every
>   finding (§4, D588); the `Walk:` line is written (§9; D5). Every roll-call row still gets its mark by being SEEN
>   and OPERATED on its own surface (§7.3) — the roll-call is not sized.
> - **What a test may carry, and what it may not.** A named test may carry repeated cases of a calculation where the
>   sizing step says why their route on screen and their behaviour there are the same as a route already walked. It
>   cannot replace seeing and operating a distinct surface, door, role, gesture or order whose behaviour on screen
>   differs. For each case left to a test, the sheet names the test, the exact claim it proves, and whether it works
>   through the app's real controls or calls the calculation or the writer directly. **A test that changes the state
>   directly does not prove that the screen offers a working route** — that a control exists, can be reached, works
>   in that state and shows the right result is proved only in the running app. A claim carried by nothing is a gap,
>   not a saving.
> - **The size is looked at again when the evidence changes.** A real fault or a MISSING row has Opus review what
>   the sizing assumed, and write down its decision: widen the walk where the finding shows a surface, a state, a
>   route or a shared cause of THIS change that has no proof; otherwise record the finding's disposition and why the
>   scope still holds. An older fault met in passing does not by itself enlarge the walk.
> - **It sizes the walk and nothing else.** The tier, the roll-call, the door check, the tests, the gates, the code
>   reads and his look are as this order gives them. It applies to the WALK and FULL tiers; a LOOK is already one
>   before-and-after picture, and a re-walk is already "only what the fixes touched" (§5).

### 10. `bug-check-order.md` §7.3 — the last sentence

**Now:** "A ruling about MONEY gets **one mark per order**."
**Proposed:** "A ruling about MONEY gets **one recorded result per required order**, saying whether the walk or a
test allowed to carry it (§7.0) proved it."

### 11. `bug-check-order.md` §7.4 and §7.5 — the orders

**7.4, now:** "**Walk every order.** Each action from each state; every PAIR of the feature's own actions in BOTH
orders, on a published day and an unpublished one; after each, undo, redo, reload; every action with an opposite
walked in the opposite direction AFTER publishing, because that is where money freezes."

**7.4, proposed (replaced):** "**Account for every order.** List each action from each state; every PAIR of the
feature's own actions in BOTH orders, on a published day and an unpublished one; after each, undo, redo, reload;
every action with an opposite, in the opposite direction AFTER publishing, because that is where money freezes. Every
line of that list gets a result. Each distinct order on screen is DRIVEN; repeated cases may be carried by a test
within §7.0's limits, and the sheet says which is which."

**7.5, now:** "…every roll-call row has a mark in every column, every order line has a result, every MISSING has a
disposition, …"
**7.5, proposed:** "…every roll-call row has a mark in every column, every order line has a result — from the walk,
or from a test §7.0 allows to carry it — every MISSING has a disposition, …" *(the rest unchanged)*

### 12. `bug-check-order.md` §9 — the sheet, the `Walk:` line, his fourth check

**"It holds", proposed:** "…the eight answers and the tier · the roll-call table · **the five sizing lines (§7.0)** ·
the orders walked, … · **the cases carried by a test, each with its test and what that test proves** · …"

**Under the `Walk:` line, added:** "The `Walk:` line counts only the surfaces and orders actually walked; results
carried by a test are listed apart."

**His check 4, now:** "Does the order list show BOTH orders, and the after-publish ones?"
**Proposed:** "Does every order on the list — both directions, and the after-publish ones — have a result, with the
walked ones and the ones carried by a test told apart?"

### 13. `bug-check-order.md` §10 — two anti-patterns added to the list

> **The walk by habit** — the same number of walkers and scenarios whatever the change: five walkers on a rule
> inside one calculation, 2.24 million tokens, no fault found in the rule (`[OIL-WORK-START]`, 6–7 Oct 26).
>
> **The walk sized to nothing** — the sizing step used to skip the walk on a change that had a surface to find, or a
> test of the arithmetic named as proof that a button works. "The tests cover it" is how three unwired screens went
> out on 21 Sep 26.

### 14. `bug-check-order.md` §12 — one box of the checklist

**Now:** "- [ ] Every required order and route was walked, including after publishing."
**Proposed:** "- [ ] The walk was sized in writing before it started (§7.0); every required surface and door was seen
and operated; every required order has a result — walked, or carried by a test §7.0 allows — including after
publishing."

### 15. `raptor-port/docs/guide-full.md` — three passages, and one short line of the project guide

**"Sweep the rules, then hand-test against them", step 3, now:** "**HAND-TEST the build against that list** in the
running app (the live-view pass below — real bundle, phone and desktop), walking the list ruling by ruling and
reporting pass/fail per ruling. Unit tests alone do not satisfy this; …"
**Proposed:** "**CHECK the build against that list** under the bug-check order, reporting pass/fail per ruling and
what proved it — what was seen in the running app (real bundle, phone and desktop), or a test the order's §7.0
allows to carry it. The walk is sized there; tests do not replace its screen and control checks, and unit tests
alone do not satisfy this; …"

**Its short line in `raptor-port/CLAUDE.md`, now:** "…list them for him, hand-test the running build against each,
pass or fail, …" **Proposed:** "…list them for him, check the running build against each — pass or fail, by the walk
or by a test the bug-check order allows — …"

**"The bug-check standing order", now:** "…a WALK of the running app across those surfaces and both orders of every
gesture, …" **Proposed:** "…a WALK of the running app across those surfaces, sized for the change (the order's
§7.0), with every required order accounted for, …"

**"The rules-engine robustness doctrine", added at its end:** "The five families stay in the coverage list of every
engine change, his words. HOW each is checked — driven in the walk, or carried by a test — is assigned in the
bug-check order's sizing step (§7.0); it is one walk, not a second one beside it." *(Its short line in the project
guide is his own wording and is left.)*

### 16. `raptor-port/docs/walk-ledger.md` — the fourth of the five sizing lines

*(The ledger's five lines are the step in force today (D607). The readers' first two findings apply to its fourth
line as much as to the draft, so it is proposed here and left unchanged until his word.)*

**Now:** "4. **The walk chosen** — the host's own scripted before-and-after run only / one walker / several — with the
number of scenarios, the sizes (desktop, phone), and what is deliberately left to the tests."
**Proposed:** "4. **The walk chosen** — who walks (the host, one helper, several), the number of scenarios, any sizes
BEYOND the required phone and desktop (and the short screen where it applies), and which repeated cases a test
carries — each with its test and what that test proves. A test that changes the data directly never stands in for
pressing a control on screen (the order's §7.0)."

## What is deliberately NOT proposed

- No table of "type A gets this walk, type B gets that", and no ceiling on walkers (D607's reading (4)).
- No change to who walks (Sonnet 5.5 — D588), who reproduces the finds (the host), or the rule that a helper's
  "found nothing" is weaker than the host's own look.
- No change to the tier rule or its eight questions, to the roll-call, or to the `Walk:` line's form.

## Parked for him (D596)

1. **D607's five readings are the agent's, "not his words until he answers".** This wording rests on two of them:
   "Opus" means the planning model (the host when it is Opus), and the step sizes the walk and removes nothing else.
   *Recommended: confirm both.* (Both readers checked D607's short line against its full row: nothing lost, nothing
   added.)
2. **The floor.** A WALK or FULL change always has a real walk — by the host or by helpers — with its pictures
   opened; "no walk" is never a size. *Recommended: keep it.* (Astra asked that it not be the HOST's run in every
   case — a complete helper walk the host has checked is enough; taken.)
3. **The readers widened the change.** The first draft touched eleven places. Both readers showed, with the same
   example, that it could not work without also rewording the order's opening sentence (§0), "Walk every order"
   (§7.4), and three passages of the project guide — otherwise the next chat reads those and walks everything
   anyway. Those are now edits 2, 4, 10, 11 and 15. *Recommended: accept them — they are what makes the sizing step
   real; the surfaces-must-be-seen-and-pressed rule is kept in every one.*
4. **A second read?** D70 gives one round each, and this version has had none. *Recommended: no second round for
   the wording as it stands, since the changed sentences are the readers' own; but if he changes any of it, the
   changed part is read once more before it goes in.*

## The two reads — 7 Oct 26, each alone, the cap of one round each

Reports, verbatim: `raptor-port/docs/superpowers/briefs/2026-10-07-walk-sizing-wording-read-astra.md`,
`…-read-sol.md`; the brief: `…-read-brief.md`. Both: **CHANGES REQUIRED**. Neither read the other's report.

| Finding | Who | What was done |
|---|---|---|
| A named test could stand in for a route that must be pressed on screen (the published day's switch, tested only by changing the stored value) | both, first | **Taken** — the third bullet of §7.0 rewritten from both readers' wording; the same limit carried into edits 1, 2, 5, 10, 11, 12, 14 |
| "Which sizes" made the required phone, desktop and short-screen sizes optional | both | **Taken** — "sizes BEYOND the required ones" (edit 9) |
| Sentences left unchanged still ordered the unsized walk: §0, §2a, §3, §7.3, §7.4, his check 4 in §9, and the project guide's rules sweep, standing-order summary and robustness doctrine | both | **Taken** — edits 2, 4, 5, 10, 11, 12, 15 (replaced, not qualified) |
| The fan-out sentence weakened D16 (a long pass MUST be fanned out) | Astra | **Taken** — edit 6 in Astra's words |
| The floor demanded the HOST's own run even after a complete helper walk | Astra (Sol had no objection to the floor) | **Taken** — "the host or the assigned helpers" (edit 9); parked point 2 changed to match |
| "A real fault means the change is not the type it was taken for — widen" was an automatic rule he did not make | both | **Taken** — the fourth bullet of §7.0, merged from both |
| The draft treated the size marker of `bug-check.md` as a line limit | Astra | **Taken** — edit 1 (D141) |
| The `Walk:` line should count only what was walked | Astra (Sol: the same) | **Taken** — edit 12 |
| The ledger's types A, E and R, and its "at most one walker", read as a sizing table | both | **Taken, in the ledger** — the three cells and the closing paragraph rewritten |
| The ledger's cost paragraph mixed the planted-fault trial with ordinary walks, and gave the wrong range | both | **Taken, in the ledger** — seven walkers and 3.47 million, the trial apart |
| The ledger's conclusions claimed more than its rows show ("no walk found an arithmetic fault"; "paid for itself whenever"; exact totals) | both | **Taken, in the ledger** — the conclusions and the totals reworded |

**Not taken: nothing.** No finding was judged wrong; where the two readers' wording differed, the stricter was used.
