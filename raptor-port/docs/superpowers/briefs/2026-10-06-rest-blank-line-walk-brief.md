# The walk brief — the crew-rest rule and a line with no times (`[REST-BLANK-LINE]`, D602) — 6 Oct 26

One walker, one world (D16). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen said —
pictures and a filled table. You do not review code and you fix nothing.

*(This same brief, word for word, is handed to three walkers working apart — each with its own share of the scenarios,
its own server, its own picture folder and its own files; none sees another's work. Your letter, your server, your
folders and your share are in the message that gave you this brief. Walk exactly your share.)*

**The scenarios**, each with its setup, action, expected result and what would disprove it:
`raptor-port/docs/superpowers/briefs/2026-10-06-rest-blank-line-scenarios-astra.md` §2 (numbered `S01`–`S29`, its
"Baseline B", and the table of action pairs under it — "the orders") and the host's additions at the foot of this brief
(numbered `H-…`). §1 of that file (the roll-call of places) tells you where each sign is drawn. **Walk ALL of your
share, in the order given, and cite each by its number.** Its §3–§6 are about code — not yours to judge.

## What the app should do

A man needs 12 hours of rest before he flies. When he ended late yesterday and is told to report inside those 12 hours
today, the app says so: a red **"Crew rest breach"** line in today's warning list, a red ring and a chip on each of his
pucks today, and a **dotted** red ring on yesterday's puck with a "Breaks <day>" line under yesterday's list; the crew
list strikes his name with "crew rest — not clear until …" before he is placed; a softer amber **"Tight turning"** note
covers the nominal report; the same day's amber **"Tight turn"** note covers two sorties too close together. The breach,
its ring and the dotted mark stay LIVE on a published day's face (D183–D185): they are worked out afresh, are never a
pending change, and never touch the four sign-offs.

**A flying line with no take-off yet is not measured**: "+ Line" and "+ Wave" add a line that comes up blank, and a man
seated on one keeps every crew-rest warning his other commitments raise — the blank line neither breaks crew rest nor
hides a breach, on his own day or on the day before, whatever order the lines are drawn in. If the line already
carries an instruction — a typed **Brief**, its wave's **In-time / Rally**, an SC line's typed **B** — that instruction
is read as his report. A man whose only line that day is blank still flies that day: anything scheduled earlier (a
meeting, a sim, a duty post, a typed input) that starts inside his 12 hours is a breach, and the sentence says the line
has no take-off yet rather than naming a report. With nothing at all to measure, nothing is said. The amber "DT" chip
(two or more sorties) still counts a line with no times. The Logic page says this rule under Crew rest.

The rulings, any number: `grep -h '^| D185 |' .claude/decisions-full/*.md` (from `C:/Users/User/projects/Raptor`).

## Hard rules
- **Read-only on the app.** Never edit anything under `raptor-port/src`, `e2e`, `docs` (except your own output files
  below); never run `npm run build`, `npm test`, the e2e or smoke suites; never start or stop a server; never use git
  to change anything. The build you are served is frozen; a rebuild would mix two builds in one walk.
- **Your own files only** (`<L>` is your letter): scripts `raptor-port/scripts/handpass/rbl-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-06-rest-blank-line/<L>/`; results `raptor-port/docs/handpass/parts/rbl-<L>.json`
  and your report `raptor-port/docs/handpass/parts/rbl-<L>.md`. Never open, list or read another letter's files.
- **Write every script with the Write tool and run the file** — never pass code through a shell heredoc or `node -e`
  (backslashes arrive mangled and it still exits 0). Run node from `C:/Users/User/projects/Raptor/raptor-port` — `cd`
  there by its full path inside every command. Send long output to a file and read the file. Stop a script only by its
  own process id — never by name.
- **Every fixture through the app's own controls** (bug-check order §7.7): the board's "+ Wave" / "+ Line" /
  "+ In-time / Rally", a line's text boxes (callsign, mission, Brief, take-off, landing), a seat and the crew list (tap)
  or a real drag, a line's CX and ✕, a wave's grip, Auto sort, the Ground Programme's "+ Row", the Inputs page's form,
  the Logic page's boxes, a warning line's ✕ / ↺, the day's sign-off selects and Publish / Publish AL / Unpublish, the
  version picker and "Load onto working copy", the saved-plans menu, the top bar's Undo / Redo, the week arrows and the
  calendar. The probe bridge (`window.DAYS`, `window.WARN`, `window.PEOPLE`, `window.SCHED`, `window.go`,
  `window.openScheduler`, `window.CURPAGE`, `window.CURWEEK`) only to GET to a place and to READ state. If a state
  cannot be reached through a control, that is a finding — say so; never inject it. **Never sign in again mid-fixture
  on a world nobody has written to yet** (§7.7): make one write first; to change role in place use `window.raptorRole`
  through `page.evaluate`.
- **A step asserts what a person SEES** (§7.8, anti-pattern 21): the words of the warning line, the count on the day's
  bar, the ring on the puck asserted as PAINTED (a computed `box-shadow` / `outline-style`, not a class name), the chip's
  letters, the dotted ring on yesterday's puck, the "Breaks …" line, the struck name and its reason in the crew list,
  the toast. A control is the thing a finger LANDS on (`document.elementFromPoint` at its centre). After each step save
  a picture AND OPEN IT (Read the PNG) before the step counts. A picture you did not open is not evidence — open the one
  behind every FAIL and every step on a published day, and say honestly how many you opened.
- **Sizes:** desktop 1440×900 and phone 390×844 for every scenario of your share unless its row says one size; a short
  screen (844×390 or 1280×700) where the scenario names one.
- **Compare the specific warning, never the day's total** — seating a man on a second line legitimately adds a
  "double turning" line and changes counts.
