This is the complete scenario design for the exported copy identified in the brief as `3eb45f0cc`. I read the change, its tests, the applicable rulings and the separate routes through the app. I opened no other designer’s or reader’s report. No compaction handoff was received.

**These are proposed checks, not observed failures.** I could not run the app and changed no files. The host’s check is **FULL**, because this changes how an availability rule is read across several surfaces. This report supplies its scenarios only.

**Common setup**

Use a fresh, isolated browser world with normal saving enabled. Set the browser clock before opening the app to **15 Jul 2026, 09:00 Singapore time**, and leave it running. This makes the brief’s future-posting example testable without the reminder discarding past dates.

Sign in as Saber, `ad` / `a`. On the Leave War, open Ranger’s **Fri 17 Jul** cell → **⋯ → Post out → SANS**. Confirm that the sheet says he becomes SANS on **17 Jul**, then save.

On the Scheduler Board for **Sat 18 Jul**, use **+ Wave → Flying wave**. Leave take-off, landing, brief and reporting times blank. Start with a blank callsign and mission too. Keep Ranger free of unrelated absences and qualifications problems. Remove other test-world flights, sims and SANS filings for him where they would obscure the expected result.

For a second day, use **Mon 20 Jul**. For member steps, sign out and sign in as Ranger, `us` / `us`, **in the same tab**. Separate live tabs do not provide shared live data here.

“Both sizes” below means **phone 402 × 874** and **desktop 1536 wide**. The host must first verify the control routes on the running build; the routes here were checked from the supplied source, not driven.

**Coverage map**

| Object or surface | Visible sign and working gesture to check |
|---|---|
| Edit Schedule’s crew panel | Strike, armed reason, SANS free count and ordering; seat-first tap, person-first selection, drag and cancelling a pick. |
| Scheduler Board’s crew list | The same checks independently, including the phone drawer and desktop layout on a phone. |
| Ordinary flying seats | FCP and RCP; first and later aircraft/formations; empty and occupied; unnamed, named, day and night flights. |
| Drag hover | Reason under the carried puck and amber destination; refresh when the destination changes; clear on leaving or cancelling. |
| The drop’s note | Both drag and crew-list tap; ordinary placement, move and swap. Existing new warnings take priority over the SANS fallback note. |
| Green eligibility rings | Empty and occupied destinations; refresh after times, filing or SANS status changes. |
| Bell’s SANS reminder | Newly planned dates, saved weeks not displayed, cancellation and filing; tap opens the SANS calendar. |
| SANS calendar and schedule’s SANS cards | Filing by member or admin, shared filings, dates, offered events and hours; edit, delete, Undo and Redo. |
| Leave War posting and Quals SANS tick | Future start, start date reached, changed start and SANS without a posting. |
| Warning lists and assigned pucks | Preserve existing warnings and marks. The new amber nothing-filed warning and “S” flag are separate work. |
| View-only Sched and published-version views | No new placement controls or live crew-list advice; merely reading advice must write nothing. |
| Other availability readers | Available crew, “SANS offering”, day details, ALL AVAIL and Leave War manning must not treat a new strike as a new absence or filing. |
| Overlays | Long reason, long callsign, SANS edge, qualification chip, selection and existing warning marks; crew drawer, narrow Board panel and passing note. |
| Other roles | Ranger files his own availability but cannot schedule. Saber’s member view retains member restrictions. No scheduler-without-admin fixture. |

The scenarios below are ranked by likely failure, starting with the specialised routes outside the shared crew-list drawing. Their IDs retain the numbers used in the progress reports.

**1. S01 — Drag hover on an untimed flight**

- **Surface/size:** Drag hover over Edit Schedule’s week and the Scheduler Board; both sizes.
- **SETUP:** Common setup; Ranger has nothing filed.
- **ACTION:** Drag Ranger from the crew list over the blank FCP seat, across to an otherwise eligible ground place, then outside all targets. Repeat from an occupied flight seat and with slow and ordinary-speed phone drags.
- **EXPECTED / SOURCE:** Over the flight, show the timed seat’s SANS reason and an amber target. Refresh or clear both when leaving it. D2573; crew list and drag hover must agree.
- **DISPROVING OBSERVATION:** No reason over the flight, eligibility shown despite the reason, or the flight’s reason remaining over the ground place or after cancellation.

**2. S03 — Person selected before the seat**

