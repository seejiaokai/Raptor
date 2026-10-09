**Sol’s report — CHANGES REQUIRED**

Reviewed `claude/inputs-sans-calendar` against `126c6074`, through `35b819e0`, including the check’s fix commits and the later earned-leave editor fix. This was read-only: no files changed, no tests, builds or servers run. The results below are source findings; the host cases remain to be run.

I did not open either saved reader report. A newly appended host summary surfaced during the final evidence-sheet search, after my initial findings were formed. I have distinguished the subsequent editor fix from the remaining drag issue.

**A. Wrong lines**

**1. Medium — a stale holiday form can remove an event that is no longer a holiday.**

Setup: create a public holiday named “National Day” on 9 November 2026. Open it from Calendar’s Holidays list. Behind that form, use the Leave War’s Event sheet to change its kind to a working event, keeping its name and date. Return to the old form and press Delete.

The deletion succeeds. Matching checks the row, dates and normalised name, but not the event’s current kind. Save from the stale form can likewise replace the working event with the old holiday draft. For repeated day events, finding just one surviving matching day is sufficient to permit removal.

Cause: [holidays.ts:80](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/engine/holidays.ts:80) and [holidays.ts:94](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/engine/holidays.ts:94). Both holiday writers trust that match at [store.ts:3512](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:3512) and [store.ts:3558](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:3558).

This breaks the stated “changed on the Leave War → no longer there” refusal and D638’s two doors onto one record.

Exact fix:

1. Give the opened holiday reference sufficient identity to compare the record it represented, including its kind and complete extent.
2. Before clearing anything, verify the band or **every** day represented by a repeated run.
3. Return `gone` when the record no longer matches; preserve the user’s draft and change nothing.
4. Add same-name kind-change and partially changed run tests for both Change and Delete.

**2. Medium — a shared bar’s drag can leave another person’s earned-leave question unanswered.**

The new fix at `35b819e0` correctly checks every retained person during the editor’s Save. The drag still calls the question helper with one record only.

Concrete new-data setup:

1. File a two-hour Saturday duty for two people, answering Yes for both.
2. Have the alphabetically first person change his own answer to No.
3. Move the group to Monday. Its Saturday answers remain stored but inactive.
4. On the schedule, change the second person’s Monday hours to eight hours, then back to two hours. His old positive Saturday answer is voided; the records rejoin the same shared entry.
5. Drag the shared bar back to Saturday.

The first person’s standing No satisfies the helper. No question opens, while the second person now has no Saturday answer and is left to his own bell.

Cause: [caldrag.ts:149](C:/Users/User/projects/Raptor/raptor-port/src/ui/caldrag.ts:149) calls `askOilIfPending(r)`; [inputedit.tsx:1323](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1323) checks only that record. A standing No passes at [inputedit.tsx:688](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:688). This breaks D660.

Exact fix:

1. After a whole-entry drag, check every surviving moved record for an unanswered applicable day.
2. If any needs an answer, open the existing shared question using a record that needs it.
3. Apply the answer through the existing shared save; preserve the single-record behaviour for individual edits.
4. Test mixed answers and inactive answers retained from an earlier date. Checking the first and last array positions alone is insufficient.

**3. Medium-low — adding an earlier callsign can draw a shared filing twice in the List.**

Setup: show one shared Meeting for BRAVO and CHARLIE in the List. Open its editor, add ALPHA, and Save.

The representative becomes ALPHA’s record, but the save reveals a surviving record from the old entry. Its old row is absent from the rendered List, so the reveal effect pins it. Pins are appended **after** entry deduplication, using individual object identity. Both the pinned old representative and the new representative can then draw as the same three-person filing.

Cause: [inputedit.tsx:1985](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1985), [InputsPage.tsx:364](C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:364), entry deduplication at [InputsPage.tsx:788](C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:788), and pin insertion at [InputsPage.tsx:825](C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:825). This breaks D655’s one shared thing.

Exact fix:

1. Resolve reveal and pinned records to the current entry representative.
2. Deduplicate the final List after applying pins, by entry identity rather than record object.
3. Scroll and outline that representative.
4. Add an integrated List/editor test where the added person sorts before the previous first person.

The failure concerns drawing; it does not create extra saved inputs.

**4. Medium-low — Undo of a visible flying-class change switches the Inputs tab unnecessarily.**

Setup: show October 2026 on the Inputs calendar. Open Calendar, set 9 October to NF, then Undo while that date is visible.

The landing callback unconditionally selects SANS and resets the calendar view/month. It does not ask whether the changed date already shows on the current calendar or Calendar window.

Cause: [undo-wire.ts:215](C:/Users/User/projects/Raptor/raptor-port/src/state/undo-wire.ts:215). This contradicts D672: leave the screen where it is when the change is already in view.

Exact fix:

1. Determine whether the affected date is visible before applying the landing.
2. Preserve the current tab, month and scroll when it is.
3. Use the existing SANS landing when navigation is actually needed.
4. Test Undo and Redo from the visible Inputs date, the visible SANS date, and an unrelated page.

The existing landing test checks arrival from another page; it does not exercise this visible-date branch.

The eight requested areas, individually:

| Area | Result |
|---|---|
| 1. Permissions and shared editing | Checked; no fresh permission finding. The known command-gate gap is confirmed under C. |
| 2. Saved records and settings | Finding 1. |
| 3. Availability and kept answers | Checked, none. |
| 4. Late rules | Checked, none. |
| 5. Earned leave | Finding 2; the later editor fix was read and addresses its editor path. |
| 6. Published records and changes | Checked; no fresh finding. The filed “To go out” grouping gap remains. |
| 7. Undo | Finding 4. |
| 8. Check fixes and their connections | Finding 3 in the save/reveal/List connection; no repeat of the twelve recorded fixes. |

**B. Missing lines against the roll-call**

- **G3, List:** the drawing path reaches shared entries, but its later pin path can put an individual record back beside that entry. Finding 3.
- **G9, earned-leave question:** the shared drag’s follow-up checks one person rather than the entry. Finding 2.
- **H8, command gate:** the medical/upchit restriction is missing there; see C.
- **G5, “To go out”:** still per person. Already filed as `[CAL-TOGO-ONE-ITEM]`; not a fresh finding.
- **H2’s wording:** “none drawn” for another member is inconsistent with the intended shared List button, which opens the entry read-only. The current contract expressly permits that reading door.

Checked, none elsewhere in the roll-call for holiday tags, required/available figures, placed-by lines, late tags or prohibited sun/moon and figure displays.

**C. A rule held only at the screen/save**

The brief’s medical-group gap is real at the command door.

`mayFileGroup` refuses these kinds at [perms.ts:241](C:/Users/User/projects/Raptor/raptor-port/src/state/perms.ts:241). However, [inputgroup.ts:97](C:/Users/User/projects/Raptor/raptor-port/src/state/inputgroup.ts:97) checks only the group’s filer and duplicate person/shared-field combinations.

An admin’s `writeInputsBatch` can therefore introduce two fresh ATT C records for different people, with matching shared fields, one group id and one filer. The funnel at [store.ts:190](C:/Users/User/projects/Raptor/raptor-port/src/state/store.ts:190) accepts that group shape. It saves two per-person inputs which the entry reader presents together. This is a command-level reproduction, not a demonstrated browser bypass.

Required fix:

1. At the common group check, reject a touched medical/upchit **entry containing several people**.
2. Apply the same check to forward writes and Undo/Redo restoration.
3. Permit an ordinary single-person record retaining group provenance.
4. Test refusal with no saved inputs, history or Undo step, plus a legal single-person control.

This confirms the gap already named in H8; it is not reported as a new discovery.

**D. Test wires not held by the supplied checks**

These are specific missing combinations, not claims that the whole area lacks tests.

| Area | Wire that needs a regression |
|---|---|
| 1 | A direct admin command creates a multi-person medical entry. Screen refusal does not test the gate. |
| 2 | A stale holiday keeps its name/date but changes kind; or one day of its repeated run changes. Existing stale tests remove or rename it. |
| 3 | Warm `dayFacts`, change an absence or Available definition, then Undo/Redo and read the same cached date again. Forward-change version tests do not establish that complete round-trip. |
| 4 | The **displayed** late reason uses a deadline in 2027. Arithmetic crosses years in engine tests; the displayed weekday/date assertion uses 2026. |
| 5 | The mixed-answer shared drag in finding 2. The new mixed-answer tests exercise editor Save. |
| 6 | Two separate same-actor, same-word changes within 1,500 ms. [changesmodel.ts:314](C:/Users/User/projects/Raptor/raptor-port/src/ui/changesmodel.ts:314) folds by words and time; tests separate changes by an hour or another actor. |
| 7 | Undo/Redo of a class already visible on the Inputs calendar, preserving its tab and month. |
| 8 | Remove the desktop side margin introduced by W12. The sheet itself records that the margin has no dedicated assertion; “no sideways scroll” does not establish a visible gap. |

**E. “AS BUILT” and the six corrected documents**

The corrected record descriptions agree with the code on:

- Per-person inputs tied by group id, with half-day and SANS ticks participating in entry identity.
- Filer permissions reading `by` or `grpBy`, restricted by the live switch and permitted kinds.
- Immutable member filing stamps and the restricted amounts/dates of answers made for another person.
- Separate settings rows, typed admin commands, holiday/Event short forms and the shared resolver.
- The deliberate per-person treatment outside the Inputs entry surfaces.

