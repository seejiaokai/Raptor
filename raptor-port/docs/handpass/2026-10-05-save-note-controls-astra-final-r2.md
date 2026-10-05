# Astra final read, round 2 (the last) — `[SAVE-NOTE-COVERS]` — the complete report, as returned (5 Oct 26)

Brief: `raptor-port/docs/superpowers/briefs/2026-10-05-save-note-controls-astra-final-r2.md` (unchanged since the run). Model `gpt-6-astra`, read-only,
on commit 163a58c7. Its findings were reproduced by the host and fixed with tests (commit bcc69fc8); two reads is the cap, so there
is no third — the dispositions are in `raptor-port/docs/handpass/2026-10-05-save-note-controls.md` §The read and were told to the owner. The report below is verbatim.

---

**Verdict: CHANGES REQUIRED**

Reviewed `codex/save-note-controls` at `163a58c77b8e3a06b30612164774efde48313b2f`, comparing the round-1 fixes with the complete change from `c6e1634d`.

I changed no files and ran no tests or browser sessions. “Observed” below means established by source tracing, not reproduced in a running browser. The change remains **WALK** scope: shared warning placement changes, but storage rules, permissions, publishing and earned leave do not.

**R2-1 — P2: Automatic save recovery closes the Tracker’s open Tools panel.**

- **Setup:** On a sideways phone, open Tracker → Edit chart layout. Have a failed save awaiting automatic retry. Open **Tools**, with no text box focused.
- **Action:** Let storage recover and the automatic retry succeed, without touching the panel.
- **Expected:** The warning disappears, the available space updates, and Tools stays open.
- **Observed:** The warning transition dispatches a window resize. The Tracker’s existing resize handler sets `toolsOpen = false`. The panel disappears even though the person neither selected a tool nor dismissed it.
- **Cause:** The new broadcast at [Shell.tsx:317](C:/Users/User/projects/Raptor/raptor-port/src/ui/Shell.tsx:317) reaches the unrelated dismissal at [core.js:6624](C:/Users/User/projects/Raptor/raptor-port/src/tracker/app/core.js:6624). The typing exception protects a focused input, but not someone reading or choosing a tool.

**Fix instructions:**

1. Distinguish the save-band layout notification from an ordinary resize—for example, give the dispatched event an explicit save-band reason.
2. In the Tracker resize handler, retain the required canvas remeasurement, but skip closing Tools for that reason. Preserve the existing real-resize and keyboard behavior.
3. Add a browser regression with Tools already open when failure begins, and another when automatic recovery removes the warning.
4. Assert that Tools remains open and usable, the selected tool remains selected, and the Tracker still fits the screen. Retain the existing real phone-turn test.

**R2-2 — P3: The new height cap overwrites a window’s chosen size.**

- **Setup:** At 1200×600, open Changes or ALL AVAIL. Resize it to 470px high; this fits under the existing 480px maximum. A moved window exhibits the same problem.
- **Action:** Let a save fail, wait for layout to settle, then recover it.
- **Expected:** Any temporary accommodation for the warning preserves the person’s chosen size.
- **Observed:** The new maximum becomes **444px**. The existing size observer records that CSS-imposed height as the person’s new choice. Recovery then restores **444px**, not 470px.
- **Cause:** [17-save-status.css:57](C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler/17-save-status.css:57) applies the reduced maximum to **every** desktop window, including windows with an explicit saved size. [floatwin.ts:135](C:/Users/User/projects/Raptor/raptor-port/src/ui/floatwin.ts:135) records the resulting rectangle. An inline `height` does not override `max-height`.

**Fix instructions:**

1. Apply the additional save-band height cap only to a window using its default opening placement, not one with a matching saved desktop box.
2. Have the shared window-placement code expose that distinction explicitly. Update it when a drag or native resize establishes a chosen box, as well as during ordinary placement.
3. Preserve the existing inline preview-bar placement and maximum-height override.
4. Add regressions for **both** windows: resize, fail, recover; move, fail, recover; and repeat with the board’s preview bar present.
5. Assert the chosen dimensions return unchanged. Keep the existing default-window, short-desktop and phone Hide/Show checks.

This is newly reachable through the added cap; it is separate from the excluded two-line-bar overlap.

**R2-3 — P3, test weakness: The browser Retry check still permits automatic retry to supply its evidence.**

