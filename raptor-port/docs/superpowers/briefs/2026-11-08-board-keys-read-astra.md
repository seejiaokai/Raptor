# The blind code read of the board-keys job — Astra (8 Nov 26)

Astra's report (`codex exec -m gpt-6-astra`, reasoning high, read-only), word for word, as it came back. Its brief:
`2026-11-08-board-keys-read-brief.md`; the read of commit `24549f120`. What was done with each finding: the evidence sheet,
`raptor-port/docs/handpass/2026-11-08-board-keys.md`.

---

1. **Medium — Down on ⋯ can leave two menus open, then Escape closes both.**  
   Cause: [SchedBoard.tsx:602](/C:/Users/User/projects/Raptor/.claude/worktrees/dreamy-maxwell-a0acf7/raptor-port/src/ui/SchedBoard.tsx:602).

   At a width of 820px or less, click **+ Block**, then use Shift+Tab to reach **⋯** without clicking elsewhere. Press Down. The new handler opens ⋯ directly, bypassing the click that normally dismisses the older menu. Both remain open. Press Escape: the older menu’s shared Escape listener and ⋯’s separate listener both run on the document, closing both. `stopPropagation()` does not stop another listener on that same document.

   **Fix:** keep the existing “already open → focus first item” branch; replace the closed-menu branch with `e.currentTarget.click()`. The click handler already recognizes Down through `pressedByKeys`, and the ordinary click closes the older menu. Add the exact sequence above as a regression test.

   An isolated DOM check using the actual handlers confirmed two menus after Down and neither after Escape.

2. **Medium — Down on Templates can enter another button’s menu.**  
   Cause: [interactions.ts:953](/C:/Users/User/projects/Raptor/.claude/worktrees/dreamy-maxwell-a0acf7/raptor-port/src/ui/interactions.ts:953), reaching the unconditional existing-menu branch at line 962.

   On the phone-width Scheduler Board, click **+ Block**, then Shift+Tab to the day bar’s **Templates** button. Press Down. Focus enters the still-open **Add a duty block** menu; Templates never opens. Enter can consequently add a duty block instead of choosing a day-template action.

   Adding `[data-daytpladd]` exposes this button to a router that treats *any* `.wavemenu` as its own. The isolated comparison confirmed that the parent leaves focus on Templates, while this commit moves it into the duty-block menu.

   **Fix:** record each menu’s opener when `menuKeys(box, anchor)` registers it. Reuse an existing menu only when its recorded opener resolves to the pressed button; otherwise call `b.click()` so the existing replacement path opens the correct menu. Test both “Templates already open” and “another menu open.”

Questions:

- **Can a return to the first page supersede its saved glide landing?** Start a forward cross on Edit Schedule, switch to View-only Sched and cross backward, then return to Edit Schedule before the burst finishes. The page-switch code carries Sunday onto Edit Schedule, but [weekglide.ts:280](/C:/Users/User/projects/Raptor/.claude/worktrees/dreamy-maxwell-a0acf7/raptor-port/src/ui/weekglide.ts:280) still writes that root’s earlier Monday landing. The new map is updated only by another glide. This needs an app-level case establishing the final visible day; the isolated cleanup checks do not settle it.
- **Does Shift+Tab onto ⋯ itself count as leaving the menu?** The wrapper’s blur check keeps the menu open because its opener is inside the wrapper. This behavior existed before the change and is not counted as a regression. If the brief requires immediate dismissal there, close when focus leaves the menu’s own boundary.

For each of the five parts:

1. **⋯ menu:** Apart from finding 1, I found no additional defect in Enter/Space opening, first-item focus, arrow wrapping, skipping disabled Sort all, keyboard picks returning focus before opening a window, ordinary Escape, forward Tab dismissal, outside clicks, or toggle clicks. `pressedByKeys` retains the previous matching-and-consumption logic; pointer-down and mouse-down clear it. Board closure and normal day/layout changes revealed no additional regression. Insights and Sort all already hold keyboard focus and cover the bar, so forcibly focusing ⋯ behind them would not demonstrate an ordinary user route.

2. **Templates:** Apart from finding 2, the new selector reaches the existing day-template click path. I found no second production renderer of `data-daytpladd`, changed permission gate, or new write path.

3. **Glide:** Twenty-three isolated ordering cases passed, covering one to three starts across one or two roots, every finish permutation, distinct existing styles, latest glide landing per root, transition completion followed by fallback, a subsequent burst, and an unused returned `run`. No counter imbalance, retained map entry, or failed style restoration appeared. These checks used mocked geometry; the page-return question above remains separate.

4. **Tests:** The new cases cover the ordinary paths but miss both menu sequences above. They also lack Space activation, mixed mouse/keyboard picks, disabled-item navigation, backward Tab exit, and Sort all’s return-focus round trip. The two-page glide test asserts neither root’s landing, and its unstubbed scroll dimensions make the Sunday target zero. Add distinct nonzero landings, out-of-order finishes, distinct overflow baselines, and the page-return case. The normal unit runner was blocked before executing any tests because it could not create temporary files in this read-only session; the isolated DOM checks were run in memory.

5. **Tidiness:** No separate low-ranked finding in the changed lines. Extracting `pressedByKeys` preserves one shared implementation; the per-root map has a clear cleanup point.

No files changed. No build or browser run. Rulings: none this session.


