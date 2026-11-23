# The night of 24 Nov 26, job 4: scenarios by GPT-6 Astra (saved whole)

**Who read:** GPT-6 Astra (`codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`), run 24 Nov 26,
03:58 to 04:14 MPST. **What it read:** an exported copy of `fcca051f0`, pictures left out, this branch's `HANDOFF.md`
block taken out, the change as a patch of `54772307c..fcca051f0`. **Blind to:** the builders' notes and the walk. Its
answer follows, unchanged.

---

FULL scenario design for exported copy **fcca051f0**, against **54772307c**. These are instructions for the walker, not executed results. No files changed. Other handoff blocks appeared during the required opening read; I excluded them.

**Both sizes** means desktop **1536-wide Chromium** and phone **402-wide WebKit**. Use fresh browser profiles with persistent storage, creating records through app controls. Give the squadrons visibly different courses, students and marks.

For each saved change below, check it immediately, after returning from another squadron, and after reload. Where Undo is offered, also run **Undo → Redo → reload**, then separately **Undo → reload**. Do not expect Undo for actions that intentionally lack it. Exercise paired field changes in both orders. An inaccessible timing overlap or setup is **not exercised**, never a pass.

**S1 · Delete an event shared by courses · priority high · both sizes**

- **Who / setup:** Master admin; two courses in 142 share a syllabus and have marks on the same event. Give 149 distinct marks.
- **Press:** In 142, Edit chart layout → delete that event → Save changes → immediately pick 149. Return to both 142 courses; reload.
- **EXPECTED:** Deletion removes that event’s records from both affected 142 courses only. D124, D474, D2167, D2395.
- **Disproved by:** Loss in 149, resurrection in 142, or one affected course escaping deletion.

**S2 · Restore a deleted course after a pick · priority high · both sizes**

- **Who / setup:** Master admin; create, grade and delete a disposable course in each squadron, retaining another course.
- **Press:** In 142, Course pencil → Reorder courses → Restore list. Close it; pick 149; reopen and restore its course. Reverse the sequence; reload.
- **EXPECTED:** Each list and restoration belongs to its squadron; restored students retain their marks. D128, D2167, D2395.
- **Disproved by:** Foreign deleted courses, restoration into the wrong squadron, or missing marks.

**S3 · Export after changing squadron · priority high · both sizes**

- **Who / setup:** Master admin; distinct courses, charts and student marks in 142 and 149.
- **Press:** Pick 149 → Tracker → File → Export. Export charts alone, then charts with students. Repeat in 142; inspect the exported copies.
- **EXPECTED:** Each copy contains only its selected squadron’s chosen material; charts-only excludes students and marks. D2395; export choices and contents must agree.
- **Disproved by:** Foreign records, omitted selected records, or student data in a charts-only copy.

**S4 · Import over a shared syllabus · priority high · both sizes**

- **Who / setup:** Master admin; export a chart, then change it. Two 142 courses use that syllabus; 149 holds distinct marks.
- **Press:** Import the earlier copy into 142, choosing replacement. Inspect both courses and 149. Repeat using add-as-new; reload.
- **EXPECTED:** Replacement changes only its destination squadron. Chart import preserves marks, including those temporarily hidden by the replacement chart. D132, D474, D2395.
- **Disproved by:** Lost marks, alteration of 149, or replacement of the wrong syllabus.

**S5 · A valid import interrupted · priority high · both sizes**

- **Who / setup:** Master admin; a valid exported file containing charts and students.
- **Press:** Start Import in 142. At each reachable file or confirmation step, attempt a pick of 149. Repeat with cancellation and confirmation.
- **EXPECTED:** An import abandoned by a completed pick cannot resume against the new squadron. D2395. Record where a native picker prevents switching.
- **Disproved by:** A late confirmation imports into 149 without a new import there.

**S6 · Imported copies remember their own place · priority high · both sizes**

- **Who / setup:** Master admin; use Export and Import to place copies of a course in both squadrons.
- **Press:** Choose different students and charts in each. Alternate squadrons, leave Tracker and return, then sign out and in.
- **EXPECTED:** Remembered selections identify the correct person and course within the correct squadron. D376, D2395.
- **Disproved by:** A copied course makes a remembered selection open another squadron’s records.

**S7 · Event details and reset after a pick · priority high · both sizes**

