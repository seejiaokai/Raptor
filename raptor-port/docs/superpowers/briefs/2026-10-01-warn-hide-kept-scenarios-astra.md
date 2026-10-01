## Ranked walk scenarios

D56 applied: every scenario below creates or changes fresh data through the app. I have not treated legacy stored hides, migration, or backward compatibility as findings. If any setup cannot be reached through the production controls, that missing door is itself the failure.

1. **Issued-face Insights must not adopt a pending hide early.**  
   **Surface / rule:** View-only Sched → Insights; WH5, WH9, D45, D471. **SETUP:** Publish Tuesday with Static’s long-day warning visible; complete the four sign-offs; on Edit Schedule hide that warning but do not publish the amendment. **ACTION:** Sign in as a second member, open the issued Tuesday and then **Insights**. **EXPECTED:** Tuesday’s issued puck, issued issue count, “Conflicts by type,” “By day,” and weekly issue total all retain the warning until AL1 goes out; after AL1, each drops by one. **DISPROOF:** Insights drops the warning while the issued face still flags it, or disagrees internally between its tile, type, and day counts.

2. **“Also flagged on” must refresh during the hide gesture.**  
   **Surface / rule:** Edit Schedule’s person-narrowed issue lists; WH3, WH5, roll-call row 9. **SETUP:** Give one man a visible warning on Tuesday and Wednesday; tap his puck so both days open and one list says “also flagged on …”. **ACTION:** Without clearing the person selection, press `✕` on the only warning naming him on one day; then press `↺`. **EXPECTED:** The hidden day immediately leaves “also flagged on”; his clean puck no longer opens that day. `↺` adds it back immediately. The struck line itself remains visible if that day’s list is opened directly. **DISPROOF:** The echo still names the hidden day, or does not return after `↺`.

3. **An older-version load must count only what it will actually replace.**  
   **Surface / rule:** Version look → **Load onto working copy**; WH8, D98. **SETUP:** Publish Original with a warning flagged; hide it and publish AL1; then flag it again on the working copy, so the working hide state already matches Original but differs from AL1. **ACTION:** Look at Original and press **Load onto working copy**. **EXPECTED:** The confirmation and completion sentence count only real changes the load will replace. They must not claim the flag-again was replaced if Original also has it flagged; afterward the one hide difference from current AL1 remains pending. **DISPROOF:** “Discard 1 edit”/“1 edit replaced” appears solely for that already-matching hide, followed by the same one pending change.

4. **Next-week preview: draft nought-minute warning.**  
   **Surface / rule:** trailing next-week preview; WH3, WH12. **SETUP:** On next Monday make a flying line’s take-off and landing identical, producing its no-man nought-minute warning and red time boxes; leave Monday draft. **ACTION:** Hide that warning, return to the previous week, and inspect the next-Monday preview. **EXPECTED:** Both red time boxes disappear; the warning stays struck in Monday’s list. `↺` on Monday restores the preview boxes. **DISPROOF:** The preview retains a red box, loses only one box, or follows an unrelated hide.

5. **Next-week preview: published nought-minute warning waits.**  
   **Surface / rule:** preview across the publish boundary; WH9, WH12, D471. **SETUP:** Publish next Monday with the nought-minute warning visible. **ACTION:** Hide it on Monday’s working copy, inspect the prior week’s preview, publish the amendment, inspect again, then flag it again and repeat. **EXPECTED:** The preview retains the red boxes while the hide is pending, drops them only after the amendment, retains their absence while flag-again is pending, and restores them only after that amendment. **DISPROOF:** The preview follows working state instead of issued state.

