# Walk brief — SANS from its date on every screen (D2313), the publish note's names (D2314) — 22 Nov 26, chat 140

You are a WALKER: you drive the running app as a person would, in a real browser, and say what you saw. You fix nothing,
change no file under `src/`, run no git command, and never run `npm run build`, `npm run test:e2e` or any Playwright TEST
runner (each rebuilds `dist` under the other walker). The build is already made: `raptor-port/dist`, from commit
`bf333f432` of branch `claude/sans-from-date-139`.

**Folder:** `C:\Users\User\projects\Raptor\raptor-port` — work only here. You write ONLY: your script(s)
`scripts/handpass/sfd-<your id>*.mjs`, your pictures under `docs/img/handpass/2026-11-22-sans-from-date/<your id>/`, and your
report `docs/handpass/parts/sfd/<your id>-report.md`. Nothing else, anywhere. Never pass a script inline to the shell (a
hook refuses it, and backslashes are lost): write it with the file tool and run the file. A rewrite and its run are never
sent in one step; print a version line at the top of every run.

## Before you write a line
1. Read `docs/walk-scripts.md` §3 to §7 whole — how a walk script is written here and what each trap has cost.
2. Read `docs/bug-check-order.md` §7.2 to §7.10 (find them: `grep -n '^\*\*7\.' docs/bug-check-order.md`), and the
   checklist's lessons list (`docs/bug-check-checklist.md`, "The lessons of §7.11") — for each lesson say in your report the
   step that covers it or why it cannot apply to your scenarios.
3. Your recipes — passing scripts whose routes were driven on this app today; copy their helpers, never guess a control
   from the source: `scripts/handpass/sfd-host.mjs` (the host's own run on this build: the clock, the sign-in, the Quals
   hand tick — the page opens on Pilots, so press `#qViewW` / `#qViewA` first, then `#qEdit`, then the man's cell
   `td[data-q="<id>|san"]` — and how the board's crew list is read for one man: his puck inside `.rsans` is "under SANS
   Avail", the class `san` on a puck is the purple SANS line); `scripts/handpass/frf-w1.mjs` (an ALL AVAIL item put on a
   Saturday, the four sign-off boxes, Publish, the Leave War cell, and a posting out as SANS through the bid sheet's ⋯ →
   Post out → SANS → Post out, with "Undo post out" on the same sheet); `scripts/handpass/frf-w3.mjs` + `frf-w3-lib.mjs`
   (an input filed through "+ Input" with its OIL question left for Later, the sign-off press that opens the day's OIL
   list, and the publish note read off the screen).

## Your world
- Serve the build yourself, on YOUR port (given in your task), as a background command that first moves into the folder
  by its full path: `cd "C:/Users/User/projects/Raptor/raptor-port" && npx vite preview --port <PORT> --strictPort`. Check
  the port is free first; if it is held, take the next free one above it and say so. Stop your server by its PORT when
  you finish (PowerShell: `Get-NetTCPConnection -LocalPort <PORT>` → `Stop-Process`), never by a command-line pattern.
- Drive it with a plain node script using `@playwright/test`'s `chromium` and `webkit` (the browser fallback as in the
  recipes). Each scenario starts in a FRESH browser context (its own empty storage).
- **The clock matters here: SANS counts from a DATE.** Install the browser's clock BEFORE the app loads and leave it
  running: `await ctx.clock.install({ time: new Date('<the scenario's start>') })`. To reach a later day inside a scenario,
  `await page.clock.fastForward('24:00:00')` (the app follows midnight by itself), then press something or reload, and
  log the app's own today (`new Date().toISOString()` in the page) before the step that relies on it. The demo week is
  Mon 13 Jul 26 (day index 0) to Sun 19 Jul (6); "next week" is reached by the week buttons.