- **Surface/size:** Edit Schedule’s week and Scheduler Board eligibility rings; both sizes.
- **SETUP:** Blank and timed ordinary flights, each with an empty seat and a seat occupied by another suitable pilot; one ground row.
- **ACTION:** Select Ranger first. Compare the destinations. File Fly availability, return and select him again; delete it and repeat.
- **EXPECTED / SOURCE:** Neither flight receives a green eligibility ring while he has nothing filed. An otherwise eligible ground place can. Rings update with the filing. D2573; rings and crew list must agree.
- **DISPROVING OBSERVATION:** The blank flight alone lights green, an occupied destination escapes the check, or rings retain the previous filing’s answer.

**3. S02 — Placement succeeds and explains the problem**

- **Surface/size:** The drop’s note and crew-list tap on both schedule editors; both sizes.
- **SETUP:** An empty blank-time flight with no unrelated new warning caused by Ranger’s placement.
- **ACTION:** Drag him into FCP. Undo. Pick FCP and tap his struck crew-list name.
- **EXPECTED / SOURCE:** Both routes place him. With no new warning taking priority, both give the same SANS reason as the crew list. The strike remains advisory. D2573 and the existing placement contract.
- **DISPROVING OBSERVATION:** Placement refused solely for missing SANS availability, silent placement, success-only wording, or different reasons between tap and drag.

**4. S11 — Bell agrees before any times exist**

- **Surface/size:** Bell’s SANS reminder and its calendar destination; both sizes, especially Ranger’s phone.
- **SETUP:** Ranger seated on uncancelled blank-time flights on Sat 18 and Mon 20; no other qualifying dates.
- **ACTION:** Display another week, then sign in as Ranger. Open the bell and tap the reminder. Repeat in a fresh world with the seats created **before** saving his SANS posting.
- **EXPECTED / SOURCE:** Both dates appear once, even when their weeks are not displayed. The tap opens the SANS calendar on Sat 18. D2568 and D2340.
- **DISPROVING OBSERVATION:** A date appears only after times are entered or its week is opened; duplicate dates; wrong calendar destination; different result depending on whether posting or seating happened first.

**5. S04 — Board layouts and the long future-date reason**

- **Surface/size:** Scheduler Board’s crew list: desktop 1536, phone 402 × 874 in both Phone and Desktop layouts.
- **SETUP:** Common setup, while Ranger’s SANS date is still ahead.
- **ACTION:** Pick the blank flight’s FCP seat. Open and scroll the crew list. On desktop, narrow and widen its panel; on phone, switch layouts and repeat.
- **EXPECTED / SOURCE:** Ranger is struck with the complete reason: “SANS from Fri 17 Jul: no availability filed. File it on the Inputs page’s SANS tab.” His name remains tappable. D2340, D2573 and D1118.
- **DISPROVING OBSERVATION:** One layout omits the strike, clips the instruction, paints it outside the panel, or makes the name unreachable.

**6. S09 — Filing changes while the schedule is hidden**

- **Surface/size:** Inputs → SANS, both crew lists and eligibility rings; both sizes.
- **SETUP:** Common setup. Keep the blank-time flight ready.
- **ACTION:** File Fly availability for Sat 18, return to the schedule, then delete the filing and return again. Undo and Redo the deletion before signing out. Separately move the filing from Sat 18 to Sun 19. Re-pick the seat if navigation clears its selection.
- **EXPECTED / SOURCE:** Each return shows the current day’s filing: present means no new nothing-filed reason; absent means the strike returns. Counts and rings agree. D2573; calendar and schedule must agree.
- **DISPROVING OBSERVATION:** Any result needs a reload, Undo/Redo changes the calendar alone, or Sunday’s filing clears Saturday.

**7. S10 — Before, on and after the SANS start**

- **Surface/size:** Both crew lists, hover and bell; both sizes.
- **SETUP:** Clock Wed 15 Jul; Ranger becomes SANS Fri 17. Add blank flights on Thu 16, Fri 17 and Sat 18.
- **ACTION:** Pick each seat. Advance the running test clock to Fri 17 and repeat, including with the page left open across midnight and after reopening it.
- **EXPECTED / SOURCE:** Thursday treats him as ordinary. Friday and Saturday strike him. Before Friday, their reason names the future start; once it arrives, use the ordinary timed-seat reason, “SANS - no availability filed for today”. D2313, D2340 and D2573.
- **DISPROVING OBSERVATION:** The rule reaches Thursday, misses Friday, follows the computer’s date instead of the seat’s date, or retains stale future-date wording.

**8. S06 — Both seats and every newly added aircraft**

