# Job 2 — Astra's scenarios (Codex via the CLI, on the exported copy at `2b792ebc5`, 19 Nov 26); the walk briefs W1–W3 were written from them

---

The roll-call needs several additional doors and readers, and one correction: **this build has no screen controls for changing home squadron, grants or the master mark.** Those requirements need separate command-level evidence; the browser walk cannot certify them.

This is a scenario-design report for the exported `2b792ebc5` build, not a verdict on its correctness. I read the brief whole and traced the supplied faults, plans, evidence, rules and relevant source. I changed no files and ran no tests or browser actions. No handoff block was pasted after compaction.

I used the brief’s finder rule: **assume every existing line may be correct and the defect may be a missing call site.** Locations below are relative to `raptor-port/`.

**1. Roll-call gaps**

| Missing or insufficiently separated item | Visible door or reader, and why it needs its own check |
|---|---|
| **A foreign Leave War that has never opened** | Saber’s **Archive** in Admin → Users, followed by Kestrel’s first Leave War visit. Creating the initial periods must preserve the posting window already written by Archive. This differs from editing a fully populated war. `src/leavewar/state/foreign.ts:1`; `docs/data-schema.md:656`. |
| **Foreign records changed between two master actions** | Archive, another tab’s legitimate 149 edit, then Restore or Delete. A reused foreign store must read the latest records and preserve unrelated changes. Check after reopening, without assuming live cross-tab synchronisation. |
| **Active-row account doors** | **Save** for sign-in and role separately; **Suspend**, **Enable**, **Give sign-in**, **Cancel**, and Delete’s second press. “Edit person” is too broad: these take different paths and have different refusal sentences. `src/ui/UsersPanel.tsx:301`. |
| **Archived rename without restoration** | **Save name** beside **Restore as …**. It changes the person without reopening his stint or enabling his account. It is also a reachable cross-squadron, undoable person edit for the history check. `src/ui/UsersPanel.tsx:405`. |
| **Both access-approval routes** | Waiting for access → **Give access** → **On the roster** or **New person** → **Give access** / **Add person and give access**. Linking an existing person must retain his home; a new person takes the approving admin’s home. Include **Refuse**, **Cancel**, and the waiting count. `src/ui/UsersPanel.tsx:175`; `docs/data-model.md:1743`. |
| **All three new-person paths** | **Add person**, **Add person and sign-in**, and **Add person and give access**. Also enter through Quals → **+ Add person**. All must retain the chosen post-in date; adding an account later must not reset it. `src/ui/UsersPanel.tsx:490`, `:559`; `src/state/roster-add.ts:154`. |
| **Quals as a separate writer** | Active callsign changes occur here, not in the active Users editor. Test callsign separately from CAT, initials, flight, remarks and qualification ticks. A plain 142 admin must be refused on Saber’s callsign but may still change his ordinary Quals fields. `src/state/quals-write.ts:48`. |
| **Three posting renderers** | A one-day window’s **⋯ → Post out / Post in**; a single-person drag selection’s equivalent controls; and an existing **PO/PI** sheet. Include outcome chips, date changes, Delete’s confirmation, **Undo post out (PO)** and **Undo post in (PI)**. These are not the top-bar Undo. `src/leavewar/ui/BidPicker.tsx:717`, `:1435`, `:1553`; `src/leavewar/ui/SelectSheet.tsx:493`. |
| **Posting effects that run later** | The held reason on the posting sheet and Users row; archive/suspension/deletion when the posting becomes due; the resulting admin bell line. The lock must hold the whole effect, not merely keep the account enabled. `src/leavewar/sync.ts:2458`; `src/ui/UsersPanel.tsx:280`. |
| **Hidden and historical people** | SANS hidden from the grid, personnel, someone not yet posted in, someone with an earlier closed stint, and someone away for an entire period. Compare the grid, person window, year selector, manning and availability. A missing current row must not mean missing history. |
| **Leave War record families beyond leave and awards** | Periods/open dates; bids and decisions; typed balances and grades; ledger credits and day awards; personnel labels; events; counters, required/available rows, grouping/order and OIL settings. They share the squadron guard but have different writers and projections. Relevant UI: `src/leavewar/ui/SettingsSheet.tsx:231`, `ApprovalsPage.tsx:447`, `GradesSheet.tsx:200`, `OilTracker.tsx:497`; record inventory: `docs/data-schema.md:665`. |
| **Ways back from Leave War to an input** | Approved leave’s **Remarks**, **Document**, day list and person-window entry. These can write or open an Input rather than a war-owned bid. A day containing several records is a separate renderer from a single-record day. `src/leavewar/ui/RemarksSheet.tsx:24`; `BidPicker.tsx:1203`; `PersonWindow.tsx:329`. |
| **Indirect input writers** | Putting, replacing, removing or moving a puck on an input-derived schedule row; cancellation/marks; filing under Unavailable; OIL answers and exceptions. These must obey the same ownership rule as the input form. `src/ui/reqdoor.ts:112`, `:247`, `:323`, `:356`, `:398`. |
| **Input readers other than the main list** | Inputs calendar, opened day, Medical view/document, SANS calendar, schedule week and board, Leave War, person window and OIL displays. Check the same people, dates, remarks and disposition, not merely that Save succeeded. `src/ui/InputWindow.tsx:797`; `.claude/rules/seams/leave-war.md`. |
| **Archive/Delete’s schedule and Tracker consumers** | Working versus issued schedules; named seats versus ALL AVAIL crowds; another saved week; past inputs/documents/signatures; current versus completed Tracker enrolments; reused callsigns. Archive and Delete have different retention rules. D299, D320, D323, D327. `src/state/person-delete.ts:187`; `src/tracker/peoplewire.ts:42`. |
| **Every bell family and its destination** | Input notices, leave decisions, bidding-open/closed notices, posting notices, derived posting/ended-period lines, holiday OIL notices and access-request alerts. Test badge, line, read state and tap destination separately. A posting line should reveal and ring its Users row, including opening **Archived**. `src/ui/topbits.tsx:73`; `UsersPanel.tsx:443`; `docs/notifications-register.md:28`. |
| **History’s other write and read doors** | **New to you**, **All changes**, **Mark all as seen**, day-head **N new / N changes**, board **History**, and Admin → Data → **Clear edit history…**. The sweep is a real deletion path through the new guard. `src/ui/ChangesWindow.tsx:246`, `:323`; `AdminPage.tsx:325`; `src/state/changelines.ts:636`. |
| **Tracker beyond a progress mark** | Student/person picker, dates, course and syllabus changes, layout, event details, **File → Import… / Export…**, its own Undo/Redo, and flex settings. Include the Tracker already mounted before sign-out. Ordinary members retain editing and File access; flex settings remain read-only. `src/tracker/components/Header.jsx:320`; `src/tracker/storage.js:59`; D121/D1014. |
| **Closing, abandoning and switching while a control is open** | Inline Users editors, date calendars, Delete confirmations, nested document viewers, Leave War sheets and full-screen OIL. Verify which layer closes and whether typing is saved or discarded according to that control’s contract. D1557; `docs/design-practices.md:390`. |

