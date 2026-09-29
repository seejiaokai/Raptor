# Astra change-recording scenario report

Read-only design review completed. I edited nothing and ran no tests or builds.

## 1. Roll-call

### Schedule, Inputs, Plan, and publishing

| Change surface | Current writer / record | Status | Visible door and expected route |
|---|---|---|---|
| Edit Schedule: duty, person, row, wave, timing, callsign, remarks, CX, and related day edits | Schedule command writers; `sched/*` | **Has it** | Shell `Undo`/`Redo` on Edit Schedule and scheduler-board `Undo`/`Redo`. Undo should snap to the affected day. |
| Drag/drop and board edits | Scheduler board command writers; `sched/*` | **Has it** | Board pair and Shell pair share the same global timeline. |
| Publish a day | Schedule publish command; `sched/*` | **Has it** | Undo must unpublish the exact version and reverse OIL consequences. |
| Unpublish a day | Schedule command; `sched/*` | **Has it** | Undo must restore the prior published version and its frozen face. |
| Input entry, editing, or clearing | Inputs command writer; `input/*` | **Has it** | No Inputs-local pair. Use a shared pair on Edit Schedule; Undo should snap to Inputs and the relevant week/person. |
| Input-only undo crossing to another week | Same global input record | **Has it, known presentation gap GU-E5** | Do not re-file the already-known failure to jump weeks unless a person is likely to encounter it through a new roster/settings route. |
| Plan/calendar edits in command scope | Plan command writers; `plan/*` | **Has it** | Shared global pair; Undo should snap to the affected plan/calendar context. |
| Off-week stash changes made by commands | `weekstash/*` | **Has it** | Shared global pair; loading context must restore the corresponding week. |
| OIL Earn selections | OIL command records | **Has it** | Board or Shell pair while in OIL mode. Undo stays inside OIL until the boundary. |
| OIL mode boundary | Undo mark recorded on entry | **Has it** | At the boundary, one press exits OIL and explains that the next Undo affects the day. A second press performs that day Undo. |
| OIL posting projection | Derived/system write | **Must not be an independent step** because it is an effect of the originating command | It reverses with its originating command. |
| Tracker navigation or plan pointer selection | View state only | **Must not be undoable** because it is not a durable domain edit | No Undo door is required; Tracker is outside this campaign. |
| Sorts, filters, open panels, folds, and selection | Local view state | **Must not be undoable** because these do not change shared domain state | No history entry. |

### Leave War

| Change surface | Current writer / record | Status | Visible door and expected route |
|---|---|---|---|
| Member bid entry/edit/removal | Leave War command writers; `lw/*` | **Has it** | Leave War `Undo`/`Redo`; Shell/board global pair should also reach the same entry. Snap to the relevant Leave War date/person. |
| Admin decisions and decision movement/removal | Leave War command writers; `lw/*` | **Has it** | Same global timeline and Leave War pair. |
| Leave War award deletion | Leave War command writer; `lw/*` | **Has it** under D260 | Undo restores the award only if its record has not subsequently changed. |
| Medical/bid conflict restore | `restoreRefusal()` in `undo-wire.ts` | **Has a specific refusal** | Refuse the whole Undo, leave state unchanged, and keep the blocked step at the top. |
| `lw.postouts` projection | Leave War posting record | **Must not yet be undoable** because CMDLF-002 explicitly defers it | No entry; do not rediscover this as a new defect. |
| Current Leave War date/tab | View state | **Must not be an independent step** | It may be restored as navigation context after a domain Undo. |

### Quals and roster — Part 2 build surface

