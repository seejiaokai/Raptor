# Leave War small fixes — the scenario list (30 Oct 26)

The independent scenario designer's list for the batch of four: `[LW-DELETED-NO-ROW-APPROVE]`, `[LW-HALF-DAY-WORDS-LEFT]`,
`[LW-M1-READ-LEFTOVERS]` part (2), `[LW-MONTH-MEMO-UNPINNED]`. Written against `origin/main` as it stood on 30 Oct 26. It
asks what is MISSING — surfaces, states, orders, roles — not whether the code is wrong. No code was changed.

**Not a finding (D56):** harm that lives only in data already stored, where the code is already right going forward. None of
the scenarios below is of that kind; each is reached through the app's own controls on a fresh demo world.

Sign-ins: admin `ad` / `a` (Saber), member `us` / `us` (Ranger). An admin-added account takes any password. **The admin's
"Auto-approve" is ON by default (D1147, D1186, D1463): his own bid lands APPROVED.** Every fixture below that needs a
*pending* bid placed by the admin first turns Auto-approve off in the window's title bar (remembered, D1302 — turn it back on
at the end), or has the member place it.

## 0. What `main` already holds — read before building

Three of the four items look partly or wholly built on `main` already, with their backlog text not updated. The builder
should confirm each in the running app (the scenarios below do that) before writing anything new:

- **Fix 3 is built** (23 Oct 26, "M3 folded items…"): `leavewar/inputgate.ts apply` now hands "This replaces … on the
  Leave War" to the command as a deferred effect, which a refused command throws away; pinned by
  `leavewar/memberclash.test.ts` ("said only once the filing lands"). What is left is to prove it at every filing door
  (§3) and then archive the part.
- **Fix 4's guard is built** (same commit): `MatrixRows.tsx sameMonth` / `sameDays` compare one person's slices and a
  month's own days, and `evKind` / `lockedCols` are memoised on what they read; pinned by `matrix-rows-memo.test.tsx`
  ("one bid redraws only its own month"). **But its premise broke two days later.** The guard's comment says "a cell
  reads its own day and nothing of its neighbours". His D1359 joined bar (built 25 Oct 26, after the guard) made every
  cell read its neighbours: `joinClasses` reads the day before and after — and two days away — **across a month's edge**,
  and `entryKey` reads the store's records (`recordsAt` → `reqRunKey`: code, state, **remarks, till tick, documents**),
  none of which the guard compares. §4's top scenarios are aimed exactly there.
- **Fix 2 (2) looks built**: `BidPicker.tsx leaveOn` seeds the Duration row from the day's leave (D1331). §2b checks it
  in each state.
- **Fix 2 (1) is open, and wider than the item says.** `sync.ts notationOf` prints the OLD stored grammar (`*HO` =
  morning, `HO*` = afternoon) and is used by the clash note — so a morning credit reads "*HO" and an afternoon one "HO*"
  where the star means "afternoon", not "the app credited it" (D1306). The same note prints a half-day leave as "*LL" /
  "LL*", which the grid no longer draws anywhere (D1160, D1402). And a surface the item does not name prints a credited
  HO with no star at all: the "OIL the app credited" sheet's title line (`BidPicker.tsx`, the `raptor-sheet`) uses
  `displayCell(code)` without the credited flag — "<HO · approved". **Warning for the build:** `notationOf` is ALSO the
  stored grammar's writer — a send-back builds the new request's code from it (`doorDecideApproved`), the bell keys
  war-approved halves by it (`warLeaveNow`), and Approvals' "Also since" lines feed it to `boxText`. The fix belongs in
  what the clash note and the sheet PRINT, never in `notationOf` (S2-9 pins that).
- **Fix 1 is open.** The existing deleted-man refusal and its words, in `sync.ts approveWhy`:
  `if (postedOutBy(it.personId) === 'gone' && !(kept && outcomeOf(kept) === 'delete' && kept.poDone)) return 'Posted out — refuse or delete it'`
  — the words are **"Posted out — refuse or delete it"** (kept by his D1447, reading R21). `PEOPLE[id].deleted` is set by a
  Delete POSTING that has run as well as by Admin → Users, so a new check on `deleted` alone would refuse the days before a
  Delete posting's date, which D1447's R20 approves (S1-2).

## 1. Fix 1 — a deleted man's leftover bid is never approved

### 1a. Roll-call: every door that approves a war bid × every kind of man

