# Round 1 — Fable

One design for a person's absence across the Leave War, the Inputs pages and the schedule (D2782). Written blind to
Astra. Facts are from the fact map; the ones this leans on hardest I checked in the code and name in §6. Nothing was
walked in the running app.

## 1. Diagnosis — four causes

1. **The rules follow where an item was born, not what it is.** A leave approved on the war and a leave filed on the
   Inputs page are the same thing to a person — a man is away, approved — yet the app treats them as two kinds: one
   drags on the war, the other says "change it on the Inputs page"; one can be sent back, the other cannot; a member's
   edit on the Inputs page quietly turns the first into the second, after which the war's admin can no longer move it
   either. The app is showing him how it stores things. Nobody can predict a rule that hangs on a history he cannot see.
2. **Each page has its own window for the same item.** The Inputs page opens the input's window with everything. The
   schedule opens the same window with the dates taken away. The war opens one of three other things and never the
   input's window. So the same tap means a different thing on each page, and about fifteen sentences exist only to send
   him somewhere else.
3. **A group is one thing in one place and several in another, and some gestures split it without saying.** One card
   on the Inputs page, a row a man on Unavailable, a box a man on the war with no mark. A time typed on one man's row,
   or a remark saved on his war box, cuts him out silently; the dialog from the same row changes everyone; a dropped
   puck swaps inside the group. Three answers to "does this change one man or all?", none shown before he acts.
4. **Three ways to say "when".** The war: whole day, AM, PM. Leave and medical on the Inputs page: all day, AM, PM,
   custom. Everything else: an all-day tick and times, no AM / PM. So an Attach filed AM on the war turns into
   00:00–12:00 on the Inputs page, and a 10:00–14:00 leave reads as a whole day on the war.

The pages themselves are not the problem. Three views — the year by person, the month, the week — are right for three
jobs. The problem is that each view grew its own rules.

## 2. The model — a paragraph a scheduler could read

**An item is the same thing on every page. What you can see, you can change right there, in the same window, by the
same rights. The pages differ only in what they show and what they add.** The Leave War shows the year, man by man, and
is where leave is bid for and decided. The Inputs pages show the month and the list, and are where anyone files
anything. The schedule shows the week, and is where the scheduler places people. Five rules cover every item:

1. **Two kinds of thing only.** A **bid** is a request that waits — leave only, one man's, on the war only, with
   Approve and Refuse. Everything else **stands**: approved leave (however it arrived), medical, an overseas duty, a
   course, an Attach, a duty or commitment. Once a bid is approved it is an ordinary standing item; where it came from
   never matters again.
2. **A tap opens the item's own window — the same one on every page** — with its dates, duration, people, remarks,
   paper and Delete, opening over the page he is on and closing back to it.
3. **A drag moves it along what the page lays out.** On the war and the Inputs calendar a box or bar is dragged to
   other days. On the schedule a puck is dragged to change who. Whatever is dragged, the whole item moves.
4. **A group is one item everywhere, and it shows.** Any change is for everyone in it. One man is changed alone only
   by one deliberate action, "Cutter only", in the window. Nothing ever splits a man off by itself.
5. **Who may change it depends on who you are and what it is, never on the page.** A member: his own. An admin:
   anyone's. A published day: the change waits for the next signed amendment, and the window says so.

What each page adds stays that page's job: the war adds bids (and the far-ahead overseas duty and course, as now); the
Inputs page adds anything; the schedule adds anything for the days in view.

## 3. The table — what you can do, and how

"The window" is always the item's own window, the same on all three pages. "Rights" are rule 5.

