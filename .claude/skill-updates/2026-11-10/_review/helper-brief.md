# The skill-notes review of 10 Nov 26 — the brief for each sorting-and-drafting helper

You are one of five helpers, run one after another, in the overnight skill-notes review (chat 49). Each takes one group
of OPEN notes from `.claude/skill-observations/log.md` (the groups: `_review/groups.json` beside this file), decides what
each note becomes, and drafts the guide changes. The coordinating chat does the records, the commits and the two blind
reads afterwards. Repo root: `C:\Users\User\projects\Raptor`; branch `claude/skill-notes-review-2026-11-10` (do not switch
it). The review's method is the task-observer skill's `references/weekly-review.md` Steps 3–5 and its "Delivering
updated skills" section, as this repo runs it: `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo — read
both first. The last review's table, for its style: `git show 38e509fd6^:.claude/skill-updates/2026-10-27/_review/dispositions.md`
(set `MSYS_NO_PATHCONV=1` in Git Bash first).

## What you write — and nothing else

- **Drafts** at `.claude/skill-updates/2026-11-10/<the live file's repo-relative path>`. The first time you touch a file,
  copy the LIVE file there first (`cp`), then edit only the copy. An earlier helper may already have drafted it: then
  edit their draft, keeping their changes. NEVER edit a live file — not a skill, a document, a rule file, the log,
  `HANDOFF.md`, `OUTSTANDING.md`. Write edit scripts to a file and run it; in Node use `s.replace(a, () => b)`, never a
  string replacement (a `$'` in prose doubles text); keep line endings as the file has them.
- **Your table**: `_review/dispositions-<your group>.md`, one row per note of your group, exactly this shape (a script
  reads it): `| <number> | <CODE> | <where it lands, or why> |` — the third cell one line, no `|` inside it.
- **Additions**, appended (never overwritten — an earlier helper may have written there): backlog items to file →
  `_docs/OUTSTANDING-items.md` (each a full item text in the shape of `OUTSTANDING.md`'s items, with a proposed ID in
  capitals and square brackets — check the ID is not already used: `grep -n '\[ID\]' OUTSTANDING*.md`); memory notes →
  `_memory/additions.md` (name, one-line hook for the index, the body — the memory format is in any file of
  `C:\Users\User\.claude\projects\C--Users-User-projects-Raptor\memory\`); questions for him → `_review/questions.md`.
- **Your report** (returned as your final reply — the tool refuses a helper's write of a report file; the coordinator
  saves it as `_review/report-<your group>.md`): the counts per code, the files you drafted and what changed in
  each (a line per change, naming the notes), the places you were unsure (the readers will be pointed at them), and any
  stale line you met (below).
- Do not commit, push, or run the gates. Do not start other helpers.

## The codes

`APPLY` a draft carries it (name the file and section) · `REFLECTED` already written where it belongs (name the place —
you must have read it there, today) · `FILED` a backlog item carries it (an existing item you have read, or one you add to
`_docs/OUTSTANDING-items.md`) — the home for a lesson that is really a tool to build or a check to automate · `MEMORY` a
memory note carries it (how to work with HIM, or a trap of this PC; drafted in `_memory/additions.md`; check the existing
memory notes first — extend one rather than add a near-copy) · `ASK` recommend closing it with no change, his word (say
why in the cell, and add a line to `_review/questions.md`) · `OPEN` stays open (a new skill candidate needs his call —
weekly-review's Constraints: no new skills in a review; or the evidence is too thin — say which).

## Where lessons land (settled by the earlier reviews; follow it)

In the skills under `.claude/skills/` (a few lines in the section they belong to, or a reference file inside the skill
for longer material); in the project's method documents — `raptor-port/docs/bug-check-order.md` (BCO),
`raptor-port/docs/walk-scripts.md` (WS), `raptor-port/docs/gates-and-deploy.md` (GD), `raptor-port/docs/design-practices.md`
(DP; words, keyboard, layout), `raptor-port/docs/codex-guide.md` (for the claudex-loop plugin, which lives outside the repo
and cannot be edited), `raptor-port/docs/doc-budget.md`; and in the vendoring notes' register of local changes
(`.claude/skills/*-VENDORED.md`) for every change to a vendored skill (superpowers, impeccable, task-observer, find-skills).
**Never** in `raptor-port/CLAUDE.md`, `.claude/rules/` (the always-loaded rule files and the rulings pages under
`.claude/rules/decisions/` — they are size-capped and changed only by the rules diet or a ruling), `.claude/hooks/`,
`.claude/settings*.json`, `AGENTS.md`. A lesson whose only right home is one of those: `FILED` (or `ASK`), not drafted.
If BCO changes a step that `raptor-port/docs/bug-check-checklist.md` names, draft the checklist's line too.

## How to judge each note

1. Read the note whole. Then search for its lesson where it would already live (BCO, WS, GD, DP, the skills, the rule
   files, `raptor-port/docs/guide-full.md`, `OUTSTANDING.md`, the memory notes) — by its subject, not its phrasing. Many
   lessons were fixed where they hurt and left OPEN: those are `REFLECTED`, naming the place.
2. A rule broken more than once needs enforcement (a check, a script, a refusal), not louder words — that is `FILED`
   to a tool item, with the guide pointing at it at most.
3. Ask "what can we remove?" as hard as "what should we add?" A rule from one unproven case, a step always skipped,
   complexity that never triggered, two rules that contradict: draft the cut or the merge, and say why in your report.
4. **Size:** the project just finished a diet of what agents read (the rules diet, D1735; no size targets but every
   line must earn its place, D141). Prefer sharpening an existing line to adding one; merge near-duplicates; a lesson is
   one to three lines in the section where it applies, house style (plain words, the ruling numbers cited where a line
   states one of his rulings). Never invent a ruling or attribute a lesson to him; a note's lesson is the agent's own.
5. A lesson that holds his or the project's specifics stays out of the vendored skills' general text — put it in the
   project's documents or a clearly marked project section.
6. Two notes on the same lesson: one change, both rows naming it.

## Stale lines (D201: the later ruling wins, and what the old one left behind is fixed)

In every file you draft, if a line plainly contradicts a later ruling — for example who reads what now (Astra is the
standing reviewer again, D1770; a working-guide change is read by Astra and a fresh, blind Opus reader, D1761; walks
stay on his PC, D1797; the rulings pages and the rules diet, D1735) — fix it in the draft citing the ruling, and list it
under "Stale lines fixed" in your report. Check a ruling's full row before relying on it:
`grep -h '^| D1770 |' .claude/decisions-full/*.md`. Do not go hunting through files you are not otherwise drafting.

## When you finish

Check your table has exactly one row per note of your group (a script will check it too), every APPLY's file exists in
the holding folder, and your report lists your doubts. Then reply with the whole report (it is saved as you send it),
ending with the three places you are least sure of. If a write of a draft, table or addition is refused, say so.