- **Who / setup:** Master admin; corresponding events have different titles, hours, crews and prerequisite notes.
- **Press:** Open Details and Show All. Edit event details; try Cancel, Save and Reset to doc separately. Pick the other squadron before and after each completed action.
- **EXPECTED:** Chart, details and Show All agree within their squadron. D2395; two surfaces must agree.
- **Disproved by:** Stale details, a foreign reset, or a detail window saving into the next squadron.

**S8 · Flex, pace and date settings · priority high · both sizes**

- **Who / setup:** Master admin or Plan holder; different pace, end dates and lull periods in each squadron.
- **Press:** Change pace and End dates A/B; add, remove and Copy to… a lull. Switch squadrons between changes. Separately open Flex settings as admin and member.
- **EXPECTED:** Values and calculations stay with their squadron; permitted Undo stays there. Members see Flex settings read-only. D372, D1014, D2395.
- **Disproved by:** Foreign values, cross-squadron Undo or editable member Flex settings.

**S9 · Delete a person with training records · priority high · both sizes**

- **Who / setup:** Authorised admin; create a disposable person through Users and enrol them in unfinished and completed courses.
- **Press:** Visit the other squadron and return. Delete the person through Users; inspect both courses, the other roster and the reloaded result.
- **EXPECTED:** Unfinished enrolments are removed; completed training remains. Other squadrons are unaffected. D981, D2395.
- **Disproved by:** Completed records disappear, unfinished enrolments remain, or another person’s records change.

**S10 · Medical and last-flown readers · priority high · both sizes**

- **Who / setup:** Admin; enrol different people in each squadron and file a medical through Inputs for one.
- **Press:** Inspect that student’s Tracker information. Change syllabus and currency last-flown dates separately; switch squadrons and return.
- **EXPECTED:** Medical down days and last-flown dates feed the correct person’s calculations, retaining their distinct effects. D1005, D2395.
- **Disproved by:** Foreign medical periods, dates belonging to another student, or the wrong calculation changing.

**S11 · Catalogue writers beyond ordinary marks · priority high · both sizes**

- **Who / setup:** Master admin; disposable courses and syllabi.
- **Press:** Through the Course, Syllabus and Crew controls, exercise every offered add, rename, duplicate, reorder, delete and restore action. Attempt a pick between opening and confirmation; repeat by picking first.
- **EXPECTED:** Finished actions belong to their authorised squadron; abandoned confirmations cannot act on the destination. D128, D2395.
- **Disproved by:** Foreign renaming, deletion or restoration, or stale lists after reload.

**S12 · Marks across every reader · priority high · both sizes**

- **Who / setup:** Member on their own squadron, then admin with Plan; enrol students through the roster picker.
- **Press:** Enter a grade, failed attempt and date. Inspect chart, information, Failures, attempt history and totals. Change squadron and return; Undo and Redo.
- **EXPECTED:** Every reader agrees about the selected student’s records. D2395; two surfaces must agree.
- **Disproved by:** Wrong-student marks, foreign failures or disagreement between totals and underlying marks.

**S13 · Save before a pick · priority high · both sizes**

- **Who / setup:** Master admin, then Plan holder; add an unsaved event through Edit chart layout.
- **Press:** Pick 149 → Save them. Return to 142 and inspect another course sharing the syllabus.
- **EXPECTED:** The question names 149; saving finishes in 142 before 149 becomes usable. D2318, D474, D2395.
- **Disproved by:** The event lands in 149, disappears from 142, or updates only one shared course.

**S14 · Stay, Escape, Discard and a fresh edit · priority high · both sizes**

- **Who / setup:** Same roles; make a recognisable unsaved structural edit.
- **Press:** Pick another squadron → Stay. Repeat and press Escape. Repeat → Discard them. Return, make a different edit and save.
- **EXPECTED:** Stay preserves the pick and draft; Discard removes the draft and its unsaved indication. D2318, D2395.
- **Disproved by:** Stay navigates, discarded work reappears, or the later save includes it.

**S15 · View-only destination with a hidden draft · priority high · both sizes**

- **Who / setup:** Admin or member with View of 149; leave a Tracker draft on 142, then open Inputs or Help.
- **Press:** Pick 149 using the top bar and separately the phone menu. Exercise Save them, Discard them and Stay.
- **EXPECTED:** The question appears over the current page; the phone menu closes first. A completed pick offers only 149’s View-only Sched and Help. D2388, D2381.
- **Disproved by:** Missing or obscured question, a foreign Tracker offered, or wrong draft outcome on return.