**Correction to the host’s roll-call:** the Users form currently exposes person details, sign-in, role and post-in date. Searches for production callers of `setHome`, `setGrant`, `removeGrant` and `setMaster` found their definitions, not screen callers. See `src/state/units.ts:179`, `:191`, `:198` and `src/state/accounts.ts:480`. Do not instruct a walker to select nonexistent home, grant or master controls.

Also distinguish **a posting’s “Post in” date** from **home squadron**. Changing one is not evidence that the other works.

**2. Ranked scenarios and sizing**

Use walker A on desktop Chromium, 1536 wide, then walker B on WebKit touch, 402 × 874. Each starts with independent fresh browser storage and recreates fixtures through controls. Do not use `?fresh=1` for persistence checks. The developer bridge may read identities, homes and records, but may not create or alter them.

The allocation is **56 minutes of scenarios plus four minutes of setup per walker**, about two hours together. These are planning allowances, not measured durations. The host must prove the entry routes against the production build before issuing the executable briefs, as `docs/walk-scripts.md:30` requires. If a required branch overruns, report it **OWED**, not passed.

Use the app’s displayed today as **T**. Give newly created people short unique callsigns, such as `J2Archive`, `J2Delete` and `J2Future`. Establish records on **T−1, T and T+1**, with a period spanning them and another wholly inside an away gap. Make a small 142 control record beside each 149 fixture. Confirm each fixture landed before relying on it.

