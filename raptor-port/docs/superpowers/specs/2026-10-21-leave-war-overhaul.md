# The Leave War overhaul — design note (D1140, 21 Oct 26)

**Status:** planning. Round 1 of his questions is out; nothing is built. Backlog item: `[LW-OVERHAUL]` in
`../../../../OUTSTANDING.md`. Branch: `claude/leave-war-overhaul` (planning only). Pictures and the script that drew them:
`../../mock/lw-overhaul/`. His page of pictures for round 1: §8.

**His words (D1140):** *"Should we create another worktree chat for a major overhaul planning of the leave war? … I saw this
app created by my colleague and would like to take the good things from it."*

**How this note is used.** The comparison (§2) lists every idea in the colleague's app beside what ours does today, each
with a verdict. The ideas worth having become product questions (§4), put to him in rounds of at most four, each with a
recommendation, a worked example and pictures — today beside the proposal, the place marked (D853, D921). His answers are
written into §5 as rulings, then the build is split into batches (§6). A fresh, blind Opus reader red-teamed this plan
before it went to him (D790, D903); its findings and what was done about each are §7. Where an answer changes the plan,
the changed part is read again before it is built.

## 1. The colleague's app, in brief

A one-page leave and OIL planner for one squadron, dark with an orange accent, on a claude.ai artifact with a shared
database and sign-in. Five tabs: **Calendar**, **Approvals** (with a count of what waits), **Balances**, **Personnel &
access**, **Holidays & events**. It was read from its source (it draws nothing without its database), then run on this PC
with made-up sample people so it could be pictured; none of its own data was opened, and its unit's name is replaced in
every picture. Its look is not taken (D765: the Raptor look stays).

Its parts, as a person meets them:

- **A strip of his own numbers** at the top of the Calendar: leave days left, OIL left ("after pending" under each),
  how many of his days wait for approval, his next entry.
- **"Since your last visit: 3 approved · 1 rejected"**, the days named, with "Mark as seen"; the decided days wear a
  green outline until then.
- **"My week"**: seven day cards from today, each with his entries.
- **One month at a time**, ‹ month › with Today and a date box; category filter chips (All, Management, IP, IWSO, OPS P,
  OPS W, TX, OCU, Other).
- **On a phone, a day panel** above the grid: ‹ day ›, how many are available per category (amber at 2, red at 1 or
  fewer), and who is away that day with their code.
- **The grid**: event bars in lanes, a public-holiday row, an "avail" row per category, then people by category with
  "L 9.5 · OIL 3.0" under each callsign. A cell's colour is its leave type; approved is filled, waiting is outlined with
  an amber dot, refused is struck through. Two entries a day (AM and PM) split the cell.
- **Apply for leave / OIL** (the one main button): a form — who, type, from, to, entry 1 or 2, an attachment, "approve
  now" for an admin — with a live line: "3 calendar days. Uses 3.0 leave. QUILL goes from 10.0 to 7.0", and an amber or red
  line naming each day the person's category falls to 2 or fewer. A drag across a row's days opens the same form.
- **A cell's window**: each entry with its state, **who entered it**, what it costs ("Uses 1 leave day"), Approve / Reject /
  Remove for an admin, photos and PDFs attached.
- **Approvals tab**: every waiting request, one line per run of days — who, type, dates, days, leave and OIL it takes
  (red when it takes a balance below zero), who entered it, files — with Approve / Reject, and **Approve all**.
- **Quick approve**: a switch that makes a tap on a waiting cell approve it.
- **Lock dates**: periods with a reason in which members cannot add, change or remove leave (files still allowed); or the
  whole calendar.
- **Balances tab**: everyone's leave and OIL, each shown twice — on approved leave alone and "after pending" — and a count
  per leave type.
- **Personnel & access**: add and remove people, category, management, set balances, link accounts, who is authorised.
- **Holidays & events**: typed holidays and one button for a whole year's national holidays; events with dates and a kind.

## 2. Side by side — theirs, ours, and the verdict

Ours today, from the code and the running build (21 Oct 26): `../../leavewar/known-gaps.md`, `../../ui-contracts.md` (its
Leave War sections), `.claude/rules/decisions/leave-war.md`; corrected by the red team (§7).

| # | Their idea | Ours today | Verdict |
|---|---|---|---|
| 1 | A strip of his own numbers: leave left, OIL left, waiting, next leave | His figures sit in his row's figure column (15 over 5 used); "Viewing as" chip; no summary, no list of his own requests | **Better there — round 1, Q1** |
| 2 | Told when his leave is decided ("since your last visit"), decided days outlined | **Approving tells him nothing**: the bell skips a newly war-approved leave (`src/state/notices.ts`, "told by the war's own page", which says nothing). A refused bid never reaches the bell either. A change to a leave already approved goes through the Inputs door and probably does tell him (unpinned — a test confirms it before the build). A bid replaced by a clashing input leaves a note on the grid ("OK, seen") | **Better there — round 1, Q2** |
| 3 | A day panel on a phone: that day's availability and who is away | None; the whole year grid only; a date's heading answers no tap today | **Better there — round 1, Q3** |
| 4 | The form says what a request does before it is sent: days, balance before and after, the days his category runs short | The bid window places a bid at the first tap of a leave type and says nothing of its cost; a balance going below zero asks "tap again" (the drag-selection window too — D264, D418) | **Better there — round 1, Q4** |
| 5 | Approvals: every waiting request across people, one line a run, with its cost; Approve all | No list: an admin finds bids on the grid and drag-selects a block to decide | **Better there — round 2** |
| 6 | Lock dates (with a reason) so members cannot bid them | Members bid only inside the bidding window, and not after bidding closes. A No Leave day **only colours its column — his deliberate choice** ("colours only for now"; urgent leave still goes through — `../../leavewar/known-gaps.md`; the Event sheet says "Heads-up only · never blocks a bid") | **Asked again in round 2, naming that choice** |
| 7 | An entry approved as it is placed ("Approve what I enter") | An admin's bid is placed waiting, then decided — two steps | **Better there for an admin — round 2** |
| 8 | Photos and PDFs attached to a leave (a form, an MC) | Documents live only on the Inputs page (medical), in each browser | **New — round 2** |
| 9 | Who entered each request (and when) | A bid keeps no "who placed it" or "when" (`engine/warrecs.ts`, the request record); inputs show who placed them and when (D629) | **Missed in the first draft — round 2** |
| 10 | Filter chips by category | Groups fold; no filter | **Better there — round 3** (sorting by flight, D1001, its own question) |
| 11 | Today, a date box, ‹ month › | Opens on the bidding window's first day (ruled — §Settled, "the tab opens on the war being bid on"); a month strip; no Today | **A Today jump only — round 3**; the opening day stays as ruled |
| 12 | A cell's colour is its leave type; its state is fill, outline, strike | A cell's colour is its decision (none, purple Ack, green, red); the type is its letters | **Asked — round 3**; recommended: keep ours |
| 13 | "My week" cards | — | **Folded into Q1 and Q3** (his next leave; the day panel) |
| 14 | An "avail" row per category, amber at 2 and red at 1 | Counters the squadron defines, each with its own amber and red; Available P / W; under-manned list | **Ours already, and more flexible** (D669, D674) |
| 15 | Balances: everyone's leave and OIL, twice — on approved leave alone and "after pending" | The figure columns, the "Which figure" picker, every person's all-figures window — one figure, already less every waiting bid | **Mostly ours**; the second figure (on approved leave alone) is not — Q1's line says its figure already counts the waiting |
| 16 | Two entries a day split the cell | Half days `<LL` and `LL>`; a second record gives a `+n` corner and the day's list | **Ours already** |
| 17 | A drag across days opens the request form | A drag selects a block and opens the selection window | **Ours already** |
| 18 | Event bars in lanes, a holiday row | Event rows with merged bands, short forms, kinds (D643, D645, D652) | **Ours already** |
| 19 | Personnel & access on the war: add people, category, balances, accounts | Quals and Admin → Users own people (D461); the war shows what Quals says | **Ruled against** (D460, D461) — not asked |
| 20 | One month at a time | The year grid with its window of months (ruled — §Settled, "one draw-toward-a-target window engine") | **Ruled — not asked** |
| 21 | Quick approve (a tap approves) | Drag-select decides a block | **Left** — §3 |
| 22 | A year's national holidays at one press | The Holidays list in the Calendar window (D638) | **Left** — §3 |
| 23 | Lock the whole calendar | The stages: once bidding closes, members cannot bid | **Ours already** |
| 24 | Toasts after each action ("LL entered for 3 days") | Feedback designed into the screen; a note only where the screen does not show it (D850) | **Ruled — not asked** |
| 25 | Legend always shown under the grid | A Legend button | **Left** — §3 |

## 3. Considered and left — and why

- **Quick approve.** A switch that changes what a tap does is easy to leave on by mistake, and a tap meant to open a cell
  then approves it. Drag-select already decides a block in two presses; round 2's list decides many runs at once.
- **A year's national holidays at one press.** The app would carry a list that must be kept right every year, and a
  wrong one silently changes OIL and manning. The Holidays list already takes a run of dates in one entry.
- **The Legend under the grid.** It costs a phone a screen of height on every visit; ours stays one press away.
- **Their orange look, fonts and tabs.** The Raptor look stays (D765); the war stays one page with its own windows, not five
  tabs (one page's controls are one row — design guide §3, D911).
- **Their "entry 1 / entry 2" choice.** Ours takes a second record on a day by itself; asking a member which slot is a
  step he does not need.

## 4. The questions, in rounds of four

Each is a product choice; how it is built is the agent's (D9, plain-language). Checked against every rulings file, the
archive and the backlog on 21 Oct 26 (D53), and by the red team (§7): none is ruled already; where an answer would change
an earlier ruling, the question names it (D754). The sample person in every example is the demo's Ranger (the member
sign-in), staged through the app's own controls with the clock held at Thu 8 Jan 26: his LVE set to 20, LL Mon 19 – Wed
21 Jan approved, LL Mon 26 – Tue 27 Jan waiting, LL Mon 2 Feb refused, all by the admin Saber.

