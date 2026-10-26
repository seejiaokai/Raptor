# The walk of the Leave War overhaul's M2 — the walkers' brief (the night of 23 Oct 26)

You walk the RUNNING app in a real browser, driven by a script you write, and you save pictures and one filled table. You
are a walker (the bug-check order `raptor-port/docs/bug-check-order.md` §7): you do not read code for bugs and you change
no source file. **Read first, whole:** `raptor-port/docs/walk-scripts.md` (how a walk script, a walker's brief and a
break-test list are written, and what each trap has cost) and §7 of the bug-check order.

## The build and how to reach it
- Served at `http://localhost:4173/?fresh=1` (a production build of branch `claude/lw-m2-looks` at `fcddf90f4`; `?fresh=1`
  starts a clean demo world in memory — every new browser context is its own world). Do not build, do not stop the
  server, do not run any test suite.
- Sign in: `#luser` / `#lpass` / `#loginForm button[type=submit]`; admin `ad` / `a` (Saber), member `us` / `us` (Ranger).
  Wait for `#vWeek .day`, then `page.evaluate(() => window.go('leavewar'))`, wait for `[data-testid^="row-"]`.
  A member never bids before today (D1211); today is in late Oct 2026, so pin a member's today where a scenario needs a
  bid in the demo war's open months: `page.evaluate(t => window.lwSetMemberToday(t), '2026-01-05')` straight after
  signing in (the M1 walk helper does this — `scripts/handpass/lw-m1-walk-h-lib.mjs`, a good model for your own lib).
- Sizes: phone 390×844 (`hasTouch`, `isMobile`, deviceScaleFactor 2, iPhone UA; drive taps with CDP touch where a
  gesture matters, as the M1 lib's `finger`/`holdDrag` do) and desktop 1536×864. A browser fallback for Chromium:
  `existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}` as in `playwright.config.ts`.
- Watch console errors, page errors and 4xx responses throughout; any is a finding.

## What changed (M2 — what you are checking)
The design is the approved pictures in `raptor-port/docs/mock/lw-overhaul/full/` (r7-04-cells-*, r7-07-legend-phone,
r19-nav-*, r19c-short-red, r21-rows-*, r7-26-availp-desk, r7-27-reqp-desk) — open the ones your scenarios name. The
scenarios, the roll-call and what is suspect: `raptor-port/docs/superpowers/briefs/2026-10-23-lw-m2-scenarios.md` (written
by an independent designer). Since it was written the host fixed: the bubble now shows only when a row gets WORSE; the
Manning fold's memory is keyed by the person signed in, read when used; a two-entry day's second box wears its own
Inputs-page / moved edge; the Legend lost its arrows group, FO* is green, HO is drawn in a half; the moved edge and the
"!" corner carry a thin dark outline; Undo words for the two new commands. Not yet fixed (expected, still record it):
an HO's default half after a date change in the OIL tracker's editor (scenario 18).

## Your output
- Your script(s): `raptor-port/scripts/handpass/lw-m2-walk-<n>.mjs` (+ a `-lib.mjs` if you want one) — write each step as an
  ASSERTION OF THE RIGHT BEHAVIOUR (a PASS means correct), so the same script re-run on a fixed build is the re-walk.
- Pictures: `raptor-port/docs/img/handpass/2026-10-23-lw-m2-looks/w<n>/` — one per scenario step that shows something,
  named by scenario number (`s07-three-entries-desk.png`). OPEN your pictures and look at them: a picture nobody looked at
  proves nothing.
- Your table: `raptor-port/docs/handpass/parts/lw-m2-w<n>.md` — one row per scenario you were given: number, size, role,
  what you did, what the screen showed, PASS / FAIL / NOT RUN (with why), the picture names. Then a list of every FAIL with
  the exact steps to reproduce, and every console or page error.
- Never edit a source file, a test, or any other part of the repo beyond those three outputs. Never commit.

## The rules of evidence
- A PASS is something you SAW on the screen (the picture) and asserted; a FAIL is the screen disagreeing with the
  scenario's expected result or with the approved picture. If the scenario's premise cannot be built through the app's
  own controls, say NOT RUN and why — never fake a state by writing to the store.
- A scripted step that fails is looked at on its picture before it is called a defect (a scroll that parked the target
  under a bar is a script fault, not an app fault).
- What is NOT a finding: a problem that lives only in data already stored, when the app is right going forward (D56).
- Windows/Git Bash: write scripts with the file-writing tool and run `node <file>` — NEVER a here-document (`<<EOF`) or
  `python -` with stdin (they hang). A run longer than two minutes: run it in the background and wait for it.
