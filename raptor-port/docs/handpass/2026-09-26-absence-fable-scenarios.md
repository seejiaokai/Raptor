# [HUMAN-RETEST] the absence record — Fable's plan review and scenarios (26 Sep 26)

Read-only, blind to Astra. Read: the plan (`plans/2026-09-26-absence-retest-plan.md`), CURRENT-STATE, the register
(B/H/Q/N rows), the clash check, the plain rules, the rulings files (leave-war, oil, scheduler, how-we-work), the
earlier hunt plan and its coverage record, the `[S4-HUNT-REST]` / `[PUB-UNAVAIL]` / `[LW-*]` backlog items, the
published-face sweep, engine-rules §Publishing and §Auth, data-model §11, and the code named in the brief (the absence
layer, the gate, the sync, the store, the day view, the war's sheets, the Inputs editors, the calendar drag, the
medical planner and its two confirm sheets, the OIL ask, the schedule's Unavailable block, `perms.ts`, `GuestApp`,
the storage postman). Every "CONFIRMED" below names the file and line I read; everything else is a PREDICTION.

Paths are relative to `raptor-port/`.

---

## 1. What the plan MISSES

**M1 — R9 names the wrong sheet.** `PersonSheet.tsx` is the seat / band / SXO editor ("Edit aircrew",
`PersonSheet.tsx:17-79`). Post in / Post out live in THREE places: the bid sheet's folded PI / PO / +OIL row
(`BidPicker.tsx:499-535`, `599-677`), the two posting sheets an admin's tap on a hatched day opens (`PostInSheet`,
`PostOutSheet`, `BidPicker.tsx:972-1132`, mounted at `Matrix.tsx:4184-4217`) and the drag-selection sheet's Post out
(`SelectSheet.tsx:170-194` — Post OUT only, one person only; there is NO bulk Post in). A walker sent to
`PersonSheet` walks the wrong thing. Split R9 into R9a/b/c (roll-call below) and record the bulk asymmetry.

