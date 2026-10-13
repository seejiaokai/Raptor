# The brief for the fresh read of the leftovers batch (14 Oct 26)

`[BATCH-14OCT-LEFTOVERS]` — the owner's rulings D849, D851, D854 (the general rule behind them: D850). One fresh
Opus reader, who did not write the code and has seen neither the walk's report nor another reader's (D790). No Fable
read: nothing here decides OIL, a published day, who may do what, or what is saved. The job is on `[NO-ASTRA-LIST]`'s
standing footing (no ChatGPT reader until his subscription is back, D761).

**Read-only: change no file.** Read the code AT THE COMMIT, never the working files (they are being changed by break
tests while you read): `git show 6a896ffb9:<path>`, and the change itself with
`git diff 517d18d4c 6a896ffb9 -- raptor-port/src raptor-port/e2e`. You may run ONE unit test file at a time from
`raptor-port/` (`npx vitest run src/ui/<file>`); do not build, do not run browser tests (the PC's lock is held), do not
start a server. Where you would need the browser, name the exact steps and what you expect, and the host runs them.

## What was promised (each sentence from the ruling's full row — `grep -h '^| D851 |' .claude/decisions-full/*.md`)

- **D851:** "where a new input can be seen arriving no 'Input added' note is shown and its card wears the Scheduler
  Board's just-added mark" — "can be seen arriving" is the open day's list, the month and the Inputs List; "the note
  stays only where the new input is out of view or the save has a warning to give". The mark is the board's own (the
  blue box of about six seconds), not a new quick flash.
- **D854:** three more notes go: "Input updated" where the changed input is in view — its card wears the just-added
  mark instead; "Schedule updated" after the Scheduler Board's ✓ Done — nothing in its place; and "<name> added to
  <row>" / "<name> taken out of <row>" on a puck's drop — no mark, the puck is the sign. "Each note stays where the
  guide's three cases call for one — the changed input out of view, a warning to give with the change (the amber
  'already on …' note, a refusal)."
- **D850 (the design guide's §1, `raptor-port/docs/design-practices.md`, "Feedback is designed into the screen
  first"):** "in view" is D672's — wholly on screen, clear of the top bar and of any window or sheet over it; for a
  reader who asked for less motion the mark still shows, steady, and goes without its fade; a screen reader is told
  the same thing in words; the keyboard stays on the button that opened the window and is not moved to the new thing.
- **D849 (2):** in a cancelled input's own window the red CX tag and its reason follow the title, not the ✕.
- **D849 (3):** the answers of the upchit question and the medical-clash question sit flat — no darker patch, no line
  under them; on the medical clash the buttons stay at the right. The pictures of record:
  `raptor-port/docs/mock/2026-10-14-leftovers/` (`q2-after.png`, `q3-upchit-after.png`, `q3-medclash-after.png`).
- **The host's readings (questions for you, not requirements):** the note with "— not counted for OIL" is kept on a
  puck's add (it says something the puck does not); a caller's own words on a take-off ("X moved to Y") are kept; a
  save made while another page is in front says its note at once; "Input added to the Ground Programme" is untouched;
  the month's bar keeps its quick landing flash AND wears the six-second box; where a save said a word of its own,
  "Input added" stays joined to it in the one note.

## The roll-call the host worked from — say what is MISSING from it

| The thing | Every place the app draws or raises it | The host's answer |
|---|---|---|
| The mark on a just-saved input | the List's row (a desktop) · the List's card (a phone) · the opened day's card · the month's bar with no day open · the month's bar behind an open day · the day the page opens for an input with no bar ("+N more", a filter) · the OIL questions' one list (`OilDayList`) · the SANS calendar's day · the Medical tab · the schedule's rows | has it · has it · has it (new) · has it (new) · MUST NOT (the day's card wears it) · has it (its card) · must not (a list of questions; nothing is saved into view there) · none drawn, the note is said · none drawn (the List is hidden under it), the note is said · none of this kind, the note is said at once |
| The save's note | `ui/inputedit.tsx` — the shared-input save, the new-input save, the OIL-answer-alone save, the plain edit, the medical-clash save | left to the screen · left to the screen (never for the Ground Programme's own words) · "OIL answer saved" UNTOUCHED (not on his list) · left to the screen · left to the screen |
| The window's title bar (`FloatWin`) | the input's window · a day opened on either calendar · each calendar's settings · the Calendar window · the OIL questions' one list | a mark after the title only where a cancelled input is open; every other bar as it was |
| The cancelled tag | the movable window (the Inputs pages) · the schedule's own dialog (`.airpop-head`) | moved to follow the title · already followed it, untouched |
| The strip's class `.seg` on a sheet | the upchit question · the medical clash's row · its leftover line · the OIL question (fixed 14 Oct) · the week strip itself | renamed · renamed, on a line of its own at the right · renamed, its own flow kept · — · untouched |
| The puck notes | `ui/reqdoor.ts` `afterPut` (a join: a drop, an armed tap, a typed name) · `leave` (a take-off: dragged off, right-click, written blank; a move passes its own words) · `replace` (a swap) | silent unless "not counted for OIL" · silent unless the caller has words · UNTOUCHED (not on his list) |
| "Schedule updated" | the Scheduler Board's ✓ Done | gone |

## How to read it — use this wording as your method

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database
> step. **Do not report a problem whose harm exists only in data already stored when the code is already correct
> going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it
> again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**And the state table.** Two things here hold state between presses: the mark (lit for six seconds by a timer in
`ui/InputsPage.tsx`, read by `ui/InputsCal.tsx` through `lit`) and the note that is waiting to be said or not
(`ui/seen.ts` — two timers). For each, every event that can arrive in each state: a second save inside the wait or
inside the six seconds (the same input; another one); the window closed, the day closed or another day opened, the
view switched (Calendar, List, SANS, Medical), the page left, a sign-out; Undo and Redo; a save that is REFUSED and
puts the records back as new objects (the mark is held by record, the note by id); the input deleted while its note
waits; a tab in the background; two notes waiting at once.

**What a finding is:** a concrete failure — the setup, the press, what the screen then shows or says, what it should —
its cause (file and line at the commit) and its exact fix, step by step. Not a direction. And give your explicit
negatives: "I checked X and found nothing". Say separately anything you could not check without a browser.

## Files at `6a896ffb9`

`raptor-port/src/ui/seen.ts` (new) · `inputedit.tsx` (`show`, `saidSaved`, the four save sites, `mark=`) ·
`InputsCal.tsx` (`lit`, `barLit`, the day's card, the scroll) · `InputsPage.tsx` (`data-fresh`, `lit=`) ·
`InputCard.tsx` · `FloatWindow.tsx` (`mark`) · `UpchitConfirm.tsx` · `MedClashConfirm.tsx` · `reqdoor.ts` (`afterPut`,
`leave`) · `SchedBoard.tsx` · `toast.ts` (`toastHeld`) · `raptor-port/src/state/view.ts` (`revealInput`) · the
stylesheets `scheduler/06-inputs.css`, `14-input-editors.css`, `22-float-windows.css`, `25-inputs-calendar.css` · the
tests `seen.test.ts`, `inputsvet.test.tsx` (its last two blocks), `inputcx.test.tsx`, `upconfirm.test.tsx`,
`medclash.test.tsx`, `reqdoor.test.tsx`, `board.test.tsx`, `raptor-port/e2e/feedback-marks.spec.ts`.
