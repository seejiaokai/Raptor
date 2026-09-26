# Astra finished-code review — `[POST-OUT-OUTCOMES]`

## Verdict: FIX FIRST

Five findings remain. The first three can leave saved state partially applied or historical records invisible. I reviewed branch `claude/post-out-outcomes` at `eab942e43522`. I made no changes and ran no tests or builds, as required. The evidence sheet changed concurrently during the review; no code file changed.

## Findings

1. **A posting-triggered Delete bypasses the stash preflight and can commit a partial deletion.**

   **Where:** `raptor-port/src/leavewar/sync.ts:1464-1470`, `raptor-port/src/leavewar/sync.ts:1506-1512`, `raptor-port/src/state/person-delete.ts:325-340`, `raptor-port/src/state/person-delete.ts:260-274`, `raptor-port/src/engine/weekstash.ts:158-167`.

   **Failure scenario:** Put Hex on a future stashed week, then make that stored week unreadable or otherwise unchangeable. Give Hex a Delete posting whose date arrives. Admin → Users correctly calls `stashPreflight` before its command, but `runPoOutcomes` checks only `deleteBlocked`, calls `applyDelete` directly, and ignores `stashEditWeek` returning `false`. Hex is marked deleted, his account and current/future records are removed, and his war posting is completed, while the bad stored week still contains him. Loading that week later exposes a dangling deleted-person reference. The posting is final, so there is no normal recovery door.

   **Status:** New in this change—the direct Delete door added the preflight, but the new posting outcome omitted that call site.

   **Exact fix:**

   1. Factor one deletion preflight taking `id` and the computed cutoff; it must include the last-admin and stash-readability checks while allowing the caller to select whether the signed-in-self rule applies.
   2. Run it while collecting due Delete postings and repeat it inside the queued projection immediately before any mutation.
   3. On refusal, add the reason to the deferred warning list, leave the person/account/schedule/war unchanged, and do not call `markPostingDone`.
   4. Make an unexpected `stashEditWeek` failure after a successful preflight throw/refuse the command, so the transaction rolls every enlisted store back instead of silently committing.
   5. Add posting-pass cases for unreadable and unchangeable future weeks, including a pass queued behind another command. Assert that every store is unchanged, the posting remains due, reload is unchanged, and repairing the week permits one successful retry.

2. **An Overseas posting for the last enabled admin archives him before discovering that his account cannot be suspended.**

   **Where:** `raptor-port/src/leavewar/sync.ts:1454-1469`, `raptor-port/src/leavewar/sync.ts:1491-1512`, `raptor-port/src/leavewar/sync.ts:1433-1434`, `raptor-port/src/leavewar/state/store.ts:1531-1533`, `raptor-port/src/ui/UsersPanel.tsx:242-250`, `raptor-port/src/ui/UsersPanel.tsx:272-280`. The incorrect partial result is explicitly expected by `raptor-port/src/leavewar/postout-outcomes.test.ts:110-118`.

   **Failure scenario:** Saber is the only enabled admin and has an Overseas posting due today. The initial `overseasStuck` check returns false because Saber is not archived yet. Inside the command, line 1496 archives him; only afterwards does `suspendForPosting` return `lock`. The command commits with Saber absent from Quals but still able to sign in, `poDone` unset, and the promised archive-plus-suspension outcome half applied.

   This also does not implement Round 2’s blocked-posting contract. `PO_TOLD` is keyed only by message text, no `poBlocked` is recorded, changing the posting away and back cannot re-arm the same warning during the session, and the account row has no persistent explanation.

   **Status:** New in this change.

   **Exact fix:**

   1. Evaluate the last-admin block before setting `archived`—both during the scan and again inside the queued command.
   2. If blocked, change neither the person nor account, leave `poDone` unset, and record `poBlocked` against the posting’s person/date/outcome key.
   3. Key the session warning by that posting key rather than its sentence.
   4. Clear/re-arm the blocked record and warning key when the date or outcome changes; clear them when the constraint resolves.
   5. Render the recorded explanation on all three posting sheets and on the relevant Admin → Users row, including the disabled own row.
   6. When another enabled admin appears, apply archive, suspension and `poDone` together and clear the blocker.
   7. Replace the existing “archived, account left on” test with assertions that neither change occurs while blocked, then that both occur atomically after a second admin is enabled.

