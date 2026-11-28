Read an exported copy of 74f0d8138.

These are **40 ranked scenarios for the host to run**, not confirmed defects. I did not run the app or change files. I read only the first line of the handoff.

Run each applicable case at **1536 × 864** and **402 × 874 in WebKit**, using fresh data. Start with Saber, Hunter, Ranger, Kestrel and Osprey; add people or squadrons where specified. Never create a scheduler who is not an admin. For changes arriving while a window is open, use the host’s supported test setup and normal update path.

Sources below refer to the [second-half plan](/C:/ax149/raptor-port/docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md), with §16 overriding §15 and earlier sections, and the full ruling rows. The [approved drawing page](/C:/ax149/raptor-port/docs/mock/2026-11-22-msq-b1-screens/page.html) and accompanying descriptions are present; **the picture files are absent**, so I could not assess visual agreement.

1. **Unsaved Tracker work when another squadron is picked.**  
   **Source:** D2318: “With unsaved chart changes a pick asks ‘Save them before switching to 142?’”; plan §16 D2′.  
   **Setup/action:** Hunter has Plan of 149. Open its Tracker first, change a chart, then choose 142 through the Schedules menu. Repeat through a foreign request’s bell shortcut. Exercise Stay, Discard them and Save them separately.  
   **Expected:** Stay preserves the pick and draft; Discard proceeds; Save writes to the bound 149 Tracker before proceeding.  
   **Disproof:** Lost work, saving into 142, switching before answering, bypassing the question through the bell, or jumping to the Tracker page unnecessarily.

2. **Every Tracker cover disables the right things.**  
   **Source:** D2318: “The Tracker keeps the squadron it opened with until sign-out”; plan §16 D2′.  
   **Setup/action:** Bind to 149, then test: pick 142 while retaining Plan; lose Plan; enter member view; return to the permitted view. Try chart gestures, keyboard shortcuts, settings, imports and exports.  
   **Expected:** Retained authority gives the approved read-only cover; lost authority hides contents and the bar; member view uses its own explanation. Returning preserves the held draft.  
   **Disproof:** A covered control still works, hidden data remains visible/exportable, the explanation names the wrong squadron, or the Tracker silently rebinds.

3. **Input and Leave War windows held across a pick.**  
   **Source:** D2323: “its controls greyed, Close and ✕ still working.”  
   **Setup/action:** As Saber, open an Input window on 142, including its person/document subcontrols; pick 149. Repeat with a Leave War person/day window and a nested choice already open.  
   **Expected:** “This is 142’s. You picked 149 — close this to go on.” Editing is visibly disabled; Close and ✕ work. Closing reveals the correct new page.  
   **Disproof:** A live-looking Save that merely fails later, a nested control still writing, a write landing in either squadron, or an unrelated save-failure message.

4. **Settings windows retain the squadron they opened for.**  
   **Source:** Plan §2: a settings window is stamped when opened, “so a later pick never moves it.”  
   **Setup/action:** Open Inputs, SANS and Calendar settings separately from 142; pick 149 while each remains open. Repeat after losing authority over the original squadron.  
   **Expected:** The window remains tied to 142, follows its applicable hold behaviour, and cannot use authority over 149 to change 142. Closing and reopening uses the intended page’s squadron.  
   **Disproof:** Values or labels silently change underneath the window, Save changes the new squadron, or retained controls disagree with current authority.

5. **Foreign Logic must not change an own input’s OIL or late status.**  
   **Source:** Plan §15 D4 and §16 D4′ require the input’s own threshold and cut-off, including repricing and voiding.  
   **Setup/action:** Give 142 and 149 different OIL thresholds and cut-offs. Hunter holds View of 149. File a qualifying 142 Saturday input, answer its OIL question, pick 149 and change only its remark. Repeat around the late cut-off; switch ten times.  
   **Expected:** The question, answer, amount, late mark, pending-OIL count and credits remain based on 142.  
   **Disproof:** A changed answer, credit, warning or count caused solely by the picked squadron.

