These are proposed scenarios, not completed tests. **This contribution is not blind:** I accidentally opened the handoff before applying the brief’s exclusion. No files were changed.

For every scenario, create the setup through the app’s controls. Use `ad` / `a` for Saber and `us` / `us` for Ranger. Check Ranger’s displayed SANS start date first; use current or future dates for bell tests. Use another already-SANS person where the scenario needs the ordinary “SANS — no availability filed for today” wording.

Run the crew-list checks in **Edit Schedule and Scheduler Board, at desktop width 1536 and phone width 402**. Record the selected seat, date, person, strike, reason and “N free” count. Capture the actual painted marks and readable words; on phone, capture immediately after the tap and again once settled. Where an expectation says **RECORD**, do not turn an assumption into a pass or failure.

1. **A standby SPARE made to fly by a typed B or R time**

   **SETUP:** Through **+ Wave**, create SC, AVALON and BB separately. Use a SANS person with nothing filed, otherwise eligible for the seat. Test MAIN and SPARE, front and rear seats.

   **ACTION:** Pick the seat before activation. Type a valid time in B, check again, clear B, then activate through R alone. Include both SC shifts and AVALON’s overnight shift. Plan the person and inspect the warning list and his bell.

   **EXPECTED:** No SANS reason for these seats, no SANS warning attributable to these rows, and no day added to his availability reminder solely because of them—even when flying. Source: D2576, D2578 and D2584 Q4.

   **PROVES IT WRONG:** Typing B or R introduces a SANS strike, SANS hover/drop reason, standby-caused SANS warning, or reminder date.

2. **Only one standby row ticked Flies**

   **SETUP:** Create each standby kind through **+ Wave**. Leave B and R empty. Keep neighbouring MAIN and SPARE rows available for comparison.

   **ACTION:** Tick **Flies** on one MAIN row, then repeat with one SPARE row. Pick seats on the ticked row and an unticked neighbour. Untick and repeat. Include a BB row with START and END blank.

   **EXPECTED:** The SANS exemption holds on both the ticked row and its neighbours, with or without times. Source: D2584 Q4. **RECORD** other changes caused by Flies separately.

   **PROVES IT WRONG:** The exemption depends on whether activation came from B/R or the Flies tick, or applies only to MAIN.

3. **Standby with a filing that would fail an ordinary flight**

   **SETUP:** For each standby kind, use Inputs → **SANS** to create these separate cases: nothing filed; OFT only; AMT only; Fly offered for 08:00–09:00 while the standby row runs later.

   **ACTION:** Pick and fill MAIN and SPARE seats, first standing by and then flying. Inspect the crew reason, warning list, amber A chip and ring.

   **EXPECTED:** Standby requires no SANS availability, including no matching event or hours. Source: D2576, D2578 and the brief’s standby exemption. An amber mark from another rule is not a failure.

   **PROVES IT WRONG:** A standby row produces “not offering Fly,” “available … only,” or another SANS restriction merely because a filing exists.

4. **Standby with blank, partial and overnight times**

   **SETUP:** Create SC, AVALON and BB through **+ Wave**. Use separate cases with both times blank, START only, END only, a complete daytime interval and 19:00–07:00.

   **ACTION:** Pick eligible SANS crew with nothing filed. Repeat after activating the row through each available route.

   **EXPECTED:** No SANS reason or availability-reminder contribution in any case. Source: D2584 Q4. **RECORD** unrelated missing-time or currency messages.

   **PROVES IT WRONG:** The exemption disappears when a time is cleared, an end crosses midnight, or the row is activated without complete times.

5. **One person on standby and an ordinary qualifying seat that day**

   **SETUP:** Put Ranger, with nothing filed, on standby and on a separate ordinary flight or OFT/AMT seat that same future SANS day. Use non-overlapping times where possible.

   **ACTION:** Sign in as Ranger and inspect the reminder. As Saber, remove the ordinary seat while leaving standby. Restore it, then remove standby while leaving the ordinary seat.

   **EXPECTED:** The day belongs in the reminder while an uncancelled ordinary flight or sim remains. Standby alone does not keep it there. Source: D2564, D2568, D2576 and D2584.

   **PROVES IT WRONG:** Standby suppresses a legitimate reminder, or keeps the date after the last qualifying seat is removed.

