**Review result: three findings.** I would return the marking-window change for correction. I found no separate product defect in Find or Restore.

Reviewed `7d750640e` against `549482bd5`, including the six changed files, their callers, the approved drawings and their notes. I did not read another reviewer’s report or the prohibited walk evidence.

**1. P2 — Turning or resizing the screen leaves the marking window in its old position.**

**Failure:** Open ACG-09’s marking window on the approved 402×874 phone layout, let it settle, then turn to landscape. The placement remains at approximately `y=220` with a 429px-tall window. On a 402px-tall viewport, its bottom is approximately 649px: the lower controls are off-screen.

**Cause:** [Pop.jsx:86](C:/Users/User/projects/Raptor/.claude/worktrees/pr-tracker-787259/raptor-port/src/tracker/components/Pop.jsx:86) measures placement in an effect depending only on `p` (line 128). Resizing does not replace `p`. The chart’s existing resize work therefore changes the chart without updating the marking window. The effect also retains its initial popup measurements while a slide runs.

This is an inherited omission in the positioning lifecycle, still present under the new promise that the window remains on-screen.

**Fix:**

1. Extract the measuring and placement work at lines 88–126 into a callable placement routine. Measure popup dimensions afresh each time.
2. While a popup is open, schedule that routine on viewport resize and after the chart’s resulting layout change. Observe the board/chart dimensions so the chart’s delayed refit is included.
3. Cancel the previous placement frame before starting another; prevent an older slide’s completion from overwriting the newer placement.
4. Remove listeners, observers and pending frames when the popup closes or changes event.
5. Add browser coverage for resize both after settling and during the slide.

**Host check:** At 402×874, find ACG-09, open its marking window, then resize to 874×402. Repeat while the slide is running. Expect the window inside the viewport, clear of the tabs and event, with every control reachable through internal scrolling where necessary. I have not run this browser check.

**2. P2 — Keyboard Close moves the chart again.**

**Failure:** Open a marking window with Enter or Space where the new slide places the event 22px below the chart’s top. Close with Escape or the keyboard-operated Close button. Returning focus moves the chart another six pixels, contrary to “stays there after Close.”

**Cause:** The placement uses a 22px margin in [popPlace.js:18](C:/Users/User/projects/Raptor/.claude/worktrees/pr-tracker-787259/raptor-port/src/tracker/app/popPlace.js:18). Closing calls `kbdBack()`, which focuses the chart. Its own focus listener then calls `kbdKeepInView()`, enforcing a **28px** margin. `preventScroll` prevents the browser’s automatic scrolling; it does not prevent this application handler.

Relevant locations in [core.js:3957](C:/Users/User/projects/Raptor/.claude/worktrees/pr-tracker-787259/raptor-port/src/tracker/app/core.js:3957): the focus listener, `kbdKeepInView()` at 4001–4007, `kbdBack()` at 4078–4083 and the close call at 4838.

**Evidence:** I executed the fixed commit’s relevant functions and focus handler against controlled geometry. Returning focus changed `scrollTop` from 1232 to 1226. This confirms the code interaction; it is not browser evidence.

**Fix:**

1. Add a scoped “preserve chart position” option to `kbdBack()`.
2. During that focus operation, let the chart’s focus listener restore the selected event and ring, but skip `kbdKeepInView()`. Reset the scoped flag in `finally`.
3. Use that option for the marking window’s return at line 4838.
4. Preserve ordinary Tab and arrow-navigation scrolling.
5. Add a regression check comparing chart position before and after keyboard Close.

**Host check:** On desktop, find ACG-09, reach the chart by keyboard and open with Enter. After the window settles, record chart position, press Escape and compare. Repeat with Space, keyboard Close and a grade selection. Expect focus and the ring on the same event without an additional position change.

**3. P2 — The short-screen fallback can put the window below the screen despite usable space above.**

**Failure:** A short-screen slide stops early. The settling calculation treats the current position as having no further scrolling available. It can then choose a minimum-height window below the event that extends off-screen.

