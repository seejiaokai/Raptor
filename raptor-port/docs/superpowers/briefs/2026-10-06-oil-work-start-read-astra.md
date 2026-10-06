**One test correction is required. I found no new production calculation defect in the reviewed change.**

Reviewed `claude/oil-work-start-build-35a0e3` at `aec146fc`, against `origin/main`; the working tree was clean. This was an independent, read-only review. I did not open any `*-read-sol.md` file, change files, run tests, build, or start the app. Reported walk and test results below are the host’s evidence, not runs I independently performed.

**F1 — Low: the browser test does not prove that changing Logic invalidates existing sign-offs**

Location: [oilworkstart.spec.ts:103](C:/Users/User/projects/Raptor/.claude/worktrees/tracker-palette-prompt-a0c90f/raptor-port/e2e/oilworkstart.spec.ts:103), particularly the assertion at line 111.

The test signs the Saturday, publishes ORIGINAL, changes the nominal report lead, then asserts that zero sign-offs remain, labelled “the four sign-offs fell (D103).”

However, publishing ORIGINAL already clears those signatures. `setDayApproved` calls `signClear(di)` at [publish.ts:342](C:/Users/User/projects/Raptor/.claude/worktrees/tracker-palette-prompt-a0c90f/raptor-port/src/engine/publish.ts:342). The test never signs again before changing Logic. Its zero-signature assertion therefore passes without demonstrating any invalidation caused by that edit.

- **Concrete failure:** a browser regression that leaves current signatures standing after a consequential Logic edit can escape this assertion because the fixture has no signatures to invalidate.
- **Who is affected:** the test supplies misleading assurance about the scheduler’s signing and publication controls. This is a test defect, not evidence that those controls currently fail.
- **Authority:** D103, OWS7, and bug-check order §8.3–4 require the test to establish the state and behaviour it claims.
- **Comparison with `main`:** ORIGINAL publication clears signatures on `main` too. This browser test is new on this branch.
- **Other coverage:** the dedicated published/UI tests establish fresh bound signatures correctly; their evidence is not invalidated by this finding.

Exact repair:

1. Immediately after the first FO assertion at line 103, add a precondition asserting four signatures. Run that alone first: the existing fixture should fail with zero.
2. Establish those signatures through the existing browser helper:

   ```ts
   await signFour(page)
   expect(await signed(page), 'four current sign-offs before the Logic edit').toBe(4)
   ```

3. Keep the Logic edit and the existing zero-signature assertion.
4. Before signing again for AL1, assert that the day’s `[data-alpub]` button is disabled.
5. Run the repaired browser test. Its evidence should show **four before the edit → zero afterwards → amendment disabled → re-sign → successful amendment**.

No production signing change is justified by this finding.

**Coverage inventory and missing doors**

The following is the source-traced inventory, starting with the less shared surfaces. “Supported” means the code follows the intended authority; it does not mean I operated that surface.

| Object or surface | Visible result and working gesture | Read result |
|---|---|---|
| Leave filed over previously published work | Filing warning, then the Leave War clash strip; member/admin files through the normal input door | **Supported, but absent as a separate roll-call row.** `inputgate.ts` reads the automatic credit through `creditWins`; it does not recalculate reporting times. |
| Work published over an existing bid | Publish-time warning; bid remains available for resolution | Supported: `publishFlagsBids` reads the newly issued evidence and the shared worked-period conversion. |
| Leave War clash strip | Names overlapping leave/bids and recorded work | Supported: stored worked periods are the authority. The sheet’s “by construction” claim is sound as a source claim; this was not walked. |
| OIL tracker credit row and balance | Every worked period appears; member reads, admin retains existing ledger controls | Supported. The changed renderer prints all periods, preserving gaps. |
| Leave War grid, day sheet and day list | FO/HO and recorded worked times; tapping the cell opens detail | Supported through the landed record. |
| Withdrawal warning and resulting balance | Unpublish ORIGINAL removes its credit; withdrawing AL restores the surviving issue | Saved-value calculation is supported. The warning’s separate restoration defect is already filed as `[UNPUB-WARN-AL-RESTORES]`. |
| An off-screen or reloaded week | Its own latest issued credit remains in Leave War | Supported: loaded and stashed weeks both pass their date’s evidence to the amount calculation. |
| Older-version preview | Shows that version’s OIL; opening/closing the preview changes no credit | Supported through the snapshot context. |
| Saved plan or version loaded for editing | Uses today’s values; plan selection restores that plan’s own signatures | Supported. `liveDay` removes issued evidence; signature bindings survive the plan’s ordinary cloning. |
| ALL AVAIL window | “Who earns OIL,” individual figures and existing switches where permitted | Supported: calculation runs inside the chip’s version context. |
| Board/week cockpit seats | Green OIL edge and existing OIL Earn interaction | Supported through the shared figure helpers; cockpit placeholders were not introduced. |
| Sim seats/passengers/extras, duty names/extras, ground and Common Programme | Corresponding edges, figures and row/person switches | Supported; written windows and existing membership rules remain. |
| SC MAIN/SPARE, AVALON and BB seats/desks | Written-time calculation; exempt positions remain default off and deliberately switchable | Supported; reporting text and SC’s B do not change their OIL windows. |
| OIL Earn day, row and person controls | Candidate figures change; published entitlement waits for issue | Supported. Phone operation remains an explicitly unwalked part of the sheet. |
| Pending chips, day panel and Amendments box | Matching count; opening the pending list explains the change | Supported through the same pending-item calculation. |
| To go out | One separate Logic/OIL item, naming values and affected people | Supported. Its description correctly identifies the comparison as the published content under today’s values. |
| Stored amendment record | Preserves the issue’s diff/count | Supported. `oilrv:` is safely stored as an OIL entry and creates no fictitious schedule-cell target. The current record UI provides the aggregate amendment information, not a new detailed historical OIL ledger. |
| Four sign-off controls | Invalid signatures disappear; publication waits for valid signatures | Supported in source and dedicated tests; browser proof needs F1. |
| Reporting editors and both “+” buttons | Add/change/remove reporting text through existing controls | Shared parsing is reused; no new reporting writer or grammar. |
| Logic edit boxes, Reset, Undo/Redo and reload | Candidate recalculates; issued records retain saved values | Supported. No new cross-tab merging behaviour is claimed. |
| Member/guest views, board previews and floating windows | Existing readable faces, without new mutation authority | No permission change found. Guest-page and phone coverage must retain the sheet’s stated limitations. |
| Advisories, Insights, CSV and print | Existing warnings; Insights retains its own live-rule behaviour; exports retain their documented fields | No missing OIL calculation consumer found. CSV/print have no OIL ledger column. |

