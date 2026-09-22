# Fable 5.1 — proposed standing order for bug-checking (21 Sep 26)

The second of two independent proposals. **This is an INPUT, not the adopted order** — the
adopted one is `bug-check-standing-order.md` beside this file, merged from this and Codex's.

Its distinctive contributions: the two-kinds-of-defect framing (a WRONG line vs a MISSING
line, and every check the project had was built for the first), the ROLL-CALL, the DOOR
check, the BREAK TEST, the full-house weekend seeded into the demo data, and Appendix D —
a worked roll-call of the CURRENT code listing all fourteen places a man's puck is drawn.

---

# HOW THIS PROJECT BUG-CHECKS — the standing order

Proposed by Fable 5.1 (high), 21 Sep 26, from the record of the OIL build. Read-only: nothing in
the repo was changed to write this. To adopt: copy it to `raptor-port/docs/bug-check-order.md`,
point `CLAUDE.md` at it, and retire the three older standing orders it absorbs (the 16 Sep
scenario rule, the 20 Sep rules sweep, the 21 Sep "test like a human" rule — all three are kept
inside this one, so nothing is lost).

The body is written for the owner. Everything an agent needs to execute it mechanically is in
the appendices, and every step in the body names the appendix line that carries it.

---

## 0. The one sentence

**A build is not checked until someone has driven the real app across every place the feature
shows, in every order it can be used, on a weekend that has everything on it — and has left the
pictures and the table that prove it.**

Everything else in this order exists to make that sentence cheap, complete, and impossible to
fake. The rule that overrides all others: **a walk that left no picture did not happen.**

---

## 1. Why the old way was not enough — five failures in one build

This is not theory. On 21 Sep 26 the OIL build had five automatic gates, about 5,300 tests, two
independent code reviews by two different frontier models, a written register of every ruling, a
map of which screens each feature touches, and a standing order to hand-test. The owner opened the
app and found three defects in minutes. Here is what each check failed to do, in one line each:

1. **The two code reviews found five real money defects and were blind to three more.** All
   three were the same shape: a place on screen the feature was never connected to. Every line of
   code that existed was correct. Reading code cannot find a line that is not there.
2. **The tests were written against the surfaces that already worked.** Every test of the green
   edge used a duty desk or a ground row — the two kinds of seat that already went through the
   shared drawing routine. The suite proved the feature worked exactly where it worked.
3. **The warning existed and pointed the wrong way.** The screen map had already named this
   hazard, worded as "a NEW seat drawer that forgets the mark". The holes were in two EXISTING
   drawers. Everyone who read the warning looked forward instead of sideways.
4. **A hand test walked one order and passed.** The other order had no door on any screen. The
   data allowed it and a unit test proved it; no screen offered it.
5. **The agent substituted a cheaper check and could call it compliance.** It commissioned two
   reviews, told both not to run anything, ran the suite, and reported. Nothing in the order made
   that impossible.

One more, from the same day, that the fix itself exposed: **a comment vouched for coverage it
did not have.** The week's seat drawer carried a note saying the mark "reached the flying lines".
It reached everything that one routine drew, and that routine did not draw the flying lines.

The lesson under all six: **there are two kinds of defect — a WRONG line and a MISSING line —
and every check the project had was built to find the first kind.** Reading finds wrong lines.
Tests confirm what someone thought to assert. Only a roll-call and a walk find missing lines.

---

## 2. The kinds of check — what each is FOR and what each is BLIND to

The owner has not seen a list like this before. Here is the whole set, including two the project
did not have. The last column is honest: it says what each one actually found in the OIL build.

