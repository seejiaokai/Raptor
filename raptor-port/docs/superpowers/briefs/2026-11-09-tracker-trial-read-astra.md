I found **17 issues**: lost conditions and tests that protect only part of the ruling. **Question 2: no finding**—I found no definite agent interpretation presented as your decision.

I compared all 73 Tracker rulings with the previous page and full rows, and read the tests named for all 39 “Built, held by tests” entries. This was read-only: no files changed, no tests run. The cases below describe gaps in protection, not newly reproduced app failures.

The shared references are the [current page](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/.claude/rules/decisions/tracker.md:18), [full ruling rows](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/.claude/decisions-full/tracker.md:18), and [sorting table](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/docs/superpowers/briefs/2026-11-09-tracker-trial-sorting.md:18).

1. **D64 — Questions 1 and 3: the privacy-sweep exception for smoke assertions disappeared.**

   The full row explicitly leaves both syllabus data **and smoke-test lines asserting that data** outside the sweep. The removed paragraph carried that exception. The named [test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/retest.test.tsx:211) asserts the two editors’ placeholder text; it does not protect the instruction about future privacy sweeps.

   **Concrete case:** a fresh agent removes syllabus wording from smoke assertions while preserving the placeholder, believing the remaining exemption covers data alone.

   **Fix:** restore: “Syllabus data and smoke-test assertions of that data remain outside privacy sweeps.”

2. **D121, narrowed by D1014 — Questions 1 and 3: equal access became a collection of examples.**

   D121’s full row says members and admins have the same Tracker authority, including Import and Export; D1014 makes flex settings the exception. Both now appear only in the built list. The [permission tests](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/state/perms.test.ts:405) cover marks, gestures and flex. The [Tracker tests](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/tracker.test.tsx:41) check several windows opening, controls existing and the absence of the old `fileLocked` mechanism.

   **Concrete case:** a new restriction refuses a member’s actual Import submission while leaving the button and window available. Those access assertions would still pass.

   **Fix:** restore: “Members have the same Tracker access as admins, File included; only flex settings are admin-only.” Add a member Import/Export completion test if those details are to leave the page.

3. **D372 — Questions 1 and 3: the explicit exclusions from Undo were removed.**

   The full row preserves the list of actions that are **not undoable**: adding, removing or renaming students, courses and syllabi; event details; Import. The [named tests](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/leftovers.test.tsx:480) exercise the positive additions—pace, end dates and lulls.

   **Concrete case:** a future change adds Import or student deletion to Undo. The positive tests continue passing, and the page no longer tells the agent that this changes an existing decision.

   **Fix:** restore the exclusions. Alternatively, add explicit history assertions for each excluded action before removing that wording.

4. **D566 — Question 1: the accepted wing shape lost its description without a complete replacement test.**

   The current page retains the preservation rules but drops the accepted tapered-wing description. The sorting table says “the shape’s own line left,” which does not match the page. The full row specifies sloping leading edges, a curved lower wing and the existing nose/tail.

   The [geometry test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/e2e/geometry.spec.ts:5965) checks label coverage, the centre and two shoulder points. It does not distinguish the accepted lower curve and nose/tail from other shapes satisfying those points.

   **Concrete case:** straightening the lower wing while keeping the sampled points and label backing can pass.

   **Fix:** restore the accepted-shape sentence, or add assertions protecting the complete approved outline.

5. **D130, extending D124 — Questions 1 and 3: “Revert edits only” and complete restoration by Undo are not protected.**

   D130’s full row specifies cleanup at Save **and at “Revert edits only” for newly added balls**, with everything restored by Undo before saving. The [D130 test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/retest.test.tsx:649) exercises deletion followed by Save. The [D124 test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/retest.test.tsx:838) checks Undo restores the ball and grade, but does not populate and check typed details during that Undo.

   **Concrete case:** reverting an unsaved added ball leaves its typed details behind; recreating its code resurrects them. The cited save-path assertions do not cover this.

   **Fix:** retain the Save/Revert/Undo conditions until tests cover an added, marked, detailed ball being reverted and recreated, and Undo restoring its details before Save.

6. **D374 — Question 3: refusal without an Undo step is not asserted.**

   The full row requires a future date to be refused with **no saved change and no Undo step**. The [refusal tests](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/leftovers.test.tsx:294) check refusal messages and unchanged dates or marks. Their history assertion checks a successful earlier-date change, not the subsequent refusal. Later calendar tests protect disabled future days but do not assert unchanged history either.

   **Concrete case:** a refused date creates an empty Undo entry while leaving the displayed and stored dates unchanged.

   **Fix:** assert unchanged Undo/Redo history around each refused future-date operation. Until then, retain the “nothing saved; no Undo step” condition.

7. **D376 — Question 3: a new user’s initial student is not checked.**

   The full row specifies first course, then its last graded student, otherwise its first student. The [named test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/leftovers.test.tsx:565) checks the newcomer’s course, then explicitly selects a student. It never checks the student chosen on arrival.

   **Concrete case:** every new user starts with the first student even when another student was last graded. Existing assertions still pass.

   **Fix:** add two fresh-user cases: last graded student differs from first; no previously graded student exists. Assert the initial selection before changing it.

8. **D373 — Questions 1 and 3: the conditions around folded tools are only partly protected.**

   The full row limits folding to short screens, preserves the normal strip on upright phones/computers, and hides the double-click note, separate hint line and view tabs while editing.

   The [component test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/leftovers.test.tsx:738) checks elements and open/closed classes. The [browser test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/e2e/save-note.spec.ts:486) checks that opened tools survive a save warning. Neither establishes all those visibility conditions.

   **Concrete case:** upright phones also get folded tools, or the sideways screen keeps the separate notes and tabs, while these assertions pass.

   **Fix:** retain those conditions until browser assertions cover short-screen editing, upright phones and desktop, including which elements are visible and whether the opened strip overlays the chart.

