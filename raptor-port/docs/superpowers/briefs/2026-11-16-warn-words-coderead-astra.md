I found six issues. The most consequential is a missed crew-rest breach when neighbouring days use different assumed-flight lengths.

This was a static, blind review. I read only inside the supplied folder, ran neither the app nor tests, and wrote no files. Screen outcomes below are predictions from the code, with exact cases for the host to verify. HANDOFF.md was absent; I left HANDOFF-NEXT.md unopened. No pasted post-compaction handoff was read.

1. P1 — Crew rest can use the wrong day’s assumed-flight length. NEW.

Setup and action:
- Clear Ranger’s other commitments on Monday 16 and Tuesday 17 November 2026.
- Set assumed flight length to 60 minutes, debrief to 120 minutes and crew rest to 720 minutes.
- Put Ranger on Monday’s VL BFM, T/O 20:00, landing blank. Publish Monday.
- Change assumed flight length to 120 minutes.
- Leave Tuesday unpublished. Give Ranger a flight with in-time and B both 11:00, T/O 14:00 and landing 15:00.
- Open Tuesday’s checks and Ranger’s crew-rest information.

Expected: Tuesday’s check uses Tuesday’s settings. Monday’s assumed landing for that check is 22:00, its end is midnight, and clearance is Tuesday 12:00. Reporting at 11:00 breaks crew rest by one hour.

Predicted failure: the check retains Monday’s 21:00 assumed landing, clears Ranger at 11:00 and misses the breach.

Cause: raptor-port/src/engine/events.ts:342 calculates the landing while building the source day under its own settings. raptor-port/src/engine/validate.ts:552 then takes that calculated landing unchanged. Line 555 correctly recalculates other assumed ends using the day being judged, but does not do that for the new assumed flight landing. Line 564 also preserves the source day’s assumed duration in the explanation.

This contradicts the cross-day application of D2005 already implemented and described in engine/faceattrs.ts:110. The reverse arrangement can produce a false breach: a published Tuesday keeping 60 minutes, with Monday’s working copy using 120.

Exact fix:
- In crewRestDay, after the noEnd exclusion, calculate flyLd as e.to + VCONF.fltLen when the event is a flight, noLd is true and its take-off is finite. This code already runs under the judged day’s settings.
- Preserve the existing treatment of typed landings and missing take-offs.
- Use that local flyLd for the end calculation and prevFlyLd.
- Set prevFlyNoLd from flyLd − e.to, rather than e.ld − e.to.
- Do not modify the source event.
- Add both direction tests above, then repeat across Sunday/Monday using a published neighbouring week and through the placement probe.

Disproof of correctness: any of those paths reports clearance at 11:00 instead of 12:00 in the first case, or at 12:00 instead of 11:00 in the reverse case.

2. P2 — A published version’s available-crew strip changes when today’s flight length changes. NEW instance of an older missing settings wrapper.

Setup and action:
- On Monday 16 November, give Ranger a first-wave flight at 10:00 with landing blank.
- Give another pilot a second-wave flight at 14:00, with the wave’s in-time explicitly 12:00.
- Use flight length 60 minutes, step 60 and dekit 30. Publish the day.
- In View-only Schedule, expand Available crew. Ranger should be available in the second-wave band: his busy window ends at 11:30.
- Change flight length to 120 minutes and reopen that same published version.

Expected: the published version retains its 60-minute assumption and Ranger remains available in that band.

Predicted failure: Ranger disappears from the second-wave list because its freshly calculated busy window now ends at 12:30. The signed version changes without an amendment.

Cause: engine/avail.ts:35 reads VCONF.fltLen directly. availByWave at line 114 has no withShownRules wrapper. ui/html.ts:901 calls it directly. withDaySnap at html.ts:142 installs the version’s attributes and settings record, but does not itself replace VCONF.

The patch adds the live flight-length read; the missing wrapper predates it. D2005 and the published-document principle in D45 make this a current-data failure.

