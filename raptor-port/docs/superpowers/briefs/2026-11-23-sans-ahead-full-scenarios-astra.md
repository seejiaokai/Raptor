This is a scenario design for the FULL check, not a completed walk. No files were changed and no app tests were run.

Blindness limitation: the required start-up read exposed the handoff before I reached the brief’s prohibition. I did not open the evidence sheet, but this cannot count as a fully blind read.

**Run conditions**

Run every reachable scenario at **1536px desktop and 402px iPhone width**. Use fresh browser storage, with a running clock initially set to **Wed 15 Jul 2026, 10:00 Singapore time**. Make the setup through the app’s controls. When changing actors, sign out and back in within the same tab; two open tabs do not reliably share live changes.

Use **Saber, admin `ad`**, and **Ranger, member `us`**. Use **Hex** for the second person in group filings. Unless stated otherwise, Saber saves Ranger’s SANS posting for **Fri 17 Jul**. Give each scenario fresh filings so duplicate-day refusals do not obscure its result.

Photograph each decisive result. On the phone, include the immediate result of the tap and the settled screen. A scenario passes only after its expected result has been seen.

**S1. Ranger files ahead for himself**

State: Ranger’s posting is saved, but today remains 15 Jul.

Press: Sign in as Ranger → Inputs → SANS. Open 16 Jul, then 17 Jul, then 20 Jul. On each permitted day press “+ Commitment”, choose Fly and All day, and save.

Expected: On 16 Jul the day opens but “+ Commitment” is greyed. On 17 and 20 Jul Ranger can file immediately, without waiting for Friday. Each saved offer appears once in the opened day and the appropriate month count. Its hours and activities agree. Both widths behave alike. **D2340, D2346.**

**S2. Saber files ahead for Ranger**

State: Same posting, no filings.

Press: As Saber, open SANS → 17 Jul → “+ Commitment”; choose Ranger and save an all-day Fly offer. Repeat on 20 Jul. In a separate attempt, change the draft date to 16 Jul and try saving.

Expected: The two eligible dates save. The wholly early filing is refused, naming Ranger’s SANS start date. Nothing is silently moved to Friday or saved for a different person. Saber’s calendar remains unfaded. **D2340, D2346.**

**S3. Several people, with different starting dates**

State: Ranger starts SANS on 17 Jul; Hex on 20 Jul.

Press: As Saber, open 20 Jul → “+ Commitment” → “Several people”. Select Ranger and Hex; file All day, Fly/OFT/AMT. Repeat separately for 17 Jul, including changing a populated draft from 20 back to 17.

Expected: On 20 Jul both can be filed for and each counts once in his own pilot/WSO column. On 17 Jul Hex cannot acquire an effective offer. A selected person who becomes ineligible must remain identifiable and removable; the save must not silently drop him. Check the picker’s SANS grouping as well as its ability to select the men. **D2340, D658.**

**S4. A range crosses the SANS boundary**

State: Ranger starts on 17 Jul.

Press: As Ranger, drag across **17–20 Jul**, then separately **16–18 Jul**, in both directions. Repeat as Saber. Also start a valid filing on 17 Jul and change its start to 16 Jul before saving. On desktop repeat with Shift and arrow keys, then Enter; on phone use a held drag.

Expected: The wholly eligible range works. No offer shows or counts on 16 Jul.

For **16–18 Jul**, record the precise result: refusal, no window, or acceptance with 16 Jul hidden. The brief’s stated reading accepts the range because some days qualify; the current save rule requires every newly added day to qualify. This disagreement needs disposition before assigning PASS or FAIL to acceptance. A backwards drag must not bypass the chosen rule. **D2340’s recorded reading; D2341.**

**S5. Ordinary Inputs doors and a man with no SANS status**

State: Ranger has neither a SANS tick nor a future SANS posting. Hex retains a future posting as a positive comparison.

Press: As Ranger and then Saber, inspect Inputs → Calendar → “+ Input”, and Inputs → List → “+ Input”. Inspect the Type choices. Try Ranger’s SANS-day “+ Commitment”; inspect whom Saber can select there.

Expected: Ranger cannot receive SANS availability. The ordinary Inputs calendar and list do not offer SANS availability or display its rows; filing belongs on the SANS calendar. This corrects the brief’s assumption that the ordinary input window necessarily offers a SANS choice. **D620, D658.**

If the running app does expose that choice, record the route and exercise S1–S4 through it. Do not manufacture the choice through browser scripting and call it a walked door.

**S6. Move the posting later, hiding only part of a filing**

State: Saber files Ranger’s All day Fly/OFT/AMT availability for **17–21 Jul**, then moves his posting from 17 to **20 Jul**.

