# OIL work-start: scenario-design report

**The walk should proceed at FULL tier. This is a read-only scenario design, not a runtime pass or approval.** I changed nothing, ran no tests and started no server.

I found three concrete problems worth carrying into the walk:

1. The OIL tracker prints only the first worked period.
2. The Unpublish warning assumes the whole day’s credit disappears, even when withdrawing an amendment restores a paying earlier version.
3. The Logic page describes default-off work as unable to earn OIL.

The main calculation and the issued-day readers I traced use the new reporting times and saved Logic values. Their correctness still needs the running-app checks below.

## 1. Roll-call

### Reading conventions

- **Working:** the editable candidate uses today’s content and Logic values. It does not pay until issued.
- **Issued:** View-only Sched uses the selected issued version’s content, membership, decisions and saved Logic values.
- **Older eye:** an older-version preview uses that version’s values. Merely looking at it never changes the current Leave War credit.
- **Paid:** Leave War and the tracker follow the latest surviving issued version, regardless of which version someone previews.
- **Permissions:** existing member and guest read access stays unchanged. Read-only surfaces must not expose reporting, Logic, OIL-switch or publication mutations. A member’s own request editor remains a separate permitted writer.

### (i) Every display and downstream reader

| Place | What feeds it | Promise 1: reporting-time result | Promise 2: issued result and working gesture |
|---|---|---|---|
| **OIL tracker credit row** | Landed credit; `leavewar/engine/oiltracker.ts` → `OilTracker.tsx` | Correct HO/FO amount and **every** worked period. First-to-last determines the amount; separated periods remain distinguishable. | Held until another version is issued. Opening an older eye must not replace the paying credit. **Finding F1:** only the first period is rendered. |
| **OIL tracker balance and allocation of takes** | Tracker ledger, policy, expiry and FIFO | Exactly +0.5 for HO or +1 for FO, once per person/date; never one award per event. | Rule edits do not change the issued contribution. Amendment replaces it; withdrawal uses the surviving version, if any. |
| **Leave War day sheet / credit details** | Stored credit and its worked periods; `BidPicker.tsx` | Shows the correct amount and all stored “worked” periods. | Reads the landed record, not today’s rules. Read-only details must agree with editable details. |
| **Leave War day list** | Stored records; `DayList.tsx` | Same periods and amount as the sheet and tracker. | Holds during pending edits; changes on issue. |
| **Leave War grid FO/HO cell** | `desiredOilCells` → credit reconciliation | Correct code for the whole person-day. | No live-rule drift, duplicate credit or silent replacement of a conflicting manual record. |
| **Leave War clash strip / same-day absence comparison** | Stored worked periods and leave/bid records | Uses the periods actually recorded, including a changed end time even when FO remains FO. | A candidate’s longer work must not rewrite the issued credit before amendment. On issue, any new clash is exposed rather than silently overwriting leave. |
| **Board crew pucks and green edges** | `ui/oilmode.ts`, the day’s OIL evidence and figures | Includes each qualifying person and the correct default/override. | Working face uses the candidate; issued and older faces use their own evidence. Looking is not an OIL decision. |
| **Week-view crew pucks and green edges** | Same OIL helpers through the week renderer | Same answer as the board, including less-used seat types. | Must not leak working rules into View-only Sched or older previews. |
| **OIL Earn figures, person switches and row switches** | `oilDayFigures`, eligibility/default readers and OIL decisions | Correct whole-day amount; each measurable seat has its proper switch/default. | Admin working-copy controls only. Issued figures, wherever displayed, stay frozen; no live switches on previews or member/guest views. |
| **ALL / ALL AVAIL window: “Who earns OIL”** | `AvailWindow.tsx`, contextual day/version, frozen membership and OIL figures | Each member gets their own whole-day answer, not the row’s amount copied to everyone. | Issued membership and figures stay fixed. The editing half exists only in its permitted OIL Earn context. |
| **ALL / ALL AVAIL availability half** | Availability calculation for that event | Availability is not itself an OIL award. An open-ended row may have an availability result while offering no OIL credit. | Version context must stay consistent when switching views or opening another window. |
| **Day OIL advisories and refusal explanations** | Candidate evidence, eligibility and warnings | Missing times, zero measurable work, cancellation and information-only rows have intelligible reasons. Reporting warnings do not silently invent times. | Working advisories concern the candidate. They must not imply that pending candidate credit has already landed. |
| **Publish-time OIL reminder / toast** | `oilWouldEarn` and publication result | Recognises actual candidate earnings, including entered reports and opted-in exempt work. | Says what publication did. A day outside any Leave War period must not claim that a credit landed. |
| **Unpublish warning and completion message** | `oilCreditBidAgainst`, publication history and UI handler | Uses the real tracker consequence. | ORIGINAL withdrawal can remove the credit; AL withdrawal can restore an earlier credit. **Finding F2:** the warning currently models removal only. |
| **Pending counts: board, week, day controls and publication controls** | `dayPendingItems` and version context | Reporting content edits appear through the ordinary pending system. | A consequential Logic edit adds one separate OIL item. All current-day counts agree. Older-preview count behaviour has an existing filed issue; do not mistake its count for that older version’s OIL. |
| **To go out list** | `ui/pendlist.ts`, including `oilRuleWords` | Reporting edits remain identifiable as content changes. | Names changed settings and each affected person’s old/new amount or worked periods. Reverting clears the OIL item. The setting is changed back on Logic; this entry has no fictional schedule-cell target. |
| **Amendments panel** | Issued versions, pending items and stored amendment deltas | Records which version was issued after the reporting edit. | Shows the OIL pending item/count and subsequent issue. Withdrawing an AL must reveal the prior issued version. |
| **Change history** | Recorded edit history, not the entire settings journal | Reporting edits should retain their ordinary history. | Do not invent a historical Logic entry or actor. Missing per-page Logic history is already filed as `[HIST-PER-PAGE]`; the current pending explanation is still required. |
| **Logic page text and values** | `logic-html.ts`, current rule values | Explains entered report, fallback, first-to-last and the six-hour-one-minute boundary. | Explains issued values holding until reissue. Default-off seats must be described as switchable. **Finding F3:** some prose still says they never earn. |
| **CSV / print** | `ui/export.ts`, published-day selection and existing export fields | Existing exported schedule fields must describe the chosen export’s content accurately. | Published export uses the latest issued content. These exports do not currently promise an OIL ledger, green edges or every reporting line; absence of such columns is not this feature’s defect. |
| **Four sign-offs** | Candidate binding, including saved signing-time OIL values | A signature binds the candidate record the signer saw. | Consequential later Logic changes invalidate it; restoration revives it where the rest of the binding still matches. Issued credit remains separate. |
| **Work-hours bar, long-day warnings and Insights** | Their own reporting/work-hours rules | Useful comparisons, but not universal OIL oracles: without entered reporting, their boundaries can differ from OIL. | Insights may move immediately under D482. That does not authorise an issued OIL record to move. |

