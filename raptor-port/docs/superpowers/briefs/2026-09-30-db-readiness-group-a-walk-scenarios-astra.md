# `[DB-READINESS]` Group A — Production Walk Scenario Report

## Verdict

The walk should not sign off Group A without exercising two Tracker paths omitted from the builder’s roll-call:

1. A post-boot Tracker import of a genuinely new course writes `v3:<course>:rostermig` and `v3:<course>:idmig` outside any command transaction. Those saved groups have no `changes/<id>` record.
2. Tracker’s `v3:<course>:last:<student>` and `v3:<course>:lastStudent` records are written during grading and read after reload, but `trkCollectionOf()` deliberately excludes them from the command record set.

The first is a definite violation of the promised change-log coverage. The second is a definite command-ownership omission; whether Tracker Undo must restore those navigation pointers is an owner decision.

No tests, builds, or application runs were performed.

## 1. Writer and reload-reader roll-call

| Saved record | Disposition | Writer and storage path | Reader after reload / visible evidence |
|---|---|---|---|
| `weeks/<wk>` — ScheduleWeek | **Writes its own row inside a command.** | `state/sched-commit.ts`: `schedWrite`, `commitSched*`, `schedStore.write`; composed by `state/persist.ts:scheduleRows`. | `state/persist.ts:hydrate` → `readStoredWeek`/`joinWeek`; Edit Schedule and View Schedule show the week. |
| `weeks/<wk>#<di>` — ScheduleDay | **Writes its own row inside a command.** First save intentionally writes all seven days. | Slot, text, wave, row, drag, filing, OIL and publish operations enter through `schedWrite`/`commitInputs*`; `scheduleRows` composes `days`, `sched.book`, and `sched.mutes`. | `hydrate` → week stash → `loadWeek`/`applyWeekModel`; the corresponding board day must reconstruct exactly. |
| `weeks/<wk>:is:<verId>~<n>` — Amendment and four sign-offs | **Writes its own row inside a command.** | `commitPublishALDay` and subsequent amendment publication; mapping in `scheduleRows`. | `joinWeek`, `engine/publish.ts`, issued-face renderer and amendment history. |
| `weeks/<wk>:rx:<verId>~<n>` — AmendmentRetraction | **Writes its own row inside a command.** | `commitUnpublish`; Undo/Redo through `schedStore.write`. | `joinWeek` reconstructs active and retired versions; issue-history UI must retain retractions and reissues. |
| `inputs/<iid>` — Input | **Writes its own row inside a command.** | `state/store.ts:writeInputs`, `writeInputsBatch`, `writeInputsBatchWith`; `ui/inputedit.tsx` create/edit/reassign/split/delete and `InputsPage.tsx`; mapped by `persist.ts:rowOf`. | `persist.ts:hydrate`; Inputs, calendar, schedule overlays, Leave War synchronization and OIL consumers. |
| `people/<pid>` — Person | **Writes its own row inside a command.** Placeholders must not be stored. | `people-settings-commit.ts:persistPeople`, `commitPeopleEdit`, `commitPeopleIntent`; Quals, account-person creation, archive/restore/posting/delete; mapped by `rowOf`. | `persist.ts:hydrate`, callsign index, Quals, all pickers, schedule, Leave War projection and Tracker person bridge. |
| `plan/pp:<id>` — PlanningPuck | **Writes its own row inside a command.** | `state/plan.ts`: add/edit/move/remove, people and row-order functions; mapped by `rowOf`. | `persist.ts:hydrate`; Planning calendar and schedule planning overlays. |
| `plan/dm:<iso>` — DayRemark | **Writes its own row inside a command.** | `state/plan.ts:setDayRemark`; mapped by `rowOf`. | `persist.ts:hydrate`; Planning calendar day title. |
| Fixed settings: `rules`, `stores`, `cxreasons`, `daytpl`, `dutytpl`, `wavetpl`, `wavehide`, `qualcols`, `lookahead`, `secdefault`, `wavedefault`, `guestview` | **Writes its own row inside a command.** A `null` save must remove the key. | Existing `store.set` writers are intercepted by `people-settings-commit.ts:registerPeopleSettingsCommandLayer`; paired template writes use the group hook. | Their respective `*Load()` functions, Admin configuration, Quals columns, scheduler and permissions. |
| `leavewar/war:<warId>` | **Writes its own row inside a command.** | `createWar`, stage/bid-window/event-band operations and `lwStore.write`; `rows.ts:lwRows`. | `store.ts:readWorldRows`; war picker, stage and date grid. |
| `leavewar/rec:<warId>:<recId>` | **Writes its own row inside a command.** One moved record remains one row. | Bid, decision, clear, move, acknowledgement, award projection and Inputs synchronization through `persistNotify`; diffed by `lwRows`. | `readWorldRows`, ordered by `(ord,id)`; cell list, matrix, manning and balances. |
| `leavewar/ledger:<id>` | **Writes its own row inside a command.** | `grantTo`, `grantOil`, `updateLedgerEntry`, `removeLedgerEntry`, award doors. | `readWorldRows`; OIL tracker, counters and the war’s award display. |
| `leavewar/opening:<pid>:<counter>` | **Writes its own row inside a command.** | `setBalance` and related counter operations. | `readWorldRows`; counter sheet and derived balances. |
| `leavewar/profile:<pid>` | **Writes its own row inside a command.** | Posting-in/out/outcome, archive/delete handling and `setPersLabel`; `lwRows` merges window and label. | `readWorldRows`; roster posting window, historical stints and personnel label. |
| Leave War settings: `oilpolicy`, `eventdefs`, figure/roster/manning/group orders, hidden lists, colours, rules, event rows, `showsans` | **Writes its own row inside a command.** | All setters/resetters funnel through `persistNotify`; `rows.ts:CONFIG_KEYS` maps the changed field to its key. | `initStore` uses `readStored`; settings sheets, matrix, counters and charts. |
| `leavewar/current` | **Writes its own row inside a command, but must not control reload.** | `selectWar` → `persistNotify` → `lw.current`. | `initStore` deliberately ignores it and chooses the active stage by owner rule. The picker change is stored for possible future per-user use only. |
| Leave War `role`, `viewer`, `focusDate` | **Must not be durable because they are session/view state.** | `setRole`, `setViewer`, `focusDay` notify only. | Reload derives role from the signed-in session and focus from the chosen war. No stored row or ChangeBatch item is expected. |
| `settings/elog:<lineId>` | **Writes its own row inside a command.** Idle lines get their own `elog.line` command. | `engine/editlog.ts` keep path; sweep uses `elog.sweep`. | Edit-log loader sorts by `(at,lineId)`; Admin → Data/history and Changes UI. |
| `settings/seen:<pid>` | **Writes its own row inside a command, own row only.** | `state/changes.ts:markSeen` via `changes.seen`. | `changesLoad`; that person’s change badges. |
| `settings/account:<id>` | **Writes its own row inside an intent command.** | `accounts.ts:addAccount`, `updateAccount`, approval/new-person paths, posting/archive suspension and person delete. | `accountsLoad`; sign-in and Admin → Users. |
| `settings/accessreq:<id>` | **Writes its own row inside an intent command.** | `requestAccess`, `approveRequest*`, `declineRequest`. | `accountsLoad`; waiting screen, Admin → Users and request bell. |
| `settings/reqseen:<accountId>` | **Writes its own row inside a command, own admin row only.** | `accounts.ts:markRequestsSeen`; removed with the account. | `accountsLoad`; each administrator’s bell state. |
| `changes/<batchId>` | **Writes its own row at the command transaction seal.** | `state/changebatch.ts:sealer`; names every other key in the saved group. | Future stand-in/incoming reader; inspectable in Browser storage. Newest 200 retained. |
| `settings/schema` | **Boot/fold exception: written atomically by boot, fold or bootstrap rather than an ordinary user command.** | `storage/schema.ts`, `storage/fold.ts:runFold`, `boot.ts`. | `schemaOf`, boot-policy and compatibility gates. |
| Tracker course, deleted-course, enrolment, chart and event-detail rows | **Writes its own row inside a command.** | `core.js:sSet` → `rows.js:logicalOf/splitValue` → `doorSet`; `trkWrite`/`trkGesture`; commit subscriber writes changed rows only. | `trkHydrateMem`, `joinRows`, `loadCourses`, `loadSylCat`, `loadCourse`, `loadEventInfo`; Tracker course/chart/student/detail UI. |
| Tracker layout, marks, dates, pace, lulls and course plan | **Writes its own already-single record inside a command.** | `saveLayout`, `saveMarks`, `saveDates`, `savePace`, `saveLulls`, `savePlan`; Tracker Undo/Redo uses `trkStore.write`. | `loadLayout`, `loadStudent`, `loadCourse`; chart geometry, grades, dates, targets and lull calendar. |
| Tracker `v3:<course>:last:<student>` and `v3:<course>:lastStudent` | **MISSING from the command record classifier.** They are saved in a command’s whiteboard transaction, but not represented in `CommitEnvelope.changes` or `trkStore.records`. | `core.js:noteLastEdit`, student/chart removal sweeps and ID migration. `trkCollectionOf` explicitly lets them fall through raw. | `loadCourseNow`, `loadStudent`, `showLastEdit`; controls which student/chart location opens after reload. |
| Tracker migration state: notably post-boot `rostermig`, `idmig`, `idmap`, and `v3:links` cleanup | **MISSING for post-boot import/migration.** These can write as bare groups with no ChangeBatch. | `applyStudents` lines leading through `migrateIds`; `sSetOne`/`delKeyOne` raw path because `trkCollectionOf` returns `null`. | Subsequent `loadCourseNow` and migrations use the flags to decide whether records are safe to edit. |
| Tracker first-mount seed, catalogue and one-time migrations | **Must not use an ordinary command because this is the named first-mount exception.** | `core.js:init`, `applyBundle`, migration functions while `TRK_COMMANDS === false`. | Same initialization immediately reads them; the shared-store visit may contain only this bookkeeping and shipped catalogue. |
| `ocuLocal:*` Tracker course/chart/student and toolbar preferences | **Must not enter the shared store or ChangeBatch because they are per-browser/per-person view preferences.** | `core.js:prefSet`, `toggleBar`, `setActive`, chart/course choice. | `prefGet`, `pickKey`, `resumeForPerson`. |
| Medical document bytes in IndexedDB | **Must not enter Group A rows because the file-store decision is Group B.** | `state/docs.ts:docAdd`/document drawer. The Input’s `docIds` still saves in its `inputs/<iid>` row. | Document drawer and Inputs medical editor. Test bytes separately from Input metadata. |
| Sign-in, sign-out, session, Admin member-view switch | **Must not be saved because authentication/session state is memory-only.** | `state/store.ts:resetSession` and view setters. | Reload returns to signed-out/session-derived state; no domain row and no ChangeBatch should appear. |
| Scheduler and Leave War undo stacks | **Must not be saved because undo history is session-only.** The rows restored by an Undo/Redo must be saved. | In-memory history plus `globalUndo/globalRedo`, `schedStore.write`, `lwStore.write`. | Buttons reset after reload; restored domain state survives. |
| `InputType`, `LeaveCounter` | **Must not be app-written because they are stage-1 code reference data.** | Shipped catalogues only. | Input and counter readers use their code copies. |
| `TakeOverRequest` and locking data | **Must not exist in Group A because they belong to Group B.** | No Group A writer. | No Group A reader or visible lock UI expected. |

