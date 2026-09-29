# Red-team brief - [DB-READINESS] group A plan, ROUND 3 - THE LAST (30 Sep 26)

Same rules and finding format as round 1 (`...-redteam.md`). Work read-only. The plan is now v3
(`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`; v2 = commit e3d64c29). Round-2 dispositions:
`...-dispositions-r2.md`; both round-2 reports beside it.

This is the owner's cap on design rounds: after it, remaining points are folded into the build and caught by the code
reads. So report ONLY:
1. A round-2 finding whose v3 fix is still wrong or incomplete - with the exact fix.
2. Something v3 introduced that would cause a real failure in new data or a wrong table shape (the stream persistence
   consumer in 2.2, the JSON-on-parent rule in 2.5, the invalidation-only ChangeBatch in 2.7, BootPolicy and frozen seeds,
   the other-day writer dispositions in phase 1.3, the fifth Leave War seam in phase 3).
No restatement of accepted points; no preferences. Verdict APPROVE / REVISE / BLOCK. If REVISE or BLOCK, say whether each
remaining point can safely be fixed during the build (named in the build's checklist) or must change the plan first.