9. **D922 and D924 — Question 3: drag-state classes are checked, but their promised appearance is not.**

   The full rows require the carried row’s ring and one landing line, replacing the old destination box. The [finger tests](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/reorderdrag.test.tsx:107) and [mouse test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/reorderdrag.test.tsx:190) assert `dragging`, `dragover` and `after` classes.

   **Concrete case:** the styling changes `dragover` back into a box around the destination row. The class assertions still pass.

   **Fix:** add browser assertions for the painted ring, single gap line and absence of the destination box, for finger and mouse. Retain the appearance rule until then.

10. **D980 — Question 3: one Tab stop for the chart is not protected.**

    The full row explicitly says one Tab reaches the chart, with no separate Tab stop for every event. The [keyboard test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/trk-batch-ui.test.tsx:73) starts by directly focusing the chart. Its Tab assertions concern trapping focus inside the marking window.

    **Concrete case:** every event becomes tabbable. Arrow navigation and the tested marking-window behavior still pass.

    **Fix:** add a real browser Tab sequence from the preceding control, through the chart, to the following control, proving there are no event-by-event stops. Retain that condition until tested.

11. **D1003 and D1018 — Question 3: the Add window’s date-picker connection is bypassed.**

    The full rows require the course start chosen while adding a student to become that student’s course start. The [named test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/trk-down-days.test.tsx:130) checks the box, default and ordering, then directly calls the date setter and dialog completion.

    **Concrete case:** the calendar’s selection stops reaching the Add window’s date setter. The test still supplies the date directly and passes.

    **Fix:** pick a different date through the actual calendar, select the roster person through the displayed list, and assert that person’s saved course start.

12. **D1132 — Questions 1 and 3: the phone’s joined view tabs are absent from the named assertions.**

    The full row requires Flow chart / Info / Show All to sit joined in one box and the phone’s map to be a line icon. The [named test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/tracker.test.tsx:147) renders the header. Its comment explicitly delegates the phone tabs to a separate walk; its assertions cover header controls.

    **Concrete case:** the three tabs become separate boxes again, or the map becomes an emoji, without failing those assertions.

    **Fix:** restore the joined-tabs condition until an automated phone check asserts the shared box and drawn map icon.

13. **D1135 — Question 3: the empty Tracker’s Import icon is omitted.**

    D1135 explicitly includes the empty Tracker’s “Import a file…” button. The [named icon test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/tracker.test.tsx:168) checks populated menus and Students controls. The empty-state test establishes the Import button’s presence, not its icon.

    **Concrete case:** that empty-state button reverts to a typed Import symbol while the menu icon tests pass.

    **Fix:** render the empty Tracker and assert that its Import button contains the intended drawn icon and no typed substitute.

14. **D1170 — Questions 1 and 3: equal control heights do not protect the bar’s height or positions.**

    The full row says controls become 30 pixels on desktop and 26 on phone, while **the bar grows no taller and nothing moves**, subject to D1171’s narrow-desktop exception.

    The [browser test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/e2e/consistency-heights.spec.ts:68) measures individual controls. Its comment concludes that equal heights prevent growth, but it does not measure the header’s total height or control positions.

    **Concrete case:** extra header padding or row spacing makes the bar taller while every control remains the required height.

    **Fix:** retain the no-growth/no-movement condition; add header-height and position assertions, allowing D1171’s stated exception.

15. **D1406 — Questions 1 and 3: the scrollbar exceptions omit Show All and windows.**

    The full row preserves normal bars in Info, Show All and every window. The [three browser cases](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/e2e/trk-scrollbars.spec.ts:1) inspect only the chart and Info panel, plus whether the chart can still scroll.

    **Concrete case:** touch-screen styling hides bars in Show All and modal windows while leaving Info alone. All three cases can pass.

    **Fix:** restore the complete exception sentence. Add overflowing Show All and window cases that assert their normal scrollbar styling and scrolling.

16. **D1705 — Question 3: most tools are checked for any icon, not their approved icon.**

    The full row names the drawings: Move’s hand, Select’s dashed box, Connect’s joined points, Delete’s bin, and so on. The [named test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/tracker/tracker.test.tsx:195) checks that each named tool contains an `svg.trkglyph`. It compares the actual drawing for Reset layout, but not most of the listed tools.

    **Concrete case:** Move and Delete swap drawings. Both still contain the expected SVG class.

    **Fix:** assert each prescribed drawing against its approved geometry, following the existing Reset layout comparison. Otherwise retain the icon mapping.

17. **D1405 — Question 3: a spent ordering instruction is labelled “held by tests.”**

    D1405 instructed that the scrollbar repair precede two other jobs. The sorting table correctly calls this **spent/history**, then explicitly places it on the built line for administrative reasons. The [scrollbar test](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/e2e/trk-scrollbars.spec.ts:1) names D1405 in its opening comment; its assertions protect D1406’s behavior, not the historical order of work.

    **Concrete case:** the built line claims test protection for an instruction that no assertion checks.

    **Fix:** classify D1405 as spent/history rather than test-held. Preserve its full record; if archiving awaits your word, state that explicitly instead of calling it built and held by tests.

Review tier: NONE. These findings concern the guidance reduction and its claimed test coverage. No browser walk or test execution was performed.

Rulings: none made or recorded; read-only review.

rulings checked: 73

