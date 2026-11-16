The main gap is **coverage of different copies and different readers of the same day**. A correct warning in Edit Schedule would not prove the published-version viewer, day details, availability window or OIL tracker correct.

This is a scenario design, not a correctness verdict. I read the branch, proposal, rulings, builder’s report and roll-call. I changed nothing and ran no tests or application walk. All publications, amendments and hides below must be made during this walk; older demo records are not evidence of a defect.

**What the roll-call needs added or split**

Paths below are relative to `raptor-port/`. “Split” means the sheet mentions the subject but combines routes that need separate observations.

| Gap | Visible sign and gesture to check | Where it is drawn or supplied |
|---|---|---|
| **Add: day-details window** | Open the day’s information/date control. Read its warning rows and “free all day” figures. Tap a warning: the window must lead to the corresponding issues list and affected row in the correct copy of the day. | `src/ui/Modals.tsx:25`; `src/ui/html.ts:2544`, warning rows at `2605`; `src/ui/interactions.ts:1976` |
| **Add: 👁 published-version viewers, including older versions made during this walk** | Open Original, then the new amendment, from both schedule and Board routes. Check the version heading, warning list, puck marks and day-details window. A saved plan is a separate control: its preview is flag-free. | `src/ui/html.ts:164–184`; `src/ui/SchedBoard.tsx:456`; `src/engine/validate.ts`, `versionFaceWarn` |
| **Split: pending warnings, not just pending OIL** | Inspect warnings added, changed, cleared and hidden. Check “new once signed”/“goes away once signed”, the short check name, and any supported jump to the affected row. A setting-only OIL explanation has no schedule row to jump to. | `src/ui/pendlist.ts:323`, `395`, `625`; `src/ui/html.ts:1202`, `1217` |
| **Add: the immediate warning after placing a person** | Place a crew puck so it creates a warning, including one on the following day. Read the immediate notification, callsign, day and any “more” count; then open the full issues list. This is a separate producer from tapping an existing warning. | `src/state/dropflag.ts:85`, `97`; callers in `src/ui/drag.ts` and `src/state/view.ts` |
| **Add: publication’s OIL notices** | Publish a newly constructed earning day. Read the resulting notice, including missing-period/unusable-time or bid-overlap wording when applicable. A valid take-off with blank landing must not be described as unusable solely because landing is absent. | `src/leavewar/sync.ts:1905`, publication checks immediately below; `src/ui/toast.ts:47` |
| **Split: Leave War cell, day sheet, day list and OIL tracker** | Read the earned FO/HO cell, open it, inspect its worked times, then open the person’s OIL tracker. Check the credit and resulting balance, not merely the grid’s letters. Use Ranger for the member’s own-credit reading. | `src/leavewar/ui/MatrixRows.tsx:275`; `BidPicker.tsx:1174`, `1310`; `DayList.tsx:275`, `409`; `OilTracker.tsx:175`, `588`; credit writer `src/leavewar/sync.ts:1839` |
| **Add: Insights’ work hours** | Open Insights from the schedule and from another page. Check hours as well as “Conflicts by type”. **Hours intentionally follow today’s Logic settings even for published content; published warning checks and credited OIL do not.** | `src/engine/insights.ts:18`, `62`; `src/engine/validate.ts:2063`; `src/ui/insights-html.ts:42`, `56` |
| **Split: availability readers** | Inspect the unselected crew list, the list after selecting a destination seat, collapsed/expanded availability strips, day-details free figures, and ALL/ALL AVAIL membership and reasons. Read the same window in each. | `src/engine/avail.ts:13`, `114`; `src/ui/palette-html.ts`; `src/ui/html.ts:901`; `src/ui/AvailWindow.tsx:102`, `137`, `190`, `314`; `src/leavewar/sync.ts:1593` |
| **Split: short-name dictionaries and titles** | Compare the issues heading, flag title, whole-puck hover/tap description, Logic flag key/check name and Insights category. Search/filter Logic by the new wording. A correct full sentence does not prove these shorter copies changed. | `src/engine/validate.ts:27`, `74`; `src/ui/html.ts:538`, `553`; `src/ui/logic-html.ts:92`, `94` |
| **Split: next-week peek and previous-week context** | Check ordinary warnings and crew-rest traces, not just the same-time title. Open Monday before visiting the preceding Sunday; then navigate back. Check the next-week peek and the further-week route where offered. | `src/ui/peek.ts:261`, `302`, `337`; `src/ui/weeknav.ts:80`; `src/ui/EditWeek.tsx:198`; `src/engine/weekctx.ts:256` |
| **Split: warning-bearing row titles** | Hover/tap the equal-take-off-and-landing warning and reporting/rally warning. These are separate from a crew puck’s title. Equal times are also a separate case from a blank or “TBD” landing. | `src/ui/html.ts:1369`, `2007`; corresponding Board and peek renderers |
| **Split: PDF/print and CSV** | Use each application command independently. Check the chosen published/draft content and the entered landing value. These exports do not contain the complete engine-warning list; do not demand newly invented warning columns or turn an assumed landing into a typed landing. | `src/ui/export.ts:52`, `70`; `src/ui/printpdf.ts:31`, `104` |
| **Add explicit role and width readings** | Repeat the important read routes as Ranger, including his published schedule and own Leave War/OIL details. Repeat the distinct drawers at phone width. “No permission changes” does not establish that these readings work. | Role/world selection in the renderers above, particularly `Modals.tsx`, `AvailWindow.tsx`, `SchedBoard.tsx` and Leave War components |

