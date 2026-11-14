# The rules-first review of the rules engine — the brief for one family's reviewer (11 Nov 26, chat 64; his D1983)

**What this is.** The owner ordered a review of the whole rules engine — the part of a flying-schedule planner that
raises warnings — done RULES-FIRST: not a sweep of files for defects, but ruling by ruling, asking of each one
*"where is this implemented, and does the implementation match what the ruling says — no more and no less?"*, with a
test for each. A report goes to him; **nothing in the app changes** (his words). You review ONE family of rulings.

**The method** is the standing brief `raptor-port/docs/superpowers/briefs/rules-first-red-team.md` — read it first, whole
(its register paths and "already found" section are the first run's, not yours; everything else stands, EXCEPT its last
line: you DO write tests, as set out below). The four failure kinds are its: STALE, OVERREACH, MISSING, DRIFT.

**Your worklist** is one family of `raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-worklist.md`
(the heading given to you), plus every entry of that file's "Pairs" section and its "later changed" list that names one
of your items. The worklist is a reading list, not a finding; its "where implemented" cells came from searching for the
ruling's number and can be off — the ruling leads you to the code, not the cell.

## For each item of your family, in order

1. **The ruling itself.** Open the full row of every D-number on the item with the shell's grep (the Grep tool hides a
   long row): `grep -h '^| D1042 |' .claude/decisions-full/*.md`. The row has his words, the date, what he was told, and
   any "the agent's reading". A replaced ruling's words: `DECISIONS-ARCHIVE.md`. The newest dated ruling wins (D90).
   An item with no D-number is a rule settled before the numbers: its words are the page statement
   (`.claude/rules/decisions/scheduler.md`, `oil.md`) and `raptor-port/docs/engine-rules.md` (376 KB — search it, never
   read it whole).
2. **The code, led by the ruling.** Find every place that implements it — `raptor-port/src/engine/` (`validate.ts` is
   the heart), and the rules built on top in `src/state/`, `src/ui/`, `src/leavewar/` — and every place that USES the
   same helper for a second job (that is where an OVERREACH hides). Watch the scope words the worklist lists (only,
   never, every, whole, once).
3. **The verdict:** `MATCHES`, `STALE`, `OVERREACH`, `MISSING`, `DRIFT`, or `UNCLEAR` (the ruling's own words do not
   decide a real case — that becomes a question for him).
4. **The test — one per item, in your family's ONE new test file** `raptor-port/src/engine/rulesfirst-<n>-<slug>.test.ts`
   (n and slug are given to you). Write it the way the app writes: through the engine's own doors (look at the
   neighbouring tests the worklist names for how a day is built and `validate()` read), on a small made-up day; the
   D-number(s) in the test's title.
   - `MATCHES`: if an existing test already asserts exactly the ruled behaviour, do not duplicate it — name it (file and
     title) in your results. Otherwise write a passing test for the ruled behaviour, including the ruling's sharpest
     edge (the "only", the "never", the equal-time case).
   - A finding (`STALE` / `OVERREACH` / `MISSING` / `DRIFT`): write a test asserting what he RULED, run it as a plain
     `it(...)` and SEE it fail — keep the failing line — then mark it `it.fails(...)` (Vitest: it passes while the
     assertion still fails, and turns red the day the app is fixed), with a comment above it:
     `// RULES-FIRST FINDING <n>.<k> (11 Nov 26, [ENGINE-RULES-REVIEW]): <one line>; flip to it() when fixed.`
     A claim you cannot make fail is not a finding: report it as a doubt, with what you tried.
   - `UNCLEAR`: where it helps, a passing test that pins what the app does TODAY in that case, titled "as built".

## What is not a finding

- A problem that lives only in data already stored while the code is right going forward (D56).
- A scheduler who is not an admin (D785).
- How a warning LOOKS (colour, place, an icon) — unless the words on screen carry the rule itself.
- The files copied word for word from the original app stay as they are (D1537): where the ORIGINAL's behaviour
  disagrees with a ruling, that is a question for him, said so — still with its test.

## Limits

- **Change no file of the app, no existing test, no document, no rulings file.** You create exactly two files: your
  family's test file (above), and your results file (below). Do not commit, switch branch, stash, push, or run the
  build, the browser tests or the whole unit suite. Run only your own file: from `raptor-port/`,
  `npx vitest run src/engine/rulesfirst-<n>-<slug>.test.ts`; and once at the end `npx tsc -b` (the unit runner does not
  type-check) — a type error in your file is yours to fix.
- Start no helper of your own. Full paths or `git -C`; never `cd ..`. A multi-line script goes in a file (Write tool),
  never a heredoc. Line endings LF.
- Give every item a verdict. If time is short, a read-only verdict with "test not written — why" beats a skipped item.

## What you hand back

**Your results file:** `C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/engine-review/family-<n>-results.md`:
- a table, one row per item: `W-id | D-numbers | verdict | where implemented (file, function) | the test (new title, or the existing file and title) | one line`;
- then each finding and each `UNCLEAR` in full: the ruling's clause quoted; the kind; where; **the exact case** — a
  named made-up man, a day, the times, what is typed or pressed — what the app does and what the ruling says it should;
  what a scheduler or member would see or lose because of it; confidence, and what would settle it; the red line you
  saw; a suggested fix in one or two lines (not built);
- then anything you noticed outside your family, one line each (not reviewed).

**Your final message to me, under 300 words:** the counts by verdict; each finding and each UNCLEAR in ONE line (its
case and its consequence); your test file's result line (how many passed, how many `it.fails`); `tsc -b` clean or not;
anything not done.
