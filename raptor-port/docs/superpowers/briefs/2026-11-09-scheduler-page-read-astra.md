Found **15 findings**. The page needs corrections before it can claim that every omitted rule is held whole by tests.

1. **D1751 — Q2: an explicitly unconfirmed reading becomes a settled instruction.**  
   [Page lines 82–83](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:82) prescribe taking, releasing and overriding the new day mark. But [D1751’s full row](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:21) calls retaining those mechanisms “the agent’s readings … not yet checked with him” and says “he may strike any”. A fresh builder would treat their retention after the simplification as approved. **Fix:** distinguish the older rulings from the unconfirmed proposal to retain them under D1751.

2. **D454 — Q1: forced take-over loses its second confirmation and history entry.**  
   [Page line 83](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:83) retains “Take over anyway” and the saved plan, but drops “asked again, noted in the history” from [the full row](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:257). A builder following the page could override a holder who chose Keep editing without either safeguard. **Fix:** restore both requirements beside “Take over anyway”.

3. **D1045 — Q1: the no-debrief rule is narrowed to SPARE.**  
   [Page line 190](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:190) says, “For a flying SPARE … its day ending at END with no debrief added.” [D1045](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:77) applies that ending to the **standby line**, with every row flying when B or R is entered. The rewrite permits a reader to add debrief time to MAIN, AVALON or BB. **Fix:** state separately that a standby line with B or R entered ends at END, with no debrief added.

4. **D186 — Q1: the exception to “no rule versioning” is attached to the wrong value.**  
   [Page line 111](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:111) attaches “the one printed value” exception to an immediately updated callsign. [The full row](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:288) identifies that value as the **published brief lead**; callsigns remain live labels. A fresh reader could freeze callsigns or fail to preserve the issued brief lead. **Fix:** separate the statements: callsigns update immediately; the published brief lead is retained; the rulebook itself remains unversioned.

5. **D531 — Q1 and Q3: non-exact mission names lose their explicit question rule.**  
   [Page line 294](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:294) asks about DS/red in **Remarks**, but omits a Mission such as `DS-2`, `RED AIR 2` or `ACM/DS` with empty Remarks. [D531](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:217) explicitly requires the question in that case. The named engine tests establish unresolved classification; they do not establish that the question opens.  
   **Fix:** restore the Mission-box condition. Link D531 to an assertion exercising that screen behaviour—for example, the existing DS-2 case in [the editor tests](/C:/Users/User/projects/Raptor/raptor-port/src/ui/mission-role-interim-fixes.test.tsx:195)—before claiming whole coverage.

6. **D663 — Q3: the required group heading is tested only for the old format; the new-format test expects something different.**  
   [The test’s own explanation](/C:/Users/User/projects/Raptor/raptor-port/src/ui/changesmodel.test.ts:353) says the `Input · Meeting · 4 people` assertions cover stored history from before the one-record change. For a newly filed four-person input, [line 485](/C:/Users/User/projects/Raptor/raptor-port/src/ui/changesmodel.test.ts:479) instead expects `Input · <everyone’s names> · Meeting`.  
   [D663](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:185) requires the kind and **how many people**, with names underneath. D721 and D727, cited by the new test, concern input cards and the desktop Inputs list, respectively—not the changes window. **Fix:** keep D663’s wording on the page and require the new-format case to assert the count and names underneath, unless a later owner ruling authorises this change. This concerns newly filed inputs, not stored demo data.

7. **D517 — Q3: the test never supplies a chosen formation answer.**  
   [The named test](/C:/Users/User/projects/Raptor/raptor-port/src/engine/insights-mission-mix.test.ts:20) fixes the answer reader to return `null`. Its whole-formation case asserts that two pilots are both **unresolved**. It never proves that choosing blue or red categorises every eligible aircraft and cockpit crew member, as [D517 requires](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:230). Applying a chosen answer only to the first aircraft could escape it. **Fix:** test both answers with multiple aircraft and both cockpit seats, retaining the cancelled-aircraft exclusions; otherwise state the formation-wide rule on the page.

8. **D828 — Q3: placement is tested; full phone width is not.**  
   [The tests](/C:/Users/User/projects/Raptor/raptor-port/src/ui/toastplace.test.tsx:135) explicitly acknowledge that jsdom cannot establish width. They assert inline left/right margins and transforms. A stylesheet restriction could make the note half-width again while those assertions pass. That misses [D828’s central requirement](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:138). **Fix:** retain the app-wide phone-width rule, or add browser assertions measuring the rendered width, including with a window open and with the desktop behaviour preserved.

