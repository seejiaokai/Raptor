# Walk brief — OIL Earn on the Scheduler Board (D1782, D1783, D1793): walkers W1 and W2 (Sonnet 5.5)

Chat 5, 8 Nov 26. Read `raptor-port/docs/walk-scripts.md` whole before writing a script. The evidence sheet is
`raptor-port/docs/handpass/2026-11-08-oil-earn-board.md` (the host fills it; you fill only your report).

## The machine's traps (you load none of the host's memory)

- Windows, Git Bash. Write every script to a file with the file tool and run it from there; never pass a script inline
  to the shell (backslashes are lost, an apostrophe fails). Never rewrite a script and run it in one step. Print a
  version line at the top of every run. In Node edit scripts use `s.replace(a, () => b)`.
- Run from `raptor-port/` by its full path: `cd "C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port"`.
- **Serve no server.** The build is the frozen folder `C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/e324d8f6-0c85-4339-be37-1d188075a056/scratchpad/dist-a827307a5` (commit `a827307a5`) — never `raptor-port/dist`, never a rebuild; serve it inside each browser context with
  `serveDist(ctx, origin, folder)` from `scripts/drawcheck/lib.mjs` (it answers every request to `origin` from the
  folder). Use your own origin: W1 `http://localhost:4381`, W2 `http://localhost:4382`. Take `chromium` and `webkit` from
  the same file.
- His iPhone: WebKit, `{ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }`,
  taps by `locator.tap()`. His PC: Chromium, `{ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 }`, mouse
  and keys. A fresh context per scenario; nothing shared between worlds.
- The clock: `await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })` before the first page load, and left
  running.
- Sign in: `#luser` `ad`, `#lpass` `a`, `#loginForm button[type=submit]`; wait for `#vWeek .day` (attached).
- **The route every scenario starts from — driven by the host and passing:** the `open`, `oilOn`, `reachSwitch` and
  `reachInert` functions of `scripts/drawcheck/specs/oil-earn-board.mjs`. Copy them; do not re-derive them. Saturday 18 Jul
  is day 5; `window.openScheduler(5)` after `window.go('editsched')` opens its board. Saturday's SDO desk (Fable, 08:00–18:00)
  has its END box at `[data-bfld="dr:5.0.0.end"]`; on a phone clear it by setting the value and sending `input` and
  `change` (never type into it on an emulated phone); on the PC click it, Backspace, Tab.
- The passing note is `#toastEl`; read its text within about 400 ms of the press, and picture it then.
- "Picked" (selected) shows as the blue fill on every puck of that man (or placeholder); each wears the class `sel`.
  Read it as `document.querySelectorAll('#schedBoard .puck.sel').length` — 0 when nobody is picked. There is NO
  `window.SELID` (it reads undefined whatever happens: never use it).
- Stop and report after 3 failed attempts at one gesture. Stop every browser you started before you report. Send your
  report ONCE, to the file named below; your hand-back message is five lines.

## Scope, pictures, judging

- One picture per assertion that matters, taken right after the press (and the settled one after 1 s on the phone),
  cropped to the area judged plus its surroundings; saved under `docs/img/handpass/2026-11-08-oil-earn-board/<w1|w2>/`,
  named `<scenario>-<size>-<what>.png`.
- A scenario with an EXPECTED line is PASS or FAIL. "RECORD exactly what it says" scenarios are RECORDED with the exact
  words and a picture. Do not judge whether a recorded wording is good.
- Your report: `docs/handpass/parts/2026-11-08-oil-earn-<w1|w2>.md` — a table: scenario, size, PASS / FAIL / RECORDED,
  what the screen showed in words, the picture's file. Then every FAIL in detail: the steps, what you expected, what you
  saw. Then anything odd you saw that no scenario asked about.

## W1 — the switch, the phone bar, the plain-user round (both sizes unless marked)