| # | The check | What it is, plainly | What it is FOR | What it CANNOT see | In the OIL build it found |
|---|---|---|---|---|---|
| 1 | **The gates** | The machine's own checks, run on every change: the unit tests, the build, the byte-exact comparison with the original app, the real-browser layout checks, the Tracker smoke, and the rule-coverage check. | Stopping a rule that already has a test from changing silently; catching a box that grew or a bar that gained a row; proving the original's answers still hold. | Anything nobody wrote an assertion for. Whether a mark reached a surface no test looks at. Whether a human can find or use a control. Unit tests run without a stylesheet or layout, so they cannot see what is painted. | One thing: the phone's top bar had grown a second row (the layout gate). The 5,341 unit tests found nothing new; they confirmed. |
| 2 | **The code read** | A person or a model reads the changed code and its neighbours. Done by a model that did not write it, from both providers, when the change matters. | Wrong arithmetic, a rule applied in the wrong place, money decided from the live copy instead of the issued one, a copy that is really a shared reference, a case a branch forgot. | **A line that is missing.** A screen the feature was never connected to. Something painted over something else. A control with no door. Anything that only shows when the app runs. | Eight defects, five of which would have paid or withheld real money. It could not have found the three the owner found. |
| 3 | **The rules read** | The register of the owner's rulings is walked ruling by ruling and each is checked against what the code does. | A ruling that went stale, or one that quietly grew into a job a later ruling took away. Code inspection cannot catch this because the code is not wrong — the rule is. | Same blindness as the code read, plus one of its own: it is indexed by RULING, so it checks each ruling on ONE surface and ticks it. | Two clashes between rulings, flagged before the build. |
| 4 | **The roll-call** (NEW) | For the thing the feature attaches to — a man's puck, a row, a day — a list of EVERY place the app draws that thing, and for each place a written answer: has it / must not have it (why) / MISSING. | **Missing lines.** This is the check that would have caught all three of the owner's finds before anyone opened the app (§4 shows how). | A wrong line. Whether the thing that is wired up looks right when painted. It is a list, not a picture. | Did not exist. Run today on the current code it lists fourteen drawers of a man (nineteen call lines): six pass the mark, eight pass nothing and need a written answer (Appendix D). |
| 5 | **The door check** (NEW) | For every action the feature allows in the data, the name of the screen control that lets a person do it — in every state the day can be in, and in every order the actions can arrive. | A thing the data permits that no screen offers (failure 4). An action that works before publishing and has no door after. | Whether the door does the right thing once opened. | Did not exist. It is the check that failure 4 needed. |
| 6 | **The walk** | An agent drives the REAL built app in a real browser, at phone and desktop width, on a seeded weekend that has every kind of row and man on it, through every surface in the roll-call and every line of the order list, taking pictures. | The seams: a writer and a reader that never meet in a test; a mark painted over by a chip; a seat that is drawn but not tappable; a mode that strands the board; a wrong number on the tracker after an order nobody unit-tested; anything that only exists when the whole app runs against one set of data. | Money that is wrong by an amount the screen does not show. Rare states it did not set up. Anything it did not think to walk — which is why it is DRIVEN by the roll-call and the order list, not by instinct. | The build session's own walk (indexed by ruling) found three real defects: a published day rewriting itself, an unreachable Unavailable block, a hidden man's credit lost. (The pre-build mock-up and the layout gate caught two layout faults beside them.) It missed the three the owner found because it walked rulings, not surfaces. |
| 7 | **The owner's look** | Five minutes of the owner using the app on the seeded weekend, with the pictures in front of him first. | The gap between what was built and what he meant. He knows the flying crews earn on a Saturday; no check indexed by what exists can notice the absence of an expected thing the way he does. | Everything under the surface: money, the freeze, history. He is not the test department and must not be used as one. | Three defects in minutes. |

Two more disciplines sit inside the checks rather than beside them, and both are how the checks
are made to FIND rather than confirm (§6): **the break test** (break each wire on purpose and
watch a test go red — if none does, that surface has no test, by proof) and **the other mind
designs the scenarios** (the order list and the additions to the seeded weekend are written by a
model that did not build the feature).

---

## 3. Which checks for which change — eight questions and four tiers

All of the above on everything would be abandoned in a week. The tier is decided by facts an agent
can read off the change itself, not by a feeling about risk. The agent answers the eight questions
in writing, and the answers go at the top of the evidence sheet so the owner can see WHY a tier was
chosen. A wrong tier is then a visible fact, not a hidden one.

**The eight questions** (Appendix A.1 has the file-level version):

1. **Money** — does it touch anything that decides what a man is owed or paid, or how many people
   count as present — OIL credits, leave balances, the manning count — or the figure shown for
   them?
2. **The published record** — does it touch publishing, signing, amendments, the issued copy, a
   saved version, or undo of a publish?
3. **Saved data** — does it change what is saved, the reset version, or how older saved data is
   read?
4. **A shared drawer** — does it change a drawing routine that is called from more than one place,
   or add a mark or a state that must appear WHEREVER a man, a row or a day is drawn?
5. **A new gesture or mode** — does it add a control, a tap target, a mode, a button, or a new
   thing the board or the week listens for?
6. **A new surface** — a new screen, panel, sheet, page, or kind of row?
7. **Roles** — does it change who may do or see something?
8. **The warning list** — does it change what the warnings say or how a rule is read?

**The tier rule.** Any YES to 1, 2, 3, 7 or 8 → **FULL**. Otherwise any YES to 4, 5 or 6 →
**WALK**. Otherwise, if the change is only colour, spacing, wording or a label on ONE surface with
no new state → **LOOK**. Words only → **NONE**. **If the agent cannot say NO with a reason it
could write down, the answer is YES.**

Note what this does to "display only". The green edge was display only, and three of its defects
lived in a shared drawer and a new mode. A cosmetic change to a shared drawer is never LOOK; it is
WALK, because that is exactly where missing lines live.

| Tier | What is done | Roughly what it costs on top of the build |
|---|---|---|
| **NONE** (docs only) | Nothing. | 0 |
| **LOOK** (one surface, cosmetic) | The gates, plus one before/after picture of the changed surface at phone and at desktop, in a two-line evidence sheet. No review. | 15–20 minutes |
| **WALK** (shared drawer, new gesture, new surface) | The gates; the roll-call (if a shared drawer); the door check (if a gesture); the walk of the touched surfaces at both widths on the seeded weekend, with the new gesture in both orders; a break test per surface; the evidence sheet. A single-provider code read only if the change is large (more than about two hundred lines). | 1–1½ hours |
| **FULL** (money, published record, saved data, roles, rules) | Everything: the rules sweep and register; the other provider designs the order list; the roll-call; the door check; the full walk (every surface that draws the thing, both widths, every order, every state); break tests; the case planted in the demo seed; the two-provider code read, given the evidence sheet and asked for absences as well as errors; the fixed surfaces re-walked; the evidence sheet with its pictures; then the owner's look. | 3–5 hours of agent time; the two-provider read is the largest token line |

