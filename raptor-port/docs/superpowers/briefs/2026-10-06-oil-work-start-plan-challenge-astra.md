**Astra’s independent plan challenge — OIL-WORK-START**

**Four changes are needed before proceeding.** Keeping the three calculation values in the issued OIL evidence is sound. The gaps are candidate sign-offs, changes to worked times without an amount change, pending-list folding, and the zero-minute flying-line boundary.

I read the full plan, brief, relevant rulings and specified code paths. I did not read the Sol report. Implementation edits appeared during this review, so code conclusions below refer to the plan’s stated baseline, `d584a2a8`, rather than those edits.

**1. High — the new pending comparison does not protect what the four signers approved**

The plan compares the **issued** day under old and current Logic values. Signatures must also protect the **candidate being signed**.

Two concrete failures:

- **First publication:** create a Saturday duty from 07:00–14:00. At a 361-minute threshold it earns FO. Obtain all four sign-offs, then change the threshold to 480 minutes. It now earns HO. There is no issued day, so `pendingKey` stays empty. The day content and existing `oilSignKey` are unchanged. First publication can proceed on signatures given for FO.
- **Amendment:** publish a two-hour Saturday duty, earning HO. Extend the working copy to seven hours and obtain the four sign-offs for the resulting FO. Change the threshold from 361 to 480 minutes. The issued two-hour duty remains HO under both thresholds, so the proposed `oilrv` comparison emits nothing. The existing time amendment is unchanged. The signatures remain valid although the amendment now publishes HO.

Schedulers and approvers see their approvals standing; the member receives an amount different from the signed candidate.

This breaks the publication/signature contract expressed in `currentBindNow`, and leaves D592’s changed-OIL acknowledgment incomplete. D103’s pending binding alone cannot cover an unpublished day or a rule change invisible on the issued baseline.

**Does main do this today?** Yes. The plan repairs some published-day cases but leaves both sequences possible for newly created data.

**Fix, in order:**

1. In `engine/oilev.ts`, add a deterministic projection of the candidate’s actual OIL outcome, calculated from the candidate day and freshly built evidence.
2. In `engine/publish.ts currentBindNow`, bind signatures to that projection as well as the existing evidence and pending keys.
3. In `signBoundOk`, compare it explicitly. Do not let `oilBoundOk`’s older-format fallback accept a changed new calculation.
4. Cover amounts and the consequential work times identified in finding 2. Preserve restoration when the same candidate outcome is restored.
5. Add tests through `setSign`, first publication and amendment publication for both sequences above, including reversing the Logic edit. Do not populate signer names directly.
6. Document any added stored signature field alongside the new evidence field.

**2. High — amount-only comparison hides changes to recorded work and leave clashes**

Worked times are a downstream record, not merely intermediate arithmetic.

Concrete example, with no unrelated warning changes:

- Publish an ordinary Saturday flight, take-off 07:00, landing 09:00, no entered reporting time.
- With a three-hour report lead and two-hour debrief, its recorded work is 04:00–11:00: FO.
- Change debrief to four hours. The candidate work becomes 04:00–13:00: still FO.
- The plan freezes the issued 04:00–11:00 correctly, but raises **no OIL pending change** because the amount remains FO.

Those two records have different consequences for an afternoon leave bid. `leavewar/sync.ts workSpans` stores the intervals, and `leavewar/engine/warrecs.ts creditWins` and `recContribs` use them for clashes. Under the proposed plan, the scheduler sees no OIL amendment to publish; `publishALDay` can refuse a rule-only republication as “No changes to publish.”

This contradicts D592’s instruction that a subsequent Logic change reads as pending and is applied on republication. The plan’s quotation from `oilEvidenceKey` does not authorize discarding changes to recorded working times.

**Does main do this today?** Main has the related, worse failure: the issued times move immediately. The plan would stop that movement but leave the correction invisible and potentially unpublishable.

**Fix, in order:**

1. In `engine/oilev.ts`, define one comparison projection containing each person’s amount, work envelope and canonical work intervals.
2. In `publish.ts oilDelta`, compare that projection for the same issued content and evidence under saved versus current calculation values.
3. Retain the fast check for unchanged values. Do not equate “same FO/HO” with “same OIL record.”
4. In `ui/pendlist.ts pendItemWords`, explain a times-only change, for example: “Full day unchanged; worked until 11:00 → 13:00.”
5. Test that ordinary reconciliation preserves the issued times and clash result; republication changes them; reversing the setting clears pending and restores signatures.
6. Replace the proposed blanket test “no amount movement → nothing pending” with separate tests for **no outcome change** and **times changed, amount unchanged**.

