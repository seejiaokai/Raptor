DET is workable, but “belongs to our manpower”, “is at this place” and “can work today” must become separate answers. Reusing OD’s behaviour would make those answers disagree.

This is a read-only design review. The failures below are cases the design must prevent when built, not claims that DET already exists. I checked the design, rulings, backlog and the code cited below. I did not read the other reviewers’ reports, run tests or change files.

1. **HIGH — Changing the detachment must count as a change to the published day.**

   **Failure:** Viper’s Tuesday is published at 249. An admin changes his DET to another detachment for that Tuesday. If only the new destination reference changes, today’s comparison can miss it: the sign-offs may remain valid even though the place where Viper belongs has changed.

   **Checked:** `src/engine/inputs.ts`, `inpDetailKey` and `frozenInputMatch`, compare an explicit list of input details. The destination included today belongs specifically to Attach. `src/engine/publish.ts`, `currentBindNow`, `filingDelta` and `signMissing`, use these comparisons to decide what needs publishing and signing again.

   **Recommendation:** Make the detachment’s identity part of the input comparison, even where two detachments have the same displayed name. Compare the resulting presence and absence on the home, old-detachment and new-detachment days affected. Each published version must keep its own destination and membership; the working change becomes pending wherever it changes that schedule’s face or checks. Changing the live detachment record must not rewrite an old issue.

2. **HIGH — Undo and loading an old plan can put someone back at the wrong place.**

   **Failure:** Saber’s Tuesday DET is removed. Another scheduler then plans him at home. Saber’s original filer presses Undo. Nobody has changed that DET input itself, so the ordinary protection against overwriting another person’s edit does not necessarily stop the reversal. Saber can again belong to the detachment while retaining his new home task.

   A second door is loading an old home plan after his DET has been filed.

   **Checked:** `src/state/sched-commit.ts`, `decompose`, records inputs separately from schedule days. `schedWriteRecords` checks restored inputs through the absence gate. `src/leavewar/inputgate.ts`, `vetRestore`, runs that gate. `src/engine/drafts.ts`, `loadVersionToWorkingCopy`, restores schedule rows and selected filing states.

   **Recommendation:** Explicitly include Undo, Redo and loading a plan/version in round 6’s R4 place check. Check the resulting person-and-date assignments across schedules before accepting the operation. Refuse an incompatible reversal and name the blocking task; do not silently remove the other scheduler’s work. This extends the stated check to these doors without reopening D148 or introducing an editing lock.

3. **HIGH — A detachment’s printed programme can identify itself as 142.**

   **Failure:** The scheduler selects 249’s published Tuesday and prints it. If the existing print path is reused, the document’s title and heading say “142 Flying Programme”. The downloaded rows also lack a schedule-owner field, so a shared formation can lose its ownership outside the app.

   **Checked:** `src/ui/printpdf.ts`, `schedPrintHTML`, hard-codes 142 in both places. `printSchedPDF` obtains rows through `src/ui/export.ts`, `publishedDays` and `schedRows`; the latter exports no squadron or detachment identity.

   **Recommendation:** Carry the selected schedule’s identity into the print title, heading and download name, and carry formation ownership into exported rows. Preserve the published version’s labels and per-day issue stamp. This should use the same ownership information as the screen, rather than reconstructing it from the people seated.

4. **MEDIUM — “An admin can exclude DET from a count row” needs a new counting choice.**

   **Failure:** Six people leave for 249. The admin wants a home-cover warning that excludes them, while retaining the ruled manpower figures. The existing count-row controls cannot express that choice.

   There is also a display trap: excluding DET from the existing absence calculation can make its Leave War mark disappear altogether.

   **Checked:** `src/leavewar/engine/requirements.ts`, `CrewFilter`, supports seat, category and qualifications—not dated detachment membership. `src/leavewar/engine/availability.ts`, `matchesFilter` and `ruleHave`, use those filters and ordinary availability. In `src/leavewar/absences.ts`, `warCounts` and `contribsOfInput`, showing an input and counting someone out currently share a gate. `src/leavewar/engine/dayview.ts`, `dayView`, then calculates the absence.

   **Recommendation:** Give DET a visible contribution that removes no manpower. An overlapping leave or medical absence must still remove its normal amount. If the proposed optional home-cover counter is wanted, add an explicit, date-aware “exclude people on DET” choice, including team counters.

   **Other choice:** Keep every existing counter unchanged and remove the promise that its current controls can exclude DET. Either way, do not quietly change the fixed Available rows or the SANS calculation against D2146.

