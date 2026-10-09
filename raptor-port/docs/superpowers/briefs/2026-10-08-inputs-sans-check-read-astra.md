**CHANGES REQUIRED — Astra’s independent read**

Read-only review of `claude/inputs-sans-calendar` against the brief’s base. The branch advanced to `74036924` during the read; those later changes contain check records and browser-test corrections, with no application-code changes.

I changed nothing, ran no tests, started no server, and read neither reviewer’s report. The failures below are traced through the source; the host cases specify how to confirm or disprove them.

**A. Wrong lines**

**F1 — High: reducing a shared input to one person bypasses the medical questions and drops newly attached documents.**

Create a shared, all-day Meeting for Ace and Ranger on 12 October 2026. Ace also has ATT B covering 12–14 October. Open the shared Meeting, change it to ATT C, press “Keep Ace only”, attach a document, and save.

The editor still considers this a group operation because the saved entry has two rows. Its group branch returns before the document, upchit and medical-clash questions. The group writer now sees only one intended recipient, so its prohibition on group medical entries does not stop the save. It replaces the draft’s attachments with the survivor’s old attachment list.

Consequently, the new document is not linked to the medical entry, and the existing ATT B can be trimmed without the required clash question. The equivalent Upchit conversion bypasses its summary.

Cause: [inputedit.tsx:1833](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1833), the early return at [2059](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2059), and the attachment substitution at [1562](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1562). The skipped questions begin at 2075, 2087 and 2101. This conflicts with the existing medical rules stated there: missing-document choice, explicit upchit summary, and no silent resolution of different-type medical clashes.

Fix:

1. Separate “this save changes an existing group” from “the resulting input has several recipients”.
2. For a single surviving medical recipient, run the ordinary document and medical-question sequence before writing.
3. Pass that recipient’s draft attachments and confirmed medical choices into the writer.
4. Keep removal of the other participants and all medical effects in one command; cancellation or refusal must leave everything unchanged.

**F2 — High: the first person’s OIL answer can suppress a question another person needs.**

File a two-hour Saturday Duty for Ace and Ranger, answering Yes for both: 0.5 each. Ace, the first person in the entry, changes his own answer to No. The filer then changes the shared duty to All day.

The group save calls `oilGate` only for the first retained person. Ace’s explicit No remains valid, so no question opens. The writer changes both records; Ranger’s old 0.5 answer is voided because the new hours price 1. Ranger is left unanswered and dependent on his own bell.

Cause: [inputedit.tsx:2063](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2063); the first person’s answer passes the test at [688](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:688), while each record is subsequently voided independently at 1091.

D660 expressly requires the question to return to the filer for everyone when changed hours invalidate an answer.

Fix:

1. Assess the proposed save against **each retained person’s own answer**, plus every added person.
2. Open one shared question if any affected person needs an answer.
3. Apply its answer to the records covered by that operation in the same command.
4. Preserve the existing rule that adding people alone does not overwrite the standing people’s answers.
5. Test both orderings of mixed No/Yes answers.

**F3 — Medium: a saved group has no way to change its date range as one input.**

Create a shared Meeting covering 12–14 October. Try to extend it through 15 October.

The shared List row opens the window instead of the in-place editor. That window draws a date picker only for a new calendar input or an Unavailable add. An existing input always has an empty context. Dragging the bar moves its whole span and preserves its length; it cannot extend or shorten it.

Cause: [InputsPage.tsx:1240](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:1240) and [inputedit.tsx:2245](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2245).

D655’s stated reading includes changing a shared input’s dates for everyone. The List’s replacement door lost that capability.

Fix:

1. Show the existing range picker when an authorised person edits a saved shared entry.
2. Save the changed range through the group writer, including its medical/OIL checks.
3. Keep one command, preserve placement stamps, and update change stamps only on changed records.
4. Correct the hint directing people back to the Inputs page: they are already there, with no usable date-editing door.

**F4 — Medium: Undo changes tabs even when the changed day is already visible.**

