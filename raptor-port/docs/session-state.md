# Session handoff — mobile-polish batch shipped live; two local-only gates left red

## Where it started
Continuation session on the held batch (branch `claude/sc-brief-time-warnings-g7swy2`,
PR #327). This session added four phone refinements the owner asked for one at a
time — the day-details Close button pinned below a scrolling issues list, the
mobile day-header controls compressed to two rows, the expanded highlight chips
made a sideways scroller, and the wave/duty template-editor moved to a top-right
pencil — then the owner said merge, and it shipped.

## Shipped
- The whole batch — PR #327, squash-merged to `main` (`14f1545`), Pages deploy
  green, live page verified at https://seejiaokai.github.io/Raptor/ (highlighter
  chips scroll sideways with the page not widening; wave & duty menus show the
  top-right pencil and no bottom link; build hash `index-Dc6xPoEP`). PR is not
  under watch.

## Unfinished
- **`npm run perf` is RED (3/4): board DOM 1038 nodes > recorded ceiling 960.**
  INHERITED from PR #323's "available crew on board" strip (~78 nodes); this
  batch is board-node-neutral (1038 unchanged). Timings all held (board per-node
  0.57×), week DOM 4947 ≤ 5450 ok, both behavioural checks held. OWNER-RESERVED
  per the prior handoff: raise the `960` board assert in `probes/perf-port.cjs`
  to ~1100 (~10% headroom, matching the week's 5450/4947) AND record the raise in
  `docs/probe-sweep.md` — UNLESS the owner's review of "available crew on board"
  says trim that strip instead. Do not raise it unasked.
- **`npm run probes:adapted` is RED (5/6): `sa-async` "phone · opened, it scrolls
  itself rather than the page" wants the `#page-viewsched .filters` element to
  side-scroll, got no scroll.** The assertion encodes the PRE-26-Aug design where
  the whole phone filter strip was one sideways scroller. This session's earlier
  commit changed that (icons on row 1, chips drop to their own row 2), and the
  highlight commit made the CHIP ROW (`.hlrow`) the scroller, not `.filters`. The
  live behaviour is correct and owner-verified (page never side-scrolls; the
  expanded chip row scrolls itself — pinned green in `e2e/geometry.spec.ts` "the
  expanded highlight chips scroll sideways"). The probe is stale, not the code.
  Fix: in `probes/adapted/sa-async.cjs` phone step (~line 198-211), open a group
  (e.g. click the Quals `.hl-gtab`) and assert `#page-viewsched .filters.hl-open
  .hlrow` self-scrolls (`scrollWidth > clientWidth`), keeping the two
  page-no-sideways-swipe asserts. Do NOT just delete the assertion.
- Both are LOCAL-ONLY gates (not in CI, `deploy.yml` runs unit+geometry only),
  which is why the batch merged and deployed green despite them. The batch shipped
  without `probes:adapted`/`perf` being run; this handoff ran them.

## Branch state
- Designated branch: `claude/sc-brief-time-warnings-g7swy2`.
- Its PR (#327) is MERGED. This handoff rides a fresh reset of the branch off
  `origin/main`. Next session must reset again before new work:
  `git fetch origin main && git checkout -B claude/sc-brief-time-warnings-g7swy2 origin/main`

## Gates
- `npm test` 3119 / 182 files · `node reference/tfin.js` 728/0 ·
  `npm run build` clean · `npm run test:e2e` 321 passed / 12 skips — all GREEN
  this session and in CI on the merge to `main`.
- `npm run probes:adapted` 5/6 — `sa-async` phone self-scroll RED (see
  Unfinished). `npm run perf` 3/4 — board DOM ceiling RED (see Unfinished).
  Run from `raptor-port/`; a fresh container needs `npm ci`, and both serve
  themselves against a `vite preview` on :4173 (start one first).

## Open questions
- none

## Pick up here
Update `probes/adapted/sa-async.cjs` to the new filter-bar design so
`probes:adapted` goes green, then take the board DOM ceiling to the owner (raise
`perf-port.cjs` 960 → ~1100 + note in `docs/probe-sweep.md`, or trim the "available
crew on board" strip). Both need a gated PR (they touch non-`.md` files).
