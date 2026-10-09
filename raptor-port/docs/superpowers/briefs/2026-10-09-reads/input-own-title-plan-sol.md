SOL’s blind review of version 1. Findings below concern the written plan, not approval of the build underway.

1. **A title can hide a commitment and change clash severity.**  
   In [events.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/events.ts:447), `buildDay`’s `push` removes events with the same person, hours **and label**, even when they belong to different rows. Put a Meeting before an overlapping Training input for the same person and hours, then title the Training “Meeting”: the Training event disappears. Against an SC MAIN shift, its red clash disappears while the Meeting’s amber advisory remains. The accepted Training input is deferred to its row, so it supplies no replacement warning.

   **Exact fix:** deduplicate by row identity, person and window, preserving separate rows regardless of their names. Collapse the primary seat and `more[]` only for the same row. Also change `validate`’s `A.label === B.label` “two seats” wording test to identify the same underlying line. Add tests for Training titled “Meeting” and two different commitments sharing a title, including the crew picker, a deleted source input and a hand-renamed row.

2. **A title-only edit is not reliably a published-day change.**  
   [inputs.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/inputs.ts:96), `inpDetailKey`, omits the title. `publish.inputAxes` uses that key. A title-only edit to an OD, an input filed under Unavailable, or a covered date without the input’s landed row can therefore produce **zero pending changes and retain the sign-offs**. Keep the hours, filing, OIL answer and late status unchanged to reproduce it. Even a landed row cannot detect a case-only title change through its upper-cased `prog`.

   **Exact fix:** include the normalized title in `inpDetailKey`. Retain the existing folding in `dayPendingItems`, which combines the input change and its re-landed row into one item. Replace §3.6’s “Nothing new is built” statement. Test landed and non-landed inputs, another covered date, and a case-only edit: one pending item per changed input on that date, sign-offs invalidated, issued name preserved, and zero pending after republication.

3. **Warning sentences do not automatically inherit the title.**  
   In [events.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/events.ts:490), `mapInp` copies only person, window, type and remarks. Consequently, `validate`’s existing `inpLabel(inp)` calls receive no title. Several other warning branches interpolate `inp.type` directly. For example, Training titled “Safety course” still reads “Training clashes with…” on a covered day without its landed row; a titled Meeting against SC MAIN also loses its name.

   **Exact fix:** carry the optional title through `mapInp`, including `whole` and neighbouring-day copies. In [validate.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:858), use `inpLabel` wherever a titled input is named in a sentence; retain `type` for classification, severity and medical/leave rules. Add named-warning tests for flying, timed and blank tasking, SC MAIN and crew rest. §3.2’s claim that no caller changes are needed must be narrowed.

4. **The roll-call omits direct name builders and the export.**  
   These paths do not gain the promised behavior merely by changing `inpLabel`:

   | Path | Concrete failure | Exact fix |
   |---|---|---|
   | [inputedit.tsx](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:701), `oilGate` | The question names “Event”, although the draft is titled “Sports day”. Row 16 incorrectly says it already uses `inpLabel`. | Build `typeLabel` from `inpLabel(draft)`, leaving the OIL decision inputs unchanged. |
   | [oilmode.ts](C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:979), `oilRequestName` | OIL history chooses `meta.name` before the input’s name, so a custom title is lost. | Prefer `inpLabel` for titled kinds; retain the existing official naming for kinds outside D716. |
   | [export.ts](C:/Users/User/projects/Raptor/raptor-port/src/ui/export.ts:46), `inputRows` | The Inputs CSV contains Type and Remarks but nowhere records “Sports day”. | Add a Title column containing the effective input name; retain Type and Remarks. Test CSV escaping and formula neutralization for titles. |
   | [pendlist.ts](C:/Users/User/projects/Raptor/raptor-port/src/ui/pendlist.ts:169), `inputWords` | Once finding 2 is fixed, a title-only edit still reads merely “changed”, rather than the promised old and new title. | Compare effective names and emit explicit title from/to words, without duplicating a kind change. |

   Add these paths to §§4–5 and the sized walk.

5. **Searching a title can show a month bar but hide its opened card.**  
   The plan adds title search to the List and `monthItems`, but [InputsCal.tsx](C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:102), `dayEntries`, independently searches only remarks and callsign. Its opened-day caller receives the same search filter. Search “Sports day” with empty remarks: the planned month bar matches, but opening that date shows no matching input.

   **Exact fix:** add the same `inpLabel(r)` search match to `dayEntries`, preferably through one shared search predicate. Test searching by title and opening the matching day.

6. **The retained remark-hiding test can still hide a newly written Other remark.**  
   §3.3 says the test “now never fires for an Other”. That is false. [InputsCal.tsx](C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:947) hides remarks when `r.remarks === it.word`. A new Other whose title and explicitly entered remark both read “Sports day” loses its remark on the day card. The same becomes possible for every titled kind.

   **Exact fix:** remove this name-equality suppression and display non-empty remarks independently of the title. Prevent automatic title duplication at the writer, as D716 requires. Test an Other with identical title and remarks, and one with different values.

7. **The reference label twin still implements the retired Other rule.**  
   [refwin.ts](C:/Users/User/projects/Raptor/raptor-port/src/testing/refwin.ts:724), `reirest`’s `_il`, explicitly names Other by its remarks. A fresh timed Other with remarks “Dentist run” that supplies the first commitment in a crew-rest warning will be named “Other” by the new port and “Dentist run” by the reference mirror. Adding the promised title support also requires the mirrored input projection and warning-name patches to carry it.

   **Exact fix:** update the **in-memory reference patches in `refwin.ts`** to mirror the new effective-name rule and optional title projection. Add cross-engine cases for an untitled Other with remarks, a titled Other, and a titled Meeting warning. Preserve the documented boundary around accepted-input rows. Leave `reference/` unchanged: `tfin.js` checks the original app, including its historical label-based deduplication assertion. Its 728/0 result and the existing view-week comparison still need to be measured.

Explicit negatives:

- `shiftHardGround` correctly uses the source input’s kind, the frozen input on an issued face, and retained `srcType` after deletion. A scheduler’s hand rename still matches the row’s event label and does not force the keyword fallback. Finding 1 is a separate event-identity defect.
- The BRIEF/DEBRIEF and EP label readers are confined to sim rows. Input titles do not enter those arrays. Info and cancellation checks use flags; input classification, availability and crew-rest eligibility use kind.
- `oilEvidenceKey` excludes title. OIL eligibility, amount and stale-answer checks use kind, holder, dates, hours and answers. An otherwise unchanged answered input needs no fresh question or altered credit.
- Reading the kind tag from the row is appropriate for issued faces, peeks, hand-renamed rows and retained rows whose input is gone. Keeping the tag outside `data-txt` and the board’s name control protects text commits and carets. Block swapping compares complete markup and can detect it without changing its algorithm.
- I found no separate title-loss defect requiring a redesign of undo/redo, whole-record snapshot restoration, the probe bridge or Leave War’s leave-writing doors. The shared-field registry, no-op comparisons and all stated minting paths still require the planned title handling and tests.
- Logic’s kind table and Insights’ classifications should remain about kinds. The bell derives an unanswered-input target rather than independently rendering its name; the question it opens is covered by finding 4.
- The approved pictures support the proposed title/kind placement. Actual row heights, drag behavior, DOM ceilings and escaping remain build checks, not established by this static review.
- No stored-demo migration finding is raised. No files were changed, no other reader’s report was opened, and no test run or browser walk is claimed.

Rulings: none made by this review; the owner’s product choices remain settled.

VERDICT: CLEAN WITH THESE EXACT CHANGES