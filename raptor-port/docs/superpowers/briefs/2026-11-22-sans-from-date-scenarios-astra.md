I read an exported copy of commit bf333f432.

I found **three additional source-backed failure candidates**: the Medical page’s dated cards, a member’s published next-week preview, and a preview already drawn before a SANS change. The filed Leave War counting gap also needs a stronger test: an untick can make one man count in both regular availability and committed SANS.

These are cases for the host to prove with failing tests and the running app. I changed no files and ran no app or tests.

Use freshly created scenario records. Unless stated otherwise, set the test date to **20 July 2026**, with Hex an ordinary WSO before that day. Run the applicable cases at desktop 1536 and iPhone 402; the next-week preview cases are desktop cases.

**Ranked scenarios**

Each case below states what to set up, what to do, what should happen and what would disprove it.

1. **Medical “as of” cards — omitted surface.**  
   Give Hex a medical covering 16–24 July, then tick SANS on 20 July. Open Medical and select 18 July, then 20 July; open and close his document and repeat. The first card should have no SANS edge, the second should have it. Repeat with Pending Upchit and Upchit Complete cards whose records fall in the selected view. **Disproof:** the edge follows today’s tick instead of the selected date. D2313; the card design is D965. Source-backed candidate A below.

2. **A member’s next-week preview leaks an unpublished SANS change.**  
   Before ticking Hex, publish 27 July with him named in a seat. Tick him on 20 July. Start a fresh view of the week beginning 20 July and inspect its next-week preview as a member, then enter 27 July itself. Both published views should retain his published appearance until an amendment; the working copy should show the change. **Disproof:** purple in the preview but ordinary in the published day, or any unpublished change reaching the member. D44, D186, D1010. Candidate B.

3. **A warm next-week preview fails to refresh.**  
   Put Hex on 20 July. Display that day in the working next-week preview while the week beginning 13 July is loaded. Visit Quals, tick him on 20 July, then return without visiting or editing the next week. Repeat for untick and Undo/Redo. **Expected:** the working preview immediately follows the saved dated status. **Disproof:** it changes only after reload, visiting the next week or another unrelated action. D2313. Candidate C.

4. **An untick hides a real SANS shortage — already filed counting gap, stronger consequence.**  
   Isolate a day on which only Hex can contribute to the WSO figures. Require two WSOs on 21 July; Hex is SANS from 20 July and offers F on the 21st. Untick him on 22 July. On the 21st the figures must remain **0 regular available, 1 committed SANS, 1 still needed**. Check the grid, SANS month, opened day and working figures. **Disproof:** regular availability becomes 1 and still needed becomes 0. D2313, D617. Repeat with Show SANS on and off.

5. **Before-start counting reaches every warning and decision surface.**  
   Establish the 18 July figures, then make Hex SANS from 20 July. Inspect Available W, a bid’s manning warning, Approvals’ LOWEST AVAIL, the red-day list and its jump back to the grid. Repeat with a customised Available row. **Expected:** the 18th’s figures and warning levels do not change merely because of the later SANS start. **Disproof:** any total, warning, approval comparison or red-day membership changes. D2313, D640, D1243. This expands the filed gap; it is not a new finding.

6. **Inputs and SANS calendars disagree about a historical man — already filed.**  
   Start SANS on 20 July, file commitments, then untick on 22 July. Open Inputs on the 18th and SANS on the 21st. Inspect groups, every visible puck, counts, “no longer SANS” and Highlight. Scroll to names initially off-screen; close and reopen the day. **Expected:** the 18th shows an ordinary WSO; the 21st retains his SANS identity and commitment. **Disproof:** correct totals beside an ordinary-looking historical SANS puck, or no way to highlight his historical commitments. D2313, D619, D651.

7. **Whole Leave War row versus dated badges.**  
   Set a future SANS posting before its effective date. Inspect the grid, then Balances and Approvals. **Expected:** the grid moves the whole row and gives it the posting’s purple line immediately; Balances and Approvals show today’s status and gain the line on the posting date. **Disproof:** making the grid date-sensitive, or making the other two badges purple early. D321, D1692, D1697, D1711. This is an explicit exception, not a defect to “standardise”.

