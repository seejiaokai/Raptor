# [HUMAN-RETEST] the absence record — RE-WALK, walker W4: the phone by finger, and the money (26 Sep 26)

Re-walker **W4**, following `raptor-port/docs/superpowers/briefs/2026-09-26-absence-rewalk-brief.md` (W4: AB6, W4-1, the
eight-record day). The rebuilt app on `http://localhost:4175`, bundle **`index-KbvILaPW.js`** (checked before the first run;
the Leave War chunk served is `LeaveWarPage-DEHeUt8m.js`). Not rebuilt, no server touched, nothing under `raptor-port/src`
changed. Every first-walk script hard-coded its picture folder and its log, so each was COPIED to `rw-w4-*.mjs` and only the
copy changed (the first walk's scripts, pictures and logs are untouched). Pictures:
`raptor-port/docs/img/handpass/2026-09-26-absence/rewalk/w4/`. Results: `raptor-port/docs/handpass/parts/2026-09-26-absence-rewalk-w4-*.txt`.

| copy | what changed in the copy |
|---|---|
| `rw-w4-06-saturday.mjs` | AB6's checks read the fix's own words (the tail line, its second line, no buttons on it, the right clash sentence per role); the member is read at the desktop too (the first walk read him at 390 px only); the money check names its figures |
| `rw-w4-08-hold-why.mjs` | W4-1's three halves: the one-day hold keeps the sheet (and the sheet fills the day); a plain tap opens the one-cell sheet; a drag still selects. Plus the member's own row, and a probe of the 400 ms wait |
| `rw-w4-07-hold-probe.mjs` | each of the six holds is now a check (the sheet must be open after the lift) |
| `rw-w4-03-touch.mjs` | folder and log only |
| `rw-w4-04-eight.mjs` | the phone's afternoon bid now goes in through a REAL one-day hold (the fix's premise); `phone twoday` repeats the first walk's two-day work-round so the eight-record list can still be read at 390 px |
| `rw-w4-11-hold-diag.mjs` (new) | why the one-day hold still fails (records only) |
| `rw-w4-12-bleed-probe.mjs` (new) | a paint-over seen once in passing (records only) |

## 1. The re-walk — finding by finding

Register §12 is the "must happen now". Every PASS below is what the picture shows; I looked at each one.