Exact fix:
- Import withShownRules into engine/avail.ts.
- Run the complete availByWave calculation inside withShownRules(d, ...), including waveWindows and personBusy.
- Keep personBusy usable with its caller’s current settings; do not globally force published settings into it, because live ALL AVAIL calculations also call it.
- Add a rendering test using a genuinely published snapshot and withDaySnap, then change VCONF.fltLen.
- Assert both the expanded crew list and collapsed count remain unchanged. Assert the working copy changes after it becomes an amendment, and the next published version adopts the new answer.

Disproof of correctness: Ranger or the second-wave count changes while inspecting the unchanged published version.

3. P2 — The drop message can omit the person just dropped. NEW regression.

Setup and action:
- On Tuesday 17 November, create SC AM, 07:00–13:00.
- Make Ranger and Echo not SC DAY current, while retaining their correct pilot/WSO roles.
- Put Ranger in the front seat.
- Drag Echo from the crew list into the rear seat, on either Edit Schedule or the Scheduler Board.

Expected: the resulting SC currency warning names both people, including Echo.

Predicted failure: the passing message says only “Ranger — Not SC DAY current: SC AM 07:00–13:00”. Echo, whose placement triggered it, is omitted.

Cause: engine/validate.ts:1421 now relies on a renderer’s people prefix instead of including all affected people in the sentence. state/dropflag.ts:85–89 prefixes only the first entry in who. The ordinary warning list prefixes everyone; this specialised renderer does not. The patch’s minus lines included every non-current person in the SC sentence.

The drag path is reachable: ui/drag.ts:405 writes the placement, and line 306 calls flagDrop after validation.

Exact fix:
- Change flagLine to resolve every distinct person in w.who to a callsign, preserving order and retaining an ID fallback.
- Prefix the complete list, rather than its first member. Avoid duplicating an already identical complete prefix; do not remove arbitrary names from the sentence.
- Preserve the other-day prefix and the “more” count.
- Add a unit case with who: ['bane', 'freak'] and the new SC sentence. In this checkout those IDs display as Ranger and Echo.
- Add the two-person drag case on both production editing surfaces.

Disproof of correctness: the note omits Echo or any other person covered by that warning.

4. P2 — “Goes away once signed” rows still omit the warning sentence. OLDER omission left outside this change.

Setup and action:
- On Tuesday 17 November, give Ranger VL BFM, 12:00–13:00, and MEETING, 12:30–13:30.
- Publish the day with the conflict.
- Move MEETING to 16:00–17:00 in the working copy.
- Expand Tuesday’s warning list in Edit Schedule.

Expected: the struck warning explains the original conflict, including both items and their times, followed by “goes away once signed”.

Predicted failure: the row contains only the check’s short name, Ranger and “goes away once signed”. It cannot explain itself without consulting the signed schedule.

Cause: ui/html.ts:1218–1222, goneRow, never renders w.msg. The patch updates the ordinary row at line 1202 but misses this separate builder. This renderer is unchanged from main.

Exact fix:
- Add the official warning’s complete sentence to goneRow, using escMsg.
- Keep the callsign prefix and sentence inside the struck content; keep the status outside it.
- Preserve its noninteractive behaviour. Its warning index belongs to the official list, so it must not acquire working-list hide or jump controls.
- Add a publish → resolve conflict → render test asserting both item names, both time ranges and the status.
- Include a range-wrapping and HTML-escaping assertion for this row.

Disproof of correctness: the row still lacks either item or its times, or gains a control aimed at a different working warning.

5. P2 — Two separate flights sharing a name are described as two seats on one flight. OLDER defect retained in the rewritten sentence.

Setup and action:
- On Tuesday 17 November, create two separate formations both displayed as VL BFM.
- Set their times to 12:00–13:00 and 12:30–13:30.
- Put Ranger in one front seat on each.
- Open the conflict on the week or board.

Expected: the sentence names both flights and their separate time windows.

Predicted failure: “Conflict: in two seats on VL BFM (T/O 12:00) at once”. It loses the second flight and gives the wrong explanation.

Cause: engine/validate.ts:927 treats equal nonblank labels as proof of the same line. The line-address comparison is required only for blank labels. The minus lines contain the same faulty identity test; this change rewrites its output without correcting it.

