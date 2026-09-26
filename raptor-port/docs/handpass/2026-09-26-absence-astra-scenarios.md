# Astra report — absence retest plan review

This was a read-only code review. I did not edit files, build the app, run tests, or execute the browser walk.

## 1. What the plan misses

1. **Calendar drag bypasses both medical confirmation sheets.** The plan asks R3 for “the same refusals as the dialog,” but a dragged input goes directly from its shifted draft to `commitInputEdit`. That commit constructs and applies the medical trim plan without raising `MedClashConfirm` or `UpchitConfirm`. The ordinary editor explicitly raises those sheets first. Add separate drag cases for a different-type downchit and an upchit; test Cancel as well as Save. This is a confirmed missing call site.  
   Code: `raptor-port/src/ui/caldrag.ts:83-129`, `raptor-port/src/ui/inputedit.tsx:912-968`, `raptor-port/src/ui/inputedit.tsx:1111-1114`, `raptor-port/src/ui/inputedit.tsx:1655-1688`, `raptor-port/src/engine/medical.ts:169-184`, `raptor-port/src/engine/medical.ts:197-237`.

2. **`iu:` reassign has the same confirmation hole.** `reassignInput` changes the person and calls `commitInputEdit` directly. Moving a downchit to someone with a different medical can therefore trim that person’s existing status silently; reassigning an upchit can silently shorten/remove the new person’s medical records. Add both variants, including Cancel. This is also a confirmed missing call site.  
   Code: `raptor-port/src/ui/inputedit.tsx:1178-1219`, `raptor-port/src/ui/inputedit.tsx:912-968`, `raptor-port/src/ui/inputedit.tsx:1111-1114`.

3. **R9 names the wrong component.** `PersonSheet` edits seat, band and SXO only. Post-in and post-out are separate `PostInSheet` and `PostOutSheet` surfaces, mounted separately by `Matrix`. Replace R9’s promise and add independent rows for both posting sheets, including their “Place leave or OIL here instead” door.  
   Code: `raptor-port/src/leavewar/ui/PersonSheet.tsx:17-77`, `raptor-port/src/leavewar/ui/BidPicker.tsx:964-1055`, `raptor-port/src/leavewar/ui/BidPicker.tsx:1059-1130`, `raptor-port/src/leavewar/ui/Matrix.tsx:4181-4216`.

4. **R10 combines two different writers and tests a superseded hours rule.** `CreditForm` is the generic ledger/balance grant form. The day-sheet award editor is inline in `BidPicker` and stores one quantity, reason and giver—no hours. The later N13/N19 model says an award is money owed, not attendance. Remove “hours” and the everything-world’s “award with hours”; split the day award from the tracker/balance grant.  
   Code: `raptor-port/src/leavewar/ui/CreditForm.tsx:65-145`, `raptor-port/src/leavewar/ui/BidPicker.tsx:156-189`, `raptor-port/src/leavewar/ui/BidPicker.tsx:499-581`, `raptor-port/src/leavewar/ui/Matrix.tsx:4415-4423`, `raptor-port/src/leavewar/engine/dayview.ts:152-158`, `raptor-port/src/leavewar/engine/dayview.ts:316-332`.  
   Ruling conflict: `raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md:37-43`, `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md:318-340`, `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md:452-487`.

5. **The plan omits `RaptorSheet`.** This is the specialised read-only destination for an Inputs-owned leave and an automatic credit. It deliberately routes the reader to either Inputs or the published schedule. Add it because it is less shared than `BidPicker` and therefore high-risk for missing wording or actions.  
   Code: `raptor-port/src/leavewar/ui/BidPicker.tsx:877-960`, `raptor-port/src/leavewar/ui/Matrix.tsx:4083-4106`.

6. **The pending list and amendment panel are absent from R1–R24.** The pending list is a body-level overlay with one row per issued-versus-working change and click-to-jump behavior. `ALPanel` separately lists changed days and publishes one AL per day. Add both as independent surfaces; they are the primary visible proof of D177–D179.  
   Code: `raptor-port/src/ui/pendlist.ts:1-21`, `raptor-port/src/ui/pendlist.ts:128-159`, `raptor-port/src/ui/pendlist.ts:340-423`, `raptor-port/src/ui/ALPanel.tsx:13-70`.

7. **The confirmation overlays are not roll-called as surfaces.** Add `MedClashConfirm`, `UpchitConfirm`, `OilConfirm` and `DocConfirm`, testing stacking, Cancel, Escape, Save, phone fit and return to the parent editor. Their existence only under R2 obscures the alternate-door defect.  
   Code: `raptor-port/src/ui/UpchitConfirm.tsx:19-76`, `raptor-port/src/ui/MedClashConfirm.tsx:39-105`, `raptor-port/src/ui/InputsPage.tsx:1149-1170`, `raptor-port/src/ui/inputedit.tsx:1640-1697`.

8. **`DocViewer` is a separate global overlay and needs its own row.** Test image, PDF, no-document state, several files, paging, Escape, member/admin edit affordance and the pending-upchit door.  
   Code: `raptor-port/src/ui/App.tsx:19-35`, `raptor-port/src/ui/DocViewer.tsx:23-79`, `raptor-port/src/ui/MedicalView.tsx:113-127`.

