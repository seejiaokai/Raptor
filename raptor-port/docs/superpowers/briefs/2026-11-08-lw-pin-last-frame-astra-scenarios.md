The scenario design is complete: **25 ranked scenarios**, with four defects visible in the prototype and two weaknesses in the existing test checks.

The additional defect outside the brief’s list is **Reduce motion**: it disables the animation that hides the always-mounted heading, leaving an unwanted heading visible.

This is a read-only report. I did not run the app, change files, or verify the finished build. The builder was editing during this read, so findings below concern the committed prototype; its relevant source matches the prototype named in the brief.

**Coverage and where each behaviour belongs**

| Object or route | Visible sign and working gesture | Writers, readers and downstream effects |
|---|---|---|
| Leave War’s real dates row | Dates, year, names corner and balance heading appear in the grid. A date opens that date’s day panel. | Period, visible dates, zoom, folds and layout determine its position and width. |
| Leave War’s pinned dates row | Replaces the real row exactly at the top-bar boundary; dates still open the correct day panel. | Reads the real row’s geometry, page scroll and sideways scroll. Its hidden duplicate must not be announced. |
| Leave War’s frozen corner and names | Stay aligned with their rows during sideways movement and pinch. Nothing covers the month buttons. | Share zoom and scroll positioning with the dates. The additional corner copy must remain semantically hidden. |
| Leave War’s month strip, Manning, groups and Rearrange | Their controls remain usable. Changes above the dates immediately move the pinning boundary. | Month changes, folds, row additions/removals, Rearrange, Undo and Redo can change geometry without a scroll. |
| Quals’ real and pinned headings | The visible heading sorts the matching column, including the frozen callsign heading. | Seat, search, sorting, editing, column changes, zoom and person updates rebuild the table or change its position. |
| Quals’ group rows and body | Stay in the table beneath the headings. | Group rows are not part of the pinned copy in this implementation. |
| Quals’ notices and editing controls | Returnee notices, Edit/Done, Edit quals and Add qualification remain usable. | Their appearance, removal or wrapping can move the real heading without scrolling. |
| Shared top bar and warning bands | The pinned row sits immediately below the actual bottom of the bar, including both warning bands. | Failed-save and unanswered-OIL state change the available space. Retry remains a save action, not a pinning action. |
| Navigation and retained pages | Returning to Leave War paints the correct position immediately. Leaving Quals resets its zoom as ruled. | Page show/hide, Leave War subpages and browser resizing must refresh measurements appropriately. |
| Windows, sheets and menus | The front window receives taps; headings behind it neither show through nor intercept input. | Day/person panels, Leave War menus, OIL, account controls and global windows overlap these surfaces. |
| Admin and member views | Existing editing restrictions remain intact; heading gestures do not grant editing rights. | Day-panel and Quals actions must continue through their existing permission checks. |
| Supported and unsupported browsers | Supported browsers replace the row in the same painted frame. Unsupported browsers retain the existing fallback. | Feature detection selects visibility and sideways-follow behaviour independently where necessary. |

**Common setup and evidence**

Use newly created demo records through the app’s existing controls. Include enough people and dates to scroll vertically and horizontally, distinguishable adjacent dates, and Quals columns with visibly different values.

- **Phone:** 402 × 874. **Desktop:** 1536 × 864.
- Define **T** as the page scroll position at which the real heading meets the bottom of the shared top bar: current page scroll + real heading’s top − top bar’s bottom.
- Measure T from the original table, not its copy. Ensure the page can actually reach each requested position; record the resulting scroll position.
- “Tap a heading” means its visible centre, clear of borders and neighbouring controls.
- For phone pinch tests: centre at **(200, 450)**; two touches separated vertically by **230 px**, close to **80 px** over eight steps of 30 ms, hold 150 ms, reverse over eight steps, hold 150 ms, then release. Introduce the second finger 30 ms after the first.
- Capture painted frames at the threshold, during each pinch step and during layout changes. Check opacity, position and hit targets as supporting evidence. A mounted element, a non-hidden `visibility` value, or a successful rectangle comparison does **not** prove it was painted correctly.
- Restart the preview from the build under test before collecting evidence.

**Ranked scenarios**