## 2. Ranked production walk scenarios

Run every applicable scenario at 1440×900 and 390×844, taking a screenshot and a storage snapshot after the stated reload.

### Two-tab boundary

The current app does not re-read Browser storage while an already-open tab is idle; Tracker’s exported `loadLatest` is a no-op. Therefore:

- A two-tab walk can prove that tab A and stale tab B write different rows and that both rows survive once both tabs reload.
- It cannot prove live incoming refresh, conflict rejection on the same row, or the future 30-second ChangeBatch reader.
- True two-client state reconciliation remains a unit-model responsibility. Do not mark a stale tab’s unchanged screen as a defect.

### 1. Tracker import writes bare migration flags — highest-risk known defect  
**[shared-store build]**

- **Start:** Fresh shared store, bootstrap admin signed in, Tracker says “No course yet.” Prepare a valid full Tracker backup containing a new course, chart, student and mark.
- **Gestures:** Tracker → File → Import → select file → confirm “Bring them in too?”
- **After reload:** Imported course, chart, student and mark are present once; no demo course or student appears.
- **Storage:** Diff the pre/post snapshots. New course/enrolment/mark/plan rows, `v3:<course>:rostermig` and `v3:<course>:idmig` must all be named by new ChangeBatch items.
- **Wrong if:** Either flag exists without any new ChangeBatch naming it; any import row is doubled or lost; or a demo student appears.

