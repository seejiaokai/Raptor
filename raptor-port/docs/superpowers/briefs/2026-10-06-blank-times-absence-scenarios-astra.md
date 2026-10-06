**Read-only scenario-design report.** I found four source-level mismatches with the promises. None was reproduced in a running app during this review: the brief expressly prohibited tests, builds and servers.

**1. Roll-call**

“Connected” below means the source contains a route to the reader. It is not a runtime pass.

The collection points are in [events.ts](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/engine/events.ts).

| Seat or row | How the app creates it without times | In the promise; `buildDay` route | What the walker should see |
|---|---|---|---|
| **BB MAIN and SPARE, front and rear** | `+ Wave` → BB; its shift starts blank | Yes; exempt-wave branch, lines 259–289 → `blank` | OL, OD and medical flag immediately. Local leave and local commitments remain allowed. |
| **AVALON MAIN and SPARE, front and rear** | Add AVALON; clear shift start/end | Yes; same branch | Same absence answers as BB. No borrowed crew-rest warning. |
| **AVALON and BB desks, primary and extra people** | `+ Block`; choose or create a template whose **For wave** is AVALON/BB; clear its hours | Yes; duty branch, lines 439–450 → `blank` | Overseas absence and HL/OML/ATT C flag; ATT B remains allowed. Creating/deleting the wave must not create/delete the desk. |
| **SC SPARE, front and rear** | Add SC; clear the formation’s shift hours; also flip a MAIN badge to SPARE | Yes; `forms.spareCrew`, lines 332–373 | Overseas absence and medical flag. Local leave remains allowed. Its puck must not borrow MAIN’s absence ring—**F3**. |
| **SC MAIN, front and rear** | Same SC controls, retaining MAIN | Yes; `fly` plus `events(kind: shift)`, lines 350–366 | Red absence warning, except Meeting’s amber advisory. With blank shift hours, no invented clock in the sentence. |
| **Ordinary and SC-linked duty desks, primary and extra people** | `+ Block` from a blank template; add a row; clear start/end | Yes; duty `push`, lines 430–455 → `blank` | Whole-day absence flags. ATT B may work. An SC desk remains a desk for this exemption. |
| **OFT seats, passengers and extra people** | Add a sim row; clear its hours | Yes; sim loop, lines 377–389 → `blank` | All eligible named people receive the same absence check, including people beneath the row. |
| **AMT seats, passengers, extra people; BRIEF/BOX/DEBRIEF rows** | AMT `+ Block` creates three blank rows; `+ Row` adds another | Yes, under “sim”; same sim loop | Walk each row that actually offers a person-placement control. A free-text description is not a person. ATT B remains allowed. |
| **Handwritten Ground Programme row, named person and extras** | `+ Item`; leave or clear times | Yes; ground branch, lines 459–462 → `blank` | Immediate whole-day warning; unnamed row has a complete sentence. |
| **Request-derived Ground Programme row** | File an all-day activity; let it land or use `→ Ground`; add another person | Yes; ground branch carries `src` | No warning against its own source request. Another absence belonging to either occupant still flags. Custom whole-day hours expose **F2**. |
| **Common Programme crowd and extras** | `+ Item`; add people; leave or clear times | Yes; `allhands`, lines 466–469 → `blank` | Each real person is checked. Primary crowd and extras must agree. |
| **Cancelled aircraft/formation, cancelled row, info-only ground/programme row** | CX or info-only control | Explicit exclusions; skipped before collection | No warning attributable to that excluded assignment. Other assignments can still flag the same person. |
| **ALL / ALL AVAIL** | Place on a permitted non-cockpit row | Explicit exclusion; `isSpecial` removes it from person checks | No invented absent person. Cockpit placement is refused. A blank non-cockpit row’s `?` count still opens its explanation. |

The promise lists all top-level seat families. Its shorthand needs explicit expansion to cover **AMT’s three rows, passengers, extras, SC-linked desks, and template-created exempt desks**.

Every applicable row must also be restored through **a newly saved plan, a newly issued version loaded onto the working copy, a newly saved day template, Undo and Redo**. Applying a day template to an already published day must remain refused. I found text-paste handling, not a separate bulk seat-paste importer: exercise pasting and clearing the actual time boxes without inventing an import door.

