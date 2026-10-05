## 1. Findings

**MEDIUM — Final Tab leaves derived text stale on the phone Board.**

**Steps:** Start with fresh demo data at phone width (390 × 844), open Monday’s Scheduler Board, change the first formation’s Take-off from `1240` to `1255`, then press Tab to Landing. Without entering Area time, focus the last input’s Remarks box (`#sbBoard [data-ifld$=".rmks"]`, last occurrence) and press Tab.

**Actual:** Take-off is saved as `12:55` and the caret stays in Remarks, but the first formation’s Area time still reads `1240-1405`. It catches up only after entering that cell or leaving text altogether.

**Expected:** Keep the caret as D597 requires, while retaining the final-Tab catch-up described in [the contract](/C:/Users/User/projects/Raptor/raptor-port/docs/ui-contracts.md:534): Area time should read `1255-1405`, without storing an override.

**Cause:** [schedule-tab.ts:124](/C:/Users/User/projects/Raptor/raptor-port/src/ui/schedule-tab.ts:124) restores focus before calling `notify()`. [SchedBoard.tsx:294](/C:/Users/User/projects/Raptor/raptor-port/src/ui/SchedBoard.tsx:294) consequently skips the entire Board editing panel because it contains the caret. Its deferred paint also stops while text has focus (line 245). The in-place refresh updates wave headings and feedback, not Area time or repeated flight fields. Previously, final Tab left text and released that pending paint.

The same gap is reachable on the week when Flying is the last open section and the stale field shares that section with the final box.

**Exact fix:**

1. Keep the existing native blur, window checks, permission checks and live-box fallback.
2. In the forward/no-destination branch, refresh the other eligible text boxes from the existing model-reader callback. Collect them again after blur; exclude the retained box and all readonly, frozen, hidden and question fields. Preserve its position with the existing holding-place helper.
3. Restore/retain the final box and caret, then notify as today. Do not invoke sibling writers or release the full paint under the caret.

**Regression test:** Add the phone-Board sequence above. Assert Area time becomes `1255-1405`, the same final Remarks node remains focused, scrolling is held, the formation’s Area-time override remains null, and only the real Take-off edit creates a command. Repeat unchanged Tab and assert no additional command. Add a week case with Flying last and a stale field in another formation.

The current Board boundary test checks focus only. The catch-up test and saved R3-14 walk cover the week with its usual section order, where Flying can redraw independently. Both therefore miss this failure. This finding is established by the code path; I did not execute the reproduction.

## 2. Checked and sound

- **D597 focus behavior:** Read the route and both paint callers; forward/no-control retains the last box, ordinary controls remain destinations, and Shift+Tab’s boundary behavior is unchanged.
- **Save and route guards:** Traced native save handlers and post-blur checks; the new branch adds no writer and preserves window, navigation, permission, preview and OIL restrictions.
- **Notification:** Traced store subscriptions; it reaches the Board as well as the week and does not create a paint/notification loop. Its incomplete catch-up is the finding above.
- **Multiple questions:** Read the whole changed module and searched its callers; formation/day identity prevents duplicates, individual endings remove one question, and context resets clear all.
- **Question lifecycle:** Traced wording, identity, deletion/movement and published-version checks; each open question is reconciled independently, while Board day, week/session changes and tracking Off retain their global endings.
- **Answer ownership:** Traced `saveVisibleText` and role writers; answering A while editing B saves the appropriate Remarks and applies the answer to A. Published Remarks remain readonly.
- **Question memory:** The collection is bounded by current formations and pruned by reconciliation and resets; it is not an accumulating history.
- **Ring calculation and listener:** Read edge-case arithmetic, tests and installation; invalid values fall back, near-whole scaling retains the existing width, fractional scaling preserves thicker existing rings, and listener replacement/cleanup is present.
- **Ring reach:** Traced puck rendering, inherited CSS, floating windows and body-attached ghosts; the change alters outline width without changing box dimensions. Separate print/export output, Leave War and Tracker remain outside this selector.
- **Ring evidence:** Read the measurements and inspected the saved comparison: red-pixel counts increase from 34→92 at 0.8 and 100→233 at 1.25; recorded whole-scale cases remain unchanged.
- **Changed tests:** W9’s new ending implements D598 and strengthens ownership checks by answering each question separately. The reversed final-forward expectation implements D597; reverse assertions remain. These are ruled changes, not loosened assertions.
- **Test limitations:** The new assertions distinguish the former single-question and final-blur behavior, but the Tab tests can pass with the stale-panel defect above.
- **Words:** Compared D597–D601 and rewritten D553, D535, D523, D510 and D590 with their full rows; they preserve the current rulings and their remaining limits.
- **Working guide:** Read D601’s full row and the surrounding guide text; the added completion wording faithfully closes the trial without removing independent reads or other gates.
- **Saved walk:** Read all 38 recorded steps and their script; the reported checks support their stated cases, subject to the coverage gap above.

## 3. Older, not this change

None identified within this scoped read.

## 4. What I did not check

This was read-only: no files changed, and no build, tests, server or live browser walk ran. Recorded results are evidence from the supplied artifacts, not runs I performed. No other reviewer’s report was opened.

Reading alone cannot certify native keyboard/save ordering, caret and scroll behavior on physical iPhone Safari, live zoom or monitor-change delivery, or rasterized ring collisions at extreme scaling. The saved pictures do not establish every neighboring-puck, corner-tag, solid/dashed-ring combination. Removed/redrawn final boxes and saves opening windows were traced in code, not exercised.

Rulings: none this session.

