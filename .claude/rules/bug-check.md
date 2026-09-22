# The bug check triggers ITSELF — always, every session

Unscoped on purpose, like `plain-language.md`: this loads before any project file is read, so it is
in force before anything else can talk you out of it. The full method is
`raptor-port/docs/bug-check-order.md`. This file exists to make sure you OPEN that one.

## The trigger — you decide this, never the owner

**He must never have to say which checks to run.** The moment any of these is true, the bug-check
order is in force:

- he asks to bug-check, test, verify, review, "check for bugs", "make sure it works", or asks
  whether something is safe to merge;
- you have just built, fixed or changed anything under `raptor-port/src`;
- you are about to report a piece of work as done, ready, or ready for "merge live";
- he reports something wrong on screen, or asks why something looks or behaves a certain way;
- a review, a gate or a reviewer hands back a finding you are about to act on.

**Then, before you execute anything:**

1. **READ `raptor-port/docs/bug-check-order.md`.** Not from memory — open it. It changes.
2. **Answer its eight questions** (§5) against the actual change, and state the TIER out loud:
   NONE / LOOK / WALK / FULL. If you cannot answer a question NO with a reason you could write
   down, the answer is YES.
3. **Tell him, in one short block, what that tier means you are about to do** — the list of checks,
   and roughly how long. He reads it; he does not have to choose it. If he wants less, he will say
   so, and that is his call to make, not yours to assume.
4. **Then execute it**, in the order §5 gives (roll-call and door check → walk → gates → the model
   reads → fix → re-walk what the fixes touched → evidence sheet → his look).

## The three that get skipped under pressure — do not

- **A code review plus green tests is NOT a bug check.** Two frontier models passed the OIL build;
  the owner then found three defects by opening the app, all of them surfaces that were never
  wired up. Reading code cannot find a line that is not there.
- **The ROLL-CALL comes first.** List EVERY place the app draws the thing you touched, and give
  each one a written *has it / must not, because… / MISSING*. No blank cells. That one table would
  have caught all three.
- **A walk that left no picture did not happen.** The closing report carries the `Walk:` line from
  §9. Without it, nothing may be reported as ready for "merge live".

## When to call in Fable and Codex

§4 of the order decides it, not habit. Short form: **scenario design first** (ask them what is
MISSING, not whether the code is wrong), **both of them reading the code** only on money, published
records, permissions or persistence — and **never another static review when what is missing is
someone running the app.** That last one has a name now: review pile-on.

## WHAT IS NOT A FINDING (owner, D56, 23 Sep 26) — read this BEFORE you spend anything

*"Make sure the bug checks dont waste time catching these bugs in the future. It will not happen
because ill clear all the demo data anyway before shiping this app into a real database."*

**A problem that lives ONLY in data already stored is not a finding.** No reviewer, no walk step, no
fix. The whole store is demo data and is CLEARED before the database step.

**Both must be true or the rule does not apply:** the harm exists only in data already stored, AND
the code is already correct going forward. If new data would be hurt too, it is a real finding.
**"Pre-existing" alone is NOT this** — that is about the defect's age; this is about the data's
future. Put the exclusion in the REVIEWER'S BRIEF so the finding is never produced (order §2b, §4).

## If you catch yourself about to skip it

Say so to him, plainly, and say why. A skipped check he agreed to is a decision; a skipped check he
never heard about is how three bugs reached him on 21 Sep 26.

## With the Claudex loop

They do not compete: Claudex covers the PLAN and the CODE, this order covers the RUNNING APP, and
Claudex has no step that runs it. Order of operations: harden the plan with Claudex → build →
**WALK THE APP** → then Claudex's final inspection, given the finished code AND the evidence sheet
→ report. The walk goes BEFORE the inspection, not after; on the OIL build the inspection ran
first, passed, and three unwired surfaces went out behind it. On money, published records,
permissions or persistence, one inspector is not enough — run both providers, independently.
Claudex's own rules stand: the provider that built never inspects, and its reviewer is never
bypassed. Full detail: §4a of the order.
