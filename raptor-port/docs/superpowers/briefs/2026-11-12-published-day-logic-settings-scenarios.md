**The highest-value scenarios are the ALL AVAIL window, placement forecasts, warning explanations, and checks across week boundaries.** Each can disagree with the main warning list even when that list is correct.

This is a scenario-design report, not a finding that the build is wrong. I did not run the app or change any files. I have kept settled rulings separate from the host’s and agent’s unconfirmed readings.

**Coverage map**

| Place or consumer | Visible sign and working gesture to check |
|---|---|
| **ALL / ALL AVAIL window** | Open the count from View-only Sched, Edit Schedule, the Board, and a published-version look. Check membership, individual rings and flags, clash explanations, flagged totals and the OIL Earn view. These include explanations worked out inside the window, beyond the main warning list. Repeat while the underlying day changes. |
| **Crew selection and placement** | Edit Schedule’s AIRCREW panel, Board pilot/WSO lists and the phone crew view: availability before selecting a slot; crossed-out names and reasons after selecting one; green placement marks; drag/hover explanations; the message after dropping or replacing someone. Check click/tap placement, dragging, moving and copying. |
| **Next-week preview** | Suggested printed B, special bad-time borders and explanations, and any hidden-warning treatment. Then open that day and compare. The preview is deliberately reduced: ordinary warning lists, rings, pending controls and sign-offs are not expected there. |
| **Published-version look** | Open both the current and an older issued version from Edit Schedule and the Board. Check rings, flags, warning lists, day details, ALL AVAIL and the recorded signers. A saved working plan is a separate kind of look. |
| **View-only Sched** | The issued face by default; the explicitly selected working draft where permitted. Check day warning totals, expanded warnings, pucks and dotted marks. An unpublished day must take current settings immediately. |
| **Edit Schedule’s week** | Day warning totals and severity; expanded warnings; hidden, struck-through warnings; comparisons describing what will appear or disappear when signed; and “Breaks…” information about another day. |
| **Scheduler Board** | Its separately drawn warning panel, day header, pucks and placement lists. Check the desktop side panel, collapsed phone warning panel and desktop-layout option on a phone. |
| **Day details** | Open the day’s information control from each available face. Check warning totals, warning text and task counts against the particular issued, working or older version being viewed. |
| **Person marks throughout the programme** | Cockpit seats, passengers and extras; SC MAIN/SPARE, AVALON and BB; activated standby lines; template and ordinary duty desks; OFT/AMT; Ground and Common Programme; input-derived rows; Personal Inputs, Unavailable, Available and SANS lists where they normally carry marks. Include named people and people expanded from ALL/ALL AVAIL. |
| **Warning selection and explanation** | Select a person; open “also flagged on” or a warning; follow it to the responsible day, row and time. Check desktop hover text and phone tap explanations. The threshold quoted must belong to the warning being explained. |
| **Combined decorations** | Warning letters, red/amber/grey rings, dashed late-show and dotted “breaks tomorrow” marks alongside CAT, self-selection, SANS, OIL, amendment/history and selection marks. Manual attention boxes and cancelled-line marks remain distinct from calculated warnings. |
| **Pending and publication** | Day-header pending counts; Changes / “To go out”; amendment controls; Publish from the week and Board; the four sign-offs; recorded “Signed ORIG/AL…” details and amendment chips. Compare the next publication’s sign-offs with the immutable record of who signed an issued version. |
| **Insights** | Every opening route, including Board and phone menus: total issues, hard issues, issues by day/type, and work hours. Hours and checks deliberately have different rule-setting behaviour. |
| **Logic** | Current values, modified/standard indicators, reset, check descriptions and “Fired this week”. The latter is a filter, not a per-row warning count. |
| **OIL and Leave War** | Candidate earning explanations, OIL decorations, issued credit and pending OIL changes. Follow an amended award through to Leave War rather than stopping at the schedule’s green mark. |
| **CSV and dedicated PDF output** | The issued suggested B, typed times and publication identity. These outputs do not currently provide the screen’s warning lists and puck rings. |
| **Roles and access** | Admin, member, admin using member view, guest with guest access enabled, and signed-out/access-waiting states. Compare only controls each role is meant to have. A scheduler without admin rights is excluded. |

