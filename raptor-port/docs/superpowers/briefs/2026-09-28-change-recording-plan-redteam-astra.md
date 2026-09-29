Read-only review completed. No files were edited; no tests, builds, or app runs were performed. The plan is not ready to build until the high-severity findings are resolved.

## Findings

1. **High — B6.7 silently changes the meaning of the second Undo press.**

   **What:** “Refuse once, then pass over” contradicts the plan’s own Astra 20 acceptance scenario and can make a repeated press reverse an unrelated older action.

   **Where:** Plan B6.7, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:170`; required scenario, `raptor-port/docs/superpowers/briefs/2026-09-28-change-recording-scenarios-astra.md:251`; D148, `.claude/rules/decisions/how-we-work.md:88`.

   **What goes wrong:** Saber changes Ranger’s CAT, then Hawk remotely changes the same roster record. Saber presses Undo and receives the correct refusal naming Hawk. He presses again expecting the same refusal; instead, the plan skips that blocked entry and reverses an older unrelated action. Astra 20 explicitly requires both presses to refuse the same top step with no state or history change.

   **Fix to plan:**

   1. Delete B6.7’s say-once/pass-over state.
   2. Leave the conflicted entry as the next owned entry until its conflict is resolved or the session ends.
   3. Make `undoState()`, the tooltip, and every press identify the same blocked action.
   4. Add Astra 20 as a literal two-press unit test.
   5. If access to older actions is wanted, make that a separately approved, explicit “dismiss blocked step” interaction—not a repeated Undo side effect.

2. **High — B5 validates too early and does not repeat the complete roster/settings validation inside the restore transaction.**

   **What:** The plan wires a pre-snap `restoreRefusal`, but omits the scenario report’s required second validation immediately before commit and does not explicitly build one combined people/settings candidate.

   **Where:** Plan B5, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:141`; required sequence, `raptor-port/docs/superpowers/briefs/2026-09-28-change-recording-scenarios-astra.md:339`; current precheck/apply separation, `raptor-port/src/undo/timeline.ts:599` and `:494`; current phase-five guards, `raptor-port/src/command/commit.ts:253`.

   **What goes wrong:** An account restore is preflighted against a valid live roster. Context loading or a later external change then archives or removes the linked person. The restore transaction checks revisions only for records it writes and the existing generic hard invariants; it can therefore restore an enabled account against the now-invalid roster dependency. The forgiving account loader may then conceal the invalid candidate by filtering or seed repair.

   B5 also narrows the self-account comparison to “role, puck, on”, while the forward writer refuses every change to one’s own account, including sign-in name (`raptor-port/src/state/accounts.ts:281-299`).

   **Fix to plan:**

   1. Add a pure `buildRosterSettingsCandidate(changes)` that applies every people/settings change to cloned current state before any write.
   2. Validate callsigns, person references, accounts, and removal dependencies against that combined candidate.
   3. Run the validator once before snapping for a clean visible refusal.
   4. Rebuild and validate the candidate again inside `undo.restore`, after enlistment and immediately before store writes/finalization.
   5. Reject atomically; never use `accountsLoad()` as validation.
   6. Compare every persisted field of the signed-in account, including `name`, `role`, `pid`, `on`, and relevant suspension metadata.
   7. Add a test that changes a dependent roster/account fact between the early and transactional checks and proves nothing is applied.

3. **High — the proposed shared `UndoPair` has incompatible engines.**

   **What:** B10.1 defines a component that reads the global `undoState()` and runs global Undo, while B10.4 requires the same top-bar position on Tracker to use Tracker’s independent history.

   **Where:** Plan B10.1/B10.4, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:195`; global engine, `raptor-port/src/undo/timeline.ts:599`; Tracker engine, `raptor-port/src/tracker/app/core.js:2708`; current Tracker buttons, `raptor-port/src/tracker/components/Header.jsx:240`.

   **What goes wrong:** Ranger grades a Tracker item while an older global input change exists. If the shared component remains hard-wired to the global engine, Tracker’s top-bar Undo either reverses the input or shows the wrong disabled state instead of reversing the mark. If the builder special-cases Tracker inside the component, the supposed shared component acquires two hidden engines and can accidentally apply the OIL boundary to Tracker.

   **Fix to plan:**

   1. Make `UndoPair` presentational and inject a model: state getter, subscription, Undo, Redo, and an ID prefix.
   2. Provide a global adapter containing `undoState`, timeline subscription, global actions, and the OIL boundary.
   3. Provide a Tracker adapter backed only by the no-import bridge.
   4. Have Shell select the adapter from the current page.
   5. Preserve distinct top-bar/board IDs so simultaneous hidden DOM does not create duplicate IDs.
   6. Test that a Tracker mark and a global input coexist and each page’s pair reverses only its own engine.
   7. Keep the existing assertion that Raptor never imports `core.js`.

4. **High, conditional — introducing `lw.stage` as written would make stage changes fail closed.**

   **What:** B2 says a non-undoable stage needs only a new command type at the writers, but every command type also requires command-layer registration and a central permission mapping.

   **Where:** Plan B2, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:123`; Leave War registration, `raptor-port/src/leavewar/state/store.ts:1183`; permission mapping, `raptor-port/src/state/perms.ts:281`; unknown types are refused, `raptor-port/src/state/perms.ts:343`; stage writer, `raptor-port/src/leavewar/state/store.ts:3662`.

   **What goes wrong:** The owner chooses not to undo stage changes. The builder changes `advanceStage` to emit `lw.stage` and adds it to `NOT_STEPS`, but does not register and map it. An admin taps “Bidding closed”; the permission resolver rejects the unknown command, so the stage does not advance.

   **Fix to plan:**

   1. Route every stage writer through `lw.stage`.
   2. Add `cmdDefinePermission('lw.stage', ...)`.
   3. Add the correct `COMMAND_OPS['lw.stage']` row.
   4. Add `lw.stage` to `NOT_STEPS`.
   5. Update the permissions table in `data-model.md`; B11 may no longer claim that no permission changes are planned.
   6. Add authorization, `perms.test.ts`, and `perms-scan.test.ts` coverage before changing the writer.

