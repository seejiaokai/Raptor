**Sol’s independent review: no new blocking finding.**

Reviewed `claude/oil-work-start-build-35a0e3` at `aec146fc` against `origin/main`, including the specified source, tests and documents. The working tree was clean. I changed nothing, ran no tests, started no server and did not read any `*-read-astra.md` file. I read the separately named scenario-design report because the brief requires it.

This is source-review evidence, not owner approval or a claim that I independently verified the running app.

**Coverage and missing call sites**

The qualifying work includes ordinary flight crews and extras; SC MAIN and SPARE; AVALON/BB seats and desks; sim seats, passengers and extras; duty names and extras; Ground and Common Programme participants, including ALL/ALL AVAIL; and confirmed commitment requests with their requester and additional participants. Cancellation, missing times, information-only rows and the person/row/day decisions remain separate eligibility conditions.

| Production surface or path | Expected visible result and gesture | Source-read result |
|---|---|---|
| Ordinary flying, week and board | Enter, edit or remove In-time/Rally through the existing controls; working OIL follows the applicable report | Shared reporting reader is connected |
| Other work kinds and secondary participant positions | Written-window OIL; eligible standby work defaults off and can be enabled through OIL Earn | No changed calculation or missing participant path found |
| Loaded-week and stashed-week credit writers | Latest issued version supplies each date’s amount and worked periods | Both paths retain the date’s own evidence block |
| Leave War grid | FO/HO reflects issued work; tapping opens the day’s sheet | Reads the generated credit |
| Day sheet, bid picker and day list | Show all stored worked periods | Read stored periods, without recalculating flight padding |
| OIL tracker and balance | Show every worked period and the credit’s contribution to the balance | Renderer now prints every period; ledger reads stored credit |
| Leave War clash strip | Compare an absence against the issued credit’s stored periods; retain existing resolution controls | “By construction” is supported by the code |
| Publish-time warning | Identify bids overlapping the newly issued work | Uses the same issued work and period conversion |
| Unpublish warning | Read the landed credit and tracker balance | Saved-value path is connected; the already-filed withdrawal-counterfactual fault remains |
| Board/week green edges | Published face uses kept values; working face uses current values | Shared figures receive the correct evidence |
| OIL Earn figures and switches | Working figures follow current values; existing admin-only switches change decisions | Connected; published faces do not gain mutation controls |
| ALL AVAIL window | “Who earns OIL” agrees with the face/version being shown | Version context and shared figure reader are connected |
| OIL advisories | Candidate reminders use current candidate work; issued work is not silently recalculated | No missing saved-value reader found |
| Pending chips, Amendments and To go out | One separate Logic-change item; chip opens an explanation naming values and affected people | Count and list use the same pending-item body |
| Four sign-offs | Invalidate when the signed candidate’s OIL record would change; restore when the value is restored | Candidate binding carries the signing-time values |
| Saved plans and loaded versions | Loaded content becomes a working copy; each plan retains its own signatures | Published evidence is stripped; complete signature bindings are cloned |
| Original/AL previews and open overlays | Each issued preview reads its own evidence; closing restores the underlying context | No live-value leak found |
| Members and guests | Same accessible issued answers, with existing read-only restrictions | No new write door introduced |
| Logic page | Explain reporting, holding and standby opt-in accurately | Three requested wording reads addressed below |
| Insights | Continue its separately ruled live work-hours calculation | Preserved |
| CSV/print and next-week peek | No OIL-ledger output is promised on these surfaces | No omitted OIL reader found: CSV/print have no OIL column; peek uses its existing inert renderer |
| All changes history | No newly invented Logic-history entry | Existing omission is filed under `[HIST-PER-PAGE]` |

I found no additional qualifying amount/time surface missing from the implementation. The clash strip and publish warning are genuinely constructed from the relevant stored work, although their runtime cases remain unwalked.

**Explicit negatives against the ten claims**

1. **Ordinary reporting:** I checked formation-specific versus wave-wide lines, separate In-time/Rally applicability, duplicates, missing callsigns, cancelled formations, unusual `standalone` values, malformed `intimes` and unreadable landing times. I found no new defect. Ordinary waves use the shared resolver; standalone classification remains the existing truthiness test. The normalized parsing copy changes only `intimes`; the subsequent resolver does not depend on that changed property. A missing readable landing prevents measured work.

2. **Other work:** I compared the nonordinary branches with `main` and found no unintended movement in SC, exempt defaults, cockpit filtering, extras, sims, duties, Ground, Common Programme, confirmed requests, membership or decisions.

