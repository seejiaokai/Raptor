**Read-only scenario report: 104 scenarios.** No files changed, builds run, tests run or servers started. The application source matches the revision named in the brief. These are proposed checks, not runtime results.

Two expectations in the brief conflict with earlier build instructions: earned leave using entered reporting times, and the Add button always using the nominal lead. Those conflicts are identified below rather than silently resolved.

For the later walk:

- Create new examples through the app’s controls in an isolated browser profile. Use Mon 13–Sun 19 Jul 26 and the following week.
- Unless stated otherwise, use an admin, desktop 1440×900 and phone 390×844. Repeat layout checks at 320×568 and short landscape 844×390; check 820/821px where the layout changes.
- “Publish” includes completing the four sign-offs. At every publication stage exercised below, record the screen, reload, then sign out and back in to verify saved results. Undo history itself need not survive sign-out.
- Failed-save scenarios require a controlled storage-write failure supplied by the later browser runner. Make all actual edits and retries through app controls. This is an environmental fault, not an injected schedule or a claim to have filled a real disk.
- Exclude old-data-only migration problems under D56. Every scenario below concerns newly created data or current gestures.

**P1-01 — Loading an issued version does not silently discard other work**  
Surface/ruling: Board version preview and Amendments; D488.  
**SETUP:** Publish Monday, change its Remarks, and change Tuesday’s unpublished day note. **ACTION:** Preview Monday’s Original; use “Load onto working copy” and its confirmation. **EXPECTED:** Monday follows the existing load behavior; Tuesday’s text and marks remain. No Discard marks control appears. **DISPROVES:** Tuesday loses marks, Monday changes before confirmation, or a replacement clearing action appears.

**P1-02 — Mixed published and unpublished changes remain distinct**  
Surface/ruling: Edit Schedule’s Amendments box; D488.  
**SETUP:** Publish Monday; leave Tuesday unpublished. Edit both days. **ACTION:** Open Amendments and publish Monday’s next amendment. **EXPECTED:** Monday alone is issued; Tuesday retains its edits and unpublished marks. **DISPROVES:** Publishing Monday clears Tuesday’s marks or issues both days.

**P1-03 — First publication clears marks without clearing text**  
Surface/ruling: Week and Board; D488.  
**SETUP:** On unpublished Wednesday, change a formation Mission, a reporting line and a section note. **ACTION:** Inspect marks in both editors, then publish Wednesday. **EXPECTED:** Entered content survives; unpublished change marks clear through publication. **DISPROVES:** Marks disappear beforehand, remain as unpublished changes afterward, or text is reverted.

**P1-04 — Undo and Redo still belong to the edit**  
Surface/ruling: Week, History and Amendments; D488, D148.  
**SETUP:** Change Thursday’s day note. **ACTION:** Undo, Redo, open History and reload. **EXPECTED:** Text and marks follow the edit; history contains the actual edit, not a marks-cleared operation. **DISPROVES:** Undo clears unrelated changes or Redo restores text without its corresponding state.

**P1-05 — Unpublish preserves the existing day lifecycle**  
Surface/ruling: Day controls and Amendments; D488.  
**SETUP:** Publish Friday, make and issue an amendment. **ACTION:** Use the available Unpublish flow, edit the resulting working copy, then republish. **EXPECTED:** Existing confirmations and version behavior remain; there is no separate way to clear unpublished marks. **DISPROVES:** Unpublish loses working content, resurrects Discard marks, or bypasses required sign-offs.

**P1-06 — The removed button stays absent across roles and sizes**  
Surface/ruling: Phone and desktop Amendments; D488, D487, D292.  
**SETUP:** Keep draft changes and a published day with pending changes. **ACTION:** Inspect as admin, switch to member view, then sign in as a member and guest. **EXPECTED:** No Discard marks action; remaining controls keep their size and role restrictions. **DISPROVES:** A hidden-width or role-specific clearing door remains, or neighboring buttons become unusable.

**P2-01 — Published earned leave survives a Logic change**  
Surface/ruling: Leave War OIL tracker; D48, D142.  
**SETUP:** Give Saber one Saturday flight, take-off 12:00 and landing 13:00, nominal report lead 180 minutes and debrief 120 minutes. Publish; confirm HO, 0.5 earned. **ACTION:** Change the nominal lead to 240 minutes; revisit Leave War, switch weeks and reload without amending Saturday. **EXPECTED:** Saturday retains HO. **DISPROVES:** It becomes FO solely because Logic changed. This is independent of the reporting-policy conflict.

**P2-02 — An entered report crosses the six-hour boundary upward**  
Surface/ruling: Saturday’s schedule, Insights and Leave War; brief’s piece-2 promise, D498, D505, D142.  
**SETUP:** Use the Saturday flight above with entered In-time 09:00. **ACTION:** Change only In-time to 08:59; inspect before and after issuing the amendment. **EXPECTED UNDER THE BRIEF:** Work becomes 6h01; earned leave stays HO before amendment and becomes FO afterward. **DISPROVES:** Issued earned leave ignores the entered report or changes before amendment. Earlier design explicitly specifies nominal OIL instead; record this as a contract conflict.

**P2-03 — An entered Rally crosses the boundary downward**  
Surface/ruling: Published holiday and Leave War; brief’s piece-2 promise, D497, D142.  
**SETUP:** Declare Tuesday a public holiday through Leave War; create a 12:00–13:00 flight with Rally only at 08:59 and publish. **ACTION:** Change Rally to 09:00; publish its amendment. **EXPECTED UNDER THE BRIEF:** FO becomes HO only after amendment; Insights shows exactly six hours. **DISPROVES:** FO remains because Rally is ignored, or credit changes while the edit is pending. The same policy conflict applies.

**P2-04 — Sunday reporting does not credit the wrong date**  
Surface/ruling: Week boundary, warnings and Leave War; D503, D42, D142.  
**SETUP:** Give Saber a Sunday duty ending 15:00. On Monday 20 Jul add a 00:30–01:30 flight reporting at 22:30, meaning Sunday evening. **ACTION:** Publish the relevant days; navigate Sunday→Monday→Sunday and inspect rest and OIL. **EXPECTED:** Reporting says previous day; rest uses Sunday 22:30. Monday’s flight does not create Sunday credit; Monday earns only if eligible itself. **DISPROVES:** Double credit, wrong-date credit or a 24-hour rest error.

**P2-05 — A previous-day report still finds an older commitment**  
Surface/ruling: Warning list and dotted “breaks” mark; D498, D503.  
**SETUP:** Give Saber Sunday work ending 23:00, no Monday work, then a Tuesday 01:00 flight reporting Monday 08:00. **ACTION:** Inspect Tuesday’s rest warning and return to Sunday. **EXPECTED:** The nine-hour gap is measured from Sunday’s finish; any source trace names the correct target day. **DISPROVES:** Empty Monday erases the breach or the trace points to Monday’s nonexistent row.