I found a publication-notice route and a placement-notice route. I would **not invent a requirement for an engine warning to appear in the notification bell** without a supporting contract.

**The two-hour walk**

Allow ten minutes to establish the fixtures, about 88 minutes for scenarios 1–10, seventeen minutes for 11–13, and five minutes for recording gaps. These are estimates, not measured timings. Capture phone evidence while the relevant state is already open.

Use two consecutive weeks within a Leave War period. Pick otherwise clear days and people, removing only conflicting fixture assignments through normal controls where necessary. Record the initial Logic values. Use admin `ad` / `a`; use member `us` / `us` only for member readings.

For the numerical examples below, establish through Logic:

- “A flight”: 60 minutes.
- Nominal report: three hours before take-off.
- Flight debrief: two hours.
- Step/dekit: 60/30 minutes.
- Crew rest: twelve hours.
- Full-day OIL threshold: 6h01.

Give the fixture rows unmistakable names. Keep unrelated work off the person’s day where an exact hours/OIL result is required.

1. **Weekend credit through the least-shared readers — 12 minutes**

   **Setup:** On Saturday, give Bane a normal flying seat, take-off `12:00`, landing blank, no typed rally/in-time and no other work. Check OIL Earn, obtain the required sign-offs and publish through the app.

   **Action:** Read the Leave War cell, its day details and the OIL tracker. Change “A flight” to 90 minutes. Revisit those surfaces, pending changes and Insights. Reset to 60 before republishing; then change to 90 again and publish the amendment.

   **EXPECTED:** At 60, assumed landing is `13:00`; work is `09:00–15:00`, six hours, earning half a day. At 90, the proposed work ends `15:30`, earning a full day. Before republication, the credited half day and its published worked times remain; the day reads pending and sign-offs fall. Returning the setting to its original value removes that setting’s difference. After republication, the credit becomes a full day without an extra duplicate credit. Insights’ hours move with the Logic setting before republication.

   **Source:** D2046–D2047, D2053, D592, D2044; D482 for the intentional Insights exception.

   **Disproves correctness:** Early movement of credited OIL; correct cell but stale tracker/day-sheet times; duplicate credit; no pending change because only the new flight-length setting changed; or an unusable-times warning caused solely by blank landing.

