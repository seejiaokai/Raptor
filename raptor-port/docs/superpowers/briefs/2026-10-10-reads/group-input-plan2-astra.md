1. **High — typing two new times can silently erase an OIL Yes.**

   Section 4.7 explicitly turns a Yes into “unanswered” when the intermediate hours price nothing. For example, change a Saturday request from 09:00–17:00 to 17:00–21:00, typing the start first. The first save produces 17:00–17:00 and deletes the Yes; the second sees an unanswered record and leaves it unanswered. No question opens. The completed, valid request has lost its answer.

   **Cause:** `inputedit.tsx setInpField` saves each box separately. `oil.ts inputOilAmt` returns `null` for equal times. The proposed `repricedOil` cannot distinguish a genuinely unanswered request from a Yes it just erased. This affects both personal `oil` and the proposed `oilAll`.

   **Exact fix:** retain the Yes/No decision separately from its currently payable amount through schedule-side edits. An unpriceable interval must earn nothing without deleting that decision; the next valid hours must recalculate it. Keep the numeric answer maps valid for the permissions check. Preserve the input window’s existing void-and-ask behaviour. Test the two-box sequence, its reverse order, clearing to all-day, crossing midnight, reload and Undo.

2. **High — `oilAll` still does not reliably represent the filer’s last answer.**

   There are two concrete gaps.

   First, a filer creates an entry for A and B and answers Yes. B subsequently leaves. The filer opens the remaining entry and answers No. In `InputEditor`, `grouped` requires more than one selected or existing person; `saveNow` therefore takes its single-record answer-only path, which writes `r.oil` directly. Adding `oilAll` only to `commitGroup` leaves the collective default at Yes. A person subsequently added from the schedule receives the wrong answer.

   Second, individual editing can separate records sharing a `grp`, and `entriesOf` rejoins them when their shared fields match again. Their separately changed or voided `oilAll` maps need not match. Because `oilAll` is deliberately excluded from `sharedKey`, the reunited entry can carry contradictory defaults. The plan specifies neither an authoritative answer nor how to resolve those copies.

   **Cause:** `inputedit.tsx InputEditor/saveNow`, `commitInputEdit`, and `state/inputgroup.ts entriesOf`. Membership identity alone does not maintain replicated collective-answer state.

   **Exact fix:** distinguish an authorised answer for an entry from a personal answer independently of member count. Route the former through one collective-answer writer, including a group reduced to one person. Give collective answers explicit ordering/provenance and define one resolver for separation and reunion: choose the latest collective answer, apply the required validity rule for the resulting entry, and synchronise its copies in the same command. Personal answers must never advance that collective answer. A holder change must clear the new holder’s personal answer without accidentally treating that as a new collective answer.

   Put the collective-field permission check **before** `inputBreach`’s `if (own) return null`; copying the existing `oil` check below that return would let an ordinary member alter the default through his own record. Preserve the verified-replay exception for Undo/Redo.

3. **Medium — “always insert after the last member” breaks an issued row’s round trip.**

   File a group in a non-alphabetical selection order, publish it, take the whole row off, then accept it again. `commitGroup` preserves selection order when creating records, whereas `entryRowsOf` returns members alphabetically. Restoring those members in that order and always appending after the last restored sibling can change their physical order.

   The visible row is unchanged, but all the original row identifiers are back. `canonicalDiff` compares their surviving order and can produce a `mov:.ground` amendment. This also occurs with equal times under automatic ordering, whose tie order follows the physical array.

   **Cause:** section 4.2 overrides `slots.ts acceptInput`’s existing restoration beside issued neighbours. That code exists specifically to avoid a false reorder after taking a request off and accepting it again.

   **Exact fix:** make placement distinguish a newly added member from restoration of an issued member. Preserve issued-neighbour ordering for restored identifiers; use after-last-member placement for genuinely new rows. Return the actual inserted index and use it for acceptance marks and bookkeeping. Test whole-group take-off/reaccept with non-alphabetical creation order, both `gman` settings, and another ground row beside the group. Returning to the issued state must leave no reorder pending.

4. **High — the conversion exception can still discard a scheduler’s OIL refusal.**

   Section 4.2 preserves a scheduler-owned occupant by moving him from `who` to `more`, **except** when that person becomes an entry member.

   Suppose A’s solo request has B in its name box, and the scheduler has refused B’s OIL under `B|i:A`. Convert it into a shared input containing A and B, answering Yes for B. The exception removes B from A’s row; B’s new member row uses `i:B`. The refusal remains under `i:A`, where B no longer contributes work. B can now earn through the new item.

   **Cause:** `overlay.ts reconcileRequestRows`, `oilev.ts landedExtras/personDecision`, and the proposed conversion exception. The claim that “no decision about him moves” is false for this branch.

   **Exact fix:** explicitly handle promotion of a scheduler-owned occupant into membership. Before removing his old occurrence, preserve its applicable person-specific refusal on the destination request item in the same command, without weakening an existing destination refusal. Do not move decisions for other people or rewrite an issued snapshot. Test conversion with a refusal, publication, reload and Undo. Ordinary `who`→`more` movement on the **same** request item does preserve the decision.

