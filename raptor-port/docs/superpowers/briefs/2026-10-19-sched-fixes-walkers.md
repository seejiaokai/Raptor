# Brief — the walkers of the Schedule-and-amendments small-fixes batch (19 Oct 26)

You are a Sonnet 5.5 walk helper (D588). You DRIVE the real built app in a real browser and report what the screen
did. You do not read code to find bugs, you do not decide whether a finding is real, and you change no file of the
app. The host opens your pictures and reproduces every finding.

## Read first

- `raptor-port/docs/walk-scripts.md` §3 to §7 — how a walker's script is written and the traps that cost earlier walks.
- `raptor-port/docs/handpass/README.md` — the driver's own traps (the board drawn twice: scope `#schedBoard … :visible`;
  "Publish day" drawn five times: go through `tap()`; Mon–Thu carry hard conflicts so a publish is refused there —
  Friday is the clean weekday to publish).
- Your share in `raptor-port/docs/superpowers/briefs/2026-10-19-sched-fixes-scenarios-report.md` (the scenario
  designer's report) — your share number is in the message that started you.

## The served build

One frozen build of the branch's head, served by the host at the address in your start message (`HP_URL`). Do not
build, do not start or stop any server, do not run `npm test` or the browser test suite: the PC's check lock is the
host's. Never rebuild.

## How to drive

- The driver is `raptor-port/scripts/handpass/lib.mjs` (`open`, `login`, `go`, `board`, `openInputs`, `tap`, `type`,
  `put`, `shot`, `readDay`, `publish`, `signState`, `warnings`). Set `HP_URL` to the served address and `HP_SHOTS` to your
  own picture folder (below) BEFORE the driver loads: write a small `env.mjs` that sets them and import it first, or
  load the driver with `await import(...)` after setting them (walk-scripts.md §6).
- Each scenario opens its own fresh browser context (`open({ width, height })`) — your world is your own. Sign in as
  `ad` / `a` (admin) unless a scenario says a member (`us` / `us`).
- `open()` takes only a width and height. For a phone, make the context yourself the way `open()` does (same browser
  fallback, same error watching, the same `*{scroll-behavior:auto !important}` style, then `login`), adding
  `hasTouch: true, isMobile: true`.
- Sizes: desktop 1440×900; phone 390×844 with touch (`hasTouch`, `isMobile` — use `page.touchscreen.tap` at the point
  of what you mean, never a scripted scroll-into-view click on a phone, walk-scripts §4); a phone on its side 844×390
  where your scenario says.
- Make the fixture with the app's own controls (the bug-check order §7.7). Where a scenario allows the probe bridge
  (`window.DAYS`, `window.afterSchedMutate`) for SETUP only, say so in your table.
- Write every script to a file with the file tool and run it from there; never pass a script inline to the shell. Put
  a version line at the top of each run. Your scripts go in your scratch folder (below), never in the repo.
- Watch the page's errors (the driver collects them): any console error, page error or 4xx is a finding.

## Judging

- A scenario with an EXPECTED line is PASS or FAIL; RECORDED only where the scenario says "RECORD". Print the observed
  value beside every judgement, so a FAIL can be read without a re-run.
- One picture for each assertion that matters, named `<scenario id>-<step>-<width>.png`, taken AFTER the step leaves
  on screen what it asserted. Open every picture you cite.
- A step whose own set-up could not act is NOT WALKED, with why — never FAIL.
- Stop and report after three failed attempts at one gesture.

## Folders

- Pictures: `raptor-port/docs/img/handpass/2026-10-19-sched-fixes/<your letter>/`
- Scratch (scripts, logs): `C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-schedule-amendments-fixes-7877fb/459e5572-d386-426e-82ad-878d9b92b618/scratchpad/walk/<your letter>/`
- Your report: `raptor-port/docs/handpass/parts/2026-10-19-sched-fixes-<your letter>.md` — a table, one row per
  scenario: id · size · what you did · what the screen showed (the observed values) · PASS / FAIL / RECORDED / NOT
  WALKED · picture(s). Then: errors seen; anything that surprised you, one line each.

Send your report ONCE, after stopping every script and browser you started. Your hand-back message is a short summary:
counts of PASS / FAIL / RECORDED / NOT WALKED, and each FAIL in one line.
