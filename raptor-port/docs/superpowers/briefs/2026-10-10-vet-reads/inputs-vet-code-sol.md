# Inputs calendar and list — code review

**Three findings remain: two app failures and one broken capture workflow.** This report covers the live code at `612b2a73`, including the changes made during this read.

I changed no files, ran no tests or app commands, and opened no file inside a folder ending in `-reads`. The outcomes below are deductions from source; the host must run the named scenarios.

## Findings

### 1. P2 — A filtered shared input is revealed as one person, and Delete removes only that person

**Setup and action:** As an admin, keep the Calendar’s search filter on `ZZZ-no-match`. Open 20 October 2026 and file a Meeting for yourself and two other people, with the remark `range brief`. Save, then focus the revealed card and press Delete.

**Expected:** One shared card names all three people. Its question offers deletion for all three, and confirmation removes the whole entry in one Undo step.

**What the code does:** All three records are saved, but the revealed card contains only the one record passed to the reveal. It shows one name and asks “Delete this input?” Confirmation removes that record alone; the other two remain hidden by the filter.

**Where and why:** [InputsCal.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:745), `renderPop`, builds the fallback with `monthItems([saved], …)`. The card and deletion handlers correctly follow the resulting `it.rows`, but that array has already lost the other people.

This predates this batch. It still affects newly filed data, so D56 does not exclude it.

**Exact fix:**

1. Resolve the saved record’s full live entry with `entryRowsOf(INPUTS, saved)`.
2. Pass those rows to `monthItems` when inserting the revealed fallback.
3. Use the existing entry resolver, rather than grouping by `grp` alone: separately changed records must remain separate entries.
4. Add a test through the real Calendar controls with a filter excluding the new shared entry. Assert all names, the shared deletion question, removal of every record, and restoration by one Undo.
5. Have the host repeat it at desktop and phone widths, with different people-picking orders.

### 2. P2 — A remark beginning with the date can still lose a typed minus sign

**Setup and action:** File an input spanning 14–17 July 2026. After picking the dates, enter:

` till 17 Jul -5°C cold-weather kit`

Save and read its phone List card or its card under 14 July.

**Expected:** The corner says `till 17 Jul`; the remark says `-5°C cold-weather kit`.

**What the code does:** The remark becomes `5°C cold-weather kit`. The record, desktop row and editor retain the minus sign, so the card gives the words a different meaning.

**Where and why:** [inputcard-model.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputcard-model.ts:70), `remarkOnce`. The live fix preserves punctuation before the date token. When the date opens the remark, however, it still strips every leading character in `SEP` from the remaining text. `SEP` includes `-`.

**Exact fix:**

1. Replace the leading remainder’s broad `SEP+` removal with whitespace removal and removal of **standalone** joining punctuation.
2. Require joining punctuation to be followed by whitespace. For example, `^\s*(?:[,·—–-]\s+)*` removes ` — ` while preserving `-5°C`.
3. Add cases for `till 17 Jul -5°C cold-weather kit`, `till 17 Jul — -5°C cold-weather kit`, and the existing `till 17 Jul — Bangkok -` case.
4. Have the host verify both card surfaces and confirm that saving and desktop rendering leave the stored remark unchanged.

### 3. P3 — The guide’s Inputs and ripple captures still drive the removed form

**Setup and action:** Run the guide’s J7 Inputs capture or J17 ripple capture against this build.

**Expected:** The capture files the input through the current visible controls and records its downstream effects.

**What the code does:** Both jobs first try to click `#inCal [data-cal=…]`. That calendar no longer exists. Later steps also target the removed Type, Remarks, time, Add and document controls.

**Where and why:** [inputs.mjs](/C:/Users/User/projects/Raptor/raptor-port/scripts/itflow/j/inputs.mjs:19) and [ripple.mjs](/C:/Users/User/projects/Raptor/raptor-port/scripts/itflow/j/ripple.mjs:16). The production and browser-test callers were moved to the window; these capture callers were missed.

**Exact fix:**

1. Enter List where needed, press `#inNew`, and wait for the input window.
2. Pick dates through `#inpEdCal`; drive `#inpEditType`, the window’s duration and time controls, and `#inpEditRmk`.
3. Attach medical documents through the window’s document field and save with `#inpEditSave`.
4. Update capture markers, crops and completion waits to the window and resulting List card or row.
5. Restate both R1 filings, R2 and R3 through that route, preferably using one shared filing helper.
6. Have the host run J7 and those J17 paths when the guide capture is next requested. This finding does not call for rebuilding or publishing the guide without the owner’s instruction.

## Production doors and consumers checked

