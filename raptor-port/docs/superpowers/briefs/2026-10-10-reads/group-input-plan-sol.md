1. **An added man can receive the wrong OIL answer.**  
   Plan §4.5 chooses the majority answer, breaking ties alphabetically. File a shared duty with the filer answering Yes; three members then change their own answers to No. The next man receives No, although D738’s full row explicitly requires the **filer’s last answer**.

   **Cause:** `ui/inputedit.tsx commitGroup` writes the common answer onto individual records; `saveOwnOil` subsequently overwrites a member’s copy. Neither those copies nor `modBy/modAt` reliably preserve the last common answer. The filer need not be one of the participants.

   **Exact fix:** replace the vote with separately retained provenance for the entry’s last common OIL answer. Update it when the filer/admin answers for the entry; leave it unchanged when a member answers for himself. Schedule additions copy that answer, including unanswered days. Specify its persistence, copying on entry changes, Undo/Redo and schema contract before building.

2. **Passing a placeholder to another member can silently undo an OIL refusal.**  
   Put ALL AVAIL on the lead member’s row, switch off a non-member behind that placeholder, then remove the lead member from the input. §4.2 appends the placeholder to a sibling. Its OIL item changes from the removed member’s `i:<iid>` to the sibling’s. The refusal remains under the old key, so that person can earn again.

   **Cause:** `engine/oil.ts groundItemKey`, `engine/oilev.ts landedExtras`, `oilEarnedWork` and `earnsFrom` identify the placeholder’s work and decisions through its carrier’s request. Copying `more` does not copy or preserve that identity.

   **Exact fix:** give row-owned placeholders an immutable identity independent of the member carrying them. Preserve their decision address, holding information and credit source through carrier removal, reload, holder saves and Undo/Redo. Derive their placement without writing another holder’s day. Do not indiscriminately copy another request’s decisions.

   This also breaks the proposed count: `canonicalUnits` produces a placeholder `reseat` alongside the member’s removal, while `unitRequestSrc` deliberately excludes extras. §4.8 will not absorb it. Fold an **automatic carrier transfer** into the member-removal item; keep a deliberate placeholder move separate. Test both, including a published Saturday and repeated placeholders.

3. **Cancellation still counts twice on an OIL-bearing published day.**  
   Publish a Saturday duty for four people who answered Yes, then cancel the shared row. §4.8 folds the four name-box changes into one, but the changed OIL evidence remains another item: **two pending**, against the promised CX count of one. Whole take-off and info-only have the same omission.

   **Cause:** `engine/publish.ts dayPendingItemsIn` folds derived OIL changes into input-detail changes only when the relevant records have `val`. Cancellation changes row standing, through `engine/oilev.ts projectOilInputs`, without changing those input details. The proposed `foldEntries` covers input items and equal name-box units, not the remaining OIL item.

   **Exact fix:** extend causal folding to derived OIL evidence changes caused solely by the shared cancellation, info-only or filing action. Keep independent OIL decisions, holiday changes and Logic changes separate. Leave `dayDelta`, stored evidence and sign-off bindings intact. Add earning-day versions of the twelve examples.

4. **The drawing and the writer disagree about which people belong to one entry.**  
   Two records can retain the same `grp` and display identical ground-row fields while having different end dates. This can arise with new data: change one member’s time under Unavailable, edit that now-separate record’s end date in its window, restore its hours and return it to the programme. §4.1 draws those records together. Typing on that apparent shared row edits only the lead’s entry, leaving the other record unchanged.

   **Cause:** proposed `groundGroups` uses `grp` plus visible row fields. Existing `state/inputgroup.ts entriesOf` and `entryRowsOf` use `grp` **plus all `SHARED_FIELDS`**, including dates, year and half-day state. Those are different membership tests.

   **Exact fix:** freeze the complete entry identity onto each landed row, derived from the same normalized shared fields used by `entriesOf`. Use it consistently for drawing, landing, inheritance, placeholder association and counting. Refresh it when those fields change even if the visible row fields do not. An issued face must use its frozen identity. Add the differing-end-date example and its Undo.

5. **The new-member landing comparison can never find an existing member.**  
   Add a fifth person to a cancelled shared input. §4.2 requires an existing row with the same `srcg` and the same six request fields. One of those six is `who`; the fifth person differs from every existing member. He therefore lands at the end without the cancellation and appears as a separate, active row.

   **Cause:** `engine/overlay.ts requestRowFields` returns `prog`, `str`, `end`, **`who`**, `rmks` and `srcType`.

   **Exact fix:** exclude `who` from the sibling comparison. Match the complete entry identity from finding 4 and the common request fields, then inherit the shared scheduler marks. Test adding to CX, red-box and info-only rows with unrelated rows below them, before and after reload.

6. **§4.7 and Q1 retain behaviour already superseded by the recorded rulings.**  
   Changing a Yes-answered Saturday duty from two hours to eight hours opens another OIL question under this plan. D739 explicitly says a schedule-side hours change keeps the answer and recalculates the amount without a question. D740 expressly carries that rule onto one-man request rows.

   **Cause:** §4.7 keeps `engine/oil.ts voidedOil` and `ui/inputedit.tsx askOilIfPending` unchanged for schedule typing, pending another owner answer.

   **Exact fix:** remove Q1 and implement the recorded schedule rule. For authorized schedule-side hour edits, retain No and unanswered days; reprice positive answers with the new hours; do not open the question. Preserve the existing question behaviour for edits in the input’s own window and for the separate holder-reassignment rule. Test week, board, shared and one-man rows.

