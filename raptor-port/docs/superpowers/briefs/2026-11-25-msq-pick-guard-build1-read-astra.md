# [MSQ-PICK-GUARD] Build 1's plan — the red team, round 1: Astra (GPT-6 Astra, `codex exec -m gpt-6-astra`, high) (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-build1-read-brief.md`. Read from an exported copy of commit `9c0d03e93` (`C:c175`; the handoff block and the plan writer's brief taken out). Blind to the other two readers; kept outside the checkout until all three had reported. Saved whole by the host.

---

I read an exported copy of commit 9c0d03e93.

**Astra’s verdict: revise before building; Build 1 is not yet shown safe to merge independently.** This was a static review of the plan and source. I ran no app or tests, changed no files, and opened no handoff block or other reader’s report.

1. **HIGH — Opening the squadron list dismisses the Tracker window before the guard can see it.**

   Open a Tracker marking window, open Schedules, then choose another squadron. The Tracker’s document-level `clickAway` handler closes the marking window on the first press. The later pick therefore finds nothing open and proceeds. Pressing the role badge can likewise refuse first but then dismiss the window as that same click reaches the document.

   The plan counts this window but changes none of that outside-click handling. **Fix:** preserve it through opening and using these controls, including the ? menu and bell. Test complete press sequences, not just a direct call to the guarded function. Evidence: plan §§3.2(g), 4; `tracker/App.jsx`’s `clickAway`.

2. **HIGH — An input notification can still change squadron through the supposedly harmless “no” result.**

   A person can retain a notification about an input naming them after leaving its squadron. While viewing another squadron’s View-only Schedule, press that notification with a failed save or another window open. `enterForLine` answers `'no'` because their own pages cannot belong to the notification’s squadron. Nevertheless, `openNotice` opens Inputs; `landOnOwnPage` then brings their home squadron into view.

   Section 4.2 exempts `'no'`; §4.5 repairs only the own-squadron `'here'` case. The OIL bell’s proposed `'no'` continuation has the same weakness.

   **Fix:** check the actual destination page and resulting squadron before marking the line read, closing its list or opening anything. Test a retained personal notification from a third squadron, through both relevant bell routes.

3. **HIGH — The proposed hidden-window policy can leave no reachable Close.**

   Open a Leave War sheet while holding Plan rights elsewhere, leave it behind another tab, then let that right become View only. The sheet remains mounted, but Leave War is no longer an offered tab. Under N1’s recommendation, a pick home is refused until the hidden sheet closes. Its Close is inaccessible; its Escape handler explicitly ignores hidden pages.

   This combines existing automatic-change handling with a new refusal, so it is a Build 1 regression risk, not merely deferred Build 2 work.

   **Fix:** add this sequence to N1 and require a reachable, non-destructive recovery before implementing its answer. Merely naming “Leave War” in the note is insufficient. Logout or reload is not an adequate substitute for closing recoverable typed work.

4. **HIGH — The independent-merge claim conflicts with two acknowledged unguarded routes.**

   With View-only Schedule selected and a save failed, “Check my quals” can still bring the home squadron back. The plan also acknowledges page-changing Undo/Redo routes. Section 4.1 leaves both unchanged pending N3 and excuses them in the test checker, while §1 promises safe independent delivery.

   **Fix:** make N3 and implementation of its answer prerequisites for that delivery claim, or explicitly require the dependent builds before release. For “Check my quals”, refusal must precede marking the welcome-back card seen. This does not require bringing all squadron-specific Undo work into Build 1.

5. **MEDIUM — The census cannot guarantee that future windows are caught, and today’s inventory has omissions.**

   R3/R4 recognise files, not every independent opening state. A second dialog added inside an already-listed Tracker component can pass without acquiring a guard row. A2 then loops over the guard’s own rows, so it cannot discover the omission either.

   Medical’s separate “as of” date picker is absent from the inventory. Also, the proposed five typing reports do not account individually for seven state owners: person, archived person, access approval, add person, new squadron, move and place editors.

   **Fix:** enumerate opening states and map each to a counted row, a counted parent or an explicit exclusion. Add a deliberate omitted-dialog test inside an existing file. Resolve each editor under H3 without assuming its answer.

6. **MEDIUM — Refusing the role switch can leave the ? menu visibly open.**

   The existing handler calls `setDrawer(false)` and relies on `switchRoleView` to notify the screen. The proposed early refusal returns before that notification; displaying the toast does not provide it. The menu can therefore remain over the window or Retry.

   The plan explicitly handles redraw for a refused squadron pick but misses this role-switch caller.

   **Fix:** implement the agreed H11 menu behaviour for both controls, including redraw, focus and note origin. Test refusal through the actual menu button, with both an open window and a failed save.

