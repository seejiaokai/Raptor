I read an exported copy of 91b5f476e. This was a blind, read-only plan review. I encountered an unrelated handoff block and ignored it. I read no other reader’s report for this plan, changed no files, and ran no tests or browser walks.

**The plan should not be built as written.** One owner is a sound direction, but the proposed ordering and missing entry points leave this family of faults alive.

1. **HIGH — Cleanup destroys information needed to finish an ordinary drag.**

   Section 3.1 requires `stop()` to clear the working state before calling the release work “unchanged”. Today, `endDrag` and `endGroupDrag` read that working state to decide whether to save. The selection box’s release reads its rectangle from `marquee`. Their stops clear those objects.

   Following both instructions literally makes an ordinary ball or group release skip its save, and a selection-box release lose its rectangle.

   **Change the plan:** each press must retain its own finishing information independently of the cleared globals: movement flag, final position or rectangle, and relevant targets. Cleanup removes listeners and visual effects; finishing consumes that retained information. Require normal release tests for all seven kinds before connecting outside events. “Move the release body verbatim” must go.

2. **HIGH — The history safeguard runs after the next action has already read the chart.**

   `pushUndo()` constructs the chart snapshot **before** calling `pushChartStep`, where R1 proposes to finish the held press.

   Hold and move a link end, then change the font by keyboard. Finishing the link can change its connection. The font step nevertheless receives the snapshot taken before that finishing work. Undoing the font can therefore undo the connection too.

   Some callers also retain live objects before pushing history: `saveEdit` retains its event, and `arrowClick` retains its line. Cancelling an unmoved press at the proposed safeguard replaces the chart, leaving those references detached.

   The problem extends beyond history pushes. Hold a selection box and activate Select all: `selectAllClick` changes the selection first; finishing the box at the following redraw can overwrite that choice. History also changes through loading, clearing, restoring and removing a person’s entries—not just the three push functions.

   **Change the plan:** finish the held press at the start of the action, before reading objects, validating targets, taking snapshots or changing selections/history. Keep a separate internal history append for the press itself. Explicitly audit history replacement and filtering. Add tests for link-end → font → Undo, unmoved press → event edit, and selection-box → Select all.

3. **HIGH — A touch drag finished by a redraw can still disappear after reload.**

   During a first-finger hold, `saveLayout()` sets `firstFinger.save` and postpones writing. The proposed finish calls that function, then unconditionally clears `firstFinger`. A redraw while the finger remains down can therefore finish the drag and erase its waiting save. The later lift cannot recover it.

   This directly preserves fault 2. There is an automatic redraw route: removal of departed people reaches `leaveRunningCoursesNow`, which redraws the board. The plan’s statement that no automatic source was found is incomplete.

   Also, today `cancelGestures()` clears the finger hold and pan even when no registered press exists. Replacing it with an owner function that immediately returns when `held` is empty loses that cleanup.

   **Change the plan:** specify separate finger-hold handling for finishing and cancelling. Finishing must release the deferred save exactly once while the original chart is current; cancelling must discard it. Preserve necessary cleanup when no owned press exists. Test touch drag → automatic redraw → late lift → reload, checking both stored layout and command count; retain the pinch test proving no cancelled change is written.

4. **HIGH — Chart identity changes before the proposed generation safeguard.**

   Section 3.3 places the load safeguard at the later assignment to `SYL`. But `loadCourseNow` changes `course`, clears history and awaits reads before reaching it. The selected syllabus can also change during those reads. `openSylHere` changes the syllabus before the flush and subsequent load.

   Start a held handle, call the loader, pause after the new chart identity is installed but before the proposed safeguard, then release. The old owner still has the current generation and can save old layout into the newly selected chart. Blocking *new* presses while loading does not stop this existing press.

   T7 currently releases only after loading completes, missing the dangerous interval.

   **Change the plan:** end or invalidate the old owner before changing course/chart identity and before the first relevant wait. Apply this to direct loads and catalogue operations, not just the usual picker. Add a controlled waiting-load test with movement and release during the wait, asserting that neither destination layout nor history is contaminated.

