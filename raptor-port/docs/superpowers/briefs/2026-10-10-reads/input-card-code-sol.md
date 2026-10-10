**Sol’s report: changes required.** I found **one HIGH, three MEDIUM and one LOW finding**.

This was an independent, read-only code review of the requested change on `claude/day-window-compact`, at `b8e3df2bdb6296819bd909a63c1802620efe25d7`, against `a6d902c5`. I did not read either reader’s closed reports, run commands that write, or change any file. The findings below follow from the code; I did not reproduce them in the running app.

**Coverage and doors**

I started with the specialised medical and member-only paths, then checked the shared writer, the ordinary editor and both list renderers.

| Object or surface | Visible sign and working gesture required | Review result |
|---|---|---|
| Saved downchit or upchit | Dates in its Inputs window; medical questions describe those selected dates | Finding 1 |
| Leave approved in Leave War | Member’s changed dates become a filing from Inputs; remarks alone preserve approval | Finding 2 |
| Member inside another person’s shared filing | Own OIL answer and “Take me out” remain usable outside the locked form | Finding 3 |
| Ordinary weekend commitment | Desktop chip or window’s Answer/Change; answering alone preserves the late date | Finding 4 |
| Phone list | One heading and count per displayed day; saved hidden entries remain visible | Finding 5 |
| Shared filing, filer or admin | Open any constituent record; change or delete the entry together; answer for everyone | No additional finding |
| Desktop list | Row click and keyboard Name open the window; paperclip and ordinary OIL chips act separately | Correct, with the already-filed keyboard limitation |
| Opened calendar day | Same card facts; Enter/Space opens; LATE explains; Delete asks first | No additional finding |
| Document, including another member’s medical document | Paperclip remains usable by a read-only reader | Correct |
| SANS day, Medical cards, month bars, board and week | Keep their existing renderers; board/week editors gain no date calendar | No additional finding |

The downstream paths traced were the input command and permission checks, Undo, absence indexing and Leave War approval provenance, medical trims and splits, OIL answers, accepted request rows, published filing comparisons and sign-offs.

**1. HIGH — Medical questions can check a different year from the save**

**Setup and action:** Create an ATT C entry in 2026 and a separate ATT B entry for the same person in 2027. Load a 2027 week, open the 2026 ATT C on Inputs, and use its new calendar to move it onto the ATT B’s 2027 dates. Press Save.

**Actual:** The window looks for medical clashes in 2026. It can show no clash question, then save the ATT C in 2027 and automatically trim or delete the ATT B there.

**Expected:** Before either record changes, the question must show the ATT B occupying the selected 2027 dates and let the filer decide which status holds them.

**Cause:** In [inputedit.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2226), `InputEditor.save` resolves `fmt(draft.start)` using the old record’s `r.yr`. `fmt` omits the year when it matches the loaded year. The actual `commitInputEdit` resolves the newly formatted dates against `baseYear()` and writes that anchor.

The same mismatch exists in the upchit summary at line 2217 and in `medAskFor` at lines 1210–1213. An upchit can therefore describe different effects from those its save performs. If an erroneous old-year clash is found, `doMedSave` also constructs the saved dates from that wrong-year selection.

**Exact fix:**

1. Resolve medical question dates from the normalised draft using the same anchor as the writer: `dateOrd(n.date, baseYear())` and `dateOrd(n.endDate || n.date, baseYear())`.
2. Apply that rule to both the window’s medical questions and `medAskFor`. Prefer one shared question-building body so they cannot diverge.
3. Carry those absolute ordinals through the clash choices and segment save.
4. Add regressions for an old-anchor downchit moved into the loaded year, and an old-anchor upchit moved into that year. Assert the question’s affected records, cancellation without writes, the chosen saved dates, and one Undo.

A correct clash question on the target-year record would disprove the failure. The current question and writer use different anchors.

**2. MEDIUM — A year-only member move retains Leave War approval**

**Setup and action:** Approve a member’s leave for 20 October 2027 through Leave War. With a 2026 week loaded, the member opens that input and moves it to 20 October 2026.

