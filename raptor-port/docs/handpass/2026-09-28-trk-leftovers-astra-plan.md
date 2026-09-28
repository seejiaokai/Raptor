# Astra red-team report

## Ranked findings

### F-01 — High — The plan is stale against four owner decisions already recorded

**Evidence:** `.claude/rules/decisions/tracker.md:43-46`; `OUTSTANDING.md:788,818`; plan `:128-144,195-214`; `.claude/rules/decisions/how-we-work.md:74,82`.

D370, D371, D372 and D373 now answer C2, C3, C4 and D. The plan still calls all four owner questions and contains no implementation for C2–C4. Following it literally would omit decided work.

**Concrete scenario:** Build from the plan; N.A. failures still appear in the card, failures still use recording order, and Ctrl+Z after a pace change still undoes an older mark, even though the owner has explicitly decided otherwise.

**Exact plan fix:**

1. Change C2, C3 and C4 from “HIS CALL” to “FIX — D370/D371/D372.”
2. Add C2 implementation:
   - Exclude N.A.-event failures from the card, total and full failure list.
   - Preserve the stored failures.
   - Restore them, with their dates, when the event changes from N.A. to a real grade.
3. Add C3 implementation without a data migration:
   - Keep each failure’s original array index as its stable identity.
   - Present dated failures oldest-day first.
   - Put undated failures after dated ones, preserving recording order.
   - Preserve recording order for equal dates.
   - Make minus remove the latest dated failure; if all are undated, remove the last recorded.
   - Make re-dating immediately re-order the card and full list.
4. Add C4 implementation:
   - Extend Tracker undo entries to snapshot pace and lull state.
   - Coalesce pace and each end-date field by student and field for two seconds.
   - Make adding, changing and removing a lull period separate steps.
   - Snapshot all recipients of “Copy to…” in one grouped undo entry.
   - Restore and persist every affected student together on undo/redo.
5. Add regression cases for both orders: mark N.A. then grade again; record then back-date; re-date then minus; pace/end/lull then mark; mark then pace/end/lull; lull copy then undo/redo.
6. Remove Q1, Q2 and Q3. Keep only the still-unanswered Q4 and Q5.
7. Update every stale UI contract, behavior row, comment and test name in the same change, as D201 requires.

---

### F-02 — High — A only resumes on a React remount, but a person can change without one

**Evidence:** plan `:90-95`; `raptor-port/src/tracker/App.jsx:71-78`; `src/ui/App.tsx:30-35`; `src/state/accounts.ts:421-436`; `src/state/store.ts:319-351`; `src/ui/Shell.tsx:110-115,645-646`.

An account can be reassigned to another person while its existing `Shell` and already-loaded Tracker remain mounted. `resetSession` rebuilds the session, but `App.jsx`’s ready effect does not run again. The new person can therefore inherit the outgoing person’s in-memory course and student. A load racing another identity change can also finish for the wrong person.

**Concrete scenario:** Keep the Tracker mounted but hidden. Change the signed-in account’s linked person. Return to Tracker. The old course/student remains because `core.ready` did not change and the component did not remount.

**Exact plan fix:**

1. Make the lightweight session seam carry the current stable person ID and a monotonically increasing session generation; do not import `core.js` into Raptor.
2. Have `resetSession` publish that identity after `setMe`, on every real login/person change, including account reassignment.
3. Have `core.js` subscribe when loaded and queue `resumeForPerson(personId, generation)` through `onChain`.
4. Keep the ready effect only as the initial drain for a Tracker loaded after the session changed; it must not be the sole trigger.
5. Capture the generation before loading. After every awaited load, compare it with the latest generation. If it changed, discard the landing and run only the newest request.
6. Set `pickOwner` only after the matching person’s load completes.
7. Add an explicit owner question for a forced mid-session person reassignment while an old person has unsaved chart edits. Recommendation: discard and reload the stored chart before showing the new identity; “Stay” cannot preserve an identity that no longer belongs to the account.
8. Test Tracker visible, Tracker hidden, Tracker never opened, two logins without opening it, and an identity change during `loadCourse`.

