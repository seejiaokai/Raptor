# HOW THIS PROJECT BUG-CHECKS — the standing order

Adopted 21 Sep 26, after the OIL build. Merged from two independent proposals written by models
that did not build the code: Fable 5.1 and Astra/Codex. Both are kept verbatim beside this file
(`superpowers/briefs/2026-09-21-bugcheck-method-fable.md`, `…-codex.md`) so the reasoning behind
each rule survives; where they differed, this file is what was adopted.

**It absorbs and replaces three earlier standing orders** — the 16 Sep scenario rule, the 20 Sep
rules sweep, and the 21 Sep "test like a human" rule. All three are inside it; nothing is lost.

---

## 0. The one sentence

**A build is not checked until someone has driven the real app across every place the feature
shows, in every order it can be used, on a day that has everything on it — and left the pictures
and the table that prove it.**

The rule that overrides all others: **a walk that left no picture did not happen.**

---

## 0a. It fires itself — the owner never picks the checks

**Owner, 21 Sep 26:** *"the bug check order auto automatically kick in based on the right scenario
and will recommend what checks to do. And this will be a standing order henceforth. So that i dont
need to figure out what kind of bug checks to execute and u will read this bug check file to know
what to do before u execute."*

So the agent decides, and tells him. He is never asked "which checks shall I run?" — that question
is the agent's job, answered out of §5.

**The trigger.** The order is in force the moment any of these is true:

- he asks to bug-check, test, verify, review, "check for bugs", "make sure it works", or whether
  something is safe to merge;
- anything under `raptor-port/src` has just been built, fixed or changed;
- work is about to be reported done, ready, or ready for "merge live";
- he reports something wrong on screen, or asks why something looks or behaves a certain way;
- a review, a gate or a reviewer hands back a finding that is about to be acted on.

**Then, before executing anything:**

1. **Open this file.** Not from memory — it changes.
2. **Answer the eight questions in §5** against the actual change and **state the TIER out loud**:
   NONE / LOOK / WALK / FULL. If a question cannot be answered NO with a reason that could be
   written down, the answer is YES.
3. **Tell him in one short block what that tier means you are about to do** — the checks, and
   roughly how long. He reads it; he does not choose it. If he wants less, he will say so, and that
   is his call to make, not the agent's to assume.
4. **Execute it in the order §5 gives**, and finish with the `Walk:` line from §9.

**If you are about to skip a step, say so and say why.** A skipped check he agreed to is a
decision. A skipped check he never heard about is how three defects reached him on 21 Sep 26.

**This replaces every earlier bug-check instruction** — owner, same day: *"The previous methods I
told I to bug check. I think this is the most comprehensive one. So just follow this instead."* The
16 Sep scenario rule, the 20 Sep rules sweep and the 21 Sep test-like-a-human rule are all inside
this file. Follow this one; do not run four overlapping methods. The older notes are kept only for
the evidence that produced them and point here.

`.claude/rules/bug-check.md` is the short always-loaded copy of this section, so the trigger
survives even when this file has not been opened yet. **This file is the authority; that one is the
reminder.**

---

## 1. Why — six failures in one build, all on the same day

Not theory. On 21 Sep 26 the OIL build had five automatic gates, ~5,300 passing tests, two
independent code reviews by two different frontier models, a written register of every ruling, and
a map of which screens each feature touches. The owner opened the app and found three defects in
minutes.

1. **The two code reviews found five real money defects and were blind to three more.** All three
   were the same shape: a place on screen the feature was never connected to. Every line of code
   that existed was correct.
2. **The tests were written against the surfaces that already worked.** Every test of the green
   edge used a duty desk or a ground row — the two kinds of seat that already went through the
   shared drawing routine. The suite proved the feature worked exactly where it worked.
3. **The warning existed and pointed the wrong way.** The screen map had already named this hazard,
   worded as *"a NEW seat renderer that forgets the mark"*. The holes were in two EXISTING ones.
4. **A hand test walked one order and passed.** The other order had no door on any screen.
5. **The agent substituted a cheaper check and could call it compliance.** It commissioned two
   reviews, told both not to run anything, ran the suite, and reported. Nothing made that
   impossible.
6. **A comment vouched for coverage it did not have.** The week's seat builder carried a note
   saying the mark *"reaches the flying lines"*. It reached everything that routine drew, and that
   routine did not draw the flying lines.

**And then it kept going.** Once the app was actually driven, the same bug had **four** instances,
not one, and two more surfaced that nobody had predicted: the editing mode's gesture did not work
on the flying seats, the SC shifts or the Common Programme; and events that can never earn were
still offering a switch that, on a published day, would have cost a real amendment for a decision
that moves no money.

---

## 2. The idea under all of it: two kinds of defect

