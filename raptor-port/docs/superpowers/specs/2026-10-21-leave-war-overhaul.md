# The Leave War overhaul — design note (D1140, 21 Oct 26)

**Status:** planning. Round 1 of his questions is out; nothing is built. Backlog item: `[LW-OVERHAUL]` in
`../../../../OUTSTANDING.md`. Branch: `claude/leave-war-overhaul` (planning only). Pictures and the script that drew them:
`../../mock/lw-overhaul/`.

**His words (D1140):** *"Should we create another worktree chat for a major overhaul planning of the leave war? … I saw this
app created by my colleague and would like to take the good things from it."*

**How this note is used.** The comparison (§2) lists every idea in the colleague's app beside what ours does today, each
with a verdict. The ideas worth having become product questions (§4), put to him in rounds of at most four, each with a
recommendation, a worked example and pictures — today beside the proposal, the place marked (D853, D921). His answers are
written into §5 as rulings, then the build is split into batches (§6). A fresh, blind Opus reader red-teams the plan
before anything is built (D790, D903); its findings and what was done about them are §7.

## 1. The colleague's app, in brief

A one-page leave and OIL planner for one squadron, dark with an orange accent, on a claude.ai artifact with a shared
database and sign-in. Five tabs: **Calendar**, **Approvals** (with a count of what waits), **Balances**, **Personnel &
access**, **Holidays & events**. It was read from its source (it draws nothing without its database), then run on this PC
with made-up sample people so it could be pictured; none of its own data was opened. Its look is not taken (D765: the
Raptor look stays).

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
- **A cell's window**: each entry with its state, who entered it, what it costs ("Uses 1 leave day"), Approve / Reject /
  Remove for an admin, photos and PDFs attached.
- **Approvals tab**: every waiting request, one line per run of days — who, type, dates, days, leave and OIL it takes
  (red when it takes a balance below zero), who entered it, files — with Approve / Reject, and **Approve all**.
- **Quick approve**: a switch that makes a tap on a waiting cell approve it.
- **Lock dates**: periods with a reason in which members cannot add, change or remove leave (files still allowed); or the
  whole calendar.
- **Balances tab**: everyone's leave and OIL, each "after pending", and a count per leave type.
- **Personnel & access**: add and remove people, category, management, set balances, link accounts, who is authorised.
- **Holidays & events**: typed holidays and one button for a whole year's national holidays; events with dates and a kind.

## 2. Side by side — theirs, ours, and the verdict

Ours today, from the code and the running build (21 Oct 26): `../../leavewar/known-gaps.md`, `../../ui-contracts.md` (its
Leave War sections), `.claude/rules/decisions/leave-war.md`.

| # | Their idea | Ours today | Verdict |
|---|---|---|---|
| 1 | A strip of his own numbers: leave left, OIL left, waiting, next leave | His figures sit in his row's figure column (15 over 5 used); "Viewing as" chip; no summary, no list of his own requests | **Better there — round 1, Q1** |
| 2 | Told when his leave is decided ("since your last visit"), decided days outlined | Not told at all: the bell skips a leave the war approved ("told by the war's own page", which says nothing); only the cell's colour changes | **Better there — round 1, Q2** |
| 3 | A day panel on a phone: that day's availability and who is away | None; the whole year grid only | **Better there — round 1, Q3** |
| 4 | The form says what a request does before it is sent: days, balance before and after, the days his category runs short | The bid sheet places a bid at the first tap of a leave type and says nothing of its cost; a balance going below zero asks "tap again" | **Better there — round 1, Q4** |
| 5 | Approvals: every waiting request across people, one line a run, with its cost; Approve all | No list: an admin finds bids on the grid and drag-selects a block to decide | **Better there — round 2, Q5** |
| 6 | Lock dates (with a reason) so members cannot bid them | Members bid only inside the bidding window; a No Leave day only colours its column (known gap) | **Partly ours (the window and the stages) — the No Leave day is round 2, Q6** |
| 7 | An admin's entry approved as it is placed ("Approve what I enter") | An admin's bid is placed waiting, then decided — two steps | **Better there for an admin's own entries — round 2, Q7** |
| 8 | Photos and PDFs attached to a leave (a form, an MC) | Documents live only on the Inputs page (medical), in each browser | **New — round 2, Q8** |
| 9 | Filter chips by category | Groups fold; no filter | **Better there — round 3, Q9** (it meets [LW-SORT-BY-FLIGHT], D1001) |
| 10 | Today, a date box, ‹ month › | Opens on the bidding window's first day (ruled — §Settled, "the tab opens on the war being bid on"); a month strip; no Today | **A Today jump only — round 3, Q10**; the opening day stays as ruled |
| 11 | A cell's colour is its leave type; its state is fill, outline, strike | A cell's colour is its decision (none, purple Ack, green, red); the type is its letters | **Asked — round 3, Q11**; recommended: keep ours |
| 12 | "My week" cards | — | **Folded into Q1 and Q3** (his next leave; the day panel) |
| 13 | An "avail" row per category, amber at 2 and red at 1 | Counters the squadron defines, each with its own amber and red; Available P / W; under-manned list | **Ours already, and more flexible** (D669, D674) |
| 14 | Balances tab: everyone's leave and OIL | The figure columns, the "Which figure" picker, every person's all-figures window | **Ours already**; ours counts a waiting bid in the balance at once, so ours is theirs' "after pending" |
| 15 | Two entries a day split the cell | Half days `<LL` and `LL>`; a second record gives a `+n` corner and the day's list | **Ours already** |
| 16 | A drag across days opens the request form | A drag selects a block and opens the selection window | **Ours already** |
| 17 | Event bars in lanes, a holiday row | Event rows with merged bands, short forms, kinds (D643, D645, D652) | **Ours already** |
| 18 | Personnel & access on the war: add people, category, balances, accounts | Quals and Admin → Users own people (D461); the war shows what Quals says | **Ruled against** (D460, D461) — not asked |
| 19 | One month at a time | The year grid with its window of months (ruled — §Settled, "one draw-toward-a-target window engine") | **Ruled — not asked** |
| 20 | Quick approve (a tap approves) | Drag-select decides a block | **Left** — §3 |
| 21 | A year's national holidays at one press | The Holidays list in the Calendar window (D638) | **Left** — §3 |
| 22 | Lock the whole calendar | The stages: once bidding closes, members cannot bid | **Ours already** |
| 23 | Toasts after each action ("LL entered for 3 days") | Feedback designed into the screen; a note only where the screen does not show it (D850) | **Ruled — not asked** |
| 24 | Legend always shown under the grid | A Legend button | **Left** — §3 |