---

### F-03 — High — B1’s direct cancellation is re-entrant and can strand the second question

**Evidence:** plan `:110-119`; `core.js:1876-1901`; import continuation `core.js:5819-5843`.

Resolving the first promise queues its continuation. If that continuation opens a third question—for example, an import skips one chart and asks about the next—the third call can cancel the newly shown second question.

**Concrete scenario:** Question A is open. Question B arrives and cancels A. A’s continuation immediately opens C. Under the proposed direct replacement, C cancels B before B can be answered.

**Exact plan fix:**

1. Replace the single resolver with a small FIFO dialog dispatcher.
2. Store each request with its dialog shape, resolver and type-correct cancellation value.
3. When B arrives while A is open:
   - Queue B.
   - Remove A as current.
   - Resolve A with its own cancellation value.
   - Schedule the queue pump for a later microtask.
4. While the dispatcher is draining, any continuation-created C is appended behind B.
5. `dlgClose` settles only the current request, then pumps the next request.
6. `endSession` must cancel both the current request and every queued request so none appears for the next login.
7. Retain the focus trap so ordinary keyboard use cannot reach controls behind the shade.
8. Test A→B; A-cancel-continuation→C; choice→confirm; import chart 1→external question→chart 2; and logout/end-session with current and queued questions.

---

### F-04 — High — D373 settles D, but the plan neither adopts its full folded-row contract nor updates the older rulings

**Evidence:** `.claude/rules/decisions/tracker.md:43`; plan `:163-177,213-214`; behavior register `:115,124`; D201 at `.claude/rules/decisions/how-we-work.md:74`.

The owner chose Fold. D373 requires the folded row to show the active tool with its one-line hint, Fit, and Tools. The plan’s folded option names only the active tool and Tools. Q6 is no longer open. Older R93/R101 wording is now narrowed by the later decision and must be corrected.

**Concrete scenario:** At 844×390, enter editing. The implementation hides the old hint and tabs as allowed, but the folded row has no Fit button or active-tool hint, so a control promised by D373 is missing.

**Exact plan fix:**

1. Replace both-choice language with “Build Fold — D373.”
2. Specify the permanent short-screen row: active tool, that tool’s one-line hint, Fit, and Tools.
3. Specify that choosing a tool closes the overlay and replaces the active-tool slot.
4. Keep the double-click note, separate hint line and Flow/Info/Show All tabs hidden only while editing below the short-height threshold.
5. Put the full tool set over the chart with correct stacking; close it on outside tap, Escape and leaving edit mode.
6. Assert a positive chart height at 844×390.
7. Update R93, R101, the UI contract and relevant comments to record D373’s short-screen exception.
8. Delete Q6 from the plan.

---

### F-05 — Medium — C5’s date contract misses one setter, stable failure identity and invalid native-date states

**Evidence:** plan `:146-161`; `SidePanel.jsx:181-185,331-370`; `core.js:3617-3635,3888-3951`.

There are five fixed side-panel date setters, not four: Last Syllabus, Last Currency, Upchit, End A and End B. Failure rows are also reordered under D371, so a key based only on student—or on the displayed row index—can move a draft to another failure. The current `isWholeDay` test also checks only shape and lower bound, not whether the calendar day exists.

**Concrete scenario:** Begin editing the second failure’s date, then re-date the first failure so the rows reorder. A draft keyed by displayed index can attach to the wrong failure. Separately, press Fail + while `0202-11-02` is visible: today is stored but the box still appears to promise year 0202.

**Exact plan fix:**

1. Enumerate all eight date surfaces: Done on, Failed on, full-list failure row, both Last Flown boxes, Upchit, End A and End B.
2. Apply unchanged-value guards to `setDoneDate`, `setFailDate` and all five fixed side-panel setters.
3. Key fixed `DateBox` instances by student plus field.
4. Key failure-row boxes by student, event and original stored failure index, not displayed order.
5. Track the native input’s value and `validity.badInput`; distinguish a deliberate clear from an incomplete invalid date.
6. On blur, save only a real calendar date or a deliberate empty; otherwise restore the committed value.
7. Make `isWholeDay` perform a strict year/month/day round trip, without timezone normalization.
8. When Fail + substitutes today for an invalid draft, reset the visible Failed-on box to that same today value.
9. Test Chrome, Firefox and WebKit/iOS behavior, plus crew switch, row reorder and reload while a draft exists.

