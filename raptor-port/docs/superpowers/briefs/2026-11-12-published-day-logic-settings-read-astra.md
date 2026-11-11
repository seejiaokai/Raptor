**Request changes.** The main validation pass handles the stated Ranger example, but several surrounding readers still use the wrong settings.

This is a static review of `30b99f027` against `30370bd29`. I changed no files and ran no tests or browser walks. The reproductions below are code-derived; each includes the proof test for the host to run. I read the required initial handoff, but opened no other reader’s report, walk report, scenario list or evidence sheet for this change. No post-compaction handoff was used.

**1. High — an assumed end on the previous day can change a published day’s crew-rest warning.**

Setup: Ranger has an unpublished Monday ground event starting 20:00 with no end. `openEnd=60` makes its assumed end 21:00. Publish Tuesday with his flight at 12:00, typed B 09:40, and crew rest 720 minutes.

Action: raise `openEnd` to 120 without editing either day.

The code now builds Monday’s end as 22:00. Tuesday’s published check uses that end and raises crew rest: clear at 10:00, after B 09:40. Monday gains the corresponding dotted mark. Reversing the setting can clear the warning.

Under D2005 and the brief’s “day being judged decides” reading, Tuesday must retain the assumptions it was published under. Monday’s own draft checks and Insights may still change.

Cause: [validate.ts, `crewRestDay`](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/engine/validate.ts:509) recalculates a flight’s debrief under the target day’s settings, but consumes every other source event’s already-calculated `e.e`. Those events were built under the source day’s settings.

Fix:
1. Preserve the source day’s applicable content and inputs.
2. Calculate its rule-dependent end for each crew-rest target using that target’s settings.
3. Keep this separate from the source day’s own events and Insights hours.
4. Apply the same calculation to previous-week sources and forward probes.

Proof test: `published_rest_uses_target_open_end_and_sim_length`. Run the example above with both a ground event and a sim lacking an end; assert unchanged official/working Tuesday warnings and Monday traces. Repeat across Sunday/Monday.

The documentation’s “Known limits” acknowledges this behaviour, but does not establish an owner-approved exception.

**2. High — the ALL AVAIL window can introduce a new warning on an unchanged published day.**

Setup: on an ordinary weekday, Ranger flies 12:00–13:00. Add an ALL AVAIL ground event at 15:30–16:00. Publish with debrief 120 minutes: his debrief ends 15:00, so the window shows no clash.

Action: increase debrief to 180, then open that event’s ALL AVAIL count from View-only Sched.

The window now reports a debrief clash ending 16:00, although the issued day has not been amended. The unchanged working copy has the same problem. Lowering the setting can remove a previously shown clash.

Cause: [AvailWindow.tsx](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/ui/AvailWindow.tsx:149) rebuilds issued events through `collectEvents`, but `withChipWorld`/`withDaySnap` installs face attributes without installing the kept-rule context. Its subsequent `crowdClashes` call also reads today’s debrief directly.

Fix:
1. Resolve the rules for the window’s selected world: issued version, untouched working day, or edited working day.
2. Use that context for both event construction and clash calculation.
3. Keep OIL membership and credit calculations under their separate existing rules.
4. Make the row warning, tapped explanation and flagged-person count consume the same result.

Proof test: `issued_and_untouched_avail_window_keep_debrief_checks`. Assert the window’s flags, count and explanation before/after both increases and decreases. Add sim brief/debrief variants. Check admin, member and guest readers.

**3. Medium — OIL still inherits kept settings through its availability dependency.**

The direct `oil.ts` conversions to `ruleNow` do not isolate the whole OIL calculation.

Concrete reproduction: publish an earning Saturday outside every Leave War period. Put all otherwise eligible aircrew on an AMT session starting 09:00 with no end, and an ALL AVAIL ground event at 10:30–11:30. Publish with `simLen=60`; the ground event has earners, while the unfinished sim itself earns nothing.

