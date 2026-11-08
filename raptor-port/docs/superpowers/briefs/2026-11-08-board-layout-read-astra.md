**Two findings need the host’s browser reproduction before acceptance.** Both concern the new sideways scrolling mode. I found no additional source defect in the narrow row layout or keyboard-ring changes.

I reviewed the requested branch diff and its callers. I changed no files, ran no build or tests, and opened none of the excluded evidence, pictures or reader reports. The source under review remained unchanged during this read.

**1. P2 — The last editable box cannot get the extra scrolling room it needs above the keyboard.**

**Setup and action:** On the default board at **874 × 402**, with touch and a coarse pointer, put an editable section last, scroll to the bottom, and tap its last text box. Open the keyboard while the document and board have no ordinary scrolling room left.

**Failure:** The box can remain beneath the keyboard. The helper that supplies extra room explicitly rejects the board itself as its scrolling container.

**Expected:** The tapped box should rise above the keyboard, with the board retaining its full height and no window-style translation. This follows D1048, D1780, D1081 and D1412.

The new rule in [10-board-history.css:176](C:/Users/User/projects/Raptor/.claude/worktrees/pr-leave-war-4988a8/raptor-port/src/ui/scheduler/10-board-history.css:176) makes the board root scroll and makes its former scrolling wrapper overflow visibly. Ordinary keyboard scrolling finds that root correctly. However, [kbscroll.ts:272](C:/Users/User/projects/Raptor/.claude/worktrees/pr-leave-war-4988a8/raptor-port/src/ui/kbscroll.ts:272) walks up to the keyboard layer and then returns immediately when `p === layer`. In this layout, the layer **is also the required scroller**.

The new browser test exercises an earlier input with content beneath it. It does not reach this exhausted-scroll case. The existing last-box keyboard test covers the previous layout.

**Exact fix instructions:**

1. In `panelRoom`, retain the ancestor search.
2. Replace its unconditional rejection of `p === layer` with a guard that allows a scrolling board layer:
   ```ts
   if (!p || (p === layer &&
       (!p.hasAttribute('data-kblayer') || !scroller(p)))) return 0
   ```
3. Keep the existing padding calculation, `ROOMED` registration, scrolling and cleanup. Keep page scrolling first; do not translate or shorten the board.
4. Add a regression where the board root is the scrolling layer and its scroll position is already clamped at the end. Verify that it receives extra room, brings the field into view and loses that room when typing ends.
5. Add the sideways equivalent of the existing `KS7` browser case. Its room assertion must include the board root, rather than searching only its descendants.

**Exact host reproduction:** Use the existing keyboard stand-in at **874 × 402**, `isMobile: true`, `hasTouch: true`, with the desktop-layout switch off. Move Overall Notes to the end and add a note if necessary. Scroll the board root fully down; select the last note box and first assert that its bottom lies below **202px**. Tap it, then reduce the stand-in visual viewport from **402 to 202**, keeping `offsetTop = 0`.

The failure is demonstrated if the field remains below **194px**, with the board at its scrolling limit and no extra room added. After correction, assert that the field clears that boundary, the button bar remains reachable, the board has no translation or height cap, and the added room disappears when the keyboard closes. Repeat on the real iPhone to judge motion; the stand-in cannot establish D1412’s smoothness.

**2. P2 — An unmoved floating window can cover the buttons when the heading scrolls back into view.**

**Setup and action:** At **874 × 402**, scroll the default touch board until its heading has disappeared. Open History without moving its window. Then scroll the exposed board back to the top.

**Failure:** The window remains at the position chosen for the collapsed heading. As the heading returns, the board’s buttons move down behind it. The same missing update affects ALL AVAIL.

**Expected:** A window the user has not moved should continue clearing the board’s bar, keeping the bell, Insights and Done reachable—D1106, now interacting with D1780.

Opening a window while the head is already scrolled away is handled correctly: placement measures the bar’s actual rectangle. The missing case is **scrolling afterwards**.

In [floatwin.ts:139](C:/Users/User/projects/Raptor/.claude/worktrees/pr-leave-war-4988a8/raptor-port/src/ui/floatwin.ts:139), placement runs on rendering, window resizing and the existing observers. Nothing calls it when the board root scrolls. Returning the heading changes its position without changing its size, the window’s size or the preview panel’s children. Both Changes and ALL AVAIL use this shared hook.

**Exact fix instructions:**

1. In `useFloatWin`’s listener effect, subscribe to the current board root’s `scroll` event while the window is open.
2. On that event, call the current placement function for desktop-style windows whose position still belongs to the app. Include resized-but-unmoved windows; preserve deliberately moved windows.
3. Reuse `place()` and its existing bar measurement and height-cap logic. Do not calculate a second fixed bar height or reset the user’s chosen dimensions.
4. Remove the listener on cleanup. If calls are coalesced through an animation frame, cancel the pending frame too.
5. Add the sequence “collapse heading → open window → reveal heading” for Changes and ALL AVAIL. Also cover resized-but-unmoved and manually moved windows.

**Exact host reproduction:** Use a fresh session at **874 × 402**, touch/coarse pointer, default board layout. Scroll the board root to **600px**, open History, and leave its window untouched. Scroll back to zero using the exposed left side of the board.

Measure the window and bar after scrolling, and hit-test the centres of the bell, Insights and Done. A window overlapping the returned action row, with a hit landing on the window instead of its button, demonstrates the failure. After correction, an overlapping default window should start at least **8px below the bar**. Repeat with ALL AVAIL, then with a window resized but never dragged. A deliberately moved window should retain its chosen position.

