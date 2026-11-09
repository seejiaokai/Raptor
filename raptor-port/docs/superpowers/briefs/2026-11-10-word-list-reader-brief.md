A read of one small working-guide change, blind to any other reader. Read-only: change no file, no commit, no push, no checkout.

Repo C:\Users\User\projects\Raptor, branch `claude/word-list` at 2680d4f31 (one commit on origin/main 230c3db93):
`git diff 230c3db93 2680d4f31`. It adds (1) `raptor-port/docs/word-list.md` — one page of the app's words: the name on screen,
what it means, its name in the code (the backlog item [WORD-LIST], D491: `grep -n -A8 '^### \[WORD-LIST\]' OUTSTANDING.md`;
the ruling's full row: `grep -h '^| D491 |' .claude/decisions-full/*.md`); (2) one row in `raptor-port/CLAUDE.md` §Where things
live naming it; (3) the backlog item's note.

The narrow brief for a guide change: does the new map row say what the item and D491 meant (searched when writing to him or
briefing a reviewer, never loaded in every chat; a term added the moment it is settled)? Does it contradict any guide or
ruling? Does it drop a safeguard or add bulk? For the word list itself: sample at least 30 rows across every section and check
each against `raptor-port/src` — the label really on screen, the code names real, the meaning not contradicted by the code; and
name any row that would mislead someone writing to the owner (a wrong meaning is worse than a missing row). Do not open anything
under `.claude/skill-updates/` or files named `read-*` / `report-*`.

Output: first line APPROVE or REVISE; then each finding: the row or line, what is wrong, the exact replacement text. Short.