Exact fix:
- For flight/shift comparisons, permit the “two seats on” branch only when both events have the same kind and the same formation address.
- Compare the shared formation address, excluding aircraft and seat, so two seats within one actual formation retain the intended wording.
- Route separate formations through the normal two-item sentence, even when their labels match.
- Retain the separate “two items both called…” ground-row case.
- Test equal names on separate formations, blank names on separate formations, and two seats within one formation.
- Verify hiding one conflict still uses its two item identities.

Disproof of correctness: separate formations produce “two seats on”, or the sentence contains only one take-off.

6. P3 — The Logic badge legend and puck tooltips retain the replaced check names. NEW inconsistency caused by an unchanged second name table.

Setup and action:
- Open Logic and inspect the warning-chip descriptions.
- Trigger a missed flight brief and inspect that person’s chip tooltip.

Expected: the short names agree with the approved names used by the warning list and Insights.

Predicted failure: these surfaces still say “No time for the flight brief”, “Qualification — illegal seat”, “Long work day” and “No break day…”, while the other surfaces use the new names.

Cause: engine/validate.ts:74–78, CHIP_LABEL, remains unchanged while WCODE was renamed. ui/logic-html.ts:92 and ui/html.ts:538,553 read CHIP_LABEL directly.

Exact fix:
- Update NB, DB, SB and SD to “Misses flight brief”, “Misses flight debrief”, “Misses sim brief” and “Misses sim debrief”.
- Update Q to “Wrong seat”, LD to “Long day” while retaining its displayed limit, and RUN to “Days in a row”.
- Share the corresponding names with WCODE where practical, retaining genuinely combined chip descriptions.
- Test the rendered Logic legend and puck titles, not only WCODE.
- If parity needs an adjustment, limit it to these intentional displayed-name changes; leave the reference artifact unchanged.

Disproof of correctness: a production tooltip or Logic badge still uses one of those replaced names.

The coverage roll-call started with the specialised surfaces, then followed their shared producers:

- Cleared-but-unpublished warnings: Edit Schedule’s struck comparison row should contain the full signed warning and its status, without editing controls. Finding 4.
- Drag feedback: roster placement, seat swap and delayed OIL-answer completion should speak the new warning and name everyone affected. Finding 3; the callers reach the shared drop formatter.
- Published and historical available-crew panels: expanded pucks and collapsed counts should retain the shown version’s assumptions. Finding 2.
- OIL publication, pending and signing: the OIL block should keep its fourth value; pending should appear only when a person’s credited amount or worked spans would change. I checked oilRuleValsNow, oilKeptVals, oilValsSame, oilRuleShift, oilRvBoundOk and OIL_VALS and found no missing fltLen connection.
- Leave War downstream consumers: I checked the sync writer, current and stashed published-day reads, automatic FO/HO records, grid-cell derivation, day/credit details and OIL tracker. They consume the derived credit and worked spans; I found no separate raw-landing calculation bypassing the changed OIL calculation.
- Cross-day checks: the loaded week, earlier days, previous-week seeds, published neighbours, forward traces and placement probes reach the crew-rest calculation. Their settings mismatch is Finding 1.
- Ordinary flights: blank and “TBD” landings receive the assumption; typed landings remain authoritative; a missing take-off does not invent a flight. I checked the event writer and found no additional omission.
- Standby objects: SC MAIN, SC SPARE, AVALON and BB, including rows that fly and associated desks, retain their distinct rules. I found no accidental addition of ordinary-flight step/dekit padding. The relevant exemptions remain intact.
- Warning drawers: ordinary, hidden and person-focused week rows, board rows, day-information lists, cross-day traces and ALL AVAIL explanations reach the sentence formatter. I checked those and found no additional missing escMsg call. The omitted comparison sentence is Finding 4.
- Warning gestures: working-list focus/jump, hide and flag-again remain connected; published/version views omit editing controls. No additional permission regression found. I treated schedulers as admins.
- Warning identity: conflict pairs retain item-based hides; request warnings retain word-based hides. The pair also participates in warning deduplication. I found no regression from the rewritten words for newly created data.
- Check-name consumers: WCODE reaches the ordinary lists, Logic check headings and Insights. Those agree. CHIP_LABEL is the missed sibling in Finding 6.
- Typed time boxes, previews and export: displaying or exporting the authored blank landing is not itself a missed calculation. I found no reason to write the assumed landing into the user’s typed field.
- Reporting-order checks: reporting.ts:170 reads a typed landing to check authored chronology. Omitting an assumed landing from that sequence does not create a reversed-order failure: the assumed length is positive. No finding there.

