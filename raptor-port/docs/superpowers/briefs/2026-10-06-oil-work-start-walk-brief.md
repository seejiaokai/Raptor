# The walk brief — OIL from the entered In-time / Rally; a published day keeps the OIL it went out with (`[OIL-WORK-START]`, D591, D592) — 6 Oct 26

One walker, one world (D16). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen said —
pictures and a filled table. You do not review code and you fix nothing.

*(This same brief, word for word, is handed to four walkers working apart — each with its own share of the scenarios,
its own server, its own picture folder and its own files; none sees another's work. Your letter, your server, your
folders and your share are in the message that gave you this brief. Walk exactly your share.)*

**The scenarios**, each with its setup, action, expected result WITH ITS NUMBERS, and what would disprove it:
`raptor-port/docs/superpowers/briefs/2026-10-06-oil-work-start-scenarios-astra.md` §2 (numbered `S01`–`S42`), its
"Shared setup and numerical checks", its "Mandatory ordered-pair expansion" (the action letters T+ T~ T− Lr Ld Lt S P A
U V Op Or M) and §3, the numbers table — the answer sheet. Its §1 (two roll-call tables) tells you where each thing is
shown and which control does what. The host's additions are at the foot of this brief (`H-…`). **Walk ALL of your
share, in the order given, and cite each by its number.** Its §4–§7 are about code — not yours to judge. *(That file
calls the register `…-oil-work-start-register.md`; it has since been renamed `…-oil-work-start-behaviour-register.md`.)*

## What the app should do

**OIL** is earned leave: work on a weekend or public holiday banks a half day (HO, 0.5) or a full day (FO, 1) into the
Leave War once the day is PUBLISHED. A man's day is measured from the start of his first event to the end of his last,
gaps included; **6h01 or more is a full day, anything under is a half**.

**1. A flying line's day starts at its entered In-time / Rally.** For a man on an ordinary flying line the day runs from
the line's REPORT to landing plus the debrief (2h). The report is the earliest In-time or Rally typed at the top of his
wave that applies to his formation — a line naming his formation's callsign before a wave-wide one, each of the two
activities apart; a clock later than the take-off is the evening before. Where no line gives a clock — nothing typed,
or something the app cannot read as a time — the report is the NOMINAL one: take-off less the Logic page's "Nominal
report before T/O" (3h). SC, AVALON and BB lines, sims, duty desks, Ground and Common Programme rows are their written
times and nothing else.

**2. A published day keeps the OIL it went out with.** Three Logic values enter the sum: "Nominal report before T/O",
"Flight debrief after land", "Full-day OIL threshold". Changing one AFTER a day is published must NOT move that day's
OIL anywhere: the Leave War cell (FO / HO), the worked times on the day's sheet ("worked 07:00–13:15"), the OIL tracker
row and balance, the green edge on the published face (View-only Sched). Instead, where the change WOULD write some
man's OIL record for that day differently — his amount, or his worked times — the day reads **one pending change**: the
"N pending" chip on Edit Schedule's day and on the board, the Amendments box, and in the changes window's **To go out**
tab a line **"OIL on this day · Logic values changed since it was published"** with a sub-line per changed value
("Logic · Nominal report before T/O  3h → 2h30") and one per man ("Ranger · OIL  full day · 07:00–13:15 → half day ·
07:30–13:15"; "nothing" where he would earn none). The four sign-offs fall. Putting the value back clears the line and
the sign-offs stand again. Signing again and publishing the amendment (AL) applies today's values. A Logic change that
would write every record on that day exactly as it stands raises NOTHING (no pending, sign-offs standing).

**3. An In-time / Rally typed or changed AFTER publishing** is an ordinary change to the day: pending as ever, and the
OIL moves only when the amendment is published.

**4. Sign-offs.** On a day NOT yet published, or with an amendment waiting, the four sign-offs fall when a Logic change
made after they signed would alter that day's OIL as it now stands, and stand again when the value is put back.

**5. The OIL tracker** prints EVERY worked period of a credit ("06:00–06:30, 10:00–15:00").

**Known, filed, NOT a finding of this walk — report what you saw as RECORDED:** the Unpublish warning may say
withdrawing an AMENDMENT would strand a man's leave when in fact the earlier version's OIL comes back (S02 —
`[UNPUB-WARN-AL-RESTORES]`); a take-off-equals-landing line with its in-time at take-off and the debrief set to zero
earns nothing while the day's advisory still says it "earns from the report and debrief" (S34's last case —
`[OIL-ZERO-SPAN-SORTIE]`); the changes window has no history line for a Logic change (`[HIST-PER-PAGE]`).

