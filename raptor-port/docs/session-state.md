# Session handoff — batch shipped live; board DOM perf ceiling now over

## Where it started
Continuation session. A held batch of UI changes sat on
`claude/sc-brief-time-warnings-g7swy2`. This session added the last two asks —
highlight group match ((CAT A or B) and SC-D: OR within a CAT/Type/Quals group,
AND across) and day-popover pucks that drag to rearrange / drop-to-swap — then
the owner said run the gates, merge live, and hand off.

## Shipped
- The whole batch — PR #323, squash-merged to main (`e1a43a7`), Pages deploy
  green, live page verified at https://seejiaokai.github.io/Raptor/ (highlight
  CAT/Type/Quals tabs; "SANS Avail" band + full-width Personnel band; puck
  `data-pkidx` and a real drag-swap 0↔2; no console errors, no 4xx). PR is not
  under watch (unsubscribed).

## Unfinished
- **`npm run perf` is red on one of its four asserts: board DOM 1038 nodes >
  recorded ceiling 960.** Cause is a deliberate feature in THIS batch —
  "available crew on board" put the availHTML strip (the one the week already
  carried) onto the board, ~78 nodes the old ceiling didn't budget for. Not a
  bug, not bundle behaviour: the live board is fine (adapted probes 6/6, no
  overflow/scroll), and perf is a LOCAL-only gate (not CI), which is why it
  never blocked the merge. Per CLAUDE.md §Performance, deliberate DOM growth
  "raises its ceiling as a deliberate, argued edit" — that raise was owed and
  missed. Fix: raise the `960` board assert in `probes/perf-port.cjs` to ~1100
  (~10% headroom, matching the week's 5450/4947) and record the raise in
  `docs/probe-sweep.md`. Left for the owner's return per his instruction, and
  because if his review of "available crew on board" says the board is too
  heavy, the answer is to trim that strip instead of lifting the ceiling.

## Branch state
- Designated branch: `claude/sc-brief-time-warnings-g7swy2`.
- Its PR (#323) is MERGED. This handoff rides a fresh reset of the branch off
  `origin/main`. Next session must reset again before new work:
  `git fetch origin main && git checkout -B claude/sc-brief-time-warnings-g7swy2 origin/main`

## Gates
- `npm test` 3063 / 177 files · `node reference/tfin.js` 728/0 ·
  `npm run build` clean · `npm run test:e2e` 318 passed / 12 skips — all GREEN
  this session and in CI on the merge to main.
- `npm run probes:adapted` 6/6 GREEN. `npm run perf` 3/4 — board DOM ceiling
  RED (see Unfinished). Run from `raptor-port/`; a fresh container needs
  `npm ci` first.

## Open questions
- none

## Pick up here
Raise the board DOM ceiling in `probes/perf-port.cjs` (960 → ~1100) and note it
in `docs/probe-sweep.md` so `npm run perf` goes green — unless the owner's
review of "available crew on board" says trim the board strip instead.
