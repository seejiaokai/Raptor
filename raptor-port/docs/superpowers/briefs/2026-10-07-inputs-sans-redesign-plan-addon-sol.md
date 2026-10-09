# Sol 6.1's challenge of the plan's add-on: the Event sheet, presets and short names - 7 Oct 26

The brief: `2026-10-07-inputs-sans-redesign-plan-addon-brief.md`. The section: §3.12 of `../plans/2026-10-07-inputs-sans-redesign-plan.md`. Run read-only through the Codex tool (model gpt-6.1-sol, high effort), alone. Its text is as returned. What was done with each finding: the plan's section 10.

---

**CHANGES REQUIRED**

1. **“Note (none)” can still make a day a public holiday.**  
   **Where:** §3.12, “Other…” and “Unchanged, and tested as unchanged.”  
   **Concrete failure:** Choose Other, enter “PH”, choose Note (none), and save on a weekday. The existing lookup treats an absent tag as permission to match the name against the library. “PH” therefore remains a public holiday: it is non-working and can qualify work for OIL. “Off day” similarly acquires its library kind despite “none.”  
   **Why:** An absent tag means automatic classification, not an explicit instruction to have no kind.  
   **Exact fix:** Preserve today’s classification rule by replacing “Note (none)” with “Automatic” and showing the effective kind returned by the existing lookup. Add tests for matching and non-matching names through this choice. If the plan intends a genuinely unclassified event, it must instead specify a distinct saved override and teach every kind reader to honour it; an absent tag cannot carry that meaning.

2. **Reopening can light a preset that contradicts the saved event’s kind.**  
   **Where:** §3.12, “Opening an event that exists.”  
   **Concrete failure:** An event named “PH” has its own Off day tag. The name-match-first instruction lights the public-holiday preset and hides Kind, although this event is an Off day and earns no OIL. The preset’s stated meaning contradicts the saved event. A subsequent Save must not turn it into a public holiday. The same conflict can arise when the library’s kind is edited after an explicitly tagged event was saved.  
   **Why:** Name matching happens before checking whether the preset’s kind agrees with the event’s effective kind. The section also leaves initialization liable to reuse the preset-picking action, which fills kind and short form.  
   **Exact fix:** A name match may light a preset only when its kind agrees with the event’s effective kind. Otherwise open Other with the actual kind shown. Opening must load the saved text, tag and resolved short form without invoking the action that picks a preset. Require a no-change Save to preserve those values. Add tests for a conflicting name/tag and a library kind changed after saving, for both individual events and bands.

3. **The short form is not carried through every writer that reconstructs an event.**  
   **Where:** §3.12, Records; “Save, Move and Delete: unchanged”; and the preset editor.  
   **Concrete failure:** Save “National Day” with the deliberately chosen short form “NAT”, then Move it. Today’s move reconstructs a band from its dates, text and kind, or writes a day’s text and kind into its destination. Without an explicit extension, “NAT” disappears and the grid derives “ND”. The restore after a refused band replacement also reconstructs the old band without its short form. Separately, today’s preset edit helper rebuilds an edited preset from its name and kind, so changing either can discard a newly saved short form.  
   **Why:** Naming the new fields in the load reader protects reloads, but does not protect these reconstructions.  
   **Exact fix:** Explicitly extend the day writer, repeat-range writer, band writer, move writer and failed-replacement restoration to carry text, tag and short form together. Clearing or covering a day must clear its short form too. Preset edits must retain the short form when only name or kind changes. Validate a replacement before removing the original, and make a successful replacement one Undo step. Add move, repeat, replacement, refusal-restoration and preset-name/kind-edit tests using a custom short form that differs from the derived one.

4. **“Characters” allows values outside the approved letters-only rule.**  
   **Where:** §3.12, short-form validation and `shortOf`.  
   **Concrete failure:** “1/2” and “---” satisfy “1 to 3 characters, no space” and can also pass the “short text itself” derivation. They are not the one-to-three-letter form approved in D645. Validating length before conversion to capitals can also accept “ßß” and then produce four characters, “SSSS”.  
   **Why:** The plan substitutes characters for letters and does not define validation after capitalization or a fallback for names containing no letters.  
   **Exact fix:** Define one shared normalization and validation rule: convert to capitals first, then accept only one to three permitted letters. Apply it to event, band and preset writes and reads, including derived results. Specify a valid fallback for an old name with no usable letters, without altering its saved name or kind. Add tests for “A B”, “1/2”, punctuation-only names, lowercase input and capitalization that expands.

5. **Two explicit interaction promises have no corresponding tests in the list.**  
   **Where:** §3.12, Name/On grid, the tap box, and Tests.  
   **Concrete failure sequences left unprotected:**  
   - Enter “National Day”, replace its suggestion with “NAT”, then change Name to “Founders Day”. The promised result is still “NAT”; an implementation that replaces it with “FD” can pass the listed tests.  
   - Open a filled cell’s box, then dismiss it by outside press, Escape or scrolling. The list tests opening and Edit, but does not require these dismissal routes or prove that the next tap and drag still reach the grid correctly.  
   **Why:** Testing the resolved short form does not test when the editor stops suggesting it; testing box opening does not test dismissal and gesture ownership.  
   **Exact fix:** Add the manual-override sequence, including returning from Edit presets. Add separate outside-press, Escape and scroll dismissal tests. At phone and desktop widths, retain assertions that a drag opens the range editor without a second box, and that a move-mode landing cannot open an inspection box or another editor.

I checked the requested rulings, design-note passage, supporting plan sections, live event sheet, grid rendering, event definitions, period records, store writers, saved-row mapping, sync readers and the existing tests named by the brief.

The separation of full name, short form and kind is sound. Matching preset short forms by the same name fold as classification is sound. The existing saved-row mapping and merged Leave War view retain the whole period, so they do not inherently strip the proposed fields. The holiday and OIL readers currently use the tag/library classification rather than display abbreviations; that separation should remain.

Nothing is built, so I could not verify the proposed geometry, tap layering, touch behaviour or runtime results. This is a plan challenge, not build approval. The D138 read was not performed.

I changed nothing, ran no tests, build or server, and read no other reader’s report.

Rulings: none this session.
