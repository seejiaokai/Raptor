# Independent expected results — Rally/workspan

Author: Astra, 2 Oct 2026. Companion to bound plan hash `991B2E7BD27035AB7833B3AAB61BDA5A2C2BFDC68617D01BF7D9746989875674`. Independent scenario arithmetic, not inspection/approval of Sol's implementation. Reads of source for this note use `git show 9cc5d4ff:<path>` (pre-build baseline), not current changed files. No tests run. No new product ruling.

Unless explicitly changed in a case: briefLead140, step60, dekit30, reportLead180, debrief120, crewRest720, longDay720 minutes. Use real normal-flight rows, no cancelled/exempt rows, one real crew person and no other commitments unless stated. Minutes are relative to the flight's day; -60 means previous day23:00. All elapsed calculations use signed instants, not formatted clocks. LONGDAY fires for strictly MORE than720 minutes, not equality.

## Important invariant clarification for the builder

D186 freezes the PRINTED blank-B suggestion in View-only/CSV/print, not the validator's brief calculation. Its full row explicitly retains today's rules for validation and working surfaces. The plan's phrase about an issued context must not cause the new chronology collector to read snap.rv instead of the current engine briefLead. D482 likewise makes a debrief rule change update published Insights hours immediately. D478 protects pending DAY edits; it does not freeze all arithmetic. This clarification was sent to Sol promptly, before this note.

## R04/R05 — resolved dates, duplicates and the original fault

| Setup | Exact result |
|---|---|
| TO01:30; same-activity lines23:00 and01:00, either order | Candidates -60 and60; select-60. IN or RALLY clock23:00 is previous day; report=-60. No second subtraction. |
| Same wide lines applied to another formation TO23:30 | Candidates1380 and60, both flight day; select60. The same wave text resolves differently by formation: no CS/wave-only cache of signed results. |
| TO10:00; report19:20 | 1160>600, so report=-280. Broad D503 applies even though nominal report lead does not cross midnight. |
| TO10:00/LD11:25, report19:20, debrief120 | LD685; end805 (13:25); span805-(-280)=1085 minutes=18h05. LONGDAY yes. Header clock19:20, never a negative clock string. |
| Same flight plus ground work today06:00–07:00 | Its start360 is later than-280 and end420 earlier than805; workSpan remains1085. Do not add separate durations to a span. |
| Same flight plus ground work today14:00–16:00 | End becomes960, so span1240 minutes=20h40. End setter is ground: no false statement that the final16:00 includes flight debrief. |
| Same flight plus a second sortie report15:00/TO17:00/LD18:00 | End1200 (20:00); span1480 minutes=24h40. One-day-back REPORT limit is not a maximum work-span cap. |
| No entered reporting clock, TO12:00/LD13:00 | report=step660 (11:00); end900 (15:00); span240=4h. Brief default580 (09:40) remains separate. No new mandatory report and no nominal09:00 substitution. |

Specific-over-wide must be resolved before date minima within EACH activity. Wide IN23:00 plus specific VL IN01:00 for TO01:30 yields VL IN60, not-60; a separate applicable RALLY23:00 still exists and would make report-60 but IN->RALLY is wrong order. The minimum does not cure that stage conflict.

## R11 — standalone and late-show preservation

- SC MAIN07:00–13:00, B05:00: report300; work span480=8h; rest anchor05:00. No flight brief/debrief padding. Blank B:420→780=360=6h. B19:00 on this ordinary07:00 SC start stays its old late value internally and is clamped to07:00 for work/rest; D503 must not roll it to yesterday and manufacture18h duty. Valid SC B still outranks wave text.
- SC small-hours01:30–07:00, B23:00: preserve existing reportLead-bounded SC rollback (-60) rather than deleting it; work span480=8h. This is preservation, not extending D503 to SC.
- SC SPARE, cancelled rows, AVALON/BB: retain existing excluded event/work/rest treatment and their separate availability/currency checks. Do not require IN/RALLY/brief stages on these rows. Compare working hours for the same person before/after adding an exempt/spare row: no added ordinary span solely from that row.
- Late show test: ordinary TO12:00, brief10:00, report09:00, step11:00; yesterday ends22:00, so rest clears10:00. Rest anchor09:00 gives11h rest, shortage1h, still a hard red breach. Sanctioned late show permits dashed ring because clearance10:00<=step11:00. Previous end23:30 clears11:30>step: solid. If an08:00 meeting binds, keep solid even with late-show wording; the remark does not excuse that meeting.

