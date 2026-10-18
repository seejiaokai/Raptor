# The narrow read of the fix round — D994's Schedule and amendments batch (19 Oct 26)

The bug-check order §5 "A fix is new code": a fresh Opus reader that did not write the fixes is handed only the fix
commits and the findings they answer, and asked whether each fix is right and complete, and what it broke beside it.
This is round 1 of at most about three.

**Branch:** `claude/schedule-amendments-fixes-fffce0`. **Read only; change no file; do not commit.** Read the code at the
branch's head in this checkout (`raptor-port/`). Do not open the walk sheets, the evidence sheet or any other reader's
report except the three findings named below.

## What to read

1. The findings the fixes answer: `raptor-port/docs/superpowers/briefs/2026-10-19-sched-fixes-read-report.md`, the
   sections **F1**, **F2** and **F3** only (stop at "## Observations").
2. The three fix commits, whole, and the code around each change (callers, listeners, the tests they added):
   - `b2797b27f` — F1: the "pressed box" mark (`raptor-port/src/ui/textedit.ts` / `textcaret`, its test
     `src/ui/textcaret.test.ts`, and every place that reads the mark before a redraw — the week and the Scheduler Board).
   - `5a20cccfe` — F2: an emptied In-time / Rally line and another line's grip (`src/ui/rowdrag.ts`, `rowdrag.test.tsx`).
   - `f9cdafcdb` — F3: only a real resize re-lands the desktop week (`src/ui/pan.ts`, `pan.test.tsx`; the resize the app
     sends itself is in `src/ui/Shell.tsx`, `saveBand`).
   `git show <commit>`; `git log -p` for context.

## The questions

For each fix:
- Is it right — does the failure in its finding no longer happen, on every route the finding names (mouse, finger,
  keyboard; the week and the board; a draft day and a published day)?
- Is it complete — is there another route to the same failure the fix does not cover (another event that ends a press,
  another caller of the changed function, another surface with the same listener)?
- What did it break beside it — a behaviour that worked before the fix and now does not (a caret that should hold a
  redraw and no longer does; a drag that should start and no longer does; a resize that should re-land and no longer
  does — the window narrowed, the phone turned, the zoom changed)?

**Assume every existing line may be correct and the defect may be a MISSING call site.** List every listener, caller and
surface you checked, with "checked, nothing found" for each that is clean — explicit negatives are required.

## What is not a finding (owner, D56)

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step. **Do
not report a problem whose harm exists only in data already stored when the code is already correct going forward** — no
migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to NEW data, report
it: that is a real finding and this exclusion does not touch it.

A claim is a finding only with a concrete failure, its cause and its exact fix (D489). For each finding give: the setup,
the action, what happens, what should happen, the cause (file and function), and **exact, step-by-step fix instructions**.
Say whether it is new with these fix commits or older (compare with the commit before each fix).

## Also — one short, separate check (D138)

A new ruling's one-line form was written from its full row today. Read the full row of **D1026**
(`grep -h '^| D1026 |' .claude/decisions-full/*.md` from the repo root) and its short line
(`.claude/rules/decisions/scheduler.md`, the row `| D1026 |`): does the short line say the same as the full row's bold
sentence, with nothing lost or changed in meaning? Answer yes, or name the difference.

## Your report

Write it to `raptor-port/docs/superpowers/briefs/2026-10-19-sched-fixes-fixread-report.md` — that one file is the only
file you may create — and return its contents.