Raise `simLen` to 180.

Outside validation, today’s OIL candidate excludes those people from the ground event: they are busy until 12:00, so `oilWouldEarn` is false. During validation, the published day’s kept overlay makes the same availability calculation use 60 minutes; `oilWouldEarn` becomes true and retains the “no Leave War period” reminder. That is a change to OIL’s existing calculation caused by this build.

Cause: [validate.ts’s OIL block](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/engine/validate.ts:1557) runs inside `withDayRules`. `oilWouldEarn → oilEvidence → HOOKS.oilSentinel → availableFor → personBusy` reaches ordinary `VCONF` readers in [avail.ts](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/engine/avail.ts:13).

Fix:
1. Give OIL’s complete live-candidate calculation an explicit current-settings context, including its availability dependencies.
2. Preserve issued OIL evidence and its separately kept values.
3. Check `step`, `dekit`, `simLen` and `openEnd`, not only the three direct OIL pricing values.

Proof test: `oil_candidate_and_reminders_ignore_scheduler_rule_overlay`. Assert identical live OIL evidence and earning decisions inside/outside a scheduler overlay, then assert the production reminder follows that result.

I found no demonstrated overwrite of issued OIL credits; this finding concerns the calculation and displayed reminder.

**4. Medium — a hidden next-week run warning can regain its dotted marks.**

Setup: Ranger works Tuesday through Sunday, then next Monday: seven consecutive days. Publish Monday under `maxRun=6`, hide its run warning, and issue that hide. Publish the preceding Sunday too.

Action: change today’s `maxRun` to 7 and view the preceding week.

Monday still correctly has its hidden breach under its kept limit of six. However, the preceding week constructs the trace’s warning text using **seven**. Its hide key no longer matches Monday’s stored key, so dotted run marks return although the target warning remains hidden.

Cause: [validate.ts, `traceRun`](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/engine/validate.ts:427) calls `runSays` outside the target day’s overlay. `hideKey` includes that sentence; `shownOf` matches cross-week hides by this key.

This conflicts with D2005 and the hidden-warning contract: hiding the warning removes its associated marks.

Fix:
1. Generate the trace’s warning identity and wording under the breached day’s settings.
2. Carry the applicable limit with the result instead of rereading today’s limit.
3. Use that result for both the warning and its cross-week hide lookup.

Proof test: `hidden_published_monday_run_keeps_sunday_trace_hidden`. Assert Monday remains hidden and preceding traces remain absent on both passes after 6→7, navigation and reload.

**5. Medium — the crew picker forecasts a different result from the resulting schedule.**

Setup: publish Tuesday’s Ranger flight at 12:00, B 09:40, under 12-hour rest. Monday has an 18:00–19:00 formation with another pilot and an empty aircraft seat.

Action: raise current crew rest to 13 hours and ask to place Ranger in that Monday seat.

The picker’s forward probe says the placement breaks Tuesday. After placing him, Tuesday’s unchanged published check uses its kept 12 hours and stays clean: Monday ends 21:00, leaving 12h40.

The reverse matters too: Tuesday published under 13 hours, followed by today’s reduction to 12, can make the probe miss the breach that Tuesday’s kept check will raise.

Cause: [validate.ts, `restIfPlaced` and `runIfPlaced`](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/engine/validate.ts:2117) run outside the day overlays. The run probe also compares every future day with one current `maxRun`.

Fix:
1. Judge the day being edited under today’s settings.
2. Judge each unchanged published neighbour under its own kept settings.
3. Build hypothetical event timings consistently with that choice.
4. Return the applied limit with run-probe results so the displayed reason cannot reread another limit.

Proof test: `picker_forward_rest_matches_published_target_after_placement`, in both directions above. Assert `crossDayIfPlaced`/`slotBar` and the actual post-placement warning agree. Add the equivalent mixed-limit run test.

**6. Medium — switching weeks changes whether a pending published day uses today’s settings.**

