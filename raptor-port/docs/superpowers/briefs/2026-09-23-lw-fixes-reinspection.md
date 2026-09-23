# Re-inspection brief — the review-round fixes on `claude/lw-monthjump-phone` (23 Sep 26)

You are re-reading ONLY what changed since commit `8ddb32b4` — the fixes made to your own and another
reader's findings on that commit. Read-only: do not edit, run or delegate. The first brief
(`2026-09-23-lw-fixes-inspection.md`) and the evidence sheet (`raptor-port/docs/handpass/2026-09-23-lw-monthjump.md`,
§14 lists every finding and what became of it; §15 the gates) give the context.

## What changed (`git diff 8ddb32b4`)

- **LW-101:** `CountRows.tsx` calls a new `onArchiveChange` prop from a layout effect keyed on its own
  `archiveOpen` (skipping the first run); `Matrix.tsx` passes a stable callback that replaces the current
  width token (`widthGenRef.current = {}`) and runs the geometry re-measure and the frozen-header re-pin.
  The token is now a ref a render only overwrites when the `widthGen` memo itself changed.
- **LW-102:** the remeasure layout effect has `widthGen` in its deps and publishes itself as
  `remeasureRef`; the frozen-header effect publishes `pin(true)` as `repinRef` (reset on cleanup); a new
  layout effect calls `repinRef.current()` on every `widthGen` change; `pin` keeps the previous stuck object
  when a forced re-measure found the same numbers (`sameStuck`).
- **TEST-001:** `e2e/app.ts gridAtRest` — named errors (not drawn in 5s; never still in 15s), ≤1px counts as still.
- **CI-PATHS-001:** `.gitattributes` removed from both `paths-ignore` lists in `deploy.yml`; notes added
  there for SEC-101 (take the runner off before any collaborator) and CI-REQ-001 (no required checks exist).
- Tests: `counts.test.tsx` (the block's call), `archivewire.test.tsx` (Matrix passes it — a `vi.mock`
  pass-through), e2e "a column that widens while the dates are frozen re-measures the frozen bar";
  `monthstrip.test.tsx`'s fake layout now moves with `scrollLeft` (its expectations unchanged).
- Docs: `performance.md` §16, `ui-contracts.md`, OUTSTANDING/ARCHIVE moves, handoff notes.

## Your brief

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward.** If the app would do it again to NEW data, report it.

Exact, step-by-step fix instructions per finding; explicit negatives. Questions worth your time: does
each fix close its finding completely; can the new re-measure/re-pin loop, fire during a touch fling in a
way that writes `scrollLeft`, or cost a whole-grid render per store change; is the `monthstrip.test.tsx`
stub change honest (does it model a browser, or does it teach the test to look away); anything the fixes
broke elsewhere (the phone's rolling window, the hidden-tab shrink, the drawer, Rearrange).