**P2-06 — Specific overrides apply separately to each activity**  
Surface/ruling: Week and Board reporting lines; D500, D505.  
**SETUP:** Monday wave has VL and RU, both taking off at 12:00. Enter general In-time 08:00 and VL Rally 08:30. **ACTION:** Inspect both crews; then add VL In-time 09:00. **EXPECTED:** Initially both report at 08:00; afterward VL starts at 08:30 and RU at 08:00. **DISPROVES:** VL Rally suppresses general In-time before the specific In-time exists, or RU inherits VL’s instruction.

**P2-07 — Duplicate lines compare dates before clocks**  
Surface/ruling: Reporting editor and Insights; D503, D506.  
**SETUP:** A Tuesday formation takes off at 01:00. Enter its In-time at 23:00 and 00:15. **ACTION:** Reverse their order by editing the two lines. **EXPECTED:** Previous-day 23:00 remains earliest; work hours do not change. **DISPROVES:** 00:15 wins numerically or the last line wins.

**P2-08 — Add uses the promised nominal lead**  
Surface/ruling: “+ In-time / Rally” on week and Board; D510, D511.  
**SETUP:** Take-offs are 12:00 and 13:00; nominal lead is 180 minutes. **ACTION:** Add a reporting line, change it to 08:00, change Logic lead to 120 minutes, then add another. **EXPECTED UNDER THIS BRIEF:** First line is 09:00; second is 10:00. **DISPROVES:** Second line copies 08:00. Earlier fix instructions expressly preserve an existing resolved report; retain that discrepancy with the result.

**P2-09 — Custom default wording uses the same parser**  
Surface/ruling: Logic and both Add buttons; D510, D511, D501.  
**SETUP:** Set default words to “RALLY”; use a new wave without reporting lines. **ACTION:** Add, then repeat with blank words and with “RALLY — check 13:00”. **EXPECTED:** Rally is recognized; blank restores the stated default; the generated first clock remains operative. **DISPROVES:** The prose clock takes over, blank creates an unusable setting, or week and Board differ.

**P2-10 — Suggested brief produces a warning, not a publication block**  
Surface/ruling: Reporting feedback, warning list and publishing; D509.  
**SETUP:** Take-off 12:00, blank Brief, suggested brief 09:40, Rally 10:00. **ACTION:** Commit Rally, inspect the red warning, then publish and issue another amendment while the warning remains. **EXPECTED:** Message says “suggested brief”; both publication routes remain available after sign-off. **DISPROVES:** It names a typed brief or refuses publication for timing alone.

**P2-11 — Equal Rally and Brief remain legal**  
Surface/ruling: Week and Board; D507, D509.  
**SETUP:** In-time 08:00, Rally 09:40, Brief 09:40, take-off 12:00. **ACTION:** Change Rally to 09:41, then back. **EXPECTED:** Equality produces no Rally-after-Brief warning; one minute later does; correcting it removes that warning. **DISPROVES:** Equality is rejected or an obsolete warning remains.

**P2-12 — Missing and malformed clocks do not invent attendance**  
Surface/ruling: Reporting feedback and Insights; D501–D503, D509.  
**SETUP:** Create a wave with no take-off, an empty formation and reporting text “RALLY AFTER IN TIME”. **ACTION:** Add an invalid clock, then valid take-off and In-time; cancel the formation afterward. **EXPECTED:** Missing data stays explainable and editable; valid data resolves; cancellation removes its work contribution. **DISPROVES:** Negative/invalid hours, fabricated midnight attendance or cancelled work still counted.

**P2-13 — Formation names are bounded; personal names are not targets**  
Surface/ruling: Reporting editor; D500, D504.  
**SETUP:** A wave contains VL and VL2. **ACTION:** Enter “08:00 VL IN TIME”, then an unnamed line containing only a crew member’s name; try accepted clock spellings. **EXPECTED:** VL’s line does not target VL2; personal names introduce no individual attendance rule; accepted times normalize consistently. **DISPROVES:** Partial callsign matching or person-specific reporting appears.

**P2-14 — Standby work does not become ordinary flying**  
Surface/ruling: SC MAIN/SPARE, AVALON, BB, Insights and OIL; D516, D24, D35.  
**SETUP:** Put different people on SC MAIN, SC SPARE, AVALON and BB rows with known times. **ACTION:** Inspect hours and sorties; publish Saturday and inspect OIL defaults, then explicitly enable an exempt seat. **EXPECTED:** No standby sorties; SC MAIN contributes work; exempt OIL defaults remain off unless enabled. **DISPROVES:** Rally changes turn standby into sorties or silently enable credit.

**P2-15 — Earlier work affects only its own person**  
Surface/ruling: Duty, sim, ground and Common Programme; D498.  
**SETUP:** VL crew report 09:00 and finish 15:00. Give only Saber a 06:00 duty; add timed sim, ground and Common Programme rows for separate people. **ACTION:** Inspect individual work-hours bars; cancel and restore each added row. **EXPECTED:** Saber’s day begins 06:00; his cockpit partner remains at 09:00; each row affects only qualifying occupants. **DISPROVES:** One person’s duty advances the whole formation or cancelled rows remain counted.

**P2-16 — Long-day, rest and seven-day warnings remain distinguishable**  
Surface/ruling: Warning list, pucks and Insights; D498, D503, D509.  
**SETUP:** Schedule one person over seven consecutive days, with a long reporting-to-release span and a short rest gap. **ACTION:** Inspect and select each warning, then shorten the long day without removing a worked date. **EXPECTED:** Hours and long-day warning update together; the seven-day warning remains; trace clicks identify the proper cause. **DISPROVES:** Fixing one warning hides another or counts the reporting date as an extra scheduled day.

**P2-17 — Every reader respects the publication boundary**  
Surface/ruling: View-only, older version, next-week peek, print and CSV; D478, D509.  
**SETUP:** Publish Monday with a reporting warning, then correct the working copy without amending. **ACTION:** Inspect all listed readers and export using app controls; then amend. **EXPECTED:** Issued readers retain issued wording/warnings until amendment; historical previews retain their version. Existing export contents remain intact—do not invent a requirement for new reporting columns. **DISPROVES:** Pending wording leaks into an issued output or old versions change.

**P2-18 — Reporting survives plans, templates and week travel**  
Surface/ruling: Saved plans, day templates and History; D500–D506, D148.  
**SETUP:** Create a day with specific/general reporting lines and save it as a plan and day template. **ACTION:** Switch plans, apply the template to another day, Undo/Redo and visit the next week. **EXPECTED:** Text, scope and dates resolve against the destination’s formations and take-offs; history describes the actual operation. **DISPROVES:** Stale source-day interpretation, lost lines or unrelated-day changes.

