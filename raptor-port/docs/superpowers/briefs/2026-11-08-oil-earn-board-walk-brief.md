# Walk brief — OIL Earn on the Scheduler Board (D1782, D1783, D1793): walkers W1 and W2 (Sonnet 5.5)

Chat 5, 8 Nov 26. Read `raptor-port/docs/walk-scripts.md` whole before writing a script. The evidence sheet is
`raptor-port/docs/handpass/2026-11-08-oil-earn-board.md` (the host fills it; you fill only your report).

## The machine's traps (you load none of the host's memory)

- Windows, Git Bash. Write every script to a file with the file tool and run it from there; never pass a script inline
  to the shell (backslashes are lost, an apostrophe fails). Never rewrite a script and run it in one step. Print a
  version line at the top of every run. In Node edit scripts use `s.replace(a, () => b)`.
- Run from `raptor-port/` by its full path: `cd "C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07/raptor-port"`.
- **Serve no server.** The build is the frozen folder the host names below; serve it inside each browser context with
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

## Astra's scenarios

(The host adds them here, each to W1 or W2, before the brief leaves.)
