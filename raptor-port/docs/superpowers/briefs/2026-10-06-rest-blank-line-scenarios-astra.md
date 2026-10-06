## 1. Roll-call

**The proposed “skip every line without a take-off” fix is too broad.** It would lose valid reporting commitments. Filter unusable **times**, while retaining the person’s assignment and any usable Brief, In-time / Rally, landing or earlier commitment.

This is a read-only scenario-design report. **No files changed, tests run, build started or server started.** The working copy began changing during the read; the findings below refer to the **unfixed committed version named by the brief**, not those developing changes. Source line numbers refer to that version.

Source shorthand: **V** = [validate.ts](/C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts), **E** = [events.ts](/C:/Users/User/projects/Raptor/raptor-port/src/engine/events.ts), **A** = [avail.ts](/C:/Users/User/projects/Raptor/raptor-port/src/engine/avail.ts), **H** = [html.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts).

| Place, starting with specialised surfaces | Does the fault reach it? | What the walker should see once fixed |
|---|---|---|
| SANS cards, week and Board | **Yes. Additional missing drawing arguments:** H:920 passes severity/chip, but no dash/trace. Board uses that same card builder. | Known breach remains. Compare its puck with the cockpit copy: a sanctioned breach must not become solid here, and yesterday’s dotted cause must not disappear. Record these existing drawing omissions separately from the arithmetic fix. |
| Personal Inputs and Unavailable pucks, week and Board | **Yes. Additional omissions:** H:2015 explicitly passes `false,null`; `board-html.ts:138,661` also omit dash/trace. | Same person’s warning agrees across copies. Open/edit the input through its normal control; verify that the warning updates elsewhere too. The missing dashed/dotted marks need a disposition. |
| Armed crew list, week palette and Board crew drawer | **Yes**, through the shared pre-drop question. Its puck builder also omits dash/trace: `palette-html.ts:58`. | Strike and printed reason survive an unrelated blank line. Test tap-to-place and drag separately. No false “clear” answer after yesterday’s end is poisoned. |
| SC MAIN seat’s “not clear until” reason | **Yes for yesterday’s poisoning.** It reads `REST`, V:488–496 → A:419–421. Today’s blank line can erase the warning while this map remains correct. | Earliest legal time agrees with the warning. Test a typed B with no shift start separately: the present picker’s start gate cannot answer it. |
| ALL AVAIL window, its pucks, reasons and flagged-person count | **Yes for the person’s day-wide warning.** `AvailWindow.tsx:175–191` combines that warning with separate brief/debrief checks. | Open the crowd from a timed programme/duty/ground/sim row; the member’s rest reason survives. Tap the person and check the reason and highlighting. Do not change crowd membership merely because a crew-rest warning exists. |
| Current published version’s 👁 look, week and Board | **Yes.** V:1606–1608 uses the current published face. | Warning, ring and trace agree with View-only Sched; no editing gesture becomes available. Open its day-details panel as well. |
| Older published version’s 👁 look | **Only its recorded result**, not today’s recalculation: V:1598–1625. | A version created during the walk keeps the warnings it went out with. No current next-day trace is added to it. Loading it onto the working copy must recalculate. |
| Saved-plan preview | **No live warning display by design.** V:1603–1607. | Looking changes nothing. Bringing the plan out recalculates warnings and restores the correct result. |
| Sunday’s forward “Breaks Monday” trace | **Yes**, through the same crew-rest body. | Dotted puck and on-demand trace remain despite a blank line on Sunday or Monday. It is informational while Monday is outside the loaded week; opening next week exposes the actual Monday warning. |
| Next-week peek | **No crew-rest renderer by design.** `peek.ts:8–17,50–64` deliberately avoids the loaded week’s warning state. | No copied warning from this week. Click the preview day to load its week, then verify the real warning. Absence of a ring in the peek alone is not a defect. |
| Edit Schedule day warning list | **Yes**, H:1069 onward. | Red breach line remains; clicking it highlights the right person and binding row. Adding a blank line may add a double-turn issue, so compare the specific warning rather than demanding an unchanged total. |
| Board issue list | **Yes**, `board.ts:439–496`. | Same warning and counts as the working week, including the phone’s collapsed list. Hide/unhide works through its own control. |
| View-only Sched, current published face | **Yes**, through the official validation and live-warning overlay, V:1554–1595. | Crew rest stays live under D183–D185/D188. Pending working changes do not leak into the issued timetable. The rest warning alone does not create pending changes or invalidate signatures. |
| Day-details popup | **Yes**, `Modals.tsx:24–47`, H:2240–2284. | Its count, warning wording and warning click agree with the document underneath it, including a current or older version look. |
| Ordinary pucks: cockpit, SC MAIN, duty desks/extras, sim seats/passengers, ground and Common Programme | **Yes**, through shared person marks and Board `puckMarks`. | Solid/dashed breach ring today; dotted cause yesterday; warning chip subject to normal priority. The internal `CR` chip visibly prints **R**. |
| SC SPARE, AVALON/BB cockpit and exempt desks | **No ordinary crew-rest event**, deliberately. Their own warnings remain separate. | No unrelated rest ring borrowed from another assignment. Their own seat/medical/overseas rules retain their existing behaviour. |
| Within-week dotted trace and its click | **Yes**, H:982–1045. | Open yesterday’s issues or tap the puck. “Breaks Tuesday” names the correct end and leave-by time. Its click focuses the breach while keeping the view at the causing row. No extra issue counted yesterday. |
| Drop toast and pulsing pucks | **Yes**, `dropflag.ts:55–61,93–97`. | A newly created breach is announced after a placement, including one on another day. An unchanged existing breach is not falsely announced as new. |
| Hidden warning and all counts | **Yes.** Hiding must not be confused with losing the rule. | Exact warning stays struck through, uncounted and unflagged across reload/sign-in; unhide restores it. A changed warning can reappear. On a published day, hide/unhide waits for its amendment under D471. |
| Insights, opened from week, View-only or Board | **Yes**, `insights.ts:19–20,56–64`. | Issue totals count the correct warning once, excluding hidden warnings, using each day’s latest published copy or its unpublished working copy. Hours remain finite. |
| Logic page | **No numerical result reader; it states the promise.** `logic-html.ts:109–119`. | Search Crew rest; displayed threshold, first-commitment explanation and cross-week explanation agree with the app after changing the setting. |
| Schedule PDF and CSV exports | **No crew-rest flags/list in these dedicated exports.** `printpdf.ts:1–19,40–66`; `export.ts:55–75`. | Exported published names/times remain correct. Do not require screen pucks or warning rings in an export that deliberately has none. |
| Roles and overlays | Same result, subject to existing access. | Admin edits; member reads and can change permitted own inputs; guest cannot gain editing/hide controls. Current `dayHTML` suppresses the inline warning list for guests at H:1662—do not claim that door was exercised as a member’s equivalent. Walk warning focus, selection, own-person purple fill, CAT/SANS markers, amendment tags, cancellation badges and OIL mode without one hiding another. |

