# Scenarios for the rules check's small batch — Astra (15 Nov 26)

Astra (`codex exec -m gpt-6-astra`, reasoning high, read-only, from the repository root), one round, brief `2026-11-15-rules-check-batch2-scenarios-brief.md`, on branch `claude/rules-check-batch2` at `508485276` (app code as at `cc2eefa50`); finished 15 Nov 26 01:04. His final message, whole:

This is the complete scenario-design report. **The main gaps are separate warning routes and states, rather than additional check-name builders.** The walk should start with the day-details window, ALL AVAIL, “Tight turning”, and the Sunday-to-Monday boundary.

I read the brief, plan, evidence sheet, applicable rulings and source changes. This was a read-only review: I ran no application walk or tests, changed no files, and made no commit or push. The scenarios below are proposed checks, not recorded passes.

**1. Roll-call gaps and corrections**

Source locations below are within `raptor-port/src`.

| Surface or state | Addition or correction to the roll-call | Source location |
|---|---|---|
| Day-details window, opened from the day’s `?` | Give this its own row. It prints severity, check name and full message, and chooses the document currently being viewed. The sheet’s reference to `html.ts` near 2606 identifies this window, not the ordinary View-only warning list. | `ui/html.ts:2544`, `ui/html.ts:2606`; `ui/Modals.tsx:23` |
| Hidden versus “goes away once signed” | These are different states. Hidden warnings use the ordinary warning row and retain their message. The separate struck “goes away once signed” row must also show the renamed check. The sheet currently identifies that second builder as the hidden-warning builder. | `ui/html.ts:1201`, `ui/html.ts:1221` |
| Amber “Tight turning” | This uses the changed crew-rest sentence too. A red crew-rest breach does not exercise this branch. Include its list entry, chip, board and day-details rendering. | `engine/validate.ts:720`, `engine/validate.ts:733` |
| ALL / ALL AVAIL window | Its per-person reason can display the full warning message, and its title also carries a message. This is a separate consumer omitted from the sheet. Avoid another, stronger warning masking the intended reason. | `ui/html.ts:891`; `ui/AvailWindow.tsx:145`, `:170`, `:190`, `:314` |
| Previous day’s full explanation | Separate the full “Breaks Tuesday/Monday” explanation from the puck’s short title. The former carries the changed sentence; the latter is a shorter leave-by explanation. | `ui/html.ts:1048`, `:1118`; puck title at `:476` |
| Sunday trace, next-week preview, loaded Monday | Split the combined peek/phantom row into three observations. The preview itself deliberately draws plain tasking. Sunday’s forward explanation and Monday’s own warning are the places to inspect the sentence. | `ui/peek.ts:257`, `:318`; `engine/weekctx.ts`; `ui/html.ts:1048` |
| Current and older published-version eyes | Exercise both the week and board eyes, and open day details while each is shown. Current published warnings and an older version’s recorded warnings are different states. | `ui/html.ts`, `withVersionWarn` / `withDaySnap`; `ui/board.ts`, `boardWarnHTML`; `ui/Modals.tsx:49` |
| Logic search and filters | Finding the renamed checks through search is a separate route from scrolling to them. Include “planned”, fired checks and severity filters, then clear the filters. | `ui/LogicPage.tsx:100`; `ui/logic-html.ts:92` |
| Pending changes and Undo feedback | Pending rows and hide/restore feedback use the warning’s own message. Inspect their words and destinations, without requiring a check-name heading where none exists. | `ui/pendlist.ts:320`, `:412`; `ui/interactions.ts:1840` |
| OIL outside the working board | Add the published puck’s OIL mark/title, current-version eye, Leave War credited entry and OIL balance/detail. These must agree about which version has actually paid. | `ui/html.ts:573`, `:685`; `ui/SchedBoard.tsx:697`; `ui/pendlist.ts:529`; Leave War’s credited-OIL readers |

Two corrections to the sheet’s expected results matter:

- **Board:** ordinary leave/downchit warnings have their own message, which the board prints first. “On leave but tasked — BRIEFING” is valid there. D2009 does not require adding a second heading or replacing that sentence. Where a surface names the check, it must use “planned”.
- **Preview and titles:** do not demand the full new crew-rest sentence in the plain next-week preview, a short picker reason or the puck’s short title. Check that these agree with the full explanation and never falsely describe a borrowed take-off as a landing.

The roll-call should cover these qualifying objects and routes:

| Dimension | Required coverage |
|---|---|
| Planned work | Flying seats; SC MAIN and SPARE where the particular restriction applies; AVALON/BB where applicable; simulator crew and additional people; ground/briefing rows; common-programme people; accepted duty inputs. |
| Absence or restriction | Whole-day leave; a timed absence overlapping the task; a timed absence outside it; a downchit that actually prohibits the chosen task. Use ATT C for the briefing example rather than assuming ATT B prohibits ground work. |
| Crew-rest source | Flight with blank, TBD or typed landing; flying SC; duty input; another later commitment superseding the flight; removal/Undo revealing the flight again. |
| Document | Unpublished working day; published day without pending work; working amendment; current published eye; older published eye; View-only. |
| Person and device | Admin scheduler; Ranger as a member; desktop and 402px phone. A member is never assigned scheduler actions. |
| Writers and readers | Inputs filing/editing; board time and crew edits; Logic changes/reset; hide/restore/Undo; signing and publishing; week, board, day details, Insights, ALL AVAIL and Leave War. |

**2. Ranked scenarios**

Use fresh dates and newly created tasking. Keep unrelated commitments away from the chosen people unless a scenario explicitly introduces one. Make setup through the app’s controls wherever possible.

For the clock examples below, first verify the controls show 12 hours’ crew rest, two hours’ debrief, three hours’ default rally and a 2h20 briefing lead. These are scenario premises, not assumptions to leave unverified.

For every observation, capture the visible result and operate its real control. A matching hidden element or stored string is not proof.

**1 — Day details follows the document actually on screen**

- **Setup:** Create one leave/briefing warning, one downchit/briefing warning and a separate blank-landing crew-rest breach. Publish the relevant day, then make a working amendment that changes a warning.
- **Action:** Open the day’s `?` from Edit Schedule, View-only, the current-version eye and an older-version eye. Repeat from the board wherever that door is offered.
- **EXPECTED:** Check names use “planned”; full messages match the document beside the window. Current published crew-rest warnings use the live published view; an older version remains its recorded document. Opening the window creates no pending change. Sources: D2009, D183/D184, D187; `Modals.tsx`’s displayed-document selection.
- **Disproof:** The window shows working tasking beside a published face, disagrees with the adjacent warning, uses an old check name, or opening it changes the day.
- Exercise any offered warning jump and record its destination; do not count a readable but unusable row as a successful gesture.

**2 — ALL / ALL AVAIL exposes the full reason**

- **Setup:** Give Ranger the isolated blank-landing breach described in scenario 7. Add a later event with an ALL placeholder so he remains in the displayed population without a competing clash masking the crew-rest reason.
- **Action:** Open its count window from the week and board. Find Ranger, inspect the reason and desktop title, and tap him with OIL Earn off. Repeat with TBD and on View-only.
- **EXPECTED:** Wherever the full crew-rest reason is shown, it contains the same no-landing explanation as the day’s warning. Its figures agree. The phone keeps the reason readable. A normal puck tap highlights the person; it does not change tasking. Sources: D2010/D1990; `personWarnMsgs`; the ALL AVAIL contract, including D40 and D65.
- **Disproof:** This window alone says “landed”, shows stale times, reads the working amendment beside issued tasking, loses the reason on a phone, or writes while merely inspecting.
- If another reason wins priority, **RECORD exactly what it says**, remove that competing condition through the app, and repeat.

**3 — Amber “Tight turning” uses the same honest explanation**