9. **The plan compresses three figure surfaces into R11.** Add `FigureBreakdownSheet` and `PersonFiguresSheet`; they are distinct readers from `FigureCell`, while `BalanceBar` is a writer. Verify that all four obtain the same numbers.  
   Code: `raptor-port/src/leavewar/ui/Matrix.tsx:4126-4133`, `raptor-port/src/leavewar/ui/Matrix.tsx:4240-4258`, `raptor-port/src/leavewar/ui/FigureCell.tsx:44-112`, `raptor-port/src/leavewar/engine/counters.ts:361-405`.

10. **Schedule CSV and print/PDF should be separate export rows.** They use different renderers even though both select issued data for published days and live data for unpublished days.  
    Code: `raptor-port/src/ui/export.ts:44-78`, `raptor-port/src/ui/printpdf.ts:103-132`.

11. **R21 promises more history than is wired.** Input addition, deletion and medical cascade actions explicitly call `logAction`, but ordinary edits, calendar moves, reassignment and the Leave War approval/move doors do not. `HistoryModal` only renders `ELOG`. Add direct history checks for every promised action. This is a confirmed missing-call-site family, not merely a visual risk.  
    Code: `raptor-port/src/ui/inputedit.tsx:835-880`, `raptor-port/src/ui/inputedit.tsx:1325-1346`, `raptor-port/src/ui/inputedit.tsx:912-1114`, `raptor-port/src/leavewar/sync.ts:252-362`, `raptor-port/src/leavewar/sync.ts:388-550`, `raptor-port/src/ui/HistoryModal.tsx:53-83`, `raptor-port/src/engine/editlog.ts:205-224`.

12. **N15 should not be expected in draft.** The plan says every stage and includes draft in the door check, but the implementation deliberately permits decisions only in open, closed and published stages. Draft must be a negative assertion.  
    Code: `raptor-port/src/leavewar/engine/stages.ts:149-173`.

13. **Several live rules need named scenarios rather than only inclusion in a broad sweep:** Q8 course/OD plus leave; Q12 the no-leave-day warning; Q14 member filing through Inputs while the war is closed or outside the bid window; Q15 SANS never becoming work/OIL; exact back-to-back windows; H6 overnight medical conflict on day two; invalid PI-after-PO and PO-before-PI; noon-as-PM; and an archived person whose official dates preserve the row.

14. **The everything-world lacks several published-delta states.** Add a course filed late, an input moved onto and off a published day, a deleted input, a calendar-dragged input, a war approval, an upchit cut and a medical takeover. Each must have a pending-list line, an AL-panel count and a frozen issued comparison. The pending machinery distinguishes filed, moved-off, deleted and edited rows.  
    Code: `raptor-port/src/ui/pendlist.ts:128-159`, `raptor-port/src/ui/ALPanel.tsx:32-65`.

15. **The order requirement is not assigned to a walker.** Five pairs × two orders × published/unpublished × undo/redo/reload is at least twenty base traces before half-day variants. Give that matrix its own walker rather than leaving it as an unowned paragraph.

16. **W3 and the host are overloaded.** W3 combines gestures, stages, war switching, undo/redo, posting and storage faults. The host combines R16–R24, all accounts, every published-door delta and cross-surface checks. Split orders and lifecycle boundaries from gesture testing.

17. **Phone and desktop are tested as two widths, not as one lifecycle.** Add an open sheet/window/confirmation during a live 390px → desktop resize and back. `AvailWindow`, for example, intentionally keeps separate phone and desktop placement state.  
    Code: `raptor-port/src/ui/AvailWindow.tsx:80-143`.

18. **R23 needs a precise negative expectation.** Week Insights does not read the absence ledger directly: its “available” list is people not on the flying programme. Keep the existing `[INSIGHTS-WORKING-COPY]` issue out of new findings, but record explicitly whether an absent person appears there.  
    Code: `raptor-port/src/engine/insights.ts:8-48`, `raptor-port/src/ui/Modals.tsx:64-104`.

## 2. The roll-call, checked

