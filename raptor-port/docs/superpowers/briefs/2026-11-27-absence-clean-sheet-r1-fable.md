# Clean sheet, round 1 — Fable (27 Nov 26)

Read: everything the brief names, with my own reads. Blind to Astra. Facts about today are from the fact map (from the
code, not walked); nothing here was tried in the running app. What I am unsure of is marked.

## 1. The concept

**One board, called Availability: every person a row, every day a column, and everything that takes a person's time is
a box on his row.** A leave bid, an approved leave, a medical, a course, a stand-down, a duty are the same kind of
thing in different states and colours. You zoom the one board: the year for bidding and manning, the month for
everyday filing, the week when planning. The schedule's Unavailable list is not a separate list any more: it is that
day's column of the same board, seen from inside Edit Schedule. One box, one window, one set of gestures, wherever you
stand. What a scheduler would say after a week: *"I stopped asking which page a thing lives on. If I can see it, I can
grab it, and it does the same thing everywhere."* The app's own name already says it: Training, **Availability**,
Leave & Ops.

## 2. The places

**A. Availability** (replaces the Leave War tab and the Inputs page as two destinations).
- The board: people down, days across, the manning rows (required against available, pilots and WSOs) pinned at the
  top as the war has them today, and one Events row above the people for holidays, No Leave days and anything filed
  for ALL / ALL AVAIL (which is nobody's absence, so it never sits on a man's row).
- Three zooms of the same board, one control: **Year** (the war's grid as it is today, D1157 kept and widened),
  **Month**, **Week**. Nothing changes but the size of a day.
- Show chips: Leave · Medical · Away (overseas duty, course, Attach, stand-down) · Duties. An admin deciding bids
  switches to Leave; a scheduler looking at next week leaves all on.
- Bidding is not a page. It is a **season on the board**: the admin opens dates, those columns wear the green
  open-for-bidding top they wear today, a chip says "Bidding open: Mar–Apr, closes 20 Jan", every member's bell says so.
- Its tabs, kept from the war: **Board · Approvals · Balances · OIL**. Medical keeps its own tab (papers, upchits).
- **On a phone it opens on "Mine"**: the member's own row as a dated list (today's Inputs list) under a month strip,
  with one switch to "Squadron" for the board. Not the My Programme page he removed: it lists only what he filed or
  bid, never what he is flying.

