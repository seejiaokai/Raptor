**Astra’s report: changes required — two HIGH findings and one MEDIUM finding.**

Reviewed the input-card change on `claude/day-window-compact`, from `a6d902c5` through `b8e3df2b`. The working tree remained clean. I changed no files and read neither reader’s report.

I compared the removed editor with the replacement window, traced the relevant save paths, and reproduced the three failures below using the production React handlers with isolated, in-memory storage. These were focused checks, not a fresh browser walk or a full gate run.

**1. HIGH — moving a medical entry between years can silently cut another medical entry**

**Setup and action:** With 2027 loaded, create Ranger’s ATT C for 10–12 January 2027. Load 2026 and create his ATT B for 15–19 January 2026. Open the ATT C window, select 16–17 January 2026, and Save.

**Actual:** No medical-clash question appears. The ATT C moves to 16–17 January 2026, and the ATT B is silently split into 15 January and 18–19 January.

**Expected:** Before changing either entry, the clash sheet must show the overlap on 16–17 January **2026** and obtain the filer’s choices. Cancel must leave both entries untouched.

**Cause:** In [inputedit.tsx](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2226), `InputEditor.save` formats the draft dates against the **currently loaded year**, then parses those labels against the **original record’s year**. In this example, `Jan 16` is checked as 2027. `commitInputEdit` subsequently computes the actual medical trim against 2026.

The same mismatch exists in the window’s upchit summary at line 2217 and in `medAskFor` at lines 1210–1213. An upchit’s displayed effects can therefore concern a different year from its actual save.

**Exact fix:**

1. Retain the result of `normalizeInputDraft` when preparing the medical question.
2. Interpret its normalized date labels using `baseYear()`, matching `commitInputEdit`; alternatively, derive the ordinals directly from the draft’s ISO dates.
3. Apply this consistently to both the downchit clash and upchit effects, in `InputEditor.save` and `medAskFor`.
4. Have the window reuse the corrected shared medical-question helper rather than maintain another calculation.
5. Add regression cases covering the sequence above, Cancel, each clash choice, and a moved upchit. Assert that the dates and affected records shown before Save exactly match those changed after Save.

**Evidence:** The mounted production window reported “Input updated”; the resulting records were ATT B on 15 January, ATT C on 16–17 January, and ATT B on 18–19 January, all in 2026.

This is an existing shared-save defect reached through the replacement date door. It affects newly created records; it is not a stored-demo-data issue.

**2. HIGH — a member can move approved leave by a year while retaining its approval provenance**

**Setup and action:** A member has Leave War-approved LL for 15–17 January 2027. With 2026 loaded, he opens that leave on Inputs and changes it to 15–17 January 2026.

**Actual:** The dates change, but the record retains its `lw` approval provenance. The Leave War reader consequently returns `lw: true` for the new 2026 dates.

**Expected:** A member’s change to the leave’s dates must clear that provenance. The newly chosen dates must be identified as filed through Inputs, as the existing rule requires.

**Cause:** The `leaveSame` comparison in [commitInputEdit](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1051) constructs the proposed leave using `yr: r.yr`. Its date labels were just normalized against `baseYear()`. When the month and day remain identical and only the year changes, the comparison incorrectly says this is the same leave. The save then changes `r.yr` to the loaded year while keeping `lw`.

**Exact fix:**

1. Construct the proposed leave passed to `leaveKey` with `yr: baseYear()`, matching the record the save will actually write.
2. Keep the existing distinction: a member’s substantive leave change clears `lw`; an admin edit or a genuinely remarks-only edit retains it.
3. Add a regression using the production approval-row builder: approve next-year leave, load the current year, move it through the window as its member, and assert that `lw` is removed.
4. Assert the downstream absence contribution also loses `lw`, and that Undo restores the original dates and approval provenance.
5. Include controls for an unchanged save and a remarks-only edit of a foreign-year record.

**Evidence:** I created the fixture with the production `inputRowFor` builder and saved through the mounted window as the member. The year changed from 2027 to 2026, `lw` remained, and `contribsOfInput` returned approved contributions on all three new dates.

This also exists in the shared writer rather than the new calendar markup. It remains a forward-going failure of the replacement editor.

**3. MEDIUM — answering OIL through the window can falsely mark an unchanged input LATE**

**Setup and action:** File an ordinary one-person Duty before its cutoff. After the cutoff, open it and use **Answer…**, or revise an existing answer with **Change…**, without altering the input.

**Actual:** Saving the OIL answer also replaces the input’s modification date with today. The previously on-time input becomes LATE.

**Expected:** Answering OIL alone must retain the input’s lateness date, as the desktop OIL chip and the shared-input OIL-only save already do.

**Cause:** The single-record branch of [InputEditor.doSave](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2112) always calls `commitInputEdit`, which unconditionally writes `r.mod = nowStamp()`. By contrast, `InputsPage.reviseOil` changes only the answer and audit stamp; `commitGroup` also has an OIL-only branch that preserves `mod`.