- **A WRONG line.** Code that exists and is incorrect. Reading finds it. Tests pin it.
- **A MISSING line.** Code that should exist and does not — a screen the feature was never wired
  to, a door that was never built, a gesture that was never hooked up.

**Every check this project had was built to find the first kind.** Reading finds wrong lines. Tests
confirm what someone thought to assert. Only a roll-call and a walk find missing lines. That is the
whole reason this order exists.

---

## 2a. This is NOT about OIL — how it adapts to any kind of work

The OIL build is only the evidence. Nothing in this order is specific to it. It is keyed to the
SHAPE of a change, not its subject, and the eight questions in §5 do the adapting for you.

Read this table as "what kind of work am I doing" → "what this order will make me check":

| The kind of work | What the order makes you do | The thing it is looking for |
|---|---|---|
| **Interface / anything visible** | Roll-call every place that thing is drawn; walk each one; both widths; with the normal overlays present (a chip, a badge, a long name, a warning ring) | A surface the change never reached. Something painted over something else. |
| **A new control, gesture or mode** | The door check: name the on-screen control for every action, in every state; then operate it on every surface, not just the one you built it on | A control that is drawn but does nothing. An action the data allows with no door. |
| **Rules and logic** | The rules sweep: list every applicable ruling, walk it against the behaviour; a ruling about something SHOWN gets one mark per surface, a ruling about MONEY one per order | A rule quietly doing a job a later ruling took away. A rule that holds on one screen and not another. |
| **Money or entitlement** | FULL tier: both models read the code independently, plus the walk, plus the real downstream number checked — not just the screen | Money decided from live state instead of the issued record. |
| **Published or signed records** | Both orders across the publish boundary; undo of a publish; the amendment and the signature checked each time | A change that moves money without an amendment, or an amendment that moves none. |
| **Saved data / storage** | Reload, leave and return, and the reset path walked; older saved data read | A write that never persists. Data that cannot be read back after an upgrade. |
| **Permissions and roles** | Every role walked on every affected surface, including the read-only viewer | A control offered to someone who cannot use it, or hidden from someone who needs it. |
| **Cross-app seams** (Leave War, Tracker, the shared data) | Walk the change on BOTH sides of the seam and confirm the two agree; the order's "both arrive" rule for anything that can be true on both sides | Two screens telling the same person different things. |
| **Cross-platform / phone vs desktop** | Both widths on every walked surface, always; a real touch target, not just a visible one | Something legible on a desktop and clipped, unreachable or two rows tall on a phone. |
| **Performance** | The existing ceilings gate plus the walk; the change measured, not assumed | A gate raised to accommodate a regression instead of the regression being fixed. |

**The one part written in this app's own words is §7.1**, the day that has everything on it. That is
the FIXTURE PRINCIPLE, not a fixed list: *never test on the convenient case; build the worst
realistic one and keep it in the demo data.* For the scheduler that is a weekend carrying every
kind of row and every kind of man. For the Tracker it would be a course carrying every kind of
mark, a hidden chart, a student who left, an imported file. For the Leave War, a period with every
stage, a bid that clashes, a man posted out mid-period. **A feature in a new area writes its own
everything-case once and reuses it forever** — that is the same investment, not a new rule.

---

## 2b. WHAT IS NOT A FINDING — the demo-data test (owner, D56, 23 Sep 26)

**Owner:** *"Make sure the bug checks dont waste time catching these bugs in the
future. It will not happen because ill clear all the demo data anyway before
shiping this app into a real database."*

**A problem that lives ONLY in data already stored is not a finding.** Do not
spend a reviewer on it, do not add a walk step for it, do not fix it. The app is
pre-promulgation and its whole store is demo data that **will be cleared before
the database step** — so the harm has an end date, and building around it buys
nothing.

**THE GUARD — both must be true, or the rule does not apply:**

1. the harm exists only in data **already stored**, AND
2. the code is **already correct going forward**.

If the app would do the same thing again to NEW data, it is a real finding and
this section is irrelevant to it. **"Pre-existing" alone is NOT this rule** —
§4's own warning still stands, that the dangerous category is old code a new
feature has just made reachable. The test is about the DATA's future, never about
the defect's age.

**What it cost to learn.** One session spent about 25 minutes building a sentence
that can never fire again once the data is cleared (`OIL_OLD_BLOCK`: a day
published by an older build explaining why it reads "1 pending"). A reviewer
raised it, the owner asked for it, and the reason that made it moot arrived
afterwards. Nobody was careless; the information came in the wrong order. **That
is what this section exists to fix — the brief in §4 now tells both providers
before they start, so the finding is never produced.**

---

## 3. The kinds of check — what each is FOR and what each is BLIND to

