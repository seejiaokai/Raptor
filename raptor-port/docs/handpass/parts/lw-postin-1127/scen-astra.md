**Astra’s scenario report — [LW-POSTIN-BALANCE]**

I found two counting defects worth walking first:

- A hidden SANS person’s balance can be calculated without his saved post-in date.
- After a second return from overseas, leave in the first absence gap starts counting again.

I reproduced both arithmetic failures using the actual counting engine. These were isolated engine checks, not browser walks. Both affect newly entered data; neither is a migration finding.

The “Not typed” promise also remains incomplete across the screens. Some omissions are explicitly acknowledged in the brief, but that makes them known gaps rather than fulfilled requirements.

This was read-only. I changed no file, made no commit and pushed nothing. The full report is below; I did not write a separate report file. I read no other scenario designer’s report and no new walk evidence sheet. No post-compaction handoff was supplied.

**Scope and evidence**

The checkout was on `claude/lw-postin-build-5d49de`. The host was changing it during this read; I observed additional edits to the two balance screens and their tests. The counting paths behind the findings below were unchanged during my checks. The host should run the scenarios against the final production build.

This belongs to a **FULL** check: it changes a leave entitlement calculation, the interpretation of saved figures, shared displays and the below-zero question. This report supplies scenarios for that check; it does not claim the check is complete.

I inspected all five named approved pictures: the two question 11 pictures and the three final question 16 pictures. They establish the LVE empty-box/“Not typed” treatment and the position of the instruction. They do not establish the complete never-typed appearance for the other leave kinds or every read-only state.

**Requirements and unresolved readings**

The expected results below distinguish these:

- **D2747:** pre-post-in leave remains visible but does not reduce the balance; days away before a return are excluded too.
- **D2746:** an untyped balance is not shown as zero or negative; “Not typed” applies to every leave kind named by this work, and the below-zero question waits.
- **D2745 / D1479 / D1492:** approved leave first, then the official figure; later approvals reduce it; typing again corrects it and captures a fresh starting point.
- **D2749 / D2812 / D2810:** the one exact instruction, in the ruled places; no typed-on line; “Official bal”.
- **D1541:** leave after posting out remains countable and approvable, subject to the established Delete exception.

Do not turn these builder interpretations into pass criteria:

1. The full D2747 row’s reading says “latest post-in”; the plan retains leave during earlier actual stints. Test and record the earlier-stint case separately. The multiple-gap defect below does **not** depend on resolving that disagreement.
2. Whether pre-post-in leave contributes to “Days taken”, the grid’s second line and the person window’s “taken” figure is not settled consistently.
3. A read-only amber dash, the other kinds’ dash, and the new carried-forward refusal are builder choices. Hover text does not settle their phone appearance.
4. My leave, Approvals and the leave buttons’ untyped treatment is an extension recorded as a reading. The grid, however, is expressly named in D2746.
5. Old opening figures counting as typed is a reading. Do not spend this walk on old-data compatibility.

**Coverage inventory**

“Gesture” below means the control a person must actually press in the production app. These are required walk destinations, not claims that I exercised them.

