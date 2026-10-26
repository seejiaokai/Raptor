# A leave over several days reads as one entry (D1340) — drawings, 25 Oct 26

Drawn on the built bundle of `claude/lw-m3-placing-leave` (served on port 4180) by
`raptor-port/scripts/handpass/lw-1025-multiday.mjs`. Phone = 402 × 874 at 3x (his iPhone), desktop = 1440 × 900 at 1x.
Every picture is cut to Drifter's row, 1–13/14 Nov 2026, two rows above and below and the stuck date row; the dashed
cyan box marks Drifter's days; the label says "Today:" (real app, only the mark and label added) or "Drawn:".

## The fixtures (placed through the app's own controls, as an admin, each checked in the saved records)

| Days | What | How it was placed | Checked |
|---|---|---|---|
| 2–4 Nov | pending LL, **one bid** | one drag, "Approve what I enter" off | the three days' bids share one set of words (the store's own "one run" key: kind, state, remarks, till, documents) |
| 5 Nov, 6 Nov | pending LL, **two bids** | one-day window each, remarks "Wedding" / "Family" | different words, so two runs. Two next-door bids with the same words already act as one (D1346), so the pair needs words of its own to be two |
| 9–11 Nov | approved LL, **one leave** | one drag, "Approve what I enter" on | one input on the Inputs page, Nov 9 – Nov 11 |
| 12–13 Nov | overseas duty, **one entry** | one drag, OD | one input, Nov 12 – Nov 13 |

## Cell sizes measured

| | Day cell (incl. its 1px day line) | Box inside it | Margin round the box | Grid zoom |
|---|---|---|---|---|
| Phone | 20.8 × 21.4 px (62 × 64 device px) | 16.6 × 17.3 px | 2px in grid units (1.6 px on screen) | 0.8 (opens one step out) |
| Desktop | 26 × 26.6 px | 21 × 21.6 px | 2px | 1 |

Every frame lives in that 2px margin, inside the row (top 0 to bottom 0 of the cell); nothing reaches the next row.

## The pictures

