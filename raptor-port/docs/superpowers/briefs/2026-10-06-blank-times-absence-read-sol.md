1. **CHANGES REQUIRED**

Independent read by Sol. Two new findings: one deployment instruction can select unapproved code; one label fallback can suppress a separate warning. Findings below are source-derived, not personally reproduced in the running app.

2. **Findings, most serious first**

**F1 — High: “TOP row” can promote another branch’s preview**

Cause: [gates-and-deploy.md:58](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/gates-and-deploy.md:58) instructs the owner to promote the top deployment row. The comparison at line 60 checks the intended branch against the merge, without binding that comparison to the deployment actually selected.

Concrete failure:

- Approved branch A merges into `main`; no Production deployment starts.
- A’s branch head and the merge have identical content.
- Branch B receives a newer push, putting B’s preview at the top.
- Following the instruction promotes B.

Actual result: the instruction can send unapproved B content live. Expected: only the content approved for the intended merge may be promoted.

**Comparison with `main`:** this instruction is new; the bullet is absent there.

**Exact fix:**

1. Identify the approved merge commit and confirm its required checks.
2. Replace “TOP row” with an instruction to select a **Ready** preview whose branch and source commit have been explicitly verified.
3. Compare that **selected deployment’s source commit** against the approved merge; require an empty content diff. Confirm `main` has not moved beyond the intended target.
4. If the selected source cannot be verified, use “Create Deployment” for the approved `main` commit instead.
5. Verify Production completes for the selected, verified source.

The existing prohibition on an agent pushing an empty commit to `main` should remain.

**F2 — Medium: genuine titles `Sim` and `duty` are replaced, collapsing two warnings**

Cause: [validate.ts:845](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/engine/validate.ts:845) treats either string as an unnamed label for **every kind of row**. Ground titles reach the engine unchanged through `events.ts:478`. Warning deduplication at `validate.ts:683` uses code, person and message, excluding the row key.

Concrete new-data setup:

1. Add two Ground Programme items on Tuesday.
2. Name them exactly `Sim` and `duty`.
3. Give them distinct windows, such as 09:00–10:00 and 11:00–12:00.
4. Seat Vandal on both.
5. File whole-day LL for Tuesday.

Actual source result: both produce `On leave but tasked — this ground row`; the second warning is discarded as a duplicate.

Expected: two warnings retaining `Sim` and `duty`, each with its own row target. Clearing their hours should preserve those titles too.

**Comparison with `main`:** its timed loop uses the original label directly. Those two messages remain distinct. This suppression is introduced by the new fallback.

**Exact fix:**

1. Make the generic `named` helper replace only genuinely empty labels.
2. In `rowName`, recognise the artificial `Sim` label only for `kind === 'sim'`, and artificial `duty` only for `kind === 'duty'`.
3. Apply the corresponding duty-specific handling to the exempt-desk sentence at `validate.ts:959`; retain its newly fixed unnamed-desk wording.
4. Add failing regressions for Ground and Common Programme titles `Sim` and `duty`, both timed and blank. Assert retained names, two warnings and both row keys.
5. Retain the unnamed sim/duty/exempt-desk tests, then rerun the touched checks and walk both warning jumps.

Do not change global deduplication to compensate for incorrect wording.

3. **Absences against the two roll-calls**

**Seat roll-call:** I found no missing top-level collection family. The source covers ordinary flying; SC MAIN/SPARE; AVALON/BB MAIN/SPARE; exempt desks; ordinary and SC-linked duty desks; OFT/AMT seats, passengers and extras; handwritten and request-derived Ground rows; Common Programme members and extras.

For each qualifying person, the expected result is the applicable warning line, ring and chip, with a usable jump. Cancelled/info-only objects, placeholders and free-text sim “who” are excluded. Start-only rows retain their existing assumed window. The collection sites are `events.ts:303`, `404`, `449` and `465`.

The remaining defect here is **F2’s named-row case**, absent from the tests and walks.

**Reader and interaction roll-call:** the supplied evidence covers day and Board lists, drop toasts, many puck copies, published faces/version looks, pending/sign-offs, hides, Insights, Logic and dedicated exports. These gaps remain:

| Missing or incomplete verification | Required sign and gesture |
|---|---|
| **ALL AVAIL’s new-warning reader** | A displayed affected person must have the warning reason, appropriate flag/count and working tapped explanation. |
| SANS-card and crew-list puck copies as independent readers | The applicable absence mark must remain readable and reachable alongside their existing decoration. |
| Day-details window | Count and lines must agree with the document opened; a warning must jump to its cause. The source route exists at `html.ts:2240` and `2284`. |
| Within-shift MAIN-to-MAIN drag | Prediction must remove the source seat correctly; the destination bubble and placed warning must agree. Walker C explicitly says this move was not walked. |
| Rendered browser print | Inspect actual print preview for the selected document and hidden/visible flags. Dedicated export text does not establish this. |
| Short viewport and the listed overlays | Check readable marks and reachable gestures with selection, own-person fill, qualification/SANS/amendment/OIL markings, red boxes, open drawer and floating window. |