The rulings, any number: `grep -h '^| D591 |' .claude/decisions-full/*.md` (from the repo root).

## Hard rules
- **Read-only on the app.** Never edit anything under `raptor-port/src`, `e2e`, `docs` (except your own output files
  below); never run `npm run build`, `npm test`, the e2e or smoke suites; never start or stop a server; never use git
  to change anything. The build you are served is frozen; a rebuild would mix two builds in one walk.
- **Your own files only** (`<L>` is your letter): scripts `raptor-port/scripts/handpass/ows-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-06-oil-work-start/<L>/`; results
  `raptor-port/docs/handpass/parts/ows-<L>.json` and your report `raptor-port/docs/handpass/parts/ows-<L>.md`. Never
  open, list or read another letter's files, nor `ows-host*`'s results or pictures.
- **Write every script with the Write tool and run the file** — never pass code through a shell heredoc or `node -e`
  (backslashes arrive mangled and it still exits 0). Run node from the `raptor-port` folder of the repo you were
  started in — `cd` there by its full path inside every command. Send long output to a file and read the file. Stop a
  script only by its own process id — never by name.
- **Every fixture through the app's own controls** (bug-check order §7.7): the board's "+ Wave" (and its menu: Flying
  wave, SC, AVALON, BB) / "+ Line" / "+ Block" / "+ Row" / "+ Item", a line's or row's text boxes, "+ In-time / Rally"
  and its line's text box and ✕, a seat and the crew list (tap) or a real drag, the day's four sign-off selects and
  Publish / Publish AL / Unpublish, the version picker and "Load onto working copy", the saved-plans menu, a day
  template, the OIL Earn mode's switches, the Logic page (Edit rules → the box → Tab; Reset to standard), the Inputs
  page's form, the Leave War's own sheets, the top bar's Undo / Redo. The probe bridge (`window.DAYS`,
  `window.INPUTS`, `window.WARN`, `window.PEOPLE`, `window.SCHED`, `window.VCONF`, `window.go`, `window.CURPAGE`) only
  to GET to a place and to READ state. If a state cannot be reached through a control, that is a finding — say so;
  never inject it. **Never sign in again mid-fixture on a world nobody has written to yet** (§7.7): make one write
  first; to change role in place use `window.raptorRole` through `page.evaluate`.
- **A step asserts what a person SEES** (§7.8, anti-pattern 21) — and for OIL that means the REAL downstream number,
  all three every time a scenario says "holds" or "moves": the Leave War grid's cell for the man and date (FO / HO /
  nothing), the worked times (the OIL tracker's row, and the day's sheet when you open the cell), and his balance in
  the tracker. Then the day itself: the "N pending" chip, the To go out line's words, the sign-off selects, the version
  tag (ORIG / AL1). After each step save a picture AND OPEN IT (Read the PNG) before the step counts. A picture you did
  not open is not evidence — open the one behind every FAIL and every "holds" step, and say honestly how many you
  opened.
- **THE PENDING CHIP HAS A TWIN.** The day head carries TWO chips of one class: the waiting-to-go-out chip
  ("1 pending") and the changes window's own ("10 changes" / "3 new"). Read the first ONLY as
  `.dpend:not(.dnew):not(.dchg)` — the older helper `head().pending` reads whichever comes first and will report
  "10 changes" as pending. `ows-host.mjs` shows the right read.
- **Sizes:** desktop 1440×900 for every scenario of your share, and phone 390×844 (`HP_PHONE=1`) for the ones your
  share names.
- Watch the browser's error list throughout; any console error, page error or 4xx is a finding.
- **What is NOT a finding (D56):** harm that exists only in data already stored when the code is correct going forward.
- Report defects with exact steps; never "fix" one, never work around one silently. A gesture that fails is looked at
  on its picture before it is called a defect (a scroll that parks the target under a bar manufactures findings).