The existing landscape test’s geometry, with `room: 0`, produces this result:

| Measurement | Value |
|---|---:|
| Screen | 844×390 |
| Chart top | 150 |
| Event | 300–329 |
| Popup’s full height | 429 |
| Returned popup top | 333 |
| Returned maximum height | 120 |
| Returned bottom | **453** |
| Usable space above the event | **142** |

I reproduced this directly against the fixed commit’s placement function.

**Cause:** [popPlace.js:46](C:/Users/User/projects/Raptor/.claude/worktrees/pr-tracker-787259/raptor-port/src/tracker/app/popPlace.js:46) rejects the internally scrolling option above because `upTo >= need` is false on this short screen. Line 49 then forces at least 120px below, even when fewer than 120px remain. `Pop.jsx:112` supplies `room: 0` when settling, including an interrupted slide.

**Fix:**

1. At line 46, remove `upTo >= need` from the above-placement condition. When scrolling is unavailable or insufficient and the above region has adequate usable height, allow option B there.
2. At line 49, stop treating `POP_MIN` as a mandatory height. The returned maximum height must fit the actual available region.
3. If the below region has no usable height, select a bounded above region instead; do not return a below placement extending past the viewport.
4. Add the exact geometry above as a regression test. Expect no slide, placement above the event, and the entire scrolling container between the chart top and event.
5. Add an interrupted-slide browser check.

**Host check:** At 844×390, open a tall marking window with its event near the lower edge, then interrupt the smooth slide before the event reaches its target. Record the actual geometry. Expect a bounded scrolling window with all controls reachable, never a minimum height that carries its bottom beyond the screen.

**The builder’s six readings**

| Reading | Judgment |
|---|---|
| 1. Slide to the drawing’s 22px offset, rather than the minimum distance needed to fit | **Supported.** The measured drawing explicitly establishes the 232px movement. Its explanatory wording about “the difference” is inconsistent, but the concrete approved example supports this implementation. |
| 2. Keep the window hidden during the slide | **Supported for the sequence.** The worked example describes sliding, then opening. The 150ms/1s thresholds are implementation choices; the one-second escape does not itself prove the chart has stopped. |
| 3. Open 4px below the event’s foot | **Supported.** This keeps the window clear of the event and addresses the drawing notes’ overlap concern. |
| 4. “Phone” means the Find-strip layout at `max-width:1050px` | **Supported.** The requested behaviour belongs to that visible strip. |
| 5. Keyboard clear returns focus to Find; tapping clear leaves it unfocused | **Supported.** It preserves a usable keyboard destination while dismissing the phone keyboard after a tap. |
| 6. On a short screen, move the event as high as possible and scroll within the window | **His to decide.** The drawings do not establish this particular short-screen movement. Internal scrolling is reasonable, but the placement choice needs confirmation. Finding 3 is a defect regardless of that choice. |

**Explicit negatives and coverage**

These are code-review conclusions. Native browser behaviour remains unverified where identified.