For warning marks, cover the existing Q, C, CP, 7, R, B, D, A, TT, DT and L families, including several simultaneous marks. A correct day-level total does not prove that every occurrence of a person is correctly marked.

For counts, distinguish **pending changes**, **discardable edits**, **warnings**, and **history new to the reader**. They are not interchangeable totals.

**Every Logic control and its observation point**

All controls below need their own setting-change case; a successful crew-rest case is insufficient.

| Logic setting | Where its effect must be observed |
|---|---|
| **Crew rest** | Later-day warning, late-show treatment, crew selection, explanation and previous-day dotted trace. |
| **Days in a row** | Each affected day’s run warning, placement forecast, earlier-day trace and cross-week continuation. |
| **Long work day** | Grey long-day note, its stated duration/threshold and issue counts. |
| **Default rally before take-off** | Empty R suggestion, “+ In-time”, assumed start, tight-rest advisory and long-day calculation. Separately observe Insights hours and OIL. |
| **Brief before take-off** | Empty B suggestion, issued printed B, timing/order checks, rest and brief-interruption checks, pending changes and exports. |
| **Step before take-off** | Busy period before departure, placement clashes, tight-turn floor and late-show boundary. |
| **Dekit after landing** | Busy period after landing, placement clashes and tight-turn floor. |
| **Debrief after landing** | End of day, following-day rest, long-day calculation, ALL AVAIL explanations; separately hours and OIL. |
| **Tight turn** | Turn advisory, its explanation and placement forecast, including a standby line that flies. |
| **In-time words** | Text inserted by “+ In-time”; existing typed content and timing checks must remain distinguishable from that wording preference. |
| **EP sim brief** | Busy period before an EP sim, clash explanations and affected work/rest calculations. |
| **Sim debrief** | Busy period after a sim, clashes, end-of-day and following-day calculations. |
| **AMT debrief** | The AMT debrief row’s end, clashes and affected day calculations. |
| **Rows with no end time — A sim** | Assumed sim end, clashes, availability, hours and cross-day consequences. |
| **Rows with no end time — Any other row** | Assumed end of an open-ended task, clashes, availability, hours and cross-day consequences. |
| **SC day window opens / closes** | Day-versus-night currency requirement, qualification warning and placement explanation. Test each endpoint separately. |
| **SC MAIN clashes — all six switches** | Flight, sim, duty post, another shift, ground event and programme item: red/amber grading in warnings, rings, placement reasons and counts. |
| **Inputs late cut-off** | Its calendar settings door; days-before mode and weekday/weeks-before mode; LATE markings on inputs. |
| **SANS late cut-off** | Its separate calendar settings door and both deadline modes; SANS LATE markings. |
| **Members file for others** | Its Inputs settings door and the member’s permitted filing actions. It is an access setting, not a published-day conflict threshold. |
| **Full day of OIL** | Candidate half/full award, issued award, pending change and Leave War credit. Its D2005 treatment remains a stated question. |
| **Track Blue and Red sorties** | Formation answer control and Insights split. It is presentation/classification behaviour, not a day-warning threshold. |

**Ranked scenarios**

Use newly created data through the app. Start as admin with `ad` / `a`. Unless a scenario says otherwise, use ordinary weekdays without OIL, no outstanding edits, and no unrelated warnings. Establish the baseline before changing one setting.

**D** means desktop at **1536 wide**. **P** means phone at **402 wide with touch**. “Record” cases are observations for a decision, not automatic failures against D2005.

1. **ALL AVAIL gives a different answer from its published day — D + P**

   **Setup:** Set flight debrief to 60 minutes. Give someone a flight landing at 13:00 and an ALL AVAIL ground event at 14:30–15:00. Confirm the person’s baseline explanation and publish. Keep an equivalent unpublished control day.

   **Action:** Raise debrief to 180 minutes. Open ALL AVAIL from the issued schedule, untouched edit week, Board and current-version look; inspect the person’s reason and totals. Repeat with a sim and with an extra/passenger seat.

   **Expected:** The issued day’s checks retain its publication settings (**D2005**); untouched working-surface agreement is **the host’s reading**. The unpublished control uses the new setting.

   **Disproof:** Only the window gains a debrief clash, changes its flagged membership/count, or gives a reason inconsistent with the same person’s published warning.