6. **Sunday’s dotted crew-rest mark follows draft Monday in both directions.**  
   **Surface / rule:** Sunday → next Monday; WH3, WH12, D475. **SETUP:** Give Bane a late Sunday duty and an early next-Monday flying report so Monday raises **Crew rest** and Sunday shows the dotted “Breaks Monday” mark. **ACTION:** Hide Monday’s breach, navigate back to Sunday, then return and press `↺`. **EXPECTED:** The Sunday dotted mark and CR chip disappear when Monday’s draft warning is hidden and return when it is flagged again. **DISPROOF:** Navigation direction changes the answer, or an unrelated hide removes the mark.

7. **Sunday’s dotted mark follows published Monday only after amendment.**  
   **Surface / rule:** published week edge; WH9, WH12, D183, D471. **SETUP:** Publish next Monday with the crew-rest breach visible. **ACTION:** Hide it, reload, sign in as a second scheduler, inspect the prior Sunday; publish the amendment and inspect again. Reverse with `↺`. **EXPECTED:** Sunday follows Monday’s issued hide set, not its working set, at every checkpoint. **DISPROOF:** The mark moves before publication, fails to move afterward, or is lost across reload/sign-in.

8. **Exempt AVALON/BB flying seats lose only their own hidden marks.**  
   **Surface / rule:** Edit Schedule and Board exempt flying lines; WH3. **SETUP:** Put a medically unavailable or unqualified man into an AVALON/BB/SC-SPARE seat so that line raises several anchored warnings; keep another warning for him elsewhere. **ACTION:** Hide one anchored warning, then every warning anchored to the exempt seat. **EXPECTED:** One hidden warning leaves the seat ringed by the others; after all its own warnings are hidden that copy is plain, while his separately guilty copy remains flagged. **DISPROOF:** The exempt puck keeps a hidden warning’s ring, or hiding it cleans unrelated copies.

9. **An exempt duty desk loses its own red C only.**  
   **Surface / rule:** AVALON/BB `noconf` duty desk, week and board; WH3. **SETUP:** Put a medically unavailable man on the exempt desk and also on a separately guilty flying line. **ACTION:** Hide the desk-anchored clash/availability warning. **EXPECTED:** The desk’s red ring/C disappears on both surfaces; his other line remains flagged. **DISPROOF:** The desk reads the day-wide worst warning, or week and board disagree.

10. **ALL AVAIL window removes the hidden reason, not the man.**  
    **Surface / rule:** ALL AVAIL window; WH3, D38–D41, D65. **SETUP:** Open an ALL AVAIL/ALL chip whose crowd includes a man with one visible warning. **ACTION:** Hide that warning and reopen the window on the same working face; repeat after publishing it hidden. **EXPECTED:** The real puck becomes plain, its reason disappears, “N men are flagged” decrements, but the man remains in the availability list. The issued window changes only after amendment. **DISPROOF:** He vanishes, retains a reason/ring, or the count and rows disagree.

11. **Ordinary cockpit seat and crew palette share one qualification state.**  
    **Surface / rule:** flying seat plus crew lists beside week and board; WH3. **SETUP:** Put an ineligible WSO/ground-crew person in FCP so **Qualification** is his sole warning. **ACTION:** Hide the qualification line from the week, then inspect the cockpit seat and both crew palettes. **EXPECTED:** Every copy loses Q and its ring; `↺` restores every copy. **DISPROOF:** Any palette or board/weekly cockpit copy keeps Q.

12. **Sim, ground, Common Programme, passengers, and extras replay all same-code marks.**  
    **Surface / rule:** every non-flying row renderer; WH3, WH13. **SETUP:** Through row add/people controls, place one man in a sim, sim passenger/extras, ground item, Common Programme item, and an extras row so several same-code clash warnings name him. **ACTION:** Hide those warnings one at a time. **EXPECTED:** His C/ring remains while any shown warning of that code still names him, then disappears from every copy only after the last is hidden. **DISPROOF:** The first hide clears too much, or an extras/passenger renderer keeps the final hidden mark.

