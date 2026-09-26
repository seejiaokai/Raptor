# Final code-read report

Four findings, ranked by risk. All reproduce on newly entered data, so D56 does not exclude them.

## 1. High — Redo can revive a refused bid over a medical

**Setup**

1. Place an LL bid.
2. Close bidding and Refuse it.
3. Change the refused request to Ack.
4. Undo that Ack, returning the same request ID to `refused`.
5. File ATT C on the same day. Refused requests are historical, so filing the medical does not alter the Leave War cell.
6. Press Redo.

**What happens**

Redo succeeds and changes the same-ID request from `refused` to `acknowledged`, leaving a live leave bid beside ATT C. `restoreBlocker` skips it solely because that ID already exists:

```ts
if (r.kind !== 'request' || now.has(r.id) || r.state === 'refused') continue
```

**What should happen**

Redo must be refused by name and leave the request refused. B7 requires the same clash rules at every door, including redo; W3-F8 explicitly prohibits restoring a bid over a subsequently filed medical.

**Location**

- [`restoreBlocker`, store.ts:2170](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/leavewar/state/store.ts:2170), especially line 2185.
- [`globalRedo`, timeline.ts:588](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/undo/timeline.ts:588).
- [B7 and W3-F8 contract](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md:531).

**Branch status**

Already possible on `main`, which had no domain restore guard. This branch closes the absent-ID case but leaves this same-ID state-transition case open.

**Exact fix**

1. Parse `lw.cell` IDs from the right, exactly as `applyLwRecord` does: last colon before the date, previous colon before the person. Do not use the first colon because the store contract permits colons in war IDs.
2. Replace the `Set` of current IDs with a map from ID to current record.
3. For each non-refused request in the restore after-image, skip validation only if the current same-ID record is already a live request with the identical code/window.
4. Validate when the current record is refused, absent, or has a different code/window.
5. Project the Inputs after-images for the same restore, excluding an absence only when that after-image really removes or moves it away. Do not blanket-ignore every changed input ID.
6. Run the projected request through `barsWrite` against the projected absences and return the existing named refusal.
7. Add a regression test: refused LL → Ack → Undo → file ATT C → Redo is refused, ATT C remains, and the request remains refused.
8. Retain the existing test proving that undoing the original medical filing legitimately removes the medical and restores the displaced bid in one step.

## 2. High — Moving a due post-out into the future, or turning archive off, leaves the person archived

**Setup**

1. Post someone out on a past or current date with “Archive on PO date” enabled.
2. Let `runPoArchive` move them into Quals → Archived.
3. From their posted-out row, either:
   - move the PO date into the future, or
   - turn “Archive on PO date” off.

**What happens**

`setPostOut` changes only `to` and `poArchive`. Nothing reverses `PEOPLE[id].archived`, so the person remains archived even though the new date has not arrived or the sheet now says they will stay on the Quals roster.

**What should happen**

An archive created by the PO must follow the current PO date and switch. Moving the date forward or disabling the switch must restore the body now. This follows the “archive on PO date” contract and W5-F1/F2’s rule that the archive made by posting belongs to that posting.

**Location**

- [`setPostOut`, store.ts:1487](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/leavewar/state/store.ts:1487).
- [`runPoArchive`, sync.ts:1363](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/leavewar/sync.ts:1363).
- [`PostOutSheet`, BidPicker.tsx:984](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/leavewar/ui/BidPicker.tsx:984).
- [W5-F1/F2 contract](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md:544).

**Branch status**

Already on `main`. The branch fixes clearing a PO through “Undo post out,” but does not reconcile archive state when the PO is edited.

**Exact fix**

1. Add persisted provenance to the posting record, such as `poDidArchive`, initially false.
2. Set it true only when `runPoArchive` itself changes an unarchived Raptor body to archived.
3. Route every PO change through one sync-layer command that updates the Leave War posting and the Raptor body atomically.
4. When a PO-created archive exists and the new PO is future-dated, archive is disabled, or the PO is cleared, set `body.archived = false` and clear the provenance marker.
5. When archive is enabled and the new date has already arrived, archive immediately and set the marker.
6. Persist the people projection, validate, and notify within the same command as the posting change.
7. Add tests for past→future, archive-on→off, future→past, and clearing the PO.

## 3. Medium — Calendar drag moves an absence but leaves its old “till” date

**Setup**

Create a multi-day leave or medical whose remarks contain its generated date token, for example `Bali till 24 Jul`.

**Action**

Drag its calendar chip seven days forward.

**What happens**

`commitChipMove` shifts `draft.start` and `draft.end`, but carries `draft.remarks` unchanged. The record can therefore cover 27–31 Jul while still saying `till 24 Jul`. The upchit editor’s plain date input has the same missing rewrite.

**What should happen**

The token must move with the dates, preserving the surrounding user text: `Bali till 31 Jul`. B7 requires parity across doors, and D189 treats the app’s date-bearing words as part of the record.

**Location**

- [`commitChipMove`, caldrag.ts:64](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/ui/caldrag.ts:64), especially lines 107–123.
- [Upchit date field, inputedit.tsx:1864](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/ui/inputedit.tsx:1864).
- [`remarksTailWord` and `withRemarksTail`, inputs.ts:857](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/engine/inputs.ts:857).
- [D189](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/.claude/rules/decisions/scheduler.md:44).