3. **Issued readers:** I traced the loaded/stashed credit pass, figures, green edges, availability window, publish warning, Unpublish calculation and downstream stored-record readers. I found no issued amount or worked-time path still using the three live values. `oilWouldEarn` deliberately examines the live candidate. `step` is absent from this OIL calculation; assumed open-ended lengths serve membership/display without creating earned spans. The reporting resolver’s standalone-specific live-lead branch is not reached by ordinary OIL reporting.

4. **Publication storage:** I checked first publication, amendments, reissue, withdrawal and republish, Undo/Redo restoration, stashed weeks, plans and version loading. I found no missing freeze point. Live candidate evidence can contain current `rv`, but publication persists it through `daySnap`; loading issued content strips the entire evidence block. Evidence/signature keys are built field by field and do not accidentally acquire raw `rv` equality.

5. **Pending comparison:** I checked clipping, merged periods, unchanged amounts with changed times, loss of all earning work, non-earning blocks and absent roster entries. I found no new defect. Both sides use identical content and evidence apart from rule values. The replacement evidence object prevents reuse of the old work memo. Comparison uses the amount and the clipped, merged periods actually stored. People are sorted, and `oilrv:<di>` survives the relevant address readers safely.

6. **Counts, list and publication:** I checked request folding, OIL decisions, warning hides, sign-offs and stored amendment counts. I found no disagreement introduced here. The Logic item remains separate from request/decision changes. Publication captures its diff and counts before replacing the issued snapshot. Historical amendment summaries classify it as OIL; they do not reinterpret it as a crew-cell address.

7. **Signature binding:** I checked unpublished candidates, waiting amendments, restoring values, older bindings, holiday classification and parked plans. I found no new defect. `orv` checks the candidate under signing-time and current values. A formerly non-earning day becoming earning is also caught by the existing evidence binding. Plans carry the complete binding. Equal values take the fast path before rebuilding OIL evidence for that role. I found no production mutation inside the relevant read pass that makes its current-binding memo stale.

8. **Robustness:** I checked malformed kept values, non-string reporting entries, missing inputs, cancellations and edits, rule bounds and persistence paths. I found no new source defect. Invalid kept triples fall back as a whole. Reporting entries are normalized safely. Lead/debrief permit 0–480; threshold permits 60–720. Saved snapshots remain authoritative after reload. This does not establish instantaneous cross-tab merging, which this change does not introduce.

9. **Moved function:** I compared the removed `workSpans` body with `oilWorkSpans`. The body is unchanged. The old credit and warning callers reach it through the imported alias. I found no lost caller.

10. **Tests:** I read the new tests, changed RT8 pin and the break-test script/result artifact. I found no weakened product expectation or test fixture bypass that invalidates this change’s core proof. RT8’s OIL expectation now follows D591 while retaining its ordinary-busy assertion. The recorded 22 cuts have named failing tests, rather than merely a zero-test result. I did not execute them.

**Exact cases for the host, ranked from specialised surfaces**

These are disproof cases, not newly established findings. Defaults below are lead **180**, debrief **120**, threshold **361** minutes.

