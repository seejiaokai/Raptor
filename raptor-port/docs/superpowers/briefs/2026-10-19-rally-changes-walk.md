# The walkers' common brief — [RALLY-BOX-CHANGES] (19 Oct 26)

You are a WALKER for a bug check of a flying-schedule web app. You drive the RUNNING app in a real browser with Playwright
scripts, press the real controls, take pictures and report PASS / FAIL / RECORD per scenario. You never read or change the
app's source (`raptor-port/src`) and never fix anything. Read `raptor-port/docs/walk-scripts.md` (whole) before you write
a script, and the scenario list `raptor-port/docs/handpass/parts/rally-changes/scenarios.md` (your scenarios are named in
your own brief below).

## What changed (the rulings, 19 Oct 26)
- **D1038:** tapping a FAINT suggested time (in an empty R or B box of a FLYING line) places it NOT highlighted — in a
  typed time's colour, the caret after it — and the box wears a plain blue ring (#1E86FF, an inset box-shadow, class
  `sugtook`) for about one second, then nothing. The first key typed still REPLACES the placed time (typing "0915" after
  the tap gives "0915", never "09:400915"); a Backspace empties it; Escape before leaving takes it back out; leaving the
  box (or Enter on the board) saves it.
- **D1039:** SC, AVALON and BB lines (standby waves) show NO faint worked-out time in their R or B boxes; flying lines
  keep theirs.
- **D1040:** SC, AVALON and BB lines have their own R (rally) box: on the Scheduler Board in the R/B cell before (desktop,
  one line) or above (phone, stacked) B; on the week (Edit Schedule, View-only Sched) and the next-week peek above START,
  the column headed "R / START".
- **D1041:** a rally typed on an SC MAIN line starts that crew's day as SC's B box (its in-time) does — crew rest (the
  warning sentence says "<line>'s rally is HH:MM"), the long day, work hours, Insights, OIL — the EARLIER of R and B
  counting; a later R moves nothing. On an SC SPARE row, AVALON or BB, R is shown, printed and exported only. An empty R
  counts for nothing. The Excel export and printed PDF carry each line's typed rally; a standby line's Brief column only
  where B was typed. The Logic page's SC in-time line reads "A typed B (the crew's in-time) or R (its rally) on an SC
  MAIN, whichever is earlier, …".
- A problem that lives ONLY in demo data already stored, when the app is right for new data, is NOT a finding.

## The served build — do not build, do not start or stop servers
- `http://localhost:4312/` — bundle `index-D602A6a_.js` (prove it: the served index page names that file). Never use
  any other port. Never run `npm run build`, `vite`, or a Playwright test runner config (`playwright test`) — write plain
  Node scripts using `import { chromium } from '@playwright/test'` with the repo's browser fallback
  (`existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}`, CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium').
- Run scripts from `raptor-port/` (`cd "C:/Users/User/projects/Raptor/.claude/worktrees/admiring-euler-758b91/raptor-port" && node <your script>`),
  so `@playwright/test` resolves.

## Known traps in the drivers (met by the host today)
- Sign in: `#luser` / `#lpass` / `#loginForm button[type=submit]`; admin `ad` / `a`; member `us` / `us`. The week is up
  when `#vWeek .day` is attached. Hide passing notes with a style tag if they cover what you photograph (`#toastEl{display:none}`).
- Pages: `window.go('editsched')` (Edit Schedule), `window.go('view')` may differ — find View-only Sched by its nav
  button text; the Scheduler Board: `window.openScheduler(dayIndex)` then wait for `#schedBoard`.
- Add a standby wave: `window.addWave(dayIndex, 'sc' | 'avalon' | 'bb')` (on Edit Schedule / the board, as admin). It is
  appended as the LAST wave of the day; find its index as `DAYS[di].waves.findIndex(w => w.kind === 'sc')` via
  `window.DAYS` (or `window.findGo(di + '|' + gi)`). An SC wave has two shifts (formations) AM and PM, each with MAIN
  rows then SPARE rows (aircraft rows; `spare: true` on a SPARE row); AVALON one NIGHT shift 19:00–07:00; BB one SHIFT
  with no times (type them).
- Box addresses: the board's inputs carry `data-bfld="ff:<day>.<wave>.<line>.<field>"` (fields `cs msn rl br to ld`);
  the week's boxes carry `data-txt="ff:…"` (contenteditable). Seats: `data-bfld`/slot keys `<day>.<wave>.<line>.<ac>.p|w`.
- The week's two time columns: a flying line R over B, TO over LD; a standby line R over START, then END.
- Port 4173 and others are held by OTHER chats' old builds — never use them.
- The phone is Chromium touch emulation at 402×874 (isMobile, hasTouch) — not WebKit; say so where an iPhone-only
  behaviour (Safari's selection) matters.
- Write every script with the file tool, then run it in a separate step; print a version line first. Never pass a
  script inline to the shell (backslashes and apostrophes break).

## Scope, pictures and report
- Each scenario with an EXPECTED result is PASS or FAIL; where the rulings leave it open, RECORD what the screen does.
- One picture per assertion that matters, named `<walker>-<scenario>-<step>.png`, in YOUR picture folder. LOOK at the
  pictures you cite (open them).
- Stop and report after 3 failed attempts at one gesture; say what you tried.
- Your report: a markdown file at YOUR report path — a table per scenario: step, expected, seen, PASS/FAIL/RECORD,
  picture; then "Faults found" (each: what, where, steps to reproduce, picture) and "Not walked, and why". Send ONE short
  hand-back summary (under 12 lines) after stopping every browser and script you started.
