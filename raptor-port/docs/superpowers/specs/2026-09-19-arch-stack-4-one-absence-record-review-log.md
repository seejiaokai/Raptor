# [ONE-ABSENCE] Step 4 design — dual cross-provider red-team log (19 Sep 26)

Review of `2026-09-19-arch-stack-4-one-absence-record-design.md` (Rev 1, sha256
`f921a27f…`). Two independent reviewers, both a different model/provider from the Opus author.
Verdicts and findings below; the host (Opus) arbitrates each and folds warranted changes into Rev 2.

---

## Reviewer A — Codex / GPT-6 Astra (high) — VERDICT: REVISE

Read-only, verified against the code. Session `01a0b568…`, codex-cli 0.154.0. Summary: *"the
one-Input direction is sound, but the design leaves material lifecycle and projection defects
unresolved."* Seven findings:

- **ARCH4-001 (HIGH) — cross-week is NOT fixed for free.** §3's claim that global `INPUTS` dissolves
  finding I is wrong. The off-week edit/delete guards (`inputedit.tsx:836-845`) exist precisely
  because `dropInputRow` can't clean Ground rows in *stashed* weeks (`state/store.ts:540-558` clears
  per-week `acc` on nav; `slots.ts:539-562` removes a Ground row only from loaded DAYS). Displaying
  cross-week leave in the war does not exercise this. **Fix:** specify atomic cleanup/update of every
  affected week's working Ground rows + amendment bookkeeping incl. stashed weeks, one reversible txn,
  issued snapshots preserved; add a real off-week edit/delete/undo scenario with a landed `Other` row.
- **ARCH4-002 (HIGH) — approved-bid transitions + bid↔Input cardinality undefined.** The 4 commands
  ignore `setBidState` approved→refused, `clearCells`, `shiftBid`, `moveCells`
  (`store.ts:2125-2178,3213-3263,3341-3379`, callers in BidPicker/SelectSheet). Bids are date-keyed
  cells; `desiredRuns` merges adjacent cells into ONE Input (`sync.ts:173-201`) — so retracting one
  day of a 3-day approval ≠ deleting the whole linked Input. **Fix:** define stable bid identity,
  bid-to-Input cardinality, partial-span split semantics, every approved-state transition as atomic
  commands; state whether an approved move keeps approval or returns to pending; preserve remarks/links
  across splits; exclude retained request records from absence counting after the Input moves.
- **ARCH4-003 (HIGH) — the projection handler is under-specified.** It only handles Input changes +
  "the record's span". A deletion has no live record; a move/type-change must invalidate the OLD
  coverage too. Filing leave before a war exists produces no cells, and `createWar` later
  (`store.ts:3488-3502`) won't populate from an Input-only trigger (current inbound handles this via
  LW notifications, `sync.ts:1196-1215`). **Fix:** invalidate from the union of `Change.before` and
  `Change.after` (incl. delete, type/person change); recompute affected cells from ALL covering
  Inputs; include war creation/restoration, roster/config changes, boot hydration — or a pure selector
  whose cache deps cover these; add delete/shorten/reassign/retype/create-war-after-filing scenarios.
- **ARCH4-004 (MED) — "no stored copy" contradicts the write-cells + fold-into-undo instruction.**
  `rawPersist` serializes all wars (`store.ts:977-978`); `lwDecompose` registers every grid/state
  entry as durable `lw.cell`/`lw.bid` (`1074-1097`); `lwStore.write` persists restored entries
  (`1188-1205`); `undo/timeline.ts:235-245` stores their changes in the reversible closure. Projection
  origin does NOT make them transient — the prescribed write path keeps TWO persisted representations.
  **Fix:** settle the projection architecture first: keep approved-cell caches OUTSIDE serialization,
  record decomposition/revisions/inverse patches, rebuild from authoritative Inputs after mutations &
  restores; tighten §7's invariant to prohibit persisted approved-absence copies; cover reload/undo
  reconstruction.
