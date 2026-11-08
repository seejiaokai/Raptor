# Astra's scenarios — OIL Earn on the Scheduler Board (D1782, D1783, D1793)

Codex `gpt-6-astra`, reasoning high, read-only, 8 Nov 26 about 08:50–08:55, on the brief `2026-11-08-oil-earn-board-scenarios.md` at commit `edace6853`. Copied whole from its final message; nothing below this line is edited.

---

**Scenario design complete; this is not a release approval.** I found one likely missing route for the agreed inert-puck behaviour and one incomplete implementation of the host’s placeholder reading. Both need reproduction in the running app.

I read the specified change, its surrounding drawing and click routes, the relevant rulings, tests and approved pictures. I did not run the app or tests, change files, commit or push. The pictures are design references, not evidence of the finished screen.

**Coverage and execution conditions**

Use fresh data created through the app. Do not count defects confined to old demo records; do count anything reproduced with these new records, as D56 requires.

Unless stated otherwise, each scenario starts independently on **Saturday 18 July 2026**, unpublished, as a scheduler in Edit Schedule’s board, with nobody selected. Run each on:

- **P:** 402 × 874, real touch input.
- **D:** 1536 × 864, mouse.
- Keyboard scenarios use D with the keyboard only.

Use Fable, Bane and Plasma as the named people. Keep other work off their test day unless the scenario explicitly adds it. Record the applicable OIL thresholds before testing amounts.

| Surface or route | Where the sign and gesture belong | Examination |
|---|---|---|
| Phone day bar; desktop toolbar and OIL day bar | Entry/exit controls; day switch inside OIL Earn | Source and approved pictures read; runtime outstanding |
| Flying cockpits, SC MAIN/SPARE, AVALON and BB | Each named seat’s own earning gesture | Drawing route traced; runtime outstanding |
| Duty desks and extras; both simulator types, seats, passengers and extras | Named pucks explain or change their own earning | Drawing routes traced; runtime outstanding |
| Common Programme and Ground Programme | Named pucks, whole-event controls, placeholder counts | Separate drawing routes traced; runtime outstanding |
| Personal Inputs and Unavailable | Each visible copy of an input’s people; Overseas Duty included | Missing inert route identified; runtime outstanding |
| ALL and ALL AVAIL | Placeholder body distinguished from count; count opens the correct crowd | Inconsistent body handling identified; runtime outstanding |
| ALL AVAIL window, both tabs | Individual earning on its OIL tab; no person selection while OIL Earn is on | Separate click handler read; runtime outstanding |
| Working copy, issued version, amendment preview and view-only schedule | Editable choices only on working copy; issued figures and crowds remain frozen | Guards and version route read; runtime outstanding |
| Writes and history | Day switch, event switch, individual switch, Undo/Redo, subsequent schedule/input changes | Relevant write routes read; runtime outstanding |
| Readers and downstream effects | Puck figures, count chips, window lists, pending changes, signatures, issued OIL and Leave War credit | Relevant evidence/credit routes inspected; end-to-end verification outstanding |
| Other roles and overlays | Members/readers cannot write; windows and notes remain usable | Guards inspected; runtime outstanding |
| Crew list/drawer and ordinary week pucks | Distinguish planning/selection from an event’s earning gesture | Include as boundary checks below; no new earning control assumed |

**Ranked scenarios**

1. **Personal, leave and medical pucks bypass the new explanation — likely missing route**

   **SETUP:** P and D. Create a Personal input for Fable, 10:00–11:00, and accept it onto the Ground Programme. Separately create a leave input for Bane and a medical input for Plasma, visible under Unavailable. Enter OIL Earn.

   **ACTION:** Tap Fable on the Ground Programme, then his Personal Inputs copy; tap Bane and Plasma under Unavailable.

   **EXPECTED:** Each non-earning board puck selects nobody and gives the plain “Nothing changed for …” explanation. Personal, leave and medical remain unable to earn and gain no OIL question. D1783, D778, D804.

   **OBSERVATION disproving correctness:** An input-panel copy selects the person blue or gives no passing explanation, although the Ground Programme copy explains.

   **Cause found:** The input-panel renderer only sends kinds that ask the OIL question through the new puck handling. Personal, leave and medical use ordinary selectable pucks.

   **Exact fix if reproduced:**  
   1. Add failing gesture tests for these actual panel copies.  
   2. Separate “draw a puck inside OIL Earn” from “this input asks for OIL.”  
   3. Give non-earning copies the inert gesture and their true reason, without making them eligible.  
   4. Verify no earning decision, pending amendment or Undo entry is created.  
   5. Verify ordinary selection still works outside OIL Earn.

