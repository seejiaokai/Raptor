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
- Quals: "Level" → CAT, CI removed from the ladder, CAT A / CAT B tick columns
  removed — PR #65. **Partly superseded by #67, below.** #65 moved the six CI
  holders to `I` and kept the IP tick column, on the reasoning that IP was the
  only way to record "CAT A *and* instructor". #67 then deleted the generic
  `I` and the IP column both, folding instructor-ness into CAT itself — so
  neither `I` nor an IP column exists now, and the six sit wherever #67's
  migration put them. Do not plan against either.

NOTE: two PRs on this branch came from a PARALLEL session and were NOT written
here. Both are on `main` and deployed.
- PR #64 (`4e8614e`) — the window calendar closes on an outside click, and a
  just-added input pins to the top whatever the window says.
- PR #67 (`352f71f`) — instructor CATs replace the `ip` flag; the ladder is
  now OCU/D/C/B/A/IW/IP/IR/FI, plus a hard NO_IR rule for IRT missions. It
  documented itself in `HANDOFF.md` and `raptor-port/docs/engine-rules.md` —
  read those, not this file, for the current ladder. It also replaced
  `html.test.ts`'s `catCI` excision helper with a general `remap()` in
  `src/testing/refwin.ts`.

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
- Its latest PR is **merged** (#67 → `main` as `ad9469f`).
- Because it is MERGED, reset before starting new work:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3xuleg origin/main`
  Otherwise commits stack onto already-merged history. NOTE: other sessions
  use this same branch name CONCURRENTLY — #60, #61, #64 and #67 all landed
  from one mid-session — so always fetch before assuming what it points at,
  and expect commits on it that this session did not write. #67 landed after
  this file's previous version was merged, which is why that version had gone
  stale within the hour.

## Gates
- `npm test` (488) · `npm run build` · `node reference/tfin.js` (728/0) ·
  `npm run test:e2e` (11/11) — all **green**, run first-hand against `main` at
  `ad9469f`, not copied from a commit message. Run them from `raptor-port/`,
  not the repo root.
- `npm run probes:adapted` (6 files, 127 assertions) — green, also run
  first-hand at `ad9469f`. Needs `npx vite preview --port 4173` first. Not in
  CI.
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
