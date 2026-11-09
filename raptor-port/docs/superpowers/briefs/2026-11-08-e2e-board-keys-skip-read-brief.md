# Read brief — [E2E-BOARD-KEYS-SKIP], the board-layout keyboard test never skips (D1936), 8 Nov 26

A fresh, blind Opus read of a test-only change (how-we-work: every job that needs a code read gets one). Read-only:
change no file, commit nothing, push nothing.

## What to read
- The change: `git diff origin/main...claude/e2e-board-keys-skip -- raptor-port/e2e/board-layout.spec.ts`.
- The finding it answers: `raptor-port/docs/superpowers/briefs/2026-11-08-review-8nov-jobs-fable.md` §4, F-689-1 — the
  test "a box low on the screen tapped with the keys up rises above them" skipped itself whenever the box it picked
  already sat above the simulated keyboard, so it did not prove the case on every run.
- The ruling: `grep -h '^| D1936 |' .claude/decisions-full/*.md` — fix the test to always prove the case; a test change
  only, never the app.
- The app code the test drives, as needed: the board's keyboard handling (search `raptor-port/src` for `kbroom` and
  `visualViewport`), and the neighbouring test "the last box of the list…" in the same file, which covers the end of
  the list.

## The questions
1. Does the new fixture always put a box under where the simulated keys come, with no path left where the test passes
   without proving the box rises above them (a skip, a vacuous assertion, a condition that is never false)?
2. Does it still prove what the old test meant to prove — a box low on the screen, tapped with the keys up, rises above
   them; the bar stays in sight; the list gets about 151px — and nothing weaker? Compare each assertion before and after.
3. Could it fail for a reason that is not an app fault (an unsteady fixture: the scroll clamped, the box re-drawn and
   its marker lost, the box hidden under the bar, a timing wait), so it would be red on a correct app?
4. Did anything outside the test change?

## What is not a finding
- A problem that lives only in data already stored (D56).
- A fault in the app the test drives that this test change neither causes nor hides — note it separately, not as this
  change's finding.

## What to hand back
Each finding with: the line, what is wrong, a concrete failing case (inputs → wrong result), and the fix. If nothing,
say "nothing found" and what you checked.
