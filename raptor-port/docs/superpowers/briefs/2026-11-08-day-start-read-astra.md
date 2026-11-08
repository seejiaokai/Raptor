# D1786 — Astra's code read (8 Nov 26, chat 6; brief: `2026-11-08-day-start-read-brief.md`)

The report as returned, whole; the disposition follows it.

---

**Changes requested: two reproducible correctness gaps remain.** I changed no files and did not open another reader’s report or the walk evidence.

**1. P2 — An unfinished flight invents work hours and can now raise a new long-day warning.**

Where: `events.ts`, `buildDay` (lines 322–323, 407); `validate.ts`, `workSpan` (lines 168–178).

Reproduction: give Torch a Friday flight with take-off **05:00**, landing blank, no in-time or rally, and a ground commitment **14:00–15:00**. Keep the standard settings.

- This branch reports **13 hours, 02:00–15:00**, and raises LONGDAY.
- OIL counts only the ground commitment: **1 hour**.
- The main-branch implementation reports 11 hours without LONGDAY. The underlying fault is older; this change increases the invented hours and introduces the warning.

Cause: `buildDay` substitutes take-off for a blank landing. Consequently, `workSpan` sees a complete flight and cannot apply its existing “unfinished flights contribute nothing” safeguard. The new tests clear both clocks together, missing this partly completed line.

Exact fix:
1. Preserve whether an ordinary sortie has both actual clocks when constructing its event.
2. Make `workSpan` exclude an incomplete sortie before pooling either endpoint. Keep the existing occupied-window and crew-rest fields unchanged.
3. Add regressions for blank landing, clearing an existing landing, and missing take-off with a typed report, both alone and beside another commitment.
4. Retain the distinction between a **blank landing** and **explicitly equal take-off and landing**, which may legitimately count report and debrief time.

**2. P2 — A flight measuring zero time still extends another commitment’s workday.**

Where: `validate.ts`, `workSpan` (lines 168–180); `insights.ts`, `computeInsights` (line 62).

Reproduction: set default rally and debrief to **zero**. Give Torch a flight with take-off and landing both **12:00**, no report entered, and a ground commitment **15:00–16:00**.

Insights reports **4 hours, 12:00–16:00**. OIL correctly excludes the zero-duration flight and counts **1 hour**. With the flight alone, Insights also lists a zero-minute working day.

Cause: `workSpan` accepts equal endpoints and includes that instant when finding the day’s earliest start. This is an older defect still covered by the brief’s requirement to compare zero settings and equal clocks.

Exact fix:
1. After validating an ordinary flight’s endpoints, exclude it from the work-hours calculation when its calculated end is no later than its start.
2. Apply that exclusion before combining it with other events.
3. Test the flight alone and before/after another commitment, including Insights’ day count.
4. Keep equal-clock flights counted whenever their actual report/debrief window has positive duration.

**Published-day account needs correcting; the observed application behaviour is allowed.**

The new account in `engine-rules.md` at lines 4619–4620 says the day reads nothing pending for the frozen long-day note. That is too broad.

I published an **08:00–15:30** flight with a one-hour default rally, then increased the default to three hours. Insights changed from **10h30 to 12h30** immediately; the issued face retained its original warning state; **one warning change became pending**. Reverting the setting cleared it. The published snapshot stayed unchanged.

That follows D179’s frozen-face/pending-change rule and D482’s immediate Insights recalculation. Correct the live account rather than suppressing this pending change. Leave the completed review brief unchanged.

**Checked and found whole**

- **85 in-memory comparisons passed**, covering entered and absent reporting times, formation-specific instructions, typed RALLY, unreadable clocks, evening-before reports, overnight flights, LATE SHOW, and five default-rally values.
- Traced report consumers: crew rest, tight advisories, SANS and availability retain their separate clocks; no additional null-report failure found.
- Published-day checks preserved issued content, excluded pending flight edits from Insights, and restored the original result when changes were reversed.
- The original checks passed: **728 passed, zero failed**.
- An independent in-memory seed comparison matched reference events, warnings, crew-rest results and event collections.
- The Logic wording matches the approved text; it introduces no fixed editable numbers.
- Tidiness: no additional concern in the changed interface code; engine restructuring was excluded.

These were source and in-memory checks. I did not run the full Vitest suite, build, or browser walk, and this report does not certify their results.

Read-only review completed  
Rulings: none this session



---

## Disposition (chat 6, 8 Nov 26)

- **1 (unfinished flight):** reproduced; fixed red-first — `events.ts` gives a sortie with no landing (or, from Sol 6.1, no take-off) typed a NaN report, so `workSpan`'s own guard counts it nowhere, as OIL counts it nothing. Pinned in `engine/daystart-default-rally.test.ts`.
- **2 (zero-measure flight):** reproduced; fixed red-first — `validate.ts workSpan` skips a sortie whose end is not after its start; a typed equal take-off and landing with a report or debrief still counts (D49). Pinned there.
- **Published-day account:** right — `engine-rules.md` §Where a day with nothing entered starts corrected (one change waiting, sign-offs fall, D103; Insights at once, D482); pinned by a published-day test in the same file. The brief stays as written.
