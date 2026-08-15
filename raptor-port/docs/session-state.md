# Session handoff — the publish/drafts clarity rework (15 Aug 26)

## Where it started
The owner opened with "I am a bit confused" about drafts vs publishing: a
viewer could not tell a scheduler's in-progress edits from the published
schedule, a stored draft's preview still wore "✓ Published", and he could not
switch to Draft 1 to publish it as AL1 without reopening the day. Four
decisions were taken by AskUserQuestion and are recorded in the shipped
contracts: viewers default to the ISSUED document, viewers may always open
the working copy (no scheduler-side gate), stored drafts are HIDDEN from
viewers after publish, and the ORIG/ALn vocabulary was KEPT (an
Approved/ALn-draft renaming was offered and declined).

## Shipped
- Publish/drafts clarity rework — PR #207, **merged**, deploy green and
  verified on the deployed page (publish → issued default → working toggle →
  draft switch on a published day → AL1 → viewer follows, at 1500px and
  390×844, zero console/page/network errors).

## Unfinished
- none.

## Branch state
- Designated branch: `claude/read-handoff-cfotiy`
- Its PR (#207) is **merged**.
- The next session MUST reset before starting new work, or it stacks commits
  onto already-merged history:
  `git fetch origin main && git checkout -B claude/read-handoff-cfotiy origin/main`

## Gates
- `npm test` 1616 across 99 files · `npm run build` clean ·
  `node reference/tfin.js` 728/0 · `npm run test:e2e` 96/96 — all green,
  run first-hand on the merged tree.
- `npm run probes:adapted` 6/6 · `npm run perf` 4/4 — green. Week DOM 3702
  under the unmoved 4000 ceiling, board 855 under the unmoved 960; both
  MEASURES unmoved too, because every control this session added renders
  only on a published day and the seed has none.
- Run all from `raptor-port/`, not the repo root; a fresh container needs
  `npm ci` first, and `probes:adapted`/`perf` need
  `npx vite preview --port 4173` already serving.

## Open questions
- **Reword the "Restore this version" button?** Asked by the owner at the
  very end of the session ("What does restore this version to original
  mean") and NOT yet answered by him. It was explained, and this was
  offered and not built: "Restore" DISCARDS the day's unpublished edits and
  returns to the issued copy, while the newly-allowed draft switch KEEPS the
  differences and marks them for the next AL — two opposite outcomes whose
  button labels do not say which is which. Proposed wording was
  "Make this the live schedule — discards unpublished edits" for the button
  plus a matching banner line (`html.ts`'s `pvBar`, and the board mirror in
  `SchedBoard.tsx`). Do not build it unasked — `CLAUDE.md` §Product bar.
- The plan file that drove the session
  (`/root/.claude/plans/i-am-abit-confused-memoized-comet.md`) does NOT
  survive the container. Nothing is lost: every decision in it shipped and
  is recorded in `docs/engine-rules.md` §Drafts, `docs/ui-contracts.md`
  §the view-only week's picker, and `HANDOFF.md`.

## Pick up here
Nothing is in flight. If the owner answers the Restore-button question
above, that is a small `html.ts`/`SchedBoard.tsx` copy change plus its
`ui-contracts.md` line; otherwise start fresh from `HANDOFF.md`'s open-work
list.
