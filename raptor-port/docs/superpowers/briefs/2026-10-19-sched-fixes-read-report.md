# Report: the fresh code read of the Schedule-and-amendments small-fixes batch (19 Oct 26)

**Reader:** a fresh Opus 5.5 reader that wrote none of this code. I read no walk report, no evidence sheet and no other
reader's report. **Read at:** `claude/schedule-amendments-fixes-fffce0` @ `a906c7d37` against `origin/main`
(`git diff origin/main...HEAD -- raptor-port/src`, 58 files, plus all 34 commit messages). **Rulings read:** D593 (the
archived row was not found, so I used its D594 restatement), D594, D503, D597 (full rows), `how-we-work.md`, and the
project guide's mutation and persistence funnels. **Nothing run:** I ran no build, no browser and no unit test. Each
claim below comes from reading the code, and the two browser behaviours it depends on are named so the walk can confirm
them.

Three findings: one high, one medium-low, one low. Four observations follow that are not findings under D489.

---

## F1 (HIGH, new on this branch). The "caret on its way" mark can get stuck and hold a redraw back indefinitely.

**The promise.** `[EDIT-SECOND-CLICK]`: while a click is carrying the caret from one box to another, the box it is
going to counts as the caret, so its block is left standing. That mark (`ARRIVING`) must only live while the press
lasts.

**How it can stay set** (`ui/textedit.ts`, lines 94–102):
- It is set on every `pointerdown` whose target sits in a text box that does not have the focus.
- It is cleared only in four cases: on `focusin`; on `pointerup`, after 0 ms for a mouse or 600 ms for a finger; on a
  `focusout` that names another box; or once the box leaves the page.
