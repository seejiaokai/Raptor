# What Fable has never read, ranked — and its first reads (job 3 of the night of 21 Nov 26, chat 131; his D2259, [MSQ-FABLE-REVIEW])

Report only: nothing here is fixed. Every finding below was run red by the host on the reader's own proof test (kept outside the repo, `D:\raptor-work\job3\proofs-*` and `D:\raptor-work\reads\lw-fable`). The four parts, as the readers returned them: the ranked list (Opus); the Leave War read, the Inputs read and the OIL-outside-the-war read (Fable, each on a copy of the branch).

## 1. The ranked list

JOB3-LIST

I changed no files. Sources: the evidence sheets, the Fable briefs and reports, `[NO-ASTRA-LIST]`, the rulings D790/D903/D1934/D2233–D2244/D2259, and `git log` on the folder you named (`C:\Users\User\projects\Raptor-msq`, branch claude/multi-sqn-b1-107). Line counts leave out tests.

**One fact shapes the whole table.** Fable has never read any area whole. Every Fable read covered one job's changed lines, or that job's plan or scenarios. So "read" below means "Fable read some change to it, on that date". What matters is how much has changed since then.

The reads fall into five periods:
- **21 Sep – 13 Oct:** heavy. Most jobs got Fable plus Astra.
- **15 Oct:** D903 stopped Fable unless the owner calls for it.
- **Late October, on his calls:** the Leave War's M1 (22 Oct, D1260) and M4 (27 Oct, D1425), and the iPhone keyboard work (as fixer).
- **8 Nov:** a handful only (D1934). Fable read the schedule's marks with the publish path, the engine's "day with nothing entered", Insights' edges, and OIL Earn on the board.
- **17–21 Nov:** the multi-squadron work, covered below.

## Table of areas

