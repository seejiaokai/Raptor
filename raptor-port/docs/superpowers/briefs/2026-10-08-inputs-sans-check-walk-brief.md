# The walk brief — the Inputs calendar and the SANS availability calendar: the job's one check — 8 Oct 26

One walker, one world (D16). You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen said —
pictures and a filled table. You do not review code and you fix nothing.

*(This same brief, word for word, is handed to seven walkers working apart — each with its own share of the scenarios,
its own server, its own picture folder and its own files; none sees another's work. Your letter, your server, your
folders and your share are in the message that gave you this brief. Walk exactly your share.)*

**The scenarios**, each with its setup, action, expected result and what would disprove it:
`raptor-port/docs/superpowers/briefs/2026-10-08-inputs-sans-check-scenarios-astra.md` (numbered `P1-…` to `P6-…` and
`X-…`) and the host's additions `raptor-port/docs/superpowers/briefs/2026-10-08-inputs-sans-check-scenarios-host.md`
(numbered `H-…`). **Walk ALL of your share, in the order given, and cite each by its number.**

**What the app should now do:** the section of that name in
`raptor-port/docs/superpowers/briefs/2026-10-08-inputs-sans-check-scenarios-brief.md` — six pieces. Read it whole, once,
before you start. The owner's rulings behind it: `grep -h '^| D655 |' .claude/decisions-full/*.md` (any number; the
shell's grep). How each screen is meant to behave, with its test ids: `raptor-port/docs/ui-contracts.md` — "The Event
rows print a short form", "The four rows at the foot of the Manning block", "Days — the month" (on screen that window
is called **"Calendar"**), "The SANS calendar", "The Inputs calendar", "One input filed for several people" (find each
with `grep -n '^## \|^### ' raptor-port/docs/ui-contracts.md`, then read that slice — never the whole file).

## Hard rules
- **Read-only on the app.** Never edit anything under `raptor-port/src`, `e2e`, `docs` (except your own output files
  below); never run `npm run build`, `npm test`, the e2e or smoke suites; never start or stop a server; never use git
  to change anything. The build you are served is frozen; a rebuild would mix two builds in one walk.
- **Your own files only** (`<L>` is your letter): scripts `raptor-port/scripts/handpass/cal-<L>-*.mjs`; pictures
  `raptor-port/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/<L>/`; results
  `raptor-port/docs/handpass/parts/cal-<L>.json` and your report `raptor-port/docs/handpass/parts/cal-<L>.md`. Never
  open, list or read another letter's files.
- **Write every script with the Write tool and run the file** — never pass code through a shell heredoc or `node -e`
  (backslashes arrive mangled and it still exits 0). Run node from `C:/Users/User/projects/Raptor/raptor-port` — `cd`
  there by its full path inside every command. Send long output to a file and read the file.
- **Every fixture through the app's own controls** (bug-check order §7.7): the real cells, buttons, windows, the real
  mouse and keyboard, a real finger (below). The probe bridge on localhost (`window.go`, `window.DAYS`, `window.INPUTS`
  via `page.evaluate`, `window.lwDayFacts`, `window.flyAnswer`, `window.CURPAGE`) only to GET to a place and to READ
  state. Its writers (`window.setFlyDays`, `window.setFlyRun`, `window.setFlyRule`, `window.fileInput`,
  `window.lwSetCell`, `window.lwSetDayEvent`, `window.lwCreateWar`) are for BACKGROUND a scenario needs and is not
  about — forty commitments on one day to test scrolling, a figure typed weeks away — and the row then says "seeded".
  The thing a scenario tests is always done through its control. If a state cannot be reached through a control, that
  is a finding — say so; never inject it. **Never sign in again mid-fixture on a world nobody has written to yet**
  (§7.7): make one write first; to change role in place use `window.raptorRole` / `window.lwSetRole`, and
  `window.raptorMe(<person id>)` to be another person — a test's "admin" and "member" are the SAME PERSON unless the
  identity is set as well as the role (`ad` is Saber, `us` is Ranger).
- **A step asserts what a person SEES** (§7.8, anti-pattern 21): read the words off the screen, the figure in the
  cell, the tag on the date, where the bar sits, which window is in front — and compare with what the scenario
  expects. A mark, a tint, a ring or a bar is asserted as PAINTED (a computed style, a measured box), and a control as
  the thing a finger LANDS on (`document.elementFromPoint` at its centre). After each step save a picture AND OPEN IT
  (Read the PNG) before the step counts. A picture you did not open is not evidence.
