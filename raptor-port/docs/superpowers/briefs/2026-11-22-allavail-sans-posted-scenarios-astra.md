**I found one source-supported defect: hiding a SANS person can bypass their saved joining date.** This can put someone into ALL AVAIL before they have joined, and can change the crowd when “+ SANS” changes. It affects newly created data.

This is a read-only scenario report. I changed no files and ran no application, tests or builds. The defect below is supported by the source, but still needs the host’s reproduction. The intentionally removed handoff block is not a finding.

**The host’s three readings**

| Reading | Assessment |
|---|---|
| “+ SANS” must not change ALL AVAIL, published state or earned OIL. | **Supported for those outcomes:** D27, D25, D44, D45 and D142. Calling it purely a display choice is too broad: D283 explicitly changes Leave War tracking, and the Settings group says “shown · counted”. Some Leave War counters and lists may therefore change legitimately. |
| After a hand untick, the person is ordinary again and counts without being named, although the grid still shows the posting. | **Supported:** D2327, read with D27. The unticked interval must remain ordinary after a later retick. |
| A future SANS posting remains a departure for dates beyond it until the posting actually runs. | **The owner’s to decide as a requirement.** The exported implementation does this because the SANS exception requires the posting to have run. That establishes current behaviour, not an owner ruling about advance planning. Preserve and record it for this repair; the on/off answers must agree either way. The existing future-posting tests assert equality, not the claimed exclusion. |

**Ranked scenarios**

The scenario numbers preserve those announced during the read. The order below is the proposed execution priority, starting with the less-shared routes.

Use fresh test people and fresh postings. Unless a case says otherwise, remove unrelated inputs and tasking. For the main earning case, use a non-working Saturday, a named briefing **08:00–09:00**, and an ALL AVAIL event **10:00–17:00**. Keep the normal earning settings and a Leave War period covering the date. Record person membership as well as the total: an unchanged number can conceal a swapped person.

1. **S3 — TEST, then WALK: hidden SANS person with a future joining date.**  
   **Setup/action:** On 22 November, add Newbie with a post-in date of 23 November. Tick SANS on Quals. Name Newbie on a briefing on 22 November, separate from an ALL AVAIL event. Open the count with “+ SANS” off, then on. Repeat on 23 November.  
   **EXPECTED:** Excluded before joining under both settings; included from joining when named and otherwise available. **Source:** D308 and D27.  
   **Disproof:** Newbie appears before joining only when hidden. This is the source-supported defect detailed below.

2. **S2 — WALK: an input supplies the placeholder.**  
   **Setup/action:** File a one-day Event input for ALL AVAIL with OIL answered Yes. Give the posted-SANS person a separate, non-overlapping named task. Publish, then toggle “+ SANS”. Repeat with an input containing both the placeholder and that named person. Exercise Training, Meeting, Appointment, Duty and Other through the same door.  
   **EXPECTED:** The input’s people, programme, count window and published evidence agree. In the mixed case, the explicitly named person occurs once overall; excluding them from the placeholder’s additional crowd must not remove their named attendance. **Source:** D27 and agreement between the input and its programme row.  
   **Disproof:** Missing attendance, duplicate credit, or a changed published crowd after toggling.

3. **S4 — WALK: Personal and incomplete-time rows.**  
   **Setup/action:** Use a one-day Personal input containing ALL AVAIL. Separately use an ordinary row with a start but no end, then one without a start. Keep a separate valid named task for the SANS person. Publish the usable cases and toggle the setting.  
   **EXPECTED:** Personal freezes its crowd but earns nothing from that input. A start-only row shows the assumed-hour crowd and the admin’s no-OIL explanation; no-start shows “?” with an explanation. The separate named task may still earn its own credit. **Source:** D778 and D360.  
   **Disproof:** No count door, guessed-time credit, missing frozen crowd, or switch-dependent membership.