Press: Inspect 17, 18, 19, 20 and 21 Jul; then move the posting back to 17.

Expected: Ranger’s filing disappears on 17–19 and remains on 20–21. Moving back restores 17–19 automatically, with the original activities, hours, remarks and filer. No re-filing is needed and no duplicate appears. Run the complete reader sweep below at each stage. **D2341.**

**S7. “Undo post out”, then make the posting again**

State: Ranger has a saved posting and availability on 17 and 20 Jul.

Press: As Saber, open his Post out sheet → “Undo post out”. Inspect both days. Save a SANS posting for 17 Jul again.

Expected: The offers disappear, then return automatically when those dates become SANS again. Use the posting sheet’s action: the top-bar Undo/Redo does not undo or redo a posting. Check the bell separately under S16. **D2341, D350.**

**S8. Change the outcome away from SANS and back**

State: Same as S7, before the posting runs.

Press: On the Post out sheet, deselect the SANS outcome so the posting has no outcome selected; save. Inspect the filed dates. Select SANS again with the same date and save.

Expected: The availability hides, then returns unchanged. The unrelated effects of the posting follow its selected outcome; hiding availability must not delete its saved details. Repeat after the original SANS posting has run, using a fresh setup. **D2341, D1710.**

**S9. Quals untick, re-tick, Undo and Redo**

State: The posting has run. On **20 Jul**, Ranger has filings for 18, 20, 21 and 23 Jul.

Press: As Saber, untick Ranger’s SANS on Quals. Inspect the dates. In the same signed-in session, use Undo, then Redo. Separately advance to 23 Jul and tick SANS again.

Expected: The untick hides offers from 20 Jul onward; it does not erase his earlier SANS period. Undo restores the status and offers; Redo hides them again. A new tick on 23 Jul restores offers from that date, leaving 20–22 Jul as the gap. No posting-take-back message is required by the recorded implementation reading; that notification choice remains the owner’s. **D2313, D2327, D2341.**

**S10. Archive and restore**

State: Ranger is SANS, with offers before and after **20 Jul**.

Press: As Saber, Admin → Users → archive Ranger on 20 Jul. Inspect future offers. On 22 Jul restore him with a post-in date of 22 Jul. Inspect his restored SANS status and the offers on 20, 21 and 22 Jul.

Expected: Future offers do not remain effective while he is archived. Restore must preserve the saved filings; they return only on dates when he is again present and SANS. The absence between archive and restore must not be filled retrospectively. Historical published days keep their issued record. **D2341, D2327, D327.**

**Reader sweep for S6–S10**

Apply this sweep to **each cause**, first while hidden and again after restoration:

| Place to press or inspect | Expected result |
|---|---|
| SANS month | Hidden person contributes nothing to F/O/A, flying commitments or shortage calculations. Colours follow the recalculated shortage. |
| Opened SANS day | Hidden offer is absent, including from any “no longer SANS” apart-list. |
| Inputs calendar and List | SANS rows remain absent by design; ordinary inputs remain unchanged. |
| Edit Schedule crew list, SANS Avail | No hidden offer’s activities or hours remain. The person’s placement follows his status on that date. |
| Scheduler Board crew list, SANS Avail | Same answer as Edit Schedule. |
| Armed flying, OFT and AMT seats | No hidden offer supplies permission, hours or a refusal reason. |
| ALL AVAIL window | Membership follows current dated status, programme engagement and clashes—not the hidden offer. |
| Flying-plan figures | Pilot/WSO commitments agree with the opened SANS day. |
| Warning list | No warning survives solely because of hidden offer hours or activities. |
| Bell | Missing-filings and take-back messages follow the cases below. |

Do **not** assume hiding an offer reduces ALL AVAIL by one. A man who becomes ordinary may qualify differently. Compare against the same status and schedule with no effective SANS offer.

**S11. Repeat every hiding cause after publication**

State: Repeat S6–S10 separately, but first publish and sign an affected day with Ranger explicitly named and an ALL AVAIL placeholder on a suitable separate programme item.

Press: Make the status change. Compare Edit Schedule’s working copy, View-only Sched, the published version and the pending changes. Restore the original status before publishing an amendment. Repeat once more, this time publishing the amendment while the offer is hidden.

Expected: Live readers follow the changed status. The issued version retains what was published. A real difference from that version appears as pending and clears the current sign-offs; restoring the exact original state removes that difference and restores the signatures. After an amendment, the new issued version reflects what was acknowledged; the older version remains intact. **D44, D45, D103.**

Treat “hide everywhere” as applying to current readings, not permission to rewrite published history.

**S12. Hide one person within a shared filing**