| The check | What it is, plainly | What it is FOR | What it CANNOT see |
|---|---|---|---|
| **The gates** | The machine's own checks on every change: the unit tests, the build, the byte-exact comparison with the original app, the real-browser layout checks, the Tracker smoke, the rule-coverage check. | Stopping a rule that already has a test from changing silently; a box that grew; a bar that gained a row. | Anything nobody wrote an assertion for. Unit tests run with no stylesheet, so they cannot see what is painted. |
| **The code read** | A model that did not write the code reads it. | Wrong arithmetic; a rule applied in the wrong place; money decided from the live copy instead of the issued one; a copy that is really a shared reference. | **A line that is missing.** A screen never connected. Something painted over something else. Anything that only shows when the app runs. |
| **The rules read** | The register of rulings is walked one by one against what the code does. | A ruling gone stale, or one quietly doing a job a later ruling took away. | The same blindness, plus its own: it is indexed by RULING, so it checks each on ONE surface and ticks it. |
| **The roll-call** *(new)* | For the thing the feature attaches to — a man's puck, a row, a day — a list of EVERY place the app draws it, each with a written answer: has it / must not have it, because… / MISSING. | **Missing lines.** The single artefact that would have caught all three of the owner's finds before anyone opened the app. | A wrong line. Whether what IS wired looks right when painted. |
| **The door check** *(new)* | For every action the data allows, the name of the screen control that lets a person do it — in every state, in every order. | A thing the data permits that no screen offers. An action that works before publishing and has no door after. | Whether the door does the right thing once opened. |
| **The walk** | An agent drives the REAL built app in a real browser, phone and desktop width, on a day that has everything on it, through every surface in the roll-call and every line of the order list, taking pictures. | The seams: a mark painted over by a chip; a seat drawn but not tappable; a mode that strands the board; a control that does nothing. Anything that only exists when the whole app runs. | Money wrong by an amount the screen does not show. States it did not set up. Anything it did not think to walk — which is why it is DRIVEN by the roll-call, not by instinct. |
| **The owner's look** | Five minutes of the owner using the app on the seeded day, pictures first. | The gap between what was built and what he meant. He tests EXPECTATIONS where every other check tests IMPLEMENTATIONS. | Everything under the surface: money, the freeze, history. He is not the test department. |

A screenshot proves appearance, never a gesture. A browser test is not the walk. A code read is not
the walk. **"Clean" from a reviewer means "this reviewer found nothing" — never proof.**

---

## 4. WHERE TO SPEND FABLE AND CODEX

Their reasoning is stronger than the builder's on some jobs and useless on others. Spend them
deliberately. Ranked by value for the cost:

| Rank | Job | How many | Why it beats the builder alone |
|---|---|---|---|
| 1 | **Designing the test scenarios** — hunting for what is MISSING, not reviewing what is there | One model | It works from what was PROMISED, not from what the builder happened to build. On the OIL build, Fable's two top-ranked predictions were both real defects. |
| 2 | **Reading the code, on high-consequence work** — money, earned entitlement, deletion, permissions, published or frozen records, persistence, live-versus-issued reads | **Both, independently, blind to each other** | Fresh reasoning catches silently wrong existing code. It found five money defects here that driving the app would probably never have surfaced. |
| 3 | **Red-teaming the RULES before building** | One; both if conflicting rulings touch money or authority | Catches a rule that is obsolete, incomplete or self-contradictory before code hardens around it. |
| 4 | **Attacking the method itself, after a defect escapes** | One drafts, the other attacks | Outsiders change the checking system; the builder defends the process that missed it. After escapes, not routinely. |

**Do NOT spend them on:**

- **Another code review when the missing evidence is runtime.** This is the trap that was actually
  fallen into. Recognise it by: blank rows in the roll-call, untested gestures, layering, mobile
  layout, reachability, or no run of the exact release build. **Go and drive the app instead.**
- **The same prompt against the same diff.** If nothing about the question has changed, it is
  review pile-on.
- **Confirming a finding you already have.** Reproduce it; do not buy a second opinion.
- **Deterministic work** — running gates, known regression tests, executing a matrix already written.
- **A one-surface cosmetic change**, unless it introduces layering or hit-target risk.
- **"Is this clean?"** — manufactures confidence without proving completeness.
- **Replacing the owner's look.** No model can say whether the workflow makes sense for real
  scheduling work.

**The brief that turns a reviewer into a finder.** This wording is the difference between the
result in §1.1 and the result in §4 rank 1 — use it verbatim:

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

**And tell them what is NOT a finding, in the same breath (owner, D56, 23 Sep 26)** — this sentence
saves more time than anything else in the brief, because it stops the finding being produced rather
than dispositioned:

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Also: demand **exact, step-by-step fix instructions per finding**, not a direction; and demand
**explicit negatives** ("I checked X and found nothing") — a confident all-clear from one model on
an area the other found a defect in is the cheapest possible pointer to a real bug.

