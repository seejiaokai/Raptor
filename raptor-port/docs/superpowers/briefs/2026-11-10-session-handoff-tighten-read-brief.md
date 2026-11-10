# Brief — the read of the session-handoff skill's tightening ([SKILLS-TIGHTEN] step 2, 10 Nov 26, chat 59)

**For two readers, each blind to the other (D1761, D1738): Astra, and a fresh Opus reader.** Read-only: change no file,
commit nothing. Do not open the other reader's report or any file under `raptor-port/docs/superpowers/briefs/` whose
name starts `2026-11-10-session-handoff-tighten-read-` other than this one.

## What was done

His D1975 and D1978 (open the full rows with the shell:
`grep -h -E '^\| D(1975|1978|1407|1737|1086|1744|1733|761|975|976|151|870) \|' .claude/decisions-full/*.md`): the
session-handoff skill is said in fewer words — **the same rules, none dropped** — what no longer applies is taken out,
the old wording kept whole in an archive, and five places where the skill had fallen behind a later ruling are put
right.

- **The new skill:** `.claude/skills/session-handoff/SKILL.md`.
- **The old wording, whole:** `git show origin/main:.claude/skills/session-handoff/SKILL.md` (in Git Bash set
  `MSYS_NO_PATHCONV=1` first), or `raptor-port/docs/archive/session-handoff-skill-2026-11-10.md` (the same text, its
  headings one level down).
- **The whole change:** `git diff origin/main...HEAD -- .claude/skills/session-handoff/SKILL.md`.
- **The list the owner approved:** `raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-session-handoff.md` —
  §B what leaves, §C the five corrections, §D what is now stated once, §E what is said shorter, §F what was to be left
  alone.
- The always-loaded rules the skill now leans on: `.claude/rules/shipping.md`, `.claude/rules/doc-structure.md`,
  `.claude/rules/record-decisions.md`, and the head of `HANDOFF.md`.

## What to answer — did any MEANING change?

1. **Every passage removed or reworded.** Set the old beside the new, passage by passage. Was a RULE, a condition
   (where, only, unless, except, until, never), an exception, a safeguard or a pointer a chat needs lost, widened or
   narrowed — as against a dated story, history, or text stated twice? Where a story left, did a condition that lived
   only inside the story leave with it?
2. **Every command and recipe.** Compare each command, each quoted sentence an opening line must carry, and the
   template's lines, character by character. §F says they stay word for word, but for the template's heading, its
   "Gates" line and its new last line (§C 2 and 3). Name any other difference.
3. **The five corrections (§C).** Does each say what its ruling says — no more, no less? In particular: the merge rule
   (D60, D1407, D1737, against `shipping.md` §"Push" and "merge live"); the "Gates" line (D1086, against `shipping.md`
   §The checks and `raptor-port/CLAUDE.md` §Build & verify); the template's last line (D1744, D761, and the `Rulings:`
   and `Walk:` lines of `record-decisions.md` and `bug-check.md`); the gate baseline (D1733, against `HANDOFF.md` §Gate
   baseline).
4. **Stated once (§D).** For each rule that was stated two or three times: does the one statement that stays carry
   everything every copy carried, and does a chat following the steps in order still meet it before it needs it? The
   old "Rules" list lost four entries to the steps (never append; a plan file first; `HANDOFF.md` a current-state doc;
   every handoff ends with the opening line) — is each whole where it now sits?
5. **Contradictions and bulk.** Does any new sentence contradict a ruling or one of the always-loaded rules named
   above, or add a rule nobody ruled?

## What is not a finding

- A dated story, a piece of history, or the account of where the skill came from, leaving — unless a rule or a
  condition left with it.
- The numbers of two spent rulings (D974, D1796) no longer cited.
- The six open skill notes about this skill (916, 917, 918, 920, 921, 922) not being folded in: they wait for the next
  skill-notes review (D1978).
- Line wrapping, bullet shape, and a rule moving between a bullet and a sub-heading with its words intact.

## How to report

A count first ("N meaning changes · M of lost detail · K others"). Then each finding numbered, with: the old words; the
new words; the concrete failure — what a chat following the new skill would now do wrong; and the fix **in the exact
words to put back or change**. A claim with no concrete failure is not a finding (D489). If nothing changed meaning,
say so and say what you compared.
