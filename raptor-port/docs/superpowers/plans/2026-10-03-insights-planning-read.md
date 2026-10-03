# Independent Astra planning read — 3 Oct 26

Read-only delegate `/root/insights_planner`, fresh gpt-6-astra under D496. Complete final response below, retained before
the host's independent challenge. No application code authored/approved by this delegate. Owner answers and picture
look remain pending. No final inspection or build approval is claimed.

## Complete response

D512 independent meaning read: **PASS**. The short ruling at `.claude/rules/decisions/scheduler.md:49` matches the bold
rule in `.claude/decisions-full/scheduler.md:11`. The home at `raptor-port/docs/ui-contracts.md:4753` preserves weekly
per-person blue/red segments, both segments for a mixed person, and unchanged work-hours/count/version meanings.
The host's scaffold correctly labels matching, expansion and placement as proposals. This approves the record's
meaning, **not the plan below or any code**.

**Settled scope**

- Existing weekly sortie-count bars: Red and DS are red; other missions blue. One mixed bar per person.
- Board gains an Insights opener. Placement awaits the picture: desktop beside bell; phone within existing ⋯.
- Latest issued version per day everywhere; working copy only for unpublished days. Pending mission changes must wait
  for publication.
- Current Logic rules continue to affect work hours immediately, including issued days.
- No change to counting eligibility, cancellations, standalone exclusions, people, permissions, warnings or earned leave.

**What else was discussed**

The Board opener is the additional unbuilt Insights item. Which schedule version counts and how Logic changes affect
work hours are already settled and built. The negative-hours repair is on the separately checked Rally branch. The
older `INSIGHTS-WORKING-COPY` question is stale and superseded by D478; reconcile/archive it rather than asking again.
No recorded owner decision about sortie-list expansion was found.

**Actual naming boundary**

Seed Mission values are BFM, SAT, ACM and AD; the second week uses BFM, SAT and ACM. Two aircraft remarks say `RED AIR`
under ACM formations; one says `DS FOR VL` under AD. They are remarks, not mission names. With the recommended exact
Mission-box classification, those rows remain blue.

The two pending owner questions are sufficient. Recommended classification: trim outer whitespace, compare
case-insensitively against whole `Red` or `DS`, read the formation's Mission field only. Do not silently accept substrings,
remark overrides or variants such as `RED AIR`. Recommended list: initial twelve plus **Show all N aircrew**, with
reversible collapse.

**Proposed bounded design/spec**

Keep the four tiles and existing section order. For Flying load, keep descending weekly total and existing callsign
tie-break. Draw blue first, red second, their combined length against the largest person's total; retain the total at
the right. Add a small legend: **Blue — other missions; Red — Red / DS**. Show compact visible text such as
**2 blue · 2 red**, rather than relying on colour or hover. All-blue/all-red rows must show no phantom opposite segment.
The mock's illustrated totals are examples, not claims about actual missions. Work-hours bars retain their current
appearance and meaning.

Board's new controls open the same existing window, closing ⋯ first on phone. The window must sit above the Board,
close back to it, preserve the current day/week and Board scroll, and not resize existing buttons. Update the ⋯
accessible label/title to include Insights.

**Implementation invariants**

Current per-person count increments once per occupied cockpit seat on each uncancelled aircraft in an uncancelled
formation of a non-standalone wave. Both pilot and WSO count; the same person in both seats currently counts twice.
Preserve that unusual case rather than quietly deduplicating. The top Sorties tile counts aircraft, so it is not the
sum of both crew members' bars. SC/AVALON/BB do not count; sims, duties, passengers and extras do not become sorties.
Key aggregation by person id, not callsign; issued roster controls idle people, while current callsigns supply labels.

Add category counters in the existing eligible-aircraft traversal, using the same issued formation supplying each
count. Require `blue + red === n`; no second traversal over working globals. Add no persisted fields or validation
pass, and do not reshape the published world.

**Branch recommendation**

Create `codex/insights-mission-mix` from the planning branch after its notes/pictures are committed. **Keep it
independent of Rally and Discard:** their checked snapshots and evidence remain intact. Mission counts and the opener
do not require Rally code. Do not cherry-pick selected timing repairs or merge entire builds merely for a mock.
Explain that the isolated Insights preview will initially retain the planning baseline's work-hour behaviour;
integration with the complete reviewed Rally branch gets its own focused checks after the review/merge order is
settled. If a combined preview is needed, explicitly record the full dependency on a separate integration branch.

**Verification plan**

Treat the bounded batch as **WALK**, consistent with the prior Insights reader/opener classifications: new derived
chart and shared window/control; no official-record writer, stored shape, permission, earned-leave or warning change.
Re-answer the eight questions against the actual diff; widen if implementation touches those areas.

- Unit/data: exact approved matching boundaries, mixed/one-colour/empty bars, seat counting, cancellation and
  standalone exclusion, unchanged totals/order/hours, identity rename.
- Issued lifecycle: draft change updates; published mission edit does not; AL publishes the new split; earlier-version
  preview does not replace latest counts; published and draft neighbours coexist. Retain existing hidden-warning and
  Logic-hours tests.
- UI/browser: visible segment widths and exact counts, no clipped totals, empty list, long callsigns, more than twelve
  people and expansion, keyboard reach; desktop/phone plus short screen.
- Every door: existing shell desktop/phone, new Board desktop/phone, read-only/published Board state; topmost centre
  hit-test, close/reopen, unchanged Board day/scroll.
- Appropriate required gates under the PC lock; existing geometry/performance checks, measured on the built bundle.
  Save and inspect selected distinct pictures; fresh independent Astra code inspection after the walk. Claude's
  further plan/code read remains owed before main.

Rulings: none added by this delegate; D512 was independently compared as requested.

## Host disposition

Sol accepted the faithful D512 meaning read and independently challenged the proposal as recorded in the linked
design's final section. Questions remain pending; no artifact authored by Astra was approved by Astra. This planning
read is complete and its response is preserved; later owner answers belong in the design and their own ruling rows.
