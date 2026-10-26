# The lit Approve / Refuse, drawn stronger — 25 Oct 26

His D1348 ("seems like the contrast of the approved or refuse is not that obvious"): a lit Approve or Refuse — the entry's
state — must stand out plainly from the unlit buttons beside it, in the one-day bid window and the day's list; with
D1355, a refused bid lights Refuse in its red and rings the refused leave's button, as an approved leave lights Approve.

Drawn on the built bundle of `claude/lw-m3-placing-leave` (port 4180, a fresh store), as admin, on Drifter's row: an
approved LL on Fri 6 Nov, a refused LL bid on Wed 4 Nov, and on Thu 5 Nov an approved morning LL with a refused
afternoon LL (the day's list). Every fixture was placed through the app's own controls and checked before its picture.
Script: `raptor-port/scripts/handpass/lw-1025-contrast.mjs` (its run record, with every measure: `run-phone-desk.json`).
"Today" pictures are the real app with only the dashed cyan mark and the label added. "Drawn" pictures change the app's
own buttons in place (inline colours, the app's own `.lit` class on the leave button, the word) and say "Drawn" on the
picture; the window is closed and opened again between options. Phone = 402 × 874 at 3×; desk = 1440 × 900 at 1×.

**Recommendation (his to decide): B** — it gives the lit button the most contrast against the button beside it
(7.9 to 1 approved, 4.9 to 1 refused, against 2.3 and 1.1 today), every word stays as it is and fits, and the state
becomes the only colour in the row. C's word "✓ Approved" does not fit a phone button (below).

## The pictures

| File (each `-phone.png` and `-desk.png`) | Real / drawn | What it shows |
|---|---|---|
| `1-today-approved` | real | An approved leave's one-day window: Approve lit as built (fill at 45%), LL ringed |
| `2-today-refused` | real | A refused bid's one-day window: nothing lit (Refuse is pressed for screen readers, no look) |
| `3-today-daylist` | real | The day's list: approved morning (Approve lit as built), refused afternoon (nothing lit) |
| `4-a-approved` | drawn | A, approved: Approve solid green, dark words |
| `4-b-approved` | drawn | B, approved: Approve solid green, Refuse in Move's grey |
| `4-c-approved` | drawn | C, approved: Approve solid green reading "✓ Approved" — fills the phone button edge to edge |
| `4-c-approved-wideletters` | drawn, phone only | C with the letters a seventh wider (as an iPhone's may be): "Approved" is cut |
| `5-a-refused` | drawn | A, refused: Refuse solid red, dark words; LL ringed |
| `5-b-refused` | drawn | B, refused: Refuse solid red, Approve in Move's grey; LL ringed |
| `5-c-refused` | drawn | C, refused: Refuse solid red reading "✕ Refused"; LL ringed |
| `5-c-refused-wideletters` | drawn, phone only | C with the letters a seventh wider: "✕ Refused" just fits, with no room left |
| `6-b-daylist` | drawn | B in the day's list: both entries (approved morning, refused afternoon) |
| `6-c-daylist` | drawn | C in the day's list: both entries |

The day's list is drawn for B (the recommendation) and C (drawn first, and the option that changes the row most);
A in the day's list is not drawn — the script draws it with `DL_OPTS=A`.

## Each option's exact values

Applied to the lit button only (the one-day window's `decide-approve` / `decide-refuse`, the list's `dl-approve-<id>` /
`dl-refuse-<id>`); size, padding, radius, 1px border width and font (12.5px, weight 700, as every `.dchip`) unchanged.

| | Lit Approve | Lit Refuse | The other decision button | Word |
|---|---|---|---|---|
| Today (built) | `background: rgba(87,201,122,.45); color: #F2FFF5; border-color: rgba(87,201,122,1)` | — (no lit look) | unchanged | Approve |
| Q1 drawing (he found it not obvious) | — | `background: rgba(240,85,95,.45); color: #FFF2F3; border-color: rgba(240,85,95,1)` | unchanged | Refuse |
| **A — solid** | `background: #57C97A; color: #0b1116; border-color: #57C97A` | `background: #F0555F; color: #0b1116; border-color: #F0555F` | unchanged (tinted, 16%) | Approve / Refuse |
| **B — the rest step back** | as A | as A | Move's grey: `background: var(--panel-2)` (#1A1F26); `color: var(--ink-2)` (#B6C0CB); `border: 1px solid var(--edge)` (#2A313A) | Approve / Refuse |
| **C — the word says it** | as A | as A | unchanged | "✓ Approved" / "✕ Refused" |

In every refused drawing the LL button also takes the app's own `.lit` class (its existing 2px cyan outline, offset 2px),
as the approved leave's LL wears it. Where the values come from: #57C97A is the Approve chip's own green
(`rgba(87,201,122)`) at full strength — the stylesheet uses it solid only as an edge today, so a solid green button
fill is new; #F0555F is the Refuse chip's own red and already a solid fill (the armed Delete in the counter's window,
words #1A0508 there). The dark words #0b1116 are as briefed. The weight stays 700 (the row's bold): 800 would fall back
to Segoe UI's 900 on Windows and change the button's width.

## The measures

The window's real background, read from the page: `rgb(20,24,29)` (#14181D), solid, no gradient — the same behind the
one-day window's row and the day's list's rows. Each fill is composited on it; L = relative luminance (WCAG); a ratio is
(lighter L + 0.05) / (darker L + 0.05). "Beside it" = the other decision button in the same row, as it is drawn in that
picture. Same figures at phone and desk.

| State | Lit fill (L) | The decision button beside it (L) | Lit vs beside it | Lit vs its own unlit look | Words on the lit fill |
|---|---|---|---|---|---|
| Today, approved (built) | #326847 (0.110) | Refuse #372228 (0.021) | **2.26 : 1** | 2.02 : 1 | #F2FFF5 — 6.36 : 1 |
| Today, refused (nothing lit) | Refuse #372228 (0.021) | Approve #1F342C (0.029) | **1.12 : 1** | — | #FFA6AD — 7.95 : 1 |
| Q1 drawing, refused | #77333B (0.066) | Approve #1F342C (0.029) | **1.46 : 1** | 1.63 : 1 | #FFF2F3 — 8.29 : 1 |
| A, approved | #57C97A (0.452) | Refuse #372228 (0.021) | **7.06 : 1** | 6.33 : 1 | #0B1116 — 9.08 : 1 |
| A, refused | #F0555F (0.258) | Approve #1F342C (0.029) | **3.89 : 1** | 4.34 : 1 | #0B1116 — 5.58 : 1 |
| B, approved | #57C97A (0.452) | Refuse in grey #1A1F26 (0.013) | **7.92 : 1** | 6.33 : 1 | #0B1116 — 9.08 : 1 |
| B, refused | #F0555F (0.258) | Approve in grey #1A1F26 (0.013) | **4.87 : 1** | 4.34 : 1 | #0B1116 — 5.58 : 1 |
| C, approved | as A | as A | **7.06 : 1** | 6.33 : 1 | #0B1116 — 9.08 : 1 |
| C, refused | as A | as A | **3.89 : 1** | 4.34 : 1 | #0B1116 — 5.58 : 1 |

Every option's words pass 4.5 : 1 on the lit fill. The red lit is the weaker of the two in every option because a solid
red is darker than a solid green (L 0.258 against 0.452); B lifts it most (3.89 → 4.87) by taking the green out of the
Approve beside it. The day's list measures the same as the one-day window (its rows stand on the same background).

## C's fit on a phone

The phone's action buttons are 83.5px wide, 74px between their padding (82px inside the edge); at desk 119px. In the
test browser's letters (Segoe UI):

| Words | Width | A seventh wider (an iPhone's letters may be) | Fits 74px? |
|---|---|---|---|
| "✓ Approved" (C) | 75.8px | 86.4px | **No** — fills the button edge to edge already; cut with wider letters (`4-c-approved-wideletters`) |
| "✕ Refused" (C) | 65.1px | 74.2px | Yes, but with wider letters no room is left (`5-c-refused-wideletters`) |
| "Approved", no mark (measured only) | 62.0px | 70.7px | Yes |
| "Refused", no mark (measured only) | 50.5px | 57.6px | Yes |

So C as briefed fails on his phone for Approved; the plain words without the tick and cross would fit (not drawn).
On the desk every wording fits with room to spare. Only his own iPhone proves a fit.

## What it touched that the brief did not name

- Today a refused bid's Refuse carries `aria-pressed="true"` but no look of its own (`.dchip.refuse.lit` has no rule);
  D1355's build needs that rule, in the one-day window and the day's list, and the refused leave's `.lit` ring.
- B's grey is copied from the Move chip's computed look, so it follows the theme; the button keeps its own click.
- The day line above the row reads "No manning row is amber or red" on the approved window and "…turns amber or red" on
  the refused one — seen, not part of this question.
- No console errors, page errors or failed requests at either size.
