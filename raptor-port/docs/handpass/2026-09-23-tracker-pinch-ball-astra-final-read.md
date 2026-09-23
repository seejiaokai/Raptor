# [TRK-PINCH-DRAGS-BALL] — Astra's final code read (24 Sep 26)

Bug-check order §4 rank 2 / §5 FULL. Astra (Codex CLI, `codex exec -s read-only`, gpt-5.6-sol, high), blind to
Fable, read-only, given `docs/superpowers/briefs/2026-09-23-tracker-pinch-ball-final-read-brief.md` and the sheet.
Kept verbatim; dispositioned in `2026-09-23-tracker-pinch-ball.md` §10.

---

# Final code-read report

Verdict: **not ready to merge as-is.** I found three issues: one high-severity command-stream violation, one medium-severity concurrent-action rollback bug, and one low-severity visible-state omission.

I inspected `git diff main...HEAD`, the surrounding production code, the evidence sheet, Astra scenarios, the complete handpass driver, the new smoke block, and the undo contract. I made no changes and ran no app, build, or tests. The branch was clean and correctly checked out as `claude/tracker-pinch-drags-ball`.

## Findings

### 1. High — cancelled Delete/Merge/line-finish operations remain as false user commands

**Specialised surfaces:** a half-drawn line finished by the first finger, Delete on a drawn line, or an already-armed Merge/Unmerge completed by the first finger.

**Setup**

- Open Tracker → Syllabus ✎ → Edit chart layout.
- Use one of:
  - a half-drawn line waiting for its endpoint;
  - Delete with a drawn line;
  - Merge with line one already armed.
- Record `commandStream().length`, the last envelope, the legacy Undo/Redo state, and the stored layout.

**Action**

- Finger A lands on the committing target, so `finishLine`, `deleteLine`, or `mergeClick` immediately calls `saveLayout`.
- Before A lifts, finger B lands and starts the pinch.

**Expected**

The action is cancelled completely. There should be no layout command, no global-timeline entry, no revision advance, no legacy Undo change, and no stored change.

**Observed-if-wrong**

The DOM, stored layout and legacy Tracker stacks return to their starting values, but the command stream gains a `user` envelope claiming that `trk.layout` changed. The last envelope’s `after` image describes the deleted/merged/finished state even though production state has been silently put back.

**Why**

The committing pointer-down paths call `saveLayout()` immediately:

- drawn-line Delete/Merge: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:2973)
- finishing a half-drawn line: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:3057)
- the resulting writers: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:2200), [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:2517), [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:2527)

`saveLayout → sSet → trkWrite` emits a normal user command synchronously: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:539).

When finger B lands, `takeBackFirstFinger` restores the old key through `trkRestoring`, explicitly bypassing the command stream: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:3141). Thus the emitted record and real state diverge.

That breaks the undo contract’s “one user action = one closure” and recorded-before/after requirements: [undo-contract.md](/C:/Users/User/projects/Raptor/raptor-port/docs/undo-contract.md:67), [undo-contract.md](/C:/Users/User/projects/Raptor/raptor-port/docs/undo-contract.md:90). Production already ingests every user envelope into the timeline: [timeline.ts](/C:/Users/User/projects/Raptor/raptor-port/src/undo/timeline.ts:103). Tracker is not yet in the cutover-module set, so its false entry is presently ineligible for the global buttons, but it is still an incorrect authoritative stream entry and will become actionable when Tracker is cut over or a remote consumer uses the stream.

The walk misses this because `look()` inspects only the legacy Tracker stacks and browser storage; it never reads the command stream: [trk-pinch-ball.mjs](/C:/Users/User/projects/Raptor/raptor-port/scripts/handpass/trk-pinch-ball.mjs:51).

**New or older:** **new with this change.** On `main`, the first-finger edit is wrong but the command accurately represents the state that remains. This branch silently reverses state without reversing or suppressing the command.

**Exact fix**

1. First make E8, E9 and E13c record `window.commandStreamLen()` and the last envelope; assert both are unchanged after the pinch.
2. Do not let pointer-down candidates call `sSet` until the touch resolves as a one-finger action.
3. In `holdFirstFinger`, open a touch candidate containing the layout key and a pending serialized layout write.
4. While the original pointer-down dispatch is executing, make `saveLayout` update that pending value instead of calling `sSet`.
5. If a second finger lands, `takeBackFirstFinger` discards the pending write and restores only the live draft; it must emit nothing.
6. If the first finger completes without a pinch, flush the pending value once through normal `sSet`, producing one user envelope.
7. Add a reconstruction assertion: replaying the new stream must reproduce `mem[kLayout()]` after every cancelled case.