I separately checked the flag lifecycle:

- noLd is derived afresh for ordinary flights with a finite take-off and no readable landing.
- noEnd is derived for standalone shift events with START and no readable END; the source-end crew-rest scan skips it before choosing the latest end.
- A flown shift receives the same exclusion, matching the builder’s stated interpretation.
- Typing an END or landing rebuilds the event without the missing-time flag.
- A later typed flight or other event replaces the previous winner and its assumed-landing marker; a winning duty/commitment input clears the flight explanation.
- SC SPARE and non-flying exempt standby paths do not accidentally acquire ordinary-flight rest tails.
- I found no additional stale-flag defect. The cross-day duration carried by prevFlyNoLd is part of Finding 1.

On the reference wording: I found no production import path to testing/refwin.ts. Its reference-side sentences are test-harness text. parity.test.ts now removes msg from both sides while retaining the compared warning structure, people, severity, day, counts, rings and chips. Therefore parity no longer proves the wording; warnwords.test.ts provides the positive wording assertions. I found no route by which that reference crew-rest tail becomes the app’s own displayed sentence.

On the published-OIL regression test: by inspection, the suite does detect dropping the kept flight length going forward.

- Removing it from the writer fails the explicit keptOn(5).fltLen === 60 assertion.
- Ignoring/removing it in the reader makes the 60→90 case lose the expected frozen half-day and/or its one pending change.
- Ignoring it in the equality comparison loses that pending change.
- The final test that deletes the field, without changing the setting or rerunning sync, does not prove freezing. It is not evidence for the important transition.
- The test signs by assigning signOf directly. It does not independently prove real signature binding against a flight-length change.

The host should perform those three deliberate-removal checks separately against src/leavewar/assumedlanding-published.test.ts. Each must fail, then pass after restoring the implementation. Add a bound-signature test: sign the Saturday 10:00/blank flight at 60 minutes through the normal signing function, change to 90, verify that the changed OIL result requires signing again, then amend and verify FO with worked spans 07:00–13:30. I have not run or observed those failures.

The remaining browser checks should use these concrete inputs:

- Friday 20 November: Ranger on VL BFM at 12:00 with blank landing, RU at 13:00–14:00, and BRIEFING 12:40–13:00. Inspect week, board, person focus and ALL AVAIL explanations at desktop and phone widths. Expect assumed landing 13:00, a zero-minute tight turn, and the RU conflict naming its step. Repeat with “TBD”.
- With step 45 and dekit 20, use a separate flight 12:00–13:00 and meetings at 11:30–11:45, 12:30–12:45 and 13:05–13:15. The three conflicts must identify step, airborne time and dekit respectively, using those settings.
- Monday SC START 20:00, END blank; Tuesday report 07:00. Repeat with B 19:00, with AVALON and with BB. The unfinished shift must not supply a false previous-day end. Type END 23:00: Tuesday must then breach rest. Undo and redo that edit.
- Hide a newly created flight/meeting conflict, move its times while preserving the same two items, then replace the meeting with a different row. The first remains hidden; the replacement is a distinct warning. For a request warning, change its relevant words/times and verify its word-based identity.
- Repeat the warning reads with long callsigns, a selected puck, a warning chip, an OIL mark and the board open. Time ranges should stay together; warning text and hide controls must remain readable and tappable. These geometry and layering claims require a real browser.

No finding above depends solely on pre-existing stored data. Each can occur with objects created and published by this build.

Rulings: none recorded; read-only review.
Walk: not run. No files changed, committed or pushed.