| Row | SHOW | ACT | Same pixels / code evidence |
|---|---|---|---|
| R1 Inputs table | Yes: stored type, dates/times, remarks and document controls. | Add; admin any row, member own row; edit/delete; CSV. | Filters, calendar/medical switches and export share the header. `InputsPage.tsx:331-350`, `InputsPage.tsx:943-951`, `InputsPage.tsx:953-1133`. |
| R2 add/edit editor | Yes. | Save/delete and medical/OIL/document decisions. | Parent editor plus four confirmation overlays. `inputedit.tsx:1518-1699`, `InputsPage.tsx:1149-1170`. |
| R3 calendar | Yes: input chips, planning rows and remarks. | Hold/add, open and drag. **[MISSING] medical/upchit confirmation on drag.** | Input chips share cells with planning pucks, notes and `+N more`. `InputsCal.tsx:928-986`, `caldrag.ts:63-129`, `inputedit.tsx:1655-1688`. |
| R4 medical view | Yes: down, pending upchit, recent upchits and document count. | Change as-of date; open documents; viewer can lead to edit/upchit. | Cards share type, status span, remarks and document count. `MedicalView.tsx:75-127`, `MedicalView.tsx:140-200`, `DocViewer.tsx:67-79`. |
| R5 war cell | Yes: main record, `+n`, amber and state. | Tap routes according to owner/type/state. | Main code is selected by ladder; amber wins over `+n`. `dayview.ts:105-169`, `dayview.ts:260-314`, `Matrix.tsx:4083-4124`, `Matrix.tsx:4181-4216`. |
| R6 DayList | Yes: every contribution in ladder order. | Per-record approve/Ack/refuse/clear/move, remarks, award edit and notice acknowledgement where allowed. | Conflict explanation, all records and per-record buttons share the sheet. `DayList.tsx:62-107`, `DayList.tsx:111-196`, `DayList.tsx:199-220`. |
| R7 BidPicker | Yes. | File leave, decide a bid, grant award, post in/out and move where role/state allows. | Leave choices, current record, decision row and folded admin actions. `BidPicker.tsx:195-208`, `BidPicker.tsx:450-581`. |
| R8 SelectSheet | Yes: rectangle and skip outcome. | Fill, decide, delete, move and one-person post-out. | Selection span/count and “written/skipped” message. `SelectSheet.tsx:74-108`, `SelectSheet.tsx:110-196`. |
| R9 PersonSheet | **No to the stated promise.** It shows seat, band and SXO only. | Edits those roster attributes. | Category is painted with those controls. This is a plan/component mismatch; posting lives in R26/R27. `PersonSheet.tsx:17-77`. |
| R10 CreditForm | **No to the stated promise.** Generic pool grant; no leave code or worked-hours field. | Add/subtract ledger value with date/reason/giver where required. | Actual day award is inline in `BidPicker`; one quantity derives FO/HO. `CreditForm.tsx:65-145`, `BidPicker.tsx:164-189`, `BidPicker.tsx:537-581`. |
| R11 balances/figures | Yes. | `FigureCell` opens readers; admin drag raises `BalanceBar`. | Top value and used lines share the figure cell. `FigureCell.tsx:44-112`, `BalanceBar.tsx:17-48`, `Matrix.tsx:4240-4258`. |
| R12 manning | Yes. | Read for all; admin edits thresholds/rule. | Number, threshold colour, description and under-manned state. Manual awards do not remove a body. `ManningSheet.tsx:35-159`, `availability.ts:248-339`, `dayview.ts:316-326`. |
| R13 OIL tracker | Yes: balances and ledger boxes. | Admin grants/edits/removes; other roles read. | Reason, giver, amount, draws, remaining value and archive state. `OilTracker.tsx:1-56`, `OilTracker.tsx:150-169`. |
| R14 remarks | Yes. | Published approved leave: owner or admin saves note. | Callsign, date span and code share the sheet. `RemarksSheet.tsx:1-59`. |
| R15 war/stage controls | Yes. | Admin advances/reopens and manages bid window; member reads. | Stage, forward/back controls, bid window, clash/red list and legend. Draft decisions must be absent. `Chrome.tsx:217-304`, `Chrome.tsx:306-370`, `stages.ts:149-173`. |
| R16 Edit Schedule | Yes. | Open editor, edit/delete and reassign via `iu:` for admin. **[MISSING] confirmation on medical/upchit reassignment.** | Unavailable row, late/pending marks and schedule content. `inputedit.tsx:1178-1219`, `board-html.ts:606-677`, `board-html.ts:748-758`. |
| R17 board panels | Yes. | Fold, add, inline edit and open shared editor. | Unavailable and Personal Inputs sit beside schedule rows and warnings. `board-html.ts:606-677`, `board-html.ts:722-758`. |
| R18 view-only | Yes: issued face by default; working draft only through the explicit picker. | Read/navigation only. | Issued/working banner and schedule contents. `ViewWeek.tsx:30-55`. |
| R19 picker / ALL AVAIL | Yes. | Read availability; admin can change OIL earning only in OIL mode. | Pucks, reasons, warnings and OIL tab share the movable panel. `AvailWindow.tsx:46-68`, `AvailWindow.tsx:177-205`. |
| R20 warnings/day panel | Yes. | Read/jump or open the affected detail. | Amber `!` replaces the normal `+n` mark; warning toast is amber and length-timed. `dayview.ts:260-314`, `toast.ts:5-27`, `toast.ts:40-50`. |
| R21 History | Partial. Inputs add/delete/cascade actions appear. **[MISSING] ordinary edits, calendar moves, reassignment and Leave War approve/move call sites.** | Filter, group and jump. | Caller, time, before/after and day. `HistoryModal.tsx:53-83`, `HistoryModal.tsx:115-165`, `inputedit.tsx:835-880`, `inputedit.tsx:1325-1346`, `sync.ts:252-362`, `sync.ts:479-550`. |
| R22 exports | Yes. | Download inputs CSV; schedule CSV/print. | Inputs export is live stored data; schedule reports issued data on published days and working data otherwise. `InputsPage.tsx:943-951`, `export.ts:44-78`, `printpdf.ts:103-132`. |
| R23 Insights | It shows flying load, work hours and warnings, but no direct absence ledger. | Read only. | Its “available” list is actually the non-flying roster; keep as a scoped known question. `insights.ts:8-48`, `Modals.tsx:64-104`. |
| R24 guest | Yes: separate issued/read-only tree. | Week navigation and sign-out only. | Published schedule plus waiting/view-only bar; no Shell, Inputs, war or editors. `GuestApp.tsx:1-18`, `GuestApp.tsx:29-57`, `App.tsx:31-35`. |
| R25 RaptorSheet — add | Yes: Inputs-owned leave or automatic OIL provenance. | Close only. | Callsign, date, code, reason/giver/value and correct source. `BidPicker.tsx:877-960`, `Matrix.tsx:4083-4106`. |
| R26 PostOutSheet — add | Yes. | Move PO date, toggle archive, undo PO, or enter leave/OIL placement. | Posting explanation, date and archive state. `BidPicker.tsx:964-1055`, `Matrix.tsx:4181-4197`. |
| R27 PostInSheet — add | Yes. | Move PI date, undo PI, or enter leave/OIL placement. | Posting explanation and joining date. `BidPicker.tsx:1059-1130`, `Matrix.tsx:4199-4216`. |
| R28 pending list — add | Yes: exact net issued→working changes. | Click jump where an address exists; close/toggle/scroll. | Before/after, actor/time and next AL number. `pendlist.ts:128-159`, `pendlist.ts:340-423`. |
| R29 ALPanel — add | Yes: changed published days and issued AL history. | Publish one day; discard only unpublished marks. | Counts, kinds, sign-off lock and version. `ALPanel.tsx:13-76`. |
| R30 confirm overlays — add | Yes. | Forced choices, Cancel/Escape and Save. | Parent editor remains underneath; Save is disabled until required choices exist. `UpchitConfirm.tsx:19-76`, `MedClashConfirm.tsx:39-105`, `InputsPage.tsx:1149-1170`. |
| R31 DocViewer — add | Yes: image/PDF/no-document and multi-file paging. | Close; permitted user can edit; pending card can open an upchit. | Medical identity/span and document pager. `DocViewer.tsx:23-79`. |
| R32 figure readers — add | Yes. | Open person→figure and figure→breakdown; admin may edit balances. | Every figure, used line and component breakdown. `Matrix.tsx:4240-4258`, `counters.ts:361-405`. |
| R33 global toast — add | Yes. | No action; transient feedback only. | It overlays board/ghost, is pointer-inert, severity-coloured and length-timed. `toast.ts:7-27`, `toast.ts:40-57`. |
| R34 print/PDF — add | Yes. | Print/save through browser. | Published/working stamp per day and issued schedule content. `printpdf.ts:103-132`, `export.ts:44-63`. |

