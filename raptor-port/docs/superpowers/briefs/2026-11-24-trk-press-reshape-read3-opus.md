# The Tracker press reshape — round 3 (the last), the fresh Opus reader (blind; chat 166, 24 Nov 26)

Brief: `2026-11-24-trk-press-reshape-read-brief.md`, the same as rounds 1 and 2, told the plan was revised twice (§8, §9)
and asked to judge §3.5's "Decided here". Saved verbatim from the helper's hand-back by the host.

---

Copy read: C:/rc166b (branch claude/msq-b1-screens-135 at e396d3c84), round 3. I read only, changed no file, and ran nothing. I met no handoff block (I never opened HANDOFF.md) and opened none of the other readers' reports.

**Overall.** The shape holds. Nothing I found would lose saved marks or chart work, write one squadron's chart into another's, or leave the family alive for a touch. Every §9 verdict holds against the code, with the qualifications below. One MEDIUM gap: a mouse or pen whose lift is lost is not healed the way the plan says. The rest are LOW: test wording and spec precision.

## Findings

**1. MEDIUM — a lost mouse (or pen) lift is not healed "at the next press".**
- **Failure.** He holds a drawn line's end with the mouse, and the release is never heard. The app's own Reorder windows record that this happens (Modals.jsx: "released where the page could not hear it (F2)", caught there by `!(ev.buttons & 1)` on a move).
  - The handle keeps following the pointer, and every no-hand redraw now waits behind it.
  - He then clicks a toolbar button, say Export or the squadron picker, which has no belt. The door ignores that press: its rule is "a pointer *other than* the held one", and a mouse always has the same pointerId.
  - The click's release (same id) is taken by the owner as the held press's own lift. `commit(p, ev)` re-seats the line's end at a point under the toolbar, which `onChart` clamps to ≥0. It is stored with an Undo step.
- **Partial cover.** On the chart, `pressBegin`'s belt does land it, and the new press is not begun.
- **Cause.** 3.3's "any other press" and its claim "a lost lift heals at the next touch or press" hold only for touch, where each finger gets a new id.
- **Fix to the plan.**
  - In the pointerdown door, a pointerdown whose pointerId equals `held.pid` is the lost lift: LAND at `p.last`, and swallow it when it is on the chart.
  - The owner treats a mouse or pen pointermove of `held.pid` with `!(e.buttons & 1)` as the lost lift, as the Reorder rows do.
  - Add both to step 2's "a lost lift" tests.
  - Make one rule for "a lift the page missed". Today the plan has `lostpointercapture` → CANCEL but the next touch → LAND for the same physical event. State why they differ, or align them.

**2. LOW — risk 8 is wrong in fact.** It says "a press swallowed at the door … is not counted by the pinch". The pinch's pointerdown listener is a capture listener on `#board` (core.js l.4208, `{capture:true}`). It runs before the canvas's own capture listener on `#flowSvg`, so the swallowed finger *is* counted and starts a first-finger hold.
- I traced the cases: mouse ball plus finger, and lost-lift heal plus Connect. The door runs first, so the landing's save is made before that hold exists. Benign.
- Fix: correct the sentence. In step 2's mouse-plus-finger test, assert that an edit made while that finger rests is saved once, when it lifts.

**3. LOW — T0 is not all "protection, green today".** "For each kind, the lift sent on `window` — heard" fails today for the ball, group and box. Their pointerup listeners sit on the element (`g`, `svg`), which a window-dispatched event never reaches.
- Fix: mark that part failing-first for step 1.
- Say step 1 does change behaviour in two places: lifts are heard on window, and the belt makes it one press at a time, which today allows two (row 17).

**4. LOW — T4(a) cannot pass as worded.** It says "…nothing marked unsaved". `addModule` and `applyHistData` (l.3375) both `markDirty()`, so the chart is already unsaved before the click.
- Fix: "the click adds no Undo step and no prerequisite (`canUndo` depth unchanged)".

**5. LOW — T1's real-key tests need Undo wired.** The copied harness (msq-night-press-undo) never mounts App.jsx, and `handleUndoKey` is bound only there (App.jsx l.141, on `document`). A real Ctrl+Z will land the press, but no Undo will follow.
- Fix: in step 2, have the harness bind `handleUndoKey` (and Delete/Escape if tested) on `document`, as App.jsx does.

**6. LOW — the press's step must carry the events.** 3.2 says `pressBegin` notes "the layout {lay}", and `pressChanged` pushes "the chart as noted". But an Undo entry is `{syl, lay}`, and `applyHistData` runs `JSON.parse(u.syl)`. A builder taking that literally would throw on Undo.
- Fix: the note holds `syl` as well. It is identical at pressBegin and at the first move, since no kind changes events before `commit`.

