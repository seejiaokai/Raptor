1. **§3.7 leaves out a participant’s right to revise his own answer.** D660’s full ruling says “each man may still change HIS OWN answer afterwards”; D682 confirms that the latest answer counts. With one placeholder-owned input, a crowd member has no own record to answer, cannot edit the placeholder’s input, and cannot use the scheduler’s switches. The plan therefore removes that right without saying so.

   **Required:** the planner must design a participant-specific answer and its permitted write path, reachable from the day or schedule. A fresh filer/admin answer must replace earlier participant answers; scheduler refusals must still win; publication must freeze those answers. If placeholders are intended to lose this existing right, that exception requires the owner’s decision.

2. **Changing the credit calculation alone breaks the earned-leave switches.** For a placeholder input answered No or left unanswered, §3.7 would credit the crowd nothing, but the current person-switch default still answers Yes. The first tap writes a refusal; the second removes it. Neither grants credit. The whole-row switch also reads ordinary schedule work, which excludes request rows, so it cannot reliably recognise this new default-off crowd.

   **Required:** use one participant-default calculation for credit, individual switches and the whole-row state. For placeholder-owned requests, explicitly named men default Yes; crowd-only men follow the applicable answer. Preserve item/day masks and individual overrides. Explain an unanswered or declined filer answer accurately.

   The existing half-day answer is **not a credit cap**: positive answers permit earning; hours determine the amount. No new cap is needed. Explicit names and crowd-only names can be distinguished from the frozen row and frozen membership, without consulting current availability.

3. **§3.3’s listed save checks do not cover every write door.** The List’s single-person Add form builds and inserts its own record; it bypasses the editor’s creation checks. An admin could therefore save a multi-day placeholder Duty there. Separately, shared-input saving checks each selected person individually and subsequently adds the shared-group marker. That permits a placeholder mixed with names unless the whole selection is checked.

   The proposed permissions backstop also needs correction: its current caller skips admins, and verified Undo/Redo skips part of the member check.

   **Required:** add the shared placeholder refusal to the List’s Add form and the editor normalisation; reject placeholders in “Several people” and shared-input saves before any changes. Enforce allowed kind, one date and absence of shared-group markers through a role-independent command check covering newly created or changed placeholder records, including restores. Refusals must roll back the entire command. Do not rewrite untouched stored data.

4. **Schedule reassignment does not currently refuse both directions.** It rejects a placeholder destination, but accepts a placeholder source. For example, a placeholder Fly-with input moved under Unavailable can then be reassigned to a named man, contrary to §3.3.

   **Required:** reject reassignment whenever either the existing input’s person or the proposed destination is a placeholder, before any question or write. Keep ordinary scheduler replacement of the landed row’s name box available; that is a separate, permitted action.

5. **The wording and filter correction need wider coverage.** “ALL — everyone” is false: both placeholders use the same availability rule, excluding busy people, ground personnel and unplanned SANS people. D702 says either stands for “WHOEVER IS FREE”.

   **Required:** change that option to “ALL — whoever is free”. Give “Everyone” a distinct person-filter value and update the List, month-bar filtering, opened-day filtering, defaults, resets and reveal helpers together. Changing only the List comparison would leave the calendar disagreeing with it. Test “Everyone”, “ALL” and “ALL AVAIL” separately.

6. **The notification requirements contradict one another.** §3.5 and §5.5 say nobody’s bell; §3.7 deliberately sends an unanswered question to the filer. A later holiday declaration makes this a reachable case. Furthermore, switching member filing off also removes a member filer’s current editing rights, so an unconditional reminder can lead to a question he cannot save.

   **Required:** state one notification rule consistently. Recommend an actionable unanswered-question reminder to the authorised filer only, never to crowd members. Apply the same permission check when offering and saving it; when the filer cannot answer, retain the unanswered explanation for the admin on the day. Correct §3.4 to say that a member filer’s change/delete rights currently depend on the switch remaining on.

7. **Expand §5’s tests to cover these failures and the important boundaries.** Add actual switch taps after No and unanswered responses, whole-row forcing On, participant revision followed by a fresh filer answer, direct List and shared saves, both reassignment directions, and permission changes while a confirmation is open. Every refused save must leave records, answers, schedule and history unchanged.

   Test both placeholder IDs; named men beside a placeholder; complete name-box replacement; removal, cancellation and information-only rows; a late holiday declaration; and issued/reloaded versions after answers or availability change. Include accepted all-day Fly-with inputs: the current away calculation would count the placeholder as one absent person unless explicitly excluded. Assert that pending changes preserve issued credit, clear sign-offs, and disappear after reversal or republication.

VERDICT: NOT CLEAN

The planner must resolve the participant-answer design in point 1 and incorporate the concrete changes above before the build. Removing that established right requires the owner’s explicit decision.

Rulings: none this session