## 3. Ranked failure scenarios

For scenarios 5–9, use two matched dates and run every order on both a currently unpublished day and an already-published day. After each completed order: photograph the cell, day sheet, balance/figure, manning and pending/issued views; Undo; photograph; Redo; photograph; reload; photograph persisted state. Reload should clear the session undo list but retain the saved result.

### Top 15 — full scenarios

#### 1. Calendar-drag a downchit onto another medical type

- **Setup:** Through Inputs, give Ranger a five-day OML and a separate two-day ATT C on non-overlapping dates. Record Ranger’s MED TOT and manning.
- **Action:** In the Inputs calendar, drag ATT C into the middle of OML.
- **Expected:** Before any write, `MedClashConfirm` identifies the shared dates and asks which status owns them and whether to keep the tail. Cancel must leave both rows, MED TOT and manning unchanged. Save must perform the selected cut as one undo step. The current ordinary editor has this gate. `inputedit.tsx:1671-1688`, `MedClashConfirm.tsx:39-105`.
- **Money:** Leave balances unchanged; MED TOT becomes the union of the retained medical days; manning removes Ranger once on each medically unavailable day.
- **Disproof:** The chip lands, OML is trimmed/deleted, or MED TOT changes before a confirmation choice. The direct drag path currently makes that outcome likely. `caldrag.ts:83-129`, `inputedit.tsx:961-965`, `inputedit.tsx:1111-1114`.

#### 2. Calendar-drag an upchit across active and future medical rows

- **Setup:** Ranger has an OML spanning the intended upchit date and another future medical row.
- **Action:** Drag an upchit chip to the proposed fit date.
- **Expected:** `UpchitConfirm` must list the active trim and require Keep/Remove for every later row; Save remains disabled until every choice is made; Cancel writes nothing. `UpchitConfirm.tsx:1-15`, `UpchitConfirm.tsx:19-76`, `inputedit.tsx:1655-1669`.
- **Money:** Leave balances unchanged; MED TOT and manning change only after Save and exactly according to retained rows.
- **Disproof:** Any medical is shortened or removed without the summary sheet. The calendar currently calls the commit directly. `caldrag.ts:106-129`, `inputedit.tsx:961-965`, `inputedit.tsx:1111-1114`.

#### 3. `iu:` reassign into another person’s medical state