On the Inputs calendar, open Calendar and set a visible weekday to NF. Close the window and press Undo while that date remains visible.

Undo unconditionally selects the SANS tab. For a repeating rule, it also selects the rule’s starting month, even when the currently displayed month already shows affected dates.

Cause: [undo-wire.ts:215](/C:/Users/User/projects/Raptor/raptor-port/src/state/undo-wire.ts:215). The callback always changes mode and month; the surrounding page check does not prevent it.

This contradicts D672 and the comment immediately above the callback.

Fix:

1. Determine whether the current calendar or open Calendar window already displays the affected date or recurring-rule range.
2. If it does, preserve the tab, month and position.
3. Navigate only when the changed result is outside the current view.
4. Cover Undo and Redo for both a single date and a repeating rule.

**B. Missing surfaces and doors**

The missing date-editing door is F3. The save doors that skip required questions are F1 and F2.

Against the roll-call, I found no additional missing placement-stamp, late-tag, holiday-tag or requirement reader. The previously fixed Calendar holiday tag is now read from the shared answer.

The changes window’s “To go out” grouping remains the already-filed `CAL-TOGO-ONE-ITEM`; I am not reporting it again. See [the evidence sheet:45](/C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md:45).

**C. A rule enforced in only one place**

**F5 — Medium: the medical-group restriction is reachable around the group save.**

The brief correctly identifies that `mayFileGroup` rejects medical groups on screen and at the group save, but the command invariant does not.

There is an ordinary route around those checks:

1. File a shared all-day Meeting for two people on the same date.
2. From Edit Schedule, edit each person’s record separately into the same medical type, keeping identical dates, times and remarks and supplying each person’s document.
3. Each single-record save retains `grp` and `grpBy`.
4. `entriesOf` joins them again because their shared fields match; documents are not shared fields.
5. Back on Inputs, they form one medical entry. Its editor then refuses an ordinary shared save because medical entries cannot be filed for several people.

The relevant lines are [inputgroup.ts:45](/C:/Users/User/projects/Raptor/raptor-port/src/state/inputgroup.ts:45), its limited invariant at [97](/C:/Users/User/projects/Raptor/raptor-port/src/state/inputgroup.ts:97), and [perms.ts:588](/C:/Users/User/projects/Raptor/raptor-port/src/state/perms.ts:588). The normal single-record edit does not remove group membership.

This is new data produced through current doors, not a migration problem.

Fix:

1. Define the common-writer transition into medical as a separate, single-person entry.
2. Preserve that record’s placement history and its own documents.
3. Enforce the no-shared-medical-entry rule in the post-write invariant and restore checks, alongside the existing duplicate-person and single-filer checks.
4. If detachment clears group fields, narrowly permit that legitimate transition without opening a way to forge another group’s filer.
5. Test the two individual retypes and their Undo/Redo through real commands.

Apart from these group restrictions, I found no additional member permission escape in the named doors. The members’ switch, filer checks, forged placement checks and verified replay remain enforced behind the screen.

**D. Test coverage**

These are gaps in the cases and strictness lists reviewed, not test failures I ran.

| Brief area | What is covered | Missing case or assertion |
|---|---|---|
| 1. Permissions and group editing | Role matrix, filer rights, switch, forgery, group save and take-out | F1’s group-to-single medical transition and F5’s separate retypes that re-form a group |
| 2. Saved records | Flying-plan rows, settings, event short forms, counters, reloads | A newly attached document surviving F1’s save and reload |
| 3. Availability and caching | Relevant local changes move the version; ordinary count and definition changes | One combined case warming a date’s cache, receiving a changed **other period**, then checking all calendar/count readers without selecting that period |
| 4. Late rule | Days arithmetic, separate settings, year boundary, unreadable dates, deadline equality | One end-to-end year-boundary case checking both calendars’ displayed reason after changing and undoing each setting |
| 5. OIL | One initial question, per-person answers, additions, voiding and invalid amounts | F2: mixed standing answers followed by repricing through the actual editor |
| 6. Published records | Existing per-input comparison; group history lines and grouping | One group operation combining changed, removed and added people on a published day, asserting every pending item, all four sign-offs and the unchanged issued face |
| 7. Undo | Group atomicity, block atomicity, holiday undo, several visibility cases | F4’s class/rule Undo while the Inputs calendar already displays the result |
| 8. Check fixes | Targeted tests for the repaired window, tag, grouping and reveal paths | W12’s **12px desktop margins** have no direct geometry assertion; “no sideways scroll” would also pass with zero margins |

