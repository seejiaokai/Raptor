# The walk brief — the Codex stack (D589): five pieces, one walk — 5 Oct 26

One walker, one world (D16). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen said —
pictures and a filled table. You do not review code and you fix nothing.

*(This same brief, word for word, is handed to several walkers working apart — each with its own share of the
scenarios, its own server, its own picture folder and its own files; none sees another's work. Your letter, your server,
your folders and your share are in the message that gave you this brief. Walk exactly your share.)*

**The scenarios**, each with its setup, action, expected result and what would disprove it:
`raptor-port/docs/superpowers/briefs/2026-10-05-codex-stack-scenarios-astra.md` (numbered `P1-…`, `P2-…`, `P3-…`,
`P4a-…` to `P4e-…`, `P5-…`, `X-…`) and the host's additions
`raptor-port/docs/superpowers/briefs/2026-10-05-codex-stack-scenarios-host.md` (numbered `H-…`). **Walk ALL of your
share, in the order given, and cite each by its number.**

## What the app should now do (the rulings: `grep -h '^| D509 |' .claude/decisions-full/*.md`, any number)

1. **"Discard marks" is gone (D488).** The amendments box has no "Discard marks" button. A day not yet published keeps
   its change marks until it is published, which clears them as before.
2. **In-time / Rally, and work hours (D497–D511).** A wave's reporting box is "In-time / Rally": one clock per line with
   its words; a line naming a formation's callsign is that formation's, an unnamed line the whole wave's; in-time and
   Rally are resolved separately and the EARLIEST applicable clock starts the crew's day. A reporting clock later than
   its take-off is the PREVIOUS day (one day back at most); a work span is never negative. A timing pair out of order
   (in-time, Rally, brief, take-off, landing) is a RED WARNING in the day's warning list, explained while editing — and
   the day can STILL BE PUBLISHED (D509). A blank brief is checked as the suggested brief and the message says so. The
   "+ In-time / Rally" button fills in the wave's earliest take-off less the Logic page's "nominal report before T/O"
   (3 hours by default) and the words set beside it on Logic. The long-day warning, crew rest and its dotted "breaks
   tomorrow" mark, the 7-day run, Insights' work hours and a weekend's earned leave (OIL) all read that one start.
3. **Insights' mission mix (D512–D538).** Logic has a switch "Track Blue/RED sorties", OFF at first; off, Insights is as
   it was. On: a Mission of exactly DS, RED or RED AIR counts Red with no question; other Missions count Blue — unless
   the Mission contains DS or RED without being exactly those (DS-2, RED AIR 2, ACM/DS) or the Remarks mention DS or
   RED, when the scheduler is ASKED Blue or Red for the whole formation. The question appears by itself only straight
   after the scheduler's own edit to that Remarks or Mission box; otherwise a temporary "Choose mission role" /
   "Change mission role" button shows under the formation while its Remarks box is being edited; passing through an
   unchanged box never asks. An open question stays until Blue, Red or Later is pressed, the formation's own Mission or
   cue wording changes, the formation goes, or he moves to another day, week, version or sign-in — an unrelated edit on
   the same day does not remove it. The answer COUNTS IN INSIGHTS AT ONCE, ON A PUBLISHED DAY TOO — no amendment, no
   "N pending", the four sign-offs untouched; a change to the Mission or Remarks WORDING on a published day still waits
   for its amendment. A person's weekly bar splits Blue/Red only when every one of their sorties is resolved. The chart
   shows the first twelve flying people with "Show all". SC, AVALON and BB standby are not flying load; SC MAIN counts
   to work hours. The Scheduler Board has its own way into Insights. Only an admin answers; a member and a guest read.
   On a phone a tall pop-up window runs up to a thin strip at the top of the visible screen; a window closes on its
   surround only when the press BEGAN on the surround.