---

### F-06 — Medium — E omits the shipped default chart order

**Evidence:** plan `:179-193`; `src/tracker/data/syllabi.js:3-5`; `core.js:4309-4312`; current bake script `:30-32,79-81`; R26 at behavior register `:41`.

`DEFAULT_SYL_ORDER` is a downstream shipped-data consumer, but the proposed “four data blobs” do not include it. Baking reordered built-ins would update their content while a fresh app still opens them in the old shipped order.

**Concrete scenario:** Export all built-ins after moving Tx 2026 first, bake them, and open a clean app. The moved balls and wording are baked, but the course chart order remains the old default.

**Exact plan fix:**

1. Add `DEFAULT_SYL_ORDER` as an input and output of the pure bake function.
2. Read `BUILTIN_SYL` solely to translate stable `sb…` IDs to shipped names.
3. Build the new default order from built-ins present in `charts.order`.
4. Append shipped built-ins absent from the file in their existing relative order.
5. Ignore custom `sc…` charts for both shipped content and shipped order, while reporting them.
6. Validate the file through `FMT.readFile`, require current v3 and `contains.charts`, and complete every validation before writing.
7. Add tests for reordered built-ins, an interleaved custom chart, a missing built-in, an event without a position and per-chart wording.
8. Include `DEFAULT_SYL_ORDER` in the command’s generated-output and privacy checks.

---

### F-07 — Medium — B2 leaves one composing text surface active

**Evidence:** plan `:120-124`; `ShowAllPanel.jsx:26-37`.

Ctrl/Cmd+Enter can still be pressed while an IME is composing. Requiring a modifier does not make the event safe; the Show All editor can save incomplete text.

**Concrete scenario:** Compose text in the Crew or Prerequisites textarea and press Ctrl+Enter to select/commit an IME candidate. The editor saves and closes instead.

**Exact plan fix:**

1. Put one pure keyboard helper in a dependency-neutral Tracker module.
2. Have it check `nativeEvent.isComposing`, direct `isComposing`, and key code 229.
3. Use it in dialog input, dialog filter, Header search and Show All’s Ctrl/Cmd+Enter handler.
4. Test every field in Show All, not just its first input.
5. Assert composing Enter does not save, close, pick, add or search; the same non-composing shortcut retains existing behavior.

---

### F-08 — Medium — A makes an owner choice and still misses the Add Student writer

**Evidence:** plan `:76-79,103-106`; R14 at behavior register `:28`; R63 at `:82`; `core.js:4126-4171,4301-4303`; backlog `OUTSTANDING.md:820-826`.

The backlog expressly leaves two product behaviors: per-person resume, or default course with no student. No ruling chooses between them. Separately, `addStudent` assigns `active` directly and does not write `lastCrew`, so the plan’s “every read and write” change alone will not remember that visible pick.

**Concrete scenario:** Add a new student and do not grade anything. Leave and return as the same person. The Tracker opens the older remembered student because adding the new student never wrote the pick.

**Exact plan fix:**

1. Add an owner question before A, recommending per-person resume.
2. If approved, state that the stable Raptor person ID—not callsign or account ID—is the namespace.
3. Centralize deliberate crew selection in one helper that changes `active` and writes the current person’s `lastCrew`.
4. Route Crew dropdown, wedge/tick selection, Add Student and undo-driven picker changes through it with explicit `remember` and `land` flags.
5. Keep store reload restoration as a non-user preservation path; it must not overwrite a person’s preference accidentally.
6. Test Add Student without grading, student removal, undo switching students and import reload.

---

### F-09 — Medium — C14 does not protect “unsaved” against later auto-save completions

