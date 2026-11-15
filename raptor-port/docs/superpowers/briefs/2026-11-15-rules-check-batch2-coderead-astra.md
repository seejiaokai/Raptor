# The rules check's small batch — Astra's blind code read (15 Nov 26)

Astra (`codex exec --skip-git-repo-check -m gpt-6-astra -c model_reasoning_effort=high -s read-only -C C:/Users/User/rcb2-read`), the brief `2026-11-15-rules-check-batch2-coderead-brief.md`, in the exported copy (the branch at `877810b90`, app code as at `cc2eefa50`), blind to the walk and to the Opus read; started 01:20, finished 01:28 (a first try at 01:18 stopped at once: the copy is not a git folder). His final message, whole:

Blind code-reader report

I read BRIEF.md in full, BATCH-DIFF.patch, the applicable decision rows, and the relevant producers, readers and renderers under this folder. I opened nothing outside C:/Users/User/rcb2-read, used no outside memory or other reader’s report, ran neither the app nor tests, and wrote no file. No post-compaction handoff was presented.

There are two functional gaps and two comment-accuracy corrections. The functional gaps are older code left uncovered by this change, rather than regressions introduced by its added lines. Both affect newly created data and therefore remain findings under D56.

All screen outcomes below are predictions from code inspection, not observations from a running app.

1. Highest priority: an OIL-only pending change is missed when deciding which settings govern a neighbouring week’s working preview.

Concrete failure:

1. Use fresh, otherwise empty weeks beginning 13 and 20 July 2026, with Bane as an aircrew member.
2. Set crew rest to 12 hours, default rally to 3 hours, flight debrief to 2 hours, and full-day OIL threshold to 6h01.
3. Make Monday 20 July an earning day. Put Bane on VL, take-off 12:00, landing 13:00, explicit B 09:40, with no entered in-time or rally.
4. Publish Monday. Its OIL work span is 09:00–15:00: six hours, hence half a day.
5. On Sunday 19 July, put Bane on a flight taking off 18:00 and landing 19:00. With the original settings, Sunday ends at 21:00 and rest clears Monday at 09:00, before Monday’s B.
6. While viewing the earlier week, change flight debrief to 3 hours on Logic.
7. Inspect Sunday’s working “Breaks Monday” trace, then load the following week and inspect Monday in Edit Schedule.

Expected:

Monday’s OIL record would change, so it has a pending amendment. Under D2013, its working copy must therefore use today’s settings. Sunday now ends at 22:00; rest clears at 10:00; Monday’s 09:40 report breaches rest by 20 minutes. Sunday’s working trace and Monday’s working warning must agree.

View-only Monday should retain the published judgement and half-day OIL until republished.

Predicted failure:

Sunday has no working “Breaks Monday” trace, but loading Monday reveals its working crew-rest breach. The decision about which settings apply changes merely because the week was loaded.

Cause:

- raptor-port/src/engine/weekctx.ts:89–104, keepUntouchedRules, checks content, filing, input details, personnel attributes and the printed brief. It never checks the OIL rule delta before attaching snap.rv.
- raptor-port/src/engine/validate.ts:1955–1976, untouchedKept, does check dayDeltaCore, including both OIL entries, for loaded days.
- raptor-port/src/engine/publish.ts:682–684 supplies the missing decision through oilRuleShift.
- raptor-port/src/engine/validate.ts:1645 runs the forward calculation under the neighbour’s attached settings. The picker’s forward probe uses the same neighbour at line 2234.

This is a missing call site, not a defect in the new crew-rest sentence.

Age:

Older. BATCH-DIFF.patch does not change weekctx.ts or these setting-selection branches.

Exact fix:

1. Import oilRuleShift into weekctx.ts.
2. In keepUntouchedRules, after resolving a valid snap and before keepRulesOn(days[di], snap.rv), evaluate oilRuleShift(snap.d, snap.d.oilev).
3. If it returns any rows, continue without attaching the kept settings. The copy was already cleared by keepRulesOn(days[di], null).
4. Leave issuedDayIn unchanged: the official neighbour must continue using the issued settings.
5. Do not call dayDeltaIn with the neighbour’s index as a shortcut: it reads the currently loaded DAYS. Likewise, oilEvidence’s date hooks are loaded-week hooks; an arbitrary neighbour object does not make them neighbour-aware.
6. Add the regression below.