### 2. Tracker grade, latest-work pointer, Undo and Redo

- **Start:** Demo Tracker, known student, two visible balls A then B.
- **Gestures:** Grade A; reload; grade B; press Tracker Undo; reload; press Redo; reload; switch crew away and back after each state.
- **After reload:** Grade, Last Flown where applicable, and landing position agree. Undo must not leave an unexplained landing on B unless that is explicitly accepted by the owner.
- **Storage:** Grade action changes the mark row plus `last:<student>` and possibly `lastStudent`, with one batch naming all. Undo/Redo batches must name every record they restore.
- **Wrong if:** Grade survives but latest-work records are unbatched; Undo removes B’s grade while reload still lands on B contrary to the chosen rule; or Redo restores only part of the action.

### 3. Tracker structural save with cross-course cleanup

- **Start:** Same chart used by two courses; both have a student marked on one flight, typed ball details and Last Flown.
- **Gestures:** Edit chart layout → remove that ball → Save changes; Undo the unsaved edit in a second run; repeat and save; reload each course.
- **After reload:** Saved deletion removes the event, its marks and typed detail on every affected course and recalculates Last Flown. Undo before Save preserves everything.
- **Storage:** Changed syllabus row, affected mark/date rows, event-detail row deletion and last-work deletions only. Unrelated charts/courses remain byte-identical.
- **Wrong if:** A mark resurrects, another chart loses details, an off-screen course remains inconsistent, or cleanup keys are absent from the batch.

