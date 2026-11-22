# Astra's scenario design — multi-squadron batch 1, steps 0–4 (18 Nov 26)

Head: Astra (`codex exec -m gpt-6-astra`, reasoning high, read-only), in an exported copy of `7e0a7c661`, brief `2026-11-18-multi-sqn-b1-scenarios-brief.md`, started Wed Nov 18 03:57:20 MPST 2026, finished 04:10. Saved as it came.

---

The roll-call needs more than a page-by-page separation check. Its largest gaps are the Tracker’s chart definitions and saved marks, alternative plans and issued versions, the separate availability readers, holiday writers outside the Holidays form, and the sign-out path when a save prevents reloading.

This is a scenario-design report for steps 0–4, not a verdict on the implementation. I made no changes and ran no app, tests or walk. The cases below identify what would disprove correctness; they do not assert that those failures exist.

I used the finder’s premise: **assume every existing line may be correct and the defect may be a missing call site.** No post-compaction handoff block was read.

**Roll-call additions and separations.** Source references below are relative to `raptor-port/src/`, unless stated otherwise.

| Add or separate | Visible door and observations required | Why the existing entry is insufficient |
|---|---|---|
| Tracker chart catalogue and chart contents | **Course**, its pencil menu and **+ Add course**; **Syllabus**, **Edit chart layout**, **Duplicate syllabus**; event details and **Show All → Edit**. Inspect names, events, lines and details, not just students. `tracker/components/Header.jsx:254–285`; `ShowAllPanel.jsx:94`. | Courses can be separated while their chart definitions remain shared accidentally. D2167 separates the entire Tracker; charts remain shared between courses *within* one squadron. |
| Tracker records and preferences | **Students → + Add**, selected student, marks, **Done on**, failed attempts, course start, pace, medical downtime, flex settings, **File → Import… / Export…**. Inspect the restored course, syllabus and student after returning. `tracker/components/SidePanel.jsx:296`; `Pop.jsx:24`; `Header.jsx:321`. | These use different stored records and remembered selections. A correct course title proves little about the data underneath it. |
| Tracker’s unsaved-edit exit | Sign out while **Edit chart layout** has an unsaved change; press **Save them**, **Discard them**, and **Stay** in separate attempts. `tracker/app/core.js:94`; `ui/logout.ts:28`. | Ordinary sign-out and an interrupted sign-out take different paths. This is essential to settle the builders’ disagreement. |
| Every holiday writer | **Calendar… → Holidays → + Add**, an existing holiday’s **Change a holiday**, **Save and add another**, **Delete**, **Import sheet → Add n holidays**; Leave War event cells/bands and **Settings → Events…**. `ui/HolidaysPanel.tsx:187,234,354,409`; `leavewar/ui/SettingsSheet.tsx:254`. | The new sentence is in the Holidays form. Other writers can change the same working-day facts without passing through that form. |
| Holiday readers beyond the grid | Inputs and SANS calendars, Leave War charging and Manning, schedule day classification, the OIL question/list, earned OIL, and already-published days. `leavewar/sync.ts`; `docs/feature-impact.md:820–835`. | A shared holiday must affect both squadrons’ calculations, not merely appear in both grids. An Off day must remain local. |
| Alternative plans and issued versions | **Plans**, **+ Alt Plan**, **Select**, **Delete plan**, **Done**; board preview’s **Switch to this plan**, **Load onto working copy**, **Keep editing**, **← Back to live copy**. `ui/DraftsModal.tsx:95–168`; `ui/SchedBoard.tsx:482–490`. | Live weeks, parked plans and published snapshots are different records. An apparently correct live week can conceal a foreign plan or restore the wrong day. |
| Other weeks and adjacent-week readers | Week/date navigation, board **Previous day**, **Next day**, **Jump to a date**, and the next-week preview where offered. Inspect Sunday/Monday rest warnings. `ui/SchedBoard.tsx:537,582,654`; `engine/weekctx.ts`. | A loaded week can be correct while an unloaded week, preview or adjacent-week lookup reads the other squadron’s saved dates. |
| Availability, separately by reader | Unarmed crew list; list with a seat armed; free-crew strip; day counts; **ALL** and **ALL AVAIL**; availability reasons; SANS offered/committed figures; Leave War **Manning**, **Available**, **Required**. `ui/palette-html.ts:16`; `engine/avail.ts:107`; `ui/AvailWindow.tsx:120`; `ui/html.ts:927`. | These do not all draw the same list. Correct names with an inflated count are still wrong. Published and working copies also deliberately read different states. |
| Planning-calendar records | Inputs calendar day title, **+ Note**, and the note’s **+ people** picker; edit, move and remove a note. `ui/InputsCal.tsx:1211`. | Planning notes and day remarks are not inputs. They need their own separation, persistence and Undo observations. |
| Inputs’ secondary people lists | Person filter, single-person picker, **Several** picker and its groups, historical/archived choices, and the people drawn on a shared input. `ui/InputsPage.tsx:77`; `InputWindow.tsx:795,828,846`; `PeoplePick.tsx:76`; `inputedit.tsx:57`. | Checking only the initial picker misses filters, grouped choices, saved selections and reopened records. |
| Medical’s three states and nested documents | **Medical**, its date selector, **+ Medical**, **Pending Upchit**, **Upchit Complete**, card/document buttons and the document’s own **Close**. `ui/MedicalView.tsx:145`. | Each state draws its own people. Closing a document must leave the correct parent window open; medical records also feed availability and Tracker downtime. |
| SANS’s secondary doors | **Highlight**, the opened day’s offered/committed people, **+ Commitment**, settings and shortage figures. `ui/SansCal.tsx:106,262`; `SansDay.tsx:63`; `sansadd.ts:33`. | An empty 149 SANS list is particularly useful: no picker or default may fall back to 142’s SANS people. |
| Leave War’s other pages and lists | **My leave**, person window, **Balances**, **Approvals**, **OIL**, periods/year selection, Manning counters and their membership choices, **Settings → ＋ Counter / ＋ Event row / Rearrange the grid**. `leavewar/ui/Chrome.tsx:161,238,462`; `SettingsSheet.tsx:265`; `BalancesPage.tsx:734`; `ApprovalsPage.tsx:586`. | A correct grid does not establish that balances, approval queues, membership lists or OIL records changed worlds. |
| Settings and their consumers | **Logic**; **Templates** and day/wave/duty templates; stores, cancellation reasons, look-ahead and section defaults; Quals columns; Inputs filing settings; SANS settings; Insights settings. `docs/data-schema.md:91`; `ui/InputsSettings.tsx:73`; `SansSettings.tsx:91`; `SchedBoard.tsx:692`. | These are separate squadron-owned settings. Test the resulting behaviour as well as reopening the setting. |
| Insights | **… → Insights** from Edit Schedule and the board; flying and not-flying people, hours, mission-role figures and blue/red sortie selections. `ui/SchedBoard.tsx:643`; `ui/insights-html.ts:20`; `engine/insights.ts:20`. | The “not flying” list enumerates the roster independently. Published figures must use their issued record rather than current working edits. |
| Bell, history and attention marks | Bell count, each line’s names/count, destination and seen state; History’s author and affected day; pending changes and gold dots. B10 and B12 in `docs/notifications-register.md:34,36`. | Correct storage ownership does not prove that recipients, counts, cached words, links or “seen” records are correct. History’s key spelling alone is not a finding. |
| Save status and page loading | The visible **Not saved** band and **Retry**, including over full-screen surfaces; first opening of Leave War/Tracker after another account. `storage/savewait.ts:17`; `ui/logout.ts:28`. | A prevented reload is a different sign-in boundary. A loading overlay must not briefly expose the previous person’s world underneath. |

