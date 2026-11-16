Astra — commit 7eade5b52 — C:/Users/User/wwf-read

One NEW defect found: adding an SC desk before an otherwise identical ordinary desk can hide a genuine crew-rest breach.

This was a blind, read-only review of the exported source and JOB-DIFF.patch. I opened nothing outside this folder, read neither the other independent reader’s report nor the walk’s results, and wrote no files. HANDOFF.md was absent; I did not open a substitute. No post-compaction handoff was received.

I could not run the app or tests. The screen outcomes below are predictions from the code; the host must reproduce them before accepting the finding.

1. HIGH PRIORITY — an SC desk can swallow an ordinary desk’s crew-rest end

Setup:

- Use an otherwise empty week beginning Monday 16 November 2026, with no other commitments or inputs for Bane.
- On Friday 20 November, open the Scheduler Board → Duties → + Block → SC Shift.
- Give its SXO PM row Bane, START 20:00, END blank.
- Add an Empty block after the SC block. Give its row the role SXO PM, Bane, START 20:00, END blank.
- On Saturday 21 November, give Bane a flying line with 07:00 IN TIME, take-off 09:00 and landing 10:00.

Action and predicted failure:

Open Saturday’s issues and day details. With the SC block first, the crew-rest warning is missing. Friday also loses the forward crew-rest mark, and Saturday’s crew-rest clearance map lacks the ordinary desk’s 09:00 clearance.

Repeat the fixture with the ordinary block added first. The breach returns.

Expected:

The ordinary desk still counts as ending at the assumed 21:00. Saturday’s 07:00 report therefore gives only 10 hours’ rest against the required 12. Both block orders must produce the same breach, naming the 21:00 end and 09:00 clearance.

Cause:

raptor-port/src/engine/events.ts:514 suppresses a matching event using person, start, end and role label. It does not compare the new crew-rest exemption.

The SC event is created first and receives noEnd at line 522. The matching ordinary event is then discarded. Crew rest skips the surviving event at raptor-port/src/engine/validate.ts:547.

This is NEW in this change. The patch’s minus version had the same duplicate suppression, but both desks previously supplied the ordinary assumed-hour end. Adding noEnd made the retained event’s order decisive.

This involves entirely new data. D56 does not exclude it.

Exact fix:

1. In events.ts, immediately after push obtains a usable window, compute:
   const noEnd=!!(en==null&&scDesk);
2. In the duplicate predicate at line 514, require !!x.noEnd===noEnd alongside the existing person, time and label comparisons.
3. Replace if(en==null&&scDesk)ev.noEnd=true; with if(noEnd)ev.noEnd=true;.
4. Keep the existing protection against counting one person twice when entered in both the primary seat and that same row’s extra people.
5. Add a test to the existing D2073 group in assumedlanding.test.ts. Build the Friday/Saturday fixture above in both block orders. Each must produce exactly one Saturday CREW_REST warning, with the ordinary desk ending 21:00 and clearance 09:00.
6. Assert restClear for Saturday is 09:00 and Friday has Bane’s crew-rest trace in both orders. Retain the SC-only and ordinary-only controls.
7. Add a same-row primary-plus-extra control to ensure the fix preserves that duplicate protection.

A host run showing the same correct breach, clearance and forward mark in both orders would disprove this finding.

I checked the specialised creation and restoration paths first and found no separate loss of the SC mark:

- + Block → SC Shift: board.ts:1719–1724 uses blockFromTpl; dutytpl.ts:180–185 copies the template’s wave association onto the block. The picker identifies it as an SC desk.
- Custom duty templates: Duty templates → For wave → SC qualifies the template independently of its title. Adding, deleting or reordering template rows retains that association. Changing For wave affects subsequently placed blocks.
- Day templates: the Board’s Templates button and Edit Schedule’s day Templates door share the day-template path. Capture, save and apply copy the duty blocks whole, including their association (daytpl.ts:104,138–144,251,286,314). Applying to a published day is refused.
- Week templates and clipboard copies: I found no production week-template library or day/block clipboard copy-and-paste action. The structural copying doors present are day Templates and + Alt Plan. Ordinary text pasting does not transfer an SC association.
- + Alt Plan and bringing a saved plan back: drafts.ts:301–316,367–374 copy and restore the whole day, retaining the association.
- Newly published days, their 👁 looks and Load onto working copy: publication copies the whole day (publish.ts:555). Loading removes frozen OIL evidence, then restores the day; it does not strip the SC association (drafts.ts:55,699–704).
- Undo and Redo: history.ts:64,95–104 includes and restores whole days.
- Reload and week navigation: weekrows.ts:124–127 serializes the whole day; store.ts:611 restores it whole.
- Renaming: slots.ts:334 changes the block’s label only. Renaming an SC block retains its treatment. Naming an Empty block “SC Shift” does not make it SC.
- Adding or deleting a row inside an SC block: board.ts:1155–1171 changes the rows, retaining the enclosing block’s association. Deleting every row and adding another does not remove it.
- Moving rows between blocks: this is not a production gesture. Duty-row dragging is restricted to its existing block (rowdrag.ts:165–176; reorder.ts:206–210). Moving a person’s puck between desks uses the destination block’s treatment.
- Sorting: the existing block objects retain their association.
- Board, week and next-week peek drawings: each prints the actual blank END. None inserts the assumed hour into the displayed box (board-html.ts:457–460; html.ts:2084–2103; peek.ts:185–193).