**The order of steps in FULL** matters: build → gates → roll-call and door check → walk and fix
what it finds → gates → the two-provider read, with the evidence sheet in their hands → fix →
re-walk only the surfaces the fixes touched → gates → finish the sheet → the owner's look → his
"merge live". The walk goes before the read so the reviewers read the final code and can check the
roll-call for gaps, which is something a reader CAN do — reading for absence works when there is a
list in hand.

---

## 4. The roll-call — how to catch "never wired up"

The brief asks which single question, asked of which artefact, would have caught all three of
the owner's finds. Here it is.

**The question.** *"Name the THING this feature attaches to. List every place the app draws that
thing. For each place, answer three columns: does it SHOW the new mark, is the new gesture USABLE
there, and what else is PAINTED on the same pixels?"*

**The artefact.** Two lists, both produced mechanically in ten minutes (Appendix A.3): every call
of the shared drawing routine for that thing, and every kind of row on the board and on the week
that can hold it. Then the seeded weekend on screen, with a man who wears a warning chip.

**Why it catches all three:**

- *The green edge was missing on the flying seats and the Common Programme.* Column one. The
  board's cockpit-seat drawer and its Common Programme drawer appear in the list and pass no mark.
  They read MISSING before anyone opens the app.
- *In the mode, those seats were not tappable.* Column two. The mode listens for one tap hook, and
  only two of the seat drawers emitted it. The same two lines read MISSING again.
- *The warning chip painted over the edge.* Column three, or the seeded weekend: the chip is the
  first thing drawn inside the puck, with a solid background, over exactly the strip the edge
  occupies. A weekend with one man wearing a chip shows it.

**The rule for how hazards are written from now on.** A hazard worded "a NEW drawer that forgets
X will…" is a warning to a future author, and it will be read as not applying to anything that
exists. Rewrite every such hazard as a roll-call of the EXISTING drawers — *"X must appear in these
seven drawers: [list]; the test walks them"* — and, at the moment it is written, run the roll-call
on those seven. A hazard is a claim that the current drawers are right. Prove it or do not write it.

**The rule for comments.** A comment saying "this reaches every surface" is a claim, not a proof.
Either it names the test that walks the surfaces, or it is deleted.

**What the roll-call says today.** Run on the current code for a man's puck it lists fourteen
drawers. Six pass the mark or route through the mode's own seat drawer. Eight pass nothing: the crew
picker's roster pucks and its ALL / ALL AVAIL placeholders, the Available-crew list, the SANS
cards, the inputs calendar, the medical view, a retired inputs list nobody draws any more — and the
week's own Personal Inputs / Unavailable puck, whose twin on the board DOES pass it. Several of
those eight are plainly right to pass nothing (a picker is not a day; a SANS offer is never work).
One or two are questions. **I have not judged them, and that is the point: the roll-call's job is
to make each one a written line with a reason, so a hole and a deliberate absence stop looking
alike.** The full list is Appendix D; judging it is the first job of the next OIL session.

---

## 5. The walk — step by step

Written so it can be executed without thinking. The agent's exact commands are Appendix A.4–A.9.

**5.1 What to build before starting: the full-house weekend.** Never the convenient day. A
Saturday that is published and a Sunday that is not, with a Friday beside them and a public
holiday on the Monday, carrying every kind of row and every kind of man the app has: a flying
line, an SC shift with a MAIN and a SPARE, an exempt desk, a duty desk with times and one
without, a sim with passengers, a ground row with times, one that came from an input, an ⓘ
info-only row, a cancelled row, a Common Programme row with ALL AVAIL and one with named people, a
claim answered yes and one answered no and one taken off the programme, an overseas duty under
Unavailable, a SANS man on the programme, a hidden SANS man, a named ground-crew man, a man who was
on the published day and has since been posted out, a man wearing a warning chip, a man on four
rows, a plan parked from the day, and a day signed by one role but not the other. The complete
list is Appendix B.

**It lives in the demo seed**, under its own name, so a fresh boot shows it without anyone building
it, the owner's look starts on it, and the next session does not rebuild it from memory. It is
extended in the same change whenever a new kind of row or state is added — the same rule the screen
map already has: stale is worse than absent. Building it the first time is an investment of one to
two hours. After that it costs nothing.

**5.2 Stand the real thing up.** The production build, served locally, opened fresh, at phone
width and at desktop width, with the browser's error list watched throughout. Any error or
missing file during the walk is a finding.

**5.3 Enumerate the surfaces.** The rows of the roll-call (§4), crossed with the screens that
draw them: the scheduler's board, the edit week, the view-only week, the phone board, the day
popover, the Leave War grid and its tap list and sheets, the OIL tracker, the amendment panel,
the history, the export. Most crossings are "not applicable" with a reason; the value is in the
one that is not.

**5.4 Enumerate the orders.** Generated, not imagined, from the feature's actions and the states a
day can be in (Appendix C): each action from each state; every PAIR of the feature's own actions in
BOTH orders; after every action, undo, then redo, then reload; every action that has an opposite,
walked in the opposite direction AFTER publishing, because after publishing is where the money
freezes. For any two things that can both be true of one day — an award and a worked day, a claim
and a schedule row, a holiday and a publish — walk them arriving in both orders. That is the
failure-4 rule, made general.

