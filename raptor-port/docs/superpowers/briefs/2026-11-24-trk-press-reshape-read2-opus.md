# The Tracker press reshape — round 2, the fresh Opus reader (blind; chat 166, 24 Nov 26)

Brief: `2026-11-24-trk-press-reshape-read-brief.md`, the same as round 1, told the plan was revised (§3–§7, §8).
Saved verbatim from the helper's hand-back by the host.

---

Copy read: C:/rc166 (branch claude/msq-b1-screens-135 exported at 12dd76c58). Round 2, blind. I opened no handoff block and none of the `*trk-press-reshape-read-*` reports, including the round-1 reports that §8 names. Nothing was changed or run.

**Verdict.** The revised cut is sound. Ending the press at the two window capture doors, cancelling on a chart swap, and letting a redraw wait does close faults 1–4 and rows 3–17 on the paths a hand drives. I found no HIGH. Two §8 verdicts do not fully hold, step 6 opens a new fault of the same family, and a few visible changes are missing from the owner's questions.

## Findings

**1. MEDIUM — a refused landing still takes two changes on the real key path (§8 row "Undo with a landing whose save is refused" does not hold).**
- Failure: he adds event B, drags ball A and holds it. The save is refused (the msq-fix2-trksave case, where the store's squadron changes under the open Tracker). He presses Ctrl+Z, or on a phone a second finger taps ↶.
  - The keydown door lands A. `saveLayout` is refused, `dropRefusedStep` removes A's step and `trkStore.restore` puts A back.
  - Then the bubbling `handleUndoKey` (document listener, App.jsx l.121) calls `doUndo`. Its belt finds no press, so `step` pops B's step. B vanishes as well: two changes go.
- Cause: the "stop after a refused landing" guard (§3.3) lives only in the `doUndo`/`doRedo` belts. The door lands first, so the belts never see the press.
- Fix to the plan:
  - `pressEnd` returns whether the landing's save was refused (compare `TRK_REFUSED_N` across `commit`).
  - On a refused landing the door calls `preventDefault()` + `stopPropagation()` on the key or press, and swallows the click that follows a press.
  - T1's refused case is sent as a real `keydown` Ctrl, then Z, not a direct `doUndo`.

**2. MEDIUM — step 6 leaves an unmoved click on a drawn line's end changing the chart with no Undo step.**
- Failure: after step 6 the end takes its step at its first move (`pressChanged`), and `pushUndo` leaves its commit. An own-lift landing always runs `commit(p, ev)`, and today's `.lend` lift body re-snaps "even unmoved" (§1.1 says so): `endDragRebuild` to the click point, `L[key] = sn?…`, `deriveLineLinks`, `markDirty`, `saveLayout`.
  - On a loose (amber) end, a click a few pixels off moves the end, stores it and lights ✓ Save changes, with nothing for Undo to take back.
  - On a connected end it lights ✓ Save changes for nothing.
- T5's "an end merely clicked: Undo — as before the press" then passes vacuously: there is no step, and the history is empty after `drawnLine()`'s Save.
- Fix to the plan: after step 6 the `.lend` commit does nothing unless `p.moved`, as `.lvert` already does (`if (moved)`). T5's click case asserts the stored layout, `canUndo()` and `sylDirty` all unchanged.

**3. LOW–MEDIUM — another tab's or person's save of the same chart now cancels his drag, against §3.5's "someone else's change arriving does not end his drag".**
- Every ball move in another tab saves `trk.layout` at once. That reaches `trkWriteRecords` l.919 (layout branch); a chart Save reaches l.932. Both are `chartGoing` sites, so his held ball jumps back.
- Today a ball drag writes `layout[drag.id]` into whatever `layout` is current, so his move rides on top of theirs.
- Cancel is the safer rule (a line handle's captured `L` would otherwise write into an orphan), but it is a visible change not put to him.
- Fix: state it in §3.5's last paragraph and in Q2. Add a W14 variant (the other tab moves a ball on the same chart) and a T7 case.

**4. LOW–MEDIUM — visible changes missing from Q3.**
- A line handle held through a squadron pick or Logout made by his own hand now lands. The landing runs `markDirty`, so the "You have unsaved chart edits… Save them / Discard / Stay" question appears where today the cancel left `sylDirty` false and nothing was asked. Same for the member-view switch, which takes the hold path with a dirty draft.
- On a phone, any touch off the chart (a thumb resting on the header or the Info half, a palm at the screen edge) now drops the ball mid-drag. Today only the take-back window closes (`releaseFirstFinger`, l.4265). Add "a resting thumb" to the iPhone looks.
- Rest of the app: Raptor's other drags (`ui/caldrag.ts`, `InputsCal.tsx`, the Reorder lists) end only on Escape and ignore other keys. The Tracker would be the one place where any key puts a drag down. That is defensible, since the door needs the keys that act, but Q3 should say so.
- Add to the iPhone looks: a ball held still for some seconds (iOS long-press may send `pointercancel`). Under Q2 the ball would then go back where today it saves.

**5. LOW — step 1 can leave msq-night-press-undo red.** Step 1 deletes `endPressForStep`, but the `doUndo`/`doRedo` belts arrive only in step 2. Fix: step 1 must say `doUndo`/`doRedo` call `pressEnd('cancel')` (today's behaviour) until step 2 turns them into landings.

**6. LOW — a refused `pressBegin` must still stop propagation.**
- Failure: when `pressBegin` answers null (`chartBusy`, `unitLeaving`, a press still held), a `.lvert` or `.lend` pointerdown that returns before `stopPropagation()` bubbles to the svg's own pointerdown (l.3876).
- Cause: that listener's skip list (`.ball .edgehit .port .endhandle .linehandle`) lacks `.lvert`/`.lend` outside the Line tool, so it starts a pan, or a selection box with the Select tool.
- Fix: each kind stops propagation before calling `pressBegin`.

**7. LOW — the key door should skip auto-repeat and more modifier keys.** A key already held before the press (Space, an arrow) sends `repeat` keydowns that drop every press at once. Fix: ignore `e.repeat`, and except CapsLock, AltGraph, Fn, NumLock and OS/Meta as well as Shift, Ctrl, Alt and ⌘.

**8. LOW — a stuck press now freezes every no-hand redraw.** A lift that is lost while the board still has its size is no longer healed by a redraw. Example: React remounts `#board` because the last course was deleted in another tab, so the captured `g` is detached. Every incoming mark's redraw then waits until his next key or press. Fix: listen for `lostpointercapture` on the ball and the group and treat it as a cancel.

**9. LOW — W13 and T2 describe a press a single mouse cannot make.** Under Pointer Events, a second button while one is held sends `pointermove`, not `pointerdown`. "Mouse, a second press on the chart" (W13) and "a pointerdown on a tool button with a ball held" by mouse are reachable only by a finger beside the mouse, or after a lost lift. Fix: W13 drives a lost lift (e.g. hide and show mid-drag) or touch plus mouse; T2 says its mouse case is synthetic.

**10. LOW — a small window outside `chartBusy`.** `switchSyllabus` and `switchSylNow` run `openSylHere` (it sets `plan.sylId`, and with nobody signed in as a person it does `await savePlan()`) before `loadCourseNow` raises `chartBusy`. A press begun and lifted in that gap notes the new chart id and the old chart's layout, so the identity check passes. Its `saveLayout` would then write the old chart's layout under the new chart's key (`kLayout` uses `curSylId()`). It is reachable only on the not-signed-in path with a slow store. Fix: raise `chartBusy` round the whole `onChain` body of both switches.

**11. LOW — loose ends in §3 and §5.**
- §3.2 says a landing ends the finger hold by `firstFinger = null`. Use `releaseFirstFinger()`, so a save already parked on the hold (`f.save`) is made, not dropped.
- An owed redraw made "beside `landIfOwed`" fires on `active` only. A redraw owed while the phone's Info tab hides the board needs paying on the return to Flow too: App.jsx's `[tab]` effect calls `refitAfterShow`, which returns early in Edit chart layout.
- Risk 2's "none found" is not quite true. `leaveRunningCoursesNow` redraws (the redraw will wait), then calls `landChart()` → `scrollToEvent` against the old board and can move the view under a held press. That costs a view jump, not data.
- In §5, three "order"/door tests pass today and are protection, not failing-first: unmoved press then the ball editor's Save, a box held then Select all, a bare Shift. Label them as such under the plan's own rule.
- A cancel restores `SYL` as well as `layout`, which replaces every event object. No press changes `SYL` before it lands (`applyEndSnap` and `deriveLineLinks` run in `commit`). Restoring only `layout` (plus `loadEdgeMeta`) is simpler and replaces fewer objects.
- After a no-hand list filter (`leaveRunningCoursesNow` replaces both lists), a cancel takes the splice path and the pre-press Redo list is lost. Minor; accept and note it.

## Statements about today's code — checked

- Fault 5 is true. `lineById` returns the live object inside `layout.__lines` (l.2840, l.2887). `.lvert` pushes its step after the change (l.3823), so Undo of a corner drag restores nothing. `.lend` frees its link at pointerdown and pushes at the lift (l.3846, l.3855), so Undo of a drag or of a mere click leaves the end loose.
- Also true:
  - Row 2: `endDrag` is bound to `pointercancel` and saves.
  - Row 3: `endPressesOnRedraw` stops the press only. The move is drawn and has a step, but nothing stores it or marks it unsaved.
  - Row 8: the cancel lays back whole lists, then `step` pops one more.
  - Row 16: the only `blur` listener is the board's, l.4306; there is no `visibilitychange` listener anywhere.
  - `applyEndSnap` reads `selEdge` at the lift (l.3266).
  - `cancelGestures` makes its three unconditional clears and has five callers.
  - `saveLayout` waits for a held finger (l.1277).
  - `trkWriteRecords` redraws for any incoming record (deferred effect).
  - `trkStore.restore` redraws.
  - `loadCourseNow` sets `loading` with no `finally`.
  - `clearDirty` wipes both lists.
  - `pushUndo` builds its entry before `pushChartStep`.
- §8's FALSE verdict on Fable M5 holds: TrackerPage dispatches `resize` on show (now l.184 in this copy), and core re-cuts the canvas on it.
- Line numbers drift a little in this copy but all match.

## Existing tests — checked

- The three press files stay green as the plan says. Their pointer events are dispatched with `bubbles: true`, so they pass the window door with no press held, and their Undo and pick calls are direct:
  - msq-night-press-undo: the presses are unmoved, so the `doUndo` belt cancels them and the Undo step stands.
  - msq-night-press-held: `switchRoleView()` is direct, so `follow` cancels.
  - msq-night-gestures: `pickSquadron` is direct.
- Also checked (pointer and key use only): msq-fix2-trksave, trk-refusals (end drop with the lift on `window`), trk-pinch-edges (presses on the board, not a ball), the retest Reorder drag and leftovers' outside press. None leaves a press held into a later step.
- One gap: no Raptor window-capture keydown listener uses `stopImmediatePropagation` on non-Escape keys while the Tracker is up, so the door hears every key. That fits risk 1.

## Explicit negatives

- **Press kinds:** every chart-changing hold in `core.js` is one of the seven (pointerdown listeners l.3707–3876, the pinch, `ArrangeTools`, `SidePanel`). The Line tool's clicks and `.linehit` act at pointerdown and hold nothing.
- **Doors the window listeners miss:** `wheel` (view only), `contextmenu` (none in the editor), chorded mouse buttons (no `pointerdown`). None changes the chart.
- **Synthetic events:** no app code dispatches synthetic `keydown`/`pointerdown`, so nothing without a hand can trip the door.
- **No-hand changes:**
  - `trkWriteRecords`, `trkStore.restore`, `leaveRunningCourses`, `follow`/the hold and `endSession` are each covered by `chartGoing`, a waiting redraw or today's cancel.
  - Mark-history pushes come only by hand.
  - Async editor commands (`addModule`, `deleteEvents`, Reset layout, link delete) take their step right after a dialog answered by hand. No press can begin between, so their belts never land without a hand.
- **Other squadrons:** no path lets a landing write into another squadron. The landing happens before the pick, and the identity check stays as the belt.

## A simpler cut — only one

Put the refused-landing swallow (finding 1) inside `pressEnd`'s door path rather than in the belts. The belts then serve direct calls only, which is all they are reached by.