This can be demonstrated by extending the existing first neighbour test.

Setup: next Monday is published with take-off 12:00, blank B and brief lead 140, printing 09:40. This Sunday’s duty ends 21:30.

Action: raise brief lead to 200.

While the preceding week is loaded, the working Sunday shows no “Breaks Monday”: the neighbour keeps 140. Load Monday’s week, and its working copy uses 200 because its changed printed brief is pending; B becomes 08:40 and crew rest is breached. The issued Monday correctly remains clean.

Cause: [weekctx.ts, `keepUntouchedRules`](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/engine/weekctx.ts:87) checks content, filing and inputs, but omits the printed-brief and people-attribute comparisons present in `untouchedKept`.

Fix:
1. Extract one shared decision for whether a published working day keeps its rules.
2. Include printed brief and relevant people attributes on both loaded and stashed paths.
3. Preserve the existing cross-week filing normalization.
4. Use the same decision after navigation and reload.

Proof test: `working_sunday_trace_matches_pending_monday_after_week_switch`. Extend the existing blank-B neighbour fixture to compare **working** Sunday with **working** Monday, while separately asserting both official results remain clean.

**7. Medium — hide-only and OIL-only pending changes do not switch the working preview.**

This finding follows the brief’s stated host reading that a day with changes waiting previews its next amendment; that reading is not independently confirmed in D2005.

Hide reproduction: use the Ranger example and publish Tuesday with an additional long-day note. Raise crew rest from 12 to 13 hours, then hide that note. The hide is pending, but working Tuesday remains crew-rest-clean. Issue the amendment and Tuesday becomes red.

An OIL-only reproduction is also available: publish a Saturday 12:00–13:00 flight with default report 09:00, debrief 120 and long-day threshold 390 minutes. Increase debrief to 180. Its OIL change is pending, but the working long-day check retains the old six-hour span; the amendment then produces the seven-hour long-day note.

Cause: [validate.ts, `untouchedKept`](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/engine/validate.ts:1934) omits hides and OIL pending changes. `canonicalDiff` deliberately excludes OIL fields.

Fix:
1. Include these pending axes in the shared preview decision from finding 6.
2. Determine effective hide differences against the issued check’s warning identities, excluding stale hide keys.
3. Evaluate OIL differences under current OIL settings.
4. Avoid calling `dayDelta` recursively from validation.
5. Undoing the sole pending change must restore the kept-rule preview.

Proof tests: `hide_only_pending_previews_current_rules` and `oil_only_pending_previews_current_checks`. Include hide/reset, undo/redo, amendment and reload.

**8. Medium — warning labels and reporting tooltips can contradict the issued checks.**

Two concrete cases:

- Publish Ranger’s Tuesday breach under 13-hour rest, then reduce today’s setting to 12. The retained warning still explains the 13-hour calculation, but its heading/crew-chip title expands `{crewRest}` from today’s value and says “<12h”.
- Publish a 12:00 flight with blank B and typed R 09:10 under brief lead 140. The issued B is 09:40 and the order is valid. Raise brief lead to 200. The issued face still prints B 09:40, but its R-box tooltip now claims rally 09:10 is later than suggested brief 08:40.

Cause: [validate.ts, `wlbl`](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/engine/validate.ts:117) expands current values at render time; [html.ts’s reporting checks](/C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/src/ui/html.ts:1938) recompute outside the issued-rule context.

Fix:
1. Carry the judged threshold in warning presentation data, or render it using the warning’s selected day/version context.
2. Obtain reporting faults from that same context.
3. Apply this to full redraws and reporting-feedback refreshes.
4. Keep editable suggestions distinct from explanations of an already-issued check.

Proof test: `issued_warning_labels_and_reporting_titles_use_kept_rules`. Render the issued day and inspect the warning heading, chip title and R-box title—not merely the engine warning list.

**Answers to the nine scope questions**

