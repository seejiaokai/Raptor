# The blind code read of the board-keys job — the fresh Opus reader (8 Nov 26)

The reader's report, word for word, as it came back. Its brief: `2026-11-08-board-keys-read-brief.md`; the read of commit
`24549f120`. What was done with each finding: the evidence sheet, `raptor-port/docs/handpass/2026-11-08-board-keys.md`.

---

FINDINGS

1. LOW: the glide can put a week back on a day it has since left (raptor-port/src/ui/weekglide.ts, lines 251–253 and 277–285).
Failing sequence: at a phone's width on Edit Schedule, swipe past Sunday into the next week (a Monday cross). While that slide is still running, tap View-only Sched and swipe back past its Monday (a Sunday cross; View-only now shows Sunday of the first week). Before View-only's slide ends, tap Edit Schedule again. The page switch carries Sunday across, so Edit Schedule's week repaints on Sunday. When the burst's last slide finishes, the restore loop writes Edit Schedule's held landing back into it. That landing is the Monday spot recorded at its own cross, now applied to a different week, so the person, who was looking at Sunday, is jumped to Monday. View-only's re-land does nothing, because its page is now hidden.
Cause: the new loop re-lands every week the burst touched. A week other than the last one crossed can only be on screen at the end if a page switch brought it back after its cross, and that switch already landed it on the day it carried. Re-landing it is either a no-op (its page is hidden) or wrong (this case).
Fix: put the scroll back only on the most recently crossed week, and put every week's touches and scrolling back. Keep `let lastRoot: HTMLElement | null = null`, set `lastRoot = root` in run() after `held` is filled, and in finish:
`for (const [r, kept] of held) { if (r === lastRoot) { const wasSB = r.style.scrollBehavior; r.style.scrollBehavior = 'auto'; r.scrollLeft = kept.landed; r.style.overflowX = kept.ox; r.scrollLeft = kept.landed; r.style.scrollBehavior = wasSB } else r.style.overflowX = kept.ox; r.style.pointerEvents = kept.pe }`, then `held.clear(); lastRoot = null`. Correct the comment above it ("Each week re-lands on ITS most recent cross's target"). Pin it with a case: two-page burst, then set `edit.scrollLeft` to a carried value before the last finish, and expect it unchanged afterwards.
It is only reachable by hand at speed: three gestures inside about 0.75 s. It is also strictly better than the code before this change, which left that week untouchable. Hence low.

2. LOW, before this change (the change extends it to one more button): ↓ on the day bar's Templates goes into another button's menu if one is already open (raptor-port/src/ui/interactions.ts line 960, `const up = document.querySelector('.wavemenu')`).
Failing sequence: phone-width board in a desktop browser. Click + Block; its menu opens and Chromium leaves the keys on + Block. Shift+Tab up to the day bar's Templates; the + Block menu stays open, because only a Tab inside a menu closes it. Press ↓: the keys land on + Block's first template, not Templates' menu. Enter then adds a duty block.
Cause: routeMenuKey goes into whatever `.wavemenu` is open, without checking that it hangs from the pressed button. Every MENU_BTN already behaved this way; `[data-daytpladd]` now joins them.
Fix: popMenu and openStoresMenu record their anchor on the box (`(box as any)._anchor = anchor`). In routeMenuKey, go into `up` only when `(up as any)._anchor === b`; otherwise `b.click()` (popMenu already removes other open menus as it opens).

3. LOW, test gaps (the new cases would not see these breaks):
- weekglide.test.ts "a burst over two pages" never checks each week's own landing. In jsdom, weekLanding returns 0 for both the Monday and the Sunday cross (scrollWidth and clientWidth are 0), so a regression to one shared landing for all weeks passes. Stub `scrollWidth`/`clientWidth` on `viewWk` (for example 2730 and 390), so its Sunday lands at 2340. Then assert `viewWk.scrollLeft === 2340` and `edit.scrollLeft === 0`, plus the finding-1 case.
- There is no out-of-order case across two weeks (the second week's `transitionend` firing before the first week's fallback). It works today but is not pinned.
- boardmenukeys.test.tsx: nothing pins that a mouse pick leaves the keys where they were. If `morePick` always called `moreBack`, or the Escape listener always did, every case would still pass, because the mouse pin's keys are already on ⋯.
- Missing: Sort all picked by the keys, with the keys back on ⋯ after the Sort all box closes (only Insights is covered).
- Missing: a previewed day (`DPREV.set(SBDAY, …)`) where ↓ from Insights skips the disabled Sort all to the layout switch. Dropping the `!b.disabled` filter in `moreItems` passes every case.
- Space opening ⋯ is never pressed: `pressByKeys` sends Enter only.

4. LOW, tidiness of the changed lines (filed, not fixed):
- weekglide.ts lines 67–78: the old paragraph "OVERLAPPING GLIDES share ONE baseline … restored ONCE … to the MOST RECENT cross's landing … the only writer of these two styles" still stands above the new "ONE BASELINE PER WEEK" paragraph that contradicts it. It also speaks of two styles where there are three: the week's touches, the week's sideways scroll and the page's clip.
- weekglide.ts line 277: in `for (const [r, h] of held)`, `h` shadows the clone-height `h` of line 232 in the same closure. It is harmless but misleads; rename it (for example `kept`).
- SchedBoard.tsx line 98: `moreItems` re-implements sheetfocus.ts `menuItems` (line 247) without its `[hidden]` filter, and the ↑/↓ round at lines 607–613 is a third copy of menuKeys' (LogicPage has another). Exporting `menuItems`, or a small `arrowThrough(list, key)`, would keep them one.

