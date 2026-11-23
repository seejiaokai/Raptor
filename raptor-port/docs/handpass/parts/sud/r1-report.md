# r1 — the re-walk of three fixes (W8-1, W8-2, W10-1) on the build of commit `bde8ef0a0` — 23 Nov 26, chat 152

Re-walker r1. Brief: `docs/superpowers/briefs/2026-11-23-sans-ahead-full-walk-brief.md` (its rules followed: no build, no
test runner, no git, the host holds the lock). Build: `raptor-port/dist` as handed over (built 19:11 today; the host names
it commit `bde8ef0a0`), never rebuilt, served by `npx vite preview` on port 4401, stopped by its port at the end. Clock
installed before the app loaded: Wed 15 Jul 26 09:00, left running (the app's own today read first in every run: "Wed Jul
15 2026 09:00"). Every scenario started in a fresh browser context (a fresh store), Saber signed in, its world made through
the app's own controls (Leave War cell → ⋯ → Post out → SANS → Post out; "+ Commitment" on the SANS calendar).

Sizes: desktop Chromium 1536×864; phone WebKit 402×874, `isMobile`, `hasTouch`, scale 3, real taps (a picture ~40–60 ms
after each tap under `taps/`). **W8-1's finger drags were walked in Chromium at the phone's size with real touch** (a CDP
finger held 0.6 s, then dragged), exactly as w8 did, because WebKit gives the page no finger drag (`docs/walk-scripts.md`
§4) — every such row says "phone-chromium". The WebKit phone walked W8-1's plain-user round.

Recipes re-used, not guessed: `sah-w8-lib.mjs` (sign-in as, the SANS month, the day window, "+ Commitment", the input
window, the bell), `sah-w10-lib.mjs` (the shared filing, the posting's date moved on its sheet, the SANS day read),
`asp-w2-lib.mjs` (Post out). Scripts (each prints its version line): `scripts/handpass/sah-r1.mjs` (`sah-r1 v1`),
`sah-r1-env.mjs`, `sah-r1-keep.mjs` (copies the deciding pictures). Command:
`R1_RUN=run1 ONLY=w81-d,w81-c,w81-p,w82-d,w82-p,w101-d,w101-p node scripts/handpass/sah-r1.mjs` (run in three calls).
`window.*` was only READ (INPUTS, PEOPLE — to confirm what was saved), and `window.go`, the recipes' page switch.

Bulk pictures, logs and results: `D:\raptor-work\c152-walk\r1\run1\`. The deciding pictures (23) are in
`docs/img/handpass/2026-11-23-sans-ahead/r1/`, named `run1__<picture>` (`taps/` written `taps-`).

## Counts

105 rows over the three fixes and both sizes: **89 PASS · 0 FAIL · 4 RECORDED · 2 NOT WALKED · 10 NOTE** (the app's today
and who is signed in — reads with no verdict). 125 pictures named in the table (besides every phone tap's own picture
under `taps/`); 23 kept in the repo. Console errors, page errors, failed requests and 4xx: **none**, in all seven runs
(each run's "errors" row).

## The three fixes — what the re-walk saw

**W8-1 (Astra's S4) — FIXED.** Ranger (`us`/`us`), posted out as SANS by Saber from Fri 17 Jul, on Wed 15, on the SANS
calendar:
- desktop mouse drag 16→18 and 18→16; the keys from 16 (Shift+→ ×2, Enter) and from 18 (Shift+← ×2, Enter); phone
  (Chromium at the phone's size, real touch) finger held then dragged 16→18 and 18→16 — six routes, every one:
  16, 17 and 18 light as picked while held; on the release **no window opens, nothing is saved** (his SANS availability
  read before and after: none) and an amber passing note reads exactly
  `Ranger is SANS from Fri 17 Jul: file SANS availability for days from then` (amber words and edge `rgb(229, 168, 59)`
  on the dark note `rgb(26, 31, 38)`).
- **Pictured within ~100 ms of the release:** desktop at +46 to +76 ms, phone at +106 / +120 ms. The note is already
  there at full strength in the first gesture's picture (+46 ms desktop, +106 ms phone); on the later gestures the note
  had faded since the previous one and fades back in — at +60–76 ms it is faint (its strength 0), fully shown by
  +168–222 ms. Settled pictures (~1 s) show it whole, with the days no longer picked
  (`run1__taps-w81-w81-01-released-desktop.png`, `run1__taps-w81-w81-02-released-desktop.png`,
  `run1__w81-w81-01-settled-desktop.png`, `run1__w81-w81-03-settled-desktop.png`,
  `run1__taps-w81-w81-01-released-phone-chromium.png`, `run1__w81-w81-02-settled-phone-chromium.png`; held:
  `run1__taps-w81-w81-01-held-desktop.png`).
- **Unchanged, both sizes:** his drag 17→20 opens the window with him in it (Person "Ranger", fixed; dates 17–20), Fly,
  All day → Add: "Input added", one filing 17–20 (`run1__w81-w81-05-form-desktop.png`,
  `run1__w81-w81-05-form-phone-chromium.png`).

**W8-2 (S19) — FIXED.** Saber, Wed 15, Ranger posted SANS from Fri 17 and Hex from Mon 20: the Highlight list reads
`No highlight, Bolt, Hex, Jester, Kraken, Marlin, Otter, Pixel, Ranger, Rebel, Scribe, Tally, Zenith, Zulu` — Ranger and
Hex offered before their dates, in their A-to-Z places; every man SANS today still listed; nobody twice (14 entries, 14
different people), both sizes. After Saber filed through "+ Commitment" Ranger on Sat 18 (Fly) and Mon 20 (Fly + OFT) and
Hex on Tue 21 (Fly): Highlight → Ranger rings exactly 18 and 20 (the letters he offered underlined); Highlight → Hex rings
exactly 21; Zulu (SANS today) still picks (his 14 Jul rings); No highlight clears the rings; the list again after the
filings still holds nobody twice (`run1__w82-w82-01-list-desktop.png`, `run1__w82-w82-03-rings-desktop.png`,
`run1__w82-w82-04-rings-desktop.png`, `run1__w82-w82-01-list-phone.png`, `run1__w82-w82-03-rings-phone.png`).

**W10-1 (S12x) — FIXED.** Saber filed one offer for Ranger and Hex on Fri 17 (both posted SANS from 17): before the
move both lines read `Saber for 2 people · 15 Jul, 09:00`. Ranger's posting moved to Sat 18 on his posting sheet's date
box ("On 17 Jul: becomes SANS." → "On 18 Jul: becomes SANS."):
- Fri 17 opened: **Ranger not listed**; Hex's line alone, its small print **`Saber for Hex · 15 Jul, 09:00`** (RECORDED —
  the whole line: Hex's puck, `F · O · A`, `LATE`, `All day`, `Saber for Hex · 15 Jul, 09:00`); no "2 people" anywhere on
  it; the month's 17 counts the WSO side only (F/O/A each 0 pilots, 1 WSO) — both sizes
  (`run1__w101-w101-06-clip-desktop.png`, `run1__w101-w101-06-clip-phone.png`).
- A tap on Hex's line opens the shared input's own window (RECORDED): title `Hex +1 · 17 Jul`, "2 picked", Several
  people on, **Ranger lit under PILOTS and Hex under WSOS**, the SANS group's other men unlit; type SANS Availability; Fly,
  AMT, OFT ticked; All day; Delete, Cancel, Save — the whole record's window, naming both (the host's accepted reading)
  (`run1__w101-w101-07-desktop.png`, `run1__w101-w101-07-phone.png`).
- Ranger's posting moved back to Fri 17: both listed again, each line `Saber for 2 people · 15 Jul, 09:00`; the month's 17
  counts 1 pilot and 1 WSO for F, O and A (`run1__w101-w101-09-desktop.png`, `run1__w101-w101-09-phone.png`).

**The plain-user round, each fix, both sizes** (Ranger after W8-1, Saber after W8-2 and W10-1): the SANS tab opens on July;
Sat 18 opens on screen and on top, closes by its ✕; reopened, closes by Escape; the bell opens and closes by Escape and by
the bell again — all PASS, 7 runs (`run1__w81-pu-02-phone.png`, `run1__w82-pu-bell-escape-bell-phone.png`).

## FAILs

None.

## Leads (not findings — to check, outside the three fixes)

- In every run the bell held **no lines** (Ranger and Saber alike). In W8-1's world Ranger is posted SANS from 17 with
  nothing filed, and the demo has him on two flights on Mon 20 — yet no "You're SANS from Fri 17 Jul…" line. Likely the
  world's own making: in these worlds nobody ever opened the week of 20 Jul (w8's world A added BRIEFs there, and its bell
  line came), so the reminder may have no planned day in a saved week to name — and on the desktop and Chromium phone runs
  he had filed 17–20 before the round. Not read against the rulings and not reproduced; the bell's words are not one of
  the three fixes.
- The input window's title for the shared filing, opened from Hex's line while Ranger's share is hidden, still reads
  `Hex +1 · 17 Jul` and lights Ranger — as the host's accepted reading says; recorded, not judged.

## Errors seen

None — no console error, page error, failed request or 4xx in any run.

## The lessons of §7.11 — the step that covers each, or why it cannot apply

1. State × reading: W10-1 reads Fri 17 in three states (both SANS; Ranger moved to 18; moved back) — the day list, the
   small print and the month's figures each time; W8-2 the Highlight list before and after filings.
2. Drags at a person's speed: the w8 recipe's pace (about a quarter second over three days, a 0.6 s finger hold) — no
   quick flick; partly covered, as w8.
3. What tells him it happened: the passing note read at the release and settled for every W8-1 route; "Input added" on
   the 17→20 filing and every W8-2 filing.
4. A window that leaves the page working: not re-walked (w8's PU-05).
5. A box moved into sight: the SANS day window checked on screen and on top (PU-02).
6. Handed to the phone itself: nothing here — does not apply.
7. Steered frame by frame: none — does not apply.
8. A screen with a drawing: no drawn part changed by these fixes — does not apply.
9. Lists measured: the Highlight list read whole at both sizes (count and order), not measured box by box — partly.
10. A page hidden and shown again: not in these fixes — does not apply.
11. Depends on what fits: none — does not apply.
12. Every page a window opens from: the shared input's window opened from the SANS day's line (W10-1); the SANS day from
    the month (PU).
13. Pinch: none — does not apply.
14. Keyboard boxes found in the code: W8-1's keys are the w8 recipe's, taken from the calendar's own key handler;
    desktop only (no Shift + arrows on a phone).
15. Bars over a scrolling area: none — does not apply.
16. After a refusal: each W8-1 refusal followed by the next route and finally the 17→20 run, which saved.
17. Show / hide both ways: the day window (✕, Escape), the bell (Escape, the bell again), Highlight on and off (No
    highlight).
18. Print: none — does not apply.
19. A window over a window: the shared input's window over the SANS day, closed by its ✕, then the day by its ✕.
20. A gesture the ways a hand makes it: one pace only (lesson 2).
21. A test browser's touch is not his phone's: the finger drags ran in Chromium at the phone's size — his iPhone's own
    hold and drag is a look for his card.
22. Checked by what is drawn: every verdict's picture opened by eye for the note, the rings and the small print.
23. What a tap opens: the shared line's tap opens the input's own window, as w10's and the host's reading.
23b. Side-by-side boxes: not measured — no layout changed.
24. Placed against the top bar: none — does not apply.
25. Made in every place it can be put: the filings made through "+ Commitment" and a drag; read on the month, the opened
    day and Highlight — the crew lists not re-walked (not touched by these fixes).
26. What was under the fingers: the picked days under the drag read while held.
27. Neighbouring controls: none changed — does not apply.
28. What a press opens proved on screen first: each window read where it opened, before anything in it was pressed.
29. Anything that reads today: not re-walked across midnight (S20 is w8's, not one of these fixes).
30. Every phone tap pictured within ~100 ms: the WebKit taps under `taps/` (~40–60 ms after each); W8-1's releases at
    +106 / +120 ms on the Chromium phone.
31. A page fitted to the screen: none changed — does not apply.

## What could NOT be walked, and why

- **W8-1's drags in WebKit** — WebKit gives the page no finger drag; walked in Chromium at the phone's size with real
  touch (rows marked phone-chromium). His iPhone's own hold and drag stays a look for his card.
- **W8-1's keys on the phone** — a phone has no Shift + arrows; walked on the desktop.

## The table

| scenario | size | step | what was done / expected | what the screen said | verdict | pictures |
|---|---|---|---|---|---|---|
| w81 | desktop | today | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | NOTE |  |
| w81 | desktop | w81-00 | Saber: Leave War, Ranger's 17 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w81-w81-00-postout-open-desktop.png, w81-w81-00-postout-sheet-desktop.png |
| w81 | desktop | w81-who | signed in as | Ranger · Member | NOTE |  |
| w81 | desktop | w81-01 | Ranger: a mouse drag 16→18 → no window, nothing saved, the amber passing note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | days lit while held ["16","17","18"] · at release+46 ms the note read "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 1) · shown by +46 ms: "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 1; colours rgb(26, 31, 38) / rgb(229, 168, 59) / border rgb(229, 168, 59); class "") · settled: window none, note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · his SANS availability before [] after [] · note gone before the gesture after 0 ms | PASS | taps/w81-w81-01-released-desktop.png, w81-w81-01-settled-desktop.png |
| w81 | desktop | w81-02 | Ranger: a mouse drag 18→16 → no window, nothing saved, the amber passing note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | days lit while held ["16","17","18"] · at release+60 ms the note read "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 0) · shown by +168 ms: "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 0.932512; colours rgb(26, 31, 38) / rgb(229, 168, 59) / border rgb(229, 168, 59); class "") · settled: window none, note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · his SANS availability before [] after [] · note gone before the gesture after 4600 ms | PASS | taps/w81-w81-02-released-desktop.png, w81-w81-02-settled-desktop.png |
| w81 | desktop | w81-03 | Ranger: the keys from 16: Shift+→ ×2, Enter → no window, nothing saved, the amber passing note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | days lit while held ["16","17","18"] · at release+72 ms the note read "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 0) · shown by +186 ms: "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 0.983541; colours rgb(26, 31, 38) / rgb(229, 168, 59) / border rgb(229, 168, 59); class "") · settled: window none, note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · his SANS availability before [] after [] · note gone before the gesture after 4600 ms | PASS | taps/w81-w81-03-released-desktop.png, w81-w81-03-settled-desktop.png |
| w81 | desktop | w81-04 | Ranger: the keys from 18: Shift+← ×2, Enter → no window, nothing saved, the amber passing note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | days lit while held ["16","17","18"] · at release+76 ms the note read "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 0) · shown by +187 ms: "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 0.963156; colours rgb(26, 31, 38) / rgb(229, 168, 59) / border rgb(229, 168, 59); class "") · settled: window none, note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · his SANS availability before [] after [] · note gone before the gesture after 4600 ms | PASS | taps/w81-w81-04-released-desktop.png, w81-w81-04-settled-desktop.png |
| w81 | desktop | w81-05 | Ranger: a mouse drag 17→20 → the window opens with him in it; Fly, All day → Add: one filing 17–20 | days lit ["17","18","19","20"] · window {"person":"fixed Ranger","dates":["07-17","07-18","07-19","07-20"],"ticks":"Fly✓ AMT OFT"} · said "Input added" · made [{"iid":"imrldjghal909yn","who":"bane","type":"SANS Availability","date":"Jul 17","end":"Jul 20","yr":2026,"sans":{"f":true},"allday":true}] · his SANS availability before [] after ["Jul 17–Jul 20"] | PASS | w81-w81-05-settled-desktop.png, w81-w81-05-form-desktop.png |
| w81 | desktop | PU-01 | Ranger: the SANS tab opens on its month | page inputs · month "July 2026" | PASS | w81-pu-01-desktop.png |
| w81 | desktop | PU-02 | Ranger: Sat 18 opened (on screen, on top), closed by its ✕ | opened {"ttl":"Sat 18 JulNo flying set","box":[1090,96,430,358]} · closed | PASS | w81-pu-02-desktop.png |
| w81 | desktop | PU-03 | Ranger: Sat 18 reopened, closed by Escape | closed | PASS | w81-pu-03-desktop.png |
| w81 | desktop | PU-bell-escape | Ranger: the bell opened (its lines read), closed by Escape | closed · lit false · 0 lines · SANS: none | PASS | w81-pu-bell-escape-bell-desktop.png |
| w81 | desktop | PU-bell-bell | Ranger: the bell opened (its lines read), closed by the bell again | closed · lit false · 0 lines · SANS: none | PASS | w81-pu-bell-bell-bell-desktop.png |
| w81 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| w81 | phone-chromium | today | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | NOTE |  |
| w81 | phone-chromium | w81-00 | Saber: Leave War, Ranger's 17 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w81-w81-00-postout-open-phone-chromium.png, w81-w81-00-postout-sheet-phone-chromium.png |
| w81 | phone-chromium | w81-who | signed in as | Ranger · Member | NOTE |  |
| w81 | phone-chromium | w81-keys | the keys (Shift+arrows, Enter) on the phone | a phone has no Shift + arrows — walked on the desktop | NOT WALKED |  |
| w81 | phone-chromium | w81-01 | Ranger: a finger held, then dragged (Chromium at the phone's size, real touch) 16→18 → no window, nothing saved, the amber passing note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | days lit while held ["16","17","18"] · at release+106 ms the note read "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 1) · shown by +106 ms: "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 1; colours rgb(26, 31, 38) / rgb(229, 168, 59) / border rgb(229, 168, 59); class "") · settled: window none, note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · his SANS availability before [] after [] · note gone before the gesture after 0 ms | PASS | taps/w81-w81-01-released-phone-chromium.png, w81-w81-01-settled-phone-chromium.png |
| w81 | phone-chromium | w81-02 | Ranger: a finger held, then dragged (Chromium at the phone's size, real touch) 18→16 → no window, nothing saved, the amber passing note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | days lit while held ["16","17","18"] · at release+120 ms the note read "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 0) · shown by +222 ms: "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (opacity 0.98349; colours rgb(26, 31, 38) / rgb(229, 168, 59) / border rgb(229, 168, 59); class "") · settled: window none, note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · his SANS availability before [] after [] · note gone before the gesture after 4600 ms | PASS | taps/w81-w81-02-released-phone-chromium.png, w81-w81-02-settled-phone-chromium.png |
| w81 | phone-chromium | w81-05 | Ranger: a finger held, then dragged (Chromium, phone size) 17→20 → the window opens with him in it; Fly, All day → Add: one filing 17–20 | days lit ["17","18","19","20"] · window {"person":"fixed Ranger","dates":["07-17","07-18","07-19","07-20"],"ticks":"Fly✓ AMT OFT"} · said "Input added" · made [{"iid":"imrldj8igvsuwj2","who":"bane","type":"SANS Availability","date":"Jul 17","end":"Jul 20","yr":2026,"sans":{"f":true},"allday":true}] · his SANS availability before [] after ["Jul 17–Jul 20"] | PASS | w81-w81-05-settled-phone-chromium.png, w81-w81-05-form-phone-chromium.png |
| w81 | phone-chromium | PU-01 | Ranger: the SANS tab opens on its month | page inputs · month "Jul 2026" | PASS | w81-pu-01-phone-chromium.png |
| w81 | phone-chromium | PU-02 | Ranger: Sat 18 opened (on screen, on top), closed by its ✕ | opened {"ttl":"Sat 18 JulNo flying set","box":[0,8,402,854]} · closed | PASS | w81-pu-02-phone-chromium.png |
| w81 | phone-chromium | PU-03 | Ranger: Sat 18 reopened, closed by Escape | closed | PASS | w81-pu-03-phone-chromium.png |
| w81 | phone-chromium | PU-bell-escape | Ranger: the bell opened (its lines read), closed by Escape | closed · lit false · 0 lines · SANS: none | PASS | w81-pu-bell-escape-bell-phone-chromium.png |
| w81 | phone-chromium | PU-bell-bell | Ranger: the bell opened (its lines read), closed by the bell again | closed · lit false · 0 lines · SANS: none | PASS | w81-pu-bell-bell-bell-phone-chromium.png |
| w81 | phone-chromium | errors | console / page errors / failed requests |  | PASS |  |
| w81 | phone | today | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | NOTE |  |
| w81 | phone | w81-00 | Saber: Leave War, Ranger's 17 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w81-w81-00-postout-open-phone.png, w81-w81-00-postout-sheet-phone.png |
| w81 | phone | w81-who | signed in as | Ranger · Member | NOTE |  |
| w81 | phone | w81-webkit | WebKit phone: the drags are walked in Chromium at the phone's size (w81 at size c); here the plain-user round only |  | NOT WALKED |  |
| w81 | phone | PU-01 | Ranger: the SANS tab opens on its month | page inputs · month "Jul 2026" | PASS | w81-pu-01-phone.png |
| w81 | phone | PU-02 | Ranger: Sat 18 opened (on screen, on top), closed by its ✕ | opened {"ttl":"Sat 18 JulNo flying set","box":[0,8,402,854]} · closed | PASS | w81-pu-02-phone.png |
| w81 | phone | PU-03 | Ranger: Sat 18 reopened, closed by Escape | closed | PASS | w81-pu-03-phone.png |
| w81 | phone | PU-bell-escape | Ranger: the bell opened (its lines read), closed by Escape | closed · lit false · 0 lines · SANS: none | PASS | w81-pu-bell-escape-bell-phone.png |
| w81 | phone | PU-bell-bell | Ranger: the bell opened (its lines read), closed by the bell again | closed · lit false · 0 lines · SANS: none | PASS | w81-pu-bell-bell-bell-phone.png |
| w81 | phone | errors | console / page errors / failed requests |  | PASS |  |
| w82 | desktop | today | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | NOTE |  |
| w82 | desktop | w82-00a | Saber: Leave War, Ranger's 17 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w82-w82-00a-postout-open-desktop.png, w82-w82-00a-postout-sheet-desktop.png |
| w82 | desktop | w82-00b | Saber: Leave War, Hex's 20 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 20 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w82-w82-00b-postout-open-desktop.png, w82-w82-00b-postout-sheet-desktop.png |
| w82 | desktop | w82-01 | Saber, Wed 15: the Highlight list offers Ranger (SANS from Fri 17) and Hex (SANS from Mon 20); the men SANS today still listed; none twice | list "Nohighlight,BoltC,HexC,JesterB,KrakenD,MarlinA,OtterD,PixelD,RangerIP,RebelB,ScribeD,TallyO,ZenithC,ZuluO" · ids ["none","yeti","rocky","ipman","krait","cards","wrangler","badger","bane","romeo","waldo","nick","vinci","bullet"] · twice [] · SANS-today men missing [] | PASS | w82-w82-01-list-desktop.png |
| w82 | desktop | w82-02-18 | Saber: 18 Jul → "+ Commitment" → Person Ranger, f, All day → Add: saved | picked bane · said "Input added" · made [{"iid":"imrldij1hodvyxo","who":"bane","type":"SANS Availability","date":"Jul 18","end":null,"yr":2026,"sans":{"f":true},"allday":true}] | PASS | w82-w82-02-18-form-desktop.png, w82-w82-02-18-saved-desktop.png |
| w82 | desktop | w82-02-20 | Saber: 20 Jul → "+ Commitment" → Person Ranger, f+o, All day → Add: saved | picked bane · said "Input added" · made [{"iid":"imrldiluevx03vn","who":"bane","type":"SANS Availability","date":"Jul 20","end":null,"yr":2026,"sans":{"f":true,"o":true},"allday":true}] | PASS | w82-w82-02-20-form-desktop.png, w82-w82-02-20-saved-desktop.png |
| w82 | desktop | w82-02-21 | Saber: 21 Jul → "+ Commitment" → Person Hex, f, All day → Add: saved | picked rocky · said "Input added" · made [{"iid":"imrldioge83es78","who":"rocky","type":"SANS Availability","date":"Jul 21","end":null,"yr":2026,"sans":{"f":true},"allday":true}] | PASS | w82-w82-02-21-form-desktop.png, w82-w82-02-21-saved-desktop.png |
| w82 | desktop | w82-03 | Highlight → Ranger: every day he has committed to rings (18, 20) and no other | offered true · ringed ["2026-07-18","2026-07-20"] · list "Nohighlight,BoltC,HexC,JesterB,KrakenD,MarlinA,OtterD,PixelD,RangerIP,RebelB,ScribeD,TallyO,ZenithC,ZuluO" | PASS | w82-w82-03-list-desktop.png, w82-w82-03-rings-desktop.png |
| w82 | desktop | w82-04 | Highlight → Hex (SANS from Mon 20): his one day (21) rings | offered true · ringed ["2026-07-21"] | PASS | w82-w82-04-list-desktop.png, w82-w82-04-rings-desktop.png |
| w82 | desktop | w82-05 | the list again after the filings: none twice; a man SANS today (Zulu) still picks | ids ["none","yeti","rocky","ipman","krait","cards","wrangler","badger","bane","romeo","waldo","nick","vinci","bullet"] · twice [] · Zulu (bullet) offered true, ringed ["2026-07-14"] | PASS | w82-w82-05-list-desktop.png, w82-w82-05-rings-desktop.png |
| w82 | desktop | w82-06 | No highlight: the rings go | ringed [] | PASS | w82-w82-06-list-desktop.png, w82-w82-06-rings-desktop.png |
| w82 | desktop | PU-01 | Saber: the SANS tab opens on its month | page inputs · month "July 2026" | PASS | w82-pu-01-desktop.png |
| w82 | desktop | PU-02 | Saber: Sat 18 opened (on screen, on top), closed by its ✕ | opened {"ttl":"Sat 18 JulNo flying set","box":[1090,96,430,358]} · closed | PASS | w82-pu-02-desktop.png |
| w82 | desktop | PU-03 | Saber: Sat 18 reopened, closed by Escape | closed | PASS | w82-pu-03-desktop.png |
| w82 | desktop | PU-bell-escape | Saber: the bell opened (its lines read), closed by Escape | closed · lit false · 0 lines · SANS: none | PASS | w82-pu-bell-escape-bell-desktop.png |
| w82 | desktop | PU-bell-bell | Saber: the bell opened (its lines read), closed by the bell again | closed · lit false · 0 lines · SANS: none | PASS | w82-pu-bell-bell-bell-desktop.png |
| w82 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| w82 | phone | today | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | NOTE |  |
| w82 | phone | w82-00a | Saber: Leave War, Ranger's 17 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w82-w82-00a-postout-open-phone.png, w82-w82-00a-postout-sheet-phone.png |
| w82 | phone | w82-00b | Saber: Leave War, Hex's 20 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 20 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w82-w82-00b-postout-open-phone.png, w82-w82-00b-postout-sheet-phone.png |
| w82 | phone | w82-01 | Saber, Wed 15: the Highlight list offers Ranger (SANS from Fri 17) and Hex (SANS from Mon 20); the men SANS today still listed; none twice | list "Nohighlight,BoltC,HexC,JesterB,KrakenD,MarlinA,OtterD,PixelD,RangerIP,RebelB,ScribeD,TallyO,ZenithC,ZuluO" · ids ["none","yeti","rocky","ipman","krait","cards","wrangler","badger","bane","romeo","waldo","nick","vinci","bullet"] · twice [] · SANS-today men missing [] | PASS | w82-w82-01-list-phone.png |
| w82 | phone | w82-02-18 | Saber: 18 Jul → "+ Commitment" → Person Ranger, f, All day → Add: saved | picked bane · said "Input added" · made [{"iid":"imrldjatf9trtem","who":"bane","type":"SANS Availability","date":"Jul 18","end":null,"yr":2026,"sans":{"f":true},"allday":true}] | PASS | w82-w82-02-18-form-phone.png, w82-w82-02-18-saved-phone.png |
| w82 | phone | w82-02-20 | Saber: 20 Jul → "+ Commitment" → Person Ranger, f+o, All day → Add: saved | picked bane · said "Input added" · made [{"iid":"imrldjgixilvhry","who":"bane","type":"SANS Availability","date":"Jul 20","end":null,"yr":2026,"sans":{"f":true,"o":true},"allday":true}] | PASS | w82-w82-02-20-form-phone.png, w82-w82-02-20-saved-phone.png |
| w82 | phone | w82-02-21 | Saber: 21 Jul → "+ Commitment" → Person Hex, f, All day → Add: saved | picked rocky · said "Input added" · made [{"iid":"imrldjlx0acgmpx","who":"rocky","type":"SANS Availability","date":"Jul 21","end":null,"yr":2026,"sans":{"f":true},"allday":true}] | PASS | w82-w82-02-21-form-phone.png, w82-w82-02-21-saved-phone.png |
| w82 | phone | w82-03 | Highlight → Ranger: every day he has committed to rings (18, 20) and no other | offered true · ringed ["2026-07-18","2026-07-20"] · list "Nohighlight,BoltC,HexC,JesterB,KrakenD,MarlinA,OtterD,PixelD,RangerIP,RebelB,ScribeD,TallyO,ZenithC,ZuluO" | PASS | w82-w82-03-list-phone.png, w82-w82-03-rings-phone.png |
| w82 | phone | w82-04 | Highlight → Hex (SANS from Mon 20): his one day (21) rings | offered true · ringed ["2026-07-21"] | PASS | w82-w82-04-list-phone.png, w82-w82-04-rings-phone.png |
| w82 | phone | w82-05 | the list again after the filings: none twice; a man SANS today (Zulu) still picks | ids ["none","yeti","rocky","ipman","krait","cards","wrangler","badger","bane","romeo","waldo","nick","vinci","bullet"] · twice [] · Zulu (bullet) offered true, ringed ["2026-07-14"] | PASS | w82-w82-05-list-phone.png, w82-w82-05-rings-phone.png |
| w82 | phone | w82-06 | No highlight: the rings go | ringed [] | PASS | w82-w82-06-list-phone.png, w82-w82-06-rings-phone.png |
| w82 | phone | PU-01 | Saber: the SANS tab opens on its month | page inputs · month "Jul 2026" | PASS | w82-pu-01-phone.png |
| w82 | phone | PU-02 | Saber: Sat 18 opened (on screen, on top), closed by its ✕ | opened {"ttl":"Sat 18 JulNo flying set","box":[0,8,402,854]} · closed | PASS | w82-pu-02-phone.png |
| w82 | phone | PU-03 | Saber: Sat 18 reopened, closed by Escape | closed | PASS | w82-pu-03-phone.png |
| w82 | phone | PU-bell-escape | Saber: the bell opened (its lines read), closed by Escape | closed · lit false · 0 lines · SANS: none | PASS | w82-pu-bell-escape-bell-phone.png |
| w82 | phone | PU-bell-bell | Saber: the bell opened (its lines read), closed by the bell again | closed · lit false · 0 lines · SANS: none | PASS | w82-pu-bell-bell-bell-phone.png |
| w82 | phone | errors | console / page errors / failed requests |  | PASS |  |
| w101 | desktop | today | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | NOTE |  |
| w101 | desktop | w101-01 | Saber: Leave War, Ranger's 17 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w101-w101-01-postout-open-desktop.png, w101-w101-01-postout-sheet-desktop.png |
| w101 | desktop | w101-02 | Saber: Leave War, Hex's 17 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w101-w101-02-postout-open-desktop.png, w101-w101-02-postout-sheet-desktop.png |
| w101 | desktop | w101-03 | Saber: one shared offer for Ranger + Hex on Fri 17 (read back) | {"iid":"imrldiimm9q1f40","people":"[{\"p\":\"bane\",\"by\":\"stiff\",\"at\":1784077221838},{\"p\":\"rocky\",\"","date":"Jul 17","endDate":null,"sans":{"f":true,"o":true,"a":true},"allday":true,"e":1439,"remarks":"","by":"stiff"}  | PASS | w101-w101-03-form-desktop.png, w101-w101-03-saved-desktop.png |
| w101 | desktop | w101-04 | before the move: Fri 17 lists both; the shared line's small print (RECORD) | Hex[F · O · A All day Saber for 2 people · 15 Jul, 09:00] Ranger[F · O · A All day Saber for 2 people · 15 Jul, 09:00] · lines [{"who":"Hex","placed":"Saber for 2 people · 15 Jul, 09:00","line":"HexCF · O · ALATEAll daySaber for 2 people · 15 Jul, 09:00"},{"who":"Ranger","placed":"Saber for 2 people · 15 Jul, 09:00","line":"RangerIPF · O · ALATEAll daySaber for 2 people · 15 Jul, 09:00"}] | PASS | w101-w101-04-desktop.png |
| w101 | desktop | w101-05 | Saber: Ranger's posting moved to Sat 18 on his sheet's date box (Hex's stays 17) | "On 17 Jul: becomes SANS." → "On 18 Jul: becomes SANS."  · record {"san":false,"sanFrom":null,"archived":false} | PASS | w101-w101-05-sheet-desktop.png, w101-w101-05-moved-desktop.png |
| w101 | desktop | w101-06 | Fri 17 opened after the move: Ranger not listed; Hex's line no longer says "for 2 people" (RECORD its exact words) | Hex[F · O · A All day Saber for Hex · 15 Jul, 09:00] · Hex's line "HexCF · O · ALATEAll daySaber for Hex · 15 Jul, 09:00" · its small print "Saber for Hex · 15 Jul, 09:00" · month cell need – · F F01 · O O01 · A A01 | PASS | w101-w101-06-clip-desktop.png, w101-w101-06-desktop.png |
| w101 | desktop | w101-06r | RECORD: the exact words of Hex's line on Fri 17 while Ranger's share is hidden | "HexCF · O · ALATEAll daySaber for Hex · 15 Jul, 09:00" — small print "Saber for Hex · 15 Jul, 09:00" | RECORDED |  |
| w101 | desktop | w101-07 | a tap on Hex's line opens the shared input's own window — RECORD what it shows (the whole record's window; naming both is the host's accepted reading) | {"title":"Hex +1 · 17 Jul","picked":["Ranger","Hex","Bolt","Jester","Kraken","Marlin","Otter","Pixel","Rebel","Scribe","Tally","Zenith","Zulu"],"count":"2 picked","dates":["2026-07-17"],"ro":"","save":true,"del":true} | RECORDED | w101-w101-07-desktop.png |
| w101 | desktop | w101-08 | Saber: Ranger's posting moved back to Fri 17 | "On 18 Jul: becomes SANS." → "On 17 Jul: becomes SANS."  · record {"san":false,"sanFrom":null,"archived":false} | PASS | w101-w101-08-sheet-desktop.png, w101-w101-08-moved-desktop.png |
| w101 | desktop | w101-09 | Fri 17 after the move back: both listed again; the shared line says "for 2 people" again | Hex[F · O · A All day Saber for 2 people · 15 Jul, 09:00] Ranger[F · O · A All day Saber for 2 people · 15 Jul, 09:00] · lines [{"who":"Hex","placed":"Saber for 2 people · 15 Jul, 09:00","line":"HexCF · O · ALATEAll daySaber for 2 people · 15 Jul, 09:00"},{"who":"Ranger","placed":"Saber for 2 people · 15 Jul, 09:00","line":"RangerIPF · O · ALATEAll daySaber for 2 people · 15 Jul, 09:00"}] · month cell need – · F F11 · O O11 · A A11 | PASS | w101-w101-09-desktop.png |
| w101 | desktop | PU-01 | Saber: the SANS tab opens on its month | page inputs · month "July 2026" | PASS | w101-pu-01-desktop.png |
| w101 | desktop | PU-02 | Saber: Sat 18 opened (on screen, on top), closed by its ✕ | opened {"ttl":"Sat 18 JulNo flying set","box":[1090,96,430,325]} · closed | PASS | w101-pu-02-desktop.png |
| w101 | desktop | PU-03 | Saber: Sat 18 reopened, closed by Escape | closed | PASS | w101-pu-03-desktop.png |
| w101 | desktop | PU-bell-escape | Saber: the bell opened (its lines read), closed by Escape | closed · lit false · 0 lines · SANS: none | PASS | w101-pu-bell-escape-bell-desktop.png |
| w101 | desktop | PU-bell-bell | Saber: the bell opened (its lines read), closed by the bell again | closed · lit false · 0 lines · SANS: none | PASS | w101-pu-bell-bell-bell-desktop.png |
| w101 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| w101 | phone | today | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | NOTE |  |
| w101 | phone | w101-01 | Saber: Leave War, Ranger's 17 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w101-w101-01-postout-open-phone.png, w101-w101-01-postout-sheet-phone.png |
| w101 | phone | w101-02 | Saber: Leave War, Hex's 17 Jul cell → ⋯ → Post out → SANS → Post out (read back) | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | w101-w101-02-postout-open-phone.png, w101-w101-02-postout-sheet-phone.png |
| w101 | phone | w101-03 | Saber: one shared offer for Ranger + Hex on Fri 17 (read back) | {"iid":"imrldjbregyhyko","people":"[{\"p\":\"bane\",\"by\":\"stiff\",\"at\":1784077259594},{\"p\":\"rocky\",\"","date":"Jul 17","endDate":null,"sans":{"f":true,"o":true,"a":true},"allday":true,"e":1439,"remarks":"","by":"stiff"}  | PASS | w101-w101-03-form-phone.png, w101-w101-03-saved-phone.png |
| w101 | phone | w101-04 | before the move: Fri 17 lists both; the shared line's small print (RECORD) | Hex[F · O · A All day Saber for 2 people · 15 Jul, 09:00] Ranger[F · O · A All day Saber for 2 people · 15 Jul, 09:00] · lines [{"who":"Hex","placed":"Saber for 2 people · 15 Jul, 09:00","line":"HexCF · O · ALATEAll daySaber for 2 people · 15 Jul, 09:00"},{"who":"Ranger","placed":"Saber for 2 people · 15 Jul, 09:00","line":"RangerIPF · O · ALATEAll daySaber for 2 people · 15 Jul, 09:00"}] | PASS | w101-w101-04-phone.png |
| w101 | phone | w101-05 | Saber: Ranger's posting moved to Sat 18 on his sheet's date box (Hex's stays 17) | "On 17 Jul: becomes SANS." → "On 18 Jul: becomes SANS."  · record {"san":false,"sanFrom":null,"archived":false} | PASS | w101-w101-05-sheet-phone.png, w101-w101-05-moved-phone.png |
| w101 | phone | w101-06 | Fri 17 opened after the move: Ranger not listed; Hex's line no longer says "for 2 people" (RECORD its exact words) | Hex[F · O · A All day Saber for Hex · 15 Jul, 09:00] · Hex's line "HexCF · O · ALATEAll daySaber for Hex · 15 Jul, 09:00" · its small print "Saber for Hex · 15 Jul, 09:00" · month cell need – · F F01 · O O01 · A A01 | PASS | w101-w101-06-clip-phone.png, w101-w101-06-phone.png |
| w101 | phone | w101-06r | RECORD: the exact words of Hex's line on Fri 17 while Ranger's share is hidden | "HexCF · O · ALATEAll daySaber for Hex · 15 Jul, 09:00" — small print "Saber for Hex · 15 Jul, 09:00" | RECORDED |  |
| w101 | phone | w101-07 | a tap on Hex's line opens the shared input's own window — RECORD what it shows (the whole record's window; naming both is the host's accepted reading) | {"title":"Hex +1 · 17 Jul","picked":["Ranger","Hex","Bolt","Jester","Kraken","Marlin","Otter","Pixel","Rebel","Scribe","Tally","Zenith","Zulu"],"count":"2 picked","dates":["2026-07-17"],"ro":"","save":true,"del":true} | RECORDED | w101-w101-07-phone.png |
| w101 | phone | w101-08 | Saber: Ranger's posting moved back to Fri 17 | "On 18 Jul: becomes SANS." → "On 17 Jul: becomes SANS."  · record {"san":false,"sanFrom":null,"archived":false} | PASS | w101-w101-08-sheet-phone.png, w101-w101-08-moved-phone.png |
| w101 | phone | w101-09 | Fri 17 after the move back: both listed again; the shared line says "for 2 people" again | Hex[F · O · A All day Saber for 2 people · 15 Jul, 09:00] Ranger[F · O · A All day Saber for 2 people · 15 Jul, 09:00] · lines [{"who":"Hex","placed":"Saber for 2 people · 15 Jul, 09:00","line":"HexCF · O · ALATEAll daySaber for 2 people · 15 Jul, 09:00"},{"who":"Ranger","placed":"Saber for 2 people · 15 Jul, 09:00","line":"RangerIPF · O · ALATEAll daySaber for 2 people · 15 Jul, 09:00"}] · month cell need – · F F11 · O O11 · A A11 | PASS | w101-w101-09-phone.png |
| w101 | phone | PU-01 | Saber: the SANS tab opens on its month | page inputs · month "Jul 2026" | PASS | w101-pu-01-phone.png |
| w101 | phone | PU-02 | Saber: Sat 18 opened (on screen, on top), closed by its ✕ | opened {"ttl":"Sat 18 JulNo flying set","box":[0,8,402,854]} · closed | PASS | w101-pu-02-phone.png |
| w101 | phone | PU-03 | Saber: Sat 18 reopened, closed by Escape | closed | PASS | w101-pu-03-phone.png |
| w101 | phone | PU-bell-escape | Saber: the bell opened (its lines read), closed by Escape | closed · lit false · 0 lines · SANS: none | PASS | w101-pu-bell-escape-bell-phone.png |
| w101 | phone | PU-bell-bell | Saber: the bell opened (its lines read), closed by the bell again | closed · lit false · 0 lines · SANS: none | PASS | w101-pu-bell-bell-bell-phone.png |
| w101 | phone | errors | console / page errors / failed requests |  | PASS |  |