2. **Placeholder bodies differ between panels — incomplete host’s reading 1**

   **SETUP:** P and D. Use independent 08:00–18:00 rows with ALL AVAIL, then repeat with ALL: duty seat; duty extras beside Fable; simulator seat, passengers and extras; Common Programme; Ground Programme; an accepted shared Event input containing Fable plus the placeholder, including its Personal Inputs copy. Repeat simulator cases in both simulator panels.

   **ACTION:** Enter OIL Earn. Tap the placeholder’s **body**, then its **count**, separately.

   **EXPECTED:** Under **host’s reading 1**, the body selects nothing and explains that people are switched in the count’s window. The count must retain its existing window-opening behaviour and correct membership.

   **OBSERVATION disproving the reading:** Some bodies select or remain silent while others explain; a count disappears, is swallowed by the body gesture, or opens another row.

   **Cause found:** Duty/simulator/ground seats and the separate Common Programme renderer explicitly bypass the new inert wrapper for placeholders. Input-panel placeholders can enter it.

   **Exact fix if the host retains reading 1:**  
   1. Pin body and count gestures separately across these renderers.  
   2. Apply the inert body handling to each legal placement.  
   3. Preserve the placeholder’s existing bar and count while doing so.  
   4. Keep count handling ahead of body handling.  
   5. Verify no earning decision is written against ALL or ALL AVAIL itself.

   This is not independently ruled behaviour; do not present it as a settled D1783 violation.

3. **The ALL AVAIL window has its own inert handler**

   **SETUP:** P and D. Ground row “OPEN END”, ALL AVAIL, start 08:00 with no end. Separately, an accepted Personal input for ALL AVAIL, 10:00–11:00.

   **ACTION:** Enter OIL Earn; open each count, choose the OIL tab and tap the first named person. Repeat with the day switch on.

   **EXPECTED:** No selection or earning change; a truthful explanation. D31, D65, D778. For whether it belongs in the footer or passing note, and which reason wins when the day switch is also on: **RECORD exactly what it says.**

   **OBSERVATION disproving correctness:** Selection, invented credit, an Undo entry or pending change from the refused tap.

   **Static distinction:** This window handles the tap itself and repeats the reason in its footer; it does not consume the board’s new passing-note text. D1783 expressly carries the behaviour to the board, so this difference alone is not a confirmed defect.

4. **Issued crowd versus working crowd, through both window doors**

   **SETUP:** P and D. Publish an 08:00–18:00 Ground Programme row for ALL AVAIL. Record every issued name and count. Then make one recorded member unavailable through a new input, leaving an amendment pending.

   **ACTION:** Open the count from the working board, issued board/version and issued week. Visit both window tabs. Attempt an earning change on the issued version.

   **EXPECTED:** The working crowd reflects the new availability; each issued door shows the original crowd. An issued window cannot change working earning choices. D44, D45, D142.

   **OBSERVATION disproving correctness:** An issued count opens the live crowd, the displayed number disagrees with its list, or a version-window tap changes working data.

5. **The day switch must wait for publication before changing earned leave**

   **SETUP:** P and D. Fable alone on SDO, 08:00–18:00. Publish the day and record its issued OIL and resulting Leave War credit.

   **ACTION:** Enter OIL Earn and turn “No OIL earned” on. Inspect the working board, issued schedule and credit. Publish the amendment; inspect again. Turn it off, inspect before publication, then publish the next amendment.

   **EXPECTED:** Working figures change immediately; issued figures and credit change only when the corresponding amendment is published. Turning it off restores the prior earning choices. D1782, D2, D142.

   **OBSERVATION disproving correctness:** Credit changes while the amendment is merely pending, fails to change after publication, or is duplicated on restoration.