**Never show either model the other's conclusions before both reports exist.**

**What to do with what they hand back** — this is the requesting agent's job, not theirs:

1. Reproduce each finding through the real production route on the exact revision.
2. Check it against the governing ruling.
3. **Compare against `main` before calling anything newly introduced.** Severity depends on it, and
   the two models disagreed about this on three findings here.
4. Record user impact, reachability and provenance SEPARATELY. "Pre-existing" never erases severity
   — the dangerous category is *old code a new feature has just made reachable*.
5. Disposition every claim: confirmed-new / confirmed-pre-existing / duplicate / false positive /
   unresolved.
6. Settle disagreements with evidence, never by confidence or majority.
7. Every confirmed defect gets a regression test and a row in the roll-call.

**A long walk is FANNED OUT across parallel helpers, not walked serially (owner, D16, 21 Sep 26).** The
helpers are Opus agents, and each walks its own WORLD — its own port, its own fresh browser context, its own
copy of the demo data — so no two share a fixture; each is handed the fixture recipe rather than left to
rediscover it. The price of the speed: a helper's "found nothing" is weaker evidence than the host's own look,
so each returns PICTURES and a filled table, and the host REPRODUCES every finding before it enters the
evidence sheet. **While they walk, nobody rebuilds the build they are served** (23 Sep 26): a rebuild swaps the
bundle under them and mixes pre-fix and post-fix behaviour in one walk. The host fixing in parallel typechecks
without writing output and runs unit tests; the rebuild, the gates and the re-walk of the fixes wait for the
walkers' reports.

**The owner's trigger rule, in one line:**

> Call one other model whenever a change affects more than one surface, door, role or app
> boundary, or when a ruling has to be turned into test scenarios. Call **both** whenever a wrong
> result could silently pay, withhold, delete, authorise, publish, freeze or corrupt lasting data.
> Call them again only after a new KIND of defect escapes — not because more reassurance is wanted.
> **If what is missing is seeing, clicking, layering or reachability in the running app, go and
> drive the app instead.**

---

## 4a. How this fits the Claudex loop

They do not compete. **Claudex covers the plan and the code; this order covers the running app.**
Claudex's own rules stand unchanged — in particular *the provider that built never inspects*, and
*never disable or bypass the workflow's independent reviewer* (`.claude/rules/raptor-executor.md`).
This order adds checks; it never removes one of Claudex's.

| Claudex stage | What it is | What this order says about it |
|---|---|---|
| **Plan review** — the host plans, the other provider attacks the plan before any code | The pre-build red team | This IS §4 rank 3, and Claudex is the machinery for it. The owner's cap of about three rounds still applies; after that, findings fold into the build. |
| **Build** — one provider implements | — | Unchanged. The implementation stays in the main session (the executor rule). |
| **Final inspection** — a fresh session of the provider that did NOT build reads the finished code | The post-build code read | This is §4 rank 2 — but with two changes, below. |
| *(nothing)* | — | **Claudex has no step that runs the app.** That is the gap this order fills, and it is where every defect the owner found tonight lived. |

**Three things this order changes about how Claudex is used:**

1. **The WALK goes BEFORE the final inspection, not after.** Drive the app first, fix what it
   finds, then hand the inspector the finished code *and the evidence sheet*. Reading for absence
   works when there is a roll-call in hand; reading cold does not. On the OIL build the inspection
   ran first, passed, and three unwired surfaces went out behind it.
2. **On FULL-tier work, one inspector is not enough.** Claudex's default is a single fresh session
   of the other provider. Where money, entitlement, published records, permissions or persistence
   are touched, run **both** providers independently and blind to each other (§4 rank 2). That is
   what found five money defects here that driving the app would not have.
3. **The inspection brief gets the finder wording from §4.** Claudex's inspector is asked whether
   the code is wrong. Add the sentence that asks what is MISSING, or it will answer only the first
   question.

**And one thing that does not change:** Claudex binds approval to the plan's path and hash. A
bug check never re-opens an approved plan. If the walk finds behaviour the plan never decided,
that is a question for the owner (§11), not a change made under cover of a fix.

**In one line:** run Claudex to harden the plan, build, then **walk the app**, then run Claudex's
inspection — both providers if the change touches money — and only then report, with the `Walk:`
line.

---

## 5. Which checks for which change

All of it on everything would be abandoned in a week. The tier is decided by facts read off the
change, not by a feeling about risk. **Eight questions — if the agent cannot answer NO with a
reason it could write down, the answer is YES:**

