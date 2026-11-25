I read an exported copy of 33c916756.

This is a blind scenario-design report, not an executed walk or a finding that the code is wrong. I read the whole brief and consulted the supplied rulings pages and source. The referenced full decisions files are absent from this export; unresolved details are marked **RECORD exactly what it says**.

Use `ad` / `a` for Saber’s admin actions and `us` / `us` for Ranger’s member view and own filings. Create every condition through app controls: Admin → Users or Quals, Inputs → SANS, `+ Wave`, `+ Line`, sim controls, and ordinary schedule editing. Do not inject records, alter storage, or modify source.

Use separate unpublished test days unless publication is the subject. Choose qualified, otherwise available people so unrelated warnings do not obscure the result. Record the actual date, person, placement, filing, visible warnings, count and puck marks. Compare surfaces showing the **same working or published version**.

1. **Published clean day: deleting availability must not change the issued face**

   **SETUP:** Through Inputs → SANS, give a SANS person an all-day offer covering his event. Plan him on that event, confirm no SANS warning, then publish and complete the available sign-offs.

   **ACTION:** Delete the filing. Inspect the working amendment, View-only Sched and the published-version views from Edit Schedule and the Board. Publish the amendment.

   **EXPECTED:** The deletion reads pending and clears the four sign-offs. The working amendment shows the new no-filing advisory; the issued face remains as published. After the amendment, the issued face gains the advisory, associated puck marks and updated count. Source: D179, D183–D185, D2005; scheduler ruling on post-publication input changes.

   **PROVES IT WRONG:** The published face gains the SANS warning before acknowledgement; the deletion is not pending; or the amended published face still omits it.

2. **Published warning day: filing availability must not silently clear it**

   **SETUP:** Plan a SANS person with nothing filed on a flight or sim. Publish with the advisory present.

   **ACTION:** File an all-day offer covering that event. Compare working and issued versions, then publish the amendment. Repeat with a published event-mismatch warning corrected by changing the offer.

   **EXPECTED:** The working amendment clears the resolved SANS warning; the published warning, ring, chip and count remain frozen until amendment. The input change reads pending. Source: D179, D183–D185, D2005.

   **PROVES IT WRONG:** A newly filed offer clears the issued advisory immediately, or the resolved advisory survives the amendment.

3. **Hiding and flagging again across publication**

   **SETUP:** Publish a day with one isolated SANS advisory.

   **ACTION:** Hide it on the working schedule. Inspect pending changes and the issued face. Publish the amendment, sign in as Ranger, reload, then return as admin and flag it again. Publish that change too.

   **EXPECTED:** Hiding is pending until the next amendment. Once issued, the hidden line remains struck and darker, contributes nothing to the issue count and supplies no puck flag. View-only has no Reset arrow. Flagging again follows the same publication boundary. Source: D469–D475, especially D471; D179.

   **PROVES IT WRONG:** Hiding changes the issued face immediately; the hide is private to Saber; the hidden line disappears entirely; or an issued reset fails to restore the warning.

4. **A hidden no-filing warning becomes a different SANS problem**

   **SETUP:** On an unpublished day, place an unfiled SANS person on an OFT and hide the advisory.

   **ACTION:** File Fly only; then change the filing to OFT with hours that exclude the session; finally supply covering hours. Inspect after every save and reload.

   **EXPECTED:** The newly different mismatch and hours situations are visible warnings, with their appropriate wording and count. A covering offer clears the SANS problem. Source: D469–D475’s changed-situation rule; D2584 2a; unchanged hours check.

   **PROVES IT WRONG:** The original hide suppresses every subsequent SANS problem, or a resolved problem remains counted.

