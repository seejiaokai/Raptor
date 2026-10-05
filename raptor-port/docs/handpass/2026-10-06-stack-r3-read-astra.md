## 1. Findings

**CHANGES REQUIRED.** One functional issue remains. A second issue in the specified commits received an uncommitted correction during this review.

Reviewed `08c6599a..7482ee18`. The checked-out committed source matches that range’s final source. No files were changed by me, and no other reviewer’s report was opened.

**F1 — Medium: final Tab no longer lets the phone board catch up with saved flight details.**

- **Steps:** At phone width, open Monday’s Scheduler Board. Change a formation’s take-off and press Tab. Click directly into the day’s last input Remarks box, then press Tab again. Do not focus the formation’s Area time along the way.
- **Actual, traced from source:** The new take-off is saved, but the displayed Area time can remain the old value. Repeated copies of edited flight details can likewise remain stale. Repeated final Tabs do not resolve this.
- **Expected:** D597 keeps the caret in the last box without losing the catch-up redraw that previously happened at that boundary. The brief explicitly requires checking this on the board.
- **Cause:** [schedule-tab.ts:124](C:/Users/User/projects/Raptor/raptor-port/src/ui/schedule-tab.ts:124) restores focus **before** calling `notify()`. The board then skips its entire day panel because that panel contains the caret ([SchedBoard.tsx:294](C:/Users/User/projects/Raptor/raptor-port/src/ui/SchedBoard.tsx:294)). Its deferred redraw also refuses while text remains focused. `refreshWaveReports()` refreshes reporting captions, not Area time or repeated flight fields. Before this patch, final Tab left text and allowed the pending redraw.
- **Fix:** After the terminal Tab’s native save and navigation/dialog checks, complete the pending UI-only redraw before restoring focus. Resolve the surviving box again after that redraw, restore its caret without scrolling, and preserve any dialog that took focus. Do not trigger another save.
- **Test:** Add the steps above to the phone-board browser test. Assert the saved take-off, current displayed Area time, retained final-box focus, unchanged scroll position and exactly one edit. Repeat Tab and assert no additional edit. The existing board check asserts focus only; the recorded catch-up check, R3-14, exercises the week only.

**F2 — Medium in the specified commits; corrected in the working tree: the ring change breaks two existing tests.**

- **Trigger:** Run the existing `flagglow-css.test.ts`.
- **Actual:** Its two dotted-ring assertions still expect `1.5px dotted var(--hard)`. The source reader returns the new literal `var(--dot-w,1.5px) dotted var(--hard)` and does not resolve CSS variables, so both assertions fail.
- **Cause:** The changed [stylesheet rule](C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler/04-pucks-sections.css:94) was not accompanied by updates to the assertions at lines 115 and 131 of the committed test.
- **Fix and test:** Update both exact expectations to retain the variable, fallback width, dotted stroke and red colour; preserve the existing precedence comparisons and the new browser width tests.
- **Current status:** That exact correction appeared uncommitted while I was reviewing. I read it: it preserves the assertions’ purpose. I did not run it, so this is a corrected source mismatch, not a verified passing test result.

## 2. Checked and sound

- **Tab boundaries:** Source tracing preserves ordinary same-day control exits, reverse Tab, modified-key exclusions, preview/OIL/member guards, and the stop when saving opens a window.
- **Saving:** The new terminal branch uses the existing blur save. Its added notification contains no second writer.
- **Independent questions:** Each question is found and removed by its own formation/node. Blue, Red and Later no longer remove neighbouring questions.
- **Question lifecycle:** Reconciliation checks every question separately; formation identity/context guards remain intact. Week/session resets clear the collection; board navigation, tracking changes and invalid targets remove stale questions.
- **Question ownership:** The save-before-answer path checks the answer’s formation before selecting an active editor. I found no new path that saves another formation’s Remarks into that answer.
- **Bounded collection:** Existing questions are replaced per formation, and invalid/disconnected entries are reconciled. I found no unbounded accumulation path.
- **Changed assertions:** W9 now requires both questions and verifies independent saved answers. The reversed final-Tab expectation implements D597 and retains reverse navigation checks. Neither is merely weakened.
- **Ring implementation:** Startup installation, inherited stylesheet variable, resize handling and resolution-listener replacement are connected. Whole-number scaling retains the fallback; larger fractional scaling retains an already wider stroke.
- **Ring evidence:** I inspected the supplied comparison image and measurements: stronger dots at 125% and 80%, unchanged recorded results at 100%, 150% and 200%. Floating windows and drag clones inherit the document variable; print/export use separate output, and Leave War/Tracker do not consume this ring rule.
- **Words:** D597–D601 and rewritten D553, D535, D523, D510 and D590 preserve the operative decisions when read with their referenced conditions. The D601 guide addition correctly closes the one-time comparison without changing independent-review requirements.

## 3. Older, not this change

No separate older defect is raised.

## 4. What I did not check

No build, test suite, server or live browser walk was run, as instructed. Findings are based on source tracing and comparison with the preceding code; recorded passes were not independently reproduced.

Reading alone does not verify native focus/scroll timing, physical iPhone behaviour, monitor-change events, or ring collisions with neighbouring pucks and corner tags at extreme scaling. The supplied ring pictures do not cover all those combinations.

The workspace changed during review. I checked the ring-test correction described above; later additions to the mission-role tests were outside the specified committed review range and were not reviewed.

**Walk:** not run; recorded table, script and ring comparison inspected.  
**Rulings:** none this session.

