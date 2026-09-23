# HANDOFF — 23 Sep 26. `[ALL-AVAIL-WINDOW]` and `[DOCS-GUARD]` are LIVE on `main`. Next: the Leave War fix (D150), then `[HUMAN-RETEST]`.

## NEXT CHAT (owner, D150): the Leave War phone bug — only once `claude/lw-monthjump-phone` is MERGED

That branch (PR #428) carries the D87 test fixes and moves GitHub's checks onto his own PC (D89, a
self-hosted runner). After his "merge live", pick `main` and fix `[LW-MONTHJUMP-PHONE]` in `OUTSTANDING.md`:
on a phone a month button can land a day short (evidence and pictures:
`raptor-port/docs/handpass/2026-09-23-lw-monthjump.md`). Bug-check order, WALK tier. **Include `[LW-HBAR-RESYNC]`**,
the same grid's scrollbar item (his word, D150). He confirmed this goes ahead of `[HUMAN-RETEST]` (D85/D86).
**Then put the checks back on his PC:** delete the repo variable `CI_ON_GITHUB` (set to `true` on 23 Sep 26 only
because the phone test is red on his fast PC until that fix), push, and see the `all gates (your PC)` job go
green. Then walk him through making the runner a Windows service (GitHub: remove the runner, add it again,
answer **Y** to "run as service", Enter for the account). Never push while checks are running (D151).

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