State: Saber files one shared offer for Ranger and Hex on 20 Jul; both are SANS that day.

Press: Move only Ranger’s posting to 21 Jul. Inspect every reader. Move Hex’s posting too, then restore only Ranger’s, then both.

Expected: The stages show **both → Hex only → neither → Ranger only → both**. No shared row, badge, name or count may reveal Ranger’s hidden offer merely because Hex still qualifies. Restoring one man must not expose the other. **D2341, D655, D658.**

**S13. Edit an offer that has become partly hidden**

State: Ranger’s 17–21 Jul filing now shows only on 20–21 Jul because his posting moved later.

Press: As Saber, open the surviving offer on 20 Jul. Change its remarks and hours; save. Move the posting back to 17 Jul.

Expected: Editing the surviving shared filing does not silently discard its hidden dates. Restored dates carry the saved edit, and there remains one offer per person per day. Separately try adding an overlapping offer on a visible date: refusal must preserve the original filing. **D2341; existing one-offer-per-day rule.**

**S14. Other people’s ordinary inputs survive hiding**

State: Ranger has SANS availability plus a separately filed ordinary commitment on 20 Jul. Hex has an unaffected SANS offer.

Press: Hide Ranger’s offer by moving his posting later. Open both calendars, the ordinary Inputs list and the schedule; restore his posting.

Expected: Only the SANS offer’s effective visibility changes. Ranger’s ordinary commitment and Hex’s offer remain. Restoration does not duplicate any of them. **D2341.**

**S15. The early bell, shrinking dates and its destination**

State: Today is 15 Jul. Ranger is planned on **18 and 20 Jul**, with no availability; his saved SANS posting starts 17 Jul.

Press: Sign in as Ranger and open the bell. Tap the SANS line. File 18 Jul, reopen the bell, then file 20 Jul.

Expected: Before Friday, the line says:

“You’re SANS from Fri 17 Jul. You’re planned on Sat 18, Mon 20 Jul with nothing filed. Tap to file.”

Its first tap opens the SANS calendar on 18 Jul. After filing that day, it names and opens 20 Jul. After both filings, the reminder disappears. Saber does not receive Ranger’s personal reminder. **D2340, D2342.**

**S16. Read and unread take-back messages**

Run four fresh versions, with Saber changing the posting and Ranger reading the result:

| Before the change | Expected after take-back |
|---|---|
| Unread reminder; no filed days | Reminder disappears; no invented read history. |
| Read reminder; no filed days | Previous statements are struck through, followed by “taken back · Saber”; bell becomes unread. |
| Every planned day filed; no current reminder | One message names the days whose saved availability became hidden. |
| Read reminder for unfiled days, plus other filed days | One take-back entry preserves the read reminder struck through and separately names the newly hidden filed days. |

Use 18 Jul as the hidden filed day and 20 Jul as the unfiled day. The hidden sentence must name **18**, not **20**. Repeat for an unrun posting and a posting that has run. **D2341, D1693, D1699, D1710.**

**S17. Longer bell lists, persistence and repeated changes**

State: Ranger is planned without filings on **18, 20, 21, 23 and 24 Jul**.

Press: Read the reminder; file selected days; reload; change the posting; reopen its sheet and save it unchanged. Separately test dates spanning **31 Jul and 3 Aug**.

Expected: Five dates show the first three in order plus “and 2 more”; the remainder changes correctly as days are filed. Cross-month wording names the right months. Reload preserves read state and saved take-back entries. Reopening or an unchanged save produces no duplicate take-back.

Record whether adding a newly planned day relights an already-read reminder; that is an existing owner question, not a settled failure expectation.

**S18. Persistence through a complete hide-and-return cycle**

State: Create a new filing through the app, then hide it by moving the posting later.

Press: Reload while hidden. Sign out and back in. Move the posting back, then reload again.

Expected: Hidden remains hidden after reopening. The offer returns with its original details and without re-filing. Bell entries neither disappear unexpectedly nor multiply. Repeat with a shared filing and with a date in the next saved week. **D2341.**

**S19. The fade belongs to the signed-in person**

State: Ranger starts SANS on 17 Jul. Hex starts on 20 Jul.

Press: Sign in as Ranger and inspect 16, 17 and 20 Jul, opening each day. Then sign in as Saber and inspect the same month. Where Highlight offers another man, select him.

Expected: Ranger’s pre-17-Jul cells lose their colour wash and have dimmed figures; 17 Jul onward retains the ordinary look. The faded day still opens, with “+ Commitment” greyed. No posting-out stripes appear. Highlight does not change whose start date controls the fade. Saber sees no personal fade. Counts remain numerically the same between the two viewers. **D2343, D2346.**

**S20. Midnight with the calendar already open**

