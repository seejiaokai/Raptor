# Walker w7 — D2338 walk: the re-walk of round 4b's fixes and the Fable fix (R1–R4), and the plain-user round — 23 Nov 26, chat 147

Brief: `docs/superpowers/briefs/2026-11-23-d2338-walk-brief.md`. Build: `raptor-port/dist` as found (bundle
`index-DCvXwN4m.js`, built from `a203fc98c`), not rebuilt, served by `npx vite preview --port 4397 --strictPort` (the port
was free; stopped by its port at the end — free again). Clock installed before the app loaded and left running: Wed 15 Jul
26 09:00 for R1 and the plain-user round, Mon 13 Jul 26 09:00 for R2–R4 (the hand tick is made "on Mon 13", D2313); to
reach Fri 17 Jul the page's own clock was moved with `setSystemTime(2026-07-17T09:00)`, the page reloaded in the same
storage and signed in again — the app's today was logged after each move ("Fri Jul 17 2026 09:00"). Each scenario in a
fresh browser context; desktop Chromium 1536×864, iPhone WebKit 402×874 (touch, scale 3, real taps, a picture right after
each tap in `<run>/taps/`). Signed in as `ad`/`a` (Saber); Hex as `hex` (the demo already gives him that sign-in —
Admin → Users showed it, so none was given). Everything made through the app's own controls; `window.*` only READ (to read
back a set-up step, and to choose R3/R4's man).

