I read an exported copy of `334353046`.

I reviewed `review/fixes.diff`, the changed files in whole-file context, the specified rulings and contracts, and callers covering squadron entry, permissions, Tracker storage, Undo, file export, and held windows. Two isolated, in-memory probes reproduced the failures below. I did not run the application test suite or browser checks. Nothing was changed.

All source paths below are relative to `raptor-port/src/`.

**1. Export still overwrites a file after cancellation — medium**

- **Failure:** An admin exports from 142 and selects an existing backup. While the browser is still creating the writable stream, they switch to 149. When that operation resolves, the old export writes and closes the file, overwriting the backup. The subsequent cancellation check suppresses the result message, so the file changes silently despite the squadron switch.
- **Cause:** `tracker/app/core.js:7430`, `saveCopyClick`, checks its session/squadron token around collection and after `FS.writeTo`. But `tracker/app/fileStore.js:71`, `writeTo`, independently awaits `createWritable()` and `write()` before closing the file, without checking cancellation. The isolated probe invalidated the session during `createWritable()` and still observed both write and close.
- **Fix:** (1) Pass the export’s cancellation predicate into `writeTo`. (2) Check it immediately after obtaining the writable stream and again after writing, before calling `close()`. (3) If cancelled, abort the stream and return an explicit cancelled result; have `saveCopyClick` return without reporting success or failure. Preserve the existing checks before collection and download.
- **Failing test:** Defer `createWritable()` or `write()`, switch squadrons or end the session, then resolve it and assert that the stream is aborted without a committing close, the existing backup remains unchanged, and no success message appears.

**2. Cancelling a held drag resurrects history from before a completed Undo — medium**

- **Failure:** An admin with access to both squadrons saves a student’s mark in 142, enters Edit chart layout → Edit lines, selects a prerequisite arrow, and holds its endpoint without moving it. While holding the mouse button, they press Ctrl+Z, then use the keyboard to pick 149. After releasing and returning to the same chart in 142, the mark remains undone, but Redo has disappeared and Undo again names the already-undone mark.
- **Cause:** `tracker/app/core.js:3999`, `notePress`, snapshots both history stacks. `doUndo`/`doRedo` at line 3464 do not terminate the pending gesture. The endpoint’s window listeners survive the Undo redraw. Later, `leaveSquadron` calls `cancelGestures` at line 4004, which restores the pre-press history but does not restore the student mark. That inconsistent history is then parked for 142. The isolated probe observed Undo/Redo counts change from `0/1` after the completed Undo to `1/0` after cancellation, with the mark still undone.
- **Fix:** (1) At the start of both `doUndo` and `doRedo`, cancel pending chart gestures and clear their snapshot **before** passing the current stacks into `step`. (2) Redraw the restored chart when cancellation occurred, including when no history step remains. (3) Ensure later squadron departure cannot reuse the cancelled gesture’s snapshot.
- **Failing test:** Hold a prerequisite endpoint, undo a saved mark, switch 142 → 149 → 142, and assert that the mark stays undone, Redo remains available, and one Redo restores the original mark exactly once.

Unproven leads: none retained as findings; actual browser focus traversal and stacking remain unverified.

Tidiness — filed, not fixed: the new `notePress` snapshot duplicates chart/history fields already captured by `holdFirstFinger`; a shared snapshot helper would reduce divergence after the cancellation behavior is corrected.