Scenario design only: these walks have not been run. No code-review findings are claimed, and no other designer’s list was read.

Use the production build in separate, fresh browser sessions. Make every filing, row and assignment through the app’s controls. Schedulers are admins. Use the demo week, 13–19 July 2026. Remove conflicting assignments or filings through the controls where a scenario needs one isolated warning. Record any additional warning separately.

For phone steps, use an iPhone-sized screen in Chromium and WebKit. Picture each important tap immediately and after settling; open the pictures and read the visible words. A test browser does not prove the real iPhone’s keyboard, bounce or touch behaviour.

1. **Plain-user round: file, plan, read, hide, plant again. Desktop and phone.**  
   **Set-up:** Bolt, Mon 13 Jul; AMT BOX, 13:00–14:00, empty front seat.  
   **Steps:** On Inputs → SANS, open 13 Jul, press “+ Commitment”, select Bolt, tick Fly only, choose All day and save. Read his calendar entry and the schedule’s SANS card. On the phone, pick BOX’s front seat, open the crew list and tap Bolt. Read the passing note and warning list. Hide his SANS line, remove him from that seat, then plant him there again. Finally edit his filing to include AMT and return to the schedule.  
   **EXPECTED:** “Bolt — SANS — offered Fly only, not AMT”. The warning says “SANS: offered Fly only today. Planned on AMT BOX 13:00–14:00”. Replanting with that warning hidden uses the same short note. Offering AMT removes the SANS mismatch. **D2753–D2755.**

2. **Every filing door and every combination. Desktop and phone.**  
   **Set-up:** Jester, Tue 14 Jul, no filing.  
   **Steps:** Open “+ Commitment”; leave every event unticked and try saving. Then save OFT alone and reopen the filing from the calendar and each schedule SANS-card door. Change successively to AMT alone, Fly/OFT, Fly/AMT, OFT/AMT and all three. Cancel one edit, reopen, then save it. Repeat the filing controls as a SANS member editing his own offer; return to an admin for scheduling.  
   **EXPECTED:** Every picker reads “Fly”, “OFT”, “AMT” in that order. The refusal is “Tick at least one of Fly / OFT / AMT”. Each saved combination retains the correct ticks; displayed letters follow F, O, A. Cancel retains the previous offer. **D2755.**

3. **Nothing filed: before and after a desktop drag. Desktop; repeat by phone tap.**  
   **Set-up:** Marlin, Mon 13 Jul, nothing filed; OFT EP-9, 10:00–11:00, empty rear seat.  
   **Steps:** Pick the rear seat and read Marlin’s reason. Drag him over it, pause to read the hint, then release. Read the warning. Hide it, remove him and repeat the placement.  
   **EXPECTED:** The reason is “SANS — no availability filed for today”; the passing note is “Marlin — SANS — no availability filed for today”, hidden warning or not. The warning retains “SANS: no availability filed for today. Planned on OFT EP-9 10:00–11:00”. **D2753, D2754, D2587.**

4. **Future SANS posting and the date boundary. Desktop and phone.**  
   **Set-up:** In a separate session whose running clock starts on Mon 13 Jul, save Ranger’s SANS posting for Fri 17 Jul through the Leave War’s posting controls. File nothing. Create OFT EP-9, 10:00–11:00, on Thu 16 and Fri 17.  
   **Steps:** Pick each front seat; read the crew reason, drag hint and placement note. File OFT for Friday and repeat. Also cross into Friday with the page open, then reopen it.  
   **EXPECTED:** Thursday requires no SANS filing. Before the posting runs, Friday’s note is “Ranger — SANS from Fri 17 Jul: no availability filed”. Once the posting runs, the ordinary nothing-filed wording applies. Friday’s OFT offer clears the SANS reason. None tells the scheduler to file. **D2753, D2587.**

5. **Moving an already-seated person; swapping two people. Desktop and phone.**  
   **Set-up:** Tue 14 Jul: Bolt offers Fly only; Jester offers OFT only. Bolt occupies a flying seat; OFT EP-9 is 10:00–11:00 and AMT BOX is 14:00–15:00.  
   **Steps:** Move Bolt from his flight to EP-9. Move him onward to BOX. In a separate pass put Jester on EP-9, then swap occupied sim seats. Compare the crew reason for each destination with the resulting warning and note.  
   **EXPECTED:** Bolt’s short reasons name “not OFT” and then “not AMT”. Each new SANS warning identifies the actual destination and person. A swap must not reuse the dragged person’s reason for the other man. Where several warnings arise, record which leads and inspect every SANS line. **D2753, D2754.**

