# Astra red-team review — round 2

No repository files were changed.

## Round-1 findings

### Fable

1. **F1 — Yes.** Date-aware `availableFor` plus snapshot attributes in `peopleAttrsNow` prevents a past ALL / ALL AVAIL crowd from creating a deletion delta.
2. **F2 — Partly.** The refusal prevents resurrection, but the refused newest entry remains the entry selected forever, trapping Undo or Redo. Exact fix: change timeline selection as numbered change 2 below.
3. **F3 — Yes.** `deleted` / `gone` guards cover the Raptor writers, Leave War writers and visible doors; `archivedBy:'del'` keeps post-out undo from restoring him.
4. **F4 — Yes.** `applyDelete` is separated from the authorized user door and the outcome pass receives a properly enlisted projection command.
5. **F5 — Yes.** The corrected overlap table names the shared files, defers them to Part B and requires behavioral reconciliation after #444.
6. **F6 — Yes.** The projected `gone` mark gives the kept Leave War row, OIL tracker and posting refusals a stable deletion signal.
7. **F7 — Yes for the reported SANS case.** Turning Show SANS on exposes the row and its post-out sheet. The broader archived/no-account case is still misstated in question 2 below.
8. **F8 — Yes.** Snapshot attributes are returned for a deleted person on every day, leaving seat removal as the sole future-day delta.
9. **F9 — Yes.** `stashEditWeek` reaches days, signs, bindings, parked plans and OIL state, with unreadable/preserved weeks preflighted.
10. **F10 — Yes.** `poOutcome` and `poDone` are carried by both projection overlays, signatures, persistence and tolerant reading.
11. **F11 — Yes.** The shared callsign refusal includes blank and 14-character checks, with no silent `maxLength` truncation.
12. **F12 — Yes.** The member-view refusal now tells the admin to switch back to the admin view.
13. **F13 — Yes.** The account invariant, drawer label, probe comment, `setSign`, `signBind` and gap-preserving planning-puck removal are all stated.
14. **Fable Q1’s omitted rulings — Yes.** D91, D109/D113, D174/D176, D189, D204/D221 and D129 are now explicitly dispositioned.

### Astra

1. **A1 — Partly.** The sweep, preflight and materialization belts close the resurrection paths, but the refusal can trap Undo/Redo and a delete-only change can cause a pristine seed week to be persisted. Exact fixes: numbered changes 2 and 3.
2. **A2 — Partly.** Enable now arms the prompt, but the Tracker behavior still contradicts D299, and the chosen deletion clock creates a new two-clock inconsistency. Exact fixes: numbered changes 1 and 5.
3. **A3 — Yes.** Active/placeholder lookup is separated from multi-result archived lookup; stable ID-valued rows continue to resolve to their original person.
4. **A4 — Partly.** Calling one `windowFor` helper from both overlays fixes the double-overlay defect. Moving the whole historical row into SANS still contradicts “on that day.” Exact fix: numbered change 4.
5. **A5 — Yes.** Every manual SANS write clears `sanBy`; the same provenance rule is stated for manual Enable and Restore.
6. **A6 — Yes.** Posting commands now map to `LeavePersonProfile`, deletion lists its actual profile write, and role switching is guarded by the authenticated account role.
7. **A7 — Yes.** Both the warning and detailed pending list use the same snapshot-attribute result.
8. **A8 — Yes.** Shared files and functions are named, coordination is required before editing, and the integrated posting unit is re-read and re-tested.

## New defects introduced by the fixes

### 1. The two clocks make deletion depend on event order

A Delete posting dated between 13 July and the wall clock is due immediately to `runPoOutcomes`, although the scheduler still regards that date as future. The command then sets the global deleted/archive mark immediately while using the future PO date as its cutoff. He consequently disappears from Quals, pickers and account-facing roster surfaces before the app’s date reaches his posting, while scheduler days before the cutoff still treat him as present.

The opposite failure occurs for a hand delete on 27 September. Its cutoff is 13 July, so Leave War requests, credits and inputs from 13 July through 26 September are erased even though they are already past on the clock that runs the Leave War and posting pass. The following OIL pass does not restore those credits because `creditable` rejects everything on or after `deletedFrom`. Running the outcome before OIL therefore makes the wrong cutoff stable; it does not repair it.

A hand delete before a due posting, or a posting pass after a hand delete, also leaves outcome completion dependent on which guard observes the global deleted mark first. That secondary ordering should disappear once one effective clock governs both due-ness and cutoff.

### 2. A refused Undo or Redo can trap the timeline

`newestUndoable()` and `mostRecentlyUndone()` select an entry before the proposed deletion refusal is evaluated. Refusal leaves its state unchanged, so every later press selects and refuses the same entry. A disjoint older change that would be safe to undo becomes unreachable forever.

The refused entry must remain a conflict barrier for older entries touching the same records, but it must not block selection of a disjoint actionable entry.

### 3. A delete can persist a pristine seed week

Running the load-time belt before `weekBaseline` is correct: it does not suppress a published delta because publication compares the working day with `SCHED.orig`, not with the command or stash baseline. A stashed published future day therefore still reads pending after the deleted person is stripped.

