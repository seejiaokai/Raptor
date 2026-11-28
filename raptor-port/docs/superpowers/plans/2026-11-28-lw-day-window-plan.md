# Build plan — the Leave War's day window (A2), "+ New period" first, and the schedule's "To review"

Written 28 Nov 26 by a fresh Fable planner (chat 198's helper). A plan only: no source file changed, nothing committed.
For: the Opus chat that builds it; Astra and a fresh Opus, who each red-team it blind.
**Revised 28 Nov 26 after round 1 of the red team** (Astra, 6 findings; a fresh Opus, 16) — every finding checked against
the code and the rulings; what was done with each is §10. Rulings read from the notes branch
`origin/claude/leave-points-notifications-7a2f04` (since level with `main`; its D2866 and D2895 are now D2928 and D2929); code read on
`claude/lw-day-window-198`, level with `origin/main`. Paths are relative to `raptor-port/` unless they start with `.claude/`.

---

## 0. In plain words (for the owner — no file names)

**What gets built**

1. **The Leave War's day window, as you drew it (A2).** One window for a tap on a day. Under the name and date, the
   manning line. Then one card for each thing on that day — a bid, an approved leave, a course, an overseas duty, an
   Other, an Attach, a medical, an OIL award. Each card has its own buttons, its own Remarks and Document, and the small
   pucks of the people in it. A leave's card also has Whole day · AM · PM and the eight leave buttons, its own kind lit.
   The last row — CSE · OD · Grant OIL · ⋯ — is the same every day. Auto-approve shows only while new leave can be placed.
2. **What changes in what people may do**
   - An admin can Move and Delete a course, overseas duty, Other, Attach, or leave that was filed on the Inputs page,
     right on the Leave War. A medical never has Move or Delete there.
   - The pencil on a card opens that entry's own window over the Leave War; closing it leaves you where you were.
   - Tapping another kind of leave on a day that already has leave first shows one line ("only one kind of leave a
     day"); the second tap swaps it, keeping its remarks and Document.
   - A member can Move, Delete, shorten or swap **his own approved leave**. A move or change sends it back to pending
     for an admin; a delete just removes it. He never gets Approve or Refuse.
   - The small line reads "Placed by Saber · Fri 27 Nov, 12:46", then "· Approved by Hex · …" or "· Refused by Hex · …".
3. **The period list**: "+ New period" becomes the first line. Deleting or archiving a period is **not** in this build.
4. **The schedule**: "Personal Inputs" becomes "To review" and holds only what is not placed (rejected inputs, to accept
   again). Every Ground Programme row that came from an input gets its own Reject. The line "To take an input off, press
   Reject on it in Personal Inputs below." goes.

**How risky it is.** High. It changes who may change approved leave and lets the Leave War change entries that belong to
the Inputs page. So the plan builds the rules first, each with a test that fails before the change, and only then the
screen. It asks for a full bug check: a walk at phone and desktop size, Astra, a fresh Opus, a fresh Fable, and a
security read.

**How it ships.** Three pieces: "+ New period" first on its own small branch (one small change, it can be live the same
day); the Leave War day window with the "Placed by" line on one branch; and "To review" on its own branch, because it is
a different part of the app with different tests. Each merges on your "merge live".

**Six questions will come to you, each when the build reaches it** (section 8 has each, with a worked example, my
recommendation and what the build does until you answer): when Cutter leaves a group leave; Move and Delete on a
group's course; whether a pending bid also needs the second tap to swap its kind; whether the Auto-approve switch
should show when an admin swaps or shortens an approved leave (today it would decide the result while hidden); what a
member may do to his approved leave on a day closed for bidding or already past; and how "To review" looks on Edit
Schedule's week (only the Scheduler Board was drawn).

**A few screens are drawn for you first** (section 8, last list): they were not in the drawings you approved, so
they are not built until you have seen them.

---

## 1. What exists today (the facts the plan stands on)

Checked in the code on `main`'s level, 28 Nov 26.

**The windows a tap opens today** (`src/leavewar/ui/Matrix.tsx` 3684–3790, 4400–4813) — six different ones:
`BidPicker` (the one-day window: Duration, eight leave buttons, CSE · OD · Grant OIL · ⋯, an admin's Auto-approve, held-day
lines on top), `DayListSheet` (`ui/DayList.tsx`, a line per record with its own actions, opened where the day holds more
than one record, a commitment, or an away bid), `RemarksSheet` (a member's own approved leave — remarks and Document only),
`ClosedNoteSheet` (a member's closed day), the read-only schedule sheet, and `SelectSheet` (a drag across days — **not
part of this build**).

**The rules today** (`src/leavewar/state/store.ts`, `engine/access.ts`, `sync.ts`):
- `canDecide(role)` is admin only, and every door for approved leave asks it: `absenceMovable` (6230), `recordTakeable`
  (4340), `warEditable` (3978), `changeAbsenceById` (4505), `setBidStates` (4116), `decideRequests` (4443). **A member has
  no Move, Delete, half or kind change on his approved leave.**
- Every war door for an approved entry also requires the Input to carry `lw` (approved on the war) and a leave code
  (`warEditable`, `absenceMovable`, `sync.ts warLeaveRow` 514). **The war never moves or deletes anything filed on the
  Inputs page, even for an admin** — the list says "change it on the Inputs page" (`DayList.tsx` 209; `BidPicker.tsx` 703).
- A medical is refused at every war door already (`setCell` 3601, `cellProblem` 3496; `engine/dayview.ts OFF_WAR` 99).
- Un-approve exists for an admin: `sync.ts doorDecideApproved` (968) cuts the dates out of the Input and mints a war
  request in their place (remarks, till, documents, the placer's stamp carried), in one command. `doorRemoveApproved`
  (1010) cuts only. `doorMoveApproved` (1040) cuts and re-files. All inside `gesture()` (3337) → one command, one Undo.
- An approved leave **cannot be re-typed or re-halved in place**: no store function does it. A pending bid can
  (`setCell` 3628–3649 replaces the live bid on the same half and keeps its words, documents and placed stamp).
- Auto-approve is remembered per admin per device in the browser (`ui/BidBits.tsx useApproveMemory`, `ui/bidhelpers.ts`),
  and the **window**, not the store, decides which door a placement uses (`BidPicker.tsx` 253, 670–673).
- The bell: `store.ts decisionTells` (3201) → `sync.ts tellWar` (1651) → `state/notices.ts` (1116–1134). A person's own
  change tells nobody (3217). Admins are never told of a member's request or change (D1208) — it shows on Approvals' count.
- The commit gate (`state/perms.ts`): a member's `lw.cell` change must be his own row (3619), must not forge who placed
  or decided (`stampForged`), and on a day **not open for bidding** may only take his pending bid away or change its
  words (`LW_DAY_OPEN`, `onlyTakesPending`, `onlyChangesWords`, 3636). His input changes are judged by `inputBreach` (1053):
  his own input only, never a scheduler's move, the `lw` mark kept or dropped but never set.
- Inputs: `perms.ts mayEditInput` / `mayDeleteInput` (418–419; `mayChangeInput` 407): an admin; or the input's **only**
  named person; or its filer under `filedForOther` (377). A group input is nobody's own. `mayMovePlace` (425) locks only
  where a scheduler-moved input stands.
- The input window is mounted once at the app's root (`ui/App.tsx` 62; `ui/InputWindow.tsx` 143) and is opened by
  `ui/pops.ts setInpEdit(row)` (80). On any page but Inputs it draws as a blocking window (`#inpEditPop`, 1406). **It
  already opens over the war** with no page change: `sync.ts askFiledOil` (872–888). `sync.ts openInputWindow` (4700)
  is the other door — it switches to the Inputs page first, which D2889 no longer wants.
- The pencil: `src/ui/icons.tsx PenIcon` / `src/ui/pen.ts PEN_INNER`; the war's small pencil button is the Events list's
  `.ev-ctl.ev-pen` (`ui/EventsSheet.tsx` 228; its CSS `ui/bidpicker.css` 1122–1148).
- "Placed · Decided": `ui/PlacedLine.tsx` (`PlacedOne`), facts from `ui/placedfacts.ts`; also used by `ui/personleave.ts`,
  `ui/DayList.tsx`, `ui/BidPicker.tsx`.
- The period picker is a native choice list (`ui/Chrome.tsx` 216–230); "+ New period" is its last `<option>`, admin only.
- "Personal Inputs": Edit Schedule `src/ui/html.ts inGrp` (2224–2299, called 2315), buttons `accCtl` (2481–2528); the
  Board `src/ui/board-html.ts sbInputsGroupPanel` (817–850) and `sbInpRow` (692–808). The filter is
  `src/engine/inputs.ts listedPersonal` (713): it lists accepted (`acc 'g'`, drawn faded), rejected (`'r'`) and unplaced
  inputs. A Ground Programme row on **Edit Schedule has no buttons at all** (`grRowHTML` 2463 → `plRow` 804); on the
  **Board** it has CX · ⓘ · ■ · ✕, and the ✕ already rejects (`src/ui/board.ts` 1226–1254, toast "…back under Personal
  Inputs"). The helper line is `GP_TAKEOFF_NOTE` (`html.ts` 2435; drawn `html.ts` 1901, 2177; `board-html.ts` 204, 637).

**Two things in the brief that the code does not bear out** (so the plan does not build on them):
- "the phone's banner" and "a drop's refusal" do **not** say "Personal Inputs" today. The banner reads "Ground ·" /
  "Common ·" (`src/state/view.ts` 1448). The D2773 drop refusal is **not built** (`src/ui/drag.ts` 46 targets only
  `[data-inpseat]`). Only the Board's ✕ toast, two button titles, one input-window toast, two empty-state lines and the
  Admin page's labels say it.
- **Corrected in round 1 (Opus M2):** the first version of this plan said the waiting mark of an input filed after its
  day was published is drawn under Unavailable only. That was wrong. A Ground Programme row already carries it (D45,
  D93 — `engine/publish.ts alAttr`, drawn by `src/ui/html.ts` 598 / 689 and the Board's `sbTxt`); D1784 gave
  Unavailable rows "the same waiting mark … as on a Ground Programme row" (`html.ts unavPendAtt` 2418,
  `board-html.ts` 736–742). Nothing about it is open.

---

## 2. Roll-call — every place the app draws or changes each thing touched

Mark: **HAS** (already right) · **CHANGES** (this build) · **MUST NOT, because…** · **MISSING** (not there today, this build adds it).

### 2a. The day window and its cards (Leave War)

| Place | What it is | Mark |
|---|---|---|
| One-day window, empty day (`BidPicker`) — b1 | title, manning line, Duration, 8 leave buttons, last row | CHANGES: manning line moves under the title; nothing else |
| One-day window on a pending bid — b2 | today: window with Approve · Refuse row, one Remarks row, buttons | CHANGES: becomes a card; kind swap takes a second tap (D2897) |
| One-day window on war-approved leave, admin — b3 | today: `adminNoteRow`, lit Approved | CHANGES: card; Duration and leave buttons on the card; swap by second tap |
| Leave filed on the Inputs page, admin — b3 | today: a held-day line, "change it on the Inputs page", no Approve/Move/Delete | MISSING: the same card and buttons as war leave (D2886, drawing b3) |
| Medical — b4 | today: held-day line, read only | CHANGES: card, Document, pencil; **MUST NOT** get Move/Delete/leave buttons (D2888, D1552) |
| Course, OD, Other, Attach — b5 | today: held-day line, read only | MISSING: Move, Delete, Remarks · till · Document, pencil (D2886, D2892); add part stays below (D1552, D2924) |
| Two entries on a day — b6 | today: `DayListSheet`, no add part | CHANGES: cards, then the last row; the add part where a half is free |
| OIL award on the day — b6 | today: Edit… · Delete in the list (admin) | HAS — moved into its card unchanged; **MUST NOT** change, because every OIL rule is the OIL page's (D1209) |
| OIL the schedule earned (FO*/HO*) | read only | HAS as a card with no buttons; MUST NOT gain any, because the published schedule owns it |
| A replaced-bid notice on the day | today: a list line with its acknowledge | HAS — its card keeps what the line has (my reading R9) |
| Refused bid | today: lit Refused, Approve grey | HAS — card (D2881 look already live) |
| Group leave — b7, b7b | today: a read-only line on each man's day | MISSING: pucks, Change · 3 pax · Cutter, pencil, Move · Delete (step 16; questions Q1, Q2) |
| Half day beside a free half — b8 | today: free-half window naming the held half in a line | CHANGES: the held half's card, then the free half's Duration + buttons + Auto-approve |
| Pencil pressed — b9 | today: none on the war's day window | MISSING: the entry's input window over the war (D2889) |
| Member, his own approved leave — m1 | today: `RemarksSheet` (remarks, Document) | CHANGES: card with Move · Delete, Duration, leave buttons; no Approve/Refuse; no Grant OIL; no Auto-approve |
| Member, his own pending bid | window with Move, Delete, remarks | CHANGES: card; swap by second tap; stays pending |
| Member, his closed day (`ClosedNoteSheet`) | note, his bid, Delete, CSE · OD | **MUST NOT change** in this build, because D1354 keeps it and no drawing redraws it (reading R1) |
| Member, another man's day | today: nothing opens on an empty day; a read-only list on some held days | **MUST NOT change**: what opens today opens, as read-only cards with no buttons (reading R2) |
| Posted-out / not-yet-arrived day, a day now another squadron's, leave outside his time | their own routes in `Matrix.tsx` 3719–3740 | **MUST NOT change**, because D1722, D1541 and the multi-squadron fixes pin them and no drawing redraws them (R1) |
| A several-day entry (whole-leave window, "All n days" · the day tapped) | `BidPicker.tsx` 920–940 | HAS the chips; CHANGES: they stand on the card where "Pick a range" is drawn (D1565, R4) |
| Drag window (`SelectSheet`), picked-days sheet | Auto-approve, Approve · Refuse, Move, Delete over several days | **MUST NOT gain any power in this build**, because it was never drawn with one (D1625): what its Move and Delete take stays exactly what they take today — an admin: war-approved leave and bids; a member: his own pending bids. The new doors of steps 4–7 are asked **by the card and by the move mode a card's Move starts**, never by the drag window; a test per role pins it. CHANGES only the "Placed by" words |
| Mini pucks on a card (D2929) | none today | MISSING — `ui/NamePuck.tsx` reused |
| Manning line (`ui/DayLine.tsx`) | "is" on a held day, "turns" on an empty one | HAS the words; CHANGES place only. Fable's builder check: a pending bid lowers manning (rulings, Manning §: "a leave bid not refused"), so "is" on a pending card is right |

### 2b. The rules behind the cards

| Thing | Where decided today | Mark |
|---|---|---|
| Admin moves/deletes an Inputs-filed CSE, OD, OTH, Attach, leave from the war | nowhere — every door needs `lw` | MISSING (step 4) |
| Medical never moved/deleted on the war | `OFF_WAR`, every door | HAS — a test pins it stays so after step 4 |
| Admin un-approves / refuses leave filed on the Inputs page | `warEditable` needs `lw` | MISSING (step 5) |
| Admin swaps the kind / half of approved leave | no function | MISSING (step 6) |
| Member deletes / moves / changes his own approved leave | `canDecide` only | MISSING (step 7) |
| Member's command through the commit gate | `perms.ts` 3619–3640, `inputBreach` | CHANGES narrowly (step 7); every existing refusal stays |
| The permissions table (`docs/data-model.md` §11) and `leavewar/permsparity.test.ts` | bid rows | CHANGES: new rows for the member's own approved leave and the war's input doors |
| Auto-approve's memory | browser, per admin | HAS — per admin **per device**, on by default on a new device. Whether it is shown while it decides a swap is Q4 |
| Balances (App bal, Pending, War bal — D1472) | derived from approved Inputs and requests | HAS; tests added that approved → pending → approved leaves the figures right |
| OIL: an OIL-kind leave swapped to LL or back | `engine/charge.ts`, the OIL ledger | HAS; walked and tested (it spends banked OIL) |
| Published / locked weeks | `sync.ts inputProtected`, `ui/inputedit.tsx protectedInput` | HAS in each existing door; every new door must ask the same (steps 4–7) |
| Undo / Redo | one command a gesture | HAS; every new door is one `gesture()`; `docs/undo-contract.md` gains its lines |
| Change history lines | `leavewar/changelines-lw.test.ts` | CHANGES: lines for the new events |

### 2c. Other places that show the same entries

| Place | Mark |
|---|---|
| The grid's boxes (`ui/Matrix.tsx`, `MatrixRows.tsx`) | MUST NOT change look; they re-read by themselves. Folded question 3 (a group's box) is hit — see §8 |
| Approvals (`ui/ApprovalsPage.tsx`) | HAS: a leave sent back to pending appears there, **as New** (the member's re-bid is placed by him, now — step 7), and its count rises (D1152, D1208). Its "<time> · by Saber" column and "Already approved by Saber" already say "by" (`ApprovalsPage.tsx` 577) — HAS, pinned in step 1. MISSING: "Also since you last looked" (`sync.ts alsoSince`, which lists a member's withdrawn bids) says nothing of a member's **approved** leave he deleted — step 7 adds it, drawn first (step 9b) |
| The picked-days sheet, the person window's leave list (`ui/personleave.ts`), My leave | CHANGES: "Placed by" words (step 1); MUST NOT gain buttons |
| The day panel's Away lines | HAS — reads the same day view |
| The Inputs page (list, calendar, the input window) | MUST NOT change. It re-reads: a leave un-approved on the war leaves the Inputs page; a course moved on the war shows its new days. Walked |
| The schedule's Unavailable list (Edit Schedule, Board), crew counts, the SANS calendar's need | HAS — they read Inputs; walked after each new door, published days too |
| The published schedule (a change on a published day) | HAS — the Inputs door's own rule: it waits for the next amendment (D1724). Tested per door |
| Balances page, the person window's tiles | HAS — walked after approved → pending |

### 2d. Bell lines a change sends (`state/notices.ts`)

| Event | Today | Mark |
|---|---|---|
| Admin approves, refuses, puts back, moves, deletes a man's leave | lines 1116–1124 | HAS |
| Admin swaps the kind of a man's **approved** leave | none ("bid changed to" is for pending bids only, 1126) | MISSING — new words (step 8, §6) |
| Admin changes its half (Whole day → AM) | none | MISSING — new words |
| Admin moves or deletes a man's course / OD / Other / Attach from the war | the Inputs door's own line (`noticePass` 541) when written through the Inputs door | HAS if step 4 writes through that door — a test pins the man is told once, not twice |
| Member changes his own approved leave → pending | — | MUST NOT send any line: his own change tells nobody (3217) and admins are not told (D1208). The admin learns it on Approvals: the re-bid stands there as New, and a deleted approved leave under "Also since you last looked" (step 7) |
| Admin approves it again | "approved again" (1116) | HAS |
| Admin's Undo of any of these after the man read it | "taken back" (1134) | HAS — tested for the new events |
| The notifications register (`docs/notifications-register.md`) | | CHANGES: the new events listed (D1151) |

### 2e. The period list

| Place | Mark |
|---|---|
| `ui/Chrome.tsx` 216–230, desktop and phone (one native list) | CHANGES: "+ New period" first, a rule under it, then the periods (D2890) |
| A member's list | HAS — no "+ New period"; MUST NOT gain it (admin only) |
| The "New leave war" sheet it opens (`ui/WarSheet.tsx`) | MUST NOT change |
| Delete / archive a period (D2891) | MUST NOT be built here: its effects on bids, leave and OIL are drawn and put to him first |

### 2f. "To review" (the schedule)

| Place | Mark |
|---|---|
| Edit Schedule's section heading and fold (`html.ts` 2240–2251, 2315) | CHANGES: "To review"; holds only rejected / unplaced |
| The Board's panel (`board-html.ts` 827–850) | CHANGES: same; empty → the heading and "none" (t1) |
| Ground Programme row from an input — Board (`sbGrRowHTML` 594–623) | MISSING: REJECT before the remarks box (t2 / t1); ✕ left as built |
| Ground Programme row from an input — Edit Schedule (`grRowHTML` 2463) | MISSING: Reject on the puck line — **not drawn for the week** (Q6) |
| Common Programme row from an input (both pages) | MISSING: the same Reject (the drawing's rule "an input already placed carries its own Reject on its own row") |
| Unavailable rows | HAS Reject where one applies (an activity filed there, an OD); leave and medical MUST NOT gain one |
| The helper line on the Ground and Common Programme (4 places) | CHANGES: removed |
| Accepted inputs drawn faded in the section (`acc 'g'`) | CHANGES: they leave the section (they are placed) |
| "Reject · Tue" and "On <date>" lines (an input whose row is on another day or week; `accCtl` 2498, 2507) | CHANGES: not listed here any more — placed elsewhere (reading R12) |
| Jumps that land on a Personal Inputs line (`ui/pendlist.ts` 209–226, `ui/interactions.ts` 175–185, `ui/boardland.ts` 283–296) | CHANGES: a placed input's jump lands on its own row; a rejected one's on "To review" |
| The LATE mark and the late-input chip on Personal Inputs rows (`docs/ui-contracts.md` 2412–2475, 6004) | CHANGES: ride the placed row; MISSING today on Ground rows (step T2) |
| The waiting mark (D1784) | HAS on Ground Programme rows (D45, D93 — `alAttr`) and on Unavailable rows (D1784). MUST NOT change: a placed input waiting since publish keeps its mark on its own row; T1 / T2 pin it on the Board and the week |
| Toasts and titles saying "Personal Inputs" (`board.ts` 1253; `html.ts` 2501–2502; `inputedit.tsx` 1288; `board-html.ts` 142, 839) | CHANGES (§6) |
| Admin → section order labels (`ui/AdminPage.tsx` 158, 185) | CHANGES (§6) |
| Undo's "a personal input" (`undo/describe.ts` 67, 502) | MUST NOT change: it names the kind of thing, not the section |
| A drop on a "To review" line (D2773) | MUST NOT be built here — it is [COMBINED-INPUT-ROWS]'s drop work; today a drop there does nothing |
| The 1536-wide overflow of "→ Ground" "→ Unavail" (`13-board-rows-responsive.css` 198, the fixed 92px column) | CHANGES: the two buttons stack, as t2 draws them |
| Issued (read-only) face of the Board (`board-html.ts` 142 "No personal inputs submitted for this day.") | CHANGES words only |

---

## 3. The rulings that apply

One line each. Full rows opened: D2880–D2892, D2896–D2898, D2929 (the mini pucks, numbered D2895 until the notes branch took `main` in), D2921–D2927, D1552, D1187, D947, D1467, D1724, D1354, D2778, D2783.

**The window**
- D2926 — the build sheet's drawings are the drawings of record; built to them and checked beside them; folded questions asked as the build reaches each.
- D2887 — A2: manning line under the title; each entry a card with its buttons and its Remarks · till · Document; a leave's card its Duration and 8 leave buttons, its kind lit; no leave buttons on other entries; last row every day; Auto-approve only while leave can be placed.
- D2884 — changing a leave's kind is never only a tap on the leave itself; a control that can be seen stands with it.
- D2892 — the one pencil on a card only where the card cannot change everything: CSE, OD, OTH, Attach, a medical, any group entry, leave with custom hours — by kind, never by page; plain leave and bids none. Reading in the row: a member sees it only on entries he may change.
- D2889 — the entry's own input window opens over the war and closes back; no trip to the Inputs page.
- D2885 — ⋯ keeps Attach, Other, Post out, Post in; no other type added; a tap opens the war's window first.
- D2886 — an Inputs-filed entry keeps Move and Delete on the war. D2888 — not a medical.
- D1724 — every entry moved, deleted, its days and remarks changed on the war; the Inputs page's own rules hold (own entries only for a member; a published day waits for the next amendment; a clash refused with its reason).
- D2929 — every card shows its people as mini pucks, one man too. D2896 — on a group card pressing the man's name shows only his puck; "3 pax" all again.
- D2897, D2923 — a day holding leave never takes a second kind on top: the first tap shows the line, the second replaces, remarks and Document kept.
- D2925 — the swapped leave: its member's swap → pending; an admin's follows his Auto-approve switch.
- D2898 — a member's own approved leave keeps Move, Delete, Duration and the leave buttons, no Approve or Refuse. D2922 — his move or change sends it back to pending; delete removes it; remarks or Document alone leave it approved (reading in the row).
- D2924 — over an Attach the leave buttons stay. D1552 — not over leave or a medical; over OD, a course, an Other they stay. D1565 — a several-day entry shows "All n days" and the day tapped in place of Pick a range.
- D1187 / D1302 / D2887 — Auto-approve is a small switch in the title bar before ✕, admin only, remembered; shown only while leave can be placed.
- D2881, D2921 — the decided look (solid, cyan ring, the other grey, tick and cross) — already live; kept.
- D2927 — "Placed by Saber · Fri 27 Nov, 12:46 · Approved by Hex · …" / "Refused by Hex", the name bold, wherever the war says it.
- D1725 — every build and walk covers every combination of entries on a day, pictured at both sizes.
- Standing look rules that bind the cards: D1327/D1328 (the coloured box leads; beside it only what the box does not say), D1525 (AM / PM in words), D1246 (.5), D1387/D1395 ("Delete — sure?" inside the button), D1188 (a button in the same place on both sizes), D2031 (the warning line just above the leave buttons), D1150/D1159 (the one Document button), D1339–D1362 (one remark for a several-day leave), D1346 (entries never join by themselves), D1158 (no Ack), D1211 (a member never bids before today), D1177/D1225 (closed dates: only his pending bid's Delete), D1166 (leave on the Inputs page is never stopped by closed dates), D1541/D1555 (posting-out days).
- Bell: D1142…D2437 (a member is told of decisions on his leave, one line, naming who); D1208/D1219 (admins are not told of requests); D1151 (the notifications register).
- D2778, D2770 — a group leave changes as one; one man changed alone is taken off and given his own leave. D2783, D2784 — "Change for Cutter only" (see the clash below).

**The period list** — D2890 ("+ New period" first, both sizes, admin only). D2891 (delete / archive: drawn and put to him first — not this build). D1244 narrowed by D2890.

**"To review"** — D2883 (the section holds only what is not placed; a placed input carries its own Reject on its row; Edit Schedule and the Board alike; an empty section folds to its heading). D947, D957 (their line's words go with this build). D2773 (a drop on the section's line is refused — its words change **when that refusal is built**, not here). D1784 (the waiting mark). D945 (the button is "Reject"). D1388/D1356 (a scheduler's Reject / → Ground / → Unavail are his move). D1399, D1401.

**How we work** — D1625 (anything new he will see is drawn first), D1424/D1494/D1495 (the drawing check, 2px), D2441 (words: Opus drafts, a fresh Fable adjusts), D490/D1087 (branches), D2255/D2440 (high risk: Fable with readers), D1411 (a security read on any change to permissions), D56 (stored demo data is not a finding), D785 (a scheduler is always an admin).

### Rulings that clash with or narrow another

| Newer | Older | What wins |
|---|---|---|
| D2897 (28 Nov) | D1467 (28 Oct), D2887's "one tap re-typing it" (28 Nov, earlier) | A leave is not re-typed by one tap in the day window. The build sheet's caption under b2 still says "in one tap" — a leftover (Q3) |
| D2887 (28 Nov) | D1187 (21 Oct) | Auto-approve is absent while no leave can be placed |
| D2889 (28 Nov) | D2885 (28 Nov, earlier) | No button to the Inputs page, no way-back bar: the window opens over the war |
| D2888 (28 Nov) | D1724 (6 Nov), D2886 | A medical has no Move or Delete |
| D2892 (28 Nov) | A2's › (D2887) | The pencil replaces › |
| D2898 → D2922 (28 Nov) | D1354 (25 Oct), the page's reading of D1177 | His approved leave is editable on the war; a change → pending |
| D2922 (28 Nov) | D1166 (the same change on the Inputs page stays approved) | Both stand; he chose the two pages to differ. **The build must not "fix" the Inputs page** |
| D2924 (28 Nov) | D1552 (1 Nov) | Attach joins the list the leave buttons stay over |
| D2927 (28 Nov) | the overhaul spec's reading r7-13 ("Placed Ranger") | "Placed by" |
| D2890 (28 Nov) | D1244 | "+ New period" first, not last |
| D2883 (28 Nov) | D947, D957 (the line's words), D2773 (its section's name) | "To review" |
| **D2896 (28 Nov)** | **D2783 (27 Nov)** | **Not clear — goes to him (D90).** D2783: pressing "Cutter" takes him out of the group at once. D2896: pressing "Cutter" shows only his puck, and "3 pax" shows all three again — a switch back that a split-at-the-press would make untrue. See Q1 |
| D2778 ("no 'his only' choice") | — set aside on the war by the drawn group card (b7, approved by D2926) | The card's "Change · 3 pax · Cutter" stands; D2783's row itself says whether and where it is built was not answered — the build sheet says "built into the group card as you drew it". Named in Q1 so he confirms once |
| D2926's drawing b3 (Approved · Refuse on leave filed on the Inputs page) | D1166's spirit (leave filed there "stands at once") | The drawing wins: an admin may refuse or send back such a leave from the war. Named so the readers see it is deliberate |

---

## 4. Branches — recommendation

**Three branches** (round 1: Opus L2 taken in part).

- **Branch P — a new small `claude/lw-new-period-first-<n>`** from `main`: step 2 only ("+ New period" first). One
  small change with its own backlog item ([LW-PERIODS-MANAGE]); a **LOOK** check; it need not wait behind the riskiest
  permission change in the app.
- **Branch A — `claude/lw-day-window-198`** (this one): the day window and the "Placed by" line (D2927's own row says
  it is "built with the day window", so step 1 stays here). One area (the Leave War), one bug check sized by its
  riskiest change (who may change approved leave and saved Inputs): a **FULL** check — the walk at 402 and 1536 (plus
  390 and 360 for fit), Astra, a fresh Opus, a fresh Fable beside them (high risk, D2255), and the security read (D1411).
- **Branch B — a new `claude/to-review-<n>`** cut from `main`: the schedule's "To review". A different area (the
  schedule), different source files entirely (`src/ui/html.ts`, `board-html.ts`, `board.ts`, `interactions.ts`,
  `engine/inputs.ts`, the scheduler CSS) and about ninety test files that mention the section. Medium risk (it changes
  no permission and no saved shape, only what is listed where and where Reject stands): a **WALK** check with Astra and
  a fresh Opus read. **It does not start its switch of Edit Schedule's week until Q6's drawing is answered** (step T0).

Why not one branch (D490 says related features share one): D490 groups **by area**, and D1087 says two to four related
jobs **of one area** share a branch. Put together, every fix to the war's permission work would re-walk the schedule,
and a fault in "To review" would hold back the day window. Apart, A and B can be built by two chats at once — they
share no **source** file. They do share three reference documents (`docs/ui-contracts.md`, `docs/feature-impact.md`,
`docs/file-map.md` — A's step 17, B's T5) and the record files: each touches its own sections, and the later merge
brings `main` in first (`shipping.md`).

**Inside Branch A, one piece may fall out:** the group card (step 16). If Q1 and Q2 are not answered when the rest is
walked and read, the branch ships without it — a group entry then opens what it opens today — and the group card
follows on its own small branch. Say so to him if it happens.

**Before building:** the notes branch (`claude/leave-points-notifications-7a2f04`) must be merged or brought in, so
the rulings, the backlog items and the drawings folder (`docs/mock/2026-11-28-what-we-build/`) are on the build branch.
A lean working copy fetches that folder's pictures with `node scripts/lean-copy.mjs get`.

---

## 5. The build, in ordered steps

Every step: the tests are written first and seen to fail; then the change; then the step's own tests green
(`npx vitest run <paths>` — the Leave War is its own vitest project); type-check by `npm run build`, never
`tsc --noEmit`. No step takes the checks lock except where it runs a browser test (wait for the lock).
"Gate" below means the commit gate in `src/state/perms.ts`.

### Branch A — the Leave War

#### Step 1 — "Placed by" (D2927) · low risk · can run in parallel with 2 and 3
- **Files:** `src/leavewar/ui/PlacedLine.tsx` (`PlacedOne`); the comment at its head; `src/leavewar/m4page.test.tsx`
  and any test reading "Placed " or "Approved Saber" under `src/leavewar/` (grep first); `scripts/handpass/breaks/lw-m4.json`
  if it holds the words; `docs/ui-contracts.md` §"The Leave War's Approvals… (M4)" — the "Placed · Decided" line.
- **Change:** "Placed by **Saber** · …"; decided: "· Approved by **Hex** · …" / "· Refused by **Hex** · …". The
  coloured word stays "Approved" / "Refused" (`bp-ok` / `bp-no`), "by" in the grey. No change to `placedfacts.ts`.
- **Tests first:** one unit test of `PlacedOne` for a placed-only, an approved and a refused fact (fails on "Placed by").
- **Roll-call inside the step:** every caller — `DayList.tsx`, `BidPicker.tsx`, `ui/personleave.ts` — looked at on
  screen at both sizes; at 360 wide the longer line wraps inside its card, never cut. **Approvals is in scope and
  already right** (round 1, L4): its column reads "<time> · by Saber" and its decided line "Already approved by Saber"
  (`ui/ApprovalsPage.tsx` 577, 635) — both already say "by"; no word changes, one test pins both so they cannot
  drift from the card's line.
- **Permission / saved data:** none.

#### Step 2 — "+ New period" first (D2890) · low risk · **its own small branch (Branch P)** · parallel
- **Files:** `src/leavewar/ui/Chrome.tsx` 216–230; `src/leavewar/ui/chrome.test.tsx`, `wars.test.tsx`;
  `e2e/leavewar.spec.ts` where it picks `war-new`; `docs/ui-contracts.md` (the top rows, M2 section).
- **Change:** the admin's `<option value={NEW_PERIOD}>` moves above the periods, with a separator (`<hr>` inside the
  `<select>`; where a browser ignores it the order still holds). The list stays the browser's own choice list (reading R10).
  The select's shown value is still the period in view; picking "+ New period" opens the same sheet and the picker
  snaps back, as today.
- **Tests first:** the option order for an admin (first), absent for a member; picking it still opens the sheet once.
- **Permission:** a member's list has no such line — pinned. No saved data.

#### Step 3 — the card model: one pure function that says what each card may show · parallel with 1, 2
The window must never work out rights by itself (D2892's "by kind, never by page"; the guide's rule that `perms.ts` is
the one place that answers "may this person do this?").
- **Files (new):** `src/leavewar/ui/daycards.ts` + `daycards.test.ts`. Reads: the day view (`engine/dayview.ts`), the
  store's existing questions (`movableRecords`, `recordTakeable`, `canBidOn`, `ownPendingOnClosedDay`, `bidHeldWhy`,
  `awardsOnDay`, `oilOnDay`), `ui/matrixrowparts.ts inputsFilledDay` / `freeHalfBeside`, and from `state/perms.ts`
  `mayEditInput`, `mayDeleteInput`.
- **What it returns** for (person, date, role, viewer): the ordered cards (the day's own order — morning before
  afternoon, as `DayList.tsx` 187 keeps it, so an action never moves a card under a second tap), and for each: its box,
  its heading words, its people, and booleans — `approve`, `refuse`, `move`, `del`, `remarks` ('edit' | 'read' | none),
  `document`, `duration`, `leaveButtons`, `pencil`, `awardEdit`, `changeLine`; and for the window: `add` (none | whole |
  am | pm), `autoApprove` (admin **and** `add` has leave buttons), `grantOil` (admin), the last row.
- **In this step it only mirrors today's rights** (nothing new allowed): the table of tests is the roll-call of §2a as
  code — one row per state the 27 Nov roll-call found (25 states) and D1725's combinations (whole day, halves, two or
  more, each kind), for an admin, the member himself, and a member on another's row. Steps 4–7 then flip single cells
  of that table, each with its own failing test.
- **Pencil rule (D2892), fixed here:** CSE, OD, OTH, Attach, a medical, any entry with more than one person, leave whose
  Input has custom hours (not all day, not exactly a morning or an afternoon) → pencil, **only if** `mayEditInput(row)`;
  plain leave and bids none.
- **Permission / saved data:** reads only.

#### Step 4 — the war moves and deletes an entry filed on the Inputs page (D1724, D2886, D2888) · HIGH · after 3
- **Files:** `src/leavewar/engine/dayview.ts` (`OFF_WAR` 99, `offWar` 105, `lockedOnWar` 114 — read, see below),
  `src/leavewar/state/merge.ts` (`projRecord`), `src/leavewar/ui/matrixrowparts.ts` (`cellOpenable`);
  `src/leavewar/state/store.ts` (`movableRecords` 6239, `moveRecordsProblem` 6303, `moveRecords` 6362,
  `recordTakeable` 4340, `changeAbsenceById` 4505 'removed', the `AbsenceDoor` interface 3015);
  `src/leavewar/sync.ts` (two **new** door functions, installed in `installAbsenceDoor` 332; `oilAskPlan` 1385);
  `src/ui/inputedit.tsx oilGate` (932 — called, not changed); `src/state/perms.ts` (`COMMAND_OPS`: two new command
  types, `lw.inputMove` and `lw.inputRemove`, each `op(T.input, 'U' | 'D', 'optional')` **with no extra-tables list**
  (round 2, both readers: `cmdAuthorize`, 722–733, asks every extra table with the own-row rule 'never', so a list
  there would refuse every member's own call — and no command a member runs has one today). That the door may also
  replace a clashing pending bid and tell its man is written in a comment above the two types and in the new row of
  `docs/data-model.md` §11; what keeps a member to his own records is the gate's check of the real changes
  (`inputBreach`, the `lw.cell` case), as for `lw.edit` and `inputs.write`);
  `src/ui/inputedit.tsx oilFirst` (1798) and `src/ui/caldrag.ts commitChipMove` (160–185) — called and copied from,
  not changed;
  `docs/data-model.md` §11; `src/leavewar/permsparity.test.ts`; `daycards.ts` (flip `move` / `del`).
- **One question, one door (round 1, M4).**
  - The blue "filed on the Inputs page" edge (`offWar`) and the day lock (`lockedOnWar`) are **not changed for any
    kind**: nothing leaves `OFF_WAR`. What the war may now move or delete is a **new** question beside them, e.g.
    `warMayChange(contrib, row, role, viewer)` in `engine/dayview.ts`: a one-person Input that is CSE, OD, OTH, Attach, a
    commitment under Unavailable, or leave without `lw`; **a medical, an upchit and SANS availability always false**.
    A test per kind pins that its box keeps the blue edge.
  - These entries go through step 4's **own** two doors. `absenceMovable` (6230), `warLeaveRow` (514),
    `doorMoveApproved` (1040) and `doorRemoveApproved` (1010) are **not widened**: called on an Inputs-filed entry
    they refuse as today (a test). So leave without `lw` moved by an admin stays approved, stays without `lw`, and
    gets **no** `lwMoved` trail and no dotted "moved" mark — it was never the war's.
  - **A card's Move does not go through `moveRecords` (round 2, Opus M-1).** `moveRecords`, `moveRecordsProblem`,
    `absenceMovable` and `movableRecords` stay exactly as today: they refuse these records ('raptor'), which is what
    keeps the drag window out. The move mode remembers what started it: when the record came from a **card's** Move
    and is an entry step 4 owns, the landing preview asks step 4's own problem function and the drop calls step 4's
    door as a **top-level** gesture of type `lw.inputMove` — never nested inside `lw.move` (a nested gesture commits
    under the outer type, `store.ts` 3339, so the gate, the bell and Undo's name would all read `lw.move`).
    The drag window never offers it (§2a).
- **Change:**
  - *Delete* cuts the tapped day (or all its days, by the card's chips — R4) out of the Input, by the same
    `cutDates` / `sliceInput` the door already uses.
  - *Move* cuts and re-files the shifted piece.
  - Both run the **Inputs page's own checks**, called, not copied: `mayEditInput` / `mayDeleteInput`; where it stands
    is untouched (a scheduler-moved input keeps `schedPlaced` and its place); `inputProtected` (a locked / published
    week: the Inputs door's rule — the change waits as a pending amendment, or is refused with the locked-week note,
    exactly as the Inputs page does for the same edit); the input gate's `vet` (leave over leave, leave over a medical
    → refused with its reason) and its bid replacement (a moved leave or course landing on a pending bid's time — the
    same as filing it there on the Inputs page); another squadron's day; a posting with the Delete outcome.
  - **The OIL question comes first — through the door the app already has (round 1, Astra 3; round 2, Opus M-3 —
    D783, D804, D831).** Not `setOilAsk` the way `sync.ts askFiledOil` uses it: that one asks **after** the filing
    is saved. The app's one "question before a change" is `ui/inputedit.tsx oilFirst({ kind: 'move', lead, iid, same,
    gate, make, places, again })`, which the Inputs calendar's chip drag uses for this very case (`ui/caldrag.ts
    commitChipMove`). Step 4's door is wrapped in it: `gate` is `oilGate(<the entry as it would stand after the
    move — for a moved part of a longer entry, that part>, <as it stands>)`; `make(r, oil)` calls the war door with
    the answer, so the answer and the move are one command and one Undo; `same` is the re-check of the entry, the
    permission, the destination and the lock after the answer. Nothing is cut before the answer; closed unanswered,
    both days are as they were, no bell line, no Undo step, and the existing bar stands — "Not moved — OIL not
    answered · Answer OIL · OK" (`WAIT_WORDS.move`, already built and pinned; no new words).
  - A move is all or nothing: any refusal at commit **throws** and rolls the whole command back
    (`MoveRefusedAtCommit`'s way — a returned `false` does not undo what an earlier stage wrote).
- **Tests first** (new `src/leavewar/inputdoor-move.test.ts`, `inputdoor-remove.test.ts`, `inputdoor-oil.test.ts`,
  each case failing today): admin moves a one-day course; a middle day of a five-day course (it splits in three,
  remarks and documents on each piece); all five days; an OD onto a day holding leave (allowed — D1552) and
  leave-without-`lw` onto a day holding leave (refused, reason shown, nothing changed); an Attach; an Other under
  Unavailable; a scheduler-moved Meeting under Unavailable (moves, stays under Unavailable, `schedPlaced` kept); a
  rejected course (R8); onto a locked week; onto a published day (pending amendment, the issued face unchanged); onto
  another squadron's day; onto a posted-out day.
  **Onto a day holding the man's pending bid:** admin moves Cutter's course there → as the Inputs page does it (a course
  leaves a bid alone; a leave replaces the clashing half), Cutter told once; a member's own **approved leave** is never moved by this door (round 2, Astra 4): pressed onto a closed day
  holding his pending bid, the war refuses and neither the leave nor the bid changes (step 7, rule 4); the same move
  made **on the Inputs page** is allowed and stays approved (D1166) — a positive test there, so the difference is
  pinned on both sides. **The type:** the committed envelope of a card-started move is `lw.inputMove`; a member's own
  call of each new type passes `cmdAuthorize` (the test that would have caught round 2's top finding), and another
  man's is refused; `moveRecords` called directly with a course's record still returns its refusal and changes nothing.
  **OIL** (the pattern: `ui/caldrag.test.tsx`'s ON9 case, run through the war's door)**:** a weekday course moved to Saturday → the question first, nothing cut; answered Yes · FO → moved and
  credited, one Undo takes both back; closed unanswered → nothing changed, no Undo step, the bar; already answered
  for that day → no question; a weekday → holiday move the same; the entry changed by someone else while the question
  is open → the re-check refuses, nothing half done.
  **A medical: `move` and `del` false in the card model, and both new doors refuse it when called directly** (ATT C,
  ATT B, HL, OML; `review-fixes.test.ts` 229's case too). **The old doors:** `doorMoveApproved` /
  `doorRemoveApproved` called on an Inputs-filed leave or a course refuse as today. **The drag window:** an admin's
  drag selection over a course offers no Move or Delete of the course and still moves a bid beside it. Undo and Redo
  of each restore the Input byte for byte (iid, `by`, `at`, `acc`, `schedPlaced`, documents). The man is told once on
  his bell (the Inputs door's line), the actor never.
- **Permission checks:** a member on **his own** one-person course / OD / Attach / his own Other: allowed exactly where
  `mayEditInput` / `mayDeleteInput` say so (D1724: "a member changes only his own entries"); on another's row: refused
  in the card model, in the store, and at the gate (`inputBreach` — "another person's input"). A hand-made command of
  the new types from a member against another's Input is refused at the gate (written as a test, as
  `onerecord-perms.test.ts` does). A member's **own approved leave** is never moved by this door — that is step 7's.
  An entry with **more than one person** is not movable or deletable here at all (step 16, Q2).
- **Saved data:** only Inputs (and, where a bid is replaced, the war's own records, as the Inputs door does today);
  no new field. `docs/data-schema.md` needs no change; say so in the step's commit.

#### Step 5 — an admin decides leave that was filed on the Inputs page (drawing b3) · HIGH · after 4
- **Files:** `store.ts` (one **new** door for the card, `decideApprovedById(personId, date, iid, to)`);
  `sync.ts` (`decideApprovedWhy` 662, `doorDecideApproved` 968 — **its own entry test only**; the shared
  `warLeaveRow` 514 is left as it is); `daycards.ts`.
- **The shared doors are not widened (round 2, Opus H-2).** `warEditable` (3978) is asked by `setBidStates` (4116 —
  what the drag window's and the one-day window's range Decide call, `SelectSheet.tsx` 396), by `decidableIn` (6477),
  `deletableIn` (6494), `recordTakeable` and `clearCells`. Widening it would hand the drag window a power to refuse
  Inputs-filed leave that was never drawn there (§2a, D1625). So `warEditable`, `setBidStates`, `decideRequests`,
  `decidableIn` and `deletableIn` stay exactly as they are. (`decideRequests` is Approvals' door, and leave filed on
  the Inputs page never stands on Approvals.)
- **Change:** `decideApprovedById` asks `canDecide`, step 4's `warMayChange`, and that the Input is a one-person
  leave on a whole day, a morning or an afternoon (a bid cannot hold set hours — such a leave keeps its pencil and
  has no Approved / Refuse, R5); then, as its own top-level gesture (`lw.decideApproved`, already in the command
  list, an admin's), calls `doorDecideApproved`, whose entry takes a leave with or without `lw`. **Only the card's
  lit Approved and Refuse call it.** The lit "Approved" tapped again sends it back to pending; Refuse refuses it. The
  minted request's "placed by" is the Input's `lwBy`/`lwAt` where it has them, else its `by`/`at` (who filed it on
  the Inputs page) — written by an admin, whom the stamp check does not bind. The period is the one holding the day;
  a day in no period is not on the grid, so cannot be reached.
- **Tests first:** admin sends back an Inputs-filed LL (whole, AM, PM, a middle day of a several-day leave → it splits,
  the other days stay approved); refuses one; approves it again → it comes back as war-approved (`lw` set — the war
  approved it now), remarks, till and documents intact; balances (Official bal, Pending, War bal) right at each stage;
  the man's bell: "put back to a bid", "refused", "approved again"; Undo of each; a locked week refuses with the
  door's words; a set-hours leave offers neither button and the door refuses it called directly.
  **The drag window and the range Decide gain nothing:** an admin's drag selection over a day of Inputs-filed LL —
  `decidableIn` counts it 0, and Approve / Refuse there leave it approved and unchanged; the one-day window's range
  Decide the same.
- **Permission:** admin only (`canDecide`) — a member's call refused in store and gate (`lw.decideApproved` is the
  admin's already; pinned).

#### Step 6 — an admin swaps the kind, or changes the half, of approved leave (D2897, D2923, D2925) · HIGH · after 5
- **Files:** `store.ts` (new `replaceEntry(personId, date, entryId, newCode, approveAfter)` — one function for a
  pending bid and for approved leave; `decisionTells` 3201 — two new events); `sync.ts` (`doorDecideApproved` then
  `doorApprove`, inside the one `gesture`); `state/notices.ts` (two new line templates, §6); `daycards.ts`.
- **It replaces the entry it was asked about — by its id, never by overlap (round 1, Astra 2).** `setCell`'s replace
  (3628–3649) takes away the live bids that overlap the **new** half: a morning leave changed to the afternoon does not
  overlap itself, so the morning would stay and an afternoon be added. So:
  1. Work out the **final state first** — the day as it would stand with the chosen entry gone and the new kind / half
     in its place — and check it with the store's own rules (`occupiedFor`, `barsWrite`), **leaving only the chosen
     entry out of the clash check**. A separate entry on the other half is kept; a change that would land on it is
     refused with its reason and nothing changes.
  2. Only then write, in one command: for approved leave, the chosen days go back to a request carrying remarks, till,
     documents and the placed stamp (`doorDecideApproved`); that request — found by its id — is rewritten to the new
     code; then, **if `approveAfter`**, approved again (`doorApprove`). For a pending bid, step 2's middle part alone.
  3. **Any stage that fails throws** (the `MoveRefusedAtCommit` way), so the whole command rolls back — a `false`
     returned after the first stage would leave the leave un-approved and not re-typed.
- **`approveAfter`** is the window's to pass, as a placement's is today: for an admin, his Auto-approve memory (D2925);
  whether the switch is **shown** while it decides this is Q4, and step 6's card is not built until Q4 is answered.
  A change of half is the same path (reading R6). A balance below zero asks its own second tap as a placement does
  (`ui/belowzero.ts`).
- **Tests first** (`src/leavewar/replace-entry.test.ts`), each for a pending bid **and** for approved leave:
  AM → PM, PM → AM, AM → Whole day, PM → Whole day, Whole day → AM — exactly one entry afterwards, on the new half;
  AM → PM where the afternoon holds another leave → refused, both untouched; AM → Whole day where the afternoon holds
  a bid → refused, both untouched (never silently eaten); LL → OL whole day, switch on: one Input, kind OL, the same
  remarks and documents, a new approver stamp, the placer kept; switch off: a pending OL bid, the Input gone; LL → OIL
  and OIL → LL (the OIL ledger and War bal right, nothing of OIL lost — D25); one day of a five-day leave swapped
  (splits; D1346: nothing joins by itself); balances after each; **a failure forced at the last stage (re-approval
  refused by a locked week) leaves the original leave exactly as it was**; a reload shows the same; one Undo puts back
  the exact Input; the bell line once, naming the admin; the swap of a leave filed on the Inputs page (step 5) the same.
- **Permission:** `canDecide`. The command type stays `lw.decide` (admin's) — no new gate path.

#### Step 7 — a member changes his own approved leave (D2898, D2922, D2925) · HIGHEST · after 6
The one step that widens what a member may do. Keep it the narrowest possible.

**Where the rule lives (round 1 — Astra 1 and Opus H3, which pull opposite ways; both are right in part).**
D2922's "back to pending" is a rule of **the Leave War's day window**. The commit gate cannot be its guard: the gate
sees a command's changes, not the page that sent them, and "re-date my own approved leave and keep it approved" is,
change for change, what the Inputs page lets a member do today and must keep doing (D1166; he chose the two pages to
differ). So:
- the rule is **held by the war's own door** — one store function that can only produce "the chosen approved part
  gone, the rest of the leave untouched, a pending bid of his in its place";
- **nothing in the gate is loosened or tightened for the Inputs page**;
- and, as a backstop against a fault in the war's own door (not a security wall — a member can always reach the
  Inputs-page result on purpose), the door's commands carry **their own types**, and for those types only the gate
  checks the shape — judged by what his approved leave **covers**, not by whether a record is new (round 2, Astra 3
  and Opus M-2: cutting a middle day leaves a second piece with a fresh id, `sync.ts` 940–945, which must pass): no
  leave Input of his ends the command covering a day or a half it did not cover before, and his approved leave days
  do not rise; a new leave record is allowed only as a piece of one this command shortened — the same man, kind and
  hours, its days among that record's days before; every request the command writes is his, pending, on a day open
  for him. A war-door bug that left the changed or the landing part approved is then refused, not saved.

- **Files:** `src/leavewar/engine/access.ts` (one new exported question, `canChangeOwnApproved(role, viewer, personId)`
  — a member on his own row; `canDecide` untouched); `store.ts` (new `ownApprovedProblem(personId, date, iid, what, to?)`
  and one door, `changeOwnApproved(...)`, with three uses — delete, move, change of kind or half; `moveRecords` 6362 and `moveRecordsProblem` 6303 are **not changed** — see rule 8; `clearCells` 3808 and
  `changeAbsenceById` 'removed' are **not** opened to a member); `ui/Matrix.tsx` (the move mode's drop); `sync.ts`
  (the door's cut and mint; `alsoSince`); `src/state/perms.ts` — `COMMAND_OPS`: two new types,
  `lw.ownApprovedChange` and `lw.ownApprovedRemove`, each `op(T.bid, 'U', 'optional')` **with no extra-tables list** — the shape a member's command has today
  (`lw.edit`, `lw.move`); an extra-tables list is asked with the own-row rule 'never' (`cmdAuthorize` 722–733) and
  would refuse every member, the very calls this step exists for (round 2, both readers). That the two types also
  write the Input table is said in a comment above them and in the new §11 row; the shape check above for those two
  types; **`stampForged` is not touched**; `docs/data-model.md` §11 (a new
  row: "a member — his own approved leave on the Leave War: delete; move / change → pending"); `permsparity.test.ts`;
  `daycards.ts`.
- **Rules (each a test):**
  1. His own row only; the leave is a one-person leave Input of his (with `lw` or filed on the Inputs page).
  2. **Delete** cuts the day(s); nothing is minted. Offered on a day he may bid on. On a day closed for bidding or
     already past it is **my reading** that it is still offered (R3) — he can delete the same leave on the Inputs page
     today, and D2922 says "deleting it simply removes it" — and it is part of Q5. On a published past day the delete
     waits for the next amendment, the issued face unchanged (the Inputs door's own rule; D1211).
  3. **Move, half, kind**: the chosen part of the leave is cut and a **pending bid of his** stands on the new day /
     half / kind, in one command; never approved, whatever any switch says (a member has none). It carries the leave's
     remarks, till and documents. **It is placed by him, now** (round 1, H4 — the plan's own fallback, taken): its card
     reads "Placed by Ranger · <now>", which is true; every admin sees it as New on Approvals, in time order.
  4. A move or change is allowed **only where he may bid today**: the day it lands on (and, for a half or kind change,
     the day it stands on) is open for bidding and not before today (`canBidOn`) — reading R3, Q5. Elsewhere the
     buttons are not offered (the state is drawn first, step 9b); the store refuses, and the gate's existing "a war
     day not open for bidding" refuses a hand-made one. A several-day move is all or nothing: one closed landing day
     refuses the whole move.
  5. Remarks and Document alone never un-approve (as today — `LeaveWords`).
  6. Kind and half go through step 6's `replaceEntry` logic — by the entry's id, the final state checked first, any
     failure throwing — with "never approved" in place of `approveAfter`. Kind: the second-tap line first (D2923).
  7. No bell line to anyone (his own change; D1208). The admin sees the re-bid as New on Approvals; a **deleted**
     approved leave is listed under Approvals' "Also since you last looked", as a withdrawn bid is (`alsoSince`) —
     its words §6 w26, drawn first (step 9b).
  8. **A member's Move goes to the war door itself, never through the shared move commit (round 1, H1; round 2, Opus
     M-1).** `moveRecords`, `moveRecordsProblem`, `absenceMovable` and `movableRecords` stay exactly as today — they
     refuse a member's approved leave ('raptor') before anything else, which is the safety H1 asked for and why the
     **drag window gains nothing**. The move mode remembers what started it: when the record came from a **card's**
     Move and is the member's own approved leave, the landing preview asks `ownApprovedProblem` and the drop calls
     `changeOwnApproved` as a **top-level** gesture of type `lw.ownApprovedChange` — never nested in `lw.move`, or
     the command would reach the gate as `lw.move` and the backstop, the bell and Undo's name would read the wrong
     type (`store.ts` 3339).
  9. Days from a posting with the Delete outcome (D1541, D1555): the war refuses approving leave there, so a re-bid
     landing there could never be approved — the move is refused with that reason.
  10. **A leave with set hours (10:00–15:00) is not moved or changed by its member on the war (round 2, Astra 2).**
     A bid holds only a kind and whole day / AM / PM (`engine/warrecs.ts RequestRec`), so sending such a leave back
     to pending would silently make it a whole day — D2922 asks for pending, not for its hours to change. Adding
     hours to a bid is a change to what the app saves that nobody has ruled, so this plan does not make it. His card
     for such a leave has Delete, its remarks and Document, and the pencil — whose window is the Inputs page's own,
     where his change of hours or date is saved as that page saves it (D1166). `ownApprovedProblem` refuses a move
     or change of it; the state is drawn first (step 9b, item 2). An admin's Move of it keeps its hours (step 4's
     door re-files the Input itself).
- **Tests first** — `src/leavewar/own-approved.test.ts` (store) and `own-approved-sec.test.ts` (hand-made commands,
  the way `m4sec.test.ts` and `sec147-read.test.ts` do):
  - *Store.* The worked case of D2922: Ranger's approved LL on Thu 3 Dec; **by the card's Move and a drop in the
    grid's move mode** he moves it to Fri 4 Dec → no Input on the 3rd or 4th, a pending LL bid on the 4th **placed by
    Ranger, now**; Official bal up by 1, Pending up by 1, War bal unchanged; Approvals lists it as New for Hex.
    Whole day → AM, AM → PM, LL → OL (second tap), OIL-kind → LL and back (the OIL ledger and War bal; D25 — nothing
    of OIL lost), delete; each on war-approved leave and on leave he filed on the Inputs page. One day of a five-day
    leave moved (the rest stays approved, untouched: iid, remarks, documents). A five-day leave moved with "All 5
    days" where one landing day is closed → refused whole. Onto days of a Delete-outcome posting → refused. The
    war's door can never leave it approved or mint approved leave (called with every argument, asserted on the result).
    **The drag window:** Ranger's drag selection over his approved LL offers no Move or Delete of it.
  - *Undo (round 1, H2 — D148).* (a) Ranger moves; before anyone decides, his Undo puts the approved LL back on Thu 3
    and the bid goes. (b) Ranger moves; Hex approves the Fri 4 bid; Ranger's Undo is **refused, naming Hex**; nothing
    changes — never two approved days from one. (c) Ranger moves; Hex refuses the bid; Ranger's Undo is **refused,
    naming Hex**; Thu 3 stays empty, Fri 4 stays refused. The same three for a kind swap and for a half change. Redo
    by him in case (a). An admin's Undo button never reaches the member's step (D148: one's own changes only) — pinned.
  - *Gate — only what the gate truly owns.* Refused: a command on another man's row or cutting another man's Input; a
    forged decided stamp; a request placed by anyone but himself (the existing `stampForged`, unchanged — ten bids
    borrowing an old stamp cannot arise, there is no borrowed stamp); a bid on a closed day or a past day; a locked
    week; a group leave he is in (not his own — `mayEditInput` false). **The members' own calls pass:** a signed-in member's call of `lw.ownApprovedChange` and
    `lw.ownApprovedRemove` passes `cmdAuthorize` — run through the card and through the grid's drop, not only the
    helper; the committed envelope's type is `lw.ownApprovedChange`. `moveRecords` called directly with a member's
    approved-leave record still returns `{ reason: 'raptor' }` and changes nothing. **The backstop:** a middle-day
    Delete, a middle-day Move, a middle-day kind change and a middle-day half change of a five-day leave are each
    **accepted** (both untouched pieces stay approved, a reload agrees, one Undo restores the one leave); a hand-made
    `lw.ownApprovedChange` whose new piece adds a day, or that leaves the changed or landing part approved, is
    refused. A set-hours leave: Move and change refused by the store; Delete allowed.
    **And the opposite pin:** a hand-made command equal to an Inputs-page re-date of his own leave (an Inputs command
    type, the leave still approved) is **ACCEPTED** — D1166 — so nothing here can quietly break the Inputs page.
  - A member whose leave was approved, then his dates closed: Move, Duration and the leave buttons are not offered;
    what is offered follows Q5.
- **Saved data:** no new field, no new collection. The request minted is the existing shape.

#### Step 8 — the bell, the change history and the registers for the new events · after 6, 7 · parallel with 9
- **Files:** `src/state/notices.ts` (templates near 1116–1126), `store.ts decisionTells`, `leavewar/m4bell.test.ts`,
  `leavewar/changelines-lw.test.ts`, `src/undo/describe.ts` (Undo's names for the new gestures),
  `docs/notifications-register.md`, `docs/undo-contract.md`.
- **Change:** the two new lines (§6 w10, w11); "taken back" for each on an admin's Undo; the change history's lines.
- **Tests first:** each event tells the leave's person once, never the actor, never the admins; a member's own change
  tells nobody; days decided together are one line (D1142); a half reads "LL (AM)" (D1525).

#### Step 9 — pull the two old windows apart into reusable pieces, no change on screen · after 3 · parallel with 4–8
`BidPicker.tsx` (1,631 lines) and `DayList.tsx` (462) are each one giant component. The new window needs their parts.
- **Files:** `src/leavewar/ui/BidPicker.tsx`, `DayList.tsx`, `BidBits.tsx`, `LeaveButtons.tsx`, `SheetActions.tsx`,
  `ReqWords.tsx`; new `ui/EntryCard.tsx` (one card, drawn from a `daycards` card), new `ui/AddPart.tsx` (Duration +
  the eight leave buttons + the warning line, for a given free portion), new `ui/LastRow.tsx` (CSE · OD · Grant OIL · ⋯
  with their existing forms); `docs/file-map.md`.
- **Change:** extraction only. Every existing `data-testid` kept. **Proof:** the whole Leave War unit project and the
  twelve Leave War browser tests pass unchanged (take the checks lock for the browser run).
- **Permission / saved data:** none.

#### Step 9b — draw what the approved drawings do not show, and put it to him · after 3 · parallel with 4–9
Nothing he has not seen is built (D1625; round 1, M7). The drawings of record show one-day entries, an admin on six
kinds, and one member frame. These states are new and undrawn:
- **Files (new, notes only):** `docs/mock/2026-11-28-day-window-more/draw-more.mjs` (the drawing script's own world and
  CSS, `docs/mock/2026-11-28-what-we-build/draw-war-window.mjs`, on the real app at 402×874 and 1536×864), its `img/`,
  one questions page (an Artifact, each question numbered on the picture — D2920); the words by Opus, then a fresh
  Fable (D2441).
- **Drawn:**
  1. a several-day entry's card with "All 5 days" · "Wed 16 Dec" where "Pick a range" stands (R4);
  2. a leave with set hours (10:00–15:00): the pencil, Move, Delete, remarks; no Duration, leave buttons or
     Approve / Refuse (R5);
  3. a member's approved leave on a day closed for bidding, and on a past day — Q5's two answers side by side, with
     line w9;
  4. an admin's approved-leave card with the Auto-approve switch shown, beside the same card without it — Q4;
  5. the group card as it stands until Q1 and Q2 are answered (line w8) beside the approved b7 — or, if he would
     rather, nothing new: the group entry keeps opening what it opens today (the default below);
  6. Approvals' "Also since you last looked" with a member's deleted approved leave (w26), phone and desktop;
  7. the bell's two new lines (w10, w11) in the bell's own list;
  8. four cards the drawings never showed (round 2, Opus L-1): a member looking at another man's day (read-only
     cards, no buttons); a refused bid's card; an OIL the schedule earned (FO* / HO*) as a card with no buttons; a
     replaced-bid notice as a card. And item 2 for a **member** too: his own set-hours leave with Delete, remarks,
     Document and the pencil only (step 7, rule 10).
- **Until he has answered**, each state opens **what it opens today** — the routing table of step 10 says which old
  window — and steps 6, 7, 13, 15 and 16 build only the parts already drawn.
- **Put to him as one small round**, with Q3–Q5 (and Q1, Q2 when step 16 is next): each question one decision, when
  it happens in real life, a worked example, a recommendation (D2439, D541).
- **Done, chat 199 (28 Nov 26):** drawn in `docs/mock/2026-11-28-day-window-more/` (not `…-11-29-…`; `draw-more.mjs`,
  its words in one table `W`, run `--size d|p`), words adjusted by a fresh Fable (D2441; its read
  `docs/mock/2026-11-28-day-window-more/fable-words.md`), and put to him on one page with Q1–Q7, the drawings as Q8a–i
  and four readings as Q9a–d (`index.html` there). Left for the build, from that read: (1) s08's note under "To
  review", "…Delete it here if it should go entirely.", points at a Delete the row no longer has: put to him with
  branch B's look (its first sentence stays); (2) where the second tap's result will be pending (a member on his own
  approved leave, an admin with Auto-approve off), w1 may add "It will be pending." — drawn first, with step 7.

#### Step 10 — the new window's frame and the routing (b1, the title bar, Auto-approve) · after 9
- **Files:** new `src/leavewar/ui/DayWindow.tsx` (+ `daywindow.test.tsx`); `ui/Matrix.tsx` (3684–3790 and the mounts at
  4400, 4423, 4793); `ui/bidpicker.css` (the card: the drawing script's `.rd-card` values — background #1b2027,
  radius 11, the header's rule moved under the manning line); `ui/DayLine.tsx` (placed under the title).
- **Change:** `DayWindow` = title (drag handle, name, date, Auto-approve where `autoApprove`, ✕) → manning line → the
  cards → the add part where `add` → the last row. **The routing moves one state at a time (round 1, L3):** in this step `Matrix.tsx` opens `DayWindow` for **the empty
  day only** (b1); a routing table (`ui/dayroute.ts`, pure, tested) names for every state which window opens. Each
  later step moves its own states across as its card lands — step 11 the pending bid (b2) only; an **admin on approved
  leave** (b3, b3o1, b8's held half) once Q4 is answered (today's window already gives him Approved / put back,
  Refuse, Move and Delete there); step 13 the other kinds; step 15 the combinations and the member's approved leave;
  step 16 the group; the four looks of step 9b's item 8 only after he has seen them — so no commit ships a window missing
  its entries' buttons; `BidPicker`, `DayListSheet` and `RemarksSheet` stay mounted for the states not yet moved,
  and for every undrawn state of step 9b until he has answered. **Left exactly as they are** (R1): `ClosedNoteSheet`, the read-only schedule sheet
  where a day holds only schedule-earned OIL for a member, the posted-out / not-yet-arrived routes, another squadron's
  day, `SelectSheet`.
- **Tests first:** the routing table — for each of the 25 roll-call states and each role, which window opens (new or
  untouched); Auto-approve present only for an admin and only while the add part shows leave buttons (b5, b8 yes; b2,
  b3, b4, b6, b7 no); a member never; the manning line is the second thing in the window in every frame; the last row
  is present in every frame, Grant OIL an admin's only (m1 shows its place left empty, CSE · OD · [gap] · ⋯ — keep ⋯
  in the same place on both sizes, D1188).
- **Drawing check from here on (D1494):** a script (new `scripts/handpass/lw-daywin-drawcheck.mjs`, reusing
  `docs/mock/2026-11-28-what-we-build/draw-war-window.mjs`'s world and frames) opens each frame's real state at 402×874
  and 1536×864 and measures each part's place, size, colour and text against the `*-clean-*` picture; every difference
  over 2px listed with a marked side-by-side. Run after this step and after every later step and fix.

#### Step 11 — the leave card: a pending bid first (b2); an approved leave (b3, b3o1) once Q4 is answered · after 10, 6
- **Files:** `ui/EntryCard.tsx`, `ui/DayWindow.tsx`, `ui/belowzero.ts` (the second-tap pattern reused, not copied),
  `ui/bidpicker.css`; tests `ui/daywindow-leave.test.tsx`; the tests that pin today's one-tap re-type
  (`ui/wholeleave.test.tsx` 216–222, `ui/leavebuttons.test.tsx`, `ui/doubletap*.test.tsx`) are **changed on purpose** —
  name each in the commit.
- **Order inside the step (round 2, Opus M-4).** First the **pending bid's** card (b2), for an admin and for the
  member: all of the below. The **admin's approved-leave** card (b3, b3o1) — whose swap and Duration follow a switch
  that may be hidden — is built **only once Q4 is answered**; until then the routing keeps those days on today's
  window, so no card is ever shown with leave buttons that do nothing or that follow a switch out of sight. A refused
  bid's card waits for step 9b's item 8.
- **Change:** heading "Pending · Whole day" / "Approved · AM" / "Refused · PM" (Fable's "AM", taken); the puck line;
  "Placed by…"; the action row in the fixed order Approve · Refuse · Move · Delete; Remarks · till · Document; Duration
  with the card's half lit; the eight leave buttons with its kind lit and ringed.
  - **Second tap (D2923):** another leave button tapped → the line (w1) appears just above the leave buttons (where the
    below-zero line stands, D2031), the tapped button armed; the same button tapped again → the swap (step 6's `replaceEntry`, for a
    pending bid and for approved leave alike — by the entry's id; Q3); any other tap clears the arm. If the swap would also take a balance
    below zero, the below-zero line replaces the first line and asks its own tap (reading R7) — never two lines at once.
  - **Duration on the card** changes the entry's half through `replaceEntry` for a bid and for approved leave — never
    `setCell`, which would add a second half beside the first (round 1, Astra 2).
  - "Pick a range" on a one-day leave's card works as it does today in the one-day window on a bid.
- **Tests first:** each control present/absent per role; the armed state survives a re-render and is dropped on close;
  a quick double tap on OL never swaps (it arms, then swaps only if the second tap is on the same button after the line
  is shown — the double-tap guards of `ui/doubletap.test.tsx` extended); remarks typed and not yet left ride with the
  action (`flushRef`, as `DayList.tsx` does); buttons' words stay inside their edges at 360 with an iPhone's wider
  letters ("Delete — sure?" on two lines, D1387).

#### Step 12 — mini pucks on every card (D2929) · parallel with 11
- **Files:** `ui/EntryCard.tsx`, `ui/NamePuck.tsx` (reused), CSS. **Tests:** one puck on a one-man card, in the place
  the group's row stands (under the heading, above "Placed by"); the puck is the name column's own (seat colour, CAT
  chip, a SANS man's purple edge); a person the war has no row for (a SANS man while SANS is off) still draws
  (`warIdentityIfHidden`).

#### Step 13 — the other cards: course, OD, Other, Attach, medical, OIL (b4, b5, b6) · after 10, 4
- **Files:** `ui/EntryCard.tsx`, `ui/placedfacts.ts` (below), `ui/ReqWords.tsx` (`LeaveWords` widened to any one-person Input the reader may edit —
  remarks, till, documents saved through `ui/inputedit.tsx setLeaveRemarks`' door, which already asks `mayEditInput`),
  `daycards.ts`; tests `ui/daywindow-kinds.test.tsx`.
- **Change:** CSE / OD / OTH / Attach / a commitment under Unavailable: heading its half or hours ("Whole day", "AM",
  "09:00–14:00"; an Attach its "To" first, as today's line), Move · Delete (step 4), Remarks · till · Document, the
  pencil; **no** Duration, **no** leave buttons, **no** Approve / Refuse. A medical: heading, Document (add or see —
  D1150), the pencil; nothing else (D2888). OIL award: Edit… · Delete as built, its editor opening in place as today;
  schedule-earned OIL: no buttons. The add part follows the cards where D1552 / D2924 keep leave placeable (over CSE,
  OD, OTH, Attach), with **its own Remarks row gone** where a card stands above it (the drawing's v1.1 note: a second
  empty Remarks box read as doubled — a new leave's remarks are typed on its card once placed).
- **The "Placed by" line on these cards (round 1, M3).** b3, b4 and b5 draw "Placed by <name> · <when>" on leave filed
  on the Inputs page, a medical and a course; `placedFacts` today answers only for war requests and leave with `lw`.
  It gains: any one-person Input filed on the Inputs page → placed = its `by` / `at`, read exactly as the Inputs
  page's own "Placed by" reads them (`src/ui/placedline.ts`), no decided half. A group entry's line names its filer
  (`grpBy`, else `by`). An Input with no stamp says nothing. Tests on b3, b4, b5 and beside the Inputs page's line
  for the same input.
- **Tests first:** per kind and role, exactly the drawn controls; a medical card has no Move/Delete for an admin, the
  man himself or anyone; the read-only reader (a member on another's course) — built and tested only after he has seen step 9b's
  item 8; until then that tap opens what it opens today; b6's order — the award's card, then the bid's.

#### Step 14 — the pencil opens the entry's window over the war (D2889, D2892, b9) · after 13
- **Files:** `ui/EntryCard.tsx`; `sync.ts` (a new small export beside `openInputWindow`: open **without** changing page —
  `setInpEdit(row)` + notify, the `askFiledOil` way); `src/ui/InputWindow.tsx` only if a test shows the over-the-war
  path lacks something (its "show the saved row" step runs only on the Inputs page — after a save the war's window must
  simply re-read); tests `ui/daywindow-pencil.test.tsx`, a browser test `e2e/daywindow-leavewar.spec.ts`.
- **Change:** the war's small pencil button (`.ev-ctl.ev-pen`, 30px in a card head as drawn, its 40px tap area,
  `PenIcon solo`), `title="Edit"`, `aria-label="Edit CSE, Mon 14 Dec"`. Press → the Input's own window over the war,
  the war's window dimmed under it; Save, Delete, ✕, Escape or a click outside close it and the war's window is still
  open on the same day, re-read (if the entry left the day, its card is gone; if the day is now empty, the window shows
  the empty day).
- **Tests first:** the page stays the Leave War through open, save and close; every rule of the Inputs window holds
  there because it is the same window (one test per: a member cannot change the place of a scheduler-moved input; a
  locked week's note; a medical's fields); a member has no pencil on an entry `mayEditInput` refuses; the pencil is
  absent on plain leave and bids for everyone; focus returns to the pencil on close (keyboard).

#### Step 15 — half days, two entries, several-day entries, the member's window (b6, b8, m1) · after 11, 13, 7
- **Files:** `ui/DayWindow.tsx`, `ui/EntryCard.tsx`, `daycards.ts`, `ui/Matrix.tsx`; tests `ui/daywindow-combos.test.tsx`
  (D1725's table as tests), `ui/daywindow-member.test.tsx`.
- **Change:** b8 — the morning leave's card, then the add part with PM lit, Whole day greyed (D1543), Auto-approve
  shown; two halves held → two cards, no add part, no Auto-approve; a several-day entry's card carries "All n days" ·
  the day tapped where "Pick a range" is drawn, scoping Move, Delete, Duration, the swap, Approve / Refuse (D1565, R4);
  m1 — a member's own approved leave: Move · Delete (step 7), Remarks · till · Document, Duration, leave buttons; no
  Approve / Refuse; last row CSE · OD · ⋯ in their usual places. `RemarksSheet` is no longer opened; delete it and its
  tests only once nothing mounts it.
- **Tests first:** the combinations table at both roles; m1 exactly; a member on a day closed after approval (step 7's
  rule 4 on screen); the free-half rule (`ui/freehalf.test.tsx`) still true.

#### Step 16 — the group card (b7, b7b; D2929, D2896, D2778) · LAST · needs Q1, Q2 · may ship separately
- **Files:** `ui/EntryCard.tsx`, `daycards.ts`, `store.ts` / `sync.ts` (the doors of steps 4–6 taking a whole group; and taking **one man** out — **not** `cutDates` /
  `sliceInput`, which cut **dates** and copy the whole people list onto every piece, so used for one man they would
  change that day for all three (round 1, Astra 4). The dependency is the app's existing "take one person out of a
  shared input and give him his own" — the path the Inputs window's take-himself-out and a medical over a shared leave
  use, with `engine/rowinput.ts noteOwnOf` / `rowInputOf` recording whose own input came from which shared one; the
  builder names the exact function before writing a line and says so in the step's notes. Date cutting is applied only
  to the man's **own** resulting input; a whole-group action keeps the whole people list), `state/perms.ts` if a new command
  type is needed, the bell (each man told once).
- **Change, as drawn:** every man's puck; "Change" then "3 pax" (lit) and the tapped man's name; the pencil; Approved ·
  Refuse · Move · Delete; Remarks; Duration; leave buttons. With "3 pax" lit a change is for everyone in the group
  (D2778: "a box moved moves the leave of everyone in it"); with the man's name lit only his puck shows (D2896) and the
  change is for him alone — he is taken off the group and given his own leave (D2778). **When** he leaves the group —
  at the press (D2783) or at the change (what D2896's "3 pax shows all again" implies) — is Q1.
- **Until Q1 and Q2 are answered the build does this:** a day holding a group entry opens **what it opens today**
  (the routing table keeps it on the old window), so nothing new is shown that he has not seen and nothing can be
  changed for one man or for all by mistake. The in-between card — pucks and the pencil only, line w8 — is drawn in
  step 9b and built only if he picks it.
- **Tests first (once answered):** a change with "3 pax" touches every man's days, one command, one Undo, each man told
  once; with the man's name — the first, the middle and the last of the three, one day and all days — only he changes,
  the split and his change **one command** if Q1 puts the split at the change, and the others' Input keeps its iid,
  dates, remarks and documents; after a reload the same; one Undo puts him back in the group; a member in the
  group has no buttons; a medical filed over one man still cuts only him (folded question 7 — pinned as it is today);
  Auto-approve off + a kind swap for all → every man's leave pending.

#### Step 17 — fit, look and clean-up · after 15 (and 16 if in)
- **Files:** `ui/bidpicker.css`, `ui/phone.ts` / `ui/screenfit.ts` if the taller window needs them; `docs/ui-contracts.md`
  (a new section "The Leave War's day window (A2)" and pointers from the sections it replaces — the old text moved
  whole to `docs/archive/`, never trimmed in a `src` change's commit: a docs-only commit); `docs/feature-impact.md`
  (row 163 and the ripple rows); `docs/file-map.md`; `docs/leavewar/known-gaps.md`; the words "change it on the Inputs
  page" (`DayList.tsx` 209) and "Nothing here can be deleted from the war…" (`BidPicker.tsx` 703) where they are no
  longer true.
- **Checks:** the drawing check clean at 402 and 1536; by eye at 390 and 360 (nothing cut, the two chips wrapping
  together); a card-heavy day (two cards + the add part) on a phone scrolls inside the window with the title and the
  last row reachable; the window never taller than the screen; no control moves under the finger after a tap (D2030);
  nothing glows (D881); the page keeps its spring (D1962).

### Branch B — the schedule's "To review"

#### Step T0 — draw Edit Schedule's week and ask Q6 · before any switch of the week (round 1: Astra 6, Opus M1)
Only the Scheduler Board was drawn. On Edit Schedule a placed input's **only** Reject today is its Personal Inputs
line; the week's Ground Programme rows have no buttons. So the week must never be left with neither.
- **Draw** (the `draw-to-review.mjs` way, the week at 402 and 1536): Reject on a Ground Programme row's puck line and
  on a Common Programme row's; the empty section (heading and "none", or not drawn — today an empty one is not drawn);
  one rejected input waiting. Put Q6 with it.
- **Release rule, a test in T1:** a view switches to the new list only in the same change that gives its placed rows
  their Reject, their late mark and their jump targets. Until then that view keeps `listedPersonal`, the heading
  "Personal Inputs" and its helper line. The Board may switch first; the week follows his answer. Better still, both
  in one go once Q6 is answered — they share words.

#### Step T1 — what the section lists · medium
- **Files:** `src/engine/inputs.ts` (new `listedToReview(inp, placed)` beside `listedPersonal` 713 — personal or an OD
  out, and **not placed anywhere**. "Placed" is **not** "a row in the week in view" (round 1, Astra 5): `acc` is
  worked out afresh when a week loads, so a Sunday–Monday request placed on Sunday would come back under Monday's week.
  The check is the one `accCtl` already makes to print "Reject · Tue" and "On <date>" (`src/ui/html.ts` 2498–2511): it
  looks through the week in view **and the saved weeks**; that lookup is lifted into one function both the rows and the
  heading's count call. A saved week that cannot be read is handled **as `accCtl` handles it today** (round 2, Opus L-2 — round 1's
  wording here contradicted itself): the input stays **listed** under "To review", its Accept refusing with today's
  reason, so it never vanishes from both the programme and the list); callers
  `src/ui/html.ts` 2315, `src/ui/board-html.ts` 818; the counts in the folded heading (`html.ts` 2240–2246,
  `board-html.ts` 827–831).
- **Tests first:** a saved week that cannot be read → the input listed, its Accept refused with its words; the release rule of T0 (on Edit Schedule, before its Reject is built, a placed input is still
  listed with its Reject); a Sunday–Monday request placed on Sunday is not listed on Monday's week — after switching
  weeks and after a reload — and once its Sunday row is taken off it is listed again; on the issued (read-only) face,
  what is listed is what the frozen inputs give and no button is drawn; an accepted input (`'g'`) is not listed; a rejected one is; one under Unavailable (`'u'`) is not;
  an input whose row stands on another day or week is not (R12); the "+ Inputs" duplicate fallback (unplaced) is; the
  count in the heading counts only what is listed. `listedPersonal` itself is kept for every other reader until each is
  looked at (grep its callers — OIL crowd, late marks, pending list — and decide one by one; do not rename it blind).
- **Saved data / permissions:** none — `acc` and `schedPlaced` are written exactly as today.

#### Step T2 — Reject on the placed row · medium · **before a view's switch in T1 goes live** (the Board first; the week after Q6)
- **Files:** Board: `src/ui/board-html.ts sbGrRowHTML` 594–623 (and the Common Programme's row builder near 203) —
  the existing Reject button of `accCtl` (`html.ts` 2481–2528) reused, placed before the remarks box as t1 / t2 draw it;
  phone: on the puck line (D947), `13-board-rows-responsive.css` 890–896. Edit Schedule: `html.ts grRowHTML` 2463 /
  `plRow` 804 and `09-week-responsive.css` 288 — **after T0 / Q6**. Clicks: the existing `[data-acc]` handler
  (`src/ui/interactions.ts` 1052–1190) — no new handler.
  The LATE mark, the late-input chip and the jump targets move with the row: `src/ui/pendlist.ts` 209–226,
  `interactions.ts` 175–185, `src/ui/boardland.ts` 283–296.
- **Tests first:** every Ground / Common row whose `src` is an input has Reject; a hand-made row has none; pressing it
  does exactly what today's Personal Inputs Reject does (`unacceptInput`, `acc 'r'`, the move marked — D1388), the row
  leaves the programme and appears under "To review" with Accept / → Ground / → Unavail; the Board's ✕ still rejects
  (left as built); a jump from the changes window lands on the row; a LATE input shows its mark on its row; an input waiting since its
  day was published keeps its waiting mark on its row (already built — pinned, not added); Reject → "To review" →
  accept again → Undo, from the Board and from the week.
- **Permission:** Reject is a scheduler's (an admin's, D785); on a read-only / issued face it is not drawn — pinned.

#### Step T3 — the words · low · after T1 (parallel with T2 on different lines of the same files — do in one chat)
- **Files:** the strings of §6 (w12–w19); the constant `GP_TAKEOFF_NOTE` and its four uses removed, with its CSS
  (`12-schedule-editing.css` 452–455) if nothing else uses it; the tests that read the words — the survey's list:
  `engine/inputground.test.ts`, `ui/board.test.tsx`, `ui/inputcx-scenarios.test.tsx`, `ui/oilwait.test.tsx`,
  `ui/reqdoor.test.tsx`, `ui/words-r1b.test.tsx`, `ui/allavail-common.test.tsx`, `ui/noteswords.test.ts`,
  `e2e/board-undo-land.spec.ts` and the rest that mention the section (about ninety files; most need no change because
  they select by class, which stays `.pinp` / `.sec-inp`).
- **Change:** class and attribute names stay (a rename buys nothing and touches the geometry tests).

#### Step T4 — the empty state and the overflow · low · after T1
- **Files:** `board-html.ts` 827–839 (empty: the heading and "none" in the sub-line's grey, folded — t1), `html.ts`
  2225 (Edit Schedule: today an empty section is not drawn at all — keep that, or draw the heading with "none" to match
  the Board: T0 / Q6); `13-board-rows-responsive.css` 198 and `14-input-editors.css` 136–141 (the control cell stacks
  "→ Ground" over "→ Unavail" as t2 draws, never past the panel's edge at 1536 or in the phone's desktop layout).
- **Tests first:** a geometry test (`e2e/geometry.spec.ts`'s way): at 1536 and 1280 the two buttons' right edges are
  inside the panel.

#### Step T5 — documents · after T2–T4
`docs/ui-contracts.md` (the passages the survey lists: 17, 20, 680, 1296, 1517, 2412–2475, 2515–2572, 6004…),
`docs/feature-impact.md` (154–156, 250, 343, 1636), `docs/file-map.md`. A docs-only commit.

### What can run in parallel

- Branch A and Branch B: wholly — no shared source file.
- Inside A: steps 1, 2, 3 together (three different files). Step 9 (extraction, UI files only) alongside steps 4–8
  (store, sync, perms, notices) — **one chat for 4–7**, in order, since they all edit `store.ts`, `sync.ts` and
  `perms.ts`. Step 12 alongside 11. Steps 10 → 11 → 13 → 14 → 15 in order (all in `DayWindow.tsx` / `EntryCard.tsx`).
- Step 9b (drawings, notes only) alongside everything from step 3 on.
- Inside B: T0 first (a drawing); then T2's Reject and T1's switch land together for each view; T3, T4 after — the
  same two builders, one chat.

---

## 6. Every on-screen word the build adds or changes (for a fresh Fable's review, D2441)

Opus's drafts unless marked "ruled" or "taken". "Unchanged" words that only move are not listed.

**The Leave War**

| # | Where | Today | New |
|---|---|---|---|
| w0 | the small line on a card, the person window's leave list, anywhere `PlacedOne` draws | "Placed **Ranger** · Mon 5 Jan, 09:12 · Approved **Saber** · Thu 8 Jan, 08:40" | **ruled (D2927):** "Placed by **Ranger** · Mon 5 Jan, 09:12 · Approved by **Saber** · Thu 8 Jan, 08:40"; "· Refused by **Saber** · …" |
| w1 | the line above the leave buttons after the first tap on another kind | — | drawn (b3o1): "Only one kind of leave a day. Tap OL again to change this LL to OL." — the row says the words get a polish before the build |
| w2 | a card's heading | list words "approved", "pending", "refused", "(AM)" | "Pending · Whole day", "Approved · AM", "Refused · PM" (Fable's "AM" **taken**); a non-leave card: "Whole day" / "AM" / "PM" / "09:00–14:00"; an Attach: "<To> · Whole day" |
| w3 | the pencil | — | `title` "Edit"; `aria-label` "Edit CSE, Mon 14 Dec" (**taken**) |
| w4 | the group card's line | — | "Change" · "3 pax" · "Cutter" (**ruled, D2784**) |
| w5 | an OIL award's card | "OIL award, AM (reason) · given by Saber" in one line | heading "OIL award · a day" / "OIL award · AM"; under it "Weekend det · given by Saber" (drawn b6) |
| w6 | the period list | last line "+ New period" | first line "+ New period" (words unchanged, place ruled D2890) |
| w7 | the list's line for an Inputs-filed entry | "change it on the Inputs page" | removed where the card can now change it; kept, reworded, only where it cannot (w8, w9) |
| w8 | a group entry's in-between card — **only if he picks it in step 9b** | — | draft: "For all 3 — open it with the pencil." |
| w9 | a member's approved leave on a day he may not bid on (closed, or before today) — drawn first (step 9b), its words follow Q5 | — | draft: "Bidding is closed on this day. You can delete this leave here, or change it on the Inputs page."; a past day: "This day has passed. …" |
| w26 | Approvals, "Also since you last looked": a member deleted his approved leave | (a withdrawn bid's line today) | draft, in that line's own shape: "Ranger deleted his approved LL · Thu 3 Dec" |
| w27 | the standing bar when a move's OIL question is closed unanswered | "Not swapped / Not added / Not filed — OIL not answered · Answer OIL · OK" | unchanged — the existing bar already has "Not moved — OIL not answered" (`WAIT_WORDS.move`); no new words for Fable |
| w28 | Approvals' "<time> · by Saber" and "Already approved by Saber" | as quoted | unchanged — listed so Fable sees them beside w0 |
| w29 | a member's re-bid after he changed his approved leave | — | no new words: the card reads "Placed by Ranger · <now>" (w0's line) |
| w10 | bell, an admin swaps the kind of a man's approved leave | — | draft: "LL changed to OL" (+ the day run and who, as every war line); pending after it: "LL changed to OL · pending" — shown to him in step 9b |
| w11 | bell, an admin changes its half | — | draft: "LL changed to LL (AM)" |
| w12 | refusal toasts of the new doors | — | reuse the existing sentences word for word where one exists ("This change could not be saved.", the locked-week note, "… already has LL on … — OL can't overlap it"); new only: "A medical is changed on the Inputs page, not here." (draft; shown if a door is reached some other way) |
| w13 | "Nothing here can be deleted from the war: approved leave and leave filed on the Inputs page are changed on the Inputs page." (`BidPicker.tsx` 703) | as quoted | removed, or cut to what is still true once steps 4 and 7 are in (Fable to word) |
| w14 | Undo's names for the new steps (`undo/describe.ts`) | — | drafts: "moving Cutter's course", "deleting Cutter's course", "changing Cutter's LL to OL", "changing Ranger's leave" |
| w15 | the change history's lines | — | follow the bell's words |

**The schedule**

| # | Where | Today | New |
|---|---|---|---|
| w16 | section heading, Edit Schedule and the Board | "Personal Inputs" | **ruled (D2883):** "To review" |
| w17 | the Board's empty section | "No personal inputs for this day." | drawn (t1): the heading, then "none" |
| w18 | the Board's read-only face | "No personal inputs submitted for this day." | draft: "Nothing to review for this day." |
| w19 | helper line, Ground and Common Programme | "To take an input off, press Reject on it in Personal Inputs below." | removed (drawn) |
| w20 | toast after the Board's ✕ | "Ground item removed — back under Personal Inputs…" | draft: "Ground item removed — it is under To review…" |
| w21 | Reject's title on an Unavailable row (two places) | "Take it back out of Unavailable, into Personal Inputs" | draft: "Take it out of Unavailable, into To review" |
| w22 | toast in the input window | "An identical row is already on the Ground Programme, so this one was added under Personal Inputs instead" | draft: "…so this one is under To review instead" |
| w23 | Admin → section order | label "Personal Inputs"; help "…the crew lists (Personal Inputs, Available crew, SANS, Unavailable)…" | "To review" in both |
| w24 | the note kept in the open section | "A rejected input flags nothing until accepted again. Delete it here if it should go entirely." | unchanged (drawn in t2) — listed so Fable sees it beside the new heading |
| w25 | the title of "+ Inputs" | "Add a personal input (meeting, course…) — it goes straight onto the Ground Programme" | unchanged (it names the kind of thing) — Fable to confirm |

---

## 7. Risks, my readings, and what the walk must cover

### 7a. Risks

- **K1 — the member's widening leaks.** Step 7 is the only place a member gains power over approved leave. The risk is
  a path that leaves it approved after his change, or reaches another man's. Held by: a separate question in
  `access.ts` (never loosening `canDecide`), one store door that can produce nothing else, **a card's Move going to that door itself while the
  shared move commit refuses these records as it does today** (rule 8), the drag window gaining nothing, and the
  security read.
- **K2 — what the gate can and cannot hold.** The gate cannot tell the war's door from the Inputs page, so it cannot
  be the guard of "back to pending" (step 7's opening). It is not asked to be: `stampForged` is untouched, the re-bid
  is placed by him now, and the only gate addition is a shape check on the war door's own two command types — judged by what his
  approved leave covers, so a lawful split passes — a backstop against our own fault, said as such to every reader.
  The new command types carry **no** extra-tables list (it would refuse the members they are for).
- **K3 — Auto-approve decides while hidden.** As first planned, an admin's swap on a whole-day leave would follow a
  switch that is not on screen, and the memory differs by device (on by default on a new one). That is now **Q4**, not
  a notice; step 6's card waits for the answer.
- **K4 — the two pages differ on purpose** (D2922 against D1166). The difference lives only in the war's own door; a
  member can always reach the Inputs-page result on purpose, by going there. Readers: not a finding.
- **K5 — one Input, many readers.** Cutting a day out of a five-day course from the war changes the schedule's
  Unavailable rows, crew counts, published days and OIL questions. Every new door goes through the Inputs door so most
  follow by themselves — **but not the OIL question**, which the Inputs page's own screens ask before they save and the
  bare write does not (round 1, Astra 3): step 4 asks it itself. Each is walked, published weeks above all.
- **K6 — the routing in `Matrix.tsx`** is a long chain of special cases, each from a past fault (posted-out days, away
  bids, the free half). Step 10 changes only which component the three common routes mount; the routing-table test is
  the guard.
- **K7 — double taps.** The cards put destructive buttons under each other's old places. The existing rule — an action
  never moves a card — and the double-tap tests must be carried over card by card. The backlog's lead ("a second press
  after two next-door bids were approved together did nothing and said nothing") is tried in the walk.
- **K8 — taller window on a phone.** A leave card is seven rows; two cards and an add part exceed an iPhone's height.
- **K9 — "To review" moves the late mark and the jump targets.** Small in code, wide in tests.
- **K10 — the drawings are on an unmerged branch**, and the build sheet's b2 caption disagrees with the rulings (Q3).
- **K11 — stored demo data** (D56): an old stored world may hold shapes the new doors never make; not a finding.

### 7b. My readings (each mine, not his rule — with a worked example)

- **R1 — what "the day window" replaces.** The new window replaces the one-day window, the day's list and the member's
  remarks-only window. It does **not** replace the member's closed-day window, the posted-out and not-yet-arrived
  routes, another squadron's day, or the drag window — none is in the drawings. *Example: Ranger taps Tue 5 Jan, closed
  for bidding, where he has a pending bid → today's closed-day window, unchanged.*
- **R2 — another man's day, for a member.** Whatever opens today still opens, as read-only cards; nothing new opens.
  *Example: Ranger taps Cutter's course on 14 Dec → the course's card, its remarks read only, no buttons, no pencil.*
- **R3 — a member's change of approved leave needs a day he may bid on.** *Example: Ranger's LL on Thu 3 Dec is
  approved; bidding on December then closes. He may Delete it on the war; Move, AM/PM and the leave buttons are not
  offered, and the card says to change it on the Inputs page (where, by D1166, it stays approved).* Why: a change makes
  it a bid, and a member places no bid on a closed day (D1177) or a past one (D1211). That **Delete** is still offered
  there — a closed day and a past day alike — is also my reading, not his rule (round 1, L1). → Q5.
- **R4 — several-day entries keep today's two chips** ("All 5 days" · "Wed 16 Dec") on the card, scoping every button.
  *Example: a five-day course, Wednesday tapped, "Wed 16 Dec" lit, Delete → the course becomes Mon–Tue and Thu–Fri.*
  The drawings show only one-day entries.
- **R5 — leave with custom hours** (say 10:00–15:00, filed on the Inputs page): for an **admin** the pencil, Move
  (its hours kept), Delete and its remarks, but no Approve / Refuse, Duration or leave buttons — a bid can hold only a
  whole day or a half. For **its own member**: Delete, remarks, Document and the pencil only — no Move on the war,
  since his move must become a bid and a bid would lose the hours (step 7, rule 10). *Example: Ranger's approved LL
  10:00–15:00 on Thu 3 Dec; to move it he presses the pencil and changes its date in its own window.*
- **R6 — an admin's AM / PM change of an approved leave follows his Auto-approve switch**, as his kind swap does
  (D2925 names only the swap). *Example: Hex makes Cutter's approved whole-day LL an AM leave; switch on → approved AM
  leave; switch off → a pending AM bid.* An admin's **Move** keeps it approved, as built and tested today. Told to him inside Q4.
- **R7 — one warning line at a time.** If a swap would also take the balance below zero, the "one kind" line comes
  first; the confirming tap then shows the below-zero line, which asks its own tap.
- **R8 — a rejected course or OD** (a scheduler pressed Reject; it counts him in, D1357): if the war still draws its
  box today, its card keeps Move, Delete and the pencil like any other; the war gains no Accept. The builder checks
  what the grid draws today first.
- **R9 — a replaced-bid notice's card** keeps exactly what its list line has today.
- **R10 — the period list stays the browser's own choice list.** The drawing's own note says it was drawn as a plain
  list only because a picture cannot catch the browser's. *So on an iPhone it is still the wheel, "+ New period" its
  first line.*
- **R11 — the last row for a member** keeps ⋯ at the right end with Grant OIL's place empty (as m1 draws), so no button
  changes side between an admin and a member or between sizes.
- **R12 — "To review" lists an input only on a day where it is not placed anywhere.** *Example: a Meeting whose row
  stands on Tuesday's programme is listed today under Wednesday's Personal Inputs as "Reject · Tue"; under "To review"
  it is not listed on Wednesday — its Reject is on Tuesday's row.*
- **R13 — withdrawn in round 1** (it rested on a wrong fact; the waiting mark is built on Ground Programme rows).
- **R16 — the member's re-bid is placed by him, now** (round 1, H4). *Example: Saber placed and auto-approved Ranger's
  LL in September; on 28 Nov Ranger moves it; the new bid's card reads "Placed by Ranger · Sat 28 Nov, 10:02".*
- **R17 — leave filed on the Inputs page, moved by an admin on the war, gets no dotted "moved" mark** — it was never
  the war's (round 1, M4).
- **R14 — the D2773 drop refusal and the phone banner are not in this build**, because neither says "Personal Inputs"
  today and the refusal is not built.
- **R15 — a member's own one-person course / OD / Attach / Other gets Move and Delete on the war** wherever the Inputs
  page lets him edit and delete it (D1724's "a member changes only his own entries").

### 7c. What the walk must cover (a FULL check; scenarios designed by Astra and a fresh Fable, each blind — these are the planner's must-haves, not the list)

Both sizes throughout (his iPhone 402, and 1536; fit at 390 and 360). Driven by pressing the controls, never by writing
data. Signed in as an admin (Hex / Saber) and as a member (Ranger), and looked at from a second member.

1. **Every drawn frame** b1–b9, m1, p1, t1, t2 beside its picture (the drawing check plus the eye).
2. **D1725's combinations**: whole day / AM / PM / AM+PM / leave + award / course + leave over it / OD + bid / Attach +
   leave (D2924) / medical + anything; each as an admin and as the man himself: how the box looks, what the tap opens,
   every button pressed.
3. **Each new power, end to end, then every other place that should show it**: admin moves a course (the Inputs page's
   list and calendar, the schedule's Unavailable row, the crew count, the SANS calendar's need, the bell of the man);
   deletes an OD; sends back and refuses a leave filed on the Inputs page; swaps LL → OL with Auto-approve on, then off;
   whole day → AM; Balances and the person window's tiles after each.
4. **The member**: Ranger moves, halves, swaps and deletes his own approved leave; Approvals shows it; an admin approves
   again; Ranger's bell. He tries each on Cutter's leave (nothing offered). On a closed day, a past day.
5. **Published days**: each new door on a day of a published week — the issued face unchanged, the pending amendment
   listed, published again; an OIL-earning weekend.
6. **OIL**: an OIL-kind leave swapped away and back; a day with an award and a leave, the award's Delete never under a
   second tap meant for the leave.
7. **The pencil**: opened from a course, an OD, an Other (Ground / Unavailable), an Attach, a medical, custom-hours
   leave; saved, deleted, cancelled, Escape, a tap outside; the war's window still there each time; on a phone.
8. **Undo / Redo** of every new step, by the person who did it; the bell's "taken back"; **a member's Undo of his move
   after an admin approved or refused the re-bid — refused both ways, naming the admin**.
8a. **The drag window** as an admin and as a member, over a course, over an Inputs-filed leave, over a member's own
   approved leave: it offers exactly what it offers today.
8b. **The OIL question** on a course moved from a weekday to a Saturday and to a holiday: asked first, answered,
   closed unanswered.
8c. **AM → PM and PM → AM** on a bid and on approved leave, by an admin and by the member: one entry afterwards.
9. **Double taps and fast taps** on every card's buttons; the second-tap swap tapped slowly, quickly, and on a different
   button the second time; the backlog's lead (two next-door bids approved together, then OL on the next day).
10. **The plain-user round** (D1557): a member's whole errand — bid, get approved, plans change, move it, get approved
    again; an admin's — work through a day with three entries.
11. **Multi-squadron and postings**: a man posted out mid-month, a detachment day, another squadron's day — the routes
    R1 leaves alone still behave as before.
12. **The period list** as an admin and as a member, both sizes.
13. **"To review"** (Branch B's walk): reject from a Ground row on the Board and on Edit Schedule, phone and desktop;
    accept again by each of → Ground / → Unavail; the Board's ✕; an empty section; a late input; a jump from the changes
    window; the 1536 fit; a published day's read-only face; the Common Programme.
14. **Lessons of §7.11 of the bug-check order** checked against every scenario (D1297).

Readers' briefs carry: D56 (stored data), K4 (the two pages differ on purpose), D785 (no scheduler who is not an admin),
the area files (`leave-war.md`, `inputs.md`, `scheduler.md`, `people-accounts.md`, `design.md`) and their full rows.

---

## 8. Questions the build hits

### Folded questions (from the build sheet's "Still open, for later rounds") — asked only as the build reaches each

| Folded | Where the plan hits it | What the build does meanwhile |
|---|---|---|
| **3** — on the grid a group's box shows nothing extra; a tap rings the others | step 16 (the group card opens from one man's box) | the grid is unchanged: no ring, no extra mark |
| **D** — a group's OD or course is one item on both pages; half days offered | step 13 (a course or OD with several people) and step 4 | such an entry's card shows every puck and the pencil only; no Move or Delete from the card; no half days added |
| **7** — a medical or posting out over one man of a group splits only him off | step 16's tests | left exactly as it behaves today, pinned by a test |
| **E** — an admin can add men to leave that came from one man's approved bid | step 14, only where the pencil opens a war-approved leave with custom hours | the input window behaves as it does on the Inputs page today; nothing added |
| **B** — "Change for Cutter only" on the Inputs page and the schedule | step 16, as its edge | the war only; the pencil's window has no such button |
| F1, F4, 5 | not hit | — |
| Words ("Placed by") | answered — D2927 | built in step 1 |

### Rulings whose own rows say "drawn first" or "put to him", reached by this build

| Ruling | Where | Meanwhile |
|---|---|---|
| D2882 — on an open date a member is offered both a bid and leave that stands at once, "drawn first" | steps 10–11 (a member's empty open day) | as today: the war places a bid; leave that stands is filed on the Inputs page |
| D2891 — delete or archive a period | step 2 | not built; only "+ New period" moves |
| D2783 — whether and where "Change for Cutter only" is built | step 16 | see Q1 |
| D2883's reading — Edit Schedule's look ("drawn first") | step T0 | see Q6 |

### The questions for him — six, each one decision

Each is put with a picture of the real app, the place marked, its number on the picture (D2920), when its step is
reached (D2926: "asked as the build reaches each"). Q3–Q5 go together in step 9b's round; Q1 and Q2 when step 16 is
next; Q6 before Branch B switches the week.

- **Q1 — when does Cutter leave a group leave?** *When:* an admin opens a three-man leave from Cutter's box and wants
  to change only Cutter's days — rare. *Example:* Cutter, Ghost and Dash share an LL on Mon 21 Dec; Hex presses
  "Cutter" on the card, then closes the window without changing anything. Your 27 Nov answer (D2783): Cutter is on his
  own leave from the press. Your 28 Nov words (D2896): "Cutter" shows only his puck and "3 pax" shows all three again —
  which a split at the press would make untrue. **Recommended: the press only chooses whom the next change touches; he
  leaves the group when a change is actually made for him.** *Meanwhile:* a group entry opens what it opens today.
- **Q2 — a group's course or overseas duty: Move and Delete on the card?** *When:* three men on one course, an admin
  taps one man's day — occasional. *Example:* Cutter, Ghost and Dash on a CSE, Mon 14 Dec; Move from Cutter's box.
  **Recommended: the card works as the group leave's does — "3 pax" moves it for all three, "Cutter" for him alone.**
  *Meanwhile:* it opens what it opens today.
- **Q3 — a pending bid: one tap or two to change LL to OL?** *When:* a member tidying his own bids during a bidding
  window — often. *Example:* Cutter's pending LL on Wed 2 Dec; he taps OL. Your ruling says a leave is no longer
  swapped by one tap; the build sheet's caption under the pending bid still said "in one tap". **Recommended: two taps
  for every leave card, pending or approved — one habit, nothing swapped by a slip.** *Meanwhile:* two taps.
- **Q4 — should the Auto-approve switch show when an admin swaps or shortens an approved leave?** *When:* an admin
  corrects a leave already approved — a few times a month. *Example:* Hex switched Auto-approve off on his PC last
  week. Today he opens Cutter's approved whole-day LL and makes it OL (or AM). You ruled the result follows his switch
  — but on that card the switch is not drawn, so on his PC the leave quietly goes to pending, and on his phone (where
  the switch is still on) it stays approved. **Recommended: A — show the switch in the title bar whenever an admin's
  card has leave buttons, so he sees what will happen.** B — keep it hidden, as first drawn. C — an admin's swap or
  AM/PM change always stays approved, no switch involved. (His Move keeps it approved either way, as today.)
  *Meanwhile:* a day holding approved leave opens for an admin what it opens today (Approved / put back, Refuse, Move,
  Delete, its remarks) — the new card for it is not shown until this is answered.
- **Q5 — a member's approved leave on a day closed for bidding, or already past.** *When:* bidding for December has
  closed and Ranger's plans change — common once a window shuts. *Example:* Ranger's approved LL on Thu 3 Dec, December
  closed. A move or change makes it a bid again, and he cannot bid on a closed or past day. **Recommended: A — on such
  a day he may only Delete it on the Leave War; to move or change it he uses the Inputs page (where it stays
  approved).** B — he may not touch it on the war at all there, only its remarks. C — he may move and change it there
  too, and it goes to pending. *Meanwhile:* such a day opens what it opens today (his remarks window).
- **Q6 — "To review" on Edit Schedule's week** (only the Scheduler Board was drawn). *When:* a scheduler at his desk
  takes an input off the Ground Programme — weekly. *Example:* Zenith's Meeting on Monday's Ground Programme, seen on
  Edit Schedule. **Recommended: as the Board — Reject on the row's puck line, and an empty "To review" showing its
  heading and "none".** *Meanwhile:* Edit Schedule keeps "Personal Inputs" exactly as today; the Board may switch.

**Told to him, not asked** (each with its picture at his look): an admin can now refuse or send back a leave that was
filed on the Inputs page (drawing b3); after a member changes his approved leave, its card reads "Placed by" him, at
the time he changed it; leave filed on the Inputs page and moved by an admin on the war shows no dotted "moved" mark.

### Drawn for him before they are built (D1625) — step 9b and step T0

1. A several-day entry's card with "All 5 days" · the day tapped.
2. A leave with set hours: the pencil, Move, Delete, remarks, no Duration or leave buttons.
3. A member's approved leave on a closed day and on a past day (Q5's answers side by side).
4. An admin's approved-leave card with the Auto-approve switch shown, beside it hidden (Q4).
5. A group entry's in-between card (pucks and pencil only) — only if he wants one before Q1 and Q2 are settled.
6. Approvals' "Also since you last looked" with a member's deleted approved leave.
7. The bell's two new lines (an admin changed the kind, or the half, of a man's approved leave).
8. "To review" on Edit Schedule's week, both sizes: Reject on a Ground Programme and a Common Programme row, the empty
   section, one rejected input waiting (Q6).
9. A member looking at another man's day: read-only cards.
10. A refused bid's card.
11. An OIL the schedule earned (FO* / HO*) as a card with no buttons.
12. A replaced-bid notice as a card.
(Item 2 is drawn for an admin and for the leave's own member, who has no Move there.)

---

## 9. Closing the build (for the builder's report)

- Rulings to move from "not built" to built, each by a test that holds it whole: D2887, D2892, D2889, D2886, D2888,
  D2929 (the mini pucks), D2897, D2923, D2925, D2898, D2922, D2924, D2927 (Leave War page, §The bid windows and the day's list and §Not
  built yet — the [LW-FULL-EDITING] line); D2890 (the built list, line 179); D2883 (scheduler page). D2896, D2783,
  D2784, D2778 only if step 16 ships.
- Backlog: [COMBINED-INPUT-ROWS] (its day-window and "To review" parts — the combined row under Unavailable and the drop
  rule stay open), [LW-FULL-EDITING] (closed by steps 4, 13–15, bar a medical), [LW-PERIODS-MANAGE] ("+ New period" done;
  delete / archive open), and the fault found in passing (the 1536 overflow, step T4).
- The reads owed: Astra, a fresh Opus, a fresh Fable and the security read on Branch A; Astra and a fresh Opus on
  Branch B; the words of §6 by a fresh Fable before his look.

---

## 10. The red team's rounds — what the code reads must check, and what was done with each finding

Round 2 was the last round of plan review (the cap of about three). What is left is checked in the build and by the
code reads.

### What the build's code reads must check (the fixes easiest to get wrong in code)

1. **The new command types carry no extra-tables list.** `lw.inputMove`, `lw.inputRemove`, `lw.ownApprovedChange`,
   `lw.ownApprovedRemove`: a signed-in member's own call of each passes `cmdAuthorize`, through the card and the
   grid's drop; another man's records are still refused by the check of the real changes.
2. **A card's Move never runs inside `lw.move`.** The committed envelope's type is `lw.inputMove` or
   `lw.ownApprovedChange`; `moveRecords`, `moveRecordsProblem`, `absenceMovable`, `movableRecords` are unchanged
   and still refuse these records.
3. **A member's change of approved leave can only end pending.** No path — card, move mode, drag window, Duration,
   leave buttons — leaves the changed or landing part approved; and the opposite pin holds: the same re-date made on
   the Inputs page is accepted and stays approved (D1166).
4. **The backstop judges coverage, not new records.** A middle day cut from a five-day leave leaves two approved
   pieces and passes; a piece that adds a day is refused.
5. **The re-bid is placed by him, now; `stampForged` is untouched.** No stamp is borrowed from the cut leave.
6. **Swap and AM/PM replace the entry by its id.** AM → PM leaves one entry; the final state is checked before
   anything is removed, the chosen entry alone left out of the clash check; the other half's entry is never eaten.
7. **Every failed stage throws.** A refusal after the first stage of a swap, a move or a re-approval rolls the whole
   command back; nothing returns `false` after writing.
8. **The drag window and the range Decide gained nothing.** `warEditable`, `setBidStates`, `decidableIn`,
   `deletableIn`, `warLeaveRow`, `doorMoveApproved`, `doorRemoveApproved` are as they were; Inputs-filed leave is
   decided only by `decideApprovedById`, from the card.
9. **The OIL question is asked before a move, through `oilFirst({ kind: 'move' })`** — nothing cut before the answer,
   one command with it, nothing changed and no Undo step when closed unanswered.
10. **`OFF_WAR` / `offWar` are unchanged.** Every kind keeps its blue edge; a medical is refused by both new doors
    called directly; no `lwMoved` on leave the war never approved.
11. **A member's Undo after an admin decided his re-bid is refused, naming the admin** — never two approved days
    from one (D148).
12. **A set-hours leave is never turned into a bid.** Its member cannot move or change it on the war; an admin's
    move keeps its hours.
13. **One man out of a group is not a date cut.** `cutDates` / `sliceInput` copy the whole people list.
14. **The routing never shows an undrawn or half-built card.** An admin's approved-leave card waits for Q4; the
    states of step 9b open what they open today until he has seen them.
15. **"To review":** placed is judged across saved weeks, not the week in view; an unreadable saved week keeps the
    input listed; a view switches only together with its row Reject — Edit Schedule never has neither.
16. **The Inputs page itself is unchanged by Branch A** — its rules, its words, and that a member's change there
    stays approved.

### Round 1 dispositions

Each finding was checked against the code and the rulings before it was taken. ACCEPTED: applied as the reader asked.
CHANGED: the fault is real, the fix differs. REJECTED: with the evidence.

**Astra**

| # | Finding | Disposition |
|---|---|---|
| 1 | Nothing enforces "a member's change → pending"; the gate would accept a move that stays approved | **CHANGED.** True that the plan's own-input check does not hold it. But the gate cannot be made the guard: it sees changes, not pages, and the same change is a lawful Inputs edit (D1166; Opus H3, checked in `perms.ts inputBreach`). Held instead by the war's one door, by `moveRecords` sending a member there (H1), and by a shape check on the door's own two command types as a backstop. The stamp-tying point falls away: no stamp is inherited (H4). Astra's positive test — an ordinary Inputs edit still keeps leave approved — taken. Step 7 |
| 2 | AM → PM leaves both halves; a failed stage is not rolled back | **ACCEPTED.** Checked: `setCell` replaces `liveRequestsOn(list, portion)` of the **new** half (`store.ts` 3628); `gesture` (3337) rolls back only on a throw (`MoveRefusedAtCommit`). Step 6 is now `replaceEntry` — by id, final state first, any failure throws; steps 7 and 11 use it; the tests named |
| 3 | A course moved to a weekend skips the OIL question | **ACCEPTED.** Checked: the question is asked by the screens through `ui/inputedit.tsx oilGate` (932) before a save; the bare write does not ask; D783 / D804 / D831 put it first for a move. Step 4 asks it before anything is cut; K5 corrected |
| 4 | `cutDates` / `sliceInput` cut dates, not people | **ACCEPTED.** They copy the whole people list onto each piece. Step 16 now depends on the app's take-one-person-out path and applies date cutting only to his own input; tests widened; the fallback kept |
| 5 | "To review" judged by the week in view lists a request already placed on another week | **ACCEPTED.** `acc` is worked out when a week loads; `accCtl` (`html.ts` 2498–2511) already looks through saved weeks. T1 lifts that lookup; the Sunday–Monday test added; an unreadable saved week is not "unplaced" |
| 6 | The week could lose its only Reject between T1 and T2 | **ACCEPTED** (the same as Opus M1). Step T0 and the release rule: a view switches only with its row Reject, late mark and jump targets |

**The fresh Opus**

| # | Finding | Disposition |
|---|---|---|
| H1 | The move mode and the drag window would carry a member's approved leave as still approved, and hand the drag window new powers | **ACCEPTED.** Checked: every Move ends in `store.ts moveRecords` → `DOOR.moveApproved`, which re-files with `lw`. Step 7 rule 8; `absenceMovable` / `movableRecords` stay admin-only; §2a's drag-window row is now MUST NOT; tests per role; step 4's door is separate from `doorMoveApproved` |
| H2 | A member's Undo after an admin decided his re-bid must be refused | **ACCEPTED.** D148. The wrong test line is replaced by three cases, for move, swap and half change; the walk's item 8 |
| H3 | Two security tests cannot pass without breaking D1166 | **ACCEPTED.** Moved to the store's tests; the opposite pin added (an Inputs-page re-date is accepted at the gate); K2 and K4 rewritten. One addition of mine: a shape check on the war door's own command types, said to be a backstop, not a wall |
| H4 | Carrying the old placed stamp widens the gate and hides the re-bid | **ACCEPTED**, the plan's own fallback: the re-bid is placed by him, now; `stampForged` untouched. Checked: Approvals' New and its order read `placedAt`. "Also since you last looked" added to the roll-call and to step 7 for a deleted approved leave, drawn first |
| M1 | Edit Schedule would lose its only Reject | **ACCEPTED** — with Astra 6: step T0 |
| M2 | Q7 / R13 rest on a false fact | **ACCEPTED.** Checked: Ground Programme cells carry the waiting mark (`alAttr`, `html.ts` 598, 689); D1784 gave Unavailable "the same … as on a Ground Programme row". Q7 and R13 withdrawn; §1 and §2f corrected; the issued face pinned in T1 |
| M3 | The drawn "Placed by" line on b3, b4, b5 has no source | **ACCEPTED.** `placedfacts.ts` answers only for requests and `lw` leave. Step 13 adds the line from the Input's `by` / `at`, read as the Inputs page reads them |
| M4 | Step 4/5 miss the day-lock rule; `warLeaveRow`'s widening reaches three doors | **ACCEPTED.** `OFF_WAR` / `offWar` untouched, a new `warMayChange` question; step 5 widens only the decide door's entry; no `lwMoved` on leave never the war's (R17) |
| M5 | The command list must name every table written | **ACCEPTED.** Step 7 has its own two types naming the Input table; step 4's types name the bid and notice tables; the landing-on-a-bid tests added |
| M6 | The hidden switch is the planner's reading — his question | **ACCEPTED.** Now Q4 (it absorbs the old Q4 on AM / PM), with the device point; step 6's card waits for it |
| M7 | Undrawn states built without a drawing | **ACCEPTED.** Step 9b and step T0; until he answers each state opens what it opens today |
| L1 | A member's Delete on a past day is a reading | **ACCEPTED.** Marked in rule 2 and R3; folded into Q5; the published past day tested |
| L2 | Steps 1–2 should not wait; "share no file" is not quite true | **CHANGED.** Step 2 goes to its own small branch. Step 1 stays: D2927's own row says "built with the day window". The three shared reference documents named, the later merge bringing `main` in first |
| L3 | Step 10 switches the routing before the cards exist | **ACCEPTED.** Step 10 routes the empty day only; each later step moves its own states |
| L4 | Approvals' own "· by Saber" | **ACCEPTED.** Checked: it already reads "· by <name>" and "Already approved by <name>". In scope, no word changes, pinned in step 1, listed in §6 (w28) |
| L5 | Gaps in step 7's tests | **ACCEPTED.** OIL-kind swap by the member; the Delete-outcome posting (rule 9); the all-or-nothing several-day move |

**Count:** 22 findings — 20 accepted, 0 rejected, 2 changed (Astra 1, Opus L2).

### Round 2 dispositions

**Astra (round 2)**

| # | Finding | Disposition |
|---|---|---|
| 1 | The new command types' extra tables refuse the members they are for | **CHANGED.** Checked: `cmdAuthorize` (`perms.ts` 722–733) asks every extra table with the own-row rule 'never'; a member holds Input and Bid rights only as his own. The fault is real (round 1's M5 fix caused it). Fix taken: the simpler of the two — no extra-tables list on the four new types, as every member-run command has today; the tables named in a comment and in §11. Astra's own-entry extension of the list is a change to the gate's rules that nothing here needs. The positive member tests through the card and the grid's drop taken |
| 2 | A member's move of a set-hours leave cannot keep its hours as a bid | **CHANGED.** Checked: a bid holds only a code with a half mark (`engine/warrecs.ts RequestRec`). Adding hours to a bid would change what the app saves, which nobody ruled. Instead the member's set-hours leave has no Move or change on the war — Delete, remarks, Document and the pencil (step 7 rule 10, R5), drawn first; an admin's move keeps its hours |
| 3 | The backstop refuses the untouched pieces of a longer leave | **ACCEPTED** (the same as Opus M-2). The backstop judges what his approved leave covers; the four middle-day tests added |
| 4 | Step 4's "allowed (D1166)" test contradicts step 7 | **ACCEPTED.** That test is now a refusal on the war and a positive test on the Inputs page |

**The fresh Opus (round 2)**

| # | Finding | Disposition |
|---|---|---|
| H-1 | The new types refuse every member | **ACCEPTED** — its first fix (no extra-tables list); see Astra 1 |
| H-2 | Step 5 gives the drag window and the range Decide a new power | **ACCEPTED.** Checked: `setBidStates` is the drag window's call (`SelectSheet.tsx` 396) and asks `warEditable` (4116), as `decidableIn` (6477) and `deletableIn` (6494) do. Step 5 is now one id-based door for the card, `decideApprovedById`; the shared doors untouched; the pins added |
| M-1 | Rule 8's route through `moveRecords` is refused first and hides the command's type | **ACCEPTED.** Checked: a nested gesture returns `fn()` without its own commit (`store.ts` 3339). A card's Move calls the war door as a top-level gesture; `moveRecords` unchanged; steps 4 and 7 and K1 rewritten |
| M-2 | The backstop refuses a lawful split | **ACCEPTED** — with Astra 3 |
| M-3 | Step 4 named the ask-after door; the ask-first door exists | **ACCEPTED.** Checked: `ui/inputedit.tsx oilFirst` (1798), used by `ui/caldrag.ts`; its bar already reads "Not moved — OIL not answered". Step 4 wraps its door in it; w27 is no new word |
| M-4 | Step 11 builds what Q4's "meanwhile" says is not built | **ACCEPTED.** An admin's approved-leave card is built and routed only once Q4 is answered; until then such a day opens what it opens today; step 10, step 11 and Q4's "meanwhile" now say the same |
| L-1 | Four card looks were never drawn | **ACCEPTED.** Added to step 9b and to §8's drawing list; each opens what it opens today until he has seen it |
| L-2 | T1's unreadable-week rule contradicted itself | **ACCEPTED.** As `accCtl` does today: the input stays listed, its Accept refusing with its reason; a test |

**Count, round 2:** 12 findings — 10 accepted, 0 rejected, 2 changed (Astra 1, Astra 2). No finding needed his call;
the six questions are unchanged (only Q4's "meanwhile" was reworded). The drawing list grew from 8 to 12.