1. **Reduce motion exposes the permanently mounted copy — both pages; phone and desktop.**  
   **Setup:** Enable Reduce motion before loading; begin at page scroll 0.  
   **Steps:** Open each page; inspect the area below the top bar. Move to T + 160, scroll halfway sideways, return to 0, then toggle Reduce motion off and on without scrolling.  
   **Expected:** One heading in its proper place; no copy over controls before pinning; sideways alignment remains correct.  
   **Disproof:** An extra heading appears at the top, or its columns stop following the table. The prototype’s global animation override provides a concrete failure path.

2. **Quals retains the wrong shadow during pinch — Quals; phone.**  
   **Setup:** Pin the heading at T + 160 and move halfway sideways.  
   **Steps:** Perform the complete pinch recipe, inspecting below the heading while the fingers remain down. Repeat from maximum zoom.  
   **Expected:** The pinch presentation has no shadow or solid band left at the old heading height.  
   **Disproof:** A dark line or band remains below the moving heading. The prototype’s pinned-state shadow rule overrides its pinch rule.

3. **Hidden heading is announced twice — Leave War, with Quals as comparison; phone and desktop.**  
   **Setup:** Use a screen reader at scroll 0.  
   **Steps:** Read through headings and table content; traverse keyboard focus on desktop. Repeat at T + 160 and after returning to 0.  
   **Expected:** The duplicate presentation adds no second set of dates or headings and no hidden focus stop.  
   **Disproof:** Leave War’s hidden dates are announced again. Its scrolling copy lacks the accessibility exclusion already present on Quals. I found no focusable controls in either copied heading.

4. **Pinch reverses across the pinning boundary — both pages; phone.**  
   **Setup:** Start at T + 40, with the row pinned.  
   **Steps:** Perform the pinch recipe; allow the page to move with it. Repeat until the real heading crosses the top-bar boundary during the gesture, then reverse before lifting.  
   **Expected:** The pinch rule alone determines which heading is shown; exactly one remains, with its corner aligned.  
   **Disproof:** Both rows disappear, two appear, or an empty band opens. The prototype can combine fresh pinch visibility with stale animation opacity.

5. **Pinch begins before pinning, then ends or cancels — both pages; phone.**  
   **Setup:** Start at T − 40.  
   **Steps:** Pinch until the boundary is crossed. Run three endings: release both fingers; release one and continue moving the other; cancel the touch sequence. After each, scroll through T in both directions.  
   **Expected:** Correct visibility from the first pinch frame, followed by normal scrolling and sideways follow after every ending.  
   **Disproof:** An initial flash, a stuck hidden copy, or a heading that remains in pinch mode.

6. **Warning bands change the boundary without scrolling — both pages; phone and desktop.**  
   **Setup:** Pin at T + 160. Use `?savefail` for the failed-save case; prepare the existing unanswered-OIL case separately.  
   **Steps:** Trigger a save; inspect the first painted frame with the band. Exercise zero, one and two bands. Test removal using a controlled recoverable failure or the normal supported recovery path.  
   **Expected:** The heading follows the bar immediately, with no overlap or gap.  
   **Disproof:** Even a transient heading at the old boundary. The app already sends a resize notification; the question is whether its delayed handling is early enough. **Retry must still fail while `?savefail` is present.**

7. **Quals changes above the table without scrolling — Quals; phone and desktop.**  
   **Setup:** Create a fresh returnee notice through the supported flow. Position at T + 2.  
   **Steps:** Choose Later; enter and leave Edit quals; open and close the Add qualification row. Do not scroll between actions. Repeat at T − 2.  
   **Expected:** The heading changes position or visibility in the same painted update as the content above it.  
   **Disproof:** A row at the old position until a later scroll or resize. Existing table and cell observers cover some of this route; test their timing rather than assuming the route is absent.

8. **Manning and folds move Leave War’s dates — Leave War; phone and desktop.**  
   **Setup:** Start at T + 2 with Manning and an expandable group present.  
   **Steps:** Open and close Manning, fold and unfold the group, and add/remove a fresh permitted row through its controls. Repeat at T − 2 without manual scrolling.  
   **Expected:** Correct heading placement and matching column widths immediately after every action.  
   **Disproof:** Stale pinning, width or visibility that repairs itself only after scrolling. These actions already have refresh paths; the first frame remains the test.

9. **Filtering removes the page’s scroll range — Quals; phone and desktop.**  
   **Setup:** Start with enough results to pin the heading.  
   **Steps:** Search for one person, then a string with no matches; clear it. Repeat through Pilots, WSOs, Personnel and All, including a short result set that fits entirely on screen.  
   **Expected:** No floating duplicate when the page no longer scrolls; normal pinning returns when results grow.  
   **Disproof:** The always-mounted copy remains painted when the root scroll timeline becomes inactive or the scroll position is clamped.