- **Setup:** Monday flight: take-off 12:00, landing blank. Tuesday flight: take-off 04:30, landing 05:30, with no typed report/briefing override. Verify Tuesday’s briefing is 02:10 and nominal rally is 01:30.
- **Action:** Read Tuesday’s amber warning, board entry and day details; repeat with Monday’s landing TBD, then 12:30.
- **EXPECTED:** Blank/TBD gives Monday’s assumed end 14:00 and clearance 02:00. The amber sentence says “took off … with no landing typed”. A typed landing uses “landed” and recalculates the clearance. The amber case is not painted as a red breach merely to expose the sentence. Sources: D2010/D1990; `validate.ts`’s `CREW_TIGHT` branch.
- **Disproof:** Only the red warning received the wording change, or the amber message and its own times disagree.

**4 — Sunday to Monday: three observations, two document choices**

- **Setup:** On adjacent fresh weeks, create Sunday take-off 12:00 with blank landing and Monday take-off 04:00, landing 05:00. Save both through normal controls.
- **Action:** While viewing Sunday’s week, inspect its “Breaks Monday” explanation and short puck title. Inspect the desktop next-week preview, then open Monday’s week and read Monday’s warning. Repeat with TBD.
- **EXPECTED:** Sunday’s full explanation and loaded Monday’s warning agree on take-off 12:00, assumed end 14:00 and clearance 02:00. The preview remains plain tasking. Sources: D2010/D1990; D1010; the preview and trace builders.
- **Orders:** Create Monday first, then Sunday; repeat by creating Sunday first. Reload and enter through Monday’s week. Publish both days, make an unissued Sunday change, and repeat Edit versus View-only.
- **EXPECTED:** Edit and View-only use their respective working/issued neighbours. Merely changing the live warning does not make a published day pending. Sources: D183/D184, D1010.
- **Disproof:** One entry order misses the warning; Sunday and Monday disagree within the same document choice; or View-only uses an unissued neighbour.
- On a phone, use ordinary week navigation; absence of the desktop preview is not a failure.

**5 — Published names, current eyes and older eyes**

- **Setup:** Publish fresh days containing both renamed warnings and a blank-landing crew-rest warning. Create an amendment and publish it so there are two versions.
- **Action:** Inspect View-only, the current and older eyes on the week and board, and each available day-details window. Reload and repeat as Ranger.
- **EXPECTED:** Every actual check-name heading uses “planned”. Ordinary warning messages remain unchanged. The current published view has its live crew-rest explanation; the older eye shows the warnings belonging to that version. Sources: D2009, D183/D184, D187.
- **Disproof:** The older eye borrows the working amendment; the current eye omits a warning shown by View-only; or the member sees different published content.
- For the separate “batch alone makes nothing pending” claim, the host should use a fresh control fixture created during this check and compare before/after without editing it. No pending item or lost signature may arise solely from these wording changes. Do not turn this into an old-demo migration exercise.

**6 — The published OIL Saturday, end to end**

- **Setup:** In a fresh active Leave War period, use Bane on Saturday with take-off 12:00, landing 13:00 and no typed rally/in-time. Verify the default rally gives 09:00 and debrief gives 15:00: six hours. Set “Full day of OIL” to 6h01, collect all four sign-offs and publish. Confirm the credited amount is HO.
- **Action:** Change only “Full day of OIL” to five hours.
- **EXPECTED:** Saturday reads **“1 pending”**, all four sign-offs fall, working OIL Earn gives FO, and the published OIL and Leave War credit remain HO. Sources: D2044’s exact worked case; D592(4), D103.
- Open the pending list. It must explain the changed OIL setting and the comparison with published OIL. Check the person, old/new value and amount; **RECORD exactly what it says**, rather than inventing punctuation.
- Inspect View-only, the current-version eye, published puck/title, Leave War entry and OIL detail/balance. These must agree that only HO has been credited.
- **Action:** Restore 6h01 before republishing.
- **EXPECTED:** With no other change, pending clears and the signatures return. Sources: D103; D592’s recorded build readings.
- **Action:** Set five hours again, sign and publish the amendment; reload.
- **EXPECTED:** FO replaces the issued HO, pending clears, and the Leave War reflects the extra half-day once, without a duplicate award. Sources: D2044/D592.
- **Disproof:** Credit moves before publication, working OIL remains HO, signatures survive the material change, reversion leaves a false pending item, or publication credits twice.

