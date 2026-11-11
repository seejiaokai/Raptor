**One new regression found:** closing the event box without a tap can swallow the next deliberate grid tap. The eight named windows are connected to the existing guard, but “every window over the grid” is broader than the implemented coverage.

I reviewed the specified comparison against `24a75372d`. The checkout’s later commits contain no further changes under `src` or `e2e`. I changed nothing, ran no build or browser tests, and opened neither the handoff nor another reader’s report. No handoff block appeared.

Evidence references below are relative to `raptor-port/`, unless stated otherwise.

**Finding 1 — P2: Escape, scrolling or resizing can arm the event-box guard using an old press.**

Concrete failure:

1. Use an admin account on a touch tablet or touch laptop with a keyboard.
2. Tap a populated Event cell to open its small event box.
3. Tap the event’s name inside that box. This does not close it.
4. Press Escape.
5. Within 600 ms, tap a grid cell within 32 px of that earlier press.
6. The box has closed, but the intended grid tap does nothing. It should open the cell normally: Escape was not a closing tap.

A second route needs no keyboard: after pressing inside the event box, scroll or resize so the box disappears, then touch the exposed grid near that old position. The old press has no age limit; even a much earlier press can supply the location.

**Cause:** the changed [inside-window test](C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8/raptor-port/src/leavewar/ui/Matrix.tsx:1563) now recognises `.evpeek`, and the [new bit](C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8/raptor-port/src/leavewar/ui/Matrix.tsx:1590) arms the guard when it disappears. However:

- The keyboard reset listens on **document**: `Matrix.tsx:1566–1568`.
- The event box catches Escape on **window**, stops propagation, then closes: `Matrix.tsx:1849–1859`. The reset never receives that key.
- Scroll and resize close the box without clearing the remembered press: `Matrix.tsx:1842,1856–1857`.
- The guard accepts that remembered location without checking whether a tap caused this close: `Matrix.tsx:1537–1548`.

**Evidence run:** an isolated, in-memory DOM probe using the actual guard body confirmed that Escape closed the box, the document keyboard reset did not run, and the subsequent grid click was swallowed. The scroll-close variant also swallowed it. Control cases—distant touch, mouse single click and keyboard-generated click—reached the grid. This establishes the event-handling fault, not its rendered geometry.

**Does main do the same? No.** The baseline neither recognises an event-box press as `inWin` nor arms on the event box disappearing.

**Exact fix instructions:**

1. Add a helper for dismissing the event box **without a closing press**. It must clear `lastPressRef.current` before clearing `evPeek`.
2. Use that helper for the event box’s scroll, resize and Escape handlers.
3. Use it for the pinch-start dismissal at `Matrix.tsx:1278`.
4. Keep Edit’s existing press-driven close and the outside-pointer/cell-toggle routes separate. Edit should still use the same grid guard.
5. Add a regression test: open `event-0-2026-01-01`; touch inside `event-peek`; dispatch Escape from that element; immediately touch `cell-asics-2026-01-29` at the same coordinates; assert the bid window opens.
6. Repeat with scroll and resize instead of Escape, including an old inside press made more than 600 ms before dismissal.
7. Retain the positive Edit-close test so the correction cannot disable genuine closing-tap protection.

**1. Window and overlay roll-call**

“Guarded” below means connected in source. It is not a claim that I walked its geometry.

