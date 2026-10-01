# ASTRA final read — `claude/warn-hide-kept`

Reviewed `HEAD` against `main` using the requested source/e2e diff. I did not edit files, build, run tests, or inspect any `*final-read-fable*` report. D56 was applied: legacy-only migration concerns are not findings.

## Findings

### 1. View-only Insights exposes a pending working-copy hide

**Severity: MEDIUM**

**Scenario**

1. Publish Tuesday with `LONGDAY` flagged.
2. Hide that warning on the working copy without publishing the amendment.
3. Open View-only Sched as a member.
4. Tuesday correctly continues showing the issued warning, count, and puck flag.
5. Open Week Insights.

**Expected:** Insights uses the warning world displayed by View-only Sched, so the warning remains counted until the amendment goes out.

**Observed:** Insights reports one fewer warning in the weekly total, by-type total, and Tuesday total. It silently reads the pending working-copy hide while the adjacent published day still reads the issued face.

**Code evidence**

- [`insightsHTML`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/Modals.tsx:66) reads global working `WARN`; [`InsightsModal`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/Modals.tsx:189) applies no displayed-world resolver.
- [`computeInsights`](/C:/Users/User/projects/Raptor/raptor-port/src/engine/insights.ts:9) calls `validate()`, which restores the working bundle, then counts `shownWarns(WARN...)` at lines 36 and 41.
- The day and day-popup paths correctly use `faceWarn`/`withOfficialWarn`, making the contradiction visible.

**Provenance:** **NEW with this branch.** On `main`, Insights counted raw `WARN`, so a working hide did not decrement these totals. This branch introduced the `shownWarns` reads without adding the published-face resolver.

**Exact fix**

1. Change `computeInsights` to accept the warning bundle it must count and stop calling `validate()` internally.
2. In `insightsHTML`, call `validate()` once before selecting the warning world.
3. Build the Insights warning bundle per day from the same resolver as the visible schedule: issued bundle for a default View-only published day, working bundle for a displayed working draft, and working bundle on edit surfaces.
4. Derive the top tile, `byType`, and `dayStats` from that single resolved bundle.
5. Add a test that publishes a warning, creates a pending hide, opens View-only Insights, and asserts the day bar and all three Insights counts stay unchanged until the amendment is issued; then assert all decrement together.

---

### 2. The persisted amendment schema rejects the new `hide` delta

**Severity: MEDIUM**

**Scenario**

1. Publish a day.
2. Hide one of its warnings.
3. Publish the amendment.
4. Inspect or validate the newly persisted AL record.

**Expected:** The declared `AlRecord` schema accepts the record produced by `alIssue`.

**Observed:** Runtime production code emits `diff: [{kind: 'hide', ...}]`, but both the TypeScript record type and the schema-conformance oracle say `hide` is impossible. The app therefore persists a new-data shape that its own declared contract rejects.

**Code evidence**

- [`DeltaKind`](/C:/Users/User/projects/Raptor/raptor-port/src/engine/canonical.ts:117) correctly includes `hide`.
- [`AlDiffEntry`](/C:/Users/User/projects/Raptor/raptor-port/src/engine/schema.ts:535) omits it.
- The test schema’s [`ALDIFF`](/C:/Users/User/projects/Raptor/raptor-port/src/engine/schema.test.ts:144) also omits it.
- The test updated `ukinds.hide`, but never creates and conforms an amendment whose `diff` actually contains a hide.

**Provenance:** **NEW with this branch.** The union existed on `main`, but `main` had no producer of `kind:'hide'`; this branch introduced that persisted value without extending the contract.

**Exact fix**

1. Add `'hide'` to `AlDiffEntry.kind` in `schema.ts`.
2. Add `'hide'` to the `ALDIFF.kind.$lit` list in `schema.test.ts`.
3. Add a schema test that publishes through the real path, hides a warning through the public command, issues the amendment, and first asserts that its diff contains `kind:'hide'`.
4. Run `conform` over that AL record and its retired-record representation so both storage forms are covered.
5. Keep the explicit “contains hide” assertion so the conformance test cannot pass using an unrelated amendment fixture.