2. **Placement forecasts use the wrong day’s settings — D + P**

   **Setup:** Publish Tuesday with Ranger’s B at 09:40 under 12-hour rest. Change today’s rule to 13 hours. Leave Monday unpublished.

   **Action:** Place Ranger on a Monday flight landing at 19:00, ending his day at 21:00. Inspect the armed-slot reason, drag forecast and post-placement result. Repeat using move/copy/replace. Reverse the saved/current limits in a separate case.

   **Expected:** Monday’s new work uses current settings; Tuesday is judged using its own publication settings (**D2005**, with **the host’s reading** for ownership of a cross-day check).

   **Disproof:** The forecast predicts a Tuesday breach that the resulting schedule does not show, or the reverse; placement method changes the answer; or Tuesday is judged by Monday’s setting.

3. **Correct flag, wrong threshold in its explanation — D + P**

   **Setup:** Publish a day with 12h40 rest under a 13-hour requirement, retaining its warning. Make separate long-day and consecutive-day examples.

   **Action:** Lower the current setting. Inspect warning headings, full explanations, desktop hover text, phone tap text and dotted-trace explanations.

   **Expected:** Whether lowering must retain the flag is **the agent’s unconfirmed reading**. **Record whether it remains.** If it remains, its explanation must describe the same calculation as its visible mark; it must not quote a different requirement as though that produced the warning.

   **Disproof:** A retained “13-hour” breach is explained using 12 hours, or the warning list and puck describe different thresholds.

4. **An older version silently adopts a later version’s rules — D + P**

   **Setup:** Publish an original under one setting, then an amendment under another. Change today’s setting a third time.

   **Action:** Open the original and latest issued version through both version selectors. Open day details and ALL AVAIL from each. Return to ordinary View-only Sched.

   **Expected:** Published-version looks show their warnings (**D187**). Current-version parity and older-version historical treatment are **D187’s stated agent reading**. Each newly issued version keeps its own settings (**D2005**); recorded signers remain those of that version.

   **Disproof:** Opening one version changes another’s warnings, details use the wrong version, or visiting the look changes the live Logic value.

5. **The next-week preview disagrees with the opened day — D + P**

   **Setup:** Publish next Monday with a blank B. Include a separate same-take-off/landing warning and exercise its hidden state.

   **Action:** Change brief lead and debrief. View Monday through the preceding week’s preview, then open Monday itself. Repeat from the other navigation direction.

   **Expected:** The issued printed B stays fixed (**D186**). Existing warning/hide presentation must describe the same issued document (**D2005; D469–D472**). General warning rings are not required in this deliberately reduced preview.

   **Disproof:** The preview changes the printed B, revives a hidden mark incorrectly, or gives a different special-warning explanation merely because the week was not opened.

6. **Crew rest changes with which week is loaded — D + P**

   **Setup:** Put the late flight on Sunday and publish Monday under 12-hour rest. Change current rest to 13 hours. Add a separate case where the following week’s affected flying day is Tuesday or later.

   **Action:** Inspect Sunday’s dotted trace and Monday’s warning from both weeks. Change the actual neighbouring duty so rest genuinely becomes insufficient, then restore it.

   **Expected:** Publication settings remain fixed (**D2005**); actual neighbouring facts can still change a live trace (**D183**). The later day choosing the rule is **the host’s reading**.

   **Disproof:** Navigating weeks changes the result, an unloaded future day is missed, or freezing settings also freezes a trace against a genuine neighbouring change.

   Also run an earlier-day sim with no end time under a different saved assumed length. **Record the assumed end and the resulting rest:** ownership of that earlier-day assumption needs clarification.

7. **Days in a row loses distant history or applies one limit to every day — D**

   **Setup:** Build a 15-day sequence across three weeks. Publish selected days under a 14-day limit; leave others unpublished. Include a no-time task, a standby-only day, and an input that creates a genuine break.

   **Action:** Change today’s limit to one day. Inspect both ends of the sequence, then move the break and revisit in the opposite order.

   **Expected:** Each published day retains its limit (**D2005**); each day choosing its own limit is **the host’s reading**. No-time work counts (**D1993**); standby-only days do not (**D1998**).

   **Disproof:** A retained 14-day calculation stops looking far enough back, one day’s limit spreads to neighbours, or opening a different week changes warnings/traces.