| Reader or visible door | Does the warning reach it? | What the walker should see or operate |
|---|---|---|
| **Exempt cockpit puck: SC SPARE, AVALON, BB** | Connected, but SC same-formation ownership is wrong—**F3** | Its own qualifying warning gives red ring/C. A warning belonging only to another seat does not. |
| **Exempt desk puck** | Connected through `exemptDeskOwn` | Only warnings naming that desk and person ring it. Check primary and extra people on week and Board. |
| **Ordinary cockpit and SC MAIN pucks** | Connected | Red ring/C, or amber/A for Meeting on SC MAIN. Tap/select and inspect the matching warning. |
| **Duty, OFT/AMT, ground and Common Programme pucks** | Connected through shared week/Board drawers | Ring and chip appear immediately; warning focus reaches the correct row, including extras/passengers. |
| **SANS card** | Connected to day severity/chip | An independent absence warning appears on its puck. The availability offer itself must not become an absence. |
| **Personal Inputs and Unavailable row pucks** | Connected | The person’s current warning is visible on scheduler copies; opening/editing the input follows existing permissions. |
| **Crew list’s puck copy** | Connected | Current day warning decoration appears. Distinguish this from the struck-name prediction for an armed seat. |
| **Armed crew list, desktop and phone drawer** | Connected through `slotBar` | Print the reason before placement. Placement remains allowed except existing hard refusals. |
| **Crew-list drag bubble** | Connected | Same prediction as the armed list; the actual destination determines the answer. |
| **Seat-to-seat drag bubble** | Connected, with source-seat removal passed into prediction | Describe the proposed move, not a duplicate assignment that will cease to exist. |
| **Drop toast** | Connected through newly raised warnings, then picker fallback | New warning is spoken after placement; existing/hidden warnings do not generate misleading duplicates. |
| **Edit Schedule warning list** | Connected | Correct sentence, severity, count and jump target. Hide/unhide works. |
| **Scheduler Board warning list** | Connected | Same result and usable jump, including phone layout. |
| **View-only Sched** | Connected to issued/working selection | Issued absences stay frozen; Working draft shows pending changes. Members cannot edit. |
| **👁 version look, week and Board** | Connected | Current version shows its proper warnings; older versions retain their recorded warnings and hides. |
| **Day-details window** | Connected | Count and warning lines agree with the document from which it opened; tapping a line reaches its cause. |
| **ALL AVAIL / ALL window** | Connected through `personWarnMsgs` | Put the affected man in the actual displayed crowd first. His row, reason, flagged count and tapped explanation agree. An absent man missing from the crowd proves nothing about this reader. |
| **Insights, every opening page** | Connected through `issuedWorld` | Latest issued copy per published day; working copy only for unpublished days. Hidden warnings excluded. D478 narrows D477 here. |
| **Logic** | New explanation present | Explain whole-day versus part-day and existing exceptions. The input matrix must not describe Upchit as an absence. |
| **Hidden warning** | Connected through shared hide filtering | Line remains struck/darker; its count and puck flag disappear. On a published day, hide/unhide waits for amendment. |
| **Published face** | Connected to frozen inputs/warnings | Absence changes remain pending. Do not apply the live crew-rest/qualification exception to absence warnings. |
| **Dedicated PDF and CSV exports** | **No warning reader, deliberately** | These export schedule content, not warning rings/lists. Confirm latest issued content and blank times; absence of a C chip here is not a defect. |
| **Printing the rendered schedule** | Inherits the rendered document | Inspect print preview separately: correct document, visible versus hidden flags, no working-copy leakage. |
| **Next-week peek** | Deliberately not a warning inspection surface | Navigate into the week before expecting its warning list or interactive explanation. |

For visible readers, walk desktop, phone and a short viewport. Include a selected puck, own-person fill, qualification chip, SANS stripe, amendment tag, OIL marking, red-box row, open crew drawer, and floating window. The warning must remain readable and its gesture reachable.

**2. Scenarios, ranked**

Use the demo week **13–19 July 2026**, admin `ad`. The internal person named `split` is displayed as **Vandal**; `bullet` is **Zulu**. Use those displayed names. Cobra’s seeded OL is Wednesday 15 July.

Use fresh app-created fixtures, and remove unrelated commitments through ordinary controls when isolation is needed. For medical scenarios, complete the app’s document/confirmation flow.

Gotcha labels:

- **Format:** people not following the expected format.
- **Missing:** missing input.
- **Error:** user mistakes.
- **Other page:** deletions or edits elsewhere.
- **Copies:** agreement between readers, versions and restored copies.

For every mutation below, observe the result, **Undo → observe → Redo → observe → reload → observe**. Also replay the fixture with a reload immediately after each intermediate state. Do not assume Undo history survives a new sign-in.

| ID / priority | Setup and action through the app | Expected result | Observation disproving it | Family |
|---|---|---|---|---|
| **S01 / high** | Add BB and its separately templated blank desk. File Vandal OL; place him in MAIN, SPARE and desk, testing each separately. Repeat with ATT B and LL. | OL flags all three; ATT B flags cockpits only; LL flags none. Correct own-seat rings. | Silent OL, ATT B desk warning, or LL standby warning after placement. | Missing, Copies |
| **S02 / high** | Add SC with blank hours. Make Vandal current for both shifts, file LL, seat him in MAIN and SPARE of the same formation. | MAIN flags LL; SPARE has no absence C/ring. | SPARE borrows MAIN’s C—**F3**. | Copies |
| **S03 / high** | Seat Vandal on a blank flying line and blank ordinary desk. File ATT C covering Mon–Wed; then file an Upchit effective Tuesday. | Tuesday’s downchit warning disappears from the working copy. Upchit raises no replacement absence warning. Monday remains down. | “Upchit clashes…” or “Upchit but tasked…”—**F1**. | Other page, Copies |
| **S04 / high** | File Vandal Training, Custom `00:00–23:59`, Tuesday. Put it on Ground Programme. Place him on another blank flying line, desk, sim and SC MAIN, separately. Compare with All day tick. | Whole-day commitment warns on each other checked seat; its own request row stays exempt. | Custom-hours version is silent while All day warns—**F2**. | Format, Copies |
| **S05 / high** | Repeat S04 with Meeting and `00:00–24:00`; move request to Unavailable, take it off, then accept it again. | SC MAIN keeps Meeting’s amber voice; ordinary seats get the ordinary conflict. Taken-off request is silent. Reaccept restores the correct answer. | Wrong severity, lost warning on Ground acceptance, or dormant request still flags. | Format, Other page |
| **S06 / high** | Publish a newly created blank assignment with no absence; sign again as needed, then file LL, OL or ATT C. | Working copy flags; issued face stays clean; pending rises and all four sign-offs become invalid. | Issued face changes immediately, or a real pending change retains valid sign-offs. | Other page, Copies |
| **S07 / high** | Publish the blank assignment with the absence already present. Delete, shorten or lift that absence. | Working warning changes; issued warning remains until amendment. Original remains unchanged after AL1. | Issued warning vanishes early, or old version adopts AL1’s answer. | Other page, Copies |
| **S08 / high** | Monday: Vandal flies `21:00–22:30`. Tuesday: SC MAIN, Zulu already seated, shift `13:00–19:00`, B `05:00`. Arm Vandal’s target; repeat crew-list drag and phone drawer. | “Crew rest—not clear until 12:30” before placement; corresponding breach after. | Only the placed warning appears. | Copies |
| **S09 / high** | Repeat S08 with both shift hours blank, retaining B `05:00`. | Known B still produces the prediction and placed breach. | Blank shift hours suppress it or produce a fictitious clock. | Missing |
| **S10 / high** | Repeat S08 targeting SC SPARE, then AVALON and BB. | No crew-rest prediction borrowed from MAIN. | Any borrowed rest reason or placed rest breach attributable to the exempt seat. | Copies |
| **S11 / high** | Tuesday SC ends `23:30`; Wednesday Vandal has an early flying report. A sibling occupies Tuesday MAIN. Inspect each pre-drop door before placing Vandal. | Forward reason names Wednesday and the leave-by time; placement agrees. | Backward-only checking, wrong day, or no forward warning. | Copies |
| **S12 / medium** | Add each AVALON cockpit and desk variant, then clear hours. Repeat S01’s types. Delete the AVALON wave. | Same absence matrix; desk survives wave deletion and retains its answer. | Missing desk check or wave deletion removes its independently created desk. | Missing, Error |
| **S13 / medium** | Add OFT row and AMT block. Put a wholly absent man separately in front, rear, passenger and extra slots, including any BRIEF/DEBRIEF person controls. | Every real placement is covered; no double count for one person on one row. | Main pair works but passenger, extra or another AMT row stays silent. | Missing |
| **S14 / medium** | Add ordinary duty, SC-linked duty, ground and Common Programme rows; test main person, crowd member and extras. | Same rule for every placement path; ATT B allowed on these non-flying tasks. | Only the primary seat is checked, or SC desk incorrectly inherits MAIN’s ATT B rule. | Missing, Copies |
| **S15 / medium** | File all-day Training and land it on Ground Programme. Add a second man with OL. Give the owner an independent ATT C record. | No self-request warning; second man’s OL and owner’s ATT C both appear. | Blanket source exemption silences independent absences, or source warns against itself. | Copies |
| **S16 / medium** | File each type in the matrix below against each seat family, first blank, then daytime timed, then blank again. | Exact matrix result, not merely “same before/after.” | Two equally wrong answers pass as agreement—especially Upchit. | Copies |
| **S17 / medium** | File a Mon–Wed all-day absence; place blank assignments Sunday, Monday, Tuesday, Wednesday and Thursday. | First/middle/last covered dates flag; neighbouring dates do not. | Off-by-one date or borrowed neighbour-day warning. | Error |
| **S18 / medium** | Repeat S17 with AM, PM, `00:01–23:59`, and `22:00–02:00`. | Blank seats stay silent; once timed, only genuine overlaps flag, including overnight tails. | Near-whole-day or overnight input treated as whole-day, or midnight tail lost. | Format, Missing |
| **S19 / medium** | On a blank row type only an end, then clear it; type only a start. Repeat ordinary row, sim and flying line. | End-only stays unmeasurable. Start-only follows that seat’s existing default: ordinary open-end, sim length, flying-time rules. | Guessed hours for end-only, or treating every missing end as an entirely blank seat. | Missing |
| **S20 / medium** | Paste accepted forms such as `0500`, `05:00`, `0500H` into SC B; compare. Then enter `12:90`, `25:00` and equal input start/end. | Equivalent accepted forms agree. Invalid values are refused/restored visibly; no silent time rollover. | Different rest answer for equivalent values, or a rejected value looks saved. | Format, Error |
| **S21 / medium** | Clear a sim label and duty role as well as their times; place someone on OL. | Complete fallback wording identifying “this row.” | “Sim ” or “ duty” occupies the missing name—**F4**. | Missing |
| **S22 / medium** | With an existing warning, CX the aircraft/formation/row; restore it. Toggle ground/programme info-only. | Assignment’s warning disappears and returns correctly; other assignments remain checked. | Ghost warning after exclusion or lost warning after restoration. | Error |
| **S23 / medium** | Try ALL and ALL AVAIL on every cockpit type through tap and drag; place them on blank non-cockpit rows. | Cockpits refuse; other legal seats accept without inventing an absent person; `?` opens its explanation. | Forbidden placement succeeds, refusal changes pending, or blank placeholder loses its door. | Error |
| **S24 / medium** | Try placing a man twice in a sim/crowd/extras row. Separately put him in both cockpit seats. | First is refused without a change; cockpit case retains its existing warning-only policy. | New absence logic bypasses refusal or silently changes cockpit policy. | Error |
| **S25 / medium** | While the blank seat is visible, file/edit/delete its absence from Inputs list, calendar and schedule input editor. Repeat approved leave creation/change/removal in Leave War and medical changes in Medical. | Every working reader refreshes; issued copy follows S06–S07. | Correct only after navigation/reload, or different pages disagree. | Other page |
| **S26 / medium** | With several days covered by ATT C, move the Upchit date; inspect before/on/after the new date. | Only dates whose actual fitness changed become different/pending. An unchanged earlier covered day stays unchanged. | Phantom pending on unaffected dates, or remaining medical period lost. | Other page, Copies |
| **S27 / medium** | File SANS Availability with Fly/OFT/AMT selected; seat the man blank, then timed; change offered event and hours. Add separate OL. | Offer never creates an absence warning. Existing SANS advisory remains separate; OL still flags. | SANS becomes `INPUT_FLY`, or the offer suppresses real OL. | Other page, Copies |
| **S28 / medium** | Hide the new warning, reload, change sign-in, unhide. Repeat across publication and amendment. | Counts and applicable rings follow hides; line stays inspectable; issued hide state freezes. | Hidden flag remains, hidden count remains, or hide leaks into issued copy early. | Copies |
| **S29 / medium** | Open ALL AVAIL on a later timed row containing the affected man; use a fresh full-day Course/Meeting conflict on his separate blank seat so the absence filter does not simply remove him from the crowd. | Affected row actually exists; warning text, flagged count and tap explanation agree. | Missing row is counted as a successful warning test, or visible row lacks its warning. | Copies |
| **S30 / medium** | Inspect issue counts in Insights from Edit Schedule, Board and View-only, with a pending absence addition/removal and hide. | All use latest issued version on published dates; unpublished dates use working copy. | Edit Schedule’s pending change alters Insights early. | Copies |
| **S31 / medium** | Save a new blank-seat plan/template/version. Add or remove an absence; restore each through its real control. Reorder rows/waves before restoring. | Warning follows person, date and restored seat; source request is not duplicated. Published template application stays refused. | Stale warning address, duplicate request, false pending on exact restoration. | Copies, Error |
| **S32 / medium** | SC sibling seated: B `12:29`, `12:30`, `12:31` against clearance `12:30`, shift starting `14:00`; then B `13:00` with shift starting `12:00`. | Strict earlier-than boundary; equal clears. An early shift start still wins over later B. | Equality warns, or later B hides an early shift start. | Error |
| **S33 / medium** | Early SC start `01:00`, B `23:00`, previous-day commitment ending late. Then clear B. | B resolves to the previous evening consistently; clearing restores shift-start behaviour. | Same-day interpretation or stale cached prediction. | Format, Copies |
| **S34 / medium** | Inspect empty MAIN, MAIN with only a SPARE occupant, MAIN with another MAIN occupant; remove/restore that sibling while the picker is armed. | B-specific prediction needs a usable MAIN sibling under the filed limitation; refreshes when sibling changes. Existing early-shift-start warning remains. | SPARE used as sibling, stale answer, or removal of the older shift-start check. | Missing, Copies |
| **S35 / medium** | Ask about Vandal’s held seat; move him within the same shift; move his sole previous-day late seat into Tuesday MAIN; repeat where another late assignment remains. | No fabricated self-conflict; source removal affects prediction only when he really leaves that commitment. | Prediction counts the departed seat or erases an assignment he still holds. | Error, Copies |
| **S36 / medium** | Combine OL, crew-rest breach and a qualification problem. Inspect every puck/list copy, then remove one cause at a time. | Chip priority may show only one chip, but all applicable list entries remain. Exempt seats still follow their own rules. | Higher-priority chip hides the absence from the list or removal clears unrelated warnings. | Copies |
| **S37 / medium** | Repeat reading as member and guest; member changes own input, then attempts another person’s input or a schedule edit. | Member’s own input works; prohibited writes do not. Guest has the existing read-only surface, including its intentional lack of inline warning/day-details doors. | Permission expansion, missing permitted view, or guest restriction mistaken for new regression. | Copies |
| **S38 / medium** | Print rendered schedule and use PDF/CSV before and after amendment; include a newly created blank line. | Correct issued content, valid blank cells; rendered-print flags follow its selected document. Dedicated exports remain without warning furniture. | Working changes exported as issued, malformed time, or hidden rendered flag printed. | Copies |