## R12 — earlier commitments and different consumers

Use TO12:00/LD13:00, explicit brief10:00, IN09:00, RALLY09:30. Work end15:00, report09:00, ordinary busy11:00–13:30, crew-rest anchor09:00, SANS09:00–13:30. Report does not rewrite those other windows.

- Scheduled meeting08:00–08:30 for crew A: workSpan08:00–15:00=420 (7h), rest anchor08:00. Crew B remains09:00–15:00=360 (6h).
- The same timed qualifying Meeting INPUT for A, still unaccepted/not scheduled: rest anchor08:00 but EVD workSpan remains09:00–15:00=360. Accepting it onto a schedule row can change the work-span input set through its existing flow; do not double-count.
- Yesterday ends21:30: normal09:00 report gives11h30 rest, shortage30m; earlier08:00 meeting gives10h30, shortage90m. The message must name the actual binding commitment.
- Info-only or cancelled meeting, Personal/SANS Availability Input, and untimed/all-day commitment Input: preserve their current exclusions from this earlier rest candidate/work-span mechanism. They may have other existing warning effects; do not assert the whole day warning-free.
- IN11:00 with brief10:00: current workSpan report11:00 but rest anchor10:00; the new actual IN-after-brief pair must be diagnosed and block publication. Do not disguise it by changing the work-hours report to the brief.

## R13 — SANS and ordinary availability

Using the R12 flight, a SANS Fly offer09:00–13:30 covers the SANS window exactly. Offer11:00–13:30 does not cover the earlier reporting period; picker and SANS warning must agree. IN12:00 after step11:00 cannot shrink SANS start past11:00; chronology may independently be invalid. Normal absent/busy checks still use11:00–13:30, plus their separately defined brief/debrief checks; do not widen personBusy to09:00.

Boundary assertions: offer ending13:29 fails coverage; starting09:01 fails; exact boundaries pass. Existing all-day SANS offering covers signed/overnight slots through the all-day special case. A custom23:00–03:30 interval is not automatically equivalent to a negative-minutes previous-evening interval in every existing SANS reader: characterize baseline before alleging regression or silently fixing a different date-domain rule. Do not claim the two are equivalent from clock display alone.

## R14 — prior-day and week-edge arithmetic

For Monday's TO10:00/LD11:25/report Sunday19:20, report=-280. If Sunday's final commitment ends17:00 (1020), available rest to report is -280+1440-1020=140 (2h20), shortage580 (9h40). Clearance is Monday05:00. This must be assessed even though take-off is daytime; it is the new D503 path.

For Monday TO01:30/report Sunday23:00(-60), Sunday duty ends10:00(600): rest780=13h, no hard rest breach from this pair. Duty ends12:00(720): rest660=11h, shortage60. Duty ends23:30(1410): report precedes duty end by30m; do not wrap the negative rest interval into23h30 or silently call it clear. Existing warnings may render that conflict using their own vocabulary; numeric provenance must stay explicit.

Repeat the same pair at an ordinary Tue/Wed boundary, then Sunday/next Monday with the previous week stashed through real navigation. Monday's backward result and Sunday's forward trace must describe the same commitment pair; the next-week phantom must not write warnings into a loaded day's wrong index. Repeat month/year crossing; no timezone-dependent change. An unauthored neighbour contributes no invented duty. Test issued previous/next day with a different pending end/report: its defined issued/working world must be respected; do not splice yesterday's working end into an issued-world calculation.