10. **Fast crossing and immediate reversal — both pages; phone and desktop.**  
    **Setup:** Start at T − 80.  
    **Steps:** On desktop, send four 100 px wheel movements 80 ms apart, then reverse. On phone, swipe from (200, 760) to (200, 260), then reverse. Repeat five times in each direction per page and size.  
    **Expected:** The pinned row replaces the original in the same painted frame, with no cut or missing row.  
    **Disproof:** Any crossing frame with a gap, duplicate or clipped heading. A correct resting screenshot is insufficient.

11. **Fractional boundary produces a translucent seam — both pages; phone and desktop.**  
    **Setup:** Use device pixel ratios 2 and 3, with default, fit and maximum supported grid zoom.  
    **Steps:** Request positions T − 1, T − 0.75, T − 0.5, T − 0.25, T and T + 1; record the positions the browser actually reaches. Repeat while scrolling sideways.  
    **Expected:** No body text or colour leaks through the heading during replacement.  
    **Disproof:** A partially transparent row or seam. The prototype uses a linear one-pixel opacity interval; this needs painted evidence before declaring the seam reproduced.

12. **Sideways and vertical movement occur together — both pages; phone and desktop.**  
    **Setup:** Use a wide table; test its left edge, midpoint and right edge.  
    **Steps:** Cross T vertically while moving sideways. On phone, drag diagonally from (330, 650) to (90, 250), then reverse.  
    **Expected:** Each heading stays above its own column; the frozen corner and names stay aligned.  
    **Disproof:** A one-column slip, stale horizontal position, exposed content behind a frozen cell, or a corner separated from the row.

13. **Pinned dates open the right day — Leave War; phone and desktop.**  
    **Setup:** Give adjacent dates distinguishable fresh entries.  
    **Steps:** Open a date from the original row at T − 40, then from the pinned row at T + 40. Repeat after sideways scrolling. Also tap immediately after the first painted pinned frame.  
    **Expected:** One day panel opens for the visible date each time.  
    **Disproof:** No response, a neighbouring date, two panels, or a tap reaching the row underneath. This specifically tests the gap between painted visibility and the scroll listener’s interactive-state update.

14. **Pinned Quals headings sort the right column — Quals; phone and desktop.**  
    **Setup:** Use at least three people whose callsigns and qualification values sort differently.  
    **Steps:** Sort using the original heading, then repeat using the pinned heading and frozen callsign cell. Repeat after sideways movement and immediately after crossing T.  
    **Expected:** The selected column and direction match the visible arrow; each tap causes one sort.  
    **Disproof:** Wrong-column sorting, a swallowed first tap or double reversal. The already-filed absence of pinned qualification dragging is a separate limitation.

15. **Rearrange changes geometry and interrupts gestures — Leave War; phone and desktop.**  
    **Setup:** Pin the dates with expanded groups.  
    **Steps:** Enter Rearrange; move a fresh row, fold/unfold a group, finish, then Undo and Redo. On phone, begin a permitted drag and introduce the second pinch finger.  
    **Expected:** The dates and names remain aligned; pinch cancels the drag cleanly; finishing and undoing refresh geometry without another scroll.  
    **Disproof:** A stuck drag layer, stale heading width or an unintended row move.

16. **Month, period and year changes replace the dates — Leave War; phone and desktop.**  
    **Setup:** Include a newly prepared period crossing December–January and enough dates to scroll sideways.  
    **Steps:** While pinned, choose another month, cross the year boundary, change period and return. Repeat near each horizontal end at fit and maximum zoom.  
    **Expected:** The year, visible dates and body agree; month controls remain exposed and usable.  
    **Disproof:** Old dates, the wrong year, a blank edge or a pinned row drawn over the month buttons.

17. **Fresh edits, Undo and Redo update every copy — both pages; phone and desktop.**  
    **Setup:** Pin the table and move halfway sideways.  
    **Steps:** In Leave War, add a fresh permitted full-day entry and half-day entry, then Undo/Redo. In Quals, add a qualification with a 14-character name, edit a permitted value and use the supported undo route.  
    **Expected:** Real and pinned headings agree after each redraw; widths and the visible column remain aligned.  
    **Disproof:** A stale label, wrong-width copy, column jump or heading that updates only after scrolling.

