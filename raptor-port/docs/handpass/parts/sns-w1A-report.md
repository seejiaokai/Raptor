# Walker A — report (D2573: a SANS man struck on a flying seat with no times yet), chat 179, 25 Nov 26

Build walked: the frozen `D:/raptor-work/c179-build`, served on port 4881 (`index-DmZtA8E3.js`, proved in the page — row
`bundle` of the first probe). Clock 15 Jul 26 09:00 (the library's `run`). Each scenario in a fresh browser context.
Sizes: desktop 1536 × 1000 Chromium; phone 402 × 874 WebKit, touch, 3x; finger drags in Chromium at the phone's size
(402 × 874, touch, 3x, "phone-chromium") because WebKit's in-page touches drive no drag (walk-scripts §4) — said per row.
Server stopped at the end (port 4881 free).

**On-screen name:** the seed man `ipman` shows on screen as **Jester** (callsign) — every "Ipman" in Fable's list is Jester
here. Ranger posted out SANS from Fri 17 Jul through the Leave War posting sheet in each scenario that needs him.

Scripts: `C:/Users/User/projects/Raptor/raptor-port/scripts/handpass/sns-w1A.mjs` (the walk), `sns-w1A-lib.mjs`,
`sns-w1A-env.mjs`, `sns-w1A-batch.sh`, probes `sns-w1A-probe.mjs`, `-probe2.mjs`, `-probe3.mjs`.
Pictures (cited runs only): `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-25-sans-notimes-strike/A/<run>/`
(652 pictures, 114 MB; phone taps' "right after the lift" pictures in each run's `taps/`). Picture names below are inside
their run folder. Raw logs and per-run results JSON: `D:/raptor-work/c179-walk/A/` (`<run>.log`, `results-*.json`).
Uncited earlier attempts (script faults, listed at the end) moved whole to `D:/raptor-work/c179-walk/A/superseded-pics/`,
probes to `D:/raptor-work/c179-walk/A/probe-pics/` — never mixed with the cited runs.

**Totals (cited runs):** 1 FAIL that is the app's behaviour (F1.2, the note after the first tap on a weekend's blank
line — below), 1 FAIL that is the same cause seen through a move (A-S16 S16.1, its note only), 1 FAIL of the same kind
on a weekday in the week view (F5.9, a different newer warning). Everything D2573 itself promises — the strike, the
reason under the name, the count, the drag hover, the rings, the bell agreeing — PASSED at both sizes. No console
errors, page errors or failed requests in any cited run.

## The FAILs, with how to reproduce

### F1.2 (Fable F1) — on a weekend, the first man tapped onto a blank flying line gets the OIL note, not his SANS reason
- Run `F1-d` and `F1-p`. Saber; Ranger posted SANS from Fri 17; Sat 18 → board → + Wave → Flying wave (no times) →
  tap its FCP → tap Ranger.
- He lands in the seat (never refused) — PASS F1.1. The crew list before the tap strikes him with "SANS from Fri 17 Jul:
  no availability filed. File it on the Inputs page's SANS tab." — PASS F1.0.