### (ii) Every writer, door and qualifying object

| Door or object | States / place it exists | What should happen |
|---|---|---|
| **+ In-time / Rally — week** | Admin editable ordinary wave | With no resolved report, insert the nominal report clock plus configured words. With a resolved report, reuse it. No usable take-off: do not invent a clock. |
| **+ In-time / Rally — board** | Same permission, board renderer | Same result as the week button, including a second press and configured wording. |
| **Type / edit reporting text** | Editable reporting line | Commit accepted text; resolve the first usable clock and proper activity/scope. Working OIL recomputes. Issued OIL holds. |
| **Delete reporting line** | Its delete control | Remove it; resolve remaining applicable lines, otherwise nominal fallback. Ordinary pending and Undo apply. |
| **Escape** | Active reporting editor | Cancel uncommitted typing. No OIL, pending-count or sign-off change from abandoned text. |
| **Wave template** | Ordinary template insertion | Current wave templates do not store reporting lines. New wave starts without them and therefore uses nominal fallback. |
| **Day template** | Permitted unpublished-day application | Reporting text is copied with the wave structure. Crew is not assumed copied: seat the test people through controls before assessing their OIL. |
| **Copy day** | Supported day-copy control | Copied reporting text is interpreted on the destination date. Destination eligibility, people and publication state decide its own credit. |
| **Saved plan** | Plan save/select controls | Plan content restores reporting text and its own signatures. Current global Logic still governs the candidate; the plan must not masquerade as an issued snapshot. |
| **Load older version** | Admin load-to-working-copy control | Loaded content becomes a candidate under today’s Logic. Merely previewing it remains read-only. Existing paid credit does not move until issue. |
| **Logic edit box** | Admin Logic → Edit rules; all displayed occurrences of a shared setting | Both occurrences edit the same value. Invalid input is rejected without corrupting saved rules. Recompute pending and signing consequences for all affected dates. |
| **Reset to standard** | Admin Logic reset control | Restore 180-minute nominal lead, 120-minute debrief and 361-minute full-day threshold. Apply the same record comparison as individual edits. |
| **Undo / Redo** | Global history controls, subject to their existing boundaries | Restore/reapply the action and its derived OIL, pending and signature consequences. Do not treat leaving OIL Earn mode as an undone schedule edit. |
| **Reload / second tab** | Durable browser demo | Reload reads saved content, rules and issued values consistently. A second tab must not supply its stale rules to a newly loaded issued record. Live concurrent-tab merging is not promised here. |
| **Sign** | Each of the four signing controls | Bind that signature to that candidate’s OIL record under the values at signing. No credit is paid by signing. |
| **First publish** | Permitted working ORIGINAL, required signatures standing | Save all three values with the issued day; land its one per-person credit. |
| **Publish amendment** | Published day with a valid candidate and required signatures | Save today’s values in the new version; replace the paying record. No publication from an older preview. |
| **Unpublish ORIGINAL** | Latest issued ORIGINAL | Day becomes draft; its automatic credit is removed. Warn when that actual removal strands a take. |
| **Unpublish latest AL / reissue same label** | Latest retractable amendment | Prior surviving version becomes payable. Reissue uses current candidate values and requires the proper signatures. |
| **Ordinary flying front/rear seats** | Named real people; measurable, noncancelled sortie | Entered report through landing plus debrief. ALL/ALL AVAIL remains refused in cockpits. |
| **SC MAIN / SC SPARE / AVALON / BB seats and associated desks** | Their normal schedule controls and OIL Earn mode | Written window only. SC MAIN defaults on; exempt kinds default off and offer an opt-in where measurable. Typed SC B does not pad OIL. |
| **AMT / OFT seats, passengers and extras** | Each visible sim person position | Written times; no flight reporting/debrief padding. Named and allowed placeholder participants use the same default rule. |
| **Duty main name and extras** | Ordinary and standalone-associated duty blocks | Written times, with the block’s correct default. |
| **Ground and Common Programme names, extras and permitted pucks** | Their own renderers and availability windows | Written times and resolved people; default on except a applicable exempt work kind. |
| **Accepted Duty & commitments request** | Member’s own request; admin filing and landed row | Owner’s answer and admin override govern eligibility. Other named people on the landed row have their own decisions. Published evidence holds after a member edit/delete. |
| **Personal request** | Member input controls | Does not become an OIL claim merely because it has times. |
| **Person off / row off / day blanket off** | Admin OIL Earn mode | Changes candidate entitlement at the intended scope; never silently changes issued credit. |
| **No times / cancelled / information-only / genuinely zero measurable window** | Every applicable row renderer | No invented award or live switch; give the refusal reason. |
| **PH flag, PH-tagged event and Off day** | Leave War/day classification controls | Date eligibility and pending publication must remain distinct. Off day earns nothing. |
| **Create missing Leave War period** | Existing missing-period offer | Provide the real route to a destination period. No award should be claimed as landed before that destination exists. |

## 2. Ranked scenarios

### Shared setup and numerical checks

Use the normal durable demo, admin **`ad` / `a`**, member **`us` / `us`**, and the real guest door. Use Saturday **18 July 2026**, Sunday **19 July**, and the second week starting **20 July**.

For each independent case:

- Use named test people with no unintended work on that date. Remove only the fixture’s unwanted assignments through controls.
- Unless stated otherwise, use **nominal lead 180, debrief 120, threshold 361 minutes**.
- Set the test credit’s expiry policy to **forever** through the available policy controls, and record the person’s unaffected balance **B**. This prevents July credit expiry from disguising an October balance failure.
- **HO** means cell HO and balance **B + 0.5**; **FO** means cell FO and **B + 1**; **none** means no automatic test-date credit and balance **B**.
- Every “holds” or “moves” below requires checking **all three**: grid cell, worked periods in the day details, and tracker balance.
- “Worked” below means the stored periods. For overnight cases these are clipped to the credited date; the earning calculation still uses the full cross-midnight envelope.
- Before publication, numerical amounts describe the candidate; the paid result is **none**.
- For every mutation, exercise **Undo → verify → Redo → verify → reload → verify**, subject to the existing history boundary. Do not expect the Undo stack to survive reload.