**B. Edit Schedule and the Scheduler Board** (stay; their absence parts change).
- **Away** (today's Unavailable): the day's column of the board, drawn as rows of pucks. One row per item, a group one
  row. Everything on it can be changed there, dates included.
- **Requests** (today's Personal Inputs): commitments waiting for the scheduler to say where they stand: onto the
  Ground Programme (he is doing something) or into Away (he is out). Same buttons as today.
- **A "new since" chip on each day's head**: "2 new" = what changed in who is away on this day since this scheduler
  last opened or published it. One tap lists them. This is the part that serves the last hour before publishing.

**Gone compared with today:** the Leave War as a separate app with its own windows; the Inputs calendar and list as a
separate page; three different windows for one item; every sentence that sends you to another page (the map lists
about twenty-five); the idea that a leave "belongs to the war" or "belongs to the Inputs page"; "Unavailable" and
"Personal Inputs" as names (Away, Requests).

## 3. The objects

**One object: an entry.** It has: who (one person or several), when (first and last day, and a Duration), what (its
kind, which sets its colour), remarks, papers, who placed it and when, and its history. Three more facts on it replace
everything that today depends on where it was born:

- **Its state:** *bid* (waiting, drawn dashed) → *approved* (solid) or *refused*; or *standing* from the start (a
  medical, a duty, a course, leave filed after word-of-mouth approval). **A bid becomes leave by changing state: the
  same entry before and after**, same box, remark, paper and history, now solid. Nothing is copied between stores.
- **Whether it counts him out:** yes for leave, medical, overseas duty, course, Attach; set by its filer for an Other;
  no for a duty or meeting until a scheduler says so. This one switch is today's "→ Unavail / → Ground / Reject". It
  decides three things at once and always together: the manning figure, Away on the schedule, a filled box on the
  board (a commitment that counts him in is a hollow outline under the Duties chip).
- **Whether it is cancelled** (CX), as today.

**Rules that hold for every entry, everywhere:**
1. A tap opens **the entry's own window**, the same one on every page, over the page in use, closing back to it.
2. What you may do follows **who you are and what the entry is**: a member his own (and duties for others while the
   switch is on); an admin anything. Never the page.
3. **A bid is one man's.** Everything else may hold several people.
4. **One Duration:** Whole day · AM · PM · Times, for every kind. The board draws halves; the window says how hours
   count for manning ("counts as half a day"). Medical keeps its own counting rule.
5. **Leave is a bid on a date open for bidding, and stands at once on any other date** (word-of-mouth approval, its
   document asked for as today). The dates decide, not the page.
6. **A change that touches a published day shows as pending on that day** until a signed amendment. Unchanged.
7. Balances and OIL: unchanged. A bid comes off War bal when placed; OIL is earned leave; an OIL award is its own
   thing on the board and never travels with an entry that moves.

**A group** is one entry with several people. On the board it is a box on each man's row that **light together**
under the mouse or a tap; on the schedule one row of pucks; in "Mine" one card naming everyone. Change it and you
change it for everyone, unless you say otherwise, and saying otherwise is always the same two short buttons he
approved (D2784): **Change · [6 pax] · [Cutter]**. The press on the man's name takes him out with an entry of his own
(D2783); one Undo puts him back. Nothing ever splits a man off quietly.

## 4. Five moments

**(a) A member bids for March leave in the January war (phone).**
1. His bell: "Bidding is open for March and April until 20 Jan." He taps it.
2. Availability opens on Mine, the month strip at March, the open days green-topped. Under each day a small figure:
   pilots free against required, amber where tight. He sees before bidding which days are crowded.
3. He taps 9 Mar, then 13 Mar. The entry's window rises: "Leave · 9–13 Mar · 5 days". Kind chips (LL, OIL, …),
   Duration, Remarks, Document. One line: "War bal 14.5 → 9.5".
4. He presses **Bid**. A dashed box sits on those days; his list shows "LL 9–13 Mar · pending".
5. Until it is decided he may drag it to other open days or delete it. Same window, same drag as any entry.

**(b) An admin approves bids against manning (desk).**
1. Availability → **Approvals**. The board is on the left at a zoom that fits the open dates, only pending boxes lit,
   everything else dimmed. On the right, the list of requests as today (puck, kind box, how long, LVE Bal, lowest
   Available, when placed, document).
2. The manning rows show two figures for each day: as approved now, and **if everything pending were approved**.
   Days that would go amber or red are coloured.
3. Mouse over a request: its days ring on the board and the manning rows show before → after for that one request.
4. Approve or Refuse on the line; or drag across boxes on the board and decide them together; or "Approve all" for
   exactly what the list shows. A box goes solid where it stands. The member's bell says who decided.

**(c) A member files a medical this morning (phone).**
1. Open the app → Mine → **+ Medical** (bottom left, where it is today).
2. The same window, opened on Medical: ATT C picked, today's date in, Duration Whole day. He taps Document, takes a
   photo of the chit, presses **Add**.
3. A red box is on his row at once. It stands; nobody approves it.
4. For the scheduler: the day's head on Edit Schedule shows "1 new"; the seat he was planned in is flagged in the
   warning list as today; he is under Away. If the day was already published, the day reads pending until an
   amendment is signed. (How fast it reaches the scheduler's screen on the new platform: see §6.)

**(d) A stand-down for six men; Cutter is then recalled a day early (desk).**
1. On the board the admin presses **+ Add** (or, on Edit Schedule, "+" on Away). The window: kind Other, title
   "Stand-down", counts them out; six pucks picked in the people picker; Thu–Fri. **Add.**
2. One entry. On the board six boxes that light together; on Thursday's and Friday's Away one row of six pucks; on
   each man's phone one card naming all six.
3. Cutter is recalled for Friday. The admin either drags the right edge of Cutter's box back one day, or taps his box
   (or his puck on the row) and changes the end date.
4. Because he grabbed one man of a group, a small card hangs right at the box (D1626): **Change · [6 pax] · [Cutter]**.
   He presses Cutter. Cutter has his own one-day stand-down; the other five are untouched; the six no longer light as
   one. Top-bar Undo puts him back.
5. If Friday was already published, Friday shows the change as pending ("Cutter available") until signed.

**(e) An hour before publishing, the scheduler finds Ghost unavailable and replans (desk).**
1. On Edit Schedule, Tuesday's head shows "1 new". He taps it: "Ghost · ATT C · filed 07:10 · LATE".
2. Ghost's seat in Wave 2 is already flagged; pressing the line lights it.
3. He taps the line's box: Ghost's medical opens in the same window, over the schedule; closed, he is where he was.
4. He taps the empty-to-be seat: the crew list narrows to who can take it (the green ring, as today). He drags Viper
   in. Ghost's puck is under Away without anyone moving it there.
5. He publishes. The publish window's list of what is going out names the change, so nothing new is missed in a hurry.

## 5. The main screens

**Screen 1 — the Availability board (desktop).** Top bar as everywhere. One row of controls under the tabs: the zoom
(Year · Month · Week), ‹ period › arrows that never move, the Show chips, a search box, **+ Add**, Legend, the gear.
Left, pinned: each man's puck and his LVE figure. Top, pinned: the dates, the Events row, the manning rows with their
faint pair tints. The body is dense, a day a cell: a solid box is approved or standing, a dashed box a bid, a hollow
outline a duty that counts him in, colours as today (medical red, course purple, overseas duty slate, OIL taken
chartreuse). A published day's date wears a small "published" mark. One tap on an empty cell opens the window to add
there; one tap on a box opens that entry; a drag across empty cells picks a range (and several men); a drag of a box
moves it; a drag of a box's edge makes it longer or shorter. Under the mouse a group lights and a day wears the cyan
ring. No glow anywhere.

**Screen 2 — Availability on a phone, "Mine".** Top: a month strip of his own days, each a small coloured cell, open
days green-topped, a swipe changes month. Under it his entries as short cards by date (kind box, dates, state, a
document mark), newest need first: anything pending, then what is coming. Bottom left: **+ Medical** and **+ Input**,
as today. One switch at the top, Mine | Squadron; Squadron is Screen 1 with the names pinned and pinch to zoom.

**Screen 3 — the entry's window (both sizes, the same parts in the same order).** Title: the kind's coloured box, the
dates bright, the state ("pending", "approved by Saber 12 Jan"). Then rows, label left, choice right: People
(pucks; for a group the line **Change · [6 pax] · [Cutter]**), Dates (a calendar that stays open), Duration, Remarks
(a dark box), Document. For a scheduler one more row: **Stands** — Away · Ground Programme · Rejected, in those
sections' colours. Foot: Delete at the left; at the right the one main action, named for what it does: **Bid**,
**Add**, **Save**, or for an admin on a bid **Approve · Refuse**. Someone else's entry: the same window, values not
boxes. On a desktop it does not cover the board behind it; on a phone it sits mid-screen.

**Screen 4 — a day on Edit Schedule.** The day's head gains the "n new" chip beside its name. Away: one row per
entry — pucks, kind box, title, times, remark — a group one row that grows downward. A puck dropped on a puck replaces
him; dropped on the row's empty place adds him; a puck dragged off takes him out, on every day of the entry. "+" on
Away takes several people and a date range. Requests sits below with Accept · → Ground · → Away · Reject. Typing a
time or remark on a row changes the entry for everyone on it; to change one man, tap his puck and the same
**Change · [n pax] · [name]** card hangs from it.

## 6. Cost, risk, and how far from today

**This is the biggest change the app has had.** Honestly:

- **Rebuilt:** how a bid is stored (today a separate thing in the war's own store, copied into an input on approval;
  here one entry with a state); the war's three windows and the Inputs window into the one window; the Inputs
  calendar and list into the Month zoom and Mine; Approvals with the board beside it. The war's doors into the rest
  of the app disappear, so all that crossed them is re-tested: balances, the bell, Undo, OIL, the published freeze.
- **Reused:** the war's grid, its speed work, colours, manning rows, Balances, OIL tracker and Event rows; the input
  window's parts, the people picker, the Document button; the schedule's rows, drops and the combined-row drawings;
  the rules for who may file for whom; publishing and amendments untouched; the rules engine untouched.
- **Risks:** leave balances and OIL are where a quiet fault hurts people, and both pass through the rebuilt part:
  high risk, full checks, every step. Members relearn one page once. The year board with every kind on it could get
  busy: the Show chips keep it calm and must be drawn at his phone's size first. Phone speed is measured, not assumed.
- **In steps, the squadron working throughout:**
  1. **The one window**, opened from all three pages, dates included. No stored data changes.
  2. **Groups:** one row, lighting together, Change · [n pax] · [name], no quiet splits.
  3. **One Duration** everywhere.
  4. **One entry:** a bid and its leave become the same record; "filed on the Inputs page" and "the war's" stop
     existing. The pages still look as today. The deep step: best done once, as the database's table design.
  5. **One board:** the war's grid gains Month and Week and every kind changeable on it; the Inputs calendar and
     list retire into it and into Mine; the tab becomes Availability. Until here nothing a member knows has moved.
  6. **The schedule:** Away and Requests, the "+" for several people and a range, the "n new" chip.
  Steps 1–3 are the agreed design. Each later step is drawn first and can be stopped after without leaving a mess.

**On a Power Apps code app on Dataverse (D1551):**
- The board, drags and windows are the app's own screens, so the platform does not limit them.
- **No live push.** Another person's change reaches your screen when the app next asks the database (on opening a
  page, on a timer, on coming back to the tab), not the instant it is saved. The "n new" chip and the medical filed at
  07:10 will be seconds to a minute behind, depending on the timer chosen. It cannot be instant.
- **A phone alert** ("Ghost filed a medical for today") can only go out as a Teams message through Power Automate;
  whether the flow that watches a table needs a paid licence is the IT side's answer. Not assumed.
- **Taking Cutter out of a group saves two things at once** (the group without him, his own entry made), wholly or
  not at all. Dataverse can do that; **I am not sure the code app's connection offers it** — the hosting trial tells.
- **Who may open a man's medical paper** is enforced by the app's own roles, since the IT side gives one security
  group for everyone. True today as well. No use without signal, as today.

## 7. Against the agreed consistency design

**The same destination, reached further.** The agreed design makes an item behave the same on three pages and keeps
the three pages. The clean sheet adds two things: one record (step 4), which is where today's confusion is made —
a thing's powers follow its birthplace because a bid and an input are stored as different things — and then one
board (step 5), because three views of one thing need not be three places to learn.

**Yes, step 1 first.** The one window is needed here too, answers three of his five examples, changes no stored
data, and nothing in it is thrown away. The directions part only at step 4, so starting now loses nothing.

**Rulings this sets aside, each for him to rule on (D754):**
- The Leave War as an app of its own with its own store (the project guide's architecture) — replaced by one record;
  his 16 Sep rule that new work joins the one shared layer points the same way.
- D1166 / D1225 as worded ("leave filed on the Inputs page lands approved") — kept in effect, reworded by dates: leave
  on a date not open for bidding stands at once. What changes: on an *open* date a member's leave is a bid (question 2).
- D1350 and D1365's last clause (overseas duty and course whole days only on the war; other times "on the Inputs
  page") — one Duration everywhere.
- D2770 and D2778's "no his only" — already overtaken by D2783 and D2784, used here as they stand; D2778's "box
  marked as shared" becomes "the group lights together", both still to be drawn for him.
- D1724 (full editing on the war) — no longer a job: true by construction. D802 (the Inputs pages an area of their
  own) — the page folds in, "+ Medical" and "+ Input" stay.
- The reading under D1177 (a member's approved leave on the war offers only remarks) — he changes his own as any
  entry of his.
- Kept: the year grid (D1157); no Ack (D1158); no flood of bells for the admin (D1208); closed dates stop only
  bidding; D756; D735; medical one man's (D2775); no My Programme page; the SANS calendar stays where it is.

## 8. Questions only he can answer

1. **One board or three pages?** *When:* every day — a member filing, the admin in bidding season, the scheduler
   looking ahead. **Recommend one board, Availability**, reached in the steps above. If he would rather keep three
   pages, steps 1–4 still stand and remove most of the confusion; step 5 is then dropped.
2. **On a date that is open for bidding, is a member's leave always a bid?** *When:* bidding for March is open in
   January and a member wants 9 March off; today he can bid on the war, or file it on the Inputs page where it stands
   at once. **Recommend yes: an open date means a bid; any other date, it stands** after word-of-mouth approval. An
   admin may file standing leave on any date. One rule a member can predict, and no way round the bidding beside it.
3. **Grabbing one man's box of a group on the board: what should it do?** *When:* the stand-down for six, Cutter
   recalled a day early, and the admin drags Cutter's box shorter. **Recommend: it asks at the box, Change ·
   [6 pax] · [Cutter], every time**, choosing neither by itself. One extra press, never a wrong guess.
4. **Does the "n new" chip only inform, or must it be looked at before publishing?** *When:* the last hour before
   publishing, a medical or a recall has come in since the scheduler last looked. **Recommend it only informs**, and
   the publish window lists what is new. A forced tick is another approval, and he has ruled against adding those.
