Read an exported copy of commit **dcf9b56dc**, branch **claude/oil-later-209**. Blind review: no HANDOFF, evidence sheet or other reader’s report was read. No files were changed. This read-only session returns the complete report below rather than writing the report file.

**1. Revise: an answer can still remove an unpublished day’s signatures through the Logic comparison.**

Concrete sequence:

1. File a seven-hour Training input on a working day, then declare that day a holiday and leave OIL unanswered.
2. Sign CUR CK using Later. The full-day threshold is 361 minutes.
3. Raise that threshold to 480 minutes. The signature still stands: the unanswered input earns nothing under either setting.
4. Answer Yes through the next sign-off’s list, the input window or its bell.

**Result:** CUR CK disappears, contrary to D2801. The input now supplies work which earns a full day under the signature’s old settings and half a day under today’s settings.

**Cause:** [publish.ts:1676](/C:/rt/oil209/raptor-port/src/engine/publish.ts:1676), `oilRvBoundOk`, compares the stored rule values using **today’s input answers**. [oilev.ts:733](/C:/rt/oil209/raptor-port/src/engine/oilev.ts:733), `oilRuleShift`, therefore changes its verdict when an answer changes, even though the proposed signature OIL key stays identical.

I reproduced this with the proposed answer omission applied only in memory. Before the answer, CUR CK stood. Afterwards it was blank; the OIL key and pending key were unchanged. Removing the answer restored the name. This concerns newly created signatures, so D56 does not exclude it.

**Fix:** section A must cover the rule comparison too. Make its verdict stable against subsequent answer-only changes. That requires retaining enough rule/answer revision evidence to judge a rule change against the answers that existed when it occurred, rather than retrospectively applying it to later answers. Preserve detection of a genuine subsequent Logic change affecting answered work. Simply deleting `orv`, freezing its verdict forever, or refreshing every signature indiscriminately would open another hole.

Add the sequence above as a failing test asserting the **shown names and signing validity**, not merely equality of `currentBind().oil`. Include the subsequent genuine Logic change, parked plans and Undo in the repair’s tests.

**2. Revise: the foot can promise that Later signs when signing is already forbidden.**

Concrete sequence:

1. Open the OIL list by picking a sign-off name while every required time is filled.
2. Leave the list open and clear a Common Programme row’s end time behind it.
3. Read the foot, then press Later.

**Result:** the proposed foot still says “Later: Ace signs, and the next sign-off asks again”. Later closes the list, raises the missing-time refusal and writes no signature.

**Cause:** [OilDayList.tsx:123](/C:/rt/oil209/raptor-port/src/ui/OilDayList.tsx:123) decides whether to show the held signer using `holdStands`. That checks the squadron, date and plan, but not the signing refusal. [oilsign.ts:40](/C:/rt/oil209/raptor-port/src/ui/oilsign.ts:40), `writeSign`, correctly refuses the subsequent write. The existing time-guard tests cover the refusal but do not render and check this promise.

This is an existing, repeatable discrepancy the proposed wording preserves, not a stored-data problem.

**Fix:** suppress the signing promise whenever the current day fails the read-only time check. Use `timeRefusal` or `timeGapsOf`; do not call the toast-producing refusal function during rendering. Keep the write-time backstop. Keep Save’s existing ability to save answers while refusing the name.

Add a rendered test that opens the list, clears a time behind it, checks the foot, presses Later, repairs the time and confirms the next sign-off asks again.

**3. Revise the “unchanged publish note” claim: unanswered does not always mean nobody earns.**

Concrete sequence:

1. File Training on a working day, then make it a holiday and leave the OIL question unanswered.
2. In OIL Earn, explicitly switch one participant on.
3. Complete the sign-offs using Later and publish.

**Result:** the participant earns OIL through the scheduler’s override, while the publish note says the input has no answer “so nobody on it earns OIL”.

**Cause:** [sync.ts:2613](/C:/rt/oil209/raptor-port/src/leavewar/sync.ts:2613), `oilUnansweredLine`, assumes that every unanswered input credits nobody. However, [oilev.ts:260](/C:/rt/oil209/raptor-port/src/engine/oilev.ts:260), `earnsFrom`, explicitly gives an `allow` override precedence over an unanswered default. The OIL Earn control permits this for eligible inputs.

