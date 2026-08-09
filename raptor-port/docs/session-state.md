# Session handoff — late-input mark shipped; one unexplained test flake left open

## Where it started

Owner asked to de-clutter code and docs, then to add a "late input" rule:
a deadline set on the Rules tab, with a small note that rides the input
everywhere including the view-only page. Two follow-up corrections came
mid-build — two weeks rather than one, and exempt downchits.

## Shipped

- De-clutter sweep (dead CSS, a permanently-hidden note in `Shell.tsx`,
  `HANDOFF.md` 1105 → 294 lines) — PR #123, merged, deploy green.
- Late-input mark: `VCONF.inputLead` (14 days, Rules tab), `LATE` badge on
  the week / board / Inputs page / promoted ground row, downchits exempt —
  PR #123, merged, deploy green and verified by driving the live page.
- Doc-truth fixes found by this handoff's own Step 3 check — PR #124.

## Unfinished

- **One `npm test` run in five failed 3 tests, and the names were not
  captured.** Seen once at the head of this work: `3 failed | 841 passed`,
  with the suite taking 108 s against its usual ~45 s and 247 s of test time
  against ~96 s — i.e. the container was heavily loaded at the time. Four
  consecutive runs since are clean at 844/844, and the four CI gates were
  green on PR #123. The output was tailed too short to record which three,
  which is the actual gap: **there is no evidence identifying them.**
  Not assumed benign. This session's change touches no timer, no async path
  and no shared mutable state beyond the seed snapshot each file already
  restores in `beforeEach`, so a load-induced `act()`/render timeout in a
  component file is the likeliest reading — but that is a hypothesis, not a
  finding. If it recurs, capture the full output (`npm test -- --run
  > log 2>&1`, then read the FAIL lines) rather than tailing it; a name is
  all that is needed to settle whether it is real.

## Branch state

- Designated branch: `claude/read-handoff-docs-ynua8o`
- Its PR (#123) is **merged**; the branch was reset onto merged `main`
  (`git checkout -B claude/read-handoff-docs-ynua8o origin/main`) to carry
  the PR #124 doc fixes.
- If #124 is also merged when the next session starts, reset again before
  any new work, or commits stack onto already-merged history:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-ynua8o origin/main`

## Gates

- `npm test` 844/844 across 49 files · `npm run build` clean ·
  `node reference/tfin.js` 728/0 · `npm run test:e2e` 54/54 — all green,
  run first-hand at the head of PR #123, and `npm test` re-run four more
  times during this handoff (see Unfinished for the one failure).
- `npm run probes:adapted` 6/6 · `npm run perf` 7/0 — green, run first-hand.
  Both need `npx vite preview --port 4173` running first; kill it again
  before any `test:e2e` run or that gate silently reuses the stale bundle.
- Run all of these from `raptor-port/`, not the repo root; a fresh container
  needs `npm ci` first.

## Open questions

- Owner was offered, and has not asked for, two follow-ons to the late-input
  mark: a way to switch the deadline off entirely (the lowest setting, 0
  days, still means "due by the Monday"), and exempting leave as well as
  downchits. Both are recorded as limitations in `HANDOFF.md`; neither is
  blocking. Do not build either unasked.

## Pick up here

Nothing is in flight beyond PR #124. If `npm test` ever shows failures
again, capture the full log before anything else — the Unfinished item above
is one name away from being closed or becoming real.
