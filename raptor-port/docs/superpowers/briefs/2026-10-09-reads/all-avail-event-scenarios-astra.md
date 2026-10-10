These are scenarios for the builder to walk. No files were changed and no checks were run.

Use these conventions throughout:

- Create fresh examples through the app’s controls. Sign in as `ad` for admin and `us` for member. Use 13–19 July 2026, with Saturday 18 July as the usual OIL day.
- **P** and **W** mean a chosen pilot and WSO; **G** means a named ground crewman. Give the chosen people no other earning work unless the scenario specifies it.
- Use a Leave War period covering the test date and a six-hour full-day threshold. A sole 09:00–12:00 commitment earns **½ day**; 09:00–16:00 earns **1 day**.
- **Issue** means complete the four sign-offs and press **Publish day** or **Publish AL**, as appropriate. Check actual credits in both the **OIL tracker** and **Leave War**. An unpublished preview pays nothing; an already-published day retains its previous credits until reissued.
- **Replay check** means **Undo**, inspect the previous state, **Redo**, inspect the changed state, then reload and inspect it again. Do this before the next publication.
- Run every placeholder case for **ALL AVAIL and ALL**, separately. Neither means “every person regardless of availability.”

1. **S1 — The List’s pencil preserves and changes the actual person**  
   **Rulings:** D700, D702, D711 · **Role:** admin · **Size:** desktop 1440×900  
   **SETUP:** File a Saturday placeholder Duty, 09:00–12:00, answering Yes.  
   **ACTION:** Open **Inputs → List → pencil**. Save unchanged. Reopen, change **Person** to P and save, answering No; reopen and change P back to the placeholder, answering Yes.  
   **EXPECTED:** Every opening shows the actual saved person. An unchanged save creates no change. Each person change asks OIL again. Issue each changed variant: named P/No earns zero; placeholder/Yes gives each eligible crowd member ½ day.  
   **DISPROVES:** Opening or saving the pencil silently substitutes a real person for the placeholder.

2. **S2 — The pencil refuses medical changes before any medical question**  
   **Rulings:** D700, D711, D712 · **Role:** admin · **Size:** either  
   **SETUP:** Create a valid placeholder Meeting.  
   **ACTION:** In its List pencil, choose each medical kind in turn: **HL, OML, ATT C, ATT B, Upchit**; press **Save**.  
   **EXPECTED:** The editor retains the placeholder and explains the refusal before any document, downchit, upchit or OIL sheet. The original input, schedule, history and Undo step remain unchanged.  
   **DISPROVES:** A medical/document question opens before the placeholder refusal.

3. **S3 — Answer-only changes remain intelligible in changes and Undo**  
   **Rulings:** D711, D103, D178 · **Role:** admin/member · **Size:** either  
   **SETUP:** A member files a Saturday placeholder Duty with Yes; admin issues it.  
   **ACTION:** The filer changes only the OIL answer to No. Open **Changes → All changes**, **To go out**, and the **Undo** description; perform the replay check.  
   **EXPECTED:** The history identifies the placeholder input and answer change; pending information explains the changed earnings without inventing named inputs. Undo reverses that one act. Issued credits remain ½ day per original eligible member; publishing AL removes them.  
   **DISPROVES:** The answer changes earnings but leaves no understandable pending change.

4. **S4 — Loading an issued version does not roll back issued money**  
   **Rulings:** D44, D45, D142, D178 · **Role:** admin · **Size:** desktop 1440×900  
   **SETUP:** File a placeholder Duty, answer Yes and issue Original. Remove the placeholder from its schedule row and issue AL1, leaving no earning people there.  
   **ACTION:** Preview **Original**, press **Load onto working copy**, and complete its confirmation if shown. Perform the replay check; then publish the resulting AL.  
   **EXPECTED:** Loading restores the earlier schedule content as a working change, with the correct placeholder and count. View-only and both credit readers retain AL1’s zero until the new AL; that AL restores the eligible crowd’s ½ day.  
   **DISPROVES:** Loading Original restores credits before another publication.

5. **S5 — Alternate plans retain their own placeholder rows and overrides**  
   **Rulings:** D28, D44, D45, D711 · **Role:** admin · **Size:** desktop 1440×900  
   **SETUP:** Create a placeholder Duty with Yes. Use **+ Alt Plan**; in one plan deny P’s OIL, leaving the other plan unchanged. Issue the unchanged plan.  
   **ACTION:** Switch plans through the day’s plan selector; repeat through **Switch to this plan** on a preview. Perform the replay check, then issue the selected plan.  
   **EXPECTED:** Each selected working plan shows its own earning decision and correctly named row. Switching changes neither the issued view nor credited OIL. Publishing the denied plan gives P zero and the other eligible people ½ day.  
   **DISPROVES:** Merely switching plans changes P’s credited balance.

6. **S6 — A permission withdrawn while the OIL question is open**  
   **Rulings:** D200, D654, D655, D711 · **Role:** admin/member · **Size:** phone 390×844  
   **SETUP:** Enable members filing for others. As member, open a new placeholder Duty and reach its OIL question.  
   **ACTION:** Through another signed-in admin session, turn the members’ switch off. Return to the member’s open question and press **Yes/Save**. Repeat with an existing input’s edit and delete confirmation.  
   **EXPECTED:** Once the changed setting reaches the member session, all stale confirmations refuse clearly. No partial input, answer, deletion, history entry or Undo step is kept.  
   **DISPROVES:** The stale confirmation successfully writes after the permission has been withdrawn.

