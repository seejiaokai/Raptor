# Astra final read, round 1 — `[SAVE-NOTE-COVERS]` — the complete report, as returned (5 Oct 26)

Brief: `raptor-port/docs/superpowers/briefs/2026-10-05-save-note-controls-astra-final-r1.md` (unchanged since the run). Model `gpt-6-astra`, read-only,
on commit c8d006eb. Every finding was reproduced by the host and fixed with a test (commit 78772e58); the dispositions are in
`raptor-port/docs/handpass/2026-10-05-save-note-controls.md` §The read. The report below is verbatim.

---

**Verdict: CHANGES REQUIRED**

Reviewed `c6e1634d..c8d006eb` on `codex/save-note-controls`. I changed no files and ran no tests or browser sessions. The findings below are established by source and stylesheet tracing; “observed” describes that evidence, not a runtime reproduction.

The change remains **WALK** scope: warning placement and controls change; storage, permissions and earned-leave calculations do not.

**Findings, in priority order**

**F1 — P2: The full-screen OIL tracker has no warning or Retry.**

- **Setup/action:** Open Leave War → OIL tracker. With storage refusing writes, award a credit and press Save. Also check its Settings view after changing a setting.
- **Expected:** The warning and Retry remain visible under that surface’s header.
- **Observed:** Both full-screen render paths omit `SaveBand`. Their opaque, fixed sheet covers the shell’s warning. This is an omitted required surface, not a claim that this branch introduced the old overlay.
- **Cause:** [OilTracker.tsx:331](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/OilTracker.tsx:331) and [OilTracker.tsx:608](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/OilTracker.tsx:608); full-screen placement is defined at [bidpicker.css:721](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/bidpicker.css:721).

This is a working grid with selection, credit editing, filtering and settings. Calling its wrapper a “sheet” does not make it a short visit. It qualifies under D587’s full-screen requirement.

**Fix:** (1) Import `SaveBand` into the OIL tracker. (2) Insert it immediately after the header in **both** return paths. (3) Prevent the band from shrinking in the full-screen column; retain the grid’s existing scroll owner. (4) Add phone and desktop cases for failure arising while the grid/settings are already open, and opening them with an existing failure. Press Retry through refusal and recovery; check the credit controls remain reachable.

**F2 — P2: Moving the floating windows breaks their phone layout and can clip their desktop footers.**

- **Setup/action:** On a 390×844 phone, open Changes, then let a save fail and press Hide. Repeat with ALL AVAIL. Separately, open Changes at 1200×600 during a failure.
- **Expected:** Phone windows retain their bottom-panel layout; Hide produces the existing slim strip. Desktop windows remain wholly reachable.
- **Observed:** The new selector forces `top:132px` at every width. Its specificity overrides the phone’s `top:auto`. The collapsed Changes strip also retains `bottom:12px` and `height:auto`, so it stretches into a large panel, limited by `max-height:62vh`. On the 600px desktop, the existing 480px maximum height plus the new 132px top puts the bottom at **612px**, outside the screen.
- **Cause:** [17-save-status.css:53](C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler/17-save-status.css:53), conflicting with [20-changes-quals.css:84](C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler/20-changes-quals.css:84) and [19-availability.css:108](C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler/19-availability.css:108). The desktop height caps remain unchanged.

These are new consequences of the added rule, separate from the excluded seven-pixel overlap.

**Fix:** (1) Restrict the opening-position adjustment to the floating windows’ desktop breakpoint, `min-width:621px`. (2) Preserve the phone bottom anchoring, including `.chgwin.bar`. (3) Reduce the default desktop maximum height to fit below the adjusted top with the existing bottom clearance; preserve explicitly dragged positions and preview-bar overrides. (4) Add both windows at phone size, Changes → Hide → Show, and a short desktop. Assert all four edges and press the footer controls, not only Retry.

**F3 — P2: Already-frozen Quals and Leave War headers do not follow a save-status change.**

- **Setup/action:** With a failure showing, open Quals and scroll until its header freezes. Recover storage and press Retry without changing page or resizing. Repeat on Leave War. Test the reverse order too: freeze the header first, then let a save fail.
- **Expected:** The frozen header remains immediately below the current bottom of the app bar.
- **Observed:** Both mirrors retain their stored `top`. A successful retry leaves them 36px too low; a newly appearing warning covers their upper 36px. Ordinary scrolling does not necessarily repair this because an already-pinned mirror returns its previous measurement unless forced.
- **Cause:** [QualsPage.tsx:575](C:/Users/User/projects/Raptor/raptor-port/src/ui/QualsPage.tsx:575), especially the cached return at line 578; [Matrix.tsx:2063](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:2063), with the equivalent return at line 2066. Neither observes the app bar’s height. Leave War’s extra remeasurement depends on its own data generation, which a postman status change does not update.

