# The bug check triggers ITSELF — always, every session

Unscoped on purpose, like `plain-language.md`: it loads before any project file is read, so it is in force before
anything else can talk you out of it. The full method is `raptor-port/docs/bug-check-order.md`; this file makes sure
you open it — by its checklist, `raptor-port/docs/bug-check-checklist.md`, which names the section to open at each step
(D1735).

## The trigger — you decide this, never the owner

He must never have to say which checks to run (D9). The bug-check order is in force the moment any of these is true:
- he asks to bug-check, test, verify, review, "check for bugs", "make sure it works", or asks whether something is safe
  to merge;
- you have just built, fixed or changed anything under `raptor-port/src`;
- you are about to report a piece of work as done, ready, or ready for "merge live";
- he reports something wrong on screen, or asks why something looks or behaves a certain way;
- a review, a gate or a reviewer hands back a finding you are about to act on.

Then, before you execute anything:
1. **Read the checklist, and at each step the section of the order it names** — whole, whenever that step applies;
   open them, never from memory: they change (D1735).
2. **Answer its eight questions (§5)** against the actual change, and state the tier out loud: NONE / LOOK / WALK /
   FULL. A question you cannot answer NO with a reason you could write down is a YES.
3. **Tell him, in one short block, what that tier means you are about to do** — the list of checks, the size of the
   walk and why, and roughly how long (D607, D608 — step 4). He reads it; he does not have to choose it. If he wants
   less, he will say so — his call to make, not yours to assume.
4. **Then execute it,** in the order §5 gives: roll-call and door check → size the walk
   (`raptor-port/docs/walk-ledger.md`) → walk → gates → the model reads → fix → re-walk what the fixes touched →
   evidence sheet → his look. Sizing never means no walk, and a test that changes the data directly never stands in
   for pressing a control on screen (the order's §7.0 — D607, D608).

## A fault he finds that the walk missed (D1297)

- Learn from it by yourself, the same day, without asking him: fix it red-first, write why the walk missed it as a
  lesson in the order's §7.11, and from then on every sizing step and walker's brief checks its scenarios against that
  list (D1297).
- Every closing report names the lessons added, and he may strike any (D1297).

## The three that get skipped under pressure — do not

- **A code review plus green tests is not a bug check:** reading code cannot find a line that is not there.
- **The roll-call comes first:** list every place the app draws the thing you touched, and give each one a written
  *has it / must not, because… / MISSING*. No blank cells.
- **A walk that left no picture did not happen:** the closing report carries the `Walk:` line from §9, and without it
  nothing may be reported as ready for "merge live".

## When to call in Fable and Codex

- §4 of the order decides it, not habit (D353: scenarios and side questions one reader — a fresh Opus reader unless he calls
  Astra; a plan's red team both, when he calls them, and a fresh, blind Opus reader meanwhile — who they are now,
  below: D590, D601, D790, D903, D1734, D1738, D1739, D1761, D1760). Its short form: scenario design first — ask them what is
  missing, not whether the code is wrong; both of them reading the code only on money, published records, permissions
  or persistence, when he calls them; and never another static review when what is missing is someone running the app — that one is called
  review pile-on.
- **Who they are now:** Astra and Sol 6.1 are called only when he calls for them, each time — D1738 and D1739 call
  Astra for the rules diet's reworded steps, D1761 for every working-guide change, the fresh Opus reader the second (his design-lesson lines excepted),
  and D1743 his readers for the work in hand until Mon 9 Nov 26 19:00 (Sol
  6.1 too where a second reader fits). When he calls them, for work Opus wrote Astra reviews and Sol 6.1 is the
  second reader where two are required. Fable is on call only — a bug Opus cannot crack, or a big open-ended plan — on
  his word. What Codex wrote, Opus reads (D590, D601, D790, D903, D1734, D1738, D1739, D1761, D1743).
- **Unless he calls for a ChatGPT reader,** every job that needs a code read gets a fresh, blind Opus read of its
  finished code, never by the chat that wrote it (D790, D903, D1734, D1738, D1739, D1761).
- **Fable is used for nothing unless he calls for it** — the riskiest changes get the Opus read alone (D903).

## What is not a finding (D56) — read this before you spend anything

- **A problem that lives only in data already stored is not a finding:** no reviewer, no walk step, no fix. The whole
  store is demo data and is cleared before the database step (D56).
- **Both must be true, or the rule does not apply:** the harm exists only in data already stored, and the code is
  already correct going forward. If new data would be hurt too, it is a real finding (D56).
- **"Pre-existing" alone is not this** — that is about the defect's age; this is about the data's future (D56).
- **Put the exclusion in the reviewer's brief,** so the finding is never produced (the order's §2b, §4 — D56).

## If you catch yourself about to skip it

Say so to him, plainly, and say why. A skipped check he agreed to is a decision; a skipped check he never heard about is
how three bugs reached him on 21 Sep 26.

## With the Claudex loop — moved whole to `raptor-port/docs/bug-check-order.md`, after §4a (D1556)

## The old wording of this file, its stories and worked examples with it — moved whole to `raptor-port/docs/archive/rule-files-2026-11-08.md` (D138, D1735)
