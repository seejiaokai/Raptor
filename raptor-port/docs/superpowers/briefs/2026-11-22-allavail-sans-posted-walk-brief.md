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
The scenarios are Astra's (a reader who did not build this): `docs/superpowers/briefs/2026-11-22-allavail-sans-posted-scenarios-astra.md`
— read each of YOURS there whole (its setup, action and disproof). Its dates are examples: use the demo week (today Wed
15 Jul 26; "Saturday" is Sat 18 Jul, a non-working day that earns OIL). The person is Hex (`rocky`). The main fixture:
on the Saturday, a briefing 08:00–09:00 naming Hex and an event 10:00–17:00 for ALL AVAIL. The EXPECTED lines below are
the host's, each with its source, and replace Astra's where they differ. Always record WHO is in the crowd (is Hex's
puck in the ALL AVAIL window), not only the count. "Both ways" = with "+ SANS" off the Leave War, then on, then off.
Your task names which walker you are: **w1** walks S1, S5, S6, S7, S2, S16, S17, S20; **w2** walks S8, S12, S13, S3, S22,
S23, S28 and the plain-user round. (w2's files: `asp-w2*.mjs`, pictures `…/w2/`, report `parts/asp/w2-report.md`, port 4392.)

| # | In short | EXPECTED (source) |
|---|---|---|
| S1 | Hex posted out as SANS from Wed 15 Jul on the war's sheet; the main fixture; "+ SANS" off: the count, the window, OIL Earn; the four sign-offs; Publish; then another week and back, "+ SANS" on and off | Hex is in the event's crowd, his puck with the purple SANS line; after Publish his Leave War cell for Sat reads FO; after each switch and the week change the day reads nothing pending, keeps its four names, the same count and people, the cell FO (D27, D142, D44; test `allavail-sans-posted.test.ts`) |
| S5 | From S1: take Hex's briefing off; switch both ways before amending; put the briefing back in a separate run | Without a named item the working crowd no longer has Hex, both ways (D27); the day reads pending and its sign-offs fall (D44, D103); the Leave War cell stays FO until an amendment (D142). After putting it back: RECORD what the day and the sign-offs say |
| S6 | From S1: OIL Earn, switch Hex's earning on the event off, publish the amendment, on again, amend again; both ways | Hex stays in the window's who-is-available half throughout (D27); RECORD his cell after each amendment (FO → what? → FO) |
| S7 | From S1 with a change waiting: open the count from View-only Sched, from the 👁 look at the published version, and from the Scheduler Board | View-only and the 👁 look show the published crowd (Hex in); the board shows the working copy's (D44, D45) |
| S2 | In place of the event row: an input of kind Event filed for ALL AVAIL on the Saturday, 10:00–17:00, its OIL question answered Yes; Hex named on the briefing; publish; both ways | Hex is in the input's crowd on the schedule's row; his cell reads FO; nothing pending after the switch (D27, D142, D44) |
| S16 | After S1's Publish: reload with "+ SANS" off, and with it on | Nothing pending, the same count and people, the cell FO (D44, D142) |
| S17 | After S1's Publish: sign out, sign in as `ad` again | The same |
| S20 | After S1's Publish: sign in as the member `us`: View-only Sched's count and window for the Saturday; the OIL tracker for Hex | The same people as the admin saw; no posting, Settings or earning control offered to him (D1008) |
| S8 | A SANS posting for Hex from Thu 16 Jul, set on Wed 15 Jul; the main fixture on the Saturday. Both ways before midnight; then the clock moved past midnight with the app open; then reopened | Before the date: RECORD (the tests pin: Hex NOT in the crowd, the same both ways). After the posting has run: Hex in, both ways, left open and reopened alike (D283, D27) |
| S12 | S1 published, then "Undo post out" on the war's sheet | Hex is an ordinary WSO again and in the crowd; RECORD what the published Saturday says (pending or not, the sign-offs), the bell and the changes window |
| S13 | A SANS posting for Hex from Mon 13 Jul; on Tue 14 Jul a briefing naming him and an ALL AVAIL event, published; then archive Hex on Admin → Users | Tue's crowd still has Hex, both ways (D327; test "F1"); Thu 16 Jul (the same two items, not published) does not. RECORD Tue's pending count and its lines: one for the briefing that names him is right (D327); none may be about the event's crowd or OIL |
| S3 | Admin → Users: a new person with a post-in date of Fri 17 Jul; tick SANS for him on Quals; name him on a Thu 16 Jul briefing beside an ALL AVAIL event; both ways | RECORD whether he is in the crowd (built: in, the same both ways — the answer waits for the owner). A different answer between the two switch positions is a FAIL |
| S22 | The main fixture, but Hex's briefing 11:00–12:00, inside the event's hours | Hex is NOT in the event's crowd, both ways — a time clash (D27) |
| S23 | ALL AVAIL placed on a duty desk and on a sim seat on the Saturday (each with its hours), Hex named on the 08:00 briefing | Each count door opens and lists Hex, both ways (D27, D37) |
| S28 | A posting for Hex with NO chip chosen (tap the chosen chip again), from Wed 15 Jul; the main fixture | Hex is NOT in the crowd, both ways (D303) |

A scenario you cannot reach through the app's own controls is reported as NOT WALKED with what stopped you — never
made by writing to `window.*`.

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