**S16 · The bell changes squadron · priority high · both sizes**

- **Who / setup:** Admin with Plan or master admin; create an access request for the other squadron through Request access.
- **Press:** Leave a Tracker draft. Open the request through the bell; separately try Stay, Save them and Discard them.
- **EXPECTED:** The same safeguard applies; an accepted navigation opens the correct Users waiting list. D2318, D2325, D2388, D2395.
- **Disproved by:** Navigation behind Stay, wrong waiting list, bypassed question or a late jump after cancellation.

**S17 · Undo waiting in another squadron · priority high · both sizes**

- **Who / setup:** Master admin; different undoable Tracker changes in both squadrons.
- **Press:** Alternate squadrons; press Undo/Redo, then repeat by tabbing to those buttons and pressing Enter. Undo in 142, make a new change in 149, and return.
- **EXPECTED:** Each reversal affects only its own squadron. D372, D2395. **Question:** RECORD exactly whether 142’s previous Redo remains available.
- **Disproved by:** Foreign records change or the offered description disagrees with the action.

**S18 · Rapid picks during loading · priority high · both sizes**

- **Who / setup:** Master admin; three squadrons with distinctive records.
- **Press:** During first Tracker opening, pick 142 → 149 → third squadron; repeat 142 → 149 → 142. Repeat after first load and while Tracker is hidden.
- **EXPECTED:** The last accepted pick wins; loading does not expose usable controls over foreign records. D2395.
- **Disproved by:** An earlier load wins later, heading and records disagree, or the next mark saves elsewhere.

**S19 · A write finishing during a pick · priority high · both sizes**

- **Who / setup:** Master admin or Plan holder.
- **Press:** Separately finish a grade, failed attempt and event deletion; immediately pick another squadron. Return and reload. Reverse the order: pick, wait for readiness, then write.
- **EXPECTED:** Accepted writes finish in their originating squadron. D2395.
- **Disproved by:** Lost accepted work or late foreign writes. Record “overlap not exercised” if ordinary presses cannot hit the overlap.

**S20 · Failed save before switching · priority high · both sizes**

- **Who / setup:** Use the documented `?savefail` option with persistent storage; create a Tracker draft.
- **Press:** Pick 149 → Save them. Separately try Export → Save then export and sign out → Save them. Remove the failure option, retry and reload.
- **EXPECTED:** Failed work is not represented as saved or silently lost through navigation. D2318; the save-failure contract.
- **Disproved by:** Lost draft, false success, or an export claiming to contain unsaved changes.

**S21 · Every Tracker window left open · priority high · both sizes**

- **Who / setup:** Master admin; open each window separately.
- **Press:** Attempt a pick with grading, attempt history, event details, Edit events/flow text, Show All, reorder, Restore list, Export, lull selection/copy and Flex settings open.
- **EXPECTED:** A completed pick leaves no old-squadron window able to write into the new one. D2395. Record windows that prevent the pick.
- **Disproved by:** A surviving confirmation saves, deletes or restores into the destination.

**S22 · A gesture or timer survives the pick · priority high · both sizes**

- **Who / setup:** Admin with Plan.
- **Press:** Use Find, chart dragging, pan/zoom and a recently saved mark. Pick another squadron as soon as controls allow; wait for delayed search, highlight and save indications; mark an event.
- **EXPECTED:** Delayed work belongs to its original chart; the destination remains usable and correctly labelled. D2395; status and saved result must agree.
- **Disproved by:** A late move, highlight, save indication or mark belongs to another squadron.

**S23 · A newly created squadron · priority high · both sizes**

- **Who / setup:** Master admin; Admin → Squadrons → + New squadron, choosing its first admin.
- **Press:** Open its Tracker before adding records. Add its first course and student, save, visit two other squadrons and return.
- **EXPECTED:** It cannot inherit another squadron’s saved training; its first admin receives Plan of it. D2308, D2395.
- **Disproved by:** Copied live marks, a first save elsewhere, or inability to finish the first-course workflow.

**S24 · Member view, clean and dirty · priority high · both sizes**

- **Who / setup:** Plan holder, then master admin; open 149’s Tracker.
- **Press:** Switch to member view and back with a clean chart, then a draft. While held, attempt Undo/Redo and pick 142; exercise the offered answers.
- **EXPECTED:** View switching alone asks nothing and preserves the draft. The held cover explains how to return; a later pick still asks. D2388, D2395.
- **Disproved by:** Lost draft, foreign chart exposed, writes through the cover or wrong chart restored.

