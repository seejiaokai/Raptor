# Sol’s independent plan challenge — OIL work start

**The plan needs three changes before proceeding:** bind sign-offs to the new calculation values, remove the amount-only pending comparison, and prevent a Logic change from being folded into a request edit.

This is a read-only, source-based challenge. I read the plan, the brief’s required rulings and code, and the two permitted earlier proposals. I did not read Astra’s plan-challenge report, change files, start a server or run tests.

The source baseline is the plan’s stated `main` revision, `d584a2a8`. Work began changing in the shared checkout during this review; subsequent source reads were pinned to that baseline. These findings concern the proposed plan, not the concurrent implementation.

## Ranked findings

### 1. HIGH — First publication can freeze an OIL calculation that the signers never approved

**Setup and action**

1. Create a new earning Saturday with 390 worked minutes.
2. With the full-day threshold at 361 minutes, obtain the four sign-offs. The candidate earns FO.
3. Change the threshold to 420 minutes without changing the day’s content.
4. Publish the Original.

**Failure**

The plan can publish HO using sign-offs given for FO.

`currentBindNow()` binds day content, filing, `oilSignKey()` and `pendingKey()`. The proposed `rv` is absent from `oilSignKey()`. Before first publication, `dayDeltaIn()` returns an empty delta, so `pendingKey()` cannot detect the Logic change either.

Adding `oilrv:<di>` to the published-day delta fixes neither that first-publication gap nor the general requirement to bind the signed candidate.

**Who sees it:** the signers and publishing admin approve one entitlement; the member’s new Leave War credit records another.

**Requirement broken:** the adopted OIL specification, §9.3, requires publication to freeze exactly the candidate whose signature was validated. D592 makes these values part of that candidate. D103 additionally governs pending changes once published.

**Does `main` do this today?** Yes. Its live Logic reads permit the same sequence with newly created data. The plan leaves that existing defect open; D56 does not exclude it.

**Exact fix**

1. In `engine/oilev.ts`, add a deterministic calculation-values key for `OilEvidence.rv`, using a fixed order for `reportLead`, `debrief` and `oilFullMin`. Return an empty key for a non-earning candidate.
2. In `engine/publish.ts`, include that key in `currentBindNow()` and compare it in `signBoundOk()`. A dedicated binding field avoids disturbing `oilKeyNoMem()` and the existing membership-key compatibility logic.
3. Ensure both Original publication and `alIssue()` validate and freeze the same derived candidate. Keep `daySnap()` as the shared freeze point.
4. Preserve reversible binding: changing a value invalidates the earlier signatures; restoring the signed values restores them.
5. Add regressions through `setSign()` and the real publication methods:
   - Logic change after all signatures, before Original publication;
   - Logic change between different roles signing;
   - restoring the value;
   - the corresponding AL and same-label reissue sequences.

Do not rely solely on `pendingKey()` for this protection.

### 2. MEDIUM — Amount-only comparison omits a real change to OIL’s worked times

**Setup and action**

Publish a Saturday with:

- entered In-time: 08:30;
- take-off: 12:00;
- landing: 13:00;
- debrief: two hours;
- full-day threshold: 361 minutes.

The issued OIL envelope ends at 15:00: 390 minutes, FO. Change debrief to three hours. The current calculation ends at 16:00: 450 minutes, still FO.

Choose an otherwise uncomplicated day so this change produces no separate warning delta.

**Failure**

The plan correctly retains the issued worked times, but creates no OIL pending item because FO remains FO. The scheduler cannot use the ordinary AL publication door to acknowledge that OIL calculation change alone.

Those times matter beyond the FO/HO label: the sync pass retains worked spans and uses them in downstream explanations and overlap checks.

**Who sees it:** the scheduler sees no OIL change waiting; readers retain the old worked record without the acknowledgement mechanism D592 promised.

**Rulings broken:** D592 explicitly says a later Logic-value change reads as pending. D45 requires freeze and acknowledgement together. D44 also establishes that the pending process cannot be reduced to whether money changes.

**Does `main` do this today?** It has the underlying defect, but manifests it differently: worked times recompute live without an OIL pending item. The plan fixes the freeze while leaving an acknowledgement gap.

**Exact fix**

