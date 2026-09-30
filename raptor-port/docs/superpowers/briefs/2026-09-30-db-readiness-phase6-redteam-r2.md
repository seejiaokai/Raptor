# Red-team brief — [DB-READINESS] group A, PHASE 6 plan v2, ROUND 2 — step (c) only (30 Sep 26)

Same rules and report format as round 1 (`2026-09-30-db-readiness-phase6-redteam.md` — read it for the finder wording,
the D56 exclusion and "How to report"). Work READ-ONLY. The plan is now v2
(`raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md`; v1 = commit 90e1bd8a). The round-1
dispositions: `2026-09-30-db-readiness-phase6-dispositions-r1.md`; both round-1 reports beside it — you may read them now.

Steps (a), (b) and (d) are BUILT on the branch (plan §9) and will get the final code reads later — do not review them
here, except where (c) v2 depends on them (the overlay module `raptor-port/src/engine/overlay.ts`, its doors in
`state/store.ts applyWeekModel`, `engine/weekstash.ts stashDays`, `engine/weekctx.ts bundle`, `ui/peek.ts`, and the
after-command effect in `state/person-delete.ts applyDelete` — §2.2's mechanism).

Report ONLY:
1. A round-1 finding whose v2 disposition is still wrong or incomplete — with the exact fix.
2. Something v2's (c) introduces that would cause a real failure on NEW data: §2.1's doors and contract, §2.2's
   "a derived change is made after its command" (is every request path covered — including a projection, a nested
   command, an Undo / Redo, the boot, a week load; does any holder's intended change now go unsaved), §3 (c)'s
   reconciliation rules 1–6, the landing on a published day, the marks (live and at load), the whole-day replacement
   (`kept` / `srcv`), and the removal of the "Load the week of…" refusal.
No restatement of accepted points; no preferences. Verdict APPROVE / REVISE / BLOCK; for each point, say whether it can be
fixed during the build (named in the build's checklist) or must change the plan first. This is round 2 of the owner's cap
of about three.