5. **Repeated placements, identical descriptions and warning identity**

   **SETUP:** Give one unfiled SANS person two distinct, suitably separated flying lines. First give the lines different names/times; then repeat with two blank, unnamed lines. Also try distinct OFT and AMT sessions. Use separate rows, not duplicate places within one sim.

   **ACTION:** Inspect the number of SANS lines and their destinations. Hide one, remove one placement, and restore it. Repeat with two different unfiled people on one flight.

   **EXPECTED:** Every affected person must be represented, and any displayed warning must identify or lead to an actual affected placement. **RECORD exactly what it says** for per-person/per-placement aggregation, identical-text collapsing, which line a warning opens, and whether one hide affects another occurrence. The brief’s “one amber line” does not settle all these combinations.

   **PROVES IT WRONG:** An affected person is absent altogether; a warning names the wrong event or person; or hiding one person’s warning suppresses another person’s independent problem. Record aggregation behaviour separately for the owner.

6. **Untimed OFT and AMT: seats and extra places**

   **SETUP:** Create an OFT and an AMT with no start or end. Use qualified SANS people with nothing filed.

   **ACTION:** In separate trials, fill the front seat, rear seat, existing extra place and newly added extra place. Exercise both dragging and tap-to-plan. Add usable times afterwards.

   **EXPECTED:** All these places require SANS availability even before times exist. The selected-place crew list strikes an unfiled candidate; successful placement raises the amber no-filing warning and `A`. A named untimed session reads, for example, `Planned on Sim EP-9`, without invented hours. Adding times retains the problem and updates the description. Source: D2573, D2584 Q3/Q5, D2585, D2586.

   **PROVES IT WRONG:** Extras escape the check; only one sim type works; the warning waits for a start time; or the message prints invalid or fabricated times.

7. **Blank flying line: progressive completion and removal of times**

   **SETUP:** Through `+ Wave` and `+ Line`, create an unnamed flying line without times. Use an unfiled SANS person in a legal seat.

   **ACTION:** Plan him, then add callsign, mission and take-off in stages. Add landing, clear take-off, and finally clear both times. Include a landing-only trial.

   **EXPECTED:** The completely blank case says `SANS: no availability filed for today. Planned on this line (no times yet)`. A completed `VL BFM` line taking off at 13:00 names `VL BFM (T/O 13:00)`. No-filing remains a problem throughout. **RECORD exactly what it says** for intermediate partial-time descriptions not specified by the brief. Source: D2579, D2584 Q3; stated blank-line wording.

   **PROVES IT WRONG:** Clearing times clears the no-filing warning; blank labels produce broken sentences; or the warning retains an obsolete event name/time.

8. **Future SANS posting: the date viewed governs the warning**

   **SETUP:** In Admin → Users, inspect or set Ranger’s future SANS date. Create equivalent legal placements the day before, on the date, and the day after. Leave availability unfiled.

   **ACTION:** Visit all three days while the posting date is still ahead. Inspect crew lists and warnings. As Ranger, file availability for an eligible future day; return as admin.

   **EXPECTED:** Before the effective date he is ordinary and gets no SANS-availability warning. On and after it he is judged as SANS even when viewed in advance. A covering future filing resolves that day’s advisory. Source: D2338, D2340, D2341, D2329.

   **PROVES IT WRONG:** Today’s status is applied to all dates; the effective date is off by one; or availability cannot affect the future SANS day until that date arrives.

9. **Moving or undoing the SANS date with filings already present**

   **SETUP:** Create a future SANS day with a filed offer that mismatches a planned event.

   **ACTION:** Move the SANS date beyond that day using Admin → Users. Inspect the schedule and SANS calendar. Restore the original date or use the appropriate Undo.

   **EXPECTED:** On the now-ordinary day, SANS availability is hidden and does not cause a SANS warning. Restoring SANS status restores the filing’s relevance and its mismatch warning. Source: D2341, D2340, D2329.

   **PROVES IT WRONG:** An ordinary day retains a SANS warning; a temporarily hidden filing is lost; or restored status fails to restore the applicable check.

