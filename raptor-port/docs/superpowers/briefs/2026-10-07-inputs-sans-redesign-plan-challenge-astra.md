# Astra's challenge of the build plan for the Inputs and SANS calendars - 7 Oct 26

The brief: `2026-10-07-inputs-sans-redesign-plan-challenge-brief.md`. The plan: `../plans/2026-10-07-inputs-sans-redesign-plan.md`. Run read-only through the Codex tool (model gpt-6-astra, high effort), alone. Its text is as returned, except that links written with this PC's full path are made relative. What was done with each finding: the plan's section 10.

---

**CHANGES REQUIRED**

1. **§3.6 — preserving `data-iid` does not preserve dragging a spanning bar.**

   A Monday–Friday input grabbed over Wednesday must move by the distance from Wednesday. The current [drag handler](../../../../raptor-port/src/ui/caldrag.ts:242) requires `[data-icdrag]` and obtains the starting date from the chip’s enclosing `[data-icday]`. A weekly spanning bar has no single enclosing day: leaving that structure behind disables dragging; anchoring it to Monday gives the wrong movement when grabbed elsewhere. The landing-flash selector also assumes a chip inside the destination day.

   **Fix:** explicitly adapt the drag handler to resolve the date under the pointer within a spanning bar, retaining that date throughout the gesture. Resolve drop dates across the weekly bar layer and update the landing selector. Add mouse and touch cases grabbing a span by its middle and its continuation in another week; preserve duration, permissions, medical questions and release-click suppression.

2. **§§3.2–3.3 — `flynames` has no registered write route.**

   The plan introduces editable Required-row names but omits `settings.flynames` from its command inventory. The live [settings writer](../../../../raptor-port/src/state/people-settings-commit.ts:322) writes unknown keys raw. Its snapshot and record inventory also exclude unknown keys. Following the named additions therefore leaves a rename outside permission enforcement and Undo, even though it can persist.

   **Fix:** include `flynames` in `SETTINGS_KEYS`, the settings permission inventory and command registration; provide its validated admin writer, Undo wording and landing. Test a rename, member refusal, rollback, Undo/Redo and reload.

3. **§§3.1, 3.4–3.6 — the calendars have no specified subscription to changing Leave War facts.**

   Keep a calendar open on a month outside the loaded schedule week. In Days, add a holiday with “Save and add another”, on a date with no OIL-asking input. The holiday can save while the calendar underneath keeps its old tag and requirement.

   The current calendars subscribe to the scheduler store. The [reverse sync notification](../../../../raptor-port/src/leavewar/sync.ts:1999) only wakes scheduler readers when the loaded week’s OIL facts or pending OIL questions change. This example changes neither. The plan specifies both subscriptions for `FlyRows`, but not the reverse subscription for the calendars.

   **Fix:** expose a calendar-facts subscription/version through `sync.ts`. Subscribe both calendars, Days/Holidays and their open day details to it. Cover changes to events, definitions, availability, period coverage and Undo/Redo without relying on OIL notifications. Test the example while every affected window remains mounted.

4. **§3.3 — the proposed month-cache signature excludes inherited records.**

   Set a running requirement in January, then display March. Change or undo the January run. March’s answer changes, but its “plan rows in range” do not. A weekday rule beginning before March has the same problem. Subscribing to the stores does not fix a memo whose signature stays unchanged.

   **Fix:** key each month’s memo on every effective dependency: inherited runs for both seats, applicable weekday rules including their start/end boundaries, date overrides, day classification/coverage and availability. A scoped version is acceptable if it covers those dependencies. Add mounted-view tests changing and undoing a run or rule that starts before the drawn month.