4. **The workflow UI pass (D540–D566).** (a) The stylesheet was split into parts: NOTHING visible may have changed on any
   screen at phone or desktop size. (b) On a phone, the Scheduler Board's Desktop layout shows the schedule again.
   (c) While typing on Edit Schedule's week and on the Scheduler Board, Tab goes callsign, mission, brief, take-off,
   landing, then remarks and stores text, through boxes already open for typing (empty ones too), on through the day's
   open sections and notes in displayed order; Shift+Tab reverses it; after the day's last open box Tab goes to the
   next ordinary control — no loop, no change of day; closed editors, folded sections and pop-ups stay closed; Enter
   and Escape mean what they did. (d) On a phone, Edit Schedule and View-only Sched each have a ⋯ menu after Highlight
   with one item, Insights; the drawer's WEEK section is gone. (e) The Tracker's blue flight symbol has a tapered wing
   with a readable label; on Logic the search stays visible while scrolling; the Week Insights window's close cross
   stays visible and reachable while it scrolls.
5. **The failed-save warning's band (D586, D587).** While a save has failed the top bar is one line taller and "Not saved
   — keep this page open" with Retry lies along that line, nothing underneath it; the same band under the bar of the
   Scheduler Board, the Inputs calendar, the Medical view and the Leave War's OIL tracker; never in a window, sheet or
   menu; "Saving…" unchanged.

## Hard rules
- **Read-only on the app.** Never edit anything under `raptor-port/src`, `e2e`, `docs` (except your own output files
  below); never run `npm run build`, `npm test`, the e2e or smoke suites; never start or stop a server; never use git
  to change anything. The build you are served is frozen; a rebuild would mix two builds in one walk.
- **Your own files only** (`<L>` is your letter): scripts `raptor-port/scripts/handpass/stk-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-05-codex-stack/<L>/`; results `raptor-port/docs/handpass/parts/stk-<L>.json`
  and your report `raptor-port/docs/handpass/parts/stk-<L>.md`. Never open, list or read another letter's files.
- **Write every script with the Write tool and run the file** — never pass code through a shell heredoc or `node -e`
  (backslashes arrive mangled and it still exits 0). Run node from `C:/Users/User/projects/Raptor/raptor-port` — `cd`
  there by its full path inside every command. Send long output to a file and read the file.
- **Every fixture through the app's own controls** (bug-check order §7.7): the board's seats and crew list, the text
  boxes, a line's CX, the "+ Wave" / "+ Line" / "+ In-time / Rally" buttons, the Inputs page's form, the Logic page's
  boxes and switch, the day's sign-off selects and Publish / Publish AL / Unpublish, the version picker and "Load onto
  working copy", the top bar's Undo / Redo, the real keyboard (`page.keyboard.press('Tab')`, typing into the focused
  box). The probe bridge (`window.DAYS`, `window.WARN`, `window.PEOPLE`, `window.SCHED`, `window.go`,
  `window.openScheduler`, `window.CURPAGE`, `window.CURWEEK`) only to GET to a place and to READ state. If a state
  cannot be reached through a control, that is a finding — say so; never inject it. **Never sign in again mid-fixture
  on a world nobody has written to yet** (§7.7): make one write first; to change role in place use `window.raptorRole`
  / `window.lwSetRole` through `page.evaluate`.
- **A step asserts what a person SEES** (§7.8, anti-pattern 21): read the words off the screen, the box that has the
  caret (`document.activeElement` and where it sits on screen), the warning list's lines, the count on the day's bar,
  the Insights window's own text and bars, the Leave War cell and the OIL tracker's row for earned leave — and compare
  with what the scenario expects. A mark, an outline, a band or a bar is asserted as PAINTED (a computed style, a
  measured box), and a control as the thing a finger LANDS on (`document.elementFromPoint` at its centre). After each
  step save a picture AND OPEN IT (Read the PNG) before the step counts. A picture you did not open is not evidence.
- **Three sizes:** desktop 1440×900, phone 390×844, and — where the scenario names a short screen, and at least once
  for every surface built as a screen-tall column — 844×390 (a phone on its side) or 1280×700.
- **A failed save is forced the way a full disk does it**, never by editing the app: the recipe is in
  `raptor-port/scripts/handpass/sn-cover.mjs` (`Storage.prototype.setItem` made to throw, on the served build WITHOUT
  `?fresh=1`, after one real write) — copy it.
- Watch the browser's error list throughout; any console error, page error or 4xx is a finding (the forced quota
  error itself excepted).
- **What is NOT a finding (D56):** harm that exists only in data already stored when the code is correct going
  forward.