6. **Squadron config and all three template doors.**  
   **Source:** D2317: “only an admin of that squadron changes it.”  
   **Setup/action:** Hunter with View of 149 picks 149. Open Squadron config, then try every reachable day, wave and duty-template entrance, defaults, ordering controls and resets. Repeat with Plan.  
   **Expected:** The heading names 149; View shows the approved greyed explanation. Plan enables the same operations and changes 149 only.  
   **Disproof:** An alternative template entrance remains editable, a reset works through the cover, or a successful edit changes 142.

7. **Less-used schedule editing doors.**  
   **Source:** D2252: foreign View gives “only its View-only Sched and Logic, read only”; plan §2’s edit-rights inventory.  
   **Setup/action:** With View of 149 and 149 picked, inspect saved plans, the changes window, planning-calendar actions, ALL AVAIL’s earning switch, and Admin → Data’s two clears. Also open each confirmation under Plan, then lose Plan before confirming.  
   **Expected:** No foreign editing is offered under View; stale actions cannot commit. Own-page calendars retain their proper, separately named squadron.  
   **Disproof:** Any forgotten button, keyboard action or confirmation writes, or offers an edit that is predictably refused only after completion.

8. **Rights disappear during active schedule work.**  
   **Source:** D2252; plan §15 D8 requires the landing check after every relevant update.  
   **Setup/action:** Hunter has Plan of 149 and is on Edit Schedule. Separately begin a drag, cell edit, paste, deletion, sort, publishing action and OIL earning action. Lower Plan to View before completion.  
   **Expected:** He lands on View-only Sched; Edit Schedule and editing gestures cease to be available.  
   **Disproof:** A stale editor commits, a drag completes into 149, a shortcut still changes it, or the edit tab remains usable until navigation/reload.

9. **Every page reads the right squadron after repeated picks.**  
   **Source:** D2197 says a master’s pick “moves every page to it”; D2201 extends full access to Plan, with D2318’s Tracker exception.  
   **Setup/action:** Give the two squadrons visibly different people, inputs, Quals columns, medical/SANS records, wars, settings and schedules. Alternate picks as View holder, Plan holder and master.  
   **Expected:** Schedule and Logic follow every permitted pick. View holders’ own pages remain home; Plan/master pages follow the pick, except the bound Tracker.  
   **Disproof:** A new title over old data, stale people/filter choices, mixed settings, or a write going somewhere different from the displayed page.

10. **Picking does not consume, clear or redirect Undo.**  
    **Source:** D148: “Undo reverses only your own changes”; plan §3 calls a pick “navigation, not a command.”  
    **Setup/action:** Make identifiable changes in both squadrons. Pick back and forth, use Undo/Redo, and inspect the named change and landing. Repeat after another admin makes an unrelated change, then a conflicting change to the same item.  
    **Expected:** Navigation adds no step and clears none. Undo changes only the actor’s eligible work; a same-item conflict refuses and names the other person.  
    **Disproof:** Undo reverses a pick, affects the wrong squadron/person, silently overwrites newer work or loses the existing list.

11. **An open Schedules menu reacts to changing rights.**  
    **Source:** D2301 specifies “Your squadron”, “View only” and “Full access”; D2132 removes the arrow when only one squadron is available.  
    **Setup/action:** Leave Hunter’s menu open on 149 while Plan becomes View, then None. Repeat while on Edit Schedule, Logic and Users.  
    **Expected:** Labels and available rows update; View retains the readable foreign schedule; losing all foreign access returns him to a permitted page. With one remaining squadron, the arrow disappears.  
    **Disproof:** A stale row can be selected, an inaccessible page remains exposed, or the menu claims fuller rights than the page permits.