| Priority | Setup and action | Expected result | Observation that disproves correctness |
|---|---|---|---|
| 1 — clash and publish warning | Saturday flight 12:00–13:00, report 10:00; publish. Place an afternoon bid beginning 15:15. Change debrief to 150, then sign and amend | Before amendment: HO, worked 10:00–15:00, no new overlap. Amendment: HO, worked 10:00–15:30; normal clash/warning handling applies | Clash changes before issue, or amendment still compares against 15:00 |
| 2 — parked-plan signatures | Unpublished Plan A: flight 10:00–11:15, no report, sign four roles. Duplicate Plan B; change its flight to 12:00–13:00 and sign it. Set lead 150 and switch between plans | A changes FO→HO; B remains HO but its worked start changes. Both plans’ old signatures are invalid. Restore lead 180: original signatures stand again | Switching plans revives signatures under the wrong values or copies another plan’s binding |
| 3 — three version contexts | Publish 10:00–11:15 with lead 180; amend at 150; then change live lead to 120. Open working face, current issue, Original preview and their availability windows | Working HO, 08:00–13:15; current issue HO, 07:30–13:15; Original FO, 07:00–13:15 | Any overlay borrows another version’s values or alters the underlying face |
| 4 — off-screen date ownership | Publish matching 10:00–11:15 flights in two Saturdays. Change lead to 150; amend only the first, then reload | First is HO; second remains FO with its original periods and balance contribution | Both dates adopt the amended date’s values |
| 5 — period merging | Duty 06:00–06:30 plus flight 12:00–13:00 with report 10:00; publish. Raise debrief 120→150 and amend | FO stays FO. Initially two periods: 06:00–06:30 and 10:00–15:00. One OIL Logic item; amendment changes only the second end to 15:30 | Tracker hides the second period, fills the gap, or amount-only comparison suppresses pending |
| 6 — clipped-away changes | Flight 22:00–01:00, report 20:00; publish. Reduce debrief 120→90 | FO and stored 20:00–23:59 remain unchanged; no **OIL-record** pending item from this change alone | OIL pending is raised solely for the unstored next-day end |
| 7 — previous evening | Saturday flight 01:00–02:00, report 22:00; publish. Change report to 21:59 and amend | HO→FO on Saturday; stored periods remain 00:00–04:00. Friday earns nothing | Amount is calculated from clipped hours, or Friday receives a credit |
| 8 — separate acts | Publish duty request 06:00–06:30 plus the 12:00–13:00/report-10:00 flight. Edit the request to 07:00–07:30 and raise debrief to 150 | Request edit folds its own OIL evidence change; Logic change remains a separate item. Published work holds. Amendment stores 07:00–07:30 and 10:00–15:30 once | One act disappears, the two acts collapse into one, or pending text claims its Logic comparison is the combined candidate |
| 9 — newly earning day | Sign and publish a weekday flight 12:00–13:00/report-08:30 while it is not a holiday. Declare it PH | Candidate FO; issued credit remains absent; signatures invalidate and reissue is required | Credit lands immediately or old signatures authorize the changed classification |
| 10 — uncommon kinds and bounds | SC MAIN 07:00–13:00; vary B, lead and debrief. Separately opt in AVALON 19:00–07:00. Test lead/debrief 0 and 480, threshold 60 and 720 | SC remains its written 360 minutes; threshold alone can change its amount. Enabled AVALON measures 720 minutes and stores 19:00–23:59 | Flight padding appears on either standalone kind, or boundary values corrupt publication |
| 11 — malformed reporting | Ordinary 12:00–13:00 flight with `intimes` respectively a string, null, `[null, {}, true]`, or unreadable clocks; separately give unreadable landing | Malformed reporting falls back to 09:00–15:00, HO. Unreadable landing produces no measured work | Crash, invented clock, or invented landing span |
| 12 — cold second tab | Publish the 375-minute FO fixture in tab A. Save lead 150. Cold-load tab B and revisit both scheduler and Leave War | Issued FO holds; working candidate is HO; pending/signature state follows saved current rules | Cold load recalculates the issued credit using live values |

Meaningful orders also include reporting add/edit/remove versus sign/publish/amend; each Logic value versus those actions; decisions versus Logic/amendment; request edits versus Logic; version loading versus Logic; and withdrawal, Undo, Redo and reload around both first publication and amendment. The sheet records **120 of 364** expanded pair runs. It does not establish all-pairs runtime coverage.

**Test and evidence limits**

- The browser regression exercises real creation, signing, first publication, Logic editing and amendment. It covers OWS6–8; it does **not** itself enter an In-time/Rally or exercise phone width.
- The non-array reporting assertion at `engine/oilworkstart.test.ts:115` checks truthiness. An optional strengthening is to assert exactly `[[540, 900]]`; neighbouring malformed-entry cases already assert exact fallback spans.
- The sheet explicitly leaves the clash strip, publish toast, guest pages, phone OIL Earn figure, some phone action orders and many ordered pairs unwalked. Chromium phone pictures do not establish real-iPhone behaviour.
- The sheet’s opening refers to a final Status section that is not present in the reviewed file. I therefore make no claim that the complete final gate/status report is finished.

The already-filed `[UNPUB-WARN-AL-RESTORES]`, `[OIL-ZERO-SPAN-SORTIE]` and `[HIST-PER-PAGE]` issues remain distinct from this change. The Unpublish counterfactual is unchanged from `main`; the other named limitations are also not new findings here. I report no migration or stored-demo-data-only defect under D56.

**Three owed reads**

- **D591 short line:** PASS. Removing “NOT YET BUILT” changes status, not meaning. The full row explicitly preserves its earlier wording as historical and identifies D592’s confirmation.
- **D592 readings (6)–(10):** PASS as recorded interpretations. They are explicitly labelled the agent’s readings, “not his words until he answers.” Actual later reports, unreadable fallback, full-record comparison, candidate signature protection and SC’s exclusion are consistent interpretations; they are not falsely presented as fresh owner rulings.
- **Three Logic sentences:** PASS. Nominal fallback matches ordinary flying; the OIL explanation matches actual reporting, saved values and standby opt-in; the AVALON/BB sentence’s opt-in exception is consistent with both desk and seat behaviour. No calculation change is needed.

**Findings:** None requiring a code change.  
**Walk:** Not run, as instructed.  
**Rulings:** None made or changed.

**PASS — required changes: none.**

