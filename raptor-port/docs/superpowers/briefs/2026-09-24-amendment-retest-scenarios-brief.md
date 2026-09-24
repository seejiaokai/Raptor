# [HUMAN-RETEST] the amendment system — scenario-design brief (24 Sep 26)

Given, identically and blind to each other, to Fable 5.1 and to Astra (Codex), both at high effort. Bug-check
order §4 rank 1: a model that did not build the thing designs the test scenarios, hunting for what is MISSING.
Kept in the repo so the next re-test re-uses it.

---

You are designing the test scenarios for a hands-on re-test of the **amendment system** of this app — how a
day of the flying programme is signed, published, amended, unpublished, and shown to the squadron. You did not
build it. **Read-only: edit nothing, run nothing.** Another agent will execute your scenarios in the real
running app (the production build, driven by a scripted real browser), at phone and desktop width, and
photograph each one. Your job is to decide what that walk must cover — above all, what is MISSING.

## Why this re-test exists

`[HUMAN-RETEST]` in `OUTSTANDING.md`: every earlier bug check of the amendment system was a code review plus
unit tests. On another feature that method passed two frontier-model reviews and ~5,300 tests, and the owner
then found three defects in minutes by opening the app. All three were MISSING lines, not wrong ones: a screen
the feature was never wired to, a gesture that did nothing on part of the screen, and one mark painted over
another. Reading code cannot find a line that is not there. Assume the amendment system carries that class of
defect, unfound.

## What the amendment system is, plainly

A week of the flying programme is built day by day. Each day is signed off by four roles and then PUBLISHED —
its first issue is the "Original". After that, every change to the day goes out as the next numbered
amendment of THAT day only (AL1, AL2 …); the published versions are frozen and kept; the scheduler edits a
working copy on top. Changed items wear coloured marks (dotted while pending, solid once issued, coloured by
AL number). A day can hold alternative saved plans (Plan A / B). An issued version can be looked at read-only
and loaded back onto the working copy. The latest version of a published day can be UNPUBLISHED back to a
working copy to correct it quietly and reissue it under the same label; undo of a publish does the same. The
view-only page shows the squadron the issued version. What a published weekend or holiday EARNS in OIL (off in
lieu — time off banked, never pay) comes from its latest published version and lands on the Leave War tab.

## Where its promise is written — read these

- **The behaviour register — START HERE:** `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`
  — every rule he has settled, one line each, with the clashes already resolved (newest ruling wins, D90) and the
  rules set aside marked so. Test against the LIVE lines. A rule marked NOT BUILT or DEFERRED is not a defect by
  itself; say so if a scenario depends on one.
- The rulings files (Codex: these do not load by themselves for you — read them by path):
  `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/how-we-work.md`
  (D90, D148), and `.claude/rules/raptor-executor.md`.
- `raptor-port/docs/engine-rules.md` §Publishing / amendments, §Version snapshots, §Drafts, §Auth / roles,
  §History, §The edit log; `raptor-port/docs/ui-contracts.md` §Amendment marks on screen, §Version preview, §The
  day-head version chip, §Sign-off pills; `raptor-port/docs/undo-contract.md` §4; `raptor-port/docs/feature-impact.md`.
- The design records: `raptor-port/docs/superpowers/specs/2026-09-11-amendment-model-decisions.md`,
  `…/2026-09-12-amendment-core-build-brief.md`, `…/2026-09-12-amendment-core-build-plan.md`,
  `…/2026-09-15-plans-selector-redteam.md`, `…/plans-selector-followups.md`,
  `…/2026-09-17-arch-stack-3-global-undo-design.md` (the Unpublish model).
- `OUTSTANDING.md` — `[AMEND]`, `[HUMAN-RETEST]` (its note on the 11 Sep "BUG 1": unpublishing an OLDER
  amendment used to leave the day contradictory — only a walk can confirm it is gone), `[EOD]`, `[CRP-FLAG]`,
  `[FLAG-EXPORT]`, `[PUB-UNAVAIL]`, `[GLOBAL-UNDO]`.