The **people-list roll-call** should explicitly tick all of these, rather than treating “roster picker” as their representative:

- Schedule pilots, WSOs, SANS and Personnel; unarmed and armed lists; search matches; free crew; day-count breakdowns; ALL/ALL AVAIL membership and OIL earners.
- Each sign-off selector: **CUR CK**, **SKED CK**, **PLANNED BY**, **APPROVED BY** (`engine/publish.ts:1532,1725`).
- Inputs filters, single/Several pickers, grouped choices, saved input members, archived historical choices, and planning-note **+ people**.
- Medical’s down, pending and completed lists; SANS Highlight, offered and committed lists.
- Quals’ seat/category views and custom-column choices; Insights’ flying, not-flying and hours lists.
- Leave War rows and category groups, person windows, Balances, Approvals and their filters, Manning-counter membership, day-detail lists and OIL people.
- Tracker Students, **+ Add**, student selectors and import/export selections.
- Bell recipients and named subjects, History authors and affected people.
- **Admin → Users**, including Archived and account-linking choices, as a **deliberately community-wide list at this step**, not a separation failure.

Historical attribution, an issued record’s retained names and the shared holiday warning must not be mistaken for a foreign editable roster.

**Walk arrangement.** Use one walker on 1536-wide Chromium and the other on 402 × 874 WebKit with touch. Each starts with independent fresh storage and creates both squadrons’ test state by signing into that same storage successively. Neither walker should expect the other browser’s changes to arrive.

