# The Leave War's page — the blind read's brief (9 Nov 26, chat 45, D1947)

Sent word for word to Astra (`codex exec`, reasoning high, read-only) and to a fresh, blind Opus reader. You are one of
two readers, blind to each other. READ ONLY: change no file, run no command that writes, commit nothing. Work in
`C:\Users\User\projects\Raptor\.claude\worktrees\beautiful-merkle-20a6b2`, branch `claude/rules-diet-leave-war-page`.

## What changed
Under the owner's rulings D1941 and D1947 (full rows: `grep -h '^| D1947 |' .claude/decisions-full/*.md`; also D1939,
D1941, D1942, D1943, D1944), the Leave War's rulings file `.claude/rules/decisions/leave-war.md` went from a
one-line-per-ruling list (379 rulings, a head with an OIL paragraph and an "Also read" paragraph, and two groups of
settled entries from before the D-numbers, 121,825 bytes) to a page in the Tracker, Inputs and scheduler trials' shape:
his standing rules, what he likes, and what a fresh model would get wrong if not told, by topic inside one page. Rulings
judged "built" left for one line, "Built, held by tests: D…", which the document check accepts only where a test file
names each number; those whose tests hold only part stay written out. Some settled entries' built detail may have moved
whole into a reference document, leaving a pointer.

- The list before: `git show 0ce71adab:.claude/rules/decisions/leave-war.md` (set `MSYS_NO_PATHCONV=1` first in Git Bash).
- The page now: `.claude/rules/decisions/leave-war.md` at commit `694602fac` (the file as checked out).
- The four sorting tables — each ruling's kind and the test said to hold it:
  `raptor-port/docs/superpowers/briefs/2026-11-09-leave-war-page-sort-{A,B,C,D}.md`; the drafter's brief beside them.
- Each ruling's full row — his words (column 3), what it means (column 4: the first bold sentence is his rule; parts
  marked "the agent's reading" are not), where it lives: `.claude/decisions-full/leave-war.md` (`grep -h '^| D1225 |'`).
- Tests: `*.test.ts(x)` and `*.spec.ts(x)` under `raptor-port/src` (the Leave War's own under `raptor-port/src/leavewar/`)
  and `raptor-port/e2e`.
- The whole change: `git diff 0ce71adab 694602fac` — beside the page: other pages given the numbers of later rulings, and
  some of their words rewritten (`inputs.md`, `scheduler.md`, `people-accounts.md`; the IT flow guide's page
  `it-flow-guide.md` tightened under his D1948 — `git diff 0ce71adab 419b69bca -- .claude/rules/decisions/it-flow-guide.md`),
  the map lines (`DECISIONS.md`, `AGENTS.md`, `raptor-port/CLAUDE.md`, the full-text file's head), the size rows in
  `raptor-port/scripts/docsize.mjs`, and any text moved into `raptor-port/docs/`.
- **The OIL page (`.claude/rules/decisions/oil.md`) loads with every Leave War file.**

## The six questions — answer each, with evidence
1. **A standing rule or like lost.** For every ruling the list stated and the page does not state now: is it really
   built detail that a test holds whole, or did a standing rule, a preference of his, a "leave it / don't reopen", a
   condition, a scope or an exception go with it, which a fresh model would get wrong untold? Check every line on the page
   against the short lines and full rows it cites: did a merge or a rewrite change what it means, widen or narrow its
   scope (to the phone, to one screen width, to one window, to members or to admins), or drop a condition or exception?
   A permission widened by a later ruling kept wide? Every number of the old OIL and "Also read" paragraphs still cited?
   Every settled entry still stated, or its detail findable where the pointer says? The rules filed here that govern
   every screen stated as app-wide? Does any line contradict the OIL page?
2. **A reading stated as his.** Does any line now state, as his rule, something that is only the agent's reading in the
   full row (marked so, or not in his words or the bold rule sentence)? Where the page states a later ruling as having
   changed an earlier one whose full row carries no such mark (the drafter's report lists D1330 / D1332 over D1212,
   D331, D335; D1254 over D1227; D1316 over D1175; and others), is the later ruling's own text clear that it does?
3. **A built ruling its test does not hold whole.** For each number on the "Built, held by tests" line, open the tests
   that name it: does an assertion fail if each part of the rule goes — every condition, exception, exclusion ("not X",
   "never Y"), scope, and any words on screen he chose? A number only in a comment or a title, or a test holding only
   part, is a finding: name the part left unheld. (On the Tracker's trial, 20 of 39 failed this; the Inputs', 6 of 17;
   the scheduler's, 25 of 56.)
4. **The moved text.** Each block moved into `raptor-port/docs/` — moved byte for byte (`node raptor-port/scripts/docsize.mjs
   --moves` lists what left and did not arrive), its pointer landing, nothing lost? Do the documents and code comments
   that point to "§Settled before this list" (and to the old group names "Leave War roster & display", "Leave War grid
   performance") still land on this page?
5. **The other pages and the map lines.** On `inputs.md`, `scheduler.md` and `people-accounts.md`, confirm each change
   is only added ruling numbers or the words those later rulings made wrong — and that each added number does change the
   ruling beside it and each rewrite keeps every rule, condition and scope of the rulings it cites
   (`git diff -w --word-diff 0ce71adab 694602fac -- <file>`). On the IT flow guide's page: does cutting "in the app" from
   its "What happens by itself" line change what that line requires (D415, D410)? Does each map line say only that the
   Leave War is now a page, changing or contradicting nothing else those files say?
6. **The head and the pointers out.** Does the page's head say truly what loads it, where the full rows, the
   architecture (`.claude/rules/seams/leave-war.md`) and the OIL page are? Does every "From other areas" line keep every
   number it cited, each still stated on the page it names?

## Not findings
- Anything about data already stored (the store is demo data, cleared before the database step — D56).
- The size, the shape of the sections, wording style; the gate scripts themselves.
- Rulings proposed for archive: they are put to him, not archived.
- The open question already listed for him (D1318 against D1211: a member's overseas duty or course on a past day),
  unless the page decides it.
- Stale reference documents outside this change (the host files them).

## The report
A list of findings, most serious first, each: the ruling number, the question (1–6), the concrete case (what a fresh
model or a change would get wrong, or the behaviour a test misses), the evidence (the line, the row's words, the test
and its assertion), and the fix (which words go back on the page, or which assertion a test would need). Then:
"rulings checked: N". If none, say so plainly.