### 4. Tracker’s remaining writer matrix

- **Start:** One course with two charts and two students.
- **Gestures:** Add/rename/remove student; reorder crew; change pace, End date A/B, Last Flown, upchit, down days and lull periods; grade/fail/re-date; move a ball; edit line/font; Save changes; edit/reset ball details; duplicate/add/rename/delete/restore chart; add/rename/reorder/delete/restore course.
- **After reload:** Every visible value and order is exact; deleted courses retain students/marks for Restore; removed students do not resurrect.
- **Storage:** Only the relevant enrolment/course/chart/detail/layout/mark/date/pace/lull/plan rows change. Each saved group has exactly one batch, except no-op/view-only gestures.
- **Wrong if:** Whole lists reappear, unrelated rows change, order drifts, or any save lacks a batch.

### 5. Tracker stale two-tab row survival  
**[two tabs]**

- **Start:** Both tabs load the same course/chart before either writes.
- **Gestures:** Tab A adds student ALPHA and edits ball A details. Without reloading, tab B adds BRAVO and edits ball B details. Then reload both. Repeat with two different charts and with two different courses.
- **After reload:** Both students, both detail edits, both charts and courses remain, in deterministic order.
- **Storage:** Distinct enrolment/detail/chart/course row keys and distinct tab-specific ChangeBatch ids.
- **Wrong if:** The later tab removes the earlier row, an unseen row is rewritten, or row order differs between reloads.

### 6. Full old-bundle conversion  
**[main build first]**

- **Start:** On `main`, create every old shape: two saved weeks; a published, amended, unpublished and reissued day; saved plans; taken-off input; ordered inputs and roster; planning pucks/titles; Leave War bids/decisions/awards/posting; history and seen marks; accounts and waiting request; Tracker custom/renamed/hidden/deleted charts, layouts, lines/fonts, typed details, courses, students, marks, dates, pace and lulls. Export a Tracker backup.
- **Gestures:** Record screenshots and storage; replace `main` with this build on the same address; open once; reload again.
- **After reload:** First new-build render and second reload are visibly identical to the pre-fold world, subject only to expressly changed data shape. Tracker owner work is exact.
- **Storage:** One atomic fold to format 6; valid old blobs removed; new rows carry their old order; schema is initialized; the second boot performs no second conversion.
- **Wrong if:** Boot breaks, any owner Tracker work differs, a valid old blob survives alongside duplicated rows, order changes, or demo data returns.

### 7. Fold meets unreadable input  
**[main build first]**

- **Start:** Separate copies of a format-5 store; damage one old bundle at a time before opening this build.
- **Gestures:** Open the new build and reload.
- **After reload:** The app opens or presents its intentional read-only/retry state; it never hangs or partially destroys the rest of the world. An unsplittable Tracker whole record remains readable by its legacy reader.
- **Storage:** Unreadable source bytes remain untouched unless the whole fold aborts. No converter may delete a source it could not convert.
- **Wrong if:** Load crashes, the fold stamps success after losing D464 Tracker work, or unrelated data is partially converted/deleted.

### 8. Hand-damaged row isolation

Repeat for:

- `weeks/<wk>#<di>`: whole affected week shows its read-only placeholder; other weeks remain editable.
- `inputs/<iid>`: bad request is ignored, other inputs remain.
- `leavewar/rec:<war>:<rec>`: bad record is skipped, war and other records remain.
- `settings/elog:<line>`: bad line is skipped, history still opens.
- A non-admin `settings/account:<id>`: bad account is ignored without lockout repair altering other accounts.
- Tracker `...:enr:<id>`: bad enrolment is ignored.

