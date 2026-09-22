# Astra / Codex — proposed standing order for bug-checking (21 Sep 26)

One of two independent proposals the owner commissioned after the OIL build's static review
passed while he found three defects by opening the app. **This is an INPUT, not the adopted
order** — the adopted one is `bug-check-standing-order.md` beside this file, merged from this
and Fable's. Kept verbatim so the reasoning behind each rule survives.

---

# Standing Order: Coverage Before Confidence

Effective immediately, a change is not considered bug-checked merely because its code looks correct or all tests pass. It is checked only when the project has:

1. listed every place and every user route the change can affect;
2. used the required code and automated checks;
3. driven the exact release build through the required routes;
4. recorded short, inspectable proof.

A **surface** is any distinct place where the user sees or changes the feature. A **door** is any visible way the user can start the same action. An **order** is the sequence in which related actions can happen.

If a required item below has no recorded result, the verdict is **not checked**, never “passed.”

## 1. The checks, what they do, and what they cannot do

| Check | What it is for | What it cannot prove |
|---|---|---|
| **Coverage inventory** | Lists every surface, door, downstream result, role, and meaningful order before checking begins. It is the main defence against forgotten wiring. | It cannot prove that anything actually works or is visible. |
| **Code reading** | Finds wrong rules, money calculations, live-versus-published mistakes, permission gaps, unsafe writes, and inconsistent duplicated logic. For critical work, two independent AI systems from different providers read it separately. | It cannot reliably find code that should exist but does not. It also cannot prove painting, layering, hit targets, scrolling, or real reachability. Two reviewers can share this blind spot. |
| **Automated tests** | Repeats exact checks cheaply; protects calculations, state changes, boundaries, permissions, and known regressions. Real-browser tests add layout and geometry. | Tests prove only the cases selected by their authors. They can all pass while an unlisted surface, route, or action is absent. A browser test is still blind if it visits only the working surface. |
| **Agent live-app pass** | Drives the exact production bundle in a real browser. It checks whether a user can reach, see, click, save, reload, publish, and observe the downstream result. | It can miss deep faults that are not exposed during the chosen data and timing. It can also miss that the workflow feels wrong to a domain expert. |
| **Owner recognition pass** | Lets the owner use a significant new workflow normally and notice missing doors, misleading displays, or behaviour that makes no operational sense. | It is not exhaustive and does not replace the preceding checks. The owner is not responsible for finding technical edge cases. |

A screenshot proves appearance only. It does not prove a gesture. An automated browser result does not count as the owner’s recognition pass. A code review does not count as a live-app pass.

## 2. Proportionality: what each change requires

The required checks are selected by observable properties of the change. If several rows apply, use the union of their requirements.

The existing five CI gates remain mandatory for every executable change. They are the floor, not the whole bug check.

| Observable property | Additional mandatory checks |
|---|---|
| **Documents or comments only; no executable or behavioural change** | Check the new wording against current rulings. No live-app pass. |
| **Internal refactor with no intended visible, stored, permission, or rule change** | Author code read, focused automated tests, and all five CI gates. No live pass unless a public route or renderer was changed. |
| **Copy or purely cosmetic change on one existing surface** | Inspect that surface in the release bundle. Check every viewport the change can alter. No independent code review unless logic also changed. Approximate extra cost: 5–15 minutes. |
| **Behavioural change using existing surfaces and doors** | Coverage inventory, focused tests through the production route, one independent code review, agent live-app pass across the affected matrix, and all five gates. Approximate extra cost: 20–45 minutes. |
| **New or changed surface, renderer, door, gesture, overlay, navigation route, or feature appearing in more than one place** | Full surface-and-door matrix; plain and obstructed states; every applicable gesture; phone and desktop when layout or input differs; one independent review. Approximate live-pass cost: 20–45 minutes. |
| **Money or balances; published or signed records; persistence or reload; import/export; permissions; safety or validation rules; cross-app synchronisation** | Everything above, plus two independent cross-provider code reviews, both meaningful action orders, durable-boundary checks, and the owner recognition pass. Approximate cost: inventory 10–20 minutes, reviews 20–50 minutes, targeted tests 10–30 minutes, live pass 30–60 minutes, owner 5–10 minutes. |

A change is not downgraded because it is small in lines of code. A one-line change to money or published records remains in the final row.

## 3. How to perform the live-app pass

### A. Make the coverage card first

Write one sentence describing the promise:

> When the user does **X**, the app changes **Y**, and the user can see the result at **Z**.

Then create a small table containing:

- every distinct renderer that can show the affected person, item, value, warning, or control;
- every visible door that can start or reverse the action;
- every downstream result, such as a warning, balance, issued schedule, history entry, export, or other tab;
- every role whose result or permission differs;
- every normal obstruction or decoration that can cover or replace it;
- the action orders required below.