Use distinctive temporary names such as `W142…` and `W149…`, and reuse those fixtures. Use future dates for member filings and bids, with covering leave periods created through the app. The seeded July week is useful for administrator publication checks, but must not become a test of members filing into the past.

Each walker records the initial face of all five accounts:

| Sign-in | Required identity and role observation |
|---|---|
| `ad / a` | Saber; 142 home world; master admin. |
| `ad2 / a2` | Prowler; 142 home world; ordinary admin; independent seen state. |
| `us / us` | Ranger; 142 member; own leave row and member schedule face. |
| `ad9 / a9` | Kestrel; 149 home world; ordinary admin. |
| `us9 / us9` | Osprey; 149 member; own leave row and member schedule face. |

Reserve roughly 15 minutes for setup and this face census, 110–120 minutes for the ranked cases, 25–30 minutes for the additional plain-user round, and 10 minutes to reconcile evidence. These are estimates, not measured timings. A blocked or unfinished case remains explicitly unproved.

**Ranked scenarios.** Run the specialised cases first. In each case, capture the meaningful result in both browser sizes, including the other squadron’s unchanged counterpart.

1. **The Tracker is a whole separate world, including its chart definitions.**

   **Setup:** In 142, use **+ Add course** and **Duplicate syllabus** to make a disposable chart/course, add an own-squadron student and record one completion and one failed attempt. In 149, make a differently named course/chart and mark an own-squadron student.

   **Action:** Change an event’s details through **Show All → Edit**, change the disposable chart through **Edit chart layout**, and inspect a second course using that chart within the same squadron. Remove a disposable event after recording its marks. Visit the other squadron between changes. Exercise **Export…** and re-import that same squadron’s exported fixture through **Import…**, including cancellation of the preview.

   **EXPECTED:** Chart sharing works within the squadron; neither chart changes nor mark deletion reach the other squadron. Students, dates, details, layouts, flex settings and export selections belong to the current home world. Members retain ordinary Tracker editing and File access; flex settings remain admin-only. Sources: D2167, D121 narrowed by D1014; `docs/data-schema.md:91`.

   **Disproves correctness:** A foreign chart/event/student appears; an edit changes the other squadron’s chart or marks; export offers foreign courses; a member is incorrectly denied ordinary Tracker work.

2. **Same-tab sign-out replaces every world, including after an unsaved chart edit.**

   **Setup:** Leave identifiable changes in the week, Inputs, Leave War and Tracker, an unread bell line, and an available Undo step in 142.

   **Action:** Sign out normally and sign into 149 in the same tab. Inspect all six worlds named in the brief: week, Leave War, Tracker, Inputs, Undo and bell. Repeat 149 → 142. Then repeat with an unsaved **Edit chart layout** change, taking **Stay**, **Discard them**, and **Save them** separately. Use the desktop sign-out and phone drawer sign-out.

   **EXPECTED:** **Stay** retains the current session and edit. **Discard them** and **Save them** honour their stated choice before ending the session. The next account sees its own world, with no previous account’s Undo list. Returning to the first account preserves its saved work. Sources: D148; `tracker/app/core.js:94`; `ui/logout.ts:28–33`.

   **Disproves correctness:** The second person retains the first Tracker, even if the heading changes; any other world or overlay remains foreign; old Undo steps survive; Save or Discard does the opposite.

   **Save-wait branch:** Also attempt sign-out immediately after a real app save. If a genuine failed save can be reproduced through the authorised environment, inspect **Not saved → Retry**, then the next sign-in. A save still waiting must not be silently lost. If that state cannot be created without injected state, record **“save-wait sign-out not exercised”**. Going offline alone does not prove failure of browser-local saving.