10. **Moving a person between days with different filing states**

    **SETUP:** On two adjacent unpublished days, file a covering offer for day one only. Create equivalent flight or sim places on both days.

    **ACTION:** Move the person between the days using supported schedule controls. Undo and redo. Separately visit equivalent days across a week boundary using navigation and ordinary removal/placement.

    **EXPECTED:** Each destination uses its own date’s filing. Day one is covered; day two warns. The vacated day loses any warning caused solely by that placement. Source: D2579, D2584, D2340/D2341.

    **PROVES IT WRONG:** The source day’s offer follows the person; the wrong day’s count changes; or stale puck marks remain after navigation. Cross-week dragging is not required.

11. **All-day availability on a flight crossing midnight**

    **SETUP:** Create a legal night sortie whose operational window crosses midnight. File Fly all day for its schedule day. Prepare a separate all-day OFT or AMT trial if the sim controls support a crossing-midnight session.

    **ACTION:** Inspect warnings, then replace all day with custom hours that genuinely fail to cover the required window.

    **EXPECTED:** All-day coverage does not produce an artificial `00:00–23:59 only` failure. The genuinely insufficient custom window retains the existing hours check. This is a regression check on the shared availability gate; the brief says hours behaviour is unchanged. **RECORD exactly what it says** for supported overnight input notation and the resulting hours message.

    **PROVES IT WRONG:** An all-day offer produces a midnight-boundary SANS advisory, or custom hours are silently treated as all day.

12. **Hours containment, including flight preparation and finish**

    **SETUP:** File the correct event with custom hours. For flying, record the actual report/step and dekit boundaries under the current Logic settings; for a sim, record its session window.

    **ACTION:** Test exact coverage, then a start one minute too late and an end one minute too early. Also file `08:00–12:00` and plan a clearly later event.

    **EXPECTED:** The existing hours check remains intact, with wording such as `SANS: available 08:00–12:00 only. Planned on …`. Correct event ticks must not conceal inadequate hours. Source: the brief’s unchanged-hours requirement. **RECORD exactly what it says** at precise boundaries and for flight preparation/finish details not settled by the quoted rulings.

    **PROVES IT WRONG:** An hours failure becomes “no availability filed”; the offered hours are misreported; or the unchanged hours behaviour differs between equivalent drag and tap placements.

13. **Every single-event and two-event mismatch wording**

    **SETUP:** Through Inputs → SANS, create each offer in turn: Fly only, OFT only, AMT only, Fly + OFT, Fly + AMT, OFT + AMT. Use all-day hours to isolate the event choice.

    **ACTION:** Plan each single-event offer on each unoffered event. For each two-event offer, plan the omitted event. Include timed and untimed placements.

    **EXPECTED:** The warning states what was offered: `offered Fly only today`, `offered OFT only today`, `offered AMT only today`, `offered Fly and OFT only today`, `offered Fly and AMT only today`, or `offered OFT and AMT only today`, followed by the actual planned event. Source: D2584 2a.

    **PROVES IT WRONG:** A valid nonempty filing falls back to `not offering … today`; OFT and AMT are conflated; an offered event is omitted from the wording; or blank times suppress the mismatch.

14. **Wrong event and wrong hours together**

    **SETUP:** File Fly only, `08:00–12:00`, then plan an OFT after 12:00.

    **ACTION:** Change only the event ticks to include OFT; then extend only the hours to cover it.

    **EXPECTED:** The first state identifies the offered event mismatch. Once OFT is offered, the remaining hours problem is reported; once both are satisfied, no SANS warning remains. Source: D2584 2a and the unchanged hours check. **RECORD exactly what it says** for whether simultaneous failures produce one or multiple lines.

    **PROVES IT WRONG:** Fixing the event incorrectly clears the remaining hours failure, or the message continues describing the superseded filing.