7. **MEDIUM — Part F does not cover document writes.**

   A person can open the file chooser while an input is live, then return after midnight or a rights change has held the window. `DocField` calls `docAdd`, which writes through to document storage without checking the window’s current eligibility. Recording a different opening squadron does not change that callback.

   This is not evidence that another squadron’s input attachment list is overwritten: the file is stored separately, and ordinary input saving has further checks. It is evidence that “every write” remains unproved.

   **Fix:** add the late-file-return case, checking both durable file storage and attachment references. Specify the current-window/session check before accepting the returned file. Include documents in Part F’s tests rather than relying on disabled controls.

8. **MEDIUM — The proposed commit order and one root test contradict the guarded behaviour.**

   Step 0 changes existing expectations to refusals before any door refuses. Step 3 installs the shared entry checker while bell routes remain unguarded until later steps. Those intermediate commits cannot satisfy the stated working-suite promise.

   F4 also opens a wrong-squadron input directly, then expects “pick 142 → live again”. That pick must now be refused while the window is open.

   **Fix:** keep step 0 to the census and unchanged-behaviour pins. Move changed expectations alongside their implementations; activate the universal checker when all covered doors are ready. Make F4’s return a clearly labelled raw-entry test, and separately assert that a real pick is refused.

9. **MEDIUM — Two passages treat unanswered behaviour as settled.**

   Section 4.5 calls refusal of deleted-input/deleted-person notifications “accepted”, even though those presses would change no squadron. That is an additional visible restriction, not a consequence of the settled switching rule.

   Section 3.3 says hidden-window rows are built to refuse “until he answers”, contradicting §8’s prohibition on building recommendations.

   **Fix:** put the no-change notification case on the questions page and remove both assumed defaults from implementation instructions. I have not answered either question.

**Source inventory and coverage**

The plan recognises these window families; the outstanding classification questions remain the owner’s:

- **Movable shell windows:** Input editor, Inputs day, SANS day, Inputs settings, SANS settings, Calendar, Every weekday, Holiday, OIL list and Leave War day panel. ALL AVAIL and expanded/folded Changes have separate flags.
- **Dialogs:** schedule/board Input editor, Insights, Duty templates, Flying waves, Day templates, Plans, board cancellation reason and Sort all.
- **Questions:** OIL, upchit, medical clash, missing document, medical move and OIL-before-change. Input and posting confirmation cards sit inside already-counted windows.
- **Leave War sheets:** person/My leave, Grades, Required figures, Selected days, bid, filed leave/credited OIL, award, posted out, posted in, Settings, Open for bidding, Events, Event, Event presets, OIL tracker/settings, counter, day list, Remarks, Rename, manning, closed note and New leave war.
- **Tracker:** question box, marking window/message, event information, ball editor, syllabus editor, Reorder, Copy, Flex settings, Show All, Down days, fail log and both lull windows.
- **Explicit exclusions or pending choices:** Traffic, Day details, Jump to date, document viewer; legends, under-manned list, flying calculation, event peek, calendars and pickers; navigation/bell/board menus; chart layout, Details, tools and other editing modes; armed actions and inline typing outside the selected forms. Medical’s separate calendar and all seven form owners need the corrections above.

The door trace found both squadron lists; badge/menu/held-input role controls; notification, access-request and OIL bell routes; OIL-list cards; holiday and Leave War links; welcome-back and Undo/Redo page landings; ordinary navigation; session entry and automatic re-entry. The Scheduler Board shares the bell implementation. I found no separate address, browser-Back or keyboard mechanism that directly selects a squadron or role.

**Checks with no additional finding**

The proposed same-squadron early return, clean synchronous pick, distinction between “Not saved” and “Not kept”, and unconditional logout are consistent with the intended rules. Keeping the existing Tracker question’s three outcomes is sound; the missing tests concern surrounding press sequences and later rechecks.

Part F’s ownership correction addresses the identified opening-note error for ordinary Save, Delete, Take me out and OIL handlers. I found no additional independent bypass in those handlers. N2 remains unresolved, and the document path prevents an “all writes covered” conclusion.

**Safer cut:** keep the Tracker bridge read-only initially, preserving existing session cleanup—including cancellation of queued questions—rather than rewriting cleanup merely to share the inventory. Deliver the complete guarded user journeys together, with N3 resolved. The cost is additional sequence/recovery tests and a stricter release dependency.

Real-iPhone checks remain the note against the keyboard and Safari’s folding toolbar. No phone appearance was verified here.

Rulings: none; no files changed.