3. **R32 names all affected published days, including unloaded weeks and the other squadron.**

   **Setup:** Through the app, publish a clean weekday in 142. Publish additional days in stages; keep some in a week no longer loaded. Do not add the proposed holiday yet.

   **Action:** From 149, open **Calendar… → Holidays → + Add**, choose **Public holiday**, and vary the date range. Capture the sentence before Save. Cancel between the staged fixtures.

   **EXPECTED:** For otherwise clean July fixtures, the exact forms are:

   - `This puts a published day out of date: 142's Wed 15 Jul. Publish it again so OIL is earned.`
   - `This puts published days out of date: 142's Wed 15 Jul and Thu 16 Jul. Publish them again so OIL is earned.`
   - `This puts published days out of date: 142's Wed 15 Jul and Thu 16 Jul; 149's Wed 15 Jul, Thu 16 Jul and Fri 17 Jul. Publish them again so OIL is earned.`

   Substitute the actual dates if those dates already have holiday facts. Check no warning for an unpublished day or one already non-working for the relevant reason, and no public-holiday warning after switching the form to **Off day**. Sources: D2184 R32; `ui/oilday.ts:57–65`; `leavewar/sync.ts:1236,1259`.

   **Disproves correctness:** A qualifying saved day is omitted; an unrelated day/squadron is included; the sentence is stale after changing dates/kind; singular/plural or date grouping misstates the fixture.

4. **Every holiday writer produces one shared holiday; an Off day stays local.**

   **Setup:** Have covering leave periods in both squadrons and clean dates. Make one holiday through **+ Add**, one through an Event row, and a disposable import fixture through **Export sheet** and the normal file-editing/import flow.

   **Action:** Exercise **Save and add another**, **Import sheet → Cancel**, then **Add n holidays**; change a holiday’s dates/name/kind and delete a disposable one. Inspect **Settings → Events…** and both squadrons’ calendars. Try opening the shared holiday from the other squadron.

   **EXPECTED:** Accepted public-holiday changes agree across both squadrons at Home base; Off days affect only their owner. Cancelled additions/imports create nothing. A holiday waiting for a covering period must not later save an abandoned or superseded form. Sources: D2160 F1; `docs/feature-impact.md:827–832`; `ui/HolidaysPanel.tsx:397–414`.

   **RECORD exactly:** Whether the other squadron can edit/delete the inherited holiday, what refusal appears, and what warning the non-form writers display. The supplied material does not settle every one of those interface policies.

   **Disproves correctness:** An accepted change leaves contradictory holiday facts, creates an unintended private duplicate, changes the other squadron’s Off days, or saves after cancellation.

5. **Holiday notifications count and route each squadron’s own unanswered inputs.**

   **Setup:** Make eligible working-day inputs, then add a shared holiday. Reuse three dates to obtain 142/149 unanswered counts of **1/0**, **0/1**, and **1/2**.

   **Action:** Inspect Saber, Prowler and Kestrel’s bells and open each holiday line. Answer only 149’s questions, then inspect both 142 admins again. Reverse the answering order on another date. Inspect Ranger and Osprey’s own relevant questions.

   **EXPECTED:** An admin receives the B10 line only where that admin’s squadron has inputs needing answers; the count and opened OIL list contain only those inputs. Answering one squadron does not answer the other. Each reader’s seen state remains independent. Source: `docs/notifications-register.md:34`.

   **Disproves correctness:** Foreign inputs appear, counts are combined, the wrong list opens, one account’s viewing dismisses another’s line, or answering 149 extinguishes 142’s outstanding work.

   For a newly stale published day with **no unanswered inputs**, **RECORD exactly** the bell behaviour. Do not invent an additional notification requirement from R32.

6. **OIL creation and withdrawal remain local and use the correct Logic.**

   **Setup:** Give both squadrons work on the same eligible date. Set deliberately different OIL thresholds through each squadron’s **Logic**, so the expected credit differs for a chosen work span.

   **Action:** Publish each day; inspect **OIL Earn**, the day’s OIL list, the Leave War cell, person balance and **OIL** page. Change only 149’s eligible work or earning selection and publish its amendment. Remove that eligibility and republish. Reopen 142 after each step.

   **EXPECTED:** Each person’s credit uses their own squadron’s applicable settings and published evidence. A reverse sweep withdraws only the affected credit. Working edits and later Logic changes must not silently rewrite an earlier issued record. Sources: D2160 Q1/F23; `docs/feature-impact.md:808–811`; `ui/AvailWindow.tsx:166–171`.

   **Disproves correctness:** 142’s credit changes when only 149 is amended; a credit is duplicated; a removed credit survives its required republication; the balance disagrees with its evidence.