**M2 — "their undo" is two different things, and the plan does not say which.** The sheet's own "Undo post out
(PO)" / "Undo post in (PI)" button (`setPostOut(id, null)`) is one; the app's top-bar Undo is another — and the
war's Undo/Redo pair IS the app's global timeline now (`Chrome.tsx:20-23, 114`), not the war's old snapshot stack.
The global timeline deliberately does NOT undo a posting (`undo/timeline.ts:316-327`: an `lw.postouts` closure is
not undoable; the legacy `historySnap` omits `postOuts` and `people` too — `store.ts historySnap`). So "Post out,
then Undo" is a scenario whose expected result is a refusal or a skipped step, not a restored row. The plan must
name BOTH undos and record what each does (this walk records undo at the boundaries; D148 is the next re-test's).

**M3 — the D189 row in §3 will mislead the walker on a LEAVE cut by a medical.** The plan expects "a medical cut" to
make each published day the leave still covers read "1 pending" because the app rewrites "till <date>". That is true
of the medical TRIM path (`inputedit.tsx applyMedPlan:366` rewrites the downchit's tail) and the war's approve-extend
(`sync.ts:352`), and FALSE of every LEAVE piece the war makes: `sliceInput` (`sync.ts:368-386`) copies `remarks`
verbatim, and it is what `sickCutsLeave` (`inputgate.ts:151`), the un-approve/delete cut (`sync.ts:406`) and the
war's move (`sync.ts:521, 544`) use. So after "LL 14–18 Jul till 18 Jul" is cut by ATT C 16–17, the 14–15 piece still
reads "till 18 Jul" and its published days read 0 pending (the remark did not change; dates are not compared —
`inputs.ts inpDetailKey:90-95`). Finding F3 below. The walk must state the expected result per path, not one for both.

**M4 — the bulk ground (W3, D1–D5) never puts a hand-typed OIL award inside the rectangle.** D3 says "never the
medical, never the automatic credit" — it says nothing of an award, and the code removes every award in the
rectangle on Delete (F1/F2 below, CONFIRMED). The plan's everything-world has "an award on a day he also worked"
but no award beside a BID, which is what the bid sheet's "Clear" and the bulk Delete act on.

**M5 — the calendar-drag door (W1, C4) is planned against the wrong rule.** C4 says "the cut rule must apply through
the drag door" (a medical chip onto LEAVE — true, the gate cuts). It never asks what a medical chip dragged onto a
DIFFERENT-TYPE MEDICAL does: the dialogs open the clash sheet (MedClashConfirm, "no default", owner 27 Aug 26), the
drag goes straight to `commitInputEdit` with no `medClashes` check and no sheet — the older downchit is trimmed and its
tail minted silently (F4, CONFIRMED). The same holds for dragging an UPCHIT chip (no UpchitConfirm — the leftovers'
Keep/Remove never asked) and for the `iu:` reassign of a medical to another man (`reassignInput` →
`commitInputEdit`, `inputedit.tsx:1187-1219`). Add all three to W1/W2.

**M6 — the everything-world (§5) is missing these records:**
- an award on a day that also holds a BID (the Clear / Delete scenarios);
- an overnight leave (20:00–06:00) whose tail meets next-morning PUBLISHED work — a spill-tail conflict (F6);
- a member's AM bid AND PM bid of the same code on one day, approved together (S17 — the box reads `<LL +1`);
- a leave crossing 31 Dec into the second war (Q11: a move into the next war refused; the row in both wars);
- a person with BOTH posting dates set, so the "window closes before it opens" refusal can be provoked (F5);
- a war in DRAFT (`canDecide` false there — `stages.ts:168-174`; the one window must be ABSENT, not dead);
- a medical with custom hours of exactly 6h00 and 6h01 straddling noon (the half/full boundary,
  `absences.ts medRowPortion:80-93`);
- a leave from 12:00 to 12:00 the next day (the noon rule AND the tail together, `absences.ts realWin:46-50`);
- a SANS man with leave while "Show SANS" is off (his row hidden; the charge and the credit must still land —
  `sync.ts desiredOilCells:914-933`);
- an archived, posted-out man with clearing leave (the roster keep rule, `sync.ts reprojectRoster:1295-1308`);
- the demo's own frozen medical on the published week (`sufa` ATT C 13–17 Jul): D179 frozen face, walked as-is.

**M7 — orders the plan does not pair.** Beyond its five pairs, walk both orders of: upchit ↔ a downchit re-filed over
the upchit day (`downOverUpchitRefusal`, `inputedit.tsx:301-310`); award ↔ Clear; file ↔ reassign (`iu:` drag, both
men's rows and the OIL question that follows — `inputedit.tsx:1218`); bid ↔ Post out (a bid placed, THEN the man
posted out from before it: the bid sits on a hatched day — what shows, what charges, what manning reads); approve ↔
Post out (approved leave after PO: the row stretches, PO tag, charged, manning zero); publish ↔ medical (D179: frozen
both orders, pending on the working copy); PH declared ↔ leave approved (the charge is excused either order —
`charge.ts:209-211`, derived); PH declared after PUBLISHING (D2: the OIL waits for a republication and the day says
so — `validate.ts OIL_STALE_DAY:1310`); N9 on the FIRST publish AND on an AL (`sched-commit.ts:524` is the one
door — confirm it fires for both).

**M8 — roles the plan does not walk.** A member whose person is posted out and ARCHIVED signs in (the war keeps his
row; `perms.ts viewerId` still names him) — answer C says he may bid clearing leave. A member with an ACCOUNT SWITCHED
OFF mid-session (D204) on the Leave War. The plan walks admin / member / guest only.

**M9 — the storage-fault ground (W3, H1–H3) does not say WHERE "the app says it did not save" is drawn.** The postman
never toasts; the only sign is the header's save status (`postman.ts SaveStatus:22`, `status()` 55-60, and the retry
with backoff, 96-131). Add a roll-call row for the save indicator (R25) and make H1's expected result "the header
reads failed until the retry lands", not "a message".

**M10 — a set-aside rule the plan half-tests as live.** §3's live list carries "B4 as narrowed by N2 (the credit LANDS
and flags)" — right — but the roll-call's R12 promise "an award counts nobody (N13, N17)" is stated only for the
manning; the DUTY line still counts a credited man (`availability.ts:311-312`, the owner's own exception in N17), and
an AWARD must NOT count on the duty line (`dayview.ts duty:326` — `auto` only). Say both on R12 or a walker will call
one of them a defect.

**M11 — the phone.** W1 is worded for the desktop; the calendar carries THREE gestures on one surface — a chip's
180 ms hold (`caldrag.ts:39`), an empty cell's 450 ms hold-to-add (`InputsCal.tsx:61`), a 50 px sideways swipe that
pages the month (`InputsCal.tsx:72`) — and the medical clash sheet's Save is disabled until every clash is answered
(`MedClashConfirm.tsx:58, 124`). Walk those at 390 px by finger, not only the war (W4).

**M12 — `[PUB-UNAVAIL]`: CONFIRMED CLOSED by reading**, so the plan may archive it on the walk's picture alone. The
Unavailable block reads `inputsOn(d.dt)` (`html.ts:1872`), which answers from the frozen version while an issued face
is drawn (`inputs.ts withFrozenInputs / inputsOn:56-69`; engine-rules §Publishing "ONE reader"). The board's issued
panels take the frozen `day` too (`board-html.ts sbUnavailPanel:751-753`).

**M13 — break tests (§7) to add:** the `sliceInput` remark tail (F3); the PI/PO refusal wording (F5); "Clear keeps the
award" (F1); the calendar-drag clash sheet (F4); the spill-tail line in the tap list (F6).

**M14 — the walker's ground.** W2 (the medical cascade) and W1 (the calendar) overlap on "a medical chip onto leave";
give the calendar's MEDICAL drags to W2 (it owns the cascade and its two sheets) and leave W1 the leave/course/OD
drags and the hold-to-add. W3 is too big (bulk + the one window + wars + storage faults): move the storage faults to
the host, who has the postman in view.

---

## 2. The roll-call, checked

Columns: SHOWS the thing · can the person ACT there · what else is PAINTED on the same pixels · where the answer comes
from. **MISSING** marks a call site I believe should exist and does not.

| # | place | SHOWS | ACT | PAINTED on the same pixels | from |
|---|---|---|---|---|---|
| R1 | Inputs table | every input, type, dates (day-first), half/times, remarks with the "till" tail, LATE word, medical badge, paperclip; the war's provenance (`lw`) is NOT drawn as a column — only the war shows the blue edge | admin add/edit/delete any; member own only (`✎`/`✕` hidden — `InputsPage.tsx:1108`); CSV (`:946`) | the LATE chip in the remarks cell; a "till" tail the app wrote sits INSIDE the typist's remark | `InputsPage.tsx:250, 350, 703, 946, 1108`; engine-rules §Auth |
| R2 | add / edit dialog `#inpEditPop` | type, span, AM/PM, custom times, remarks, Person (admin only), document | the clash refusals and amber notes (`inputgate.ts vet:181-253`, `apply:359-367`); the OIL ask, the document ask, the upchit summary, the medical clash sheet (`inputedit.tsx:1643-1698`) | four sheets can stack over it; Escape peels one layer (`:1568-1583`) | `inputedit.tsx:1518-1902` |
| R3 | Inputs calendar | chips per day (max 6 then "+N"), hold-to-add, chip drag, month swipe | drag = `commitChipMove` → `commitInputEdit` — the gate's refusals toast, the ghost is cleared before the commit (`caldrag.ts:274-302`) | **MISSING** the medical clash sheet and the upchit summary on the DRAG door (F4); the landing flash | `caldrag.ts:63-130`; `InputsCal.tsx:277-375` |
| R4 | Medical view | down / pending upchit / upchit complete as of a date; document count; remarks only when they say more than the date | a card opens the document viewer; the pending card's Upchit path (`ctx 'up'`) | the puck's own warning colours ride the card | `MedicalView.tsx:95-213` |
| R5 | war grid cell | one code by the ladder, `+n` / `!`, half stripe, blue "raptor" edge, dotted moved, PO tag, the last-day PO, the hatch | tap opens by `cellOpenable` + the mark/outLeave/admin-hatch rules | the open-bidding box, weekend band, event colour, locked dim, the viewer's row tint — all on the same cell | `Matrix.tsx:473-634, 261-281` |
| R6 | tap list (DayList) | every record in ladder order; a notice; the member's own live-bid sentence (N10); OIL detail blocks; an Inputs-filed leave's REMARK is not shown (sub = "Change it on the Inputs page.") | Ack/Approve/Refuse per request; Back to bid/Refuse/Delete/Move on a war-approved leave (admin, deciding, NOT published — `:126`); Clear; OK, seen; Note (published, admin or own); Edit an award | **spill tails are NOT listed** while their conflicts still amber the day (F6) | `DayList.tsx:62-293` |
| R7 | bid sheet (BidPicker) | portions (only the free half beside Inputs-filed leave), the eight leave types, Clear, the decision row (admin, a bid present), PI/PO/+OIL fold, the OIL detail block | a refused write says why (`cellProblem`); **Clear removes an award too, unsaid** (F1); PI/PO confirm **closes on a store refusal, unsaid** (F5) | the "now <code>" chip; the negative-balance confirm | `BidPicker.tsx:44-738`; `store.ts cellProblem:2106-2133`, `setCell:2147-2195` |
| R8 | bulk (SelectSheet) | portions, leave types, Decide row (admin, not draft), Delete + Move when a movable bid is in the box, Post out (one person) | "N written / decided / deleted, M skipped" (`:79-105`) — **Delete removes every award in the box** (F2); **"decided" counts already-approved leave** (S16) | none | `SelectSheet.tsx:84-105, 160-194`; `store.ts:2262-2282, 2314-2362` |
| R9a | bid sheet's PI / PO / +OIL row | three folded buttons, the sheets under them | admin only; Post in from / Post out from + archive switch; Give FO/HO | on a phone the row wraps to two lines (`BidPicker.tsx:491-498`) | `BidPicker.tsx:499-677` |
| R9b | PostInSheet / PostOutSheet (an admin's tap on a hatched day) | the current date, the archive switch, Undo, "Place leave or OIL here instead…" | date change commits on change — a refused change snaps back **unsaid** (F5) | the hatch behind | `BidPicker.tsx:972-1132`; `Matrix.tsx:4184-4217` |
| R9c | SelectSheet Post out | one person only, PO only | **no Post in** here (asymmetry — record, not a defect); confirm closes on refusal unsaid (F5) | — | `SelectSheet.tsx:170-194` |
| R9d | PersonSheet ("Edit aircrew") | seat, band, SXO — nothing about absences | admin | — | `PersonSheet.tsx` (NOT the posting sheet) |
| R10 | credit form / +OIL | code follows the quantity (HO under 1, FO from 1), reason, given by; halves refused with `HALF_STEP_MSG` | admin; one command (`setManualCredit`) | the +OIL button reads the existing award | `BidPicker.tsx:187-215, 537-584`; `store.ts:3427-3454` |
| R11 | balance column / drawer / breakdown | the eight figures; the column snaps to the pool just written (`showFigure`) | admin drags a figure column to credit (BalanceBar) | the drawer covers the first ~9 day columns | `counters.ts`, `Matrix.tsx:4126-4134` |
| R12 | manning row / ManningSheet / under-manned list | bodies: only a planned absence removes (`haveOf`); the DUTY line counts a man the SCHEDULE credited (`auto`), never an award | admin edits thresholds | — | `availability.ts:275-349`; `dayview.ts:295-300, 326` |
| R13 | OIL tracker | every FO/HO cell (earned and award) with reason / giver; the ledger grants | admin grants, edits, deletes grants | — | `OilTracker.tsx`; known-gaps §balances |
| R14 | remarks sheet (published) | the remark, the span in MONTH-FIRST labels ("Jul 13 → Jul 15") | owner or admin; saves through `commitInputEdit` | — | `RemarksSheet.tsx:35`; `Matrix.tsx:3332-3343, 4074-4082` |
| R15 | period picker / stage control | the war; the stage | switch closes the open cell (`selectWar` re-baselines); the global Undo snaps to the war/date of the step | — | `store.ts selectWar:3823-3846`; `Chrome.tsx` |
| R16 | Edit Schedule Unavailable / Personal Inputs | the absence (type, times, remarks, LATE), `iu:` reassign seat, the label opens the dialog; "1 pending" on a published day | admin edits in place | the puck's warning ring; the late chip | `html.ts:1862-1967, 2000-2054` |
| R17 | board panels | as R16; the fold (`data-pitog`); + Add (Unavailable: leave / medical / OD, a range) | admin | — | `board-html.ts:751-781` |
| R18 | View-only Sched — issued face / working-draft peek | the face reads the FROZEN inputs (medical included, D179); the peek reads live; member and guest see a medical in full (`hideMed` false for every role today) | none | the ⓘ day panel (not for a guest) | `html.ts:242, 375, 1872, 2017-2021`; `inputs.ts:56-69` |
| R19 | crew picker / ALL AVAIL | a man on leave / medical / OD is out; ATT B in; a SANS man only when planned | — | — | `sync.ts availableFor:744-792` |
| R20 | warning list / ⓘ panel | LEAVE_FLY / DNIF_FLY / INPUT_FLY; the OIL advisories (live on the face); a medical on a worked day | — | the day's "N pending" | `validate.ts:20-38, 93, 710-788, 1289-1343` |
| R21 | History / edit log | "Input added / trimmed / removed" lines name the callsign; the medical cascade logs every cut (`applyMedPlan`) | — | — | `inputedit.tsx:347, 356, 368, 879, 1345` — **the war's own approve / un-approve / move log NO line of their own** (they run inside `writeInputsBatch`; confirm on the walk whether the batch logs anything, and by whose callsign — D166 (5)) |
| R22 | CSV / print | the inputs as stored (the cut pieces as separate rows); the schedule's Unavailable as issued | — | — | `InputsPage.tsx:946`; engine-rules §Publishing (the CSV reads `snap.pa` too) |
| R23 | Week Insights | the working week for everyone (`[INSIGHTS-WORKING-COPY]`) | — | — | cross-reference only |
| R24 | the guest view | the issued week; a medical row in full; no ⓘ, no Traffic, no working-draft picker, no war, no Inputs page | Sign out; the week arrows | — | `GuestApp.tsx:29-58`; `html.ts:242, 375, 1444, 1520, 1558, 1613` |
| **R25 (new)** | the header's save status | saved / saving / unsaved / failed — the ONLY sign of a storage fault; a failed group retries for ever with backoff | — | — | `postman.ts:22, 55-60, 96-131` |
| **R26 (new)** | the war's clash strip ("N clashes with the schedule") | ADMIN ONLY (`role === 'admin'`); derived from every day view's conflicts | — | — | `Chrome.tsx:530`; `sync.ts publishLeaveClashes:564-583` |
| **R27 (new)** | the war's Undo / Redo pair | the GLOBAL timeline (one undo for the app); a posting is not undoable there | — | — | `Chrome.tsx:20-23, 114`; `undo/timeline.ts:316-327` |
| **R28 (new)** | the replaced-bid notice's actor | the callsign of who filed (`byWho`), "someone" with no person, "the Inputs page" with no session | OK, seen — the person or an admin | — | `inputgate.ts:316-336`; `DayList.tsx:190-196` |

---

## 3. Ranked failure scenarios

Ordered by likelihood × consequence. The top 15 in full; the rest as lines with their expected result. "Money" names
what to read after each: +LVE (LL amber / OL red under it), +OIL, −MED TOT, −LVE TOT, the manning row and the duty
line, the under-manned list.

### S1 — the bid sheet's "Clear" removes the day's OIL award with the bid (CONFIRMED)
- **Setup (admin, war OPEN, desktop):** on Ranger's Tue 21 Jul give an award via +OIL (1 day, "callout", given by
  "CO") and nothing else. (With a bid beside it the day wears `+1` and opens the tap list instead, whose per-record
  Clear is unambiguous — the bid sheet's Clear is reached on a day holding the award alone, or an award plus an
  Inputs-filed free half.)
- **Action:** admin taps the day — the bid sheet opens, its +OIL button reads "FO · 1 day" — and presses **Clear**.
- **Expected:** the award STAYS — Clear is the bid's control; the award has its own Remove. Or, if the owner wants Clear
  to take the award too, the sheet says so before it does.
- **Disproving observation:** the award is gone, no word, +OIL drops by 1, the tracker loses the box.
- Money: +OIL, the tracker's credit box, the OIL ledger.

### S2 — bulk Delete over a rectangle wipes every award in it (CONFIRMED)
- **Setup (admin):** three men, Mon–Wed: one pending bid on Mon, awards on Tue and Wed (typed via +OIL).
- **Action:** drag-select the 3×3 block, Delete, Delete again.
- **Expected:** the bid goes; the awards stay (an award is the admin's, "never removed automatically"); "1 deleted.
  N skipped" names the awards as skipped, or the sheet warns it will remove awards.
- **Disproving observation:** "3 deleted", both awards gone, +OIL down by 2 for two men, no undo warning.
- Money: +OIL per man; the tracker.

### S3 — a posting that closes before it opens is refused SILENTLY (CONFIRMED)
- **Setup (admin):** Post Ranger IN from 2026-06-01 (bid sheet → PI).
- **Action:** open any of his days, PO → date 2026-05-01 → "Post out from 2026-05-01".
- **Expected:** the sheet stays open and says why (the posting-out must be on or after the posting-in). The mirror:
  PI dated after an existing PO.
- **Disproving observation:** the sheet closes, nothing said, the grid unchanged (the store refused).
- Money: none — manning must not move.

### S4 — a medical chip DRAGGED onto a different-type medical trims it with no question (CONFIRMED)
- **Setup (admin or the man himself, Inputs → calendar):** Sufa HL 20–24 Jul; Sufa ATT C on 18 Jul (a single day).
- **Action:** drag the ATT C chip onto 22 Jul.
- **Expected:** the clash sheet asks who holds 22 Jul (owner 27 Aug 26 — "no default"); nothing written until
  answered.
- **Disproving observation:** the drop lands at once: HL becomes 20–21, an HL tail 23–24 is minted, "Moved to 22 Jul"
  toasts, no sheet. The same drop through the DIALOG asks. Also: drag an UPCHIT chip — the leftovers Keep/Remove is
  never asked.
- Money: −MED TOT (each day of each piece), the war's medical cells, the Medical view.

### S5 — a leave cut by a medical keeps "till <old date>" (CONFIRMED)
- **Setup (the Inputs page):** Nasty LL 14–18 Jul (remark "till 18 Jul Bali"); Nasty ATT C 16–17 Jul.
- **Action:** file the ATT C.
- **Expected:** two leave pieces, 14–15 "till 15 Jul Bali" and 18 "till 18 Jul Bali" (as the medical trim and the
  approve-extend already rewrite their tails). On a published Tue 14 Jul the day then reads "1 pending" (D189: the
  words changed) — or, if the tail is left alone, the plan must expect 0 there and say so.
- **Disproving observation:** the 14–15 piece reads "till 18 Jul Bali" on the Inputs page, the week and the board.
- Money: +LVE (LL used 3, not 5), −MED TOT 2.

### S6 — an overnight tail's clash ambers a day whose list does not show it (PREDICTED)
- **Setup:** Ranger LL Fri 17 Jul 20:00–06:00 (overnight); a published Sat 18 Jul with Ranger on a duty desk from
  05:00 (or a flying line reporting 05:00); publish.
- **Action:** look at Ranger's Saturday on the war.
- **Expected:** amber `!`; the tap list names BOTH the credit and the leave that runs into the morning ("LL from
  Friday, till 06:00").
- **Disproving observation:** `!` on Saturday, the list shows only the OIL credit, and the sentence "Two of these can't
  both stand on the same time" with one thing listed (`dayview.ts:263-269` includes spill in `conflicts`,
  `dayView.all` excludes it).
- Money: +OIL (the credit lands, N2); +LVE (the leave charges Friday only).

### S7 — ORDER: file then bid / bid then file (the free half, the notice, undo, redo, reload)
- **Setup:** Ranger, Mon 20 Jul, war OPEN. (a) Admin files `*LL` (AM) on the Inputs page, then Ranger taps the day.
  (b) Ranger bids `LL*` (PM) first, then the admin files `*LL` on the Inputs page.
- **Expected (a):** the bid sheet opens on the AFTERNOON only, the line names "The morning is <LL, filed on the
  Inputs page — change that there" (`Matrix.tsx freeHalfBeside:249-256`, `BidPicker.tsx:445-450`); the box reads
  `<LL`, then `<LL +1` after the PM bid. (b): the PM bid is untouched (real times do not meet); the box `<LL +1`;
  NO notice. Then (c) the admin files a FULL-day LL over Ranger's PM bid: the bid's clashing half goes, a notice
  "Your LL bid was replaced by LL (Saber)" with `!`; Ranger's "OK, seen" clears it; ONE Undo brings the bid back and
  removes the notice; Redo re-makes it with the same actor; a reload keeps whichever state was last.
- **Disproving:** the sheet offers "Whole day"; a notice on Ranger's own filing; the actor reads "an admin" (D166 (5));
  the balance column not moving until an unrelated write (Fable round-1 #1).
- Money: +LVE 0.5 then 1.0 (the pending bid charges); −LVE TOT.

### S8 — ORDER: approve then medical / medical then approve
- **Setup:** Nasty bids LL 14–18 Jul; admin approves (one Input, "on 14 Jul – till 18 Jul"? — the approve writes
  "till 18 Jul"); then Nasty files ATT C 16–17 (with or without a document — "No document" path too).
- **Expected:** the leave is cut to 14–15 and 18 (both still war-approved, green, `lw` kept); +LVE gives 2 back; the war
  repaints at once; the toast is amber and holds long enough to read (N18); −MED TOT 2. Reverse order: the medical first,
  then approving a bid over 16–17 is REFUSED at the door with the medical named (`doorApprove:298`, "already holds
  leave or a medical at that time"), the bid stays.
- **Disproving:** a leave piece from 12:01 on a day the medical's real hours run past noon (§7); the balance stale;
  the tap-list "Back to bid" on the cut pieces missing.
- Money: +LVE, −MED TOT, manning away 1.0 on 16–17.

### S9 — ORDER: publish then file / file then publish (D177–D179, N9)
- **Setup:** publish Fri 17 Jul (the clean weekday) and Sat 18 Jul (Ranger on a desk 08:00–16:00, an OIL credit
  lands). Then: (a) Ranger files LL on Fri after publishing; (b) Sufa's frozen ATT C is extended to 20 Jul; (c) Ranger
  bids on Sat AFTER publishing; (d) unpublish Sat, place a bid, publish again.
- **Expected:** (a) View-only Sched's Friday keeps its issued Unavailable list; the admin's working copy reads
  "1 pending", the four sign-offs fall; an AL carries it. (b) the same for a medical (D179 frozen; the plan's clash
  note names it). (c) the bid stays, the day is amber, the tap list says "still live" (N4/N10). (d) the publish
  message says "Ranger's LL bid on 18 Jul now sits on published work — the day is flagged, the bid is still live"
  (`sync.ts:1154`); the bid is NOT removed; Undo of the publish has nothing to bring back. Confirm the same message on
  an AL (`sched-commit.ts:524`).
- **Disproving:** the face changes with 0 pending; the bid vanishes at publish; a notice appears.
- Money: +OIL (the credit stands beside the bid); manning duty line counts Ranger.

### S10 — ORDER: award then work / work then award (N13, N16, N17)
- **Setup:** Sat 18 Jul: (a) award Ranger 3 days first, then publish him on the desk; (b) publish first, then award.
- **Expected:** both orders reach the same day: the box shows the app's own credit (`FO` with the trailing star), the
  award behind `+1`; the tap list shows two OIL blocks ("OIL earned … From the published schedule" and "OIL award ·
  given by …"); +OIL reads 4 (N16); no amber from the award; the manning row unchanged, the duty line counts him
  (N17); after unpublishing, the award stays and +OIL reads 3 (D142/`clearRaptorCell:3606-3627`). In (b) the tap
  must open the bid sheet with +OIL offered on a day the schedule owns (`openWorkOnly`, `Matrix.tsx:3374-3376`).
- **Disproving:** "That day already earns OIL" refusal; the award on top of the box; +OIL 3 or 6; an amber.

### S11 — ORDER: Post out then file / file then Post out (+ the two undos)
- **Setup:** Taipan posted out from 1 Aug (archive on). (a) Admin files LL 10–12 Sep on the Inputs page. (b) LL 10–12
  Sep filed first, then the PO.
- **Expected:** both: September shows Taipan's row (the row stretches, `merge.ts spans`), the cells read `LL` with the
  PO tag, charged (+LVE −3), manning zero for him, the hatch stays. An admin's tap on a blank hatched day opens the
  posting sheet with "Place leave or OIL here instead…"; Taipan's own tap opens the bid sheet. THEN the two undos: the
  sheet's "Undo post out (PO)" clears it; the top-bar Undo after a Post out is REFUSED or skips the step (record the
  wording — `undo/timeline.ts:316-327`) and must not half-restore (record `postOuts` while the hatch stays).
- **Disproving:** the row vanishes in September; the leave charges nothing; manning counts him; a top-bar Undo that
  clears the hatch on one screen and not the other.

### S12 — ROLES on every war door: admin / member-own / member-other / guest / pending
- **Setup:** three sessions on the same world: `ad` (Saber), `us` (Ranger), a guest (guest switch on).
- **Expected:** Ranger: own empty day → bid sheet; own marked day → tap list with Clear on his bid, OK seen on his
  notice, no decisions; SABER's empty day → nothing opens (no `.act`, `Matrix.tsx:261-281`); Saber's Inputs-filed leave
  → the read-only sheet; Saber's plain pending bid → nothing; the drag stays on his own row; the figures drawer shows
  his own numbers; the clash strip absent (R26); Post in/out/+OIL absent; a member's own approved+published leave →
  the remarks sheet. The guest: no Leave War tab at all; the view page's medical row reads "ATT C", not
  "Unavailable" (D213). A pending person (viewer '') never reaches the war.
- **Disproving:** a pointer cursor on another's cell that opens nothing; a member's "Clear" on another's bid; the
  guest's Unavailable row reading "Unavailable".

### S13 — a DRAFT war: the one window must be ABSENT, not dead
- **Setup:** create JAN–DEC 28 (draft) via the war's + or the schedule's "create the period" (D19).
- **Expected:** admin: the bid sheet opens with the leave types (an admin edits in every stage — `canEdit`), NO
  decision row (`canDecide` false in draft); member: nothing opens. A bid an admin places in draft carries no
  decision until the war opens.
- **Disproving:** Ack/Approve/Refuse drawn and refusing ("not this screen's to decide").

### S14 — LIFECYCLE: switch war with a sheet open; undo after switching; a leave across 31 Dec
- **Setup:** the bid sheet open on a Dec 26 day; switch to JAN–DEC 27 in the picker. Then place a bid in 27, switch back
  to 26, press Undo. Then file LL 30 Dec 26 – 2 Jan 27 on the Inputs page.
- **Expected:** the sheet closes (or goes inert) on the switch — no control writes into the new war
  (`Matrix.tsx:676-681`); Undo takes the war to 27 and undoes there, touching nothing in 26; the year-crossing leave
  shows in BOTH wars (`absences.ts inputDates`), charges once, and a move of its Dec days into January is refused
  (Q11 — `moveProblem: 'window'`).
- **Disproving:** a stale sheet writing into 27; Undo silently rewriting 26; the January days missing from the 27 war.

### S15 — PHONE, 390 px, by finger
- **Setup:** the Inputs calendar and the war at 390 px, touch emulation.
- **Expected:** a 450 ms hold on empty space adds; a 180 ms hold on a chip lifts it; a 50 px sideways drag pages the
  month and never lifts; a chip drop refused by the gate leaves no ghost and no lit cell; the medical clash sheet fits
  with Save reachable and disabled until every clash is answered; the bid sheet's PI/PO/+OIL row wraps to two lines
  with the grid still reachable above it; the tap list with eight records fits with no sideways scroll; the
  two-step move confirms before it lands.
- **Disproving:** a hold that both adds and opens the popover; a swipe that lifts a chip; a stranded ghost.

### The rest (S16–S40), one line each with the expected result

- **S16** bulk Approve over 3 bids + 2 already-approved leaves + 1 Inputs-filed leave → the note must not read
  "5 decided" (`store.ts:2344` counts an already-approved leave as decided); expected "3 decided, 3 skipped" or
  wording that says "already approved".
- **S17** Ranger's `*LL` and `LL*` bids on one day, both approved in one drag → PREDICTED two Inputs, the box reads
  `<LL +1` (`sync.ts:309-317` groups by consecutive DATES; `dayview.ts compareContrib`), charged 1.0, manning 1.0;
  the Inputs page shows two rows. Put to him whether same-day halves should merge into one full-day Input.
- **S18** N10 wording on a member's own clashed day: with a live bid — "Your <LL bid is still live…"; with only
  Inputs-filed leave under a credit — "Two things on this day cover the same time…"; an admin — "…an admin needs to
  change one" (`DayList.tsx:216-226`).
- **S19** N15 in every stage: open / closed / published, the same row (Ack, Approve, Refuse, Move + date); on a
  PUBLISHED war a war-approved leave opens the remarks sheet only; the tap list's Back to bid/Refuse/Delete/Move absent
  there (`DayList.tsx:125-126`); a not-yet-approved bid on a published war still decides.
- **S20** N18: three notes in one save (a cut, a work note, a replaced bid) arrive joined, AMBER, and hold long enough
  to read; a "Saved" toast is not amber.
- **S21** N1: LL 12:00–14:00 → `LL>` (afternoon), +LVE −0.5, manning away 0.5, a morning bid allowed beside it;
  LL 11:00–12:00 → morning; LL 12:00 – 12:00 next day → afternoon on day 1 with a tail on day 2 that only clashes.
- **S22** §7: ATT C 09:00–14:00 over full-day LL → the medical draws as a morning (`C` with the AM stripe), −MED TOT
  0.5, the leave survives from 14:00 as a custom window (not `LL>` — it carries its own times), +LVE −0.5, manning
  away 1.0; the refusal wording for leave 10:30–11:30 names the real hours "(09:00–14:00)".
- **S23** the six-hour boundary: a medical 08:00–14:00 (6h00) → half; 08:00–14:01 → full (`medRowPortion:86`).
- **S24** the same-type refusal fires BEFORE anything is touched on add, edit AND drag (`normalizeInputDraft` runs
  before the batch — `inputedit.tsx:590-592, 953-955`; `caldrag.ts:113`): the neighbouring leave is uncut after the
  attempt.
- **S25** an upchit dated inside a medical that had cut leave: the summary lists the trim; the medical ends the day
  before; the leave stays cut (nothing re-grows it); the Medical view moves the man to Upchit Complete; a later-dated
  medical on file is put as Keep/Remove with no default (`UpchitConfirm.tsx:27-28`).
- **S26** H4/N6: a pilot's LL run 1–15 Aug with 8 Aug split LL morning / OL afternoon → 15 counts, the weekend inside
  charged (`charge.ts:222-226`); a half day on 8 Aug breaks it; a WSO's identical run charges working days only.
- **S27** answer D: LL 08:00–10:00 + OIL 10:30–11:30 → the half charged ONCE to LL (covers more); swap the lengths →
  OIL pays; equal lengths → the earlier start pays (`dayview.ts payerFor:251-258`).
- **S28** Q8: OL over CSE → box `OL`, `+1`, +LVE −n; the course still removes him from manning once (not twice).
- **S29** N14: a Sunday SDO desk with no times, published → the day's own warning names the desk; the publish toast
  carries BOTH facts (blind desk + any flagged bid) in one message (`sync.ts:1123-1130`).
- **S30** D19: a Saturday in 2028 (no war) → the day says no period exists and offers to create it; created in DRAFT;
  the credit lands only after publishing again.
- **S31** D142: an AL that takes Ranger off a published Saturday → his auto credit goes on the next pass, an award on
  the same day stays; the Unpublish warning fires only when the balance would go negative
  (`oilCreditBidAgainst:1166-1200`).
- **S32** a reload (not `?fresh`): every Input, every cut piece, the notice, the award with its giver/days, the
  posting dates, the medical documents — nothing lost or doubled; the war opens on the war being bid on, not the last
  one looked at.
- **S33** storage fault: make `putMany` throw once (a probe) → the header reads FAILED; the retry lands the WHOLE
  group (the input AND the bid removal AND the notice — one command, one group, `whiteboard.ts:134-146`); close and
  reopen → the boot replay finishes it; reopen again → nothing doubled. Two tabs: the loser's writes are lost as one
  net group, never a half.
- **S34** the guest: the issued week only; "Not published yet" on the rest; a medical row in full; no ⓘ, no Traffic,
  no picker; the swipe moves the week; Sign out.
- **S35** History (R21) after: a war approve, an un-approve, a war move, a medical cut, a calendar drag — each line
  names the CALLSIGN (D166 (5)); record which of the war's own acts leave NO line.
- **S36** CSV: `142-inputs.csv` after S5 carries the pieces with their own tails; the schedule CSV's Unavailable reads
  as issued after S9(a).
- **S37** a posted-out, ARCHIVED man signs in (an account tied to him): his row is kept on the war; he can bid clearing
  leave after his PO (answer C); Quals shows him archived.
- **S38** PH declared on a Saturday after leave was approved → +LVE gives the day back at once (derived); declared
  after PUBLISHING → the day's OIL_STALE_DAY advisory and the credit waits; lifted after publishing →
  OIL_STALE_HOLIDAY, the credit stays until republished (D2).
- **S39** Show SANS off: a SANS man's leave still charges and his published Saturday still credits (`desiredOilCells`
  guard); turning Show SANS on shows the row with everything already in it.
- **S40** edit an award's reason / giver / days on the tap list → ONE Undo takes all three back; 1.25 refused with
  `HALF_STEP_MSG`, nothing written.

---

## 4. Explicit negatives — what I checked and found nothing wrong

- **The gate's order and its rollback.** `inputgate.ts apply:345-369`: the cut runs before the invariant, the
  invariant before the bid replacement; a refusal throws `CmdRefused` after the toast, the command layer rolls the
  Inputs back and the whiteboard rolls its keys back (`whiteboard.ts abort:147-152`); a refused WAR gesture re-reads
  the absence index before its repaint (`store.ts gesture:2039`, `sync.ts:176`). Nothing half-applied that I can see.
- **`barsWrite` at every door.** The Inputs door (`vet`), the bid door (`cellProblem` / `setCell` → `occupiedFor`),
  approve (`doorApprove:298`), the two movers (`moveProblem`, `doorMoveApproved:499`) and the reconsider-a-refusal
  path (`decideRequest:2440`) all read the ONE predicate; recorded work bars nothing anywhere (N4 table) — CONFIRMED.
- **Real hours for a medical.** `inputWindow` gives a medical `real` beside its half; `winsOf` is what `forbiddenPair`,
  `sickCutsLeave`, `replaceBids` and the refusal wording read (`absences.ts:131-146`, `inputgate.ts:91-96, 195-199,
  329-333`). Consistent.
- **N2 the credit lands.** `ingestDutyCredit` never refuses on a clash (`store.ts:3362-3389`); the reverse pass only
  removes `auto` (`:1222-1233`); `forbiddenPair` exempts an award (`dayview.ts:158`); `duty` reads `auto` only
  (`:326`); manning reads `haveOf` (availability only). N13/N16/N17 hold in the code as written.
- **Notices: who and when.** `replaceBids` names the SIGNED-IN callsign, leaves none for the person's own filing
  (`inputgate.ts:316-336`); `ackReplacement` — the person or an admin, one group per command (`store.ts:2447-2468`).
  The register §8's "(an admin)" wording is history now.
- **The war's approve writes the Input inside the gesture** and goes through the gate with `inDoor()` (no second
  bid replacement); an extension merges only on the same remark body (`sync.ts:283-363`) — Fable #7 holds.
- **The published face is frozen for every input kind, medical included** (`inputs.ts:56-69`; `events.ts inpShow:37-52`;
  `html.ts:1872`); the input-details axis compares by content, then id, then man; an upchit is out (`inputs.ts:110-137`).
  `[PUB-UNAVAIL]` is closed by construction.
- **Members' scope.** `mayEditInputOf` / `mayDeleteInputOf` on the write path (`inputedit.tsx:938, 1331`);
  `commitNewInput` pins a non-scheduler's draft onto `me()` (`:807-813`); the calendar drag refuses another's chip
  (`caldrag.ts:89-92`); `canEditRow` at the war's writes; `ownershipViolation` at the commit gate (`perms.ts:323-352`).
  The guest and pending are nobody's person and write nothing.
- **Answer C / N8 / N12.** `leaveDateOk` only asks that a war holds the date (`store.ts:2247-2249`); the posting dates
  gate nothing; the row stretches by `merge.ts spans:151-168`; the admin's "Place leave or OIL here instead" is wired
  at both ends (`Matrix.tsx:4195, 4214`).
- **The medical dialogs' asks.** Same-type refusal, the upchit refusals, "downchit over an upchit", the document ask,
  the clash sheet's forced 'new' when the old row covers the whole entry, the leftover default — all where the register
  says (`inputedit.tsx:245-310, 610-630, 1643-1698`; `MedClashConfirm.tsx:53-58`).
- **The OIL ask** runs before the write on the dialog, and the question follows a drag / reassign / in-place time edit
  (`askOilIfPending`, `inputedit.tsx:1250-1256`; `caldrag.ts:127`).
- **`freeHalfBeside` and the ladder / mark / charges** (`dayview.ts`): the ladder, `+n` vs `!`, a half charged once,
  `annualFull` (touches both halves), `away` by halves — as the register says.
- **Undo is one timeline** for the war and the schedule; a switch of war re-baselines the legacy stack only
  (`selectWar:3845`), the global timeline snaps to the war/date of the step (per the `[GLOBAL-UNDO]` notes in
  `store.ts:1147-1152`).
- **Storage**: one command → one net group → one `putMany`; a failed group retries as a superset for ever
  (`postman.ts:100-132`). The design holds; only the SIGN of a failure is thin (R25).
- **Not checked, said plainly:** the OIL tracker's ledger view in detail, the figures drawer's boxes, the ManningSheet
  thresholds, the phone's `select.ts` two-step move, the Week Insights, the printed schedule, and the e2e specs'
  bodies (only their names). Those are the walkers' to look at.

---

## 5. The defects I believe are real — confirmed vs predicted, with the fix

### F1 — the bid sheet's "Clear" removes the day's OIL award (CONFIRMED)
- `BidPicker.tsx:255-259` — Clear calls `clearCells([{personId, date}])`.
- `store.ts clearCells:2262-2282` → `writeMany(rest, '')` → `setCell(personId, date, '')`.
- `store.ts setCell:2154-2160` — the clear branch drops every request AND, for an admin, the `manual` credit:
  `next = list.filter(r => !(r.kind === 'request' || (r.kind === 'credit' && r.oil === 'manual' && state.role === 'admin')))`.
- Money leaves with no word; the sheet's own +OIL panel already has a "Remove" for the award (`BidPicker.tsx:548-551`)
  and the tap list has a per-record Clear (`DayList.tsx:183`).
- **Fix:** in `setCell`'s clear branch, drop requests only (`r.kind === 'request'`); leave the award to
  `clearRecordById` (the +OIL Remove and the tap list). Then `clearCells`'s "clearing an EMPTY cell" guard
  (`:2229`) should test `r.kind === 'request'` only, so a day holding only an award is neither written nor counted
  as skipped. Add a store test: an admin's `setCell(p, d, '')` on a day with a bid and an award removes the bid and
  keeps the award; and a `BidPicker` test that Clear on such a day leaves +OIL unchanged. If the owner WANTS Clear to
  take the award, the one-line alternative is the sheet's note: "Clear also removes the OIL award on this day".

### F2 — bulk Delete removes every award in the rectangle (CONFIRMED)
- `SelectSheet.tsx:91-97` → `clearCells(sel.cells)` → the same `setCell('')` path as F1; the Delete button shows
  whenever ANY movable bid is in the box (`:77`), so one bid beside two awards wipes both.
- **Fix:** F1's store change closes it. Until then the sheet's second-tap confirm ("Delete N days for X? Tap Delete
  again") should count and name the awards it will remove.

### F3 — a leave piece the war cuts, un-approves or moves keeps its old "till <date>" (CONFIRMED)
- `sync.ts sliceInput:368-386` copies `...row` (remarks included) and rewrites only `date`, `endDate`, `lwMoved`,
  `iid`. Callers: `inputgate.ts:151` (sick cuts leave), `sync.ts:406` (cutDates — un-approve and delete),
  `sync.ts:521, 544` (the war's move). The two paths that DO rewrite: `inputedit.tsx applyMedPlan:366` and
  `sync.ts doorApprove:352`. Consequence: the Inputs page, the week and the board print a "till" that contradicts the
  row's dates; and D189's "each published day it still covers reads 1 pending" does not fire for a leave cut by a
  medical (the remark is unchanged, dates are not compared — `inputs.ts:90-95`), so the walk's expectation must be
  stated per path.
- **Fix:** in `sliceInput`, after the dates are set:
  `if (hasRemarksTail(row.remarks)) out.remarks = withRemarksTail(row.remarks, from, to, 'till')` — export a
  `hasRemarksTail` from `engine/inputs.ts` (the `DATE_TOKEN` test, `:850`) so a remark with no token gains none.
  Keep the war's approve-extend as it is (it already rewrites with 'on'). Pin: cut LL 14–18 "till 18 Jul Bali" by
  ATT C 16–17 → pieces read "till 15 Jul Bali" and "till 18 Jul Bali"; a war move of 14–15 to 21–22 reads
  "till 22 Jul Bali". Then `latepub.test.tsx`'s D189 case gains the leave-cut twin.

### F4 — the calendar DRAG of a medical (or upchit) chip resolves a different-type clash with no question (CONFIRMED)
- `caldrag.ts commitChipMove:106-113` → `commitInputEdit(r, d)` with `keepTail` / `entryEnd` undefined.
- `inputedit.tsx commitInputEdit:961-965` plans `newMedTrimPlan(...)` (or `upchitTrimPlan`) and `:1114` applies it;
  `engine/medical.ts:206-217` says the forms put every clash to the filer first and "omitted … keeps EVERY tail, the
  safety default" — the drag is a door that omits it. The same for `reassignInput` (`inputedit.tsx:1187-1219`).
  The owner's rule (27 Aug 26, the sheet's header comment): "never resolves silently … NO default on that choice".
- **Fix:** in `commitChipMove`, before the commit, when `isDownchit(r.type)` or `isUpchit(r.type)`: compute
  `medClashes(r.person, r.type, a, b, r)` (or `upchitEffects(...)`) on the SHIFTED dates; if anything would be asked in
  the dialog, do not commit — open the editor on the row with the shifted dates in its draft (`setInpEdit(r)` with a
  seeded `start`/`end`, the way the calendar's `openAdd` seeds a draft) so the InputEditor's own `save()` runs the
  clash sheet; toast "Choose who holds the shared days first". The same guard in `reassignInput` for a medical. Pin:
  a drag that would trim a different-type downchit writes nothing and opens the sheet; a drag with no clash still
  lands at once.

### F5 — a posting that closes before it opens is refused silently (CONFIRMED)
- `store.ts setPostOut:1496` returns false when `to < person.from`; `setPostIn:1534` when `date > person.to`; both
  also refuse a malformed string. Callers ignore the boolean: `Matrix.tsx:4372-4379` (`setPostOut(...); close()` /
  `setPostIn(...); close()`), `SelectSheet.tsx:189` (`onPostOut(...); onDone(true)`), and the two posting sheets'
  `onChange` (`BidPicker.tsx:1023, 1032, 1117`) where a refused date visibly snaps back with no word.
- **Fix:** make the three sheet callbacks read the boolean; on false keep the sheet open and set its note:
  "Their posting-out has to be on or after their posting-in (<PI date>)" / "Their posting-in has to be on or before
  their posting-out (<PO date>)". `BidPicker`'s PI/PO confirms already have a `moveErr`-style note slot; reuse it.
  Pin in `bidpicker.test.tsx`: a refused PO keeps the sheet open with the sentence.

### F6 — a conflict raised by an overnight tail ambers a day whose list does not show the tail (PREDICTED)
- `dayview.ts:263-269` — `conflicts` includes spill contributions (only both-spill pairs are skipped); `:262` —
  `shown` excludes spill; `DayList.tsx:108` lists `view.all`; `:216-226` draws the clash sentence on
  `view.conflicts.length > 0`. So a tail (leave running past midnight) against next-morning PUBLISHED work (an `auto`
  credit from 05:00) gives `!` and the sentence with only the credit listed.
- **Fix:** give `DayView` the conflicting spill contributions (`spills: Contrib[]` — those in `conflicts` and not in
  `all`), and have `DayList` print each as its own read-only line: "<LL from the day before, till 06:00 — clashes here".
  Pin in `daylist.test.tsx` with a 20:00–06:00 leave and an 05:00–12:00 auto credit.

### F7 — "N decided" counts an already-approved leave (PREDICTED from `store.ts:2344`)
- Bulk Approve: `if (bid === 'approved') { decided++; continue }` on a cell whose main is a war-approved leave.
- **Fix:** count it neither decided nor skipped (nothing changed), or word the note "N decided · M already approved".

### F8 — the plan's R9 names the wrong sheet (CONFIRMED — a plan defect, not an app one)
- `PersonSheet.tsx` is seat/band/SXO; see M1. Fix the plan's row and give the walker `BidPicker.tsx`'s PI/PO fold and
  the two posting sheets.

### Questions for him, not defects (put on the look card)
- **S17** — should two same-day half bids approved together become ONE full-day leave (today: two Inputs, the box
  `<LL +1`)?
- **R6** — should the tap list show the REMARK of an Inputs-filed leave (today: "Change it on the Inputs page." and
  nothing else — `DayList.tsx:143`)?
- **R14** — the remarks sheet's header prints "Jul 13 → Jul 15" (month-first) where every other Inputs surface speaks
  day-first (`RemarksSheet.tsx:35`; ui-contracts §The Inputs page speaks one day-first date voice).
- **R9c** — bulk Post out exists, bulk Post in does not; leave it?