- **W1.1 (phone) the bar at rest:** board on Saturday, OIL Earn off. EXPECTED (D1793): the day bar reads THIS DAY, then
  Templates with a small page-of-blocks mark before the word, then OIL Earn with a small ticket mark before the word, on
  one row; both buttons the same height. Tap Templates: its menu opens; close it by a tap outside it. Tap OIL Earn:
  the mode comes on.
- **W1.2 the switch, by the words:** mode on. EXPECTED (D1782): a slider with the words "No OIL earned", grey. Press the
  words. EXPECTED: the slider lights cyan; under the bar exactly "Nothing on this day earns OIL. Turn off the switch and
  each man earns as he did before."; Fable's puck on the SDO desk no longer shows as earning. RECORD the passing note.
- **W1.3 the switch, by the slider:** press the slider itself. EXPECTED: off — grey, the note gone, Fable earning again.
  RECORD the passing note. Each press changed the day exactly once (on, then off — never on-and-back).
- **W1.4 (PC) by the keys:** Tab until the switch has the keyboard (picture the ring), Space. EXPECTED: on, the note
  shown, and the keyboard still on the switch afterwards (its ring visible; `document.activeElement` is the switch's
  box). Space again: off, the keyboard still there.
- **W1.5 Undo and Redo:** switch on, then the board's Undo. EXPECTED: off, the note gone. Redo: on again.
- **W1.6 a man under the switch:** switch on, tap Fable's puck. EXPECTED (D845): passing note exactly "Nothing on this
  day earns. Turn off the switch first."; nobody picked; nothing changes.
- **W1.7 another day and back:** switch on Saturday; go to Sunday (the board's next-day arrow on a phone, Sunday's chip
  on the PC), then back. EXPECTED: Sunday's switch off; Saturday's still on.
- **W1.8 out of the mode and in again:** switch on, press "✓ OIL done", then OIL Earn again. EXPECTED: the switch still
  on, its note shown.
- **W1.9 a published day:** find a day of the week whose head wears ORIG or an AL tag (published). On its board, OIL
  Earn on, switch on. RECORD exactly the day's pending count before and after, and what the bar and the note show. Switch
  off: RECORD the count again.
- **W1.10 the plain-user round:** in the mode, open the ALL AVAIL window from a placeholder's count if the day has one
  (RECORD if none), switch to its OIL tab, close it by its ✕; open it again and close it by Escape. Leave the mode by
  "✓ OIL done", close the board by "✓ Done", reopen Saturday's board: the switch as you left it. Picture each.

## W2 — a tap on a puck that cannot earn (both sizes)

- **W2.1 the open end (D360):** the SDO desk's END cleared (the route above), OIL Earn on, tap Fable's puck. EXPECTED
  (D1783): passing note exactly "Nothing changed for Fable. No OIL worked out — this row has no end time."; nobody picked
  (no `.puck.sel`). On the PC, RECORD the puck's hover title.
- **W2.2 no working hours:** clear both the SDO desk's START and END, OIL Earn on, tap Fable. EXPECTED (D1783): "Nothing
  changed for Fable. This row gives him no working hours to count OIL from."; nobody picked.
- **W2.3 a cockpit seat:** on any day with a flying line, clear that line's take-off and landing through the board's own
  boxes, OIL Earn on, tap one of its crew. RECORD exactly the note; EXPECTED nobody picked and nothing changes.
- **W2.4 a Personal Inputs row and a Common Programme row:** in the mode, tap a man whose puck on such a row is drawn
  faded (cannot earn) — open the Personal Inputs panel if it is folded. RECORD exactly the note for each; EXPECTED nobody
  picked.
- **W2.5 an event switched off:** in the mode, switch off an event's own OIL mark (the small OIL mark on its row), then
  tap a man on it. EXPECTED: "This event earns nobody any OIL. Turn the event back on first."; nobody picked.
- **W2.6 a placeholder:** a row with ALL or ALL AVAIL on it, in the mode: tap its count — EXPECTED the ALL AVAIL window
  opens. Close it. Tap the placeholder's puck itself (not the count). RECORD exactly the note; EXPECTED nobody picked.