7. **Availability agrees across every reader without counting foreign people.**

   **Setup:** Choose an otherwise free own pilot and WSO. Record the baseline lists and counts. Use the app to add an overlapping absence, then remove it. Initially leave 149 with no SANS; later add one own SANS person through the normal people controls.

   **Action:** Inspect the unarmed and armed crew lists, free-crew strip, day counts and **ALL AVAIL**. Exercise **ALL** and **ALL AVAIL** in the relevant supported flight/sim, duty and ground-programme positions. Check SANS offered/committed counts and Leave War Manning on the same date.

   **EXPECTED:** Each reader uses its own squadron’s eligible population and its stated time/day meaning. The absence changes only the relevant availability; “free all day” and “free for this seat” need not have equal counts, but their reasons must explain the difference. An empty own list stays empty. Sources: `engine/avail.ts:107`; `engine/faceattrs.ts:28`; `ui/AvailWindow.tsx:120`; `ui/SansCal.tsx:262`.

   **Disproves correctness:** A foreign person is offered, even greyed; a total includes foreign people; an empty SANS picker defaults to 142; removal of the absence leaves stale availability.

8. **Publish, amendment, plans and restores all stay with their day and squadron.**

   **Setup:** On the same date, give 142 and 149 visibly different rows and sign-offs. Publish each. In one squadron, make **+ Alt Plan** and a pending working edit.

   **Action:** Open **Plans**, preview/select the alternative, return with **← Back to live copy**, inspect an issued version, choose **Load onto working copy**, first **Keep editing**, then confirm loading in a separate attempt. Publish an amendment. Inspect the member’s issued face, pending changes and History.

   **EXPECTED:** All four sign-off selectors offer the proper own-squadron candidates. Plans and versions belong to the selected own day. Loading a version changes the working copy, not the saved issued version; an amendment changes only its squadron. Sources: D2132; `engine/publish.ts:1532,1725`; `ui/DraftsModal.tsx:118`; `ui/SchedBoard.tsx:471–490`.

   **Disproves correctness:** A foreign plan/signatory/version appears; restoring overwrites the other squadron; unpublished edits appear as issued; Cancel/Keep editing discards work.

9. **Week navigation and adjacent-week checks do not read another squadron’s dates.**

   **Setup:** Make distinguishable work on a Sunday and the following Monday in each squadron, with a rest issue in only one.

   **Action:** Navigate by week arrows, **Jump to a date**, board **Previous day / Next day**, and the available next-week preview. Visit a previously untouched week, return, sign out, and repeat in the other squadron.

   **EXPECTED:** Each route lands on the same own records. Adjacent-week warnings use that squadron’s work and settings. An untouched 149 week does not acquire 142’s seeded schedule. Sources: `engine/weekctx.ts`; `engine/weekstash.ts`; `docs/feature-impact.md:138,791–800`.

   **Disproves correctness:** Navigation changes the apparent owner, an unloaded week loses edits, or 142’s Sunday creates 149’s Monday warning.

10. **Inputs stay local through every entry, display and edit door.**

   **Setup:** As each member, file one future own input. As each admin, file one **Several** input and one supported ALL/ALL AVAIL input.

   **Action:** Reopen through **List**, a calendar bar, the opened day and the schedule’s corresponding row. Change membership through the schedule where supported, then reopen the input. Exercise person filters and archived choices. Change one squadron’s **Members may file duties for others** setting and test the corresponding member.

   **EXPECTED:** These are views of the same input, with consistent membership, filer, dates and marks. Choices remain local. Changing 149’s filing setting does not change Ranger’s permission. Sources: D2087/D2132; `docs/feature-impact.md:175`; `ui/InputsSettings.tsx:89–99`.

   **Disproves correctness:** A foreign person/input is selectable or displayed; schedule edits create an inconsistent copy; a setting changes the other member’s ability to file.

