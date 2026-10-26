# UNA grey, into the ⋯, Grant OIL in its place (D1349) — pictures, 25 Oct 26

Drawn on the built app (this branch, served on port 4180) by `raptor-port/scripts/handpass/lw-1025-una-grey.mjs`, as admin
(Saber), on Drifter. Every picture comes at two sizes: `-phone` (402 × 874 at 3×, his iPhone) and `-desk` (1440 × 900 at
1×). "Today" = the real app, only the dashed cyan mark and the label added. "Drawn" = the app's own nodes and classes
changed on the page. The run's log and measurements: `run-phone.json`, `run-desk.json`.

| Picture | Real / drawn | What it shows | Values chosen |
|---|---|---|---|
| `1a-today-row` | real | The admin's one-day bid window (Drifter, Wed 2 Dec): the row under the leaves, CSE · OD · UNA · ⋯ | — |
| `1b-today-menu` | real | The ⋯ opened: Grant OIL (green), Post out, Post in | — |
| `1c-drawn-row` | drawn | The row as CSE · OD · Grant OIL · ⋯ — Grant OIL in UNA's third place | A clone of the UNA button (same size: measured 83.5 × 30 on the phone, 129 × 30 on the desk, equal to OD's), given the FO/HO boxes' own class `k-oil` (OIL given's green, D1320) and the label the app already gives it in the menu, "Grant OIL" (the counters' "+OIL" is a column name, not this button's) |
| `1d-drawn-menu` | drawn | The ⋯ opened over the drawn row: UNA, Post out, Post in | UNA's menu line cloned from Post out's — the menu's plain look, not a kind colour (the grey is still his to pick, below) |
| `2a-today-grid` | real | Drifter 14–18 Dec, all placed through the app: Mon OD · Tue UNA (whole day) · Wed LL refused · Thu UNA (morning) · Fri LL approved — UNA in today's deep teal | — |
| `2b-drawn-grid-grey-a` | drawn | Grey (a) on both UNA boxes | `--h 184,190,198`, fill 1, words `#0b1116` — box `#B8BEC6`, words `#0B1116` |
| `2c-drawn-grid-grey-b` | drawn | Grey (b) on both UNA boxes | `--h 170,174,180`, fill .22, words `#EEF0F3` — box `#35393E`, edge `#989CA2`, words `#EEF0F3` |
| `3a-today-legend` | real | The Legend: Course, OD, UNA (teal, marked), Medical, then Approved / Pending / Refused | — |
| `3b-drawn-legend-grey-a` | drawn | The Legend's UNA swatch in grey (a) | as 2b |
| `3c-drawn-legend-grey-b` | drawn | The Legend's UNA swatch in grey (b) | as 2c |

Both greys are applied through the app's own recipe for a kind (a filled box is `rgba(--h, --fill)` with a 1px edge of
`rgba(--h, .85)` and `--ink` words), so the grid, the Legend and any UNA button take them alike — no new style.

On the desk the grid picture leaves the name column out: near the year's end the grid cannot scroll 14 Dec beside the
names (the grid stops at 31 Dec), so the cut is 13–19 Dec and the label names Drifter.

## The colours as the page paints them (measured, the same at both sizes)

Each box composited over its cell (`#14181D`). Words-on-box contrast is the accessibility ratio (4.5 : 1 is the floor
lesson 51 reads). ΔE is CIEDE2000: about 2 is "just noticeable", 10 is clearly different side by side, 30+ is unmistakable.

| Box | Fill | Edge | Words | Words on fill |
|---|---|---|---|---|
| UNA today (teal) | `#146264` | `#147D7D` | `#D6FFFB` | 6.6 : 1 |
| UNA grey (a) | `#B8BEC6` | `#B8BEC6` | `#0B1116` | 10.1 : 1 |
| UNA grey (b) | `#35393E` | `#989CA2` | `#EEF0F3` | 10.2 : 1 |
| OD (slate) | `#535C69` | `#798798` | `#F2F5F8` | 6.2 : 1 |
| Refused LL | none (`#14181D`, the cell) | `#4A5560` | `#7D8894`, struck through | 4.9 : 1 |
| LL approved | `#453F2F` | `#D8B365` | `#FFF1CF` | 9.4 : 1 |

| ΔE (CIEDE2000) | vs OD — fill / edge / words | vs refused — fill / edge / words | vs an empty cell |
|---|---|---|---|
| UNA today (teal) | 17.6 / 21.0 / 13.6 | 27.7 / 21.6 / 32.3 | 27.7 |
| UNA grey (a) | **34.5** / 17.7 / **91.5** | **62.5** / 38.4 / 40.1 | 62.5 |
| UNA grey (b) | **12.4** / 9.5 / **1.1** | **10.4** / 29.0 / 28.5 | 10.4 |

**Reading it.** Grey (a) is told apart from both at a glance: it is the only light box with dark words on the grid (its
fill is about five times brighter than any other kind's), far from the OD's slate and from the refused bid's empty box.
Its cost: it is the brightest thing on the grid, so a UNA will catch the eye more than a leave does. Grey (b) cannot be
told apart reliably at a glance: its words are the OD's near-white (ΔE 1.1) and its fill is only a step darker than the
OD's (12.4), so on a phone it reads as "a darker OD"; and its fill is close to the refused bid's empty cell (10.4) — only
its light edge and unstruck words separate it from a refused bid.
