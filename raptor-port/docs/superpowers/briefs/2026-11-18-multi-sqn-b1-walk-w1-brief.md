# Walker W1 — multi-squadron batch 1, steps 0–4, the full check (18 Nov 26)

You are a walker (Sonnet). You drive the REAL built app in a scripted real browser and return pictures and a filled
table. You do not read the app's code for bugs and you do not decide whether a finding is real — the host does, from
your pictures. **Read `raptor-port/docs/walk-scripts.md` §3 to §7 before writing any script.** Read nothing under
`raptor-port/docs/superpowers/briefs/` except this file.

## The machine and its traps
- Windows, Git Bash. Work from `C:/Users/User/projects/Raptor/raptor-port`. Write every script with the Write tool
  (UTF-8) and run it as a file: `node scripts/handpass/msq/<file>.mjs`. Never pass a script inline; never edit and run a
  script in one step; every script prints a version line first.
- **Your files:** scripts only as `scripts/handpass/msq/msq-w1-*.mjs`; pictures only under
  `docs/img/handpass/2026-11-18-multi-sqn-b1/w1/<run>/` (the library puts them there: set `process.env.MSQ_WHO='w1'`
  and `process.env.MSQ_RUN='<run>'` BEFORE importing it). Write nothing else anywhere. Do not commit. Do not touch
  `src/`, `dist/`, or any other file.