**Placement warning versus refusal:** the brief’s “SC seat stays closed” needs careful interpretation. The current placement policy allows a struck name to be placed with a warning; `view.ts:1151–1175` expressly preserves that behaviour. Check the strike, reason, toast and resulting warning. Do not introduce a new hard refusal through this repair.

## 2. Scenarios, ranked

Use admin sign-in **ad**, the week **Mon 13–Sun 19 Jul 26**, and the app’s controls throughout. Choose a qualified aircrew member **X**, with no unrelated commitments in the fixture; remove conflicting fixture assignments through the UI.

**Baseline B:** Monday, ordinary flight 20:00–22:30; Tuesday, ordinary flight 07:00–08:00, typed Brief 05:00, no In-time / Rally instruction. Put X on both. With default two-hour debrief and twelve-hour rest, Monday ends at Tuesday 00:30, clearance is **12:30**, and Tuesday’s instructed report gives **4h30 rest**. Establish the warning and trace before adding the extra line.

Family labels: **Format**, **Missing input**, **User error**, **Other-page/edit/delete**, **Copies**. “Copies” includes the separate working, issued, version, adjacent-week and consumer readings; it does not assume a shared database.

| ID / priority | Setup through controls → action | Expected result | Observation disproving correctness | Family |
|---|---|---|---|---|
| **S01 / P1 — specialised puck copies** | B with a SANS aircrew member; file availability and an ordinary personal input. Add a blank Tuesday line and seat X. Inspect cockpit, SANS card, input row and crew drawer. | Breach survives everywhere; dashed/dotted forms agree where those marks belong. | Cockpit is correct but another copy loses its cause mark, or shows a solid ring for the sanctioned case. | Missing input; Copies |
| **S02 / P1 — Sunday forward trace** | Build B across Sun 19/Mon 20 using week navigation. Add blank crewed lines on each side, before and after the timed wave. | Sunday retains “Breaks Monday”; Monday has the breach when loaded. | Trace disappears, points into the wrong loaded day, duplicates the issue, or Monday reads clear. | Missing input; Copies |
| **S03 / P1 — current published look** | Publish B through the four sign-offs and Publish. Open current 👁 look on week and Board, View-only, day details and Insights. Repeat with the blank line included before publication. | All current published readers show the correct breach. | Only the working copy is fixed; the issued face or details says clear. | Copies |
| **S04 / P1 — yesterday’s first event** | B. Add a blank Monday wave, seat X, drag it before the late flight; then after it. | Same clearance, warning and source row in both orders. | Warning depends on wave order, or the picker loses 12:30 clearance. | Missing input; User error |
| **S05 / P1 — today’s extra blank line** | B. “+ Line” on Tuesday; seat X, remove X, reseat X. Repeat using “+ Wave”. | Breach remains throughout. Double-turn count may change when X is assigned. | Breach/ring/trace disappears on seating and returns on removal. | Missing input |
| **S06 / P1 — typed Brief only** | Monday as B. Tuesday’s **only** flight has Brief 05:00, no take-off or landing; seat X. Add/remove another fully blank line. | A known 05:00 reporting commitment still breaches. No invented nominal take-off. | A finite-take-off filter removes the warning, or the message contains an invalid clock. | Missing input |
| **S07 / P1 — reporting instruction only** | Monday as B. Tuesday’s only flight has no times. Add `05:00 IN TIME`; repeat with `05:00 RALLY`, then with Brief 06:00. | Earliest applicable known report is 05:00; unrelated blank legs cannot mask it. | Reporting clock appears in the wave header but produces no rest warning, or later Brief wins. | Missing input; Copies |
| **S08 / P1 — SC B without shift start** | Monday as B. Add Tuesday SC MAIN; clear shift times, type B 05:00, seat qualified X. | Known SC report remains usable. No sortie debrief tail or invented shift start. | Warning is lost; picker and placed result contradict each other without explaining the unknown start. | Missing input; Copies |
| **S09 / P1 — landing only yesterday** | Monday’s only ordinary flight has landing 22:30, no take-off; X aboard. Tuesday as B. Add a wholly blank Monday line before it. | Known landing plus debrief remains the rest end; added blank line has no effect. | Repair discards the landing because take-off is absent. | Missing input |
| **S10 / P1 — blank flight plus earlier meeting** | Monday as B. Tuesday: only a blank flight for X, plus a Ground Programme meeting 05:00–06:00. Repeat with a typed Meeting input instead. | Meeting supplies a known first commitment on a flying day. Warning names it; no fictitious flight report is printed. Removing the flight makes it a meeting-only day, with no flying-rest warning. | Blank assignment suppresses the known meeting, or removing all flying leaves a crew-rest warning. | Missing input; Other-page/edit/delete |
| **S11 / P1 — pre-drop question and toast** | Late Monday as B. Tuesday timed formation has another crew member but not X. Add X to a blank line first. Arm the timed seat, then place X by tap; repeat by drag. | Before placement: new-breach reason. After: warning and toast. Repeat with an initially empty formation: its documented lack of a sibling prediction must still be caught after placement. | Blank leg silences prediction/toast; empty-formation limitation is mistaken for successful pre-drop coverage. | Copies |
| **S12 / P1 — hidden breach** | B. Hide Tuesday’s breach, then add/remove/reorder blank crewed lines. Reload; sign out/in; unhide. | Same warning stays struck out and uncounted, with no rest marks; unhide restores it. A real report-time change creates the newly worded warning. | Blank line removes the struck row entirely, unexpectedly unhides it, or leaves stale dotted marks. | Copies; User error |
| **S13 / P1 — same-day tight turn** | Wednesday: X on 09:00–10:00 and 10:30–11:30 flights. Insert a blank crewed formation between them in displayed order. Move it before/after both. | The 30-minute turn warning remains. Double-turn summary remains consistent. | Blank sort entry breaks adjacency and hides the timed pair. | Missing input; User error |
| **S14 / P1 — clear and restore take-off** | B plus a second Tuesday line, initially timed late enough not to bind. Clear its take-off with landing retained; clear landing; restore take-off only; restore landing. Do on week and Board. | B’s breach persists at every step. Take-off-only retains existing landing fallback. | Landing-only or blank state removes another line’s warning; restoring one field produces stale results. | Other-page/edit/delete |
| **S15 / P1 — leave/downchit sibling** | File all-day leave for X on Tuesday; seat X on a fresh blank ordinary flight. Repeat separately with a downchit. Also start timed, then clear take-off. | Date-wide unavailability remains intelligible and warned; a known all-day prohibition should not require a flight clock. | Picker warns about the absence but the placed warning list loses it solely because take-off is blank. | Missing input; Copies |
| **S16 / P2 — accepted clock spellings** | On week and Board, change the same take-off using `700`, `0700`, `7:00`, `07:00`, `0700H`. Separately use `0500H` and `0500L` in In-time / Rally text. | Accepted equivalents save as the same clock and produce identical rest results. Reporting-text suffix tolerance is not assumed for every time box. | Equal accepted values change the warning or store an unreadable time. | Format |
| **S17 / P2 — reporting-text variations** | With a blank and a timed formation, enter equivalent `IN TIME`, `IN-TIME`, `INTIME`, and named-formation Rally instructions. Reverse reporting-line order. | Same recognised meaning and earliest applicable stage; scoped lines do not affect unrelated formations. | Reordering changes the report, or malformed text silently masquerades as a valid clock. | Format |
| **S18 / P2 — invalid time attempts** | B. Type `morning`, `25:90`, `1260` into take-off, landing and Brief; commit by Tab and click-away on each editor. | Refusal restores the prior displayed value; B’s warning survives; no saved edit for a rejected value. | Invalid text clears a valid time, looks saved, or changes warning state. | User error |
| **S19 / P2 — malformed reporting text** | Blank formation with `8h00 IN TIME` or `25:90 RALLY`; also keep B’s timed breach. | Reporting instruction gets its unresolved explanation; B remains. Publishing is not hard-blocked by timing-order warnings, D509. | Bad text poisons a separate warning, is silently accepted, or blocks Publish. | Format; User error |
| **S20 / P2 — edit/delete on another page** | B. From Inputs, add an earlier typed Meeting; change its time, move its date, delete it. Repeat with an accepted request’s Ground Programme row and its own removal door. | The binding first commitment, wording and jump target update after every action. | Schedule retains deleted meeting text, loses the valid flight breach, or only fixes itself after reopening. | Other-page/edit/delete |
| **S21 / P2 — change the cause elsewhere** | Replace Monday’s late flight with a timed duty, sim, ground event, Common Programme item, then a qualifying typed input, one case at a time. Keep a blank crewed flight earlier in Monday’s order. Edit/delete the actual late end. | Every known last end counts; non-flight ends have no flight debrief tail. Deleting it exposes the next valid end. | Blank flight wins the end calculation; removed source still owns the trace; sim receives a flight tail. | Other-page/edit/delete |
| **S22 / P2 — templates** | Create a wave template with blank times; place it and seat X beside B. Save a day containing blank/timed lines as a day template, apply to an unpublished target day, then reassign X. | Same results as ordinary creation. Template creation’s removal of people is respected. | Template-created blank line behaves differently, or the test assumes copied crew that the template deliberately removed. | Copies; Missing input |
| **S23 / P2 — saved plans and versions** | Save a plan containing B plus a blank line; switch to a clean plan and bring it back. Publish a version with the blank line, make a second version, then load the first onto the working copy. | Each activated working copy recalculates. Preview alone changes nothing. | Loading restores a stale warning result rather than judging the loaded assignments. | Copies |
| **S24 / P2 — cancel, remove and restore** | B plus blank line. Cancel blank formation, then one aircraft only; restore. Repeat cancelling the real late source and the real early target. Delete/re-add each. | Blank cancellation is harmless to B. Cancelling a genuine source/target changes rest exactly as its removal would. Other aircraft continue to count. | Cancelled blank line still poisons, cancelled real line still counts, or one aircraft’s cancellation removes another’s warning. | Other-page/edit/delete |
| **S25 / P2 — overnight and reporting precedence** | Monday late duty ending 22:00. Tuesday flight 01:00–02:00, report `23:00 IN TIME`, Brief 00:30. Add blank lines. Separately test general In-time plus formation Rally and duplicate scoped instructions in both orders. | Report is Monday 23:00; known one-hour rest is flagged. D505 scope is resolved separately per activity; D506 uses earliest resolved time. | Blank line erases the warning, 23:00 is treated as Tuesday, or another formation’s instruction wins. | Copies; Format |
| **S26 / P2 — boundary and ring style** | Previous-day duty ends 17:00; today’s flight 07:00, Brief 05:00. Test Brief 04:59/05:00/05:01. Then use a fixture where rest clears between report and step; add `late show`. Finally add an earlier meeting. | Exactly twelve hours is legal. Nominal-only shortfall gives TT without a ring/trace. Late-show breach stays red but dashed only if step is achievable; meeting-bound breach stays solid. | Off-by-one breach; TT draws a cause trace; late-show remark removes the warning or excuses the meeting. | User error; Copies |
| **S27 / P2 — shared settings and counts** | Keep B plus blank line. Change Crew rest, Brief lead, Step and Debrief separately on Logic, then restore each. Open picker, current published face and Insights. | All relevant readers use the changed setting and return to baseline on restoration. Known unrelated work hours remain finite. | A reader retains the old threshold, blank line becomes midnight, or Insights shows invalid minutes. | Copies |
| **S28 / P2 — specialised exclusions and non-time rules** | Blank SC MAIN/SPARE, AVALON and BB; ordinary flight with wrong seat, AAR requirement or OCU pairing; SANS Fly unticked versus a timed Fly offer. | No newly invented rest rule for exempt assignments. Ordinary seat/AAR/pairing checks survive absent times. Distinguish known “not offering Fly” from an unknown time-window comparison. | Broad event filtering removes qualification checks, changes exemptions, or reports a measured SANS overlap with no measurable window. | Missing input; Copies |
| **S29 / P2 — overlays and smaller screens** | B with an advisory yesterday, a higher-priority qualification warning today, a pending amendment tag and X as signed-in person. Open ALL AVAIL/changes windows; repeat phone, short landscape and desktop at Windows 125%. | Dotted red cause remains distinguishable from amber; higher-priority chip does not remove the rest line; controls remain reachable. | Mark exists only in data, is painted over, or warning click reaches an obscured/wrong row. | Copies |