| Surface and visible door | Closing coverage and whether omission is safe |
|---|---|
| **Required selection panel** — select Required cells; ✕, Apply, Clear | **Missing.** Its state belongs to `FlyRows`, not the new mask. A closing button can expose the grid. `FlyRows.tsx:361–363`; `ReqPanel.tsx:95–114,122,146–148`. |
| **Rename Required row** — tap its name; ✕, Save, Cancel | **Missing; not inherently safe.** Independent state and a floating sheet. `FlyRows.tsx:365–367`; `ReqNameForm.tsx:20–40`. |
| **Required figure editor/phone number pad** — tap a Required figure; Done | **Missing; not inherently safe.** Done closes an editor over the grid. Outside presses deliberately save/close it. `FlyRows.tsx:357–359`; `FlyEdit.tsx:179–205,254`. |
| **Available-row calculation box** — inspect the figure | No bit; safe for this promise because it has no internal closing action. `FlyRows.tsx:375` onward. |
| **Day-details panel** — tap a date heading; ✕ | **Missing; not inherently safe.** This is distinct from the guarded one-person, one-day bid window. `Matrix.tsx:3743`; `DayPanel.tsx:34,69`; `ui/FloatWindow.tsx:269`. |
| **New period** — View → + New period; ✕ or Create | **Missing; not inherently safe when an existing grid lies beneath.** Its state belongs to the top row. The first-ever-period case has no grid underneath. `Chrome.tsx:123,137,219,259`; `WarSheet.tsx:54–66,85–88,125`; `LeaveWarPage.tsx:136` onward. |
| **Open for bidding** — opening-date chip; ✕ | **Missing.** Phone presentation fills the screen, but desktop/tablet presentation can expose the grid beneath its closing button. `Chrome.tsx:282,469–476,652`; `OpenDatesSheet.tsx:195–199`. |
| **Event box** — tap a populated Event cell; Edit, outside press, Escape, scroll, resize | Added bit 256. Edit arms it; outside presses retain the accepted exception. Non-tap closes have Finding 1. `Matrix.tsx:1837–1869,4539–4557`. |
| **Person window / My leave** — tap a name, balance or My leave; ✕, OIL link, leave-line navigation | Added bit 2. All parent-state closes are covered, including phone leave-line navigation. Outside presses intentionally leave this non-blocking window open. `Chrome.tsx:230–239`; `Matrix.tsx:4492–4510`; `PersonWindow.tsx:232–235`. |
| **Settings** — gear; ✕, Rearrange, Calendar, Events, + Counter | Added bit 4. Both direct closes and handovers drop it. `Matrix.tsx:4629–4645`. |
| **Event window and Event presets** — empty Event cell, event-box Edit, Events list; ✕, Save, Delete, Move, presets Back/Done | Bit 8 covers the parent event window. Internal presets ↔ event transitions retain that bit; returning to the Events list drops it. `EventSheet.tsx:204–212,284–292,318,396,406,583`; `Matrix.tsx:4574–4604`. |
| **Counter form, including Available-row configuration** — + Counter, Edit counter, Available row name; ✕, Save, Cancel, confirmed Delete | Added bit 64, correctly treating `null` as “new counter open” and `false` as closed. `Matrix.tsx:363–368,4621–4622`; `CounterForm.tsx:319,327,528–540`. |
| **Manning explanation sheet** — tap a counter name; ✕ or Edit counter | Added bit 32. Edit hands over to the counter form. `ManningSheet.tsx:74–78,138`; `Matrix.tsx:4611–4616`. |
| **Events list** — Settings → Events; ✕ | Added bit 16. It remains logically open while an event editor replaces its rendering. `Matrix.tsx:348–350,4594–4604`; `EventsSheet.tsx:242–246`. |
| **OIL tracker and its full-screen settings** — OIL tab or person’s OIL link; ✕ | Added bit 128. Switching its internal settings, range picker, legend or ledger editor does not drop the parent bit, correctly: the tracker still covers the grid. `Matrix.tsx:4567–4571`; `OilTracker.tsx:430–475,722–814`. |
| **One-day family** — bid picker, day list, remarks, filed-input information, credited/awarded OIL, closed-bidding note, posting-in/out sheets | Existing bit 1 remains. These are alternative renderings of `open`; all their parent closes retain the original mechanism. `Matrix.tsx:4265–4353,4433–4479,4661` onward. |
| **People’s drag-selection sheet** | Shares existing bit 1 with `open`, exactly as before. `Matrix.tsx:4358–4381`. |
| **⋯ menus and posting question cards** | No independent bit needed while the parent remains. If an action closes the parent, its bit supplies protection; these controls remain inside the sheet. `BidBits.tsx:50–98`; `BidPicker.tsx:971,1101`; `SelectSheet.tsx:486,563`; `ui/AskCard.tsx:107–120`. |
| **Inline calendars, date/month/year pickers; Settings colour palette and confirmation controls** | No independent bit. Closing these normally leaves their containing window in place, so omission is safe for reaching the grid. `RangePicker.tsx:57–83`; `SettingsSheet.tsx:126–163`; `Sheet.tsx:128–140`. |
| **Grades and grade-choice menu** — Balances → Grades / a grade box | No bit; safe for this grid-specific promise because Balances replaces the grid. Returning to Grid unmounts Balances and its local overlays. `BalancesPage.tsx:386–431,647,682,775`; `LeaveWarPage.tsx:112–119`. |
| **Approvals and its date picker** | Approvals is a replacement page, not a window exposing the grid on close. The date picker has its own dismissal handling. The slim Approvals bar is separate. `LeaveWarPage.tsx:112–119`; `ApprovalsPage.tsx:102–163,418–421`. |
| **Legend** — grid-bar Legend | No bit. It closes by its toggle, outside shade or Escape, not an internal finishing button over the grid. This is safe under the stated outside-tap exception. `Chrome.tsx:409–424,532–545`. |
| **Under-manned days list** — red-day count | No bit. Its internal date buttons close the list and navigate, so it is **not inherently protected** against a second tap reaching the newly exposed grid. `Chrome.tsx:494–517`. |
| **Qualifications tooltip** — CAT chip hover/tap | No bit needed: it is informational and ignores pointer events. `Matrix.tsx:4514–4533`; `matrix.css:2104`. |
| **Document viewer and shared document questions** — document chips | No bit; these are `.airpop` surfaces, not `.bidsheet`. Safe where a blocking parent still shields the grid, but **not guaranteed** over a non-blocking person/day window. `PersonWindow.tsx:330`; `DayList.tsx:115`; `ui/DocViewer.tsx:149–185`; `Sheet.tsx:135–140`. |
| **Calendar opened from Settings, and its child windows** | Settings’ departure arms the guard, but the scheduler-owned window’s later close is not registered. No blanket coverage. `Matrix.tsx:4642–4645`; `.claude/rules/seams/leave-war.md:163` onward. |
| **Move banners, Manning feedback and Events undo note** | Not new window bits. Manning’s Show already explicitly calls the same guard with its separate 450 ms mode. Other banner dismissals are unchanged. `Matrix.tsx:1512–1554,4390–4426`; `Sheet.tsx:131–134`. |

