# Red-team brief — the `[ACCOUNTS]` plan (26 Sep 26)

**For:** Fable 5.1 (run in the cloud session) and Astra (run on the owner's PC — the cloud session cannot reach Codex).
Each reads blind: never show one model the other's report before both exist (bug-check order §4).

**Read, in the repository (`raptor-port/` is the app):**
- the plan: `raptor-port/docs/superpowers/plans/2026-09-26-accounts-plan.md` — THE thing under attack;
- the rulings it builds: `.claude/rules/decisions/how-we-work.md` rows **D165, D166, D173, D180, D200, D202, D203,
  D204**; `.claude/rules/decisions/scheduler.md` rows **D149, D169, D104, D148**; `.claude/rules/decisions/oil.md`
  **D79, D82**; `.claude/rules/decisions/tracker.md` **D121**; the backlog item `OUTSTANDING.md` `[ACCOUNTS]`;
- the code as it stands on this branch: `raptor-port/src/state/auth.ts`, `src/state/users.ts`, `src/state/store.ts`
  (`resetSession`, `toggleRole`, `HOOKS.whoami`), `src/ui/Login.tsx`, `src/ui/App.tsx`, `src/ui/Shell.tsx`,
  `src/ui/Drawer.tsx`, `src/ui/AdminPage.tsx`, `src/ui/QualsPage.tsx`, `src/ui/InputsPage.tsx`, `src/ui/inputedit.tsx`,
  `src/command/actor.ts`, `src/state/people-settings-commit.ts`, `src/engine/hooks.ts` (`store`),
  `src/leavewar/sync.ts` (`setViewer`), `src/leavewar/inputgate.ts`, `src/leavewar/engine/stages.ts`,
  `src/probe-bridge.ts`, `e2e/app.ts`;
- the permissions table IT will build the database's security from: `raptor-port/docs/data-model.md` §3 (`User`) and
  §11; the auth rules as shipped: `raptor-port/docs/engine-rules.md` §Auth / roles; the database handover
  `raptor-port/docs/handover-dataverse.md`.

**The brief (the bug-check order's finder wording, verbatim):**

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

**Here there is no code yet — attack the PLAN before it is built.** In particular:

1. **Missing call sites.** Every place the app reads the signed-in person, the role, or stamps "who" — which does the
   plan's roll-call (§10) and gate table (§8) NOT name? Anything that still reads the old "View as" identity, the old
   role toggle, `ACCOUNTS`, `USERS`, or assumes `ME` is always a real person (a guest has `ME = ''`)?
2. **A member (or a guest) reaching more than he may.** Any write path a member or a guest can reach that the plan's
   `may()` gates do not cover — a page mounted but hidden, a probe, a keyboard shortcut, a board or sheet opened by
   state left from the previous session, the Leave War pre-warm, the Tracker, undo/redo of someone else's change.
3. **Lock-outs and dead ends.** Any sequence in which no admin can sign in, an admin strands himself, a person can never
   get an account, or a request can never be resolved.
4. **The rulings.** Anything in the plan that contradicts, narrows or over-reads a ruling; anything the plan decides
   that is really HIS call and must be put to him (the plan's §13 lists the ones it knows of — are they right, and are
   there others?).
5. **Persistence.** The three settings keys and their loader: a reload, a rollback, stored junk, the storage reset,
   the demo defaults never written, the command layer's settings hook, the global undo.
6. **The one place and its test.** Will the drift test really fail when `data-model.md` §11 and the app disagree? Is
   the ratchet (no raw `SESSION.role` checks outside the named files) sound, and are its exceptions honest? Is the
   §11 rewrite right for IT (who builds the database's security from it)?
7. **Tests and scripts that will break** because `us` is no longer Ranger, "View as" and the role toggle are gone, or
   `canEditSched` now routes through `may()` — and whether the plan's handling of each is right.

**What is NOT a finding (owner, D56, 23 Sep 26):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

Also not a finding: that the prototype's passwords are not security (the owner knows — D166; the real sign-in is
Microsoft's at the database step).

**The answer we need back:**
- findings ranked most severe first, each with **setup → action → expected → what would disprove it**, and **exact,
  step-by-step fix instructions** (file, function, what to add) — not a direction;
- **explicit negatives**: "I checked X and found nothing" for each of the seven areas above;
- anything you believe is the OWNER's decision, worded as a question he can answer in one line.

Write your report to `raptor-port/docs/superpowers/specs/2026-09-26-accounts-plan-<fable|astra>.md`.