**7 — Blank → typed landing → TBD, within one week**

- **Setup:** Monday take-off 12:00, landing blank; Tuesday take-off 04:00, landing 05:00. Keep report/briefing overrides empty.
- **Action:** Read Tuesday’s warning and Monday’s full forward explanation. Type Monday landing 12:30; then replace it with TBD. Repeat after leaving the day and after reload.
- **EXPECTED:** Blank: “took off 12:00 with no landing typed”, assumed end 14:00, clear 02:00. Typed 12:30: “landed 12:30”, end 14:30, clear 02:30. TBD returns to the blank calculation and wording. Sources: D2010/D1990.
- Compare week, board, day details and the previous-day explanation after each step.
- Repeat with an explicit valid report/briefing time on Monday: having that time must not turn an untyped landing into a real landing.
- **Disproof:** Stale wording survives an edit/reload; TBD differs from blank; or one surface changes its sentence without changing the corresponding figures.

**8 — The latest commitment wins; its kind does not leak**

- **Setup:** First use a flying SC line ending 14:00 as Monday’s last commitment, then an accepted duty input ending 14:00. Keep Tuesday’s early flight.
- **Action:** Inspect the crew-rest warning for each. Next add a blank-landing flight ending earlier than the duty; remove the later duty and Undo.
- **EXPECTED:** The SC/duty case says “ended”, with no invented landing or flight debrief. When the flight becomes the final commitment, its no-landing explanation returns; Undo restores the duty explanation. Sources: D2010’s scope and the existing event-kind selection in `validate.ts`/`events.ts`.
- Repeat the replacement order in reverse; include a later ground or simulator commitment where supported.
- **Disproof:** A preceding flight leaves “took off” attached to a duty, a real flight inherits “ended” incorrectly, or input removal leaves stale source/day/time information.

**9 — “Planned” is true on every qualifying row**

- **Setup:** File Ranger’s whole-day leave through Inputs. As admin, place him on a 09:00–10:00 BRIEFING row. Separately create an applicable downchit and equivalent tasking for another person.
- **Action:** Read the week, day details, board, Insights and Logic. Then exercise the planned-work families in the inventory above, one at a time.
- **EXPECTED:** Every surface naming the check uses “On leave + planned” or “Downchit + planned”. The task-specific message stays appropriate to the row, including “On leave but tasked — BRIEFING”. Source: D2009’s full row.
- Include whole-day records without times, timed overlap and timed non-overlap. Use task-appropriate restrictions; ATT B on permissible ground work is a negative control, not an expected downchit warning.
- **Disproof:** A qualifying row lacks its warning, a name still says “flying”, or changing the label also changes the warning’s meaning.
- For row-specific wording without an explicit contractual sentence, **RECORD exactly what it says** and compare the same warning across surfaces.

**10 — Hidden warnings and “goes away once signed”**

- **Setup:** On an unpublished day, create one warning of each renamed kind.
- **Action:** Hide one from the week, inspect the board and day details, Undo, then hide from the board and restore through the offered Reset arrow. Hide both and reload.
- **EXPECTED:** Hidden rows remain struck and subdued, with the new names wherever names are drawn. Counts and puck flags exclude them. The list remains reachable when every warning is hidden. Undo restores the preceding state. Sources: D469, D472, D475.
- **Published order:** Publish with the warning visible; hide it in the working copy. Inspect pending, signatures, View-only and Insights before and after publishing the amendment.
- **EXPECTED:** Hiding is pending; the issued warning remains until the amendment. Sources: D471, D478.
- **Distinct state:** On a fresh published warning, remove its cause in the working copy rather than hiding it. Inspect the “goes away once signed” row.
- **EXPECTED:** Its check name also says “planned”; it must not masquerade as a hidden warning with a restore control. Sources: D2009 and the separate gone-warning builder.
- **Disproof:** A hide affects only one view, Undo fails, a member can restore it, or the two struck states are confused.

**11 — Published rules: held values versus the next amendment**