**P3-01 — Published and working wording can hold different answers**  
Surface/ruling: Board’s latest-published Remarks door; D530, D532.  
**SETUP:** Publish Monday’s ACM formation with “DS for RU”, unanswered. Change working Remarks to “DS from RU”. **ACTION:** Answer Red on the latest-published view, then Blue on the working copy. **EXPECTED:** Insights uses published Red until the wording amendment goes out, then working Blue; role answers alone change neither pending count nor signatures. **DISPROVES:** One answer overwrites the other context.

**P3-02 — An older version cannot edit today’s mission role**  
Surface/ruling: Board version selector; D530, D532.  
**SETUP:** Publish Original and AL1 with different cue wording. **ACTION:** Focus Remarks on Original, then latest AL1. **EXPECTED:** Older preview offers no role writer; latest published view offers the guarded read-only Remarks door. **DISPROVES:** An old preview changes current statistics or latest published access is absent.

**P3-03 — Reissued versions do not reuse a stale open question**  
Surface/ruling: Board question and publication controls; D530, D535.  
**SETUP:** Open an unanswered question on the latest issued day. **ACTION:** Leave the preview, Unpublish/reissue using ordinary controls, then return. **EXPECTED:** The old question is gone; a new choice applies only to the current version/context. **DISPROVES:** A previously captured question remains actionable across replacement.

**P3-04 — Day templates carry independent answers**  
Surface/ruling: Day templates, History and Undo; D525, D530.  
**SETUP:** Save a template containing an answered conditional formation. **ACTION:** Apply it Tuesday; change Tuesday’s answer; inspect Monday; Undo and Redo the application. **EXPECTED:** Destination answer is independent; template application and its copied answer travel together; History names the formation. **DISPROVES:** Monday changes, orphan answers remain after Undo, or history exposes an opaque identifier.

**P3-05 — Saved plans restore the matching context**  
Surface/ruling: Saved plans; D525, D530.  
**SETUP:** Save plan A with “DS for RU” answered Red and plan B with different wording answered Blue. **ACTION:** Switch A→B→A, then reload. **EXPECTED:** Each restored formation uses its matching answer; merely switching plans opens no burst of questions. **DISPROVES:** Answers follow list position or the last-opened plan.

**P3-06 — Typed text is saved before a choice is applied**  
Surface/ruling: Week and Board Remarks; D526, D529, D530.  
**SETUP:** Focus an answered conditional Remarks box. **ACTION:** Change its cue wording without leaving the box, press Change mission role, then choose the opposite side. **EXPECTED:** Visible wording saves first; the answer belongs to that wording; subsequent typing continues in the correct box. **DISPROVES:** The choice answers old text or discards new text.

**P3-07 — Unrelated editing does not dismiss the question**  
Surface/ruling: Week and Board; D535.  
**SETUP:** Trigger one unanswered question. **ACTION:** Edit another formation’s time, then the questioned formation’s take-off. **EXPECTED:** The same question remains and still accepts a valid answer. **DISPROVES:** An unrelated day revision dismisses it or makes every choice silently fail.

**P3-08 — Context-changing actions dismiss the question**  
Surface/ruling: Both editors; D525, D535.  
**SETUP:** Trigger a question. **ACTION:** Separately repeat with cue wording changed, formation deleted, structure moved, Undo/Redo, tracking Off, day/week/version change and sign-out. **EXPECTED:** Each invalidating action removes the old question; no delayed question reappears in the new context. **DISPROVES:** A stale choice remains or appears on another day.

**P3-09 — Exact Red names are automatic**  
Surface/ruling: Mission editor and Insights; D518, D531.  
**SETUP:** Three flying formations with Missions DS, RED and RED AIR. **ACTION:** Assign crews and inspect Insights; focus their Remarks. **EXPECTED:** All eligible sorties count Red without questions or an override action. **DISPROVES:** Any exact name is unresolved, Blue or manually overridable.

**P3-10 — Similar Mission names require an answer**  
Surface/ruling: Mission editor; D529, D531.  
**SETUP:** Separate formations have ordinary Missions and blank Remarks. **ACTION:** Change them individually to DS-2, RED AIR 2 and ACM/DS. **EXPECTED:** Each own edit produces one question; unresolved crew retain total-only bars. **DISPROVES:** The Mission is guessed Blue/Red or no resolution door exists.

**P3-11 — Support wording is a question, not an inference**  
Surface/ruling: Aircraft Remarks; D514, D517, D518.  
**SETUP:** Two ACM formations with “DS for RU” and “DS from RU”. **ACTION:** Commit each and choose deliberately opposite answers. **EXPECTED:** The chosen side governs each formation; wording direction does not override it. **DISPROVES:** The parser forces a side from “for” or “from”.

**P3-12 — Later and unchanged traversal remain quiet**  
Surface/ruling: Week and Board; D526, D527, D529.  
**SETUP:** Trigger a question and press Later. **ACTION:** Repeatedly focus and leave unchanged Remarks, then use Choose mission role explicitly. **EXPECTED:** Text remains saved; no automatic question repeats; the temporary manual action works. **DISPROVES:** Every blur asks again or Later loses the text.

**P3-13 — One answer covers the whole formation**  
Surface/ruling: Multi-aircraft formation and Insights; D517, D525.  
**SETUP:** Two aircraft, four crew; only aircraft two mentions DS. **ACTION:** Answer Red, replace a crew member and change a time. **EXPECTED:** All eligible aircraft count Red; crew/time changes retain the answer. **DISPROVES:** Only the cue-bearing aircraft changes or routine crew edits ask again.

**P3-14 — Structural edits ask once, bulk operations stay quiet**  
Surface/ruling: Board aircraft controls and templates; D529, D523.  
**SETUP:** A conditional formation has two aircraft with different cue clauses. **ACTION:** Remove the cue-bearing aircraft; separately apply a template creating several unresolved formations. **EXPECTED:** A single qualifying own edit may ask once; bulk creation opens no question cascade; each unresolved formation has its manual door. **DISPROVES:** Multiple stacked questions or permanently unreachable unresolved roles.

**P3-15 — Eligibility and incomplete bars are person-specific**  
Surface/ruling: Insights; D512, D516, D523.  
**SETUP:** Saber has one resolved and one unresolved flight; Ranger has only resolved flights. Include cancelled aircraft, an empty formation and SC/AVALON/BB rows. **ACTION:** Inspect, then resolve Saber’s outstanding role. **EXPECTED:** Only Saber initially has a total-only bar; cancelled/standby rows add no sorties; resolving completes his split. **DISPROVES:** One unresolved formation suppresses everyone’s chart or standby inflates totals.