- **Surface/size:** Edit Schedule’s week, crew panel and Scheduler Board; both sizes.
- **SETUP:** Add another formation with **+ Line**, and another aircraft with the formation’s **+** control. Prepare a SANS WSO with nothing filed.
- **ACTION:** Pick Ranger for FCP and RCP; pick the WSO for RCP. Repeat on each aircraft and formation, first unnamed and then named, including a Night wave.
- **EXPECTED / SOURCE:** Every otherwise suitable ordinary flying seat gives the same no-filing strike. A WSO offered FCP keeps its existing wrong-seat reason. D2573; equivalent seats and surfaces must agree.
- **DISPROVING OBSERVATION:** Only the first aircraft, named line or FCP is covered; a later aircraft or night flight shows the man as available.

**9. S16 — Moves, swaps, saved plans and templates**

- **Surface/size:** Both schedule editors, drag hover and drop note; both sizes.
- **SETUP:** Ranger in a timed flight; another suitable pilot in a blank-time flight; a second empty blank-time flight.
- **ACTION:** Move Ranger to the empty flight, then separately swap him with the other pilot. Undo and Redo each. Duplicate a plan and repeat. Save a new day template, apply it to an unpublished day, then place Ranger into its empty flight.
- **EXPECTED / SOURCE:** The destination’s SANS advice matches a direct crew-list placement. Moves and swaps preserve the intended occupants; Undo/Redo restores them. A template supplies the shape, not crew, so crew it after applying. D2573 and agreement between placement routes.
- **DISPROVING OBSERVATION:** A copied or restored flight misses the reason, a swap loses or duplicates a person, or advice describes the source day instead of the destination.

**10. S07 — Partial times and editing order**

- **Surface/size:** Time boxes in Edit Schedule’s week and Scheduler Board, followed by their crew lists; both sizes.
- **SETUP:** Common setup.
- **ACTION:** Enter landing **14:00** only, then take-off **13:00**. Clear take-off, restore it, then clear landing. In a separate run enter take-off first, leaving landing blank. Also enter brief/reporting time while take-off remains blank.
- **EXPECTED / SOURCE:** The no-filing strike persists through every state and uses the same reason as the fully timed flight. Blank landing must respect the existing assumed-landing behaviour. D2573; timed and untimed seats must agree.
- **DISPROVING OBSERVATION:** Any intermediate state offers Ranger normally or leaves advice stale after committing the time.

**11. S05 — Unpicked, picked, then unpicked**

- **Surface/size:** Edit Schedule’s crew panel and Scheduler Board’s crew list; both sizes.
- **SETUP:** Ranger unfiled; another otherwise free SANS pilot filed for that day.
- **ACTION:** Inspect the unpicked list, pick the blank flight’s seat, then cancel the pick. Repeat through the crew panel’s day navigation.
- **EXPECTED / SOURCE:** Ranger stays struck and excluded from the free count. His printed SANS reason appears while a seat is picked and disappears when none is picked. Free names precede struck names. D2420, D2573 and D1119.
- **DISPROVING OBSERVATION:** Arming makes Ranger free, cancelling leaves the printed reason, the count includes him, or the list follows a different day from the selected seat.

**12. S08 — “Something filed” remains unchanged**

- **Surface/size:** SANS calendar, both crew lists and schedule’s SANS cards; both sizes.
- **SETUP:** In separate runs, file Ranger for Sat 18 as **Fly all day**, **OFT only**, **AMT only**, and **Fly 08:00–10:00**.
- **ACTION:** Pick the blank-time flight, then enter **13:00–14:00** and pick it again.
- **EXPECTED / SOURCE:** With blank times, none acquires the new “no availability filed” reason. Once timed, existing event/window checks apply. The filing’s letters and hours remain accurate. D2573 expressly preserves a man who filed something.
- **DISPROVING OBSERVATION:** OFT-only or AMT-only is mistaken for no filing, a narrow window is newly rejected before times exist, or the timed mismatch stops being detected.

**13. S19 — A shared filing is still one filing**

- **Surface/size:** SANS calendar, both crew lists and each member’s reminder; both sizes.
- **SETUP:** As Saber, file one Sat 18 commitment naming Ranger and the SANS WSO.
- **ACTION:** Check their valid blank-time seats. Remove only Ranger from the filing. Repeat with a filing naming only the WSO, and one covering only Sun 19.
- **EXPECTED / SOURCE:** Both named people initially have something filed. Removing Ranger restores only his no-filing reason. Another person’s or another day’s filing never clears him. D2573; the filing’s people/dates and crew lists must agree.
- **DISPROVING OBSERVATION:** Only the first person is recognised, removing one affects both, or an unrelated filing clears Ranger.