12. **The complete one-Save role/access matrix.**  
    **Source:** Plan §4: “One Save, one command, one Undo step”; Plan eligibility is judged on the role after Save.  
    **Setup/action:** Use an authorised master and a separate target. Cover Member → Admin plus Plan; Admin → Member while holding Plan; Admin → Master with View/Plan; Master → Admin and Member; unchanged roles with every None/View/Plan transition. Change two squadron lines together.  
    **Expected:** The final role determines valid grants; demotion ends Plan; promotion replaces grants with Full access. One Undo/Redo reverses/reapplies the whole accepted access change.  
    **Disproof:** Intermediate states leak, only one line saves, grants survive improperly, or several Undo steps are needed.

13. **Foreign search permits the squadron line, not the whole account.**  
    **Source:** D2191: a foreign person is found “to be given View, nothing else of his row changeable”; D2336 includes Plan holders among that squadron’s admins.  
    **Setup/action:** Kestrel searches for Hunter and gives him View of 149. Try Hunter’s role, name, suspension, archive and sign-in controls. Repeat as a Plan holder administering 149.  
    **Expected:** The 149 View change works independently; unrelated home-account controls remain protected. Ordinary admins cannot grant Plan or master status.  
    **Disproof:** Foreign View is wrongly refused because the whole account is foreign, or a foreign search unlocks account-wide changes.

14. **A refusal in the second access change rolls back the first.**  
    **Source:** Plan §4: “the first refusal shown, nothing of the Save committed.”  
    **Setup/action:** In one Save, make a valid change to one squadron line and a second change that would remove another squadron’s last eligible admin. Reverse their order and repeat.  
    **Expected:** Both attempts refuse completely, with no changed role/grant, misleading success notice or reversible partial step. Correct the blocker and retry successfully.  
    **Disproof:** The valid part survives the failed Save, a notice describes an uncommitted change, or retry duplicates an earlier partial result.

15. **Last-admin and master protections through real controls.**  
    **Source:** D2247: “the last-admin check counts only its own admins” where own admins exist; D2308 protects the first Plan holder until then.  
    **Setup/action:** Try demoting/suspending/archiving a last own admin despite an outside Plan holder. Separately protect a new squadron’s sole first Plan holder, then add its own admin. For masters, check the locked own row; with two masters, open another’s demotion form and remove the actor’s authority before Save.  
    **Expected:** Each current protection holds.  
    **Disproof:** A stranded squadron, usable self-demotion, or a stale master form saving without authority. Test the direct last-master refusal separately; do not invent an impossible authorised UI sequence.

16. **An access form becomes stale before Save.**  
    **Source:** Plan §4’s checks over the final state and all-or-nothing refusal.  
    **Setup/action:** Leave an access editor open. Change the actor’s authority, the target’s home/role, or a last-admin dependency through another authorised action; then Save. Include an unrelated intervening change as a control.  
    **Expected:** Save rechecks current permissions and dependencies; refusal leaves no partial change. Unrelated changes must not manufacture a permission failure.  
    **Disproof:** Stale authority succeeds or a refused Save partly commits. Record concurrent-value behaviour separately: D148 does not establish a blanket conflict-refusal rule for ordinary Save.

17. **Users filters, labels, roles explanation and no-sign-in rows.**  
    **Source:** D2335: “several ticks in a group mean any of them, groups combine”; D2320: “Give him a sign-in first to give access.”  
    **Setup/action:** Populate both squadrons with varied seats, CATs and roles, a Plan holder appearing in the relevant lists, and a person without a sign-in. Combine search and filter groups, open the role table, then Clear.  
    **Expected:** Accurate counts, alphabetical order, correct grouping and “Plans 149” label; no usable foreign-access buttons without a sign-in.  
    **Disproof:** Wrong intersections/counts, reordered rows, duplicate own-person totals, clipped role text or an explanation that disagrees with actual permissions.

18. **Creating a person carries the chosen home through every record.**  
    **Source:** Plan §4: “The chosen squadron carries through the whole add”; D350 excludes adding people from global Undo.  
    **Setup/action:** As Saber, remain on 142 and explicitly choose 149 in Add a person. Repeat with/without a sign-in, with a Plan holder, and through approval as a new person. Reload and inspect Users, Quals, Inputs and the admission date in Leave War. Lose authority while the form is open.  
    **Expected:** Identity and admission belong to the selected squadron together; stale authority refuses safely.  
    **Disproof:** Wrong home, missing admission date, partial creation or silently falling back to 142.

