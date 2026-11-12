# The rules check small batch: scenarios (13 Nov 26)

Designed by Astra, the standing reviewer, read only, before the batch was built (D6, D353, D1770), for [RULES-CHECK-FIXES]'s small batch (D2009, D2010, D2014, D2015). The builder did not write them. Used by the walk and the tests; the evidence sheet is `docs/handpass/2026-11-13-rules-check-small-batch.md`. Copied whole below.

---

Astra’s read-only scenario design, from the exported copy of `claude/rules-check-small-batch` at **11ddae148, before the batch was built**. No files changed, no tests run, and no finished-code approval is implied.

**The host’s D2014 reading is supported by the production paths I found.** Published OIL already keeps and uses its report lead, debrief and full-day threshold. I found no new-data counterexample in the located figure or credit readers. The most useful remaining tests concern older version looks, off-screen weeks, withdrawal, Undo/Redo, and different published days carrying different settings.

**The host’s D2009 reading is also supported.** Logic deliberately takes each check’s name from the warning list’s shared label. Changing that label reaches Logic, the week’s bold warning label, day details and Insights. The separate message after it must stay unchanged. The board normally shows that message alone.

The batch remains **FULL** because it touches earned leave, published records and warning wording. The following is scenario input for that check, not evidence that it passed.

**Coverage and production doors**

| Promise or object | Where its visible sign belongs | Working gesture or deliberate absence |
|---|---|---|
| D2009 check names | Logic’s check rows, search, Warnings filter and Fired this week; expanded week warning labels; hidden and “goes away once signed” labels; day ⓘ; Insights’ Conflicts by type | Search/filter must still find the checks. Warning-row taps must still identify the right puck. Hide/restore must retain the same warning identity. |
| D2009 messages | Flying, sim, duty, ground, Common Programme, standby and untimed-row warnings; board issues; crew reasons | Keep the separate “planned to fly”, “but tasked — BRIEFING”, standby wording, row name and reason. Keep warning codes, severity and C chips. |
| D2009 other copies | Newly published versions, historical version looks, member/guest issued views | Use the shared new name wherever a check label is actually drawn. Historical **content** remains its own. |
| D2010 full sentence | Hard crew-rest warning, amber tight-rest advisory, preceding day’s “Breaks tomorrow” line, day ⓘ, board issues, represented person’s warning in ALL AVAIL | Issue/trace taps must still point at the event responsible. A cross-week trace must not jump to an unrelated loaded-day warning. |
| D2010 compact reason | Armed crew picker, before placement, backward and forward across a week edge | Show the correct clearance or leave-by time. It has no independent full landing sentence to replace. |
| D2010 separate consumers | Long-day note and Insights hours | An unfinished sortie still contributes no hours or long-day endpoint under D1936. |
| D2014 publication writers | Publish day, Publish amendment, Unpublish and republish; Undo/Redo of those actions | Each newly issued version must keep its own OIL values. Withdrawal restores the preceding issued version and its credit. |
| D2014 version readers | Edit Schedule week, Scheduler Board, View-only Sched, selected issued-version look | Issued figures use that version’s values. The working copy shows the candidate under current values. Looking must write nothing. |
| D2014 row/person displays | OIL Earn figures and green marks; named people; ALL/ALL AVAIL chips and their membership window | The issued crowd and its earning figures must agree. OIL Earn changes belong to the editable working copy. |
| D2014 downstream credit | Leave War grid, opened day sheet/list, OIL tracker, Balances, person-window OIL figure; loaded and off-screen weeks | Open the grid’s day, the person’s tracker and the Balance’s OIL figure. Amounts and stored worked periods must agree. |
| D2014 pending/signatures | Day/week/board pending marks, Changes → To go out, amendment panel and four sign-offs | Open every pending count’s list. One OIL-values comparison covers changed amounts **or stored worked periods**; putting the change back restores valid signatures. |
| D2014 holidays | Schedule’s live amber D2003/D2004 lines; Leave War holiday event | Adding/removing PH does not move issued credit until amendment. Undo/Redo must restore the corresponding state. |
| D2014 history | Changes → All changes, plus To go out | Pure Logic changes and automatic OIL reconciliation deliberately create no history lines. Their pending comparison is a separate reader. |
| D2015 note | Logic’s changed-settings strip, singular/plural, admin/member reading, reset, Undo/Redo and reload | Explain next-amendment application. Check the neighbouring “checked … now” sentence does not promise immediate changes to an issued face. |