| Object or surface | Visible sign to inspect | Working gesture and coverage |
|---|---|---|
| New person through Admin → Users | Correct post-in date; empty balances | Add person, choose date, open Leave War |
| Request access approved as a new person | Same post-in result as Admin’s direct creation | Approve request, create/link the person, choose date |
| Current Post in sheet | Saved date and the correct leave before it | Open from a pre-arrival cell; change date; use its leave-placement door |
| Post out and return | Correct posting dates, gaps and retained leave | Overseas posting, Admin → Users Restore, Restore as, repeated returns |
| SANS person hidden from the grid | Correct figure despite no grid row | My leave; Approvals’ route to his person window; toggle “+ SANS” |
| Approved leave | Grid entry stays; only qualifying days change balances | Auto-approve, ordinary approval, Approve all, Inputs filing/edit/delete |
| Pending/refused leave | Correct Pending and War bal; refused leave spends nothing | One-day bid, picked range, drag selection, approve/refuse/delete |
| Six typed kinds | Independent typed/untyped state | LVE, CCL, FCL, PL, EL and CL boxes on both editing surfaces |
| LVE carried forward | Correct part of Official bal; understandable first-entry refusal | Type before/after Official bal; Enter, blur, Escape |
| Balances, desktop | Headings over figures, one instruction, correct row | Edit, search, switch views, lock, open a person |
| Balances, phone | Same values, pinned names/headings, readable untyped state | Sideways scroll, pinch, type, dismiss keyboard |
| Days taken | Period heading and actual charged/calendar-day totals | Switch from Balances, change View period, return |
| Person window, desktop and phone | Official/Pending/War figures; all small tiles; instruction | Open from every door; edit; change person; close |
| Grid balance, ordinary row | Correct figure or untyped sign | Tap the figure to open the person window |
| Grid balance, phone frozen names | Same sign and value as the ordinary row | Scroll/pinch until the frozen copy is used; tap it |
| My leave | Signed-in person’s LVE, OIL and pending count | Open own window from Grid, Balances and Approvals where available |
| Approvals | Correct balance for the kind, separately from request DAYS | Open line/person; approve, refuse, Approve all |
| One-day and range bid windows | Each leave button’s “left”; below-zero question | Whole day, AM, PM, picked range, replacement of a bid |
| Drag window | Same forecast and warning rules | One person, several people, mixed typed/untyped kinds |
| History | Correct first-entry and correction wording | Type figure, open history, Undo, Redo |
| OIL and non-leave entries | Their established figures remain meaningful | OIL tracker; medical/course/overseas-duty records |
| Retained or hidden pages | Fresh values on return | Leave War → Inputs/Quals/Admin → Leave War; reopen without reload |
| Saved records | Same dates, figures and untyped states after reload | Reload a normal persistent production session |
| Overlays | Nothing covers the relevant figure or traps the gesture | Person window, OIL tracker, date picker, below-zero question, refusal tag, save band |
| Roles | Correct editable/read-only appearance | Admin; member own unlocked; member own locked; member other; master/Plan admin where applicable; no-access user denied entry |

Do not create a scheduler-without-admin test role: the project expressly excludes it.

**Ranked scenarios**

Use separate fresh browser worlds for independent scenarios. Unless stated otherwise:

- Today is **27 Nov 2026**.
- Sign in as seeded admin **Saber**.
- Create **Lynx** and **Pelican** through Admin → Users, with separate local test accounts, WSO seat and no grade. These fresh people avoid old opening figures.
- Use a View period covering January–December 2026.
- Create records through the app’s controls. The clock may be controlled by the existing walk harness; record that intervention.
- **Both** means phone width **402** and desktop width **1536**. Desktop layout checks must include real browser zoom at **125%**, rather than treating device scale alone as equivalent.

1. **Hidden SANS person loses his post-in protection — both.**

   **SETUP:** Create Pelican with post-in **7 Dec**. Type LVE **24**, then add approved LL on **2 Dec** using the pre-post-in sheet’s leave door. Confirm 24 while he is visible.

   **ACTION:** On Quals, tick SANS; leave “+ SANS” off on Leave War. Sign in as Pelican and open My leave → person window. Then, as admin, enable “+ SANS” and read him again.

   **EXPECTED:** **D2747; two surfaces that must agree:** Official bal and War bal stay **24** throughout. Hiding his grid row cannot make the 2 Dec leave chargeable.

   **DISPROOF:** Hidden reads **23**, shown reads **24**, or opening his hidden person window changes the apparent balance. Repeat with a pending 2 Dec bid and through Approvals’ hidden-person door.

2. **A second return revives charges from the first overseas gap — both.**

   **SETUP:** Create Lynx with post-in **5 Jan**. Type LVE **24**, then add approved LL on **13 Apr**. Post him overseas from **1 Apr**. Restore through Admin → Users with post-in **1 Jun**. Confirm the gap leave no longer reduces 24.

   **ACTION:** Post him overseas again from **1 Sep**, then Restore with post-in **2 Nov**. Read every LVE balance surface; reload.

   **EXPECTED:** **D2747:** the 13 Apr day remains a day away. Official bal and War bal remain **24** after the second return.

   **DISPROOF:** The second Restore changes 24 to **23** without another leave or balance edit. The engine reproduced this.