| Question | Result |
|---|---|
| **1. Every check and reader?** | **No.** Findings 2, 5 and 8 identify uncovered readers. Additional direct paths needing the same treatment are `personBusy`/`availByWave`, `slotRules`’ timing and SC classification, `slotBarNow`’s `shiftEvHard`, reporting-feedback refreshes, and `fltNoLenSays` in renderers. Main validation and its ordinary event collection are covered. CSV and print use the issued content and kept brief; they do not independently run these warning checks. |
| **2. Missing or wrongly kept keys?** | No missing active numeric check setting found in `KEPT_RULE_KEYS`; the SC clash table is also captured. Cut-offs, input settings, `reportText`, OIL’s full-day threshold and unused `dur`/`minTurn` are appropriately excluded. Shared settings such as debrief belong in the check snapshot; the OIL problem is context leakage, not their inclusion. |
| **3. Cross-day consistency and orphan marks?** | **Not consistent:** findings 1, 4, 5 and 6. Ordinary same-week target overlays and flight-debrief arithmetic are present. The hidden cross-week run case supplies a concrete orphan mark. |
| **4. Working-copy transitions?** | Content, filing, input, people-attribute and printed-brief differences can select today’s rules in the loaded week. Stashed-week selection differs, and hide/OIL-only pending changes are missed. I found no separate loss of the saved settings through Load, saved plans, undo/redo or reload. These transitions still need the proposed runtime proofs. |
| **5. Pending and sign-offs?** | The narrowed `warnDelta` comparison correctly avoids comparing the entire new settings snapshot. I found no new route there that suppresses an ordinary content/input/filing change. **There is an existing exception to the blanket wording:** D592’s OIL rule changes can still create pending changes and invalidate sign-offs. Preserving OIL means preserving that exception; it is not introduced by this build. |
| **6. Overlay restoration?** | No restoration leak found for synchronous returns, throws or nested calls. `finally` restores changed values and the outer live snapshot; `ruleNow` returns the outermost current values. A nested null/partial overlay inherits outer values for omitted keys—it does not independently reset to today’s. No asynchronous use was found. |
| **7. OIL and Insights?** | OIL is **not completely isolated**, finding 3. No demonstrated issued-credit rewrite found. Insights’ separate `hoursEvd` rebuild and current `workSpan` preserve D482; no additional hours defect found for the settings used by those calculations. |
| **8. Publication/version lifecycle?** | Original and AL publication capture fresh values through `freezeWarn`; Load does not replace global Logic settings; Unpublish resolves the prior issued version or leaves a draft. Whole snapshots retain `rv` through history/storage paths. No separate persistence defect found. Missing/brief-only `rv` falls back to current values for the rest in the ordinary top-level path; no D56 migration finding is raised. **EOD is explicitly deferred in the backlog and has no executable publication path to review.** |
| **9. Missing coverage?** | The specialised ALL AVAIL window, picker forecasts, warning presentation, effective pending selection and cross-week hide identity are the principal omissions. Roles do not provide separate calculation paths that avoid these faults: members and guests can encounter issued-view defects. No new permission-writing route was found; signed-out access still needs its normal boundary check. |

The production checks should start with the least-shared surfaces: ALL AVAIL count → window → person explanation; then crew-picker strike/reason → placement; then hidden next-week warning → preceding dotted mark. Follow with Edit Schedule, Scheduler Board, View-only Sched, version previews, next-week preview, Insights, CSV and print. For each reproduction, compare the visible warning, ring/dash, explanation and pending count—not just the warning code.

The host should first write the named proof tests in its own scratch area using the existing publication and neighbour-week harnesses. Then run the changed test files, plus the relevant existing cross-day, crowd-sim, hidden-warning, OIL-work-start, Load, draft and export tests. Add explicit overlay tests for nested numeric/table overrides, thrown errors, early returns and `ruleNow`.

**Walk:** not run; read-only code review only.  
**Rulings:** none recorded; no files changed.