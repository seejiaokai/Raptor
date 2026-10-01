# The walk brief — [INSIGHTS-WHICH-COPY] which schedule the Insights window counts (D477, D478) — 1 Oct 26

One walker, one world (D16). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen said —
pictures and a filled table. You do not review code and you fix nothing.

*(This same brief, word for word, is handed to two walkers working apart — each on its own server, its own picture
folder and its own files; neither sees the other's work. Your letter, server and folders are in the message that gave
you this brief.)*

**What the app should now do.** The Insights window (the top bar's "Insights" button on a desktop; on a phone the ☰
drawer's "Week insights") opens over every page, for every signed-in person. Day by day it counts that day's LATEST
PUBLISHED version — the Original, or the latest amendment (AL1, AL2 …) — and the working copy ONLY for a day not yet
published. Changes waiting on a published day (a man taken off or put on a seat, a cancelled line, a time moved, a
leave or request filed since, a warning hidden since) move NOTHING in the window until they go out as an amendment;
then every figure moves together. A day not yet published moves at once. It is the same on EVERY page — Edit Schedule
and the Scheduler Board included — and a published day switched to "working draft" on View-only Sched is still counted
as published. It holds for EVERY figure of the window: the four tiles (Sorties, Formations, Aircrew flying, the issues
tile with "N warning" under it), "Flying load · sorties this week", "Work hours · report to debrief, this week", "Not
on the flying programme", "Conflicts by type", "By day". A hidden warning is not counted, by the hides that VERSION
went out with (4 issues with 1 hidden read 3 — but only once that hide has gone out). While nothing is published the
window counts the working copy, as it always has.
The scenarios, each with its expected result and what would disprove it:
`raptor-port/docs/superpowers/briefs/2026-10-01-insights-which-copy-scenarios-astra.md` — **walk ALL of them, in her
order, and cite them by her number.** The rule: `raptor-port/docs/ui-contracts.md` §Week Insights. The rulings:
`grep -h '^| D478 |' .claude/decisions-full/*.md` (and D477).

**Three notes on her list, the same for both walkers:**
- **Scenario 1 (the Scheduler Board):** the board's own bar has never carried an Insights button (its approved design:
  Undo, Redo, Sync, the bell, ✓ Done). RECORD what is there at both widths — whether any way to open the window exists
  while the board is up, and whether the window, opened on Edit Schedule BEFORE the board is opened, is still there —
  with pictures. Do not judge it PASS or FAIL: mark it RECORDED. Then prove the counting half another way: make the
  waiting change ON the board, press ✓ Done, and open Insights on Edit Schedule.