**S25 · Rights changed in another tab · priority high · both sizes**

- **Who / setup:** First tab: Plan holder on 149. Second tab: master admin.
- **Press:** Lower Plan to View, remove access or remove master status in the second tab. Inspect and attempt a mark in the first; reload it. Repeat using sign-out/sign-in within one tab.
- **EXPECTED:** Refreshed access permits only the correct pages and records. D2381, D2395. **Question:** RECORD exactly what happens before refresh; live tabs do not synchronise in this build.
- **Disproved by:** Forbidden access or writes after refresh. Stale-tab behaviour alone does not establish a new regression.

**S26 · Midnight and a sleeping page · priority high · both sizes**

- **Who / setup:** Admin with Plan; recognisable training and tomorrow’s leave created through controls.
- **Press:** Leave Tracker open across midnight, clean and dirty. Repeat with Leave War open and with sleep/wake. Pick another squadron afterwards.
- **EXPECTED:** Leave War’s date-dependent signs advance together; training stays isolated. D1266, D2395.
- **Disproved by:** Mixed “today” signs, lost draft or foreign writes. A person’s midnight transfer remains unexercised: its setup control is not built here.

**S27 · Discard, then cancel the course name · priority high · both sizes**

- **Who / setup:** Member or admin; unsaved structural chart edit.
- **Press:** Course pencil → Add course → Discard → cancel the name. Repeat with Rename course. Make a fresh edit, save and reload.
- **EXPECTED:** The first Discard removes the original edit independently of cancelling the later name. The Discard contract.
- **Disproved by:** Dropped work remains drawn as saved, reappears after reload or returns in the fresh save.

**S28 · Discard followed by another route · priority high · both sizes**

- **Who / setup:** Same roles and draft.
- **Press:** Repeat through Add syllabus, Duplicate syllabus, Delete course, Delete syllabus, Import and course/syllabus selection wherever a discard question is offered. Try cancellation, invalid/duplicate names and completion; then pick another squadron.
- **EXPECTED:** Cancel before Discard preserves work; accepted Discard drops it regardless of the next action’s success. Discard contract; D2395.
- **Disproved by:** Lost work on Cancel or discarded work restored by a failed second action.

**S29 · A role change hides the rest of one Save · priority high · both sizes**

- **Who / setup:** Master admin; give Hunter Plan of 149.
- **Press:** Change Hunter from Admin to Member and change his sign-in name; Save once. Read Undo, Undo, read Redo, Redo and reload. Reverse field-entry order.
- **EXPECTED:** The description names everything that the one Undo actually reverses, including access changes. D2396(o), explicitly covering role changes.
- **Disproved by:** “Hunter’s role” is the whole description while Undo also changes his name or access.

**S30 · Master admin in both directions · priority high · both sizes**

- **Who / setup:** Master admin editing another account; retain enough administrators for the operation.
- **Press:** Make the person master admin → Undo → Redo. Take master status off → Undo → Redo. Repeat starting from Member and Admin.
- **EXPECTED:** Hover and bubble distinguish “Made a master admin · Hunter” and “Master admin taken off · Hunter”. D2396(l), D2326.
- **Disproved by:** Unnamed wording, reversed meaning, duplicate role wording or the wrong person.

**S31 · Several access changes in one Save · priority high · both sizes**

- **Who / setup:** Master admin; two foreign squadrons and an editable account.
- **Press:** Combine View/Plan additions, removals and replacements with a rename; repeat with master promotion/demotion. Reverse field-entry order. Also return a field to its starting value before Save.
- **EXPECTED:** Actual changes appear once, comma-separated, person last; one Undo matches the accepted Save. D2396(o).
- **Disproved by:** Omitted changes, phantom changes, partial reversal or inconsistent hover/bubble descriptions.

**S32 · Promotion ends each explicit right · priority high · both sizes**

- **Who / setup:** Master admin; recipient holds Plan of 149 and View of a third squadron.
- **Press:** Promote them. Sign in as the recipient; inspect the bell under different squadron notification choices.
- **EXPECTED:** “Made a master admin: full access to every squadron · Saber”, plus each ended right, including “Plan of 149 ended: master admin covers every squadron · Saber”. D2396(n), D2400.
- **Disproved by:** Missing, duplicate or filtered-away personal notices, or wording falsely suggesting lost access.