15. **A record with no event ticked: establish UI reachability**

    **SETUP:** Open a new SANS commitment, then separately edit an existing valid one.

    **ACTION:** Untick Fly, OFT and AMT and try to save.

    **EXPECTED:** **RECORD exactly what it says** and whether saving is refused. The exported UI requires at least one tick. If refused, the previous saved filing must remain intact; do not inject an empty record merely to reach the warning fallback. The brief reserves `not offering OFT today` for an existing record that ticks nothing, while D56 excludes stored-data-only problems.

    **PROVES IT WRONG:** A refused edit changes the schedule’s effective availability. If the UI actually permits an empty filing, record that route and then walk its fallback wording; do not confuse an empty record with no record.

16. **Shared availability and multi-day offers**

    **SETUP:** As admin, file one shared SANS offer for two eligible people over several dates. Plan both on one date, one on another, and leave one date unplanned.

    **ACTION:** Change the shared event ticks and hours. Remove one person through the permitted control, shorten the dates, and delete the offer in separate trials.

    **EXPECTED:** Each person/date uses the offer that actually covers it. Removing coverage produces no-filing warnings only on affected planned flight/sim dates. Other people and dates remain unchanged. Shared filing/editing follows Inputs D658 and D681; warning behaviour follows D2579/D2584.

    **PROVES IT WRONG:** Only the first named person updates; a removed date stays covered; an unplanned date gains a warning; or another person’s independent filing is altered.

17. **Availability lifecycle, Cancel, Undo and Redo**

    **SETUP:** Plan an unfiled SANS person on an unpublished flight. Note the warning, count and puck marks.

    **ACTION:** File a wrong event, correct the event but restrict the hours, then provide full coverage. Delete the filing. Undo and redo each meaningful change. Also edit the filing and press Cancel. Reload after a saved state.

    **EXPECTED:** The visible sequence is no filing → event mismatch → hours failure → clear → no filing. Cancel has no effect; Undo/Redo restore the corresponding saved state; reload preserves it. Source: D2579/D2584, unchanged hours behaviour, Inputs’ deletion/Undo ruling.

    **PROVES IT WRONG:** Old and new reasons accumulate, Cancel changes availability, or the restored filing and warning disagree.

18. **Cancel, remove and restore the planned event**

    **SETUP:** Create isolated no-filing cases on a flight, an OFT and an AMT.

    **ACTION:** Cancel each line/session using its controls, restore it, remove the person, then restore the placement with Undo. Repeat by deleting and undoing the event where supported.

    **EXPECTED:** A cancelled or absent qualifying placement does not sustain its SANS advisory. Restoring the live placement restores the applicable warning. Other remaining placements still count. Source: the qualifying-seat scope in D2579/D2584 and the cancelled-line exclusion in D2568.

    **PROVES IT WRONG:** A cancelled row remains the sole cause of a counted SANS warning, or restoring a live row fails to restore the check.

19. **Standby exclusions, including activated flying rows**

    **SETUP:** Make separate SC MAIN, SC SPARE, BB and AVALON cases with unfiled SANS candidates. Include timed and untimed rows.

    **ACTION:** Arm and fill their places. Where supported, activate the flying state through the normal Flies/brief/rally controls. Then move the person to an ordinary flight.

    **EXPECTED:** Standby rows never strike, warn or remind him **for missing SANS availability**, whether flying or not. An ordinary flight does require it. Other legitimate standby warnings may remain. Source: D2584 Q4, D2576, D2578.

    **PROVES IT WRONG:** Activation introduces a SANS no-filing warning on an exempt row, or the exemption leaks into an ordinary flight.

20. **Ground, duty and all-hands placements alone**

    **SETUP:** Use an unfiled SANS person with no flight or sim that day. Create ground/programme items, a duty desk and an all-hands item through normal controls.

    **ACTION:** Place him on each in separate trials. Then add a qualifying flight/sim and remove it again.

    **EXPECTED:** The nonqualifying items alone do not create the new SANS warning. Adding a flight/sim does; removing that sole qualifying placement clears it. Source: D2579’s flying-seat/sim scope; D2564.

    **PROVES IT WRONG:** A ground-only day demands SANS availability, or removing the flight leaves its warning attached to a ground item.