| Area | Main files (lines) | Built / last big change | Fable read | Astra / fresh Opus | High-consequence | Changed since 15 Oct |
|---|---|---|---|---|---|---|
| Rules engine | `src/engine/` (19,593) | port from 31 Jul; validate.ts +491 and inputs.ts +354 lines since mid-Oct; multi-squadron day readers 21 Nov | 8 Nov (one item); multi-squadron area C, its diff only (20 Nov) | Opus most jobs | all four, indirectly | 141 commits |
| Edit Schedule (week, day, crew, drag, plans) | ui/board.ts, drag.ts, interactions.ts, html.ts, SchedBoard.tsx, pan.ts, state/flyplan, plan (12,431) | rally/standby 19–20 Oct; week swipe and print 3 Nov; reshape 21 Nov | Sep (amendment, late-pub, one-row, five-flags); 11–12 Oct (group input, one-rule); 8 Nov (marks); area C diff | Opus only from Oct 11 to Nov 7; the 19 Oct "21 schedule and amendment fixes" had no Astra | published record | 148 commits, +2,373 lines (mid-Oct to mid-Nov) |
| Publish / amend / sign | state/sched-commit.ts, sign-more.ts, ui/pendlist.ts (1,723) | Sep; reshape C4/C5 21 Nov | Sep, heavily; 8 Nov publish path | Sep both; Opus since | published record, OIL | 35 commits, +206 |
| Inputs (list, calendar, window, late, for others) | ui/inputedit.tsx, InputsCal, InputWindow, InputsPage, reqdoor (7,158) | 3 Nov fixes (LATE drop, Make public on a published day); 6 Nov batch; reshape C6 | 13 Oct inputs batch; 12 Oct one-rule | 3 Nov batch: Opus only, on the reads-owed list | published record, saved data, permissions, OIL question | 94 commits, +2,623 |
| OIL outside the war (board, answers, answer list) | ui/oilmode.ts, oilwait, OilWaitSheet, engine/oil, oilev (about 4,500) | 14–20 Oct jobs; 8 Nov Earn on the board | Sep (oil, seats, award); 13 Oct ask-notify; 8 Nov Earn | plan-switch, uncancel/load and the 20 Oct OIL batch had one Opus reader only, by his word (D858, D875) | OIL, published record | +373 |
| Leave War | leavewar/state/store.ts (6,521), sync.ts (4,376), Matrix.tsx (4,978), BidPicker, Balances, Approvals (40,554 in all) | overhaul M1–M5b, 22 Oct – 6 Nov; multi-squadron | Sep (absence, move-standard, post-out); 13 Oct row split; **M1 and M4 only** of the overhaul; area A diff (20 Nov) | M2, M3, M5a, M5b, roster restore and small fixes: Opus only, no Astra (on the reads-owed list) | OIL, who counts as present, saved data, permissions | 549 commits, **+53,707** |
| Tracker | tracker/app/core.js (7,480; 9,755 in all) | 17 Oct batch, 5 Nov tidy, 8 Nov small batch | 23 Sep (scenarios, final, pinch); 28 Sep plan; area A diff | 17 Oct batch: two Opus, no Astra | saved data | 71 commits, +3,699 |
| Quals | ui/QualsPage.tsx, state/quals-write.ts (1,461) | 16 Oct one row, 6 Nov faults, 11 Nov small | only inside the Sep accounts reads; area C diff | Opus | saved data, permissions | 45 commits, +805 |
| Medical | ui/MedicalView.tsx, engine/medical.ts (about 640) | 15–17 Oct cards and one row | **never** (Sep scenarios only) | Opus | saved data (sensitive) | +224 |
| SANS calendar | ui/Sans*, sans* (877) | 5–9 Oct | **never** | Astra twice (5 Oct) | saved data | +61 |
| Insights / work hours | ui/insights-html.ts, menu, engine/insights | 3–4 Oct | 6 Oct; 8 Nov | Astra, Sol | none | 2 commits |
| Accounts, sign-in, Admin → Users | state/accounts.ts, view.ts (1,475), person-delete, UsersPanel, AccessScreen, Login (4,628) | Sep one-door; 5 Nov member/guest; guest removed 21 Nov; D2250 21 Nov | Sep 26–27 heavily (accounts, new person, one door, post-out); area B diff | the 5 Nov member/guest build: Opus only (D1594), on the reads-owed list | permissions, saved data | 74 commits, +804 |
| Commit gate / permissions | state/perms.ts (3,302), command/ (1,517) | grew about 2,580 lines in multi-squadron | **read whole** in the 20 Nov sample; the reshape's rights core 21 Nov; fix reads 7–17 | Astra, Opus and the security reader each round | permissions | 144 commits |
| Undo / Redo, history | undo/timeline.ts, describe, state/undo-wire.ts, histbubble, changelines (4,190) | Sep 28; reshape 21 Nov | 28 Sep change recording; area B diff | Sep both | saved data, permissions | 71 commits, +567 |
| Saving and loading | storage/, state/persist.ts, store.ts (3,735) | database-readiness 30 Sep – 1 Oct | phases A, 6, 6c and 7, all read by Fable; area B diff | Sep both | saved data | +101 |
| The bell | state/notices.ts (1,044) | 12 Oct; multi-squadron | 13 Oct ask-notify; M4's war lines; **whole** in the 20 Nov sample; 19 Nov bells look | each round | none directly | 55 commits |
| IT flow guide | documents and scripts only | — | its rulings page on 8 Nov | — | none in the app | — |
| Export and print | ui/export.ts, printpdf.ts (224) | 3 Nov print | **never** (only named in Sep scenarios) | Opus | shows the published record (read only) | +13 |
| Multi-squadron | units, units-model, lastadmin, plan-foreign, holderbase (1,211), plus the above | 17–21 Nov | plan red team, fix plan, fix reads 7–17, job 2, bells, the core sample, full review A/B/C, reshape plan reads 1–3, the rights core (Piece B and C) | all four readers per round (D2236) | all four | **116 commits, +8,269 lines (tests included) since Fable's 21 Nov read** — due in phase 4's four-reader read (D2244) |

For multi-squadron, Fable read: the plan, the batch's own diff in every area, and the three core files whole. Fable has **not** read reshape phase 3 onward. That includes sync.ts +617 lines, timeline.ts +207, perms.ts +205, undo-wire +164 and plan-foreign +217. Phase 4 is already planned to cover it.

## Ranking of what Fable has not read (or read only long ago, in a narrow slice)

Rough count of faults found earlier, as "fixed" marks in each area's evidence sheets: Leave War 623 (48 sheets), Tracker 313, Inputs 307, Edit Schedule 290, accounts 192, OIL 145, SANS 137, saving 134, Medical 25, Quals 17. On Leave War M2–M5b, walks "found faults every time".

1. **Leave War**, beyond M1, M4 and the multi-squadron diff
2. **Inputs** since 13 Oct
3. **The screens' edit and view guards for each kind of sign-in** (accounts, view.ts, Admin → Users, Quals, the member build). This is his D2259 question.
4. **OIL outside the war**, the October jobs
5. **Edit Schedule and amendments** since mid-October
6. Tracker
7. Undo / history (the part before the reshape)
8. Medical
9. Quals beyond its permission doors (folded into 3)
10. SANS calendar
11. Export and print
12. The rules engine: low risk, a verbatim port with 728 original tests. But about 1,900 non-port lines were added since mid-October (validate, inputs). Worth a later look.