- **Nothing clears it on `pointercancel`.** A finger that lands on a text box and then scrolls or swipes is taken over by
  the browser as a pan. The page then gets `pointercancel` and never gets `pointerup` (the week has no `touch-action:
  none`; `ui/pan.ts`'s own comment describes the browser claiming such a touch). So `ARRIVING` stays pointing at that
  box.
- `routeFocusOut` keeps a stale mark when `relatedTarget` is null (`ARRIVING && rt == null ? ARRIVING : null`). Tapping
  "Done" on the keyboard, or calling `blur()` in code, does not clear it either.

**Why that holds a redraw back for good.**
- `textCaret()` returns `arriving()` whenever `document.activeElement` is the page itself. That is the normal state on a
  phone after a scroll. On an iPhone it stays that way even after tapping a button, because Safari does not move the
  focus to a tapped button.
- So `editingText()` stays true. Every redraw in `EditWeek.tsx` and `SchedBoard.tsx` is then deferred, with
  `pendingPaint` set.
- Those deferred redraws resume only on a `focusout` event (the two `resume` effects). When the mark is finally cleared
  by the 600 ms timer, by a disconnect, or never, nothing wakes them.
- `txtCommit`'s deferred backstop (`if (editingText()) return`) is skipped in the same way.

**Concrete failures** (owner's phone, an iPhone; Edit Schedule):
1. **The Scheduler Board opens blank.**
   - Setup: scroll the day with a finger that starts on any text box (a note, a time, a remark).
   - Action: tap the button that opens the Scheduler Board.
   - What goes wrong: `SchedBoard`'s effect sees `editingText()` true. The caret it finds is the week's box, which is
     not inside the board, so it returns before writing any panel. The day tabs, the board, the warnings and the
     sign-offs are all left empty. The 600 ms timer then clears the mark, but nothing redraws, so the board stays blank
     until some later change notifies.
   - Expected: the board draws the day.
2. **A swipe past Sunday leaves last week's days on screen.**
   - Setup: on Sunday, a horizontal swipe whose finger starts on a text box.
   - Action: `onWeekTouchEnd` calls `setWeekJump('mon')` and `loadWeek(next)`.
   - What goes wrong: EditWeek's effect returns early. `editingText()` is true, and the narrow branch bails on
     `WEEKJUMP != null`. Nothing is drawn: the new week's chrome sits over the old week's days.
   - Knock-on: the next swipe starts from the old, still-right-edge DOM and calls `loadWeek(next)` again, which skips a
     week.
3. **A change made right after such a scroll is not drawn in that box's block.**
   - Action: within the stuck state, place a person, take an Undo, or let a sync land.
   - What goes wrong: the narrow branch writes every block except the one holding the stale box. If the change is in
     that block, it stays drawn as before until another change.
   - Data is not affected: `routeFocusIn` refreshes a box from the model before it can be typed in, so no stale text is
     written back. I checked this for the "wrong blur" question in the brief.

**What disproves this.** On an iPhone: start a drag on a text box, scroll, lift, then open the board. If it draws the
day at once, I am wrong about the event order. A unit test can pin the core either way: dispatch `pointerdown` on a
`[data-txt]` box, then `pointercancel`, and expect `editingText()` to be false. Today it is true.

**New or old.** New. On `main`, `editingText()` read only `document.activeElement`. The mark came in `b0d274271`,
`5c48ee2ea` and `285f3ac3b`.

**Exact fix:**
1. In `textedit.ts`, add
   `document.addEventListener('pointercancel', () => { if (ARRIVING && document.activeElement !== ARRIVING) dropArriving() }, true)`.
   A touch that became a scroll never takes the caret.
2. Track that a press is down: set `PRESSING = true` in the `pointerdown` listener, and clear it in `pointerup` and
   `pointercancel`. In `routeFocusOut`, keep `ARRIVING` on a null `relatedTarget` only while `PRESSING` is true;
   otherwise set it to null.
3. Make `dropArriving()` the one place that clears the mark without the focus arriving: the 600 ms / 0 ms timer, the
   cancel, and the `arriving()` disconnect branch all go through it. It sets `ARRIVING = null` and then calls `notify()`
   (already imported), so the redraw it held back is done now. A no-op notify is cheap; the dense surfaces string-diff.
4. Tests:
   - `pointerdown` then `pointercancel` gives `editingText() === false`.
   - `pointerdown` then a touch `pointerup`, with fake timers advanced 600 ms: a redraw deferred in between has run.
     Assert on the week's DOM.
   - Board: with a stale mark set on a week box, opening the board still draws its panels.
5. Walk on the iPhone: scroll from a box and then open the board; swipe from a box across Sunday.

---

## F2 (MEDIUM-LOW, new). Clear an In-time line, then press another line's grip: the drag can pick up the wrong line.

**Setup.** Scheduler Board, a wave with four In-time / Rally lines `[A, B, C, D]`. The caret is in A and its text has
been deleted, meaning to remove the line.

**Action.** Press C's grip (six dots) and drag C to the top.

**What goes wrong.** In `ui/rowdrag.ts` `onDown`, the row address is read **before** the blur:
`at = 'mv:it.di.gi.2'`. Then:
- `typing.blur()` runs `routeFocusOut`. The emptied line is removed (`w.intimes = [B, C, D]`), its row is removed, and
  the surviving rows are re-addressed in place, so C's row becomes `…gi.1`.
- `flushSync(() => notify())` redraws the board panel (`SchedBoard` `put` → `innerHTML`). The grip is no longer in the
  page.
- The re-find runs `el.querySelector('[data-move="mv:it.di.gi.2"]')`, which is now **D**. D is lifted and moved instead
  of C.
- With three lines, the address no longer exists and the press does nothing.
- If the line emptied is the very line whose grip is pressed, its row is gone and the re-find picks up the line below
  it.
- On a published day the wrong move becomes a pending change: "order changed" in "To go out".

**Expected.** C is lifted, or nothing if C itself is gone.

**What disproves this.** A jsdom test: board HTML with four lines, empty line 0 while it has the focus, press the grip of
`mv:it.0.0.2`, drop it on row 0. Today the model should read `[D, B, C]` (D moved); correct is `[C, B, D]`. Simpler:
assert which row carries `rowdrag` after the press.

**New or old.** New. The In-time grip and the blur-first block came in `0df4b36a3` and `4d0c9e807`.

**Exact fix** (`rowdrag.ts`, in the `typing` block):
1. Call `typing.blur()` first.
2. Then `if (!grip.isConnected) return`. The blur's own save took the pressed row away, so there is nothing to lift.
3. Only then read `at` / `atSec` from `grip.closest('[data-move]')` / `[data-secmove]`. `routeFocusOut` has already
   re-addressed the surviving rows to the model's new indices.
4. Then `flushSync(() => notify())` and the existing re-find.

Add the test above, red first.

---

## F3 (LOW, new). The desktop week snaps to a day when no window was resized.

**Setup.** Desktop (wider than 820px), Edit Schedule, the week panned freely so a day sits partly off screen. The
desktop week deliberately does not snap; a free pan stays where it is put.

**Action.** Anything that shows or hides the failed-save band or the "Not swapped — OIL not answered" bar. `Shell.tsx`
then fires a synthetic `resize` (with `saveBand: true`) so measured headers re-measure.

**What goes wrong.** The new `onResize` in `ui/pan.ts` debounces 120 ms and calls `relandWeekAfterResize()`. That jumps
the week up to half a day (`hsSet`) to the nearest day, in the middle of the scheduler's work, and resets the arrows'
corridor. Shell's own comment says these events are meant for "a listener that only re-measures". This listener moves
the view.

**Expected.** The week moves only when the window's width really changed.

**New or old.** New (`d401fbc02`).

**Exact fix:**
1. Change to `function onResize(e?: Event) { updateWeekNav(); syncPeekOnResize(); if ((e as any)?.saveBand) return; …schedule the re-land… }`.
2. More robust: keep `lastW = window.innerWidth`, and in `relandWeekAfterResize` return when `window.innerWidth ===
   lastW`; update `lastW` after landing.
3. Test: dispatch `Object.assign(new Event('resize'), { saveBand: true })` with a week mid-day, advance 120 ms, and
   expect `scrollLeft` unchanged.

---

## Observations (not findings under D489, or not regressions)

- **O1. The grip's redraw is not checked for a window.** It does not check `windowOverSchedule()`.
  - If the blur's save opens a window (W12: a weekend duty request's time opens the OIL question), the drag carries on
    and drops a row under the open window.
  - The Tab route stops in the same situation. Suggest `if (windowOverSchedule()) return` after the `flushSync` in
    `rowdrag.ts`. The harm is small: the row moves by its own address, and the question is about the request, not the
    row.
- **O2. Two unnamed lines that clash read oddly.** Two *different* flying lines with no name, sharing a man at the same
  time, now read "this line & this line clash" (`validate.ts`, DOUBLE_BOOK). That is correct but odd. "Two unnamed lines
  clash" would read better; this is a wording choice, not a defect.
- **O3. A button whose label changes with the save is not found again.** `schedule-tab.ts` finds the button again after
  the redraw by its marks **and** its words. A control whose words change with the save itself (a count, for example)
  is not found, so the focus is left on the page. That is no worse than `main`, where the focus was lost in this case
  anyway, so it is not a regression.
- **O4. The scroll speed beyond the pane is unchanged in kind.** `rowEdge` makes the in-band ramp steeper on a short
  pane. Beyond the pane edge the speed is still unclamped, as it was before; this is not a defect.

## Checked and found nothing

- **The In-time reorder goes through the funnel and is saved.**
  - `moveInTime` writes the list and calls `markEdit('it:di.gi', before, after)`. The drop then runs
    `afterSchedMutate()`, which wraps the write in a `sched.mutate` command, the same path every other row move takes.
    The epilogue's `reconcileIssuedMarks` clears the mark when a drag puts the issued order back.
  - `dayKeys` (restore.ts) holds `it:` as the JSON list. `dayDelta` reads the new order as pending, the published face
    keeps the issued order, and dragging back nets to nothing.
  - The four sign-offs come down for a reorder: `currentBind` digests the whole day.
- **The sorts.**
  - `sortInTimes` runs from the wave's ⇅ (both sorters run, no short-circuit) and from Sort all, under `HIST.lock` with
    one history line.
  - There is no other caller of `sortWave` or `sortDay`, so no Auto sort is missing it.
  - `reportingSortKeys` maps one-to-one with `w.intimes` (`parseReportingLines` keeps every index), and `keySort` sinks
    null keys in model order.
- **Where the drag exists.**
  - The week draws no grip (D594); a member, or a version being viewed (`mvRO`), gets no grip.
  - `applyMove` and `rowdrag`'s `sameContainer` agree that an In-time line never crosses a wave or a day.
  - The phone board shows the grip (`.sb-grip` keeps `touch-action:none`).
- **The new history lines.** + SC/AVALON/BB, + Block and the document count on a filed request follow the exact pattern
  of the neighbouring `logAction` + `afterSchedMutate` sites, or are written inside the command's change stream
  (`changelines.ts`).
- **A box typed on the Scheduler Board.** The text is written before the command, as the week's `commitText` does. The
  command records it, and the epilogue after it finds nothing left to record.
- **The discard count.** `dayDiscardCount`'s "re-lands" test reads the same `after` day the units use. Request rows land
  only in `ground`, so checking ground and the programme is complete. `inputsLeftSaid` counts the requests that stay
  after the load, by construction.
- **The landing flash.** `applyMove` resets `LANDED_KEY` before every move, so a sorter's stale value is never read.
  `moveGroundRow` hands `done` the frozen index, so the flash lands on the row that moved.
- **The "Breaks <day>" focus.** It carries `listDi`, set alongside `panDi`, and `toggleDayWarn` drops the focus for the
  list it was set from.
- **The Tab route's new redraw before a button.** The checks after the redraw (`windowOverSchedule`, `sameScope`, the
  active element) are the same as at the last box. The board's containers are never replaced. `routeKeyDown` is a native
  listener, so `flushSync` is not nested in a React render. Nothing new is written by it.
- **The warning sentences.**
  - `noWin` and `rowName` are in scope at the SANS check.
  - `scShiftKind` handles NaN times.
  - `shiftReport` is reached only when a shift leg exists.
  - The avail.ts standby flag reads `noconf`, which only AVALON and BB carry.
- **Undo's words.** The "an in-time" word for an SC line's B box reads the live day, and falls back to "a brief time"
  only if the line is gone. "Swapping X for Y" and "an OIL answer" are read from the entry's own one change.
- **Undo past a publish and `[CRP-FLAG]`.** Tests only on this branch; no code changed.

Rulings: none this session (a read-only reader).