The problem is the live delete. On a never-stashed pristine seed week, its sweep changes `weekStashSnap()` after the baseline was captured. `persistAll()` and `loadWeek()` then classify the week as dirty and store a full copy of the seed. That defeats the explicit rule that merely visiting or deriving a pristine week must not pin the built-in seed in storage.

### 4. The SANS default still rewrites history

`windowFor` fixes projection consistency, but global `san:true` moves the person’s entire row, including months before the posting date, into SANS. D283 says he moves there “on that day.” The approved picture does not establish how earlier months are grouped.

### 5. The callsign split does not introduce a further defect if implemented literally

The approve note must consult `archivedHolders` after active `nameToId` misses; Restore and Rename operate on explicit person IDs and use archived lookup only for collision presentation. Leave War and the Tracker project `PEOPLE` directly, while Tracker imports reconcile stable person/enrolment IDs rather than `ID_BY_CS`. Existing ID-valued schedule rows continue through `whoId`’s ID-first branch.

Every index writer named in §9 must actually call the central rule, especially hydration, people-store restore, add and archived rename. The reference harness cannot call the port function inside its separate JSDOM world, so its internal rebuild must mirror the active-or-placeholder filter. With those stated call sites, I found no additional callsign regression.

## The seven questions

1. **No-choice posting:** correctly stated; the proposed default preserves the existing “off manpower only” case.
2. **Delete on Archived rows:** misstated. Show SANS exposes an active SANS man, but it does not expose an ordinary archived person with no account and no posting window. The default therefore does not provide the claimed general door.
3. **Which today:** materially incomplete and unsafe to default. It mentions the visible July weeks but omits that the pass still uses the wall clock and that a hand delete would remove wall-clock-past Leave War and OIL records.
4. **Enable alone:** correctly stated. D280 permits account enablement without silently changing roster state, and D284 says the prompt itself changes nothing.
5. **Tracker:** wrong default. D299 already says a running-course place goes. “Leave it for now” requires the owner to amend or defer that ruling before the plan can claim completion.
6. **SANS history:** wrong default. Moving earlier months is not established by the approved picture and contradicts D283’s “on that day.”
7. **Overseas and the past:** correctly stated as a question about retaining current behavior.

## Exact changes required

1. **Resolve the clock before implementation.** Replace question 3 with the full 13 July / 27 September scenario, including a PO between the clocks, a hand delete, Leave War record removal and the following OIL pass. Obtain the owner’s answer before building. Introduce one injectable `effectiveToday()` used by both `runPoOutcomes` due-ness and `deleteCutoff`. If different domain cutoffs are intended, obtain an explicit ruling naming the scheduler, account, Leave War and OIL cutoffs separately; do not ship the present mixed default. Test PO-before/between/after both clocks, hand-delete-first, outcome-first, reload and OIL reconciliation.

2. **Make deletion-invalid history entries permanently non-actionable without hiding safe history.** Add a pre-snap `restoreRefusal(changes, dir)` predicate to the timeline’s candidate scan. `newestUndoable`, `mostRecentlyUndone` and `undoState` must skip an entry whose proposed image violates a deleted-person invariant and select the next disjoint actionable entry. Keep the skipped entry in `entries`, so `undoConflict` / `redoConflict` still blocks an older entry sharing its keys. If no actionable entry exists, return the deletion-specific refusal rather than “Nothing to undo.” Retain the same check immediately before `applyRestore` for race safety. Test refused newest plus safe older, refused newest plus overlapping older, and the corresponding Redo cases.

3. **Preserve the pristine-week rule across a live delete.** In `state/store.ts`, compare the live snapshot and `weekBaseline` after both have been normalized through the same deleted-person week-blob stripper. Use that comparison in both `weekDirty()` and `loadWeek`’s stash-on-leave decision; do not reset the whole baseline after deletion, because that could absorb unrelated user edits. A delete-only change to an unstashed seed week must create no `weeks/<week>` record, while a pre-existing user edit must still persist. Test delete-only pristine seed, edited seed then delete, stashed published future day, reload, pending count and sign-off validity.

4. **Do not build whole-row historical SANS movement as the default.** Obtain the answer to question 6 first. If “on that day” stands, add `sanFrom` and make grouping/window rendering date-effective so earlier months retain the old group and dates from `sanFrom` use SANS. Exercise the actual posting route before/on/after the date, Show SANS off/on/off and reload.

5. **Do not build the Tracker omission as a default.** Resolve question 5 before declaring this build complete. If D299 stands, define “running,” enlist the Tracker store in `person.delete`, remove only running-course enrolment and preserve finished-course marks/history. If the owner defers it, record an explicit narrowing or staged exception to D299 before implementation.

6. **Correct question 2 and close the no-account archived door.** Distinguish the hidden active-SANS case from an ordinary archived person with no account or posting window. Either obtain approval for an admin-only Delete action on the Quals Archived row, using the same confirmation and `deletePerson` command, or record the exact alternative production path that reaches every such person without restoring him merely to delete him. Do not describe Show SANS as the universal route.

**VERDICT: REVISE**

