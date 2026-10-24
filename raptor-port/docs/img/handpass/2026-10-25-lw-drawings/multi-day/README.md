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
| `md5-bar-phone.png` / `md5-bar-desk.png` | Drawn | The agent's: each entry of several days one bar — no gaps between its days, rounded only at its ends, its code once at the start; separate entries (5, 6 Nov) keep their gaps | on the run's existing boxes, no pseudo-element: first day `right:-<day line>; border-radius:4px 0 0 4px`; middle `left:0; right:-<day line>; border-radius:0; color:transparent`; last `left:0; border-radius:0 4px 4px 0; color:transparent`. Pending: `outline:none; border:1px dashed rgba(var(--h),.95)`, inner sides `border-left/right:0`. Approved: edge as `box-shadow: inset` lines on the outside sides only (`rgba(var(--h),.85)`). The Inputs-page / moved left edge shown once, at the start |
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

## What a build would have to carry (found while drawing — nobody had written these down)

1. Each day must know whether the day before and the day after are the same entry: for bids the store's "one run" key
   (kind, state, remarks, till, documents — the same run a change of words is saved across); for an approved leave, a
   course or an OD, the one input it comes from.
2. A run that crosses a month's end crosses two of the grid's month pieces, which draw separately: the month beside it
   must repaint when the run's edge changes.
3. The bar: the edge a box wears for "filed on the Inputs page", and the dotted "moved" edge, belong to the entry, so they
   show once, at its start. A day holding two entries (a morning and an afternoon, or a leave beside an HO) breaks the run
   there. A half-day entry is one day and unchanged.
4. A day the drag selects shows as today (its own box, its code, the cyan), in every option.
5. Speed (D991): the frames add one styled pseudo-element to each run day (no node); the bar adds only classes on boxes
   already drawn. Neither adds an element to the grid.