**S33 · Demotion, regrant and bell reversal · priority high · both sizes**

- **Who / setup:** Master admin; promote a person who held Plan.
- **Press:** Demote normally; inspect access and bell. Repeat with explicit Plan granted in the demotion’s Save. Separately Undo/Redo promotion before and after its notice is read.
- **EXPECTED:** Ordinary demotion does not restore the old Plan; deliberate regrant is represented. Bell and account agree about reversals. D2396(n); two surfaces must agree.
- **Disproved by:** Unannounced restoration, missing regrant or an active-looking notice for a reversed action.

**S34 · Sign-out, sign-in and unfinished work · priority high · both sizes**

- **Who / setup:** Admin with Plan; distinctive Tracker work and a separate account rename.
- **Press:** Use desktop and phone sign-out with a draft: Stay, Discard, Save. Repeat during save failure. Sign in as another person and back; test old/new sign-in names after accepted rename.
- **EXPECTED:** Draft outcome matches the answer; the next person receives their own records and history. D129, D376, D2322, D2395.
- **Disproved by:** Previous-account data or Undo survives, false saved claims, or accepted credentials disagree with Users.

**S35 · Request access without choosing · priority high · both sizes**

- **Who / setup:** New sign-in without membership; at least two squadrons.
- **Press:** Complete every other required field, leave Squadron at Pick…, and press Request access; repeat using Enter.
- **EXPECTED:** “Pick your squadron”; no waiting request or admin notice is created. D2396(f), D2400.
- **Disproved by:** Silent submission to the first squadron or different button/Enter behaviour.

**S36 · Correct the choice and finish joining · priority high · both sizes**

- **Who / setup:** Same applicant.
- **Press:** Trigger the error, choose 142 then 149, submit once. Inspect both waiting lists; approve in 149; sign in as applicant. Repeat with refusal.
- **EXPECTED:** The last choice receives the request; waiting screen, bell, Users and resulting access agree. D2396(f), D2325.
- **Disproved by:** Wrong destination, duplicate request, stale validation or membership in another squadron.

**S37 · One squadron and Add a person · priority medium · both sizes**

- **Who / setup:** Legitimate one-squadron starting world, if available; separately a multi-squadron world.
- **Press:** Complete Request access in the first. In the second, open Users → Add a person and inspect Home squadron.
- **EXPECTED:** A single squadron needs no choice; Add a person retains its separate default. D2396(f). Mark the first part unexercised if no supported setup exists.
- **Disproved by:** Impossible missing-choice error, destinationless request or unintended Add a person default.

**S38 · Filter appearance follows its state · priority medium · both sizes**

- **Who / setup:** Master admin on Users.
- **Press:** Toggle each Filter group alone and together; close/reopen, remove the final tick and use Clear all. Repeat with search text alone.
- **EXPECTED:** Active ticks give the approved pale-blue look and correct count; merely opening an empty filter does not. Filter matches Search height. D2401.
- **Disproved by:** Grey active state, lit inactive state, wrong count or changing height.

**S39 · Only Squadron ticks clear · priority high · both sizes**

- **Who / setup:** Master admin; Squadron, Seat, CAT and Role ticks plus search.
- **Press:** Pick 149 directly and through the bell; repeat with Users hidden or Filter open. Select the already-current squadron separately.
- **EXPECTED:** A change of the Users squadron clears Squadron ticks, preserving the others and search. D2396(j). **Question:** RECORD exactly what same-squadron selection does.
- **Disproved by:** Old Squadron ticks survive or unrelated filters disappear.

**S40 · Plans means the list’s squadron · priority medium · both sizes**

- **Who / setup:** Hunter of 142 has Plan of 149; include an accountless person and master admin.
- **Press:** On each Users list, compare Plans, Admin, Member and Master admin ticks; inspect grouped squadrons, search and counts.
- **EXPECTED:** Plans 149 finds outsiders planning 149. Own-person and displayed-row counts may differ legitimately. D2400, D2396(j).
- **Disproved by:** Rejected extra Plans ticks, classification against the wrong squadron or irreconcilable totals.

**S41 · Escape discards an opened Users row · priority medium · both sizes**