**Orders and persistence apply to the scenarios above, not just to the baseline.**

| Action pair—run both orders | Required observation |
|---|---|
| Create blank line ↔ assign person | Uncrewed blank has no effect; assigned blank cannot suppress known commitments. |
| Assign person ↔ type/clear Brief, take-off, landing or reporting instruction | Same final schedule produces the same warning, irrespective of entry order. |
| Create the late source ↔ create the early target | Same breach and trace in either order. |
| Add blank assignment ↔ edit/delete/reassign the actual source or target | No stale minimum, end, warning text or trace address. |
| Add blank assignment ↔ reorder wave/line/Auto sort | Timed results remain independent of presentation order. |
| Add blank assignment ↔ hide/unhide | Warning identity and hide rules remain correct. |
| Add blank assignment ↔ cancel/restore | Only active qualifying assignments participate. |
| Add blank assignment ↔ change Logic setting | Consumers agree; restoring the setting restores the baseline. |
| Add blank assignment ↔ Publish/amend | Working and issued copies follow their own contents. A real schedule edit can be pending; recalculating a live rest warning alone cannot be. |
| Add blank assignment ↔ save/switch plan/load version | Activated copy is judged afresh. |

Run each applicable order on unpublished and published days. After each mutation, record the warning **before → after → Undo → Redo**, then reload at the relevant state. Reload clears the session’s undo history; therefore replay the fixture for the other reload checkpoints rather than expecting Undo to survive reload.