7. **S7 — Every OIL default meets both orders of individual switching**  
   **Rulings:** D28, D43, D711 · **Role:** admin/member · **Size:** either  
   **SETUP:** Make separate placeholder Duties with **Yes**, **No**, and **unanswered** OIL; issue each baseline.  
   **ACTION:** In **OIL Earn → Who earns OIL**, tap P twice. Separately test **switch first → filer answers again** and **filer answers again → switch**, including Yes→No and No/unanswered→Yes. Issue each tested result.  
   **EXPECTED:** Yes: first tap denies, second clears the denial. No/unanswered: first grants, second clears the grant. An explicit decision survives a subsequent filer answer. P receives ½ day only when the resulting decision allows it; other crowd members follow the filer.  
   **DISPROVES:** Re-answering silently discards P’s explicit scheduler decision.

8. **S8 — A typed person, a crowd person and an override collide**  
   **Rulings:** D18, D28, D470, D711 · **Role:** admin · **Size:** desktop 1440×900  
   **SETUP:** File a placeholder Duty with No. Add P explicitly under its schedule row while P also qualifies for the crowd; leave W crowd-only.  
   **ACTION:** Inspect **Who earns OIL**; deny P, grant W, then have the filer answer Yes. Perform the replay check and issue. Repeat with P in the main name box and the placeholder underneath.  
   **EXPECTED:** Typed P initially defaults Yes; crowd-only W initially defaults No. After the explicit switches and re-answer, P earns zero and W ½ day. Neither person appears or earns twice.  
   **DISPROVES:** P is paid twice because he is both typed and available.

9. **S9 — The day blanket dominates without destroying individual decisions**  
   **Rulings:** D28, D43, D711 · **Role:** admin · **Size:** either  
   **SETUP:** On an issued placeholder Duty, grant P and deny W explicitly.  
   **ACTION:** Turn the day’s OIL blanket off. Try tapping both people; have the filer answer again. Restore the blanket, inspect the decisions, and issue each blanket state.  
   **EXPECTED:** Blanket-off credits nobody and explains why individual taps cannot change it. Restoring it reveals the retained grant/denial. There is no whole-request switch substituting for individual decisions.  
   **DISPROVES:** A tap under the blanket secretly changes a person’s stored decision.

10. **S10 — Publish before versus after changing the filer’s answer**  
    **Rulings:** D44, D45, D103, D142, D178, D711 · **Role:** admin/member · **Size:** either  
    **SETUP:** File a placeholder Duty with Yes.  
    **ACTION:** Run both orders: **file → issue → No → replay check → AL**, and **file → No → replay check → issue → Yes → replay check → AL**. Also reverse Yes and No.  
    **EXPECTED:** Before first publication, actual credit is zero. After publication, answer changes clear the four sign-offs and become pending while issued money stays fixed. Undo to the issued answer restores the signatures and clears that difference. Each AL pays its newly issued answer.  
    **DISPROVES:** A post-publication answer changes balances before its AL.

11. **S11 — Publish before versus after changing availability**  
    **Rulings:** D36, D44, D45, D103, D142 · **Role:** admin/member · **Size:** either  
    **SETUP:** File a placeholder Duty with Yes while P is free.  
    **ACTION:** Test **issue → file overlapping leave for P → replay check → AL**, and **file P’s leave → replay check → issue → remove leave → replay check → AL**.  
    **EXPECTED:** Working counts and names follow P’s availability. Issued crowd and credits remain frozen; each real published difference clears signatures. The excluding AL removes P’s ½ day; the including AL restores it. Reversing to the issued state removes pending.  
    **DISPROVES:** P disappears from the issued crowd immediately when leave is filed.

12. **S12 — Publish before versus after changing the input’s person**  
    **Rulings:** D18, D44, D45, D103, D470, D711 · **Role:** admin · **Size:** either  
    **SETUP:** File a placeholder Duty with Yes.  
    **ACTION:** Test **issue → pencil Person=P → answer No → replay check → AL**, then the reverse **named P/No → issue → Person=placeholder → Yes → replay check → AL**. Repeat with the conversion before Original.  
    **EXPECTED:** The editor asks again; the working row changes identity without copying the crowd into records. The previously issued people keep their credits until AL. Named P/No pays zero; placeholder/Yes pays each eligible member ½ day.  
    **DISPROVES:** A converted input retains the previous person’s OIL answer without asking.

13. **S13 — Publication comes first, then filing, moving and deleting**  
    **Rulings:** D103, D142, D178, D179 · **Role:** admin/member · **Size:** either  
    **SETUP:** Issue an empty Saturday; keep Sunday available for a moved input.  
    **ACTION:** File a Saturday placeholder Event with Yes, replay-check it and issue AL. Move it to Sunday, replay-check, amend Saturday and issue Sunday. Delete it, replay-check and amend Sunday. Compare with filing before Original.  
    **EXPECTED:** Only working faces change immediately. Each affected published day records its own difference. Credits are zero before the first relevant issue, ½ day on the issued event date, and removed only when the corresponding removal is issued.  
    **DISPROVES:** Moving the input silently transfers issued credit between dates.