5. **Medium — the promised separate placeholder removal is not present in the items being folded.**

   On a published weekday, remove a member whose hidden row carries ALL AVAIL while other members remain. Section 4.8 promises two changes: the member and the placeholder.

   `canonicalUnits` treats the removed physical row as one structural deletion. Its unmatched people and placeholders are covered by that deletion; they are not emitted as additional removal items. `dayPendingItemsIn` then pairs the request’s filing/details with that row deletion. A final `foldEntries` step has only one item to fold, so it cannot produce the promised second item.

   **Cause:** `canonical.ts canonicalUnits` and `publish.ts dayPendingItemsIn`, before the proposed fold.

   **Exact fix:** explicitly extract the disappearing placeholder occurrences from removed member rows into counting items before folding, narrowly for this shared-row case. Preserve occurrence identity and avoid counting the same removal twice. Keep the stored canonical diff and sign-off binding unchanged. Test the published weekday count of two, Saturday’s applicable OIL item, removal before first publication, whole-entry deletion, and Undo.

   Leaving the placeholder with its removed carrier does close the original silent transfer of OIL decisions. The replacement counting rule remains unimplemented in the design.

6. **Medium — retiming an issued group hides a subsequently added member’s amendment mark.**

   Publish a shared input, retime it, then add another person before issuing the amendment. Retiming changes `sharedKey`, hence every live member’s `srcg`. None now matches the issued `srcg`.

   Section 4.8 therefore classifies the added person’s row as lacking an issued shared row and lets `requestAddMarks` remove his puck’s mark. Yet this is an addition to an existing issued input—the plan expressly expects the retime and addition to remain distinguishable.

   **Cause:** the proposed issued-membership test in `holderbase.ts requestAddMarks` uses a content-dependent identity as a continuity test.

   **Exact fix:** establish continuity through a surviving member’s request/row identity against the issued snapshot, retaining applicable frozen-input pairings. Use that bridge to recognise the existing entry despite changed shared fields. Keep the added person’s hollow amendment tag. Test retime→add, add→retime, and a genuinely new entry, which should retain the whole-new-row treatment.

7. **Medium — disarming a stale target does not fix the successful drop’s stale address.**

   Drag a member from an earlier shared row into a later ordinary ground row. The destination is written inside the input command. Its after-command derivation then removes the source member’s physical row, shifting the destination’s index.

   `applyDrop`’s existing `done()` still receives the old positional `served` and `asks` keys. Its landing flash can identify the following row, and `barDrop` can judge the wrong place. Section 4.2 fixes the armed target but omits this other half of the earlier finding.

   **Cause:** `drag.ts applyDrop/done`, after `sched-commit.ts afterCommandPass` has installed the derived view.

   **Exact fix:** capture the destination by stable row identity and seat identity before the command; resolve its current positional address afterward for the flash, warning and continuation. Give this input-command path a completion routine that does not run a second scheduler mutation. Run necessary persistent bookkeeping inside the original command; perform visual feedback after it succeeds.

The other changed paths checked out as follows:

- Moving the unchanged shared-field normalisation into the engine preserves the entry test, including blank/missing values, SANS ticks and medical/upchit exclusions. Updating the cache signatures is necessary. A metadata-only `srcg` change does not itself become a canonical content change.
- The proposed guards do not obstruct derivation, acceptance/removal, person deletion, version loading, plan switching, template replacement, Undo/Redo or callsign renaming: those operations do not perform their relevant writes through `txtSet`, `setSlotVal` or `fillSlot`. Ordinary drag/swap handling **does** use those functions and must be intercepted before either side is written.
- `writeInputsBatch` can enlist both the input change and destination-day write. Its baseline refresh precedes those writes, and `daysNamed` lets the after-command pass absorb the destination day. A refused destination must throw a command refusal; merely returning `false` from an inner writer does not roll back the earlier membership removal.
- `oilPendingFor`, `oilSummaryOf`, the Leave War’s credit readers and frozen-input detail matching should continue reading personal answers, not `oilAll`. Whole-record history snapshots can carry the new metadata.
- Keeping “what this day earns” separate beside CX or take-off is sound: that is the current one-person counting behaviour. Discard must likewise fold its own restoration items, not copy the pending total.
- The last-member answer holds on this reread: the proposed refusal matches the window’s nonempty people-selection boundary and explicitly directs the scheduler to whole-entry take-off or deletion. I withdraw that part of my earlier objection.

Status of my first report:

- **A1 — Not closed:** collective-answer retention still fails for singleton groups and reunited entries; finding 2.
- **A2 — Closed for the original decision-transfer failure:** no placeholder handover remains; the replacement count fails as described in finding 5.
- **A3 — Closed:** grouping now uses the complete entry definition.
- **A4 — Closed:** placement matches entry identity without `who`, and covers both landing doors; finding 3 identifies a new restoration defect.
- **A5 — Not closed:** the prompt conflict is removed, but intermediate zero duration still destroys the retained Yes; finding 1.
- **A6 — Not closed:** ordinary conversion is covered, but promotion of an existing named occupant loses the refusal; finding 4.
- **A7 — Closed:** row-only structural additions and removals now enter the fold.
- **A8 — Closed:** Discard shares the counting rule, not an assumed identical total.
- **A9 — Closed:** templates emit one cleared ordinary row per visible group.
- **A10 — Not closed:** armed-target protection is specified; successful-drop address resolution is still missing; finding 7.
- **A11 — Closed:** the unapproved collective OIL switch is removed.
- **A12 — Closed in the revised design:** outward movement is atomic, and I accept the stated last-member boundary.

The planner needs to resolve these technical gaps before building. They do not require reopening the approved layout.

This was a static, independent review. I changed no files, ran no application tests, and opened only my own first report in the restricted reports folder.

Rulings: none this session.

VERDICT: NOT CLEAN