8. **The everyday task, end to end.**  
   On Quals enable editing and tick SANS; visit the Leave War and set a separate man’s SANS posting through its sheet. On the board, drag each man from the crew list onto a seat before and after his start. Repeat by selecting the seat and tapping the name. Open Available crew and ALL AVAIL; leave the board through Done; inspect Edit Schedule. Sign and publish, inspect as a member, return as admin and amend. Finally untick the first man and use **Undo post out** for the second.  
   **Expected:** the crew-list group, purple edge, availability reason, published view and pending change agree about the same day. **Disproof:** a correct appearance with an incorrect placement result, or one screen correcting itself only after reopening. D2313, D283, D44–45, D103.

9. **SANS availability checks across different jobs.**  
   On days before and after the start, try flying, OFT and AMT with: no offer; F only; O only; an all-day offer; and a timed offer that excludes the required reporting time. Repeat moving an existing assignment and placing from an armed seat. Include ordinary duty and ground rows as controls. **Expected:** before the start there is no SANS-specific restriction; afterwards the offered activity and window govern the applicable job. **Disproof:** one placement door judges another date, or OFT/AMT silently bypasses the dated check. D2313. Do not invent a persistent advisory for “no availability filed”: its existing treatment differs from a wrong activity or time window.

10. **Earlier publication stays untouched, for named people and crowds separately.**  
    Publish 18 July with Hex named; make a separate published case with ALL AVAIL, plus one with ALL AVAIL beside named people. Record the crowd, four signatures and OIL. Tick on 20 July, untick on 22 July and inspect all three. **Expected:** no SANS-caused pending change, lost signature or altered credit on the 18th. **Disproof:** any of those changes. D2313, D44–45, D103, D142, D327.

11. **A genuinely affected publication waits for amendment.**  
    Publish 21 July while Hex is ordinary, then tick him on 20 July. **Expected:** the working day records the relevant difference and requires the four sign-offs; the member’s published copy and credited OIL remain at the issued version until amendment. Publish the amendment, inspect it, then inspect the original version. **Disproof:** premature credit/appearance changes, no pending difference, or the original version being rewritten. D44–45, D103, D142, D186.

12. **Correct change, wrong person credited for it.**  
    Admin A makes Hex SANS on 20 July, affecting a previously published 21 July. On 22 July, admin B unticks him. Open the 21st’s pending list and change history. **Expected:** the historical SANS difference remains, and its explanation does not attribute that change to B’s later untick. **Disproof:** a “no → yes” difference attributed to the action that turned SANS off on a later day. D99–100, D2313. This is a targeted scenario, not a confirmed fault.

13. **The four promised publish sentences, through the actual Publish control.**  
    Use four independent non-working-day cases, with unanswered Training for: Ranger; Ranger and Hex; three named people; ALL AVAIL. Make the input the only possible OIL-earning activity. Publish each. **Expected:** respectively:
    - “Ranger’s Training”
    - “Ranger and Hex’s Training”
    - “Training for 3 people”
    - “Training for ALL AVAIL”

    Each must carry the promised explanation that nobody on it earns OIL. Check the resulting credit as well as the message. **Disproof:** the wrong recipient, person count, possessive placeholder or credit. D2314.

14. **Publish wording with several inputs and a later answer.**  
    Have somebody else file Ranger’s Training; combine it with answered and unanswered inputs. Test two, three and four unanswered inputs, then answer one and publish an amendment. Include the blank-desk and bid messages so the combined note is exercised. **Expected:** recipients rather than filer are named; only unanswered inputs are described as unanswered; credits follow the latest publication. **Disproof:** “people” used for a count of inputs, answered work still blamed, a lost adjacent warning or premature credit. D2314, D142. Test ALL AVAIL beside names separately: its exact wording remains the host’s interpretation.

The following are **separate lifecycle cases**, not one refresh exercise:

| Rank | Setup and action | Expected result and disproof |
|---|---|---|
| **15. Reload** | Create an ended stretch, 20–22 July, and a new stretch starting 24 July; reload. | SANS on 20–21 and from 24; ordinary on 18 and 22–23. Any filled gap or lost stretch disproves D2313. |
| **16. Sign out/in** | Use the same history; sign out and return as Hex, then admin. | Same dated answers, with the correct role’s controls. A role-dependent history or changed date disproves it. D2313, D149. |
| **17. Week change** | Leave the affected week, visit another month/year and return. | Dates, counts and pending state remain identical. A result that depends on the last week visited disproves D2313. Include a fresh stretch across 31 December/1 January. |
| **18. Undo/Redo** | Tick, untick, Undo, Redo; also do off/on on one day. | The complete dated state returns, not just the visible tick. A lost historical stretch or spurious same-day gap disproves D2313. These are hand-tick operations under D350. |
| **19. Move a posting date** | Set SANS from 20 July, move it to 22, then to 19. Inspect 18–22 after each move. | The effective boundary moves; unaffected earlier days stay untouched. Stale stripes, counts or pending changes outside the changed interval disprove D2313/D283. Repeat after a hand override to distinguish ownership. |
| **20. Undo a posting** | First create and end a hand-made SANS stretch; later set a SANS posting and press its own Undo post out. | The earlier independent stretch survives. Check the posting’s removal separately; erasing its SANS days is the host’s stated interpretation. Global Redo is not the expected recovery. D350. |
| **21. Archive** | Archive on 22 July after SANS on 20–21; repeat for hand-made and posting-made SANS. | Past published identity, signatures, leave and OIL remain. Archive closes the appropriate present stint. Loss of the past disproves D323/D2313. Also record whether historical SANS totals disappear; this needs its own check beyond the puck. |
| **22. Restore** | Restore that man with a later post-in date; repeat after his callsign has been reused. | Earlier history remains, the away interval stays away, and a name collision requires resolution rather than silently changing identity. D320, D286. A restored tick rewriting old dates disproves the dated promise. |
| **23. Delete** | Delete a SANS man on 22 July who appears on past and future schedules; reuse his callsign for a new person. | Past pucks, records and signatures retain the old person; today/future follow deletion rules; no Undo recovery is offered. Past identity loss or history transferred to the new person disproves D297/D299/D350. |

For the everyday round, exercise each relevant opener and closer: day/week arrows, jump-to-date, crew-panel controls, board menu and Done, ALL AVAIL, Inputs and SANS day panels, Highlight and clear, posting sheet and its question, published-version selector, pending list and its jump, bell and history. Check close button, outside click and Escape where supported. On the phone, include the board’s Phone/Desktop layout switch and the SANS panel’s height control.

Repeat representative cases as **admin, member editing his own Quals row, and member viewing the publication**. A scheduler is always an admin. For SANS filing, check member-own and admin-group routes; do not silently settle the host’s question about today’s eligibility.

**What the roll-call needs added**

| Missing surface or distinct state | Visible sign and working gesture to cover |
|---|---|
| Medical’s three card sections | Select “as of”; inspect the badge; open/close documents and return from editing. |
| Leave War Balances and Approvals badges | Compare today’s badge with the grid’s explicitly different posting treatment. |
| Approvals’ LOWEST AVAIL and bid comparisons | Open the request, inspect its figures, approve/refuse or move it, then inspect the affected day. |
| Manning red-day list, bid warning and count-editor preview | Open the list and jump; change a qualifying bid; preview a customised counter. |
| Printed schedule and CSV | Export an original and amended published day. Check the information each format actually carries; CSV need not grow a decorative stripe. D186 explicitly includes these outputs. |
| Older published versions, saved-plan views and loading a version | Open each version, then return to the working day; ensure the dated context does not carry into the next view. |
| Bell and change-history journeys | Open the relevant existing entry, follow its destination and return. Do not invent a new SANS notification requirement. |

Rows already present also need expansion: the preview needs **working/published and warm/fresh** states; the calendars need **ended SANS**, not just current SANS; the generic puck row needs flying seats, standby, duties, OFT/AMT, extras, ground and unavailable entries.

Check the purple edge alongside the CAT chip, own-person colour, warning ring, OIL mark, selection and amendment mark. Inspect the rendered edge, not merely whether a style marker exists. A partial redraw, folded section or drag must not change the date being represented.

**Exact inputs and fixes for the code claims**

**A. Medical cards do not receive the selected date.**  
The exact reproduction is scenario 1: current SANS from 20 July, medical 16–24 July, Medical “as of” 18 July. The selected date drives the medical lists, but the card draws its badge without it. [Source evidence](C:/Users/User/rc140a/raptor-port/src/ui/MedicalView.tsx:97).

