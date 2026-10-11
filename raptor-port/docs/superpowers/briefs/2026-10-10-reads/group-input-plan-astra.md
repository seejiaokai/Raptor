1. **A newly added person can receive the wrong OIL answer.**

   In [§4.5 of the plan](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:189), the default is the majority answer, with alphabetical order breaking a tie. D738’s full row explicitly requires the **last answer given by the filer**, despite subsequent personal answers.

   For example, the filer answers Yes for three people; two later answer No for themselves. The proposed rule gives a fourth person No. The required answer is Yes.

   **Cause:** `inputedit.tsx commitGroup` writes the filer’s answer into each person’s `oil` record. Subsequent personal answers overwrite those values. Neither majority voting nor choosing one surviving record reliably recovers the filer’s last answer.

   **Fix:** retain the entry’s last collective answer separately from personal answers. A schedule-side addition copies that answer into the new record only. Personal answers must not overwrite the retained collective answer; schedule-side repricing must update its amount consistently. Do not pass the copied default through `commitGroup`’s existing `oilDec` argument unchanged: its `forAll` path can overwrite existing people’s personal answers. Test a majority reversal, a tie, the filer outside the people selected, and removal of the person whose record previously supplied the default.

2. **Moving a placeholder to another hidden row can reverse an OIL refusal.**

   [§4.2](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:117) transfers a departing person’s placeholders to a surviving sibling. It transfers their visible presence, but not their OIL identity.

   Suppose ALL AVAIL is carried by A’s hidden row, and the scheduler excludes C from earning under it. Removing A transfers the placeholder to B. `oil.ts groundItemKey` changes its item from `i:A` to `i:B`; `oilev.ts personDecision` still holds C’s refusal under `C|i:A`. `landedExtras` now supplies C under B’s item, where that refusal is absent. C can earn again without the scheduler restoring him.

   **Fix:** give the row-owned placeholder work an identity that survives removal of any input member, and carry its decisions and frozen membership through that identity. The planner must describe the corresponding changes to `landedExtras`, evidence, credit and publication. Simply copying `who`/`more` is insufficient. Preserve separate placeholder occurrences and their decisions; test removal, reload, Undo, publication and the previously issued face. This invalidates §3’s claim that all OIL readers can remain unchanged.

3. **“Same group and same visible boxes” can join different inputs.**

   [§4.1](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:92) uses `srcg` and the displayed row fields. The existing entry definition in `state/inputgroup.ts entriesOf/sharedKey` also distinguishes dates, end dates, year, all-day state and other shared fields.

   A fresh shared Other input can have records separated through the permitted individual Unavailable editing route. Give those records different end dates, then accept them on a day both cover. Their group identifier, title, times and remarks can match while they remain different entries. The proposed renderer joins them. Editing that apparent single row then resolves only one entry through `entryRowsOf`, so the row splits after the edit.

   **Fix:** persist enough entry identity on each request row to distinguish the complete shared-field definition, and use the same definition for rendering, landing, placeholder succession and resolving writes. Preserve that information in issued snapshots; do not consult live inputs to regroup an issued face. Different entries retaining the same `grp` must remain separate.

4. **The proposed landing match cannot find a different person’s row.**

   [§4.2](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:112) requires the same six fields returned by `overlay.ts requestRowFields`. One of those six is `who`.

   Add C to a cancelled shared input containing A and B. C’s `who` differs from both existing rows, so the specified match fails. C lands without their cancellation, and the displayed row separates; C’s work can also become eligible for OIL.

   **Fix:** match the shared entry without person identity, then inherit its row controls explicitly. Use one placement-and-inheritance helper in both `landRequests` and `slots.ts acceptInput`; fixing automatic landing alone leaves explicit acceptance able to create a differently controlled member row. Test CX, its reason, red box and info-only through both routes.