3. **Deleting an old-gap leave gives back a day never deducted — both.**

   **SETUP:** Repeat scenario 2, but enter the 13 Apr approved leave **before** typing 24, so it is captured when the figure is typed.

   **ACTION:** After the second return, delete that leave through Inputs. Undo and Redo its deletion.

   **EXPECTED:** **D2747 / D1492:** deleting excluded leave must not refund it. The figure remains **24** in every state.

   **DISPROOF:** Deletion produces **25**, Undo 24, Redo 25. The engine reproduced the erroneous 25.

4. **Only one kind has been typed — do the other five still say what is missing? — both.**

   **SETUP:** Create Lynx, post-in **27 Nov**. Type only LVE **24**. Leave CCL, FCL, PL, EL and CL untyped.

   **ACTION:** Inspect all five on Balances and in his person window, as admin and as another member. Add a pending half-day of each kind on separate December weekdays, inspecting after each.

   **EXPECTED:** **D2746:** each untyped kind has its own clear untyped state. LVE being typed must not make another kind appear known. No untyped balance becomes zero or negative.

   **DISPROOF:** An empty box or unexplained dash is the only visible indication, or the only “Not typed” text belongs to LVE. Record the read-only phone appearance without relying on hover.

5. **Grid and frozen-name copy still invent an untyped balance — both.**

   **SETUP:** Fresh Lynx, no figures typed, post-in **27 Nov**.

   **ACTION:** Read the number beside his name. Add an approved chargeable LL on **2 Dec** and read it again. On phone, scroll and pinch to inspect the frozen copy; tap the figure.

   **EXPECTED:** **D2746:** the grid explicitly shows that the balance is untyped; it does not display 0 or −1. **Two surfaces that must agree:** both grid copies and the person window describe the same state.

   **DISPROOF:** Grid shows **0**, then **−1**, while the opened window says “Not typed”. This is a known omission in the brief, but still a promise gap.

6. **Untyped versus explicitly typed zero in both warning doors — both.**

   **SETUP:** Lynx has no LVE or FCL figure. Pelican has LVE explicitly typed as **0**, with FCL untyped. Post-in for both is **27 Nov**; open December bidding for the member run.

   **ACTION:** Place LL on **2 Dec** using the one-day window, then a picked range, then drag selection. Repeat for FCL. Finally drag across both people.

   **EXPECTED:** **D2746:** no below-zero question for an untyped kind. **Below-zero contract:** Pelican’s typed-zero LL does ask when the proposed fill reduces it below zero. A mixed selection names only people whose known balance is reduced below zero.

   **DISPROOF:** Untyped people appear in the question; typed zero suppresses it; or one untyped person suppresses the warning for everyone. Record the buttons’ “left” wording separately.

7. **The owner’s exact pre-post-in example, in both orders — both.**

   **SETUP:** Lynx and Pelican post in **7 Dec**.

   **ACTION:** Lynx: approved LL **2 Dec**, then type **24**. Pelican: type **24**, then approved LL **2 Dec**. Add an approved LL on **7 Dec** to each.

   **EXPECTED:** **D2747:** both read **24** after the 2 Dec leave and **23** after the 7 Dec leave. Both entries remain visible. The post-in date itself is included.

   **DISPROOF:** Either order gives 23 before the 7 Dec leave, or the boundary day is excluded.

8. **Move the post-in date after typing — both.**

   **SETUP:** Two fresh people initially post in **7 Dec**, each with approved LL **2 Dec**. For Lynx, type 24 before adding the leave; for Pelican, type 24 after adding it.

   **ACTION:** Move the current post-in to **30 Nov**, then back to **7 Dec**, using the Post in calendar.

   **EXPECTED:** **D2747 / D1492:** Lynx reads **24 → 23 → 24**. Pelican remains **24**, because that approved leave was already included when his figure was typed. **Two surfaces that must agree:** open window, Balances and grid update without reload.

   **DISPROOF:** Both people follow the same sequence; one screen stays stale; or moving the boundary refunds a snapshotted day.

