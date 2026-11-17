# The four Leave War items — the click-away's fix round and the row tint: the narrow read (chat 105, 17 Nov 26)

The bug-check order §5 "A fix is new code": a fresh Opus reader that did not write the fixes, handed only the fix
commits and the findings they answer (D790). Round 2 of the click-away (round 1: chat 104's two blind reads of
`30e4e1162`). The row tint rides with it: a one-surface cosmetic change, but on pinned cells whose opacity has broken
before, so its layering is asked about. The reader is not given the evidence sheet, the walk or either earlier report.

## The brief, as sent

You are reading FIXES, not the whole feature. Repo: `C:\Users\User\projects\Raptor-lw4`, branch
`claude/lw-four-items`. Read-only: change no file, run no build, no browser test, no commit, no branch switch.

The feature: the Leave War's OIL tracker (`raptor-port/src/leavewar/ui/OilTracker.tsx`) lists each person's OIL awards
in a row that slides sideways under name columns held at the left. An admin taps an award to open an editing box in
place (amount, AM / PM for a half day, date, reason, given-by; Save, Cancel, Delete). A correction's date opens the
app's one date calendar, which floats on the page outside the editor (`.dcal-layer`). A tap on a person's name opens a
credit bar.

His ruling now (D2176, replacing an earlier one that kept the editor open with an unsaved change): **a click or tap
outside the editor always closes it as Cancel does, an unsaved change dropped; a slide of the list is not a click and
closes nothing.** A tap on another award opens that one, the change dropped.

1. `git show 59ebfdfcf -- raptor-port/src raptor-port/e2e/leavewar.spec.ts` — rebuilt to that ruling: the change
   tracking and the guard on opening another award removed. The findings it answers:
   - A drag begun inside the editor (selecting the reason's words) and let go outside closed it — the browser sends the
     click to a box around both. Fix: a press that began in the editor or its calendar is the editor's own.
   - A test restored the draft before checking "nothing saved", so code that saved on each outside click could pass.
     Fix: the tests read the saved award at once.
   - No test covered the correction's calendar. Added: "its calendar is its own".
2. `git show c78106577 -- raptor-port/src raptor-port/e2e/leavewar.spec.ts` — the grid's row tint (D2171): on a PC the
   faint tint of the row under the mouse now also covers the row's name and balance cells (`matrix.css`), laid as a
   background image over their solid fill so they stay opaque (a translucent fill there once let the grid show through
   the pinned columns); the signed-in person's own row keeps its own highlight; a phone is unchanged.

Answer, for each: is it right and complete for its finding or its ruling; what could it break beside it. For 1: every
way a press can start and end — mouse, finger, pen, keyboard (Enter or Space on an award or a button), a press that
starts outside and ends inside, a right-click, a second finger, a press cancelled by the browser (a scroll taking it
over), a press on the calendar's veil or patch, the calendar closed by its own control; the editor closed by Save,
Cancel, Delete, the tracker's ✕, Escape, or the tracker closing while a press is held; any listener left behind after
the editor or the tracker closes, or added twice; the credit bar's own click-away beside this one; a member (who opens no
editor). For 2: every row kind in the grid's body that has a name or balance cell (a person, the signed-in person, the
Manning rows and their pairs' own tint, the event rows, the group headings, the month strip); the grid scrolled
sideways and down; Rearrange mode; a drag selection in progress; a tablet or a touch laptop that reports a mouse; the
phone's second copy of the pinned columns, if any is ever drawn on a desktop. For each test change: does each check
still fail on the fault it names and pass on correct code, and can it pass or fail by timing or by the machine's fonts
alone.

What is NOT a finding: a problem that lives only in data already stored (all of it is demo data, cleared before the
database step); style or naming; anything outside these diffs unless a fix breaks it; anything for a scheduler who is
not an admin (a scheduler is always an admin); the ruling itself (an unsaved change dropped is his choice).

Each finding: the concrete failure (the steps a person takes and what they see), its cause in the code, and the exact
fix. Rank by severity. If you find nothing, say so plainly. Under 600 words.