- **Setup:** Publish a day close to a crew-rest threshold. Record its warning, printed briefing time, signatures and OIL, if any.
- **Action:** Change a non-OIL check setting so the working calculation would differ. Inspect the published day; then make a genuine pending schedule change and inspect working versus issued views.
- **EXPECTED:** A published day with nothing pending retains its kept check settings. Once an amendment waits, its working checks use today’s settings; its issued document stays issued. Sources: D2005/D2013.
- Keep the crew-rest neighbour case in this scenario: its live information is still assessed under the target published day’s kept rules. Sources: D183/D184.
- Inspect a default-briefing change separately: the printed-B rule is governed by D186, not a blanket expectation that all Logic edits leave pending untouched.
- **Disproof:** The new banner accompanies behaviour that silently rewrites the issued document, or a wording-only change creates a pending warning replacement.

**12 — OIL settings: no effect, changed times, and reversed order**

- **Setup:** Reuse separate fresh Saturdays with known published OIL; keep this independent of scenario 6’s state.
- **Action A:** Change a threshold without changing anyone’s amount or stored worked times.
- **EXPECTED:** No OIL pending item and no lost signatures. Source: D592’s recorded reading (8).
- **Action B:** Change default rally or debrief so stored worked times change while the amount remains FO.
- **EXPECTED:** Pending and lost signatures still occur; issued credit remains held until republished. Sources: D592 reading (8), D2044.
- **Action C:** Set the desired value before first publication, then sign and publish.
- **EXPECTED:** The first publication uses that value, with no leftover “setting changed since publication” item.
- **Disproof:** Only amount changes are recognised, an irrelevant change creates pending, or the order of setting and publishing leaves stale state.

**13 — Logic: one, two, reset, search and member**

- **Setup:** Start with standard settings. As admin, change one setting read by a check, then a second.
- **Action:** Read the entire strip at desktop and 402px. Search “planned”; exercise fired/severity filters and clear them. Use Reset to standard, including once while the last edited box still has focus.
- **EXPECTED:** Singular/plural reads “1 setting … it” and “2 settings … them”. The note reads:

  > A published day keeps the settings it was published under, and the OIL they gave it, until it is published again. If a changed OIL setting would change that OIL, the day reads pending.

- Reset removes the changed-settings strip when the relevant settings are standard. The new check names remain findable. Sources: D2015; `LogicPage.tsx` and `lgChkName`.
- Sign in as Ranger with changed settings still present.
- **EXPECTED:** The same note is readable, followed by “Only an admin can change them.” Editing controls are unavailable.
- **Disproof:** Grammar changes incorrectly, the phone cuts essential words, search retains the old name, Reset leaves a stale strip, or member controls allow editing.
- Do not use a purely descriptive wording setting as the sole trigger for a strip intended to count check settings.

**14 — Insights, exports and notification boundaries**

- **Setup:** Keep a small known warning population, including a published day with a different working amendment.
- **Action:** Open Insights from each offered door, including the phone menu. Compare its by-type names and counts with the appropriate days; hide and republish as in scenario 10.
- **EXPECTED:** Names use “planned”; published-day warning counts follow the published document and its published hides. Sources: D2009, D478.
- Do not require unrelated work-hours statistics to freeze identically: D482 gives those their own rule.
- Use the normal schedule CSV and print doors. Inspect the exported tasking and published briefing time against the issued document.
- **EXPECTED:** No new warning section is required in those exports; their current builders export tasking rather than the warning list. Source: `ui/export.ts`, `ui/printpdf.ts`; D186 for the published briefing time.
- Inspect any ordinary notification generated by the input round. **RECORD exactly what it says.** A new crew-rest/check-name notification is not promised by this batch.
- **Disproof:** An existing downstream reader disagrees about the issued tasking or counts, or an actual displayed check name retains the old wording.

**3. Plain-user round — complete tasks without shortcuts**

Run this once on desktop and once at 402px, using the normal menus and buttons.

