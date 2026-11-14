# Job 4 — the fix round: the builder's brief (chat 64, 11 Nov 26)

You built `[LW-DOUBLETAP-OTHER-WINDOWS]` on branch `claude/lw-doubletap-windows` (commits `f5a0c99f7`, `245dd9a4e`) in
`C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`. The walk and the two blind code
reads are in. This is the one fix round. Same rules as your build brief: tests first (each new test RED on the code as
it stands, shown red, then green); commit with the item's tag; never push; never touch `HANDOFF.md`, `OUTSTANDING.md`,
the hooks, settings, skills or guides; write nothing under `raptor-port/docs/` except `file-map.md` if a file is added;
delete nothing that is not yours; scripts in files (Write tool), `cd` by the full path, a check's exit read from its
own `X=$?`, never through a pipe. Stop by 10:15 by the clock (`date`) at the latest — hand back what is done, and say
what is not.

## F1 — the event box closed WITHOUT a tap arms the guard with an old press (Astra's finding 1, P2, new in this change)
The case: an admin on a touch screen with a keyboard taps an event (the event box opens), taps the event's name inside
the box (it stays open), presses Escape; within 600 ms he taps a day within 32px of that earlier tap — the tap is
swallowed, and it should open the day. The same without a keyboard: after a press inside the box, a scroll, a resize or
a pinch's start closes the box, and the next tap near the old press is swallowed — the old press has no age limit.
Cause (`raptor-port/src/leavewar/ui/Matrix.tsx`): the press listener now counts `.evpeek` as inside a window (~1563)
and bit 256 arms the guard when `evPeek` goes (~1590); but the box's Escape is caught on `window` with
`stopPropagation` (~1849–1859), so the document `keydown` reset (~1566–1568) never runs, and its scroll / resize closes
(~1842, 1856–1857) and the pinch-start dismissal (~1278) clear nothing. `main` does not do it.
The fix, exactly:
1. Add one helper beside the event box's effect that dismisses the box WITHOUT a closing press: it sets
   `lastPressRef.current = null`, then `setEvPeek(null)`.
2. Use it for the event box's scroll, resize and Escape handlers.
3. Use it for the pinch-start dismissal (`onStart`, ~1278).
4. Leave Edit's press-driven close, the outside-pointer close and the cell-toggle route as they are — Edit must still
   arm the guard; an outside press already carries `inWin: false`.
5. Check the last route too and say what you find: the effect that closes the box when `eventEdit`, `moveSel` or
   `eventMoveSel` rises (~1868) — when one of those rises from something other than a press inside the box (a move
   started from elsewhere, a key), can an old inside press arm the guard? If yes, clear it there as well, unless the
   press that raised it was the box's own Edit.
Tests (unit, in `doubletap-windows.test.tsx`, each red first): open `event-0-2026-01-01`'s box; a touch inside
`event-peek`; Escape dispatched from that element; at once a touch and click on `cell-asics-2026-01-29` at the same
coordinates → the bid window opens. The same with a `scroll` and with a `resize` in place of Escape, and one where the
inside press was made more than 600 ms before the dismissal. Keep the existing "Edit closes the box → the second tap is
swallowed" test green — the fix must not switch the real protection off.

## F2 — the browser test's "nothing opened" list names a window that does not exist (Astra, tests)
`raptor-port/e2e/doubletap-leavewar.spec.ts:20` lists `sel-sheet`; the drag window's test id in production is
`select-sheet` (`SelectSheet.tsx:417`). Correct it, and add to that list any other window a second tap on the grid can
open that it omits (the day's list, the remarks and approved-leave windows, the credited-OIL window, the closed-day
note, the posting sheets — read their test ids from the source, add only ones that exist). No app change.

## F3 — promised behaviour with no test (both reads) — tests only, the app changed only if one comes out red
a. Two windows up, one closes: the person window stays open (it does not block the grid) while ⚙ Settings is opened and
   closed by its ✕ — the second tap at that place is swallowed; a press on the person window right after is not; a tap
   on a day 60px away is not.
b. A hand-over costs nothing: Settings → "＋ Counter" — the counter form's own control pressed at once at the old
   control's place answers (it is not on the grid); the same for the event box's Edit → the event window's first button.
c. A failed save that keeps its window open arms nothing (an event Save refused; a counter Save refused).
If any of these is red on the code as it stands after F1, stop and report it as a finding with its cause before fixing.