- The code. The heart: `raptor-port/src/engine/publish.ts` (publish, amend, unpublish, sign, the marks),
  `engine/drafts.ts` (plans, load a version, the mark rebase), `engine/canonical.ts` (what counts as a change),
  `engine/verid.ts`, `engine/restore.ts`. The command wrappers: `src/state/sched-commit.ts`, `src/state/store.ts`,
  `src/state/history.ts`, `src/state/persist.ts`, `src/undo/`. The screens: `src/ui/html.ts` (the day head:
  `dayStatHTML`, `verTagHTML`, `planSelectorHTML`, `viewVerSelHTML`, `dayIssuedHTML`, `signoffHTML`, `dayInfoHTML`,
  `alAttr` call sites), `src/ui/board.ts` + `board-html.ts` + `SchedBoard.tsx` (the scheduler board and its phone
  form), `src/ui/ALPanel.tsx`, `src/ui/interactions.ts` (every click), `src/ui/EditWeek.tsx`, `src/ui/ViewWeek.tsx`,
  `src/ui/DraftsModal.tsx`, `src/ui/HistoryModal.tsx`, `src/ui/peek.ts`, `src/ui/export.ts`, `src/ui/printpdf.ts`,
  and the Leave War's OIL pass (`src/leavewar/sync.ts` `runOilPass`).
- What is already tested, so you can see what is NOT: `raptor-port/src/engine/publish.test.ts`, `drafts.test.ts`,
  `canonical.test.ts`, `src/state/unpublish-commit.test.ts`, `publish-commit.test.ts`, `src/ui/planselector.test.tsx`,
  `pubsweep.test.tsx`, `draftsui.test.tsx`, and the e2e suite under `raptor-port/e2e/`.

## The brief (bug-check order §4, verbatim)

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

## What is NOT a finding (owner, D56, verbatim)

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

So: the read-only "locked week" handling of books saved by a PRE-Phase-2 build (the quarantine), and old
saved-data formats, are out of scope — nothing written from now on reaches them. Also out of scope: EOD
(deferred, not built); code style; speed, unless a person would feel it.

## What to hand back

1. **The roll-call.** Name each THING the amendment system attaches to — a published day, an issued version
   (Original / ALn), the working copy, a pending change, an issued change mark, a removal / reorder / input
   filing, a sign-off (each of the four), a saved plan, an unpublished (retired) version, the "N pending" count,
   the version tag, the "Not yet signed" marker, the day's OIL — and list EVERY place the app draws it: the edit
   week's day head and cells, the scheduler board (desktop and phone), the view-only week (issued face and the
   working-draft peek), the Amendments panel, the ⓘ day panel, History / the changes list and its hover bubble,
   the next-week peek, a preview of an issued version or a plan, the plans menu, the export (CSV / print), the
   Leave War's OIL cells, the warnings list, and any other place you find. For each place, three columns: does
   it SHOW the thing, can the person ACT on it there, and what else is PAINTED on the same pixels. No blank cells.
2. **The door list.** Every action the stored data allows, and the on-screen control that performs it — in
   every state: admin and member (and the admin's "View as member" flip); phone and desktop; a draft day, a
   published day with nothing pending, a published day with changes, while previewing an issued version or a
   plan, a day with plans, after an unpublish, after an undo; a published weekend with OIL bid against on the
   Leave War. Name any action the data allows that no screen offers, and any control that is drawn but does
   nothing.
3. **Ranked failure scenarios** — at least 30, the top 15 in full: setup (through the app's own controls
   wherever possible), action, expected result, and the observation that would DISPROVE correctness. Include
   ORDERS: pairs of the system's own actions in both orders (sign then edit, edit then sign; publish AL then
   unpublish, unpublish then undo; switch plan then load a version, load a version then switch plan; accept an
   input then publish, publish then accept …), every action with an opposite walked the other way AFTER
   publishing, and the lifecycle boundaries — reload, change week and come back, log out and back in (including
   as the other role), the admin's view-as-member flip, phone ↔ desktop. Walk the money: after each publish,
   unpublish and undo on a weekend, what does the Leave War say?
4. **Explicit negatives** — "I checked X and found nothing", for each area you looked at and cleared.
5. For every scenario you believe is a real defect: say whether you CONFIRMED it by reading the code (name the
   file and line) or are PREDICTING it, and give the exact, step-by-step fix you would expect — not a direction.

Write plainly. Another model executes this list in the running app, and the owner reads its summary.
</content>
</invoke>