11. **Medical changes reach the right availability and Tracker, including document close.**

   **Setup:** Give an own-squadron Tracker student a medical record through **+ Medical**, with a harmless attachment supplied through the normal file control.

   **Action:** Inspect Medical at the relevant date, the input, the schedule and that student’s Tracker downtime. Complete the normal upchit path and inspect **Pending Upchit / Upchit Complete**. Open the document and press its own **Close**, then close the parent.

   **EXPECTED:** The same person and dates agree across these readers; only the appropriate own-squadron student is affected. Closing the document closes that layer first. Sources: `ui/MedicalView.tsx:1–20,94`; Tracker seam; D1557.

   **Disproves correctness:** A foreign medical card appears; Tracker downtime reaches another student/world; availability stays stale; document Close dismisses the wrong window.

12. **Leave War means the whole war, not merely its roster.**

   **Setup:** Use a future covering period in each squadron. Ranger and Osprey each make an own-row bid. Give the two worlds distinguishable period settings and one Manning counter.

   **Action:** As the respective admin, use **Approvals → Approve / Refuse**, inspect **Balances**, the person window, **My leave**, the grid and corresponding input. Open the counter’s membership choices and inspect **Available / Required**. Change year/period, leave the page and return.

   **EXPECTED:** Each member bids only on their own row. Each decision changes the correct request and the same balance everywhere it is shown. Periods, counter membership and settings are local. Sources: D166, D2087; `leavewar/ui/Chrome.tsx:161,238`; `ApprovalsPage.tsx:586`; `BalancesPage.tsx:734`.

   **Disproves correctness:** Foreign requests or people appear; one world’s period/counter settings overwrite the other; balances disagree after a decision; the member lands on the previous account’s row.

13. **Squadron settings survive a round trip and govern only their own consumers.**

   **Setup:** Through their existing controls, set contrasting temporary values in the two squadrons: Logic, one day/wave/duty template, a Quals column, Inputs filing settings, SANS calendar settings and an Insights choice.

   **Action:** Apply the template, use the changed rule, inspect the Quals column and relevant member behaviour, then return to each settings window after another squadron has saved. Include the stores/cancellation/look-ahead/section-default controls in the settings read-back sweep.

   **EXPECTED:** Each value and consumer stays with its owner; member/admin distinctions remain correct. A displayed saved value with unchanged consumer behaviour is a failure. Sources: `docs/data-schema.md:91`; D2122/D2132; `ui/InputsSettings.tsx`; `ui/SansSettings.tsx`.

   **Disproves correctness:** A setting follows the last person to save, a template inserts foreign content, a custom column crosses worlds, or settings reopen correctly while the schedule uses the other squadron’s values.

14. **Planning notes, Insights, History and attention marks identify the correct world.**

   **Setup:** Make a distinctive day title and **+ Note** with **+ people** in each squadron. Give one own aircrew member a sortie and leave another not flying.

   **Action:** Reopen/edit the notes, inspect their people picker, then open **Insights** from both schedule doors. Change one mission-role selection and inspect its figures. Open History and pending changes before and after Undo.

   **EXPECTED:** Notes/day remarks are local records. Insights uses the proper own roster and the displayed working/issued state. History and attention marks name the correct author, day and change. Sources: `ui/InputsCal.tsx:1211`; `engine/insights.ts:20`; `ui/insights-html.ts:20`; `docs/data-schema.md:91`.

   **Disproves correctness:** A note/picker or “not flying” list contains foreign people; one squadron’s annotation changes the other’s figures; a History link opens the wrong day.

15. **New people and ordinary posting outcomes reach all the correct readers.**

   **Setup:** Use **Quals → + Add person**, which opens **Admin → Users → New person**, to create disposable own-squadron people. Create the SANS/Personnel fixture needed above. Give one disposable person an ordinary supported posting-out outcome.

   **Action:** Inspect all relevant own pickers and the other squadron’s corresponding lists. Run the posting through its normal date/control path. Open its B12 bell line. Exercise Archive/Restore on a disposable person and inspect both current and historical views.

   **EXPECTED:** The new person belongs to the intended home world; current lists react to the dated status, while issued history retains what it should. B12 reaches only the posting squadron’s admins; its link opens the correct Users row, or is inert for deletion. Sources: `ui/QualsPage.tsx:1192–1208`; `docs/notifications-register.md:36`; D288.

   **Disproves correctness:** A new person leaks into foreign pickers, restore changes the wrong record, posting notifies the other squadron’s admins, or its link selects another person.

   Admin Users showing both squadrons remains expected at this step. Do not use a future transfer or home-selector feature to construct this fixture.

