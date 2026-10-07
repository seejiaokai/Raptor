1. **CHANGES REQUIRED**

2. **Findings, most serious first**

   **F1 — The SC crew picker ignores a known early B report. Medium; an existing omission, still present.**

   **Inputs and steps:** Use a qualified, non-SANS aircrew member X with no unrelated Tuesday commitments. Monday: X lands at 22:30; with the default debrief and rest settings, clearance is Tuesday 12:30. Tuesday: create SC MAIN with another person already seated, type B `05:00`, and leave its start/end blank. Arm the other seat and inspect X’s reason before placing him. Repeat with start/end `13:00–19:00`.

   **What happens:** The pre-drop calculation supplies no crew-rest reason, although placing X produces the breach against the known 05:00 report. This is demonstrated by the source paths; I did not reproduce it in a browser here.

   **What should happen:** The picker should warn that rest does not clear until 12:30. Placement should retain the existing warning-only policy.

   **Cause and lines:** [avail.ts:419](/C:/Users/User/projects/Raptor/raptor-port/src/engine/avail.ts:419) checks clearance against the shift start, ignoring B. With no start, that check is skipped; with start 13:00, it passes. The shared probe cannot supply the missing answer because [validate.ts:1965](/C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:1965) accepts only a sibling event whose kind is `fly`; SC siblings have kind `shift`.

   **Comparison with main:** Both reader restrictions are unchanged on `origin/main`. The fully timed 13:00 shift with B 05:00 already has this discrepancy there. This repair makes the B-only placed warning correct, but leaves its predictive reader behind. This is distinct from the filed empty-formation limitation: the setup deliberately includes a sibling.

   **Exact fix instructions:**
   - Add two regressions with an occupied SC MAIN sibling: B 05:00 with blank shift times, and B 05:00 with shift 13:00–19:00. Assert the pre-drop clearance and agreement with the placed warning.
   - Allow the sibling-event lookup in `restIfPlaced` to select `shift` as well as `fly`, retaining its formation and different-person restrictions.
   - Keep the existing shared crew-rest probe, exemptions, duplicate suppression and placement policy.
   - Walk the armed crew list and drag caption for both cases; retain SC SPARE as a negative control.

   If this existing omission is deferred, file it explicitly and qualify the picker-agreement claim.

   **The new Logic wording defect was corrected during this read.** I independently found that “no take-off” was wrongly described as never ending yesterday. The saved S09 pictures show a landing-only line ending Monday and raising Tuesday’s breach. Another process subsequently changed [logic-html.ts:127](/C:/Users/User/projects/Raptor/raptor-port/src/ui/logic-html.ts:127) to describe “no times” and explicitly retain landing, Brief, reporting instructions and SC B. I reread that replacement and its new test; the wording defect is no longer open.

3. **Absences against the roll-call**

   | Object or reader | Required sign or gesture; coverage assessment |
   |---|---|
   | **ALL AVAIL window** | The affected person’s row, reason, flagged-person count and tapped explanation should agree. Missing from the host’s roll-call. C’s S29 opened the window, but explicitly says the affected man was **not listed**. That does not test this consumer. Use a later crowd window containing X, then add the blank assignment and inspect/tap his row. |
   | **SC MAIN pre-drop reader** | A known B report should produce the clearance reason before placement. S08 proves the placed warning, not this reader. F1 identifies the missing path. |
   | **SANS, Personal Inputs, Unavailable and crew-list puck copies** | Their warnings inherit the shared result. Missing dashed/dotted drawings are already filed; I found no changed renderer making them worse. |
   | **Week, Board, View-only, current version look, day details and Insights** | The warning, applicable marks, counts and warning-focus gesture have identified readers and walk rows. I found no additional missing connection. |
   | **Older versions and saved plans** | Older versions show their recorded result; activating a plan/version recalculates. The source and S23 distinguish those behaviours correctly. |
   | **Previous-day and Sunday forward traces** | The cause mark and “Breaks” explanation use the shared rule. S02 covers the week boundary. The inert peek and dedicated exports deliberately have no crew-rest drawing. |
   | **Roles and overlays** | Admin/member coverage is recorded. Guest puck behaviour was not walked; guests intentionally have no inline warning-list/day-details door. S29 did not obtain its higher-priority qualification chip. Physical iPhone and Windows display scaling remain unproved. |
   | **Writers and action orders** | Creation, templates, time/report edits, other-page inputs, cancellation, deletion, reordering, plans and versions are represented. The reports do **not** establish Undo/Redo/reload after every mutation or every action pair on published days: A’s order comparisons were unpublished; B records narrower reversal coverage; C records substantial omissions. |

   These are ranked coverage gaps, not claims of additional app failures. The three walkers used the preceding build; the sheet correctly distinguishes the host’s final H1–H4 re-walk.

   The evidence sheet still contains placeholders for gates, final break-test results, the look card and its closing Walk line. I cannot treat it as a completed FULL-check receipt.

