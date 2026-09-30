# Astra — final code read of phase 6 (c) v3 (1 Oct 26)

*(Saved verbatim from Astra's final message — `codex exec -m gpt-5.6-sol -c model_reasoning_effort=high -s read-only`, the code at commit 37cb47d1; brief `2026-10-01-db-readiness-phase6c-check-final-read-brief.md`. Blind to Fable's report. Dispositions: the evidence sheet §The code reads.)*

# Astra final code read — REVISE

Reviewed `git diff 9191910b..37cb47d1 -- raptor-port/src`. The source tree itself has no uncommitted changes. I did not run a test: the existing tests exercise an off-date dead row, not the same-date `kept` row created while a request is Under Unavailable.

## Findings

### 1. High — live OIL can pay people from a dead `kept` row

**Files/functions:** [engine/oilev.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts:932), `landedRow`, `landedHasSentinel`, `landedExtras`, `pruneHandedOverDecisions`, `oilEarnedWork`; [ui/oilmode.ts](C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:827), `oilItemLabel`.

**Concrete scenario:**

1. On an OIL-earning Saturday, create an activity request and place it on the Ground Programme.
2. Put another person or ALL AVAIL on that row, then save it in Plan A.
3. Take the request off, file it Under Unavailable, and switch Plan A back in.
4. The row remains visible as `kept`, but it is not the request’s standing row because `acc === 'u'`.
5. Open Earn/OIL or publish the day.

`projectOilInputs` still projects the covered request and correctly records its standing as `unlanded`. However, the raw same-`src` lookup at `landedRow` finds the dead row. Its extra person or placeholder crowd is consequently eligible for FO/HO, its switches can be retained, and `oilItemLabel` describes the dead row as the live request item. Publication can freeze that wrong evidence.

It should use only a standing row for live evidence. The request holder’s own claim may still follow the request’s OIL answer, but nobody should earn merely because they appear on a dead holder artifact.

**Before (c):** Made reachable by (c). The raw helpers pre-existed, but the new `kept` behavior creates this same-date, covered, non-standing row in new data. The evidence sheet’s “not a defect by construction” conclusion overlooks `kept` rows caused by Unavailable filing, which still cover the day.

**Exact fix:**

1. Split the current raw resolver into explicit `liveRequestRow` and `documentRequestRow` helpers.
2. Make `liveRequestRow` resolve the request and call `standsOn(day, iid, request)`.
3. Use the live resolver in `pruneHandedOverDecisions`, live sentinel collection, live extras, and working-copy OIL eligibility.
4. In `oilEarnedWork`, select document mode only when consuming the day’s frozen `oilev`; otherwise select live mode explicitly.
5. In `oilItemLabel`, use the document row only for an issued day carrying frozen `oilev`. On a working day, use its standing row; if none stands, describe the projected request directly without row flags, extras, or placeholder state.
6. Add a test with an Unavailable request, same-day `kept` row, extra and ALL AVAIL. Assert no extra/crowd credit and no dead-row label.
7. Add the complementary issued test proving the frozen document still uses its raw issued row and frozen crowd.

### 2. High — loading a version cannot reproduce a published `kept` row and its non-ground filing

**Files/functions:** [engine/publish.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:721), `filingRestorePlan`, `dayDiscardCount`; [engine/drafts.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/drafts.ts:641), `loadVersionToWorkingCopy`, `leaveOut`, `markKept`, `dayAsLoadLeaves`.

**Concrete scenario:**

1. Save an activity row in Plan A.
2. Take the request off, file it Under Unavailable, then switch Plan A in. Its row is retained as dead `kept`.
3. Sign and publish that day. The issued version now legitimately contains the holder row plus filing `u`.
4. Accept the request onto the working day, making it live again.
5. Choose the issued version and press **Load onto working copy**.

`markKept` evaluates the incoming row against the current `g` filing and clears `kept`. `filingRestorePlan` then raw-matches the row and refuses to restore the issued `u`. The screen remains “on the programme” instead of returning to the issued Under Unavailable state, and the discard count predicts the same wrong result.

Simply changing the raw lookup to `standsOn` is insufficient: marking must be evaluated against the filing that the load will actually restore. Otherwise restoring `u` would remove the unmarked row in the following holder-base pass instead of preserving the version’s `kept` row.

**Before (c):** Made reachable by (c). Published versions containing deliberate dead `kept` rows are new.

**Exact fix:**

1. Create one pure “prospective version load” helper shared by `dayDiscardCount` and `loadVersionToWorkingCopy`.
2. Clone the incoming day, apply D175 leave-out and deleted-person stripping, but delay final `kept` classification.
3. Compute `filingRestorePlan` against that prospective day.
4. Do not let a row contained in the version’s own day prevent restoration of that version’s frozen filing. Only a standing row on another loaded day and the existing AM1 multi-day guard should block it. For target `g`, require the incoming version to contain the request row.
5. Build each request’s post-load filing from `plan.put` plus unchanged filings.
6. Run `markKept` against those post-load filings: target `u` keeps the row dead; target `g` clears `kept`; target `r` follows the existing rule that an orphan row may stand awaiting adoption.
7. Install that exact prospective day, apply the already-computed filing plan, then rebase pending marks.
8. Make `dayDiscardCount` compare against the same prospective result rather than independently approximating it.
9. Test `u + kept row`, `r + row`, and ordinary `g + row` issued versions; assert confirmation count, right-after state, and reload all agree.

### 3. Medium — an issued dead row is still treated as an issued placement

**Files/functions:** [engine/overlay.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/overlay.ts:289), `landRequests`; [engine/slots.ts](C:/Users/User/projects/Raptor/raptor-port/src/engine/slots.ts:496), `acceptInput`.

