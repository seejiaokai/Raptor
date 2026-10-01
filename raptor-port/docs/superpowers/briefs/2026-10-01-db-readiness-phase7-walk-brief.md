# The walk brief — [DB-READINESS] group A phase 7 (1 Oct 26)

Three walkers (Opus), one world each (D16). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the
screen and the stored data said — pictures and a filled table. You do not review code and you fix nothing.

## Hard rules
- **Read-only on the app.** Never edit anything under `raptor-port/src`, `e2e`, `docs` (except your own output files
  below), never run `npm run build`, `npm test`, the e2e or smoke suites, never start or stop a server, never use git to
  change anything. The build you are served is frozen in `raptor-port/dist-p7`; a rebuild would mix two builds in one walk.
- **Your own files only:** scripts `raptor-port/scripts/handpass/p7-<letter>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-01-dbr-phase7/<letter>/`; results `raptor-port/docs/handpass/parts/p7-<letter>.json`
  and your report `raptor-port/docs/handpass/parts/p7-<letter>.md`.
- **Every fixture through the app's own controls** (bug-check order §7.7): the Inputs page's form, the board's seats and
  palette, the day's sign-off boxes and Publish button. The probe bridge (`window.DAYS`, `window.INPUTS`, `window.PEOPLE`,
  `window.SCHED`, `window.SIMW`, `window.go`, `window.openScheduler`) only to GET to a place and to READ state. If a state
  cannot be reached through a control, that is a finding — say so; do not inject it.
- **A step asserts what a person SEES** (§7.8, §10 anti-pattern 21): after each step save a picture AND OPEN IT (Read the
  PNG) before the step counts. A mark is asserted as painted (text on screen, a computed style), never only a class.
- **Both widths** where the scenario says phone: desktop 1440×900 and phone 390×844 (`HP_PHONE=1` in the drivers).
- Watch the browser's error list throughout; any console error, page error or 4xx is a finding.
- Run node scripts from `C:/Users/User/projects/Raptor/raptor-port` (cd there by full path in every command).
- **What is NOT a finding (D56):** harm that exists only in data already stored when the code is correct going forward.
- Report defects with exact steps; never "fix" one. A gesture that fails is looked at on its picture before it is called a
  defect (a scroll that parks the target under a bar manufactures findings).

## The drivers (read them first — they are the recipe)
`raptor-port/scripts/handpass/`: `dbrA-lib.mjs` (launch, context, page, signIn, go, rows, step, reloadCompare, check, save,
shot), `dbrA-W1-lib.mjs` (table/S/pic, toEdit, showDay, boardOn/boardOff, drag, signDay, publishDay, publishAL, unpublish,
door (Undo/Redo), toastSpy/toasts, head), `p6-lib.mjs` (boot, world — a fresh world at the fixed date Wed 15 Jul 26, fact,
saveFacts, fileTimed, fileRange, handOver, oilButton, oilPucks, oilTap, accBtn, dropLanded, changesList, stored),
`dbrA-W2-lib.mjs` (openEdit, redate, delReq, editRemarks, signOut), `seat-lib.mjs` (handPut — arm a seat and pick a person
or `allavail` / `all` from the board's crew list; seatHolds; chipAt; allChips; allSwitches; toast), `lib.mjs` (lwCell — a
man's Leave War cell for a date), and a finished example: `p6c-walk-k.mjs`. Env: `HP_URL` (your server), `HP_SHOTS`,
`HP_OUT`, `HP_TAG=p7`. Sign in `ad`/`a` (admin, Saber) or `us`/`us` (member, Ranger). The demo week is Mon 13 – Sun 19 Jul
26 (day index 0–6; Tue = 1, Sat = 5, Sun = 6); the weekend is non-flying. Person ids are in `window.PEOPLE`.

## What to return (your `p7-<letter>.md`, and the same as your final message, under ~900 words plus the table)
1. One table row per scenario: id · what you did (the controls) · what the screen said · what the stored data / the OIL
   credit said · PASS / FAIL / NOT WALKED (why) · the pictures.
2. Findings, each: the exact steps, what was expected (the ruling or the plan's line), what happened, the picture.
3. The errors seen. 4. What you did NOT walk and why.

---

## Walker A — a placeholder on a Personal request row (plan §1.1; Astra §1.1, scenarios 1–13, 26–28)
Server `http://localhost:4205`. The promise: ALL / ALL AVAIL on a member's "Personal" request row wears its COUNT and
opens the ALL AVAIL window, on a weekday and a weekend, OIL Earn off and on; the crowd is frozen at publication; and
NOBODY EARNS from it (a Personal request never asks about OIL) — on screen ("<callsign> — a personal request earns no
OIL", inert, in the window's "Who earns OIL" half and on the requester's own puck) and in the Leave War (no FO / HO credit
for a crowd man from that row).
Walk, at least:
- A1 timed Personal on Tuesday, ALL AVAIL in the extras under its row; A2 all-day Personal on Saturday, ALL in the NAME
  BOX; A3 timed on Saturday, ALL in the extras; A4 all-day on a weekday, ALL AVAIL in the extras; A5 both pucks on one
  row. For each: the chip on the board AND on the edit week (its number, its title), the window (who is listed, its
  "which answer" line), OIL Earn on (Saturday): the chip, the window's earn half, each man's title, the row's name cell.
- A6 the negatives: the row cancelled (CX), made information-only (ⓘ), the request taken off (✕ on its row), a Personal
  row with only a named extra — no chip each.
- A7–A13 with a placeholder AND a named extra on the row: edit the request's times; retype Personal → Training (and
  back); move it to another day (D468: what the scheduler added stays with the old day — back if the request returns
  before that day is next saved); take it off; delete it; hand it to another member — after each: the chip and window,
  Undo, Redo, a reload (`reloadCompare`).
- A26–A28 publish the Saturday with the Personal crowd (sign the four boxes, Publish), read the Leave War cells of three
  crowd men with nothing else on that day (no credit), then file a leave for ONE crowd man: the working copy's count
  drops, View-only Sched's issued face keeps the count it went out with (and its window says "when this day was
  issued"), the day reads pending, the four sign-offs fall (D103); Undo the leave → equal again.
- The roll-call's other rooms: a version preview and a saved-plan preview of that day (the chip and its window agree;
  a saved plan says "as things stand now"); the next-week peek (no chip); the member's view (reads the chip and window,
  no earn controls); the phone (A1 and A3 at 390 px: the chip, the window as a bottom panel, the reason readable);
  the changes window (no extra "count changed" line of its own).

