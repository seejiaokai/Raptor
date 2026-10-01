# Scenario brief — `[DB-READINESS]` group A phase 6 step (c) v3 (built): design what the FULL walk must cover, 1 Oct 26

You are an independent designer of TEST SCENARIOS for code you did not write (Opus 5.5 wrote it today). **Read-only: do
not edit any file except your report, do not run git commands that change anything, and do NOT run tests, builds or the
app.** Reading and searching only. The repository is `C:\Users\User\projects\Raptor`, app in `raptor-port/`, branch
`claude/db-readiness-p6c-holder-base`. **Step (c)'s code change alone:** `git diff 9191910b..HEAD -- raptor-port/src` (the
parent branch head `9191910b` has phase 6 (a), (b), (d) built and FULL-checked). One model only designs these scenarios
(the owner's D353); after the walk, two models will read the finished code separately — that is not your job here.

## Your job

Ask **what is MISSING**, not whether the code is right. The builder will walk the RUNNING production build with a scripted
real browser (Playwright, desktop 1440×900 and phone 390×844), reloading and reading the browser's storage after each step,
on THIS build and on the build before (c) (`9191910b`) side by side, and your list is what that walk must cover. The
builder's own tests share the builder's blind spots; yours should not.

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## What was built — the user promise

In the database a day may be written only by the scheduler holding it (the day lock, D450). A member's filing, any edit of a
request (dates, times, words, type, person — the hand-over), a delete, and their Undo / Redo now write the REQUEST alone;
what they do to a day — the request's row on the Ground Programme made, re-made or taken away — is WORKED OUT ON READ, and
the person who acted, a reload and another device must all see the same day. The plan: `raptor-port/docs/superpowers/plans/
2026-09-30-db-readiness-phase6-plan.md` §3 (c) v3 (read it whole, with §8 items 5–13 — the changes he will see — and §9's
build log); the three rounds' dispositions `…/briefs/2026-09-30-db-readiness-phase6-dispositions-r2.md` and
`…/2026-10-01-db-readiness-phase6c-dispositions-r3.md`. In short:
- **The view** (`engine/overlay.ts viewOfWeek`): each ground row with `src` reconciled against its request (gone / retyped /
  not covering / filed under Unavailable → the row goes unless `kept`; changed since the row was made → re-made in place,
  `srcv` the fingerprint; D271); a deleted man stripped; a request with no standing row anywhere lands on its START day — on
  a published day unless the current issued day placed it there or took it off. Doors: the week on screen, a saved week
  (`weekstash.ts stashDays`), a week never saved (`weekctx.ts bundle`, `ui/peek.ts`), the load's count (`drafts.ts
  dayAsLoadLeaves`).
- **The holder base** (`state/holderbase.ts`): the week on screen is always worked out from each day as its holder last
  committed it; the base moves only for days a command's rows name (or changed outside a command), then becomes the view
  (what the row writer stores); the week's copy written when leaving a week is the base. Run after every scheduler-store
  command (`state/sched-commit.ts afterCommandPass`, phase 8) and at every load / boot (`store.ts workOutLoadedWeek`).
- **One standing-row predicate** (`overlay.ts standsOn`) for every lookup that acts on "the request's row" — never a dead
  `kept` row (a version's row brought back although its request is gone or cannot stand on the day, D363).
- **Removed:** the edit's relink, the delete's row drop, both "Load the week of … to edit / delete this accepted input"
  refusals, the auto-landing at filing, the old boot / load landing passes and the `sched.load` command. **§11:** a member's
  command may carry no schedule record at all.

## What the walk can and cannot do (so your scenarios are walkable)

- Production bundle (`vite preview`) on the **Browser backend** (localStorage `raptor:<collection>/<id>`; a week one row per
  day plus its book); sign in `ad` / `a` (admin, Saber — person `stiff`) or `us` / `us` (member, Ranger — `bane`); storage
  read before and after each step. The localhost probe bridge exposes `window.DAYS`, `window.INPUTS`, `window.SCHED`,
  `window.PEOPLE`.
- **Two people** = two tabs over one storage; the app does not re-read storage while open, so a RELOAD is the second
  client. Say which scenarios a reload proves and which only a unit model can.
- The demo world: weeks Mon 13 – Sun 19 Jul 26 and Mon 20 – Sun 26 Jul 26, requests of every kind; state is built through
  the app's own controls (Inputs page, the board's Ground "+ Inputs", a request's card — Accept / ✕ / → Unavail, Edit
  Schedule, publish and sign, Load onto working copy, saved plans, the OIL Earn mode, the global Undo / Redo in the top bar,
  the week picker, the next-week peek). The clock can be fixed.

## The rulings (a later one wins — D90)

Nothing under `.claude/rules/` loads by itself for you — open them; a ruling's full row: `grep -h '^| D363 |'
.claude/decisions-full/*.md` in a shell.
- `how-we-work.md` — **D467**, **D465/D466**, **D353**, **D148** (undo is your own changes), **D350**, **D56**, **D54**.
- `scheduler.md` — **D450**; **D44, D45, D103**; **D177, D178, D179**; **D174, D176, D114**; **D98**; **D363, D175**; **D170,
  D172** (the OG tag); **D91**; **D271**; **D338**; the 16 Sep 26 live-filing rule (`raptor-port/docs/engine-rules.md`).
- `oil.md` — **D25, D2, D18, D142, D400**.
- `people-accounts.md` — **D297, D299, D149** (a member edits his own), **D166**.
- `.claude/rules/raptor-executor.md`.

## Weigh especially

1. **The roll-call of "the request's row"** — every place the app DRAWS it (the week, View-only Sched working copy and issued
   face, the scheduler board, the phone board, the next-week peek, the day's ⓘ panel, the pending list / changes window,
   the Amendments panel, the history gold dots, print / export), every place that ACTS on it (Accept, ✕ on the card, ✕ on
   the row itself, → Unavail, the board's "+ Inputs", in-place time and remarks cells on the row AND on the request's card,
   a drag of a man onto the row as an extra, cancelling / info-only / red flag on the row, the OIL Earn mode's switch on it,
   a version load, a plan switch, a day template, a sort, a row drag), and every place that READS it (the validator — loaded
   and cross-week, the OIL evidence and the Leave War's OIL pass, the ALL AVAIL crowd, the crew picker's busy check, the
   pending count / sign-off binding, the load's "Discard N edits", the card's "On Sun 19 Jul" words). For each: goes through
   the view / `standsOn` — or MISSING, naming the file and function.
2. **Right after vs after a reload** — every act: file, edit (each field), hand-over, retype to a leave and back, re-date
   within the week / to another week / back, delete, and each one's Undo and Redo — on a day not published and a published
   one, the row's id, place, times, extras, marks and the day's counts compared before and after a reload.
3. **The holder base's orders** — a request change, then a holder's edit of the same day, then the request's Undo; a holder's
   save while a derived removal shows; a week left and returned between the acts; a version loaded in between; two days a
   request covers; the kept row's lifecycle (D363 → the request back → edited → deleted again).
4. **Published days** — the 16 Sep 26 rule after a reload; D114 one item; D174 / D176 zero; D98 back to as-issued; D177 / D178
   the issued face frozen; the four sign-offs; a load of an OLDER version while a newer is current; an Unpublish then the
   request edited.
5. **Money (OIL — earned leave, D25)** — a weekend request's OIL answer and its row: filed, handed over, cancelled on its row,
   moved to another weekend day, its row kept dead by a version load; the OIL Earn mode's switches; what the Leave War
   credits after publishing.
6. **Roles** — a member's every act writes only his request (no day row, no schedule record — §11); a scheduler's placements
   (Accept, ✕, → Unavail, + Inputs) are saved with the day; a guest writes nothing.
7. **The messages** — "<type> does not go on the Ground Programme — its row has been removed"; D271's "… kept once, as its
   holder"; that "Moved outside the programmed week" is no longer said; that nothing false is said at a load.

**What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will be
CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the code
is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app
would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. Also out of scope:
group B (the lock's screens, the 30-second check), phase 7, and a difference the plan's §8 lists as intended.

## How to report

Your final message is the report (the run saves it to
`raptor-port/docs/superpowers/briefs/2026-10-01-db-readiness-phase6c-check-scenarios-astra.md`).

1. **A roll-call** of the request's row — drawn / acted on / read — each place with *goes through the view or standsOn* /
   *must not, because…* / *MISSING*, naming the file and function. No blank cells.
2. **A numbered list of walk scenarios**, ranked by how likely each is to find a defect, each with: **start state**, **the
   gestures in order** (in the app's words), **what the screen must show right after AND after the reload**, **what storage
   must hold** (which rows change, which must not — above all, no day row for a member's act), and **what would prove it
   wrong**. A few lines each. Mark which need two tabs.
3. **Where you are sure a line is missing already** (from reading), the file and function, and **exact, step-by-step fix
   instructions** — not a direction.
4. **Explicit negatives**: what you checked and found nothing in.
5. **Questions only the owner can answer**, each with your recommendation.
