These are **28 proposed walk scenarios, not test results or a code verdict**. No files changed and no builds run.

Devices: **phone** 402 × 874; **desktop** 1536 × 864; **narrow desktop** 820 × 864. Use fresh demo data and make each setup through the app. Photograph each deciding step, including the immediate result of a phone tap.

For changes to someone’s access while they remain signed in, keep that person’s session open. If the current app cannot deliver another session’s change, mark that live case **not walked**; signing out and back in does not prove it.

1. **Member picks another squadron — Ranger, desktop; View of 149.**  
   Open View-only Sched on 142, then pick 149 from the top bar.  
   **EXPECTED:** 149’s schedule appears; the only page tabs are View-only Sched and Help. Inputs, Quals, Logic, Leave War and Tracker are absent. The bell, Insights and Logout remain available.

2. **An admin’s home role gives no extra pages — Hunter, desktop; View of 149.**  
   From View-only Sched, pick 149 and inspect the tabs. Pick 142 again.  
   **EXPECTED:** 149 offers only View-only Sched and Help, including no Admin tab or waiting badge. Returning to 142 restores Hunter’s ordinary admin pages.

3. **Pick inside the phone menu — Ranger, phone; View of 149.**  
   Open ☰, press the TALON mark, then choose 149.  
   **EXPECTED:** The list opens directly beneath the mark, inside the menu. After choosing 149, the list closes but ☰ stays open. The mark reads 149, the grey line reads “149 · View only”, and only two pages remain.

4. **Return home without reopening the menu — Ranger, phone.**  
   Continue from scenario 3: reopen the squadron list and choose 142.  
   **EXPECTED:** The menu stays open; the line becomes “142 · Your squadron”; Ranger’s normal pages return immediately. Press Inputs.  
   **EXPECTED:** The menu closes and 142’s Inputs opens.

5. **The two surviving pages work — Ranger, phone and desktop; 149 picked.**  
   Open Help, then View-only Sched, then Help again, using the available navigation.  
   **EXPECTED:** Each requested page opens; 149 remains picked; the page choices stay restricted. Merely opening Help does not bring back the other tabs.

6. **Home means this person’s home — Osprey, phone; View of 142.**  
   Start on 149’s View-only Sched, pick 142, then return to 149.  
   **EXPECTED:** 142 is “View only” with two pages. 149 is “Your squadron” with Osprey’s ordinary member pages. Nothing treats 142 as everyone’s home.

7. **Plan retains full access — Hunter, desktop; Plan of 149.**  
   Pick 149, then open Edit Schedule, Inputs, Logic and Admin in turn.  
   **EXPECTED:** 149 is “Full access”; those pages remain offered and show the appropriate 149 content. Return to 142.  
   **EXPECTED:** It reads “Your squadron”, with Hunter’s home pages available.

8. **Master admin retains full access — Saber, phone.**  
   Pick 149 inside ☰, then open Admin.  
   **EXPECTED:** The menu stays open after the pick, says “149 · Full access”, and retains all Saber’s pages. Pressing Admin closes the menu and opens 149’s Admin page.

9. **Plan holder enters member view — Hunter, desktop; Plan of 149.**  
   On 149’s View-only Sched, press the name badge. Open the squadron list; then switch back.  
   **EXPECTED:** In member view, 149 becomes “View only” and offers only View-only Sched and Help. Hunter remains Hunter. Switching back restores “Full access” and the admin pages without changing the picked squadron.

10. **Master admin enters member view — Saber, phone.**  
    On 149’s View-only Sched, use ☰ → Switch to the member view. Reopen ☰ and its squadron list. Then return to admin view.  
    **EXPECTED:** Other squadrons remain selectable but read “View only”; the page list has only two entries. Returning to admin view restores their “Full access” labels and pages.

11. **Member view at home is still useful — Hunter, phone.**  
    Enter member view while 149 is picked, then choose 142 inside ☰.  
    **EXPECTED:** “142 · Your squadron” appears and the normal member pages return. Edit Schedule and Admin remain absent until Hunter returns to admin view.

12. **A View holder cannot promote himself with the switch — Hunter, narrow desktop; View of 149.**  
    Pick 149. Switch to member view and back.  
    **EXPECTED:** Both modes offer only 149’s View-only Sched and Help. Returning to admin view does not turn View into Plan.

