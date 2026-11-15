# Astra's blind read — claude/lw-doubletap-more ([LW-DOUBLETAP-MORE-WINDOWS]), 15 Nov 26 (~05:50)

Its final answer, as returned by `codex exec` (read-only); the full run log stayed in the night's scratch folder.

**One new fault found:** closing the Required number pad with Escape can make the guard swallow the next deliberate grid tap.

I reviewed the specified three code commits against the supplied `main` baseline, `9cc49fcca`. The checkout’s reviewed source matches `a9d6937a0`. I changed no files, ran no build or browser test, and opened none of the excluded handoffs or reports. No handoff block appeared after compaction.

**F1 — P2: Escape from the Required number pad reuses an earlier finger press.**

Concrete failure, for an admin on a touch tablet or touch laptop with a keyboard, at 1024 × 768:

1. Open a Required cell by touch.
2. Arrange the page so a live grid day stands behind the pad’s **5** key.
3. Tap **5** and release.
4. Within one second, press **Escape**. The pad closes without saving.
5. Within 600 ms, tap the exposed day where **5** stood.

The day should open immediately: a keyboard close must leave the grid working. Instead, the guard swallows that tap.

The new Required-editor reporting call is [FlyRows.tsx:252](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyRows.tsx:252). Its interaction with two existing listeners causes the fault:

- The editor handles Escape on **window capture**, stops the event travelling farther, and closes: [FlyEdit.tsx:192](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyEdit.tsx:192).
- The grid forgets the previous pointer press on **document capture**, which therefore never receives Escape: [Matrix.tsx:1588](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1588).
- When the new editor bit falls, the guard accepts the remembered digit press and its coordinates: [Matrix.tsx:1543](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1543).

**Comparison with main:** the same Escape listeners exist there, but the Required editor does not report its close to the guard. This particular grid tap gets through on the supplied main baseline.

**Proof performed:** an in-memory DOM experiment using the actual guard and editor Escape-handler bodies reproduced the difference. Without the new editor bit, the grid click reached its handler; with the bit, the click was prevented. This establishes the event-order failure; I did not run the rendered app.

**Exact fix:**

1. Move the grid’s press-forgetting `keydown` registration from `document` capture to `window` capture.
2. Move its matching removal to `window` capture as well.
3. Keep it active for the grid’s lifetime.
4. Add a regression test that opens the touch pad, sends touch pointer-down **and pointer-up** to a digit, sends Escape from that button, then immediately sends a touch tap and detail-1 click to a grid cell at the same coordinates.
5. Assert that the pad closes, the figure remains unchanged, and the grid cell opens.
6. Repeat the sequence in the browser at 1024 × 768, with a live day physically beneath the digit.

The existing Escape test exercises the **day panel**, whose Escape listener runs later and does not expose this fault: [doubletap-more.test.tsx:271](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/doubletap-more.test.tsx:271).

**Questions 1–2: the windows and their ways out**

In the tables below, “guarded” means an inside closing press is remembered, the close follows within one second, and the subsequent touch or pen click lands within 32 px during the 600 ms guard. Outside-grid closes retain the agreed behaviour. The Escape exception above applies to the Required editor.

Starting with the least-shared surfaces:

| Window and visible way in | Closing paths and guard assessment |
|---|---|
| **Required selection panel**, opened by selecting Required cells | ✕ and successful **Apply/Clear** are guarded. Failed saves leave it open. Escape clears the press normally. A fresh drag changes its selection without closing it. A plain grid-cell click closes it while opening that cell; that outside press remains unguarded. [ReqPanel.tsx:94](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/ReqPanel.tsx:94), [gridclick.ts:22](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/gridclick.ts:22). |
| **Required rename form**, opened from a Required row’s name | ✕, successful **Save**, and **Cancel** are guarded. A refused Save stays open. Shade and Escape use the shared sheet behaviour. The visible bit includes the admin condition. [ReqNameForm.tsx:20](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/ReqNameForm.tsx:20), [FlyRows.tsx:144](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyRows.tsx:144). |
| **Required figure editor and touch number pad**, opened from a Required cell | **Done** is guarded after a successful save. **Previous/Next** also close when there is no next eligible date; those closes are covered. Otherwise they replace the edited day while keeping the bit up. Outside presses save and close without guarding that grid press. Refusal keeps it open. **Escape has F1.** [FlyEdit.tsx:168](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyEdit.tsx:168), [FlyEdit.tsx:187](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyEdit.tsx:187). |
| **Day panel**, opened from a date heading | ✕ is guarded. ‹ and › change the date without dropping the bit. Outside presses leave it open. Escape reaches the grid’s key listener before the panel’s window-bubble listener, so it does not arm from an earlier touch. [DayPanel.tsx:33](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/DayPanel.tsx:33), [FloatWindow.tsx:227](/C:/Users/User/projects/Raptor/raptor-port/src/ui/FloatWindow.tsx:227). |
| **Under-manned days list**, opened from the red-days chip | A row focuses its day and closes the list; that inside tap is guarded. The shade closes it without arming. Escape clears the remembered press. Disappearance because no red days remain also drops the visible bit. [Chrome.tsx:360](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Chrome.tsx:360), [Chrome.tsx:419](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Chrome.tsx:419), [Chrome.tsx:504](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Chrome.tsx:504). |
| **Record move banner**, reached through Move | Successful **Confirm** and **Cancel** are guarded. A refused Confirm leaves move mode up. A landing made directly on the grid remains unguarded by this close mechanism. [Matrix.tsx:746](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:746), [Matrix.tsx:4428](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:4428). |
| **Event move banner**, reached through an event’s Move | The same distinction: successful Confirm/Cancel guarded; refused Confirm stays open; grid landing remains the grid’s gesture. [Matrix.tsx:820](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:820), [Matrix.tsx:4449](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:4449). |
| **New period**, opened by **+ New period**, or requested by the Holidays window | ✕ and successful **Create** are guarded, including Create switching to the new period. Refused Create keeps the sheet open. Shade/Escape use the shared sheet behaviour. Both openers reach the same reporting state. [Chrome.tsx:124](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Chrome.tsx:124), [Chrome.tsx:263](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Chrome.tsx:263), [WarSheet.tsx:54](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/WarSheet.tsx:54). |
| **Open for bidding**, opened from the bidding-dates chip | The outer ✕ is guarded. Shade/Escape close through the shared sheet. Opening, saving, cancelling or closing an **inner exact-date editor** leaves the outer window up, so no outer bit drops. On a phone the outer ✕ exposes the top bar rather than the grid. [Chrome.tsx:369](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Chrome.tsx:369), [Chrome.tsx:662](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Chrome.tsx:662), [OpenDatesSheet.tsx:153](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/OpenDatesSheet.tsx:153). |

The pre-existing guarded windows remain present:

| Window or renderer | Coverage and visible door |
|---|---|
| **One-day bid window** | A person’s day opens it; the existing `open` state covers its closing actions. |
| **Day’s list** | A day holding several qualifying entries opens it; it shares that same state. |
| **Remarks, Inputs-filed record, credited OIL, own OIL award, closed-day note, Post out and Post in windows** | These are alternative renderers for the opened day, covered by the same bit. Their production mounts and closing callbacks are at [Matrix.tsx:4303](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:4303), [Matrix.tsx:4471](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:4471), and [Matrix.tsx:4502](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:4502). |
| **Drag-selection window** | Selecting people’s days opens it. It shares the original bit with the one-day family. [Matrix.tsx:4396](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:4396). |
| **Person window** | A name, balance or My leave opens it; its own bit remains. |
| **Settings** | The gear opens it; its own bit remains. |
| **Event window and Event presets renderer** | An event’s Edit, + Event or Edit presets opens them; the event bit covers the outer close. Moving between the event and its presets keeps an outer window present. [EventSheet.tsx:204](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/EventSheet.tsx:204). |
| **Events list** | Events in Settings opens it; its existing bit remains. |
| **Manning explainer** | A Manning row’s name opens it; its existing bit remains. |
| **Counter form** | Settings’ + Counter or an existing counter’s edit opens it; its existing bit remains. |
| **OIL tracker, including its settings renderer** | The OIL tab or a person’s OIL figure opens it; its existing bit remains. |
| **Event box** | A filled event cell opens it; its existing bit remains. |

The eight individual outer-window bits and their shared-hook replacement are visible together at [Matrix.tsx:1622](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1622); their renderers and hand-overs are at [Matrix.tsx:4530](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:4530) and [Matrix.tsx:4605](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:4605).

I also checked these omitted or nested surfaces:

| Surface | Does its omission safely leave the grid exposed? |
|---|---|
| **Available figures’ working box** | Safe under the agreed outside-close rule: it has no inside finishing/closing control. Outside press, Escape, scroll, resize or zoom dismisses it. [FlyRows.tsx:267](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyRows.tsx:267). |
| **Legend** | Safe: its content has no inside closing action; shade/Escape dismiss it. [Chrome.tsx:552](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Chrome.tsx:552). |
| **Qualification tooltip** | Safe: no inside action closes it onto the grid. Its chip, outside press, pointer departure, scroll, resize or Escape dismisses it. [Matrix.tsx:1909](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1909). |
| **Bid/selection ⋯ action menus** | Their parent window survives an ordinary menu close. An action that closes the parent is covered by the parent’s bit. The menu separately consumes an outside closing click. [BidBits.tsx:49](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/BidBits.tsx:49). |
| **Range calendars and their month/year lists; Settings’ colour choices; posting questions and delete confirmations** | Nested within a surviving parent window. Closing only the nested part does not expose bare grid. Examples: [OpenDatesSheet.tsx:158](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/OpenDatesSheet.tsx:158), [SelectSheet.tsx:567](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/SelectSheet.tsx:567). |
| **OIL credit form/editor, date calendar, range picker and legend** | Inside or above the surviving OIL tracker. Closing these leaves that tracker covering the grid. [OilTracker.tsx:722](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/OilTracker.tsx:722), [OilTracker.tsx:809](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/OilTracker.tsx:809). |
| **Document viewer and shared app questions** | Ordinary closure returns to the surviving parent sheet. The sheet explicitly recognises these separate layers. [Sheet.tsx:126](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Sheet.tsx:126). |
| **Grades window, grade picker and Approvals date picker** | These stand over replacement pages while the grid is hidden. [LeaveWarPage.tsx:109](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/LeaveWarPage.tsx:109). |
| **Manning result bubble’s Show** | Already arms its separate, unchanged guard. [Matrix.tsx:1520](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1520). |
| **Native period picker** | Browser-owned control, unchanged; its selection press is outside the window selector. [Chrome.tsx:215](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Chrome.tsx:215). |

I found no additional missing reporting call for a qualifying window already standing over a mounted grid. First-period creation is distinguished below.

For non-tap causes, the important limitation is that **the hook detects disappearance, not its cause**. It asks the guard to arm; the guard then uses the most recent inside press younger than one second. Thus a store-caused disappearance within that second can use the earlier press’s place. With no qualifying remembered press, it does nothing. That is visible at [gridguard.ts:25](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/gridguard.ts:25) and [Matrix.tsx:1554](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1554). F1 is a concrete newly reachable failure of that distinction.

Undo, changed bidding dates and period changes clear move states through [Matrix.tsx:639](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:639); leaving the screen clears them through [Matrix.tsx:685](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:685). A normal top-bar press or keyboard Undo supplies an outside press or clears the remembered press. I found no additional concrete regression on those routes.

**Question 3: false swallows**

Apart from F1, I checked the following and found no new fault in the source:

- **Elsewhere:** distance is measured against the closing press; beyond 32 px the tap passes.
- **A replacement or surviving window:** the guard accepts only clicks whose actual DOM target is within a grid table. The new windows stand outside those tables, so their controls pass.
- **Required panel’s working background:** opening it does not arm anything. A new drag keeps its bit up; a plain cell click closes it using an outside press.
- **Top bar:** its targets are outside the grid tables.
- **Immediate scroll/pinch:** the guard intercepts clicks, not pointer-down or movement. Pointer cancellation also forgets the cancelled press.
- **Mouse:** a single mouse click passes; a browser-counted double click at the close point is intentionally guarded.
- **Pen:** it follows the touch classification.

The checks are at [Matrix.tsx:1555](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1555) and [Matrix.tsx:1571](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1571); the Required windows’ placement outside the tables is at [FlyRows.tsx:369](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyRows.tsx:369).

There is no new route to a permanently armed guard: replacement clears the previous listener, timeout clears it, and grid unmount clears it. The existing implementation uses a timer rather than checking elapsed time on every click, so delayed timer delivery can extend its effective lifetime. That is unchanged older behaviour.

**Question 4: the shared door and its bits**

I checked state, mounting and replacement at [gridguard.ts:17](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/gridguard.ts:17), [FlyRows.tsx:144](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyRows.tsx:144), and [Matrix.tsx:1627](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1627).

