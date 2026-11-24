# The Tracker press reshape — round 3 (the last), the fresh Fable reader (blind; chat 166, 24 Nov 26)

Brief: `2026-11-24-trk-press-reshape-read-brief.md`, the same as rounds 1 and 2, told the plan was revised twice (§8, §9)
and asked to judge §3.5's "Decided here". Saved verbatim from the helper's hand-back by the host. (The earlier rounds'
six report files were left in the readers' copy as one-line placeholders; the reader says it opened none.)

---

Copy read: C:/rc166b, the export of claude/msq-b1-screens-135 at e396d3c84. Read only; nothing changed, nothing run (every claim below is from reading the code). I opened no handoff file. Note: the earlier readers' reports are NOT removed from this copy (six `…trk-press-reshape-read*` files sit in the briefs folder); I did not open them.

## Verdict

No finding that should stop the build. The shape holds: I found no way left for a held press to write into another chart, lay an old chart over newer work, or take two changes with one Undo on today's (instant) store. Two MEDIUM gaps and some LOW wording gaps follow; each fix is one or two lines of the plan.

## Findings

**1. MEDIUM — Import's replace of the chart on screen is a missed `chartBusy` site (slow store only).**
- Failure: once the store is slow (the database step), he imports a file that replaces the chart on screen. While Import is writing, he drags a ball and lets go. His lift stores the OLD layout plus his move over the layout the Import has just stored; the reload then shows the imported events on the old layout. The imported layout is lost.
- Cause: `applyCharts` (l.7127) stores the chart's layout at l.7151, then waits on five more store writes (l.7166–7199) before `loadCourse` at l.7200. No question is up, and course, chart id and generation are unchanged in the gap, so the press is not dead. §3.4 raises `chartBusy` for the two switches, Delete syllabus, Revert, the load and the save only.
- Same class as round 2's Astra 2. Not reachable while the store answers at once; today's code has it too, the reshape does not worsen it.
- Fix: in 3.4 and step 3's build line, add "round `applyCharts`' body, from before its first write to the end of its `loadCourse`". Add to step 3's "a new press in a wait": a press tried inside Import's replace, on a store made slow, does not begin, and the imported layout is what is stored.

**2. MEDIUM — the door does not heal a lost lift of the same pointer (a mouse is always the same pointer).**
- Failure: he holds a link's bend with the left button, presses the right button (the browser's own menu opens; `core.js` has no `contextmenu` listener), and lets go of the left button over that menu. Whether the page hears that lift is not checked in a browser; if it does not, the press stays held. His next left click is the SAME pointer id, so by 3.3's wording ("a pointerdown of a pointer other than the held one") the door does nothing. A click on a link or Connect's first ball then asks for a redraw that waits: nothing shows until a key, a tool, or a press on a ball. Android reusing a touch id is the same case.
- Cause: 3.3's "any other press" row; step 2's tests use only a second pointer id, so the literal reading would be built.
- Fix: reword to "any `pointerdown` while a press is held (the press's own never meets `held`: the door runs before `pressBegin`), except a non-primary touch on the chart while a finger's press is held (the pinch)". Add to step 2's "a lost lift": a mouse's handle moved, lift withheld, a second mouse `pointerdown` with the same id on a link: the handle is stored, the press is used up, and Connect's ring then draws. W13: left held, right click, release over the menu, click again.

**3. LOW — a finger's own lift: the save is parked on the hold, and only the pinch's listener makes it.**
- Cause: the owner's `window` capture `pointerup` runs before the board's capture `drop` (l.4260). `commit` → `saveLayout` finds `firstFinger` still set and parks the save (l.1277); it is made only when `drop` hears the same lift. Today `drop` runs first.
- Failure: T0's "lift sent on `window`" with a touch pointer stores nothing; so would any real lift the board misses.
- Fix: in 3.2 step 4, `releaseFirstFinger()` before `commit` on every landing of a finger's press, its own lift included, and read `refused` from before that release (a parked save refused there is otherwise not counted).