**P3-16 — First twelve and Show all preserve ordering**  
Surface/ruling: Insights from all existing doors; D513, D481, D532, D558.  
**SETUP:** Create flights for at least thirteen people, including equal totals. **ACTION:** Open through desktop direct Insights, both phone schedule menus, Board desktop and Board More; press Show all/Show less. **EXPECTED:** Same totals, descending count/callsign order and first twelve everywhere. **DISPROVES:** Different lists by door, missing thirteenth person or expansion altering totals.

**P3-17 — Roles and first-use settings remain separate**  
Surface/ruling: Logic, schedule and access screen; D521–D524, D204, D215, D292.  
**SETUP:** Fresh isolated profile; then enable tracking as admin. **ACTION:** Inspect as admin-as-member, actual member, guest and no-access sign-in. **EXPECTED:** Tracking starts Off; only admin can enable or answer; permitted readers see statistics; no-access remains outside the app. **DISPROVES:** A reader gains a writer or changing account resets the squadron setting.

**P3-18 — Answer history and Undo identify the right actor**  
Surface/ruling: Changes window, History and top-bar Undo; D530, D148.  
**SETUP:** Admin A answers Red and changes it to Blue. **ACTION:** Undo/Redo; then sign out, have admin B answer differently, and return as A. **EXPECTED:** History names each actor and change; answers save; A’s cleared session undo cannot reverse B’s work. **DISPROVES:** Role changes are absent from history, touch signatures, or another person’s answer is undone.

**P4a-01 — Lazy-loaded apps retain their own appearance**  
Surface/ruling: Tracker and Leave War; D541, D487.  
**SETUP:** Start a fresh sign-in at each width. **ACTION:** Open Tracker first, Leave War second, then reverse the order in another session; operate pickers and sheets. **EXPECTED:** Each keeps its fonts, colors, spacing and buttons independent of visit order. **DISPROVES:** Loading one app changes the other’s appearance or hit targets.

**P4a-02 — Sign-in and no-access screens remain intact**  
Surface/ruling: Sign-in, Request access and waiting screen; D541, D204, D293.  
**SETUP:** Sign out; use an unapproved demo identity. **ACTION:** Submit the sign-in and request-access controls; inspect guest entry where enabled. **EXPECTED:** Existing card layout, password box and access flow remain; no new Sign up button. **DISPROVES:** Styling depends on previously visiting the scheduler or controls are clipped.

**P4a-03 — Dense schedule paint retains its meaning**  
Surface/ruling: Week, Board and issued preview; D541, D487.  
**SETUP:** A day with warnings, hidden warnings, amendment marks, OIL rings and long callsigns. **ACTION:** Open warnings, select a puck and switch published/working views. **EXPECTED:** Distinct marks remain visible and correctly layered; approved later changes are the only intentional differences. **DISPROVES:** One indicator paints over another or the wrong control receives a press.

**P4a-04 — Inputs, Quals and Medical keep usable frozen controls**  
Surface/ruling: Inputs table/calendar, Quals and Medical; D541.  
**SETUP:** Populate enough rows to scroll and attach a harmless test document through Inputs. **ACTION:** Filter, sort, scroll, open the calendar and document viewer. **EXPECTED:** Headings align, editors remain reachable and document controls work. **DISPROVES:** Header/body drift, lost scrolling or controls hidden by another page’s styles.

**P4a-05 — Every remaining main page retains its controls**  
Surface/ruling: Logic, Help and Admin; D541, D487.  
**SETUP:** Use long enough lists to scroll. **ACTION:** Search/filter Logic and Help; open Admin’s user, settings and data controls without destructive confirmation. **EXPECTED:** Existing labels, spacing and actions remain, except the specifically accepted Logic compactness. **DISPROVES:** Shared styles resize unrelated buttons or hide an action.

**P4a-06 — Secondary surfaces survive short and narrow screens**  
Surface/ruling: Plans, day/wave/duty templates, changes and availability windows; D541.  
**SETUP:** Open populated examples at both widths and short height. **ACTION:** Scroll to the final row, open nested controls, resize movable windows and close them. **EXPECTED:** Existing content and dismissal remain usable; no blank or zero-width body. **DISPROVES:** Presence in the page without visible, reachable content.

**P4b-01 — The least-used Board sections appear in phone Desktop layout**  
Surface/ruling: Phone Board Desktop layout; D548.  
**SETUP:** Populate Common Programme, Overall Notes, duties, sims, ground, Personal Inputs, Available crew, SANS availability and Unavailable, plus flying. **ACTION:** Choose Desktop layout and scroll each section into view. **EXPECTED:** Every populated section has readable width and usable controls. **DISPROVES:** Only flying renders or a lower section collapses to zero width.

**P4b-02 — Sideways travel reaches actual content**  
Surface/ruling: Phone Desktop Board; D548.  
**SETUP:** Use long Remarks and a wide populated day. **ACTION:** Pan through the existing sideways controls/gesture, then tap the far-right field and far-left callsign. **EXPECTED:** Both ends are reachable and presses land on the visible field. **DISPROVES:** The viewport moves without exposing usable content or a toolbar steals the press.

**P4b-03 — Latest and older published views remain visible**  
Surface/ruling: Phone Desktop Board previews; D548, D532.  
**SETUP:** Publish Original and an amendment. **ACTION:** View each version, inspect notes and warnings, then return to working copy. **EXPECTED:** Each version draws its own schedule read-only; return restores editable content. **DISPROVES:** Preview is blank or shows working changes under an issued label.

**P4b-04 — Layout changes preserve the selected day**  
Surface/ruling: Board Phone/Desktop switch; D548.  
**SETUP:** Open Wednesday and scroll to a lower section. **ACTION:** Switch Phone→Desktop→Phone, cross 820/821px, then press Done. **EXPECTED:** Wednesday remains selected; each layout works; Done returns to the schedule. **DISPROVES:** Wrong-day landing, blank content or a stuck overlay.

**P4b-05 — Schedule and crew scrolling remain independent**  
Surface/ruling: Board schedule and crew areas; D548.  
**SETUP:** Long schedule and long crew list on a short screen. **ACTION:** Scroll each separately, open/close CREW, then place a crew puck. **EXPECTED:** Both areas retain usable scroll ranges and placement reaches the intended row. **DISPROVES:** One area traps scrolling or placement lands on a hidden row. Preserve the expressly left-alone header behavior.

**P4b-06 — The repair grants no additional authority**  
Surface/ruling: Board exit and member views; D548, D292.  
**SETUP:** Open the repaired layout as admin. **ACTION:** Close it, switch to member view, then sign in as a real member and guest. **EXPECTED:** No editable Board survives behind the role/page change. **DISPROVES:** A remaining field, keyboard focus or stale overlay edits the schedule.

**P4c-01 — Repeated Board fields refresh before the next aircraft**  
Surface/ruling: Board multi-aircraft rows; D554.  
**SETUP:** One formation has two aircraft. **ACTION:** Change Callsign, Mission and take-off on aircraft one, Tab through to aircraft two’s repeated fields, then reverse. **EXPECTED:** Repeated fields show current shared values before editing. **DISPROVES:** A stale repeated value overwrites the earlier change.