6. **A legitimate SANS warning beside exempt standby**

   **SETUP:** File OFT only for Ranger. Plan him on a timed ordinary flight and a separate flying standby row that day.

   **ACTION:** Inspect the warning text and its highlighted item. Remove the ordinary flight, leaving standby. Repeat using an ordinary sim with the wrong event offered.

   **EXPECTED:** The standby row contributes no SANS warning. **RECORD exactly** the ordinary row’s warning and how the person’s amber A chip/ring is shared across his appearances. Source: D2584 Q4; the brief’s warning-list exemption.

   **PROVES IT WRONG:** Removing the ordinary offending row leaves a SANS warning caused by standby, or adding standby removes the ordinary row’s warning.

7. **Cancellation and removal leave the right reminder dates**

   **SETUP:** On one future SANS date, give Ranger two ordinary qualifying seats plus standby, with nothing filed.

   **ACTION:** Cancel one ordinary flight or sim, then the other. Restore one; remove its occupant; undo that removal. Separately cancel an individual aircraft and its whole formation.

   **EXPECTED:** One remaining uncancelled qualifying seat keeps the day; none leaves it out. Standby never keeps it in. Source: D2568 and D2584 Q4. D2568 expressly allows the existing crew-list strike when a cancelled seat is picked; do not confuse that with reminder membership.

   **PROVES IT WRONG:** Cancelling one seat removes a date still supported by another, or cancelled/standby seats alone keep the date.

8. **The reminder follows saved weeks, not just the week open**

   **SETUP:** Through week navigation, create a standby-only day in one future week and an untimed ordinary sim day in another. Ranger has nothing filed for either.

   **ACTION:** Leave the standby week open, sign in as Ranger and open his bell. Follow the reminder to SANS. Return as Saber, remove the sim assignment, navigate away and check Ranger’s bell again.

   **EXPECTED:** Only the qualifying sim day appears; removing it removes that date. Source: D2564, D2568, D2584 and D2340’s reminder link to the first listed day.

   **PROVES IT WRONG:** The answer depends on the currently displayed week, includes standby-only dates, or opens the wrong filing date.

9. **A newly published day carries the exemption**

   **SETUP:** Create a fresh day containing flying standby with an incompatible SANS filing and an ordinary flight or sim as a comparison.

   **ACTION:** Inspect the working day, publish through the normal controls, then inspect the published day as Saber and Ranger. Return to the working copy, change the filing or seat, inspect both views, and publish the amendment.

   **EXPECTED:** A newly published standby row contributes no SANS warning. Source: D2584 Q4. **RECORD exactly** the ordinary row’s warning, the saved published appearance before amendment, and the result after amendment; the brief does not settle every publication-state transition.

   **PROVES IT WRONG:** Fresh publication creates a standby-caused SANS warning absent from the working day. Record any working/published disagreement with both versions identified.

10. **An untimed OFT and AMT seat with nothing filed**

    **SETUP:** Add OFT and AMT rows through the app. Leave start and end blank. Use an already-SANS person with no filing and no unrelated restriction.

    **ACTION:** Pick each front and rear seat. Inspect both crew lists before placing him. Then plan him and inspect his reminder.

    **EXPECTED:** He is struck for the picked seat with “SANS — no availability filed for today”; the planned day counts in his reminder. Source: D2584 Q5, D2573 and D2568.

    **PROVES IT WRONG:** Either sim type or either seat stays plain solely because times are blank, shows the wrong reason, or fails to contribute its planned day.

11. **Sim times removed after the person was planned**

    **SETUP:** Plan a SANS person with nothing filed on a timed OFT, then AMT.

    **ACTION:** Clear END, then START; repeat in the reverse order. Re-enter complete times. Also try a non-time entry if the control permits it.

    **EXPECTED:** With both times blank, the no-filing strike remains, as for an untimed flight. Source: D2584 Q5. **RECORD exactly** how one-sided or rejected time entries are treated; do not assume START-only means no usable interval.

    **PROVES IT WRONG:** Clearing all times removes the required strike or reminder date, or returning to complete times leaves stale words.

