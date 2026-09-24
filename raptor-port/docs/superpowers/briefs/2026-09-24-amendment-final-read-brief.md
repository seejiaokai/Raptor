# [HUMAN-RETEST] the amendment system — the final code read. Brief for BOTH providers, independently.

**Bug-check order §4 rank 2 and §4a.** The amendment system is PUBLISHED RECORDS, SAVED DATA and MONEY (a
published weekend's OIL — earned leave, time off banked, never pay — comes from its latest published version,
D142). One inspector is not enough: Fable 5.1 and Astra/Codex each read the code, **blind to each other. Neither
is shown the other's report before both exist.** The builder of this branch's fixes was Opus 5.5 (D67 — the
model that wrote it never reviews it).

**READ-ONLY.** Do not edit, create or delete any file, and do not run anything that writes (no builds, no test
runs, no git commits). Read files and run read-only commands only (`git diff`, `git log`, `git show`, reading,
searching).

**The walk has already run** (§4a's first rule — reading for absence works with a roll-call in hand): your two
scenario designs of this morning (both read), four parallel walkers on the production build at desktop and
phone width, the host's fixes (each red first) and the host's re-walk of what the fixes touched. The sheet
names what was NOT walked (§9) — those are the best places to look.

## What to read

- **The branch diff:** `git diff main...HEAD -- raptor-port/src` on branch `claude/amendment-retest` — the
  fixes this re-test made. Read them for correctness AND for what they did not reach (another caller of the
  same count, another surface of the same marker, another door with the same arm).
- **The whole amendment system, not only the diff** — this is a re-test of work that was only ever checked by
  code review and unit tests: `src/engine/publish.ts`, `src/engine/drafts.ts`, `src/engine/canonical.ts`,
  `src/engine/verid.ts`, `src/state/sched-commit.ts`, `src/state/history.ts`, `src/state/view.ts` (the
  preview / arm / page state), `src/undo/`, `src/ui/html.ts` (the day head, `dayStatHTML`, `signoffHTML`,
  `dayIssuedHTML`, `viewDayHTML`, `dayInfoHTML`, `planSelectorHTML`, `verTagHTML`, `nysMarkHTML`),
  `src/ui/board.ts` (`boardSignHTML`, `switchDraft`, `planMenu`), `src/ui/ALPanel.tsx`,
  `src/ui/interactions.ts` (every amendment door), `src/ui/Shell.tsx` (the sign change, the view pickers,
  export), `src/leavewar/sync.ts` (`desiredOilCells`, `runOilPass`, `oilCreditBidAgainst`).
- **The evidence sheet: `raptor-port/docs/handpass/2026-09-24-amendment.md`** — §3 (the findings), §4 (the
  ROLL-CALL), §5 doors, §6 orders, §8 every finding's disposition, §9 what was NOT walked, §12 the re-walk. The
  walkers' own sheets: `raptor-port/docs/handpass/parts/2026-09-24-amendment-w1.md` … `-w4.md`.
- **The rules:** `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` — every rule he
  settled, with the clashes resolved (newest wins, D90). Codex: the rulings files do not load by themselves for
  you — read `.claude/rules/decisions/scheduler.md`, `oil.md`, `how-we-work.md` and `.claude/rules/raptor-executor.md`
  by path.

## The brief itself — the standing order's wording, verbatim

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

Out of scope, by the register: EOD (deferred), the per-person undo of D148 (decided, not built — it belongs to
the change-recording re-test), the published Unavailable freeze `[PUB-UNAVAIL]` (not built), the current-day-only
export (partly built), the quarantine of pre-Phase-2 books (old stored data).

Required of both:

- **Exact, step-by-step fix instructions per finding** — file, function, what to change, the test that should go
  red first. Not a direction.
- **Explicit negatives**: "I checked X and found nothing." A confident all-clear from one reader on an area the
  other found a defect in is the cheapest pointer to a real bug.
- **Compare against `main` before calling anything newly introduced.** "Pre-existing" never erases severity; the
  dangerous category is old code a change has just made reachable.
- Rank findings most severe first; give each a one-line plain-English summary a non-technical owner could read.

## Questions worth your time (not a limit)

- **The one count (AM23):** `dayShownPendCount` now feeds the day head, the ⓘ panel and the plan-switch message.
  Is there any OTHER place a person reads a number of unpublished changes (a toast, a tooltip, the Amendments
  panel, the discard confirm, the sign-off line, History) that still reads the raw marks — and does each agree
  on an OIL-only change, a filing round trip and a reorder-and-back?
- **The marker (AM24):** `nysMarkHTML` is on the week head and the board strip. Any other working-copy surface
  of a published day (the phone board, the view page's Working-draft peek, a plan switched in)? Any place it
  shows where it must not (the issued face, a preview)?
- **Unpublish:** after `commitUnpublish` reconciles, do the marks, the delta, the sign-off line, the Amendments
  panel, the ⓘ panel and the Leave War agree in every order — unpublish then undo, undo the publish itself,
  unpublish an AL that carried a removal / a reorder / a filing / an OIL-only change, unpublish on a day with
  plans?
- **The arms:** every one-shot confirm (Load onto working copy, Withdraw — confirm, the template two-pick) — does
  every navigation clear it (page change, week change, day step on the board, a plan switch, closing the board,
  logout)?
- **Signatures:** every writer that changes what a signature binds (content, the filing state, the OIL decisions,
  the plan, the base version) — does each invalidate, and does an exact revert (including by undo) restore? Is
  there a door that publishes on a signature given for other content?
- **The money:** after every publish / AL / unpublish / undo / redo on a weekend, does the Leave War recompute from
  the day's latest PUBLISHED version at once — never from the working copy, never lagging to a reload — and does
  one day's change ever move another day's OIL?
- **Roles:** can a member (or the admin viewing as a member) reach any sign, publish, unpublish, load, plan or
  discard write through a stale control, a keyboard path or a document-level click route?