**P4c-02 — Removing a reporting line does not corrupt its successor**  
Surface/ruling: Week and Board reporting lines; D551, D555.  
**SETUP:** Three reporting lines. **ACTION:** Empty the first, Tab into the second, edit it and Tab onward; repeat backward. **EXPECTED:** The intended surviving line receives the edit; the third stays unchanged. **DISPROVES:** Renumbering edits/deletes the wrong line or loses focus.

**P4c-03 — Input-owned fields keep their own save behavior**  
Surface/ruling: Personal Inputs and accepted ground rows; D550, D555.  
**SETUP:** Add a timed personal input through Inputs and accept it through the schedule. **ACTION:** Tab through its available start, end and Remarks fields on week and Board. **EXPECTED:** Values save to the same input, including its other displayed occurrence. **DISPROVES:** A schedule-only copy changes, a second input appears or the saved input loses text.

**P4c-04 — Reordered sections determine the route**  
Surface/ruling: Both editors; D555.  
**SETUP:** Drag Ground before Flying and put Common Programme afterward; open their notes. **ACTION:** Tab forward across boundaries, then Shift+Tab back. **EXPECTED:** Focus follows displayed section order, including headings and notes. **DISPROVES:** It follows the old default order or jumps to a hidden section.

**P4c-05 — Week formation details are visited once**  
Surface/ruling: Edit Schedule week; D554.  
**SETUP:** Two-aircraft formation with empty Brief and separate Remarks/stores. **ACTION:** Tab from Callsign. **EXPECTED:** Callsign→Mission→Brief→take-off→landing→aircraft-one Remarks/stores→aircraft-two Remarks/stores→Area/time. **DISPROVES:** Shared fields repeat, an empty box is skipped or pixel position changes the route.

**P4c-06 — Board visits each displayed aircraft row**  
Surface/ruling: Board; D554.  
**SETUP:** The same two-aircraft formation. **ACTION:** Tab through all boxes and reverse the complete sequence. **EXPECTED:** Each displayed aircraft row receives its existing flight fields, Remarks and stores before the formation’s Area/time. **DISPROVES:** Repeated boxes are deduplicated or reverse order differs.

**P4c-07 — Standalone rows contain only their existing fields**  
Surface/ruling: SC MAIN/SPARE, AVALON and BB; D551, D554.  
**SETUP:** Open each kind in week and Board. **ACTION:** Tab through its visible text. **EXPECTED:** Only that surface’s existing boxes participate; no invented week SC report box, ordinary flight Brief or role popup. **DISPROVES:** Focus enters an invisible or inappropriate field.

**P4c-08 — Non-flying rows and notes join the route**  
Surface/ruling: Duty desk, sim, ground, Common Programme and notes; D555.  
**SETUP:** Add one of each, with empty and populated text boxes and section/day notes. **ACTION:** Traverse forward and backward. **EXPECTED:** Every available text box is visited in displayed order; crew pucks and pickers are not activated. **DISPROVES:** A row kind is omitted or merely focusing text opens a picker.

**P4c-09 — Folded and closed editors stay closed**  
Surface/ruling: Both editors; D551.  
**SETUP:** Fold Personal Inputs and another foldable section; close stores/area popups. **ACTION:** Tab past their positions. **EXPECTED:** Only already-available text participates; folds and popups remain closed. **DISPROVES:** The route opens them or focuses hidden content.

**P4c-10 — The final box exits without looping**  
Surface/ruling: Day boundary on week and Board; D553.  
**SETUP:** Identify the last available text box on Monday. **ACTION:** Type and press Tab once; repeat Shift+Tab from the first box. **EXPECTED:** Text commits and focus leaves text entry without changing day, looping or entering the hidden week behind Board. **DISPROVES:** Any such jump or automatic control activation.

**P4c-11 — Enter and Escape retain their meanings**  
Surface/ruling: Times, Remarks, reporting and notes; D544.  
**SETUP:** Record each box’s saved value. **ACTION:** Type a replacement and Escape; repeat with Enter; then Tab. **EXPECTED:** Escape restores, Enter commits, and subsequent Tab uses the same route. **DISPROVES:** Escape saves, Enter opens a new editor or Tab duplicates the write.

**P4c-12 — Unchanged traversal creates no edits**  
Surface/ruling: Both editors, History and sign-offs; D529, D551.  
**SETUP:** A signed day with formatted times, blank suggested Brief, derived Area/time and answered Remarks. **ACTION:** Traverse all boxes without typing. **EXPECTED:** No new pending change, history entry, signature loss or Blue/Red question. **DISPROVES:** Display normalization becomes a saved edit.

**P4c-13 — Cancelled and empty rows follow visible editability**  
Surface/ruling: Both editors; D551.  
**SETUP:** Keep a cancelled line and an empty formation alongside ordinary rows. **ACTION:** Traverse the day. **EXPECTED:** Visible enabled text remains reachable; disabled/read-only text is skipped; traversal changes no cancellation state. **DISPROVES:** A blank field traps focus or a disabled row becomes editable.

**P4c-14 — Read-only views never join the schedule route**  
Surface/ruling: View-only, latest/older previews and member views; D550, D551, D292.  
**SETUP:** Visit each view and role. **ACTION:** Use Tab and type while focused on ordinary readable content or published Remarks access. **EXPECTED:** No schedule writer; the admin’s published role action stays separate from editable text traversal. **DISPROVES:** Typing changes the programme or focus jumps into a hidden editor.

**P4c-15 — A visible caret stays reachable on a short screen**  
Surface/ruling: Phone layouts and short desktop; D550–D555.  
**SETUP:** Long day, wrapped Remarks, horizontally scrolled phone Desktop Board. **ACTION:** Tab repeatedly into lower and partially offscreen boxes; reverse. **EXPECTED:** The visible portion of the focused box is exposed above overlays, with the day unchanged. **DISPROVES:** Typing goes into a box hidden under arrows, bars or the crew drawer.

**P4c-16 — Other apps’ keyboard handling remains their own**  
Surface/ruling: Tracker and Leave War windows; D550’s scope, D544.  
**SETUP:** Open Tracker’s event/student dialog and Leave War’s bid sheet after editing the schedule. **ACTION:** Tab, Shift+Tab, Enter and Escape through each. **EXPECTED:** Their existing focus containment and actions remain; modified/composing Tab is not intercepted by schedule routing. **DISPROVES:** Focus escapes into the schedule or a schedule edit commits.

**P4d-01 — Guest navigation is checked through the real guest door**  
Surface/ruling: Phone guest View-only Sched; D558, D215, D221.  
**SETUP:** Enable guest viewing through Admin and enter it from the waiting screen. **ACTION:** Open More schedule options, then Insights. **EXPECTED:** One Insights item, readable statistics and no editing actions. **DISPROVES:** The guest has no promised reader door or receives Board/edit actions.