14. **S14 — Taking an input off leaves no false pending difference**  
    **Rulings:** D174, D176, D103 · **Role:** admin · **Size:** either  
    **SETUP:** Prepare two days: one issued without the request; another issued after its request was taken off.  
    **ACTION:** On the first, file a placeholder Event and press **Take off**. On the second, delete its dormant input; separately move it off the date. Replay-check each action.  
    **EXPECTED:** Each final state reads zero pending and retains/restores the four sign-offs. No OIL is credited from the dormant request. A request actually present in the issued programme still produces pending when taken off.  
    **DISPROVES:** Deleting the already-dormant request clears signatures or creates pending.

15. **S15 — A holiday is declared after filing, then revoked**  
    **Rulings:** D2, D142, D711 · **Role:** admin/member · **Size:** either  
    **SETUP:** File a Wednesday placeholder Duty on an ordinary working day, without an OIL answer.  
    **ACTION:** Declare Wednesday a **PH** through the calendar controls. Test before publication and after a zero-credit Original. Open the filer’s bell, answer Yes, and issue. Remove the PH; replay-check and amend.  
    **EXPECTED:** Only the authorised filer gets the unanswered task. Before reissue, a published weekday still pays zero. The PH issue credits eligible people ½ day; revocation retains those credits until its amendment, with a visible explanation.  
    **DISPROVES:** Removing the PH immediately removes issued OIL.

16. **S16 — Re-asking respects the existing answer rules**  
    **Rulings:** D711, D660, D682 · **Role:** admin/member · **Size:** either  
    **SETUP:** Create placeholder Duties with No and Yes for 09:00–12:00; create a named-person control alongside them.  
    **ACTION:** Change hours to 10:00–13:00, then 09:00–16:00. Move Saturday’s input to Sunday. Separately change its person through an admin editor.  
    **EXPECTED:** No survives hour changes. Yes survives a same-amount change but is asked again when the suggested amount changes. Sunday needs its own applicable answer; Saturday’s answer cannot answer Sunday. Person changes ask again. Issue the selected answers: short Yes pays ½ day, long Yes 1 day, No zero.  
    **DISPROVES:** A same-amount time edit unnecessarily discards Yes.

17. **S17 — Cancelling the OIL question produces one actionable bell task**  
    **Rulings:** D711 · **Role:** admin/member · **Size:** phone 390×844  
    **SETUP:** As member, save a Saturday placeholder Event but cancel its OIL question.  
    **ACTION:** Reload; open the filer’s **bell**, tap the task, answer No, then reopen the input and answer Yes. Inspect another crowd member’s bell and own inputs throughout.  
    **EXPECTED:** The unanswered saved input has one task for its authorised filer. Its tap opens that input’s question; answering clears the task. Nobody in the crowd receives an individual task or input. Issue No gives zero; issue Yes gives eligible members ½ day.  
    **DISPROVES:** A crowd member receives an OIL task for the placeholder input.

18. **S18 — Switching members’ filing off and back on after filing**  
    **Rulings:** D200, D654, D655, D711 · **Role:** admin/member · **Size:** either  
    **SETUP:** A member files an unanswered placeholder Duty.  
    **ACTION:** Admin turns members’ filing off. Member reloads and tries the calendar card, List pencil, delete and bell. Admin opens **OIL?** on the List row. Turn the switch back on.  
    **EXPECTED:** While off, the member has no edit/delete/answer right and no bell task. Admin sees **OIL?** and “not answered yet” in OIL Earn. Re-enabling restores the filer’s rights and unresolved task. An admin Yes, once issued, pays eligible people ½ day.  
    **DISPROVES:** The member still answers through an old calendar card while the switch is off.

19. **S19 — The filer leaves, but the placeholder input survives**  
    **Rulings:** D200, D297, D327, D711 · **Role:** admin/member · **Size:** either  
    **SETUP:** Create an unanswered future placeholder Duty under a disposable member account.  
    **ACTION:** Through **Admin → Users**, separately exercise archive, post-out and deletion for that filer. Reopen the input as admin and answer Yes.  
    **EXPECTED:** The input remains a placeholder input, with its filing attribution retained as available. No task is assigned to someone who cannot act. Admin can answer; after issue, eligible crowd members receive ½ day, excluding anyone outside their qualifying stint.  
    **DISPROVES:** Removing the filer deletes the crowd’s input.

20. **S20 — Roster changes use the date, not today’s roster alone**  
    **Rulings:** D44, D45, D52, D297, D327 · **Role:** admin · **Size:** desktop 1440×900  
    **SETUP:** Give P a stint covering July, issue a July placeholder Duty with Yes, and create another on a future weekend.  
    **ACTION:** Archive/post P out effective after July. Separately delete a test person and reuse their callsign for a newly created person. Replay-check the supported changes.  
    **EXPECTED:** July’s crowd and ½-day credit stay attached to the original person, with no crowd-only pending caused by the later archive. Future working crowds exclude the departed person; published future credits wait for amendment. A reused callsign does not inherit the former person’s July credit.  
    **DISPROVES:** The later archive makes the historical July crowd pending.

21. **S21 — Half-day Yes admits work; it does not cap the day**  
    **Rulings:** D18, D470, D711 · **Role:** admin · **Size:** either  
    **SETUP:** File a placeholder Duty 09:00–12:00 with Yes. Give P separate earning work 15:00–16:00; leave W with only the request.  
    **ACTION:** Open OIL Earn, inspect both explanations, and issue. Then remove P’s later work and amend.  
    **EXPECTED:** The first issued day gives P **1 day** from the 09:00–16:00 span, including the gap, and W **½ day**. Removing the later contribution reduces P to ½ day only after amendment.  
    **DISPROVES:** P is capped at ½ day by the request’s answer.

