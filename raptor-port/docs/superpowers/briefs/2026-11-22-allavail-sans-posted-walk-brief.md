# Walk brief — ALL AVAIL counts a man posted out as SANS who is planned with us, whatever "+ SANS" says — 22 Nov 26, chat 141

You are a WALKER: you drive the running app as a person would, in a real browser, and say what you saw. You fix nothing,
change no file under `src/`, run no git command, and never run `npm run build`, `npm run test:e2e` or any Playwright TEST
runner (each rebuilds `dist`). The build is already made: `raptor-port/dist`, from commit `55c87b1dc`'s code on branch
`claude/allavail-sans-postout-141`.

**Folder:** `C:\Users\User\projects\Raptor\raptor-port` — work only here. You write ONLY: your script(s)
`scripts/handpass/asp-w1*.mjs`, your pictures under `docs/img/handpass/2026-11-22-allavail-sans-posted/w1/`, and your
report `docs/handpass/parts/asp/w1-report.md`. Nothing else, anywhere. Never pass a script inline to the shell (a hook
refuses it, and backslashes are lost): write it with the file tool and run the file. A rewrite and its run are never
sent in one step; print a version line at the top of every run.

## Before you write a line
1. Read `docs/walk-scripts.md` §3 to §8 whole — how a walk script is written here and what each trap has cost.
2. Read `docs/bug-check-order.md` §7.2 to §7.10 (find them: `grep -n '^\*\*7\.' docs/bug-check-order.md`), and the
   checklist's lessons list (`docs/bug-check-checklist.md`, "The lessons of §7.11") — for each lesson say in your report the
   step that covers it or why it cannot apply to your scenarios.
3. Your recipes — passing scripts whose routes were driven on this app; copy their helpers, never guess a control from
   the source: `scripts/handpass/frf-w1.mjs` (an ALL AVAIL item put on a Saturday, the four sign-off boxes, Publish, the
   Leave War cell, and a posting out as SANS through the bid sheet's ⋯ → Post out → SANS → Post out, with "Undo post
   out" on the same sheet); `scripts/handpass/sfd-host.mjs` and `sfd-w1.mjs` + `sfd-w1-lib.mjs` (the browser's clock, the
   sign-in, the Quals hand tick — the page opens on Pilots, so press `#qViewW` / `#qViewA` first, then `#qEdit`, then the
   man's cell `td[data-q="<id>|san"]` — the ALL AVAIL window's pucks, how the board's crew list is read for one man);
   `scripts/handpass/lw-m5b-walk-w1.mjs` (the Leave War's ⚙ Settings: "+ SANS" is the add chip
   `[data-testid="gadd-SANS"]`; the SANS group's own ✕, labelled "Hide SANS again", takes it off).

## Your world
- Serve the build yourself, on port **4391**, as a background command that first moves into the folder by its full
  path: `cd "C:/Users/User/projects/Raptor/raptor-port" && npx vite preview --port 4391 --strictPort`. Check the port is
  free first; if it is held, take the next free one above it and say so. Stop your server by its PORT when you finish
  (PowerShell: `Get-NetTCPConnection -LocalPort <PORT>` → `Stop-Process`), never by a command-line pattern.
- Drive it with a plain node script using `@playwright/test`'s `chromium` and `webkit` (the browser fallback as in the
  recipes). Each scenario starts in a FRESH browser context (its own empty storage).
- **The clock matters: a posting runs on its DATE.** Install the browser's clock BEFORE the app loads and leave it
  running: `await ctx.clock.install({ time: new Date('2026-07-15T09:00:00') })` — Wed 15 Jul 26, in the demo week (Mon 13
  Jul is day index 0, Sat 18 Jul is 5). Log the app's own today before the step that relies on it.
- **Two sizes, every scenario:** a desktop, Chromium 1536×864; his iPhone, WebKit 402×874, `isMobile`, `hasTouch`,
  `deviceScaleFactor: 3`. On the phone use real taps (`locator.tap()`), and take a picture within about 100 ms of each
  tap as well as the settled one (§7.10).
- Sign in as `ad` / `a` (admin, Saber). A member is `us` / `us` (Ranger). People by id: `rocky` is **Hex**, a WSO, not
  SANS at the start; `nick` is a man who IS SANS at the start (read each callsign and seat off `window.PEOPLE`).
- Everything is made through the app's own controls (§7.7) — the posting on the Leave War's sheet, "+ SANS" in its ⚙
  Settings, the event and the man named on the day on Edit Schedule or the Scheduler Board, the sign-offs and Publish.
  `window.*` may be READ to check a result (say so in the step), never written to make one.
- Watch console errors, page errors and 4xx responses the whole way; list them.

## What the fix is (so you know what a wrong screen would look like)
Before it, with "+ SANS" OFF the Leave War (the default — no SANS group on the war), a man posted out as SANS and named
on a day's programme was left OUT of that day's ALL AVAIL crowd: the count chip was one short, the ALL AVAIL window did
not list him, a published Saturday gave him only his own item's OIL, and turning "+ SANS" ON afterwards made that
published day read "1 pending". Now he counts, and "+ SANS" changes nothing on the schedule.

## The scenarios — each at both sizes; a PASS means the screen shows the EXPECTED line
SCENARIOS-GO-HERE

## The plain-user round (§7.0a) — on top of the scenarios, both sizes
Do the area's everyday tasks start to finish as a user would, pressing EVERY control that opens or closes something, and
picture each: the Leave War's one-day sheet → ⋯ → Post out (open it, close it by ✕, by Escape, by a tap outside; then
post out; then "Undo post out"); the war's ⚙ Settings (open, "+ SANS", the SANS group's ✕, close by ✕, Escape, a tap
outside); the ALL AVAIL window (open from the count chip, drag it, close by ✕ and Escape; on the phone its bottom
panel); OIL Earn on and off. Then look at every other place that should show the result: the Scheduler Board's crew list
and count chip, View-only Sched as the member, the OIL tracker and the Balances page for Hex, the bell, the changes
window (the clock on Edit Schedule).

## Your report — `docs/handpass/parts/asp/w1-report.md`
A table: one row per scenario step and size — what you did, what the screen said (the exact words and numbers), PASS /
FAIL against EXPECTED (or RECORDED where the line says RECORD), the picture's file name. Then: every FAIL with its steps
to reproduce and its pictures; errors seen; the lessons list (covered by which step, or why not applicable); what you
could NOT walk and why. A scenario with an EXPECTED line is judged PASS or FAIL — "RECORDED" only where the scenario
says RECORD. Your conclusion is a finding only after the host reproduces it; the host opens the pictures behind every
FAIL and every PASS that touches OIL or a published day. Your final message to the host: the report's path, the counts
(steps, PASS, FAIL, RECORDED, pictures), each FAIL in one line, and how many tokens the harness says you used if you
can read it.
