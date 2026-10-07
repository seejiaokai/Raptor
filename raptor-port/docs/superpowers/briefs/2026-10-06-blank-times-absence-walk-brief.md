# The walk brief — a man away for the whole day, on a seat with no times (`[BLANK-TIMES-ABSENCE]`, D605) and the crew list's crew-rest question for an SC seat (`[SC-PICKER-INTIME-REST]`) — 6 Oct 26

One walker, one world (D16). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen said —
pictures and a filled table. You do not review code and you fix nothing.

*(This same brief, word for word, is handed to four walkers working apart — each with its own share of the scenarios,
its own server, its own picture folder and its own files; none sees another's work. Your letter, your server, your
folders and your share are in the message that gave you this brief. Walk exactly your share.)*

**The scenarios**, each with its setup, action, expected result and what would disprove it:
`raptor-port/docs/superpowers/briefs/2026-10-06-blank-times-absence-scenarios-astra.md` §2 (numbered `S01`–`S38`, the
"Input type × seat oracle" table under them, and "Publication orders") and the host's additions at the foot of this
brief (numbered `H-…`). §1 of that file (the two roll-call tables) tells you where each kind of seat is made and where
each sign is drawn. **Walk ALL of your share, in the order given, and cite each by its number.** Its §3–§6 are about
code — not yours to judge.

## What the app should do

**A man who is away for the WHOLE day is flagged the moment he is seated anywhere that day — on a seat with no times
yet too.** A leave, a medical downchit, an overseas duty, or any other input that covers the whole day (the All day
tick, or hours typed 00:00–23:59 / 00:00–24:00) raises its red line in the day's warning list, the red ring and the C
chip on his puck, the moment he is put on:
- a flying line ("+ Line" and "+ Wave" make one with no take-off) — "On leave but planned to fly …" / "Downchit but
  planned to fly …" / "<type> clashes with …";
- a duty desk, a sim seat or body, a Ground Programme or Common Programme row with no start — "On leave but tasked — …"
  / "Downchit but tasked — …" / "<type> but tasked — …";
- an SC line whose shift times were cleared — MAIN like a desk ("… but tasked — SC AM"; an all-day Meeting stays the
  amber "… is on SC AM and also down for Meeting", with no clock printed), SPARE "<type> but standing SC SPARE — …";
- an AVALON or BB seat or desk with no shift times (a BB wave comes up with none) — "<type> but on BB SHIFT — overseas /
  medically down".
Where the seat has no name yet either, the sentence says **"this line"** / **"this row"**. The same sentence stays when
times are typed, and stays when they are cleared again. Each kind of seat keeps its exceptions exactly as with times —
the oracle table in the scenarios file is the answer sheet: a LOCAL leave may stand an SC SPARE or an AVALON / BB
place; ATT B may work a desk, a sim or a ground row but no jet seat; an ⓘ info-only row, a cancelled row or line and a
placeholder puck (ALL / ALL AVAIL) are never checked; **SANS Availability and an Upchit are not absences and raise
nothing anywhere.** A request already put on the Ground Programme is never flagged against its OWN row.

**A PART-day absence against a seat with no times stays silent** in the list (nothing to compare) until the seat has
times; so does the day before's or the day after's absence. **The crew list is unchanged:** before a drop it still
strikes a man's name for ANY absence that day when the seat has no times — so for a part-day absence, and for a local
leave on a standby seat with blank shift times, the name is struck before and the list says nothing after. That
difference is known; report it as RECORDED where your share meets it, not as a FAIL.

**On a published day nothing new happens to the issued face** (D177–D179): these warnings are frozen. The day goes out
with whatever its list said; seating a man or filing, changing or lifting an absence afterwards changes the WORKING
copy at once, reads "N pending", and takes the four sign-offs down (D103) — and View-only Sched's published face and
the 👁 look at the issued version keep what went out until the next amendment (AL). A warning that appears on an issued
face without an amendment, or a published day that reads pending with nothing changed, is a finding.

**The crew list asks about crew rest for an SC MAIN seat.** A man lands late (22:30 → clear 12:30 next day). An SC
shift with another man already in a MAIN seat and a typed B (its in-time) of 05:00: arming the other MAIN seat strikes
his name with "crew rest — not clear until 12:30" BEFORE he is placed — with the shift's start and end typed or blank —
and placing him raises the crew-rest breach with the same clearance time. Forward too: a shift ending late against
his early report tomorrow reads "crew rest — breaks <day>: he must be gone by …". An SC SPARE seat, and any AVALON / BB
seat, says nothing about crew rest. An EMPTY SC formation says nothing before the drop (known, filed) — the toast and
the list say it after.

The rulings, any number: `grep -h '^| D605 |' .claude/decisions-full/*.md` (from the repo root).

## Hard rules
- **Read-only on the app.** Never edit anything under `raptor-port/src`, `e2e`, `docs` (except your own output files
  below); never run `npm run build`, `npm test`, the e2e or smoke suites; never start or stop a server; never use git
  to change anything. The build you are served is frozen; a rebuild would mix two builds in one walk.