5. **The OIL question in §4.7 contradicts two recorded rulings.**

   [§4.7 and Q1](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:220) retain the existing prompt when schedule-side hours change the amount.

   D739 reading 4 requires retaining the answer and recalculating the amount without a question. D740 reading 4 expressly carries that rule to one-person request rows. This is already answered.

   **Cause:** routing through today’s `commitInputEdit` → `voidedOil` → `askOilIfPending` retains the old behaviour without applying the new schedule-side exception.

   **Fix:** for authorised schedule-side time edits, retain Yes/No/unanswered status, recalculate positive amounts, preserve scheduler refusals, and do not open the question. Keep the existing questioning behaviour for edits in the input’s own window. Remove Q1 and replace the conflicting test expectation; an existing test does not override the newer ruling.

6. **A newly converted shared input can omit one of its actual people.**

   [§4.3](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:126) draws each member row’s `who` as that input member.

   Create a one-person request for A, put ALL AVAIL in its main name box, then add B through the input window. This is new data using supported actions. `commitGroup` gives A a group, but `overlay.ts reconcileRequestRows` deliberately preserves a scheduler-owned placeholder in `who`. The proposed shared row displays ALL AVAIL and B, with no puck for A, although A remains an input member.

   **Fix:** specify the solo-to-shared transition. Each grouped member’s primary place must represent its actual input person. Move a preserved placeholder into that row’s extras without losing its decisions or duplicating it. Also account explicitly for a real scheduler-owned occupant under D470; do not silently remove that person’s scheduled work or mistake them for an input member. Add conversion tests alongside the ordinary fresh-group tests.

7. **Moving the whole input between published days still counts each person separately.**

   [§4.8](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:231) folds items carrying `inp`, `val`, or a lone input item.

   Publish two days covered by a four-person input, with its rows on the first day. Take it off that day and accept it on the second. Its final filing remains `g`, and its input details have not changed. In `publish.ts dayPendingItemsIn`, these are structural row deletions/additions without the input-axis fields required by the proposed fold. `requestRowUnit` pairs only a transition into or out of `g`. The four rows therefore remain four items on each affected day.

   **Fix:** classify request-related structural units through their source rows even when there is no filing or detail delta. Resolve deletions against the issued day and additions against the live day, then apply the whole-entry versus individual-person rule. Preserve `frozenInputMatch`’s pairings. Test the move, its Undo, loading either published day, and issuing then unpublishing an amendment.

8. **The proposed “every surface” tests give Discard the wrong meaning.**

   [Build step 6](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:276) requires the twelve pending counts to appear identically in “Discard N edits”.

   Retiming a published shared input should produce one pending change. Loading the issued day does not restore the global input’s former time: `drafts.ts dayAsLoadLeaves` reapplies the current request. There are therefore **zero edits discarded** in that isolated case, despite one change remaining pending.

   **Cause:** `publish.ts dayDiscardCount` deliberately compares the current day with the day a load would actually leave. Its units also differ from pending items: paired filings carry `inp: true`, and unpaired restorations are separate records.

   **Fix:** share the counting **unit**, not an assumed identical item list or total. Fold Discard’s actual restoration units after `dayAsLoadLeaves`, supplying explicit record identities. Retain its exclusions for input details, filings a load cannot restore, and derived OIL. Test the expected pending and discarded counts separately, including **pending 1 / discarded 0** for a pure retime.

9. **Saving one shared row as a template produces several ordinary rows.**

   The roll-call mentions templates, but supplies no change to [their writer](/C:/Users/User/projects/Raptor/raptor-port/src/engine/daytpl.ts:143).

   `daytpl.ts mintBlob` copies every physical ground row, clears the people and strips `src`. Saving a four-person shared row therefore creates four template rows. When applied, none has `src`, so `groundGroups` cannot collapse them.

   **Fix:** construct the template’s ground shape from the visible groups before stripping request identity. Emit one ordinary template row per displayed shared row, preserving the appropriate empty places and ordinary row fields. Remove `srcg` and any new entry metadata as well as `src`/`srcv`. Test save, apply and reload.

10. **Inserting a member mid-list can redirect an armed placement to another row.**

    [§4.2](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:112) recognises that later physical indexes move, but addresses only marks.

    Arm a place on a later ground row, open a shared input above it and add a person. The proposed insertion shifts that later row. `state/view.ts rawSchedEpilogue` checks whether the armed index still exists; another row now occupying that index passes. Its additional disarm mechanism depends on `reorder.ts popReorderedDay`, which input landing does not set. The next palette selection can fill the wrong row.

    **Fix:** preserve and resolve armed targets by stable row identity across rederivation, or disarm the affected day whenever physical row positions change. Apply equivalent identity resolution to the successful drop’s flash and continuation target. Add the armed-place/add-member/palette sequence to the tests.

