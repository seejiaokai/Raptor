## Findings

### 1. High — A confirmation accepted before navigating can later unpublish a money-bearing day or discard edits with one tap

[state/view.ts](C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:268) treats board-day changes and board closure as navigation, but only resets `NAVGEN` and `OILDAY`. It does not clear `RESTARM` or `UNPUBARM`; those are cleared only by page, week, session, or preview changes.

**Failure scenario**

- **Setup:** Open Saturday on the scheduler board. Either:
  - tap Unpublish once on a day whose OIL is already bid against, arming `Withdraw — confirm`; or
  - preview an older issued version of a day with unpublished edits and tap Load once, arming `Discard N edits & load — confirm`.
- **Action:** Step to another board day and back, or close the board and reopen the same day. Tap the destructive control once.
- **Expected:** Navigation cancels the arm, so this tap merely presents the warning again.
- **Observed if wrong:** The old arm remains. The single tap unpublishes the day and withdraws its OIL, or discards the working-copy edits.

**Fix**

1. First extend the one-shot-confirm tests in [amendretest.test.tsx](C:/Users/User/projects/Raptor/raptor-port/src/ui/amendretest.test.tsx:206). Arm both states, perform `day → other day → day`, and assert `unpubArmed()` and `restArmed()` are false. Repeat for `day → null → same day`. These tests should fail first.
2. In `setBoardDay()` in [state/view.ts](C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:268), add `setRestArm(null, null)` and `setUnpubArm(null)` inside the existing `n !== SBDAY` transition branch, before assigning `SBDAY`.
3. Keep `n === SBDAY` repaint behavior unchanged.
4. Leave `closeBoardState()` using `setBoardDay(null)` so board close inherits the same cleanup rather than duplicating it.

**Origin:** Pre-existing on `main`. This branch partially fixed the defect for page changes at [state/view.ts](C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:452), but did not cover board-day changes or close/reopen.

### 2. High — The issued schedule’s information panel exposes unpublished working-copy tasking to members

[Modals.tsx](C:/Users/User/projects/Raptor/raptor-port/src/ui/Modals.tsx:20) calculates the title’s `dayCount` from live `DAYS`, and [dayInfoHTML](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1992) calculates waves, formations, aircraft, duties, ground items, tasked crew, leave, and availability from that same live day. `withOfficialWarn()` at [Modals.tsx](C:/Users/User/projects/Raptor/raptor-port/src/ui/Modals.tsx:41) swaps only the warning bundle, not the content being summarized. The branch hides the working-copy pending count, but leaves every other working-copy total visible.

**Failure scenario**

- **Setup:** Publish Monday as Original, then add a wave, ground item, or crew assignment to its working copy without publishing an AL.
- **Action:** As a member—or an admin viewing as a member—open View-only Schedule and tap Monday’s `ⓘ`.
- **Expected:** The title and “What this day is tasking” section summarize the frozen Original currently displayed.
- **Observed if wrong:** The issued day remains visually frozen, but its modal shows the unpublished working copy’s aircraft, wave, duty, ground, crew, leave, and availability totals. The title’s `dayCount` can differ too. An issued-version or stored-plan preview has the same live-content leak.

**Fix**

1. First add failing rendered tests in [amendretest.test.tsx](C:/Users/User/projects/Raptor/raptor-port/src/ui/amendretest.test.tsx:354):
   - publish a day, mutate its live structure, render `DayPop` on the view-only issued face, and assert both the title and tasking totals match the issued snapshot and exclude a live-only row;
   - preview an older issued version or stored plan on an edit surface and assert its modal summarizes that preview rather than `DAYS[di]`.
2. Add a display-world helper beside `withChipWorld()` in [html.ts](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:107). It must mirror `viewDayHTML()` exactly:
   - published view-only face: current issued snapshot plus official warnings;
   - view-only working-draft choice: live day plus working warnings;
   - active issued or plan preview: selected snapshot with no live warnings;
   - ordinary edit surface: live day plus working warnings.
3. In `DayPop()`, move the `DAYS[DAYPOP]` read, `dayCount()`, and `dayInfoHTML()` call inside that helper. Do not calculate the title before entering the selected world.
4. In `dayInfoHTML()`, select warnings consistently with the same world: official bundle for the issued face, working bundle for live content, and none for a historical/plan preview.
5. Preserve the branch’s issued-face suppression of the unpublished-edit chip.

**Origin:** Pre-existing on `main`. This branch changed [dayInfoHTML](C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1994) to hide only the live pending count; `Modals.tsx` and the remaining live-content readers are unchanged from `main`.

## Explicit negatives

- I checked `reconcileIssuedMarks()` and every publish/unpublish caller and found no case where the new reconciliation drops a real change, mutates another day, or loses deletion, reorder, filing, or OIL-only marks.
- I checked unpublish, undo/redo, `pulledBackDays`, redo abandonment, and live and parked-plan signature clearing and found no additional incorrect signature restoration or valid-redo refusal.
- I checked re-accepting an issued input across stable row IDs, reordered ground rows, duplicate-ID protection, and live plans and found no additional duplication or amendment-count defect.
- I checked the other visible unpublished-change counts and the week/board “Not yet signed” marker and found no additional raw-mark reader or issued-face marker leak beyond the modal finding above.
- I checked latest-published-version OIL derivation, publish/unpublish/undo notification paths, `oilDaySig`, cross-week stashes, and bid-against detection and found no remaining lag, feedback loop, or one-day-affects-another-day error.
- I checked member and admin-as-member access to sign, publish, unpublish, load, switch-plan, discard, stale-control, keyboard, and document-level click paths and found no reachable unauthorized write.
- I checked the Unavailable-row Undo, frozen board preview strip, plan-editor page gate, sign-off wording, Edit History notice, and new Logic-page entries and found no additional defect.
- No build or test command was run.