The scenarios are ranked by risk; execute the sole-admin checks before creating a second enabled 149 admin. Destructive master-account setup goes last.

1. **Archive before 149’s first Leave War visit — 4 minutes per walker.**

   **Setup:** Fresh storage. Sign in as Saber; do not first visit 149’s war.

   **Action:** Admin → Users → Osprey → **Archive**. Inspect the Archived row and sign-in/roster dots. Sign out, sign in as Kestrel and open Leave War for the first time. Inspect yesterday, today and a future period; reload and inspect again.

   **EXPECTED:** Osprey’s past remains; from T he is away and excluded from manning. A wholly later period has no row for him. Initial creation of 149’s periods preserves the archived window. 142’s war remains unchanged. Sources: D323; `docs/data-model.md:1785`; evidence table, Astra 3.

   **Disproof:** First opening or reloading restores his availability, erases his earlier stint, loses periods, changes 142, or permits his suspended sign-in.

2. **Archive a populated foreign war, including hidden and pending states — 4 minutes each.**

   **Setup:** Kestrel creates `J2Archive` with a past post-in date, past leave and OIL, and a future posting. Keep a different 149 person’s record as a control. Walker B uses a SANS person hidden from the grid.

   **Action:** Saber archives him from Users while 142 is loaded. Kestrel reopens 149’s war and checks the person window, grid, OIL history and counts.

   **EXPECTED:** The past and unrelated records remain. Archive closes the current stint at yesterday; a pending posting is replaced, with the app’s explanation recorded. A posting already run retains its established cutoff. Hidden SANS status must not bypass the foreign write. Sources: D323; `src/leavewar/sync.ts:2910`; evidence Astra 3.

   **Disproof:** The account archives but the war still counts him, past OIL disappears, another person changes, or the old pending outcome later runs again.

3. **Restore, Restore as and Save name are three different operations — 4 minutes each.**

   **Setup:** Use an archived 149 person with saved past records. For the collision branch, Kestrel creates a new active person using the archived person’s old callsign. Keep identities distinct.

   **Action:** Saber first attempts restoration with a date on/before the closed stint. Then use a valid later date. Exercise ordinary **Restore**, **Restore as …**, and a separate **Save name** without restoration across the two walkers.

   **EXPECTED:** Invalid restoration changes nothing. A valid return preserves past records and the away gap, counts him from his post-in date, and enables his existing sign-in immediately—even if it was manually suspended before Archive. **Save name** alone neither restores nor enables him. First sign-in offers **Check my quals / Later**. Sources: D308, D320, D322; `UsersPanel.tsx:388`.

   **Disproof:** A refused attempt partially renames/enables him; the gap becomes available; old records attach to the new namesake; or Save name silently restores him.

4. **Delete a 149 person across the cutoff and all retained history — 4 minutes each.**

   **Setup:** Through 149’s controls, give `J2Delete` past and future leave/input records, a document, past and future OIL awards, and appearances on two schedule weeks. Include running and completed Tracker records where the UI-driven fixture permits. Walker B additionally uses someone whose first post-in is still ahead.

   **Action:** Saber uses **Delete**, reads the consequence text, cancels once, then confirms with **Tap again to delete …**. Kestrel checks 149 after sign-in and reload.

   **EXPECTED:** Past records remain; today/future records and awards from the cutoff go. Account, active pickers and running-course placement disappear; completed-course history remains. Someone never arrived gains no fictitious earlier stint. Top-bar Undo cannot resurrect him. Sources: D299, D350; evidence Astra 3; `src/state/person-delete.ts:468`.

   **Disproof:** Wrong-side-of-cutoff removal, deletion confined to the current period/week, retained future OIL, lost documents/completed history, or any change to the 142 control.

