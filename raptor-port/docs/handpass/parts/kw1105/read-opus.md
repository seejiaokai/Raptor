# The keys and windows batch — a fresh, blind Opus read (5 Nov 26)

Read: `git diff d7f63b6a8..HEAD -- raptor-port/src raptor-port/e2e` (the non-test source in full, the tests by name), the
roll-call (§2 of `docs/handpass/2026-11-05-keys-windows.md`), and the code around it: `sheetfocus.ts` whole, `schedule-tab.ts`
(the route's head), `board.ts` (`popMenu`, `rolePickMenu`, `boardTab`, `boardWeekStep`, the board's click route), `SchedBoard.tsx`
(the panel paint effect), `interactions.ts` (`openStoresMenu`, `routeOpenKey`, `routeMenuKey`), `Modals.tsx` (DayPop, AirPop),
`WeekCal.tsx`, `DocViewer.tsx`, `pops.ts`, `view.ts` (`setPage`, `resetViewState`, `setBoardDay`), `Shell.tsx` (the bar),
`FloatWindow.tsx` and `InputWindow.tsx` (their Escape), `MedicalView.tsx` (the viewer's rows), `leavewar/sync.ts` (its openers),
`engine/reporting.ts` (`reportingIssuesForWave`), `inputedit.tsx` (`commitInputEdit`'s guard).

## Findings

### F1 — MEDIUM — a duty role picked from its list: the role box keeps showing the old words, with the caret in it

**What he does.** On the Scheduler Board, in a duty row, he presses the ROLE box (its pick-list opens beside it), then picks
"SDO" — by the mouse on his PC (Chrome/Edge), or by the keys (↓ into the list, Enter), which D1646 has just made possible.
**What he sees.** The caret goes back into the role box, and the box still shows what it held before the pick (empty, or
the "S" he had started typing) — the pick looks as if it did nothing. The schedule has "SDO" (the week behind shows it); the
box shows it only once the caret leaves. If he acts on what he sees — clears the box with Backspace, or types the role again
a different way — that typing is saved over the pick when he leaves the box.

**Cause.** `board.ts popMenu`, the new close passed to `onPick`:
`const had = box.contains(document.activeElement); box.remove(); if (had) { keysBack(back); setTimeout(() => keysBack(back), 0) }`.
1. `had` is true for a MOUSE pick in Chromium too: Chromium gives a `<button>` the focus on mousedown (the stores menu's own
   comment, `interactions.ts` near "focus on mousedown in Chromium", says so), so the menu's item holds the keys when its click
   runs. The comment above it ("A pick made by a press of the mouse moves nothing, as before") holds only for Safari and phones.
2. `rolePickMenu`'s pick runs `txtSet(…); afterSchedMutate(); notify(); close()`. `notify()` only schedules React's repaint
   (`useSyncExternalStore` → a sync-lane render flushed in a microtask — the click is a native listener, not React's), so
   `close()` runs first, and the SYNCHRONOUS `keysBack(back)` focuses the role box that is still on the page — the old one.
3. The repaint then runs with the caret in that box: `SchedBoard.tsx`'s paint effect withholds the panel that holds the caret
   (`put`: `if (caret && el.contains(caret)) { delete panelPrev.current[key]; return }`) — so the box is not redrawn and keeps
   the old words until the caret leaves. Before this batch the keys went nowhere after a pick, and the repaint wrote "SDO".

**Fix.**
1. In `popMenu`'s close, drop the synchronous `keysBack(back)`; keep only the deferred one:
   `if (had) setTimeout(() => keysBack(back), 0)`. By then the repaint has run with the caret out of the box, the role box is a
   new one showing "SDO", and `locate` finds it by its `data-bfld`. The picks that open a window lose nothing: each already
   calls `noteOpener(anchor)` before it opens the window, and `useSheetFocus` gives the keys back through that note; the
   deferred `keysBack` still stands aside when the window has taken the keys.
2. Correct the comment above it: a mouse pick in Chromium also returns the keys to the menu's button (harmless for a button —
   no ring after a mouse press — which is why only the text-box anchor shows it).
3. Test, red first: in `boardmenukeys.test.tsx`, focus a menu item before dispatching its click (as Chromium's mousedown does),
   pick a role, and assert after the repaint that the focused role box's value is the picked role. A browser step in
   `e2e/keys-windows.spec.ts`: a real mouse pick on the role list, then read the role box's value with the caret still in it.

### F2 — MEDIUM — Enter on a board day chip leaves the Traffic window (or day details, or an open board menu) over the new day

**What he does.** On the Scheduler Board (desktop), Wednesday open: he presses a wave's Traffic button by the keys (Enter) —
the Traffic window opens and, as it holds no keys, they stay on the board. He Shift+Tabs back to the day chips (now Tab stops,
D1646) and presses Enter on "Thu". **What he sees.** The board moves to Thursday; the Traffic window stays open over it, still
Wednesday's wave ("Traffic · WAVE 2" — no day in its title). A line typed there is written to Wednesday's wave, which nobody is
looking at — the very thing the Traffic window's own comment says a bar control must prevent ("a window left over a page it does
not belong to would edit a wave nobody is looking at"). The same with the day-details window (it goes on showing Wednesday over
Thursday's board) and, on browsers where a press of the mouse does not move the keys (Safari, Firefox on a Mac), with a board menu
opened by the mouse (+ Block for Wednesday stays up over Thursday; its "Empty block" adds to Wednesday).

**Cause.** `SchedBoard.tsx`, the strip's new `onKeyDown`: Enter/Space call `boardTab(n)` / `boardWeekStep(d)` directly. A press of
the mouse on the same chip is a `click`, and two document click listeners do the closing: `barfree.ts useBarFree`'s capture
listener (any bar control other than Undo/Redo closes the window first — D1645) and `popMenu`'s outside-click `off`. A key press
sends no click, so neither runs. `boardTab` itself closes only the stores box (`.stmenu`), and `setBoardDay` closes nothing; a
week chip's `loadWeek` closes Traffic and day details (the 'week' resets) but not a board menu.
**Fix.**
1. In the strip's `onKeyDown`, after `e.preventDefault()` and setting `chipKeys.current`, call `t.click()` instead of
   `boardTab`/`boardWeekStep`. The synthetic click goes down through the document's capture phase (the bar-free windows close
   first), through the strip's own `onClick` (which steps the day or week, as now), and up to the document (any open board menu
   closes). `chipKeys` still puts the keys back on the chip after the redraw.
2. Test: in `barfree.test.tsx` (or `boardmenukeys.test.tsx`), open Traffic over the board, dispatch Enter on another day's chip,
   and assert `AIRKEY` is null and `SBDAY` changed; the same with `DAYPOP`; and with a `.wavemenu` up, assert it is gone.
3. The `barfree.ts` header ("a day chip — first closes the window") is then true for the keys as well.

### F3 — LOW — Tab inside an open board menu takes the keys out of sight

**What he does.** On the board he presses Enter on + Block (D1646: the keys land on "Empty block"), then Tab. **What happens.**
The menu stays up; the keys go past the end of the page (the menu is added at the page's end) into the browser's own bar; the
next Tab brings them to the first control of the top bar, which lies hidden under the board — an Enter there presses a control
he cannot see (the ☰ menu, or a page name). The third Tab brings them back to the board.
**Cause.** `boardescape.ts keepTabOnBoard` stands aside when the keys are in `.wavemenu` (`LAYERS`), and the menu itself has no
Tab handling (`sheetfocus.ts menuKeys` takes only ↑ and ↓). Before D1646 the keys never entered these menus.
**Fix.** In `menuKeys`, on Tab (no Ctrl/Alt/⌘): close the menu the way Escape does (the entry `menuEscape` registers — call its
close: unhook `_offClick`, `box.remove()`, `keysBack(back)`), do NOT preventDefault, and let the same Tab continue from the menu's
button — or, simpler, preventDefault, close, put the keys on the anchor and leave the next Tab to the board. Test in
`boardmenukeys.test.tsx`: open by Enter, press Tab, assert the menu is gone and the keys are on the board.

### F4 — LOW — after a window over the week closes, the keys can land on another day's copy of the control that opened it

**What he does.** On Edit Schedule (desktop), an input that covers several days (a Mon–Fri leave, a Sat–Sun weekend duty) is
drawn on each of those days with the same name button. He presses the name on Thursday's copy, changes the input in its window
and saves. **What happens.** The save redraws the days; the window gives the keys back — to Monday's copy of the name button
(the first one on the page), which may be scrolled out of the week's carousel (the focus is moved without scrolling). An Enter
then reopens the window from a place he cannot see, and Tab walks Monday's controls, not Thursday's. Before this batch the keys
went to nothing in this case. No data is affected (every copy is the same input).
**Cause.** `sheetfocus.ts useSheetFocus` now gives the keys back through `locate(before)`, and `locate` looks for a replaced control
by its tag and FIRST data attribute across the whole document (`within` is the board for a board control, else `document`):
`button[data-inpedit="<id>"]` matches every day the input covers, and `all.find(n => n.getClientRects().length > 0)` takes the
first laid-out one — an off-screen day of the carousel counts as laid out. The same applies to `noteOpener` (the OIL route) and
`useBarFree`/`useEscWindow`'s openers for any control drawn on several days with the same mark (an input's `[data-inp]` cells).
**Fix.** In `locate`, remember the week day the control stood in and search only there: at locate time
`const day = el.closest('#eWeek > .day[data-day]')?.getAttribute('data-day')`; in the finder, when `!el.isConnected` and `day != null`,
query inside `document.querySelector('#eWeek > .day[data-day="' + day + '"]')` (looked up afresh — the redraw may have replaced the
day itself) and fall back to null when it is gone. Test: a unit test drawing the same `data-inpedit` button on two days, the
second focused, replaced, and the keys asserted on the second day's twin.

### F5 — LOW — the Medical page's viewer of several documents keeps a page of an input an Undo took away

**What he does.** Inputs → Medical: a man has two overlapping medical entries, each with a document; he taps the card (the viewer
opens on "1 of 2"), then presses Undo on the bar (D1645 allows it) and the undo takes away the SECOND entry (the one he added last).
**What he sees.** The viewer still pages to "2 of 2", the removed entry's page, with "Edit input" on it; pressing it opens the input
window, whose save is refused ("That input is no longer there — nothing was saved").
**Cause.** `DocViewer.tsx`: `gone` closes the viewer only when `v.row` (the entry tapped) is gone; each of `v.rows` is re-read by
`live`, which falls back to the stale record (`inpById(row.iid) || row`) when the input is gone.
**Fix.** For a non-read-only viewer, drop the rows whose input is gone: in the `v.rows` branch, `v.rows.filter(e => !(e.row && e.row.iid != null && !inpById(e.row.iid)))`
before the `map`, and make `gone` true when that list is empty (or when `v.row` is gone, as now). Test in `inputs-readers.test.ts`
beside the single-row case.

## Questions (no concrete failure found)

1. **`popMenu`'s timing.** F1's cause rests on React flushing the repaint in a microtask after a native click listener. If any
   pick runs its write inside React's own event (synchronous flush), the old role box is already gone and the synchronous
   `keysBack` finds the new one — then F1 does not appear on that path. The deferred-only fix is right either way.
2. **`barCovered` runs only when the bar-free window itself repaints, resizes, or its bar changes height.** A veil that comes or
   goes without a `notify()` (one drawn straight into the page) would leave the window's veil in the wrong state until the next
   repaint. I found no such veil among the windows that can sit over these four today.
3. **A repaint while a bar-free window is up** now builds a new `ResizeObserver` and asks the browser where the Undo button is
   (`elementFromPoint`, a forced layout) on every store tick. Cheap for one small window, but on the board a typing burst ticks
   often; worth a look under the speed rule (D991) if a slow-machine report ever names it.
4. **A noted opener left behind.** `schedule-tab.ts` now calls `noteOpener(source)` whenever a window is over the schedule after
   the blur's save. I checked every window that save can raise (the OIL question, the medical move's two questions, the document
   and upchit questions, the input window): each takes the note through `useSheetFocus`, so none is left to send the keys to an
   old box later. A future window raised by a save that does not use `useSheetFocus` would leave it standing.

