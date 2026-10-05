**Astra — REVISE: one remaining finding, RF5 partly unfixed.**

Read-only review of `a8355d98`, its tests, the preceding code and relevant callers. These are source-traced conclusions, not browser reproductions. No files changed; no build or tests run.

**Finding — P3: an empty wave still hides an unreadable reporting clock.**

Steps:

1. On Scheduler Board, enter `8h00 IN TIME` in a normal wave’s In-time / Rally box.
2. Remove every aircraft line from that wave, leaving the wave and its reporting text.
3. Edit the reporting text again and inspect the day’s warnings.

Expected: “No recognised clock” remains available for the reporting instruction, independently of take-off. This empty-wave case was explicitly requested in Sol’s first report.

Actual: both editing feedback and the warning list become silent. [reporting.ts:94](/C:/Users/User/projects/Raptor/raptor-port/src/engine/reporting.ts:94) still generates every advisory inside the formations loop. With no formations, it generates nothing. The removal path permits this state and preserves the wave: [board.ts:861](/C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:861).

**Provenance:** RF5/W19 partly unfixed; this is not a new regression against the parent commit. It affects newly entered data.

Fix:

1. Preserve the existing standalone-wave and cancelled-formation exclusions.
2. When a normal wave has no formations, emit a nonblocking advisory for each malformed reporting line, naming the wave and anchoring it to In-time / Rally.
3. Add tests for removing the final formation, editing the remaining instruction and adding a formation again. Check editing feedback and the warning list; ensure no duplicate advisory.
4. Keep readable clocks and genuinely clockless notes quiet.

**Results for RF1–RF5 and their tests**

- **RF1 — fixed for production event paths inspected.** An unfinished flight can no longer lend its reporting time to another event’s end. The mixed-event test covers both orders and would fail with the preceding implementation; the Insights test follows the real event builder. Complete flights, negative reporting times and overnight spans remain supported. The implementation rejects numeric NaN, rather than enforcing the comment’s stronger “both real numbers” condition. However, I found no production work-event kind supplying legitimate null/undefined endpoints: non-flight events pass through the window builder, which supplies an end or omits the event. Nullable absence windows are a separate collection. No concrete regression found.
- **RF2 — the reported ordinary Tab escape and missing Board coverage are repaired in source; coverage remains incomplete.** The new confirmation test would fail without containment. It checks both boundaries, entry from behind and listener removal after closing. The Board test checks Sort all and reopening the schedule route. It does **not independently pin the new Board-window guard**: containment itself prevents the schedule handler from acting. Cancellation, overlapping sheets and a sheet without enabled controls lack dedicated tests here.
- **RF3 — fixed.** Stored whitespace now uses the writer’s equivalence before and after a save attempt. Substantively different unsaved wording still cannot receive an answer. The added test would fail before this change and requires precisely one answer command with the original text untouched. No new write, signature or permission bypass found. Board and published-day variants are not directly covered by this added test.
- **RF4 — fixed.** Moving to another aircraft’s Remarks rebuilds the button with that field and its caret. The added test would fail previously and checks answering and returning to the second field. Reverse movement and movement while another question remains open are not directly pinned. No wrong-formation answer or second simultaneous question found.
- **RF5 — partial.** The added test would fail previously for malformed clocks beside an untimed formation. Readable clocks, clockless notes, standalone waves and cancelled formations remain quiet; chronology still waits for take-off. The empty-wave omission above remains.

**Keyboard checks and limits**

The shared handler leaves Escape untouched. The four confirmation sheets retain their Escape handlers; all six consumers retain enabled keyboard-reachable closing controls. Sort all had no dedicated Escape handler before this commit and still has none.

With no enabled controls, Tab stays on the container. Sequentially opened sheets use the latest registered sheet; cleanup removes the closing sheet and removes the document listener after the last one. Ordinary stacked closing looks sound by inspection.

I inspected the Leave War and Tracker traps and found no concrete reachable conflict in the traced flows. Their coexistence, unusual closing order and native browser traversal remain unproven by these synthetic tests.

I did not read the other second-round report, concurrent walker results or unrelated application areas. Historical-data-only harm was excluded.

**Confidence:** moderate; no additional serious failure established, but RF5 needs completion and native keyboard checks could change the RF2 assessment.

Walk: NOT RUN — read-only review required by the brief.  
Rulings: none this session.

