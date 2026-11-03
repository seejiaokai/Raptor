# Fresh blind code read — the fix commits f5c1b0046 and 9ea6274e1 (3 Nov 26)

Reader: a fresh Opus, blind to the builder. Read only: `git show f5c1b0046 9ea6274e1 -- raptor-port/src` and the
surrounding code (`sheetfocus.ts` whole, `board.ts popMenu / rolePickMenu / openScheduler*`, `interactions.ts
openStoresMenu / routeOpenKey`, `Modals.tsx` DayPop and Traffic, `textedit.ts routeKeyDown`, `boardescape.ts`,
`FloatWindow.tsx` Escape, `SchedBoard.tsx` open effect, `state/view.ts setBoardDay`, `pan.ts` touch handlers, `Shell.tsx`
search boxes, `board-html.ts` box markup). The answers to `ws-read.md` F1–F4. Nothing built, run or changed.
D56 applied: nothing here lives only in stored data.

**Counts: high 0 · medium 0 · low 1.**

---

## R1 — low — the F1 fix skips every typing element, not only the boxes that answer Escape themselves: with the keys in a search box (or any input the app does not restore) behind a Traffic window, a day-details window or a board menu, Escape now does nothing at all, every time

- **Where:** `raptor-port/src/ui/sheetfocus.ts:131-135` (`escTop`, the new `TYPING` skip; `TYPING` at line 122).
- **Failure (the week, desktop, keys only):** Edit Schedule → Tab to a wave's Traffic button, Enter (the Traffic window
  opens, the keys stay on its button — it holds no keys). Shift+Tab back up to the top row's search box (`#searchE`,
  `Shell.tsx:624`). Press Escape: `escTop` sees an `<input>` outside the window's box and not the opener → returns without
  closing. `textedit.ts routeKeyDown` has no branch for the search box (not `[data-txt]`, `[data-bfld]` …), so nothing
  restores or leaves it; no movable window is up. **The Escape does nothing, and so does every Escape after it** until the
  keys are moved — before this commit the first Escape closed the Traffic window. Same on the board: + Wave (or + Block,
  Templates, a plan selector, the stores C) opened by the keys, Shift+Tab to the board's search box `#searchB`, Escape →
  `escTop` skips it, and the board's own "leave the search box" (`boardescape.ts boardEscapeWants` → `'leave'`) is not
  given either, because a menu is over the board (`overBoard()` → `''`). Stuck: the menu stays, the search box keeps the
  keys. Likewise a Traffic line `[data-airi]` (keys Tabbed out of the Traffic window to + Wave, Enter, Shift+Tab back into
  the Traffic line, Escape → skipped, nobody answers), and any `<select>` or checkbox the keys reach (`TYPING` matches every
  `input`, not only text).
- **Cause:** the rule's reasoning ("in a box behind, Escape is the box's — it puts the old words back and leaves") holds only
  for the boxes `routeKeyDown` actually answers; the skip is keyed on "is a typing element", a much wider set. FloatWindow's
  own copy of the rule has the same width but is harmless there, because its fallback is the box's own Escape on a page with
  nothing over it; here the thing over the page is exactly what was meant to close.
- **Fix:** skip only for the boxes whose own Escape restores and leaves them (the `routeKeyDown` set — every board `<input>`
  is a time box and every other board box a `<textarea>`, `board-html.ts:256, 395`, so this list is complete today):
  ```ts
  /* the schedule's own boxes — their Escape puts the old words back and leaves the box (textedit.ts routeKeyDown) */
  const OWN_ESC = '[data-txt],[data-bfld],[data-ifld],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]'
  …
  const at = document.activeElement as HTMLElement | null
  if (at && at !== document.body && typeof at.closest === 'function' && at.closest(OWN_ESC)) {
    const b = top.box()
    if (!(b && b.contains(at)) && !(top.from && top.from.contains(at))) return
  }
  ```
  (`TYPING` then goes.) The role pick-list keeps its rule (its box is a `[data-bfld]` textarea and is `from`); the two new
  cases in `boardkeys.test.tsx` stay green (a `[data-txt]` box and an `input.tm[data-bfld]`). Add one case: Traffic up,
  keys in `#searchE`, Escape → `#airpop` hidden.

---

## Noted, not findings