- **ARCH4-005 (HIGH) — OIL cannot stay "untouched".** `runOilPass` uses `source:'raptor'` AND
  `clearRaptorCell` to update/remove earned credits (`sync.ts:957-993`); `oilCreditBidAgainst` needs
  the ownership marker to find withdrawable credits (`934-952`); `ingestDutyCredit` checks the shared
  grid for leave conflicts before crediting (`store.ts:3061-3081`). Retiring the marker/`clearRaptorCell`
  breaks credit withdrawal and makes leave invisible to OIL's conflict check. **Fix:** retire only
  leave-specific reconciliation; define explicit ownership+cleanup for derived OIL credits; make OIL
  collision checks consume the EFFECTIVE absence view; update the publish-withdrawal balance guard;
  specify precedence when leave and earned work cover the same date.
- **ARCH4-006 (MED) — many-Inputs-to-one-cell aggregation missing.** `runInbound` combines AM+PM
  Inputs of the same type into a full day and raises clashes for incompatible portions
  (`sync.ts:538-595`); the remarks lookup selects one matching row (`455-474`). A cell can't always
  identify one Input; a naive one-iid-per-cell projection undercounts two half-days or edits only one.
  **Fix:** define a projected cell's contributing Input IDs, portion aggregation, conflict
  representation; preserve same-type half-day combination + incompatible-type clash; specify which
  record a cell-level remarks/edit/retract targets; add same-type and mixed-type AM/PM scenarios.
- **ARCH4-007 (MED) — the balance WRITER reads the raw grid.** `setBalance` computes opening =
  target − grants + `drawnFrom(state.wars, …)` (`store.ts:2664-2673`), independent of
  `figureCtxOf().sources`. With pure projection, setting a balance to 20 with one approved working day
  present stores an opening of 20 from raw bid-only wars while the display shows 19. **Fix:** one
  effective `LeaveSource` selector used by BOTH readers and calculation-before-write paths
  (`setBalance`, `figureCtxOf`, OIL accounting, withdrawal guards); verify set-balance reaches the
  requested value with projected leave present and stays consistent after undo/reload.

## Reviewer B — Fable 5.1 — VERDICT: REVISE

Read-only, 53 code reads, anchors verified. Affirms the direction; four HIGH to fix before the owner
reads it, four MED build-shape decisions to pin, three LOW. Findings (abbreviated; full text in the
build spec):
- **F-1 (HIGH)** — the bid→approved path still stores the dates twice (grid cells + Input). Fix: at
  `approveBid`, REMOVE the bid's live cells from `grid`/`states`; the bid becomes a **request record**
  `{approved, inputId, askedFrom, askedTo, shiftedFrom?}`; the displayed cell is the Input projection
  only. Define the four admin grid ops (`shiftBid`/`moveCells`/`setBidState`/`setCell`) on a projected
  cell. **`shiftBid` on an approved bid is a LIVE 27 Aug feature (admin moves bids at closed/published)
  → raise as owner decision.**
- **F-2 (HIGH)** — §6 "route through the amendment path" is unfounded: **there is no amendment path
  for leave today** (leave never lands; `filingDelta` treats absent `acc` as no-delta, so a
  leave filed/retracted on a published day yields NO pending count / AL entry). **Raise as owner
  decision:** silent working-copy change (today) vs a real pending amendment; if amendment, needs
  `dayFilingFingerprint`/`filingDelta`/`computePubBar` changes.
- **F-3 (HIGH)** — same as ARCH4-005 (OIL). Fix via ONE `absenceAt(personId,iso)` predicate over the
  projection; replace every `raptorOwns` guard with `absenceAt()!=null || raptorOwns()`;
  `ingestDutyCredit` returns `'clash'` when `absenceAt` hits; composer never overlays projected leave
  on a stored FO/HO.
- **F-4 (HIGH)** — §4.3 rests on [SYNC-INTEG] **P2 (medical member-filed), which is NOT built**; the
  admin grid-medical path is live and step 4 retires its only outlet. **Make P2 a named PREREQUISITE.**
  Keep the two portion rules (`rowPortion`/`medRowPortion`) in the composer.
