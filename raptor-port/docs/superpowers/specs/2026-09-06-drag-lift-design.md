# One lift, every drag — design (6 Sep 26, owner-approved from an interactive mock)

## The ask

The owner's iPhone screenshot (Leave War, Rearrange on, a person row picked up) showed a cyan ring on the name cell, a second ring on the balance cell and faint cyan lines across the day cells — three separate boxes, an uneven glow. His words: "Every single drag and drop for rearranging things in the app should have these animation. The thing u are grabbing glows evenly … a cyan box around the perimeter. Not individual boxes. Once I drop the item, it should flash to show where the new item ended up." Then: "There should not be a perceived drop in speed." Scope, answered the same day: **everywhere in the app**. The pick from the mock he dragged on his phone: **Soft glow, inside the line, for all.**

## Why today's glow is uneven — two causes

1. The picked-up Leave War row is painted by three separate `box-shadow` rules (`matrix.css` — the `.who`/`.bal` ring + halo, the day cells' top/bottom lines, the heading twin). A table row spanning two opaque sticky cells and hundreds of scrolling cells cannot take one outline, so the look was assembled per cell.
2. The grid sits inside `div.card { overflow: hidden }` (`chrome.css`). An `overflow:hidden` ancestor DISCARDS a descendant's outer box-shadow, so the halo is clipped dead at the card's left and right edges and shows above and below only. The repo learnt this once already — `.sb-fresh` (`scheduler.css`): "draw nothing outside the border box".

Every RAPTOR drag has its own look today (raised card + outline on rows/waves, an outline on panels, opacity on quals columns, ghosts with black shadows for crew pucks and calendar chips), and none of the twelve flashes on landing.

## The twelve surfaces

- **Leave War** (one machine, `Matrix.tsx startRowDrag`): person rows; group headings on the grid AND the same write from the ⚙ Settings "Groups" list; manning rows; the ⚙ "who wins" priority list.
- **RAPTOR:** schedule rows, wave blocks, section panels (`ui/rowdrag.ts`; the board/week DOM is rebuilt from HTML strings after a drop); quals columns (`QualsPage.tsx`); calendar chips to another day (`ui/caldrag.ts`, a ghost); the day-popover planning sections and the seated-puck swap (`InputsCal.tsx`); crew pucks onto seats / swaps (`ui/drag.ts`, a ghost).
- **Not drags, untouched:** the ▲▼ button lists (admin defaults, templates, CX reasons, the counter-figure order), Leave War's button-armed "Move…" (amber landing preview), every SELECTION drag (day cells, figure boxes, OIL rows).

## The recipe — defined once, worn two ways

Defined ONCE in `src/ui/scheduler.css` (global; Leave War pages load it and inherit `--accent`; keyframes at top level, never inside matrix.css's `#page-leavewar { }` wrapper, where a nested `@keyframes` is invalid):

- `--lift-box: inset 0 0 0 2px var(--accent), inset 0 0 12px rgba(59,198,232,.30)` — a static custom property on `:root` (never toggled; the perf doctrine forbids toggled properties on grid ancestors, not constants). It is the owner's "Soft". INSET ONLY: drawn inside the thing's own edge, so it is even on every side, in every host, under every clip. **No outer halo anywhere** — the ghosts too.
- `.lift { border-radius: 8px; box-shadow: var(--lift-box) }` — the picked-up look for anything that can carry a class.
- `.lift-frame { position: absolute; z-index: 7; pointer-events: none; display: none; box-sizing: border-box }`, shown while it carries `.lift` or `.lift-land`; a 120ms bloom (`@keyframes liftIn`: opacity .65→1, scale .985→1) on the FRAME only — a real row or a ghost gets its box instantly (a transform keyframe would fight a ghost's inline transform, and a bloom on a real row flickers its content).
- `.lift-land` — the landing flash: a veil `::after` (`position:absolute; inset:0; border-radius:8px; pointer-events:none; will-change:opacity`) carrying the same Soft inset box plus a wash `rgba(59,198,232,.20)`, `@keyframes liftLand { 0%, 25% { opacity: 1 } to { opacity: 0 } }` over `LIFT_LAND_MS = 600` — bright for the first 150ms, then gone, opacity-only (compositor). A pseudo-element adds no DOM node, so no ceiling moves. `.lift-land:not(.lift-frame) { position: relative; z-index: 4 }` gives a plain element the positioning context (the `.sb-fresh` precedent); the FRAME keeps `position: absolute` — the mock's first drive lost the landing frame to a bare `.lift-land { position: relative }` written later in the file.
- Reduced motion: `scheduler.css` blankets `*{animation:none!important}`, but `*` matches ELEMENTS and never pseudo-elements — so that blanket silences the frame's `liftIn` bloom while the veil needs its OWN `@media (prefers-reduced-motion:reduce){.lift-land::after{animation:none}}`, written beside the recipe (corrected 6 Sep 26; measured in Chromium, the veil computed `liftLand` while its host element computed `none`). With both in place the land class HOLDS for `LIFT_LAND_MS` and a JS timer removes it (feedback stays, motion does not); `animationend` never fires there, so the timer always clears, and under normal motion both clear.
- The numbers live in one place each: `src/ui/lift.ts` (`LIFT_LAND_MS`), the `--lift-box` property and the two keyframes in `scheduler.css`, commented on both sides.

**Single-element things wear the recipe directly** — one box is inherently even. Where the picked-up class is written by JS on an unmanaged DOM (RAPTOR rows, wave blocks, section panels — `rowdrag.ts`), it is `lift`. Where React owns the element's `className` (the two ⚙ Settings lists, the day-popover sections), the existing prop-driven `dragging` class carries the recipe through `var(--lift-box)` — an imperative class on a React-managed element is wiped by the very re-render the arm causes. The seated puck's imperative `.pk-drag` gains the recipe too (nothing re-renders during that drag).

**Composite things get ONE overlay frame**, rendered in JSX with a constant `className` and driven only through `classList`/`style` via a ref (React never writes to it again), hosted in a positioned ancestor that moves WITH the content under every scroll it can undergo, measured ONCE at arm and ONCE at landing.
- Leave War grid rows (person, heading, manning): the frame is the LAST child of `.mx-outer` (after the drawer). Host `.mx-outer` is `position: relative` with no stacking context and no overflow; z 7 sits above the band (4/6) and the drawer (5), under `.mxfixed` (55 — it covers the frame when a row scrolls under the frozen header, as it covers the row), the bars (60) and the sheets (79). Rect: `top/height` from the row's `getBoundingClientRect()` minus the outer's — visual px, NEVER divided by the table's `zoom` (the drawer precedent); `left/width` = the `.mx-wrap`'s VISIBLE box relative to the outer — a constant, so the box closes at the visible right edge and wraps the frozen block, the open drawer and the days as one perimeter. `boxOf` returns `null` at zero height or zero host width (jsdom) → no frame, never zeroes.
- Quals columns: a frame inside `.qwrap` (which gains `position: relative`), rect = the heading's x ∪ the table's y in content coordinates (+ `scrollLeft`), so it rides the sideways scroll for free.
- The per-cell drag paint on the picked-up Leave War row is DELETED; with it gone the manning shortfall ring paints normally on the picked-up row. KEPT: the content fades (`.who > *`, `.bal > *`, `.grphd-in`, `.grpfill` at .5 — the label-bleed cure); every landing bar/line on every surface (they say where it WILL go; the flash says where it WENT), with the `--mrow-ring` last layer.

**Ghost drags** (calendar chips, crew pucks): the ghost wears `lift` (its own accent `outline`/`border-radius` goes; its dark drop shadow, `will-change`, `left/top:0`, `z-index`, `pointer-events` and `cursor` stay); the landed chip/puck flashes after the re-render.

## Finding the landed thing

- **Leave War:** `cfg.move()` runs from a native `window` pointerup listener, so React batches — a rect read on the next line is STALE. A dep-list-free `useLayoutEffect` in Matrix (the `syncBandHeights` precedent) reads a `landRef` set at the drop, finds the moved `<tr>` (keyed rows MOVE, they do not remount), measures it and plays the frame in the same frame as the reorder. Not `requestAnimationFrame`. GROUP_DRAG serves both the grid heading and the Settings list, so the arm records which surface the grip was pressed on (`closest('.mx-wrap')`) and lands there — a list row lands by `landOn` (imperative, after the commit).
- **RAPTOR rebuilt DOM:** `reorder.ts` states "`to` is the destination index AFTER removal", so the landed row IS `[data-move="<to>"]` (one special case: an `ac` move where the formation travels — `[data-move^="mv:ac.<di>.<gi>.<b3>."]` climbed to `.sb-line`); a section keeps its key (`[data-secmove="<di>.<fromKey>"]`); a puck lands at `[data-slot="k"],[data-fill="k"]`; a chip at `[data-icday="<toIso>"] [data-iid="<iid>"]` / `[data-pid="<pid>"]`. The mover calls `markLand(sel)` BEFORE the re-render; `paintLand()` runs from the existing post-render pass (`highlights.ts refreshHighlights`, right after `paintFreshAdds()`; InputsCal's own layout effect for the calendar) and is ONE-SHOT — it clears its slot the moment it finds the node, so an unrelated repaint can never restart the flash; a stale mark clears itself after 1s.
- **What counts as a landing:** a committed drop with a target flashes where the thing ended up, moved or not (the owner's words); a cancel, or a release with no target, shows nothing.

## Performance — the hard rule

Nothing new runs per pointermove; one measurement at arm, one at landing; opacity/transform-only animations; `will-change` only on the veil; no React state for the frame; the arm is not delayed (no new hold timer); the move commits first, the flash follows in the commit's layout effect. Never key `.lift` off a body/root class; never toggle a custom property on `.mx-outer` or a grid ancestor. One declared cost: restarting a flash on an element already flashing needs one `void el.offsetWidth` reflow at the drop. Measured on the mock against the preview with the same scripted drag: the decoration adds no long tasks (0 vs the preview's own single ~90ms redraw at pick-up, unchanged by this work); max frame gap 17ms both.

## Untouched

Every gesture's arming/timing/hit-test/commit, the stores, the landing bars, `tr { position: relative }` (a paint-layer invariant), the band torn down in Rearrange, the drawer inert in Rearrange, the selection drags, the "Move…" flow, the quals frozen mirror `.qfixed` (it has no drag handlers today — recorded, not fixed here).

## Trap table

| # | trap | defence |
|---|---|---|
| 1 | outer halo clipped by `.card{overflow:hidden}` / `.sb-panel{overflow:hidden}` | inset-only; no halo anywhere |
| 2 | stale rect after `cfg.move()` (React batches native-listener updates) | dep-list-free layout effect + ref |
| 3 | dividing rects by `zoom` | never — `.mx-outer` is unzoomed, rects are visual px |
| 4 | a frame in `.mx-wrap` is clipped and slides sideways | host `.mx-outer`; span = the wrap's visible box |
| 5 | the frame catching `elementFromPoint` | `pointer-events: none`, pinned in unit AND e2e |
| 6 | React wiping an imperative class | the frame is JSX with a constant className + ref; React-managed rows carry the recipe on their prop-driven `dragging` class; `landOn` runs after the commit |
| 7 | the land class re-added by an unrelated repaint (the `.sb-fresh` fault) | `paintLand` is one-shot; stale marks die at 1s |
| 8 | `animationend` never fires under reduced motion | the timer always clears |
| 9 | deleting the per-cell paint and the shortfall ring | the landing bar keeps `var(--mrow-ring, 0 0 transparent)` last; the picked-up row now paints the ring normally |
| 10 | fading a sticky cell lets day numbers bleed through | the content-fade rules stay untouched |
| 11 | `.mxfixed` covers the frame | correct — it covers the row too |
| 12 | an `ac` formation move: `to` names a different jet | the one special case above |
| 13 | `.qwrap` not positioned | add `position: relative` (the `.mx-wrap` precedent) |
| 14 | `.qfixed` has no drag handlers | record only |
| 15 | a transform keyframe on a ghost fights its inline transform | the bloom is on the frame only |
| 16 | the frame losing `position: absolute` under `.lift-land` | `.lift-land:not(.lift-frame)` carries the relative rule; pinned in `lift-css.test.ts` |