- **Setup:** Ranger owns ATT C; Saber already has overlapping OML. Repeat with an upchit and a later Saber medical row.
- **Action:** On Edit Schedule/board, reassign the input from Ranger to Saber using the `iu:` gesture.
- **Expected:** The same medical confirmation used by the normal editor must precede mutation. Cancel keeps ownership and every medical row unchanged.
- **Money:** On confirmed Save, Ranger’s MED TOT falls by the transferred span and Saber’s rises only by retained medical days; planned-absence manning moves between the two people without double removal.
- **Disproof:** Saber’s OML is silently trimmed, or a later medical is silently removed. `reassignInput` currently calls `commitInputEdit` directly. `inputedit.tsx:1178-1219`, `inputedit.tsx:961-965`, `inputedit.tsx:1111-1114`.

#### 4. History completeness for every absence door

- **Setup:** Sign in as Ranger and file/edit/move/delete own leave. Sign in as Saber and approve, move, unapprove and delete a war request.
- **Action:** Open History after each action, in by-time and grouped modes.
- **Expected:** One successful gesture yields one entry with the signed-in callsign and a truthful action; refused/no-op gestures yield none. History itself reads only `ELOG`, and `logAction` supplies the callsign. `HistoryModal.tsx:53-83`, `editlog.ts:205-224`.
- **Money:** History must not change balances, figures or manning.
- **Disproof:** Calendar/reassign/war operations alter the absence but produce no history row. Add/delete are explicitly logged, while direct edits and war doors have no equivalent call sites. `inputedit.tsx:835-880`, `inputedit.tsx:1325-1346`, `inputedit.tsx:912-1114`, `sync.ts:252-362`, `sync.ts:479-550`.

#### 5. File then bid / bid then file

- **Setup:** Use a clean Ranger workday; repeat full day and one half, published and unpublished.
- **Action:**  
  A. File LL through Inputs, then bid LL on the same time.  
  B. Bid LL first, then file LL through Inputs.  
  After each sequence run Undo, Redo and reload.
- **Expected:** A same-fact duplicate is refused with a reason. In B, the Inputs-filed fact wins and the bid is replaced/withdrawn with the member-facing notice. Only one live leave charge remains.
- **Money:** Full day: LVE balance −1, LL used/LVE TOT +1, relevant manning −1. Half day: −0.5/+0.5/−0.5. Undecided bids already charge and remove availability; refused bids do not. `dayview.ts:276-300`, `charge.ts:181-225`, `counters.ts:117-166`.
- **Disproof:** Two charges, two manning removals, a silent refusal, or different final records solely because of order.

#### 6. Approve then medical / medical then approve

- **Setup:** Ranger has an undecided full-day LL bid. Prepare full-day ATT C through Inputs; run on published and unpublished twins.
- **Action:**  
  A. Approve LL, then file ATT C.  
  B. File ATT C, then attempt approval.  
  Run Undo, Redo and reload after each.
- **Expected:** A medical filed after approval cuts/replaces the overlapping leave. Approval after existing medical is refused with a reason. Recorded work is irrelevant; leave-versus-medical remains a write bar. `dayview.ts:159-190`, `sync.ts:280-305`.
- **Money:** A full medical takeover restores the one LL day, raises MED TOT by one and leaves manning one body down—not two. Undo/redo reverses the composite result once.
- **Disproof:** Leave and medical coexist on the same full-day time, annual leave remains charged after being fully cut, or manning subtracts Ranger twice.

#### 7. Publish then file / file then publish

- **Setup:** Two clean matched days with complete sign-offs.
- **Action:**  
  A. Publish the empty day, then Ranger files LL.  
  B. Ranger files LL, then Saber publishes.  
  Repeat the equivalent change after an earlier publication, followed by Undo, Redo and reload.
- **Expected:** A keeps the issued face empty, shows LL in the working copy/war, creates one pending input change and clears sign-offs. B publishes LL into the issued face and leaves no pending delta. `ViewWeek.tsx:38-54`, `pendlist.ts:128-159`, `ALPanel.tsx:32-65`.
- **Money:** Both final live states charge LVE −1, LVE TOT +1 and manning −1; only issued visibility and pending state differ.
- **Disproof:** The issued face changes immediately in A, pending does not appear, B still reports a pending filing, or money depends on publication order.

#### 8. Award then work / work then award

- **Setup:** A clean weekend or public holiday for Ranger. Use a three-day manual award and a scheduled worked day worth one automatic day.
- **Action:**  
  A. Enter the award, then build and publish the work.  
  B. Publish the work, then enter the award.  
  Repeat before publication, then Undo, Redo and reload.
- **Expected:** The two credits coexist; the automatic credit is the visible/main one and the award is behind `+1`. Total OIL earned/granted is four. `dayview.ts:117-142`, `dayview.ts:327-332`.
- **Money:** `+OIL` rises by 4; leave-used figures do not move. The award alone does not flag, make Ranger on-duty or reduce manning; the automatic credit may set the duty tally, but availability remains a body count. `dayview.ts:152-158`, `dayview.ts:316-326`, `availability.ts:248-278`, `availability.ts:301-339`.
- **Disproof:** One credit overwrites the other, total is three or one, the award alone creates amber/duty, or order changes the final amount.