12. **Something filed on an untimed sim—the host’s open reading**

    **SETUP:** For each sim type, make separate SANS filings: the matching sim all day; the matching sim for narrow hours; Fly only; the other sim only. Keep the sim untimed.

    **ACTION:** Pick the seat, inspect the crew list, hover, plan the person, and inspect warnings, amber marks and the bell. Then add times inside and outside the offered hours.

    **EXPECTED:** **RECORD exactly what every surface says.** The brief labels “filed something stays plain” as the host’s reading, not an owner requirement. Do not require the untimed crew list and warning list to be identical without a ruling.

    **PROVES THE HOST’S READING WRONG:** A SANS reason appears on the untimed picked seat despite an existing filing. Any different treatment of wrong-event versus narrow-hours filings must be recorded separately.

13. **Additional people on an untimed sim**

    **SETUP:** Add an untimed OFT and AMT. Through the visible controls, place a SANS person with nothing filed in an additional-person position, separate from the front/rear seats.

    **ACTION:** Pick the additional place, inspect the crew list and placement feedback, then inspect his bell. Repeat with an existing filing.

    **EXPECTED:** **RECORD exactly what it says.** The brief names a sim “seat” but does not explicitly settle every additional-person position.

    **PROVES AN ASSUMPTION WRONG:** Front/rear seats and additional positions differ. Record that difference without extending Q5 by assumption.

14. **Selected standby → selected sim → no selected seat**

    **SETUP:** On one SANS day, provide an empty standby seat, an untimed sim seat and an ordinary untimed flight seat. Use a person with nothing filed and no other task.

    **ACTION:** Pick standby, then sim, then flight; clear the selection. Repeat in reverse order, close/reopen the crew panel, and change its day.

    **EXPECTED:** Standby gives no SANS reason; untimed sim and flight give the no-filing strike. With no seat picked, no no-filing reason line is printed. Sources: D2584, D2573 and D2420. **RECORD** each “N free” count and reconcile it with the people actually shown as free.

    **PROVES IT WRONG:** The previous seat’s reason persists, clearing selection leaves a printed no-filing reason, the wrong day is judged, or the count disagrees with the visible free group.

15. **Drag hover, drop and tap-to-plan**

    **SETUP:** Use the clean standby, untimed sim and untimed flight cases above.

    **ACTION:** Drag from the crew list and pause over each target before dropping. Repeat using tap-to-plan. Also move an already-planned person between rows, ensuring the source seat is actually vacated.

    **EXPECTED:** Standby hover carries no SANS reason; an untimed sim with nothing filed carries the same SANS reason as its picked-seat crew list. Sources: D2584 and the brief’s shared-surface checks. **RECORD exactly** whether placement succeeds and every resulting note; do not assume the newest note must be the SANS note.

    **PROVES IT WRONG:** Hover uses a different SANS answer from the picked seat, a standby drop reports a SANS restriction, or the message describes the vacated source rather than the destination.

16. **Green “where can he go” rings refresh**

    **SETUP:** Provide empty and occupied eligible standby seats beside untimed OFT/AMT seats. Use a SANS person with nothing filed, without unrelated restrictions.

    **ACTION:** Select the person and inspect the painted green rings. File matching availability through Inputs → SANS, return and select him again. Delete that filing and repeat. Toggle standby Flies between checks.

    **EXPECTED:** The rings agree with the picked-seat eligibility answer: no SANS obstacle on standby; the no-filing obstacle on untimed sims. Source: D2584 and agreement between the surfaces named in the brief. **RECORD** empty-versus-occupied ring appearance separately.

    **PROVES IT WRONG:** An untimed sim appears eligible despite its SANS reason, standby is excluded solely for SANS, or rings remain stale after filing changes.

17. **Ranger before, on and after his SANS start date**

    **SETUP:** Read Ranger’s actual start date through the app. Create equivalent standby, ordinary flight and untimed sim cases before it, on it and after it. Leave availability unfiled.

    **ACTION:** Pick each seat on each date; navigate back and forth. Inspect Ranger’s reminder and try filing for a qualifying future day through his own SANS tab.

    **EXPECTED:** Before the start date, Ranger is ordinary and receives no SANS restriction. From the date, ordinary untimed flights and sims require the no-filing strike; standby remains exempt. Ahead of the posting taking effect, use the date-specific reason prescribed by D2340. Sources: D2338, D2340, D2573 and D2584.

    **PROVES IT WRONG:** Today’s status is used for every schedule date, the boundary is one day out, or the future-posting wording bypasses standby’s exemption.