Roles to cover are: **admin/scheduler**, member, guest, and signed out/pending access. A scheduler who is not an admin is excluded by D785. Members can read Logic and OIL records; guests have the issued schedule only. Do not invent Logic or OIL-tracker doors for guests.

For visible checks, cover desktop and phone, including the board’s phone issues fold, an open day-details window, warning rings/chips, OIL marks and the ALL AVAIL window. Assert what is painted and press the real control; finding hidden markup is insufficient.

**Explicit negatives from the source trace**

- I checked production uses of both old check names and found no production matcher depending on those words. The defining old labels are in `src/engine/validate.ts`.
- I checked the board and found ordinary issue rows use the separate message, without a separate bold check-name label.
- I checked Help and found a bug-report page, not a rules catalogue.
- I checked schedule CSV and PDF: they contain flying rows, **no OIL amounts, warning labels or crew-rest sentences**. Their landing column must contain the actual entered landing, never the borrowed take-off.
- I found no production OIL-tracker/Leave War download or print writer, and no scheduler/Leave War data-backup door. Do not add imagined requirements to these absent surfaces.
- I checked the OIL calculations and found no direct arithmetic reads of `simDebrief`, `amtDebrief`, `epBrief`, `briefLead` or `SHIFT_HARD`. Assumed sim/other-row lengths affect unfinished-row availability, but do not give those rows OIL; issued placeholder membership is kept.
- A **new timed input’s** OIL question uses the current threshold. That is different from recalculating an already issued day’s credit.
- I checked the current publication writers and found no EOD control. The contract calls EOD a future writer that must use the same freeze point; there is no EOD gesture to walk tonight.
- The offline IT-flow deck source still quotes both old labels in `scripts/itflow/content.mjs`. A newly generated deck would repeat them. This is a downstream wording copy, not a production Help-page renderer or a migration issue.
- I found no second production statement limiting publication protection to B and OIL. The strip’s adjacent “The schedule is checked against it/them now” clause is the wording most likely to remain misleading after a narrow replacement.

**How to run the scenarios**

Use newly authored data in a fresh browser context with real storage, not `?fresh=1`. Create a Leave War period covering the dates. Keep the named test person free of unrelated tasks, inputs and manual awards. Confirm every fixture action saved before relying on it.

Create flying rows through the day’s Scheduler Board and `+ Wave`/`+ Line`; type each time in its own box and commit it. Use the real four sign-off controls before publishing. Use Changes → **All changes**, rather than New to you, to inspect your own actions.

Two reusable fixtures:

- **OIL fixture:** Full day of OIL `6h1`, default rally/report lead `3h`, debrief `2h`. On Saturday, Bane flies `10:00–11:15`, with no entered in-time/rally: **FO, 07:00–13:15**. Stiff has a desk `08:00–14:00`: **HO, 08:00–14:00**. Publish and verify those records first.
- **Rest fixture:** Scribe flies Monday at `20:00`, Land blank. Tuesday he flies `12:00–13:00`, B `09:40`, no in-time/rally. With debrief `2h` and rest `12h`, Monday ends `22:00`, clearance is Tuesday `10:00`, and Tuesday breaches.

The 35 scenarios below are ranked by their chance of exposing a missing path, beginning with specialised surfaces.

1. **Unloaded next Monday: forward picker and Sunday trace**

   **Steps:** (1) On next Monday create Scribe’s `12:00–13:00` flight, B `09:40`, and publish under debrief `2h`, rest `12h`. (2) Return to the previous Sunday. Create a `20:00` flight with blank Land, a suitable pilot already seated and Scribe’s seat empty. (3) Arm his seat, read his picker reason, then place him. (4) Open Sunday’s “Breaks Monday” line while Monday remains unloaded. (5) Load Monday and read its warning.

   **EXPECTED — D1990, D2010, D2005; picker/validator agreement:** clearance `10:00`; Sunday’s full sentence says took off `20:00` with no landing typed, ended `22:00`; loaded Monday agrees. The unloaded trace does not jump to an unrelated warning.

   **DISPROVES:** “landed” survives only on Sunday, loading Monday changes the answer, or the picker predicts different clearance.