8. **The owner’s exact case, across faces and roles — D + P**

   **Setup:** Ranger lands Monday at 19:00 and ends at 21:00. Publish Tuesday’s VL with take-off 12:00 and B 09:40 under 12-hour rest. Make an equivalent unpublished day.

   **Action:** Raise rest to 13 hours. Inspect View-only, untouched Edit Schedule and Board; then member view and permitted guest view. Check signed-out/access-waiting screens separately.

   **Expected:** Published Tuesday stays clean (**D2005**); the unpublished control immediately uses 13 hours. Untouched editing-surface parity is **the host’s reading**. Guest content follows **D215**; its absent interaction controls are **D215’s stated agent reading**.

   **Disproof:** A new rest mark appears on issued Tuesday, the draft control ignores the change, or a role sees a different issued calculation. Do not demand warning-list controls from a guest whose view intentionally omits them.

9. **An edit, undo or unrelated day changes which rules apply — D + P**

   **Setup:** Start with scenario 8’s untouched published Tuesday.

   **Action:** Make one real Tuesday edit, undo it exactly, then edit Wednesday instead. Repeat with the order reversed: edit first, change Logic second.

   **Expected:** An edited working copy taking current rules is **the agent’s unconfirmed reading**. **Record the transition.** The issued face remains under its saved settings (**D2005**). Pending changes and sign-offs must follow the same comparison (**D103**).

   **Disproof:** Tuesday’s issued face switches rules; Wednesday’s edit switches untouched Tuesday; or exact undo leaves inconsistent pending/sign-off state.

   To test sign-off clearing, deliberately fill the four beforehand. Do not mistake fields already blank after publication for newly cleared signatures.

10. **Hiding a warning exposes an unresolved “edited day” boundary — D + P**

   **Setup:** Publish a day with one clash to hide, and rest that passes the old setting but fails today’s setting.

   **Action:** Hide only the clash. Inspect working warnings, issued warnings, pending, counts and signatures. Undo; repeat and publish the amendment.

   **Expected:** Hide persistence, removal of the person’s flag, exclusion from counts and the published pending lifecycle follow **D469–D472**. Whether hide-only makes all working checks use current rules is **unsettled**: **record exactly what happens**. The amendment itself adopts current settings (**D2005**).

   **Disproof:** A hidden warning still contributes to its applicable count, the issued hide changes before amendment, or the amended day retains the old settings.

11. **Suggested B, typed B and R become mixed together — D + P**

   **Setup:** Publish a 12:00 departure with blank B under a 140-minute lead: printed B is 09:40. Add a typed-B control, an overnight departure and an SC/AVALON/BB control.

   **Action:** Change brief lead to 180 minutes. Inspect issued screen, working suggestions, CSV and PDF; accept a flying-line suggestion and publish an amendment.

   **Expected:** Issued blank B stays 09:40 and its changed suggestion reads pending (**D186**). Typed B stays typed. Timing warnings do not themselves prevent publication (**D509**). Standby suggestion treatment follows **D1038–D1039**. **Record** whether the working ghost and retained warning explanation disagree before any edit.

   **Disproof:** The issued B or export changes early, a typed value is replaced, midnight is assigned to the wrong day, or amendment checks still use the old lead.

12. **A flight-setting reader was missed — D, with P placement checks**

   **Setup/action:** Run separate published/unpublished pairs, changing one control at a time:

   - Step 60→90 minutes: departure 12:00, another task at 10:45.
   - Dekit 30→60: landing 13:00, another task at 13:45.
   - Tight turn 90→120: a 100-minute turn, with the step/dekit floor controlled.
   - Default rally or debrief: make a six-hour assumed day become seven hours against a 6h30 long-day threshold.
   - Long work day: an eleven-hour day, with the threshold reduced from twelve to ten hours.

   **Expected:** Issued checks retain their settings; unpublished and newly amended days use current settings (**D2005**). Repeat applicable cases for passengers/extras and a standby line that flies (**D1996**).

   **Disproof:** Any one control affects only some warnings, placement reasons or seat types; or the amendment fails to adopt it.