- Report defects with exact steps; never "fix" one, never work around one silently. A gesture that fails is looked at
  on its picture before it is called a defect (a scroll that parks the target under a bar manufactures findings).
- If a scenario cannot be walked, say so and why (NOT WALKED) — never mark it passed. A scenario you walked only in
  part is PARTIAL, with what was left.
- You are not told whether anything is wrong with this build. Report what the screen did.

## The drivers (read them first — they are the recipe)
`raptor-port/scripts/handpass/`: **`wh-lib.mjs`** (`world` — a fresh browser context, signed in; `reloadAs`; `openList`
/ `readList` — a day's bar and every line as painted, on `#eWeek` (Edit Schedule) or `#vWeek` (View-only Sched);
`boardOpenFold` / `readBoard`; `pucks` / `flagged`; `warnsOf` — what the app holds, read only; `judge` / `row` /
`savePart` — the table; `pic`), `dbrA-lib.mjs` (launch, context, page, signIn, go, rows, settle, reloadCompare),
`dbrA-W1-lib.mjs` (showDay, boardOn / boardOff, drag, signDay, publishDay, publishAL, unpublish, door (Undo / Redo:
'top' or 'board'), toastSpy / toasts, head — the day's version tag, pending chip, marker, sign-off line),
`dbrA-W2-lib.mjs` (signOut, cardSignIn and the Inputs-page gestures), `seat-lib.mjs` (handPut — arm a seat and pick a
person from the board's crew list), `p6-lib.mjs` (fileTimed, fileRange — a request filed through the Inputs page;
changesList; the OIL mode's buttons), `lib.mjs` (lwCell, credits — the Leave War's cell and a person's earned leave),
`trk-lib.mjs` (the Tracker). Finished examples from this stack — read them for the selectors, do not trust their
verdicts: `schedule-tab-walk.mjs` (the Tab route), `insights-editing.mjs` and `insights-publication.mjs` (the Blue/Red
question and a published day), `schedule-insights-walk.mjs` (the phone ⋯ menu), `discard-marks-remove.mjs`,
`sn-cover.mjs` and `sn-board.mjs` (the failed-save band), `css-split-walk.mjs` (every screen at two sizes),
`interface-readability-scroll.mjs` (Logic's search, the Insights cross, the wing). Env: `HP_URL` (your server),
`HP_SHOTS`, `HP_OUT`, `HP_PHONE=1`. Sign in `ad`/`a` (admin, Saber) or `us`/`us` (member, Ranger); `signIn(p, 'a')` /
`signIn(p, 'm')`. The demo week is Mon 13 – Sun 19 Jul 26 (day index 0–6; Tue = 1; the weekend is duty crew only);
the next week starts Mon 20 Jul.

## What to return (your `stk-<L>.md`, and the same as your final message, under ~800 words plus the table)
1. One table row per scenario: its number · what you did (the controls) · what the screen said, with the figures ·
   PASS / FAIL / PARTIAL / NOT WALKED (why) · the pictures.
2. Findings, each: the exact steps, what was expected (the scenario's line or the ruling), what happened, the picture.
3. The errors seen. 4. What you did NOT walk and why. 5. One line: how many pictures you saved and how many you opened.

## Added 6 Oct 26, from Trial 1 (`docs/handpass/parts/stk-trial-1.md` — walking stays with Sonnet 5.5, on these conditions)
1. **The host opens the pictures behind every FAIL and behind every high-consequence PASS** (OIL, a published day, a
   role, saved data) — a walker opens about a third of its own, whatever a brief says; an unopened picture is not
   evidence. The walker still opens the picture behind every FAIL and every such step, and says honestly how many.
2. **A scenario with an EXPECTED line is judged PASS or FAIL.** "RECORDED" is only for the scenarios the host marks so;
   the host re-judges any RECORDED row that has an EXPECTED line.
3. **A walker's conclusion is not a finding until the host has reproduced it** (D16) — report what the screen did and
   the exact steps, never a cause that was not seen.
4. **The report is sent ONCE**, after every script and browser is stopped.
The re-walk's own brief, which carries these: `2026-10-06-codex-stack-rewalk-brief.md`.