1. **Money** — does it touch what a man is owed or paid, or how many count as present **Earned leave counts** — OIL is time off banked, not pay (D25), and a wrong answer there is owed just the same, so it fires this question.
2. **The published record** — publishing, signing, amendments, the issued copy, a saved version,
   undo of a publish?
3. **Saved data** — what is stored, the reset version, how older data is read?
4. **A shared drawer** — a drawing routine called from more than one place, or a mark that must
   appear wherever a man, a row or a day is drawn?
5. **A new gesture or mode** — a new control, tap target, mode or button?
6. **A new surface** — a new screen, panel, sheet or kind of row?
7. **Roles** — who may do or see something?
8. **The warning list** — what the warnings say, or how a rule is read?

**YES to 1, 2, 3, 7 or 8 → FULL. Otherwise YES to 4, 5 or 6 → WALK. Otherwise cosmetic on one
surface → LOOK. Words only → NONE.**

**The server question (owner, D202, 26 Sep 26) — asked of EVERY change, whatever the tier:** does it change **who may do
something**, **what someone is owed** (OIL credits and awards, leave balances, a Leave War decision), **an official record**
(a published day, its amendments, sign-offs, the change history) or **who can see personal details** (medical)? If yes,
the rule must hold on the server at the database step, so update the permissions table — `docs/data-model.md` §11 — in
the same change, and say so on the evidence sheet. Until `[ACCOUNTS]` puts the app's permission checks in one place with a
test tied to that table (D200); from then on the test catches a missed update, and this paragraph points at it.

Note what this does to "display only": the green edge was display only, and three of its defects
lived in a shared drawer and a new mode. **A cosmetic change to a shared drawer is never LOOK.**

| Tier | What is done | Cost on top of the build |
|---|---|---|
| **NONE** | Nothing. | 0 |
| **LOOK** | The gates; one before/after picture at phone and desktop; a two-line evidence sheet. | 15–20 min |
| **WALK** | The gates; the roll-call (if a shared drawer); the door check (if a gesture); the walk of the touched surfaces at both widths; the new gesture in both orders; a break test per surface; the sheet. | 1–1½ h |
| **FULL** | Everything: the rules sweep; the other model designs the scenarios; the roll-call; the door check; the full walk; break tests; the case seeded into the demo data; **both** models read the code, given the sheet and asked for absences; re-walk what the fixes touched; the sheet with its pictures; then the owner's look. | 3–5 h of agent time |

**Order of steps in FULL:** build → gates → roll-call and door check → walk, and fix what it finds
→ gates → the two reads, *with the evidence sheet in their hands* → fix → re-walk only what the
fixes touched → gates → finish the sheet → the owner's look → his "merge live".

The walk goes **before** the reads, so the reviewers read the final code and can check the
roll-call for gaps — reading for absence works when there is a list in hand.

**Between fix rounds, run the touched surface's own suite — not once at the end** (23 Sep 26). Two fixes that
are each right can contradict each other: a hint that names a door, beside a fix that removed that door. And
when a fix removes or gates a door, search every sentence on screen that names it.

**The re-walk** (23 Sep 26). Write walk scripts as assertions of the RIGHT behaviour (a PASS means correct), so
re-running them on the fixed build IS the re-walk. Send it to a separate output folder — the first walk's
pictures are the defect's evidence. Read every re-walk FAIL against the NEW flow before calling it a
regression: a step whose premise the fix itself consumed (nothing unsaved is left to test; a refusal now drawn
on top of the window it used to hide behind) is walked again with a fresh premise, not reported.

---

## 6. The roll-call — the defence against "never wired up"

**The question, asked of the feature before anything else:**

> *Name the THING this feature attaches to. List every place the app draws that thing. For each
> place answer three columns: does it SHOW the new mark, is the new gesture USABLE there, and what
> else is PAINTED on the same pixels?*

Produced mechanically in fifteen minutes: every call site of the shared drawing routine, plus every
kind of row that can hold the thing. **Every line gets YES / NO-because / MISSING. No blank cells,
and no "not applicable" without a reason.**

On the OIL build this one table would have caught all three of the owner's finds before the app was
opened: the board's cockpit and Common Programme drawers appear in the list and pass no mark
(column 1); the same two emit no tap hook (column 2); and the warning chip is the first thing drawn
inside the puck, over exactly the strip the mark occupies (column 3).

**Two rules that follow from failure 3 and failure 6:**

- **A hazard is never written pointing forward.** "A NEW drawer that forgets X" will be read as not
  applying to anything that exists. Write it as a roll-call of the EXISTING drawers — *"X must
  appear in these seven; the test walks them"* — and run that roll-call the day you write it.
- **A comment that vouches for coverage names the test that proves it, or it is deleted.** A
  comment is a claim, not a proof.