5. **High — B8 specifies only the middle of the metadata path; no current producer or UndoEntry reader can deliver `detail`.**

   **What:** Copying `Command.meta.key` into an envelope is insufficient because scheduler commands do not set that metadata, `commitText` discards the known key, and `UndoEntry` has no field to retain it.

   **Where:** Plan B8, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:183`; command creation, `raptor-port/src/state/sched-commit.ts:407`; envelope creation, `raptor-port/src/command/commit.ts:218`; text writer, `raptor-port/src/ui/textedit.ts:55`; entry construction, `raptor-port/src/undo/timeline.ts:228`; entry type, `raptor-port/src/undo/types.ts:32`.

   **What goes wrong:** A scheduler edits a time, remark, stores load, area, or airspace time. The command still contains no key; even if `CommitEnvelope.detail` is added, `recordEntry()` drops it. Undo continues to say “a note on the schedule,” contrary to B8.

   **Fix to plan:**

   1. Change the text-command helper to accept the actual field key.
   2. Pass the key from every branch, including `data-txt`, `it:`, `st:`, `ar:`, and `at:` writers (`textedit.ts:67-78` and `:120-223`).
   3. Give the scheduler commit helper an explicit safe metadata parameter.
   4. Copy only the normalized key fact into `CommitEnvelope.detail`.
   5. Add `detail` to `UndoEntry` and copy it in `recordEntry()`.
   6. Make `describeEntry()` consume `entry.detail`, with a safe generic fallback for unknown prefixes.
   7. Test the complete producer-to-tooltip/bubble/history path for every current text prefix.

6. **Medium-high — B6 risks breaking the established admin-in-member-view refusal, and the post-build matrix omits its scenario.**

   **What:** The plan does not separate “same person” selection from current-role authorization, and neither B6’s named tests nor Phase C includes Astra 15/Fable S6.

   **Where:** Plan B6.1/B6 tests, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:155`; Phase C list, `:227`; required scenario, `raptor-port/docs/superpowers/briefs/2026-09-28-change-recording-scenarios-astra.md:216`; existing role refusal, `raptor-port/src/undo/timeline.ts:363`.

   **What goes wrong:** Saber makes an admin schedule change, switches to member view, and presses Undo. If `newestUndoable()` filters through the changed `mayReverse()`, it can hide Saber’s pending admin action and expose an older member action. The press then reverses the older action instead of saying “Switch back to the admin view.”

   **Fix to plan:**

   1. Define an ownership predicate based only on signed-in `personId`.
   2. Use that predicate when selecting the next Undo/Redo entry.
   3. Apply the role/view check afterward in `mayReverse()` so the selected own admin action remains pending and produces `reverseRefusal()`.
   4. Add Astra 15/Fable S6 to B6’s unit cases.
   5. Add it to Phase C at desktop and phone widths.

7. **Medium — B7 sends `settings.lookahead` to a page where its control does not exist.**

   **What:** The plan maps lookahead to Admin configuration, but the actual editor is on Inputs.

   **Where:** Plan B7, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:177`; actual control, `raptor-port/src/ui/InputsPage.tsx:862`; scenario mapping, `raptor-port/docs/superpowers/briefs/2026-09-28-change-recording-scenarios-astra.md:380`.

   **What goes wrong:** An admin changes the default Inputs window, navigates elsewhere, and presses Undo. The setting changes, but the app opens Admin, where no corresponding control exists, so the person cannot see what was reversed.

   **Fix to plan:**

   1. Map `settings/lookahead` to Inputs.
   2. Open the range control and focus or highlight `#inRangeCfg` when stable.
   3. Map day/duty/wave template records individually to their actual editor rather than using one generic “templates → Admin” rule.
   4. Add a table-driven snap test for every settings record ID and a rendered walk for lookahead.

