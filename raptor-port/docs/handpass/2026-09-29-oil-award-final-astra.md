# Final code read — `[OIL-AWARD-IS-A-GRANT]`

**Verdict: FIX-FIRST.** I found one MAJOR correctness gap, two MINOR audit/feedback defects, and one NIT cache defect. The MAJOR permits a newly created canonical award that the grid-specific path explicitly considers invalid.

## Coverage map

Reviewed from the least-shared surfaces outward:

| Surface/object | Visible sign in the app | Working gesture / consumer checked |
|---|---|---|
| Correction editor | Negative tracker row and figures-breakdown line | Create, reopen, edit and save a correction, including attribution |
| Mixed deletion | Confirmation naming bids and awards | One-day Delete, range Clear and block Delete; capture-before-confirm ordering |
| Undo/history | Undo/Redo labels and change-history lines | Per-entry `lw.ledger` records, mixed `lw.clear`, conflicts and replay |
| Award index and caches | Awards appearing on the correct grid day | Global award index, per-person date maps, merged-row cache invalidation |
| Grid award | `+OIL`, FO/HO badge and day-list entry | Create, edit and delete; award alongside work, leave, bid and automatic credit |
| Tracker and figures bar | Positive award rows and balance breakdown | Create, edit and delete the same ledger object from either door |
| Counters and warnings | Earned/awarded/corrections totals, balance and expiry | FIFO, unpublish counterfactual and bid-against-OIL warning |
| Persistence and lifecycle | Stable dates, author and entry time | `readLedger`, dropped legacy records, person deletion and `pastOnWar` |
| Roles and overlays | Admin controls versus member read-only views | All stages, own/other-person viewing, published and approved leave |

## Findings

### OA-001 — MAJOR — Awards over 365 days can be created or saved through the tracker and figures bar

**Classification:** The general ledger validation hole is **pre-existing**, but accepting an oversized **grid-origin award** through the tracker is **NEW in this build**. Before this build, the tracker edited only ledger grants, while grid awards remained war records and passed through a 365-day check.

**Scenario**

- **Setup:** As an admin, create a valid 1-day award on the war grid, or open the OIL tracker/figures-bar credit form.
- **Action:** Create or edit the award to `365.5` days and save it from the tracker.
- **Expected:** Every hand award follows one canonical invariant and is rejected with the existing “more than 365 days” validation.
- **What disproves correctness:** The tracker save succeeds. The ledger, balance and FIFO calculations accept `365.5`, while editing the same award through the day-list path would reject it.

**Evidence**

- The stated per-grant limit is defined at [warrecs.ts:118](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/engine/warrecs.ts:118).
- Shared ledger validation checks zero, half-days, date, reason and field lengths, but not the maximum: [store.ts:3388](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/store.ts:3388).
- Tracker/figures-bar creation relies on that incomplete validation: [store.ts:3437](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/store.ts:3437).
- Tracker edits also rely on it: [store.ts:3472](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/store.ts:3472), [OilTracker.tsx:316](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/ui/OilTracker.tsx:316).
- The two grid-specific paths separately enforce the limit: [store.ts:3935](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/store.ts:3935), [store.ts:3965](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/store.ts:3965).
- `git show 21869a2c:raptor-port/src/state/store.ts` confirms the shared ledger validator already lacked this check; the new build makes grid awards editable through that route.

**Exact fix**

1. Add the positive-OIL maximum check to `ledgerProblem`, the canonical validator used by both `grantTo` and `updateLedgerEntry`.
2. Apply it when `counter === 'oil' && amount > MAX_GRANT_DAYS`; do not impose it on negative corrections unless the owner separately rules that.
3. Keep or remove the duplicate grid checks, but make the shared validator authoritative.
4. Add tests proving:
   - `365` is accepted.
   - `365.5` is rejected from tracker creation.
   - `365.5` is rejected from the figures-bar form.
   - A grid-created award cannot later be changed to `365.5` in the tracker.
   - A rejected edit leaves the original award unchanged.
5. Walk the failed-save message at desktop and phone widths.

---

### OA-002 — MINOR — Editing a correction silently deletes its “Given by” attribution

