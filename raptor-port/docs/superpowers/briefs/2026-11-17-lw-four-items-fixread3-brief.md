# The four Leave War items — the click-away's fix round 3: the narrow read (chat 105, 17 Nov 26)

The bug-check order §5 "A fix is new code", round 3 — the last (the cap of about three rounds). A fresh Opus reader that
did not write the fix, handed only the fix commit and the findings it answers (D790); not given the evidence sheet, the
walk or any earlier report.

## The brief, as sent

You are reading a FIX, not the whole feature. Repo: `C:\Users\User\projects\Raptor-lw4`, branch
`claude/lw-four-items`. Read-only: change no file, run no build, no browser test, no commit, no branch switch.

The feature: the Leave War's OIL tracker (`raptor-port/src/leavewar/ui/OilTracker.tsx`) lists OIL awards; an admin taps
one to open an editing box in place. His ruling (D2176): **a click or tap outside the editor always closes it as Cancel
does, an unsaved change dropped; a slide of the list is not a click and closes nothing.** A press that began inside the
editor or in the calendar its date opens (`.dcal-layer`, floating outside it) is the editor's own.

`git show 0eee82d0d -- raptor-port/src raptor-port/e2e/leavewar.spec.ts` answers these findings:
- Enter or Space on a button outside the editor closed nothing when the last mouse press had been inside (the reason
  box): the remembered press was never cleared, and a click made by the keys has no press of its own.
- A press begun outside and let go inside the editor closed it (the browser sends the click to a box around both).
- Test weaknesses: a press on "another award" could land under the pinned names; the own-row checks of two grid tests
  silently ran nothing (no row was marked as the signed-in person's); the calendar test never checked the date unchanged.

Answer: is the fix right and complete for each; what could it break beside it — a touch tap (where the release is
reported on the element the finger first touched), a finger slide begun inside and ended outside, a pen, a mouse
press with no release (the window losing focus), a pointer cancelled by the browser, a double click, a click made by a
screen reader or by script, a label clicked that forwards a click to a box inside or outside the editor, Enter on an
award or on the editor's own buttons; Save, Cancel, Delete and another award still behaving; the listeners removed on
close. For each test change: does each check fail on the fault it names and pass on correct code; can it pass or fail
by timing or fonts alone; does marking a row as his own (`lwSetViewer`) change anything else the two grid tests check.

What is NOT a finding: a problem only in data already stored (all demo data, cleared before the database step); style or
naming; anything outside this diff unless the fix breaks it; anything for a scheduler who is not an admin; the ruling
itself.

Each finding: the concrete failure (the steps a person takes and what they see), its cause, and the exact fix. Rank by
severity. If you find nothing, say so plainly. Under 400 words.