5. **Plain 142 admin refused at every reachable 149 Users door — 4 minutes each.**

   **Setup:** Kestrel prepares active, suspended, no-sign-in and archived 149 people. Sign in as Prowler (`ad2/a2`).

   **Action:** Attempt sign-in **Save**, role **Save**, **Suspend**, **Enable**, **Give sign-in**, **Archive**, confirmed **Delete**, **Restore**, **Restore as …**, **Save name**, and **Give access → On the roster** where a qualifying 149 person is offered. Use otherwise valid values.

   **EXPECTED:** Account doors say **“He is 149’s. Only an admin of 149 can change his account.”** Person doors say **“He is 149’s. Only an admin of 149 can change him.”** No record, count, dot, notification or history of a successful change moves. Sources: D2205; `src/state/accounts.ts:306`, `:317`.

   **Disproof:** An allowed mutation, partial effect, generic “own row”/“That did not save” in place of the settled ownership sentence, or a request consumed despite refusal. A person not offered by a picker is an unavailable route, not proof that its writer refused.

6. **A master’s account is protected without freezing his whole Quals row — 3 minutes each.**

   **Setup:** Prowler and Kestrel inspect Saber through their available doors.

   **Action:** Attempt his sign-in/role **Save**, **Suspend**, **Archive** and confirmed **Delete**. As Prowler, attempt Saber’s callsign change on Quals, then make and undo an ordinary CAT or remarks change. Exercise **Overseas Sqn** and **Delete** posting choices on Saber from 142’s war.

   **EXPECTED:** Account/account-like changes say **“Only a master admin can do that.”** Delete says **“Saber is a master admin, so he can’t be deleted.”** Ordinary own-squadron Quals editing remains allowed. Sources: D2205; evidence Security H4 and “where narrowed”; `src/state/accounts.ts:663`.

   **Disproof:** Account mutation, the wrong leading refusal, or ordinary CAT/remarks blocked solely because Saber is master.

   **Archived-master branch:** At the end of a disposable run, Saber can attempt his own due **Overseas Sqn** posting; if it produces an archived master through the real UI, Prowler must then be refused on **Restore**, **Restore as** and **Save name**. Do not strand the main working fixture midway.

7. **149 retains its last able admin — 3 minutes each.**

   **Setup:** Before adding another 149 admin, confirm Kestrel is the only enabled home admin.

   **Action:** As Saber, attempt Kestrel’s **Suspend**, demotion by **Save**, **Archive** and confirmed **Delete**. As Kestrel, inspect the disabled own Users row and set a due **Overseas Sqn** posting through Leave War. Then give another 149 person an enabled admin account and observe the held posting.

   **EXPECTED:** Direct removal doors say **“Kestrel is 149’s last admin. Make another admin of 149 first.”** The posting waits whole and explains why; once a second able home admin exists, it can run. A suspended admin or Saber’s master reach is not a replacement home admin. Sources: `docs/data-model.md:1738`; D306.

   **Disproof:** Archive/war removal occurs while sign-in merely stays enabled; a nominal but disabled replacement unlocks it; or the posting remains permanently stuck after the valid replacement.

   The own-row restriction is not evidence of the last-admin invariant. Home-date and otherwise unreachable Delete-posting combinations remain scenario 16.

8. **Every new-149-person path retains post-in — 4 minutes each.**

   **Setup:** Sign in as Kestrel. Use distinct names and a post-in of T+3.

   **Action:** Use **Add person**, **Add person and sign-in**, and a real request’s **New person → Add person and give access** across the two walkers. Enter one through Quals → **+ Add person**. Later use **Give sign-in** on the no-account person.

   **EXPECTED:** Each person belongs to 149 immediately; access can work before arrival, but Leave War counts him only from T+3. Adding sign-in later changes neither home nor post-in. Reload preserves both. Sources: D308; `docs/data-model.md:1743`; evidence Astra 4.

   **Disproof:** A 142 home, early manning/availability, lost date on first war open, orphan account, or date reset by Give sign-in.

9. **People pickers for both admins and both members — 3 minutes each.**

   **Setup:** Use Prowler, Kestrel, Ranger and Osprey; keep a second active person in each squadron.

   **Action:** Inputs → new input → Person picker. Exercise one/several people, search, remove/re-add, reopening an existing input and changing dates. Compare calendar and schedule entry routes. Exercise eligible ALL/ALL AVAIL choices separately from named people.

   **EXPECTED:** New own-page inputs offer the appropriate home roster; saved inputs retain their proper ownership. Members can file permitted inputs within their own squadron. Medical and placeholder restrictions still apply. Sources: `docs/data-model.md:1768`; `src/ui/InputWindow.tsx:797`.

   **Disproof:** Foreign people offered and saved improperly, own people missing, retained foreign selections after a form change, or valid own-squadron member work rejected.