5. **HIGH — Event deletion is missing from the replacement list, leaving stale Connect picks.**

   `deleteEvents` replaces `SYL`, rebuilds the event lookup and removes related chart contents. It is absent from the claimed complete list of ten sites.

   With Connect armed on an event, open that event’s editing window by double-clicking and delete it. The Connect source can survive. Clicking another event then adds a prerequisite naming the deleted event because `connectClick` does not validate its source.

   This leaves fault 4’s family alive through an ordinary editing route.

   **Change the plan:** include event deletion and prune picks after structural removals, including drawn-line deletion, even where an array is changed in place. Validate both Connect endpoints when consuming the pick. Add the editor-delete → Connect regression. A search limited to whole-object assignments is insufficient.

6. **HIGH — Hiding the chart through Info is not covered.**

   The proposed application change watches whether Tracker is active. At narrow widths, switching from Flow chart to Info hides the board while Tracker remains active.

   Hold a line handle, use the keyboard to activate Info, then move and release. Its window listeners can continue measuring and editing a hidden chart. This can be tested with a mouse at phone width; it does not depend on iPhone behaviour.

   **Change the plan:** cancel before the local tab transition hides the board, as well as when leaving Tracker. Add that precise test.

   Retain window-focus cancellation too. Risk 5 permits dropping it if the smoke becomes flaky, but a window can lose focus while its browser tab remains visible. Visibility handling alone does not fulfil the promised interruption behaviour; fix the test’s focus handling instead.

7. **MEDIUM — The staged build cannot satisfy its stated green-test promise.**

   Step 0 adds all failing cases, while steps 1–7 each promise the whole suite green. Several failures intentionally remain until steps 4–6. Step 1’s cancellation already needs the generation mechanism deferred to step 4. The deletion list removes `fingerStop`, but its pinch replacement arrives in step 7.

   **Change the plan:** introduce each regression immediately before its corresponding implementation. Build the complete owner lifecycle—including retained finishing data, generation invalidation and pinch integration—before migrating callers. Keep the existing suite green throughout; each newly introduced regression becomes green in its own stage.

   Tighten the checks too: T4c is explicitly an existing passing protection, not a failing demonstration. W1 must check Undo/Redo before a reload that clears history, then separately verify persistence.

The entry-point inventory I checked is broader than the plan’s two safeguards:

| Ways state changes | Assessment |
|---|---|
| Ball, group, selection box, link bend, link end, drawn corner, drawn end | All seven are identified; none is missing from registration scope. Their finishing contract needs finding 1. |
| Event add/edit/delete, Connect, line creation/deletion, merge/unmerge, arrows, fonts, event-list replacement, layout reset | Require an action boundary before reads and mutations; deletion also needs pick pruning. |
| Chart/mark/group history pushes, Undo/Redo, trimming/coalescing, refused-save rollback, history clearing/filtering/parking/restoring | Push hooks alone do not establish R1. Preserve each operation’s intended history rather than restoring an older whole list over it. |
| Course/chart loads, duplicate/add/delete/revert, Import, memory reload, incoming record changes, squadron emptying | Generation protection is appropriate, but identity changes must be covered before waits. |
| Tool/mode changes, Save/Done, selections and two-click picks, redraws, pinch, interruptions and page/tab hiding | The plan covers many routes; findings 2, 3 and 6 identify remaining gaps. |

The fifth fault is supported by the code: a drawn corner changes its live points before `pushUndo`; a drawn end detaches and moves before its snapshot. Test both points **and attachments/derived prerequisites**, then Undo, Redo and reload.

I checked the existing held-press Undo tests: their seven cases really are unmoved presses. Their expectations can remain unchanged, provided “moved” is tracked separately from “has an Undo step”—the bend can create a step at pointerdown. I cannot certify the whole suite unchanged-green without implementation and execution.

I found no additional defect in the existing squadron-follow, member-view and sign-out cancellation ordering. I found no demonstrated worsening of the excluded pending Export-close lead. The refusal and incoming-record restore routes are identified, but need the timing tests above.

Both recommended answers are consistent with the stated behaviour: Undo should undo the finished drag alone; an interruption should cancel it. Correct Q2’s description of today: window blur currently has no ending handler, rather than reliably saving the ball. Also disclose that a redraw will now finish a selection box and line-handle drag; those are visible changes beyond the two listed.

The safer cut retains one owner, but gives it a complete finishing/cancellation contract first, then adds action and chart-transition boundaries. It costs more audited entry points and focused tests; the advertised small change and twelve-hour estimate should be revised.

Phone-only checks remain: second-finger toolbar taps and pickers while holding, and a genuine iOS interruption. These are not findings.

Rulings: no new owner ruling was given or recorded.