- **W2.7 the ALL AVAIL window's man that cannot earn:** with the SDO END cleared, open the window from a placeholder on a
  row (if any), its OIL tab; tap a man drawn faded there. EXPECTED (D65): nobody picked; RECORD the footer's words.
- **W2.8 outside the mode:** OIL Earn off, tap Fable's puck. EXPECTED: he is picked as always (his pucks wear `.sel`) —
  the change must not reach outside the mode.
- **W2.9 a man who CAN earn still switches:** OIL Earn on, END not cleared, tap Fable. EXPECTED: his earning turns off
  (the puck shows it), a passing note says so (RECORD its words); tap again: on.

## Two starting worlds

- **The fresh world** (the route above, no saved state, your own origin): W1.1–W1.8, W2.1, W2.2, W2.8, W2.9 — Saturday
  holds only Fable on the SDO desk. Use it wherever a scenario names Fable on the SDO desk.
- **The saved Saturday** — `docs/handpass/state-sat.json`, loaded as the context's `storageState`; it is keyed to the
  origin `http://localhost:4173`, so serve the frozen build at THAT origin with `serveDist` in that context (each walker
  its own browser context, so the two never share storage; serve no real server). Checked by the host on this build:
  Saturday comes up with 26 men, 19 event OIL marks, an ALL AVAIL with its count (28) on the Common Programme, sim rows,
  flying lines, three Personal Inputs men, and three faded pucks (Warden and Outlaw on duty rows, Vandal on a ground
  row). No day of the week is published in either world: publish Saturday with `publish(page, 5)` from
  `scripts/handpass/lib.mjs` (it picks the four sign-offs, then Publish day) — read it, copy its steps.
- A request you need (leave, medical, Personal, an overseas duty) that the world lacks is filed through the app's
  own Inputs page — the worked example is `openNew` / `fileInput` in `scripts/handpass/aa-B-lib.mjs`; read them first.
  If filing fails three times, report NOT WALKED with why.

## Astra's scenarios — each placed (her report: `docs/superpowers/briefs/2026-11-08-oil-earn-board-scenarios-astra.md`; read each one there before walking it)

