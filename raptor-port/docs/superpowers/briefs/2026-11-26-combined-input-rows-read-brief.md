You are a fresh, independent, BLIND reviewer of a PLAN (not code) for a scheduling web app used by a fighter squadron (repo C:\Users\User\projects\Raptor, app in raptor-port/). The owner is non-technical and has called this HIGH RISK; he wants your read of whether the plan is sound before he decides. Read-only: change no file, do not commit. Another reviewer has read the plan separately: do NOT open any file whose name contains "fable-read" or "-read-" under raptor-port/docs/superpowers/briefs/ dated 2026-11-26 — your read must be blind to theirs.

## Read
1. The plan: raptor-port/docs/superpowers/specs/2026-11-26-combined-input-rows.md (whole). It includes a survey, checked on the running app, of which schedule rows take several people by a drop.
2. The owner's rulings that bound it. Each area page is short; read them, then open the full row of any ruling you lean on: grep -h '^| D737 |' .claude/decisions-full/*.md
   - .claude/rules/decisions/scheduler.md (search: input, Unavailable, shared, row, drop, Reject) — D661, D734-D743, D748, D755-D757, D759, D760, D762, D776, D861.
   - .claude/rules/decisions/inputs.md (who files and changes an input; medical; the several-people picker).
   - .claude/rules/decisions/leave-war.md and oil.md only where the plan touches them.
   - The backlog item [SHARED-ROW-HELD-LEFTOVERS] in OUTSTANDING.md (grep for it).
3. You may read code to check a claim (src/drag.ts applyDrop, src/ui/reqdoor.ts, src/ui/inputedit.tsx reassignInput, src/html.ts, src/ui/board-html.ts, src/engine/inputs.ts — facesOf, landsUnavail, LW_OWN), but this is a plan read: ask what is MISSING or WRONG in the plan, not whether today's code has bugs.

## Not a finding
- A problem that lives only in data already stored (demo data, cleared before the database step) — unless new data would be hurt too.
- A scheduler who is not an admin (a scheduler is always an admin here).
- Restating the plan.

## Answer
1. Verdict: sound / sound with changes / not sound — one rule, the same everywhere, fewer places for a fault, fitting how a squadron scheduler works (mostly at a desk, minor changes on a phone).
2. What is missing or wrong: each with the real-life case (who does what, when), what would go wrong, and what the plan should add. Consider at least: one man of a group coming back early; several-day inputs (who is in an input is the same on every day of it); a man posted out or moved squadron mid-input; ALL / ALL AVAIL; a member taking himself out; a man added who is already away; the Leave War splitting a man off; published days and amendments; Reject and "-> Ground"; the per-man LATE mark; OIL; warnings naming one man; Undo; the phone; borrowing from another squadron; whether leave can be shared at all today; the Board's Personal Inputs panel and its current role in a drag.
3. The exception: is medical right and the only one? Should any other kind stay a row per man?
4. The survey's other rows: same job, separate job, or stay?
5. The owner's earlier rulings it changes or clashes with — by number, and whether the plan names each.
6. A short recommendation in plain words, and the questions he must answer before it is built, each with a recommendation.

Plain, concrete English. Ruling numbers are fine (the host translates for him).