Exact host test:

Extend src/state/published-day-logic-neighbour.test.ts using its existing boot, publishing and loadWeek harness. Name the test:

“OIL rule pending on a published neighbour makes its working crew-rest preview use today’s settings.”

Use the dates, person and clocks above. In the fixture, make HOOKS.oilEarningDay return true for Monday while W2 is loaded; save and restore that hook. After changing only debrief from 120 to 180:

- Assert Sunday’s working trace exists before loading W2.
- Load W2 and assert an oilrv pending entry and a working CREW_REST warning for Bane.
- Assert the warning clears at 10:00 and reports 20 minutes short.
- Assert the official Monday remains clear.
- Restore debrief to 120 and assert the OIL pending entry and working breach disappear.
- Repeat with republication instead of restoration: the official Monday should then acquire the new judgement.

The current code should fail the first assertion. If Sunday already gets the correct trace with no additional pending content, the proposed failure is disproved.

2. D2010’s “wherever” requirement still misses borrowed-landing descriptions outside the crew-rest tail.

Start with the specialised surface: the ALL AVAIL window’s own debrief reason.

Concrete failure A:

1. On an otherwise empty Tuesday 14 July, put Bane on VL BFM, take-off 12:00, landing blank.
2. Add OPS BRIEF, 12:45–13:15, with ALL AVAIL.
3. Open its count chip and inspect Bane’s row; tap his puck to read the full reason.

Expected:

If the existing assumed debrief warning is shown, its explanation must say that 12:00 is the take-off borrowed because no landing was typed, with a two-hour debrief assumed.

Predicted screen:

“Not enough time to attend the VL BFM debrief — OPS BRIEF sits inside 12:00–14:00 (land + 2h).”

That still represents the borrowed take-off as the landing basis. Bane remains eligible for the crowd in this fixture because personBusy requires both flight times before adding a flight busy window.

The same problem reaches the ordinary warning list and board if OPS BRIEF names Bane directly instead of using ALL AVAIL.

Concrete failure B:

1. On the same clean day, give Bane two flights: VL1 at 12:00 with blank landing, and VL2 at 13:00–14:00.
2. Use step 60 minutes, dekit 30 minutes and tight-turn setting 60 minutes.
3. Open the day’s issues.

Predicted screen:

“Tight turn …: 60 min land→next T/O (needs 90 min …).”

There is no typed landing from which that 60-minute interval was measured.

Cause:

- src/engine/events.ts:331 substitutes f.to for a blank f.ld.
- src/engine/validate.ts:208–209, debriefSays, always describes the resulting window as “land + …”.
- Its ordinary-list caller is validate.ts:1144; its ALL AVAIL caller is validate.ts:263.
- src/ui/AvailWindow.tsx:168–190 renders that reason; the selected-person footer reads the same flags.
- validate.ts:796–806 accepts the finite borrowed landing and always prints “land→next T/O”.
- The patch changes only the cross-day tail at validate.ts:659.

Age:

Older wording and arithmetic, left unfixed by this change. Neither formatter is changed by the patch. This is not a complaint about warnings saved before deployment: these sentences are generated for fresh rows now.

Exact fix:

1. At flight construction in events.ts, record whether an ordinary sortie has a readable take-off but no readable landing. Carry an optional marker on both its fly entry and its events entry. Do not mark standalone shifts as ordinary sorties.
2. Use that marker in debriefSays. For the blank-landing case, retain the existing interval but replace “land + 2h” with wording such as “took off 12:00 with no landing typed; +2h debrief assumed”.
3. Use the predecessor’s marker in the TURN formatter. Say that the interval is from the take-off used because no landing was typed; retain “land→next T/O” for a typed landing.
4. Keep these decisions in the shared formatters. Do not add a separate ALL AVAIL sentence.
5. Preserve existing arithmetic and warning eligibility. In particular, do not make TBD participate in these same-day checks merely to fix wording: D1990’s arithmetic change is expressly for crew rest.
6. Add both engine assertions and the ALL AVAIL rendering assertion below.

