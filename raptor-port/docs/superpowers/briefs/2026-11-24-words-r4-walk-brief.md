# Walk brief — round 4 of the words pass (his D2521): the bell's changed-input line and six passing notes — 24 Nov 26, chat 170

You are a WALKER: you drive the running app as a person would, in a real browser, and say what you saw. You fix nothing,
change no file under `src/`, run no git command, and never run `npm run build`, `npm run test:e2e`, any Playwright TEST
runner or any unit test (another chat holds the PC's checks lock). Two builds are already made and frozen — never write
into either:
- **NEW** — `D:/rw4/build-new` — the build under test (branch `claude/words-pass-163`, app code as at commit `39367445f`).
- **OLD** — `D:/rw4/build-main` — `main` before this change (commit `19637da31`), for a control run ("as on main today").

**Folder:** `C:\Users\User\projects\Raptor-words\raptor-port` — work only here (NOT `C:\Users\User\projects\Raptor`, which
is another chat's). You write ONLY: your script(s) `scripts/handpass/wr4-<your id>-*.mjs`, your pictures under
`docs/img/handpass/2026-11-24-words-r4-walk/<your id>/` (a sub-folder per run — never reuse a picture name), and your
report `docs/handpass/parts/wr4/<your id>-report.md`. Nothing else, anywhere. Never pass a script inline to the shell
(backslashes are lost, an apostrophe fails to parse): write it with the file tool and run the file from `raptor-port`. A
rewrite and its run are never sent in one step; print a version line at the top of every run. There is no `jq` on this PC.

## Before you write a line
1. Read `docs/walk-scripts.md` §3 to §7 whole — how a walk script is written here and what each trap has cost.
2. Read `docs/bug-check-order.md` §7.2 to §7.10 (find them: `grep -n '^\*\*7\.' docs/bug-check-order.md`), and the
   checklist's lessons list (`docs/bug-check-checklist.md`, "The lessons of §7.11"). In your report, for each of lessons
   1, 3, 9, 16, 22, 23, 25, 28 and 30 name the step that covers it or why it cannot apply to your scenarios; the others
   are about gestures, layout or motion this change does not touch (say so in one line if you agree).
3. Your recipes — scripts whose routes PASSED on this app today; copy their helpers, never guess a control from the source:
   - `scripts/handpass/wr4-lib.mjs` — the shared helpers (import them; do not edit the file): a world served from a build
     folder inside the test browser (`newPage(size, state, dir, engine)` — no port, no server; `dir` is NEW by default),
     `signIn`, `handOver` (the next person on another device, the saved world carried over), `fileInput` / `editInput`
     (an input filed and changed through the Inputs calendar's day and the input's own window), `openBell`, `bellFit`,
     `bellClip`, `shot`, `catchToast` / `toastPair` (a passing note held while it is pictured), `bundleOf`.
     Set `WR4_OUT` (your picture folder), `WR4_NEW=D:/rw4/build-new`, `WR4_OLD=D:/rw4/build-main` BEFORE the import
     (`process.env.X ||= …` then `await import('./wr4-lib.mjs')`).
   - `scripts/handpass/wr4-host.mjs` — the host's own run on these builds (three bell cases, and the same three made on
     OLD then read on NEW): the shape to copy for "X acts, Y reads on his phone".
   - `scripts/handpass/words-r4.mjs` — chat 163's script: its `q4a` (a time typed in a schedule box and in an input's
     row), `q4b` (a placeholder put by a tap, a puck dragged off its seat and back), `s1` (the Inputs page's look-ahead)
     and `s2` (a week of 2028 loaded, a man put on the Saturday, the four sign-off boxes, Publish). DO NOT RUN this file
     (an unfiltered run empties the approved pictures' folder); copy the steps.

## Your world
- **Two sizes:** a desktop, Chromium 1440×900 (`'desk'`); his iPhone's size, 402×874 with touch (`'phone'`, Chromium's
  phone emulation — the saved world can be carried between Chromium contexts). Geometry scenarios are ALSO run in WebKit
  at 402×874 (`newPage('phone', undefined, NEW_DIR, 'webkit')`), every act made in that one context by signing out and
  in (WebKit here cannot carry a saved world over, and shows "Couldn't save that document…" once — a fact of the test
  browser, not a finding). On the phone use real taps and take a picture within about 100 ms of each tap as well as the
  settled one (§7.10).
- **People:** `ad` / `a` is Saber, the scheduler (an admin). `us` / `us` is Ranger (id `bane`), a member. `rocky` is Hex.
  Read other people off `window.PEOPLE` (id → `cs`, the callsign); find other sign-ins on the sign-in screen's own list
  or `e2e/app.ts`. A scheduler is always an admin (D785) — never set up one who is not.
- **Two people acting in turn share one world:** `handOver`, or sign out and in within one tab. Two live tabs never
  sync — a FAIL from two tabs is no finding.
- **Make every state through the app's own controls** (§7.7). The bridge on `window` (`INPUTS`, `NOTICES`, `PEOPLE`,
  `DAYS`, `go(page)`, `CURPAGE`, `loadWeek`, `openScheduler`) is for READING and for getting to a place only; a state set
  directly never proves a control works — if you must, say so in the report.