19. **Request access chooses its audience and grants no guest entry.**  
    **Source:** D2239: the applicant “sees only the waiting screen until an admin of his squadron approves him”; plan §5.  
    **Setup/action:** Submit new requests to 142 and 149. Inspect them as own admin, Plan holder, master, unrelated admin and View holder. Approve, decline and link in separate runs.  
    **Expected:** Only authorised admins can answer; linking offers the requested squadron’s people; a newly approved person joins that squadron. The applicant has no programme-entry button while waiting.  
    **Disproof:** Wrong audience, wrong-home admission, foreign linking or access through the waiting screen.

20. **Request badges, seen marks and bell navigation agree.**  
    **Source:** D2325: a tap “moves him to that squadron and opens its Admin → Users”; plan §15 D3.  
    **Setup/action:** Give Hunter Plan of 149; create different unseen-request counts in 142 and 149. Switch bell choices and tap 149’s request from 142. Also open each squadron’s Leave War Approvals separately.  
    **Expected:** Bell requests follow enabled squadrons; Admin/drawer badges follow the page. Visiting one list leaves the other unseen. The toast names 149; Tracker’s unsaved-work question still applies. Approvals’ New marks remain separate.  
    **Disproof:** A badge with no corresponding rows, wrong landing or cross-squadron seen-mark clearing.

21. **Waiting requests cannot be consumed through alternate account doors.**  
    **Source:** D2324 expressly covers “a sign-in typed onto another man, a new account, a rename.”  
    **Setup/action:** Jett waits for 149. Hunter without Plan tries each alternate door on 142, then Kestrel answers normally.  
    **Expected:** Every unauthorised route refuses with the approved “He asked to join 149…” explanation and leaves the request intact. Authorised acceptance removes it from all eligible waiting displays.  
    **Disproof:** Indirect acceptance, partial account creation, a consumed request after refusal or a stale request after approval.

22. **Every bell producer uses its event’s squadron and proper audience.**  
    **Source:** D2191 says View gives “never its bell”; D2202 gives Plan the foreign squadron’s admin lines; plan §7.  
    **Setup/action:** Create fresh input changes, leave decisions/openings/take-backs, postings/take-backs, OIL holiday events, failed postings and account changes in both squadrons while different pages are loaded.  
    **Expected:** Input lines reach their named people/filer, not all admins merely because they are admins. Admin events reach own/Plan/master audiences as applicable. Personal events reach the affected person. Foreign administrative lines carry the correct number.  
    **Disproof:** Any producer follows the currently loaded squadron or broadens/narrows its audience incorrectly.

23. **Bell choices affect visibility, unread counts and seen marks together.**  
    **Source:** D2198: other squadrons are “off by default” for a master; D2202: Plan lines are “on by default, his to switch off”; plan §15 D6.  
    **Setup/action:** Start with untouched preferences, then explicitly switch 149 off/on. Open the bell while off, pick elsewhere, reload and sign out/in.  
    **Expected:** Hidden foreign lines neither light the bell nor become seen; switching on reveals unread lines. Choices belong to that person and survive normally. Personal notices remain eligible.  
    **Disproof:** Count/list disagreement, hidden lines marked read, navigation changing preferences or one user changing another’s choices.

24. **Undo restoration differs from a fresh grant.**  
    **Source:** D2310: foreign lines “leave his bell at once, read or not”; plan §16 D1′.  
    **Setup/action:** Give Plan at 08:00; produce stored notices at 09:00; remove Plan at 10:00. Separately Undo the removal and make a fresh grant at 11:00. Keep the bell open. Include derived postings dated yesterday and today.  
    **Expected:** Removal hides lines immediately. Undo restores their original eligibility; a fresh grant does not revive older stored lines or yesterday’s derived posting. Today’s derived posting may reappear—the accepted exception.  
    **Disproof:** Any other resurrection, lingering count or delayed removal.