Exact host tests:

- In src/ui/availwin.test.tsx, adapt its existing real-resolver “owner’s case” test to the 12:00/blank flight and 12:45–13:15 OPS BRIEF. Assert that Bane is listed, the reason identifies the missing landing, and tapping his puck gives the same explanation without “land +”.
- Add a validate() test with the named OPS BRIEF and assert the DEBRIEF message has the same truthful wording.
- Add a validate() test for VL1 12:00/blank and VL2 13:00–14:00. Assert the TURN message identifies the borrowed take-off.
- Change VL1’s landing to 12:15 and assert ordinary landing wording returns.
- Check TBD separately without changing its existing same-day eligibility; the cross-day TBD assertion must still pass.

Absence of the predicted messages in these fresh fixtures would disprove the relevant failure. Their presence with the borrowed time called “land” confirms it.

3. Changed comments overstate which changes make a day pending.

These are documentation findings, not additional runtime failures.

A. src/engine/oil.ts:1–3 and src/engine/faceattrs.ts:68–73.

The new comments say a change of any of the three values “reads pending”, without the effective-record condition. The implementation deliberately does not do that.

Concrete counterexample:

Publish a fresh Saturday with only Bane’s duty desk, 08:00–14:00, and oilFullMin 361. Change reportLead and debrief, or change oilFullMin from 361 to 365. The desk’s half-day amount and stored worked times remain identical, so the screen correctly shows no pending change and its signatures remain valid.

Evidence:

- oilev.ts:722–729 compares the resulting records, not merely the settings.
- leavewar/oilworkstart-published.test.ts:206 onwards already contains a test named “a change that would write no record on this day differently raises nothing”. I read it; I did not run it.

Age:

The unconditional assertions are newly introduced wording in the patch.

Exact fix:

Replace the pending assertion in both comments with:

“A change reads pending only where today’s values would change someone’s credited amount or the worked times stored with that credit; the issued OIL remains unchanged until republication.”

The opening of oil.ts should also distinguish building live evidence with today’s defaults from reading issued evidence with its own kept values.

B. src/engine/publish.ts:749–759.

The edited paragraph now brings “every setting its checks read” into a sentence followed by “they are COMPARED, so a change reads pending”. That is not what warnDelta compares.

Concrete counterexample:

Publish a clean day with explicit brief times. Change only crewRest from 720 to 780. With no other change, its published checks retain 720 and the setting change alone does not make the day pending.

Evidence:

publish.ts:853–857 compares only the printed briefLead on the rule-value part of the warning/face axis. The following comment at line 759 correctly says so.

Age:

The newly expanded antecedent makes this comment misleading; the comparison code is unchanged.

Exact fix:

Split the paragraph into these facts:

- Personnel face attributes and the applicable printed brief lead are compared.
- All check settings are retained for judging the issued version.
- Other retained check settings do not create pending changes merely because today’s value differs.
- Effective OIL-record changes have their separate comparison.

No runtime code change is required for either comment correction.

4. Truth check of the Logic strip.

The new OIL sentence is materially correct:

“If a changed OIL setting would change that OIL, the day reads pending.”

The code also treats changed worked times as a changed OIL record, even if the amount remains half or full. That follows D592’s full row; “that OIL” should not be tested as amount-only.

The preceding new sentence is correct when “a published day” means its issued version: its checks retain the issued settings, and its credited OIL retains the evidence block’s values until another version is published.

Two boundaries matter when checking the words:

- A pending working copy in Edit Schedule previews today’s settings under D2013. It is not the unchanged issued face. Finding 1 is an inconsistency in the neighbour implementation of this boundary.
- Insights work hours follow today’s settings under D482. validate.ts:1985–1995 explicitly rebuilds those events without the kept-rule overlay. This is intentional, not a defect to “fix” by freezing Insights hours.

The retained sentence “The schedule is checked against them now” is not universally true in isolation; the following published-day exception qualifies it. I do not count that existing, immediately qualified wording as a separate defect.

For maximum precision, the note could say:

“Unpublished days are checked against these settings now. A published version keeps the settings used for its checks and the OIL it was issued with until the day is published again. Edit Schedule previews today’s settings once a change is pending. If an OIL setting would change the credited amount or its recorded worked times, the day reads pending.”

That is a wording recommendation, not evidence that the OIL freeze is broken.

5. Production-surface inventory and explicit negatives.

The following are code-inspection negatives, not claims of browser or test passes.

Specialised readers:

- ALL AVAIL: AvailWindow combines crowdClashes with personWarnMsgs in the chip’s working or issued world. Its row reason and tapped footer share those messages. I found no second crew-rest tail here. Its separate debrief reason has finding 2.
- Neighbouring-week calculation: datedRestSeed rebuilds events through buildDay and supplies the shared crewRestDay. I found no lost missing-landing state in that reconstruction. The separate decision to attach kept rules has finding 1.
- Next-week visual preview: peek.ts deliberately draws inert programme columns without a general warning list or crew-rest puck marks. Clicking a preview day loads that week. I found no crew-rest sentence needing a rename there, and no basis in this batch to demand a new warning UI on the inert preview.
- Forward trace: dayTraceHTML prints t.msg rather than rebuilding the tail. Within-week rows carry the warning address and causing-row pan target. Cross-week rows explicitly direct the reader to load the next week and are inert. I found no wording duplication here.
- Picker and drag/drop reasons: restIfPlaced clones both event representations and calls the shared crew-rest body. slotBar’s short SC refusal says “not clear until …”, without claiming a landing. I found no separate incorrect landing description in that short reason.

Published overlays:

- CREW_REST and CREW_TIGHT both appear in LIVE_ON_FACE at validate.ts:112–113.
- faceWarn replaces those warning classes with the official pass’s current judgement under the issued day’s settings. It does not retain a second stale copy of either message. I checked this and found nothing.
- withIssuedWeek installs issued content, filing, inputs and kept settings together. Newly generated warnings therefore use the changed tail. I found no missing flag field in the snapshot path.
- A look at the current issued version uses its current face; a superseded version uses its own recorded face. I found no new-data defect from that distinction.
- Hiding and flagging again operate through warning identities and the relevant working/issued hide sets. Name rendering still goes through WCODE. I found no rename-specific defect there.

Every production WCODE-name reader found:

- validate.ts:25 defines both new names.
- logic-html.ts:92 resolves check names through WCODE; leavefly and dnif use their codes at lines 181–182. Search and check rendering use that name.
- html.ts:1201 renders ordinary and hidden warning names through WCODE.
- html.ts:1221 renders the “goes away once signed” name through WCODE.
- html.ts:2606 renders the day-detail issue name through WCODE.
- insights-html.ts:56 renders “Conflicts by type” through WCODE.
- board.ts:515 uses WCODE as its fallback. Normally the board prints the day-specific message, which D2009 leaves unchanged; it does not normally print a separate check-name heading.
- probe-bridge.ts exposes the same object for inspection; it is not another production naming table.

I found no remaining “On leave + flying” or “Downchit + flying” production literal in these readers.

Absence-warning objects:

I traced ordinary flight seats; non-flying events; timeless rows; SC MAIN and SPARE handling; AVALON/BB seats and desks; simulator seats, passengers and extras; duty desks and extras; Ground and Common Programme named participants; and ground-crew tasking.

Their LEAVE_FLY/DNIF_FLY warnings retain the same codes. Consequently their displayed check names change together while “planned to fly”, “but tasked” and standby-specific explanations remain appropriate to the row. I found no name-propagation defect. ATT B’s permitted ground-work distinction is unchanged.

Crew-rest end writers and flag lifecycle:

There are two winning-end assignment sites:

- validate.ts:528 updates prevFlyEnd, prevFlyKey, prevFlyLd, prevFlyNoLd and prevSource together for events.
- validate.ts:549 updates the same state for timed duty/commitment inputs, clearing the flight key and landing and setting prevFlyNoLd false.

I checked the following paths:

- Ordinary flight with blank landing: report is NaN, take-off is finite, and the flag is true.
- Ordinary flight with TBD landing: the crew-rest fallback uses take-off; the flag is true.
- Ordinary flight with a typed landing: the flag is false.
- Typed landing without take-off: its real end can still count, and finite-take-off gating prevents falsely calling it a borrowed take-off.
- Completely timeless flight: the non-finite-end guard prevents it winning or poisoning a later real end.
- Later typed flight replacing a blank-landing flight: all associated fields are replaced together.
- Later SC shift, duty desk, simulator, Ground or Common Programme event replacing a flight: prevFlyLd becomes null and prevFlyNoLd false.
- Later timed commitment input replacing a flight: both fields are explicitly cleared.
- Earlier non-winning events and equal ends: they do not overwrite the selected source’s associated fields.
- Standalone rows activated to fly: they remain shift-kind events for end arithmetic, so they use written shift-end wording and do not acquire a fictitious flight landing or debrief.
- Standby-only exempt seats: they do not enter this rest-bearing event stream.
- Ground crew: the crew-rest warning is excluded.
- Previous-week and published-neighbour events: the events are rebuilt from source rows; the missing-landing condition is not a separately persisted value that must survive JSON.
- The bounded prior-day scan and phantom forward scan use the same winning-end and message code.

I found no missing assignment or reset of prevFlyNoLd in these paths.

Other landing readers:

- The long-day message prints “last landing”, but workSpan excludes an unfinished ordinary flight because its report is NaN. A blank/TBD landing cannot supply that message’s winning flight end. I checked this and found nothing.
- Insights hours use the same workSpan exclusion. I found no displayed borrowed landing there.
- Logic’s crew-rest explanation explicitly says take-off plus debrief where the landing is not a time. I checked it and found nothing.
- The equal-time warning and its titles require two readable, equal entered times. A blank or TBD landing does not satisfy fltNoLen. I found no borrowed-landing defect in those titles.
- The remaining incorrect descriptions are the debrief and TURN formatters in finding 2.

OIL writers and downstream consumers:

- daySnap stores a newly built OIL evidence block.
- Earning evidence stores reportLead, debrief and oilFullMin.
- oilDayWork passes kept leads to dayOilWork.
- oilAmount reads the block’s kept full-day threshold.
- oilRuleShift compares credited amounts and stored worked spans.
- oilRuleDelta feeds publication pending state; signature binding checks the effective OIL change.
- oilmode uses the shared evidence/amount readers for displayed figures.
- Leave War’s desiredOilCells resolves the latest issued version for loaded and stashed weeks, collects work through oilEarnedWork and calculates amounts with the issued block.
- pendlist describes the OIL rule change using oilRuleShift.

I found no new OIL implementation in this patch and no breach of the three-value credit freeze in those readers.

The diffs for oil.ts, oilev.ts, faceattrs.ts and publish.ts contain comment edits only. The changed oilev.ts comment accurately describes the earning block’s three values and their consumers. The other comment qualifications are listed in finding 3.

Roles and gestures:

- Admin scheduler: can edit Logic, edit tasking and times, inspect issues, hide/restore warnings, sign and publish.
- Member/read-only reader: can inspect the published face and available-person window; no scheduling authority is assumed.
- Ground crew are a personnel category, not an alternative scheduler role.
- No finding assumes a scheduler who is not an admin.
- Warning-row clicks should focus the corresponding warning and causing puck/row; ALL AVAIL puck clicks should expose the current reason; Logic search should find the new names; the pending entry should open its explanation; republication should advance the issued values and credit.

Those routes exist in the inspected renderers and interaction handlers. Their actual hit targets, scrolling and repaint behaviour still need the host’s browser check.

6. Remaining ranked host checks.

These supplement the finding-specific tests. Use fresh fixtures, empty unrelated tasking and inputs, and Bane throughout unless stated otherwise.

A. Cross-week and published-face wording.

Put Bane on Sunday 19 July at 12:00 with blank landing, then Monday 20 July at 04:00–05:00 with blank B. With brief lead 140, debrief 120 and rest 720:

- Sunday’s forward trace must say Sunday “took off 12:00 with no landing typed”.
- Loading Monday must show the same source description and clearance at 02:00.
- Repeat with Sunday landing TBD.
- Repeat after publishing Sunday and Monday; inspect View-only and the current-version look.
- Enter Sunday landing 12:30 and republish it: the official message must say “landed 12:30” and clear at 02:30.

