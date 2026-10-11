1. **The retained OIL answer becomes stale when a shared input is reduced to one person.**

   File a shared Saturday duty with Yes, then remove everyone except its filer. The surviving record still has `grp`, and its schedule row remains shared under R3. The filer opens its input window and changes the answer to No. The next person added from the schedule receives the old Yes.

   **Cause:** §4.5 places the common-answer writer in `ui/inputedit.tsx commitGroup`. But `InputEditor` defines `grouped` by the number of people, not the retained group identity. With one person, `saveNow` uses its ordinary answer-only or ordinary edit branch. Neither goes through `commitGroup`. Updating `oil` there therefore leaves `oilAll` unchanged.

   **Exact fix:** make common-answer saves recognize a retained group even when its entry has one record. Use one common-answer writer from `commitGroup` and both applicable `saveNow` branches. An answer given for the entry by its filer or an authorized admin must update `oilAll` on every current entry record, including a singleton. Keep explicitly personal answers through `saveOwnOil` and `reviseOil` separate.

   Put the `oilAll` permission check **before** `state/perms.ts inputBreach`’s early return for an own record. Owning a participant record must not, by itself, permit changing the entry’s retained answer. Test: Yes → remove to one → filer answers No → schedule adds someone → new person receives No; repeat with unanswered days, reload and Undo/Redo.

2. **Making an ordinary request into a group manufactures additional pending edits.**

   On a published weekday, put ALL AVAIL—or another scheduler-selected person—in a one-person request’s name box. Add a second participant through the input window. §4.2 restores the request owner to `who` and moves the existing occupant into `more`. The proposed count then reads **three items**, rather than the one participant addition.

   **Cause:** `engine/canonical.ts canonicalUnits` treats the primary seat and extras as different places. This conversion produces:

   - a `reseat` for the existing occupant moving into the extras;
   - a `people` unit for the request owner appearing in the primary seat;
   - the new participant’s request-row addition.

   The original owner has no input-detail change: `engine/inputs.ts inpDetailKey` excludes group metadata. Consequently, `engine/publish.ts dayPendingItemsIn` does not absorb those first two units through its existing `val` path. §4.8’s proposed fold covers input items, structural items and composite field changes; it does not cover these conversion-generated person units.

   **Exact fix:** extend the counting step to recognize this precise projection conversion: the same request and row identity, an ordinary request becoming grouped, its owner restored to the primary seat, and the previous occupant retained on that same row. Attach those generated person units to the participant-addition item. Match placeholder occurrences individually. Do not absorb deliberate occupant moves or unrelated extras edits.

   Leave the stored canonical diff and sign-off binding intact. Add pending-count assertions for both a named occupant and a placeholder, on a weekday and Saturday, including reload and Undo.

3. **A placeholder leaving with its member is not reliably counted as its own change.**

   Publish a cancelled shared row carrying ALL AVAIL on one member’s physical row. Remove that member while another remains. §4.5 removes the placeholder with him, but the weekday count is **one**, not the promised **two**.

   **Cause:** `canonicalUnits` counts a deleted physical row once; its extras are covered by that structural deletion. `dayPendingItemsIn` pairs that deletion with the removed input. There is no separate placeholder-removal item.

   An active placeholder can happen to produce another item through the OIL membership comparison. That is insufficient: `engine/oilev.ts landedRow` excludes cancelled and info-only rows, so their placeholders have no membership entry to remove. Moreover, membership is stored once per request item, so it cannot count two removed placeholder occurrences separately.

   **Exact fix:** for a **partial member removal**, explicitly extract each row-owned placeholder occurrence lost with its carrier and create a separate counting item for it. Keep whole-input removal under the whole-input rule. Where an OIL or membership delta is caused solely by those extracted removals, associate it with their items without adding another count; retain independent OIL decisions and other causes separately.

   Test active, CX and info-only rows; ALL and ALL AVAIL; repeated placeholders; weekdays and Saturdays. One member plus one placeholder must count two; one member plus two placeholders must count three. Keep the removal notice reachable from both the schedule door and the input-window derivation, with one notice rather than duplicate toasts.