**Older, in passing:** the unguarded surfaces above already behave that way on the baseline; under your exclusion they are coverage limits, not additional new-code findings.

**2. Closing actions**

For the newly registered windows, ✕, Cancel and successful finishing actions reach the same parent-state close. I found no missing closing callback among the eight named surfaces.

- **Failed saves that keep a window open:** no bit drops, so no new guard. Confirmed for the event save (`EventSheet.tsx:284`) and counter save/delete (`CounterForm.tsx:319,540`).
- **Actions that keep the window open:** editing thresholds, settings, balances or event presets does not itself arm the guard.
- **Outside tap:** the remembered target is outside the window, so the guard declines to arm. This matches the exception in the brief (`Matrix.tsx:1541,1563`; `Sheet.tsx:116–145`).
- **Keyboard close:** ordinary sheet Escape reaches the document reset; the event box is the exception in Finding 1.
- **Undo/store changes:** there is no general “a tap caused this close” check. A falling bit uses whichever press remains remembered. Conversely, a renderer disappearing while its state stays set produces no falling bit.
- **Leaving the page:** the grid is normally kept mounted and hidden; this does not itself clear every window bit. The listener still targets only `.mx`, and its timer continues. Actual unmount removes it (`LeaveWarPage.tsx:7–25,112–115`; `Matrix.tsx:1571–1573`).

**3. False swallows and meaningful action orders**

The highest-priority scenarios, starting with specialised surfaces, are:

| Rank | Setup and exact action | Expected result / disproof |
|---|---|---|
| 1 | Touch device with keyboard; populated event → touch its box text → Escape → same-position grid touch | Grid opens normally. A dead tap proves Finding 1. |
| 2 | Populated event → touch box text → scroll/resize closes it → same-position touch | Grid opens normally. A dead tap proves the non-tap variant. |
| 3 | Admin; open Required panel, rename form, day panel or New period; place a grid cell beneath ✕; tap twice 80 ms apart | Under the broad promise, no new grid window. A newly opened day demonstrates the older coverage gap. |
| 4 | Settings → + Counter; immediately press the new form’s control at the old control’s position | New form receives the press. Repeat Manning → Edit counter, event box → Edit, person → OIL, Events → event → Events. |
| 5 | Person window remains open; open and close a second window; immediately press the person window, then a distant exposed grid cell | Both intended presses work. Only an exposed same-position grid tap is suppressed. |
| 6 | Close Settings; start a scroll or two-finger pinch immediately | Scroll/pinch begins normally; no day opens. |
| 7 | Close a window; touch 33 px away, then repeat after 650 ms at the same position | Both taps work. Also test the boundary at 32 px and 500 ms. |
| 8 | Close a window; press Undo, bell, menu, month button; repeat with mouse single click and pen | Top controls and month navigation work; mouse single click works; pen follows touch protection. |

I checked `Matrix.tsx:1542–1554` and found **no new fault** in distant taps, keyboard-generated clicks, mouse single clicks, month buttons or top-bar targeting. Pen is intentionally treated like touch.

I checked the pinch setup and pointer handlers (`Matrix.tsx:1251–1279`, `select.ts:259,629–637`) and found **no new interception of scroll/pinch starts**: this guard listens only for `click`.

