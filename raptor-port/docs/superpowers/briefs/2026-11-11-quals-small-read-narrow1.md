# Two small Quals fixes — the narrow read of the fix round, by a fresh Opus reader (11 Nov 26, chat 64, job 3)

Its brief: `2026-11-11-quals-small-read-narrow1-brief.md`. The report as it arrived, saved whole.

**Narrow read: Quals fix round (diff 7765901d1 → c242ba658)**

F1 and F2 are right and complete as stated. F3 is fixed only when a redraw leaves the column widths unchanged.

**Finding 1 (low–medium). F3 is incomplete: a resize that changes the column widths still wipes the picked-up look.**
- **Case:** an admin on a desktop wider than the table's least width, in Edit quals, scrolled down. He presses a pinned heading, drags it, and the window's width changes mid-drag (he snaps the window, or the browser docks a side panel).
- **What happens instead:** the code's own comment above the resize watch says columns share out extra width on such a desktop. So the resize handling measures new widths and sets new pinned-row state. The `<col style="width:…">` text inside `pinnedHtml` (QualsPage.tsx ~481) then differs, `pinnedInner` becomes a new object, and React 19 sets the markup again. The `qdragging` class on the pressed heading is lost and `over` now points at a removed cell, so the landing mark is gone until the next move. The drop still lands, because it reads `over.dataset.col`.
- **Not caught:** the new F3 test only fires a resize event and changes the height at a 1000px width, where the table overflows and the widths never change. A store change that reflows a column mid-drag (the heading-cell watch) has the same effect.
- **Fix:**
  1. In the drag effect, set `reapplyDragRef.current = () => { if (!from) return; mirrorRef.current?.querySelectorAll(`th[data-col="${from}"]`).forEach(t => t.classList.add('qdragging')); if (over && !over.isConnected) { const k = over.dataset.col; over = null; const n = mirrorRef.current?.querySelector(`th[data-col="${k}"]`) as HTMLElement | null; if (n) { over = n; n.classList.add('qdrop') } } }`.
  2. Clear the ref in the effect's cleanup.
  3. Add `useLayoutEffect(() => { reapplyDragRef.current?.() }, [pinnedInner])`.
- **Test that fails today:** copy "the page drawn again during a drag begun on a pinned heading…". Open at `{ width: 2400, height: 900 }` and first assert the table is narrower than its wrap (otherwise skip). Mid-drag, call `page.setViewportSize({ width: 2100, height: 900 })`, wait 500ms, move the mouse 1px, then `expect(await look()).toEqual({ held: true, lit: 1, frames: 1 })`.

**Suspicions I could not turn into a realistic case**
- **Frame-wait race (F2):** the ask is marked spent before the deferred trip runs. If the row is hidden again within that frame (two filter edits under 16ms apart), the trip finds no row and the ask is lost. A newer ask that trips at once inside that frame is then overridden by the older deferred trip. Cheap guard: in `trip`, if no row is found and `backWent.current` still names this ask, reset it to `null`.
- **Frame-wait on WebKit (F2):** only desktop Chromium drives it (the Ctrl+A, Backspace walk). Whether iOS brings the caret back into view within that one frame is unverified.
- **Mouse or pen during a finger drag (F1):** that press is primary for its own pointer type, so `onDown` silently takes the drag over (new `from` and `pid`) without cancelling the first. Only possible on touchscreen laptops.

**Checked, no finding**
- **F1 ownership:** stray moves, lifts and cancels are ignored; `pid` is set fresh on every down. After a second finger cancels, the first finger's moves and lift write nothing.
- **F1 cancel paths:** `cancel` always clears the lift frame, the landing mark, the picked-up look on both rows and the edge scroll.
- **Table's own heading row:** its only changes are that a lost pointer now cancels instead of dropping, and a second finger now cancels even where the pinch cannot start (tablet width). Both are improvements.
- **F2:** a newer ask replaces an older one; a spent ask never trips twice; leaving the page drops the ask; the deferred trip after the page closes finds no row and does nothing. Undo and Redo while he is hidden make no trip, and one trip comes when the filter is cleared.
- **F3 kept markup:** it is rebuilt from every input each render (column order, sort marks, ✕ armed, editing, tab, rename, role), so it can never be stale. The press handlers are on the container, not in the markup.
- **Tests:** none is hollow. Each new unit test and walk test would fail with its fix reverted. Not covered: the width-changing redraw, the frame-wait race, and WebKit fingers.

**Two fingers, pinned row against the table's own row**
- **Table's own heading row, at phone width:** the second finger cancels the drag and the table pinch-zooms, as before.
- **Pinned row:** the second finger cancels the drag and nothing else happens. The strip and the Edit-quals headings refuse all browser gestures (`touch-action: none`), so neither the table nor the page zooms. The row stays still, and lifting either finger writes nothing.
- **Tablet or touch desktop (wider than phone):** both rows now behave alike. The drag is cancelled and nothing zooms.