Do not count two places as one merely because they share a helper. Conversely, two renderers on the same screen remain two surfaces.

Use the feature-impact map, applicable rulings, and source searches to find:

- all readers of the changed fact;
- all writers of it;
- all calls to the shared display primitive;
- renderers that build their own version;
- warning, history, publishing, export, persistence, and cross-app consumers.

Existing surfaces must be enumerated alongside new ones. “Remember future renderers” is not an acceptable instruction.

### B. Enumerate routes and orders

A route is every user-visible way to reach the same action. Internal helpers and direct data injection are not routes.

For each pair of actions that can affect the same record, run both orders whenever both are legal:

- A, then B;
- reset;
- B, then A.

Also walk each applicable boundary:

- create or add;
- edit;
- save and leave the screen;
- reopen or navigate away and back;
- reload;
- publish or amend;
- undo or reverse;
- delete or remove.

Only include boundaries the feature actually crosses, but no boundary may be silently omitted.

If three actions interact, pairwise orders are sufficient only when the third action cannot change availability, defaults, ownership, masking, permissions, publication state, or the result. Otherwise, run the relevant three-action sequence too.

### C. Prepare the running app

Before checking:

1. Build the production bundle from the exact revision proposed for release.
2. Record that revision in the receipt.
3. Start with a clean, isolated browser profile or resettable data set.
4. Create the fixture through supported user controls. A documented import is allowed for background data; the action being checked must still use its real visible door.
5. Put all affected surface kinds into the fixture, preferably on one dense day or week.
6. Include:
   - one ordinary case;
   - one boundary case;
   - one refused or ineligible case;
   - any normal overlay, warning chip, mask, badge, or long label that can occupy the same space.
7. Use a weekend or public holiday when the feature only appears there. A weekday on which nothing is expected proves nothing.

If the required state cannot be created through the app, record a **missing door defect**. Do not inject the state and call the route tested.

### D. Walk the matrix

Start with the least-shared or most specialised surface—not the surface used while building the feature.

For every row:

1. Navigate there through the listed door.
2. Confirm the promised sign is visibly present.
3. Add the ordinary overlay or warning and confirm it remains legible.
4. Perform the promised tap, click, drag, or edit.
5. Confirm the visible local response.
6. Confirm the real downstream result through its user-facing surface.
7. Cross any required reload, publish, amendment, or undo boundary.
8. Record pass, fail, or an explicit reason why the row does not apply.

The pass is complete only when:

- every matrix row has a result;
- every door was used at least once;
- every applicable surface was both viewed and operated;
- both required orders were run;
- every relevant role was checked;
- the negative or refused path was observed;
- persistent or published results survived the appropriate boundary;
- no unexplained “not applicable” or blank cells remain.

Time spent is not a stopping rule. Completion of the matrix is.

## 4. The specific defence against “never wired up”

Before tests are written, an independent reviewer must ask this question of the completed surface-and-door matrix:

> **For every kind of qualifying object the app can draw—including objects drawn by old or specialised renderers—and with its normal overlays present, where are both the visible sign and the working user gesture in the production bundle?**

The matrix must therefore contain these columns:

| Surface/object kind | Should qualify? | Sign visible when plain? | Sign visible with overlay? | Gesture works? | Downstream result correct? |
|---|---:|---:|---:|---:|---:|

For the OIL failure, this would have separately listed duty desks, ground rows, flying seats, SC shifts, and Common Programme rows. Each would have been checked plain and with an advisory chip, and each would have required a working puck gesture.

That one artefact would have exposed:

- the missing green strip on flying seats, SC shifts, and Common Programme;
- the chip painting over the strip;
- the same surfaces not accepting the OIL-mode gesture.

The question is about every qualifying object, not every changed file. That wording prevents the earlier “new renderer” warning from directing attention only forward.

## 5. Make checks search for defects

Every bug check must be adversarial, not a demonstration.

Mandatory rules:

- The first live case must use a different or more specialised surface than the one used during implementation.
- Tests must be derived from the coverage card, not from whichever helper was easiest to call.
- A test that calls a calculation directly must be labelled **calculation only**. It cannot claim to cover publishing, persistence, permissions, reverse sweeps, or a user route.
- Tests claiming end-to-end behaviour must use the production writer and production reader.
- A defect fix starts with a reproduction that fails before the fix.
- A surface family is tested by enumerating its kinds, not by choosing one representative that already works.
- At least one check must add realistic interference: warning chip, mask, denied permission, stale/reloaded state, publication boundary, or other applicable decoration.
- Reviewers begin independently. They do not see the other reviewer’s conclusions until both reports exist.
- Review briefs ask, “What consumer, writer, door, or renderer is missing?” as well as, “What existing line is wrong?”
- Any unexpected behaviour found during the drive becomes a named regression test before the change is considered complete.

Passing the happy path is the start of the search, not its conclusion.