- **Who / setup:** Authorised admin; ordinary, archived and accountless people.
- **Press:** Open each row, change available fields and Escape from a field and elsewhere. Compare Cancel and pressing the row again. Include armed Delete.
- **EXPECTED:** Escape matches Cancel: no save or question, row closed, focus returned to its row. D2396(p).
- **Disproved by:** Saved draft values, lingering Delete confirmation or focus on another person.

**S42 · The uppermost control takes Escape · priority medium · both sizes**

- **Who / setup:** Admin; Users row with unsaved changes.
- **Press:** Open Filter → Escape → Escape. Reverse opening order using keys. Repeat with What each role allows and an opened native select.
- **EXPECTED:** Filter closes before the row; other upper controls take their own dismissal first. D2396(p); keyboard contract.
- **Disproved by:** One Escape discards the underlying row while its upper control remains, or focus becomes unusable.

**S43 · Hidden rows cannot steal Escape · priority medium · both sizes**

- **Who / setup:** Admin; leave a row open.
- **Press:** Hide it with search, filters or Archived; separately leave for Squadrons, another page or the phone category list. Dismiss a visible control there; return.
- **EXPECTED:** Escape acts on the visible surface. D2396(p); keyboard contract.
- **Disproved by:** A hidden row takes the key, changes an unseen draft or redirects focus off the current page.

**S44 · Squadron and place rows cancel alike · priority medium · both sizes**

- **Who / setup:** Master admin, then an admin limited to their own squadron.
- **Press:** Edit a squadron’s Place, including + New place…; Escape. Edit a place’s name/time zone; Escape. Compare Cancel, including after validation errors.
- **EXPECTED:** Existing rows close unsaved, without questions; no partial new place survives. D2396(p), D2298.
- **Disproved by:** Changed records, orphan place, stuck editor or newly permitted foreign editing.

**S45 · New forms remain separate · priority medium · both sizes**

- **Who / setup:** Master admin.
- **Press:** Type into + New squadron; Escape, then Cancel. Repeat Add a person. Open a new form after closing an existing row with Escape.
- **EXPECTED:** The expanded-row handler must not silently discard these separate forms. D2396(p)’s scope. **Question:** RECORD exactly what each form’s existing Escape behaviour does.
- **Disproved by:** The previous row’s handler closes the new form, loses text or takes its focus.

**S46 · Squadron menu opens on the selected row · priority medium · both sizes**

- **Who / setup:** Person with several available squadrons; select a middle row first.
- **Press:** Tab to the top-bar squadron button; open separately with Enter, Space, ArrowDown and ArrowUp. Use arrows, Home/End, then Enter or Space to select; Escape to cancel.
- **EXPECTED:** Opening focuses the ticked row after placement; movement alone does not pick. The menu’s keyboard contract.
- **Disproved by:** Focus stays on the button, starts on a different row, disappears or changes squadron without selection.

**S47 · Tab out versus browser focus loss · priority medium · both sizes**

- **Who / setup:** Same menu; external keyboard on phone.
- **Press:** Tab and Shift+Tab within the list and out of both ends, including backwards beyond the page’s first stop. Separately switch applications/browser tabs without pressing Tab; return.
- **EXPECTED:** Leaving by Tab closes the menu; ordinary browser focus loss does not masquerade as that action. Menu contract.
- **Disproved by:** Stranded open menu after leaving, unexpected closure on app switching or hidden focus.

**S48 · Phone drawer and top-bar pick agree · priority medium · both sizes**

- **Who / setup:** Master, Plan holder, View holder and person with only their own squadron.
- **Press:** Open ☰ → squadron list → pick; compare the top-bar list. Repeat clean and with a Tracker draft. Close using toggle, outside press and Escape.
- **EXPECTED:** Clean drawer picks keep it open with updated pages; dirty picks close it before asking. One-squadron access has no false dropdown. D2384, D2388.
- **Disproved by:** Different rights between menus, stale navigation or a question hidden behind the drawer.

**S49 · Input form held by member view · priority high · both sizes**

- **Who / setup:** Plan holder or master on foreign Inputs; prepare new, existing, several-person and already-read-only inputs.
- **Press:** Open each form, type distinctive values, switch to member view through the available role control, then back. Attempt Save/Delete and field changes while held.
- **EXPECTED:** “Member view.” and “Switch back to the admin view to change this, or close it.” Preserve the form; disable its actions; retain Close/✕. D2389.
- **Disproved by:** Simplified replacement form, lost text, writable fields or dead close controls.

**S50 · Every Leave War window held · priority high · both sizes**