10. **An input changed from the schedule still obeys the input rule — 3 minutes each.**

    **Setup:** Make a same-squadron, several-person duty input through Inputs and place it on the schedule.

    **Action:** Add/remove a person from its schedule row, replace its sole person in a separate input, change a mark/cancellation, and use the available Unavailable/OIL controls. As the member, take himself out.

    **EXPECTED:** Inputs, schedule, Leave War/OIL and relevant bell lines agree. The change is atomic. The member’s withdrawal remains allowed under D755. Sources: D755; `docs/data-model.md:1768`; `src/ui/reqdoor.ts:247`.

    **Disproof:** A puck changes without the input, the wrong person earns OIL, an allowed edit is rolled back by its notification, or another squadron changes.

    A genuinely mixed-home input cannot simply be invented through the bridge; its special withdrawal rule belongs in scenario 16 if no UI route produces it.

11. **Every seeded sign-in’s bell after the other squadron acts — 3 minutes each.**

    **Setup:** Produce distinguishable 142 and 149 input and leave actions through their own admins. Include bidding changes and one posting result.

    **Action:** Inspect Saber, Prowler, Kestrel, Ranger and Osprey in turn. Open a line, use **Mark all read**, reopen after reload, and check another recipient’s unread state. Follow a posting line to Users and a leave line to its date.

    **EXPECTED:** Ordinary squadron business reaches its intended people only; reading one person’s bell does not read another’s. Badge, list and destination agree. Preserve the built exceptions: shared-place holiday OIL notices, and notices concerning an input changed in the same command. Sources: `docs/data-model.md:1777`; notification register B1–B12/R1/P4/P7.

    **Disproof:** Foreign ordinary lines, missing own lines, wrong landing, another person’s read state changing, or an exception being refused as leakage.

12. **History ownership, Undo/Redo and the history sweep — 4 minutes each.**

    **Setup:** Make distinct ordinary edits in each squadron. Keep an archived 149 person available for Saber’s **Save name**.

    **Action:** Saber renames that archived person, then uses top-bar Undo and Redo before ending his session. Read 149’s history from a separate tab/reopened reader. Check **All changes**, not only **New to you**. Separately, Prowler uses Admin → Data → **Clear edit history…** for the dates containing both squads’ test edits.

    **EXPECTED:** The foreign person edit and its reversals remain filed under 149. The sweep removes only history Prowler may clear; 149’s lines and the actual schedules survive. Read markers do not become Undo steps. Sources: evidence Astra 5/Security H5; `docs/data-model.md:1772`; `src/state/changelines.ts:636`.

    **Disproof:** Reversal lines appear in 142, duplicate or disappear; the sweep crosses units; or clearing history changes working data.

    Do not sign out between the edit and Undo/Redo: that ends the session’s Undo history.

13. **Tracker isolation includes members, retained mounts and File — 4 minutes each.**

    **Setup:** Give each squadron a distinctive student mark/date through its Tracker.

    **Action:** Edit as Prowler/Kestrel and Ranger/Osprey. Use Tracker Undo/Redo. Leave Tracker, sign out and sign in as the other squadron on the same tab, then reopen it. Reverse which squadron opens Tracker first on walker B. Open **File → Export… / Import…**; where file round-tripping is exercised, use a file exported by the app. Inspect flex settings.

    **EXPECTED:** Marks, dates, roster and files belong to the bound squadron. Members retain ordinary editing and File access; flex settings are read-only for them. Sources: `docs/data-model.md:1782`; D121/D1014; `src/tracker/storage.js:59`.

    **Disproof:** The first-mounted squadron receives the later user’s save, foreign students/marks appear, member saves are incorrectly denied, or Tracker Undo changes the other unit.