**Evidence:** plan `:143`; `core.js:4626-4631,5157-5172`; asynchronous status writers `core.js:541-545,570-585`; `Header.jsx:292-299`.

Setting “unsaved” once in `markDirty` is insufficient. An earlier mark/date storage promise may later resolve and set the text back to “saved” while the orange Save changes button remains present.

**Concrete scenario:** Delay an auto-save write, make a structure edit, then resolve the old write. The visible status becomes “saved” beside Save changes.

**Exact plan fix:**

1. Keep raw storage status separately from the status exposed to the header.
2. While `sylDirty` is true, derive the visible short text as “unsaved,” regardless of later successful auto-save completions.
3. Preserve a genuine storage error in the tooltip or error state without claiming the structure edit is saved.
4. Clear the override only after `persistSyl` succeeds and `clearDirty` runs.
5. Test a delayed successful write, delayed failed write, repeated edits and Save at 390, 1200 and 1440 pixels.
6. Assert the Save slot never moves and no green/saved wording appears while dirty.

---

### F-10 — Low — C7 needs the app’s Singapore day, not the machine’s local month

**Evidence:** plan `:136`; `core.js:3645-3659,3735-3736`; executor rule `:58-59`.

The plan says “today’s month” but does not say to use `isoToday()`. A straightforward `new Date()` implementation can open the previous month when the test environment is in a hostile timezone.

**Concrete scenario:** At the Singapore month boundary with the machine in `Pacific/Midway`, open a new lull period. It opens the machine’s prior month.

**Exact plan fix:**

1. Obtain today through `isoToday()`.
2. Parse its numeric year and month without UTC/local conversion.
3. Set `calView` to the first of that Singapore month for a new period.
4. Keep an existing period opening on its own start month.
5. Test new-after-browsing, existing-after-browsing and the hostile-timezone boundary.

## Scenario list

The order starts with the least-shared and most specialized surfaces.

1. **E — baking command and clean-app reader.**  
   **Setup:** Current v3 charts export containing reordered built-ins, a moved ball, edited per-chart details, one custom chart, all positions and distinctive roster names. **Action:** Run the pure bake transformation, then the thin command, then open a clean app. **Expected visible sign/gesture:** the clean app shows the baked built-in order, moved ball and edited wording; stdout reports the custom chart as skipped; no student name appears in source. **Disproof:** old order, lost layout/detail, custom data baked, missing-position accepted or a roster name written.

2. **C13 — dozing-page comment boundary.**  
   **Setup:** Visit Tracker, switch to another tab so it dozes. **Action:** Inspect its boxes, then return. **Expected:** its inner boxes may still measure non-zero while unpainted, and it repaints normally; only the comment changes. **Disproof:** the plan alters CSS/runtime behavior or the dozing Tracker becomes painted or loses its layout.

3. **C6 — specialized failure ticks.**  
   **Setup:** Two students; the second has one through six visible failure ticks on several events, plus an N.A. event and a seven-failure event. First student is selected. **Action:** Tap every displayed tick belonging to the second student. **Expected:** the visible cyan selection moves to that student, the chart stays at the same scroll position, and grading does not open until that student’s own selected surface is tapped. **Disproof:** any tick grades the first student, has no gesture, selects the wrong wedge index or moves the view.

4. **C11 — live Add Student roster.**  
   **Setup:** Open Add Student with a filter entered. Cause the real people bridge to rename, archive, remove, add and reorder people while it remains open. **Action:** Continue filtering and choose a surviving row. **Expected:** visible rows update without losing the query; removed people cannot be picked; renamed/new people appear; the selected stable ID links the right person. **Disproof:** stale row, stale name, lost filter or wrong person linked.

5. **B1 — dialog dispatcher and focus door.**  
   **Setup:** Open Rename, then request Add; make Rename’s cancellation continuation request a third question. **Action:** Tab/Shift+Tab through every control and answer the questions. **Expected:** focus cycles inside the shade; A resolves cancelled; B remains answerable before C. Repeat with alert, confirm, input, picker and three-choice dialogs. **Disproof:** focus reaches the page, a promise remains pending, B disappears, or a queued question survives logout.