11. **The plan introduces an unapproved whole-input OIL switch.**

    [§4.5](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:201) makes the name cell switch every member’s OIL item.

    Today `ui/oilmode.ts oilItemCellHTML` deliberately makes a named request’s title inert and directs the scheduler to individual pucks. `toggleOilItem` is also a per-item cycle: applying it independently to mixed states can turn one person off and another on, rather than give the visible row one common result.

    **Fix:** remove this new title switch from this plan and retain the existing per-person controls, each carrying its own request item. If a collective switch is wanted, its mixed-state behaviour and treatment of later additions need an owner decision before the planner specifies it. The approved pictures and D738 do not supply that decision.

12. **R4 and R5 create exceptions to taking a person out of the input.**

    [§4.5 and readings R4–R5](/C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md:181) make an outward drag a copy and refuse removal of the last person.

    Under that plan, dragging A from the shared row to another seat leaves A in the input; dragging the final person off removes nobody. D734 says taking the puck off takes the person out of the input. It records neither exception.

    **Cause:** the plan treats copying as a way around `drag.ts applyDrop`’s move/swap handling, and treats `commitGroup`’s requirement for a nonempty selection as a product restriction.

    **Fix:** make a successful outward move remove the source membership and place the person at the destination in one atomic command. Route removal of the final member through the existing permitted deletion operation rather than attempting to save an empty group. A refused destination must leave the source unchanged. If the planner instead wants copy-only dragging or last-person refusal, those are specific new choices for the owner—not implementation readings of D734.

The following parts came out sound in the static trace:

- Keeping separate input records and request item keys can preserve each person’s OIL answer, permissions and ordinary evidence. Drawing them together alone does not change credit. Findings 2, 6 and 11 are additional changes that break that limited argument.
- `commitGroup` supplies a suitable atomic input-write boundary, including permission checks, absence rules and group validation. A scheduler adding someone to a member-filed entry is not inherently refused by member ownership rules.
- Moving typed request times into the input addresses the recorded all-day self-clash: the input and its landed row then describe the same timed event. `titleOf` is the appropriate existing normaliser for the proposed title edit.
- Preserving `mod` while still recording `modBy`/`modAt` is consistent with the existing late calculation for schedule edits that leave dates unchanged. Keeping the input window on the ordinary stamping path matches D742.
- Stable row identifiers protect canonical comparisons and amendment keys from a mere insertion index change. That protection does not cover transient positional targets such as the armed place in finding 10.
- The assertion that `srcg` affects **no signature** needs correction: `holderbase.ts sigOf` serialises the complete day, and `overlay.ts requestsSig` incorporates `srcv`. Those caches should notice the change. This is distinct from changing the canonical published diff or sign-off binding.
- The current schedule CSV and print routes do not enumerate ground rows. They do not require an invented ground-row export change.
- R8 is accepted under D56. None of the findings above depends on migrating old stored data. The notification question is already filed and is not an additional finding.

This was a static, independent plan review. I changed no files, ran no application tests, and did not open the closed reports directory.

Rulings: none this session.

## For Astra only

Meaning comparison of the short lines against their full rows:

| Ruling | Result |
|---|---|
| D734 | SAME |
| D735 | SAME |
| D736 | SAME |
| D737 | SAME |
| D738 | SAME |
| D739 | SAME |
| D740 | SAME |
| D741 | SAME — the reference to D742 correctly identifies its widening. |
| D742 | SAME |
| D743 | SAME |

No corrected short line is needed. The OIL conflicts are in the plan’s interpretation, not in those shortened rulings.

The planner must revise entry identification, OIL answer retention, placeholder ownership, placement and counting before building. The approved layout need not be reopened. Owner input is needed only if the planner retains the additional interaction choices identified in findings 11–12.

VERDICT: NOT CLEAN