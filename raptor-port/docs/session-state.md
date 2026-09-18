# Session handoff — [GLOBAL-UNDO] design DONE (Rev 6, build-ready); BUILD not started

## Where it is
[ARCH-STACK] step 3, **[GLOBAL-UNDO]** — one global per-session undo — is **DESIGNED, red-teamed to
close, and build-ready.** Design of record (READ IT FIRST):
`docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md` **Rev 6**. Front-door contract:
`docs/undo-contract.md`. Full review transcript (5 rounds): `…-global-undo-review-log.md`.

**Nothing is built. No code. The design work is on branch `claude/global-undo`** (docs only so far,
pushed). Foundation `[CMDL-FINISH]` is merged + live on `main` — the design sits on the real code.

## How it got here (so the design is trusted)
6 revisions, dual cross-provider red-team every round (Codex/GPT-6-Astra high + Fable 5.1 high):
- Rev 1 (pre-session) → REVISE. Rev 2 (rebuilt on live CMDL-FINISH) → REVISE. Rev 3 → REVISE, but
  **Fable hand-executed the engine** (N-edits→N-undos→N-redos + the 4 sync fixpoints) and it PASSES.
- Rev 4 introduced the owner's **UNPUBLISH reframe**; Rev 5 gave it a real issuance identity.
- **Rev 5 → Fable APPROVED (build-ready, no further design round); Codex REVISE with 6 contained §6
  findings, all folded into Rev 6.** The engine took NO finding in rounds 4–5.
The design phase is CLOSED. The remaining quality gate is the **post-build cross-provider CODE
inspection**, not more design review.

## What to build (the model, in one breath)
One global undo timeline over the command stream replaces the 3 snapshot stacks (scheduler HIST, LW
per-war, Tracker mark history). An undo is a **replay of recorded inverse data** (never a reconciler
re-derivation) applied as one `restore` commit through each store's `write()` seam. Plus:
- **Conflict = refuse-whole**, via a timeline-owned `expected` map + sticky **out-of-band barriers**
  (§4) checked before EVERY expectation update (incl nav/restore).
- **Authorization** `mayReverse` keyed on the FORWARD actor's role + record ownership (§5).
- **Publish path = UNPUBLISH model (§6):** undo of a publish is its ordinary inverse (clears
  sign-offs); a standing **Unpublish button** on the day header retracts to a working copy; a **quiet
  correction** reissues the **SAME version label** with each issuance kept as an immutable snapshot in
  an append-only `sched.retired` collection + a history line once disseminated; a real **amendment**
  is the separate working-copy→next-AL act. Owner rulings baked in at design §0.
- **Snap-to-context** + the **undo bubble** (§8) — one central describer, safe generic fallback.

## Build order (design §13; strangler; ALL FIVE GATES green after each phase; a phase = a checkpoint)
1. **Engine + foundation adds** (no module cut over): timeline, inverse via `write()`, clone-on-write,
   expectation map + barriers + non-linear + redo-LIFO, `mayReverse`, snap + `contexts`, describer +
   bubble, single dispatcher, the `sched.unpublish` command + `retireIssued` + the append-only
   `sched.retired` collection + the DERIVED publication barrier + live boundary, `weekstashStore.write()`,
   `commitAs` `causedBy` + `undo.restore` permission, `Boundary.kind` `'unpublish'`,
   `layRoster`/`relandInputs` extraction, `SCHED.retired` + `SCHED.correcting` through the FULL
   scheduler-state codec (schedFields/histRestore/applyWeekModel/boot/weekStashSnap/applyBook/
   resetSched/LogicalCollection/LOGICAL_TO_BLOB/registerRecord/SchedFields type/schema test), MemoryDoor
   + harness increment.
2. **Scheduler + Leave War cutover together** (forced by `retractLwRow`; LW legacy restore unreachable
   here); `acc` strip+reland; off-week/weekstash; the **Unpublish button** UI on the day header.
3. **People + settings.**
4. **Tracker** (mark + structural history dormant/unreachable); whole-import = one undo (~300-line
   pure-function refactor of applyCharts/applyStudents) + an undoable-draft for unsaved structural edits.
5. **Leave War postouts reproject (§10.1, the `poArchive===undefined` provenance rule) + finding-A
   forward splice** (own commit + test).
6. *(after ARCH-STACK step 4, one-Absence)* delete the three dormant stacks.

## During-build doc items to fold into the build PR (Fable round-5, already listed in design §15)
R5-03 codec completeness; R5-08 derive `di` from the closure keys; R5-09 add `armDrop`+`prunePreviews`
to the restore reducer's deferred effects; R5-06/07 wording. R5-01 (postout provenance) is folded in
§10.1 but re-verify before phase 5.

## How to work it
- **Opus, high, test-first (TDD).** The main session builds (no farming to cheaper models —
  `../.claude/rules/raptor-executor.md`). Read `raptor-port/CLAUDE.md` §Build & verify + the
  rules-engine robustness doctrine; this touches persisted data + publish + signatures = HEAVY.
- Gates from `raptor-port/`: `npm test` · `npm run build` · `node reference/tfin.js` (728/0) ·
  `npm run test:e2e` · `npm run smoke:tracker`. Run only the affected file while iterating; full set
  once per phase.
- **NO merge without the owner's explicit "merge live".** Push each phase to `claude/global-undo`,
  hand him the Vercel link, keep the one PR accumulating. Coordinate with any parallel chat before
  merging.
- After the build: the standing dual cross-provider CODE inspection of the diff.

## Pick up here (next session — a FRESH chat, per the owner's rule for a big new task)
Select branch **`claude/global-undo`** in the picker. Read design Rev 6 + `undo-contract.md`, then
start **phase 1** test-first. The owner is non-technical — plain-language reports only
(`.claude/rules/plain-language.md`).
