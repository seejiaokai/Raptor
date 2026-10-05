# Brief — independent final read of `[SAVE-NOTE-COVERS]` — round 2 (the fixes for round 1), the last round

**For:** Astra (Codex), a fresh session, reading as the model that did NOT write this. Opus 5.5 wrote the fixes.
**Branch:** `codex/save-note-controls`. **Read:** `git diff c8d006eb..HEAD -- raptor-port/src raptor-port/e2e` (the fixes
for round 1) against the whole change `git diff c6e1634d..HEAD -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts`.
**You are read-only.** Change no file; run no full suite (one PC, one lock). Reading, `git` and reasoning.

## Read first

- Round 1's brief (its seven hunts, the finder's question and what is NOT a finding all still apply):
  `raptor-port/docs/superpowers/briefs/2026-10-05-save-note-controls-astra-final-r1.md`.
- Round 1's report, verbatim: `raptor-port/docs/handpass/2026-10-05-save-note-controls-astra-final-r1.md`.
- The evidence sheet, with each finding's disposition (§The read), the corrected roll-call and break tests 6–10:
  `raptor-port/docs/handpass/2026-10-05-save-note-controls.md`.
- The contract as it now stands: `raptor-port/docs/ui-contracts.md` §The failed-save warning has a band of its own.
- The area rules: `.claude/rules/raptor-executor.md`, `.claude/rules/decisions/leave-war.md` (§Architecture — the Leave
  War's seams: `leavewar/ui/OilTracker.tsx` now imports `SaveBand` from `ui/SaveStatus.tsx`, as `Matrix.tsx` already
  imports `ui/lift` and `RemarksSheet.tsx` `ui/inputedit`), `.claude/rules/decisions/tracker.md`,
  `.claude/rules/decisions/scheduler.md`.

## What to judge

1. **Each of F1–F5 and each test weakness:** is it actually closed? Name any that is not, with the concrete failure.
2. **F3 and F4 were fixed another way than you instructed.** You asked for a `ResizeObserver` on the shell's bar in each
   page's pinning effect (Quals, the Leave War's matrix) and in the Tracker. The fix instead has `Shell.tsx` fire ONE
   `resize` on the window when the warning comes or goes — because each of those places already re-measures on a
   resize. Attack that choice: (a) name every `resize` listener in `raptor-port/src` that does something a person would
   NOT want at the moment a save fails or lands — closes a menu, a sheet or a picker they are using, resets a zoom or a
   scroll place, re-fits the Tracker's chart, cancels a drag in flight, re-clamps a window they placed — and say for
   each whether it is harmful or harmless here; (b) name any place that measures the bar and does NOT listen for a
   resize, so it is still stale; (c) say whether the trigger can fire before the bar's new height is laid out, or miss
   a change (the first draw is skipped on purpose).
3. **F5:** `inert` and `aria-hidden` on the bar's copy while a `SaveBand` counts itself in (`cover(±1)` in an effect
   keyed on `failed` and `active`). Can the count go wrong — a surface unmounted while failed, the board closed with
   the save still failed, two surfaces open at once, React's double-run of effects in development — and leave the bar's
   warning hidden with no surface showing one? That would be worse than the fault it fixes.
4. **F2:** the rule is now inside `@media (min-width:621px)` with a `max-height` less the band. Does it meet the two
   windows' own rules correctly at every width (their own breakpoint is `max-width:620px`), including a window a person
   has resized or moved (inline styles), and the changes window's slim bar?
5. **Anything NEW the fixes break or newly reach** — the same finder's question as round 1, over the fixes.
6. **The tests added** (`e2e/save-note.spec.ts`, 35 tests; `src/ui/SaveStatus.test.tsx`): does each prove what its name
   says? Name any wire you could cut with nothing going red.

## What is NOT a finding

Everything round 1's brief lists, and the same demo-data exclusion: this app's entire stored world is DEMO DATA that
will be CLEARED before the database step — do not report a problem whose harm exists only in data already stored when
the code is already correct going forward. Also not findings: things round 1 already raised and this round closed; a
preference between two correct designs with no concrete failure (D489 — a claim is a finding only with a concrete
failure, its cause and its fix).

## What to hand back

- **Verdict:** PASS or CHANGES REQUIRED. This is the last round (two reads is the cap): if CHANGES REQUIRED, the fixes
  are made and reported to the owner with your finding beside them.
- **Each finding:** severity; exact setup, action, expected, observed; cause with file and line; **exact, step-by-step
  fix instructions**.
- **Explicit negatives** for items 1–6 above: "I checked X and found nothing", naming what you checked.
- **D138:** D587's short line in `.claude/rules/decisions/how-we-work.md` was rewritten to carry the short-visit
  exemption — read it against its full row in `.claude/decisions-full/how-we-work.md` again.