4. **An outward move can flash and check the wrong destination after the source row disappears.**

   Drag a shared-input participant onto a hand-built ground row below his member row, with another row below the destination. The atomic command writes the correct destination. Its after-command derivation then removes the source row and shifts the destination’s index. Passing the original destination key to the existing drop completion flashes the following row and makes `barDrop` inspect the wrong place.

   **Cause:** `ui/drag.ts applyDrop` retains positional `targetKey`, `served` and `asks` values. `state/sched-commit.ts afterCommandPass` runs `holderbase.ts rederive` before `writeInputsBatch` returns. Removing the source request therefore changes ground indices before `done()` uses those values. §4.2 addresses the armed place, but not these retained drop addresses.

   **Exact fix:** capture destination addresses by row identity before the command, including the actual filled seat returned by an append. Resolve them back to current positional keys after the command’s derivation, then use those resolved keys for the landing flash, served-arm comparison and `barDrop`. Do not attempt to resolve the departed source as a surviving seat.

   Test a destination below the source, with a following row, for replacement and append, on week and board. Preserve one Undo step and whole-operation refusal.

The earlier findings have these statuses:

- **S1 — Not closed:** retaining `oilAll` replaces the incorrect majority rule, but the singleton common-answer save still misses it; finding 1 gives the fix.
- **S2 — Partly closed:** leaving the placeholder with its carrier avoids silently moving its OIL decisions; its separate removal count remains incomplete, as finding 3 shows.
- **S3 — Closed by the answer:** keeping the derived OIL item beside CX or take-off matches the current one-person comparison. D736’s full reading refines the shared-input unit and says the other publication rules remain unchanged; I withdraw the earlier demand to fold that OIL item unconditionally.
- **S4 — Closed:** using the same normalized shared fields for entry identity resolves the differing-end-date mismatch.
- **S5 — Closed:** matching siblings by `srcg`, without `who`, allows a new participant to inherit the shared marks.
- **S6 — Closed:** §4.7 follows the recorded schedule-side repricing rule and withdraws Q1.
- **S7 — Closed:** the earlier-of-today-and-deadline stamp prevents a schedule addition from becoming late.
- **S8 — Closed in the command design:** removal and destination placement now belong to one command; the destination feedback still needs finding 4’s correction.
- **S9 — Closed:** the engine belts and command-backed probe writers cover the previously unguarded writes.
- **S10 — Closed:** discard and pending counts now share grouping while retaining their different populations.

The remaining changed parts trace sound:

- `entryIdOf` matches `entriesOf`’s exclusions and normalization: medical kinds and upchits stay separate; blank and missing shared fields compare alike; SANS ticks retain their existing normalized comparison. Adding `srcg` alone creates no canonical content unit. A hidden shared-field change refreshes the view’s caches without creating a projection history line.
- Moving a non-member occupant from `who` into the **same row’s** extras preserves its request item and OIL decision address. `landedExtras` reads both places, and the event builder reads both. Reload and Undo derive the placement from the holder base. Finding 2 concerns the count of that conversion.
- Mid-list insertion does not change surviving rows’ relative order, so insertion alone creates no ground-order unit. `acceptInput` must use the helper’s actual insertion index for its existing marking and flash bookkeeping, and preserve its issued-neighbour fallback when no sibling matches.
- Repricing No, unanswered days, all-day work and overnight work is compatible with `inputOilAmt`. Positive entries must be omitted when the new hours price nothing. The input window’s voiding and question paths remain separate; holder reassignment and calendar-date movement still require their existing questions.
- The new saved field is excluded from the content and entry keys. OIL evidence, the Leave War credit pass, the unanswered bell and the summary continue reading each person’s `oil`, not `oilAll`.
- The legitimate projection and replacement paths do not go through the three guarded setters: reconciliation writes fields directly; Accept and Unaccept insert or remove rows directly; person deletion and `stripPersonFromDay` edit their models directly; version loads, plan switches, templates and restores replace models. Callsign renaming changes the person’s label. Ordinary seat swaps remain permitted; writes into a grouped member’s primary seat are intentionally routed through the new door.
- `commitInputsWith` can carry both the request removal and destination placement. It resynchronizes before enlistment; nested writes join the envelope; `daysNamed` absorbs the destination day. A refused destination must throw `CmdRefused`, rather than merely return false after the removal. After a successful command has advanced its baseline, the existing completion epilogue need not emit another envelope or Undo step.
- The last-person refusal holds: `commitGroup` refuses an empty participant list, and D734 explicitly measures the schedule gesture against the input window. The refusal supplies the alternative action.

This was Sol’s independent, read-only confirmation review. No file changed, no other reader’s report was opened, and no runtime checks were run. The four corrections are technical work for Opus; they require no new owner product choice. The proposed build remains FULL tier.

Rulings: none new.

VERDICT: CLEAN WITH THESE EXACT CHANGES