9. **One approved leave crosses the boundary, with halves — both.**

   **SETUP:** Lynx posts in **7 Dec**, LVE 24 typed first.

   **ACTION:** Add one approved LL covering **3–9 Dec**. In fresh variants use AM on **4 Dec**, PM on **7 Dec**, and separate AM/PM entries on **7 Dec**.

   **EXPECTED:** **D2747; charging contract:** 3–9 Dec costs **3**, producing **21**. The 4 Dec half costs nothing; the 7 Dec half costs **0.5**. Two qualifying halves total **1**.

   **DISPROOF:** The whole range is excluded or deducted; a pre-arrival half costs 0.5; the boundary day is treated differently between range and single-day entry.

10. **Ordinary post-in workflow and correcting the wrong order — both.**

    **SETUP:** Post-in **27 Nov**, leave **2 Dec**.

    **ACTION:** Lynx: type 25, bid one LL, approve it, then type 24. Pelican: add approved LL first, then type 24. A third fresh person, Kittyhawk: type 24 first, then add the approved LL, then correct by typing 24 again.

    **EXPECTED:** **D2745 / D1479:** Lynx shows Official/Pending/War **25/1/24**, then **24/0/24**, then stays 24. Pelican reads 24. Kittyhawk reads 23 until corrected to 24.

    **DISPROOF:** Approval deducts a second time from War bal, the correct-order example reads 23, or correction fails to establish the new starting figure.

11. **Pending pre-arrival leave through every decision route — both.**

    **SETUP:** Post-in **7 Dec**, typed LVE 24; pending LL **2 Dec** and **8 Dec**.

    **ACTION:** Read Approvals, My leave and the person window. Approve separately, then repeat through Approve all, refusal, deletion and the drag window’s decision controls.

    **EXPECTED:** **D2747 / D1479:** before decision, Official/Pending/War is **24/1/23**. Approving the qualifying day gives **23/0/23**. Approving or refusing the pre-arrival day does not move those balance figures.

    **DISPROOF:** The pre-arrival bid reduces War bal or its approval reduces Official bal. For My leave’s overall pending-day count and Approvals’ DAYS, **RECORD exactly what it says**; those are not automatically the balance’s Pending figure.

12. **Pilot’s 15-day run across post-in — both.**

    **SETUP:** Fresh pilot Kittyhawk and WSO Lynx, post-in **1 Dec**, LVE 24 typed first. No additional holidays in the selected stretch.

    **ACTION:** Enter LL **23 Nov–7 Dec**, then shorten it to **24 Nov–7 Dec**. Repeat with the last day pending, then approve it.

    **EXPECTED:** **D2747:** no date before 1 Dec is directly deducted. **Charging contract:** pilots and WSOs retain their established different treatment of long runs. **RECORD exactly what it says** for whether the excluded pre-arrival portion still establishes the pilot’s 15-day threshold; that is the plan’s interpretation, not a separately confirmed owner answer.

    **DISPROOF:** An excluded date itself is charged; approval unexpectedly changes War bal; or the bid forecast differs from the resulting figure. Preserve the 14-day and 15-day calculations for the owner’s interpretation check.

13. **Post out is not the same boundary as post in — both.**

    **SETUP:** Lynx posts in **27 Nov**, LVE 24; set Overseas post-out **7 Dec**.

    **ACTION:** Add and approve LL **8 Dec** before the posting runs, and again in a separate world after it runs. Exercise ordinary approval and Approve all.

    **EXPECTED:** **D1541:** the day still costs one, giving **23**. **D2747:** this fix must not turn every day outside a stint into free leave. Repeat with no outcome chosen and with SANS; test Delete against its established refusal.

    **DISPROOF:** The post-out date alone makes the leave free or blocks a permitted approval.

14. **SANS posting, hand-ticked SANS and visibility are different paths — both.**

    **SETUP:** Post-in **30 Nov**, type 24, add approved LL **27 Nov** and **8 Dec**. In separate worlds use a SANS posting from **7 Dec** and a Quals SANS tick.

    **ACTION:** Toggle “+ SANS” both ways, inspect My leave/person window, and take back the SANS posting through its own control.

    **EXPECTED:** **D2747 / D1541; two surfaces that must agree:** the pre-arrival day remains free and 8 Dec remains chargeable; the balance is **23**. Changing the group’s visibility cannot alter arithmetic.

    **DISPROOF:** A visibility toggle changes the number, loses the post-in boundary or changes which earlier gap is excluded.

