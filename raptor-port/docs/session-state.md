# Session handoff — the perf gate's board budget, closed

## Where it started
The previous session left exactly one thing open: the perf gate's board
assertion was red on purpose (`board edit 1.19×` against a flat `port ≤
reference × 1.15`), and re-baselining it was an owner call. The owner read
the explanation and closed it — "ok u can close the thing u are waiting on
me. makes sense" — without picking between the two options that had been put
to him, so the choice of mechanism was made here and explained back to him in
plain language.

## Shipped
- `probes/perf-port.cjs`: the time budget is now **per node** — `port ms/node
  ≤ reference ms/node × 1.15` — plus a separate, machine-independent **DOM
  ceiling** (board ≤ 770 nodes, week ≤ 5530). 9 passed · 0 failed.
  `docs/probe-sweep.md` §The performance gate carries the reasoning and the
  new numbers; `../HANDOFF.md`'s known-issue bullet was rewritten to match.

Why per node: the flat ratio compared two builds that no longer draw the same
thing (the port's board is 1.78× the reference's nodes), so it measured
feature growth and would have gone red for every feature added. Why the
ceiling beside it: per-node alone would let a DOM explosion through — halve
the per-node cost, double the user's wait. Node counts are gated against a
recorded constant because they are the only measurement here that travels
between machines; times only mean something as a ratio against a reference
measured in the same seconds.

Rejected (and why, so it is not relitigated): comparing the port against a
*recorded port time*. Milliseconds do not travel — one round of the same edit
reads 210–830 ms on this VM — so a number recorded in another container would
be noise.

## Unfinished
Nothing. No open PR, no half-applied edit, no PR under `subscribe_pr_activity`
watch.

## Branch state
- Designated branch: `claude/read-handoff-docs-3xuleg`, PR merged to `main`.
- Because it is MERGED, reset before starting new work:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3xuleg origin/main`
  Otherwise commits stack onto already-merged history. NOTE: other sessions
  use this same branch name CONCURRENTLY, so always fetch before assuming what
  it points at, and expect commits on it this session did not write.

## Gates
- `npm test` · `npm run build` · `node reference/tfin.js` (728/0) ·
  `npm run test:e2e` — all green, run first-hand from `raptor-port/`.
- `npm run perf` — **9/0 green**, run first-hand before and after the change
  (needs `npx vite preview --port 4173`). Self-check that the instrument is
  honest: `PORT_URL="file://$PWD/reference/scheduler.html" npm run perf` → the
  reference against itself, ~1.00× on every metric.

## Pick up here
Nothing is mid-flight, and there is no open owner question. The next
substantial items are the long-standing ones in `../HANDOFF.md`: no shared
data between devices (localStorage only), prototype auth, one dataset.
