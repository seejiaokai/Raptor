# Helper D-reads-records — report (saved by the coordinator from the hand-back, 20 Nov 26)

**Counts:** APPLY 10 (922, 924, 925, 928, 936, 948, 954, 977, 978, 981) + 980 (APPLY, text for BCO under "For another file") · FILED 3 (926, 938, 951) · MEMORY 1 (975). Table: `dispositions-D-reads-records.md`. No questions.

## Drafted files
**codex-guide.md §Reading a commit that is not the branch head** — the one-sentence recipe becomes five numbered steps; a handoff or brief points to it, never copies a shortened version (954): 1. export without pictures (977's excludes); 2. take the branch's handoff block and the round's builder brief, reports and evidence sheet out of the copy, one line each saying so; the brief's first line says so (978); 3. `git init` with `core.longpaths` and `core.hooksPath=/dev/null`, check `git log --oneline -1` (954, 977 met again); node_modules link → GD; 4. `codex exec -m gpt-6-astra … < /dev/null` (D2210, 981), the log checked to have grown after ~90 s; 5. the report's head names the exported commit.

**gates-and-deploy.md** — code-check trap: `npm run lint:changed -- --include-untracked`, its "N changed files" matched to `git status` (928); the "Done" loop: a wait waits for success, never quiet, pointing to the wait script [CHECK-TOOLS-HARDEN] (t) (936); the settle step's mid-merge trap: one "did not arrive" can be real — a line only the branch has is carried into main's archived block (948); the backgrounded `codex exec` trap points to the recipe (981).

**doc-budget.md §2** — new bullet "Before a rewrite goes to its readers": each cut sentence keeps its qualifiers and pointers (922); a corrected rule brings the lines that rely on it (925); a saving quoted to him is measured, never guessed (924). Placed here, not writing-skills (vendored, general); rewriting goes on (D1941, D1987).

## Additions
`_docs/OUTSTANDING-items-D-reads-records.md`: [CHECK-TOOLS-HARDEN] (g) widened — the reader-copy script runs the whole recipe (954, 977, 978, 981); new (s) check-then-commit script + script-guard refusal of a commit joined to a check by `;` or a pipe (926); (t) `wait-live.mjs` (936); (u) `lint:changed` reads untracked files by default (928). [RULE-FILE-LESSONS] (e) check page room and the "changes/answers" trigger before a batch of rulings (938); (f) a ruling number is taken only once another open chat can see it (951).
`_memory/additions-D-reads-records.md`: extends `js-replace-dollar-patterns` (975: backslashes eaten inside a JS string/template literal in an edit script) and `pipe-hides-check-failure` (926: the semicolon case; its "How to apply" corrected).

## For another file
1. BCO §4 "Before a brief leaves", new bullet (980): each reader's brief holds only its own job, decided when written; a paragraph for one reader goes in that reader's own prompt; Astra's brief asks for the code checked against the rulings and contracts it names, each finding written as it is confirmed so a stopped run keeps it; a stopped run is never re-run on a brief reworded after the stop — its progress notes are read for claims, another reader chases any claim no one else made, the lost read goes on the reads-owed list (fix reads 5, 8, 9; 10, 11, 13).
2. BCO §4 blindness paragraph (978): after "…the reader runs in an exported copy of that commit" insert ", from which the round's handoff block, builder briefs and reports are taken out (the recipe's step 2)".
3. TDD skill "Which other tests?" (928): add "every test that compares a builder's whole output with a reference, for any change to what that builder draws — found by the builder it covers (here `src/ui/html.test.ts`, the week; a deliberate difference added to its list in the same change)"; needs a SUPERPOWERS-VENDORED register line.

## Stale lines
None fixed. codex-guide "Who does what now" does not mention D2210 (omission); its opening "three passages below" is now four.

## Doubts
- 980's wording must not read as a way round the provider's filter.
- 936 and 928 carry one code but have a filed half too.
- `-o` as codex's report flag unconfirmed — run `codex exec --help` before install.
- Least sure: (1) the 980 bullet; (2) doc-budget as the home for 922/924/925 vs closing them; (3) 951 FILED vs REFLECTED.
- Coordinator: C also proposed a point (s) on [CHECK-TOOLS-HARDEN] — letters to be settled at merge.
