# HANDOFF — 23 Sep 26 (evening). PR #428 MERGED on his "merge live" (his look done): the Leave War fixes and the checks-on-his-PC move are on `main`.

**Pick `main` in the new-chat picker.** Before acting: `git fetch`, `gh run list --branch main --limit 2` — the
merge's own check run on his PC was still going when this was written; confirm it went green.

## What landed

`[LW-MONTHJUMP-PHONE]`, `[LW-HBAR-RESYNC]`, the owner's filmed frozen-bar jump, the same one-frame-late
placement on the bottom scrollbar and the Quals frozen header, and the review-round fixes (the manning Archive
as a width input; the frozen bar and the bidding outline re-measure on changes). Evidence:
`raptor-port/docs/handpass/2026-09-23-lw-monthjump.md` PART TWO. The checks run on HIS PC — a Windows service
under NETWORK SERVICE at `C:\actions-runner\actions-runner` (never delete `C:\actions-runner`); its folder
permissions were tightened by him (Astra SEC-102, done).

## Next, in order

1. **The presentation/demo-video chat (D154) is the current work (D155)** — `main` has the Leave War fixes.
   Preview 4185, rulings from D170; D58 holds (no unit designation).
2. **`[HUMAN-RETEST]` — the Tracker chat is PAUSED (D155)** at its own handoff on
   `claude/tracker-human-retest-8d3411` (D153 ports 4180/4182/4181, rulings from D120); it resumes on his
   word and merges `main` in first (D78).
3. Filed from this work: `[LW-FROZEN-BAR-GAP]` (a one-frame blink), `[LW-FIGSEL-SLOW]` (a slow unit test).
4. A docs-only trim pass (D29): DECISIONS is over its ceiling.
5. Before ANY collaborator: take the runner off this repo (Astra SEC-101, `[REPO-PRIVATE]`).

## How pushes cost runs (his question, 23 Sep 26)

Any push to a branch with an open PR re-runs the whole check set, even notes-only (D151's reason). Notes wait
and ride along with the next real change or the merge; the merge itself earns one run on `main`.
