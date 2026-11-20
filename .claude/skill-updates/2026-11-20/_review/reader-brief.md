# The readers' brief — the skill-notes review of 20 Nov 26 (chats 120 and 121)

You are one of two independent readers of a set of drafted changes to this project's working guides and skills. The
other reader works blind to you and you to them: do not look for, open or ask about any other reader's report, and do
not read anything under `.claude/skill-updates/2026-11-20/_review/` whose name starts with `read-`. Change no file:
your whole report is your final message, saved word for word by the coordinator. (Who reads a guide change, and why
two: his rulings D70, D1761, D1770 — a working-guide change is read before his approval by Astra and a fresh, blind
Opus reader, one round each, never by its writer.) Paths below are from the repository root.

## What you are reading

The repository is a project for a non-technical owner. The task-observer skill keeps a log of notes about how the
project's guides could improve (`.claude/skill-observations/log.md`; twelve notes held only on other branches are
copied into `.claude/skill-updates/2026-11-20/_review/branch-notes.md`). This review sorted the 69 open notes and
drafted the changes; the owner approved the four rounds of recommendations put to him (D2230), and this read comes
before his final approval of the drafted text. **Nothing is live:** each draft sits at
`.claude/skill-updates/2026-11-20/<the live file's path>`; the whole change, live to draft, is
`.claude/skill-updates/2026-11-20/_review/diff.patch` (14 files). Every note's disposition is one row of
`_review/dispositions.md` (its head explains the codes: APPLY — a draft carries it; REFLECTED — already written where it
belongs, the place named; FILED — a backlog item carries it, drafted in `_docs/OUTSTANDING-items.md`; MEMORY — a memory
note, drafted in `_memory/additions.md`; OPEN — stays open). The helpers' brief, with the rules they followed (where
lessons may land, size, stale lines): `_review/helper-brief.md`. Their reports, with the places they were least sure of:
`_review/report-*.md` (§Doubts). The rule files every chat loads: `.claude/rules/*.md` and
`.claude/rules/decisions/how-we-work.md`; the screen-design rulings `.claude/rules/decisions/design.md`. A ruling's
full row: `grep -h '^| D2230 |' .claude/decisions-full/*.md`.

## Your brief — narrow (D70's read of a guide change)

For each changed passage in `diff.patch`:
1. **Does it say what its note meant?** Open the note (`### Observation N:` in the log, or in `branch-notes.md`) for a
   sample of at least 30 APPLY rows spread across every drafted file, and every row named in the doubts below. A line
   that says more than its note (a rule from one case stated as universal), less (the point lost), or something else,
   is a finding.
2. **Does it contradict a guide or a ruling?** Check against the always-loaded rule files, the general rulings page and
   the area page a line touches; open a ruling's full row before relying on it. A line that attributes a lesson to the
   owner, or invents a ruling, is a finding.
3. **Does it drop a safeguard?** Every deleted or reworded line in the diff: what did it protect, and does the new text
   still protect it?
4. **Does it add bulk?** A line that restates another line in the same or an always-loaded file, a lesson two lines
   could carry in one, a section that grew past what its notes need. Name the lines to cut or merge.
5. **The dispositions:** sample at least 10 REFLECTED, FILED and MEMORY rows — is the lesson really written in the place
   named, or really carried by the item named (the live `OUTSTANDING.md` item plus the drafted additions)?
6. **The cross-references:** the drafted additions to the backlog item `[CHECK-TOOLS-HARDEN]` are lettered (s) to (z),
   after its existing (a) to (r); check every draft that cites one of those letters points at the right point.

**Run the drafts, do not only read them** (the review guide's Step 8): apply at least three drafted rules to a named
real case from the repo's history (an evidence sheet under `raptor-port/docs/handpass/`, a handoff block in git, a note's
own story) and show the result; construct one case that passes every drafted rule and is still wrong.

## The writers' own doubts — read these first

- **980** (bug-check order §4, "Before a brief leaves", the new bullet on each reader's brief holding only its own job):
  does it say what the note meant — a brief's paragraphs placed by each reader's job when written, a stopped run's notes
  chased — and nothing that reads as rewording a brief to get a run past a provider's check after it stopped?
- **978** (the same order's blindness paragraph) and **954, 977, 981** (the codex guide's recipe, now five steps): is the
  recipe complete and runnable as written, and does the order's clause match its step 2?
- **919** (the order §7.11 and its checklist): the second lesson 23 renamed 23b, with a note that older sheets cite it
  as "lesson 23" — is the rename safe for every place in the repo that cites "lesson 23"?
- **949, 952** (the design guide §1a, test 9): "a second reading the line above or the word list settles is recorded,
  not sent back" — does it loosen the approved cold-read method (D825, D832, D836)?
- **960** (the mock-up guide step 3): a tag laid on the page from the element's box, where the element cannot hold one —
  does it clash with the same paragraph's ban on marks laid over the page?
- **941** (the test-driven-development skill, Verify GREEN): a new or changed test file passes the pipeline's own type
  check — the right home, given the project's type check may not cover its browser-test folder?
- **972, 979** (the same skill, "Read the red"): does the longer paragraph still read clearly?
- **916, 917, 921, 923** (the handoff guide, Step 1's own-folder sentence): the hard-coded worktree path; a tool
  (`ListAgents`) that may not exist in every chat.
- **920** (the handoff guide's RESOLVED item): the mechanism stated — is it enforceable as written?
- **The handoff guide's cut** of its "Look before the push" paragraph: is every point it carried still in an
  always-loaded file?
- **The overnight guide's compaction figures**, moved to his ruling D2229 (about 600,000): true to D2229's full row?
- **922, 924, 925** (doc-budget §2, a new bullet): the right home, or already said elsewhere?
- **951, 968** FILED rather than REFLECTED: does an item add anything the rulings do not already require?
- **931 and 928**, placed by the coordinator into the subagent-driven-development skill and the test-driven-development
  skill; **the register's change 8** (`.claude/skills/SUPERPOWERS-VENDORED.md`): does each row list what the drafts
  actually change in those three skills, and nothing they do not?
- **Size:** the mock-up guide grew about 18%, the handoff guide about 5%. Name what to cut.

## Your report

Start with a verdict line: APPROVE / REVISE / REJECT. Then each finding numbered, with: the file and the passage (quote
it), the note or ruling it is checked against, what is wrong and the concrete consequence, and **the exact replacement
text** (or "delete this line"). Write each finding down as soon as you have confirmed it, so a run that stops keeps what
it found. A claim with no concrete failure is not a finding — put it under "Notes" instead. Keep the house style the
guides use: plain words, the ruling numbers cited. End with the list of rows you sampled.