| Change surface | Current writer / record | Status | Visible door and expected route |
|---|---|---|---|
| Add roster-only person | `roster-add.ts`; `people/<id>` | **MISSING** from the cut-over timeline | Shared global pair. Undo must snap to Admin → Users and refuse if surviving downstream records now depend on that person. |
| Add person with sign-in | `roster-add.ts` plus account settings write | **MISSING** | One atomic user action spanning `people` and `settings.accounts`; never expose a half-person or half-account state. |
| Callsign change | `quals-write.ts` / `peopleStore.write()` | **MISSING** | Snap to Quals and the person. Restore must validate active callsign uniqueness. |
| Initials, flight, CAT, personnel remarks | `quals-write.ts`; `people/<id>` | **MISSING** | Snap to Quals and the person; repaint all dependent labels and warnings. |
| Qualification ticks, including SANS, SXO, and SCHEDULER | `quals-write.ts`; `people/<id>` | **MISSING** | Snap to Quals. Recalculate validation, sign-off pickers, Leave War groups, and availability. |
| Archive person | Account/roster sync path; people, account, and Leave War effects | **MISSING** | One atomic step. Snap to Admin → Users. Undo must refuse if the old active callsign has since been taken or restoration would invalidate account state. |
| Restore archived person / Restore as | Account/roster sync path | **MISSING** | One atomic step; validate callsign, stint, account, and live-admin rules before changing anything. |
| Rename an archived person | Account/roster sync path | **MISSING** | Snap to Admin → Users; validate the candidate active name if the operation restores the person. |
| Delete person | `person-delete.ts`; tombstone/deletion writes | **Must never be Undo** under D287 | Pass over this entry. An older edit must not resurrect the deleted person. |
| Welcome/back acknowledgement | Person “back seen” writer | **Must not be Undo** because it is a read/acknowledgement marker | No history step. |
| Automatic callsign index or roster baseline rebuild | `peopleStore.write()` effects | **Must not be an independent step** | Rebuild as part of the originating action or its reversal. |

### Accounts, access, and guest settings — Part 2 build surface

| Change surface | Current writer / record | Status | Visible door and expected route |
|---|---|---|---|
| Give access to waiting request | `accounts.ts`; `settings.accounts` and `settings.accessreqs` | **MISSING** | Atomic shared command; snap to Admin → Users. |
| Refuse waiting request | `accounts.ts`; access-request settings | **MISSING** if refusal is classified as a durable administrative edit | Recommend recording it because it changes another person’s access disposition. |
| Add sign-in to existing person | `accounts.ts`; `settings.accounts` | **MISSING** | Validate unique sign-in/person mapping and live person before apply. |
| Edit sign-in name | `accounts.ts`; `settings.accounts` | **MISSING** | Validate unique normalized sign-in name. |
| Change account role | `accounts.ts`; `settings.accounts` | **MISSING** | Validate at least one enabled live admin remains and enforce the own-account guard. |
| Reassign account to a person | `accounts.ts`; `settings.accounts` | **MISSING** | Validate one account per person, one person per account, and person existence. |
| Suspend account | `accounts.ts`; `settings.accounts` | **MISSING** | Refuse if reversal would violate admin availability or current-actor own-account protection. |
| Enable account | `accounts.ts`; `settings.accounts` | **MISSING** | Archived people may not acquire enabled accounts. |
| Restore archived account/person | `accounts.ts` and roster sync | **MISSING** | One atomic cross-store command with full candidate validation. |
| Guest-view switch | Admin users/settings path; `settings.guestview` | **MISSING** | Snap to Admin and the guest-view control. |
| Pending user submits access request | Access request writer; `settings.accessreqs` | **Must not use global Undo**, recommended | Pending users have no global Undo door. Cancellation should be an explicit “Withdraw request” action if wanted. |
| “Requests seen” acknowledgement | `markRequestsSeen()`; `settings.accessreqs` metadata | **Must not be Undo** because it is notification/read state | No history step. |
| Automatic account cleanup, suspension on archive, seed repair, or load normalization | `accountsLoad()` and sync effects | **Must not be separate steps** | They must be contained in the initiating atomic command. Load-time normalization must not be used as restore validation. |

### Logic and configurable scheduler settings — Part 2 build surface