6. **Returning to the issued answer clears pending changes**

   **SETUP:** P and D. Publish and sign the SDO day from scenario 5.

   **ACTION:** Switch the day on, then off. Repeat with Fable’s individual earning off, then back on. Repeat using Undo/Redo.

   **EXPECTED:** A genuine pending change clears sign-offs. Returning exactly to the issued answer leaves nothing pending and restores the corresponding signatures; it does not require an empty amendment. D98, D103.

   **OBSERVATION disproving correctness:** A permanent pending mark, missing restored signatures, or an amendment caused only by having touched the switch.

7. **Shared inputs: named people and crowd follow one answer**

   **SETUP:** P and D. Accepted Event input, 08:00–18:00, Fable plus ALL AVAIL. Run separately with the filer’s answer Yes and No. Also inspect a fresh unanswered input wherever the app legitimately displays it.

   **ACTION:** Enter OIL Earn. Compare the Ground Programme and Personal Inputs copies; open the count. Change one named person and one crowd member through their respective doors.

   **EXPECTED:** Both copies represent the same input and scheduler decisions. The filer’s answer applies to everyone by default; an individual scheduler override affects only that person. D753, D762. If the unanswered state cannot reach a proposed door, **RECORD exactly what it says.**

   **OBSERVATION disproving correctness:** Different answers between copies, a whole crowd changed by one-person action, or a placeholder treated as an earner.

8. **Overseas Duty and earning inputs filed under Unavailable**

   **SETUP:** P and D. Fable has an Overseas Duty input covering Saturday with OIL answered Yes. In an independent case, Bane has an Other input, 08:00–18:00, answered Yes and filed under Unavailable.

   **ACTION:** Enter OIL Earn, switch each person off from Unavailable, then Undo and Redo. Turn the day switch on and attempt the same puck.

   **EXPECTED:** Each legitimate earning input remains reachable there; individual changes and Undo/Redo work. With the day switch on, the tap refuses using D845’s words and changes nothing. D804, D845.

   **OBSERVATION disproving correctness:** The panel becomes silent/inert merely because it is Unavailable, or the masked tap changes an underlying choice.

9. **Day refusal through all three required doors**

   **SETUP:** P and D. A measurable Ground Programme row holding Fable plus ALL AVAIL; day switch on.

   **ACTION:** Tap Fable, the event’s own OIL mark, and a named person in its ALL AVAIL window.

   **EXPECTED:** All three say **“Nothing on this day earns. Turn off the switch first.”** No selection or change. D845; host’s reading 2.

   **OBSERVATION disproving correctness:** Different refusal words, silence, selection, or an underlying earning decision changing.

10. **Individual choices survive both kinds of blocking**

    **SETUP:** P and D. Ground row 08:00–18:00 with Fable and Bane; switch Bane off. Add a measurable default-off standby assignment for Plasma and explicitly credit him.

    **ACTION:** Turn the day switch on; tap all three pucks; turn it off. Then switch the Ground Programme event off, tap its people, and restore the event.

    **EXPECTED:** Fable’s original earning, Bane’s exclusion and Plasma’s explicit credit survive. Event-blocked taps use **“This event earns nobody any OIL. Turn the event back on first.”** D1782, D844; host’s reading 2.

    **OBSERVATION disproving correctness:** A refusal silently clears an exclusion or an explicit credit.

11. **Work added after the day switch was set**

    **SETUP:** P and D. Saturday with Fable’s SDO row; day switch on.

    **ACTION:** Leave OIL Earn. Add Bane to a new 08:00–18:00 ground row, add a new qualifying input and add a new ALL AVAIL row. Re-enter OIL Earn, inspect them, then turn the switch off.

    **EXPECTED:** Nothing added later earns while the switch is on. Turning it off reveals each addition’s normal answer, including the input’s own answer. D1782.

    **OBSERVATION disproving correctness:** Newly added work escapes the switch, or turning it off wrongly grants every input OIL.

12. **Undo/Redo for each gesture, including refused gestures**

    **SETUP:** P and D. Make one ordinary schedule edit, then enter OIL Earn with a measurable named row, a count window and a no-end row.

    **ACTION:** Independently perform: day switch, event switch, named-person switch, window-person switch. Undo then Redo each. Between a successful change and Undo, tap the no-end puck and a blocked puck. Finally Undo back to the mode’s entry boundary.

    **EXPECTED:** Each successful change reverses once. Refused taps add no history step. Undo at the entry boundary exits OIL Earn before undoing ordinary scheduling. An already visible result stays in place. D1783, D672 and the existing OIL Undo contract.

    **OBSERVATION disproving correctness:** Extra Undo steps, skipped choices, lost Redo, an underlying row removed while still inside the mode, or unnecessary scrolling.

