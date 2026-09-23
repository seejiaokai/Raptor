# [HUMAN-RETEST] the Tracker — Astra (Codex, gpt-5.6-sol, high) final read, verbatim (23 Sep 26)

Brief: `docs/superpowers/briefs/2026-09-23-tracker-final-read-brief.md`. Read blind to Fable. Dispositions: the evidence sheet §11.

## Findings

### 1. A whole backup loses typed details belonging to a deleted built-in

**Owner summary:** After export → wipe → import, restoring a previously deleted built-in chart loses the event details typed on it.

- **Severity:** High
- **Provenance:** Newly introduced versus `main`. `main` exported the global details table; this branch restricts `eventInfoBySyl` to live charts without extending D127’s deleted-chart payload.
- **Scenario:**
  - Setup: Type a unique detail on the 2024 built-in, then delete 2024.
  - Action: Export every chart, wipe the app, import the backup, then use Reorder → Restore for 2024.
  - Expected: 2024 remains deleted after import, but Restore brings back its typed detail.
  - Observation: [`collectCharts`](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/app/core.js:4974>) copies details only for IDs in `order`, while `deleted` carries only IDs. The kept-deleted import loop at [core.js:5582](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/app/core.js:5582>) never restores a deleted chart’s detail block.
- **Exact fix:**
  1. In `collectCharts`, when `opts.deleted` is true, include each tombstoned built-in’s existing `eventInfo[id]` in `eventInfoBySyl`.
  2. Add canonical `sylcat` entries for those IDs so `fileFormat.checkCharts` accepts the detail references without adding them to `order` or `syllabi`.
  3. In `importClick`, before removing each ID named by `charts.deleted`, merge `charts.eventInfoBySyl[id]` into `eventInfo[id]` with `mergeBlock` and `shippedOfSyl(id)`.
  4. Save `eventInfo` once after the deleted-ID loop.
  5. Do not restore the chart definition or put the ID into `order`.
- **Test that should go red first:** Extend the D127 test at [retest.test.tsx:425](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/retest.test.tsx:425>): type a detail, delete/export, clear the local detail, import while deleted, restore, and assert the typed value returns.

### 2. Changing an event’s type leaves Last Flown stale

**Owner summary:** Correcting a marked event from Flight to another type—or the reverse—can leave a student’s Last Flown date wrong.

- **Severity:** Medium
- **Provenance:** Pre-existing on `main`, checked. This branch’s D123 recomputation still does not cover definition/type changes.
- **Scenario:**
  - Setup: Mark two Flight events done on 20 and 25 September.
  - Action: In the ball editor, change the later event from Flight to Acad and press Save changes.
  - Expected: Last Flown pulls back to 20 September.
  - Observation: [`saveEdit`](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/app/core.js:3296>) changes `ev.type`; [`persistSyl`](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/app/core.js:4445>) reconciles only removed IDs. No Last Flown settlement occurs. The reverse Acad → Flight similarly fails to advance it. Raw “Edit events,” revert, and imported definition changes have the same classification gap.
- **Exact fix:**
  1. Replace `wipeEventMarks(sylId, ids, def)` with a definition-aware helper taking `beforeDef`, `afterDef`, and `wipeRemoved`.
  2. Build the before/after Flight-ID sets and removed-ID set.
  3. Scan every course namespace for that chart.
  4. For saved edits and Revert, delete marks for removed IDs; for Import Replace, retain marks.
  5. Whenever the Flight set changes, recompute each affected dates record with `latestFlown(marks, id => afterFlights.has(id))` and `settledDates`, preserving hand-entered dates.
  6. Call it from `persistSyl`, “Revert edits only,” and `applyCharts` Replace.
- **Test that should go red first:** Add a D123 test beside [retest.test.tsx:616](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/retest.test.tsx:616>) covering Flight → Acad pullback and Acad → Flight advance through the production ball editor and Save changes.

### 3. A rejected command can leave global Tracker state visibly unrolled-back

**Owner summary:** If the command layer rejects a detail edit or course deletion, the saved record rolls back but the screen can continue showing the rejected change.

- **Severity:** Medium
- **Provenance:** Mixed. The `eventInfo` restore omission is pre-existing on `main`; this branch newly extends it to `DELCOURSES`.
- **Scenario:**
  - Setup: Start a command that edits event details or deletes a course, then make the transaction fail its post-apply validation.
  - Action: The command layer invokes `trkStore.restore`.
  - Expected: Both the persisted mirror and all live UI bindings return to the captured state.
  - Observation: [`trkStore.restore`](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/app/core.js:348>) restores `mem`, course, syllabus, and current-course state, but never calls `trkReloadGlobalsFromMem` and never reloads `DELCOURSES`. Normal global undo through `trkWriteRecords` is correct; rollback is not.
