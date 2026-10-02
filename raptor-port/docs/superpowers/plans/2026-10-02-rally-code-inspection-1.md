Round 1: **CHANGES REQUIRED. No approval.**

Reviewed source snapshot `12a48bfe39da5018d0dcee4f5e8e11d627c2fe94d364d4d954b954fb727d227c`. All 78 recorded source/test hashes still match; I changed no inspected files.

1. **P1 — Prior-day reporting misses rest from an overnight commitment two schedule dates earlier.**  
   Reproduced using the frozen production modules in an isolated Vite SSR process: Monday duty 22:00–02:00, Tuesday empty, Wednesday IN11:00 / TO10:00 / LD11:00 / B07:40. D503 correctly resolves reporting to **Tuesday11:00**, but validation returns no crew-rest warning and an empty Wednesday clearance map. Rest since Tuesday02:00 is **9 hours**, three hours short.  
   Cause: `crewRestDay` receives only the immediately preceding schedule day; an empty Tuesday hides Monday’s overnight end. This is existing predecessor selection made insufficient by the broader reporting-day rule.  
   Fix: include the second preceding day when its end/clearance can reach the actual signed reporting instant, translating its minutes into the same axis. Preserve source day/slot provenance, issued versus working context, picker agreement and forward traces. Cover loaded-week and adjacent-week cases, plus a clear-rest control. Reproduce through actual controls before closing.

2. **P2 — A previous-day wave followed exactly at midnight retains people in an empty availability band.**  
   Reproduced `waveWindows` for resolved starts **−60, 0**: first result is `{in:-60,s:0,e:0}` without `priorEmpty`. `availByWave` consequently accepts eligible people in that empty band.  
   Cause: the first band’s start is forced to zero before testing whether the empty interval arose from a previous-day start.  
   Fix: base that special-case predicate on the raw resolved wave start, retaining the existing handling of ordinary same-day ties. Add negative→midnight regression beside negative→negative and same-day tie controls; prove actual available-crew membership.

Explicit negatives from the read:

- Separate IN/RALLY applicability, formation matching, first-valid-clock grammar, immediate rally and date-before-minimum selection match the approved contract.
- Publication checks exist before first issuance, AL reconciliation and raw final issuance; no mutation-before-refusal defect found.
- No new persisted reporting schema or personal targeting found.
- WorkSpan/Insights retain their shared calculation and issued-world selection; ordinary busy windows and nominal OIL arithmetic remain distinct.
- SC typed-B priority, brief-date interpretation, late-show logic and standalone exemptions remain separately guarded.
- Fixture adjustments precede publication baselines/actions; inspected assertion changes track approved behavior or select the relevant person warning. The reference remains unchanged, and its new-warning exclusion has a positive untouched-seed check.

Evidence limits: these two reproductions are module diagnostics, **not UI walks**. Final gates and R01–R25 evidence remain pending. I opened **zero walk pictures** and do not count the preliminary run as release proof. A fresh round 2 should inspect the corrected snapshot plus completed gate/walk evidence. Claude’s further reads and walker trial remain owed before main.

Rulings: none this review.