For each:

- **Gestures:** Damage one row in storage; reload; edit a different valid row; reload.
- **Storage:** Damaged bytes remain byte-for-byte; only the deliberate valid edit and its batch are new.
- **Wrong if:** The bad row is deleted, rewritten or causes a whole-list rewrite; the app crashes; or another record disappears.

### 9. Leave War configuration keys and ordering

- **Start:** Admin on an existing war.
- **Gestures:** Add/edit/reorder/reset event types, event rows, figures, manning rows and groups; set colours and thresholds; toggle Show SANS; reorder and reset roster; reload after each save/reset.
- **After reload:** Every list, hidden state, colour, threshold and default/reset state is exact.
- **Storage:** Only the appropriate settings-like keys change, each in a command group with one batch. No `personedits` key appears.
- **Wrong if:** Reset leaves stale values, reordering changes unrelated records, or a setting write is bare.

### 10. Leave War multi-record cell and stale tabs  
**[two tabs]**

- **Start:** One person/date capable of holding two records.
- **Gestures:** Tab A submits a bid. Stale tab B submits a different permitted record on another date or separate record address. Admin decides one record, moves it, then deletes only it; reload both.
- **After reload:** Both independent records survive until the explicitly selected one is changed; the untouched record retains its order and state.
- **Storage:** One `rec:<war>:<recId>` per fact. Move is one put at the same record key with new date/person, not delete-plus-new-id.
- **Wrong if:** One record hides or erases another, move changes multiple bid rows, or stale B resurrects a deleted record.

### 11. Leave War stage, events and bid-window lifecycle

- **Start:** Admin on a draft period.
- **Gestures:** Create period; set/clear bidding window; add a single-day event and a range band; add/remove event row; Open bidding → Close bidding → Publish → Reopen; reload after each.
- **After reload:** Period, bands, days, stage and window match the last accepted action.
- **Storage:** The war row changes; unrelated bid, ledger, opening and profile rows remain byte-identical.
- **Wrong if:** Stage or event changes vanish, alter records, or produce multiple war rows.

### 12. Posting profile and person lifecycle across Leave War

- **Start:** Person with past records, future records, account and posting window.
- **Gestures:** Set posting-in; post out using every offered outcome; archive; restore; permanently delete at a chosen cutoff.
- **After reload:** Past retained facts remain; future facts required by D299 are gone; posting outcome is recorded once; account state follows D323/D306.
- **Storage:** Person, account, profile and explicitly affected future rows are in one causal group where one door owns the action.
- **Wrong if:** Past history disappears, future rows remain, last admin is lost, or profile/account/person commit only partially.

### 13. Quals is the sole personnel editor

- **Start:** Admin and member views.
- **Gestures:** On Quals, rename callsign, alter category/seat, qualification tick and SXO; reload; open Leave War name sheet.
- **After reload:** All consumers use the new Person row. Leave War shows updated derived band/SXO and has no Edit person action.
- **Storage:** One `people/<pid>` row plus causal downstream rows only; no `personedits`.
- **Wrong if:** Leave War holds a conflicting copy, old callsign still resolves, or a member saves a forbidden person edit.

### 14. OIL award and correction

- **Start:** Admin, person with visible opening balance and no award on the chosen day.
- **Gestures:** Grant hand OIL in the OIL tracker; edit amount/date/reason/given-by; remove it; repeat via day award where offered; reload after every action.
- **After reload:** War and OIL tracker display the same single ledger fact; removal clears both.
- **Storage:** One `ledger/<id>` row, never a duplicate war award record. Old retired award rows must not break load.
- **Wrong if:** Two awards appear, display and ledger disagree, or correction changes an opening row.

### 15. Published-day amendment/retraction/reissue

- **Start:** Publishable weekend day with all four sign-offs.
- **Gestures:** Publish; edit a different day; edit the published day to create pending changes; discard pending in one run; Unpublish in another; publish the same label again.
- **After reload:** Published face stays frozen; pending edit wipes sign-offs; discard returns exactly to issued; unpublish retains history; reissue creates the correct `~n` identity with four names.
- **Storage:** Append-only issuance and retraction rows plus only touched day rows. Editing another day must not rewrite the issued day.
- **Wrong if:** Sign-offs persist across a pending edit, issuance is overwritten/moved, history vanishes, or reissue duplicates the active version.