**Classification:** **PRE-EXISTING**, confirmed against `21869a2c`. It remains relevant because it corrupts newly entered data, not only stored demo data.

**Scenario**

- **Setup:** Create a `-0.5` correction with a reason and “Given by: OC Ops”.
- **Action:** Reopen the correction in the tracker, change its date, amount or reason, and save.
- **Expected:** “Given by” is retained, or is visibly editable and changes only when the admin changes it.
- **What disproves correctness:** After saving, the figures breakdown no longer shows `(OC Ops)` and the stored entry has lost `givenBy`.

**Evidence**

- The creation form accepts `givenBy`: [CreditForm.tsx:88](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/ui/CreditForm.tsx:88), [CreditForm.tsx:135](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/ui/CreditForm.tsx:135).
- The negative tracker projection omits it: [oiltracker.ts:155](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/engine/oiltracker.ts:155), [oiltracker.ts:220](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/engine/oiltracker.ts:220).
- Opening a correction explicitly initializes the edit field to blank: [OilTracker.tsx:511](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/ui/OilTracker.tsx:511).
- Saving sends that blank value: [OilTracker.tsx:316](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/ui/OilTracker.tsx:316).
- The store interprets blank as removal: [store.ts:3482](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/store.ts:3482).
- The figures breakdown otherwise displays correction attribution: [CounterSheet.tsx:268](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/ui/CounterSheet.tsx:268).

**Exact fix**

1. Add `givenBy?: string` to the correction/debit projection.
2. Copy `LedgerEntry.givenBy` into that projection.
3. Initialize the correction editor from the existing value.
4. Either expose the same “Given by” input for corrections, or omit `givenBy` from the update patch when it is not editable so the store retains it.
5. Test create → edit → reload and assert that both the stored entry and figures-breakdown text retain the giver.
6. Add an explicit test for deliberately changing or clearing the field if that UI is exposed.

---

### OA-003 — MINOR — A mixed bid-and-award Clear has an incomplete Undo/Redo description

**Classification:** **PRE-EXISTING wording defect**, now carried into the new mixed `lw.cell` plus `lw.ledger` command.

**Scenario**

- **Setup:** Put both a bid and an OIL award on one person-day.
- **Action:** Confirm Delete, then use Undo and Redo.
- **Expected:** The confirmation, Undo/Redo label and history describe that both the bid and OIL award are being removed or restored.
- **What disproves correctness:** The command correctly changes both objects, but its label says only “removing X’s bid”.

**Evidence**

- Mixed clear emits cell changes and ledger changes in one command: [store.ts:2552](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/store.ts:2552), [store.ts:2652](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/store.ts:2652).
- `lwCellLabel` immediately selects the bid phrase when a request was removed: [describe.ts:164](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/undo/describe.ts:164).
- `lwLabel` returns that cell label before examining ledger award records: [describe.ts:185](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/undo/describe.ts:185).
- The award-description branch therefore runs only for ledger-only commands: [describe.ts:204](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/undo/describe.ts:204).
- Baseline comparison shows the old cell-only describer also preferred the bid phrase when a bid and manual credit were removed together.

**Exact fix**

1. Make `lwLabel` collect cell and ledger effects before returning a phrase.
2. Add composite descriptions for bid plus award removal/restoration.
3. Include the award count when several awards are cleared.
4. Preserve the existing simple phrases for pure-bid and pure-award commands.
5. Add tests around the real clear command, `describeEntry`, Undo and Redo for:
   - one bid plus one award;
   - one bid plus several awards;
   - bid only;
   - award only.

---

### OA-004 — NIT — Interleaved award dates cause false cache invalidation

**Classification:** **NEW in this build**.

**Scenario**

- **Setup:** For one person, insert award A on day 1, award B on day 2, then award C on day 1. Read the merged state once.
- **Action:** Make an unrelated ledger write for another person or pool and read state again.
- **Expected:** The untouched person’s award-date map and merged row retain identity; only affected people remerge.
- **What disproves correctness:** The untouched row receives a new object because the old awards are flattened as A/C/B while the ledger encounter order is A/B/C.

There is no numerical error, but this violates the plan’s cache-reuse/cost invariant and creates avoidable rerenders.

