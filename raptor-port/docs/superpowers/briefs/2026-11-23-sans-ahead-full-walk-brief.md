# Walk brief — the FULL check of `claude/allavail-sans-postout-141`: D2340 (filing ahead), D2341 (hidden on a day not SANS), D2342 (the bell's words), D2346 (the fade) — 23 Nov 26, chat 152

You are a WALKER: you drive the running app as a person would, in a real browser, and say what you saw. You fix nothing,
change no file under `src/`, run no git command, and never run `npm run build`, `npm test`, `npm run test:e2e` or any
Playwright TEST runner (each rebuilds `dist`). The build is already made: `raptor-port/dist`, from commit `ddd8c4a44`
(code `d24e2406f`) of branch `claude/allavail-sans-postout-141`. The host holds the checks lock for you — never take or
release it. Another helper is timing the app on ports 4412–4413 at the same time: never touch those ports.

**Folder:** `C:\Users\User\projects\Raptor\raptor-port` — work only here. You write ONLY: your scripts
`scripts/handpass/sah-<you>*.mjs`, your pictures under `docs/img/handpass/2026-11-23-sans-ahead/<you>/`, and your report
`docs/handpass/parts/sud/<you>-report.md`. Nothing else, anywhere. Never pass a script inline to the shell (a hook refuses
it and backslashes are lost): write it with the file tool and run the file. A rewrite and its run are never sent in one
step; print a version line at the top of every run. Raw dumps (logs, json) and the bulk of the pictures go to
`D:\raptor-work\c152-walk\<you>\`; keep in the repo folder only the deciding pictures (at most about 40), named in your
report.

## Before you write a line
1. Read `docs/walk-scripts.md` §3 to §8 whole.
2. Read `docs/bug-check-order.md` §7.2 to §7.10 (`grep -n '^\*\*7\.' docs/bug-check-order.md`) and the checklist's lessons
   (`docs/bug-check-checklist.md`, "The lessons of §7.11") — for each lesson say in your report the step that covers it or
   why it cannot apply.
3. Your recipes — passing scripts driven on this app; copy their helpers, never guess a control from the source:
   `scripts/handpass/sud-w6-lib.mjs`, `sud-w6.mjs`, `sud-w6-env.mjs` (last round's walk of the bell line: giving Hex a
   sign-in on Admin → Users, signing in as him, the bell, its tap onto the SANS tab), `sud-w5-lib.mjs` (the crew list's
   note, an armed seat, the Scheduler Board), `asp-w4.mjs` and `asp-w2-lib.mjs` (the clock, the sign-in, a SANS posting
   through the Leave War cell's ⋯ → Post out → SANS → Post out, and "Undo post out"; naming Hex on a briefing at CLEAR
   hours; archive and restore on Admin → Users), `sfd-w1-lib.mjs` (the Quals hand tick: `#qViewW`/`#qViewA`, `#qEdit`,
   `td[data-q="<id>|san"]`), `frf-w1.mjs` (sign-offs, Publish), `scripts/drawcheck/specs/sans-before.mjs` (how the faded
   SANS calendar day is found: its `is-before` class). **Trap met before (17 false FAILs):** Hex has demo flights of his own —
   read his day's own items first and put your events at hours clear of them.
4. The rulings (read whole): `grep -h '^| D2340 \|^| D2341 \|^| D2342 \|^| D2346 \|^| D2343 ' ../.claude/decisions-full/*.md`.
5. The scenarios: `docs/superpowers/briefs/2026-11-23-sans-ahead-full-scenarios-astra.md` — Astra's, a reader who did not
   build this; read each of YOURS whole. The host's EXPECTED lines below replace Astra's where they differ.

## Your world
- Serve the build yourself, on your port (w8 4398, w9 4399), as a background command that first moves into the folder by
  its full path: `cd "C:/Users/User/projects/Raptor/raptor-port" && npx vite preview --port <PORT> --strictPort`. Check the
  port is free first; if held, take the next free one above 4420 and say so. Stop it by its PORT at the end (PowerShell:
  `Get-NetTCPConnection -LocalPort <PORT>` → `Stop-Process`), never by a command-line pattern.
- A plain node script with `@playwright/test`'s `chromium` and `webkit` (the recipes' browser fallback). Each scenario starts
  in a FRESH browser context (a fresh store).
- **The clock:** install it BEFORE the app loads and leave it running: `await ctx.clock.install({ time: new
  Date('2026-07-15T09:00:00') })` — Wed 15 Jul 26 (Mon 13 Jul is day 0, Fri 17 Jul day 4, Sat 18 Jul day 5). To cross a
  date with the page open use the clock's own fast-forward / `setSystemTime` and say which; log the app's own today before
  any step that relies on it.
- **Two sizes, every scenario:** desktop Chromium 1536×864; his iPhone, WebKit 402×874, `isMobile`, `hasTouch`,
  `deviceScaleFactor: 3`, real taps, a picture within about 100 ms of each tap as well as the settled one.
- Sign in as `ad`/`a` (Saber, admin). Hex is `rocky` (a WSO, not SANS at the start). To act as HEX you sign in as Hex (give
  him a sign-in on Admin → Users as the recipe does).
- Everything made through the app's own controls (§7.7). `window.*` may be READ to check a result (say so), never written.
- Watch console errors, page errors and 4xx the whole way; list them.

