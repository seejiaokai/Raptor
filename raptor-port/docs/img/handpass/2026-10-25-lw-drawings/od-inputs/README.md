# OD and UNA — the Leave War and the Inputs page (25 Oct 26)

His question: *"can u show me the comparison of OD and UNA on leave war, and inputs"* — *"Can u show me how OD look like on
inputs"*. Pictures of the real built app (port 4180), each cut to its area, the OD (or the place in question) in a dashed
cyan box, a short label on the picture. Phone 402 × 874 at 3×, desktop 1440 × 900 at 1×. Made by
`raptor-port/scripts/handpass/lw-1025-od-inputs.mjs`; measured figures in `run-phone-desk.json`.

Fixtures, through the app's own controls as admin (Saber), on Drifter: Mon 14 Dec an overseas duty (OD) filed from the bid
window; Tue 15 a whole-day UNA; Wed 16 a local leave bid, refused; Thu 17 a morning UNA; Fri 18 an approved local leave.
Each was checked as landed before any picture. "Today" pictures add nothing but the mark and the label. The one "Drawn"
picture paints UNA in grey (a) exactly as `../una-grey/` does (the app's own kind recipe: 184,190,198, filled solid, dark
words) — nothing is built.

| Picture | Phone | Desktop | What it shows |
|---|---|---|---|
| 1 Leave War today | `1-leavewar-today-phone.png` | `1-leavewar-today-desk.png` | Drifter 14–18 Dec: the OD's slate box, the whole-day UNA's deep teal, the refused LL, the morning UNA, the approved LL — the OD and both UNAs boxed |
| 2 Leave War, drawn | `2-leavewar-drawn-grey-a-phone.png` | `2-leavewar-drawn-grey-a-desk.png` | The same row with UNA in grey (a): the OD's slate beside the light grey UNA |
| 3 Inputs calendar | `3-inputs-calendar-phone.png` | `3-inputs-calendar-desk.png` | December's week of 14–20: the OD's bar on 14 Dec ("Drifter" on a phone, "Drifter · OD" on a desktop) in the same slate as the Leave War, the approved LL's amber bar on 18 Dec; no bar on 15 or 17 — UNA is never shown here (D1338) |
| 4a Inputs day, 14 Dec | `4a-inputs-day-14dec-phone.png` | `4a-inputs-day-14dec-desk.png` | 14 Dec opened: one input, Drifter's OD — a plain dark card, a small RED square, the letters "OD" in grey; no slate |
| 4b Inputs day, 15 Dec | `4b-inputs-day-15dec-phone.png` | `4b-inputs-day-15dec-desk.png` | 15 Dec (the whole-day UNA's day) opened: "No inputs on this day" — the UNA is not there |
| 5 Inputs list | `5-inputs-list-phone.png` | `5-inputs-list-desk.png` | The list, all dates: the OD's card (phone — the same card as the day, red square, grey "OD") and row (desktop — a red edge down its left, a grey "OD" pill); no UNA of Drifter anywhere in the list |

## The colours, as painted (each box over what it sits on; the same on phone and desktop)

| What | Box fill | Edge | Words | Words on box |
|---|---|---|---|---|
| Leave War — OD (slate 128,142,160 at .58) | #535C69 | #798798 | #F2F5F8 | 6.2 : 1 |
| Leave War — UNA today (deep teal) | #146264 | #147D7D | #D6FFFB | — |
| Leave War — UNA drawn, grey (a) | #B8BEC6 | #B8BEC6 (the edge melts into the fill) | #0B1116 | 10.1 : 1 |
| Leave War — refused LL (for reference) | #14181D (the empty cell) | #4A5560 | #7D8894, struck | — |
| Inputs calendar — OD bar | #535C69 | #7B899A | #FFFFFF | 6.7 : 1 |
| Inputs calendar — approved LL bar | #6D5E3D | #E5BD69 | #FFFFFF | — |
| Inputs day and phone list — OD card | #1A1F26 (plain card) | #2A313A | name #F1F4F7, "OD" #8A96A3; the small square #F0555F (red) | "OD" 5.5 : 1 |
| Inputs desktop list — OD row | #0B0D10 (plain row) | a 3px red edge on the left, #F0555F | #F1F4F7; the "OD" pill #1A1F26, edge #2A313A, letters #B6C0CB | — |

## Do they read apart?

How different two colours look (ΔE 2000 — about 2 is just noticeable, 10 and over plainly different side by side):

- **OD slate vs UNA grey (a), on the Leave War:** fill 34.5, edge 17.7, words 91.5 (white words on the OD, near-black on
  the grey). They read apart plainly — the OD is a mid-dark slate with light words, grey (a) a light grey with dark words;
  the difference is mostly how light they are, both being cool greys with little colour.
- **OD on the Inputs calendar vs grey (a):** fill 34.5 — the same, since the calendar bar is the Leave War's slate
  (fill difference 0, edge 0.9, words 2.8 against the Leave War's own OD box).
- **OD vs UNA today (teal):** fill 17.6 — apart, but much closer than OD vs grey (a).
- **Grey (a) vs the refused LL:** fill 62.5 — the refused box stays an empty dark cell with grey struck letters; no
  confusion.

## What it shows him

- On the Inputs page the OD wears its slate **only on the calendar's month bar**. Opened in the day, and in the list, it is
  a plain card or row marked with the app's red "absence" square (or red left edge) and the letters "OD" in grey — the same
  red every absence has there, not the slate.
- UNA appears nowhere on the Inputs page — not on the calendar, the day or the list — as ruled (D1338). So the grey (a)
  UNA and the OD never stand side by side on the Inputs page; they meet only on the Leave War.
- The desktop Leave War crops are small (about 248 px wide at 1×, the grid's own cell size on a 1440 desktop); the phone
  crops (750 px wide) are the ones to judge the colours by.
