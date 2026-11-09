# The Inputs trial — what was done with each reader's finding (9 Nov 26, chat 41)

The page read: `.claude/rules/decisions/inputs.md` at `34176a2ec`. The reports: `2026-11-09-inputs-trial-read-opus.md`
and `…-read-astra.md`. Each finding was checked against the ruling's full row (`.claude/decisions-full/`) and, for a test
claim, the test's own assertions, by a fresh Opus helper that wrote neither the page nor either report. No test and no
app code was changed. The sorting table's rows for every ruling touched carry a "read 9 Nov 26" note.

Result: 19 findings and notes (Opus 12: nine on meaning, two test notes, the lost pointer; Astra 7) — 19 held, 0 not
held; Opus 6 and Astra 2 are the same finding, as are Opus 10b and Astra 5 in part. Six rulings came off
the "Built, held by tests" line (D649, D651, D707, D968, D1179, D1622), leaving 11; D569 and D621 left the archive
proposal as standing rules.

| Reader | # | Ruling(s) | Held? | What was done | Why |
|---|---|---|---|---|---|
| Opus | 1 | D1388, D1398 | held | The lock written as a line of its own: any kind a scheduler can move (an Other, a commitment, an Event, a Personal, an Attach, a course, an overseas duty; never leave, medical, an upchit or SANS availability); what stays the member's listed. The filing line now cites D1388, D1398 (the gate asks it: they narrow D655). | D1398's bold rule widens D1388 to every kind he can move; the page said "Other" only — a permissions rule narrowed. |
| Opus | 2 | D712, D778, D713, D711 | held | Rewritten: Training, Meeting, Appointment, Duty, Event, Other and Personal, one day at a time; never leave, medical, an Attach, an overseas duty or a course [D712, D778, D713, D711, D1373]. | D713 makes Event one of the kinds; D711 (2) and (3) — no overseas duty or course, one day at a time — apply to every kind, not Personal alone. D753 left uncited: D711 (3) already says one day, and D753 would pull in D755. |
| Opus | 3 | D569 | held | Stated as standing in the SANS section ("a commitment's remarks box shows no faded placeholder words"), with the calendar's other parts and their rulings; the "Done once" line removed; struck from the archive proposal. | His words "no faded words on remarks"; none of D570, D572, D617, D618 restates it; no test names D569. |
| Opus | 4 | D687, D705 | held | One line: on a phone and a desktop the Calendar / List switch stands in the same place on both views, never moving under the finger; on a phone the arrows, name and Today at the left, the switch at the right end. | D687's rule has no phone condition; D705 changed only the phone's order (its reading 3: the desktop is not changed). |
| Opus | 5 | D1386, D1396 | held | ⤢ given its own line: on a phone and a desktop, every input of each day, no "+n more", weeks as tall as their inputs, the page scrolling, remembered per person. The phone line keeps D1386, D1396 (the gate asks it: D1386 narrows D653, D664) with "except while expanded". | D1396's rule has no phone condition; D1386's rule replaces "+n more". |
| Opus | 6 | D621, D626 | held | "The rest of the first mock-ups' drawings stand as drawn" back on the three-tabs line; a new line: of the four ideas all stand — bars, the drag, the fold stating the cut-off as set, the keyboard set (arrows, Enter, Delete, Escape) as drawn; the "Done once" line removed; D621 struck from the archive proposal. | D621's NARROWED mark: "the instructions fold stays … the keyboard set stands as drawn"; D626's rule: "the rest of the drawings stand as drawn". |
| Opus | 7 | D1841 | held | "At any width the open window stands over '+ Input', as it stands over '+ Medical'" — split from the below-1340 clause. | D1841's two clauses are separate; the second has no width condition. |
| Opus | 8 | the head, `paths:` | held | `raptor-port/src/ui/Med*.tsx` and `raptor-port/src/ui/med*.test.ts*` added to `paths:` (MedicalView, MedMoveConfirm, MedClashConfirm; medicalview, medmove, medclash, medwrite tests). | The page states the Medical tab's rulings (D959–D977, D1137, D1300), so a chat on those files should load it. |
| Opus | 9 | D1943 | held | "The documents check eased for this page only" put back on the trial line. | Part of D1943's bold rule, a standing scope limit. The "read blind, merged on his merge live" part is this change's own process, done once it merges — left to the full row. |
| Opus | 10a | D968 | held | Off the held line; the ruling was already stated whole on the page (the window's line and the Medical tab's line). | The line means "named by a test that holds it whole"; no test naming D968 asserts "+ Input stays on OL" — only D917's cases do. |
| Opus | 10b | D649 | held | Off the held line (with Astra 5). | `sansday.test.tsx` checks the chip only `if` the man has a CAT, and one puck's size class. |
| Opus | 11 | the lost pointer | held | One line under "What it keeps": `ui-contracts.md` (§The Inputs month calendar, §Days — the month, §The SANS calendar), `feature-impact.md`, `data-schema.md`, `file-map.md`. | The old file's "Where the detail lives" paragraph had no home on the page. |
| Astra | 1 | D1179 | held | Off the held line; stated in the Inputs list section: the type filter picks a whole family — every kind of leave, every kind of medical. | `inputs-docs.test.tsx` supplies LL, OL, ATT C and a Meeting only; a filter that dropped CCL, HL or OML would pass. |
| Astra | 2 | D621 | held | As Opus 6. | Same lost "stands as drawn". |
| Astra | 3 | D646 | held | The two cut-off lines rewritten: the cut-off line in "How this works" states it as set, in bold, changing with the setting — no worked example, no "later than that is marked late"; "nothing more" no longer covers the whole fold. | D646's rule: "the cut-off line only states the rule as it is set" — the line, not the fold. |
| Astra | 4 | D961, D965 | held | The Medical line: "Upchit Complete shows its date and documents only, no kind, no 'upchitted'" in place of "the period a range (Upchit Complete its one day)". | D965's rule ("Upchit Complete is the date and … document icon[s]") and D961's answered mark ("'upchitted' and the kind gone"); the tests already assert it. |
| Astra | 5 | D649, D651 | held | Both off the held line; the SANS day line now states: the schedule's own puck, never a name and a badge, the CAT chip attached, every puck one size; a SANS man's purple edge on its right exactly as on the schedule, chip and edge inside the puck's thin frame, nothing spilling out. | The tests check class names (`sm`, `san`) on one puck; nothing measures equal size or the edge and chip inside the frame — the very fault of his same-night correction in D651's row. |
| Astra | 6 | D1622 | held | Off the held line; stated beside the window's question line: ✕ with anything unsaved asks the very question Escape asks, "Close it and lose them?"; Cancel still closes at once. | The tests check the question element (the same one Escape opens) and its buttons, never its words. Low: the same element makes a different question unlikely, but the strict test says unsure → stays. |
| Astra | 7 | D707 | held | Off the held line; already stated on the SANS day line ("opens tall, its top bar bringing it down to two-thirds and back"). | The browser test accepts any lowered height under 72%; a half-height window passes. |

## Unsure, for the host
- D1386 and D961 stay on the "answered directions" archive proposal, each with a note: the part the reads found dropped
  ("in place of '+n more'"; "no 'upchitted'") is not in the answering ruling's own bold words — the D971 reader should
  weigh it before either leaves.
- The new ALL / ALL AVAIL line says "never for leave, medical" — implied by D712's "only for …", not his words.