| Item | Leave War | Inputs pages | Schedule |
|---|---|---|---|
| **A bid** (waiting or refused) | Tap an open day → the bid window: pick the leave, whole day / AM / PM, remark, paper. Drag to move its days. Admin: Approve / Refuse here, in the day's list, in Approvals. One man's, always. | Not shown — it is not approved yet. | Not shown. |
| **Leave, one man** (approved from a bid, or filed straight — no difference) | Tap → the window. Drag the box to move its days. Delete in the window. Admin on a leave that came from a bid also has "Back to a bid". No more "filed on the Inputs page" edge, lines or legend entry. | Tap → the window. Drag the bar. As today. | Tap its Unavailable row → the window, **dates included**. Type a time or remark on the row. Drop a puck on his puck to replace him (D2779). |
| **A group input** (leave, overseas duty, course, Attach, a commitment — one record, D756) | Each man's box on his own row, each with the small shared mark; a tap lights the others and opens the window naming everyone; a change is for all; a drag moves all the boxes together. "Cutter only" in the window. | One card, one bar (as today). Window changes all. "Cutter only" in the window; a man's own "Take me out" stays. | One row of every puck (D2777, D743). Typing on the row changes all (D739). Drop on a puck replaces, on the empty place adds, drag off removes — every day of it (D2772, D2779, D2771, D2780). Tap → the window. |
| **Medical** | Tap → the window (admin, or the man himself). Drag to move its days, asked first where it meets another medical, as the Inputs calendar asks. Not added from the war. | Filed and changed here; one man's, paper required. As today. | A row a man (D2775). Tap → the window. A drop on it refused with a short note (D2776). |
| **Overseas duty, course, Attach** | Added from the bid window as now. Tap → the window. Drag to move. Several men dragged at once: one group item (question 4). | As today; "Several people" as today. | Under Unavailable; tap → the window; Reject / → Unavail as today (a scheduler's placing). "+ Add" takes several people and a range. |
| **Duties and commitments** (Training, Meeting, Appointment, Duty, Event, Personal, Other) | Shown only while under Unavailable (as now). Then: tap → the window, drag to move. An admin's Other from ⋯ as now. | As today. | Personal Inputs line: the accept / Reject list, a drop refused pointing to its Ground row (D2773). Ground row: pucks as a sim row; typing changes all; tap → the window. |
| **ALL / ALL AVAIL** | Not shown — it is nobody's absence. | As today: one day, its window. | Common Programme by its time; tap → the window; never under Unavailable. As today. |

Three lines sum the table up: **tap = the window; drag = move; pucks = who.** A scheduler who learns that on one page
knows the other two.

## 4. The group input, and "Change for Cutter only"

**It belongs — in one place, the window, and so on every page at once.** Not as a question at Save ("for all 6 / his
only"), which he was right to turn down (D2778): that taxes every save for a case that is rare. And not as today, where
typing on a row or saving a remark splits a man without a word. Instead:

- In the window of any group input, each man's puck is tapped for two choices: **Take out** (he is no longer away) and
  **Cutter only…**
- "Cutter only…" opens the same window for Cutter alone, filled with the group's kind, dates, time, remark and OIL
  answer. He changes what differs and saves. That one save takes Cutter out of the group and gives him his own item;
  one Undo puts everything back. Cancel changes nothing.
- A member in a group he did not file gets the same two choices for himself only ("Take me out", "Mine only…"). That
  replaces today's silent cut-out when he saves a remark or a paper on his war box. His own paper needs no split at
  all once each paper is one man's (D2781).
- On the war, tapping Cutter's box of a group opens the group's window with Cutter's puck marked, so "Cutter only" is
  one tap away from where his hand is. On the schedule's combined row and the Inputs card, the same window, the same
  place.
- Every direct gesture — a drag, a typed time, a typed remark, a puck drop — acts on the whole group, always. The
  shared mark and the window's list of names are what tell him before he acts.

**Why against D2770 ("no separate-him button — the user will create a separate input").** Said loudly: this reverses
it. The two-step way means taking the man off in one place, then filing a new input and re-entering kind, dates and
remark, answering the OIL question again — and between the two steps the man is not away at all, which on a published
day is a wrong record waiting to happen. His own later ask for a "Change Cutter's only" button, and his complaint that
the war makes him pick the group, then the man, then go elsewhere, are the same need. One action, in one window, the
same on every page, is the smallest thing that meets it, and it is the only way the app can promise "nothing splits by
itself".

## 5. Time — one model

**One Duration control, the same in the window on every page, for every kind: All day · AM · PM · Times.** AM and PM
are simply two fixed times with names. Leave and medical open on All day; a meeting or a duty opens on Times.

- The war's bid window keeps its three quick buttons (whole day / AM / PM): a bid is leave, and leave spends a balance
  counted in halves. It is the same control with "Times" left off, not a second model.
- The war's grid keeps drawing halves — a year in one grid cannot draw hours. A box whose item has exact times wears a
  small mark, and its window and the day's list print the hours. Today it rounds out silently.
- An overseas duty and a course take whatever the control gives. That changes D1350 (whole days only on the war) —
  not because half-day courses are common, but because the war no longer has its own time rules to remember.
- An Attach or an Other filed AM on the war stays "AM" everywhere, instead of becoming 00:00–12:00.

Why not keep two: the two models are the direct cause of items that read differently on two pages. The only real
difference is that leave is counted in half days — and that is a fact about leave, not about a page (question 3).

## 6. What it changes

**From today (built):**
- The war opens the input's own window for everything that stands. Checked: the war can already do this from its clash
  list (`leavewar/sync.ts openInputWindow`), but that door jumps to the Inputs page; it must open over the war and
  close back to it (his lesson 69; D996).
- Every "change it on the Inputs page / not here" sentence on the war goes, with the "filed on the Inputs page" edge
  and Legend line. The schedule's "The dates are changed on the Inputs page" goes: its window gets the dates (today the
  window hides them unless opened on the Inputs page — `ui/InputWindow.tsx datesHere`).
- The war's tag on an approved leave stops deciding what anyone may do. Today a member's edit on the Inputs page takes
  the tag off (`ui/inputedit.tsx`, "delete r.lw"), and the war's admin then loses Move and Delete. The tag would only
  remember "came from a bid", for "Back to a bid".
- The three silent splits go: a typed time or remark on one man's Unavailable row, a member's remark or paper on his
  war box, the day's list "Add to the leave".
- The schedule's "+ Add" takes several people and a range of days; "For a multi-day span, use the Inputs page" goes.
- Kinds without AM / PM gain them (checked: `engine/inputs.ts`, `half:false` on OD, course, Attach and every
  commitment).

**His rulings it changes — each named:**
- **D2770** — no "separate him" button. Reversed: "Cutter only…" in the window (§4).
- **D2778** — kept in its main part (a group leave changes as one on the war, its box marked shared, opens the input's
  window, never splits by itself). Changed in one clause: "no his-only choice" becomes "no his-only question at Save;
  one deliberate action in the window".
- **D1350** — an overseas duty and a course whole days only from the war. Changed by the one Duration control.
- **D1365** — an Other from the war takes whole day / AM / PM, "any other time changed on the Inputs page". The last
  clause falls away: the same window is on the war.
- **D1724** — full editing of every entry on the war. Not changed: this is how it gets built — by the one window, not
  by a second set of Move and Delete controls made for the war.
- **D1177 (the agent's reading only, never his ruling)** — "a member's approved leave on the war offers him only its
  remarks". Replaced by rule 5; see question 2.

**Kept whole:** D1166 / D1225 (closed dates stop only bidding; the one redirect that stays is the closed-day note,
because it is a rule of the squadron, not a gap in the app); D756; D735 (now true of what is built); D739, D748, D681;
D2771–D2777, D2779–D2781; D743; a published day changing only by a signed amendment; OIL untouched.

**The combined-row job:** keeps one row under Unavailable, medical the exception, the sim-row drops, the Personal
Inputs refusal, the seat dragged from staying, a paper a man. Changes: its war questions (3, 4, 8, 9) are answered
here — a shared mark at rest plus the group lighting on a tap, and "Cutter only" in the window. Drops: only the
take-him-off-then-file-again route as the one way to change one man.

**Platform (D1551):** nothing here asks Power Apps on Dataverse for anything new — it is our own screen code over the
same records. Two notes for the table list: a group's people and each man's paper become child rows of the input; and
"a paper seen only by its man and the admins" (D2781) leans on Dataverse's own security, which the IT side must
confirm — unsure until they do.

## 7. Cost, risk and order

| Step | What | Size | Risk |
|---|---|---|---|
| **1** | **One window everywhere for what stands:** the war opens it over the grid; the schedule's gets dates; the redirect sentences and the "filed on the Inputs page" mark go. | Medium — mostly joining what exists. | Medium: a change made from the war on a published day must wait for an amendment and say so; the war's clash refusals must still speak. |
| 2 | Nothing splits by itself; the shared mark on the war; "Cutter only…" and a paper a man. | Medium. | High — leave, published days, who sees whose paper (security read, D1411). |
| 3 | The combined row and its drops (the job in flight). | As planned. | As planned. |
| 4 | Drag on the war for everything that stands, a group moving together; the war's tag stops gating. | Medium. | High — OIL leave, balances, published days. |
| 5 | One Duration control; the exact-times mark on the grid. | Small to medium. | Medium — clash checks already use real minutes (map §b); the war's half-day counting must not move. |
| 6 | Adds made alike: several men dragged on the war make one group item; the schedule's "+ Add" for several. | Small. | Medium. |

**Step 1 is the smallest step that removes the most confusion.** It ends "change it on the Inputs page" in every
form, makes a tap mean one thing on three pages, and by itself answers three of his five examples. It needs no new
rule from him beyond a yes to the model. Each step is drawn first (D1625) and takes a full check with a walk; steps 2
and 4 are high-risk work.

## 8. What to draw for him

1. **The war, a leave filed on the Inputs page, tapped** — today's "change it on the Inputs page" line beside the
   item's window open over the grid, phone and desktop.
2. **A group leave on the war** — the shared mark at rest on six boxes; one tapped, the others lit, the window naming
   all six; a drag carrying all six.
3. **"Cutter only…"** — the puck's two choices, Cutter's own window filled in, and the result on all three pages:
   five on the group, Cutter on his own.
4. **The schedule** — a tap on the combined Unavailable row opening the same window with its dates; "+ Add" for
   several people.
5. **Duration** — the one control in its four states, and a war box with the exact-times mark and its line in the
   day's list.
6. **One card: "tap = the window, drag = move, pucks = who"** — the same leave on the three pages side by side, the
   same tap and the same window on each. This is the picture that shows whether the model is predictable.

## 9. Questions only he can answer

1. **"Cutter only".** *When:* a stand-down leave is filed for six; Cutter is recalled a day early, or takes only the
   morning — a few times a year, at short notice. *Recommend:* yes, as one action in the item's window, the same on
   every page, reversing D2770. *Why:* one step in place of two, no moment where Cutter is recorded as not away, and
   it lets the app promise that nothing else ever splits a group.
2. **A member moves his own approved leave on the war.** *When:* leave approved in the January bidding for March; in
   February he gets a verbal yes to shift it a day and drags it on the war instead of opening the Inputs page.
   *Recommend:* it just moves, exactly as it does today on the Inputs page (D1166), wearing the "moved" mark. *Why:*
   the same right on every page; the other choice (it goes back to waiting) makes the war stricter than the Inputs
   page for the same change, which is the confusion he named. If he wants moves re-approved, that should hold on both
   pages, not one.
3. **Is leave ever taken by the hour?** *When:* a man off from 14:00 for an errand. *Recommend:* keep "Times" for
   leave as today unless he says it never happens; if it never happens, leave takes All day / AM / PM only on every
   page and the balance and the screen can never disagree. *Why:* a 10:00–14:00 leave reads as a whole day on the
   war's grid and counts as one, while the schedule shows four hours.
4. **Several men dragged at once on the war for an overseas duty or a course.** *When:* a six-man detachment filed
   months ahead while bidding is open. *Recommend:* one group item, as "Several people" makes on the Inputs page.
   *Why:* today the same detachment is six separate items if filed on the war and one if filed on the Inputs page, and
   later changing its dates is six jobs or one depending on a choice he did not know he made. Bids stay one man's
   each: each is decided on its own and spends its own balance.
5. **The shared mark on the war.** *When:* every time he looks at a stand-down week on the grid. *Recommend:* a small
   mark in each box at rest, and the group's other boxes lighting on a tap or while dragged — both. *Why:* the mark at
   rest tells him before he acts that a drag will carry everyone; the lighting shows who "everyone" is. Lighting alone
   tells him too late.
