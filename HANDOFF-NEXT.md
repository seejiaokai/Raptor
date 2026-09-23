# HANDOFF — 23 Sep 26. `[ALL-AVAIL-WINDOW]` and `[DOCS-GUARD]` are LIVE on `main`. Next: `[HUMAN-RETEST]`.

## The Tracker `[HUMAN-RETEST]` — PAUSED (D155) on `claude/tracker-human-retest-8d3411` (not merged)

**Paused by the owner, 23 Sep 26 (D155): the demo video comes first.** Resume from this section when
he says so — merge `main` in first, as below. (D155 itself is recorded on `main` by the Leave War chat;
this branch's copy was dropped so the merge brings in one row, not two.)

**FIRST, merge `main` into this branch (D78):** the Leave War's PR #428 merged at 16:56 (`87e9f0d6`;
rulings on main run to D154 — no clash with D120–D124). Its `playwright.config.ts` hunk is
byte-identical to this branch's, so no conflict there; expect conflicts only in `DECISIONS.md`,
`OUTSTANDING.md` and this file — keep BOTH sides' rows. Hold any full gate run until
`gh run list --branch main --limit 1` shows main's own run completed.
**Pick that branch in the new-chat picker.** Read `raptor-port/docs/handpass/2026-09-23-tracker.md`
§0 FIRST — it says what is done, what the three walkers found, and exactly what is next (rebuild,
re-walk the fixes, fix the "still to fix" lists and D122–D124, full gates, the two code reads, his
look). FULL tier. Ports: preview 4180, smoke 4181, e2e 4182 (`E2E_PORT` now works). Rulings this
chat: **D120–D124** (the charts' route to the database; one access for admin and member; imports
never wipe typed details; Last Flown; deleting a ball wipes its marks). Never run a full gate while
another chat's is running (D86) — the Leave War chat messages before its PC runs.

**Pick `main` in the new-chat picker.** `claude/docs-guard` is merged — don't pick it.

## What went live

The counter's movable window of pucks (D38–D41), bug-checked at FULL tier — the record is
`raptor-port/docs/handpass/2026-09-23-allavail-window.md`. He looked on Vercel, then said "merge
live". It went to `main` AFTER the skill review (#427), with `main` merged in first and every gate
re-run on the combined tree: `npm test` 5760/5760 · build OK · `tfin.js` 728/0 · rulecheck OK ·
`test:e2e` 461 passed / 0 failed · `smoke:tracker` 425/0 · `perf` 4/0 · `docsize` red on the same
three files as `main` (`[DOC-TRIM]`). No app code changed in the merge, so the walk stands.

Also rode along: `.impeccable/config.json` (D71's held-back design-checker skip list; note #43
actioned).

## Then `[DOCS-GUARD]` went live — what it changes for every session

`npm run docsize` now fails a lost, doubled or cut-short backlog item, a lost or doubled D-number, a
ruling home that does not exist, and a rule-map id with no register entry. It runs at the end of
every turn (a Stop hook) and on every PR and push to `main` (`docs-guard.yml`), and it never asks
for a trim inside a code change. **Move a finished item ONLY with
`node raptor-port/scripts/backlog-archive.mjs <ID> --homes <file>`.** Closing reports carry its
`Docs:` and `docsize:` lines (bug-check order §9). Details: `raptor-port/docs/doc-budget.md` §4.

## Rulings this session

**D77** — leave the phone resize corner: on a phone the window moves but does not resize. Recorded
in `DECISIONS.md`, the window's section of `raptor-port/docs/ui-contracts.md`, and `OUTSTANDING.md`.
**D85 + D86** — `[HUMAN-RETEST]` starts with the Tracker, and the amendment system runs beside it in
parallel. Recorded in `DECISIONS.md` and `OUTSTANDING.md` [HUMAN-RETEST].
**D78–D84** (the docs guard's chat) — parallel chats merge one at a time and the later one renumbers
(D78); four older rulings given numbers (D79–D82); step 4 done early (D83); a Leave War desktop
timeout on GitHub gets ONE re-run of the failed group, not an investigation (D84).

## Next: `[HUMAN-RETEST]`, two chats in parallel (D85, D86)

One chat re-tests **the amendment system** (port 4173, rulings from
D90), another in its own worktree re-tests **the Tracker** (port 4180, rulings from D120). Never
two full gate runs at once. Whichever merges second brings `main` in first.

## Queue after this

`[HUMAN-RETEST]`, `[DOC-TRIM]`, `[DB-STEP]`. Filed from the window,
none blocking: `[OIL-PERSONAL-PLACEHOLDER]`, `[CROWD-SIM-BRIEF]`, `[LW-MONTHJUMP-PHONE]`.
