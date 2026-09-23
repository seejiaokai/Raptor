# [HUMAN-RETEST] Tracker — Astra's scenario design (23 Sep 26)

**What this is.** Bug-check order §4 rank 1: a model that did NOT build the Tracker designs the test
scenarios, hunting for what is MISSING. Astra (Codex CLI, `codex exec -s read-only`), briefed with
`docs/superpowers/briefs/2026-09-23-tracker-retest-scenarios-brief.md`, blind to Fable's list. Kept
verbatim below; every item is dispositioned in the evidence sheet `2026-09-23-tracker.md` §7.

---

## Astra's report, verbatim

I completed the read-only scenario design. I did not edit files, start the app, or run tests.

The static pass found twelve current-code defect candidates. The highest-risk ones are in the owner’s export → wipe → import survival path: hidden-chart state is not exportable, imported chart order is not restored, and user-edited event details are globally keyed by event code and can bleed between syllabi.

## 1. Roll-call

“No action” means the surface is informational only. “Same pixels” names every competing mark or overlay that the executor must photograph.

| Thing | Where it is drawn | Shows it? | Can act there? | What shares the pixels |
|---|---|---:|---|---|
| Course id/name/order | Header title and Course dropdown | Name and current selection; id hidden | Select course | Crew selector, syllabus selector, menus, undo, search, save status |
| Course | Course pencil menu | Current course implicitly | Add, rename, reorder, delete | Fixed menu over chart/header; phone menu may cover view tabs |
| Course order | Course-order modal | Every course, current tag | Drag, ▲/▼, A–Z, Save | Overlay; one shared reorder modal also serves syllabi and crew |
| Deleted course records | Nowhere | No | No restore door; only a same-name new course can be created, with a new id | Nothing; retained records are invisible |
| Syllabus/chart | Syllabus dropdown | Name, order, edited `✎` mark | Select syllabus | Course/crew controls and Syllabus pencil |
| Syllabus/chart | Syllabus pencil menu | Current chart implicitly; edit mode lights pencil | Arrange, duplicate, add, rename, reorder, delete | Fixed menu; Save changes may appear elsewhere |
| Hidden/deleted built-in chart | Syllabus reorder modal | Listed under “Deleted built-in syllabi” | Restore | Visible order rows and modal controls |
| Hidden chart state | Export dialog/file | No: hidden ids are excluded from the export list | No export control for it | Visible charts only |
| Chart order | Dropdown and reorder modal | Yes | Reorder | Edited indicator and current-chart tag |
| Chart order | Export file | Stored for selected visible charts | No direct file editing in app | Chart catalogue |
| Chart order | Import result | File order is read but not applied by the UI import route | No separate “restore order” control | Existing local order |
| Event/ball id and printed label | Flow chart centre | Yes | Mark; details; arrange actions | Type shape/colour, student wedges, failure ticks, number badge, availability/search/selection rings |
| Event type | Ball centre shape/colour and legend | Yes | Edit through direct ball editor/raw event editor | Printed label and rings |
| Event number badge | Ball’s top-right badge | Yes | Direct ball editor | Ball ring and search/availability rings |
| Event phase and sequence | Show All grouping/order; raw event editor | Phase as group; sequence as order | Raw event editor | Type dot, event details, active student’s grade |
| Event count | Header strap | Yes | No action | Course title |
| Event details: name | Grading pop-up, Details bubble, Show All, search predictions, info editor | Yes | Edit in pop-up info editor or Show All | Grade/failure/date record in pop-up/bubble; status badge in Show All |
| Event details: format/type text | Pop-up, bubble, Show All, info editors | Yes | Edit/reset | Name, hours, crew, prerequisites |
| Event details: hours | Pop-up, bubble, Show All, info editors | Yes | Edit/reset | Format on the same line |
| Event details: crew | Pop-up, bubble, Show All, direct ball editor | Yes | Edit/reset | Prerequisite text |
| Event detail note: prerequisites | Pop-up, bubble, Show All | Yes; falls back to real links when blank | Edit/reset | Crew and linked-arrow prerequisites |
| Event details provenance by syllabus | Nowhere | No | No | Event details are globally keyed by event id, so same-id charts share the override |
| Prerequisite link | Flow chart arrow | Yes | Connect, delete, move bend/end, arrow, merge/unmerge | Free lines, balls, route hops |
| Prerequisite link | Show All, pop-up and Details bubble | Text form | Edit through event editors | Free-text prerequisite note may replace the visible real-link list |
| Free drawn line | Flow chart only | Yes | Draw, edit ends/bends, delete, arrow, merge/unmerge | Prerequisite lines, hops, balls |
| Line routing, arrowhead, merge/hop metadata | Flow chart | Yes | Arrange tools | Other crossing lines |
| Ball position | Flow chart | Yes | Drag one or selected group; reset layout; undo | Lines attached to it and scroll/zoom position |
| Per-ball/chart font size | Flow chart | Yes | Font box in arrange mode | Ball label, number badge |
| Student/enrolment id | Never printed | No | No direct id action | Name is the visible label |
| Student name | Crew dropdown, Students chips, key-ball legend, card headings, grading pop-up, failure/lull dialogs | Yes | Pick; rename from chip; remove | Link dot, roster number, remove button |
| Student name | Every ball | Indirectly: wedge position maps through key-ball legend | Tap another student’s wedge to select | Grade fill, failure ticks, selected cyan edge |
| Student | Show All | Only the active student’s status is identified via tooltip/name context | No student switch inside Show All | Event details and grade badge |
| Squadron-person link (`pid`) | Add-student roster picker; linked Student chip dot/title | Callsign, seat/category in picker; linked dot/title on chip | Pick person when adding | Free-text callsign fallback |
| Squadron-person link | Export file | Yes, as `pid` | No | Enrolment id/name |
| Squadron-person link | Elsewhere | No | No relink/unlink control | None |
| Grade: DCO/DPCO/Marginal/N.A./not done | Ball wedge | Fill colour | Tap selected wedge/centre, then choose grade | Failure ticks and cyan selected-student edge |
| Grade | Show All | Active student’s badge | No grading there | Event name/details |
| Grade | Grading pop-up | Current choices | Set/clear | Done date, failures, event details |
| Grade | Details bubble | Grade and done date | No | Event details and failures |
| Grade-derived totals | Overall and category cards | Completion %, done, remaining, category totals | No | N.A. counts, progress bar |
| Availability derived from grades/prerequisites | Yellow ball ring; Next event; Plannable now | Yes | Side-panel chips jump to ball; no direct mark | Search ring, selected ring; chip details bubble |
| Failure count | Red ticks on ball, pop-up count, failure-card total | Yes; ball caps visible ticks at six | `+`/`−` in pop-up | Wedge grade and other rings |
| Each failure | Pop-up list, Failures chips, failure log | Label `ST-01`, `ST-01X`… | Date edit in failure log | Event name and ordinal |
| Failure date | Pop-up list, chip tooltip/bubble, failure log, Details bubble | Yes | Set next failure’s date in pop-up; re-date in log | Failure count and grade |
| Done date | Pop-up and Details bubble | Yes | Set before marking; re-date afterward | Grade; flight may also update Last Flown |
| Done date | Show All and ball | No | No | Grade alone is shown |
| Last Flown—Syllabus | Currency card and derived “days since”/flex bar | Yes | Date box | Last Currency, down days, upchit |
| Last Flown—Currency | Currency card and landing-currency bar | Yes | Date box | Syllabus date and down-day deduction |
| Down days | Currency card and effective-currency calculation | Yes | Number box | Raw and adjusted day counts |
| Upchit date | Currency card | Yes | Date box | Other currency fields |
| Pace, events/week | Pace card | Value and projected end | Number box | Remaining-event count and lull adjustment |
| Target A/B | Pace card | Date and required events/week | Date boxes | Projected end and lull adjustment |
| Lull period | Lull card chips | Start/end dates | Add, edit by tapping chip, remove | Copy button |
| Lull period | Calendar pop-up | Existing spans and selected start | Pick two days; month navigation | Today mark and other lull spans |
| Lull copy | Copy pop-up | Source and targets | Tick targets and Copy | Replacement warning |
| Last active student | Crew dropdown/bar-peek strip | Current student | Select | Stored id is not shown |
| Last marked event/syllabus | Behaviour only | No record text | Choosing student/course scrolls to it | Search ring/board scroll |
| Audit stamp `by`/`at` | Screen | No | No | Nothing |
| Audit stamp `by`/`at` | Export file | Yes, within mark/date records | No | Grade, failures and dates |
| Save/dirty state | Header save slot | Unsaved structural flow edits and last status | Save changes | Button appearance shares a fixed-width slot |
| Search state | Header search/predictions; ring on ball | Query, count and current hit | Type, arrows, Enter, prediction click, clear | Availability ring and selected rings |
| Phone Flow/Info mode | Three phone tabs | Active view | Switch Flow, Info, Show All | Arrange/details hint immediately above |
| Toolbar-hidden preference | Slim bar-peek strip | Active student and “Show bar” | Restore bar | Replaces all selectors/actions while hidden |
| Export contents | Export modal | Charts/students choices and visible syllabus list | Tick and Export | Privacy warning |
| Import contents/results | Conflict, name, students confirmation and result dialogs | File decisions and status | Replace, add as new, include/refuse students | Existing local charts and data |

