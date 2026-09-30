# Astra blind red-team report — phase 6 (c) v3, round 3 (1 Oct 26)

*(Saved verbatim from Astra's final message — `codex exec -m gpt-5.6-sol -c model_reasoning_effort=high -s read-only`, the plan at commit 820557ac; brief `2026-10-01-db-readiness-phase6c-redteam-r3.md`. Blind to Fable's round-3 report.)*

# Findings

## 1. A dead `kept` row can suppress OIL earned by the request’s live row

**Severity: HIGH**

**Scenario**

- Setup:
  1. An OIL-eligible Training request is landed on Saturday.
  2. The scheduler marks its row `CX` or information-only and publishes the day.
  3. The member deletes the request.
  4. The scheduler loads that published version onto the working copy. D363 restores the row with `kept`.
  5. The member undoes the deletion, but the holder does not save Saturday.
- Action:
  1. The member moves the request to Sunday.
  2. Rule 3 leaves Saturday’s now-off-coverage `kept` row as a dead version row.
  3. The landing rule correctly creates the request’s active row on Sunday.
  4. The member answers Yes to the Sunday OIL question and the scheduler publishes Sunday.
- Expected: the Sunday standing row is active, so the member’s answer earns OIL and the Leave War receives the corresponding automatic credit.
- Observed if v3 is built as written: `landedStanding` scans the loaded week in day order and accepts the first row whose `src` matches. It finds Saturday’s dead `kept` row first and returns `cx` or `info`; `standEarns` consequently rejects the Sunday claim. The visible programme shows the active Sunday row while the OIL mode/Leave War pays nothing. Reloading preserves the same wrong result.

This is reproducible with new data and is not excluded by D56.

**Code evidence**

- The v3 rules deliberately permit a dead off-coverage `kept` row and a new standing landing for the same request in one week: [phase-6 plan](</C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md>), §3(c), rules 3 and 7 plus Land.
- Committed `HEAD`’s [engine/oilev.ts](</C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts>) `landedStanding` uses a raw cross-day `.find(r.src === iid)` and does not ask whether that row stands for the request on that date.
- `projectOilInputs`, `oilEvidence`, `standEarns`, and `oilEvidenceKey` propagate that result into the issued evidence and payment decision.
- The plan repairs [engine/weekstash.ts](</C:/Users/User/projects/Raptor/raptor-port/src/engine/weekstash.ts>) `stashStanding` through the standing-row finder, but does not apply the same rule to the loaded-week branch.
- [leavewar/sync.ts](</C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts>) `runOilPass` turns the issued evidence into automatic FO/HO credits, so the wrong standing reaches money.

**Exact fix**

1. Amend §3(c) before implementation: every OIL standing lookup—loaded or stashed—must select the request’s first **standing** row, never merely its first matching `src`.
2. Export one pure predicate/selector from `engine/overlay.ts` or `engine/weekstash.ts` that:
   - requires the current request to exist;
   - applies activity, coverage, and `'u'` eligibility;
   - treats `'r'` as a standing stored row;
   - ignores a `kept` row when the request cannot stand on that row’s date;
   - returns the first eligible row in day order;
   - neither lands nor mutates anything.
3. Use that selector in `oilev.ts` `landedStanding` for `DAYS`; preserve the existing `gone`/`unlanded` fallback when no standing row exists.
4. Make `stashStanding` use the same selector through the finder, avoiding two definitions of “stands.”
5. Add a red test for the complete sequence above, for both stale `cx` and stale `info`.
6. Assert before and after reload/week navigation:
   - Saturday retains the dead `kept` version row;
   - Sunday has the deterministic active landing;
   - `projectOilInputs(Sunday).stand === 'active'`;
   - the live and issued OIL keys agree;
   - publishing Sunday causes `runOilPass` to create the expected FO/HO credit.
7. Add the scenario to the browser walk: the working gesture is the member’s OIL answer and Sunday publish; the visible signs are Sunday’s active Ground Programme row, its OIL state, and the Leave War credit.

**Disposition:** the standing-selector contract must be added to the plan first, but the correction and tests can be folded directly into this build. It does not require another design round.

# Round-2 closure

V3 closes the round-2 findings at the plan-contract level:

- Astra 1: the holder base makes a derived removal reversible without losing row identity, position, times, or extras.
- Astra 2: published marks are rebuilt as a target state; unpublished derived rows do not create marks.
- Astra 3/Fable F6: `kept` exits when the request can stand again, while an off-coverage dead row no longer blocks a new landing.
- Fable F1: whole-day replacement preserves the version’s `srcv`, followed by current-holder reconciliation.
- Fable F2: the unlanded finder breaks recursion and applies the one-request/one-standing-row rule across weeks.
- Fable F3: the view and pass write no edit-history lines.
- Fable F4: the after-command pass resynchronizes and reflows.
- Fable F5: the load confirmation compares against the resulting view rather than the raw version.

The finding above is a new downstream-consumer gap created by the now-valid coexistence of a dead `kept` row and a standing row.

# Explicit negatives

1. **Holder base:** I checked request delete/edit/retype followed by Undo/Redo, an intervening holder edit, week leave/return, browser reload, `histRestore`, rollback, nested commands, phase-8/9 projections, posting, and off-week Undo. I found no additional order in which the specified base differs from the holder-stored row or produces right-after/reload divergence.

2. **Marks and counts:** I checked published A→B→A, edit→Undo→Redo, delete→Undo, request-row addition/deletion tombstones, unpublished dangling row marks, “N pending,” “Clear the marks (N),” load confirmation, and sign-off binding. The target-state rebuild/base-minus-dangling rules close the round-2 failures; I found no separate mark or count defect.

3. **`kept`:** I checked D363 restoration, D175’s single-standing-row rule, request restoration before a holder save, request removal again during that grace period, and the permanent exit after a holder save. The stated lifecycle is coherent for programme rows. Its only uncovered consequence is the OIL consumer reported above.

4. **View and finder:** I checked recursion, saved/seed/peek parity, an unreadable week, a row standing on another week, duplicates, dead `kept` rows, start-day-only landing, published-day `fil`, deterministic IDs, and published-day load churn. The finder-without-landing resolves the recursion and second-row cases. Current new IDs do not expose a separate deterministic-ID collision. The only failure found is loaded-week OIL selecting a raw matching row instead of the standing row.

5. **Commands and authority:** I checked the dialog, both Inputs-page adds, in-place cells, calendar drag, reassign, medical split/cascade, Leave War absence projection and remarks editor, clear-old-data, explicit Accept/Ground/Unavailable/take-off, Ground “+ Inputs,” and Undo/Redo. The request-only paths can lose their schedule mutations as planned, while holder commands retain saved day changes. I found no member action that A9 must permit while carrying a schedule record.

6. **Load, boot, whole-day replacement, and visible changes:** I checked raw-base installation before the pass, removal of `sched.load`, D98, D114, D174–D178, D363, the 16 September live-filing rule, byte-preserved weeks, version/plan replacement, `dayDiscardCount`, and §8 items 5–10. I found no missing intended visible change apart from the erroneous OIL outcome in Finding 1.

# Verdict

**REVISE**

Finding 1 must be stated in the plan and folded into the build with the named tests. No finding genuinely requires work outside this build or another red-team round.