13. **Sim or open-ended rows escape the saved settings — D + P**

   **Setup/action:** Use separate pairs for EP brief 15→30 minutes with a task in the added interval; sim debrief and AMT debrief 30→60 with a later task in that added interval; assumed sim length 60→120 with a task at 11:15 after a 10:00 start; other open-ended length 30→90 with a task at 10:45 after a 10:00 start.

   **Expected:** The issued day keeps each old assumption; the unpublished control and next amendment take the new one (**D2005**). Exercise front/rear seats, extras and ALL/ALL AVAIL expansion.

   **Disproof:** The main warning stays correct but availability, a placeholder window or another seat type uses the changed assumed interval.

14. **SC day-window boundaries use current settings on an issued day — D + P**

   **Setup:** Use someone qualified for day SC only. Publish shifts touching each edge of a 07:00–19:00 window.

   **Action:** Move the opening to 08:00 and closing to 18:00 separately. Inspect qualification flags, details and placement reasons. Separately change the person’s actual qualification.

   **Expected:** The saved window governs the published check (**D2005**). Actual qualification changes remain live where ruled (**D188**). Include SC MAIN/SPARE and non-applicable standby/duty controls.

   **Disproof:** A changed window alone creates a new issued qualification flag, or retaining the window incorrectly prevents a genuine qualification change from appearing.

15. **One of the six SC clash switches was omitted — D + P**

   **Setup:** Make six isolated overlaps: SC MAIN against a flight, sim, duty, shift, ground event and programme item. Publish with the relevant switch set to Advisory.

   **Action:** Change that switch to Warning. Compare issued and unpublished pairs, placement reasons, rings and totals; then amend. Run the reverse change separately.

   **Expected:** Saved grading applies to issued checks (**D2005**). Reverse-change retention is **the agent’s unconfirmed reading**. A standby line that flies still has the separately ruled sortie treatment (**D1996**).

   **Disproof:** One switch is always live, all days acquire another day’s table, or the picker disagrees with the resulting warning.

16. **Keeping settings accidentally keeps facts that should remain live — D + P**

   **Setup:** Publish under old settings, then change current settings. Prepare separate neighbouring-duty, qualification, input-detail, medical and placeholder-membership cases.

   **Action:** Change each through its own app controls, without directly editing the published schedule. Visit another week and return.

   **Expected:** D2005 keeps settings, not every fact. Live traces and specified qualification checks follow **D183–D188**; frozen inputs and pairing information retain their existing publication treatment. Whether each external edit makes the *working* day adopt current settings is **the host/agent reading**: record it separately.

   **Disproof:** Everything freezes indiscriminately, frozen medical/input content becomes live, or loaded and neighbouring weeks classify the same untouched day differently.

17. **A publication or restoration route fails to keep independent settings — D**

   **Setup:** Publish an original under 12 hours, an amendment under 13, then set today to 14.

   **Action:** Exercise supported amendment withdrawal/unpublish, undo/redo, saved-plan restoration, day copying and template insertion. Publish new content through both week and Board controls. Reload and sign in again.

   **Expected:** Every new publication takes current settings (**D2005**). Copying old content does not make a new unpublished day an old issued record. Viewing or restoring an older issued version must not overwrite another version’s saved settings.

   **Disproof:** Only the first publication works, copied content carries an inappropriate old rulebook, later Logic edits mutate earlier versions, or reload loses newly saved settings.

18. **Insights freezes hours or updates issued issue counts incorrectly — D + P**

   **Setup:** Publish a weekday flight taking off at 12:00 and landing at 13:00, without typed in-time/R: three-hour report lead and two-hour debrief give six hours. Set long-day threshold to 6h30.

   **Action:** Raise report lead or debrief by an hour. Open Insights from every available route. Then make a pending content edit and a pending hide.

   **Expected:** Hours become seven immediately (**D482**), while the issued long-day check retains publication settings (**D2005**). Insights uses the latest issued content and issued hides, not pending edits (**D478; D472**).

   **Disproof:** Hours stay at six, a new issued long-day issue appears solely from the setting change, or Insights follows whichever draft happens to be open.

19. **OIL is incorrectly swept into “Logic changes never make pending” — D + P**

   **Setup:** Publish a Saturday flight with the same six-hour span and a 6h01 full-day threshold: half a day of OIL. Establish its issued credit.

   **Action:** Increase debrief to make seven hours. Inspect the OIL explanation, pending changes, sign-offs and Leave War; publish the amendment. Separately change only “Full day of OIL”.

   **Expected:** A published day retains its issued OIL and a relevant Logic change reads pending until republication (**D592**, supported by **D48**). The more detailed worked-times and sign-off rules are **D592’s stated agent readings**. For the separate full-day-threshold case, **record exactly what changes**: D2005 explicitly leaves that question open.

   **Disproof:** Issued credit silently changes, a changed award is omitted from pending, or publishing the amendment fails to update the credit. Do not reject OIL pending merely because the brief says only printed B should create pending.