**Evidence**

- `syncAwardIndex` compares a newly encountered flat list with an old map flattened by date-group insertion order: [store.ts:917](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/store.ts:917).
- A changed award-map identity invalidates the merged row: [merge.ts:138](/C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/src/state/merge.ts:138).
- The current identity test covers a simpler one-award arrangement and does not exercise A/B/A date interleaving.

**Exact fix**

1. Construct the candidate per-date map first.
2. Compare old and candidate maps by:
   - identical date-key sets;
   - identical array lengths for each date;
   - identical entry identities and order within each date.
3. Reuse the old inner map when those comparisons pass, irrespective of ordering between different dates.
4. Add an A(day 1), B(day 2), C(day 1) regression test.
5. Assert row identity survives unrelated positive-award and non-award ledger writes.

## Checked and found nothing

- **Canonical storage:** New hand awards are positive OIL ledger entries. Automatic credit remains the only credit stored in the war. `readRecs` intentionally drops retired manual-award records; I am not reporting migration or legacy-demo-data issues under D56/D401.
- **All production award writers:** Grid `+OIL`, tracker, figures bar, award edit/delete and confirmed clear reach `lw.award`, `lw.ledger` or `lw.clear`. I found no positive-ledger writer incorrectly running as a standalone `lw.edit`.
- **Per-entry records:** `lwDecompose` emits one command record per ledger entry, and `applyLwRecord` upserts/deletes the exact opaque entry ID.
- **Counting:** Earned includes automatic credits only; awarded includes positive hand awards; corrections include negative entries. The reviewed paths do not double-count a ledger award as a war credit.
- **FIFO and expiry:** Positive ledger awards join the balance once; negative corrections consume it once; automatic credits retain their existing earning and expiry behavior.
- **Warnings:** The unpublish counterfactual removes the affected automatic credit but retains hand awards. The bid-against-OIL warning uses the combined tracker balance.
- **Grid rendering:** Positive awards appear on their fixed date; corrections never appear; `0.5` renders HO and other positive amounts render FO. Multiple awards remain distinct list entries.
- **Coexistence:** Awards do not clash with leave or work, can coexist with automatic credit, and do not move with a bid. The award-stays explanation is present.
- **Confirmed deletion ordering:** One-day, range and block clears capture exact award IDs before confirmation. An award created while a confirmation is open is not accidentally deleted by the older confirmation.
- **Conflicts:** Different ledger-entry IDs do not conflict merely because they belong to the same person/day; the same entry does. Undo/redo uses the entry date and exact before/after record.
- **Roles and permissions:** Award writes are admin-only. Members get read-only access to their own award details at every stage. The implementation and the §11 permissions table agree. The settled other-member visibility question was not treated as a finding.
- **Provenance:** Award `enteredBy` and `enteredAt` survive ordinary edits and persistence reads. Change-history lines are emitted per ledger entry with dates. The correction-specific `givenBy` loss is isolated in OA-002.
- **Person lifecycle:** `forgetPersonFrom` removes future positive awards while preserving past awards and corrections; `pastOnWar` recognizes positive ledger awards.
- **Demo seed:** The seed and its literal baseline test use the new automatic-credit/ledger-award split.
- **Reason policy:** The grid’s optional reason and tracker’s required reason were treated as deliberate, per the plan.
- **Fixed dates:** Tracker edits cannot move a positive award’s date; corrections retain their separately editable date behavior.

## Verification note

I inspected the requested plan, both review rounds, rulings, production/test diff, commit log, evidence sheet, scenario design and both walk scripts. The evidence sheet records the completed full gates and desktop/phone walk.

A fresh focused Vitest run could not begin in this read-only environment because Vitest was denied creation of its temporary client directory (`EPERM mkdir ...\Temp\...\client`). That is an environment limitation, not a product-test failure.

I made no edits. During the read, `oa-walk2.mjs` acquired an external uncommitted click/scroll adjustment; I neither created nor reverted it, and no production source was changed.

**Final verdict: FIX-FIRST**, specifically for OA-001. The other three defects should be covered in the same corrective pass, but they do not independently threaten OIL arithmetic.