| finding | what must happen now (register §12) | what I saw | verdict | pictures (`rewalk/w4/`) |
|---|---|---|---|---|
| **AB6** desktop, admin | Saturday ambers; its list names the overnight leave's tail: "LL — local leave, from the day before till 06:00", and under it "It runs on from the day before — change it there." | Amber `!` on Sat 18 Jul (`FO*`). The list: *"Two of these can't both stand on the same time — an admin needs to change one."*, the FO credit line (*"worked 05:00–18:00 … From the published schedule."*), then the tail line exactly as the register words it, amber edge, no buttons. The OIL block under it unchanged | **PASS** | `w4-sat-AB6-desktop-sat-list` |
| **AB6** phone 390, admin | the same | The same three things, the tail line fully on screen (26–364 px across, nothing sideways) | **PASS** | `w4-sat-AB6-phone-admin-sat-list` |
| **AB6** phone 390, member (Ranger) | the same, in the member's words | *"Two things on this day cover the same time. An admin has to decide between them — nothing has been thrown out."*, the credit, then his own leave's tail in the same words — he can now see what the "two things" are | **PASS** | `w4-sat-AB6-phone-member-sat-list` |
| **AB6** desktop, member (new — the first walk had no desktop member read) | the same | Identical to the phone member's list | **PASS** | `w4-sat-AB6-desktop-member-sat-list` |
| AB6's money (both roles) | unchanged: OIL +1 on Saturday; the leave charges Friday's afternoon only | Sat `FO*`, Fri `LL>`; LVE −0.5, OIL 1, every figure reader agreeing — admin desktop, member desktop and member phone | **PASS** | `w4-sat-AB6-desktop-row` |
| **W4-1** phone, admin: a finger held still on ONE empty day ~300 ms and lifted | the selection sheet stays open for that day | **Still broken.** The day lights while held; on the lift the selection sheet mounts (536 ms) and is gone 22 ms later, when the finger's own trailing tap lands on the day. Nothing is open; 1.5 s later still nothing | **FAIL** | `w4-holdwhy-one-day-hold`, `w4-holdwhy-one-day-hold-1500ms-later` |
| W4-1 — six hold lengths / wobbles (300, 600, 900 ms still; 300 ms wobbling 2, 8, 14 px) | the sheet stays open each time | All six: armed while held (one day lit), nothing open after the lift | **FAIL ×6** | `w4-hold-300-0`, `-600-0`, `-900-0`, `-300-2`, `-300-8`, `-300-14` |
| W4-1 — the member on his own row (Ranger, 12 Mar) | the same for him | Same: the sheet mounts at the lift and is gone 45 ms later | **FAIL** | `w4-holdwhy-member-one-day-hold` |
| W4-1 — the case it matters for: a day that already carries a mark (Saint, Thu 6 Aug: an award + an AM bid, `FO +1`) | a one-day hold opens the selection sheet so the afternoon bid can go in | Nothing opens; a tap on that day opens the LIST (no "place a bid"), so on a phone there is still no one-day door to add the afternoon bid | **FAIL** | `w4-eight-phone-3-one-day-select` |
| W4-1 — the sheet the hold opens fills the day | its LL fills that one day | Not reachable — the sheet is gone before it can be pressed (so the follow-on "tap the filled day" check fails too: nothing was filed) | FAIL (consequence) | `w4-holdwhy-one-day-filled`, `w4-holdwhy-tap-filled-day` |
| W4-1 — a plain tap still opens the one-cell sheet | a quick tap on an empty day opens "Place a bid", never the selection sheet | Tap on Basher 17 Aug → the bid sheet (Just this day / Pick a range / the leave codes / +OIL · PO · PI); no selection sheet at any point | **PASS** | `w4-holdwhy-plain-tap` |
| W4-1 — a drag-select still works | two or more days by finger keep their sheet | Two-day drag (19–20 Aug) → *"Basher 19 Aug 26 – 20 Aug 26 · 2 days"*, stays open. And the first walk's whole touch script, re-run: G1a (three-day select + fill, LVE −3), G1b (move: a clashing landing refused whole, a clean one staged, lands on Confirm, figures unchanged, no moved mark), G1c (a flick scrolls, arms nothing), G1d (a wobble tolerated; an early slide gives up), G1e (the member's own row fills; a drag onto Saber's row stays on his own) — **13 / 13 PASS** | **PASS** | `w4-holdwhy-two-day-drag`, `w4-touch-G1a-select-sheet`, `-G1b-staged`, `-G1b-refused-landing`, `-G1b-landed`, `-G1c-after-flick`, `-G1d-*`, `-G1e-*` |
| W4-1 — the desktop one-day mouse drag (control) | keeps its sheet (a mouse keeps the 0 ms sweep) | *"Saint 2026-08-06 · 1 day"*, open, OL afternoon went in (`FO +2`), 7 Aug untouched | **PASS** | `w4-eight-desktop-3-one-day-select` |
| **The eight-record day** — desktop | unchanged: eight lines in ladder order, the money right, manning −1 once | `<LL !`; eight lines — LL 07:00–08:00, OL 08:30–09:30, ATT C> afternoon, the FO award, CSE, OD, the two replaced-bid notices; LVE −0.5 (the earlier LL pays the morning), OIL +1, MED TOT +0.5; OPS P −1, FL P −1, SC D −0.2 (once); OK, seen → seven, still amber; no console errors — **21 / 21 PASS**, the same figures as the first walk | **PASS** | `w4-eight-desktop-list-top`, `-box-after` |
| The eight-record day — phone, built with a real one-day hold | the same at 390 px | The afternoon bid could not go in (W4-1), so the day holds SEVEN records and one notice: the list has 7 lines (not 8), OK, seen leaves no notice and the box goes grey `+5`. The money is still right (LVE −0.5, OIL +1, MED TOT +0.5, manning −1 once) — **16 PASS / 5 FAIL, all five W4-1's consequence** | FAIL (W4-1) | `w4-eight-phone-list-top`, `-box-after` |
| The eight-record day — phone, the first walk's two-day work-round | unchanged | Eight lines in ladder order, all on one screen with the award block and the ✕ (sheet 136–694 px), nothing sideways; LVE −1 (−0.5 on the day, −0.5 for the 7th's afternoon bid the work-round writes), OIL +1, MED TOT +0.5, manning −1 once; OK, seen → seven, still amber; no console errors — **21 / 21 PASS** | **PASS** | `w4-eight-phone-twoday-list-top`, `-box-after` |