**P4d-02 — Both schedule toolbars have the same small menu**  
Surface/ruling: Phone Edit Schedule and View-only Sched; D558.  
**SETUP:** Open each page at 320 and 390px. **ACTION:** Press the button after Highlight. **EXPECTED:** Only Insights; search and existing Add/export/calendar controls remain reachable. **DISPROVES:** The menu duplicates Board Sort/layout actions or covers neighboring controls.

**P4d-03 — Removing WEEK does not remove date navigation**  
Surface/ruling: Drawer and schedule calendar; D558.  
**SETUP:** Open the drawer from Inputs, Tracker and Leave War. **ACTION:** Confirm WEEK is absent; navigate to a schedule and use its calendar to select Monday 20 Jul. **EXPECTED:** Exact-date navigation still works through the schedule. **DISPROVES:** A stale shortcut remains or there is no usable date route.

**P4d-04 — Menu dismissal preserves focus and the next gesture**  
Surface/ruling: Both phone schedule menus; D558.  
**SETUP:** Open with pointer, then keyboard. **ACTION:** Tap outside, press Escape, reopen, choose Insights and close it. **EXPECTED:** The menu closes correctly; keyboard focus returns to a visible opener when appropriate; outside taps reach their intended control. **DISPROVES:** A stale menu remains or focus lands on a hidden button.

**P4d-05 — Resizing and navigation invalidate an open menu**  
Surface/ruling: Schedule menu; D558.  
**SETUP:** Open at 820px. **ACTION:** Resize to 821px, return to phone width; repeat with week, page and account changes. **EXPECTED:** Desktop uses its direct Insights door; old menu state does not reappear. **DISPROVES:** Both doors overlap or a previous account’s menu survives.

**P4d-06 — Board’s own door remains unchanged**  
Surface/ruling: Board desktop direct button and phone More; D481, D532, D558.  
**SETUP:** Open Board on Wednesday. **ACTION:** Open Insights through each Board door, close and press Done. **EXPECTED:** Same weekly figures, Board remains on Wednesday, no week-toolbar popup overlays it. **DISPROVES:** Hidden week navigation opens instead or Board context is lost.

**P4e-01 — Tracker’s edited chart uses the accepted wing everywhere**  
Surface/ruling: Tracker Flow, Details and Edit chart layout; D560, D566.  
**SETUP:** Use a new test chart with flight and non-flight events and readable authored labels. **ACTION:** Switch modes, zoom with existing controls and inspect flight labels. **EXPECTED:** Accepted tapered wing, preserved ball/rings/fonts and unchanged non-flight symbols. **DISPROVES:** One mode retains the rejected blocky wing or changes authored content.

**P4e-02 — The new wing preserves marking and selection**  
Surface/ruling: Tracker event balls; D566, D464.  
**SETUP:** A flight event has details and student marks. **ACTION:** Select its center and wing, open details, mark/unmark using normal controls and switch students. **EXPECTED:** Existing hit behavior and per-student marks remain; labels do not become controls. **DISPROVES:** Wing presses miss, select a neighbor or alter another student.

**P4e-03 — Saved chart presentation survives another visit**  
Surface/ruling: Tracker save, File export/import and sign-in; D566, D464.  
**SETUP:** Save a new test chart with custom font/label and export it through File. **ACTION:** Reload, switch accounts, then import that newly created backup using normal confirmations. **EXPECTED:** Authored chart/details remain and flights use the current accepted shape. **DISPROVES:** Saving/importing loses fonts, labels or marks. This is new-data round-trip coverage, not migration testing.

**P4e-04 — Logic search stays usable after scrolling**  
Surface/ruling: Logic; D561.  
**SETUP:** Open a long rules list. **ACTION:** Scroll down, search “report”, switch All/Warnings/Advisories/Notes/Fired this week and clear search. **EXPECTED:** Search and kept-visible controls remain visible and usable in fewer rows. **DISPROVES:** Search scrolls away, hides under the top bar or stops filtering.

**P4e-05 — Compact Logic retains edit permissions and values**  
Surface/ruling: Logic admin/member views; D561, D487.  
**SETUP:** Admin edits an allowed rule; record its value. **ACTION:** Switch to member view and actual member, search the rule, then return as admin. **EXPECTED:** Read-only presentation remains read-only; the saved value is unchanged; compactness is local to Logic. **DISPROVES:** Members edit, values reset or unrelated buttons shrink.

**P4e-06 — Insights closes after scrolling from every door**  
Surface/ruling: Week Insights; D562, D532, D558.  
**SETUP:** Enough people for a tall chart and Show all. **ACTION:** Open from each schedule/Board door, scroll to the bottom and press the visible cross. **EXPECTED:** Cross stays reachable; closing restores the originating surface. **DISPROVES:** Cross is above the viewport, beneath content or closes the wrong overlay.

**P4e-07 — Tall and short windows use the appropriate height**  
Surface/ruling: Phone popup windows; D536, D537.  
**SETUP:** Open tall Insights/templates and a short confirmation at phone and short height. **ACTION:** Scroll to both ends, reach close/Done and resize the viewport. **EXPECTED:** Tall windows leave the thin top strip; short windows remain content-height at the bottom. **DISPROVES:** A large unnecessary gap, clipped top or unreachable bottom action.

**P4e-08 — All thirteen surrounds distinguish a drag from dismissal**  
Surface/ruling: Duty templates, wave templates, day templates, saved plans, document viewer, input editor, day details, Traffic, Insights, cancellation, Sort all, week calendar and drawer; D538.  
**SETUP:** Open each through its own control. **ACTION:** Press inside, drag out and release; then perform a separate press/release on the surround. **EXPECTED:** First gesture keeps it open; second closes it where outside dismissal applies. **DISPROVES:** Dragging text dismisses any listed surface or genuine outside dismissal stops working.

**P5-01 — OIL tracker carries its own warning**  
Surface/ruling: Leave War’s full-screen OIL tracker; D587.  
**SETUP:** Make a save fail through an ordinary edit; open OIL. **ACTION:** Scroll, change its range and press Retry. **EXPECTED:** One reachable warning beneath its own bar; range/zoom/close remain usable. **DISPROVES:** Warning is hidden beneath the full-screen tracker or Retry presses another control.

**P5-02 — Tracker Tools survives the band appearing and disappearing**  
Surface/ruling: Short-screen Tracker Edit chart layout; D587, D373.  
**SETUP:** Open Tools on a short screen. **ACTION:** Make an ordinary chart save fail; restore storage and Retry. **EXPECTED:** Tools stays open throughout; the chart and its buttons remain usable. **DISPROVES:** The band’s resize notification closes Tools or changes the chart mode.