**Input type × seat oracle**

Each comma-separated type below is a separate case. “Other work” includes ordinary/SC-linked desks, AMT/OFT seats and passengers, ground/request rows, Common Programme and extras.

| Input type | Flying | SC MAIN | SC SPARE | AVALON/BB cockpit | Other work | AVALON/BB desk |
|---|---|---|---|---|---|---|
| LL, OIL, CCL, PL, FCL, EL, CL | Red leave | Red leave | Silent | Silent | Red leave | Silent |
| OL | Red leave | Red leave | Red leave | Red leave | Red leave | Red leave |
| HL, OML, ATT C | Red medical | Red medical | Red medical | Red medical | Red medical | Red medical |
| ATT B | Red medical | Red medical | Red medical | Red medical | Silent | Silent |
| OD | Red input | Red input | Red standby absence | Red standby absence | Red input | Red standby absence |
| Training, CSE, Fly with, Personal, Appointment, Duty, Other | Red input | Red input | Silent | Silent | Red input | Silent |
| Meeting | Red input | **Amber SHIFT_SOFT** | Silent | Silent | Red input | Silent |
| SANS Availability | No absence warning | No absence warning | No absence warning | No absence warning | No absence warning | No absence warning |
| Upchit | **Silent** | **Silent** | Silent | Silent | **Silent** | Silent |

