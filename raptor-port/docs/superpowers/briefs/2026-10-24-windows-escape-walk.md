# Brief — the walker of the windows-and-Escape batch (24 Oct 26)

You are a Sonnet 5.5 walk helper (D588, D787). You DRIVE the real built app in a real browser and report what the screen
did. You do not read code to find bugs, you do not decide whether a finding is real, and you change no file of the app.
The host opens your pictures and reproduces every finding.

## What changed (so you know what to look at)

1. Seven windows now **take the keyboard when they open and keep it**: Tab and Shift+Tab go round inside the window and
   never reach the page behind; the window's ✕ is the LAST Tab stop. The seven: Duty templates, Day templates, Plans,
   Flying waves (the template and plan windows), Week insights, a request's own window opened from Edit Schedule's week or
   the Scheduler Board, and the document viewer.
2. **Escape closes** Duty templates, Day templates, Plans, Flying waves and Week insights (the request window and the
   viewer closed on Escape before). When one of them is open over the Scheduler Board, Escape closes ONLY the window —
   the board stays open.
3. When such a window closes, **the keyboard goes back to the button that opened it** — and where the window was opened
   from a small menu (the board's "+ Block", Templates, "+ Wave", the plans selector), to the button that opened the menu.
4. **The strip over the crew list** ("Planning FCP · VL BFM", shown when an empty seat is picked) now shows a callsign or
   mission typed on that line AFTER the seat was picked, without picking the seat again.
5. **Must not:** a request's window on the **Inputs page** is a window the page behind still works with (owner D641) — it
   must NOT hold the keyboard there.

## Read first

- `raptor-port/docs/walk-scripts.md` §3 to §7 — how a walker's script is written and the traps that cost earlier walks.
- `raptor-port/docs/handpass/README.md` — the driver's own traps.

## The served build

One frozen build of the branch's head, served by the host at `http://localhost:4296` (its page names `index-BfCwF2UF.js`).
Do not build, do not start or stop any server, do not run `npm test` or the browser test suite: the PC's check lock is the
host's. Never rebuild.

## How to drive

- The driver is `raptor-port/scripts/handpass/lib.mjs` (`open`, `login`, `go`, `board`, `tap`, `type`, `shot`, …). Set
  `process.env.HP_URL` and `process.env.HP_SHOTS` at the top of your script, THEN load the driver with
  `await import('file:///C:/Users/User/projects/Raptor/.claude/worktrees/lw-phone-pinch-zoom-3fc08a/raptor-port/scripts/handpass/lib.mjs')`
  — on Windows the path must be a `file:///` address, or node refuses it.
- Each scenario opens its own fresh browser context (`open({ width, height })`). Sign in as `ad` / `a` (admin) — `open()`
  does this.
- **Keys are real key presses:** `page.keyboard.press('Escape')`, `page.keyboard.press('Tab')`,
  `page.keyboard.press('Shift+Tab')`. To start from a button with the keyboard on it: `locator.focus()` then
  `locator.press('Enter')`, or `focus()` then `click()`.
- After each step, read where the keyboard is: `page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ' ' + [...a.attributes].map(x => x.name + '=' + x.value).join(' ') : null })`
  and print it beside your judgement. "The keyboard is inside the window" means
  `document.querySelector('<the window box>').contains(document.activeElement)`.
- Sizes: desktop 1440×900; phone 402×874 with touch — make that context yourself the way `open()` does (same browser
  fallback, same error watching, the same `*{scroll-behavior:auto !important}` style, then `login`), adding
  `hasTouch: true, isMobile: true`, and press with `page.touchscreen.tap(x, y)` at the centre of what you mean, after
  checking its box is on screen — never a scripted scroll-into-view click on a phone (walk-scripts §4).
- **On the phone, take a picture right after each tap, while the touched look is still held, as well as the settled one**
  (owner D1281): name them `<id>-<step>-tap-phone.png` and `<id>-<step>-phone.png`.
- Write every script to a file with the file tool and run it from there; never pass a script inline to the shell. A
  script's rewrite and its run are never in one step. Put a version line at the top of each run.
- Watch the page's errors (the driver collects them): any console error, page error or 4xx is a finding.

## Known traps in the drivers (met by the host's short walk tonight)

- The board is drawn inside `#schedBoard`; its "+ Block" is `[data-dwadd="0"]:visible` (one on screen).
- The small menus ("+ Block", Templates, "+ Wave", the plans selector) are not keyboard menus: open one with the keyboard
  on its button (focus, then Enter), then press its item with a CLICK (`.wavemenu [data-…]`). That is older behaviour, not
  under test — do not report it.
- The menus' items: "+ Block" → pencil `[data-blkedit]`; Templates → `[data-daytpledit]` (Manage templates),
  `[data-daytplsave]` (+ Save this day as a template); "+ Wave" → `[data-wvedit]` (⚙); the plans selector
  `[data-planmenu="0"]` → `[data-plandup]` (+ Alt Plan), `[data-planmanage]` (Manage plans), `[data-planedit]` (a plan's
  pencil). "Manage plans" shows only once the day has plans — press "+ Alt Plan" first.
- The windows: `#tplModal`, `#daytplModal`, `#draftsModal`, `#waveTplModal`, `#insightModal` (each `.modal-box` inside),
  `#inpEditPop` (its box `.inpedbox`), `#docViewPop` (its box `.docviewbox`). A closed one is in the page with `hidden`.
- A request's window opens from an input's label on the week or the board: `[data-inpedit]` (Personal Inputs).

## Scenarios — desktop 1440×900, admin

Each: EXPECTED, then PASS / FAIL with the observed values. For each held window also press Tab 25 times and Shift+Tab 5
times, checking after each press that the keyboard is still inside the window (print the first press that leaves it).

- **D1 Duty templates from the board.** Edit Schedule → open Monday's board → focus "+ Block", Enter → click the pencil.
  EXPECTED: the window is open, the keyboard inside it; Tab holds; Shift+Tab from the first control lands on the ✕
  (`#tplClose`); Escape closes it; the board is still open; the keyboard is on "+ Block" (`data-dwadd="0"`).
- **D2 Day templates from the board's Templates button.** Focus the board's Templates button (`#sbTpl`), Enter → click
  Manage templates. EXPECTED: as D1, the keyboard back on `#sbTpl` after Escape, the board open.
- **D3 Day templates by "+ Save this day as a template".** From the board's Templates button → "+ Save this day as a
  template". EXPECTED: the window opens on the new template, keyboard inside; Escape closes it; the template is in the
  Templates menu when it is opened again; the keyboard was back on `#sbTpl`.
- **D4 Plans from the week.** Close the board. On Monday's day head press the plans selector, "+ Alt Plan" (two plans
  appear). Focus the plans selector, Enter → Manage plans. EXPECTED: held; Escape closes it; the keyboard is on Monday's
  plans selector (`data-planmenu="0"`) in the week.