- **Two sizes, every scenario:** a desktop, Chromium 1536×864; his iPhone, WebKit 402×874, `isMobile`, `hasTouch`,
  `deviceScaleFactor: 3`. On the phone use real taps (`locator.tap()`), and take a picture within about 100 ms of each
  tap as well as the settled one (§7.10).
- Sign in as `ad` / `a` (admin, Saber). A member is `us` / `us` (Ranger). People by id: `rocky` is **Hex**, a WSO, not
  SANS at the start; `nick` is a man who IS SANS at the start (read his callsign and seat off `window.PEOPLE.nick`).
- **Make every state through the app's own controls** (§7.7): the Quals tick pressed, the posting set on the Leave War's
  sheet, people put on rows by the crew list (tap a seat then the man, or drag), the sign-off boxes and Publish pressed.
  The bridge on `window` (`window.PEOPLE`, `window.DAYS`, `window.go('editsched')`, `window.CURPAGE`) is for READING and
  for changing page only; a state set directly never proves a control works — if you must, say so.
- Watch and report console errors, page errors and failed requests on every page.

## The rule you are checking — the owner's words
- **D2313:** "A man counts as SANS only from the date his SANS starts, on every screen, and days before it are untouched:
  the board's crew list follows the posting's date as the ALL AVAIL window does; a SANS tick made by hand counts from the
  day it is made, so earlier published days keep their crowd; a hand re-tick after a SANS posting keeps the posting's
  date; a man named on a published day before his posting does not make it pending." His example: "Hex posted out as SANS
  from Mon 20 Jul shows as an ordinary WSO on Sat 18 Jul in the crew list too". The same holds for a tick taken OFF by
  hand: the days he was SANS stay SANS days.
- **D2314:** the publish note names an unanswered input by who it is for: "Ranger's Training", "Ranger and Hex's
  Training", "Training for 3 people", "Training for ALL AVAIL", each followed by "has no OIL answer, so nobody on it
  earns OIL."
- **What "as a regular" and "as SANS" look like on a day:** a regular — in the crew list's Pilots or WSOs column, his
  puck with no purple line at its right edge and no "· SANS" in its title, counted by the ALL AVAIL window; SANS — under
  "SANS Avail" in the crew list (struck "no availability filed" unless he filed some), his puck wearing the purple line,
  NOT counted by ALL AVAIL.
- **Known, already filed — NOT findings (do not report them as faults; a one-line note is enough):** the Inputs
  calendar's opened day, the SANS calendar's day pucks and its Highlight list, and the Leave War's Available counts still
  read today's tick; the SANS highlight chip, who may FILE SANS availability, the Quals tick itself and the Leave War's
  own ROW (its purple line, its group) go by today's tick on purpose.
