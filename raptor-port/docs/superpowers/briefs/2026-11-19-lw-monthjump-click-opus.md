# Chat 112's fix read — the fresh, blind Opus read (19 Nov 26)

Read of an exported copy of `claude/lw-monthjump-click` at `ae4c632a3`, brief `2026-11-19-lw-monthjump-click-read-brief.md`.
Blind to the walk and to Astra. The report's findings and negatives, as handed back (its source list and coverage notes
condensed). Host's disposition: F1 fixed (the wheel ends the landing only when it is mostly sideways, or Shift with a
vertical amount); F2 fixed (`anchorNow`'s edge test within one screen dot); F3 fixed by Astra's finding's fix (a scroll
since the note is the person's — `reanchorPlan`).

---

Sources: the brief, FIX-DIFF.patch, FIX-LOG.txt; in Matrix.tsx `landOnEdge`, `jumpTo`, the landed-mark listeners,
`anchorNow`, `measureWindow`, `onWrapScroll`, the anchor layout effect, the fill tick, `syncHbar`, `onHbarScroll`, the pinch
wiring; reanchor.ts and its test; every other writer of the grid's sideways scroll (FlyEdit.tsx, select.ts, Sheet.tsx, the
drag code, the edge auto-scroll). reanchor.test.ts 9/9; one proof test, placed and deleted: `landingScroll(101.2, 0.8)`
leaves the day 1.2px clear (F2).

**F1 (moderate, introduced by this change). A trackpad's vertical swipe over the grid still ends the landing.** Press SEP,
then within the fill's few seconds swipe down over the grid. Touchpads send small sideways amounts (deltaX ±0.5 to 2)
inside a vertical swipe; the new wheel listener clears the mark on any `e.deltaX !== 0` over the grid. The gesture scrolls
the page, not the grid, but the mark is gone, the later redraws fall back to the old rule and 1 September slides under the
counter column again. Fix: `(Math.abs(e.deltaX) > Math.abs(e.deltaY) || (e.shiftKey && e.deltaY !== 0))`; noise in a
vertical swipe is then judged by `onWrapScroll`/`leftTheLanding`. Proof not run (needs a browser).

**F2 (low, partly older). Below a 1.0 screen ratio a fresh landing is not recognised as "on the edge".** At browser zoom
90%, 80% or 67% one screen dot is larger than a pixel (1.25px at 0.8), so `landingScroll` lands the day 0 to 1.25px
clear; `anchorNow` calls it "on the edge" only within 1px, so about one landing in five is not recognised; the next redraw
uses the shift rule, whose fractional write can leave the day up to about 0.6px under for one beat. Transient, not
cumulative. Fix: `edge: Math.abs(left - viewL) < Math.max(1, 1 / (window.devicePixelRatio || 1)) + 0.01`.

**F3 (very low, introduced). A one-frame gap in which the grid's own correction can override his scroll.** Scrolls the app
writes directly (the drag-selection's edge step, FlyEdit bringing a cell into view, Tab or focus scrolling a cell into
view) change the position at once, but the scroll event waits a frame; a fill commit in that gap with a waiting
"on the edge" anchor puts the day back, records that spot as the grid's own, and his scroll event then matches it. Worst
case: one edge step lost, or a FlyEdit box over a cell that just moved. Fix: take 'edge' only when `wrap.scrollLeft`
equals `ownLeftRef.current`. Related, older: an anchor noted before any of his scrolls and applied after it undoes that
scroll in 'shift' mode as well.

**Explicit negatives.** The grid's own writes are never taken for his scroll (each read back after writing; a December
clamp absorbed; the proxy bar's echo filtered; the mirror and follow-write move other boxes; the nudge moves nothing; no
browser scroll anchoring on this axis). His scrolls still end the landing (Shift+wheel, sideways swipe, the proxy bar, a
press on the box or native bar, arrow keys, Tab, drag edge-scrolls, the sheet's forwarded wheel or drag, pinch and
Ctrl+wheel zoom writes); the phone still clears on any touch. Rounding: at 100% `landingScroll` is the old floor exactly;
at 110%, 125%, 150% it floors in dots and the "already there" check compares in dots (no rewrite, no loop); WebKit's whole
pixels truncate, still a floor. The second commit's re-taken anchor is safe (the jumped day, 0–1 dot clear; a jump to an
undrawn month still clears it; null drops it; the phone's jump window keeps 'edge'). Month buttons, Approvals, the bell,
the period picker and the hidden-grid jump all go through `jumpTo`/`landOnEdge`; the phone's rolling window and flick
untouched. Speed: one `scrollLeft` read in the scroll handler while the mark is set; passive document listeners; about
nine layout reads once per jump. Nothing touches saved data (D56).