**Actual:** The date moves, but `lw` remains. The changed leave still enters the absence index as war-approved.

**Expected:** A member changing the dates of approved leave must clear its Leave War provenance. A remarks-only edit should retain it; an admin’s edit should retain it as ruled.

**Cause:** [inputedit.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1051), `commitInputEdit`, compares the proposed leave using **the old `r.yr`**. Both labels are `Oct 20`, so `leaveSame` incorrectly returns true. The writer subsequently sets `r.yr = baseYear()`, moving it to 2026 without clearing `lw`.

This is producible with fresh approvals: `inputRowFor` creates the bare date label and its separate year. The absence reader propagates `row.lw` as approval.

**Exact fix:**

1. Compare the proposed normalised leave with `yr: baseYear()`, matching the year the writer will store.
2. Make the single-record `redated` comparison use resolved dates and anchors too, rather than labels alone.
3. Add a real approval-to-editor regression for this exact same-month/day move across years.
4. Assert: member move clears `lw`; remarks alone retain it; admin move retains it; Undo restores the original year and approval.

**3. MEDIUM — A member cannot answer an entirely unanswered shared input from its window**

**Setup and action:** File a shared weekend duty. Drag it to another weekend, then cancel the OIL question that follows the saved move. Sign in as a participating member who did not file it and open its card.

**Actual:** The locked form says “Not answered yet”, but offers no usable Answer button. The member’s own section offers Change only when `oilAnswered(mineRow)` is already true. With no answer, that section has no OIL control.

**Expected:** The member must be able to answer for himself from this window, just as he can revise his own answer. The bell remains another route, but should not be the only route from this state.

**Cause:** [inputedit.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2512) suppresses the general Answer button for read-only shared readers. The outside-the-locked-form section at line 2552 handles only answered `mineRow` records. The unanswered counterpart is missing.

**Exact fix:**

1. In the member’s own section, render an unanswered sign whenever `oilUnansweredDay(mineRow)` is non-empty.
2. When no own answer exists, provide an Answer button outside the inert form.
3. Open `oilGate(draftOf(mineRow), mineRow, true)` with `own: mineRow.iid`, using the existing `saveOwnOil` route.
4. For a partly answered own record, retain Change and show its unanswered date alongside it.
5. Test opening on any constituent record, cancellation, saving only the member’s answer, and preserving everyone else’s answers and late dates.

This route can create the unanswered state with new data; it is not a demo-data compatibility issue.

**4. MEDIUM — Answering OIL alone can falsely mark an ordinary input LATE**

**Setup and action:** File an ordinary weekend duty before its configured cutoff. After the cutoff, open it from the phone list, press Change beside OIL, and change only the answer.

**Actual:** Saving the OIL sheet calls `doSave`, which calls `commitInputEdit`. That rewrites `r.mod` to today. `isLateInput` reads that date, so an on-time input becomes LATE despite unchanged people, dates, hours and words.

**Expected:** An OIL-only answer should update its answer and change-history stamp, while preserving the input’s late date. The desktop OIL chip already does that.

**Cause:** [inputedit.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2112), `InputEditor.doSave`, always performs a full single-record edit before writing `oilDec`. [InputsPage.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:702), `reviseOil`, writes only OIL and calls `stampChanged`. Shared OIL-only saves likewise preserve `mod`.

Removing the phone chip makes the full-edit behaviour its replacement route.

**Exact fix:**

1. Before the ordinary saved-record branch, distinguish an OIL-only save from a save with actual draft changes, comparing normalised values with the current live record.
2. For OIL alone, recheck the applicable permission and protected-record guards, then write the answer and `stampChanged` in one batch. Preserve `mod` and the other input fields.
3. Keep `commitInputEdit` when actual input fields changed, so the question still prices and saves the draft.
4. Test an answer changed after cutoff through both desktop chip and phone window: same answer, unchanged `mod`, unchanged LATE status, one Undo. Also test OIL saved with a real hours edit.

**5. LOW — A pinned input splits one day into two headings and counts**

