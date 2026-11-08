# The walk of the board's layout — the walkers' brief (chat 11, 8 Nov 26)

The change walked: pull request 689, branch `claude/pr-board-layout-62eb71` — the pictures round's group 1 for the
Scheduler Board (D1780, D1781, D1771). Evidence sheet: `raptor-port/docs/handpass/2026-11-08-board-layout.md` (its §2 is
the roll-call each walker fills its rows of). Three Sonnet walkers, each in its own browser world; the host (Opus) opens
every picture that decides something and reproduces every finding before it counts.

## What changed (the rulings, in the app's words — the EXPECTED lines come from these, never from the build)

- **D1781:** on the desktop Scheduler Board from 821 to 1099 wide, each jet's line puts its remarks on a row of their own
  and stacks R over B and TO over LD as a phone does, so every part of the line is in reach and the remarks get over 300px;
  from 1100 wide the times stay in one line, R · B · TO · LD (D1029). A standby wave (SC, AVALON, BB) reads R · B · START ·
  END (D1085) and must stack the same way.
- **D1780:** on a phone on its side (821 wide or more, a touch screen, under 500 tall — his iPhone is 874 × 402), the
  board's Calendar, title, day strip and search scroll away with the list, as any page does, while its bar of buttons stays
  at the top (about 51px), so with the keys up the list gets about 151px and nothing jumps when the keys open (D1081,
  D1412: the box tapped rises in step with the keys; nothing else jerks). At rest (not scrolled) the board looks exactly as
  before. The crew and issues column on the right stands under the bar. A window that opens below the board's bar
  (D1106 — the changes window, ALL AVAIL, Insights) opens just below the bar wherever it is. A jump to a row (a warning's
  tap, a change's tap in the changes window, Undo/Redo when the change is out of view — D672) lands the row below the bar,
  never under it. Nothing pinned leaks: the bar shows none of the list behind it or through gaps (D1518). A puck dragged to
  the edge scrolls the board (D895 §5A).
- **D1771 (with D1646):** under the keyboard (Tab, arrows), an item of the board's ⋯ menu and of the week's ⋯ menu keeps its
  raised row and wears the app's cyan ring (2px, inside the row's edge); + Block, Templates, + Wave, the plans selector, a
  jet's stores button and the phone day bar's buttons wear the cyan ring just outside them. Pressed by a mouse or a finger:
  no ring at all. The browser's own white/black ring must never show on these.
- **Must not change:** the board at 1100 wide and wider (A4); the board's phone layout at 820 wide and narrower (A5); the
  desktop layout switch on a phone (`.sb-wide`, A6, B13 — its own pinch-zoom scroller, D1107, D1109); Edit Schedule's week,
  View-only Sched, the next-week peek (A7); a phone upright (B10); a desktop with a mouse at any size (B11); a tablet on its
  side taller than 500 (B12).

## What is NOT a finding (D56, D785)

- A problem that lives only in data already stored is not a finding — the store is demo data, cleared before the
  database step. Only report it if new data made through the controls is hurt too.
- A scheduler is always an admin: never set up a scheduler who is not an admin.
- An older fault met in passing, outside these surfaces: note it in one line under "met in passing", do not chase it.

## How every walker works — read this first

1. Read `raptor-port/docs/walk-scripts.md` whole before writing your script (how a walk script and its pictures are written,
   and the traps each has cost). Then write ONE script, `raptor-port/scripts/handpass/bl-walk-<your letter>.mjs`, run it with
   `node scripts/handpass/bl-walk-<letter>.mjs` from `raptor-port/`, and save pictures to
   `raptor-port/docs/img/handpass/2026-11-08-board-layout/walk/<letter>/`, numbered in order (`001-…png`).
2. **The build is already served at `http://localhost:4180/`** (the rebased branch, built 11:50). **Never build or run a
   command that builds:** no `npm run build`, no `npx playwright test`, no `npm run test:e2e`, no `vite build`. The checks
   lock is held by the host for this walk. Never stop or start a server.
