# Independent code-review report

**Result: three behaviour findings and one loss of test coverage.**

I reviewed the requested changes, including the host’s subsequent shared-row highlight fix. I changed no files, ran no application or tests, and opened nothing under a folder ending in `-reads`. The reproductions below are for the host to run.

## Findings

### 1. Medium — Hiding the repeated date can change the meaning of a typed remark

**Setup and action:** Create an input covering 13–17 July. Enter `-5°C cold-weather kit` before picking its dates, so the saved remark becomes `-5°C cold-weather kit till 17 Jul`. View its phone-list card or its card under 13 July.

**Expected:** The remark reads `-5°C cold-weather kit`, with the end date shown separately.

**Source-derived failure:** The card reads `5°C cold-weather kit`. The minus sign disappears. The saved record, desktop table and editor retain it.

**Where and cause:** [inputcard-model.ts:55](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputcard-model.ts:55), `remarkOnce`. After removing the date token, it strips whitespace, commas, dots and dashes from **both ends of the entire remaining remark**. That cleanup reaches punctuation unrelated to the removed token.

**Exact fix:**

1. Remove the matching date token using its position in the remark.
2. Limit separator cleanup to the token’s immediate join with the surrounding text; preserve punctuation attached to surviving text.
3. Remove the blanket leading/trailing punctuation replacement.
4. Add the negative-temperature case above, plus punctuation before and after a token, to the model tests. Check both card surfaces and confirm the stored remark remains unchanged.

This contradicts D728’s requirement that the person’s typed content stays.

### 2. Medium — A shared input can be highlighted without being brought into view

**Setup and action:** On a long desktop List, open “+ Input”. File a Meeting for Saber, Ace and Wisp, picking Wisp last. While the movable editor remains open, scroll the page behind it well down the list, then save.

**Expected:** The shared row is brought into view and highlighted.

**Source-derived failure:** The row is pinned at the top and highlighted, but the scroll lookup can find no element. The user can remain below the saved row.

**Where and cause:** [InputsPage.tsx:262](C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:262), the reveal and scrolling effects; [inputedit.tsx:2125](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2125), `saveNow`.

The group save reveals the first newly found stored record. Repeated insertion at the front can make that Wisp’s record. The displayed shared row uses the first person alphabetically—Ace. Both visibility and scrolling query Wisp’s `data-iid`, which the shared row does not carry. The host’s highlight fix correctly checks every member, but these two lookups still use the individual record.

**Exact fix:**

1. Resolve the revealed record to its displayed entry using the same grouping and alphabetical ordering as the List.
2. Use that entry’s representative ID for both `rowOnScreen` and `bringRowOnScreen`.
3. Scope the DOM lookup to the List being displayed.
4. Test both selection orders, on desktop and phone, with the page scrolled away. Also test an already-visible shared row: it must stay in place.

This is an existing reveal defect carried into the replacement door, rather than a defect introduced by the highlight fix. It affects newly filed inputs.

### 3. Medium — Eighteen existing protection-test cases were deleted without replacement

**What was removed:** The change to [placeholderlist.test.tsx:240](C:/Users/User/projects/Raptor/raptor-port/src/ui/placeholderlist.test.tsx:240) restates the three form tests, then removes two unrelated test groups:

- **Eight cases** covering hard-check registration, role/origin independence, six invalid restore combinations across ALL and ALL AVAIL, and a valid restore.
- **Ten cases** covering retained No answers, retained or invalidated Yes answers, reassignment, and a real ALL AVAIL save that changes the earned amount.

**Consequence:** The suite no longer exercises those specific restore and placeholder-answer protections. This is a demonstrated coverage loss; I am **not** asserting that the production protections currently fail.

**Cause:** The deletion extends beyond the obsolete add-form tests. These groups called the save boundary and answer rules directly, so removing the form did not make them obsolete.

I checked the apparent alternatives. `placeholderdoors.test.tsx` checks ordinary writes, not the removed restore-command cases. `voidedoil.test.ts` covers general answer rules, but does not replace the removed placeholder matrix and real-save case.

**Exact fix:**

1. Restore both deleted groups from the supplied pre-change baseline.
2. Keep the three form tests’ new window interactions.
3. If relocating the restored groups, move their setup and assertions intact and identify their new home.
4. Have the host run the restored cases, including both placeholders with wrong kind, multiple dates and group membership during restore.

### 4. Low — An open type-help panel takes Escape away from a medical question

**Setup and action:** Open a new ATT C input, select a date and leave it without a document. Open the “?” beside Type. Use **Tab and Enter**, without another mouse press, to activate Add. When the document question appears, press Escape.

**Expected:** The document question closes and the unfinished editor remains.

**Source-derived failure:** The first Escape closes the help panel underneath. The document question remains until another Escape.

**Where and cause:** [TypeLegend.tsx:45](C:/Users/User/projects/Raptor/raptor-port/src/ui/TypeLegend.tsx:45), its `esc` listener. It captures Escape on `window` and stops propagation unconditionally. Opening a question does not unmount the legend, and keyboard activation does not trigger its outside-mousedown listener. Consequently, neither the editor’s nor the question’s document-level listener receives the key.

