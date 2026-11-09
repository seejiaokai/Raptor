# The readers' brief — the skill-notes review of 10 Nov 26 (chat 49)

You are one of two independent readers of a set of drafted changes to this project's working guides and skills. The
other reader works blind to you and you to them: do not look for, open or ask about any other reader's report, and do
not read anything under `.claude/skill-updates/2026-11-10/_review/` whose name starts with `read-`. Change no file:
your whole report is your final message, saved word for word by the coordinator. (Who reads a guide change, and why
two: his rulings D70, D1761, D1770 — a working-guide change is read before his approval by Astra and a fresh, blind
Opus reader, one round each, never by its writer.)

## What you are reading

The repository is a project for a non-technical owner. The task-observer skill keeps a log of notes about how its
guides could improve (`.claude/skill-observations/log.md`); tonight's review sorted all 160 open notes and drafted the
changes. **Nothing is live:** each draft sits at `.claude/skill-updates/2026-11-10/<the live file's path>`; the whole
change, live to draft, is `.claude/skill-updates/2026-11-10/_review/diff.patch`. Every note's disposition is one row of
`_review/dispositions.md` — codes APPLY (a draft carries it), REFLECTED (already written where it belongs — the place
named), FILED (a backlog item carries it — the drafted items in `_docs/OUTSTANDING-items.md`), MEMORY (a memory note,
drafted in `_memory/additions.md`), ASK (recommend closing, his word — `_review/questions.md`), OPEN. The helpers'
brief, which states the rules they followed (where lessons may land, the "never" list, size, stale lines): 
`_review/helper-brief.md`. Their own reports, with the places they were least sure of: `_review/report-*.md`.

## Your brief — narrow (D70's read of a guide change)

For each changed passage in `diff.patch`:
1. **Does it say what its note meant?** Open the note (`### Observation N:` in the log) for a sample of at least 30
   APPLY rows spread across every drafted file, and every row in the doubts below. A line that says more than its note
   (a rule from one case stated as universal), less (the point lost), or something else, is a finding.
2. **Does it contradict a guide or a ruling?** Check against the always-loaded rule files (`.claude/rules/*.md`), the
   general rulings page (`.claude/rules/decisions/how-we-work.md`) and the area page a line touches; open a ruling's
   full row before relying on it: `grep -h '^| D1770 |' .claude/decisions-full/*.md`. A line that attributes a lesson to
   the owner, or invents a ruling, is a finding.
3. **Does it drop a safeguard?** Every deleted or reworded line in the diff: what did it protect, and does the new text
   still protect it?
4. **Does it add bulk?** A line that restates another line in the same or an always-loaded file, a lesson two lines
   could carry in one, a section that grew past what its notes need. Name the lines to cut or merge.
5. **The dispositions:** sample at least 15 REFLECTED and FILED rows — is the lesson really written in the place named,
   or really carried by the item named? A REFLECTED row whose place does not carry the lesson is a finding.

**Run the drafts, do not only read them** (the review guide's Step 8): apply at least three drafted rules to a named
real case from the repo's history (an evidence sheet under `raptor-port/docs/handpass/`, a handoff block in git) and
show the result; construct one case that passes every drafted rule and is still wrong; for the stale-line fixes (who
reads what now), tabulate each rewritten line against the ruling it cites.

## The writers' own doubts — read these first

- **875** (bug-check order §7.0, walk-scripts §10): the drawing check gains an alternative to "a part list first" — a
  drawing script's own measured figures. Does it narrow, or weaken, the wording he approved "as drafted" (D1494, D1495)?
- **893** (bug-check order §0a step 3, the checklist step 3): "a FULL check whose chat starts past about 40% names its
  two chats" — from one case; does it clash with his compaction and handoff rulings (D868, D871, D874)?
- **The overnight guide's D1443 paragraph**: "beside Low or Medium?" and "the recommended one taken" when no question is
  open — true to D1443 and D1104 together?
- **The stale-line rewrites of who reads what** (bug-check order §4 and §4a; the overnight guide steps 5 and 7, Part 2,
  the morning checklist): each against D1734, D1760, D1761, D1770 and D761.
- **The handoff guide's own-folder clause (787, 831)**: does it send a chat started in a worktree into a write the
  tools refuse (a chat in a worktree is refused writes into another worktree)?
- **[BUGCHECK-LESSON-ORDER]** (the bug-check order §7.11 and its checklist): the second lesson 23 moved whole into §7.11
  and kept its number; lesson 7 before 8; a new one-line 24 in the checklist — is the new line true to lesson 24, and is
  every moved text unchanged byte for byte (`git diff --word-diff` on the moved blocks)?
- **[MAIN-CHECKOUT-STALE] step 2** (the gates guide's main-checkout paragraph, matched in the handoff guide): is the
  "bring the main folder level" recipe safe for a folder that may hold another chat's work?
- **The doc-budget "peek" line (843)** against doc-structure's "Before planning or editing in an area, open its file
  yourself".
- **Size:** walk-scripts grew about 19%, the mock-up guide about 45%, the handoff guide about 15%. Name what to cut.
- **ASK rows** (751, 909, and any other): is closing right, or should the note stay open?

## Your report

Start with a verdict line: APPROVE / REVISE / REJECT. Then each finding numbered, with: the file and the passage (quote
it), the note or ruling it is checked against, what is wrong and the concrete consequence, and **the exact replacement
text** (or "delete this line"). A claim with no concrete failure is not a finding — put it under "Notes" instead. Keep
the house style the guides use: plain words, the ruling numbers cited. End with the list of rows you sampled.
