# Brief — the final code read of `[DB-READINESS]` group A, phases 0–5b (Fable 5.1 and Astra, blind to each other), 30 Sep 26

You are reading the FINISHED code of a build you did not write (Opus 5.5 wrote it today, in seven phases), AFTER it was
walked. The owner's standing order (D353, D11): work that touches **saved data, the published record and permissions**
gets BOTH providers' reads, independently. Do not read the other provider's report; it does not exist yet for you.
**Read-only: edit nothing but your report; run nothing that writes; do not start the app** (reading tests is fine).

## What was built

Branch `claude/db-readiness-table-shaping-4094f6`, repo `C:/Users/User/projects/Raptor`, app in `raptor-port/`. The
diff against `main`: `git diff origin/main...HEAD -- raptor-port/src` (≈140 files; the walk scripts and documents changed
too). Every record the app saves became one row of one table of the database design — the schedule one day per row
(plus a week row, one row per issued version and per withdrawal), requests, people and the planning calendar one row
each, the Leave War one row per record, the change history one row per line, accounts / access requests / "seen" one row
each, the Tracker's lists one row per thing — **written ONLY from the change a command made** (a stream consumer at the
command's commit, inside its one saved group), with **one change-log batch per saved group** (`changes/<id>`,
`{ type, seqs, actorId, at, items: [{ table, key, op }] }`); a browser holding the old bundles is **converted once at
boot** (the fold, all eight converters); **no demo data seeds a shared store** (a boot policy, frozen seeds, a first
admin from configuration, an empty Leave War and an empty Tracker). Nothing on screen was meant to change except those
two empty pages and the Leave War's "Edit person" (removed — D460, D461).

- **The plan of record — read it WHOLE:** `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`.
  §2 the decisions (§2.5 the matrix), §3 the phases, §8 the round-3 binding checklist, **§9 the build log — every
  "technical departure" and "not changed" line, said plainly; each is a place to look**.
- **The evidence sheet of the walk (the roll-call, the steps, what it found and each disposition):**
  `raptor-port/docs/handpass/2026-09-30-dbrA-group-walk.md`, with the per-phase sheets `…-dbr-phase0.md`,
  `…-dbr-phase5b.md`. The walk's shared driver `raptor-port/scripts/handpass/dbrA-lib.mjs` shows exactly what each step
  checked (every changed row named by its batch; a reload gives the app's state back; a reload writes nothing).
- **The design the rows follow:** `raptor-port/docs/data-model.md` §2, §3, §5–§9, §11 (permissions), §12;
  `raptor-port/docs/data-schema.md`; `raptor-port/docs/undo-contract.md` §0.
- **The rulings** (read the full rows — `grep -h '^| D462 |' .claude/decisions-full/*.md` in a shell): the area files
  `.claude/rules/decisions/how-we-work.md` (D453, D354, D56, D54, D148, D350, D353), `scheduler.md` (D44, D45, D98, D101,
  D103, D176, D363; the "Weeks remember their edits" and "Pristine weeks are NOT stashed" notes), `leave-war.md` (D460,
  D461; §Architecture's last paragraph), `oil.md` (D401, D402, D400), `tracker.md` (D462, D463, D464, D120, D121, D376),
  `people-accounts.md` (D166, D204, D216, D227, D287, D290, D306, D310, D322, D323), and `.claude/rules/raptor-executor.md`.
  Codex: nothing under `.claude/rules/` loads by itself for you — open them.

**The files that carry it** (starting points): `src/storage/{whiteboard,postman,boot,browser,schema,fold,client,tables,
adapters}.ts`; `src/command/{commit,registry,types,ord}.ts`; `src/state/{persist,weekrows,rowmap,sched-commit,store,
changebatch,settingsrows,accounts,changes,people-settings-commit,person-delete,roster-restore,seeds,plan,undo-wire,
perms}.ts`; `src/engine/{editlog,publish,drafts,inputs,schema}.ts`; `src/undo/{derive,describe,timeline}.ts`;
`src/leavewar/state/{store,rows,demoworld}.ts`, `src/leavewar/sync.ts`, `src/leavewar/LeaveWarPage.tsx`;
`src/tracker/app/{core,rows}.js`, `src/tracker/fold.ts`, `src/tracker/{App.jsx,TrackerPage.tsx}`; `src/boot.ts`,
`src/bootpolicy.ts`, `src/main.tsx`.

## What to do — the finder wording (bug-check order §4, verbatim)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

The user promise: **every change still survives a reload exactly as before; nothing is lost, doubled, re-ordered or
brought back; two people changing DIFFERENT things never overwrite each other (the reason for the whole change); every
saved group carries exactly one batch naming every row it touched; a browser's old records are converted once, losing
nothing — his Tracker charts, syllabi and ball details above all (D464); a shared store is never seeded.** Check the
sheet's roll-call for gaps: a writer that saves outside a command (a bare group, no batch), a command whose change maps
to no row (lost on reload), a row written from something other than the command's own change (a stale whole-list write
that could overwrite another person's row), a delete inferred rather than made, an order that is not `(ord, id)`, a
converter that drops or mis-keys a field, a boot path that seeds or rewrites a started store, an undo whose restore maps
to rows differently from the forward change, a permission row (§11, `perms.ts`) that does not match the new tables.

## What is NOT a finding (owner, D56 — read before you spend anything)

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

Two limits on it here: the one-time conversion must never break a load (D401), and it must carry his Tracker charts,
syllabi and ball details across whole (D464) — those are real findings. Also not findings: phases 6 and 7 of the plan
(not built), group B (the day lock, the adapter to IT's tables, replacing the postman's merge), a decided call in the
plan's §2 or §9, a difference from `main` the plan asked for, and anything the evidence sheet already lists with a
disposition (confirm or dispute its disposition instead).

## What to hand back

Write your report to `raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-group-a-final-read-<fable|astra>.md`
(for Astra the run captures your final message there). For each finding: severity; what; where (file and line); the
concrete scenario (setup, action, what shows, what should); whether `main` does the same (compare before calling it
new); and **exact, step-by-step fix instructions** — the function, the change, the edge cases, the invariant it must
not break, and a test that would pin it — not a direction. Then **explicit negatives**: what you checked and found
sound. Rank the findings most severe first.