- **Who / setup:** Plan holder or master on foreign Leave War.
- **Press:** Separately open a one-day bid, dragged range, several-entry day, approved-leave window and person window from Grid/Balances/My leave. Attempt member-view switching, then return.
- **EXPECTED:** Reachable held windows carry the same band and disabled form; person balance boxes remain boxes. D2389.
- **Disproved by:** Missing band on one window, changed balances, replaced form or lost draft. Record modal routes that prevent reaching the switch.

**S51 · Member view and pick in both orders · priority high · both sizes**

- **Who / setup:** Plan holder; foreign Input or Leave War window open.
- **Press:** Member view → pick home; separately pick another squadron → member view. Switch back, return to the original squadron and close. Repeat an own-squadron window as control.
- **EXPECTED:** A pick-held window identifies its original and picked squadrons; member-view wording applies only when switching back restores access. D2323, D2389.
- **Disproved by:** Wrong explanation, “switch back” promising unavailable access or foreign controls becoming live.

**S52 · Windows over held windows · priority high · both sizes**

- **Who / setup:** Foreign Input/Leave War form; open its calendar, document viewer or confirmation above it.
- **Press:** Attempt the role switch or squadron pick through reachable controls. Dismiss the upper window, then use Escape, Close and ✕ on the held form; switch back before closing in another run.
- **EXPECTED:** Upper windows dismiss first; none bypasses the held form’s write restriction. D2389, D2323; keyboard contract.
- **Disproved by:** A nested control writes through the hold, Escape closes the wrong layer or a stale confirmation acts later.

**S53 · Settings close at a pick · priority medium · both sizes**

- **Who / setup:** Authorised admin; open Inputs settings, SANS settings and Calendar settings separately.
- **Press:** Make an unsaved change; pick another squadron. Reopen settings there, return to the original and inspect both. Reverse: pick first, then edit/save.
- **EXPECTED:** These settings windows close at a pick; abandoned settings cannot save into the destination. D2396(k).
- **Disproved by:** Surviving old-squadron settings, foreign changes or discarded values silently saved. Do not demand an unbuilt explanatory note.

**S54 · Inputs filter on a phone · priority medium · both sizes**

- **Who / setup:** Member and admin; Inputs list with several people and types.
- **Press:** On phone, set Person, Type and Search separately and together; close/reopen Filters, clear one and then all. Open the calendar and settings around it. Compare desktop direct controls.
- **EXPECTED:** Phone button’s pale-blue state and count match applied filters; desktop retains its direct controls. D2401.
- **Disproved by:** Wrong count, grey active button, lit cleared button, obscured controls or different filtered results.

**S55 · Tracker everyday round · priority medium · both sizes**

- **Who / setup:** Member, own admin, Plan holder and master in separate runs.
- **Press:** Choose course/syllabus/crew; add a roster student; mark an event and failure; inspect Info and Failures; use Find, Details, Show All, Legend, Flex, File and hide/show bar. Edit/save a chart; close every opened control.
- **EXPECTED:** Each allowed task finishes; all readers and exported results agree. D121, D1014, D2395.
- **Disproved by:** Dead opening/closing control, inaccessible result, wrong student or privilege gained/lost after a pick.

**S56 · Users everyday round · priority medium · both sizes**

- **Who / setup:** Own admin, Plan holder and master; member and View holder as access controls.
- **Press:** Process a waiting request; Add a person; search/filter; open their row and roles table; change permitted access and sign-in name; Save, Cancel and Escape. Exercise suspend/restore and archive/restore on disposable people.
- **EXPECTED:** Users, sign-in, menus and bell agree; restrictions follow the actual role. D2381, D2396; two surfaces must agree.
- **Disproved by:** Completed action missing elsewhere, forbidden controls or a draft saved by closing.

**S57 · Squadrons everyday round · priority medium · both sizes**

- **Who / setup:** Master admin, then own admin and Plan holder.
- **Press:** Open squadron/place rows; compare Cancel/Escape/Save. Create a squadron with an existing place, then with + New place…; select first admin. Inspect menus, Users and the first admin’s access.
- **EXPECTED:** Squadron and new place save together; first admin receives Plan; place-change timing matches its displayed explanation. D2298, D2308, D2306.
- **Disproved by:** Half-created records, inaccessible new squadron or disagreement between displayed timing and result.

**S58 · Inputs everyday round · priority medium · both sizes**

