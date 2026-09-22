# [ALL-AVAIL-WINDOW] — the final code read. Brief for BOTH providers, independently.

**Bug-check order §4 rank 2 and §4a.** This change touches EARNED LEAVE (OIL is a day off banked for
the man — the window's earn half switches a man off earning for an event), the ISSUED record (the
window reads issued versions) and saved data. One inspector is not enough: Fable 5.1 and Astra/Codex
each read the finished code, **blind to each other. Neither is shown the other's report before both
exist.** The builder was Opus 5.5 (D67 — the model that wrote it never reviews it).

**READ-ONLY.** Do not edit, create or delete any file, and do not run anything that writes (no
builds, no test runs that write caches, no git commits). Read files and run read-only commands only.

**The walk has already run** (§4a's first rule — reading for absence works with a roll-call in hand).

## What to read

- Branch `claude/all-avail-window`, against `main` (`git diff main...HEAD -- raptor-port/src raptor-port/e2e`).
- **The evidence sheet: `raptor-port/docs/handpass/2026-09-23-allavail-window.md`** — the tier, the
  roll-call, the orders walked, every scenario's disposition, what was NOT walked.
- **Fable's scenario design: `raptor-port/docs/handpass/2026-09-23-allavail-window-fable-scenarios.md`.**
- The contract: `raptor-port/docs/ui-contracts.md` §[ALL-AVAIL-WINDOW]; the approved design of record:
  `raptor-port/docs/mock/allavail-window.html` (D41).
- The rulings: `DECISIONS.md` — **read the whole file**; the ones that govern this are D27, D32, D33,
  D36, D37, D38, D39, D40, D41, D43, D44, D45, D46, D56, D65, D66.

## The brief itself — this wording is the standing order's, verbatim

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove
> correctness. Start with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Required of both:

- **Exact, step-by-step fix instructions per finding** — file, function, what to change, the test
  that should go red first. Not a direction.
- **Explicit negatives**: "I checked X and found nothing." A confident all-clear from one reader on
  an area the other found a defect in is the cheapest pointer to a real bug.
- **Compare against `main` before calling anything newly introduced.** "Pre-existing" never erases
  severity; the dangerous category is old code a new feature has just made reachable.
- Rank findings most severe first; give each a one-line plain-English summary a non-technical owner
  could read.

## Where to read first

1. `raptor-port/src/ui/AvailWindow.tsx` — the window: the opener shared by board and week, the
   placement body (`place`, the ResizeObserver), the read inside `withChipWorld` + `oilReadPass`,
   the tap (D65 selection, the earn switch, the refusals, the history line).
2. `raptor-port/src/ui/html.ts` — `withChipWorld` (it swaps module state — PV/PVQ/OFW, `DAYS[di]`,
   `SCHED`, `WARN` — inside a React render), and the count chip's `data-oilver` / `data-oilofw`.
3. `raptor-port/src/ui/pops.ts` — the window's state: `setAvailWin` resets the footer and the box.
4. `raptor-port/src/state/view.ts` — `setPage` closes it; `VIEW_RESET` carries it for week and
   session; `prunePreviews` closes it when its version stops resolving.
5. `raptor-port/src/engine/validate.ts` — `crowdClashes` and the leg-window bodies it shares with the
   warning list (the list must stay byte-identical to the reference); `raptor-port/src/ui/oilmode.ts`
   — `oilItemLabel` (`found`, the request window), `oilFromWords`, `oilRequestName`, `oilPersonSays`.
6. `raptor-port/src/ui/board.ts`, `raptor-port/src/ui/interactions.ts` — the two chip taps.
7. `raptor-port/src/ui/scheduler.css` `.availwin` — stacking (410) and the phone rule.

## Specifically worth attacking

- `withChipWorld` swapping global state during render: can a throw, a nested render, a notify or an
  effect inside it leave the swapped world installed, or make another surface read the snapshot?
- The earn half under a version is read-only, and the walk found no screen route to it. Is there one?
- A switch made in the window: amendment, pending mark, undo, the history line — same as the board's?
- Any path that removes or replaces a version WITHOUT running `prunePreviews`.
- `crowdClashes` on the issued face uses `collectEvents()` while the snapshot is installed: right
  day, right men, right windows? Does the flag's event window always equal the window the crowd was
  resolved over (`dayOilWork` / `inpWin`)?
- The placement: can a user's resize be lost, a stored box strand the bar, the phone rule be beaten?

## Known and deliberately NOT fixed here — do not re-report

- `[OIL-PERSONAL-PLACEHOLDER]` — a placeholder on a landed Personal request row draws no count
  (pre-existing on `main`; filed).
- `[CROWD-SIM-BRIEF]` — the D38 flag covers a crowd man's flight brief/debrief, not his sim ones (filed).
- On a phone the window MOVES but cannot be RESIZED (CSS resize has no touch handle) — a question for
  the owner, not a defect to fix blind.
- The warning list's "COBRA  debrief" double space comes from the original app's label (`cs + ' ' +
  msn` with no mission) and is pinned by the reference; not this change's.

## Output

A single report: findings (most severe first) — each with severity, provenance (new on this branch /
pre-existing on `main` / made reachable by this branch), setup → action → expected → the observation
that disproves correctness, and exact fix steps — then the explicit negatives.