21. **Crew-list strike and “N free” before any placement**

    **SETUP:** Choose several otherwise eligible SANS candidates with nothing filed, including more than one of Cards, Wrangler, Yeti and Badger where suitable. Ensure the test candidates have no other tasks that obscure the count.

    **ACTION:** Inspect the unarmed crew list. Arm an untimed flight, an OFT seat, an AMT extra place and an exempt standby place in turn. File covering availability for one candidate.

    **EXPECTED:** With no place selected, a missing-filing strike has no explanatory reason line. Qualifying selected places strike unfiled candidates, including untimed places and sim extras. Applicable `N free` counts reflect all affected candidates. Standby adds no SANS-specific strike. An unplanned candidate does not gain a day warning merely by appearing in the list. Source: D2420, D2584, D2573, D2585, D2586.

    **PROVES IT WRONG:** Only the currently planned person’s eligibility updates; the count includes candidates barred solely by missing availability; or an unarmed reason line instructs the scheduler to file.

22. **“A” versus tight-turn and double-turn chips**

    **SETUP:** Give an unfiled SANS person two legal sequential sorties. First space them to produce a double turn; then adjust them to produce a tight turn. Avoid unrelated higher-priority flags.

    **ACTION:** Observe the chip with the SANS warning present. File covering availability, then delete it. Also hide the SANS warning separately.

    **EXPECTED:** While its SANS advisory is visible, `A` outranks `TT` and `DT`. Resolving or hiding it allows the remaining appropriate chip to show. Tight-turn and double-turn warnings themselves remain. Source: D2583; the brief’s built chip order; D475.

    **PROVES IT WRONG:** `TT` or `DT` masks the active isolated SANS `A`, or clearing SANS incorrectly clears the underlying turn problem.

23. **Every copy of the puck, with other warnings preserved**

    **SETUP:** Create an isolated SANS warning, with the person also appearing on other legitimate rows that day. Use a mismatch filing to obtain a SANS-card copy; use a no-filing case separately.

    **ACTION:** Inspect every available copy: flying/sim place, crew list, ground/programme rows, Personal Inputs, SANS card, Unavailable row and Board copies. Add a genuine higher-priority warning in a separate trial. Resolve or hide only the SANS warning.

    **EXPECTED:** In the isolated case, every applicable copy carries the amber ring and `A`; there is no new SANS letter. Removing one warning preserves marks supplied by other warnings. Source: D2583, the brief’s puck roll-call and D475. **RECORD exactly what it says** for competing marks beyond the explicitly settled `A`/`TT`/`DT` order.

    **PROVES IT WRONG:** One surface omits the isolated advisory mark, a resolved SANS mark persists, or hiding SANS removes an unrelated warning’s flag.

24. **Post-placement note: drag and tap-to-plan**

    **SETUP:** Create a clean flight `VL BFM`, take-off 13:00, and a clean sim. Use an unfiled qualified SANS person so SANS is the only new warning.

    **ACTION:** Drag him into the place, capture the note, undo, then arm the place and tap his crew-list puck. Repeat for an untimed flight and sim, on Edit Schedule and the Board; include phone tap-to-plan.

    **EXPECTED:** Placement succeeds despite the advisory. The note names the person and repeats the new warning, including `SANS: no availability filed for today. Planned on …`. It does not merely repeat the old crew-list reason. The persistent warning and puck marks appear immediately. Source: the brief’s post-placement consequence and plant-then-warn rule.

    **PROVES IT WRONG:** Drag succeeds but tap refuses; the note says only “planned” or the old short reason; or persistent warnings require a reload.