**7. LOW — trkWriteRecords re-points before the place `chartGoing` is put.** `course` (l.903) and `customDefs` (l.904) are reassigned before the l.908 branch. A held press is then judged dead by the identity check rather than cancelled.
- No data harm: the whole layer reloads, and the dead path writes and restores nothing. But "before its first change" (3.4) is not literally true there.
- Fix: work out the swap conditions first and call `chartGoing` at the function's top when one will hold, or name the dead path as accepted here.

## The "Decided here" choices (3.5)

**Kept the same as today, and right:**
- A selection box ended by anything but its own lift selects nothing. Select all under a held box stays protected.
- A page or tab switch by his own hand puts the ball down.
- A finger on the chart while the mouse holds a ball puts the ball down. This follows from one press at a time.

**A mere click on a drawn line's end changes nothing: right, with two caveats.**
- **The link's end behaves differently.** The link's end (`.endhandle`, the same orange dot) still re-seats on a still click. `applyEndSnap`'s `np.id === c` branch pushes a step that changes nothing and lights ✓ Save changes.
  - File it beside the bend-square oddity in §6.
  - Do not "fix" it in this build: trk-refusals drops link ends with no move, and relies on `applyEndSnap` running.
- **On his phone, a tap may count as a drag.** `moved` has no threshold. On his iPhone a tap usually carries a pixel of finger movement. It would then count as a drag: the end is freed and re-snapped where the finger lifts. That is undoable now, but not "nothing changes".
  - W17 by finger will pass in the test browser and may not on his phone.
  - Add it to the iPhone looks, or give `.lend` a small threshold. The Reorder rows use 4px.

**Q1–Q3.** The recommended answers match the rest of the app. "Any key" is the one deliberate exception, and it is named.

## §9, row by row

- Row 1 (the finger's note): holds. `takeBackFirstFinger` checks course and chart only (l.4060).
- Row 2 (`chartBusy`): holds. `openSylHere` runs before the load inside `switchSyllabus` and `switchSylNow`.
- Row 3 (refused landing then Undo takes two): holds. `handleUndoKey` is a `document` listener, after the door, and the swallow stops it.
- Row 4 (drawn line's end unmoved): holds. `.lend`'s lift has no movement test.
- Row 5 (the put-back lays the step back): holds. `capture` copies the list and `restore` assigns it. A command whose capture came before the press finds nothing to remove, which is also correct.
- Row 6 (one press at a time): holds. Risk 8's wording is wrong (finding 2).
- Row 7 (a lift never heard): holds for touch only (finding 1).
- Row 8 (second mouse button): holds. No `contextmenu` handler exists. Whether the native menu blurs the window is unverified; W13 will show it.
- Rows 9–25: hold as stated.

## Checked and found nothing

- **Every assignment of `course`, `plan`, `plan.sylId`, `SYL` and `layout` in core.js.** Each is inside one of the six `chartGoing` functions, inside `trkReloadCurrentFromMem` (reached only from `restore` and trkWriteRecords), or is his own edit: Reset layout, the JSON editor, Undo. No unlisted door.
- **What redraws the board.** `renderBoard` is the only function that rebuilds it. `refreshLine`, `schedDragPaint`, `refreshPreview` and `paintKbdRing` touch only attributes or the edge layer, so nothing else removes a held element.
- **Redraws during a press.** No App.jsx effect redraws on `notify`, so `pressChanged`'s notify causes no redraw. No kind's move handler calls `renderBoard`.
- **Saves.** `saveLayout`'s refusal is synchronous (l.1278–1280), so `refused` read across `commit` works.
  - For a finger's own lift, the window-capture owner now runs before the pinch's `drop`, so the save parks on the hold and is made by `drop`. The order flips from today; the result is the same: one command.
- **The night's tests, sequence by sequence.**
  - msq-night-press-undo: pointerdown only, direct `doUndo`. Stays green after step 2 (the belt sees an unmoved press, which counts as a cancel).
  - msq-night-press-held, msq-night-gestures: cancelled by `follow`; the late lifts find nothing held.
  - trk-refusals, msq-fix2-trksave, trk-batch-ui, trk-pinch-edges: the second finger carries an explicit `isPrimary:false`, so the door passes it to the pinch.
- **Risk 9's "without bubbles" worry is unfounded.** Capture listeners on `window` hear non-bubbling events dispatched on any attached element. Only a lift sent to a detached element goes unheard.
- **The edgeMeta/layout note stays consistent.** `saveEdgeMeta` links `layout.__edgeMeta` to the live object, and every edgeMeta edit saves.
- **Data already stored (D56), and the Export `close()`:** I raised nothing on either.

## Looks for his iPhone

- A tap on a drawn line's end: does finger jitter make it count as a drag? (Decided-here (d).)
- Whether opening a native picker blurs the window while a finger holds a ball (already listed in the plan).

## A simpler cut

None better. Finding 1's fix is two lines, in the door and the owner's move check, and it closes the one way a stuck press can still make redraws wait indefinitely.