The visible sign for an unfinished SC desk is its empty END box. Typing or clearing END is the working gesture. D2073 does not require another badge or an asking-for-END warning.

I checked the end-time readers and found no second crew-rest calculation that independently restores START + one hour for a correctly retained SC event:

- Crew-rest warning: crewRestDay skips noEnd before choosing the previous end (validate.ts:547–557).
- Forward trace: it comes from that same calculation (validate.ts:759–760).
- Crew picker: the SC clearance check reads the shared rest map (avail.ts:468–470). The hypothetical placement question reuses crewRestDay (validate.ts:2254–2315).
- Week boundary: adjacent days are rebuilt through buildDay (weekctx.ts:247–262,312–315), so the SC omission reaches Sunday-to-Monday calculations.
- Next-week peek: it prints the stored hours. It deliberately supplies no ordinary crew-rest rings, warning list or editing gesture; clicking the day loads its week.
- Day details: it reads the selected face’s warning bundle rather than calculating an end itself (Modals.tsx:34–55; html.ts:2560,2606–2607). Tapping an issue closes the window and focuses the corresponding warning (interactions.ts:1979–1990).
- ALL/ALL AVAIL: personal warning reasons read the shared warning messages (html.ts:891–898). Its crowd calculation still uses the assumed hour for an unfinished row. That remains correct: D2073 changes crew rest, not the availability interval.
- Crew list: busy-hour calculations likewise retain the assumed hour (avail.ts:18,44). Armed-seat rest reasons use the shared rest calculation. These are different questions, not a disagreement.
- Insights hours and the long-day note: both use workSpan; a duty still contributes its assumed end (validate.ts:159–189,1250–1265; insights.ts:60–64). D2073 expressly leaves worked time unchanged.
- Tight turning: the cross-day crew-rest note uses the same previous-end selection and therefore skips an unfinished SC desk. Same-day flight tight-turn calculations do not turn a duty desk into a flying leg.
- OIL: the new noEnd handling does not alter the OIL calculation. An unfinished desk continues through the existing no-end treatment.
- Primary person and extra people both receive the new SC treatment (events.ts:543–544). Placeholders do not become named-person events; ground personnel retain their existing exemption from flying crew rest.

Finding 1 affects the shared warning, clearance and trace inputs. It is not three separate defects.

I checked every named seat-warning reader and found no remaining “Wrong seat” wording under raptor-port/src:

- Engine emission families: ordinary/flying seats, SC SPARE, AVALON/BB seats and both sim types all begin “Illegal seat:” (validate.ts:1160–1163,1337–1347,1495–1497,1558–1563).
- Short names: WCODE.QUAL and CHIP_LABEL.Q both say “Illegal seat” (validate.ts:28,75).
- Week issues, hidden issue rows and issued comparison rows: html.ts:1201–1202,1221 reads the shared name and warning message.
- Board issues: board.ts:515 reads the warning message.
- Puck Q chip and whole-puck titles: html.ts:538,553 reads CHIP_LABEL.
- Day details: html.ts:2606–2607 reads the shared name and message.
- Drop feedback: state/dropflag.ts:85–104 reads the warning message.
- ALL/ALL AVAIL reasons and the foot note after tapping a person: AvailWindow.tsx:168–173,190,311–320 reads current warning messages and refreshes after edits.
- Logic: logic-html.ts:89–94 reads the shared warning and chip names.
- Insights: insights-html.ts:56 reads WCODE.
- Newly created hide/unhide history: interactions.ts:1859–1861 and changelines.ts:694–697 capture the current message. I did not report old stored captions.
- Reference-side words: testing/refwin.ts:408–409 normalizes Q to “Illegal seat”.
- Parity tests: message text is removed symmetrically from the engine comparison; positive full-sentence assertions remain in warnwords.test.ts and the changed seat tests. The reference Legend normalization and the port’s separate 7 entry are accounted for.

I checked Logic’s settings, check descriptions and folded explanations and found no visible “clash” wording naming the check. The recursive test in logic.test.tsx:641–651 covers the returned settings and explanations.

Visible “clash” wording remains elsewhere:

- Leave War’s schedule-sync notices: leavewar/ui/Chrome.tsx:649,675.
- Tracker’s reserved course-name collision messages: tracker/app/core.js:1409,6908.

Those name other matters, not Logic’s scheduling check, so they are not D2077 findings. Internal names, comments and test descriptions also retain the word.