Gotcha families: **F** format, **M** missing input, **U** user error, **E** edit/delete from another page, **C** copies/synchronisation.

### S01 — Tracker drops a later worked period

**Setup:** Give one man duty **06:00–06:30** and flight **12:00–13:00**, with **IN TIME 10:00**. Publish.

**Action:** Inspect all three downstream displays; then change debrief to **150** and issue an amendment.

**Expected:** Initially **06:00–15:00, 540 min, FO**, worked **06:00–06:30, 10:00–15:00**. Pending candidate becomes **570 min, FO**, ending **15:30**; paid record holds until amendment, then the second worked period ends **15:30**.

**Disproof:** Tracker prints only **06:00–06:30**, or anything pays twice. **C. Confirmed code finding F1.**

### S02 — Withdrawing an AL restores credit rather than removing it

**Setup:** Publish flight **10:00–11:15**, no reporting line: **07:00–13:15, 375 min, FO**. Change lead to **150** and amend: **07:30–13:15, 345 min, HO**. Arrange a **0.5-day take**, with no other credit.

**Action:** Unpublish the AL.

**Expected:** ORIGINAL becomes payable again: **375 min, FO**, worked **07:00–13:15**, balance rises from **0 to 0.5**. No warning should claim this withdrawal strands the take or removes all of the day’s OIL.

**Disproof:** A second confirmation is demanded because the warning simulated no credit, or the message says all credit disappeared. **U/C. Confirmed code finding F2.**

### S03 — Two men in one ALL AVAIL window have different whole-day answers

**Setup:** Common Programme **08:30–09:00**, with a permitted ALL AVAIL puck including M and N. M also flies **12:00–13:00**, **IN TIME 10:00**; N has no other work.

**Action:** Open “Who earns OIL”; publish; increase debrief to **150**.

**Expected:** M: **08:30–15:00, 390 min, FO**, worked **08:30–09:00, 10:00–15:00**. N: **08:30–09:00, 30 min, HO**. Candidate M becomes **420 min, FO**, ending **15:30**; N is unchanged. Issued membership and both paid records hold.

**Disproof:** Both men inherit the same amount, the window uses today’s debrief for the issued view, or another window changes its context. **C.**

### S04 — ORIGINAL eye, current AL and today’s rules are three separate answers

**Setup:** Create the ORIGINAL and AL from S02, without the take. Then change lead to **120**.

**Action:** Alternate ORIGINAL eye, latest AL, working copy and Leave War.

**Expected:** ORIGINAL **07:00–13:15, 375 min, FO**. Latest AL—and paid record—**07:30–13:15, 345 min, HO**. Working candidate **08:00–13:15, 315 min, HO**. One consequential OIL pending item.

**Disproof:** Preview changes the ledger, or any frozen view adopts **08:00**. **C.**

### S05 — Off-screen week and second demo week

**Setup:** Publish the S02 ORIGINAL fixture on **18 July** and a covered **25 July**, creating coverage through period controls if needed.

**Action:** Leave the first week off screen; change lead to **150** while viewing the second. Reload and revisit both.

**Expected:** Each paid date remains **07:00–13:15, 375 min, FO**. Each candidate is **07:30–13:15, 345 min, HO**, with its own OIL pending item. Amend only 25 July: only that date becomes HO.

**Disproof:** Loading a week changes its paid amount, or amendment on one date updates the other. **C/E.**

### S06 — Signatures bind the candidate, not just the issued version

**Setup:** Publish **12:00–13:00, IN TIME 10:00**: **300 min, HO**. Remove the reporting line on the working copy, giving **09:00–15:00, 360 min, HO**. Sign that candidate.

**Action:** Change nominal lead **180 → 150 → 180**.

**Expected:** Candidate becomes **09:30–15:00, 330 min, HO** and its signatures fall, although nominal lead cannot affect the ORIGINAL’s entered report. Restoring 180 revives matching signatures. Paid record remains **10:00–15:00, 300 min, HO**.

**Disproof:** Signatures stand because the issued record was unaffected, or paid credit adopts the candidate. **E/C.**

### S07 — Signatures made under different values

**Setup:** Unpublished flight **12:00–13:00**, no report: **09:00–15:00, 360 min, HO**. Sign two roles.

**Action:** Change threshold **361 → 360**; sign the other two roles; restore **361**.

**Expected:** At 360, candidate is **FO**, first two signatures invalid. On restoration it is **HO**: original two may stand again; signatures made for FO must not stand for HO. No paid credit throughout.

**Disproof:** All four appear valid together across incompatible candidate records. **U/E.**

### S08 — Exact reproduction of W1

**Setup:** Publish **10:00–11:15**, no report.

**Action:** Logic nominal lead **180 → 150**.

**Expected:** Paid **07:00–13:15, 375 min, FO** holds. Candidate **07:30–13:15, 345 min, HO**. One OIL pending item names the setting and person; signatures fall. Revert: item clears and otherwise matching signatures revive.

**Disproof:** Immediate HO, “No pending changes”, or all signatures standing while the consequential change remains. **E.**

### S09 — Typed reporting change is ordinary pending content

**Setup:** Publish **12:00–13:00**, no report: **09:00–15:00, 360 min, HO**.

**Action:** Add **IN TIME 08:30**; inspect, then amend.

**Expected:** Candidate **08:30–15:00, 390 min, FO**. Old HO and **09:00–15:00** hold until amendment; then FO and **08:30–15:00** land. Ordinary reporting pending is present; no invented Logic-change item.

**Disproof:** Credit moves while typing, or no pending content exists. **E.**

### S10 — Worked times change while FO stays FO

**Setup:** Publish **12:00–13:00, IN TIME 08:30**: **390 min, FO**.

**Action:** Debrief **120 → 150**; inspect and amend.

**Expected:** Paid **08:30–15:00, 390 min, FO** holds. Candidate **08:30–15:30, 420 min, FO** raises one OIL pending item and invalidates signatures. Amendment updates worked end to **15:30**, with no extra credit.

**Disproof:** No pending item because the amount remains 1, or a second FO is added. **E.**

### S11 — Threshold changes affect written-time work too

**Setup:** On separate isolated runs, publish (a) flight **12:00–13:00**, no report, and (b) duty **09:00–15:00**.

**Action:** Threshold **361 → 360**.

**Expected:** Both records are **09:00–15:00, 360 min**. Paid HO holds; candidate FO raises one OIL item. On amendment each becomes FO with unchanged worked times.

**Disproof:** Only flying is reconsidered, or duty uses flight padding. **E/C.**