1. Replace the plan’s amount-only test and its “same amount → nothing pending” regression.
2. In `engine/publish.ts:oilDelta()`, compare the three retained values against today’s values for a newly issued earning block. A changed retained value should produce the dedicated `oilrv:<di>` entry.
3. Keep that entry separate from `oil:<di>`. Do not insert the values indiscriminately into the existing evidence key and inherit its request-folding behaviour.
4. In `ui/pendlist.ts:pendItemWords()`, show the changed Logic setting. Where useful, show changed worked times as well as changed full/half results. A same-amount change must remain understandable.
5. Test the example above: issued times and credit remain fixed, the change is pending, earlier signatures become invalid, restoring the value clears it, and publication retains the new values.

**Builder’s reading:** the rulings **contradict** the proposed amount-only exemption. The comment that an evidence key records what a day credits concerns that key’s existing semantics; it is not an owner ruling permitting this exemption. There is no need to reopen the settled question before implementing D592.

### 3. MEDIUM — A simultaneous request edit can hide the separate Logic change

**Setup and action**

1. Publish an earning day containing a flying person and a separate accepted, timed Training request.
2. Change a Logic value so the flying person’s proposed entitlement changes.
3. Retime the Training request, keeping its identity and standing.
4. Open the pending list.

Repeat with those two edits in the opposite order.

**Failure**

The proposed `oilDelta()` returns both `oil:<di>` and `oilrv:<di>`.

However, `dayPendingItemsIn()` currently treats the returned array as one foldable group. `oilMovedInputsOnly()` examines the existing evidence fields and knows nothing about the new calculation-values axis. When the request accounts for the existing evidence change, the current branch folds **every** returned OIL entry into the request.

The promised independent “Logic values changed” line disappears. The raw publication delta still contains the change, but the visible pending list and count conceal its separate cause.

**Who sees it:** the publishing admin sees a request change without the independent Logic change they also need to acknowledge.

**Rulings broken:** D592’s visible pending requirement and D45’s acknowledgement principle.

**Does `main` do this today?** Not in this form. Its folding handles one OIL evidence entry. Adding a second, independent entry makes that existing branch unsafe.

**Exact fix**

1. In `engine/publish.ts:dayPendingItemsIn()`, separate the entries by address.
2. Apply `oilMovedInputsOnly()` and the existing request fold only to `oil:<di>`.
3. Always append `oilrv:<di>` independently as an OIL pending item.
4. In `ui/pendlist.ts:pendItemWords()`, dispatch the `oilrv:` address before the existing generic OIL/crowd wording.
5. Test both action orders and both reversions:
   - request and Logic changed → both causes visible;
   - request restored → Logic item remains;
   - Logic restored → request item remains;
   - both restored → nothing pending and the original signatures valid.
6. Check the visible count, publication eligibility, signature binding and stored amendment diff together.

## Reader, writer and consumer inventory

| Stage | Source path | Review result |
|---|---|---|
| Formation reporting | `engine/reporting.ts:resolveReporting()` | Suitable shared reader for ordinary flying OIL. |
| Raw scheduled work | `engine/oil.ts:dayOilWork()` | Add retained calculation values; preserve existing written-time/default rules outside ordinary flying. |
| Request work and decisions | `engine/oilev.ts:oilEarnedWork()` | Already joins frozen claims, standing, decisions and scheduled work into one result. |
| Derived candidate | `engine/oilev.ts:oilEvidence()` | Correct place to capture today’s three values without storing derived evidence on the live day. |
| Frozen work reader | `engine/oilev.ts:oilDayWork()` | Must pass retained values to the raw calculation. |
| Amount calculation | Proposed `oilAmount()` | Correct shared home for the threshold read. |
| First publication | `engine/publish.ts:setDayApproved()` → `daySnap()` | Captures evidence, but needs finding 1’s binding protection. |
| Amendment/reissue | `publishALDay()` → `alIssue()` → `daySnap()` | Shared freeze point; no separate OIL snapshot writer found. |
| Latest-version selection | `dayCurVerIn()` / `daySnapIn()` | Shared by loaded and stashed weeks; retain this authority. |
| Comparison and visible items | `oilDelta()`, `dayDeltaIn()`, `dayPendingItemsIn()` | Findings 2 and 3. |
| Signatures | `currentBindNow()`, `pendingKey()`, `signBoundOk()`, `oilBoundOk()` | Finding 1; pending binding remains necessary for published changes. |
| Working-copy restoration | `engine/drafts.ts:liveDay()` | Strips the entire `oilev` block, including nested `rv`; no extra strip operation needed. |
| Saved weeks and history | Existing snapshot/history storage | Nested values ride existing copies and serialization. No new store is needed. |
| Issued display | `ui/html.ts:withDaySnap()` and board/week renderers | Installs the issued day and evidence; the shared readers must honour that evidence. |
| Individual figures | `ui/oilmode.ts:oilDayFigures()` **and** `oilFigureFor()` | Both call `amtOf()` and must supply the displayed evidence to the shared amount helper. |
| Pucks and crowd summaries | `oilBarOf()`, `oilSeatHTML()`, `oilSentinelSummary()`, board renderers | Follow the shared individual figure; no new per-seat arithmetic is needed. |
| ALL / ALL AVAIL window | `ui/AvailWindow.tsx` | Uses the displayed world and `oilFigureFor()` for earning counts. |
| Raw eligibility/control reads | `oilEligible()`, `oilCapableItems()`, `oilItemDefaults()` | Make their calculation context explicit; see §6(c). |
| Actual credit landing | `leavewar/sync.ts:creditFrom()` / `desiredOilCells()` | Must retain the snapshot’s threshold alongside each date’s pooled work. |
| Reconciliation | `runOilPass()` | Existing forward/reverse pass consumes the desired credits. |
| Leave conflicts and withdrawal warning | `publishFlagsBids()`, `oilCreditBidAgainst()` | Read the shared issued-work/desired-credit chain; include in downstream verification. |
| OIL tracker, balances and counters | Leave War credit consumers | Consume landed credit records; no separate report/debrief calculation found. |
| CSV export | `ui/export.ts:schedRows()` | No exported OIL amount column; not another threshold reader. |
| Printed schedule | Shared schedule rendering | Verify issued green marks through the common evidence-aware figure reader. |
| Insights/work-hours/warnings | `events.ts`, `validate.ts` | Keep their current Logic behaviour under D482; do not replace global settings while drawing OIL. |