- **Setup:** A fresh failed save has its first automatic retry due after one second.
- **Action:** Press an ineffective Retry shortly after failure.
- **Expected:** The browser test fails because that press attempted no write.
- **Observed:** The helper waits up to **1,500ms** for any increase in write attempts. The automatic retry can satisfy it. Restoring storage on `pointerdown` also leaves recovery attributable to an automatic attempt.
- **Cause:** [save-note.spec.ts:47](C:/Users/User/projects/Raptor/raptor-port/e2e/save-note.spec.ts:47) through the recovery helper at line 54 do not attribute the write to the click itself.

The revised **20ms unit test does correctly catch removal of the shared Retry handler**. This remaining weakness concerns the browser’s claimed proof of each real press.

**Fix instructions:**

1. Keep the write counter installed during refusal and recovery; switch a refusal flag rather than removing the counter.
2. Record the counter at capture of the actual Retry **click**.
3. Check the counter again after that click’s handlers, before another timer task can run. The browser backend starts its write synchronously.
4. For recovery, release the refusal in that click’s capture handler, then assert its write attempt and eventual saved state.
5. Demonstrate that intercepting the click before the application handler makes the browser assertion fail while automatic retry remains enabled.

**Items 1–6: explicit results**

| Brief item | Result |
|---|---|
| **1. Earlier findings** | **F1 closed:** both OIL tracker return paths now carry the band, including the individual-person route through the shared grid. **F2’s original phone stretching and default desktop clipping are closed**, but R2-2 remains. **F3’s frozen-header misalignment and F4’s column-height fault are addressed**, but their chosen trigger introduces R2-1. **F5’s shell-versus-active-surface duplication is addressed**; counter analysis follows below. |
| **2. Resize broadcast** | I checked every production resize registration found under `src`. The measurement connections are present. I found the Tools dismissal in R2-1 and the window-size consequence in R2-2; the remaining listener outcomes are listed below. |
| **3. Warning ownership** | I checked failure/recovery, active/inactive transitions, unmount while failed, closing the board while still failed, multiple registrations and development effect replay. I found no unmatched increment/decrement in those lifecycles. |
| **4. Window rules** | I checked the 620/621px boundary, phone bottom anchoring, collapsed Changes strip, default desktop height, saved inline boxes and preview-bar overrides. The original breakpoint conflict is fixed. The saved-size case fails as R2-2. |
| **5. Newly affected behavior** | I checked existing overlays, measurement consumers, save-state transitions and the unchanged persistence path. Beyond R2-1 and R2-2, I found no additional concrete production defect. |
| **6. Tests** | I read all seven test families generating the 35 browser cases and all three save-status unit tests. The stronger message/Retry hit checks, frozen-before-failure cases and phone-window checks address their earlier weaknesses. The browser Retry attribution remains R2-3. Coverage limits are listed below. |

**Resize listener inventory and consequences**

| Listener | Effect of the save-band broadcast |
|---|---|
| `tracker/app/core.js:6615` | **Harmful:** closes Tools; also refits the editing canvas. R2-1. |
| `tracker/app/core.js:6628` | Reapplies automatic chart fitting and padding. Explicit user zoom is protected by `zoomIsMine`; editing uses the other handler. I found no independent zoom-reset defect here. |
| `ui/floatwin.ts:108` | Replaces/clamps window geometry; skips an active drag. Saved positions remain subject to the existing clamp. The additional CSS cap can corrupt remembered size through its observer—R2-2. |
| `leavewar/ui/Matrix.tsx:1944` | Closes the qualifications explanation. Harmless to entered work: this is a read-only, position-anchored popover whose anchor moved, and dismissal on layout movement is its existing contract. |
| `leavewar/ui/FiguresDrawer.tsx:197` | Likewise closes the read-only figure explanation, not the drawer or an editor. Same assessment. |
| `ui/histbubble.ts:496` | Repositions an existing history bubble; removes it only if its anchor no longer exists. Harmless here. |
| `ui/pan.ts:617` | Refreshes arrows and scrollbar geometry. Rebuilds the peek only on an actual width-breakpoint crossing. No such crossing is caused by this event. |
| `ui/ScheduleInsightsMenu.tsx:26` | Rechecks the unchanged width. Does not dismiss the menu solely because the event fired. |
| `ui/QualsPage.tsx:600` | Forces frozen-header remeasurement. Intended. |
| `leavewar/ui/Matrix.tsx:2092` | Forces frozen-header remeasurement. Intended. |
| Other Matrix registrations: `2196`, `2987`, `3101`, `3159`, `3309`, `3359` | Refresh scrollbar, column/strip geometry, month-strip height, bidding outline and overlay alignment. I found no direct picker dismissal, drag cancellation or zoom reset in these callbacks. |
| `tracker/TrackerPage.tsx:81` | Updates the available-height offset. Intended. |
| `tracker/components/Header.jsx:34,110` | Repositions open menus and Find. Preserves their open state. |
| `ui/LogicPage.tsx:94` | Repositions the pinned controls. Intended; it also observes the bar directly. |
| `ui/SaveStatus.tsx:66` | Repositions the warning itself. Intended; it also observes the bar directly. |