- A finding is a difference between the screen and an EXPECTED line or a rule quoted here. A problem that lives only in
  data already stored is not a finding (the owner's D56). A scheduler is always an admin (D785).

## Scenarios — walker **w1** (the drawn man), port 4321
Each on a desktop and on the phone; a picture for every EXPECTED line.

**S1 — his example (a posting).** Clock: Wed 22 Jul 26, 09:00. Before the posting: on Sat 18 Jul put an item on the
Common Programme for ALL AVAIL 08:00–15:00 (frf-w1's steps) and put Hex on a Ground Programme row on Sat 18 Jul and on
one on Mon 20 Jul (next week). Post Hex out as SANS from **Mon 20 Jul** on the Leave War's sheet.
EXPECTED (D2313, his example) — on **Sat 18 Jul**, on the Scheduler Board AND on Edit Schedule's week with its crew
panel on Saturday: Hex stands in the WSOs column, not under SANS Avail; his puck on his row and in the crew list wears no
purple line; the ALL AVAIL count's window lists him, his puck there without the purple line; the Available crew panel's
"N SANS offering" does not count him. On **Mon 20 Jul**, same two screens: under SANS Avail, purple line on every copy of
his puck. RECORD exactly what each heading's count says on both days ("WSOS · N FREE", "SANS AVAIL · N FREE") and whether
the puck on the row, the crew list and the ALL AVAIL window agree with one another on each day.
Also look, as the member Ranger (sign out, sign in `us`/`us`), at View-only Sched for both days: RECORD his puck.
And Edit Schedule's next-week preview (the peek) while on the demo week: RECORD his puck on Mon 20 Jul there.

**S8 — what else could move the date (run straight on after S1, same context).** (a) Reload and sign in again; (b) sign
out and in; (c) step to next week and back. EXPECTED after each (D2313): Sat 18 Jul still shows him a regular, Mon 20 Jul
SANS. (d) On the Leave War open his posting's sheet and press "Undo post out". EXPECTED (the take-back erases the
posting's SANS — the host's reading, RECORD exactly what the screen shows): a regular on every day, Mon 20 Jul included;
Quals shows his SANS tick off.

**S3 — a SANS man unticked by hand.** Clock: Wed 15 Jul 26, 09:00. Put `nick` on a Ground Programme row on Mon 13 Jul and
on Thu 16 Jul. On Quals (✎ Edit) untick his SANS. EXPECTED (D2313, the tick taken off): on Mon 13 and Tue 14 Jul he is
still under SANS Avail and his puck keeps the purple line; on Wed 15 Jul and after he stands in his seat's column with
no purple line. Then press the top bar's Undo. EXPECTED: SANS on every day again. Redo. EXPECTED: as after the untick.
Reload. EXPECTED: unchanged.

**S4 — a posting, then untick and re-tick by hand on later days.** Clock: Wed 15 Jul 26, 09:00. Post Hex out as SANS
from Wed 15 Jul. `fastForward` one day (Thu 16 Jul): untick his SANS on Quals. EXPECTED: Wed 15 Jul is still a SANS day
for him (crew list on Wednesday: under SANS Avail), Thu 16 Jul a regular. `fastForward` one more day (Fri 17 Jul): tick
SANS again by hand. EXPECTED (D2313 "a hand re-tick after a SANS posting keeps the posting's date"): Tue 14 Jul a regular;
Wed 15, Thu 16 and Fri 17 Jul all SANS — no gap on Thursday.
Then a posting that has not run yet: in a fresh context, clock Wed 15 Jul, post `rocky` out as SANS from **Thu 16 Jul**.
EXPECTED (D283 "he becomes SANS on the date"): today he is a regular on every day, Thursday included; RECORD his Leave War
row. `fastForward` one day, press something. EXPECTED: Wed 15 Jul a regular, Thu 16 Jul SANS.

**S7 — the plain-user round (§7.0a).** Clock: Wed 15 Jul. Everyday tasks start to finish, pressing every control that
opens or closes something: Quals — ✎ Edit, tick and untick SANS for a man, a CAT change, Done; the tick as the MEMBER
Ranger on his own row (D149: a member edits his own row, the SANS tick included) — RECORD what his crew list shows after;
the posting sheet opened and closed three ways (its ✕, Escape, a tap outside) with nothing saved; Hex ticked SANS today,
then on the board seat him in a flying line's RCP seat on Mon 13 Jul and on Thu 16 Jul. EXPECTED (D2313): Monday raises no
SANS warning for him; RECORD what Thursday's warning list says for him (a SANS man with no availability filed — the
amber "outside SANS availability" advisory is expected there). Then every other place that should show the result: the
bell, the change history's line for the tick ("All changes"), the Inputs calendar's Thursday, the SANS calendar's
Thursday — RECORD each (see "Known, already filed").

## Scenarios — walker **w2** (the published record and the words), port 4322
Each on a desktop and on the phone; a picture for every EXPECTED line.

