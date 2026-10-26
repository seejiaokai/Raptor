# Impeccable critique, Assessment B — detector and browser evidence for the action row (25 Oct 26, D1348)

A fresh Opus helper, evidence only, saved as it arrived. Measured in Chromium on the 4180 build (this branch); WebKit not
measured — the colours come straight from the stylesheet. Nothing written to the repo; its pictures, data and scripts
stayed in the session's scratch folder (`critique-b/`).

## 1. The detector, from the command line

`detect.mjs --json` on `BidPicker.tsx`, `DayList.tsx`, `SelectSheet.tsx` (the three files that draw `.bp-acts` /
`.dl-acts`): exit 0, zero findings; again with `--no-config` (no ignore rule hiding anything): zero; `bidpicker.css` with
`--no-config`: zero. On TSX the detector matches text patterns only — it never sees computed colours, so a clean scan says
nothing about whether the lit state stands out.

## 2. Measured colours — phone 402×874 at 3× and desktop 1440×900, identical at both

The window behind the row is opaque #14181D (`--panel`, Y .0089); each computed fill matches its painted pixel within 1.

| Button (state) | CSS fill / text / edge | Painted fill | Y | Text on fill | Fill vs window | Edge vs window |
|---|---|---|---|---|---|---|
| Approve, unlit (pending, refused, a bid in the day's list) | rgba(87,201,122,.16) / #8FE0A8 / rgba(87,201,122,.5) | #1F342C | .0295 | 8.42 | 1.35 | 3.67 |
| Approve, lit (approved leave, window and day's list) | rgba(87,201,122,.45) / #F2FFF5 / #57C97A | #326847 | .1097 | 6.39 | 2.71 | 8.52 |
| Refuse, every state, a refused bid included | rgba(240,85,95,.16) / #FFA6AD / rgba(240,85,95,.5) | #372228 | .0210 | 7.97 | 1.21 | 2.52 |
| Move | #1A1F26 / #B6C0CB / #2A313A | #1A1F26 | .0134 | 8.98 | 1.08 | 1.36 |
| Delete | #1A1F26 / #B6C0CB / #8A96A3 dashed | #1A1F26 | .0134 | 8.98 | 1.08 | 5.92 |

No action button has an outline or shadow in any state.
- Lit Approve vs the unlit Refuse beside it: 2.25:1 (luminance gap .089, OKLab ΔE 21.9); edges 3.38:1; the lit button's
  own words are lower in contrast than Refuse's (6.39 against 7.97).
- Lit Approve vs unlit Approve on a pending bid: 2.01:1 — below the 3:1 asked for telling states apart; the two word
  colours differ by 1.52:1.
- Unlit Approve vs unlit Refuse: 1.12:1.
- **Refuse on a refused bid vs Refuse on a pending bid: identical, 1.00:1** — the code sets only the pressed flag for a
  screen reader (`BidPicker.tsx` ~571, `DayList.tsx` ~275); the stylesheet has only `.approve.lit` (1743–1744).
- Other chips in the window, fill vs window: OD 2.63, OL 2.55, UNA 2.51, OIL 2.15, CSE 1.64; the cyan ring 8.85. So the
  lit Approve's 2.71 sits in the band of ordinary leave chips — it is not the strongest mark in the window.

## 3. The browser overlay

`detect.js` injected into the approved leave's open window (Drifter, 6 Nov) at both sizes: page-wide 2095 (phone) / 2827
(desktop) findings, mostly the grid (undersized text, cramped padding, palette, thin border with wide shadow, …). Inside
the bid window three at each size, none on the action row: the window's 1px border with a 48px shadow (a floating sheet —
likely false), Move's teal arrow (his D330 / D334 — false), "Whole day" (the app's selection colour — likely false). No
low-contrast finding; its pixel contrast check returned nothing. The overlay gave no evidence either way on the lit state.

## 4. Servers

The live server ran twice on port 8400 from the scratch folder; each stopped with `live-server.mjs stop --keep-inject`;
confirmed stopped (no answer on /health, processes gone, port free). The 4180 preview was left alone.

## 5. Fixtures

Admin, Drifter: 6 Nov LL approved; 4 Nov LL refused; 9 Nov LL pending; 5 Nov an approved morning LL and a pending
afternoon LL (the day's list). All landed; no console errors.