I found no new permanent guard. Each arm removes the preceding listener and creates one timer; unmount cleans it up. Successive closes can restart the interval. The timeout is unchanged and does not contain a separate elapsed-time check.

**4. The bits and handovers**

The bit operation correctly notices a disappearing window even while another remains open, or another bit rises in the same render. Two disappearing bits cause one guard call. An open-and-close entirely within one committed render leaves no transition to observe.

However, the bits are **not exact visibility flags**:

- Events remains true while its editor hides the list: `Matrix.tsx:4594`.
- Person visibility also requires `whoPerson`: `Matrix.tsx:4492`.
- OIL visibility also requires its person still to exist: `Matrix.tsx:4567`.
- Event, Settings and Counter rendering also require admin role: `Matrix.tsx:4574,4621,4629`.
- Event-box rendering requires non-empty event text, even while `evPeek` remains set: `Matrix.tsx:4540–4543`.

I found no demonstrated new fault from those mismatches beyond Finding 1. They mean the mechanism watches stored opening state, not every actual disappearance.

Handovers arm the guard, but replacement-window controls are outside the `.mx` tables. I checked their render sites and found no new case where the guard consumes the replacement window’s first button. A browser test is still needed to verify real overlap and targeting.

**5. What recognising the event box changes**

Previously, a press inside `.evpeek` was not remembered as a window press. Now it is, including presses on its text—not only Edit (`Matrix.tsx:1563`).

This does **not** make the guard swallow clicks on the event box itself: it remains outside `.mx`. It enables protection after Edit, and also enables Finding 1 when the box disappears for another reason.

**6. Roles and sizes**

- Admin-only windows retain their existing role conditions; no permission logic changed.
- Members receive the same guard on person/My leave, Manning, OIL, event information and their permitted day windows.
- Guest/view-only access uses `GuestApp`, not the Leave War. I found no new guest route into it (`ui/App.tsx:57`; `state/perms.ts:115`).
- The guard has no width breakpoint. Touch and pen on a desktop receive the same treatment as on a phone. Mouse single clicks remain exempt.
- The new browser tests run only in `lw-phone`; tablet and touch-desktop behaviour is not established by them (`e2e/doubletap-leavewar.spec.ts:18,81–84`).

I found no role-specific regression in the changed lines.

**7. Tests**

The positive unit tests generally exercise the new state transitions. I found no hollow new positive unit test by source inspection, but I did not run a reverted-fix mutation test.

Three browser cases explicitly pass without the fix:

- Events list ✕.
- OIL tracker ✕.
- Event-box Edit handover.

Their comments acknowledge this (`e2e/doubletap-leavewar.spec.ts:130–165`). They are useful regression checks, not proof of newly added protection.

Missing or incomplete coverage:

- Finding 1: event-box Escape, scroll, resize and old remembered presses.
- Real handover **interaction**: the current Edit test checks that nothing else opens, not that the next intended button works.
- One of two windows closing while the other remains.
- Touch desktop, tablet, member and pen cases.
- Immediate scroll/pinch, top-bar actions, failed saves, state-driven disappearance and unmount cleanup.
- Direct assertions that no record was written.
- The uncovered overlays in the roll-call.

The browser window detector also lists `sel-sheet`, while production uses `select-sheet` (`doubletap-leavewar.spec.ts:20`; `SelectSheet.tsx:417`). It omits several one-day renderers. Its “nothing opened” assertion is therefore not exhaustive.

**8. The first guard**

I compared the original and reviewed guard bodies. The 600 ms duration, 32 px radius, mouse/key/month exceptions and cleanup are unchanged. `open || sel` remains one bit, so their existing handover still does not arm it.

I found no direct regression in an isolated one-day/drag-window flow. Mixed flows can now arm the shared guard because another registered window closes; Finding 1 is one such newly reachable effect.

The code does not contradict either accepted exception: top-bar presses remain outside the guard, and outside-grid dismissal retains its existing second-tap behaviour.

**9. Tidiness note — report only**

- No duplicate guard was introduced.
- `winsUp` suggests actual on-screen visibility, which several operands do not represent.
- The new explanatory comment repeats much of the preceding guard explanation and overstates “every window.” Named bit constants would make future omissions easier to review.
- The tests duplicate touch/mouse helpers from the first guard suite. This is minor test maintenance, not a correctness finding.

**Checks:** source comparison and isolated in-memory DOM probes only; no mounted-app unit run, browser walk or build. No files, commits or pushes made.

**Rulings:** none this session.

**Verdict: fix the event-box non-tap regression before acceptance; the eight-window extension must not be described as covering every overlay.**