2. **Published 👁, day details and saved-plan separation — 8 minutes**

   **Setup:** Publish a weekday with a newly created assumed-landing warning. Save a plan through the existing plan controls.

   **Action:** Change “A flight”, then make a small genuine schedule edit so an amendment is waiting. Read Edit Schedule, View-only Schedule, Board, day details, and the 👁 viewer. Publish an amendment; inspect both versions created during this walk. Open the saved plan.

   **EXPECTED:** The published checks retain their issued settings. Once a change waits, the working amendment uses current settings and identifies new/clearing warnings appropriately. View-only retains the official face. The current published viewer follows its applicable official overlays; an older version remains a historical reading. The plan preview stays flag-free. Tapping a day-details warning must land in the matching copy and row.

   **Source:** D2005, D2013, D187; `dayPreviewHTML`, `versionFaceWarn` and the Board’s separate plan/version rendering.

   **Disproves correctness:** An eye viewer silently showing working warnings, a historical viewer changing with the draft, a plan acquiring live flags, or a warning jump landing in another version.

3. **Sunday → Monday, including midnight and a cold week entry — 10 minutes**

   **Setup:** Give Ranger a Sunday flight at `23:30`, landing blank. With the stated settings, it lands at `00:30` and its debrief ends `02:30` Monday. Give him Monday reporting at `13:30`, before twelve hours’ rest is complete.

   **Action:** Enter Monday’s week before opening Sunday’s week. Read Monday’s crew-rest warning, then Sunday’s “Breaks Monday” trace. Navigate back and forward and use the next-week peek. Repeat with “TBD”, then type a landing that changes the rest result. Include a newly published Sunday/Monday reading.

   **EXPECTED:** The same facts survive navigation and initial loading. Rest clears at `14:30` in the initial fixture. The warning follows the approved order: previous end, clear time, today’s breaking item, required rest. Sunday’s earning calculation can extend past midnight without creating an extra Monday credit. Compare corresponding working or published copies, not different copies accidentally.

   **Source:** D2046, D2053, D2069, D42; cross-week readers in `weekctx.ts`.

   **Disproves correctness:** A warning appearing only after visiting Sunday, a missing previous-day trace, a one-day/24-hour error, stale assumed wording after typing landing, or duplicate Monday credit.

4. **Crew picker, ALL AVAIL and conflicts for exactly the same window — 10 minutes**

   **Setup:** Ranger flies `12:00`, landing blank: assumed landing `13:00`, busy from `11:00` through `13:30`. Create a second item at `13:10–13:20`.

   **Action:** Before assigning him, inspect the crew list with and without that destination selected. Inspect ALL AVAIL and ALL for the same item. Assign Ranger and read the conflict list and availability reason. Move the item beyond the busy window; then shorten the flight by typing landing. Rotate the destination through a ground item, sim seat/passenger and duty place using existing rows.

   **EXPECTED:** Readers using that same window agree about his availability. The initial conflict identifies the flight’s assumed landing and dekit end. ALL AVAIL excludes someone busy for its window; ALL can retain him while showing why he conflicts. Moving the item or typing landing updates membership, reasons and warning together.

   **Source:** D2046, D2059; the agreement between `personBusy`, destination-seat checks, placeholder membership and validation.

   **Disproves correctness:** Available in the picker but conflicting for the same window; absent from ALL AVAIL after becoming free; correct ordinary seat but stale extra-seat/passenger reading; or the reason showing a different landing from the issues list.

5. **Blank → “TBD” → typed landing → blank, across every affected reader — 8 minutes**

   **Setup:** Use a clear weekday and a normal flight with take-off `12:00`. Add, one at a time, a following flight that produces a tight turn and an item inside debrief/dekit. For long-day coverage, use a separate clear person with work starting `06:00` and a final flight at `18:00`.

   **Action:** Cycle landing through blank, `TBD`, a real time that changes the result, then blank again. Read tight turn, debrief, conflict, next-day rest, long-day span, Insights hours and availability.

   **EXPECTED:** Blank and “TBD” use the same assumed duration. Every affected explanatory line identifies an assumed time where relevant. A typed landing replaces that assumption everywhere; clearing it restores the assumption. Work hours include the flight and applicable reporting/debrief.

   **Source:** D2045–D2047, D2053; proposal §3c–§3g.

   **Disproves correctness:** One reader treats blank as zero-length, “TBD” follows another path, a line retains “assumed” after typing landing, or only some consumers recalculate.