**Fix:** (1) In each existing pinning effect, observe the **shell’s** top bar with `ResizeObserver`. (2) On height change, run the existing forced measurement, `pin(true)`, and disconnect during cleanup. (3) Keep the current resize/orientation handling. (4) Add both action orders above and assert mirror alignment plus a real press on a frozen-header control. Checking failure before navigating to the page does not cover this.

**F4 — P2: The Tracker keeps an obsolete available height when the warning appears or clears.**

- **Setup/action:** Open Tracker with no warning. Make a normal saved change and let it fail while remaining on Tracker. Then recover and retry. Also enter Tracker with a failure already showing and clear it there.
- **Expected:** The Tracker’s column continues to fit between the app bar and the screen bottom.
- **Observed:** Its top moves by 36px, but its stored height offset changes only on activation or window resize. When failure begins while Tracker is active, its bottom moves 36px below the viewport; the document is locked against scrolling. Entering with failure and clearing it leaves unused space instead.
- **Cause:** [TrackerPage.tsx:74](C:/Users/User/projects/Raptor/raptor-port/src/tracker/TrackerPage.tsx:74), with only a resize listener at line 81; [tracker.css:90](C:/Users/User/projects/Raptor/raptor-port/src/tracker/tracker.css:90) sizes the column from that cached offset.

The open phone Find strip and header menus have the same missing trigger: their positions update on opening, scrolling or resizing, but not when the shell bar changes height. See [Header.jsx:103](C:/Users/User/projects/Raptor/raptor-port/src/tracker/components/Header.jsx:103).

**Fix:** (1) While Tracker is active, observe the shell bar and rerun its existing section-top measurement whenever the bar changes height. (2) Disconnect on deactivation. (3) Make already-open header menus and the phone Find strip remeasure on that same change. (4) Test failure and recovery without leaving Tracker, including an open Find strip; assert the column’s bottom and actual bottom-control reachability.

**F5 — P3: Full-screen views expose duplicate save warnings to assistive technology.**

- **Setup/action:** While a save is failed, open the scheduler board, Inputs calendar or Medical view.
- **Expected:** One accessible warning and one accessible Retry for the active surface.
- **Observed:** The shell warning remains an exposed `role="status"` with a focusable Retry, and `SaveBand` adds another. Visual covering does not remove the shell copy from the accessibility tree. The board hides the underlying Edit Schedule page, not the shell bar. Exact spoken announcements depend on the reader; the duplicate accessible controls are evident from the markup.
- **Cause:** [SaveStatus.tsx:78](C:/Users/User/projects/Raptor/raptor-port/src/ui/SaveStatus.tsx:78) and [SaveStatus.tsx:86](C:/Users/User/projects/Raptor/raptor-port/src/ui/SaveStatus.tsx:86); both trees remain mounted through [App.tsx:55](C:/Users/User/projects/Raptor/raptor-port/src/ui/App.tsx:55).

**Fix:** (1) Track which full-screen warning surface is active, using its actual open state. (2) While covered, make the shell warning inert and hidden from accessibility, while preserving its reserved layout space. (3) Restore it when the full-screen surface closes. (4) Assert one exposed warning and Retry, and verify keyboard focus never lands on the covered copy. Include the OIL tracker added by F1.

**The seven hunts**

| Hunt | Checked and result |
|---|---|
| **1. Missing full-screen surface** | Checked every stylesheet’s fixed positioning, inherited full-screen modifiers and their renderers. **Found F1.** Board, Inputs calendar and Medical view are wired. Ordinary dialogs, Insights, document viewing, pickers, menus and short Leave War/Tracker sheets are transient and need no extra band. Changes and ALL AVAIL are long-lived but do not replace the whole screen. |
| **2. Pinned or measured controls** | Checked week arrows, CREW rail/drawer, board header measurement, Logic search, frozen table headers, Tracker sizing/search and movable windows. **Found F2–F4.** I found no additional missing height connection in Logic’s observer or the board’s measured header. Bottom scrollbars, balance/move bars and drag ghosts do not require their own warning. |
| **3. Warning measurement** | Checked `useFollowTheBar`, mount/class ordering, page changes, status transitions, the second `.topbar`, sideways scrolling and cleanup. I found no additional defect in the normal observer path: `closest()` selects the correct bar. Failed retries remain failed until success; they do not repeatedly switch to Saving. Without `ResizeObserver`, page-only height changes still have no fallback trigger. iPhone bounce remains explicitly unproved; I am not presenting it as a newly reproduced regression. |
| **4. Presses and layering** | Checked full-width bounds, pointer-event rules and stacking. **Found the window/header consequences above.** I found no additional interception in the three wired full-screen bands or normal shell placement. Runtime press evidence remains the builder’s evidence, not my own. |
| **5. Other save states** | Checked the unchanged floating rule, `useSaveFailed`, postman transitions and Tracker’s separate `.savestat`. **I found no new styling leak onto Saving or Tracker’s own save words.** The existing Saving geometry test remains registered. |
| **6. Accessibility and wording** | **Found F5.** I checked the warning symbol and wording and found nothing else: the symbol is hidden from readers, and the words match the accepted production copy. |
| **7. Tests** | Checked all 21 new cases, their helpers, registration and the added unit test. They cover useful ordinary routes, but omit F1–F5 and contain the Retry-proof weakness below. I found no additional unreachable fixture beyond the explicitly disclosed storage failure and bridge write. |