22. **S22 — Removing the final placeholder keeps only deliberate named people**  
    **Rulings:** D18, D46, D470, D711 · **Role:** admin · **Size:** either  
    **SETUP:** Issue a Yes placeholder Duty with typed P and G also on its row.  
    **ACTION:** Replace the main placeholder puck with P; separately test removing a placeholder in the extras. Ensure the final placeholder is gone. Replay-check and amend.  
    **EXPECTED:** The working crowd/count disappears when its final placeholder goes. P and G remain eligible as deliberately typed people, each earning ½ day. Other former crowd members lose this source only at amendment. The input’s own Person is not silently reassigned.  
    **DISPROVES:** Removing the final placeholder continues crediting its former crowd after amendment.

23. **S23 — Cancelled, information-only and taken-off rows stop contributing**  
    **Rulings:** D1, D31, D46, D142 · **Role:** admin · **Size:** either  
    **SETUP:** Issue a Yes placeholder Event, 09:00–12:00.  
    **ACTION:** In separate runs, use the programme’s **Cancel**, **Information only**, and **Take off** controls. Open OIL Earn, replay-check, then amend. Restore each state through its normal control and reissue.  
    **EXPECTED:** The disabled source has no effective earning switch, names its reason, and contributes no green earning mark. The disabling amendment removes its ½-day credits; restoring and reissuing restores them.  
    **DISPROVES:** The cancelled source still contributes credit after its amendment.

24. **S24 — A named holder’s No must not become the crowd’s No**  
    **Rulings:** D18, D46, D470, D711 · **Role:** admin/member · **Size:** either  
    **SETUP:** File a named P Duty with No. Admin adds a placeholder and typed G under its accepted row.  
    **ACTION:** Inspect **Who earns OIL**, issue, then remove the placeholder and amend.  
    **EXPECTED:** Named holder P earns zero on his own answer. Other eligible crowd members and typed G default Yes and earn ½ day. Removing the placeholder removes only its crowd contribution; G keeps earning. This remains different from an input whose holder itself is a placeholder.  
    **DISPROVES:** P’s No suppresses everybody under the named request.

25. **S25 — Duplicate placeholders and overlapping sources never double-pay**  
    **Rulings:** D43, D46, D278, D711 · **Role:** admin · **Size:** desktop 1440×900  
    **SETUP:** On a Yes placeholder Duty, place both placeholders and a repeated placeholder where permitted; type P explicitly too. Add a second overlapping earning row.  
    **ACTION:** Inspect counts and OIL, issue, then remove each source in turn and amend.  
    **EXPECTED:** P is counted once within the resolved crowd and receives one calculated daily amount, not one payment per puck or request. Removing one of several sufficient sources does not remove the remaining earned ½ day.  
    **DISPROVES:** P receives more than ½ day solely because identical three-hour sources overlap.

26. **S26 — A fresh rule change cannot recalculate an already-issued day silently**  
    **Rulings:** D48, D142, D179 · **Role:** admin · **Size:** desktop 1440×900  
    **SETUP:** Issue a Yes placeholder Duty 09:00–16:00 under the six-hour threshold: each eligible person earns 1 day.  
    **ACTION:** In **Logic**, raise the full-day threshold above seven hours. Inspect pending, replay-check the setting, then publish AL.  
    **EXPECTED:** The working calculation becomes ½ day and explains the rule-related difference. Issued credits remain 1 day until AL; AL changes them to ½ day.  
    **DISPROVES:** Saving the Logic setting immediately reduces issued balances.

27. **S27 — An ordinary award survives removal of generated credit**  
    **Rulings:** D46, D142 · **Role:** admin · **Size:** either  
    **SETUP:** Give P a manual OIL award of 1 day through the tracker. Issue a Yes placeholder Duty that generates another ½ day for P.  
    **ACTION:** Take the request off and amend; restore it and amend again.  
    **EXPECTED:** P’s manual award stays 1 day throughout. The generated part changes ½→0→½, with distinguishable sources on the tracker and Leave War.  
    **DISPROVES:** Removing the request also removes P’s manual award.

28. **S28 — “Several people” cannot turn a placeholder into a hidden group**  
    **Rulings:** D654–D660, D700, D711 · **Role:** admin/member · **Size:** phone 390×844  
    **SETUP:** In a new Duty editor select a placeholder.  
    **ACTION:** Turn **Several people** on; try picking P and saving. Use **File it for ALL AVAIL only** or its ALL equivalent. Repeat while editing a named group and attempting to replace its selection with a placeholder.  
    **EXPECTED:** A mixed selection is refused before any person is written or asked OIL. The correction returns to one placeholder, one date and one question. A successful placeholder filing produces one input, never a residual named group.  
    **DISPROVES:** A refused mixed save leaves P with a newly filed input.