15. **Restore, Restore as and Undo post out — both.**

    **SETUP:** Lynx has a post-in date, a typed figure, leave during his stint and leave during a later overseas gap. Archive through the posting route.

    **ACTION:** In separate worlds: Restore with a new date; Restore as after creating a callsign collision; use the posting sheet’s Undo post out instead of Restore.

    **EXPECTED:** **D308 / D320 / D328:** Restore opens the new stint and retains earlier history; Restore as changes the name without changing the person’s balances. Undo post out removes that posting rather than inventing a new return. **D2747:** the genuinely away dates are excluded after Restore. For earlier actual-stint deductions, **RECORD exactly what it says**, given the plan/full-row conflict.

    **DISPROOF:** Renaming resets the figures, old leave disappears, Restore overwrites the earlier stint, or the two different return actions are treated as identical.

16. **Edit and delete approved leave from Inputs — both.**

    **SETUP:** Post-in **7 Dec**. Add approved LL **2 Dec**, type 24, then add LL **8 Dec**. Initial balance is **23**.

    **ACTION:** Through Inputs, delete 2 Dec; extend 8 Dec through 9 Dec; shorten it; move it to 4 Dec; change a qualifying half-day’s kind. Return to Leave War after each.

    **EXPECTED:** **D2747 / D1492; two surfaces that must agree:** deleting 2 Dec gives nothing back; extending the qualifying leave costs one extra day; moving it wholly before arrival refunds its qualifying charge. Only the relevant kind changes.

    **DISPROOF:** A deleted excluded leave refunds a day, a move charges both old and new dates, or Inputs and Leave War disagree until reload.

17. **A range crosses periods or falls outside every period — desktop, then phone confirmation.**

    **SETUP:** Post-in **7 Dec**, typed 24. Configure adjacent periods so **3–9 Dec** crosses their boundary. In another fresh world, file part of the range through Inputs on dates no period covers.

    **ACTION:** Enter the same approved leave through a picked range and through Inputs. Change the View period.

    **EXPECTED:** **Leave-year contract; D2747:** balance calculation considers the complete leave and excludes dates before post-in regardless of the selected period. Uncovered dates use the documented plain weekday rule.

    **DISPROOF:** Changing View changes the balance, a period boundary restarts a run incorrectly, or uncovered dates evade the post-in filter.

18. **1 January while the page remains open — both.**

    **SETUP:** On **31 Dec 2026**, Lynx is Junior pilot, with LVE **37**, carried forward **4**, and no later charge. Set the grade before 1 January. Add a separate fresh untyped person.

    **ACTION:** Leave Balances/person window open across midnight, then switch away and return. Repeat after reopening the app.

    **EXPECTED:** **D1235 / D1474:** Lynx becomes **66**, including **33** carried forward. **D1489:** typed CCL/FCL/PL/EL/CL remain unchanged. **D2746:** the fresh person remains visibly untyped even if an internal grade calculation exists.

    **DISPROOF:** Roll-over needs a reload, occurs twice, grants a known visible balance to an untyped kind, or resets the other five kinds.

19. **Next-year leave and a post-in in the next year — both.**

    **SETUP:** On 27 Nov, set post-in **7 Jan 2027**, type LVE 24.

    **ACTION:** Add approved leave **4 Jan** and **7 Jan**. Inspect before and after 1 January. Repeat with those days pending and with the approved leave present before typing.

    **EXPECTED:** **D2747:** 4 Jan contributes nothing; 7 Jan is eligible. **Leave-year contract / D1479:** next-year eligible days affect the current total according to the documented future-year treatment; a captured approved day is not deducted again.

    **DISPROOF:** The year boundary bypasses post-in, or a pending approval changes War bal twice.

20. **Explicit zero, halves, negatives and all save exits — both.**

    **SETUP:** Fresh Lynx, no balances typed.

    **ACTION:** Type **0** into each kind, separately, using Enter and blur on both Balances and the person window. Also test 0.5 and −2. Escape a partly typed value. Type into Lynx’s box, then press Pelican’s name or switch to Days taken.

    **EXPECTED:** **D2746; box contract at `ui-contracts.md:12442`:** zero becomes a real typed figure; Escape preserves the previous state; a committed value belongs to the person whose box was opened. Typing one kind leaves the others untyped.

    **DISPROOF:** Zero is dismissed as unchanged; blank becomes zero on focus/blur; the value lands on Pelican; a page switch silently drops or misdirects the edit.