| Change surface | Current writer / record | Status | Visible door and expected route |
|---|---|---|---|
| Rule value edit | Logic page; `settings.rules` | **MISSING** | Snap to Logic and the affected rule. Revalidate working warnings. |
| Hard/soft rule-kind toggle | Logic page; `settings.rules` | **MISSING** | Same atomic settings command and page snap. |
| Reset rule settings | Logic page; `settings.rules` | **MISSING** | One settings step, not one step per rule. |
| Inputs lookahead | Inputs page; `settings.lookahead` | **MISSING** | Snap to Inputs and the lookahead control. |
| Quals column configuration | Quals page; `settings.qualcols` | **MISSING** | Snap to Quals and its column editor. |
| Security default | Admin page; `settings.secdefault` | **MISSING** | Snap to the corresponding Admin setting. |
| Wave default | Admin page; `settings.wavedefault` | **MISSING** | Snap to the corresponding Admin setting. |
| Stores add/rename/delete/reorder | Scheduler interactions; `settings.stores` | **MISSING** | Snap to Edit Schedule/board and the stores editor. |
| CX reasons add/rename/delete/reorder/reset | Scheduler board; `settings.cxreasons` | **MISSING** | Snap to the CX-reasons editor. |
| Day-template create/rename/delete/reset | Board / `DayTplModal`; `settings.daytpl` | **MISSING** | Snap to the board and reopen or identify the day-template editor. |
| Duty-template add/edit/reorder/delete/reset | `DutyTplModal`; `settings.dutytpl` | **MISSING** | Snap to the affected duty template. |
| Wave-template add/edit/reorder/delete/reset | `WaveTplModal`; `settings.wavetpl` | **MISSING** | Snap to the affected wave template. |
| Hide/show wave template | Wave-template UI; `settings.wavehide` | **MISSING** | Snap to the affected template/control. |
| Automatic reflow, derived warnings, and repaint | `people-settings-commit.ts` deferred hooks | **Must not be independent steps** | These are consequences of the recorded settings action. |
| Boot defaults, seeding, hydration, projection, restore, and remote replication | Store/command infrastructure | **Must not be Undo steps** | No history entry. |

### Change-history and acknowledgement records

| Change surface | Current writer / record | Status | Visible behavior |
|---|---|---|---|
| Undo/Redo audit line | `logReversed()` | **Has it** | One successful Undo or Redo adds one intelligible line. A refused attempt adds none. |
| “Mark all changes as seen” | `markSeen()`; `settings.changeseen` | **Must not be Undo** because it is a read receipt | No history entry. |
| Roster/settings descriptions | `describe.ts` | **MISSING specificity** | Current generic “a change to the roster” / “a settings change” is insufficient for the promised bubbles and history. |
| Takeoff note wording | Existing schedule description | **Known AMEND-SMALL-SEEN issue** | Do not re-file the known “a note on the schedule” wording defect. |

### Physical Undo/Redo doors

| Door | Status |
|---|---|
| Shell top-bar pair on Edit Schedule | **Has it**; same global history; must respect OIL boundary. |
| Scheduler-board pair | **Has it**; same history; must respect OIL boundary. |
| Leave War pair | **Has it**; same global history. |
| Inputs page | **Must not have a separate local stack**. Today it has no door; the shared command remains reachable from Edit Schedule. |
| Quals page | **Must not have a separate local stack**. Whether the same global pair should be displayed here is an owner decision. |
| Admin page | **Must not have a separate local stack**. Same discoverability decision as Quals. |
| Logic page | **Must not have a separate local stack**. Same discoverability decision as Quals. |
| Tracker and view-only schedule | **Must not have an editing Undo door** in this campaign. |
| Guest, pending, or signed-out session | **Must not expose an enabled domain Undo/Redo door**. |
| Keyboard shortcut | **Must not be claimed**; none is promised by the current design. |

## 2. Ranked scenarios

These start with the most specialised, least-shared surface.

### 1. Archive → callsign reuse → Undo Archive

- **Start:** Admin Saber; Ranger is active with callsign `RANGER`.
- **Gestures:** Archive Ranger. Add a different roster person using `RANGER`. Press Undo for the archive.
- **Screen:** The second person remains active as `RANGER`. Undo refuses as one unit, leaves Ranger archived, remains the next Undo, and identifies the callsign collision.
- **Disproves correctness:** Two active Rangers; the newer person is altered; Ranger is partly restored; account/LW state changes despite refusal; or the blocked step disappears.

### 2. Add person → create downstream uses → Undo Add

- **Start:** Admin Saber; no person `VIPER`.
- **Gestures:** Add roster-only person Viper. Assign Viper on a schedule, enter an input, add a Leave War record, or create an account. Return to an Undo door and undo “Add Viper.”
- **Screen:** Undo refuses whole because surviving records use Viper. All records remain unchanged.
- **Disproves correctness:** Viper disappears while schedule/input/LW/account records remain orphaned; only some records are removed; or the action silently cascades over later work.

### 3. Restore archived admin account without locking out administration

