# Astra's blind read — job 2 (commit 300be6535), saved as it arrived, 13 Nov 26 about 06:10

**Two findings:** the reference comparison is incomplete, and two revised passages incorrectly describe when a Logic change makes a published day pending. I found no production failure in the revised warning wording or the published OIL calculations.

1. **Medium — the reference comparison misses the crew-rest warning for a “TBD” landing. Confidence: high; reproduced.**

   Give someone a Monday sortie taking off at 12:00, landing `TBD`, with two hours’ debrief, then a Tuesday brief at 01:00. The app correctly warns that Monday ended at 14:00 and crew rest clears at 02:00. The reference window produces **no crew-rest warning**. Blank landing and a typed 13:00 landing provide matching positive controls.

   The changed adapter in [refwin.ts:621](C:/Users/User/projects/Raptor/raptor-port/src/testing/refwin.ts:621) copies the no-landing flag and new wording, but leaves the reference’s calculation using the unparseable landing. It also stores that unresolved landing at line 624. The production calculation falls back to take-off for this case.

   The reference window additionally retains the two old “+ flying” names. Thus it does not fully mirror either change, despite the documentation’s claim.

   This is a comparison-test defect, not a demonstrated defect in the running app. The missing fallback predates this change, but the revised mirror still fails the explicitly requested `TBD` case.

   **Exact fix:**
   - Extend the in-memory reference adapter to resolve an unparseable landing to take-off before calculating the rest end.
   - Store that same resolved time when recording the winning sortie, alongside its no-landing flag.
   - Replace the two warning names in the in-memory reference.
   - Add direct app-versus-reference assertions for blank, `TBD`, arbitrary words, a landing equal to take-off, and a later typed landing. Assert the complete warning and renamed labels. Leave the reference source untouched.

2. **Low — the revised documentation wrongly says OIL is the only reason a Logic change makes a published day pending. Confidence: high; reproduced and supported by an existing test.**

   Publish an ordinary Tuesday flight with its brief left blank, using the suggested brief. Change the brief lead from 140 to 150 minutes. The day becomes pending even though it earns no OIL and has no OIL difference.

   That contradicts “the one way a Logic change makes a published day pending” in [engine-rules.md:3446](C:/Users/User/projects/Raptor/raptor-port/docs/engine-rules.md:3446), and “only a change that would move somebody’s OIL” in [AM7:46](C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md:46).

   The existing printed-brief exception deliberately compares the brief lead in [publish.ts:853](C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:853). It is already pinned by [rulesfirst-7-published-day.test.ts:154](C:/Users/User/projects/Raptor/raptor-port/src/engine/rulesfirst-7-published-day.test.ts:154). My separate reproduction changed the pending count from zero to one while the OIL difference remained empty.

   **Exact fix:**
   - Correct both passages to retain the printed-brief exception alongside changes to OIL amounts or worked times.
   - State that other check-only Logic changes do not themselves make the day pending.
   - Keep the existing behaviour and its test; this requires a documentation correction.

**Checked and found sound:**

- The production warning names change without changing their messages. Hiding and grouping use warning codes and other stable fields, so the name changes do not break those paths.
- The production no-landing flag distinguishes blank or unparseable text from a typed landing equal to take-off. The warning tail follows the winning rest-ending event; later flights and non-flight commitments replace its associated information.
- Published OIL keeps its full-day threshold, report lead and debrief in its publication evidence. The credit pass and downstream figures use that evidence. I found no path in the reviewed consumers that immediately recalculates issued credit using a changed full-day setting.
- I traced publication, amendment, unpublish, undo/redo, loading an older version, holiday handling, several-day inputs and placeholder membership. Loading a version into the working copy does not replace the issued evidence.
- The Logic strip’s singular/plural wording and member suffix match the brief. Resetting or restoring values uses the existing changed-setting count.
- The new warning tests assert positive wording and behaviour, rather than merely checking that old text disappeared.

**Verification limits:** 17 warning tests and 12 published-OIL tests passed through an in-memory harness executing the actual test bodies. This was not the normal Vitest runner. I did not run the full suite or a browser walk. The reviewed source still matches the requested commit. No files were changed, and no other reader’s report or walk report was read.

Tidiness outside the engine: no additional issue worth raising.

Rulings: none.
