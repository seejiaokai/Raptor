# Section 1 (the guard rail) — step K1, first of three passes: K1a, the guard's table and seam (chat 198, 26 Nov 26)

**K1 is part A of the plan — one answer to "what is open".** No door asks the guard yet and nothing closes yet: after
K1 the app behaves exactly as today. The orchestrator has cut K1 into three passes, each its own commit, each leaving
the whole suite green: **K1a (this brief)** — the seam, the table, every window whose state is a module's flag;
**K1b** — every window or typed work whose state is a component's own (Admin's rows and forms, the Inputs list's OIL
question, the Calendar family on his E1 answer, Quals' "Add qualification", the two edit modes' ends, the Leave War's
show-only mark); **K1c** — the Tracker's list and bridge. Do K1a only. Where you see K1b's or K1c's work, leave it and
name it in the report.

## Read first — the plan by section, never whole

`raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` (510 KB — read only these line ranges, with
the Read tool's offset and limit):

- §21's "Rules for every section" (l.3242–3282) and **§21.1 whole (l.3284–3425)** — its two blocks, "Step 0 — this
  part read against his answers" and "K0 — done", **win over any older line of §3–§18**; and its lists "The files it
  changes" and "It must not touch".
- §3.1 (l.181–299), §3.2 (l.300–467), §3.3 (l.469–504), §3.4 (l.506–546), §3.5 (l.548–571) — the design, every
  window, the tests.
- §10's "Every step" rule (l.1566–1574) and step 1's row (l.1579); §18.2 (l.2183–2197); §9 (l.1489–1528, the overlap
  with other open work — what of `ui/SchedBoard.tsx` and `ui/toast.ts` you may touch).
- `.claude/rules/raptor-executor.md`; `raptor-port/CLAUDE.md` §Architecture rules and §Coding conventions;
  `.claude/rules/decisions/people-accounts.md` §Many squadrons (with the Read tool) — the guard's rulings (D2403,
  D2590, D2595–D2598, D2627, D2654).
