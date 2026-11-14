# The small schedule-and-board fixes — the fresh Opus reader's blind read (11 Nov 26, chat 64)

*(Saved word for word from its final message — a fresh Opus helper given only the brief `2026-11-11-sched-board-small-read-brief.md`, on `7bd642378` (the same app code as `1d2cb16aa`). Blind to the walk and to Astra's report. Not yet acted on when saved: each finding is reproduced by a failing test first.)*

BLIND OPUS READ — the small schedule-and-board fixes (PR 756, branch claude/next-jobs-recommendation-c110df), against the brief 2026-11-11-sched-board-small-read-brief.md

Blindness: I opened none of the files the brief rules out. The only branch history I saw was the five recent commit titles the session put into my starting context (system-supplied, not opened by me). I ran no calculations, and every claim below comes from reading the code. Where a claim rests on a measurement already written down in the codebase, I say so.

Read: the full diff (src, e2e, playwright.config); undo-wire.ts snapView, landingOf and the day finders; timeline.ts globalUndo/globalRedo/snap/applyRestore; canonical.ts canonicalDiff and canonicalUnits; histbubble.ts findHistCell, findInputCell, keyOf and CELL_SEL; onscreen.ts; pinchzoom.ts; the parts of SchedBoard.tsx covering the paint effect, the pinch wiring and the structure; board.ts boardTab; board-html.ts sbInpRow; the board CSS for the scrollers, sticky parts and zoom; ChangesWindow.tsx whole; changesmodel.ts byItem; changesjump.ts jumpOf; html.ts and board.ts dayWarnHTML; insights.ts and insights-html.ts; the new tests.

====================================================================
FINDINGS, ranked
====================================================================

F1 (highest) — Undo on the Scheduler Board's desktop layout, pinch-zoomed on a phone, moves the list by the wrong distance.
- Steps: phone. On the board, ⋯ → the desktop layout. Pinch out to about 0.5 (or in to 2×). Retype a remark near the top of the day. Scroll the board to its foot. Press Undo.
- What the screen shows (from reading): at 0.5 zoom the list moves only half the distance needed, so the remark stays above the screen and the change goes back unseen, which is the bug this job set out to fix. At 2× the list moves twice too far and the remark lands about one gap's worth of screen below the bar or further, past where it should. Redo of a box in view is unaffected.
- Cause: ui/boardland.ts, bringBoardChangeOnScreen. `dy` is worked out in screen pixels (getBoundingClientRect) and written straight to `sc.scrollBy({ top: dy })`. In the desktop layout on a phone, `.schedboard.sb-wide>.sb-main` carries `zoom: var(--sbz)` (13-board-rows-responsive.css, the max-width:820px block), and the scroller is inside it (`.sb-wide .sb-boardwrap{overflow-y:auto}`, `.sb-wide .sb-board{overflow:auto}`). pinchzoom.ts's header records the measurement (21 Oct 26, pz-probe): inside a zoomed box, scrollTop is in the box's own units while rects are in screen pixels. So "a move worked out on the screen is divided by the list's scale (scaleOf) before it is written." boardland.ts does not divide.
- Fix: in bringBoardChangeOnScreen, after `const dy = scrollToShow(...)`, write `const s = sc ? scaleOf(sc) : 1` (import scaleOf from './pinchzoom') and scroll by `dy / s`: `target.scrollBy({ top: dy / s, behavior: 'smooth' })`, and the same in the `sc.scrollTop += dy / s` fallback. Or call `scrollChain(el, 'y', dy)` from pinchzoom.ts, which already does this per scroller, though it does not scroll smoothly.
- Failing test today: e2e/board-undo-land.spec.ts, new test at the PHONE size. Open the board, switch to the desktop layout (`.sb-widebtn`), set the zoom to 0.5 (a pinch, or SBZOOM / --sbz through the bridge), then mark('first'), retype ' u5', scrollTo('foot'), undo. Assert `expect(back.inView).toBe(true)`. Today it is false. A jsdom twin, in src/ui/boardland.test.ts: give the scroller `offsetWidth` 200 and a rect width of 100 (scaleOf = 0.5), put the cell at top −500 with the scroller at 0–600, spy on `sc.scrollBy` and assert it was called with `top ≈ (−500 − 0 − 8) / 0.5`. Today it is called with −508.

F2 — Some changes the board does draw name no box, so Undo or Redo leaves them unseen when they are out of view. These go beyond the two known limits ("a step that only REMOVES a row"; sideways).
 (a) A reorder.
  - Steps: drag a ground-programme row, a wave or a duty block by its grip to near the foot of a long day, or press Auto sort / Sort all. Scroll back to the top. Press Undo.
  - Shows: the row goes back to its old place out of view, and nothing on screen moves.
  - Cause: canonicalDiff reports a reorder as a 'move' entry (`mov:di.wave` etc.). canonicalUnits → entryJump returns [] for kind 'move'. boardLandKeys therefore returns [] and toBox never schedules.
  - Fix, in boardland.ts and not in engine/ (a verbatim port): for a 'days' change, when canonicalDiff(from, to, di) holds a 'move' entry, compare the rid order of that section in `from` and `to` and push the head address of the first row whose index differs, read from `to`. Use the same addresses canonicalDiff's addKey uses: `wl:di.gi` (wave), `ff:di.gi.li.cs`, `fr:di.gi.li.ai`, `ap:di.i.prog`, `sr:di.kind.i.label`, `dl:di.wi`, `dr:di.wi.ri.role`, `gr:di.i.prog`.
  - Failing test: src/ui/boardland.test.ts. `after.waves = [after.waves[1], after.waves[0], ...after.waves.slice(2)]` (with at least two waves). Then `expect(boardLandKeys(step(MON, before, after), 'undo', MON).length).toBeGreaterThan(0)`. Today it is [].
 (b) A sign-off, a publish mark or a hidden warning.
  - Steps: on a phone, where the sign-off line and the issues list head the board's one scroller, sign off or hide a warning. Scroll to the foot. Press Undo.
  - Shows: the sign-off or the struck warning line changes back above the screen, and nothing moves.
  - Cause: schedDayOf returns the day for `sched.book` / `sched.mutes` steps, but boardLandKeys reads only `days` and `inputs` changes, so it returns []. The sign-off (#sbSign) is inside `.sb-boardwrap`. #sbWarn is in `.sb-side`, outside the root the function searches, although on a phone it rides at the top of the same scroller.
  - Fix: in boardLandKeys, push a marker for each such change on day di (for example `sign:` for sched.book, `warn:` for sched.mutes). In bringBoardChangeOnScreen, search `#schedBoard` rather than only `.sb-boardwrap`, and map the markers to `#sbSign` and to the day's issues bar `[data-daywarn="<di>"]`.
  - Failing test: src/ui/boardland.test.ts, `{ forward:[{ collection:'sched.mutes', id:`${CURWEEK}#0`, before:[], after:['0|x'] }] }` → `expect(boardLandKeys(e,'undo',0).length).toBeGreaterThan(0)`. Today it is [].
 (c) A SANS availability card.
  - Steps: from the board's SANS availability panel, tap a card ("Edit this input"), change its time and save. Scroll away. Press Undo.
  - Shows: the card changes back out of view, and nothing moves.
  - Cause: the key `iu:<iid>` is pushed, but SANS cards are drawn by sansCardsHTML (html.ts) as `<button class="sanscard" data-inpedit="<iid>">`. `data-inpedit` is not in histbubble.ts CELL_SEL, so findHistCell and findInputCell both return null.
  - Fix: in bringBoardChangeOnScreen, for an `iu:` key, also try `root.querySelector('[data-inpedit="' + CSS.escape(iuParts(k).iid) + '"]')` after findInputCell.
  - Failing test: src/ui/boardland.test.ts with a jsdom DOM: `.sb-boardwrap` > scroller (overflow-y auto; scrollHeight / clientHeight stubbed) > `button.sanscard[data-inpedit="i42"]` whose rect is stubbed at top −400. Call `bringBoardChangeOnScreen(['iu:i42'])` and expect `scroller.scrollBy` to have been called. Today it is not called.

F3 — A refused Undo or Redo can still scroll the board to a box that did not change.
- Steps: rare. A board Undo of a step on another week loads that week (loadContext), which closes the board, and snapView reopens it through BOARD_WAS and schedules the landing. Then the restore is refused after the snap: timeline.ts globalUndo's `postConflict` re-check, or applyRestore's inside-the-reducer `again` refusal (deadRefusal / restoreRefusal re-asked after the week load).
- Shows: the refusal note, and the board scrolls to a box whose value never changed back.
- Cause: snap() runs before applyRestore (timeline.ts globalUndo/globalRedo). snapView's toBox schedules `setTimeout(() => bringBoardChangeOnScreen(keys), 0)` unconditionally. The old code only changed the day, and it does that here too (old behaviour). The scroll is the new part.
- Fix: in undo-wire.ts toBox, scroll only once the step has actually gone through: `setTimeout(() => { if (!!entry.undone === (dir === 'undo')) bringBoardChangeOnScreen(keys) }, 0)`. globalUndo sets `entry.undone = true` (and globalRedo sets it false) synchronously after a successful restore, before the timer fires.
- Failing test: a new test in src/state/undo-wire (or boardland.test.ts) using vi.useFakeTimers and vi.mock('../ui/boardland', …) with a spy. With SBDAY set and CURPAGE 'editsched', call `_snapView(entry, 'undo')` with a days-change entry whose `undone` stays false (a refused restore). Run the timers and `expect(spy).not.toHaveBeenCalled()`. Today it is called.

F4 (low, hardening) — The first cell found ends the search even when it is not laid out.
- bringBoardChangeOnScreen breaks on the first key with any matching element and then returns if `box.height` is 0. A key whose cell is in the DOM but hidden at that width (display:none in one layout) stops the search before a later fall-back key that is visible. jump lists carry fall-backs on purpose (placeJump: a list's `.x0`, then the row, then its name box).
- Fix: in the loop, accept an element only if `el.getBoundingClientRect().height > 0`, otherwise go on to the next key.
- Test: boardland.test.ts. Two cells for keys ['a','b']: 'a' with rect height 0, 'b' out of view with a real rect. Expect scrollBy to have been called. Today it is not.

F5 (low, hardening) — boardLandKeys does not check the week.
- It compares only the day number of `dayKeyOf` (`dk.split('#')[1]`), never the week part. A step carrying a `days` change of a week other than the one loaded would put that week's positional addresses onto the loaded week's board, landing on an unrelated box. I found no ordinary path that does this today: off-week steps ride `weekstash`, and loadContext loads the step's week.
- Fix: `if (dk.split('#')[0] !== CURWEEK) continue`.
- Test: boardland.test.ts, a step with id `'01/01/2001#0'` → `expect(...).toEqual([])`.

====================================================================
SCENARIOS I COULD NOT SETTLE BY READING — worth a walk step, not findings
====================================================================
- An accepted input on the Ground or Common Programme, its time retyped on that row (in view), with Personal Inputs lower down and out of view, then Undo. The changes window's own jump (changesjump.ts jumpOf) goes to the programme row `g:di.ri` first. boardLandKeys gives only `iu:<iid>`, which findInputCell matches on the Personal Inputs or Unavailable line, not the programme row. If the step's forward images carry no `days` change for the re-made row, the board would scroll away to the Personal Inputs line while the changed box is in view, against D672. If the re-made row is in the same command, the `days` keys come first and all is well. reqrow.ts says the row "is re-made from it" but not whether that happens inside the command. Settle it with one walk step. If it fails, push the `g:` keys of the row standing on day di (as jumpOf does) before `iu:`.
- Desktop with the changes window open. Over the board it opens just under the board's bar (D1106) and floats. A box above the screen brought down to "just under the bar" could land beneath that window if it opens over the board's column. Only windows on the screen's foot are counted. The e2e's window test at desktop size only brings a box up, never down.

====================================================================
AREAS WITH NOTHING FOUND
====================================================================
- Plurals: nothing found. I grepped every "${n} warning / advisory / note / issue" template in ui/, engine/ and state/. The only singular-only counts are the two already filed (html.ts's day ⓘ panel and insights-html.ts's tile). Insights' per-day "N issue(s)" is pluralised and reads the shown warnings (shownWarns), as the bar does. dayWarnHTML serves Edit Schedule, View-only Sched and the published look alike.
- The changes window's foot: nothing found. `anyGo` mirrors the render exactly. Item grouping draws a group's lines when `g.one` (byItem: entries.length === 1) or when the group is open. Who grouping draws a group when it is open and uses `whoEntry(l, !one, pick)`. Both use the same `may()` that decides button or `.still`. The empty list, "To go out" (day or week), "New to you" and the member's foot behave as the brief says. The slim phone bar has no foot. Every way in renders through this one component.
- Addresses against what the board draws: nothing wrong found beyond F2. Value changes use the canonicalDiff address (the same address the changes window jumps by). Adds use addKey: `wl:` matches data-wsel through keyOf, and `fr:`, `ap:`, `dn:`, `gr:`, `dr:` and `sr:` are data-bfld boxes. People units use placeJump with fall-backs. Inputs use data-inprow (Personal Inputs and Unavailable rows on the board), matched by iid. `ar:`, `at:` and `tr:` are never drawn on the board and correctly fall through to nothing.
- Timing and closed board: nothing found. The restore's notify is deferred only to the end of the command. React flushes a sync-lane render and its effects (the board's innerHTML paint is a useEffect) before a setTimeout(0) runs. If the board has closed, `.sb-boardwrap` is absent and the function returns. The timer holds nothing.
- Throwing: nothing found. canonicalUnits is guarded by try/catch, every DOM read is null-guarded, and the hidden `.chgwin` placeholder has height 0 and is skipped.
- What the changed path no longer runs: nothing lost. Both old branches (boardTab on a different day; setBoardDay after a week load) still run, and toBox is only added after them. The week path (bringDayIntoView) is untouched.
- A phone held sideways (D1780): read as right. The scroller is `.schedboard`, and `.sb-top` is sticky at −headH, so `bar.top ≤ 1` and the visible list begins at bar.bottom, which includes the "Not saved" and OIL bands (both inside .sb-top, SchedBoard.tsx).

====================================================================
TIDINESS NOTE (filed, not fixed)
====================================================================
- ChangesWindow.tsx `anyGo`: needed, but it restates the render's "which lines are drawn" rule in a second place (`g.one || isOpen` for Item, `isOpen` plus whoEntry for Who). If the two drift, the foot will lie again. Work out each group's drawn entries once and use that list in both the render and the foot.
- boardland.ts: placed sensibly beside onscreen.ts. But `scrollerOf` repeats pinchzoom.ts's scroller test (scrollChain) and onscreen.ts's page-top idea. Using pinchzoom's chain would also have avoided F1. The foot-window rule (`.chgwin, .availwin`, the 40px allowance, the "room above holds the box" test) hard-codes other windows' class names in this file. It would read better beside floatwin / barfree, which already know which windows stand on the foot. The window-less `scrollBy` fallback can never run, because the board locks the document, so it adds a branch to read for nothing.
- boardland.ts header comment: clear and in house style. It says "positions on the day AS IT WILL STAND once the step is applied", which is true and worth keeping.
- undo-wire.ts toBox: written clearly. The two stacked comments above it could be one.
- html.ts dayWarnHTML: the parenthetical added mid-sentence makes one very long comment line. A separate line would read more easily.
- boardland.test.ts: the last case ("no board drawn … throws nothing") passes trivially in jsdom and proves little. The brief's per-kind address question (duty, sim, ground, programme, notes, inputs) has a pure-half case only for a remark, a flying seat and an input. One case per kind would pin the addresses.