- **The driver, proven by the host:** `scripts/handpass/msq/msq-lib.mjs` (read it whole) and its recipe
  `scripts/handpass/msq/msq-host-probe.mjs` (passed 18 Nov 26 04:15, desktop: ad → Tracker → Leave War → Logout
  reloads the page → ad9 → its week, Tracker, Leave War, Inputs → Logout → us). `X.open({phone, user})` makes a fresh
  world (its own browser, real storage, the frozen build served inside the browser — no server, no port);
  `X.login(page, 'ad9')`; `X.signOut(w)` presses the app's own **Logout** and returns `{reloaded}`; `X.L.go(page,
  'tracker' | 'leavewar' | 'inputs' | 'editsched' | 'viewsched' | 'quals' | 'logic' | 'admin')` changes page; `X.W.*` are
  the board helpers (`X.W.board(w, di)`, `X.W.press`, `X.W.typeIn`, `X.W.seat`, `X.W.closeBoard`) from
  `scripts/handpass/www/www-lib.mjs`; `X.pic(w, name)`, `X.row(...)`, `X.fin(w)`.
- **Known traps:** the sign-out button reads "Logout". On the phone, `X.signOut` guesses the menu button — prove it on
  the phone first (one picture of the open menu); if it fails, find the real control on the phone's screen picture and
  press that. The bridge (`window.DAYS`, `window.PEOPLE`, `window.CURWEEK`, `window.CURPAGE`) is for READING only — make
  every fixture through the app's own controls. There is no `window.SESSION`/`UNIT`: who is signed in is the top bar's
  "<CALLSIGN> · ADMIN/MEMBER". The top bar shows "142 TALON" for a 149 person too — not a finding (step 5 builds the
  number). Admin → Users lists both squadrons — not a finding (step 5).
- A walk's world is one browser's storage: signing out and in as another person in the SAME tab is how you put both
  squadrons' changes in one world. A fresh `X.open` is a new, empty world.

## What is NOT a finding (do not report these)
Demo data already stored; anything about old saved data; a scheduler who is not an admin; Admin → Users listing both
squadrons; "142 TALON" in the bar for a 149 person; no "142 ▾" switch; Request access not asking the squadron; print and
export names; borrowing another squadron's people; the Tracker's two demo students "STUDENT A / STUDENT B" (each
squadron's Tracker seeds its own pair).

## Seeded sign-ins
`ad`/`a` Saber (142 admin, the master) · `us`/`us` Ranger (142 member) · `ad2`/`a2` Prowler (142 admin) · `ad9`/`a9`
Kestrel (149 admin) · `us9`/`us9` Osprey (149 member). 149's people: Kestrel, Falcon, Osprey, Heron, Merlin, Raven,
Harrier, Shrike, Gannet, Condor. The demo week is 13/07/2026 (Mon 13 – Sun 19 Jul 2026); both squadrons have their own
week on those dates.

## Sizes
Desktop: 1536 × 864 Chromium (`phone:false`). Phone: iPhone 402 × 874 WebKit by touch (`phone:true`). On the phone,
every tap that matters gets TWO pictures: one within about 100 ms of the tap (pointer left there) and the settled one.

## Scenarios (each EXPECTED is PASS or FAIL; "RECORD" rows you only record)

**S0 — the five faces (both sizes).** For each of ad, ad2, us, ad9, us9 in turn in ONE world (sign out, sign in on the
same tab): the week on Edit Schedule (admins) or View-only Sched (members) — its flyers' callsigns; the Inputs page's
person list ("Everyone" filter's names); Quals' list of people; the Leave War grid's rows (first 15 names) and "MY LEAVE";
the Tracker's course, students and + Add's offered names (open + Add, picture, close it by its own close). EXPECTED: a
142 person sees only 142's people everywhere (none of the ten 149 names above); a 149 person sees only 149's (none of
142's — e.g. Saber, Ranger, Echo, Static). Source: D2087, D2132, D2167. Also record each Logout's `{reloaded}`.
EXPECTED: true every time (step 2's report; sign-out reloads unless a save is waiting).

**S1 — a 149 edit never shows in 142 (desktop, then repeat the reading on phone).** As ad9 on Edit Schedule, open the
board for Wed 15 Jul (`X.W.board(w, 2)`), add a ground row through "+ Ground" (or the board's ground add — find it on
screen) named "W149 GROUND", put Kestrel on it, close the board. Picture. Logout; sign in ad. EXPECTED: 142's Wed 15 Jul
has no "W149 GROUND" row, on the week and on the board; Logout; ad9 again: the row is still there. Source: D2109
(each squadron its own schedule). Then the reverse: ad adds "W142 GROUND" with Saber on Thu 16 Jul; ad9 must not see it.

**S2 — publish and amend in one squadron only (desktop).** As ad9 publish Wed 15 Jul (the week's Publish control for
the day — find it; answer any question the app asks with its default). Picture of the day showing it published. Logout,
ad: EXPECTED 142's Wed 15 Jul is as it was before (record its published / not published state BEFORE ad9's publish at
the start of S2 too, so you compare). Then as ad9 make one change on the published 15 Jul (move Kestrel off "W149
GROUND" or add a row) — EXPECTED an amendment pending mark ("1 pending" or similar) on 149's day; as ad, 142's day shows
no new pending mark. Source: D2109; two surfaces must agree.

**S3 — Undo stays with its person and squadron (desktop).** As ad9 make a change (a row's name), then Undo (the top
bar's ↶) — EXPECTED the change goes. Make another change, Logout, sign in ad: EXPECTED ad's Undo button is greyed / has
nothing of ad9's (hover or picture its state); press it if it is live and RECORD what it did. Logout, ad9: EXPECTED
ad9's change is still there and his Undo list is empty (cleared at sign-out). Source: D148.

**S4 — an input in one squadron only (both sizes).** As us9 (Osprey) on Inputs, "+ Input" (find the control), a leave or
"Other" for himself on a FUTURE weekday (e.g. a date in December 2026), save. Picture. Logout; us (Ranger): EXPECTED
Ranger's Inputs page, list and calendar, do not show Osprey's input; Logout; ad (142 admin): EXPECTED not shown on 142's
Inputs page; Logout; ad9: EXPECTED shown on 149's. Source: D2087, D2132. Also, in the input window as us9, open the
person picker if there is one and picture it: EXPECTED only 149's people (or only himself if members file for
themselves only).

**S5 — R32's sentence on the Holidays form (desktop; then the one-day case on the phone).** First, as ad, publish one
142 weekday that is still unpublished in the demo week (record which days of the week are published for 142 and for
149 before you start — the week's day headers). Then as ad9 open the Leave War → the calendar / Holidays control (find
it: a "Calendar…" or "Holidays" control in the Leave War's bar or settings), "+ Add", choose a public holiday, and pick a
date range — without saving: (a) one day that is published for 142 only; (b) two days published for 142; (c) a range
covering days published for 142 and for 149. Picture the form each time. EXPECTED shape (source: the step-4 builder's
report, D2184 R32): one day — "This puts a published day out of date: 142's Wed 15 Jul. Publish it again so OIL is
earned."; several — "This puts published days out of date: 142's Wed 15 Jul and Thu 16 Jul. Publish them again so OIL is
earned."; both squadrons joined by "; " ("142's …; 149's …"). The exact days are whatever is published: RECORD the
sentence word for word, and PASS only if it names exactly the days that are published in each squadron within the range
and no others. (d) Change the form's kind to an Off day: RECORD whether the sentence goes. Then Cancel / close the form
by its own control — EXPECTED nothing saved (no holiday in the grid).

**S6 — a holiday at the shared place reaches both; an Off day stays local (desktop).** As ad9, add and SAVE a public
holiday named "W149 PH" on a FUTURE weekday with no inputs (e.g. Wed 9 Dec 2026), answering any question with its
default. If the app says no Leave War period covers it, RECORD exactly what it says and follow its own offer only if it
offers to make the period. Picture 149's Leave War grid on that date. Logout; ad: EXPECTED 142's Leave War grid shows
the same holiday on that date (both at Home base — D2160 F1). Then as ad add an **Off day** "W142 OFF" on another future
weekday; Logout; ad9: EXPECTED 149's grid does NOT show W142 OFF. RECORD whether ad can change or delete "W149 PH" from
142's list and what it says.

**S7 — the bell (desktop).** After S6, open the bell (the top bar's bell) as ad, ad2, ad9: RECORD every line each sees
and its count. EXPECTED: no line about 149's inputs reaches a 142 admin, none of 142's reaches 149's (source:
notifications register B10, "each squadron's schedulers for their own inputs only").

**S8 — reload and a fresh tab (desktop).** In the world after S1–S7, as ad9: reload the page (`page.reload()`), sign in
again if asked: EXPECTED 149's W149 GROUND row, the published 15 Jul and the holiday all still there. Then
`w.ctx.newPage()` (same storage), open the app, sign in ad: EXPECTED 142's world as left (W142 GROUND there, no W149
GROUND). Close the second page by `page.close()`.

**S9 — the plain-user round for Edit Schedule and the Leave War, as ad9 on the PHONE.** Open Edit Schedule, open a day's
board and close it by its own Done; open the day-details / crew list for a day and close it by its own close, then by a
tap outside if it allows; open the Leave War, its MY LEAVE, a person window (tap a name), close each by its own close;
open the bell and close it. EXPECTED every window opens over the page and closes leaving the page as it was; every name
in each is a 149 name. Pictures right after each tap and settled.

Budget: about 75 minutes of walking. Stop a scenario after 3 failed attempts at one gesture and mark it BLOCKED with
the picture of where it stuck. Do not invent a control: if you cannot find one on screen, say BLOCKED and picture the
screen.

## Your report
Write it to `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/job5/w1-report.md`:
a table — scenario · size · what you did · EXPECTED · what you saw (the words on screen, exact) · PASS / FAIL / RECORD /
BLOCKED · picture file(s) — then the console errors each run collected (`X.fin` prints them), then anything odd you
saw on the way (each with a picture). Stop every browser and script you started before you hand back, then hand back a
SHORT summary (counts and the FAIL rows) — the host reads the report file and the pictures.
