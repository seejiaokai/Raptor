# Astra blind red-team report — Phase 6 plan v2, round 2

**Review basis:** `0894227c`, read-only plan/source review. I did not read any file matching `*-r2-fable.md`.

## Findings

### 1. BLOCK — Request-only Undo cannot restore a row destructively removed by reconciliation

**Scenario**

1. A new activity request is filed.
2. The scheduler places and edits its row, preserving a specific row ID, position, times, and extras.
3. The day is saved and optionally published.
4. The member deletes, retypes, or moves the request off that day.
5. The phase-8 reconciliation removes the row from live `DAYS`.
6. The member selects Undo.

**Expected**

The request and its exact holder-owned row return immediately, without writing a day record. Row identity, placement, times, and extras match both the pre-command state and a subsequent reload.

**Result under plan v2**

Undo restores only the Input record. Reconciliation then starts from the already-overlaid live day, where the row no longer exists.

On a published day, the landing rule does not restore it because the issued version has already seen that request. On a draft day, it can only append a newly synthesized row, losing the original row ID, placement, and holder-owned content. Reload behaves differently because it begins from the untouched stored day.

This is a failure on newly created data, not legacy repair.

**Evidence**

- `phase6-plan.md`, §2.2 and §3(c): request-derived effects execute after request-only commands and Undo/Redo, without adding a day change.
- `src/state/sched-commit.ts`, `schedWriteRecords`: restore strips derived `acc:"g"` state and reconciles only the live day.
- `src/engine/slots.ts`, `reconcileDayFiling`: an absent row is not reconstructed.
- `src/engine/slots.ts`, `acceptInput`: issued row identity can be recovered when this function is invoked, but v2’s published landing condition excludes a request already present in the issued filing.
- `src/state/rowmap.ts`: only recorded envelope changes are persisted; the phase-8 removal is intentionally absent from the stream.

**Required fix — change the plan before build**

Add an explicit holder-authoritative base for every loaded day:

1. At boot/week load, retain the raw holder-owned day before applying request/person overlays.
2. Derive live `DAYS` from that base plus current requests. Never use an already-overlaid day as the sole source for the next reconciliation.
3. Request/person commands, including Undo/Redo, must not advance this base.
4. Holder-owned commands—Accept, Ground, Unavail, Takeoff, Ground + Inputs, schedule edits, and whole-day replacement—must advance it before the next overlay.
5. When an issued request becomes eligible again, restore its base row instead of treating it as a new landing.
6. Reset or replace the base at every real week load and whole-day replacement.

Add named tests for both draft and published days:

- Manually positioned row with changed times/extras → request delete/retype/move → Undo restores the exact row immediately.
- Redo removes it again.
- Neither direction records a day write.
- Immediate state equals reload state.
- Cover nested/projection command paths as well as direct Input-page commands.

This cannot safely be left as an implementation detail.

---

### 2. HIGH — The round-one marks disposition remains incomplete

The disposition for the hollow AL/OG finding describes where marks should appear, but not a mechanism that produces the correct target state.

#### Published-day reversal

**Scenario**

1. Publish a row with request value `A`.
2. Member edits the request `A → B`; reconciliation remakes the row and marks the changed field.
3. Member edits it back `B → A`, or performs Undo.

**Expected**

The pending mark disappears immediately because the day again matches the issued version. Reload must show the same zero-delta state.

**Result under plan v2**

`markEdit` is additive. Nothing in the reconciliation procedure clears a mark when the current value returns to the issued value. The live UI can therefore retain a hollow AL tag while canonical `dayDelta` is zero; reload then loses the stale mark.

Synthetic deletion marks are worse: `reconcileIssuedMarks` deliberately skips deletion keys, so delete → Undo cannot reliably remove the corresponding tombstone.

#### Unpublished-day OG attribution

Draft OG display does not use `SCHED.pending`. It requires a fresh persisted change-log entry with a schedule cell key. Input change lines currently use a null key, so read-time marking cannot preserve the original actor’s OG attribution across reload.

**Evidence**

