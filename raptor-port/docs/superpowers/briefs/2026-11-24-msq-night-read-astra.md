I read an exported copy of `fcca051f0`. Scope: `review/tonight.diff` (`54772307c..fcca051f0`), the changed files in full, related readers/writers, and the applicable rulings and contracts. This was a static review; I did not run tests or change anything.

1. **Unfinished line drag can write into the next squadron — high**

   **Failure:** A master admin opens 142’s Tracker, enters chart editing, selects a link, and holds its bend handle with the mouse. While holding it, they use the keyboard to pick 149. After 149 loads, moving and releasing the mouse changes and saves **149’s** layout using the gesture started on 142.

   **Cause:** [`core.js`, `leaveSquadron`](C:/Users/User/AppData/Local/Temp/claude/e2bface01731fdd2/54f040ff-8439-4869-a472-6275312a3185/scratchpad/read-export/raptor-port/src/tracker/app/core.js:255) clears global drag variables but leaves the bend handle’s window listeners and edge-pan callback alive. Those handlers, at lines 3698–3724, use the current `edgeMeta` and storage binding without checking their originating session. The release calls `markDirty()` and `saveLayout()`. The permission check accepts the write because the current binding and current squadron now both identify 149.

   **Fix:** Register cancellation for active mouse and touch gestures, including their edge-pan callbacks. Invoke it before parking history or emptying the departing squadron; remove the unfinished gesture’s Undo entry there. Capture the session serial when each gesture starts and reject stale move, release and cancel callbacks before they mutate state or save.

   **Failing test:** Hold a bend handle on 142, switch to 149, then move and release the same pointer; assert neither squadron’s saved layout changes and 149 remains clean.

2. **Pending export can collect the next squadron’s data — medium**

   **Failure:** A master admin scheduled to move from 142 to 149 opens Export on a clean 142 Tracker and chooses charts and students. They leave the native Save picker open across midnight. Once the app moves to 149, confirming Save exports 149’s current data using the choices made for 142, potentially reporting it as a full backup.

   **Cause:** [`core.js`, `saveCopyClick`](C:/Users/User/AppData/Local/Temp/claude/e2bface01731fdd2/54f040ff-8439-4869-a472-6275312a3185/scratchpad/read-export/raptor-port/src/tracker/app/core.js:7365) captures options before awaiting the picker, but collects charts and students afterwards from mutable current state. The switch neither drains this operation nor invalidates it. Unlike the import path, export has no session-serial guard.

   **Fix:** Capture the session serial and storage unit when export starts. Check both after the picker returns, after each awaited collection, and immediately before writing or downloading; abandon the export if either changed. After an awaited write, also guard success/error handling so an old operation cannot close or update the new squadron’s interface.

   **Failing test:** Defer `__pickSaveForTests`, switch from distinct 142 data to 149 data, then resolve the picker; assert no file write and no export-success message occur.

3. **Role-change Undo hides other effects of the same Save — medium**

   **Failure:** A master admin gives Hunter Plan of 149, then changes Hunter to Member and changes his sign-in name in one Save. That Save also ends his Plan. Undo says only “Hunter’s role”, although pressing it restores the Plan and old sign-in name too.

   **Cause:** [`describe.ts`, `accessLabel`](C:/Users/User/AppData/Local/Temp/claude/e2bface01731fdd2/54f040ff-8439-4869-a472-6275312a3185/scratchpad/read-export/raptor-port/src/undo/describe.ts:400) returns immediately at line 418 whenever the role changes without a master-mark change. It never collects the grant or sign-in changes. The approved specification explicitly includes this role-plus-Plan case under item (o), at lines 490–492.

   **Fix:** Collect all changed facets before choosing the label. Preserve the existing role-only wording only when role is the sole change; otherwise include the role, every affected squadron grant, and any sign-in change in the comma-joined description. Preserve the existing rule against separately naming a role already represented by the master-mark change. Replace the test that currently expects the omission.

   **Failing test:** Save Member plus a new sign-in name for an admin holding Plan of 149; assert the Undo description names all three effects and one Undo restores all three.

Unproven leads: none additional retained.

Tidiness, filed here—not fixed: the new switch path repeats state resets across `leaveSquadron`, `endSession` and `emptyForMove`; give gesture cleanup one explicit owner when addressing finding 1.