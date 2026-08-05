# Session handoff — perf budget closed, then the Quals page reworked

## Where it started
Two asks in sequence. First: the one open owner question from the previous
handoff — the perf gate's board assertion, red on purpose. The owner closed
it ("ok u can close the thing u are waiting on me. makes sense", then "i am
ok to loose the performance standards") without picking a mechanism, so the
choice was made here and explained back in plain language. Second: rework the
Quals page — sort from the headings instead of the Sort chips, a fixed
column order, drop Downchit, add TF, and a View: Pilots / WSOs / All.

## Shipped
Both merged, both Pages deploys green.

- **PR #69 — the perf gate.** The time budget is now **per node** (`port
  ms/node ≤ reference ms/node × 1.15`) plus a separate, machine-independent
  **DOM ceiling** (board ≤ 770 nodes, week ≤ 5530). 9 passed / 0 failed, from
  6/1. Why per node: the flat ratio compared two builds that no longer draw
  the same thing (the port's board is 1.78× the reference's nodes), so it
  measured feature growth. Why the ceiling beside it: per-node alone would let
  a DOM explosion through. Node counts are gated against a recorded constant
  because they are the only measurement here that travels between machines.
  Rejected, so it is not relitigated: comparing against a *recorded port
  time* — milliseconds do not travel (210–830 ms per round on this VM).
  Reasoning: `docs/probe-sweep.md` §The performance gate.
- **PR #70 — the Quals page.** Headings sort (second click inverts; CAT by
  seniority, a qual column by who holds it, a WSO's struck AAR cell counts as
  not held); columns run SANS, SXO, SCHEDULER, SC DAY, SC NIGHT, DAAR, NAAR,
  NVG, IMC, TF; Downchit dropped; TF added, held by nobody and read by no
  rule; View: Pilots / WSOs / All beside Export, with the CSV following the
  screen and an extra Seat column in the All export. Contract:
  `docs/ui-contracts.md` §The Quals page's columns, sorting and View.

Two owner decisions inside #70 worth not relitigating: **SXO stays** as a tick
column, immediately right of SANS (it was missing from the owner's list; they
kept it). **FLIGHT became editable** in edit mode — the roster records no
flights at all, so the grouping the owner asked for would have had nothing to
group; they chose editable over seeding invented data. Do not seed flights.

## Unfinished
Nothing. No open PR, no half-applied edit, no PR under `subscribe_pr_activity`
watch, and no open owner question.

## Branch state
- Designated branch: `claude/read-handoff-docs-3xuleg`, PR merged to `main`.
- Because it is MERGED, reset before starting new work:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3xuleg origin/main`
  Otherwise commits stack onto already-merged history. NOTE: other sessions
  use this same branch name CONCURRENTLY, so always fetch before assuming what
  it points at, and expect commits on it this session did not write.

## Gates
Run first-hand from `raptor-port/`, all green at the merge of #70:
- `npm test` (503) · `npm run build` · `node reference/tfin.js` (728/0) ·
  `npm run test:e2e` (11/11).
- `npm run probes:adapted` (6/6) and `npm run perf` (**9/0**) — both need
  `npx vite preview --port 4173` first, neither is in CI. Instrument
  self-check: `PORT_URL="file://$PWD/reference/scheduler.html" npm run perf`
  → the reference against itself, 9/0 with the node ratio reading 1.00×.

## Pick up here
Nothing is mid-flight. The next substantial items are the long-standing ones
in `../HANDOFF.md`: no shared data between devices (localStorage only),
prototype auth, one dataset. TF is deliberately inert — if the squadron wants
a TF mission to demand a TF-qualified crew, that is a new validator rule
(`engine/validate.ts`), not a change to the column.