**And two from later walks (23 Sep 26):**

- **A new floating surface names every surface it can open over.** Its third-column answer lists every
  full-screen or fixed surface beneath it, and a browser test on each asserts that the element at the new
  surface's centre is the surface or inside it (`hit = document.elementFromPoint(x, y)`;
  `hit === surface || surface.contains(hit)`). Layering is a missing
  line only a real browser can see: a window shipped stacked below the full-screen board it had to float
  over, and opened invisibly there, while every test passed.
- **A wording ruling, or a fix to one writer of a record, gets its own small roll-call in the same commit** —
  every place that draws that text or writes that record. The fix is STRUCTURAL (one shared constant or one
  shared body), with a test that renders or drives each place. The "grep for the old wording" rule already
  existed both times this failed.

---

## 7. The walk

**7.1 Build the day that has everything on it — never the convenient one.** A published Saturday, an
unpublished Sunday, a weekday beside them, and a public holiday declared after the Saturday went
out. Carrying every kind of row and every kind of man: a flying line; an SC shift with a MAIN and a
SPARE; an exempt AVALON/BB line and its desk; a duty desk with times and one without; a sim with
passengers; a ground row with times, one that came from an input, an ⓘ info-only row, a cancelled
row, a zero-length row; a Common Programme row with ALL AVAIL and one with named people; a claim
answered yes, one answered no, one taken off the programme; an overseas duty under Unavailable; a
SANS man on the programme and a hidden one; a named ground-crew man; a man posted out since the day
was published; a man wearing a warning chip; a man on four rows where two count; a parked plan; an
amendment pending.

**It lives in the demo seed**, so a fresh boot shows it, the owner's look starts on it, and the next
session does not rebuild it from memory. Extended in the same change whenever a new kind arrives.

**7.2 Stand up the real thing.** The production build, served locally, opened fresh, phone and
desktop width, with the browser's error list watched throughout. Any error during the walk is a
finding.

- **For a long hand pass, drive it with a SCRIPTED real browser from the start (owner, D17, 21 Sep 26)**, not
  the in-app browser panel. Both run the real bundle, but the panel is one click per message, resizes under you
  and times out on screenshots, so the pictures this order requires come out unusable. The scripted driver
  replays a whole day in about a minute, saves full-size pictures to disk, and is what makes handing the walk to
  parallel helpers possible (§4). The reusable drivers live in `raptor-port/scripts/handpass/` — use the
  surface's own helper (`lib.mjs` for the scheduler and OIL walks, `trk-lib.mjs` for the Tracker). Looking at
  the pictures is still the agent's job — the tool changed, the looking did not.
- **The driver moves the view the way a person does** (23 Sep 26) — with the surface's own scroll or
  drag-to-pan (in some modes the wheel zooms instead), and checks the target sits inside its scroll box before
  acting. A scripted gesture that fails is looked at on its picture before it is called a defect: a generic
  scroll-into-view that parks the target under a toolbar manufactures findings.
