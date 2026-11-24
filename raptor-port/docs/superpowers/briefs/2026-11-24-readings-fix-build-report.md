# Build report — [READINGS-LAPSE-FIX] plan §C (C1–C7), Opus builder, 24 Nov 26

Plan: raptor-port/docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md (approved, D2610). Nothing committed or pushed.

## Each §C change

| Change | Result | Note |
|---|---|---|
| C1 `DECISIONS.md` "A reading" block | DONE, plan's exact words | Placed after the converted-area steps paragraph (still after the three recording steps, before "Parallel branches"), not between step 3 and that paragraph — so AGENTS.md's "the steps for a converted area just below them" stays true. Host: move it up if the plan meant directly after step 3. |
| C2 `.claude/rules/raptor-executor.md` stop + footer line | DONE | "Before" matched exactly; the trailing "Never silently change the approved plan or a policy." kept as its own sentence. Footer gains `Readings: …`. |
| C2a `.claude/rules/ui-design.md` point 1, point 2 | DONE | Both "before" texts matched. |
| C2a `.claude/rules/record-decisions.md` §The check bullet | DONE | Added as the last bullet of §The check. |
| C3 `bug-check-order.md` §4 brief line | DONE | "Before" matched; rest of the line unchanged. |
| C3 EXPECTED bullet | DONE — placement judged | The anchor "(the mark and the changes list)" sits mid-sentence; inserting there literally would break the sentence. Put the new sentence at the end of that same sentence (after `rewritten "RECORD exactly what it says".`). Host/readers: confirm. |
| C4 §6 row + checklist step 8 | DONE | Row added after "A part drawn inside another surface…"; step 8's list gains the phrase at its end. |
| C5 lesson 32 + checklist line 32 | DONE | Only the "Lesson:" sentence changed; the case text is byte for byte. Checklist gains item 32 after item 31. |
| C6 §12 box | DONE | After "Applicable rulings listed…". |
| C7 the script | DONE (see open item 1) | `raptor-port/scripts/readings.mjs`, `npm run readings`, wired into `docsize.mjs` with the inventory (so the Stop hook's `--inventory` run and GitHub's both enforce it). |

