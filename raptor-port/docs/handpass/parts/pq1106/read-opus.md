# Code read — job 3, night of 6 Nov 26 (People and Quals), branch `claude/people-quals-1106`

A fresh, blind Opus read of `origin/main...claude/people-quals-1106` (`raptor-port/src`, `raptor-port/e2e`). Read only;
no app file changed. A finding is a concrete failure, its cause and its fix (house rule); data-only harm is excluded (D56).

## Findings

### 1. (low) "His row, outlined" can now scroll the page twice on an Undo made in Quals' "All" view
- **File / lines:** `src/ui/QualsPage.tsx` 315–343 (the `backHl` ref, the `QUALSFOCUS` effect at 328–333, the outline
  effect at 334–343).
- **What a person meets:** on Quals with the **All** view on, he undoes a change to a man's Quals row whose row is off
  screen. The page first jumps to that man's row in the All list (one painted frame at least), then the table redraws
  as Pilots / WSOs / Personnel and, if the row is now somewhere else off screen, jumps a second time. Before the change
  it jumped once, already in the right view. Where the second check finds the row "on screen" by coincidence, he is
  left at a scroll position worked out for the All list (D672 is still met — the row is in view — but the landing
  differs from before).
- **Cause:** with state, `setBackHl(id)` inside `checkBack` took effect only on the NEXT render, by which time
  `setSeat(…)` had redrawn the table in the man's own view. With a ref, `backHl.current = id` is visible at once — and
  the `QUALSFOCUS` effect (the Undo's `focusQualsRow`, `state/undo-wire.ts` 197; and `ui/WelcomeBack.tsx`) runs in the
  SAME passive-effect flush as the outline effect declared just below it. So the outline effect runs against the old
  table (All), finds his row there (All holds everyone), outlines it and calls `scrollIntoView`, before the `setSeat`
  re-render lands. The "Check his quals" press is unaffected (a click handler: one batched render, then the effect).
  Welcome-back "Check my quals" is unaffected in practice (Quals mounts in Pilots; a WSO's row is not there, a pilot's
  view does not change).
- **Fix (either):**
  (a) in the outline effect, act only once the table shows the man's own view:
  ```ts
  const id = backHl.current; if (!id) return
  const p = PEOPLE[id]; const want = p && (p.pers || p.seat === 'GND' ? 'GND' : p.seat === 'RCP' ? 'RCP' : 'FCP')
  if (want && qSeatView !== want) return   // the seat switch has not been drawn yet — the next render does it
  ```
  (pull the view rule out of `checkBack` into one small `seatViewOf(p)` so the two cannot drift); or
  (b) keep `backHl` as state, with the React Doctor rule kept off on that line and its reason ("its setter must make
  the outline wait for the seat view's redraw").
  A pin: in `e2e` (or a jsdom test with `scrollIntoView` spied), Quals on All, Undo a change to an off-screen WSO's
  row → `scrollIntoView` called once, with the WSOs table drawn.

No other finding survived checking.

## Older, met in passing (not this change)
- **The outline effect never lets go.** `backHl` is set and never cleared (it was the same as state), and the effect has
  no dependency list, so after "Check his quals" or an Undo that outlined a row, ANY later repaint of Quals — ticking a
  box on another man's row, a store change, the pinned heading row pinning — re-runs `scrollIntoView` whenever that row
  is off screen: he scrolls down to work on someone else, ticks a box, and the page jumps back to the first man. Worth a
  walk step (Check his quals → scroll far down → tick another row). If confirmed: clear `backHl.current` after the first
  successful outline-and-scroll (keep the outline class re-applied by a separate, non-scrolling line if the outline must
  survive redraws).
- `docs/file-map.md` does not name the new `src/ui/peoplepick-model.ts` (the house rule: same change). Documents only.
- `src/state/accounts.ts` 222: `const cat =seat` lost its space. Style only.

## What was checked and found sound
- **The heading drag ([QUALS-HEAD-FINGER-CAPTURE]).** `releasePointerCapture` on an element that holds no capture is a
  no-op (and is in a `try`); a press on the grip or the words releases both holds. With the hold gone, a finger's moves
  outside `#qtbl` (the page margin, the pinned row) no longer reach `onMove` — exactly what a mouse and a finger pressed
  on a heading's padding already did, and `onUp` is on the document, so the drag still ends. `elementFromPoint` over
  the lift frame: the frame is `pointer-events:none`, so it is never hit. Over the pinned row (`.qfixed`, outside
  `#qtbl`): its moves do not reach the table's listener once the hold is released; were a hold kept, the mirror's
  `th[data-col]` carries the same column key, so `moveQual(from, key)` still lands right and `clear()` takes its lit
  class off. Over body cells the read falls back to the target and returns — the last lit heading stands. jsdom (no
  `elementFromPoint`) falls back to the target. A pinch's first finger: `cancelColDrag` still clears it, and the pinch
  itself reads touch events, which pointer capture does not route. Edge scroll's re-read is unchanged.
- **The still name heading drawn without the browser's follow ([QUALS-PINCH-NOSDA-HEAD]).** At rest it stands where the
  mirror's own sticky name heading stands (same left, same zoom rule `.qfixed .qtbl`, same fixed widths); the scroll
  listener's `scrollLeft` write moves only the mirror's scroller, under it; a press on it sorts through the bar's own
  click handler (its `th[data-sort]`); the pinch's `alsoTL` already targeted `.qfixed-frozen`; `.qfixed.q-pinching`
  hides only the mirror's own name heading, only while the fingers are down; the whole bar's mid-pinch
  `visibility` hiding covers both. Desktop browsers without scroll-driven animations (Firefox) now also draw the copy —
  identical at rest; its extra pixel past the column is the same as the browser-follow path already had.
- **The edge strip ([QUALS-ZOOM-EDGE-SLIVER]).** Phone width only, only under `.qwrap.xscroll` (toggled by the one
  scroll listener, which survives redraws); `td.qname` and the name heading are sticky, so the absolutely placed
  `::before` has a positioned parent; `::before` was free on both (the history dot's `::before` rules never match a
  `td`/`th`); `background:inherit` takes the cell's own fill; nothing else in the app uses `.qwrap`; a strip at
  negative left adds no scroll range.
- **The moved module.** Every importer of `pickProblem`, `PLACEHOLDER_HEADING`, `PLACEHOLDER_IDS`, `pickRoster` is
  updated (InputWindow, three tests, PeoplePick itself); InputsPage's `PlaceholderGroup` still comes from PeoplePick;
  nothing is exported twice; `ui/inputedit.tsx` imports neither file, so `peoplepick-model → inputedit` adds no cycle
  (PeoplePick already imported inputedit). The body is byte-for-byte the old one; `mayPickOthers` gained only `export`.
- **The Set lookups.** `new Set(people)` / `inGroup` answer exactly as `includes` did (same equality), built once a render.
- **HolidaysPanel `useOnChange`.** The three setters are the panel's own state (no "updating another component while
  rendering"); first mount resets nothing, as the effect's first run reset nothing (all three start empty); the arrows'
  `step` and a year turned from outside both reset, now in the same render instead of a frame later; StrictMode's
  double render is React's documented pattern for this; `fresh` was never reset and still is not.
- **Login labels `htmlFor`, Quals' "Add qualification" span → label, the filter's `aria-label`.** No stylesheet styles a
  bare `label` inside `.qadd` (only `.login label`, `.acct .sel label`, `.mfield label`), `.qadd .lab` still applies,
  so nothing drawn changes; a tap on "Add qualification" now puts the caret in its box (on a phone, the keyboard comes
  up) — the intended effect of a tied label.
- **The disable comments** carry reasons, change no behaviour, and none touches `doctor.config.json`.
- **The tests.** "pressed on its words…": on the old code the move read the target, which the words' hold kept on the
  first heading, so `qdrop` never moved — it fails there; it also asserts the finger lands on the words and the target
  heading is clear of the edge band, so the edge scroll's re-read cannot pass it. "without scroll-driven
  animations…": on the old code no still copy existed and the mirror's own name heading was carried left mid-pinch — it
  fails there; the `q-sda` count check proves the path taken. "after a pinch to a zoom between whole steps…": reads the
  screen's own pixels across scroll positions — the right instrument; its "unscrolled, nothing covers" half passes on
  the old code by construction (it guards the unscrolled line, not the fix). I did not run any test; that the sliver
  half was red on the old code is the builder's claim, not checked here.