Every door below reaches `doorApprove` → `approveWhy` (the Approvals list also asks `approveWhy` first, through
`store.ts decideWhy`), except Undo / Redo, which replay a recorded command and ask nothing.

| Door | Where it is | Never-arrived man, deleted on Admin → Users | Man deleted on Admin → Users after arriving | Delete POSTING that has run | Delete posting not yet run | Archived (Admin → Users) | Posted out as SANS | SANS man, SANS off | Ordinary man |
|---|---|---|---|---|---|---|---|---|---|
| Approvals' Approve | Approvals tab, desktop and phone | MISSING today — must refuse, "Posted out — refuse or delete it" | refuses (R3-6) — must still | days before the date approve; from the date "He posted out on <date>: refuse or delete it" (D1436, D1447 R20) | from the date "He posts out on <date>: refuse or delete it" | from the archive date refused, before it approve (D323, D1436) | approves (D283, D1436) | approves — must not be refused (no row, no record) | approves |
| Approvals' Approve all | same | same, its line answers for itself, the rest go through, one Undo | same | same | same | same | same | same | same |
| Approvals: Refused → Approve (D1428) | a decided line | must refuse as above | must refuse | as above | as above | as above | approves | approves | approves |
| The bid window's Approve | grid tap | no row: NOT REACHABLE — has it / must not, because he has no row | reachable on his kept months (D299) — must refuse | reachable on days before the date — approve | reachable | reachable | reachable | not drawn (SANS off) | approves |
| The bid window's leave button with Auto-approve on (place-and-approve, D1422) | grid tap | not reachable | his kept past days: D321 says leave may still be added on a deleted man's past days — what happens is the host's reading (S1-7) | — | — | — | — | — | approves |
| The day's list's Approve | a day with two entries | not reachable | must refuse | as row 1 | as row 1 | as row 1 | approves | not drawn | approves |
| The drag window's Approve over a selection (several men) | drag | not reachable | must refuse, his name beside the reason (R3-4 `whyOf`) | as row 1 | as row 1 | as row 1 | approves | not drawn | approves |
| Undo / Redo that re-approves | top bar | MISSING — no check runs (S1-6) | same | — | — | — | — | — | — |
| A posting's own pass | runs on the date | approves nothing — has it / must not, because it only removes and marks | — | — | — | — | — | — | — |

Readers that must agree with the refusal: the Approvals tab's count and "+n in JAN – DEC 27 ›" (both count every pending
line, `approvals.ts linesOfWar`, roster or not); the line's name (callsign read by `store.ts csOf` — roster, kept record,
then the war's label); a tap on the line's dates (D1231 — opens the Grid at the day; a man with no row has no cell to ring).

### 1b. Scenarios

**S1-1 · the item's own case — a never-arrived man, deleted, his bid approved. Rank 4.** Admin, desktop. Admin → Users →
New person "NEWBY" (pilot, on the roster), post-in date about a month ahead (e.g. 1 Dec 26). Leave War Grid, his row, a day
a week before the post-in (e.g. 23 Nov 26): the Post in sheet → "Place leave or OIL here instead…" → Auto-approve OFF → LL.
Assert the box is hollow and dashed (pending) and Approvals' count rose by 1. Admin → Users → NEWBY → Delete (tap twice).
Leave War → Approvals.
- EXPECTED: his line is still listed (the count still includes it); Approve is refused with **"Posted out — refuse or
  delete it"** (the existing words — D1447 R21); no leave input is written for him (Inputs page, that day: nothing for
  NEWBY); Refuse works (D1436: "Refuse still works").
- DISPROVED BY: the line turns "Approved"; or an LL for NEWBY appears on the Inputs page or the Inputs calendar for 23 Nov;
  or the refusal reads in other words; or Refuse is refused too.
