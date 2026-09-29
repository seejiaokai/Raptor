# Red-team report: OIL award one-kind plan

## Verdict

**BLOCK**

The ledger is the correct canonical store, but the plan currently contradicts D260, breaks the intended permission boundary, and keeps a ledger-wide undo record that is incompatible with D148 and the same-batch database-readiness requirement. Several specialized readers and visible doors are also missing.

## Method

> Do not merely review the plan's text. Starting from the user promise and the applicable rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of actions. Assume every line the plan lists may be correct and the defect may be a MISSING call site the plan never names. For each item, state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or most specialised surface.

## Coverage map

| Area | Required production sign and gesture |
|---|---|
| Stored objects | Automatic credit remains a war record. Positive OIL ledger entry is a hand award. Negative OIL ledger entry is a correction. |
| Grid | Each positive award appears on its date, including tracker-created awards and dates with no previous war record. HO represents 0.5; otherwise FO, while the displayed/details amount remains the exact ledger amount. |
| Day overlays | Automatic credit remains the main credit when applicable; award remains separately listed. Multiple awards appear as separate lines. |
| Award doors | Grid +OIL, DayList edit/delete, BidPicker remove, range Clear, block Delete, tracker create/edit/delete, figures-bar grant. |
| Read-only member door | A member can see every row’s award marker and open only their own award details at every stage. |
| Movement | Moving a bid never moves an award. The move sheet names awards that will stay behind. |
| Counters | Earned is automatic only; awarded is every positive hand award; corrections are separate; balance and FIFO use each ledger entry exactly once. |
| Other consumers | Awards do not create duty, manning, absence clashes, charges, worked hours, or input-gate conflicts. |
| Delete/clear | Confirmation names exact award amounts; the same confirmed records are deleted in the same command. |
| Person deletion | Future positive OIL awards disappear; past awards and the historical identity row remain. |
| Audit/undo | Original entrant and entry time survive edits; the editor is recorded in history; one gesture is one undo step, while conflicts remain per ledger entry. |
| Roles | Admin writes awards. Members read all award projections but only their own ordinary ledger data. Guests/pending users receive neither award data nor write access. |

## Findings

### F01 — Tracker re-dating directly contradicts D260 — BLOCKER

**Scenario**

- **Setup:** An admin gives an award dated 10 October. Its date establishes its grid position and expiry.
- **Action:** The admin opens it in the tracker and changes its date to 12 October.
- **Expected:** The date is immutable. A wrong-date award must be deleted and given again.
- **Disproves correctness:** The same ledger ID moves to 12 October or its expiry changes through Edit.

**Evidence**

- The plan expressly permits re-dating: [plan:147](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:147>).
- D260 says an award never moves and a wrong-date award is removed and given again: [.claude/decisions-full/oil.md:15](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/.claude/decisions-full/oil.md:15>).
- The current general editor accepts `date`: `src/leavewar/state/store.ts:3341-3363`.
- D265 governs a bid moving beside an award; it does not authorize moving the award: [.claude/decisions-full/leave-war.md:21](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/.claude/decisions-full/leave-war.md:21>).

**Exact plan fix**

1. In §2.5, replace lines 147–151 with: “A positive OIL award’s date is immutable. The tracker displays the date but offers no date editor. A wrong-date award is deleted and given again, as D260 requires.”
2. In the writer table, state that `updateLedgerEntry` rejects a `date` patch when the existing entry is a positive OIL award.
3. Keep date editing for corrections or other pools only if their existing behavior requires it.
4. Add tests proving:
   - the tracker has no award-date edit control;
   - a direct store date patch is refused;
   - grid date and expiry remain unchanged;
   - delete then give-again produces truthful removal/addition history.

---

### F02 — Several same-day awards can close the member’s only D261 door — MAJOR

**Scenario**

- **Setup:** A member has two awards on the same day in a confirmed or filed war.
- **Action:** The member taps their cell.
- **Expected:** DayList opens read-only and lists both awards separately.
- **Disproves correctness:** The cell is dead because `ownAwardOnly` no longer recognizes a marked `+n` cell.

**Evidence**

- The plan allows several awards: [plan:103-108](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:103>).
- Current opening logic requires a single unmarked own award: `src/leavewar/ui/Matrix.tsx:301-316`; multi-item cells route through `listOpen` around `Matrix.tsx:3513-3514`.
- D261 requires the member’s own award to open read-only at every stage: `.claude/rules/decisions/oil.md:48`.

**Exact plan fix**