13. **One squadron still has the access line — Ranger, phone; no other access.**  
    Open ☰ and press the TALON mark. Close and reopen ☰.  
    **EXPECTED:** The mark reads 142 without a drop-down arrow; pressing it opens no list. “142 · Your squadron” remains visible on both visits.

14. **The two squadron lists agree — Hunter, phone; View of 149.**  
    Inspect the top-bar list, close it, then inspect the list inside ☰. Choose 149 there; reopen the top-bar list.  
    **EXPECTED:** Both lists show the same squadrons and access labels. Exactly one row is ticked, and the tick follows the successful pick.

15. **Keyboard opening and selection — Hunter, narrow desktop.**  
    Reach ☰ and the TALON button using Tab. Try Enter, Space and Down Arrow as separate openings. Move through rows with arrows; select with Enter.  
    **EXPECTED:** The list can be opened and used without a mouse; focus is visible. Moving focus alone does not switch squadron. Selection closes the list, keeps ☰ open and updates its number, access line and pages together.

16. **Escape closes one layer — Ranger, narrow desktop; 149 picked.**  
    Open ☰ and its squadron list by keyboard. Press Escape twice.  
    **EXPECTED:** First Escape closes only the squadron list and returns focus to its opener. Second Escape closes ☰ and returns focus to the ☰ button. Neither changes the squadron or page.

17. **Outside presses do the right amount — Ranger, phone.**  
    Open the squadron list inside ☰. Tap unused space elsewhere inside the menu. Reopen the list and tap outside the whole menu.  
    **EXPECTED:** The first tap dismisses the inner list while leaving ☰ open. The outside tap dismisses the whole menu. Neither selects a squadron or activates the page underneath.

18. **Close and reopen without stale state — Ranger, phone.**  
    Pick 149 inside ☰, close the menu, reopen it, open the squadron list, close the whole menu and reopen again.  
    **EXPECTED:** 149 and “View only” remain correct. The inner list starts closed each time; it does not reappear because it was open on the previous visit.

19. **Eight squadrons and the bottom of the menu — Saber, phone.**  
    With 142, 149 and 150–155 available, open the list, scroll to 155 and choose it. Reopen the list, return to 142, then scroll down to Account.  
    **EXPECTED:** Every row is reachable and readable, with the correct tick and label. Menu scrolling does not scroll the page behind it. Account and Logout remain reachable; rows do not overlap the page choices.

20. **A mixture of access levels — Hunter, phone; View of 149 and Plan of 150.**  
    Starting on View-only Sched, choose 149, then 150, then 142 without closing ☰ yourself.  
    **EXPECTED:** The grey line changes through “View only”, “Full access” and “Your squadron”. The page list changes at each pick, with no leftover Admin entry on 149 and no missing admin pages on 150.

21. **Desktop navigation folds and unfolds — Hunter, desktop and narrow desktop; View of 149.**  
    At 1536, pick 149. Narrow to 820, inspect ☰, return home, then widen again. Repeat after picking 149 at the narrow width.  
    **EXPECTED:** Both arrangements offer the same lawful pages. No hidden page reappears during resizing; no duplicate navigation covers the controls. The squadron and access labels remain consistent.

22. **Hidden pages are absent from the keyboard route — Ranger, desktop and narrow desktop; 149 picked.**  
    Tab through the top bar and, separately, the open ☰ menu. Activate the available page choices. Return home and repeat.  
    **EXPECTED:** None of the removed pages receives focus or opens while 149 is picked. Returning home restores keyboard access to Ranger’s normal pages.

23. **Sign-out clears the previous person’s menu — Hunter then Ranger, phone.**  
    As Hunter, pick 149, enter member view, open the squadron list, then use Logout. Sign in as Ranger, who has only 142. Later sign in as Hunter again.  
    **EXPECTED:** Ranger starts with his own squadron and a closed menu, without Hunter’s access or role switch. Hunter’s new sign-in starts in admin view, not his previous member view.

24. **The roles table matches the new offer — Saber, desktop and phone.**  
    Open Ranger’s row in Admin → Users and expand “What each role allows”. Close and reopen the fold.  
    **EXPECTED:** View’s Logic cell is “–”; View-only Sched remains “read”. The other View cells remain unavailable. The table is readable on the phone and retains those values after reopening.

25. **Access changes while the schedule is open — Hunter, desktop; 149 picked.**  
    In a separate authorised admin session, change Hunter’s 149 access from View to Plan, then back to View, keeping Hunter on View-only Sched.  
    **EXPECTED:** Once each change reaches Hunter, the access label and available pages change together. Plan restores the admin pages; View removes them. The schedule stays 149’s and remains read-only on View-only Sched.

