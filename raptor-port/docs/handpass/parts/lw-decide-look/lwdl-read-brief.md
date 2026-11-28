# Code read brief — pull request 861, the Leave War's decided Approve / Refuse look

You read finished code you did not write, blind to any other reader and to any walk report. Read-only: change no file.

## The change
Worktree with the branch checked out: `C:\Users\User\projects\Raptor\.claude\worktrees\agent-a1fbc1caadb289d7a`
(branch `claude/lw-decide-look-197`, one commit on `main`: `git -C <that path> show HEAD`). Read the whole diff and every
caller of what it changes (`decideLook`, `DecideMark`, the `dec-ring` / `dec-off` / `dec-ic` classes).

The ruling it builds (D2881, 28 Nov 26): wherever the Leave War decides — the bid windows (one-day and drag), the day's
list, the picked-days sheet and Approvals — the decided Approve or Refuse is solid green or red with dark words
("Approved" / "Refused") and wears the same cyan ring the window's picked leave button wears; the other turns grey and
stays pressable. At rest each shows a drawn tick or cross before its word, its words in its own colour and a faint edge
of it. Size, height, row, place and words unchanged; a second tap on the lit one still sends the entry back to waiting.
In Approvals a just-decided line stays put (D1421). Full rows (in the notes worktree
`C:\Users\User\projects\Raptor\.claude\worktrees\leave-points-notifications-7a2f04-b1b885`):
`grep -h '^| D2881 |' .claude/decisions-full/*.md` — also D1361, D1427, D1421, D1441, D1330, D1355, D842, D1544.
Rules to load by hand: `.claude/rules/raptor-executor.md`, `.claude/rules/ui-design.md`, `.claude/rules/decisions/design.md`,
`.claude/rules/decisions/leave-war.md`, `raptor-port/CLAUDE.md` (in the notes worktree).

## What counts as a finding
A concrete failure a person meets (who, where, what they press, what they see), its cause in the code (file and line),
and its fix. Write each claim so it could be turned into a failing test. Not findings: a problem only in stored demo
data (D56); a scheduler who is not an admin (D785); style preferences with no effect on screen or behaviour.
Look especially at: every state × place combination, keyboard focus on decided and greyed buttons, disabled (held)
buttons, what happens to state classes when the entry changes under an open window, the CSS cascade (specificity,
media queries at phone widths, a rule that leaks to another surface using the same class names), tests that pin the
wrong thing or would pass on a broken build.

## The tidiness note (filed, not fixed — D489)
At the end, three questions of the changed lines only: is anything duplicated that has one home already; is anything
named so the next reader would misread it; is any comment untrue. No size numbers.

## Your final message (your report)
Start with `READ lw-decide-look`. Numbered findings, most serious first, each: severity (high / medium / low), what a
person meets, cause (file:line), fix (exact). Then "Checked and fine:" — what you checked that held. Then the tidiness note.
