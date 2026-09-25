# Astra's second read of the finished code — `[LEAVE-LATE-PUBLISHED]` (26 Sep 26, morning, FULL tier, blind)

Brief: `docs/superpowers/briefs/2026-09-26-late-published-read2-brief.md`. Run: `codex exec -m gpt-5.6-sol -c model_reasoning_effort=high -s read-only`, the code as of `be38feff`. Saved verbatim from its final message; the dispositions are in the evidence sheet §9.

Review result: not ready for approval. Static review only; I did not edit files or run tests.

## 1. High — ALL AVAIL can change an issued person’s CAT/seat without pending

**Setup:** Publish a day containing an ALL/ALL AVAIL puck. Include a person in its frozen crowd who appears nowhere else on the day or in member inputs.

**Action:** Change that person’s CAT or seat, then reopen the issued ALL AVAIL window.

**Expected:** The issued window retains the old CAT, column, and ordering. The day gets one pending item and loses sign-offs until republished.

**Observed:** [`dayPeopleAttrs()`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:555>) deliberately skips `oilev`, so crowd-only people never enter `snap.pa`. [`AvailWindow.tsx`](</C:/Users/User/projects/Raptor/raptor-port/src/ui/AvailWindow.tsx:75>) then uses live `PEOPLE` for seat classification and, at [lines 216–219](</C:/Users/User/projects/Raptor/raptor-port/src/ui/AvailWindow.tsx:216>), for splitting and sorting. The issued window changes immediately, with no pending item or sign-off invalidation.

**Fix:**

1. In `engine/publish.ts`, replace `dayPeopleAttrs()`’s generic walk with an explicit person-slot enumerator.
2. Add every ID from each `d.oilev.sent[item]` frozen crowd to that enumerator.
3. In `ui/AvailWindow.tsx`, use `personShown(id)` for seat classification, CAT ordering, and puck attributes; keep only callsign live.
4. Add a rendered regression in `ui/availwin.test.tsx`: crowd-only CAT/seat change leaves the issued window unchanged, creates one pending item, clears sign-offs, and appears after AL.

## 2. High — Week Insights bypasses the published warning world

**Setup:** Publish a day, then add or remove a frozen-class warning without republishing. Log in as a View-only/member user.

**Action:** Compare the issued day and Week Insights.

**Expected:** Both surfaces report the issued warning set. Working changes remain hidden until AL.

**Observed:** [`computeInsights()`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/insights.ts:8>) calls `validate()` and reads working `WARN.byDay` and `WARN.all`. [`insightsHTML()`](</C:/Users/User/projects/Raptor/raptor-port/src/ui/Modals.tsx:59>) also reads `WARN.all` directly. The modal can therefore show working warning totals and types while the issued face correctly shows frozen-plus-live warnings. Its sortie, hours, and roster statistics likewise come from working globals.

**Fix:**

1. Refactor `computeInsights()` to accept an explicit displayed-world model instead of validating and reading `DAYS`, `EVD`, and `WARN` internally.
2. For Edit view, supply the working world.
3. For View-only, resolve each day from its displayed published snapshot and use `displayedByDay()`/`faceWarn()` for warning data.
4. Remove direct `WARN.all` reads from `insightsHTML()`; derive all totals from the returned model.
5. Add a rendered member-role test covering both a newly introduced and a newly cleared frozen warning. Assert that the issued face and Insights agree before and after AL.

## 3. Medium — Issued “Free all day” count still reads the live roster

**Setup:** Publish a day while an otherwise unreferenced aircrew member is free all day.

**Action:** Archive or repost that person, then open the issued day’s details panel.

**Expected:** The issued “Free all day” count remains unchanged, with the roster change pending until AL.

**Observed:** [`dayInfoHTML()`](</C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:2069>) calls live [`availByWave()`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/avail.ts:85>). That function iterates live `PEOPLE` and filters current `archived`/`pers` state. Because an otherwise unreferenced person is absent from `snap.pa`, the count changes immediately without pending or sign-off invalidation.

**Fix:**

1. In `freezeWarn()`/the day snapshot schema, store the issued free-all-day IDs or equivalent availability projection.
2. Compare the current projection with the stored projection in `warnDelta()`.
3. Thread the frozen projection through the issued-face context.
4. Make `dayInfoHTML()` use that projection when rendering an issued face.
5. Add a rendered test for archive and personnel-status changes, including revert-to-issued and AL.

## 4. Medium — Free text matching a person ID creates phantom pending

**Setup:** Put a valid person ID such as `bane` in a non-person text field—such as a programme name—without assigning that person anywhere.

**Action:** Publish, then change Bane’s CAT or seat.

**Expected:** No pending item: that person is not drawn on the face.

**Observed:** [`dayPeopleAttrs()`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:555>) recursively treats every string equal to a `PEOPLE` key as a person slot. The snapshot therefore captures Bane’s attributes and `warnDelta()` reports a face change even though the rendered document is identical.

**Fix:**

1. Replace recursive string discovery with the typed person-slot enumerator described in finding 1.
2. Cover aircraft crew, spares, sims, duties, ground/common-programme people, extras, member-input owners, and frozen sentinel crowds explicitly.
3. Reuse the same enumerator for snapshot creation and comparison.
4. Add a regression where a free-text field equals a real person ID and verify no `snap.pa` entry, pending item, or sign-off change results.

## 5. Low — Load confirmation sentence is malformed

**Setup:** Leave one member-input change pending and load a published version.

**Action:** Read the confirmation toast.

**Expected:** Clear wording such as “1 member input change stays pending…”

**Observed:** [`inputsLeftSaid()`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/drafts.ts:102>) produces “1 member input changed since stays pending.” Existing tests assert that malformed wording.

**Fix:**

1. Change the template to “`${n} member input change(s) stay/stays pending — …`”.
2. Update both expectations in `ui/latepub.test.tsx` and `ui/latepub-load.test.tsx` to assert the complete corrected sentence.

## Explicit negatives

- I found no missing D183–D185 live-warning code: CREW_REST, CREW_TIGHT, DAYS_RUN, qualification warnings, and OIL warnings are classified correctly.
- I found no live mark writer missing its warning code.
- `warnSliceOf()` excludes live warnings and trace; `faceWarn()` overlays live warnings and uses consistent worst severity/rank.
- The main issued week, DayPop, warning focus/click paths, and ALL-window warning messages use the official warning path.
- Medical warnings remain frozen.
- Input dates are excluded from the detail key, and F2 pairing remains constrained to the same person and compatible request state.
- OIL-only warning changes are excluded from the schedule warning delta, avoiding double-counted pending items.
- I did not report the known old-version board preview without warnings.
- I found no forward-code defect attributable only to legacy demo snapshots.
- No files were edited. No test command, focused or full-suite, was run.

