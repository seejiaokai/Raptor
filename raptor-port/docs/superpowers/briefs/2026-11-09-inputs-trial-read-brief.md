# The Inputs page in the trial's shape — the blind read's brief (9 Nov 26, chat 41, D1943)

Sent word for word to Astra (`codex exec -m gpt-6-astra`, reasoning high, read-only) and to a fresh, blind Opus reader.
You are one of two readers, blind to each other. READ ONLY: change no file, run no command that writes, commit nothing.

## What changed
Under the owner's rulings D1941 and D1943 (full rows: `grep -h '^| D1943 |' .claude/decisions-full/*.md`; also D1939,
D1941, D1942), the Inputs pages' rulings file `.claude/rules/decisions/inputs.md` went from a one-line-per-ruling list
(165 rulings) to a page in the Tracker trial's shape: his standing rules, what he likes, and what a fresh model would get
wrong if not told. Rulings judged "built" left for one line, "Built, held by tests: D…", which the document check
accepts only where a test file names each number; those whose tests hold only part stay written out.

- The list before: `git show b87243496:.claude/rules/decisions/inputs.md` (set `MSYS_NO_PATHCONV=1` first in Git Bash).
- The page now: `.claude/rules/decisions/inputs.md` at commit `34176a2ec` (`git show 34176a2ec:<path>`, or the file as
  checked out).
- The helper's sorting table — each ruling's kind and the test said to hold it:
  `raptor-port/docs/superpowers/briefs/2026-11-09-inputs-trial-sorting.md`.
- Each ruling's full row — his words (column 3), what it means (column 4: the first bold sentence is his rule; parts
  marked "the agent's reading" are not), where it lives: `.claude/decisions-full/inputs.md` (`grep -h '^| D569 |'`).
- Tests: `*.test.ts(x)` and `*.spec.ts(x)` under `raptor-port/src` and `raptor-port/e2e`.
- The same diff also changes one map line each in `DECISIONS.md`, `AGENTS.md`, `raptor-port/CLAUDE.md` (and perhaps
  the full-text file's head), and the size rows in `raptor-port/scripts/docsize.mjs`: `git diff b87243496 34176a2ec`.

## The four questions — answer each, with evidence
1. **A standing rule or like lost.** For every ruling the list stated, and the page does not state now: is it really
   built detail that a test holds whole, or did a standing rule, a preference of his, a "leave it / don't reopen", a
   condition, a scope or an exception go with it, which a fresh model would get wrong untold? Check every line still on
   the page against the short lines and full rows it cites: did a merge or a rewrite change what it means, widen or
   narrow its scope, or drop a condition or exception? Every number of the old "Also read" paragraph still cited?
2. **A reading stated as his.** Does any line now state, as his rule, something that is only the agent's reading in the
   full row (marked so, or not in his words or the bold rule sentence)?
3. **A built ruling its test does not hold whole.** For each number on the "Built, held by tests" line, open the tests
   that name it: does an assertion fail if each part of the rule goes — every condition, exception, exclusion ("not X",
   "never Y"), scope, and any words on screen he chose? A number only in a comment or a title, or a test holding only
   part, is a finding: name the part left unheld. (On the Tracker's trial, 20 of 39 failed this.)
4. **The map lines and the two other pages.** Does each changed line in `DECISIONS.md`, `AGENTS.md`,
   `raptor-port/CLAUDE.md` and the full-text file's head say only that Inputs is now a page, without changing, dropping
   or contradicting anything else those files say? Two other pages changed only to carry citations the page shape now
   requires: `.claude/rules/decisions/design.md` (one number added) and `.claude/rules/decisions/how-we-work.md` (four
   numbers added to the batch-order line; 12 wrapped lines of its "Models and readers" section joined onto their
   bullets to make room). Confirm no word changed there except the added numbers (`git diff -w --word-diff`).

## Not findings
- Anything about data already stored (the store is demo data, cleared before the database step — D56).
- The size, the shape of the sections, wording style; the gate scripts themselves.
- Rulings proposed for archive: they are put to him, not archived.

## The report
A list of findings, most serious first, each: the ruling number, the question (1–4), the concrete case (what a fresh
model or a change would get wrong, or the behaviour a test misses), the evidence (the line, the row's words, the test
and its assertion), and the fix (which words go back on the page, or which assertion a test would need). Then:
"rulings checked: N". If none, say so plainly.
