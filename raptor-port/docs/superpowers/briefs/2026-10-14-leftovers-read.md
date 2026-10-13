# The fresh read of the leftovers batch — what it found and what was done (14 Oct 26)

One fresh Opus reader (D790), blind to the walk, read-only, the code at commit `6a896ffb9`. Its brief:
`2026-10-14-leftovers-read-brief.md`. Three findings, all real, all in this batch's own new code; no false alarm. Each
was written as a failing test before it was believed, then fixed. The sheet: `../../handpass/2026-10-14-leftovers.md`.

## The findings

| # | What a person would meet | The cause | The fix | The test that was red |
|---|---|---|---|---|
| F1 (A) | An input saved a SECOND time inside its six seconds lost its blue box two seconds later; saved at about 5.6 s it showed neither box nor note (the note is left unsaid while the mark is on it). | The six seconds were one timer from the first light, never cleared; and a stylesheet animation already running does not start again because the class is still there. | A timer an input, started again by every light; the box's own clock put back to nought on whatever wears that input's mark (`ui/InputsPage.tsx` `flashT`, `relit`). | `ui/inputsvet.test.tsx` "saved again inside its six seconds…"; `e2e/feedback-marks.spec.ts` (the first test now changes the card four seconds in and looks 2.8 s later). |
| F1 (B) | On the desktop List a second input added four seconds after a first showed its box for two seconds only. | The row was keyed by its PLACE in the list; a new input goes to the head, so the row that drew the first input went on to draw the second, still wearing the first one's box. | The row keyed by the input's id. | `ui/inputsvet.test.tsx` "a second input added…"; `e2e/feedback-marks.spec.ts` "…a second input added four seconds after the first". |
| F2 | In an opened day with two lit cards the window went to the older one, and moved again — under his hand — when the older mark ran out. | The scroll looked for the first lit card and re-ran whenever the list of lit inputs changed. | It goes to the card just saved, and only when one is (`ui/InputsCal.tsx` `newest`). | `ui/inputsvet.test.tsx` "an opened day is brought to the card JUST saved…". |
| F3 | Where the saved input cannot be seen (the Medical tab; a window over it), the plain "Input updated", said late, REPLACED a warning the save had raised a beat after it returned — "LL does not go on the Ground Programme — its row has been removed". The same for an Undo or a delete pressed inside the wait. | The waiting note was said with no regard for a note raised since the save asked. | The note that waits counts the notes shown (`ui/toast.ts toastCount`); if another has been raised since, that one keeps the screen and the words go to a screen reader only (`ui/seen.ts`). | `ui/seen.test.ts` "a note raised since the save asked…" (both cases, with the app's real note). |

## Its "worth a look", each dispositioned

| The point | Disposition |
|---|---|
| The screen reader's region is made and filled in the same breath — often not read the first time. | **Taken.** The region is made the moment a save asks, a beat before anything is put in it (`ui/seen.test.ts`). A real screen reader has not heard it — said in the sheet. |
| The List held the mark by record, the calendar by id: a refused command put the List's light out and left the calendar's. | **Taken** with F1 — held by id in both. One older test relied on the accident (an Undo's new objects putting rows out) and was given its true premise (`ui/inputs.test.tsx` "flashes once…"). |
| A man dragged from an input's row onto a seat or another row is now silent (it said "<name> taken out of <row>"). | **As ruled, said to him:** it is a puck's drop, and D854 names "<name> taken out of <row>" on a puck's drop. Put in the sheet's §0 as a thing for him to know. |
| A long title on a phone could leave the cancelled tag no room. | **Real, fixed.** The mark keeps the room of the tag itself and it is the title that is cut (`scheduler/22-float-windows.css`); `e2e/feedback-marks.spec.ts` "…a title that fills the bar…". |
| A long reason on a phone is cut and cannot be read whole in the window. | By design of the picture he approved (the reason gives way first); the whole reason is on the card and the row. Said in the sheet's §0. |
| "OIL answer saved" now comes with the mark too; "OIL decision updated", "You are out of this input", "Input deleted" are the same family. | Not this batch's (not on his list). The first is §0's question 3; the others go to the whole-app words pass (D808) as delete candidates to put to him with pictures. |
| The contract still said "TO BUILD", and still gave the row's doors their old words. | Fixed in the same change (D201): `ui-contracts.md` §The passing notes' wording and §What a hand does to the one row. |

## Absences it named in the roll-call

None that changes behaviour: the Leave War grid, the availability window, the bell's list and the changes window save with another page in front (the note at once, as before); a day opened on an input that starts on another day moves to its start day and lights the card there; an input a filter hides is listed in its day and lit; "Every <weekday>" and the holiday form are windows with no mark handed to them; no element wears the bare class `seg` any more; "Schedule updated" had one raiser. The sheet's roll-call carries the ones a person can meet.

## What it could not check without a browser, and who did

| Its step | Done by |
|---|---|
| F1 seen (both legs) | `e2e/feedback-marks.spec.ts`, after the fix; and the break tests on a broken build. |
| F2, F3 seen | Unit tests only — F2 needs a day of fourteen inputs, F3 a save with the Medical tab up. NOT driven on screen: said in the sheet's §8. |
| The tag under a long title, a phone | `e2e/feedback-marks.spec.ts` (a title made to fill the bar). |
| The phone's month bar and day card; less motion on the card and the bar | The walk: A1–A3 at a phone's size, and again with less motion asked for. |
| His iPhone's List gliding longer than 680 ms to a row far away (the note would then also be said) | His look. The safe side: a note he has always had. |
| The desktop List's stuck heading over a row brought back by Undo | Older; not this batch's. |
| A real screen reader on the first save of a session | Nobody. Said in the sheet. |
| The clash and the upchit questions at 390 wide | The walk: C1, C2 at a phone's size. |
| The quick flash and the six-second box together on a bar | A look — §0's question 1. |