25. **Post-placement note when several warnings are raised**

    **SETUP:** Create a placement that raises SANS plus a distinct, real higher-priority warning. Prepare a second trial with an existing SANS warning and a new problem on another placement.

    **ACTION:** Perform the placement by drag and tap. Compare the note with the complete warning list.

    **EXPECTED:** The note must describe an actual new warning, and the persistent list must retain the SANS issue. **RECORD exactly what it says**, including any “more” count and day/person prefix. The brief does not require SANS to replace a more serious first message.

    **PROVES IT WRONG:** The note reports a warning the placement did not raise, omits or misattributes the person, or the additional SANS problem disappears from the persistent list.

26. **Hidden warning persistence and count/bar transitions**

    **SETUP:** On an unpublished day, isolate one SANS advisory. In a separate case, retain one red issue and the SANS advisory.

    **ACTION:** Hide SANS; reload; sign out and in as Ranger; inspect View-only. Return as admin and reset it. In the mixed case, hide the red issue first, then SANS.

    **EXPECTED:** The hidden SANS line stays struck in place for everyone and contributes no flag or count. With only SANS visible, the issues bar is amber. With every issue hidden, the quiet `✓ No issues` bar still opens the list. Hiding red while SANS remains turns the bar amber. Reset restores the contribution. Source: D469–D475.

    **PROVES IT WRONG:** Reload or sign-in restores the hidden issue; a hidden line remains counted; the bar stays red after its only red issue is hidden; or “No issues” prevents reopening hidden lines.

27. **Hiding one of several sources of an “A”**

    **SETUP:** Give one person a SANS advisory and a separate legitimate advisory that also supplies `A`. Use distinct events so each warning can be identified.

    **ACTION:** Hide only SANS, then only the other advisory, then both. Reset them one at a time.

    **EXPECTED:** The person retains `A` while another visible advisory supplies it. Counts drop by the hidden entries, not by all warnings on the person. Source: D475; D2583.

    **PROVES IT WRONG:** Hiding SANS removes all advisory marks despite the other visible issue, or resetting one warning revives both hidden entries.

28. **Surface parity, navigation and long wording at 1536 and 402**

    **SETUP:** Create examples of no filing, a two-event offer mismatch, and an hours failure. Give one event a long but valid name. Keep the compared version consistent.

    **ACTION:** At desktop width 1536 and phone width 402, inspect Edit Schedule’s warning list, View-only Sched, the Board’s issues panel and day-info popup. Open each warning and use its navigation/focus behaviour.

    **EXPECTED:** All surfaces retain the same facts, person, event and applicable times, with matching visible issue totals for that version. Text wraps readably; the person, planned-event suffix and hide/reset controls remain accessible. Warning navigation reaches the relevant row. Source: the brief’s roll-call; standalone-warning ruling D2045 and existing line-navigation behaviour.

    **PROVES IT WRONG:** One surface uses old mismatch wording, truncates the crucial suffix, focuses another row/day, obscures controls at 402, or disagrees about visible issues.

29. **Ordinary timed flight: one isolated no-filing advisory**

    **SETUP:** Create `VL BFM` with take-off 13:00 and sensible complete times. Use a qualified, otherwise free SANS person without a filing. Test legal front and rear seats separately.

    **ACTION:** Place the person and inspect the day’s warning list, puck and issue count.

    **EXPECTED:** Exactly one SANS advisory for the isolated placement: `SANS: no availability filed for today. Planned on VL BFM (T/O 13:00)`. It is amber, with `A`, and states a fact without telling anyone to file. Source: D2579, D2584 Q3, D2583.

    **PROVES IT WRONG:** No persistent line appears; duplicate SANS lines appear for the one placement; severity is red; or the text instructs the scheduler to file.

30. **Correct offers and ordinary people remain clear**

    **SETUP:** Prepare a SANS person offering the planned event all day, one offering all three events, and an ordinary non-SANS person with no SANS filing.

    **ACTION:** Plan each on legal flight, OFT and AMT places as applicable. Repeat the correctly offered SANS cases with blank times and with custom hours but no event times yet.

    **EXPECTED:** No SANS warning for a covered event. An untimed event cannot establish an hours failure merely because custom hours were filed. An ordinary person requires no SANS offer. Source: D2585; D2338/D2340/D2341/D2329; unchanged covered-offer behaviour.

    **PROVES IT WRONG:** Everyone without a filing is treated as SANS; offering all three produces an empty “offered …” warning; or a correct event with no times gets a fabricated hours mismatch.