**S2 — a published weekend, then a tick by hand.** Clock: Wed 22 Jul 26, 09:00. On Sat 18 Jul put a Common Programme item
for ALL AVAIL 08:00–15:00, press the four sign-off boxes and Publish (frf-w1's steps). RECORD: the ALL AVAIL count, Hex's
Leave War cell for 18 Jul (expected "FO…"). Also publish today, Wed 22 Jul (next week), with an ALL AVAIL item on its
Common Programme. Then tick Hex's SANS by hand on Quals.
EXPECTED (D2313 "earlier published days keep their crowd"): Sat 18 Jul shows no "N pending", its "Signed ORIG" line and
four names stand, the ALL AVAIL window still lists Hex as a regular, his Leave War 18 Jul still reads FO. Then change one
remark on Saturday, sign the four boxes, publish AL1. EXPECTED (D142 + D2313): his 18 Jul FO is still there after AL1.
EXPECTED on **Wed 22 Jul** (the day the tick was made — he is SANS there now; D44, D45): that day reads pending and its
sign-offs fall; open the pending list and RECORD its line for him exactly.

**S5 — a man NAMED on published days, then posted out.** Clock: Wed 22 Jul 26, 09:00. Put Hex on a Ground Programme row
on Mon 13 Jul and on Tue 21 Jul (next week); sign and publish both days. Post him out as SANS from **Mon 20 Jul**.
EXPECTED (D2313 "a man named on a published day before his posting does not make it pending"): Mon 13 Jul — nothing
pending, signed line stands, his puck there with no purple line (Edit Schedule, the board, and View-only Sched as Ranger).
EXPECTED (D44, D45, D103): Tue 21 Jul — "1 pending", its sign-offs fallen ("Not yet signed"); RECORD the pending list's
line; View-only Sched keeps his puck as published (no purple line) until the next amendment; the 👁 look at the published
version: RECORD his puck. Then sign and publish AL1 on Tue 21 Jul. EXPECTED: nothing pending; his puck there now wears the
purple line on every screen.
Then "Undo post out". RECORD what Tue 21 Jul reads now (expected: pending again — he is a regular there once more).

**S6 — the publish note's words (D2314).** Clock: Wed 15 Jul 26, 09:00. On the Inputs page file a Training on Sat 18 Jul
for Ranger and leave its OIL question for Later (frf-w3's steps); on Saturday press the sign-off boxes (the OIL list
opens — Later) and Publish. EXPECTED: the note reads "…Ranger’s Training has no OIL answer, so nobody on it earns OIL."
(RECORD the whole note exactly, apostrophe included). In fresh contexts repeat with the Training filed for two people
(Ranger and Hex — EXPECTED "Ranger and Hex’s Training has no OIL answer, so nobody on it earns OIL"), for three people
(EXPECTED "Training for 3 people has no OIL answer…"), and for ALL AVAIL (EXPECTED "Training for ALL AVAIL has no OIL
answer…"). RECORD the order the two names come in and whether the note fits its box on the phone (no words cut).

**S9 — looking back at what was published.** In S5's world before AL1: the 👁 look at the published version of Tue 21 Jul
and View-only Sched as the member Ranger — EXPECTED (D186: a man's posting on his puck stays as published until the next
amendment): his puck as published, no purple line. And the change history ("All changes"): RECORD the line the posting
left on Tue 21 Jul's item.

## Extra scenarios from the independent designer
(Added by the host below this line before you start; walk every one given to your id.)

## What you hand back
- Your script(s) and pictures as above, pictures named `<scenario>-<step>-<desktop|phone>.png`. Open every picture you
  save before you count its step as looked at; on the phone open the "right after the tap" picture beside the settled one.
- Your report file, at most 80 lines, plain words: for each scenario and size PASS or FAIL against each EXPECTED line (or
  the words you RECORDED), naming the one or two pictures that decide it; each FINDING with the exact steps, what the
  screen showed, what the rule says, and its picture; anything an everyday user would trip on; errors seen; what you did
  NOT walk and why (NOT WALKED is never FAIL). Stop and report after 3 failed attempts at one gesture. Send your report
  ONCE, after stopping every script, browser and server you started; your final message is a 15-line summary of it.
