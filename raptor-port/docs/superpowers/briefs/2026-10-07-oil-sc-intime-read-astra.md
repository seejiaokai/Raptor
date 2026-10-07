**Astra independent review — D606, SC in-time and OIL**

Reviewed `0dbb6e1b..4dd2ce76` on `claude/oil-work-start-build-35a0e3`. **No blocking application defect found.** This is review evidence, not approval to merge.

I changed nothing, ran no tests, built nothing and started no server. I did not read the other reader’s report. Walk and break-test results below are recorded evidence, not runs independently repeated by me.

References below are relative to `raptor-port/` unless they begin `.claude/`.

1. **Is the rule right? — checked, no incorrect span found under the documented rules.**

   `src/engine/reporting.ts:10–12` preserves the existing SC clock interpretation. `src/engine/oil.ts:177–180,242–272` applies it correctly:

   | Input | Result |
   |---|---|
   | Blank or unreadable B | Written shift |
   | Earlier B | MAIN starts at B |
   | Equal or later B | Written shift, subject to the evening-before interpretation |
   | 19:00–07:00, B 18:00 | 18:00–07:00 next day: 780 minutes |
   | 01:00–07:00, B 23:00, lead 180 minutes | Previous evening 23:00–07:00: 480 minutes |
   | Written start equals end | No measurable OIL span, even with an earlier B |
   | SPARE, including formation-level `spare` without an aircraft flag | Written hours; off by default |
   | Cancelled formation or aircraft | No contribution |

   The evening-before boundary is **strictly** `start < lead`. At 03:00 with a three-hour lead, B 23:00 does not roll back.

   The zero-length exclusion remains deliberate and documented at `docs/engine-rules.md:1995–1996`. Work-hours calculation can still count an earlier B on such an invalid shift; D606 has not made those two measures identical for invalid timings.

   The builder’s six readings are supported. In particular, **MAIN only is the stronger reading**: the owner’s earlier words explicitly say “earlier than TO for main only” (`docs/engine-rules.md:36–45`). D24 permits activating a SPARE’s OIL; it does not give that SPARE the MAIN crew’s reporting obligation. D606 withdraws D592’s SC exclusion without explicitly overturning that distinction.

2. **One reader — checked, no new disagreement found.**

   `seatIntime` is behaviourally equivalent to its previous implementation: the same parse, the same midnight condition and the same fallback when B cannot be read. Non-SC wave kinds still take the unchanged `resolveReporting` path (`src/engine/events.ts:228–231`).

   The relevant consumers connect correctly:

   - Crew rest uses the earlier of the SC in-time and shift start (`src/engine/validate.ts:517–530`).
   - Work hours use the same earlier start; both Insights and the long-day note call that calculation (`src/engine/validate.ts:153–180,1091`; `src/engine/insights.ts:51–54`).
   - SANS calls `seatIntime` directly (`src/engine/avail.ts:250–265`).
   - The crew-list crew-rest question borrows the SC MAIN’s event and excludes exempt seats (`src/engine/validate.ts:2013–2026`).
   - The SC board header deliberately omits the in-time summary (`src/ui/board.ts:172`). The week’s header also excludes standalone reporting summaries (`src/ui/html.ts:1193–1197`).

   Insights retaining today’s Logic values while published OIL retains its saved values is intentional under D482. An edited B on a published day still waits for publication in Insights under D478.

3. **A published day — checked, no live-value leak found.**

   The saved lead reaches the new reader through:

   `oilKeptVals` → `oilDayWork` → `dayOilWork(...opts.rv)` → `scIntime(...lead)`.

   References: `src/engine/oilev.ts:618–621,746–753`; `src/engine/oil.ts:151,243`.

   The credit pass uses the resolved published snapshot for both the loaded and stashed weeks (`src/leavewar/sync.ts:1071–1075,1093–1112`). Board figures use the same earning-work and amount readers (`src/ui/oilmode.ts:123–149`). Eligibility passes the saved values too (`src/ui/oilmode.ts:711`). The ALL AVAIL window calls those shared figure and eligibility readers (`src/ui/AvailWindow.tsx:139,239`).

   `oilRuleShift` compares both the amount and stored worked times. Consequently, a Logic change can raise pending even when FO remains FO but the recorded start would change (`src/engine/oilev.ts:652–690`).