5. **MEDIUM — An ordinary timed input can turn DET into fictitious work.**

   **Failure:** Viper has a DET covering Sunday but does no work that day. Its window is saved as 08:00–17:00. A Monday 04:00 report can then receive a crew-rest warning measured from that invented Sunday finish. Timed DET also leaves an unanswered question about his place outside those hours, despite the one-place-per-day rule.

   **Checked:** `src/ui/inputedit.tsx`, `normalizeInputDraft`, accepts times, half-day markers and overnight windows. `src/engine/inputs.ts`, `defaultAllday` and `restsInput`, give ordinary duties timed defaults and rest-bearing behaviour. `oilAsks` currently delegates to `restsInput`. `src/engine/validate.ts`, `validateCore`, reads timed rest-bearing inputs as previous commitments.

   **Recommendation:** Make DET a date-based location record, without working hours or half-day controls. Exclude DET itself from both rest-bearing work and the OIL question. Actual flights, duties and other commitments supply the work. Keep the return-day interpretation with the already-recorded Close question; this finding does not settle that boundary.

6. **MEDIUM — Insights needs to distinguish a schedule’s figures from a person’s whole week.**

   **Failure:** Viper flies at home on Monday and at 249 on Tuesday and Wednesday. Home Insights can show only Monday’s hours, or classify him as not flying in a home-only week despite his detachment sorties. Conversely, feeding all his events into the existing calculation could inflate the selected schedule’s totals or count a shared formation twice.

   **Checked:** `src/engine/insights.ts`, `computeInsights`, obtains one issued schedule world, counts its formations and sorties, builds “not flying” from its roster, and totals hours through `src/engine/validate.ts`, `workSpan`.

   **Recommendation:** Keep schedule totals tied to the selected schedule and count each owned formation once. State that scope beside the figures. Define “not flying” against the same scope rather than implying that it means no flying anywhere.

   **Product choice:** I recommend a separately labelled whole-person weekly hours figure, combining actual work across schedules without duplication. The smaller alternative is to retain schedule-only hours and label them clearly. A DET span itself contributes no working hours.

7. **MEDIUM — The bell needs to explain a change of place, not just an input edit.**

   **Failure:** An admin changes Comet’s DET destination without changing its dates. A generic title notice—or no notice where the displayed title remains the same—does not tell Comet where he now belongs. Ending his DET early can likewise arrive merely as “dates changed”, concealing that he returns home.

   **Checked:** `src/state/notices.ts`, `common`, compares cancellation, filing, dates, times, people, title and remarks. It has OD-specific filing wording but no destination comparison. `noticePass` normally tells the affected people and filer, excluding the actor. `notifications-register.md` records those existing behaviours.

   **Recommendation:** Record the old and new destination and the effective dates in the notice. Use explicit messages for joining, moving and returning home. Close should give each affected person one coherent outcome, including anyone removed from a shared DET.

   **Product choice:** I recommend also telling the affected schedules’ admins when membership changes invalidate their plans. The alternative is member notices plus a prominent pending/change indication on those schedules. This must be an explicit recipient choice, not an assumption that today’s input notices already reach those admins.

The remaining coverage is below. Already-recorded questions are identified as such rather than reported again as new findings.