- The new day, selection, rename, move, creation and bidding bits correspond to their render conditions. The under-manned bit correctly uses **visible list**, including the red-day count.
- The Required “pad” bit actually covers the desktop editor too.
- Opening and closing entirely between committed renders produces no falling bit. I found no user-visible close route that depends on such an unseen window.
- Swapping bits arms the guard, but the replacement window’s own controls remain outside the grid tables.
- Unmounting a reporting component does **not** report a falling bit. Collapsing Manning unmounts the Required windows; that fold press is outside them, so no guard is expected.
- Leaving the Leave War usually hides the retained grid rather than unmounting it: [LeaveWarPage.tsx:111](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/LeaveWarPage.tsx:111).
- Actual grid unmount clears both its active guard and its shared registration.
- With no registered grid, reporting a close does nothing; the door retains no pending close.
- There is one production `Matrix` owner. The OIL tracker uses its own **oil-grid** table and does not register another guard: [OilTracker.tsx:775](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/OilTracker.tsx:775).

The single callback would not support two simultaneous `Matrix` owners safely, but I found no such production mounting.

Some **old** bits are not exact visibility bits—for example, Events remains logically open while its event form replaces it. That was already so; this change preserves it.

**Question 5: the wider inside-window selector**

The selector adds the day panel, touch pad, under-manned list and move banners: [gridguard.ts:15](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/gridguard.ts:15).

It changes whether a press can later qualify as the remembered closing press. It does not itself swallow any event. The eventual click still must target a grid table.

I checked the move banner’s controls and the move listener and found no new interception of Confirm, Cancel or a landing. The move listener resolves grid dates separately and leaves control clicks alone: [select.ts:942](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/select.ts:942). A successful direct grid landing has an outside-window press, so the new falling move bit does not guard it.

**Question 6: a Required close more than one second after its press**

**The builder’s limit is true.** Assuming no intervening qualifying press, the guard rejects a close once the remembered release is at least one second old.

The Required panel and editor can await a pending result before closing: [ReqPanel.tsx:94](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/ReqPanel.tsx:94), [FlyEdit.tsx:168](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyEdit.tsx:168). However, the current settings-save path and queued-command draining are synchronous: [flyplan.ts:74](/C:/Users/User/projects/Raptor/raptor-port/src/state/flyplan.ts:74), [commit.ts:160](/C:/Users/User/projects/Raptor/raptor-port/src/command/commit.ts:160).

I found **no network wait or human refusal question** between the Required press and successful close. A refusal displays its reason and keeps the editor/panel open. Slow synchronous work or delayed rendering can nevertheless exceed one second. Then the save succeeds, the window disappears, and a subsequent same-place tap can open the exposed grid day. I did not measure such a delay in the app.

**Question 7: roles and sizes**

| Person/device | Result of the read |
|---|---|
| **Admin** | Has every affected editing door. F1 applies when touch opens the pad and a keyboard supplies Escape. |
| **Member** | Required editing, rename, New period and event editing remain unavailable. The day panel, under-manned list, read-only bidding window and permitted own-bid move remain relevant. The new guard contains no role-specific bypass. |
| **Guest/view-only access account** | Uses a separate tree that does not mount Leave War: [App.tsx:44](/C:/Users/User/projects/Raptor/raptor-port/src/ui/App.tsx:44). There is no guest Leave War guard to exercise. |
| **Phone/tablet/touch desktop** | Touch classification comes from the actual pointer, not width. Bidding’s full-page phone layout differs from its floating tablet/desktop layout. |
| **Mouse desktop/pen** | Single mouse clicks retain the exception; pen follows touch. No new automated integration coverage verifies these external-window routes. |

I found no changed permission, saved-data writer or role leak. Required figures still write through the flying-plan settings path; rename still uses its existing name writer; moves still use the record/event move writers. The shared door only installs click suppression. A scheduler without admin authority was excluded as instructed.

**Question 8: tests, hollowness and missing cases**

The ordinary browser close tests have a useful safeguard: they prove a live grid target lies below the button, verify the second tap actually reaches the exposed grid, and prove that location works after expiry. See [doubletap-more-leavewar.spec.ts:73](/C:/Users/User/projects/Raptor/raptor-port/e2e/doubletap-more-leavewar.spec.ts:73).

I did not execute a revert experiment, so I do not claim every test was demonstrated red on main.