Relevant evidence: [groupeditor.test.tsx:271](/C:/Users/User/projects/Raptor/raptor-port/src/ui/groupeditor.test.tsx:271), [groupwrite.test.ts:140](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/groupwrite.test.ts:140), [dayfacts.test.ts:360](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/dayfacts.test.ts:360), [latecut.test.ts:1](/C:/Users/User/projects/Raptor/raptor-port/src/engine/latecut.test.ts:1), and [the updated evidence sheet:295](/C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md:295).

The strictness lists establish that their individual substitutions were caught. They do not establish these combined transitions.

**E. “AS BUILT” readings and the six documents**

I checked all the “AS BUILT” blocks, treating later rulings and later blocks as superseding earlier descriptions.

- **Four rows, cell typing, selection, counter deletion, Available-row editing and removal of saved Required names:** no new contradiction identified with D637, D640, D665, D668, D669 and D674.
- **Calendar month, repeating weekdays, holidays and missing-period continuation:** no new contradiction in the recorded choices. D671 supersedes the earlier two-date-box/default-date description.
- **SANS calendar and Inputs calendar:** the implementation failures are F3 and F4. Previously disclosed visual differences remain owner-look matters; “told to him” is not approval.
- **Window shell and placement stamps:** no new contradiction identified in the stated choices. The check’s window fixes address the earlier failures.
- **Event presets and short names:** no new contradiction identified. Following an untouched preset rather than copying its values is explicitly recorded.
- **Group writer and group screens:** F1, F2 and F5 mean the implementation does not fulfil the stated medical and OIL guarantees. The single List button is a recorded builder choice, but it must retain the date-editing capability it replaced.

The six corrected documents:

| Document | Result |
|---|---|
| `data-model.md` | §11’s Input, Setting and LeaveWar permissions agree with the corresponding permissions code. Its warning that medical groups lack a commit-gate check is accurate; F5 shows why that gap is reachable. |
| `data-schema.md` | The current group fields, SANS comparison, flying-plan prefixes and settings descriptions agree with the code. |
| `engine-rules.md` | The resolver, two cut-offs and common OIL-voiding descriptions agree. F2 is a caller failure, not a different voiding calculation. |
| `ui-contracts.md` | Needs the short-screen exception added: after the landscape fix, the opened-day header and list scroll together below 480px height; the text still says the header is pinned without qualification. The group guarantees also remain unmet by F1–F3. |
| `feature-impact.md` | The added writers, readers and stamp/window boundaries agree. The already-filed “To go out” exception still applies. |
| `file-map.md` | The added source/test pointers and descriptions agree with the files read. |

References: [data-model.md:1427](/C:/Users/User/projects/Raptor/raptor-port/docs/data-model.md:1427), [data-schema.md:822](/C:/Users/User/projects/Raptor/raptor-port/docs/data-schema.md:822), [ui-contracts.md:9354](/C:/Users/User/projects/Raptor/raptor-port/docs/ui-contracts.md:9354).

**F. Exclusions**

I am not treating stored demo shapes, missing migrations or backwards compatibility as findings. Every failure above can be produced with newly filed records.

Also excluded: the schedule’s future single group row, the Leave War’s other blocking windows, the phone-header job, and the already-filed check observations. The counter’s two different delete-confirmation behaviours remain as ruled in D677.

**Ranked cases for the host**

For cases 1–6, “disproof” means evidence that disproves the source-traced failure on this branch. For the remaining cases, it means a result that disproves the expected sound behaviour.