- Watch the browser's error list throughout; any console error, page error or 4xx is a finding.
- **What is NOT a finding (D56):** harm that exists only in data already stored when the code is correct going forward.
- Report defects with exact steps; never "fix" one, never work around one silently. A gesture that fails is looked at on
  its picture before it is called a defect (a scroll that parks the target under a bar manufactures findings).
- **A scenario with an EXPECTED line is judged PASS or FAIL.** The ones this brief marks **RECORDED** are observations:
  report exactly what each surface showed, no verdict.
- If a scenario cannot be walked, say so and why (NOT WALKED) — never mark it passed; walked in part is PARTIAL, with
  what was left. A conclusion of yours is not a finding until the host has reproduced it: report what the screen did
  and the exact steps, never a cause you did not see.
- You are not told whether anything is wrong with this build. Report what the screen did.
- **The report is sent ONCE**, after every script and browser of yours is stopped.

## The drivers (read them first — they are the recipe)
`raptor-port/scripts/handpass/`: **`rbl-host.mjs`** — the host's own short walk of this job, a complete working example:
a fresh world, "+ Wave", a line's boxes, a seat from the crew list, "+ Line", reading a man's warnings, his pucks on the
week and the day's list, pictures, the results table. Start from it. It stands on **`stk-B-lib.mjs`** (`fresh`,
`boardTo`, `addFlyWave`, `addStandby`, `addLine`, `ff` — a line's box, `seat`, `itAdd` / `itSet` — the In-time / Rally
lines, `warns`, `picEl`, `logicSet` / `logicRead`, `publishOrig` / `publishAL`), which re-exports **`wh-lib.mjs`** and
**`wh-b-lib.mjs`** (`world`, `reloadAs`, `openList` / `readList` — a day's bar and every line as painted, on `#eWeek`
(Edit Schedule) or `#vWeek` (View-only Sched); `press` / `hide` / `again` — a line's ✕ / ↺; `readBoard`; `pucks` /
`dayPucks` / `pk` / `puckPic`; `warnsOf`; `sign4`, `pubOrig`, `pubAL`; `versions`, `look`, `load`; `insights`; `member`;
`row` / `judge` / `savePart`; `pic`), `dbrA-lib.mjs` (launch, context, page, signIn, go, settle), `dbrA-W1-lib.mjs`
(showDay, boardOn / boardOff, boardText, drag, signDay, publishDay, publishAL, unpublish, door — Undo / Redo: 'top' or
'board', toasts, head — the day's version tag, pending chip, marker, sign-off line), `dbrA-W2-lib.mjs` (signOut and the
Inputs-page gestures), `seat-lib.mjs` (handPut), `p6-lib.mjs` (fileTimed, fileRange — a request filed through the Inputs
page). Env: `HP_URL` (your server), `HP_SHOTS`, `HP_OUT`, `HP_PHONE=1`. Sign in `ad`/`a` (admin, Saber) or `us`/`us`
(member, Ranger). The demo week is Mon 13 – Sun 19 Jul 26 (day index 0–6; Tue = 1; the weekend is duty crew only); the
next week starts Mon 20 Jul. **X for the fixtures: `waldo` (callsign Scribe, a WSO — the back seat, `…0.w`), idle across
the demo week; a second idle man if you need one: read `window.PEOPLE` and the day's programme and pick one with nothing
on Monday or Tuesday.** With the default settings a 22:30 landing ends his day at 00:30 and he is clear at 12:30.

## What to return (your `rbl-<L>.md`, and the same as your final message, under ~800 words plus the table)
1. One table row per scenario: its number · what you did (the controls) · what the screen said, word for word where it
   is a warning · PASS / FAIL / PARTIAL / NOT WALKED (why) / RECORDED · the pictures.
2. Findings, each: the exact steps, what was expected (the scenario's line or the ruling), what happened, the picture.
3. The errors seen. 4. What you did NOT walk and why. 5. One line: how many pictures you saved and how many you opened.

## The host's additions

- **H-01 (walker A).** Monday: X lands 22:30. Tuesday: X's ONLY line is a blank one, and X is put on a new Ground
  Programme row "SQN BRIEF" 08:00–09:00 (the row's own boxes and name box). EXPECTED: Tuesday's list carries a red crew
  rest breach for X whose sentence reads "… his day starts 08:00 (SQN BRIEF), and he is on a line with no take-off yet —
  only 7h30 rest." (no "report" in it, no "NaN", no "Infinity"); his Tuesday pucks ringed red (solid, never dashed);
  Monday's puck dotted. Then type a take-off 18:00 on the blank line: the sentence becomes "… before the 15:40 report
  …" Then take X off the flying line altogether: the breach goes (a meeting-only day needs no rest).
- **H-02 (walker B).** The Logic page, group "Crew rest": a row says a flying line with no take-off yet is not measured
  (it neither breaks crew rest nor hides a breach), that a typed Brief or the wave's In-time / Rally is read as the
  report, and that anything scheduled earlier still starts his day. EXPECTED: present and readable at desktop and at
  phone width, no clipped words, found by the page's search on "take-off"; no other row of the group changed.
- **H-03 (walker C) — RECORDED.** Tuesday: "+ Wave" → SC; clear the first shift's start and end; put X in its first MAIN
  seat. Record every warning line that names X or that shift, word for word, and his puck's chip.
- **RECORDED in Astra's list** (report exactly what each surface showed; the host judges them): **S15** (leave and
  downchit against a line with no times), the SANS part of **S28**, and in **S01** which of the puck copies (SANS card,
  Personal Inputs row, Unavailable row, crew list) wear the dashed ring and the dotted ring. Everything else in those
  scenarios keeps its EXPECTED line.
