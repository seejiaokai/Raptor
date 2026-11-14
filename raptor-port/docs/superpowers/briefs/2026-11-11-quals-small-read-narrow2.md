# Two small Quals fixes — the narrow read of the second fix round, by a fresh Opus reader (11 Nov 26, chat 64, job 3)

Its brief: `2026-11-11-quals-small-read-narrow2-brief.md`. The report as it arrived, saved whole.

**No findings.** All four fixes are right for the findings as stated. I read the diff whole, plus the trip effect (lines ~340–399), the pinned markup and `reapplyDrag` layout effect (~507–518), the whole drag wiring (~650–808) and the pinned row's handlers (~1240–1275) at 8ed7b7688.

What I checked:
- **G1.** `reapplyDrag` works by column key, so a changed column order still marks the right heading. If the dragged or landing column is removed, its query returns null and nothing is marked. It returns at once once the drag has ended (`!from`), and it is cleared on the wiring's cleanup. It only puts the picked-up look on the pinned row when the drag began there (`fromPinned`). It never touches the still name copy, since name headings carry no `data-col`.
- **G2a.** An ask the trip found no row for is only spent again on a later repaint that draws the row. That is the existing "hidden by the filter, the ask waits" rule, not a new surprise. Cannot trip twice: the effect returns while `backWent === backHl`, and a frame that finds a row spends it.
- **G2b.** The cancel runs on every render where the waiting ask is not the current one. The trip guard and the unmount cleanup both hold. I checked the page-left test: with the cleanup reverted, the old instance's frame finds the new page's row of the same name and trips, so the test fails as it should. Not hollow.
- **G3.** Cancelling needs `from` to be set, so a press after a finished drag, a tap that sorts, or the same pointer's own move or release are untouched. A press on ✕ during another pointer's drag now cancels the drag and then arms through its click, which is acceptable. Nothing is left on screen: `cancel` takes down the frame, the picked-up look, the landing mark and the edge scroll.
- **Hollow tests.** The G1 first e2e test, the G2a test and the G3 unit test each fail with their fix reverted.

**Suspicions (not cases):**
1. **Test gap, G2b.** The "newer ask" test passes with the `cancelAnimationFrame` line reverted, because the trip guard alone stops the old trip there. The cancel is only needed when the newer ask's row is not drawn: then `backWent` still holds the older ask and its frame would take the page to the older man. Suggested test: with the trip waiting for 'bane', type a filter that hides 'stiff', then `focusQualsRow('stiff'); notify()`, run the frames, and expect `went` to equal `[]`. It fails with the cancel line removed.
2. **G1.** If the pinned row disappears mid-drag (scrolled up, or the window resized so the row is no longer pinned) while the landing mark is on it, `reapplyDrag` sets `over = null`. A release before the next move then writes nothing, where before it dropped on the last-marked column. This is probably better, but no test covers it.