1. In §2.3 and §2.6, replace `ownAwardOnly` with an `ownAwardPresent` rule that checks every contribution in `view.all`, not `main` and not `!mark`.
2. Make `cellOpenable` true for the signed-in person whenever at least one of their positive awards is present.
3. Route a multi-award cell to DayList; do not choose one award silently.
4. Keep another person’s details closed to the member.
5. Make test 11 exact: the +OIL panel says “This day holds N OIL awards — change them from the day’s list”; it neither adds nor rewrites.
6. Test two awards, automatic-plus-award, and the same cases at every stage.

---

### F03 — `pastOnWar` is an unlisted D299 reader — MAJOR

**Scenario**

- **Setup:** A deleted person’s only pre-cutoff Leave War fact is a past ledger award.
- **Action:** Person deletion and subsequent sync/roster reconstruction run.
- **Expected:** Their historical row and past award remain visible.
- **Disproves correctness:** The person disappears because `pastOnWar` searches only war records and Inputs.

**Evidence**

- `pastOnWar` currently knows nothing about ledger awards: `src/leavewar/sync.ts:1616-1630`.
- The plan’s deletion section handles future ledger filtering but does not name this retention reader: [plan:183-190](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:183>).
- D299 requires past OIL to remain after deletion: [.claude/decisions-full/people-accounts.md:30](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/.claude/decisions-full/people-accounts.md:30>).

**Exact plan fix**

1. Add `sync.ts pastOnWar` to §2.6’s reader list.
2. Make it regard a positive OIL ledger entry before the cutoff as historical Leave War presence.
3. In §2.6a, retain the existing precise scope: delete only future positive OIL awards; do not infer deletion of corrections or other pools.
4. Add a person whose only past fact is an award to the delete/archive tests.
5. Prove that the past award and row stay while a future positive award is removed on Delete.

---

### F04 — Derived awards are missing from clearing affordances and guard paths — MAJOR

**Scenario**

- **Setup:** A selected block contains an award-only cell—no raw request or war credit.
- **Action:** The admin opens Delete/Clear, confirms, or uses a range clear.
- **Expected:** The button is offered, the confirmation names the award and exact amount, and the same command removes it.
- **Disproves correctness:** Delete is absent, the empty-cell fast path skips it, or confirmation names an award that remains.

**Evidence**

The plan names high-level clearing paths, but not these concrete award-sensitive branches:

- `writeMany` skips cells with no raw request/credit: `src/leavewar/state/store.ts:2574-2582`.
- `deletableIn` counts only raw requests/manual awards: `store.ts:4300-4313`.
- `clearRequestsAt`: `store.ts:2650-2658`.
- `awardsIn`: `store.ts:2664-2681`.
- `clearRecordById`: `store.ts:2791-2803`.
- `cellProblem` still independently accepts FO/HO: `store.ts:2393-2416`.

**Exact plan fix**

1. Add all six functions to §2.5/§2.6.
2. Define one preflight helper returning the exact positive ledger award IDs for selected person/date cells after role, row, stage and window gates.
3. Use that result for:
   - whether Delete is shown;
   - the confirmation copy;
   - the actual deletion.
4. Remove the `writeMany` raw-list empty shortcut or make it consult the award helper.
5. Make request removal and ledger removal happen within one command/persist/notification/undo envelope.
6. Make `cellProblem('FO'|'HO')` return the same “Use +OIL” refusal as `setCell`, so UI validation and store behavior agree.
7. Test single cell, range, block, approved/filed leave plus award, award-only selection, and multiple awards on one day.

---

### F05 — Legacy code-derived worth can reduce a multi-day award to one day — MAJOR

The ledger shape itself preserves information. The danger is a reader recomputing worth from the derived FO/HO code.

**Scenario**

- **Setup:** A tracker award has amount `3`, expressly contemplated by D82.
- **Action:** It appears as FO on the grid; the admin opens details, clears it, or checks the figure/FIFO.
- **Expected:** Every detail, confirmation, balance and expiry allocation uses `3`.
- **Disproves correctness:** Any surface reports or removes `1` because it calls `creditWorth(FO)`.

**Evidence**

- The plan allows any half-step and derives FO for every amount other than 0.5: [plan:62-88](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:62>).
- Current `awardsIn` obtains worth from the war code: `src/leavewar/state/store.ts:2675-2678`.
- D82’s full ruling explicitly uses a three-day award: `.claude/decisions-full/oil.md:18`.

**Exact plan fix**

