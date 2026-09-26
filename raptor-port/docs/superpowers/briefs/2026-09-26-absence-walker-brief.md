# [HUMAN-RETEST] the absence record — the walkers' brief (26 Sep 26)

Every walker (W1–W5) reads this whole file first, then its own section of the plan. You are one of five parallel
helpers walking the REAL app for the absence-record re-test (bug-check order `raptor-port/docs/bug-check-order.md`
§4 "a long walk is fanned out", §7 the walk). The host (the chat that sent you) reproduces every finding you report
before it counts, so your job is to FIND and to PROVE with pictures — not to fix.

## The one rule

**A walk that left no picture did not happen.** Drive the running app the way a person does, through its own
controls; photograph each step that shows a result; write a table. A PASS means you SAW the right thing on screen.

## Where everything is

- **The repository:** `C:\Users\User\projects\Raptor\.claude\worktrees\absence-record-d147-af6a50` (a git worktree —
  work ONLY here; `C:\Users\User\projects\Raptor` is a different checkout on another branch; never touch it).
- **The app:** the production build is ALREADY served at `http://localhost:4175`. Do not build, do not start or stop a
  server, do not run `npm test` / `vitest` / `playwright test` / the gates — another chat's checks share this PC.
- **The plan:** `raptor-port/docs/superpowers/plans/2026-09-26-absence-retest-plan.md` — §3 (the live rules), §4 (the
  roll-call R1–R24), §5 (the everything-world), §9 (what the reviews changed: R25–R36, the findings AB1–AB8, YOUR ground).
- **The rules, newest wins:** `raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md` (§5 lists rules SET
  ASIDE — never test those as live) and `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md`
  (§11: the rulings since the hunt).
- **The scenario lists the two reviewers wrote:** `raptor-port/docs/handpass/2026-09-26-absence-fable-scenarios.md`
  (S1–S40, F1–F8) and `raptor-port/docs/handpass/2026-09-26-absence-astra-scenarios.md` (1–40, A–B). Your section names
  the ones that are yours; walk them as written, and add what they missed.

## The drivers — use them, do not rebuild them

Node scripts in `raptor-port/scripts/handpass/ab/`, run FROM `raptor-port/` (`node scripts/handpass/ab/<file>.mjs`).
Start every script with `process.env.AB_WHO = 'wN'` (your walker id) BEFORE importing, so pictures land in
`raptor-port/docs/img/handpass/2026-09-26-absence/wN/`. Then:

```js
process.env.AB_WHO = 'w3'
const L = await import('./ab-lib.mjs')          // everything below
const S = await import('./ab-sched.mjs')        // the schedule side: publish, counts, the Unavailable block
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })   // phone: 390 x 844, dpr 3
```

- `openHi({ width, height, who: 'a' | 'm', dpr })` — a FRESH demo world in its own browser context, signed in as the
  admin (`ad` = Saber, person `stiff`) or the member (`us` = Ranger, person `bane`). Each call is its own world.