**Branch status**

Already on `main`. This branch corrects cuts through `sliceInput`, but complete re-dates still bypass that body.

**Exact fix**

1. Put the invariant in `commitInputEdit`, the common final writer, rather than adding another UI-only patch.
2. After normalization, detect whether the start or end date changed.
3. Use `remarksTailWord(draft.remarks)` to detect an existing generated `on`/`till` token.
4. If present, call `withRemarksTail` with the normalized destination dates and the existing token kind before assigning `r.remarks`.
5. Leave remarks without a generated token untouched.
6. Ensure the rewritten remark participates in the existing published-day pending/sign-off invalidation.
7. Add focused tests for calendar-dragged LL, calendar-dragged ATT C, and the upchit date field, including surrounding text before and after the token.

## 4. Medium — “Undo post out” can remove an independent manual archive

**Setup**

1. Set a future PO with “Archive on PO date” enabled.
2. Before that date arrives, manually archive the person from Quals.
3. From a future posted-out cell, press “Undo post out.”

**What happens**

`undoPostOut` treats `body.archived && p.poArchive === true` as proof that the PO caused the archive. It calls `restoreArchivedPerson`, clearing the PO and unarchiving the manually archived body.

**What should happen**

Only an archive actually made by that PO should be reversed. W5-F1 says Undo takes back “the archive the Post out made,” not an independent Quals action.

**Location**

- [`undoPostOut`, sync.ts:1427](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/leavewar/sync.ts:1427).
- [Manual Quals archive, QualsPage.tsx:425](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/src/ui/QualsPage.tsx:425).
- [W5-F1 contract](/C:/Users/User/projects/Raptor/.claude/worktrees/absence-record-d147-af6a50/raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md:549).

**Branch status**

New on this branch. `main` failed to undo PO-created archives at all; this replacement over-corrects by inferring causation from the switch.

**Exact fix**

1. Introduce the `poDidArchive` provenance marker described in finding 2.
2. Set it only when `runPoArchive` performs the archive transition.
3. Make a manual Quals archive leave that marker false.
4. Change `undoPostOut` to call `restoreArchivedPerson` only when `poDidArchive` is true.
5. Otherwise clear only the posting record and preserve the manual archive.
6. Clear the marker in both the Quals Restore path and successful PO undo.
7. Add two paired tests: PO-created archive is undone; manually created archive with an enabled future PO is preserved.

## Explicit negatives

- **“Till” on a cut:** I checked `sliceInput`, `cutDates`, war un-approve/delete/move, `applyMedPlan`, `mintMedSegments`, and the Inputs table/modal calendars. Cuts and splits use the corrected rewrite. The remaining re-date defect is finding 3.
- **Medical moved asks:** I checked calendar drag, schedule reassign, Inputs inline edit, and the edit modal. Drag/reassign route through `medAskFor` and `MedMoveConfirm`; the form doors use the same `commitEditMedChoices`/`commitEditUpchit` bodies. I found no additional question-flow defect.
- **Posting:** All four visible posting doors use `postOutOr`/`postInOr`, preserve refused values, and show `postingProblem`. The tapped posting sheet is pinned. Quals Restore clears its posting atomically. The remaining lifecycle defects are findings 2 and 4.
- **Restore:** Shell, scheduler, and Leave War Undo/Redo all use the global timeline and its `restoreRefusal` hook; restored Inputs also pass through `vetRestore`. Credits are work, notices/refused requests are history, and same-closure removal of a medical is intentionally allowed. The same-ID transition hole is finding 1.
- **War switch and keyboard:** Every Leave War sheet uses the shared `Sheet` focus trap. Production war switches go through `selectWar`, and `Matrix` clears the open cell, selection, and move state on `period.id`. I found no additional stale-sheet route.
- **Bulk:** Fill, Approve, Refuse, Ack, Delete, and Post out reach their intended records and report counts consistently. Delete reaches a request beneath Inputs-filed leave. Bulk Move beneath filed leave remains the expressly registered `[LW-MOVE-BENEATH]` design gap, so I did not relabel it as a new finding.
- **Award code follows days:** The two visible edit doors—OIL Tracker and the tap-list editor—both use `editManualCredit`, which derives HO/FO from the quantity. Creation derives the code in `BidPicker`. I found no visible-door defect. The older `setCellDays` helper has no production caller.
- **Member read-only:** I checked the calendar, Inputs table, schedule/board entry, document viewer Edit/Upchit controls, and Medical view. Another member’s input opens through the inert read-only editor with Save/Delete absent; document details remain viewable as D211 requires. I found no write affordance or write-path bypass.
- **Shared-function regressions:** I checked all production callers of `setBidStates`, the shared `Sheet`, the phone-hold swallow, and the timeline hook. Counts and callers were updated consistently; the only timeline regression is finding 1.

No files were changed. No browser, server, or full suite was run. The focused Vitest command was attempted, but the read-only environment prevented Vitest from creating its temporary client directories (`EPERM`); collection stopped at 0 tests, so this report is based on the requested static code read.