**P5-03 — Both movable windows retain a chosen size**  
Surface/ruling: Changes and ALL AVAIL windows; D587.  
**SETUP:** Open each, move and resize it; record visible bounds. **ACTION:** Cause failure, Retry successfully and reopen. **EXPECTED:** Chosen size/place remains within the screen; default-position windows make appropriate room. **DISPROVES:** A chosen window is permanently shortened or displaced by the band.

**P5-04 — Each full-screen cover owns the visible Retry**  
Surface/ruling: Board, Inputs calendar and Medical view; D587.  
**SETUP:** Enter failed-save state. **ACTION:** Open each cover through its real door; operate its first control, Retry and close. **EXPECTED:** Warning beneath that cover’s bar, one keyboard-reachable Retry, main warning restored on exit. **DISPROVES:** No warning, duplicate reachable copies or hidden controls taking presses.

**P5-05 — Every main page remains operable below the band**  
Surface/ruling: View-only, Edit Schedule, Inputs, Quals, Logic, Leave War, Tracker, Help and Admin; D587.  
**SETUP:** Failure active. **ACTION:** Visit each page and operate its topmost search/filter/picker/save control; scroll and repeat. **EXPECTED:** Page begins below the enlarged bar; actual presses reach those controls. **DISPROVES:** A screenshot looks clear but pressing a control triggers Retry.

**P5-06 — Wrapped bars are measured after page changes**  
Surface/ruling: Top bar at narrow desktop and landscape phone; D587.  
**SETUP:** Failure active at 1366×800 and 844×390. **ACTION:** Move between pages whose bar wraps differently; scroll the phone bar sideways. **EXPECTED:** Warning follows the bar’s actual bottom; account, Logout, arrows and CREW remain usable. **DISPROVES:** Warning stays at the previous page’s height.

**P5-07 — Short visits add no duplicate warning band**  
Surface/ruling: Insights, input sheet, drawer and floating windows; D587.  
**SETUP:** Main failed-save warning visible. **ACTION:** Open and close each short-visit surface; operate its normal buttons. **EXPECTED:** No additional band inside it; underlying failure remains after closing. **DISPROVES:** Every popup grows a warning row or opening one clears the failure state.

**P5-08 — Saving, failed, repeated failure and success remain distinct**  
Surface/ruling: Main bar and Board; D587.  
**SETUP:** Delay a real save, then fail it. **ACTION:** Observe Saving, press Retry while failure persists, then restore storage and Retry again. **EXPECTED:** Saving retains its existing presentation; failed state adds one line; repeated failure keeps it; confirmed success removes it. **DISPROVES:** The warning disappears while unsaved or each Retry adds another line.

**X-01 — Tab from Remarks opens the question without stealing typing**  
Surface/ruling: Week and Board; D529, D554, D555.  
**SETUP:** Tracking On; ACM formation followed by another editable box. **ACTION:** Type “DS for RU” in Remarks, press Tab and immediately type in the next box. **EXPECTED:** Remarks save, one question appears below the formation, and typing stays in the destination. **DISPROVES:** Question insertion moves the caret, loses text or consumes the first keystroke.

**X-02 — Tab through reporting lines preserves both warnings and focus**  
Surface/ruling: Both editors; D509, D554, D555.  
**SETUP:** In-time, Rally and a blank Brief. **ACTION:** Tab through an out-of-order Rally, correct it, then Shift+Tab backward. **EXPECTED:** Feedback names the correct pair; each commit reaches the intended line; no stale warning or duplicate edit. **DISPROVES:** Timing feedback redraws the next editor out from under the caret.

**X-03 — A published role answer does not acknowledge a timing amendment**  
Surface/ruling: Published Board, Insights and Amendments; D509, D530.  
**SETUP:** Published day has an unresolved role and a red Rally warning; working copy has a pending time correction. **ACTION:** Answer the published role, then inspect pending changes and sign-offs. **EXPECTED:** Insights color updates immediately; timing correction remains pending; role answer adds no amendment or signature change. **DISPROVES:** Role selection publishes or clears the pending timing change.

**X-04 — A failed save in the middle of Tab does not lose the route**  
Surface/ruling: Week and Board; D554, D587.  
**SETUP:** Several editable fields; storage fails on the first changed-field commit. **ACTION:** Tab through three edits while the band appears; restore storage, Retry and reload. **EXPECTED:** Focus remains visible; all committed values survive once saved. **DISPROVES:** Header movement redirects typing or only the last edit survives.

**X-05 — Failed role-answer save retries without touching the programme**  
Surface/ruling: Published role question, save band and History; D530, D587.  
**SETUP:** Published conditional formation with four recorded sign-offs. **ACTION:** Answer Red during storage failure; Retry while failing, then successfully; reload. **EXPECTED:** One final saved answer; unchanged programme/sign-offs/pending count; no duplicate role-history action from Retry. **DISPROVES:** Answer vanishes after successful Retry or an amendment appears.

**X-06 — Phone menu and sticky Insights cross remain reachable during failure**  
Surface/ruling: Both phone schedules; D558, D562, D587.  
**SETUP:** Failed-save band visible at 320 and 390px. **ACTION:** Open the schedule menu, choose Insights, Show all, scroll and close. **EXPECTED:** Every press reaches its own control; returning leaves the warning visible. **DISPROVES:** Retry covers the menu or the cross is inaccessible.

**X-07 — Logic’s sticky search follows the enlarged top bar**  
Surface/ruling: Logic; D561, D587.  
**SETUP:** Scroll Logic with failure active. **ACTION:** Search reporting rules, switch filters, Retry successfully, then continue searching without returning to the top. **EXPECTED:** Search and compact controls track both header heights. **DISPROVES:** They stay offset, disappear beneath the bar or jump focus.

**X-08 — Phone Desktop Board opens Insights above itself**  
Surface/ruling: Phone Board Desktop layout; D548, D481, D562.  
**SETUP:** Wide layout, horizontally scrolled to Remarks. **ACTION:** Use Board More→Insights, scroll and close; return to Phone layout. **EXPECTED:** Insights is above Board; close preserves day and usable Board position. **DISPROVES:** Modal opens behind Board or returning restores blank schedule sections.

**X-09 — Work hours and Blue/Red measure different things consistently**  
Surface/ruling: Insights; D498, D512, D516.  
**SETUP:** Saber has one Blue flight, one Red flight and an SC MAIN shift. **ACTION:** Move a flight’s reporting time earlier; then change only its role answer. **EXPECTED:** First action changes hours without sortie count; second changes the split without hours; SC adds hours, not sorties. **DISPROVES:** Either chart borrows the other’s eligibility or count.