Leave off: the commit gate core, the bell, saving (all read recently or thoroughly), Insights, the IT flow guide, and the multi-squadron reshape tail (phase 4 already gives it Fable).

## The top five

**1. Leave War.** It has the most code (40,554 lines), the most change since D903 (+53,707 added lines), and the most faults found (623 marks). It touches all four high-consequence things. A war approval writes a leave input into the schedule, which decides who counts as present. Its OIL tracker and balances carry OIL. A member types his own figures (M5a). An admin's place-and-approve command came in M3. Fable saw only M1 (open dates) and M4 (Approvals). M2, M3, M5a, M5b, roster restore and the 30 Oct – 6 Nov fixes had one Opus reader and no Astra.
- **Brief.** Read leavewar/state/store.ts, leavewar/sync.ts, leavewar/inputgate.ts, leavewar/engine/{counters,warrecs,oiltracker,codes}.ts, ui/BalancesPage.tsx, ui/BidPicker.tsx, ui/SettingsSheet.tsx (holidays import). Rulings: `.claude/rules/decisions/leave-war.md` and `oil.md`.
- **Questions.**
  - (a) Does every war write that lands on the schedule go through the commit gate? That means approve, place-and-approve, a rejected course, restore and Undo. Does it land the same on a published day as on a working copy?
  - (b) Can a correction, a member's own figure, a leave-year roll or an Undo leave the war's OIL or leave totals disagreeing with the schedule's OIL Earn?
  - (c) The store has dozens of command paths. Are "who may write this row" (a member's own row against an admin's) and the posting-date limits judged in one place, or per door, where they can drift?

**2. Inputs since 13 Oct.** It touches the published record: the 3 Nov "Make public on a published day" and "To go out". It touches saved data: the LATE drop and late marks by the squadron's own cut-off. It touches permissions: filing for others, reshaped 21 Nov (C6). It also raises the OIL question on an input. About 2,600 lines changed, 94 commits, and the 3 Nov batch had no Astra.
- **Brief.** Read ui/inputedit.tsx, InputWindow.tsx, InputsPage.tsx, InputsCal.tsx, reqdoor.ts, HolidaysPanel.tsx, and engine/inputs.ts (non-port additions). Rulings: `inputs.md` and `oil.md`.
- **Questions.**
  - (a) Does an input filed or changed on a published day always become a pending amendment, and never touch the issued copy? Check every door: window, calendar, list, someone filing for another person.
  - (b) Are "whom may I file for" and the late mark judged once, so the picker and the save cannot disagree?
  - (c) Do LATE, Make public and their Undo restore exactly what was there?

**3. Edit and view guards for every kind of sign-in.** This is his stated worry: the Plan holder was missed, and only the master admin was thought about. Fable has read the commit gate itself recently. What it has not read is the screen side. Does each page offer edit only to those the gate lets through, and refuse cleanly otherwise? This covers a master admin, a squadron admin, an admin holding Plan or View of another squadron, a member, a person waiting for access, and a man who has moved squadron. The 5 Nov member build (who may tick Schedule) had neither Fable nor Astra. view.ts (1,475 lines) has never been read by Fable since September. This complements the table job in his D2259 part (1). It does not replace it.
- **Brief.** Read state/view.ts, state/accounts.ts, state/person-delete.ts, state/people-settings-commit.ts, state/quals-write.ts, ui/Shell.tsx, ui/UsersPanel.tsx, ui/AccessScreen.tsx, ui/AdminPage.tsx, ui/QualsPage.tsx. Use state/perms.ts as the reference only. Rulings: `people-accounts.md` and the `[MSQ-PLAN-AUDIT]` lines.
- **Questions.**
  - (a) Is there any control a View holder or a member can press that the gate refuses only after the fact, or worse, a write that skips the gate (a direct store write or a setting)?
  - (b) Does each page decide "can edit" from the same rule the gate uses, or from a role check of its own that forgets the Plan holder?
  - (c) What does a man see the day after he moves squadron, or while waiting for access, on each page?

