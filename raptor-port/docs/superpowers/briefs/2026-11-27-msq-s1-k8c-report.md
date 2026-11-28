# Section 1 (the guard rail), step K8c — an Undo that changes the squadron in view closes what the guard closes: the builder's report (chat 204's helper, 27 Nov 26)

Brief: `2026-11-27-msq-s1-k8c-brief.md` (K8's and K4's briefs where it is silent). Branch `claude/msq-s1-guard-6ae5e1`, working
copy `lw-balances-hover-275293`. Nothing committed or pushed. Not touched: `undo/timeline.ts`, `ui/UsersPanel.tsx`,
`ui/AdminPage.tsx`, `ui/topstate.ts`, `storage/`, anything in `raptor-port/.tmp/` (K10's held patch untouched). No new
words on screen; no refusal added or widened.

**In one line: when the guard lets through the Undo (or Redo) that takes the squadron in view away (row 21 — the Undo of
"+ New squadron" with that squadron picked), the Undo's own hook now runs the guard's closing step at once, before the
step's writes, so Insights is shut and Logic's edit mode ends — writing a value still waiting its beat to 151, as its own
step — before 142 comes into view. Nothing else changes: an Undo that keeps the squadron, his own move at midnight and the
row-13 landing close nothing new.**

## What the code did before (read and measured, not assumed)

The Undo of "+ New squadron" lands on Admin → Squadrons (its landing). That page change already shut every window tied
to its page — ALL AVAIL, Changes and a SANS day (`state/view.ts setPage`) — and unmounted Quals, whose edit mode is the
page's own state. So for those the fault P1 named was not there; their tests are pins. What the page change did **not**
reach:
- **Insights** (drawn over every page) stood over 142.
- **Logic's edit mode** (kept by the app, not the page) stayed on over 142.
- **A value typed on Logic for 151 and still waiting its beat landed on 142's rules.** Measured: "13h" typed in 151's Crew
  rest, Undo pressed in the same moment — a beat later 142's Crew rest read 13h (780) instead of 12h. The page's own late
  write fired after 142 was in view. This is worse than P1 said ("never written"): it was written, to the wrong squadron.
- Not reached by a test, but the same road by reading: the Tracker's four show-only windows (its page stays mounted) and the
  Leave War's day panel and show-only sheets, if left open out of sight. 151 is brand new — no course, no leave period — so
  none of them can be opened there cheaply in the test world (see Open).

## What changed, file by file

| File | Change |
|---|---|
| `state/undo-wire.ts` | `squadronRefusal`: where the guard lets the step through **and** the step takes the squadron in view away (row 21), it calls `closeShown()` before returning — i.e. inside the hook the timeline asks just before `snap` and `applyRestore`, so before the step's writes. A refused press returns as before. Import of `closeShown` from the seam. A comment block above the function says why here, why before the writes, and why not row 13. 14 lines added, 3 changed. |
| `ui/msq-guard-doors-undo.test.tsx` | New describe "K8c" (10 tests, below); imports for it. |

Nothing in `store.ts maybeReenter`: his own move at midnight goes through that function and must close nothing (A14, A15).

## The Logic case and the choice

**Chosen: the end's write lands, and the Undo still takes back "+ New squadron".** Why it is correct and the smallest:
- The timeline has already chosen its step ("+ New squadron") before it asks the hook, so the value's write — a new
  settings command made by the mode's end (`flushRuleApply` → `rulesSave` → its own command) — is never the step this
  Undo takes back. Tested: "+ New squadron" undone, the value's step not undone.
- 151 is still in view when the hook runs, so the value is written to **151's** rules (its stored row `<151>@rules`),
  never 142's. Tested: 142 reads 12h at once and a beat later.
- The value's step stays on the Undo list as 151's. On 142 it is out of reach (a step of a squadron not in view waits for
  him there), so the next Undo on 142 takes 142's own steps. Redo of "+ New squadron" brings 151 back with the value: picked,
  151 reads 13h. Tested. So in practice the value "goes with 151" too — both of the brief's readings hold.
- No change he would see: no new words, no new refusal, no new button state.
- Not the other order (closing after the writes): by then the squadron row is gone and the write would either land inside
  the Undo's own command (part of the step being taken back) or on 142.
- No conflict with the step: "+ New squadron" writes the squadron, its place and its first admin's right — never its rules
  row — so the timeline's re-check after the view-snap finds nothing (`units.ts addUnit`).

Not covered by the choice, named: if the step were refused **after** the hook (the timeline's second conflict check after
the view-snap, or the restore itself failing — technical failures only), the windows would already be closed and Logic's
value already saved for 151. Saving the value is what Logic's own Done does anyway; a window closed before a technical
refusal is the one departure from "a refusal closes nothing". Not reachable by any press I found; avoiding it needs a hook
after the writes, inside `undo/timeline.ts`, which this step may not touch.

## Row 13 — a difference from the brief, and why

The brief asks for the closing step on row 13's road too. **I did not add it there.** Row 13's landing already enters his
own squadron through the page door's landing (`store.ts landOwn`, reached through `stepPage`'s kept door on the step's own
notify), which runs `closeShown()` itself — **after** the Tracker's question, so a Stay there closes nothing (§4.5).
Closing in the hook as well would close everything before that question, breaking "a Stay closes nothing" on that road.
Nothing is left behind on row 13 today: pinned by the row-13 belt test (Insights shut by the landing). Logic and Quals are
not offered on a squadron he only views, so no value can be waiting there. One word to change if the orchestrator rules
otherwise (`if (takesUnit) closeShown()` → `closeShown()`).

