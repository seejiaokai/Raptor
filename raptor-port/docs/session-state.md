# Session handoff — removed the Edit-mode toggle, then fixed the `.sbi-rmk` typo

## Where it started

Owner asked for the piece of work `HANDOFF.md` had named as next: remove the
Edit-mode toggle entirely, and "cleanly optimise" the app alongside it —
explicitly allowing "if there is nothing to delete or optimise then its ok",
which is how the de-clutter pass stayed small and honest rather than padded.
He then asked separately to fix the `.sbi-rmk` styling typo (which the toggle
PR had reported and deliberately left), and then to merge.

## Shipped

- Edit-mode toggle removed + dead-code sweep + `.sbi-rmk` typo closed —
  PR #122, **merged**, deploy **green and verified on the live page**
  (loaded `https://seejiaokai.github.io/Raptor/`, logged in, drove Edit
  Schedule / the board / View-only Sched; no console errors, page errors or
  4xx). Detail is in `../../HANDOFF.md`; not repeated here.

## Unfinished

- **One doc-only commit sits on the branch, unmerged, with no PR open.**
  `434ac4e` — HANDOFF's gate header said e2e was 50/50 (it is 51/51 since
  #122 added the remarks-cell test) and the geometry-gate entry still said
  "seventeen contract families over 40 tests". Found by this skill's Step 3
  check *after* #122 had already merged, so it could not ride along in it.
  A PR was not opened because the owner did not ask for one and the session
  instruction is to open one only when asked. Nothing depends on it; it is
  a correctness fix to the docs, not to the app, and no gate needs re-running
  for it.
  Left to do: open a PR for it and merge, **or** simply let the next change
  carry it — the commit is already on the branch, so a later PR from this
  branch will include it.

## Branch state

- Designated branch: `claude/read-handoff-tnpepg`
- Its PR (#122) is **merged**.
- The branch was already reset off the merged main this session
  (`git checkout -B claude/read-handoff-tnpepg origin/main`) and then given
  the one commit above, so it is `origin/main` + `434ac4e` and does **not**
  stack on merged history. A next session starting fresh work here should
  re-check that it is still current (`git fetch origin main`) but must NOT
  reset the branch again without first preserving `434ac4e`.

## Gates

Run first-hand this session, from `raptor-port/`, against a freshly built
bundle (a fresh container needs `npm ci` first):

- `npm test` **819/819** across 47 files — green
- `npm run build` — clean
- `node reference/tfin.js` **728/0** — green
- `npm run test:e2e` **51/51** — green
- `npm run probes:adapted` **6/6** — green
- `npm run perf` — **six of seven assertions green every run; the seventh
  straddles.** The one-day-edit per-node budget sits on its own 1.15 line on
  this container: nine readings of the shipped code ranged 1.08×–1.23×, so
  the gate returns 7/0 on some runs and 6/1 on others. The unchanged parent
  commit behaves identically, and a paired measurement (both builds served
  side by side, `PORT_URL=… npm run perf` alternately against each in one
  window) gave per-node differences of +0.07, −0.05, +0.01 across three
  rounds — no difference. **This is not an unfinished item and does not need
  chasing.** The budget was deliberately not raised; the paired-measurement
  recipe is recorded in `../../HANDOFF.md`'s gate header.

The doc-only commit above changes no code, so none of these need re-running
for it.

## Open questions

- none.

## Pick up here

Nothing is blocked. If the next task is unrelated, just carry `434ac4e`
along in whatever PR it opens from this branch; if you want the docs true on
`main` first, open a PR for that one commit and merge it.