2. **Older issued OIL version after a newer amendment**

   **Steps:** (1) Publish the OIL fixture as Original. (2) Raise threshold to `8h`, sign and publish AL1; Bane becomes HO. (3) Lower today’s threshold to `5h`. (4) On Edit Schedule look at Original, then AL1, then the working copy, opening each on the board too. (5) Inspect View-only and the tracker.

   **EXPECTED — D2014, D592(4), D142:** Original Bane FO; AL1 Bane HO; working candidate FO; automatic credit remains AL1’s HO. Looking writes nothing.

   **DISPROVES:** saved versions both use today’s threshold, looking changes credit, or leaving a look leaves another surface showing the wrong issued version.

3. **Off-screen week, then another day published meanwhile**

   **Steps:** (1) Publish the OIL fixture. (2) Navigate to another week. (3) Raise threshold to `8h`. (4) Create and publish another Saturday `10:00–11:15` flight for Bane. (5) Read both dates in the tracker and Leave War; revisit the first week and read again.

   **EXPECTED — D2014, D142; loaded/off-screen agreement:** first date FO, second date HO throughout.

   **DISPROVES:** publishing the second day reprices the first, revisiting changes it, or tracker and grid disagree.

4. **Withdraw AL1 and recover Original’s OIL settings**

   **Steps:** (1) Create Original FO, then AL1 HO under `8h`. (2) Change today’s threshold to `5h`. (3) Unpublish AL1, answering any actual confirmation. (4) Inspect issued stamp, View-only, grid, tracker and worked periods. (5) Undo and Redo the withdrawal.

   **EXPECTED — D142, D592(4); Unpublish contract:** withdrawal restores Original FO; Undo restores AL1 HO; Redo restores Original FO.

   **DISPROVES:** withdrawal removes all credit despite Original remaining issued, uses today’s settings, or Undo restores only the version stamp.

5. **Undo/Redo two publications without repricing the other day**

   **Steps:** (1) Publish the OIL fixture, raise threshold to `8h`, publish AL1 HO. (2) Publish a second earning day under `8h`. (3) Undo the second publication, then AL1. (4) Redo AL1, then the second publication. (5) After every press inspect both dates, global threshold and credits.

   **EXPECTED — D142 and the Undo contract:** each publication and its resulting credit move together; undoing one date does not reprice another or undo the setting accidentally.

   **DISPROVES:** a withdrawn version’s credit survives, another date changes, or the wrong action is undone.

6. **Insights: the less-obvious check-name consumer**

   **Steps:** (1) File Ratchet’s all-day leave and another person’s all-day ATT C on Tuesday. (2) Put both on ground `BRIEFING`, `09:00–10:00`; establish both warnings and record counts/messages. (3) Publish. (4) Open Insights from Edit Schedule, View-only and the board. (5) Repeat through their phone menus.

   **EXPECTED — D2009; shared-name and Insights contracts:** both new “… + planned” names appear; counts agree between doors and remain unchanged by renaming.

   **DISPROVES:** an old label, a missing type, changed count, or a different warning world from one opener.

7. **Day ⓘ must describe the face actually being viewed**

   **Steps:** (1) Use scenario 6’s published Tuesday; open View-only’s ⓘ and press Ratchet’s warning. (2) On Edit Schedule change BRIEFING’s end to `10:15`. (3) Inspect working-copy ⓘ. (4) Look at the issued version and inspect ⓘ again, including on the board.

   **EXPECTED — D2009; day-details face contract:** new check labels, unchanged task messages; details describe their visible face. Pressing the issue identifies the correct puck.

   **DISPROVES:** stale names in a version look, working pending information leaking into issued details, or a broken issue jump.

8. **Published target’s kept debrief, then its amendment**

   **Steps:** (1) Build the rest fixture and publish Tuesday under `2h` debrief. (2) Set debrief to `1h`; inspect Tuesday without editing it. (3) Change Tuesday’s remarks. (4) Compare working board/week/ⓘ with View-only. (5) Sign and publish the amendment.

   **EXPECTED — D2005, D2013, D2010:** untouched issued Tuesday retains `+2h`, end `22:00`, clearance `10:00`, with truthful take-off wording. Edited working copy previews `1h`; amendment adopts it, clearing the `09:40` report.

   **DISPROVES:** the Logic change rewrites the issued clearance, words and arithmetic use different debriefs, or amendment retains stale judgement.