**X-10 — Enabling tracking after publication does not rewrite the day**  
Surface/ruling: Logic, published Board and Insights; D521–D523, D530.  
**SETUP:** Publish a conditional Mission while tracking is Off. **ACTION:** Turn tracking On, inspect totals, answer through latest-published Remarks, then turn Off and On again. **EXPECTED:** No question burst; unresolved total first, immediate split after answer; signatures and wording remain unchanged. **DISPROVES:** Enabling guesses a role, creates pending work or loses a still-valid answer.

**X-11 — Logic changes separate defaults, hours and frozen earned leave**  
Surface/ruling: Logic, Add button, Insights and Leave War; D510, D482, D48.  
**SETUP:** Publish a six-hour Saturday; keep a second unissued wave without reporting lines. **ACTION:** Change report lead and default words, add to the second wave, then inspect Saturday’s hours and OIL. **EXPECTED:** New default text/time follows the applicable Add contract; existing text is unchanged; Insights follows D482 where its calculation uses the changed rule; issued OIL stays frozen. **DISPROVES:** Defaults rewrite existing instructions or published credit changes.

**X-12 — Template, role answer, reporting and Undo form one coherent day**  
Surface/ruling: Day templates, Board, History and save band; D525, D530, D555, D587.  
**SETUP:** Save a new template containing reporting lines, a conditional role answer, stores and section notes. **ACTION:** Apply it next week, traverse with Tab, change the answer, Undo/Redo, then save successfully and reload. **EXPECTED:** Copied day and answers have independent identity; Undo reverses the selected action only; all saved content returns. **DISPROVES:** Source-week answers change, reporting targets the wrong formation or Undo leaves orphan content.

**Missing connections and contract discrepancies**

**M1 — Published earned leave is still recalculated with live Logic values. High priority; source-backed, not walked.**

- **Where:** [oil.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/oil.ts), `dayOilWork()` and `uniformOil()`; [oilev.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts), `oilDayWork()`; [sync.ts](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts), `creditFrom()` and `desiredOilCells()`.
- **Missing connection:** Published evidence freezes eligibility, decisions, claims and placeholder membership, but these readers still derive spans and the HO/FO threshold from current Logic. Both loaded and stashed published weeks reach this path.
- **Visible consequence:** P2-01 can turn an already-issued HO into FO without an amendment. New publications on this build are affected, so D56 does not exclude it.
- **Fix instructions:** First reproduce P2-01 with newly published data. At each publication/amendment, retain the calculation inputs or resolved earning evidence needed to reproduce that issue’s spans and HO/FO result. Make issued OIL readers—including off-week reconciliation and the tracker explanation—consume that retained evidence; working previews continue using current settings. Recalculate only when a new issue is published. Verify lead, debrief and threshold changes in both directions, then amendment, Undo/Redo and reload. Do not migrate old demo records.

**M2 — The entered reporting resolver is absent from earned-leave calculation, but the brief conflicts with the earlier approved-build description.**

- **Where:** [oil.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/oil.ts), `dayOilWork()`’s ordinary-flight branch; the shared entered-time reader is [reporting.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/reporting.ts), `resolveReporting()`.
- **Missing connection against this brief:** Ordinary flight OIL starts at take-off minus nominal lead. It never asks the entered In-time/Rally resolver.
- **Visible consequence:** P2-02/P2-03 change Insights’ hours but do not cross the OIL threshold as this brief requires.
- **Authority conflict:** The Rally design and behavior register expressly preserve nominal OIL. This is not safely reportable as an unambiguous violation of the earlier build contract.
- **Exact implementation path if this brief’s expectation governs:** Resolve reporting separately for each ordinary formation, use its applicable entered start and an explicitly retained missing-report fallback, then feed that span into the existing eligibility/envelope calculation. Preserve SC/standby defaults, cancellation, overrides and date attribution. Freeze the resulting issued calculation through M1’s publication path. Prove both threshold directions and Sunday/Monday before accepting the change.

**M3 — Add reuses an existing report instead of always applying the new nominal lead. Contract discrepancy, not a missing renderer.**

- **Where:** [interactions.ts](C:/Users/User/projects/Raptor/raptor-port/src/ui/interactions.ts), `routeClick()`’s reporting-line Add branch; explanation in [logic-html.ts](C:/Users/User/projects/Raptor/raptor-port/src/ui/logic-html.ts).
- **Visible consequence:** In P2-08, the second line is derived from existing resolved reporting rather than the new nominal lead.
- **Authority conflict:** This brief describes unconditional earliest-take-off-minus-lead behavior; the earlier review-fixes brief explicitly applies it only when no resolved report exists.
- **Exact implementation path if the unconditional promise governs:** Remove the existing-report preference from the Add calculation; take the earliest valid uncancelled formation take-off minus the configured lead every time. Preserve text-only behavior when no take-off exists, midnight wrapping and configured wording. Update the visible Logic explanation and verify both Add surfaces with existing lines present.

**Explicit negatives — connections inspected in source**

These are wiring observations, not claims that the runtime scenarios passed.

- Amendments uses one shared panel without Discard marks; per-day publication and preview guards remain.
- Week and Board reporting editors share reporting-line rendering and the reporting resolver.
- Reporting-order warnings enter the day’s warning list; publication no longer uses them as a timing veto.
- Insights’ hours and long-day calculations share `workSpan()`; earned leave is the separate path identified above.
- Crew-rest processing includes dated lookback and multiple source traces; it is not limited to the immediately preceding populated day.
- Both schedule editors reach the shared Tab router through the existing keyboard handler and retain their normal commit paths.
- The Tab router excludes read-only previews, role controls, dialogs, folded/hidden fields and unauthorized roles.
- Week and Board Mission/Remarks edits reach the mission-role offer adapter.
- The Board’s latest-published Remarks reader has the role-access door and retains amendment marking.
- The week’s issued preview does not independently emit that Remarks door; the inspected implementation/design names the Board as the published-answer route.
- Role answers use separate guarded records, history, persistence and Undo connections rather than programme/signature writes.
- Day-template role copying reaches the fresh-identity adapter; saved-plan handling is distinct from creating new formations.
- Desktop schedule, both phone schedule menus and both Board entries open the shared Insights window.
- The removed drawer WEEK block has not been replaced with extra Board actions on View-only Sched.
- All thirteen listed outside-dismiss surfaces call the common press-origin check.
- Board, Inputs calendar, Medical and Leave War OIL tracker each mount the failed-save band.
- The main warning suppresses its keyboard/screen-reader presence while a covering full-screen band is active.
- Tracker’s resize handler distinguishes save-band changes; movable windows retain a user-placement marker.
- Print/CSV retain their existing published-day selection path; reporting-line omission predates this stack and is not evidence that the rename itself broke export.

**Device-only boundary:** Real iPhone browser-bar behavior for P4e-07, physical phone-keyboard behavior for P4c/X-01/X-04, and genuine disk exhaustion for P5/X-05 remain outside this walk; browser emulation cannot settle those portions.

**Rulings: none this session.**
