1. **CHANGES REQUIRED**

2. **Finding — the new Logic explanation contradicts the rule. Medium; newly introduced.**

   At [logic-html.ts:125](C:/Users/User/projects/Raptor/raptor-port/src/ui/logic-html.ts:125), a line with “no take-off yet” is described as “not the end of the day before.”

   **Concrete case:** Give X a Monday line with landing **22:30**, leaving take-off blank. Give X Tuesday’s **07:00** flight. Monday’s landing plus debrief correctly establishes the previous end and raises Tuesday’s breach. The new explanation tells the scheduler that Monday’s line cannot count.

   **Cause:** The text treats “no take-off” as “nothing measurable.” The calculation correctly distinguishes those cases at [validate.ts:457](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:457). The landing-only case is explicitly pinned at [restblank.test.ts:269](C:/Users/User/projects/Raptor/raptor-port/src/engine/restblank.test.ts:269).

   **Evidence:** I also opened the saved Logic-page picture; the contradictory sentence is visibly displayed. On `origin/main`, landing-only ends already count and this new explanatory row does not exist.

   **Fix, step by step:**
   1. Replace the blanket “no take-off” exclusion with “A line with no usable times contributes no measured report or end.”
   2. Explicitly state that a typed landing still supplies yesterday’s end, including debrief; Brief, In-time / Rally and SC B remain usable reporting instructions.
   3. Replace “checked the moment a take-off is typed” with wording that covers any usable time or instruction being entered.
   4. Add a rendered-Logic assertion for the landing-only exception, retain the existing engine test, and inspect the corrected row at both widths.

   I found no concrete new arithmetic defect in the reviewed change.

3. **Absences against the roll-call**

   The following separates source wiring from the supplied walk evidence.

   | Objects, readers and visible doors | Assessment |
   |---|---|
   | SANS cards, Personal Inputs, Unavailable and crew-list pucks | Existing missing dashed/dotted drawings are already filed. No changed renderer worsens them. |
   | **ALL AVAIL window: person’s puck, warning reason, flagged count and tap** | **Missing from the sheet’s roll-call.** The source reads the shared warning, but C’s S29 explicitly says the affected man was **not in that crowd**. Opening the window proves neither his warning nor his gesture. |
   | Armed crew list and placement toast | Timed sibling, tap and desktop drag have evidence. **Cloning a blank sibling carrying only Brief/In-time is not covered by the new unit test or the reported walk.** |
   | SC MAIN clearance and B-only report | Shared clearance calculation remains wired; B-only warning is covered. The specialised picker with its shift start cleared lacks direct evidence. |
   | Current published face, current-version look, details and Insights | Existing shared readers reach the changed calculation. Supplied S03 and independence walks cover their principal routes and sign-offs. |
   | Older-version look and saved plans | Recorded versus recalculated behavior remains separated; S23 supplies evidence. |
   | Sunday’s forward trace and loaded Monday | Shared calculation remains wired; S02 supplies evidence. |
   | Working week, Board, ordinary cockpit/duty/sim/ground/programme pucks and warning clicks | No missing new call site found. Supplied walks cover their principal displays. |
   | Hidden warnings and counts | Key remains tied to wording; S12 covers blank-line changes, restoration and published hiding. |
   | SC SPARE, AVALON/BB, next-week peek and dedicated exports | Their documented exclusions remain; no new rest renderer is required here. |
   | Admin/member/guest and overlays | Admin/member evidence exists. **Guest is absent from the walk account.** S29 did not establish its intended higher-priority chip combination. |

   **Highest-value missing scenarios, in order:**

   - **ALL AVAIL:** Arrange a timed crowd that actually includes X while X has a crew-rest breach. Open it, tap X, then add an unrelated blank assignment. Expect the warning reason, appropriate marks and highlighting to remain. Missing or stale results would disprove correctness.
   - **Blank sibling prediction:** Monday ends late; Tuesday’s formation has another crew member, no take-off, and Brief 05:00. Arm X’s empty seat. Expect a finite pre-drop rest answer matching the placed warning. Repeat with In-time only and with an earlier meeting.
   - **Guest and competing marks:** Display the published fixture as guest, then separately combine the breach with a real higher-priority qualification warning and amendment/selection overlays. Check the permitted marks and controls; do not expect the guest’s intentionally absent warning-list door.

   The action inventory also includes creation before/after assignment; typing and clearing each time; reordering; cancellation/restoration; changing the earlier commitment; hiding; settings; publication/amendment; plan/version loading; Undo/Redo/reload. The walker reports **do not establish every combination after publication or every reversal**: B limits Undo/Redo principally to S12, and C expressly excludes most such orders.

   Finally, the evidence sheet still contains unfinished gate/status/break-test/Walk placeholders at [line 203](C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-10-06-rest-blank-line.md:203), [line 231](C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-10-06-rest-blank-line.md:231) and [line 241](C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-10-06-rest-blank-line.md:241). These are incomplete evidence, not demonstrated application failures.

