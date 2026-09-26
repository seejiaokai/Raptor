# Red-team brief — the `[ACCOUNTS]` plan, round 2, 26 Sep 26

You are an independent reviewer of a PLAN, before any code is written. You did not write it. Read-only.

Round 1 had two reviewers (Fable: REVISE; Astra: BLOCK). Their reports are now both in the repo, and the plan has been
revised. Your job in round 2 is narrower than round 1:

1. **Read the revised plan in full:** `raptor-port/docs/superpowers/plans/2026-09-26-accounts-plan.md`. Its last section
   ("Round 1 — what changed") dispositions every round-1 finding.
2. **Read both round-1 reports:** `raptor-port/docs/superpowers/specs/2026-09-26-accounts-redteam-r1-fable.md` and
   `…-r1-astra.md`.
3. **Judge each disposition:** is each "accepted" finding actually closed by the plan text as written (would a builder
   following it close the hole)? Is each "declined" or "filed" finding soundly argued against the owner's rulings
   (`.claude/rules/decisions/how-we-work.md`, `scheduler.md`, `leave-war.md`, `oil.md`)?
4. **Hunt for what the REVISIONS introduced:** the five session roles (`admin`, `main`, `guest`, `pending`, `off`), the
   command gate delegating to `perms` (`COMMAND_OPS` — check it against `raptor-port/src/state/sched-commit.ts`
   `SCHED_TYPES`, `state/people-settings-commit.ts`, `undo/timeline.ts`, and every OTHER `definePermission` call in
   `raptor-port/src`), the separate guest tree, `resetPopsForSession`, `endUndoSession`, the probe bridge moving to
   localhost-only (does anything — a gate, a probe, the Tracker smoke, the hand-pass drivers under
   `raptor-port/scripts/handpass/`, a deployed-site check — rely on it off localhost?), the Quals write function, the
   seeds, the drift test and source scan. **Assume every existing line may be correct and the defect may be a MISSING
   call site.**
5. Everything in the round-1 brief still applies (`raptor-port/docs/superpowers/briefs/2026-09-26-accounts-plan-redteam-brief.md`),
   including **what is NOT a finding** (D56 — harm only in data already stored, when the code is correct going forward;
   and the prototype's passwords as security).

## How to report

- Numbered findings, most severe first: **severity** (BLOCKER / MAJOR / MINOR), what is missing or wrong, the ruling or
  file:line it rests on, a concrete failure scenario, and **exact step-by-step fix instructions for the plan**.
- A line per round-1 finding: CLOSED / NOT CLOSED (why) / DISPOSITION DISAGREED (why).
- Explicit negatives: what you checked and found sound.
- One-line verdict: APPROVE / REVISE / BLOCK. Say APPROVE if what remains can be fixed inside the build without
  changing the plan's shape.