Issuing a second `restore` envelope is insufficient: it would make final storage correct but leave a false undoable user action.

---

### 2. Medium — the whole-state snapshot can erase an independent Undo made while finger A is held

**Specialised order:** touch plus keyboard, on a touchscreen laptop/tablet.

**Setup**

- Make two distinguishable chart edits and ensure Undo is available.
- Enter Edit chart layout with Move selected.

**Action**

1. Finger A lands on a ball but does not move.
2. While A remains down, press Ctrl/Cmd+Z on an attached keyboard.
3. Confirm the chart visibly undoes.
4. Finger B lands on the canvas and starts a pinch.

**Expected**

The first-finger gesture is cancelled, but the independently requested Undo remains applied. The second finger must not turn back time past an action that was not caused by finger A.

**Observed-if-wrong**

The chart, `undoStack`, `redoStack`, `sylDirty` and stored layout return to their values from before Ctrl/Cmd+Z. The explicit Undo is erased.

**Why**

`holdFirstFinger` snapshots the complete chart, layout, both history stacks, dirty flag and selections: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:3134). `doUndo` remains available while that snapshot is live: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:2691). On finger B, `takeBackFirstFinger` cannot distinguish finger-A mutations from the independent Undo and restores the entire snapshot wholesale.

The same defect class applies to another header/tool action, course or syllabus change, or any future remote write admitted while a first-finger snapshot is live. A course/syllabus change is especially dangerous because the snapshot does not record or validate the current course/syllabus before writing its old live `SYL/layout` back.

**New or older:** **new with this change.** The whole-state delayed snapshot and restoration do not exist on `main`.

**Exact fix**

1. Add the Ctrl/Cmd+Z sequence above to `trk-pinch-ball.mjs`; it should fail first by showing Undo has been reversed.
2. Add a single `cancelFirstFingerCandidateBeforeIndependentAction()` gate.
3. Invoke it before independent actions execute—at minimum in `doUndo`, `doRedo`, the keyboard Delete/Escape paths, tool-strip mutators, and course/syllabus/mode switches.
4. That gate must stop and roll back only the pending first-finger operation, clear its candidate, then allow the independent action to execute.
5. Store `course`, `curSylId()` and the layout key in the candidate, and refuse any whole-snapshot restore if those no longer match. This is a fail-safe against restoring one chart into another.
6. Keep sync blocked while the candidate is open, or route an incoming sync through the same gate.

---

### 3. Low — the armed/draft guidance and save-status feedback do not return to their pre-finger state

**Specialised surfaces:** half-drawn Line and armed Merge/Unmerge.

**Setup**

- Start a half-drawn line and observe “Now click where it ends…”, or arm the first merge line and observe “Now click the crossing line…”.
- Note the current `#saveStat` text.

**Action**

- Finger A performs the finishing/second-line action.
- Finger B lands before A lifts and starts a pinch.

**Expected**

The half-line or armed merge and its corresponding visible instruction return exactly as they were. A cancelled action should not report “saving” or “saved”.

**Observed-if-wrong**

The structural state is restored and the next tap can still finish the line/merge, but the specialised instruction disappears and the generic tool hint is shown. The save indicator may flash or settle on “saved” despite the gesture being cancelled.

**Why**

`takeBackFirstFinger` unconditionally assigns `hintFlash = null`: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:3152). It snapshots neither the hint nor its expiry timer nor `saveStat`. Immediate `saveLayout` calls also drive the save status: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:559).

The walk actually reads `hint`, but `KEEP` omits it, so no scenario compares it: [trk-pinch-ball.mjs](/C:/Users/User/projects/Raptor/raptor-port/scripts/handpass/trk-pinch-ball.mjs:53), [trk-pinch-ball.mjs](/C:/Users/User/projects/Raptor/raptor-port/scripts/handpass/trk-pinch-ball.mjs:73).

**New or older:** **new with this change.** On `main`, the visible feedback corresponds to an edit that really remains; only the new rollback makes it false or incomplete.

**Exact fix**

1. Add `hint` and `#saveStat` text/class to the walk’s preserved state.
2. Record `hintFlash` and its expiry deadline in `holdFirstFinger`.
3. On cancellation, restore the old hint and re-arm only its remaining timeout; do not blindly clear it.
4. Fix finding 1 by deferring persistence, which also prevents a cancelled action from generating save-status promises.
5. Add E8 and E13c assertions that both the draft/armed state and its instruction survive.

