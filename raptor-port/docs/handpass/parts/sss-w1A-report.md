# Walker A — report (chat 182: standby lines never ask a SANS man; an untimed sim strikes him; struck at once where his filing misses; no "file it" on the crew list — D2584 Q4/Q5, D2586, D2585, D2587), 25 Nov 26

Build walked: the frozen `D:/raptor-work/c182-build`, served on port 4891 by `npx vite preview --strictPort --outDir`; the page
served `index-CRvIUIHo.js` (proved in the page: probe row `bundle`, and by `curl` before the first run). Server stopped by its port
at the end (4891 free). Clock started 15 Jul 26 09:00 and left running. Each scenario in a fresh browser context, Saber signed in.
Ranger posted out SANS from Fri 17 Jul through the Leave War's posting sheet in every scenario ("On 17 Jul: becomes SANS.").
Sizes: desktop 1536 × 1000 Chromium; phone 402 × 874 WebKit, touch, 3x; finger drags in Chromium at the phone's size ("phone-chromium",
F11 only) because WebKit's in-page touches drive no drag (walk-scripts §4).

On-screen names: `ipman` is **Jester**; the other SANS pilots Bolt, Kraken, Rebel, Zenith; SANS WSOs Marlin, Otter, Pixel, Scribe,
Tally, Zulu; Ace (`dj`) is a regular pilot (the N1 control).

Scripts (all new, names proved free): `ROOT/raptor-port/scripts/handpass/sss-w1A.mjs` (the walk), `sss-w1A-lib.mjs`, `sss-w1A-env.mjs`,
probes `sss-w1A-probe.mjs` … `sss-w1A-probe5.mjs`. The library imports chat 179's walker-A library and the c174 recipes' helpers
(never edited; their folders set by `sss-w1A-env` first, `||=`).
Pictures (cited runs only): `ROOT/raptor-port/docs/img/handpass/2026-11-25-sans-standby-sim/A/<run>/` — **1,077 pictures, 180 MB**,
24 run folders; phone taps' "right after the lift" pictures in each run's `taps/`. Raw logs and results JSON: `D:/raptor-work/c182-walk/A/`
(`<run>.log`, `results-<scn>-<size>-<run>.json`). Superseded attempts (script faults, listed at the end) moved whole to
`D:/raptor-work/c182-walk/A/superseded-pics/`, probes to `D:/raptor-work/c182-walk/A/probe-pics/` — never mixed with the cited runs.

## Totals

**No FAIL that is the app's.** Every promise of the brief held at both sizes: standby seats never carry SANS words (crew list, hover,
note, warning list, rings, bell); untimed OFT and AMT seats and their extra places strike a SANS man with nothing filed, letter for
letter as a flight; "not offering …" strikes before times are typed; Ranger's crew-list, hover and note words are exactly
"SANS from Fri 17 Jul: no availability filed" (no full stop, no "File it"); his bell ends "Tap to file for availability.".
**No console errors, page errors or failed requests in any cited run.**
- 3 FAIL rows remain in the cited runs, all the script's own expectation (explained below): W1r `fl-win.FCP` (desktop, phone) and F4-d
  `oft/amt .p` (two rows).
- **One lesson-32 disagreement to report** (crew list vs warning list vs bell on an untimed sim whose filing does not offer it) — below.
- 4 leads "to check" (not filed), 1 NOT WALKED step (F22.4 phone).

| Run | Rows | PASS | FAIL | RECORDED | NOT WALKED |
|---|---|---|---|---|---|
| W1r-d / W1r-p | 33 / 33 | 26 / 26 | 1 / 1 (script) | 4 / 4 | 1 / 1 (re-walked in W1wk) |
| W1wk-d / W1wk-p | 9 / 9 | 8 / 8 | 0 | 0 | 0 |
| W1d-d / W1d-p | 31 / 30 | 18 / 17 | 0 | 12 / 12 | 0 |
| F4-d / F4-p3 | 20 / 20 | 12 / 14 | 2 (script) / 0 | 5 / 5 | 0 |
| F17-d3 / F17-p | 21 / 18 | 18 / 15 | 0 | 2 / 2 | 0 |
| F13-d / F13-p | 14 / 14 | 13 / 13 | 0 | 0 | 0 |
| F11-d3 / F11-pc | 11 / 11 | 10 / 10 | 0 | 0 | 0 |
| F12-d / F12-p | 13 / 13 | 10 / 10 | 0 | 2 / 2 | 0 |
| F20-d / F20-p | 13 / 13 | 9 / 9 | 0 | 3 / 3 | 0 |
| F21-d / F21-p | 15 / 15 | 9 / 9 | 0 | 5 / 5 | 0 |
| F22-d / F22-p2 | 8 / 8 | 7 / 6 | 0 | 0 | 0 / 1 |
| PU-d / PU-p | 26 / 26 | 19 / 19 | 0 | 6 / 6 | 0 |

