# Section 1 (the guard rail), step K7 — the checker, switched on: the builder's report (chat 204's helper, 27 Nov 26)

Brief: `2026-11-27-msq-s1-k7-brief.md` (with the orchestrator's added case, below). Branch `claude/msq-s1-guard-6ae5e1`,
working copy `lw-balances-hover-275293`, from `4cdf6912f`. Nothing committed or pushed; `HANDOFF.md`, the plan and
`OUTSTANDING.md` not touched. Not touched: `src/engine/`, `ui/UsersPanel.tsx`, `ui/AdminPage.tsx`, `storage/`, any word
of the app, any behaviour of the app (every new call is a no-op unless a test set-up installs the checker).

**In one line: the entry checker now runs under every test of both suites — no squadron or view change by press goes
through with something open its door did not leave out, and nothing opens behind a refusal; its first full run failed 74
tests, every one of them a state made on purpose (or a set-up side effect of the checker itself, fixed); they are re-pointed
to two raw helpers that tell the checker so, and the allow-list by name is empty. Two tests stay red: the orchestrator's
added Inputs calendar case, whose cause is not the one read — a finding for the orchestrator, below, never silenced.**

**K7 is not whole:** the suite is green but for those two tests, which need a decision (finding 1).

## What changed, file by file

| File | Change |
|---|---|
| `state/guard.ts` | The seam's checker: type `EntryChecker` (`leave`, `refused`, `entry`, `raw`); `setEntryChecker(c)` now takes it; `refuse()` hands a passing ask to `leave` and a refusing one to `refused` (before the note is said); new `checkEntry(what, to)` and `rawOnPurpose()`. The head comment states the checker's limit (`maybeReenter`, `byPick` false — row 21). No imports, as before. |
| `state/store.ts` | `enterSquadron`: `if (byPick) checkEntry('enter', scheduleUnit)` after the re-entry guard, before anything is entered. `switchRoleViewRaw`: `rawOnPurpose()` first. The import line. |
| `state/perms.ts` | `switchRoleInForce`: `checkEntry('switch', next)` once the switch is allowed, just before `setEffectiveRole`. Imports `checkEntry` from `./guard` (a no-import file). |
| `testing/entry-checker.ts` | **New.** `makeEntryChecker(deps)` — the two checks; `INSTALLED`, the one installed into the seam; `RAW_BY_NAME`, the allow-list by name (empty); hooks: `beforeAll` loads `ui/guard` (below), `beforeEach` clears, `afterEach` fails the test with every failure kept (so a throw swallowed by an event handler or a promise still fails its test). File-map line: "the entry checker that runs under every test (the guard rail's step K7): an entry by press or the role switch with something open its door did not leave out throws; a window opened behind a refusal fails the test". |
| `test-support/raw-entry.ts` | **New.** `rawEnter(u, holdWar?)` — the raw entry (`enterSquadron(u, hold, true)`) and `rawRole(next)` — the raw role change (`switchRoleInForce`), each telling the checker it is made on purpose for its turn. File-map line: "the raw entry and the raw role change of the guard rail's tests, made on purpose, told to the entry checker (step K7); removed with the band in Build 2". |
| `vite.config.ts` | The raptor suite's `setupFiles` gains `src/testing/entry-checker.ts`, with its comment. |
| `leavewar/test-setup.ts` | `import '../testing/entry-checker'`. |
| `ui/msq-guard-rollcall.test.ts` | **R5 (a)** (2 tests) and **R6** (9 tests). |
| seven test files | re-pointed to the raw helpers or re-pointed by the orchestrator's word — below. |

### Two calls of mine worth naming

1. **The flag, not names.** `switchRoleViewRaw` and the two helpers of `test-support/raw-entry.ts` set "raw on purpose" for
   the turn they run in. Every state K4–K6 made on purpose was already made through one of three places (the raw switch,
   a local `rawPick`, a direct `enterSquadron(…, true)`), so re-pointing those few lines to the helpers covered all of
   them, every assertion kept, and a renamed test can never fall off a list. `RAW_BY_NAME` is built and pinned by R6
   (each entry's file exists, holds the test, carries a reason), and empty. Build 2 removes the helpers with the band.
2. **The guard is loaded only where a door can be reached.** The brief says to import `ui/guard` in the set-ups. Done in
   a `beforeAll` (after the test file's own imports, so `vi.mock` keeps working), and only where the test file has
   loaded `state/store.ts` — every door lives in or imports it. Loading it everywhere turned 23 tests of the engine and the
   view-reset registry red on
   the first run (the edit log's and the view-reset registry's: the modules the guard brings in register things those
   files count) and cost a light file seconds. Which modules a file loaded is read from vitest's own worker registry; if
   that cannot be read, the guard is always loaded, so a vitest upgrade makes the checker stricter, never silent. The
   hook has a 60 s timeout: under the full parallel run the guard's graph took longer than vitest's 10 s.

## R6 seen failing first (the patch-file method, never `git stash`)

`git diff` of the five source files to `.tmp/k7.patch`, checked out, R5 (a) and R6 run, the patch applied back (the
diff afterwards identical to the patch): **8 failed, 3 passed** (`.tmp/k7-red.txt`). The 3: R5 (a)'s two (a pin and its
scanner check — true on the old code) and R6's allow-list test (empty list). The 8 R6 tests failed for the right
reasons: the store's raw `enterSquadron(…, true)` with a window open did not throw (no check asked); a window opened
behind a refusal was not seen (`expected [] to have a length of 1`); the seam had no `checkEntry` / `rawOnPurpose`; the
set-ups did not load the checker. Green with the code: rollcall 49 of 49 (`.tmp/k7-roll1.txt`).

## The allow-list, whole

- **By name (`RAW_BY_NAME`): none.**
- **By flag:** `state/store.ts switchRoleViewRaw` (the raw switch, K5's); `test-support/raw-entry.ts rawEnter` (the raw
  entry) and `rawRole` (the raw role change). Each is used only by a test whose name says the state is reached by no
  press, or (A10) by the stand-in for a change he did not make.

## The full suite's first run — every failure, and what I did

Run 1 (`.tmp/k7-full-run1.txt`): **74 failed, 17727 passed, 5 expected fail, 20 skipped, 6 to-do, of 17832; 12 of 1146
files red; exit 1; 1438 s.**

| File | Tests | What the checker said | Kind | What I did |
|---|---|---|---|---|
| `engine/editlog`, `engine/audit-a-editlog`, `engine/elog-durable`, `engine/audit-c-briefguard`, `state/view-reset` | 10, 4, 7, 1, 1 | nothing — they went red because the set-up loaded `ui/guard` into files that import no store | neither: a side effect of the checker's own set-up | the guard loaded only where the store is (call 2 above); all 23 green, nothing in them changed |
| `ui/msq-pick-windows` | 11 | an entry by press (149 / 142) with `lwsheet` or `inputedit` open, no leave | (i) — the kind (b) tests of K4, "reached by no press since D2403", by its `rawPick` | `rawPick` re-pointed to `rawEnter`; the `enterSquadron` import gone |
| `ui/msq-pick-swap-question` | 2 | the same, `inputedit` | (i) — the same | the same |
| `ui/msq-night-held-input` | 2 | the same, `inputedit` | (i) — K5's held window, by the raw entry | the direct call re-pointed to `rawEnter` |
| `ui/msq-guard-doors` | 1 | an entry (150) with `trk` open | (i) — K4's A7 pin, "150 entered by a road no press reaches" | the dynamic `enterSquadron` re-pointed to `rawEnter` |
| `ui/msq-guard-doors-bell` | 1 | an entry (150) with `oilday` open | (i) — K6's B25, "by a raw entry — reached by no press since D2403 and D2627 A19" | both direct calls re-pointed to `rawEnter` |
| `ui/msq-guard-open` | 31 | 30: the view switched with a counted row open (A10's "the role in force changed", one per row); 1: an entry (150) with `trk` open (A7's raw entry) | (i) — A10's change stands in for one he did not make (his account's role changed, `refreshAccess`, which asks nothing); A7's is named "reached by no press since D2403" | A10's change re-pointed to `rawRole('main')`, with a comment; A7's to `rawEnter`; the two unused imports gone |
| `ui/msq-inputscal-own-calendar` | 3 | an entry (142) with `inputsday` open — "the door 'page' gave the leave" | the orchestrator's added case: (i) by his word | re-pointed as he directed — finding 1 |

No assertion weakened or deleted. No test renamed but the three below (the orchestrator's instruction).

### The orchestrator's added case — `ui/msq-inputscal-own-calendar.test.tsx`

Done as directed, in the test file only: a `closeDay()` helper presses the day window's own ✕; each of the describe's three
Undo tests closes the day before `press('undo')`, re-opens it only where the next assertion reads the screen (the note
test and the new-note test), and is renamed "…reached by no press since D2381 and K6 (the Undo's landing would enter 142
with the open day window), so the day window is closed first". Every assertion kept. The third test ("a new note… its
Undo takes it away again") was red under the checker too, so it got the same re-point. **Result: the checker no longer
fires, the new-note test is green, the other two are still red, exactly as on GitHub.** That is finding 1.

## Findings for the orchestrator

**1 (stop — needs a decision). The two Inputs calendar tests fail for a reason other than the one read, and closing the
day window does not cure it.** Measured with a scratch probe (removed): before the Undo the page shown is View-only Sched,
not Inputs (the standing landing moved it there when 149 was entered — the calendar is drawn by the test directly), so
the open day window is on a page 149 does not offer and does not count (A7, D2627). The Undo's landing is on Inputs, so
`snapView` calls the page door; **the door's ask passes** (nothing counts), it sets the page and calls `notify()`, and the
landing enters 142 — all inside `snapView`, which runs *before* the Undo's writes. Before K6, `snapView` set the page
directly with no `notify()`, so 142 was entered only at the next redraw, after the writes. Now the step is written with
142 already in view: the saved row is put back, but the kept copy of 142's calendar (`keptPlan('u142')`) still holds the
edit ("Range day — moved", "Exercise — day 2"). The screen shows the right note. Window open or closed, the same.
- So the cause is K6's page door running the landing ahead of the Undo's own writes, in `state/undo-wire.ts snapView`.
  The fix is in the app (the Undo or the door), which the brief and the orchestrator's message both put out of my
  reach; the assertions stay as they are.
- Whether the stale kept copy can surface later (a pick of 149 again, then a look at 142's calendar from it) I did not
  test.
- **For K8**, as asked: on this belt road the Undo is left half applied — saved row undone, the kept copy not. The
  orchestrator's reading (the day window refuses, `snapView` returns early) is not what happens here; the K8 fix he names
  (the refusal moved before the step, in `globalUndo`) would not by itself cure it, since nothing is refused: the landing
  itself, and its order against the step's writes, is the part to look at.

**2. What the checker would have caught on that road, and may on a real one.** With the day window left open, the checker
threw: the page door's ask passed because the window was out of reach, and the landing then brought its page back and
entered 142 with the window counting again. The same shape looks reachable by presses after a change he did not make (my
reading of the code, not run): a Plan
holder of 149 with a window open on a page, his Plan lowered to View (he lands on View-only Sched, the window still set,
not counted — A7), then a bell line that opens that page — the door passes, and the window is live again on 142. By his
D2627 A7 the window does not count at the ask, so the door is right by the rules as written; the checker, which asks
again at the entry, is stricter. **Not built around:** whether such a window should close at that landing, or the door ask
again after the page is set, is a question for the plan. No test of the suite takes that road, so the suite does not show
it beyond this case.

**3. The code check did not finish on the first try** (`npm run lint:changed`: React Doctor took longer than its 600 s
while another chat's full run held the PC). The second run finished: the one known finding only (below).

## The full suite after the re-points

Run 2, under the checks lock (`.tmp/k7-full-run2.txt`): **2 failed, 17799 passed, 5 expected fail, 20 skipped, 6 to-do,
of 17832; 1 of 1146 files red (the two tests of finding 1); exit 1; 1534 s.** The lock was waited for (another chat held
it), taken, and released straight after the build, below (`.tmp/k7-lock-run2.txt`).

(Both runs took about 24–26 minutes with another chat's work on the PC; there is no measured full-suite time on this
machine to compare against, so whether the checker adds time I cannot say from these two runs.)

## Every other check

| Command (in `raptor-port/`) | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-rollcall.test.ts` | 49 passed, exit 0 (`.tmp/k7-roll1.txt`) — R5 (a) 2, R6 9, the 38 before them |
| the old code, R5 (a) and R6 | 8 failed, 3 passed (above) |
| census and source-scan tests by name: `state/perms`, `state/perms-scan`, `state/reqorphan`, `state/edit-rights-readers`, `engine/inputs-readers`, `engine/lockednote`, `test-support/no-app-import` | 158 passed after the hook's timeout was raised (the first try: three hook time-outs under load, `.tmp/k7-census.txt`, `.tmp/k7-census2.txt`). `edit-rights-readers` unchanged: K7 adds no `isAdmin`, `canEditSched` or `mayEditSched` call |
| the side-effect files (`engine/editlog`, `audit-a-editlog`, `audit-c-briefguard`, `elog-durable`, `state/view-reset`) after call 2 | 48 passed, exit 0 (`.tmp/k7-side.txt`) |
| the re-pointed files by name (`msq-inputscal-own-calendar`, `msq-pick-windows`, `msq-pick-swap-question`, `msq-night-held-input`, `msq-guard-doors`, `msq-guard-doors-bell`, rollcall) | 286 passed, 1 to-do, 2 failed — finding 1 (`.tmp/k7-repoint1.txt`) |
| `npm run build`, under the lock, right after run 2 | passed — the typecheck and the build (491 modules), exit 0 (`.tmp/k7-build-run2.txt`) |
| `npm run lint:changed` | first try: did not finish (finding 3, `.tmp/k7-lint.txt`); second: the one known finding only (`ui/UsersPanel.tsx`, high complexity — not this section's file), exit 1 as before (`.tmp/k7-lint2.txt`) |

## Where the plan and the code differed

1. **`ui/guard` everywhere** (the plan: the set-ups "import `ui/guard` too") — loaded only in files that load the store
   (call 2), for the reason measured there.
2. **"Each `refuse()` that refuses hands it the rows open at that moment"** — the seam has no way to list rows (it may not
   import `ui/`), so `refused` hands the refusal and the checker reads the counted rows itself, through `ui/guard`'s
   table: every row but the `'no'` ones, by its own `open()`.
3. **The leave's door when no door gave one** — the re-ask names the door `'entry'`; the guard's answer reads only `skip`.
4. **The orchestrator's reading of the Inputs calendar case** — finding 1.

## What only a browser can show, and scenarios worth a walker's time

Nothing new on screen: K7 changes no behaviour. Finding 2's road is the one worth a walker: Hunter, Plan of 149, 149
picked, a window open on Inputs; Saber lowers the Plan to View; Hunter taps a 142 input line in the bell. What opens, and
on which squadron's Inputs.

## Rulings

Rulings: none this session (a builder helper; no message from him).

```
Status: INCOMPLETE — two tests of the orchestrator's added case stay red (finding 1: needs a change in the app's Undo or page door, out of this step's reach)
Changes: state/guard.ts (the checker's seam: EntryChecker, setEntryChecker, checkEntry, rawOnPurpose; refuse tells it); state/store.ts (enterSquadron asks it with byPick; switchRoleViewRaw says raw); state/perms.ts (switchRoleInForce asks it); new testing/entry-checker.ts; new test-support/raw-entry.ts; vite.config.ts and leavewar/test-setup.ts load it; R5 (a) and R6 in ui/msq-guard-rollcall.test.ts; raw re-points in msq-pick-windows, msq-pick-swap-question, msq-night-held-input, msq-guard-doors, msq-guard-doors-bell, msq-guard-open; the orchestrator's re-point in msq-inputscal-own-calendar
Checks: listed above, in raptor-port/
Open items: finding 1 (decision), finding 2 (a question for the plan), docs/file-map.md lines for the two new files (above, for K12)
```