13. **Available, SANS, Unavailable, and Personal Inputs pucks follow the shown bundle.**  
    **Surface / rule:** lower schedule blocks; WH3. **SETUP:** Create, through Inputs and schedule controls, one warned person visible in each kind of block. **ACTION:** Hide each exact warning. **EXPECTED:** Its corresponding puck loses ring/chip/dash while the row and input remain; other warnings still decorate it. **DISPROOF:** Any block draws raw marks or disappears rather than merely becoming plain.

14. **Ordinary duty desks obey the shared map.**  
    **Surface / rule:** timed and untimed duty rows, including extras; WH3. **SETUP:** Put a man on a duty which clashes with another task, and give him an unrelated advisory too. **ACTION:** Hide the clash, then the advisory. **EXPECTED:** Red becomes amber after the first hide and plain after the second, on week and board. **DISPROOF:** A duty-specific renderer remains red or skips the remaining advisory.

15. **A crew-pairing warning names and clears both people together.**  
    **Surface / rule:** cockpit seats and issue lists; WH3. **SETUP:** Build an unauthorised OCU pairing/no-instructor/no-IR case that names both crew. **ACTION:** Hide that one pairing line. **EXPECTED:** Both men lose the ring/chip raised by that item; unrelated warnings on either remain. The struck line still names both. **DISPROOF:** Only one seat clears, or both become plain despite another warning.

16. **A several-man double-turn line clears every DT chip it owns.**  
    **Surface / rule:** double-turn summary; WH3, WH13. **SETUP:** Arrange several men to trigger one **Double turn** summary line. **ACTION:** Hide it. **EXPECTED:** Every named man loses the DT chip from that line, with other flags preserved. **DISPROOF:** Any named man keeps DT, or an unnamed man changes.

17. **TURN and CREW_TIGHT stay distinct.**  
    **Surface / rule:** tight-turn warnings; WH3, D188. **SETUP:** Create one ordinary same-day tight turn and one crew-rest tight-turn note. **ACTION:** Hide each separately. **EXPECTED:** Hiding TURN removes only its TT; hiding CREW_TIGHT removes its own TT while respecting the published-live crew-rest class. **DISPROOF:** One hide clears both, or a mark was attributed to the wrong code.

18. **A man with two severities falls to the remaining one.**  
    **Surface / rule:** clash plus another warning; WH3, D475. **SETUP:** Give Saint a hard clash and an amber advisory. **ACTION:** Hide only the clash. **EXPECTED:** His puck and the day bar fall from red to amber, never plain; hide the advisory too and both become quiet. **DISPROOF:** The first hide removes all flagging or leaves the red severity.

19. **No-man warnings keep a working gesture but no visual flag.**  
    **Surface / rule:** `FLT_NO_LEN` and OIL reminder lines; WH3–WH6, OIL negative. **SETUP:** Create a nought-minute line and a no-person OIL reminder. **ACTION:** Hide each from both Edit Schedule and Board. **EXPECTED:** Its list line remains struck with `↺`; its count disappears; the nought-minute red boxes disappear; OIL calculations and the underlying row remain unchanged. **DISPROOF:** The line becomes unreachable, a red box remains, or hiding changes OIL entitlement.

20. **Long-day hiding clears every Static copy without changing hours.**  
    **Surface / rule:** Tuesday demo long day; WH3, WH5. **SETUP:** Use Static’s “long work day” warning. **ACTION:** Hide it and inspect all Static pucks and Insights work hours. **EXPECTED:** L/ring disappears everywhere and warning counts drop, but Static’s work-hours figure is unchanged. **DISPROOF:** A puck retains L, or the schedule/work-hours calculation changes.

21. **Edit Schedule list matches the approved picture at both widths.**  
    **Surface / rule:** desktop and 390px phone; WH4–WH6, D469, D472, D475. **SETUP:** Tuesday starts at four issues. **ACTION:** Hide its fourth warning, then hide all four. **EXPECTED:** It reads three issues with no hidden count; the struck line stays fourth, dark/grey with dashed treatment and reachable `↺`. With all hidden, the quiet `✓ No issues · tap to review` bar remains and opens all struck rows. **DISPROOF:** Reordering, “N hidden,” wrong colour/count, clipped line, or covered button.