The builder’s amount-only reading is **contradicted in this concrete case**. No further owner decision is needed to implement D592 as recorded. Choosing amount-only despite this consequence would require an explicit new ruling.

**3. Medium — a request edit can swallow the separate Logic-change entry**

`publish.ts dayPendingItemsIn` currently treats the entire result of `oilDelta` as foldable into a request edit. That was written for the existing evidence-change entry.

Concrete sequence:

1. Publish a Saturday containing an acknowledged, timed duty request.
2. Edit that request’s times so its ordinary OIL evidence change qualifies for folding into the request’s pending item.
3. Change the full-day threshold so the **issued** request would also change amount, producing the proposed `oilrv:<di>` entry.

`oilMovedInputsOnly` checks request, decision and membership differences. It does not distinguish the new rule-change entry. When folding succeeds, `dayPendingItemsIn` suppresses **all** returned OIL entries and marks one request item `oilFold`.

The underlying delta can therefore contain a separate Logic change while the scheduler’s list merely says OIL moves with the request. The separate reason and count disappear; sign-offs and publication eligibility still consume the underlying delta.

That fails D592’s visible pending-change requirement and the D103 acknowledgment flow.

**Does main do this today?** The all-or-nothing folding code exists today. Swallowing `oilrv` is introduced by adding the second entry without changing that code.

**Fix, in order:**

1. In `publish.ts dayPendingItemsIn`, partition the ordinary evidence entry from `oilrv:<di>`.
2. Apply existing request folding only to the ordinary evidence entry.
3. Always retain the distinct rule-change item when present.
4. In `pendItemWords`, dispatch explicitly between evidence and rule-change entries.
5. Test request-only, rule-only and combined changes. Check the visible list, pending count, signature validity and stored amendment item count—not just `dayDelta`.

**4. Medium — the proposed start calculation can newly remove OIL from a zero-minute sortie**

Concrete case using permitted Logic settings:

- Saturday ordinary flying line; take-off and landing both 12:00.
- Entered in-time is 12:00.
- Nominal report lead remains three hours; debrief is zero.

Main computes 09:00–12:00 and credits HO. The proposed calculation produces 12:00–12:00. `dayOilWork`’s `w2` rejects that interval, so the crew receive nothing.

The zero debrief setting is allowed by `engine/rules.ts`. This is therefore reachable with new data, rather than an old-record compatibility concern.

D49 explicitly says an ordinary flying line with equal take-off and landing times still earns. The plan expressly promises to preserve that ruling.

**Does main do this today?** Not for this setup: it ignores the entered reporting time and retains the nominal three-hour span.

**Fix, in order:**

1. Add this exact regression to `engine/oilworkstart.test.ts`.
2. In `engine/oil.ts dayOilWork`, distinguish a readable, uncancelled ordinary zero-minute flying line from an absent/unreadable interval and from a zero-minute standalone shift.
3. Preserve an explicit earning marker for that ordinary-flight case when its calculated interval is zero; do not invent additional worked minutes.
4. Carry the marker through the usual evidence decisions and exclusions. In the shared amount calculation, preserve D49’s earning minimum when an eligible marker remains.
5. Verify that cancellation, blanket/item/person exclusion, unreadable times and zero-minute standalone shifts still suppress credit as before. Retain the existing equal-times warning.

The builder’s **later entered report shortens the day** reading is supported by D591–D592. It must coexist with D49’s explicit exception.

**Path inventory and answers to §6**