Add the **leave-after-published-work filing warning** as its own coverage row. It is a different action order from publishing work over a bid.

**Explicit results against the ten claims**

1. **Shared reporting reader — no defect found.** Ordinary flying uses the resolved applicable report, falling back to nominal only when none resolves. Formation specificity, separate In-time/Rally precedence and duplicate-line chronology remain the shared reader’s rules. Blank and duplicate callsigns do not introduce a second interpretation. A cancelled formation’s recognised name does not turn its specific instruction into a wave-wide one. Non-array `intimes` is normalised for parsing; non-string entries are handled by the shared parser. An unreadable take-off or landing supplies no measurable flight window. The copied wave changes only the parser’s input collection; the resolver does not subsequently read a conflicting copy of that field. Truthy `standalone` values retain the existing standalone classification.

2. **Other earning paths — no unintended change found.** SC, AVALON, BB, sims, duties, ground, Common Programme, request confirmation, decision masks and frozen membership retain their existing behaviour. The changed reporting start is confined to ordinary flying.

3. **Published readers — no remaining live-value leak found for newly issued evidence.** The credit pass, published figures, eligibility helpers, ALL AVAIL figures and publish-time overlap calculations reach saved values. Leave War’s subsequent consumers read stored amounts/periods. `oilWouldEarn` intentionally asks about the live candidate. `step` does not enter OIL arithmetic; assumed `openEnd`/`simLen` windows do not mint OIL and issued membership is frozen. The shared resolver’s standalone `reportLead` branch is not reached by ordinary flying’s OIL calculation.

4. **Publication authority — no misplaced stored `rv` found.** Candidate evidence can contain current values transiently; publication stores them through `daySnap`. Original issue, AL and correcting reissue use that route. Undo, redo and stashing preserve the issued object. Loading content for editing removes the entire evidence block. `oilEvidenceKey` and `oilSignKey` remain field-built and do not accidentally acquire `rv` through generic serialization.

5. **Pending comparison — no defect found.** Both sides use the same issued content, claims, decisions and membership. The replacement evidence object prevents the old `OIL_WORK` cache entry from satisfying the current-values side. Comparison uses the amount and clipped/merged stored periods, including appearance/disappearance of an earning record. Non-earning blocks return no shift. Person ordering and period ordering are stable. `oilrv:` survives address parsing and signature-key processing without becoming a schedule-cell change.

6. **Count, explanation and signatures — no disagreement found.** The Logic entry is kept outside request folding. Request edits, OIL decisions and warning changes retain their own applicable entries. Publishing captures the diff before replacing the snapshot; afterwards the Logic difference clears. The pending wording does not misrepresent the issued-content comparison as the amendment’s combined future result.

7. **Signing-time values — no defect found.** The comparison uses the current candidate under signing-time versus current values. Restoring values can restore otherwise matching signatures. Holiday classification changes are also covered by the existing evidence binding. Saved plans retain `orv` and are checked against the selected candidate. The production `setSign` handler runs outside the read-only render pass. Equal values take the fast path before rebuilding evidence for this check.

8. **Robustness — no new-data failure established.** Malformed saved value blocks fall back as documented. Zero leads remain valid, while the actual threshold control has a minimum of 60; zero is not a valid user-entered threshold. Upper bounds are 480 for each lead and 720 for the threshold. Storage preserves the new fields without projecting them away. Older records’ live-value fallback is explicitly covered by D56 and is not a migration finding. Cross-tab correctness here means reading the saved world after reload, not a new instantaneous merge facility.