**14. S12 — Cancellation changes the reminder, not the ruled picker behaviour**

- **Surface/size:** Scheduler Board cancellation controls, crew lists and Ranger’s bell; both sizes.
- **SETUP:** Ranger’s only qualifying Sat 18 event is the new blank-time flight.
- **ACTION:** Cancel his aircraft; restore it. Separately cancel the whole flight; restore it. Repeat with another uncancelled qualifying flight remaining that day.
- **EXPECTED / SOURCE:** A cancelled-only day leaves the reminder; restoration returns it. Another uncancelled flight keeps the day listed. The crew list may still strike him when the cancelled seat is picked. D2568 explicitly preserves that difference.
- **DISPROVING OBSERVATION:** Cancelled-only Saturday remains listed, restoring it loses the date, or cancelling one flight removes a date still supported by another.

**15. S22 — SANS tick and moved posting date**

- **Surface/size:** Quals, Leave War posting sheet and both crew lists; both sizes.
- **SETUP:** Tick SANS on Quals for a suitable pilot with no posting. Separately retain Ranger’s future posting.
- **ACTION:** Pick the ticked pilot for a blank flight on/after the tick day. Move Ranger’s start from Fri 17 to Sun 19, revisit Saturday, then move it back.
- **EXPECTED / SOURCE:** The hand-ticked pilot receives the ordinary no-filing reason. Ranger’s Saturday is ordinary while his start is Sunday and struck again when Friday is restored. D2313 and D2573.
- **DISPROVING OBSERVATION:** Only posted SANS people are covered, earlier days change retrospectively, or a moved start leaves a stale strike.

**16. S15 — Stronger existing reasons survive**

- **Surface/size:** Crew lists, drag hover, drop note and warning lists; both sizes.
- **SETUP:** Separate runs with Ranger on all-day leave and on an all-day downchit.
- **ACTION:** Pick, hover over and place him in the blank flight. Also try the SANS WSO in FCP and ALL AVAIL in a cockpit.
- **EXPECTED / SOURCE:** Existing absence or wrong-seat reasons retain their priority. Existing whole-day absence warnings still appear after placement. The placeholder retains its cockpit refusal. D605 and the existing reason/placement contracts.
- **DISPROVING OBSERVATION:** The new SANS reason conceals the absence or wrong-seat reason, suppresses its warning, or permits a placeholder cockpit placement.

**17. S13 — Standby boundaries**

- **Surface/size:** Both crew lists, hover and drop note; both sizes.
- **SETUP:** Through **+ Wave**, add SC MAIN, SC SPARE, BB and AVALON. Use otherwise suitable, current crew. Clear times; test BB/AVALON with FLIES off and on.
- **ACTION:** Pick each front and rear seat. Then enter times and repeat.
- **EXPECTED / SOURCE:** No new no-filing strike reaches the untimed standby seats. Record timed behaviour against a control run: the already-known timed SC MAIN strike is outside this change. D2576, D2578 and the brief’s explicit exclusion.
- **DISPROVING OBSERVATION:** This change introduces the new strike on an excluded untimed seat. Do not report the acknowledged timed behaviour as this job’s finding.

**18. S17 — New data survives leaving and reloading**

- **Surface/size:** Week navigation, both schedule editors and bell; both sizes.
- **SETUP:** Create the posting, flight and Ranger’s placement through controls on this build.
- **ACTION:** Change weeks, return, reload, sign in and re-pick the seat. Repeat after saving a SANS filing.
- **EXPECTED / SOURCE:** Saved people, dates, blank times and filing remain; re-picking reproduces the appropriate current reason. Selection itself need not survive reload. D2573; saved calendar and schedule must agree.
- **DISPROVING OBSERVATION:** Newly created data disappears, the strike depends on visiting another screen first, or the filing and crew list disagree after reopening.

**19. S18 — Read-only and published boundaries**

- **Surface/size:** Edit Schedule, View-only Sched, published-version view and Board; both sizes.
- **SETUP:** Publish a fresh day through normal controls. Make a working-copy change containing the blank-time flight. Record the published version and pending state.
- **ACTION:** Pick/cancel seats without writing; inspect the published version; switch to Ranger and Saber’s member view. Return as Saber.
- **EXPECTED / SOURCE:** Editing advice appears only where planning is allowed. Reading it changes no issued content, signatures or pending state. Read-only surfaces gain no placement gesture. Source: agreement with the unchanged published version and existing read-only behaviour.
- **DISPROVING OBSERVATION:** A read-only gesture writes, a live crew reason leaks into the frozen view, or merely selecting/cancelling creates a change.

