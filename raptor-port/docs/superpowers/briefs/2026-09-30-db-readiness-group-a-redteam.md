# Red-team brief — [DB-READINESS] group A plan (round 1, 30 Sep 26)

You are an independent reviewer of a PLAN (not code). The planner is Opus 5.5; you are not. Read the live files below
yourself — do not rely on this brief's summary of them. Work read-only.

**Repo:** `C:\Users\User\projects\Raptor\.claude\worktrees\tracker-palette-prompt-a0c90f` (branch
`claude/db-readiness-table-shaping-4094f6`). App code is under `raptor-port/src/`.

## Read first
- The plan: `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`
- The design it builds toward: `raptor-port/docs/data-model.md` §2, §3 (ScheduleWeek, ScheduleDay at stage 1, PlanningPuck
  / DayRemark, Input, Amendment, Sign-offs, the Leave War tables), §5, §6, §7, §8, §9 (all of it — the day lock, rule 9,
  the change log), §12 q8–q10.
- The owner's rulings that govern this (each area file is one line per ruling; the full rows are in
  `.claude/decisions-full/<same name>` — `grep -h '^| D453 |' .claude/decisions-full/*.md`): `.claude/rules/decisions/how-we-work.md`
  (D453 the order, D354, D353, D56, D54, D22, D68, D144), `scheduler.md` (D355, D356, D450–D454, D148 is in how-we-work),
  `leave-war.md` (its §Architecture), `oil.md` (D401), `people-accounts.md` (D165), `tracker.md` (D120, §Architecture).
  Also `.claude/rules/raptor-executor.md` and `raptor-port/docs/undo-contract.md` §1–§3.
- The backlog item: `OUTSTANDING.md` `[DB-READINESS]` (its SPLIT line) and `[IT-QUESTIONS]`.
- Code the plan rests on: `raptor-port/src/storage/{backend,whiteboard,postman,boot,reset,adapters,dbreadiness.test}.ts`,
  `src/state/persist.ts`, `src/state/sched-commit.ts` (`decompose`, `schedWriteRecords`), `src/state/store.ts`
  (`weekStashSnap`, `initStore`, `applyWeekModel`, `loadWeek`), `src/state/history.ts` (`schedFields`),
  `src/engine/weekstash.ts`, `src/command/{commit,registry,types}.ts`, `src/undo/{derive,timeline}.ts`,
  `src/leavewar/state/store.ts` (`rawPersist`, `initStore`, `lwDecompose`, `persistNotify`),
  `src/leavewar/state/demoworld.ts`, `src/main.tsx`, `src/state/accounts.ts`, `src/tracker/app/core.js` (its seeding).

## What to look for
1. **What is MISSING** — a record, writer, reader, order, or table the plan does not cover; a place the app saves that is
   not in the plan's list; a consequence of per-row storage the plan has not seen (ordering, deletes, the journal, undo,
   the Leave War sync, the Tracker, the documents drawer, settings).
2. **Wrong technical decisions** in §2 — especially: splitting at the record level vs a backend fan-out (§2.1); the
   "known keys" delete rule (§2.2); the `ord` order field (§2.3); folding old blobs vs the schema-reset wipe (§2.4); the
   stored key scheme (§2.5); per-day command records and what that does to undo (§2.6); the postman queue replacing the
   merge (phase 4.2) and the journal-superset property; `seedsDemo` tied to the backend kind (phase 5).
3. **Does each stored record map to exactly one row of one table in `data-model.md`?** Name any that do not, and any
   table the design has at stage 1 that the plan leaves with no records.
4. **Sequencing** — is phase 6 (worked out on read) rightly held until IT answers §12 q9? Is anything in phases 1–5
   going to have to be redone by phase 6? Should anything move between phases, or out of group A to group B?
5. **Risk and test gaps** — which test would a defect slip past? What must the walk do that the plan's walk list lacks?

## Rules for findings
- **Not a finding (owner, D56):** a problem that lives ONLY in data already stored, when the code is correct going
  forward — the demo data is wiped before the database. The fold of old blobs must not break a load (D401); it need not
  preserve quirks of old demo records.
- Product choices are the owner's; do not decide them — flag them as questions.
- **Give each finding:** an id (e.g. F1 / A1), severity (BLOCKER / HIGH / MEDIUM / LOW), the plan section, what is wrong
  or missing with file:line evidence, and an EXACT fix — what the plan should say instead, step by step (the owner's
  standing rule: a reviewer gives detailed fix specs, not a direction).
- End with a verdict: APPROVE, REVISE, or BLOCK, and the three findings that matter most.
- Plain English; no preamble. Aim for depth over length.