4. **The six claims**

   | Claim | Assessment |
   |---|---|
   | **1. Complete-time arithmetic unchanged** | **Holds by inspection.** At [validate.ts:530](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:530), finite candidates reproduce the old minima, including negative reporting times and null In-time. Complete legs retain the same binding choice and sorted pairing. Malformed reporting text resolves separately. I did not independently run parity. |
   | **2. Blank lines neither raise nor hide measurable breaches** | **Holds by inspection.** Guards and filtering are inside the shared body; ordinary, forward and pre-drop callers all receive them. Reverse-drawn turn filtering occurs before sorting at [line 720](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:720). Blank-sibling prediction remains a coverage gap. |
   | **3. Existing instructions retained; no invented clocks or sanction** | **Holds in the calculation.** Finite instructions survive at line 530; missing take-off prevents the late-show step wording at [line 638](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:638). **The Logic explanation does not hold**, as finding 1 describes. |
   | **4. Blank-only flying assignment plus earlier commitment** | **Holds by inspection.** Group membership survives filtering; `byR[id][0]` exists whenever this branch runs. Event anchors win, with the flying key as the input fallback. `first`, clearance and leave-by remain finite in the breach branch. See [line 577](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:577) onward. |
   | **5. Deliberately unchanged behavior** | **Holds by inspection.** DT uses the unfiltered list at [line 713](C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:713); REST, run counting, work span, absence loops and exemptions retain their separate inputs. Existing measurable breach wording remains stable when an uninstructed blank ordinary line is added. |
   | **6. Tests prove the complete stated coverage** | **Does not hold as a blanket claim.** The 28 focused cases meaningfully target the repair, and the browser tests create and seat through real controls. They do not establish the missing scenarios above or the truth of the new Logic prose. H-02 passed readability while displaying the incorrect statement. |

5. **D602 meaning read — PASS**

   The revised [short line](C:/Users/User/projects/Raptor/.claude/rules/decisions/how-we-work.md:17) restores measurement, options with savings and risks, and **no trimming before his ruling**, without sacrificing quality. It grants no premature trimming permission. D70’s independent guide reads remain applicable; the short line does not waive them.

6. **Explicit negatives and limits**

   - I checked the shared calculation, its three caller families, reporting interpretation, published-warning selection, hiding and downstream counts; found no additional concrete defect.
   - I found no unrelated engine cleanup, changed storage format, permission expansion or OIL calculation change.
   - I did not re-report the explicitly filed sibling faults or old-data-only problems.
   - I did not open any file ending in `read-sol.md`, change files, build, start a server or run a browser walk.
   - The permitted focused test **did not execute any tests**: the runner was denied creation of its temporary directory in this read-only environment.
   - I read the supplied walker reports, but did not inspect every script, result entry or picture. I opened the Logic-row picture supporting finding 1. Reported gates remain the host’s evidence.
   - Confidence is high in finding 1 and the finite-input equivalence; runtime confidence is limited by the stated coverage gaps.

   **Walk: NOT RUN — independent read-only review, as instructed.**  
   **Rulings: none this session.**

