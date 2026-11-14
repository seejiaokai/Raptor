# The rules check's fixes — Astra's blind code read (12 Nov 26, jobs 2 and 3)

*(Saved word for word from his final message — `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only -C <an exported copy of 52163215d>`, Codex CLI 0.160.0, 03:24 to 03:41 on 12 Nov 26, about 358,000 tokens; brief `2026-11-12-rules-check-fixes-read-brief.md` (his copy's path and proof line). Read in parallel with the walk, on an exported copy of the commit the walk's build was made from (the order's §4, the reader handed a commit and the walker on a frozen folder together). Blind to the fresh Opus reader, whose report sat in the scratch folder outside the checkout until both had reported; no walk report existed. What the host did with each finding: the evidence sheet, `docs/handpass/2026-11-12-rules-check-fixes.md`.)*

Five concrete failure paths remain. These are source-traced findings awaiting the host’s reproduction tests; I could not execute tests successfully in this sandbox.

All paths below are relative to raptor-port.

1. High — hiding one clash can also conceal a different, simultaneous clash

Case: On Tuesday, put Ranger on VL BFM, 12:00–15:00, and a BRIEFING, 12:00–12:30. Hide their clash. Add a second BRIEFING, 13:00–13:30, also with Ranger.

What happens: Both clashes produce “VL BFM & BRIEFING clash”. The validator retains only the first warning. Its hide removes the red ring and leaves no visible warning for the second pair.

Expected: The first clash stays struck through; the second shows and Ranger remains red. D2001 ties a hide to the man and two items, not their words.

Cause: src/engine/validate.ts, validateCore’s add(), still deduplicates by code, people and message. It discards the new pair identity before src/engine/warnhide.ts can distinguish the warnings. shownOf() then removes the marks because the only retained warning is hidden.

Classification: Older message-based deduplication made incorrect by this change’s new item-based hide contract.

Exact failing test to add:
File: src/engine/rulesfirst-6-hidden-warnings.test.ts.
Case: “D2001: a second simultaneous clash with identical words remains visible”.
Use the existing form, wave, ground, tap and find helpers. Give VL landing 15:00; create the first BRIEFING; ensure row IDs; validate and hide its DOUBLE_BOOK. Add the second BRIEFING; ensure row IDs and validate.
Let pairs be Tuesday’s DOUBLE_BOOK warnings naming bane. Assert:
- expect(pairs).toHaveLength(2)
- expect(pairs.filter(w => w.off)).toHaveLength(1)
- expect(new Set(pairs.map(w => view.warnMuteKey(w))).size).toBe(2)
- expect(sevOf(TUE, 'bane')).toBe('hard')

Fix:
1. Construct the complete warning before choosing its deduplication key.
2. For a warning carrying two items, deduplicate by its code, people and sorted item identities.
3. Preserve the existing message-based rule for warnings without items, including FLT_NO_LEN.
4. Confirm that repeated emission of the same pair still collapses, while different pairs survive.
5. Exercise hiding either pair, publishing, Undo, Redo and reload.

2. Medium — a typed overnight brief can lose its published crew-rest breach after a Logic change

Case: Ranger works Monday on a Ground Programme row, 09:00–12:00. Tuesday’s only flying line is 01:00–02:00, with B explicitly typed 23:00. Leave In-time and R empty. With “Brief before take-off” at 140 minutes, publish Tuesday.

The engine interprets that B as Monday 23:00. Ranger has eleven hours’ rest, so Tuesday correctly carries a red breach. Now change the lead to 30 minutes.

What happens: The published day’s live crew-rest check reinterprets B as Tuesday 23:00 and clears the red breach, without an amendment.

Expected: The published check keeps the original interpretation until publication changes it. This is the brief-lead check covered by D1991, not the wider D2005 work.

Cause:
- src/engine/reporting.ts, flightBrief(), uses the lead even for a typed B: it determines whether the clock belongs to the previous day.
- src/engine/publish.ts, faceRuleVals(), saves the lead only when some B is blank.
- The new src/engine/faceattrs.ts, ruleFor(), consequently falls back to today’s lead for this newly published, all-typed day.

Classification: An older snapshot omission exposed by the new D1991 implementation.

Exact failing test to add:
File: src/engine/rulesfirst-7-published-day.test.ts.
Case: “D1991: a typed previous-evening B keeps its day after the lead changes”.
Use the existing empty-week harness, ground row described above, and form({to:'01:00', ld:'02:00', br:'23:00'}). Publish Tuesday at lead 140, then set lead 30 and validate.
Assert:
- Before changing the lead, has(officialWarn(), TUE, 'CREW_REST', 'bane') is true.
- Afterwards, expect(has(officialWarn(), TUE, 'CREW_REST', 'bane')).toBe(true)
- The official breach message contains “23:00 (previous day)”.
- expect(has(workingWarn(), TUE, 'CREW_REST', 'bane')).toBe(false)

Fix:
1. Save briefLead for every newly published day whose ordinary flying checks can use it, including typed B.
2. Keep that value separate from the question of whether a suggested brief is visibly printed and should count as pending.
3. Use the saved value in the existing official event-building path.
4. Test the reverse change, publication of the amendment, and restoration of the earlier version.

3. Medium — Sunday’s published-view warning uses the wrong brief lead for next Monday

Case: Publish next Monday’s VL, 12:00–13:00, with B blank and lead 140: its brief is 09:40. On the preceding Sunday, give Ranger a flight ending 19:00. With the two-hour debrief and twelve-hour rest, he clears at Monday 09:00.

Change the lead to 200 and return to Sunday’s week.

What happens: View-only Sched can show Sunday’s dotted “Breaks Monday” warning, calculated against 08:40. Opening Monday’s own week checks its kept 09:40 brief and shows no breach.

Expected: Both sides of the week boundary agree. Monday remains clear until amended. Conversely, lowering the current lead must not remove Sunday’s pointer to a breach in Monday’s kept schedule. D1991 and the continuous cross-week crew-rest contract apply.

Cause:
- src/engine/weekctx.ts, issuedDayIn(), returns a fresh copy of the issued day without its rule association.
- datedRestSeed() builds that day directly.
- src/engine/validate.ts, withIssuedWeek(), associates kept rules only with loaded-week snapshots.
- weekctx.ts, windowDiverges(), does not consider differing saved rule values, so it can also incorrectly skip the official pass altogether.

Classification: Missing neighbour-week integration in this change.

Exact failing test to add:
File: src/engine/official-flags.test.ts.
Case: “D1991: next Monday’s kept brief controls Sunday’s official trace”.
Use the existing stash format to hold a newly published next Monday with identical working and issued content and rv:{briefLead:140}. Clear unrelated tasking and inputs. Put bane on loaded Sunday’s 18:00–19:00 flight. Set current lead to 200 and validate.
Assert:
- expect(windowDiverges(WK, VCONF.maxRun)).toBe(true)
- expect(workingWarn().trace?.[6]?.bane).toBeTruthy()
- expect(officialWarn().trace?.[6]?.bane).toBeUndefined()

Repeat with Sunday itself published, forcing the official pass independently. The final assertion must still pass; that repetition catches the missing rule association separately from the alias gate.

Fix:
1. Carry the neighbour snapshot’s rv alongside the resolved day.
2. Bind those rules to the actual resolved day object while building its events.
3. Include kept-rule differences in the neighbour divergence check.
4. Test both lead directions, both Sunday publication states, navigation and reload.

4. Medium — an activated AVALON or BB desk still draws as exempt

Case: Add an AVALON wave and its template desk. Put another person on the wave and type its R to activate it. Put Ranger only on the desk, 06:00–20:00.

What happens: The engine raises Ranger’s long-day note, but his desk puck remains plain on both the week and Scheduler Board. The same renderer also suppresses the ordinary days-in-a-row and dotted trace decorations.

Expected: Once the wave flies, its desk receives ordinary duty decorations. D1997 says it is fully checked; the builder explicitly includes the seat’s duty mark.

Cause: src/ui/html.ts, exemptDeskOwn(), still decides exemption solely from dw.noconf. It accepts only the old restricted warning codes and never asks saDeskFlies(). Both lSeat() and src/ui/board-html.ts’s sbSeat() use its answer instead of the ordinary marks.

Classification: An older renderer exemption made incorrect by this change.

Exact failing test to add:
File: src/ui/warnhide-readers.test.tsx.
Case: “D1997: an activated template desk draws its ordinary long-day mark”.
Use an otherwise empty Tuesday, the activated AVALON wave above, and a template desk containing Ranger’s 06:00–20:00 row. Ensure IDs and validate.
Assert:
- Ranger has LONGDAY with severity note.
- expect(exemptDeskOwn(TUE, 'd:1.0.0', 'bane')).toBeUndefined()
- Render lSeat() and sbDutyPanel(); in each, Ranger’s puck has both “warn” and “note” classes.

Fix:
1. Make exemptDeskOwn use the collector’s effective AVALON/BB exemption: the block ceases being exempt when its matching wave flies.
2. Return undefined for that activated ordinary-duty case, allowing both existing renderers to draw the normal marks.
3. Preserve the standing-by exemption.
4. Test BB too, clearing R/B, manual FLIES, cancellation, and issued-version rendering.

5. Medium — a flying standby row can still receive an amber clash

Case: On Logic, set SC MAIN clashes → “another shift” to Advisory. On the board, put Ranger on SC AM, 07:00–13:00, and manually tick that row FLIES. Put him on SC PM too, changing PM to 09:00–15:00, but leave PM standing by.

What happens: The overlap receives amber SHIFT_SOFT.

Expected: A red clash. D1996 says a standby line that flies is checked like a sortie and a clash inside it is red. The changed Logic text explicitly promises this too.

Cause: src/engine/validate.ts’s clash loop still enters the soft branch whenever either event is a non-flying shift. src/engine/events.ts, shiftEvHard(), then classifies the other event only as kind “shift”, ignoring flies:true.

Classification: Incomplete handling in the changed flying-shift branch.

Exact failing test to add:
File: src/engine/rulesfirst-2-standby.test.ts.
Case: “D1996: a flying MAIN against a standing MAIN stays red under Advisory”.
Use makeStandalone('sc'); set AM aircraft[0] to bane with fly:true; set PM to 09:00–15:00 with bane on aircraft[0], no B/R and no manual FLIES. Temporarily set SHIFT_HARD.shift=false, restoring it afterwards.
Assert:
expect(warns(TUE, 'bane', /DOUBLE_BOOK|SHIFT_SOFT/).map(w => [w.code,w.sev])).toEqual([['DOUBLE_BOOK','hard']])

Fix:
1. Make the shared shiftEvHard helper treat a flying standby event as hard before consulting the configurable standing-shift table.
2. Keep the validator and crew-list reader on that shared answer.
3. Test both event orders and confirm that two standing shifts still honour Advisory.

I checked the following and found no additional concrete failure:

- The next-week preview intentionally omits general warnings. Its same-time box already compares warning wording; the new week/board handling follows that approach.
- Unreadable landing times now contribute take-off plus debrief to crew rest without being turned into usable work hours.
- Blank timed-task rows enter the loaded and neighbouring-week run counts; exempt standby places remain excluded.
- Reporting clocks flow through the shared parser into crew rest, OIL, the week header and rally feedback. Clockless text supplies no time; R remains the rally source.
- Flying shifts receive turn checks and ordinary ground/Meeting clash treatment under the standard settings. The crew-list changes cover those cases.
- Activated-desk OIL defaults and zero-length flying-shift earnings feed the common OIL calculation used by the figures and credit path. Insights hours remain separate as requested.
- The ordinary, within-week blank-B publication case uses the kept lead. The official scope restores its bindings afterwards.
- Row IDs, hidden-warning keys and published snapshots are carried through the existing history and storage paths. The normal hide gesture still uses the scheduler command and history machinery. I found no separate serialization omission, but did not execute Undo, Redo or reload.
- The changed amber OIL sentences also reach the board’s warning list, the published face through LIVE_ON_FACE, and warning-detail readers. Their codes contribute to the shared issue counters; there is no separate Leave War copy of those sentences to update.

For the other visible doors, I traced the shared warning bundle into the crew list, ALL AVAIL, Ground/Personal Inputs/Unavailable/SANS puck copies, issue lists, ⓘ and Insights. The activated-desk renderer is the concrete exception above. Member viewing and scheduler editing remain distinct; I did not assume a scheduler without admin rights.

The parity question: stripping items is correct.

The original warning constructor emits severity, code, people, day, index and message; it does not emit items. The changed stripKeys removes that additional property, not warning-array entries. A missing or extra warning, changed message, changed severity or changed people still fails the existing comparison. Severity and chip maps are also compared separately.

This does not test whether the new identities are correct. That needs positive app-specific tests, particularly finding 1. The parity test is also bounded to its existing seed fixtures; stripping items neither expands nor reduces that fixture coverage.

Tidiness note, for filing only:
- New responsibility in an already busy file: yes. state/view.ts’s warnMuteKey now repairs row identity and can mint IDs while calculating a key. That responsibility belongs closer to the existing identity/write boundary.
- Feature-specific branch in a shared flow: yes, the clash-item fallback in warnMuteKey. It is narrowly guarded; I found no separate concrete failure from it.
- New helper duplicating an existing helper: none found in the changed non-engine lines. The same-time renderer reuses fltNoLenMsg.

Validation limitation: the existing hidden-warning test file could not start its tests because the read-only sandbox refused the runner’s temporary-directory creation. No tests passed or failed on their assertions, and no browser walk was performed.

I used only the exported copy and the explicitly requested predecessor report. I sought no peer or walk report. No files were changed, committed or pushed.

Rulings: none.