**Exact fix:**

1. Give the legend an explicit active-layer condition from the editor.
2. Close or suspend it whenever a document, medical, upchit or OIL question opens.
3. Only consume Escape while its editor owns the active window and no higher question owns the keyboard.
4. Test the keyboard-only sequence above, the corresponding OIL sequence, and a second window opened by keyboard. Retain the existing test that Escape closes help alone while ordinary editing continues.

## Checks and explicit negatives

These are source-reading conclusions, not runtime passes.

| Brief area | What I checked and found |
|---|---|
| **1. Removed form and save parity** | Compared the old add path with `save`, `saveNow`, `medSaveNow`, `commitNewInput` and `commitGroup`. I found no additional missing writer for permissions, placeholders, medical-document questions, upchit effects, medical splits, OIL answers, titles, stamps, half days or years. SANS remains excluded from this door. Refused writes do not take the success/reveal path. The shared reveal exception is finding 2. Medical splits reveal their first saved segment, as the old form did. |
| **2. No-date seed** | Traced `newInputSeed`, `draftOf`, the calendar/readout, date-tail updates, Enter handlers, question resumes and draft swapping. I found no reachable write that substitutes Monday for an undated List input. The early refusal precedes questions; normalization also rejects a blank date. New records have no saved-record OIL-answer shortcut. The picker’s initial month is the existing July 2026 default. |
| **3. One save message** | Checked ordinary, shared, medical and OIL-only saves, refusal paths, nested batches and throws. I found no additional warning overwritten by the success message. Questions open before the eventual save batch. The underlying batch preserves order and strongest severity and drops collected messages on an escaping exception. Own-answer saves and pure deletions do not take the leave-replacement/cutting path that produces the extra warning, so I found no corresponding missing batch there. |
| **4. Remark suppression** | Checked both card callers, date/hour/half-day corners, year matching, day and month boundaries, capitals, multiple tokens and blank remarks. Finding 1 is the preservation failure. I found no missed caller of the shared input-card renderer. Different remarks split records into separate entries before rendering. Desktop remarks remain unsuppressed. |
| **5. Desktop names and filer** | Checked alphabetical names, group shrinkage, archived/deleted people, unknown identities, placeholders, differing record stamps, absent timestamps, the `alone` class, filtering, sorting and export. I found no additional functional regression. The shared filer remains determined by the existing common helper; sorting uses the entry’s first alphabetical name. CSV generation is unchanged. |
| **6. Month bars** | Checked shared counts, titles, narrow one-day bars, placeholders, tooltip names, keyboard/day access and drag ghosts. I found no missing text consumer. Ghosts clone the rendered bar and retain its timed class. Different record hours split entries. The stylesheet has a non-`color-mix` fallback and retains continuation styling. Appearance and contrast still require browser inspection. |
| **7. Help, layers and old selectors** | Finding 4 concerns Escape ordering. I found no remaining production dependency on the removed form IDs in the searched source, browser tests or probes; the surviving test references assert their absence. Read-only editors omit the inert “?” control. The Help page contains no obsolete filing instructions. The IT guide’s scripts still target the old form, but D403 explicitly leaves that guide unchanged until requested; this is a dependency for its next refresh, not a request to rebuild it now. |
| **8. Test strength** | Finding 3 identifies dropped coverage. In `inputs.test.tsx`, I found the old form’s behavioural claims generally restated through the new window, with the disclosed fresh-default differences accounted for. The new toast tests prove entry into a batch, not actual message joining or colour. The member-help test promises a new-input case but stops after opening help on an owned saved input. The phone-button test’s `expect(cs(admin)).toBeTruthy()` checks fixture data, not what the editor displays. |
| **9. Tidiness** | I found no additional duplicated production writer introduced by these changes. The seed and card facts are shared appropriately. Specific dead-test and misleading-description notes follow. |

The old form refused a locked week before opening questions; the window can reach a question before its commit-time refusal. The write and medical-cascade guards remain. I have not promoted the older-version quarantine timing difference into a new-data finding.

## Tidiness notes — file, do not fix during this review

- [inputs.test.tsx:599](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputs.test.tsx:599): the retired SANS-form helper bundle remains, with `void` expressions retaining unused helpers.
- [placeholderlist.test.tsx:12](C:/Users/User/projects/Raptor/raptor-port/src/ui/placeholderlist.test.tsx:12): its introduction still promises the deleted boundary and answer tests. Imports belonging to those groups remain. Restoring finding 3 should resolve this inconsistency.
- [inputsvet.test.tsx:350](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputsvet.test.tsx:350): either exercise the promised new-input help case or narrow the test title.
- [inputsvet.test.tsx:376](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputsvet.test.tsx:376): replace the fixture-only callsign assertion with an assertion about the displayed person, or remove it.

## What reading cannot establish

I did not verify rendered layouts, actual scroll positions, touch behaviour, browser-specific Escape handling, colours, screenshots or test results. The host should run the exact reproductions above.

Additional useful checks are an **821px-wide desktop List** with long remarks and many names, timed-bar dragging with and without `color-mix`, and a medical split whose later segment falls outside the current List filter. These are unverified checks, not further findings.

**Rulings: none this session.**

