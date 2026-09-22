# Session handoff — the FULL-tier walk of [OIL-SEATS-CAN-EARN]

## Where it started

All eleven steps of `[OIL-SEATS-CAN-EARN]` were built and every gate green; the
walk was the only thing left. The owner asked for the FULL-tier walk in the order
the standing order gives, with his open questions put to him rather than decided.
Mid-session he asked for it to be fanned out across parallel workers, which it
was — four blocks plus the money block.

## Shipped

- Nothing. **No PR is open and nothing is merged.** All work is committed on
  `claude/oil-seats-can-earn` and NOT pushed to a PR, because five defects the
  walk found are still open and the two code reads have not run.

## Unfinished

- **Five defects, listed in full in
  `docs/superpowers/specs/2026-09-22-oil-seats-build-handoff.md` §THE FIVE OPEN
  DEFECTS.** Short form: the wrong-flying-times mark is not on the line and its
  warning is not tappable; a full sim row has no door for another body (D50 says
  build one); a published day with a placeholder crowd reopens as "1 pending"
  after a reload with its signatures cleared; the count chip includes a man who
  has posted out while the money correctly excludes him; and on a phone on the
  edit week the count chip cannot be tapped — the press lands in the remarks box.
- **Two test gaps**, same file: the Common Programme's crowd opening has no test
  at all (breaking it leaves 3,301 unit tests green), and the signature key's
  content is unwatched (the exact D45 regression left 1,914 green).
- **`npm run perf` was not run on this branch.** The other six gates were, all
  green. This change touches the board's DOM, so perf is worth a run before the
  code reads.
- **The walk's own evidence sheet is not finished** — `docs/handpass/2026-09-22-oil-seats.md`
  §8–10 (gates, what was not walked, the `Walk:` line) are stubs to fill at close.

## Branch state

- Designated branch: `claude/oil-seats-can-earn`
- Its PR is **none** — nothing opened this session.
- Not merged, so **no reset is needed**; the next session continues on the branch
  as it stands.

## Gates

- `npm test` **5629 / 5629** across 352 files · `npm run build` clean ·
  `node reference/tfin.js` **728 / 0** · `npm run rulecheck` OK ·
  `npm run test:e2e` **447 passed, 45 skipped, 0 failed** ·
  `npm run smoke:tracker` **425 / 0**. All watched on this tree after the fixes.
- `npm run probes:adapted` · `npm run perf` — **not run.** Perf is the one that
  matters here (board DOM), and it is an Unfinished item above, not a footnote.
- Run all from `raptor-port/`. **Never run the unit gate alongside the browser
  gates** — this machine has 16 GB and the test workers peak near 11 GB, which is
  what makes the jsdom timing tests flake.

## Open questions

- **None blocking.** The owner answered every question put to him tonight:
  D50 (sim spare seat), D51 (two across, pilots left — which turned out to be
  D38–D41's already-approved design and belongs to job 2, not this one), D52
  (ground crew: leave all three behaviours as they are), D53 (read the record
  before asking him anything).
- Standing, already in `OUTSTANDING.md` and named here only as a pointer:
  `[ALL-AVAIL-WINDOW]` is job 2 and **replaces the in-row crowd this job draws**.
  Do not spend effort on that surface's phone layout here.

## Pick up here

Read `docs/superpowers/specs/2026-09-22-oil-seats-build-handoff.md` first, then
`DECISIONS.md` **whole** and `OUTSTANDING.md`, then fix the five defects — each
with a test that is red before the fix — and re-walk only what the fixes touch
using the committed `scripts/handpass/seat-*.mjs`.