Fix in this order:

1. Write the failing card test for the 18th and 20th, then the ended-stretch case.
2. Pass the selected “as of” date to cards in all three sections.
3. Apply the dated drawing context while the badge’s HTML is actually generated—not merely while creating a React component.
4. Check date changes and document-return redraws, and that this context does not affect another screen’s badges.

**B. Published next-week badges read the live person.**  
Use scenario 2’s fresh published 27 July. The preview selects published programme content, but its separate badge drawing still reads today’s person and calculates SANS afresh. It does not apply the published person attributes. [Badge evidence](C:/Users/User/rc140a/raptor-port/src/ui/peek.ts:59), [published-content selection](C:/Users/User/rc140a/raptor-port/src/ui/peek.ts:317).

Fix:

1. Write a fresh-render test where the published snapshot says ordinary and the current dated person says SANS.
2. Resolve each preview day’s own issued snapshot in member mode.
3. Draw that day’s badges using the saved person attributes; use dated live attributes for the working preview.
4. Restore the drawing context after each day. Do not apply one day’s snapshot to the whole week.
5. Verify mixed published/unpublished days and the next amendment.

**C. Preview caching omits SANS changes.**  
Use scenario 3 without editing the previewed week. Its cache checks week content, requests, deletions and selected settings, but not a person’s SANS start or ended stretches. Both the HTML cache and the decision to leave existing preview elements untouched use that key. [Source evidence](C:/Users/User/rc140a/raptor-port/src/ui/peek.ts:286).

Fix:

1. Write a test that draws the preview, changes SANS through the Quals operation, then draws it again without changing weeks.
2. Include a reliable person-presentation revision or signature covering the current SANS flag, start date and ended stretches.
3. Use it for both cached HTML and the mounted preview’s refresh decision.
4. Test tick, untick, Undo and Redo, with working and member previews already mounted.
5. Keep candidate B’s frozen-publication assertion: refreshing must not expose unpublished attributes.

**D. The filed Leave War count gap needs more than a changed filter.**  
Scenario 4 is the exact double-count input. The regular count removes people using today’s flag, while the SANS commitment count now uses the date. In addition, the roster supplied to the war can already have omitted a current SANS man and does not carry his SANS dates. [Count evidence](C:/Users/User/rc140a/raptor-port/src/leavewar/engine/availrows.ts:139), [roster evidence](C:/Users/User/rc140a/raptor-port/src/leavewar/state/raptorRoster.ts:55), [dated commitment evidence](C:/Users/User/rc140a/raptor-port/src/state/flyplan.ts:220).

Fix:

1. Write failing before-start and after-untick tests, including the **0 regular + 1 committed = 1 still needed** case.
2. Supply counting with the complete, stint-aware roster before display-only SANS hiding; preserve the grid’s whole-row rule.
3. Carry the SANS start and ended stretches into that counting view.
4. Exclude SANS from regular availability by the date being counted.
5. Make count caching and roster refresh sensitive to those dates.
6. Check the downstream consumers in scenarios 4–5, with Show SANS both ways.

**Explicit negatives and limits**

- I checked the named published-person comparison callers and found the date passed through them. I found no additional missing date argument there.
- I checked the shared badge resolver: a published snapshot’s saved SANS value takes precedence over the live dated value. The preview bypass is a separate path.
- I checked the main week, board, crew-list and ALL AVAIL drawing wrappers and found dated contexts. That does not establish that every rendered state works.
- I checked the flying/OFT/AMT availability calls and found the day supplied to the shared SANS check.
- I checked the people-save and Undo machinery and found whole person records carried through it; I found no obvious allow-list dropping the new dates.
- The Inputs, SANS-calendar and Leave War-count gaps are already filed. I have not relabelled them as new discoveries.
- I did not treat the Leave War’s whole-row behaviour as a fault.
- I did not treat current filing eligibility, the schedule’s SANS highlight, mixed ALL AVAIL wording or posting-history erasure as settled owner requirements.
- I excluded migration-only and stale-demo-data concerns. All proposed failures can be tested with new actions and records.
- No runtime behaviour, screenshots, export output or test pass was verified in this read-only review.

Rulings: none made or recorded.