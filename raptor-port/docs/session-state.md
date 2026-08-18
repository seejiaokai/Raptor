# Session handoff — Leave War: remarks/roster/Duty/counter-sheet/manning (#248) and post-out + event rows (#249)

## Where it started
A run of owner asks over Leave War and Inputs, delivered across a long
back-and-forth on the phone: date-tail remarks, roster order, a Duty input,
the counter-sheet dismiss bug, FL P/WM P manning rows, rearrange/hide the
count rows, post-out (PO), and admin-addable event rows.

## Shipped
- Date-tail remarks (till/on), remarks-only-edit stays synced, in-place date
  token, roster hierarchy (FI→IR→IP→IW→A–D→OCU), Duty input, counter-sheet
  `dvh` dismiss fix, counter tap-hint, FL P/WM P rows, admin rearrange/hide of
  the count rows — PR #248, MERGED, **deploy green and confirmed live**
  (drove the deployed page: tap-hint, FL P/WM P, Duty all present, no errors).
- Post-out (PO) placement/undo, and admin-addable event rows (2–6) — PR #249,
  MERGED (~12:00Z), **deploy PENDING** — at handoff the deployed page did NOT
  yet serve #249 (the Rearrange `event-add` button and `bid-postout` were
  absent), so Pages had not rolled over yet.

## Unfinished
- Confirm #249 actually served on https://seejiaokai.github.io/Raptor/ .
  A self-bound check-in is scheduled for 2026-08-18T13:05Z to drive the
  deployed page and, once live, send ONE PushNotification that the whole batch
  is live; it re-checks if Pages has not rolled over. If this ran instead in a
  FRESH session: just drive the deployed page (Chromium proxy recipe in
  `raptor-port/CLAUDE.md` §Build & verify), log in a/a, open Leave War, click
  `roster-arrange` and confirm `event-add` is present, and tap
  `cell-slipway-2026-06-15` to confirm `bid-postout` — then tell the owner it
  is live. Pages normally rolls over 2–10 min after merge, so it is almost
  certainly live by the time this is read.

## Branch state
- Designated branch: `claude/read-handoff-docs-3fnp29`
- Its PRs #248 and #249 are BOTH MERGED.
- The next session MUST reset before new work, or it stacks onto merged
  history:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3fnp29 origin/main`

## Gates
- `npm test` 2533 / 139 files · `npm run build` clean ·
  `node reference/tfin.js` 728/0 · `npm run test:e2e` 272 passed / 6 skips —
  all GREEN this session (on the #249 tree).
- `npm run probes:adapted` 6/6 · `npm run perf` 4/4 (week 3743, board 844 —
  both ceilings unmoved). GREEN. Run all from `raptor-port/`; a fresh
  container needs `npm ci` first, and start `npx vite preview --port 4173`
  before probes/perf.

## Open questions
- none.

## Pick up here
Confirm #249 is live on the deployed page (see Unfinished) and send the
owner the one live note; then delete this file in that same commit.