14. **First account write, duplicate names and reload — 3 minutes each.**

    **Setup:** Use a fresh context before any account mutation. Keep the seeded sign-ins as the baseline.

    **Action:** Make one legitimate account change through Users. Attempt a case/whitespace-normalised duplicate sign-in through Save or Add. Reload and sign in with the seeded accounts.

    **EXPECTED:** The first saved account list preserves untouched seed accounts, Saber’s master identity and Kestrel’s admin access. A duplicate is refused without a partial person, account, home or post-in. Sources: evidence Astra 2/Security H1; `docs/data-model.md:1746`.

    **Disproof:** A seed account disappears only after reload, the master mark is lost, a collision silently drops an account, or a failed add leaves a person behind.

    This checks UI-produced data. Arbitrarily re-keyed rows require scenario 16.

15. **Plain-user completion and closure round — 6 minutes each, with closures also exercised during 1–14.**

    **Setup:** Use the people, leave, awards and documents already created.

    **Action:** Perform the role-specific everyday tasks in part 4. Reopen each affected result from another surface. Reopen nested controls enough times to use their visible close control, Escape and outside tap where supported.

    **EXPECTED:** The requested task completes; the correct layer closes; the parent remains usable; reopening shows the saved result or the deliberately discarded draft. Source: D1557, with the control’s existing save/close contract.

    **Disproof:** Closing a document closes its parent first; a confirmation’s Cancel commits; typing leaks into the next person; a hidden sheet still handles input; or a result exists only on the initiating screen.

16. **Required evidence that this browser walk cannot produce — no browser minutes; explicitly OWED.**

    There is no honest UI setup for these in the present build:

    - **Home move today:** an existing person’s genuine move effective today must be refused. Restating today’s existing home is a different case. A first home from today for someone genuinely homeless is allowed; a first home in the past is refused.
    - **Last admin on future dates:** attempt Kestrel’s move out tomorrow and later. Also arrange a second admin who leaves on an earlier future date, then attempt to remove the remaining admin. Judge every relevant date, not only today.
    - **Grant removal:** move a person with View/admin grants. The move and all grant removals must be one accepted command or no change. This implementation drops grants when the move is scheduled. Undo before the effective date restores home and exact grants; Redo removes them again. A refused move preserves all grants. D2203; `src/state/units.ts:198`.
    - **History across midnight/home change:** make an edit while home is 149, then reverse it after home becomes 142. Both reversal lines stay with the original edit’s squadron. Evidence Astra 5.
    - **Master-mark and malformed-account writes:** re-keyed accounts, loader-discarded collisions, person-only deletion/special-status changes, and forbidden master-mark changes. Evidence G0–G3.
    - **Raised developer role:** refusal wording must use the effective role. The brief forbids mutating `window.raptorRole`, so source/unit evidence is required.
    - **Mixed-home input withdrawal, foreign-filer notices and non-UI foreign-history writes:** exercise the exact exceptions at the command seam rather than planting a browser fixture.
    - **Future posting combinations unavailable within the two-hour clock window**, including Delete becoming due after the other home admin ceases to count.

    These are limits of browser evidence, not findings that the deferred screens should already exist. Use the named job-1 tests as evidence to inspect, not as a claim that I ran them.

**3. Orders that matter**

Use opposite orders across the walkers where possible. A reverse order that requires an impossible or already-deleted state is marked as such rather than fabricated.