18. **Leave War is hidden, changed elsewhere and shown again — both pages; phone and desktop.**  
    **Setup:** Leave War is pinned and sideways-scrolled; Quals has a non-default phone zoom.  
    **Steps:** Navigate away, make a fresh authorised person change that affects the table, then return. Repeat after resizing while away. Leave and reopen Quals separately.  
    **Expected:** Leave War’s retained page paints current geometry and content immediately. Quals resets zoom on leaving the page.  
    **Disproof:** A first-frame old heading, an orphaned copy on another page or an incorrect Quals zoom lifetime.

19. **Leave War’s subpages replace the grid — Leave War; phone and desktop.**  
    **Setup:** Start with pinned dates.  
    **Steps:** Visit Approvals, Balances, OIL and My Leave wherever offered to the role, then return to the grid. On phone, pinch inside OIL and on ordinary surrounding controls.  
    **Expected:** The dates copy appears only with its grid. OIL keeps its own supported pinch behaviour; ordinary page controls do not zoom.  
    **Disproof:** Dates over another subpage, retained pinch state or a page-wide zoom.

20. **Leave War’s windows receive input above the row — Leave War; phone and desktop.**  
    **Setup:** Pin and sideways-scroll the dates.  
    **Steps:** Open and close the day panel, person/figures panel, required-number keypad, ALL AVAIL control and available settings/context menus. Tap a control whose screen position overlaps the heading underneath.  
    **Expected:** The frontmost window receives the tap, and its backdrop covers the heading as designed.  
    **Disproof:** Dates showing through, an underlying date opening, blocked controls or a leftover copy after closing.

21. **Shared windows and Quals controls overlap the row — both pages; phone and desktop.**  
    **Setup:** Pin the heading as admin, then repeat available routes as a member.  
    **Steps:** Open account/navigation menus and applicable global windows. In Quals, use Edit/Done, Edit quals, Export and Add person through their existing routes. Close each and return.  
    **Expected:** The visible front surface owns input; returning restores one correctly positioned heading.  
    **Disproof:** A heading above the window, click-through, hidden controls intercepting taps or stale geometry after return.

22. **Rotation, keyboard and browser chrome change the viewport — both pages; phone and desktop.**  
    **Setup:** Start pinned, then repeat just before T.  
    **Steps:** Rotate phone 402 × 874 → 874 × 402 → 402 × 874. Open and close the keyboard in an available input. On real iPhone Safari, collapse and expand the address bar. On desktop, resize across the phone-width breakpoint and back.  
    **Expected:** The heading follows the actual visible bar, with correct zoom and widths from the first settled layout.  
    **Disproof:** An old-height gap, clipping, duplicate row or a delayed repair visible to the user.

23. **Member and admin routes retain their permissions — both pages; phone and desktop.**  
    **Setup:** Use a real member session, an admin session and admin member-view separately.  
    **Steps:** Repeat original/pinned date opening and Quals sorting; try the editing controls each role is offered. Sign out and into another role while the page was pinned.  
    **Expected:** Existing permission checks and visible controls remain consistent across original and copied headings.  
    **Disproof:** A copy exposes an unavailable action, retains another role’s controls or bypasses a normal write check.

24. **Unsupported and partially supported browsers retain the fallback — both pages; phone and desktop.**  
    **Setup:** Test full support, horizontal-follow support without root pinning support, and no scroll-timeline support, using actual browsers or a controlled feature-detection fixture.  
    **Steps:** Cross T, move sideways, pinch on phone, change a warning band and navigate away/back.  
    **Expected:** Each combination selects a complete working path. Unsupported browsers preserve the previous fallback behaviour.  
    **Disproof:** An always-visible copy, no copy, mixed animation/fallback positioning or a new regression compared with the same browser before the change.

25. **The fix preserves scrolling speed and works on the reported iPhone — both pages; phone and desktop.**  
    **Setup:** Compare baseline and finished build with identical fresh data, browser, viewport, warm-up and capture duration.  
    **Steps:** Run the same five crossings in each direction, separately from performance recording. Repeat performance runs without capture overhead, including the existing 4× CPU setting. On the actual iPhone, perform quick flicks with finger release and natural momentum in both directions.  
    **Expected:** No missing painted frame and no scrolling slowdown. Report raw frame timings, time above 33 ms, sample counts and run duration.  
    **Disproof:** Reproduced blink or a repeatable slowdown. The existing script counts intervals above **33.4 ms**, so its result must not be labelled an exact 33 ms count. The trial’s reported 6 → 20 needs a comparable rerun.