4. **The six claims**

   | Claim | Assessment |
   |---|---|
   | **1. Complete-time arithmetic unchanged** | **Holds by source comparison.** At `validate.ts:530–556`, finite candidate selection preserves the old minima, including null reporting instructions, signed previous-day times and SC B/start precedence. Filtering the turn list changes nothing when both times exist. I did not rerun parity. |
   | **2. Unmeasurable lines do not raise or hide breaches through every caller** | **Holds in the shared calculation; does not fully hold at the SC predictive door — F1.** Previous ends are guarded at line 463; actual and phantom calls remain at lines 1093 and 1487. |
   | **3. Existing instructions remain usable; no invented clocks** | **Holds in the calculation.** Lines 530–556 retain Brief, reporting instructions and SC B independently. Lines 619–638 suppress an unsupported step/dash and safely word the meeting-only case. The corrected Logic row now agrees. |
   | **4. Blank-only flying day with an earlier commitment** | **Holds by source inspection.** Lines 580, 596, 607 and 642 keep the known first commitment, a valid fallback leg key, finite clearance and formatted leave-by data. `byR[id]` is nonempty where its first leg is used. The unit test’s truthy trace assertion is weaker than checking the exact leave-by and anchor. |
   | **5. Unchanged neighbouring rules** | **Holds.** DT still uses all assignments at lines 713 and 1035. The REST-map construction remains intact; event construction, run counting, work hours, absence loops and standby exemptions were not filtered globally. Existing breach wording—and therefore its hide identity—survives an instruction-free added line. |
   | **6. Tests prove the complete claim** | **Does not fully hold.** The original tests meaningfully pin the three arithmetic faults and use the actual blank-line shape; browser tests drive real controls. Four ordinary blank-sibling probe tests were added during this read and are meaningful. SC prediction, ALL AVAIL’s affected-person result and the broader orders above remain uncovered. |

5. **D602 meaning read**

   **PASS.** The current short line preserves the full row’s sequence: crew rest first in a fresh chat; then measure startup context, present options with savings and risks, and trim nothing before the owner rules. It retains the quality condition. D70’s independent reads of working-guide changes remain binding.

6. **Explicit negatives; limits**

   I checked complete-time arithmetic, negative reporting/Brief times, nominal-versus-instructed separation, empty candidate lists, late-show wording, binding anchors, same-day pair ordering, published-face selection and hidden-warning identity; I found no new numerical defect in those paths.

   I did not repeat the already-filed absence, SC currency, specialised-ring or SANS-wording findings. I raised no migration or stored-demo-only concern.

   I read the prescribed scenario report and the walkers’ reports. I opened three saved pictures myself: the Logic row, the landing-only Monday line and Tuesday’s resulting warning. I never opened any file ending in `read-astra.md`.

   The permitted single test file could not execute: the read-only environment denied creation of its temporary compilation folder. **No tests ran.** I built nothing, started no server and changed no files. Confidence is high in the source analysis; runtime coverage is limited to the supplied evidence and pictures.

   **Walk: NOT RUN — independent read-only review, as instructed.**  
   **Rulings: none this session.**

