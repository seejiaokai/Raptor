# Brief — independent final read of `[SAVE-NOTE-COVERS]` (the failed-save warning's band) — round 1

**For:** Astra (Codex), reading as the model that did NOT write this. Opus 5.5 planned and built it (D586, D587, D67).
**Branch:** `codex/save-note-controls`. **The change to read:** `git diff c6e1634d..HEAD -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts`
(the base `c6e1634d` is the pushed `codex/workflow-ui`; everything older is not this change).
**You are read-only.** Change no file. Do not run the full gate set or a multi-file browser run (one PC, one lock —
`.claude/rules/shipping.md` §The checks); reading, `git`, and a single test file are fine.

## Read first (nothing in this repo loads by itself for you)

- `raptor-port/docs/handpass/2026-10-05-save-note-controls.md` — the evidence sheet: what was reproduced, the ROLL-CALL
  of every surface, the walk, what was NOT walked. Read it as a list to check for gaps.
- `raptor-port/docs/ui-contracts.md` §The failed-save warning has a band of its own — the contract.
- The rulings: `grep -h '^| D586 |\|^| D587 |' .claude/decisions-full/*.md` (full rows) and their short lines in
  `.claude/rules/decisions/how-we-work.md`. Also `.claude/rules/raptor-executor.md`, `.claude/rules/decisions/scheduler.md`,
  `.claude/rules/decisions/tracker.md`, `.claude/rules/decisions/leave-war.md` (the areas whose screens the band meets).
- The changed files: `raptor-port/src/ui/SaveStatus.tsx`, `src/ui/scheduler/17-save-status.css`, `src/ui/Shell.tsx`,
  `src/ui/SchedBoard.tsx`, `src/ui/InputsCal.tsx`, `src/ui/MedicalView.tsx`, `e2e/save-note.spec.ts`,
  `playwright.config.ts`; and unchanged but relevant: `src/storage/postman.ts` (when a save is "failed"),
  `src/ui/scheduler/02-shell.css` and `09-week-responsive.css` (the top bar, desktop and phone), `e2e/geometry.spec.ts`
  "the Saving… note never moves the top bar" (must still hold).

## What was promised (the owner's words, D586 / D587)

A failed save's warning must stay VISIBLE and leave EVERY page's controls usable, on a phone and a desktop — checked by
real presses, not appearance. Accepted design: a band of its own along the bottom of the top bar (the page moves down
one line, nothing is covered), reading "Not saved — keep this page open" with Retry; the same band under the bar of
every full-screen surface that covers the top bar; the passing "Saving…" note unchanged.

## The question — a finder's, not only a reviewer's

Do not merely review the changed code. Starting from the user promise and the applicable
rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
correct and the defect may be a MISSING call site.** For each item, state where the visible sign
and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start
with the least-shared or most specialised surface.

In particular, hunt for:
1. **A surface that lies over the top bar and has no band** — any `position:fixed` full-screen or long-lived surface
   beyond the scheduler board, the Inputs calendar and the Medical view (search every stylesheet under `raptor-port/src`,
   the Leave War's and the Tracker's included). For each: full-screen and long-lived (needs a band) or a short visit
   (D587 says none)? Say which and why.
2. **Anything pinned at a fixed height, or measured once, that the taller bar now reaches or covers** — beyond the
   week's side arrows, the CREW tab and the two movable windows that the change already moves. Sticky headers, the
   Leave War's frozen header and sheets, Quals' frozen header, Logic's pinned search, the Tracker's own bar, the phone
   drawer, anything using a hard-coded top offset.
3. **The measuring** (`useFollowTheBar`): a state where the band's top is wrong — the bar's height changing with no
   resize; the note mounting before the bar's class lands; a status going failed → saving → failed; two top bars in
   the document (the Leave War's chrome has its own `.topbar` class); the phone bar scrolled sideways; a browser
   without `ResizeObserver`; the iPhone's pull-down bounce.
4. **Presses**: any way a press meant for a page control still lands on Retry, or a press on Retry lands elsewhere —
   layering (`z-index`), `pointer-events`, the band wider than the screen, a control of the bar's own row under it.
5. **The states of the note**: "Saving…" must behave exactly as before (floating, taking no press, never moving the
   bar or its buttons). Does any new rule leak onto it, or onto the Tracker's own `.savestat` in its header?
6. **Accessibility and words**: two `role="status"` elements at once (bar + board); the ⚠ hidden from readers; the
   wording against `raptor-port/CLAUDE.md` §UI copy reads production.
7. **The tests**: does `e2e/save-note.spec.ts` prove what its names say? Name any assertion that would still pass with
   the fix broken (a wire you could cut with nothing going red), and any test that fabricates state the app would not
   reach. The forced failure (storage made to throw) and the one bridge write are deliberate and stated in the file.

## What is NOT a finding

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
the database step. **Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward** — no migration, no back-compat, no "an existing
record would read wrongly". If the app would do it again to NEW data, report it: that is a real
finding and this exclusion does not touch it.

Also not findings here: the Tracker saying "saved" when the save failed (filed, `[TRK-SAVE-FAIL-SAYS-SAVED]`); the
movable windows' default spot overlapping a two-line top bar by a few pixels as it did before (filed,
`[FLOATWIN-TWO-LINE-BAR]`); the size of the app's buttons (D487); anything in `c6e1634d` or older that this change did
not make reachable — but if this change makes an old fault newly reachable, that IS a finding: say so.

A claim is a finding only with a concrete failure, its cause and its fix (D489).

## What to hand back

- **Verdict:** PASS or CHANGES REQUIRED.
- **Each finding:** severity; the exact setup, action, expected and observed; the cause, with file and line; and
  **exact, step-by-step fix instructions** — not a direction.
- **Explicit negatives:** for each of the seven hunts above, "I checked X and found nothing", naming what you checked.
- **The roll-call:** any row of the sheet's table you believe is wrong or missing.
- **The two rulings (D138):** read D586's and D587's SHORT lines in `.claude/rules/decisions/how-we-work.md` against
  their FULL rows in `.claude/decisions-full/how-we-work.md`; say whether each short line states the same rule, or what
  it changes.
