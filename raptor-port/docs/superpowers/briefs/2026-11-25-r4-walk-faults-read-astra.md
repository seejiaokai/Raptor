Reviewed the exported copy at `D:/rw4/night3/read-copy`, local export snapshot `25e782d`. The original source commit was not identified in the supplied brief.

**Return for correction: one reproduced mixed-week fault and one scroll-protection defect.** The original stale-row case passes the focused tests. Browser geometry remains unverified.

No files changed, committed or pushed. No other reader’s report or excluded job evidence was read. No excluded handoff block was pasted after compaction.

**1. High priority — changing week can mix two dates on one Board**

A scheduler can see the old week’s flying section beside the new week’s other sections until the caret leaves its box.

Steps:

1. Open Monday’s Scheduler Board.
2. Put the caret in an In-time line.
3. Activate the next-week arrow while focus remains in that line—the retained-focus case relevant to Safari.
4. The heading advances a week, but the flying section stays on the old week while neighbouring sections update.

**Cause:** [dayswap.ts:199](/D:/rw4/night3/read-copy/raptor-port/src/ui/dayswap.ts:199), `blockId`, identifies an editable section using values such as `0.waves`. Monday has that identity in every week. `swapKidsAround` therefore accepts the sections as matching.

[SchedBoard.tsx:449](/D:/rw4/night3/read-copy/raptor-port/src/ui/SchedBoard.tsx:449), `put`, supplies the previous section cache without checking which week it represents. `boardWeekStep` loads another week and reopens the same weekday within one update, so the paint need not observe the intermediate closed Board and clear its caches. The navigation check in `resume` protects a delayed catch-up; it does not protect this immediate partial write.

**Proof run:** With the actual Board component mounted, I focused Monday’s In-time line and called the actual week-step handler. Moving from 13 July to 20 July replaced **nine of eleven top-level children**, while the original focused In-time node remained connected. The assertion that every child should remain unchanged failed. Blurring subsequently replaced the old section.

**Fix:**

1. Record the rendered Board’s context alongside its cached markup: at least squadron, week and day, with navigation/version context where applicable.
2. Allow section replacement only when the incoming context matches the cached context.
3. On a context mismatch with a caret present, write no Board children and retain the obligation to repaint.
4. Once the caret leaves, write the whole current panel and reset both caches and their context together.

**Regression test:** Extend the mounted day-change test to step a whole week while an In-time line retains focus. Assert that **all** existing children remain identical before blur, then that the entire panel matches the new week after blur. Run forwards and backwards. The forward assertion fails today in the executed proof.

**2. Medium priority — scroll protection finishes before an open Blue/Red question is restored**

Replacing a flying section temporarily removes its open Blue/Red question. The code compensates for that removal, then restores the question outside the protected operation. Its height is therefore left uncompensated.

Steps:

1. Enable mission-role tracking.
2. Enter a conditional cue such as “DS FOR EAGLE” in a formation’s Remarks, leaving its Blue/Red question open.
3. Focus a Ground Programme text box below the flying section.
4. While that box retains focus, press `+ Line` in another wave.
5. The flying section is replaced and its existing question is restored after the scroll correction.

**Cause:** [SchedBoard.tsx:458](/D:/rw4/night3/read-copy/raptor-port/src/ui/SchedBoard.tsx:458), `set`, wraps each `put` in `holdingPlace`. However, `reconcileMissionRoleOffer()` runs later, at line 518. Its `reconcileAsking`/`show` path reinserts the question with `at.after(node)` in [mission-role-offer.ts:170](/D:/rw4/night3/read-copy/raptor-port/src/ui/mission-role-offer.ts:170). The question occupies normal document space, so restoring it changes the position of boxes below it.

Previously, holding the whole Board panel avoided this removal-and-restoration sequence while typing. The new partial-write path exposes it.

**Proof run:** Using the mounted component and the actual `+ Line` click handler, I confirmed that:

- The focused Ground Programme box survives.
- The flying section and question are replaced.
- Every post-replacement position measurement occurs while the question is absent.
- The question is restored afterward.