## 2. Door list

### Data-changing doors

| Action | Control/gesture | Admin/member | Desktop/phone and state | Missing or inert case |
|---|---|---|---|---|
| Set or clear grade | Tap selected wedge/ball centre → grading pop-up | Both | Both widths; arrange/details mode must be off | With no student, the full pop-up is drawn but grade buttons do nothing |
| Select another student from a ball | Tap their wedge | Both | Especially thin with 5–6 students on phone | No text alternative on the ball; Crew dropdown remains the reliable route |
| Add failure/remove latest | `Fails +/−` | Both | Pop-up | `+` refuses N.A.; correct |
| Choose next failure date | `Failed on` input | Both | Pop-up | Changing it alone stores nothing; this is intentional |
| Re-date completed mark | `Done on` input | Both | Pop-up after done grade | No Show All date-edit door |
| Re-date earlier failure | Failures title → date inputs | Both | Side panel/Info tab | None |
| Set Last Flown, down days, upchit | Currency-card inputs | Both | Side panel/Info tab | No audit-stamp viewer |
| Set pace and targets | Pace-card inputs | Both | Side panel/Info tab | Not covered by Tracker’s visible undo |
| Add/edit/remove lull | Lull buttons/chips/× | Both | Side panel/Info tab | Not covered by visible undo |
| Copy lulls | `Copy to…` | Both | Disabled with fewer than two students | Replaces targets; no visible undo |
| Add student | Students `+ Add` | Both | Roster picker when bridge populated; old prompt otherwise | Held roster looks empty and Add looks live until pressed |
| Rename/remove student | Chip pencil/× | Both | Both widths | Removing the active student does not close an already-open grading pop-up |
| Reorder students | Students `Reorder` | Both | Drag or ▲/▼; arrows are phone route | Disabled below two |
| Select/add/rename/reorder/delete course | Course selector/pencil menu | Both | Both widths | Deleted course’s retained records have no restore door |
| Select/add/duplicate/rename/reorder/delete syllabus | Syllabus selector/pencil menu | Both | Both widths | Duplicate tooltip says marks are copied, implementation starts empty |
| Restore deleted built-in syllabus | Syllabus reorder modal | Both | Both widths | Custom syllabi have no restore door |
| Enter/leave arrange mode | Syllabus pencil → Edit/Done | Both | Both widths | Chart zoom control hides; grading is replaced by edit gestures |
| Move balls/groups | Drag / Select tool | Both | Pointer/touch | Position auto-saves |
| Add event | `+ Flight/Acad/Test/Sim/Device` | Both | Arrange on | Structural event waits for Save changes |
| Edit event | Text tool, double-click, raw event editor | Both | Arrange on | One direct edit mixes auto-saved detail data with unsaved structure |
| Connect/delete prerequisites | Connect/Delete tools | Both | Arrange on | None found statically |
| Draw/edit/delete free lines | Line/Edit lines/Delete | Both | Arrange on | None found statically |
| Arrow/merge/unmerge | Arrange buttons | Both | Arrange on | With nothing selected, a hint should appear |
| Change font | Font box | Both | Arrange on | No numeric display outside arrange mode |
| Reset layout | `Reset layout` | Both | Arrange on | Deletes hand-drawn lines after confirmation |
| Save structural edits | `Save changes` | Both | Only appears dirty | Not required for moved balls, marks, dates, details |
| Undo/redo | Header arrows or shortcuts | Both | Both widths; ignored in text inputs/dialogs | Only mark/date and chart-edit snapshot history; excludes imports, courses, students, pace, lulls and detail-only edits |
| Import | File → Import | Admin only | Both widths | Entry guard exists, but the role is not rechecked after picker/dialog awaits |
| Export | File → Export | Admin only | Both widths | Hidden charts cannot be selected |
| Search/jump | Search box/predictions | Both | Fixed phone strip; inline desktop | Read/navigation only |
| Show details | `ⓘ` | Both | Both widths | Turns grading off; visible hint supplies exit |
| Show All/edit details | Show All button/tab → Edit | Both | Header button desktop, tab phone | Format placeholder differs from the D64 wording |
| Hide/restore bar | `⌃` / bar-peek | Both | Both widths | Bar-peek shows a blank student name on an empty course but still restores the bar |
| Zoom | Chart/Panel controls; pinch chart | Both | Both widths; chart zoom hidden in arrange | Resizer is desktop-only |
| Switch phone view | Flow/Info/Show All tabs | Both | Phone only | No equivalent tabs are needed on desktop because both columns show |