6. **SC without END, flying and not flying — 8 minutes**

   **Setup:** On an otherwise clear Monday, create an SC with START `20:00`, END blank; give its person an early Tuesday task. Begin nonflying.

   **Action:** Read Tuesday’s rest and Monday’s trace. Make the SC fly using its normal controls. Type END `23:00`, clear it again, and repeat a short control with AVALON or BB.

   **EXPECTED:** The incomplete shift contributes no invented end to crew rest. Once END is typed, it participates normally. Its applicable missing-time warning remains. For the flying case, retain “flies but has no END” or the approved corresponding wording. **For nonflying, RECORD exactly what it says** rather than demanding the word “flies”. Applying the omission to a flying shift is the builder’s stated interpretation.

   **Source:** D2055, including its explicitly unconfirmed flying-shift reading; builder’s report.

   **Disproves correctness:** “Monday ended 20:00” derived from START, an incomplete shift generating a rest-clear time, END entry failing to restore rest, or clearing END leaving the restored result behind.

7. **New hides, undo and identity — 7 minutes**

   **Setup:** Create a new schedule-item conflict with the new wording. Keep a second warning so counts and puck marks can be checked independently.

   **Action:** Hide and undo it. Hide again, reload and sign back in. Change the same two items’ times/name while retaining the conflict; then replace one item with a different item. Separately hide a newly created request-against-flight warning and change its wording-producing time. On a newly published day, inspect the pending hide and official view before and after amendment.

   **EXPECTED:** A new hide works and can be undone; hidden warnings have the contracted struck treatment and leave the applicable counts/marks. Schedule-item conflict identity follows the person and two items. A different item is not covered by that hide. Request conflicts remain words-keyed. A published hide waits for publication before changing its official face.

   **Source:** D2001, D2018, D469–D472.

   **Disproves correctness:** Hide immediately returning without a relevant change, an unrelated replacement conflict being suppressed, undo failing, or the official warning disappearing before amendment.

8. **Pending OIL wording: unchanged amount, changed end, both ends and competing edits — 7 minutes**

   **Setup:** Reuse the published weekend fixture with enough work to remain a full day after a small setting change.

   **Action:** Change only the assumed flight length; inspect the person’s pending row. Next change only nominal report. Then change both. Finally add a pending schedule edit, such as a typed in-time, in both orders: setting first and schedule edit first.

   **EXPECTED:** The person’s own row states whether the amount stays the same or changes, and shows the moved worked times. End-only changes explain the end. With both ends changed, the complete row must make both differences visible. The “published OIL under today’s values” comparison must remain distinguishable from what the combined working amendment would earn. OIL Earn supplies that latter reading.

   **Source:** D2054, D592; proposal §3b/build notes and the comparison contract above `oilRuleWords`.

   **Disproves correctness:** “Still a full day” without the changed times, an end-only change producing no pending row, misleading attribution of the combined result, or different results depending on edit order.

9. **Conflict shapes and the exceptions that must remain exceptions — 8 minutes**

   **Setup:** Use the `12:00–13:00 assumed` flight.

   **Action:** Move a named item successively into step only, airborne time, dekit only, step-plus-airborne and across the whole flight window. Repeat one with a timed request carrying a reason. Change Step/Dekit in Logic. Finally use two flights with separate airborne periods but overlapping step/dekit, then move their airborne periods into overlap. Include one nonflying standby control.

   **EXPECTED:** “Conflict:” replaces “Clash:”. Step-only and dekit-only conflicts state the causal endpoint; requests retain their reason. Times follow Logic. Two flights with separate airborne periods produce the applicable amber tight turn, not a red conflict merely because step/dekit overlap. Standby has no added step/dekit; nonflying SC SPARE/AVALON/BB retain the exclusions in §3e.

   For endpoint equality and builder-selected spanning-item phrasing, **RECORD exactly what it says**, then compare the availability reading for the identical interval.

   **Source:** D2058–D2065, D2070; proposal §3c–§3e.

   **Disproves correctness:** A conflict whose displayed times do not explain it, an obsolete label, hard-coded Step/Dekit, or a newly introduced standby/two-flight red conflict forbidden by those exceptions.