**4. LOW — the press's step needs the events too.** 3.2 says `pressBegin` notes "the layout {lay}" and that `pressChanged` pushes "the chart as noted at pressBegin". An Undo step is `{syl, lay}` (`applyHistData` l.3375 parses both); a step with no `syl` throws at Undo. Fix: say the step is `{ syl: JSON.stringify(SYL) taken at pressChanged, lay: the note's }`. T0 would catch it; the plan should not leave it to be found.

**5. LOW — a waiting redraw is paid inside exits that asked for none.** 3.2 step 6 ("a redraw that waited is made now") also runs inside `cancelGestures` and `chartGoing`. So an owed redraw (someone's mark came in during the hold) is drawn inside `endSession` ("sign-out still makes no redraw of its own" is then untrue) and in the middle of `trkWriteRecords` (l.919, l.932: `mem` and `customDefs` already new, `SYL` old). No data is touched; a throw there would stop the incoming records. Fix: where the caller asked for no redraw, the owed redraw is dropped (their callers redraw). Also put steps 2 and 6 in a `finally`, so a `commit` that throws cannot leave listeners on.

**6. LOW — test wording.**
- In jsdom a `keydown` activates nothing. Every "by key" test (Enter on ✓ Save changes, the key that opens + Add course, + event by 'K', the Font box) must send the `keydown` through `window` AND then make the click or call. Say so once in §5.
- Unmarked protections (pass today): step 3's "a load that throws, a switch that throws — the next press still begins"; step 5's "a `blur` whose target is a button — nothing ends".
- "Must stay green, unchanged" is unproven for tests that leave a press held between cases with the same pointer id 7 (all three press files use 7 for everything): `pressBegin`'s belt refuses the next press. The plan already says the suite decides; add that such a test is reported, not edited to pass.

**7. LOW — the refused-landing swallow cannot stop a native dropdown.** `preventDefault` on a `pointerdown` does not stop a `<select>` opening in every browser [not checked]. After a refused landing a press on the Syllabus or squadron picker may still act. No data harm (the store has already put the chart back, and only Undo could take two). Note it in risk 8.

## §9's 25 verdicts

All hold. Opened in the code and confirmed:
- Row 1: `takeBackFirstFinger` l.4060 checks course and chart only; `holdFirstFinger` l.4045 copies the chart and both lists.
- Row 2: `openSylHere` l.2396–2399; `switchSylNow` l.6379–6382; Delete syllabus's `plan = f.plan`; Revert's `sweepChart`. Incomplete by one site: finding 1.
- Row 3: `handleUndoKey` l.3478 is bound on `document` in `App.jsx` and stops only on `dlg`; `trkRefused` l.693 raises no box when one is up or under `trkQuietly`.
- Row 4: `.lend`'s lift l.3852–3861 has no test of movement; `.lvert` has `if (moved)`.
- Row 5: `capture` and `restore` l.740 / l.749.
- Row 6: `fingerStop` is set for a finger only; no test holds a mouse drag under a pinch.
- Row 7: sound; its "any other press" wording is finding 2.
- Row 9: the layout and events branches of `trkWriteRecords`.
- Row 12: the canvas skip list l.3900 names no `.lvert` / `.lend`.
- Row 14: `loadLatest` is empty, `storage.js` l.157.
- Row 18: `releaseFirstFinger` l.4052. Row 19: `refitAfterShow` l.3604 returns early in the editor. Row 20: `leaveRunningCoursesNow` l.5880 redraws, then `landChart`.
- Last row: the door is wired in `wirePageOnce`; the pinch's own listeners are l.4264–4265.

The other rows are changes to the plan's own text; each is where the row says, and I found no contradiction. One correction to risk 8: a press swallowed at the canvas IS still counted by the pinch (its listener is on the board, above the canvas, l.4208). Harmless: its note is taken after the landing's save, so a second finger takes nothing back, as step 2's test expects.

## The four "Decided here" choices (3.5)

1. **A box ended by anything but its lift selects nothing.** Sound, but "as today" is only half true: today a key does nothing to a box; now any key removes it. Add one clause to Q3: "a selection box being drawn disappears, selecting nothing".
2. **A page or tab switch by his hand puts the ball down.** Sound; it is the door's rule, and W10 shows it beside Alt+Tab.
3. **A finger on the chart while the mouse holds a ball puts the ball down.** Sound; the order works (the door saves before the pinch takes its note).
4. **A mere click on a drawn line's end changes nothing.** Sound. Today's click frees the end at pointerdown and re-seats it at the click point with a step that undoes nothing (l.3840, l.3855–3859). No hint in `setTool` tells him to click an end to attach it. One caution for W17: a finger's tap with a pixel of jitter counts as a drag ("however little"), so by finger the result can differ from the mouse's. Say so in W17, or give "moved" a threshold.

Q1–Q3's recommendations match the rest of the app. The one visible change not named is the box (above).

## Explicit negatives

- The plan's fifth fault is true: `.lvert` l.3823 and `.lend` l.3855 push after the change.
- Rows 3, 8, 13, 14 of §1.2 are true as read.
- The Tracker's own saves do not pass through `trkWriteRecords` (`trkWrite` l.961 writes `mem` inside its own command), so `chartGoing` there never fires on his own landing.
- Wheel and resize under a held press change the view only (l.3920, `refitArrange` l.3962).
- `leaveRunningCoursesNow` changes no chart or layout.
- `saveEdit`'s and `addModule`'s waits open no new door on an instant store.
- `dropRefusedStep` still works through `pushChartStep`.
- The re-entry of risk 3 is safe as written.
- The three press test files hold as §4 says (lifts sent with `bubbles: true` or on `window`; picks and Undo are direct calls; presses in `msq-night-press-undo` are unmoved).
- I found no way the reshape worsens the Export lead.

## Looks for his iPhone (add)

Whether a finger's ball drag ever receives `lostpointercapture` mid-drag (the capture moving from the touched shape to the ball): it would now cancel every such drag.