- `src/engine/publish.ts`, `markEdit` and `markDeletion`: marks are appended.
- `src/engine/drafts.ts`, `reconcileIssuedMarks`: deletion/move/input synthetic keys are skipped.
- `src/engine/publish.ts`, `alAttr`: draft OG and published pending marks use different sources.
- `src/ui/changesmodel.ts`, `ogSet`: OG requires an applicable keyed change-log line.
- `src/state/changelines.ts`, `inputLines`: Input actions are logged without a schedule cell key.

**Required fix — change the plan before build**

1. After reconciling an affected published day, rebuild its pending marks from the current canonical live-versus-issued state—using or generalizing `rebaseDayPending`—instead of relying on append-only `markEdit` calls.
2. Rebuild request-derived addition/deletion tombstones as part of that same target-state calculation while retaining unrelated real holder edits.
3. For draft OG, persist the original Input actor and `iid`, then resolve that fresh Input line to the current `row.src === iid` row and relevant cell at display time. Do not manufacture new authorship during boot reconciliation.
4. Add tests for:
   - `A → B → A`
   - edit → Undo → Redo
   - delete → Undo
   - each case before and after reload
   - zero-delta states having no hollow AL, OG, or deletion mark

---

### 3. HIGH — `kept` has no exit transition and permanently detaches a row from its request

**Scenario**

1. Create and place a new request row.
2. Delete or move the request off its day.
3. The holder loads an older whole-day version, intentionally bringing the row back; v2 marks it `kept`.
4. Undo the request deletion/move, or later move the same request back onto the day.
5. Edit that request again.

**Expected**

While the request is absent or ineligible, the holder’s restored row remains protected. Once the same request becomes eligible on that day again, the row resumes normal request linkage and subsequent request changes reconcile it.

**Result under plan v2**

The model says the overlay leaves a `kept` row alone except for deleted-person stripping. No transition clears `kept` when its request becomes current and eligible again. The row can therefore remain permanently stale and ignore every subsequent request edit.

This also makes immediate state and reload behavior dependent on how long the sticky flag survives.

**Evidence**

- `phase6-plan.md`, §3(c), stored-day model: `kept` is assigned when a holder restores a row whose request is gone or no longer covers the day.
- The six reconciliation rules provide no transition from `kept` back to an ordinary source-linked row.
- The whole-day replacement procedure stamps or preserves `kept`, but likewise defines no later release.

**Required fix — change the plan before build**

Define `kept` as a conditional protection, not permanent detachment:

1. Preserve it while the request is absent, non-activity, or does not cover the day.
2. When the same `iid` again identifies an activity request covering the day, clear `kept`.
3. Compare `srcv`; remake the request-owned fields when it differs, preserving the holder-owned row ID, position, and permitted extras.
4. If the fingerprint already matches, simply clear `kept` and retain the row.
5. Continue respecting explicit `acc:"r"`/`acc:"u"` holder decisions.

Add tests for delete → restore old day → Undo, move off-day → restore old day → move back, and a subsequent request edit, with live/reload parity.

## Explicit negative results

- **Overlay doors:** I found no additional missing boot, saved-week, cross-week, peek/cache, or whole-day-replacement door beyond the state-lifetime failures above.
- **Command coverage:** I found no additional command-type authority error. Ground + Inputs remains inside its owning command; explicit scheduler placement remains with Accept/Ground/Unavail/Takeoff/schedule-edit commands.
- **Published-day rulings:** I found no separate new-data contradiction with D114, D174–D178, the 16 September ruling, or D363 once Findings 1–3 are addressed.
- **Reconciliation rule 6:** I found no independent duplicate-row failure requiring another finding.
- **Refusal removal:** Removing the unloaded-week edit/delete refusal does not introduce another distinct failure once all saved-week readers use the overlay contract.
- **Steps 2(a), 2(b), and 2(d):** Not re-reviewed except where phase 6(c) directly depends on their built mechanisms, as required by the round-two brief.
- **D56:** Every reported scenario begins with data newly created under the proposed model.

## Verdict

**BLOCK**

The plan needs revision before implementation. The after-command overlay is currently destructive without a reversible holder-authoritative base; its marks are not defined as a target-state calculation; and `kept` lacks a lifecycle back to normal reconciliation. These are contract-level omissions, not build-time checklist details.