- Also RECORD exactly (the host's reading): what name the line shows, and whether "refuse or delete it" can be followed —
  a man with no row has no cell to delete the bid from. If Refuse is the only way, say so in the evidence sheet as an open
  question for him.
- Phone (402 wide): the same refusal, its words on one line or wrapped whole (D1441's buttons stay their size).

**S1-2 · a Delete POSTING that has run keeps D1436's one date rule. Rank 3.** Admin, desktop. Ordinary man (e.g. Drifter):
Auto-approve off; pending LL on a day already past (e.g. 26 Oct 26 — an admin may bid past days, D1211) and on a day
ahead (e.g. 10 Nov 26). Post him out with "Delete", dated today (the date tapped twice, D1102) so the posting runs now.
Approvals.
- EXPECTED (D1447 R20, D1436): the 26 Oct line approves; the 10 Nov line is refused "He posted out on <date>: refuse or
  delete it" (past tense — the posting has run). This is the carve-out R3c-1 — a check on `PEOPLE[id].deleted` alone would
  refuse both.
- DISPROVED BY: the 26 Oct line refused with "Posted out — refuse or delete it".

**S1-3 · a Delete posting set, then the man deleted on Admin → Users before its date.** Admin. Ordinary man with pending
LL on a past day and a future day; Post out → Delete dated two weeks ahead (not run). Then Admin → Users → Delete (twice).
Approvals.
- EXPECTED (D1447 R21 — a man deleted on Admin → Users keeps the refusal whole): BOTH lines refused, "Posted out — refuse
  or delete it". DISPROVED BY: the past day approving because a Delete outcome is on his record.

**S1-4 · a SANS man with SANS off must still approve — the reader's warning. Rank 6.** Admin. ⚙ Settings → "+ SANS" (D1221)
→ a SANS man's row shows; Auto-approve off; pending LL on an open day. ⚙ → the SANS group's ✕ (SANS off): his row goes.
Approvals → Approve.
- EXPECTED: approves (no rule refuses a SANS man; D1215 only hides him); an LL input for him appears on the Inputs page.
- DISPROVED BY: any refusal — the sign of a check written as "no row and no record".

**S1-5 · Approve all over a mixed list.** Admin, phone and desktop. With S1-1's NEWBY line, S1-4's SANS-off line and an
ordinary man's pending line in one period: Approve all (arm, then tap — D1431).
- EXPECTED: the ordinary and the SANS lines approve; NEWBY's stays, refused with its words on its own line (M4 8.3 — "an
  inner refusal never sinks Approve all"); one Undo takes back both approvals and nothing of NEWBY's.
- DISPROVED BY: Approve all doing nothing, or approving NEWBY, or two Undo steps.

**S1-6 · Undo / Redo putting back an approval for a deleted man. Rank 7.** Admin. Ordinary incoming man (post-in ahead),
pending LL before his post-in. (a) Approvals → Approve (it approves — he is not deleted yet). Undo (back to pending). Admin
→ Users → Delete him (a delete is not an Undo step — D350). Back on the Leave War: Redo. (b) Approve; second tap on the lit
"Approved" (back to pending, D1421); delete him; Undo.
- EXPECTED: the host's reading — RECORD exactly what the top bar's Redo / Undo do and say. The promise is "a pending bid
  left from before his delete is not approved, in every door" (R3-6, D1447 R21); a step that writes the approved leave back
  for a deleted man breaks it. If either does, it is a finding for the build (a refusal in the restore check, as D1263's
  `verifiedWarRestore` does for a member), not stored-data-only: it happens to new data.
- DISPROVED BY: an LL input for the deleted man on the Inputs page after the step.

**S1-7 · a man deleted after arriving — the existing refusal in every door it can be reached from.** Admin. Ordinary man
with a pending LL on a past day of his (e.g. 20 Oct 26); Admin → Users → Delete. Leave War grid: his months before today
still drawn (D299)? Tap the 20 Oct box.
- EXPECTED: bid window's Approve refused "Posted out — refuse or delete it" (R3-6); the same in the day's list (give the day
  a second entry first, e.g. an HO award) and in the drag window over 20–21 Oct with another man's bid in the selection
  (his name beside the reason, the other man's approved). And: with Auto-approve ON, a new LL placed on one of his kept past
  days — D321 says leave may still be added on a deleted man's past days: RECORD whether it lands pending, is refused, or
  lands approved (the last would break R21). The host's reading.
- DISPROVED BY: any door approving.

**S1-8 · archived, and posted out as SANS — the date rule, not the delete rule.** Admin. (a) Admin → Users → Archive an
ordinary man with pending LL on a past day and a future day. (b) Post out a second man as SANS dated today, pending LL on a
day after.
- EXPECTED: (a) past day approves, future day "He posted out on <date>: refuse or delete it" (D323, D1436); (b) approves
  (D283, D1436). DISPROVED BY: "Posted out — refuse or delete it" on either (the delete words reaching a man not deleted).

**S1-9 · his callsign given to a new man.** After S1-1, Admin → Users → New person with NEWBY's callsign (free — D297), post
-in ahead, pending LL the same day as the old one. Approvals.
- EXPECTED: the new man's line approves; the old one stays refused (the rule reads his id, never the callsign). RECORD: can
  the admin tell the two lines apart (same callsign, same day)? The host's reading — an open question for him if not.

## 2. Fix 2 — one form for a half day, the credited star after its code

### 2a. Roll-call: every place a half-day credit or a half-day bid is printed or lit

| Place | How it prints today (code read, to confirm on screen) | Credited AM HO | Credited PM HO | Hand-given HO | Half-day leave / bid |
|---|---|---|---|---|---|
| The grid's box (`MatrixRows` `boxText(code, auto)`) | the code, a trailing star when the app credited it; the half by where the box sits (D1160) | "HO*" top half | "HO*" bottom half | "HO" its half (D1391) | "LL" top or bottom |
| The grid's second box on a two-entry day | same body, `second.auto` | "HO*" | "HO*" | "HO" | "LL" |
| The clash note — desktop line under the top rows (`Chrome.tsx` ~630, `clashWhat`) | `notationOf`: `*X` morning, `X*` afternoon | MISSING — "*HO" | "HO*" (by accident: the star means afternoon) | (an award never clashes with leave — D80) | MISSING — "*LL" / "LL*" |
| The clash note — phone list (`Chrome.tsx` ~668, same `clashWhat`) | same | MISSING | by accident | — | MISSING |
| The "OIL the app credited" sheet's title (`BidPicker.tsx` `raptor-sheet`, `displayCell(code)` with no credited flag) | arrow form, no star | MISSING — "<HO · approved" | MISSING — "HO> · approved" | — (an award opens its own sheet) | "<LL · approved" for leave filed on the Inputs page |
| The day's list (`DayList.tsx`) box | `EntryBox` with the star | "HO*" | "HO*" | "HO" | box "LL" |
| The day's list's words | `displayCell` arrows: "your <LL bid" (the replaced-bid line), the clash line's live bids "<LL (morning)" | — | — | — | RECORD — arrows still |
| The bid window's leave buttons (`LeaveButtons` `displayCell`) | "<LL" with AM picked — by design (D1331's reading) | — | — | — | has it, by D1331 |
| A member's approved-leave window (`RemarksSheet` "cur") | `displayCell` arrows | — | — | — | RECORD "<LL" |
| The closed-day note (`ClosedNoteSheet`) | arrows stripped + "morning" / "afternoon" | — | — | — | has it |
| The day panel's Away list (`LeaveLine` `boxText`) | box "LL" | — | — | — | RECORD whether the half is said |
| Approvals' box and "Also since" lines | `boxText` (no star, no arrow) | — | — | — | box "LL"; RECORD the half's word |
| The bell (`state/notices.ts`) | strips every star: "LL approved" | — | — | — | RECORD: half not said |
| The person window / My leave (`LeaveLine`) | box | — | — | — | RECORD |
| The Legend | "FO*" meaning "the app put it there" | has it | | | the halves by size (D1402) |

### 2b. Scenarios

**S2-1 · the clash note on a morning credited HO. Rank 5.** Admin, desktop then phone. Ranger: approved LL on a Saturday (or
a public holiday) through the bid window, Auto-approve on. Then give him short morning work that day that the app credits as
an HO — either a duty on the published schedule under 6 h (Edit Schedule, then publish the day), or a Duty input on the
Inputs page, OIL answered yes, accepted (credited "via input"). Assert the grid's box reads "HO*" in the top half.
- EXPECTED (D1306): the clash note names the credit "HO*" — the star after its code, as the box draws it — on the desktop
  line and in the phone's list alike, its sentence otherwise as built ("Weekend/PH work earns …, but the day holds …").
  How the note says it is the morning is the host's reading — RECORD it; whatever is chosen, the leave side ("the day holds
  LL") follows the same form.
- DISPROVED BY: "*HO" anywhere in the note; or the desktop line and the phone list reading differently.

**S2-2 · the same with afternoon work.** As S2-1, the work in the afternoon (bottom-half "HO*").
- EXPECTED: "HO*" again, and nothing in the note now means "afternoon" by the star alone. DISPROVED BY: the two halves
  printing the same text where the note promised to tell them apart, or different text where it promised one form.

**S2-3 · the clash note's leave side, half a day.** Ranger: a pending morning LL (member, open day) and an input filed on the
Inputs page that clashes with it without replacing it (the host picks one the gate flags — e.g. leave over recorded work),
or S2-1 with a morning LL in place of the whole day.
- EXPECTED: the note's leave reads as the grid reads it (no "*LL"). The host's reading for the half's word — RECORD.

**S2-4 · the "OIL the app credited" sheet. Rank 5 (with S2-1).** Admin, desktop and phone. Tap S2-1's credited HO alone on a
day (no leave). The sheet opens with the title line.
- EXPECTED (D1306): the title line's code reads "HO*" like the box. DISPROVED BY: "<HO · approved", "HO · approved" or
  "HO> · approved". RECORD also whether "· approved" belongs on an OIL credit at all (the code's own comment: "only leave is
  approved") — a question for him if it reads oddly.

**S2-5 · a hand-given HO stays starless.** Admin: Grant OIL → HO · 0.5 on a weekday (D1397). EXPECTED: box "HO", the day's
list "HO", the award's own sheet "HO", the member's own read-only award sheet (sign in `us`/`us` on his own award, D261) "HO"
— no star anywhere (the star is the app's alone). DISPROVED BY: a star.

**S2-6 · D1331 — the bid window on a morning box. Rank 8.** Admin (Auto-approve off) and member, desktop and phone.
(a) A pending morning LL: tap it. (b) An approved afternoon OL. (c) A whole-day LL. (d) A refused morning LL. (e) A morning OIL
taken.
- EXPECTED (D1331): (a) AM lit in the Duration row beside the lit LL, the title carrying no code; (b) PM lit; (c) "Whole
  day"; (e) AM lit. (d) the host's reading — `leaveOn` treats a refused bid as no leave, so "Whole day" — RECORD and keep
  it if it matches D1355's refused look.
- Then in (a) press OL: EXPECTED the bid becomes a morning OL, still in the top half (D1331's reading: "a leave changed from
  that window then keeps its half"). DISPROVED BY: a whole-day OL.

**S2-7 · D1331 on the windows that open differently.** (a) A morning LL of three days (one drag): a tap opens the whole leave
(D1461) — EXPECTED AM lit with "All 3 days" at the Duration row's right end; press "day tapped" then OL: only that day
changes, still AM. (b) A morning leave filed on the Inputs page, tapped by the admin: the window opens on the free half
(D1371's held line) — RECORD which half is lit and that the held half cannot be picked. (c) A day holding a morning and an
afternoon: the day's list opens (D1315), no Duration row to light. (d) The drag window over one morning box — RECORD what
lights (the host's reading; D1331 names the bid window only).

**S2-8 · the words around a half day elsewhere — record, do not fix unasked.** Walk and picture the day's list's replaced-bid
line ("your <LL bid was replaced by …"), a member's approved-leave window title, the day panel's Away line, Approvals' line,
the bell's line and the person window, for a morning LL. EXPECTED: the host's reading — RECORD each, and put any that still
carry the arrow or star grammar to him as one picture (D853), since D1402 left the Legend teaching halves by size.

**S2-9 · regression guard — the stored grammar stays. Rank 5 (with S2-1).** Admin. An approved morning LL (Auto-approve on,
AM picked). Tap it → the lit Approve → tap again (back to pending, D1330).
- EXPECTED: a pending morning LL in the TOP half, hollow and dashed; Approvals lists it for that morning; the member's bell
  says the approval was sent back (D1142) for the right day. DISPROVED BY: a whole-day bid, a bid in the bottom half, or the
  bell naming nothing — the sign that the fix reached `notationOf`, which writes the request's stored code.

## 3. Fix 3 — "This replaces your LL bid…" said only once the filing lands

### 3a. Roll-call: the doors that raise the note, and the ways a commit refuses

The note is said by the Inputs door's gate (`inputgate.ts apply`) for any leave or medical saved over an undecided bid;
the war's own doors say nothing (they run "in the door", and a course or an OD never replaces a bid).

| Door that saves an input | Can it replace a bid | Ways its commit can refuse |
|---|---|---|
| The Inputs page's input window, a new leave | yes | the gate's own refusals ("leave can't go over a medical", "… can't overlap it"); a member changing a shared leave someone else filed (D763); a locked week |
| The same window, editing an input's dates or kind onto a bid day | yes | as above |
| A medical (sick cuts leave; claims only its real hours) | yes | as above |
| The give-back (upchit) sheet — lists the cuts BEFORE saving (D1023) | yes — by design it shows "This replaces …" as a question | Cancel |
| Edit Schedule: dragging a man's puck onto an Unavailable leave row (`iu:` reassign) | yes | a published day's rules |
| Undo / Redo of a filing | yes (the gate runs on undo and redo) | — |
| The Leave War's bid window / drag window filings (OD, CSE, Attach, Other) | no — must not say it, because they run in the door | — |

### 3b. Scenarios

**S3-1 · refused by the gate — nothing said. Rank 9.** Member (`us`/`us`), desktop and phone. A pending LL of his on an open
day; a medical of his on the same day (Inputs page, ATT C, whole day — files). Then Inputs page → new LL that day.
- EXPECTED: refused with the gate's words ("… leave can't go over a medical"); no amber "This replaces your LL bid … on the
  Leave War"; his bid still there; no bell line "replaces your LL bid".
- DISPROVED BY: the replace note shown alongside, before or after the refusal.

**S3-2 · refused by the permission check — nothing said.** Two men in one shared leave filed by the admin (D660); the member
(`us`/`us`) opens that input and extends it over a day holding his own pending bid. EXPECTED (D763): refused; no replace
note; the bid stays. DISPROVED BY: the note.

**S3-3 · it lands — said once.** (a) Admin files an LL on the Inputs page over Ranger's pending OL. EXPECTED: one amber note
"This replaces Ranger's OL bid on <day> on the Leave War", once; Ranger's bell: one line "… replaces your OL bid" (D1142).
(b) Ranger files it himself over his own: "This replaces your OL bid …", and no bell line (his own). (c) A two-hour morning
medical over his afternoon bid: the afternoon bid survives and no note names it (owner, 20 Sep 26).
- DISPROVED BY: two notes, none, or the wrong owner's word ("your" for another man's).

**S3-4 · the give-back sheet asks first, says once.** Admin, a medical's give-back over a day with Ranger's pending bid (the
upchit sheet lists its cuts — D1023). Cancel: EXPECTED nothing said, bid stays. Again, Save: EXPECTED the note once (the sheet's
own list is a question, not a second announcement). DISPROVED BY: the note after Cancel, or twice after Save.

**S3-5 · Undo and Redo of a filing that replaced a bid.** After S3-3 (a): Undo. EXPECTED: the bid back, and his unread bell
line gone (D1216); a read one reads "taken back". Redo: RECORD whether the note is said again (the host's reading) — once at
most. DISPROVED BY: the note on Undo.

**S3-6 · the schedule's drag.** Edit Schedule, a week holding Ranger's pending bid day: drag another man's leave on the
Unavailable list onto Ranger (reassign). EXPECTED: the note once if it lands; nothing if a published-day rule refuses it.
RECORD which happens.

**S3-7 · the war's own filings never say it.** Leave War bid window over Ranger's pending LL day: ⋯ → Other (admin) / CSE.
EXPECTED: no "This replaces" note (the war's doors stand aside; a course never replaces a bid — `doorFile`). DISPROVED BY: the
note.

## 4. Fix 4 — an untouched month skips its redraw, and every touched thing still redraws

### 4a. Roll-call: what one change touches, and what must redraw

What a month's cells read, and whether the guard compares it: the person (`p`), the period, its own days, the role, the
viewer, deciding, the event kinds (`evKind`), the closed days (`lockedCols`) — compared by identity; this person's code,
bid record and day view on **this month's days** — compared by content. **Read but not compared:** the day views of the
NEIGHBOURING days (the joined bar, D1359 — reaching into the next and previous month at a month's edge) and the store's
records behind a bid's run key (remarks, till tick, documents — `reqRunKey`).

| Action | Changes | Must redraw | Risk |
|---|---|---|---|
| A bid placed / deleted / moved / re-typed | one person's days | its month; the Manning rows; the counters; the Manning button's "n red ›"; the name's LVE figure; the bubble | the next month's first day when the bid joins or leaves a run across the edge (S4-1) |
| An approval (Approvals, bid window, drag window, Auto-approve) | request → input; a neighbour input may EXTEND | the same | the extended input's other month (S4-1) |
| Remarks / till tick / a document changed on part of a run | the store's records only | the joined bar's breaks (D1359, D1346) | no compared prop changes at all (S4-2) |
| A delete (Admin → Users, a Delete posting) | his row, his months | his row | — |
| A post-out / post-in date changed | `p` | the hatch, the PO tags, on every month | `p` changed in place would miss (S4-5) |
| An input filed on the Inputs page | day views | its month(s), the blue edge, Manning | across a month edge (S4-1) |
| A holiday added (the Calendar window's Holidays list, ⚙ Events, the Event row) | the period's events | every row's column tint (`evKind`), the Event row | `evKind` is keyed on the period object — a write in place would miss (S4-4) |
| An event preset's kind changed (Edit presets) | event types | every row's tint | same |
| Open dates changed / midnight (D1266) / the admin's member view (D292) | `lockedCols`, role | every month | — |
| Undo / Redo of each above | as above | as above, the screen staying put (D672) | as above |

### 4b. Scenarios

**S4-1 · a joined bar across a month's edge. Rank 1.** Admin, desktop at 1536 and phone. Ranger: Auto-approve on, a drag over
1–3 Dec → LL (one leave, one joined bar). Then a tap on 30 Nov → LL (Auto-approve on — the approval EXTENDS the leave next to
it: "approving next to leave already approved … extends that Input"). Picture 30 Nov | 1 Dec at the month's edge.
- EXPECTED (D1359): one joined bar from 30 Nov to 3 Dec, the code once, at 30 Nov; no break, no rounded edge, no second "LL"
  at 1 Dec.
- DISPROVED BY: 1 Dec still drawn as the bar's start (its code shown, its left edge rounded) while 30 Nov joins to the right
  — the December month was skipped. Scroll December out of view and back, or place any bid in December: if the bar then
  heals, the guard missed it.
- Then Undo: EXPECTED 30 Nov empty and 1 Dec the bar's start again (code shown). Then the same with pending bids
  (Auto-approve off — one drag over 1–2 Dec, then 30 Nov, no words): a run of one key joins the same way. Then Delete 30 Nov
  from a run 30 Nov–2 Dec: EXPECTED 1 Dec the start, nothing joined to the left.

**S4-2 · words or papers changed on part of a run — nothing compared changes. Rank 2.** Admin (Auto-approve off) or member,
desktop and phone. (a) Two pending LL bids on 10 and 11 Nov placed one by one with different remarks — two boxes. Drag over
both, type one remark (D1341). EXPECTED (D1346, D1359): they now act as one — ONE joined bar, the code once — and Approvals
shows one line. (b) A three-day pending run 17–19 Nov opened whole (D1461), "day tapped" on 18 Nov, type a remark on that day
only (or add a document, D1159, or untick "till", D1226). EXPECTED: the host's reading of D1359 for where the bar breaks —
RECORD it; Approvals then lists as many lines as the grid shows pieces.
- DISPROVED BY: the grid unchanged after (a) or (b) until something else in that month redraws, while Approvals already shows
  the new count of lines — the grid and Approvals disagreeing on what is one leave.

**S4-3 · an untouched month truly skips — the measure.** Built app (`npm run build && npx vite preview`), desktop whole-year
fill. Before changing anything, count month draws for one bid (the React profiler, or the unit test's counter on the real
grid) — `performance.md` Part 1. EXPECTED: one bid redraws its own month of its own row (plus the neighbour month only where
a join can change, if the fix compares the edge days); never every month of every row. Picture the counts before and after.
The pin: a test that fails when `sameMonth` is taken off AND a test that fails when a neighbour-edge change is skipped (S4-1)
— the second is the one missing today.

**S4-4 · a holiday added from another page. Rank 10.** Admin. With the Leave War drawn (desktop, whole year), go to Edit
Schedule → the Calendar window → Holidays → add a public holiday on a weekday in a month already drawn; come back to the
Leave War (lesson 10: also while the war is hidden, past its idle time). Then ⚙ → Events… → Edit presets → change a squadron
event's kind to "Off day".
- EXPECTED: every row's column on that date takes the holiday tint at once, on every person, with the Event row's tag;
  the preset change re-tints every row. DISPROVED BY: the tint only on rows drawn afterwards, or only after a scroll.

**S4-5 · a posting date moved under an open sheet.** Admin. Post out → an ordinary man, change the date three times (the sheet
commits on change and stays up — W3-F5), across a month's edge (30 Nov ↔ 2 Dec). EXPECTED: after each change his hatch and the
PO tag move on the grid behind the sheet, in both months; Undo puts each back. DISPROVED BY: a hatch or tag left on a month
that did not redraw.

**S4-6 · everything else that must redraw after a bid.** Member, phone, Manning rows folded then opened (D1258). A bid that
turns Available P red (D1345): EXPECTED the bubble at the foot (D1358), the Manning rows' figure for that day, the Manning
button's "n red ›" (D1243), his LVE figure beside his name (D1153) — all at once. DISPROVED BY: any of them a step behind.

**S4-7 · the open-bidding outline and the closed dim.** Admin opens a month for bidding (Open for bidding), then switches to the
member view (his name badge, D292). EXPECTED: the green outline round the open days from today (D1269); a member's closed days
dimmed with the lock on every row (D1267); back as admin, no dim. DISPROVED BY: some rows dimmed and others not.

**S4-8 · Undo / Redo over two months, and a move across the edge.** Move a pending bid from 30 Nov to 1 Dec (beside a run in
December), Undo, Redo. EXPECTED: each step redraws both months, the run joining and parting at 1 Dec; the screen stays where it
is when the day is in view (D672). DISPROVED BY: a ghost box or a stale join after any step.

## 5. Ranked list (highest first)

1. S4-1 — the joined bar across a month's edge (the guard skips the neighbour month).
2. S4-2 — remarks / document / till on part of a run: no compared prop changes, the bar does not join or break.
3. S1-2 — a Delete posting that has run: days before the date must still approve.
4. S1-1 — the item's own case: a never-arrived man, deleted, refused with "Posted out — refuse or delete it".
5. S2-1 + S2-4 + S2-9 — the clash note's "*HO" and the credited-OIL sheet's "<HO · approved", fixed without touching the
   stored grammar (a send-back lands a morning bid).
6. S1-4 — a SANS man with SANS off still approves.
7. S1-6 — Undo / Redo writing an approval back for a deleted man.
8. S2-6 — D1331: the bid window opens on the box's half and keeps it on a change.
9. S3-1 — a filing the gate refuses says nothing of the bid.
10. S4-4 — a holiday added from another page tints every row.
Then S1-5, S1-7, S1-3, S1-8, S1-9, S2-2, S2-3, S2-7, S2-5, S3-3, S3-2, S3-4, S3-5, S3-6, S3-7, S4-5, S4-6, S4-7, S4-8, S4-3,
S2-8. **33 scenarios in all.**

## 6. The missed-fault lessons (bug-check order §7.11) — which scenario covers each

| Lesson | Covered by / why it cannot apply |
|---|---|
| 1 a reading in one state only | S2-6 (new / pending / approved / refused / whole / two halves), S1-1 (pending → refused → Refuse) |
| 2 a gesture at one speed | S4-1, S4-2 drags at a person's speed and slowly on the phone; no new gesture is added |
| 3 feedback never looked for | S1-1 (the refusal shown on its line), S3-3 (one note), S4-6 (bubble, figures) |
| 4 a press behind an open window | S4-5 (the grid behind the Post out sheet), S2-7 (b) the free-half window — press another day behind it |
| 5 a box brought into sight vs what stands over it | S1-1 phone: the refusal under the slim bar / the bubble; a ringed day from Approvals (D1449) not under the bar |
| 6 only the real phone draws it | cannot apply — nothing is handed to the phone; S4-1's join is pictured in WebKit as well |
| 7 a mechanism tuned to a model of the phone | cannot apply — no motion is steered |
| 8 an approved drawing | S2-1 / S2-4: the clash note's approved phone drawing (D827) keeps its layout; only its codes change |
| 9 alignment by eye, one kind of row | S2-1 phone list measured with a pilot and a WSO; S1-5 Approvals lines measured with a SANS and an ordinary man |
| 10 a page hidden and shown again | S4-4 (the holiday added while the war is hidden, past its idle time, back by each tab) |
| 11 a reading that depends on how much fits | S4-1 and S4-3 at 1536 zoomed out (Ctrl+scroll) and at 2560, where several months — and their edges — are on screen at once |
| 12 a window opened from one page only | S1-1: the refusal from Approvals; S1-7 from the grid's bid window, the day's list, the drag window |
| 13 a pinch at the top of a list only | S4-1 on the phone pinched part-way down the grid, the join pictured mid-pinch |
| 14 a box left off the keyboard list | S4-2's Remarks box and S1-1's Admin → Users Delete reached by keyboard on the desktop; no new box |
| 15 a pinned bar by where it sits | cannot apply — no pinned part changes; S2-1's phone clash note line is checked for its own fill if touched |
| 16 a warning cleared only by a change of value | S3-1: after the refusal, file the same leave again — still refused, still no replace note |