### S12 — Changed settings with no changed record

**Setup:** One man has ground work **08:00–18:00** and a contained flight **12:00–13:00, IN TIME 10:00**. Publish.

**Action:** Lead **180 → 150**, debrief **120 → 150**, threshold **361 → 400**.

**Expected:** Whole record remains **08:00–18:00, 600 min, FO**, worked **08:00–18:00**. No OIL pending item and no OIL-induced signature invalidation.

**Disproof:** A raw setting inequality creates a phantom OIL item. **U/E.**

### S13 — Compensating content must not hide the setting explanation

**Setup:** Publish **12:00–13:00**, no report: **09:00–15:00, 360 min, HO**.

**Action:** Change lead to **150**, then type **IN TIME 09:00**.

**Expected:** Candidate returns to **09:00–15:00, 360 min, HO**. The reporting edit remains ordinary pending. The separate Logic comparison still explains that the issued content under today’s nominal lead would be **09:30–15:00, 330 min, HO**. Paid record holds.

**Disproof:** An unexplained count, concealed Logic item, or a claim that the paid record already starts at 09:30. **U/E.**

### S14 — Member request edit plus Logic edit stay separate

**Setup:** M flies **12:00–13:00, IN TIME 10:00** and has an accepted, OIL-confirmed Duty & commitments request **06:00–06:30**. Publish: **06:00–15:00, 540 min, FO**.

**Action:** As `us`, edit the request to **07:00–07:30**. As admin, change debrief to **150**.

**Expected:** Paid worked periods remain **06:00–06:30, 10:00–15:00**, FO. Candidate is **07:00–15:30, 510 min, FO**, worked **07:00–07:30, 10:00–15:30**. Request change and Logic OIL item remain separate. Amendment lands the candidate once.

**Disproof:** Folding hides the Logic change, or member editing rewrites issued evidence. **E/C.**

### S15 — Member deletes an earning request

**Setup:** S14’s ORIGINAL, without later edits.

**Action:** Member deletes their request; inspect as admin. Undo the deletion through its supported history path.

**Expected:** Candidate loses the early event: **10:00–15:00, 300 min, HO**. Paid record remains **540 min, FO** with both old periods. Restoration restores the candidate’s **540 min, FO**.

**Disproof:** Immediate loss of issued credit, stale landed-row credit after amendment, or an untraceable pending item. **E/M.**

### S16 — Withdrawing ORIGINAL really can strand a take

**Setup:** Publish **08:30–15:00, 390 min, FO** and spend its whole **1 day**, with no other credit.

**Action:** Unpublish ORIGINAL.

**Expected:** Before confirmation: FO, worked **08:30–15:00**, balance **0**. Warning is warranted. After confirmed withdrawal: no automatic credit, no corresponding worked record, balance **−1**; draft remains a **390-minute FO candidate**.

**Disproof:** Silent withdrawal, retained paid FO, or a warning calculated using today’s candidate rather than the landed ledger. **U/E.**

### S17 — Same-label reissue takes current values

**Setup:** Use S02’s ORIGINAL and AL. Withdraw the AL, leaving ORIGINAL payable.

**Action:** Keep lead **150**, re-sign and reissue the correction.

**Expected:** Before reissue paid **375 min, FO**, worked **07:00–13:15**. Afterwards **345 min, HO**, worked **07:30–13:15**. One current credit, not ORIGINAL plus correction.

**Disproof:** Reissued label recovers obsolete values or creates duplicate credit. **C/U.**

### S18 — Undo, Redo and reload around publication

**Setup:** Unpublished **12:00–13:00, IN TIME 08:30**, candidate **390 min, FO**.

**Action:** Sign and publish; Undo publication; Redo; reload. Repeat around an amendment changing report to **10:00**.

**Expected:** Paid state follows the surviving issuance: none ↔ **FO, 08:30–15:00, 390 min**; amendment sequence switches between that and **HO, 10:00–15:00, 300 min**. Undo withdrawal/signature rules remain in force.

**Disproof:** A stale credit survives withdrawal, Redo uses different rules, or reload changes the result. Separately record the already-filed publication-history Undo issue rather than calling it a new OIL finding. **C/U.**

### S19 — Saved plans do not retain issued-day rule authority

**Setup:** Save plan A with **IN TIME 08:30** and plan B with **IN TIME 10:00**, both flight **12:00–13:00**. Sign A.

**Action:** Select B; change debrief to **150**; return to A.

**Expected:** A now proposes **08:30–15:30, 420 min, FO**; B **10:00–15:30, 330 min, HO**. A’s old **390-minute** signatures cannot approve 420 minutes. Selecting plans never pays a draft.

**Disproof:** Restored plan carries frozen publication values or revives incompatible signatures. **C.**

### S20 — Previewing and loading an older version differ

**Setup:** ORIGINAL report **08:30**, AL report **10:00**, flight **12:00–13:00**; then debrief **150**.

**Action:** Preview ORIGINAL, then explicitly load it as the working copy.

**Expected:** Preview ORIGINAL: **08:30–15:00, 390 min, FO**. Loaded candidate: **08:30–15:30, 420 min, FO**. Paid latest AL remains **10:00–15:00, 300 min, HO** until reissue.

**Disproof:** Loading preserves the old saved debrief as candidate authority, or merely previewing changes money. **C/U.**

### S21 — Day template and copy-day reporting text

**Setup:** Through each door separately, reproduce a source wave **12:00–13:00, IN TIME 08:30** onto Sunday 19 July. Seat the test person if the template clears names.

**Action:** Inspect candidate, then publish destination.

**Expected:** Destination **08:30–15:00, 390 min, FO**, worked **08:30–15:00**. Before issue, no destination credit. Source credit does not change.

**Disproof:** Reporting text silently disappears, copied snapshot rules govern the new candidate, or source and destination share a decision. **C/M.**

### S22 — Wave template has no reporting text to preserve

**Setup:** Save/apply an ordinary wave template with flight **12:00–13:00**.

**Action:** Seat M, inspect, then add **IN TIME 08:30**.

**Expected:** Initially no reporting line: **09:00–15:00, 360 min, HO**. After entry: **08:30–15:00, 390 min, FO**. Both are unpaid until issue.

**Disproof:** Invented inherited reporting clock or no recomputation after entry. **C/M.**

### S23 — Both + buttons, repeated presses and missing take-off

**Setup:** Flight **12:00–13:00**, no report.

**Action:** Use + on week, repeat from board; separately repeat after setting a resolved **08:30** report. Also try a wave lacking usable take-off.

