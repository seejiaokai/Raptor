# HANDOFF — 23 Sep 26 (evening). PR #428 MERGED on his "merge live" (his look done): the Leave War fixes and the checks-on-his-PC move are on `main`.

## The Tracker `[HUMAN-RETEST]` — RESUMED (D125) on `claude/tracker-human-retest-8d3411` (not merged)

**Resumed by the owner, 23 Sep 26 (D125, superseding D155's pause):** it runs beside the demo chat, and the
demo has first call on the PC — check the PC's load before any heavy run (full gates, parallel walkers), one
heavy run at a time, and pause at the next clean point if he says the demo is slow or he is recording.
`main` was merged in on resuming (D78).

**`main` is merged in (D78, done 23 Sep 26 on resuming)** — both sides' rows kept; this branch's
notebook entries renumbered #211–#213 past main's #199–#210.
**Pick that branch in the new-chat picker.** Read `raptor-port/docs/handpass/2026-09-23-tracker.md`
§0 FIRST — its **Progress** line says exactly where the work is. **State at the end of the resumed
session: the bug check is DONE and waiting on HIM** — every finding fixed red-first and walked; the two
blind reads done and every finding fixed (§11); the final gates green on the finished code (§10). What
is left: his five-minute look (§13 — his three questions there are ANSWERED, D130–D132, and built; on the branch's Vercel preview
`https://raptor-git-claude-tracker-human-retest-8d3411-kai-e2f5.vercel.app`), then his "merge live" (a PR is not open yet — open one when he says so; the PC runs its
checks then, D151: never push to it while they run). FULL tier. Ports: preview 4180, smoke 4181, e2e 4182. Rulings: **D120–D132**
(the charts' route to the database; one access for admin and member; imports never wipe typed
details; Last Flown; deleting a ball wipes its marks; resuming beside the demo; details per chart; a
backup remembers a deleted chart; a course restore door; logout asks; a deleted ball's typed details go
with it; a backup does not carry a deleted course; an import never deletes marks). Never run a full gate while
another chat's is running (D86) — and the demo has first call on the PC (D125).


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