25. **An ordinary admin’s Undo restores the home role without restoring Plan.**  
    **Source:** D2250: “his Plan ends in the same change”; plan §16 D1′ specifies the narrower Undo.  
    **Setup/action:** Ranger is an admin with Plan of 149. Hunter makes him a member, then Undoes it. Separately test Undo of giving Plan and Redo of removing it, with notices arriving between actions.  
    **Expected:** Hunter’s Undo restores Ranger’s home admin role and eligible home lines, not foreign Plan or foreign admin lines. Every loss path updates menus, edit tabs and bells.  
    **Disproof:** Foreign privileges or notices return through the home-role Undo, or one replay path leaves stale access.

26. **Promotion preserves Plan continuity and personal bell preferences.**  
    **Source:** Plan §16 D1′a: “His own … choices still win.”  
    **Setup/action:** Promote Hunter from Plan holder to master with 149’s preference separately unset, explicitly on and explicitly off. Then let Hunter toggle it before Saber Undoes promotion.  
    **Expected:** Visibility defaults become on/on/off respectively; eligible older Plan lines remain. Promotion removes grant buttons/rows without overwriting preferences. Saber’s Undo remains possible despite Hunter’s independent toggle.  
    **Disproof:** Lost continuity, unwanted preference changes, blocked Undo solely because of that toggle or hidden grants reappearing later.

27. **Account-status notices complete the Undo/Redo conversation.**  
    **Source:** D2251 covers every account-status change; D2309 says a tap “opens nothing”; plan §16 D7′.  
    **Setup/action:** Cover admin/member, suspend/enable, View/Plan given/ended and master given/removed. Undo first while unread, then after reading; read the opposite notice before Redo. Include Undo of New squadron.  
    **Expected:** Approved wording, correct actor or automatic no-actor wording, no squadron badge, original/opposite/fresh-unread “again” behaviour, and no extra Undo step. An undone squadron still has its number in the notice.  
    **Disproof:** Missing/duplicate/wrong notices, navigation on tap or broken Undo ordering.

28. **Personal notices follow the person; administrative notices follow continuing rights.**  
    **Source:** D2218: “lines about himself stay with him”; plan §16 D1′b and D5′.  
    **Setup/action:** Prepare a move with personal leave/input notices and separate foreign filer-only/admin notices. Turn the old squadron off. Repeat for a Plan holder and a master.  
    **Expected:** Personal notices survive and bypass the squadron switch. Filer-only lines obey it and their required rights. A master retains eligible administrative lines where authority continues; a moved Plan holder loses ended grants’ lines.  
    **Disproof:** Treating all these lines identically, losing personal history or retaining foreign administrative access through a move.

29. **Midnight applies a new move once, including after sleep or closure.**  
    **Source:** D2203: “every View and Plan … is cleared”; plan §16 D11′ requires the writer at midnight too.  
    **Setup/action:** Prepare a fresh move due tomorrow through supported test setup. Keep pages/windows/bell open across midnight; repeat with a sleeping tab, first morning sign-in and a cancelled move.  
    **Expected:** Effective home, role, grants, own-page data, counts and automatic notices agree. Notices occur when effective, once; cancelled moves produce none.  
    **Disproof:** Early or missing notices, duplicate wake-up notices, yesterday’s access surviving or different results between midnight and morning sign-in. No Transfer button is assumed for this batch.

30. **Archive, overseas posting and manual suspension remain distinct.**  
    **Source:** D2311: archive/overseas end grants; “suspended by hand, they stay”; D350 excludes archive and postings from global Undo.  
    **Setup/action:** Give View and Plan with foreign notices present. Separately archive/restore, post overseas/return, and suspend/enable. Inspect the next usable sign-in as well as the administering screen.  
    **Expected:** Restore/return does not revive ended grants; enable restores use of retained grants. Bells and menus agree. The global Undo cannot reverse the excluded operations.  
    **Disproof:** Restored overseas/archive grants, lost suspension grants or an unsupported global reversal.