22. **Board list matches the approved picture at both widths.**  
    **Surface / rule:** desktop and phone Board; WH4–WH6. **SETUP:** Use the same Tuesday hides. **ACTION:** Open/collapse the phone issues fold and resize the desktop checks panel before and after hiding. **EXPECTED:** Board count and row order match Edit Schedule; all-hidden reads “No conflicts flagged for Tuesday ✓” and the phone fold still opens. `↺` remains the topmost hit target. **DISPROOF:** Surface drift, a dead phone fold, or the splitter/scrolling hides the control.

23. **Day-info popup counts shown rows but lists every row.**  
    **Surface / rule:** day `ⓘ`; WH4–WH6. **SETUP:** Hide one of several warnings, then all. **ACTION:** Open day details on working, issued, and older-version faces. **EXPECTED:** Severity counts omit hidden rows; struck rows remain in place. All-hidden says “Nothing flagged” while still listing them, and each document uses its own hide state. **DISPROOF:** Hidden rows are counted, omitted, or taken from the wrong world.

24. **Working-copy Insights agrees in all three summaries.**  
    **Surface / rule:** scheduler’s **Insights**; WH5. **SETUP:** Record Tuesday/weekly/type totals, hide LONGDAY, then `↺`. **ACTION:** Reopen Insights after each gesture. **EXPECTED:** Weekly total, “Conflicts by type,” and “By day” fall and rise together by one. **DISPROOF:** Any of the three remains raw or double-counts.

25. **The two lists share one hide and a struck-row tap still locates its crew.**  
    **Surface / rule:** Edit Schedule ↔ Board; WH4. **SETUP:** Open the same warning on both. **ACTION:** Hide it in one surface, switch to the other, tap the struck row, then `↺` there. **EXPECTED:** One shared state; the hidden row tap still lights and scrolls to its named crew, while an unopened box does not light hidden-warning names automatically. **DISPROOF:** Separate state, stale button, wrong index, or no crew highlight.

26. **A drop that recreates an acknowledged exact warning stays silent.**  
    **Surface / rule:** drag/drop toast and blink; WH3, WH10. **SETUP:** Hide an exact clash, change the schedule so it vanishes, then drag/drop to recreate precisely the same clash; repeat with a genuinely changed clash. **ACTION:** Observe toast and pulse. **EXPECTED:** The exact hidden warning produces neither toast nor blink; the changed warning returns shown and announces itself. **DISPROOF:** A hidden warning shouts, or a genuinely changed one remains suppressed.

27. **Every role gets the correct face and door.**  
    **Surface / rule:** scheduler, member, guest, admin in member view; WH2, WH7, WH11, D213, D215, D475. **SETUP:** Publish a hidden warning. **ACTION:** Sign in successively under all four roles. **EXPECTED:** Scheduler working surfaces have `✕/↺`; member and admin-member-view see the struck issued line with no button; guest sees the same issued puck state and has no hide door (its existing guest tree has no issues panel). No non-scheduler can alter the state. **DISPROOF:** A read-only role receives a control/write, or a role sees a different issued flag/count.

28. **Draft hide survives reload, sign-out, sign-in, and the next edit.**  
    **Surface / rule:** stored day state; WH1, WH2. **SETUP:** Hide Tuesday LONGDAY while draft. **ACTION:** Hard reload; sign out/in as the same scheduler; sign in as a second member; return as scheduler and edit a different Tuesday field; reload again. **EXPECTED:** The line remains struck and saved throughout. **DISPROOF:** Any transition revives it or the unrelated edit erases it.