### 16. Scheduler editing surface

- **Start:** Saved week 13–19 July and saved week 20–26 July.
- **Gestures:** Add/edit/delete slot; text box; wave; formation/row; move and drag across two days; switch weeks between each group; reload.
- **After reload:** Exact content and placement remain on both weeks, including off-screen changes.
- **Storage:** Only affected day rows plus necessary week stamp rows change. A first save writes the week plus seven complete day rows.
- **Wrong if:** Untouched days’ bytes change, one week overwrites the other, or cross-day drag updates only one day.

### 17. Saved plans and templates

- **Start:** Saved week and Admin configuration.
- **Gestures:** Make/switch/bring out a saved plan; create/edit/reset day, duty and wave templates; change wave and section defaults; apply a template; reload after every boundary.
- **After reload:** Plan choice and applied schedule survive; template/default rows reconstruct their editors exactly.
- **Storage:** Plan effects touch appropriate day/book rows; template changes touch only their settings keys, with paired `wavetpl`/`wavehide` in one group.
- **Wrong if:** A template write is split into unrelated groups or applying it rewrites untouched days.

### 18. Complete Input lifecycle, including document separation

- **Start:** Inputs page with ordered rows and an available medical document.
- **Gestures:** File; edit remarks/type/time; re-date; resolve a clash that splits/trims another input; reassign; take off a day; delete; file two new inputs consecutively; attach/remove a medical document.
- **After reload:** Exact rows, dates, splits and order survive; deleted request does not return; document opens when its `docId` remains.
- **Storage:** One row per resulting input. The IndexedDB document changes separately; only `docIds` belong in the Input row.
- **Wrong if:** Whole `inputs/all` returns, unrelated inputs change, order drifts, or attachment bytes appear in whiteboard storage.

### 19. Person add/archive/restore/delete and roster order

- **Start:** Admin on Quals.
- **Gestures:** Add person in the middle; rename; reorder; archive; restore; delete; Undo/Redo where the global Undo offers it; reload after each.
- **After reload:** Quals and every picker use `(ord,pid)` consistently; archive/restore visibility is correct; delete never resurrects the person.
- **Storage:** One Person row per changed person; placeholders absent; account, schedule and Leave War effects named only when the action truly changes them.
- **Wrong if:** Callsign index is stale, order differs across screens, or deleting one person rewrites every Person row.

### 20. Accounts, access requests and bells

- **Start:** Admin A, Admin B, member, guest enabled and a new unsigned user.
- **Gestures:** Request access; reload waiting screen; A marks requests seen; B verifies his bell is still new; approve into existing person; repeat approval as new person; suspend/re-enable account; decline another request.
- **After reload:** Each account/request/bell reflects only its owner’s action; sign-in succeeds or fails accordingly.
- **Storage:** Separate `accessreq`, `account` and per-admin `reqseen` rows. Approval changes account plus request deletion atomically.
- **Wrong if:** A clears B’s bell, approval leaves both pending and active, or concurrent additions overwrite.

### 21. Edit history and seen positions

- **Start:** Admin → Data/Changes with a known mark.
- **Gestures:** Make three quick edits; immediately reload; mark them seen as member; sign out/in; perform Undo and Redo; run history sweep as admin.
- **After reload:** All lines appear once in `(at,lineId)` order; member’s seen state survives sign-out; Undo/Redo lines correspond to restored state; sweep removes only selected old lines.
- **Storage:** One `elog:<lineId>` per line, one `seen:<pid>`, one batch per saved group; no late microtask write after the group.
- **Wrong if:** A line is lost/doubled, arrives without its domain row, or another person’s seen row changes.

### 22. Planning rows under stale tabs  
**[two tabs]**

- **Start:** Both tabs open the same planning day.
- **Gestures:** Tab A adds puck A; stale tab B adds puck B and a day title; reload both; then insert/reorder/delete one puck.
- **After reload:** Both pucks and title survive in deterministic order.
- **Storage:** Distinct `pp:<id>` rows and one `dm:<iso>` row; only rows whose `ord` genuinely changes may be rewritten.
- **Wrong if:** A stale list rewrite loses a puck or two tabs disagree after reload.

### 23. Undo, Redo, pristine-week and immediate reload

