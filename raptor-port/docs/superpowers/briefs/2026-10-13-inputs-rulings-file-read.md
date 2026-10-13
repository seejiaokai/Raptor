# The read of the Inputs pages' rulings file — the reader's brief (13 Oct 26, D802)

You are a fresh reader. You did not make this change. Read-only: change no file but your report; do not commit or push.

## What was done, and on whose word

Open the ruling first, in the shell from the repository root: `grep -h '^| D802 |\|^| D611 |' .claude/decisions-full/*.md`.

**D802 (owner, 13 Oct 26):** the Inputs pages get a rulings file of their own — the Inputs list and calendar, the SANS
calendar, the Calendar window, an input's own window and card — moved out of the scheduler's file, EVERY LINE WHOLE AND
UNREWORDED; the rest of the scheduler's rulings stay one file. *The builder's reading, told to him:* which rulings count
as "the Inputs pages" is decided ruling by ruling from what each governs, and **a ruling that governs both an Inputs
page and the schedule STAYS in the scheduler's file, with the new file pointing at it.**

The change (documents only): `git diff claude/one-date-calendar-step-one-55ba13...HEAD` (this branch is cut from that
one). 104 rulings were moved by the script `raptor-port/scripts/backlog-archive.mjs --rulings --move-rows … --to inputs`:
their short lines from `.claude/rules/decisions/scheduler.md` to the NEW `.claude/rules/decisions/inputs.md`, their full
rows from `.claude/decisions-full/scheduler.md` to the NEW `.claude/decisions-full/inputs.md`. By hand: the new file's
head (its `paths:`, its preamble, its "Also read"); a paragraph in the scheduler file's head pointing at it; the new
file's name in three lists of area files (`.claude/rules/doc-structure.md`, `.claude/rules/record-decisions.md`,
`AGENTS.md`); the map row in `DECISIONS.md`; two size markers in `raptor-port/scripts/docsize.mjs`; D802's own home cell.

## What to check — say for each what you ran or read

1. **Nothing lost, nothing changed, nothing doubled.** For BOTH tiers (short lines, full rows): every D-number that was
   in the scheduler's file on the base is now in exactly ONE of the two files; every row's bytes are identical to the
   base's. Do not take the builder's word — write a small script of your own (in your temp folder, outside the
   repository) that reads the base versions with `git show claude/one-date-calendar-step-one-55ba13:<path>` (on
   Windows Git Bash set `MSYS_NO_PATHCONV=1` for a `rev:path` argument) and compares row by row. Report the counts.
2. **Each of the 104 belongs.** Read every short line now in `.claude/rules/decisions/inputs.md`. For each, does it
   govern ONLY the Inputs pages (the Inputs list and calendar, the SANS calendar, the Calendar window — each date's day /
   night / no fly and the year's holidays — an input's own window and its card, the people picker in that window, who may
   file or change an input, the late cut-off)? Name any that ALSO governs what the schedule, the Scheduler Board, the
   rules engine, the Leave War, publishing or the changes window does — by the builder's reading those must stay in the
   scheduler's file. Open the full row where the short line does not settle it.
3. **Nothing of the Inputs pages was left behind.** Read every short line still in `.claude/rules/decisions/scheduler.md`
   (215). Name any that governs ONLY an Inputs page and should have moved.
4. **The risk D611 named — a ruling sitting in a part that was not loaded.** The new file loads when a file matching its
   `paths:` is read. For the Inputs pages' real files (list them: `ls raptor-port/src/ui raptor-port/src/engine
   raptor-port/src/state raptor-port/e2e`, and the stylesheets under `raptor-port/src/ui/scheduler/`), is there a file a
   chat would open to change an Inputs page that matches NO pattern? Is any pattern wrong (matches nothing)? Are the
   patterns generous enough (D68: a ruling missed costs more than one loaded)?
5. **The pointers.** In the new file's "Also read": is every D-number named there still in the scheduler's file (or in
   `oil.md` where it says so), and does each say what the pointer claims? In the scheduler file's new paragraph: is
   every D-number named there now in `inputs.md`, and described rightly? Is any ruling that crosses the two areas NOT
   named by either pointer and worth naming?
6. **The three lists and the map.** Do `doc-structure.md`, `record-decisions.md` and `AGENTS.md` now name the file in a
   way that reads true in its sentence? Does the map row in `DECISIONS.md` hold exactly the 104? Are the two size
   markers' reasons true (`raptor-port/scripts/docsize.mjs` — the comment gives the sizes)?
7. **Other files that name a moved ruling's home.** Search the live documents for a sentence that says a moved ruling
   "is in the scheduler's rulings" or names `.claude/rules/decisions/scheduler.md` / `.claude/decisions-full/scheduler.md`
   as the place of one of the 104 (`grep -rn "decisions/scheduler.md\|decisions-full/scheduler.md" --include=*.md .`, then
   read each hit that concerns a moved number). In a full row's home cell "this file" means its area's rulings — a moved
   row's "this file" now means the new file: say if any moved row's home cell is made untrue by the move.

A claim is a finding only with the exact line, what is wrong and the exact correction. Where a call is a matter of
judgement (item 2 or 3), say which way you would rule and why, and mark it "judgement".

## Your report

`raptor-port/docs/handpass/parts/rulings/read-opus.md` (create the folder) — the seven items in order, each with what you
ran or read and what you found; then the list of findings. Reply to the host with at most six lines.
