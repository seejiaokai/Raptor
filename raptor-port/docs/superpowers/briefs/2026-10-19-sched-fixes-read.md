# Brief — the fresh code read of the Schedule-and-amendments small-fixes batch (19 Oct 26)

**Reader:** a fresh Opus 5.5 reader that wrote none of this code and has seen neither the walk's reports nor any other
reader's (D790; Astra and Sol 6.1 unavailable — D761 — so this job goes on `OUTSTANDING.md` `[NO-ASTRA-LIST]`).
Read-only: change no file except your report file. Run nothing that builds or serves (the PC's check lock is the
host's); reading code, git history and running ONE unit test file at a time (`cd raptor-port && npx vitest run <file>`)
is fine.

**What to read:** the branch `claude/schedule-amendments-fixes-fffce0` at its head against `origin/main`:
`git diff origin/main...HEAD -- raptor-port/src`, `git log origin/main..HEAD` (each commit says what it changed and why).
The rulings that govern it: `.claude/rules/decisions/scheduler.md` (short lines; open a full row before relying on its
detail: `grep -h '^| D594 |' .claude/decisions-full/*.md` — the shell), and `how-we-work.md`. The project guide:
`raptor-port/CLAUDE.md` (the mutation and persistence funnels, the command layer). The bug-check order §4 (the finder
wording below) and §2b.

**The batch** — 21 backlog items (names in the commit subjects): the In-time / Rally drag on the Scheduler Board and its
sort (D593, D594) with its "To go out" words; warning sentences on SC and blank lines; the crew list's strike and hint on
standby seats and seats with no hours; the SC SPARE's leave ring; the changes window's and history's words and new
history lines; the discard count of "Discard N edits & load"; the board's layers (the "Set as default" offer, notes);
the "Breaks <day>" focus; the landing flash; Undo's words; a drag's edge band on a short pane; the desktop week after a
resize; one click after a changed text box takes the caret (`ui/textedit.ts textCaret`, the box under a press counted
as the caret); the Tab route onto a control after the day's last box (`ui/schedule-tab.ts`); and tests only for
`[CRP-FLAG]`, `[OFT-ADD-TWICE-SILENT]`, `[AMEND-SMALL-SEEN]`.

**The finder wording — use it:**

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

Look hardest at: a write that skips the mutation funnel or is saved outside its command (the In-time reorder; the new
history lines); a published day — a change waiting, the four sign-offs, a drag back netting to nothing, Undo past a
publish; the caret rule (`ARRIVING`) — any state in which it could stay set and hold a repaint back for good, or let a
box be written by the wrong blur; the Tab route's new redraw before a control is focused (`flushSync`) — what else it
could set off; a reorder of In-time lines while the caret is in one of them.

**Each finding:** the concrete failure (setup → action → what goes wrong, on screen or in what is saved), its cause
(file and the missing or wrong line), whether it is new on this branch or already on `main` (check `main`), and the
exact fix, step by step. A claim is a finding only with all three (D489). Explicit negatives too ("I checked X and found
nothing").

**Report:** `raptor-port/docs/superpowers/briefs/2026-10-19-sched-fixes-read-report.md`; return a short summary.
