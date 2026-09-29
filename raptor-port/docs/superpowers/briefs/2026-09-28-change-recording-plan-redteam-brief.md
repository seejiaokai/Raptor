# Red-team brief — the change-recording plan, round 1 (28 Sep 26)

You are an independent red-teamer of a PLAN, before any code is written (Opus 5.5 wrote it). Another model from a
different provider red-teams it at the same time; you will not see each other's report. **Read-only: edit nothing, run
no tests, builds or the app.** Repository `C:\Users\User\projects\Raptor`, branch `claude/change-recording-retest`.

**The plan:** `raptor-port/docs/superpowers/plans/2026-09-28-change-recording-plan.md`. Read it whole, then attack it.
Its inputs, which you should read too: the two scenario reports
(`raptor-port/docs/superpowers/briefs/2026-09-28-change-recording-scenarios-fable.md`, `…-astra.md`), the approved
mock-up `raptor-port/docs/mock/undo-topbar.html`, `raptor-port/docs/undo-contract.md`, and the rulings
`.claude/rules/decisions/how-we-work.md` (D148, D166, D227, D286, D287, D292, D295, D305, D310, D322, D347, D348, D349,
D350), `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/leave-war.md`, `.claude/rules/decisions/oil.md`,
`.claude/rules/decisions/tracker.md` (D121, D129 and the Tracker's architecture section). **In flight beside you:** a
separate review of which changes should and should not be undoable (its brief:
`…/2026-09-28-change-recording-undoable-list-brief.md`); if you find a writer the plan's §2 misses, say so anyway.

## Attack
1. **Will each step do what it says, in THIS code?** Check every claim about the code against the code (file:line). A
   plan agreeing with a doc is evidence of nothing.
2. **What is MISSING** — a writer, a door, a reader, a downstream repaint, a role, an order of actions, a surface the
   plan never names. Assume every existing line may be correct and the defect may be a MISSING call site.
3. **What will BREAK** — an existing behaviour, test, gate (the geometry gate, the reference byte-parity `tfin.js`, the
   perf ceilings, `perms-scan.test.ts`), another module's seam (the Leave War's four seams; the Tracker's three), a
   parallel chat's area (listed in `HANDOFF.md`'s `claude/change-recording-retest` block).
4. **The builder's own calls, flagged in the plan:** B6.7 (say who once, then pass over), B8 (a new envelope `detail`
   carrying the text box's key), B10.5 (the board losing ✕ Close; the ⋯ menu), B10.2 (the pair shown only where the
   signed-in person can change something), §2's Logic-for-a-member reading. Say plainly if one is wrong, and what instead.
5. **Order and size** — is anything in the wrong phase; is any step too big to prove red-first; what should be split.

**What is NOT a finding (owner, D56):** the stored world is demo data, cleared before the database step. Do not report
harm that exists only in data already stored when the code is already correct going forward.

## Report
Numbered findings, most severe first, each: **what** (one sentence), **where** (plan section + file:line), **what goes
wrong** (a concrete scenario — setup, action, what a person sees), **the fix to the plan** (exact, step by step). Then
**explicit negatives** (what you checked and found sound). Then **questions only the owner can answer**, if any, each with
your recommendation. No padding.