1. In §2.3, declare `amount`/`days` on the award projection authoritative; FO/HO is display classification only.
2. State that no ledger-derived award reader may call `creditWorth(code)`.
3. Update `awardsIn`, DayList, BidPicker, AwardSheet, change lines and undo descriptions to use the ledger amount.
4. Add one 3-day award test covering grid detail, clear confirmation, balance, FIFO allocation and undo.

---

### F06 — Correction separation is right, but the arithmetic and caption are incomplete — MAJOR

**Scenario**

- **Setup:** Opening 2, automatic earned 1, hand award 2, correction −0.5, taken 1.
- **Action:** Open the OIL figure and tracker.
- **Expected:** Awarded is 2; Corrections is −0.5; every displayed row sums once to 3.5.
- **Disproves correctness:** Correction is omitted from the caption, included in Awarded, or counted once in Awarded and again in Corrections.

**Evidence**

- Current tracker’s `granted` nets positive and negative ledger entries: `src/leavewar/engine/oiltracker.ts:304-320`.
- Current counter breakdown similarly treats the ledger as one net component: `src/leavewar/engine/counters.ts:325-339`.
- The plan splits corrections correctly at lines 123–128 but omits them from the caption at lines 129–130: [plan:123](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:123>).

**Exact plan fix**

1. Keep corrections separate from Awarded; D400’s Awarded means positive hand awards.
2. Specify the signed equation: `opening + earned + awarded + corrections - taken - expired`.
3. Define `awarded` as positive OIL entries only and `corrections` as negative OIL entries only.
4. Update the figure caption to include Corrections when present.
5. Split `CounterSheet` rows only for OIL; retain “granted” for other pools.
6. Add the exact arithmetic test above and a no-correction caption test.

---

### F07 — The tracker must not present the recorder as the giver — MINOR

**Scenario**

- **Setup:** Saber records an award without filling “Given by”.
- **Action:** A user opens the tracker box.
- **Expected:** It may show “Entered by Saber”; it must not claim “Given by Saber”.
- **Disproves correctness:** The fallback displays Saber under “Given by”.

**Evidence**

- The proposed fallback is at [plan:131-132](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:131>).
- D200 requires who entered it and when, which is different from who authorized/gave it: [.claude/decisions-full/people-accounts.md:68](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/.claude/decisions-full/people-accounts.md:68>).

**Exact plan fix**

1. In §2.4, remove the `givenBy ?? enteredBy` fallback.
2. Show “Given by …” only when `givenBy` exists.
3. Show “Entered by <live callsign>” separately, or omit it from the compact box and retain it in details.
4. Preserve `enteredBy` and `enteredAt` on edits; that part of §2.1 is correct.
5. Test edit by a second admin: original entrant/time remain; history names the editor/time.

---

### F08 — Optional grid reasons need a distinct command, not weaker store validation — MAJOR

**Scenario**

- **Setup:** A future caller or probe invokes the generic ledger grant writer with a blank OIL reason.
- **Action:** It writes directly, bypassing the tracker form.
- **Expected:** Generic tracker/figures grants are rejected; only the explicit grid-award command may accept blank.
- **Disproves correctness:** `grantTo` or a direct generic ledger call saves an unreasoned tracker grant.

**Evidence**

- The plan deliberately shifts enforcement to the door: [plan:92-99](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:92>).
- Current writer, edit path and form share one predicate: `src/leavewar/state/store.ts:3262-3281`, `3315-3329`, `3341-3366`.
- The current UI contract explicitly requires that shared enforcement: `raptor-port/docs/ui-contracts.md:7595-7607`.

**Exact plan fix**

1. Replace “the store accepts” in §2.2 with two explicit store commands:
   - tracker/figures grant: reason required;
   - grid award: reason optional.
2. Make `grantTo` retain reason-required validation for OIL.
3. Add `awardOilFromGrid` or a clearly typed validation policy used only by the grid door.
4. Do not encode the originating door in stored data; both commands still create the same ledger-entry kind.
5. Test direct blank `grantTo` refusal, direct blank grid award success, and blank tracker edit refusal.

---

### F09 — The award index/cache design does not cover both cache layers — MAJOR

**Scenario**

- **Setup:** The displayed war and absence rows are unchanged.
- **Action:** Add, edit or delete a ledger award.
- **Expected:** The affected row immediately changes; an award-only person/date appears; unrelated row references remain stable.
- **Disproves correctness:** The grid remains stale until another war/absence mutation, or every row is rebuilt.

**Evidence**

- The plan only says the merge cache “keys on” the award index: [plan:101-111](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:101>).
- `mergeRow` caches raw and absence identities: `src/leavewar/state/merge.ts:75-128`.
- `mergeWar` keys only on `ABS_VER`: `merge.ts:140-171`.
- The outer store cache also keys only on absence version: `src/leavewar/state/store.ts:904-914`.

