# Walk brief — a SANS man struck on a flying seat with no times yet (his D2573), chat 179

You are an Opus walker (one of two, A and B; your letter and port are in your prompt). You walk the RUNNING app with a
scripted real browser and return pictures and a filled table. You never read code to look for bugs and never change the
app's code.

## Read first
- `C:/Users/User/projects/Raptor/raptor-port/docs/walk-scripts.md` — how a walk script and its pictures are written, and
  its traps. Routes already proved on this kind of build: `D:/raptor-work/c174-walk/recipes.md` and the helper libraries it
  names under `raptor-port/scripts/handpass/` (import them, never edit them).
- The two scenario lists, both to be walked: `D:/raptor-work/c179-sc-fable/scenarios.md` (F1–F17) and
  `D:/raptor-work/c179-sc-astra/scenarios.md` (A-S01…A-S22). Where two name the same case, walk it once and give both ids.
  The host's map of the overlaps: F1=A-S02 · F2=A-S05+A-S04 · F3=A-S11 · F4=A-S07 · F5=A-S01 · F6=A-S08 · F7=A-S13 ·
  F8=A-S10 · F9=A-S03 · F10=A-S04 · F11=A-S15 · F12=A-S12 · F13=A-S22 · F16+F17=A-S18. Astra's alone: A-S06, A-S09, A-S14,
  A-S16, A-S17, A-S19, A-S20, A-S21. Fable's alone: F14, F15.
- **Walker A walks:** F1, F2, F4, F5, F9, F10, F11, F16, F17, A-S06, A-S16, A-S20, A-S21 (the crew lists, drags, rings, the
  board, publish, view-only). **Walker B walks:** F3, F6, F7, F8, F12, F13, F14, F15, A-S09, A-S14, A-S17, A-S19 (the
  bell, filings, standby, dates, cancel, undo, reload, sims). Plus, each of you, the plain-user round below at both sizes.

## The build and the people
- Serve the frozen build `D:/raptor-work/c179-build` (its main script `index-DmZtA8E3.js`; commit `3eb45f0cc`) on your
  port only: `npx vite preview --port <port> --strictPort --outDir D:/raptor-work/c179-build` from `raptor-port/`, port free
  first; stop it by its port at the end. Never build, never run a browser-test file or the unit suite (another chat's walk
  is running on this PC). Each scenario in a fresh browser context.
- Clock held at 2026-07-15 09:00 (the library's `run`), moved only where a scenario says. Saber `ad`/`a` (admin);
  Ranger `us`/`us`, id `bane`; post Ranger out as SANS from Fri 17 Jul where a scenario needs it (the recipes). Ipman
  (`ipman`) is SANS by tick in the seed.
- Sizes: desktop 1536×1000; phone 402×874 WebKit, touch, 3x (the library's sizes) — both, unless a scenario names one.

## What the build changed (the promise — from his rulings' full rows, `D:/raptor-work/c179-sc/rulings.md`)
D2573: with nothing filed, a SANS man is struck on the crew list for a flying seat with no times yet, with the same reason
as a timed seat; a man who has filed something is unchanged. Standby lines (SC, AVALON, BB) and sim rows with no times are
left as they were (a sim with no times is a question for him — RECORD what it shows). The warning list is unchanged
(no new line for nothing filed). D2420: with no seat picked the crew list draws no reason line for such a man.

## How to judge
- A scenario with an EXPECTED line is PASS or FAIL. "RECORDED" only where the scenario says record, or for the sim case.
  An EXPECTED line that cites "as on main today" or a ruling you cannot settle on screen: RECORD exactly what it says.
- Every press: a picture right after it and the settled one (on the phone within about 100ms of the lift too); before a
  press, prove on screen what is there. Read the words from the screen (text of the element), not from the code.
- A side-by-side pair of boxes or a reason line under a name: measure that it stays inside its panel at 402 wide.
- Every picture you rely on, open and look at; crop to the part judged. Errors in the page's console are findings.
- Not a finding: a problem only in data already stored when the code is correct going forward (demo data is cleared
  before the database step); a scheduler who is not an admin; SC MAIN or a flying AVALON/BB WITH times still striking a
  SANS man (not built yet, D2576–D2578).

## The plain-user round (each walker, both sizes)
As Saber: open Edit Schedule, add a flying line on Sat 18, plan Ranger into it with no times (tap a seat, tap his name),
read the note, type its take-off and landing, Undo, Redo, open the Scheduler Board for Sat 18 and close it with ✓ Done,
open the day's warning list. Then as Ranger: open the bell, tap the SANS reminder, close what it opened. Pictures of each.

## Hand back
Scripts to `C:/Users/User/projects/Raptor/raptor-port/scripts/handpass/sns-w1<A|B>*.mjs`; pictures to
`C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-25-sans-notimes-strike/<A|B>/`; raw logs to
`D:/raptor-work/c179-walk/<A|B>/`. Write `D:/raptor-work/c179-walk/<A|B>-report.md`: one row per scenario (ids, size,
PASS / FAIL / RECORDED, what the screen said, the picture files), every FAIL with its pictures and how to reproduce it,
every console error, what you could not reach and why. Never commit, push, switch branch or touch other files. Reply with
the report's path only.