31. **A failed posting rings once, only after that posting really fails.**  
    **Source:** D2214: “once, the first time it fails,” excluding the last-admin lock; plan §16 D10′.  
    **Setup/action:** Prepare a due posting with a non-last-admin blocker, a last-admin hold, and a group attempt whose individual retries succeed. Trigger three normal retries/reloads.  
    **Expected:** Only genuine individual failures get the amber Users row and one bell notice. Its tap opens that person’s correct squadron row; approved retry/report wording appears. Undo of the unrelated action that woke the runner leaves the notice.  
    **Disproof:** False group-failure notices, duplicates, wrong recipients/row or a failure notice swallowed by rollback.

32. **Posting take-back removes notices even while hidden.**  
    **Source:** Plan §16 D1′c requires processing stored lines “whether shown or hidden.”  
    **Setup/action:** Produce a posting notice while Hunter has Plan, remove Plan, take back the posting through its sheet, then Undo the access removal. Separately make a displayed notice’s destination inaccessible or delete its person before tapping.  
    **Expected:** Restored authority does not resurrect the obsolete posting notice. A stale tap never opens unauthorised content; a deleted person opens nothing.  
    **Disproof:** An old posting reappears, a stale destination opens or a bell shortcut bypasses the normal permission checks.

33. **New squadron, new place and first admin save as one change.**  
    **Source:** D2308: the first admin gets Plan “so it never starts with no admin”; D2298 and plan §6 require inline new-place creation.  
    **Setup/action:** Saber creates 150 with a new place and eligible existing admin. Inspect all resulting displays, Undo and Redo. Repeat using an existing place, duplicate/invalid number, missing fields and a first-admin candidate who becomes ineligible before Save.  
    **Expected:** One complete change and one Undo step; no master or tomorrow-moving person offered as first admin.  
    **Disproof:** Orphaned place, half-created squadron, missing Plan, multiple steps or stale candidate acceptance.

34. **A waiting request blocks Undo of its new squadron.**  
    **Source:** Plan §5: “A squadron named by a request cannot be removed under it.”  
    **Setup/action:** Saber creates 150; a newcomer requests it; Saber presses Undo. Then an authorised other admin declines that request and Saber retries, provided no other dependency remains.  
    **Expected:** The first Undo refuses without removing any part of creation or the request. The second evaluates the now-current dependencies.  
    **Disproof:** Orphaned request, removed first Plan despite refusal, half-undone creation or a stale request dependency after it was legitimately removed.

35. **Place moves respect tomorrow; shared-place changes respect all occupants.**  
    **Source:** D2306: “Saved at once. The new place applies from tomorrow”; plan §15 D13 and §16 D13′.  
    **Setup/action:** Move 149 to a new place, Undo/Redo before midnight, then cross midnight. Separately edit a place used by different squadrons today and tomorrow, then an empty place.  
    **Expected:** The move preserves today and earlier placement. Shared-place editing requires authority over every current/future occupant; an empty place requires master authority. Names, GMT labels, disabled fields and explanations agree.  
    **Disproof:** Early/retrospective move, orphaned place or permission calculated from today’s occupants alone.

36. **Eight squadrons remain reachable on the phone.**  
    **Source:** D2321: bell buttons “stay one row that slides sideways”; the other specified surfaces “grow a row per squadron.”  
    **Setup/action:** At 402 × 874 WebKit, use eight squadrons in Schedules, the access editor, Users filters and the bell. Reach the final option, change it, save and reopen. Include long names.  
    **Expected:** Intended panel scrolling, reachable final rows/actions and reliable selection.  
    **Disproof:** Clipped or unreachable options, unintended page scrolling, background activation, lost Save/Cancel or a setting applied to the adjacent squadron.