- **Your own files only** (`<L>` is your letter): scripts `raptor-port/scripts/handpass/bta-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/<L>/`; results
  `raptor-port/docs/handpass/parts/bta-<L>.json` and your report `raptor-port/docs/handpass/parts/bta-<L>.md`. Never
  open, list or read another letter's files.
- **Write every script with the Write tool and run the file** — never pass code through a shell heredoc or `node -e`
  (backslashes arrive mangled and it still exits 0). Run node from the `raptor-port` folder of the repo you were
  started in — `cd` there by its full path inside every command. Send long output to a file and read the file. Stop a
  script only by its own process id — never by name.
- **Every fixture through the app's own controls** (bug-check order §7.7): the Inputs page's form (type, the calendar,
  All day / AM / PM / Custom and its two time boxes, remarks; a medical type asks for a certificate — take its "no
  document" answer), the board's "+ Wave" (and its menu: Flying wave, SC, AVALON, BB) / "+ Line" / "+ Block" / "+ Row" /
  "+ Item", a line's or row's text boxes, a seat and the crew list (tap) or a real drag, a MAIN / SPARE badge, CX and
  ✕, ⓘ, a request's Accept / → Ground / → Unavail / take-off, a warning line's ✕ / ↺, the day's sign-off selects and
  Publish / Publish AL / Unpublish, the version picker and "Load onto working copy", the saved-plans menu, a day
  template, the top bar's Undo / Redo. The probe bridge (`window.DAYS`, `window.INPUTS`, `window.WARN`,
  `window.PEOPLE`, `window.SCHED`, `window.go`, `window.openScheduler`, `window.CURPAGE`) only to GET to a place and to
  READ state. If a state cannot be reached through a control, that is a finding — say so; never inject it. **Never sign
  in again mid-fixture on a world nobody has written to yet** (§7.7): make one write first; to change role in place use
  `window.raptorRole` through `page.evaluate`.
- **A step asserts what a person SEES** (§7.8, anti-pattern 21): the words of the warning line, the ring on the puck
  asserted as PAINTED (a computed `box-shadow`, not a class name), the chip's letter, the struck name and its reason in
  the crew list, the toast, "N pending", the sign-off line. A control is the thing a finger LANDS on. After each step
  save a picture AND OPEN IT (Read the PNG) before the step counts. A picture you did not open is not evidence — open
  the one behind every FAIL and every step on a published day, and say honestly how many you opened.
- **Sizes:** desktop 1440×900 for every scenario of your share, and phone 390×844 for the ones your share names.
- **Compare the specific warning naming YOUR man, never the day's total** — the demo week already carries warnings.
- Watch the browser's error list throughout; any console error, page error or 4xx is a finding.
- **What is NOT a finding (D56):** harm that exists only in data already stored when the code is correct going forward.
- Report defects with exact steps; never "fix" one, never work around one silently. A gesture that fails is looked at on
  its picture before it is called a defect (a scroll that parks the target under a bar manufactures findings).
- **A scenario with an EXPECTED line is judged PASS or FAIL** against the oracle table and "What the app should do"
  above. The ones this brief or your share marks **RECORDED** are observations: report exactly what each surface
  showed, no verdict.
- If a scenario cannot be walked, say so and why (NOT WALKED) — never mark it passed; walked in part is PARTIAL, with
  what was left. A conclusion of yours is not a finding until the host has reproduced it: report what the screen did
  and the exact steps, never a cause you did not see.
- You are not told whether anything is wrong with this build. Report what the screen did.
- **Budget your time:** where a scenario multiplies (every type × every seat; every order), walk the cases your share
  lists first, then as many more as fit; say exactly which you walked and which you did not.
- **The report is sent ONCE**, after every script and browser of yours is stopped.

