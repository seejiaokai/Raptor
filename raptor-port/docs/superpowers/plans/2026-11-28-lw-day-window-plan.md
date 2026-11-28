# Build plan — the Leave War's day window (A2), "+ New period" first, and the schedule's "To review"

Written 28 Nov 26 by a fresh Fable planner (chat 198's helper). A plan only: no source file changed, nothing committed.
For: the Opus chat that builds it; Astra and a fresh Opus, who each red-team it blind.
Rulings read from the notes branch `origin/claude/leave-points-notifications-7a2f04` (not merged); code read on
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

**How it ships.** Two pieces, not one: the Leave War work on one branch (day window, the "Placed by" line, the period
list) and "To review" on its own branch, because it is a different part of the app with different tests. Each merges on
your "merge live".

**Questions that will come to you as the build reaches them** (section 8 has each, with what the build does until you
answer): the group-leave card ("3 pax · Cutter") has two of your rulings pulling different ways; what a member may do
to his approved leave on a day that is closed for bidding; whether a pending bid also needs the second tap to swap its
kind; whether an admin's AM/PM change of an approved leave follows his Auto-approve switch; and how "To review" looks
on Edit Schedule's week (only the Scheduler Board was drawn).

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
- D1784's "waits under Personal Inputs on the issued face, keeps its waiting mark on its own row": today the waiting mark
  is drawn on Unavailable rows only (`html.ts unavPendAtt` 2418; `board-html.ts` 736–742 says "never Personal Inputs").

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
| Drag window (`SelectSheet`), picked-days sheet | Auto-approve, Approve · Refuse, Move, Delete over several days | **MUST NOT change** layout (not drawn); CHANGES only through the shared rules: what is movable/deletable (steps 4–7) and the "Placed by" words |
| Mini pucks on a card (D2895) | none today | MISSING — `ui/NamePuck.tsx` reused |
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
| Auto-approve's memory | browser, per admin | HAS; the swap reads it even when the switch is not drawn (risk K3) |
| Balances (App bal, Pending, War bal — D1472) | derived from approved Inputs and requests | HAS; tests added that approved → pending → approved leaves the figures right |
| OIL: an OIL-kind leave swapped to LL or back | `engine/charge.ts`, the OIL ledger | HAS; walked and tested (it spends banked OIL) |
| Published / locked weeks | `sync.ts inputProtected`, `ui/inputedit.tsx protectedInput` | HAS in each existing door; every new door must ask the same (steps 4–7) |
| Undo / Redo | one command a gesture | HAS; every new door is one `gesture()`; `docs/undo-contract.md` gains its lines |
| Change history lines | `leavewar/changelines-lw.test.ts` | CHANGES: lines for the new events |

### 2c. Other places that show the same entries

| Place | Mark |
|---|---|
| The grid's boxes (`ui/Matrix.tsx`, `MatrixRows.tsx`) | MUST NOT change look; they re-read by themselves. Folded question 3 (a group's box) is hit — see §8 |
| Approvals (`ui/ApprovalsPage.tsx`) | HAS: a leave sent back to pending appears there and its count rises (D1152, D1208). CHANGES: nothing but, if it prints who placed, the "by" words (step 1 checks) |
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
| Member changes his own approved leave → pending | — | MUST NOT send any line: his own change tells nobody (3217) and admins are not told (D1208); Approvals' count rises instead |
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
| The waiting mark (D1784) | HAS on Unavailable rows only; on a Ground Programme row it is MISSING (reading R13, Q7) |
| Toasts and titles saying "Personal Inputs" (`board.ts` 1253; `html.ts` 2501–2502; `inputedit.tsx` 1288; `board-html.ts` 142, 839) | CHANGES (§6) |
| Admin → section order labels (`ui/AdminPage.tsx` 158, 185) | CHANGES (§6) |
| Undo's "a personal input" (`undo/describe.ts` 67, 502) | MUST NOT change: it names the kind of thing, not the section |
| A drop on a "To review" line (D2773) | MUST NOT be built here — it is [COMBINED-INPUT-ROWS]'s drop work; today a drop there does nothing |
| The 1536-wide overflow of "→ Ground" "→ Unavail" (`13-board-rows-responsive.css` 198, the fixed 92px column) | CHANGES: the two buttons stack, as t2 draws them |
| Issued (read-only) face of the Board (`board-html.ts` 142 "No personal inputs submitted for this day.") | CHANGES words only |