29. **Hides are isolated by week and restored on navigation.**  
    **Surface / rule:** second week persistence; WH1, WH10. **SETUP:** Hide Tuesday in week 1; navigate to week 2 and hide a different Monday warning. **ACTION:** Move back and forth, reload in each week, and sign in as a second user. **EXPECTED:** Each week restores only its own day keys. **DISPROOF:** A hide leaks by day index/code into the other week or is lost on return.

30. **Two schedulers see hide then flag-again as shared state.**  
    **Surface / rule:** concurrent/shared record; WH2, WH11, D469. **SETUP:** Two scheduler sessions show the same warning. **ACTION:** Scheduler A hides; B refreshes and presses `↺`; A refreshes. **EXPECTED:** B sees A’s hide; A then sees B’s flag-again. History names both acts and actors. **DISPROOF:** Per-session state, duplicate contradictory rows, or last refresh resurrects stale state.

31. **Undo and Redo replay the hide, marks, counts, and persistence.**  
    **Surface / rule:** top bar and Board Undo/Redo; WH1, WH3–WH5, WH11. **SETUP:** Hide one warning. **ACTION:** Undo, Redo, reload; repeat after flagging again. **EXPECTED:** Labels read “hiding a warning” / “flagging a warning again”; every list, puck and count moves together; the redone state survives reload. **DISPROOF:** Only the set changes, the screen remains stale, or persistence disagrees.

32. **Undo refuses after another person changes that day’s hides.**  
    **Surface / rule:** shared Undo/history; WH11, D148. **SETUP:** A hides a warning; B later toggles a warning on the same day. **ACTION:** A presses Undo. **EXPECTED:** Undo refuses and names B rather than overwriting the newer day hide record. A change by B on another day must not block A. **DISPROOF:** A overwrites B, loses his own undo for an unrelated day, or gets a generic refusal with no actor.

33. **A rename is a label change, not a new warning.**  
    **Surface / rule:** Quals/Admin rename plus pending signature; WH10, D45. **SETUP:** Hide a warning naming Static; on a published day sign all four over the pending hide. **ACTION:** Rename Static’s callsign through the app. **EXPECTED:** The warning remains hidden, its displayed wording uses the new callsign, the pending address remains the same, and the four sign-offs stand. **DISPROOF:** The warning returns, duplicates, or invalidates signatures.

34. **Situation changes show a new warning; exact restoration reuses the acknowledgement.**  
    **Surface / rule:** warning identity; WH10. **SETUP:** Hide LONGDAY. **ACTION:** Shorten the day so it clears; lengthen it to a different duration that still triggers; finally restore the exact original schedule. **EXPECTED:** The changed warning is shown automatically; the exact original warning becomes hidden again because its stale key is inert but retained. **DISPROOF:** Every future warning stays hidden, or exact restoration forgets the acknowledgement.

35. **Saved plans do not own hides.**  
    **Surface / rule:** plan selector; WH10, plan §3.4. **SETUP:** On Plan A hide an exact warning; switch to Plan B where it does not exist. **ACTION:** Switch back to A, then to another plan that recreates the exact warning. **EXPECTED:** The hide stays with the day, inert while unmatched and active whenever the exact warning returns; plans do not carry separate hide sets. **DISPROOF:** Switching loses, duplicates, or transfers a hide as plan data.

36. **Day templates carry schedule content, not hide records.**  
    **Surface / rule:** **Templates**; WH10. **SETUP:** Hide a Monday warning, save/apply that day template to Wednesday. **ACTION:** Inspect Wednesday, then apply a template that changes Monday away and back. **EXPECTED:** Wednesday’s same-looking warning is shown because the key includes its day; Monday’s exact restored warning is hidden. **DISPROOF:** The template imports Monday’s hide into Wednesday or erases Monday’s stored hide.

37. **Hide first, then publish.**  
    **Surface / rule:** draft → Original; WH7–WH9, D471. **SETUP:** Draft Tuesday with a visible warning. **ACTION:** Hide it, reload/sign in as a second scheduler, complete the four sign-offs and publish Original; reload/sign in as a member. **EXPECTED:** Original goes out with the line struck, count reduced and puck plain; there is no pending hide after publication. **DISPROOF:** Publishing revives it, produces a pending change, or stores raw visible marks.