For published-day independence, also **publish Tuesday while leaving Monday unpublished**, then change Monday’s late end. Tuesday’s live breach must update without making Tuesday pending or dropping its signatures. Conversely, changing a **published Monday’s working copy** does not silently replace Monday’s issued end before its amendment.

## 3. What a naive fix gets wrong

The three faulty calculation sites are:

- **Previous ends:** V:457–461 admits a non-number end; the first such end can prevent later real ends from winning.
- **Today’s reports:** V:498–535 includes every leg in minima; one non-number can erase all valid reports. V:559 then loses an earlier meeting too.
- **Same-day pairs:** V:685–696 sorts and pairs unknown take-offs among real flights, allowing a blank entry to separate a real tight pair.

But a take-off guard over the whole leg is wrong:

| Partial line | What remains usable | Why a blanket skip is wrong |
|---|---|---|
| Brief only | Typed Brief | `reporting.ts:85–87` preserves it; V:517 can already use it when it is the only line. |
| In-time / Rally only | Applicable entered reporting clock | `reporting.ts:63–83` resolves it; current `Math.min(clock, NaN)` loses it. |
| SC B only | Typed SC in-time | E:205–208 preserves it; V:517 mixes it with the missing shift start. |
| Landing only yesterday | Landing plus flight debrief | E:269–270 retains a typed landing independently; V:457 needs the end, not take-off. |
| Blank flying assignment plus earlier meeting | Known meeting start and the fact that X is assigned to fly | Removing the assignment from `byR` prevents the first-commitment rule from running. |
| Take-off only | Existing take-off/landing fallback | E:270 uses take-off when landing is empty. Requiring a typed landing would alter existing behaviour. |
| Completely blank line | Assignment/count information only | Double-turn and run/qualification readers must not lose their object merely because a timing reader cannot measure it. |

