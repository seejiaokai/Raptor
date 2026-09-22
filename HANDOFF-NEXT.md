# HANDOFF — 23 Sep 26 (night). `[ALL-AVAIL-WINDOW]` is BUG-CHECKED at FULL tier. Waiting on his look and "merge live".

**Pick the branch `claude/all-avail-window` in the new-chat picker. NOT `main`** — `main` does not
have the window. The branch is pushed; no PR is open (D60: a branch push needs no permission, `main`
needs his "merge live").

## Other branches in flight — read before you merge

Two more chats run in their own worktrees, branched from `main`: **`claude/skill-review`** (the
skill-observation review) and **`claude/docs-guard`** (D30's docs guard). None merges into another;
**each goes to `main` on his "merge live", ONE AT A TIME**, and whichever goes later brings `main` in
first:

1. `git fetch origin && git merge origin/main` on this branch.
2. **`.claude/skill-observations/log.md` will conflict** — keep the REVIEWED version and re-append this
   branch's entries (#179–#184) at the end with fresh numbers (task-observer numbering discipline).
3. `DECISIONS.md`, `HANDOFF-NEXT.md`, `OUTSTANDING.md` may conflict: keep BOTH sides (newest first);
   **renumber a clashing D-number** (this branch holds D65–D69).
4. Re-run the full gates on the merged tree, THEN merge.

## Where it stands

Built to the approved mock (D38–D41), then bug-checked by `raptor-port/docs/bug-check-order.md`:
Fable's scenario design (S1–S15 + five more) — all fixed, ruled or filed; the walk on the real bundle
(four passes, both widths, 17 pictures, no console errors); the two final reads, Fable 5.1 and Astra,
blind to each other — both found the same serious one (a request row's window read today's request
on the issued schedule), all reconciled and fixed; every fix red first; re-walked.
**The evidence sheet is the record: `raptor-port/docs/handpass/2026-09-23-allavail-window.md`.**

## Gates on the final commit

`npm test` 5760/5760 · build OK · `tfin.js` 728/0 · rulecheck OK · `test:e2e` 461 passed / 0 failed
· `smoke:tracker` 425/0 · `perf` 4/0 · `docsize` fails on the same three files as before (`[DOC-TRIM]`).

## Open for HIM

1. **His look** — five minutes, on the Vercel link (the "look here" card is in the closing report).
2. **A question:** on a phone the window MOVES but cannot be RESIZED (CSS resize has no touch handle).
   D38 asked for "resizable". A drag-handle corner can be built; or leave it. His call.
3. **`[LW-MONTHJUMP-PHONE]`** — a Leave War phone browser test fails when the machine is busy, on
   `main` too; it passed in the final full run. Filed to make robust. Not the window's.

## Filed from this bug check (in `OUTSTANDING.md`)

`[OIL-PERSONAL-PLACEHOLDER]` (a placeholder on a landed Personal request row draws no count —
pre-existing), `[CROWD-SIM-BRIEF]` (the D38 flag covers flight briefs, not sim ones),
`[LW-MONTHJUMP-PHONE]`.

## Rulings this session

**D68** — never skip or shrink a read to save context; write state into the repo instead. **D69** —
condense what a long session wrote, at the end, in its own docs-only commit. D67 stands as recorded
(no correction from him).

## Pick up here

His look → his "merge live" (follow the one-at-a-time steps above). Next in the queue after it:
`[DOCS-GUARD]` (in flight in its own chat), then `[HUMAN-RETEST]`, `[DOC-TRIM]`, `[DB-STEP]`.
