# Walker W2 — multi-squadron batch 1, steps 0–4, the full check (18 Nov 26)

You are a walker (Sonnet). You drive the REAL built app in a scripted real browser and return pictures and a filled
table. You do not read the app's code for bugs and you do not decide whether a finding is real — the host does, from
your pictures. **Read `raptor-port/docs/walk-scripts.md` §3 to §7 before writing any script.** Read nothing under
`raptor-port/docs/superpowers/briefs/` except this file and `2026-11-18-multi-sqn-b1-walk-w1-brief.md` (W1's brief: its
"machine and its traps", "What is NOT a finding", "Seeded sign-ins" and "Sizes" sections apply to you word for word —
read them; ignore its scenarios and its report path).

## What is different for you
- **Your files:** scripts only as `scripts/handpass/msq/msq-w2-*.mjs`; pictures only under
  `docs/img/handpass/2026-11-18-multi-sqn-b1/w2/<run>/` (set `process.env.MSQ_WHO='w2'` and `process.env.MSQ_RUN` BEFORE
  importing `./msq-lib.mjs`). Write nothing else. Do not commit. Do not touch `src/`, `dist/` or any other file.
- **Recipes proven by the host — copy them, do not reinvent:** `scripts/handpass/msq/msq-host-probe.mjs` (sign in, pages,
  Logout) and `scripts/handpass/msq/msq-host-s46.mjs` (passed 18 Nov 26 04:58: filing an input, the Leave War's holiday
  form, and `calPick(iso)` — the ONE way to pick a date on any of the app's calendars: it steps the month FORWARD or BACK
  as the date needs. W1 lost three scenarios by only stepping back; never write your own month stepping).
  `scripts/handpass/msq/msq-w1-util.mjs` has `bodyText(page)` (the visible words) and `groundNames(page, di)`.
- **A run that hangs:** every script ends with `X.fin(w)`, which closes its browser. If a run of yours is still going
  when you want to stop it, stop THAT process only, by its own id (PowerShell `Get-CimInstance Win32_Process -Filter
  "Name='node.exe'"` → find your script's name in CommandLine → `Stop-Process -Id <that id>`). Never a blanket kill.
- Already proven — do NOT repeat: each sign-in's five faces at both sizes, S1 on a desktop, publishing in one squadron,
  R32's sentences, inputs and holidays separated, reload and a second tab.

## Scenarios (each EXPECTED is PASS or FAIL; RECORD rows you only record)

**T1 — Undo stays with its person and squadron (desktop).** As ad9 on Edit Schedule, open Fri 17 Jul's board
(`X.W.board(w, 4)`), add a ground row named "W2 UNDO" with Kestrel on it (copy how W1's `msq-w1-main.mjs` S3 adds a ground
row), close the board. Picture. Then press the top bar's ↶ ONE press at a time, reading Fri 17's ground row names after
each (`U.groundNames(page, 4)`) and taking a picture, until "W2 UNDO" is gone or 4 presses. RECORD how many presses it
took (adding a row and seating a man may be two steps). EXPECTED: it goes within those presses. Then press ↷ (Redo) once
and RECORD whether it comes back. Leave it there (make sure "W2 UNDO" is on the day: add it again if needed). Logout, sign
in ad: EXPECTED ad's ↶ is greyed (picture it, read its `disabled`); Logout, ad9: EXPECTED "W2 UNDO" is still on Fri 17 and
his ↶ is greyed (Undo is cleared at sign-out).

**T2 — a Logic setting stays in its squadron (desktop).** As ad9 open Logic. Picture. Change ONE number setting you can
find on screen (for example a crew-rest or a brief time box) to a different value through its own control, and save it the
way the page saves (if a question comes up, take its default). Picture. Logout, ad: open Logic: EXPECTED 142's same
setting shows its ORIGINAL value. Logout, ad9: EXPECTED 149's shows the new value. Then put 149's back to the original.

**T3 — the bell (desktop).** In a fresh world: as us9 (Osprey) file an input of kind "Other" on Mon 14 Dec 2026 for
himself (copy msq-host-s46.mjs's S4 steps, `calPick('2026-12-14')`). Logout. Then open the bell (the top bar's bell
button) as ad, as ad2 and as ad9 in turn: picture each, RECORD every line each sees. EXPECTED: no line about Osprey's
input reaches ad or ad2 (142's admins); RECORD whether ad9's bell has one.

**T4 — the Tracker, each squadron its own (desktop).** As ad open the Tracker: RECORD its course name and student names,
open one student (tap the name), picture, change one mark through the Tracker's own controls if one is plainly offered
(else RECORD that none was), close it by its own close. Logout, ad9: open the Tracker: EXPECTED 149's own course; the mark
ad changed is NOT on 149's student; Logout, ad: EXPECTED ad's change still there. Pictures at each step.

**T5 — the phone plain-user round, as ad9 (phone, `phone:true`).** First prove `X.signOut` on the phone: sign in ad9,
picture the screen, press Logout through the phone's side menu (`X.signOut(w)`; if it fails, find the menu button on the
picture and press that, picture the open menu) — RECORD `{reloaded}`. Sign in ad9 again. Then, each with a picture
within about 100 ms of the tap AND a settled one: Edit Schedule → open Wed 15 Jul's board → close by its own ✓ Done;
the Leave War → MY LEAVE → close by its own close; a person's name on the war grid (tap it) → close by its own close; the
bell → close; the Tracker → open; the Inputs page → the calendar. EXPECTED every window opens over the page and closes
leaving the page as it was, and every person's name in each is a 149 name (Kestrel, Falcon, Osprey, Heron, Merlin, Raven,
Harrier, Shrike, Gannet, Condor). Then sign out and in as us (Ranger) on the same phone world and do the Leave War → MY
LEAVE and the Inputs calendar: EXPECTED only 142's names, none of the ten above.

**T6 — S1 on the phone (phone).** In a fresh phone world as ad9: open Wed 15 Jul's board, add a ground row named
"W2 PHONE" with Kestrel (by taps), ✓ Done. Logout; sign in ad: EXPECTED 142's Wed 15 Jul has no "W2 PHONE" (the week and
the board — open and close the board). Logout; ad9: EXPECTED still there. If adding by taps fails three times, mark
BLOCKED with the picture of where it stuck and go on.

Budget: about 60 minutes of walking. Stop a scenario after 3 failed attempts at one gesture and mark it BLOCKED with the
picture of where it stuck. Do not invent a control: if you cannot find one on screen, say BLOCKED and picture the screen.

## Your report
Write it to `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/job5/w2-report.md`:
a table — scenario · size · what you did · EXPECTED · what you saw (the words on screen, exact) · PASS / FAIL / RECORD /
BLOCKED · picture file(s) — then the console errors each run collected (`X.fin` prints them), then anything odd you saw on
the way (each with a picture). Stop every browser and script you started before you hand back (by its own id), then hand
back a SHORT summary (counts and the FAIL rows) — the host reads the report file and the pictures.