Scripts: `scripts/handpass/sud-w7.mjs` (every scenario; on chat 141/146's `asp-w2-lib.mjs` and `sfd-w1-lib.mjs`),
`sud-w7-env.mjs` (sets the helpers' server and picture folder before they load, walk-scripts §6), `sud-w7-probe.mjs` and
`sud-w7-probe2.mjs` (read only: Hex's own items each day, the man for R3/R4, Fri's fill zones), `sud-w7-bar.mjs` (the
phone bar check, below), `sud-w7-sum.mjs` (counts). Raw logs and results: `D:\raptor-work\c147-walk\w7\`.

**Runs — pictures under `docs/img/handpass/2026-11-23-sans-unfiled/w7/`:**
- `final/` — R1, R2 (as the final run had to take it, below), R3, R3 with "+ SANS" on at the archive (R3s), R4, both sizes
  (script v3). Its `pu-*` pictures are an earlier attempt of the plain-user round — **not cited**.
- `r2b/` — R2 as briefed, both sizes (script v4).
- `pu3/` — the plain-user round, **desktop** (script v6; its `pu-*phone*` pictures are an attempt that stopped — not cited).
- `pu4/` — the plain-user round, **phone** (script v7).
- `bar-probe/` — the phone day window's bar, WebKit and Chromium (six pictures).
- Not cited, earlier attempts: `try1/`, `try2/`, `pu2/`, `probe/`.

Hex's own items (read): Mon a sim; Tue VL BFM T/O 08:40 LD 10:05; Wed VL ACM 10:35–12:00; Thu RU BFM 16:45–18:10;
Fri–Sun none. So the main fixture is a Ground **BRIEF 11:00–11:30** naming the man and a Common **SQN EVENT 12:00–14:00**
for ALL AVAIL on Tue 14 Jul — clear of his flight. **R3/R4's man: Vandal** (id `split`, pilot, IP): no input names him
(read from `window.INPUTS`), nothing of his on the schedule this week, his Leave War row 13–19 Jul blank (step b0, both
sizes).

"In the crowd" = the man's own puck in the ALL AVAIL window, read with "+ SANS" off, on, off again (the Leave War's ⚙), on
the Scheduler Board (the working copy) and on View-only Sched (the published face, the window's foot reading "who was free
when this day was issued — Original"). Picture names below drop the `-desktop.png` / `-phone.png` ending where both exist.

## Results

### R1 — Hex posted out as SANS from Mon 13 Jul (on Wed 15); Tue published; archived Fri 17; restored, post in Mon 20 — both sizes (`final/`)

| Step | What the screen said | Verdict | Pictures |
|---|---|---|---|
| a0 "+ SANS" off | group not shown | PASS ×2 | r1-a0-settings-off |
| a2 Hex's Mon 13 cell → ⋯ → Post out → SANS → Post out | "On 13 Jul: becomes SANS."; read: SANS from 13 Jul | PASS ×2 | r1-a2-postout-open, r1-a2-postout-sheet |
| a3 Tue BRIEF 11:00–11:30 naming Hex, SQN EVENT 12:00–14:00 ALL AVAIL | both rows made | PASS ×2 | r1-a3-fixture |
| a4 Tue's count before | chip "35", window 35, Hex IN (purple line) | PASS ×2 | r1-a4-before-win |
| a5 four boxes signed, Publish day | 0 pending, "SIGNED ORIG · CUR CK Ace · SKED CK Anvil · PLANNED Basher · APPROVED Bolt" | PASS ×2 | r1-a5-published |
| a5b published face before | 35, Hex IN | PASS ×2 | r1-a5b-view-before |
| a5c Hex's Tue 14 cell on the war | "PO" | RECORDED ×2 | r1-a5c-lw-tue |
| a6 clock → Fri 17, reload, sign in | today "Fri Jul 17 2026 09:00" | PASS ×2 | — |
| a7 Admin → Users → Hex → Archive | "Hex archived — his sign-in is suspended"; read: archived on 17 Jul, no longer SANS | PASS ×2 | r1-a7-acc-open, r1-a7-archived |
| A8 Tue's event after the archive, ×3, working copy and published face | every reading chip "35", window 35, **Hex IN**; the board's day "1 pending" | **PASS 6 + agree, ×2** | r1-a8-{off,on,off2}-{board,view}-win |
| a9 Tue's pending lines | one line: "Hex · posted out · Saber 17/7 09:00 · no → yes" — nothing about the event's crowd or OIL | PASS ×2 | r1-a9-tue-pending |
| a9b Hex's Tue cell after the archive | "PO" (as before) | PASS ×2 | r1-a9b-lw-tue |
| a10 Archived → Hex: Post in Mon 20 Jul, Restore | "Mon 20 Jul 26"; "Hex restored — he can sign in, and he'll be asked to check his quals and CAT" | PASS ×2 | r1-a10-restore-open, -date, -restored |
| A11 Tue's event after the restore, ×3, both faces | 35, **Hex IN** each way; 0 pending | **PASS 6 + agree, ×2** | r1-a11-{off,on,off2}-{board,view}-win |
| a12 Tue's pending | no "N pending" drawn | PASS ×2 | r1-a12-tue-pending |
| a12b Hex's Tue cell after the restore | "PO" (as before) | PASS ×2 | r1-a12b-lw-tue |

### R2 — Hex ticked SANS by hand on Quals (Mon 13), "+ SANS" off, posted out as SANS from Mon 13, named on Tue, archived Fri

**As the final run took it (`final/`, both sizes): the posting could not be made by its usual door** — once ticked, with
"+ SANS" off, Hex has no row on the Leave War grid, so there is no Mon 13 cell to open (step a2, "no cell"; the same state pictured
in `r2b/` as r2b-a1b-war-sans-off). That is the ruled state (a SANS man not posted out is off the war unless "+ SANS" puts him on —
D1215, D1221), so the step is NOT WALKED there, not a fault. The run went on without the posting — a useful variant: Hex
ticked by hand only, named Tue, Tue published, archived Fri 17, restored Mon 20 — and every crowd reading held: A8 and A11,
×3, both faces, chip "35", **Hex IN**, both sizes (r2-a8-*, r2-a11-*); a9 one pending line "Hex · posted out … no → yes",
nothing about the crowd. His Tue cell: "NO CELL" before the archive, a blank cell after it (r2-a9b-lw-tue) — the war
shows a hidden SANS man once archived (D325), so RECORDED, not a fault.

**As briefed (`r2b/`, both sizes): the posting made through the one door the state leaves** — "+ SANS" ON, his row in the
SANS group, Mon 13 → ⋯ → Post out → SANS → Post out, then "+ SANS" OFF again before anything else:

| Step | What the screen said | Verdict | Pictures |
|---|---|---|---|
| a0 "+ SANS" off; a1 Quals → WSOs → ✎ Edit → Hex's SANS cell → Done | read: SANS from 13 Jul | PASS ×2 | r2b-a0-settings-off, r2b-a1-quals |
| a1b his Mon 13 cell with "+ SANS" off | no cell drawn for him | RECORDED ×2 | r2b-a1b-war-sans-off |
| a1c "+ SANS" on; a2 the posting; a2x "+ SANS" off again | the SANS chip offered; "On 13 Jul: becomes SANS."; group off again | PASS ×2 | r2b-a1c-settings-on, r2b-a2-postout-*, r2b-a2x-settings-off |
| a3–a5b fixture, count before, Publish, published face | 35, Hex IN; 0 pending, SIGNED ORIG | PASS ×2 | r2b-a3…a5b |
| a5c his Tue cell | "PO" | RECORDED ×2 | r2b-a5c-lw-tue |
| a6–a7 Fri 17, Archive | archived 17 Jul; read: still SANS (the hand tick kept, D2327) | PASS ×2 | r2b-a7-* |
| A8 after the archive, ×3, both faces | 35, **Hex IN** each way; board "1 pending" | **PASS 6 + agree, ×2** | r2b-a8-* |
| a9 Tue's pending | "Hex · posted out … no → yes" only | PASS ×2 | r2b-a9-tue-pending |
| a9b his Tue cell after the archive | "PO" (as before) | PASS ×2 | r2b-a9b-lw-tue |
| a10 Restore, post in Mon 20 | restored; read: still SANS (the tick) | PASS ×2 | r2b-a10-* |
| A11 after the restore, ×3, both faces | 35, **Hex IN**; 0 pending | **PASS 6 + agree, ×2** | r2b-a11-* |
| a12 pending | none | PASS ×2 | r2b-a12-tue-pending |
| a12b his Tue cell after the restore | **no cell** — his row is gone from the grid ("+ SANS" off) | script FAIL ×2 → **RECORDED** (see the FAIL list) | r2b-a12b-lw-tue |

### R3 — the Fable fix (F1): Vandal ticked SANS by hand Mon 13, nothing filed, no leave, "+ SANS" off, named Tue, Tue published, archived Fri 17 — both sizes (`final/`)

| Step | What the screen said | Verdict | Pictures |
|---|---|---|---|
| b0 the man | Vandal: 0 inputs; war 13–19 Jul all blank | PASS ×2 | r3-b0-lw-row |
| b1 "+ SANS" off; b2 Quals → Pilots → ✎ Edit → his SANS cell → Done | read: SANS from 13 Jul | PASS ×2 | r3-b1-settings-off, r3-b2-quals |
| b3 Tue BRIEF 11:00–11:30 naming Vandal, SQN EVENT 12:00–14:00 | both rows made | PASS ×2 | r3-b3-fixture |
| b4 count before | 35, Vandal IN (purple line) | PASS ×2 | r3-b4-before-win |
| b5 Publish | 0 pending, SIGNED ORIG | PASS ×2 | r3-b5-published |
| b6 Fri 17; b7 "+ SANS" OFF at the archive; b8 Archive | "Vandal archived"; archived 17 Jul | PASS ×2 | r3-b7-settings-off, r3-b8-* |
| B9 Tue's event after the archive, ×3, both faces | 35, **Vandal IN** each way; board "1 pending" | **PASS 6 + agree, ×2** | r3-b9-{off,on,off2}-{board,view}-win |
| b10 Tue's pending | one line "Vandal · posted out · Saber 17/7 09:00 · no → yes" — nothing about the crowd | PASS ×2 | r3-b10-tue-pending |

### R3s — the same with "+ SANS" ON at the archive (a separate run) — both sizes (`final/`)

Every line as R3: b7 "+ SANS" ON (group shown); B9 ×3, both faces, 35, **Vandal IN**; b10 the one "posted out" line, nothing
about the crowd — **PASS ×2 each** (r3s-b7-settings-on, r3s-b9-*, r3s-b10-tue-pending). The switch at the archive changed
nothing.

### R4 — as R3 but archived Mon 13 Jul (the day of the tick) — both sizes (`final/`)

| Step | What the screen said | Verdict | Pictures |
|---|---|---|---|
| b0–b5 as R3 | 35, Vandal IN before; Tue published | PASS ×2 | r4-b0…b5 |
| b8 Archive on Mon 13 | archived 13 Jul | PASS ×2 | r4-b8-* |
| B9 working copy ×3 | chip "34", window 34, **Vandal OUT** each way; board "2 pending" | **PASS 3, ×2** | r4-b9-{off,on,off2}-board-win |
| B9 published face ×3 | chip "35", window 35, Vandal IN — the crowd as issued | RECORDED 3, ×2 | r4-b9-{off,on,off2}-view-win |
| b10 Tue's pending lines | "SQN EVENT · who it stands for · Vandal → no longer free" and "Vandal · posted out · Saber 13/7 09:00 · no → yes" | RECORDED ×2 | r4-b10-tue-pending |
| b11 Mon and Wed boards: Vandal in the crew list? | not there (the lists drawn, Talisman → Warden) | PASS ×2 each | r4-b11-0-crew, r4-b11-2-crew |

R4's pending crowd line is the ordinary mechanism for a published day after the man's archive (who was free is frozen at
publication; a change shows pending — D45, D327). RECORDED for the host.

### The plain-user round (§7.0a) — desktop `pu3/`, phone `pu4/`

| Step | Desktop | Phone | Pictures |
|---|---|---|---|
| p01a Hex's Fri 17 → ⋯ → Post out opens the posting part | PASS | PASS | pu-p01a-postout-open |
| p01b closed by ✕ / p01c closed by Escape | PASS / PASS | PASS / PASS | pu-p01b-closed-x, pu-p01c-closed-esc |
| p01d a press outside the sheet (RECORD) | click at the screen's foot-left, on the sheet's scrim: **closed** | tap at 10,864 (below the sheet, on the page): **stays open** | pu-p01d-outside |
| p02 post out as SANS from Fri 17 (ahead) | "On 17 Jul: becomes SANS."; not SANS yet — PASS | PASS | pu-p02-postout-* |
| p03 "Undo post out" on the same sheet | Admin → Users tag "posting out 17 Jul · SANS" → gone — PASS | PASS | pu-p03a-undo-shown, pu-p03b-after-undo |
| p04 posted out again from Fri 17; p05 Sat 18 BRIEF 08:00–09:00 naming Hex | PASS / PASS | PASS / PASS | pu-p04-*, pu-p05-sat-brief |
| p06 Board Fri 17 and Sat 18, nothing armed (Wed 15) | Hex struck in SANS AVAIL; hover title "Hex — SANS from Fri 17 Jul: no availability filed. It can be filed from that day on the Inputs page's SANS tab."; nothing printed — PASS ×2 | the same — PASS ×2 | pu-p06-4-board-crew, pu-p06-5-board-crew |
| p07 Board Fri 17, EP-6's free sim seat armed | the same words printed under his struck name — PASS | PASS | pu-p07-board-armed |
| p07b Escape disarms | PASS | PASS | pu-p07b-disarmed |
| p08 Edit Schedule crew panel on Friday, nothing armed | look-ahead words on the hover title, nothing printed — PASS | PASS | pu-p08-es-crew |
| p09 Edit Schedule, a seat on the week armed | the Fri sim seat: the look-ahead words printed — PASS | the phone's week draws EP-6 with no free seat (a tap there picked Wildcard), so the Ground row AIRCREW ADMIN was armed: Hex not struck, no words — RECORDED (a ground row is not a flying or sim seat) | pu-p09-es-armed |
| p10 Hex's sign-in on Admin → Users | "hex" already given — PASS | PASS | pu-p10-hex-signin |
| p11 clock → Fri 17, reload, signed in as Hex | today Fri 17 09:00; read: SANS from 17 Jul — PASS | PASS | pu-p11-hex-in |
| p12 Hex's bell | lit; **"Your SANS availability"** (bold, 600) · "Sat 18 Jul" · "Planned, no availability filed" · unread · "9 h" — PASS | the same — PASS | pu-p12-bell-open |
| p13 the bell closed by Escape / a press outside / the bell again | PASS / PASS / PASS | PASS / PASS / PASS | pu-p13a-bell-esc, pu-p13b-bell-outside, pu-p13c-bell-again |
| p14 a tap on the line | Inputs page, SANS tab, "JULY 2026", Sat 18 Jul's day window open ("+ Commitment" live) — PASS | the same, the window tall (top 8, 854 high) — PASS | pu-p14-tap-line |
| p15a day window closed by ✕ / p15b reopened, closed by Escape | PASS / PASS | PASS / PASS | pu-p15a-day-x, pu-p15b-day-esc |
| p15c a press outside the day window (RECORD) | stays open (the page behind works — D641) | nothing outside to press: the tall window fills the screen | pu-p15c-day-outside |
| p15d (phone) a tap on the window's bar: the other height | — | WebKit: no change (script FAIL) → **RECORDED**, see the FAIL list | pu-p15d-bar-tap1, -tap2; bar-probe/* |
| p16 the SANS tab's month: Sat 18's cell (RECORD) | "18 – F 0 0 O 0 0 A 0 0" | the same | pu-p16-sans-month |
| p14b the bell after the tap (RECORD) | not lit; the line read (weight 400), the same words | the same | pu-p14b-bell-after |
| p17 View-only Sched as Hex (RECORD) | Sat 18: his own purple puck on BRIEF, title "Hex · C · ops wingman · SANS · earns half a day of OIL" | the same | pu-p17-member-view |
| p18 Saber's bell: no "Your SANS availability" line | only "Hex · Posted out · now SANS" — PASS | PASS | pu-p18-admin-bell |
| p19 Board Fri 17 and Sat 18 on Fri 17, nothing armed | hover title "Hex — SANS — no availability filed for today", no look-ahead words — PASS ×2 | PASS ×2 | pu-p19-4-board-crew, pu-p19-5-board-crew |
| p20 Board Fri 17 on Fri 17, the sim seat armed | "SANS — no availability filed for today" printed under his struck name — PASS | PASS | pu-p20-board-armed |
| p21 the changes window (RECORD) | "8 changes this week", "Nothing new to you this week." | the same, with "Hide ▾" | pu-p21-changes |

## The script's FAIL lines, each read (§7) — no FAIL stands

1. **R2 a2, both sizes (final run): "no cell 2026-07-13".** Hex, ticked SANS by hand with "+ SANS" off, has no row on the
   grid, so the Post out door is not there. The ruled state (D1215, D1221), not a missing door: with "+ SANS" on his row
   is in the SANS group and the posting is made (r2b a1c/a2, both sizes). → NOT WALKED in that run; walked in `r2b/`.
2. **R2 a9b, both sizes (final run): Tue cell "NO CELL" before the archive, blank after.** A hidden SANS man shows on the
   war once archived (D325). → RECORDED.
3. **R2b a12b, both sizes: after the restore Hex's row is gone from the grid ("NO CELL"), where R1's stays ("PO").** Read:
   in R1 the archive took his SANS off (the posting's SANS), so the restored Hex is an ordinary man with a row; in R2b the
   hand tick keeps him SANS through the archive and the restore (D2327: an archive keeps them), and a SANS man not posted
   out is off the war with "+ SANS" off (D1215, D1221). His crowd on Tue held all the while. → RECORDED; the host may
   want to confirm it reads as he meant (the brief's "his Leave War cell on Tue as before" assumed R1's shape).
4. **pu phone p15d: a finger tap on the SANS day window's bar did not change its height (WebKit).** Checked
   (`sud-w7-bar.mjs`, `bar-probe/`): in Chromium at the same phone size a finger tap on the bar's title takes it from tall
   (top 8) to the shorter height (top 285) and a second press back; in WebKit a MOUSE click on the bar does it, a finger
   tap does not — the test browser's WebKit touch delivers no pointer press here (walk-scripts §4). Not a fault on this
   evidence; **a look for his iPhone**: tap the SANS day window's top bar — it should drop to about two-thirds and back.
   It is not this change's code (the day window is as before; D2338 only opens it).

Script mistakes along the way (not in the counts): the first phone round armed nothing (the press hit a puck, not the
"+ add" — fixed by aiming at the zone's own box), the crew panel's stepper is absent while a seat is armed (the script
then only opens the panel), and on the phone the tall day window covers the bar, so the bell after the tap is read once
the window is shut.

## Errors seen

None: no console error, page error or failed request in any cited run, either size (each run's last line).

## The lessons of §7.11 — the step that covers each, or why it cannot apply

1. State × reading table: the crew-list words in two states (look-ahead on Wed 15; posting run on Fri 17) × four surfaces
   (board unarmed, board armed, Edit Schedule panel unarmed, armed) — p06–p09, p19–p20; the bell line unread / read —
   p12, p14b. 2. No drag or swipe in this change; the bar's pull by drag not walked (WebKit touch drives no pointer
   moves). 3. A picture after every press, a tap picture on the phone (`taps/`). 4. The SANS day window leaves the page
   working: p15c pressed outside, the window stayed (D641); not checked that what lights behind matches. 5. The day window
   at its resting place pictured after the tap (p14), its box measured. 6. Nothing handed to the phone itself. 7. No
   motion. 8. No approved drawing (D2339: built without one). 9. No list with figures in this change (the bell line's
   height measured, 52px). 10. A page hidden and shown again — not walked (A12's midnight is w6's). 11. Nothing depends
   on how much fits. 12. The day window opened from the bell line and from the day cell; the bell opened on View-only
   Sched and the board. 13. No pinch. 14. No typing. 15. No bar over a scroller changed. 16. No refusal at a box. 17.
   "+ SANS" pressed off, on, off and the crowd read after each (both2). 18. No print. 19. Every window closed each of its
   ways at both sizes: the Post out sheet (✕, Escape, outside), the bell (Escape, outside, the bell again), the day window
   (✕, Escape, outside, the phone's bar — see FAIL list 4). 20. Taps only. 21. What only his phone shows: the day
   window's bar tap (FAIL list 4) and the bell's place under the bar. 22. Words read from boxes wider than 1px (the
   printed reason) and the pictures opened. 23. What the tap opens: D2338 says the SANS calendar on the first day — walked
   (p14). 23b. Side-by-side boxes not measured: no new pair of boxes in this change. 24. Nothing placed against the top
   bar changed. 25. The man named on a Ground row only (each kind of row is w5's A17). 26. No gesture. 27. No press moves
   a neighbour. 28. On the phone the day window's box read after the tap with no scroll by the script (p14: 0,8,402×854).
   29. The clock crossed only by reload (moveTo); the open-page midnight is w6's A12. 30. Tap pictures within ~100 ms on
   the phone (`taps/`). 31. No page fitted to the screen changed.

## What I could NOT walk, and why

- R2's posting with "+ SANS" off: no door in that state (FAIL list 1) — walked through the SANS group instead (`r2b/`).
- The phone week's armed flying or sim seat on Edit Schedule: the phone's week draws EP-6 with no free seat, and Fri 17 has
  no flying (p09 armed a Ground row instead, RECORDED).
- The SANS day window's pull by drag and its tap on the bar in WebKit (FAIL list 4) — Chromium's touch shows it works; his
  iPhone to confirm.
- A press outside the tall phone day window: it covers the whole screen, nothing outside to press.
- Hex filing his availability from the window the tap opens (that is w6's A9); only "+ Commitment" live was read.

## Counts (cited runs: `final/` R1–R4, `r2b/`, `pu3/` desktop, `pu4/` phone)

373 lines: **323 PASS, 0 FAIL, 34 RECORDED** (the four script FAILs read above, 7 lines, counted here as 5 RECORDED and
2 NOT WALKED), **2 NOT WALKED**, 14 notes (the app's today at each start). Pictures in the cited runs: 848 (with the tap
pictures): `final/` 534 (its 97 `pu-*` not cited), `r2b/` 161, `pu3/` 37 desktop (its 64 phone not cited), `pu4/` 110,
`bar-probe/` 6.

Rulings: none this session (a walker records none).
