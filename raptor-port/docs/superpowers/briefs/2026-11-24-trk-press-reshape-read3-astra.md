# The Tracker press reshape — round 3 (the last), Astra (blind; chat 166, 24 Nov 26)

Brief: `2026-11-24-trk-press-reshape-read-brief.md`, told the plan was revised twice (§8, §9). Astra wrote this report itself (`codex exec -o`); copied by the host unchanged.

---

Copy: `C:/rc166b` — exported branch `claude/msq-b1-screens-135`, commit `e396d3c84`.

**Verdict: not ready to build as written.** Keep the single-owner design, but correct the four points below. Two leave this family of faults alive.

1. **HIGH — Click-only actions still bypass the owner.**

   Hold and move a selection box, then activate **Select all** through voice control or a screen reader, without a preceding key or pointer press. `selectAllClick` changes the selection; its redraw now waits. Releasing the box overwrites Select all with the box’s selection.

   During a group drag, the same activation also changes the selection that `moveGroup` reads. Newly selected balls have no captured starting position, so its next move can fail.

   The seven fallback checks do not cover this. Nor does waiting to redraw satisfy the promised rule that the press ends **before the action reads or changes anything**.

   **Fix:** add a window capture `click` check, acting only when a press remains held. Apply the same landing, refused-save and obsolete-chart-target rules there, before action handlers. Test click-only Select all during a box and group drag, including the late move and release. This also protects actions such as Arrow that read their target before reaching `pushUndo`.

2. **HIGH — Missed-release recovery excludes a reused pointer number.**

   Hold a line handle, move it, and lose its release. Press empty canvas with the **same pointer number**. The proposed input check requires a pointer different from the held one, so it ignores this new press. Empty-canvas panning need not call `pressBegin`; the old handle remains alive and redraws keep waiting. Its old move listener can still act.

   A fresh touch can reuse a number; a mouse normally retains its number. The existing lost-release test does not specify this case.

   **Fix:** recognise a fresh qualifying `pointerdown` before applying the different-pointer test. A new primary touch, or a fresh mouse press, must recover the previous held press even with the same number. Test reused and different numbers on empty canvas, then a selection change and late move/release. Assert that the old press is gone and redraws work.

3. **MEDIUM — The swallowed chart press reaches pinch handling first.**

   Hold a mouse drag and put a finger on the chart. The plan lands the mouse drag at the window, but stops the finger only at the canvas. `enablePinchZoom` listens in capture on the enclosing board, so it has already counted that finger and taken its first-finger note.

   A second finger can therefore begin a zoom involving the supposedly consumed press. Risk 8’s statement that this press is not counted by pinch is incorrect. Merely wiring the window listener first does not fix where propagation stops.

   **Fix:** stop the consumed press at the window, before the board’s listener, or make pinch reject it before counting it. Test that this press creates neither a first-finger note nor a pinch participant; retain the separate check that a genuine second finger cancels a touch drag and zooms.

4. **MEDIUM — Step 1 incorrectly labels new release coverage as protection already passing.**

   T0 requires releases sent directly to `window` to work for all seven kinds today. `startDrag`, `startGroupDrag` and `startMarquee` currently attach their release listeners to their elements. A release dispatched on the window does not travel down to those elements.

   **Fix:** separate existing element-release preservation tests from new, initially failing window-release tests. Step 1 adds behaviour; calling it entirely “no change of behaviour” obscures that.

   Separately, risk 9 misstates capture: a non-bubbling release dispatched on a **connected element** can still reach the window capture listener. A detached element is the different case. Correct that wording and test both.

I checked the mutation paths against the proposed rules:

| Paths found in the code | Coverage |
|---|---|
| Ball, group, selection box, prerequisite bend, prerequisite end, drawn-line corner, drawn-line end | All seven are registered. Capturing finishing data before removing listeners is necessary and correctly specified. |
| Connect; merge/unmerge; line creation, bend insertion, deletion and attachment; Arrow; Font; event add/edit/delete; raw event-list save; layout reset | Key/pointer-driven actions land first. Click-only actions remain exposed by finding 1. |
| Undo/Redo; history pushes, trimming and filtering; refused-command restoration; clearing saved history | The proposed ordering and removal of the press’s own entry address the identified failures. Restoration must retain the pre-press Redo and trimmed-entry information until cleanup finishes. |
| Course/syllabus switches; Duplicate; Delete syllabus; Revert; imports and reloads; member resumption | These reach the proposed swap checks. The wider busy periods address the identified waits around re-pointing. |
| Squadron changes, rights ending, hold, midnight move, sign-out, and answers to unsaved-edit questions | Existing cancellation remains; input-driven changes land first. Identity checks remain necessary. |
| Incoming layout/events, incoming marks, refusal put-back, running-course changes | Layout/events cancel; marks wait to redraw; refusal cleanup removes the cancelled entry. The documented running-course scroll jump remains. |
| Selected balls/line/link, Connect’s first ball, merge’s first line, unfinished drawing; tool and mode changes | Pruning plus clearing on load covers deleted targets. Click-only selection changes remain exposed. |
| Pinch, deferred touch saves, edge pan, focus/page visibility and Flow return | Release-before-landing and generation checks are appropriate. Findings 2–3 prevent accepting the complete interruption/recovery claim. |

