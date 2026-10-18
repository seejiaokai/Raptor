# The narrow read of the fix round, round 2 — D994's Schedule and amendments batch (19 Oct 26)

The bug-check order §5 "A fix is new code", round 2 of at most about three. A fresh Opus reader that did not write the
fixes, handed only the fix commits and the findings they answer.

**Branch:** `claude/schedule-amendments-fixes-fffce0`. **Read only; change no file except your report; do not commit,
build or run browser tests** (the full checks are running on this PC). You may run single unit test files
(`npx vitest run <file>` from `raptor-port/`). Do not open the walk sheets or the evidence sheet.

## The two fix commits and what they answer

1. **`0df257c26`** — answers N1 of `raptor-port/docs/superpowers/briefs/2026-10-19-sched-fixes-fixread-report.md` (read
   only its "## N1" section): the pressed-box mark's letting-go no longer calls the whole app's `notify()`; it sends
   `CARET_GONE` (`src/ui/textedit.ts`), which the week's and the board's held paint listen to (`src/ui/EditWeek.tsx`,
   `src/ui/SchedBoard.tsx`, their `resume` effects). Tests: `src/ui/textcaret.test.ts`, `src/ui/schedule-tab.test.tsx`
   ("a held week redraw is drawn…"), `src/ui/rowdrag.test.tsx` (two more routes of an emptied In-time line).
2. **`9cbdc5e64`** — answers a fault the walk found (older than the batch, the same on `main`): a time typed, the caret
   moved on in the same line (Tab), then Undo — the stored value went back but the box kept the typed time for good, on
   the week and the board. The block holding the caret was remembered as what it last showed BEFORE the typing; once Undo
   put the value back to that, the next paint saw no change. Now a held block is remembered as owed: `src/ui/dayswap.ts`
   (`OWED` in `swapDayAround`) and `src/ui/SchedBoard.tsx` (the caret's panel's record dropped in `put`). Tests:
   `src/ui/schedule-tab.test.tsx` ("Undo with the caret still in the block…").

`git show <commit>` for each; read the code around each change — callers, the paint effects of `EditWeek.tsx` and
`SchedBoard.tsx` whole, `dayswap.ts` whole (`swapDay`, `fits`, `chunksOf`, how `prev.chunks` and the `HELD` prefix are
used by `EditWeek`).

## The questions

For each fix: is it right (the failure no longer happens on every route — mouse, finger, keyboard; the week and the
board; a draft and a published day)? Is it complete (another route to the same failure)? What did it break beside it —
in particular: (a) does a held paint still get drawn on every route that used to rely on the old `notify()` (a swipe past
Sunday, a board opened while a box was pressed, the 600 ms timer after a finger's lift, a pressed box removed from the
page)? (b) can `OWED` ever be compared, parsed or written to the page as if it were markup, or make a day or panel
rewrite over and over, move the caret, or lose a scroll position? (c) does dropping the board panel's record cause a
rewrite while the caret is still in that panel?

**Assume every existing line may be correct and the defect may be a MISSING call site.** Give explicit negatives
("checked X, nothing found") for every listener, caller and surface you checked.

## What is not a finding (owner, D56)

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step. **Do
not report a problem whose harm exists only in data already stored when the code is already correct going forward.** If
the app would do it again to NEW data, report it.

A claim is a finding only with a concrete failure, its cause and its exact fix (D489): setup, action, what happens, what
should happen, the cause (file and function), and exact step-by-step fix instructions; say whether it is new with these
commits or older.

## Your report

Write it to `raptor-port/docs/superpowers/briefs/2026-10-19-sched-fixes-fixread2-report.md` — the only file you may
create — and return its contents.
