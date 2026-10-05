**1. Findings — REVISE**

Independent Sol 6.1 read of the five commits, including their tests and surrounding call paths. These are source-traced failures; I did not reproduce them in the running app.

**F1 — P2: An unfinished flight can still inflate another event’s work hours (W4).**

**Steps:** On an unpublished day with no other work for the person, add a Ground Programme row from **17:00–18:00** and assign them. Add a flying wave containing that same person, leave take-off and landing blank, and enter **08:00 IN TIME**. Open Insights → Work hours.

**Expected:** W4 says an untimed flying line contributes no hours. The person should have **one hour**.

**Cause:** [validate.ts:167](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:167) checks the start and end independently. The unfinished flight contributes its finite 08:00 report; the ground row supplies the 18:00 end. The resulting span is **ten hours**. [events.ts:342](C:/Users/User/projects/Raptor/raptor-port/src/engine/events.ts:342) emits that unfinished flight, and Insights consumes the combined span.

**Provenance:** **W4 partly unfixed.** Before the round, this combination could poison the result with NaN. The fix removes that symptom but can replace it with a plausible, wrong total. The new test checks a reporting-only flight alone, but not alongside timed work.

**Fix:** (1) Calculate both endpoints for each event. (2) Require both endpoints to be finite before allowing either to influence the span. (3) Preserve valid overnight reporting and complete zero-duration flights. (4) Test reporting-only flights alongside timed ground, sim and duty events, in both event orders, including the resulting Insights total.

**F2 — P2: Confirmation sheets take focus initially, but Shift+Tab returns it behind the unanswered question (W12).**

**Steps:** Change a weekend Duty request’s start time on Edit Schedule and press Tab, opening the OIL question. Without answering, press **Shift+Tab**. Focus can return to the underlying request’s Save button; further reverse Tabs reach its editable controls. Type there while the OIL question remains open.

**Expected:** W12 promises that the window takes the keyboard and stops continued editing behind it.

**Cause:** [sheetfocus.ts:12](C:/Users/User/projects/Raptor/raptor-port/src/ui/sheetfocus.ts:12) focuses the sheet once and restores focus when it closes. It neither contains keyboard navigation nor makes the background inert. The underlying editor remains enabled at [inputedit.tsx:1729](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1729), with its Save button immediately preceding the nested confirmation in DOM order at line 1883. The schedule route declining Tab does not prevent native focus from escaping.

**Provenance:** **W12 partly unfixed.** The immediate post-save hop is repaired; continued keyboard navigation can recreate editing behind the window. The new test checks initial focus, then deliberately focuses behind the sheet—it does not test native Tab containment.

**Fix:** (1) Contain Tab and Shift+Tab within the foremost confirmation. (2) Make the underlying editor/background inert while that confirmation is active. (3) Preserve focus restoration when confirmations close or replace one another, without automatically choosing an answer. (4) Walk forward and reverse Tab beyond every control in all four confirmation sheets, including their different parent surfaces.

**F3 — P2: Cancel-reason and Sort all dialogs are missing from the window guard (W12; host question 5).**

**Steps:** Open Scheduler Board → **Sort all**, leaving its confirmation unanswered. Tab through the underlying controls until a schedule text box receives focus, then press Tab again. Alternatively, open a line’s cancellation-reason dialog and reverse-Tab out of its controls into the board.

**Expected:** While a blocking window is open, the schedule’s custom Tab route must decline.

**Cause:** [pops.ts:143](C:/Users/User/projects/Raptor/raptor-port/src/ui/pops.ts:143) omits **CXT** and **SORTALL**, which are held separately in the board module. Their dialogs are rendered at [SchedBoard.tsx:664](C:/Users/User/projects/Raptor/raptor-port/src/ui/SchedBoard.tsx:664) and [SchedBoard.tsx:749](C:/Users/User/projects/Raptor/raptor-port/src/ui/SchedBoard.tsx:749). Sort all also does not move focus into its confirmation. Once an underlying field receives focus, the custom route remains active.

**Provenance:** **W12 partly unfixed through missing call sites.** These dialogs and their focus behaviour existed before the round; the new guard does not cover them.

