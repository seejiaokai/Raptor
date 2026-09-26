## Verdict

The plan should not be implemented unchanged. Its overall two-freeze architecture is sound, but six gaps can still produce a moving published face, false pending changes, inconsistent counts, or an incomplete retired publication.

### 1. Highest consequence: `inputDelta` reverses D174 and D176

The proposed appeared/disappeared comparison treats a dormant request as ordinary input content.

That means:

- A request absent at publication, later filed and then taken off, appears in live `INPUTS` with `acc:'r'`. `inputDelta` reports it as added, although D174 requires zero pending.
- A request published while already dormant, then deleted or re-dated away, disappears from the live map. `inputDelta` reports it as deleted, although D176 requires zero pending.

Fix:

1. In `engine/inputs.ts`, add one pure, date-aware input-membership equality function.
2. Make only these pairs equivalent: absent issued input ↔ live dormant input, and issued dormant input ↔ absent/off-date live input.
3. In `engine/publish.ts`, make `inputDelta` apply that equality before producing appeared/disappeared entries.
4. Reuse the same equality in `engine/weekctx.ts` when deciding whether frozen neighbour inputs diverge. Do not create a second interpretation.
5. Test D174 and D176 through the complete contract: zero pending, four sign-offs remain valid, no stored AL entry, no warning delta. Also pin the opposite case: an input visible at publication and later taken off remains one pending change.

### 2. Comparing every input field will create false and duplicate pending changes

“Every field except `acc` and `iid`” includes fields that are not part of the published schedule face:

- `docId` and `docIds` belong to medical paperwork.
- `lw` is Leave War provenance; its reminders are deliberately left live.
- `oil` is a map covering potentially several dates and already has its own per-day OIL comparison.

The `oil` field is particularly dangerous. Changing Tuesday’s answer on a multi-day input would change the whole copied object and therefore mark Monday pending. On the affected day it can also produce both an input item and an OIL item for one act.

Fix:

1. In `engine/inputs.ts`, define an explicit `publishedInputProjection()` instead of cloning and comparing arbitrary object keys.
2. Include only fields consumed by the scheduled face and validator: identity, person, covered dates/year, all-day/window/half, type, remarks, `mod` for the LATE display, `sans`, and filing state where the frozen reader needs it.
3. Exclude `docId`, `docIds`, `lw`, and `oil` from the input-value comparison. Keep filing in the existing filing axis and OIL in `oilDelta`.
4. Use this same projection for `snap.inp`, hashing, equality, and pending-list field descriptions.
5. Test document attachment changes, Leave War provenance changes, and an OIL answer on another covered date: none may create an input pending item. A same-day OIL change must remain exactly one OIL item.

### 3. `snap.w` does not freeze the whole published face

Warnings are not the only live dependencies rendered on an issued day.

- `ui/html.ts:puck` reads live `PEOPLE` fields including `q`, `seat`, `pers`, `san`, and `sxo`. A CAT or posting change can therefore change the puck’s letter, colour and tooltip even when the warning slice does not change.
- `ui/html.ts` and `ui/board.ts` calculate a blank formation’s brief time from live `VCONF.briefLead`.
- `ui/export.ts:schedRows` bypasses `withDaySnap` and reads both live `VCONF.briefLead` and live qualification values from `PEOPLE`.

These are direct D179 failures. A qualification change with no resulting warning can alter the face silently. A rule change can leave the on-screen issued day, board preview and published CSV/PDF disagreeing.

Fix:

1. Expand the issue-time snapshot with a real face projection: the rendered person attributes for everyone present on the day, plus directly rendered rule values such as `briefLead`. Keep callsign out because it is explicitly a live label.
2. Add scoped accessors for published person and rule values, installed by `withDaySnap` alongside frozen inputs.
3. Convert `html.ts:puck`, the relevant board renderers, and all other issued-face readers to those accessors.
4. Change `ui/export.ts` so each published day is flattened inside that day’s issued context; `publishedDays()` returning only `snap.d` is insufficient.
5. Generalise `warnDelta` into one face delta containing warnings plus these direct display projections. A CAT change that also changes a warning must still count once.
6. Test a CAT change that produces no warning and a `briefLead` change on a blank brief: week view, board preview, information panel, CSV and PDF must retain the issued values; pending must be one, the four sign-offs must fall, and reissue must adopt the new values.

### 4. Accepted-input folding must absorb all linked content units

The plan says an input item takes “the content unit” for its ground row. There may be several.