---

## 3. The rulings that apply

One line each. Full rows opened: D2880–D2892, D2895–D2898, D2921–D2927, D1552, D1187, D947, D1467, D1724, D1354, D2778, D2783.

**The window**
- D2926 — the build sheet's drawings are the drawings of record; built to them and checked beside them; folded questions asked as the build reaches each.
- D2887 — A2: manning line under the title; each entry a card with its buttons and its Remarks · till · Document; a leave's card its Duration and 8 leave buttons, its kind lit; no leave buttons on other entries; last row every day; Auto-approve only while leave can be placed.
- D2884 — changing a leave's kind is never only a tap on the leave itself; a control that can be seen stands with it.
- D2892 — the one pencil on a card only where the card cannot change everything: CSE, OD, OTH, Attach, a medical, any group entry, leave with custom hours — by kind, never by page; plain leave and bids none. Reading in the row: a member sees it only on entries he may change.
- D2889 — the entry's own input window opens over the war and closes back; no trip to the Inputs page.
- D2885 — ⋯ keeps Attach, Other, Post out, Post in; no other type added; a tap opens the war's window first.
- D2886 — an Inputs-filed entry keeps Move and Delete on the war. D2888 — not a medical.
- D1724 — every entry moved, deleted, its days and remarks changed on the war; the Inputs page's own rules hold (own entries only for a member; a published day waits for the next amendment; a clash refused with its reason).
- D2895 — every card shows its people as mini pucks, one man too. D2896 — on a group card pressing the man's name shows only his puck; "3 pax" all again.
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

**Two branches, not one.**

- **Branch A — `claude/lw-day-window-198`** (this one): the day window, the "Placed by" line, "+ New period" first.
  One area (the Leave War), one bug check sized by its riskiest change (who may change approved leave and saved
  Inputs): a **FULL** check — the walk at 402 and 1536 (plus 390 and 360 for fit), Astra, a fresh Opus, a fresh Fable
  beside them (high risk, D2255), and the security read (D1411).
- **Branch B — a new `claude/to-review-<n>`** cut from `main`: the schedule's "To review". A different area (the
  schedule), different files entirely (`src/ui/html.ts`, `board-html.ts`, `board.ts`, `interactions.ts`,
  `engine/inputs.ts`, the scheduler CSS) and about ninety test files that mention the section. Medium risk (it changes
  no permission and no saved shape, only what is listed where and where Reject stands): a **WALK** check with Astra and
  a fresh Opus read.

Why not one branch (D490 says related features share one): D490 groups **by area**, and D1087 says two to four related
jobs **of one area** share a branch. Put together, every fix to the war's permission work would re-walk the schedule,
and a fault in "To review" would hold back the day window. Apart, the two can be built by two chats at once — they
share no file. The only shared record files are the rulings and backlog, which merge without clashing.

**Inside Branch A, one piece may fall out:** the group card (step 16). If Q1 and Q2 are not answered when the rest is
walked and read, the branch ships without it — a group entry then draws as a card with its pucks and the pencil only —
and the group card follows on its own small branch. Say so to him if it happens.

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
- **Roll-call inside the step:** every caller — `DayList.tsx`, `BidPicker.tsx`, `ui/personleave.ts`, Approvals if it
  prints the line — looked at on screen at both sizes; at 360 wide the longer line wraps inside its card, never cut.
- **Permission / saved data:** none.

#### Step 2 — "+ New period" first (D2890) · low risk · parallel
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
- **Files:** `src/leavewar/state/store.ts` (`absenceMovable` 6230, `movableRecords` 6239, `moveRecordsProblem` 6303,
  `moveRecords` 6362, `recordTakeable` 4340, `changeAbsenceById` 4505 'removed', `clearCells` 3808, the `AbsenceDoor`
  interface 3015); `src/leavewar/sync.ts` (two new door functions beside `doorMoveApproved` / `doorRemoveApproved`,
  installed in `installAbsenceDoor` 332); `src/state/perms.ts` (`COMMAND_OPS`: two new command types, e.g.
  `lw.inputMove` and `lw.inputRemove`, each `op(T.input, 'U' | 'D', 'optional')`); `docs/data-model.md` §11;
  `src/leavewar/permsparity.test.ts`; `daycards.ts` (flip `move` / `del`).