1. Sign in as Ranger. File leave through Inputs and verify it appears there and on the Leave War.
2. Sign in as the admin. Put Ranger on BRIEFING. Open the warning, identify Ranger and the affected row, then inspect the board, day details, Insights and Logic.
3. Hide the warning. Verify its count and puck change while the struck line remains reachable. Press Undo and verify the original state returns.
4. Enter Monday’s take-off with no landing. Enter Tuesday’s early flight. Follow Tuesday’s warning back to Monday’s cause.
5. Type Monday’s landing, then TBD. After each, read the full sentence and times in both directions and on the board.
6. Publish the applicable day, inspect it as Ranger, and repeat the relevant read through the current-version eye.
7. Complete the Saturday OIL round: publish HO, change the threshold, inspect pending and retained credit, then republish FO and verify the Leave War.
8. Leave the affected pages and return; reload at the important saved states. Confirm the result remains reachable without relying on an already-open window.

For **every window actually opened**, test each offered Close/Done and × independently, Escape, and an outside tap. Record absent controls as absent rather than substituting a hidden button.

Closing expectations differ:

| Window or state | Expected close behaviour and source |
|---|---|
| Day details | Close, ×, Escape and an outside tap dismiss it; the underlying day remains unchanged. `ui/Modals.tsx`, `DayPop`. |
| ALL / ALL AVAIL | Outside tapping leaves it open. Its close control and front-window Escape work; page/week changes dismiss it. ALL AVAIL contract, D641. |
| Input editor, nothing unsaved | Its normal close controls work; outside tapping does not dismiss this floating window. Input-window contract. |
| Input editor, unsaved words | ×/Escape invoke the existing discard-or-keep question. Escape on that question keeps editing. Cancel follows its separate contract. D1622 and the input-window contract. |
| Board, time box being edited | First Escape restores/leaves the box; the next closes the board when nothing is above it. With another window above, only that window answers first. “Closing the board” contract. |
| Insights, picker, pending list and other windows reached | Test all offered doors against their own contract. Where this report has not established exact behaviour, **RECORD exactly what it says/does**; do not assume every outside tap must close. |

Also inspect the longest warning on the phone, scroll its own list to the end, and prove the close/hide/restore controls remain visible and pressable. A picture at the top of an open list is insufficient.

The already-filed changes-window Escape issue should be recorded under its existing backlog item if reproduced, not presented as a new discovery.

**4. Explicit negatives**

These are source-inspection negatives, not runtime passes:

- I checked production `WCODE` consumers and found no fifth check-name builder beyond the warning HTML, board, Insights and Logic families. There are additional routes and states within those families, listed above.
- I checked the board’s warning text and found no requirement for ordinary message-bearing warnings to print a separate check-name heading.
- I checked the next-week preview and found no full warning-list renderer there. Its plain appearance is intentional; Sunday’s trace and loaded Monday still need checking.
- I checked puck titles and picker reasons and found shorter explanations rather than another copy of the full landing sentence. Their agreement matters; exact duplication is not required.
- I checked the schedule CSV and print builders and found no warning-name or full crew-rest-message output to rename.
- I checked the notification wording path and found no consumer of these check names or the crew-rest sentence.
- I checked the source diff and found no OIL calculation change in this batch; the OIL-related changes are comments. The Saturday walk remains necessary evidence for the approved explanation.
- I checked the backlog before treating gaps as new. The first-person predictive-rest-hint limitation, some published-title/settings differences, changes-window Escape behaviour, actual-iPhone Logic focus issue and queued IT-flow pictures already have records.
- I found no reason to design a non-admin scheduler, repair old stored demo records, or reopen D2044’s settled choice.

**5. Owner decisions**

**No new owner decision is needed to run these scenarios.** D2044 settles the OIL behaviour; the board’s existing message-first presentation does not itself require a new design decision.

One wording question may remain for the final look, after the walk supplies its picture: in scenario 12, OIL stays **FO → FO**, but its recorded worked times change and the day becomes pending. Does “would change that OIL” explain that clearly enough? D2015 leaves the finished words his to change. Present that concrete case with the picture; do not treat it as authority to alter the approved behaviour.

Rulings: none this session.