**4. OIL outside the Leave War.** Top consequence, small code (about 4,500 lines), so cheap to read. The 14–20 Oct jobs each had one Opus reader by his word: switch to this plan, uncancel / load a version, Unpublish restoring the AL marks and the OIL box, the "Only some days" calendar. Fable last read the OIL rules in this path on 13 Oct, plus one item on 8 Nov.
- **Brief.** Read ui/oilmode.ts, oilwait.ts, OilWaitSheet.tsx, OilDayList.tsx, engine/oil.ts, engine/oilev.ts, and the unpublish path in state/sched-commit.ts. Rulings: `oil.md`. The memory note "OIL truth = latest published version" applies.
- **Questions.**
  - (a) After Unpublish, load-an-older-version or a plan switch, is a person's OIL always that of the latest published version?
  - (b) Can an unanswered OIL question be lost or double-counted when a day becomes a holiday afterwards, or across a plan switch?
  - (c) Is OIL computed in one place, or do the board, the answer list and the war each work it out?

**5. Edit Schedule and amendments since mid-October.** It touches the published record. Since 15 Oct: 148 commits and +2,373 lines. That includes the 19 Oct "21 schedule and amendment fixes", rally and standby, week swipe and print, and React Doctor rewrites. Fable has read only the 8 Nov marks and the multi-squadron diff since then.
- **Brief.** Read ui/board.ts, drag.ts, interactions.ts, html.ts, board-html.ts, pendlist.ts, state/flyplan.ts, plan.ts, weekrows.ts, sched-commit.ts. Rulings: `scheduler.md`.
- **Questions.**
  - (a) Does every drag, puck removal, rally or standby edit on a published day mark the right AL, and only for that day (amendments are per day)?
  - (b) Can a saved-plan activation or an Undo across a publish leave the issued copy changed?
  - (c) Do the many separately written board paths (drag, right-click, keyboard, phone) share one write path, or does each re-derive the marks?

**Tonight, the top three for Fable:** the Leave War, Inputs, and the sign-in guards.

Two things to tell him with the list:
- The multi-squadron reshape since Fable's 21 Nov read (116 commits) is already due Fable's read in phase 4.
- The rules engine is protected by its 728 original tests, but has about 1,900 lines of newer, non-port code worth a later look.


## 2. The Leave War read (Fable, copy at 123f2b9d5)

FABLE-LW-READ

Copy read: `D:\raptor-work\reads\lw-fable` at commit 123f2b9d5. Findings file kept as I went: `D:\raptor-work\job3\lw-findings.md`. Every proof test is in `D:\raptor-work\reads\lw-fable\raptor-port\src\leavewar\fablelw-*.test.ts`; no other file in the copy was changed. One slip to own: I tried to open `D:\raptor-work\job3\list.md` (outside my remit); the permission system refused it and I read nothing there.

Headline: the Leave War's doors are in better shape than its size suggests. Two confirmed findings (one MED, one LOW), no HIGH. The larger risk is structural, in section 1.

## 1. The shape — where the design breeds faults

**S1. Two readers of "what a man holds on a day", with different reach.** The leave-year engine (`engine/leaveyear.ts`, fed by `store.ts dayRecsOf`) reads the absence index on every date. The OIL ledger (`engine/oiltracker.ts oilLedgerFor`), the older figures (`engine/counters.ts`), manning and the grid read each period's own day views, so they see nothing dated outside every period. F1 lives here; D1578 (OIL earned on a weekend with no period) is the same family, as is an award "dated in no period, drawn on no cell".
*One change:* every figure reads one person-and-date index covering all dates; periods supply only holidays and the grid's window. D1579's OIL table should cover OIL taken as well as OIL earned.

**S2. "May this person write this" is judged in four layers, about 30 places.** (a) each door's own inline check; (b) the "would it go" twins the windows ask (`cellProblem`, `moveRecordsProblem`, `decideWhy`/`approveWhy`, `balanceProblem`, `recordTakeable`, `requestMovable`, `awardsIn`); (c) the commit gate (`state/perms.ts`); (d) a separate set for Undo/Redo (`store.ts restoreBlocker`, `state/person-delete.ts` posting and deleted-man restore problems). They agree today (walks in section 3), but agreement is held by tests, not structure. `cellProblem`'s comment says it "runs the same guards, never a second copy"; it is a second copy and already differs from `setCell` (the other-squadron-day refusal is in `setCell` only — the multi-squadron work's, noted not counted). Four doors run the command, let the gate refuse, then re-read the store to learn whether it landed (`setRequestWords`, `decideRequests`, `moveRecords`, `setTypedBalance`).
*One change:* one pure `warVerdict(actor, change)` in the war's engine, called by the doors (for their words) and by the gate (at the commit).

**S3. One command record is a whole person-day, though it holds unrelated facts.** `lw.cell` is the full list for one man on one date: his bids, replaced-bid notices and the schedule's own OIL credit. Storage is per record; Undo and the gate work per cell. So the OIL pass's write shares a record with a person's bid, and any Undo touching that day is reconciled afterwards by the pass. Hand awards were moved to the ledger for this reason (N16).
*One change:* give the schedule's credit its own collection (D1579's table), so the pass never writes a record a person can Undo.

