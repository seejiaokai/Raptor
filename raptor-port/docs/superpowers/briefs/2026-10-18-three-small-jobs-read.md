# The fresh, blind read of `claude/three-small-jobs-1018` (18 Oct 26)

You are a fresh reader. You did not write this code and have seen no other reader's report. READ ONLY: change no file,
run no build, no browser test, no full test suite (one unit test file at a time is fine: `cd raptor-port && npx vitest run
<file>`). Return your whole report as your final message.

**What to read:** the diff `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e` in the checkout
`C:\Users\User\projects\Raptor\.claude\worktrees\three-jobs-oct-18-b33478`, and every file it touches, whole where it is
under ~400 lines, else the functions it touches and their callers. The evidence sheet with the roll-call:
`raptor-port/docs/handpass/2026-10-18-three-small-jobs.md` (read its roll-call; the walk's results are in it). The area
rules: `.claude/rules/decisions/inputs.md`, `.claude/rules/decisions/leave-war.md`, `.claude/rules/decisions/scheduler.md`
(short lines; a ruling's full row: `grep -h '^| D1022 |' .claude/decisions-full/*.md`).

**The promise — copied from the full rows:**
- **D1019:** "From 431 to 700 wide the Leave War grid card's buttons use the phone's short words ("⇅", "OIL") as drawn at
  440, so "−" and "+" stay on the first line; the grid's columns are unchanged."
- **D1020:** "The calendar that floats over a date box behaves as the calendars inside a form do (D1012): Escape with its
  month or year list open closes only that list; a second Escape closes the calendar."
- **D1022:** "A deleted upchit gives the downchit it cut its days back, as a moved one does (D999): the downchit grows back
  to the end it had before the cut, never past it and never into another medical of his in the gap; the save sheet says so
  before anything changes."
- D999 (the move it copies): the downchit's first end is kept when an upchit first cuts it (`firstEnd`); on a published
  day a day given back reads pending (D178); Cancel leaves both as they were.
- **The host's readings** (questions, not requirements): a delete that gives nothing back still deletes at once and asks
  nothing (D792); on the Inputs calendar the upchit sheet stands in place of the Delete key's one-line question (D621)
  where it gives back; the delete and the give-back are one Undo step.

**The finder's brief (verbatim, the bug-check order §4):**
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

Questions to answer explicitly: every door that deletes an input — does each one an upchit can reach give back, and ask
first where it does? The give-back on a locked (quarantined) week; on an upchit whose downchit was handed to another man;
an Undo under the open sheet (the sheet re-finds the row by its id?); Escape with the lists open when the keyboard is NOT
in the card; a key held on the lists; the Leave War card head between 431 and 700 for a member and an admin, and at 701.
State tables: the upchit sheet in delete mode × each event that can arrive (Save, Cancel, Escape, a click outside, the
record changed behind it).

**A claim is a finding only with a concrete failure, its cause and its exact fix (D489)** — step-by-step fix
instructions. Give explicit negatives ("I checked X and found nothing"). Rank by severity.