State: Ranger’s calendar is open at **16 Jul, 23:59:50 Singapore time**; posting starts 17 Jul.

Press: Let the clock pass midnight without reloading or pressing anything. Then open 17 Jul and 16 Jul. Repeat with the page backgrounded across midnight and brought back.

Expected: The special pre-start fade disappears once the start date arrives. Filing on 17 Jul remains available; 16 Jul remains ineligible despite losing the special fade. The bell does not duplicate its reminder or show an impossible negative age. Reopening gives the same result. **D2340, D2346; midnight lesson.**

**S21. Move the date earlier and later around an open calendar**

State: Ranger starts on 20 Jul.

Press: As Saber, change the posting to 17 Jul, then 21 Jul, then take it back. After each change, sign in as Ranger and reopen SANS on the same month.

Expected: The fade ends immediately before the current start date; its boundary and “+ Commitment” eligibility agree. Taking back the posting removes the special fade and prevents new SANS filings. Existing offers follow S6–S8. **D2340, D2341, D2346.**

The stricter case—changing the posting while **Ranger’s own calendar remains mounted**—is not a valid two-tab walk in this build. It needs the automated check described below, unless the host proves a real single-tab route.

**S22. A restored offer still restricts the correct activities and hours**

State: On 20 Jul, Ranger offers **OFT only, 09:00–12:00**. Use programme items with clearly separated times.

Press: As Saber, arm an OFT seat within those hours, one outside them, and a flying seat. Hide the offer by moving the SANS posting later; inspect the same seats and warnings. Restore the posting.

Expected: Before hiding and after restoration, activity and time restrictions agree across the armed bar, crew list and warnings. While the day is ordinary for Ranger, none of those restrictions comes from his hidden SANS offer. **D2341.**

**S23. Permission checks after filing ahead becomes possible**

State: Ranger and Hex both have future SANS postings.

Press: As Ranger, file his own eligible day, then try selecting Hex or “Several people”. Open Hex’s offer. Repeat as Saber.

Expected: Ranger gains permission to file ahead for himself only. He cannot file or change Hex’s availability through the new route. Saber can file for either or both on eligible dates. **D2340, D658.**

**S24. Timing the promised screens**

State: Use the same newly created people, postings, shared filings and date ranges in the before and after builds. Include visible, partly hidden and wholly hidden offers.

Press: Open SANS, change month, open a populated day, switch to Edit Schedule, change day and open the Scheduler Board. Repeat with warmed screens at both widths.

Expected: Report measured before/after times and any visible hesitation; do not infer speed from the code. Use several repetitions and identical browser conditions. The promise supplies no numerical pass threshold, so retain the measurements and recordings for judgment. **D2341.**

**What is missing or needs a different reading**

- **Mixed-date acceptance — owner’s to decide.** The brief and recorded agent reading accept a range with at least one SANS day; the current save rejects newly included non-SANS days. S4 makes the disagreement concrete. Hiding invalid days is supported; whether a new filing may contain them is not consistently stated.
- **SANS filing through ordinary Inputs — contradicted by D620.** Check that this door stays absent. Exercise the shared editor through a legitimate SANS opener.
- **Instant changes to issued history — contradicted by D44/D45.** Current availability changes; published versions remain frozen until an amendment.
- **Top-bar Redo of a posting — contradicted by D350.** Re-create the posting through its sheet. Use Undo/Redo for a Quals change, not a posting.
- **One eligible person exposes an entire group — contradicted by D2341.** S12 is essential: hiding must apply per person and per date.
- **Quals untick or archive sends the hiding message — owner’s to decide.** Hiding is supported; limiting that message to posting take-backs is the recorded agent reading.
- **A new unfiled day relights a read reminder; a hand-ticked SANS man receives the same reminder; an unarmed phone crew row shows the explanatory note — already open questions.** Record these outcomes without reopening the earlier design work or treating an unanswered preference as a confirmed defect.

**Automated-only supplements**

These do not replace the walk:

- Keep Ranger’s calendar mounted while changing his saved posting **20 → 17 → 21 Jul → removed** through the normal change mechanism. Check the fade and open-day eligibility after each update.
- Submit a SANS draft whose dates are **16–18 Jul**, with a **17 Jul** start, directly to the save boundary. Resolve the mixed-date policy before choosing its expected acceptance result.
- Change eligibility after a draft opens but before its save reaches the boundary; ensure stale permission cannot create an effective offer for an ineligible person or day.
- Attempt a member save naming Hex, and a take-back message with extra, missing or duplicated hidden dates. The boundary must refuse them.

Walk: **NOT DONE — scenario design only, as requested.**  
Rulings: **none this session.**