- The note raised by the tap is **"the SNSA line has no usable times, so nobody on it earns OIL for this day"** (the
  only words written to the note, three writes). Fable's EXPECTED: "Ranger — SANS from Fri 17 Jul: no availability
  filed. File it on the Inputs page's SANS tab."  Pictures `F1-f1-tap-note-desktop.png`, `F1-f1-tap-note-phone.png`
  (taps/ holds the phone's instant picture). The same by drag (F1.4, desktop, `F1-f1-drag-drop-desktop.png`): hover shows
  his reason under the carried puck, the drop's note is the OIL one.
- **Why, as read on screen:** the no-times OIL warning is a NEW warning made by that very placement, and a newer warning
  takes the note before the SANS reason (Astra's A-S02 says exactly this: "Existing new warnings take priority").
  Proof both ways:
  - same line, OIL warning already up (Ace placed first), Ranger tapped into RCP → note "Ranger — SANS from Fri 17 Jul: …"
    — PASS F1.6 (both sizes, `F1-f1-tapw-note-*.png`), drag F1.7 PASS (desktop);
  - a weekday (Mon 13, no OIL) blank line, Jester the first man on it, by drag → note "Jester — SANS — no availability
    filed for today" — PASS F5.6 (desktop `F5-d3/F5-f5-b-drop-desktop.png`, phone-chromium `F5-pc3/F5-f5-b-drop-phone-chromium.png`);
  - CONTROL, a TIMED Sat 18 line, first man → the SANS note (probe2 `ct.pick`, both sizes, `D:/raptor-work/c179-walk/A/probe-pics/probe2-*/probe2-ct-note-*.png`).
- So the strike and reason are right everywhere; only on a weekend or holiday blank line does the first placement's
  note say the OIL fact instead of the SANS reason. Host to judge: FAIL against Fable's EXPECTED line, PASS against
  Astra's A-S02 (no newer warning). The OIL note was there before this build (c174 recipe P7 records the same note).

### A-S16 S16.1 — moving Ranger onto an empty blank line (Sat 18): the note is the OIL one
- Run `S16-d`, `S16-pc`. Ranger in a timed SNST FCP, Ace in blank SNSB, SNSC empty; drag Ranger SNST → SNSC.
- Hover over SNSC carries his full reason (PASS part); moved (seats T "" C "bane"); note **"the SNSB line and the SNSC
  line have no usable times, so nobody on them earns OIL for this day"** — same cause as F1.2 (SNSC newly staffed makes
  the OIL line new). Astra's EXPECTED "matches a direct crew-list placement": a direct tap onto that empty line gives the
  same OIL note (F1.2), so by Astra's wording this matches. Pictures `S16-s16-move-stop1-*.png`, `S16-s16-move-drop-*.png`.

### F5.9 — Edit Schedule week: drag onto a Mon 13 blank line's RCP, the note names a double turn
- Run `F5-d3`, desktop. Hunter placed in SNSC FCP first; Jester dragged from the crew panel to SNSC's RCP in the week.
- Hover: "SANS — no availability filed for today" under the carried puck, the seat outlined (`dragover-why`) — right;
  placed (seat "ipman"). Note: **"Saber, Echo, Piston, Relay, Jester — 5 people are double turning: …"** — a newer
  warning (the blank line read against Mon 13's demo flights) outranks the SANS reason. Pictures
  `F5-d3/F5-f5-d-stop1-desktop.png`, `F5-d3/F5-f5-d-drop-desktop.png`. Not a D2573 strike fault; the same note order.

## One row per scenario

| Ids | Size | Result | What the screen said | Pictures (run folder) |
|---|---|---|---|---|
| F1 = A-S02 | desktop, phone | F1.0 PASS · F1.1 PASS · **F1.2 FAIL** (see above) · F1.3 PASS · F1.4 PASS (drag, desktop) · F1.5 PASS · F1.6 PASS · F1.7 PASS (drag, desktop) | armed: Ranger struck, "SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab."; first tap: OIL note; second-man tap/drag: "Ranger — SANS from Fri 17 Jul: …" — the crew list's words; note fits the phone; board Undo empties the seat | F1-d, F1-p: `F1-f1-arm-clip-*`, `F1-f1-tap-note-*`, `F1-f1-tapw-note-*`, `F1-f1-drag*-stop1/drop-desktop` |
| F2 = A-S05 + A-S04, F10 (board half) | desktop, phone | PASS F2.1–F2.7, F2.9–F2.11; F2.8 RECORDED; F2.12 NOT WALKED; F2.13 desktop NOT WALKED, phone PASS by picture (see note) ; F2.14 PASS | nothing picked: Ranger struck, no reason line (D2420); FCP picked: Ranger and Jester struck with their reasons, every unfiled SANS pilot "SANS — no availability filed for today", SANS WSOs "WSO — cannot fly front seat"; Bolt (filed Fly all day) plain, first, "SANS Avail · 1 free" both picked and not; reason lines inside the panel; RCP the same; Marlin (SANS WSO) on RCP: "SANS — no availability filed for today" (RECORDED); pick cancelled → reasons gone, count same; Edit Schedule's crew panel (seat pressed in the week) identical | F2-d, F2-p3: `F2-f2-unpicked-*`, `F2-f2-fcp-*`, `F2-f2-rcp-*`, `F2-f2-cancel-*`, `F2-f2-wk-*`, `F2-f2-dl-*` |
| F4 = A-S07 | desktop (F4), phone (A-S07) | PASS F4.a–F4.g both sizes | struck, the same sentence at: no times; 13:00/14:00; both cleared; landing only; take-off only; take-off cleared, landing, take-off restored; R and B boxes typed 12:00 with take-off/landing blank. Stored values read back each step | F4-d, F4-p: `F4-f4-a…g-clip-*` |
| F5 = A-S01 | desktop (mouse), phone-chromium (finger) | PASS F5.1–F5.8 both; **F5.9 FAIL** (desktop, note only — above) | over the blank seat: carried puck reads "SANS — no availability filed for today", seat outlined as a warning; over a ground row: words gone, no outline; over nothing: no words, no outline; let go over nothing: nothing placed, no note; drop on blank seat: placed, note "Jester — SANS — no availability filed for today"; seat-to-seat to a second blank line: same hover, moved, same note | F5-d3, F5-pc3: `F5-f5-a-stop1/2/3-*`, `F5-f5-b-drop-*`, `F5-f5-c-stop1/drop-*`, `F5-f5-d-*` |
| F9 = A-S03 | desktop, phone | PASS all (board and week, both sizes) | Jester tapped, nothing filed: no green "can take" ring on any flying seat — blank, timed, or occupied (Ace / Hunter) — while a duty desk zone rings; Fly all day filed for him: every flying seat rings, occupied included; filing deleted: flying rings gone again | F9-d, F9-p2: `F9-f9-board-nofile-*`, `F9-f9-week-nofile-*`, `F9-f9-*-filed-*`, `F9-f9-board-unfiled-*` |
| F11 = A-S15 | desktop, phone | PASS F11.a, F11.b, F11.c, F11.d1, F11.d2; F11.a2, F11.b2 RECORDED | leave (LL all day): Jester's line "local leave (LL)", not SANS; placed → note and warning "Jester — On leave + planned: SNSA (no times yet)"; whole-day Meeting: "SANS — no availability filed for today" (the timed control the same) — note: the Meeting landed ON the Ground Programme by itself ("SNS MEETING" with Jester), so "not on the Ground Programme" could not be staged; ATT C (the Inputs page has no kind named downchit; ATT C, medically down, stands in): "medically down — cannot report to work (ATT C)"; ALL AVAIL in FCP: struck "cannot crew a jet; name the people flying it", tap refused, seat empty, note "ALL AVAIL — cannot crew a jet…"; Marlin FCP "WSO — cannot fly front seat" | F11-d/p, F11b-d/p, F11c-d2/p: `F11-f11-a-*`, `F11-f11-a-warn-clip-*`, `F11b-f11-b-*`, `F11c-f11-c-*`, `F11-f11-ph-*`, `F11-f11-allavail-note-*` |
| F16 | desktop, phone | PASS F16.1, F16.3; F16.2 RECORDED | Jester seated on the blank Sat 18 line: warning list "2 issues · 1 warning" = the OIL no-times line and "Not published yet…", nothing about his filing; his puck on the week: class "puck san" (the usual SANS edge), no chip, no amber ring; Publish day → "Saturday 18 Jul published and approved. The SNSA line has no usable times, so nobody on it earns OIL." | F16-d, F16-p: `F16-f16-warn-clip-*`, `F16-f16-puck-clip-*`, `F16-f16-published-*` |
| F17 + A-S18 | desktop, phone | PASS F17.1–F17.3 | on the published day, a seat armed and the pick cancelled: pending 0 → 0, sign line unchanged; View-only Sched: no crew list, no SANS sentence; Ranger signed in (View-only Sched, Inputs, Quals… — no Edit Schedule): no crew list, no SANS sentence. Saber's "member view" and a published-version view: NOT WALKED (no door found — see below) | F16-d, F16-p: `F16-f16-read-*`, `F16-f17-view-*`, `F16-f17-ranger-*` |
| A-S06 | desktop, phone | PASS all 8 seats both sizes | SNSA aircraft 1 and 2 (the formation's +), the + Line line (unnamed), a Night wave line (unnamed, no times): each FCP and RCP strikes Ranger with his full reason; Marlin (SANS WSO) FCP "WSO — cannot fly front seat", RCP "SANS — no availability filed for today" | S06-d, S06-p: `S06-s06-5000p-*` … `S06-s06-5100w-*` |
| A-S16 | desktop, phone-chromium | **S16.1 FAIL** (note only, above); PASS S16.2–S16.4; S16.5 RECORDED | move timed→blank: hover his reason, moved; Undo back, Redo forward; swap with Ace (blank SNSB): both kept, swapped, note "Ranger — SANS from Fri 17 Jul: …"; Undo / Redo of the swap exact. Templates menu: "+ Save this day as a template", "Manage templates" | S16-d, S16-pc: `S16-s16-move-*`, `S16-s16-swap-*`, `S16-s16-redo1/2-*`, `S16-s16-templates-*` |
| A-S20 | desktop, phone | PASS S20.1–S20.4, S20.6; S20.1b, S20.5 RECORDED | timed ground row, no-times ground row, a new duty desk row, an all-hands row: Ranger plain under SANS Avail, no SANS reason; placed: "Ranger planned"; he holds all hands, a duty row and a ground row on Sat 18; his bell: empty (no reminder) | S20-d, S20-p: `S20-s20-g1/g2/d/a-*`, `S20-s20-bell-*` |
| A-S21 | desktop, phone | PASS S21.1–S21.6; S21.7 RECORDED | a new pilot "Thunderstrikes" (14 letters), SANS ticked on Quals: struck "SANS — no availability filed for today", the reason inside the panel (the puck itself cuts his name to "Thunderstri…", pucks never wrap); the board search "Ranger": Ranger shown struck with his reason, picked from there (note: the OIL one, weekend first man); times typed, Undo ×2 / Redo ×2 exact; a filing started for Ranger and cancelled: nothing saved, strike unchanged on return | S21-d2, S21-p2: `S21-s21-arm-clip-*`, `S21-s21-search-*`, `S21-s21-redo-*`, `S21-s21-cancel-*`, `S21-s21-after-*` |
| Plain-user round | desktop, phone | PASS PU.1–PU.9, PU.11–PU.14; PU.4 note RECORDED; PU.10 RECORDED | Edit Schedule; Sat 18 flying line, no times; seat tapped: Ranger struck with his reason; his name tapped: placed, note "the SNSPU line has no usable times…" (weekend first man, as F1.2); 13:00 / 14:00 typed; Undo (landing off), Redo (back); board closed with ✓ Done; reopened for Sat 18; warning list: "1 issue" — "Not published yet…"; closed with ✓ Done; Ranger's bell: "You're SANS from Fri 17 Jul." / "You're planned on Sat 18 Jul with nothing filed. Tap to file for availability." (unread); tapped: the SANS calendar on July 2026 with Sat 18's window; closed | PU-d2, PU-p2: `PU-pu-1…14-*`, taps/ for the phone |

Notes on the table:
- **F2.13 (phone, A-S04, Desktop layout via ⋯ → "Desktop layout"):** the script's measure said "outside its panel"
  because it judged the line against the phone's screen width; in that layout the day is wider than the screen and pans
  sideways (its own note says "Desktop layout: pan sideways to read the whole day"). The line's box equals its panel's
  box (742–1037) and the picture shows the whole reason wrapped inside the panel: `F2-p3/F2-f2-dl-phone.png`,
  `F2-f2-dl-clip-phone.png`. Judged PASS by the picture; F2.14 (nothing over his name) PASS.
- **F2.12 (A-S05, the crew panel's day arrows):** while a seat is armed the Edit Schedule crew panel shows no ‹ › day
  arrows (its heading "Tap a name to plan · Saturday"), so the list cannot be stepped to another day while picking — the
  "list follows a different day" case cannot arise. Picture `F2-p3/F2-f2-noarrows-phone.png`, desktop `F2-d/F2-f2-wk-desktop.png`.

## Could not reach, and why
- **A-S04 desktop, narrowing / widening the board's crew panel:** no control to resize it was found on screen; read at its
  own width (F2.6 PASS).
- **A-S16 saved plans and day templates:** not walked — the Templates menu was read (S16.5) but saving a day as a
  template, applying it to another day and crewing it was not driven; plans duplication not driven. Moves, swaps,
  Undo / Redo were walked at both sizes.
- **A-S18 Saber's member view and the published-version view:** no door found by this walk; not walked.
- **F11 (b) "a Meeting not on the Ground Programme":** a whole-day Meeting filed on Inputs went onto Sat 18's Ground
  Programme by itself, so the "not on the Ground Programme" set-up could not be made; the SANS reason was read with it there.
- **"Downchit":** the Inputs page offers no kind of that name (it offers ATT C, ATT B, Upchit …); ATT C stood in.
- **Phone drags in WebKit:** cannot be scripted (walk-scripts §4); every phone drag was walked in Chromium at the phone's
  size with real fingers over CDP (F5, A-S16), said per row.

## Leads seen in passing — "to check", not filed (not D2573)
1. **The phone board's ⋯ menu draws UNDER the AIRCREW drawer** when the drawer is out: its items (the layout switch
   among them) are hidden behind the drawer and could not be tapped (the first attempt's tap timed out). Pictures:
   `D:/raptor-work/c179-walk/A/superseded-pics/F2-p2/F2-f2-more-under-drawer-phone.png` and
   `…/superseded-pics/F2-p/F2-ERR-phone.png`. Reproduce: phone, Sat 18 board, open AIRCREW, press ⋯.
2. **The phone board reopened from Edit Schedule with its AIRCREW drawer already out** (row F2.12b of the superseded
   `F2-p2` run, `F2-f2-reopen-phone.png`). May be by design (it remembers); to check.

## Earlier attempts that were the script's own faults (pictures moved to `superseded-pics/`, never cited)
- F2-p, F2-p2: the ⋯ press hit the drawer (lead 1), then the Desktop layout hid the AIRCREW tab the helper waited for.
- F5-d, F5-pc, F5-d2, F5-pc2: a page-side helper name, the phone ghost's class name, the drawer not reopened before the
  second finger drag, and the note watcher missing the same words written twice (fixed: every write is now counted).
- F9-p: the board selection was never let go (the press went to a closed drawer), so the week's tap took it OFF —
  its two FAILs were the script's; the rerun F9-p2 passes.
- F11c-d: the type list has no "down" kind (ATT C used). S21-d/p: the new-person form needs a CAT. PU-d/p: "board closed"
  read whether the board existed instead of whether it showed (pictures showed it closed; reruns PU-d2/p2 pass).

Walk: A — 13 scenario ids + plain-user round, desktop and phone (finger drags in Chromium at phone size); cited runs 27,
652 pictures; 3 FAIL rows (all the passing note's order, F1.2 / S16.1 / F5.9), the strike itself PASS everywhere;
no console errors.