**Tally:** AB6 — 5 / 5 PASS (four reads + the money). W4-1 — the one-day hold **FAILS** at every length, wobble and role
(9 reads); its two controls (plain tap, drag-select at both widths) PASS. The eight-record day's money — PASS at both widths.

## 2. Why W4-1 still fails (proved, not guessed) — `rw-w4-11-hold-diag.mjs`

The 400 ms wait is in the served code, and it does stop the finger's tap from reaching the DAY. What closes the sheet is the
sheet itself:
- On a phone (the pointer is "coarse" — confirmed in the probe: `coarse: true`), an open Leave War sheet installs a tap
  shield on the document (`leavewar/ui/Sheet.tsx`, `useGridPan`): a click aimed at anything under the sheet closes the sheet.
- The drag's click swallow (`leavewar/ui/select.ts`, `swallowNextClick`) is also a document-level capture listener, added
  first, and it calls `stopPropagation()` — which does **not** stop another listener on the same node.
- The probe adds one more document listener the moment the sheet mounts. The finger's tap still reaches it, already marked
  "prevented" by the swallow — and by then the sheet is gone: *"click reached a document listener added AFTER the sheet
  mounted: defaultPrevented=true (the swallow ran) — sheet still in the page: false"*.
- The red-first test (`selecttap.test.ts`) mounts no sheet, and jsdom has no `matchMedia`, so the shield never exists there —
  it checks the tap does not reach the day, which is true; it cannot see the sheet closing.
- For the host (not done here): the swallow runs BEFORE the shield (it is added in `finish()`, before `onSelect` mounts the
  sheet), so `stopImmediatePropagation()` in the swallow — or the shield ignoring a click already `defaultPrevented` — would
  keep the sheet; a test would need a mounted sheet with `(pointer: coarse)` matching.
- Who it hurts: anyone on a phone adding a bid to a day that already carries a mark (the tap then opens the list, which has
  no "place a bid" door) — the only way in is a drag over two or more days, which writes the neighbouring day too.
  Caveat, as the first walk said: this is Chromium's touch emulation; a real phone's long press past ~0.5 s may send no tap,
  but a short hold (0.2–0.45 s — the hold arms at 0.18 s) sends one on both iPhone and Android.

## 3. Anything new seen while walking

1. **The 400 ms wait does not eat a fresh tap** (probe in `rw-w4-08`, recorded not judged). After a two-day drag (which
   leaves no trailing tap), a deliberately fast tap on the sheet's ✕ at ~130 ms after the lift, and again at ~570 ms, closed
   the sheet both times — the "a new press ends the wait" exit works. Nothing to report. (`w4-holdwhy-fast-close-150ms`,
   `-600ms`)
2. **A paint-over seen ONCE, not reproduced — low, recorded for the host.** In the member's G1e picture the "LL" of his
   10–11 Mar bids is drawn ON TOP of the frozen balance column (between "IP" and "−5", and after it), where the first walk's
   picture of the same step shows nothing (`rewalk/w4/w4-touch-G1e-member-two-rows` against
   `w4/w4-touch-G1e-member-two-rows`). A dedicated probe (`rw-w4-12-bleed-probe.mjs`) repeated the step — the fill, the same
   scroll, the two-row drag onto Saber's row and its LL, pictures at once, 1 s later and after closing, then a sideways
   scroll and a reload — and every time the frozen column covered those days (`w4-bleed-1` … `w4-bleed-6`; 4 / 4 PASS). A
   one-frame repaint moment, most likely; not a finding unless someone meets it again.
3. **Still there, already filed — not re-reported:** raw machine dates on the war's sheets (`[LW-ISO-DATES]`, the first
   walk's W4-2): the bid sheet (*"Basher 2026-08-17"*, *"Ranger 2026-07-17"*), the one-day selection sheet (*"Saint 2026-08-06
   · 1 day"*), the move refusal (*"That lands on 2026-08-12 which is already booked"*). And a phone figure sheet carrying the
   grid back to January (`[AMEND-SMALL-SEEN]` item 6) — the scripts still step round it.

## 4. Console errors
None in any run, either width, either role (every `errors` line is `[]`; the eight-record day's own check PASS at both widths).

## 5. Not re-walked
- W4-2 (the raw dates) — filed, not fixed; seen unchanged (§3).
- The first walk's money, postings and undo scripts (`w4-01`, `w4-02`, `w4-09`) — not in this re-walk's list; the eight-record
  day and AB6's money are the money the brief named.