21. **Carried forward first, then recover from the refusal — both.**

    **SETUP:** Fresh Lynx with both LVE boxes empty.

    **ACTION:** Type carried forward **5** first. Press Enter, tap away, reopen the box, then type Official bal **24** and carried forward **5**. Repeat from the person window and with an invalid non-half value.

    **EXPECTED:** **Current box contract:** no Official bal is silently created by the first attempt; the refusal remains readable and recovery works. **D2749 / D2812:** the standing instruction remains the one ruled line. **RECORD exactly what it says** for the refusal wording and appearance; it is a builder interpretation requiring its own disposition.

    **DISPROOF:** The refusal saves zero, vanishes without explanation, cannot be recovered from, or is clipped beneath an overlay.

22. **Lock and role changes while a box is being edited — both.**

    **SETUP:** Member Lynx’s balances unlocked; his own untyped box open. Have the harness introduce the lock through the normal lock command while he is typing—do not assume separate browser stores synchronise.

    **ACTION:** Attempt Enter, blur, window close, Undo and Redo. Repeat unlocked on his own row, locked on his own row, and on Pelican’s row. Check an admin under the same lock.

    **EXPECTED:** **Lock contract at `ui-contracts.md:12502`:** members edit only their own unlocked balances, with permission checked at save; admins retain their boxes. Refused input does not become a saved figure.

    **DISPROOF:** A stale member box saves after locking, another person’s balance changes, or an admin loses authorised editing.

23. **History, Undo and Redo preserve “never typed” — both.**

    **SETUP:** Fresh Lynx, no typed LVE.

    **ACTION:** Type 24; open history; Undo; Redo. Add chargeable leave, correct the figure, and repeat. Save a first value as zero in a fresh variant.

    **EXPECTED:** **D1492 and changed history contract:** the first entry has no invented previous zero; Undo restores the untyped state, Redo the exact typed figure and captured leave. A correction names the actual preceding Official bal. Reload preserves the latest saved state; session Undo availability follows the established contract.

    **DISPROOF:** Undo leaves a typed zero, Redo loses the captured leave, the history names a false starting value, or another person’s edit is undone.

24. **Every person-window opener and nested overlay — both.**

    **SETUP:** One typed person, one untyped person, and the hidden SANS person from scenario 1.

    **ACTION:** Open through grid name, grid figure, phone frozen figure, Balances name, My leave, and Approvals/bell routes for a person without a grid row. Open OIL over the window, close it, then close the person window by its button and Escape.

    **EXPECTED:** **Person-window contract at `ui-contracts.md:12562`; two surfaces that must agree:** all doors reach the same person and figures. OIL returns to the page and position underneath. The added instruction does not hide the close button or a lower tile.

    **DISPROOF:** One opener shows stale/different figures, the wrong person, an empty overlay, or loses the page beneath.

25. **Drawing comparison and crowded phone states — both.**

    **SETUP:** Recreate the approved Pelican **24 / 0 carried forward / no pending** picture, then the fresh untyped Lynx picture. Also use −12.5, 999, a long callsign, nonzero pending and the locked/member states.

    **ACTION:** Compare actual build pictures beside all five approved pictures. On phone, inspect sideways scroll, pinch, the keyboard open, and the first frame after a tap. On desktop use actual 125% zoom.

    **EXPECTED:** **D2749 / D2812 / D2810; approved pictures:** the exact instruction under LVE and once above Balances rows where typing is available; no fold or typed-on line; “Official bal”; aligned headings and readable values. **D2746:** amber untyped treatment is visibly distinct.

    **DISPROOF:** Text spills into OIL, “Not typed” clips, headings no longer align, the instruction duplicates, the keyboard hides recovery, or frozen content leaks through the bar. Native iPhone keyboard/bounce behaviour remains for the real-device look.