**Exact plan fix**

1. In §2.3, specify `AwardRows` as a per-person/per-date index built only when the ledger reference changes.
2. Preserve unchanged per-person index identities.
3. Add an `awardVersion` to:
   - `mergeRow`’s cache key;
   - `mergeWar`’s cache key;
   - the outer `MERGED` cache in `store.ts`.
4. Include award-only people in the people union and award-only dates in row date construction.
5. Make `awardsOn` read this same index; do not rescan the ledger.
6. State the cost: O(ledger entries) when the ledger changes, then recomputation only for touched people; normal reads remain indexed.
7. Test add/edit/delete, award-only person/date appearance, immediate redraw, and unchanged-reference reuse for another person.

---

### F10 — Merging `T.award` into generic `T.ledger` cannot preserve permissions — BLOCKER

**Scenario A**

- **Setup:** A member loads the complete grid.
- **Action:** Database filtering applies generic LeaveLedger “read own” permission.
- **Expected:** Other people’s award markers remain visible because every grid row is visible.
- **Disproves correctness:** Other people’s awards disappear.

**Scenario B**

- **Setup:** Generic LeaveLedger permission is widened to “read all” to fix Scenario A.
- **Action:** The member queries ledger rows.
- **Expected:** They still cannot read other people’s corrections or other-pool entries.
- **Disproves correctness:** Those entries become visible.

**Evidence**

- Current data model distinguishes award read-all from ledger read-own: [data-model.md:1037-1039](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/data-model.md:1037>).
- Source permissions make the same distinction: `src/state/perms.ts:45-84`, especially lines 81–82.
- The plan says to merge `T.award` into `T.ledger`: [plan:178-180](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:178>).
- Matrix renders every person’s row: `src/leavewar/ui/Matrix.tsx:301-316`.

**Exact plan fix**

1. In §2.6 and §5, keep `T.award` as a semantic permission class even though its physical table becomes LeaveLedger.
2. Define its row predicate as `counter === 'oil' && amount > 0`.
3. Specify:
   - positive OIL award: admin CRUD, member read all;
   - all other LeaveLedger rows: admin CRUD, member read own;
   - guests/pending: no access.
4. Make `mayAwardOil` ask the award permission class.
5. Update data-model §11 and `state/perms.ts` without widening generic ledger access.
6. Add permission tests proving a member:
   - sees another person’s award projection;
   - opens only their own award details;
   - cannot read another person’s correction or other-pool grant;
   - cannot write any award.

---

### F11 — `lw.ledger/all` violates D148 and same-batch database readiness — BLOCKER

**Scenario**

- **Setup:** Admin A creates award entry A. Admin B or a remote update changes unrelated ledger entry B.
- **Action:** Admin A undoes their own award.
- **Expected:** A is removed and B remains.
- **Disproves correctness:** Undo refuses because the whole ledger revision changed, or replaces the whole ledger and loses B.

**Evidence**

- The plan intentionally retains the coarse record: [plan:192-201](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:192>).
- Current decomposition and apply use `lw.ledger/all`: `src/leavewar/state/store.ts:1046-1073`, `1110-1112`.
- D148 requires undo ownership/conflict behavior per signed-in person: [.claude/decisions-full/how-we-work.md:31](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/.claude/decisions-full/how-we-work.md:31>).
- The undo contract requires logical-record revisions: [undo-contract.md:123-136](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/undo-contract.md:123>).
- `[DB-READINESS]` requires small-piece persistence in this same batch: `OUTSTANDING.md:913-924`.

**Exact plan fix**

1. Replace §2.6b with per-entry records: `lw.ledger/<entry.id>`.
2. Change decomposition to emit one logical record per ledger entry.
3. Change apply to insert, replace or delete only that entry.
4. Retain gesture-level grouping: a batch award to N people is one command/envelope and one undo step containing N record changes.
5. Update the command-record registry, `ledgerLines`, undo ownership derivation, descriptions and landing-date logic.
6. Test:
   - single award undo;
   - N-person batch undo as one step;
   - unrelated remote ledger edit does not block and survives undo;
   - same-entry remote edit refuses and names the actor;
   - redo has the same granularity.

---

### F12 — The seed pin is internally inconsistent and could become tautological — MINOR

**Scenario**

- **Setup:** The seed rewrite is performed first and the expected balances are then generated from the rewritten seed.
- **Action:** Run the “before and after” test.
- **Expected:** It compares against a frozen pre-rewrite roster/FIFO baseline.
- **Disproves correctness:** A wrong rewrite passes because both expected and actual values come from the new seed.