- **A gesture is driven for real.** A mouse drag is `page.mouse.down / move (in steps) / up`. A finger is a real touch
  sequence over CDP (`Input.dispatchTouchEvent` — `touchStart`, `touchMove`, `touchEnd`; a hold is a wait between
  them with no move), in a phone context (`hasTouch`, `isMobile`). The worked examples are in
  `raptor-port/e2e/inputs-sans-calendar.spec.ts` and `e2e/inputs-calendar.spec.ts` (search them for
  `dispatchTouchEvent`) — copy them. A drag asserts that the thing followed the pointer, not only that a value moved.
- **Sizes.** Desktop 1440×900 and phone 390×844 always. Where the scenario names a short screen — and at least once for
  every screen built as a screen-tall column (both months, every window) — 390×568 and 844×390 (a phone on its
  side). The desktop months once at 1536×864 (the owner's own screen).
- Watch the browser's error list throughout; any console error, page error or 4xx is a finding.
- **What is NOT a finding (D56):** harm that exists only in data already stored when the code is correct going
  forward. **Not part of this job:** one row for a group input on the SCHEDULE (its own job — D661, D662); the Leave
  War's other windows still blocking the grid (filed); the top of the Leave War on a phone (checked by itself).
- Report defects with exact steps; never "fix" one, never work around one silently. A gesture that fails is looked at
  on its picture before it is called a defect (a scroll that parks the target under a bar manufactures findings; a
  press on a date's MIDDLE lands on a bar — press a date at its corner, `{ position: { x: 8, y: 8 } }`).
- If a scenario cannot be walked, say so and why (NOT WALKED) — never mark it passed. A scenario you walked only in
  part is PARTIAL, with what was left.
- You are not told whether anything is wrong with this build. Report what the screen did.

## The drivers (read them first — they are the recipe)
`raptor-port/scripts/handpass/`: this job's own look scripts — read them for the sign-in, the navigation and the
selectors, do not trust their verdicts: **`lw-flyrows-look.mjs`** (the Leave War's four rows: typing, the number pad,
picking, the panel), **`lw-counters-among-look.mjs`** (Rearrange, a counter among the fixed rows), **`days-look.mjs`**
(the "Calendar" window: the month, "Every <weekday>", the Holidays list and its form), **`sans-look.mjs`** (the SANS
month, a day, Highlight, the gear), **`inputs-look.mjs`** (the Inputs month, a day, the editor window, the gear, the
Logic rows), **`group-look.mjs`** (the people picker, a shared input's bar, line, row and editor). The older libraries:
`wh-lib.mjs` (`world` — a fresh browser context, signed in; `reloadAs`; `judge` / `row` / `savePart` — the table;
`pic`), `dbrA-lib.mjs` (launch, context, page, signIn, go, settle), `dbrA-W1-lib.mjs` (showDay, signDay, publishDay,
publishAL, unpublish, door — Undo / Redo, toasts, head — a day's version tag, pending chip, sign-off line),
`dbrA-W2-lib.mjs` (signOut, cardSignIn, the Inputs page's gestures), `p6-lib.mjs` (changesList — the changes window;
the OIL mode's buttons), `lib.mjs` (lwCell, credits — the Leave War's cell and a person's OIL). The browser tests are
recipes too: `e2e/inputs-calendar.spec.ts`, `e2e/inputs-sans-calendar.spec.ts`, `e2e/leavewar.spec.ts`,
`e2e/step4-leavewar.spec.ts`, `e2e/app.ts` (`login`, `go`, `openLeaveWar`, `lwRole`, `raptorRole`). Start every world
at `<your server>/?fresh=1` unless the scenario is about a reload — then use the plain address, after one write.
Sign in `ad` / `a` (admin, Saber) or `us` / `us` (member, Ranger). The demo week is Mon 13 – Sun 19 Jul 26; the demo's
shared input is on Thu 23 Jul 26; the Leave War's demo period covers 2026. The app starts with NO counters on the
Leave War (a scenario that needs one makes it through "+ Counter").

## What to return (your `cal-<L>.md`, and the same as your final message, under ~900 words plus the table)
1. One table row per scenario: its number · what you did (the controls) · what the screen said, with the figures ·
   PASS / FAIL / PARTIAL / NOT WALKED (why) · the pictures.
2. Findings, each: the exact steps, what was expected (the scenario's line or the ruling), what happened, the picture.
3. The errors seen. 4. What you did NOT walk and why. 5. One line: how many pictures you saved and how many you opened.

## The standing conditions (from the trial of 5 Oct 26)
1. **The host opens the pictures behind every FAIL and behind every high-consequence PASS** (OIL, a published day, a
   role, saved data). You still open the picture behind every FAIL and every such step, and say honestly how many.
2. **A scenario with an EXPECTED line is judged PASS or FAIL.** "RECORDED" is only for scenarios the host marks so.
3. **Your conclusion is not a finding until the host has reproduced it** — report what the screen did and the exact
   steps, never a cause you did not see.
4. **The report is sent ONCE**, after every script and browser of yours is stopped.