13. **Label, slider and rapid double press**

    **SETUP:** P and D. Fable’s measurable SDO row; switch initially off.

    **ACTION:** Tap/click the label once; restore off. Press the slider once; restore off. Press the same slider position twice quickly. Inspect history and Undo one step.

    **EXPECTED:** Each activation changes the day once. Two completed activations return to the original state; Undo reverses only the last. D1782; host’s reading 4.

    **OBSERVATION disproving correctness:** A label press changes twice, one rapid press is lost, or a press reaches a different control after redraw.

14. **Keyboard focus survives redraw without stealing the next move**

    **SETUP:** D, keyboard only. Saturday’s OIL Earn mode, switch off.

    **ACTION:** Tab to the switch, press and release Space, press Space again, then repeat with Space immediately followed by Tab. Repeat with Shift+Tab. Try Enter separately.

    **EXPECTED:** Space changes the day once and leaves focus on the replacement switch. A subsequent Tab or Shift+Tab proceeds normally. Host’s reading 4. Enter behaviour is not specified here: **RECORD exactly what it says** and what changes.

    **OBSERVATION disproving correctness:** Focus falls to the page, a delayed restoration pulls it back after Tab, one key changes twice, or the focused state is not visible.

15. **Change day, leave the mode, reopen and reload**

    **SETUP:** P and D. Fresh measurable SDO assignments on Saturday 18 and Sunday 19 July; Saturday’s day switch on, Sunday’s off.

    **ACTION:** Move Saturday → Sunday → Saturday. Leave and re-enter OIL Earn. Close and reopen the board. Reload, reopen Saturday and enter the mode again.

    **EXPECTED:** Each date retains its own earning decision. Entering or leaving a mode does not itself change earning. D1782. For whether navigation keeps the mode open, **RECORD exactly what it says**; do not invent a new mode-persistence requirement.

    **OBSERVATION disproving correctness:** Saturday’s switch affects Sunday, disappears on reload, or ordinary taps keep acting as earning gestures after exit.

16. **Working weekday, public holiday and Off day**

    **SETUP:** P and D. Wednesday 15 July 2026, Fable SDO 08:00–18:00, initially an ordinary working day. Use independent fresh cases marking it PH and Off day.

    **ACTION:** Open the board and inspect the mode entry and day bar in each case. For PH, enter OIL Earn and use the day switch. Also declare PH after publishing an ordinary weekday and inspect before and after republication.

    **EXPECTED:** An ordinary weekday gains no weekend OIL; PH can qualify; Off day alone does not. A post-publication PH change waits for republication. D21, D2, D1782. For an unexpected entry-control state, **RECORD exactly what it says.**

    **OBSERVATION disproving correctness:** Off day grants OIL, a non-qualifying weekday retains a working earning gesture, or declaring PH silently changes issued credit.

17. **Duty desk reasons, including extras**

    **SETUP:** P and D. Fable on SDO, Bane in its extras. Independently use: 08:00–18:00; 08:00 with no end; neither time; 08:00–08:00.

    **ACTION:** Enter OIL Earn and tap both people in every case.

    **EXPECTED:** Measurable work remains switchable. Other cases select nobody and give the D1783 sentence shape; no-end uses the approved no-end reason. No hours are invented. D31, D1783.

    **OBSERVATION disproving correctness:** Only the primary desk seat explains, extras select blue, or a zero/missing span becomes creditable.

18. **Simulator seats, passengers and extras**

    **SETUP:** P and D. Independently in both simulator panels, create a 13:00–15:00 row with Fable in a seat, Bane as passenger and Plasma in extras. Repeat with its end removed.

    **ACTION:** Enter OIL Earn; press each named puck, then Undo/Redo successful changes.

    **EXPECTED:** Every measurable placement has its individual gesture. With no end, every copy explains and selects nobody. D31, D1783.

    **OBSERVATION disproving correctness:** Passenger or extras handling differs from the main seat, or the tap changes somebody else’s earning.