- **Start:** A pristine, never-saved week.
- **Gestures:** Edit one cell; Undo back to pristine; reload. Separately edit, Undo, Redo, reload. Then make three rapid edits and immediately reload/close the page.
- **After reload:** First run is pristine; no demo change reappears. Redo run shows the edit. Rapid changes all survive.
- **Storage:** Confirm the settled pristine-week policy: no week rows should remain if the implementation returns it to truly unstashed state; otherwise flag the discrepancy for owner confirmation. Pagehide flush retains every ChangeBatch.
- **Wrong if:** Undone content returns, a partial group survives, or the final rapid edit is absent.

### 24. Week navigation with another tab’s Input  
**[two tabs]**

- **Start:** Tab A has week 13 loaded; tab B has week 20 loaded.
- **Gestures:** B files an Input affecting week 13. A changes week 20, switches to 13 without reloading, then reloads.
- **After reload:** After the reload, both the input and A’s unrelated schedule change survive. Do not expect A’s pre-reload screen to discover B’s input.
- **Storage:** Input row and affected saved-week rows/batches coexist; week navigation alone must not emit an unexplained bare group.
- **Wrong if:** A’s later save deletes B’s input or re-landing produces a batchless write.

### 25. Shared-store virgin boot  
**[shared-store build]**

- **Start:** Empty origin with `VITE_SEED_DEMO=false` and a valid bootstrap administrator.
- **Gestures:** Boot, sign in, visit every page at both widths, sign out/in, attempt `ad/a`, then use “Create the first period” and Tracker’s empty-state way in.
- **After reload:** Before creating anything: only bootstrap person/account exist; Leave War says no period; Tracker says no course; demo sign-in fails. After actions: only the created period/course rows appear.
- **Storage:** Initial boot contains schema, bootstrap Person, bootstrap User, one boot ChangeBatch, then only Tracker first-mount bookkeeping after visiting Tracker. No demo inputs, weeks, plans, Leave War records, accounts, course or students.
- **Wrong if:** Visiting a page seeds domain data, bootstrap duplicates, empty cards are unusable on phone, or demo credentials work.

### 26. Shared-store bootstrap failures  
**[shared-store build]**

- **Start:** Separate empty stores with missing, malformed, duplicate-name, overlong-name and unknown-`personId` configurations.
- **Gestures:** Boot each once, then retry after correcting configuration.
- **After reload:** Invalid configuration shows the setup failure and writes nothing; corrected configuration creates exactly one admin.
- **Storage:** Failed boot leaves no schema/person/account fragments. Successful retry is one atomic boot group.
- **Wrong if:** Any partial bootstrap survives or retry duplicates a person/account.

### 27. Role matrix

- **Start:** Admin, member, Admin’s member view, guest and waiting-for-access sessions.
- **Gestures:** Attempt every visible save: schedule, Inputs, Quals, Admin settings, Leave War bids/decisions/configuration/OIL, Tracker edits and File Import/Export.
- **After reload:** Permitted changes survive; forbidden controls are absent or refuse without changing screen/storage. Tracker File remains equally available to admin and member under D121.
- **Storage:** Refused operations add neither domain row nor ChangeBatch. Role/member-view/session changes add nothing.
- **Wrong if:** A forbidden save lands, a permitted member action is lost, or switching view writes shared role state.

## 3. Lines that are already missing

### Finding A — post-boot Tracker migration flags bypass ChangeBatch

`src/tracker/app/core.js:trkCollectionOf` returns `null` for `rostermig`, `idmig`, `idmap` and `v3:links`. That is safe during `init()`, when command routing is off, but not during `applyStudents()` after the app is live. A new imported course reaches:

1. `applyStudents`.
2. `writeCourseBlock`.
3. `sSet(kRosterMig(c), '1')`.
4. `migrateIds(c)`.
5. `sSet(kIdMig(c), '1')`, with possible `kIdMap` and `kLinks` changes.

Because no command is open and these keys are unclassified, `sSetOne`/`delKeyOne` call storage directly. Each produces an unsealed group and therefore no `changes/<id>` row.

Exact fix:

1. In `trkCollectionOf`, add an explicit `trk.meta` match for:
   - Exact `v3:links`.
   - Exact `v3:courseidmig` and `v3:courseidmap`.
   - Course-scoped final segments `rostermig`, `idmig`, `idmap`.
   - The other migration journal/flag keys if any can be reached after `TRK_COMMANDS` is enabled.
2. Add `trk.meta` to the `cols` array in `trkRegisterCommands`.
3. Keep first-mount exemption unchanged: `TRK_COMMANDS === false` already prevents these boot writes from becoming commands.
4. Rewrite the comment at `trkCollectionOf` so it distinguishes first-mount raw writes from post-boot migration writes.
5. Extend `state/changebatch-rollcall.test.ts` to initialize Tracker, import students for a genuinely new course, capture every post-init group and assert:
   - No bare group.
   - Exactly one batch per group.
   - Batch items equal every non-`changes` row.
