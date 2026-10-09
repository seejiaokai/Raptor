1. **[P2] Changing the type and title together loses the title change from history.**  
   Create an Event titled “Sports day”, then change its type to Duty and its title to “Guard shift” in one save. History records `Event → Duty` but omits `Sports day → Guard shift`. On a published day, “To go out” also omits that title comparison.

   **Cause:** `inputLines` in [changelines.ts](/C:/Users/User/projects/Raptor/raptor-port/src/state/changelines.ts:131) and `inputWords` in [pendlist.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/pendlist.ts:189) compare titles only when the type stays unchanged. Changing the type does not adequately describe an independently changed custom title.

   **Exact fix:** Compare the normalised custom titles independently of the type comparison. When they differ, record the before/after display names as well as any type change. Two untitled records changing type should still produce only the type line. Add tests for changing both fields together and for changing a titled input into a type that cannot carry a title.

   **New with this change.** The existing history test changes the title alone and misses this case.

2. **[P2] A shared filing leaves its title attached to the next new input.**  
   In the List’s Add form, select several people, create an Event titled “Sports day”, and save. The form retains “Sports day”. Select Duty and save the next input without editing Title: the new Duty is also stored as “Sports day”. The corresponding single-person save correctly resets Title.

   **Cause:** The successful shared-save callback in `InputsPage.add()` resets Remarks but never calls `setTitle(null)`: [InputsPage.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:513). The separate single-person completion path does.

   **Exact fix:** Reset Title after a successful `commitGroup`, alongside the shared callback’s existing Remarks reset. This must also happen when saving resumes after the OIL question; cancellation or refusal must retain the draft. Add a test that saves a titled shared input and then an untouched-title input of another type, checking that the second record has no custom title.

   **New with this change.** The reset test covers only a single-person filing; the shared-title test edits an existing group through its window.

3. **[P2] Read-only Board input cards omit the type beneath a custom title.**  
   Create an OD titled “Exercise Darwin”, publish the day, and open its issued-version Board preview. Its Unavailable card displays “Exercise Darwin” without “OD”. Personal Inputs cards have the same omission. OD makes the failure particularly clear because it has no ground-programme row elsewhere to identify its type.

   **Cause:** The early read-only return in `sbInpRow` draws `inpLabel(inp)` without `inpKindTagHTML(inp)`: [board-html.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/board-html.ts:671). The editable branch includes the label. Both Board panels reach this read-only branch, contrary to D716–D717’s requirement to keep the kind visible.

   **Exact fix:** Put the title and kind label together inside the read-only card’s existing name cell, preserving its grid structure. Read both from the supplied input so an issued preview retains its frozen values. Test titled OD and Event cards in read-only and issued-version Boards, including a subsequent live rename; untitled cards should retain their existing appearance.

   **New with this change.** The Board card tests exercise editable cards, not this early return.

**Explicit negatives — traced and found sound, apart from those findings:**

- **Eligible records and editing doors:** The ten permitted kinds share the title normaliser. Leave, medical, Upchit and SANS inputs cannot acquire a displayed title. New/edit windows, the List pencil, calendar moves, reassignment and in-place field edits carry the title. A draft that omits `title` preserves the stored value; explicit clearing removes it. Retyping to an ineligible kind removes it rather than allowing it to reappear later.
- **Shared records and other writers:** Shared-field comparison includes title. Kept and added group members receive it; regrouping distinguishes different titles. Medical splits, date trims, person deletion, Leave War paths and the probe writer introduce no additional title-dropping path. Snapshot persistence and Undo/Redo retain the field.
- **Request identity and downstream calculations:** Distinct request rows with the same name remain distinct in either arrival order. Repeated pushes of the same request row do not duplicate it. I traced seat/extras, blank and midnight-tail handling, availability, Insights, work spans, crew rest and OIL consumers; I found no new double-counted figure or rule classification driven by a custom title.
- **Published records:** Title-only changes enter the input comparison and pair as one changed input. Folding with the remade programme row, sign-off binding, issued-version reads and Unpublish preserve the intended separation between working and issued values. Row kind labels read the row’s saved type.
- **Markup and interaction:** Week, Board ground rows, next-week peek, List and calendar naming paths carry the title. Kind labels stay outside editable text, preserving name editing, amendment addressing and drag targets. Board name wrappers preserve child positions. Per-block replacement compares the changed markup.
- **Names versus types:** Search, CSV output, warning names, changes headings and OIL question headings use the title where required. Type filters, Logic and rule calculations retain the actual kind. “Other” remarks remain remarks.
- **Tests and contracts:** I found no weakened replacement assertion in the reviewed tests. Their principal uncovered cases are the three above. The record declarations match the implementation; the read-only Board omission contradicts the visible-kind contract.

I independently reviewed the requested comparison and its callers without opening the prohibited reports. Isolated, in-memory evaluations of the production functions reproduced all three failing branches with stubbed dependencies; these were not integrated browser tests. I ran no test suite or app walk and changed no file. The supplied evidence sheet remains marked open, so this report does not certify completion of its remaining checks.

Rulings: none this session.

VERDICT: CHANGES REQUIRED