6. **Input-row swap that puts the other person into a sim. Desktop and phone.**  
   **Set-up:** Mon 13 Jul: Marlin occupies OFT EP-9’s rear seat, 10:00–11:00. Jester alone holds an accepted Training input, 14:00–15:00. Neither has SANS availability.  
   **Steps:** Drag Marlin directly onto Jester’s puck on the input’s programme row. Read both resulting places, the input card and the new sim warning. Undo and repeat from the other schedule surface.  
   **EXPECTED:** The input-row swap follows its existing rule; Jester’s new sim warning uses the short note “Jester — SANS — no availability filed for today”, while the warning list names OFT EP-9. The input card and its programme row agree about their person. **D2753, D2754; D755’s existing swap rule.**

7. **The same swap held at the OIL question. Desktop and phone.**  
   **Set-up:** Recreate scenario 6. Make Monday a public holiday through the calendar controls and leave Training’s OIL question unanswered using “Later”.  
   **Steps:** Attempt the swap. Choose “Don’t swap”; inspect both places. Retry, pick No and press Swap. Repeat with Yes in a separate session.  
   **EXPECTED:** Before answering, neither person moves and no completed-placement SANS note appears. Cancelling preserves both places. After completion, Jester’s SANS note matches scenario 6; its warning still names the sim. Check the note after the answer, not merely after the original drag. **D2753, D2754; D783.**

8. **Both kinds of sim, every reason family. Desktop and phone.**  
   **Set-up:** Jester, Wed 15 Jul; OFT EP-9, 10:00–11:00, and AMT BOX, 13:00–14:00. Use one assignment at a time.  
   **Steps:** For each sim, place him with nothing filed; then with Fly only; then with that sim offered for 08:00–09:00 only. Open the warning list from the week and Scheduler Board.  
   **EXPECTED:** The three prefixes are “SANS: no availability filed for today.”, “SANS: offered Fly only today.” and “SANS: available 08:00–09:00 only.” Each ends with the correct “Planned on OFT EP-9 10:00–11:00” or “Planned on AMT BOX 13:00–14:00”. **D2754.**

9. **Missing start, missing end and explicit end. Desktop and phone.**  
   **Set-up:** Jester, Wed 15 Jul, nothing filed; OFT EP-9 and AMT BOX, initially untimed. Keep the sim-duration setting at 90 minutes.  
   **Steps:** Place him on each in separate passes. Enter 09:00 as start only; then 10:30 as end. Clear the start while leaving the end; finally clear both.  
   **EXPECTED:** Untimed rows say “(no times yet)”. Start only says “09:00–10:30 (end assumed)”. An explicitly entered 10:30 removes “(end assumed)”. An end without a start does not invent a known time window. OFT and AMT remain correctly named throughout. **D2754.**

10. **Unnamed, renamed and awkwardly named sim rows. Desktop and phone.**  
    **Set-up:** Jester, Thu 16 Jul, nothing filed; a new OFT and AMT row, each 10:00–11:00.  
    **Steps:** Leave each label blank and place him. Name it EP-9/BOX, then rename the AMT row BRIEF and DEBRIEF. Also try a long label containing “&” and a label beginning “Sim”. Read the entire visible warning after every edit; clear both times once.  
    **EXPECTED:** Blank labels give “this OFT row” or “this AMT row”; blank times add “(no times yet)”. Named rows retain their actual name and correct sim kind. Renaming cannot leave stale BOX wording. Record any separate brief/debrief consequences without inventing new scheduling rules. **D2754.**

11. **Sim extra places, not just cockpit seats. Desktop and phone.**  
    **Set-up:** Marlin, Thu 16 Jul, nothing filed; OFT EP-9 and AMT BOX, initially untimed, with another man already seated.  
    **Steps:** Pick each row’s empty extra place and tap Marlin. Repeat with 10:00–11:00 entered, and with Marlin offering Fly only. Try the first and a later extra place.  
    **EXPECTED:** The intended extra place receives Marlin. His reason and note use the same short words as a seat; the warning names OFT/AMT, with “(no times yet)” when appropriate. Tapping below a seated person must not silently select that person instead. **D2753, D2754, D2586.**

12. **AM, PM and typed hours remain distinguishable. Desktop and phone.**  
    **Set-up:** Fri 17 Jul: Bolt offers OFT AM; Kraken OFT PM; Jester OFT with typed 08:00–10:00. Create EP-9 at 14:00–15:00 and EP-10 at 09:00–10:00.  
    **Steps:** Pick and plant Bolt on EP-9, Kraken on EP-10 and Jester on EP-9, one at a time. Compare reason, drag hint, note and warning. Then type 00:00–12:00 manually for Bolt instead of choosing AM.  
    **EXPECTED:** Short reasons say “SANS — available AM only”, “SANS — available PM only” and “SANS — available 08:00–10:00 only”. Manually typed hours remain hours. Warning-list lines retain clock times, including the AM/PM windows. **D2753, D2759.**