I checked both Legend homes and found one shared builder:

- View-only Sched: Shell.tsx:577–580.
- Edit Schedule: Shell.tsx:659–662.
- Both use legendHTML and the shared wrapper styles in scheduler/02-shell.css:363–381.
- html.ts:448,454–458 changes the six approved entries. Q retains “qual / illegal seat”. Glyphs, colours, order and the other entries are unchanged.
- The approved pictures match the new words.

I cannot certify the finished Legends’ height from source or approved pictures. The wording tests do not measure production layout.

The writer for these scheduling actions is an admin scheduler. Members and guests read the permitted viewing surfaces; they do not gain editing controls from this change. I did not invent or assess a scheduler who is not an admin. No changed line adds a permission rule.

The remaining host scenarios are ranked below, starting with specialised surfaces. Use clean fixtures so unrelated warnings cannot mask the result.

1. Reproduce Finding 1 first, including both block orders and the primary-plus-extra control.

2. Custom template and identity changes.
   Create “Night desk”, choose For wave → SC, remove its template rows, add an SXO PM row, then place it on Friday 20 November. Seat Bane at 20:00 with END blank; use Saturday’s 07:00 report above. Rename the placed block “Ordinary”, delete its row and add a replacement.
   Expected: no crew-rest end from that desk throughout. An Empty block merely named “SC Shift” must instead end at the assumed 21:00.
   Disproof: an assumed-end breach from the genuine SC block, or its absence from the hand-named ordinary block.

3. Day template, saved plan and reload.
   Save the SC Friday as a day template and apply it to an unpublished Friday in another clean week. Re-seat Bane where the template omits people. Reload.
   Then make alternate plan A contain the SC desk and plan B contain the ordinary desk. Switch A → B → A, look at each plan, reload, and repeat with Undo/Redo.
   Expected: A supplies no crew-rest end; B supplies 21:00. Each restored state must give its corresponding result.
   Disproof: treatment follows the previous plan or changes after reload.

4. New publication and END-entry order.
   Publish a new Friday containing the SC desk. Open its 👁 version, change the working day, then Load onto working copy.
   Type END 23:00, clear it, Undo and Redo. Separately enter END before START.
   Expected: the restored SC association survives. A usable 23:00 END produces Saturday clearance 11:00; clearing it removes that desk’s crew-rest end. No separate asking-for-END warning appears.
   Disproof: lost association, stale clearance, or treatment depending on which time was entered first.

5. Sunday into next Monday.
   Put the SC desk on Sunday 22 November, Bane at 20:00 with END blank. Put his 07:00 report on Monday 23 November.
   Inspect Sunday’s forward mark, the next-week peek, then load Monday. Repeat with END 23:00 and after publication.
   Expected: blank END contributes no crew-rest end; 23:00 produces Monday clearance 11:00 and Sunday’s forward mark. The peek retains the blank or entered END.
   Disproof: Sunday and loaded Monday disagree, or the blank desk produces an assumed 21:00 end.

6. Seat-warning families and overlays.
   On separate clean days, place Rocky, a WSO, in the front seat of: an untimed flying line; VL BFM 12:00–13:00; OFT EP-4 08:00–09:30; AMT; SC SPARE; and AVALON/BB MAIN and SPARE. Repeat an activated standby row using B/R and the individual FLIES control.
   Inspect drop feedback, week issues, Board issues, Q titles, day details, Logic and Insights. Hide/unhide a warning, inspect its new history, Undo/Redo, publish the new day and inspect View-only Sched and its version look.
   Expected: applicable lines begin “Illegal seat:”; short names say “Illegal seat”; Q remains Q.
   Disproof: any reachable old wording or a warning disappearing merely because another reader was opened.

7. Availability window refresh.
   With Rocky in VL BFM’s front seat at 12:00–13:00, put ALL on a Ground Programme row at 18:00–19:00. Open its window and tap Rocky. Leave it open while removing him from the illegal seat behind it; Undo.
   Expected: the reason and tapped foot note follow the current “Illegal seat:” warning.
   Disproof: old wording or a stale reason after the edit.

8. Logic and both Legends.
   Open Logic, expand every explanation, change the SC MAIN Warning/Advisory switches, then reset them. No visible occurrence naming the check may say clash.
   At 390×844 and 1536×864, wait for fonts, open each Legend, close and reopen it, and compare its full box height against the patch-minus build at the same size. Repeat View-only Sched as a member/guest where permitted.
   Expected: only the six approved entries change; both homes retain their previous height, with no new clipping or horizontal overflow.
   Disproof: old words in either home, changed height, overflow or changed swatches.

Tidiness: outside the rules engine, the changed lines add no new responsibility, no feature-specific branch in a shared flow, and no duplicate helper. No tidiness change proposed.

Walk: NOT DONE — this run was limited to code reading.
Tests: NOT RUN — host reproduction required.
Rulings: none this session.