- **Start:** Exactly one enabled live admin account; another archived admin/person exists.
- **Gestures:** Exercise Suspend, role change, Archive, Restore, and Undo/Redo in orders that would leave no enabled live admin or would change Saber’s own account.
- **Screen:** Every invalid candidate is rejected before commit, with no partial people/account change.
- **Disproves correctness:** No enabled live admin remains; Saber changes their own account through Undo; an enabled account points at an archived/deleted person; or `accountsLoad()` silently injects/repairs data afterward.

### 4. Delete is final and older history cannot resurrect

- **Start:** Person Viper exists and has an earlier callsign or qualification edit in history.
- **Gestures:** Delete Viper. Press Undo repeatedly.
- **Screen:** Delete itself is passed over. Older Viper edits are also dead and cannot recreate Viper. The next unrelated eligible action can still undo.
- **Disproves correctness:** Undo restores Viper, mutates the tombstone, blocks forever on the dead step, or prevents access to an older unrelated action.

### 5. Archive and Restore-as are atomic across people, accounts, and Leave War

- **Start:** Active person with sign-in, Leave War data, and historical schedule appearances.
- **Gestures:** Archive; Undo; Redo. Then restore as a permitted new callsign; Undo; Redo; reload after each phase.
- **Screen:** Each gesture is one step. Current/future eligibility, account suspension, stint boundaries, and Leave War membership reverse together; historical schedule faces remain correct.
- **Disproves correctness:** Multiple Undo presses are required; a half-restored account/person appears; past history is rewritten; or reload produces a different state.

### 6. Qualification change propagates everywhere and preserves published history

- **Start:** Ranger appears in Quals, Leave War grouping, sign-off pickers, and a published day.
- **Gestures:** Change CAT or a qualification tick. Inspect warnings, availability, sign-off choices, and Leave War. Undo from Leave War or board; Redo; reload.
- **Screen:** Working projections repaint everywhere. The published face remains frozen, becomes pending if the change affects it, and sign-offs follow D103. Returning exactly to the published state clears pending.
- **Disproves correctness:** Stale groups/pickers; published face mutates; pending/sign-offs are wrong; or reload loses the reversal.

### 7. Callsign edit has exact user words and page snap

- **Start:** Admin Saber on Quals; Ranger exists.
- **Gestures:** Rename Ranger to Viper. Navigate to Leave War. Press Undo there.
- **Screen:** Bubble/history says whose callsign changed, not “a change to the roster.” The app snaps to Quals and identifies the person; all displayed names revert.
- **Disproves correctness:** Generic wording; no page snap; stale old/new callsigns coexist; or only the current page repaints.

### 8. Logic rule edit against a published day

- **Start:** A day is published and signed off; a visible rule currently passes.
- **Gestures:** On Logic, change its value or hard/soft kind so the working schedule warns. Undo from the scheduler board; Redo.
- **Screen:** Working warnings rederive. Published face remains frozen. Pending/sign-offs follow the published-snapshot rules. Undo snaps to the exact rule.
- **Disproves correctness:** Published content is recomputed; warnings remain stale; multiple settings steps appear; or the page snap lands only on Edit Schedule without identifying Logic.

### 9. Wave-template edit and exact editor restoration

- **Start:** A named wave template is visible and used by a day.
- **Gestures:** Rename it, edit its lines/times, hide it, and reorder it. Undo each action from Leave War; redo from the board.
- **Screen:** Each user gesture is one global step, the correct editor is surfaced, and template lists/day projections repaint consistently.
- **Disproves correctness:** One gesture creates several steps; Undo affects the wrong template; hidden state and template data separate; or the app remains on an unrelated page.

### 10. Day/duty/template reset is one step

- **Start:** Several custom templates differ from defaults.
- **Gestures:** Use the visible Reset control. Undo once. Redo once. Reload.
- **Screen:** One Undo restores the entire pre-reset configuration exactly; one Redo restores the complete reset.
- **Disproves correctness:** Partial template restoration, one step per row, reordered content, or reload drift.

### 11. D148: same target later changed by another actor