In particular, `data-model.md` §11 agrees with `perms.ts`. Its medical-group paragraph accurately admits that the restriction is absent from the commit gate.

The AS BUILT choices concerning defaults, running figures, mixed picks, counting, window behaviour, stamps, group splitting and adding/removing people produced no additional ruling contradiction in this read.

The eleven picture/behaviour differences in the evidence sheet’s §8 remain **unapproved**, including the filer’s later answer replacing a person’s earlier No. They cannot be treated as approved merely because the plan describes them as built. The plan’s “Nothing is with him now” is not a reliable closing status beside that later look card.

The List’s one-row and Undo’s no-movement wording are promises the code fails in findings 3 and 4. The changes-window promise still has the separately filed “To go out” exception.

**F. Exclusions**

No migration, back-compatibility or stored-demo-only issue is included. Each fresh finding can arise from newly created records.

I excluded the schedule’s future grouped row, the already filed blocking Leave War windows, D678/D679’s phone-top work, and the other recorded calendar leftovers.

**Ranked host cases**

For cases 1–4, the prediction is the failure described above; the expected correct behaviour and falsifier are stated below.

1. **Stale holiday kind:** create “National Day” on 9 November; open its holiday form; change its Event kind to working without renaming; Delete, then repeat with Save. Expected: refusal, working event untouched. Refusal with unchanged records disproves finding 1.
2. **Shared drag with mixed history:** perform finding 2’s Saturday → Monday → Saturday sequence. Expected: one question whenever any moved person needs an answer. A question with no person left unanswered disproves finding 2.
3. **Earlier person added:** create BRAVO/CHARLIE’s Meeting on 12 November; open it from List; add ALPHA; Save. Expected: one three-person row. Exactly one row after reveal settles disproves finding 3.
4. **Visible class Undo:** October Inputs calendar, 9 October visible; set NF through Calendar; Undo/Redo. Expected: same tab/month/scroll. Preservation disproves finding 4.
5. **Medical command guard:** submit two fresh ATT C records in one group through the real input batch. Expected: whole refusal, no persisted records/history/step. Refusal disproves the confirmed gate gap.
6. **Partially changed holiday run:** repeat one holiday over 9–11 November; hold its list reference; change the middle day to SC; remove/change through the old reference. Expected: whole refusal; all three current events preserved. Whole refusal disproves this variant of finding 1.
7. **Published shared lifecycle:** publish a day containing three people’s shared duty, set all four sign-offs, then separately edit, move and delete the entry. Expected: each affected person pending, sign-offs cleared, issued face unchanged until amendment. Any early issued-face change or surviving sign-off falsifies the sound source conclusion.
8. **Two rapid history changes:** create two separate same-actor changes to different people in the same entry, identical words, 500 ms apart. Expected: separate changes. Folding them establishes the coverage concern under D6.
9. **Warm cache round-trip:** read 10 November’s figures; add half-day leave; read; Undo/read; Redo/read. Repeat with an Available definition. Expected: every answer matches the current records. A stale result falsifies the sound cache conclusion.
10. **2027 displayed deadline:** SANS commitment on 19 January 2027, standard Wednesday/two-weeks cut-off, changed 7 January. Expected: late reason “Wed 6 Jan”. A different weekday/date establishes the display coverage concern.
11. **Editor fix plus additions:** first person No, others Yes; change two-hour Saturday duty to all-day, then add another person. Expected: one question at each required save; every applicable person answered; unchanged people’s answers preserved when only adding a person. Failure falsifies the later-fix conclusion.
12. **Desktop gap:** open each calendar’s day window at its default position at 1280 × 720. Expected: a visible gap between page and window, retained without sideways overflow. No gap establishes the W12 coverage concern.

**Explicit sound negatives**

- Member filing rights remain bounded by kind, filer, person and the live switch.
- Shared save/delete preflights and command refusal preserve whole-batch rollback.
- Forward writes and restores hold duplicate-person and single-filer group checks.
- Creation/change stamps remain distinct from the late-date stamp.
- Availability excludes SANS people; committed flying counts each eligible person once.
- Required, available and still-needed figures use the shared resolver.
- Days-mode late arithmetic remains intact; separate cut-offs, year boundaries and unreadable dates are handled.
- Answer copies are per person; adding/removing a person preserves unrelated standing answers.
- Published input changes retain the issued snapshot and use the existing pending/sign-off machinery.
- The short-tag, front-window Escape, people-as-unsaved-work, record-following and spanning-input reveal fixes were read without a fresh failure in those specific fixes.
- The late editor fix checks every retained person, rather than the first alone.

**Verdict: CHANGES REQUIRED** — fix stale holiday identity checking, the shared drag’s earned-leave follow-up, List deduplication after reveal/pinning, and visible-class Undo landing. Close the already documented medical/upchit command-gate gap. This report is evidence, not approval.

**Rulings: none this session.**