4. **S7 — WALK: a count opened from another version or preview.**  
   **Setup/action:** Publish the main case, then change current tasking without republishing. Open ALL AVAIL from View-only Sched, a saved published version and the next-week preview. Repeat from the Scheduler Board with the window over it.  
   **EXPECTED:** Each window uses the date and version from which it opened. Published views retain their published crowd; the working view reflects genuine working changes. **Source:** D44/D45 and agreement between the originating row and its window.  
   **Disproof:** A window reads the current edit, the week behind it or another row’s crowd.

5. **S26 — WALK: withdrawing credit already used for leave.**  
   **Setup/action:** Give the test person no other OIL, publish the full-day credit, and use that day for an OIL leave booking. Preview withdrawing the publication or reducing it to a half-day credit. Repeat under both settings; cancel once before confirming in a separate run.  
   **EXPECTED:** The warning and projected balance agree with the tracker’s ledger. Both settings give the same answer. Cancelling changes nothing. Withdrawing the latest version restores the preceding published entitlement, where one exists. **Source:** D142 and agreement between the withdrawal warning and OIL tracker.  
   **Disproof:** Hiding the person suppresses the warning, changes the projected shortage or removes credit on cancellation.

6. **S1 — WALK: published Saturday, including the stored-week route.**  
   **Setup/action:** Post Hex out as SANS on 20 November. Use the main Saturday fixture on 21 November. With “+ SANS” off, inspect the count, publish and obtain all four sign-offs. Leave the week, toggle on and off, and return.  
   **EXPECTED:** Hex belongs to the event crowd and receives the full-day credit. The published crowd, credit and four signatures survive both toggles; no pending change appears. **Source:** D27, D25, D44, D45, D103 and D142.  
   **Disproof:** Only the briefing’s half-day credit, a missing Hex, invented pending change or lost signature.

7. **S5 — WALK: a real change must still become pending.**  
   **Setup/action:** From S1, remove Hex’s separate briefing, leaving only the ALL AVAIL event. Toggle the setting before amending. Then restore the briefing in a separate run.  
   **EXPECTED:** Without a named task, the working crowd excludes the SANS person. The real difference becomes pending and clears the four signatures; issued attendance and credit stay published until amendment. Restoring the original state restores the bound signatures. **Source:** D27, D44/D45, D103 and D142.  
   **Disproof:** The repair freezes working membership, suppresses a real pending change or changes issued credit prematurely.

8. **S6 — WALK: earning is separate from availability.**  
   **Setup/action:** In S1, enter OIL Earn and switch Hex’s event earning off. Inspect availability, publish the amendment, then turn earning back on and amend again. Repeat under both SANS settings.  
   **EXPECTED:** Hex stays available throughout. Only earning changes; the briefing can still provide its half-day credit when event earning is off. Issued credit follows the latest publication. **Source:** D27 and D142.  
   **Disproof:** An earning switch changes the available crowd, or “+ SANS” changes the earning result.

9. **S8 — WALK: future posting before and after it runs.**  
   **Setup/action:** On 22 November, save a SANS posting for 23 November and prepare a named task plus ALL AVAIL event for that date. Compare both settings before midnight, after midnight with the app left open, and after reopening.  
   **EXPECTED:** The on/off answers agree at every stage. After the posting runs, a named, available SANS person counts. Before it runs, **RECORD exactly what it says**, including membership, pending state and posting marks. **Source:** D27/D283 after execution; host reading 3 remains an owner question beforehand.  
   **Disproof:** The setting chooses membership, or left-open and reopened sessions disagree after the same date transition.

10. **S9 — WALK: today’s and backdated postings.**  
    **Setup/action:** In separate fresh cases, post out as SANS today and on a past date. Check the preceding day, posting day and following day, first unnamed and then named outside the event window. Include a previously published day before the SANS start.  
    **EXPECTED:** Before SANS starts, ordinary membership remains. From the start, named participation is required. Earlier published days do not change merely because today’s SANS tick changed. **Source:** D2313, D283, D27 and D44/D45.  
    **Disproof:** Today’s tick is applied backwards or the date boundary differs between settings.