6. **B2 — every composing text surface.**  
   **Setup:** Use an IME in dialog input, dialog filter, Header search and each Show All field. **Action:** Send composing Enter/key-code 229, including Ctrl/Cmd+Enter in Show All; then repeat after composition ends. **Expected:** no composing event submits, picks, adds, searches or saves; the ordinary event still performs its old action. **Disproof:** partial text is committed or ordinary Enter stops working.

7. **C5 — all date writers and identity changes.**  
   **Setup:** On each of the eight date surfaces, type `0002`, `0020`, `0202`, an impossible calendar date, then a valid date. Repeat with a deliberate clear. **Action:** Blur, press Fail + during an invalid draft, switch crew mid-draft, reorder failure rows, and reload mid-draft. **Expected:** only valid whole dates or deliberate empty values persist; refused drafts visibly revert; Fail + visibly and actually uses today; drafts never cross students, fields or failures; same-value input creates no undo step. **Disproof:** a partial year persists, visible and stored days differ, or undo takes a no-op.

8. **C7 — lull month orders.**  
   **Setup:** Browse several months away, close, and have an existing lull in a different month. **Action:** Open New, then existing, then New again under a hostile timezone. **Expected:** New always opens on the Singapore current month; existing opens on its start month. **Disproof:** either inherits the previously browsed month or machine-local month.

9. **C2 — N.A. failure visibility.**  
   **Setup:** Give an event several dated failures. **Action:** Mark it N.A., open Failures, then grade it normally again. **Expected:** ticks, chips, total and full rows all disappear while N.A.; the preserved failures and dates all return afterwards. **Disproof:** any renderer disagrees or the hidden history is deleted.

10. **C3 — failure day ordering and removal.**  
    **Setup:** Record today, then back-date another; add two equal-day failures and an undated failure. **Action:** Re-date rows across each other and press minus. **Expected:** earliest dated is plain, later dates gain X, equal days retain recording order, undated rows follow dated rows, and minus removes the latest dated failure. **Disproof:** labels follow typing order, a draft moves rows, or minus removes the last array entry instead.

11. **C4 — pace/end/lull undo in both orders.**  
    **Setup:** Existing mark history, two students and different lull periods. **Action:** Change pace, both end dates, add/change/remove a lull, and Copy to multiple students; interleave each with a grade in both orders; undo and redo. **Expected:** each gesture is named, only the intended step changes, rapid field typing coalesces, and Copy to reverses all recipients together. **Disproof:** an older mark changes, only some recipients restore or a field produces many steps.

12. **C14 — delayed status and fixed slot.**  
    **Setup:** Delay an auto-save completion. **Action:** Make a structure edit, resolve/reject the old write, save, and repeat at 390/1200/1440. **Expected:** “unsaved” stays visible while Save changes exists; tooltip holds fuller detail; the slot and chart do not move. **Disproof:** saved/green appears while dirty, wording clips below usefulness or the control shifts.

13. **C15 — duplicate/add with unsaved chart work.**  
    **Setup:** Make an unsaved chart edit. **Action:** Duplicate and Add syllabus; walk every answer in both orders. **Expected:** Duplicate’s choices save to both or only the copy exactly as worded; Add asks to discard; cancel preserves the edit. **Disproof:** a route silently loses, shares or saves the draft. No new implementation is expected if the re-walk passes.

14. **C1 — edit-mode scroll preservation.**  
    **Setup:** Centre a named event at a recorded scroll position on desktop, upright phone and sideways phone. **Action:** Enter and leave Edit chart layout. **Expected:** the same event remains at the same visible screen position, allowing only documented canvas-centering slack. **Disproof:** the chart jumps to another event or fails to return. No code change if the current fix passes.

15. **C8 — future Done/Failed/Last Flown decision gate.**  
    **Setup:** Tomorrow in Done on, Failed on and both Last Flown boxes. **Action:** Commit each. **Expected:** this scenario remains blocked on Q4; after the answer, every covered surface must either refuse and visibly restore with one explanation or accept consistently. **Disproof:** silent refusal, inconsistent surfaces or a date that appears accepted but is not stored.