29. **S29 — Every forbidden kind is refused through every reachable editor**  
    **Rulings:** D700, D711, D712 · **Role:** admin/member · **Size:** either  
    **SETUP:** Start with a valid placeholder Duty at each door: **calendar new editor**, **calendar existing editor**, **List Add**, **List pencil**, and **Scheduler Board Add/edit**.  
    **ACTION:** Attempt each forbidden kind: **OD, CSE, Fly with, Personal, LL, OL, OIL, CCL, PL, FCL, EL, CL, HL, OML, ATT C, ATT B, Upchit, SANS Availability**. Where a kind is absent, verify it stays absent; where selectable, press Save.  
    **EXPECTED:** No invalid filing succeeds. A previously selected placeholder remains visible with the reason. Refusal precedes auxiliary questions and changes no record, history or Undo step. Member correction **File it for me only** selects the member; admin chooses a real name.  
    **DISPROVES:** Any listed kind saves for a placeholder through one of these doors.

30. **S30 — Every date-writing door enforces one day**  
    **Rulings:** D711 · **Role:** admin/member · **Size:** either  
    **SETUP:** Create valid one-day placeholder inputs.  
    **ACTION:** Try a two-day range in each new/edit form, a two-day calendar selection, and stretching a saved bar into another day. Repeat across 31 July–1 August and 31 December–1 January. Then move a whole one-day bar to a different date.  
    **EXPECTED:** Every genuine multi-day attempt refuses without writing; the single-day move succeeds and asks for any newly applicable OIL answer. It does not create a second record or retain an unintended range.  
    **DISPROVES:** A cross-month range saves because its displayed end-day number is smaller.

31. **S31 — Schedule reassignment refuses both directions**  
    **Rulings:** D700, D711 · **Role:** admin · **Size:** desktop 1440×900  
    **SETUP:** Have a named Duty and a placeholder Duty on the programme.  
    **ACTION:** Use the schedule’s request-reassignment gesture from named person to placeholder, then placeholder to named person, on the week and Board. Separately replace a landed row’s name-box puck using ordinary scheduling.  
    **EXPECTED:** Both input reassignments refuse and retain ownership/answers. Ordinary name-box replacement remains possible and does not rewrite the input’s Person. A typed replacement earns by the typed-person rule after issue.  
    **DISPROVES:** Reassigning a placeholder request succeeds in either direction.

32. **S32 — The Unavailable door cannot swallow a placeholder**  
    **Rulings:** D700, D702, D711 · **Role:** admin · **Size:** either  
    **SETUP:** Put a placeholder Duty beside P’s genuine leave.  
    **ACTION:** Open **Personal Inputs** on the week and Board; inspect the request’s actions and try any offered **→ Unavail** route. Take the Duty off and reopen its actions.  
    **EXPECTED:** No placeholder **→ Unavail** action is offered or succeeds. The placeholder never appears as one unavailable person. The day’s leave/downchit count reflects P’s actual absence only.  
    **DISPROVES:** The placeholder increases the leave/downchit total.

33. **S33 — Inline editing remains attached to the right request**  
    **Rulings:** D700, D711 · **Role:** admin · **Size:** desktop 1440×900  
    **SETUP:** Create one ALL input, one ALL AVAIL input and one named input with distinct remarks.  
    **ACTION:** Begin editing a request’s in-place time on the week or Board; add another input before finishing. Commit the time, then Undo and Redo. Repeat a calendar move after another row has been added.  
    **EXPECTED:** Only the intended request changes, retaining its placeholder and remarks. The correct OIL re-ask rule applies; after issue, only that changed time affects calculated credit.  
    **DISPROVES:** The edit lands on a neighbouring input after the list order changes.

34. **S34 — Valid filing, ordering and answer changes survive replay**  
    **Rulings:** D700, D711 · **Role:** admin/member · **Size:** either  
    **SETUP:** File a valid placeholder Event with Yes.  
    **ACTION:** Replay-check creation, an allowed programme move/reorder, a remark edit, taking off/reinstating, and an answer-only change.  
    **EXPECTED:** Valid changes are not rejected by the structural guard. Each Undo/Redo affects the intended whole act; reload retains the final valid person, one-day span and filing state. No phantom named records appear. Issued credit changes only on issue.  
    **DISPROVES:** Redo refuses a previously valid answer-only change as an invalid placeholder input.

35. **S35 — All three person filters distinguish Everyone, ALL and ALL AVAIL**  
    **Rulings:** D700, D702 · **Role:** admin/member · **Size:** either  
    **SETUP:** On one day create distinct inputs for ALL, ALL AVAIL and P.  
    **ACTION:** In **List**, **month**, and **opened day**, select **Everyone**, **ALL**, and **ALL AVAIL** in turn. Exercise **Reset**, the summary chip, and a reveal/open-input action while a conflicting filter is selected.  
    **EXPECTED:** Everyone shows all three; ALL and ALL AVAIL each show only their own input. Reset and reveal leave the displayed selection, summary and actual rows consistent.  
    **DISPROVES:** Selecting ALL shows all people because it is interpreted as Everyone.

36. **S36 — List search, sorting and export retain placeholder identity**  
    **Rulings:** D700, D702 · **Role:** admin/member · **Size:** desktop 1440×900  
    **SETUP:** Create same-date ALL, ALL AVAIL and named Event rows with recognisable remarks.  
    **ACTION:** Search each placeholder’s name, sort by person and kind, clear the search, and use the List’s **Export** control.  
    **EXPECTED:** Search does not expand the crowd into separate records. Rows and exported input data retain the correct readable placeholder, Event kind, date and remarks; no raw internal person identifier replaces the name.  
    **DISPROVES:** An exported ALL AVAIL input is named after one arbitrary crowd member.