A “landed 12:00” message, mismatched source day, or different trace and breach description disproves correctness.

B. Amber path, not only red.

Monday 13 July: 12:00/blank. Tuesday 14 July: 04:30–05:30, no entered report, blank B.

Nominal report is 01:30; B is 02:10; rest clears at 02:00. Expect CREW_TIGHT, no CREW_REST, and the new missing-landing tail. Repeat with TBD and with typed 12:30 landing; adjust Tuesday take-off to 05:00 for the typed-landing control so it remains amber.

C. Winner replacement.

Start with Monday 12:00/blank and Tuesday 06:00–07:00. Add each later Monday commitment separately:

- Flight 14:00–15:00: expect “landed 15:00”, ending 17:00, clear 05:00.
- SC MAIN ending 18:00: expect “ended 18:00”, clear 06:00, no flight-debrief tail.
- Duty desk, simulator, named Ground row and named Common Programme row ending 18:00: same end-only wording.
- Timed Duty input ending 18:00: same, with no stale flight source key.

Reverse insertion order, then remove the later commitment. The original missing-landing wording must return. Any stale “took off”, stale landing or stale trace target disproves correct state replacement.

D. Rename every visible name surface.

Give Bane all-day LL on Tuesday and a named BRIEFING 09:00–10:00. Give a second aircrew member ATT C and a flight that day.

Check Edit Schedule’s issues, hidden rows, the day-detail panel, Logic search/checks, and Insights “Conflicts by type”. Publish, repeat in View-only/current-version look, then make and publish an amendment and inspect the earlier version.

Every displayed check name must be “On leave + planned” or “Downchit + planned”. The briefing’s own message must remain “On leave but tasked — BRIEFING”. On the board, distinguish its day-specific message from its WCODE fallback.

E. OIL amount, time-only and ineffective changes.

Publish Saturday 18 July with Bane’s flight 12:00–13:00, no entered report, using 180/120/361:

- Lower oilFullMin to 300: one OIL-setting pending item; issued credit remains half until republication.
- Restore 361: pending clears.
- Change reportLead to 170: amount remains half, but recorded start changes from 09:00 to 09:10; pending must still appear.
- Restore 180: pending clears.
- Use only an 08:00–14:00 duty desk and change flight report/debrief settings: no OIL pending item.
- Sign before changing an effective value: signatures must cease to authorise the changed candidate. Restore the value and check the existing binding behaviour.
- Republish an effective change, then change back: the newly issued values are now the baseline.
- Navigate away and back and check the same issued credit.

F. Working versus issued settings.

Publish Tuesday with Monday landing 19:00 and Tuesday B 09:40, crew rest 12 hours. Raise rest to 13 hours.

- Untouched issued Tuesday remains clear.
- Add a real pending edit: Edit Schedule must show the 13-hour breach marked as new once signed; View-only remains clear.
- Publish the amendment: View-only gains the breach.
- Lower rest back to 12: the issued breach remains until another publication.

Repeat with a pending OIL change as the trigger, including the neighbouring-week case in finding 1.

G. Live-on-face update without rule changes.

Publish Tuesday 04:00–05:00 while Monday is empty. Then add Monday’s unpublished 12:00/blank flight.

The published Tuesday must acquire its live CREW_REST warning with the truthful missing-landing tail. Change Monday’s landing to 12:30 and then remove the flight. The live message must update and then disappear. Repeat the amber fixture to cover CREW_TIGHT.

H. ALL AVAIL repaint order.

Run finding 2’s ALL AVAIL fixture. Leave its window open with Bane selected. Type a real landing, clear it again, then move OPS BRIEF outside the assumed interval.

The row reason and selected footer must update together. Repeat on the issued face after publication; unpublished edits must not leak into that face’s own crowd calculation.

The added batch test covers the two names and three ordinary red crew-rest cases. It does not establish the specialised surfaces, winner replacement, neighbouring-week setting choice, or action orders above. No execution result is claimed for either the existing tests or these proposed checks.