16. **Reload, a fresh tab and another actor’s write preserve the correct records and Undo ownership.**

   **Setup:** Finish saved edits in both squadrons, including a plan, input, credit, holiday and Tracker mark.

   **Action:** Reload and inspect both worlds. Then open a fresh tab on the same origin in the **same browser storage context**, leaving the first tab idle. Repeat with a second tab opened before the first tab’s new write: make distinct own-squadron writes, then reload both and inspect both records. Separately, let Prowler make a 142 change; after signing in as Saber, make and Undo a new Saber change. Repeat after Kestrel has written in 149.

   **EXPECTED:** Saved new data survives; writing one world does not erase another’s records. Undo contains only the current person’s current-session steps and does not reverse Prowler’s or Kestrel’s change. Source: D148; `docs/data-schema.md:49–60`; `state/undo-wire.ts`.

   **Disproves correctness:** A first write reseeds or overwrites the other world, a reload loses saved work, or Undo reverses another actor’s change.

   This does not require live server synchronisation. A separate browser profile/device is not the persistence counterpart for this pre-database build. Same-record conflict protection with a retained Undo stack needs a genuinely supported concurrent-state setup; sequential sign-outs clear that stack and cannot prove it.

**Meaningful orders to run both ways.** These are order variants of the cases above, not a second independent suite.

| Pair | First order | Reverse order and required observation |
|---|---|---|
| First opening of Tracker / account world | Open 142 Tracker, sign out, open 149. | Open 149 first, then 142. Repeat with Tracker never opened by the departing account. |
| Dirty chart / sign-out | Edit chart, then sign out. | Start sign-out, choose **Stay**, then edit/save and sign out again. Exercise all three choices. |
| Save / sign-out | Save settles, then sign out. | Sign out immediately after saving; separately retain the genuine save-wait limitation described above. |
| Public holiday / publication | Add 149 holiday, then publish 142. | Publish 142, then add 149 holiday: correct R32 warning and republication effect. Swap squadron roles. |
| Input / public holiday | File on a working day, then add holiday. | Add holiday, then file: the OIL question, list and recipients must converge. |
| Holiday removal / republication | Remove holiday, then republish. | Republish while holiday exists, then remove it: inspect the newly stale record and required withdrawal. |
| Holiday writer / receiving-world load | Open the receiving war, then add from the other squadron. | Add before the receiving war has been opened; first load must derive the same facts. |
| Missing period / holiday save | Create covering period, then save holiday. | Attempt Save first, then create the period; also cancel/change the waiting form before covering it. |
| 142 / 149 OIL answers | Answer 142, inspect 149. | Answer 149 first, inspect 142, including unequal counts. |
| Logic change / publication | Change Logic, then publish. | Publish, then change Logic: distinguish the issued values from the next publication. |
| Absence / assignment | File absence, then inspect/attempt assignment. | Assign first, then file absence: correct warnings and all availability readers. |
| Input membership / row edit | Edit the input, then its schedule row. | Edit the row, then reopen the input: one consistent record. |
| Plan selection / pending edit | Edit live day, then select a plan. | Select plan, then edit; returning/restoring must preserve the stated working-copy rules. |
| Unloaded week / change | Navigate away, then change related facts. | Change first, then navigate away/back: warnings, stored publication and R32 still find the day. |
| Another actor’s write / own Undo | Other actor writes, current actor makes a new change, then Undo. | Current actor changes, other actor writes in a concurrent supported session, then Undo; otherwise mark that retained-stack variant unproved. |
| Medical / Tracker opening | File medical, then open Tracker. | Open Tracker first, then file medical and return; same own student and dates. |
| Archive/posting / historical view | Issue the day, then change the person’s status. | Change status, then inspect/create the next eligible working day; do not demand historical names disappear. |
| First write / fresh tab | Write, then open fresh tab. | Open tab before the write, make a distinct later write there, reload both: neither new record may be erased. |

Also reverse **Undo → Redo** for one schedule edit, one input, one planning note and one Leave War change. Sign-out must clear both histories; returning after sign-out is not a valid way to retain an old Undo fixture.

