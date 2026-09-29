# Round 2 red-team report

Reviewed at `ee4a427f`. This was a read-only inspection of the plan, both round-1 reports, the full rulings, and the named source files.

## §9 verification

| §9 finding | Result | Round-2 assessment |
|---|---|---|
| Fable D138 — D401’s short line lost its guard | **DONE** | Both the short and full D401 rows retain the requirement that an old-shape record must not break a load. |
| Fable F1 / Astra F09 — award index through both cache layers | **PARTIAL** | §2.3 correctly covers the outer store cache, `mergeWar`, `mergeRow`, award-only people/dates, identity preservation and `seedSources`. The reset design is incomplete: clearing the award index/version without invalidating store-local `LAST_LEDGER` and the `WARS` weak cache can return an empty or stale award merge. See R2-07. |
| Fable F2 / F3, Astra F04 — clearing paths and guards | **PARTIAL** | All named call sites are now listed, including `writeMany`, `deletableIn`, `clearRequestsAt`, `clearRecordById`, `setCell` and `cellProblem`. However, the confirmed award IDs are not carried into the delete command, so a second preflight may delete an award that was never named. See R2-02. |
| Fable F4 — `readLedger` drops provenance | **DONE** | §2.1 covers loading `enteredBy`/`enteredAt`, preserving them on edit, re-keying `enteredBy`, and testing reload and rename behaviour. |
| Fable F5 / Astra F10 — award permission row | **PARTIAL** | The physical `LeaveLedger` row predicate and member read-all award class are correct. The plan does not route the actual commands through that class at the command gate; current ledger writes and clears become `lw.edit`, which is authorized as a bid operation. See R2-01. |
| Fable F6 / Astra F11 — whole-ledger undo record | **PARTIAL** | Per-entry decomposition, apply, ownership, registry routing, batching and conflicts are correctly specified. The IDs used as logical-record keys remain recyclable, and Undo/Redo history is still dated today instead of on the award’s day. See R2-03 and R2-04. |
| Fable F7 / Astra F08 — reason rule | **PARTIAL** | Separate `grantTo` and `awardOil` commands with one validator correctly protect direct calls. But the proposed edit rule applies “existing reason cannot be removed” to every ledger pool, changing current non-OIL behaviour. See R2-05. |
| Fable F8 — re-dated award history | **DONE** | Awards cannot be re-dated. Correction date changes retain dated from/to words and `wdate`. |
| Astra F01 — D260 forbids re-dating | **DONE** | The full D260 row supports the settlement: an award never moves; remove it and give it again. The UI and store both enforce a fixed date. |
| Astra F02 — multiple awards close D261’s door | **DONE** | `ownAwardPresent` checks all contributions, routes multi-record cells to the day list, and keeps another person’s details closed. |
| Astra F03 — `pastOnWar` | **DONE** | The plan adds positive pre-cutoff ledger awards to `pastOnWar`, keeps past awards, removes only future positive awards on Delete, and leaves Archive non-destructive. |
| Astra F05 — amount reconstructed from FO/HO | **DONE** | The ledger amount is authoritative everywhere; FO/HO is display-only, and all named readers use the amount. |
| Astra F06 — correction arithmetic and caption | **PARTIAL** | The signed arithmetic and separate corrections row are correct. The caption instructions contradict themselves and omit the opening figure from the displayed equation. See R2-06. |
| Astra F07 / Fable N2 — recorder shown as giver | **DONE** | “Given by” appears only when typed; the live entrant is shown separately in the breakdown. |
| Fable F9 — `cellProblem` | **DONE** | FO/HO validation now returns the same “use +OIL or the tracker” refusal as the write path. |
| Fable F10 — `seedSources` | **DONE** | One `awardContrib` builder is specified for both store merging and seed-derived views. |
| Astra F12 — seed pin | **DONE** | The baseline must be captured literally before rewriting the seed, including the multi-day demo award. |
| Astra F13 / Fable N1 — D25 vocabulary | **DONE** | The plan uses earned-leave language and explicitly includes the touched `OilTracker.tsx` comment in the sweep. |
| Fable N3 — remaining call sites and documents | **DONE** | The several-award label, `openCredit`/`openAnyCredit`, retired note editor/import, `bids.ts` comment, `engine-rules.md`, and the no-op handover document are all named. |

## NEW findings

### R2-01 — BLOCKER — The award permission class is not connected to the command gate

**Scenario**

A member or incorrectly classified command invokes an award writer directly. The page and store may refuse it today, but the command envelope is still authorized as a bid edit. At the database translation step, award operations therefore do not demonstrably use the award row predicate that §2.6c carefully preserves.

**Evidence**