37. **Shared-computer sign-in waits for the previous save and reload.**  
    **Source:** D2322: “Saved. Press Sign in again”; “Never the password kept.”  
    **Setup/action:** Hold Hunter’s save, sign him out and enter Osprey’s credentials. Press Sign in twice; make the save fail, retry and let it land.  
    **Expected:** No premature session; the change stays Hunter’s. The approved waiting/failure messages appear. Reload happens before admission, retains the typed name only, and the next press gives Osprey a fresh Tracker.  
    **Disproof:** Mixed identities, old Tracker contents, retained password, duplicate admission or the pending save attributed to Osprey.

38. **Reload and sign-out/in reconstruct the saved access and requests.**  
    **Source:** D148 says the Undo list “clears when they sign out”; plan §§4–8 require saved access, requests and personal preferences.  
    **Setup/action:** After each grant/removal, role change, request approval/decline and bell toggle, reload; separately sign out/in as the affected person and another person.  
    **Expected:** Menus, access rows, waiting lists, badges and bell reflect the saved result and current rights. No old session’s Undo is inherited. This does not assume the selected page must persist.  
    **Disproof:** Reappearing revoked rights/answered requests, lost accepted changes or another person’s preferences/history.

39. **Five complete everyday rounds, including member view and back.**  
    **Source:** D2253: member view retains foreign “View-only Sched and Logic read only”; D2252, D2197, D2201 and the approved role table.  
    **Setup/action:** Each named sign-in visits every available tab, opens/closes every reachable window, makes an ordinary permitted change and returns. Give members foreign View for a second round. Run Hunter with View, Plan and member view; run Saber’s member view too.  
    **Expected:** Ranger/Osprey can file their inputs, edit permitted own Quals fields and bid for own leave; Kestrel/Hunter administer the appropriate squadron; Saber reaches both. Personal filing remains primary. Member view retires no underlying rights or notice history. Check board/top-bar numbers, schedule print/CSV, Quals export, bell and Tracker together.  
    **Disproof:** Any page, export, permission or return path disagrees with the person and squadron actually being served.

40. **Every approved state matches in wording, layout and operation.**  
    **Source:** Approved M1–M2, R1–R5, numbered 1–10 variants and f1a–f10; D2304: menu rows “38 high on an iPhone as on a desktop”; D2306’s five final wording changes.  
    **Setup/action:** Compare the running states with the host’s approved pictures at both sizes. Use keyboard opening, arrows, Escape, outside press and focus return; on phone, open the keyboard while completing forms.  
    **Expected:** Correct labels, row sizes, disabled explanations, reachable actions and focus behaviour.  
    **Disproof:** Clipped roles, obscured Save, incorrect focus return, earlier superseded wording or visible disagreement with an approved state. **Visual comparison remains unrun here.**

The production-surface roll-call below is a coverage checklist, not a record of passed checks. “Check together” names the other display or saved result that must agree.