3. **Deleting a SANS person while Show SANS is off loses the visible Leave War history.**

   **Where:** `raptor-port/src/leavewar/state/raptorRoster.ts:41-45`, `raptor-port/src/leavewar/sync.ts:1322-1369`, `raptor-port/src/leavewar/state/store.ts:1570-1587`.

   **Failure scenario:** Vector is SANS, has August leave and OIL, and has an account. Turn Show SANS off, which removes him from `state.people`, then delete him through Admin → Users. `forgetPersonFrom` trims future war records, but `had` is false, so it creates neither a `gone` person nor a posting window. Turning Show SANS on or reloading cannot recover the row because the Raptor body is now archived/deleted and excluded from projection. The retained August records exist underneath but have no person row through which the Matrix can display them. Deleting in the opposite order keeps the history, so the result depends on view state.

   **Status:** New in this change.

   **Exact fix:**

   1. Capture a frozen Leave War identity projection before applying the Raptor deletion, even when the person is absent from the current Leave War projection.
   2. Pass that fallback identity to `forgetPersonFrom`.
   3. When no current row exists but past war records or a posting profile exist, insert the frozen person with `to = cutoff − 1` and `gone: true`, then rebuild `postOuts`.
   4. Ensure the historical row remains renderable in past months regardless of the Show SANS setting, while remaining absent from the OIL tracker, current manpower and all writers.
   5. Test delete with Show SANS off first and on first, followed by toggles and reload. Both orders must retain past leave/OIL and remove all future value.

4. **Ordinary Post out and Undo post out are committed as generic `lw.edit`, bypassing the new command’s permission contract.**

   **Where:** `raptor-port/src/leavewar/sync.ts:1636-1646`, `raptor-port/src/leavewar/sync.ts:1685-1699`, `raptor-port/src/leavewar/state/store.ts:1213-1219`, `raptor-port/src/leavewar/state/store.ts:1491-1520`, `raptor-port/src/state/perms.ts:274-280`, `raptor-port/src/state/perms.ts:315-317`.

   **Failure scenario:** An admin makes a first posting, changes a future posting that needs no take-back, or performs an ordinary Undo post out. These paths call `setPostOut` directly. Its standalone persistence router emits `lw.edit`, whose permission row is a member-own `LeaveBid` update, rather than `lw.postout`, which is the admin-only `LeavePersonProfile` command with its Person/User effects. The current `state.role` guard happens to prevent a member write, but authority is therefore decided outside the central command map; the change stream, audit identity and future database authorization describe the wrong operation.

   **Status:** New integration defect in this change. The generic `setPostOut` writer predates it, but this change introduced `lw.postout` and failed to route every posting gesture through it.

   **Exact fix:**

   1. Make `postOut` and `undoPostOut` always open an `lw.postout` command, including first postings and operations requiring no take-back.
   2. Split `setPostOut` into an internal mutation used inside that command and, if still needed, an explicitly wrapped public entry point.
   3. Always enlist the Leave War store; enlist people/settings when the operation actually performs a posting-owned take-back.
   4. Keep value/domain validation at the writer, but make `cmdAuthorize('lw.postout', …)` the authority decision rather than falling through `lw.edit`.
   5. Add change-stream and authorization tests for initial posting, date change, outcome change, un-choose and ordinary Undo. Assert `lw.postout` and refusals for member, guest, suspended account and admin-in-member-view.