9. **OIL amount holds, but stored worked periods must hold too**

   **Steps:** (1) Publish Saturday flight `08:00–09:30`, entered in-time `05:00`, debrief `2h`: FO, `05:00–11:30`. (2) Raise debrief to `4h`. (3) Read tracker, day sheet and To go out. (4) File leave `12:00–14:00` through Inputs. (5) Publish the amendment and reread periods and clash.

   **EXPECTED — D592(4), its stored-period reading, D45:** before amendment, periods remain `05:00–11:30`; the Logic change is pending even though FO stays FO. After amendment, periods become `05:00–13:30` and the overlap is recognised.

   **DISPROVES:** times change early while amount holds, pending ignores changed periods, or the leave clash uses candidate periods before amendment.

10. **The Logic note must explain a non-OIL setting**

    **Steps:** (1) Publish Tuesday with an `11h40` rest interval under a `12h` rule and its breach. (2) Keep an equivalent Thursday unpublished. (3) Lower Crew rest to `11h`; read strip and setting row together. (4) Inspect Tuesday issued and Thursday draft. (5) Edit Tuesday’s remarks, compare working/issued warnings, then amend.

    **EXPECTED — D2005, D2013, D2015:** issued Tuesday retains its breach; Thursday clears immediately; Tuesday’s edited candidate previews the new rule; amendment adopts it. The note explains these states.

    **DISPROVES:** the note promises immediate rechecking of issued faces or still restricts protection to printed B/OIL.

11. **Last incomplete flight after an earlier real landing**

    **Steps:** (1) Monday give Scribe A `10:00–11:00` and B take-off `20:00`, Land blank; use the rest fixture’s Tuesday. (2) Read Tuesday’s warning and Monday’s trace. (3) Drag B before A, then after A; reread and press the trace each time.

    **EXPECTED — D1990, D2010; latest effective end contract:** B sets end `22:00`, clearance `10:00`, and truthful take-off wording regardless of displayed order. Trace identifies B.

    **DISPROVES:** the earlier landing wins, ordering changes clearance, or the trace identifies A.

12. **A real landing later than the incomplete flight’s assumed end**

    **Steps:** (1) Monday A is `19:00–23:00`; B takes off `20:00`, Land blank. (2) Tuesday is `14:00–15:00`, B `11:40`. (3) Read warning, then move B before and after A.

    **EXPECTED — last-commitment contract:** A ends work at `01:00`, clearance `13:00`, and the sentence correctly says “landed 23:00”.

    **DISPROVES:** greatest take-off or last displayed row wrongly selects B’s `22:00` assumed end.

13. **A later non-flying event wins; deletion from Inputs reveals the flight**

    **Steps:** (1) Build the rest fixture. (2) File Monday Meeting `22:30–23:00` for Scribe through Inputs; confirm its programme row. (3) Read Tuesday’s warning and Monday’s trace. (4) Delete the Meeting from Inputs; return and reread. (5) Undo/Redo deletion.

    **EXPECTED — last-commitment contract, D2010:** Meeting present: plain “ended 23:00”, clearance `11:00`, without flight/debrief wording. Gone: took off `20:00`, no landing typed, end `22:00`, clearance `10:00`. Undo/Redo restores both words and arithmetic.

    **DISPROVES:** a ground event acquires landing prose or another-page deletion leaves stale results.

14. **Amber tight-rest branch without a hard breach**

    **Steps:** (1) Monday Scribe takes off `18:00`, Land blank. (2) Tuesday flight `10:30–11:30`, B `08:10`, no in-time/rally. (3) Open week issues, ⓘ and board issues.

    **EXPECTED — D2010, D1988/D1989:** the nominal `07:30` report prompts the amber reminder, but B clears `08:00`. Its tail says took off `18:00`, end `20:00`, clearance `08:00`. No hard breach is introduced.

    **DISPROVES:** only the hard-warning branch gets corrected, or the wording change adds a hard ring/trace.