- **Start:** Unit model with Saber and another actor; Saber has an eligible settings or roster action.
- **Gestures:** Saber changes Ranger’s CAT. Inject a later remote change by Hawk to the same `people/Ranger` record. Saber presses Undo.
- **Screen:** Undo refuses whole, state stays exactly as before, the step remains next, and the message names Hawk.
- **Disproves correctness:** Generic “something else” wording; Undo proceeds; button is merely greyed/hidden; history is consumed; or part of the record changes.

### 12. D148: different target changed by another actor

- **Start:** Saber changes Ranger’s CAT.
- **Gestures:** Inject Hawk’s later remote change to Viper or a different settings record. Saber presses Undo.
- **Screen:** Saber’s action remains available and undoes normally. Hawk’s remote action never enters Saber’s Undo/Redo list.
- **Disproves correctness:** Saber’s action is greyed, refused, displaced by Hawk’s action, or the remote action becomes Undo’s top item.

### 13. D148: admin cannot undo someone else merely because they are admin

- **Start:** Unit model containing an eligible action owned by Ranger and current actor Saber as admin.
- **Gestures:** Ask for `undoState()` and invoke Undo.
- **Screen:** Ranger’s action is not offered as Saber’s own reversible step. Admin privilege does not override ownership.
- **Disproves correctness:** Current `mayReverse()` behavior permits Saber to reverse it or labels it as Saber’s next Undo.

### 14. Same browser, sign-out and sign-in

- **Start:** Saber performs two reversible actions, then undoes one so Redo exists.
- **Gestures:** Sign out. Sign in again as Saber; also sign in as Ranger.
- **Screen:** Undo and Redo lists are empty after every session transition. Persisted domain state remains.
- **Disproves correctness:** Old Undo/Redo returns for either account, stale button labels remain, or a new user can reverse the prior session.

### 15. Admin member view

- **Start:** Saber performs an admin action, then switches to member view.
- **Gestures:** Press Undo; switch back to admin view; press Undo again.
- **Screen:** Member view refuses with the established “Switch back” explanation and changes nothing. Admin view then performs the same pending Undo.
- **Disproves correctness:** Action disappears, member view undoes it, refusal consumes it, or current-mode labels are stale.

### 16. OIL boundary from both physical scheduler doors

- **Start:** Make a normal schedule change, then enter OIL Earn and make two OIL choices.
- **Gestures:** Undo twice inside OIL; press Undo at the boundary; press Undo once more outside OIL. Repeat through the other scheduler door.
- **Screen:** OIL choices reverse first. Boundary press only exits OIL with the promised message. Next press reverses the schedule change.
- **Disproves correctness:** Boundary press also changes the day; schedule action is unreachable; door behavior differs; or OIL credits are not withdrawn/recredited.

### 17. Publish → OIL → Undo through the publication boundary

- **Start:** Unpublished complete day with a known OIL result.
- **Gestures:** Publish, make OIL changes, then Undo back across OIL and publish; Redo through publish and OIL; reload.
- **Screen:** Undoing publish restores the exact unpublished state and withdraws publication-dependent OIL effects. Redo restores the recorded published version and credits exactly once.
- **Disproves correctness:** Double credits, orphan OIL state, recomputed rather than recorded publication, or reload changes the outcome.

### 18. Two actions on different pages, both orders

- **Start:** Admin Saber.
- **Gestures:** Change a Logic rule, then Ranger’s qualification. Undo twice from Leave War. Redo twice. Repeat with the action order reversed and from the board door.
- **Screen:** Strict reverse chronological order regardless of page or door. Every step snaps to its own page.
- **Disproves correctness:** Per-page stacks, door-local stacks, wrong order, missing snap, or settings/people changes are skipped.

### 19. Two actions on the same roster record

- **Start:** Ranger has known CAT and SANS values.
- **Gestures:** Change CAT, then toggle SANS. Undo twice; redo twice; reload.
- **Screen:** Values traverse the exact recorded states in order and appear as two understandable actions.
- **Disproves correctness:** The second edit collapses unpredictably into the first; Undo restores an intermediate hybrid; or reload differs.

### 20. Refusal followed by the next press

- **Start:** A top Undo step has a deliberate same-record conflict; an older unrelated step is also eligible.
- **Gestures:** Press Undo twice.
- **Screen:** Each press refuses the same top step; it does not silently skip to and reverse the older action. State and history remain unchanged.
- **Disproves correctness:** First or second press bypasses the blocked action, consumes it, or mutates the older record.

