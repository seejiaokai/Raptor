# Astra's challenge of the plan's add-on: the Event sheet, presets and short names - 7 Oct 26

The brief: `2026-10-07-inputs-sans-redesign-plan-addon-brief.md`. The section: §3.12 of `../plans/2026-10-07-inputs-sans-redesign-plan.md`. Run read-only through the Codex tool (model gpt-6-astra, high effort), alone. Its text is as returned. What was done with each finding: the plan's section 10.

---

**CHANGES REQUIRED**

1. **Reopening can show the wrong preset and OIL explanation.**  
   **Where:** §3.12, “Opening an event that exists.”  
   **Failure:** Save an event named “PH”, explicitly tagged Off day, with “OFF” on the grid. Reopening lights the PH preset because its name matches, although the saved event is an Off day. The explanation beneath that preset therefore says work earns OIL when this weekday does not. Likewise, a custom-named event made from the second of two public-holiday presets reopens with the first preset lit. Renaming or deleting its original preset produces the same false identification.  
   **Cause:** The proposed reopening rule prioritises a name match over the saved tag, then treats matching kind as proof of matching preset.  
   **Exact fix:** Require both a matching name and a compatible effective kind before lighting a preset. Otherwise open “Other…” with the event’s actual kind selected. Opening must preserve its text, short form and stored tag without applying preset defaults. Add tests for conflicting name/tag, two presets sharing a kind, and a renamed or deleted preset.

2. **“Note (none)” does not mean none under the existing classification rules.**  
   **Where:** §3.12, “Other…” and “Unchanged, and tested as unchanged.”  
   **Failure:** On an ordinary weekday, choose Other → Note, enter “PH”, and save. With the proposed existing tag mechanism, no tag means `null`; `columnKindFor` then matches “PH” against the library and makes the day a public holiday. Leave charging and OIL eligibility follow that result, despite the sheet saying Note. Bands have the same problem.  
   **Cause:** The plan treats an absent tag as an explicit “no classification”. Today it means “classify from the name”. The statement that these readers never read text is therefore inaccurate.  
   **Exact fix:** Preserve the existing fallback, but specify that Note is available only when the name has no library classification. Refuse a conflicting Note save with an explanation, keeping the editor open. When reopening an untagged event, display its effective library classification. Add day and band tests using “PH”, including leave charging and the published-schedule OIL boundary.

3. **Moves and replacement paths can discard the chosen short form.**  
   **Where:** §3.12, Records; “Save, Move and Delete: unchanged”; Tests.  
   **Failure:** Save “National Day” with a custom short form “NAT”, then move it. Today `moveEvent` reconstructs a band using only its dates, text and kind; the single-day path likewise copies only text and kind. Leaving those paths unchanged drops “NAT”, so the moved event prints the derived “ND”. A refused band replacement restores the original through another call that also omits its short form.  
   **Cause:** The plan names the reload readers but does not require the existing writers to carry, clear and restore the new information together.  
   **Exact fix:** Add an explicit writer checklist covering single-day writes, repeated ranges, band creation, replacement and refusal restoration, both move paths, deletion, and the Holidays writers. Text, kind and short form must travel together; clearing an event must clear its short form. Validate before removing an existing band. Test a deliberately non-derived short form through each route, then Undo, Redo and reload, including an added Event row.

4. **Editing a preset’s name or kind can erase its short form.**  
   **Where:** §3.12, Records and “Edit presets.”  
   **Failure:** Give “Founders Day” the short form “FDY”, then rename it “Foundation Day”. The existing `updateEventDef` constructs the replacement from `{ name, kind }`, discarding the new short form unless explicitly extended. The preset then falls back to “FD”; newly placed events inherit that unexpected result.  
   **Cause:** Adding a short-form box does not make existing partial edits preserve the new field.  
   **Exact fix:** Specify that preset updates preserve every property absent from the patch, including `short`. Extend the loader and add/update helpers together. Test name-only and kind-only edits after setting a custom short form, deleting a neighbouring preset, reset to standard, Undo/Redo and reload.

5. **The validation rule broadens the approved “letters” rule to arbitrary characters.**  
   **Where:** §3.12, “A short form is 1 to 3 characters” and `shortOf`.  
   **Failure:** “1&2” or “!!!” passes the stated length-and-space rule and can be saved or returned unchanged by `shortOf`. D645’s full row and the accepted design say up to three **letters**, without spaces. Names containing only punctuation also have no defined letter-based fallback.  
   **Cause:** Validation, derivation and the approved wording do not describe the same allowed values.  
   **Exact fix:** Use one shared normalisation rule for typed, stored and derived short forms: uppercase letters, one to three after normalisation, no whitespace. Derive multiword initials and single-word prefixes explicitly; where a name supplies no letters, require an entered short form for a new save and define a harmless display fallback for an older event. Add tests for “A B”, punctuation, digits, lowercase input and uppercase conversion that changes length.

The following parts are sound on this read: keeping full names separate from display abbreviations; storing instance short forms beside their events; identifying both day and band reload readers; returning holiday names and abbreviations through the existing cross-app connection; and retaining the Event sheet’s current window behaviour under D642. The existing whole-period command snapshots and stored-row serialisation can carry the added properties without a separate storage system.

I also checked the header and its frozen copy, event selection and move interception, the OIL classification connection, and the existing sheet tests. The add-on’s test list should explicitly preserve drag-versus-tap behaviour, suppression of event opening during either move mode, and dismissal of the new box by outside press, Escape and scrolling. Those interactions are not proved by its listed ordinary tap tests.

**D138: PASS.** D642–D645’s short lines preserve their operative rulings against the full rows, including the later-change pointers on D643 and D644. Finding 5 concerns the plan’s wording, not a changed meaning in those short lines.

This is a plan review, not runtime verification. Nothing is built, so I could not verify actual geometry, touch behaviour or persistence after implementation.

I changed no files, ran no tests or builds, started no server, and opened no other reader’s report.

Rulings: none this session.