## Roll-call gaps

1. **The viewer opened from the Inputs CALENDAR's day list** (`InputsCal.tsx`, the day panel's cards — `onDoc`) has no row; the
   table has the Medical card, the Inputs list's paperclip and the two input windows only.
2. **A board menu whose button is a TEXT BOX** (the duty role list): the row "A pick by the keys → keys back on the button" was
   walked for + Block only; the role list's pick, by the keys or by the mouse on Chromium, was not — F1.
3. **D1645 "any other bar control closes it first", pressed by the keys through a route that sends no click** — the board's day and
   week chips (D1646's own new route) — no row; F2. The row "Jump to a date · the board — has it (a day chip…)" was seen with a
   press of the mouse.
4. **Tab inside an open board menu** — no row in the D1646 table (only ↑ ↓, Escape and the pick); F3.
5. **A control drawn on several days with the same mark** (a multi-day input's name button or cells) as the place the keys go back
   to — the "keys back after a question" table names only "its twin, found by its marks"; F4.
6. **The viewer of several documents across an Undo** (Medical, `rows`) — the row says "remarks changed then undone" for one entry;
   an Undo taking away one of several entries is not listed; F5.

## The tidiness note (changed lines only)

1. **Duplicated.** The opener is recorded three times over for "Jump to a date" (`WeekCal.tsx` `openerRef`, `useEscWindow`'s `back`,
   `useBarFree`'s `opener`), and twice for the Traffic and day-details windows — each gives the keys back by its own rule;
   `useBarFree`'s keys-back could live in `useEscWindow` (both are on every bar-free window but the viewer). `DocViewer.tsx`'s `gone`
   effect repeats `close`'s body; `DayPop` writes its close lambda twice. `boardescape.ts STOPS` is a second copy of
   `sheetfocus.ts STOPS` with contenteditable added.
2. **No longer does anything.** Nothing dead found in the changed lines.
3. **Comments that claim what the code does not do.** `board.ts popMenu`: "A pick made by a press of the mouse moves nothing, as
   before" — false in Chromium (F1). `barfree.ts` header and `SchedBoard.tsx`'s strip comment ("Enter or Space here presses the
   one the keys are on, as a click does") — the key press skips the document's click listeners (F2). `pops.ts DOCVIEW_NAV`: "an input
   is no week's" is a reason, fine; no other.

## Not read

The tests' bodies beyond `oilkeysback.test.tsx` (the others by name and diff size only); `e2e/keys-windows.spec.ts` beyond its
diff summary; the walk scripts and their pictures; the Leave War's sheets in `src/leavewar/ui/` (only their openers of the viewer);
`DateCal.tsx` beyond its Escape listener; `outside.ts`; the CSS beyond the diff.
