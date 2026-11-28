# Section 1 (the guard rail) — step K4, round 2: what the orchestrator's review owes it (chat 204, 27 Nov 26)

K4 (the pick's door) is built and committed as it stands; its report is
`raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k4-report.md` — read it first, with its brief `…-k4-brief.md`.
The door's code is accepted as built (`state/pick.ts`, `state/doorwait.ts`, the two callers): **this round changes no
line of it unless item 3 finds a fault.** Three things are owed before K4 is whole.

## 1. The four kind (a) tests — the brief's error, not the builder's

`src/ui/msq-pick-windows.test.tsx`, its second describe (l.360, 376, 393, 409 as K0 counted them): each sets up a
held Input window by a pick, which is now refused, so each is red. **The K4 brief was wrong to rule them out: they
are this step's** (the plan §10 step 0; K0's census,
`raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k0-c-report.md` §1 "For kind (a): the road that still
exists"). Re-point each to the road that still makes that state — his own move at midnight, in the shape of
`src/ui/msq-fix-sched-windows-midnight.test.tsx`, asserting the midnight band's words where the test read the pick's
band — keeping every assertion that is about what the held window does (Undo and Redo leave it held; what gives it
back). l.360's last step ("142 picked again gives it back") goes with the kind (b) tests: by the raw entry, renamed
as they are. Each test's title says what it now holds; your report gives each one's old and new set-up and every
assertion that changed, with why. **Never weaken or delete an assertion to get a pass: if the midnight road does not
make the state a test needs, stop on that test and report exactly what differs.**

## 2. `src/ui/msq-guard-open.test.tsx` runs its worker out of memory (about 4 GB, 340 of 341 passed)

It did so twice for the builder and once for the orchestrator (336 of 341). GitHub's machine may do the same, and a
file that cannot finish is not a check.
- **First find the cause, briefly (30 minutes at most):** does memory climb per test because something is never let
  go — a rendered app not unmounted (`cleanup()`), a store listener, a window's document listener, the Tracker's
  probe, a `vi.fn` history? Measure with `process.memoryUsage().heapUsed` logged in an `afterEach` across one
  describe, before and after a candidate fix in the shared teardown (`guardTeardown`,
  `src/test-support/msq-guard-testkit.ts`). A real leak in the teardown is fixed there — and say whether the leak is
  the test world's alone or the app's own (an app listener never removed is a finding for the orchestrator, reported,
  not fixed here).
- **If no cheap cause is found, split the file:** its describes moved whole — not one assertion changed — into two or
  three files (`msq-guard-open-1.test.tsx` …, each calling `withThird()` and using the shared kit), whatever was
  file-local and shared moved into the kit. Then every place that names the file is brought with it: the roll-call
  (`src/ui/msq-guard-rollcall.test.ts` — any scan that reads this file by name), comments in the other guard tests,
  K4's report's table is left as history. Each part is run whole and must finish and pass; give each part's test
  count and the sum (341 plus whatever item 1 adds elsewhere — the sum of the parts must equal today's 341).
- Either way the file (or each part) is run to its end, in the background by its full path, and its result read
  from its output file before you report.

## 3. One beat to check at the entry

`enterPicked` runs `closeShown()` and then reads `holdNow()`, which still counts a Leave War sheet that only shows
things until it unmounts (`state/typing-hold.ts`: any war window), so the war may be entered "held" for one beat and
released by the window's going. Write the test that settles it — a show-only war sheet open ("Leave filed on the
Inputs page"), a pick by the bar, then after everything settles: the war's world is the picked squadron's, no held
band on the page, `holdNow()` is `'none'` — **and, in the same run as the entry, whether a held band was drawn at
all** (a render between the entry and the release). If nothing is ever drawn held, record that in the report and
change nothing. If a band is drawn for a beat, the fix is the smallest one in `enterPicked`: the hold asked for is
`'war'` only when a war window that is NOT show-only is open (`state/guard.ts warSheetOpen` is that reading for the
sheets — check what else `warWindows()` counts before using it), with the test seen failing first.

## Checks

- The touched files by name, each output to `.tmp/k4r2-*.txt` with its exit code; then K4's own files again
  (`src/ui/msq-guard-doors.test.tsx`, `msq-guard-g`, `msq-guard-asis`, `msq-pick-windows`, `msq-pick-swap-question`,
  `msq-night-held-input`, `src/tracker/msq-trk-follows-pick.test.tsx`, `msq-guard-note`, `msq-guard-rollcall`,
  `src/test-support/no-app-import.test.ts`).
- `npm run lint:changed` — stays at the one finding that is not this section's (`ui/UsersPanel.tsx`, `PersonEditor`).
- `npm run build` under the checks lock: `node scripts/gatelock.mjs status`; free → `take
  "claude/msq-s1-guard-6ae5e1 — K4 build"`, build, release at once. **Held: look again every five minutes for up to
  thirty minutes while you do the other items; still held at the end → NOT RUN, said so.** Never build alongside.
- No full unit suite. Do not commit, push, or edit `HANDOFF.md`, the plan or `src/ui/UsersPanel.tsx`.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-k4-round2-report.md`

Item by item: what you found, what you changed, each test's old and new shape, the numbers of every run. End your
reply with the report's path and one line: is K4 whole now.