31. **Legend and Logic wording**

    **SETUP:** Open Edit Schedule and the Logic page as admin, at 1536 and 402.

    **ACTION:** Read the Legend’s amber `A` entry, the SANS check name and its explanation. Compare the check name wherever the warning list exposes it.

    **EXPECTED:** Legend: `advisory — shift, ground or SANS availability`. Check name: `SANS availability — not filed, or planned outside it`. Explanation: `A SANS man planned outside the event or the hours he filed, or with nothing filed.` The phone’s parked crew tab must not cover the Legend wording. Source: D2583, D2584 3b; D2081/D2082.

    **PROVES IT WRONG:** “Nothing filed” is absent from the check/explanation, the Legend omits SANS, names disagree between surfaces, or the new text becomes unreadable at phone width.

32. **Pristine demo week as it boots**

    **SETUP:** Use an untouched demo instance through the normal app launch/reset route, if available. Do not file availability to make the demo clean. Cards, Wrangler, Yeti and Badger are the brief’s four unfiled SANS people.

    **ACTION:** Before making edits, inspect all demo-week days and locate each person’s actual flight/sim placements. Compare warnings, marks and counts across the required surfaces. Then, on a separate trial state, file covering availability for one person and observe the change.

    **EXPECTED:** Each qualifying unfiled placement is subject to the new advisory from boot, without a preliminary edit. Standby-only or unplanned appearances do not create a SANS warning. The other unfiled people remain affected when one is covered. Source: D2579, D2584 and the brief’s demo-week requirement. **RECORD exactly what it says** for each day’s totals; four people does not imply four warnings on every day.

    **PROVES IT WRONG:** The new warnings appear only after a mutation/reload, one demo person is silently exempt, or filing for one clears the others.

**Negatives — what must not change**

- Missing SANS availability remains an advisory, not a placement refusal or a red warning.
- No new puck letter replaces `A`; unrelated chip/ring priorities remain intact.
- Correctly offered events and existing hours checks retain their behaviour.
- SC MAIN, SC SPARE, BB and AVALON remain exempt from SANS availability, including activated flying states.
- Ground-only, duty-only, all-hands-only, unplanned and cancelled-only cases do not acquire the new warning.
- People before their SANS effective date remain ordinary for this check.
- No unarmed crew-list reason tells the scheduler to file availability.
- A SANS hide must not hide unrelated warnings or another person’s independent warning.
- Published SANS warnings remain frozen; this work must not freeze the Qualification-flag and crew-rest warnings that are meant to stay live.
- Issue counts exclude hidden warnings and do not count puck copies as separate issues.
- Member filing permissions remain unchanged: Ranger files his own SANS availability; admin may file for eligible others.
- Existing duplicate-person restrictions, cockpit placeholder restrictions, publication controls and Undo behaviour remain unchanged.
- Do not treat the zero-tick fallback as a defect merely because it can be reached only with already-stored data; D56 applies.
- Do not manufacture a non-admin scheduler account as a finding; D785 applies.
- Do not require separately described, unbuilt bell features as acceptance criteria for this warning-list change.

**Questions the supplied rulings do not settle**

1. Does “one amber line” mean one per person per day, one per planned event, or one per distinct warning description? In particular, should two unnamed untimed lines occupied by the same person have separate independently hideable warnings?
2. For a hidden SANS warning, should removing and restoring the identical placement keep it hidden? What about replacing the row with a different row having identical wording, or changing only its name/time?
3. When event and hours both fail, should the warning show only the offered-event mismatch, or explicitly report both? The walk should record current behaviour before treating either presentation as a defect.