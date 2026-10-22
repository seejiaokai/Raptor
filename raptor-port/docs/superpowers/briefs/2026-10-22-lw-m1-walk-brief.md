# M1 — open dates — the walk (a brief for the three walkers)

22 Oct 26, branch `claude/lw-m1-open-dates`, pull request 566. You are a WALKER (Sonnet 5.5): you drive the real built app
in a real browser and take pictures. You never read code to find bugs and never decide whether a finding is real — the
host does. Read FIRST, whole: `raptor-port/docs/walk-scripts.md` (how a walk script is written, the traps it cost).
Then the scenarios: `raptor-port/docs/superpowers/briefs/2026-10-22-lw-m1-scenarios.md` (S1–S38, written by an
independent designer before the build). What the build does: `raptor-port/docs/superpowers/briefs/2026-10-22-lw-m1-test-move-brief.md`
§"What changed" (test ids, words, rules). Checkout: `C:\Users\User\projects\Raptor\.claude\worktrees\lw-m1-open-dates-7632a9`.

## The build you walk — frozen, never rebuild it
Served from `raptor-port/dist-m1w` (built from 66f75a2b7): walker A on http://localhost:4252/, B on 4253, C on 4254
(already running — never start, stop or rebuild a server; never run `npm run build` or a Playwright test file).
Write your own Playwright script(s) as `raptor-port/scripts/handpass/lw-m1-walk-<a|b|c>.mjs`, written as ASSERTIONS of the
right behaviour (a PASS means correct), using the browser fallback `existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}`
(see `scripts/handpass/lw-m1-perf.mjs`). Each scenario in a FRESH browser context; open `<url>?fresh=1`.
Sign in: admin `ad` / `a` (Saber, person id `stiff`); member `us` / `us` (Ranger, id `bane`): `#luser`, `#lpass`,
`#loginForm button[type=submit]`, wait for `#vWeek .day`, then `window.go('leavewar')`, wait for `[data-testid="row-bane"]`.
**A member's today:** the demo's open dates are 1 Jan – 31 Mar 26, all past by the real calendar, so a member can bid
nowhere unless the scenario says otherwise. Pin it with `page.evaluate(() => window.lwSetMemberToday('2026-02-15'))`
after sign-in (or another date a scenario needs; `null` releases it). Say in each picture's name which clock was used.
Make every fixture through the app's own controls (the open chip `[data-testid="open-chip"]` → the window's month
buttons `od-month-YYYY-MM`, a cell's bid window, Approve…). Use the bridge only where the scenario says (an old saved war:
`window.lwLoadWars(blob)`).
Pictures: `raptor-port/docs/img/handpass/2026-10-22-lw-m1-open-dates/<a|b|c>/NN-what.png` — one per step that shows
something; open each one you name in your table before you call it PASS.

## Your share
- **A — the admin at a desktop, 1440 × 900, by mouse:** S1, S5, S8, S10, S11 (desktop strip), S12 (an old saved war
  through `lwLoadWars`, then reload), S13, S14 (desktop drag SEP → MAR), S15, S16, S17, S18, S19, S20 (keyboard), S22
  (desktop "+1"), S23, S24, S36 (skip if no route — say so), S37 (the schedule's "Create the period" button on a weekend
  no period covers).
- **B — the phone, 390 × 844 by finger (touch), member Ranger then the admin:** S2, S3 (and its day's-list and
  drag-select variants), S4, S7, S9 (clock 15 Dec 26), S14 (phone: hold MAY, drag to SEP on the second row), S21 (a
  finger that scrolls opens nothing), S22 (phone: the strip stays ONE line with two stretches — measure the line's
  height), S25, S26 (clock 15 Feb 26), S27, S29, S30, S34 (b — the admin's member view by tapping his name badge), S35.
- **C — the seams and what must not change (desktop 1440 and phone 390):** S6, S28 (the Inputs page), S31 (the bell
  and the changes window), S32 (the SANS calendar and the Calendar window before and after opening and closing APR —
  record their text; they must be identical), S33 (OIL on a closed day: an award from the day's +OIL and from the OIL
  tracker), S34 (a — signed in without access, if reachable; else say so), and: an approved leave cannot be moved from
  30 Dec 26 into 2027 (refused, it stays), while a pending bid can (the year-end fix); the Legend's moved line; Undo /
  Redo of opening a month while June is on screen (the grid does not jump — D672).

## What you return (short)
A table: scenario · PASS / FAIL / RECORD · what the screen said (exact words where words matter) · the picture(s).
A scenario with an EXPECTED line is PASS or FAIL — RECORD only where the scenario says RECORD. Every FAIL with its exact
steps and pictures. Errors in the browser console or page errors seen. What you could not walk, and why. Your token
count if you know it. Change no file outside your script and your picture folder; do not commit.
