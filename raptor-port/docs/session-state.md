# Session handoff — the handoff audited, then the whole doc set aligned

## Where it started
The session opened with a single instruction: read `HANDOFF.md`. The owner
then chose, out of four offered next steps, to **audit that file against the
current tree** — check the file map and the open-work list still describe
reality, and fix whatever had drifted. Shown the result, he asked for the
leftovers to be fixed and the rest aligned or deleted. No feature work was
asked for and none was done: **no code changed in this session at all.**

## Shipped — first commit: the handoff audit
Documentation only, on `claude/read-handoff-rmog46`.

`HANDOFF.md` had drifted in six places, all found by walking the tree rather
than by reading the file:

- **`src/ui/RangeCal.tsx` was missing from the file map entirely** — it has
  never appeared there, though it landed back in `5bdeb59`, is imported by
  `InputsPage.tsx` and has its own section in `ui-contracts.md`. Added.
- **The Inputs table's view state was unrecorded.** Its date window and
  heading sort mean the DOM row order is NOT `INPUTS` order — the trap that
  catches anything addressing a row by position. Now called out on the
  `InputsPage.tsx` row, pointing at the contract.
- **`src/engine/index.ts`** (the barrel every UI import goes through) and
  **`docs/session-state.md`** (this file) were both absent from their tables.
  Added.
- **The deploy bullet described push-to-main only.** The four gates have run
  on pull requests into main since the 5 Aug owner ask; a PR run gates but
  uploads no artifact and never deploys. Recorded, in the bullet and in the
  `deploy.yml` row.
- **The perf bullet quoted `0.67×` per node as a fixed fact.** It measures
  ~0.70× on this machine — the ratio moves with the hardware. Softened, and
  the raw board ratio (~1.24×, still over the retired flat 1.15 budget) noted
  so the reason for the per-node budget stays legible.
- **A stray `raptor-port/~$ART_HERE.md` is tracked** — a 162-byte Word
  owner-lock file committed by accident in PR #28. Flagged in the file, NOT
  deleted: it is junk, but removing it was outside what was asked.

## Shipped — second commit: the rest of the doc set
The audit above only covered `HANDOFF.md`. Asked to fix the leftovers and
align or delete the rest, the sweep widened to every doc in the repo. Three
of them still described a mid-port project:

- **Root `README.md`** claimed "all three must pass" and listed three gates —
  the geometry gate has been the fourth, and in CI, since it was written. It
  also billed `user` / `user` as **view-only**, which the 5 Aug roles decision
  had already undone. Both fixed, and the PR-gating noted.
- **`raptor-port/README.md`** was the pre-port package readme: "everything
  Claude Code needs to port the single-file scheduler", a file tree with no
  `src/`, and instructions to `git init` and run the PORTING phases in order.
  Every line of it was false. Replaced with a short routing table, the four
  gates and the browser path.
- **`START_HERE.md`** was one-time cloud-onboarding — create the repo, upload
  the files, paste phase 0. The repo has existed for months and **nothing
  referenced the file**. Deleted, with the stray Word lock file that was its
  own leftover (`~$ART_HERE.md` is Word's lock for `START_HERE.md`), and
  `~$*` added to `.gitignore` so the next one never lands.
- **`CLAUDE.md` carried the same view-only line** as the root README, in the
  paragraph a session reads before touching anything. Fixed, pointed at the
  roles table.
- **`PORTING.md` was KEPT and marked historical.** It is the one legacy doc
  still load-bearing: `docs/probe-sweep.md` cites it four times for why
  `perf2` and the `perf1` cache sections were dropped and why the adapted
  probes keep their behavioural checks, and `probes/perf-port.cjs` cites its
  original timing budgets. Deleting it would have orphaned those references.

## Gates
Run first-hand from `raptor-port/` at `9443d72` (the tip of `main`), all six
green — a fresh container needs `npm ci` first, `node_modules/` is not in the
image:

- `npm test` — **525 passed**, 31 files (was 520/30; `ui/export.test.ts` is the
  new file)
- `node reference/tfin.js` — **728 passed, 0 failed**
- `npm run build` — clean
- `npm run test:e2e` — **11/11**
- `npm run probes:adapted` — **6/6**
- `npm run perf` — **9 passed, 0 failed**; week DOM 5028n (ceiling 5530),
  board DOM 699n (ceiling 770)

The last two were the previous session's one piece of unfinished business:
neither had been run against PR #75's `validate.ts` change, and both exercise
validation. They are now verified at this tip, and #76 and #77 landed on top
of #75 before this run, so all three are covered.

The gates were **not** re-run after the second commit: it deletes two files
neither the build nor any test imports, rewrites three Markdown files and
adds a `.gitignore` line. Nothing under `src/`, `e2e/`, `probes/` or
`reference/` was touched in this session.

## Unfinished
Nothing. No open PR beyond the one carrying this change, nothing half-applied,
nothing under `subscribe_pr_activity` watch.

## Branch state
- Designated branch: `claude/read-handoff-rmog46`, cut from `origin/main` at
  `9443d72` (merge of PR #77).
- Reset before starting new work:
  `git fetch origin main && git checkout -B <branch> origin/main`
- `main` did not move during this session, but earlier sessions saw it move
  twice mid-flight and a second session run in parallel. Fetch before
  assuming what `main` or any `claude/read-handoff-*` branch points at.

## Open questions
None.

## Pick up here
Nothing is mid-flight. The next substantial items are still the long-standing
three in `HANDOFF.md`: no shared data between devices, prototype auth, one
dataset — the first of which is also what would make EDIT QUALS column
changes, quals ticks and initials survive a reload.