### State-specific expectations

- Member: every editing door remains. File menu must be absent, and direct Import/Export entry points must refuse.
- Admin viewing as member: same as member; returning to admin must restore File without losing the current chart or course.
- Arrange on: ball clicks must never grade; all edit tools must reach every visible ball and line; hints must not cover view tabs or legend.
- Hidden chart: absent from syllabus dropdown, present under Reorder → deleted built-ins, and—under D120—must survive the export/import round trip.
- Empty course: Students card must offer Add; marking controls should be disabled or replaced with an “Add a student” explanation.
- Student with no marks: zero completion, first event landing, correct available rings, no stale failure/done data.
- Held roster: roster mutations refuse, but the card currently gives no advance warning. This is confirmed in code/docs but excluded as a finding under D120 because it only arises in the old-data converter.
- No squadron roster handed over: Add must be exactly the standalone free-text prompt.
- Roster changes while open: Add picker and linked-dot/title must refresh; existing enrolment labels and marks must not be silently rewritten.
- Logout/login: durable Tracker data remains, but the incoming session must not inherit the outgoing user’s undo history, pop-ups, details/arrange mode, or unsaved editor draft.
- Phone ↔ desktop: state and selected student/chart must survive; neither column nor controls may be painted over or stranded.

Actions that stored data supports but no screen offers:

- Restore a deleted course using its retained course id and records.
- Restore a deleted custom syllabus.
- Export hidden/deleted-chart state.
- View the stored `by`/`at` audit stamp.
- Relink or unlink an enrolment from a squadron person.
- Undo/import as one operation.
- Undo student/course/syllabus management, pace, lulls, or detail-only edits.
- Inspect the exact stored x/y positions, routing metadata or stable ids. This last omission is acceptable; the chart is the intended editor.

Drawn controls that can do nothing:

- The complete grading pop-up on a course with no active student.
- `+ Add` on a held roster appears live until it raises the refusal.
- Appropriately disabled controls—Undo/Redo, student reorder, lull copy—are not defects if visibly disabled.

## 3. Ranked failure scenarios

### Top 15 — full walk

#### 1. Hidden chart survives export → wipe → import

- Setup: In a disposable profile, edit a built-in chart, save it, then delete it so it appears under “Deleted built-in syllabi.”
- Action: Export all available charts. Import into a separate fresh profile representing the post-wipe Tracker. Open Syllabus → Reorder.
- Expected: The deleted/hidden chart and its hidden status survive; restoring it yields the exact saved chart.
- Disproof: It is absent from both the dropdown and deleted-built-ins list, or restoring produces only the shipped chart.
- Status: **CONFIRMED defect.** Export obtains ids from the visible-only `orderedSylIds()`, and the export modal uses the same list: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:780), [Modals.jsx](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/components/Modals.jsx:330).
- Exact expected fix: Extend the current file format with hidden/tombstone state; collect the full syllabus catalogue rather than only visible ids; apply definitions/layouts first, then restore hidden/tombstone state and verify a restored hidden built-in matches the export.