- **Exact fix:**
  1. In `trkStore.restore`, after restoring `mem`, `COURSES`, and the syllabus draft, call `trkReloadGlobalsFromMem()`.
  2. Rebuild `DELCOURSES` from `memGet(kDelCourses)`, applying the same valid-entry and non-live-ID filter as `loadDelCourses`.
  3. Then call `trkReloadCurrentFromMem(false)` and repaint.
- **Test that should go red first:** In [trk-write-seam.test.ts:45](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/trk-write-seam.test.ts:45>), capture, change `trk.eventinfo` and `v3:delcourses`, restore, and assert `infoFor` and `deletedCourses()` both match the snapshot.

### 4. Deleting a ball leaves its “last edit” navigation pointer behind

**Owner summary:** A newly re-created, ungraded ball can still be treated as the student’s most recently worked event.

- **Severity:** Low
- **Provenance:** Newly introduced versus `main`. `main` retained the old marks; D124 now wipes them but leaves the associated pointer.
- **Scenario:**
  - Setup: Grade ACG-03 so [`noteLastEdit`](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/app/core.js:3594>) records it.
  - Action: Delete ACG-03, save, re-add the same code, then reload or switch back to the student.
  - Expected: The new ungraded ball is not considered their last work.
  - Observation: [`wipeEventMarks`](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/app/core.js:4536>) deletes marks and failure dates but never deletes `v3:<course>:last:<student>`. Once the code exists again, [`showLastEdit`](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/app/core.js:3670>) accepts the stale pointer.
- **Exact fix:**
  1. During `wipeEventMarks`’ per-course read phase, scan `v3:<course>:last:*`.
  2. Parse each record and collect keys whose `syl` matches and whose `event` is being removed.
  3. Delete those keys inside the same `trkGesture` as the mark/date writes.
  4. For the loaded course, also remove the corresponding `lastEdit[student]` binding.
  5. Keep `lastStudent`; that preserves the selected person while allowing the existing first-event fallback.
- **Test that should go red first:** Extend D124 at [retest.test.tsx:659](</C:/Users/User/projects/Raptor/.claude/worktrees/plans-selector-followups-77a648/raptor-port/src/tracker/retest.test.tsx:659>) and assert `showLastEdit(student)` is false after the code is re-added.

## Explicit negatives

- I checked all D126 detail readers and editors—grading pop-up, details bubble, Show All, Edit details, ball editor, failure names—and found no other cross-chart read/write.
- I checked Reset to doc, Duplicate, custom deletion, in-session built-in delete/restore, Revert edits only, and raw Edit events; apart from the backup finding above, their detail ownership is correct.
- I checked the old `v3:eventinfo` carry-over and pre-D126 file import; they preserve real typed edits and constrain them to applicable imported charts.
- I checked D120 layout snapshots, off-screen automatic placement, chart order, untouched built-in “edited” status, and unsaved-export prompting; no further defect found.
- I checked D121 affordances and write paths; admin and member have the same Tracker access, including Import and Export.
- I checked D122’s per-chart merge, Skip/Add-as-new/relabel paths, and mark-preserving chart replacement; no further defect found.
- I checked grade Done/Not done/N.A., Done-on corrections, manual Last Flown flags, undo/redo, and D124 flight deletion settlement; they are correct apart from event-type changes.
- I checked deletion through the tool, keyboard, ball editor, raw event list, and Revert; marks and failure-day arrays are removed across live and deleted course namespaces. The remaining D124 omission is the last-edit pointer.
- I checked D127’s current-chart switch and last-chart guard, and D128’s delete/restore door, name collision handling, boot reload, record classification, and normal global undo; no other defect found.
- I checked D129’s Shell and Drawer logout paths, Stay/Discard/Save dismissal behavior, hidden-tab presentation, and the never-opened Tracker case; no defect found.
- I checked the pop-up viewport clamp, bubble hiding/refit effects, flash messages, lull Select all, save-corner layout, file-field validation, and syllabus-ID reconciliation; no additional finding.

## Section 4 roll-call corrections

- **A is incomplete:** “Export carries each exported chart’s own edits” misses retained details for a deleted built-in in a whole backup. The built-in delete/restore row is true only within the same store, not across D120’s export → wipe → import route.
- **A/D128 is missing rollback rows:** command-layer `write` follows `eventInfo` and `delcourses`, but `trkStore.restore` does not.
- **B is missing a row:** deletion must clear the matching `last edit` pointer as well as marks and failure days.
- **C’s “every writer” claim is wrong:** changing an event’s Flight classification through the ball editor, raw Edit events, Revert, or Import Replace is not represented.
- **D and E:** no correction found.

Static review only, as required; no builds or tests were run.