4. **B typed after publication — checked, no missing pending change found.**

   B is explicitly included at `ff:<di>.<gi>.<li>.br` (`src/engine/restore.ts:77`). The canonical comparison feeds `dayDelta`, and signature validity includes that pending comparison (`src/engine/publish.ts:518,1351–1356,1382`).

   Therefore, changing B leaves published OIL unchanged, shows the field change as pending and invalidates existing signatures. The amendment updates the published snapshot and its credit.

   A second `oil:` evidence entry is **not required merely because B changes**. That key represents OIL decisions, claims and membership; B already has its own field entry (`src/engine/oilev.ts:855–875`). Adding another entry solely for its calculated consequence would duplicate one act. I found no case in this change where published OIL moves without a pending route.

5. **Downstream worked times — checked, no mishandling found.**

   OIL amount uses the complete span. Stored worked times are separately clipped to the owning date, so an evening-before start becomes `00:00` without losing those earlier minutes from the earned amount (`src/engine/oilev.ts:628–645`).

   The downstream readers accept zero as a valid start:

   - Clash checking reads stored intervals and compares overlap: `src/leavewar/engine/warrecs.ts:153–154`; `dayview.ts:148–169`.
   - Inputs’ “recorded as working” note names that interval: `src/leavewar/inputgate.ts:245–246`.
   - The publish-time toast reads the published earning work and the same clipped intervals: `src/leavewar/sync.ts:1194–1239`.
   - The OIL tracker prints every stored interval: `src/leavewar/ui/OilTracker.tsx:483–486`.
   - The day sheet and list also print those stored intervals: `src/leavewar/ui/BidPicker.tsx:819–820`; `DayList.tsx:274–275`.

   The previous day gains no OIL record from the early report. The SC-specific clash-strip and publish-toast paths remain browser-walk gaps, explicitly disclosed in the evidence sheet.

6. **AVALON, BB and other row kinds — checked, unchanged.**

   Only standalone SC receives `scB`; AVALON and BB retain their written window. Their SPARE-window selection also yields the same written window. Ordinary flying, sims, duties, ground and Common Programme calculations are unchanged (`src/engine/oil.ts:225–246,271–295`).

7. **Tests — meaningful coverage, with two nonblocking gaps.**

   The new tests distinguish the principal changed behaviours: early B, invalid B, later/equal B, midnight interpretation, saved lead, SPARE exclusion and AVALON/BB exclusion. The publication tests exercise actual publication, held credit, pending and signature invalidation (`src/leavewar/oilworkstart-published.test.ts:303–349`). The browser test requires HO before amendment and FO afterwards (`e2e/oilworkstart.spec.ts:164–198`).

   The old pin’s change is justified by D606. Its separate assertion that wave reporting lines do not move SC OIL remains intact (`src/engine/oilworkstart.test.ts:164–168`).

   Recorded B24–B30 results report respectively **11, 4, 1, 1, 2, 3 and 6 failures**, with restoration green (`docs/handpass/parts/ows-break.json:266–343`). I did not rerun them.

   Two improvements would make the claimed coverage more exact:

   - **Formation-level SPARE start:** the new test checks aircraft-level SPARE only. The older formation-level test checks default eligibility with blank B, not the new start selection (`src/engine/oilexempt.test.ts:79–90`). Removing only `f.spare` from the new `seatWin` condition is not covered by those assertions. Add B `06:00`, shift `07:00–13:00`, formation `spare:true`, aircraft `spare:false`; assert `[420,780,false]`, then enabled earning of HO.
   - **Combined-events duration:** the final test’s two FO assertions do not establish its claimed first-start-to-last-end measure. The SC shift alone already earns FO (`src/engine/oilscintime.test.ts:109–113`). Assert the exact envelopes: **600 minutes** with the 14:00–16:00 desk and **480 minutes** with the 05:00–05:30 desk. Existing independent envelope tests support the implementation (`src/engine/oil.test.ts:35–38`), so this is a coverage limitation rather than evidence of wrong OIL.

   Also narrow the test name at `oilscintime.test.ts:90` to daytime shifts: the report-lead setting demonstrably can affect the midnight interpretation.

