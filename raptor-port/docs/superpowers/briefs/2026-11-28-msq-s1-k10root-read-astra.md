**The plan needs changes before K10’s root is enabled. I found two high-severity and five medium-severity gaps.**

This is a static review of the plan against the supplied source and rulings. The failures below are predicted from those paths, not browser reproductions. No files were changed; no build or tests were run.

Source paths below are relative to `raptor-port/src/`.

**1. High — The proposed Person list permits a 149 record to be saved under 142’s bar**

**Place:** Plan §§2.2, 4.2(2), 5 and 7.3. Code: `ui/InputWindow.tsx` — `pickUnit`, Person picker and save paths; `ui/inputedit.tsx` — `offersFor`, `whoDoorRefusal`, `commitInputEdit`; `state/perms.ts` — `inputWhoProblem`.

**Failure:**

1. Nasty has an OML dated 6–9 July, originally in 142, still pending upchit. He moves to 149 on 16 July.
2. On 17 July, Saber, a master admin, opens that record from 142’s Inputs List. The plan deliberately keeps this route live because the original dates touch 142.
3. The proposed `pickUnit` nevertheless returns 149.
4. Saber changes Person to a man who belonged to 149 on 6–9 July and has no conflicting medical entry, then saves.
5. The resulting record belongs entirely to 149 by its person and dates, while the bar still names 142.

**Cause:** The opening check judges the original record. The picker follows its carried holder even when the window legitimately opened on the original squadron’s page. The save permission check allows a master admin to change both people; it does not check the resulting record against the page in view. Changing the picker fixes the direction described in §4.2 but opens the reverse direction.

**Exact plan change:** Specify which people may be substituted on each permitted opening page, preserving the existing moved person where necessary. Add a check of the complete proposed record against the opening/page rules before a write, including after confirmation sheets. Preserve the explicit own-record exceptions.

Add actual Person-change tests from both 142 and 149, asserting the bar, saved person, resulting squadron and whether a write occurred. Date changes and conversion to a group must receive the same check. This is the D2621 wrong-bar problem, not the deferred grant of new-admin permissions.

**2. High — A window remains writable after its subject moves to another squadron**

**Place:** Plan §§2.3, 4.1–4.2 and 7.3. Code: `ui/InputWindow.tsx` — the retained opening note, `held` and save paths; `state/store.ts` — `entryDue`; `state/units.ts` — `homeOn`.

**Failure:**

1. Nasty’s 6–9 July OML remains pending. He moved from 142 to 149 on 16 July and will move to 150 on 20 July.
2. On 19 July, Saber opens that carried record on 149 and types a remark.
3. Midnight passes. Nasty now belongs to 150; Saber’s own home, rights and selected 149 page remain unchanged.
4. Saber presses Save.

Under the specified retained-note design, the window still compares its captured 149 with the unchanged 149 page. It remains writable, although a fresh opening would identify 150 as the holder. The original dates touch only 142, so 149 no longer qualifies by either route.

**Cause:** The plan takes the holder answer once. Existing midnight navigation checks the signed-in person’s home and page rights, not the person named in this input. KR’s close-on-navigation rule does nothing because no navigation occurs. The master-admin permission check still passes.

**Exact plan change:** Retain the immutable opening note for the existing midnight and Undo protections, but add a separate current eligibility check when the subject’s homes or record change, and immediately before writing. Do not solve this by replacing the original note. Specify the hold/close behaviour when the window loses its valid page.

Add a mounted-window test where **another person** moves at midnight, plus the equivalent same-ID record replacement. Assert the real controls and absence of a write. A fresh `bornHeld()` calculation alone does not test the retained note.

**3. Medium — A historical Medical card on the intermediate squadron still opens held**

**Place:** Plan §§1, 3.1, 4.3, 7.1 M2 and 9. Code: `ui/MedicalView.tsx` — `mine`, `pend`, `open`; `ui/DocViewer.tsx` — `edit`; `state/inputsqn.ts` — proposed `holderOf`, `inputSqn`, `letOpenOn`.