## Coverage inventory

| Production surface | Visible sign and required gesture |
|---|---|
| Prerequisite-arrow bend and ends | In Edit chart layout → Edit lines, blue bend and orange ends remain exactly placed and selected; two fingers only zoom. |
| Drawn-line ends, corners and body | Orange/blue handles, anchors, derived prerequisite and selected line remain unchanged; Delete/Merge/Unmerge must leave no write. |
| Half-drawn line | Dashed preview and its “choose the endpoint” instruction remain; the next ordinary tap still completes it. |
| Ball and selected group | Ball transforms and dashed selection rings remain; alignment guides disappear; Undo/Redo and storage do not change. |
| Selection marquee | Rectangle disappears and the original selection returns. |
| Connect/Text/Delete-on-ball | No connection, editor, question or trailing click; prior source/selection remains. |
| Canvas pan | Pan completed before finger B is retained; pinch anchors from that view. |
| Normal chart | Ball/wedge/Details targets do not click; only `flowZoom` and scroll anchoring change. |
| Mode doors | Syllabus ✎ → Edit chart layout and ✓ Done editing chart preserve the board midpoint; ordinary mode’s `view` is identity. Logout clears the editing view for the next session. |
| Writers/readers | `layout`, `SYL`, legacy stacks, dirty state, storage, command stream, reload/syllabus round-trip, normal renderer and export must agree. Finding 1 is the sole mismatch found. |
| Roles | Tracker has one shared authority surface; no admin/member variant needs separate gesture behavior. |

## Explicit negatives

- I checked ball drag, selected-group drag, marquee, alignment guides, free-line handles, prerequisite handles and second-finger-on-another-ball guards and found no additional cancellation omission.
- I checked Merge and Unmerge’s common path, including `snapStraight`, `merges`, `unmerges` and `loadEdgeMeta`; the layout snapshot restores their geometry and crossing metadata.
- I checked the two renderings and found no third chart renderer: normal and editing views share `#board/#flowSvg`.
- I checked every visible way into and out of Edit chart layout. Only the header button calls `toggleArrange`; logout uses `endSession`.
- I checked `view` leakage. `renderBoard` resets it outside arrangement mode, `toggleArrange` resets it through the redraw, and `endSession` explicitly restores identity.
- I checked midpoint anchoring, slack recutting, 400%→300% clamping and the second animation-frame placement and found no source-level error beyond the evidence’s existing sideways-phone exclusion.
- I checked normal-chart layout writing and found none; its ball interactions are marking/student/Details actions.
- I checked click-driven Connect, Text, ball Delete and prerequisite Delete. They do not write on pointer-down; the Chromium walks provide reasonable click-suppression evidence.
- I checked capture scope. Mouse is explicitly ignored, listeners are board-local, and no new window-level lift listener remains. The capture handlers do not attach to another page.
- I checked pointer-lift orders, pointerleave cleanup and the zoom-limit path and found no additional stale-count path covered by normal two-finger use.
- I checked the stored-layout key and found no second durable key that a first-finger canvas action can write.
- I checked reload, syllabus round-trip and export readers and found no new-data or migration-only issue.
- I checked role authority and found the same Tracker access for admin and member.
- I excluded `[TRK-EDIT-SIDEWAYS]` and `[TRK-TAP-AFTER-DRAG]` as instructed.

## Remaining evidence gaps

- No real iPhone was walked; the evidence used Chromium touch input. This is declared in the sheet, but it remains the highest-value device check because the owner’s second defect was phone-only.
- The handpass compares the legacy stacks and storage, not the command stream or save indicator. That is why finding 1 passed all reported checks.
- The handpass captures `hint` but deliberately omits it from comparison, masking finding 3.
- The evidence sheet’s “Gates” and “two code reads” sections are still placeholder text rather than recorded results: [evidence sheet](/C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md:186).

## Questions on the promise

1. After one finger lifts from a pinch, should the remaining finger stay inert until lifted—as implemented—or transition smoothly into canvas pan?
2. Does “going out keeps the middle” apply only to ✓ Done editing chart, or also to logout/session end? Current logout intentionally clears the previous user’s view rather than preserving its midpoint.
3. Should stylus-plus-touch count as a pinch? The listener ignores only `pointerType === "mouse"`, so a pen is currently counted as a finger: [core.js](/C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:3181).
4. Does “return to the moment the first finger landed” expressly include the transient hint and save-status text? I treated it as yes because those are the visible signs explaining an armed merge or half-drawn line.