This is the oracle for an **active whole-day input against a different assignment**, blank or timed within that day. Its own landed request is excluded.

Intentional differences:

- A part-day absence is silent against an unmeasurable seat, but flags a timed overlap.
- Timed overnight assignments can reach a neighbouring day’s absence; blank seats cannot.
- An accepted timed request may speak through its row instead of its input. That changes the warning’s source/code, not whether the conflict is detected.
- A start-only row has its existing assumed window; it is not a no-start row.
- The picker can strike a part-day absence before placement while the blank-seat warning list stays silent.

**Publication orders**

For **S = seat**, **F = file absence**, **P = first publication**, **A = amendment**, run every order with P before A:

`SFPA, FSPA, SPFA, FPSA, SPAF, FPAS, PSFA, PFSA, PSAF, PFAS, PASF, PAFS`.

Where A has nothing to publish, expect no spurious amendment. Repeat the complete set with **F replaced by lifting/deleting an initially present absence**.

At every step inspect working copy, issued face, pending list, four sign-offs, current-version look, older-version look and Insights. An isolated input change should contribute one change, not another merely because it creates a warning. Returning exactly to issued content should restore zero pending and the matching signatures. Publishing an amendment must not rewrite the original.

For the broader action-order requirement, use both orders of every pair drawn from:

**place/remove/move person; type/clear seat hours; type/clear SC B; file/edit/lift absence; accept/take off/move request to Unavailable; CX/restore; info-only on/off; MAIN/SPARE flip; hide/unhide; save/select plan; load version; publish/amend.**

Run each meaningful pair unpublished and published, with the reversal/reload protocol above. When a pair needs a prerequisite—such as removing before placing—start from a fixture containing the item. Record refused/no-op paths explicitly rather than silently omitting them. Templates get a separate published-day refusal case.

**3. The builder’s readings (a)–(e)**

| Reading | Assessment |
|---|---|
| **(a) Whole-day meaning** | **Sound**, with `00:00–24:00` also covering the day. `00:01–23:59`, AM/PM and overnight partial windows do not. Missing-half-record fallback is an existing defensive rule, not permission to inject malformed fixtures or pursue stored-demo-only defects. S17–S20. |
| **(b) Every applicable input type** | **Sound as an explicitly identified agent interpretation**, restricted to actual commitments. Upchit and SANS Availability are not absences. The current implementation violates this boundary for Upchit and misses accepted custom whole-day requests—F1/F2. |
| **(c) Own request stays exempt** | **Sound.** The blank-row source exclusion implements the central case. Test an independent absence and a second occupant so the exemption cannot become too broad. S15. |
| **(d) Missing seat name gets complete fallback wording** | **Wrong as implemented for unnamed sims/desks.** The prefix/suffix makes an empty name appear nonempty before fallback is considered—F4. |
| **(e) Picker unchanged** | **Sound within the stated scope.** Keep part-day/blank-seat and local-leave/blank-standby differences explicit. “Any absence” must not be widened to mean every activity input or an Upchit. The claimed backlog entry `[BLANK-STANDBY-STRIKE]` was not present in the backlog I read. |

**4. Findings in the working tree**

All four are reachable with newly created data. D56 does not exclude them.

**F1 — An Upchit can produce a fresh absence warning. Medium.**

- **Scenario:** S03. On the Upchit date, the newly cleared man acquires “Upchit clashes…” on a blank flying line or “Upchit but tasked…” on an ordinary blank row.
- **Cause:** [events.ts:30](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/engine/events.ts:30) excludes SANS but not Upchit. At lines 71–73, `inputFlags` rejects Upchit, but the accepted-row fallback returns true because an Upchit has no landed row. The official branch at lines 52–61 has the same fall-through; the cross-week bypass also admits it. Lines 475–482 then feed it into the new blank-seat checks.
- **Exact fix:** Exclude Upchit at the shared `inpShow` entry, alongside SANS, before the official, cross-week and accepted-row branches. Preserve the medical trimming action. Add explicit **empty-warning** assertions for a newly filed Upchit on blank and timed ordinary/SC MAIN assignments, working and freshly published, plus adjacent-week reads.
- **Test gap:** The new all-types test compares blank with timed results. It can pass when both are wrongly flagged.