37. **S37 — The month bar, tip and day card tell the same story**  
    **Rulings:** D702, D711, D713 · **Role:** admin/member · **Size:** phone 390×844  
    **SETUP:** File a placeholder Event with a long remark as member.  
    **ACTION:** View its month bar, open its tip, open the day, and tap the card. Repeat with another member signed in.  
    **EXPECTED:** Each surface shows the actual placeholder and Event kind; the card has the placeholder puck and correct filer/time stamp. It is not marked as either member’s own input. The card makes no free-crowd count claim; that belongs on the schedule.  
    **DISPROVES:** A crowd member sees the card presented as their own personal filing.

38. **S38 — Nested windows and questions keep the intended draft**  
    **Rulings:** D711; plan §3.2–3.3 · **Role:** admin/member · **Size:** phone 390×844  
    **SETUP:** Open a day card, then its placeholder editor, with unsaved remarks.  
    **ACTION:** Open the OIL question; cancel it. Open another permitted floating window, close the front window with **Escape/✕**, return to the editor and save. Repeat a forbidden-kind correction while these windows are open.  
    **EXPECTED:** The front question/window alone handles dismissal. The editor retains the chosen placeholder and typed draft; a refusal stays at its own door and does not save through a background editor. After a valid Yes and issue, eligible people receive ½ day.  
    **DISPROVES:** Closing the front question silently saves or discards the underlying edited input.

39. **S39 — Week and Board show the same request and Personal Inputs echo**  
    **Rulings:** D37, D46, D702, D711, D713 · **Role:** admin/member · **Size:** either  
    **SETUP:** File a placeholder Event on a weekday and a placeholder Duty on Saturday.  
    **ACTION:** Open the **Edit week**, **Scheduler Board**, and **View-only Sched**; inspect the Ground row and **Personal Inputs** echo. Tap each count.  
    **EXPECTED:** Each actual request has the right placeholder puck, kind, hours and corresponding crowd. It does not fan out into personal input records. Counts work with OIL Earn off. The Saturday request’s Yes pays the eligible crowd ½ day only after issue.  
    **DISPROVES:** The Board displays a different crowd from the week for the same working row.

40. **S40 — Desktop crowd window works while the schedule behind it changes**  
    **Rulings:** D38–D41, D65, D66 · **Role:** admin/member · **Size:** desktop 1440×900  
    **SETUP:** Open a request’s crowd window with pilots, WSOs and at least one visible explanation.  
    **ACTION:** Move it by **⠿**, resize it, click the schedule behind it, and tap P with OIL Earn off. As admin, enable OIL Earn and tap P there. Change page, Edit/View mode, week and login in separate runs.  
    **EXPECTED:** It opens at the agreed narrow width, respects its minimum, keeps reasons readable and stays open on outside schedule clicks. Normal taps highlight; OIL taps only decide earning. Navigation/session changes close it.  
    **DISPROVES:** An OIL tap also selects P across the schedule.

41. **S41 — Phone crowd window exposes every person and the right controls**  
    **Rulings:** D38–D41, D51, D65, D77 · **Role:** admin/member · **Size:** phone 390×844  
    **SETUP:** Use a placeholder request whose crowd has unequal pilot/WSO counts and enough names to scroll.  
    **ACTION:** Open the count, scroll both lists, move the panel, and switch **Who’s available / Who earns OIL** as admin. Inspect the same window as member.  
    **EXPECTED:** The movable bottom panel is about 62% tall, without a phone resize corner. Pilots stay left and WSOs right, one puck per row. No earning control is clipped or offered to a member. The two halves use the correct availability versus earning explanation.  
    **DISPROVES:** A lower-list person cannot be reached or switched on the phone.

42. **S42 — Availability uses step-to-dekit, with report/debrief explained separately**  
    **Rulings:** D36, D37 · **Role:** admin · **Size:** either  
    **SETUP:** Schedule P flying with distinct report, step, dekit and debrief times. Add a placeholder request whose interval first overlaps report only, then step-to-dekit, then debrief only. Repeat with a sim.  
    **ACTION:** Change the request times through its editor and open the count after each change.  
    **EXPECTED:** P is excluded for step-to-dekit overlap, not merely report/debrief overlap; the latter remains visible as the appropriate explanation/flag. Issue isolated short earning variants to confirm only the admitted crowd receives the request’s ½-day contribution.  
    **DISPROVES:** Report-only overlap removes P from the available count.

43. **S43 — A named Event makes one man busy; a placeholder Event makes nobody busy itself**  
    **Rulings:** D36, D52, D702, D713, D714 · **Role:** admin · **Size:** either  
    **SETUP:** Place a placeholder Duty 09:00–12:00 and an overlapping named Event for P.  
    **ACTION:** Inspect the Duty’s crowd; move P’s Event outside the interval. Then file an overlapping placeholder Event and inspect both placeholder crowds and warnings.  
    **EXPECTED:** P leaves and rejoins according to his named Event. A placeholder Event neither makes every represented person busy nor excludes itself from the other crowd. It creates no fictional placeholder clash, rest breach or work-hours warning.  
    **DISPROVES:** Adding the placeholder Event empties the other placeholder’s crowd.