| Area | Checked path and conclusion |
|---|---|
| Calculation | `dayOilWork` → `oilDayWork` → `oilEarnedWork` → amount calculation. The proposed shared amount helper is appropriate. Preserve one first-to-last envelope, including gaps. |
| Evidence writer | `oilEvidence` constructs the live candidate. Capture the three values there by value. `oilEvidenceOf` reads a frozen block when present. |
| Publication and frozen copies | First publication and amendments use `daySnap`; EOD and correction/reissue must retain that same capture path. Issuances, saved weeks, stash and retired versions retain their own evidence. |
| Return to editing | `drafts.ts liveDay` removes issued evidence. A restored working copy must calculate from current Logic; historical snapshots must remain untouched. |
| Comparisons | `oilEvidenceKey`, `oilDelta`, `dayDeltaIn`, `dayPendingItemsIn`, `pendingKey` and `pendItemWords` all matter. Findings 2–3 address the missing behavior between them. |
| Signatures | `currentBind`, `setSign`, `signBoundOk` and `oilBoundOk` protect the four roles. Finding 1 covers the missing candidate calculation binding. |
| Figures | Both `oilDayFigures` **and** `oilFigureFor` call `amtOf`. Both must supply the matching evidence to the shared amount helper. |
| Other OIL readers | `oilEligible` directly calls `dayOilWork`; `oilItemCellHTML` uses `oilCapableItems`; `itemState` falls back to `oilItemDefaults`. These are additional readers beyond the plan’s named amount callers. |
| Leave War | `creditFrom` and both active/stashed branches of `desiredOilCells` must retain the matching snapshot’s values through pooling. `runOilPass` writes amounts and work intervals; those feed the grid, clashes, tracker and balance. |
| Publication consequences | `publishFlagsBids` and the Unpublish credit warning must consume the same frozen calculation. Unpublish/reissue must select the correct remaining or replacement issuance. |
| Roles and action order | Scheduler/admin edits, member request edits, all four signers, publisher and member-facing Leave War results were considered. Important orders include sign → Logic edit → publish; request edit + Logic edit; publish → edit → revert; stash/reload; and unpublish → correct → reissue. |

**(a) Is `oilev.rv` the right home?**  
Yes. These values belong with the evidence used by OIL. `snap.rv` currently serves printed face attributes under D186; `freezeWarn` is also hook-dependent and can return early. Do not make OIL capture depend on that path. Freezing resolved spans is a possible larger design, but is unnecessary for this bounded change.

**(b) What else remains live?**  
Person identity/eligibility lookups and the roster projection remain live. Normal posting/deletion handling retains historical identities and intentionally excludes the applicable future records. I found no additional demonstrated freeze defect there.

Calendar earning status, input windows/answers and placeholder membership are already represented in issued evidence. Live availability and other window settings are used when constructing the candidate, rather than replacing the issued block. OIL expiry policy remains separate from the earned amount. Insights must continue using live Logic under D482.

**(c) Is a reader missing?**  
Yes: explicitly account for `oilEligible`, `oilCapableItems`, `oilItemDefaults` and both callers of `amtOf`.

Make the capability/default helpers accept the relevant calculation options, and use the supplied evidence when evaluating an issued block. Prefer the evidence-aware work reader in `oilEligible`, including its frozen membership. I have not established a separate user-reachable issued-preview failure for every helper, so these are required coverage points rather than additional ranked defects.

**(d) Is amount-only comparison right?**  
No. Finding 2 demonstrates a consequential difference with an unchanged amount. Compare the recorded OIL outcome, including work times.

**(e) Can pending become invisible or republication fail?**  
Yes. Finding 2 can leave a times-only correction with no publishable amendment. Finding 3 can hide the distinct rule reason. Finding 1 shows the converse problem: signatures remain valid when the candidate calculation changed.

I found no separate inherent “cannot clear pending” problem if comparisons are deterministic: restoring the values restores the comparison, and publishing captures a new baseline.

**(f) Is the shared reporting reader correct for OIL?**  
For normal ordinary flights, yes. It supports per-activity formation specificity, earliest applicable stages and evening-before resolution. Its live `reportLead` dependency concerns standalone handling; the proposed ordinary-flight use does not take that branch.

Keep landing rollover, nominal fallback, and first-to-last aggregation. An evening-before report contributes to the scheduled day’s envelope without creating a previous-day credit. The work-hours bar’s different no-entry fallback is explicitly permitted by D592. Finding 4 is the additional D49 boundary.

**Explicit negatives and verification limits**

- I found no reason to change SC MAIN/SPARE, AVALON/BB, ordinary non-flying rows, or request earning decisions for half 1.
- I found no separate need to freeze `briefLead` for this OIL calculation or to change Insights.
- I found no migration requirement under D56. Missing `rv` must remain readable without throwing; old demo records are not a reason to expand the build.
- I found no missing primary publication capture point if `oilEvidence` writes the values and all issuance paths continue through `daySnap`.
- No files changed, server started or tests run. These are static plan-review findings, not runtime verification.
- **Walk:** not run — read-only plan challenge.
- **Rulings:** none this session.

Required changes, in order: **bind candidate calculations to signatures; compare worked times as well as amounts; preserve the separate Logic pending item; preserve D49 at the zero-span boundary; complete the reader wiring and add the corresponding regression cases.**

**PROCEED WITH CHANGES**