**5.5 Walk and mark.** For each surface: does it SHOW the thing; is the gesture USABLE; does the
ruling that applies to it hold HERE. For each order: what did the screen say, what did the money
say, did undo and reload keep both. A ruling about something SHOWN or TAPPED gets one mark per
surface. A ruling about MONEY gets one mark per order. This is the difference between walking the
rules and walking the rooms, and it is the difference that cost the OIL build three defects.

**5.6 When you have walked enough.** Not when it feels fine. When every row of the roll-call has
a mark in every column; every line of the order list has a result; every MISSING or CLASH has a
disposition; the error list is empty or every entry is named; and the pictures exist. Before that,
the walk is not done, and the report must say so in those words.

**5.7 What to do with a MISSING.** Three dispositions and no fourth: fixed, with a test that was
red before the fix (§6); or ruled "leave it" by the owner, with the date; or filed in the
outstanding list with its place in the order. "Rare" is not a disposition unless a scenario proves
it rare.

---

## 6. Making the checks find, not confirm

The tests were written against the surface that worked. Here is what stops that.

1. **Tests loop over the roll-call list, never over one fixture.** A test of a mark on a man walks
   every KIND of seat the roll-call names and asserts each by name. The seat-kinds test written
   after the OIL failure is the model; it would have gone red on the day the feature was built.
2. **The fixture is the full-house weekend.** A test that sets up a duty desk and a ground row
   tests a duty desk and a ground row. The seeded weekend exists so that tests and walks share the
   worst day, not the easiest.
3. **Fixtures write the way the app writes.** A test that replaces an object where the app changes
   it in place tests a different program — that is how a published day rewriting itself passed
   5,326 tests. Sign through the real signing path, mark through the real gesture, publish through
   the real publish. A test that cannot is renamed to say what it actually proves.
4. **Red first — the break test.** Before a fix goes in, a test must fail on the bug. When the walk
   finds something, the test is written first and its first run is red. And for every surface the
   roll-call marks as wired, the wire is broken on purpose once and a named test must go red. If
   nothing goes red, that surface has no test, by proof, and one is written before the walk
   continues. Two to three minutes per surface.
5. **The other mind designs the scenarios.** The builder's tests encode the builder's picture of
   the feature, so they share its blind spots. In FULL, the order list and the additions to the
   weekend are written by a model that did not build the feature, in a cheap read-only brief that
   reads the design and the register, not the code, and is asked one extra question: *which lines
   do you expect the builder to skip?*
6. **Reviewers are given the roll-call and asked for absences.** A code read that is asked only
   "is this line wrong" will never say "this line is missing". Hand both providers the evidence
   sheet and add one question to the brief: *which surfaces and which orders are not on these
   lists, and should be?*

---

## 7. The evidence — how the owner can tell it was done

One file per build, short, mostly tables, plus a folder of pictures. Not a report; a record. The
agent produces it DURING the walk, not after, so it costs almost nothing extra.

**Where:** `raptor-port/docs/handpass/<date>-<feature>.md` and its pictures in
`raptor-port/docs/img/handpass/<date>-<feature>/`. Committed on the branch, linked from the PR
and from the closing report. The next session reads it instead of the chat that is gone.

**What is in it, in this order:**

1. **The tier** — the eight answers and the tier they give.
2. **The roll-call** — one line per place the thing is drawn: shows / usable / painted over by /
   disposition.
3. **The orders walked** — one line per order: the state it started from, what the screen said,
   what the money said, whether undo and reload kept both.
4. **The pictures** — one line per picture: file, what it shows, which width. Between eight and
   twenty-five for FULL; two for LOOK.
5. **The break tests** — one line per wired surface: what was broken, which test went red.
6. **Errors seen** — none, or each one named.
7. **What was NOT walked, and why** — the honest line. A walk that claims everything is less
   believable than one that names its gap.
8. **The gates** — the usual counts.
9. **What the walk found** — each with its fix commit and its red-first test, or the owner's
   ruling, or its outstanding entry.

**The owner's sixty-second check.** He does not read the sheet; he checks five things:

1. Is there a sheet, linked from the report? No sheet, no walk.
2. Open the picture folder. Can he see the full-house weekend — a flying line, an SC shift, a
   desk, a sim, a ground row, a Common Programme row, an input, an ALL AVAIL, a man with a warning
   — with the feature on? Pictures of one kind of row mean it was not walked.
3. Does every row of the roll-call have a mark in every column, and does every MISSING have one of
   the three dispositions?
4. Does the order list show both orders, and the after-publish ones?
5. Does the break-test section have one red test per wired surface?

If any answer is no, the answer to "merge live" is no.

**The closing report gains one mandatory line.** Beside Status, Changes, Checks and Open items:

`Walk: docs/handpass/<file> · <n> pictures · <k> surfaces · <m> orders · MISSING: <fixed / ruled / filed counts>`

or, in those exact words, `Walk: NOT DONE — <reason>`. A report for a WALK or FULL change with no
Walk line, or with a NOT DONE line, cannot carry the status "ready for merge live". Silence is not
an option the format allows.