**Fix:** (1) Include both board-dialog states in the shared blocking-window judgment, without creating a dependency cycle. (2) Check `SORTALL != null`, so Monday’s index **0** counts as open. (3) Give these dialogs keyboard ownership using the corrected shared mechanism from F2. (4) Test both dialogs, closing and navigation cleanup, on Monday and another day; confirm the ordinary schedule route resumes after closing.

**F4 — P3: Malformed reporting clocks remain silent until take-off is entered (W19).**

**Steps:** Add a blank flying wave. Enter **8h00 IN TIME** in its reporting box and leave the box, while the formation’s take-off remains blank. Neither the editing feedback nor the warning list explains that the clock was not read.

**Expected:** W19 promises “no recognised clock” for that spelling. The documented advisory concerns the completed reporting instruction; it does not require a completed take-off.

**Cause:** [reporting.ts:96](C:/Users/User/projects/Raptor/raptor-port/src/engine/reporting.ts:96) returns before emitting unresolved-clock diagnostics whenever take-off is absent. Both editing feedback and the warning list consume this function.

**Provenance:** **W19 partly unfixed on an untimed wave.** The take-off gate existed before the round. The new malformed-clock recognition works only after that gate permits checking.

**Fix:** (1) Emit applicable malformed-clock advisories independently of take-off. (2) Keep chronology comparisons conditional on valid take-off. (3) Handle an empty wave with a reporting-line advisory anchored to its reporting box. (4) Test blank take-off, entering and removing take-off, and removing the final formation, through both editing feedback and the warning list. Keep these advisories nonblocking.

**2. Explicit negatives**

- **W15/W16 — host question 1:** No permanently forgotten held repaint identified: retained canonical chunks, the held marker, focus-out catch-up and navigation guards preserve the outstanding work; the caret-containing block is not replaced. Physical caret position and glide behaviour still need runtime verification.
- **W8 — host question 2:** No collision or incorrect identity reuse found across the two demo weeks, separate browser tabs, day-template copies, saved plans, week-switch Undo or partially saved weeks; copies strip identities where required, and missing day rows use the same seeded identities.
- **W11 — host question 3:** No legitimate spacing-only distinction found that the refusal loses; the existing writer already folds whitespace, while substantive text changes still take the normal mutation path.
- **W9 — host question 4:** No two-question state, wrong-formation answer or surviving orphan button found in the focus/edit/answer/Later/Undo/repaint paths; the separate slots retain guarded identities and reconcile detached fields.
- **W12 — host question 5:** No permanently true window flag found in the inspected close, page, week and session cleanup paths; the missing dialogs are F3.
- **W19/W3 — host question 6:** No new false advisory or misreading found in the documented clock spellings, prose-digit examples, clocked/clockless “RALLY AFTER IN TIME,” or separate formation overrides; the missing advisory is F4.
- **W2/W6:** Reporting-button wording no longer counts as a changed checking rule; actual checking settings still do. The shared reporting label reaches the inspected controls, headers, pending/history descriptions, Undo and removal toast.
- **W7:** Mission-role history is grouped under the formation, with a formation fallback after removal, rather than treating its row identity as a Leave War person.
- **W10:** All four changed confirmations use the surround-origin check; a drag starting inside is distinguished from a genuine surround click.
- **W13/W18:** The source and browser-test assertions cover the phone wide-board save band and menu alignment; I make no claim that their measured geometry passed this session.
- **Published records and permissions:** No additional bypass of the text mutation funnel, frozen-version boundary or mission-role write guards identified. No old-data-only migration finding is included.

**3. What I did not read, and why**

I did not open the other reviewers’ reports, the concurrent `stk2-*` walk results or their pictures, as instructed. I did not reread the complete reference engine or unrelated Tracker/Leave War implementations; this read followed the five commits and their relevant consumers.

No files changed. No build, test suite or browser walk ran. **Walk: NOT RUN — the brief requires a read-only source review. Rulings: none.**

**4. Confidence**

Moderate confidence in the source coverage; I cannot conclude that nothing serious remains while F1–F3 are open, and a fresh desktop/phone walk of these cases plus published-day repaint and navigation sequences could strengthen or overturn this assessment.