11. **S10 — WALK: hand untick and retick.**  
    **Setup/action:** Post out as SANS, untick on a later day, and retick on another later day. Inspect all three intervals. Publish an unnamed ALL AVAIL day within the unticked gap before reticking.  
    **EXPECTED:** The gap is ordinary, named or not; the SANS intervals require named participation. Reticking does not rewrite the published gap. **Source:** D2327 and D27.  
    **Disproof:** The old SANS period is erased, the gap becomes SANS retrospectively or the setting changes its membership. Do not reopen the separately filed take-back-after-untick question.

12. **S11 — WALK: move the posting date.**  
    **Setup/action:** Without a hand untick, move a completed SANS posting earlier and later. Inspect both sides of each boundary and repeat with both settings. Also move it into the future.  
    **EXPECTED:** Working counts and windows agree on the revised dates; real published differences follow amendment rules. For the future, unrun interval, **RECORD exactly what it says**. **Source:** D2313, D44/D45/D103 and count-to-window agreement.  
    **Disproof:** A stale completion marker makes only one setting count the person, or a published change bypasses pending.

13. **S28 — TEST, then WALK: other departures stay departures.**  
    **Setup/action:** Repeat with no outcome selected, then Overseas Sqn. Name the person on a non-overlapping task after departure. Compare the preceding day and departure day under both settings.  
    **EXPECTED:** Before departure, ordinary eligibility remains; from departure, ALL AVAIL excludes them despite the named task. **Source:** D303 and D327.  
    **Disproof:** Normalising SANS windows also reopens a non-SANS departure.

14. **S13 — WALK: archive after a SANS posting.**  
    **Setup/action:** Publish an earlier eligible day, then archive the person. Inspect the preceding day and archive day with both settings. Separate a crowd-only day from a day naming the person directly.  
    **EXPECTED:** Earlier crowd membership survives; membership from archive day ends. A directly named day may still become pending under the separate archive rule. **Source:** D327 explicitly distinguishes these cases.  
    **Disproof:** Archive rewrites earlier crowds, or a named-day pending change is incorrectly treated as proof that historical crowd membership changed.

15. **S14 — WALK: restore with an absence gap.**  
    **Setup/action:** Archive, then restore with a later post-in date. Tick SANS after restoration. Inspect an earlier stint, the gap and the new joining date under both settings.  
    **EXPECTED:** Earlier history remains; the gap stays excluded; eligibility resumes from joining, subject to the dated SANS rule. **Source:** D308, D320 and D27.  
    **Disproof:** Hiding the restored row removes the gap check, or restoring rewrites the earlier stint.

16. **S15 — WALK: delete and reuse the callsign.**  
    **Setup/action:** Publish an earlier day for a fresh test person, delete them, then create another person with the same callsign.  
    **EXPECTED:** Past records retain the original identity. Today and future eligibility exclude the deleted identity. The replacement inherits neither its posting nor its earned leave. **Source:** D297 and D299.  
    **Disproof:** A same-name replacement appears in the old crowd, or past attendance disappears when the old person is deleted.

17. **S12 — WALK: “Undo post out”.**  
    **Setup/action:** Complete a SANS posting, without a hand untick. Use the posting sheet’s undo. Revisit the count, grid, published state, bell and history under both settings.  
    **EXPECTED:** Ordinary eligibility returns. Genuine changes to published membership follow pending/signature rules; toggling alone does not. **Source:** The posting take-back contract, D27 and D103. For exact bell wording, **RECORD exactly what it says**.  
    **Disproof:** The saved posting remains effective, undo works only in one setting, or the app records a second posting action caused solely by toggling.