**Specify the repair in this order:**

1. **Retain event construction and qualification/count inputs.** Do not put an early return in `buildDay` that deletes all consequences of an unfinished assignment.

2. **Reject unusable previous ends before either maximum is updated**, V:457–461. Test the computed end itself for finiteness. Preserve a real landing-only end and its source key/landing explanation.

3. **Keep today’s qualifying assignments grouped by person**, V:498. Compute nominal and instructed candidates separately:
   - Nominal flight report needs a finite take-off; nominal SC start needs a finite shift start.
   - Flight instructed report takes the earliest finite applicable In-time / Rally or Brief.
   - SC instructed report takes the earliest finite typed in-time or shift start.
   - Missing candidates stay unknown; they never become zero.

4. **Combine finite instructed candidates with the existing eligible earlier-event/input candidates**, V:556–559. If no usable first commitment exists, raise no measurable breach. A real meeting must still be usable when the assigned flight is otherwise blank.

5. **Select the binding leg from the same finite candidates**, fixing V:573 as well as the minima. Filtering the minimum but leaving the reduction unchanged can attach the warning and late-show decision to the wrong blank leg.

6. **Make wording safe for partial information**, V:608–613,638–640. A meeting-only known start must not say “before the [unknown] report”; Brief-only/SC-B-only cases must not print an invented take-off or step. Dash only when a finite take-off proves that step is achievable.