## Tests (all in `ui/msq-guard-doors-undo.test.tsx`, describe "K8c")

Seen failing by the patch-file method: `git diff` of `state/undo-wire.ts` to a patch file in the scratchpad, the file checked
out, the test file run (3 failed, 19 passed, 1 to-do), the patch applied back (the same 14/3 line counts), run again (22
passed, 1 to-do). Never `git stash`.

| Test | Seen failing |
|---|---|
| Insights open on 151, Undo: through, Insights shut | **yes** — "Insights shut: expected true to be false" |
| Logic's edit mode on, nothing typed, Undo: through, the mode off; 142's Logic opens with ✎ Edit | **yes** — "the mode off: expected true to be false" |
| Logic's mode on, "13h" typed in Crew rest and Undo pressed in the same moment: the value written for 151 as its own step, "+ New squadron" taken back, 142 reads 12h at once and a beat later; Redo, 151 picked: 13h | **yes** — "the value written for 151, as its own step: expected undefined"; and, probed separately, 142 read 13h a beat later |
| ALL AVAIL open on 151's Edit Schedule, Undo: through, shut | pin — the landing's page change already shuts it |
| Changes open, Undo: through, shut | pin — the same |
| A SANS day open on 151's SANS calendar, Undo: through, shut | pin — the same (the file reached it cheaply) |
| Quals' mode on, words typed in "Add qualification" then hidden by "✕ Edit quals" (so they do not refuse), Undo: back on Quals the mode is off and the words gone | pin — the landing's page change unmounts Quals, its mode with it. (With the box in sight the words refuse the Undo, K8's own case.) |
| An ordinary Undo (151 made, not picked), Insights open on 142: through, Insights still open, the closing step never run | pin. Insights, not ALL AVAIL: this Undo lands on Admin → Squadrons, whose page change shuts ALL AVAIL by its own rule, so ALL AVAIL cannot show that nothing new closes |
| His own move at midnight with ALL AVAIL and Insights open: the closing step never run, Insights stays; ALL AVAIL goes by itself, as P18 pinned (A14) | pin |
| Row 13, a belt (driven through the engine the Undo button calls, as B23): Ranger's own leave, 149 picked, Insights open, Undo: his leave gone, 142 on his Inputs, Insights shut by the landing | pin (named a belt) |

## Checks (all in `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-doors-undo.test.tsx` | 22 passed, 1 to-do, exit 0 |
| K8's files and every test naming `squadronRefusal`, `snapView` or `stepPage`: `msq-guard-doors`, `-doors-bell`, `-doors-switch`, `-doors-undo`, `msq-guard-g`, `msq-guard-note`, `state/undo-wire`, `ui/boardland`, `msq-guard-rollcall`, `msq-inputscal-own-calendar`, `undo/timeline-cr` | 11 files, 616 passed, 2 to-do, exit 0 |
| `npx vitest run src/ui/msq-guard-open.test.tsx` (the A14 / A15 pins and the closing step's own tests) | 190 passed, exit 0 |
| `npm run lint:changed` | the one known finding only (`ui/UsersPanel.tsx`, high complexity — the Admin → Users section's file), exit 1 as before |
| Full unit suite and `npm run build` | **NOT RUN** — the checks lock was held by another chat (`claude/sans-warnlines-185`, chat 208's walk) when asked; not waited for, as the brief says |

## What is open

1. **The full unit suite and the build**, under the checks lock, once it is free.
2. **Row 13 left to its landing** (above) — the orchestrator's call; one word to change.
3. **A technical refusal after the hook** would leave the windows closed and Logic's value saved (above) — not reachable by a
   press found; a fix needs `undo/timeline.ts`.
4. **Not reached by a test:** the Tracker's four show-only windows and the Leave War's day panel and show-only sheets left
   open out of sight on 151 — a brand-new 151 has no course and no leave period, so they cannot be opened there in the test
   world. The same `closeShown()` closes them (its own tests in `msq-guard-open`). For K12's walk: give 151 a course or a
   period first, or walk it on a squadron made and filled by another admin.
5. **P1's wording was narrower than the fault:** a value waiting on Logic was not lost but written to 142. Worth naming in
   the words-check's record (not changed by me).
6. For K12's file map: no new file.

## Rulings

Rulings: none this session (a builder helper; no message from him).

```
Status: READY FOR INDEPENDENT REVIEW
Changes: state/undo-wire.ts (squadronRefusal runs closeShown() on row 21 once let through, before the step's writes); ui/msq-guard-doors-undo.test.tsx (describe K8c, 10 tests)
Checks: listed above, in raptor-port/; full suite and build NOT RUN (lock held by another chat)
Open items: the full suite and build under the lock; row 13 left to its landing (orchestrator's call); a technical refusal after the hook; Tracker and Leave War windows not reached by a test
```