- **F-5 (MED)** — same as ARCH4-004. Commit to **pure projection**: in-memory `PROJ` map outside
  `state.wars`; `effectiveWars()` = stored ∪ PROJ; repoint ~10 consumers; projected records
  `{approved, source:'input', iid}`; no `lw.cell` for projected cells ⇒ undo closure carries only the
  `inputs` change.
- **F-6 (MED)** — undo folding holds, with two conditions: (a) the projection handler must run
  **synchronously inside the causing commit's delivery** (an idle `lwSyncTurn` becomes an orphan that
  sets a sticky barrier and refuses the earlier undo); (b) with stored cells, write only the delta.
  Pure projection makes (b) moot.
- **F-7 (MED)** — reset misses the **SEED**: `seed.ts` plants `source:'raptor'` cells in code. Remove
  them (seed matching Inputs); extend `reconcile()` to drop any `source:'raptor'` non-FO/HO record on
  load (a drift guard, not a migration); add the invariant test.
- **F-8 (MED)** — "Clear old data" deletes leave history that [RECALL] says is frozen; **P4
  (clutter-only) is a prerequisite** (or `retractAbsence`-by-sweep refuses leave/medical). State in §8.4.
- **F-9 (LOW)** — drop the "a re-file can re-link the certificate" claim (decision 3 already accepts an
  orphaned document) or specify a reattach control.
- **F-10 (LOW)** — command inputs must be **ISO, not `baseYear()` labels**; new commands must call
  `inputProtected` and **refuse with a toast** on a protected week.
- **F-11 (LOW)** — state clash precedence: the composer computes bid∧Input and split-half clashes and
  says which code the cell shows.

---

## Host arbitration & dispositions (Opus)

Both reviewers converge; the direction is affirmed by both. **All 7 Codex + 11 Fable findings are
ACCEPTED** (none rejected — each is code-verified and material). Overlaps: ARCH4-005≡F-3 (OIL),
ARCH4-004≡F-5 (pure projection), ARCH4-002⊂F-1 (bid cardinality), ARCH4-003⊂F-6 (handler),
ARCH4-006≡F-11 (AM/PM aggregation), ARCH4-007⊂F-5 (balance writer via `effectiveWars`),
ARCH4-001 (cross-week) stands alone. **Two findings surface NEW OWNER DECISIONS** the draft missed
and cannot resolve for him: F-1's "moved approved bid → keep approval or return to pending (a live
27 Aug feature)" and F-2's "absence change on a published day → silent or pending amendment." These
become §8 decisions 5 and 6.

**Rev 2 folds all of it:** (1) commit to pure projection (`PROJ`/`effectiveWars()`, out of
serialization) — resolves F-5/ARCH4-004 and the §4.2↔§9.1 contradiction; (2) the `absenceAt()`
effective-view predicate everywhere `raptorOwns`/OIL reads the grid — F-3/ARCH4-005; (3) bid becomes
a request record with `inputId`, cardinality + partial-span split defined, all approved-transitions
as commands — F-1/ARCH4-002; (4) the projection handler: invalidate `union(before,after)`, recompute
from ALL covering Inputs, cover war-create/restore/boot, run synchronously in delivery, change-guarded
— F-6/ARCH4-003; (5) AM/PM contributing-input-ids per cell + clash — F-11/ARCH4-006; (6) atomic
cross-week ground-row cleanup, §3's "free" claim corrected — ARCH4-001; (7) P2 + P4 named
PREREQUISITES — F-4/F-8; (8) seed removal + `reconcile()` drift guard — F-7; (9) ISO inputs +
`inputProtected` refusal — F-10; (10) cert re-link claim dropped — F-9; (11) clash precedence stated
— F-11. **Two new owner decisions added (§8.5, §8.6).**

**Not forced to a second red-team round tonight:** the design now legitimately BRANCHES on the two
new owner decisions (the moved-bid feature and the published-day amendment behaviour change what the
commands do). A Rev 3 + second cross-provider round runs after the owner answers §8 and before any
build — recorded as the gate. Both reviewers explicitly framed 5–8 as "decisions the doc should pin
now," which Rev 2 does.