15. **Exact promised sentence, compact picker and all message copies**

    **Steps:** (1) Monday Scribe takes off `12:00`, Land blank. (2) Tuesday create `04:00–05:00`, B `01:30`, suitable other crew seated. (3) Before placing Scribe read the armed picker; place him. (4) Read week/board issues, ⓘ and Monday’s trace. (5) Open a real ALL/ALL AVAIL window representing him and read his warning reason. Repeat visible checks at phone width.

    **EXPECTED — D2010; shared-warning agreement:** full-message copies contain “Mon took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00”. Picker’s compact reason agrees on clearance.

    **DISPROVES:** one full copy still says landed, a key fact is clipped, or picker and placed result disagree.

16. **Midnight is a typed landing; clearing it changes provenance**

    **Steps:** (1) Monday `20:00–00:00`; Tuesday `15:00–16:00`, B `12:40`. (2) Read warning. (3) Change Land to `00:30`; reread. (4) Clear Land; inspect, Undo and Redo.

    **EXPECTED — D2010; overnight arithmetic:** typed midnight says landed, end `02:00`, clearance `14:00`; `00:30` gives `02:30`/`14:30`. Blank uses take-off/no-landing wording and end `22:00`/clearance `10:00`, clearing Tuesday’s breach.

    **DISPROVES:** zero is mistaken for missing, or Undo restores numbers but the wrong verb.

17. **Equal typed take-off and landing is not missing**

    **Steps:** (1) Monday `20:00–20:00`; use rest-fixture Tuesday. (2) Inspect warning, trace, ⓘ and equal-time advisory. (3) Clear Land, inspect, then Undo.

    **EXPECTED — D49, D2010:** typed equality says “landed 20:00”; blank says took off/no landing. Both produce end `22:00`, clearance `10:00`. The equal-time advisory remains in the typed state.

    **DISPROVES:** equality is used to detect missing landing or the verb never changes.

18. **TBD: exercise the required reader without pretending the time cell saves it**

    **Steps:** (1) Host runs `src/engine/rulesfirst-3-crew-rest.test.ts`, case `D1990: a blank landing and a "TBD" landing both end the day for tomorrow's crew rest at take-off + debrief`. (2) Retain its `TBD`, `tbd`, ` TBD ` loop and add an explicit truthful-wording assertion. (3) Retain its exact-clearance and missing-take-off negatives. (4) Exercise another non-time landing in a newly constructed fixture for D2022.

    **EXPECTED — D1990, D2010, D2022:** blank/TBD borrow the same take-off and say so; without take-off there is nothing to borrow.

    **DISPROVES:** TBD retains landed wording or missing clocks invent an end.

    The normal production time writer refuses TBD. A planted old record alone is not a UI finding.

19. **Long-day, Insights and paperwork must not adopt the rest fallback**

    **Steps:** (1) Create sortie `06:00–07:00` plus ground work `10:00–19:00`; record long-day note and Insights hours. (2) Clear sortie Land and reread. (3) Publish newly; export CSV/PDF. (4) Enter a real Land again and repeat.

    **EXPECTED — D1936; actual landing-column contract:** unfinished sortie contributes neither endpoint to work hours; remaining work is nine hours. It supplies no “last landing 06:00”. Paperwork leaves Land blank.

    **DISPROVES:** rest-wording work causes extra hours, an unfinished-flight long-day endpoint, or a fabricated exported landing.

20. **Threshold raised and lowered, including the exact boundary**

    **Steps:** (1) Publish the OIL fixture. (2) Set threshold successively to `6h`, `5h`, `8h`. (3) At each state inspect working week/board OIL figures, issued View-only, grid/day sheet, tracker and Balances. (4) Publish the final amendment and reread all.

    **EXPECTED — D2014, D592; threshold contract:** Stiff’s 360 minutes is HO at 361, FO at 360. Issued Bane FO/Stiff HO hold until amendment; at `8h` the amended results are HO/HO everywhere.

    **DISPROVES:** boundary disagreement, an early issued-credit change, or inconsistent downstream balances.

21. **Undo/Redo the Logic change from another page**

    **Steps:** (1) Publish the OIL fixture and visibly establish four valid sign-offs. (2) Raise threshold to `8h`. (3) Inspect strip, pending marks/list, signatures and credit. (4) From Edit Schedule press Undo once, then Redo.

    **EXPECTED — D592, D98, D103; settings Undo contract:** changed state has one OIL-values pending item, invalidated sign-offs and unchanged issued FO. Undo returns to Logic, restores the value, clears pending and restores valid signatures; Redo repeats the changed state.

    **DISPROVES:** stored setting changes without repainting dependants or issued credit moves on Undo/Redo.