| Production surface | Visible sign and working gesture to inspect | Check together |
|---|---|---|
| Top-bar squadron button and Schedules menu | Number, arrow, selected tick, access labels; pointer, touch and keyboard pick | Actual page, available tabs, Undo |
| Board day title | Grey squadron number beside the day | Schedule data, print heading |
| Desktop tabs and phone drawer | Edit Schedule visibility, Admin availability, request badges | Current authority and corresponding rows |
| Edit Schedule and board | Edit mode, drag/drop, typing, paste, delete, sort, cancellation, publishing | Saved squadron, View-only rendering |
| View-only Sched | Every route that could open an editor | Read-only permission and landing |
| Logic | Values, Edit/Done, individual/global resets, linked settings doors | Picked squadron and own-input calculations |
| Day, wave and duty templates | Open, edit, add/delete, reorder/reset, Save/Cancel | Config and subsequent schedule use |
| Saved plans | Save/load/replace/delete doors that are offered | Target schedule and Undo |
| Changes window | Correct history and permitted member/admin controls | Actor, squadron and Undo result |
| Planning calendar | Day actions and nested input/settings doors | Calendar’s named squadron |
| ALL AVAIL window | Earning switch and related editing controls | Schedule permission and OIL |
| Admin → Squadron config | Numbered heading, cover explanation, defaults and ordering | All three templates and picked squadron |
| Admin → Data | Clear old clutter and Clear edit history, including confirmations | Picked schedule’s notes/history only |
| Inputs list/calendar and Input window | People, filters, dates, add/edit/remove, documents and person picker | Correct home/page squadron, late mark and OIL |
| Medical and SANS views | Displayed people/records, day controls and settings doors | Own-page squadron and named settings |
| Inputs/SANS/Calendar settings | Original ownership, held-window state, Save/Close | Original squadron’s settings |
| Quals | People, columns, own-row restrictions, callsign/Management/Scheduler controls | Users, current role and LoX export |
| OIL list and prompts | Eligible people, questions, amounts and pending count | Input’s squadron, published values, bell |
| Leave War main view | Period, people, bids, person/day windows, settings and counters | Home/page war, balances and inputs |
| Leave War Approvals | Requests, decisions and New marks | That squadron’s bell and seen state |
| Leave War posting/archive sheets | Dates, outcome, holds, retry/failure and local take-back | Users, effective rights and notices |
| Tracker | Bound-squadron cover, chart, settings, shortcuts, imports/exports | Permission, retained draft and sign-in boundary |
| Users list/search/filter | Own people count, archived rows, foreign badge, “also plans” label | Selected groups and access editor |
| Users access editor | Role, home, each None/View/Plan line, Full access, explanations, one Save | Final permissions, notices and Undo |
| Roles explanation | Eight pages × five roles, numbered qualifications | Actual reachable pages and controls |
| Add person / Give sign-in | Home choice, available people, identity and admission | Chosen squadron’s roster and war |
| Request-access and waiting screens | Squadron choice, submission status, waiting state, Sign out | Correct admin audience; no guest entry |
| Waiting list / approve / decline / link | Request’s squadron and eligible person choices | Bell shortcut, badges, request removal |
| Admin → Squadrons | Number, place, people count, first admin, new-row indication | Menu, first Plan and Undo |
| Place editors | Occupant names, GMT label, disabled fields, new-place fields | Current/future placement and shared authority |
| Bell list and Show row | Foreign number, personal lines, switches, unread/seen state | Each producer, current rights and preference |
| Bell shortcuts | Request and posting destinations; no-op account notices | Correct squadron, row and Tracker guard |
| Undo/Redo controls | Availability, hover label, result bubble | Whole saved change and current permission |
| Sign-in/out and save-status band | Waiting, failure, retained name, clean reload | Previous actor’s save and new Tracker |
| Schedule print/PDF and CSV | Squadron in title, heading/name and published content | Schedule in view |
| Quals LoX export | Squadron in filename and displayed filtered rows | Quals’ own-page squadron |

I checked the following apparent gaps and found **no basis to report them as defects**:

- The host’s three readings are supported: picking is navigation; foreign View leaves own pages at home; Tracker binding lasts until sign-out, with the specified covers.
- The full place-move ruling contains a narrowing to **tomorrow**. It does not support an immediate move.
- The final plan replaces the earlier proposal to delete other people’s bell records when rights end. The scenarios therefore check visibility and continuity, not physical deletion.
- A derived posting dated on the day of a fresh grant may reappear. That exception is expressly accepted.
- The corrected member description permits seeing everyone’s home Inputs and Quals rows; “members see only themselves” is not a valid expectation.
- The approved phone menu row is 38 pixels. Its departure from the earlier 44-pixel drawing is not a defect.
- Inputs export was deliberately removed; the export checks concern the remaining schedule and Quals exports.
- Per-kind notification preferences and the later Transfer interface are not omissions to charge to this batch.
- Stored demo records predating correct new behaviour are excluded. Every scenario above concerns freshly created data or a newly performed action.

**No code defect is claimed by this report.** The host still owes the runtime observations and visual comparisons before any scenario can become a finding.

Rulings: No new rulings. Read-only; no files changed.