**Test assertions that can pass with broken behaviour**

- **Retry is not isolated from automatic retry.** The new unit test advances the clock by 1,000ms after clicking, exactly allowing the postman’s automatic retry to succeed. Removing the click handler can therefore leave this test green. The browser helper restores storage on `pointerdown`; a subsequent automatic retry can likewise satisfy “warning disappeared” without proving that the click invoked `flush()`. See [SaveStatus.test.tsx:53](C:/Users/User/projects/Raptor/raptor-port/src/ui/SaveStatus.test.tsx:53) and [save-note.spec.ts:43](C:/Users/User/projects/Raptor/raptor-port/e2e/save-note.spec.ts:43). Assert the immediate retry attempt before advancing to the automatic deadline; separately test automatic recovery.
- **“Whole and on top” checks only the band’s centre for occlusion.** Bounds do not prove the message and Retry are unobscured. Add hit checks for Retry and representative message points.
- **The page loop establishes failure before visiting and scrolling each page.** It misses failures or recovery after a header has frozen.
- **Floating-window tests explicitly exclude touch sizes** and inspect the top movement and Retry, not the window bottom or collapsed strip.
- **Pressing Retry while storage refuses, then checking that the warning remains, does not prove a retry happened.** Count the attempted write.
- The Tracker click recorder proves which button received the press; it does not itself prove the save operation completed. That narrower assertion is useful, but should be described accurately.

**Roll-call corrections**

- **Missing:** OIL tracker grid, individual-person route and full-screen settings. All need visible warning/Retry coverage.
- **Rows 4 and 6:** “Frozen header follows the bar” is too broad. The documented walk covers entering/scolling with failure already present; add status changes while already pinned.
- **Row 7:** Add the Tracker’s full-height column and already-open Find/menu positioning, including failure beginning and ending on that page.
- **Row 14:** Split desktop, short desktop, phone panel, phone collapsed Changes strip, and explicitly moved windows. The shared selector does not establish shared correctness.
- **Row 15:** Its blanket classification of Leave War sheets as short visits incorrectly absorbs the full-screen OIL working surface.
- **Rows 11–13:** Add accessibility ownership of the warning, alongside visible placement.
- Add explicit exclusions for the separate guest/access trees and standalone Tracker. They are not covered by the admin/member walk; I found no newly introduced route requiring their redesign here.

The writer remains the unchanged whiteboard/postman path for scheduler, Leave War and hosted Tracker records. The warning components read that one status; every Retry calls the same `flush()`. No new persistence writer, permission change or downstream calculation was introduced.

**D138 — short rulings against full rows**

- **D586:** The short line preserves the operative rule: Opus builds on the separate branch, pictures precede layout changes, real presses and independent review are required, calendar work stays held, and no merge/main action is authorized. The full row additionally specifies the pushed branch base and allowance-exhaustion handoff. I found no contradictory meaning.
- **D587:** The core design and words match. However, the short line **omits the full row’s explicit short-visit window/sheet/menu exemption**. Read alone, it can be broader than the full row. Preserve that qualification in the short form. It does not exempt a full-screen working grid merely because its component is named “Sheet.”

**Checks:** Read-only source, stylesheet, test, ruling and evidence review completed. Tracked files remained unchanged. The evidence sheet still has placeholder gate/read sections; I did not treat the concurrently running gates as passed.

**Walk: NOT DONE — this session was explicitly limited to reading and reasoning.** The builder should reproduce the findings, fix them with focused regressions, and update the affected walk rows.

**Rulings: none this session.**