| Pair or sequence | Both orders to exercise, and the distinction |
|---|---|
| Foreign Archive / first 149 war open | Archive → first open; first open → Archive → reopen. Initialisation versus established storage. |
| Foreign action / other-tab record edit | 149 edit → master action; master action → 149 edit → next master action. Preserve both unrelated results after reload. |
| Archive / pending posting | Set future posting → Archive; Archive → try posting controls. The latter must respect the archived person’s restricted route back. |
| Archive / SANS hiding | Hide SANS → Archive; Archive → show/hide SANS. Visibility must not decide whether history exists. |
| Archive / hand suspension | Suspend → Archive → Restore; Archive → Restore → Suspend. Restore’s enabling rule differs from later manual suspension. |
| Archive / future post-in | Future post-in → Archive; Archive → Restore with future post-in. Neither creates fictitious attendance before arrival. |
| Closed stint / Restore date | Try the invalid boundary first, then valid date; valid return, Archive again, then another valid return. Refusal leaves no partial state; repeated stints remain sound. |
| Callsign reuse / Restore | Reuse old callsign → Restore as; restore original → attempt duplicate new person. Identity is never selected merely by matching text. |
| Save name / Restore | Save name → Restore; Restore as in one action. Same final person, different commands; rename-only must not restore. |
| Delete / saved future week | Visit and save future week → leave it → Delete; Delete → reopen that week. No resurrection from an unloaded week. |
| Delete / later same-name addition | Delete → add namesake; add conflicting namesake attempt → Delete. Old documents, history and Tracker records remain attached to the old identity. |
| Delete / Undo | Make an ordinary edit → Delete → press Undo; Undo ordinary edit → Delete. Delete itself must never be undone. Do not expect the two final worlds to be identical. |
| Last-admin removal / replacement | Attempt removal → create able replacement → retry; create replacement → remove it or disable it → retry target removal. Count ability to sign in, not the Admin label alone. |
| Posting due / replacement admin | Due while sole admin → replacement added; replacement already able → posting due. Held whole versus immediate lawful execution. |
| Input edit / schedule-row edit | Form people change → row change; row change → form reopen/change. Both representations must converge. |
| Input edit / member withdrawal | Admin adds others → member takes himself out; member withdraws → admin edits remaining input. No accidental deletion of everyone’s input. |
| Notice read / reversal | Undo before recipient reads; recipient reads → Undo, then Redo. Use a second tab so the author’s Undo session survives. Apply the built notice-family rule, not one assumed rule for every family. |
| History read / other-unit edit | Mark 142 seen → create/read 149 change; mark 149 seen → create/read 142 change. Reading one unit must not consume the other’s new lines. |
| History sweep / reversal | Edit → Undo/Redo → sweep; sweep existing lines → new edit/Undo/Redo. New lines still appear; another unit’s history survives. |
| Tracker first mount / sign-in | 142 mounts first → 149 login; 149 mounts first → 142 login. Also compare first visit after login with revisiting an already-mounted Tracker. |
| Unsaved editor / navigation | Type → Cancel/close → reopen; type → Save → close → reopen. Repeat when another row, bell landing or nested document is opened. |
| New person / account | Add without sign-in → Give sign-in; add person and sign-in together. Same home/post-in outcome. |
| Home move / grants / Undo | Grant → move → Undo → Redo; move → grant new rights → attempt reversal under the current rules. Command-level only; do not assume later grants may be silently erased. |
| Future home / admin removal | Schedule home change → attempt suspension/demotion/deletion; remove admin first → attempt the home change. Command-level only; inspect all affected dates. |
| Midnight / Undo home move | Undo before the effective day; attempt Undo after it begins. The latter may correctly be refused—the evidence sheet explicitly accepts that residual wording. |

For every refusal, take the before/after comparison across the person, account, war, notices and history. Seeing a refusal sentence alone does not establish that the command changed nothing.

**4. The D1557 plain-user round**

Run this for **Prowler, Kestrel and Saber**, on their own accessible Leave War. Saber’s foreign-person work is through Users; there is no master squadron-view menu to invent.