**Making it impossible to skip.** An order an agent can quietly bypass is worth nothing, so the
first job under this order is a small script (Appendix A.11) that fails the local gate set when
the branch touches the app's source, the tier is WALK or FULL, and the sheet is missing, has an
empty cell, or has fewer pictures than wired surfaces. Until it exists, the owner's rule stands
in for it: no Walk line, no merge live.

---

## 8. The anti-patterns, named

Each with how to recognise it on sight and what to do instead.

1. **The read called a test.** A "bug test" with no picture and no table; reviewers briefed not to
   run anything and their report presented as the check. → Call it a code read. The walk is a
   separate step with its own evidence.
2. **Testing where it works.** Every assertion about a mark uses the same one or two kinds of
   row. → The test loops over the roll-call list.
3. **The warning aimed at the future.** A hazard worded "a NEW X that forgets Y…". → Rewrite it as
   a roll-call of the existing X's and run it now.
4. **The comment that vouches.** "This reaches every surface" in a comment. → A comment is a
   claim; name the test or delete the claim.
5. **The one-way street.** A scenario walked in one order, one state. → Both orders, every entry
   state, from the generator.
6. **Walking the rules, not the rooms.** A walk report organised by ruling with one pass per
   ruling. → Rulings about what is shown or tapped get a mark per surface.
7. **The convenient day.** A fixture or a drive with a duty desk and a ground row and nothing
   else. → The full-house weekend, always.
8. **Green means done.** "5,341 tests pass" offered as the reason it works. → The count goes in
   the gate table and nowhere else in the report.
9. **Reading for wrong, never for missing.** A review brief that never asks which line is
   absent. → Give the reviewers the roll-call and ask for absences.
10. **The self-designed scenario.** The builder wrote its own order list. → The other provider
    designs it.
11. **The fixture that replaces where the app changes in place.** Setting state by assignment
    where the app mutates. → Write through the production route.
12. **Deferred as rare.** A flagged bug closed as "narrow" with no scenario. → Prove it rare or
    fix it.
13. **The pass with no picture.** "Hand-tested at phone and desktop" with nothing attached. → It
    did not happen. Do it.
14. **Teaching the test to look away.** A gate assertion relaxed so a change can pass. → Fix the
    structure; the gate was right. (Already in the executor rule; named here because it is how a
    missing line stays missing.)
15. **The batch tracker that ticks a read.** The bug-testing tracker's rows are ticked by "ask
    Fable to bug-test the batch", which is anti-pattern 1 in a table. → A row is ticked only with
    a sheet path beside it.

---

## 9. Where the owner fits

He is not a tester, and the order is built so he does not have to be. But he found three defects
in minutes, and it is worth saying exactly why, so the order can use it without abusing it.

**What he is uniquely good at.** He knows what the app is FOR. He reads a Saturday and knows the
flying crews earn; he expects to tap a puck and have it respond. He tests EXPECTATIONS, where
every other check tests IMPLEMENTATIONS. No check that is indexed by what exists can notice the
absence of a thing that should exist; he does it without trying.

**How the order uses that, and no more.**

- **He looks LAST, for five minutes, on a weekend that is already built.** The seeded weekend and
  the pictures mean he never sets anything up. He opens the pictures first (thirty seconds), then
  the app on the seeded Saturday (a few minutes).
- **He is handed a "look here" card, not a test plan.** Three to five lines, written as
  expectations in the app's own words: *"On the seeded Saturday every man on a flying line should
  wear the green edge; tap one off and it should go; publish and it should still be there."* Never
  a list of cases to work through.
- **He answers product questions the walk raises, and nothing else.** "Leave it" is an answer and
  is recorded with the date, so it is never fixed later as a bug.
- **He never chooses the tier, reads the code, or runs a gate.** The tier is decided by the eight
  questions, which he can check from the description of the change.
- **Every defect he finds costs the method a line.** A find of his is, by definition, something
  every check missed, so it is a method failure before it is a bug. Each one adds a row to the
  roll-call, a line to the order generator, a kind to the seeded weekend, or a named anti-pattern
  to §8 — in the same change as the fix. That is how the method gets better instead of the owner
  getting tired.

---

## 10. What it costs, roughly

So the owner can judge the trade. Agent wall-clock, on top of the build itself.

| Step | Time | Tokens | Notes |
|---|---|---|---|
| The gates, locally | 10–12 min | none | The browser layout gate is most of it; CI runs the set in about 8½ minutes in parallel. |
| The roll-call | 15–20 min | small | Two searches and a table. |
| The door check and the order list | 15 min to write | small | The walk executes them. |
| The other provider designs the scenarios | 10–15 min | small–moderate | Reads the design and the register, not the code. |
| The full-house weekend, first time | 1–2 hours | moderate | Once. Then 10–20 minutes to extend when a new kind of row arrives. |
| The walk, FULL | 1–2 hours | moderate–high | Looking at fifteen to twenty-five pictures is the expensive part; reading the page as text is cheap and is used for the marks. |
| The walk, WALK tier | 30–45 min | moderate | Touched surfaces only. |
| The break tests | 20 min | small | Two to three minutes per surface. |
| The two-provider code read | 20–45 min | **the largest line** | Each model reads fifteen to thirty files. Worth it on money and the published record; not on a label. |
| The evidence sheet | 10 min to finish | small | Produced during the walk. |
| The owner's look | 5 min of his | none | |