**Coverage and explicit negatives**

The following are source-read conclusions, not browser passes. I checked the specialised cases before the common layout.

| Area, visible door and gesture | Result |
|---|---|
| Last editable box; keyboard opens at the end of the day | Finding 1. Ordinary ancestor scrolling supports the new root; the extra-room fallback does not. |
| Changes and ALL AVAIL; opening with the heading already collapsed | No defect found in initial placement. It measures the actual bar and excludes floating windows from the underlying-bar hit test. Subsequent scrolling is Finding 2. |
| Other floating windows using the shared hook | Same placement dependency. The shared correction should preserve their existing default, resized and manually moved cases. |
| History’s gold dots and bubbles; scroll, then change day or redraw | The document’s capture-phase scroll listener receives root scrolling and repositions bubbles. Day changes close the bubble; redraws recheck its target. No additional missing listener found. |
| Warning taps, selected-person warnings and Changes-row jumps | Their target lookup does not require the wrapper to remain a scroller. Native scrolling can reach the new root, whose scroll padding reserves the pinned bar. No additional source defect found. |
| Newly added row, wave, note and block rings | Decoration finds the live board’s elements and does not depend on the wrapper’s scroll position. No new defect found. It does not itself perform the jump claimed by the new CSS comment. |
| Undo/redo | No new scrolling call was introduced. The already-filed same-day, out-of-view undo issue remains separate; I have not reported it again. In-view position preservation still needs the host’s runtime check. |
| Puck dragging from the roster and between seats | The touch path can discover the new root. Its edge calculation now starts beneath the visible bar. No additional missing caller found. |
| Row, wave and section dragging | Their ancestor search reaches the root and their edge calculation uses the same visible-top helper. No additional source defect found. Actual held-pointer scrolling and dropping remain browser checks. |
| Day changes and Calendar/search access | Scrolling back exposes their existing controls. The day-change path still commits the active editor and closes stores menus and History bubbles before switching. No new defect found. |
| Sign-off, published-version display and preview controls | Sign-off remains in the board column and travels with it. The published display uses the same row renderer; existing preview-bar placement handling remains wired. No new source defect found. |
| Crew sidebar, warnings and roster | Their internal scrolling remains separate; the sidebar’s sticky position uses the remaining bar height. No additional source defect found. |
| Phone roster drawer and desktop-layout switch | The new sideways rules exclude the existing phone layout and `.sb-wide`. The drawer retains its existing top-height measurement, and the separate pinch-zoom layout is not changed. |
| Pinned bar and page zoom | The new bar has its own fill and stacking order. No page-zoom permission was introduced. Leakage and real touch hit-testing still require rendered checks. |

For **D1781**, I traced these renderers and variants:

- **Flying rows:** the time wrappers stack, remarks occupy the second row, and the row’s controls have their own second-row placement.
- **SC, AVALON and BB:** they use the same row shape, with START/END headings preserved.
- **Cancelled and red-boxed rows:** their state classes do not introduce additional grid items.
- **Single-seat lines:** both seat positions remain represented; the new placement does not depend on an occupied back seat.
- **Published/read-only rows:** the shared renderer retains the time and remarks wrappers while removing editing controls.
- **History marks:** their decorations do not alter the grid’s item count.
- **In-time lines:** these use a separate renderer and are not caught by the new jet-row selectors.
- **Headings:** the heading and row grids share the new final-column minimum; the time headings stack together.

I found no additional source defect in those variants. The new band is confined to **821–1099** and excludes `.sb-wide`. The host should still measure remarks and control reach on those variants at **821, 874 and 1099**, with **820 and 1100** as boundary controls.

For **D1771**, I checked:

- The board’s ⋯ menu and the shared menu used by **Edit Schedule and View-only Sched**.
- **+ Block, Templates, + Wave, plans, stores and the phone day-bar buttons**.
- The duty-role field’s existing focus treatment.
- Other matching focus rules and their precedence.
- The shared menu-item reader, disabled/hidden items, opening focus, arrow navigation, Escape and Tab departure.

The menu items retain their raised background and receive the cyan outline through `:focus-visible`. The named opener rule has sufficient specificity, and I found no competing second outline in these paths. The shared item reader is used, and the change does not alter D1772’s Tab behaviour. No additional source defect found.

The board remains an admin surface. The shared week-menu styling also reaches the member’s view-only route. No permission, schedule-data writer, persistence format, calculation or publishing behaviour is changed by this diff.

**Checks still required**

The two reproductions above should come first. Then check the excluded layout combinations: upright phone, mouse desktop, landscape touch taller than 500, widths at or below 820, and `.sb-wide`. Exercise keyboard and pointer focus separately, and confirm Edit Schedule, View-only Sched and the next-week peek retain their layout.

The stylesheet tests establish that declarations exist; they do not establish their rendered effect. The new browser tests cover ordinary flying rows, selected headings, initial/sticky geometry and a middle-of-list keyboard case. They do not cover either finding’s action sequence. I ran none of them.

**Tidiness — reported here, not changed**

- The new narrow-desktop band repeats the phone rules for stacking time cells and their headings. Those declarations could share one definition while retaining separate grid placement.
- The new scrolling comment overstates what happens for the just-added ring and undo. Scroll padding helps an actual scrolling request; it does not create one. Amend that comment without treating the existing undo backlog item as part of this repair.
- I found no unused new helper or export. The new measurement names match their use.

**Walk:** Not run, as required by the brief. Browser confirmation remains with the host.  
**Rulings:** None this session.