- The reports this builds on: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k0-c-report.md` (the census and
  the reads) — search it for the windows you touch; `…-msq-s1-k0-b-report.md` for `withThird()`.

**What his answers decided (D2654, D2729) — build these, not the plan's older "default / other answer" wording:**
the six windows that only show things close by themselves (ALL AVAIL, Changes, Insights, a SANS day, the Leave War's
day panel, a Tracker event's details — the last is K1c's); Traffic, Jump to a date, a day's ⓘ and the document viewer
close themselves as today (`'no'` rows); a held Input window is given back (E5 — nothing of it here); **the Leave
War's sheets all refuse** — E9b's five windows are with him as a question, so the war has ONE row (`lwsheet`,
`window`, `warWindowOpen()`) and no `showOnly` mark and no `lwshow` row in this pass; the board's two dialogs refuse.

## K1a — what is built

1. **`src/state/guard.ts` (new, no imports)** — the seam exactly as §3.1 writes it: `setGuardAsk`, `setGuardSay`,
   `refusalAt(door, to, opts?)`, `refuse(door, to, opts?)`, `setGuardClose` / `closeShown()`, and `setEntryChecker`
   as a setter only (the checker itself is step K7 — install nothing, call nothing). With nothing installed nothing
   is open, nothing refuses, `closeShown()` does nothing. **No door calls any of it in this step.**
2. **`src/ui/windrawn.ts` (new, plain module)** — each drawn predicate of §3.2 (b), (c) and (e) as one exported
   function built from module state alone, **and its component calls that very function** for its early return or
   its `hidden` (the four template / Plans dialogs, ALL AVAIL, Changes, Insights, the Input dialog's second return,
   the board's two dialogs, the medical move, the OIL question put before a change). No component file gains an
   export (React Doctor's only-export-components). What each component draws must not change by one case — you are
   moving a predicate, not editing it.
3. **`ui/winorder.ts winUp(id)`** — a new read-only export.
4. **`src/ui/guard.ts` (new)** — `GUARD_ROWS`, `GUARD_ORDER`, `FLOAT_WHERE`, `whatIsOpen(skip?)`, `rowReachable`,
   `closeShown()`, `useGuardWork(id, on)`, `useGuardCloses(id, on, close)`; it installs itself into the seam as it
   loads. Rows in this pass:
   - §3.2 (a): every `<FloatWin id>` in the source through `FLOAT_WHERE`, `open() = winUp(id)`. `lwday` and `sansday`
     are `closes` (`closeDayPanel`; the SANS day's closer handed over by `useGuardCloses('sansday', …)` in
     `ui/SansCal.tsx` — the one component report of this pass). **`days`, `inputsset`, `sansset`, `everywd`,
     `holiday` and `inputsday` are plain `window` rows in this pass** (the refusing side); K1b gives the Calendar
     family its E1 shape (`closes` with `dirty`). Say so in a comment on those rows.
   - (b) ALL AVAIL and Changes (`closes`); (c) the Input dialog, Insights (`closes`), the four template / Plans
     dialogs, the board's two; (d) the four bar-free windows as `'no'`; (e) the medical move and the OIL question put
     before a change (`window`) — `oilrevise` is K1b's; (f) `lwsheet`; (i) the lists, menus and modes as `'no'` rows,
     each with its `why` — Logic's and Quals' edit modes among them, **without** their `end()` (K1b); (j) `unsaved`
     (`saveRefused()`); (k) the `'no'` rows with `why: 'H13'`.
   - Declare the row ids K1b and K1c will fill (the Admin reports, `oilrevise`, `holimport`, `qualsnew`, `trk`,
     `trkask`, `trkinfo`) **only if** the table's typing needs them; a row declared and not yet wired must answer
     "not open" and be listed in the tests' `TO_COME` (below). Prefer leaving them out.
5. **The guard loaded where §3.1 says** — `test-support/msq-world.ts` imports `ui/guard`. The two global test set-ups
   are K7's (the checker); do not touch them unless a test of this pass cannot run without the import — then say so.

**Not in K1a:** any door (`pick.ts`, `store.ts switchRoleView`, `belltap.ts`, `setPage`), the note (`guardnote.ts`,
`toast.ts`), any word a person reads, the checker, `UsersPanel.tsx`, `SquadronsPanel.tsx`, `QualsPage.tsx`,
`LogicPage.tsx`, the Calendar's and settings windows' own files, `leavewar/ui/Sheet.tsx`, anything under
`src/tracker/`. `ui/SchedBoard.tsx` — only its two dialogs' predicate (§9's promise). `src/engine/` — nothing.

## Tests first, each seen failing (a pin seen passing, and named a pin)

- **`src/ui/msq-guard-rollcall.test.ts`** (R9 is there already — keep it): **R1, R2, R8, and R7's planted-window cases
  for the scans this pass owns** (§3.4's table). R8's list in this pass is the five non-Tracker windows his rulings
  name; each id later added cites his answer in the same commit. **R3** (every frame counted, per file) and **R4**
  (the Tracker) are K1b's and K1c's — do not write them half.
- **`src/ui/msq-guard-open.test.tsx`** (new; jsdom; `withThird()` in its set-up, R9 checks it): **A1, A2, A3, A4, A5,
  A9, A10, A14, A15** for the rows of this pass — each window opened through the app's own opener and component,
  never by setting a flag. A14's and A15's spies are on the seam; with no door calling it they pass today — write
  them as pins and name them so. A15 is written against today as K0 pinned it (§21.1 "K0 — done": at his own move at
  midnight ALL AVAIL and Changes close, Insights stays open).
- **One explicit list, `TO_COME`, in each of the two files:** the row ids, flags and tests a later pass owes (K1b,
  K1c), each with the pass that owes it — so A2's "a row with no entry in the map fails" and R1's "every flag has a
  row" hold now for everything else. K1c's last test proves the lists empty.
- **Must stay green, untouched:** `src/ui/pops.test.ts`, `src/state/view-reset.test.ts`, `src/ui/msq-guard-asis.test.tsx`,
  `msq-guard-input-sqn.test.tsx`, `msq-guard-g.test.tsx`, and the tests of every component you moved a predicate out
  of (find them by the component's name and run them).

A test that will not fail first and is not a pin is reported, never bent. An existing test is not changed in this
step — if one must be, stop and say why in the report.

## Then

In `raptor-port/` (by its full path): the touched and named test files green with `npx vitest run <files>`;
`npm run build` — **only with the checks lock free** (`node raptor-port/scripts/gatelock.mjs status` from the repo's
top folder; if another chat holds it, wait — do not build alongside); `npm run lint:changed` if it can run in this
working copy (chat 194 found it cannot read `origin/main`'s side here — try once, report what it said). Do not run
the full suite, any browser test, or the Tracker smoke. Do not commit, do not push, do not edit `HANDOFF.md`, the
plan, or any file outside `raptor-port/src` and your report. A file you need that is not on §21.1's list of files —
stop and say so in the report before editing it.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k1a-report.md`

- every file changed and why; every predicate moved — from where to which `windrawn` function, and the tests of that
  component you ran;
- the table: each row id, its `counts`, its `where`, its ruling;
- each test: seen failing first (the failure's one line) then green, or "pin — seen passing"; the counts;
- `TO_COME`, whole;
- every place today's code differs from what the plan says it is (the plan was written from reading; you are the
  first to build on it) — and what you did about it;
- anything you could not check without a browser; anything you left for K1b or K1c that the plan placed in step 1.

End your reply with the report's path and the four-line footer of `.claude/rules/raptor-executor.md`
(Status / Changes / Checks / Open items).