- The plan says `T.award` remains the positive-OIL permission class and every award door asks it: [plan:256](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:256>).
- A standalone Leave War persist currently emits `lw.edit`: [store.ts:1242](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/state/store.ts:1242>).
- `lw.edit` is authorized against `T.bid`, not `T.award` or `T.ledger`: [perms.ts:281](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/perms.ts:281>).
- `grantTo`, `updateLedgerEntry` and `removeLedgerEntry` call that generic persist route: [store.ts:3315](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/state/store.ts:3315>), [store.ts:3341](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/state/store.ts:3341>), [store.ts:3369](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/state/store.ts:3369>).
- `person.delete` also gains a positive-award deletion but its declared tables include `T.bid`, not `T.award`: [perms.ts:317](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/perms.ts:317>).

**Exact fix**

1. Add explicit command types for award create, update and delete, mapped to `T.award` with C/U/D respectively.
2. Route `awardOil`, positive-OIL `grantTo`, positive-OIL `updateLedgerEntry`, and positive-OIL `removeLedgerEntry` through those types.
3. Keep corrections and other pools on command types mapped to `T.ledger`.
4. Give an award-bearing clear a command declaration covering both the bid deletion and `T.award D`; an award-free member clear must remain a bid-only command.
5. Add `T.award D` to `person.delete` and any posting-delete command that removes future awards.
6. Test authorization at the command gate, not only at the UI and store functions.

### R2-02 — BLOCKER — Delete confirms one award list but can execute a newer list

**Scenario**

Admin A opens a block Delete and sees award X named in the confirmation. Before the second tap, Admin B adds award Y to one of those cells. Admin A confirms. As currently specified, the clear recomputes `awardsAt` and deletes both X and Y, although Y was never named.

This affects newly created data once the shared database is connected; D56 does not exclude it.

**Evidence**

- §2.5a promises that the offered, named and deleted records are one list, but later steps direct `deletableIn`, `writeMany` and `setCell` to query `awardsAt` again: [plan:176](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:176>).
- The current block sheet calculates the named awards separately, then calls `clearCells(sel.cells)` without those IDs: [SelectSheet.tsx:94](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/ui/SelectSheet.tsx:94>), [SelectSheet.tsx:113](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/ui/SelectSheet.tsx:113>).
- The one-day/range sheet has the same split: [BidPicker.tsx:285](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/ui/BidPicker.tsx:285>), [BidPicker.tsx:324](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/ui/BidPicker.tsx:324>).

**Exact fix**

1. Make the preflight return an immutable deletion proposal containing the award IDs, person/date addresses and amounts used in the confirmation.
2. Store that proposal when the first Delete tap arms the confirmation.
3. Pass it into `clearCells` on the confirming tap.
4. Inside the command, verify every proposed ID is still the same positive award at the same address and that no additional deletable award has appeared.
5. If the set changed, delete nothing and ask the user to review the refreshed confirmation.
6. Add intervening-add, intervening-edit and intervening-delete tests for one-day, range and block Delete.

### R2-03 — MAJOR — Per-entry undo keys use recyclable ledger IDs

**Scenario**

The highest-numbered award is removed, then a new award is created. `ledgerSeq()` scans only the surviving rows, so the new award can reuse the removed award’s ID. The per-entry design then treats two different awards as the same logical record for conflict detection, remote revisions and undo barriers.

**Evidence**

- The new design makes `entry.id` the logical-record key: [plan:236](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:236>).
- The current allocator derives the next ID from the highest ID still present: [store.ts:3284](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/state/store.ts:3284>).
- The undo contract requires stable IDs for logical records: [undo-contract.md:324](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/undo-contract.md:324>).

**Exact fix**

1. Replace `ledgerSeq()` IDs for new entries with opaque globally unique IDs, preferably UUIDs.
2. Keep existing `ol-N` and seed IDs readable; do not rewrite stored rows.
3. Inject a deterministic ID factory in tests rather than deriving identity from current array contents.
4. Test delete-highest-then-create, undo/redo across both records, and a delayed change for the old ID not touching the new entry.

### R2-04 — MAJOR — Undo and Redo history remains dated today, not on the award’s day

**Scenario**

An admin gives an award dated 10 October, then later undoes it. The original “given” line is on 10 October, but the Undo line appears under today because `logReversed` does not extract dates from `lw.ledger`. The audit trail therefore splits one award action across unrelated dates.

**Evidence**

- The plan requires award history from every door, and its door check includes Undo and Redo: [plan:328](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:328>), [plan:342](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:342>).
- `logReversed` extracts Leave War dates only from `lw.cell`; a ledger-only reversal falls back to `localToday()`: [changelines.ts:378](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/changelines.ts:378>), [changelines.ts:390](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/changelines.ts:390>).

