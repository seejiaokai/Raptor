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

## Round 1 fixes (25 Nov 26 — the reads of commit 2e9a83d0e by Astra, a fresh Opus and Fable)

Uncommitted, on top of commit a38d0d01e. Files: `DECISIONS.md`, `.claude/rules/record-decisions.md`, `raptor-port/docs/bug-check-order.md`, `raptor-port/docs/file-map.md`, `raptor-port/scripts/readings.mjs` (rewritten), `raptor-port/scripts/readings.test.mjs` (12 new tests), `raptor-port/scripts/docsize.mjs` (two line limits raised).

| # | Finding (who) | What I did |
|---|---|---|
| 1 | C1 missing (all three, must-fix) | **Fixed.** The block is back in `DECISIONS.md`, in the plan's words, in the same place (after the converted-area steps, before "Parallel branches"). Every pointer was checked: the builder's rules, the design rules (×2), the recording rules, lesson 32, §12 and the check's messages all name `DECISIONS.md`, "A reading", and exactly one block carries that title. All four of lesson 32's rules now have a home again; the "worked example before the build is read" rule lives in C1. |
| 2 | Wrapped phrases pass (all three) | **Fixed.** Each comment is matched as a whole, with its markers (`//`, `/*`, a leading `*`, `*/`) taken off and its line breaks folded to one space. Each match maps back to the lines it covers, and it fails if any of those lines is new; the report names the first new line. Tests: "his to⏎change", "the agent's⏎reading", "until he⏎rules", only the second line added, and a tag on the other line covering it. |
| 3 | Other phrasings (Astra, Opus, Fable) | **Fixed.** Added "the host's reading", "agent's / builder's / build's / host's / Opus's" with up to two words before "reading" ("the agent's own reading"), "my reading", "our reading", "for him to change", "his to rule", "read here as". **Left out on purpose:** "his call", which matches "his callsign". One test per phrase. False-fail guards: his callsign, his call, the section's own reading order, the validator's own reading, your reading, his to-do, until he returns, the reading list, reads here as, his to changeover, put to him by. Known cost, plainly: "read here as" and "his to change" also have everyday meanings. Today's tree has one technical "read here as" (an old line in `board.test.tsx`) and many "his to change" in the sense of who may edit a filing, all in test names, which are quoted text and skipped. A NEW comment using either everyday sense will fail; its way through is #6. |
| 4 | The comment reader skips comments (Astra, Opus, Fable) | **Fixed.** A quote with no partner on its line is not a quote (JSX text such as `<p>Don't</p>`). A regex literal is read as one, chosen by what came before it, never after `<` (a JSX closing tag), with `[...]` classes respected, so a quote or backtick inside it opens nothing. A template's `${…}` is read as code, nested braces included, so a comment inside it counts. Tests: JSX apostrophe before a `//` comment and before a `{/* */}` comment, a regex holding a quote, one holding a backtick, a class holding both, a comment inside `${…}`, a comment after a template with braces, and division. Quoted text is still ignored (single, double, template, after `${y}`, an escaped quote, `"a // …"`). Checked on the real tree: every `src` line holding a phrase that the reader does not count is quoted text (27, all test names and messages); no comment is lost. |
| 5 | A moved or re-indented line counts as new (Opus N1) | **Fixed.** An added line whose words, white space aside, already stood in the base copy of the same file (a renamed file's old copy too) is not new. Tests: an old comment re-indented and moved still passes; the same comment reworded fails. Limit: a move from one file into another file still counts as new. |
| 6 | No honest way through (Fable S4) | **Fixed, the smallest rule:** a comment that cites his answer as `ruled D<n>` passes, like a tag. Stated once, as one sentence added at the end of C1: "A code comment that speaks of a reading he has answered cites his answer, `ruled D<n>`." The check fails a `ruled D<n>` that names no ruling (searched in the rows and the archive). A bare citation is not an answer: the 22 Nov comment cites "(D2338's row)" and still fails. Tests: "paused until he rules — ruled D2186" passes; "ruled D2564" on a wrapped comment passes; an unknown number fails. **This adds a sentence to the approved C1. It is a rule change and needs the readers' meaning check.** |
| 7 | The listing is blind to old untagged readings (Fable M2, S3) | **Fixed.** `npm run readings <file or D<n>>` now lists every comment that speaks of a reading with no tag and no answer, old lines included, as "unrecorded — treat as not asked", with a count line. For a ruling, it lists comments that cite that number. With no names it prints the count across `src` (104 today) and says to name files to list them. It also warns, never fails, of a ruling row the branch adds whose words speak of a reading with no mark; the warnings follow the names asked for. Today, measured from `main`, that is every SANS row with "agent's reading(s)" — expected while the SANS branch is unmerged. Test: in a real repo, a new row with "The agent's reading" warns and the check stays green. |
| 8 | A mistyped mark drops off silently (Fable S5) | **Fixed.** The mark is accepted with no bold stars, a space before the colon or after the comma, and any case. A row that holds `READING, OPEN (` but cannot be read as a mark now FAILS (Fable's fix), so it cannot drop off the list unseen. Tests for each variant and for the unreadable one. |
| 9 | Wording (Opus S3, N3) | **Fixed.** The recording rules' line now reads: "If what you put to him takes a word of his to mean one thing, that meaning is a reading: `DECISIONS.md`, "A reading"." Lesson 32's sentence is whole, with its four rules: put to him with a worked example (C1); listed as readings to judge, never as part of the rule, and the unlisted asked for (§4); a case on each side, shown to him, never passed (§4); the second answer side by side, a difference MISSING until he rules (§6); and §12's box. The case text is byte for byte. Both are rewrites: meaning check owed. |
| 10 | raptor-executor.md 2 lines over | **Fixed.** Its tripwire is raised 108 → 110, with the reason written beside it (D141). **Also raised, not asked for:** `DECISIONS.md` 110 → 120, because C1's block put it 9 lines over (119), and for a rulings file the check's own message says never trim, raise with a reason (D136). Revert that if you would rather move something. |
| — | Speed (found while fixing) | The first version of these fixes made the check take 15–17 seconds, which would break the turn-end hook's 20-second limit. Now it lists the rows once, searches the source once, and fetches a file's base copy only when a phrase sits on one of its new lines. Measured: about 2 seconds for the readings part, against either base. |
| — | Base / branching (Opus M3) | Not touched, as you said. |
| — | Not done | `.html` comments are not read (Fable, minor); the script says so. Lines outside `src` are not checked (Opus N4), as the plan has it. |

### Checks, round 1 fixes
- `node --test raptor-port/scripts/readings.test.mjs` (repo root): ran first and failed (the new functions did not exist); now **PASS 24/24**.
- `DOCSGUARD_BASE=e6d855310 node scripts/docsize.mjs` (raptor-port): readings part **PASS** ("Readings open: 0 (0 not asked)", no readings failures). The run still exits 1 on two line limits that were over before this build: `HANDOFF.md` 420/250 and `OUTSTANDING.md` 3291/3030.
- `npm run docsize` (raptor-port, base = fork point from main): readings shows the same 9 SANS-branch comments as before (the branching issue, left to you); the line limits are deferred because the change touches `src`.
- `node scripts/docsize-selftest.mjs` (raptor-port): **PASS**, exit 0 — 355 cases ("selftest OK — every scenario behaved as designed").

```
Status: READY FOR INDEPENDENT REVIEW — round 1's ten fixes made; the readings part passes against e6d855310
Changes: as listed above (uncommitted)
Checks: readings tests PASS 24/24 · docsize with DOCSGUARD_BASE=e6d855310 — readings PASS, two older line limits FAIL (HANDOFF, OUTSTANDING) · npm run docsize — 9 SANS-branch lines (left to you) · docsize-selftest PASS
Open items: (1) the added C1 sentence (#6) and the two rewrites (#9) need the readers' meaning check; (2) DECISIONS.md tripwire raised 110 -> 120 without being asked; (3) "read here as" and "his to change" in their everyday senses fail a new comment — the way through is ruled D<n>; (4) a line moved into another file counts as new; .html comments are not read
Readings: none met
```

## Round 2 fixes (25 Nov 26 — the reads by Astra, a fresh Opus and Fable)

Uncommitted, on top of commit b8db28952. Every finding was reproduced on the round-1 script before the fix (scratchpad `repro2.mjs`). Of the readers' cases, two already behaved and were kept as guards: two apostrophes in one text run, and a wrapped `ruled ⏎ D<n>` at the level of one comment. Astra's wrapped-citation case shows only in the whole-tree check, and its new test reproduces it there. Files: `DECISIONS.md` (C1, two clauses), `raptor-port/docs/bug-check-order.md` (one word), `raptor-port/docs/file-map.md` (the row), `raptor-port/scripts/readings.mjs` (rewritten), `raptor-port/scripts/readings.test.mjs` (10 new tests, 3 round-1 tests' expectations changed), `raptor-port/scripts/docsize.mjs` (a comment's citation).

| # | Finding (who) | What I did |
|---|---|---|
| 1 | An answered reading never leaves the list (Opus M1) | **Fixed.** A mark on a row that also carries step 2's `**— ANSWERED <date> BY D<n>` or `**— NARROWED …` mark, dated on or after the reading's own mark, counts as answered. It leaves the list, and §12's box no longer sees it. An older ANSWERED mark on the same row answers something else, so the reading stays open (tested). The check now fails a `READING D<n>` tag whose reading is answered, and its message names his answer: "rewrite … cite it, ruled D<answer>". C1 gains one clause after the mark: ("asked" once it is put to him). |
| 2 | `ruled D<n>` passes by citing any ruling (Opus M2) | **Fixed, the smallest honest rule:** `ruled D<n>` counts only when some reading's row carries an ANSWERED or NARROWED mark naming D<n>, i.e. D<n> answered a recorded reading. Stated once, in C1's last sentence, now "…cites his answer, `ruled D<n>` — the ruling its row's ANSWERED mark names." Tests: the 22 Nov comment turned into "(ruled D2338)" fails; "ruled D2338" (the misread ruling) and "ruled D2339" (a ruling that answers nothing) fail, both unit-level and in a real repo; "ruled D2564" passes when D2338's row is ANSWERED BY D2564. The failure message now offers `ruled D<x>` only "where his answer is already on that row as ANSWERED … BY D<x>" (tested). Consequence: an old reading answered before this system, such as the SANS "planned" one answered by D2564, needs its row given the open mark and the ANSWERED mark before a comment can cite the answer. That is the audit's work (C8). |
| 3 | No honest way out for words that are not a reading (Astra 4, Opus S2) | **Fixed, no new marker.** Every failure message ends "If the words are not about what his words cover, reword them" (tested). |
| 4 | Comments still hidden (Astra 1, Fable S1, Opus minor) | **Fixed.** A quote right after a letter or digit is an apostrophe: a JavaScript string never follows one, which covers `Don't`, `men's` and `won't` in JSX text. A `)` that closes an `if` / `while` / `for` / `with` condition lets a regex start after it. Regression tests: an apostrophe in JSX text, then one inside the comment; `{/* */}` between two apostrophes; a comment inside one text run; two apostrophes in one run; a regex holding a backtick after `if (x)`; a regex holding a quote after `while (go(a))`. Quoted text still ignored (tested): a string in a call, in an array, a tagged template, both sides of `? :`, and a division after `(a)`. On the real tree the reader again loses no comment: all 27 lines it does not count are test names or test messages. |
| 5 | The listing drops wrapped matches (Astra 2) | **Fixed.** The listing no longer pre-selects files by a search of single lines; it reads every named file whole, or all of `src` with no names. Tested through the whole listing in a real repo: an old comment "his to ⏎ change" is listed by name (line 2) and counted with no names. The listing now counts 109 unrecorded readings across `src` (104 before; the new phrasings and wrapped ones). |
| 6 | A wrapped `ruled ⏎ D<n>` skips validation (Astra 3) | **Fixed.** Tags and answers are collected from each comment's folded words, the same text the exemption reads, so whatever exempts is also checked. The whole-tree search takes a line ending in "ruled" or "READING" as a possible wrapped citation. Tests: a wrapped valid answer passes; a wrapped unknown one fails, at unit level and in the whole-tree check of a real repo. A tag is now read only inside comments, never in quoted text. |
| 7 | One citation clears a whole `//` run (Opus minor, Fable minor) | **Fixed, the simplest sound boundary: the sentence.** A tag or answer covers only the sentence it sits in. A sentence ends at a full stop, ! or ? before a space or the comment's end, or at a blank comment line. This holds for `//` runs and blocks alike, so a long header with one answered reading no longer hides a second. Tests: a line under an answered line fails; a line under a tagged one fails; two sentences in one block; a blank `//` line; one sentence across lines passes; "e.g." inside the sentence passes. **Round-1 test changed:** tagging only the 22 Nov comment's second reading sentence now leaves its first ("THE AGENT'S READINGS, TOLD TO HIM …") failing, and the test shows both sides. |
| 8 | More phrasings (Fable S2, Opus S1) | **Fixed.** Added "his to decide / settle", "for him to decide / rule", "pending his ruling", "until he decides / answers", "not yet put to him", "interpretation" beside "reading" for the named readers, "agents' reading", "Fable's" and "Claude's". One test each. Guards: "his to rule on" (an approval; also "the date is his to rule on later"), "pending his return", "until he decided to leave", "the agents list", "Fable's brief". **Not added:** "he has not ruled" (Fable): not in your list, and it is often a plain statement of fact. |
| 9 | Malformed marks vanish (Astra 5, Fable S3, Opus S4) | **Fixed.** Anything with READING then OPEN, only punctuation or spaces between (comma or none, dashes, stars, colons), any case, must read as a mark, or the row fails. Tests: "READING, OPEN:" (no bracket), "READING OPEN (" (no comma), bold closed early, no comma inside bold, a dash between with a wrong state. The kept variants still read (round-1 tests). No ruling row today holds such words in its prose, so the stricter check fails nothing currently in the rulings. |
| 10 | A line moved into another file counts as new (Opus S3) | **Fixed.** An added line whose words, white space aside, the same change removes anywhere under `src` (a deleted file included) is not new. This replaces round 1's same-file base read and costs no extra git call. Tests: a comment moved out of one file into a new one passes; a copy, the old one still standing, fails (Fable's minor, now closed). |
| 11 | Words (Opus minor) | **Fixed.** Lesson 32: "never left only in a comment". The `DECISIONS.md` tripwire comment cites D141 only. The script's speed comment says the hook's limit is 60 seconds. |

### Checks, round 2 fixes
- `node --test raptor-port/scripts/readings.test.mjs` (repo root): the new tests failed first (the new functions did not exist; repro2 showed the old behaviour case by case); now **PASS 34/34**.
- Readings part, timed on this PC: **2.5 s** against e6d855310, **3.0 s** against main (the whole turn-end run's slowness, 64–74 s seen by Opus and Fable, is outside this script). `npm run readings` with no names: 4.5 s.
- `DOCSGUARD_BASE=e6d855310 node scripts/docsize.mjs` (raptor-port): readings part **PASS** ("Readings open: 0 (0 not asked)", no readings failures). The run still exits 1 only on two older line limits: `HANDOFF.md` 425/250 (your notes since added 5 lines) and `OUTSTANDING.md` 3291/3030.
- `node scripts/docsize-selftest.mjs` (raptor-port): **PASS**, exit 0 — 355 cases ("selftest OK — every scenario behaved as designed").

```
Status: READY FOR INDEPENDENT REVIEW — round 2's eleven findings fixed; the readings part passes against e6d855310 in about 2.5 s
Changes: as listed above (uncommitted)
Checks: readings tests PASS 34/34 · docsize with DOCSGUARD_BASE=e6d855310 — readings PASS; HANDOFF and OUTSTANDING line limits FAIL as before · docsize-selftest PASS (355)
Open items: (1) C1's two new clauses (#1, #2) and lesson 32's word (#11) want the readers' meaning check; (2) three round-1 tests had their expected results changed, each traced to #2 or #7; (3) an old reading he answered before this system (e.g. D2564) can be cited only once the audit gives its row the open and ANSWERED marks; (4) "he has not ruled" is not caught; .html comments are not read
Readings: none met
```