7. **Use a separate measurable list for tight-turn pairing**, V:685–696. Require usable take-off/end values for those comparisons. Keep the unfiltered assignment list for `dturns` and the summary, V:677,1001–1002.

8. **Keep one crew-rest calculation for actual days, forward traces and pre-drop probes.** The shared callers are V:1059,1453 and 1955–1961. Do not repair only the visible-day call.

9. **Pin the partial-information cases before the change**, then walk the readers and orders above. Existing work-hours tests do not prove this repair.

The entry routes to those three sites are:

| Route | Previous-end calculation | Today’s report calculation | Same-day tight-turn pairs |
|---|---|---|---|
| “+ Line”, plain “+ Wave”, then seat X | Yes when on a source day | Yes | Yes |
| Wave/day template with blank times, then seat X | Yes | Yes | Yes |
| Clear a previously valid take-off | Yes if landing also becomes unknown; a retained landing stays usable | Yes | Yes |
| Landing without take-off | Real end can count | Report may remain unknown or come from Brief/reporting text | No known airborne start |
| Take-off without landing | Existing fallback produces an end | Usable | Existing fallback remains |
| Ordinary invalid time typing | **Should not enter any site:** shared setter refuses and restores it, `slots.ts:316–335` | Same | Same |
| Invalid template time | Can become blank through `waveTime`; crew assignment then reaches the sites | Yes | Yes |
| SC MAIN with blank times | Yes | Yes, including B-only case | Excluded: shift, not sortie |
| SC SPARE / AVALON / BB | Excluded from ordinary rest stream | Excluded | Excluded |
| Cancelled formation/aircraft | Excluded by E:242,306 | Excluded | Excluded |
| Previous Sunday / next Monday | Same body through dated week reads | Same body | Pairing belongs to the loaded day |
| Saved plan activated, older version loaded, Undo/Redo | Re-enters according to restored assignments | Same | Same |

