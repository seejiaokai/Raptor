# Red-team brief - [DB-READINESS] group A plan, ROUND 2 (30 Sep 26)

Same rules, files and finding format as round 1: `raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-group-a-redteam.md`
(read it first). Work read-only.

**What changed:** the plan is now v2 (`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`; v1 is
git commit e2368d9f). Every round-1 finding and what was done with it:
`raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-group-a-dispositions-r1.md`. Both round-1 reports are beside it
(`...-astra-r1.md`, `...-fable-r1.md`). A new fact: the owner heard from IT "no plugin for now" (unconfirmed) - recorded in
`OUTSTANDING.md` `[IT-QUESTIONS]`; the plan treats section 12 q9 as settled by it.

**This round, answer three things:**
1. For each round-1 finding marked ACCEPTED: is the v2 fix correct and complete? Name any that is not, with the exact fix.
2. For each DECLINED or PARTLY ACCEPTED (A-01, A-04, A-06, F8 b): is the reason sound? If not, say why with file:line
   evidence - a disagreement must show a concrete failure, not a preference.
3. What v2 introduced that is NEW and wrong or missing (the matrix in 2.5, phase 0, phase 1.3's confinement, phase 4's
   sealer, the edit log and accounts rows, the boot policy, phase 6 now unblocked).

Verdict APPROVE / REVISE / BLOCK and the top three. This is round 2 of at most 3.
