# Fact map — what each page lets you do with an absence today (from the code, 26 Nov 26, not walked)

For the rethink he asked for (D2782): the Leave War, the Inputs pages and the schedule looked at together. This is a
fact map only — no opinion, no redesign. Every cell was read from the code on branch
`claude/leave-points-notifications-7a2f04`; a cell marked **(inferred)** follows from code read nearby but was not
traced to its last line. Nothing here was walked in the running app. Where a ruling says something is planned and not
built, the cell reads "built: X; ruled: Y (D-number)". The survey of drops on the schedule (chat 189, walked on the
running app) is `../specs/2026-11-26-combined-input-rows.md` §The survey; cells that rely on it say "(survey)".

**The three pages.** *War* = the Leave War grid and its windows (the one-day bid window, the drag window over several
days or men, the day's list, Approvals). *Inputs* = the Inputs list, the Inputs calendar (month, its bars, a day
opened) and an input's own window opened there. *Schedule* = Edit Schedule's week and the Scheduler Board (Unavailable,
Personal Inputs, Ground / Common Programme rows) and the input dialog they open. A member never edits on the schedule:
Edit Schedule and the Board are a scheduler's (`state/auth canEditSched`); a member sees View-only Sched, where only
Unavailable prints (`ui/html.ts` day renderer, "In VIEW mode … only Unavailable prints"). A scheduler is always an admin
(D785), so "admin" below means admin / scheduler.

**File short names used in the cells.** BP `leavewar/ui/BidPicker.tsx` · MX `leavewar/ui/Matrix.tsx` · DL
`leavewar/ui/DayList.tsx` · SS `leavewar/ui/SelectSheet.tsx` · RW `leavewar/ui/ReqWords.tsx` · ST
`leavewar/state/store.ts` · SY `leavewar/sync.ts` · AB `leavewar/absences.ts` · DV `leavewar/engine/dayview.ts` · MP
`leavewar/ui/matrixrowparts.ts` · IW `ui/InputWindow.tsx` · IE `ui/inputedit.tsx` · CD `ui/caldrag.ts` · H `ui/html.ts`
· BH `ui/board-html.ts` · DR `ui/drag.ts` · RD `ui/reqdoor.ts` · PM `state/perms.ts` · EI `engine/inputs.ts`.

---

## 1. Leave on the Leave War itself

### 1a. A bid (pending or refused) — LL, OL, OIL, CCL, PL, FCL, EL, CL

A bid lives only in the war's own store (`ST setCell` — "the only path that writes a request"). OIL leave is a bid like
the others, spending the OIL balance (`leavewar/engine/codes.ts LEAVE_TYPES`).

| Action | War | Inputs | Schedule |
|---|---|---|---|
| See it | YES, its box on his row (MX) | NO — a bid is not an input until approved (SY doorApprove) | NO (inferred: the schedule reads only inputs) |
| Create it here | YES: tap a day → bid window, pick leave (BP → ST setCell); a range by the window's calendar or a drag (SS). Member: own row, open days from today only (ST canBidOn, `engine/access canEditCell`); admin any row, any day | NO | NO |
| Drag-move its days | YES: move mode (MX; ST movableRecords/requestMovable). Member: his own while it waits, open days; a refused one admin only | N/A | N/A |
| Change dates by a form | Partly: the window's range calendar re-types the picked days (BP setCellRange); no start/end form | N/A | N/A |
| AM / PM / whole day | YES: Duration row Whole day / AM / PM, then the leave (BP PORTIONS) | N/A | N/A |
| Custom times | NO — halves only (BP PORTIONS) | N/A | N/A |
| Add / remove a person | NO — a box is one man's row | N/A | N/A |
| Swap a person (drop) | NO | N/A | N/A |
| Delete | YES: empty pick / Delete (BP → ST clearCells); member his own pending, even on a day since closed (ST ownPendingOnClosedDay, D1225) | N/A | N/A |
| Reject | Admin: Refuse (BP, DL "dl-refuse", SS "sel-refuse"; ST setBidStates / decideRequestById) | N/A | N/A |
| Approve | Admin: Approve, Approve all, or "Approve what I enter" while placing (ST placeApproved → SY doorApprove, which turns the bid into an input) | N/A | N/A |
| Attach a paper | YES: the window's Document button (RW; ST setRequestWords docIds) | N/A | N/A |
| Remark | YES: the window's Remarks box (RW; ST setRequestWords) | N/A | N/A |