| Area | Checked readers and required DET behaviour |
|---|---|
| **1. Leave War, months, bids and SANS need** | `absences.ts`: `warCounts`, `contribsOfInput`; `engine/dayview.ts`: `dayView`; `engine/availability.ts`: `haveOf`, `ruleHave`; `state/flyplan-model.ts`: `planFor`, `monthAnswers`. DET remains visible without reducing manpower. Months and bid checks must use that same answer. The SANS need therefore does **not** rise just because people detach—already acknowledged by D2146. A genuine overlapping leave or medical record still counts normally. Finding 4 addresses the optional home-cover counter. |
| **2. OIL and weekends** | `engine/inputs.ts`: `oilAsks`; `leavewar/sync.ts`: `creditFrom`, `desiredOilCells`. DET asks no OIL question and earns nothing merely by spanning Saturday or Sunday. Actual work on the detachment’s latest published days pays. Today `desiredOilCells` assumes one issued evidence block per date; the database build must collect schedule-qualified sources before producing one person/day credit. Otherwise publishing or withdrawing one schedule can replace another’s evidence. This is concrete work under existing Q1, not a new request to reconsider pooled OIL. D2142’s future-day clearing must withdraw the affected issued evidence. |
| **3. Insights and hours** | `computeInsights` and `workSpan`: finding 6. Preserve today’s latest-published-version rule; a working change on an already-published day must not silently alter its reported hours. |
| **4. Tracker** | `tracker/peoplewire.ts`: `projectForTracker`, `medForTracker`; `tracker/app/core.js`: `latestFlown`, `settledDates`, `settleLastFlown`. Keep the same student and course records while he is away. A sortie on 249’s schedule does not automatically complete a training event today. Its training result must still be recorded through the Tracker. Round 6’s R10 already corrects the earlier promise of automatic progress. |
| **5. Quals and currencies** | `engine/people.ts`: `aarOK`, `aarInstrOK`, `scQualOK`; `tracker/app/core.js`: `landingCurrency`, `setLastCurr`, `settledDates`. DET must not copy, reset or pause a person’s qualifications or currency dates. A student whose currency becomes overdue while away remains overdue until the existing recording process changes the relevant date. The checked scheduler qualification gates read held qualifications; they do not infer renewal from a published sortie. |
| **6. Rest, consecutive days and long days** | `engine/events.ts`: `buildDay`; `engine/validate.ts`: `validateCore`, `workSpan`. R5 already proposes following actual work across places. A late Sunday finish at 249 must remain visible to Monday’s home check; a location change must not break a consecutive-work run. Apply D2122–D2123 to the later line’s rest requirement, and keep the other settings choices with R8. Finding 5 prevents the DET record itself becoming work. |
| **7. Own phone view** | `ui/html.ts`: `viewDayHTML`; `ui/board-html.ts`: `sbUnavailPanel`; `engine/inputs.ts`: `listedUnavail`. The home schedule shows the DET absence; the detachment shows his actual tasks. Preserve the issued/draft distinction in both. D2132 keeps his Inputs, Quals, Leave War and Tracker at home. His access before joining and after returning still needs the already-open access/edge decision: I recommend access to upcoming assigned days and retained read-only access to his past detachment issues. Membership must not accidentally grant editing rights. |
| **8. Bell, Close and Reject** | `state/notices.ts`: `common`, `noticePass`; `engine/slots.ts`: `acceptInput`, `unacceptInput`. Finding 7 covers wording and recipients. Reject is already the recorded F4 question: today it parks an OD as dormant. DET needs one agreed result for membership, home availability and the detachment’s existing tasks. Do not let one reader treat Reject as “back home” while another still lists him at 249. Close and its notices must follow D2134, D2135 and D2142. |
| **9. Logic counters and the day’s count** | `leavewar/engine/availability.ts`: `matchesFilter`, `ruleHave`; `engine/waves.ts`: `dayCount`; `ui/html.ts`: `dayInfoHTML`. Finding 4 covers manpower counters. The flying count follows formation ownership under D2096, not the home squadron of each crew member. The day panel’s tasked, off and free counts need location-aware roster/input reads; otherwise a person can appear “off” at the detachment where he is flying. |
| **10. Publishing, sign-offs and LATE** | `engine/inputs.ts`: `inpDetailKey`, `frozenInputMatch`, `cutSetOf`, `inputOwnDueISO`, `isLateInput`; `engine/publish.ts`: `currentBindNow`, `signMissing`. Finding 1 covers destination changes. Filing, extending, shortening or removing DET must compare every affected schedule’s issued and working day. LATE remains an existing round-7 choice. If enabled, I recommend the home Inputs cutoff: today the calculation reads the active `VCONF`, so it must not change merely because the viewer selected another schedule. |
| **11. IT table list** | `docs/data-model.md`: Input, InputPerson, ScheduleDay, sign-offs and Squadrons; `docs/handover-dataverse.md`: identity and issued-record rules; `state/sched-commit.ts`: `decompose`. Add a stable detachment reference to DET, retain one shared input with its existing person entries, and distinguish home ownership from presence at a detachment. Schedule/day, issue and related settings keys must include the owning schedule. Keep sufficient dated location information and frozen issue context for historical reads. Do not create a second independently editable membership list that can disagree with DET. These are database-design additions, not a demo-data migration. |
| **12. Other affected doors** | `engine/avail.ts`: `dayAway`, `availByWave`; `engine/events.ts`: `inpShow`, `buildDay`; `leavewar/sync.ts`: `availableFor`, `archivePerson`, `postOutProblem`, `postOut`; `ui/inputedit.tsx`: `normalizeInputDraft`, `commitInput`; `state/perms.ts`: `mayFileGroup`, `mayChangeInput`. At home, DET bars planning; at its detachment, DET alone must not bar planning or ALL AVAIL. Other leave, medical and commitments still apply there. Shared-person filing must check every named person’s dates and place without bypassing existing filer rights. Archive, posting and transfer must not leave someone offered through a stale DET membership list; past issues remain intact. D2147’s transfer-date recheck is already recorded. Findings 2 and 3 cover Undo and exports. D350’s separate ways of reversing personnel changes remain unchanged. |

The listed areas with no new DET-specific behaviour are:

- **Tracker grading and medical down-days:** DET neither completes a training event nor becomes a medical absence.
- **Qualification holdings and currency arithmetic:** the existing person’s records and elapsed-day calculation continue; DET supplies neither a renewal nor a pause.
- **Day’s aircraft-count arithmetic:** DET itself adds no aircraft; the already-required ownership split supplies the correct count.
- **Personnel Undo policy:** DET does not authorise replacing D350’s separate Restore and posting-sheet actions with global Undo.

No implementation or browser result is claimed. The future build needs checks covering both schedules, issued and working days, shared DET inputs, weekends, return boundaries, and the reverse actions described above.

Rulings: none this session.