#### 2. Custom chart order survives the owner’s round trip

- Setup: Put four charts in a distinctive order, e.g. D–B–A–C. Export all four.
- Action: Import into a fresh profile.
- Expected: Dropdown and Reorder modal show D–B–A–C.
- Disproof: Default or pre-existing order remains, or imported charts are merely appended.
- Status: **CONFIRMED defect.** Order is applied only when `applyCharts` receives a whole block without `ids`; UI Import invokes it one chart at a time with `ids:[id]`: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:4790), [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:5182).
- Exact expected fix: Record each source→destination id decision during import, then, after all chart decisions, apply the remapped file order once, followed by local charts not in the file, in the same import gesture.

#### 3. Same-code event details stay specific to each syllabus

- Setup: Choose two syllabi containing the same event id. In syllabus A, set a conspicuous name/format/crew; in B, set different values.
- Action: Switch A → B → A, then reload.
- Expected: Each chart retains its own details.
- Disproof: Editing A changes B, or the last save wins globally.
- Status: **CONFIRMED defect.** User overrides are stored as `eventInfo[eventId]`, not syllabus+event: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:106), [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:3707).
- Exact expected fix: Re-key overrides as `{[sylId]: {[eventId]: detail}}`; update `infoFor`, all three editors, reset, export/import validation, and current-format round-trip tests; provide no legacy migration because D120 excludes old data.

#### 4. Direct ball editing does not leak a syllabus profile

- Setup: Open a short-course chart whose same-id event has different baked details from the long chart.
- Action: Double-click the ball, alter only its printed text or type, leave Crew/Prerequisite fields untouched, and Save. Switch to the long chart.
- Expected: Only the requested structural field changes on the short chart; long-chart event details stay unchanged.
- Disproof: The short chart’s crew/prerequisite profile appears on the long chart.
- Status: **CONFIRMED defect.** The direct editor reads syllabus-specific `infoFor`, then diffs against global base data and writes a global override: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:3231).
- Exact expected fix: Route the direct editor through the same syllabus-aware detail writer as scenario 3; compare against the current syllabus profile and store under the current syllabus id.

#### 5. Importing one chart cannot change another chart’s details

- Setup: Give chart A and chart B different user details for a shared event id. Export A only.
- Action: Change B locally, then import A.
- Expected: A is replaced; B is byte-for-byte unchanged.
- Disproof: B adopts A’s name, format, hours, crew or prerequisite note.
- Status: **CONFIRMED defect.** Export carries the full global details table and Import merges every entry globally: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:4688), [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:4798).
- Exact expected fix: Export details only under each selected syllabus id and import only details belonging to the accepted chart ids.

#### 6. “Duplicate syllabus” matches its visible promise

- Setup: Mark two events, add failures and dates, and set pace/lulls for one student.
- Action: Use Syllabus → Duplicate.
- Expected from the button tooltip: exact chart copy including every student’s marks.
- Disproof: New chart has an empty roster/marks while the source remains marked.
- Status: **CONFIRMED defect.** Header promises marks; implementation explicitly creates no student-layer copy: [Header.jsx](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/components/Header.jsx:218), [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:4316).
- Exact expected fix: Either copy every course’s roster/marks/dates for the source syllabus to the new id in the duplication gesture, or—if clean duplication is the owner’s ruling—change the title and confirmation to say “structure only, no marks.” The current contradiction cannot remain.

#### 7. Switching course/syllabus closes a grading pop-up

- Setup: Open the grading pop-up for an event. Do not close it.
- Action: Switch syllabus, then repeat while switching course. Press DCO in any pop-up that remains.
- Expected: Successful switch closes the old pop-up before the new chart becomes active.
- Disproof: Old pop-up remains and grades a same-id event on the new chart or creates a mark for an event absent from it.
- Status: **CONFIRMED defect.** Chart loading clears search/history but not `pop`; `popGrade` does not verify that its event still exists: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:1618), [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:3550).
- Exact expected fix: After a switch is accepted and before changing `plan/course`, clear all record-bound overlays. Also refuse grade/failure/date writes unless the active student is on the current roster and `byid[popId]` exists.

#### 8. Removing the active student cannot retarget their open pop-up