The **visual-viewport-only** listeners in `BalanceBar`, `Sheet` and the board do **not** receive a synthetic event dispatched on `window`.

One measurement therefore remains outside this broadcast: [Sheet.tsx:305](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Sheet.tsx:305) reads the shell bar while keyboard anchoring, but refreshes only on visual-viewport resize/scroll. Its stored top can remain stale after a warning transition. I found no concrete newly blocked control from that fact: the sheet is above the shell, retains its own visible-area cap, and short sheets may cover the shell warning. It does, however, qualify the evidence’s blanket “sheets follow the bar” statement. The drag clamp reads the bar afresh on pointer movement.

**Trigger timing:** the effect runs after React commits the class change; rectangle reads force current layout. The frozen-header handlers additionally defer their measurements. I found no stale-height race caused simply by dispatching before browser paint. Skipping the first draw is sound because the mounted consumers measure their initial geometry. Repeated failed attempts leave the Boolean unchanged and need no new height notification.

**Warning-count analysis**

Every successful `cover(1)` returns exactly one cleanup. Failure ending, `active` changing, or unmounting runs that cleanup. Development replay balances setup → cleanup → setup. Two registrations count 2 → 1 → 0 as they close; neither can uncover the shell prematurely.

The board supplies its actual open state. Inputs and Medical are mutually exclusive and unmount with their page. OIL’s grid/settings paths both retain warning coverage. I found no demonstrated normal route leaving the shell hidden with no visible warning.

This counter hides the **shell copy**, not competing surface copies. The present tests should not be described as proving arbitrary stacked-surface accessibility.

**Remaining test and evidence limits**

- Removing only the Tracker menu/Find resize listeners would leave the new save-note tests green: neither is opened during the transition case.
- The board closes **after recovery** in the browser test. Closing it while failure persists, multiple-band cleanup and development replay are not directly tested.
- ALL AVAIL is inspected while hidden, not opened and operated. Its controls, saved dimensions and moved-window recovery remain unproved by these cases.
- The frozen-header tests establish alignment but do not press a frozen-header control.
- The Tracker click recorder proves delivery of the press, not completion of the Tracker save operation. That narrower claim is valid.
- The OIL test begins failure before opening the surface; failure arising during credit/settings work is not exercised.
- The new unit test separates manual from automatic recovery correctly. The older unit test still waits 1,000ms, but the new shared-handler test supplies the missing isolated proof.

**Round-1 hunts retained:** I checked full-screen coverage, pinned controls, warning measurement, layering, other save states, accessibility/wording and test registration. I found no additional missing full-screen band, no new styling leak into “Saving…” or the Tracker’s own save words, and no additional concrete interception beyond the findings above. Physical iPhone bounce and operation without `ResizeObserver` remain limitations, not newly reproduced findings.

**Roll-call correction:** row 16 incorrectly says guests use the same shell and bar. [GuestApp.tsx:1](C:/Users/User/projects/Raptor/raptor-port/src/ui/GuestApp.tsx:1) is a separate read-only tree without this warning. Correct the record to an explicit unchanged exclusion; this is not a request to redesign guest access.

**D138:** D587’s revised short line now preserves the full row’s short-visit exemption. “A short visit” qualifies the window/sheet/menu exclusion; it does not exempt the full-screen OIL working surface. I found no contradictory meaning. D586 also retains its operative conditions.

**Checks:** Read-only source, stylesheet, test, ruling and evidence review completed. Source remained at the reviewed commit. Another process updated the evidence sheet during this review; I reread that change. It now reports passing final gates, but those are the builder’s results, not runs I witnessed.

**Walk: NOT DONE — this session was expressly limited to reading and reasoning.**

This is the last review round. The builder should fix and verify the findings above, then report their dispositions beside this report.

**Rulings: none this session.**