7. **Adding someone to an entirely late entry marks that new person late.**  
   File a shared input late, then add someone from its schedule row. The earliest existing `mod` is still after the deadline, so §4.5 makes the new record late. D741 explicitly says a man added that way is not marked late.

   **Cause:** §4.5 copies the earliest member stamp instead of establishing an on-time lateness basis for a schedule addition.

   **Exact fix:** give the newly added record a lateness stamp no later than `inputOwnDueISO`—for example, the earlier of `nowStamp()` and that deadline. Preserve every existing member’s stamp. Keep the actual placement/change moment in `at` and `modAt`. The row can still show LATE because its existing members are late. Test all-late, mixed and all-on-time entries.

8. **R4 changes a removal gesture into a copy.**  
   Drag Ranger from the shared meeting onto a flying seat. The plan leaves him in the meeting and puts him in the aircraft. D734 says a puck taken off the shared row removes that man from the input; D735 relies on that removal when giving him separate tasking.

   **Cause:** §4.5 treats an outgoing member drag as a crew-list drag. Existing `ui/drag.ts applyDrop` normally handles seat moves and swaps, including source removal.

   **Exact fix:** remove the outgoing member from the input and perform the destination placement atomically, in one Undo step. Refuse the whole operation if the destination is refused. Never swap a destination occupant into the member’s request row. Keep the explicitly described data-edit behaviour for an incoming addition, where its original seat remains occupied. Update R4 and the test currently expecting “in both”.

9. **The proposed doors do not enforce the promise that member rows cannot be edited directly.**  
   The local probe bridge still exposes raw `setSlotVal`, `fillSlot` and `txtSet`. With a newly created group, `setSlotVal` can replace one member row’s `who` without changing membership; `txtSet` can change one member’s hours without changing the request. Both bypass all the doors listed in §§4.4–4.5.

   **Cause:** `src/probe-bridge.ts installProbeBridge` binds those globals directly to `engine/slots.ts`. The plan’s “three callers” of the text writer omits this route.

   **Exact fix:** route the bridge’s application writes through the new command-backed writers. Add guards in `setSlotVal`, `fillSlot` and `txtSet` against direct changes to fields owned by a standing shared request; permit the legitimate placeholder-extra operations and ordinary/kept rows. Use a distinct internal projection path where needed. Test direct bridge calls, including refusal with no mutation or Undo entry.

10. **The plan incorrectly requires “Discard edits” to equal the pending count in every example.**  
    Publish a shared input, then retime it through the new request-writing boxes. One change waits to go out. Loading the published version does not restore the input’s old hours: its row is rederived from the live request. The load therefore discards **zero** of that edit, not one.

    **Cause:** §2 says every count reads the same body, and §5 step 6 asserts all twelve counts on “Discard N edits”. Actual `engine/publish.ts dayDiscardCount` compares the result of `engine/drafts.ts dayAsLoadLeaves` and `filingRestorePlan`; it counts changes the load can really replace.

    **Exact fix:** share the grouping operation, not the population being counted. Apply it after `dayDiscardCount` determines what recovery actually replaces. Give the tests separate pending and discard expectations. A shared retime remains pending after loading; a restorable whole-row take-off counts once when restored. Do not make recovery overwrite live input records to force numerical agreement.

The following parts traced sound:

- Keeping one input record and one physical request row per person preserves the existing warning, rest, self-clash and per-person credit calculations **for a drawing-only change**. The placeholder transfer above prevents an unconditional “OIL unchanged” conclusion.
- Keeping each puck’s own physical key preserves its individual warning, amendment and OIL address. Redirecting jumps to the visible lead is necessary and correctly identified.
- `srcg` is absent from `dayKeys`, so adding that field alone adds no canonical content unit. However, “no signature moves” is too broad: `requestsSig` includes `srcv`, and the holder’s `sigOf` serializes the whole day. Those cache/base signatures should change. Stable row identities protect unrelated row marks when a member is inserted.
- The request-box route can preserve one command and one Undo step if it runs before the existing text command. It must distinguish **refused request edit** from **not a request box**, so refusal never falls through to `txtSet`. The existing caret-safe repaint and healing remain requirements.
- R1’s title normalization works for the activity kinds, including Other and placeholder-held requests. R2 matches the input boxes’ existing time behaviour; ordinary hand-built open-ended rows retain their existing handling.
- R3, R6, R7 and the accepted R8 are coherent with the recorded entry and filing rules. R5’s refusal preserves the writer’s existing requirement for at least one participant and supplies an explicit alternative.
- Ordinary edits preserving `mod` while updating `modBy/modAt` correctly separate lateness from change attribution. `isLateInput` also reads the input’s deadline and type; it does not read the attribution stamps.
- The display, published-count and picture roll-call is broad. The missing cases are principally the combinations above: OIL-bearing cancellation, placeholder carrier removal, all-late additions, differing entry dates, direct writers and recovery that retains live input changes.
- FULL is the appropriate build tier. The new data/provenance design must precede the drawing and interaction steps that depend on it.

This was Sol’s independent, read-only plan review. No file changed; no other reader’s report was opened; the Astra-only section was skipped. These are source-traced findings, not a runtime build approval.

Opus, as planner, must first redesign the entry identity, retained common OIL answer and placeholder ownership/decision identity, then revise the writers and count rules above. The recorded owner choices already settle the identified behavioural conflicts.

Rulings: none new.

VERDICT: NOT CLEAN