# The Tracker trial — the blind read's brief (9 Nov 26, chat 36)

You are one of two readers, blind to each other. READ ONLY: change no file, run no command that writes, commit nothing.

## What changed
Under the owner's ruling D1941 (its full row: `grep -h '^| D1941 |' .claude/decisions-full/*.md`; also D1939 just below
it), the Tracker's rulings page `.claude/rules/decisions/tracker.md` was cut from 20,007 to 10,631 bytes. It now holds
only his standing rules, what he likes, and what a fresh model would get wrong if not told. 39 rulings judged "built" left
the page for one line, "Built, held by tests: D64, D121, …", which the document check accepts only where a test file
names each number.

- The page before: `git show 0593544d4:.claude/rules/decisions/tracker.md` (set `MSYS_NO_PATHCONV=1` first in Git Bash).
- The page now: `.claude/rules/decisions/tracker.md`.
- The helper's sorting table, each ruling's kind and the test said to pin it:
  `raptor-port/docs/superpowers/briefs/2026-11-09-tracker-trial-sorting.md`.
- Each ruling's full row, his words and the readings: `.claude/decisions-full/tracker.md` (search with `grep -h '^| D123 |'`).
- Tests: `*.test.ts(x)` and `*.spec.ts(x)` under `raptor-port/src` and `raptor-port/e2e`.

## The three questions — answer each, with evidence
1. **A standing rule or like lost.** For every ruling the page stated before, and does not state now: is it really built
   detail that a test pins, or did a standing rule, a preference of his, a "don't reopen", a condition or an exception go
   with it, which a fresh model would get wrong untold? Check, too, every line still on the page against its line before:
   did a rewrite change what it means, or drop a condition or exception?
2. **A reading stated as his.** Does any line now on the page state, as his rule, something that is only the agent's
   reading in the full row (marked "the agent's reading", or not in his words)?
3. **A built ruling its test does not pin.** For each number on the "Built, held by tests" line, open the test the table
   names: does an assertion fail if the behaviour the full row describes goes? A test that only mentions the number in a
   comment or a title, or pins only part of the ruling, is a finding — name the part left unpinned.

## Not findings
- Anything about data already stored (the store is demo data, cleared before the database step — D56).
- The size; the "From other areas" pointer lines (left as they were); wording style.
- The gate scripts themselves.

## The report
A list of findings, each: the ruling number, the question (1, 2 or 3), the concrete case (what a fresh model or a
change would get wrong, or the behaviour a test misses), the evidence (the line, the row's words, the test and its
assertion), and the fix (restore which words to the page, or which test assertion to add). Then: "rulings checked: N".
If none, say so plainly.