Editing an accepted input can change the linked row’s person, programme text, start, end and remarks. `canonicalUnits()` emits separate units for those fields, and sometimes a people unit. Folding only one leaves one user act reading as several pending changes.

Fix:

1. In `engine/publish.ts:dayPendingItemsIn`, index every content unit by the ground row it belongs to on both the issued and live sides.
2. For each input delta, consume every unit whose row has that input’s `src`, not merely the first add/delete unit.
3. Merge the consumed units’ jump targets and edit-log keys into the single input item.
4. Ensure every content unit is consumed at most once and retain the full canonical diff in the stored AL.
5. Make `dayDiscardCount` and all other counts use the same folded item list.
6. Test a single accepted-input edit that changes person, type, times and remarks together. Every displayed count, the pending list and stored `units`/`ukinds` must say one. A manual ground-row edit unrelated to its source input must remain a separate item.

### 5. Original Unpublish drops the new frozen data

`engine/publish.ts:retireIssued` copies an AL’s complete `rec.snap`, but reconstructs an Original as only:

`{d: rec.d, c: rec.c, fil: rec.fil}`

That will omit `inp`, `w`, and any added face projection every time a newly published Original is unpublished. This affects new publications, so D56 does not exclude it.

Fix:

1. Add one snapshot-cloning function in `engine/publish.ts` covering `d`, `c`, `fil`, `inp`, `w`, and the direct face projection.
2. Use it for both Original and AL retirement; remove the hand-written Original fallback.
3. Extend `engine/schema.ts` and `engine/schema.test.ts` for every new snapshot field.
4. Add the new warning/face delta kind to `engine/canonical.ts`, stored AL types, `PendItem`, `itemCounts`, `ukinds`, and schema validation.
5. Test Original publish → Unpublish and AL publish → Unpublish. The retired snapshot must exactly preserve the issued inputs, warnings and display projection. Also test undo, redo, reload and week-stash round trips.

### 6. The callsign rule contradicts the warning design

The plan first says callsigns are live labels and renaming one moves nothing. It then says frozen warning text keeps the old callsign and the rename creates pending.

Current warning messages frequently embed callsigns, while warning rows also resolve `who` IDs through today’s `PEOPLE`. Freezing the message but rendering the heading live can produce one row containing both old and new callsigns.

Fix:

1. Keep the settled label rule: a callsign rename should produce no pending change.
2. In `engine/validate.ts`, separate warning identity and parameters from display labels. Warning keys must use stable person IDs, codes and semantic parameters, not rendered callsigns.
3. In `ui/html.ts`, `ui/board-html.ts` and the pending list, resolve callsigns at render time from `who`.
4. Exclude callsigns from the frozen person projection and face key.
5. Test renaming a person who currently has a warning: the new callsign must appear consistently everywhere, pending remains zero and the four sign-offs hold. Changing the actual warning condition must still produce one face change.

## Explicit negatives

The following parts of the plan are sound:

- `inputsOn(dt)` plus synchronous `withFrozenInputs(..., fn)` with `finally` restoration is the right read architecture. Installing it in `withDaySnap` and `withIssuedWeek` is the correct pair of doors.
- Keeping parked plans and working-copy surfaces live is correct. Only an issued Original or AL should install the frozen context.
- Removing the medical exception from `inpShow` follows D179.
- Capturing warnings through a hook is a reasonable cycle break. The hook must run only after the issued record is installed and `SCHED.cur[di]` points to it; keeping that mutation inside the scheduler command preserves undo.
- Keeping the face/warning delta out of `officialDiverges` is correct. Otherwise validation would depend on its own result.
- `windowInputs` beside `windowFiling` is the right cross-week design. It must install an explicit empty frozen set for every protected approved date that cannot resolve a snapshot; omitting the date would fall back to live inputs.
- Leaving member input records untouched by “Load onto working copy,” keeping their changes pending, and excluding them from “Discard N edits” is correct.
- The existing OIL publication authority remains sound: `snap.d.oilev`, `oilDelta`, and the latest published version continue to implement D48 and D142. OIL’s live evidence projection must not be redirected through the ambient frozen-input reader.
- New nested snapshot fields should already survive ordinary history, persistence, reload and week switching because those paths serialise the whole schedule book. No migration for older demo records is warranted under D56.
- One additional synchronous validation at publication and memoised per-day comparisons are reasonable for a phone once snapshots use the narrow projections above.

This report is against committed HEAD `415d2f4e`. The shared worktree acquired concurrent uncommitted builder changes during the review; I did not edit any file or use those changes as the basis for these findings.