Removing the phone’s OIL chips makes the window the normal phone route into this inconsistent behavior.

**Exact fix:**

1. Before committing an existing single input with an OIL answer, compare the effective normalized draft against the live input.
2. When no input field changed, save only `oil` and `stampChanged` in one command; preserve `mod`.
3. Retain the current permission, protected-date and refusal checks on that branch.
4. When actual input fields changed, retain the existing combined input-and-answer save.
5. Test both Answer and Change after cutoff, with an initially on-time input. Assert that OIL-only saves preserve `mod` and lateness, genuine input edits still update them, and Cancel and Undo behave correctly.

**Evidence:** With a controlled clock, the production creation path filed an input with `mod: 2026-01-01` and `late: false`. Answering through the window on 10 October produced `mod: 2026-10-10`, `late: true`, and the expected half-day OIL answer.

**Coverage and explicit negatives**

The following are code-reading conclusions, except for the focused reproductions described above.

| Area | Visible sign and working action checked | Result |
|---|---|---|
| Inputs day, desktop and phone | Shared card; open by click or Enter/Space; separate LATE button; Delete question | Both surfaces use the same card and facts. Button clicks do not also open the editor. |
| Phone list | Day headings, whole shared entry, tap-to-open, LATE, saved-input flash | Uses the shared card. A shared entry counts once and retains every name. |
| Desktop list | Row click, keyboard Name button, document and OIL chips | Opening is wired for ordinary and shared rows. Chip clicks are excluded from the row-opening handler. |
| Replacement form | Person, type, dates, span, times, title, documents, remarks, Save and Delete | The removed editor’s principal fields remain reachable. |
| Medical records | Family restriction, document management, clash and upchit sheets | Downchits stay in their family; an upchit stays an upchit. Medical-date correctness has finding 1. |
| Roles | Admin, own input, filer for another person, shared participant and unrelated reader | Save/Delete rendering and writers retain the permission checks. An unrelated reader retains document access without editable controls. |
| Shared OIL | Partial answers across days and people; whole-entry answer; participant’s own revision | The unanswered notice examines every record. Whole-entry answers use the group writer; own revisions use the member’s record. |
| Other renderers | SANS day, Medical cards, month bars/tooltips, board and week dialogs | They do not accidentally adopt the new card. Board/week edit dialogs do not gain the saved-input calendar. |
| Downstream writes | Ordinary/group saves, medical trims, absence reader, request projection and undo boundary | The replacement controls retain these routes. Findings 1–3 identify concrete failures within them. |
| Removed controls | Deleted selectors, helpers, help text and adapted tests/probes | No remaining production caller was found that requires the removed pencil editor. `placedShort` remains legitimately used by SANS. |

Additional checks:

- **People:** The window supplies archived people to the admin’s saved-input picker and preserves the current person when absent from its normal choices. Placeholder values are retained rather than silently displayed as another person.
- **Refusal order:** Placeholder restrictions run before document and medical/OIL questions. A shared input cannot evade medical questions by reducing its selected people and retyping to medical in the same save.
- **Documents:** An already-medical record does not get the missing-document prompt again. Removing its last existing document is still refused. The new viewer button sits outside the disabled form.
- **Date picking:** The first tap starts a new selection; Save during a partial pick uses one day. `midPick`, `datesPicked` and calendar reseeding cover the saved-day tap and switching between records.
- **Concurrent changes:** Untouched fields follow the live record. Conflicting fields require a choice, including after a confirmation sheet. Opening another input with unsaved work retains the discard-or-keep question.
- **Refused saves:** The outer command’s outcome controls success. A rollback rebinds the window to the live record while retaining the draft.
- **Card facts:** Names are sorted without deduplicating identical callsigns. The kind remains distinct from an optional title. Medical lateness exemption remains. Shared LATE notes identify affected people when necessary.
- **Phone grouping:** Normal entries are grouped in date order; pins are a separate leading section and map to the shared representative once. Filter changes release pins. The responsive boundary is consistently 820px.
- **Reveal:** The list remains mounted beneath the calendar. Its matching `data-iid` can be found first, but the calendar has its own scoped bar lookup and reveal handling. This read did not establish a new visible scrolling failure.
- **Existing filed issues:** I did not count the already-recorded next-year list filtering problem, desktop chip keyboard access, shared OIL-summary wording, or the owner’s pending visual choices as new findings.

**Limits of this read**

I did not rerun browser geometry, touch interaction, screen-reader behavior, the full unit suite or publication gates. Those remain the host check’s evidence, not checks personally passed here.

The medical-clash failure was exercised through the window. The related upchit mismatch was established by reading its date calculation. The leave-approval reproduction used the production approval-row builder rather than driving the entire Leave War approval screen.

Rulings: none this session.