5. **§3.8 — the input-stamp writer inventory misses independent doors.**

   A new input filed through the List’s Add form is constructed independently by [InputsPage’s `rowBody`](../../../../raptor-port/src/ui/InputsPage.tsx:459); it does not pass through the shared editor’s creation function. The plan names the List’s inline **edit**, but not this creation route.

   Likewise, Leave War moves and partial removals use [`doorMoveApproved` and `cutDates`](../../../../raptor-port/src/leavewar/sync.ts:434). They copy or split existing inputs without passing through `commitInputEdit`. A second admin can move newly approved leave while the resulting records retain the previous last-change stamp. The List’s OIL-answer revision also writes the input directly.

   **Fix:** replace “each door” in §5 with a named writer matrix covering List Add, shared creation/editing, approval and extension, Leave War moves/cuts, medical splits/trims, OIL-only revisions and posting-driven input trims. Specify creation-stamp inheritance for split pieces and the acting person/time for each change. Restore recorded stamps on Undo; do not stamp an Undo as a fresh filing. Keep the existing late-rule `mod` semantics separate.

6. **§3.3 — reusing the counter form unchanged gives the linked rows contradictory answers and controls.**

   Enable SANS on the Leave War roster, then edit Available P. The existing [counter preview](../../../../raptor-port/src/leavewar/ui/CounterForm.tsx:243) calls `ruleHave` with all projected people. With five ordinary pilots and one available SANS pilot, it previews six while the proposed linked row and calendar show five.

   The same form offers amber/red thresholds. The plan says these rows’ colour comes from Required, but only specifies refusing team counts and deletion. Saving nonzero thresholds can introduce a separate manning judgement.

   **Fix:** give the two linked IDs an explicit form mode: their preview uses the same SANS-excluding count as the grid/calendar; their explanation states that exclusion; threshold controls are absent. Enforce zero thresholds through both rule-save and threshold-update writers. Add the preview to §6’s count-surface roll-call and test it with SANS enabled.

7. **§3.4 and §8 — “Create the year” fails when that year is partly covered.**

   Create a January–March 2027 period, then add a holiday in August 2027. August is uncovered, so the proposed button calls [`createOilPeriodFor`](../../../../raptor-port/src/leavewar/sync.ts:259), which attempts January–December. `createWar` rejects that overlap. This is reachable with newly created periods, not merely old stored data.

   **Fix:** distinguish an entirely uncovered year from an uncovered interval within a partly covered year. Offer full-year creation only for the former. For the latter, route to period creation with non-overlapping bounds containing the requested dates, retain the holiday draft, and retry only after successful creation. Test partial-year coverage and a gap between periods. This is why I disagree with the unconditional year-creation recommendation in §8.

8. **§§3.8 and 6 — the Medical tab and document viewer are absent from the stamp roll-call.**

   File a new downchit, then open Medical and its document. [Medical cards](../../../../raptor-port/src/ui/MedicalView.tsx:74) list the input, and the document viewer opens its details, but neither is assigned the new stamp. The proposed stamp appears only after finding the same entry through the List or editor.

   D629 and the approved specification require the quiet line where an entry is listed or opened; the stated exception is the month’s cells.

   **Fix:** add Medical cards and the document viewer’s current input to §§3.8, 5 and 6. Render the shared stamp for the actual input being displayed; when paging through an episode’s documents, change the stamp with its owning input. Preserve medical grouping and document permissions.

The settings-store ownership choice is sound in principle: indefinite runs and recurring rules need not belong to one leave period. The single resolver, separate seat figures, SANS exclusion, UTC date arithmetic, preserved medical exemptions, unchanged Event sheet and required mock-up/build comparisons are also sound.

**D138 read — PASS:** I compared D585, D569, D571, D576, D577, D579, D580, D581 and D617–D641 with their full rows and superseding rulings, including D623/D625 in `how-we-work`. I found no meaning-changing error in those short lines. In particular, they do not revive the former recommendation-based build authority.

This is a static plan review. Runtime behaviour, geometry, performance, iPhone gestures and picture fidelity remain unverified.

I changed no files, ran no tests or builds, started no server, and did not open the other reader’s report. Only read-only inspection commands were used.

Rulings: none.