**Expected:** First fixture inserts **09:00** and stays **360 min, HO**; with resolved 08:30 it reuses **08:30**, **390 min, FO**. Repetition must not revert to nominal. Missing take-off must not manufacture measurable flight work.

**Disproof:** Different buttons choose different clocks, second press resets the time, or incomplete flight mints credit. **M/U.**

### S24 — Escape and delete are different actions

**Setup:** Publish **12:00–13:00, IN TIME 08:30**.

**Action:** Type **10:00** but Escape; then separately commit 10:00; then delete the line.

**Expected:** Escape leaves **390 min, FO** and no new pending edit. Commit proposes **10:00–15:00, 300 min, HO**. Delete proposes nominal **09:00–15:00, 360 min, HO**. Paid ORIGINAL stays **390 min, FO** until amendment.

**Disproof:** Escape commits, deletion leaves a hidden 10:00 report, or paid credit follows the editor. **U/M.**

### S25 — Accepted clock spellings

**Setup:** Flight **12:00–13:00**.

**Action:** Independently enter `IN TIME 0830`, `08:30`, `0830H`, `0830L`, and `830`.

**Expected:** Each gives **08:30–15:00, 390 min, FO**; after issue worked **08:30–15:00**, balance **B+1**.

**Disproof:** A spelling accepted by the shared reader produces nominal OIL or a different date. **F.**

### S26 — Unreadable clocks and words-only reporting

**Setup:** Same flight.

**Action:** Independently enter `IN TIME 8h30`, `IN TIME 25:90`, `IN TIME FL240`, words without a clock, and `RALLY AFTER IN TIME` without an in-time.

**Expected:** No usable report: **09:00–15:00, 360 min, HO**. Give the existing malformed/unresolved warning where applicable; ordinary prose need not be labelled a malformed clock.

**Disproof:** 8h30/FL240 becomes an unintended clock, invalid text creates zero credit instead of fallback, or immediate Rally invents an in-time. **F/M.**

### S27 — First usable clock and ordinary free text

**Setup:** Flight **12:00–13:00**.

**Action:** Enter `0830 IN TIME — brief 1000`; then a variant with `FL240` before `0830`; separately mention a person’s name without naming a formation.

**Expected:** Usable **08:30** report: **390 min, FO**. An ordinary person-name mention must not secretly narrow reporting scope.

**Disproof:** Last clock wins, FL240 wins, or someone’s mention changes only that person’s flight entitlement. **F/U.**

### S28 — Formation specificity applies separately to each activity

**Setup:** Two formations taking off **12:00**, landing **13:00**. Wave-wide `IN TIME 08:30`; formation A `IN TIME 10:00`.

**Action:** Inspect both, then add wave-wide `RALLY 09:00`.

**Expected:** Initially A **10:00–15:00, 300 min, HO**; B **08:30–15:00, 390 min, FO**. With Rally, A becomes **09:00–15:00, 360 min, HO**; B stays FO. A’s specific in-time does not suppress the independently applicable Rally.

**Disproof:** Wave in-time overrides A’s specific one, or specificity for one activity suppresses both. **F/C.**

### S29 — Duplicate lines resolve chronologically, independent of row order

**Setup:** Flight **01:00–02:00**, with `IN TIME 23:00` and `IN TIME 00:30`.

**Action:** Reverse the reporting-line order through controls.

**Expected:** **Previous day 23:00 → today 04:00, 300 min, HO**. Stored worked **00:00–04:00**. Both orders agree.

**Disproof:** Numeric 00:30 wins merely because its clock is smaller, or the last row wins. **F/U.**

### S30 — Evening-before boundary and no previous-day award

**Setup:** Saturday flight **01:00–02:00**, `IN TIME 22:00`.

**Action:** Publish; change report to **21:59**, then amend.

**Expected:** ORIGINAL **Friday 22:00 → Saturday 04:00, 360 min, HO**. Candidate **361 min, FO**. Both store Saturday worked **00:00–04:00**. Friday receives no credit from this flight.

**Disproof:** Friday credit appears, Saturday calculation uses only its four clipped hours, or the one-minute change fails to cross the threshold. **F/C.**

### S31 — Monday PH reads an evening in the previous week

**Setup:** Declare Monday **20 July** a PH before publication. Flight **01:00–02:00**, report **Sunday 21:59**.

**Action:** Publish; move between the two demo weeks and reload.

**Expected:** Monday **361 min, FO**, worked **00:00–04:00**. Sunday receives nothing from it. The week boundary does not change the calculation.

**Disproof:** Previous-week lookup fails, Sunday is credited, or Monday loses its report on reload. **C/M.**

### S32 — Landing after midnight

**Setup:** Saturday flight **22:00–01:00**, `IN TIME 20:00`.

**Action:** Publish; change debrief **120 → 90**.

**Expected:** Paid **Saturday 20:00 → Sunday 03:00, 420 min, FO**, worked **20:00–23:59**. Candidate **390 min, FO**, ending Sunday **02:30**. Its stored worked period remains identical, and amount remains FO: **no OIL-record pending item solely for that clipped-away change**.

**Disproof:** Live paid drift, Sunday duplicate credit, or pending based only on an unstored end-time difference. **C/U.**

### S33 — Exact 6h00 and 6h01

**Setup:** Flight **12:00–13:00**.

**Action:** Compare nominal **09:00** against entered **08:59**, with threshold 361.

**Expected:** **09:00–15:00, 360 min, HO** versus **08:59–15:00, 361 min, FO**. Publish each independent fixture and check +0.5 versus +1.

**Disproof:** `>` instead of `>=`, rounding to hours, or worked start rounded to 09:00. **F/U.**

### S34 — Zero-length sortie with and without measurable padding

**Setup:** Flight **12:00–12:00**.

**Action:** Test no report with defaults; then report **12:00**; then set debrief **0**.

**Expected:** Respectively **09:00–14:00, 300 min, HO**; **12:00–14:00, 120 min, HO**; **12:00–12:00, 0 min, none**. Keep the same-time warning. Do not introduce a minimum award.

**Disproof:** All same-time sorties are refused, or the genuinely zero window pays an invented half day. **U/M.**

### S35 — SC’s typed B does not become its OIL start

**Setup:** SC MAIN **07:00–13:00**; enter/change its B to **06:00**, then **08:00**.

**Action:** Change nominal lead and flight debrief too.

**Expected:** Always **07:00–13:00, 360 min, HO** at threshold 361. Those edits do not create an OIL-record change. Work/rest displays may have their own consequences.

**Disproof:** OIL starts at B or gains flight padding. **E/U.**

