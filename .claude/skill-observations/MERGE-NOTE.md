# Merge note — delete this file once `claude/skill-review` AND `claude/all-avail-window` are both on `main` (owner, D69)

`claude/skill-review` reviewed this notebook on 23 Sep 26: every resolved note moved to
`archive/log-2026-09-23.md`, and the active `log.md` keeps only #42, #120 and #122.
`claude/all-avail-window` was appending new notes (#179-#182, maybe more) to its own copy of
the old, full `log.md` at the same time. Whichever merges second:

1. **`log.md` conflicts.** Keep the reviewed side (the three-note file). Then re-append the
   other branch's NEW entries only — those it added after `main` 6efa6839, from #179 on — at
   the end, renumbered after the highest number already used (#190, in the archive), and fix
   any cross-references between them. Rule: `.claude/skills/task-observer/SKILL.md`
   Numbering discipline, item 4.
2. **`DECISIONS.md`.** D69 is on both branches with the same words — one ruling: keep ONE row,
   carrying both applications. This branch adds D70-D73; if the other branch has used D70 or
   beyond, renumber this branch's four past its highest, and update their mentions in
   `DECISIONS.md`, `HANDOFF.md` and `.claude/skills/TASK-OBSERVER-VENDORED.md`.
3. Then delete this file.
