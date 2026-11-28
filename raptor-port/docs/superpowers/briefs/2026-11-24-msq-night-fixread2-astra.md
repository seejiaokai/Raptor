I read an exported copy of `abc44cea3`, including `review/fixes.diff` (`334353046..abc44cea3`), the complete changed source files and tests, their callers, and the applicable rulings and contracts. This was a static code review; I ran no tests and changed nothing.

**1. Redraw silently loses a moved layout — medium**

**Failure:** Open a clean Tracker chart in Edit chart layout. Drag a ball with the mouse and keep the button held. Use Tab and Enter to activate **Select all**, then release the mouse. The ball stays visibly at its new position, but reloading restores its old position without an unsaved-changes warning. A selected group has the same problem.

**Cause:** In `raptor-port/src/tracker/app/core.js`, `renderBoard()` calls `endPressesOnRedraw()` (line 4039). This invokes the cleanup callbacks from `startDrag()` and `startGroupDrag()`, removing the release listeners and clearing the drag objects. It retains the moved coordinates and Undo entry but bypasses the `saveLayout()` normally performed by `endDrag()` or `endGroupDrag()`. Moving balls does not set `sylDirty`, so neither Save changes nor the departure warning catches the missing write.

**Exact fix:**  
1. Separate each ball/group drag’s successful completion from its cancellation cleanup; completion must retain its `moved` flag and original chart identity.
2. Make normal release and redraw use that completion routine: detach listeners, stop edge scrolling, clear the drag, and call `saveLayout()` once when moved. Keep cancellation rollback separate.
3. Run redraw completion before constructing the replacement SVG, without recursively calling `renderBoard()`. Preserve the existing touch-save deferral and original Undo entry; ignore subsequent releases.

**Failing test to add:** For both a ball and a group, move while holding the mouse, activate Select all before release, release late, reload the chart, and assert that the moved coordinates were stored and restored with exactly one Undo step.

**Unproven:** `fileStore.js:writeTo()` checks abandonment before `close()`, but cannot react while `close()` is pending; establish whether a squadron change or sign-out can precede the actual file replacement using a controlled real-browser close/abort test.

**Tidiness — filed, not fixed:** The newly added `storedHas` helpers are unused in `msq-night-export-abort.test.tsx:29` and `msq-night-press-held.test.tsx:34`.