(Each run's rows include its set-up rows, the "today" note and the console-errors row.)

## The three FAIL rows — the script's own expectation, not the app

1. **W1r `fl-win.FCP` (desktop and phone)** — a flight 08:30–09:30; Rebel filed Fly 08:00–10:00; the script expected him plain
   ("window covers"). The app reads "SANS — available 08:00–10:00 only". A flight's window starts at its brief, before take-off
   (`docs/engine-rules.md` §The sortie window, the brief and the time cells), so 08:00–10:00 does not cover an 08:30 take-off — the
   existing rule. N2's "window covers → plain" stands proved by Ranger (Fly all day) plain on every flight, and N3's by Bolt plain on
   the 08:30–09:30 OFT (except where his demo SDO duty spoke first: "already on SDO duty 07:30–17:30"). Pictures:
   `W1r-d/W1r-w1-fl-win-FCP-desktop.png`, `W1r-p/W1r-w1-fl-win-FCP-phone.png`.
2. **F4-d `F4.oft.slots4oft2p`, `F4.amt.slots4amt0p`** — the script expected Otter (a SANS WSO) "SANS — no availability filed for
   today" on a sim's FRONT seat; the app reads "WSO — cannot fly front seat" (the seat rule first — correct). Ranger, Jester and Ace
   were all as expected in those rows. The check was corrected and the phone run F4-p3 passes it. Pictures: `F4-d/F4-f4-oft-slots4oft2p-desktop.png`.

## Lesson 32 — the crew list, the warning list and his bell on one man, one day (a disagreement to report)

**Untimed sim whose filing does not offer it (W1d, both sizes).** Ranger filed "Fly only" for Fri 17; planned on an untimed OFT and
an untimed AMT:
- crew list with the seat picked: struck, **"SANS — not offering OFT"** / **"SANS — not offering AMT"** (D2585 — PASS);
- drag hover: "SANS — not offering OFT" under the carried name; drop note: **"Ranger — SANS — not offering OFT"** (AMT likewise);
- warning list: **"No conflicts flagged for Friday ✓"** — no SANS line; his puck: plain, no amber "A";
- his bell (as Ranger): only "SANS Availability · Fri 17 Jul · You were added · Saber" — no reminder (he filed).

**Compare the untimed FLIGHT whose filing does not offer it** (Jester "OFT only", same world): crew list "SANS — not offering Fly";
note and warning list **"Jester — SANS: not offering Fly today. Planned on SSFU (no times yet)"**, amber "A" chip on his puck.
So the warning list raises the amber "not offering" line for an untimed flight but stays silent for an untimed OFT / AMT with the same
kind of mismatch, while the crew list strikes both. The brief says RECORD the warning list here; reported as lesson 32 asks, not judged.
Pictures: `W1d-d/W1d-w1d-f1-drag-stop1-desktop.png` (hover), `W1d-w1d-f1-drag-drop-desktop.png` (note), `W1d-w1d-f1-warn-clip-desktop.png`
(silent list), `W1d-w1d-f2-warn-clip-desktop.png` (the flight's amber line), `W1d-w1d-f1-puck-clip-desktop.png`, `W1d-w1d-l32-bell-desktop.png`;
the phone's the same names under `W1d-p/` (…`-phone.png`).

**Nothing filed (F4, F17, PU — known, not built, D2579):** Ranger in an untimed sim seat or its extras — crew list struck with his
words, his bell counts the day ("You're planned on Fri 17 Jul with nothing filed. Tap to file for availability."), warning list
"No conflicts flagged for Friday ✓". Recorded only; the brief lists the amber line for nothing filed as not built.

**The amber "A" follows the man (F21, RECORDED; A6 is walker B's):** Jester ("OFT only") on a flying AVALON row and a 15:00 flight —
the warning list names only the flight ("SANS: not offering Fly today. Planned on SS21T (T/O 15:00)"), never the AVALON row, but his
puck on the AVALON row wears the same amber "A" chip as on the flight. Pictures `F21-d/F21-f21-jav-puck-clip-desktop.png`,
`F21-f21-jt-puck-clip-desktop.png`, `F21-f21-before-warn-clip-desktop.png`.

## Lesson 33 — each line read as its reader

Every crew-list reason, hover caption and note in these runs states a fact to the scheduler ("SANS from Fri 17 Jul: no availability
filed", "SANS — not offering OFT", "SANS — available 08:00–10:00 only", "SANS — no availability filed for today"); none tells the
scheduler to file — D2587's "File it on the Inputs page's SANS tab." appears nowhere (checked in every note and hover read). Ranger's
own bell line ends "Tap to file for availability." — it speaks to him, as ruled. Nothing found that asks one person to do another's job.

## One row per scenario

| Ids | Size | Result | What the screen said | Pictures (run folder) |
|---|---|---|---|---|
| F1 = A12 (crew list) | D, P | PASS | Fri 17, eight men filed differently. Untimed OFT FCP: Jester (OFT all day) and Bolt (OFT 08:00–10:00) plain; Ranger (Fly), Kraken (AMT), Rebel (Fly 08–10), Zenith (AMT 08–10) "SANS — not offering OFT". Untimed AMT FCP: Kraken, Zenith plain; the rest "SANS — not offering AMT". RCP: Pixel (all three, all day) plain, Otter (nothing) "SANS — no availability filed for today". Timed 13:00–14:00: Bolt "SANS — available 08:00–10:00 only" on the OFT, Zenith the same on the AMT. Ace never any SANS word. Every reason line inside its panel at 402. | W1r-d, W1r-p: `W1r-w1-oft-untimed-FCP-*`, `-amt-untimed-*`, `-oft-timed-*`, `-amt-timed-*` |
| F1 (hover, drop, warning list, puck), A12 | D, P | PASS (crew list, hover); RECORDED (note, list, puck) | hover "SANS — not offering OFT"; note "Ranger — SANS — not offering OFT"; AMT "Ranger — SANS — not offering AMT"; warning list silent; puck plain — see lesson 32 | W1d-d, W1d-p: `W1d-w1d-f1-*`, `W1d-w1d-f1a-*` |
| F2 | D, P | PASS (crew list); RECORDED (rest) | untimed flight: Jester (OFT only) "SANS — not offering Fly"; note and warning list "Jester — SANS: not offering Fly today. Planned on SSFU (no times yet)"; amber "A" | W1r-*: `W1r-w1-fl-untimed-*`; W1d-*: `W1d-w1d-f2-*` |
| F3 = A11 | D, P | RECORDED | OFT with **start 10:00 only** is read as timed: Bolt (OFT 08:00–10:00) "SANS — available 08:00–10:00 only", Jester plain, Otter "SANS — no availability filed for today". OFT with **end 11:30 only** is read as untimed: Bolt plain, Jester plain, Otter struck. The one with neither = the untimed OFT above (D2584 Q5 strike). | W1r-*: `W1r-w1-half-5-*`, `W1r-w1-half-6-*` |
| F4 = A13 (crew list, note) | D, P | PASS | untimed OFT and AMT, nothing filed: front, rear and "+" all strike Ranger "SANS from Fri 17 Jul: no availability filed", Jester "SANS — no availability filed for today", "SANS Avail · 0 free"; with both seats full the "+" (an extra place) strikes the same (D2586); Ranger placed in the OFT's extras: note "Ranger — SANS from Fri 17 Jul: no availability filed"; Jester in the AMT's extras: "Jester — SANS — no availability filed for today"; his bell counts Fri 17 | F4-d, F4-p3: `F4-f4-oft-*`, `F4-f4-amt-*`, `F4-f4-xarm-*`, `F4-f4-xr-note-*`, `F4-f4-bell-*` |
| F11 = A15 | D (mouse), phone-chromium (finger) | PASS | Ranger on SC PM MAIN (placing: "Ranger planned"); carried from the SC seat over the 21:00 flight's FCP and the untimed OFT's FCP: "SANS from Fri 17 Jul: no availability filed" under the carried name, the seat outlined; dropped on the OFT: moved, note "Ranger — SANS from Fri 17 Jul: no availability filed"; carried back over the SC seat: no SANS words, nothing left over; dropped: moved back, no note | F11-d3, F11-pc: `F11-f11-a-stop1/2-*`, `-a-drop-*`, `-b-stop1-*`, `-b-drop-*` |
| F12 = A16 | D, P (board and week) | PASS + RECORDED | Ranger tapped, nothing filed: SC AM SPARE, SC PM MAIN/SPARE (flying by B 12:30), AVALON MAIN/SPARE, BB MAIN ring green; the timed and untimed flights, the 21:00 OFT and the untimed AMT do not. SC AM MAIN not ringed — opened: "crew rest — not clear until 08:10" (no SANS words). Occupied SC seat (Ace) not ringed. Filed Fly+OFT+AMT: the flights and sims ring; filing deleted: unringed again, standby unchanged; AVALON MAIN ticked Flies: still rings. In the week an empty sim row draws only its "+", so its seats read "absent" there. | F12-d, F12-p: `F12-f12-board-*`, `F12-f12-week-nofile-*`, `F12-f12-why-*` |
| F13 + F14 = A14 | D, P (board and week) | PASS | Sat 18, nothing picked: Ranger and Jester drawn struck (dimmed, crossed through), no reason line, the reason only in the hover title; "SANS Avail · 0 free". SC AM MAIN → untimed OFT → untimed flight → 21:00 flight → SC again: Ranger "no SANS words, counted free" / "SANS from Fri 17 Jul: no availability filed, out of the count" / same / same / no SANS words again — "N free" equal to the names drawn free every time (6 / 0 / 0 / 0 / 6); pick cleared: no reason lines. Edit Schedule's crew panel the same. | F13-d, F13-p: `F13-f14-*`, `F13-f13-1…5-*`, `F13-f13-cleared-*`, `F13-f13-wk-*` |
| F16 | D, P | PASS + RECORDED | Bolt (OFT 08:00–10:00) on an untimed OFT: plain, "Bolt planned". 13:00–14:30 typed: "Bolt — SANS: available 08:00–10:00 only. Planned on Sim SS OFT 16 13:00–14:30" arrives, beside "Bolt — Conflict: SDO duty 07:30–17:30 & Sim SS OFT 16 13:00–14:30" (his demo duty); his puck wears the red "C" conflict chip; cleared: both lines gone, puck plain | W1d-*: `W1d-w1d-f16-*` |
| F17 = A17 | D, P | PASS | Thu 16: untimed OFT and SC — Ranger an ordinary pilot, no SANS words. Fri 17 and Sat 18 untimed OFT: struck "SANS from Fri 17 Jul: no availability filed" exactly; SC MAIN: no SANS words (Fri 17 AM: "crew rest — not clear until 08:10"). Edit Schedule week ("+" of the OFT): the same words. Desktop drag over SC MAIN: no SANS words; over the OFT: the exact words; drop note "Ranger — SANS from Fri 17 Jul: no availability filed"; tap-to-plan the same; SC note no SANS words (crew-rest note); Thu 16 SC "Ranger planned". Bell: "You're planned on Fri 17, Sat 18 Jul with nothing filed. Tap to file for availability." — never Thu 16. | F17-d3, F17-p: `F17-f17-16/17/18-*`, `F17-f17-drag-*`, `F17-f17-tap-*`, `F17-f17-bell-*` |
| F20 = A19 | D, P | PASS + RECORDED | untimed OFT FCP: Jester (leave) "local leave (LL)", Kraken (ATT C) "medically down — cannot report to work (ATT C)" — absences first; Marlin "WSO — cannot fly front seat". SC AM MAIN: no SANS words for anyone; Bolt "on SDO duty 07:30–17:30 — inside this shift", Ranger and Zenith "crew rest — not clear until 08:10", WSOs the front-seat rule; "already on SC AM MAIN 07:00–13:00" for Bolt on the next aircraft. No SC-currency line was seen for any SANS man (recorded). | F20-d, F20-p: `F20-f20-oft-*`, `-sc-*`, `-busy-*`, `-oftw-*` |
| F21 = A9 | D, P | PASS + RECORDED | Ranger on SC AM MAIN, AVALON MAIN (Flies) and the untimed OFT; Jester (OFT only) on AVALON (Flies) and a 15:00 flight. Warning list before publishing, after, and with an amendment open: SANS line only for the flight, never SC / AVALON. Publish note: **"Friday published and approved"** — nothing about Ranger on the untimed OFT with nothing filed. View-only Sched as Saber and as Ranger: no SANS words. Ranger's bell counts Fri 17. Amber "A" on Jester's AVALON puck (lesson 32 above). | F21-d, F21-p: `F21-f21-before-warn-*`, `-published-*`, `-after-warn-*`, `-amend-warn-*`, `-view-*`, `-bell-*` |
| F22 | D, P | PASS (P: 3 of 4; F22.4 NOT WALKED) | board: SC MAIN + Ranger → no SANS words (the crew-rest note); untimed OFT + Ranger → "Ranger — SANS from Fri 17 Jul: no availability filed", inside the screen at 402; Edit Schedule: SC MAIN 2 + Jester → "Jester planned"; untimed OFT (week "+") + Otter → "Otter — SANS — no availability filed for today" (desktop) | F22-d, F22-p2: `F22-f22-sc-note-*`, `-oft-note-*`, `-wsc-note-*`, `-woft-*` |
| F23 plain-user round | D, P | PASS + RECORDED | Edit Schedule; Fri 17: Flying wave, + Wave → SC, OFT and AMT rows; Ace into the flying line; Jester onto SC MAIN ("Jester planned", Undo off / Redo back); Ranger onto the untimed OFT ("Ranger — SANS from Fri 17 Jul: no availability filed", Undo / Redo exact); Otter onto the AMT's RCP ("Otter — SANS — no availability filed for today"); times 21:00 / 22:00; OFT cancelled (CX, WX) and un-cancelled; ✓ Done; crew panel opened and closed (phone; on the desktop it is always shown); board reopened; warning list "No conflicts flagged for Friday ✓" (nothing SANS for the SC row); ✓ Done. Ranger: bell "You're planned on Fri 17 Jul with nothing filed. Tap to file for availability." → tapped → the SANS calendar, July 2026, Fri 17's window → closed. | PU-d, PU-p: `PU-pu-1…22-*` |
| N1 | D, P | PASS | Ace (regular) never a SANS word on any seat read (flights, sims, standby) | W1r-*, F4-*, F13-* |
| N2 | D, P | PASS | timed flight: Otter nothing filed struck; Jester "OFT only" "SANS — not offering Fly" + the amber line "SANS: not offering Fly today. Planned on SSFT (T/O 13:00)" + amber "A"; Rebel's window "available 08:00–10:00 only"; Ranger (Fly all day) plain. N9: board Undo takes Jester off — the flight's amber line goes. | W1r-*: `-fl-timed-*`; W1d-*: `W1d-w1d-n2-*`, `-n9-*` |
| N3 | D, P | PASS | timed OFT / AMT: the same three reasons on the sim's own hours (Bolt, Zenith windows; the rest not offering) | W1r-*: `-oft-timed-*`, `-amt-timed-*`, `-oft-win-*` |
| N4 | D, P | PASS | untimed flight: Otter (nothing) struck; Ranger and Rebel (Fly offered) plain; OFT- / AMT-only men "SANS — not offering Fly" (D2585) | W1r-*: `-fl-untimed-*` |
| N12 | D, P | PASS | "SANS — no availability filed for today" letter for letter for Otter on a flight (RCP), a timed OFT / AMT and an untimed OFT / AMT | W1r-*: every `-RCP-*` |
| Week view (W1wk) | D, P | PASS | Edit Schedule's crew panel, pressed in the week: untimed OFT ("+"): Jester plain, Ranger "SANS — not offering OFT", Otter "SANS — no availability filed for today"; AMT: Jester / Ranger "not offering AMT"; untimed flight: Jester "not offering Fly", Ranger plain — the same as the board, inside the panel | W1wk-d, W1wk-p |

## Leads seen in passing — "to check", not filed

1. **Phone: an empty extra place under a seated man takes a press only near its lower edge.** A sim row with both seats full
   (Ace, Hunter): a tap in the middle of the "+" extra place under Ace picks Ace (blue, 11 green "can take" rings) and arms nothing;
   the element under that very point is the extra place itself; a tap 2px above its lower edge arms it (`s:4.oft.2.x1`). On the
   desktop a click arms it. Pictures: `F4-p3/F4-f4-xarm-notarmed-phone.png` (Ace picked after the middle tap),
   `D:/raptor-work/c182-walk/A/probe-pics/probe5c/` (`PR5-pr5-x0-notarmed-phone.png`, `PR5-pr5-tapbottom-phone.png`; the probe's log
   rows `hit` and `tap-bottom`). Reproduce: phone, Fri 17 board, an OFT row, Ace in FCP and Hunter in RCP by tap-to-plan, tap the "+"
   under Ace.
2. **Phone: placing into the second extra place leaves an empty first one.** Because of lead 1 the walk tapped the right-hand extra
   place; the row then holds `more: ["", "bane"]` (desktop: `["bane"]`). Only seen through that route; may be positions by design.
3. **A name carried from the crew list does not scroll the board at its edge.** Held at the bottom edge over the board, it scrolls
   the crew list (`#sbRoster` 0 → 89) and the board stays still; a name carried from a seat scrolls the board (about 800px in 4.5 s).
   So dragging from the crew list to a seat below the screen needs the board scrolled first. May be what D895 means by "its box".
   Probe: `sss-w1A-probe3.mjs`, log rows `bottom*`, `seat*` (pictures in `probe-pics/probe3*`).
4. **Phone, F22.4:** after the board and week tap-to-plan steps, Ranger shows blue (picked) in Edit Schedule's crew panel, and the
   week's OFT "+" tapped twice did not arm. Not reproduced in the other phone runs that press the same "+" (W1wk-p, F17-p, F13-p all
   arm it). Picture `F22-p2/F22-f22-woft-phone.png`.

Also seen, existing behaviour: on a weekend the first man on an untimed OFT gets the OIL note, not his SANS reason ("the OFT sim has
no usable times, so nobody on it earns OIL for this day", F17 Sat 18) — the same note order chat 179 recorded for flights.

## Could not reach, and why
- **F22.4 on the phone** (Edit Schedule, tap-to-plan Otter into the untimed OFT from the week): two attempts, the press did not arm
  (lead 4); stopped there. The week's sim "+" press itself is walked on the phone in W1wk-p, F17-p and F13-p (PASS), and F22.4 on
  the desktop.
- **W1r's week-view sim rows** (NOT WALKED in W1r-d / W1r-p: an empty sim row draws only its "+" in the week, no seat keys) — re-walked
  as W1wk at both sizes (PASS).
- **Phone drags in WebKit** cannot be scripted (walk-scripts §4): F11 was walked by a finger in Chromium at the phone's size; on the
  WebKit phone every placement was tap-to-plan.
- The desktop's Edit Schedule crew panel has no open / close (always shown); opened and closed on the phone only.

## Earlier attempts that were the script's own faults (pictures in `superseded-pics/`, never cited)
- F17-d, F17-d2: one drag from the crew list to two places far apart — the second place was off the screen (and the crew-list drag
  does not scroll the board, lead 3). Fixed: two drags, each target brought into view first (F17-d3).
- F11-d: Ranger seated on SC AM carried a hard crew-rest warning, and the edge-scroll overshot onto a ground row; F11-d2: let go 66px
  from the screen's foot, inside the board's edge-scroll zone, so the board moved before the release ("Ranger removed"). Fixed: SC PM,
  and aim only once the target is clear of both edges (F11-d3, F11-pc).
- F4-p, F4-p2: the tap on the extras picked Ace (lead 1). Fixed: the lower-edge tap (F4-p3).
- F22-p: the phone crew panel left open covered the day card. Fixed in the helper; F22-p2 then met lead 4.

Walk: A — 13 Fable/Astra scenario ids (F1/A12, F2, F3/A11, F4/A13, F11/A15, F12/A16, F13+F14/A14, F16, F17/A17, F20/A19, F21/A9, F22)
+ N1–N4, N12 + the plain-user round, desktop and phone (F11 finger drags in Chromium at phone size); 24 cited runs, 1,077 pictures;
0 FAIL of the app (3 FAIL rows = the script's expectations); 1 lesson-32 disagreement (untimed sim "not offering" — crew list strikes,
warning list and bell silent; untimed flight warns); 4 leads to check; no console errors.