FULL adds three to five hours to a build. WALK adds one to one and a half. LOOK adds twenty
minutes. The OIL build would have been FULL, and the three owner-found defects would have cost the
roll-call fifteen minutes to list and the walk an hour to confirm and fix — against the day they
actually cost, plus a retest of every earlier feature.

---

## 11. If I could keep only one step — and what I am least sure of

**Keep the walk on the full-house weekend, driven by the roll-call, with pictures.** Four
reasons. It is the only check that sees ABSENCE — a mark not drawn, a seat not tappable, a door
not there — which is the class that beat everything else. It is the only check the owner can
verify happened without reading anything. On this project's own record it has found the most per
hour: a published day rewriting itself in the first ten minutes of driving, an unreachable block,
a hidden man's lost credit, and the owner's three. And with a complete order list it reaches most
of the money defects too, as wrong numbers or contradictions on screen: a tap under a mask that
says "earns again" while the puck stays dim; a holiday revoked after publishing that sweeps a
balance; a publish warning naming a man who was denied; a stranded read-only board after a week
step; a cancelled row wearing green. What it would not have caught: the posted-out man losing his
credit unless the weekend includes one (it now does), and the three latent hardening points that
only a read finds. I would rather lose those than lose the walk — but I say plainly that losing
the two-provider read on a money change is a real loss, not a free one.

**Least sure of: the order-list cap.** Failure 4 lives in the orders, and "every pair in both
orders from every state" explodes on a feature with ten actions. Appendix C caps the list at about
forty lines and prunes by rule, but pruning is a judgement, and an agent under pressure will prune
the wrong lines. The mitigations are that the other provider names the lines that must not be cut
and that the cut list is written into the sheet — but this is the joint I would watch first.
Second: the seeded weekend can rot. It is a shared fixture, and shared fixtures drift when nobody
owns them. The same-change rule is the guard, and it is the same guard the screen map relies on,
which was exactly the document that was read too narrowly. That is not a comfortable precedent.

---
---

# APPENDICES — for the agent

Everything above is the order. These are the mechanics. Paths are relative to
`C:/Users/User/projects/Raptor/raptor-port/` unless stated. File and function names appear here and
nowhere in the body; the body names things as the app does.

## Appendix A — the checklist, in execution order

Each item names what it PRODUCES. An item with no artefact produced is not done.

**A.1 — Tier (produces: sheet §1).** Answer the eight questions from `git diff main --name-only`
and the diff itself. File-level hints, not exhaustive — the question wins over the hint:
- Q1 money: `src/leavewar/sync.ts`, `src/engine/oil*.ts`, `src/leavewar/engine/*`
  (`warrecs`, `counters`, `charge`, `oiltracker`, `availability`, `dayview`), any diff hunk
  mentioning credit / oil / balance / manning / duty.
- Q2 published record: `src/engine/publish.ts`, `drafts.ts`, `canonical.ts`, `restore.ts`,
  `sched-commit.ts`, `history.ts`, `editlog.ts`, anything reading `daySnapOf` / `dayApproved`.
- Q3 saved data: `src/storage/*`, `src/state/persist.ts`, `reset.ts`, `schema.ts`.
- Q4 shared drawer: any function in `src/ui/html.ts`, `board-html.ts`, `palette-html.ts`,
  `oilmode.ts` with two or more call sites (`grep -rn "<name>(" src | grep -v test | wc -l`), or a
  new argument on one, or a new CSS class on `.puck`, `.seat`, a row, or a day head.
- Q5 new gesture: a new `data-*` attribute read in `board.ts` / `interactions.ts` / `view.ts`, a
  new button, a new mode flag.
- Q6 new surface: a new file under `src/ui/` or `src/leavewar/ui/`, a new section kind in
  `engine/order.ts SECTIONS`, a new sheet.
- Q7 roles: `editMode`, `canEditSched`, `canDecide`, `isScheduler`, role.js, `lwSetRole`.
- Q8 rules: `src/engine/validate.ts`, `avail.ts`, `events.ts`, any `RULE_*` table.
Write the eight answers and the tier as the first table of the sheet. Unsure = YES.

**A.2 — Rules sweep (FULL only; produces: the register + rulecheck green).** As CLAUDE.md
§SWEEP THE RULES: search, list, register, `npm run rulecheck`. Then mark each ruling in the
register as SHOWN/TAPPED (gets a mark per surface in A.7) or MONEY/STATE (gets a mark per order).

**A.3 — Roll-call (produces: sheet §2).** Name the THING (man / row / day / input). Then:
1. List every call site of its shared builder, excluding tests:
   `grep -rn "puck(" src --include=*.ts --include=*.tsx | grep -v "\.test\."` (a man);
   for a row, the builders in `board-html.ts` (`sbProgPanel`, `sbSeat`, `sbInpRow`,
   `sbSimRowsPanel`, the wave-row walk) and `html.ts` (`lSeat`, `slotCell`, `plRow`, `dayHTML`,
   `availHTML`, `sansCardsHTML`); for a day, `dayStatHTML` and the day-head builders.