| File (phone / desktop) | Real or drawn | What it shows | CSS the option uses |
|---|---|---|---|
| `md1-today-phone.png` / `md1-today-desk.png` | Real | Today: ten boxes, each day its own; nothing says 2–4 Nov is one bid and 5, 6 Nov two | — |
| `md2-grey-phone.png` / `md2-grey-desk.png` | Drawn | His faint grey box round each entry of several days | on each run day's cell `::before`: edge `1px solid rgba(190,200,212,.70)` (top + bottom every day, left on the first, right on the last, corners 5px), fill `rgba(170,182,196,.10)`, `top:0; bottom:0; left:0; right:-<day line>` (reaches over the day line to the next day) |
| `md3-white-phone.png` / `md3-white-desk.png` | Drawn | His thin white box | the same, edge `1px solid rgba(255,255,255,.92)`, no fill |
| `md4-black-phone.png` / `md4-black-desk.png` | Drawn | His black box | the same, edge `1px solid #000`, fill `rgba(0,0,0,.62)` |
| `md5-bar-phone.png` / `md5-bar-desk.png` | Drawn | The agent's: each entry of several days one bar — no gaps between its days, rounded only at its ends, its code once at the start; separate entries (5, 6 Nov) keep their gaps | on the run's own existing boxes (`.c.mrun-box` — the one of the run's kind where a day holds two), no pseudo-element: first day `right:-<day line>; border-radius:4px 0 0 4px`; middle `left:0; right:-<day line>; border-radius:0; color:transparent`; last `left:0; border-radius:0 4px 4px 0; color:transparent`. Pending: `outline:none; border:1px dashed rgba(var(--h),.95)`, inner sides `border-left/right:0`. Approved: edge as `box-shadow: inset` lines on the outside sides only (`rgba(var(--h),.85)`). The Inputs-page / moved left edge shown once, at the start |
| `md6-grey-drag-phone.png` / `md6-grey-drag-desk.png` | Drawn + a real drag | His grey box with a real drag held over 10–11 Nov (picture taken with the finger / mouse still down): the cyan is the app's own | as md2, plus: on a day the drag has selected the box steps aside (`td.selcell` gets no frame), so the cyan wash and ring show exactly as today |
| `md6-bar-drag-phone.png` / `md6-bar-drag-desk.png` | Drawn + a real drag | The one bar with the same real drag over 10–11 Nov | as md5, plus: a selected day goes back to its own box with its code, so the cyan shows exactly as today |

`<day line>` = the cell's right border: 1px on desktop, 1.25px in grid units on the phone. All values are in the grid's own
units; the phone's 0.8 zoom applies to them as to the rest of the grid.

## What the drawing shows about each option

- **Grey:** reads on the phone at 3x; at the desktop's real 1x it is hard to see, because the grid's own day and row lines
  are grey too (rgba(70,81,94,.8)) and the frame has only the 2px margin to sit in. The faint fill also tints the inside
  of a hollow (pending) box a little.
- **White:** the clearest of the three, on both sizes. It is a new strong line round many boxes on a busy grid, beside the
  cyan selection ring, the blue just-added ring and the green open-bidding outline.
- **Black:** on the app's dark grid it reads as darker cells, not as a box; its one visible effect is that the day lines
  inside the entry disappear.
- **One bar:** reads at a glance on both sizes with no new colour or line; fewer letters on the grid (the code once);
  separate entries keep the gap they have today.

## His follow-up: a day in the bar that holds a second entry (`PART=busy`)

His question: "if it's one bar, how does it look if there are multiple inputs for a day in the middle? Or the end?"
Same script, `PART=busy node scripts/handpass/lw-1025-multiday.mjs`. Fixtures through the app (admin, Drifter, clean
context each), checked in the saved records:

| Case | Fixture | How placed | Checked |
|---|---|---|---|
| 1 | approved LL 9–13 Nov + an FO on the middle day, 11 Nov | one drag (Approve on); FO from the bid window's ⋯ → Grant OIL, 1 day | one input Nov 9–13; 11 Nov draws two boxes, LL left half, FO right half |
| 2 | the same with the FO on the last day, 13 Nov | a second clean browser context | as above, on 13 Nov |
| 3 | approved **morning** LL 16–18 Nov + an afternoon **HO** on 17 Nov | one drag, Duration AM; HO from Grant OIL, 0.5 day, PM | one input Nov 16–18, half AM; 17 Nov draws LL top half, HO bottom half |

Case 3 was asked with an afternoon OD; the app does not allow it: an OD is filed as whole days, even on a day holding a
half-day leave (D1350). The afternoon entry is therefore an HO from the same Grant OIL panel.

| File (phone / desktop) | Real or drawn | What it shows | How it is drawn |
|---|---|---|---|
| `busy1-today-*` | Real | 9–13 Nov LL, 11 Nov LL and FO side by side | — |
| `busy1-a-*` | Drawn | A: the bar runs through 11 Nov; the FO is hidden behind the grid's own "+1" corner tile | bar as md5 over 9–13; on 11 Nov the LL box made whole-day, the FO box hidden, the grid's `mk more` "+1" tile added (top-right, as the grid places it) |
| `busy1-b-*` | Drawn | B: the bar breaks round 11 Nov; 11 Nov exactly as today; the piece after the break shows "LL" again at its start | two bars, 9–10 and 12–13; the ends beside the break stay square (`border-*-radius: 0`) to say the leave carries on; rounded only at its real first and last day |
| `busy2-today-*` | Real | 9–13 Nov LL, 13 Nov LL and FO side by side | — |
| `busy2-a-*` | Drawn | A: the bar runs to its end on 13 Nov; the FO behind "+1" | as busy1-a, on the last day |
| `busy2-b-*` | Drawn | B: the bar stops at 12 Nov (square end); 13 Nov as today | one bar 9–12 |
| `busy3-today-*` | Real | 16–18 Nov morning LL, 17 Nov LL top and HO bottom | — |
| `busy3-a-*` | Drawn | A: the morning bar runs through; the HO behind "+1" (bottom-right, the grid's own place when the top half holds letters) | bar on the top-half boxes; HO hidden; `mk more` + the cell's `mklo` |
| `busy3-b-*` | Drawn | B: the bar breaks round 17 Nov; with one day each side it is today's look but for square ends | 16 and 18 are one-day pieces, square on the side of the break |
| `busy3-c-*` | Drawn (the agent's addition) | C: the morning bar runs through 17 Nov and the afternoon HO keeps its own bottom half; nothing hidden, no break | bar on the top-half boxes only (the bar's rules take the run's own box, `.c.mrun-box`); the HO untouched |

Desktop case 3 pictures leave the names column out: on the desktop's width the grid cannot scroll 15 Nov to the names'
edge (the scroll stops with 31 Dec at the right), and the alternative was a sliver of 13 Nov's box at the cut's edge.

**What it shows:** A hides the second entry behind "+1" — the look D1146 replaced ("shows both in its cell, not one code
with a +n corner"), so A would go back on that ruling for any day inside a bar. B keeps every entry visible and costs
only a break, which the square ends and the repeated code make read as one leave. For a half-day run, C shows both with
no break at all, because the other entry sits in the other half.

## What a build would have to carry (found while drawing — nobody had written these down)

1. Each day must know whether the day before and the day after are the same entry: for bids the store's "one run" key
   (kind, state, remarks, till, documents — the same run a change of words is saved across); for an approved leave, a
   course or an OD, the one input it comes from.
2. A run that crosses a month's end crosses two of the grid's month pieces, which draw separately: the month beside it
   must repaint when the run's edge changes.
3. The bar: the edge a box wears for "filed on the Inputs page", and the dotted "moved" edge, belong to the entry, so they
   show once, at its start. A day in a whole-day run that holds a second entry either breaks the bar (B) or hides the
   second entry behind "+1" (A) — his choice (busy pictures); in a half-day run the second entry in the other half sits
   under the bar (C). The bar's rules must take only the run's own box on such a day, never the second entry's. A
   half-day entry on its own is one day and unchanged.
4. A day the drag selects shows as today (its own box, its code, the cyan), in every option.
5. Speed (D991): the frames add one styled pseudo-element to each run day (no node); the bar adds only classes on boxes
   already drawn. Neither adds an element to the grid.