## 3. Considered and left — and why

- **Quick approve.** A switch that changes what a tap does is easy to leave on by mistake, and a tap meant to open a cell
  then approves it. Drag-select already decides a block in two presses; Q5's list decides many runs at once.
- **A year's national holidays at one press.** The app would carry a list that must be kept right every year, and a
  wrong one silently changes OIL and manning. The Holidays list already takes a run of dates in one entry.
- **The Legend under the grid.** It costs a phone a screen of height on every visit; ours stays one press away.
- **Their orange look, fonts and tabs.** The Raptor look stays (D765); the war stays one page with its own sheets, not five
  tabs (one page's controls are one row — design guide §3, D911).
- **Their "entry 1 / entry 2" choice.** Ours takes a second record on a day by itself; asking a member which slot is a
  step he does not need.

## 4. The questions, in rounds of four

Each is a product choice; how it is built is the agent's (D9, plain-language). Checked against every rulings file, the
archive and the backlog on 21 Oct 26 (D53): none of these has been ruled. The sample person in every example is the demo's
Ranger (the member sign-in), staged through the app's own controls with the clock held at Thu 8 Jan 26: his LVE set to
20, LL Mon 19 – Wed 21 Jan approved, LL Mon 26 – Tue 27 Jan waiting, LL Mon 2 Feb refused.

### Round 1 — the member's own leave (a member is mostly on a phone — D820)

**Q1. A "My leave" line for the person signed in.** One line under the war's two top rows: *My leave · LVE 15 · OIL 0 ·
2 waiting · next LL 19 Jan ›*. A tap opens his own leave, one line a request, newest first, each with its state — approved,
waiting, refused — and a tap on one takes the grid to it. An admin sees his own the same way.
*Pictures:* `r1q1-ours-phone-today.png` → `r1q1-ours-phone-mock.png` → `r1q1-ours-phone-list-mock.png`; option B,
`r1q1-ours-phone-mockB.png`; desktop, `r1q1-ours-desk-mock.png`; theirs, `r1-theirs-phone-top.png` (1).
*Options:* **A — the one line (recommended):** everything he asks first, in one place, without finding his row on a grid
of fifty; it costs one line of height (design guide §3 asks for none on a working screen — but this is a member's own
screen, and the line replaces his hunting). **B — no new line:** the "Viewing as" chip carries his numbers when it is
himself (*Ranger · LVE 15 · 2 waiting ›*); no height, but the chip's words change with who is viewed, and the next leave
does not fit. **C — leave it.**

**Q2. Telling him when his leave is decided.** Today a member learns it only by finding the cell's colour.
*Pictures:* `r1q2-ours-phone-today.png` → `r1q2-ours-phone-bell-mock.png`; theirs, `r1-theirs-phone-top.png` (2).
*Options:* **A — the bell (recommended):** one line a decision — *Your leave · Mon 19 – Wed 21 Jan · LL approved* — and a
tap takes the grid there; the bell is already the app's one place for "something changed for you", on the phone and the
desktop. A run approved together is one line, not three. **B — a line on the war itself**, as theirs: *Since your last
visit: 3 approved · 1 refused*, with "Mark as seen". **C — both.**
*Worked example:* the admin approves Ranger's 19–21 Jan and refuses 2 Feb; Ranger's bell shows two lines; a tap on the
first scrolls the war to 19 Jan; a refused bid stays on the grid in red, as today.

**Q3. A day panel — tap a date, see that day.** A tap on a date's heading opens that day from the foot of the screen:
‹ Tue 27 Jan ›, the day's figures (Available P and W, a counter's own figure with its amber or red), and who is away, each
with his leave and its state. ‹ › step a day. The same panel as the Inputs and SANS calendars' day (D996 — a day panel stays
at the foot).
*Pictures:* `r1q3-ours-phone-today.png` → `r1q3-ours-phone-day-mock.png`; theirs, `r1q3-theirs-phone-day.png`.
*Options:* **A — on a phone and a desktop (recommended):** a member deciding whether to bid a day sees at once who is
already off; on a desktop it answers the same question without scanning a column. **B — a phone only. C — leave it.**
*Worked example:* Ranger wonders about Tue 27 Jan; he taps "TUE 27"; the panel says Avail P 25, Avail W 17, and that
Reaper, Drifter and Basher have bid LL too, all waiting.

