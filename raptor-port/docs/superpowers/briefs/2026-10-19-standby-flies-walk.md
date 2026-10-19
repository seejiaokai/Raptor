# The walkers' common brief — [STANDBY-FLIES] (19 Oct 26)

You are a WALKER for a bug check of a flying-schedule web app. You drive the RUNNING app in a real browser with Playwright
scripts, press the real controls, take pictures and report PASS / FAIL / RECORD per scenario. You never read or change the
app's source (`raptor-port/src`) and never fix anything. Read `raptor-port/docs/walk-scripts.md` (whole) before you write
a script, and the scenario list `raptor-port/docs/handpass/parts/standby-flies/scenarios.md` (your scenarios are named in
your own brief below). The design: `raptor-port/docs/superpowers/specs/2026-10-19-standby-flies-design.md`.

## What changed (his rulings, 19 Oct 26)
- **Standby lines** are the SC, AVALON and BB waves. Each wave has shifts (formations): SC AM 07:00–13:00 and SC PM
  13:00–19:00; AVALON NIGHT 19:00–07:00; BB one SHIFT with blank START / END. Each shift has rows (jets): two MAIN, then
  two SPARE, each with a front (FCP) and rear (RCP) seat.
- **A shift with its B or R typed flies whole** (D1044, D1045): every row on it, SPARE included. A flying row is checked
  as an SC MAIN is — crew rest, the long day, clashes with his other events, availability with NO standby allowance (a
  man on local leave may stand a standby row; on a flying row it is a warning), SC currency, seat rules — its day from
  the earliest of R, B and START to its END, nothing added after END. It counts as a jet in the day's count badge (each
  standby wave with rows that fly adds an "X n" term to the badge; the standby figure after the slash keeps counting the
  rows that only stand by) and as a sortie in Insights. It earns OIL by default on a weekend / holiday.
- **A row with nobody seated** is no jet and no sortie even when its shift flies (D1062).
- **The hand tick** (D1061): on a shift with nothing typed, the Scheduler Board shows a dashed "FLIES" chip beside each
  row's MAIN / SPARE badge — a button; pressing it lights that ONE row ("✓ FLIES"); pressing again takes it off.
- **Where the chip shows** (D1060, D1063, D1064): the lit "✓ FLIES" on a row that flies on all three screens — the
  Scheduler Board, Edit Schedule's week, View-only Sched; the next-week peek writes "✓ FLIES ·" before the row's words.
  The dashed chip is on the Scheduler Board ONLY (admin, editing). On a shift with B or R typed the lit chips are not
  buttons (their hover text says to CX the row instead — D1046: no untick). A cancelled row shows no chip. A member sees
  the lit chip only, never a button.
- **The faint dash** (D1065): on the Scheduler Board every EMPTY R and B box of a standby line shows a faint grey "—" as
  its placeholder (never a value; typing replaces it). Flying lines keep their faint suggested times.
- **The advisory** (the builder's call, told to him): a standby shift that flies with no START or END (BB is minted so)
  raises an amber line in the warning list, "BB SHIFT flies but has no START or END — type them so its crew rest and OIL
  can be worked out", and a tap on it lands on the START box.
- **A SPARE that flies** is no longer faded; its badge's hover text says it is fully cross-checked.
- On a published day, a hand tick is a pending change (sign-offs fall), and OIL moves only when the amendment is published.
- A problem that lives ONLY in demo data already stored, when the app is right for new data, is NOT a finding.

## The served build — do not build, do not start or stop servers
- `http://localhost:4322/` — bundle `index-BTbomYbk.js` (prove it first: the served index page names that file). Never use
  any other port. Never run `npm run build`, `vite`, or a Playwright test runner config — write plain Node scripts using
  `import { chromium } from '@playwright/test'` with the repo's browser fallback
  (`existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}`, CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium').
- Run scripts from `raptor-port/` (`cd "C:/Users/User/projects/Raptor/.claude/worktrees/sad-herschel-5682e3/raptor-port" && node <your script>`),
  so `@playwright/test` resolves. Put your scripts under `scripts/handpass/sf-<walker>-*.mjs`.

## Known traps in the drivers (met by the host)
- Sign in: `#luser` / `#lpass` / `#loginForm button[type=submit]`; admin `ad` / `a`; member `us` / `us`. The week is up
  when `#vWeek .day` is attached. Hide passing notes with a style tag where they cover what you photograph
  (`#toastEl{display:none !important}`).
- Pages: `window.go('editsched')` (Edit Schedule); View-only Sched by its nav button; the Scheduler Board:
  `window.openScheduler(dayIndex)` then wait for `#schedBoard`. Day 5 is the Saturday, 6 the Sunday of the boot week.
- Add a standby wave: `window.addWave(dayIndex, 'sc' | 'avalon' | 'bb')` (as admin on Edit Schedule). It is appended as the
  LAST wave; its index: `window.DAYS[di].waves.findIndex(w => w.kind === 'sc')`. Seat a person through the app where the
  scenario needs the route; `window.fillSlot('<di>.<gi>.<li>.<ai>.p', '<personId>')` is acceptable ONLY for set-up that is
  not the thing under test (say so). Person ids: `window.PEOPLE` (pilots have seat 'FCP', WSOs 'RCP').
- Box addresses: the board's inputs `data-bfld="ff:<day>.<wave>.<line>.<field>"` (fields `cs msn rl br to ld`); the week's
  boxes `data-txt="ff:…"`. The Flies chip: `[data-safly="<day>.<wave>.<line>.<row>"]` (a button on the board only);
  the lit one is `.saflies.on`; the MAIN / SPARE badge `[data-sarole="…"]`.
- **On an emulated phone (`isMobile: true`), TYPING into a small box zooms the page in and shifts every later picture
  sideways** (the host met it drawing the mock-ups). For a typing step either reset the zoom before the picture or set the
  box through the real tap + `keyboard.type`, then check the picture is not zoomed; say which you did. A real iPhone
  zooms the same way — RECORD it if you see it, it is not this change's.
- The served build's preview port only: 4322. Ports 4173 and others are held by OTHER chats' old builds — never use them.
- The phone is Chromium touch emulation at 402×874 (isMobile, hasTouch) — not WebKit; say so where an iPhone-only
  behaviour matters.
- Write every script with the file tool, then run it in a separate step; print a version line first. Never pass a script
  inline to the shell (backslashes and apostrophes break). Never use a shell heredoc for a script.

## Scope, pictures and report
- Each scenario with an EXPECTED result is PASS or FAIL; where the rulings leave it open, RECORD what the screen does.
- One picture per assertion that matters, named `<walker>-<scenario>-<step>.png`, in YOUR picture folder. OPEN the
  pictures you cite and say what you saw in them.
- Stop and report after 3 failed attempts at one gesture; say what you tried.
- Your report: a markdown file at YOUR report path — a table per scenario: step, expected, seen, PASS/FAIL/RECORD,
  picture; then "Faults found" (each: what, where, steps to reproduce, picture) and "Not walked, and why". Send ONE short
  hand-back summary (under 12 lines) after stopping every browser and script you started.