38. **Publish first, then hide, then amend.**  
    **Surface / rule:** Original → pending → AL1; WH8, WH9, D45, D103. **SETUP:** Publish and sign Tuesday with the warning visible. **ACTION:** Hide it; at the pending checkpoint reload and use a second sign-in; then sign and publish AL1 and repeat. **EXPECTED:** Working copy immediately strikes/cleans it; issued face remains flagged; exactly one pending item appears and four sign-offs fall. AL1 then strikes/cleans the issued face and clears pending. **DISPROOF:** Issued state changes early, counts disagree, or AL1 fails to freeze the hide.

39. **Hide, publish, flag again, amend.**  
    **Surface / rule:** issued-hidden → pending flag-again; WH8, WH9. **SETUP:** Hide on draft and publish Original hidden. **ACTION:** Press `↺`; reload and second-sign-in; publish AL1. **EXPECTED:** Working copy shows the warning and one “hidden → flagged again” pending item, but issued face stays struck/plain until AL1; afterward it is fully flagged. **DISPROOF:** Issued face revives early or the pending wording/direction is reversed.

40. **Every pending authority says exactly one.**  
    **Surface / rule:** day chip, Changes window, Amendments, sign-offs, publish button; WH8, D97–D99, D103, D168, D346. **SETUP:** Hide one warning on a signed published day. **ACTION:** Inspect every authority; sign the four; tap the pending row. **EXPECTED:** One pending/change everywhere; four initially fall; marker changes from “Not yet signed” to “Not yet published”; To go out places “Warning · … flagged → hidden” under “The day”; tapping it lands on the struck line; no second “Warnings on this day changed” row. **DISPROOF:** Any zero/two count, duplicate warning-change line, wrong group, or dead jump.

41. **Unpublish restores the prior issued face while retaining working hides.**  
    **Surface / rule:** Unpublish; WH8, WH9, D101. **SETUP:** Original flagged, AL1 hidden. **ACTION:** Unpublish AL1; reload and sign in as another scheduler. **EXPECTED:** Issued face falls back to flagged Original; the working copy remains hidden and therefore reads one pending hide; button is **Publish AL1**, never “Reissue”. **DISPROOF:** Working hide is lost, face stays on withdrawn AL1, or pending is zero.

42. **Load the current version resets its hides exactly.**  
    **Surface / rule:** current-version **Load onto working copy**; WH8, D98. **SETUP:** Current issued version has the warning flagged; working copy hides it. **ACTION:** Load the current version, confirm once, reload and use a second sign-in. Repeat with an issued-hidden version and a working flag-again. **EXPECTED:** The working hide set becomes the current version’s, pending becomes zero, and the confirm count is one. **DISPROOF:** Content loads but hide state remains, or pending/count survives.

43. **An older-version look is immutable and carries its own hides.**  
    **Surface / rule:** eye/look on Edit Schedule and Board; WH7, D187. **SETUP:** Original flagged, AL1 hidden, AL2 flagged again. **ACTION:** Look at each version at desktop and phone widths; tap its struck row where present. **EXPECTED:** Original and AL2 are flagged; AL1 is struck/plain. All looks are read-only—no `✕`, `↺`, period-creation, pending marker, or working-hide bleed—but a struck row still lights its recorded crew. **DISPROOF:** Every version follows current working state or exposes a write door.

44. **Explicit unchanged surfaces remain unchanged.**  
    **Surface / rule:** Logic, print/PDF, CSV, Leave War, OIL; plan §10, D56, D471. **SETUP:** Record Logic’s “fired NA-” value, printable/CSV content, Leave War state, and OIL entitlement; hide and unhide several warnings, including OIL_NO_PERIOD. **ACTION:** Export/print and revisit each page after reload. **EXPECTED:** Logic’s fired count still includes hidden firings; print/CSV contain no warning decoration before or after; Leave War and OIL records/credits are byte-for-visible-behaviour unchanged. **DISPROOF:** Hiding alters rule firing, output rows, war decisions, or earned credit.