- **Opening by tap:** I checked the active person’s wedge and the event centre; both reach the shared popup. I found no missing placement call. Another person’s wedge intentionally selects that person first.
- **Find and crew selection:** I checked their landing/selection paths followed by opening the event. They reach the shared popup. Find’s initial landing remains separate from the new opening slide; I found no unintended change to that rule.
- **Keyboard opening:** I checked Enter and Space, initial grade focus, the focus trap and grade navigation. I found no separate opening defect. Returning focus has finding 2.
- **Reopening and switching events:** I checked reopening the same event and selecting another. Each opening creates a new popup object; the previous placement frame is cancelled. I found no stale callback that can reopen a closed popup. Native scrolling already underway needs the interruption check below.
- **Finger glide:** I checked the new slide’s call to `stopGlide()`. It exists. Whether its two-frame native-scroll restoration interrupts the newly requested smooth scroll needs a browser check; I am not claiming that interaction passes.
- **Pinch, resize and rotation:** Resize has finding 1. Pinch changes chart geometry without replacing the popup object, so an open popup also needs a host check through pinch completion. During a slide, the polling observes scroll position rather than every geometry change.
- **Closing during movement:** I checked Close, Escape, outside presses and grading. Cleanup cancels the pending placement frame. Hidden popup controls cannot ordinarily be pressed while the slide runs. Escape/outside interruption and the continuing native animation still need browser verification. Keyboard closure after settling has finding 2.
- **Reduced motion:** I checked the explicit direct-scroll branch; it does not request smooth scrolling. I found no separate code defect.
- **WebKit:** I checked the settling mechanism; it does not depend on `scrollend`. I found no missing WebKit event fallback. Native timing remains a host check.
- **Tall desktop window:** I checked measurement of the full content height and the shared placement routes. There is no separate desktop renderer missing the change. Findings 1 and 3 apply when available height becomes insufficient.
- **Edit chart layout:** I checked the marking gates and keyboard guard. I found no new marking-window door during layout editing.
- **Show All and Info:** I checked their overlay paths and outside-click handling. I found no separate marking-window renderer needing this patch. Find can return from Info to the chart before landing.
- **Desktop clear:** I checked clearing text, retaining the search field’s focus and the unchanged desktop tooltip. I found no defect.
- **Phone clear:** I checked populated, empty and list-open states. The common handler clears, closes and blurs. Native Enter/Space activation takes the keyboard-return branch. I found no separate defect.
- **List selection:** Mouse and finger selection explicitly close Find. Keyboard Enter still uses the existing search-and-cycle behaviour; the approved notes explicitly retain the strip for that action. I found no missing keyboard list-pick change under those notes.
- **Crossing 1050px with Find open:** I checked the media-query subscription and event-time layout check. They update the tooltip and clear behaviour across the boundary. I found no separate defect.
- **Restore:** I checked the shared Course and Syllabus deleted-item renderer, its existing restore actions and the imported Reset glyph. Both visible Restore buttons receive the drawn arrow. Other typed arrows in confirmation/import text are not these controls. I found no omitted Restore button.
- **Roles, writers and downstream effects:** I checked active-person selection, grading, redraw, search clearing and the restore writers. The patch introduces no separate role-specific renderer or changed permission/storage route. I found no additional write or saved-data defect.

**Checks and remaining browser work**

I replayed all **nine supplied test cases in memory against the fixed commit**; they passed. I also ran the focused keyboard-return and placement checks described above. I did **not** run Vitest itself, a build or a browser.

The browser pins have two material coverage gaps:

- The phone placement check proves broad visibility and movement, but does not assert the approved **22px final offset**. Add that assertion when sufficient chart travel remains.
- The list-pick check can still pass with the new explicit close removed, because the existing document outside-click path can close Find after the selected row disappears. Add an isolated handler/component check with that outside-click path disabled. It should fail when the explicit close is removed.

The host should additionally check:

- A fast finger glide followed immediately by opening an event: the slide finishes or safely falls back, and the popup matches the final event position.
- A pinch during the slide and after opening: the popup remains bounded and clear of its event after pinch completion.
- Escape or an outside press during the slide: the popup stays closed and no delayed placement revives it.
- Reduced motion and WebKit: the popup becomes visible in the correct position without relying on `scrollend`.
- Keyboard Space on phone clear, and resizing through 1050/1051px while Find is open: focus and dismissal follow the resulting layout.

**Tidiness note — filed here, not changed**

- **Duplication:** The 1050px layout boundary is repeated in JavaScript and CSS. It is currently consistent. The 22px/28px spacing conflict is finding 2, not merely tidiness.
- **Unused material:** I found no new unused production helper or import. The smoke check’s `needed` value is diagnostic; it does not enforce the minimum-distance interpretation.
- **Old names:** `ResetGlyph` remains an accurate shared name, although its reset-layout comment could mention Restore too. No rename is needed for this patch.

**Walk:** NOT RUN, as required by the brief.  
**Rulings:** None newly made.  
**Files changed, committed or pushed:** None.