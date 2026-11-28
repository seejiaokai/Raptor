# The fresh blind Opus read of the walk fixes — `c2bcdb990` (23 Nov 26)

Brief: `2026-11-23-msq-view-only-fixread4-brief.md`. Blind to the handoff, the walk and the other readers. Test in the
session scratchpad (`rt4/r1-stale-spare.scratch.test.tsx`), reproduced by the host (chat 151); Astra found the same.

**1. The spare can be left set after a press that never clicks, and it then eats the next keyboard click on a menu
button (introduced by this fix).** With the ☰ list open, a press outside the list that brings no click (a finger that
slides — the browser cancels it; a right mouse button on a narrow desktop) closes the list; then Enter or Space on Logout,
"Switch to the member view", the mark or a squadron row does nothing — only a second press acts. Cause: `ui/Drawer.tsx`
Drawer's new click capture reads `pressClosedList()`; the note is cleared only by a pointerdown inside the menu or a click
that reads it, and a keyboard's click has no pointerdown, so it finds the stale note and is stopped before the button
(before the fix the note was read in the bubble handler, after the button had acted). Fix: clear on keydown, or spare only
a pointer's click (`e.detail > 0`). **Fixed in `a385c40f9`** (a pointer's click only), red first.

**Checked and found right:** fix 1 spares the click of the press that closed the list wherever it lands, and the next
press acts; a row of the list and the mark are not affected; Escape and focus leaving never set the note; no click spared
twice; the capture stops nothing other parts listen for. Fix 2: both Discard answers go through the one step; no other
caller of the old lines; "● saved" stays hidden in a browser that keeps nothing, after a failed save, after a refused save
(refusedLatch keeps the red words); on sign-out the session end clears the words; no crash.

**Outside this change (filed):** the Tracker's other Discard, `leaveFlowEdits` ("Discard them and add a course?",
"…rename the course?"), clears the unsaved flag without reloading the chart; if the next prompt is cancelled, `addCourse`
and `renCourse` return early — the dropped edits stay drawn, marked saved, and the bar can keep its stale words. Older.

**Tidiness (filed, not fixed):** 1. The note is a module-level variable set in the squadron head's effect and read by the
menu — a ref held by Drawer would give it one owner. 2. `discardChartEdits`'s comment calls "● saved" the resting words;
after sign-in the resting state is blank — "the words a stored chart shows". 3. The comment above `PRESS_CLOSED_LIST`
carries three rounds of history; trim to the rule as it stands.