**Failure:**

1. Use the same pending OML and moves: 142 → 149 on 16 July, then 150 on 20 July.
2. Today is 21 July. Saber selects 149’s Medical tab and “as of” 17 July.
3. The pending card appears because Nasty belonged to 149 on that day.
4. Saber opens its document and presses **Edit input**.
5. The original record dates touch only 142; today’s holder is 150. None of the proposed `letOpenOn` cases applies to Saber. The window opens held on 149.

**Cause:** Keeping historical roster filtering while determining ownership today creates an accessible intermediate-squadron card that neither ownership rule accepts. Section 9 addresses a future first move, not this retrospective second-move case.

**Exact plan change:** Add an explicit rule and implementation task for historical cards whose page is neither an original dated squadron nor the current holder. For example, route editing to the current holder before opening, subject to the required interface approval. Do not broadly permit writing from the historical page.

Add this exact two-move/as-of case to M2, including document-pager entries. M2’s existing “none born held” expectation would catch it, but the plan currently provides no implementation that can satisfy it.

**4. Medium — Completed leave returns to the first squadron after a later move**

**Place:** Plan §§1 rows 3–3b, 2.1–2.3, 3.2 and 7.1 H1. Code: `state/inputsqn.ts` — proposed non-medical `holderOf`; `engine/inputs.ts` — `inputSquadrons`, `inputUnitOf`; `ui/topstate.ts` — `openNotice`.

**Failure:**

1. Ranger’s approved leave runs 14–18 July, crossing his move from 142 to 149 on 16 July.
2. A bell line about it retains its original 142 stamp.
3. On 19 July, the proposed holder is 149, so Saber’s bell press enters 149.
4. Ranger moves again, to 150 on 20 July, after the leave has finished.
5. The same bell line now enters 142.

**Cause:** The non-medical algorithm returns the person’s **current** home only if that home occurs within the input’s dates. After the second move, 150 is absent from `[142,149]`, so the holder becomes null. The bell falls back to its 142 stamp, which the input touches.

A completed record that was carried to 149 therefore jumps backwards because of an unrelated later move. This conflicts with the plan’s “closed things stay” account of D2835 and D2847.

**Exact plan change:** Derive the last effective carrying move while the record remained open, retaining that holder after completion. Do not make a completed record’s holder depend solely on the person’s current home.

Add completed cross-move leave followed by a second move, including a return to 142. Assert actual bell navigation before and after the later move.

**5. Medium — An upchit for a later episode relocates an earlier, superseded episode**

**Place:** Plan §§1 row 1c, 2.1 and 7.1 H1. Code: `engine/medical.ts` — `pendingUpchits`, `medEpisode`; `state/inputsqn.ts` — proposed closed-medical branch.

**Failure:**

1. Nasty has an OML for 6–9 July and a separate ATT C for 12–13 July. Both began in 142.
2. The later episode replaces the earlier pending nag. Under the plan’s R2, the older OML stays with its original dates.
3. Nasty moves to 149 on 16 July.
4. An upchit dated 17 July closes the latest pending episode.
5. For the old OML, the proposed search also finds that upchit: it is the earliest one dated on or after 9 July.
6. The old OML now acquires 149 as its holder, and its bell line routes there, despite that episode having ceased to be outstanding before the move.

**Cause:** “Any upchit on or after the episode’s last end” is a person-wide suppression condition used by `pendingUpchits`. It is not an unambiguous link between an upchit and a particular historical episode. The plan treats it as that link.

**Exact plan change:** Define how the closing upchit is associated with an episode, bounded by intervening separate episodes. An upchit for the later episode must not retrospectively carry the superseded one.

Extend H1’s “replaced by a newer downchit, no upchit” case by subsequently adding the newer episode’s upchit. Check both episodes’ holders and bell destinations.

**6. Medium — A future upchit can carry an old record before the move happens**

