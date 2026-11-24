# The checking fix (2e9a83d0e) — fresh, blind Opus read

Read: the commit's diffs, the plan §C/§E, lesson 32, `readings.mjs` run and probed (its 12 tests pass; probes in a scratch script calling `unmarkedComments` directly). No other reader's or builder's report opened.

## Must-fix

**M1. C1 — the rule itself — was never written.** `DECISIONS.md` changes only by adding D2611 to the map row; there is no "A reading" block anywhere in the repo (`grep -rn '"A reading"\|\*\*A reading'` finds only the pointers). Every new pointer (raptor-executor, ui-design ×2, record-decisions, bug-check-order §7.11 and §12, file-map, the gate's own failure message) sends the reader to a section that does not exist. What is lost with it: the `READING, OPEN (<date>, asked | not asked)` form, so nobody knows how to write the mark the gate requires; "whoever meets it: drawing, wording, building, reading or walking"; "with a worked example and how the app answers the same question elsewhere"; and "his approval of wording that only repeats the word does not settle it". Lesson 32's folded sentence relies on C1 for its second rule ("goes to him with a worked example before the build is read"), so as committed that rule is dropped from the order. Fix: add C1's text to `DECISIONS.md` after the three recording steps, as the plan has it.

**M2. A wrapped phrase passes (b).** The phrase is matched one line at a time (`c.text.split('\n')` then `PHRASE.exec(l)`), but comments in this code wrap at about 120 characters, and the phrase wraps with them. `// … his to` + `// change …` → no failure. `/* … the builder's` + `reading */` → no failure. This is not hypothetical: `src` already has at least four comments that end a line on "the agent's" or "the builder's" (oilev.ts:719, oilflighttimes.test.ts:154, sync.ts:2622, balances.css:65). Fix: run PHRASE over the comment's text with comment markers and line breaks folded into single spaces (`//`, `*`, `\s+` → ' '). Then map each match back to its line, and fail it if any of the lines it covers was added. Add a wrapped case to the tests.

**M3. This pull request cannot go green, and merging it would merge the SANS branch too.** The branch is cut from the unmerged SANS branch. GitHub's docs guard measures against main's tip, so the 9 SANS comments count as added lines and the guard fails on them. One of them, sansunfiled.ts:10, is the 22 Nov comment itself. The ways out:
- (a) The SANS branch merges first. Its comments then become old lines, and the very comment behind lesson 32 is grandfathered until the audit reaches it (C8).
- (b) The 9 are tagged, with open marks, on the SANS branch.
- (c) This work is moved onto a branch cut from main.

On main the measure is correct: `git diff <main tip>` against the working copy counts only the branch's own lines. This needs a decision and a note in the handoff before anyone asks him for "merge live".

## Should-fix

**S1. Other phrasings pass.**
- "the agent's own reading" (already in `src` once), "Opus's reading", "our reading" (2 in `src`).
- `(?:agent|builder|build)['’]s reading` needs the two words side by side.
- Fix: allow up to two words in between (`(?:agent|builder|build)['’]s(?:\s+\w+){0,2}\s+reading`), and add "our reading".

**S2. Code before a comment can hide it.**
- JSX text with an apostrophe on the same line, e.g. `<p>Don't</p> // until he rules …`: the scanner reads the apostrophe as the start of a quote, and the comment is missed.
- A regex holding a backtick, e.g. `/`/`, swallows every following line up to the next backtick. A `// his to change` three lines below was not reported.
- Fix, either one:
  - scan raw lines for the phrase and fail only when the phrase sits inside a comment span;
  - or, more simply, test the phrase on every added line, comment or not. Words shown on screen rarely say "his to change".

**S3. The new always-loaded line does not parse.** In record-decisions.md, "A word of his that what you put to him reads one way is a reading" is not a clear sentence. Suggest: "Putting something to him that reads a word of his one way is putting a reading: `DECISIONS.md`, "A reading"."

## Minor

- **N1. A moved or reformatted old comment now fails.** The check counts lines as added, so moving or re-indenting one of the ~40 old "his to change" comments fails it. "Old comments block nothing" holds only while they are never touched. Say so in the gate's failure message, or accept it on purpose.
- **N2. Once he has ruled, the phrase must go.** A comment keeping "his to change" while citing his answer fails (b), and the tag is no longer allowed (a): it must be reworded. The failure message says this. Fine, but worth knowing.
- **N3. Lesson 32's folded sentence ends on a fragment.** "…§12's box (here, …)" — "§12's box" has no verb. The case text above it is unchanged, byte for byte. Its four rules:
  - the comparison side by side, a difference counting as a finding → now in §6's new row;
  - the brief's targets → now in §4;
  - a case on each side → now in §4's EXPECTED line;
  - a worked example before the read → only in C1, which is missing (M1).
- **N4. Lines outside `src` are not checked.** A reading left in `e2e/` or `scripts/` passes. This matches the plan as written.

## Other branches after this merges

Any branch that adds "the agent's reading" — 60 such comments in `src` today, a common habit — now fails both the turn-end check and GitHub's run until the comment carries a tag and its ruling's row the open mark. That is what C7 and D2611 want. Each chat will meet it on its first such comment, so tell the open chats with the merge.