44. **S44 — Missing or unusable times never invent OIL**  
    **Rulings:** D31, D360, D361 · **Role:** admin · **Size:** either  
    **SETUP:** Put a placeholder on a new programme row and test 18:30 with no end, no start, and equal start/end.  
    **ACTION:** Open its count and OIL Earn; change **Assumed length, no end time** in Logic. Issue the tested row where publication permits.  
    **EXPECTED:** Start-only uses a plain count over the stated assumed interval, with “no OIL worked out” because the end is missing. No-start opens its reason through the `?` count. Unusable windows pay zero and offer no effective earning switch. No new `~` convention is expected.  
    **DISPROVES:** The assumed hour produces a ½-day OIL credit.

45. **S45 — Event is present in every kind list, with consistent defaults and explanation**  
    **Rulings:** D713, D714 · **Role:** admin/member · **Size:** either  
    **SETUP:** Open each new/edit door: calendar, List Add, List pencil and Board Add/edit.  
    **ACTION:** Select **Event**; inspect the type filter, **Legend**, and **Logic** type explanation. File one for P and one for a placeholder.  
    **EXPECTED:** Event appears under **Duty & other commitments**, after Duty where the full ordered list is shown. It opens timed, has no AM/PM choice, lands on Ground unless taken off, and uses the same substantive explanation everywhere. Weekend save asks OIL; a sole short Yes pays eligible people ½ day after issue.  
    **DISPROVES:** One editor treats Event as an unknown or all-day leave kind.

46. **S46 — Event is red across SC MAIN while Meeting remains amber**  
    **Rulings:** D713, D714 · **Role:** admin · **Size:** desktop 1440×900  
    **SETUP:** Put P on an SC MAIN shift. File an overlapping named Meeting.  
    **ACTION:** Read the warning and puck indication; change only its kind to **Event**. Inspect week, Board and the warning list. Move Event outside the shift.  
    **EXPECTED:** Meeting’s deliberate amber case becomes a red clash for Event, with a useful reason and jump to the affected place. Moving outside the shift removes that clash. No claim is made that every Event clashes regardless of overlap.  
    **DISPROVES:** Event retains Meeting’s softer amber treatment.

47. **S47 — Event participates in crew rest on both sides of the day boundary**  
    **Rulings:** D713, D714 · **Role:** admin · **Size:** either  
    **SETUP:** Give P a late named Event, 21:00–23:00, followed by flying early enough to breach the current Logic rest rule. Prepare a matching Training control.  
    **ACTION:** Inspect both days’ warnings; move Event earlier to clear the breach. Reverse the arrangement: earlier flying, then Event within the required rest interval.  
    **EXPECTED:** Event follows the same applicable rest calculation as the control, with P and the relevant times identified. Moving it clear removes the breach. A placeholder Event does not create a rest history for the placeholder itself.  
    **DISPROVES:** Training raises the expected rest breach while the equivalent Event does not.

48. **S48 — Hand-typed EVENT reaches the same standby-clash reader**  
    **Rulings:** D713, D714 · **Role:** admin · **Size:** desktop 1440×900  
    **SETUP:** Put P on SC MAIN and on an overlapping manually added Ground row.  
    **ACTION:** Type **EVENT**, then **Sports EVENT**, into the row’s name. Compare with **MEETING** and move the row clear of the shift.  
    **EXPECTED:** The standalone EVENT word produces the promised red standby clash, including within a longer label. Meeting keeps its existing treatment; moving clear removes the overlap clash.  
    **DISPROVES:** A typed EVENT row escapes the red clash that a filed Event produces.

49. **S49 — Named group Event keeps group rights and latest-answer behaviour**  
    **Rulings:** D654–D660, D663, D682, D713 · **Role:** admin/member · **Size:** phone 390×844  
    **SETUP:** As member, use **Several people** to file a Saturday Event for P, W and G; answer Yes once.  
    **ACTION:** One included member changes their own answer to No. The filer reopens OIL and answers Yes again; admin explicitly denies W. Add another person and answer again.  
    **EXPECTED:** The calendar/List show one shared group and Changes groups its names. The filer’s latest answer replaces members’ prior answers, but W’s scheduler denial survives. Issue gives each allowed named participant ½ day, including G; W gets zero. Existing per-person schedule rows are acceptable while the separate single-row job remains unbuilt.  
    **DISPROVES:** Re-answering clears W’s explicit denial.

50. **S50 — Group Event controls do not leak onto placeholder Event**  
    **Rulings:** D655, D660, D711, D713 · **Role:** admin/member · **Size:** either  
    **SETUP:** Create a named group Event and a placeholder Event with otherwise identical details; include the signed-in member in the resolved crowd.  
    **ACTION:** Open both as that member. Inspect own-answer and leave-group controls; try editing the placeholder through its card and schedule echo.  
    **EXPECTED:** The named group retains its applicable member controls. Crowd membership alone gives no personal answer, “take me out,” “count me in/out,” edit or delete right on the placeholder. The filer/admin remains the answering authority.  
    **DISPROVES:** A crowd member changes only their own answer on the placeholder input.

51. **S51 — Member and guest readers keep issued and working faces separate**  
    **Rulings:** D44, D45, D200, D213, D215 · **Role:** admin/member/guest · **Size:** phone 390×844  
    **SETUP:** Issue a placeholder Event with Yes; then change its working crowd and answer. Leave a second Event day unpublished. Enable guest viewing through Admin.  
    **ACTION:** As member, inspect **as issued** and **Working draft — not issued**. As guest, navigate to both days and tap the visible rows/counts.  
    **EXPECTED:** Member faces are correctly labelled. Guest sees the issued published day and current unpublished day, with readable placeholder/Event identity, but no editor, working-draft selector, pending window or earning control. Actual credit remains the issued ½ day until amendment.  
    **DISPROVES:** A guest gesture reaches an editable input or OIL control.

