# [OIL-LATER-PASSES-ON] — the code read by Astra (GPT-6 Astra, high), 28 Nov 26 — its final message, copied whole. Brief: `2026-11-28-oil-later-code-read-brief.md`.

One medium-severity finding in the committed change. A concurrent, uncommitted correction appeared during this review; I read it and confirmed that the failing reproduction now passes. No further confirmed findings.

I changed no files and read neither the other reports nor the walk evidence.

1. **P2 — Editing an input already taken off the programme unnecessarily clears all four sign-offs.**

   **Steps:** Create Saturday Training from 08:00–17:00 and answer Yes to OIL. Take it off the programme, publish the day, then sign its four boxes again. Open the taken-off input, shorten it to 15:00–17:00, answer Yes to the offered half-day OIL, and save.

   **Result in the committed code:** All four sign-off boxes become empty, although the day still shows zero pending changes. This forces unnecessary signing again; it does not change the published OIL award.

   **Cause:** [oilev.ts — oilAnsKept](/C:/Users/User/projects/Raptor-endtime/raptor-port/src/engine/oilev.ts:1028) remembered answers for every projected input, including those taken off the programme. [publish.ts — oilAnsBoundOk](/C:/Users/User/projects/Raptor-endtime/raptor-port/src/engine/publish.ts:1686) then invalidated the signatures when such an answer changed. The existing schedule and OIL comparisons correctly exclude that input.

   **Fix:** Build the remembered answers from `keyedInputs(ev)`, matching the existing comparison. Keep a regression test covering both a changed answer and an answer removed while editing a taken-off input.

   **Verification:** Reproduced with a newly created input through the normal creation, removal and editing commands. The assertion failed before the concurrent correction and passed afterwards: four names retained, zero pending changes. This is not an old-data finding.

The remaining checks found no additional defect:

- Later asks again at the next sign-off; partial Save leaves unanswered rows for the next signer.
- The rendered footer selects the expected wording for none picked, some picked and the last signer; picking every row removes the line.
- Save records answers before the held signature. Changing that answer afterwards invalidates the signer who signed over it.
- On a published day, answering an open-at-signing question preserves the names while leaving one pending change. The issued copy stays unchanged until the amendment is published.
- Other input changes still invalidate signatures; restoring the signed content restores them.
- Undo/Redo, plan duplication and switching, and storage’s week split/rejoin preserve the remembered answers.
- Logic changes still invalidate signatures when they change OIL those signatures covered. Reverting the setting restores them.
- Missing times refuse signing before the OIL list opens.
- The answer-writing doors and the sign-off display/count/publish readers use the shared checks. The schedule CSV export reads the issued copy and is not a saved-plan backup.

These were source reads and in-memory engine, command and DOM checks. **Walk: not performed.** No browser layout, reload-through-storage, full-suite or throttled repaint performance claim is made. The repaint comparison is cached within a render pass; its actual timing remains unmeasured.

The local comparison against main includes unrelated older work. This report covers the named OIL change and its dependent paths.

The builder’s readings:

- **(a) Supported.** Names signed while the question was open were not signed over either later answer. They remain through another answer change until re-signing.
- **(b) Supported.** Saving answers before the held name makes that signer accountable for their own answer.
- **(c) Supported.** Removing an answer changes what was signed over and invalidates the affected names.
- **(d) Supported.** Publishing spends the working signatures and changes the published baseline. Historical signer names remain on the issued version.

Tidiness, reported only: the pending comparison reuses the existing calculation rather than duplicating it; helper names are sufficiently clear; the footer’s nested expression could become a named local value, with the last-signer calculation skipped when no footer line is needed.

Rulings: none this session.