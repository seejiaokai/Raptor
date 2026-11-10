# Brief — the read of the design guide's tightening ([SKILLS-TIGHTEN] step 1, 10 Nov 26, chat 58)

**For two readers, each blind to the other (D1761, D1738): Astra, and a fresh Opus reader.** Read-only: change no file,
commit nothing. Do not open the other reader's report or any file under `raptor-port/docs/superpowers/briefs/` whose
name starts `2026-11-10-design-guide-tighten-read-` other than this one.

## What was done

His D1975 and D1976 (open the full rows: `grep -h -E '^\| D(1975|1976|1977|941|1417|852) \|' .claude/decisions-full/*.md`,
with the shell): the design guide is said in fewer words — **the same rules, none dropped** — and what no longer applies
is taken out, moved whole to an archive; each of his design lessons goes back to one line (its number, date and ruling,
his words, the lesson), its screen, its "other places" list and the readers' notes moving whole to a searched file; a
lesson about one built screen that is already a rule on that screen's own rulings page leaves the list.

- **The new guide:** `raptor-port/docs/design-practices.md`.
- **The old wording, whole:** `raptor-port/docs/archive/design-practices-2026-11-10.md` (everything but §9's lessons;
  its headings one level down; at its end, the old point 2 of `.claude/rules/ui-design.md`) and
  `raptor-port/docs/archive/design-lessons-detail-2026-11-10.md` (each lesson as first written, found by `**Lesson N (`).
- **Also changed:** point 2, "Words", of the short form in `.claude/rules/ui-design.md`.
- **The whole change:** `git diff origin/main...HEAD -- raptor-port/docs/design-practices.md .claude/rules/ui-design.md`.
- The plan the owner approved: `raptor-port/docs/superpowers/plans/2026-11-10-skills-tighten-design-guide.md` (§B what
  leaves, §C the lessons, §D the rewrites).

## What to answer — did any MEANING change?

1. **The 68 lessons kept (§9).** Set each new line beside its original in the lessons' detail file. Is his rule the
   same — nothing of HIS words' substance lost, widened or narrowed? Is anything that was marked as the agent's reading
   now stated as his (D1417)? Was an agent's reading dropped that a future design job would need in order to apply the
   lesson correctly (a list of "other places", "his case", a reader's note and an answer since given were meant to
   leave)? Are the "narrows / narrowed by" pointers still right, now that lessons 50 and 5 have left the list?
2. **Outside §9.** For every passage removed or reworded in the diff: was a RULE, a condition, an exception or a
   safeguard lost or changed — as against a dated story, an account of who approved which words, or text stated twice?
   Look hardest at: §0's three steps (D852, D941, D1417); §1's head (D833, D835) and its points on D846 and D850; §1a's
   head and tests 0, 1 and 9; §1b's head and tests 2, 10 and 12; the three worked examples taken out after §1b — is any
   test now unclear without them?; §2's date-calendar row; §3's arrows; §4's "One mark, one look" and "No mark glows";
   §5's Tracker exception (D987, D989, D992 — open the rows); §5a's head; §8; "Changing this guide".
3. **The short form's point 2** in `.claude/rules/ui-design.md`: does a rule the old point stated no longer appear, in
   a way that would mislead a job that reads only the short form?
4. **Contradictions and bulk:** does any new sentence contradict a ruling or another guide, or add a rule nobody ruled?
   Does §9's note of the thirteen lessons that left name each one's page correctly (a spot check of three is enough;
   another reader already confirmed each against its page)?

## What a finding is

A finding names the passage, the concrete failure — what a future agent would now do wrong, or which rule it could no
longer find — and the exact words that fix it (D489). Not findings: that a passage could be shorter still, style, a
story or an attribution that left on purpose, anything that lives only in data already stored (D56). If a section is
clean, say so in one line. Close with a count: findings that change meaning · findings of lost detail · nothing.
Keep the report under 1,000 words.