**Concrete scenario:**

1. Publish a day containing a `kept` request row that was dead when issued.
2. Delete that physical row from the working copy.
3. Undo the request action that moved or filed it away, so the activity request should become live on this day again.

`landRequests` sees any same-`src` row in the issued snapshot and concludes that the issued version placed the request. It therefore suppresses the new pending landing. The holder-base pass then clears the restored `g` because no standing row exists. The request remains off the Ground Programme after Undo and after reload.

The explicit **Accept** path has the parallel identity error: it may reuse the issued dead row’s `rid` and position, treating a new placement as restoration of an issued request row. Its amendment becomes field changes on a holder artifact instead of a genuine addition.

**Before (c):** Made reachable by (c); `landRequests` itself is new in (c), while the issued-ID reuse became unsafe once new published data could contain dead `kept` rows.

**Exact fix:**

1. Add one helper meaning “the issued document placed this request on this day.”
2. For current-format data, require a same-`src` issued row with no `kept` flag. Do not use the global issued `g` filing alone because a multi-day request may have been placed on another day.
3. Use that helper in `landRequests`; retain the separate issued-`r` suppression.
4. Use the same helper in `acceptInput` before reusing an issued `rid` and neighbour position.
5. If the issued row was `kept`, create a genuinely new row and structural-add mark.
6. Test a dead issued row followed by physical deletion and request Undo: the row must land with an add mark and survive reload.
7. Add controls proving a genuine issued landing is still suppressed/restored by identity and issued `r` still stays unlanded.

### 4. Low — an unrelated request change erases marks from a dead holder row

**File/function:** [state/holderbase.ts](C:/Users/User/projects/Raptor/raptor-port/src/state/holderbase.ts:75), `requestAddMarks`.

**Concrete scenario:**

1. Publish a day without a particular request row.
2. Bring that row back through a saved plan while its request is Under Unavailable, producing a pending, dead `kept` holder row.
3. Note its pending start, end, holder and remarks marks.
4. File or edit a different request on the same day; then Undo and Redo it.

Because the second request makes `ViewDayInfo.reqChanged` true, `requestAddMarks` examines every same-day `src` row. It does not require the row to stand. It therefore treats the dead holder row as a newly derived request row and deletes its start/end/remarks/holder marks whenever those values happen to match the request.

The row remains a holder-owned addition relative to the issued document, so an unrelated request must not alter its target mark state.

**Before (c):** New in (c).

**Exact fix:**

1. After resolving `r` in `requestAddMarks`, require `standingRow(row, r, d.dt)`.
2. Skip dead `kept`, retyped, off-date and unavailable rows entirely.
3. Retain the current field-mark reduction for genuine standing request-derived additions.
4. Add a test that captures the dead row’s complete pending set, changes and undoes an unrelated request, reloads, and asserts exact equality throughout.
5. Keep the existing control that a genuine new standing request row has the same marks as scheduler **Accept**.

## Explicit negatives

- **Holder base and persistence:** I found no defect in base reset after ID minting, absorption of scheduler-named days, request-only commands deriving from the unchanged base, refusal rollback, out-of-command absorption, week stash, or the post-pass row writer.
- **Undo/Redo and target state:** Apart from Finding 4’s non-standing-row mark cleanup, the base/marks reconstruction returns ordinary edit, delete, Undo and Redo paths to their target state.
- **Permissions and record ownership:** Member request commands and their inverses carry no day, book, mute or week-stash records. Explicit scheduler placement/removal still carries its held day. The ownership gate fails closed.
- **Standing-row consumers:** Accept’s one-row guard, card/row removal, `acceptedDay`, `reconcileDayFiling`, `rowsLeftOut`, event deferral, pending-list destinations, Changes-window navigation and the retype-removal message use the standing predicate correctly. Issued positional diff readers remain correctly raw.
- **Whole-day operations:** Plan switching, version leave-out, template stripping of `src/srcv/kept`, deleted-person stripping, physical row edits, ordering and direct row deletion otherwise preserve the holder’s selected object.
- **View doors:** Loaded-week commands, boot/load, saved `stashDays`, never-saved `bundle`, next-week peek and load-count simulation all invoke the shared view. I found no missing view door.
- **Published landing:** Genuine issued placements, issued `r`, deterministic collision-safe landing IDs and normal post-publish additions are correct; Finding 3 is specifically the issued-dead-row classification.
- **Issued OIL:** Frozen `oilev`, issued document rows and frozen sentinel membership correctly remain raw. Finding 1 concerns only working/live evidence.
- **History and visible destinations:** Change-history request lines, pending-list request pairing and Changes-window navigation no longer target a dead kept row.
- **Performance:** The desktop peek is signature-cached, saved-row lookup is blob-memoized, and never-saved bundles use the cheap landing/deletion guards. `stashDays` still reparses and overlays adjacent saved weeks during validation, but this read found no concrete correctness failure or demonstrable keystroke regression. No app/performance run was permitted by the brief.
- **Legacy data:** I did not report migration or old-data-only concerns under D56.

## Questions only the owner can answer

1. **When an issued version contains filing `r` plus a physical row introduced by a plan, should Load restore both exactly?**  
   Recommendation: yes. D98 says the load restores the version, and the existing rule already permits an `r` request’s orphan row to stand until **Accept** adopts it.

2. **When a live OIL request has no standing row, what should its item window display?**  
   Recommendation: keep the request item visible when its own OIL claim remains applicable, describe it from the current request and projected window, and show no row flags, extras or placeholder crowd. Never substitute a dead holder row.