#### 9. Post out then file / file then Post out

- **Setup:** Ranger is in-squadron with a clean future date; record LVE and manning.
- **Action:**  
  A. Post Ranger out before that date, then use the PostOutSheet placement door to file LL beyond PO.  
  B. File LL first, then post Ranger out before it.  
  Run on published/unpublished twins with Undo, Redo and reload.
- **Expected:** The leave remains visible and chargeable outside the official window; posting affects squadron membership, not permission to hold the record. `BidPicker.tsx:964-1055`, `Matrix.tsx:4181-4197`.
- **Money:** LL still charges LVE −1 and LVE TOT +1. Manning is zero for Ranger after PO regardless of leave, without a second subtraction. `availability.ts:275-278`, `availability.ts:301-339`.
- **Disproof:** Filing is blocked, the leave disappears, the balance fails to charge, or the posted-out person contributes negative/double-removed manning.

#### 10. Every late-input door against one published day

- **Setup:** Publish a signed day with known leave, medical, course and empty-person states.
- **Action:** In turn: file, edit, stretch, trim, calendar-drag, reassign, delete, approve a bid, apply a medical cut and file an upchit.
- **Expected:** Every net input change adds the correct pending-list item, increments the same AL count, clears sign-offs and leaves the issued face frozen. Putting a change exactly back removes its net pending item. `pendlist.ts:10-18`, `pendlist.ts:128-159`, `ALPanel.tsx:19-65`.
- **Money:** Balances, figures and manning follow the live working record after every action; the issued view remains historical.
- **Disproof:** Any door changes the working absence without a pending item, count and sign-off reset; or the pending count disagrees with the list.

#### 11. Switch wars with sheets and undo state open

- **Setup:** Open BidPicker, DayList, SelectSheet, PostInSheet, PostOutSheet and RaptorSheet in separate runs; make one change in War A.
- **Action:** Switch to War B, attempt any stale sheet action, then Undo/Redo the War A change.
- **Expected:** Sheets close or become inert; no action writes to the wrong war. Undo/redo addresses the original war, and returning to A shows the correct state.
- **Money:** The affected balance/figure/manning changes only in the war/date where the record belongs.
- **Disproof:** A sheet survives with live controls, writes into B, or undo changes the same date in the wrong war.

#### 12. Change week, return, undo/redo and reload

- **Setup:** Add or edit a multi-day leave spanning the loaded week boundary.
- **Action:** Change week, return, Undo, Redo and reload.
- **Expected:** The input remains one record; accepted schedule rows and the week stash do not split from it. The app already protects edits whose landed row is on an unloaded week. `inputedit.tsx:918-925`, `inputedit.tsx:970-977`.
- **Money:** Cross-war balances remain continuous; each date is charged once. `counters.ts:105-127`.
- **Disproof:** Record duplication, stale ground rows, lost pending state or a balance that changes merely from navigating.

#### 13. Admin, member, other member and guest lifecycle

- **Setup:** Admin `ad`/Saber files for Ranger and Saber. Member `us`/Ranger has own and other-person rows. Publish a medical day.
- **Action:** Sign out/in across both accounts, then enter guest mode. Try every rendered door.
- **Expected:** Ranger may edit/file own Inputs and bid only own war row; cannot mutate Saber. Admin can manage all. Guest mounts only the issued read-only schedule and may read medical details but has no Inputs/war/editor tree. `InputsPage.tsx:331-350`, `stages.ts:145-147`, `GuestApp.tsx:1-18`, `App.tsx:31-35`.
- **Money:** Role changes do not alter any value.
- **Disproof:** A stale editor/toast survives identity change, member writes another person, guest reaches a mutation surface, or values change on sign-out.

#### 14. Phone → desktop while a mixed day is open

- **Setup:** At 390px, create a day with eight records, amber clash, `+n`, pending mark, posting hatch and a long warning. Open DayList, a confirmation overlay and ALL AVAIL in separate runs.
- **Action:** Resize to desktop and back without closing the surface; scroll and perform its primary action.
- **Expected:** The highest-priority mark remains visible, every sheet remains reachable, buttons do not overlap, and movable-window placement does not reuse an incompatible layout box. `dayview.ts:260-314`, `AvailWindow.tsx:80-143`.
- **Money:** The figures and manning shown before and after resize are identical.
- **Disproof:** A mark is painted over, close/save controls leave the viewport, the window strands itself, or resize changes state.

#### 15. Storage-fault atomicity

- **Setup:** In a disposable browser context, prepare a multi-part action: approve a run, medical takeover, published-day edit and cross-week reassignment.
- **Action:** Inject failure at each persistence boundary supplied by the handpass tooling.
- **Expected:** Either the complete command survives or none of it does; no half Input/half war state, orphaned document, partial medical trim, stale pending count or one-sided balance appears.
- **Money:** On failure every balance, figure and manning value stays at baseline; on success each moves once.
- **Disproof:** Any partial state appears before or after reload.

### Ranks 16–40

16. **Noon boundary:** File 12:00–14:00 leave; expect PM half, 0.5 charge and 0.5 manning reduction; disproof is AM/full-day treatment.

