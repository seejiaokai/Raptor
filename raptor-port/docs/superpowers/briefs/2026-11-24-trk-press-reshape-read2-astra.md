# The Tracker press reshape — round 2, Astra (blind; chat 166, 24 Nov 26)

Brief: `2026-11-24-trk-press-reshape-read-brief.md`, the same as round 1, told the plan was revised (§3–§7, §8). Astra wrote this report itself (`codex exec -o`); copied by the host unchanged.

---

Copy: C:/rc166 — exported branch claude/msq-b1-screens-135, source commit 12dd76c58.

**Changes required before build.** The revision addresses the four reported faults substantially better, but leaves two gaps in chart protection and three smaller inconsistencies. This was a static review: I ran no tests and changed no files. I encountered the removed-handoff placeholder and ignored it. I did not read the other reshape reports.

**1. HIGH — the first-finger snapshot remains an independent way to restore an obsolete chart.**

Rest a finger on empty canvas, without starting one of the seven registered presses. Let a same-chart replacement or rollback occur, then put down the second finger. `chartGoing()` calls `pressEnd`, which returns immediately because there is no owner. It leaves `firstFinger` intact. `takeBackFirstFinger()` subsequently restores that snapshot’s chart, history and picks because it checks only course and syllabus identity—not the generation.

The replacement can disappear from the editor and be overwritten by a later save. Preserving `cancelGestures()`’s unconditional clears does not cover the additional `chartGoing()` doors.

**Plan fix:** invalidate the finger snapshot unconditionally before every chart/history replacement, including when no press exists. Give its take-back permission the same identity/generation protection as the owner, while preserving intentional pinch cancellation. Test an empty-canvas finger across a same-identity replacement and rollback, followed by the second finger and a save.

**2. HIGH, under delayed storage — the busy period starts after the syllabus identity changes.**

`switchSylNow()` awaits `openSylHere()`, then `flushNow()`, and only afterwards enters `loadCourseNow()`. The proposed busy counter covers the load, leaving the preceding interval open.

With that wait delayed, a new drag can begin on the old drawing after `plan.sylId` names the destination. Its snapshot records the new identity, so the retained identity check accepts it. Lifting can save the old layout under the destination syllabus.

Today `flushNow()` returns immediately; this is a delayed-storage failure, not a demonstrated ordinary interaction today.

**Plan fix:** hold the busy counter around the entire identity-changing operation, through its waits and completed redraw, with `finally` cleanup. Extend T7 to attempt a **new** drag during the pre-load wait; testing only an already-held drag misses this.

**3. MEDIUM — rollback can put the cancelled press’s Undo entry back.**

Move a ball, then let an unrelated command capture state and fail while the press remains held. Its rollback snapshot contains the press’s history entry. The proposed first-line `chartGoing()` removes that entry, but `trkStore.restore()` then assigns `snap.undo` and `snap.redo`, reinstating it.

The ball returns to its stored position, yet Undo contains a cancelled drag. The next Undo can appear to do nothing instead of undoing the preceding real edit.

**Plan fix:** reconcile the incoming rollback history with the cancelled owner’s entry before applying it. Preserve unrelated entries, prior Redo and any trimmed history. T7 must assert the exact next Undo/Redo result, not merely that the late lift writes nothing.

**4. MEDIUM — step 6 misses an endpoint change made only at release.**

Click a loose drawn-line endpoint within snapping distance of a port, without a move event. Its release still calls `snapAnchor`, rebuilds the end and derives prerequisites. Step 6 moves `pressChanged()` to the first move, so this release can change the chart without creating its own Undo entry. Undo then affects the preceding action.

**Plan fix:** create the owner’s step before the first actual mutation, including a release-only mutation. Use the original press snapshot and make step creation idempotent. T5’s clicked-end fixture must actually change attachment/prerequisites, retain an earlier unrelated edit, and prove Undo preserves that earlier edit.

**5. MEDIUM — the mouse-under-pinch promise conflicts with `pressBegin`.**

Hold a mouse drag; place the first finger on another draggable object, then add the second finger. The first finger reaches a registered handler before pinch mode begins. The proposed “another press is held” rule lands the mouse drag and refuses the new press. Checking `held.finger` later cannot preserve a mouse owner already ended.

**Plan fix:** explicitly route touch pointers to pinch handling while a mouse owner exists, without starting another chart press. Its wider finger snapshot must not restore over mouse movement either. T0 needs this sequence with the first finger on an object, not just empty canvas.

**Coverage and factual checks**

I found all seven press kinds: ball, group, selection box, prerequisite bend/end, and drawn-line corner/end. The plan registers each. Edge panning must report movement through the same owner.

The mutation and replacement doors I checked were:

| Door | Assessment |
|---|---|
| Pointer movement, release, edge pan and pinch take-back | Covered except findings 1, 4 and 5. |
| Undo/Redo; event, prerequisite, line, font, merge, delete and reset actions | Input capture precedes ordinary handlers; early history belts and pick pruning address the reported cases. |
| Tool, selection, Connect and drawing-state changes | Capture ordering plus captured endpoint identity addresses stale picks. |
| Save, Revert, Done and leave-edit questions | Landing/cancellation order is specified; save-time press blocking is appropriate. |
| Course/syllabus load, switch, add, duplicate and delete | Existing owners are cancelled; finding 2 concerns newly admitted presses. |
| Squadron/person changes, member view, sign-out, holds and session ending | Existing cancellation routes remain; hand-driven actions intentionally land first. |
| Import, record writes, departure cleanup and command rollback | Replacement/redraw handling is present; findings 1 and 3 remain. |
| Export and page/Flow visibility changes | Landing before user-driven transitions and cancellation for external hiding are coherent. |

The fifth fault is correctly diagnosed in today’s code: the drawn-line corner snapshots after movement; the endpoint snapshots after detachment. I found no additional stale-Connect route beyond those the revised pruning and source check address.

I found no evidence that this reshape worsens the separately excluded Export-close race. The claim that all existing night tests remain green is plausible for their direct-call cancellation cases, but **unproved**; those tests do not establish the new input-door behavior.

**Section 8 verdicts**

These assessments follow the rows in their printed order. “Holds” endorses the disposition, not an unrun implementation.

| Shared finding | Round-2 assessment |
|---|---|
| Snapshot taken before landing | Holds. |
| Identity changes before generation; lost identity guard | Holds; correction incomplete—finding 2. |
| Unconditional finger/pan clears | Holds; additional replacement doors need finding 1. |
| Touch landing loses waiting save | Holds. |
| Stop clears commit data | Holds; owner-held finishing data is necessary. |
| Undefined “moved” | Holds. |
| Flow → Info hides active board | Holds. |
| Missing delete/pick paths | Holds. |
| Build order | Holds in principle; qualifications below. |

| Single-reader finding | Round-2 assessment |
|---|---|
| Landing redraws under next press | Holds; swallowing the subsequent click needs browser proof. |
| Throw leaves `loading` set | Holds; separate counter is sound, with finding 2. |
| History wipes outside pushes | Diagnosis holds; rollback correction incomplete—finding 3. |
| Caller changes picks before landing | Holds. |
| Unmoved cancellation replaces objects | Holds for cancellation. |
| Box finish overwrites Select all | Holds. |
| Redraw occurs without user input | Holds. |
| Hidden board has no refit on return | Rejection holds: the show/resize/refit path exists. |
| Events-only swap leaves moved layout | Holds for registered owners. |
| Refused landing followed by Undo takes two | Holds; prove through actual input as well as the direct belt. |
| Clean Rename cancels drag | Holds. |
| Take finger note first; retain `selEdge` clearing | Holds, subject to finding 1. |
| Mouse drag survives pinch | Intended behavior accepted; proposed correction insufficient—finding 5. |
| Cancel before swap; prune afterwards | Holds. |
| Use `pushChartStep` | Holds. |
| Capture blur fires on child focus changes | Holds; window-only, non-capture handling is appropriate. |
| Export picker cancels held drag | Revised input ordering addresses it; native picker behavior remains untested. |
| Duplicate captures half-drag | Holds for the drag present at activation; finding 2 covers a later one. |
| Landing inside another command | Ordinary input path avoids it; rollback still needs finding 3. |
| Keep window-focus cancellation | Holds. |
| T4c/W1/T7/drawn-line fixture corrections | Hold; add the missing cases above. |
| Clicked endpoint leaves end loose | Diagnosis holds; step 6 incomplete—finding 4. |
| Blur/caller-count/row/test-description corrections | Hold, except the mouse-pinch assurance addressed above. |
| Box, link-selection and incoming-mark visible changes | Revised intentions hold; incoming-mark proof needs correction below. |
| Q2 window/page distinction | Holds. |

**Tests, sequencing and owner-visible behavior**

W14 cannot presently prove live cross-tab updates: this store’s `loadLatest()` is a no-op. Inject a controlled incoming-record change, assert that the mark reaches this editor, then prove the drag continues and the final redraw includes both results. Keep genuine two-tab delivery as a separate future check.

The incremental order is otherwise workable. Step 1 must already move all finishing data into the owner; step 2 cannot be its first introduction. Do not require step-6 history fixes to pass earlier. No unchanged-suite claim should be made until run.

Q1 and Q2’s recommendations fit the surrounding behavior. Q3 correctly exposes the wider change: unrelated keys, tools, page changes and hand-driven squadron/logout actions now land the drag. Also state explicitly that **the second mouse press on the chart is consumed**; the person must press again to start another action. That differs from “then does what it does.”

Phone-only checks remain second-finger button activation, native pickers, calls/system cancellation and screen-edge gestures.

The safer cut is the chosen input-door design with one shared invalidation contract for **both** the owner and the finger snapshot, plus busy coverage around whole switches. Its cost is a small increase in scope and focused tests; it avoids retaining two independent authorities capable of restoring the chart.

Rulings: none this session.