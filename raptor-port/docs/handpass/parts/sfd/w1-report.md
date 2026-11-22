# w1 — SANS from its date (D2313): S1, S8, S3, S4, S7 — walker report, 22 Nov 26

Build `dist` of `bf333f432`, served on 4321 (stopped by its port at the end). Scripts: `scripts/handpass/sfd-w1.mjs` (+ `-lib`,
`-s7`), follow-ups `sfd-w1-warn.mjs`, `sfd-w1-view.mjs`, `sfd-w1-phonepics.mjs`; probes `sfd-w1-probe*.mjs`. Pictures:
`docs/img/handpass/2026-11-22-sans-from-date/w1/` (`<scn>-<step>-<desktop|phone>.png`; phone "right after the tap" pictures in
`taps/`; result logs `results-*.json`). Final runs: desktop S1+S8 (v1; `s1d`), desktop S3/S4/S7 (v1/v2), phone S3/S4/S7/S1+S8 (v2, one run,
85 PASS / 0 FAIL), plus three short follow-up scripts. Every state was made by the app's own controls (+ Item, a tap on the row then
his puck, the Leave War's cell → ⋯ → Post out → SANS → Post out, Quals ✎ Edit and the SANS cell, top-bar Undo/Redo, "Undo post out").
Clock installed before load and left running; each step logs the app's own today. Console / page errors / failed requests: none, all runs.

## Results (each line desktop AND phone unless said)
**S1 (clock Wed 22 Jul) — PASS both sizes.**
- Sat 18 Jul, board: Hex in "WSOS · 16 FREE", no purple line on the row puck (W1 GROUND) or the crew list; "SANS AVAIL · 0 FREE".
  `s1-05-board-sat-desktop.png`; phone with the AIRCREW drawer open `s1pp-sat-crew-closeup-phone.png`, row `s1pp-sat-row-phone.png`.
- Sat, Edit Schedule: day card puck regular; crew panel stepped to Saturday: WSOs column, regular. `s1-05-week-sat-*`, `s1-05-panel-sat-*`.
- Sat, ALL AVAIL window (chip "45"): lists Hex under "WSOs · 17", no purple line. `s1-05-availwin-sat-desktop.png` / `-phone.png`.
- Available crew (folded): Sat "45 ALL DAY · 0 SANS OFFERING"; Mon 20 "27 ALL DAY · +16 1ST WAVE · 0 SANS OFFERING" (Hex filed no
  SANS availability, so he is never counted either way). `s1-05-avail-5-*`, `s1-05-avail-0-*`.
- Mon 20 Jul, board: "SANS AVAIL · 0 FREE" with Hex struck there, purple line on all three copies (RU flying RCP seat, W1 GROUND, crew
  list); "WSOS · 11 FREE". `s1-05-board-mon20-desktop.png`; phone drawer `s1pp-mon20-crew-phone.png`.
- Mon 20, Edit Schedule card (2 copies) and crew panel: SANS, purple line. `s1-05-week-mon20-*`, `s1-05-panel-mon20-*`.
- On each day the row puck, the crew list and the ALL AVAIL window agree with one another.
- RECORD peek: the desktop's next-week preview on the demo week draws no puck of Hex on Mon 20 at all (`s1-06-peek-desktop.png`);
  the phone draws no peek.
- RECORD as Ranger, View-only Sched: Sat 18 regular (`s1-07-view-sat-*`); Mon 20 two copies, both SANS (`s1-07-view-mon20-*`).
- RECORD posting sheet line: "On 20 Jul: becomes SANS." (`s1-04-postout-sheet-*`).