### 21. Input created on Inputs, undone elsewhere

- **Start:** Ranger on Inputs, week of 13–19 July 2026.
- **Gestures:** Enter one input. Navigate to Edit Schedule or Leave War and Undo; Redo; reload.
- **Screen:** Input reverses/restores from the shared history, page/week/person context is restored, and no Inputs-local stack exists.
- **Disproves correctness:** Input is absent from the global list; wrong week/person opens; a separate Inputs stack appears; or reload loses Redo’s result.

### 22. Week A / week B sequence

- **Start:** Weeks 13–19 and 20–26 July 2026.
- **Gestures:** Make an input or plan change in week A, then a schedule change in week B. Undo twice from each available door.
- **Screen:** First Undo opens week B; second opens week A. Domain state follows the same order.
- **Disproves correctness:** Current week is used for both, the old-week record is mutated incorrectly, or a known GU-E5 presentation failure is mistaken for domain loss.

### 23. Leave War bid → admin decision → award deletion

- **Start:** Ranger can bid; Saber can decide.
- **Gestures:** Ranger creates/edits a bid. Saber makes or moves a decision, then deletes an award. Exercise Undo/Redo in separate sessions and via Leave War’s own pair.
- **Screen:** Every eligible action reverses only in its owning session; schedule/availability projections repaint; no `lw.postouts` step appears.
- **Disproves correctness:** Award deletion is irreversible; posting projections enter history; ownership crosses sessions; or medical/bid constraints are bypassed.

### 24. Plan/calendar action followed by schedule action

- **Start:** Known plan/calendar state and schedule day.
- **Gestures:** Change plan/calendar, then change schedule. Undo twice from Leave War; redo twice from the board.
- **Screen:** The app moves Schedule → Plan/calendar in reverse order and restores each exact record.
- **Disproves correctness:** `loadContext()` treats page context as a no-op, leaving the user unable to see what changed.

### 25. Change-history audit and exact wording

- **Start:** Empty relevant history view.
- **Gestures:** Perform callsign change, account suspension, rule change, and wave-template rename. Undo and redo each; provoke one refusal.
- **Screen:** Each successful reversal creates one dated, actor-attributed, specific line. Refusal creates none.
- **Disproves correctness:** Generic roster/settings wording, missing actor/action, duplicate lines, or a line for the refused attempt.

### 26. Role and viewport matrix

- **Start:** Desktop and phone widths; admin, member, member-own Quals/input/bid, admin member view, guest, pending.
- **Gestures:** Repeat the smallest applicable edit and reversal for each role.
- **Screen:** Admin/member see only valid shared actions; members edit only their own permitted fields; guests/pending users never receive an enabled domain Undo; doors and bubbles remain operable on phone.
- **Disproves correctness:** Clipped/hidden active door, unauthorized edit, guest/pending history exposure, or desktop/phone door disagreement.

## 3. Restore rules, excluded writes, and implementation instructions

### 3.1 Current decision points

| Concern | Current file/function |
|---|---|
| Store registration and module cut-over | `undo-wire.ts`: registered stores and `setCutoverModules(['sched','lw','inputs','plan'])` |
| Restore preflight | `undo-wire.ts`: `restoreRefusal()` |
| Deleted-person protection | `undo-wire.ts`: `deadRefusal()` / `deletedRestoreProblem()` |
| Page/week context | `undo-wire.ts`: `loadContext()` |
| Visible snap | `undo-wire.ts`: `snapView()` |
| Timeline eligibility | `timeline.ts`: `isEligible()` |
| Actor permission | `timeline.ts`: `mayReverse()` |
| Top action/button state | `timeline.ts`: `newestUndoable()` and `undoState()` |
| Revision conflict | `timeline.ts`: expected-revision checks / `undoConflict()` |
| Session isolation | `timeline.ts`: `endUndoSession()` |
| People restore application | `people-settings-commit.ts`: `peopleStore.write()` |
| Settings restore application | `people-settings-commit.ts`: `settingsStore.write()` |
| Account invariants | `accounts.ts` account guards and `accountsLoad()` |
| Qualification/callsign writes | `quals-write.ts` |
| Person creation | `roster-add.ts` |
| Final deletion | `person-delete.ts` |
| Human descriptions | `describe.ts` |
| History entries | `changes.ts`, including `logReversed()` and seen markers |
| Permission role/mode | `perms.ts` and command authorization |

