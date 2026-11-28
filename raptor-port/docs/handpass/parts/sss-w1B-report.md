# Walker B — standby lines / untimed sims walk (his D2584 Q4/Q5, D2585, D2586, D2587), chat 182, 25 Nov 26

Build walked: `D:/raptor-work/c182-build`, served on port 4892; the served page named `index-CRvIUIHo.js` (checked by fetching the
page before the first run, and the page's own script list read in the first probe). Clock started 15 Jul 2026 09:00 and left
running. Every scenario in a fresh browser world, Saber signed in; Ranger posted out as SANS from Fri 17 Jul through the Leave War's
own sheet in each ("On 17 Jul: becomes SANS."). Ipman shows as **Jester** (SANS by tick). Sizes: desktop 1536×1000 Chromium; phone
402×874 WebKit, touch, 3x. Server stopped by its port at the end; every script finished; nothing built, committed or pushed.

**Result: 0 app FAILs against an EXPECTED line. 2 FAIL lines in the logs are the script's own fixture (explained below), and 1
RECORD that I flag as a lead (the amber "A" on his standby puck). No console errors, page errors or failed requests in any
scenario at either size.**

| Final runs | PASS | FAIL | RECORDED | NOT WALKED |
|---|---|---|---|---|
| desktop, all 14 scenarios (`run1-d.log`) | 220 | 1 (script, f10.a6-pucks) | 45 | 0 |
| phone, f5–f10 (`run1-p1.log`) | 133 | 1 (script, f10.a6-pucks) | 20 | 0 |
| phone, f15–plain (`run1-p2.log`) | 87 | 0 | 25 | 0 |
| N9 re-walk, desktop / phone (`run1-n9-{d,p}.log`) | 10 / 10 | 1 / 1 (the "A" lead, see below) | 1 / 1 | 0 |
| phone fit at 402 (`fit-p.log`) | 6 | 0 | 0 | 0 |

## Where everything is

- Scripts (all new, names proved free first): `ROOT/raptor-port/scripts/handpass/sss-w1B.mjs` (the walk), `sss-w1B-lib.mjs`,
  `sss-w1B-env.mjs` (build folder and picture folder from settings, `||=`), `sss-w1B-fit.mjs` (402 fit), `sss-w1B-probe.mjs`,
  `-probe2.mjs`, `-probe3.mjs`, `-probe4.mjs` (route proofs). Built on chat 179's `sns-w1B-lib.mjs` and the w14 helpers, imported,
  never edited. Run: `SZ=d|p SSSB_RUN=run1 [ONLY=f5,f6] node scripts/handpass/sss-w1B.mjs` from `raptor-port/`.
- Pictures (cited): `ROOT/raptor-port/docs/img/handpass/2026-11-25-sans-standby-sim/B/run1/` — 1318 pictures + 799 phone
  tap-at-once pictures in `run1/taps/`; `run1/only-n9/` (102, the N9 re-walk), `run1/fit/` (47), and `B/probe4/` (32, the phone
  extra-place lead). **2,298 pictures cited in all.** Names: `<scenario>-<step>-<desktop|phone>.png`; `-clip-` = cut round his puck,
  the SANS Avail list, the warning list or the note. Per-scenario results as JSON beside them (`results-<scn>-<size>.json`).
- Not cited, moved out of the repo folder (kept, never mixed in): every earlier attempt and probe — `D:/raptor-work/c182-walk/B/attempts/`
  (`try1`, `try2`, `try2p`, `try3`, `try4p`, `probe`, `probe2`, `probe3`).
- Raw logs: `D:/raptor-work/c182-walk/B/` — `run1-d.log`, `run1-p1.log`, `run1-p2.log`, `run1-n9-d.log`, `run1-n9-p.log`,
  `fit-p.log`, `probe*.log`, `try*.log`, `server.log`.

## The table

D = desktop, P = phone; "both" = D and P, same words. R17N = **"SANS from Fri 17 Jul: no availability filed"** (D2587: no full
stop, no "File it…"). TODAYW = "SANS — no availability filed for today". "Plain" = drawn, no SANS words of any kind in his title
or under his name. "Pictures" are in `B/run1/` unless noted; `*` = `-desktop` and `-phone`.

| Ids | Size | Result | What the screen said | Pictures |
|---|---|---|---|---|
| F5 = A10 (+ N12) | both | PASS | Untimed OFT (Sat 18) and AMT (Sun 19): front seat, rear seat, "+ add" on the empty row, and the first extra place once both seats were taken (it is drawn then: "Instructor / observer — tap or drop a puck to fill") — Ranger struck with R17N printed, Jester struck TODAYW printed, letter for letter; "SANS Avail · 0 free". Edit Schedule's crew panel with the week's OFT row and AMT row picked (the week draws a sim row as one "+ add"): the same. | `f5-f5-{oft,amt}-{p,w,x}-sans-clip-*`, `f5-f5-amt-xfull-sans-clip-*`, `f5-f5-e-{oft,amt}-esans-clip-*` |
| F5 drop note | both | RECORDED | Ranger tapped into the untimed OFT front seat (placed): note **"the OFT sim has no usable times, so nobody on it earns OIL for this day"** — no SANS words (no "told on his bell", N10). Into the AMT extra place: **"Ranger — SANS from Fri 17 Jul: no availability filed"**. See Lead 2. | `f5-f5-drop-oft-note-clip-*`, `f5-f5-drop-amtx-note-clip-*` |
| F5 warning list / puck | both | PASS | Warning list after the drop: no SANS line ("▸⚠ 2 issues · 1 warning", neither about him); his OFT puck no amber "A". | `f5-f5-oft-warn-clip-*`, `f5-f5-oft-seated-*` |
| F4 (bell part) + F5 bell | both | PASS | Ranger in the OFT front seat (Sat 18) and the AMT's extra place (Sun 19; he is stored in the row's extras): his bell "You're SANS from Fri 17 Jul." / "You're planned on Sat 18, Sun 19 Jul with nothing filed. Tap to file for availability." | `f5-f5-bell-*` |
| Lesson 32 — F5, one man one day | both | RECORDED | Crew list: struck R17N. Warning list: silent. His bell: names the day. They disagree by design today: the amber line for nothing filed is not built (D2579) — not a finding by the brief. | as above |
| F6 = A1 | both | PASS | SC, AVALON, BB added on Sat 18. SC AM standing by, then flying by B 06:30, then B cleared and R 06:00, SC PM by B 12:30, AVALON overnight 19:00–07:00 by B 18:30, BB (no START/END) by B 07:00: every MAIN and SPARE, FCP and RCP read — Ranger and Jester plain everywhere ("SANS Avail · 6 free" on FCPs, "10 free" on RCPs). Edit Schedule's crew panel on the flying SC MAIN FCP: plain. Rings (Ranger picked, nothing armed): SC MAIN, SC SPARE, AVALON, BB seats all **green**. Tapped in: Ranger onto SC MAIN — note "Ranger planned"; Jester onto AVALON MAIN — "Jester planned". Warning list: no SANS line. Pucks: no "A" (Jester's AVALON puck wears an "L", a long day 18:30 → 07:00 — another rule). His bell: empty. | `f6-f6-{sc0,scB,scR,scPM,av,bb}-*-sans-clip-*`, `f6-f6-e-scB-esans-clip-*`, `f6-f6-rings-*`, `f6-f6-drop-*-note-clip-*`, `f6-f6-warn-clip-*`, `f6-f6-bell-*` |
| F7 = A2 | both | PASS | FLIES ticked on one row only — SC AM MAIN, SC AM SPARE, AVALON MAIN, BB MAIN (START/END blank): the ticked row and its unticked neighbour, plain for Ranger and Jester. Ranger seated on the ticked row ("Ranger planned"), moved to the unticked row (the board's Undo took the first drop back, then tapped onto row 2), his row ticked, unticked, ticked again: at each step his line on the list carries only "already on SC AM MAIN 07:00–13:00" (no SANS), no SANS warning line, no "A" on his puck. Bell: empty. | `f7-f7-5*-sans-clip-*`, `f7-f7-s{1..5}-rcp-sans-clip-*`, `f7-f7-s{1..5}-warn-clip-*`, `f7-f7-bell-*`, `flies01..` clips |
| F8 = A3 (+ N2) | both | PASS | Two worlds: (a) Ranger "OFT only", Jester "AMT only"; (b) Ranger Fly 08:00–10:00, Jester Fly 08:00–09:00. SC AM MAIN and SPARE, AVALON MAIN, BB MAIN, standing by and flying (B typed): plain for both — no "not offering", no "available … only". Control (N2), timed flight 13:00–14:00 FCP: (a) both struck "SANS — not offering Fly"; (b) "SANS — available 08:00–10:00 only" / "SANS — available 08:00–09:00 only". Dropped onto the flying SC and AVALON MAINs: "Ranger planned" / "Jester planned"; no SANS line; no "A". | `f8oft-*`, `f8win-*` (`-sb-`, `-fly-`, `-ctl-`, `-drop-`, `-warn-clip-`) |
| F9 = A4 | both | PASS | SC AM START only, SC PM END only, AVALON 19:00–07:00, BB blank: MAINs and SPAREs plain. FLIES ticked on each: plain. BB activated by a typed B: plain. Every SC and AVALON time then cleared: plain (ticked and unticked rows). Edit Schedule's crew panel on BB MAIN: plain. | `f9-f9-*-sans-clip-*`, `f9-f9-e-bb-esans-clip-*` |
| F10 = A5 (bell) | both | PASS | Sat 18: Ranger on SC AM MAIN (07:00–13:00) and flight T17 (17:00–18:00); Sun 19: SC AM MAIN only. Bell: "…planned on Sat 18 Jul…" (once, never Sun 19). Flight removed (✕): bell empty. Flight put back (new line, Ranger tapped in): Sat 18 again. SC line removed, flight left: Sat 18 still. Notes: SC taps "Ranger planned"; the flight tap "Ranger — SANS from Fri 17 Jul: no availability filed" (D2587's words). | `f10-f10-bell{1..4}-*`, `f10-f10-*-note-clip-*` |
| F10 / A6 (warning list) | both | PASS | "OFT only" filed; Ranger on SC, T17 and a timed AMT: SANS lines name only "Planned on T17 (T/O 17:00)" and "Planned on Sim B AMT 20:00–21:00" — never the SC line. Flight and AMT removed: no SANS line left. | `f10-f10-a6-warn-clip-*`, `f10-f10-a6b-warn-clip-*` |
| F10 / A6 (pucks) | both | script FAIL — superseded by N9 below | The day ran 07:00–21:00, so a long day's **"R"** stood on every puck and no "A" could show. My fixture, not the app. | `f10-f10-a6-seated-*` |
| N9 + A6 re-walk | both | PASS + **RECORDED (Lead 1)** | "OFT only" filed Sat 18 and Sun 19. Sat 18: SC AM MAIN + flight T1530 (15:30–16:30, inside 12 h). Warning list: one SANS line, "Ranger — SANS: not offering Fly today. Planned on T1530 (T/O 15:30)" — none names SC. Pucks: the "A" stands on his flight puck **and on his SC MAIN puck** (script line n9.sat-pucks FAIL; Astra's A6 says RECORD). Sun 19 timed AMT: line "…not offering AMT today. Planned on Sim B AMT 10:00–11:00", "A" on the AMT puck. Flight removed: no SANS line, the "A" gone from his SC puck (it clears — N9). AMT removed: no line. Notes: flight "Ranger — SANS: not offering Fly today. Planned on T1530 (T/O 15:30)", AMT "…not offering AMT…", SC "Ranger planned". | `run1/only-n9/n9-n9-sat-seated-*`, `-sat-warn-clip-*`, `-sun-seated-*`, `-sat2-*`, `-sun2-warn-clip-*` |
| F15 = A18 | both | PASS / RECORDED | Untimed OFT front seat armed: struck R17N → "OFT, all day" filed on the SANS tab, back on the board (no reload): plain → filing deleted: struck → top-bar Undo on Inputs ("Undo — Ranger's SANS Availability", note "Undid: …"): plain. Seated on the untimed OFT (Sat 18) and SC MAIN only (Sun 19): his bell names Sat 18 only; tapped, it opens the SANS calendar on Sat 18's day window. He files OFT all day himself: the reminder goes (Sun 19 never shown). Saber, the OFT's rear seat: "already on this row · not added twice" (RECORDED). He deletes his own filing; app reopened: reminder back, **Sat 18 only, shown as already read** (RECORDED: "[read] You're SANS from Fri 17 Jul. …"), beside "SANS Availability · Sat 18 Jul · Deleted · Saber" and "… You were added · Saber". | `f15-f15-{0..3}-sans-clip-*`, `f15-f15-bell{1,2,3}-*`, `f15-f15-tap-tapped-*`, `f15-f15-filed-x-*`, `f15-f15-final-*` |
| F18 = A8 (+ N11) | both | PASS | A Fri 17 SC SPARE · B Sat 18 AVALON MAIN (FLIES ticked) · C Sun 19 BB MAIN · D Tue 21 untimed AMT rear seat · E Wed 22 timed flight · F Fri 24 untimed OFT, cancelled · G Sat 25 duty desk — Ranger on each; week 2 thereby saved, so the demo's own Mon 20 flights (08:40–10:05, 10:30–11:55) count too. Edit Schedule left on week 1. His bell: "You're planned on **Mon 20, Tue 21, Wed 22 Jul** with nothing filed." — never A, B, C, F or G. Tapped: SANS calendar on Mon 20's window (first listed day). Hex signed in: no line; Saber: no Ranger reminder (N11). D removed: "Mon 20, Wed 22 Jul". | `f18-f18-bell{1,2}-*`, `f18-f18-tap-tapped-*`, `f18-f18-hex-*`, `f18-f18-saber-*` |
| F19 = A7 | both | PASS / RECORDED | Sat 18: standby row and untimed OFT both with Ranger: bell names Sat 18 (the OFT); standby row cancelled — nothing SANS; OFT cancelled — nothing SANS, bell empty. SC flying by B, Ranger on row 2, that row cancelled: nothing SANS, bell still empty. Sun 19: flights ONE and TWO + SC: ONE cancelled → Sun 19 named; both → not; TWO un-cancelled → named; TWO removed by ✕ then the board's Undo brings it back with Ranger → named; removed again → not. A whole formation / wave has no CX of its own (per-line CX only) — RECORDED. | `f19-f19-*-warn-clip-*`, `f19-f19-bell{0,1,2}-*`, `f19-f19-a7-{1..5}-*` |
| A20 (+ N6, N1) | both | PASS | Ranger on a ground row (Fri 17), a new duty desk row (Sat 18), all hands (Sun 19), and an AVALON desk block ("+ Block" offers "SC Shift · 4 roles · SC desk", "AVALON · 4 roles · AVALON desk", "Empty block"): bell empty. An SC wave added on Sun 19 and made to fly: still empty. Duty desk, ground row and all-hands places armed: no SANS words (Ranger "already on … · not added twice" where he already sits). Ace (not SANS) on an untimed flight, untimed OFT and flying SC MAIN: plain. | `a20-a20-*-sans-clip-*`, `a20-a20-bell{1,2}-*`, `a20-a20-block-*` |
| N5 | both | PASS / RECORDED | Ranger on EARLY 08:00–09:00 then SC AM MAIN armed: standing by — "on EARLY 07:00–09:30 — inside this shift"; flying — "already on EARLY 07:00–09:30" (struck, no SANS words). Ace gets the same reasons. | `n57-n57-{sb,fly}-sans-clip-*` |
| N7 | both | PASS | Both double-booked on a flying SC row: Ranger's lines "Conflict: EARLY … & SC AM 07:00–13:00", "Misses EARLY brief 05:40–08:00…", "Misses EARLY debrief…"; Ace has the same lines; no SANS line. | `n57-n57-warn-clip-*` |
| N8 | both | PASS | "Fly + OFT + AMT, all day" filed Sat 18: timed flight, untimed flight, untimed OFT front and extra place, timed AMT, SC MAIN — plain. Seated on the untimed OFT and untimed flight: no SANS line, no "A". Bell: only "SANS Availability · Sat 18 Jul · You were added · Saber" — no reminder. | `n8-n8-*-sans-clip-*`, `n8-n8-warn-clip-*`, `n8-n8-bell-*` |
| N10 | both | PASS | No "SANS — told on his bell" in any note or warning list read in F5, F6, F7, F8 (asserted) or anywhere else seen. | — |
| N11 | both | PASS | See F18. | `f18-f18-hex-*`, `f18-f18-saber-*` |
| Plain-user round (F23) | both | PASS / RECORDED | Saber: Edit Schedule; Sat 18 board: flying line PLAIN 13:00–14:00, + Wave SC, OFT and AMT rows; Ace onto PLAIN ("Ace planned"), Jester onto the untimed OFT (note: the OIL line), Ranger onto SC MAIN ("Ranger planned"); AMT start 10:00 typed; PLAIN cancelled (CX) and un-cancelled; Marlin onto an SC RCP — board Undo ("Undo — a change to the schedule") takes it back, Redo puts it back; Ranger onto the untimed AMT — the same; warning list: nothing SANS on a standby row; ✓ Done closes the board; Edit Schedule's crew panel opened on Sat 18 (nothing picked: Ranger struck, **no reason line**, D2420) and closed; board reopened. Ranger: bell "…planned on Sat 18 Jul…"; tapped — SANS calendar on Sat 18's window; its ✕ closed it. | `plain-pl-{0..12}-*` |
| Fit at 402 (phone) | P | PASS | Board, untimed OFT front seat and extra place armed: 12 printed reason lines, all inside the SANS Avail list (158–388 of 402; Ranger's R17N at 158–311, one line). Edit Schedule, week's OFT row picked: 12 lines inside the panel (162–392). Flying SC MAIN: Ranger plain. | `run1/fit/fit-fit-{oftp,oftx,e}-*sans-clip-phone.png` |

## Lesson 33 (each line read as its reader)

- R17N on the crew list, the struck title and the drop note: the scheduler reads it; it states a fact and no longer tells him to do
  the SANS man's filing. Good.
- His bell's "Tap to file for availability." speaks to Ranger, who files. Good.
- "SANS — not offering Fly today. Planned on T1530 (T/O 15:30)" and "SANS — available 08:00–10:00 only": the scheduler's to act on
  (move him or ask). No line found that tells a scheduler to do a SANS man's job, or the reverse.

## FAILs

**No FAIL of the app against an EXPECTED line.** The two "FAIL" lines in the logs:

1. **f10.a6-pucks (both sizes) — my fixture.** The day ran 07:00–21:00, so a long day's "R" stood on every puck; one letter shows per
   puck, so no "A" could show. Re-walked as N9 on a day under 12 h (below).
2. **n9.sat-pucks (both sizes) — RECORDED as Lead 1** (Astra's A6 asks to record how the "A" is shared; no ruling I was given makes
   it PASS or FAIL).

## Leads for the host (not judged by me)

1. **The amber "A" stands on his standby puck too.** Ranger, "OFT only" filed for Sat 18, on SC AM MAIN (07:00–13:00) and flight
   T1530: the warning list names only the flight ("SANS: not offering Fly today. Planned on T1530"), the crew list on the SC seat is
   plain, but his SC MAIN puck wears the same amber "A" as his flight puck (its hover is the generic "Advisory — … or planned outside
   SANS availability"). It goes from the SC puck once the flight is removed. Lesson 32: three surfaces disagree about the SC row.
   Whether a SANS advisory may mark a standby puck at all under D2584 Q4 ("never raise an amber SANS line for him") is the host's
   call. Reproduce: post Ranger out from Fri 17; file "OFT only" for Sat 18; + Wave → SC and a flying line T/O 15:30 LD 16:30 on
   Sat 18; tap Ranger into SC AM MAIN FCP and the flight's FCP; look at the SC row. Pictures:
   `run1/only-n9/n9-n9-sat-seated-desktop.png` (SC row at the top, Ranger's puck with "A" at about x 450–525, y 270–290; flight
   at y 750–770; the warning list at the top right), `…-phone.png`, and `n9-n9-sat2-seated-*` (after the flight is gone, no "A").
2. **The first drop onto an untimed sim seat shows the OIL line, not the SANS sentence.** Tapping Ranger (nothing filed) into the
   empty untimed OFT's front seat leaves "the OFT sim has no usable times, so nobody on it earns OIL for this day"; a later drop on a
   row that already said so (the AMT's extra place) leaves "Ranger — SANS from Fri 17 Jul: no availability filed". D2587 lists "the
   drop's note" among the places R17N must read; walker A owns the note, so I only record it (chat 179 saw the same on an untimed
   flight). Pictures `f5-f5-drop-oft-note-clip-*`, `f5-f5-drop-amtx-note-clip-*`, `plain-pl-3-jester-note-clip-*`.
3. **On the phone's engine (WebKit) a finger's tap on a sim's extra place ("+", instructor / observer) picks nothing.** Probe4, same
   board, three presses each: WebKit — tap at the place's middle: not picked (twice: the locator's tap and a raw touch at its
   middle; `elementFromPoint` there is the "+" itself); a script click: picked. Chromium with the same phone size and touch: all three
   picked. Other places (seats, "+ add" on an empty row) take a tap in WebKit. Not this change's code, and it may be the test
   browser's touch rather than his iPhone — worth a look on his phone. The phone walk then picked that place by a script click and
   says so on each line ("tap did NOT arm it — script click used"). Pictures: `B/probe4/p4-p4-*-phone.png`,
   `p4-p4-*-phonechromium.png`; log `D:/raptor-work/c182-walk/B/probe4-p.log`, `probe4-pc.log`.
4. **(minor, to check)** On the phone's Edit Schedule, a tap on the week's sim row once both its seats were taken picked nothing
   (fit try 1, `D:/raptor-work/c182-walk/B/fit-p.log` history; the tap probably landed on a puck). Not pursued.

## Console errors

None. Every scenario's "console / page errors / failed requests" check passed at both sizes, in the final runs, the N9 re-walk,
the fit run and every probe.

## Script faults met on the way (fixed; their attempts are not cited)

1. A sim row on the Edit Schedule week has no seat boxes — one "+ add" (`[data-fill]`); reads moved there (try1).
2. "+ add" on an empty sim row fills the front seat; the extra places appear only once both seats are taken (`.x0`, `.x1`) — F4 walked
   on those (probe3).
3. The board's Undo is greyed after Saber signs out to read Ranger's bell (the list clears at sign-out, D148): F10's "restore" became
   a new line, and A7's Undo moved before the bell read (try3).
4. An occupied seat's box press lands on the man's puck: F7's "move" became the board's Undo of the first drop, then a tap on row 2.
5. The SANS amber is the "A" letter; a puck's "L" (long day) or "R" (crew rest / long day) was first counted as amber — judged
   only on "A" since (try2, f10).
6. A first N9 day on Fri 17 met the demo's Thursday landing 18:10 (crew rest "R"); moved to Sat 18 / Sun 19.

## What I could not reach, or did differently

- **Drag hover** (F8's "hover", F11-type hovers) is walker A's; every drop in my scenarios is tap-to-plan (seat pressed, name pressed)
  at both sizes.
- **A7 "cancel a whole formation"**: the board draws a CX per line only — no formation or wave CX — so it is the one-line flight's CX.
- **F18's seven days** straddle two weeks; editing week 2 saves it, so the demo's Mon 20 flights count (expected, named in the check).
- **A18 "reopen the app"**: done by a reload and a fresh sign-in (the sign-in is not kept over a reload).
- **N5 leave and crew-rest reasons**: walked the "already busy" reason only (EARLY 08:00–09:00); a leave input was not filed.
- The phone runs were split into two processes (f5–f10, f15–plain) beside the desktop run; walker A's port and files were not touched.

Pictures saved and cited: **2,298** (`B/run1/` with `taps/`, `only-n9/`, `fit/`: 2,266; `B/probe4/`: 32). Earlier attempts:
1,221 pictures moved to `D:/raptor-work/c182-walk/B/attempts/`, not cited.