18. **S16 — WALK: reload.**  
    **Setup/action:** Reload once with the setting off and once on, after saving a posting and publishing the main case. Repeat S3 across reload.  
    **EXPECTED:** Saved dates, setting and publication survive; the resulting membership and credit are unchanged by reload. **Source:** Persistence contract and D44/D45/D142.  
    **Disproof:** Reload reconstructs a different window, loses the joining date or creates pending changes.

19. **S17 — WALK: sign out and in.**  
    **Setup/action:** Sign out, return as the same admin, then use another admin. Inspect posting, setting, count, publication, bell and history.  
    **EXPECTED:** Saved state persists; published attendance and credit remain unchanged. The first admin’s Undo list clears at sign-out. **Source:** Persistence contract, D148 and D44/D142.  
    **Disproof:** Account switching resets the posting or changes membership, or exposes another person’s Undo history.

20. **S18 — WALK: week and Leave War period changes.**  
    **Setup/action:** Publish, leave the week, toggle, and return. Repeat moving backwards and forwards across a Leave War period boundary, with both periods present. Include a weekday and a configured holiday.  
    **EXPECTED:** Each date retains its own published crowd. Earning follows that date’s working-day rules and latest publication, not the currently displayed period. **Source:** D27, D44 and D142.  
    **Disproof:** The active period or loaded week decides another date’s membership or credit.

21. **S19 — WALK: Undo and Redo.**  
    **Setup/action:** Undo/Redo a named-task edit and a SANS-setting edit separately. Also attempt the main Undo after a posting operation.  
    **EXPECTED:** Reversible changes restore their corresponding working state; only genuine published differences affect pending/signatures. The main Undo does not undo posting operations and explains the restriction. **Source:** D103, D148 and D350.  
    **Disproof:** Undo restores a setting without its projection, changes earned credit solely through visibility or partly undoes a posting.

22. **S20 — WALK: ordinary member.**  
    **Setup/action:** Sign in as a member. Open the published count, another person’s OIL details and the member’s own leave figures.  
    **EXPECTED:** Published attendance and ledger figures agree with the admin’s view. Posting, settings and earning controls remain unavailable. Everyone’s OIL details remain readable. **Source:** D1008 and the role contract.  
    **Disproof:** The same published day has different membership by role, or a member receives an editing control. A non-admin scheduler is not a test case.

23. **S21 — TEST, then WALK: what qualifies as named participation.**  
    **Setup/action:** Supply one non-overlapping named task at a time: flight; AMT/OFT seat, passenger or extra person; duty desk; ground row; Common Programme. Repeat with a cancelled row, information-only row, simulator free-text label, placeholder-only day and SC spare.  
    **EXPECTED:** Genuine named tasking qualifies under D27; cancellation and information-only rows do not. A simulator label is not a person. For standby distinctions not settled by the cited promise, **RECORD exactly what it says**; both settings must still agree.  
    **Disproof:** A supported named position is omitted, or text/placeholder presence qualifies someone without a real named task.

24. **S22 — TEST, then WALK: exclusions and time boundaries.**  
    **Setup/action:** Keep valid named tasking. Add overlapping named work, ordinary leave, ATT B and a timed commitment separately. Test **09:00–10:00**, **10:00–11:00** and **11:00–12:00** against an event window of **10:00–11:00**. Repeat with cancelled/removed inputs, and with a flight’s step/dekit window. Include pilot, WSO and ground-crew controls.  
    **EXPECTED:** Actual overlaps exclude; touching endpoints do not. ATT B remains eligible; ground crew remain outside the placeholder crowd. Flight availability uses the established step-to-dekit rule. **Source:** D27, D36 and the overlap contract.  
    **Disproof:** The SANS repair bypasses an exclusion or changes a boundary between settings.

25. **S23 — WALK: every permitted landing and overlay.**  
    **Setup/action:** Place ALL AVAIL, then ALL, on ground rows, Common Programme, duty desks, both simulators, passengers and extra-person lines. Exercise both drag/drop and the supported picker/tap placement. Open counts with warnings and category colouring active, in ordinary and OIL Earn modes. Attempt a flying-seat placement as a refusal control.  
    **EXPECTED:** Every permitted landing has its count door. Ordinary taps highlight/show reasons; earning-mode taps control earning without changing availability. Flying seats refuse placeholders. **Source:** D27, D37, D65 and the seat-refusal contract.  
    **Disproof:** A specialised seat silently lacks a count, opens another row or loses its control under an overlay.