17. **Overnight medical:** File 23:00–02:00 medical over next-day leave/work; expect next-day clash but no extra medical-total day beyond the defined portion; disproof is missing day-two warning. Current rules support next-day clash handling.

18. **Back-to-back windows:** Leave ending 10:00 and another starting 10:00; expect no overlap/refusal; disproof is amber or rejection.

19. **Course/OD plus leave:** Add CSE and OD, then overlapping leave in both orders; expect distinct facts to coexist with correct ladder/flags and one manning removal; disproof is silent replacement or duplicate removal.

20. **No-leave-day warning:** Attempt leave on a configured no-leave day through every door; expect the same warning and preserved filing behavior; disproof is one silent door.

21. **Member filing outside the bid window:** Close bidding or choose a date outside it, then Ranger files own leave through Inputs; expect Inputs permission to remain available even though grid bidding is closed; disproof is refusal based on war stage/window.

22. **SANS input:** Add SANS availability on weekend/PH; expect no work record and no OIL; disproof is duty/OIL creation.

23. **Same-type medical duplicate:** Try add, inline edit, dialog edit, calendar drag and reassignment; expect refusal before mutation at each door; disproof is merge/trim or changed MED TOT.

24. **Custom-hour medical cut:** ATT C 09:00–14:00 over full-day leave; expect leave to survive from 14:00 with its remark/date tail updated; disproof is whole leave deletion or wrong step.

25. **Two separated leaves touching both halves:** LL 08:00–10:00 plus OL 14:00–16:00; expect one full annual day and one whole-body manning reduction; disproof is 0.5 or double charging. `dayview.ts:276-300`.

26. **Fifteen-day pilot run:** Walk a continuous LL/OL run over a weekend, including split AM/PM on one day; expect weekend charge only when the run qualifies; disproof is a broken run or unconditional weekend charge. `charge.ts:215-230`.

27. **Published medical frozen:** Publish a medical, then edit/delete it; member and guest issued views must retain the issued medical while working/pending surfaces show the change; disproof is live leakage. `ViewWeek.tsx:38-54`, `GuestApp.tsx:13-18`.

28. **Medical documents:** Attach two files, open from Inputs, Medical View and published schedule, remove one, cancel an edit, reload; expect consistent paging and persistence; disproof is wrong count, wrong document or lost remaining file. `MedicalView.tsx:113-127`, `DocViewer.tsx:23-59`.

29. **Worked weekend earning nobody:** Build a duty item without readable times; expect a named warning during planning and at publish, with no OIL; disproof is silence or guessed credit.

30. **Award quantities:** Try 0.25, 0.75, negative and malformed values through both day award and tracker; expect non-half multiples/refused values to remain unchanged, never rounded silently.

31. **Negative OIL:** Spend below zero; expect the negative balance to remain visible and no refusal. Do not report this deliberate result as a defect.

32. **Undecided plus refused request on one half:** Create both; expect coexistence, only the live undecided request to charge/remove availability. Do not report coexistence itself.

33. **Touch-only records:** Create windows whose endpoints only meet; expect no clash. Do not report the absence of amber.

34. **Invalid posting window:** Try PI after PO and PO before PI through every posting surface; expect refusal without partial archive or hatch movement.

35. **Archived/posting projection:** Archive at PO while leave exists beyond it; expect the row and leave to remain findable, chargeable and zero in manning; disproof is disappearance.

36. **Mixed bulk rectangle:** Include empty, bid, Inputs-owned, locked and outside-window cells; verify exact written/skipped counts and no partial silent action. `SelectSheet.tsx:74-108`.

37. **Decision window by stage:** Open, closed and published must expose Ack/Approve/Refuse/Move for an undecided bid; draft must not. `stages.ts:149-173`.

38. **RaptorSheet routing:** Tap Inputs-filed leave, schedule-earned OIL and input-earned OIL; expect the correct source sentence and no edit controls. `BidPicker.tsx:877-960`.

39. **Exports:** After unpublished edits to a published day, compare inputs CSV, schedule CSV and print/PDF; Inputs must contain live storage, schedule exports the issued published day, and an unpublished day’s working data. `InputsPage.tsx:943-951`, `export.ts:44-78`, `printpdf.ts:117-120`.

40. **Pending-list navigation:** Generate filed, edited, deleted, moved-off, face, warning and OIL changes; every addressable line must jump to its exact target, while non-addressable lines remain honest static rows. `pendlist.ts:340-423`.

## 4. Explicit negatives

These are static code-inspection negatives, not rendered-app clearance.

