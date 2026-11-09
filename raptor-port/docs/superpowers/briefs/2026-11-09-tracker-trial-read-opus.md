## The Tracker trial: blind read (Q1 standing rules lost, Q2 readings stated as his, Q3 built rulings their test does not pin)

I read the page before (`0593544d4`) and the page now line by line. For all 73 page rulings I read the full row. For each of the 39 numbers on the "Built, held by tests" line I read the tests themselves, not the sorting table. I changed nothing.

### Findings, most serious first

**1. D372: questions 1 and 3. The list of what is NOT undoable was lost, and no test holds it.**
- **Case:** The old line ended "…not undoable: adding, removing or renaming students, courses and syllabi; event details; Import". D372 is now only on the Built line. A fresh model wiring the Tracker into the app's top-bar undo could make adding a student, a course rename or an Import undoable, and every test would still pass.
- **Row:** The bold cell reads "**R110's list of what is NOT undoable (adding, removing or renaming students, courses and syllabi; event details; Import) stands.**" This is a standing condition, not built detail.
- **Test:** `src/tracker/leftovers.test.tsx`, describe "D372 — ↶ and Ctrl+Z take back a pace, an end date and a lull period". All four tests check only that pace, End date A and B, lull periods and Copy to… ARE undo steps. No test anywhere checks that adding, removing or renaming a student, course or syllabus, editing event details, or an Import makes no undo step. I searched the tests for R110, "not undoable" and add-student-plus-undo assertions and found none.
- **Fix:** Put back on the page, cited D372: "not undoable: adding, removing or renaming students, courses and syllabi; event details; Import". Or add an assertion that after `addStudent`, `renCourse`, `renSyl`, `saveInfoFor` and an import, `canUndo()` and `undoWhat()` are unchanged. Until then D372 cannot sit on the Built line.

**2. D1170: question 3. Only part is pinned, and the Settled D1171 line now narrows a rule the page no longer states.**
- **Case:** The old line said every control on the bar is as tall as its dropdowns "the bar no taller … and nothing moving; with the gear and Legend added it stays two rows on a phone, one on a desktop". Padding added to the Tracker's header, or a bar that wraps to a third row on a phone, would pass every test.
- **Row:** "Every control on the Tracker's bar is as tall as its dropdowns — 30 on a desktop, 26 on a phone; **the bar grows no taller and nothing moves.**" D1171 measured 87 to 89 only for about 1051–1200 wide; at 1536, at 1050 and under, and on a phone the bar is "as tall as before".
- **Test:** `e2e/consistency-heights.spec.ts`, "every control on the Tracker's bar is as tall as its dropdowns, ${h} (D1170)". It checks the dropdowns at 30 or 26, each bar button at the same height, and that a menu item is not stretched. It never measures the header's own height or its number of rows. Its comment "so the bar grows no taller than they made it" is an inference, not an assertion. I found no test of the Tracker bar's row count.
- **Fix:** At 1536 and at 390, assert the `#page-tracker header` height equals the pre-D1170 heights measured by `scripts/handpass/cr3-barheights.mjs`, and assert one row at 1536 and two on a phone. Otherwise keep D1170's line on the page, so the "Settled" D1171 line ("may be 2 taller") has the rule it narrows beside it.

**3. D1132: question 3. Two parts are explicitly not pinned.**
- **Case:** "on a phone the Flow chart, Info and Show All tabs sit joined in one box" and "the phone's 'Flow chart' tab's map" (a line icon instead of the 🗺 emoji). Splitting the tabs back into three boxes, or putting the emoji back, passes every test.
- **Row:** "…the map on the phone's 'Flow chart' tab — and on a phone its Flow chart / Info / Show All tabs sit joined in one box, as the Inputs tabs do".
- **Test:** `src/tracker/tracker.test.tsx`, "D1132: Show All, File and the view tabs wear the line icons…". It checks `#showAllBtn` and `#fileMenuBtn` icons and the absence of typed marks on six bar buttons. Its own comment says "(the phone's view tabs are App's, not the bar's — the walk, scripts/handpass/cr2-walk.mjs, checks their box)". The `#viewtabs` element (in `App.jsx`) is touched by no test for its box or icon; the only mention is a click in `e2e/trk-scrollbars.spec.ts`.
- **Fix:** Add an e2e assertion at 390 wide that `#viewtabs` draws one joined box, and a unit assertion that the Flow chart tab holds an `svg.trkglyph` and no 🗺. Otherwise put the phone-tab clause back on the page.

