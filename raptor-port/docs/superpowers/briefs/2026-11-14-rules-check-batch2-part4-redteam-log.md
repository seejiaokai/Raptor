# Red team of the plan's part 4 (D2014) — the log (chat 77, 14 Nov 26)

Brief: `2026-11-14-rules-check-batch2-part4-redteam.md` (this folder), the same to both readers, each blind to the other.
Plan read: `docs/superpowers/plans/2026-11-14-rules-check-batch2-plan.md` at `354cfc1dc`.

## Reader 1 — a fresh, blind Opus reader (a subagent of chat 77), saved word for word

**Verdict: BLOCKED.** Part 4 should not be built until the owner answers a corrected question (finding 1). If he picks the plan's design, it needs the revisions in findings 2–4 before building.

### Findings, most serious first

**1. BLOCKING. The plan's reading of D2014 contradicts D2014's own row, and the question he answered had a wrong premise.**
- **What the code does today.** The published OIL already keeps its "Full day of OIL" line, and has since 6 Oct.
  - The frozen block's kept values include the full-day line (`oilev.ts` `OilEvidence.rv`).
  - The amount reads the kept line (`oilAmount` → `kept.oilFullMin`).
  - The Leave War credit reads the frozen block (`leavewar/sync.ts` ~1838).
  - `leavewar/oilworkstart-published.test.ts` pins it: "the full-day threshold, both ways", with `oilFullMin` 300 and 480.
  - The plan says so itself: "the published OIL itself never moved".