- **Who / setup:** Member on own records, then own admin, Plan holder and master.
- **Press:** Add a future input; use person/type/date/duration, remarks and document controls; save, find in List and Calendar, reopen, edit and delete. Repeat from a calendar day and exercise Medical/SANS navigation.
- **EXPECTED:** Windows, list, calendar and affected Leave War entries agree; access remains correct after picks. D2395, D2389; two surfaces must agree.
- **Disproved by:** Missing/duplicate entry, wrong person/squadron, unusable close route or privileged editing by a member.

**S59 · Leave War everyday round · priority medium · both sizes**

- **Who / setup:** Admin opens bidding; member bids on their own row; return as admin to decide it.
- **Press:** Use period/month navigation, one-day and range bids, remarks/document, Approvals, dates → Grid → Back, My leave, Balances, person window, OIL return, Manning, Legend and Settings. Open and close each offered secondary control.
- **EXPECTED:** Bid, decision, balances, Inputs and bell agree; closing returns to the originating page. D2389; existing window and cross-page contracts.
- **Disproved by:** Wrong balance/decision, foreign record, dead close control or return to the wrong page.

**S60 · Bell everyday round · priority medium · both sizes**

- **Who / setup:** Generate access, account and leave notices through normal workflows; inspect as member, Plan holder and master.
- **Press:** Open/close the bell by button, outside press and Escape; scroll; toggle each Show squadron; open notices; Mark all read. Repeat while viewing a foreign View-only squadron and after Undo/Redo.
- **EXPECTED:** Personal notices remain personal; destination links obey access and draft safeguards; read state and words agree with events. D2381, D2325, D2396(n/m).
- **Disproved by:** Wrong destination, lost personal notice, false active event or a forbidden write. A refused Show press remains silent as ruled.

**Doors**

- **Squadron changes:** top-bar list by pointer and keyboard; ☰ list; bell access/posting destinations; first sign-in, subsequent sign-in and refreshed role changes.
- **Tracker reads/writes:** Course/Syllabus/Crew choices and pencil menus; student picker; chart marks and attempt history; Info, Failures, pace/end dates/lulls; Details, Show All, Flex; chart editor and Save changes; File Import/Export; reorder/restore; top-bar Undo/Redo.
- **Unsaved-work decisions:** direct pick, View-only pick, bell navigation, sign-out, course/syllabus operations and Export’s save choice; each answer and dismissal.
- **Account changes and words:** Users row → Role, foreign access and sign-in name → one Save; Undo/Redo hover and bubble; recipient’s bell; next sign-in.
- **Request access:** Squadron select, Request access button and Enter; waiting screen; correct admin’s waiting list and bell; approval/refusal.
- **Filters:** Users Filter chips, Clear all, showing-line Clear, Search and Squadron picks; phone Inputs Filters, Person/Type/Search and clearing controls.
- **Escape:** Users rows, archived rows, Squadron rows, Place rows; Filter and nested controls first; hidden pages and separate new forms as controls.
- **Held windows:** desktop role badge, phone member-view action, squadron picks; Input entry points, Leave War day/range/person entry points; nested calendars/documents/questions; Close, ✕ and Escape.
- **Settings exceptions:** Inputs, SANS and Calendar settings close at a pick.

**Explicit negatives**

- Historical-data-only migration and compatibility issues are excluded. Newly created/imported records that reproduce a fault remain in scope.
- D2400 keeps the single **Plans [list squadron]** tick. Missing outbound-Plan ticks are not a defect.
- **People** and **Showing** may differ because outside Plan holders appear in the list.
- View of another squadron does not offer its Tracker. The two old sign-out/in Tracker bands should not return.
- Member-view switching alone does not require the squadron-pick question.
- A modal shade intercepting the first pointer press on the top bar is retained behaviour. Record whether a held-window case is actually reachable; do not manufacture it.
- Deleted courses are intentionally excluded from backup until restored. Import preserving temporarily hidden marks is also intentional.
- New-person/new-squadron forms are outside the new expanded-row Escape behaviour.
- No new warning is required for the settings windows closing at a pick, or for a refused bell Show press.
- Live-tab synchronisation, an unavailable one-squadron setup and the unbuilt person-transfer setup cannot be claimed as walked evidence. No storage planting substitutes for those controls.
- No runtime, visual or saved-data result is claimed by this read-only report.

Rulings: none this session.

