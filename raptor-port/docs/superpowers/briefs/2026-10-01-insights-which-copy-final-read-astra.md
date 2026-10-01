REVISE

## Finding 1 — MEDIUM: live roster membership leaks into the issued-world report

**File/function:** [engine/insights.ts — `computeInsights()`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/insights.ts:46>), with the missing world data at [engine/validate.ts — `issuedWorld()`](</C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:1696>).

`computeInsights()` correctly obtains days, events and warnings from `issuedWorld()`, but builds **Not on the flying programme** from live `PEOPLE` membership:

```ts
Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].pers && !fc[id])
```

That is more than using `PEOPLE` for a live callsign label. Published snapshots already freeze their aircrew roster in `snap.ros` at [publish.ts:568](</C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:568>), specifically so a new arrival does not change an issued face. Insights never reads it.

**How a person sees it**

- **Setup:** Publish all seven days, open Insights, and note “Not on the flying programme · N available.”
- **Action:** On Admin → Users, add a new pilot or WSO and leave them off the schedule.
- **Expected:** Because every day still counts its latest published version, the new person must not enter this figure until a day is issued with that person in its frozen roster.
- **Observed from the production path:** The people command revalidates, and the next Insights render enumerates live `PEOPLE`; the new person immediately appears and `N` increases although no issued version contains them.
- **Disproof of correctness:** The new callsign appearing immediately in that section. Archiving an otherwise-idle aircrew member produces the inverse failure: they disappear while the issued days still count them in their frozen rosters.

This writer was absent from the 19-scenario walk. Admin was opened, but roster add/archive was not performed.

**Branch age:** The live-roster line is unchanged from `origin/main`, so the implementation seam is older. It is nevertheless a release-relevant omission in this branch because D478/IN1 newly promises that **every figure** comes from the issued/working day-by-day world.

**Exact fix**

1. Extend `issuedWorld()` with a `roster` ID set.
2. Build that set day by day:
   - For a readable published day, use its current snapshot’s `snap.ros`.
   - For an unpublished day, use today’s live non-archived, non-personnel roster.
   - Combine the day rosters as a union for the week and retain only IDs still resolvable for display, matching `rosterShown()`.
3. In `computeInsights()`, derive `idle` from that returned roster minus `fc`; use `PEOPLE` only for current display labels and sorting.
4. Add regressions to `insights-published.test.tsx`:
   - Publish all seven days, add an aircrew member through the production roster command, and prove the idle list does not move.
   - Issue a later version and prove the person then appears.
   - Archive an idle person and prove the issued list retains them until reissue.
   - Keep one day draft and prove a roster change moves the figure immediately.
   - Rename a person and prove only the displayed label changes immediately.
5. Re-walk Admin → Users → Insights for admin and member, desktop and phone, then rerun the existing break tests and gates.

## Explicit negatives

- I checked the `ISS_DAYS`/`ISS_EVD` lifetime and found no stale-week or snapshot-swap path. `computeInsights()` calls `validate()` immediately before `issuedWorld()`; the alias path clears both caches, the divergent path captures both inside `withIssuedWeek()`, and its `finally` restores the working globals. No production `withDaySnap`/`withChipWorld` callback calls `computeInsights()`, and `loadWeek()` validates after installing the new week.
- A pending hide does not require the second pass: it changes neither days nor events, while `faceWarn()` applies the hide keys stored with the issued version. That alias case is sound.
- Draft-day counts, events and warnings come from the same official pass, with published neighbours installed as issued. I found no mixed-day warning/count seam.
- The protected/unreadable-day empty count is not reachable through a new-data production writer: current publication stamps the book and creates a complete deep-copied snapshot. The reachable cases are damaged, foreign or old stored blobs, so D56 excludes them.
- Other visible totals are sound: the day bars and day-details panel use the same face-warning bundle; the Logic page’s “fired this week” is deliberately a current-rule/working-schedule diagnostic, not another issued Insights total; Print and CSV expose per-day documents rather than a competing weekly total.
- The door/page/role/figure roll-call is otherwise complete. I agree that the Scheduler Board’s missing door is older and governed by its approved D349 bar; D478 changes what Insights counts, not the board chrome. It remains a separate owner question.
- I agree with the rule-change disposition: rules are not versioned, so hours are recalculated from issued content using today’s rules, while only the designated live warning classes can move on a published face. Changing that requires a product ruling and stored issued-hour semantics.
- I agree that negative work hours are an older, real new-data defect in `workSpan`, but it is outside this branch.
- I did not rerun tests or gates because the brief required a read-only final review; I treated the evidence sheet’s results as prior evidence, not fresh verification.