## Walker B — sim brief flags and the second spare sim seat (plan §1.2, §1.3; Astra scenarios 14–25, 36)
Server `http://localhost:4206`.
- B14–B19: on the board, an OFT row labelled `EP-1` 10:00–11:00 with two aircrew; a ground row "OPS BRIEF" with ALL AVAIL
  at 09:45–09:58 → the sim men are LISTED in the window and wear the amber flag, the reason "No time for the OFT EP-1
  brief — OPS BRIEF sits inside 09:45–10:00"; move the ops brief to 11:05–11:25 → the debrief sentence (11:00–11:30);
  outside both → no flag; a man not on the sim → clean; a ground crewman riding the sim → clean. The AMT block (rows
  BRIEF 11:00 · BOX 11:30–12:30 with passengers · DEBRIEF 12:30): an event at 11:10–11:20 and at 12:40–12:50. Edit a
  time BEHIND the open window: the flag follows. The warning list itself: put a NAMED man on a ground row inside his own
  sim brief — the list's line reads the same sentence. Phone: the flag and its wrapped reason stay with the man.
  **The issued face:** publish the day with the overlap, then change the sim's time on the working copy so the overlap
  is gone → View-only Sched's window still flags him (the record's own sim), the working copy's does not.
- B20–B25: a FULL sim row (OFT with both seats and two extras; AMT BOX with two passengers) shows a spare PAIR; put a man
  on the SECOND spare by tap-arm + the crew list, and (another row) by a real pointer drag from the crew list. Then read
  the stored day row (`L.rows(p)` → `weeks/13-07-2026#<di>`): every entry of `pax` / `more` is text, the skipped seat
  `""`, NO `null`; the man sits where he was dropped; the first spare is still offered. Undo, Redo, reload; publish the
  day and read the issued version's row the same way; the changes window shows one placement line.
- B36 one compound day: the padded seat, a Personal row with a placeholder, an OIL decision (Saturday, OIL Earn, tap a
  man off), publish, Unpublish, publish again; reload after each — the same seats, crowd, decisions, versions.

## Walker C — the doors, the name box, the previews, the stored lists (plan §1.4, §1.5, §1.7; Astra 29–35, 37)
Server `http://localhost:4207`.
- C29–C32 **every door a placeholder could reach a cockpit by**: on a flying line's two cockpit seats, each for ALL and
  ALL AVAIL — tap-arm the seat then tap the puck in the crew list; a real pointer drag from the crew list; a drag of a
  placeholder already standing on a ground row / sim seat onto the cockpit (the source must keep it); the edit week's
  own arm + crew list; the phone's tap-arm. Expected every time: refused with a reason on screen, the seat empty, no
  pending mark, no Undo step, no line in the changes window. ANY door that lets it in is a real finding (not D56).
- C33 **the name box of another man's request row — a picture for the owner.** A Training request for one man on
  Saturday (answer YES to the OIL question), landed on the Ground Programme. Put a DIFFERENT named man in the row's NAME
  BOX (arm the name seat, pick him from the crew list; and by drag). Record exactly what the app does: is it allowed,
  who shows on the row, what the Inputs page says the request's person is, what OIL Earn shows for the requester and for
  the man in the box (earns? inert? his title), and after publishing what each man's Leave War cell says. Then the same
  row with that man in the EXTRAS instead (D18: he earns). Save clear pictures of both.
- C34 a saved plan of a day with an ALL AVAIL row, previewed: the chip's title and the window's line both say "who is
  free as things stand now" and show the same number; an issued version previewed: both say "when this day was issued";
  a tap in a preview's window writes nothing to the working day.
- C35 the member (`us`/`us`) and the admin open the same chip, desktop and phone: the same list and flags; the member
  has no earn controls.
- C37 the stored lists, each through the app's own controls, a reload after each (`reloadCompare`), and LOOK:
  (i) the stores list (a jet's stores editor, the pencil): remove EVERY store → reload → still empty (not the standard
  six back); (ii) the cancel-reason list (a CX sheet's editor): remove every reason → reload → still empty; (iii) Quals →
  Edit quals: remove every column (a wired column asks twice) → reload → still none; put things back with each editor's
  Reset where it has one. (iv) Leave War ⚙ Settings → + Counter: add counters until the form says the list is full
  ("60 counters is the most the app keeps. Delete one to add another." — Add disabled), reload: all the squadron's
  counters are still there. (v) **Hidden warnings — observe only, do not judge:** on Edit Schedule hide one warning on
  the week the app opens on (13 Jul) and one on the next week (20 Jul); reload and sign in again; then sign out and in as
  the same admin: which of the two is still hidden? Record exactly — it is an open question for the owner
  (`OUTSTANDING.md` `[WARN-HIDE-KEPT]`). (vi) A Post In with no Post Out, then a full out-and-back, a sixth Leave War
  event row with a band, a Tracker ball's typed details and a hidden / re-ordered chart, a medical document attached to
  a downchit: reload after each and compare what the screen shows.