22. **A threshold change between signatures**

    **Steps:** (1) Create an unpublished OIL-fixture flight under `6h1`. (2) Obtain two signatures. (3) Raise threshold to `8h`. (4) Obtain the other two; inspect earlier/later signatures and publish eligibility. (5) Restore the setting. Repeat with an amendment already waiting.

    **EXPECTED — D592’s signed-candidate reading, D103:** signatures promising a different OIL record become invalid; later signatures bind the new result. Restoring the value restores appropriate validity.

    **DISPROVES:** FO signatures publish HO unchanged or signatures cannot recover when their promised state returns.

23. **Logic-values pending beside a separate OIL decision**

    **Steps:** (1) Publish the OIL fixture; raise threshold to `8h`. (2) In OIL Earn switch Bane’s flight off. (3) Open pending marks → To go out and read every entry. (4) Undo only the switch. (5) Restore the threshold.

    **EXPECTED — D592; pending-list contract:** decision and Logic-values comparison remain separate changes. The Logic line describes recalculating the published content, while the switched-off candidate earns nothing. Undoing one does not clear both.

    **DISPROVES:** misleading final-amendment claims, missing entries or one reversal removing unrelated pending work.

24. **Holiday made after weekday publication**

    **Steps:** (1) Publish Monday desk `08:00–14:00` as an ordinary weekday. (2) Declare PH from Leave War; answer or postpone actual OIL questions. (3) Lower threshold to `5h`. (4) Inspect schedule, grid and tracker. (5) Publish Monday’s amendment.

    **EXPECTED — D2, D2003, D2014:** no automatic credit before amendment. Amber text is exactly “Publish this day again so OIL is earned. The PH was set after the day was published.” Amendment gives FO under current `5h`.

    **DISPROVES:** PH/setting change credits early, amber line disappears, or amendment retains the old non-earning result.

25. **Holiday removed after publication, including Undo/Redo**

    **Steps:** (1) Publish Monday PH desk `08:00–14:00`, HO at `6h1`. (2) Raise threshold to `8h`. (3) Remove PH; inspect amber line, grid, tracker and Balances. (4) Undo/Redo removal. (5) Amend after final removal.

    **EXPECTED — D2, D2004, D142:** HO holds while removal waits. Removed state says “Publish this day again to withdraw the OIL. The PH was removed after the day was published.” Amendment withdraws the credit.

    **DISPROVES:** early withdrawal, duplicate credit after Undo, or threshold change suppressing the holiday warning.

26. **Placeholder crowd, named person and overlaid membership window**

    **Steps:** (1) Publish Saturday Common Programme `08:00–14:00` with ALL AVAIL, plus a separate named-person row, under `6h1`. (2) Record represented names/count through the count chip. (3) Lower threshold to `5h`. (4) Inspect issued and working copies, board, chip/window, green marks and earning figures.

    **EXPECTED — D44, D43, D2014:** issued membership and HO figures hold; candidate figures become FO. Count, names and earning marks agree within each face. The window’s controls remain reachable above the board.

    **DISPROVES:** today’s crowd leaks into issued content, count differs from represented people, or an overlay hides the usable door.

27. **Other OIL settings: no assumed duration may mint credit**

    **Steps:** (1) Publish a Saturday ALL AVAIL sim starting `08:00`, blank end, and a ground/duty row starting `13:00`, blank end. (2) Change “A sim” and “Any other row” assumed lengths enough to affect availability. (3) Compare issued and candidate crowd windows and OIL reasons. (4) Enter real ends and amend. (5) On complete timed rows separately change sim/AMT debrief, EP brief, brief lead and clash grading.

    **EXPECTED — missing-end/OIL and frozen-crowd contracts:** unfinished rows earn nothing; issued crowd stays kept; real ends can earn after amendment. For any other setting whose OIL effect has no named contract: **RECORD exactly what it says**.

    **DISPROVES:** assumed lengths create credit or a newly discovered current-setting read silently reprices an issued record. Report such a read to the host rather than inventing its policy.