**The additional plain-user round — D1557.** Do this after the targeted cases, as everyday tasks rather than assertions about internal state. Press every visible opener and closer encountered, including icon-only Close buttons, not merely the principal Save.

| Area | End-to-end task and controls to press | Other places to inspect |
|---|---|---|
| Edit Schedule | Plan a day; open each relevant row/people picker and detail window; fill the four sign-offs; open and cancel Publish once, then publish; make and issue an amendment. Open **Plans**, use **Select**, and close through **Done** and **×** on separate visits. Open/close pending changes, History and Insights. | Board, member’s issued schedule, Inputs where a row came from an input, History, sign-offs, OIL evidence. |
| Scheduler Board | **Jump to a date**, previous/next day; add/edit work; open search and armed crew picker; place a person; inspect warnings and ALL AVAIL; enter and leave **OIL Earn**. Open **Templates**, **… → Insights**, plan/version previews and **← Back to live copy**. | Edit Schedule’s same day, day counts, availability reasons, issued face after publication. |
| Inputs | **+ Input**; choose person/type/dates; open the type **?**; try **Several**; save, reopen through List and Calendar, edit and remove a disposable input. Open attachment, close document, then parent. Open settings and use both **Cancel** and **Save**. Include Medical and a SANS commitment. | Calendar bar and opened-day card, schedule row/Unavailable, bell, Medical, SANS, Leave War and Tracker where applicable. |
| Leave War | Member bids; admin opens **Approvals**, decides it, follows the date to the grid and returns. Open **My leave**, person window, **Balances**, **OIL**, period selector, Manning and Legend. Open settings, Calendar and Events; close each nested layer independently. | Input, own member row, all balance presentations, bell, another period/year, schedule availability. |
| OIL | File eligible work; answer its question; reopen from bell/tag/day list; publish; inspect credit; alter earning through **OIL Earn** and issue the required amendment. Enter/leave the mode and open/close the evidence and person windows. | Day list, ALL AVAIL earning section, Leave War credit, person balance, OIL page, unchanged other squadron. |
| Tracker | Select course/syllabus/student; add an own student; mark an event and date/failure; open Info, **Show All**, details and Legend. Edit details with **Cancel** then **Save**. Enter/leave **Edit chart layout**. Open/cancel import and export dialogs, then perform the same-world round trip. Finish with dirty-chart sign-out. | Same student’s chart/details/export, another same-squadron course using that chart, medical downtime, other squadron’s intact Tracker. |

For each opened surface, record its actual **Close / × / Cancel / Done / Back** controls and press each one on a separate opening. Where Escape or outside-tap dismissal is supported, exercise it too. On the phone, inspect the bottom controls with the keyboard open and after scrolling. A close must remove the intended layer, leave its parent usable and save or discard exactly as stated.

**Explicit negatives — source/design checks with nothing further to add.**

- The existing roll-call already names the main schedule faces, ordinary editing, Publish/amendment, basic Undo/Redo, Inputs list/calendar, Quals, Logic, Search and History. I added distinct states and consumers rather than proposing duplicate page-presence checks.
- Admin Users currently showing both squadrons is explicitly deferred filtering, not a failure. The same applies to the home-squadron selector, Admin Squadrons, Schedules menu, “142 ▾”, Request access’s squadron choice, board number, print/export naming and store stamp.
- No migration/back-compat scenario is proposed for old unqualified rows. Persistence cases concern data newly written by this build.
- No scheduler-without-admin case is proposed: D785 excludes that role. Members remain essential, especially for their own leave/input permissions and normal Tracker editing.
- No borrowing, transfer-to-another-squadron or detachment workflow is proposed.
- A public holiday appearing in both squadrons at Home base is expected. It is not evidence of leakage. An Off day crossing that boundary would be.
- Retained issued history is not required to change when the working roster, input or Logic changes. Compare equivalent working or issued states.
- Ordinary sign-out clears Undo by contract. A later sign-in cannot prove that the earlier session’s Undo survived another person’s work.
- No cross-device real-time sharing requirement is introduced before the database step.
- No raw-NUL CI finding is proposed.
- The failed-save sign-out branch and any retained-stack concurrent Undo variant must remain explicitly unproved if the permitted app-driven setup cannot reach them.
- Nothing here establishes a rendered pass, a permission-gate pass or completion of the FULL check. This is the scenario-design contribution only.

Rulings: none added. Files changed: none.