26. **Days taken, grid usage and person “taken” — both.**

    **SETUP:** On **10 Dec**, post-in 7 Dec, approved LL on **2 Dec** and **8 Dec**, no other leave. View the whole year.

    **ACTION:** Read person-window “taken”, Balances → Days taken and the grid’s second line. Add a pending 9 Dec day and read again.

    **EXPECTED:** **D2747:** the balance charges only 8 Dec. **Days-taken contract:** approved versus pending and selected period must remain correctly distinguished. For inclusion of 2 Dec in the three usage displays, **RECORD exactly what it says**.

    **DISPROOF:** A count claims to be the same quantity and period as another but differs without a documented distinction. Do not silently choose either “all usage” or “balance deductions” as the owner’s answer.

27. **Non-leave and OIL controls remain independent — both.**

    **SETUP:** Lynx has no typed leave figure, one medical day, one course day, one overseas-duty day and an OIL award entered through its proper controls.

    **ACTION:** Open the person window, Days taken and OIL tracker; place OIL taken and an ordinary LL separately.

    **EXPECTED:** **D1209; leave-year contract:** OIL remains its earned/awarded ledger, not a typed balance. Medical/course/overseas-duty totals do not become “Not typed”. The new suppression of an untyped leave warning must not suppress a valid OIL below-zero warning.

    **DISPROOF:** OIL gains a typed box, medical totals become unknown, or the shared warning change disables OIL’s existing protection. Record pre-post-in OIL handling separately; do not extend the six-kind rule by assumption.

28. **Persistent reload and hidden-page refresh — both.**

    **SETUP:** Use a normal persistent production session, not `?fresh=1`. Create a new person, posting dates, first typed figure and pre/post-boundary leave entirely through controls.

    **ACTION:** Leave War for Inputs, edit leave, return; leave for Admin, change the current post-in date, return; reload; sign out and sign back in.

    **EXPECTED:** **Persistence contract; two surfaces that must agree:** the saved posting, typed/untyped state and resulting figures survive. Returning to a retained page shows current values without an extra edit.

    **DISPROOF:** A first figure vanishes, posting dates revert, hidden pages show stale values, or reloading changes the arithmetic.

**Places already wrong, with fixes**

1. **Hidden SANS identities reach the balance engine without their posting dates.**

   **Where:** [store.ts:5532](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/state/store.ts:5532), supported by [sync.ts:3459](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/sync.ts:3459) and [raptorRoster.ts:83](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/state/raptorRoster.ts:83).

   `peopleCountedFor` appends the hidden identity directly. That identity comes from the roster projection, whose posting dates are null. The new filter therefore treats him as having no post-in boundary. The existing `withStored` helper explicitly solves this problem for other hidden-person operations, but this reader does not call it.

   **Concrete failure:** Scenario 1. With the saved 7 Dec post-in, the engine returns **24**; with the hidden projection supplied by this path, it returns **23** for the same 2 Dec leave. The engine difference was executed; the complete screen route remains to be walked.

   **Fix steps:**
   1. Add a failing integration regression creating the person, saved post-in, typed figure and pre-arrival leave through the normal writers.
   2. Hide him through the SANS route and assert unchanged figures through the hidden-person reader.
   3. Apply the existing saved-posting overlay to the hidden identity before adding it to the counting roster.
   4. Ensure the figure cache is invalidated when that saved posting changes; if the reader now directly depends on `postOuts`, include that dependency explicitly.
   5. Re-test shown/hidden transitions, pending forecasts, a return with earlier stints and reload.
   6. Walk My leave and Approvals’ hidden-person opener on both sizes.

2. **Only the most recent absence gap is excluded.**

   **Where:** [leaveyear.ts:316](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/engine/leaveyear.ts:316), calling [people.ts:363](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/engine/people.ts:363).

   `gapBeforeCurrent` is deliberately a helper for the current posting sheet’s door. It recognises only the gap after the last closed stint. It is not a complete description of every date away.

   **Concrete failure:** Current stint starts 2 Nov; earlier stints are 5 Jan–31 Mar and 1 Jun–31 Aug. An approved LL on 13 Apr is in neither stint, yet now gets charged. The actual engine returned **24 after the first return, 23 after the second**. With the leave captured when typing, deleting it instead returned **25**.

   **Fix steps:**
   1. Add failing tests for at least three stints, with approved and pending leave in each gap.
   2. Add the captured-leave deletion case, which must not create a refund.
   3. Replace the charging filter’s use of the current-sheet gap helper with a complete date test: before the current start, exclude dates outside **all** earlier actual stints.
   4. Preserve D1541: dates after the current posting-out boundary must not be excluded merely for being outside a stint.
   5. Apply the same exclusion to current approved charges, approved-plus-pending charges and snapshot charges.
   6. Keep the “earlier actual stint still counts” interpretation explicit until resolved; do not change it incidentally while fixing gaps.
   7. Re-run scenarios 2, 3, 8, 13 and 15, then reload.