3. Browsers: `import { chromium, webkit } from '@playwright/test'`; Chromium with the repo's fallback —
   `const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'; chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})`;
   WebKit with `webkit.launch()`. Each scenario in a fresh context (its own saved data).
4. Sign in through the real form: `#luser` = `ad`, `#lpass` = `a`, click `#loginForm button[type=submit]`, wait for
   `#vWeek .day`. Never print the password in a picture or the report.
5. **Press the real controls, as a person would.** Never call the app's own functions (`window.go`, `openScheduler`, …) to
   reach a state. Edit Schedule is a page name in the top bar (on a phone held sideways it is inside the ☰ side menu,
   D1643). The board opens by pressing a day's date at the top of its card on Edit Schedule (`#eWeek .sb-open[data-sbday]`).
   You MAY read the page (computed styles, bounding boxes, `elementFromPoint`) to measure and assert.
6. The board's parts: `#schedBoard` (its window), `.schedboard` (the board), `.sb-top` (the whole top: head + bar),
   `.sb-title`, `#sbDays` (the day chips, desktop look), `#sbCal`, `.sb-hl` and `.sb-actions` (the bar's two parts),
   `#sbMore` (⋯) → `#sbMoreMenu` with `.sb-moreitem` items, `#sbTpl` (Templates), `#sbHist` (History), `#sbInsights`,
   `#sbDone` (✓ Done), `#sbWarn` (the day's issues), `.sb-side` (the crew and issues column), `.sb-boardwrap` (the list),
   `#sbBoard .sb-line` (a jet's line) with `.sb-rb` (R and B), `.sb-tl` (TO and LD), `.sb-rcell` (remarks), `.lctl` (the
   line's buttons); + Block `[data-sblkadd]` / `[data-dwadd]`, + Wave `[data-wvadd]`, the plans selector `.planselbtn`, a
   jet's stores `.stcfg`, the phone day bar's buttons `.mbtn.daybtn`. The week's ⋯ on Edit Schedule / View-only Sched:
   `button.schedule-more` → items `.schedule-moreitem`. Verify each by looking — if one is missing, say so; do not guess.
7. **A phone on its side:** `browser.newContext({ viewport: { width: 874, height: 402 }, isMobile: true, hasTouch: true })`
   (WebKit and Chromium). Chromium cannot raise a phone keyboard: before the page loads, replace `window.visualViewport`
   with a stand-in, then "the keys come up" is the stand-in shrinking by 200px:
   ```js
   await page.addInitScript(() => {
     class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
     const f = new FakeVV(); Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f }); window.__vv = f
   })
   // keys up, after tapping a box:  await page.evaluate(() => { const v = window.__vv; v.height = innerHeight - 200; v.dispatchEvent(new Event('resize')) })
   ```
   Check first that the sideways look is on: `matchMedia('(min-width:821px) and (pointer:coarse) and (orientation:landscape) and (max-height:500px)').matches`
   must be true — say so if it is not in WebKit.
8. **Pictures:** one right after each tap or key AND one settled (about 400 ms later) on a phone (D1281); a picture of
   every state you assert. Crop to the area that matters where the claim is small (a ring, a box). Open each picture you
   save before you count its step as looked at.
9. **Assert what a person sees,** in screen terms: a part is "on screen" by its box inside the viewport, "in front" by
   `elementFromPoint` returning it, a ring by the computed `outline-style` / `outline-color` / `outline-offset` on
   `:focus-visible` AND by the pixels in the cropped picture (the app's cyan is `--accent`). The browser's own ring reads
   as `outline-style: auto` — that is a fault on the D1771 controls.
10. **Your report** (your final message, under 600 words): (a) your roll-call rows, each cell YES / NO-because / MISSING
    with the picture that shows it; (b) each finding — what you did, what you expected (from the rulings above), what
    showed, its picture, and whether it reproduced twice; (c) what you could not walk and why; (d) what only his real
    iPhone can show; (e) your script's path and the picture folder. Do not fix anything, edit no app file, commit nothing.

## Walker A — a jet's line on the desktop board (rows A1–A9), and its plain-user round

Desktop, mouse, Chromium; sizes 821, 874, 900, 1000, 1099, 1100, 1536 wide × 900 tall, and once at 1000 × 800 with
`deviceScaleFactor: 1.25` (his PC's display), and once in WebKit at 1000.
- A1: at each size in the band, a flying jet's line: R above B, TO above LD (each pair the same width, one box over the
  other), the remarks on a row of their own under the times, wider than 300px, the line's buttons (CX, ■, ✕…) beside the
  remarks; nothing of the line cut off or overlapping the crew column; the headings over the boxes line up with them
  (measure the heading's centre against its box's centre on every kind of row); each pair of side-by-side boxes one height.
- A2: a standby wave: if the day has none, add one with + Wave → SC (then AVALON or BB) through the menu — R · B · START ·
  END stacks the same way, START over END.
- A3: the in-time lines over a wave (+ In-time): unchanged, readable, nothing overlapping.
- A4: 1100 and 1536: one line, R · B · TO · LD, remarks beside them — as before.
- A5: 820 and 402 wide (desktop mouse at 820; a phone 402 × 874 touch): the phone layout, unchanged.
- A6: on the phone 402 × 874, ⋯ → the layout switch (the phone and screen mark) → the desktop layout: lines as before;
  switch back.
- A7: Edit Schedule's week and View-only Sched at 1000: the week's lines drawn as before (R over B, TO over LD in the
  week's own way, D1026) — nothing of the band reached the week.
- A8: a published day's look (👁, through the plans selector's menu where a published version exists; publish a day first
  through its own controls if none is published — say how you did it) at 1000: stacked as A1, read only.
- A9: change a time on a line at 1000, turn History on (`#sbHist`): the gold dot sits on the changed box itself, not on its
  neighbour; turn History off.
- **The plain-user round at 1000 wide (D1557):** open the board from Edit Schedule's date; type a callsign, mission, R, B,
  TO, LD and remarks on a line; + Line on a wave; delete a line with ✕ (and its question); Undo and Redo in the top bar
  (the screen stays where it is when the change is in view); open and close EVERY menu and window the bar opens — ⋯ (by
  Escape, by a click outside, by an item), + Wave, Templates, History and the changes window (its ✕), Insights, the day's
  issues (`#sbWarn`) — each pictured open and closed, the board behind as it was; then ✓ Done, and look at Edit Schedule's
  week and View-only Sched for the edits (the working copy shows them on Edit Schedule).

## Walker B — the board on a phone held sideways (rows B1–B13), and its plain-user round

WebKit first, then Chromium, 874 × 402 touch with the keyboard stand-in; also 844 × 390. Scroll the board by a finger
(`page.touchscreen` swipes and also `mouse.wheel` for a control check) — slowly, and a quick flick, and again before it
settles (lessons 2, 20); picture during and after.
- B1: at rest the head (Calendar, title, day chips, search) and the bar both show; after a scroll down the head has gone
  off the top and only the bar is left, its foot about 51px from the top; the bar stays put however far and fast you
  scroll; nothing of the list shows behind or through the bar (D1518); scroll back up — the head returns, nothing left
  stuck.
- B2: tap a time box low on the screen, raise the keys: the box rises above the keys in step, nothing else jumps; the bar
  stays at the top; the list above the keys is about 151px. Also tap a box already above the keys: nothing moves.
- B3: scrolled, the crew and issues column stands right under the bar and reaches the foot of the screen; its own lists
  scroll inside it by a finger; at rest its foot may stand below the screen until the head has scrolled away (as drawn).
- B4: the "Not saved" band: open the app at `http://localhost:4180/?savefail`, make an edit on the board — the band shows
  under the bar; scrolled, it stays with the bar; its Retry reachable. (The OIL bar under the bar — after an unanswered
  OIL question — only if you can reach it through the controls; else say not walked.)
- B5: scrolled, open the changes window (History), ALL AVAIL (tap an ALL AVAIL count where the day has one) and Insights:
  each opens just below the bar, not under it, not at the old head's place; close each by its ✕, Escape and a tap outside.
- B6: drag a puck (crew column → a seat) towards the foot of the screen and hold: the board scrolls down under it; towards
  the top, over the bar, and hold: it scrolls up. Drop it; the drop lands where it shows.
- B7: scrolled to the foot: tap the day's issues and a warning's line whose row is out of view — the row lands below the
  bar, wholly in view; make an edit, scroll it out of view, Undo — the row comes back below the bar.
- B8: History on, tap a gold dot so its bubble shows, then scroll: the bubble follows its box (or closes) — never left
  floating over another row.
- B9: change the day with the day chips (scroll up to reach them) and with ‹ › if shown: the new day shows from its top;
  nothing stuck from the old day.
- B10: a phone upright 402 × 874: the sideways look is off (the query false), the phone board as before — its one-row bar,
  the list scrolling inside the board.
- B11: a desktop with a mouse at 874 × 402 (no touch): the query false, the board as before.
- B12: a tablet on its side 1180 × 820 touch: the query false, as before.
- B13: sideways, ⋯ → the desktop layout switch: it keeps its own pinch-zoom scroller — the sideways block not applied (the
  head does not scroll away there); switch back.
- Also: turn the phone (resize the context 874 × 402 → 402 × 874 → back) with the board open, and close the board with
  ✓ Done and reopen it: the bar's height and the head's scroll-away still right each time (the heights are measured live).
- **The plain-user round, sideways (D1557):** type a line's times and remarks with the keys up, + Line, ✕ a line, Undo /
  Redo, open and close ⋯, + Wave, Templates, History, Insights — pictures right after each tap and settled; then ✓ Done.
- Say plainly what only his iPhone can show (the real keyboard's rise, Safari's own scrolling and bounce, his fonts).

## Walker C — the keyboard rings (rows C1–C6), the keyboard walk at 1536 and 402

Chromium and WebKit; a desktop 1536 × 900 and a narrow window 402 × 874 driven by the keyboard (no touch). Find the
controls by these names in the code before you start (lesson 14: `grep` `src/ui/` for `sb-moreitem`, `schedule-moreitem`,
`data-sblkadd`, `data-dwadd`, `data-wvadd`, `planselbtn`, `stcfg`, `daybtn`, `sbTpl`), and list each one you found.
- Open the board from Edit Schedule by the keys: Tab to a day's date and press Enter.
- C1: Tab to ⋯ (`#sbMore`), Enter (and separately the down arrow) — the keys land on the first item, which shows a raised
  row and the cyan ring inside its edge; arrows move the ring down and up the items; Escape closes the menu and the keys
  return to ⋯. Picture each, cropped.
- C2: the same on Edit Schedule's week ⋯ and View-only Sched's ⋯ (`button.schedule-more`).
- C3: + Block on a duty section and on the AMT section: Tab to it — cyan ring just outside it; Enter opens its menu.
- C4: Templates — the desktop bar's `#sbTpl` at 1536 and the phone day bar's at 402: cyan ring.
- C5: + Wave, the plans selector, a jet's stores ("C") and the duty role box: cyan ring on each under the keys.
- C6: each of C1–C5 pressed by a mouse click (and, in a 402 × 874 touch context, by a tap): no ring at all; the ⋯ item
  hovered shows its raised row only.
- Note any other board control you pass with Tab that wears the browser's own ring (not cyan) — list them under "met in
  passing" only (that is a separate job, already known for ✕, ■, Auto sort, + Note, + Row, ⓘ, Traffic, Make public, the
  CAT tabs, sync and the time boxes); do not count them as this job's findings unless one of C1–C5 is among them.
- **The plain-user round by the keys:** open the board by Enter on the date; open and close each menu above by Enter and
  Escape, the keys returning each time to the button that opened it; pick a template from Templates by the keys and Undo
  it (top bar Undo by the keys); ✓ Done by the keys.