## 4. Siblings

These are source findings and walk targets, **not claims that I ran the app**.

| Rule or reader | Classification and exact cause |
|---|---|
| **Leave/downchit against ordinary flight** | **Lost warning for a date-wide prohibition.** V:793–808 requires overlap with `step/dekit`; missing take-off makes the comparison false. A fully blank flight can therefore lose an all-day leave/downchit warning even though the assignment and prohibition are known. Fix separately by distinguishing date-wide prohibitions from timed overlaps; do not invent a midnight flight window. S15. |
| **Timed personal-input clash** | **Silent on purpose where no overlap can be measured.** Same V:795. A blank extra leg does not suppress another timed leg’s independently checked clash. |
| **General two-event clashes and their sort** | **No equivalent poisoning of other valid pairs found.** V:714–754 compares every pair, not adjacent entries only. Unknown-time pair is unmeasurable, but cannot separate two valid events out of the nested loop. |
| **Long work day** | **Protected against the reported non-number poisoning.** V:167–175 rejects the incomplete span; V:1008–1021 and Insights share `workSpan`. A blank leg must neither erase a valid long day nor donate one end to another event. |
| **Seven-day run** | **Timing-independent by design.** V:344–366 counts the person’s presence in events. A blank assigned ordinary flight still counts as tasking. Filtering it out globally would introduce a regression. |
| **Double turn** | **Timing-independent fallback is explicit**, V:674–677,1001–1002. Preserve its intentional timeless-leg count. |
| **SANS availability** | **Known offer facts survive; unknown window can be misdescribed.** V:1292–1302 sends non-number endpoints to A:294–308. “Not offering Fly” is knowable; an all-day offer returns okay; a custom offer with unknown flight times falls through to “available … only,” without a measured violation. The picker skips its SANS window gate when times are null, A:549–556. Walk that disagreement; do not turn “unknown” into “free.” |
| **Flight Brief window** | **Silent on purpose if the window’s end is unknown**, V:964–971. A typed Brief can establish a rest report while still being insufficient to measure the whole Brief-to-take-off window. |
| **Flight debrief window** | **Landing-only remains measurable**, V:193–198,972–974. A global no-take-off skip would wrongly remove this advisory. |
| **Sim brief/debrief** | **No aggregate poisoning found**, V:981–992. Each event overlap is checked separately. Unknown flight occupancy cannot erase another valid meeting’s overlap. |
| **SC in-time window** | **Needs both B and shift start to measure the window**, V:769–784. Silence here with no start does not justify suppressing the known B as a crew-rest report. |
| **AAR qualification/instructor clearance** | **No time dependency**, E:325–333 and V:1118–1136. AAR/NAAR comes from remarks/wave night status. Preserve these checks on unfinished ordinary flights. |
| **Ordinary seat qualification, pairing, OCU/IP and IR examiner** | **No time dependency**, V:1064–1103,1137–1194. These must survive any timing-only filter. |
| **SC currency** | **Shift classification needs usable hours**, V:1198–1207. No new day/night classification should be guessed from blanks. |
| **SC SPARE medical/overseas check** | **Same date-wide-warning gap to probe**, V:1221–1233: all checks are gated by overlap with the shift’s times. Local commitments remain exempt; all-day medical/overseas facts are different from an unknowable timed clash. |
| **AVALON/BB with blank times** | **Broad silence is explicitly existing behaviour**, E:251–267; `avalon-rules.test.ts:460` pins “blank times checks nothing.” It also gates their own seat checks by whether a window was collected. Record that boundary; do not silently widen this crew-rest repair into a new standby policy. |
| **ALL AVAIL crowd** | **No shared minimum to poison.** Busy intervals are collected independently in A:13–46; rest flags/reasons in its window inherit the main defect. Its brief/debrief reason path remains independently measurable. An unknown flight window is not evidence of a particular overlap; retain the existing availability policy. |
| **Insights issue totals** | **Directly undercount the lost warning**, `insights.ts:56–64`. |
| **Insights work hours and sortie totals** | **Hours already guarded; sortie counts deliberately do not require times**, `insights.ts:40–54`. The separate empty-line count question is already filed as `[INSIGHTS-EMPTY-LINE-COUNT]`; do not reclassify it as this repair. |