6. Add the same assertion for a post-init course load that finishes an unset `idmig`.
7. Run scenario 1 in the Browser backend before accepting the fix.

### Finding B — Tracker last-work records are absent from command changes

`noteLastEdit` writes `v3:<course>:last:<student>` and `v3:<course>:lastStudent`. These are not the proper `ocuLocal:*` per-person view preferences: they live in the shared Tracker store, survive reload, are used by `loadCourseNow`, and are documented in `data-schema.md`. Yet `trkCollectionOf` explicitly drops them as “view-prefs.”

Exact command-ownership fix:

1. Add a `trk.resume` classification for:
   - `v3:<course>:last:<student>`.
   - `v3:<course>:lastStudent`.
2. Add `trk.resume` to `trkRegisterCommands`’ registered collections.
3. Leave the genuinely local `ocuLocal:*` preferences outside the command layer.
4. Add a test that grades a ball and asserts the Tracker envelope contains the mark row and both changed resume rows.
5. Add delete tests for removing a student and deleting a chart, proving the relevant resume rows are explicit deletes.
6. Inspect the saved ChangeBatch and reload landing in scenario 2.

If the owner says Undo must also restore the last-work landing:

7. Extend `markSnap` to capture the student’s `lastEdit` value and the course’s `lastStudent` value before the action.
8. Extend `restoreSnap` to restore or delete both keys through `sSet`/`delKey`, and update `lastEdit[s]`.
9. Ensure `reverseOf` captures the current values for Redo.
10. Add Grade → Undo → reload and Grade → Undo → Redo → reload tests with two different balls.

## 4. Explicit negatives

- I found no surviving production writer for the retired whole records `inputs/all`, `people/all`, `plan/all`, Leave War `wars/openings/ledger/postouts/perslabels/personedits`, or Tracker’s splittable whole-list records after conversion.
- I found no Leave War “Edit person” writer or reader; seat, category and SXO come from the Person row.
- Schedule persistence no longer performs a “delete everything absent locally” reconciliation.
- Input, Person and Planning delete mapping is explicit; it is not inferred from an incomplete list.
- Leave War moves preserve record identity and map to one put.
- Tracker’s row door deliberately preserves unreadable or unseen rows when another item is edited.
- The proper Tracker personal course/chart/student preferences use `ocuLocal:*`, outside the shared prefix.
- Sign-out, role switching, member view and undo stacks do not write shared rows.
- Medical document bytes remain outside whiteboard storage; only Input `docIds` are part of Group A.
- `settingsAdapter` removes a key for `null`; reset-to-default does not store JSON `null`.
- The fixed settings inventory and dynamic account/request/seen prefixes are command-routed. Edit-log and schema writes have their separate intentional paths.
- A first-mount Tracker write remains the sole named post-boot-looking exception in the builder’s test; the missing import case occurs after first mount and is not covered by that exception.
- I found no live incoming-storage reader in the production Browser path. Two-tab expectations must therefore be judged after reload, not from the stale tab’s immediate screen.
- I did not treat phase 6, phase 7, locks, database adapter behavior, old-demo-only quirks or planned differences from `main` as findings.

## 5. Questions only the owner can answer

1. **Should Tracker Undo restore “latest work” navigation?**  
   Recommendation: yes. After undoing a grade on ball B, reloading and selecting that student should not land on B merely because the reverted action once touched it.

2. **For a signed-in person with no personal Tracker crew preference, should the initial student be the last student anyone graded or the first student in the course?**  
   Recommendation: choose the first student. D376 says the place is personal; another user’s last-graded student should not become a new user’s default.

3. **Should one File → Import be one atomic command and one ChangeBatch, or may it be many row commands?**  
   Recommendation: one atomic import. It is one confirmed user action, and partial persistence is especially dangerous on the Export → wipe → Import route.

4. **Should Leave War’s selected `current` war eventually be personal, shared, or not stored?**  
   Recommendation: personal per-user preference. The current shared row is written but intentionally ignored at boot, so it presently has no stable product meaning.

5. **After an edit is undone back to a pristine never-saved week, should all newly created week rows disappear?**  
   Recommendation: yes. That matches the settled “pristine weeks are deliberately not stashed” rule and prevents an invisible action from manufacturing a durable week.

