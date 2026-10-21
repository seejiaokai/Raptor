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
  balance on each leave button stays in all three. Waiting on his answer.
- **He has more questions of his own** (21 Oct 26, "hold on i have alot more questions but u can continue to suggest") —
  taken next, before round 2 is put.

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
for this branch.