- **Walk a SHORT screen as well as the two widths** (23 Sep 26) — a phone on its side, a 700px-tall laptop
  window — for any surface built as a viewport-tall column, and measure EVERY edge-docked control against the
  screen edges, not only the one being changed. (Room to scroll past the end goes inside the scroll box as a
  spacer, never as padding on it: padding sets the box's smallest height.)

**7.3 Walk the surfaces, not the rulings.** This is the difference that cost the OIL build three
defects. A ruling about something SHOWN or TAPPED gets **one mark per surface**. A ruling about
MONEY gets **one mark per order**.

**7.4 Walk every order.** Each action from each state; every PAIR of the feature's own actions in
BOTH orders, on a published day and an unpublished one; after each, undo, redo, reload; every action
with an opposite walked in the opposite direction AFTER publishing, because that is where money
freezes.

**7.5 You have walked enough when** every roll-call row has a mark in every column, every order line
has a result, every MISSING has a disposition, the error list is empty or named, and the pictures
exist. Not when it feels fine.

**7.6 A MISSING has three dispositions and no fourth:** fixed with a test that was red before the
fix; ruled "leave it" by the owner, with the date; or filed in `OUTSTANDING.md` with its place in
the order. **"Rare" is not a disposition unless a scenario proves it rare.**

**7.7 Create the fixture through the app's own controls.** If the state cannot be reached that way,
that IS the finding — a missing door. Do not inject it and call the route tested. **Never sign in again
mid-fixture on a fresh demo world** (24 Sep 26): a sign-in reloads the page, and a world nobody has written to
yet comes back WITHOUT its Leave War OIL story while its Inputs survive — the walk then runs against a different
world. Make one write before any reload (the app's own controls, this rule's first sentence); or, when the
fixture must stay unwritten, change the role in place through the localhost probe bridge — `window.lwSetRole` /
`window.raptorRole` via `page.evaluate` in a walk script, or their Playwright wrappers `lwRole` / `raptorRole`
(`raptor-port/e2e/app.ts`) in an e2e test. That changes only the role a person would reach by signing in, not
the world.

**7.8 A gesture step asserts what the person SEES, in screen terms — never only that a value moved** (23 Sep
26). For a zoom, what was under the fingers stays under them: measure its on-screen position before and after,
against where the fingers end. For a drag, the thing follows the finger. A pinch that "zoomed 100% → 147%"
passed while aiming 800px away from the fingers. Drive multi-finger gestures for real — an
`Input.dispatchTouchEvent` sequence over CDP (`touchStart`, one or more `touchMove`, `touchEnd`) with two touch
points gives real pointer events — in EVERY mode the surface has.
Worked example: `raptor-port/scripts/handpass/trk-pinch.mjs`.

**7.9 A walk proves the engine it ran in** (24 Sep 26). When a change redraws or removes the element under a
held finger — or relies on which element receives the lift — list how each engine the owner uses delivers
those events (Safari can send a touch's later events to the element it landed on even after a redraw removed
it; Chromium retargets them), and add a synthetic check per difference: dispatch the other engine's sequence
directly on the element it would reach. Name in the evidence sheet every line only a real device can prove,
and put it on the owner's look card.

---

## 8. Making the checks FIND rather than CONFIRM

1. **Tests loop over the roll-call, never over one fixture.** A test of a mark walks every KIND of
   seat and asserts each by name.
2. **The fixture is the everything day.** A test that sets up a duty desk and a ground row tests a
   duty desk and a ground row.
3. **Fixtures write the way the app writes.** A test that replaces an object where the app changes
   it in place is testing a different program — that is how a published day rewriting itself passed
   5,326 tests. Sign through the real signing path; mark through the real gesture; publish through
   the real publish. A test that cannot is RENAMED to say what it actually proves.
4. **Red first, and the break test.** Before a fix goes in, a test must fail on the bug. And for
   every surface the roll-call marks as wired, break that wire once on purpose and watch a named
   test go red. If nothing goes red, **that surface has no test, by proof** — write one before
   continuing. Two or three minutes per surface.
5. **The other model designs the scenarios.** The builder's tests encode the builder's picture of
   the feature and share its blind spots.
6. **Reviewers are handed the roll-call and asked for absences**, not only for errors.
7. **A ruling's "left as it is today" half is a requirement too** (23 Sep 26). Before building the changed half,
   pin the unchanged half with a test against today's behaviour, so the new half cannot absorb it. (Last Flown
   worked out from the flights marked done would have overwritten a day typed by hand the moment any OLDER
   flight was marked — the ruling had kept that half as it was.)

---

## 9. The evidence, and the owner's sixty-second check

One file per build, mostly tables, plus a folder of pictures, written DURING the walk:
`docs/handpass/<date>-<feature>.md`, pictures in `docs/img/handpass/<date>-<feature>/`.

It holds: the eight answers and the tier · the roll-call table · the orders walked, with what the
screen said and what the money said · the pictures · the break tests · errors seen · **what was NOT
walked and why** · the gate counts · what the walk found and each disposition.

**The closing report gains one mandatory line:**

`Walk: docs/handpass/<file> · <n> pictures · <k> surfaces · <m> orders · MISSING: <fixed/ruled/filed>`

or, in those words, `Walk: NOT DONE — <reason>`. A WALK or FULL change with no Walk line **cannot**
be reported as ready for "merge live". Silence is not an option the format allows.

**And two lines about the documents, copied from the output of `npm run docsize`, never retyped**
([DOCS-GUARD], Fable F3/F8, 23 Sep 26). The first says whether every filed record survived the
change, measured line by line against the base — a heading count cannot see a body that was cut or
doubled. The second says whether the files are within their line budgets:

`Docs: OUTSTANDING <n> items (+<a> −<b>, −<b> all in ARCHIVE) · DECISIONS D<x>–D<y> · homes OK`
`docsize: OK` — or `docsize: OVER by <n>, deferred (D29)` on a change that touches `raptor-port/src`.

The second value is LEGAL: a code change is never the place to trim the docs (D29 rule 3), so being
over budget there is reported and left for its own docs-only pass. On a docs-only change, over
budget is a failure — that change IS the trim pass.

**The owner checks five things, in a minute:**

1. Is there a sheet, linked from the report? No sheet, no walk.
2. Open the pictures. Can he see the everything-day — a flying line, an SC shift, a desk, a sim, a
   ground row, a Common Programme row, an input, an ALL AVAIL, a man with a warning? Pictures of
   one kind of row mean it was not walked.