**Place:** Plan §§1, 2.1, 2.3 and 7.1 H1/H4. Code: `ui/inputedit.tsx` — `upchitRefusal`; `engine/medical.ts` — `pendingUpchits`; `state/inputsqn.ts` — proposed closed-medical branch.

**Failure:**

1. Today is 10 July. Nasty’s OML ended on 9 July; his move from 142 to 149 is scheduled for 16 July.
2. A valid future-dated upchit for 17 July is filed. The current validation has no prohibition on a future upchit.
3. `pendingUpchits(10 July)` suppresses the pending entry because it sees that later upchit.
4. The proposed closed branch returns Nasty’s home on 17 July: 149.
5. A bell press about the original OML enters 149 on 10 July, before the move.

**Cause:** The closed branch uses the upchit’s home without checking whether the carrying move has happened. The `h === first` safeguard described in §2.3 is absent from that branch. Agreement with the Medical tab’s pending calculation does not establish that ownership transitions occur on the correct day.

**Exact plan change:** Separate medical status calculation from the effective date of transfer. Specify the holder before the move, after the move and after the future closure date. A future upchit must not cause an early transfer of the older record.

Add this sequence to H1 and the bell tests, checking 10, 16 and 17 July. This is a new ownership consequence of the proposed helper, not merely an old stored-data problem.

**7. Medium — The denied bell destination does not preserve the promised 149 page**

**Place:** Plan §§3.2, 4.3 case 3, 7.2 B4 and 8 K10-c. Code: `ui/topstate.ts` — `openNotice`; `state/belltap.ts` — `enterForLine`; `ui/msq-guard-input-sqn.test.tsx` — existing FINDING bell case.

**Failure:**

1. Hunter has his home/admin role in 142, Plan access to 149 and View access to 150. He starts on 142.
2. He presses the existing 149-stamped bell line about Osprey’s Training, which now belongs to 150.
3. Today’s route enters the stored destination, 149.
4. The proposed route instead requests 150. `enterForLine` returns `'no'` and leaves Hunter on 142.
5. The input then opens read-only on 142—not on 149 as the plan’s table and B4 promise.

**Cause:** A denied destination does not fall back to the line’s stored squadron. The read-only exception grants an opening on the current page; it performs no navigation. Starting the baseline check on 149 can conceal this difference.

**Exact plan change:** Specify the denied-destination route explicitly. Either preserve the existing permitted destination while retaining read-only status, or settle the changed experience through the drawings required by D2835 before enabling it. Remove the claim that the proposed single-line change inherently preserves today’s look.

Test the same bell press starting from each accessible page, particularly 142. Compare the resulting bar and read-only state before and after the change. K10-c’s baseline-only check is insufficient.

**What I found sound**

- Keeping record ownership independent of the viewer, with viewer-specific exceptions confined to the root, is a sound separation.
- Filtering Upchit Complete by the upchit’s dated roster addresses the ordinary closed-before-move case under D2846.
- Retaining read-only status for the window’s lifetime prevents a later permission grant from silently making that exception writable.
- Waiting for U2 and KR-4 before changing the bell route respects the stated overlap.
- The plan explicitly leaves the new-admin permission grant, Leave War, Tracker and remaining transfer listings to `[XFER]`. I have not reported those acknowledged deferrals as newly discovered omissions.
- Preserving historical date-based answers for schedule and OIL consumers avoids applying current ownership indiscriminately to historical calculations. The planner’s readings are also clearly labelled.

**Verification limits and required follow-through**

The supplied folder has no Git metadata, so I could not independently confirm its stated branch or revision. Access to the separate root patch was denied; its contents and clean applicability are therefore not verified by this review.

The next revision should resolve the seven cases above before root activation. Tests must inspect mounted windows, actual navigation and stored results. The existing `bornHeld()` helper recalculates ownership from current state; it cannot alone prove what a window’s retained opening note permits.

No concrete disappearance from both squadrons was established in this read. No new permission grant was identified in the proposed helper; the two high findings concern writes allowed under the wrong page despite otherwise valid master-admin permission.

Rulings: none this session.