26. **S25 — WALK: downstream Leave War counts, warnings and links.**  
    **Setup/action:** Use a posted-SANS person with a leave request. Compare custom counters, day details, Approvals’ figures/warnings, SANS calendar figures, Balances, tracker, person window and My Leave under both settings. Follow warning and notification links.  
    **EXPECTED:** Tracking-dependent lists may change under D283. A figure or warning must agree with the detail it opens; published attendance and earned credit remain invariant. For notification audience differences, **RECORD exactly what it says**.  
    **Disproof:** Tracking visibility changes published entitlement, a link opens the wrong person/date, or a warning contradicts its underlying ledger. The already-filed historical Available-row problem is not a new finding.

27. **S27 — WALK: squadron context.**  
    **Setup/action:** Using existing controls only, view another squadron’s same week and return. Repeat with the supported planning/master role, inspecting counts and OIL after changing the relevant SANS setting.  
    **EXPECTED:** Counts belong to the programme’s squadron and date. Published credit stays with the correct squadron and person. **Source:** The squadron-scoped roster and OIL contracts.  
    **Disproof:** The currently loaded Leave War supplies another squadron’s posting windows or sweeps away its credit. No unbuilt transfer feature is required.

28. **S24 — WALK: the complete plain-user round.**  
    **Setup/action:** Complete separate today, past and future postings through the Leave War sheet. Open Settings, add SANS, close it, reopen and remove the group. Name the person through Edit Schedule and the Scheduler Board; place ALL AVAIL; open its count; publish; change tasking; amend; use “Undo post out”. Exercise every displayed opener, close/back control and confirmation/cancel control, including the narrow-screen presentation.  
    **EXPECTED:** Each committed action reaches the crew list, count, OIL Earn, tracker, grid cell, Balances, bell and history according to the preceding cases. Cancelling makes no change; closing and reopening shows current state. **Source:** Agreement between the writer and all its visible readers. Where exact wording lacks a contract, **RECORD exactly what it says**.  
    **Disproof:** A dead door, stale sheet, inaccessible result, wrong return destination or an action that succeeds only through an internal test helper.

**The defect and exact repair instructions**

The saved joining date is currently consulted only if the person already has a displayed Leave War row.

In [the crowd reader](/D:/raptor-work/c141-scn/raptor-port/src/leavewar/sync.ts:2092), `availableFor` obtains the saved posting conditionally:

```ts
const lw0 = lwById.get(id)
const posting = lw0 ? postings[id] : undefined
const lw = lw0 && posting ? { ...lw0, ...windowFor(posting, true) } : lw0
```

That leaves a hole:

- `projectPeople(false)` omits a currently SANS person.
- `reprojectRoster` and `setPeople` retain omitted people with a leaving date, but not a joining-only record.
- The saved joining record still exists.
- Without a displayed row, `availableFor` ignores that record and skips `inSquadron`.
- Turning SANS on restores the row and the joining-date restriction.

This is a new-data path through the ordinary add-person and Quals writers, not a migration issue.

The host should:

1. **Add the failing calculation case using the real writers.** Reuse the existing regression fixture’s clock: **15 July 2026, 09:00**. Add:

   ```ts
   addPersonAndAccount(
     'newbie@mail',
     { cs: 'Newbie', ini: 'NB', seat: 'FCP', cat: 'C' },
     'main',
     '2026-07-20'
   )
   ```

   Resolve the newly created identity, then tick SANS through `updatePersonField`.

