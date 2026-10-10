1. **High — changing the credit calculation alone breaks the OIL switches (§3.7).** With a weekend ALL AVAIL Duty answered **No**, the proposed calculation pays nobody, but the existing switch still treats each crowd member as on by default. Tapping writes a refusal; tapping again removes that refusal. Neither tap grants credit. This contradicts D28: “the admin can always override.”

   Use the same default calculation for credit, switch state and the explanation shown. A crowd member follows the filer’s answer; a scheduler-named person defaults to Yes. Keep existing day, item and individual overrides above those defaults. Test actual taps in the ALL AVAIL window, including No → admin grants credit → override removed.

   Make the split explicit: take named people from the displayed day’s row, and crowd membership from that day’s saved evidence; named people take precedence and nobody is counted twice. An issued snapshot contains enough information for this. Add tests for replacing the name box, removing the last placeholder, and one person appearing both ways. **An answer of 0.5 does not cap credit today:** a positive answer admits the work, and the day’s qualifying hours determine the amount. Replace the open question about a cap with that rule and a test combining qualifying work.

2. **High — the proposed save checks miss ordinary saving routes (§3.3).** The List’s single-person Add form writes its own record without using the editor’s save checks. Its picker check receives no dates. After the proposed picker change, an admin could therefore save a multi-day placeholder input there. Adding checks only to the named permission check also misses admins, while replayed changes skip its later checks.

   Put the placeholder’s structural restrictions at the common save boundary, before role exemptions and replay shortcuts: permitted kind, one date, and no shared-group membership. Apply permission checks separately. Have the List, editor and calendar use the same restrictions for their messages. Validate a whole group before writing any member: hiding placeholders under “Several people” is insufficient because switching from one person to several preserves the existing selection.

   Add tests for List Add, switching to several after selecting ALL AVAIL, mixed groups, calendar range selection, and Undo/Redo. Refused operations must leave no partial records or history. Apply these checks to records being written, without turning this into a repair of unrelated stored data.

3. **Medium — reassignment does not currently refuse both directions (§3.3).** The existing schedule action rejects a placeholder as the **destination**, but accepts a placeholder input as the **source** when the destination is a named person. A new placeholder input moved to Unavailable could therefore be reassigned to one person, contrary to the plan’s promise that the editor is the only route.

   Add a source check as well as the destination check. Test both directions through the schedule action, including any swap before either side is written. Keep this separate from changing a request row’s name box: that scheduler action must continue to work under D470.

4. **Medium — an allowed “Fly with” input can count the placeholder as one absent person (§4).** An all-day ALL AVAIL “Fly with” input accepted onto the programme, or moved to Unavailable, passes the current absence check. The placeholder is added to the all-day absence set, and the day-information panel’s **“Leave / downchit”** total rises by one.

   Replace the roll-call’s assumption that this is already harmless with an explicit change: exclude placeholders from both all-day and timed absence collections. Test both ALL and ALL AVAIL, alongside a real person’s absence, on working and issued views.

5. **Medium — correct both the ALL wording and every person-filter comparison (§§3.3–4).** “ALL — everyone” promises a different crowd from the one actually selected. D702 says both placeholders stand for **“whoever is free”**; the existing rule also excludes ground crew. Use “whoever is free” for both.

   The filter collision is not confined to the List. Both calendar filtering paths also use the same internal value for “Everyone” and the ALL placeholder. Give “Everyone” a distinct value and update all three paths together. Test that filtering for ALL shows only ALL inputs, while Everyone still shows named inputs and both placeholders.

6. **High — the unanswered-OIL route contradicts the display promise (§§3.5, 3.7 and 5).** The plan says “not on any man’s bell” and tests “nobody’s bell”, but also routes unanswered OIL to the filer. That pending-answer list directly lights the bell. Moreover, a member filer loses permission to answer if the members-file-for-others switch is subsequently turned off.

   State one consistent rule for outstanding answers, including a holiday declared after filing and permission lost before answering. If the filer’s bell is an intended exception, say so explicitly and reconcile it with D702; otherwise provide an authorised route on the day or schedule. Never show a task that its recipient cannot complete. Test both unanswered cases and the permission change.

7. **High — the plan silently removes the shared-input right to change one’s own OIL answer (§§3.1, 3.4 and 3.7).** D660 says **“each man may still change HIS OWN answer afterwards”**; D682 retains that right after the filer answers again. D702’s answer was “Yes as with shared inputs.”

   The proposed record has only the filer’s common answer, and only the filer or an admin may edit it. An ordinary crowd member therefore cannot change his own answer; the admin’s schedule switch does not provide that member’s right.

   The planner must explicitly reconcile these rulings before declaring “no new shape”. If individual answers remain available, specify their save location, access from the day or schedule, treatment when someone leaves and rejoins the crowd, replacement by a later filer answer, and publication freeze. If the intended behaviour is filer-only answers for these placeholders, that narrowing needs the owner’s decision.

8. **High — parked recommendations are being treated as approval (§7).** The heading says the build follows the recommended answers meanwhile. D596 instead says **“only that piece is left undone”** when a choice belongs to the owner.

   Excluding OD/CSE and limiting filing to one day are genuine product restrictions. The existing one-row behaviour explains the recommended limitation; it does not settle what the owner wants. Park those choices with the exact dependent work left unfinished, and continue independent work only. A new live count on the Inputs card was not requested, so its omission can remain an explicit first-version limit without adding that feature or blocking unrelated work.

VERDICT: NOT CLEAN — the planner must close the save, OIL-control and display gaps; the owner must settle the unresolved product restrictions and any narrowing of individual OIL-answer rights before those parts are built.

Rulings: none this session