| Object or surface | Visible sign and working gesture checked in source |
|---|---|
| New one-person input | List’s single “+ Input” opens the window; date selection and Save reach the shared writer. |
| Shared input | One entry names everyone; its window edits the entry. Filer/admin deletion covers everyone; another participant takes himself out. The filtered reveal fails as finding 1 describes. |
| ALL / ALL AVAIL | Placeholder name remains visible; invalid kinds, multiple dates and grouping are refused; the filer answers OIL. |
| Medical and upchit | Document question, clash choices, kept segments and explicit upchit removals precede the write; cancellation leaves it unwritten. |
| Desktop and phone Lists | Desktop keeps columns and the pill; phone uses cards. Names, filer, dates, remarks, search, sorting, reveal and Undo were traced. |
| Month bars | Shared count and title, timed appearance, continuation pieces, overflow, tooltip, drag copy and keyboard text use the current bar model. |
| Editable/read-only windows and overlays | Help exists in editable Inputs windows; read-only forms remain inert. Questions, window ordering, outside presses and Escape were traced. |
| Downstream records | Schedule links, Leave War effects, OIL answers, stamps, history, Undo and CSV were checked through their callers. Capture callers have finding 3. |

## Explicit results for the eight requested areas

1. **Removed form versus window:** I compared the old add path with the window’s save and commit paths. I found no additional lost permission, locked-week, placeholder, picker, document, upchit, medical-segment, OIL, stamp, title, half-day or year check. SANS filing remains excluded. Shared Calendar reveal has finding 1.

2. **No-date seed:** I checked draft creation, early date readers, normalisation, title, calendar month, followers, swap questions, Enter and confirmation resumes. I found no path from the List’s blank seed to a write dated by `fmt('')`. The new refusal runs before questions; the write normaliser also rejects a missing start.

3. **One passing note:** I traced ordinary, shared, medical and OIL-only saves, refusals, sheet returns, close/stay and thrown batches. I found no additional warning overwritten by success. Messages join in order with the strongest colour; thrown batches discard their pending messages. Own-OIL and deletion paths remain outside this batch, without a newly lost Leave War sentence.

4. **Remark shown once:** I checked both card callers, corner forms, years, halves, token boundaries, capitals, repeated tokens, whitespace and medical/Leave War tails. Finding 2 remains. I found no additional card caller missed, and the desktop remark remains whole. Records with different shared remarks resolve as separate entries.

5. **Desktop row:** I checked all names, missing/archived/deleted people, placeholders, a group reduced to one, differing placement fields and unreadable placement times, plus `alone`, filters, search, Name sorting and CSV. I found no additional failure. The live shared-row lighting and representative-row reveal changes address the List’s record-versus-entry mismatch.

6. **Month:** I checked narrow and titled shared bars, counts, overflow, tooltips, drag copies, accessibility text, halves and separately changed records. I found no additional failure. The drag copy retains `timed`; continuation, hover and picking styles do not replace its timing distinction. A fallback fill and solid edge exist without `color-mix`.

7. **Help and stale callers:** The live changes close help when a document, OIL, upchit or medical question opens, and restrict its Escape listener to the front window. The earlier confirmation-sheet conflict is therefore addressed in source. I found no duplicate production help IDs or additional stale active form caller in the searched source, browser tests, probes or Help text. The guide captures have finding 3. Real focus ordering still needs the host’s keyboard walk.

8. **Tests proving less than their titles:** I compared the removed-form tests with their replacements. I found no further dropped claim requiring the old form to return. Fresh-window defaults and hidden all-day time fields are acknowledged differences. The live additions now exercise help on a new input and inspect the selected phone person rather than merely checking a fixture name. The toast tests’ mocked batching proves placement inside the batch; actual joining has separate toast-module coverage. Findings 1 and 2 still need their specific regression cases.

## 9. Tidiness — changed lines only, filed here

- **Said twice:** The opened-day card calculates `cardWhen(r, it.b, iso)` twice on [InputsCal.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:940). Calculate it once and pass that value to both the facts and the corner.
- **Misleading name:** I found no additional changed name misleading enough to file.
- **Dead code or style:** The retargeted `setPerson` and `originalPerson` helpers in [inputs.test.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputs.test.tsx:596) remain unused except for the `void` suppression alongside other retired SANS helpers. Remove those unused helpers and suppressions. I found no additional dead production style introduced by this change.

## What reading cannot establish

**Walk: Not performed — this assignment permits source reading only.**

I cannot establish actual focus order, rendered fit, hit targets, scrolling, colour appearance, physical iPhone behaviour, capture completion or passing test results. The host should run the exact scenarios under the findings, plus keyboard-opened help followed by each confirmation sheet and Escape.

The branch changed during the read. I inspected the subsequent source and test updates and checked the final revision; corrected earlier cases are not listed as outstanding failures. This report does not approve the build or complete its full check.

**Rulings: None.**