9. **Moved function — no change found.** `oilWorkSpans` retains the former `workSpans` body: clipping, sorting, touching-period merging and return shape. Existing sync callers still reach it through the imported alias.

10. **Tests — F1 is the exception.** The dedicated tests meaningfully cover reporting, saved values, whole-record comparison, separate pending items and candidate signatures. Their direct setup proves engine/render behaviour, while the browser fixture covers actual control wiring. The reported 22 red break results are recorded evidence, not independently rerun here. RT8’s changed OIL expectation follows D591; its ordinary-busy, SANS and work-span distinctions remain asserted. I found no unjustified weakening of that older pin.

**Ranked cases for the host**

These are exact expected checks, not claims that I ran them. Defaults are lead **180**, debrief **120**, threshold **361 minutes**.

| Priority | Setup and action | Expected result; disproof |
|---|---|---|
| 1 | Publish Saturday flight **10:00–11:15**, no report. Change lead to **150**. Then file leave covering **07:00–07:15**. | Issued work remains **07:00–13:15, FO**. Filing warns about that recorded overlap. Silence caused by substituting candidate **07:30** disproves correctness. This exercises the missing roll-call door. |
| 2 | Existing bid overlaps **15:00–15:30**. Publish flight **12:00–13:00**, report **08:30**, debrief **150**. | Published work ends **15:30**; publish warning and clash strip agree, bid remains live, and FO is recorded once. |
| 3 | Repair F1: publish **10:00–11:15**, sign all four again, then change lead **180→150**. | Four signatures immediately before the edit; zero afterwards; AL disabled; issued FO holds until fresh signing and AL publication. |
| 4 | ORIGINAL **10:00–11:15**, lead 180; AL at lead 150; then lead 120. Preview ORIGINAL, then load it for editing. | Preview **07:00–13:15, FO**; candidate **08:00–13:15, HO**; latest issued AL remains **07:30–13:15, HO**. Any blending of these three answers fails. |
| 5 | Publish flight **12:00–13:00**, report **10:00**, plus confirmed request **06:00–06:30**. Change request to **07:00–07:30** and debrief to 150, in both orders. | Old periods hold until issue. Request and Logic explanations remain separate. AL lands **07:00–07:30, 10:00–15:30**, FO, once. |
| 6 | Publish **22:00–01:00**, report **20:00**. Change debrief **120→90**. | Both records are FO with stored period **20:00–23:59**. No OIL-rule pending item solely for the clipped-away end change; unrelated warning changes may still be pending. |
| 7 | Two **12:00–13:00** formations: cancelled `VL`, active `ST`; only reporting line is `VL IN TIME 0830`. | Active ST uses nominal **09:00–15:00, HO**. Cancelled VL earns nothing. ST starting 08:30 would prove scope leakage. |
| 8 | For **12:00–13:00**, separately use non-array `intimes`, then `[null, 42, {}, "IN TIME 0830"]`, then unreadable landing. | Respectively **09:00–15:00, HO**; **08:30–15:00, FO**; no measurable flight work. |
| 9 | Unpublished **12:00–13:00**, no report: set lead/debrief **0/0**, threshold **720**; separately use **480/480/720**. | Respectively **12:00–13:00, HO** and **04:00–21:00, FO**. Published versions must retain the values used at their own issue. |
| 10 | Publish two covered Saturdays, navigate away from one, change Logic, reload, then amend only the loaded Saturday. | Each date retains its own issued amount/periods; only the amended date changes. |

**Three owed meaning reads**

- **D591 short line: PASS.** Removing “NOT YET BUILT” does not change the ruling. The full row explicitly distinguishes its historical wording from the completed build.
- **D592 readings (6)–(10): PASS.** They are clearly attributed as the agent’s readings, not silently presented as additional owner answers. Their descriptions match the implementation.
- **Three changed Logic explanations: PASS.** Nominal fallback, actual applicable reporting, saved publication values and default-off standby work agree with D24, D591 and D592. No additional arithmetic change is needed for those explanations.

**Limits of the full-check evidence**

The sheet candidly records **120 of 364** proposed ordered-pair runs, and leaves the clash strip, publish-time toast, guest pages and phone OIL Earn figure unwalked. Source tracing supports the two “by construction” paths, but cannot establish their visible warning delivery or operability.

At this reviewed revision, the sheet also points to a final **Status** section that is not yet present. It is therefore not a finished release-readiness record. Complete the missing checks and dispositions under the standing workflow before calling the FULL check complete; this review does not waive them.

The already-filed zero-span wording, AL-withdrawal warning and per-page history issues remain separate. I found no additional tidy-up with a concrete failure requiring a new item.

**Walk: NOT DONE — the review brief expressly prohibited execution.**

**Rulings: None made or changed.**

**CHANGES REQUIRED — (1) repair F1’s browser fixture and assertion; (2) complete the outstanding full-check evidence before reporting readiness. No production-code repair is established by this read. Owner approval remains separate.**