- The demo week is Mon 13 Jul 26 to Sun 19 Jul 26; the recipes file inputs on Wed 15 Jul 26 and move them to Thu 16 Jul.
- Watch and report console errors, page errors and failed requests on every page (the helpers collect them in `facts`).
- Log `bundleOf(page)` once per world, so the report says which build each reading came from.

## What was promised — the owner's ruling D2521 (24 Nov 26), in the words built
The bell's line for an input someone else changed (line 1, bold: the input's name and date; line 2: what happened, " · ",
who did it):
- **Q1** a change of KIND reads "<old> changed to <new>": "LL changed to OL · Saber", "Training changed to Meeting ·
  Saber", title or no title. "Renamed — was <old title>" only when a title's own words change. (The host's reading, not
  checked with him: a title given to an input that had none, a title taken away, and an Attach's "To" changed keep
  "Renamed — was …".)
- **Q2** a half day: "Now LL (AM) · Saber" / "Now LL (PM)" (an input with no title — its kind); "Now AM" (a titled
  input); the day moved as well: "Now Thu 16 Jul (AM)"; back to a whole day: "Now all day".
- **Q3** more than two changes in one save: the first two, then "and 1 more change" / "and N more changes" — "Now Thu
  16 Jul, renamed — was Training, and 1 more change · Saber", two lines on his iPhone; a part after a comma starts with
  a small letter unless it starts with a name or "You"; a replaced Leave War bid is said after the rest (" · replaces
  your LL bid") and never counted.
- Lines saved before this build still read (the host's promise): an old kind change as "Renamed — was LL", an old half
  day as "Now 00:00–12:00 am".
The passing notes:
- **Q4a** a time the app cannot read, typed into an input's start or end: "2560 is not a time. Try 0900 or 09:00." —
  the value as typed, the first bad box where both are bad.
- **Q4b** a puck dragged back onto its own seat: "Ranger — already in that seat" (the tap's words).
- The Inputs page's look-ahead saved: "Everyone now opens on the next 4 weeks, to Sunday"; one week: "the next week".
- Publishing a weekend or holiday no Leave War period covers: "<the publish note> · No Leave War period for 2028, so no
  OIL can be earned for this day. Create the period on the Leave War." — the day's warning list's own sentence.
- "Leave War period" with capitals: "Only a scheduler can create a Leave War period"; "The 2028 Leave War period is
  created. Open its dates for bidding here."; the hover of the "Create the 2028 period" button, "Creates the 2028 Leave
  War period, with nothing open for bidding, and takes you to the Leave War to open its dates".
- A member saving a day's OIL list: "Only a scheduler can answer from this list".

**Judging.** A scenario with an EXPECTED line is PASS or FAIL against it. RECORD means: copy the words exactly and judge
nothing — the host judges. A finding is a difference between the screen and an EXPECTED line or a sentence quoted above.
A problem that lives only in data already stored is not a finding (the owner's D56). NOT WALKED (with why) is never FAIL.
Stop after 3 failed attempts at one gesture and move on. Every reading of a bell line is taken from the list as drawn
(`openBell`), with its picture; for a note, from the note while it shows.

## Scenarios — walker **a** (the bell's words)
Saber acts on the desktop; the reader reads on the phone AND once on the desktop. One fresh world per scenario letter.
**A1 — a kind change, no title (D2521 Q1).** Hunter-or-any third person is not needed: Ranger files an LL for himself;
Saber changes it to OL. EXPECTED Ranger: bold "OL Wed 15 Jul", "LL changed to OL · Saber". Then Saber files an LL for
Ranger AND Hex and changes it to OL: EXPECTED both read the same words; Saber's own bell holds no line for it (D769 — the
one who did it is never told).
**A2 — a kind change, titled.** A Training for Ranger and Hex 09:00–10:00, each in its own world, changed to a Meeting
with nothing else touched: (i) title "Brief" — EXPECTED "Training changed to Meeting · Saber", bold name "Brief"; (ii)
title "Meeting" — EXPECTED "Training changed to Meeting · Saber" and no "renamed"; (iii) title "meeting" — RECORD; (iv)
title "Training · Safety" — EXPECTED "Training changed to Meeting · Saber" and no "renamed" (D2521 Q1: nobody changed a
title).
**A3 — a kind change that adds or drops what a kind has. RECORD each exactly** (not ruled): (a) Training titled "Range
brief" → LL; (b) Ranger's LL made AM, then (a separate save) changed to Training with nothing else touched; (c) a
Training 00:00–12:00 → LL; (d) an all-day LL → OL and AM in one save; (e) an Attach with a "To" → Training. For each
also RECORD the saved input (`recOf`) before and after.
**A4 — a real rename.** Title "Training" → "Range brief" only: EXPECTED "Renamed — was Training · Saber" (capital R).
RECORD: a title given to an input that had none; a title taken away; an Attach's "To" changed.
**A5 — the half day.** Ranger's all-day LL → AM: EXPECTED "Now LL (AM) · Saber"; → PM: "Now LL (PM) · Saber"; AM → all
day: "Now all day · Saber"; all day → Thu 16 Jul and AM in one save: "Now Thu 16 Jul (AM) · Saber". RECORD: AM →
09:00–11:00 if the window lets it; an AM leave only moved to another day; a Training typed 00:00–12:00 (EXPECTED clock
times, never "(AM)"). Sweep: which kinds offer AM / PM in the window (list them); repeat all-day → AM on one medical kind
and on SANS Availability if they offer it — EXPECTED "Now <kind> (AM)". Is there ANY door to a titled half day ("Now
AM")? Say which, or that there is none.
**A6 — three or more changes in one save.** On a Training for Ranger and Hex: (a) day → Thu 16 Jul, title "Training" →
"Range brief", remark changed: EXPECTED "Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber". (b) exactly
two changes (day and title): EXPECTED both said, no "more". (c) four changes (as (a) plus a third person added): EXPECTED
ends "and 2 more changes" — RECORD the whole line (a callsign keeps its capital). (d) kind → Meeting, remark changed and
Hex taken off: RECORD the whole line Ranger reads (EXPECTED: "Training" keeps its capital wherever it stands; ends "and 1
more change"); and Hex reads only "You were taken off · Saber". (e) three people added, day moved, remark changed:
RECORD. (f) only the remark changed: RECORD; only the dates extended on a multi-day input with its "till" tick: RECORD
(EXPECTED: no "remark" change is said or counted when nobody touched the remark, D953). (g) can ONE save of the window
cancel an input as well as change it? RECORD (if not, say so — the schedule's cancel is a save of its own; make one and
RECORD its line).
**A7 — every door.** The same change (an LL → OL, or for timed inputs the start time) made through each door a person
has; for each, RECORD whether the door exists, and the line the other person reads — EXPECTED the same words as A1 / A5
whatever the door: the input's window opened from (i) the Inputs list's row, (ii) the Inputs calendar's day card, (iii)
the input's row on Edit Schedule (its pencil or type), (iv) its row on the Scheduler Board, (v) a tap on its bell line;
the in-place start / end boxes of an input's row on Edit Schedule and on the Scheduler Board, and of ONE man's row of an
input shared by two (RECORD who is told what); a bar dragged to another day on the Inputs calendar — once cancelled at
its question (EXPECTED no line), once confirmed (RECORD the line; an AM leave moved: RECORD).
**A8 — the long line on his iPhone (Chromium 402 AND WebKit 402, then the desktop).** A6 (a) and (c) in the list, plus
the longest honest case you can make (a 40-letter title renamed, a range across two months, two more changes), plus
enough lines to scroll. EXPECTED: A6 (a)'s second row is two lines in its box (about 307px wide), whole, "· Saber"
visible; nothing cut with "…" or clipped; the age at the right not overlapped; the unread dot in place; no sideways
scroll of the list or the page; "Mark all read" and the "↓ N more" foot not covered. Measure each row's boxes (line
2's box against the age's and the dot's); RECORD the longest case's line count.

## Scenarios — walker **b** (saved lines, roles, orders)
**B1 — lines the OLD build wrote, read on the NEW build.** As `wr4-host.mjs` h4: on OLD make an LL → OL, an LL → AM, and
the three-change save; carry the world to NEW; Ranger reads on the phone and the desktop. EXPECTED "Renamed — was LL ·
Saber" and "Now 00:00–12:00 am · Saber"; RECORD the three-part line. Then tap each line: EXPECTED the input's own window
opens on that input as it now stands, the line goes read, no error. Then on NEW change the same inputs again: EXPECTED the
new lines in the new words beside the old ones.
**B2 — a member's own save, and the permissions gate.** As Ranger: (i) try to file a Training for Ranger and Hex
(RECORD whether a member may); (ii) open a Training Saber filed for Ranger and Hex and in one save change its kind to
Meeting, its title, its hours and its remark (RECORD whether a member may). EXPECTED where the app lets him: the save
goes through with its ordinary note (never "could not be saved"), survives a reload, and Hex (and Saber, as its filer)
reads the first two changes then "and N more change(s) · Ranger".
**B3 — Undo and Redo of a save that wrote a new line.** Saber: Ranger's LL → OL and AM in one save; press the top bar's
Undo (`#undoBtn`), then Redo. After each, hand over and RECORD Ranger's bell (lines, words, unread or read), then again
after Ranger has READ the line and Saber presses Undo → Redo. Run the SAME steps on OLD (LL → OL only) and RECORD it:
EXPECTED NEW behaves as OLD in everything but the words — no doubled line, no line in the old words, no lit bell with
an empty list, no refused Redo.
**B4 — what else could change a saved line.** After A1's change: reload; sign out and in; step to next week and back;
open the Leave War and come back. EXPECTED after each: one line, the same words, the same read state.
**B5 — a replaced Leave War bid.** Ranger has a pending LL bid on a day of an open bidding month (find the route on the
Leave War as a member — the recipe `scripts/handpass/lw-input-range-walk.mjs`, `walkM`); Saber moves a Training of
Ranger's onto that day, renames it and changes its remark in one save, answering the swap question. EXPECTED: "…, and 1
more change · replaces your LL bid · Saber" — the bid said after the rest and not counted (RECORD the whole line). At most
3 attempts at the fixture; else NOT WALKED.
**B6 — the Leave War's copy of a leave. RECORD only.** An approved leave on the Leave War (the demo's own, or one
approved there): (a) retyped to another leave kind in its window on the Inputs page — the line(s) its owner reads, and
that the Leave War's cell and the input agree; (b) the same change made on the Leave War itself — its line; (c) its
remark changed. One line each, never two for one act.
**B7 — the tap and the list's furniture (phone and desktop; lesson 23).** With five or more lines, one of them two rows
tall: tap a "… changed to …" line and a "… and 1 more change" line — EXPECTED each opens the input's own window on the
input as it now stands (the Inputs page behind it), and the line goes read; the unread count on the bell falls by one;
"Mark all read" reads them all; the "↓ N more" foot counts the lines below rightly while scrolling; the bell on the
Scheduler Board's own bar shows the same lines in the same words. Close the list each way it closes (its ✕ if any,
Escape, a tap outside, the bell again).
**B8 — the plain-user round (§7.0a).** As Saber then as Ranger, start to finish: file an input, open it, change it,
close its window each way it closes (Save, Cancel, ✕, Escape, a tap outside — with and without an unsaved change),
Undo; then look at every other place that shows the result — the Inputs list, the Inputs calendar, Edit Schedule's row,
View-only Sched, the other person's bell. RECORD anything an everyday user would trip on.

## Scenarios — walker **c** (the passing notes)
**C1 — a time the app cannot read, every door (desktop, then the phone; Saber, then Ranger on his own input).** Doors:
(1) an input's start / end boxes on its row on Edit Schedule (words-r4.mjs `q4a` (2)); (2) the same row on the Scheduler
Board; (3) one man's row of an input shared by two; (4) any in-place time box on the Inputs page's list (say if there is
none); (5) the input's own window (its boxes are the browser's time pickers — say whether a bad time can be entered at
all, and what Save answers). In each: type `2560` in Start and leave by Tab, and again by Enter; `0975` in End; both bad.
EXPECTED: "2560 is not a time. Try 0900 or 09:00." (the value as typed, the first bad box), the box back to what it held,
nothing saved, no bell line to anyone. Then `abc`, `25:00`, `0960`, a value with spaces round it: EXPECTED "<typed> is
not a time. Try 0900 or 09:00."; `9` and a 60-letter string: RECORD (and picture how the long note sits, phone too).
Then (lesson 16) tap away, tap the box afresh and type `0900`, then `09:00`: EXPECTED each saves 09:00. Compare with a
take-off box of the week (words-r4.mjs `q4a` (1)): EXPECTED the same sentence.
**C2 — a puck dragged back onto its own seat (desktop; Edit Schedule, then the Scheduler Board).** Lift, carry visibly
off, bring back and let go on the same seat: a flying seat, a duty desk, a ground row's first and second man, a sim
seat, one man of an input's own row, and a placeholder (ALL AVAIL) in a seat. EXPECTED: "<callsign> — already in that
seat" ("ALL AVAIL — already in that seat"), the man still there, nothing new for Undo. RECORD what the seat itself shows
at the drop. The tap's twin for the placeholder (words-r4.mjs `q4b` (1)): EXPECTED the same words. Phone: RECORD whether
a drag is possible and what it says.
**C3 — the look-ahead (desktop and phone; words-r4.mjs `s1`).** Save 4 weeks, Sunday ticked: EXPECTED "Everyone now
opens on the next 4 weeks, to Sunday". 1 week ticked: "Everyone now opens on the next week, to Sunday". 1 week unticked:
EXPECTED "Everyone now opens on the next week". 2 weeks unticked: "Everyone now opens on the next 2 weeks". Bad figures
(0, 53, x): RECORD the note; EXPECTED nothing saved. Cancel: nothing changes. As Ranger: EXPECTED no way to edit it;
RECORD what his Inputs page opens on.
**C4 — publishing a day no Leave War period covers (desktop, then phone; words-r4.mjs `s2`, the week of 31 Jan 2028).**
(a) a man on the Saturday, signed, published: EXPECTED "Saturday published and approved · No Leave War period for 2028,
so no OIL can be earned for this day. Create the period on the Leave War." — one full stop at its end; and the day's
warning list reads the identical sentence. (b) the same with an input on that Saturday whose OIL question was left for
Later: RECORD the whole note (EXPECTED: no "..", no sentence starting with a small letter, the no-period sentence there
once). (c) published from the Scheduler Board: EXPECTED the same sentence. (d) an amendment published on that Saturday:
RECORD. (e) a weekday of that week: EXPECTED no such sentence. (f) phone: the note whole on screen — picture it, and
measure its box against the screen.
**C5 — "Create the 2028 period" (desktop; the week's warning list and the Scheduler Board's).** Hover the button in
each: EXPECTED the hover quoted above. Press it: EXPECTED "The 2028 Leave War period is created. Open its dates for
bidding here." and the Leave War opens on 2028 with nothing open for bidding. RECORD Undo's hover after it, and what a
second press in another fresh world's Board says. As Ranger: EXPECTED no such button (RECORD); if any real route reaches
the refusal, EXPECTED "Only a scheduler can create a Leave War period".
**C6 — the OIL day list as a member. RECORD only.** Open a day's OIL list as Saber and save an answer (PASS if it
saves). As Ranger: RECORD whether any route shows the list or its Save (chat 163 found none). Say plainly "not
reachable" if so.
**C7 — the plain-user round for these notes (§7.0a).** After each note: is it readable for as long as it shows, on the
phone and the desktop; does it cover the control just pressed; does a second note replace it cleanly.

## What you hand back
- Your script(s) and pictures as above, pictures named `<scenario>-<step>-<desk|phone|wk>.png`. Open every picture you
  save before you count its step as looked at; on the phone open the "right after the tap" picture beside the settled one.
- Your report file, at most 90 lines, plain words: for each scenario and size PASS or FAIL against each EXPECTED line,
  or the words you RECORDED (exactly, in quotes), naming the picture that decides it; each FINDING with the exact steps,
  what the screen showed, what was expected, and its picture; errors seen; what you did NOT walk and why; the lessons
  line (step 2 above). Send your report ONCE, after stopping every script and browser you started; your final message
  is a 15-line summary of it.