**EOD correction:** `[EOD]` is still deferred. I found no existing EOD publication writer to test. Amend the plan’s publication-path claim accordingly. The future EOD implementation must use the shared freeze point; this job should not build that deferred feature.

## Explicit answers to plan §6

### (a) Is `oilev.rv` the right home?

**Yes.** It belongs beside the evidence that determines earned leave.

Outer `snap.rv` currently supports a narrow printed-face rule, including the frozen brief lead under D186. Its capture is coupled to the warning/face machinery. OIL must work independently of that machinery, including through the stashed-week credit pass.

Freezing resolved spans would duplicate derived work and complicate comparisons. Retaining the three calculation inputs, the issued day and existing evidence is sufficient for this build.

### (b) What else remains live?

I checked the issued credit chain:

- earning-calendar status is already retained in `ev.earns`;
- request windows and answers are retained in evidence;
- placeholder membership uses retained `ev.sent`;
- scheduled times and reporting lines come from the issued day;
- archived/hidden people are not removed merely by a current roster-display change;
- the ordinary reporting branch does not gain an additional effective dependency on `reportLead` when resolving an entered clock.

Current labels, warning judgements and downstream spending/expiry policy are separate concerns; they should not be swept into an OIL-specific global freeze.

**I found no fourth calculation value requiring capture on this path.** The relevant missing protection is signature binding, not another frozen setting.

### (c) Is a reader missing?

The plan needs a more explicit reader checklist:

1. Change **both** `oilDayFigures()` and `oilFigureFor()` when changing `amtOf()`. The latter feeds individual bars, crowd summaries and the availability window.
2. Replace `oilEligible()`’s direct raw `dayOilWork()` call with the evidence-aware `oilDayWork(d, ev)`.
3. Where capability/default helpers are asked about an issued block, thread the retained calculation values through `oilCapableItems()` and `oilItemDefaults()`.
4. Keep evidence construction’s raw walk current: it is constructing the candidate, not reading an issued result.
5. Keep the bare `dayOilCredits()`/`dayOilSpans()` probe helpers distinct from authoritative issued-credit readers.

I checked the normal version-selection door: it closes OIL Earn mode. I therefore **do not claim a currently reachable issued-control defect** from the raw eligibility call alone. It is still a missing context propagation that the plan should close explicitly.

### (d) Is amounts-only comparison correct?

**No.** Finding 2 gives a concrete same-FO case where worked times change and the acknowledgement door disappears. D592 does not authorize that exemption.

### (e) Can pending become hidden, uncleared or unpublishable?

The material cases are findings 2 and 3.

Otherwise, I checked the following and found no additional defect in the proposed approach:

- restoring retained values can clear the new delta and restore signature validity;
- AL eligibility consumes the delta, so a correctly emitted standalone `oilrv:` entry is publishable;
- same-label unpublish/reissue has a real route;
- a stashed week can retain its credit and be loaded for correction;
- restoring day content alone does **not** restore global Logic values, so a remaining Logic item is legitimate;
- a block without `rv` can skip this comparison and remain readable, without a migration.

Do not let equality shortcuts use the rounded FO/HO amount to decide that a Logic item has disappeared.

### (f) Does the shared reporting reader fit D503/D505/D506/D42/D49?

**Yes, with the proposed ordinary-flying scope.**

I checked formation-specific versus general lines separately for each activity, earliest In-time/Rally, duplicate order independence, previous-evening conversion, unresolved fallback, overnight landing, cancelled structures and standalone exclusions.

No conflicting answer was found:

- a later-than-nominal entered report shortens the day;
- a previous-evening report lengthens the line’s own earning day;
- another earlier event still determines the person’s first start;
- gaps remain included;
- equal written take-off/landing retains genuine report/debrief work;
- SC MAIN/SPARE, AVALON/BB and their written-window rules remain outside this change.

## Builder’s readings

| Reading | Judgment |
|---|---|
| Entered report later than nominal shortens the OIL day | **Supported** by D591 and D592. |
| Unresolved reporting falls back to nominal | **Supported** by D592 and the shared resolver’s contract. |
| Previous-evening reporting belongs to the flying line’s own day | **Supported** by D503, D42 and D592. |
| No entered report leaves OIL nominal while work-hours may start at step | **Supported**; do not force the two readers to agree. |
| Changed worked times with unchanged FO/HO need no pending item | **Contradicted** by D592; remove that reading. |
| Older snapshots without `rv` remain readable using the existing fallback | **Acceptable under D56**; no migration finding raised. |

None of these requires a new owner question to implement the settled ruling.

## Required action orders and roles

The revised checks should cover these distinct sequences:

| Order | Required observation |
|---|---|
| Logic change before signing versus after signing, before Original publication | New candidate can be signed; earlier signatures cannot authorize changed values. |
| Reporting edit before publication versus afterwards | Candidate changes before issue; afterwards issued credit stays fixed and content is pending. |
| Logic change → request edit, and reverse | Independent Logic item survives request folding. |
| Logic change → calendar declaration/revocation, and reverse | Issued earning status and calculation stay retained; candidate changes are acknowledged together. |
| Change → restore value | No pending change; original signatures valid again. |
| Change → load issued content | Global Logic change remains visible unless the value itself is restored. |
| Publish → AL → withdraw/reissue | Latest retained version alone pays; retired versions remain readable. |
| Leave week → change Logic → return/reload | Off-screen credit remains retained; correction remains available. |
| Real Logic undo/redo and publication undo/redo | Values, snapshots, pending and credits return together through their actual commands. |

Use scheduler/admin roles for signing, publication and OIL decisions; an authorized settings admin for Logic changes; a member for their own request edits. Verify the same issued result for member and guest readers without offering write controls.

The runtime check should compare the actual Leave War credit, retained worked spans, OIL tracker result, shared schedule figures and pending words. Walk both phone and desktop. Test issued figures through the real read-only version view; opening its selector closes OIL Earn mode, so an artificially retained mode does not prove that production route.

## Explicit negatives and limits

- I checked the Original and AL freeze paths and found no separate snapshot writer bypassing `daySnap()`.
- I checked working-copy restoration and found no need for a second nested-`rv` removal.
- I checked the loaded/stashed credit authority and found no reason to reintroduce a live calendar gate.
- I checked the shared seat renderers and found no need for separate flying, duty, sim or ground threshold formulas.
- I checked standalone reporting and found no justification to widen this job to SC’s typed B.
- I checked the proposed freeze boundary against D482 and found no justification to freeze Insights hours.
- I raised no migration or historical-credit repair finding. Older versions must still load and read safely.
- These failures are source-traced scenarios for the builder to reproduce, not runtime observations.

**Walk:** Not run — prohibited by this read-only plan-challenge brief. FULL-tier build checks remain required.

**Rulings:** None; this report applies existing rulings.

**Required changes, in order:**  
1. Bind signatures to the retained calculation values, including before Original publication.  
2. Replace amount-only pending detection with the retained-value comparison required by D592.  
3. Keep the Logic pending entry independent of request folding.  
4. Complete the reader checklist and revise tests to cover the real publication, restoration and display routes above.

**PLAN: PROCEED WITH CHANGES**

