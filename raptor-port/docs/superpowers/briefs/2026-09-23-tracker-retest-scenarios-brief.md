# [HUMAN-RETEST] the Tracker — scenario-design brief (23 Sep 26)

Given, identically and blind to each other, to Fable 5.1 and to Astra (Codex). Bug-check order §4
rank 1: a model that did not build the thing designs the test scenarios, hunting for what is
MISSING. Kept in the repo so the next re-test re-uses it.

---

You are designing the test scenarios for a hands-on re-test of the **Tracker** tab of this app. You
did not build it. **Read-only: edit nothing, run nothing.** Another agent will execute your
scenarios in the real running app, at phone and desktop width, and photograph each one. Your job is
to decide what that walk must cover — above all, what is MISSING.

## Why this re-test exists

`[HUMAN-RETEST]` in `OUTSTANDING.md`: every earlier bug check of the Tracker was a code review plus
unit tests (and a vendored browser smoke suite). On another feature that method passed two
frontier-model reviews and ~5,300 tests, and the owner then found three defects in minutes by
opening the app. All three were MISSING lines, not wrong ones: a screen the feature was never wired
to, a gesture that did nothing on part of the screen, and one mark painted over another. Reading
code cannot find a line that is not there. Assume the Tracker carries that class of defect, unfound.

## What the Tracker is, plainly

An OCU progress tracker, brought into this app as its third tab on 7 Sep 26: syllabus flow charts
(each ball an event, each line a prerequisite), each student's mark on each ball, failures and
their dates, pace and currency figures, courses, students linked to the squadron roster, an arrange
(edit) mode for the charts, and a File menu (Import / Export, the admin's only). It has its own
store, its own storage doorway, and its own undo, and it crosses into the rest of the app at a few
named seams (the login and role, the squadron roster, the page it sits on).

## Where its promise is written — read these

- `raptor-port/CLAUDE.md` — the paragraph "The Tracker tab is a THIRD app with a THIRD store"
  (§Architecture rules) and the Tracker row of §Where things live.
- `raptor-port/docs/tracker/known-gaps.md` — the owner's rulings carried over, the open gaps, the
  traps.
- `raptor-port/docs/tracker/specs/*.md` — the design documents it was built from.
- `DECISIONS.md` (repo root) — D62, D63, D64.
- `raptor-port/docs/data-schema.md` §World 3; `raptor-port/docs/undo-contract.md` (the Tracker's
  share of the one command layer and of undo).
- `OUTSTANDING.md` and `OUTSTANDING-ARCHIVE.md` — search for `TRK` and `Tracker`.
- The code: `raptor-port/src/tracker/` (the heart is `app/core.js`), `TrackerPage.tsx`,
  `peoplewire.ts`, `people.js`, `role.js`, `storage.js`, and its seams with the rest of the app
  (`raptor-port/src/state/store.ts` — `resetSession`, `toggleRole`; the page switching; the
  login/logout shell).
- What is already tested, so you can see what is NOT: `raptor-port/src/tracker/**/*.test.*` and the
  browser suite `raptor-port/scripts/tracker/smoke.mjs`.

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

**And the Tracker's own route to the database (owner, D120, 23 Sep 26 — sent to both reviewers
while they were already running, so their reports may still carry what it drops; the host
dispositions those).** Before the database step he EXPORTS his hand-drawn charts (the balls, their
positions and lines, and every event detail), WIPES the app, then IMPORTS that file. So these are
not findings either: the start-up converters that upgrade OLDER stored data (`migrateCourseIds`,
`migrateSylIds`, `migrateIds`, the legacy `ocu:` import), and reading OLDER file formats (v1/v2, a
legacy string roster with `links`) — he imports the file he has just exported. **Rank HIGH instead:**
a CURRENT-format export → wipe → import that loses or changes a ball, a line, a position, a font, a
chart name or order, a hidden chart, a prerequisite or any event detail. That round trip is the one
path his hand-drawn work survives by. Everything the Tracker does to NEW data after the wipe is
still in scope.

Also out of scope: the wording of the syllabus data under `src/tracker/data/` (D62); code style;
speed, unless a person would feel it.

## What to hand back

1. **The roll-call.** Name each THING the Tracker attaches data to — a student, a mark (each grade),
   a failure and its date, a done-date, an event (ball), a prerequisite line, a chart (syllabus), a
   course, a pace or target, a lull, the last-flown / currency / down-day / upchit figures, anything
   else you find — and list EVERY place the app draws it: the flow chart, Show All, each side-panel
   card, the details bubble, the info view, every pop-up, search, the phone's tabs, the export file,
   and any other place you find. For each place, three columns: does it SHOW the thing, can the
   person ACT on it there, and what else is PAINTED on the same pixels. No blank cells.
2. **The door list.** Every action the stored data allows, and the on-screen control that performs
   it — in every state: admin and member; phone and desktop; arrange mode on and off; a hidden
   chart; a course with no students; a student with no marks; a roster held after a failed
   conversion; before and after a login change or the admin's view-as-member flip; with and without
   the squadron roster handed over. Name any action the data allows that no screen offers, and any
   control that is drawn but does nothing.
3. **Ranked failure scenarios** — at least 30, the top 15 in full: setup (through the app's own
   controls wherever possible), action, expected result, and the observation that would DISPROVE
   correctness. Include ORDERS: pairs of the Tracker's own actions in both orders (mark then rename,
   rename then mark; delete a chart then undo; import then undo; switch course mid-edit; …), and the
   host's lifecycle boundaries — reload, leave the tab and come back, log out and back in, the
   admin's view-as-member flip, a phone ↔ desktop resize, the squadron roster changing while the
   Tracker is open.
4. **Explicit negatives** — "I checked X and found nothing", for each area you looked at and
   cleared.
5. For every scenario you believe is a real defect: say whether you CONFIRMED it by reading the code
   (name the file and line) or are PREDICTING it, and give the exact, step-by-step fix you would
   expect — not a direction.

Write plainly. Another model executes this list in the running app, and the owner reads its summary.