The section-9 verdicts, numbered in their displayed order:

| Row | Round-3 judgment |
|---|---|
| 1 — First-finger snapshot | **Holds.** Generation check and unconditional clearing close both routes. |
| 2 — Whole-operation busy period | **Holds.** The switch, Delete and Revert waits are included. |
| 3 — Refused landing followed by Undo | **Holds for the specified key/pointer paths.** Click-only coverage needs finding 1. |
| 4 — Unmoved drawn-line end | **Holds.** Guarding the finish by movement is the right chosen fix. |
| 5 — Put-back resurrects the press’s step | **Holds as specified**, including preservation of the earlier Redo list. |
| 6 — Mouse plus touch | **Holds as a policy choice.** Its consumed-touch implementation needs finding 3. |
| 7 — Lost release blocks redraws | **Partly holds.** Window release handling helps; reused-number recovery is missing. |
| 8 — Second mouse button | **Partly holds.** Omitting `mousedown` is reasonable; the claimed click-only coverage is incomplete. |
| 9 — Incoming same-chart changes | **Holds.** Cancelling before replacing layout/events is necessary. |
| 10 — Visible changes | **Holds substantially.** Q3 should repeat the full modifier/repeat exceptions. |
| 11 — Temporary Undo/Redo cancellation | **Holds.** It preserves the intermediate build. |
| 12 — Refused beginning must not bubble | **Holds.** Stop propagation before asking the owner. |
| 13 — Repeats and modifier keys | **Holds.** The exceptions are explicit in the rule table. |
| 14 — No live cross-tab delivery | **Holds.** The empty `loadLatest` confirms the limitation. |
| 15 — Swallow flag’s lifetime | **Holds as a lifetime rule.** Its propagation location needs finding 3. |
| 16 — Cancellation return/redraw/old finger hook | **Holds.** Those responsibilities are now explicit. |
| 17 — Flush deferred save before landing | **Holds.** Keep that order. |
| 18 — Redraw on returning to Flow | **Holds.** Both return routes are named. |
| 19 — Running-course scroll | **Holds.** The documented remaining effect is a view jump. |
| 20 — Three already-passing tests | **Holds.** Those are correctly labelled protection. |
| 21 — Do not restore events on cancellation | **Holds.** These presses change prerequisites at commitment, not during movement. |
| 22 — Redo after unrelated filtering | **Holds as an explicit accepted limitation**, not exact restoration. |
| 23 — Edge-pan movement | **Holds.** It must update the owner’s movement state. |
| 24 — Complete finishing data; no premature green claim | **Holds.** Step 1’s separate T0 classification error remains. |
| 25 — Door before pinch; release hold first | **Partly holds.** Release ordering is right; wiring order alone does not prevent pinch counting the consumed press. |

I support all four **“Decided here”** choices:

- An externally ended selection box selects nothing: preserves existing behaviour.
- An intentional page/tab switch lands the drag: consistent with completing work before the next action.
- Touch beside a mouse drag lands the mouse drag: a coherent single-owner rule, but a deliberate behaviour change rather than something already established.
- Clicking a drawn-line end without moving does nothing: preferable to silently changing its attachment and making the chart unsaved. Dragging remains the explicit attachment action.

I also support Q1 and Q2’s recommendations. Q3 is coherent but broader than other drags in the app; retain that explicit disclosure and accurately name its exceptions.

The drawn-line Undo diagnosis is correct: the current corner/end finish takes its snapshot after movement, and the end also detaches at press-down. Step 6 addresses both, including derived prerequisites.

I found no additional contradiction in the named earlier-night tests: their unmoved direct Undo/Redo calls can retain their expectations. That is **not a passing-suite claim**. Apart from the findings above, I found no further new loss or wrong-squadron write in the inspected Save/Revert/Done, member, sign-out, Export or Import paths. I found no evidence that this reshape worsens the separately filed pending Export-close issue.

The smallest safer correction is to retain this architecture, add click capture, fix fresh-press recovery and stop consumed presses before pinch. Put their failing tests in step 2; split T0 in step 1. No replacement design is needed.

Real-iPhone checks remain necessary for held-touch button/picker activation, interruptions, screen edges, long holds and release delivery. Injected incoming records cannot certify live cross-tab delivery.

Read-only static review: no tests or browser walks run; no files changed. I encountered the removed handoff block’s placeholder and ignored handoff context. I did not open the earlier reshape-review reports.

Rulings: none this session.