QUESTIONS (not made concrete enough to be findings)
- On the board, Tab-out now behaves two ways. The string menus (menuKeys) close on Tab past the last item or Shift+Tab before the first, and give the keys back to their button. The ⋯ (like the week's ⋯) lets Tab carry on to the next stop, and Shift+Tab from its first item leaves the menu open with the keys on ⋯. Both follow a pattern the app has; D754's "behaves the same everywhere" may want one.
- Holding Enter on ⋯ past the key-repeat delay opens the menu and then picks its first item (Insights). The repeat lands on the newly focused item, and nothing ignores `e.repeat`. The string menus have done this since the D1646 batch, and there the first pick can be a write (+ Block adds a block). This was before this change for those menus; new, but harmless, for ⋯.
- Before this change: widening a narrow window past 820 with the ⋯ menu open hides it (`.sb-morewrap{display:none}`) but leaves it mounted. The next Escape is eaten by the invisible menu, and boardescape's overBoard() also sees `#sbMoreMenu`, so the board needs a second Escape. A mouse-opened menu already did this.

WHAT I CHECKED AND FOUND NOTHING IN

Part 1 — the ⋯ menu (SchedBoard.tsx 90–135 and 590–622, sheetfocus.ts keyOn and pressedByKeys, boardescape.ts, Modals.tsx InsightsModal, SortAllDialog, ScheduleInsightsMenu.tsx):
- Opening by Enter (click on keydown), Space (click on keyup) and ↓ (onKeyDown, preventDefault) each lands on the first enabled item through the layout effect. A mouse or finger open has its pointerdown or mousedown clear keyOn, so nothing moves.
- ↓ on ⋯ with the menu already open goes into it. ↑/↓ wrap and skip disabled items. Enter on ⋯ when open closes it.
- Escape: the board's window-capture `down` sees `#sbMoreMenu`, so it wants nothing. The menu's document-capture listener stops propagation, so the board's bubble-phase close never fires. The keys go back to ⋯ only when they were in the menu, and are already on ⋯ otherwise.
- A pick by the keys focuses ⋯ before Insights or the Sort all box opens. useSheetFocus then records ⋯ as "where it was" and gives the keys back on close (verified for both).
- A mouse pick after a keys open: pointerdown clears keyOn and nothing moves, as for the mouse. A keys pick after a mouse open works by Tab or ↓ then Enter.
- The wrapper's onBlur only closes on a real move outside (relatedTarget non-null and outside). Moves between ⋯ and items, item removal (relatedTarget null) and clicks on non-focusable menu padding do not close it. Tab from the last item reaches the search box. keepTabOnBoard does not intervene, because the item is in the board and not its last stop. Shift+Tab past ⋯ reaches the highlighter and closes the menu.
- A stale keyOn survives only until the next keydown or pointerdown, so only a click with neither before it could misread it.
- The new listeners take nothing the app relies on. React's onKeyDown handlers preventDefault, so routeMenuKey (document bubble, checks defaultPrevented) stands aside. routeKeyDown and routeOpenKey do not match these buttons. No other ArrowUp/ArrowDown handler applies. The Escape listener's stopPropagation is unchanged from before.
- The menu cannot coexist with Insights, the Sort all box (both shaded), a `.wavemenu`, the bell's list or a calendar: each open path closes the other. The board closing or changing day with the menu open needs a pointer (which closes the menu) or the keys leaving it (which also closes it).
- The layout-switch pick keeps ⋯ mounted and visible in both layouts at ≤820.
- Both test files pass locally (33 and 16 cases).

Part 2 — Templates in MENU_BTN: `[data-daytpladd]` is drawn only by board.ts line 142, is withheld on a frozen preview, and is only on Edit Schedule (the routeMenuKey gate). routeMenuKey's `b.click()` reaches board.ts line 1126 → dayTplMenu → popMenu → menuKeys, whose pressedByKeys sees the ↓ keydown's target, so the keys land on the first pick. Shift+↓ and modified keys are excluded. Nothing wrong beyond finding 2.

Part 3 — the glide: no week is ever left covered or unscrollable, and the page is never left clipped, whatever the order of starts and finishes:
- Each week's touches and scroll setting are taken at its first cross of the burst and never re-read from already-set values. The page clip is taken once per burst.
- The restore runs only at the last finish, whatever the finish order. `done` guards transitionend and the fallback timer both firing.
- A glide whose run() is never called takes nothing: `held` and `inFlight` change only inside run(), and EditWeek and ViewWeek have no early return between beginGlide and run.
- `held` is cleared at every burst end, and every run() always schedules its finish, so nothing leaks into the next burst.
- This module is the only writer of these styles.
- The hidden page's re-land is a no-op (display:none), and the page switch's carried day lands it correctly later. The one stale-day order is finding 1.

Part 4 — tests: the menu cases pin the open, arrows, Escape, keys-pick-to-⋯, Insights round trip and Tab-out (via focus) paths, and the glide case pins both weeks' touches and scrolling, the page clip, clone clean-up and a clean next burst. The gaps are listed in finding 3.

Part 5 — tidiness: the gaps are listed in finding 4. pressedByKeys is a clean extraction: menuKeys behaves exactly as before, and its doc comment is accurate.
