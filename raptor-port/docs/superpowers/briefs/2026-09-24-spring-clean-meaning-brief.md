# Spring clean — the meaning-check brief (D138), 24 Sep 26

Tier 3. The brief both reviewers were given, kept so the check can be re-run by a later chat. Astra was asked, in addition, to read items 3 and 4 with particular care (they followed a classification Fable wrote); Fable read items 1, 2, 5, 6, 7 (its report: `2026-09-24-spring-clean-meaning-fable.md`).

```text
You are an INDEPENDENT reviewer of a documentation restructuring in the RAPTOR repo (this working directory; branch `claude/spring-clean`, compare with `main` = d0a1bb94 using git). READ-ONLY: do not edit any file. You did not write this change.

THE ONE QUESTION (owner's ruling D138: "a summary must never change what the original meant"): across the whole branch diff (`git diff main...HEAD`), did any RULE, CONDITION, EXCEPTION, DATE or REASON that could change a future decision
  (a) CHANGE its meaning,
  (b) VANISH (it left a file and arrived nowhere), or
  (c) now sit where the sessions that NEED it will not load it?
Loading facts: `.claude/rules/**/*.md` WITHOUT `paths:` frontmatter load in every session; files WITH `paths:` load when a session opens a matching file with the Read tool; `raptor-port/CLAUDE.md` loads when a file under `raptor-port/` is read; everything else is read only when a session goes to it.

READ FIRST: the owner's rulings D138-D144 in `.claude/rules/decisions/how-we-work.md` (D142 is in `oil.md`); the plan `raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-plan.md` — its section 7 overrides sections 1-6. Your reading list: `raptor-port/docs/superpowers/specs/2026-09-24-spring-clean-moves-report.md` — part 1 = every line that LEFT a Markdown file and arrived NOWHERE (each must be a deliberate rewrite or pointer edit — check each against what replaced it); part 2 = every NEW line (the rewrites to read for meaning). Every other line moved byte for byte (you may spot-check: the commit messages list each move).

THE REWRITES TO READ FOR MEANING (compare each with the text it replaced; the replaced text is in `main` and, for most, archived whole):
1. `.claude/rules/shipping.md` (new, always loaded) vs the archived Pages-era bullets in `raptor-port/docs/archive/raptor-claude-md-2026-09-24.md` (and `git show main:raptor-port/CLAUDE.md` lines 173-273 and 530-633). Every live rule there must survive with its date; D143 decides "done".
2. `.claude/rules/doc-structure.md` (new, always loaded) vs D140/D141 and `raptor-port/docs/doc-budget.md`.
3. `HANDOFF.md` (new header, ## Now, ## Next, ## Gate baseline, Standing constraints corrections, Moved index) vs `git show main:HANDOFF.md` and `git show main:HANDOFF-NEXT.md` (their text is archived whole in `raptor-port/docs/archive/handoff-2026-09-24.md`, `raptor-port/docs/gates-and-deploy.md`, `raptor-port/docs/file-map.md`).
4. `OUTSTANDING.md`: the new "Priority — live items only" list vs the archived old list (end of `OUTSTANDING-ARCHIVE.md`); the new items and status lines; the nine items archived (were they really finished, and did every still-needed fact get a live pointer first?).
5. `raptor-port/CLAUDE.md`: the index header, the Coding-conventions records bullet (replacing an archived HANDOFF bullet), the Product-bar/Security/DevOps edits, the Where-things-live rows, the "Moved to the area files" index; and the area files `.claude/rules/decisions/{scheduler,leave-war,tracker}.md` — the new intros, "Where the detail lives", the widened `paths:`, the split performance group.
6. `raptor-port/docs/gates-and-deploy.md` "Now" block; `raptor-port/docs/file-map.md` corrected rows and new rows; `raptor-port/docs/data-schema.md` loose spot 12 and corrections; `raptor-port/docs/engine-rules.md` D142 bullet and the "public" correction; `raptor-port/docs/doc-budget.md`; the pointer edits in the rulings' "Where it lives now" cells, `record-decisions.md`, `DECISIONS.md`, the READMEs.
7. THE SKILL CHANGE (owner ruling D70 — skills are read by BOTH reviewers before he approves): `.claude/skills/session-handoff/SKILL.md` vs `git show main:.claude/skills/session-handoff/SKILL.md`. Also answer: does each change do what D140 intends, does it contradict a guide or a ruling, does it DROP A SAFEGUARD, or add bulk?

NOT FINDINGS (say nothing about them): anything that lives only in stored demo data (D56); the tier-3 evidence files written on this branch (the plan, the two red-team reports, the two classifications, the moves report) — they are records, not rules; line counts (D141 withdrew targets); code under `raptor-port/src` (not touched — code comments that point at moved text are filed as `[DOC-POINTERS-CODE]`).

RETURN numbered findings only where the answer to the ONE QUESTION is yes (or the skill check fails): severity (HIGH = a rule a future session would now break or miss; MEDIUM = meaning blurred or a pointer that no longer lands; LOW = wording), the exact file:line of the new text AND of the original, what changed or vanished, and an EXACT fix (the words to restore or where to put them). If you find nothing in an area, say "nothing" for it. One round only. Compact.
```