8. **Medium — B10 is too large for one red-first commit and does not define ownership of shared Sync/bell state.**

   **What:** One step combines two undo engines, four surfaces, responsive ordering, a new popup, exit removal, Sync state, bell navigation, geometry, and documentation.

   **Where:** Plan B10, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:195`; current Sync state is local to Shell, `raptor-port/src/ui/Shell.tsx:142`; current bell action, `raptor-port/src/ui/Shell.tsx:411`.

   **What goes wrong:** The builder extracts a `SyncControl` whose state is local to each instance. Toggling Sync on the board shows “1 s”; closing the board exposes a top bar still showing “slow.” A board bell can similarly navigate without closing the board if its handler drifts from Shell’s four alert branches. When a phone geometry test fails, the single commit cannot establish which behavioral slice was proved red-first.

   **Fix to plan:** Split B10 into independently tested commits:

   1. Presentational UndoPair plus global adapter.
   2. Shell page/role placement and phone order.
   3. Leave War removal.
   4. Tracker bridge and Header removal.
   5. Board pair, Done-only exit, and desktop order.
   6. One lifted Sync model and one bell action model shared by Shell and board.
   7. Phone overflow menu and outside-click behavior.
   8. Geometry/performance/docs updates.

   Shell must own the single Sync state and pass it to both instances. The shared bell action must close the board only before its navigation branches, then invoke the existing Admin/Help/Inputs route.

9. **Medium — the Logic/member visibility contract contradicts itself.**

   **What:** The table says a member sees a greyed pair on read-only Logic; the immediately following rule says the pair appears only on writable pages and excludes member Logic.

   **Where:** Plan §2, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:69` and `:74`; Logic’s writes are admin-gated, `raptor-port/src/ui/LogicPage.tsx:82`, `:109`, and `:129`.

   **What goes wrong:** One builder follows the table and renders inert controls; another follows B10.2 and hides them. The look card and layout tests can then certify opposite interfaces.

   **Fix to plan:**

   1. Replace the prose/table with one authoritative capability matrix.
   2. Specify that member and admin-in-member-view Logic are read-only and show no global pair.
   3. Base visibility on page capability for the current effective role, not whether history happens to contain an entry.
   4. Test every page for admin, member, and admin-in-member-view.

10. **Medium — the final verification order contradicts the required FULL order.**

   **What:** Phase C walks the build before a stated gate run, and Phase D places both code reads before “the gates.”

   **Where:** Plan Phases C/D, `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md:227`; required FULL sequence, `raptor-port/docs/bug-check-order.md:353`.

   **What goes wrong:** Walkers and reviewers can spend hours evaluating a bundle that already fails compilation, permissions, reference parity, geometry, or another mandatory gate. Reviewers may also inspect code that changes after the first gate failure.

   **Fix to plan:**

   1. Finish Phase B.
   2. Run all five gates under the PC lock.
   3. Run the roll-call/door check and Phase C walk.
   4. Fix walk findings and rerun the gates.
   5. Give both reviewers the resulting evidence sheet and exact gated build.
   6. Fix review findings, re-walk touched surfaces, rerun all gates, then finish the sheet and owner look.

## Explicit negatives

- B1’s four excluded command types match the current writers, and retaining expectation tracking is the correct shape.
- B3’s plain-language reason for D350-deferred actions is sound.
- B4 correctly adds both direct `people/<id>` resurrection and account-list resurrection to the permanent-delete guard.
- B9 correctly identifies the Quals defect: local `cols` is seeded once and written back by an effect. Moving persistence to edit handlers and rereading on store ticks is the right repair. Logic already reads live rule state on rerender.
- Removing the board’s redundant Close button, retaining Done/Escape/scrim, and placing phone Sort/layout behind `⋯` all match D349. The interaction decision is sound; only its implementation needs splitting.
- The Tracker no-import bridge is consistent with its existing role/people bridge architecture, provided the top-bar pair uses an injected Tracker adapter.
- I found no additional current people/settings writer missing from §2/B1’s inventory. The parallel undoable-list review should still be reconciled before build.
- I found no issue based solely on pre-existing demo data; D56 was respected.

## Questions only the owner can answer

1. **After a same-record conflict, should repeated Undo remain blocked or deliberately discard that step?**  
   Recommendation: keep refusing the same top step. Never make the second identical press undo a different action. If discarding is wanted, provide a separate confirmed action.

2. **Should advancing/reopening the Leave War stage be part of global Undo?**  
   Recommendation: no for this build. Stage changes alter who may bid or decide and already have explicit forward/back controls. Give them `lw.stage`, register its permission correctly, and exclude it from the timeline.

3. **How exact must settings snapping be?**  
   Recommendation: reopen/focus the exact stable control or modal when it exists—Inputs lookahead, the matching template editor, account/person, rule, or Quals column. If the target no longer exists, open the owning page and show a specific bubble naming it.

