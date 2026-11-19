# Chat 112's fix read — Astra's read (Codex, GPT-6 Astra, read-only, 19 Nov 26)

Read of an exported copy of `claude/lw-monthjump-click` at `ae4c632a3`, brief `2026-11-19-lw-monthjump-click-read-brief.md`. Blind to the walk and to the other reader. Saved unchanged below. Host's disposition: finding 1 confirmed by reading the code path and fixed (reanchorPlan, a scroll since the note kept), held by reanchor.test.ts.

---

**The fix is not complete: one medium-severity timing defect remains.** A redraw can undo deliberate sideways scrolling and then mistake the restored position for the grid’s own unchanged landing.

Read-only review of the exported copy identified by the brief as `ae4c632a3`, using both supplied commits. I read no other report from this review round. No post-compaction handoff was supplied. No files changed.

**1. P2 — A waiting redraw can pull the grid back after the person scrolls**

Location: `Matrix.tsx`, the landing listeners, `onWrapScroll`, and the anchor layout effect around lines 3274–3295.

The redraw remembers a date and its screen position, but not the scroll position when that memory was taken. If the person scrolls before the redraw commits, the correction treats their movement as a layout change and reverses it.

The new scroll-event comparison is too late when the redraw runs first. `landOnEdge` restores the old landing and updates `ownLeftRef`; the subsequent scroll event sees those matching positions and leaves the landing marked active.

**Concrete proof:** I executed the actual extracted listeners and layout callback in memory, with controlled geometry:

1. A desktop jump lands at scroll position **6380**, with its day **0.53px** clear of the frozen columns.
2. A row redraw has already remembered that position.
3. ArrowRight occurs, and scrolling advances **1px**, to **6381**.
4. The redraw commits before the scroll event.

Expected: retain **6381**. Reviewed code: restores **6380**, with the landing still marked active.

The same replay against the previous implementation, reconstructed in memory from the supplied patch, retains **6381**: its key listener clears the landing, and its ordinary correction ignores a one-pixel difference. This narrow regression is introduced by the change.

Larger movements reveal an older part of the same defect. At 125%, a controlled **18.4px** movement was reversed even when the scroll event cleared the landing first: the ordinary correction still restored the stale screen position. Thus early wheel or scrollbar cancellation alone does not resolve the race.

**Exact fix:**

- Record `scrollLeft` alongside each remembered anchor’s date and screen position.
- Before applying either correction, calculate movement since that anchor was recorded.
- When intervening scrolling occurred, clear the landing and preserve that movement. Compensate only for the layout change: adjust the remembered screen position by the intervening scroll distance before calculating the correction.
- Keep the second commit’s refresh of a waiting anchor after a new jump.
- Add integration tests for both orders—scroll event before and after redraw—including a one-pixel movement, an edge-drag step, and an unrelated click that must preserve the landing.

The callback failure is reproduced. Its frequency through native keyboard scrolling or dragging still requires host browser reproduction; this was not a browser walk.

**Explicit negatives and coverage**

| Case | Result |
|---|---|
| Ordinary clicks and non-scrolling keys | No longer directly clear the landing. No separate defect found. |
| Shift+wheel and horizontal trackpad input | Clear the landing early when targeted inside the grid. A previously captured anchor remains vulnerable to finding 1. |
| Native and proxy scrollbars | Cancellation paths exist. No separate defect established; they do not invalidate an older anchor. |
| Arrow/Page keys and Tab-induced scrolling | Actual movement is recognised by the scroll handler, but recognition can arrive too late. Keys that move nothing appropriately preserve the landing. |
| Move and drag-selection edge scrolling | Their writes reach the wrapper’s scroll handler; finding 1 applies before delivery. Rearrange’s inspected edge scrolling is vertical. |
| Phone flick | Touch-start cancellation and the coarse-pointer restrictions remain. No additional regression established; real-iPhone inertia was not tested. |
| Ctrl+wheel and pinch | No separate defect proved. A vertical Ctrl+wheel does not immediately clear the landing; resulting sideways movement is recognised later, subject to the same timing gap. |
| Month, Approvals, bell and period jumps | Inspected routes converge on the shared jump path. The waiting-anchor refresh addresses the stated old-anchor-after-new-jump sequence. No additional route-specific defect found. |
| Scaling and speed | Arithmetic checks at 100%, 110%, 125% and 150% found no separate rounding defect beyond the deliberate tiny tolerance. No new per-scroll rectangle measurement or React update was added. Browser geometry and performance remain unmeasured here. |

**Checks and limitations**

The focused Vitest command stopped before executing tests because its configuration module runner closed while loading the test sequencer. This is **not a test pass**.

As a separate check, the existing nine helper-test bodies ran in memory with Node assertions: **20 assertions passed**. The failing timing replays also ran entirely in memory. Neither substitutes for the browser tests.

Tidiness: no unrelated abstraction or duplicated rounding calculation found. The ownership check and anchor correction need one consistent account of intervening scrolling, as described above.

**Walk: NOT DONE — read-only code review; browser and device reproduction remain owed.**  
**Rulings: none this session.**