**Evidence**

- §2.4 says the seed has “two hand awards”: [plan:117-119](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:117>).
- §2.8 correctly identifies four war awards plus two existing ledger awards and nine demo-world awards: [plan:217-224](<C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-continue-2cfa70/raptor-port/docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md:217>).
- Current seed war awards are at `src/leavewar/engine/seed.ts:201-220`; existing ledger grants at `seed.ts:265-275`.

**Exact plan fix**

1. Correct §2.4’s “two hand awards” statement.
2. Before rewriting seed data, capture a literal golden baseline of every person’s balance and relevant FIFO allocation.
3. Test all four moved seed awards, the two already-ledger awards, and the nine demo-world awards.
4. Include the 3-day demo award so code-derived worth cannot pass unnoticed.

---

### F13 — The plan and a touched source comment violate D25 vocabulary — MINOR

**Scenario**

- **Setup:** The builder follows the plan literally and updates the named tracker file.
- **Action:** Documentation and comments are reviewed.
- **Expected:** OIL is described only as earned leave, time off, or banked days.
- **Disproves correctness:** The forbidden finance-adjacent shorthand remains in the plan or touched comments.

**Evidence**

- The plan uses the forbidden term at lines 15 and 277.
- `src/leavewar/ui/OilTracker.tsx:40` contains the same vocabulary.
- D25 applies to UI, documentation and comments: `.claude/rules/decisions/oil.md:67`.
- `[OIL-WORDS]` says to fold the sweep into later work touching those files: `OUTSTANDING.md:458-463`.

**Exact plan fix**

1. Replace the wording at plan lines 15 and 277 with “earned-leave FULL tier” or equivalent.
2. Add `OilTracker.tsx:40` to the touched-file vocabulary sweep.
3. Add D25 to §1’s explicit ruling list.
4. Do not expand this into an unrelated repository-wide rewrite; fix the plan and files this batch touches.

## Checked and found nothing

- **Canonical store:** The ledger is the right one store. It is war-independent, already holds date, exact amount, reason and giver, and supports tracker/FIFO behavior. The war record is the wrong canonical home because it exists only inside a war.
- **Stored information:** The proposed ledger record does not discard amount, date, reason or giver. FO/HO is only a grid projection. The plan must enforce F05 so no reader mistakes that projection for the amount.
- **Balance:** With automatic credits removed from the ledger projection and awards removed from `earnsOil`, the intended balance has no inherent double count.
- **FIFO/expiry:** Reading positive awards from the ledger preserves current date/amount allocation. No algorithm change is required once exact amounts remain authoritative.
- **Unpublish warning:** Changing the omitted predicate to `source === 'auto'` is correct; ledger awards remain in the counterfactual balance. Current seam: `src/leavewar/sync.ts:1253-1276`.
- **Manning and duty:** Automatic schedule credits alone affect the relevant day-view duty logic. Ledger awards should remain inert: `src/leavewar/engine/dayview.ts:324-337`.
- **Charges:** Award contributions do not create leave charges: `src/leavewar/engine/charge.ts:181-195`.
- **Clashes and input gate:** D80 is preserved by keeping awards out of war-record occupancy and input-gate checks. `src/leavewar/inputgate.ts:208-223` is correctly automatic-only.
- **Bid movement:** The award remaining fixed while a bid moves is correct. `stayingIn` is already named in the plan; it must use `awardsOn`.
- **Correction classification:** Splitting negative corrections from positive Awarded is the correct reading of D400.
- **Entrant audit:** Preserving `enteredBy` and `enteredAt` on edit is correct. History, rather than overwriting those fields, records the editor.
- **Old demo records:** Dropping old `oil:'manual'` records on read is correct under D401 and D56. No migration or backward-compatibility finding is raised.
- **No-war dates:** A tracker award outside every war correctly remains ledger-only until a war covers its date, at which point the derived grid projection appears.
- **Automatic-credit publication:** The plan does not disturb the D142 publication boundary for schedule-earned credits.
- **Direct search coverage:** The additional material omissions found beyond the plan’s list are `pastOnWar`, `deletableIn`, the `writeMany` empty-cell shortcut, and `cellProblem`. Other searched `manual`, `oil ===`, `isCredit`, `kind === 'credit'`, `recordsAt`, `listAt`, `earnsOil` and ledger consumers were either already named by the plan or appropriately remain raw-war-only.

No executable tests were run; this was the requested read-only plan and call-site audit.