28. **A fresh input’s OIL answer is distinct from issued input credit**

    **Steps:** (1) File timed Training `08:00–14:00` on Saturday, answer Yes under `6h1`, and publish. (2) Lower threshold to `5h`; inspect issued credit. (3) File a new identical input on another earning day and open its OIL question. (4) Answer it; reopen the first date’s tracker and day.

    **EXPECTED — D592; current-input question contract:** first issued credit remains HO until amendment; the fresh question may offer current FO. One answer must not reprice another published day.

    **DISPROVES:** opening/answering the fresh question changes the first credit or a current offer is presented as the old issued entitlement.

29. **History, print and export: verify their actual scope**

    **Steps:** (1) Publish the OIL fixture; inspect All changes. (2) Change threshold, Undo, Redo; inspect All changes and To go out. (3) Amend and read amendment summary. (4) Use “Export to Excel (CSV)” and “Export as PDF (print)”; inspect actual output.

    **EXPECTED — current history/export contracts:** pure settings changes and their Undo add no history lines; automatic credit is not a history action. To go out exposes the OIL comparison. CSV/PDF export issued flying content and have no OIL/warning fields.

    **DISPROVES:** exported working content is stamped published, controls do nothing, or any OIL field actually present uses an inconsistent value. For ordinary browser-print OIL without a defined contract: **RECORD exactly what it says**.

30. **One new name across every qualifying row family**

    **Steps:** (1) File all-day leave. (2) Put its person, one case at a time, on flying, sim, duty, ground BRIEFING, Common Programme and extra-person rows, removing the preceding case. (3) Read bold label, ⓘ and board message each time. (4) Clear a non-flying row’s times and repeat. (5) Repeat representative cases with ATT C. Include part-day absence against an untimed row as the negative.

    **EXPECTED — D2009, D605:** qualifying warnings share “… + planned”; messages retain their specific flight/task/row/reason words. Whole-day absence still flags untimed tasks; part-day absence without comparable times stays silent.

    **DISPROVES:** a row-specific old label, a blanket message rewrite, or changed warning eligibility.

31. **Renaming must preserve standby and ATT B exceptions**

    **Steps:** (1) Put a locally-on-leave person on standing SC SPARE. (2) Make that row fly using B/R; compare. (3) Repeat standing SPARE with overseas leave and downchit. (4) Put ATT B on an ordinary ground/duty row, then a flight and standby desk.

    **EXPECTED — D2009 and existing standby/ATT B contracts:** warning presence and exemption stay as before; wherever a warning exists its shared label changes, while its specific message remains. ATT B’s permitted ground work must not become flying.

    **DISPROVES:** renaming broadens checks, drops an exemption or changes task prose into a flight claim.

32. **Hidden, restored and “goes away once signed” names**

    **Steps:** (1) Use scenario 6’s published day. (2) Hide Ratchet’s warning on Edit Schedule; inspect its struck line and restore. (3) Hide again, restore from the board. (4) Remove Ratchet from BRIEFING; inspect the pending “goes away” row. (5) Compare View-only.

    **EXPECTED — D2009, D469/D471/D475:** every label-bearing renderer uses the new name; board message remains unchanged. Hide/restore identity works across copies; issued state waits for amendment.

    **DISPROVES:** stale wording only on struck/gone rows, inert restore, or a working hide/removal changing the issued warning immediately.

33. **Strip visibility, search/filter, singular/plural and member reading**

    **Steps:** (1) Reset to standard; confirm no strip. (2) Change only In-time words; confirm its own reset mark but no strip. (3) Change Crew rest, read singular strip, search each new check name, then use Warnings/Fired this week. (4) Change debrief too and read plural. (5) Sign in as member and inspect Logic. (6) Return as admin and reset the numeric changes.

    **EXPECTED — D2015; changed-settings and permissions contracts:** text preference alone raises no strip; numeric changes do; names remain searchable/filterable; note explains next amendment; member reads without edit controls; resets clear the strip appropriately.

    **DISPROVES:** wrong visibility/count grammar, old B/OIL-only wording, vanished checks or member-editable fields.