- **What he was asked.** D2014's question premise was "today that day's OIL changes at once, without publishing again". D2014's row repeats it: "as built 12 Nov 26 the OIL of a published day reads today's settings". Both are false.
- **What actually happens "at once".** Three things: the day reads "1 pending"; the sign-offs drop; OIL Earn on Edit Schedule shows the new figure. Of these, D592 (4) explicitly rules that "a Logic value changed afterwards reads as a pending change and moves the OIL only when the day is published again".
- **What the row says about pending.** "Whether the day then reads pending follows D592." Followed as written, that means it still reads pending, which is the opposite of the plan's design.
- **Why the plan's override reasoning fails.** The plan says the later ruling (D2014) wins over D592 for the full-day line. But D2014 itself defers the pending question to D592, so there is no clash to settle by date. What the plan builds is the agent's own new reading, never put to him.
- **Effect on the plan's analogy.** The plan's model, "as every other setting does (D2005/D2013)", fits settings that only judge checks. The closer match for a value that shows on the published record is D186's printed brief lead, which still reads pending. Under the plan, "Nominal brief lead" and the OIL report lead and debrief would read pending at once, while "Full day of OIL" would not. That makes the Logic page less uniform, against D754, until a second ruling.
- **Fix to the plan.** Before building part 4, put ONE corrected question to him, covering all three OIL values (report lead, debrief, full-day line) with a worked Saturday and pictures:
  - **A (as built, D592 (4)):** the published OIL keeps all three. A change reads "1 pending" and takes the four sign-offs down. The OIL moves only when the day is published again.
  - **B (the plan's design, all three):** nothing reads pending until another change waits on the day; the OIL moves with that amendment.

  Under A, part 4 is only comments and records: `faceattrs.ts`, `rules.ts`, the `oil.ts` head, the `oilev.ts` rv doc, `engine-rules.md`, D2014's row with its premise corrected. Parts 3 and 5 should also stop saying the full-day line is kept "since part 4": the OIL block has kept its three values since D592 (6 Oct). Building B for one value and then asking about the other two risks building it twice.

**2. BLOCKING (if B). The pending count and list are a second path the plan never touches.**
- **The cause.** The count, the "To go out" list, the changes window and the amendment's item count all read `dayPendingItems` → `dayPendingItemsIn`. That function calls `oilDelta`, `warnDelta` and `hidePending` itself (`publish.ts` ~356, ~387, ~390–399). It does not read `dayDelta`. The comment there says the two "must never disagree (Fable F1, Astra 4)". Plan step 2 changes only `dayDeltaIn`, `dayDeltaCore` and `dayDelta`.
- **Case (a): the threshold decision lives in `dayDeltaIn`, and `oilRuleDelta` still compares against today's three.** Steps: change only "Full day of OIL". Shows: "1 pending" with no publish button, because `dayHasChanges` reads `dayDelta`. That is the "0 pending beside a Publish button" class the code guards against, in reverse.
- **Case (b): `oilRuleDelta` is gated on the core pieces.** Steps: change the threshold, then make a warning-only change (for example a Quals change of a man on the day). Shows: `dayDelta` has warn + `oilrv`, but the count reads "1 pending · Warnings changed", with no OIL line. `alIssue` stores `units`=1 against a `diff` of 2, and the man's OIL moves at publication with no line telling the scheduler.
- **What should happen.** Every reader shows the same entries.
- **Fix to the plan.** Add `dayPendingItemsIn`. Decide the threshold entry in one function, and have `dayPendingItemsIn` push the `oilrv:` item exactly when `dayDelta(di)` carries it (`sc===SCHED`, as `warnDelta` already is). Add tests in which the count, `dayHasChanges` and `pendingKey` agree for: threshold only; threshold + warning only; threshold + hide only.

**3. BLOCKING (if B). "Something else waits" is defined two ways, and the hook, the freeze and the sign-off binding must share one.**
- **The cause.** Step 2 decides the threshold on the core pieces in `dayDeltaCore`, and adds it in `dayDelta` when a warning or hide waits. Step 4's hook ("nothing else waits on") does not say which definition it uses.
- **Shared steps.** A published earning Saturday; "Full day of OIL" 6h01 → 5h00; then a Quals change raises a warning on the day.
  - If the hook uses the core definition: OIL Earn on Edit Schedule shows the old amount while the list says it will change. The sign-off binding captures the old line (`currentBind` → `orv`: `oilKeptVals(oilEvidence)`, through the hook). If `oilRvBoundOk`'s `next` uses the `dayDelta` definition, the binding fails the moment it is signed. The day can never be signed, so AL1 can never be published. If both use the core definition, the signatures stand, but `daySnap` (`d.oilev=oilEvidence(di)`, through the hook) freezes the OLD line, while the AL's stored `diff` and its pending line said the OIL moved. The mismatch then reappears on the next unrelated change.
  - Step 3's claim "freezing … with today's three is exactly what the pending list told" holds only if the hook uses the `dayDelta` definition.
- **Fix to the plan.** Define one `oilNextVals(di)`: today's three when `dayDelta` minus the threshold entry is non-empty (warnings and hides included), else today's lead and debrief plus the kept full-day line. Make the hook, `daySnap`'s freeze, `oilRvBoundOk` (its fast path too), `oilRuleWords`, the `dayDelta` entry and the `dayPendingItemsIn` item all read it. State, and pin with a test, that the validator's output never reads `rv`. The hook reading `warnDelta` and `hidePending` inside a validate is then safe: they read the previous pass's official results, never the one being written. Alternatively, use the core-only definition in ALL readers and drop the `dayDelta`-level add. That is consistent but not "the next amendment" for a warning-only AL. Pick one and say which.

**4. CHANGE. The scenarios the checks would miss; add them to the red-first tests and the walk (§7.0, pressing the app's own controls).**
- The threshold changed, then warning only, then hide only (findings 2–3). Each time: the count, the list's words, OIL Earn, the publish button, signing, then publish AL1, and the Leave War credit before and after.
- Sign the amendment while another change and the threshold entry both wait. Undo the other change: the four fall (`pd`). Redo: the four stand (AM11, D103, D592 (9)).
- The correcting path. Steps: Unpublish ALn, put the content back, republish. `publishALDay` allows an empty delta while correcting (`publish.ts` ~1424). So step 3's "a publication needs a non-empty dayDelta" is false there. Under the hook, the reissue keeps the prior version's line, which is consistent with nothing being shown. State it and test it. Also test Unpublish of the Original followed by a first publish: no issued version, so the hook gives today's.
- Changing the line twice, there and back, with nothing waiting: 0 pending throughout, and the four stand.
- Lead (or debrief) and the full-day line changed together, then the lead undone: the entry goes.
- A day published before the kept values existed: the published OIL follows today's at once. That lives only in stored data, so D56 applies; not a finding.

**5. CHANGE. The roll-call misses the input ask-flow, which prices with today's line.**
- **The cause.** `inputOilAmt` (`oil.ts` ~104) uses `ruleNow('oilFullMin')`, and three readers depend on it: the OIL question sheet and the bell's question (`leavewar/sync.ts` `oilAskPlan` ~1167, "what the input's own hours would earn"); `voidedOil` and `repricedOil` (the answers kept or dropped when an input is edited).
- **Steps.** A published Saturday kept at 6h01, the line now 5h00. A member files a 5h30 duty input on that date.
- **What shows.** He is asked "FO (full day)", but the published day's credit uses its kept line.
- **What should.** The roll-call gives this a written has-it / must-not / MISSING, likely "must not, because an input is priced when it is filed and its credit goes out with the day's next amendment". Then check that the posted amount matches what the next AL credits.

**6. NOTE. Cost of the hook.** `dayDeltaIn` itself calls `oilEvidence` (inside `oilDelta`), and so does `dayPendingItemsIn` (twice). Without a guard there, every delta on a published weekend whose line differs runs the "something else" pieces twice, outside a read pass on every call. Set the re-entry guard around `oilDelta`'s own evidence build too (the `oil:` key does not depend on `rv`), memo the hook per pass, and run the Part 1 checklist in `docs/performance.md`.

**7. NOTE. Records.** Step 7's "OIL's page line D592 narrowed by D2014" depends on question 1. Under A, D2014's row needs its premise corrected and nothing in D592 is narrowed. Either way, `oilworkstart-published.test.ts`'s "each of the three values, each way" (which pins pending for `oilFullMin` 300 and 480) flips only under B. The plan's test list should name it.

### Answer to question 1

The plan's reading is not faithful. It contradicts D2014's own row, so it is a question for the owner before building.
- D2014's row says, as the agent's reading, "whether the day then reads pending follows D592". D592 (4) says a Logic value changed afterwards "reads as a pending change" and moves the OIL only on the next publication.
- So by D2014's own words the day still reads pending, and there is no D2014-over-D592 clash to settle by date.
- What D2014 adds ("reaches the day's OIL only from its next amendment … no longer at once") is already built. The full-day line has been kept on every published earning day since 6 Oct, and is pinned by test. His "yes" answered a premise ("today that day's OIL changes at once") that was not true.
- Removing the pending entry and the drop of the sign-offs for the full-day line is a new product choice. It is defensible for consistency (D754), but it is his to make.
- Put it to him once, for all three OIL values, with the corrected facts and pictures, before part 4 is built. Parts 1–3 and 5 can go ahead, with part 3's and part 5's wording waiting on his answer.

### The host's check (chat 77)

Claim 1's core reproduced: `src/leavewar/oilworkstart-published.test.ts` pins "the full-day threshold, both ways" (`oilFullMin` 300 and 480) and "each of the three values, each way" — a published day's OIL already keeps its full-day line, and a change reads pending (D592 reading (8)). The rest waits on his answer: findings 2–6 matter only under B.

## Reader 2 — Astra (Codex)

Run: `codex exec -m gpt-6-astra`, reasoning high, read-only, the brief above; saved word for word.

**BLOCKED.** Part 4 removes a pending change that D592 requires, without a clear ruling authorising that removal. Even if that choice is approved, two gaps in the proposed design need fixing before building.

1. **BLOCKING — Removing the pending entry is an unapproved behaviour change.**

   **Steps:** Publish a Saturday with six hours of earning work and “Full day of OIL” at 6h01. Lower that setting to five hours.

   **Result under the plan:** The published half-day stays unchanged, the working copy also shows half-day, nothing reads pending, and the change alone offers no amendment. Any otherwise-valid sign-offs remain valid.

   **Required by the recorded rulings:** D592(4), with reading (8), says a Logic change that would alter someone’s published OIL record reads pending. D103 then invalidates the current sign-offs. The credited half-day stays unchanged until publication; putting the setting back clears the pending change and restores the unchanged signatures.

   **Cause:** Row 4 and the design treat D2014’s “only from its next amendment” as permission to remove the amendment trigger. Those are separate decisions. The current code already keeps the published credit fixed; the immediate change is in the working copy’s preview.

   **Fix to the plan:** Remove the claimed supersession of D592 and the unconditional promise of “no pending / sign-offs stand.” Either retain D592, or obtain an explicit ruling on whether a full-day-only change should still offer an amendment. Explain the existing published-credit freeze when putting that choice. The question about rally/debrief must likewise distinguish **published credit**, **working-copy preview**, and **pending**, rather than imply their published credit currently moves immediately. Part 3’s wording must follow that answer.

2. **BLOCKING — A warning-only or hide-only amendment can omit the OIL change from the count and changes window.**

   **Steps:** Use the same six-hour Saturday. Lower the threshold from 6h01 to five hours, then hide one existing warning, making the hide the only other pending change.

   **Result under the specified wiring:** Step 2 adds the threshold entry at the full-comparison level. But the [pending-count calculation](/C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:354) separately obtains its OIL entries, then appends warnings and hides. It does not consume that added entry. The publication comparison can therefore contain the hide **and** the OIL change while the day and changes window list only the hide. The amendment can change half-day to full-day without listing that consequence.

   **Cause:** The plan updates the full comparison but omits the separate counting path. Changing the words of an OIL entry cannot help when that entry never reaches the list.

   **Fix to the plan:** Explicitly update both paths to obtain the same OIL-rule entry from one shared calculation. Include warning/hide triggers in both, keep that entry separate from input folding, and include it exactly once. Add checks for a hide-only trigger and a printed-brief or roster-only trigger, including putting each back.

3. **BLOCKING — “Publish AL1” can publish with no other pending change.**

   **Steps:** Publish the six-hour Saturday at 6h01. Publish AL1 containing only a note change. Unpublish AL1, restore the note to the Original’s wording, then lower the full-day threshold to five hours. Sign and press “Publish AL1.”

   **Result under the proposed live-block hook:** Nothing else differs from the Original, so the working copy and signatures retain 6h01. The replacement AL1 can retain that old threshold too, although it is the next publication and should apply five hours.

   **Cause:** Step 3’s premise is false: the [publication gate](/C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:1410) expressly permits a withdrawn amendment to be published again even when the net comparison is empty. The snapshot also freezes the live evidence block, which step 4 would now make conditional. Merely forcing today’s threshold at the final freeze would create the opposite failure: signing a half-day preview and publishing a full day.

   **Fix to the plan:** Treat a day awaiting replacement of a withdrawn amendment as a publication candidate even with no other difference. Its OIL preview, pending explanation, signature checks and newly frozen values must agree before the button is pressed. Add this exact sequence. The existing “Unpublish, then publish again” OIL test withdraws the **Original**; it does not exercise this AL1 exception.

The following is the surface trace **assuming the owner approves suppressing a full-day-only pending change**. It describes the proposed behaviour, not a running-build verification.

| Place or action | After the full-day-only change | Assessment |
|---|---|---|
| Published face and its OIL marks | Keep the published amount | Correct; already supported |
| OIL Earn on the working copy | Keeps the published threshold until another change waits | Requires the ruling in finding 1 |
| OIL Earn on View-only | Keeps the published amount | Correct |
| Leave War credit and grid | Keep the published FO/HO and worked times | Correct; they read the frozen evidence |
| OIL tracker | Keeps the same earned credit and balance | Correct; it reads the credited FO/HO |
| Pending list and count | Intended to show no threshold entry | Requires finding 1; warning/hide transitions also need finding 2 |
| Current sign-off controls and binding | Intended to remain valid | Requires finding 1; replacement AL1 needs finding 3 |
| Published “Signed AL…” line | Keeps the historical signers | Correct; distinguish this from current sign-off validity |
| Changes window | No threshold line under “To go out” | Same issues as pending; the Logic edit’s history remains a separate matter |
| Publish button | Offers no ordinary amendment for this change alone | Requires finding 1; replacement AL1 is the exception |
| Schedule PDF and CSV export | Unchanged | These reports contain no OIL amount column; they use published schedule rows |
| First publication | Uses today’s threshold | Correct; no published threshold exists to retain |
| Unpublish Original, then publish | Draft preview and new publication use today’s threshold | Correct |
| Unpublish AL1, then publish AL1 | Must preview and freeze today’s threshold | Not covered correctly; finding 3 |
| Undo/redo of the Logic change | Recalculates from the restored setting | Plausible, but needs the real Undo/Redo route checked |
| Reload | Reconstructs the same choice from saved settings and publication | Plausible; must not depend on an earlier in-memory calculation |

The “something else waits” calculation needs these explicit checks added to the plan:

- **Add another change, then undo only that change:** the threshold must return to the kept value under the proposed policy. Pending must clear, and previously bound signatures must recover where nothing was re-signed in between.
- **Change the threshold there and back:** test both with no amendment waiting and with an amendment already signed.
- **Sign an amendment, then change the threshold:** signatures must fall whenever the *working candidate’s* OIL changes, even when the issued day’s OIL would not. Putting the value back must restore them. This preserves D592 reading (9).
- **Change report lead/debrief and threshold together:** compare worked times as well as amounts. Undo each setting separately; the remaining change must still be explained correctly.
- **Warning-only and hide-only changes:** repeat validation and rendering, then undo the trigger. Check the first result and subsequent results agree.
- **An earning date with nobody earning:** no threshold-only OIL entry is warranted. Adding an earning person must make the candidate use today’s threshold.
- **A published block without kept values:** retain the existing fallback. Its historical-data limitation is excluded by D56, not a finding.

The recursion warning is valid, but its fix needs to be more explicit. Keep the validator’s core comparison independent of warning/hide output. The full comparison may add those consequences afterwards. Reading evidence solely to compare OIL decisions must not invoke the new preview-selection hook unnecessarily. Keep the cheap unchanged-threshold check and restore the re-entry guard on every exit; a guard preventing infinite recursion does not by itself prove that all readers selected the same values.

The plan names all the requested screens, but it does not specify these transition checks. A single “change Logic, then publish” walk would miss the count disagreement and the empty-difference AL1 replacement.

**Answer to question 1:** This is **a question that must go to the owner before building the proposed suppression**, not a faithful, established supersession. D2014 says the new setting reaches published OIL only from the next amendment. D592 says the intervening difference reads pending. Both can hold together, and D2014’s own recorded reading expressly points pending back to D592. D90 does not authorise setting aside an older rule when the newer answer does not clearly cover that separate choice.

Read-only review completed. No files changed; no tests or browser walks run. Rulings: none this session.

### The host's check (chat 77)

Astra's finding 3 reproduced by reading: `publishALDay` lets a withdrawn amendment go out again with an empty difference (Opus's finding 4 says the same). Both readers, blind to each other, reach the same answer to question 1: a question for him before part 4 is built. Findings 2 and 3 of each matter only if he picks the design that drops the pending mark.