19. **Common Programme and Ground Programme use different renderers**

    **SETUP:** P and D. Independently create “SAFETY BRIEF” on Common Programme and “STORES CHECK” on Ground Programme, 09:00–11:00, with Fable and Bane. Repeat with no times.

    **ACTION:** Enter OIL Earn; tap each person and the event name. Repeat the named-person taps in the no-times case.

    **EXPECTED:** Measurable named people and event controls remain usable. No-times people explain without selection; an incapable event cannot create an earning decision. D31, D1783.

    **OBSERVATION disproving correctness:** One panel works while the other selects, silently refuses or creates a meaningless amendment.

20. **Flying and standby seats: default-off is not incapable**

    **SETUP:** P and D. Separate Saturday cases for an ordinary flying line, SC MAIN, SC SPARE, AVALON and BB, with valid 09:00–11:00 times and named cockpit occupants. Keep standby cases unmarked as flying; then test their legitimate Flies state separately.

    **ACTION:** Enter OIL Earn and tap each occupant. Exercise the day switch on/off around an explicit credit.

    **EXPECTED:** Measurable default-off work remains creditable; it must not receive a “no working hours” refusal merely because it starts off. Flying-state defaults follow the Flies rulings. D24, D1042–D1043.

    **OBSERVATION disproving correctness:** The new inert handling traps a valid default-off seat or loses an explicit credit when the day switch is lifted.

21. **Cancelled and information-only rows**

    **SETUP:** P and D. Independent 09:00–11:00 cases: ordinary ground row, Common Programme row and accepted Event input, each containing Fable. Cancel each; separately mark each information-only.

    **ACTION:** Enter OIL Earn and tap every visible Fable copy, including Personal Inputs for the input.

    **EXPECTED:** No earning or selection. The passing note follows D1783 and states a truthful reason; input-specific reasons identify cancellation or information-only status. D31, D1783.

    **OBSERVATION disproving correctness:** A copied input puck still selects, an inactive row can be credited, or the explanation describes the wrong state.

22. **A multi-day input’s reason comes from another day**

    **SETUP:** P and D. A new Event input for Fable spanning Friday 17 to Saturday 18 July, with valid work times. File it, then cancel it through its governing input/row control.

    **ACTION:** Open Saturday’s board, enter OIL Earn and tap Fable’s input copy. Restore the input and repeat.

    **EXPECTED:** The refused explanation identifies the actual input condition rather than implying a missing Saturday time; restoration makes legitimate work reachable again. D31, D1783. **RECORD exactly what it says**, including the named date.

    **OBSERVATION disproving correctness:** The reason points to the wrong day, persists after restoration, or Saturday can override a genuinely cancelled input into earned work.

23. **Puck body, letters, edge and warning flag**

    **SETUP:** P and D. Fable on a no-end SDO row with a visible warning flag. First start unselected; then repeat after selecting Bane before entering OIL Earn.

    **ACTION:** Press Fable’s letters, body edge and warning flag separately. Compare a normal crew-list/drawer puck and a week-view puck outside the mode.

    **EXPECTED:** All parts of the inert event puck explain without newly selecting Fable or opening a planning action. Ordinary selection outside the mode remains intact. D1783. For an earlier selection carried into the mode, record its persistence separately rather than assuming it must be cleared.

    **OBSERVATION disproving correctness:** One part bypasses the inert handler, arms a seat, opens a picker or newly selects Fable.

24. **Scheduler, member, signed-out reader and version preview**

    **SETUP:** P and D. A freshly published Saturday with Fable’s SDO and an ALL AVAIL ground row. Inspect as scheduler in Edit Schedule, scheduler in View-only Sched, ordinary member and signed-out reader where available.

    **ACTION:** Open the board and count windows. Attempt the visible day/person/event controls. As scheduler, enter a version preview after using OIL Earn on the working copy.

    **EXPECTED:** Only the authorised working-copy editing surface can change earning. Read-only views retain their figures and count doors without offering a working switch. Existing access rules; D44, D142.

    **OBSERVATION disproving correctness:** A read-only door changes the working day, or a switch left visible from the earlier mode remains effective in preview.