26. **A second squadron appears and disappears — Ranger, phone; initially only 142.**  
    Keep ☰ open while an authorised admin gives Ranger View of 149. Open its new list. Remove that View while 142 remains picked; then give it again.  
    **EXPECTED:** The first grant adds the drop-down and 149 row. Removal leaves the plain 142 mark and its grey access line, with no stranded list. Regranting restores the button without opening the list by itself.

27. **Midnight changes whose squadron is home — Ranger, phone and desktop.**  
    Arrange an authorised dated move from 142 to 149, with View of another squadron beforehand. Leave View-only Sched open across midnight; repeat with the browser hidden and then brought forward.  
    **EXPECTED:** After the move is recognised, 149 reads “Your squadron” and offers Ranger’s home pages. His old View rights no longer appear. Both squadron menus agree; yesterday’s access does not survive merely because a menu was already open.

28. **Unsaved Tracker work through the new picker — Hunter, phone and desktop; Plan of 149.**  
    Open 142’s Tracker and edit a chart without saving. Pick 149 through ☰ on the phone and the top bar on desktop. Run three separate attempts: Stay, Discard them, Save them.  
    **EXPECTED:** Before answering, the question names 149 and the squadron has not switched. Stay preserves 142 and the unsaved edits. Discard switches without saving them. Save switches only after saving them to 142. The loaded Tracker remains 142’s, with its existing explanation; it never becomes an editable copy of 149’s Tracker. After a successful phone pick, ☰ remains open with 149’s updated access and pages.

The following cases need an answer before their final landing can be judged. The brief identifies the builder’s interpretation, but that is not an owner ruling.

- **Picking from a page that disappears:** Ranger on Inputs, Quals, Logic, Leave War or Tracker; Hunter also on Edit Schedule or Admin. On each device, should choosing view-only 149 always land on its View-only Sched? Should Help always remain Help? I recommend the builder’s interpretation, with unsaved-work questions handled first.

- **Own-page shortcuts while viewing 149:** On phone and desktop, should each of these bring 142 back into view and complete the original request: a bell line opening Ranger’s input; a leave notification opening his day; Hunter’s waiting-access bell opening 142’s Users; Ranger’s “Check my quals”; and a visible link into his own Leave War? I recommend yes, preserving the intended input, person or day. A bell line that only records an account change should still open nothing.

- **OIL and links naming the other squadron:** Hunter opens 142’s OIL list, picks view-only 149, then presses an input card in the still-open list. Should this return to 142 and open that exact input? Separately, what should a link from 149’s schedule to 149’s Leave War do when Hunter has only View? I recommend completing the first route at home and refusing the second route; it must never open 142’s unrelated day as a substitute.

- **A Leave War or Input window already open:** On desktop, and on phone wherever an ordinary control actually permits the pick, leave typed work in 142’s window and choose view-only 149. Does the existing “This is 142’s. You picked 149 — close this to go on.” window remain above 149’s schedule, with its controls greyed and Close available, or does the page change close it? I recommend retaining the existing protection and visible typing. A covered control must not be forced to manufacture this case.

- **Unsaved home Tracker edits when the destination is View only:** Hunter edits 142’s chart, then picks view-only 149. His own Tracker still belongs to 142, but its page disappears. Should the pick ask Save/Discard/Stay, or retain the edits silently until he picks home again? I recommend asking before hiding the editor. Repeat with the Tracker already left for another page, and with a bell shortcut making the switch.

- **Rights disappear under active work:** Hunter is editing 149’s Logic, Admin, Leave War or Tracker when Plan becomes View; repeat with access removed entirely and with ☰ open. Which page should appear, and what happens to unsaved typing or an open window? I recommend removing unavailable actions immediately while preserving unsaved work visibly, without saving it into either squadron automatically. Regranting access should not silently replay an earlier press.

- **Undo and Redo landings:** Hunter makes a change on 142, picks view-only 149, then attempts to revisit that change through Undo. Which ordinary control is intended to make this reachable while only View-only Sched and Help are offered? If an existing visible Undo route remains, should it restore 142 and reveal the affected page, as the builder proposes? I recommend that behaviour for an authorised Undo, without adding a new control or assuming an app-wide keyboard shortcut exists.

Rulings: none this session.