- **D5 Plans by a plan's pencil, a name half typed.** Plans selector → a plan's pencil → in the name box type " X" at the
  end (do not press Enter) → Escape. EXPECTED: the window closes; the plan's name in the plans menu is UNCHANGED (Escape
  puts a box back, it does not save). RECORD also what the plans menu shows.
- **D6 Flying waves from the board.** Open the board → focus "+ Wave" (`[data-wvadd="0"]`), Enter → click ⚙
  (`[data-wvedit]`). EXPECTED: held; Escape closes it, the board open, the keyboard on "+ Wave".
- **D7 Week insights over the board.** Board open → focus its Insights button (`#sbInsights`), Enter. EXPECTED: held;
  Escape closes Insights only, the board open, the keyboard on `#sbInsights`.
- **D8 Week insights from the top bar.** Board closed, Edit Schedule → focus the top bar's Insights (`#insightBtn`),
  Enter. EXPECTED: held; Escape closes it; the keyboard on `#insightBtn`. Then the same on View-only Sched.
- **D9 The Admin page's three buttons.** Admin → "Duty templates…" (`#admDutyTpl`), "Day templates…" (`#admDayTpl`),
  "Wave templates…" (`#admWaveTpl`): focus each, Enter. EXPECTED: each window opens held; Escape closes it; the keyboard
  back on the same Admin button.
