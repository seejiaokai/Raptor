# Scenario design brief — the Leave War's decided Approve / Refuse look (pull request 861)

You design the WALK scenarios for a change you did not build. Hunt for what is MISSING — what a person could meet that
nobody checked — not whether the code is wrong. You are blind to any other designer; do not look for their list.

## The change
Repo worktree with the branch checked out: `C:\Users\User\projects\Raptor\.claude\worktrees\agent-a1fbc1caadb289d7a`
(branch `claude/lw-decide-look-197`, one commit on `main`: `git -C <that path> show --stat HEAD`). Read the diff.

His ruling D2881 (28 Nov 26): wherever the Leave War decides — the bid windows (one-day and drag), the day's list, the
picked-days sheet and Approvals — the decided Approve or Refuse is solid green or red with dark words, reading
"Approved" or "Refused", and wears the same cyan ring the window's picked leave button wears; the other one turns grey
and stays pressable. At rest (waiting) each shows a drawn tick or cross before its word, its words in its own colour and
a faint edge of it. Size, height, row, place and words unchanged; a second tap on the lit one still sends the entry
back to waiting. The agent's readings: the ring is the lit leave button's own (2px cyan, 2px off the edge), never a
glow; the greyed one keeps its tap target; the same look in Approvals, where a just-decided line stays put (D1421).
Drawing of record: `raptor-port/docs/mock/2026-11-27-decide-buttons/img/trio-E3-phone.png` and `-desktop.png` — on the
branch `claude/leave-points-notifications-7a2f04` (read it with `git show origin/claude/leave-points-notifications-7a2f04:<path>`
or from `C:\Users\User\projects\Raptor\.claude\worktrees\leave-points-notifications-7a2f04-b1b885\<path>`).

Rulings to read (full rows: `grep -h '^| D1427 |' .claude/decisions-full/*.md` in the notes worktree above): D2881,
D2880, D1361, D1427, D1421, D1441, D1355, D1330, D842 (one ring when the keyboard is on a picked answer), D1467.
Area page: `.claude/rules/decisions/leave-war.md` (in the notes worktree). Design rules: `.claude/rules/decisions/design.md`
(no mark glows; one mark, one look). How walk scripts and scenarios are written: `raptor-port/docs/walk-scripts.md`;
the lessons a walk must check against: `raptor-port/docs/bug-check-order.md` §7.11 (read it — name the lessons that apply).

## What is NOT a finding (do not design for it)
- A problem that lives only in demo data already stored (D56).
- A scheduler who is not an admin (D785) — a member is in scope.

## What to return
Your final reply is your report (write nothing into the repo). Start with `SCENARIOS lw-decide-look`. Then a numbered
list, at most about 25, most likely-to-break first. Each: the place (the app's own name), who is signed in (admin
`ad`/`a` or member `us`/`us`), the size (390, his iPhone's 402, desktop 1536), the set-up, the presses, what the
picture must show (pass/fail in plain words), and which ruling or lesson it checks. Cover at least: every place in each
state (waiting / approved / refused), the greyed one pressed (does it decide the other way at once?), the second tap
back to waiting, a picked range, a member's view, keyboard focus on a decided button (one ring), Approvals' line staying
put, the phone's narrow widths (words and mark inside the edge, the half-day date on one line), and anything else you
judge missing.