**4. D130 (and D124's matching half): question 3. The "Revert edits only" path is unpinned.**
- **Case:** The old line said marks and typed details are wiped "at ✓ Save changes (and 'Revert edits only', for the balls the edits had added)". If Revert edits only stopped wiping the added balls' marks and details, nothing would fail.
- **Row (D130):** "Same moment as the marks — at ✓ Save changes (and 'Revert edits only' for the balls the edits had added); undoing the delete before the save still brings everything back".
- **Test:** `src/tracker/retest.test.tsx` "D130 — deleting a ball also deletes the details typed on it…" and "D124 / W2-F7…". Both go through `saveChangesClick()` only. No test mentions "Revert edits only". The only `__alt__` delete-chart answer in a test is clean-up, not an assertion. The undo-before-save case is pinned for marks (D124) but not for typed details (D130).
- **Fix:** Add a test: add a ball, type details and grade it, choose Revert edits only, then add a ball with that code and expect no marks and no typed details. Also add an undo-before-save check for the details.

**5. D373: question 3. Only half the condition is pinned.**
- **Case:** "upright phones and computers keep the strip", and "the double-click note, hint line and Flow, Info and Show All tabs step aside". If the fold showed on every screen, or the tabs stayed while editing on a short screen, nothing would fail.
- **Row:** "Upright phones and computers keep the strip as it is."
- **Tests:**
  - `src/tracker/leftovers.test.tsx` "the folded row names the tool in use…" renders the fold in jsdom with no height condition.
  - `e2e/save-note.spec.ts` line 236 is conditional: `if (!(await add.isVisible())) …click Tools ▾`.
  - Its line-486 test runs only at heights of 500 or less, and only clicks `#foldTools`.
  - Nothing asserts the fold is hidden and the strip shown at 390×844 or on a desktop, or that the tabs and hint step aside.
- **Fix:** At 390×844 and 1440×900, assert `.arrfold` is hidden and `#arrTools` is visible. At 844×390, assert `#viewtabs` and the hint line are hidden while editing.

**6. D980: question 3. The single Tab stop on the real chart is unpinned.**
- **Case:** "one Tab stop (not one per event) takes the keys into the chart". If tabindex were put on every ball, or removed from `#board`, the unit tests would still pass.
- **Test:** `src/tracker/trk-batch-ui.test.tsx` creates its own `board = document.createElement('div'); board.id = 'board'` and calls `board.focus()` directly. It never tabs into the real `App.jsx` board (`tabIndex={0}`) and never checks that balls carry no tab stop. The smoke suite tabs until `#board` is reached (line 4388), but the smoke is not a `*.test`/`*.spec` file, and it does not check "not one per event" either. The ring colour (`#1E86FF`), arrows, Enter and Escape are pinned.
- **Fix:** Render the real board and assert one element with tabindex 0, and no `.ball` with a tabindex.

**7. D1405: question 3. It is spent, not built, and is named only in a file-head comment.**
- **Case:** The page says each number on the Built line is "built, held by tests (each named by a test)". D1405's content is an order of work ("fixed first, before the iPhone keyboard fault (D1366) and the Leave War overhaul's M4 (D1404)") plus "each stray bar shown to him in a picture first". No assertion can hold that.
- **Test:** `e2e/trk-scrollbars.spec.ts` names D1405 only in its head comment; every assertion is D1406's. This is exactly the brief's "only mentions the number in a comment" case. The sorting table says so too ("leaves, on the Built line — the gate's one way off the page without archiving the row").
- **Fix:** Take D1405 off the Built line. Archive its row on his word, or keep a one-line spent entry until then. The Built line should not carry a number whose test is a comment.

**8. D1135: question 3, minor. One named item is unpinned.**
- **Case:** "the empty Tracker's 'Import a file…'" wearing the drawn Import icon.
- **Test:** `tracker.test.tsx` "D1134, D1135…" checks `#importFileBtn` and nine other menu items, plus the Students card from its source, but not the empty Tracker's button. `trk-nocourse.test.tsx` only checks that `[data-testid="trk-first-import"]` exists.
- **Fix:** Assert `[data-testid="trk-first-import"] svg.trkglyph` exists and that its text has no ⇪.

**9. D474: question 1, minor. The enrolment condition was dropped in the rewrite.**
- **Case:** Old: "marks are the student's, filed under his enrolment (one student, course, chart) and the event's fixed code, so moving, redrawing or re-wording a ball keeps them, a new ball is ungraded, a deleted one loses them". Now: "marks are the student's, never the chart's". At the database step, a fresh model reading "the student's" could key marks per person across all courses and charts, not per enrolment.
- **Row:** "an `Enrolment` is one student on one course on one chart; marks are filed under the enrolment and the event's fixed code, so moving, redrawing or re-wording a ball leaves every mark where it is…". This is the agent's description of the table list rather than his words, and `docs/data-model.md` §Syllabus carries it too, hence minor.
- **Fix:** Add back "filed under his enrolment (one student, course, chart) and the event's fixed code".

**10. Low partials on the Built line, each pinned in its main part only.**
- **D374:** that a refusal makes "no undo step" is not asserted. The `leftovers.test.tsx` C8 tests check the refusal and the restored value, but not undo depth after a refused Last Flown, Done on or Failed on. Fix: assert `depth()` is unchanged after each refusal.
- **D1406:** "Show All and every window keep theirs" is not asserted. `e2e/trk-scrollbars.spec.ts` checks `#board` and `#side` only. Fix: add `#showAllPanel` and an open window's scroll box (`scrollbar-width` not `none`) on the touch screen.

**11. D566: a note, not a failure.**
- The tapered-wing line ("sloping leading edges, a curved lower wing … a clear blue backing behind the label") left the page, but D566 is not on the Built line. It stays only on the "Ball and ring size…" line. So the page no longer says the shape is approved, and nothing ties it to the Built line's gate.
- The shape is in fact pinned by `e2e/geometry.spec.ts` "D566 tapered flight wing and blue label backing" (blue centre, tapered shoulders `[false,false]`, label inside the wing, in all three modes).
- Fix: add D566 to the Built line, or keep a short line naming the approved shape.

**12. D1931: question 2, low. Present on the page before the trial, not introduced by it.**
- The page says "until then the app still adds a typed name … down days '—', **none of it kept or extended**". The row has no words of his for "none of it kept or extended". The nearest is the agent's reading (2), "a student already stored with no roster link is demo data (D56) and is left as it is", marked "not checked with him".
- Fix: mark it "(the agent's reading)", or reword it to "left as it is (the agent's reading)".

### Checked and found sound (question 3: an assertion fails if the behaviour goes)
D64, D121 (and the seam file still states "never add an admin gate"), D122, D123, D124 (its Save changes path), D126, D127, D128, D129, D157, D370, D371, D376, D462, D463, D922, D924, D981, D982, D1002, D1003, D1004, D1006, D1007 (its flex part going is pinned in `trk-flex-setting.test.tsx`), D1014, D1015, D1018, D1705, D1860 (both messages word for word in `retest.test.tsx`).

Questions 1 and 2 on the lines kept or shortened: D801's shortened line keeps its meaning ("the pop-up stays open" is pinned in `leftovers.test.tsx` "…the pop-up stays open while its date is picked"). D120, D464, D983, D984–D992, D1790, D1861, D1935, D1791, D1900, D1136, D979, D899, D132, D375, D131, D134, D158, D1564, D1171, D1538 and D560/D564 each match their rows. No new line states an agent's reading as his rule.

rulings checked: 73