10. **Phone fit and usable gestures in each distinct drawer — 10 minutes**

   **Setup:** Keep the longest conflict, request-with-reason, crew-rest and pending-OIL lines available. Include multiple callsigns and a puck with both an OIL strip and a warning mark.

   **Action:** At 390 and 402 CSS pixels, inspect Edit Schedule, Board issues, day details, 👁, ALL AVAIL reasons, pending changes and the next-week peek. Tap the warning body and hide/undo separately. Open and dismiss overlays; check the immediate state and settled state.

   **EXPECTED:** Conflict lines fit within two rows; the proposal’s other longest lines fit within three at 402. Time ranges stay together. Names, causal times and reasons remain readable. Taps reach the intended control and copy; warning marks remain visible beside other puck decoration.

   **Source:** D2070; proposal §3b sizing promises; the actual per-surface gestures.

   **Disproves correctness:** Clipping, ellipsis hiding the cause, a split time range, an obscured hide button, a body tap hiding instead of opening, an overlay hiding the destination, or a stale frame that leaves the wrong warning visible.

11. **Logic control, Reset and member reading — 5 minutes**

   **Setup/action:** Find “A flight” through the normal page and search/filter. Enter 90 and leave the field; enter another value and immediately press Reset. Try below/above the documented 15–480-minute bounds. Reload. Read the same page as Ranger.

   **EXPECTED:** The row is in “Rows with no end time”, before “A sim”; Reset restores 60 and no delayed field save overwrites it. Bounds are explained and enforced. The changed-settings explanation uses the approved sentence: “Published days keep their old settings until published again.” Separate conditional/member notices are not automatically a violation. Ranger can read but cannot change the setting.

   **Source:** D2047, D2067, proposal §3f, build notes and `LogicPage.tsx`.

   **Disproves correctness:** A stale value returning after Reset, silent invalid acceptance, lost persistence, old multi-sentence explanation returning, or member editing.

12. **Specialised wording writers and short names — 8 minutes**

   **Setup/action:** Reuse existing editable rows to create a request conflict with a reason, a missing brief/debrief, a qualification/crew-composition warning and a newly arising OIL warning where practical. Compare their full rows, puck/title labels, Logic names and Insights categories. Check the next-day “Tight turning” label separately from same-day “Tight turn”. Retain a double-turn aggregate control.

   **EXPECTED:** Each full displayed warning supplies the applicable person, items, times and reason without needing another warning to explain it. “Tight turning” remains unchanged; the double-turn aggregate retains its approved count/names shape. A short label need not repeat a whole sentence, but must use the approved check name.

   **Source:** D2045, D2048, D2050, D2068–D2071; proposal §3g.

   **Disproves correctness:** A specialised producer retaining old wording, a correct issue row with an obsolete tooltip/category, or a renamed “Tight turning”.

13. **Equal times, print and CSV controls — 4 minutes**

   **Setup/action:** Create equal typed take-off and landing times separately from the blank/TBD fixtures. Read its title on the schedule, Board and peek. With an amendment waiting, use the app’s print/PDF and CSV commands.

   **EXPECTED:** Equal times retain their own warning path rather than silently becoming the missing-landing case. Exports select the applicable issued/draft content. A blank or “TBD” entered landing is not silently printed/exported as a typed assumed landing. Inspect the actual generated output, including print pagination.

   **Source:** `fltNoLen`, the separate row-title renderers, `publishedDays`, `schedRows` and `schedPrintHTML`.

   **Disproves correctness:** Equal times treated as missing, one title using stale wording, exported working changes presented as published, or a fabricated typed landing.

**The qualifying objects that must remain on the coverage ledger**

The walk above deliberately reuses a small number of fixtures. The ledger should still name these branches so “one conflict passed” cannot stand for all of them:

| Family | Qualifying branches |
|---|---|
| Assignments and conflicts | Ordinary flight; second flying seat; extra occupant/passenger; two distinct items with the same displayed name; sim; ground/programme item; duty; timed request; overlapping/untimed medical, leave and overseas inputs where applicable. |
| Standby | SC MAIN and SPARE; AVALON and BB; flying/nonflying; same-kind double assignment; START without END; complete overnight shift. |
| Timing and workload | Tight turn; next-day tight turning; crew-rest breach and previous-day trace; long day; consecutive days; double-turn aggregate; missing flight/sim brief or debrief; reporting/rally ordering; equal take-off/landing. |
| Crew and qualifications | Solo/illegal composition, approval, passenger crew, OCU/instructor, instrument and standby qualifications, AAR qualification/instructor, and SANS availability warnings. |
| OIL | Missing usable times, absent Leave War period, unpublished earning day, newly applicable PH/day changes, and publication/bid notices. Exclude legacy-only stored-record cases. |

The specialised permutations already named in the family tests can support this ledger, but **a test name or historical pass is not a walked result**. Anything not actually driven should remain explicitly unwalked rather than receive a blanket pass.

**Orders and states that matter**

| State × reading | Expected interpretation |
|---|---|
| Unpublished working day × admin | Current entered content and current Logic; edits immediately affect its warnings and calculated readers. |
| Published day, no amendment waiting × official warning readers | Issued settings and applicable official content. A Logic-only change must not be assumed to amend every weekday. |
| Published earning day × OIL-affecting Logic change | Pending difference/sign-off effect; credited OIL remains issued until republication. |
| Published day with amendment waiting × Edit Schedule | Proposed amendment checked with current settings; new/clearing warnings distinguishable. |
| Same state × View-only/current published 👁 | Official face remains distinct from the proposed amendment. |
| Older version created during this walk × 👁 | Historical reading; its identity must remain visible when opening details or following a warning. |
| Saved plan × preview | Separate plan content; flag-free preview, not a substitute for a published-warning check. |
| Published content × Insights hours | Latest applicable published content, calculated with today’s Logic values—D482. |
| Published content × Insights warning counts | Applicable official warning face, including its issued rules/hides. |
| Credited day × Leave War cell/day sheet/tracker/balance | Same authoritative credit and worked times, including after amendment. |
| Any permitted reading × member Ranger | Correct visible copy and own-person information; no scheduler-without-admin scenario. |
| Each distinct renderer × desktop/phone | Same meaning and copy selection; independently usable layout and gestures. |

The essential order reversals are:

- Landing typed before a warning exists **and** typed after it exists.
- Logic changed before a schedule edit **and** after it.
- Setting restored before republication **and** changed then republished.
- Hide → reload → undo, and hide → same-item edit versus replacement item.
- Monday opened cold before Sunday, then after visiting Sunday.
- Missing END → flying → END typed, and END typed → cleared.
- Read an overlay, edit the underlying day, then reopen it.
- Read as admin, then sign in as Ranger without relying on the admin’s cached screen.

**What must be pictured**

Unit tests can establish words and arithmetic. They cannot establish that a person can see and use the result in these layouts.

Required pictures are:

- Longest conflict and crew-rest rows at phone width, including callsigns and complete time ranges.
- Each distinct overlay: day details, published 👁, ALL AVAIL and pending OIL.
- The warning body and hide/undo targets, with the resulting destination visible.
- A puck carrying its warning mark alongside OIL/other decoration.
- Matching working and published readings with their day/version headings visible.
- The weekend credit before the setting change, while pending, and after republication—cell, worked-times detail and tracker.
- Sunday’s trace beside Monday’s rest warning, with dates visible.
- Actual print preview/output and CSV contents.

A close crop proves wording; a wider picture proves **which day, version, role and surface** supplied it. Phone-width desktop emulation does not prove a physical phone’s keyboard, browser chrome or touch behaviour; record that limitation if no device is used.

Rulings: none. This report proposes coverage only; it records no new user decision.

