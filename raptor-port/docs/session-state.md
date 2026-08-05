# Session handoff — testing gates closed, then the Inputs and Quals pages reworked

## Where it started
Three asks in sequence. First: fix three of `HANDOFF.md`'s known issues —
jsdom not measuring layout, the four probe-sweep leftovers, and the flaky
`probes/perf-port.cjs`. Then: sort the Inputs table by any column, open it on
today → +2 months with a calendar range picker, and make the row edit/delete
buttons bigger and further apart. Then: rename the Quals page's "Level" column
to CAT, drop CI from the ladder, and answer why CAT A / CAT B / IP were ticked
separately when the dropdown already sets the category.

Constraint that emerged: seeing the volume of new code, the owner asked
whether the app would get slower. Measured and answered — it is all test/probe
code; the shipped bundle grew 65 bytes raw / 18 gzipped (0.016%). Owner is
non-technical and asked explicitly for plain language; chat explanations
stayed jargon-free per `CLAUDE.md`.

## Shipped
All merged, all Pages deploys green.

- Geometry gate (`e2e/`, `npm run test:e2e`) as the fourth CI gate; four
  adapted probes (`aar` `audit` `sa` `sc2`) + `npm run probes:adapted`;
  rewritten perf estimator (`npm run perf`) — PR #59.
- Inputs table: sortable headings, today → +2-months default window with a
  `RangeCal` range picker, 30px row buttons 22px apart — PR #62.
- Handoff doc — PR #63.
- Quals: "Level" → CAT, CI removed from the ladder (the six who held it are
  now `I`), CAT A / CAT B tick columns removed — PR #65.

NOTE: PR #64 (`4e8614e`, calendar closes on outside click; a just-added input
pins to the top whatever the window says) came from a PARALLEL session on this
same branch and rode into `main` ahead of PR #65. It was not written here.

## Unfinished
- **The perf gate's board assertion is RED on purpose.** `board edit ~1.19×`
  against the 1.15 budget, stable across runs. Not a rendering regression —
  the port's board carries 1.78× the reference's nodes (699 vs 393). The
  threshold was deliberately not moved. Numbers and reasoning:
  `raptor-port/docs/probe-sweep.md` §The performance gate. Do not turn this
  green by loosening the ratio; it needs the owner's decision (below).
- Nothing else. No open PR, no half-applied edit, no PR under
  `subscribe_pr_activity` watch.

## Branch state
- Designated branch: `claude/read-handoff-docs-3xuleg`
- Its PR is **merged** (#65 → `main` as `d0231b9`).
- Because it is MERGED, reset before starting new work:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3xuleg origin/main`
  Otherwise commits stack onto already-merged history. NOTE: other sessions
  use this same branch name concurrently (#60, #61 and #64 all landed from one
  mid-session), so always fetch before assuming what it points at, and expect
  commits on it that this session did not write.

## Gates
- `npm test` (481) · `npm run build` · `node reference/tfin.js` (728/0) ·
  `npm run test:e2e` (11/11) — all **green**, locally and on every merged CI
  run. Run them from `raptor-port/`, not the repo root.
- `npm run probes:adapted` (6 files, 127 assertions) — green. Not in CI.
- `npm run perf` — **6 pass / 1 fail, the failure by design**; see Unfinished.
  Not in CI. Self-check that the instrument is honest:
  `PORT_URL="file://$PWD/reference/scheduler.html" npm run perf` → ~1.00×.

## Open questions
- **Re-baseline the board perf budget?** `port ≤ reference × 1.15` now
  compares two boards that are no longer the same board, so it measures
  feature growth rather than regression. Options put to the owner, none
  chosen: measure the port against a recorded port number instead of the
  reference, or move to a per-node budget. Owner replied "ok deploy it"
  without answering, so it is still open. Owner decision, not an engineering
  one.

## Pick up here
Nothing is mid-flight. If the owner returns to the perf question, the change
is small and confined to `raptor-port/probes/perf-port.cjs` — the `noRegress`
calls near the end, and the header comment explaining the method.