**Fix instructions for defects visible in the prototype**

1. **Reduce motion disables functional heading visibility.**
   - Keep reduced-motion protection for decorative animation.
   - Split the global transition and animation suppression so the precise functional pinning and sideways-follow animations remain operational.
   - Exempt only those functional elements under their feature-support gates; do not broadly exempt the tables.
   - Preserve the pinch override’s ability to suspend the vertical animation.
   - Run scenario 1 both with the preference set before loading and toggled during use. Check horizontal follow as well as visibility.

2. **Leave War’s copied heading remains in the accessibility tree.**
   - Mark the scrolling presentation copy as hidden from assistive technology, matching the existing treatment of Quals and Leave War’s frozen corner.
   - Keep the original row as the semantic and keyboard-accessible source.
   - Retain the visible copy’s pointer handlers.
   - Do not make the always-mounted copy permanently inert: that would disable its required date taps.
   - Verify scenario 3 with an actual screen reader. There is no demonstrated copied-control tab-order defect to repair.

3. **Pinch visibility competes with stale scroll-animation opacity.**
   - On pinch start, initialise the copy’s visibility from the real heading’s current position.
   - While pinching, suspend the outer vertical show/hide animation and explicitly establish the opacity needed by the pinch visibility rule.
   - Continue updating that rule as the page moves with the gesture.
   - Keep horizontal-follow handling separate; preserve the existing frozen-column behaviour.
   - On every completion and cancellation route, refresh the normal boundary and interactive state before returning control to the scroll animation.
   - Verify scenarios 4 and 5 without adding repeated full-table measurements to the gesture.

4. **Quals’ pinned-state shadow overrides its pinch state.**
   - Add a pinch-state override that wins against the combined supported-and-pinned selector.
   - Clear the outer shadow throughout the pinch, including when the pinned-state class remains present.
   - Preserve the intended transparent outer pinch surface and opaque heading cells.
   - Verify scenario 2 during the gesture, not only after release.

**Required corrections to the test checks**

- Replace “there is no copy at the top” with separate checks for mounted state, painted visibility, accessibility and input. Keep the absence expectation for the fallback where appropriate.
- The existing pinch check treats a copy as shown when `visibility` is not hidden. Include effective opacity and painted evidence; opacity zero otherwise produces a false pass.
- Validate the resting reference image independently before using it for frame comparison. A consistently misplaced row can match its own incorrect reference.
- Inspect narrow boundary and corner crops. A small missing strip can fall below a whole-image difference threshold.
- Keep correctness capture separate from timing measurements. Headless scripted touch is useful evidence but does not replace native iPhone momentum scrolling.

**Missing-call-site checks and explicit negatives**

- I checked warning-band notifications and found an existing resize notification for both failed-save and unanswered-OIL bands. **There is no basis to report that notification as missing.** The remaining question is first-frame timing because the pinning handlers defer their resize work.
- I checked Manning, folds and child-row changes and found existing refresh routes.
- I checked Quals redraws and found that its observer is reattached to newly rendered heading cells. Dismissing a returnee notice is therefore not automatically an unhandled route.
- I checked Leave War page-show and subpage-return handling and found existing resize signalling.
- I checked Quals’ copied tables and found their accessibility exclusion already present.
- I checked both copied headings and found no keyboard-focusable controls. The real Leave War row owns its date focus stop.
- I checked the horizontal first-frame positioning and found explicit initial positioning before animation takes over.
- I checked Quals’ group rows and found they remain outside the pinned heading.
- I found no new persistence, leave-entitlement or qualification-calculation path introduced by this pinning change.
- Pinned Quals dragging, keyboard sorting and the previously filed outline-rescroll behaviour are existing backlog items, not new findings from this work.
- A WebKit rectangle discrepancy alone does not establish a visible pinch defect. Use painted frames and the real phone.
- I have not reported migration or old-demo-data-only problems.

For any reproduced no-scroll failure, identify the action that changed the layout and refresh from that action’s completed layout, or observe the appropriate upstream container. Observing only the heading’s size will miss a heading that moves without changing size. Do not add another general scroll listener and call that route covered.

**Disposition:** This supplies the scenario-design portion of the required FULL check. The host still needs to run these cases against the finished build, fix reproduced failures, complete the required checks and compare phone performance. It is not build acceptance.

**Walk:** NOT DONE — read-only scenario design; host execution required.  
**Rulings:** None this session.  
**Files changed:** None.