2. **Give that person the fixture’s Thursday briefing**, **16 July, 16:00–17:00**, alongside its ALL AVAIL event **08:00–15:00**. Query **10:00–11:00** with SANS off and on. Assert both exclude Newbie. Also assert the saved record still has joining date **20 July** and no leaving date. The predicted failure is inclusion with SANS off.

3. **Read the saved posting independently of the displayed row.** In `availableFor`, obtain `postings[id]` unconditionally. When it exists, form the eligibility record from the displayed row if present, otherwise the saved person record, and apply `windowFor(posting, true)`.

   The narrow shape is:

   ```ts
   const lw0 = lwById.get(id)
   const posting = postings[id]
   const lw = posting
     ? { ...(lw0 ?? posting), ...windowFor(posting, true) }
     : lw0
   ```

4. **Preserve the other guards.** Keep date-specific squadron ownership, existing home-stint information, archive/delete cutoffs, ground-crew exclusion, dated SANS participation and clash checks. Do not make the hidden person visible merely to repair scheduling eligibility.

5. **Add boundary assertions:** excluded on 19 July; included on 20 July when named and free; ordinary earlier stint preserved; restored-person gap excluded. Compare actual identity sets under both settings, not equality alone.

6. **Carry it through publication.** On a fresh non-working day before joining, publish the named-briefing/ALL AVAIL case. Assert Newbie receives no credit from the placeholder event, and changing the setting causes no pending difference. Keep any separate named-work credit distinct.

7. **Run S3 through the UI**, then the existing SANS-posting, post-in/stint and publication/OIL checks. Report the initial failure and the repaired result. I have not executed either.

**Reader and writer map for the host**

The following technical names are included because the brief explicitly requests them. Paths below are relative to `raptor-port/src`.