18. **The member files, changes and removes availability**

    **SETUP:** Saber plans Ranger on an untimed sim and, on another date, standby only. Ranger has nothing filed.

    **ACTION:** Sign in as Ranger, follow his reminder and file matching availability through SANS. Return as Saber to both schedule views. Then have Ranger edit or delete the filing. Reopen the app after the changes have saved.

    **EXPECTED:** The reminder no longer lists a qualifying day once availability is filed; the standby-only day never appears. Sources: D2340, D2564 and D2584. **RECORD** the untimed seat’s filed-state appearance under scenario 12 and the exact renewed-bell behaviour after deletion.

    **PROVES IT WRONG:** Filing affects the wrong person/day, the two schedule views retain different answers, or reopening restores an obsolete no-filing state.

19. **Other restrictions survive the SANS exemption**

    **SETUP:** Through the normal controls, give the SANS person a separate restriction: an incompatible front-seat qualification, a medical absence, insufficient SC currency, or another conflicting assignment. Test one cause at a time.

    **ACTION:** Pick standby and untimed sim seats, then remove the independent restriction and repeat.

    **EXPECTED:** The change removes only standby’s SANS requirement and adds the untimed-sim no-filing check. **RECORD exactly** each other restriction before and after; an unrelated reason may legitimately appear before SANS.

    **PROVES IT WRONG:** Removing SANS checking also removes an independent restriction, or the independent restriction masks the test and is mistakenly counted as proof of the SANS behaviour.

20. **Ground, duty, all hands and ordinary crew remain controls**

    **SETUP:** On separate future dates, place Ranger with nothing filed only on a ground row, a duty desk, all hands, and a standby-created duty desk. Also prepare matching flight/sim cases for a non-SANS person.

    **ACTION:** Inspect Ranger’s bell before and after activating the standby wave. Inspect the non-SANS person’s picked-seat crew reasons.

    **EXPECTED:** Ground, duty and all-hands assignments add no SANS reminder day. Non-SANS crew receive no SANS reason. Sources: D2564 and the SANS-only scope of D2573/D2584.

    **PROVES IT WRONG:** Activating a wave makes its duty desk demand SANS availability, a non-qualifying assignment enters the reminder, or ordinary crew acquire a SANS strike.

**Negatives—what must not change**

- Standby’s exemption must not become an exemption for ordinary flights or sims.
- An ordinary untimed flight with nothing filed must retain D2573’s strike.
- No selected seat must not acquire a printed no-filing reason line; D2420 still applies.
- A crew-list strike must not silently become a new hard refusal to plan someone.
- Other qualification, medical, conflict and currency checks must not disappear.
- A legitimate amber A chip or ring caused elsewhere must not be removed merely because the person also occupies standby.
- Cancelled seats must not contribute reminder dates; their picked-seat strike is a separate behaviour.
- Filing for one person or date must not change another’s availability.
- Standby must not prematurely say **“SANS — told on his bell.”** D2584 ties that note to the separate SANS information-line work.
- Missing no-filing warning wording must not be presented as a new question: D2584 Q3 already settles it, while this brief’s change concerns Q4/Q5.
- Do not count defects confined to old stored demo data when newly created data behaves correctly.
- Do not claim these scenarios have passed without walking them.

**Questions the supplied rulings do not settle**

1. When a SANS person has filed **Fly only** but is planned on an **untimed OFT**, should the picked-seat crew list remain plain until times exist, or show an event-mismatch reason immediately? The host’s “filed something stays plain” reading needs confirmation. My recommendation is to distinguish event mismatch from hours: the event is already known.
2. Does Q5 cover every additional person on an untimed sim, as well as its front and rear seats? My recommendation is to apply it to every person whose sim assignment requires SANS availability.

Rulings: none this session.