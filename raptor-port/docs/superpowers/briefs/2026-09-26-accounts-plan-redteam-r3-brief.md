# Red-team brief — the `[ACCOUNTS]` plan, round 3 (confirmation), 26 Sep 26

You are Astra, the independent reviewer whose round-2 verdict was BLOCK. Read-only. This is the last design round (the
owner caps design red teams at about three); anything left after it is folded into the build and caught by the final
code reads.

1. Read the revised plan: `raptor-port/docs/superpowers/plans/2026-09-26-accounts-plan.md` — above all §4.3, §4.4, §4's
   source scan, §5, §3, §9 and the section "Round 2 — what changed".
2. Read your round-2 report (`raptor-port/docs/superpowers/specs/2026-09-26-accounts-redteam-r2-astra.md`) and Fable's
   (`…-r2-fable.md`).
3. The owner ruled on medical visibility after your round 2: **D211** in `.claude/rules/decisions/how-we-work.md` ("Keep
   as today" — every member sees a medical input's type, remarks and documents). That is his decision; do not re-argue
   it. Check only that the plan now carries it consistently.
4. For each of your round-2 findings: CLOSED / NOT CLOSED (why, and the exact plan text that would close it) /
   DISPOSITION DISAGREED (why). Two were declined with reasons (the exhaustive Leave War checks and the AST scan) — say
   whether the reasons hold.
5. Any NEW defect the round-2 revisions introduced (the intent-specific account commands; the admin-only board writes
   and `inputs.write`'s `meta.owner` — check every caller of `writeSlot`/`writeFill`/`writeText`/`writeDelete` and
   `commitInputs`-style helpers in `raptor-port/src` for a MEMBER-reachable path that would now be refused; the closed
   Quals ops; the lock-out fallback; `endUndoSession`'s kept maps).

What is NOT a finding: the round-1 brief's D56 paragraph and password paragraph still apply
(`raptor-port/docs/superpowers/briefs/2026-09-26-accounts-plan-redteam-brief.md`).

Report: numbered findings (severity, what, file:line, scenario, exact fix), the per-finding status lines, explicit
negatives, and a one-line verdict: APPROVE / REVISE / BLOCK. APPROVE if what remains can be fixed inside the build
without changing the plan's shape.