8. **Words — PASS, with one stale source comment.**

   Both changed Logic sentences match MAIN-only, earlier-B behaviour (`src/ui/logic-html.ts:210,275`). The rules document states the same qualification and the zero-length exclusion (`docs/engine-rules.md:1985–1997`).

   **D138 comparison: PASS.** `.claude/rules/decisions/oil.md:45` preserves the ruling stated in the full row at `.claude/decisions-full/oil.md:11`. The six narrower interpretations remain explicitly labelled as the builder’s readings rather than additional owner quotations.

   The introductory source comment at `src/engine/oil.ts:38` still says SC MAIN uses only written `to→ld`. Update that sentence to mention an earlier typed B when next touching the commentary; the operative code and user-facing rules are correct.

9. **Absences — checked, no missing application connection found.**

   The shared calculation reaches the roll-call’s OIL amounts, worked times, figures and downstream clash readers. The day sheet/list also use the stored intervals, although the D606-specific table does not repeat their separate rows.

   The absence of an SC B box on the desktop week and published face is a settled limitation, not a newly missing control (`.claude/rules/decisions/scheduler.md:279–282`). The changes window’s “brief” label and the misleading OIL day-switch wording are already filed in `OUTSTANDING.md:1949,1960`; I have not raised duplicates.

**Ranked cases for the host to run**

Use otherwise empty days, real people, a covering Leave War period, `oilFullMin=361` and `reportLead=180` unless specified.

| Rank | Setup and action | Expected result; what would disprove it |
|---|---|---|
| 1 | Saturday SC 07:00–13:00, B 06:00; formation `spare:true`, aircraft `spare:false`. Enable that person’s OIL and publish. | **HO, 07:00–13:00**. FO or a 06:00 start disproves formation-level exclusion. |
| 2 | Publish SC 01:00–08:00, B 23:00. Change lead to 30 minutes; then publish an amendment. | Before amendment: **FO, 00:00–08:00, one Logic pending**. Afterwards: **FO, 01:00–08:00**. No pending because both amounts are FO disproves the record comparison. |
| 3 | Publish SC 03:00–09:00, B 23:00 at lead 180; change lead to 181. | Initially **HO, 03:00–09:00**. Published credit holds; one pending proposes **FO, 00:00–09:00**. Rolling back at exactly 180 disproves the boundary. |
| 4 | Publish SC 01:00–07:00, B 23:00; then file leave 00:00–00:30 that date. | **FO remains**, leave is filed and flagged, note names **00:00–07:00**. An absent conflict or previous-day credit disproves downstream handling. |
| 5 | Saturday SC 13:00–19:00, B 12:00, distinct people in both MAIN rows and one SPARE; enable the SPARE and publish. | Each MAIN **FO, 12:00–19:00**; SPARE **HO, 13:00–19:00**. Any shared wrong start disproves row selection. |
| 6 | SC 07:00–13:00, B 06:00, plus that person’s desk 05:00–05:30; separately replace desk with 14:00–16:00. | Exact envelopes **480** and **600 minutes**. A summed-duration or SC-only answer disproves the combined-events claim. |
| 7 | Publish Sunday SC 19:00–07:00, B 18:00; subsequently cancel the occupied row and amend. | Initially **FO**, raw span **780 minutes**, stored Sunday **18:00–23:59**, no Monday credit. Cancellation holds until amendment, then removes the credit. |
| 8 | Publish SC 07:00–13:00 with B blank; bind four signatures; type B 06:00, then restore blank without publishing. | While changed: **one B field pending**, signatures invalid, published **HO**. Restoring blank clears pending and restores signatures. Extra `oil:` pending solely for B, or premature FO, disproves the route. |

**Walk:** not performed by this reader. Read Walker E’s report and the D606 evidence section; runtime omissions remain disclosed.

**Rulings:** none this session.

**PASS**