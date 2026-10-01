# Scenario brief — `[DB-READINESS]` group A (phases 0–5b), the group-wide FULL walk: design what the walk must cover, 30 Sep 26

You are an independent designer of TEST SCENARIOS for code you did not write (Opus 5.5 wrote it today, in seven phases).
**Read-only: do not edit any file except your report, do not run git commands that change anything, and do NOT run
tests, builds or the app.** Reading and searching only. The repository is `C:\Users\User\projects\Raptor`, app in
`raptor-port/`, branch `claude/db-readiness-table-shaping-4094f6` (cut from `main` at `cddb2523`). The whole change:
`git diff origin/main...HEAD -- raptor-port/src` (139 files). One model only designs these scenarios (the owner's D353);
after the walk, two models will read the finished code separately — that is not your job here.

## Your job

Ask **what is MISSING**, not whether the code is right. The builder will walk the RUNNING production build with a scripted
real browser (Playwright, desktop 1440×900 and phone 390×844), reloading and reading the browser's storage after each step,
and your list is what that walk must cover. The builder's own tests and the per-phase walks share the builder's blind spots;
yours should not.

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## What was built — the user promise

**Nothing on screen changes** (except two new empty pages, below). What changed is HOW every record is SAVED, so the IT
team's database tables can be one row per thing: before, the app saved a handful of big bundles (every request in one
record, every person in one, a whole week in one, every Leave War bid in one, the 2,000-line change history in one, every
account in one); now each thing is its own saved row, written ONLY from the change a command made, with one change-log
record (`changes/<id>`) per saved action naming every row it touched. The promise to the owner: **every change he makes
still survives a reload exactly as before; nothing is lost, doubled, re-ordered or brought back; two people changing
DIFFERENT things never overwrite each other; and a browser holding the old bundles is converted once, losing nothing.**

- **The plan of record — read it WHOLE:** `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`.
  §2.5 is the matrix (stored key → table → the command that writes it); §3 the phases; §6 the walk list the plan
  already names (your list should ADD to it and rank it, not repeat it); **§9 the build log — each phase's departures
  from the plan, said plainly, and what was found on the way. Read §9 closely: every "one technical departure" and every
  "not changed" line there is a place a missing call site could hide.**
- **The per-phase evidence already gathered:** `raptor-port/docs/handpass/2026-09-30-dbr-phase0.md`,
  `…-dbr-phase5b.md`, and the phase-5 look in the plan's §9 (5.5). Do not re-design what those walks proved; say where
  they are thin.
- **The design the rows follow:** `raptor-port/docs/data-model.md` §2, §3, §5–§9, §11, §12; what is stored:
  `raptor-port/docs/data-schema.md`; the command layer: `raptor-port/docs/undo-contract.md` §0.