### 3.2 Required implementation sequence

1. **Add people and settings to the same command timeline.**
   - Register `peopleStore` and `settingsStore` in `undo-wire.ts`.
   - Extend the cut-over set to `people` and `settings`.
   - Preserve a single transaction/root action across cross-store operations such as add-with-account, archive, restore, and access approval.
   - Do not create page-local histories.

2. **Classify commands before enabling the modules.**
   - Record ordinary roster, qualification, account, access-administration, rules, defaults, and template edits.
   - Explicitly suppress acknowledgement, projection, boot, seed, restore, remote, and deletion writes listed below.
   - Keep `lw.postouts` deferred.

3. **Preflight the complete candidate state.**
   - Build the candidate people/settings state from all changes in the intended Undo or Redo before applying any write.
   - Run validation once over that whole candidate.
   - If any invariant fails, return one visible refusal and apply nothing.
   - Repeat the validation inside the restore transaction immediately before commit so a race cannot pass the early check.

4. **Validate roster invariants.**
   - Active callsigns remain unique.
   - A removed or archived person cannot leave surviving current/future schedule, input, plan, weekstash, Leave War, account, or applicable sign-off references invalid.
   - Archived historical appearances remain available under D327.
   - Stint boundaries and restore-as identity rules remain valid.
   - Do not silently cascade-delete later work in order to make an older Undo succeed.

5. **Validate account/access invariants.**
   - At least one enabled admin account remains attached to a live, non-archived person.
   - No account targets a missing or deleted person.
   - Archived people’s accounts remain suspended.
   - One person maps to at most one account.
   - Normalized sign-in names remain unique.
   - The current actor cannot use Undo/Redo to evade the existing “do not change your own account” guard.
   - Do not call forgiving `accountsLoad()` as the validator: its filtering and seed-admin repair can conceal an invalid restore.

6. **Make deletion permanently dead to Undo.**
   - Extend `deadRefusal()` so `person.delete` is passed over.
   - Treat any older `people/<deleted-id>` edit that would put the person back as dead.
   - Extend `deletedRestoreProblem()` to inspect people puts, not only schedule/input/plan/weekstash references.

7. **Correct D148 ownership.**
   - Remove the unconditional admin success path from `mayReverse()`.
   - Require the candidate entry to belong to the current signed-in person for admin and member alike.
   - Make `newestUndoable()` and `undoState()` find the newest eligible action owned by the current actor; a remote/other-person action must not become their visible top action.
   - Continue to clear Undo and Redo on sign-out/sign-in.
   - Apply the same rule to Redo.

8. **Distinguish later changes by target.**
   - A later remote change to another record must not affect the actor’s action.
   - A later remote change to the same record must refuse the whole reversal.
   - Preserve remote actor identity with the observed revision/write metadata.
   - Replace the generic conflict message with one naming the actor, for example: “Hawk changed Ranger after your action, so it cannot be undone.”
   - Keep remote writes out of the local action list.

9. **Add page-aware context and snapping.**
   - `people.edit` → Quals and person row.
   - `person.add`, `person.archive`, `person.restore`, account/access commands → Admin → Users and account/person.
   - `settings.rules` → Logic and rule.
   - `settings.qualcols` → Quals column editor.
   - `settings.lookahead` → Inputs.
   - `settings.secdefault`, `wavedefault`, `accounts`, `accessreqs`, `guestview` → the matching Admin control.
   - `settings.stores`, `cxreasons`, `daytpl`, `dutytpl`, `wavetpl`, `wavehide` → board and matching editor.
   - Page snap is mandatory under AM39b. Reopening the exact modal is recommended where stable.

10. **Re-run all downstream projections after a successful apply.**
    - Rebuild callsign indexes and roster baselines.
    - Revalidate schedule warnings and availability.
    - Refresh Leave War groups/catalogue.
    - Refresh sign-off choices and account/session state.
    - Preserve published faces; calculate pending/sign-off effects under D98/D103/D179.
    - Recalculate OIL only through the same originating command consequences.

