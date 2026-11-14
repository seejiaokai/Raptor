# Two small Quals fixes — the second fix round's brief (11 Nov 26, chat 64, job 3)

For the builder of `c242ba658`. A fresh Opus reader read your fix round alone (`git diff 7765901d1 c242ba658`); its
report is beside this file, `2026-11-11-quals-small-read-narrow1.md` — read it whole first. It found F1 and F2 right
and complete, F3 incomplete, and left three suspicions it could not turn into a case. Same rules as before: red first,
each claim SEEN failing before any fix (keep each red line for your hand-back); never weaken an assertion; commits on
the branch, no push; no edits to `HANDOFF.md`, `OUTSTANDING.md` or anything under `.claude/`; leave the untracked
picture folders alone and never `git add` that folder whole.

## The items

**G1 — a redraw that changes the column widths still wipes the picked-up look (the reader's finding 1).** On a
desktop wider than the table's least width the columns share out the extra, so a change of the window's width
mid-drag re-measures them, the pinned copy's markup reads differently and is set again: the pressed pinned heading
loses its picked-up look and the landing mark is gone until the next move. Reproduce as the reader says — your test
"the page drawn again during a drag begun on a pinned heading…" copied, opened at 2400×900 (first assert the table is
narrower than its wrap, else skip), mid-drag `page.setViewportSize({ width: 2100, height: 900 })`, wait, move 1px,
then the same look asserted (held, one landing mark, one lift frame). Fix by the reader's steps 1–3 (the drag puts its
look back on the pinned copy whenever that copy's markup is set again; cleared on the effect's cleanup), or a smaller
change that passes the same test. Check the same redraw during a drag begun on the table's OWN heading while the
pinned row shows.

**G2 — the one-frame wait's two races (the reader's first suspicion).** Try each as a unit test; fix only what fails.
(a) The ask's row is drawn by an edit of the filter box, then hidden again by a second edit before the waiting frame
runs, then drawn again later: expected — he is outlined and the page makes its ONE trip then; the suspicion is that
the ask was already marked spent, so the trip is lost. The reader's guard: when the waiting trip finds no row and the
ask is still this one, the ask is not spent. (b) A newer ask arrives inside the waiting frame and trips at once:
expected — the older waiting trip does nothing (it must check it is still the current ask, or be cancelled). Also:
the waiting frame is cancelled when the page is left.

**G3 — a press by another kind of pointer during a finger's drag (the reader's third suspicion; a touch-screen
laptop).** A finger's drag live on a heading, then a mouse press on another heading: expected — the live drag is
cancelled cleanly (no lift frame, no landing mark, no picked-up look left, nothing written) and the press starts
nothing; the suspicion is that the press silently takes the drag over without cancelling the first. Unit test, both
heading rows; fix only if it fails; otherwise keep it as a passing guard.

## Checks before you hand back (this round is small — GitHub's run of the pull request is its full check)
`src/ui/quals.test.tsx` alone; `npx tsc -b`; `npm run lint:changed`; then, under the checks lock (from `raptor-port`:
`node scripts/gatelock.mjs exec "claude/quals-small-1111 — fix round 2" -- <command>`), the build and
`e2e/geometry.spec.ts`. Leave `dist` built from your last commit.

## Hand back (final message, under 250 words)
G1, G2a, G2b, G3: reproduced or not, with the red line; the fix in a sentence; the tests' titles. The commits. The
counts. Any existing assertion changed and why.