**Setup and action:** On the phone list, search for text matching one input on 20 October. Add another input on 20 October whose words do not match. Its successful save reveals and pins it.

**Actual:** The list shows one “20 October · 1 input” heading for the pin, followed by another “20 October · 1 input” heading for the matching entry.

**Expected:** One heading for that displayed day, with the combined count, while keeping the saved entry prominent.

**Cause:** [InputsPage.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:788), `dayGroups`, groups pinned and ordinary rows separately. It explicitly refuses to combine equal dates across the two parts. The new tests assert one heading per day, but the pin test uses a different day and misses this case.

**Exact fix:**

1. Group the deduplicated displayed rows by date once.
2. Mark groups containing pins and place those day groups first.
3. Within such a group, place pinned entries first, followed by its ordinary entries; keep the remaining days and entries in their existing order.
4. Calculate the heading count from the combined group.
5. Test a hidden pin sharing a visible day, multiple pins on that day, a pinned shared entry, and clearing pins through a filter change.

**Explicit negatives**

- The window preserves the old editor’s medical type-family guards, time and zero-length refusals, half-day derivation, title handling, remarks and document replacement guard.
- An already-medical input does not newly prompt for a document. New or retyped medical inputs do, and “No document” resumes the remaining questions.
- Placeholder refusals run before the document and medical sheets. ALL/ALL AVAIL ranges remain refused.
- A saved one-day input is passed to the calendar as a completed one-day range. Its first tap starts a new selection; Save during mid-pick saves one day. `calKey` resets for another input without resetting a month the user is currently browsing.
- The follower compares draft dates as full ISO values. Untouched fields follow changes behind the window; conflicting changes require a choice. Tapping the saved date is remembered as an intentional selection.
- Refused outer saves retain the window and typed draft, reacquire the live record by its ID, and avoid a success toast.
- Shared saves inspect all kept people for stale OIL answers. Filer/admin answers pass through the group writer and replace everyone’s answer as D682 requires. Desktop shared rows deliberately have no OIL chip; there is no single-person chip bypass for them.
- OIL questions price the current draft. Cancel writes neither the draft nor its answer. Saving the ordinary window’s OIL question also saves its draft; finding 4 concerns the case with **no actual draft changes**.
- The document-view button is outside the inert form and opens the saved input’s documents for a read-only member.
- Card facts preserve every person’s name, sort names consistently, keep kind separate from title, and apply the ruled “By” conditions. Later-added people do not replace a multi-person entry’s `grpBy`. Duplicate callsigns are not silently collapsed into one person.
- Range corners retain hours and add the ending year when it differs from the displayed day’s year. Downchits and upchits remain exempt from LATE; the board’s personal suppression does not suppress Inputs-page LATE.
- The phone/table boundary follows the live `820px` media query. Shared pins are reduced to their representative entry, preventing duplicate cards.
- Desktop Name is keyboard-operable. Its button, paperclip descendants and OIL spans are excluded from the row’s general click handler.
- The removed-selector search found no remaining active test/probe dependency on the pencil editor. Remaining matches include absence assertions, historical comments, unrelated editors and the still-used SANS `placedShort` reader. I found no user-facing Help/Logic instruction directing someone to the removed input pencil.
- The new door retains the established accepted, taken-off and Unavailable writer paths. Published filing comparisons and the dormant-request exceptions remain in the shared publication machinery.

**Limits and already-filed issues**

No tests or browser walks were rerun under this read-only brief. The builder should reproduce the findings and add the stated regressions before closing them. Physical phone behaviour, geometry and overlay ordering remain matters for a running-app check.

I did not count the already-filed desktop chip keyboard limitation, shared OIL summary wording, covered swap prompt, duplicate automatic “till” wording, document-viewer height or toast overlap as new findings. The existing next-year desktop list/filter problem is also already filed.

The unreadable-date phone fallback is not useful, but I did not establish a normal production filing route that creates such a record, so I have not reported it as a finding under D56. The owner’s parked visual choices remain parked.

Rulings: none this session.


