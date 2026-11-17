# The calendar wheels' mouse drag (D2170) — the two blind code reads (chat 98, 17 Nov 26)

Both read `9ddd97738` in `C:/Users/User/cwd-read` from the brief beside this file, blind to each other and to the walk.

## The fresh Opus reader — its findings, in short (its full report stayed in the chat)

1. HIGH — a press let go off the list before it moved 4px left the list following a mouse with no button held, snapping off, the wheel then choosing nothing (cause: no buttons check, release never heard before capture). Same as Astra 1. Fixed: ended on the next move with no button, and on a lost hold.
2. MEDIUM-LOW — a key during a glide acted on the row chosen before the drag (ArrowDown chose 2027 from a glide at 2043; Enter closed on 2026). Same as Astra 2. Fixed: the key acts on the row in the band.
3. LOW — a mouse press during a glide re-snapped at once, a jump of up to 22px. Fixed: the press catches the glide with snapping off; let go there, it lands on the nearest row and picks nothing (the agent's reading: as a tap stopping a fling on his phone).

Safe by its read: the floating layer and veil, the Inputs and SANS titles, Jump to a date, the OIL question, an input's window, the Inputs list's range, Admin's run calendar, the Leave War sheets, document-wide listeners, the phone finger, less motion, the re-centre, two wheels, a release outside the browser. Not verified: a pen on his PC.
Tidiness (filed, not fixed): one landing for every path (done, `land`); the less-motion test written twice; the comments' claims kept true with the fixes (done).

## Astra — the final part of the report, as returned

153,071
I found **three medium-severity gesture failures**. I found no missing calendar caller or separate host-closing defect.

This was a blind, read-only review inside the supplied folder. I read no other reader’s report or walk results. The changed handlers were exercised in memory; **the browser tests below still need running**. No compaction handoff was encountered.

The promise checked was D2170, alongside D796, D797, D901, D1012 and D1562: both wheels accept mouse dragging everywhere, preserve ordinary clicks and native scrolling, and never pick a date or close their host merely because of a drag.

The caller trace starts with the specialised hosts. **Every place below reaches the same two wheels.** For each, the gesture belongs inside its opened month-and-year chooser; its actual usability remains unverified in a browser.

| Place | What the surrounding host could wrongly do; protection found |
|---|---|
| OIL tracker: give a credit; edit an existing credit’s date | Cancel the credit on an outside press or save its date. The floating calendar is expressly recognised as inside. Both routes are present. |
| Tracker: Done on / Failed on | Close the marking popup or immediately save a different day. The calendar stops clicks and keys reaching it. |
| Tracker: dialog date, including course start | Close the dialog or pull keyboard focus behind the calendar. The calendar takes Escape and Tab first. |
| Tracker: failure history; Last Flown Syllabus/Currency; Course start; End date A/B | Change a record, trigger a refusal or scroll the underlying panel. All use the floating calendar; existing date limits remain in place. |
| Admin: both clearing forms, each with Older than, A specific date and A date range | Arm or execute clearing, or change the held dates. Single dates float above the form; ranges use the shared calendar inside it. |
| Leave War: Approvals range | Close the range or approve something. The outside-press check recognises the calendar; closing after a date choice depends on picking dates. |
| Leave War: edit an existing bidding-date stretch; add a new stretch | Drag the separate month strip or close its sheet. These calendars sit outside that strip’s gesture area. |
| Leave War: leave-bid range | Submit or change the bid’s dates. The sheet’s dragging belongs to its heading. |
| Leave War: new period; Event dates | Move or close the sheet, or change its dates. Both contain the shared range calendar. |
| Leave War: posting dates in bid, posting-change and selected-days sheets | Start a posting action, move the sheet or act on the grid underneath. All six date-box occurrences float above their hosts. |
| Leave War: OIL tracker range | Fold the range or scroll the tracker. Its container is recognised by the outside-press check. |
| Calendar: holiday dates | Move the holiday window or alter its draft. Window dragging belongs to its heading. |
| Calendar: Every weekday, From and Until → A date | Move either window or submit the form. Both dates open the floating calendar, outside the Calendar window’s swipe area. |
| Admin accounts: Add person, Restore, Give access | Create or restore a person, or change Post in. All three use the shared floating calendar. |
| Input’s own window: dates and Upchit date | Save, close or move the editor. Covered in both the movable Inputs window and the schedule/board popup. |
| OIL question: Only some days… | Change selected days, save or cancel the answer. The calendar’s Escape handling precedes the question’s; its surround-click check tracks where the press began. |
| Inputs list: date filter | Close the filter on release outside. Its outside checks respond to the initial press, which begins inside. |
| Inputs and SANS calendar titles | Trigger a page swipe or lose the chooser during repaint. Both open the floating wheels and update the page when a wheel settles. |
| Jump to a date, including the board | Load a week or close the window. Navigation requires a date choice; surround closing checks the press origin. |

The page calendars’ own grids and the Inputs list’s invisible title copy do not require additional wheels.

Across these hosts, I also checked the general event listeners: window-heading drags, sheet shields, outside presses and clicks, focus traps, Escape/Enter handling, calendar positioning on scroll/resize, native wheel blocking, schedule dragging, week panning/swiping, text-edit shortcuts and touch zoom prevention. Their existing boundaries exclude the wheels or explicitly allow them. That is a source conclusion, not proof of rendered layering or browser event delivery.

The findings, written as failing tests:

1. **A release outside before dragging takes hold leaves the wheel following an unpressed mouse.**

   **Setup/action:** Open the OIL tracker’s existing-credit date calendar. Press a wheel, move sideways outside it without first moving four pixels vertically, release outside, then move back over the wheel at another height with no button held.

   **Expected:** The release ends the gesture. Subsequent hovering moves nothing, picks nothing and closes nothing.

   **Failure:** The pending press survives because movement and release are heard only inside the wheel until capture begins. The next hover starts dragging without checking whether the button remains held. The extracted handler check moved the list one row with the button released.

   **Exact fix:** Track movement and endings from the initial press, including outside the list. After the threshold, capture the pointer. Clear tracking on release, cancellation, lost capture, window blur and removal; reject movement without the primary button held. Preserve the original row click when no drag occurred.

2. **An arrow key during a glide jumps towards the year before the flick. Enter also loses the interrupted position.**

   **Setup/action:** In Tracker’s Course start chooser, start at 2026 and flick until the band shows approximately 2036 while still moving. Press ArrowDown. Repeat with Enter.

   **Expected:** ArrowDown stops the glide and advances from its interrupted row. Enter stops it and returns to the dates of that row. Neither picks a date.

   **Failure:** The displayed row advances during the glide, but the chosen value remains 2026 until settling. ArrowDown cancels the animation and chooses 2027. Enter closes the lists without accepting the visible row. Both paths were demonstrated in the extracted handlers.

   **Exact fix:** Read the interrupted row directly from the current scroll position and current row window. Calculate the arrow’s final choice from that row, retaining normal keyboard centring. For Enter, accept that row before closing the lists. Merely settling and then incrementing the old value would leave the same error.

3. **A finger or pen cannot take over an active mouse glide.**

   **Setup/action:** On a touch-capable computer, mouse-flick either wheel. Before it stops, touch the same wheel and hold, then drag it. Repeat with a pen.

   **Expected:** The new press stops the custom glide; subsequent movement belongs to the browser’s existing touch or pen handling.

   **Failure:** Touch and pen presses return before the glide-cancellation step. The animation remains active and continues writing the scroll position during the new interaction. The handler check confirms that it remains scheduled; the visible interference needs the mixed-input browser test.

   **Exact fix:** Stop the existing custom glide before returning touch and pen presses to the browser. Continue creating custom drag tracking only for the primary mouse button.

The remaining scenarios are ranked below. These are **coverage requirements, not additional findings**. Repeat the basic click, drag, flick and outside-release checks in every host listed above.

| Priority | Setup and action | Expected result; observation that disproves it |
|---|---|---|
| 1 | OIL credit and Tracker marking calendars: drag both wheels, releasing over an underlying action | Only the browsed month/year changes. Any saved date, mark, credit or host closure disproves correctness. |
| 2 | Admin run calendars and Leave War selected-days sheets: drag outside the card and window | No clearing, posting, window movement or underlying grid action. Test both an established drag and finding 1’s early exit. |
| 3 | Click a row without moving; repeat with movement below the threshold | That row is chosen once and centred; no date is picked. A swallowed click or unintended glide fails. |
| 4 | Slowly drag several rows, stop, hold, then release | Rest on the nearest whole row without extra momentum. Continuing travel or disagreement between band and title fails. |
| 5 | Quick flick in both directions | Continue briefly, stop on a whole row and leave dates unchanged. A jump, fractional resting row or accidental click fails. |
| 6 | Press again during a glide, then hold, click or reverse direction | The old glide stops and the new action starts from the visible position. Competing movement or a return towards the old row fails. |
| 7 | Use the mouse wheel during a glide | Custom motion stops; native wheel scrolling proceeds and the page behind stays still. Compare feel and snapping with the previous implementation. |
| 8 | Press arrows and Enter during a glide | Finding 2’s expectations hold. Also test keys that normally do nothing in a wheel. |
| 9 | During a glide, press Escape or tap the title; close and reopen | Correct closing order, no delayed updates, no surviving animation. Ordinary calendars close their lists first; month-title choosers close their card. |
| 10 | Flick far enough to re-centre the drawn rows, in both directions | The same logical row remains centred and the title agrees. A repeated choice, backward jump or changed year fails. |
| 11 | Start one wheel moving, then operate the other before it settles | Both final choices survive. Either wheel restoring the other’s previous choice fails. |
| 12 | Ask for reduced motion, then drag and flick | Immediate whole-row settling without continuing animation; title and band agree. The current code retains the projected flick destination; I have not treated that alone as a defect. |
| 13 | Finger and pen gestures, plus mouse-to-touch takeover | Native scrolling and snapping remain unchanged. Test both ordinary movement and finding 3. |
| 14 | Use a real desktop browser at 125% zoom, including short windows | Rows remain centred, pointer movement tracks the list, and controls remain reachable. Clipping, drift or missed presses fail. |

The added tests cover useful basic cases: held drags, a flick, release outside **after capture**, a later row click and key, native wheel scrolling, one phone finger gesture and the Inputs title. They do not cover the three interruption/release failures above.

Walk: **NOT DONE — blind code read only.** No browser suite or visual checks run. No files changed. Rulings: none this session.

Tidiness, filed here and left unfixed:

- **Anything unnecessary?** The new commentary repeats the ruling and much of the implementation. Keep the reasons behind the unusual gesture handling; move historical narration to the change record.
- **Anything duplicated?** Restoring snapping and ending motion occur in several paths. One shared finishing operation would make omissions easier to prevent.
- **Would a reader understand why?** The mouse-only approach is explained well. Naming the movement threshold, velocity window and timing limits by purpose would make the motion calculations easier to assess.
