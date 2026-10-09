1. **HIGH — A title can remove a commitment from the warning engine.**

   **Failure:** Give one person a Meeting and an Event at identical times, with the Meeting first. Rename the Event “MEETING”. The engine now retains only the Meeting. Their mutual clash disappears; against SC MAIN, the Event’s hard clash can disappear while the Meeting’s advisory remains.

   **Cause:** `src/engine/events.ts`, `buildDay()`’s `push()` deduplicates by person, start, end and **label**, ignoring the source row’s key. I reproduced the two-events-to-one result using the actual function in memory.

   **Exact fix:** Deduplicate repeated appearances of the same person on the **same row**, using the source key and person identity. Distinct rows with identical titles must remain distinct events. Preserve the intended primary-seat-plus-`more[]` deduplication. Add tests with equal titles, both row orders, different input kinds, SC MAIN and scheduler-renamed rows. In `validate.ts`, also restrict “two seats on [name]” wording to an actual shared source rather than equal labels.

2. **HIGH — Title-only changes can remain invisible on published days.**

   **Failure:** Publish a day containing an OD input, then change only its title. OD has no landed ground row, so there is no changed `prog` for the plan’s proposed comparison to find. The input can remain at zero pending changes with sign-offs intact. The same gap affects covered days other than a multi-day input’s landing day.

   **Cause:** `src/engine/inputs.ts`, `inpDetailKey()`, excludes title. `publish.ts`’s `inputAxes()` uses that key. I confirmed that an OD with and without a custom title produces identical keys. Changing `srcvOf()` through `prog` covers only the landed row.

   **Exact fix:** Include the normalized, meaningful title in `inpDetailKey()`. Empty/default titles must compare identically; non-title kinds must ignore it. Add the explicit before/after title pair to `pendlist.ts`’s `inputWords()`.

   Test landed requests, OD, an Other filed under Unavailable, and every covered day of a multi-day commitment. Each affected published day must show one input change, drop sign-offs, retain the issued name, restore sign-offs on reversal and clear pending on republication. Keep title out of the OIL evidence key.

3. **MEDIUM — Changing `inpLabel()` alone does not update several promised names.**

   The automatic-propagation claim in §3.2 and parts of the roll-call are incorrect:

   | Concrete failure | Cause | Exact fix |
   |---|---|---|
   | A titled Meeting still appears as “Meeting” in input-based warnings. | `events.ts`’s `mapInp()` discards title before `validate.ts` calls `inpLabel()`. Several warning sentences also interpolate `inp.type` directly. | Carry title through the input, whole-day and midnight projections. Use `inpLabel()` wherever a warning names the commitment; keep all classification predicates on `type`. |
   | The OIL question calls “Sports day” “Event”. | `inputedit.tsx`’s `oilGate()` returns `draft.type`; the List’s question construction also supplies the type. | Pass the effective input name as the question’s display label through every question-opening path. Leave eligibility and amounts unchanged. |
   | OIL history and switch messages use the catalogue’s name instead of the title. | `oilmode.ts`’s `oilRequestName()` prefers `inpMeta(r.type).name`, making the `inpLabel()` fallback ineffective for known kinds. | Prefer the custom title when present, preserving the existing untitled wording. Verify the history, toast and footer callers. |
   | A deleted titled request is called “Event” in pending/load explanations despite its row retaining “SPORTS DAY”. | `pendlist.ts`’s `requestName()` and `drafts.ts`’s `rowsLeftOut` mapping construct a title-less input from `srcType`; that non-empty result prevents the `row.prog` fallback. | Use the relevant frozen input when available; otherwise name the missing request from its retained row’s `prog`, falling back to its kind only when that is empty. |
   | An editable Board input card loses the kind after displaying the title. | The tooltip cited in §3.5 belongs to the read-only card. Editable cards use `inpEditLabel()`, whose tooltip contains generic editing instructions. | Add the escaped kind to the titled card’s tooltip in both editable and read-only paths, including OIL mode. |

   Add these explicit tasks and cases to the roll-call. The shared label helper cannot repair consumers that discard its input or bypass it.

4. **MEDIUM — The Inputs CSV export loses the title.**

   **Failure:** Export two otherwise identical Events with different titles. The exported rows contain only “Event” and cannot identify either commitment.

   **Cause:** `src/ui/export.ts`, `inputRows()`, explicitly exports `r.type` and has no title column. It is absent from the plan’s roll-call.

   **Exact fix:** Keep the existing Type column and add a Title column containing the effective input name. Continue using the existing CSV escaping and formula neutralization. Test custom titles, untitled inputs and formula-like text.