### Round 1 — the member's own leave (a member is mostly on a phone — D820)

**Q1. A "My leave" line for the person signed in.** *My leave · LVE 15 · OIL 0 · 2 waiting · next LL 19 Jan ›* — the
figure is already less the two waiting days, as the grid's is. A tap opens his own leave, one line a request (dates,
leave, approved / waiting / refused), and a tap on one takes the grid to it. An admin sees his own the same way.
*It changes his rulings on the war's top:* D678 and D1000 (a phone's top is two lines), D679 (a desktop's top stays as it
is, every label and button), D365 (the "Viewing as" chip's words kept).
*Pictures:* `r1q1-ours-phone-today.png` → `r1q1-ours-phone-mock.png` → `r1q1-ours-phone-list-mock.png`; option B
`r1q1-ours-phone-mockB.png`; desktop `r1q1-ours-desk-mock.png`; theirs `r1-theirs-phone-top.png` (box 1).
*Options:* **A — recommended:** on a phone a third line under the two (one line of height, against D678/D1000); on a
desktop no new line — the chip stands in the free right end of the stage row (an addition to D679's row). **B:** no new
line on a phone either — the "Viewing as" chip carries his numbers when it is himself (*Ranger · LVE 15 · 2 waiting ›*),
against D365; the next leave does not fit. **C:** leave it.
*Worked example:* Ranger opens the war on his phone on 8 Jan; without scrolling he sees 15 left, 2 waiting, next leave
19 Jan; a tap shows 19–21 Jan approved, 26–27 Jan waiting, 2 Feb refused.

**Q2. Telling him when his leave is decided.** Approving tells him nothing today, and neither does refusing.
*Pictures:* `r1q2-ours-phone-today.png` → `r1q2-ours-phone-bell-mock.png`; theirs `r1-theirs-phone-top.png` (box 2).
*Options:* **A — recommended: the bell.** One line a decision, naming who made it, as every bell line does (D769):
*Your leave · Mon 19 – Wed 21 Jan · LL approved · Saber*; a tap takes the grid there. It tells him when a bid is
approved or refused, when an approved leave is put back to a bid, moved or deleted, and when a clashing input replaced his
bid; not for an Ack (seen, not yet decided). Days decided together are one line. **B:** a line on the war itself, as
theirs: *Since your last visit: 3 approved · 1 refused*, with "Mark as seen" (if Q1 is A, it would sit inside that line).
**C:** both.
*Worked example:* Saber approves Ranger's 19–21 Jan and refuses his 2 Feb; Ranger's bell shows two lines; a tap on the
first scrolls the war to 19 Jan; the refused day stays on the grid in red, as today.

**Q3. A day panel — tap a date, see that day.** A tap on a date's heading (which answers no tap today) opens that day
from the foot of the screen, as the Inputs and SANS calendars' day does (D997): ‹ Tue 27 Jan ›, the day's figures
(Available P and W, and a manning row of the squadron's with its amber or red), and who is away — each with his leave's
letters and whether it is approved or waiting, exactly what the grid already shows him; never a remark.
*Pictures:* `r1q3-ours-phone-today.png` → `r1q3-ours-phone-day-mock.png`; theirs `r1q3-theirs-phone-day.png`.
*Options:* **A — recommended:** on a phone and a desktop. **B:** a phone only. **C:** leave it.
*Worked example:* Ranger wonders about Tue 27 Jan; he taps "TUE 27"; the panel says Avail P 25, Avail W 17, and that
Reaper, Drifter and Basher have bid LL too, all waiting.

**Q4. Seeing what a bid costs.** Our bid window places the bid at the first tap of a leave type, and each type draws a
different balance (LL and OL the LVE, OIL the OIL, CCL its own; a weekend or a holiday takes nothing), so the cost cannot
be one line before the type is picked. Both bid windows (one day, and a dragged block — one format, D264) change alike;
the "tap again" ask before a balance goes below zero stays (D418).
*Pictures:* `r1q4-ours-phone-today.png` → A `r1q4-ours-phone-mock.png`, B `r1q4-ours-phone-mockB.png`; theirs
`r1q4-theirs-desk-apply.png`.
*Options:* **A — recommended:** what is left shows on each leave button (*LL 15 · OL 15 · OIL 0 · CCL 0 …*), with one line
at the top for the day (*Wed 28 Jan · Avail P 28 → 27 if you bid*, and a manning row that would turn amber or red named);
still one tap. **B:** pick, then confirm — the type lights, a line says what it takes (*LL Wed 28 Jan: LVE 15 → 14*) and
"Place bid" places it: one more tap on every bid. **C:** leave it.
*Worked example (a range across a weekend):* Ranger picks Fri 30 Jan – Mon 2 Feb and taps LL: Fri and Mon take 1 each,
Sat and Sun nothing — LVE 15 → 13.

### Round 2 — the scheduler's side (a scheduler is mostly at a desktop — D820) — *drawn and put after round 1*

Each to be drawn on the real app with lettered options and a worked example before it is put.
- **Q5. A "Requests" list** for an admin — every bid still waiting, one line a run: who, leave, dates, days, his balance
  after it, the lowest figure of any manning row on those days — with Approve and Refuse on each line. Where it opens
  from changes the stage row (D678, D679 — named in the question). *Recommended: yes.*
- **Q6. "Approve all that turn no day red"** in that list — one press, one undo; lines the clash rules refuse are listed,
  not lost. *Recommended: yes.* (Split from Q5 by the red team: one decision a question.)
- **Q7. A No Leave day and a member's bid.** He chose "colours only for now" so urgent leave still goes through. Options:
  A — it refuses a member's bid there and says why, at the one gate the Inputs page also passes, so leave filed on the
  Inputs page is held the same; B — it asks first ("Wed 14 is No Leave — EX SAMPLE SHIELD. Bid anyway?"), as the
  below-zero ask does; C — leave it as he chose. The Event sheet's words change with A or B. *Recommended: B.*
- **Q8. An admin's entry approved as he places it** — on any row he fills, as theirs' "Approve what I enter"; a switch
  in the bid window, off each time it opens; it adds a line to the windows' order (D331). *Recommended: yes.*
- *Then:* who placed a bid and when, shown in its window as inputs show it (D629) — a new stored field; photos and PDFs on a
  leave (*recommended: not now* — files need the shared database's storage).

### Round 3 — finding things and how cells look — *after round 2*

- **Q9. A "Show ▾" filter** in the grid card's row: everyone, one group, or only people with leave in the bidding window
  (fixed by the period, never by the months on screen, so rows do not come and go while scrolling); a filter never changes a
  count. *Recommended: yes.*
- **Q10. Sorting by flight** (D1001's idea, [LW-SORT-BY-FLIGHT]) — its own question with pictures.
- **Q11. A way to today:** on a desktop a "Today" button at the end of the month strip; on a phone the strip's twelve
  months stay on one line (ruled — §Settled), so today is the current month's mark, or the period chip's menu. The war still
  opens where it opens today (ruled).
- **Q12. A cell's colour stays its decision** (none, Ack, approved, refused), the leave type its letters — not theirs'
  colour per leave type. *Recommended: keep ours* — a colour means a status in this app (design guide §4).

### Round 4 — balances over the years, and what lowers manning — *after round 3*

- **[LEAVE-YEAR] — yearly leave balances and carry-over** (his "we will do this next time", 19 Sep 26): one question each —
  a balance per year or per period; what carries over; which year a leave across 31 Dec charges.
- **A whole-day commitment lowers manning** (D998 parked it "for now", to be raised at the war's next batch — this is
  that batch): Training, Duty or a Meeting that takes the whole day lowers the day's figures; a part-day one does not.
  *Recommended: yes, whole days only.*

**Not in these rounds:** pinch to zoom on a phone is its own job in its own chat (D1117, `[LW-PHONE-PINCH-ZOOM]`).

## 5. His answers

*(Written here as he gives them, each recorded as a ruling first — D13. This chat's numbers: D1140–D1159.)*

**Round 1 (21 Oct 26):**
- **Q1 → A (D1141):** "My leave" for the person signed in — a third line on a phone, the stage row's free end on a desktop;
  a tap lists his own leave. Narrows D678, D1000 and D679; D365 stands.
- **Q2 → A (D1142):** the bell tells him, one line a decision naming who made it — approve, refuse, put back, move,
  delete, replaced; never an Ack.
- **Q3 → A (D1143):** a tap on a date opens that day from the foot, on a phone and a desktop.
- **Q4 → open:** he leans to A and asked *"what if there are more counters at the top how would it look like"*. Drawn
  (his page, "Your question on 4"; `../../mock/lw-overhaul/r1q4-more-*.png`, script `round1-q4-counters.mjs`): the
  squadron given the eleven counters the tests use, a real bid by Ranger on Wed 28 Jan measured — it moves 5 of the 11 (IP
  16→15, IP + IWSO 23→22, FL P 19→18, SXO 12→11, SC D 7.7→7.5), none to amber or red. Put as A every counter (four lines),
  A2 only those it moves (three lines), **A3 only a counter it turns amber or red, else one calm line — recommended**; the
  balance on each leave button stays in all three. **→ A with A3 (D1144):** *"A3 And can u place it neatly with each
  counter flushed to the left if there are multiple counters affected"* — each row the bid turns amber or red on its own
  line, flush left, names in one column and figures in a second; none turned, one calm line. Drawn:
  `../../mock/lw-overhaul/r1q4-a3-stacked.png`. The agent's reading of his point is the design guide's lesson 20; whether the day panel (D1143) stacks its manning rows the same way is put to him with its picture.
- **He has more questions of his own** (21 Oct 26, "hold on i have alot more questions but u can continue to suggest") —
  taken next, before round 2 is put.

**His list of 22 points (21 Oct 26, after round 1)** — his own read of the colleague's app, with *"Create a full mock up
on what u think the app should change into … use the design skill … easy and simple to understand"*. Recorded:
- **D1145** (points 2, 3, 20): AM and PM half days stay, which half always chosen; the cell draws AM in its top half, PM in
  its bottom half.
- **D1146** (4): two entries on a day both show in the cell, one above the other.
- **D1147** (5): an admin's "Approve what I enter" tick — answers round 2's question on an admin's entries.
- **D1148** (7, 22): a tap on a person opens his balances and upcoming leave with its state, by year, past years kept
  under a drop-down.
- **D1149** (8): a Management group the admin makes, at the top by default.
- **D1150** (12): photos and PDFs on every input, any time, even after locking; a leave on the Inputs page asks for its
  document as medical does, never a hard stop.
- **D1151** (12): one register of every notification the app should send, kept by the agent ([NOTIFY-REGISTER]).
- **D1152** (13): an Approvals list with a rising count and Approve all — round 2's Q5 and Q6 decided.
- **D1153** (14): a bid takes its leave off at once; no "after pending" figure.
- **D1154** (15): Available P and W set up as any counter, one row each; the SANS calendar follows them.
- **D1155** (16): holidays brought in by file (export, fill offline, import); a list of squadron events with types,
  several days allowed.
- **D1156** (17): lock dates adopted; whether the stages go is put to him on the full mock-up (his lean: they go).
- Point 21 (pinch to zoom on a phone) is already ruled — D1117, `[LW-PHONE-PINCH-ZOOM]`.

**Round 2 of the full mock-up (21 Oct 26 — his reply "1A 2 I cant really tell if its a half day or not … 3 yes maybe use
this instead for document to standardise it. 4 how about u keep it as B and make the pucks fill the grid …"):**
- **Q1 → A (D1157):** the year grid stays; nothing changes.
- **Q2 → open, redrawn:** he could not tell a half day from a whole day ("the size of the half day and full day is very
  similar") and asked what "Filed on the Inputs page, waiting (Q6)" is. His answer to Q4 settles the size; Q2 (what the
  box's colour says) is put to him again on cells drawn his way, with the Q6 row explained in words.
- **Q3 → yes (D1158):** Ack goes — Decide is Approve · Refuse (narrows D331); the Legend loses Ack's purple. **And
  (D1159):** every document the overhaul adds uses the app's one Document button, as the input window has it — the
  upload arrow and "Document", then "Add", each file a chip with its ✕ — not the drawn "Add a photo or PDF"; design
  lesson 22.
- **Q4 → B, his way (D1160):** rows keep their height; a whole day's box fills its cell, a half day's box fills its half
  (AM top, PM bottom), its letters smaller — so size says how much of the day; narrows D1145; design lesson 21. The one
  case it leaves open — two whole-day entries on one day (D1146 says one above the other, which would now read as AM
  and PM) — is put to him with its picture (Q4b).
- **His point on Q2 (D1161), before answering round 3:** a grid all one green is "boring and mundane"; with the colleague's app's grid (Gryphon; a colour for each kind of leave) he asked which is more intuitive. **And (D1162):** OD stays overseas duty, as the app has it — Gryphon's OD is "other duty", not taken over. Q2 is drawn again with a colour for each kind of leave (`../../mock/lw-overhaul/full-cells3.mjs`) and put with a recommendation.
- **And the same evening (D1163, D1164):** Gryphon's SC is not taken over, since OIL earned is credited as FO and HO; an HO is drawn in a half of its day (morning or afternoon) like a half day's leave — the half the admin picks, or for one the app credits, the half the work fell in (the agent's reading, said with the picture).
- **Q2 → E, his colours (D1165):** "for 2E how about LL and OL is different shades of amber, OIL is green" — a cell's colour is its kind of leave (filled approved, hollow waiting, grey struck refused); LL and OL two ambers, OIL green; drawn as look F (`../../mock/lw-overhaul/full-cells4.mjs`, pictures `full/p4d-*.png`) for him to confirm.
- **Q6 → B, in his words (D1166):** the locks stop only bidding on the Leave War; Inputs-page leave is never locked and lands approved, as today — after the war closes a member gets management's verbal approval and files or edits his leave on the Inputs page, and the war follows by itself; he takes back "only the admin may change leave once locked". Narrows D1156; P6 struck; Q5's table line on approved leave changes to "he changes it himself on the Inputs page, after verbal approval". His picture of the war: bidding opened about three months ahead (each squadron its own period), everyone approved, then closed.
- **His question on Q5:** which is more intuitive — saying what is open (default closed, the admin opens a stretch, as the app does today) or saying what is locked (Gryphon)? Drawn (`../../mock/lw-overhaul/full-q5.mjs`, `full/p5-*.png`); the agent recommends saying what is open — one line for a three-month window, one line to move it, nothing open by default — with the stages still gone; choosing it would replace D1156's lock dates.
- **Q4b → A (D1167):** "4b i decided A" — two whole-day entries side by side, each the full height (the agent had recommended C, a strip, as three letters are cramped in a half-width box on a phone — told him); a full day of leave with an HO, the HO in its half of the right side. Narrows D1146.
- **His idea on Q5 (D1168):** the "Open for bidding" window gets the period's months as quick buttons — a tap opens or closes a whole month; exact days stay behind the pencil (design lesson 24); drawn (`../../mock/lw-overhaul/full-q5-flow.mjs`).
- **And (D1169):** "also allow hold and drag to select months" — a hold and drag across the month buttons opens every month it passes over, as one stretch.
**D1264 (23 Oct 26):** on a phone the "Open for bidding" window opens as a full page from the top of the screen, its month buttons at the top, so they never move as the list of open stretches below them changes (a desktop keeps its window).
**D1265 (23 Oct 26):** the admin is shown which open dates are already past for members — past months marked in the window, the chip saying when what is open is all past; drawn first, then built in M1.
**D1266 (23 Oct 26):** today moves at midnight with the page open — the today ring, a member's dim and lock, his outline and chip together; in M1, not the next batch.
**D1267 (23 Oct 26):** a member's closed days dim with a lock only while some dates are open for him; with nothing open his grid draws as normal (D1177's reading, now his ruling).
**D1268 (23 Oct 26):** D1265 as drawn — a month wholly before today locked and not pressable in the window, a past stretch reads "past", the admin's chip counts from today (`docs/img/mock/lw-d1265/`).
**D1269 (23 Oct 26):** the grid's green outline marks only the open days from today, for the admin as for a member (D1268's rule on the grid).
- **And (D1172):** "perhaps instead of an edit icon put a calendar icon" — each open stretch's line carries a calendar icon, not a pencil. He also asked how the main page looks with two stretches open — drawn (`../../mock/lw-overhaul/full-q5-two.mjs`).
- **And (D1173, D1174):** the "Viewing as <callsign>" chip goes (only a label on the war — the admin / member switch is the name badge, D292; replaces D365, narrows D678); the period picker is labelled "View" ("View JAN – DEC 26"), on a phone too. To draw with round 4's Q10 (the top row).
- **Q2 confirmed (D1175):** "2 f" — look F as drawn, every input.
- **And (D1176):** the closed note's words — "Bidding is closed. To change your leave, seek management's approval, then file it on the Inputs page. Your approved leave updates here by itself."
- **The fresh Opus read of round 3's records (21 Oct 26), its marks taken:** D678 and D679 narrowed by D1177 (D679 by D1173, D1174 too); D1173's reason corrected — the name badge is hidden on a phone, where the name is the menu's "Signed in as" line; D1141 marked by D1173; D418 without a published war (remarks at any time, the leave itself changed on the Inputs page); D413 ends with the admin texting the squadron; D1176's trigger (a tap on any day not open) marked as the agent's; D1168, D1166, D333, D352 restated; D1177's readings gain the moved mark on any move of approved leave and remarks at any time; the two §Settled entries that read the stage marked.
- **Round 4 put (21 Oct 26, the page's version 21):** Q7–Q10 with the top redrawn in every picture — the open-dates chip where the stages were (D1177), "View" (D1174), no "Viewing as" (D1173); Q10 re-cut (§9.3). Round 3 folded into a list of his answers on the page.
- **Q5 → open (D1177):** the stages go; the "Open for bidding" window (chip, list, month buttons, calendar icon) is the one switch; nothing open until he opens it. Replaces D1156; narrows D1166, D418, D333, D352, D827, D679, D1141, D413. Round 3 is answered.
- **His points on round 4's question 7 (21 Oct 26, with his picture of the Inputs list's type filter):** **D1178** — a request with a document shows a document icon on its Approvals line, a tap opens it for the admin to review (the colleague's "files"); **D1179** — the Inputs page's type filter can pick a whole family (all leave, all medical; the agent adds all duty & commitments), so one view shows who has not uploaded his document — recommended with it, a quiet "No document" on a leave or medical row without one; **D1180** — Approvals shows each request's kind as the grid's coloured box (look F) and the person as his puck (seat colour, CAT, SANS edge) — design lesson 25; **D1181** — "LVE after" reads "LVE Bal". **His question "the lowest Avail P — is it at the time of application? in order of application?"** answered: it is live, not frozen — the lowest Available P on the request's days as the grid stands now, with every request not refused already counted (a bid lowers manning the moment it is placed, D998), so it shows the day if everything waiting is approved; approving changes it nothing; refusing raises it on the requester's own seat's row — so each line shows his own seat's figure, "lowest Avail P" for a pilot and "lowest Avail W" for a WSO (as the rows stand — D640 lets an admin change what they count); a SANS man is never counted in either row (D626), so his request moves neither, and his line shows "SANS · not in Avail" in place of a figure (the agent's recommendation, put with question 7; second fresh read) (corrected by the fresh read: the round-2 drawing showed Avail P on every line, but a WSO's request never moves it). **The order (corrected by the fresh read):** the round-2 drawing was sorted by the leave's first day while its heading said "oldest first"; the app keeps no time a bid was placed today; recommended, oldest request first — the order of application — once the overhaul's "who placed it and when" record exists (picture 8). Not a ruling unless he changes it.
- **His question "will the lowest avail P or W show in amber or red … if i change [its name] will it be updated?"** answered (21 Oct 26, drawn `../../mock/lw-overhaul/full/r4b-desk-approvals-colours.png`): the Available rows have no amber of their own; their cell turns red where under that day's Required (checked: `leavewar/ui/FlyRows.tsx`), so the line's figure does the same; a Manning row amber or red on the request's days is named after it in its colour, as the bid window's line (D1144); the line reads the row's own name and counts whoever it counts (D640), so a rename or a new filter shows at once. Folded into question 7's A; a ruling once he answers.
- **And (D1182):** "The approve what i enter is in a very odd place. could u find space to put it nicely with good alignment" — the tick leaves its unlabelled row; drawn two ways for question 9 (A: its own row with a label in the label column, "APPROVE ☐ What I enter", above Which leave; B: in the window's title bar, before ✕) — design lesson 26.
- **And (D1183):** "Perhaps also include the colour coding of the leave etc we agreed on just now" — the bid windows' leave buttons wear look F's colours (design lesson 25 applied); drawn with question 9.
- **And (D1184):** "also just to confirm the dates will be for the period of the calendar i created yeah? which is usually yearly" — yes: the Approvals list's date choices are the whole period's months, as the "Open for bidding" window's month buttons, a month with nothing waiting dimmed; redrawn with question 7.
- **Q8 → A, and (D1185):** "8A Make balances more obvious to click on" — no second list; "Figures" becomes "Balances"; its heading drawn as a button like "Manning" (▸ / ▾) — design lesson 27.
- **Q9 answered (21 Oct 26): 9a → B (D1187)** — "the approve what i enter at the tile looks better something like this screen shot": the tick in the title bar; **9b → on by default (D1186)** — "9b it should default to enable" (he chose against the agent's "off each time"; told what it costs). D1147 and D1182 marked.
- **And (D1188):** "should 10 kinda standardise the location of where the buttons are for phone vs desktop …" — a button stands in the same place on a phone and a desktop (lesson 28); question 10 redrawn: A Approvals beside "+ New" on both (recommended), B beside the open dates on both — on a phone B's line overflows.
- **And (D1189):** "I think the data should align horizontally seems like the middle is very cluttered" — the Approvals line's figures in columns with headings (days, LVE Bal, lowest Avail, placed), a labelled grid on a phone; redrawn with question 7 — lesson 29.
- **And (D1190):** "Perhaps I should have an amber criteria to set in the rows of avail P and W for now." / "Like in a setting" — the Available rows get an amber point he sets (in the row's own window — the agent's reading); what it measures (a margin above Required, recommended, or a fixed number) put to him with a picture. This branch now takes **D1190–D1199** (checked 21 Oct 26: nothing above D1189 on any branch).
- **And (D1191):** "like a number +/- the stated number" — the amber point is set as a number plus or minus the day's Required; drawn in the Available P window with red beside it as the same kind of setting (Required + 0 by default, today's rule) — the agent's proposal, his to confirm; "+2" means amber when under Required + 2 (one or none to spare). D640 marked.
- **And (D1192):** "If the input causes multiple counters to go amber or red, it will show on the lowest avail" — every Manning row the request turns amber or red shows in the "Lowest Avail" column, each on its own line (lesson 20); drawn.
- **And (D1193):** "Take note the required P and W should also be allowed to be edited" / "The name of it" — Required P and W may be renamed, only their name (narrows D668); the build changes `leavewar/ui/FlyRows.tsx`, whose names are fixed today.
- **And (D1194):** "Perhaps colour code the row faintly so that people know which row is for which row for required and available" — the P pair one faint tint (the pilots' olive), the W pair another (the WSOs' green) — lesson 30; drawn.
- **His question "Things that dont require approval, i think they are medical correct? only leave or OIL"** answered (21 Oct 26, checked in `leavewar/ui/BidPicker.tsx`): yes — a medical, a course and overseas duty are filed on the Inputs page and are nobody's to approve; only leave (LL, OL and the other kinds — CCL, FCL, PL, EL, CL) and OIL placed on the Leave War wait in Approvals; leave filed on the Inputs page lands approved (D1166). Not a new ruling. **And his question "how would it look like on a phone if there are multiple counters"** — drawn (`../../mock/lw-overhaul/full/r4b-phone-approvals-stack.png`): one under another in the Lowest Avail cell; only that card grows.
- **Q10 → A (D1196):** "10A" — Approvals on the top line right after "+ New" / "+", on both; D678 and D679 marked.
- **Q7 → A (D1197):** "7A looks good" — no quick-approve switch; the dates choose a period, "Approve all" approves what the list shows. **Round 4 is answered.** Round 5 put (the page's version 30): Q11 dropped — he asked "11 is this necessary?" and it is not: lessons 20 and 29 already decide the day panel's stacked, columned rows (the agent applies them; a day not open for bidding says so on its first line); Q12 Management (A recommended: a Quals tick column, added as a group standing first); Q13 red as a setting beside amber (A recommended: "+ 0" by default, today's rule); and the readings and notifications to strike.
- **D1198:** "ok remove 11" — question 11 removed, lessons 20 and 29 decide the day panel. **D1199:** "We could also do this to show what has changed since the last visit" / "But design ur own way" — a "since your last visit" view, the app's own design, drawn before it is built; it must not repeat the bell (D1142). To design next, with question 12 and 13's answers.
- **Q12 → A (D1200):** "12 A" — a Management tick column on Quals, added as a group standing first; D1149 marked. This branch takes **D1200–D1209** (checked 21 Oct 26: nothing from D1200 on any branch).
- **D1201:** "can u design it such that u show all the balances of the user and also optimise the space to show as much leave data taken etc. And the balances can be editable" — the person window redesigned: every balance at once, editable (by the member until the admin locks them — D1203), his leave one line a request; to draw (the night of 21 Oct 26).
- **Q13 → A (D1202):** "13 yes" — red on Avail P / W a setting beside amber, "+ 0" by default.
- **D1203:** "By the members until the admin locks it" — a member edits his own balances until the admin locks them; whether the lock is one for everyone (recommended) or per person, drawn with D1201.
- **D1204:** "Should u just work on red teaming the total design? … plan it well before we build" then "/impeccable should help too" and "Also /design as well" — before anything is built, the whole design is red-teamed with Impeccable, the design guide and a fresh reader: the pieces working together, gestures, layout, taps to reach a place, button places and alignment, what can be edited, what-ifs; the build plan written from it.
- **D1205:** "I find this page very wordy and not clean and not intuitive. Fix it." (his picture: the Leave War's Settings window) — the Settings window redesigned, fewer words, clearer; drawn first, built with the overhaul.
- **D1206:** "The mock up should show me at the end what u plan to change with the update details we discussed" — the page ends with every Leave War screen as it will be after the overhaul, every ruled detail in, each change from today marked; drawn after the red team.
- **D1207:** "If u are done u can continue building those things that dont require my attention and its safe" — on this night, once the design work is done, settled pieces that need no look from him and can be fully checked may be built on a branch; nothing merges.
- **D1208:** his reply to round 6's Q1 — the admin is not flooded with notifications of new leave requests, during bidding (close the bids, then approve) or after (ad-hoc leave is daily operations); P5 struck; his questions back — a notification option at all, and a role for the URHO who runs the Leave War — answered the same morning.
- **Q4 → No (D1209):** "4 no" — a member cannot type his own OIL figure; OIL stays earned or awarded (D400, D402), a tap opens the OIL tracker. Narrows D1203 to the other kinds of leave.
- **D1210:** his reply to Q5 — "it should also allow a place to input remarks … in the event that its still pending because info is not updated by the user": a leave request carries remarks, as an Inputs-page input does; Q5 itself and his "follows the input area … till date check box" asked again. This branch now takes **D1210–D1219** (checked 22 Oct 26: nothing above D1209 on any branch).
- **Q6 → as recommended (D1211):** a member never bids on the Leave War before today, an admin may; on the Inputs page a member may still correct a wrong past input, and the scheduler publishes another EOD (as D178 already has it).
- **D1212:** "instead of how many change it to DATE. then How much change it to DURATION. Make sure the rest of the app that does it also changes to match it." — the bid window's rows read "Date" and "Duration", the drag-selection sheet's "Duration", the Inputs window's "When" becomes "Duration" (the agent's reading); lesson 31.
- **Q7 → yes (D1213):** Available P / W at amber or red count as under-manned, in the chip and the bid window's line; the architecture note amended.
- **Q8 → yes (D1214):** a member's bell is told when bidding opens or closes; a tap opens the Leave War with that bidding period in view (the register's P4 and P7 ruled in).
- **D1215:** on Q10 — "i want an option to exclude SANS which is the main way we operate": SANS stay off the Leave War unless put on, never in "Everyone else" (checked in the code: dropped from the roster before any group is drawn); Q10 itself asked again.
- **Q11 → as recommended (D1216):** the bell keeps "Approval of … taken back · Saber" when an Undo reverses a decision he has read; an unread one goes with the Undo; D1142 narrowed, P8 ruled.
- **D1217:** his correction of Q3's drawing — "pending", not "waiting"; the days pending in days (2½), not requests; the two LVE figures named plainly ("LVE app BAL vs LVE war BAL" — drawn as "App bal" and "War bal").
- **D1218:** carried-forward leave as the official leave system keeps it — a year's unused leave carries one year, then is gone; [LEAVE-YEAR] joins the overhaul.
- **N → no option (D1219):** no setting turns on admin notifications of new requests; the Approvals count is the one signal. This branch's range D1210–D1219 is now used; the next chat checks every branch for the next free number.
- **Q2 → as recommended (D1220):** one "Lock balances" switch for everyone in Settings, a padlock on every person window; D1203 answered. (This branch takes **D1220–D1229**, checked 22 Oct 26: nothing above D1219 on any branch.)
- **Q10 → as recommended (D1221):** "+ SANS" among the groups in place of the Show SANS switch; D882 narrowed.
- **R → admin (D1223):** the URHO who runs the Leave War is made an admin; no Leave-War-only role.
- **D1224:** leave always comes off the carried-forward days first (his answer to the check on D1218); Q3's layout to be reworked with Impeccable, the locked state showing no boxes (his point).
- **Q5 → A (D1225):** a member may delete his own pending bid on a closed day; D1176 and D1177 narrowed.
- **D1226:** the request's remarks carry the till-date tick, working exactly as on the Inputs page (D952, D953, D1095).
- **Q9 → as recommended (D1227):** a member's My leave in line 1, Manning folded and remembered; a bid that turns a row amber or red opens Manning by itself with a bubble naming the row; D1141, D678 narrowed.
- **Q12 → as recommended (D1228):** no zoom buttons on either; pinch on a phone, Ctrl+scroll / trackpad pinch on a desktop, the grid only; D1117 narrowed.
- **D1229:** a leave grade per person, set by hand (Senior pilot 36, Junior pilot 33, Senior WSO 21, Junior WSO 18, Ops A 14); the year's annual leave added by grade every 1 January, by itself.
- **D1230:** one page for an admin to enter everyone's balances and grades, designed with Impeccable from the colleague's version, drawn first. (This branch takes **D1230–D1239**, checked 22 Oct 26: nothing above D1228 on any branch.)
- **D1231 (round 14, question 1 — "as recommended"):** no "new" dot on the grid; Approvals' "New" choice (and a member's My leave) carries the dotted lines, cleared when the list closes; a request's dates, cyan with "›", scroll the grid there and ring the cell with the just-added ring; Approvals docked on a desktop, a slim bar with "Back" on a phone (`raptor-port/docs/mock/lw-overhaul/full/r14-dots-*`). Answers D1199. Built with M4.
- **D1232:** the main page has too many buttons and its sub-pages are hard to find (his point, 22 Oct 26): how the Leave War reaches its sub-pages and tools is looked at again with Impeccable, every button counted, options drawn for him on a phone and a desktop before anything changes; round 14's B1 waits on it. Lesson 33.
- **D1233:** on the balances page a grade's figure says what the app does with it: heading "GRADE · AUTO + LVE ON 1 JAN", each grade "+36" … "+14" (box, picker, phone line, Grades window). Lesson 34.
- **D1234:** the grades are the squadron's own list in the Grades window: add, rename, delete, drag into order, each with its days; D1229's five are the starting list. Deleting one people hold asks first and leaves them "No grade".
- **D1235 (his worked example):** every 1 Jan, by itself: the unused carried-forward days go, what is left of the year just ended becomes carried forward, the grade's days are added. 37 left with 4 carried fwd, a junior pilot: on 1 Jan 33 carried fwd, 66 in all. New balance = (left − unused carried fwd) + grade days; new carried fwd = left − unused carried fwd.
- **D1236:** on a phone the balances page shows every balance the desktop does (OIL, CCL, FCL, PL, EL, CL) on the page, not behind a tap, and pinches to zoom: names fixed, figures slide sideways as on the grid (D1228).
- **D1237** (how we work): what he should look at stands at the top of every mock-up page. **D1238:** the person window's balance tiles on one grid: kind labels on one line, main figures on one line, small lines on one line; inside LVE each label right over its figure. Lesson 35. **D1239:** every figure and label in the tiles aligns left, LVE's too; "3 taken" beside the LVE box, not over War bal (narrows D1238). Lesson 36. **D1240:** tabs design A redrawn with less height at the top (fewer rows or buttons), Manning kept at the left; "Under 1 day" (the count of amber/red days, a tap jumps to the next) put to him — recommended folded into Manning ("Manning · 1 short"). *Drawn round 19 (22 Oct 26, `full-r19-nav.mjs`, `full/r19-nav-*`, page version 43): row 1 the Inputs page's own tab row (Grid · Approvals 15 · Balances · OIL; a member Grid · OIL) with ⚙ at its right end; on a desktop View, the picker and My leave join it; on a phone row 2 is View, the picker and My leave (a member's D1227 line, now an admin's too, his third line gone); the grid card's bar [▾ Manning | 1 short ›] · the open dates · … · Legend; "+" a new period moves into the picker's list as its last line. Measured: desktop 50px less (one row), admin phone 27px less (four rows to three), member phone unchanged; 11 buttons above the grid, not 13. Put to him as N1–N3. His question on it (is "1 short" helpful with several days, amber or red?) corrected two of its readings against today's code: the chip counts only RED days (a Manning rule broken) and a tap opens their LIST ("Days breaking a manning rule", each with the row and figure), not a jump to the next; redrawn round 19c (`full-r19c-short.mjs`): A red only, "1 red ›" (recommended; would narrow D1213's amber for the count, the bid window keeping amber and red), B "1 red · 5 amber ›" (pushes Legend 36px off a phone); sample year 1 red, 5 amber.* *Design input, his words 22 Oct 26: a typical squadron adds about six more counter rows, and its events can take three rows; drawn in round 20b (`full-r20-real.mjs`).* **D1255:** OIL read only on the balances page, "›" to the OIL tracker; an opening balance given once there as an award. **D1254:** the navigation as drawn in round 19 (tabs; narrows D1196, D1231, D678, D679, D1141, the 5 Sep 26 grid bar). **D1253:** 3c, his stacked tile as corrected. *The order of people: the balances page lists everyone in the grid's order, as the OIL tracker already does — both read the one roster order (`displayRoster`), so a Rearrange on the grid moves all three (checked in the code, 22 Oct 26).* **D1252:** the tiles close under "Balances"; a small tile's "Pending" / "War bal" lines words left, figures right; "Pending" a grey label, only its figure amber (narrows D1251, D1239). **D1251:** every pending figure on the balance tiles and the balances page is amber, LVE's too. **D1247:** the balance lock on the balances page, "Lock for members" (narrows D1220). **D1248:** a "Days taken" second view there. **D1249:** no "No grade" chip. **D1250:** the build plan approved (M1 may start; each merge waits on its open questions). **D1243:** the Manning button's right half counts red days only, "1 red ›", a tap lists them (answers D1240; narrows D1213 for the count). **D1244:** "+" a new period becomes the period list's last line, "+ New period" (narrows D678, D679). **D1245:** the grid's Balances fold goes; each name keeps its LVE figure (narrows D1185). **D1246:** halves written .5 everywhere, never ½ (answers 3b; narrows D1241, D1217; lesson 37). **D1242:** members get the Balances tab too (N4): everyone's balances on one page; while unlocked a member edits his own row there (App bal, carried forward, CCL…CL — never OIL or his grade); locked or another's row, read only; narrows D1230, widens D1203. **D1241:** the balance tile approved as drawn in round 18 (`full/r18-lve-*`) — 3a answered; 3b, 3c open. (This branch also takes **D1240–D1249**, checked 22 Oct 26: no branch above D1236.)
- **The grid study answered (22 Oct 26, "G1 2 and 4 as recommended. Leave E out first. Means that events are shown as full rows"):** **D1256** (G1) the month buttons first, then the dates, then the Manning rows straight under them, then the Event rows, then the people; **D1257** (G2) the month band row over the dates goes, the first date of each month keeps its name; **D1258** (G4) on a phone Manning opens folded for everyone, admins too, remembered per person (widens D1227); **D1259** (E) the events stay full Event rows as built: G3 (tags in the date heading) and G3b (an Events fold) are not built, and the round 21 study (A tags with a fold, B an events lane, C leave events only; `../../mock/lw-overhaul/full-r21-events.mjs`, `full/r21-ev-*`) is parked as [LW-EVENTS-LANE]. Drawn as decided: `../../mock/lw-overhaul/full-r21-rows.mjs`, `full/r21-rows-*`. All in M2.
- **The rounds that follow, re-cut to four questions each (21 Oct 26):** round 3 — Q2 again (drawn his way:
  `../../mock/lw-overhaul/full/p4b-*.png`, script `full-cells2.mjs`), Q4b (his question "in what scenario": the clash rules allow only leave during a course or overseas duty, leave beside
  ATT B, and an FO given by hand on a leave day; recommended now C — the leave fills the cell, the other a strip down its right
  edge in its own colour — since three letters do not fit side by side; any answer narrows D1146), Q5, Q6; round 4 — Q7
  to Q10; round 5 — Q11, Q12, then the readings and P1–P6 to strike. Put on the published page, version 2.

**His open questions, to answer on the full mock-up with a recommendation each:** 1 the month or the year view; 6 colour
by leave type, and marking what came from the Inputs page (D1145 decides the halves, not the colours); 9 the waiting look
(ours, or theirs' outline with an orange dot); 10 a quick approve, or approve all for a selected period; 11 whether Ack
goes; 17 what members see of the periods being bid or approved, if the stages go; 18 whether a Balances list is needed
beside the figures; 19 whether "Figures" is renamed "Balances". **Rounds 2 to 4 of §4 are folded into the full mock-up**:
what his list already answered is not asked again.

## 6. The build, once he has answered

Batches by area (D1087), each its own branch, bug check and "merge live":

1. **His own leave** — Q1 to Q4: the line and his list, the bell's lines, the bid windows' balances. Tier: FULL (notices on a
   record others act on, permissions, saved data).
   - **The bell:** a new kind of notice, written inside the war's own decide, move and delete commands, so the admin's Undo
     takes the notice with it (D148) — the skip in `src/state/notices.ts` for a war-approved leave stays, or approving would
     read "You were added". The bell's notice permission (`src/state/perms.ts`, `../../data-model.md` §11, the `Notice` row)
     allows today only a notice inside a change to a named input or the holiday one: both widen together (D200).
   - **Saved data:** the decision notices are new stored notices (`../../data-schema.md`, `../../data-model.md`); they grow
     [NOTICE-RETENTION]'s question.
   - **The top rows:** the line's place per his answer to Q1, re-measured at his iPhone's width and 431–700 (D1000, D1016).
2. **The day panel** — Q3: the war's own day reader (`engine/dayview.ts`), drawn outside the grid so the grid's speed rules
   are untouched (`../../performance.md` §E); it shows only what the grid shows (letters and state, never a remark — a
   member reads every row of the war, D1008, but no more). Tier: WALK.
3. **The scheduler's side** — round 2: the list and "approve all" each one command and one undo; a refused line reported,
   never a whole-list failure (`leavewar/inputgate.ts`, the clash rules); a No Leave rule, if he takes one, at that one gate
   so the Inputs page obeys it too, with the Event sheet's words; "who placed it" a new stored field (`engine/warrecs.ts`).
4. **Finding things** — round 3: the filter's saved choice is a per-person view setting, not a record; it never moves a
   count (the groups invariant, `.claude/rules/decisions/leave-war.md` §Settled).
5. **Balances over years, manning** — round 4, with `[LEAVE-YEAR]` and `[LW-COMMIT-MANNING]`.

**Added by the full mock-up (§9) — each a new stored record and a permission row, changed together (D200, D473):**
6. **Open dates in place of the stages (D1177)** — FULL: the open stretches stored per period (the "Open for bidding" window,
   its month buttons and calendar icon — D1168, D1169, D1172); the stage dropped; who may bid on a day asks the open dates at
   the war's write path only — the Inputs page is never stopped (D1166); the closed note (D1176); the period that opens, the
   clash note's words, the moved mark, remarks and Undo per D1177's readings; `perms.ts` and `data-model.md` §11 together.
   *(Written "Locks in place of the stages" until 21 Oct 26 — corrected by the D201 sweep of D1177.)*
7. **The cell** — the halves and two entries stacked, the waiting look and Ack's removal (Q2–Q4): the grid's speed rules
   (`../../performance.md` §E) measured before and after; the Legend rewritten; "Figures" renamed "Balances", its heading a
   button (D1185); the Available rows' amber and red settings (D1190, D1191) and the Required rows' names (D1193).
8. **The scheduler's side** — Approvals with its dates filter (the whole period's months, D1184) and Approve all (one
   command, one undo, a refused line reported); each line the person's puck, the kind's coloured box, "LVE Bal", his own
   seat's lowest figure and a document icon (D1178, D1180, D1181); "Approve what I enter" in line with the window's rows
   (D1182) and the leave buttons in their colours (D1183); who placed a request and when (a new stored field — the list's
   oldest-first order rests on it).
9. **Documents on every entry** — a document list on the war's request record, carried to the Input on approval; the
   leave's document ask on the Inputs page; the reminder the day before (the register); the Inputs page's type filter
   picking a whole family, with "No document" on a leave or medical row without one (D1179 — a view setting, no record).
10. **Events and holidays** — the events list on the war; Export / Import on the Holidays list (one record, D638).
11. **Management** — per Q12's answer (a Quals column, or a picked list stored on the war).

**What it touches across the app (the standing order, `../../feature-impact.md`):** the bell is shared by every page; the
Inputs page carries the same leave once approved; the database's table list grows by the notices and any new field; a
member already sees every row and figure of the war (D1008).

## 7. The red team (21 Oct 26 — a fresh, blind Opus reader)

Ten findings; every one acted on before round 1 went to him.

| # | Finding | Done |
|---|---|---|
| 1 | A No Leave day not blocking a bid is his deliberate choice ("colours only for now", urgent leave still goes through), not a gap; blocking it on the war alone leaks, because leave filed on the Inputs page reaches the war | §2 row 6 corrected; round 2's question names his choice, offers refuse / ask first / leave it, and puts any rule at the one inputs gate |
| 2 | "Not told at all" was partly wrong: a change to an approved leave goes through the Inputs door and probably tells him; a refused or replaced bid never reaches the bell; simply removing the skip would make an approval read "You were added" | §2 row 2 corrected; Q2 covers approve, refuse, put back, move, delete and a replaced bid, not Ack; §6 calls for a new kind of notice inside the war's commands, with undo |
| 3 | Q1 (both options) and the requests list change rulings they did not name (D678, D679, D1000, D365) | Q1 names them; on a desktop Q1's chip uses the stage row's free room, no new line (redrawn); round 2 names D678/D679 |
| 4 | Q4's one cost line cannot be right before a type is picked (each type draws a different balance; weekends take nothing), and it left out the drag-selection window | Q4 redrawn: A the balance on each leave button, B pick then confirm; a weekend example; both windows (D264, D418) |
| 5 | A "Today" button at the end of the month strip breaks the phone strip's twelve-on-one-line rule | Round 3: desktop only; the phone's way to today put as its own choice |
| 6 | "People with leave in the months shown" would make rows come and go while scrolling; the filter and sort by flight were one question | Tied to the bidding window; a filter never changes a count; sorting by flight its own question |
| 7 | Three pictures showed facts the app does not store ("bid on Thu 8 Jan", "5 used this year") and a bell line without who decided (D769) | Redrawn: "2 days", "already less the 2 waiting · 20 given", "· Saber"; "who placed a bid and when" added as a missed idea (§2 row 9, round 2) |
| 8 | §6 missed the bell's notice permission (D200), the new stored data, one command and one undo for the list's actions, and that the day panel must show no remarks | §6 rewritten with each |
| 9 | Questions bundled (requests list, filter, yearly balances); Q8's "admin's leave" unclear; Ack missing from Q2; Q1 and Q2's B both a line on the war | Split one decision a question; Q8 "any row he fills"; Ack named in Q2; Q2-B says it would live inside Q1's line |
| 10 | Ours shows one balance (already less the waiting), theirs two; Q3 cited D996 for the day panel at the foot (it is D997) | §2 row 15 corrected; Q1 says the figure counts the waiting; D997 |

**Checked and fine (the reader's list):** the bell skips a war-approved leave; a waiting bid counts in the balance at once
and a refused one does not; a member reads every row and figure (D1008); members bid only inside the bidding window; the
bid window has "Pick a range" and the "tap again" ask; no date heading answers a tap today; the day panel's figures match the
grid; the commitments question may be asked now (D998); no finding rests on stored data alone (D56). **D1140** read against
its full row: fine; its second half (rounds of four, pictures) is the standing method, marked as the agent's reading.

## 8. His page of pictures

Round 1, published for him as a page with the pictures today beside proposed, tap to zoom — link in `HANDOFF.md`'s block
for this branch. **The full mock-up (§9)** is a page of its own: source `../../mock/lw-overhaul/full-page.html`, its pictures
`../../mock/lw-overhaul/full/`, its link in `HANDOFF.md`'s block. The notifications register it fed: `../../notifications-register.md`.

## 9. The full mock-up — the plan (21 Oct 26, his ask after the 22 points)

*His words: "Create a full mock up on what u think the app should change into … use the design skill to help think what
is the best interface to go with. easy and simple to understand".* Shaped with the design skill (`/impeccable shape`,
D819): an **extension of an established look**, not a new one — the Raptor look stays (D765), the new parts are drawn
with the app's own pieces (its window, chip, row and button styles), and no colour is spent that the design guide's §4
table already gives a meaning. The skill's discovery questions were not put to him: his 17 rulings answer them, and a
design question without a picture would break D853 — the agent's call, said in its first report.

### 9.1 What the new Leave War is, in one paragraph

**One grid, read at a glance; one list to decide; a lock instead of stages.** The year grid stays the heart of the page.
A member opens it on his phone and sees, without scrolling, his own line ("My leave" — D1141); a tap on a date gives that
day (D1143), a tap on a name gives that person's leave by year (D1148). Each day's cell says what is booked and where it
stands: the morning in the top half, the afternoon in the bottom half (D1145), two entries one above the other (D1146).
An admin decides from one Approvals list with a count (D1152), or on the grid as today; "Approve what I enter" saves him
the second step on his own entries (D1147). The cycle of stages (draft, bidding, closed, published) gives way to **lock
dates** (D1156): a lock, with its reason, is the only thing that stops a member adding, changing or removing leave, and
every request shows its state live. Documents ride on every entry (D1150); the bell tells a member every decision
(D1142); holidays come in by file and events have a list (D1155); Management is a group at the top (D1149).

### 9.2 The pictures — today beside proposed

Drawn into the real local build (the clock held at Thu 8 Jan 26, the demo squadron staged through the app's own controls:
Ranger the member, Saber the admin), at his iPhone's size (390 wide, 3x, the grid at its phone zoom of 0.8) and a desktop's
(1536 at his 125%); a screen that does not exist today is drawn in the app's own style; the cell's every state is drawn on
one page in the app's own chip styles (the design guide's §7). Every new part is marked and numbered. Scripts:
`../../mock/lw-overhaul/full-*.mjs`.

| # | Screen | Today | Proposed | Built in / asked |
|---|---|---|---|---|
| 1 | The page, member, phone | two lines; the stage chip and the bidding dates | three lines: period · viewing as; locks · under-manned · Legend; My leave; the new cells; "Balances" | D1141, Q2, Q5, Q8 |
| 2 | The page, admin, phone | the same two lines | the second line: Approvals · locks · under-manned · Legend; My leave third | Q10 |
| 3 | The page, admin, desktop | the stage row | Approvals · Lock dates · under-manned · Legend, My leave at its free end; Management first | D1141, D1152, Q5, Q12 |
| 4 | Every state of a cell, on one page | `<LL` / `LL>`, "+1", waiting plain, Ack purple, the Inputs edge, moved, the clash corner, the PO tag | the AM top / PM bottom halves; two entries stacked; HO; three records; each look of Q2; both of Q4's sizes | D1145, D1146, Q2, Q3, Q4 |
| 5 | Year or month | the year grid | ours beside the colleague's month | Q1 |
| 6 | A person's leave | "every figure" | balances, then his leave by year with each state; a year picker | D1141, D1148, D1153 |
| 7 | The bid window | leave buttons; Ack · Approve · Refuse | balance on each button, the stacked day line (D1144), "Approve what I enter", a document; Ack gone | D1144, D1147, D1150, Q3, Q9 |
| 8 | An entry already placed | decide, move, delete | + who placed it and when, who decided, its documents | D1150 |
| 9 | The day panel | (no tap today) | its manning rows stacked; a locked day's reason as its first line | D1143, Q11 |
| 10 | Approvals | (none) | one list, a line a run; a dates filter and "Approve all"; empty; a line the clash rules refuse; a balance below zero | D1152, Q7 |
| 11 | Lock dates | the stage strip; the out-of-window dim | the list of locks with reasons; a new period locked whole and opened by shortening its lock; the dim + a lock on the date heading; a member trying the Inputs page | D1156, Q5, Q6 |
| 12 | Events, and holidays by file | the Event rows; the Calendar window's Holidays list | an events list on the war; Export / Import on the Holidays list, with a preview | D1155 |
| 13 | Available P / W | the row's window (crew, CAT, holding, without — built, D640) | the same, and one line on how the SANS calendar uses it | D1154 |
| 14 | Management | Quals' columns; ⚙ "Add a group" | a Management tick on Quals; added as a group, standing first | D1149, Q12 |
| 15 | Inputs page: a leave | the medical window's document ask | the same ask for a leave, never a stop | D1150 |

### 9.3 His open questions — each with a recommendation and its picture

Rounds of at most four, one decision a question, none waiting on another's answer (D853, D921); nothing he has ruled is
asked again (D53); a question names each ruling its answer would change (D754).

**Round 2 — how the grid looks**
- **Q1 (his 1) — the month or the year?** *Recommended: keep the year grid.* A leave runs across a month's end, a bidding
  stretch over months, and the manning rows are read across weeks; a month at a time pages them apart. The phone gets its
  day panel (D1143) and pinch to zoom (D1117) for the close look. B: a month at a time, as the colleague's — it changes
  §Settled's year grid and its window of months. Picture 5.
- **Q2 (his 6 and 9 — one question, because the waiting look depends on what the colour means) — how a cell shows its
  type and where it stands.** *Recommended A: the colour is where it stands (green approved, red refused), a waiting one
  wears a dashed outline in its letters' colour, the letters say the type, and an Inputs-page entry keeps its accent left
  edge.* A colour in this app means a status (design guide §4): a colour per type would spend green (a public holiday,
  OIL earned), red (a clash), amber (a manning row running short) and orange (a No Leave day). B: as today, waiting plain.
  C: a soft tint per leave family (leave, OIL, medical, course and duty), where it stands by its edge (solid, dashed,
  struck through). D: the colleague's, a colour per type, waiting outlined with a dot. A dashed outline is a new kind of
  mark, his to rule (§4); it is drawn beside the dotted "moved" edge on one chip. It changes the Legend. Picture 4.
- **Q3 (his 11) — Ack goes?** *Recommended: yes.* It says only "seen"; it tells the member nothing (D1142 leaves it out of
  the bell), and the Approvals list shows what waits. It changes D331's Decide row (Ack · Approve · Refuse → Approve ·
  Refuse) and the Legend; purple is left to "this is you". Picture 7.
- **Q4 (D1145's room) — a half day's letters.** A row is 22 high, and on a phone the grid opens at 0.8 (§Settled), so a
  half is about 9 points tall. A: every row grows to fit two lines of letters (fewer people on a screen). B: rows stay; a
  half's letters are drawn smaller, a whole day's as today. *The recommendation is written once both are drawn and
  measured at his phone's size.* Picture 4.

**Round 3 — how it runs**
- *(The table below is the lock-era draft — written for lock dates, D1156, since archived; his answer D1177 decides instead: the green outline stays round the open dates, nothing is open until he opens it, Undo takes back opening or closing dates. The build takes its rules from D1177's full row and the narrowed D418, D333, D352, D1166 — the build plan §3, batch 1.)*
- **Q5 (his 17) — the stages go, and what takes each one's place.** *Recommended: they go, each replaced as below; a
  member sees every request's state live, and a locked stretch's reason in the day panel — no separate "being bid / being
  approved" label.*

  | What the stages do today | What takes its place (recommended) |
  |---|---|
  | members bid only inside the bidding window, while the war is open | a member adds, changes or removes his own leave on any date not locked and not yet past; an admin at any time |
  | the bidding dates chip (1 Jan – 31 Mar) | the lock list; a new period starts locked whole ("Not open yet") and the admin opens months by shortening that lock |
  | the green outline round the bidding dates (§Settled, D881) | gone; a locked day keeps today's quiet dim, with a small lock on its date heading |
  | the admin decides in every stage but draft (D418) | the admin decides at any time |
  | while bidding is open a member may re-bid even his own approved day (his tap opens the bid window, "NOW LL" — checked 21 Oct 26); a published war's approved leave offers only its remarks, frozen even for the admin (D418) | an approved leave is never moved or deleted by the member himself (he asks); the admin may change it at any time and the member is told (D1142) |
  | a member adds remarks to his approved leave only once published | at any time |
  | a member moves his own bid while bidding is open (D333) | while it waits and its days are not locked |
  | the dotted "moved" mark, only after bidding closes | on any move of a leave already approved |
  | Undo takes back a stage move (D352) | Undo takes back adding, changing or removing a lock |
  | the war opens on the war being bid on (§Settled) | it opens on the first date from today a member may bid on, in whichever period holds it; with none open, on today |
  | the clash note's "Step the war back to Bidding Closed" (D827) | "Change the approved leave" (the admin may at any time) — its words put through §1b before the build |
  | his own flow, D413: create → open → bid → close → publish → remarks | create (locked whole) → open months (shorten the lock) → bid and decide live → lock "Approvals in progress" if wanted → he texts the squadron |
  | a No Leave day colours its column only (his choice, so urgent leave goes through) | unchanged; a lock is how bids are stopped |
  | the stage stored on the period, and its permission | dropped; the locks stored instead |

  Pictures 1, 2, 3, 11.
- **Q6 (the red team's first finding) — a leave filed on the Inputs page, under a lock and in Approvals.** Today a leave
  filed on the Inputs page lands on the war already approved (the 19 Sep 26 arrangement — "asked verbally, told yes"), and
  the one inputs gate checks no stage, so a lock would not hold there and the Approvals count would miss it. *Recommended:
  a member's leave filed on the Inputs page obeys the locks and waits in Approvals as a bid does; an admin's lands approved,
  as "Approve what I enter" does.* It changes the 19 Sep 26 arrangement and D413's "later changes mainly by the member
  through inputs"; D1152's "counter increases for any new inputs that is not approved" is his own word for it. B: as
  today. Picture 11.
- **Q7 (his 10) — quick approve, or approve all for a period.** *Recommended: no quick-approve switch (§3); the Approvals
  list gets a dates filter, and "Approve all" approves what it shows* — "approve all for a selected period"; the grid's
  drag-select stays. Picture 10.
- **Q8 (his 18 and 19 — one question, one place) — the balances list.** The list he asks about is already there: the
  "Figures" drawer above the names (every figure for everyone). *Recommended: no second list; the drawer, its heading and
  the person window's line are called "Balances"* — the days-used columns stay inside it, as today. B: keep "Figures". C:
  a Balances window of its own. Picture 1.

**Round 4 — the agent's readings he has not yet seen drawn**
- **Q9 — "Approve what I enter" (D1147).** *Recommended: off each time the window opens.* Picture 7.
- **Q10 — where Approvals and Lock dates open (D1152, D1156).** *Recommended: chips in the row where the stage was — on a
  phone its second line — so no line is added* (D678, D679, D1141 named). Pictures 2, 3. **Re-cut for round 4 (21 Oct 26,
  after D1177 — no Lock dates chip):** where Approvals opens. *Recommended A: where "Viewing as" was (D1173) — the top line,
  after "+ New", on a desktop and a phone — so the second line (the open dates, under-manned, Legend) is the same for
  everyone.* B: first on the second line, beside the open dates — fits a desktop; on a phone the line overflows by about 29
  points (measured on the drawing) and Legend leaves the screen. Pictures `../../mock/lw-overhaul/full/r4-*-admin-{A,B}.png`,
  script `full-r4.mjs`.
- **Q11 — the day panel (D1143, lesson 20).** *Recommended: its manning rows stacked one a line, names in one column and
  figures in a second; a locked day's reason as its first line.* Picture 9.
- **Q12 — Management (D1149): a tick on Quals, or picked on the war?** The war's groups today come from Quals' columns (⚙
  "Add a group"). *Recommended: a Management tick column on Quals, added as a group on the war and standing first* — Quals
  stays the one place a man's facts change (D460, D461); a man in Management still counts in his own seat (a group never
  moves a count, §Settled — not asked). B: a list of people picked on the war itself. Picture 14.

**The agent's readings, said with the pictures (he may strike any):** a leave's document is opened by whoever can open the
entry, as a medical one is (D211); a bid's document goes with it when it is approved (the bid becomes the Input) and stays
when it is put back or refused; documents stay in each browser, as the medical ones do, until the shared database (D1150);
Approvals is the admins' — a member sees his own waiting requests in "My leave"; the holiday import lives on the Calendar
window's Holidays list and writes the same record as the war's Event row (D638), and the events list is new on the war's
⚙; the holiday sheet is a CSV file that opens in Excel, its columns in plain words (date, last date, name, short form),
and the import lists what it will add and what it skips before anything changes (D1155); "Available P / W" need no new
form (D640, D1154) — one line on how the SANS calendar reads them is new.

### 9.4 What the drawing is not

Nothing is built into the app and nothing merges. What his 22 points did not reach stays for a later round: the
"Show ▾" filter, sorting by flight (D1001), a way to today, yearly balances ([LEAVE-YEAR] — the person window lists leave
by year, its balances one figure each until then), and whole-day commitments in manning (D998).

### 9.5 The red team of this plan (21 Oct 26 — a fresh, blind Opus reader)

| # | Finding | Done |
|---|---|---|
| 1 | Leave filed on the Inputs page lands approved and passes the inputs gate, so it would slip past a lock and the Approvals count | Q6 added, naming the 19 Sep 26 arrangement, D413 and D1152; picture 11 shows a member trying it |
| 2 | "The stages go" gave no replacement for several things they do, and missed some (frozen approved leave, remarks, the moved mark, the clash note's words, D413, which war opens, past dates) | Q5's table: each thing, what takes its place, recommended |
| 3 | A tap on a date heading is the day panel (D1143), and a hatch is already the posted-out and not-drawn-yet look | the lock's reason is the day panel's first line; a locked day keeps today's dim plus a small lock |
| 4 | Today's halves read `<LL` / `LL>` (a trailing `*` is an app-earned OIL credit); two whole-day records, HO, three records and the corner marks were unspecified; a half is ~9 points on a phone | picture 4 draws every case at his phone's zoom; Q4 asks the room |
| 5 | The waiting look depends on the colour question; a dashed outline sits beside the dotted moved edge | Q2 holds both; one chip drawn waiting, moved and filed on the Inputs page |
| 6 | The balances answer said columns sort by a figure (they do not); the list he asks for is the Figures drawer | Q8 rests on the drawer |
| 7 | The Management question re-asked a settled rule (a group never moves a count); groups come from Quals columns | Q12 asks Quals tick or picked on the war, naming D460, D461 |
| 8 | The old No Leave question vanished | a row of Q5's table: unchanged, a lock does the stopping |
| 9 | The admin's phone top was never drawn | picture 2 |
| 10 | The notification register was not scheduled | written with this mock-up (`../../notifications-register.md`), its new entries put to him |
| 11 | Ack's removal changes D331 and the Legend; the month view changes §Settled | named in Q3 and Q1 |
| 12 | Missing states: Approvals' empty, refused-by-clash, undo, below zero, who sees it; documents' viewers and their fate on approval; where the import lives; §6 out of date | picture 10's states; the readings above; §6 extended |

## 10. The red team of the whole design (D1204 — night of 21–22 Oct 26)

*His words: "red team the total design … make sure they interact properly. Down to the minute details on like gestures,
how the screen set up should be, does it take a lot of taps to get to one place … the position of the buttons,
alignment, edit ability. Red team some what ifs."* Run after tonight's three drawings (§10.1): two fresh, blind Opus
readers, each without the other's report — **A, the design** (Impeccable's critique on the design guide, every task's
taps counted) and **B, the what-ifs** (each tried against the real stores where it could be). Their reports, whole:
`../briefs/2026-10-22-lw-overhaul-red-team-A.md`, `…-B.md`; the brief `../briefs/2026-10-22-lw-overhaul-red-team.md`.

### 10.1 Tonight's drawings

- **The person window (D1201, D1203)** — `../../mock/lw-overhaul/full/r6-person-*.png`, script `full-r6-person.mjs`:
  every balance in one grid (LVE across two, OIL, CCL, FCL; PL, EL, CL, MED across two — the same grid on a desktop),
  left large and used small, each code its look-F box; a tap on a figure turns it into a box; his leave one line a
  request in lined-up columns; the year picker; locked, the member's figures read only under a small lock; the admin
  edits locked or not; a member opening another man's window reads it all (as today, D1008). The lock drawn both ways:
  one switch for everyone, per man.
- **"Since your last visit" (D1199)** — `full/r6-visit-*.png`, script `full-r6-visit.mjs`: **A** (recommended) "● 3 new"
  on "My leave" (the member) and on Approvals (an admin), the new lines dotted with the bell's own unread dot, fed by the
  bell's lines so reading in one place clears both; **B** a dot on each changed cell; **C** the bell alone.
- **The Settings window (D1205)** — `full/r6-settings-*.png`, script `full-r6-settings.mjs`: labelled rows (Year ·
  Manning · Event rows · Balances · Groups), every explaining sentence gone (the list of words removed is in
  `../briefs/2026-10-22-lw-overhaul-night-drawings-results.md` §3), a group's count a button that shows who is in it,
  Management first, "Everyone else" a pinned last row, the two resets together at the foot. Found: the pink
  "1 NEW Events…" in his phone picture was round 2's mock-up mark, not the app.
- The helpers' reports, whole: `../briefs/2026-10-22-lw-overhaul-night-drawings-results.md`.

### 10.2 What the red team found, and what is done with each

**Settled by the agent** (a technical or a design-guide point — drawn into the final set, §10.4, and carried by the build
plan; he may strike any):

| # | What goes wrong | The fix |
|---|---|---|
| A1 | "My leave"'s list (tall cards) and the person window (one-line rows) draw one man's leave two ways | one window: a tap on "My leave" opens his own person window; its one-line rows; a row new since his last visit wears the bell's dot and a muted "who, when" line; a deleted leave shows struck through for that visit; the day panel's "Away" list uses the same row |
| A2 | the bid window's Document button cannot be reached — a tap on a leave writes the bid and closes the window | Document stands above "Which leave"; a file picked first goes onto the bid the tap writes |
| A4 | "Approve all" approves 15 people and rings 15 bells in one tap, in green (green already means approved / open) | the app's own "tap again" inside the button ("Approve 15 — tap again"), one Undo; the line buttons plain, Refuse with red words; Approve all in the main-button look |
| A5 | desktop windows open over the very dates their lines name; on a phone the bid window can cover the tapped row | desktop: Approvals and the person window open docked to the grid's right edge, still draggable (D641); phone: the grid first scrolls the tapped cell above the window |
| A7 | a pinch's first finger can arm a selection (held 180 ms); a drag across the month buttons on a phone's two rows passes months it should not | a second finger cancels an arming or armed selection; a month drag runs in calendar order from the first month to the one under the finger, never along the path |
| A8 | with "Approve what I enter" ticked a tap approves and rings a bell, but the buttons look the same either way | the leave buttons are filled (approved look) while ticked, hollow and dashed (waiting look) when not — and always hollow for a member |
| A9 | the admin's desktop bid window wraps (CL alone; +OIL · PO · PI an unlabelled row) | two even rows of four, as on the phone (lesson 28); the admin's three labelled "Also" |
| A11 | a phone Approvals line is four lines tall, three a screen | two lines: puck · box · dates · paperclip · Approve · Refuse; then the figures under column headings drawn once |
| A12 | smaller: Settings lost its way to Rearrange; Required P / W not marked as renamable; the day panel lists plain names; two pictures give Ranger two figures; "+ SANS" under "Add from Quals" | a "⇅ Rearrange" button in Settings' Groups heading; the rows' names drawn as the Available rows' are; pucks in the day panel (lesson 25); one figure; the heading stays "Add a group" |
| B1 | the bell would tell a member twice, once wrongly — the war's put-back, move and delete of approved leave already ring "dates now…" / "deleted" through the Inputs door | while the war's own door writes, the Inputs door's notice skips war-placed leave and the war writes its one line (D1142); Inputs-page changes keep telling him |
| B2 | the code reads "no open dates" as the whole year open — the opposite of D1177 | empty means closed; one rule answers "is this day open" everywhere (the cell, the dim, the outline, the landing day); a test pins "a new period takes no member bid" |
| B3 | a day's openness is asked of the period on screen, the bid written into the period holding the date (a range 30 Dec – 5 Jan wrote five days into the 2027 period) | ask the period holding each date (latent today — the bid window's range picker stops at the period's last day, checked 22 Oct 26; it matters once open dates or a shared database let a write reach past it, so it is built with the first merge, not alone) |
| B6 | a member's own balance edit (D1203) would be refused by today's permissions, leave no history line, and accept 12.3 | a member may write only his own balances, only while the lock is off — read when saved, his Undo after a lock refused alike; a history line "LVE balance 18 → 20 · Ranger"; halves only |
| B8 | the permission check knows nothing of open days; two admins could decide the same request from two screens | the open-days check joins the war's permission; a decision taken from a state since changed is refused ("Already refused by Hex"); `../../data-model.md` §11 with it (D200) |
| B9 | a document is lost when an approved leave is put back to a bid | the carried record holds its documents; deleting one day never deletes a document another day still names |
| B10 | Management does not stand first — today a qualification group is added after TF or NVG if they are shown | Management goes first, on the page and in "Who wins" |
| B12 | a man with no row (SANS, Show SANS off): "takes the grid there" goes nowhere · a drag across months must be one command (one Undo, one repaint) · a posted-out man's waiting bids · "No leave period yet" still says "starts in draft" · a renamed Available row on the SANS day | open his person window instead · one command on release · his line carries his posting tag · the words follow D1177 · D626 stands on the SANS day ("Available") |

**Questions for him** (each changes what a ruling means, so none is applied — §10.3).

### 10.3 Questions waiting for him (in rounds of four, each with its picture in the final set)

Round 6 — his own leave and balances:
1. **"Since your last visit" (D1199): A, B or C?** *Recommended A*, drawn into the one window (A1).
2. **The balance lock (D1203): one switch for everyone, or one per man?** *Recommended one for everyone*, its switch in
   Settings' Balances row, a small padlock on every person window's Balances heading.
3. **What a member types into his balance.** "Left" already takes off his waiting bids (D1153), so copying his official
   figure would give his waiting days back (A3, B7). *Recommended:* while he edits, the box shows and takes his
   official figure — the balance before waiting bids — with "left after your 2 waiting: 9.5" under it; at rest one
   figure as today; "used" counts the year picked, not every year.
4. **May a member type his own OIL figure?** *Recommended no* — OIL is earned from the published schedule or awarded by
   an admin (D400, D402); a tap on OIL opens the OIL tracker.

Round 7 — bidding:
5. **May a member delete his own waiting bid on a day since closed?** (B4) *Recommended yes* — it gives leave back and
   raises manning; that day's note: "Your bid waits for a decision. Delete it if you no longer want it."
6. **Past days:** *recommended* a member never bids on a day before today; an admin may (B5).
7. **Do Available P and W at amber or red count as under-manned** — in the under-manned chip and the bid window's line?
   (B11) *Recommended yes.*
8. **Is a member's bell told when bidding opens or closes?** (the visit helper's Q2) *Recommended yes* — one line, "Bidding
   open 1 Apr – 30 Jun · Saber".

Round 8 — the screen:
9. **A member's phone shows the first name 54% of the way down** (A6). *Recommended:* the Manning fold is remembered for
   each person and a member's opens folded; "My leave" fills the empty right half of the first line on a member's phone
   (narrows D1141, D678).
10. **Show SANS as "+ SANS" among the groups, hidden by its ✕**, in place of its switch (the Settings helper's Q1;
    changes the switch whose look D882 ruled). *Recommended yes.*
11. **Undo of an approval he has already read:** *recommended* the bell keeps "Approval of LL 10–11 Feb taken back ·
    Saber" (B12).
12. **On a phone two "+" sit three rows apart** (a new period, zoom in). *Recommended:* the zoom pair become magnifiers.

### 10.4 Every screen as it will be (D1206)

The page ends with every Leave War screen as it will be built — every ruling and §10.2's fixes in, each question of
§10.3 drawn with its recommended answer and marked "your answer first". Pictures `full/r7-*.png`, scripts
`full-r7-*.mjs`.