- I checked the one-record seam and found no second stored absence copy: the war reads Inputs and its approve/remove/move doors write Inputs. `sync.ts:1-18`, `sync.ts:252-277`.
- I checked the main-code ladder, amber calculation, per-half charge and away calculation and found one shared `dayView` derivation rather than separate UI formulas. `dayview.ts:105-169`, `dayview.ts:260-332`.
- I checked balance and figure derivation and found refused bids excluded, pending bids included, half-days preserved and balances allowed below zero. `counters.ts:117-166`, `counters.ts:193-215`, `counters.ts:361-405`.
- I checked manning and found posting boundaries applied before counting, planned absence subtracted once, manual awards ignored and automatic work retained only in the duty tally. `availability.ts:248-339`, `dayview.ts:316-326`.
- I checked award-plus-work arithmetic and found the two credits independently summed, with automatic credit ranked above the award for the visible cell. `dayview.ts:117-142`, `dayview.ts:327-332`.
- I checked the posting-sheet wiring and found both PI and PO management plus the route through to leave/OIL placement. `BidPicker.tsx:964-1130`, `Matrix.tsx:4181-4216`.
- I checked the published/read-only path and found the issued face selected by default, with an explicit working-draft route rather than automatic leakage. `ViewWeek.tsx:38-54`.
- I checked schedule exports and found the same issued-for-published/live-for-unpublished selection used by CSV and print/PDF. `export.ts:44-78`, `printpdf.ts:117-120`.
- I checked the guest root and found it is a separate tree without Shell, Inputs, Leave War, History or editors. `GuestApp.tsx:1-18`, `App.tsx:31-35`.
- I checked the pending-list count/list source and found both read `dayPendingItems`, so I found no separate counting formula. `pendlist.ts:10-18`, `pendlist.ts:340-365`, `ALPanel.tsx:35-48`.
- I checked the warning toast and found it pointer-inert, painted above the board/ghost, amber/red by severity and held according to message length up to twelve seconds. `toast.ts:7-27`, `toast.ts:40-50`.
- I checked the deliberate exclusions and did not treat negative OIL, one undecided plus one refused request, touching windows, demo-data migration, weekday-work absence, commit-manning, year scope, lock mark or “undo only your own changes” as new findings.

## 5. Defects confirmed or predicted, with expected fixes

### Defect A — alternate input-edit doors bypass medical confirmations

**Status:** Confirmed by code. The visible browser symptom remains to be reproduced.

The normal editor calls `upchitEffects`/`medClashes` and opens the corresponding confirmation before saving. Calendar drag and `iu:` reassignment instead call `commitInputEdit` directly; that function constructs and applies the trim plan.  
Evidence: `inputedit.tsx:1655-1688`, `caldrag.ts:83-129`, `inputedit.tsx:1178-1219`, `inputedit.tsx:961-965`, `inputedit.tsx:1111-1114`.

**Expected fix, step by step:**

1. Extract one pure medical-edit preflight from the normal editor. It must return one of: refusal, ordinary commit, upchit confirmation request, or different-medical confirmation request.
2. Make the normal editor, calendar drag and `reassignInput` all call that preflight before `commitInputEdit`.
3. Give the calendar/reassign controller a pending-edit object containing the original row, proposed draft, source gesture and success callback.
4. Render the existing `UpchitConfirm` or `MedClashConfirm` from that pending object—do not create calendar-specific confirmation logic.
5. On Cancel, clear the pending object and make no write, toast or OIL-question mutation.
6. On Save, pass the selected removals/kept segments and `keepTail` into the same single batch used by the normal editor.
7. Only after successful commit should calendar drag show “Moved to …”, reassign show “… is now unavailable instead …”, and `askOilIfPending` run.
8. Add tests for downchit drag, upchit drag, downchit reassign and upchit reassign: Cancel, Save, protected-week refusal, undo and published-day pending.
9. Re-walk all four on phone and desktop because the defect is specifically a missing visible overlay/call site.

### Defect B — History does not receive all absence actions promised by R21

**Status:** Confirmed missing call sites in code; visible absence should be photographed in the running app.

`HistoryModal` renders only `ELOG`. Input add/delete and cascade operations explicitly call `logAction`; ordinary edit/calendar/reassign and Leave War approval/move paths do not have equivalent logging.  
Evidence: `HistoryModal.tsx:53-83`, `editlog.ts:205-224`, `inputedit.tsx:835-880`, `inputedit.tsx:1325-1346`, `inputedit.tsx:912-1219`, `sync.ts:252-362`, `sync.ts:388-550`.

**Expected fix, step by step:**

1. Define the exact R21 action vocabulary: filed, edited, calendar-moved, reassigned, medically cut, approved, returned to bid, refused, removed and war-moved.
2. Log at the successful top-level gesture boundary, not inside per-day loops, so one bulk gesture produces one truthful entry rather than one row per implementation detail.
3. Add a `logAction` call after a successful ordinary `commitInputEdit`, including old/new person or date where relevant.
4. Add explicit successful action logging after calendar move and reassignment; do not log drop-back, Cancel or refusal.
5. Add logging to the public Leave War command wrappers after `doorApprove`, `doorDecideApproved`, `doorRemoveApproved` and `doorMoveApproved` report a non-zero successful result.
6. Use `logAction` so the signed-in callsign continues to come from `HOOKS.whoami`; never derive the actor from the subject person. `editlog.ts:205-224`.
7. For partial bulk success, record the successful count and skipped count in one entry.
8. Keep the existing session-only behavior explicit: reload/log-out clears History even though schedule, Inputs and versions persist. `HistoryModal.tsx:155-162`.
9. Add UI tests checking the exact callsign and action after every R21 door, plus negative tests for refused/no-op actions.
10. Re-run scenario 4 in the production browser as Ranger and Saber, including grouped history and jump behavior.