The specialised puck omissions in section 1 are another sibling: **correct warning data is insufficient if a drawer never receives the dash/trace arguments.**

## 5. The two owed reads

**(a) D597 — reacquiring the replaced day: sound for the reported redraw; coverage remains limited.**

At [schedule-tab.ts:130](/C:/Users/User/projects/Raptor/raptor-port/src/ui/schedule-tab.ts:130), the forced redraw finishes before focus is restored. Lines 136–143 reacquire the same numbered day only if the old week-day element was detached, then recheck navigation, editing permission, preview/OIL mode and competing window/focus. Lines 144–147 restore the surviving box or its replacement. It does not intentionally move to another day or write another schedule change.

The test at [schedule-tab.test.tsx:261](/C:/Users/User/projects/Raptor/raptor-port/src/ui/schedule-tab.test.tsx:261) meaningfully asserts that the original day was detached and focus returns to the matching box on day 4.

It does **not** establish:

- The reverse transition—last warning disappears—as well as first warning appears.
- Real-browser caret visibility after that replacement, including the short phone Board and overlays.
- Fallback when the exact box no longer exists or its identifying attributes changed.
- A day replaced synchronously during `source.blur()`: the earlier `sameScope` check at line 112 exits before the later reacquisition block. This is a coverage boundary, not a demonstrated production failure.
- The normal-successor path if a redraw detaches its destination: line 150 deliberately exits.

**Read verdict:** no defect found in the specific reacquisition repair. Run its real-control scenario and reverse transition; do not describe the synthetic blur test as a completed browser walk.

**(b) D602 / D603 / D604 short lines against full rows**

| Ruling | Meaning read |
|---|---|
| **D602 — clarification required** | The short line says startup context is “measured, then cut.” The full row explicitly requires **measurement → options with savings/risks → his ruling; nothing trimmed before he rules**, plus independent reads of guide changes. Those conditions affect future authority and should not be lost under D138. Suggested short wording: “After the stack, fix crew rest first in a new chat; then measure startup context and present options and risks. Trim only after his ruling, without reducing quality; guide changes retain D70’s independent reads.” |
| **D603 — PASS** | Preserves “leave as built,” ability to change colour, no new “not chosen” control after sign-in ends, and Undo during the same sign-in. It does not imply permission to build the absent control. |
| **D604 — PASS** | Correctly incorporates the full row’s explicit same-day supersession: initial preview/wording approval was followed by the separate “merge live,” and the stack merged as one. It does not equate “all looks good” with merge permission. |

No ruling files were edited.

## 6. Explicit negatives

- No test, build, server, browser walk, publishing action, data mutation or repository write was performed.
- No approval of the developing fix is given; this report defines what that fix must survive.
- No migration or old-record-only finding is included. Plan/version scenarios create their records during the new walk.
- No evidence found that a blank extra leg suppresses **other valid pairs** in the all-pairs clash loop.
- No equivalent aggregate poisoning found in ordinary qualification/AAR/pairing checks, the run counter, or the already-guarded work-hours reader.
- No crew-rest warning renderer was found in the dedicated CSV/PDF exports or inert next-week peek; their absence is not filed as a missing call.
- No new hard placement refusal, standby rule, guessed clock, cross-device sync promise or OIL calculation change is specified.
- Exact warning totals are not assumed constant: double-turn counts, real assignment edits and hidden-warning state can legitimately change them.

**Walk: NOT RUN — scenario design only, as instructed.**  
**Rulings: none this session.**