- **The board box's one-time blur also fires when the browser window loses focus** (Alt+Tab, another app): a blur goes to
  the focused element then, so the board's box loses its tab stop while it still holds the keys. Coming back, the keys may
  be "nowhere" (Chromium clears focus from an element that stopped being focusable). Escape and the blank-space press then
  behave as for a board opened by a press, which is safe; the only effect is that Tab may start from wherever the browser's
  own starting point is rather than from the box. If wanted: in `untab`, return while `!document.hasFocus()` and drop
  `{ once: true }` for an explicit remove after a real untab.
- **Movable windows vs. `escTop` (older, not these commits):** with a Traffic window up and the keys on a *button* inside a
  movable window opened after it (the input's own window over the board), `escTop` (document capture) still closes the
  Traffic window first, not the window the keys are in. With the keys in a *typing* box there, these commits now let the
  movable window answer — an improvement. Unchanged otherwise.
- `window.scrollY` read at touchstart and touchend is a layout-forcing read in Blink, but once per gesture, not in the
  scroll or touchmove handlers — fine.

## Checked and sound

- `escTop` `from` for menus = `popMenu`'s / `openStoresMenu`'s anchor: every anchor is a button (+ Wave, + Block, Templates,
  plans, C) except the duty role's, which is its own `[data-bfld]` textarea — so only the role list uses `from`, as meant.
- Duty role list: first Escape in the role box → `from.contains(at)` → list closes, `stopPropagation` keeps
  `routeKeyDown` out; `keysBack` leaves the keys in the box; second Escape (list off the list, listener removed) → the
  textarea branch puts the role back and blurs. A different role box Tabbed to: box first, list on the next Escape.
- `from` gone from the page: `contains` is false → the box-behind rule applies; the menu or window still closes once the
  box's Escape has blurred it (the next Escape finds the keys on the body). The role box is never repainted under the caret
  (`editingText` guard, `SchedBoard.tsx:344, 386`).
- `useEscWindow` `from` = the element with the keys at opening (the Traffic button or ⓘ — buttons, never typing); body →
  null. A window opened with the keys in a schedule box gets that box as `from` — the old behaviour there, never a window
  that cannot close.
- Every handled box blurs on Escape (`routeKeyDown`: `[data-inp]`, `data-ifld`, textarea, time `<input>`, `[data-itline]`,
  `[data-bombs]/[data-area]/[data-atime]`, `[data-txt]`), so after the box's Escape the next one finds the keys on the body
  and closes the window or menu — the two new tests' second-Escape step holds by that, not by luck.
- Question sheets: `topSheet()` is checked before the new rule — they still answer first. FloatWindow's handler sees
  `defaultPrevented` from `routeKeyDown`'s branches, so a box's Escape never also closes a movable window.
- `SchedBoard.tsx` blur listener: added before `focus()` (no blur can come before the box has the keys); `blur` does not
  bubble, so it fires only when the box itself loses the keys (a Tab to a child, a press elsewhere); removed in the effect
  cleanup, which runs on every way the board closes (✓ Done, Escape → `closeScheduler`, a page change → `closeBoardState`,
  sign-out → `setBoardDay(null)`, all flip `open`) and on unmount; a week change while the board is up keeps the same box.
  A blur during opening only follows a real move of the keys, so it cannot itself send them to the week.
- `board.ts KEYSIN`: set only when `SBDAY == null`, and `openScheduler` → `setBoardDay(di)` always opens it then
  (`routeOpenKey` already gated to Edit Schedule, so `open` = `SBDAY != null && CURPAGE === 'editsched'` flips and the
  effect takes the note at once); `closeScheduler` clears it; the other close routes never leave it set because every set
  is taken in the same open.
- `pan.ts`: `swPageY` written on the one touchstart path that sets `swEl`; the check sits in the one handler shared by
  touchend and touchcancel, before the Monday / Sunday split, on both Edit and View (one gate on `CURPAGE`). A sideways
  swipe that the week takes leaves the page's scroll alone (iOS and Chromium give a gesture to one scroller), so a real
  cross is not blocked; iOS's bounce at the page top or foot moves `scrollY` only when the page took the gesture, which is
  exactly when it should block; a touch stops a page fling at once; the keyboard does not open during a swipe. No read
  added to `onWeekTouchMove` or `onDocScroll`.
- `swipeweeks.test.tsx` new case: restores `scrollY` in `finally`; jsdom's `scrollY` is 0 throughout otherwise.
- `weekglide.ts` comment now matches the clamp.

Tokens: not known to the reader.