11. **Provide specific descriptions.**
    - Replace generic `people`/`settings` labels in `describe.ts`.
    - Include subject and field where appropriate: “Ranger’s CAT,” “Ranger’s callsign,” “Suspend Viper’s sign-in,” “Hard rule: minimum rest,” “Rename wave template Alpha.”
    - Use the same vocabulary in button labels, bubbles, refusals, and `logReversed()` history.

12. **Model D148 in unit tests and use walks for the single-user half.**
    - Unit model: other-admin ownership, same-record remote conflict with actor name, different-record remote non-conflict, remote exclusion, Redo parity, and session clearing.
    - App walk: own-action Undo/Redo, sign-out clearing, admin member-view refusal, cross-page snap, bubbles, reload, phone layout.
    - Do not claim the one-browser demo walk proves true multi-user interleaving.

### 3.3 Writes that must never become Undo steps

- `person.delete` and any inverse that resurrects a deleted person.
- `access.seen`, “requests seen,” or equivalent notification acknowledgements.
- `changes.seen` / “Mark all as seen.”
- `person.backSeen` or welcome/back acknowledgements.
- Pending-user access-request submission, unless the owner deliberately redesigns it as a reversible command with a reachable door; recommended alternative is explicit Withdraw.
- `lw.postouts` while CMDLF-002 remains deferred.
- OIL posting, reflow, callsign-index rebuild, availability recomputation, and other derived projections.
- Boot, seed, hydration, migration, import normalization, restore writes, and remote replication.
- Navigation, tab/date selection, filters, sorts, folds, modal open/close, and other view state.
- Tracker navigation/pointer selection.
- Audit/history read receipts.

## 4. Explicit negatives

- Do not create per-page, per-module, or per-door Undo stacks.
- Do not let admin status confer ownership of another person’s actions.
- Do not grey or hide an actor’s valid Undo merely because someone changed a different record.
- Do not silently skip a conflicted top action to reach an older one.
- Do not partially apply a multi-record reversal.
- Do not rederive a recorded inverse from current defaults.
- Do not use load-time account repair as proof that a restored state is valid.
- Do not resurrect a deleted person.
- Do not delete or rewrite later dependent work to force an older Undo to succeed.
- Do not place remote, projection, acknowledgement, or navigation writes in the action list.
- Do not mutate a frozen published face when roster, qualification, or rule settings change.
- Do not generate a Change History line for a refused attempt.
- Do not claim keyboard Undo.
- Do not require Inputs, Quals, Admin, or Logic to own a private Undo pair.
- Do not re-file GU-E2E, CMDLF-002, GU-C3, GU-E5, GU-LWLOCK, GU-COSMETIC, or AMEND-SMALL-SEEN without a materially new encounter path.
- Do not add stored-data migration or backward-compatibility work; D56 excludes it.
- Do not treat focused unit success as evidence that page snapping, hit testing, phone layout, bubbles, or modal restoration work in the rendered app.

## 5. Owner-only questions

1. **Where should the shared pair be visible after people/settings cut-over?**  
   Recommendation: expose the same global pair in the authenticated app top bar on every writable page—never separate stacks. This makes a Quals/Admin/Logic edit discoverably reversible without first navigating to Edit Schedule.

2. **How exact must settings snapping be?**  
   Recommendation: navigate to the owning page and reopen/focus the exact modal, template, rule, account, or person whenever that target still exists. If it no longer exists, open the correct page/editor with a specific explanatory bubble.

3. **Should a pending access request be reversible through global Undo?**  
   Recommendation: no. Pending users have no suitable global door. If cancellation is desired, provide an explicit “Withdraw request” action.

4. **Should refusing an access request be recorded?**  
   Recommendation: yes. It is a deliberate administrative change to another person’s access state, unlike merely marking the request as seen.

5. **Should read/acknowledgement actions ever enter Change History as reversible changes?**  
   Recommendation: no for requests-seen, changes-seen, and back/welcome acknowledgements. They may be audited separately if needed, but must not consume Undo steps.

6. **When a blocked Undo names the later actor, what identity is safe to show?**  
   Recommendation: use the roster callsign already visible to authorized users, with a neutral fallback such as “another administrator” if the actor no longer resolves.

7. **Should archive restoration ever offer a rename prompt from the Undo command?**  
   Recommendation: no. Global Undo should refuse atomically on a callsign collision. The user can explicitly Restore as a new callsign through Admin, keeping Undo deterministic.