- Setup: Student A active; open a grading pop-up. Leave it open.
- Action: Remove A from the Students card and confirm.
- Expected: Pop-up closes; first remaining student may become active, but receives no action.
- Disproof: Pop-up title changes to B or remains open, and its buttons grade B.
- Status: **CONFIRMED defect.** Removal changes `active` directly without `closePop`, unlike `setActive`: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:3829), [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:3913).
- Exact expected fix: Set `pop=null` inside the removal gesture before selecting the replacement; clear failure/lull dialogs if their student is removed; add writer-side membership guards.

#### 9. Logout/login starts a clean Tracker session

- Setup: As admin, create one undoable mark; open Details mode and a grading or Show All pop-up; optionally leave an unsaved structural edit.
- Action: Log out, log in as the other account, reopen Tracker.
- Expected: Durable data remains, but Undo/Redo are empty and every transient editor/mode is closed. No outgoing user draft is exposed.
- Disproof: Incoming user can undo the previous user’s mark, sees an old modal, or inherits arrange/details/unsaved state.
- Status: **CONFIRMED missing reset seam.** Host reset only updates the file lock, while Tracker history/transients are module state and the lazy module remains loaded: [store.ts](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/state/store.ts:328), [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:581).
- Exact expected fix: Add a lightweight no-engine-import session-reset signal beside `role.js`; call it from `resetSession`; have `core.js` clear undo/redo and all transient overlays/modes/drafts, then reload the current chart from stored data.

#### 10. Import is one undoable operation

- Setup: Export a file containing two charts and students. Make a distinct local mark before importing.
- Action: Import both charts and students, then press Tracker Undo once.
- Expected under the one-command/undo promise: the complete import reverses as one action; a second Undo reaches the earlier local mark.
- Disproof: Undo is disabled, only reverses the old mark, or reverses one imported fragment.
- Status: **CONFIRMED acknowledged defect.** Whole-import undo granularity remains open in `OUTSTANDING.md`, and the local Tracker undo excludes Import: [OUTSTANDING.md](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/OUTSTANDING.md:427), [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:2556).
- Exact expected fix: Perform all accepted chart decisions, student reconciliation and final order in one `trkGesture`/global timeline entry with one inverse over every touched logical record.

#### 11. Deleting a course has a truthful recovery path

- Setup: Create a course, add a student and mark an event.
- Action: Delete the course; press Undo; if unavailable, create another course with the same name.
- Expected: Either Undo/Restore returns the original id and records, or deletion explicitly destroys them.
- Disproof: Dialog says marks remain, but Undo does nothing and the same-name course is empty because it has a new id.
- Status: **CONFIRMED defect in the visible promise/recovery door.** Deletion removes only the course index entry and offers no restore path: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:4206).
- Exact expected fix: Make course deletion a soft delete retaining the course entry/id in a deleted-courses list; add Restore to course reorder. Alternatively purge the namespace and change the confirmation to say the data is permanently deleted.

#### 12. View-as-member interrupts an in-progress Import

- Setup: As admin, import a file that produces at least two conflict/confirmation dialogs.
- Action: After the picker returns and the first dialog appears, use the host Admin badge to switch to Member before accepting the next write.
- Expected: Import aborts before any further admin-only write and reports that the role changed.
- Disproof: Charts or students continue importing while the File menu is absent.
- Status: **CONFIRMED missing write-path recheck; practical reachability must be tested.** `fileLocked` is checked only before the first awaited picker: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:5166).
- Exact expected fix: Capture a role/session epoch at entry and recheck it after the picker and every human dialog, immediately before each `applyCharts`/`applyStudents` call.

#### 13. Empty course never presents live-looking dead grading controls

- Setup: Add a new course and leave it with no students.
- Action: Tap a ball, then DCO and Fail `+`.
- Expected: Ball does not open grading, or opens a clear “Add a student first” panel with a working Add door.
- Disproof: Full grading controls appear, but DCO merely closes and Fail does nothing.
- Status: **CONFIRMED defect.** `ballTap` always opens the pop-up; `popGrade` later discovers there is no student and silently closes: [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:3448), [core.js](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/app/core.js:3553).
- Exact expected fix: Gate `ballTap/openPop` on an active enrolment and expose Add student from the empty-state message.

#### 14. Every Type/format editor carries D64’s hint