## The drivers (read them first — they are the recipe)
`raptor-port/scripts/handpass/`: **`bta-host.mjs`** — the host's own short walk of this job, a complete working
example: a fresh world, an absence filed on the Inputs page (all day, and AM only), "+ Wave" (flying, BB, SC), a seat
armed and a struck name pressed in the crew list, "+ Item" on the Ground Programme, reading a man's warnings, his
pucks on the week and the day's list, publishing a day, View-only Sched's face, pictures, the results table. Start
from it. It imports **`bta-env.mjs`** (who X is — it must be imported FIRST) and stands on **`rbl-C-lib.mjs`**
(`fileInput` — the Inputs page's form, with `allday`, `span: 'am'|'pm'|'custom'`, `from` / `to`; `armSeat`, `rosterX`,
`crewListRow`, `pressName`, `toastNow`, `seeWeek`, `painted`, `listFull`, `groundRow`, `typeBox`) which re-exports
**`stk-B-lib.mjs`** (`fresh`, `boardTo`, `addFlyWave`, `addStandby(p, di, 'sc'|'avalon'|'bb')`, `addLine`, `ff` — a
line's box, `seat`, `handPut(p, key, id)` — arm any seat or a row's "+ add" (`g:<di>.<ri>.+`, `d:<di>.<blk>.<ri>`,
`s:<di>.oft.<ri>.p`, `a:<di>.<ri>.+`) and tap the name, `itAdd` / `itSet`, `warns`, `picEl`, `publishOrig` /
`publishAL`), `wh-lib.mjs` / `wh-b-lib.mjs` (`world`, `reloadAs`, `openList` / `readList` on `#eWeek` or `#vWeek`,
`press` / `hide` / `again` — a line's ✕ / ↺, `readBoard`, `dayPucks` / `puckPic`, `warnsOf`, `versions`, `look`,
`load`, `insights`, `member`, `row` / `savePart`, `pic`), `dbrA-W1-lib.mjs` (showDay, boardOn / boardOff, boardText,
drag, signDay, publishDay, publishAL, unpublish, door — Undo / Redo, head — the day's version tag, pending chip and
sign-off line), `dbrA-W2-lib.mjs` (signOut and the Inputs-page gestures), `rbl-D-lib.mjs` (`addRow` / `setRow` /
`delRow`, `undo` / `redo` / `reload`). Env: `HP_URL` (your server), `HP_SHOTS`, `HP_OUT`, `HP_PHONE=1`. Sign in
`ad`/`a` (admin, Saber) or `us`/`us` (member, Ranger). The demo week is Mon 13 – Sun 19 Jul 26 (day index 0–6; Tue = 1;
the weekend is duty crew only). **X for the fixtures: `split` (callsign Vandal, a pilot — the front seat, `…0.p`),
idle across the demo week, no input of his own, SC DAY and NIGHT current, not a SANS man; a second idle man: `bullet`
(Zulu, a WSO, SANS). The demo's own whole-day absence: Cobra (`taipan`), overseas leave all Wednesday 15 Jul.** With
the default settings a 22:30 landing ends his day at 00:30 and he is clear at 12:30.

## What to return (your `bta-<L>.md`, and the same as your final message, under ~800 words plus the table)
1. One table row per scenario (or per case of a multiplied scenario): its number · what you did (the controls) · what
   the screen said, word for word where it is a warning · PASS / FAIL / PARTIAL / NOT WALKED (why) / RECORDED · the
   pictures.
2. Findings, each: the exact steps, what was expected (the scenario's line, the oracle or the ruling), what happened,
   the picture.
3. The errors seen. 4. What you did NOT walk and why. 5. One line: how many pictures you saved and how many you opened.

## The host's additions

- **H-01 (walker A).** The oracle on screen, a sample that covers every column and every row group: for each of
  **LL, OL, ATT C, ATT B, OD, Training (all day), Meeting (all day), SANS Availability, Upchit** — file it for X for
  Tuesday, then put X on, in turn, a seat with NO times of each family: a new flying line, an SC MAIN and an SC SPARE
  (the SC wave's shift start and end cleared), a BB MAIN (it comes up blank), a new duty row, a new sim row, a new
  Ground Programme row, a Common Programme row, and a BB desk if you can make one ("+ Block" with a template whose
  "For wave" is BB — if no control makes one, say so). EXPECTED: the oracle table's cell, word for word as in "What the
  app should do"; then type times on the seat — the same answer. Walk LL, OL, ATT C and ATT B on every family first.
- **H-02 (walker A).** A brand-new duty row ("+ Row" in a duty block), a brand-new sim row and a brand-new Ground
  Programme row — each with NO name and NO times — and X on each, away all day (OL). EXPECTED: three red lines, each
  ending "— this row" (never "— Sim", "— duty" or a hole); name each row: its name replaces "this row".
- **H-03 (walker B).** The Logic page, group "Leave, downchit and personal inputs": a row says a seat with no times yet
  is still checked against an absence that covers the whole day, and that an absence for only part of the day waits
  until the seat has times. EXPECTED: present and readable at desktop and at phone width, no clipped words, found by
  the page's search on "no times"; the three warning rows above it unchanged.
- **H-04 (walker C) — RECORDED.** In S08's fixture, after X is placed on the SC MAIN seat: the exact words of the
  crew-rest line (it names the shift and a time — record which time it calls the "start").
- **H-05 (walker C) — RECORDED.** S02's SPARE puck: with the same man in a MAIN and a SPARE seat of ONE SC formation
  and a local leave all day, record what each of his two pucks wears (ring, chip), with the shift's times blank and
  typed.
- **H-06 (walker D).** A day published WITH the warning (X on leave all day, seated on a blank line, then published):
  View-only Sched's face and the 👁 look at the Original both show the red line and the ring; nothing pending; the four
  sign-offs hold. Then lift the leave on the Inputs page: the working copy loses the line and reads pending; the face
  keeps it until AL1.
- **RECORDED in Astra's list** (report exactly what each surface showed; the host judges them): the crew list's struck
  name wherever the list then says nothing (a part-day absence; a local leave on a blank standby seat — S01, S18); S21
  is superseded by H-02; S38's exports.