25. **Floating windows and notes remain readable and correctly targeted**

    **SETUP:** P and D. Open Saturday’s ALL AVAIL window and Changes window together over a measurable row and a no-end row.

    **ACTION:** Bring each window forward; trigger a blocked-person refusal, switch the day, and tap the no-end board puck when exposed. Move/resize the windows on D; repeat touch presses near window edges on P.

    **EXPECTED:** The intended control receives one press; its explanation remains visible rather than hidden under a window. The count window stays usable and does not close from an unrelated board press. D1783, D845 and the existing floating-window contract.

    **OBSERVATION disproving correctness:** A note is covered, a press leaks to the board beneath, the wrong person changes, or the window unexpectedly closes.

26. **Approved switch appearance and exact wording**

    **SETUP:** P and D. The approved-picture case: Saturday, Fable SDO 08:00–18:00. Enter OIL Earn.

    **ACTION:** Capture switch off and on; hover its label on D; capture the passing note after each change.

    **EXPECTED:** Fixed label **“No OIL earned”**; grey off, cyan on. Hover: **“Anything added to this day later earns no OIL either.”** On-note: **“Nothing on this day earns OIL. Turn off the switch and each man earns as he did before.”** D1782.

    Passing notes are **host’s reading 3**, not approved ruling text: **RECORD exactly what it says** and compare with the two proposed sentences.

    **OBSERVATION disproving correctness:** Reversed state, old amber-button appearance, incorrect ruled words, clipping or layout movement that obstructs the controls.

27. **Phone icons, button height and actual hit locations**

    **SETUP:** P and D. Saturday’s board outside OIL Earn, then inside it. On P also enable the board’s desktop-layout option.

    **ACTION:** Press Templates and OIL Earn separately on their icon and word. Close Templates without applying one. Enter and leave OIL Earn.

    **EXPECTED:** Phone Templates uses the desktop’s page-of-blocks mark; OIL Earn uses its ticket. They remain on one row with the existing **23 px button height**. OIL done retains its approved appearance. D1793; the drawing notes correct the picture’s 24 px measurement.

    **OBSERVATION disproving correctness:** Wrapped/clipped labels, altered height, duplicate bars, an icon press doing nothing, or overlapping hit areas. Small size alone is not a finding under D26. Desktop touch emulation does not settle actual iPhone rendering.

28. **Amounts, counts and the issued credit agree**

    **SETUP:** P and D. Fresh Saturday with Fable on two qualifying events, Bane on one, and an ALL AVAIL event that would otherwise include them. Choose spans on opposite sides of the configured half/full-day threshold; record those spans and thresholds.

    **ACTION:** Change one event’s person choice, one crowd member and then the day switch. Compare board figures, week figures and window counts. Publish the final answer and inspect the issued version and Leave War credit.

    **EXPECTED:** A man is not counted twice because he is named and also represented by a crowd. Earning signs appear only on contributing events; amounts, lists and counts agree. The latest published answer supplies the actual credit. D1, D142, D753.

    **OBSERVATION disproving correctness:** Duplicate credit, a green earning sign on an excluded event, inconsistent half/full-day figures, or a published credit differing from the issued evidence.

**Explicit negatives and limits**

These are source-read conclusions, not runtime passes:

- I checked the day-switch writer and found nothing that deletes the person or event choices underneath it.
- I checked the person/event refusal guards and found nothing that permits a blocked tap to rewrite those choices.
- I checked count handling before the new inert handler and found nothing that would swallow a count **where the count is actually drawn**.
- I checked the board’s scheduler/editing/version guards and found nothing newly bypassed by the switch branch.
- I checked the icon definitions and found nothing introducing a second drawing for the same Templates or OIL Earn mark.
- I checked the new wording construction and found nothing omitting the callsign or the reason from pucks that reach it.
- I checked the changed source scope and found nothing changing the OIL calculation or publication rule itself. End-to-end credit behaviour still needs scenarios 5 and 28.
- I checked the added tests and found no coverage proving real keyboard focus, touch geometry, published-credit behaviour or the missing input-panel route. Their ground-row examples do not establish coverage of every renderer.
- I checked the approved pictures and found no basis for reopening the agreed target sizes or replacing the ruled wording.
- I found no additional deletion proposal within this review’s scope. The host’s transient wording remains a reading to record, not permission to rewrite it.
- I have excluded migration and old-demo-only concerns.

The host should reproduce scenarios **1 and 2 first**, then run the publication and history cases before treating the visual checks as sufficient.

**Walk: NOT DONE — scenario design and source inspection only.**  
**Rulings: none this session.**