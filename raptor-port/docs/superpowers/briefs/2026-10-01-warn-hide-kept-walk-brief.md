# The walk brief — [WARN-HIDE-KEPT] hidden warnings (D469, D471, D472, D475) — 1 Oct 26

Three walkers (Opus), one world each (D16). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the
screen said — pictures and a filled table. You do not review code and you fix nothing.

**What the app should now do.** A scheduler taps ✕ on one line of a day's issues list (Edit Schedule's day list, or the
Scheduler Board's panel). That warning is then hidden — for everyone, across a reload and a sign-in — until someone taps
↺ on it. While hidden: the pucks carry no flag for that item (no ring, chip, dashed ring, dotted "breaks tomorrow"
mark, nor the red time box of a nought-minute line); its line stays where it is in the list, struck out and darker,
with ↺; it is not counted ("4 issues" reads "3 issues", and the count line says nothing about a hidden one); with every
issue of a day hidden a quiet "✓ No issues" bar still opens the list (the board's heading: "No conflicts flagged for
<day> ✓"). View-only Sched and a look at a version (👁) show the struck line with NO button. It comes back by itself
when the situation changes. On a day ALREADY PUBLISHED the hide waits for the next amendment: ONE pending change, the
four sign-offs fall, the published face keeps the flag until the amendment is out; each version keeps the hides it
went out with. The scenarios, each with its expected result and what would disprove it:
`raptor-port/docs/superpowers/briefs/2026-10-01-warn-hide-kept-scenarios-astra.md` (Astra's 44 — cite them by number).
The rules: `raptor-port/docs/superpowers/specs/2026-10-01-warn-hide-behaviour-register.md` (WH1–WH13). The picture the
owner approved: `raptor-port/docs/mock/warn-hide.html` (pictures in `raptor-port/docs/mock/img/warn-hide/`).

## Hard rules
- **Read-only on the app.** Never edit anything under `raptor-port/src`, `e2e`, `docs` (except your own output files
  below), never run `npm run build`, `npm test`, the e2e or smoke suites, never start or stop a server, never use git to
  change anything. The build you are served is frozen in `raptor-port/dist-wh`; a rebuild would mix two builds in one walk.
- **Your own files only:** scripts `raptor-port/scripts/handpass/wh-<letter>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-01-warn-hide/<letter>/`; results `raptor-port/docs/handpass/parts/wh-<letter>.json`
  and your report `raptor-port/docs/handpass/parts/wh-<letter>.md`.
- **Every fixture through the app's own controls** (bug-check order §7.7): the ✕ / ↺ on a line, the board's seats and
  crew list, the Inputs page's form, the day's sign-off selects and Publish / Publish AL / Unpublish buttons, the
  version picker and "Load onto working copy", the top bar's Undo / Redo. The probe bridge (`window.DAYS`,
  `window.WARN`, `window.PEOPLE`, `window.SCHED`, `window.go`, `window.openScheduler`, `window.CURPAGE`, `window.CURWEEK`)
  only to GET to a place and to READ state. If a state cannot be reached through a control, that is a finding — say so;
  do not inject it. **Never sign in again mid-fixture on a world nobody has written to yet** (§7.7): make one write first.
- **A step asserts what a person SEES** (§7.8, anti-pattern 21): after each step save a picture AND OPEN IT (Read the
  PNG) before the step counts. A struck line is asserted as PAINTED (computed `text-decoration-line`), a puck's flag by
  its ring / chip on screen, a button by being the topmost thing at its own centre — never only a class.
- **Both widths** where the scenario says so: desktop 1440×900 and phone 390×844 (`HP_PHONE=1`).
- Watch the browser's error list throughout; any console error, page error or 4xx is a finding.
- Run node scripts from `C:/Users/User/projects/Raptor/raptor-port` (cd there by full path in every command).
- **What is NOT a finding (D56):** harm that exists only in data already stored when the code is correct going forward.
- Report defects with exact steps; never "fix" one. A gesture that fails is looked at on its picture before it is called a
  defect (a scroll that parks the target under a bar manufactures findings). A day list's box must be OPEN to read its
  lines; on a phone the board's panel is a fold (its heading is the toggle).

## The drivers (read them first — they are the recipe)
`raptor-port/scripts/handpass/`: **`wh-lib.mjs`** (this walk's own: `world` — a fresh browser context, signed in;
`reloadAs`; `openList` / `readList` — a day's bar and every line as painted, on `#eWeek` (Edit Schedule) or `#vWeek`
(View-only Sched); `tapLine` — the ✕ / ↺ on a line; `boardOpenFold` / `readBoard` / `tapBoardLine`; `pucks` / `flagged` —
a man's pucks as painted; `warnsOf` — what the app holds, read only; `judge` / `row` / `savePart` — the table; `pic`),
`dbrA-lib.mjs` (launch, context, page, signIn, go, rows, settle), `dbrA-W1-lib.mjs` (showDay, boardOn / boardOff, drag,
signDay, publishDay, publishAL, unpublish, door (Undo / Redo: 'top' or 'board'), toastSpy / toasts, head — the day's
version tag, pending chip, marker, sign-off line), `dbrA-W2-lib.mjs` (signOut and the Inputs-page gestures),
`seat-lib.mjs` (handPut — arm a seat and pick a person from the board's crew list), `p6-lib.mjs` (fileTimed, fileRange —
a request filed through the Inputs page; changesList), and a finished example of this feature's gestures:
`wh-look1.mjs`. Env: `HP_URL` (your server), `HP_SHOTS`, `HP_OUT`. Sign in `ad`/`a` (admin, Saber) or `us`/`us`
(member, Ranger); `signIn(p, 'a')` / `signIn(p, 'm')`. The demo week is Mon 13 – Sun 19 Jul 26 (day index 0–6; Tue = 1);
next week starts Mon 20 Jul. The demo Tuesday has four issues: Saint's clash, Outlaw's crew-rest breach (its dotted mark
is on Monday), Saint's "no time for the brief", Static's long work day (person ids `salsa`, `casper`, `wolf`; ids are in
`window.PEOPLE`). Monday has fourteen, of many kinds.

## What to return (your `wh-<letter>.md`, and the same as your final message, under ~900 words plus the table)
1. One table row per scenario: id (Astra's number where it is one of hers) · what you did (the controls) · what the
   screen said · PASS / FAIL / NOT WALKED (why) · the pictures.
2. Findings, each: the exact steps, what was expected (the ruling or the scenario's line), what happened, the picture.
3. The errors seen. 4. What you did NOT walk and why.

---

## Walker A — the lists, the counts and the pucks, on days not yet published
Server `http://localhost:4211`. Astra's scenarios **2, 8–26, 34, 35, 36** (her list has the setup and the disproof for
each). In short: every KIND of warning hidden and flagged again (a clash, the crew-rest breach and its dotted mark on
the day before, a tight turn, the double-turn line naming several men, a crew-pairing warning naming two, a
qualification flag, the long day, the nought-minute line and its red time boxes, the OIL reminder that names nobody);
every PLACE a man's puck is drawn (flying seats, an exempt AVALON / BB / SC-SPARE line, a duty desk and an exempt one,
sims, ground and Common Programme rows and their extras, the crew list beside the week and the board, the
Available-crew grid, SANS cards, the Unavailable block, the ALL AVAIL window); both LISTS and the ⓘ popup and Insights;
"also flagged on" with a man focused (scenario 2); a man with two warnings (red → amber → plain); every issue of a day
hidden; the approved picture at BOTH widths (21, 22); the situation changing and changing back (34); a saved plan
switched in and out (35); a day template (36); the drop message (26).

## Walker B — the publish line
Server `http://localhost:4212`. Astra's scenarios **1, 3, 10 (its published half), 23 (issued and older-version faces),
33, 37–43**. In short: hide → publish; publish → hide → amend; hide → publish → flag again → amend; after each, the
working copy AND the published face (View-only Sched, signed in as the member) AND every count of pending (the day's
chip, the changes window's "To go out" tab and its line "Warning · … flagged → hidden", the Amendments panel, the
marker "Not yet signed" / "Not yet published", the four sign-offs, the Publish AL button, the amendment's own "N items")
— each must say ONE per hidden warning and never also "Warnings on this day changed"; Unpublish (41); Load onto working
copy of the current version and of an older one, with its confirm's count (3, 42); a 👁 look at each of three versions on
Edit Schedule and on the board, both widths (43); a rename of a man named in a hidden warning with the four signed over
the pending hide (33 — rename him on Quals / Admin → Users); Insights opened on View-only Sched while a hide is pending
(1 — RECORD what it says; the plan knows Insights reads the working copy for every number it shows, and the owner will
be asked — do not judge it); a hide of a warning that stays LIVE on a published face (Outlaw's crew rest) as well as
one that freezes (Static's long day).

## Walker C — kept for everyone, and the edges
Server `http://localhost:4213`. Astra's scenarios **4–7, 27–32, 44**, and **29**. In short: a reload, a sign-out and
sign-in, a member, a guest (if the guest view is reachable through Admin → Users' guest switch), the admin in his member
view (his name badge), at each of: a draft hide, a pending hide on a published day, an issued hide (27, 28); the next
edit of that day after a reload (28 — then reload again); a second week, hides kept apart by week (29); two schedulers
(30 — a second admin is made on Admin → Users, or the seeded member account `hex`/`x` is given the admin role in place
through `window.raptorRole('admin')`, which changes only the role); Undo / Redo from the top bar and from the board,
then a reload (31); Undo after another person has changed that day's hides — it must refuse and name him; another day
must not block (32); the week's edge both ways — a late Sunday duty for a man who flies early next Monday, the warning
hidden on NEXT week's Monday while it is a draft, and again while it is published (6, 7); the next-week preview's red
time boxes (4, 5 — desktop only: the preview is not drawn on a phone); and what must NOT change (44): the Logic page's
"fired N×" still counts a hidden one, the printed schedule and the CSV carry no warning before or after, the Leave War
and the OIL figures are as they were. Also read the saved rows before and after one hide (`L.rows` / `L.diff`): it must
write that day's row and nothing else of the schedule.