| Reader or writer | What the setting can affect; exposing scenario |
|---|---|
| `leavewar/state/raptorRoster.ts` — `projectPeople`; `leavewar/state/store.ts` — `windowFor`, `setPeople`, `displayRoster`; `leavewar/sync.ts` — `reprojectRoster` | Creates or removes displayed people and lays their posting windows. S3, S14, S16 and S19 expose a missing eligibility record. |
| `leavewar/sync.ts` — `availableFor` | Direct scheduling reader of those people/windows. **The defect above.** S1–S14, S21–S23 and S28. |
| `engine/oilev.ts` — `oilEvidenceNow` | Four expansion routes: ordinary earning work, open-ended rows, OIL input claims and non-OIL Personal crowds. S2 and S4 cover routes absent from the focused repair tests. |
| `ui/oilmode.ts` — `evOf`, `oilSentinelPeople`, `oilSentinelSummary`, `oilRowPeople`; `ui/html.ts` — `oilSeatDeco`, `withChipWorld`; `ui/AvailWindow.tsx` — `AvailWindow`; `ui/availopen.ts` — `openAvailWinFrom` | Turns evidence into counts, names, reasons and earning controls in the correct version. S6, S7, S20 and S23. Board rendering shares these controls. |
| `engine/publish.ts` — publication evidence and `dayPendingItems` | Freezes attendance and compares the working day; binds pending changes to signatures. S1, S5, S8–S11 and S18. |
| `leavewar/sync.ts` — `creditFrom`, `desiredOilCells`, `runOilPass` | Converts latest published evidence into credit, including stored weeks. S1, S6, S18, S26 and S27. |
| `leavewar/state/store.ts` — `figureCtxOf`; `leavewar/engine/charge.ts` — `isPilot`, `chargedDays`; `leavewar/engine/counters.ts` — `oilLedgerOf`; `leavewar/engine/oiltracker.ts` — `oilLedgerFor` | The figure context includes displayed people; seat identity can affect leave charging. Compare the same ledger and booking under both settings in S25/S26. This is a dependency to test, not a second finding. |
| `leavewar/ui/OilTracker.tsx` — `OilTracker`; `leavewar/ui/BalancesPage.tsx` — `BalancesPage` | Displayed roster controls which rows are offered; ledger calculations supply their figures. S1, S20, S25 and S26 distinguish visibility from lost entitlement. |
| `leavewar/ui/PersonWindow.tsx` — `PersonWindow`; `leavewar/ui/myleave.ts` — `myLeaveOf`; `leavewar/approvals.ts` — `ownDays`, `figuresOf` | Further figure readers, including member-facing figures and approval shortages. S20, S25 and S26. |
| `leavewar/engine/availability.ts` — `availabilityOf`, `haveOf`, `ruleHave`, `countsFor`; `leavewar/engine/evaluate.ts` — `evaluateDay`, `evaluatePeriod`, `redDays` | Read displayed people and their windows for manning. S25: some changes are intended by tracking scope; downstream scheduling/credit changes are not. |
| `leavewar/engine/availrows.ts` — `availHave`; `leavewar/sync.ts` — `dayFacts`, `flyAnswer`, `flyMonth`, `manningRedDays` | Feed Available rows, flying/SANS answers and warnings. S25. The filed historical-SANS reader issue remains excluded. |
| `leavewar/state/daypanel.ts` — `dayPanelData`; `leavewar/ui/MatrixRows.tsx`, `Matrix.tsx` — cell/window and posting-door readers | Day lists, posting hatches and actionable grid locations depend on displayed membership. S9–S16, S24 and S25. |
| `leavewar/sync.ts` — `warAudience`, `tellBidding`, `endedLines`, `alsoSince` | Roster-sensitive notice audience and approval news. S17/S25: record audience differences; check that toggling does not invent posting actions. |
| `leavewar/sync.ts` — `openWarAt`; `leavewar/ui/ApprovalsPage.tsx` — `ApprovalsPage` navigation | Chooses a grid destination or person window according to whether a row exists. S24/S25 expose dead or incorrect destinations. |
| `leavewar/sync.ts` — `publishFlagsBids`, `publishLeaveClashes`, `oilCreditBidAgainst` | Publication/bid warnings and credit-withdrawal warning. S25/S26 compare warnings with the underlying request and ledger. |
| `leavewar/state/store.ts` — `setShowSans`; `leavewar/ui/SettingsSheet.tsx` | Actual setting writer and visible add/remove door. S16–S19 and S24. |
| `leavewar/sync.ts` — `postOut`, `undoPostOut`, `takeBack`, posting-outcome passes, archive/restore operations; `leavewar/state/store.ts` — `setPostIn`, `setPostOut`, `markPostingDone`, `closeStintOnArchive`, `dated`, `withStored` | Saved-date and identity writers. S8–S19 and S28 cover execution order, disappearance and reappearance. |

The board’s crew list is also a required comparison surface, but its tasked/available presentation is not identical to placeholder eligibility. In particular, standby presentation must not be used as an undocumented substitute for the ALL AVAIL rule.

**Explicit negatives and limits**

- I checked the published-credit selection and reverse sweep and found **no additional displayed-roster gate** that would independently remove earned credit merely because SANS is hidden. They use published evidence and stored records.
- I checked the publication leave-clash and bid-warning paths and found **no new equivalent of the conditional saved-posting lookup** there. Their visible agreement still needs S25/S26.
- I checked the saved-window helpers and found they deliberately recover stored posting dates rather than saving the SANS-expanded display window. I found no new writer defect there.
- I found no basis for treating every changing Leave War counter, row or notification audience as a defect: the switch changes tracking scope.
- I did not re-raise the five excluded findings, demo-data migration, or a non-admin scheduler case.
- The supplied regression tests cover the central posted-SANS repair and several controls. They do **not** establish the UI doors, alternate-version windows, all input/seat routes, hidden joining-only record, reload/sign-in sequence or full four-signature preservation. Their future-posting equality checks do not establish the claimed before-execution membership.
- No scenario is reported as passed. The host still owes the calculation reproduction and running-app walk.

**Rulings:** No new owner ruling was made or recorded. Read-only report; the host records the result.