- **Every scenario is judged PASS or FAIL against its EXPECTED line and the numbers table** — except what this brief
  marks RECORDED: report exactly what each surface showed, no verdict.
- If a scenario cannot be walked, say so and why (NOT WALKED) — never mark it passed; walked in part is PARTIAL, with
  what was left. A conclusion of yours is not a finding until the host has reproduced it: report what the screen did
  and the exact steps, never a cause you did not see.
- You are not told whether anything is wrong with this build. Report what the screen did.
- **Budget your time:** walk the numbered scenarios of your share first, then the ordered pairs your share lists, then
  as many more pairs as fit; say exactly which you walked and which you did not. Each fresh scenario starts in a fresh
  world (`world()` — a new browser context) unless it says it continues another.
- **The report is sent ONCE**, after every script and browser of yours is stopped.

## The drivers (read them first — they are the recipe)
`raptor-port/scripts/handpass/`: **`ows-host.mjs`** — the host's own short walk of this job, a complete working
example: a fresh world, "+ Wave" with a callsign, take-off, landing and a man seated through the crew list, the four
sign-offs and Publish, the Leave War cell and the OIL tracker row read and pictured, a Logic value changed through its
own box, the day's pending chip and the To go out list read, View-only Sched's puck, Publish AL, a reload, and
"+ In-time / Rally" typed. Start from it. It stands on **`stk-A-lib.mjs`** (`world`, `reloadAs`, `pic`, `judge`, `row`,
`savePart`, `toWeek`, `toBoard`, `closeBoard`, `addFlyingWave(p, di, { cs, to, ld, p1, w1 })`, `addItBtn`, `setItLine`,
`intimes`, `publishNew`, `publishAm`, `logicSet(p, 'reportLead' | 'debrief' | 'oilFullMin', '2h30')`, `logicGet`,
`lwOpenMonth`, `lwCellOf`, `oilRow`, `closeOil`, `dayHead`, `alPanel`, `dayWarns`, `boardText` / `weekText`),
**`stk-B-lib.mjs`** (`addFlyWave`, `addStandby(p, di, 'sc'|'avalon'|'bb')`, `addLine`, `ff` — a line's box, `seat`,
`handPut(p, key, id)` — arm any seat or a row's "+ add" (`g:<di>.<ri>.+`, `d:<di>.<blk>.<ri>`, `s:<di>.oft.<ri>.p`,
`a:<di>.<ri>.+`) and tap the name, `itAdd` / `itSet` / `itDel`, `logicBlank`, `publishOrig` / `publishAL`, `hours` —
Insights), `wh-lib.mjs` / `wh-b-lib.mjs` (`openList` / `readList`, `versions`, `look`, `load`, `member`, `dayPucks`),
`dbrA-W1-lib.mjs` (showDay, boardOn / boardOff, boardText, drag, signDay, publishDay, publishAL, unpublish, door —
Undo / Redo, head), `dbrA-W2-lib.mjs` (signOut and the Inputs-page gestures), `rbl-C-lib.mjs` (`fileInput` — the Inputs
page's form), `rbl-D-lib.mjs` (`addRow` / `setRow` / `delRow`, `undo` / `redo` / `reload`), `lib.mjs` (`oilMode` — the
board's OIL Earn button, `readDay`). Env: `HP_URL` (your server), `HP_SHOTS`, `HP_OUT`, `HP_PHONE=1`. Sign in `ad`/`a`
(admin, Saber) or `us`/`us` (member, Ranger). The demo week is Mon 13 – Sun 19 Jul 26 (day index 0–6; Sat = 5, 18 Jul;
Sun = 6, 19 Jul), its weekend inside a Leave War period and carrying duty crew only; the second demo week starts Mon
20 Jul. **Men free on the demo weekend, all on the Leave War's roster: `bane` (Ranger, a pilot), `stiff` (Saber, a
pilot — the admin's own puck), `split` (Vandal, a pilot).** A WSO: pick one from the crew list who has nothing on that
day. The tracker row reads like "Ranger IP 1 +1 +1 18 Jul AUTO Weekend/PH FLT · 07:00–13:15 1 left" — the figure after
the name is his balance.

## What to return (your `ows-<L>.md`, and the same as your final message, under ~900 words plus the table)
1. One table row per scenario (or per case of a multiplied scenario / per ordered pair): its number · what you did (the
   controls) · what the screen said — the cell, the worked times, the balance, the pending chip and the list's words,
   the sign-offs · PASS / FAIL / PARTIAL / NOT WALKED (why) / RECORDED · the pictures.
2. Findings, each: the exact steps, what was expected (the scenario's line, the numbers table or the ruling), what
   happened, the picture.
3. The errors seen. 4. What you did NOT walk and why. 5. One line: how many pictures you saved and how many you opened.

## The shares

- **A — a Logic change under a published day; the pending line; the sign-offs.** S08, S10, S11, S12, S13, S04, S06,
  S07, S41. Phone too: S08 and S10 (the chip, the To go out list — its sub-lines must be readable, nothing clipped —
  and the Leave War cell). Ordered pairs, both orders, from an unpublished and from a published day: {Lr, Ld, Lt} ×
  {S, P, A}. Host additions H-01, H-02.
- **B — the reporting lines and where the day starts.** S09, S33, S25, S26, S27, S28, S29, S30, S31, S32, S23, S24,
  S34. Phone too: S09 and S24. Ordered pairs: {T+, T~, T−} × {P, A, Lr}. Host addition H-03.
- **C — downstream: the tracker, the Leave War, Unpublish, requests, members.** S01, S03, S05, S02 (RECORDED for the
  warning's words; PASS / FAIL for the cell, times and balance), S16, S17, S18, S14, S15, S42. Phone too: S01 (the
  tracker's two-period line must fit its box or wrap cleanly) and S42. Ordered pairs: {U, V, M} × {Lr, T~}. Host
  addition H-04.
- **D — the other seats and doors.** S35, S36, S37, S38, S39, S40, S19, S20, S21, S22. Phone too: S38 (the OIL Earn
  switches). Ordered pairs: {Op, Or} × {Lr, Ld, A}. Host addition H-05.

## The host's additions

- **H-01 (walker A).** Undo and Redo of a Logic change through the top bar's own buttons, on S08's published Saturday:
  after "Nominal report before T/O" 3h → 2h30 the day reads 1 pending; press Undo — EXPECTED: the value is 3h again,
  nothing pending, the sign-offs back; Redo — pending again. Then "Reset to standard" on the Logic page after a change:
  the same as putting the value back. If Undo does not take a Logic change back, report exactly what it did (RECORDED).
- **H-02 (walker A).** The Logic page itself, desktop and phone: the row for "Nominal report before T/O" says a flying
  line with no In-time / Rally entered counts its OIL day from that time; the OIL row says the day runs from the line's
  entered In-time / Rally, that a published day keeps the OIL it went out with, and that an SC spare / AVALON / BB earn
  nothing unless switched on in OIL Earn. EXPECTED: present, readable, no clipped words; the page's search finds the
  OIL row on "published day keeps".
- **H-03 (walker B).** The work-hours bar beside OIL (Insights → Work hours), RECORDED: for S09's man before and after
  the in-time is typed, what Insights says his hours are and what his OIL day is. (They may differ where no in-time is
  entered — the bar starts at step, OIL at the nominal report. Report the two numbers; no verdict.)
- **H-04 (walker C).** A guest and a member: with S08's fixture pending (a Logic value changed under a published
  Saturday), sign in as the member (`us`) — View-only Sched's Saturday shows the published version, the man's
  full-day green edge, and no control to change a Logic value or publish; the Leave War shows the same FO. EXPECTED:
  nothing a member presses moves the OIL.
- **H-05 (walker D).** OIL Earn mode on the WORKING copy of a published Saturday after a Logic change (S08's fixture):
  the mode's figure for the man shows what WOULD go out (half day), while View-only Sched's published face still shows
  the full-day edge. EXPECTED: the two differ exactly so; switching a man off and on again in the mode leaves the
  Logic line in To go out standing beside the "What this day earns" line while he is off, and alone when he is back on.