## The words to expect (as built — exact)
- **Crew list / armed seat, a look-ahead day** (a day on or after Hex's SANS date, looked at before it), nothing filed:
  `SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab.`
- **From the date**, nothing filed: `SANS — no availability filed for today`; filed (and shown): no such words.
- **Hex's bell, from the moment the posting is saved** (planned days from the date with nothing filed): `You're SANS from
  Fri 17 Jul. You're planned on Sat 18, Mon 20 Jul with nothing filed. Tap to file.` — shrinking as he files, gone once
  every day is filed; past three days "and 2 more". A tap: the SANS calendar on the first day's month, that day open.
- **Hex's bell, the posting taken back** (moved later, Undo post out, another outcome) while he has filed days from its old
  date: `Your SANS availability for Sat 18 Jul is hidden while you're not SANS that day.` (several days named the same
  way); a READ line keeps its words struck through, then `taken back · Saber`.
- **The refusal** of a filing with no SANS day in it: begins `<callsign> is SANS from …` — RECORD its exact words.
- **The fade (D2346):** on the SANS calendar, signed in as Hex with his date ahead, his days before the date have no colour
  wash and dimmed figures (the cell carries the class `is-before`); a screen reader hears "Before your SANS date."; Saber
  (admin) sees the same days unfaded; from the date the fade is gone.

## The scenarios — Astra's numbers (S1…S24); each at both sizes
Astra uses **Ranger** (member `us`/`us`, who already has a sign-in) as the man posted out as SANS, Hex as the second man —
follow that. Read Ranger's and Hex's own demo items on each day first and put your events at clear hours.

| Walker | Scenarios | Port |
|---|---|---|
| **w8** — filing ahead, the fade, the reminder line | S1, S2, S3, S4, S5, S15, S17, S19, S20, S21, S23, and the plain-user round | 4398 |
| **w9** — the hiding, cause by cause, with the reader sweep | S6, S7, S8, S9, S10 — each with Astra's reader sweep, hidden and restored | 4399 |
| **w10** — hiding across publication, shared filings, edits, the take-back line | S11, S12, S13, S14, S16, S18, S22 | 4400 |

S24 (timing) is another helper's — skip it. Astra's "automated-only supplements" are the host's — skip them.

**The host's EXPECTED lines, where Astra's leave it open or differ (these win):**
- **S4 (a run of days part before the date):** as built the save REFUSES the whole filing with `Ranger is SANS from Fri 17 Jul:
  file SANS availability for days from then` and saves nothing; the owner was told a different reading (accepted, the early
  days hidden). RECORD exactly what happens on each route (drag, keys, a changed start date, both directions, as Ranger
  and as Saber) — a route that saves an early day is a FAIL; a route that neither refuses nor saves, silently, is a FAIL.
- **S5:** the Inputs page's "+ Input" type list does not offer SANS Availability (D576: filed on the SANS calendar only) —
  RECORD the list's choices; if it is offered, walk S1's filing through it and say so.
- **S8:** RECORD how the Post out sheet lets an outcome be changed away from SANS (name the control); the availability hides
  and returns as Astra says.
- **S9 (Quals untick):** hidden from that day, returns on Undo; NO bell line (as built — the owner's question). PASS on that.
- **S11:** the published face (View-only Sched, the published version) never changes by the hiding. Whether the working copy
  then reads pending: RECORD (SANS availability never lands on the programme, so the expected is no pending — say if it does).
- **S12:** hiding is per man: a shared offer must not show the hidden man anywhere (the SANS calendar, its opened day, the
  crew lists of Edit Schedule and the board, an armed seat) while the other still qualifies — a place that shows him is a FAIL.
- **S16:** as Astra's table; the hidden sentence names the filed day (18), never the unfiled one (20).
- **S17:** whether a newly planned day relights a read line: RECORD (an open question to the owner).
- **S20:** the page open across midnight, without a reload (lesson 29): the fade goes on 17 Jul, "+ Commitment" opens on 17
  Jul. The page BACKGROUNDED across midnight cannot be walked in a test browser (it keeps a background tab "visible") — say so.
- **S21:** the posting changed by Saber while Ranger's own calendar stays open in ANOTHER tab cannot be walked (two tabs do
  not share live changes) — walk it as Astra says, signing in as each in turn.
- **The plain-user round (§7.0a), w8, both sizes:** as Ranger: the bell (open, tap the line, close it each way), the SANS
  tab's day window the tap opens (close by ✕, Escape, a tap outside; on the phone its pull-up bar), "+ Commitment" →
  the commitment window (Cancel, ✕, Escape, save), opening a saved commitment and deleting it; as Saber: the Leave War's Post
  out sheet (open, ✕, Escape, tap outside, post out, Undo post out); then every other place that should show the result:
  the SANS month, Edit Schedule's crew list, the Scheduler Board, View-only Sched, the changes window.

## Your report — `docs/handpass/parts/sud/<you>-report.md`
A table: one row per scenario step and size — what you did, what the screen said (exact words and numbers), PASS / FAIL
against EXPECTED (RECORDED only where it says RECORD), the picture's file name. Then: every FAIL with its steps and
pictures; errors seen; the lessons list; what you could NOT walk and why. Your final message: the report's path, the counts
(steps, PASS, FAIL, RECORDED, pictures), each FAIL in one line, and the tokens the harness says you used if you can read it.
