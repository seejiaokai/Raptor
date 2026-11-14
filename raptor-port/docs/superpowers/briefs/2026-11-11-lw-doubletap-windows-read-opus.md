Opus read, job 4 — the Leave War's double-tap guard on its other windows (`git diff 24a75372d 245dd9a4e`). Read only. Nothing changed, built or run. No handoff block appeared in my chat.

**What changed.** In `raptor-port/src/leavewar/ui/Matrix.tsx`:
- Lines 1587–1596: the on/off flag became a set of bits (`winsUp`). Any bit that drops calls `guardGrid(true)`.
- Line 1563: a press inside `.evpeek` now counts as a press inside a window.

`guardGrid` itself is unchanged: it swallows only a pointer `click` whose target is inside `.mx` (the grid's tables) and not `.mstripe`, within 32px and 600ms.

**Findings**

**F1 — Not every window over the grid arms the guard, though the comment says "every other window over the grid".**
- Main is the same, so the change makes nothing worse. It just doesn't keep the word "every". Severity: low to medium.
- The concrete failure: an admin on a phone opens the under-manned list from its chip and double-taps a row.
  - First tap: `focusDay(date)` scrolls the grid, and `setListOpen(false)` closes the list (`Chrome.tsx:517`).
  - Second tap (within about 440ms): lands on whatever day cell is now under the finger, and that day's window opens.
  - Expected: nothing opens.
- The cause: none of these windows is in `winsUp` (their state lives outside `Matrix`), and their insides are not `.bidsheet` / `.evpeek`:
  - the under-manned list `.umlist` (`Chrome.tsx:499–520`);
  - the day panel, a FloatWin `.lwday`: its ✕ and ‹ › (`DayPanel.tsx:69–73`);
  - FlyRows' windows: FlyEditor's number pad `.flypad`, ReqPanel, ReqNameForm (`FlyRows.tsx:357–367`). ReqPanel and ReqNameForm are `.bidsheet`, so the press counts, but no bit drops.
  - the move banners' Confirm and Cancel, `.mv-banner` (`Matrix.tsx:4404–4440`): `moveSel` / `eventMoveSel` are not bits. A double tap on Confirm can land a second tap on the day under it.
- Safe omissions:
  - Legend: it closes only by its own scrim.
  - Open for bidding: a full page. New period: a raised modal sheet in Chrome, and neither sits over a grid reachable under its buttons in the way the eight do. Confirm by walk.
  - Grades, Balances, Approvals (page mode), My leave: the grid card is hidden behind them.
  - The document viewer, `.airpop`: it sits over a sheet.
  - The quals pop-up: `pointer-events: none`.
- Fix:
  1. Add `src/leavewar/ui/gridguard.ts`: `let arm: (() => void) | null = null; export const setGridGuardArm = (f) => { arm = f }; export const armGridGuard = () => arm?.()`.
  2. In `Matrix`, `useEffect(() => { setGridGuardArm(() => guardGrid(true)); return () => setGridGuardArm(null) }, [])`.
  3. Call `armGridGuard()` after `setListOpen(false)` on the row click (`Chrome.tsx:517`), in DayPanel's `closeDayPanel` path, in FlyEditor's done/close, in ReqPanel's and ReqNameForm's `onClose`, and after `commitMove(...)` / `commitEventMove(...)` and the two Cancel handlers.
  4. Widen line 1563's selector to `'.bidsheet, .evpeek, .umlist, .lwday, .flypad, .mv-banner'`, so those presses count as inside a window.
- Tests to add in `doubletap-windows.test.tsx`, one each, in the existing `tap` + `second` shape:
  - the under-manned row;
  - the day panel's ✕;
  - the move banner's Cancel;
  - the event move's Confirm. For this one, assert that the second tap leaves the grid unchanged and opens no window.

**F2 — A press inside the event box that becomes a swipe now arms the guard, though no tap closed anything.** This is new; main does not.
- The failure: phone, any role.
  1. Tap an event chip; the event box opens.
  2. Put a finger on the box and swipe the page.
     - The `pointerdown` is inside `.evpeek`, so it counts as inside a window (line 1563).
     - The page's scroll closes the box through its window-level scroll listener (`Matrix.tsx:1842, 1858`). Bit 256 drops, so the guard is armed at the swipe's start point.
  3. Within 600ms, tap the day (or another event) that was under the box.
  4. The tap is eaten; it should open.
- The same shape applies to any bit dropping from something other than a press, while the last press, however old, was inside a window. `lastPressRef` has no time, and only a key clears it. Examples: the period change (`Matrix.tsx:640`), the role effect (`Matrix.tsx:583`), the event box closing on a resize. The guard is then armed at a stale place.
- Fix:
  1. In the `down` listener, store `t: e.timeStamp` in `lastPressRef`.
  2. Add `const cancel = () => { lastPressRef.current = null }`, registered as `document.addEventListener('pointercancel', cancel, true)` and removed in the cleanup. A touch the browser takes over for a scroll or pinch fires `pointercancel`.
  3. In `guardGrid`, when `second`, return unless `from && performance.now() - from.t < 1000`. The close render follows its press within one frame; 1000 is slack for a slow phone.
- Test (unit): open the event box. Dispatch a touch `pointerdown` inside `event-peek`, then `pointercancel`, then `act(() => window.dispatchEvent(new Event('scroll')))`. Assert the box is gone. Then `tap(CELL)` and expect the picker to be there.

**F3 — The bits read the raw state, not "drawn on screen".** Low; this is the answer to Q4.
- Some bits can be up while nothing is drawn:
  - `who` while `whoPerson` is missing (line 4492);
  - `oilTracker` for a man who has gone (line 4568);
  - `settings`, `eventEdit`, `counterEdit`, `eventsOpen` for someone who is not an admin. `askLw({kind:'settings'})` at line 339 sets `settings` for any role.
- No harm found: such a bit mostly never drops, or drops by a press outside any window. When it does drop, F2's time check covers the rest.
- Fix if wanted: compute each bit from the same condition as its render, for example `(who && whoPerson ? 2 : 0)` and `(settings && role === 'admin' ? 4 : 0)`.
- Test: `setRole('member')`, `askLw({kind:'settings'})`, then `tap(CELL)` opens.

**The nine questions**

1. **Windows over the grid.** All eight named windows arm the guard. The one-day window's family (BidPicker, RemarksSheet, RaptorSheet, AwardSheet, ClosedNoteSheet, PostOutSheet, PostInSheet, DayList) is still covered by `open`. The omissions and why each is or is not safe are in F1.
2. **Ways each window closes.**
   - ✕, Save, Cancel, Delete, own actions and hand-overs all arm the guard, at the press that did it.
   - A tap outside (the grid, or the scrim on a mouse) leaves an outside press, so the guard returns at line 1541 (N1 kept).
   - Escape and other keys clear the last press: the keydown capture listener is registered at mount, before any sheet's.
   - Undo or the bell on the top bar is an outside press, so nothing is armed.
   - A failed save keeps the window up, so no bit drops.
   - Leaving the Leave War page: the swallow only touches `.mx`, and it is cleared on unmount (line 1572).
   - Armed with no tap: see F2.
3. **False swallows.**
   - The swallow touches only a pointer click inside `.mx` and not `.mstripe` (line 1543). Every window is portalled or drawn outside the `<table class="mx">`, so a tap on a window that opened in the old one's place is never eaten. I checked the person window, the OIL tracker, the event window, the Events list, the counter form and Settings (all portalled, lines 4492–4659), and the Manning sheet (drawn after the table).
   - On a phone, a modal hand-over's second tap on the grid is still dismissed by the new sheet's own shield (`Sheet.tsx:141–143`, registered in a layout effect before Matrix's passive effect). That is unchanged from main.
   - Not eaten: the top bar (not `.mx`); a scroll or pinch (no click); a mouse single click (`detail` 1 passes); a quick tap elsewhere (over 32px).
   - A pen counts as a finger, as before.
   - The guard can't outlive 600ms: each arm clears the last one first (line 1538).
   - Two bits dropping in one render make one call.
   - Apart from F2, I found no other way an ordinary press is eaten.
4. **The bits.** See F3. A window opened and closed in one render arms nothing. When two windows swap in one render, the guard is armed, but it cannot eat a tap on the new window (Q3).
   - The event box against the event window: Edit drops 256 and raises 8. A second tap over the grid is dismissed by the event window's shield on a phone, the same as main. The e2e test tolerates this.
5. **The event box change.** A press inside the box can't be swallowed: it is not `.mx`. What is new: a press that started inside the box now arms the guard when the box goes, including by a swipe or scroll (F2). Nothing that got through before is now eaten, except F2's case.
6. **Roles and sizes.** Members, guests and view-only people can open only the person window, the Manning sheet, the OIL tracker and the event box (no Edit for them). I found nothing role-specific apart from F3. On a desktop, a mouse single click passes. On a touch laptop, touch counts as a finger, as on main.
7. **The tests.** None of the red tests is hollow. Each fails on main, because a drop of a bit other than 1 armed nothing there. I checked that Rearrange mode still lets a name open the person window (`MatrixRows.tsx:165–169`), so that test is real. The "still gets through" tests (Escape, after the time, a tap elsewhere, the box closed by a grid tap, a mouse single click) pass on main by design.
   - Missing:
     - a unit hand-over with the second tap on the NEW window: Settings to counter form, Manning to counter form, Settings to Events list, the box's Edit to the event window;
     - a press on the top bar right after a close;
     - two windows, one staying open (person window plus Manning sheet);
     - a pen;
     - a `pointerdown` with no click (scroll) right after a close;
     - a hand-over into a move (the event window's Move… and Rearrange) followed by a deliberate landing tap more than 32px away;
     - F1's and F2's cases.
8. **The first guard.** Unchanged. The one-day and drag windows are still one bit (`open || sel`), so a hand-over between them arms nothing, as before. Adding `.evpeek` to the inside-a-window test can't affect them: the box closes on any press outside it, so it never shares the screen with them in a way that matters.
9. **Tidiness, filed not fixed.**
   - The new 12-line comment (lines 1578–1587) repeats `guardGrid`'s own and the comment at line 1540; one line pointing to the backlog item would do.
   - `winsUp`'s magic bit numbers would read better as a named list or a string key, for example `[open||sel, who, settings, …].map(Boolean)`.
   - The name `winUpRef` is now a mask, not a flag.

**Older, in passing:** a double tap on the event box's Edit on a phone opens the event window, and the second tap then closes it through the sheet's shield. Main does the same, and the e2e test tolerates it.

**Verdict:** the change keeps its narrow promise for the eight windows and adds no false swallow, except one new edge case (F2: a swipe begun on the event box). "Every window over the grid" is not yet true (F1, main the same). Fit to go after F2's small fix, with F1 filed.