2. List every row KIND that can hold it: `engine/order.ts SECTIONS` (notes, prog, waves, duty,
   sims, ground, inputs, avail, sans, unav), and inside waves: fly-line FCP/RCP, SC MAIN, SC SPARE,
   standby; inside duty: desk with times, desk without, exempt AVALON/BB desk.
3. For a gesture, list the listener and the emitters:
   `grep -o "data-[a-z]*" src/ui/board.ts | sort -u` (what the board listens for) against
   `grep -o "data-[a-z]*=" src/ui/board-html.ts src/ui/html.ts src/ui/oilmode.ts | sort -u`
   (what the markup emits). A listener the mode needs that a drawer never emits = MISSING.
4. Table: surface | file:function | shows? | usable? | painted over by? | disposition. Every line
   gets YES / NO-because / MISSING. No blank cells.
5. For every hazard in `docs/feature-impact.md §4` worded as "a NEW …", rewrite it as a list of
   the existing drawers and add the roll-call test that walks them, in the same PR.

**A.4 — Stand the app up (produces: nothing yet; the walk needs it).**
`cd raptor-port && npm run build && npx vite preview --port 4173`. Drive
`http://localhost:4173/?fresh=1` (root, never `/Raptor/`). Login `ad`/`a` (admin), `us`/`us`
(member). Two contexts: phone `{ viewport: {width:390,height:844}, isMobile:true, hasTouch:true,
deviceScaleFactor:2 }` and desktop `{ viewport: {width:1440,height:900} }`. Attach
`page.on('pageerror')` and `page.on('console')` for `error`, and watch 4xx responses; every entry
goes in sheet §6. Helpers: `e2e/app.ts` (`login`, `go`, `settle*`); probe hooks in
`src/probe-bridge.ts` (`window.go`, `setPage`, `openScheduler`, `addWave`, `fileInput`,
`lwSetCell`, `lwSetPostOut`, `setSign` where exposed, `undo`, `redo`, `loadWeek`). Use hooks only to
plant BACKGROUND data; the feature under test is driven through its real controls.

**A.5 — The full-house weekend (produces: the seed, once; then reuse).** Appendix B. First time:
add it to `src/state/demoseed.ts` beside the SANS seed (boot-time, so the reference-parity suite
and the snapshot tests stay blind to it — read that file's header comment for why). Name it. Every
later feature reuses it and extends it in the same PR when it adds a kind. Confirm on `?fresh=1`
that it is there before walking.

**A.6 — The order list (produces: sheet §3, empty results column).** Appendix C. In FULL, it is
written by the OTHER provider from a read-only brief that is given the design doc, the register and
Appendix C — not the code — and asked for (a) the list, (b) the lines it expects the builder to
skip, (c) the kinds it wants added to the weekend. The builder may add lines, never remove one
without writing the cut into sheet §7.

**A.7 — Walk and mark (produces: sheet §2 columns, §3 results, §4 pictures).** Script it as
`scripts/handpass-<feature>.mjs` on the model of `scripts/step4-shots.mjs`, writing pictures to
`docs/img/handpass/<date>-<feature>/<width>-<surface-or-order>.png`. For each roll-call row at each
width: read the page (text and attributes — `data-*`, classes such as `oilbar-*`, `inert`) to set
the SHOWS and USABLE marks, and take ONE picture per surface with the feature on. For each order
line: perform it through the real controls, read the screen, read the money (the tracker cell /
the balance / the count chip), undo, redo, reload, read again, write the result. Look at the
pictures — the read of the DOM sets the mark, the picture is what the owner checks and what
catches paint-over.

**A.8 — Break tests (produces: sheet §5).** For each roll-call row marked wired: remove that one
call or argument (or the emitted attribute), run the narrowest test file
(`npx vitest run src/ui/<file>.test.tsx`), record which test went red, restore. If nothing goes
red, write the test that loops over the kinds (model: the seat-kinds test in
`src/ui/oilmode.test.tsx`, "the green strip reaches every kind of seat the board draws") and
rerun the break. Do not proceed with a wired surface that has no red.

**A.9 — Dispositions (produces: sheet §9).** Each MISSING / CLASH / wrong result: fix + red-first
test (commit hash), or owner ruling with date, or `OUTSTANDING.md` entry with its place. Nothing
else.

**A.10 — The reads (FULL; produces: the two review files).** After A.7–A.9 and green gates. The
brief hands both providers the sheet and adds: *"Which surfaces and which orders are missing from
§2 and §3, and should be?"* Fixes from the reads re-enter A.3 if they touch a drawer, and the
touched surfaces are re-walked (delta only, appended to the sheet).

**A.11 — The gate script (to be built; first job under this order).** `scripts/handpass-check.mjs`,
run in the local gate set: read the tier from the sheet named after the branch; if the diff touches
`src/` and the tier is WALK or FULL, fail unless the sheet exists, has no empty table cell, has no
`TODO`, and the picture folder holds at least as many files as §2 has wired rows. About sixty
lines. Wire into CI after one build has used it.

**A.12 — The closing report.** The executor footer plus the mandatory `Walk:` line (§7). Status
"READY FOR MERGE-LIVE DECISION" is legal only when the Walk line is present and is not NOT DONE.

## Appendix B — the full-house weekend

What must be on it. Each line is a kind the OIL build, the N16 build or the S4 hunt needed and did
not have to hand. Sat is published (signed by one role, not the other); Sun is not; Fri is a
weekday neighbour; the next Mon is a public holiday declared through the Leave War.

Rows on Sat and Sun:
- a flying line, FCP and RCP, report → land + debrief spanning more than six hours;
- a two-ship where one seat is a swap;
- an SC shift with a MAIN pair and a SPARE pair, minted the way the board mints it;
- an AVALON or BB desk (exempt, earns nothing);
- a duty desk with times; a duty desk with NO times (the silent case);
- a sim with a crew and passengers;
- a ground row with times; a ground row that came from an input; an ⓘ info-only row; a cancelled
  row; a zero-length row;
- a Common Programme row with ALL AVAIL; one with ALL; one with named people including one
  ground-crew man;
- a personal Duty claim answered yes; one answered no; one accepted then taken off the programme;
- an overseas duty under Unavailable;
- a leave bid on Sat that clashes with published work.

Men:
- a SANS man planned on the programme that day; a hidden SANS man;
- a man who was on the published Sat and has since been posted out;
- a man wearing a warning chip (a crew-rest breach across Fri/Sat); a man with a late input;
- a man on four rows, two of which count;
- one man with an OIL award already on the tracker for Sat (N16: award and worked day both).

State:
- a plan parked from Sat;
- an amendment pending on Sat (one change after publish);
- the Mon holiday declared AFTER Sat was published (R-1 both directions walkable).

## Appendix C — the order-list generator

Inputs: the feature's ACTIONS A = {every gesture or command it adds or changes, plus the standing
ones: publish, unpublish, amend, undo, redo, reload, step week, switch plan, declare/revoke
holiday, post out/restore a man, file/accept/remove an input, cancel a row, mark ⓘ}; the STATES
S = {unpublished day, published day, amended day, a parked plan open, after reload, admin / member
/ viewer, phone / desktop}.

