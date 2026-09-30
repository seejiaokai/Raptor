# Red-team brief — [DB-READINESS] group A, PHASE 6 plan, one round (30 Sep 26)

You are red-teaming a PLAN before any code is written. Work READ-ONLY. Report to the file or message you are told to.

**The plan:** `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` (v1). Its parent, whose §2
decisions bind it: `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md` (§2, §3 phase 6, §8,
§9 — the build log of phases 0–5b and the final code reads). **The design of record:** `raptor-port/docs/data-model.md`
§3 (ScheduleWeek, ScheduleDay, Input), §9 (rule 9 above all, rule 11 on Undo), §11 (permissions).

**The owner's rulings** — read them from the live files, not from memory: `.claude/rules/decisions/scheduler.md`,
`oil.md`, `people-accounts.md`, `how-we-work.md` (one short line per ruling); the full rows in
`.claude/decisions-full/<same name>` (search them: `grep -h '^| D363 |' .claude/decisions-full/*.md`). The ones the plan
names: D18, D114, D174–D178, D271, D297, D299, D304, D337, D363, and the 16 Sep 26 rule "a request filed live on a
published day lands on the working copy as a pending amendment" (`raptor-port/docs/engine-rules.md`). Also
`.claude/rules/raptor-executor.md` (the build's rules) and `raptor-port/docs/bug-check-order.md` §2b.

**The code** is under `raptor-port/src`. The plan's §1 names the functions it relies on; check them — the plan was
written from three read-only sweeps and may be wrong about any of them.

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Applied to THIS plan, the questions that matter most:

1. **§2.2, the derived-change rule.** Is the list of commands whose day changes are NOT saved complete and correct?
   Name any command in that list that makes a day change a holder INTENDS and must be saved (it would be lost at a
   reload), and any command NOT in it that writes a day only as a side effect of a request or a person (it would still
   write days nobody holds). The Undo / Redo of such a step, a projection (the Leave War's sync), a boot pass.
2. **§2.1, the overlay's doors.** Is every place a week's days come into memory covered (the loaded week, the
   cross-week reads, a plan switched in, a version loaded, an Undo that restores a day, a week restored after an
   unreadable one, the official world)? A door the overlay misses shows a deleted man, or a stale request row, there.
3. **(c) against the published-record rulings** — D114, D174–D178, D363, D175, the 16 Sep 26 live-filing rule: for each,
   an order of actions (with a RELOAD between them) under which the plan's design reads a different count, list or
   sign-off state than the same actions without the reload.
4. **(a)** — the assignment stamp: an order of hand-overs, undos and redos under which a refusal wrongly revives, or a
   valid one is wrongly ignored. The plan declines the design's "dropped at the next save"; is its reason right?
5. **(d)** — any seat, list or record a deleted man still shows on, on a day from his cutoff, after the plan; any day
   before his cutoff he wrongly disappears from.
6. **Consistency** — any place where what the acting person's screen shows right after an action differs from what any
   screen shows after a reload.

**And this, in the same breath — WHAT IS NOT A FINDING (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

## How to report

- Each finding: a short title; severity (BLOCK / HIGH / MEDIUM / LOW); the concrete scenario (setup, action, expected,
  what would be observed); the code evidence (file and function); and **exact, step-by-step fix instructions** — not a
  direction. Say whether it can be fixed during the build (named in the build's checklist) or must change the plan first.
- **Explicit negatives:** for each of the six questions above, what you checked and found nothing in ("I checked X").
- A verdict: APPROVE / REVISE / BLOCK.
- No restatement of the plan, no preferences, no style.
- You are one of two reviewers working blind to each other; do not look for or read another review of this plan.