- **D10 A request's window from the week.** Edit Schedule, a day with Personal Inputs: focus an input's label
  (`[data-inpedit]`), Enter. EXPECTED: the window opens, the keyboard inside its box; Tab holds; Escape closes it; the
  keyboard goes back to that label (or, if the week was redrawn, to the same input's label on screen — RECORD which).
- **D11 A request's window on the Inputs page — must not hold.** Inputs page → open any input's window (its row or card).
  Put the keyboard in the window's first box, press Tab 40 times. EXPECTED: at some press the keyboard LEAVES the window
  into the page (the page behind works with it, D641) — PASS if it leaves, FAIL if it never does.
- **D12 The document viewer.** Give an input a document first with the app's own controls (on the Inputs page, a
  medical input's window → its Document row → choose a small PNG with `setInputFiles` → Save), then press that row's
  paperclip ("View the document"). EXPECTED: the viewer opens, the keyboard inside; Tab holds; Escape closes it. If you
  cannot make the document in three tries: NOT WALKED, with why.
- **D13 A question sheet still gives the keyboard back.** Open Monday's board; on a flying line press its CX (the
  cancel-reason dialog `#cxPop` opens). EXPECTED: the keyboard is in the dialog; press its ✕; the keyboard is back where
  it was before (print it before and after). Then the board's "Sort all" dialog the same way.
- **D14 The strip over the crew list.** Edit Schedule week: on Monday's first flying line empty the front seat if needed
  (drag the man off or use its ✕), then press the empty front seat. EXPECTED: the crew panel's strip reads
  "Planning FCP · <the line's callsign and mission>". Then type a new callsign `ZZTOP` in that line's callsign box and
  leave the box (Tab). EXPECTED: the strip now reads `ZZTOP` in place of the old callsign, the seat still picked. Then the
  same on the Scheduler Board's crew list.

## Scenarios — phone 402×874, touch

- **P1 Duty templates on the board.** Open Monday's board, tap "+ Block", tap the pencil. EXPECTED: the window stands in the
  middle of the screen (D997), wholly on screen; the page behind did not scroll (compare `scrollY` before and after);
  no text box has the keyboard (`document.activeElement` is not an INPUT or TEXTAREA — a phone would pop its keyboard);
  tap ✕: it closes, the board still open.
- **P2 Plans from the week.** As D4 by taps (Manage plans). EXPECTED: as P1; close by ✕.
- **P3 Week insights by ⋯.** Edit Schedule week → the ⋯ button → Insights. EXPECTED: opens, no text box focused; ✕ closes.
- **P4 A request's window from the week.** Tap an input's label. EXPECTED: opens in the middle, no text box focused, the
  page not scrolled; ✕ closes.
- **P5 The strip on the board.** Board → tap an empty front seat → RECORD the strip's words; then type `ZZTOP` in the
  line's callsign box and tap elsewhere → EXPECTED: the strip shows `ZZTOP`.

## Break tests

- **B1** D1's window: press Escape twice quickly. EXPECTED: the window closes, the board stays open after the second
  Escape only if the board itself closes on Escape — RECORD what the second Escape did (the board's own Escape is older
  behaviour).
- **B2** D1's window: click inside the window's empty space (its body, not a control), then Escape. EXPECTED: it closes.
- **B3** Open Duty templates, close it by ✕ (a click), then open Day templates by the board's Templates button and close
  by Escape. EXPECTED: the keyboard on `#sbTpl`, never on "+ Block".
- **B4** D7 then D1 in a row without closing the board: EXPECTED: each Escape closes only its window.

## Judging

- A scenario with an EXPECTED line is PASS or FAIL; RECORDED only where the scenario says RECORD. Print the observed
  value beside every judgement.
- One picture for each assertion that matters, named `<scenario id>-<step>-<width>.png`, taken AFTER the step leaves on
  screen what it asserted. Open every picture you cite.
- A step whose own set-up could not act is NOT WALKED, with why — never FAIL.
- Stop and report after three failed attempts at one gesture.

## Folders

- Pictures: `raptor-port/docs/img/handpass/2026-10-24-windows-escape/A/`
- Scratch (scripts, logs): `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-lw-phone-pinch-zoom-3fc08a/84f89913-b550-4648-8408-0f7a9aea102e/scratchpad/walk/A/`
- Your report: `raptor-port/docs/handpass/parts/2026-10-24-windows-escape-A.md` — a table, one row per scenario: id · size ·
  what you did · what the screen showed (the observed values) · PASS / FAIL / RECORDED / NOT WALKED · picture(s). Then:
  errors seen; anything that surprised you, one line each.

Send your report ONCE, after stopping every script and browser you started. Your hand-back message is a short summary:
counts of PASS / FAIL / RECORDED / NOT WALKED, and each FAIL in one line.
