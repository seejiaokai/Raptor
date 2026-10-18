# Brief — scenario design for the Schedule-and-amendments small-fixes batch (D994), 19 Oct 26

**Reader:** a fresh Opus 5.5 reader that wrote none of this code (bug-check order §4 rank 1; Astra and Sol 6.1 are
unavailable — D761, D790 — so this job goes on `OUTSTANDING.md` `[NO-ASTRA-LIST]`). Read-only: change no file except
the one report file named at the end.

**Branch:** `claude/schedule-amendments-fixes-fffce0` at its head. Compare with `origin/main` for what changed:
`git diff origin/main...HEAD -- raptor-port/src` and `git log origin/main..HEAD`.

## What to read first

- `raptor-port/docs/bug-check-order.md` §4 (the finder wording), §7.0, §7.1, §7.4.
- `raptor-port/docs/walk-scripts.md` (how a walker's scenario is written — EXPECTED lines a walker can judge).
- The rulings: `.claude/rules/decisions/scheduler.md`, `inputs.md`, `how-we-work.md` (short lines); open a full row before
  relying on its detail: `grep -h '^| D594 |' .claude/decisions-full/*.md` (the shell).
- Each item's backlog entry in `OUTSTANDING.md` (search `### [ID]`), and each commit message (they say what changed).

## The batch — 21 backlog items on one branch, one check (D485)

Built earlier on this branch (commits `0df4b36a3`, `6a6509fff`, `7062a2963`, `4c328fb02`, `d401fbc02`):
- `[INTIME-LINES-DRAG]` + `[PEND-INTIME-WORDS]` — In-time / Rally lines drag into order on the Scheduler Board only
  (D593, D594); a wave's Auto sort and Sort all order them by time (an evening-before clock first, no clock last); a new
  order on a published day is a change waiting; "To go out" names the lines that changed ("order changed" for a drag).
- `[SC-INTIME-REST-WORDS]` `[SC-BLANK-SHIFT-QUAL]` `[BLANK-LINE-SANS-WORDS]` `[BLANK-STANDBY-STRIKE]`
  `[BLANK-SEAT-ACTIVITY-HINT]` `[SC-SPARE-RING-BORROWS]` — the warning sentences on SC and blank lines; the crew list's
  strikes and hints on standby seats and seats with no hours; the SC SPARE's leave ring.
- `[SC-B-CHANGE-SAYS-BRIEF]` `[BOARD-INTIME-JUMP]` `[BLOCK-NO-HISTORY-LINE]` `[DISCARD-FILING-NOOP]` — the changes
  window / change history words and lines; the discard count of "Discard N edits & load".
- `[SECDEFAULT-OFFER-BEHIND-BOARD]` `[BUBBLE-SMALL-SEEN]` (2)(3) `[TRACE-FOCUS-STAYS]` `[ONE-ROW-DRAG-FLASH]`
  `[OIL-NOTIFY-SEEN]` (1)(6) — the "Set as default order?" offer over the board; notes; a "Breaks <next day>" focus;
  the landing flash; Undo's words; a touch drag's edge band on a short screen.
- `[ARROW-GUTTER-STRIP]` — a desktop window resize re-lands the week on a day; "day a–b of 7".

Built in this chat (commits `b0d274271`, `dc09fb3db`; tests only `8d78bc4da`, `9088b936d`, `7423a23ea`):
- `[EDIT-SECOND-CLICK]` — after a CHANGED text box, one click into another box takes the caret (the box the focus is
  travelling to is treated as the caret while the day redraws: `ui/textedit.ts textCaret`, used by `EditWeek.tsx` and
  `SchedBoard.tsx`).
- `[TAB-LAST-BOX-TEST-GAPS]` — tests of the Tab route (D597) and a fix: a Tab out of the text boxes onto a control,
  where the save replaced the whole day on screen, lost the focus; the redraw is now done first and the control looked
  up again (`ui/schedule-tab.ts`).
- `[CRP-FLAG]`, `[OFT-ADD-TWICE-SILENT]`, `[AMEND-SMALL-SEEN]` (6)(7) — tests only; no app change (the OFT refusal and the
  Leave War phone grid were found to work; see the commits).

## The job

Use this wording, as the order gives it:

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

Write scenarios a walker can DRIVE in the running app (real clicks, drags, keys, touch; desktop 1440×900 and a phone
390×844; a phone on its side 844×390 where the board is involved), each with: an id, the surface, the setup made through
the app's own controls, the action, an EXPECTED line a walker can judge PASS/FAIL (copied from or citing the ruling's
full row — a line you cannot ground in a ruling or the commit says "RECORD exactly what it says"), and the observation
that would disprove it. Cover, for each item: both widths; a published day as well as a draft where the item touches a
published day; undo and redo after the action; the orders of the item's own actions both ways. Give special weight to:
the In-time / Rally drag on a published day (pending, the four sign-offs, Undo, a drag back nets to nothing) and on the
phone board; the second-click caret on the board as well as the week; the Tab route onto a control after the day's
last box on a weekend day.

Group them into four shares of about equal length for four walkers (each walker gets its own browser world): share 1
In-time / Rally; share 2 the crew list, warnings and rings; share 3 the changes window, history, discard, the board's
layers, Undo's words, the touch edge band; share 4 text boxes (second click, Tab), the desktop resize, OFT "+", the Leave
War phone figures. Then list separately anything you found by reading that looks like a MISSING call site (one line
each, file and what is missing) — the host checks each.

**Report:** write it to `raptor-port/docs/superpowers/briefs/2026-10-19-sched-fixes-scenarios-report.md` and return a
short summary (how many scenarios, how many suspected missing call sites). Explicit negatives are welcome ("I checked X
and found nothing").