A separate geometry model, assigning the question an illustrative height of 80 pixels and applying the actual scroll corrections, failed the stationary-caret assertion: the box moved from 580 to 660. **These are model coordinates, not browser measurements.** The operation-order defect is reproduced; its visible displacement still needs a WebKit check.

**Fix:**

1. Protect the complete layout-changing paint with one `holdingPlace` operation.
2. Include section writes, reporting refreshes and Blue/Red reconciliation inside it.
3. Measure and compensate only after those elements have reached their final layout.
4. Recheck the history bubble after the final scroll correction.

**Regression test:** Reproduce the sequence in WebKit, measure the focused box immediately before and after, and require its top position to remain within one pixel. Also assert that its unfinished value, selection and node identity survive, and that the question remains usable. Repeat in the phone’s desktop layout with zoom applied.

**What checked out**

- **The original stale Ground Programme row:** A newly filed Training input changed from 08:00 to 09:00 through its Personal Inputs field immediately updated Ground Programme. Tab retained the original End-field node.
- **Held-section catch-up:** Restoring the saved start while the caret remained in its section updated Ground Programme immediately; leaving the section brought its own field into agreement.
- **Undo and Redo:** With the app’s global undo wiring installed, Undo released the caret and restored both copies to 08:00. Redo restored 09:00.
- **Reordering:** Calling the actual section-move operation while an In-time line held focus replaced no children. After blur, the requested order appeared.
- **Structural fallbacks:** Focused helper tests passed for another weekday, added or removed children, reordered sections, loose text and unwrapped sections. Those checks happen before replacement, avoiding a partially applied structural mismatch.
- **Cache handling:** Whole writes discard the section cache; closing clears both caches and pending work. Changed protected children receive `OWED`, avoiding equality with previously rendered markup when a saved value returns to its earlier state.
- **Listeners and decorations:** Board editing, row dragging and history listeners attach to surviving containers. Highlight and history-dot refreshes still run. History bubbles are rechecked, and Blue/Red questions are restored—the restoration’s placement outside scroll protection is finding 2.
- **Navigation, modes and overlays:** I traced day/week controls, sorting and dragging, row additions/deletions, folds, OIL transitions, version previews, window-held focus and the Tab route. Frozen previews retain their early hold; editable-to-OIL/read-only markup changes fail section matching. Sort and drag paths explicitly release typing focus.
- **Rendering boundaries:** The editable panel contains the day bar and the ordered Notes, Common Programme, Flying waves, Duties, Sims, Ground Programme, Personal Inputs, Available, SANS and Unavailable sections. All flying waves form one protected section. Sign-off, warnings, day controls and roster remain separate panels.
- **Passing notes, source inspection:** The change affects the shared note element, covering plain, warning, hard and blocked faces. It leaves placement, padding, colours, timing and animation rules intact. Blocked text inherits wrapping, and its text container already permits shrinking. Text remains inserted safely as text.

**Validation limits**

Proofs ran entirely in memory against the exported source, using the installed dependencies. No scratch files were written because this session’s filesystem is read-only.

Browser launch failed because it could not create its temporary directory. Consequently, I did **not** verify actual Chromium/WebKit wrapping, desktop shrink-to-fit width, ordinary notes near a wrapping boundary, phone top/foot placement, zoomed scroll behaviour or slow-phone parsing cost. The added browser tests cover long phone notes and one ordinary desktop note; the desktop long-word and boundary cases still need execution. No full suite or full browser walk was run.

**Tidiness — changed lines only, filed here without edits**

- **Unnecessary code:** No new dependency or unused production path found. The additional cache serves a necessary purpose.
- **Repetition:** The stale-row explanation is repeated at length in the component, helper and test comments. One full explanation with shorter references would be easier to maintain.
- **Clarity:** `held` means either “a changed child was protected” or “the whole comparison was refused.” That distinction deserves a short explicit comment. The cache also needs the context ownership identified in finding 1.

Rulings: none — read-only review.