---

### 3. WH13’s guard deliberately accepts malformed cross-week traces

**Severity: LOW**

**Scenario**

1. Mis-file either forward trace—Sunday’s crew-rest or seven-day-run trace—with the wrong warning code or a `who` list that does not name the marked person.
2. Run any test that validates that fixture.
3. Hide the real next-Monday warning.

**Expected:** The always-on marks guard fails immediately. This is WH13’s stated purpose.

**Observed:** Every trace whose target has `di:null` returns early without checking its code, person, or message. Such a malformed trace passes the guard and later fails to match the real Monday hide key, leaving Sunday’s dotted mark visible.

**Code evidence**

- [`markOrphans`](/C:/Users/User/projects/Raptor/raptor-port/src/engine/markcheck.ts:19) returns unconditionally for `w.di == null` at line 21.
- The WH13 test at [`warnhide.test.ts`](/C:/Users/User/projects/Raptor/raptor-port/src/engine/warnhide.test.ts:67) includes a `di:null` trace and intentionally expects it to contribute no error.
- The two current production trace call sites are correctly attributed; this finding is the claimed invariant/test oracle, not a currently mis-filed production call.

**Provenance:** **NEW with this branch.** The guard and its test are new.

**Exact fix**

1. Before the `di:null` branch, require every trace warning to have a non-empty code and message and require `w.who` to contain `t.id`.
2. For a cross-week run trace (`t.t.run`), require `w.code === 'DAYS_RUN'`.
3. For a cross-week crew-rest trace, require `w.code === 'CREW_REST'` and require `w.msg === t.t.msg`.
4. Only skip the lookup in `raw.byDay`—the unavailable next-week part—not these self-consistency checks.
5. Extend the WH13 fake bundle with separate wrong-person and wrong-code `di:null` traces and assert both are reported.

## Explicit negatives

1. **Engine:** The actual mark/trace call sites, `shownOf` copy/replay, raw identity fast path, `fz`/`lv` rebuilding, `WARN`/working/raw separation, face overlays, version faces, memo key, issued/hide hooks, swap restoration, and raw placement probes are sound. I found no current input that leaves a hidden warning’s puck mark behind or removes an unrelated shown warning’s mark.

2. **Published record:** `hidePending` reaches both authorities; pending keys and signatures use the hide delta; counts, `ukinds`, the three `dayDiscardCount(di,toVer)` callers, pending-line landing, version load, Unpublish, retired records, and issuance storage agree. I found no additional order that double-counts a hide or changes an issued face with nothing pending.

3. **Saved state:** Boot restoration precedes the baseline, week switching clears/restores the correct week’s keys, `sched.mutes` is day-grained, history and stash snapshots include hides, and Undo/Redo restoration revalidates. `toggleWarnOff` runs inside the command path and rollback restores its mutation if validation throws.

4. **Every reader:** Apart from Insights, the roll-call is complete and correctly distinguishes shown, raw, working, and version-owned states. The week/board exempt flying line now shares `exemptLineOwn`; counts, colours, rows, puck maps, ALL AVAIL reasons, focus maps, drop messaging, day-info, next-week marks, and version looks follow the intended bundle.

5. **Tests:** Outside the schema omission and cross-week guard hole, WH1–WH13 are asserted through meaningful state transitions rather than fixtures replacing the production writer. The published-order, load, Undo/Redo, week persistence, reader, and browser tests assert observable outcomes and are not passing merely from setup.

6. **Not walked:** Static inspection found no additional defect in the listed next-week preview, phone board/drag, BB/desk, tight-turn, Amendments-panel, print/CSV, or D148 paths. The unavailable live-device/runtime observations remain evidence limitations, not code findings. D56 excludes legacy-only stored-data cases.

## Verdict

**REVISE**

The three findings that matter most, in order:

1. View-only Insights contradicts the issued schedule while a hide is pending.
2. New amendments can contain a `hide` delta that the declared schema rejects.
3. WH13 does not guard the two cross-week traces it claims to cover.

Historical memory was used only for initial Raptor risk orientation; every conclusion above was reverified against the current branch.

