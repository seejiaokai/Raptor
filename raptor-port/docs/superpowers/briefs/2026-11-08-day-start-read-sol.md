# D1786 — Sol 6.1's code read (8 Nov 26, chat 6; brief: `2026-11-08-day-start-read-brief.md`)

The report as returned, whole; the disposition follows it.

---

The core change works for complete flying lines. I found **one pre-existing calculation gap and two documentation errors**. I changed no file.

Reviewed the branch against local `origin/main`, using the brief’s specified diff. I did not open another reader’s report or this job’s walk evidence.

1. **Medium — unfinished flying lines still produce completed work hours.**

   **Where:** [events.ts — `buildDay`](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/src/engine/events.ts:323), [validate.ts — `workSpan`](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/src/engine/validate.ts:154).

   **Concrete failure:** Create a crewed line with take-off **12:00**, landing blank, and no in-time or rally. With shipped settings, the work span becomes **09:00–14:00, five hours**. OIL returns no window because the landing is missing. The app has invented a landing at take-off and added debrief.

   A second incomplete shape also slips through: take-off blank, **08:00 IN TIME**, landing **13:00** produces seven work hours, while OIL returns no window.

   **Cause:** `buildDay` substitutes take-off for a blank landing. `workSpan` checks its calculated endpoints, without knowing whether both flight times were entered. Its existing unfinished-line guard therefore misses these cases.

   **Provenance:** Reproduced on the base too. The missing-landing case previously counted three hours; this change increases it to five. This is a surviving gap in the brief’s “case for case” agreement with OIL, rather than a newly introduced defect.

   **Exact fix:**
   - Add a transient marker to an ordinary flying event when its take-off or explicit landing is unreadable or missing.
   - Have `workSpan` skip that event completely, so it contributes neither endpoint.
   - Preserve the existing event times used by availability and crew rest; their partial-time behavior is separate.
   - Add tests through `buildDay` for both shapes, alone and beside a completed ground event, in both event orders. Pin that completed and overnight flights still count normally.

2. **Medium — the new published-day account incorrectly promises no pending change.**

   **Where:** [engine-rules.md — published-day account](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/docs/engine-rules.md:4619). Relevant functions: `warnDelta`, `signShown`, `officialWarn`.

   **Concrete failure:** Publish an **08:00–15:30** flight with no report entered and default rally set to **one hour**. Then change default rally to **three hours**.

   I reproduced:

   - The issued face keeps its original warning list.
   - The working copy gains the **12h30 long-day note**.
   - The day reads **one pending change**.
   - Working sign-offs given before that rule change become invalid.
   - Insights recalculates immediately.

   The document instead says “the day reads nothing pending for it.” The brief repeats that expectation.

   **Cause:** Freezing the issued warning does not remove its pending comparison. `LONGDAY` belongs to the frozen warnings compared by `warnDelta`.

   **Exact fix:**
   - Correct the lasting account and the builder’s handoff.
   - State that an altered frozen warning produces a pending change and invalidates working sign-offs under **D179 and D103**, while Insights updates under **D482**.
   - Add a regression test covering the sequence above and restoring the original setting.
   - Record the brief’s mistaken expectation in its disposition.

   **The observed application behavior follows the rulings.** The correction belongs in the account and coverage.

3. **Low — two lasting references still teach the replaced step start.**

   **Where:** [remarks-vocabulary.md — reporting day](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/docs/remarks-vocabulary.md:109), [engine-rules.md — OIL pooling](/C:/Users/User/projects/Raptor/.claude/worktrees/pr-day-start-7b064c/raptor-port/docs/engine-rules.md:2326). These describe `buildDay` and `workSpan`.

   **Concrete failure:** For a complete **12:00–13:00** line with nothing entered, those passages still direct a reader to the **11:00 step** for work hours. The changed code correctly starts at **09:00**. One passage also says the difference from OIL exists “by ruling.”

   **Cause:** The documentation sweep updated the new account and behavior register but left these earlier statements active.

   **Exact fix:**
   - Replace both statements with the **D1786 default-rally start** for work hours and long-day notes.
   - Keep the separate availability, SANS and crew-rest definitions explicit.
   - Remove the claim that the old difference remains ruled behavior.

What I checked and found whole:

- **60 direct comparisons** of completed-flight work spans against OIL passed, covering blank reports, later entered reports, typed RALLY, formation-specific instructions, unreadable and clockless lines, previous-evening reports, overnight flights, equal take-off/landing clocks and LATE SHOW. Default rally values included **zero, below step, shipped and maximum**.
- **Six shift checks** passed across SC, AVALON and BB: blank and earlier typed reporting retained their existing starts.
- **15 before-and-after scenarios** produced identical crew rest, non-long-day warnings, `day.fly`, busy windows, slot rules and crowd checks.
- Every production read of the changed event’s `report` was traced. I found no newly unsafe numeric use of `null`.
- Cross-week seeds retain the separate crew-rest inputs. The probe bridge exposes the derived events without requiring a numeric report.
- The Logic wording matches the approved wording and introduces no fixed setting value.
- The reference comparison intentionally lacks a blank-report flight in its seed. Its green result therefore cannot prove this changed fallback; the new positive tests provide that coverage.
- Diff whitespace checks passed.

Tidiness: Outside the rules engine, the changed lines add no new responsibility, feature-specific branch in a shared flow, or duplicate helper.

Verification limits: I ran direct, in-memory checks against the actual modules. I did not run standard Vitest, build gates or a browser walk. Visual appearance, printed output and phone behavior remain outside this code read.

Read-only review completed  
Rulings: none this session

---

## Disposition (chat 6, 8 Nov 26)

- **1 (unfinished lines):** both shapes reproduced and fixed red-first — no landing, and no take-off with an in-time entered — the event's report NaN, counted nowhere, as OIL. Pinned in `engine/daystart-default-rally.test.ts`.
- **2 (published-day account):** right — `engine-rules.md` corrected; the sequence pinned (publish at 1h, change to 3h: one change waiting, sign-offs fall, Insights +2h; put back: nothing waits).
- **3 (two old passages):** `remarks-vocabulary.md` §Reporting day and `engine-rules.md` §OIL pooling now state the D1786 start; "by ruling" removed.