**W1 adds** (both sizes unless marked; the saved Saturday unless it names Fable's SDO):
- **A5 + A6** — publish Saturday; RECORD its pending count and sign-offs; switch on: RECORD the count, the sign-offs,
  Fable's / the men's figures on the board; switch off: EXPECTED back to nothing pending (D98) — RECORD the sign-offs.
  Do NOT publish an amendment (the credit after publication is not changed by this build — see "Not walked").
- **A11** — switch on, leave the mode, add Bane to a new 08:00–18:00 ground row, re-enter: EXPECTED his puck does not
  earn and a tap says "Nothing on this day earns. Turn off the switch first."; switch off: RECORD whether he earns.
- **A12** — Undo and Redo after each of: the switch, an event's OIL mark, a man's switch; and after a refused tap
  (a faded puck, a puck under the switch): EXPECTED the refused tap adds NO Undo step (count the Undo presses back).
- **A13** — the switch: words once, slider once, then two quick presses on the slider (< 300 ms apart): EXPECTED each
  press changes the day once (two quick presses: back where it started); one Undo undoes one press.
- **A14** (PC, keys only) — Tab to the switch, Space, Space; then Space then Tab at once; Shift+Tab; Enter: RECORD what
  Enter does. EXPECTED Space changes once and the keyboard ring stays on the switch; Tab then moves on normally.
- **A15** — the switch on Saturday, off Sunday: Sat → Sun → Sat; leave and enter the mode; ✓ Done and reopen; reload
  the page, sign in, reopen Saturday: EXPECTED each day keeps its own switch. RECORD whether the mode stays on across a
  day change.
- **A24** — sign out, sign in as `us` / `us` (a member): open Saturday on View-only Sched and its board if offered:
  EXPECTED no OIL Earn, no switch. As `ad`: View-only Sched — EXPECTED no switch.
- **A25** — open the ALL AVAIL window (the placeholder's count) and the changes window (the board's History clock) at
  once over the board; press the switch; tap a faded puck: EXPECTED the note is visible (not under a window), the press
  reaches only what was pressed, the windows stay open.
- **A26** — on the PC hover the switch's words: EXPECTED "Anything added to this day later earns no OIL either.";
  RECORD both passing notes (on, off).
- **A27** (phone) — tap Templates on its mark and on its word, OIL Earn on its mark and on its word: each opens. Turn on
  the board's desktop layout (its ⋯ menu): RECORD the bar.

**W2 adds** (both sizes; the saved Saturday):
- **A1 — the fix, walked:** file a leave (LL) and a medical (OML) for Saturday for two men, and a Personal 10:00–11:00
  for a third; in the mode tap each under Unavailable / Personal Inputs: EXPECTED nobody picked (no `.puck.sel`) and
  "Nothing changed for <callsign>. Leave earns no OIL." / "… A medical request earns no OIL." / "… A personal request
  earns no OIL."; outside the mode RECORD what the same tap does.
- **A2 — the fix, walked:** every ALL / ALL AVAIL body you can find on Saturday's rows (Common Programme first; put one
  on a duty desk's extras and a ground row through the board if allowed — RECORD if refused): in the mode tap the BODY:
  EXPECTED nobody picked, "Nothing changed for ALL AVAIL. The people behind it are switched in the window its count
  opens."; with the switch on: "Nothing on this day earns. Turn off the switch first."; tap its COUNT: EXPECTED the
  window opens.
- **A3** — the window from a placeholder's count, its OIL tab: tap a man drawn faded (or RECORD none); then with the
  switch on tap a man: RECORD the footer's words and the passing note; EXPECTED nobody picked.
- **A8** — a man with an overseas duty (OD) or a Training under Unavailable / Personal Inputs that CAN earn: in the mode
  switch him off and on, Undo, Redo: EXPECTED it works (he is not faded); with the day switch on: D845's words.
- **A9** — with the switch on: tap a named man on the Common Programme, the row's event OIL mark, and a man in the ALL
  AVAIL window: EXPECTED all three "Nothing on this day earns. Turn off the switch first."; nothing changes.
- **A10** — switch one man off, then the day switch on, tap him, the day switch off: EXPECTED he is still off; then
  switch an event off and tap its men: EXPECTED "This event earns nobody any OIL. Turn the event back on first."; event
  back on: EXPECTED each man as before.
- **A17** — the duty desk's extras (if a man is there) and the desk set 08:00–08:00: RECORD what a tap says.
- **A18** — a sim row with a seat, a passenger, extras: clear its END: tap each: EXPECTED nobody picked, the open-end
  sentence each time.
- **A19** — a Common Programme row and a Ground Programme row with both times cleared: tap a man on each: EXPECTED
  "… This row gives him no working hours to count OIL from."
- **A21** — a ground row cancelled (its CX) and one made information-only (its ⓘ): tap its man: RECORD the note;
  EXPECTED nobody picked.
- **A23** — a faded puck: tap its letters, its edge and any warning mark on it: EXPECTED the same note each time, nobody
  picked; then pick a man outside the mode first, enter the mode, tap a faded puck: RECORD whether the earlier pick
  stays lit.

**Not walked, with the reason (the host writes these into the sheet's §9):** A4 (issued crowd vs working crowd — the
count and window code are untouched by this build; the count is caught before the new branches, pinned by a test);
A7 (a shared input's one answer — the engine and the window are untouched; the new taps write nothing); A16 (which
days offer OIL Earn — the gate is untouched, pinned by OIL1 and OIL18); A20 (a default-off seat stays switchable — the
earning test `oilEligible` is untouched; W2.9 walks a switchable seat); A22 (a multi-day input's reason — the reason
paths are untouched but for the plain sentence; RECORD if met); A28 (amounts and credit — no figure or credit code
changed), and A5's publication of an amendment for the same reason.