### S36 — Every uncommon seat and extra-person renderer

**Setup:** Independently put M on a measurable **09:00–15:00** sim seat/passenger/extra, duty name/extra, ground name/extra, Common Programme name, SC MAIN and each permitted exempt seat/desk.

**Action:** Inspect board, week and OIL Earn; publish. For exempt kinds first inspect default off, then opt in and amend.

**Expected:** Written **360 min, HO**, worked **09:00–15:00** for enabled work. Exempt defaults give **none**; deliberate opt-in gives HO on issue. AVALON’s normal **19:00–07:00** window, when enabled, is **720 min, FO**, worked **19:00–23:59**.

**Disproof:** Missing switch/edge on a secondary person position, ordinary extras default off, or enabled exempt work never pays. **M/C. Finding F3’s wording is also visible here.**

### S37 — Missing times, cancellation and information-only rows

**Setup:** Isolate (a) flight with missing landing, (b) duty with start but no end, (c) cancelled formation/jet, and (d) information-only ground row.

**Action:** Inspect OIL Earn and an applicable ALL AVAIL window; repair one missing end to make duty **09:00–15:00**.

**Expected:** Initial cases: **none**, no invented worked period, refusal reason. Availability may still be shown for an open-ended row. Repaired duty: **360 min, HO** candidate; paid only on issue.

**Disproof:** Assumed display length mints money, a cancelled seat stays switchable, or refusal is a silent disappearance. **M/U.**

### S38 — Person, row and blanket decisions mask the right work

**Setup:** M has duty **06:00–06:30** and flight **12:00–13:00, IN TIME 10:00**.

**Action:** Independently switch flight row off, M off for the day, and the whole day off; then restore. Repeat while changing debrief.

**Expected:** Normal **540 min, FO**, two periods. Flight off: **06:00–06:30, 30 min, HO**. Person/day off: **none**. A debrief change cannot create an OIL-rule difference where all affected flight work is excluded. Published records hold until amendment.

**Disproof:** Wrong scope, hidden work returning during rule change, or an unexplainable OIL item for wholly excluded work. **U/E.**

### S39 — Weekday, PH before/after issue, and Off day

**Setup:** Use flight **12:00–13:00, IN TIME 08:30** on an ordinary weekday.

**Action:** In independent runs declare PH before publishing, declare PH after publishing, and declare Off day.

**Expected:** Ordinary weekday: **none**. PH before issue: candidate and then paid **08:30–15:00, 390 min, FO**. PH added after a non-earning issue: candidate FO with pending change; no paid credit until reissue. Off day: **none**, with any prior issued credit held until the classification change is issued.

**Disproof:** Weekday credit, immediate retroactive PH credit, or Off day work paying without the required publication state. **E/C.**

### S40 — Weekend without a Leave War period

**Setup:** Through date/week controls choose a weekend not covered by a period. Add **12:00–13:00, IN TIME 08:30**.

**Action:** Publish; follow the missing-period offer and create coverage.

**Expected:** Schedule entitlement **08:30–15:00, 390 min, FO**. Before a destination exists, no landed cell or +1 claim. Once coverage is created, the existing issued record lands **FO**, worked **08:30–15:00**, once.

**Disproof:** Silent loss without a usable route, fabricated landing, or double credit after period creation/reload. **M/C.**

### S41 — Every Logic writer

**Setup:** Publish S08’s **375-minute FO** fixture.

**Action:** Independently change lead through each displayed edit box, Undo/Redo, Reset to standard, reload, and a second tab followed by reload. Also enter invalid and out-of-range values.

**Expected:** Accepted lead 150 gives candidate **07:30–13:15, 345 min, HO**, paid **375 min, FO** held. Reset to 180 restores matching records and clears the item. Invalid values leave the last accepted value intact. A newly loaded tab reads the saved rules and still honours issued values.

**Disproof:** One writer bypasses pending/signature checks, rejection corrupts rules, or a cold read recomputes paid credit live. **F/C/U.**

### S42 — Roles, overlays, pending visibility and exports

**Setup:** Use S04’s three-version/value fixture. Open board/week, To go out, Amendments and an availability window; repeat at phone size. Then use member and guest sessions.

**Action:** Switch faces and versions, close overlays, reload, and export/print through available controls.

**Expected:** Working **315 min, HO**; current paid **345 min, HO**, worked **07:30–13:15**; ORIGINAL preview **375 min, FO**, worked **07:00–13:15**. Accessible read-only surfaces agree. No mutation controls leak. Current pending OIL is understandable and can be cleared by restoring the setting or issuing an amendment. Export follows its documented latest-issued selection.

**Disproof:** An overlay changes the underlying version, mobile hides the only explanation, guest/member can mutate OIL rules, or export leaks unpublished schedule content. **C/U.**

### Mandatory ordered-pair expansion

The 42 scenarios above are the short, ranked walk cards. **They do not by themselves exhaust the requested action orders.** Expand the following set mechanically:

| Action | Deterministic test operation |
|---|---|
| T+ | Add `IN TIME 10:00` |
| T~ | Change existing reporting clock to `08:30` |
| T− | Remove the reporting line |
| Lr | Nominal lead 180 → 150 |
| Ld | Debrief 120 → 150 |
| Lt | Threshold 361 → 360 |
| S | Sign the candidate |
| P | First publish |
| A | Publish amendment |
| U | Unpublish latest version |
| V | Load an older issued version into the working copy |
| Op | Switch the test person off |
| Or | Switch the flight row off |
| M | Member changes an accepted, confirmed request from 06:00–06:30 to 07:00–07:30 |

For **every distinct pair** from these 14 actions, run **both orders**, starting once unpublished and once published: **91 × 2 × 2 = 364 short order runs**, before the reporting/door variants.

Use flight **12:00–13:00**. Prepare preconditions before the pair; never silently re-sign, republish or insert a missing reporting line between its two actions.

For each action:

1. Record the candidate, latest issued record, three downstream numbers, pending explanation and standing signatures.
2. Perform the action.
3. Check that state, Undo, check the prior state, Redo, check the reapplied state, then reload.
4. Continue with the second action.
5. If that action is unavailable in this state—amend on a never-published day, for example—verify absence/refusal and unchanged data. Do not inject it through hidden APIs.

The numerical oracle for these pairs is:

- Flight without report: **09:00–15:00, 360 min, HO**.
- T+: **10:00–15:00, 300 min, HO**.
- T~: **08:30–15:00, 390 min, FO**.
- Lr affects only nominal fallback: start **09:30**.
- Ld moves the flight end to **15:30**.
- Lt makes any **360-minute** enabled record FO.
- An enabled confirmed **06:00** request makes the combined day start at **06:00**; M changes that to **07:00**.
- Op removes that person’s enabled entitlement. Or removes only the flight, leaving any eligible request.
- P/A save the candidate and replace the paying record. Other edits hold the latest issued record.
- U selects the prior surviving issuance, or none after ORIGINAL withdrawal.
- V changes candidate content, not global rules or the paying version.
- S never pays. Later actions invalidate signatures when their candidate binding changes.

Repeat T actions for **In-time and Rally**, the reporting writer variants from the door table, and L actions through **box, Reset, Undo/Redo and cold reload**. This is the coverage record needed to claim “both orders”, rather than choosing a handful of convenient pairs.

## 3. Numerical oracle

Defaults: **lead/debrief/threshold = 180/120/361 minutes**. End times include debrief only for ordinary flying. `Prev` and `next` identify another date.

| # | Work / take-off → landing | Entered lines / other work | Logic if different | OIL start → end | Minutes | Result |
|---|---|---|---|---|---:|---|
| 1 | Flight 12:00→13:00 | None | Default | 09:00→15:00 | 360 | HO |
| 2 | Same | IN TIME 08:59 | Default | 08:59→15:00 | 361 | FO |
| 3 | Same | IN TIME 08:30 | Default | 08:30→15:00 | 390 | FO |
| 4 | Same | IN TIME 10:00 | Default | 10:00→15:00 | 300 | HO |
| 5 | Same | IN TIME 10:00; RALLY 09:30 | Default | 09:30→15:00 | 330 | HO |
| 6 | Same | IN TIME 10:00; RALLY AFTER IN TIME | Default | 10:00→15:00 | 300 | HO |
| 7 | Same | RALLY AFTER IN TIME only | Default | 09:00→15:00 | 360 | HO |
| 8 | Same | IN TIME 8h30 | Default | 09:00→15:00 | 360 | HO |
| 9 | Same | IN TIME 25:90 / FL240 / no clock | Default | 09:00→15:00 | 360 | HO |
| 10 | Same | `0830 IN TIME; brief 1000` | Default | 08:30→15:00 | 390 | FO |
| 11 | Same, formation A | Wave in-time 08:30; A in-time 10:00 | Default | 10:00→15:00 | 300 | HO |
| 12 | Same, formation B | Same lines; none specific to B | Default | 08:30→15:00 | 390 | FO |
| 13 | Same, A | Above plus wave Rally 09:00 | Default | 09:00→15:00 | 360 | HO |
| 14 | Same | Duplicate in-times 09:30 and 08:30 | Default | 08:30→15:00 | 390 | FO |
| 15 | Same | IN TIME 13:00, later than take-off | Default | Prev 13:00→15:00 | 1,560 | FO |
| 16 | Flight 01:00→02:00 | IN TIME 23:00 | Default | Prev 23:00→04:00 | 300 | HO |
| 17 | Same | IN TIME 22:00 | Default | Prev 22:00→04:00 | 360 | HO |
| 18 | Same | IN TIME 21:59 | Default | Prev 21:59→04:00 | 361 | FO |
| 19 | Same | IN TIME 23:00 and 00:30 | Default | Prev 23:00→04:00 | 300 | HO |
| 20 | Flight 22:00→01:00 | No report | Default | 19:00→next 03:00 | 480 | FO |
| 21 | Same | IN TIME 20:00 | Default | 20:00→next 03:00 | 420 | FO |
| 22 | Same | IN TIME 20:00 | Debrief 90 | 20:00→next 02:30 | 390 | FO |
| 23 | Flight 10:00→11:15 | No report | Default | 07:00→13:15 | 375 | FO |
| 24 | Same | No report | Lead 150 | 07:30→13:15 | 345 | HO |
| 25 | Same | No report | Lead 120 | 08:00→13:15 | 315 | HO |
| 26 | Flight 12:00→13:00 | No report | Threshold 360 | 09:00→15:00 | 360 | FO |
| 27 | Same | IN TIME 08:30 | Debrief 150 | 08:30→15:30 | 420 | FO |
| 28 | Same, M | IN TIME 10:00; duty 06:00–06:30 | Default | 06:00→15:00 | 540 | FO |
| 29 | Same, N | Same flight/report; no other event | Default | 10:00→15:00 | 300 | HO |
| 30 | Flight 12:00→12:00 | No report | Default | 09:00→14:00 | 300 | HO |
| 31 | Same | IN TIME 12:00 | Default | 12:00→14:00 | 120 | HO |
| 32 | Same | IN TIME 12:00 | Debrief 0 | 12:00→12:00 | 0 | None |
| 33 | SC MAIN 07:00→13:00 | B 06:00 or 08:00 | Default | 07:00→13:00 | 360 | HO |
| 34 | SC MAIN 07:00→13:00 | Any B | Threshold 360 | 07:00→13:00 | 360 | FO |
| 35 | Sim 08:00→09:30 | Any flight reporting elsewhere | Default | 08:00→09:30 | 90 | HO |
| 36 | Duty 08:00→14:01 | None | Default | 08:00→14:01 | 361 | FO |
| 37 | Enabled AVALON 19:00→07:00 | Explicit OIL opt-in | Default | 19:00→next 07:00 | 720 | FO |
| 38 | Same AVALON | Default off | Default | Measurable 720-minute window, excluded | — | None |

For rows 16–19 the credited date’s stored worked period is **00:00–04:00**. For rows 20–22 it is **19:00–23:59** or **20:00–23:59**. Row 28 stores **06:00–06:30, 10:00–15:00**, not one continuous worked period. These distinctions matter to both the tracker and the pending-record comparison.

## 4. Builder’s readings

| Reading | Judgment | Reason and proving scenarios |
|---|---|---|
| **(a) A later entered report shortens the day** | **Sound.** | D591/D592 choose the actual applicable report. Nominal 09:00 becomes entered 10:00: 360 → 300 minutes for 12:00–13:00 flying. S09, S24, S28 and oracle 1/4. |
| **(b) Unreadable report, or immediate Rally without an in-time, falls back to nominal** | **Sound.** | There is no usable entered clock. Preserve the existing warning distinction; do not silently parse 8h30 or FL240 as a time. S26. |
| **(c) Compare the whole stored record; no changed record means no OIL pending** | **Sound, as revised in plan §7.** | Amount alone misses worked-time changes; raw rule equality creates phantom changes. S10 proves the first, S12 and S32 prove the second. The register still contains the withdrawn amount-only wording. |
| **(d) SC’s B does not move its OIL** | **Sound.** | The change is for ordinary flying. Standalone work keeps its written window. S35, oracle 33/34. |
| **(e) Same take-off/landing, entered report at take-off and zero debrief earns nothing** | **Sound as the zero-measurable-work boundary, with the D49 control case retained.** | It does not justify refusing normal same-time sorties: those still earn from measurable report/debrief. S34 proves all three cases. No minimum should be invented. The plan says the wording boundary is filed, but I did not find the named `[OIL-ZERO-SPAN-SORTIE]` backlog entry. |