## Places I believe are missing a call site

1. **Issued-face Insights has no displayed-world resolver.**  
   [Modals.tsx](C:/Users/User/projects/Raptor/raptor-port/src/ui/Modals.tsx:66) reads the module-global working `WARN`, while [computeInsights](C:/Users/User/projects/Raptor/raptor-port/src/engine/insights.ts:9) calls `validate()` and therefore reinstalls the working bundle before counting. [InsightsModal](C:/Users/User/projects/Raptor/raptor-port/src/ui/Modals.tsx:189) does not resolve per day through the issued/version face. A person sees this as scenario 1: a member’s issued Tuesday remains flagged while Insights has already dropped the pending-hidden warning.

2. **A live person focus is not recomputed after hide/flag-again.**  
   [selectPerson](C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:571) correctly constructs `PFOCUS.days` from shown warnings, but [toggleWarnOff](C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:800) only revalidates. [dayWarnHTML](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1141) trusts the old `PFOCUS.days`. A person sees scenario 2: “also flagged on Tuesday” remains immediately after the only shown Tuesday warning is hidden, and the reverse can remain absent after `↺`.

3. **The older-version load path has no target-version hide comparison.**  
   [dayDiscardCount](C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:702) always compares against `dayCurVer(di)` and adds `hideDelta(di)` for that current version. The handler in [interactions.ts](C:/Users/User/projects/Raptor/raptor-port/src/ui/interactions.ts:1024) has the selected `ver` but calls the unparameterised count. A person sees scenario 3: loading an older version can say a hide edit will be discarded/replaced even when the working hide set already equals that older version and the same pending difference remains afterward.

All three affect new actions on newly created data, so D56 does not exclude them.

## Explicit negatives — inspected and apparently wired

- The core `shownOf` replay keeps hidden rows in place, removes only marks whose shown warning/code/person support is gone, and retains the raw bundle for publication comparison.
- Ordinary puck renderers share the filtered severity/chip/dash/trace maps; the mark-attribution guard covers newly validated fixtures.
- Exempt desk and exempt flying-line readers explicitly use shown warnings rather than raw lists.
- ALL AVAIL reasons and flagged counts use `shownWarns`; its puck rendering reuses the displayed document’s world.
- The nought-minute red-box reader matches the exact hidden warning by slot key; the next-week preview reads the target week’s effective hides.
- Edit Schedule, Board, and day-info list renderers read each displayed warning’s own `off`, preserving version-specific state and row indices.
- Day and Board counts, worst colour, Insights’ working-copy counts, and day-popup severity counts use shown warnings.
- Puck taps initially derive flagged days from the displayed bundle, and open-box highlighting skips hidden rows; deliberately tapping a struck row still lights its crew.
- Drop toasts skip a warning that arrives with `off`.
- `hideDelta` is present in both publication authorities: the canonical delta/signature path and the pending-items/count/list path.
- Issuance stores raw comparison warnings separately from `wo`, shown frozen marks, and the version face; older-version looks read those stored hides without write controls.
- Boot/week loading, sign-in reset, command persistence, Undo/Redo descriptions, history lines, and scheduler-only permission checks all have explicit hidden-warning wiring.
- Cross-week crew-rest/run traces consult next Monday’s working hides when draft and issued hides when published, with keep-the-mark fallback when unresolved.
- Saved plans do not write hide state; version loads do set the selected version’s day hides before the save epilogue.
- Logic deliberately counts hidden firings. Print and CSV contain no warning decoration. Leave War and OIL do not consume hide state.

This was a read-only design/source audit; these negatives still require the walk above before they are evidence of runtime correctness.