3. Does every roll-call row have a mark in every column, and every MISSING a disposition?
4. Does the order list show BOTH orders, and the after-publish ones?
5. Is there one red break test per wired surface?

Any no, and the answer to "merge live" is no.

---

## 10. The anti-patterns, by name

Use these names in reviews and reports.

1. **The read called a test** — a "bug test" with no picture and no table; reviewers told not to run
   anything, and their report presented as the check. *(This is the one that was actually fallen
   into.)*
2. **Testing where it works** — every assertion against the one kind of row that already worked.
3. **The warning aimed at the future** — "a NEW X that forgets Y…".
4. **The comment that vouches** — "this reaches every surface", with no test named.
5. **The one-way street** — one order, one starting state.
6. **Walking the rules, not the rooms** — one pass per ruling instead of one mark per surface.
7. **The convenient day** — a fixture with a duty desk and a ground row and nothing else.
8. **Green means done** — "5,341 tests pass" offered as the reason it works.
9. **Reading for wrong, never for missing.**
10. **The self-designed scenario** — the builder wrote its own list.
11. **The fixture that replaces where the app mutates.**
12. **Deferred as rare** — closed as narrow with no scenario.
13. **The pass with no picture** — "hand-tested at both widths", nothing attached.
14. **Teaching the test to look away** — relaxing an assertion so a change can pass.
15. **Review pile-on** — commissioning more static reviewers instead of doing the missing runtime
    check.
16. **Screenshot-as-gesture** — a still image used to claim a control can be operated.
17. **Stale-bundle proof** — inspecting an old preview rather than the exact revision.
18. **Blank-cell approval** — the check marked passed while part of the matrix is blank or vaguely
    "not applicable".
19. **Owner-as-QA** — handing him an unverified build and relying on him to find the defects.
20. **The demo-data defect** *(owner, D56, 23 Sep 26)* — a check, a reviewer or a fix spent on harm
    that exists only in data already stored, when the code is already right going forward. The data
    is cleared before the database step; the harm has an end date. Recognise it by the fix being a
    migration, a back-compat path, or a sentence explaining a record an older build wrote. **Not**
    to be confused with "pre-existing", which is about the defect's age and says nothing about
    whether new data still gets hurt (see §2b).

---

## 11. Where the owner fits

He knows what the app is FOR. He reads a Saturday and knows the flying crews earn; he expects to
tap a puck and have it respond. **He tests expectations where every other check tests
implementations** — and no check indexed by what EXISTS can notice the absence of something that
should.

- He looks **last**, for five minutes, on a day that is already built, pictures first.
- He gets a **"look here" card** of three to five lines written as expectations in the app's own
  words — never a list of cases to work through.
- He answers the product questions the walk raises, and nothing else. "Leave it" is an answer and is
  recorded with its date, so it is never re-fixed later as a bug.
- He never picks the tier, reads code, or runs a gate.
- **Every defect he finds costs the method a line.** A find of his is, by definition, something every
  check missed — so it is a method failure before it is a bug, and it adds a roll-call row, an order
  line, a kind to the everything-day, or an anti-pattern above, in the same change as the fix. That
  is how the method improves instead of the owner getting tired.

---

## 12. Before calling a change bug-checked — the non-substitution checklist

No other check may be substituted for an unticked box.

- [ ] The eight questions answered and the tier chosen, in writing.
- [ ] Applicable rulings listed; any clash flagged and resolved.
- [ ] Roll-call complete — surfaces, doors, downstream results, roles, overlays, orders. No blanks.
- [ ] The exact production build was driven, at both widths.
- [ ] The fixture was created through the app's own controls.
- [ ] Every required surface was both SEEN and OPERATED.
- [ ] Every required order and route was walked, including after publishing.
- [ ] The real downstream result was observed — the money, not just the screen.
- [ ] Tests use production routes, or are renamed to say what they actually prove.
- [ ] One red break test per wired surface.
- [ ] The five gates pass.
- [ ] Required model reads done, reconciled, and every finding dispositioned against `main`.
- [ ] The sheet exists with its pictures, and names what was NOT walked.
- [ ] The owner's look done, or explicitly waived.

---

## 13. If only one step could be kept

**The walk of the everything-day, driven by the roll-call, with pictures.** Both models chose this
independently. It is the only check that sees ABSENCE, which is the class that beat everything
else; it is the only one the owner can verify happened without reading anything; and on this
project's own record it has found the most per hour.

Said plainly: losing the two-model code read on a money change would be a **real** loss, not a free
one — it found five money defects here that driving would not have surfaced. The two are
complementary and neither substitutes for the other. That is the whole point of this document.