**20. S20 — Ground, duty and all-hands exclusions**

- **Surface/size:** Both crew lists, schedule rows and bell; both sizes.
- **SETUP:** Separate worlds with Ranger only on a ground row, duty desk, named Common Programme place, or ALL/ALL AVAIL where offered. Include ordinary and information-only ground rows.
- **ACTION:** Pick and place him with blank times, then entered times. Check his reminder.
- **EXPECTED / SOURCE:** No new SANS filing reason applies to these places, and none alone adds the day to his availability reminder. D2564 and the flight-only scope of D2573.
- **DISPROVING OBSERVATION:** A ground/duty place starts demanding SANS availability, or the reminder counts an all-hands-only day.

**21. S21 — Ordinary workflow and overlapping marks**

- **Surface/size:** Edit Schedule, Board, crew drawer and SANS editor; both sizes.
- **SETUP:** Common setup; repeat with a newly created 14-letter SANS callsign and an existing warning mark.
- **ACTION:** Add flight → pick seat → search for person → place → enter times → open/close Board → file availability → return → Undo/Redo. Exercise the controls used to open and close the crew drawer, menus, SANS day and filing editor, including cancelling an unsaved filing.
- **EXPECTED / SOURCE:** Every step visibly completes; cancelling an unsaved filing leaves the strike. The strike crosses the puck only. Reason, callsign, SANS edge and warning mark remain readable; controls remain reachable. D1118 and agreement between the workflow’s screens.
- **DISPROVING OBSERVATION:** A mark hides the reason, the strike crosses its text, a panel covers the destination without a usable way out, or cancellation falsely clears the no-filing state.

**22. S14 — Untimed sims: record the result and retain the question**

- **Surface/size:** OFT/AMT crew lists, hover, drop note and bell; both sizes.
- **SETUP:** New OFT and AMT rows with blank times and no filing. Cover front, rear, passenger and extra places.
- **ACTION:** Pick and place Ranger, inspect the bell, then enter **13:00–14:00** and repeat.
- **EXPECTED / SOURCE:** An uncancelled sim without times counts in the reminder: D2568. For the crew-list strike, **record the exact result**; leaving it unchanged is the host’s reading, not a requirement settled by D2573.
- **DISPROVING OBSERVATION:** Missing untimed sim dates disproves the reminder requirement. The untimed crew-list result is not a failure solely because it differs from the new flight behaviour.

**Explicit negatives**

These are expectations checked against the supplied scope and source, **not runtime passes**:

- A non-SANS person must gain no SANS reason.
- A person with a filing for the relevant day remains outside the new nothing-filed check, even if its event or hours later prove unsuitable.
- No selected seat means no printed nothing-filed reason line, under D2420.
- An assigned cockpit puck does not acquire the crew-list strike merely because its name is struck in the picker.
- No new nothing-filed warning or “S” flag is demanded here. Those are separately filed under D2579 and D2580; D2574 is superseded.
- Existing timed standby strikes are excluded as the brief directs.
- Ground rows, duty desks and all hands do not become SANS availability events.
- Picking a seat must not change “SANS offering”, ALL AVAIL membership, Leave War manning, OIL earned or published records. A strike is neither a filing nor an absence.
- No migration or old-record repair scenario is included. Reload checks concern data newly made through this build.
- No scheduler who lacks admin status is included, under D785.

**Question to retain for the owner**

**Should D2573 also cover an OFT or AMT place before its times are typed?**

Worked example: on Wed 15 Jul, Saber places Ranger, SANS from Fri 17, in Saturday’s OFT with no times and nothing filed. His bell counts Saturday under D2568. Should the crew list also strike him immediately, as the newly changed flight picker does?

Recommendation: consider the same treatment for consistency, covering front, rear, passenger and extra places explicitly. Until answered, record the current result and keep this build’s flight-only boundary. No answer is assumed.

**Evidence required from the host**

Run these through the production build’s controls. Capture and inspect the actual strike, reason, hover, note, count and destination—not merely hidden text or saved values. On phone, retain the immediate frame after important taps alongside the settled view. Compare unchanged cases with a control build before labelling a difference a regression. Browser touch checks do not prove the real iPhone’s drag feel.

Walk: **NOT RUN — scenario design only, as instructed.**  
Rulings: **none this session.**

