Two findings require changes. This was a read-only review, including W1–W8. I did not open either reader’s reports or change any file.

1. **Changing an Unavailable input to ALL AVAIL leaves it under Unavailable and earns nothing for the crowd.**

   **Steps:** An admin files a named person’s one-day **Other** input under Unavailable. In the Inputs List’s pencil editor, change Person to **ALL AVAIL** or **ALL**, keep Other, and save. On a weekend, answer Yes to OIL.

   **Expected:** The permitted conversion produces an ordinary placeholder request on the programme, with its crowd and corresponding OIL.

   **Actual:** The input retains `acc: 'u'`. It appears under Unavailable, never lands its programme row, and has no crowd to credit—even with Yes recorded.

   **Cause:** [commitInputEdit](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1151) preserves the Unavailable filing when only the person changes. [placeholderProblem](/C:/Users/User/projects/Raptor/raptor-port/src/engine/inputs.ts:526), including its use at the save boundary, checks kind, dates and grouping but permits this filing state. The programme projection correctly excludes `acc: 'u'`.

   I traced the editor’s save path and checked the resulting record through the production projection and OIL calculations in memory: the shape check accepted it, with **zero programme rows and zero earners**. Removing the Unavailable filing produced **one row and the expected crowd earners**.

   **Fix, in order:**
   - In the shared edit operation, clear an inherited Unavailable filing when converting a named input to a placeholder. Preserve the existing person-change OIL question.
   - Add a shared refusal for a placeholder record carrying `acc: 'u'`, enforced at the command boundary, so restores and other writers cannot recreate it.
   - Test the complete sequence through both editors, for both placeholders, including the programme row, OIL, Undo and Redo.
   - Replace the reassign test’s directly constructed placeholder-with-`acc: 'u'` fixture with a permitted source record. Test the forbidden state separately as a rejected write.

   **Provenance:** Older filing-preservation code made newly reachable by this change’s Person options. It affects newly created inputs; D56 does not exclude it.

2. **W7 still produces a false pending change and invalidates signatures after deleting a removed request with a previous OIL decision.**

   **Steps:** File a weekend ALL AVAIL Duty and answer Yes. Switch one crowd member off in OIL Earn. Take the request off the programme, publish the day, then sign its unchanged working copy. Finally, delete the removed request.

   **Expected:** Zero pending changes and the signatures remain valid, under D176.

   **Actual:** One OIL change appears and the signatures become invalid, although nobody’s earned leave changes.

   **Cause:** [pruneHandedOverDecisions](/C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts:454) removes the crowd member’s refusal from the calculated evidence while the request exists without its row. Once the request is deleted, its “orphan” branch retains that same stored refusal. W7’s [keyedInputs](/C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts:890) excludes dormant inputs but leaves these inactive decisions in the comparison.

   I reproduced this using the production accept, remove-from-programme, publish, signing and comparison functions in memory, followed by the same input removal that the delete operation performs: **pending changed from zero to one; signed changed from true to false; earned work remained empty**.

   **Fix, in order:**
   - Add one shared comparison projection that excludes request-specific decisions when the corresponding request is absent from that evidence block or is dormant.
   - Use it consistently in `oilEvidenceKey` and `oilMovedInputsOnly`; keep signature comparison aligned through `oilSignKey`.
   - Preserve the underlying decisions for Undo and reacceptance. Do not fix this by deleting stored decisions or rewriting issued records.
   - Extend the W7 tests with the complete sequence above, including pending count and signatures. Cover both allow and deny, typed extras and crowd members, plus controls proving active decisions still raise genuine pending changes.

   **Provenance:** The pruning behaviour already exists on main. This is an incomplete W7 repair, reproducible with new records—not a migration issue.

The coverage check included these surfaces and action sequences:

| Area | Signs and actions checked |
|---|---|
| Filing and editing | Window, board dialog, List add and pencil; permitted kinds, single day, grouping, person conversion |
| Calendar and lists | Names, filters, month bars, opened-day cards, date moves, “mine,” late marks |
| Roles | Admin, member filer, another member, guest; members’ switch changed after filing |
| OIL | Yes, No, unanswered, typed extras, crowd overlap, individual switches, blanket, cancelled and removed rows |
| Publication | Frozen answers and membership, pending changes, signatures, deletion, plan/version restoration |
| Downstream readers | Availability, absences, warnings, crew rest, Insights, Leave War credits and roster changes |
| Event | Metadata, type lists, typed-word matching, red SC clash, reference twins and derived rules |

**Explicit negatives:** I found no additional defect in the shared crowd-default calculation, switch direction, typed-person precedence or deduplication. Issued OIL reads frozen evidence rather than recalculating live availability. The command’s `c.after` is the complete input record, so the new structural check examines the correct value. The permission and filer-bell paths use the shared permission rules. Everyone, ALL and ALL AVAIL have distinct filter values. Event’s metadata, schema and both reference twins include the new kind.

W1–W6 and W8 are supported by the code read. W7 remains incomplete as described above.

The roll-call needs the two combined action sequences above: its separate conversion, removal and deletion rows do not establish those outcomes. The browser reload test also claims the programme row survives, but after reload asserts only the input and OIL answer; add an assertion for the restored row and count.

I checked the existing backlog and have not repeated its recorded issues. I did not rerun the browser walk or full test suite; the execution evidence here comes from isolated, in-memory engine checks.

Rulings: none this session

VERDICT: CHANGES REQUIRED