## 6. Required evidence: the bug-check receipt

Every behavioural change gets one short receipt stored with the change. It has an owner-readable summary followed by the mechanical checklist.

### Owner summary

No more than six lines:

- what changed;
- which requirement row applied;
- surfaces completed: `x/x`;
- doors and orders completed: `x/x`;
- defects found and fixed;
- anything untested, waived, or awaiting the owner.

### Mechanical record

Record:

- exact revision and production-bundle date;
- operator, browser, and tested viewport or device;
- the surface-and-door matrix;
- pass/fail for every row;
- one evidence reference per row, allowing several rows to share one image;
- a short recording for gestures that cannot be proved by a still image;
- the before-and-after user-visible result for money, publishing, persistence, and permissions;
- focused test results and the five CI gate results;
- reviewer identities and disposition of every finding;
- owner recognition result: passed, finding raised, pending, or explicitly waived.

Evidence should normally be one page plus linked images or a short recording. Raw logs and long prose are not the receipt.

An agent may not report “hand-tested” unless the receipt contains the exact build, completed matrix, and live-browser evidence. If any required entry is missing, the status is **not checked**.

## 7. Named anti-patterns

These names should be used in reviews and receipts.

- **Green wall:** treating thousands of passing tests as proof that omitted cases do not exist.
- **Working-surface tunnel:** writing every assertion against the surface already known to work.
- **Missing-call-site blindness:** examining only code that exists and never listing where equivalent code should exist.
- **Forward-only warning:** protecting future surfaces while ignoring existing specialised renderers.
- **One-order victory lap:** proving A then B and assuming B then A is reachable and equivalent.
- **Helper-route substitution:** calling an engine helper or writing data directly instead of using the visible production door.
- **Browser-test laundering:** presenting automated browser output as the live visual or human pass.
- **Screenshot-as-gesture:** using a still image to claim that a control can be operated.
- **Review pile-on:** commissioning more static reviewers instead of performing the missing runtime check.
- **Happy-path tour:** choosing clean data that avoids masks, chips, permissions, boundaries, and refusals.
- **Stale-bundle proof:** inspecting a previously built preview rather than the exact proposed revision.
- **Blank-cell approval:** marking the whole check passed while part of the matrix is blank or vaguely “not applicable.”
- **Owner-as-QA:** handing an unverified build to the owner with a long script and relying on him to discover defects.
- **Claim without receipt:** saying “tested manually” without durable evidence after the session disappears.

## 8. The owner’s role

The owner is uniquely good at noticing:

- that an expected door is absent;
- that a display implies the wrong operational meaning;
- that one part of a schedule looks inconsistent with another;
- that the workflow is possible in theory but unnatural in practice;
- that the agent tested what was built instead of what a scheduler would expect.

He should not execute the matrix. The agent completes that first.

The owner receives the exact preview and, only for changes involving money, published records, a new workflow or gesture, or a feature spread across several surfaces, spends about five to ten minutes using it normally. The prompt is limited to:

1. Can you find and complete the job without coaching?
2. Does every place where you expect the result show the same truth?
3. Does anything look correct technically but wrong for real scheduling work?

Any finding becomes a matrix row and regression test. An owner pass never cancels an agent failure, and an owner waiver must be recorded plainly.

## Non-substitution checklist

Before calling a behavioural change bug-checked, the agent must be able to tick every applicable box:

- [ ] Change properties and required checks were selected.
- [ ] Applicable rulings were listed and clashes resolved.
- [ ] Surface, door, downstream-result, role, overlay, and order matrix was completed.
- [ ] The exact production bundle was driven.
- [ ] The fixture was created through supported app routes.
- [ ] Every required surface was seen and operated.
- [ ] Every required route and order was walked.
- [ ] The real downstream result was observed.
- [ ] Focused tests used production paths or were honestly labelled as narrower.
- [ ] The five CI gates passed.
- [ ] Required independent reviews were completed and reconciled.
- [ ] The receipt contains inspectable visual evidence.
- [ ] Required owner recognition was completed or explicitly waived.
- [ ] Every omission and unresolved finding is stated.

No other check can be substituted for an unticked box.

## If only one step could remain

I would keep the **matrix-driven live pass of the exact production bundle: every qualifying surface, every door, ordinary overlays present, and the promised gesture performed**.

It is the only single step that would have caught the missing OIL strips, the strip hidden by a chip, the non-clickable OIL surfaces, and the publish-then-award route that did not exist. It is weaker than code reading at finding deep calculation and freeze-boundary defects, but it tests whether the product the user actually receives is complete.

The part I am least confident about is the pairwise order rule. It keeps the method affordable, but some faults require three interacting actions. The escalation rule for masks, permissions, ownership, and publication should catch the most dangerous cases; its effectiveness should be reviewed after the first three substantial changes and tightened if three-action defects still escape.


tokens used
88,766
