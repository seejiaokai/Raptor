# The scheduler's page — the blind read's brief (9 Nov 26, chat 42, D1944)

Sent word for word to Astra (`codex exec -m gpt-6-astra`, reasoning high, read-only) and to a fresh, blind Opus reader.
You are one of two readers, blind to each other. READ ONLY: change no file, run no command that writes, commit nothing.
Work in `C:\Users\User\projects\Raptor`, branch `claude/rules-diet-scheduler-page`.

## What changed
Under the owner's rulings D1941 and D1944 (full rows: `grep -h '^| D1944 |' .claude/decisions-full/*.md`; also D1939,
D1941, D1942, D1943), the scheduler's rulings file `.claude/rules/decisions/scheduler.md` went from a one-line-per-ruling
list (334 rulings, a head with an "Also read" paragraph, and about 30 settled entries from before the D-numbers, 120,888
bytes) to a page in the Tracker and Inputs trials' shape: his standing rules, what he likes, and what a fresh model would
get wrong if not told, by screen inside one page. Rulings judged "built" left for one line, "Built, held by tests: D…",
which the document check accepts only where a test file names each number; those whose tests hold only part stay
written out. Some settled entries' built detail moved whole into a reference document, leaving a pointer.

- The list before: `git show 5d8ddf6f8:.claude/rules/decisions/scheduler.md` (set `MSYS_NO_PATHCONV=1` first in Git Bash).
- The page now: `.claude/rules/decisions/scheduler.md` at commit `PAGE_COMMIT` (the file as checked out).
- The four sorting tables — each ruling's kind and the test said to hold it:
  `raptor-port/docs/superpowers/briefs/2026-11-09-scheduler-page-sort-{A,B,C,D}.md`; the drafter's brief, beside them.
- Each ruling's full row — his words (column 3), what it means (column 4: the first bold sentence is his rule; parts
  marked "the agent's reading" are not), where it lives: `.claude/decisions-full/scheduler.md` (`grep -h '^| D569 |'`).
- Tests: `*.test.ts(x)` and `*.spec.ts(x)` under `raptor-port/src` and `raptor-port/e2e`.
- The whole change: `git diff 5d8ddf6f8 PAGE_COMMIT` — beside the page: other pages given the numbers of later rulings
  (`.claude/rules/decisions/design.md`, `inputs.md`, `oil.md`, `people-accounts.md`), the map lines (`DECISIONS.md`,
  `AGENTS.md`, `raptor-port/CLAUDE.md`, the full-text file's head), the size rows in `raptor-port/scripts/docsize.mjs`,
  and any text moved into `raptor-port/docs/`.

## The six questions — answer each, with evidence
1. **A standing rule or like lost.** For every ruling the list stated and the page does not state now: is it really
   built detail that a test holds whole, or did a standing rule, a preference of his, a "leave it / don't reopen", a
   condition, a scope or an exception go with it, which a fresh model would get wrong untold? Check every line on the page
   against the short lines and full rows it cites: did a merge or a rewrite change what it means, widen or narrow its
   scope (to the phone, to one screen width, to one screen, to one role), or drop a condition or exception? A permission
   widened by a later ruling kept wide? Every number of the old "Also read" paragraph still cited? Every settled entry
   still stated, or its detail findable where the pointer says? The rules filed here that govern every screen (the
   phone, its keys, passing notes) stated as app-wide?
2. **A reading stated as his.** Does any line now state, as his rule, something that is only the agent's reading in the
   full row (marked so, or not in his words or the bold rule sentence)? Where the page states a later ruling as having
   changed an earlier one whose full row carries no such mark, is the later ruling's own text clear that it does?
3. **A built ruling its test does not hold whole.** For each number on the "Built, held by tests" line, open the tests
   that name it: does an assertion fail if each part of the rule goes — every condition, exception, exclusion ("not X",
   "never Y"), scope, and any words on screen he chose? A number only in a comment or a title, or a test holding only
   part, is a finding: name the part left unheld. (On the Tracker's trial, 20 of 39 failed this; on the Inputs', 6 of 17.)
4. **The moved text.** Each block moved into `raptor-port/docs/` — moved byte for byte (`node raptor-port/scripts/docsize.mjs
   --moves` lists what left and did not arrive), its pointer landing, nothing lost? Do the many documents and code comments
   that point to "§Settled before this list" (and to the old group names) still land on this page?
5. **The other pages and the map lines.** On `design.md`, `inputs.md`, `oil.md` and `people-accounts.md`, confirm no word
   changed except added ruling numbers and lines joined (`git diff -w --word-diff 5d8ddf6f8 PAGE_COMMIT -- <file>`). Does
   each map line say only that the scheduler is now a page, changing or contradicting nothing else those files say?
6. **The reworded line on the general rulings page.** Commit `5d8ddf6f8` rewrote one line of
   `.claude/rules/decisions/how-we-work.md` §Records (`git diff af3a6c12c 5d8ddf6f8 -- .claude/rules/decisions/how-we-work.md`)
   to cite D1944. Does it keep everything D611, D802 and D976 still require (their full rows in
   `.claude/decisions-full/how-we-work.md`), and does D1944's own short line in the scheduler's full rows state D1944's
   rule without an agent's reading?

## Not findings
- Anything about data already stored (the store is demo data, cleared before the database step — D56).
- The size, the shape of the sections, wording style; the gate scripts themselves.
- Rulings proposed for archive: they are put to him, not archived.
- The two open questions already listed for him (D660 against D762; D511 against D1026 and D1034), unless the page
  decides either.

## The report
A list of findings, most serious first, each: the ruling number, the question (1–6), the concrete case (what a fresh
model or a change would get wrong, or the behaviour a test misses), the evidence (the line, the row's words, the test
and its assertion), and the fix (which words go back on the page, or which assertion a test would need). Then:
"rulings checked: N". If none, say so plainly.