## F4 — the same fault, wider: a press that became a swipe, and any old press (the Opus read's F2, new in this change)
The case, a phone, any role: he taps an event (the box opens), puts a finger ON the box and swipes the page — the
press began inside `.evpeek`, the page's scroll closes the box, bit 256 drops and the guard is armed at the swipe's
start; within 600 ms he taps the day that stood under the box — eaten; it should open. And generally: any bit that
drops from something other than a press (the period changed, the role effect, a resize) while the last press, however
old, was inside a window arms the guard at a stale place — `lastPressRef` carries no time and only a key clears it.
The fix, exactly (with F1's — do both; F1's helper covers Escape pressed within a second of an inside press, this
covers the rest):
1. `lastPressRef` gains a time `t`: set from `performance.now()` in the `down` listener, and refreshed by a capture
   `pointerup` listener on `document` when the press that is ending is the one remembered (so a button held a second
   and then released still counts from the release).
2. A capture `pointercancel` listener on `document` sets `lastPressRef.current = null` (a touch the browser takes over
   for a scroll or a pinch fires it). Both new listeners are removed in the same cleanup as `down` and `key`.
3. In `guardGrid`, when `second`: return unless `from` is inside a window AND `performance.now() - from.t < 1000` — the
   close follows its press within a frame; 1000 is slack for a slow phone. Say in the comment why (a window that went
   without a press just before it leaves no place to guard).
4. Check the first guard's own tests (`doubletap.test.tsx`) stay green unchanged — if one needs a change, stop and say
   which and why before changing it.
Tests (unit, red first): the box open; a touch `pointerdown` inside `event-peek`, then `pointercancel`, then a `scroll`
on `window` → the box is gone → a tap on the day at that place opens the bid window. And: a touch press inside a
window (the person window's body), 1.2 s pass (fake timers or a stubbed `performance.now`), the window is closed by
something that is not a press (the store's own close, or Escape caught elsewhere) → a tap at that place opens the day.
And the positive: the ✕ held 1.2 s then released closes the window → the second tap at once is still swallowed.

## F5 — the comment says more than the code does (both reads, tidiness — a comment only)
The new comment over `winsUp` says "EVERY OTHER WINDOW OVER THE GRID". Make it say the eight it covers, and that the
windows whose state lives outside `Matrix` (the Required rows' panel, rename form and number pad, the day-details
panel, the under-manned days list, the move banners' Confirm and Cancel, New period, Open for bidding on a desktop) are
not covered — `[LW-DOUBLETAP-MORE-WINDOWS]` in the backlog. Shorten it where it repeats `guardGrid`'s own comment. No
code change for this item; do not rename `winsUp` / `winUpRef` and do not recompute the bits from the render
conditions (filed).

## Not in this round — say nothing about them, change nothing for them
- The windows the guard does not cover and the backlog item did not name (the Required rows' panel, rename form and
  number pad, the day-details panel, New period, Open for bidding on a desktop, the under-manned days list, the move
  banners, the document viewer, the Calendar window): the host files them as `[LW-DOUBLETAP-MORE-WINDOWS]` — F5 only
  corrects the comment.
- A bit that is up while its window is not drawn (a member with `settings` set, a person gone): filed with it.
- On a phone a double tap on the event box's Edit opens the event window and the second tap, landing beside it,
  closes it at once (every Leave War window closes on a tap beside it — `Sheet.tsx`, unchanged since `main`): older,
  filed by the host.
- The two questions parked for the owner (the ✕ over the bell; a window closed by a tap beside it).

## Checks before you hand back, in this order, each to a file with its own exit code
1. the two unit files (`doubletap.test.tsx`, `doubletap-windows.test.tsx`) — green;
2. `npx tsc -b` and `npm run lint:changed` — clean;
3. under the lock (`node scripts/gatelock.mjs exec "claude/lw-doubletap-windows — fix round" -- <command>`, from
   `raptor-port`): the whole unit suite; then `npm run build`; then the browser file
   `npx playwright test e2e/doubletap-leavewar.spec.ts --project=lw-phone` (it builds and serves itself).
Leave `raptor-port/dist` built from your last commit — a walker drives it next.

## Your hand-back — your final reply, under 400 words
Per item F1–F3 (and any more above): the red run (file and what failed), the fix (file and lines), the green run. The
commits. The counts of each check. Anything you could not do, and why. Anything you found beyond the brief, as a
finding with its case — not fixed unless it is one line and red-first.