- **The files that carry it** (starting points, not a complete list): the storage path `src/storage/{whiteboard,postman,
  boot,schema,fold,client,tables,adapters}.ts`; the command layer's write gate `src/command/commit.ts` and `registry.ts`;
  the scheduler's rows `src/state/{persist,weekrows,rowmap,sched-commit,store,changebatch,settingsrows,accounts,changes,
  people-settings-commit,person-delete,roster-restore,seeds}.ts`, `src/command/ord.ts`, `src/engine/{editlog,publish,
  drafts,inputs}.ts`; the Leave War's rows `src/leavewar/state/{store,rows,demoworld}.ts`, `src/leavewar/sync.ts`; the
  Tracker's rows `src/tracker/app/{core,rows}.js`, `src/tracker/fold.ts`; the boot `src/boot.ts`, `src/bootpolicy.ts`,
  `src/main.tsx`; the new empty pages `src/leavewar/LeaveWarPage.tsx` (NoWar) and `src/tracker/App.jsx` (No course yet).

## What the walk can and cannot do (so your scenarios are walkable)

- It runs the production bundle (`vite preview`) on the **Browser backend** (localStorage), signs in `ad` / `a` (admin,
  Saber) or `us` / `us` (member, Ranger), and can read and edit the browser's storage between steps (`page.evaluate`) —
  so "exactly these stored keys changed" is observable, as is a hand-damaged row.
- **Two people** = two tabs (or two browser contexts over the same storage file). Say what you expect when the second tab
  has NOT reloaded — does the app ever re-read storage while open? If not, say which scenarios a two-tab walk can prove
  and which only a unit model of two clients can (the unit suites have several module copies over one store).
- It can build three variants: this branch with the demo (the default), this branch as a **shared store** (no demo, a
  first admin from configuration — `VITE_SEED_DEMO=false VITE_BOOTSTRAP_ADMIN=…`), and **`main`'s app** served on the
  same address first, so a browser holding the OLD bundles is then opened by this build (the one-time conversion).
- The demo world: the week of Mon 13 – Sun 19 Jul 26 (a weekend published or publishable), a second week from Mon 20 Jul;
  the calendar date is 30 Sep 26. A walk builds its state through the app's own controls (Edit Schedule, the scheduler
  board, the Inputs page and its month calendar, Quals, Admin → Users / Data / Squadron config, the Logic page, the Leave
  War grid and its sheets, the OIL tracker, the Tracker).

## The rulings (a later one wins — D90)

Read the area files and open a ruling's full row before relying on its detail (`grep -h '^| D462 |'
.claude/decisions-full/*.md` in a shell): `.claude/rules/decisions/how-we-work.md` (**D453** the order to the database,
**D354**, **D56**, **D54**, **D148** own-changes undo, **D350** what the one undo does not take back), `scheduler.md`
(**D44, D45, D103, D98, D101, D176, D174, D363**, the "Weeks remember their edits" and "Pristine weeks are deliberately
NOT stashed" settled notes), `leave-war.md` (**D460, D461** no Edit person on the war — Quals is the one place; its
§Architecture last paragraph), `oil.md` (**D401** the fold must not break a load but need not preserve quirks of old demo
records; **D402, D400**), `tracker.md` (**D462, D463, D464** — his charts, syllabi and ball details are HIS work and must
survive the conversion; **D120, D121, D126, D128, D376**), `people-accounts.md` (**D166, D204, D216, D227, D287, D290,
D299, D306, D310, D322, D323**). Codex: nothing under `.claude/rules/` loads by itself for you — open them.

## Weigh especially

1. **The roll-call of writers.** Every place the app saves something — each writer of each record in the matrix, and
   every writer NOT in it (the Leave War's settings-like keys, the templates and rules on Admin, `qualcols`, the medical
   documents drawer, the Tracker's first-mount bookkeeping, the "seen" marks, the session / role keys, a sign-out). For
   each: does it now reach storage only inside a command, as its own row? Or must it not, because…? Or is it MISSING
   (a write that now goes nowhere and is lost on reload, or one that still goes out as a bare group with no change-log
   record)? `src/state/changebatch-rollcall.test.ts` is the builder's own list — prove it complete or add to it.
2. **Every kind of change × reload.** An input filed, edited, re-dated, deleted, split by the clash rules, taken off a
   day; a person added, renamed, archived, restored, deleted, posted out (each outcome), a Quals tick, SXO; a puck and a
   day title on the planning calendar; a schedule slot, a text box, a wave/row add, move and delete, a drag across two
   days; publish, amend, sign-offs, Unpublish, reissue, Discard, a saved plan made / switched / brought out, a day
   template; the Leave War's create period / stage moves / bid / decide / move / delete / award / counters / groups /
   Show SANS / Reset order / a posting's window; an OIL decision; the change history's lines and "mark seen"; accounts,
   access requests, the bell; the Tracker's every writer. After each, a reload must show exactly what was there.
3. **Orders.** Each action then Undo, Redo, reload; an edit, Undo back to pristine, reload (must be pristine, and must
   the week's rows then be gone?); three quick edits then an immediate reload (the 300 ms merge and the pagehide flush);
   a change on one week, switch week, change there, switch back, reload; the same on a published day.
4. **Order of lists** — the Inputs page, Quals, the pickers, a Leave War cell with two records, the Tracker's course and
   student lists — before and after a reload, after an insert in the middle, after a delete, after a drag reorder.
5. **The conversion (the fold)** — a browser `main` wrote, holding EVERY kind of old bundle (weeks with issued and
   withdrawn versions, saved plans, a taken-off input; the Leave War with bids, decisions, awards, a posting; the change
   history; accounts and a waiting request; the Tracker per D464): what must be identical after, what the walk must
   compare, and what happens if the conversion meets a bundle it cannot read.
6. **The shared-store build** — the first admin, every page, the empty Leave War and empty Tracker and their ways in,
   and what storage may and may not contain afterwards; a demo sign-in must not work there.
7. **Damage** — a hand-damaged row of each kind (a day row, an input row, a war record, a history line, an account row, a
   Tracker enrolment row): what must still load, what must be read-only, and which other rows' bytes must stay untouched
   after an edit elsewhere.
8. **Roles** — admin, member, the admin's member view, a guest, someone waiting for access: every save they may make
   lands in its own row, and nothing they may not make is saved.

**What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will be
CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the code
is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app
would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. **Two limits on it
here:** the one-time conversion must still never break a load (D401), and it must carry the owner's Tracker charts,
syllabi and ball details across whole (D464) — those two are real findings. Also out of scope: phase 6 and 7 of the plan
(not built), group B (the lock, the adapter), and a difference from `main` the plan asked for.

## How to report

Write your report to `raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-group-a-walk-scenarios-astra.md`
(the run also captures your final message there).

1. **A roll-call**: every writer of every saved record (and every reader that must see it after a reload), each with
   *writes its own row inside a command* / *must not, because…* / *MISSING*, naming the file and function. No blank cells.
2. **A numbered list of walk scenarios**, ranked by how likely each is to find a defect, each with: **start state**, **the
   gestures in order** (in the app's words), **what the screen must show after the reload**, **what storage must hold**
   (which keys change, which must not), and **what would prove it wrong**. A few lines each. Mark which need two tabs,
   which need `main`'s build first, which need the shared-store build.
3. **Where you are sure a line is missing already** (from reading), the file and function, and **exact, step-by-step fix
   instructions** — not a direction.
4. **Explicit negatives**: what you checked and found nothing in.
5. **Questions only the owner can answer** (a product choice the code cannot settle), each with your recommendation.
