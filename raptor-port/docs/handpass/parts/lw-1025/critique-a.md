# Impeccable critique, Assessment A — the lit state of the Leave War's action row (25 Oct 26, D1348)

A fresh Opus helper, design review only (no detector run, no repo file touched), saved whole as it arrived. Its pictures
(drawn on the page only): `docs/img/handpass/2026-10-25-lw-drawings/critique-a/` — built-approved, built-refused,
built-pending, A-approved, A-approved-word, A-refused, A-refused-word, A-pending, B-approved, each `-phone` and `-desk`
(desk at 1.25×, his PC's scaling). Its scripts stayed in the session's scratch folder (`litlook.mjs`, `contrast.mjs`).

**How it checked.** PRODUCT.md, design-practices §4 and §9 (lessons 32–53), the rulings D1330, D1348 and D1355 in full,
`bidpicker.css`, `BidPicker.tsx`, `DayList.tsx`, `LeaveButtons.tsx`; on the 4180 build, fixtures placed through the app's
own controls (Drifter 6 Nov approved, 4 Nov refused, 5 Nov pending); computed styles measured; pictures at phone (402,
3×) and desktop (1440, 1.25×). No console or page errors.

## 1. Diagnosis

The lit look is a change of degree, not of kind. Composited over the window background (#14181D):

| Button | Composited fill | Luminance Y | Fill vs window | Words on fill |
|---|---|---|---|---|
| Move / Delete (grey chip) | #1A1F26 | .013 | 1.08 | 9.0 |
| Approve, unlit (.16) | #1F342C | .029 | 1.35 | 8.45 |
| Approve, lit (built, .45) | #326847 | .110 | 2.72 | 6.36 |
| Refuse, unlit (.16) | #372228 | .021 | 1.21 | 7.95 |
| Refuse, lit (drawn for Q1, .45) | #77333B | .066 | 1.97 | 8.29 |

- Lit Approve is 2.02:1 against its own unlit look and 2.26:1 against the tinted Refuse beside it; lightness +0.17
  (OKLCH), saturation +0.05.
- The edge goes from half to full opacity (3.08 → 8.52 against the window) — the strongest change, but 1px wide.
- The hue never changes between unlit and lit.
- The words lose contrast when lit (8.45 → 6.36).
- The red drawing failed because red at the same strength lifts luminance much less than green: lit Refuse 1.63:1
  against unlit Refuse, 1.46:1 against the unlit Approve beside it.
- The resting look is already the app's "on" look (pale fill, coloured words and edge — a picked filter chip, Whole day).
- Measured live: a pending bid and a refused bid draw the row identically; only the cyan ring differs (pending rings LL;
  refused rings nothing). A refused bid shows its state to a screen reader only.
- Competing fills: CSE, OD and UNA are always filled, UNA (lightness .45) and OD (.47) as light as lit Approve (.47);
  FO/HO green is near Approve's green — D1349's +OIL would add a second green; the cyan ring on the day's leave (9:1, 2px)
  is the loudest edge; "current" is shown three ways (Whole day pale cyan, LL cyan ring, Approve stronger tint).
- The colours lost their reason: the CSS says Approve and Refuse borrow the colours of the cell they paint; since look F
  (D1175) an approved cell wears its kind's colour and a refused one is grey and struck through.

## 2. Nielsen heuristics, this row only — 19 of 36

1 Visibility of status 1 (pending and refused identical; approved only a stronger tint; no state words since "NOW LL"
went) · 2 Match 2 ("Approve" on an approved leave reads as an instruction, and a tap does the opposite) · 3 Control 3
(reversible; how only in a desktop tooltip) · 4 Consistency 1 (three looks for "current"; rest wears the "on" look; the
medical-clash window's picked-segment look is inverted here) · 5 Error prevention 2 (a "make sure" tap un-approves, closes
the window, pings the member's bell — D1142) · 6 Recognition 2 · 7 Efficiency 3 · 8 Minimalism 2 (colour spent at rest) ·
9 Recovery 3 · 10 Help n/a.

## 3. Priority issues

- **P1 — the lit look needs a change of kind.** Approve and Refuse rest on Move's grey chip with their words in their
  colour; lit = solid status colour, dark words, no glow (the medical-clash window's picked segment, `.upconf-seg.on-rem`).
  Inside the file's `#page-leavewar { }` wrapper, beating `.dl-acts .dchip` and `.dl-acts .dchip.approve/.refuse`:
  `.bidsheet .dchip.approve, .bidsheet .dl-acts .dchip.approve { background: var(--panel-2); border: 1px solid var(--edge); color: #8FE0A8; }`
  `.bidsheet .dchip.refuse, .bidsheet .dl-acts .dchip.refuse { background: var(--panel-2); border: 1px solid var(--edge); color: #FFA6AD; }`
  `.bidsheet .dchip.approve.lit, .bidsheet .dl-acts .dchip.approve.lit { background: var(--ok); border-color: var(--ok); color: #06210F; }`
  `.bidsheet .dchip.refuse.lit, .bidsheet .dl-acts .dchip.refuse.lit { background: var(--hard); border-color: var(--hard); color: #14060A; }`
  Measured: lit green 7.9:1 against the grey neighbours, its words 8.2:1; lit red 4.9:1, its words 5.9:1; resting words
  on grey 10.6 and 8.9. White words on solid red reach only 3.40 — dark words required. Button sizes unchanged.
- **P1 — a refused bid lights nothing (D1355, not built).** `lit` on Refuse when `!span && decide?.state === 'refused'`
  in `BidPicker.tsx` and `c.state === 'refused'` in `DayList.tsx`; ring the refused leave's button (`leaveOn(…, refused)`
  lights none today). A second tap on a lit Refuse is a silent close today; for symmetry with D1330 it should send the bid
  back to pending — his question.
- **P1 — the state in words: the lit button reads "Approved" / "Refused".** "Approved" is 62px in 74px on the phone
  (Windows font); the iPhone's letters ~8–10% wider, ~68px — fits. A ✓ before it (+12px) would wrap on an iPhone, so the
  word, no glyph. Gives the one-day window a state word, a cue without colour, an honest toggle. His call: D1330 rules
  "Approve shows lit", not its word.
- **P2 — the cyan ring erases the leave button's own look:** `.tchip.lv.lit { outline: 2px solid accent }` replaces the
  pending look's dashed outline; the ringed LL then wears a solid grey edge no state has. Fix: drop the `.lit` outline
  lines (~1789–1790) and draw the ring as a solid spread shadow (`0 0 0 2px var(--panel), 0 0 0 4px var(--accent)`) so
  `.s-w`'s dashed outline survives.
- **P2 — one solid green in the window:** when D1349 moves +OIL into UNA's place, keep its light tint, never solid.
- **P3 — write it down:** a colour-table row and a design lesson (D1348); note the "matches the cell" reason ended with D1175.

## 4. Recommended look and alternatives

- **A (recommended):** grey at rest with coloured words; lit = solid green or red, dark words, the word "Approved" /
  "Refused". Three clearly different looks; emphasis by surface; existing status colours; no glow; sizes kept; not cyan.
- **B:** keep the tinted rest; only the lit look solid with dark words (lit green 7.06:1 against the tinted Refuse, lit red
  3.89:1 against the tinted Approve) — but the rest keeps the app's "on" look.
- **C (not recommended):** a 2px status edge plus the word, no fill — the same thin signal that failed.

## 5. Persona red flags

- **Scheduler deciding 30 bids on a desktop:** the window closes on every decision, so the lit state is seen only on
  reopening — the "did I already do this one?" moment; refused and pending look the same; a "make sure" tap un-approves
  and pings the member; at 125% telling saturations apart is hard; the second tap is explained only by a hover tooltip.
- **Member on an iPhone in sunlight:** he never sees Approve or Refuse (admin-only); "is it approved?" rests on the grid
  box and My leave; glare flattens the tints; his own refused or pending bid window has no state word.

## 6. Questions it raised

1. Approve and Refuse were coloured to match the cell they paint, which since look F they no longer do — should they rest
   uncoloured, so the only colour in the row is the decision once made?
2. Should a second tap undo at all, or only Refuse / a "Send back" in ⋯, so a "make sure" tap never pings the member?
3. Should the one-day window carry the state in words a member also sees (for example "LL · pending" in the day line)?