Work hours are summed per scheduled-day spans under existing rules, not a new union of all clock intervals across calendar dates. A previous-day report can overlap a prior scheduled-day span; do not silently de-duplicate those hours in this batch. Record such overlap explicitly if the broader accounting definition needs owner attention.

## R15 — header, band and sorting arithmetic

- Wave header selected instant-60 displays23:00 via hm24; add-line seed uses valid23:00 text. Internal selection stays-60. No new previous-day explanatory line.
- Wave starts-60,+60: sorted bands [0,60],[60,1440]. A person busy00:30–00:45 is unavailable in first bucket only; a person busy02:00–03:00 is unavailable in second only. Whole-day-away person remains excluded.
- Wave starts-120,-60: clipped bands [0,0],[0,1440]. First bucket has no members because this empty band is created by previous-day boundaries, not because everybody is free in an empty interval. Second covers today's domain.
- Same-day starts08:00,14:00,14:00: [0,840],[840,840],[840,1440]. Preserve baseline tied-band handling. The existing strict overlap expression may treat a commitment spanning14:00 differently from one touching14:00; do not implement the new prior-day-empty rule by simply excluding every s===e band.
- No reporting instructions: header/bands use earliest TO, not step; individual events still use step fallback. No waves: existing anyWave path remains. Ordinary Auto sort still uses TO even when header reporting order differs.

## R20/R21 — mixed-day issued Insights and live rules

Construct one person's three otherwise empty flying days, each TO12:00/LD13:00/B10:00: draft day IN08:00 ->420m; Original day IN09:00 ->360m; AL day IN10:00 ->300m. Initial total1080m=18h. Ensure this person has no other fixture rows.

1. Draft IN08->07: visible total1140m=19h immediately.
2. Original day pending IN09->08: working day span420, issued Insights still360; total stays1140.
3. AL day pending IN10->09: working span360, issued Insights still300; total stays1140.
4. Publish Original day's amendment through signatures/command: total1200=20h; AL-day pending still excluded.
5. Publish AL day's next amendment: total1260=21h.
6. View-only latest-issued content and all Insights opening doors agree. Opening an old preview does not make Insights use that old version. Do not accept only whole-window text inequality; assert these numeric totals and per-person labels.

D482 separate fixture/reset: debrief120->180 increases each of those three flying-day spans by60 immediately, including published days; total +180. No amendment required for that rule arithmetic. D186 separate blank-B print case: publish TO12:00 at briefLead140, printed B09:40. Change briefLead to180: working suggestion and validator use09:00; issued printed B remains09:40 until next AL and appropriate pending/signature effects occur. A new chronology check must use the engine's current brief rule, not freeze it to the old printed suggestion. Changing step affects missing-report fallback and ordinary busy/SANS minimum; changing reportLead does not undo ordinary-flight D503, while nominal rest advisory/OIL and preserved SC bounded logic retain their own dependencies.

## R22/R23 — persistence, ownership and refusal snapshots

Browser context must use the normal built-site BrowserBackend, never `?fresh=1` for reload proof. Edit through real controls, then Undo/redo; reload deliberately ends session-only undo/history where existing contracts do. Assert raw reporting strings, resolved values, actual rendered text, pending and issued ids, not just a cached helper result. Switch weeks and back; duplicate/select parked plan; save/apply template only where existing published-day rules allow; load an issued version onto working copy without changing issued current id. After each relevant action, old values must not leak via parsed caches.

Actual publication rejection snapshot before call: dayOK, orig, als, cur, correcting, pending, changes, added, signatures/bindings, day content, history/undo publication boundary, issuance records and downstream publish effects/OIL amount. Use real signing before attempt. Test Original, AL and correcting/reissue. An invalid pair rejects before marks reconciliation/sign consumption; no success toast or new version. Advisory-only malformed/clockless-unresolved diagnostics do not add a new publication ban, although existing signature/permission guards still apply. Hiding an actual wrong-pair warning does not bypass its raw publication guard. Correct the pair and the intended day publishes; a different valid day remains independently publishable throughout.