**Exact fix**

1. In `logReversed`, extract valid dates from each per-entry `lw.ledger` change’s `before` and `after`.
2. Put award Undo/Redo on the award date.
3. For a correction whose date changed, add both old and new dates.
4. Fall back to today only when the ledger entry genuinely has no valid date.
5. Test Undo and Redo of a past award and of a re-dated correction.

### R2-05 — MINOR — The new edit reason policy changes other leave pools

**Scenario**

A CCL ledger credit currently has a reason. An admin clears that optional reason. Under §2.2’s proposed generic rule, the save is refused solely because the entry previously had a reason, although non-OIL pools are meant to remain unchanged.

**Evidence**

- The plan applies “required where the entry already had one” to generic `updateLedgerEntry`: [plan:97](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:97>).
- Current validation requires reasons only for OIL: [store.ts:3262](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/state/store.ts:3262>).
- An existing test expressly permits clearing a CCL reason: [store.test.ts:2307](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/state/store.test.ts:2307>).

**Exact fix**

1. For a positive OIL award, require a reason on edit only if that award already had one.
2. For an OIL correction, retain the normal OIL reason requirement.
3. For every other pool, retain its existing `reasonRequired(counter)` result.
4. Keep the direct blank-`grantTo` refusal and blank-`awardOil` success tests, and retain the CCL reason-clearing test.

### R2-06 — MAJOR — The correction caption is contradictory and not a complete equation

**Scenario**

A person has an opening figure and a correction. One builder follows the first caption sentence and omits corrections; another follows the final sentence and includes them. Either can still omit the opening figure even though the displayed rows include it.

**Evidence**

- The signed equation correctly includes `opening` and `corrections`: [plan:147](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:147>).
- The following caption first omits corrections, then makes them conditional, then says they are always named; it also omits the opening figure throughout: [plan:154](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:154>).
- The current caption already omits opening and corrections, so the implementation needs an unambiguous replacement: [counters.ts:378](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/engine/counters.ts:378>).

**Exact fix**

1. Replace the three caption instructions with one canonical caption: “Opening figure + earned by weekend/PH work + awarded + corrections − OIL taken − expired.”
2. State explicitly whether zero-value rows are hidden while the caption remains complete.
3. Test the caption and row sum with a non-zero opening and correction, and again with no correction.

### R2-07 — MINOR — Cache reset does not invalidate every award-cache input

**Scenario**

A test or world swap clears the award index. The next `getState()` sees the same ledger reference as store-local `LAST_LEDGER` and skips rebuilding it. Alternatively, resetting the award version to an earlier number lets a retained `WARS` weak-cache entry satisfy the version check. Awards then remain absent or stale.

**Evidence**

- §2.3 introduces store-local ledger identity tracking but says only that `resetMergeCache` clears the index and version: [plan:119](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:119>), [plan:129](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:129>).
- The per-war cache is a retained `WeakMap`, while the existing reset clears only row entries: [merge.ts:85](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/state/merge.ts:85>).
- The outer cache is separately held in the store: [store.ts:904](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/leavewar/state/store.ts:904>).

**Exact fix**

1. Make one reset operation invalidate `ROWS`, `WARS`, the award index, the outer `MERGED` result and store-local `LAST_LEDGER`.
2. Reassign the weak cache or use a monotonically increasing generation; do not reset a version to a value an old cache entry may already hold.
3. Test a reset followed by `getState()` with the same ledger reference and war objects.

## Checked and found nothing

- The builder’s D260 settlement is correct: an award’s date is fixed, and a wrong-date award is removed and given again.
- `ownAwardPresent` closes the multiple-award and award-plus-automatic-credit D261 cases.
- `pastOnWar` plus the proposed positive-only future filtering matches D299, D321 and D323.
- The award amount, rather than FO/HO, is authoritative across details, deletion wording, balances and FIFO.
- `enteredBy` and `enteredAt` are preserved through loading and edits, with `enteredBy` re-keyed alongside the person.
- Tracker boxes no longer confuse the recorder with the typed giver.
- The correction’s ledger classification, separate breakdown row and signed balance arithmetic are otherwise correct.
- The old-shape load treatment complies with D401 and does not attempt a stored-data conversion.
- The literal pre-rewrite seed baseline is not tautological.
- The `openCredit`/`openAnyCredit`, several-award label, retired note editor, source comment and document leftovers are all covered.

## Verdict: BLOCK

The core one-record design and the D260 settlement are sound, but implementation should not begin with the permission command gate disconnected or with Delete able to remove awards that were not in its confirmation. The remaining major findings should be repaired in the plan at the same time.