None of these readings needs an arithmetic rewrite on the evidence read. The corrections are the missing display/warning handling and the contradictory explanatory records below.

## 5. Findings in the code

### F1 — OIL tracker renders only the first worked period

**Files and lines**

- `raptor-port/src/leavewar/ui/OilTracker.tsx:483`
- Producer: `raptor-port/src/leavewar/engine/oiltracker.ts:247–248`

The producer carries all credit periods, but the renderer selects only `c.hours[0]`.

**Failing scenario:** S01. A full day earned from **06:00–06:30** and **10:00–15:00** is displayed with only the morning half-hour. After amendment, the changed afternoon end remains invisible.

**Exact fix**

1. Render every period in `c.hours`, formatting each start/end with the existing formatter.
2. Separate periods visibly; do not replace them with a continuous envelope, because that would misstate the stored work.
3. Keep the existing no-hours behaviour for credits without worked periods.
4. Add a rendering check for two periods and a changed second period.
5. Walk the tracker at desktop and phone width beside the day sheet.

This affects newly created records. It is not a migration finding, and I have not established that this patch introduced it.

### F2 — Unpublish warning simulates removing all credit when an earlier issue will pay

**Files and lines**

- `raptor-port/src/leavewar/sync.ts:1251–1282`, especially `1281`
- `raptor-port/src/ui/interactions.ts:981–1003`
- Actual AL-withdrawal behaviour: `raptor-port/src/engine/publish.ts:1253–1266`

The warning rebuilds the ledger with the date’s automatic credit omitted. Withdrawing an AL instead restores the prior surviving issued version. These are different counterfactuals.

**Failing scenario:** S02. Withdrawing a **HO amendment** restores a **FO ORIGINAL**, increasing the balance from **0 to 0.5** after a half-day take. The warning’s “remove all credit” calculation nevertheless sees **−0.5** and warns.

**Exact fix**

1. Determine the actual surviving version after the proposed withdrawal.
2. Compute its replacement OIL records using that version’s saved evidence and values; ORIGINAL withdrawal has no replacement.
3. Evaluate the tracker ledger with that replacement, preserving its normal expiry/FIFO handling and unrelated awards.
4. Warn only if the actual result strands a take.
5. Make both warning and completion wording distinguish withdrawal to a draft from restoration of a prior issue.
6. Check ORIGINAL removal, AL→higher credit, AL→lower credit, unchanged credit, and a blocked/unlanded automatic credit.

This is a current control-path defect for newly issued versions. It is not evidence that saved-value publication itself is wrong.

### F3 — Logic text incorrectly says default-off work never earns

**File and lines**

- `raptor-port/src/ui/logic-html.ts:210`
- Related unconditional seat/desk wording at `:279`

The OIL explanation says SC spare earns nothing and AVALON/BB earn nothing at all, including desks. D24/D28 make measurable exempt work **default off, deliberately switchable**.

**Failing scenario:** S36. The person can be credited through OIL Earn while the Logic explanation says that kind cannot earn.

**Exact fix**

1. Say these kinds **default to no OIL**.
2. Explain that an admin can enable measurable activated work in OIL Earn.
3. State that changing that decision on a published day takes effect through amendment.
4. Retain the genuine refusal cases—missing times, cancellation and no measurable window.

No calculation change is required.

### Documentation corrections accompanying the check

- `raptor-port/docs/superpowers/specs/2026-10-06-oil-work-start-register.md:24–25` still says comparison is **amount only, not minutes**. Replace it with **amount and stored worked periods**, including “no changed record, no OIL pending”. The implementation and plan §7 already use that rule.
- `raptor-port/docs/superpowers/plans/2026-10-06-oil-work-start-plan.md:155` says `[OIL-ZERO-SPAN-SORTIE]` is filed. I found no corresponding entry in the live backlog. Either add the promised wording item or correct that assertion.
- Other explanatory documents were being updated concurrently during this read. I have not treated their earlier wording as a final defect, and I did not use another reviewer’s or walker’s report as proof.

## 6. Owed read: D591 and D592

**Meaning check: PASS for both short lines.**

- **D591:** `.claude/rules/decisions/oil.md:46` preserves actual earliest applicable reporting and nominal fallback, with D592 supplying the confirmed details.
- **D592:** `.claude/rules/decisions/oil.md:45` preserves formation applicability, fallback, previous-evening attribution, issued-day holding/pending, and first-event-to-last-end with gaps.

Compared against the full rows in `.claude/decisions-full/oil.md:11–12`, neither short line changes the owner’s meaning.

“Not yet built” is historical status wording, not a different rule. Likewise, “a later time … change” must be read as a subsequent edit, not permission to ignore edits that move a clock earlier.

## 7. Explicit negatives

The source tracing found **no additional defect** in these paths:

- Ordinary flying calls the shared reporting resolver; formation specificity, separate activities and previous-evening interpretation are not reimplemented with a different OIL parser.
- First publication, amendment and reissue use the snapshot path that keeps the three OIL values.
- Issued credit generation reads saved report lead, debrief and threshold.
- Board figures, green edges and eligibility/default helpers accept the issued evidence’s saved values.
- The OIL Logic pending item is kept separate from request-change folding.
- Candidate signature checking compares the candidate under signing-time and current values; it is not limited to already-published days.
- Loading a version into a working plan removes issued-evidence authority rather than making the candidate permanently frozen.
- The old live-rule credit helpers found outside these paths were not identified as production issued-day readers.
- Wave templates do not promise reporting-text preservation.
- Existing CSV/print fields do not constitute an OIL ledger export.
- Missing instantaneous cross-tab merging was not treated as a new feature requirement.
- No legacy-data migration, back-compat or old-record-only problem is reported.
- No EOD publication button or path was invented for the walk.
- Already-filed reporting wording/jump, older-preview pending-count, per-page history and publication-Undo-history issues are distinguished from new OIL findings.

**Walk:** Not run, as instructed. The scenarios and numerical expectations above remain to be exercised in the running app.

**Rulings:** None made or changed.