20. **Saved-day checking leaks into current Logic or unrelated controls — D + P**

   **Setup:** Create adjacent days published under different settings plus an unpublished control.

   **Action:** Alternate their windows, version looks and Insights, then return to Logic. Use Reset to standard and reload. Separately exercise In-time words, both modes of each late cut-off, Members file for others, and Blue/Red tracking.

   **Expected:** Logic continues to display the actual current values; unpublished checks use them (**D2005**). Text, filing permissions, LATE markings and Blue/Red retain their own purposes. Logic’s “Fired this week” filter remains available (**D928**); **record exactly which working/issued warnings it includes**, since D2005 does not settle that mixed-version explanation.

   **Disproof:** Visiting a saved day changes current settings, reset mutates an issued version, the next draft inherits the last viewed day’s values, or unrelated controls become frozen with publication.

**Explicit negatives**

The source inspection did not identify an additional day-check setting beyond the sixteen numeric settings and six SC clash switches listed above. The two unused controls—minimum turn and default sortie length—are hidden; they do not need invented user scenarios.

I found no separate automatic rule-warning delivery through the notification bell, and no additional Tracker warning consumer for this promise. OIL’s downstream credit remains in scope through Leave War.

The next-week preview deliberately lacks the full warning interface. The dedicated CSV/PDF outputs do not carry screen warning lists or puck rings. The removed whole-week warning pills and removed per-row Logic counts should not be reported as missing features.

I excluded migration, compatibility and already-stored-demo-data cases, and excluded a scheduler without admin rights. Every proposed persistence case starts with data created by the new build.

No runtime behaviour has been verified. These are concrete walks for the host to run, beginning with scenarios 1–7.

**Contradictions and unresolved meanings**

| Subject | The two sides |
|---|---|
| **Rule versioning** | The project guide still describes an unversioned rulebook with a printed-brief exception. **D2005** now requires saved settings for all published-day checks. The backlog already identifies the guide update; this is not a newly discovered unfiled job. |
| **Unconfirmed readings presented as settled** | The new Publishing explanation states that lowering cannot clear a flag, untouched editing surfaces agree, edited working copies use current settings, and the judged day decides cross-day limits. The ruling/brief explicitly labels these as readings awaiting confirmation. Tests must preserve that distinction. |
| **“A changed setting never makes pending”** | The new explanation and host reading make this absolute except for printed B. **D592** separately says relevant Logic changes make published OIL pending. The absolute wording conflicts with that surviving rule. |
| **“OIL uses today’s settings”** | The brief/new explanation uses this shorthand. **D48/D592** retain issued credit while current calculations can produce a candidate amendment. Current candidate calculation and issued award are different things; the wording must name which it means. |
| **“Once edited” versus hide-only** | The general explanation says edited working days use current settings. Its known-limit passage says a day with only a hide waiting still uses saved settings. That exception needs an explicit product answer, not an unnoticed test assumption. |
| **Cross-day ownership** | “The day being judged decides” suggests the later day controls the calculation. The explanation also builds an earlier day’s open-ended tasks using that earlier day’s settings. Those can produce different rest intervals. Scenario 6 records the distinction. |
| **Working suggestions versus working checks** | The documented limit leaves current R/B suggestions on screens while an untouched published working day may still be checked under saved settings. A displayed suggestion and its warning can therefore describe different times. The printed issued B is settled by **D186**; the working presentation needs an answer. |
| **Fixed settings versus live warnings** | D2005 does not revoke the live neighbouring-fact and qualification behaviour in **D183–D188**. “The warnings stay as issued” is too broad unless it distinguishes saved settings from changing facts. |
| **Insights hours versus issues** | Older wording associates changing hours and issue counts. **D482** keeps hours live; **D2005** now keeps published checks under saved settings. A seven-hour bar beside a retained six-hour-based check is not, by itself, a defect. |

No post-compaction handoff block was read.

**Rulings: none this session.**