**S8 (same world) — PASS both sizes.** (a) reload + sign in, (b) sign out and in, (c) next week and back (board › from Sunday,
‹ from Monday): every read as in S1, Sat regular / Mon SANS (`s8-a-*`, `s8-b-*`, `s8-c-*`). (d) "Undo post out" on the 20 Jul
sheet (`s8-d1-posting-sheet-*`): RECORD — Hex is a regular on every day, Mon 20 included (no purple line, WSOs column; on Mon 20 the
board's Available crew list now also holds him, which is why the row count goes 2 → 3); Quals SANS cell empty (`s8-d3-quals-*`).

**S3 (clock Wed 15 Jul, Tally = `nick`) — PASS both sizes.** After the untick: Mon 13 and Tue 14 under SANS Avail with purple line;
Wed 15 and Thu 16 in WSOs, no purple line (`s3-04-day0..3-*`). Undo: SANS on all four (`s3-06-*`). Redo: as after the untick
(`s3-08-*`). Reload: unchanged (`s3-09-*`).

**S4 — PASS both sizes.** Posted Wed 15 → next day untick: Tue 14 regular, Wed 15 SANS, Thu 16 regular (`s4-03-*`). Next day re-tick:
Tue regular; Wed, Thu, Fri SANS — no gap (`s4-05-*`; Quals record keeps the posting's date 2026-07-15). Second world (posting from
Thu 16, today Wed 15): Wed/Thu/Fri all regular today (`s4b-03-*`); one day on: Wed regular, Thu SANS (`s4b-05-*`). RECORD his Leave
War row today: hatch from 16 Jul with PO in each cell, balance "−2" (`s4b-02-lw-row-*`).

**S7 (clock Wed 15 Jul) — PASS both sizes, with RECORDs.** Quals ✎ Edit: Basher's SANS ticked then unticked, his CAT box IW → OCU,
Done closes edit (`s7-01/02/04/05-*`). Posting sheet with SANS picked, closed by ✕, Escape and a tap outside: gone each time,
nothing saved (`s7-06-sheet-*`, `s7-07-closed-*`). Hex ticked SANS today; Mon 13: seated in a new line's RCP seat (+ Line), no SANS
warning for him (`s7-09-mon-seated-*`). RECORD Thu 16: he already sits in a flying RCP seat in the demo week (RU, slot 3.1.1.0) and
the warning list names him in nothing — no amber "outside SANS availability" (`s7-10-thu-seated-*`; whole list read by
`sfd-w1-warn.mjs`: 6 issues, none for Hex). RECORD bell: "Nothing new". RECORD change history, All changes, Week: "Wed · Quals ·
Hex · Saber · 15/7 09:00 · SANS — → yes" (`s7-12-history-*`). RECORD Inputs calendar Thu 16: four inputs, Hex not among them;
SANS calendar Thu 16: Zenith only (`s7-13-*`, `s7-14-*`) — known, already filed. Member Ranger ticked his own SANS on Quals (✎ Edit
shown to him): it took, from 15 Jul; RECORD his pucks on View-only Sched: Mon 13 regular, Thu 16 SANS (`s7-15-*`, `s7-16-*`).

## Findings
None against an EXPECTED line. Two leads for the host, not findings:
1. S7 Thursday: the brief expects the amber "outside SANS availability" advisory for a SANS man with no availability filed; the
   screen shows none (`s7-10-thu-seated-desktop.png`). The engine's own comment says a man with nothing filed is deliberately silent
   (only "not offering" / "outside the window" raise it) — so the brief's expectation, not the app, looks wrong; for the host to rule.
2. Seen in passing, to check (not SANS): the day card says "Monday Jul 13 · Today" whatever the clock (15 or 22 Jul); the member's
   top bar showed "Sync · slow" (`s1-07-view-mon20-desktop.png`).

## What a person might trip on
On the phone the board's crew list lives behind the AIRCREW tab, so the SANS line on Mon 20 is only seen once the drawer is opened.

## Lessons of §7.11
1 the state table: each scenario reads every surface on each day state. 2, 7, 13, 20, 21, 26 gestures/pinch/drag: none in these
scenarios (taps only). 3 after each press the result screen pictured. 4 board covers its page; the ALL AVAIL window read while the
board stays live. 5, 15, 24, 31 bars/scroll/125%: not this change. 6 nothing handed to the phone. 8 no drawing. 9 crew-list headings
recorded each day. 10 not walked (page hidden/shown). 11 not applicable. 12 posting sheet opened from its cell only (its one door). 14
no keyboard walk. 16 no refusals. 17 Available crew fold pressed both ways. 18 no print. 19 posting sheet closed by ✕/Escape/outside
on both sizes. 22 reads by drawn boxes; close-ups for the purple line. 23 the posting sheet is the cell's ruled window. 23b not measured.
25 his puck in a flying seat, a ground row, sims and the crew list. 27 not measured. 28 phone pictures after each tap (`taps/`). 29 the
clock moved past midnight with the page open (S4), each reading followed without a reload. 30 tap pictures taken; no pinned-cell check.

## Not walked
Lesson 10 (hidden page); the peek on the phone (it has none); the "Sync · slow" lead; no extra designer scenarios arrived.
One script slip: the version line was bumped once with `sed -i` on my own script (no other file touched).