| Everyday task | Required complete route and sibling checks |
|---|---|
| Find and manage someone | Admin → **Users** → **Find a callsign or sign-in** → open row → change a permitted value → **Save** → reopen. Also type then **Cancel**, open another row, and close by pressing the row again. Check role/sign-in text and the two status dots. The dots are indicators, not extra action buttons. |
| Add someone | **Add a person** → callsign, initials, seat, CAT, **Post in** calendar → **Add person** or **Add person and sign-in**. Check Users, Quals, Leave War boundary dates and, where applicable, actual sign-in. |
| Handle a request | **Give access** → switch **On the roster / New person** → finish the appropriate path. Exercise **Cancel** and a separate **Refuse**. Check waiting count, access alert and the requester’s resulting screen. |
| Archive and return | **Archive** → search → **Archived** fold open/closed → archived row → post-in calendar → **Restore / Restore as …**. Separately **Save name**. Check dates and OIL in Leave War and the return prompt at sign-in. |
| Delete safely | **Delete** → read text → **Cancel** or close the row; reopen and verify it is no longer armed. On an expendable person, complete the second press and inspect retained past records. |
| Enter and decide leave | Leave War → **View** period → day cell → leave/duration controls → finish. Open **Approvals**, use **Approve / Refuse**, and exercise **Approve all …** with a small fixture. Check grid, Inputs, person window, balance and recipient bell. |
| Inspect a person’s history | Name puck or **My leave** → person window → year selector → leave entry → **Document**. Close the document itself, then its parent. Reopen through the grid and verify the same record. |
| Manage OIL | Day → **Grant OIL**, or **OIL** tab → credit entry → **Save**, **Cancel**, **Delete / Really delete?** on a test credit. Open its date calendar and OIL **Settings**. Check grid, person’s OIL figure and history before returning to the underlying page. |
| Change a posting | Day → **⋯ → Post out / Post in**; repeat from a single-person selection and an existing PO/PI cell. Exercise outcome chips, date calendar, confirmation **Cancel**, **Close**, and the posting’s own Undo. Check Users, war window and bell. |
| Navigate and configure the war | **View → + New period**, bidding-date control and **Exact days**, **Legend**, **Settings → Calendar… / Events… / + Counter**, **Rearrange the grid → Done**, group colour chooser, **Who wins when someone fits two**, and **Balances → Grades**. Open and close each applicable child; verify a small permitted change in its corresponding grid/count/year view. |

For each applicable overlay, reopen it and use each available exit separately: visible **Close/✕**, **Cancel**, **Done**, Escape, outside tap, and a confirmation’s safe answer. **Escape or outside tap must not be assumed to discard edits:** some Leave War fields save as they change or on closing. Record the actual contract and verify it by reopening.

Particularly important stacked paths:

- Users **Post in** calendar over an open editor.
- Posting Delete confirmation over the day/selection/posting sheet.
- Document viewer over a leave sheet or person window.
- OIL credit editor and calendar inside full-screen OIL.
- OIL opened over **Balances** or **Approvals**, then closed back to the correct page.
- Settings opening **Calendar…** or **Events…**, where the parent intentionally closes.
- A bell posting link opening Users while a search or another draft is present.

Capture the result while it is still visible, then inspect the sibling surface. A screenshot taken only after everything closes cannot prove that the nested Close control behaved correctly.

**5. Explicit negatives and limits**

These are conclusions from the source/rule inspection, not browser passes:

- **No additional home/grant/master screen door found.** Do not count those rows as walked, and do not report the expressly deferred interface as a new defect.
- **No top-bar Undo expectation for Add, Archive, Restore, Restore as, Delete or postings.** D350 explicitly excludes them. Posting-sheet Undo is separate.
- **No expectation that Users is filtered to the viewer’s squadron.** Both units appearing there is intentional for this step.
- **No expectation that a master’s ordinary Quals fields are immutable.** The protection is for account and account-like changes; the evidence explicitly narrows it.
- **No expectation that a member’s Tracker is read-only.** D121 permits normal editing and File operations; flex settings are the exception.
- **No blanket prohibition on every cross-squadron notice.** The evidence retains the shared-place holiday and same-command input-notice exceptions.
- **No new bell notification required merely because a bid was submitted.** The register deliberately uses Approvals rather than flooding the bell; proposed/unbuilt notification rows are not pass criteria.
- **No separate Leave War identity editor to add.** Seat, CAT and related roster identity come from Quals; the old Edit person path is gone.
- **No migration or old-data-only finding.** Every proposed fixture must be produced anew through the app or identified explicitly as command-level evidence.
- **No immediate server-style revocation expectation for an already-open tab.** The evidence leaves actor refresh and raw out-of-command storage concerns to the database step. Cross-tab scenarios here test newly written records and reopening, not an unbuilt server authority model.
- **No finding for the listed exclusions:** Plan replacing the admin grant, separate holiday lists, shared-place timezone restriction, master squadron menu, F2’s unforeseen-posting wording, or step-5 filtering.
- **No browser result, timing result or current test pass claimed.** The host still owes route preflight, the two walks with inspected pictures, and the command-level cases in scenario 16.

Rulings: none; this report proposes coverage and changes no product decision.

Walk: not run — scenario design only.