### 1b. Leave approved on the war — one man's, the war's tag on the input

Approval writes ONE input per man per run of days, tagged as the war's (`lw`), joined to an approved run beside it
(SY doorApprove). It may never hold a second person: "A leave approved on the Leave War is one person's — file the other
person's leave as its own input" (EI shapeProblem / LW_OWN).

| Action | War | Inputs | Schedule |
|---|---|---|---|
| See it | YES, plain box (DV offWar false) | YES, as an ordinary leave card / bar | YES, a row under Unavailable |
| Create it here | YES, by approving (above) | NO — a leave filed here is not the war's | NO |
| Drag-move its days | Admin YES (ST absenceMovable → SY doorMoveApproved); member NO | YES: bar drag on the calendar (CD commitChipMove) — a member's drag of his own is a date change, which takes the war's tag off (IE saveInputEdit: "a MEMBER's own date / type / person edit … clears `lw`"); an admin's keeps it | NO |
| Change dates by a form | Admin: Move, or Delete "All n days" or the day tapped (BP `pick`); longer by approving a day beside it, which joins (SY doorApprove). Member NO: remarks only (MX remarkRow, D1177 reading) | YES, the window's calendar (IW datesHere) — member's change clears the tag as above | NO: "The dates are changed on the Inputs page." (IW hint) |
| AM / PM / whole day | Not directly: re-typing over it is refused "That time is already taken by LL — clear it first." (ST cellProblem) (inferred: delete then place) | YES, Duration All day / AM / PM / Custom (IW SpanPicker; EI leave kinds `half:true`) | YES, in the dialog the type label opens (same SpanPicker) |
| Custom times | NO | YES (Custom) | YES: start / end typed in place on the row (H inpTimeCells → IE setInpField) |
| Add / remove a person | NO | NO: refused with LW_OWN (EI shapeProblem) | NO |
| Swap a person (drop) | NO | Admin: change the Person in the window (IW PeoplePick) (inferred: tag kept, as an admin edit) | YES: drop a puck on his puck (DR → IE reassignInput, one-man branch) |
| Delete | Admin: Delete (BP → ST clearCells → SY doorRemoveApproved); member NO: "Nothing here can be deleted from the war: approved leave and leave filed on the Inputs page are changed on the Inputs page." (BP) | YES, window's Delete (IE removeInput — "WITHDRAWS the leave from the war too") | YES, the dialog's Delete (inferred: same window) |
| Reject | Admin: send it back — Refuse on it (DL; SY doorDecideApproved) | NO | NO (Unavailable's Reject is for commitments, OD, course, Attach only — H accCtl `unfile`) |
| Approve | Already approved | N/A | N/A |
| Attach a paper | YES: admin in the decide window, member his own (MX adminNoteRow / remarkRow → RW → IE setLeaveRemarks) | YES | YES via the dialog's Document field (IW inner form) (inferred) |
| Remark | YES, same boxes; a drag window's words go onto it too (SS keepWords) | YES | YES: typed in place (H inpRmkCell) |

### 1c. Items only the war has

| Item | What can be done | Where it is written |
|---|---|---|
| OIL award FO / HO | Admin grants from "Grant OIL" in the bid window or the OIL tracker; changed / deleted from the day's list; never moves with a block ("1 OIL award stays") | ST grantTo, DL; MX stayWords. A typed FO/HO: "OIL is given from the day's +OIL panel or the OIL tracker." (ST OIL_DOOR_MSG) |
| The app's own credit FO* / HO* | Read only: "Earned off the published schedule — change the schedule and the OIL follows." / "Earned off a duty input that was accepted — change that input, not the schedule." | BP raptor sheet |
| Posting out / in | Admin, from the window's ⋯ (Post out, Post in; one man only in the drag window) | BP moreItems, SS |
| A bid replaced by an input | Day's list line "…bid was replaced by …", "OK, seen", "Add to the leave" (carries its words onto the leave) | DL (replacedCarry → IE setLeaveRemarks) |
| No Leave / events / holidays | Not per person: the Event rows ("NL" a preset short form), filled from the Event sheet or the holiday file | leave-war.md D645, D1500 |
| UNA | Gone (D1338, D1356): an admin's "Other" from the ⋯ is filed as an input under Unavailable instead | ST fileStraight |

---

## 2. Leave filed on the Inputs page — one man

An ordinary input with no war tag. It lands approved, whatever the war's closed dates (D1166, D1225).

| Action | War | Inputs | Schedule |
|---|---|---|---|
| See it | YES, box with the "filed on the Inputs page" edge (DV offWar; legend "Filed on the Inputs page: change it there, not here") | YES | YES, under Unavailable |
| Create it here | NO (a war leave is a bid) | YES: "+ Input" (opens on OL — D917) or a date picked on the calendar; member his own only (PM mayFileInputFor) | YES: Unavailable's "+ Add", one man, a date range (H/`ui/interactions` `data-inpadd` kind 'u'; IW ctx 'u') |
| Drag-move its days | NO: "One of those is filed on the Inputs page and cannot be moved here." (MX moveReason); in a block it stays, the banner saying "1 leave filed on the Inputs page stays" | YES, bar drag on the calendar, by anyone who may change it (CD commitChipMove; PM mayEditInput) | NO |
| Change dates by a form | NO: a tap opens the bid window with one line per entry "· change it on the Inputs page", no Approve / Move / Delete (MX openHeld, BP HeldEntryLine); on a day closed to the reader, the read-only note "Filed on the Inputs page, so it is already approved — change it there, not here." | YES, the window's calendar | NO: "The dates are changed on the Inputs page." |
| AM / PM / whole day | NO for it; beside a half of it, the free half is offered for a bid (MX openFreeHalf, BP heldLeave) | YES (SpanPicker) | YES (dialog) |
| Custom times | NO; shown rounded out to a half or whole day (AB rowPortion) | YES | YES, typed in place |
| Add / remove a person | NO | Admin YES, "Several people" in the picker (PM mayFileGroup: any kind but medical / upchit); member NO (leave is never filed for others — PM memberFilesForOthers) | NO (survey: Unavailable takes no second man) |
| Swap a person (drop) | NO | Admin: the Person picker (member's own is locked — IW `lockOne`) | YES: drop on his puck (IE reassignInput); on the row's empty part: replaces on the week, nothing on the Board (survey) |
| Delete | NO (BP note above) | YES, the window's Delete, asks nothing (D792) | YES, dialog's Delete (inferred) |
| Reject | NO ("a decision needs a bid, not a leave filed on the Inputs page" — SS) | NO | NO |
| Approve | N/A — "already approved" | N/A | N/A |
| Attach a paper | Member on his own day: YES, the bid window's Document (MX openHeldOwn → RW); others: read only chips | YES | YES via dialog (inferred) |
| Remark | Member on his own day: YES (RW → IE setLeaveRemarks); admin NO (no box: the held line only) | YES | YES, typed in place |

---

## 3. Leave filed on the Inputs page — several people (a group leave)

One input record with a list of people (D756). Only an admin can file it (PM mayFileGroup).

| Action | War | Inputs | Schedule |
|---|---|---|---|
| See it | YES, as each man's own box on his row, nothing marking it as shared (SY refreshAbsences: "a leave filed for three is three men's") | YES, ONE card / bar naming everyone (D727, D655) | YES, a row a man under Unavailable (H inGrp `!acc` lines; D737) |
| Create it here | NO | Admin: "Several people" in the window | NO: the schedule's adds are one man (IW Person select, not the picker, for a new row) |
| Drag-move its days | NO (as section 2) | YES, the bar moves for everyone (CD, `whole`); a member in it who did not file it: refused "Only X — who filed it — or an admin can move this for everyone" (IE sharedRefusal) | NO |
| Change dates by a form | NO | YES, for everyone: "Date changes apply to all N." (IW hint, D681) | NO |
| AM / PM / whole day | NO | YES, for everyone | Dialog from any man's row: YES, for everyone (IW `picker` true for several — D748) |
| Custom times | NO | YES, for everyone | Typed on ONE man's row: he is cut out onto an input of his own, the rest unchanged (IE saveFromRow → ownPartSave → `engine/inputown` ownInputOf). Dialog: for everyone |
| Add / remove a person | NO | Admin YES; each man may "Take me out" (IW mineRow) | NO; built: no add by drop (survey); ruled: one combined row, drop adds / replaces (D2777, D2772, D2779) |
| Swap a person (drop) | NO | Admin, in the picker | YES: drop on a man's puck replaces him inside the shared input, no split (IE reassignInput, several branch) |
| Delete | NO | YES, asks "Delete this input for all N people?" (IW delAll) | Dialog: same question (inferred, same window) |
| Reject | NO | NO | NO |
| Approve | N/A | N/A | N/A |
| Attach a paper | A member on his own box: YES — and that save CUTS HIM OUT onto a leave of his own (RW → IE setLeaveRemarks → ownPartSave). Built: one list of papers for the input; ruled: one paper a man, seen only by him and admins (D2781) | YES, one list for the input | Dialog (inferred) |
| Remark | Same as the paper: his own box's remark cuts him out (still so, read in IE setLeaveRemarks); the day's list "Add to the leave" too (DL replacedCarry) | YES, for everyone | Typed on one man's row: cuts him out (IE saveFromRow); dialog: for everyone |

Ruled, not built (D2778): on the war a man's box of a group leave opens the input's own window, a change there is for
everyone, the box marked as shared; one man changed alone is taken off and given his own leave — the war never splits a
man off by itself. Ruled, not built (D2777): a group leave is one row on the Unavailable list.

---

## 4. Other absences from inputs — overseas duty (OD), course (CSE), Attach, medical

Whether each counts him out on the war: an OD by its kind unless a scheduler took it out; a course and an Attach only
while under Unavailable; a medical always (AB warCounts, warVisible). Filed from the war, an OD, a course or an Attach
(and an admin's Other) is written as an input with no war tag — one input a man a run of days, never one shared input
(SY doorFile, `toPeople(row)` per run) — and from then on is "the Inputs page's" (ST FILED_STRAIGHT; DV OFF_WAR).

### 4a. OD, course, Attach

| Action | War | Inputs | Schedule |
|---|---|---|---|
| See it | YES, outlined box (OD / CSE by kind; Attach while under Unavailable) | YES | OD under Unavailable by kind; course and Attach land there by themselves (D1372, D1374) |
| Create it here | YES: OD / CSE buttons, Attach in ⋯ — member his own row, admin any, any day, open or not, no approval (ST fileStraight, D1318); several men at once by a drag gives each man his own input | YES; "Several people": admin, and a member for others while the members' switch is on (PM memberFilesForOthers — these are "other" kinds) | YES: Unavailable "+ Add" for OD (the 'u' type list); course / Attach from Personal Inputs' add (inferred from IE firstPersonalType) |
| Drag-move its days | NO; in a block it stays, unsaid (ST stayingIn: "A medical, a course … go unsaid") | YES, bar drag | NO |
| Change dates by a form | NO: "Change it on the Inputs page, not here." (BP raptor sheet) / held line "· change it on the Inputs page" | YES | NO |
| AM / PM / whole day | OD / CSE: whole day only (D1350); Attach: Whole day / AM / PM | NO halves: an "all day" tick and start / end times (IW; EI `half:false` for OD, CSE, Attach) | Dialog: all-day tick + times |
| Custom times | NO ("any other time is set on the Inputs page" — the Other / Attach button's hover) | YES | YES, typed in place |
| Add / remove a person | NO | YES as above; Attach's "To" box | NO (survey) |
| Swap a person (drop) | NO | Picker | YES, drop on his puck (IE reassignInput) |
| Delete | NO | YES | Dialog (inferred) |
| Reject | NO | NO | Admin: "Reject" on its Unavailable row — "Take it back out of Unavailable, into Personal Inputs" (H accCtl `unfile`); it then counts him IN on the war (D1381, D1389) |
| Approve | N/A — stands at once | N/A | "→ Unavail" puts a rejected one back (H accCtl) |
| Attach a paper | Read only on the war | YES | Dialog (inferred) |
| Remark | Read only on the war (held line / day's list) | YES | Typed in place (one man's row of a shared one cuts him out, as section 3) |

### 4b. Medical — HL, OML, ATT C, ATT B (and the upchit)

| Action | War | Inputs | Schedule |
|---|---|---|---|
| See it | YES (a medical with hours shows them in its line) | YES, the Medical tab and the calendar | YES, under Unavailable |
| Create it here | NO: "Medical is filed on the Inputs page, not here." (ST cellProblem) | YES, "+ Medical" (opens ATT C); one man only, a paper required (PM mayFileGroup; EI needsDoc) | YES, Unavailable "+ Add" (medical is in the 'u' list) (inferred) |
| Drag-move its days | NO, unsaid | YES, bar drag, asked first where it meets another medical (CD medAskFor) | NO |
| Change dates by a form | NO | YES | NO |
| AM / PM / whole day | NO; a custom time of 6 hours or less counts as a half (AB medRowPortion) | YES (SpanPicker) | Dialog |
| Custom times | NO | YES | YES, typed in place |
| Add / remove a person | NO | NO: "A medical entry is one person's — each needs its own document" (EI shapeProblem) | NO; built: a drop replaces silently (IE reassignInput); ruled: refused with a note (D2775, D2776) |
| Swap a person (drop) | NO | Picker (admin) | YES, drop on his puck (asks first if he already has another medical — IE medAskFor) |
| Delete | NO | YES (an upchit's delete asks first — D1022) | Dialog (inferred) |
| Reject / Approve | N/A | N/A | N/A (no Reject drawn) |
| Attach a paper | Read only | YES, required | Dialog (inferred) |
| Remark | Read only | YES | Typed in place |

---

## 5. Duties and commitments from inputs — Training, Meeting, Appointment, Duty, Event, Personal, Other

On the war they show only while under Unavailable — filed there (an Other's "Goes to", an admin's war Other) or moved
there by a scheduler's "→ Unavail" (AB warCounts). On the schedule they wait under Personal Inputs (one line for a
shared input — D661) until accepted onto the Ground Programme (one row of pucks — D743) or filed under Unavailable (a row
a man).

### 5a. One man or several named men

| Action | War | Inputs | Schedule |
|---|---|---|---|
| See it | Only under Unavailable: outlined box (OTH, TRG, MTG …); its remarks read in the day's list (MX commitHeld → DL) | YES; shared: one card naming everyone | Personal Inputs line; Ground row once accepted; Unavailable row a man once "→ Unavail" |
| Create it here | Other only (admin, ⋯ → straight under Unavailable, D1365) | YES; for others: member while the switch is on, admin always (PM mayFileInputFor / mayFileGroup) | YES: Ground Programme "+ Inputs", one man, one day — "For a multi-day span, use the Inputs page." (IW hint, ctx 'g') |
| Drag-move its days | NO | YES, bar drag (whole input for a shared one) | NO |
| Change dates by a form | NO ("change it on the Inputs page", DL) | YES | NO |
| AM / PM / whole day | NO for it (an Other from the war took Whole / AM / PM at filing) | NO halves: all-day tick + times | Dialog: all-day tick + times |
| Custom times | NO | YES | Typed in place: on a Ground row or a Personal Inputs line for EVERYONE (D739); on an Unavailable row of a shared one, cuts that man out (IE saveFromRow) |
| Add / remove a person | NO | YES (filer or admin; each man may take himself out — D655, D755 (3)) | Ground row: a drop on a puck of several JOINS, on a one-man input's only puck REPLACES, drag off removes, the last man refused "…is the last on this input…" (RD; survey). Personal Inputs line: a drop does nothing, silently (survey: H inGrp `seatable=!acc`). Unavailable: replace only. Ruled, not built: every row as a sim row — drop on a puck replaces, an empty place adds (D2772, D2779); Personal Inputs refuses with words (D2773) |
| Swap a person (drop) | NO | Picker | As the line above |
| Delete | NO | YES | Dialog's Delete; Personal Inputs note "Delete it here if it should go entirely." |
| Reject | NO | NO (a member sees "Rejected by a scheduler" on an Other — IW goes line) | Admin: Reject on Personal Inputs (takes its Ground row off, or brings it out of Unavailable) (H accCtl); "To take an input off, press Reject on it in Personal Inputs below." on the Ground Programme |
| Approve | N/A | N/A | Admin: Accept / → Ground / → Unavail (→ Common for an ALL Other) under Personal Inputs (H accCtl) |
| Attach a paper | NO | YES | Dialog (inferred) |
| Remark | Read only | YES | Typed in place (as times) |

Once a scheduler has moved it, only a scheduler changes where it stands; the member keeps its times, dates, remarks,
title, paper, taking himself out and deleting (PM mayMovePlace; IW goesLocked; D1388, D1398).

### 5b. ALL / ALL AVAIL inputs

| Action | War | Inputs | Schedule |
|---|---|---|---|
| See it | NO — nobody's absence (SY refreshAbsences: "an input for ALL AVAIL is nobody's") | YES, on the day and the calendar only, not in each man's own inputs or bell (D702) | YES, on the Common Programme by its time (H onCommon; D954, D955) |
| Create it here | NO | YES, seven kinds, one day (EI placeholderProblem: "…is for one day") | NO (inferred: the "+ Inputs" Person list offers placeholders — IW PlaceholderGroup — so possibly YES) |
| Drag-move / dates / halves / custom times | NO | Bar drag; window; all-day tick + times | Times typed on its row (as any Ground row) |
| Add / remove / swap a person | NO | Filer or admin; a man named beside ALL AVAIL may only take himself out (D770) | Ground-row drops as 5a; never under Unavailable: "Unavailable is a real person's day — ALL AVAIL cannot take it"; "An ALL AVAIL input can only be changed in its own window. Open it to change who it is for." (IE reassignInput) |
| Delete / Reject / Approve | NO | Delete | Dialog's Delete; Reject / "→ Common" (H accCtl) |
| Paper / remark | NO | YES | Remark typed in place |

---

## 6. One item, different windows — and the same action behaving differently

- **A tap opens a different thing on each page.** Inputs: the input's own window, non-blocking, with dates, people and
  Delete (IW, `win`). Schedule: the same window as a blocking dialog with no dates ("The dates are changed on the Inputs
  page.") and, for one man, a plain Person list instead of the picker (IW `picker`, `datesHere`). War: never the input's
  window from a box — the bid window with "· change it on the Inputs page" lines (MX openHeld), or the read-only note
  (BP raptor sheet), or the day's list (DL), depending on whether the day is open to the reader, whether the entries
  fill the day, and whether a commitment is under Unavailable (MX listOpen / canRemark / openFreeHalf). Only the war's
  clash list jumps to the input's own window, switching to the Inputs page (SY openInputWindow, `ui/Chrome.tsx`).
- **The war splits a man off — still so.** On his own box of a group leave filed on the Inputs page, a member's Remarks,
  Document or "till" save gives him a leave of his own (RW → IE setLeaveRemarks → ownPartSave); so does the day's list
  "Add to the leave". Dates and halves cannot be changed there at all. The schedule does the same on one man's
  Unavailable row for a typed time or remark (IE saveFromRow), while a drop on his puck swaps inside the shared input,
  and the dialog from his row changes everyone (D748). The Inputs page always changes everyone.
- **Who may move a war-approved leave depends on the page.** On the war a member may not move or delete his approved
  leave; on the Inputs page he may change it fully — and doing so takes the war's tag off, so afterwards the war's admin
  can no longer move or delete it on the war either (IE saveInputEdit `delete r.lw`; ST absenceMovable).
- **Halves.** War: Whole day / AM / PM, and OD / course whole day only. Inputs: leave and medical have All day / AM / PM /
  Custom; OD, course, Attach and every commitment have no AM / PM — an all-day tick and times. So an Attach filed AM on
  the war becomes 00:00–12:00 times on the Inputs page (EI `half:false`; BP PORTIONS).
- **One input or many.** The Inputs page files one shared input for several men; the war's drag over several men files
  one input per man (SY doorFile); a war approval is always one man's (LW_OWN); the schedule's adds are one man.
- **Drops.** A drop on a Ground row joins or replaces; on Unavailable it replaces only; on a Personal Inputs line it does
  nothing and says nothing; on Unavailable's empty part it replaces on the week and does nothing on the Board (survey).
- **Moves of a block on the war** name what stays behind for leave and OIL awards, but a medical, a course or an OD stays
  unsaid (ST stayingIn).

---

## (a) Every on-screen sentence that sends the user elsewhere

War:
- "· change it on the Inputs page" — each entry line of a day filled from the Inputs page (BP HeldEntryLine).
- "Filed on the Inputs page, so it is already approved — change it there, not here." / "Change it on the Inputs page,
  not here." / "Filed on the Inputs page — change it there, not here." (BP raptor sheet).
- "Earned off a duty input that was accepted — change that input, not the schedule." / "Earned off the published
  schedule — change the schedule and the OIL follows." (BP raptor sheet).
- "Nothing here can be deleted from the war: approved leave and leave filed on the Inputs page are changed on the Inputs
  page." (BP).
- Hover text: Attach "…where to is added on the Inputs page"; Other "…any other time is set on the Inputs page" (BP,
  SS); OD / CSE "…filed at once, as on the Inputs page" (`leavewar/ui/LeaveButtons.tsx`).
- "change it on the Inputs page" — the day's list line of an entry not the war's (DL); "It runs on from the day before —
  change it there." (DL).
- "That could not be saved — change it on the Inputs page." (DL, RW).
- "Filed on the Inputs page: change it there, not here" — the Legend (`leavewar/ui/Chrome.tsx`).
- "One of those is filed on the Inputs page and cannot be moved here." (MX moveReason).
- "…skipped (no bid, or filed on the Inputs page)." / "None of those could be decided — a decision needs a bid, not a
  leave filed on the Inputs page." (SS).
- "Medical is filed on the Inputs page, not here." (ST cellProblem); "That leave was filed on the Inputs page — change
  it there" (ST changeAbsenceById fallback).
- "OIL is given from the day's +OIL panel or the OIL tracker." (ST OIL_DOOR_MSG); "This day holds several OIL awards —
  change them from the day's list" (BP).
- "Bidding is closed. To change your leave, seek management's approval, then file it on the Inputs page. Your approved
  leave updates here by itself." (`leavewar/ui/ClosedNoteSheet.tsx` CLOSED_NOTE).

Input window and schedule:
- "The dates are changed on the Inputs page." / "The person and the dates are changed on the Inputs page." (IW hint,
  opened from the schedule).
- "Added on <day>, straight onto the Ground Programme. For a multi-day span, use the Inputs page." / "Added on <day>.
  For a multi-day span, use the Inputs page." (IW hint, the schedule's adds).
- "To change its dates, delete it and add it again on the SANS calendar." (IW hint).
- "To take an input off, press Reject on it in Personal Inputs below." (H GP_TAKEOFF_NOTE).
- "A rejected input flags nothing until accepted again. Delete it here if it should go entirely." (H, Personal Inputs).
- "Its row is on the ground programme of <day> — load that week to change it" (H accCtl, hover of "On <day>").
- "<name> is the last on this input. Take the input off the programme, or delete it in its own window." (RD).
- "An ALL AVAIL input can only be changed in its own window. Open it to change who it is for." (IE reassignInput).
- "Only <filer> — who filed it — or an admin can <change / move / delete> this for everyone" and "A scheduler has changed
  who is in this — ask an admin to change it for everyone" (IE sharedRefusal).
- Related, not absences: "File it on the Inputs page's SANS tab." (`engine/avail.ts`); "No Leave War period for <year>,
  so no OIL can be earned for this day. Create the period on the Leave War." (`engine/validate.ts`, SY).

## (b) The time model of each page

- **War:** every day is a morning (00:00–12:00) and an afternoon (12:01 on); the war writes Whole day, AM or PM only
  (BP / SS PORTIONS); an OD and a course whole days (D1350). Inputs with other times are drawn rounded out — a 10:00–14:00
  leave reads as the whole day (AB rowPortion); a medical's custom time of six hours or less is a half (AB
  medRowPortion), and its line prints the real hours. Clashes are judged on real minutes (DV overlaps).
- **Inputs:** any run of dates by the window's calendar or a drag across days. Leave, medical and SANS availability:
  All day / AM / PM / Custom start and end (IE SPANS). OD, course, Attach and every commitment: an "all day" tick, else
  start and end times — no AM / PM (EI `half:false`). An upchit: one date, no hours.
- **Schedule:** a row's start and end are typed in place (cleared = all day) for any kind (IE setInpField); the dialog
  has the Inputs window's Duration controls; a saved input's dates are not changed from the schedule; Unavailable's
  "+ Add" takes a date range, the Ground Programme's "+ Inputs" one day.

## (c) Which store owns what

The war keeps its own store, saved apart (`leavewar/state/store.ts`; architecture `.claude/rules/seams/leave-war.md`):
its periods, bids and refused bids, the replaced-bid notes, OIL awards (FO / HO), balances and grades, open dates, event
rows and holidays, and postings. Everything else is an input in the app's one list of inputs (`engine/inputs.ts`
INPUTS): leave and absences filed on the Inputs page or added on the schedule, and also leave the war approved — an
approval turns the bids into an input tagged as the war's (`lw`) — and any OD, course, Attach or Other filed from the
war, which carries no tag (SY doorApprove, doorFile). The war never owns those inputs: it re-reads them into a per-man
index on every change, one line per named man, only the kinds that count him out (SY refreshAbsences, AB warCounts), and
writes back only through its few doors — approve, send back, delete, move (war-tagged leave only, one man's), file, and
the remarks save (SY installAbsenceDoor; IE setLeaveRemarks). The schedule reads the same inputs each time a week is
drawn; where an input stands there — Ground Programme, Unavailable or rejected — is a mark on the input itself (`acc`:
g / u / r), and a Ground row made from an input is that input (D755, D756).