- **Change:** for a **one-person** Input that is CSE, OD, OTH, Attach, a commitment under Unavailable, or leave without
  `lw` — never a medical, never an upchit, never SANS availability:
  - *Delete* cuts the tapped day (or all its days, by the card's chips — R4) out of the Input, by the same
    `cutDates` / `sliceInput` the door already uses.
  - *Move* picks it up into the grid's move mode as war leave is, and at the drop cuts and re-files the shifted piece.
  - Both run the **Inputs page's own checks**, called, not copied: `mayEditInput` / `mayDeleteInput`, `mayMovePlace` is
    not touched (where it stands is unchanged — a scheduler-moved input keeps `schedPlaced` and its place),
    `inputProtected` (a locked / published week: the Inputs door's rule — the change waits as a pending amendment, or is
    refused with the locked-week note, exactly as the Inputs page does for the same edit), the input gate's `vet`
    (leave over leave, leave over a medical → refused with its reason), another squadron's day ("This change could not
    be saved."), posting-out with the Delete outcome.
  - Leave without `lw` moved by an admin stays approved and stays without `lw` (it is still "filed on the Inputs
    page"); the war never sets `lw` on it.
  - A move is all or nothing: a refusal at commit rolls the whole command back (`MoveRefusedAtCommit`, as today).
- **Tests first** (new `src/leavewar/inputdoor-move.test.ts`, `inputdoor-remove.test.ts`, each case failing today):
  admin moves a one-day course; a middle day of a five-day course (it splits in three, remarks and documents on each
  piece); all five days; an OD onto a day holding leave (allowed — D1552) and leave-without-`lw` onto a day holding leave
  (refused, reason shown); an Attach; an Other under Unavailable; a scheduler-moved Meeting under Unavailable (moves, stays
  under Unavailable, `schedPlaced` kept); a rejected course (R8); onto a locked week; onto a published day (pending
  amendment, the issued face unchanged); onto another squadron's day; onto a posted-out day.
  **A medical: `move` and `del` false in the card model, and both doors refuse it when called directly** (ATT C, ATT B,
  HL, OML; `review-fixes.test.ts` 229's case too). Undo and Redo of each restore the Input byte for byte (iid, `by`,
  `at`, `acc`, `schedPlaced`, documents). The man is told once on his bell (the Inputs door's line), the actor never.
- **Permission checks:** a member on **his own** one-person course / OD / Attach / his own Other: allowed exactly where
  `mayEditInput` / `mayDeleteInput` say so (D1724: "a member changes only his own entries"); on another's row: refused
  in the card model, in the store, and at the gate (`inputBreach` — "another person's input"). A hand-made command of
  the new types from a member against another's Input is refused at the gate (written as a test, as
  `onerecord-perms.test.ts` does). An entry with **more than one person** is not movable or deletable here at all
  (step 16, Q2).
- **Saved data:** only Inputs change; no new field. `docs/data-schema.md` needs no change; say so in the step's commit.

#### Step 5 — an admin decides leave that was filed on the Inputs page (drawing b3) · HIGH · after 4
- **Files:** `store.ts` (`warEditable` 3978, `changeAbsenceById`, `setBidStates` 4116, `decideRequests` 4443);
  `sync.ts` (`warLeaveRow` 514, `decideApprovedWhy` 662, `doorDecideApproved` 968); `daycards.ts`.
- **Change:** `warLeaveRow` takes a one-person leave Input with or without `lw`, provided it is a whole day, a morning
  or an afternoon (a bid cannot hold custom hours — such a leave keeps its pencil and has no Approved / Refuse, R5).
  The lit "Approved" tapped again sends it back to pending; Refuse refuses it. The minted request's "placed by" is the
  Input's `lwBy`/`lwAt` where it has them, else its `by`/`at` (who filed it on the Inputs page). The period is the one
  holding the day; a day in no period is not on the grid, so cannot be reached.
- **Tests first:** admin sends back an Inputs-filed LL (whole, AM, PM, a middle day of a several-day leave → it splits,
  the other days stay approved); refuses one; approves it again → it comes back as war-approved (`lw` set — the war
  approved it now), remarks, till and documents intact; balances (App bal, Pending, War bal) right at each stage; the
  man's bell: "put back to a bid", "refused", "approved again"; Undo of each; a locked week refuses with the door's
  words; a custom-hours leave offers neither button and the door refuses it called directly.
- **Permission:** admin only (`canDecide`) — a member's call refused in store and gate (`lw.decide` is `bid:U` 'never'
  for a member already; pinned).

#### Step 6 — an admin swaps the kind, or changes the half, of approved leave (D2897, D2923, D2925) · HIGH · after 5
- **Files:** `store.ts` (new `retypeApproved(personId, date, iid, code, approveAfter)`; `decisionTells` 3201 — two new
  events); `sync.ts` (reuses `doorDecideApproved` then `doorApprove` inside one `gesture`); `state/notices.ts`
  (two new line templates, §6); `daycards.ts`.
- **Change:** one command: the leave's days (the tapped day, or all — the card's chips) go back to a request carrying
  remarks, till, documents and the placed stamp; the request is re-typed (`setCell`'s own replace, which keeps them);
  then, **if the admin's Auto-approve memory is on**, approved again in the same command; if off, it stays pending
  (D2925). A change of half (Whole day → AM, AM → PM…) is the same path (reading R6, Q4). The store takes
  `approveAfter` as an argument — the window reads the switch's memory, as it does for a placement today.
  Refused where the new kind cannot stand: the other half already holds leave of another kind? — allowed (two halves may
  differ, as today); a balance below zero asks its own second tap as a placement does (`ui/belowzero.ts`).
- **Tests first** (`src/leavewar/retype-approved.test.ts`): LL → OL whole day, switch on: one Input, kind OL, the same
  remarks and documents, a new approver stamp, the placer kept; switch off: a pending OL bid, the Input gone; LL → OIL
  and OIL → LL (the OIL ledger and War bal right, nothing of OIL lost — D25); Whole day → AM (the afternoon freed, the
  balance back by .5); one day of a five-day leave swapped (splits; D1346: nothing joins by itself); one Undo puts back
  the exact Input; the bell line once, naming the admin; a locked week refused whole (nothing half done); the swap of a
  leave filed on the Inputs page (step 5's widening) the same.
- **Permission:** `canDecide`. The command type stays `lw.decide` (admin's) — no new gate path.

#### Step 7 — a member changes his own approved leave (D2898, D2922, D2925) · HIGHEST · after 6
The one step that widens what a member may do. Keep it the narrowest possible.
- **Files:** `src/leavewar/engine/access.ts` (one new exported question, e.g.
  `canChangeOwnApproved(role, viewer, personId)` — a member on his own row; it does **not** touch `canDecide`);
  `store.ts` (new `ownApprovedProblem(personId, date, iid, what)` and three entry points used by the card — delete,
  move, change (kind or half) — each a single `gesture` of type `lw.edit` / `lw.move`, which a member already may send
  for his own row); `sync.ts` (the door functions take "the member himself" as well as an admin: today they are
  reached only behind `canDecide`); `src/state/perms.ts` (the gate, below; `COMMAND_OPS` unchanged if `lw.edit` /
  `lw.move` are reused — confirm the Input change inside them is judged by `inputBreach` as his own input);
  `docs/data-model.md` §11 (a new row: "a member — his own approved leave: delete; move / change → pending");
  `permsparity.test.ts`; `daycards.ts`.
- **Rules (each a test):**
  1. His own row only; the leave is a one-person leave Input of his (with `lw` or filed on the Inputs page).
  2. **Delete**: cuts the day(s). Allowed on any day the Inputs page would let him delete it (D2922: "deleting it
     simply removes it"; he can do the same there today) — a closed day and a past day included; a locked / published
     week by the Inputs door's rule.
  3. **Move, half, kind**: the leave becomes his **pending bid** on the new day / half / kind, in one command; never
     approved, whatever any switch says (a member has none). It carries remarks, till, documents and the original
     placed stamp.
  4. A move or change is allowed **only where he may bid today**: the day it lands on (and, for a half or kind change,
     the day it stands on) is open for bidding and not before today (`canBidOn`) — reading R3, Q5. Elsewhere the
     buttons are not offered and the card says where it is changed (words §6, w9); the store and the gate refuse it.
  5. Remarks and Document alone never un-approve (as today — `LeaveWords`).
  6. Kind: the second-tap line first (D2923), then the swap → pending (D2925).
  7. No bell line to anyone (his own change; D1208). Approvals' count rises; the Approvals line shows it as any bid.
- **The gate (`perms.ts` 3619–3640), the part to read hardest:** a member's command now (a) deletes or shortens his own
  Input — already his (`inputBreach`), and (b) writes a request on his own row whose "placed by" may name **someone
  else** (an admin placed and auto-approved it). `stampForged` accepts only his own stamp or one a before-image of the
  same command's `lw.cell` vouches for. **Widen it by exactly one case:** the stamp equals the `lwBy`/`lwAt` (else
  `by`/`at`) of a leave Input **of his own that this same command cuts**. Nothing else: no decided stamp, no other
  person's row, no stamp from an Input the command does not cut. The closed-day rule (`LW_DAY_OPEN`) is **not**
  widened: rule 4 keeps him to open days, so the gate's existing refusal "a war day not open for bidding" stays the
  backstop.
- **Tests first** (`src/leavewar/own-approved.test.ts`, and a security file `own-approved-sec.test.ts` written as
  hand-made commands, the way `m4sec.test.ts` and `sec147-read.test.ts` do):
  - the worked case of D2922: Ranger's approved LL on Thu 3 Dec; he moves it to Fri 4 Dec → no Input on the 3rd or 4th,
    a pending LL bid on the 4th placed by whoever placed it first; App bal up by 1, Pending up by 1, War bal unchanged;
    Approvals lists it; an admin approves → "approved again" on his bell; one Undo by Ranger puts the approved leave back.
  - Whole day → AM; LL → OL (second tap); delete; each on war-approved leave and on leave he filed on the Inputs page.
  - Refused, with nothing changed: another man's approved leave (card, store, gate); a hand-made command that keeps the
    leave approved after his move; one that mints an **approved** Input for himself; one that mints a request with a
    forged placer not vouched by the cut Input; one that cuts another man's Input; a move onto a closed day, a past day,
    a day held by leave or a medical, another squadron's day; a locked week; a group leave he is in (not his own —
    `mayEditInput` false).
  - Redo by him; an **admin's** Undo of the member's step is refused or allowed exactly as the timeline's `mayReverse`
    rules say today (D148: Undo is the signed-in person's own changes) — pin what it does.
  - A member whose leave was approved, then his dates closed: Move, Duration and the leave buttons are not offered;
    Delete is; the card's line w9 shows.
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

#### Step 10 — the new window's frame and the routing (b1, the title bar, Auto-approve) · after 9
- **Files:** new `src/leavewar/ui/DayWindow.tsx` (+ `daywindow.test.tsx`); `ui/Matrix.tsx` (3684–3790 and the mounts at
  4400, 4423, 4793); `ui/bidpicker.css` (the card: the drawing script's `.rd-card` values — background #1b2027,
  radius 11, the header's rule moved under the manning line); `ui/DayLine.tsx` (placed under the title).
- **Change:** `DayWindow` = title (drag handle, name, date, Auto-approve where `autoApprove`, ✕) → manning line → the
  cards → the add part where `add` → the last row. `Matrix.tsx` opens it wherever today it opens `BidPicker` on one day,
  `DayListSheet`, or `RemarksSheet`. **Left exactly as they are** (R1): `ClosedNoteSheet`, the read-only schedule sheet
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

#### Step 11 — the leave card: a pending bid and an approved leave (b2, b3, b3o1) · after 10, 6
- **Files:** `ui/EntryCard.tsx`, `ui/DayWindow.tsx`, `ui/belowzero.ts` (the second-tap pattern reused, not copied),
  `ui/bidpicker.css`; tests `ui/daywindow-leave.test.tsx`; the tests that pin today's one-tap re-type
  (`ui/wholeleave.test.tsx` 216–222, `ui/leavebuttons.test.tsx`, `ui/doubletap*.test.tsx`) are **changed on purpose** —
  name each in the commit.
- **Change:** heading "Pending · Whole day" / "Approved · AM" / "Refused · PM" (Fable's "AM", taken); the puck line;
  "Placed by…"; the action row in the fixed order Approve · Refuse · Move · Delete; Remarks · till · Document; Duration
  with the card's half lit; the eight leave buttons with its kind lit and ringed.
  - **Second tap (D2923):** another leave button tapped → the line (w1) appears just above the leave buttons (where the
    below-zero line stands, D2031), the tapped button armed; the same button tapped again → the swap (step 6 for
    approved, `setCell` for a pending bid — Q3); any other tap clears the arm. If the swap would also take a balance
    below zero, the below-zero line replaces the first line and asks its own tap (reading R7) — never two lines at once.
  - **Duration on the card** changes the entry's half (step 6 for approved leave; for a bid, today's `setCell`).
  - "Pick a range" on a one-day leave's card works as it does today in the one-day window on a bid.
- **Tests first:** each control present/absent per role; the armed state survives a re-render and is dropped on close;
  a quick double tap on OL never swaps (it arms, then swaps only if the second tap is on the same button after the line
  is shown — the double-tap guards of `ui/doubletap.test.tsx` extended); remarks typed and not yet left ride with the
  action (`flushRef`, as `DayList.tsx` does); buttons' words stay inside their edges at 360 with an iPhone's wider
  letters ("Delete — sure?" on two lines, D1387).

#### Step 12 — mini pucks on every card (D2895) · parallel with 11
- **Files:** `ui/EntryCard.tsx`, `ui/NamePuck.tsx` (reused), CSS. **Tests:** one puck on a one-man card, in the place
  the group's row stands (under the heading, above "Placed by"); the puck is the name column's own (seat colour, CAT
  chip, a SANS man's purple edge); a person the war has no row for (a SANS man while SANS is off) still draws
  (`warIdentityIfHidden`).

#### Step 13 — the other cards: course, OD, Other, Attach, medical, OIL (b4, b5, b6) · after 10, 4
- **Files:** `ui/EntryCard.tsx`, `ui/ReqWords.tsx` (`LeaveWords` widened to any one-person Input the reader may edit —
  remarks, till, documents saved through `ui/inputedit.tsx setLeaveRemarks`' door, which already asks `mayEditInput`),
  `daycards.ts`; tests `ui/daywindow-kinds.test.tsx`.
- **Change:** CSE / OD / OTH / Attach / a commitment under Unavailable: heading its half or hours ("Whole day", "AM",
  "09:00–14:00"; an Attach its "To" first, as today's line), Move · Delete (step 4), Remarks · till · Document, the
  pencil; **no** Duration, **no** leave buttons, **no** Approve / Refuse. A medical: heading, Document (add or see —
  D1150), the pencil; nothing else (D2888). OIL award: Edit… · Delete as built, its editor opening in place as today;
  schedule-earned OIL: no buttons. The add part follows the cards where D1552 / D2924 keep leave placeable (over CSE,
  OD, OTH, Attach), with **its own Remarks row gone** where a card stands above it (the drawing's v1.1 note: a second
  empty Remarks box read as doubled — a new leave's remarks are typed on its card once placed).
- **Tests first:** per kind and role, exactly the drawn controls; a medical card has no Move/Delete for an admin, the
  man himself or anyone; the read-only reader (a member on another's course) sees the card, its remarks read only, no
  buttons, no pencil; b6's order — the award's card, then the bid's.

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

#### Step 16 — the group card (b7, b7b; D2895, D2896, D2778) · LAST · needs Q1, Q2 · may ship separately
- **Files:** `ui/EntryCard.tsx`, `daycards.ts`, `store.ts` / `sync.ts` (the doors of steps 4–6 taking a whole group, and
  taking one man out — the split `cutDates` / `sliceInput` already do for a person), `state/perms.ts` if a new command
  type is needed, the bell (each man told once).
- **Change, as drawn:** every man's puck; "Change" then "3 pax" (lit) and the tapped man's name; the pencil; Approved ·
  Refuse · Move · Delete; Remarks; Duration; leave buttons. With "3 pax" lit a change is for everyone in the group
  (D2778: "a box moved moves the leave of everyone in it"); with the man's name lit only his puck shows (D2896) and the
  change is for him alone — he is taken off the group and given his own leave (D2778). **When** he leaves the group —
  at the press (D2783) or at the change (what D2896's "3 pax shows all again" implies) — is Q1.
- **Until Q1 and Q2 are answered the build does this:** a group leave's card shows its pucks and the pencil (for whoever
  `mayEditInput` allows — an admin; never a member in a group he did not file), its remarks and documents read only, and
  **no** Change line, Move, Delete, Approve / Refuse, Duration or leave buttons. Nothing can then be changed for one man
  or for all from the card by mistake; everything is still reachable through the pencil, for everyone, as the Inputs
  page does it today.
- **Tests first (once answered):** a change with "3 pax" touches every man's days, one command, one Undo, each man told
  once; with the man's name only he changes and the others' Input keeps its iid, remarks and documents; a member in the
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

#### Step T1 — what the section lists · medium
- **Files:** `src/engine/inputs.ts` (new `listedToReview(inp)` beside `listedPersonal` 713 — personal or an OD out, and
  **not** placed: `acc` is 'r' or unset, and no row of it stands on a programme of the week in view); callers
  `src/ui/html.ts` 2315, `src/ui/board-html.ts` 818; the counts in the folded heading (`html.ts` 2240–2246,
  `board-html.ts` 827–831).
- **Tests first:** an accepted input (`'g'`) is not listed; a rejected one is; one under Unavailable (`'u'`) is not;
  an input whose row stands on another day or week is not (R12); the "+ Inputs" duplicate fallback (unplaced) is; the
  count in the heading counts only what is listed. `listedPersonal` itself is kept for every other reader until each is
  looked at (grep its callers — OIL crowd, late marks, pending list — and decide one by one; do not rename it blind).
- **Saved data / permissions:** none — `acc` and `schedPlaced` are written exactly as today.

#### Step T2 — Reject on the placed row · medium · after T1
- **Files:** Board: `src/ui/board-html.ts sbGrRowHTML` 594–623 (and the Common Programme's row builder near 203) —
  the existing Reject button of `accCtl` (`html.ts` 2481–2528) reused, placed before the remarks box as t1 / t2 draw it;
  phone: on the puck line (D947), `13-board-rows-responsive.css` 890–896. Edit Schedule: `html.ts grRowHTML` 2463 /
  `plRow` 804 and `09-week-responsive.css` 288 — **see Q6: not drawn**. Clicks: the existing `[data-acc]` handler
  (`src/ui/interactions.ts` 1052–1190) — no new handler.
  The LATE mark, the late-input chip and the jump targets move with the row: `src/ui/pendlist.ts` 209–226,
  `interactions.ts` 175–185, `src/ui/boardland.ts` 283–296.
- **Tests first:** every Ground / Common row whose `src` is an input has Reject; a hand-made row has none; pressing it
  does exactly what today's Personal Inputs Reject does (`unacceptInput`, `acc 'r'`, the move marked — D1388), the row
  leaves the programme and appears under "To review" with Accept / → Ground / → Unavail; the Board's ✕ still rejects
  (left as built); a jump from the changes window lands on the row; a LATE input shows its mark on its row.
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
  the Board: Q6); `13-board-rows-responsive.css` 198 and `14-input-editors.css` 136–141 (the control cell stacks
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
- Inside B: T1 first; T2–T4 touch the same two builders — one chat.

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
| w8 | a group entry's card until step 16 is in | — | draft: "For all 3 — open it with the pencil." (shown only while the group card's buttons are held back) |
| w9 | a member's approved leave on a day he may not bid on (closed, or before today) | — | draft: "Bidding is closed on this day. You can delete this leave here, or change it on the Inputs page." |
| w10 | bell, an admin swaps the kind of a man's approved leave | — | draft: "LL changed to OL" (+ the day run and who, as every war line); pending after it: "LL changed to OL · pending" |
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
  `access.ts` (never loosening `canDecide`), the store refusing, the gate refusing hand-made commands, and the security
  read.
- **K2 — the gate's stamp rule.** Widening `stampForged` by one case is the kind of change that goes wrong quietly. If
  the builder finds it cannot be written as narrowly as step 7 states, stop and say so — the fallback is that a
  member's re-bid is stamped as placed by **him, now** (no widening at all), which changes what the card's "Placed by"
  line shows after his change. That is a visible difference; it would go to the owner.
- **K3 — Auto-approve decides without being seen.** On a day held whole by a leave the switch is not drawn (D2887), yet
  an admin's swap follows it (D2925). An admin who turned it off last week swaps LL to OL and the leave silently goes to
  pending. As ruled and drawn; the walk pictures it and the report names it to him.
- **K4 — the two pages differ on purpose** (D2922 against D1166). A reviewer will call it a bug. It is not: brief the
  readers.
- **K5 — one Input, many readers.** Cutting a day out of a five-day course from the war changes the schedule's
  Unavailable rows, crew counts, published days and OIL questions. Every new door goes through the Inputs door so those
  follow by themselves — but each is walked, published weeks above all.
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
  it a bid, and a member places no bid on a closed day (D1177) or a past one (D1211). → Q5.
- **R4 — several-day entries keep today's two chips** ("All 5 days" · "Wed 16 Dec") on the card, scoping every button.
  *Example: a five-day course, Wednesday tapped, "Wed 16 Dec" lit, Delete → the course becomes Mon–Tue and Thu–Fri.*
  The drawings show only one-day entries.
- **R5 — leave with custom hours** (say 10:00–15:00, filed on the Inputs page) gets the pencil, Move, Delete and its
  remarks, but no Approve / Refuse, Duration or leave buttons — a bid can hold only a whole day or a half.
- **R6 — an admin's AM / PM change of an approved leave follows his Auto-approve switch**, as his kind swap does
  (D2925 names only the swap). *Example: Hex makes Cutter's approved whole-day LL an AM leave; switch on → approved AM
  leave; switch off → a pending AM bid.* An admin's **Move** keeps it approved, as built and tested today. → Q4.
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
- **R13 — the waiting mark** (an input filed after its day was published) is drawn on the placed row on the working
  copy, as D2883's row reads; today the code draws it under Unavailable only, so on a Ground Programme row it is new.
  → Q7.
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
8. **Undo / Redo** of every new step, by the person who did it; the bell's "taken back".
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
| D2883's readings — Edit Schedule's look, the waiting mark | steps T2, T4 | see Q6, Q7 |

### New questions the plan raises (the host puts each to him when its step is reached, each with a picture and a worked example)

- **Q1 (step 16) — when does Cutter leave the group?** D2783 (27 Nov): the moment "Cutter" is pressed. D2896 (28 Nov):
  pressing "Cutter" shows only his puck, and "3 pax" shows all three again. Both cannot hold. Recommended: the press
  only chooses whom the next change touches; he leaves the group when a change is actually made for him. Also confirm,
  once, that the war's group card sets aside D2778's "no 'his only' choice" (the build sheet says it is built in).
- **Q2 (steps 13, 16) — Move and Delete on a group's course or OD** (folded D): for everyone, or not from the card?
- **Q3 (step 11) — a pending bid: one tap or two to change LL to OL?** The rulings say a leave is no longer re-typed by
  one tap in the day window; the build sheet's caption under the pending bid still says "in one tap". Meanwhile: two
  taps for every leave card, pending or approved — one habit, and nothing swapped by a slip.
- **Q4 (step 6) — an admin's AM / PM change of an approved leave**: follows his Auto-approve switch (as his kind swap,
  recommended) or always stays approved (as his Move does)? Meanwhile: follows the switch.
- **Q5 (step 7) — a member's approved leave on a day closed for bidding, or already past**: may he only delete it on the
  war (recommended; a change is a new bid, and he cannot bid there), or also move and change it? Meanwhile: delete only,
  with the line saying where to change it.
- **Q6 (steps T2, T4) — "To review" on Edit Schedule's week was not drawn** (only the Scheduler Board). Recommended: a
  drawing of the week at both sizes first (D1625) — Reject on the row's puck line, an empty section showing its heading
  and "none" as the Board does. Meanwhile: Branch B builds the Board and the shared rule first and holds the week's
  Reject until he has seen it.
- **Q7 (step T2) — the waiting mark on a Ground Programme row** for an input filed after its day was published: today
  the mark exists only under Unavailable. Draw it on the Ground row (recommended, as D2883's row reads), in the same
  look? Meanwhile: no mark added; the row behaves as today.
- **Not a question, told to him:** an admin can now refuse or send back a leave that was filed on the Inputs page (the
  drawing b3 shows it); and Auto-approve, when hidden, still decides what a swap does (K3).

---

## 9. Closing the build (for the builder's report)

- Rulings to move from "not built" to built, each by a test that holds it whole: D2887, D2892, D2889, D2886, D2888,
  D2895, D2897, D2923, D2925, D2898, D2922, D2924, D2927 (Leave War page, §The bid windows and the day's list and §Not
  built yet — the [LW-FULL-EDITING] line); D2890 (the built list, line 179); D2883 (scheduler page). D2896, D2783,
  D2784, D2778 only if step 16 ships.
- Backlog: [COMBINED-INPUT-ROWS] (its day-window and "To review" parts — the combined row under Unavailable and the drop
  rule stay open), [LW-FULL-EDITING] (closed by steps 4, 13–15, bar a medical), [LW-PERIODS-MANAGE] ("+ New period" done;
  delete / archive open), and the fault found in passing (the 1536 overflow, step T4).
- The reads owed: Astra, a fresh Opus, a fresh Fable and the security read on Branch A; Astra and a fresh Opus on
  Branch B; the words of §6 by a fresh Fable before his look.
