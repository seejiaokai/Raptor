# [TRK-PINCH-DRAGS-BALL] — the final code read (24 Sep 26)

Given, identically and blind to each other, to Fable 5.1 and to Astra (Codex). Bug-check order §4 rank 2 / §5
FULL: both read the finished code, WITH the evidence sheet, and are asked for what is MISSING as well as what is
wrong. Neither built it (the builder was Opus 5.5, D67). **Read-only: edit nothing, run nothing.**

---

You are reading a finished fix in the **Tracker** tab of this app. You did not build it.

## What to read

- The change: `git diff main...claude/tracker-pinch-drags-ball -- raptor-port/src` (one file,
  `raptor-port/src/tracker/app/core.js`). Read the surrounding code as well, not only the hunks.
- The evidence sheet: `raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md` — the cause, the roll-call of
  every way a first finger starts something in Edit chart layout, what was walked with two real fingers, the break
  tests, and what was NOT walked. The walk driver is `raptor-port/scripts/handpass/trk-pinch-ball.mjs`; the browser
  suite's new block is in `raptor-port/scripts/tracker/smoke.mjs` (search `[TRK-PINCH-DRAGS-BALL]`).
- The scenario design another model did before the code changed:
  `raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball-astra-scenarios.md`.

## The promise

1. In Edit chart layout, when a second finger lands, whatever the first finger started is taken back — the chart, its
   stored layout, both undo lists, ✓ Save changes, the selection and a half-drawn line return to how they were the
   moment the first finger landed — and the two fingers only zoom (the chart point under them stays under them). A
   pan made before the second finger is kept. A second finger starts nothing of its own.
2. Leaving Edit chart layout leaves nothing of its canvas's pan and zoom on the ordinary chart (the owner's report:
   "the left side of the tracker chart is cut off"), and going in or out keeps the point in the middle of the chart
   area in the middle.

The rulings that apply are listed in §2 of the sheet (a moved ball saves itself and never lights Save changes; one
undo history; the pinch follows the fingers; everyone has the same access).

## The brief — this wording is your instruction

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Concretely: check the roll-call in §4 of the sheet for rows that are MISSING from it — a first-finger gesture, a
state, a writer (anything else a first finger can store?), a way out of Edit chart layout, an order of fingers. Check
the take-back itself: is anything restored that should not be (a concurrent write, a change made by something other
than the first finger), anything left out of the snapshot, any path where the stored layout and the screen disagree
afterwards, anything that breaks the command stream or the undo contract (`raptor-port/docs/undo-contract.md`)? Check
the mode switch for any other place `view` or the zoom could leak, and the capture-phase / window-level listeners for
anything they now catch that they should not (a mouse, a pen, the normal chart, another page).

## What is NOT a finding (owner, D56, 23 Sep 26)

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Also out of scope, already filed: Edit chart layout on a sideways phone has no room (`[TRK-EDIT-SIDEWAYS]`); the first
tap on a button after a drag is lost in touch emulation (`[TRK-TAP-AFTER-DRAG]`).

## What to hand back

1. Findings, ranked, each with: severity, the concrete scenario (setup, fingers, expected, observed-if-wrong), whether
   it is new with this change or older (compare against `main`), and **exact, step-by-step fix instructions** — the
   function, the change, and the test that should go red first.
2. **Explicit negatives** — "I checked X and found nothing" — for every area you looked at and cleared.
3. Anything in the promise you think is wrong or under-specified, as a question.