- The war: `lwOpen(page, iso)` (closes the scheduler board first), `tapCell(page, id, iso)` → what sheet opened (its
  name, words, buttons), `sheetNow(page)`, `sheetPress(page, testidOrRegex)`, `closeSheets(page)`, `bidOn(page, id,
  iso, code, { portion: 'full'|'am'|'pm' })`, `lwAward(page, id, iso, days, why)`, `lwCell(page, id, iso)`,
  `rowRun(page, id, [isos])`, `figures(page, id)` (every figure on the man's sheet), `lwBalCol(page, id)`,
  `lwTracker(page, id, shotName)`, `lwShot(page, name, id, iso)`.
- The Inputs page: `fileInput(page, { person, type, from, to, span: 'all'|'am'|'pm'|'custom', start, end, remarks,
  oil: 'yes'|'no' })` (the real form; answers the certificate and OIL questions; returns the NEW input's id),
  `inputsView(page, 'list'|'cal'|'med')`, `inputsWindow(page, fromIso, toIso)` (the table shows a DATE WINDOW — move
  it before looking for a July row), `deleteInputRow(page, iid)`, `inputsOf(page, person)` (stored, for your table).
- The schedule: `S.pubOnBoard(page, di)`, `S.pubAndSign(page, di)`, `S.counts(page, di)` (every pending count and the
  four sign-offs), `S.unavOn(page, 'face'|'work', di)`, `S.shotUnav(...)`, `S.freeMen(page, [dis])`.
- Pictures: `shot(page, name)`; results: `resultBook(tag, file)` → `ck(id, ok, expected, observed)`, `note(id, x)`,
  `save()`. Reads of `window.*` are for your TABLE only — **never write through `window`** to set up a scenario
  (bug-check order §7.7: if a state cannot be reached through the app's own controls, that IS a finding).
- The worked example of all of it: `scripts/handpass/ab/ab-h1-published-doors.mjs` and `ab-h2-fable-repro.mjs`.

## The world you start in (a fresh demo)

- The demo week is **Mon 13 – Sun 19 Jul 2026** (day index 0–6); the weekend is duty-only. **Friday 17 Jul is the only
  weekday a publish is allowed on** (Mon–Thu carry hard conflicts). The following week (20 Jul on) is clean.
- The Leave War: **JAN – DEC 26** at stage **OPEN FOR BIDDING** (bidding window 1 Jan – 31 Mar), and **JAN – DEC 27**.
  An admin advances or reopens the stage with the stage control; a member bids only on his OWN row (D166).
- People (row id = person): stiff = Saber (the admin), bane = Ranger (the member), taipan = Cobra, sufa = Grit
  (ATT C 13–17 Jul in the demo), pike = Nomad (OD 15–17 Jul), nasty = Quill (LL 14 Jul), divot = Vector (OML 13 Jul),
  shrek = Wisp, bruise = Gambit, dice = Reaper, pump = Piston, snap = Cinch, slipway = Drifter, prowler = Hunter,
  bapster = Wildcard, haowen = Talisman, prism = Recon; ground crew spanner / torque / gizmo. `S.freeMen` finds men
  with nothing on given days.

## The traps that cost an hour — read them

- **The scheduler board is a full-screen layer.** Close it (`closeBoard`) before touching another page; `lwOpen` and
  `fileInput` in ab-lib already do.
- **The Inputs calendar is full-screen too**, over the page's own buttons; leave it through its own ✕ (`#icClose`) —
  `inputsView` does. It opens at TODAY's month (Sep 2026): step back to July with its ‹ (`#icPrev`).
- **The Inputs table shows a date window**, not every input — use `inputsWindow` first.
- **A tap on an Inputs-filed leave** opens the read-only "Leave from Raptor" sheet (it says change it on the Inputs
  page) — that is the design, not a dead control. A war bid opens "Place a bid" with the DECISION row (Ack / Approve /
  Refuse / Move) for an admin.
- **A new input goes to the TOP of the Inputs list**, the war's to the bottom — never take "the last one".
- **The board and the week are drawn twice** (desktop and phone twins); scope to `:visible`.
- **Never sign in again mid-fixture on a fresh world** (a sign-in reloads a world nobody wrote to); make one write
  first, or use a second `openHi` world.
- **Chromium's touch**: for a phone gesture use `openHi` at 390 x 844 and drive `page.touchscreen` / CDP
  `Input.dispatchTouchEvent` (worked example `scripts/handpass/trk-pinch.mjs`) — a mouse click is not a finger.

## What is NOT a finding

- **Demo data (owner, D56, verbatim):** *"Do not report a problem whose harm exists only in data already stored when
  the code is already correct going forward."* If NEW data would be hurt too, report it.
- **Deliberate:** one undecided + one refused request may share a half; windows that only touch do not clash; OIL may
  go negative; a member cannot act on another man's row; the posting dates gate nothing (N8).
- **Decided, not built — record what you see, do not report it as a defect:** undo reverses only your own changes
  (D148, the next re-test's).
- **Already filed — if you meet one, name its id and move on:** `[LW-WEEKDAY-WORK]`, `[LW-COMMIT-MANNING]` (duty &
  commitment inputs do not reduce the war's manning), `[LEAVE-YEAR]`, `[LW-LOCKMARK]`, `[OIL-AWARD-IS-A-GRANT]`,
  `[OIL-PERSONAL-PLACEHOLDER]`, `[OIL-RELINK-XWEEK]`, `[INSIGHTS-WORKING-COPY]`, `[PEEK-ISSUED]`, `[LW-FROZEN-BAR-GAP]`,
  and AB1, AB3, AB5 (already reproduced by the host).

## What you hand back

1. **Your sheet:** `raptor-port/docs/handpass/parts/2026-09-26-absence-wN.md` — (a) your roll-call rows filled: for
   each place in your ground, SHOWS / can ACT / what is PAINTED on the same pixels, at BOTH widths, as admin and as
   member where it applies — no blank cells; (b) your scenarios: id (the reviewer's S/number or yours), setup,
   expected (with the rule id), what you SAW, PASS / FAIL, picture names; (c) every FINDING: what happened, the exact
   steps to reproduce from a fresh world, the rule it breaks (id), its pictures, who it hurts and how; (d) what you
   did NOT walk and why; (e) console errors seen (the `errors` array — any error is a finding).
2. **Your scripts** in `raptor-port/scripts/handpass/ab/wN-*.mjs`, written as assertions of the RIGHT behaviour, so
   re-running them after a fix IS the re-walk. Your pictures in `docs/img/handpass/2026-09-26-absence/wN/`.
3. **Do not** edit anything under `raptor-port/src`, any test, any document other than your own sheet, and do not
   commit or push — the host does that.
4. **Your final reply** (under 400 words): how many scenarios walked / passed / failed, your findings in one line each
   with the rule and the picture name, and anything you could not walk.

Aim for about 60–90 minutes of walking. Depth over breadth: a scenario walked in both orders, at both widths, with
undo, redo and a reload after it, beats three walked once.