- Setup: Open the normal event-details editor and photograph its empty Type/format field; then open Show All → Edit for an event with an empty field.
- Action: Compare the grey placeholders.
- Expected: Both say `e.g. Lecture, OFT/AMT, 2 x F-15`.
- Disproof: Show All still omits `2 x F-15`.
- Status: **CONFIRMED missing renderer.** The modal is updated; the Show All inline editor is not: [Modals.jsx](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/components/Modals.jsx:174), [ShowAllPanel.jsx](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/src/tracker/components/ShowAllPanel.jsx:31).
- Exact expected fix: Use one exported placeholder constant in both editors.

#### 15. Held roster has a visible state before any mutation is attempted

- Setup: Requires a deliberately interrupted old enrolment-id conversion.
- Action: Open its course and inspect Students before pressing anything.
- Expected: A persistent one-line “crew list is being moved; reload” notice; Add/rename/remove/reorder disabled.
- Disproof: Empty-card copy says “No students,” Add looks live, and only the press explains the hold.
- Status: **CONFIRMED known display gap**, documented at [known-gaps.md](/C:/Users/User/projects/Raptor/.claude/worktrees/ecstatic-mcnulty-c984d5/raptor-port/docs/tracker/known-gaps.md:90). **Do not log it as a D120 finding**: it exists only in an older-data converter state.
- Exact expected fix if ever retained: expose `rosterHeld` in SidePanel, render the notice, and disable all four roster controls.

### Scenarios 16–42

| Rank | Setup | Action | Expected | Observation disproving correctness |
|---:|---|---|---|---|
| 16 | Mark event, then rename student | Reload and inspect every chart | Same enrolment id, mark, dates, pace, lulls and link; new label everywhere | Lost/duplicated mark or old name on another chart |
| 17 | Rename student first | Then mark, fail and date | Writes land under unchanged id | Data appears only on current chart/name |
| 18 | Rename course after marks/lulls | Reload and export | All records stay attached | Empty course or duplicate old-name course |
| 19 | Rename syllabus after marks | Reload, export/import | Marks and layout stay with stable id | Empty marks/layout or duplicate catalogue entry |
| 20 | Open grading pop-up for A | Switch Crew dropdown to B | Pop-up closes and board lands on B’s latest work | Popup remains or A’s rings remain |
| 21 | Open grading pop-up; scroll deep | Mark grade and add failure | Chart stays at same scroll position | Board jumps to last/first event |
| 22 | A has latest work low; B has none | Switch A→B→A | B centres first event; A centres latest event | Bare top-left reset or wrong student’s event |
| 23 | Failure plus date, grade plus done date | Undo/redo alternately | Each step restores complete record and stamp | Count/date split, Last Flown drift, wrong tooltip |
| 24 | Grade a flight on newer date | Grade older flight afterward | Last Flown remains newer | Last Flown moves backward |
| 25 | Edit a failure date twice quickly | Undo once | Returns to original pre-edit date | Only one keystroke is reversed |
| 26 | Change pace, target, lull | Press visible Undo | The walk must expose current limitation clearly; no unrelated mark may be undone accidentally | Undo tooltip claims the pace/lull action but restores something else |
| 27 | Add a custom event and Save changes | Reload | Event, links and details remain | Event disappears or details survive without event |
| 28 | Direct editor changes text and crew together | Press Undo before Save changes | One gesture should reverse both or UI must explain split saving | Text reverts but crew remains, or vice versa; **predicted from code** |
| 29 | Delete an event with marks, then Undo | Save, reload, repeat without Undo | Undo restores exact event/links/layout; permanent deletion must not make old marks silently reappear on a later same-id event | Orphan mark resurfaces or free-line anchor is wrong |
| 30 | Delete built-in syllabus with edits | Choose Revert edits only | Built-in remains, shipped def/layout return, student data follows stated rule | Chart deleted/tombstoned or unrelated chart changes |
| 31 | Delete custom syllabus | Press Undo | Current dialog says cannot undo; Undo must not claim it can | Undo tooltip names deletion but fails/partially restores |
| 32 | Start unsaved raw/structural edit | Switch syllabus, cancel discard | Same chart/draft remains | Selector moves or draft disappears |
| 33 | Same start | Confirm discard and switch | New chart clean; old unsaved structure gone; auto-saved details behave consistently | Dirty indicator follows to new chart or mixed partial edit is unexplained |
| 34 | Arrange on, select every ball | Change font; draw/cross/merge/unmerge line; Save | No ball/tool covered; exact appearance survives reload/export/import | Missing event, hop, arrowhead or font |
| 35 | Arrange on at first/top event | Use every tool on top-left and bottom-most balls | Every gesture reaches them | Hint/toolstrip/view tab intercepts pointer |
| 36 | Five or six students at phone width | Tap each wedge, centre and failure ticks | Correct student selected; centre grades active student | Adjacent wedge selected or tick/ring steals tap |
| 37 | Phone on Info with popup/calendar open | Rotate/widen to desktop, then narrow | Correct columns and overlays remain reachable/in viewport | Overlay clipped, both phone columns stack, or view tabs cover hint |
| 38 | Desktop at custom chart/panel zoom and scroll | Resize to phone and back | No data/state loss; auto-fit only if user did not take zoom over | User zoom unexpectedly reset or chart stranded off-screen |
| 39 | Hide bar with active student | Leave Tracker, return, reload | Slim strip names student and restores bar; preference persists per browser | No recovery handle or other browser/user inherits via shared data |
| 40 | Change squadron roster while Tracker open | Reopen Add; inspect linked chips | Picker refreshes; archived/ground bodies absent; existing marks unchanged | Stale picker, duplicate enrolment, mark loss |
| 41 | Remove/rename squadron person linked to student | Inspect chip; add same person/callsign again | Clear orphan/relink behaviour; no duplicate id | Silent duplicate, wrong link, or marks split |
| 42 | No roster bridge | Press Add, type callsign, rename, mark, export/import | Pure standalone workflow works | Empty roster dialog or Raptor-only assumption blocks it |