**F2 — Accepting a custom whole-day request hides it from blank-seat checks. Medium.**

- **Scenario:** S04/S05. Training or Meeting entered as `00:00–23:59` or `00:00–24:00`, accepted onto Ground Programme, becomes silent against another blank assignment.
- **Cause:** [events.ts:71](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/engine/events.ts:71) defers a request with `allday:false` to its landed row. The new checks at lines 475–482 read that already-deferred list. The landed row has hours, but overlap with the other assignment’s missing hours cannot supply the promised warning.
- **Exact fix:** Keep the existing timed-event deferral. Separately obtain active whole-day candidates for **unmeasurable targets**, preserving frozen-date/filing selection, dormancy, marker exclusions and own-source exclusion. Use those candidates for blank flying lines, blank SC MAIN and collected blank rows. Do not globally re-enable accepted inputs, which would duplicate ordinary timed conflicts. Add S04/S05 before-and-after-acceptance tests and own-row negative controls.
- **Required result:** Changing only All day tick to equivalent full-day clock hours must not remove protection.

**F3 — An SC SPARE puck borrows MAIN’s absence ring. Low–medium.**

- **Scenario:** S02. Same man, same SC formation, blank MAIN and SPARE, whole-day LL. MAIN rightly warns; SPARE’s local-leave exemption should leave that puck clear of this warning.
- **Cause:** [html.ts:610](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/ui/html.ts:610), especially lines 622–623, treats any warning anchored anywhere in the formation as belonging to the exempt aircraft. The new MAIN absence warning therefore lights SPARE too. Week and Board share this reader.
- **Exact fix:** For SC SPARE absence decoration, distinguish the formation-level **SPARE absence warning** from MAIN’s seat-level absence warning. Accept the former; do not accept a MAIN seat key merely because it shares the formation prefix. Preserve qualification and two-place warning matching. Pin both week and Board, blank and timed, plus OL/ATT C positive controls and hide/unhide.
- This is an existing ownership weakness reached by the new blank-seat warning, not stored-data harm.

**F4 — Empty sim/duty names bypass the promised fallback. Low.**

- **Scenario:** S21.
- **Cause:** [events.ts:387](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/engine/events.ts:387) constructs `'Sim '+s.label`; duty collection similarly appends `' duty'`. [validate.ts:838](C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/src/engine/validate.ts:838) then considers those strings nonempty.
- **Exact fix:** Test the trimmed underlying label/role before adding its prefix/suffix. Supply the agreed “this row” fallback when absent, consistently in timed and blank branches. Add real `+ Row` fixtures with untouched empty names; existing wording tests use named rows.

**5. The owed read of D605**

**The short line preserves the ruling’s meaning.** Removing “NOT YET BUILT” changes a status statement, not the requirement. It retains whole-day, anywhere and part-day silence.

Reading **(6)** identifies the wider activity-input scope as the agent’s interpretation and leaves it open to the owner to narrow. That distinction is important and currently preserved. It must not be used to include Upchit or SANS Availability.

Reading **(7)** accurately records the deliberate picker/blank-seat difference, but its claim that `[BLANK-STANDBY-STRIKE]` is **filed** is unsupported by the current backlog. The builder should file it or correct that status. Likewise, “told to him in its report” should describe an actually delivered report, not a future closing step.

The full row’s **“BUILT … not yet merged”** does not establish correctness or completion; F1–F4 and the running-app walk remain outstanding.

**6. Explicit negatives**

By source inspection, I found no additional missing top-level seat collector. The new blank-row collection stays separate from timed events, so it does not itself invent busy hours, work hours or OIL entitlement.

I found no new change making absence warnings live on an issued face. The frozen-input and issued-warning routes remain present. That is not a substitute for S06–S07 and the publication orders.

The SC prediction change retains the shared rest calculation, adds shift siblings, and explicitly excludes SPARE/AVALON/BB. I found no separate arithmetic defect in that change. Empty-formation B prediction remains the filed limitation; the older shift-start warning must remain available.

I did not treat dedicated exports’ lack of warning furniture, guest-only door restrictions, existing specialised crew-rest ring omissions, or old stored-demo compatibility as new findings.

**Walk: NOT RUN — scenario design and source inspection only, as instructed.**  
**Checks: no tests, build, server or file changes performed.**  
**Rulings: none this session.**