**S4. Control flow by ambient flags.** `quiet`, `CLEAR_ONLY`, `HIST.lock`, `LW_READY`, `LW_RESTORING`, `LW_PROJ_PENDING`, `LW_SYNC_TURN`, `SYNCING`, sync's `DOOR` counter and `TRYING` decide whether a write saves, notifies, makes an Undo step or stands aside for a rule. Each is set and cleared around calls reaching several functions deep; `persistNotify` has five branches chosen by them. A new door that omits one fails silently.
*One change:* pass an explicit write context (who, in which command, quiet or not) down the calls.

**S5. Retired engines still exported.** The war-only snapshot Undo (`lwUndo`/`lwRedo`/`historyApply`) restores records and ledger without the Inputs; the repo's own `undoaudit.test.ts` says it "cannot see the Inputs", and no screen calls it, but one import would un-approve a leave and leave its Input standing. The pre-M5a balance engine (`balanceOf`, `FIGURES`, openings) still computes LVE and the rest a second way. `grantTo` still credits any pool and the leave-year engine still honours such entries, though no screen gives them.
*One change:* delete all three.

**S6. Nobody asks whether the person exists.** `grantTo` and `balanceProblem` check the roster; `setCell`, `placeApproved`, `fileStraight`, `setDayAward`, `grantOilDays` do not (F2).
*One change:* fold it into S2's one verdict.

## 2. Findings

