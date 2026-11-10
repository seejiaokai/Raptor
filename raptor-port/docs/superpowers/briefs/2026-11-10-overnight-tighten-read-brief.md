# Brief — the read of the overnight skill's tightening ([SKILLS-TIGHTEN] step 3, 10 Nov 26, chat 60)

**For two readers, each blind to the other (D1761, D1738): Astra, and a fresh Opus reader.** Read-only: change no file,
commit nothing. Do not open the other reader's report or any file under `raptor-port/docs/superpowers/briefs/` whose
name starts `2026-11-10-overnight-tighten-read-` other than this one.

## What was done

His D1975, D1979 and D1980 (open the full rows with the shell:
`grep -h -E '^\| D(1975|1979|1980|1407|1737|1093|596|1086|1089|1416|151|761|922) \|' .claude/decisions-full/*.md`): the
overnight skill has what no longer applies taken out — the old wording kept whole in an archive — four rules that were
stated two or three times stated once, and three places where it had fallen behind a later ruling put right. **The
same rules, none dropped.** Nothing else in it was to be touched: its four densest paragraphs were deliberately NOT
reworded.

- **The new skill:** `.claude/skills/overnight/SKILL.md`.
- **The old wording, whole:** `git show origin/main:.claude/skills/overnight/SKILL.md` (in Git Bash set
  `MSYS_NO_PATHCONV=1` first), or `raptor-port/docs/archive/overnight-skill-2026-11-10.md` (the same text, its headings
  one level down).
- **The whole change:** `git diff origin/main...HEAD -- .claude/skills/overnight/SKILL.md .claude/rules/shipping.md .claude/rules/decisions/how-we-work.md`.
- **The list the owner approved:** `raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-overnight.md` — §B
  what leaves, §C the three corrections and the question D1980 answers, §D what is now stated once, §E what was NOT to
  be reworded, §F what was to be left alone.
- The always-loaded rules the skill now leans on: `.claude/rules/shipping.md` (§"Push" and "merge live", §The loop,
  §The checks) and `.claude/rules/decisions/how-we-work.md` (§Long runs, compaction and handoff).

## What to answer — did any MEANING change?

1. **Every passage removed or reworded in the skill.** Set the old beside the new, passage by passage. Was a RULE, a
   condition (where, only, unless, except, until, never), an exception, a safeguard or a pointer a night needs lost,
   widened or narrowed — as against a dated story, history, or text stated twice? Where a story or a date left, did a
   reason or a condition that lived only inside it leave with it?
2. **Every command, and every sentence the skill has the agent say to him or write into the block.** Compare each
   character by character. They were to stay word for word, but for the "Nothing merges…" sentence of step 6, which
   gains a clause (§C 3). Name any other difference.
3. **The three corrections (§C), and D1980.** Does each say what its ruling says — no more, no less?
   - where the checks run and when a job's pull request opens (D1086, D1089, against `shipping.md` §The checks) — and
     does the order "block pushed first, then the pull request opened, then no push until its run has finished" still
     hold together with "as soon as it is built";
   - merging at night (D596, D1093, D1407, D1980): in the skill's head, step 6, Part 2's "Never" and the last
     checklist; in `shipping.md`'s new sentence and its line in §The checks; in the general page's line under "Long
     runs". Does any of them let a night merge something his "auto merge live" would not cover, or forbid the morning
     merge of the night's notes that D1980's reading allows?
4. **Stated once (§D).** For each of the four: does the one statement that stays carry everything every copy carried,
   and does a night following the steps in order still meet it before it needs it? In particular the "Never" bullet,
   which now points to the head's "is NOT permission" paragraph; and the re-read after a compaction, which now points
   to the sentence step 8 writes into the block.
5. **The two lines changed on the general page** (`how-we-work.md`: the "skills written here … are tightened" line
   under Records, and the "Unattended:" line) were also tightened in wording to stay under the page's hard size limit
   (D1932). Did either lose or change a rule?
6. **Contradictions and bulk.** Does any new sentence contradict a ruling or an always-loaded rule, or add a rule
   nobody ruled?

## What is not a finding

- A dated story, a bare date, or a piece of history leaving — unless a rule, a reason a night needs, or a condition
  left with it.
- The numbers of six spent or replaced rulings (D856, D857, D858, D859, D864, D1103) no longer cited.
- Open skill note 915 and the keep-retrying trial (D885, `[OVERNIGHT-RETRY-TRIAL]`) not being folded in (D1979).
- The dense paragraphs still being dense (§E — left alone on purpose).
- Line wrapping.
- A problem that lives only in data already stored (D56) — none is expected here.

## How to report

A count first ("N meaning changes · M of lost detail · K others"). Then each finding numbered, with: the old words; the
new words; the concrete failure — what a night following the new skill would now do wrong; and the fix **in the exact
words to put back or change**. A claim with no concrete failure is not a finding (D489). If nothing changed meaning,
say so and say what you compared. Return the report as your final reply — write no file.