34. **Refused settings, tolerated formats and immediate Done/Reset**

    **Steps:** (1) On Logic enter Crew rest `abc`; commit and inspect restored value/refusal. (2) Enter equivalent valid duration spellings and confirm one value. (3) Try Full day of OIL `59`, then `13h`; commit each. (4) Type a valid threshold and immediately press Done without an intervening blur. (5) Repeat with immediate row Reset/Reset all. (6) Inspect setting, strip, pending, signatures and issued credit; Undo/Redo the accepted action.

    **EXPECTED — robustness doctrine, declared bounds and existing Done/reset contract:** invalid values return to the live value; valid spelling is normalised; accepted edits/reset land in the user’s order; all dependants repaint; issued credit remains kept.

    **DISPROVES:** invalid text looks saved, a delayed edit overwrites Reset, Done loses the value, or settings and dependants disagree.

35. **Load an older version onto the working copy; reload and change roles**

    **Steps:** (1) Create Original FO and AL1 HO as in scenario 2. (2) Look at Original and press “Load onto working copy”, answering its actual confirmation. (3) Inspect candidate, latest issued View-only, pending list and tracker. (4) Switch to another saved plan through its real menu and inspect again. (5) Reload and confirm a fixture-specific fact survived. (6) Inspect as member, then guest; finally sign out.

    **EXPECTED — D592, D142 and load/plan contracts:** loading or switching changes the candidate; AL1 remains the issued credit until another publication. Reload preserves newly created records. Member reads the same issued entitlement; guest sees issued schedule only; signed-out/pending access has no editing door.

    **DISPROVES:** loading Original silently restores its credit, a saved plan replaces kept settings on an issued version, reload reprices new data, or role change exposes candidate/editing controls incorrectly.

**Five gotcha families covered**

| Family | Scenarios |
|---|---|
| People not following the format | 18, 34; also repeat scenario 15’s take-off as `1200`, `1200H`, `12:00` |
| Missing input | 11, 15, 18, 19, 27, 30 |
| User errors | 17, 18, 34; attempt invalid landing `1290` and confirm refusal restores the value |
| Deletions and edits from another page | 9, 13, 23, 24, 25, 35 |
| Sync between copies | 1–8, 20–29, 32, 35 |

**Exact existing test inputs for the host**

Run the relevant named cases after the build; their existence is not a current pass.

- `src/leavewar/oilworkstart-published.test.ts`:
  - `the full-day threshold, both ways — for a flying line and for a desk`
  - `a week that is off screen keeps its published OIL too`
  - `each of the three values, each way`
  - `a change that moves only a man's WORKED TIMES is pending too; the record holds until the day goes out again`
  - `the next amendment moves the OIL and stores the new values`
  - `a value changed between two signatures: the earlier ones fall, the later ones stand (Sol's finding 1)`
- `src/ui/oilworkstart.test.tsx`: `the full-day line: the face reads its own`; `a change to the OIL decisions AND a Logic change on one day are two changes, both listed`.
- `src/engine/rulesfirst-3-crew-rest.test.ts`: the D1990 case named in scenario 18; `blank and TBD landings: no hours, no note; the same sortie with its landing typed makes a 16h day`.
- `src/ui/crewrest-ui.test.ts`: `the forward trace across the week edge`.
- `src/ui/logic.test.tsx`: `every warning code the engine can raise is a check, named as the warning list names it`; `words alone: no strip, Reset still offered; a number brings the strip back`; `a member never renders an editable field`; the one-press Done case.
- `src/state/undo-wire.test.ts`: `a Logic rule change is undone — the rule itself back`; `a Logic rule undone from Edit Schedule lands on the Logic page`.
- `e2e/oilworkstart.spec.ts`: existing OWS6/OWS7/OWS8 publication → Logic change → pending → amendment route.
- `e2e/restblank.spec.ts`: existing real-control fixture route.
- `e2e/logicedit.spec.ts`: LE1–LE4.

The builder should add explicit D2010 wording assertions: equality between blank and TBD messages alone can let both retain the same wrong “landed” sentence. Likewise, preserve behaviour assertions when updating old-name test readers; do not let renamed text make their selected lists empty.

Do not use old missing/invalid kept-value records as D2014 findings. Every historical-version, reload and withdrawal scenario above creates its records anew through current publication paths.

**Status:** scenario design complete; runtime results remain for the host. No post-compaction handoff block was received. **Rulings: none this session.**