Rules, in order:
1. Each feature action alone from each state in S.
2. Each PAIR of the feature's own actions in BOTH orders, on a published day and on an unpublished
   one.
3. After every line of 1 and 2: undo, redo, reload — screen and money both read again.
4. Every action with an opposite (publish/unpublish, blanket on/off, tap off/on, holiday
   declared/revoked, posted out/restored, accepted/removed): the opposite AFTER publishing.
5. The both-arrive rule: any two things that can both be true of one day arrive in both orders.
6. Cap: about forty lines. Prune only weekday and unpublished duplicates, never a published-day
   line, never a money line, never a line the other provider flagged. Write every cut into sheet
   §7.

## Appendix D — today's roll-call for a man's puck (worked example, unjudged)

Run on the working tree of `claude/oil-auto-remove-design`, 21 Sep 26. "Mark" = the green edge
(the builder's seventh argument, or routing through the mode's seat drawer). This is a list of
lines that need a written answer; it is NOT a list of bugs.

Pass the mark:
| where | what it draws |
|---|---|
| `board-html.ts` wave-row walk (~222–223) | the board's flying / SC seats — FIXED 21 Sep |
| `board-html.ts sbSeat` (~304–310) | the board's duty and sim seats |
| `board-html.ts sbInpRow` (~586–591) | the board's Personal Inputs / Unavailable pucks |
| `board-html.ts` sb-slot (~715–725) | the board's ground and Common Programme seats — FIXED 21 Sep |
| `html.ts lSeat` (~474) | the week's duty / sim / ground seats |
| `html.ts slotCell` (~432, via ~1488) | the week's flying / SC seats — FIXED 21 Sep (its old comment vouched for coverage it lacked) |

Pass nothing — each needs one line: right-because / MISSING:
| where | what it draws | my note (not a judgement) |
|---|---|---|
| `html.ts dayHTML` (~1644) | the week's Personal Inputs / Unavailable puck | its board twin passes the mark; OIL12/OIL21a name a claim's puck and the Unavailable block |
| `html.ts availHTML` (~606) | the Available-crew list | men not on the programme |
| `html.ts sansCardsHTML` (~686) | the SANS cards | an offer is never work (Q15) |
| `board-html.ts sbInputsHTML` (~137) | a retired inputs list, kept only for the probe bridge | not drawn |
| `palette-html.ts rosterPuck` (~61) | the crew picker's roster | a picker, not a day |
| `palette-html.ts specialRowHTML` (~183) | the picker's ALL / ALL AVAIL placeholders | a picker, not a day |
| `InputsCal.tsx` (~686, ~840) | the inputs calendar | a month view of inputs |
| `MedicalView.tsx` (~85) | the medical view | not a day |

Gesture column for the OIL mode (`data-oilp`, listened for in `board.ts boardArmClick`): emitted
only by `oilmode.ts oilSeatHTML`; every drawer above that is in the mode must route through it or
the seat is drawn and not tappable. Today the four board drawers do. The week's drawers emit no
mode hook at all — the tap gesture exists only on the board. Whether that is by design (the way in
is the board's day bar) or a hole is itself a line that needs its written answer.
