# Walker w2 — ALL AVAIL counts a man posted out as SANS (22 Nov 26, chat 141)

Brief: `docs/superpowers/briefs/2026-11-22-allavail-sans-posted-walk-brief.md` (w2: S8, S12, S13, S3, S22, S23, S28 and the
plain-user round). Build: `raptor-port/dist` from commit `100fa3bb7`, served on port 4392. Clock installed before the app
loaded at Wed 15 Jul 26 09:00 and left running (the app's today logged at the start of every scenario: "Wed Jul 15 2026
09:00"). Every scenario in a fresh browser context, at two sizes: desktop Chromium 1536×864, iPhone WebKit 402×874
(touch, scale 3, real taps, a picture within ~100 ms of each tap in `taps/`). Signed in as `ad`/`a`; the member round as
`us`/`us`. Everything made through the app's own controls; `window.*` only read (named where a step reads it).

Scripts: `scripts/handpass/asp-w2.mjs` (the scenarios), `asp-w2-pu.mjs` (the plain-user round), `asp-w2-lib.mjs`
(helpers copied from `frf-w1.mjs`, `sfd-w1-lib.mjs`, `od-walk.mjs`, `aa-C-s20c.mjs`, `lw-m5b-walk-w1.mjs`),
`asp-w2-probe3.mjs` / `asp-w2-probe5.mjs` (the S23 sim-seat look), `asp-w2-tally.mjs` (counts).
Run: `ONLY=s22d,s22p,… node scripts/handpass/asp-w2.mjs`, `ONLY=pud,pup node scripts/handpass/asp-w2-pu.mjs`.
Pictures: `docs/img/handpass/2026-11-22-allavail-sans-posted/w2/` (names below), tap pictures in `w2/taps/`, results
`w2/results-*.json`; pictures and results from runs the final run replaced are in `w2/earlier-attempts/` (four stopped
runs' ERR pictures and one results file). "In the crowd" is always read as membership — Hex's own puck in the ALL AVAIL
window (`.availwin .rpuck[data-awp="rocky"]`) — beside the count; the read was calibrated on both sides (Hex IN in S1-like
cases, OUT in S22/S28).

**Counts (final runs):** 200 steps — 139 PASS, 6 FAIL (one fault, three readings at each size), 36 RECORDED, 1 NOT WALKED,
18 notes (setup lines with no verdict). 246 pictures plus 443 tap pictures. No console error, page error or failed
request in any final run.

## Results

Each line stands for both sizes unless a size is named; "×3" = "+ SANS" off, on, off again, each time the board reopened
and the count chip pressed. Picture names drop the `-desktop.png` / `-phone.png` ending (both exist).

| # | What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| S22-1 | Hex's 15 Jul cell → ⋯ → Post out → SANS → Post out | "On 15 Jul: becomes SANS."; Hex SANS from 15 Jul (read) | PASS | s22-s22-01-postout-sheet |
| S22-2 | Sat: BRIEF 11:00–12:00 naming Hex, SQN EVENT 10:00–17:00 ALL AVAIL | both rows made | PASS | s22-02-fixture |
| S22-3 ×3 | the event's count chip | chip "44", window 44, Hex NOT in, 0 pending — same each way | PASS ×3 | s22-s22-03-{off,on,off2}-win |
| S28-1 | Hex's 15 Jul → Post out, Overseas Sqn (chosen by default) tapped again so none is chosen, Post out | chip went off; line "On 15 Jul: off the manpower, nothing else."; Hex not SANS, not archived (read) | note | s28-s28-01-postout-sheet |
| S28-2 | the main fixture on Sat | made | PASS | s28-02-fixture |
| S28-3 ×3 | the count chip | chip "44", window 44, Hex NOT in, 0 pending | PASS ×3 | s28-s28-03-{off,on,off2}-win |
| S23-1 | Hex posted out SANS from 15 Jul | "On 15 Jul: becomes SANS." | PASS | s23-s23-01-postout-sheet |
| S23-2 | Sat: BRIEF 08:00–09:00 Hex; SDO desk 10:00–17:00 + ALL AVAIL; OFT EP-9 10:00–17:00 ALL AVAIL in the FRONT seat; OFT EP-10 10:00–17:00 ALL AVAIL in the BACK seat | all placed | PASS | s23-02-fixture |
| S23-3d ×3 | the SDO desk's chip | "45", window 45, Hex IN (purple line) | PASS ×3 | s23-s23-03-r0-{off,on,off2}-win |
| S23-3t ×3 | OFT EP-10 (back seat)'s chip | "45", window 45, Hex IN (purple line) | PASS ×3 | s23-s23-03-r1-{off,on,off2}-win |
| S23-3s ×3 | OFT EP-9 (front seat)'s chip, pressed at its middle | **no window opens; the press arms the empty back seat** (the empty seat's "+" box stands over the chip) | **FAIL ×3, both sizes** | s23-s23-03-r2-{off,on,off2}-win, s23probe-chip-crop-desktop, s23probe-chip-desktop |
| S8-1 | on Wed 15: Hex's 16 Jul → Post out → SANS | "On 16 Jul: becomes SANS."; not SANS yet (read) | note | s8-s8-01-postout-sheet |
| S8-2 | main fixture on Sat | made | PASS | s8-02-fixture |
| S8-3 ×3 | before midnight (09:01) | chip "44", window 44, **Hex NOT in**, 0 pending, same each way | RECORDED ×3; "same each way" PASS | s8-s8-03-before-{off,on,off2}-win |
| S8-4 | clock moved 15h30 with the app open (Edit Schedule) | today Thu 16 Jul 00:31; Hex now SANS from 16 Jul (read) | note | s8-04-after-midnight |
| S8-5 ×3 | after midnight, left open | chip "45", window 45, Hex IN (purple line), 0 pending | PASS ×3 | s8-s8-05-open-{off,on,off2}-win |
| S8-6/7 ×3 | reloaded (stayed signed in) | chip "45", window 45, Hex IN, same people as left open | PASS ×3 + agree PASS | s8-06-reopened, s8-s8-07-reopen-{off,on,off2}-win |
| S12-1/2 | Hex posted SANS from 15 Jul; main fixture; chip before Publish | "45", Hex IN with purple line | PASS | s12-02-win-before-publish |
| S12-3 | four sign-offs, Publish day | SIGNED ORIG Ace Anvil Basher Bolt, nothing pending | PASS | s12-03-published |
| S12-4 | his Leave War cell, Sat 18 Jul | "FO*" | PASS | s12-04-lw-cell |
| S12-5 | his 15 Jul cell → ⋯ → Post out → "Undo post out (PO)" | Hex not SANS, not archived (read) | PASS | s12-05b-postout-sheet, s12-05c-after-undo |
| S12-6 | his cell, Sat 18 Jul | "FO*" | RECORDED | s12-06-lw-cell |
| S12-7 | Edit Schedule, the published Saturday | **"1 pending", "Not yet signed", the four sign-off boxes empty ("4 to sign"), "SIGNED ORIG Ace Anvil Basher Bolt" still shown, "Publish AL1"** (read off the pictures — the script's own number read 0 there, its reader's fault, see below) | RECORDED | s12-07-editsched-sat |
| S12-7b | the day's "1 pending" list | "Published · 1 change waiting to go out as AL1 … Hex · SANS — Saber 15/7 09:00 — yes → no" | RECORDED | s12-07b-pending |
| S12-8 | the bell | "Nothing new" | RECORDED | s12-08-bell |
| S12-9 | the changes window (the clock) | "17 changes this week · New to you 0 · All changes 17 · To go out 1 … Nothing new to you this week." | RECORDED | s12-09-changes |
| S12-10 ×3 | the working crowd after the undo | chip "45", window 45, Hex IN, no purple line; board reads 1 pending each way | PASS ×3; pending count same each way PASS | s12-s12-10-{off,on,off2}-win |
| S13-1 | Hex's 13 Jul (past) → Post out → SANS | "On 13 Jul: becomes SANS."; SANS from 13 Jul | PASS | s13-s13-01-postout-sheet |
| S13-2 | Tue 14: BRIEF 11:00–11:30 Hex, SQN EVENT 12:00–14:00 ALL AVAIL (Hex flies VL 08:40–10:05 that day) | chip "35", Hex IN, amber: "Misses VL BFM debrief 10:05–12:05: SQN EVENT 12:00–14:00" | PASS | s13-02-tue-win |
| S13-3 | Tue signed, Publish day | SIGNED ORIG, nothing pending | PASS | s13-03-tue-published |
| S13-4 | Thu 16: the same two items, not published (Hex flies RU 16:45 that day) | chip "33", Hex IN | PASS | s13-04-thu-win |
| S13-5 | Admin → Users → Hex's row → Archive | "Hex archived — his sign-in is suspended" | PASS | s13-s13-05-acc-open, s13-s13-05-archived |
| S13-6 ×3 | Tue's crowd after the archive | chip "35", window 35, **Hex IN** (same amber reason), 1 pending on the board | PASS ×3 | s13-s13-06-tue-{off,on,off2}-win |
| S13-7 ×3 | Thu's crowd after the archive | chip "32", window 32, Hex NOT in, 0 pending | PASS ×3 | s13-s13-07-thu-{off,on,off2}-win |
| S13-8 | Tue's "1 pending" list | "Tuesday 14/7 Published · 1 change waiting to go out as AL1 … Hex · posted out — Saber 15/7 09:00 — no → yes"; the day shows "1 pending" and "Not yet signed" | RECORDED | s13-08-tue-pending, s13-s13-06-tue-on-win |
| S13-8x | no Tue line about the event's crowd or OIL | none — the one line is Hex's posting | PASS | (same) |
| S3-1 | Admin → Users: New person Quokka, WSO, CAT C, Post in pressed → the app's calendar → 17, Add person | "Quokka added to the roster — set flight and quals on the Quals page"; Post in "Fri 17 Jul 26" | PASS | s3-s3-01-newperson-form, s3-s3-01-newperson-added |
| S3-2 | Quals: WSOs → ✎ Edit → his SANS cell | SANS ticked, from 15 Jul (read) | PASS | s3-s3-02-quals |
| S3-3 | Thu 16 board's crew list | Quokka offered (1 copy) — before his post-in date | note | s3-03-crew |
| S3-4 | Thu 16: BRIEF 08:00–09:00 naming Quokka, SQN EVENT 10:00–17:00 ALL AVAIL | made | PASS | s3-04-fixture |
| S3-5 ×3 | the count chip | chip "22", window 22, **Quokka IN**, each way | RECORDED ×3; same both ways PASS | s3-s3-05-{off,on,off2}-win |

### The plain-user round (both sizes unless named)

| # | What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| pu-01a–c | Hex's Thu 16 → ⋯ → Post out; closed by ✕; reopened, Escape | opens; ✕ closes; Escape closes | PASS | pu-01a-postout-open, pu-01b-closed-x, pu-01c-closed-esc |
| pu-01d | reopened; a press on the grid's "CS/Name" corner | the sheet closed | RECORDED | pu-01d-outside |
| pu-02 | posted out SANS from Thu 16 (future) | "On 16 Jul: becomes SANS."; his 16 Jul cell then "PO" | note | pu-pu-02-postout-sheet, pu-02b-lw-after |
| pu-02c | his 16 Jul → ⋯ → Post out → "Undo post out (PO)" | posting taken back (read) | PASS | pu-02c-undo-shown, pu-02d-after-undo |
| pu-03a–f | ⚙ Settings: open; "+ SANS" ("SANS shown · counted 11 ✕"); the SANS group's ✕; close by ✕; Escape; a press outside | each did as named | PASS | pu-03a…03f |
| pu-04/05 | Hex SANS from 15 Jul; main fixture | made | PASS | pu-05-fixture |
| pu-06 | the count chip | chip "45", window 45, Hex IN with purple line; desktop window 212 wide, phone bottom panel | PASS | pu-06-win |
| pu-06b | desktop: dragged by its six-dot grip 300 left, 120 down | the window followed (1308,114 → 1002,226) | PASS (desktop) | pu-06b-dragged-desktop |
| pu-06b | phone: drag by the grip | — | **NOT WALKED (phone)** — a WebKit touch drag cannot be made from the test runner (walk-scripts §4); the grip is drawn (12×16 at 21,334) | — |
| pu-06c/d | close by ✕; reopen, Escape | closes both ways | PASS | pu-06c-closed-x, pu-06d-closed-esc |
| pu-07 | OIL Earn on (desktop bar button; phone "THIS DAY" row button), chip | still lists Hex; tabs "Who's available 45" / "Who earns OIL 45 of 45"; his earning switch present | PASS | pu-07-oil-earn-on |
| pu-07b | OIL Earn off | back to editing | note | pu-07b-oil-earn-off |
| pu-08 | the board: Hex's copies | on the BRIEF row and under SANS Avail, both with the purple line; chip "45" | RECORDED | pu-08-board-crew |
| pu-08b | four sign-offs, Publish day | SIGNED ORIG, nothing pending | note | pu-08b-published |
| pu-09 | the bell | "Hex · Wed 15 Jul · Posted out · now SANS · now · Mark all read" | RECORDED | pu-09-bell |
| pu-10 | the changes window | "18 changes this week · New to you 0 · All changes 18 · To go out 0" | RECORDED | pu-10-changes |
| pu-11/12 | OIL tracker; Balances, Hex | "2"; "2 ›" | RECORDED | pu-11-oil-tracker, pu-12-balances |
| pu-13 | his Leave War cell Sat 18 Jul | "FO*" | PASS | pu-13-lw-cell |
| pu-14 | signed out, in as `us`; View-only Sched Saturday's chip | "45", Hex IN with the purple line | PASS | pu-14-member-view |

## The FAIL — one fault, S23, both sizes

**A sim session's FRONT seat holding ALL AVAIL: its count chip cannot be pressed — the empty back seat's "+" box stands
over it, so a press arms the back seat and the ALL AVAIL window never opens.** Not about "+ SANS": the same both ways, and
before any posting (probe3 had no posting). The desk and the back-seat case open normally.

Steps: Scheduler Board, Sat 18 Jul → Sims, OFT "+ Row" → 10:00–17:00 → tap the front-seat box → tap ALL AVAIL in the crew
list → press the "45" beside it. The window does not open; the back seat is armed (its "+" lights) and "ALL AVAIL planned"
is the last note. Read at the chip's middle: `document.elementFromPoint` returns the back seat's empty box (`sb-slot
empty`, back seat), not the chip. Seen on the desktop and the phone (all six presses in the final run). One honest
difference: in a separate phone probe (`asp-w2-probe3.mjs`, SZ=p) a single tap at the same point did open the window —
WebKit's tap targeting may land either way; the scenario run's three phone taps all armed the back seat.
Pictures: `s23probe-chip-crop-desktop.png` (the "45" chip with the dashed "+" box over its right half),
`s23probe-chip-desktop.png`, `s23-s23-03-r2-{off,on,off2}-win-{desktop,phone}.png`.
Side note (not a finding): while a seat is armed the board draws no count chips; a press on EP-9 left the back seat armed,
so the script reads EP-9 last.

## Errors seen
None in any final run (console errors, page errors, 4xx, failed requests all empty).

## RECORD lines — exactly what the screen said
- **S8 before midnight (Wed 15, posting dated Thu 16):** chip "44", window 44 people, Hex NOT in; 0 pending; the same
  with "+ SANS" off, on and off again. His 16 Jul cell read "PO" before the date (plain-user round, pu-02b).
- **S12 after "Undo post out":** the published Saturday reads **"1 pending"** and **"Not yet signed"**, its four
  sign-off boxes empty ("4 to sign"), the "SIGNED ORIG Ace Anvil Basher Bolt" line still shown, "Publish AL1" offered;
  its pending list: "1 change waiting to go out as AL1 — Hex · SANS — Saber 15/7 09:00 — yes → no". His Leave War cell
  for Sat 18 Jul still "FO*". The bell: "Nothing new". The changes window: "17 changes this week … To go out 1 … Nothing
  new to you this week." The working crowd: Hex in, no purple line, chip "45", the same both ways.
- **S13 Tue's pending after the archive:** "1 pending", "Not yet signed"; its one line: "Hex · posted out — Saber 15/7
  09:00 — no → yes". No line about the event's crowd or OIL. Tue's crowd keeps Hex (35); Thu's drops him (33 → 32).
- **S3 (a new man joining Fri 17, ticked SANS, named on Thu 16):** **Quokka IN the Thu 16 crowd** — chip "22", window 22,
  both ways (off / on / off again identical). He was also offered in Thu 16's crew list before his post-in date, and the
  Quals tick recorded SANS from 15 Jul (today), before his post-in date (read).
- **S28 (no chip):** the sheet's line reads "On 15 Jul: off the manpower, nothing else."; he stays on the roster, not
  SANS, not archived (read); out of the crowd both ways.

## The walk's own mistakes (not the app's), corrected before the final runs
- S13 first run: the fixture used 08:00 / 10:00–17:00 on Tue and Thu, but Hex flies VL 08:40–10:05 on Tue and RU 16:45 on
  Thu in the demo week, so he was never free in the event; the premise failed, not the app. Rerun with BRIEF 11:00–11:30
  and SQN EVENT 12:00–14:00 (earlier pictures replaced under the same names).
- S23: the first pick of ALL AVAIL took the small placeholder puck already on the SDO row instead of the crew list's; the
  arm press hit a man's puck in the zone's middle; the board's sticky bar stood over a chip — each fixed in the helper
  (crew-list puck, the zone's "+ add" place, chip scrolled to mid-screen).
- S3: "Kestrel" is already a callsign ("Kestrel is already taken — callsigns must be unique"); the Post in box is the
  app's date button, not a typed box. Rerun as "Quokka", the date picked in the app's calendar.
- The script's own "N pending" read on Edit Schedule (S12-7, S13-8) returned 0 where the pictures show "1 pending" — the
  reader looked inside the wrong block; the RECORD lines above are read off the pictures and the pending lists. The
  helper is corrected for any re-walk.

## The lessons of §7.11 — which step covers each
1 state × reading: S8 (before / after midnight / reopened), S12 (published then undone), S13 (published vs not) — each
read ×3. 2 drags at speed: the window drag walked once at one speed on the desktop only; phone drag not walked (above).
3 after every press: pictures after each press, tap pictures on the phone. 4 window over a working page: the ALL AVAIL
window left the board working; the crew list pressed behind it in S23 (arming). 5 resting place against covers: the S23
fault is exactly this (a box standing over the chip). 6 phone-owned scroll/keyboard: not applicable — no scrolling or
keyboard change. 7 frame-by-frame motion: not applicable. 8 approved drawing: not applicable — no new drawn screen.
9 lists measured: not applicable — no list layout changed (membership read only). 10 page hidden and shown: not walked
beyond the reload in S8. 11 fit at 1536/2560: not applicable. 12 every page a window opens from: the count window opened
from the board (all scenarios) and View-only Sched (pu-14); Edit Schedule's week not opened here (w1's S7). 13 pinch:
not applicable. 14 keyboard boxes: not applicable. 15 bars over scrolling areas: met as the board bar over a chip
(script trap, noted). 16 after a refusal: not applicable. 17 show/hide controls: "+ SANS" pressed both ways and back in
every scenario. 18 print: not applicable. 19 every window closed each way: the post-out sheet, Settings and the ALL AVAIL
window by ✕, Escape and (sheet, Settings) a press outside, both sizes. 20 gesture variants: not applicable. 21 test
touch vs his phone: the S23 tap that once opened and three times armed is named for his phone. 22 what is drawn: chips
and windows read by drawn elements and pictured. 23 what a tap opens: the count chip's ruled window (D38) is the expected
one in every read. 23b side-by-side boxes: not measured — no new boxes. 24 top-bar placement: not applicable.
25 every place it can be put: S23 — Common Programme, ground row, duty desk, sim front and back seat (passenger and
extras lines not walked). 26 gesture by what is seen: the window drag measured by its box following the pointer.
27 neighbours of a changed control: not applicable. 28 phone press proved on screen: chips and sheets pressed where drawn.
29 midnight: S8 — clock past midnight with the page open, and reopened. 30 phone taps pictured: `taps/`. 31 page fitted
to the screen at 125%: not applicable.

## Not walked
- The ALL AVAIL window's drag on the phone (pu-06b) — a WebKit touch drag cannot be made from the test runner; the
  desktop drag passed.
- S23's passenger and extra-person lines and ALL (as opposed to ALL AVAIL) — outside my brief's line for S23 (duty desk
  and sim seat).