5. **Two Leave War admin editor overlays survive a switch to member view with their write controls still visible.**

   **Where:** `raptor-port/src/state/store.ts:378-390`, `raptor-port/src/leavewar/ui/Matrix.tsx:4401-4405`, `raptor-port/src/leavewar/ui/Matrix.tsx:4429-4433`, `raptor-port/src/leavewar/ui/PersonSheet.tsx:28-68`. The underlying person writer refuses at `raptor-port/src/leavewar/state/store.ts:1444-1446`.

   **Failure scenario:** As an admin, open Edit aircrew or the counter form, then switch to the member view using the badge/drawer. `switchRoleView` clears scheduler state but not these Matrix-local overlays. `PersonSheet` and `CounterForm` are rendered without a role condition, so the member view continues to show admin editing controls. A PersonSheet tap is silently refused by the store; switching back can also expose stale draft state. No unauthorized write was demonstrated, but the production screen is not “exactly a member,” and the visible gesture lies about its authority.

   **Status:** New in the member-view change.

   **Exact fix:**

   1. Gate both overlays with `role === 'admin'`.
   2. On an admin-to-member transition, clear `editingWho`, `counterEdit`, and every other admin-only Matrix draft/confirmation state so switching back does not resurrect an old editor.
   3. Retain the existing write-path guards as backstops.
   4. Add desktop-badge, phone-drawer and direct-switch tests: open each editor, switch, assert the editor and all write controls disappear, verify the model is unchanged, and confirm switching back does not reopen it.

## Explicit negatives

- The callsign index remains identity-safe: archived/deleted holders are not active lookup results, a reused callsign does not retarget old ID-based schedule records, and Restore-as addresses the selected archived body.
- The direct Admin → Users deletion uses one command over people, settings, the live schedule, week stash and Leave War, and now takes the scheduler save step. Its cutoff uses the calendar clock.
- Past named pucks and issued versions are not rewritten. Future working days are stripped, become pending against an issued version, and lose their four working sign-offs.
- The published-version/parked-plan load belt removes deleted people from newly installed day content and reports who was left out. For supported newly written plans, the delete sweep removes their sign-offs before they can later be selected.
- Undo/Redo’s deleted-person guard marks unsafe entries dead/abandoned, passes over them to disjoint work, and retains overlap blocking.
- Posting take-back is correctly limited to `archivedBy: 'po'`, `offBy: 'po'` and `sanBy: 'po'`; manual Restore, Enable, Suspend and SANS changes do not acquire those ownership marks.
- `poDone` is tied to both date and outcome, so a changed posting is eligible to run again; a later pass does not undo a hand Enable or hand SANS change after a completed outcome.
- Delete removes future inputs, truthfully shortens a spanning input, leaves past documents/history linked to the old person ID, removes future planning pucks as gaps, and prevents future OIL/ALL AVAIL value from the cutoff.
- The three posting doors share the outcome-chip contract; Transfer remains disabled; Delete uses two taps; changing the date/outcome disarms the confirmation.
- Post-out, Restore, Rename and Delete have write-path backstops. I found no current successful member, guest, suspended-account or admin-member-view mutation through those calls beyond finding 4’s incorrect command classification and finding 5’s retained visible controls.
- The queued posting-pass inflight guard prevents the documented requeue loop, and each due posting is re-read when its queued command starts.
- I did not report that the preserved-week preflight scans `d` but not `sg`/`dr`: `PRESERVED` is created for unsupported pre-Phase-2 stored snapshots, so that narrower defect is legacy/demo-data-only under D56. Finding 1 remains reportable because a newly unreadable/unwritable week can still be encountered by the current posting pass and is silently skipped.
- Tracker removal for a still-running course, Transfer/multi-squadron behavior and foreground termination of an already-open deleted/suspended session remain expressly deferred; they are not findings in this review.
- Phone geometry and hit testing were not claimed clean: the brief prohibited builds and tests, so this was a static finished-code review, not a rendered walk.

