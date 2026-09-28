# Final code read brief — the rulings slim-down's two scripts (D390, 28 Sep 26)

You are an independent reviewer; you did not write this code. **Read-only: change no file.** These scripts guard every
record of the owner's rulings, so they get a read by both providers.

## Read (live files, from the repo root)
- The plan, as revised after both red teams: `raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md`
  (§2.1–§2.5 are what the code must do; §6 is the red teams' findings and where each went).
- `raptor-port/scripts/docsize-rulings.mjs` (new: the one reader of a ruling's shape, shared by both scripts).
- `raptor-port/scripts/backlog-archive.mjs` — the `--rulings` block (converter, `--short-text`, `--move-rows`,
  `--merge`); the rest of the file is older and only context.
- `raptor-port/scripts/docsize.mjs` — `rulingRows` / `identityRows`, `homes`, `rulings`, the ceilings and `RULING_BYTES`,
  `--marks`. Compare with `main` (`git diff main -- raptor-port/scripts/` if your tools allow).
- `raptor-port/scripts/docsize-selftest.mjs` — what is tested, including real `git merge` fixtures in both orders.
- The result on real data: `.claude/rules/decisions/*.md` (short lines) and `.claude/decisions-full/*.md` (full rows);
  `DECISIONS.md` (the map, steps 1–3); the Stop hook `.claude/hooks/backlog-guard.sh`.

## Attack
1. **A lost or doubled ruling the gate passes.** Any sequence of edits, commits or a merge that loses a full row,
   doubles one, leaves a short line lying about its full row, or leaves a marked row live — and passes `docsize.mjs`.
   Check the base and commits-since reads, fenced code blocks, CRLF files, a row holding `\|`, a new area file.
2. **`--merge` giving a wrong result.** Walk the three real parallel-branch shapes (new rows only; a one-sided edit of an
   old row plus a spent-and-archived row plus "Also read" edits; an edit to the guide) in both merge orders, and the
   edge cases: a row the other side moved between areas; both sides new-layout; the other side created a new area file;
   a D-number clash; other conflicted files; MERGE_HEAD absent; a refused heading mid-merge (is anything half-written?).
3. **The converter** — idempotence; order of rows (newest first) after conversion and `--move-rows`; the put-back when
   the inventory fails (every file, including a newly created one); `--short-text` validation; the old-layout header
   rewrite; the archive heading.
4. **The Stop hook** — can a normal turn (recording a ruling the documented way) now fail or loop? Is every failure
   message actionable?
5. **Anything the self-test does not cover** that a future chat will realistically do.

Out of scope: the app; the wording of the short lines (a separate meaning read covers them); a problem living only in
data already stored (D56).

## Output
Numbered findings, most severe first: **severity** (BLOCKER / IMPORTANT / MINOR), **the concrete scenario** (exact
inputs → wrong outcome), and **an exact fix spec** a builder can follow (file, function, what to change). Then what you
checked and found sound. Plain text, no preamble.