**Q4. The bid window says what a bid costs before he taps.** Our bid window places the bid at the first tap of a leave
type, so the cost is shown above the choices, not after: *LVE 15 left — a whole day takes 1 · Avail P that day 28 → 27*.
With "Pick a range" it counts the range: *3 days take 3 · LVE 15 → 12*, and names a day where a counter would turn amber
or red. The "tap again" ask before a balance goes below zero stays.
*Pictures:* `r1q4-ours-phone-today.png` → `r1q4-ours-phone-mock.png`; theirs, `r1q4-theirs-desk-apply.png`.
*Options:* **A — yes, one line (recommended). B — leave it.**

### Round 2 — the scheduler's side (a scheduler is mostly at a desktop — D820) — *to be put after round 1*

- **Q5. A "Requests" list** for an admin: every bid still waiting, one line a run — who, leave, dates, days, his balance
  after it, the lowest figure of any counter on those days — with Approve and Refuse on each line, and "Approve every
  line that turns no day red". Opened from a "N waiting" chip in the stage row. *Recommended: yes.*
- **Q6. A No Leave day refuses a member's bid** on that day and says why ("No leave — EX SAMPLE SHIELD"); an admin can
  still place leave there. *Recommended: yes* (closes the known gap; no separate "lock dates" tool — the stages and the
  bidding window already lock the rest).
- **Q7. An admin's leave approved as he places it** — a switch in the bid window, *Approve as I place*, off each time the
  window opens. *Recommended: yes.*
- **Q8. Photos and PDFs on a leave** (a leave form). *Recommended: not now* — files need the shared database's storage
  (today the medical photos live in each browser only); filed for the database step.

### Round 3 — finding things and how cells look — *after round 2*

- **Q9. A "Show ▾" picker** in the grid card's row: everyone, one group, my flight (D1001's sort by flight is decided with
  it), or only people with leave in the months shown. *Recommended: yes.*
- **Q10. A "Today" button** at the end of the month strip that takes the grid to today; the war still opens where it
  opens today (ruled). *Recommended: yes.*
- **Q11. A cell's colour stays its decision** (none, Ack, approved, refused), the leave type its letters — not theirs'
  colour per leave type. *Recommended: keep ours* — a colour means a status in this app (design guide §4).

### Round 4 — balances over the years, and what lowers manning — *after round 3*

- **Q12. Yearly leave balances and carry-over** ([LEAVE-YEAR], his "we will do this next time", 19 Sep 26): a balance per
  year, what carries over, and which year a leave across 31 Dec charges — two or three questions of its own.
- **Q13. A whole-day commitment lowers manning** (D998 parked it "for now", to be raised at the war's next batch — this
  is that batch): Training, Duty or a Meeting that takes the whole day lowers the day's figures; a part-day one does not.
  *Recommended: yes, whole days only.*

**Not in these rounds:** pinch to zoom on a phone is its own job in its own chat (D1117, `[LW-PHONE-PINCH-ZOOM]`).

## 5. His answers

*(Written here as he gives them, each recorded as a ruling first — D13.)*

## 6. The build, once he has answered

Batches by area (D1087), each its own branch, bug check and "merge live":

1. **His own leave** — Q1 to Q4: the line, his list, the bell's lines, the cost line. Touches the war's top, a new
   window, the bell's notices (`src/state/notices.ts` today skips a war-approved leave — that skip changes), the bid window.
   Saved data: a decision notice is a new stored notice (`../../data-schema.md`, `../../data-model.md` change with it).
   Tier: FULL (a published record's notices, permissions — who sees whose leave).
2. **The day panel** — Q3, if he says yes: the war's own day reader (`engine/dayview.ts`), drawn outside the grid so the
   grid's speed rules are untouched (`../../performance.md` §E). Tier: WALK.
3. **The scheduler's side** — Q5 to Q8.
4. **Finding things** — Q9 to Q11, with `[LW-SORT-BY-FLIGHT]`.
5. **Balances over years, manning** — Q12, Q13, with `[LEAVE-YEAR]` and `[LW-COMMIT-MANNING]`.

**What it touches across the app (the standing order, `../../feature-impact.md`):** the bell is shared with every page;
the Inputs page carries the same leave once approved; the database's table list grows by the notices; a member already
sees every row of the war, so the day panel and the list show him nothing he cannot see today — to be confirmed in the
red team.

## 7. The red team

*(A fresh, blind Opus reader's findings, and what was done about each.)*
