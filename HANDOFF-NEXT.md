# HANDOFF — 23 Sep 26. `[ALL-AVAIL-WINDOW]` is LIVE on `main`. Next: `[DOCS-GUARD]`.

**Pick `main` in the new-chat picker** — unless you are continuing the docs guard, which runs in its
own chat on **`claude/docs-guard`** (worktree `.claude/worktrees/ecstatic-mcnulty-c984d5`).

## What went live

The counter's movable window of pucks (D38–D41), bug-checked at FULL tier — the record is
`raptor-port/docs/handpass/2026-09-23-allavail-window.md`. He looked on Vercel, then said "merge
live". It went to `main` AFTER the skill review (#427), with `main` merged in first and every gate
re-run on the combined tree: `npm test` 5760/5760 · build OK · `tfin.js` 728/0 · rulecheck OK ·
`test:e2e` 461 passed / 0 failed · `smoke:tracker` 425/0 · `perf` 4/0 · `docsize` red on the same
three files as `main` (`[DOC-TRIM]`). No app code changed in the merge, so the walk stands.

Also rode along: `.impeccable/config.json` (D71's held-back design-checker skip list; note #43
actioned).

## When `claude/docs-guard` merges — it goes second, so it brings `main` in first

1. `git fetch origin && git merge origin/main` on that branch.
2. **`DECISIONS.md`:** `main` now holds D69–D73 (skill review) and **D77** (phone resize, this
   branch). The docs guard's D70–D76 CLASH with D70–D73 — renumber its rows to **D78 upward** and
   update their mentions in every file that quotes them.
3. **`.claude/skill-observations/log.md`:** keep `main`'s side (the reviewed notebook, highest note
   **#197**); re-append the docs guard's own new notes at the end, renumbered from #198.
   `MERGE-NOTE.md` is gone — both branches it covered are in.
4. Full gates on the merged tree, then his "merge live".

## Rulings this session

**D77** — leave the phone resize corner: on a phone the window moves but does not resize. Recorded
in `DECISIONS.md`, the window's section of `raptor-port/docs/ui-contracts.md`, and `OUTSTANDING.md`.

## Next: `[HUMAN-RETEST]`, two chats in parallel (D85, D86)

After the docs guard is live: one chat re-tests **the amendment system** (port 4173, rulings from
D90), another in its own worktree re-tests **the Tracker** (port 4180, rulings from D120). Never
two full gate runs at once. Whichever merges second brings `main` in first.

## Queue after this

`[DOCS-GUARD]` (in flight), then `[HUMAN-RETEST]`, `[DOC-TRIM]`, `[DB-STEP]`. Filed from the window,
none blocking: `[OIL-PERSONAL-PLACEHOLDER]`, `[CROWD-SIM-BRIEF]`, `[LW-MONTHJUMP-PHONE]`.