1. **Medical conversion and document.** Create the F1 Meeting and ATT B; convert to ATT C, keep Ace only and attach a file. Expect a clash choice before any write, the file retained after reload, and one Undo restoring both original participants and medical records. Disproof of F1: that complete sequence already works.
2. **Upchit conversion.** Ace has ATT C on 12–16 October and a later medical entry; convert a two-person Meeting on 14 October into Ace’s Upchit. Expect the document choice and upchit summary, including the later-entry choices; Cancel changes nothing. Disproof: the current group-reduction path already asks and honours both.
3. **Mixed OIL answers.** Saturday 17 October, 08:00–10:00 Duty for Ace and Ranger; Yes for both, then Ace changes his answer to No. Filer selects All day. Expect one question before saving, with nobody left unanswered. Disproof: the question already appears because Ranger’s answer is stale. Repeat with the answers reversed.
4. **Group date range.** Shared Meeting, 12–14 October. Extend to 15 October from both the bar’s editor and List row. Expect one shared edit and one Undo. Disproof: an existing authorised control already performs this without deleting/re-filing or editing people separately.
5. **Visible class Undo.** Inputs calendar on October; set 14 October to NF through Calendar, close it, Undo and Redo. Expect Inputs to remain selected on October. Disproof: it already preserves the tab and view.
6. **Medical re-grouping.** Shared all-day Meeting for two people on 12 October. Edit their records separately on Edit Schedule to ATT B, with separate documents and identical shared fields. Expect two independently editable medical entries on Inputs. Disproof of F5: an existing writer/invariant already prevents their re-joining.
7. **Recurring-rule Undo.** Create a Thursday NF rule from 5 November, display December, then Undo/Redo while an affected Thursday is visible. Expect December and the current tab to remain. A jump to November disproves the expected behaviour.
8. **Published mixed group edit.** Publish a six-person Meeting on 13 October and sign all four positions. In one save, change its time, remove one person and add another. Expect each person’s actual change pending, all four working sign-offs invalidated, and the issued face unchanged until amendment. Missing people, retained valid sign-offs or an altered issued face disproves it.
9. **Warm cache, other period.** Prime an August date’s count while January is selected. Receive an approved absence for August through the normal row-merge route. Expect Available and still-needed figures to update everywhere without selecting August’s period. An unchanged figure disproves it.
10. **Late rule across New Year.** Input date 5 January 2027: Inputs at 14 days has deadline 21 December 2026; SANS at Wednesday two weeks before has deadline 23 December. A 22 December stamp is late only for Inputs. Change and undo each setting; expect both calculation and displayed reason to follow the correct setting.
11. **Refused group save.** File a three-person group leave where the second person already has overlapping leave. Expect no new record for anyone, no retained command, and unchanged stamps. Any partial write disproves atomicity.
12. **Fix regression set.** At 1440px, assert both 12px calendar margins. Open Calendar, its settings and an editor with only participant changes; reopen Calendar, close the front window and use Escape. Expect correct front order and preserved unsaved people. At 844×390, expect every opened-day entry reachable by scrolling.

**Explicit negatives**

- Placement and change stamps use the command’s actor and moment; restore does not stamp a new edit.
- Members’ new filing rights remain limited by type, filer and the live switch.
- Flying-plan and new settings writes enter named commands and persisted records.
- Relevant availability writers replace a watched object; I found no concrete stale-count writer.
- Days-mode late arithmetic is unchanged; SANS uses its separate setting, with medical exemptions retained.
- OIL voiding itself preserves No and removes a positive answer that the new hours no longer price.
- Published comparison remains per input; I found no new path modifying the issued snapshot.
- Group, picked-cell and holiday operations retain command-level rollback and one-step Undo.
- I read all five application fix diffs after the records commit; I found no new failure in those fixes themselves.

**Verdict: CHANGES REQUIRED.** Repair F1–F5, add the corresponding regression cases, and correct the opened-day short-screen contract. This report is review evidence, not approval.

Rulings: none this session.