The engine probe confirmed an unanswered seven-hour input with an explicit allow produces a full day of OIL. This discrepancy predates the plan but remains reproducible with new data.

**Fix:** keep naming unanswered inputs, but derive any claim about who earns from the published evidence, including overrides. Say “nobody … earns” only when true for that input. Preserve the approved ordinary-case wording; put the exceptional wording through the words review. Test both a named participant and a placeholder participant credited by override.

**The remaining questions**

- **Ordinary answer-only writes:** the proposed omission works when the rule comparison described in finding 1 does not intervene. The list, desktop Inputs decision and input-window answer-only save write the same answer map. A personal bell opens that input-window route; a holiday bell opens the list. Stamping who answered and when does not itself enter the signature’s OIL projection.
- **Answers accompanying another change:** retain invalidation. The writers also cover creation, replacement of a person, changed hours or filing, and restoration from cancelled/information-only status. Keeping identity, people, type, filing, earning standing and window in the signature key preserves those distinctions. Focused probes confirmed that changed hours, cancellation and a newly arriving input still invalidate signatures.
- **Who earns versus whether the day can earn:** a Yes can change which participants earn without changing the day’s `earns` flag. That is intentional under D2801. It is not evidence that every other signature check is answer-independent—finding 1 is the counterexample.
- **Several-day inputs:** the evidence projection reads the answer for its own date. The list saves only unanswered dates within its requested range. Test one input spanning an unpublished and a published day.
- **Plans and restored versions:** plans retain their own signatures and bindings; their live evidence is rebuilt from current inputs. A plan on an already published day remains subject to the published-day pending comparison. Loading a published version does not by itself make the day “not yet published”.
- **Published days:** retaining answers in `oilEvidenceKey`, `insSeg` and `oilMovedInputsOnly` is correct. `pendingKey` uses the full comparison, even where the displayed pending list combines related changes. My probe showed one displayed OIL change, invalid signatures and publication waiting for signing. Restoring the published answer restored the signatures and removed the pending change. D2801 does not require preserving names here; D103 continues to govern.
- **Later and refusal handling:** removing the Later memory removes the mechanism that could consume an unanswered question after a refused write. A refused answer save still leaves the list open; a refused signature writes no name. Changed week, squadron or plan prevents the old hold signing elsewhere. Pressing another box replaces the hold and resets its picks. I found no new loop caused by removing the memory.
- **Last-box test:** checking the other three roles with `signRoleOk` is right, provided it runs only for a hold that still belongs to the displayed day and plan and is recomputed as the list changes. A stored name or a displayed name alone is insufficient.
- **No-line cases:** no rows and every row picked correctly need no foot line. Suppressing the partial-pick line on the last box avoids promising a remaining box. That suppression remains the plan’s stated interpretation awaiting Q1; it is not wording explicitly supplied by D2859.

**Tests and corrective inventory**

Alongside the three findings’ tests, add explicit coverage for:

- Later after making picks: no answers saved.
- Answer-only Undo/Redo, including names signed before the answer.
- Answer-only versus answer-plus-person/time/filing changes.
- A new input arriving after Later.
- Independent plan signatures and a published version loaded back.
- A second sign-off pressed while the list remains open.
- Last-box calculation after another signature becomes invalid or its scheduler appointment is removed.

The editable boxes on the Board, phone Board and Edit Schedule share `signoffHTML` and the delegated sign-off handler. Frozen published signer displays are separate readers and should remain frozen. No additional independent editable sign-off writer emerged from the search.

Beyond the comments already named in the plan, update the old-rule comments in `OilDayList`’s save/Later block and the affected tests’ headers. Explicitly amend AM11’s blanket wording and the current OIL ruling statement. Add the unpublished-answer exception to the lasting signature documentation. The absence of the newly quoted rulings from this exported copy is **not** a finding.

Checks performed: source tracing and focused engine probes with the proposed key change applied in memory. No browser walk or repository test-suite pass is claimed.

Rulings: none recorded; read-only review.

**Verdict: revise first.** The central change works in ordinary cases, and the published-day boundary is sound, but leaving `orv` untouched fails D2801. The plan also preserves two concrete false messages that its tests currently miss.