# The narrow read of the fixes — claude/lw-doubletap-more, a9d6937a0..65e90282c (a fresh, blind Opus reader, 15 Nov 26, ~07:15)

Its brief stayed in the night's scratch folder (job3/read-narrow-brief.md). Read only; doubletap-more.test.tsx 30/30.

**No findings.**

1. **The key counter** (gridguard.ts 23–28; Matrix.tsx 1556, 1581, 1585). It sits on the window's capture and loads with the Leave War's chunk, before any window's own Escape or Enter listener. The pad's Escape (FlyEdit 203) and the rest are added later.
   - Only stopImmediatePropagation on the window's capture, added earlier, could stop it. The only ones are caldrag.ts 403 and InputsCal 197, 820, 918, which are Inputs or SANS screens.
   - A key the person never meant only drops a press. It would have to land in the one frame between a ✕'s release and the close.
   - Never cleaned up: harmless, because each check compares counts.
2. **The slim bar** (LeaveWarPage 87–88). "Back ▴" arms the guard, but the grid is then hidden. Leaving the Leave War, a period change or a tab change all start outside any window. The window-press list is read only by Matrix.
3. **The Calendar window** (sync.ts 3304–3309). Its flag follows the window from every opener and its own close. DaysWindow 103 clears it for a non-admin without telling the store, which is unreachable (D785). A close on another page arms the hidden grid for 600 ms, and nothing is eaten. It is a rider on sync.ts, not a fifth seam.
   - Doc note: `.claude/rules/seams/leave-war.md` (the two doors) and performance.md §E (the memo firewall untouched) do not name this read.
4. **The tests:** none hollow. The 650 ms waits are safe on a slow machine.
   - One weakening: the landing test went from a finger to a mouse (test 311), so nothing covers a finger landing a move followed by a tap near it. Keep both versions.
5. **Tidiness** (filed):
   - Matrix's own document key listener (1590, 1594) duplicates the counter.
   - The browser test's `behind` selector is a hand-kept copy of the window-press list that already differs from it.
   - The freshness comment has two stacked layers.

Verdict: the three fixes do what the promise says.
