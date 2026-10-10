1. **Correct §3.7’s answer-reset rule.** It says: “The answers are voided and asked again when the day, the hours or the person change, as today.” That is broader than today’s behaviour and conflicts with §3.8’s promise to leave named inputs unchanged.

   `voidedOil` keeps a No when hours change, and keeps a positive answer when the new hours still give the same suggested amount. A date change leaves old answers stored but inert outside their dates; `oilGate` asks for newly applicable, unanswered dates. Following the plan’s sentence literally could turn an acknowledged commitment into an unanswered one and remove its default OIL unnecessarily.

   **Exact change:** replace that sentence with:

   > Keep the existing `voidedOil` and `oilGate` rules. Changing person, or leaving the kinds that ask, voids the answers. Changing hours drops only a positive answer whose suggested amount changed; a No stays. Changing dates keeps existing answers, which apply only to their own covered dates, and asks for newly applicable unanswered dates.

   Add tests for both placeholder ids: No survives a timing edit; Yes survives an edit that leaves the suggested amount unchanged; a positive answer is dropped and asked again when that amount changes. Pin the same named-input behaviour unchanged.

2. **Make the restore tests explicit in §6.1.** The hard-check design is sound, but successful Undo/Redo of a good filing does not prove rejection during restore.

   **Exact addition:** test the real restore command with each refused after-image—wrong kind, multiple dates, and group marks—for both placeholder ids. Assert complete rollback and no new history or Undo entry. Also test successful commands changing only `acc`, `ord`, or the OIL answer of a valid placeholder record, plus a version load and a plan switch. These tests must exercise the command boundary, without relying on the picker or normalizer to reject first. This is a coverage requirement, not a finding that the current gate bypasses restores.

3. **The shared OIL default is sound.** The proposed distinction is enforceable: the evidence’s request holder identifies a placeholder-held request; the day’s row identifies typed men; saved membership identifies the crowd. Typed men default Yes, crowd-only men follow the filer, and a man in both is counted once. Routing the credit and `spanDefault` through that distinction gives the switches the correct direction: grant after No or missing, refuse after Yes. A positive answer admits work without capping the man’s daily amount. I found no additional default-credit reader requiring a separate rule.

4. **The publication boundary is sound.** The issued day contains its row, projected answers and crowd membership. Credit reads that evidence, while the working comparison detects later answer or membership changes. The plan does not require reconstructing an issued crowd from live availability. Replacing the name box, removing the last placeholder, cancellation, information-only and removal remain subject to the existing eligibility checks. A named holder’s request with a scheduler-dropped placeholder retains its existing defaults.

5. **The save-boundary design is sound.** Hard invariants run after changes are derived and before the command is kept, including restore commands. The proposed check reads no role, so admins cannot bypass it. Checking changed input after-images avoids scanning untouched demo records. The separate List Add preflight, whole-selection group check, refusal in both reassignment directions, and explicit Unavailable refusal close the named doors. Valid filing, ordering and answer changes remain legal because those fields do not alter the three structural rules.

6. **The Event design and filter repair are sound.** The table flags produce the stated commitment, crew-rest, OIL, landing and red SC MAIN behaviour. The plan correctly names the separately maintained schema list and both reference patches, `reshift` and `reirest`. The hand-typed EVENT keyword ripple follows the existing flag-derived matcher. Replacing Everyone’s person-filter value must include the reveal helpers as specified; keeping the type filter’s separate “all types” value is harmless. I found no additional production kind list requiring a different design.

7. **The rulings and five readings are consistent.** D711’s filer-only bell is the stated exception to D702’s “only on the day and the schedule.” Live membership applies to the working copy; D44 still freezes publication. D711 changes the answer source for a request **held by** a placeholder, while D43/D46 remain intact for a placeholder **dropped onto** a named request. None of §8’s five readings needs another owner decision.

8. **Review limits:** this is a plan review, not approval of the implementation edits visible during the read. I changed no file, ran no tests, and opened none of the closed review reports. The FULL build check and independent code reads remain required.

Rulings: none this session

VERDICT: CLEAN WITH THESE EXACT CHANGES