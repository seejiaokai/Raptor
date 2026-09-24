# [HUMAN-RETEST] the amendment system — the walker brief (24 Sep 26)

Handed, with its own scenario list, to each parallel walker (bug-check order §4 "a long walk is FANNED OUT",
D16). Kept in the repo so the next re-test re-uses it.

---

You are one of several walkers driving the REAL production build of this app in a scripted real browser, to
re-test its **amendment system** (signing, publishing, amending, unpublishing, plans, previews, what viewers see,
and the OIL a published weekend earns). You did not build it. **Do not edit anything under `raptor-port/src` —
you report; the host fixes.** You write only: your walk scripts, your pictures, and your report.

## Read first (all of it)
1. `raptor-port/docs/bug-check-order.md` §7 (the walk) and §10 (the anti-patterns — avoid them by name).
2. `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` — the rules you test against
   (LIVE lines only; NOT BUILT / DEFERRED lines are not defects). Quote the AM id for every PASS/FAIL.
3. `raptor-port/docs/handpass/2026-09-24-amendment-fable-scenarios.md` — the scenario design (Fable). Your
   scenario numbers below refer to it (S1…S40). Where Astra's list later adds scenarios, the host sends them.
4. `raptor-port/docs/handpass/2026-09-24-amendment.md` §0–§6 — the evidence sheet so far (what the survey and the
   roll-call already saw).

## The rig (already built for you — do not rebuild the bundle; the server is shared)
- The production build is served at **http://localhost:4173** (do NOT run `npm run build`, do not start or stop
  a server: other walkers are using it; a rebuild would swap the bundle under them).
- Helpers: `raptor-port/scripts/handpass/am/am-lib.mjs` (re-exports `../lib.mjs`): `open({width,height,state})`
  logs in as admin (`who:'m'` for the member), `editWeek`, `board(page,di)`, `closeBoard`, `signDay(page,di)`,
  `publishDay`, `publishAL`, `unpublish(page,di,{confirm})`, `head(page,di)` (the day head's tag, pending chip,
  "Not yet signed", buttons, sign state), `book(page)` (the engine's book — for your table only), `marks(page,
  sel)`, `planMenuItems` / `planMenuPick`, `editText(page, key, value)` (a `data-txt` cell on the edit week),
  `viewHead`, `shot(page, name, locator?)`, `go(page,'viewsched'|'editsched'|'leavewar'|'inputs')`, `tap`, `type`,
  `put` (arm a seat and drop a person). Read `am-lib.mjs` and `../lib.mjs` before you start.
- **The everything week** (a saved world): `raptor-port/docs/handpass/2026-09-24-amendment-week.json` — pass it as
  `open({ state: '<that path>' })`. Its days: Mon = Original → AL1 (a day note) → one pending time change (AL2
  dotted); Tue = Original, nothing pending; Wed = never published, Plan A / Plan B (B live, edited); Thu = Original
  with a contingency Plan B made after publishing (A live); Fri = draft; Sat = the everything Saturday, published
  as its Original (earns OIL); Sun = Original → AL1 → Unpublished (AL1 retired, the day correcting AL1). Recipe:
  `scripts/handpass/am/am-fixture.mjs`. **Each `open()` is its own browser context = its own copy of the world**;
  nothing you do reaches another walker.
- A fresh world when a scenario needs one: `open({})` in a NEW context (never `fresh:true` — `?fresh=1` keeps
  everything in memory and a reload loses it). **Never sign in again mid-fixture on a fresh demo world** (§7.7):
  make one write before any reload.
- Set `process.env.HP_SHOTS` to YOUR picture folder before importing the helpers:
  `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/<your walker id>`.
- Phone = `{width:390,height:844}`, desktop = `{width:1440,height:900}`. Walk BOTH for every surface scenario.
- The board is drawn twice in the DOM (desktop + phone); `am-lib` scopes to the visible one. On a phone the
  board closes through `#sbClose` (`closeBoard` does it).
- Write each script as an assertion of the RIGHT behaviour (bug-check order §5 "the re-walk"): print PASS/FAIL per
  check, so re-running it after the host's fixes IS the re-walk.

## The rules of the walk
- Drive the app's OWN controls — the sign selects, the buttons, the menus, typing, dragging. Read `window.SCHED`
  / `window.DAYS` only to RECORD what the engine holds, never to set state.
- **Look at every picture you take** (open the PNG) and describe what a person sees. A picture you did not look
  at did not happen.
- Watch the error list (`errors` from `open`) throughout — any console error is a finding.
- A gesture that fails in the script is looked at on its picture before it is called a defect (the driver may
  have missed; a toolbar may cover the target).
- **Walk the money** where your list says so: the Leave War cell and the OIL figures after each publish /
  amend / unpublish / undo (`lwCell` in `../lib.mjs`).
- What is NOT a finding (owner, D56): harm that lives only in data already stored when the code is already right
  going forward. Out of scope: EOD (not built), the old-format "locked week" books.

## What you hand back
1. Your scripts in `raptor-port/scripts/handpass/am/<id>-*.mjs`, pictures in your folder.
2. **Your report** at `raptor-port/docs/handpass/parts/2026-09-24-amendment-<id>.md`:
   - per scenario: setup, the steps you drove, **expected (with the AM id) / observed / PASS or FAIL**, the
     picture names, desktop and phone;
   - every FAIL as a finding: exact reproduction steps from a named start state, what the screen says vs what the
     register says, whether it reproduces every time, and the file/line you believe is responsible if you looked;
   - the roll-call rows you touched (R1–R22 in the evidence sheet §4) with SHOWS / ACT / PAINTED WITH filled;
   - explicit negatives: what you checked and found right;
   - what you could NOT walk, and why.
3. A final message of at most 25 lines: the FAILs, one line each, and the path of your report.
</content>
</invoke>
