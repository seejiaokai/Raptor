# Skill review 23 Sep 26 — handoff (deleted once installed and merged, D69)

Branch `claude/skill-review` (from `main` 6efa6839). Nothing under `.claude/skills/`
is changed yet: every change is a DRAFT in this folder, waiting for the owner's
approval of the numbered groups in `_install/dispositions.py` (GROUPS 1-13, plus H =
close the already-covered and declined notes).

## Install, after he approves (run from the repo root, git-bash)

1. `D=.claude/skill-updates/2026-09-23; L=.claude/skill-observations/log.md`
2. Copy each APPROVED group's drafts over the live files (same relative paths;
   `_hooks/` → `.claude/hooks/`; `_notes/*.md` → `.claude/skills/`). Group → files:
   1 verification-before-completion/{SKILL.md,browser-checks.md}, and run
   `python $D/_install/claude_md_token_discipline.py` (the rulebook's "pipe logs"
   sentence; same 11 lines, refuses if the paragraph changed) ·
   2 systematic-debugging/{SKILL.md,device-only-bugs.md} ·
   3 test-driven-development/{SKILL.md,writing-good-tests.md} · 4 writing-plans/ ·
   5 subagent-driven-development/ (SKILL.md, the three prompt files, scripts/task-brief —
   keep it executable) · 6 dispatching-parallel-agents/ · 7 brainstorming/ ·
   8 session-handoff/ + executing-plans/ · 9 requesting-code-review/ + receiving-code-review/ ·
   10 using-git-worktrees/ · 11 task-observer/ (SKILL.md + references/weekly-review.md) +
   `_hooks/` + `_notes/TASK-OBSERVER-VENDORED.md` ·
   12 copy `_config/.impeccable/config.json` to `.impeccable/config.json` (made by the
   checker's own `hook-admin.mjs`; skips `raptor-port/src/engine/**` and `**/*.test.*`) ·
   13 append `_memory/additions.md`'s four blocks to the named memory files.
   Superpowers groups (1-10) also take `_notes/SUPERPOWERS-VENDORED.md` — drop the
   table rows of any group he declined.
3. Statuses: `python $D/_install/dispositions.py emit <groups|all> $(date +%F) /tmp/st.json`
   then `python $D/_install/logtool.py status $L /tmp/st.json`
   (check first: `python $D/_install/dispositions.py check $L` must say PASSED).
4. The owner's two questions: #75 (bug-testing tracker: keep → add a line to
   session-handoff Step 3; retire → close #75 DECLINED and mark the tracker retired in
   `BUG-TESTING.md` + `HANDOFF.md`'s file map) and #120/#122 (a new "whole app as a tab"
   guide: later → leave OPEN; no → DECLINED). #42 stays OPEN (needs a code change).
5. Archive the same day (D69):
   `python $D/_install/logtool.py archive $L .claude/skill-observations/archive/log-$(date +%F).md`
6. `echo $(date +%F) > .claude/skill-observations/last-review-date.txt`
7. The second, machine-local log: replace
   `~/.claude/projects/C--Users-User-projects-Raptor/memory/skill-observations/log.md`
   with a 3-line stub pointing at the repo log (its 3 entries are #183-#185 here), and
   its `last-review-date.txt` with the same date as step 6.
8. `git rm -r $D` (this folder — git keeps the drafts), commit, push. It then awaits
   his "merge live".

## Reviews (D68) and what was left out

Fable and Astra each read the drafts once; both said REVISE. Every point was
checked and fixed (tested where it was a command), except one: Astra's note that
`raptor-port/CLAUDE.md` still describes GitHub Pages as the official site, the
"wait for Pages" step and the Pages URL, all stale since D59. That is a rulebook
correction, not a skill change, and "what counts as live now" is his call — put to
him as its own small job, not done here.

## When this branch and `claude/all-avail-window` both reach `main`

- `.claude/skill-observations/log.md` will conflict. Keep THIS branch's version, then
  re-append that branch's own new entries (it holds #179-#182, maybe more) at the end
  with fresh numbers after this branch's highest (#190), correcting any
  cross-references between them. Numbering rule: `.claude/skills/task-observer/SKILL.md`
  Numbering discipline, item 4.
- `DECISIONS.md`: this branch adds D68-D69; that branch holds D61-D67. Keep both; if
  that branch reached D68 or beyond, renumber this branch's two and their mentions in
  `.claude/skills/TASK-OBSERVER-VENDORED.md`.