- The phone **Open for bidding** test passes without this fix because there is no grid under its ✕. It is a deliberate layout control, not proof of the new guard: [spec:308](/C:/Users/User/projects/Raptor/raptor-port/e2e/doubletap-more-leavewar.spec.ts:308).
- The day-arrow and pass-through tests should also pass on main by design.
- Under-manned navigation and New period Create use weaker checks than the common helper: they omit its later live-location control. [spec:195](/C:/Users/User/projects/Raptor/raptor-port/e2e/doubletap-more-leavewar.spec.ts:195), [spec:278](/C:/Users/User/projects/Raptor/raptor-port/e2e/doubletap-more-leavewar.spec.ts:278).
- Move setup waits 450 ms, shorter than the pre-existing 600 ms sheet-close guard. If the old Move position and banner control overlap within 32 px, that earlier guard could mask a missing new move bit. I could not establish that overlap without layout. Wait beyond 600 ms before testing the banner’s own close.
- The unit “second tap” assertion checks only that the bid picker stays absent. The browser oracle checks windows, not unchanged stored data or selection. Neither fully asserts “nothing picked, nothing written.” [unit:38](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/doubletap-more.test.tsx:38), [spec:21](/C:/Users/User/projects/Raptor/raptor-port/e2e/doubletap-more-leavewar.spec.ts:21).

The highest-priority missing cases, in the order I would run them:

| Rank | Exact setup and action | Expected result; observation disproving correctness |
|---|---|---|
| 1 | Touch a Required digit; Escape; immediately touch the exposed same-place day. | Day opens immediately; **F1 currently prevents it**. |
| 2 | Open Required selection; drag a different block while it stays open; then tap a Required cell behind it and operate the new pad. | Highlight and panel follow the new block; the cell opens its pad; its controls work. Any stale selection or eaten control disproves correctness. |
| 3 | Open the pad on the last eligible flying date; press Next; tap its exposed grid location after 80 ms. Repeat after 650 ms. | First tap guarded, later tap works. This qualifying closing arrow has no new test. |
| 4 | Refuse Required Apply, Clear, Done and rename Save separately. | Each window stays open; no guard activates merely from the failed action. |
| 5 | Keep day and Required panels open; close one; immediately press the survivor near the closing coordinates, then a grid day beyond 32 px. | Both deliberate presses work. |
| 6 | Close the under-manned list by its shade, then by a row; repeat a move with grid landing, Confirm and Cancel. | Outside/grid gestures pass; inside closing controls guard only the second same-place tap. |
| 7 | Close New period and bidding by touch on tablet; repeat by mouse, pen and keyboard. | Pointer-specific exceptions remain correct; replacement-window controls work. |
| 8 | Immediately after a close, press Undo/bell/menu; start a scroll; start a two-finger pinch. | Each intended action works; no grid selection or write occurs incidentally. |

Also absent are lifecycle tests, recent-inside-press followed by store-caused disappearance, slow Required save, and integration tests for members. All new test fixtures use admin. Existing tests cover some equivalent behaviours through older windows, but do not establish the new reporting paths.

**Question 9: the eleven already guarded**

I checked the old bit expression against the supplied main baseline. Its original bits are preserved; the old falling-bit calculation is moved into the shared hook. The one-day family and drag panel still share their bit; the day’s list still rides the opened-day state. The eight other windows retain their individual bits.

I found no separate new regression in those eleven. Their ordinary hand-overs still deliver presses to the replacement window because it is outside the grid tables.

The two ruled “leave it” behaviours remain consistent with the code: the top bar stays pressable, and an outside grid tap followed by another tap there remains a grid action. The filed event-box Edit double-tap behaviour is not addressed.

**Question 10: tidiness, filed only**

- The Required helper calls its first argument `pad`, although it receives `!!edit` and includes the desktop editor. Rename that argument/comment to describe the editor: [FlyRows.tsx:141](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/FlyRows.tsx:141).
- The browser skip explanation claims mouse-double-click coverage in the new unit file, which does not provide it: [spec:102](/C:/Users/User/projects/Raptor/raptor-port/e2e/doubletap-more-leavewar.spec.ts:102).
- The unit test labelled “a desktop click” actually uses the touch helper: [unit:289](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/doubletap-more.test.tsx:289).
- Several new comments repeat the same close/second-tap explanation already carried by the shared door. They could name only each call site’s particular exception.

**Older, in passing:** first-ever period creation has separate state and no guard reporter; it begins with no grid mounted, then creates one. Main does the same, so I have not counted it as a new finding. Its Create-to-new-grid sequence remains outside the new tests: [LeaveWarPage.tsx:136](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/LeaveWarPage.tsx:136).

Walk: **NOT DONE — prohibited by the brief.** Checks: source comparison and in-memory event experiments only. Rulings: none this session.

**Verdict: fix F1 before accepting the change; the remaining guard connections look complete by source read, with the browser cases above still unproved.**
