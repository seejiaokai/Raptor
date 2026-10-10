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

## Still to ask

- **Round 2:** a time or a remark typed in the shared row's own boxes — the row's own, as on a one-man request's row
  today (`OUTSTANDING.md` `[REQ-ROW-OWN-BOXES]`, the same question for one man, still open), or the input's; and the
  OIL answer of a man the scheduler adds by dragging his puck onto the row on a weekend or holiday (D660's reading 4:
  "answered for by whoever adds him, at that save").
- **Then pictures** of the row on the real screen — the Ground Programme and the Personal Inputs line, the week and
  the board, a phone and a desktop, a flagged man on it, a change waiting on a published day — for his yes (D541;
  D662's reading 2).

## The agent's own, for the plan (technical — not his)

- The shape stays one record a man with the group's id (the calendar job's plan, §3.13): the row is drawn from them.
- A puck moved on the row writes through the shared input's own writers (`commitGroup` / `removeEntry`), never to the
  first man's record alone (`raptor-port/docs/feature-impact.md`, "One input filed for several people").
- The order of the pucks on the row: A to Z, as the desktop Inputs list names a shared input's people (D727).
