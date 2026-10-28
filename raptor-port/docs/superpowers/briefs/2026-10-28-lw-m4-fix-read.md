# The M4 fixes' read — a fresh, blind Opus reader's brief (the night of 27–28 Oct 26; the bug-check order §5, "A fix is new code")

You did not write these fixes and have not seen the chat that did. Read ONLY the fix commits and the findings they answer,
and say, for each: is the fix right and complete, and what did it break beside it? A claim is a finding only with a concrete
failure (the steps, what the person meets), its cause in the code and its exact fix (D489). **Read-only: change no file but
your report; do not build, run browser tests or commit.** You may run a unit test file (`npx vitest run --project leavewar
<file>` from `raptor-port/`) in the read-only copy if its `node_modules` works there; say if it did not.

**Where:** a read-only copy at commit da770b233, `C:/m4f`. **The fixes:** `git -C C:/m4f diff 3ad84df65 da770b233 -- raptor-port/src raptor-port/e2e`
(nine commits, `git -C C:/m4f log --oneline 3ad84df65..da770b233`). **The findings they answer:** the evidence sheet
`raptor-port/docs/handpass/2026-10-27-lw-m4.md` §11 (M1–M13), with the reports it names in `raptor-port/docs/handpass/parts/lw-m4/`;
the builder's own account `parts/lw-m4/fixes-night.md`; the walk of the fixes `parts/lw-m4/rewalk2.md`. The rulings:
`.claude/rules/decisions/leave-war.md` (a full row: `grep -h '^| D1421 |' .claude/decisions-full/*.md`).

**Ask hardest:** M1 / M2 (a day of two halves — every path that finds "the leave of this request": approve, second tap,
refuse, stale, the bell's before/after; a whole day beside two halves; a run across days where only one day has another
half); M3 / M7 (the lit light after Undo, Redo, a grid change — can a line now show a light the record does not hold, or drop
one it does?); M5 (one posting-out rule in `approveWhy` — every door that approves: the bid window, the drag window, the day's
list, Approvals, Approve all, "Approve what I enter"); M10 (the stamp guard — can a member's ordinary bid, move or Undo now be
refused?); M4 (a press outside the open calendar is swallowed — can it swallow a press it should not, a press inside it, the
keyboard?); M9 (the "again" line now names the line it repeats — every reader of a notice still right?); twin paths the
builder's tests do not hold.

**Not a finding (D56):** a problem only in data already stored, the code right going forward. **Your report:**
`raptor-port/docs/handpass/parts/lw-m4/fix-read.md` in the WORKING checkout
(`C:/Users/User/projects/Raptor/.claude/worktrees/leave-war-m4-planning-2c0623/`), returned as your final message: findings
numbered, severity, steps, cause, exact fix; then, a line per fix, "right and complete" or what is missing.