3. **The untyped state is lost at several display boundaries.**

   **Where:** [matrixrowparts.ts:163](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/ui/matrixrowparts.ts:163), [PersonWindow.tsx:293](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/ui/PersonWindow.tsx:293), [BalancesPage.tsx:380](C:/Users/User/projects/Raptor/.claude/worktrees/elastic-dijkstra-948566/raptor-port/src/leavewar/ui/BalancesPage.tsx:380).

   The grid’s reader returns only the numeric War bal, discarding `notTyped`. Both grid copies consequently retain the invented zero/negative figure. For the other five kinds, the person window renders an empty box or dash; its War bal line exists only when pending is nonzero and then also uses a dash. A person with typed LVE and untyped CCL can therefore have no visible “Not typed” explanation for CCL.

   My leave, Approvals and leave-button forecasts similarly reduce the result to a number. Their intended untyped appearance is an unresolved extension; the grid is expressly required by D2746.

   **Concrete failure:** Scenarios 4 and 5: fresh data yields grid 0/−1 while the window says “Not typed”; typing LVE does not supply a visible explanation for the five other empty balances.

   **Fix steps:**
   1. Keep these as explicit promise gaps in the host’s report, including the already acknowledged grid omission.
   2. Draw the missing grid, other-kind and read-only states on phone and desktop; obtain the required look approval before changing their appearance.
   3. Carry typed/untyped state through each display’s data rather than formatting an unknown numeric value.
   4. Apply the approved grid treatment to both the ordinary row and phone frozen copy.
   5. Ensure each untyped kind explains itself even when its pending amount is zero and LVE is already typed.
   6. Preserve numeric zero as a distinct, explicitly typed state.
   7. Add rendering regressions and walk the resulting signs, taps and warning behaviour together.

**Explicit negatives and limits**

- **I checked the ordinary first-post-in calculation and found nothing** wrong in the shared filtering of approved, pending and captured leave. The gaps above concern which identity and dates reach that filter.
- **I checked explicit zero versus never typed and found nothing** in the engine’s distinction. The figure-box code also deliberately permits zero as a first entry; this still needs the real gesture check.
- **I checked both below-zero callers and found nothing** missing in their use of the shared `goesBelow` guard. Both one-day and drag windows receive the new untyped signal.
- **I checked the ordinary post-out case and found nothing** showing that this change directly excludes dates after the current posting-out date.
- **I checked the first typed figure’s history construction and found nothing** that invents a previous zero: the new code omits the “from” value when genuinely untyped.
- **I checked the visible “App bal” rename and found nothing** remaining as a rendered label in the source search. Remaining matches were comments or explanatory code text.
- **I checked the shared figure-box save handling and found nothing** showing that this patch removes Enter, blur, Escape or the captured-person protection.
- **I checked the unchanged rollover calculation and found nothing** newly wrong from this diff. I did not execute the midnight browser scenario.
- **I checked OIL’s separate calculation path and found nothing** making it a typed leave figure. Its shared warning behaviour still deserves the stated regression walk.
- **I checked the named drawings and found nothing** supporting a claim that the missing grid/read-only/other-kind states were already fully drawn.
- **I checked the backlog and found the posted-in balance job already recorded.** Its presence does not resolve the interpretation conflicts or complete the omitted displays.
- **I did not establish a defect in Days taken or My leave’s pending-day count.** Their relationship to the newly excluded balance charges needs recorded observations and an explicit interpretation.
- **I did not run a browser walk, full unit suite, build or persistence test.** No visual, gesture or reload PASS is claimed.
- **I excluded old-data-only findings.** Every counting failure above can be produced with new people, postings, leave and typed figures.

**Walk: NOT DONE — scenario-design assignment; two focused engine reproductions completed.**  
**Rulings: none this session.**