5. **MEDIUM — The retained remark-suppression test hides new, valid remarks.**

   **Failure:** File a new Other titled “Travel” with the plain remark “Travel”. The opened day’s card hides the remark.

   **Cause:** `InputsCal.tsx` suppresses remarks equal to `it.word`. Section 3.3 says this condition “now never fires for an Other”; a user-controlled title makes that statement false.

   **Exact fix:** Remove the old name-equality suppression. Render non-empty remarks independently of the title. Test equal title/remark text on both Other and Event. This affects newly filed records and is not an old-demo-data issue.

6. **LOW — The prescribed controlled value prevents clearing the Title box.**

   **Failure:** With the exact `draft.title || draft.type` expression in §3.4, deleting the last character immediately restores the kind’s name. An empty draft cannot remain empty while the user edits.

   **Cause:** The expression treats “use the untouched default” and “the user deliberately emptied the field” as the same state.

   **Exact fix:** Represent the untouched default separately from an explicitly empty string—for example, a nullable draft value with nullish fallback. Allow empty text during editing and normalize it to an absent stored title at save. Apply the same behavior to all three editors and test clearing, typing a replacement and changing kind.

   The live editor had begun using this distinction during my read; correct the plan accordingly. That observation is not approval of the unfinished implementation.

**Explicit negatives and required verification**

- **Kind-based rules:** Apart from the label-identity failure in finding 1, I found no additional title-word rule switch in the traced paths. `shiftHardGround()` resolves the source input’s kind, with `srcType` covering a retained row whose input is gone. A scheduler’s manual rename still matches the event label generated from that row. Availability uses the same grading helper. The BRIEF/DEBRIEF/EP readers operate on sim rows; flight remarks and mission-word readers do not receive an input’s title.
- **OIL:** The question’s eligibility and amount calculation use kind, person, dates and hours. The evidence comparison excludes title. Preserve that separation while fixing display names. The ALL AVAIL heading correctly reads a landed request from the installed day’s row, preserving issued names.
- **Schedule markup:** Reading the kind from the row is appropriate for issued faces, peeks and retained rows. In the week, put the badge inside `.nm` but outside the editable `.ntx`; that preserves text addresses and the block-swap structure. The Board needs a name wrapper containing its existing editor or OIL toggle and the badge: `sbName()` currently returns the control itself. Do not add another direct child to the seven-track grid. Preserve amendment attributes, keyboard targets and drag/fill addresses. Row height, clipping and DOM ceilings still require the planned running-app checks.
- **Save paths and permissions:** The general record-copy, undo/redo and persistence paths do not require a title-specific transport. The explicit constructors and updates do. Keep title in group shared-field identity as well as group writes; preserve it through `draftOf()`, reassignment and in-place editing. Loading an older issued day must retain its frozen row wording without rewriting the live request’s title. Leave War writes concern kinds that cannot carry titles. I found no need for a new permission.
- **History:** `WIN_FIELDS` is not the history writer. The necessary title comparison belongs in `state/changelines.ts`’s `inputLines()`, with `itype` remaining the actual kind. That implementation had begun during this review; the plan’s history tests must still prove it, including grouped entries.
- **Other and parity:** Tests asserting that Other reads from remarks must change under D716. `refwin.ts` also contains the old `_il` remarks-based label helper and an assumption that Meeting’s type always equals its displayed name. Update the permitted reference adapter where those cases are compared, or define the new behavior’s narrow comparison boundary and pin it with positive tests. Do not edit `reference/`. `tfin.js` exercises the original reference document: its success alone cannot establish title support. I did not run either parity gate and do not certify 728/0 or byte equality.
- **Remaining surfaces:** The schedule CSV/PDF export contains flying lines rather than input names, so it needs no new input-title rendering. The Logic catalogue must continue naming kinds. The bell routes to the input editor. Insights arithmetic must remain unaffected; finding 1 is the relevant event-stream risk.
- **Scope:** This is a review of version 1 of the plan. The working tree changed during the read, so this is not an implementation approval. No files were changed by me, and no file in the prohibited review directory was opened. No product choice needs reopening; the planner can apply these technical corrections.

Walk: Not performed; this was the requested read-only plan review. The build’s FULL check remains required.

Rulings: None.

VERDICT: CLEAN WITH THESE EXACT CHANGES