## 4. Explicit negatives

These are static clearances only; the executor should still photograph the high-value rendered cases.

- I checked role wiring and found both an affordance gate and entry-point gate for Import/Export. The remaining concern is role change after an awaited step, not a missing initial check.
- I checked member permissions and found marking, students, courses, syllabi, pace, dates and lulls are intentionally available to both roles.
- I checked linked-student identity and found marks, dates, pace and lulls use the enrolment id, not the visible label.
- I checked student rename and found it updates every course roster carrying that enrolment without re-keying marks.
- I checked course and syllabus rename and found both are label-only over stable ids.
- I checked add/remove/switch load ordering and found roster writers and syllabus flips share the same queue.
- I checked switching course/syllabus for stale search state and found `loadCourseNow` clears query, predictions and ring.
- I checked active-student switching and found it closes the grading pop-up and redraws availability rings.
- I checked grade/failure writes and found they preserve board scroll through redraw.
- I checked completed-flight handling and found Last Flown advances only to a later date.
- I checked failure representation and found count, per-failure date list, pop-up, side chips, log and Details bubble all have readers.
- I checked N.A. plus failure and found new failures are refused and old failure ticks are hidden rather than erased.
- I checked phone search and event-chip navigation and found both explicitly switch from Info to Flow before measuring the hidden board.
- I checked phone menus and found they are fixed-positioned to avoid clipping inside the horizontally scrolling header.
- I checked edit/details hints and found they occupy flow space instead of covering the phone tabs in the normal one-line case.
- I checked chart and side-panel zoom controls and found each is docked outside its scrollable content.
- I checked Export privacy defaults and found Students is reset off on every open, not merely the first.
- I checked charts-only Import and found the chart writer does not write roster, mark or date keys.
- I checked current-format student reconciliation and found it matches person id before name and preserves local students absent from the file.
- I checked empty student state and found Add is present and reorder is visibly disabled.
- I checked deleted built-in restoration and found a visible Restore door in the syllabus reorder modal.
- I checked unsaved structural edits on reload and found a `beforeunload` warning.
- I checked leaving and returning to the Tracker tab and found the page is intentionally kept mounted, with document-level Tracker keys disabled while another page is active.
- I checked the owner’s D56/D120 exclusion and did not treat legacy key conversion, legacy file reading, or already-stored demo-data-only harm as findings.
- I did not inspect or report syllabus wording under `src/tracker/data/`, per D62.

