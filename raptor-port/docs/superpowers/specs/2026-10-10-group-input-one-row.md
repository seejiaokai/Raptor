# The schedule's one row for a shared input — his answers, as they come (`[GROUP-INPUT-ONE-ROW]`; D661, D662)

**What this is:** the design note of the job — what he has ruled, what is still to ask, what the agent decided for
itself. The plan is written from it once the questions are closed and the pictures are approved; it is then read by
Astra and by Sol 6.1, each blind (published days, earned OIL). The backlog item: `OUTSTANDING.md`
`[GROUP-INPUT-ONE-ROW]`. Rulings are one line each in `.claude/rules/decisions/scheduler.md`; open a full row before
acting on its detail (`grep -h '^| D734 |' .claude/decisions-full/*.md`).

## Where it starts from

- **Ruled, not built (D661, 7 Oct 26):** on the schedule an input filed for several people is ONE row holding everyone
  — picture B of the mock-ups he was shown. D662: its own job, straight after the calendar job.
- **Today:** a shared input is kept as one record a man, tied together (`raptor-port/src/state/inputgroup.ts`), and the
  schedule draws a row for each man. A request's row is worked out on read from the request, lands on its START day,
  and keeps every field the scheduler set on it (`raptor-port/docs/engine-rules.md`, "An activity input auto-lands on
  the ground programme", the note of 1 Oct 26).
- **What it reaches into:** how a published day counts the changes waiting to go out (D109, D113, D114, D178), OIL on a
  weekend or holiday (D660, D682), the changes window (D663).

## Round 1 — answered 10 Oct 26

| # | Asked | His answer | The ruling |
|---|---|---|---|
| 1 | A scheduler drags one man's puck off the shared row — the schedule only, or does he leave the input? | "Which has the less bugs? Seems like 2nd option yeah" | **D734** — on a shared input's row the pucks ARE the input's people: a puck taken off takes that man out of the input itself, a puck put on adds him to it. |
| 2 | A different time, or a cancel, for ONE man | "Take him off, own row" | **D735** — one shared row has one time for everyone on it; the scheduler takes the man off and gives him a row of his own; the row never splits by itself. |
| 3 | On a published day: one change waiting, or one a man? | "One for the input" | **D736** — the whole input filed, taken off or re-timed is ONE change waiting, one line naming its people; one man taken off or added is one each. |
| 4 | Leave, an overseas duty or a course filed for several: the Unavailable list | "A row for each man" | **D737** — on the Unavailable list it stays one row a man; the single row is for Personal Inputs and the Ground Programme. |

**On answer 1, the agent's reply to his question, told to him:** for WHO is on the row, his choice is the one with fewer
places to go wrong — one list of people, and no "in the input but off the schedule" state for the row, the Personal
Inputs line, the Inputs calendar, the changes window and OIL each to draw. The agent's first recommendation ("the
schedule only") is withdrawn for people. It does NOT settle the row's time and remark boxes: round 2.

## Told to him as readings — not asked, a ruling already answers each

- A man in it who is on leave or grounded that day stays on the row and is flagged, as anywhere he is seated (D605).
- The row's own dialog is the group's throughout — its title, its Save, its Delete and its OIL lines (the mixed dialog
  seen by the second batch's re-walk, 10 Oct 26, goes).
- In OIL Earn each puck on the row is switched alone, as on any row with several men.
- A one-man request's row is unchanged by D734: a man the scheduler adds under it or puts in its name box is the row's
  own, and the request stays the member's (D18, D470, D468).
- The ✕ on the whole row still takes the input off the programme, filed as before, and counts one (D114, D736).
- A placeholder puck (ALL / ALL AVAIL) may still stand on the row and earns by default (D46, D43); it is the row's own,
  never one of the input's people.

## Round 2 — 10 Oct 26

| # | Asked | His answer | The ruling |
|---|---|---|---|
| 1 | The scheduler types 14:30 in the shared row's time box (or changes its remark): the row only as today (recommended for this job), the input too for shared rows only, or the input too on every request's row | In his own words: "The scheduler changes the input entirely from the original on the schedule" | Asked back with one example ("after 14:30 is typed on the schedule, what does the Inputs calendar show?") — "14:30 - the input changes": **D739** — a time or a remark the scheduler types on a shared input's row changes the input itself, for everyone in it; the schedule and the Inputs calendar always agree; what was filed stays in the change history with the scheduler's name. **And a one-man request's row — D740:** it follows the same rule, built inside this job as its second step, one merge. Asked twice: he tapped yes, wrote "Sorry explain the 2nd question again", and, explained with Ranger's own Training request (11:00 filed, 10:15 typed on the schedule), tapped "Yes - same rule". It answers `[REQ-ROW-OWN-BOXES]`. |
| 2 | A man added by a drag onto the row on a weekend or holiday: his OIL | "Takes the input's answer" | **D738** — he takes the OIL answer the input already carries; no question on the schedule; OIL Earn still switches him. It narrows D660's reading 4 for an add made on the schedule. |

## Still to ask

- **ANSWERED 10 Oct 26 — D741 ("Yeah I recommend no"):** a change the scheduler makes to an input from the schedule
  after the cut-off never makes it read LATE — a time or remark typed on its row, a man dragged on or off a shared
  row. A change in the input's own window after the cut-off reads late as today; an input already LATE stays LATE. It
  narrows the 9 Aug 26 rule ("the mark measures the input's last change"). The change carries the scheduler's name in
  the history (D739).
- **CONFIRMED FOR EVERY KIND OF INPUT, 10 Oct 26 — D742** (his question while the pictures were drawn: "for all types of
  input if the scheduler changes the input on the schedule the input will change too? But it will not show as late…"):
  yes to both. Read in the code first: a time or a remark typed on an input's row under Personal Inputs or on the
  Unavailable list already changes the input (`ui/inputedit.tsx setInpField` → the input's own save), and that save
  stamps the day of the change, so TODAY it reads LATE after the cut-off. **So the LATE half is new work for those rows
  too** — leave, an overseas duty, a course — not only for the Ground Programme's request rows. A change made in the
  input's own window still reads late (D741's reading 3).
- **Nothing is waiting on him now.** Next for him: the pictures.
- **To find in the code before asking anything more:** what the row's NAME box holds on a request's row today and
  whether a word typed there should become the input's title (D715–D717: the row is judged by its kind, never by its
  title's words); whether anyone is told when a scheduler changes an input from the schedule.
- **Then pictures** of the row on the real screen — the Ground Programme and the Personal Inputs line, the week and
  the board, a phone and a desktop, a flagged man on it, a change waiting on a published day — for his yes (D541;
  D662's reading 2).

## The pictures — sent 10 Oct 26, waiting for his yes

The page: `raptor-port/docs/mock/group-input-one-row.html` (published to him as https://claude.ai/artifact/9L5jorxWtevLyMZkHmreDc);
drawn by `raptor-port/scripts/handpass/gi-mock.mjs` — the built app driven through its own controls and pictured, then
the rows re-arranged on the page into one and pictured again, with only the app's own row and puck. Ten numbered
pictures: the Ground Programme (1–4: the week and the board, a desktop and a phone, today beside new, a man on leave
flagged on the row), Personal Inputs (5, 6), a published day (7 the count 4 → 1, 8 the list of what is waiting as one
line naming the four, 9 the row's own mark), ten people (10).

**What drawing it found, for the plan:**
- **The list of what is waiting to go out is a line a man today** ("Drifter · Range safety brief" × 4), not one item —
  the "All changes" tab already groups it (D663). `[CAL-TOGO-ONE-ITEM]` is real work in this job (D736).
- **Four places say the count** and must agree: the day's "N pending", the Amendments box's "Wed · N changes", the
  changes window's title and its "To go out" tab.
- **A row with several pucks already exists** (a sim row; a ground row with a second man): on the week the People
  column is two pucks wide on a desktop and one on a phone; on the board the pucks wrap. Nothing new to style for the
  Ground Programme. Personal Inputs' People column is one puck wide at every size.
- **The app keeps one empty line under the pucks when they exactly fill their line** (the hidden "+ add" place wraps) —
  on every row today; left as it is.
- **The count on screen is written with a no-break space** ("4 pending") — a test that looks for it with a typed space
  finds nothing.

**The agent's own, shown in the pictures and told to him (technical — not his):** the pucks run A to Z; on a phone the
row's two times stay together at its top (today they spread down a tall row); on a desktop Personal Inputs gets the
Ground Programme's two-puck People column; Personal Inputs' folded line counts the input once.

## The job is two steps, one merge (D740)

1. **The shared input's one row** — D661, D734–D738.
2. **A request's row writes its time and remark through to the request** — D739, and for a one-man request D740.
   Today the row's boxes are the scheduler's own layer over the request (`raptor-port/src/engine/overlay.ts`;
   `OUTSTANDING.md` `[REQ-ROW-OWN-BOXES]`). What stays the row's own: a red box, a CX, the info-only flag, a
   placeholder puck, and on a one-man request's row a man the scheduler adds (D468, D46, D18, D470).

One branch, one FULL check sized by the riskiest part (published days, earned OIL — D485), one merge.

## The agent's own, for the plan (technical — not his)

- The shape stays one record a man with the group's id (the calendar job's plan, §3.13): the row is drawn from them.
- A puck moved on the row writes through the shared input's own writers (`commitGroup` / `removeEntry`), never to the
  first man's record alone (`raptor-port/docs/feature-impact.md`, "One input filed for several people").
- The order of the pucks on the row: A to Z, as the desktop Inputs list names a shared input's people (D727).