### F1 — MED — OIL leave on a day no leave period covers is not taken off his OIL
- **Case.** Ranger has 5 OIL. In November he files OIL leave on the Inputs page for Mon 7 – Fri 11 Feb 2028; no period covers 2028. His OIL still reads 5 — in the OIL tracker, My leave, the bid windows' "left" and the below-zero ask. LL filed the same way comes off his LVE at once. When an admin later creates the 2028 period, his OIL drops to 0 by itself. Until then he can book the same 5 days again inside a covered period with no warning.
- **Should do.** Come off at once, as every other leave kind does (the leave engine's reading 17, "leave on a date no period covers still counts"). D1578 covers OIL earned on such a day; nothing I found rules that OIL taken may wait.
- **Cause.** `src/leavewar/engine/oiltracker.ts oilLedgerFor` builds "OIL taken" only by walking each war's views; `store.ts figureCtxOf` hands it `sources: getState().wars` and nothing else.
- **Fix.**
  1. In `store.ts`, add a memoised `outsideSource()` keyed on `absenceRows()` and `state.wars`: for each person, each date in the absence index that `warHolding` does not hold → `dayView(list)`; return `{ grid: {}, states: {}, views }` with no `period`.
  2. `figureCtxOf()`: `sources: [...getState().wars, outsideSource()]`.
  3. Nothing else: `chargedDays` already charges a period-less source by the weekday rule, and `oilLedgerFor`'s loop then meets those dates. `balanceAfterFill` and `oilCreditBidAgainst` read the same ctx.
  4. Re-run `fablelw-oil-outside.test.ts`; add a case creating the period afterwards (the figure must not move).
- **Proof.** `src/leavewar/fablelw-oil-outside.test.ts`: "… and OIL there must come off his OIL at once too" — `AssertionError: expected 5 to be +0`; next case — `expected { between: 5, after: +0, myLeave: +0 } to deeply equal { between: +0, after: +0, myLeave: +0 }`. Its LL twin passes.
- **Caveat.** The test files the leave through the test kit's `fileAbsence`, not the Inputs page's own door.
- **Reachable on screen today:** yes — OIL is a leave kind on the Inputs page, and next year's dates before its period exists are the ordinary case every November–December.

### F2 — LOW — the war writes leave and OIL for an id that names nobody
- **Case.** `placeApproved([{ personId: 'nobody', … }], 'LL')` writes a bid and a real approved-leave Input; `grantOilDays` (and by reading, `setDayAward`) writes an OIL award. `grantOil` refuses the same id ("Pick at least one person").
- **Cause.** `store.ts` `setCell`, `placeApproved`, `grantOilDays`, `setDayAward`, `fileStraight` never check the id.
- **Fix.** One helper `knownPerson(id)` = on `state.people`, in `state.postOuts`, or `HIDDEN_IDENTITY(id)` (a SANS man while hidden — as `balanceProblem` accepts); refuse at the top of those five doors.
- **Proof.** `src/leavewar/fablelw-nobody.test.ts`: `expected { approved: 1, inputs: 1 } to deeply equal { approved: +0, inputs: +0 }`; `expected [ { id: 'ol-…' } ] to have a length of +0 but got 1`.
- **Reachable on screen today:** no — the grid passes only its own rows. I found it because my first walk used a callsign as an id and the store accepted everything.

### Question (c) — each door that judges for itself (`store.ts` unless said)
- **Row and open day, inline:** `setCell`; `cellProblem` (its twin); `clearRequestsAt` (inside `clearCells`); `clearRecordById`; `recordTakeable`; `requestMovable` / `absenceMovable`; `setRequestWords` (row only, by D1150); `setRemarksOn` (row, plus its own open-run rule); `fileStraight` (row only, by D1318; OTH admin); `ackReplacement` (its own rule, not `canEditRow`); `awardsIn`, `awardIdsAt`; `balanceProblem` (own row and the lock).
- **Admin only, each its own line:** `placeApproved`, `setBidStates`, `decideRequestById`, `decideRequests`, `changeAbsenceById`, `grantTo`, `updateLedgerEntry`, `removeLedgerEntry`, `setDayAward`, `grantOilDays`, `setOilPolicy`, `writeGrades`, `setPersonGrade`, `setBalanceLock`, `holidayPlan`, `holidayRemove`, `holidaysImport`, `openGuard`, and the event, manning and group writers.
- **Posting-date limits:** one body for every approve door (`sync.ts approveWhy` → `postingOutWhy`, `refusedWhole`) — good; a second for Undo/Redo (`state/person-delete.ts`); Move is exempt by ruling (D1541/D1545); `fileStraight` and the award doors never ask it.
- **Behind all of them:** the commit gate, `state/perms.ts`.

## 3. Checked and found sound

- **(a) One commit gate.** Approve, place-and-approve, put-back, delete, move and filing straight all write the Input through `sync.ts doorWrite` → `writeInputsBatch`, inside the war's own command; the absence rules (`inputgate.ts`) run inside it. The war-only Undo is not wired to any screen.
- **(a) A published day.** `fablelw-published.test.ts` (green, and checked able to tell a changed day from an unchanged one): leave the war approves on a published Monday leaves the issued copy byte-identical and raises the same pending change as the Inputs page's filing; so do Undo, Redo, place-and-approve and Delete. "A refused course" and "restore" I checked by reading only (`absences.ts warCounts`; the restore checks named above) — no test of mine.
- **Random walks** (`fablelw-fuzz.test.ts`, `-fuzz2`, `-fuzz3`), admin and a member, bids in every half and kind, clear, move, remarks, approve, refuse, put back, place-and-approve, Grant OIL, a medical or leave filed on the Inputs page, plus (walk 3) filing straight, typed figures and ledger edits. After every press: never two live bids on one half, never a live bid over leave or a medical, never two clashing absences, every figure a half, OIL parts summing to the balance; Undo restores exactly and Redo returns exactly. All green.
  - Walk 1: 70 seeds × 60 presses, but with a second "person" who was not on the roster (that is how F2 surfaced); re-run with two real people for 30 seeds, including a reload from storage after each seed.
  - Walk 2 (member writes): 50 seeds, re-run 30 with real people — a member never changed another row, the ledger, an Input, or a closed or past day beyond deleting his own pending bid or its words.
  - Walk 3: 40 seeds, re-run 25.
  - **Limits:** Undo is tested only straight after a press in the same sign-in (the app clears the list at sign-in). In walk 3 the standalone Undo/Redo presses, Approve, admin Move and admin Delete changed nothing in the 6 seeds I counted, and my snapshot does not include holidays — so walk 3 adds evidence only for filing straight, typed figures and ledger edits. Approvals' own writer (`decideRequests`) is in no walk.
  - Only difference seen: after an Undo of a Delete that took an award, the award returns at the end of the ledger list. Every reader sorts; harmless.
- **(b) The schedule's OIL** (by reading `sync.ts desiredOilCells` / `runOilPass`): credit comes only from the issued version's frozen evidence, both ways. A holiday declared late waits for republication; one removed does not sweep credit; unreadable weeks are protected; awards live apart and add up. No product door drops a stored week (`stashDrop` has no caller), so the reverse sweep cannot collect a real credit that way.
- **(b) Leave-year engine** (by reading `engine/leaveyear.ts`): carried-forward first, the 1 Jan roll-over, overdrawn years, grade timing, leave moved or deleted after typing, a pilot's 15-day run — all follow D1479, D1224, D1235, D1474, D1489, D1490. `fablelw-holiday-late.test.ts` (green) pins that leave approved before the figure was typed does not move when a holiday is later declared on it, and leave approved after does. I first expected otherwise; it is right when the official figure already knew the holiday. If the official app learns of a holiday after typing, the figure needs re-typing — worth one line to the owner, not a fault.
- **Presence** (by reading `dayview.ts`, `absences.ts`): away is by halves, never double-counted; ATT B, a refused bid and an award remove nobody; cancel and information-only marks reach only Ground Programme rows, so leave and medicals cannot be silently cancelled while still counting.
- **Holidays by file** (by reading): preview read again at Add, all-or-nothing, one Undo step; day-first date reading is stated as the agent's reading.
- **A member's typed figure** (by reading, plus existing `m5a-gate.test.ts`): store and gate both check own row, lock at save time, shape and rebuilt snapshot.

## Attention ranking for the owner
1. F1 — small and safe to fix; matters most around year-end.
2. S2 with S6 — one verdict for "who may write"; the most likely source of the next fault.
3. S5 — delete the three retired engines before the database step.
4. S1 and S3 — fold into D1579's OIL table.

Not run: the whole suite, a build, any browser test. Nothing committed; the copy has no git.


## 3. The Inputs read (Fable, copy at 2a04aaa99)

FABLE-INP-READ — Fable, Inputs since 13 Oct, copy D:\raptor-work\reads\inp-fable at 2a04aaa99 — saved by the host 22 Nov 26 from the reader's final reply. Proofs: src/ui/fableinp-window.test.tsx (4 red), src/ui/fableinp-late.test.tsx (2 red, 2 green controls), src/state/fableinp-published.test.ts (7 green). Running notes: D:\raptor-work\job3\inp-findings.md.

Headline: four faults proved; none puts a wrong thing on the issued schedule. Two lose what a person just saved while the window says saved; two in the LATE mark for inputs of several people. Filing and changing on a published day held at every door tried (7 green); Undo of LATE and "Make public" held.

Shape: (1) "Has anything changed?" asked four times with four field lists (the window's nothing-changed check ×2, its "OIL answer alone" shortcut, the writer's says) — one function returning changed fields; (2) commitInput rewrites the draft before the inner save (passes the record's docIds) — pass the draft whole; (3) the late date lives in two places read two ways — one "this man's late date in this input" = the later of the two.

F1 — a document attached to (or taken off) an input of several people is never saved; window says "Input updated". Saber opens a saved Meeting for two men on 13 Oct, Document → orders.pdf → Save (also ✕ on an existing document). D1150, D655. Cause: ui/inputedit.tsx commitInput — says never compares documents; inner call passes docIds: rowDocIds(r). Fix: documents in says; pass draft.docIds through. Proof fableinp-window › F1 (3 cases).
F2 — an Other's "Goes to" change thrown away when the same save answers the OIL question; window "OIL answer saved" (also an Attach's "To"). D1356, D1368. Cause: ui/InputWindow.tsx saveNow "an OIL answer alone is not a change" branch — WIN_FIELDS lacks to/goes (the 3 Nov fix added them to the branch above only). Proof fableinp-window › F2.
F4 — an input changed after the cut-off reads LATE for some of its people and on time for a man added earlier (his own on-time date hides the input's late date). D742; the one-rule plan §4.1. Cause: engine/inputs.ts linesOf and facesOf — if(e.mod!=null) line.mod=e.mod unconditional. Fix: the later of the two. Proof fableinp-late › F4.
F3 — the LATE chip of a man added late to a shared input under Unavailable cannot be dropped; the tap says "LATE mark shown". D1586. Cause: ui/html.ts lateChip draws from the man's face; ui/interactions.ts routeClick data-lateoff → lateMates returns the record alone (on time) → nothing written, note said anyway. Fix: lateMates returns the record's faces under Unavailable; note only when something changed. Proof fableinp-late › F3.
Not proved: InputsPage.tsx reviseOil holds the record object across its question (an Undo under the open sheet writes to a dead object, says "OIL decision updated"); a refused "Make public" still says "Note is scheduler-only again"; saveFromRow checks per-person refusals for the first person only.
(a) published day: pending at every door, issued copies byte-identical (7 green). (b) judged once: whom-may-I-file-for yes (offersFor, whoDoorRefusal, gate → inputWhoProblem; mayFileInputFor); the late mark no (F3, F4). (c) LATE/Make public and Undo restored (green). (d) F1, F2; nothing lets someone change what they may not.
Sound: reqdoor.ts; commitNewInput/commitInputEdit backstops; caldrag.ts; follow-the-record; people picker cannot be emptied; HolidaysPanel writes go through the war's commands; planning notes and day titles never reach the schedule. Not covered: SANS calendar, Medical cards, InputsSettings, multi-squadron.


## 4. The OIL-outside-the-war read (Fable, copy at 2a04aaa99)

FABLE-OIL-READ — Fable, OIL outside the Leave War, copy D:\raptor-work\reads\oil-fable at 2a04aaa99 — saved by the host 22 Nov 26 from the reader's final reply. Proofs: raptor-port/src/leavewar/fableoil-sans-crowd.test.ts (3 red), fableoil-unanswered-publish.test.tsx (1 red). Running notes: D:\raptor-work\job3\oil-findings.md.

Headline: two confirmed findings; the Unpublish / load-a-version / plan-switch paths held in every run. The one that can cost a man OIL: a man posted out as SANS drops out of the ALL AVAIL crowd on days before his posting, so the next amendment of such a day takes away OIL he earned.

Shape: every republication re-reads today's world for a past day (deleted/archived read by date, SANS not) — read every roster fact by the day's date; the open OIL question is shown on the Inputs side only — the day reads oilOpenOn; two ways to write one answer (the question's sheet replaces the whole record, inp.oil = {...oil}, so "No OIL" on a re-ask turns earlier Yes days to No) — write only the days asked; "its row is gone" has two outcomes by path (taken off by hand: dormant; dropped by a plan switch or load: fresh, still earns on its own answer) — one predicate; a stored "current version" pointer beside the versions (dayCurVerIn trusts it) — current = highest surviving sequence.

F1 MEDIUM — SANS posting drops a man from the crowd of earlier days. Mon 13 Jul 26 a public holiday with one squadron event for ALL AVAIL 08:00–15:00, published; Rocky credited a full day; Wed 15 Jul he is posted out as SANS, the posting runs → the published Monday reads 2 pending, sign-offs fall; the next amendment (a remark only) publishes without him, the war removes his full day for 13 Jul. Should: the crowd of a day before he became SANS stays as it went out, nothing pending. Rulings: D283; D327 by its words (given for an archived man); D297, D44, D45, D142 — no ruling names SANS here (the reader's reading by D327). Cause: leavewar/sync.ts availableFor — if (p.san && !(engaged && engaged.has(id))) continue reads today's tick on every date. Same line, not proved: a hand SANS tick on Quals (no date kept); SANS taken off (he joins past crowds — a scratch run read 1 pending); "Transfer to Sqn" sets SANS too. Fix: read SANS by date — a posting-made one (sanBy 'po') from the posting date; a hand tick needs its tick day kept (the owner's word). Proof 3 red.
F2 LOW-MEDIUM (the reader's reading of D81) — a weekend whose work is an input with no OIL answer publishes in silence: Sat 18 Jul holds only Bane's Training 08:00–17:00, OIL question unanswered; the four sign, Publish day → "Saturday published and approved", no OIL line, the open list does not open; Bane nine hours, no OIL; only the Inputs "OIL?" tag and his bell show it. D81 "A worked weekend that earns nobody any OIL says so — on the day and at publish, with the reason." (built for a desk with no times only); a load and a plan switch open the day's open list (D818, D865), a publish does not. Cause: engine/validate.ts no advisory for an unanswered question; sync.ts publishFlagsBids / oilBlindLine speak of blind desks only. Fix (owner's call which): one advisory from oilOpenOn with the publish note saying it, or publish opens the one list as the load does. Proof 1 red.
Not proved: the sheet's whole-record write; the current-version pointer; fresh vs dormant after a plan switch or load.
(a) always the latest published version: yes in every run. (b) not lost, not double-counted (question never stored; a holiday made afterwards asks at once; one envelope per man per date); gaps F2 and the sheet's write. (c) one body (oilEarnedWork + oilAmount on the day's block); the answer list and sheet use inputOilAmt for the label and stored number, used by credit only as yes/no — "Yes · HO" can post FO when published work stretches his day, by design. (d) F1, F2; no permission hole.
Sound: Unpublish, reissue, load of the Original, plan switch on a published day; a holiday declared after publication; an input across two weeks; OIL Earn decisions ride the day's content; sign-offs break on an answer change; day templates; year boundary, Off day, cancelled/information-only inputs; home squadron, delete cutoff, archive stints read by date.