## Files changed
- `DECISIONS.md` (C1)
- `.claude/rules/raptor-executor.md` (C2)
- `.claude/rules/ui-design.md`, `.claude/rules/record-decisions.md` (C2a)
- `raptor-port/docs/bug-check-order.md`, `raptor-port/docs/bug-check-checklist.md` (C3–C6)
- NEW `raptor-port/scripts/readings.mjs`, NEW `raptor-port/scripts/readings.test.mjs` (C7)
- `raptor-port/scripts/docsize.mjs` (imports and runs the readings check; prints `Readings open: …`)
- `raptor-port/scripts/docsize-selftest.mjs` (one line: copies readings.mjs into its fixture repo, since the gate now imports it — without it the self-test's fixture gate cannot load)
- `raptor-port/package.json` (`"readings"` script)
- `.github/workflows/docs-guard.yml` (one step running the new tests, like the other script tests there) — not named in the plan; added so the tests run anywhere. Host may drop it.
- `raptor-port/docs/file-map.md` (a dated entry and a row for the two new files)
- Not mine, seen in the tree: `.claude/decisions-full/how-we-work.md`, `.claude/rules/decisions/how-we-work.md`, DECISIONS.md's map row (D2611) — the host's.

## The script (C7)
- Lists every `**READING, OPEN (<date>, asked|not asked): …**` mark in rows under `.claude/decisions-full/` and `.claude/rules/decisions/` (a new row before the mover runs) and every `READING D<n>` tag under `raptor-port/src`; narrows by `D<n>` and/or path args; prints `Readings open: <n> (<m> not asked)`.
- Gate failure (a): a tag whose ruling's row has no open mark (whole tree).
- Gate failure (b): on lines added since docsize's base (git diff -U0 base + untracked files) under `raptor-port/src` (.ts/.tsx/.js/.jsx/.mjs/.cjs/.css), a phrase — his to change | agent's/builder's/build's reading | until he rules | not put to him (any case, straight or curly apostrophe) — inside a comment (a block, or a run of `//` lines) that carries no `READING D<n>`. Strings are skipped.
- Fast path: tags found with `git grep`; the comment scan reads only changed src files.

## Tests
- `node --test raptor-port/scripts/readings.test.mjs` — failed before the script existed (module missing); after: 12/12 PASS. Cases: the 22 Nov comment (verified identical, character for character, to commit 62a898654's first 1942 characters) added whole → FAILS; same comment not added → nothing; tagged → passes; every phrase in line and block comments; phrase in a string / tag in the same `//` run / tag in a different comment; mark parsing with state; tag with its mark passes; tag with no mark fails; the count line; three real-git-repo cases (untracked and committed additions, a line added to an old file, tag with/without mark and the printed count).
- `npm run readings` (raptor-port): exit 0 — "Readings open: 0 (0 not asked)", no tags.
- `node raptor-port/scripts/docsize-selftest.mjs`: PASS, exit 0 ("selftest OK — every scenario behaved as designed"). It took about 10 minutes on this PC.

## docsize
- `cd raptor-port && npm run docsize`: **FAIL, 9 problems, all `readings:` (b)** — and none from this branch's own work. This branch sits on the unmerged SANS branch (`claude/allavail-sans-postout-141`): its fork point from `main` is 145 commits back, and those commits add 8,924 src lines this branch did not write. The 9 lines are the SANS work's "agent's reading" / "his to change" comments — `src/leavewar/sansunfiled.ts:9` and `:10` (the 22 Nov comment itself), `src/engine/people.ts:230`, `src/leavewar/sync.ts:2148`, `src/state/notices.ts:1119`, `src/ui/inputedit.tsx:367`, `src/ui/sanscal-model.ts:67`, `src/leavewar/sans-ahead-walk152.test.tsx:139`, `src/leavewar/sans-before.test.tsx:5`. They are exactly the audit's (§C8) targets.
- Measured against this branch's own fork point from the SANS branch (`DOCSGUARD_BASE=e6d855310`): readings part passes ("Readings open: 0"); docsize then fails only on line ceilings (below).
- The same failures will show at every turn's end (Stop hook) and on GitHub's run while those SANS lines count as "added since main".

## Size tripwires crossed
- `.claude/rules/raptor-executor.md`: 110 lines against a ceiling of 108 (+2, from C2's longer stop and the footer line). Nothing trimmed. On the normal run (src touched) it is reported as deferred, "OVER by 433" in all = this +2, `HANDOFF.md` 420/250 (+170) and `OUTSTANDING.md` 3291/3030 (+261) — those two were over before this build.
- No other changed file crossed its tripwire.

```
Status: INCOMPLETE — every §C change built and its tests green; the document check fails on today's tree (open item 1), and that is the host's call
Changes: as listed above
Checks: node --test raptor-port/scripts/readings.test.mjs (repo root) PASS 12/12 · npm run readings (raptor-port) PASS · node raptor-port/scripts/docsize-selftest.mjs (raptor-port) PASS · npm run docsize (raptor-port) FAIL — 9 readings lines from the unmerged SANS branch below this one; with DOCSGUARD_BASE=e6d855310 the readings part passes and only line ceilings fail
Open items: 1) the readings check fails the SANS branch's 9 comments while that branch is unmerged under this one — host to choose: tag them and mark their rows in the audit (C8) first, merge the SANS branch first, or rule another base for check (b); I did not invent one (a "parent branch" base would let any branch someone has built on escape the check). 2) raptor-executor.md 2 lines over its 108 ceiling — raise with its reason, or move. 3) two placement judgements to confirm: C1's block position, C3's EXPECTED sentence position. 4) docs-guard.yml step and the self-test's one-line copy were added beyond the plan's text, needed to run the tests and keep the self-test loading.
Readings: none met in building; the gate found the 9 SANS-branch comments above (rulings D2338 and the SANS rulings — the audit's to settle)
```
