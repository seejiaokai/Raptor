# Fresh blind code read — `claude/week-swipe-pdf-print` against `main` (3 Nov 26)

Reader: a fresh Opus, blind to the builders. Read only: `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e
raptor-port/playwright.config.ts`, with the surrounding code (`pan.ts`, `weekglide.ts`, `sheetfocus.ts`, `boardescape.ts`,
`FloatWindow.tsx`, `textedit.ts routeKeyDown`, `schedule-tab.ts`, `interactions.ts routeClick`, `board.ts popMenu`,
`Modals.tsx`), the evidence sheet `2026-11-03-week-swipe-keys.md` §1–§7 and D550–D555, D597. Nothing built, run or changed.
D56 applied: nothing here lives only in stored data.

**Counts: high 0 · medium 0 · low 4.**

---

## F1 — low — Escape over a menu or a non-modal window takes the press from a schedule text box being typed in behind it

- **Where:** `raptor-port/src/ui/sheetfocus.ts:117-126` (`escTop`).
- **Failure:** on Edit Schedule (week or board), with the keyboard: open a wave's Traffic window (or a day's ⓘ). It does not
  hold the keys, so Tab goes on into the schedule behind it (the evidence sheet notes Tab is not kept in the board either).
  Tab into a callsign / time / remarks box, type, press Escape to cancel the typing. `escTop` hears it first (the document's
  capture phase), finds the window on its list, stops the press and closes the window. The box's own Escape
  (`textedit.ts routeKeyDown`, a document listener in the bubble phase) never runs, so the typed text is not put back; the
  caret stays in the box with the unwanted text, and the next blur (a click away, a Tab) saves it into the schedule. Same with
  a board menu (+ Block, Templates, plans, + Wave, a jet's stores) left up while the keys are in a box elsewhere.
- **Why it is the wrong one:** the app's two other Escape owners already make this exact exception —
  `FloatWindow.tsx:234` ("in a box on the page behind, Escape is that box's own: the window stays") and `boardescape.ts`
  (`boardEscapeWants` returns '' inside TYPING). `escTop` is the only one that does not. A second Escape does restore the box,
  which is why this is low, but the first one silently does the opposite of what the person pressed it for.
- **Not to break:** the duty role list (a `popMenu` hung from the role text box itself) — the builder's report says the first
  Escape there closes the list and the second restores; keep that.
- **Fix:** give each entry the element it hangs from and let a text box outside the entry answer its own Escape:
  ```ts
  type EscEntry = { box: () => HTMLElement | null; close: () => void; from?: () => HTMLElement | null }
  const TYPING = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
  // in escTop, after `if (topSheet()) return`:
  const a = document.activeElement as HTMLElement | null, b = top.box(), f = top.from ? top.from() : null
  if (a && a !== document.body && b && !b.contains(a) && a !== f && (a.isContentEditable || a.closest?.(TYPING))) return
  ```
  `menuEscape` passes `from: back` (the anchor's `locate`), `useEscWindow` passes `from: back` (the opener's). Add a unit
  case to `boardkeys.test.tsx`: Traffic up, caret in a `[data-txt]` box with typed text, Escape → the text is restored and
  the window is still up; a second Escape closes the window.

## F2 — low — after the board is opened by the keys, a click on its blank space puts the keys on the board's box, and two Escape / give-back rules then read them as "somewhere"

- **Where:** `raptor-port/src/ui/SchedBoard.tsx:134-135` (`root.tabIndex = -1` held for the board's whole life when keyed).
- **Failure:** Enter on the week's date opens the board (keys on its box — fine). Open a movable window over the board that
  closes on Escape (the input's own window, the Calendar window). Click the board's blank space (the page behind a movable
  window works — D641): with the box focusable, the click puts the focus on the board's box instead of nowhere. Escape now does
  nothing: `FloatWindow.tsx:235` (`!inWindow && at && at !== document.body` → return) treats the box as a box on the page
  behind, and the board waits because a window is over it. The same "somewhere" reading stops the keys going back to an opener
  in `FloatWindow.tsx:206`, `useSheetFocus`'s cleanup (`sheetfocus.ts:71`) and `keysBack`. A board opened by a press or a tap
  never has this (no tabindex), so it shows only after a keyboard open — the comment above the line says "a press on the
  board's blank space must not take them", which holds only for a board not opened by keys.
- **Fix:** let the box take the keys once, as a landing place, and stop being focusable as soon as they leave it:
  ```ts
  if (keyed) {
    root!.tabIndex = -1; root!.focus({ preventScroll: true })
    root!.addEventListener('blur', () => root!.removeAttribute('tabindex'), { once: true })
  }
  ```
  (keep the cleanup's `removeAttribute`). Unit case: keyed open, focus a board button, click blank board space →
  `document.activeElement` is body, not the box.

## F3 — low — the "opened by keys" note can be left set and taken by a later mouse open

- **Where:** `raptor-port/src/ui/board.ts:2306-2307` (`KEYSIN`), read only by `SchedBoard.tsx` when the board's `open` flips
  to true.
- **Failure:** Tab is not kept in the board (filed [BOARD-KEYS-LEFT]), so with the board up the keys can walk into the week
  hidden behind it and reach a day's date; Enter there runs `routeOpenKey` → `openSchedulerByKeys` → `KEYSIN = true`, and the
  board just changes day — `open` does not change, the effect does not run, the note is never taken. Later the board is closed
  and opened again by a click or a tap: `takeKeysIn()` returns the stale true and the board's box takes the keys (and becomes
  focusable — F2) on a mouse open. Small on its own, but it is state left set after a path that never consumes it.
- **Fix:** only note a keyboard open when the board is actually opening:
  ```ts
  export function openSchedulerByKeys(di: number) { KEYSIN = view.SBDAY == null; openScheduler(di) }
  ```
  and clear it on every other open: `export function openScheduler(di) { … }` called from the click route stays as is, but add
  `KEYSIN = false` at the start of `closeScheduler` (or in `HOOKS`' board-close path) so a note can never outlive one board.

## F4 — low — the new axis rule no longer checks that the page did not scroll down

- **Where:** `raptor-port/src/ui/pan.ts:666` (with the axis set at `pan.ts` `onWeekTouchMove`, `AXIS_SLOP = 10`).
- **Failure:** the old test refused any gesture that went further down than across. The new one, once the first 10px were
  more across than down, ignores the drop entirely: on Monday (or Sunday), a thumb scrolling the long day down whose first 10px
  happened to slant sideways (e.g. 10 across, 8 down), then goes 250px down and drifts 50px sideways, crosses into the previous
  week. The rule's own reasoning is "the browser decides by the first clear movement — the page did not move, the day did";
  where the browser's own slop (≈10pt on iOS, ≈15px in Chromium) reads that first slant the other way, the page DID scroll
  down and the reading still crosses. Only a near-45° start at an end day hits it, hence low; nothing in the unit or e2e set
  covers "the page scrolled vertically and the first 10px were sideways".
- **Fix:** keep the axis rule, and also ask what the page did — record `swY0 = window.scrollY` in `onWeekTouchStart` and in
  `onWeekTouchEnd` return when `Math.abs(window.scrollY - swY0) > AXIS_SLOP`. This keeps the thumb's arc (the page does not
  move: the e2e arc test stays green) and closes the case where the browser took the gesture as the page's.

---

## Noted, not findings

- **Traffic: Escape saves a half-typed line** (the blur before close). Opposite to the board's own boxes, where Escape puts the
  old words back (D1011) — but roll-call R11 sets "a Traffic line being typed is saved" as the intended behaviour, and walker B
  walked it. Design, his to change.
- **`weekglide.ts snapshot` comment vs code:** the comment says a day caught more than a quarter-day off is "drawn whole on its
  place, as before"; the code clamps the offset to ±¼ day (so it is drawn ¼ day off, not on its place). At a week cross the
  strip is always at or past an end (0…12 or max, or Safari's pull), so the clamp never bites in practice; worth one word in
  the comment.
- **(1b) near-edge threshold is 12px easier than the at-rest one** (`swHomeL = sl − EDGE_SLOP` counts "home" as 24, Monday rests
  at 12): from 100px short, 33px past Monday's rest crosses, versus 45px from rest. Harmless; mentioned for symmetry.
- **Focusing a date above the viewport** (Shift+Tab back up a long day) lands it under the sticky top bar (no `scroll-padding-top`)
  — the same as the Templates button beside it today; older, not this change.

## Checked and sound

- `pan.ts` touchstart/move/end: `swEl` nulled on every touchstart and on the first of touchend/touchcancel; a second finger nulls
  it (pinch never crosses); `swAxis`, `swTrail`, `swNear*` reset per gesture; no listener left attached; desktop and the open
  board return before any reading.
- Twin paths symmetric: settling/near for Monday and Sunday (`sl < half` / `sl > max − half`, `swHomeL` / `swHomeR`), forward and
  back crossing, touchend and touchcancel share one handler.
- Settling reading (`wkMovedAt/wkMoveDir/wkPrevEl`) is per strip element; a landing write's scroll event cannot make a swipe off
  the just-landed end day cross the wrong way (direction and half-day gates).
- A within-week swipe from Tuesday's rest (sl ≈ one day) is never "near" Monday (> half a day) — cannot cross; e2e and unit
  cover it.
- Tap jiggle < 24px never crosses; a finger held still before lifting has no speed (`liftSpeed` finds no point inside 100ms).
- During the glide the real week and both copies take no touches (`pointer-events:none`), so a touch then never starts a reading
  on the week.
- Performance: `onDocScroll` adds three writes and no layout read; `onWeekTouchMove` is passive and reads no layout; `weekLanding`
  forces one layout per cross only.
- `weekLanding('mon')` = Monday's snap point (12) on a phone, 0 on desktop and in jsdom; used identically by EditWeek, ViewWeek,
  the arriving copy and `finish` — the arriving copy and the real week agree; `'sun'` unchanged (`weekScrollMax`).
- Glide copies: `scroll-snap-type:none` stops the copy's own snap; leaving copy keeps where the day stands (clamped); DUR 340 /
  fallback 460 consistent with the test's 470.
- `routeOpenKey`: same gates as the click (`canEditSched`, `editsched`, `#eWeek .sb-open`), Enter/Space only, repeats and
  modifiers ignored, Space's scroll prevented; runs after `routeKeyDown`, which does nothing with Enter on the date.
- The date's `tabindex="0"`: the schedule's Tab route never visits it (not in WEEK_TEXT; `ordinaryTarget` only looks forward of
  the last box within the day — the date is before the boxes — so D553/D597 unchanged); view week markup unchanged and pinned
  (parity normaliser only strips the edit-week attributes).
- `escTop` / `escCloses`: listener added with the first entry, removed with the last (or on the first Escape that finds only
  stale entries); stale menus pruned by `isConnected`; a sheet holding the keys answers first; `stopPropagation` +
  `preventDefault` keep the board (window bubble) and movable windows (`defaultPrevented`) from also closing.
- `useEscWindow`: ref is attached before the effect (same DOM node, hidden ↔ open); leaves the list on every close route
  (effect cleanup); keys back only when nowhere or inside the window.
- `menuEscape`: stores menu's `_offClick` unhooked; `popMenu`'s own `{once:true}` click listener left on a removed box is
  harmless (removes a detached box, then itself).
- `locate` searching inside `#schedBoard` for a board control: keys never land on the week's identical button under the board.
- SchedBoard give-back: `back` read before the keyed focus; cleanup gives back, then removes the tabindex; page change skips.
- Moved code (`topstate.ts`, `changesjump.ts`, `availopen.ts`): line-for-line the removed text (checked by line match for
  `topstate.ts`); no old copy left, every importer repointed (tests and `vi.mock` included) — one module instance of
  FASTSYNC and the bell state; no new import cycle.
- Set/Map look-ups: `warnTarget`, `storyOf`, `boardMbtn`, `signoffHTML` — Set.has is the same SameValueZero match as
  `includes`; every result is still produced by filtering/finding the original ordered list, so order and first-match are
  unchanged; `miss` and `gRowsBefore` are always arrays.
- `EntryChange`, `WaveLine`, `WaveEye`: module-level components (no remount per render), key kept on the mapped line, same
  markup and handlers; inputs keep focus while typing.
- `role="presentation"` on the four shades and the new `aria-label`s change nothing a click reaches; no app selector keys on
  `[role=…]` for these elements.

Token count: not known to the reader.