Admin/scheduler, member and guest checks use their actual doors and existing command authorization. No new authority matrix is approved. Reject unauthorized text/add/delete/publish without mutation; view-only/version previews remain inert. If in-place role switching is needed to avoid resetting an unwritten fixture, use the existing permitted role bridge solely for role selection, not fabricated task data.

## R24 — OIL non-regression with concrete duration

Ordinary flight TO12:00/LD13:00 gives nominal earning interval09:00–15:00=360m with reportLead180/debrief120, regardless of IN08, IN10 or earlier Rally07. WorkSpan differs, OIL interval does not. A SC07:00–13:00 interval is360m regardless of early B05, although workSpan is480m with that B. Choose a weekend/PH fixture with an actual earning person and applicable existing policy; record its computed downstream credit before/after reporting edits and AL. Do not guess credits from raw hours because aggregation/threshold/claims have their own existing rules. OIL ledger equality under report-only changes is the assertion; D482 rule changes are a separate case and can legitimately alter the nominal interval.

## Own-control browser fixture recipe

1. Fresh isolated persistent context on the exact frozen production preview. Sign in with local seeded scheduler account. Record source revision, rules and starting week. Do not assign DAYS/INPUTS/SCHED fixtures from evaluate.
2. Through Edit Schedule/board create or select an otherwise empty test day and wave. Use existing +Line, CS/B/TO/LD cells and crew picker; place a known person with no other test-week work for exact arithmetic. Remove unwanted seeded reporting lines through their delete controls. Enter the designated lines in the existing in-time editor.
3. Build ordinary signed-day cases with B10:00/TO12:00/LD13:00 and IN08:00 initially. This avoids the old seed's IN-after-implied-brief conflict. Use the actual signatures and publish controls; create AL through an ordinary edit, re-sign and publish. Do not bypass the new guard merely to make a fixture publish.
4. Build draft/Original/AL/pending states on separate dates. Keep one unrelated day's signed/pending snapshot as an isolation witness. Close the board using Done and wait hidden before inspecting View-only/Insights. Actual visible text, not a covered DOM node, proves the face.
5. Add scheduled earlier duty/meeting via its own row controls; add qualifying personal Input via Inputs; add SANS offer through its proper form. Create SC/standalone via +Wave templates and actual MAIN/SPARE selection. Record the control path if the fixture cannot be made; that is a missing-door finding, not permission to inject it.
6. For week-edge cases, navigate to adjacent week, author Sunday/Monday through controls, save via normal flow and return. Keep persistent context across reload. Measure expected minutes via read-only bridge plus rendered warning/Insights values; mutations stay on UI controls.
7. Repeat distinct week/board editor routes and phone-specific gestures; shared numeric lifecycle can be proved once under D499. Use phone/short screen for warning visibility, focus/caret and docked controls. Keep final bundle fixed during walk; no source or build change under this fixture.
8. Capture selected distinct proof states and open every saved picture. Preserve failures separately. Required evidence includes an actual pair warning, rejection without issuance change, issued/pending separation, exact numeric hours, SANS distinction and week-edge trace. Scope bridge calls as observations, never describe a direct model assignment as an editor test.

Potential invariant issues to escalate rather than silently fix: validator using frozen printed brief (contradicts D186); D503 applied to ordinary SC late B (changes preserved shift meaning); negative previous-day band interpreted as whole-day free; all-day SANS versus custom negative-minute containment treated as interchangeable without baseline; refusal clearing pending/signatures; default step masquerading as parsed malformed input; cross-day overlapping work spans redefined as unique calendar hours. These are independent adversarial expectations, not claims Sol's current code has any such defect.