**ALL AVAIL is reachable.** The evidence sheet’s S29 disposition at line 196, repeated at line 310, overgeneralises the five activity inputs tried.

Use a fresh **whole-day ATT B**, seat Vandal on a blank flying line, then put ALL AVAIL on a timed Ground row at 15:00–16:00. ATT B permits ground work (`inputs.ts:201`); the crowd filter does not exclude it (`sync.ts:867–869`); the blank flight contributes no busy interval (`avail.ts:33`). His row should therefore display the new downchit warning through `personWarnMsgs` (`AvailWindow.tsx:177`, `html.ts:828`).

Walk its row, count, explanation and hide/unhide behaviour, then correct the evidence sheet. I found no source defect in this reader; its new-warning behaviour remains unverified.

The designer requests **12 filing orders plus 12 lifting orders**. Walker D records six of each. The orders where amendment precedes the final seat/absence action remain uncovered. Template restoration is correctly classified as structure-only; it does not restore a named seat.

Writers were examined across seating, text/time edits, input acceptance/removal, publication and restoration, with the supplied walks covering Inputs, calendar, Medical, Leave War and Unavailable. Source review found no new missing writer. Member/guest evidence covers limited scenarios, not the entire role/surface matrix.

4. **The eight claims**

| Claim | Assessment and source |
|---|---|
| **1. Every timed seat remains unchanged except Upchit** | **Does not hold.** F2 changes timed messages and warning count. Unnamed timed messages also deliberately change at `validate.ts:861`, `917`, `959`. Timed overlap arithmetic otherwise remains unchanged. |
| **2. Unmeasurable seats use only `whole`; collection is complete** | **Holds in source.** `validate.ts:848`, `924`; collection sites above. A collected non-flying row takes either the event or blank path (`events.ts:449–453`). |
| **3. `whole` has the right day, gates and own-row exclusion** | **Holds in source.** `events.ts:59–87`, `97`, `500–501`. Undeferred selection is confined to `whole`; the ordinary timed input route remains deferred. Midnight tails are added separately. |
| **4. Exemptions and words remain correct** | **Does not fully hold.** Exemption branches match the oracle (`validate.ts:926–934`), but F2 loses real names and warnings. I found no new invented clock in these absence sentences. |
| **5. Blank seats occupy no new time** | **Holds in source.** `events.ts:449` returns before event insertion. New blank entries do not enter the event/sacrew time calculations. Busy scans, work hours and downstream time calculations remain on their existing routes. |
| **6. Published warnings freeze; later changes are pending** | **Holds in source, supported by supplied evidence.** `validate.ts:1634–1674`, publication snapshot/signature handling and `latepub.test.tsx:890–925`. These absence codes are not added to the live-on-face set. No reviewer runtime confirmation. |
| **7. Shift sibling prediction and exempt-seat guards are right** | **Holds in source.** `validate.ts:2015–2024`; held-seat exclusion at `2030`; source removal and cloned probe at `2032–2036`. The shared evaluator supplies the forward answer. MAIN-to-MAIN drag still needs the missing walk. |
| **8. Tests prove all stated coverage** | **Does not hold as a complete proof.** F2, the reachable ALL AVAIL case and the gaps above are uncovered. The older changed pins follow D605 and retain meaningful negative controls. Oracle cells match the timed exemptions and input metadata. |

5. **The two meaning reads**

**D605:** the short line at `scheduler.md:49` preserves the full row’s rule. Removing “NOT YET BUILT” changes status, not meaning.

Reading **(6)** accurately describes the implemented whole-day selection and explicitly identifies the wider activity-input scope as the agent’s interpretation, open to the owner narrowing it. Reading **(7)** accurately states that the crew list remains unchanged; its standby mismatch is now filed. I cannot independently establish the historical assertion that these readings were already delivered to the owner.

**“VERCEL CAN MISS A MERGE”:** **requires correction for F1.** Promotion must be tied to a verified deployment source, consistent with approval of the intended content. Also replace “Waiting longer does not bring one” with the bounded observation that waiting did not resolve the recorded incident.

6. **Explicit negatives and limits**

I checked and found no new missing top-level collector, exemption mismatch, timed double-speaking caused by the undeferred ask, Upchit bypass past the shared gate, blank-seat time contamination, or published absence warning deliberately made live. I found no permission, persistence-writer or storage-format change in this patch.

I did not repeat the already-filed exclusions as new findings and found no demonstrated worsening of them.

I did **not** open any file ending `-read-astra.md`. I read the allowed scenario report and walker summaries independently. I did not inspect their image collection, raw walk records, unrelated source in full, or the full reference implementation. I ran no server, browser walk, build, deployment or heavy suite.

The permitted single-file test attempt, `npx.cmd vitest run src/engine/blankabsence.test.ts`, stopped **before collecting tests** because the read-only sandbox refused temporary-directory creation. No tests completed. The evidence sheet’s final-gates section is still unfilled, so I cannot certify final gates.

Confidence is high in the two deterministic source findings; visual and runtime confidence is limited to the supplied reports.

**Walk:** not run — read-only reviewer.  
**Rulings:** none.