16. **C9 — imported course-order decision gate.**  
    **Setup:** Existing local courses and a current students file containing a genuinely new course. **Action:** Import it through the real file route. **Expected:** until Q5 is answered, preserve and document today’s append-after-local behavior; after an answer, both import and reload show the chosen order. **Disproof:** order changes by accident or differs after reload.

17. **C10 — Crew width and bar geometry.**  
    **Setup:** Long distinct callsigns and all normal controls at 390, 844, 1000, 1200 and 1440 widths. **Action:** open every menu and repeatedly switch crew. **Expected:** callsigns remain distinguishable, Crew remains leftmost, the 390 bar stays at its intended row count, and no control goes off-screen. **Disproof:** ellipses make students indistinguishable, a menu is clipped or bar height changes under the tap.

18. **C12 — shell-bar non-change.**  
    **Setup:** 844×390 with the parallel shell’s undo controls present. **Action:** open and leave Tracker. **Expected:** this branch makes no shell change; the top-bar height matches the parallel item’s result. **Disproof:** the leftovers branch edits shell geometry or claims C12 fixed itself.

19. **D — folded sideways editor and overlay.**  
    **Setup:** 844×390, a large chart, each editing tool active in turn. **Action:** enter edit, press Fit, open Tools, choose a tool, reopen and tap outside/Escape. **Expected visible sign/gesture:** positive chart height; folded row shows active tool, its hint, Fit and Tools; overlay is above the chart; choice closes it; upright and desktop remain unchanged. **Disproof:** zero-height chart, missing fixed-row control, overlay under another surface, sideways bar or changed non-short layout.

20. **A — every pick writer and meaningful session order.**  
    **Setup/action orders:** admin chooses course 2/B → logout → member; member chooses course 1/A → logout → admin; add a student without grading; remove the selected student; undo a mark for another student; import while preserving a surviving active student; rename the linked person; use D292 member view; change the account’s person while Tracker is hidden; perform two logins without opening Tracker. **Expected visible sign/gesture:** each signed-in person sees only the chosen resume policy for that stable person ID; D292 does not change it; rename preserves it; removed picks fall back; guest/pending show no Tracker; standalone uses legacy keys. **Disproof:** another person’s course/student appears, Add Student is forgotten, a stale removed ID opens, or an older in-flight load wins.

## Explicit negatives

- I found no reason to use callsign or account ID instead of the stable Raptor person ID. Stable person ID is correct for renames and callsign reuse.
- Archived, deleted, pending and guest identities do not need special Tracker pick namespaces: they cannot reach the Tracker tree. D292 remains the same person.
- The standalone unprefixed fallback is sound.
- I found no role-access defect: D121 gives admin and member the same Tracker authority.
- I checked the dialog caller categories. Their cancellation results are individually safe: confirm returns false, prompt/pick return null, choice returns cancel, and alert callers resume. The defect is re-entrant ordering, not a destructive cancellation handler.
- C6’s proposed `data-wi` on failure ticks and `closest('[data-wi]')` is the right small repair.
- C10’s targeted Crew-width change is preferable to widening every select.
- C11’s list-as-function design is sound once the Add Student caller actually passes a live function and stable IDs remain the selection value.
- C13 should remain a one-line comment correction; no production CSS change is justified.
- C15 and C1 correctly request re-walks rather than new implementation unless they fail.
- Q4 and Q5 are genuine owner questions; I found no existing ruling that settles them.
- Hiding the separate hint line and Flow/Info/Show All tabs on a short screen is not a finding now: D373 expressly permits it. The missing parts are the folded-row hint, Fit control and documentation updates.
- Repairing E instead of retiring it is consistent with R26. Refusing old file formats is consistent with D120.
- I found no migration, backward-compatibility or old-demo-data finding. None should be added under D56/D120.
- I made no changes and ran no tests, build or server, as the brief required.