13. **Half-day boundaries and unknown times. Desktop and phone.**  
    **Set-up:** Bolt offers OFT AM on Fri 17; Kraken offers OFT PM.  
    **Steps:** For Bolt, change EP-9 from 11:00–12:00 to 12:00–12:30. For Kraken, change it from 12:01–13:00 to 12:00–13:00. Clear both times. Finally change Bolt’s offer to Fly only.  
    **EXPECTED:** AM covers the first interval but not the second; PM covers 12:01 onward, not 12:00. A known event with unknown times does not assert an hours mismatch. Fly-only still gives “SANS — offered Fly only, not OFT” on the untimed sim. **D2759, D2585.**

14. **Crew-column layout in free and struck states. Desktop and phone.**  
    **Set-up:** Fri 17: Bolt offers Fly AM, Kraken Fly PM, Jester AMT 08:00–10:00; add a SANS WSO offer too. Create a morning flight and afternoon AMT BOX.  
    **Steps:** Inspect with nothing picked, each seat picked, selection cleared, crew panel closed/reopened and the day changed/back. Tap actual pucks and the blank beside their reasons separately. Repeat at real desktop 125% zoom.  
    **EXPECTED:** Unpicked: “F · AM” on one line. Picked: AM/PM under the letter for both free and struck people; typed hours remain complete underneath. Letters align after the widest reason. Taps do not plant a neighbouring person. **D2758, D2750, D2751.**

15. **Two flights; hiding each independently; leave alongside SANS. Desktop and phone.**  
    **Set-up:** Sat 18: Bolt has nothing filed and is placed on VX ACM, 09:00–10:00, and VZ DACT, 15:00–16:00. Otter has OL and occupies RU ACM’s rear seat, 11:00–12:00, with nothing filed.  
    **Steps:** Read the warning list and its count. Hide only Bolt’s VX line, restore it, then hide VZ. Inspect Otter’s lines separately.  
    **EXPECTED:** Bolt has two SANS lines, each naming its flight and counted separately; hiding one leaves the other. Otter retains both the leave warning and SANS warning. Other warnings do not replace either. **D2756.**

16. **Similar OFT/AMT warnings remain separate. Desktop and phone.**  
    **Set-up:** Sun 19: Jester offers Fly only; both OFT and AMT have a row named BOX, 10:00–11:00.  
    **Steps:** Place him on both. Hide only the OFT SANS line. Reopen the warning list, then restore it and hide AMT instead.  
    **EXPECTED:** Each line names its own sim kind. Hiding OFT leaves AMT visible and vice versa, despite identical person, label and times. **D2754, D2756.**

17. **Amber A, its sibling surfaces and unaffected cases. Desktop and phone.**  
    **Set-up:** Use Marlin’s isolated nothing-filed OFT case from scenario 3.  
    **Steps:** Hover the amber A on desktop; inspect corresponding pucks on the week, board, crew list and SANS card wherever drawn. Open Logic and Legend. On phone inspect the mark and warning access. Then file covering OFT availability. Separately place him only on ground/duty rows and SC MAIN, SC SPARE, BB and AVALON, including flying standby.  
    **EXPECTED:** The hover reads “Advisory — on shift and also down for a ground event or programme item; or SANS availability not filed, or planned outside it”. Legend keeps “advisory — shift, ground or SANS availability”. Covering availability clears the isolated SANS flag. Ground/duty/standby alone creates no SANS-availability warning. **D2757, D2583, D2584.**

Places the builder may have missed:

- Existing-filing editors opened from schedule cards, not just “+ Commitment”; calendar totals, badges and change-history offer lists.
- Input-row swaps and delayed OIL completion; the newly warned person may be the person swapped into the sim.
- Sim extra places, blank labels, BRIEF/DEBRIEF labels and warnings reopened after hiding.
- Logic’s flag explanation, whole-puck hover text and newly published/view-only puck copies.
- Returning to a hidden schedule after editing availability: check immediate repaint, Undo/Redo and reload against the saved offer.

Lesson coverage: scenarios 1–17 cover changing states, feedback, sibling wording and every placement route; 1–2 cover reopening, cancellation and refusal; 4 covers midnight; 11–14 cover touch targets and alignment. Check drawings, neighbouring controls, first frames and scroll limits throughout. Printing, pinch-specific behaviour and new phone-motion mechanisms are unchanged; real-device limitations remain explicit.

Walk: NOT RUN — scenario design only.  
Rulings: none this session.