9. **D551 — Q3: the tests carrying its number do not hold its boundaries.**  
   [The named test](/C:/Users/User/projects/Raptor/raptor-port/src/ui/boardkeys.test.tsx:211) checks that the date is excluded from Tab’s route. It does not assert that empty available boxes are included while folded sections, closed editors and popups stay closed. Those are [D551’s requirements](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:209). Relevant assertions exist in the schedule-Tab tests, but those files do not explicitly name D551. **Fix:** attach D551 to the actual protecting assertions after checking their complete scope, or retain the boundary sentence on the page.

10. **D824 — Q3: the test checks one way of drawing a ring, not the complete ruled appearance.**  
    [The assertion](/C:/Users/User/projects/Raptor/raptor-port/src/ui/datecal-look.test.ts:168) searches date-calendar CSS for non-`none` **outline** declarations. A selected-date ring drawn with a border or box shadow would pass. It also does not establish the chosen bright disc and the click/tap versus keyboard behaviour required by [D824](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:140). **Fix:** retain that appearance rule, or assert the rendered selected date after mouse, touch and keyboard interaction.

11. **D345 / D167 — Q1: every history group opening by default disappears.**  
    [Page line 254](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:254) preserves grouping, order and Item as the default, but not **every group open until folded**, in both Item and Who. [D167’s amended row](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:303) explicitly records D345 replacing the earlier default of folding previously seen groups. A fresh model could restore that superseded default. **Fix:** add “Every group, in Item and Who, opens until folded.”

12. **D40 / D41 — Q1: the flag reasons’ responsive placement disappears.**  
    [Page line 199](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:199) retains dimensions, columns and flags, but loses the reasons sitting **under their pucks at the narrow width and beside them when widened**. [D41](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:337) expressly settles that behaviour; D40 also says the reason never disappears. The separate rule for the board’s crew panel does not cover this window. **Fix:** restore the placement and never-hidden condition.

13. **D947 — Q1: the phone’s crowded-row exception disappears.**  
    [Page line 287](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:287) unconditionally puts the input button on its puck’s line. [The full row](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:111) permits it to drop underneath “where too many people leave no room”. A model could force a crowded phone row into one line. **Fix:** restore “where there is room; otherwise the button drops below the people”, for both the board and week.

14. **D360 — Q2: the agent’s interpretation of where the admin is told becomes his rule.**  
    [Page line 200](/C:/Users/User/projects/Raptor/.claude/rules/decisions/scheduler.md:200) says “where OIL is decided the admin is told”. [D360’s full row](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:266) expressly labels that placement—the earning half and OIL Earn seat—as the agent’s interpretation of “to the admin”. His rule requires the explanation, but does not itself choose those surfaces. **Fix:** retain the owner’s requirement and identify the placement as the agent’s reading, rather than presenting it as settled owner wording.

15. **D1699 / D1710 — Q5: the new citations are attached to an unrelated rule.**  
    [People page line 112](/C:/Users/User/projects/Raptor/.claude/rules/decisions/people-accounts.md:112) adds these numbers to the **8px blue-ring** sentence. [D1699 and D1710](/C:/Users/User/projects/Raptor/.claude/decisions-full/scheduler.md:22) govern taking back bell notices, not ring geometry. The preceding notice sentence is where they belong. **Fix:** move them to that sentence’s citation bracket; leave the ring sentence citing D1694.

For the remaining questions:

- **Q1:** all **334 numbered table rulings** remain cited. Not every old head reference remains literally present: D46 from “Also read”, and D715/D718 from the Inputs pointer, disappear. They were already archived with replacements; I found no additional current-rule loss from those omissions.
- **Q4:** all seven moved blocks match the old text byte for byte. Their destinations exist. “Settled before this list” remains, with the old group names and usable pointers. The moves report also lists rewritten material; it is not, by itself, proof of loss.
- **Q5:** apart from the misplaced citations above, the specified design, Inputs, people and always-loaded rule changes are citation additions, including the stated record-decisions parenthesis. I found no further loss in the eight tightened OIL lines or contradiction introduced by the map updates.
- **Q6:** no finding. D1944 answers the reconsideration after D611’s threshold was crossed, while preserving one scheduler page and the separate Inputs file. D1944’s own short statement matches its bold rule; it does not incorporate the separately marked agent readings.

Read-only inspection throughout. No files changed and no tests executed.

Rulings: none recorded; read-only review.

rulings checked: 334