52. **S52 — Printing and exporting do not silently substitute the working face**  
    **Rulings:** D44, D45, D178, D179; plan §5 · **Role:** admin · **Size:** desktop 1440×900  
    **SETUP:** Issue a named Event and placeholder Duty, then change their working names/times or filing. Include an identifiable flying line to establish the exported version.  
    **ACTION:** Open schedule **Print/PDF** preview and **Export**, and separately export **Inputs List**.  
    **EXPECTED:** Input export preserves the actual saved person and kind. Schedule output follows its declared scope and version consistently; any output carrying Ground/input rows must show the correct placeholder/Event, without expanding the crowd or leaking pending edits into an issued document. Record whether the promised Event Ground print surface exists; the documented flying-only scope needs explicit reconciliation.  
    **DISPROVES:** An output presented as issued contains a pending working edit.

53. **S53 — Placeholder inputs never become SANS offers or personal absence records**  
    **Rulings:** D658, D700, D702, D711 · **Role:** admin/member · **Size:** either  
    **SETUP:** File placeholder Duty and Event inputs beside a real SANS offer and a real named leave.  
    **ACTION:** Open the **SANS calendar → + Commitment** picker, each member’s own-input view, **Leave War**, day totals and **Insights**.  
    **EXPECTED:** Neither placeholder is offered in the SANS picker or counted as a SANS commitment, named absence, extra person or individual work-history record. Real named leave/availability remains correct. Published OIL credits may appear for actual eligible people; that does not create absence cells for the placeholder input.  
    **DISPROVES:** The placeholder input appears as an absence on a crowd member’s Leave War row.

54. **S54 — The new input route does not change existing seat permissions**  
    **Rulings:** D27, D33, D37, D43, D47, D52 · **Role:** admin · **Size:** desktop 1440×900  
    **SETUP:** Create a placeholder input, and prepare flying, duty, sim, sim-passenger, extras, Ground and Common Programme destinations.  
    **ACTION:** Attempt to place its placeholder puck in each destination, using both drag and the normal armed-seat picker.  
    **EXPECTED:** Flying cockpit seats refuse it. Existing legal destinations retain their count/window and ordinary earning defaults; a separately placed placeholder is not governed by an unrelated input’s No. Ground crew stay out of its crowd, while explicitly typed G can earn. Issue a sole three-hour legal earning placement: eligible people receive ½ day.  
    **DISPROVES:** The new filing feature lets the placeholder enter a flying cockpit seat.

55. **S55 — Weekdays, Off days and missing Leave War periods remain distinct**  
    **Rulings:** D19, D21, D711, D713 · **Role:** admin/member · **Size:** either  
    **SETUP:** Create placeholder Events on an ordinary weekday, a weekday marked **Off day**, and a weekend in a year without a Leave War period.  
    **ACTION:** Save, inspect OIL questions/checks, and publish where permitted. As admin, follow **Create the [year] period** for the uncovered weekend and complete its setup.  
    **EXPECTED:** Ordinary weekdays and weekday Off days generate no OIL. The uncovered weekend names the missing period and offers the admin’s creation route; it never pretends payment landed. Once properly covered and issued with Yes, eligible people receive ½ day. Members get the explanation, not the admin creation action.  
    **DISPROVES:** A weekday Off day is treated as a public holiday and credited.

56. **S56 — The latest issued AL or EOD remains the credit authority**  
    **Rulings:** D44, D45, D142, D711 · **Role:** admin · **Size:** either  
    **SETUP:** Issue Original with a short placeholder Duty/Yes, paying the eligible crowd ½ day.  
    **ACTION:** Change to No and publish AL; then restore Yes, extend to 09:00–16:00 and publish EOD through its normal controls. Replay-check the input changes before each issue; reload after each publication. Preview the earlier versions afterwards.  
    **EXPECTED:** Actual credit follows the latest issue: **½ → 0 → 1 day** per eligible person. Earlier previews neither change balances nor become the current issued face. The fact that July is in the past adds no clock-based exception.  
    **DISPROVES:** Previewing Original replaces the latest EOD’s full-day credits.

**MISSING CALL SITES — leads for the walk, not verdicts**

- `raptor-port/src/ui/PeoplePick.tsx` — `pickProblem`: the forbidden-kind correction builds **“File it for me only”** from the current person without an explicit admin/member distinction. The plan promises that correction to members, while admins choose a real name. Walk S29 through both roles.
- `raptor-port/src/undo/describe.ts` — `describeEntry`: input descriptions still reduce a single input to **“a personal input”** and batches to a count, without reading placeholder identity or Event kind. S3 should establish whether the actual Undo wording adequately identifies the act.
- `raptor-port/src/ui/pendlist.ts` — `inputWords` / `pendItemWords`: detailed input wording compares person, kind, hours and remarks; an answer-only difference can fall through to general earnings wording. S3 and S10 should check whether the filer’s changed answer remains understandable and reachable.
- `raptor-port/src/ui/printpdf.ts` — `printSchedPDF`, through `raptor-port/src/ui/export.ts` — `schedRows`: the print route consumes flying rows and has no Ground/input renderer, while the plan names an Event Ground row on print. S52 should establish the missing promised surface and reconcile that promise with the existing flying-only export contract.

Rulings: none this session