- **Scenario 2 (a Logic rule change):** walk it exactly and report exactly what each figure did and when (the Work
  hours bar, the issues tile, By day, the day's own bar and its pending count). Mark it RECORDED with the numbers — the
  owner's standing rule is that the app keeps no versions of its rules, so the host will judge it.
- **Scenario 18 (a guest):** excluded, as she says — the guest view has no Insights button by design.

## Hard rules
- **Read-only on the app.** Never edit anything under `raptor-port/src`, `e2e`, `docs` (except your own output files
  below), never run `npm run build`, `npm test`, the e2e or smoke suites, never start or stop a server, never use git to
  change anything. The build you are served is frozen in `raptor-port/dist-wh`; a rebuild would mix two builds in one walk.
- **Your own files only** (`<letter>` is yours): scripts `raptor-port/scripts/handpass/ins-<letter>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-01-insights/<letter>/`; results `raptor-port/docs/handpass/parts/ins-<letter>.json`
  and your report `raptor-port/docs/handpass/parts/ins-<letter>.md`. Never open, list or read the other letter's files.
- **Write every script with the Write tool and run the file** — never pass code through a shell heredoc or `node -e`
  (backslashes arrive mangled and it still exits 0).
- **Every fixture through the app's own controls** (bug-check order §7.7): the board's seats and crew list, a line's CX,
  the time boxes, the Inputs page's form, the ✕ / ↺ on a line of a day's issues list, the day's sign-off selects and
  Publish / Publish AL / Unpublish buttons, the version picker and "Load onto working copy", the top bar's Undo / Redo.
  The probe bridge (`window.DAYS`, `window.WARN`, `window.PEOPLE`, `window.SCHED`, `window.go`, `window.openScheduler`,
  `window.CURPAGE`, `window.CURWEEK`) only to GET to a place and to READ state. If a state cannot be reached through a
  control, that is a finding — say so; do not inject it. **Never sign in again mid-fixture on a world nobody has written
  to yet** (§7.7): make one write first.
- **A step asserts what a person SEES** (§7.8, anti-pattern 21): read the Insights window's own text off the screen
  (`#insightBody` — the tiles `.itile .n` / `.l`, the bars `.ibar`, the rows `.irow`, the chips `.ichip`) and compare it
  with the day beside it (the day's own bar "⚠ N issues", its lines, its pucks). After each step save a picture AND
  OPEN IT (Read the PNG) before the step counts. The window is asserted as the topmost thing at its own centre on each
  page it is opened over — never only that it is in the page.
- **Both widths** where the scenario says so, and at least the first three scenarios at both: desktop 1440×900 and
  phone 390×844 (`HP_PHONE=1`; on a phone the way in is the ☰ drawer's "Week insights").
- Watch the browser's error list throughout; any console error, page error or 4xx is a finding.
- Run node scripts from `C:/Users/User/projects/Raptor/raptor-port` (cd there by full path in every command).
- **What is NOT a finding (D56):** harm that exists only in data already stored when the code is correct going forward.
- Report defects with exact steps; never "fix" one. A gesture that fails is looked at on its picture before it is called
  a defect (a scroll that parks the target under a bar manufactures findings).
- If a scenario cannot be walked, say so and why (NOT WALKED) — never mark it passed.

## The drivers (read them first — they are the recipe)
`raptor-port/scripts/handpass/`: **`wh-lib.mjs`** (`world` — a fresh browser context, signed in; `reloadAs`; `openList`
/ `readList` — a day's bar and every line as painted, on `#eWeek` (Edit Schedule) or `#vWeek` (View-only Sched);
`tapLine` — the ✕ / ↺ on a line; `boardOpenFold` / `readBoard` / `tapBoardLine`; `pucks` / `flagged`; `warnsOf` — what
the app holds, read only; `judge` / `row` / `savePart` — the table; `pic`), `dbrA-lib.mjs` (launch, context, page,
signIn, go, rows, settle), `dbrA-W1-lib.mjs` (showDay, boardOn / boardOff, drag, signDay, publishDay, publishAL,
unpublish, door (Undo / Redo: 'top' or 'board'), toastSpy / toasts, head — the day's version tag, pending chip, marker,
sign-off line), `dbrA-W2-lib.mjs` (signOut and the Inputs-page gestures), `seat-lib.mjs` (handPut — arm a seat and pick
a person from the board's crew list), `p6-lib.mjs` (fileTimed, fileRange — a request filed through the Inputs page;
changesList), and a finished example that opens Insights beside a published day: `wh-b-1.mjs`. Env: `HP_URL` (your
server), `HP_SHOTS`, `HP_OUT`. Sign in `ad`/`a` (admin, Saber) or `us`/`us` (member, Ranger); `signIn(p, 'a')` /
`signIn(p, 'm')`. The demo week is Mon 13 – Sun 19 Jul 26 (day index 0–6; Tue = 1); next week starts Mon 20 Jul. The
demo Tuesday has four issues: Saint's clash, Outlaw's crew-rest breach (its dotted mark is on Monday), Saint's "no time
for the brief", Static's long work day (person ids `salsa`, `casper`, `wolf`; ids are in `window.PEOPLE`).

## What to return (your `ins-<letter>.md`, and the same as your final message, under ~700 words plus the table)
1. One table row per scenario: Astra's number · what you did (the controls) · what the window said and what the day
   beside it said · PASS / FAIL / NOT WALKED (why) · the pictures.
2. Findings, each: the exact steps, what was expected (the ruling or the scenario's line), what happened, the picture.
3. The errors seen. 4. What you did NOT walk and why. 5. One line: how many pictures you saved and how many you opened.
