---
paths:
  - raptor-port/src/**
  - raptor-port/e2e/**
  - raptor-port/probes/**
  - raptor-port/scripts/**
---

# Raptor implementation workhorse

## Scope

Applies while IMPLEMENTING an authorized Raptor task, including approved fixes returned by the
review loop. A planning, review or inspection session reads this as context, not as permission to
build. It does not replace `raptor-port/CLAUDE.md`, the Claudex workflow, project safeguards,
permission requirements, or the owner's approval gates — it sits under them.

## Approved specification

Read the exact approved plan or handoff for the current task and confirm WHICH task or phase is
authorized before editing. Do not pick a plan because its filename looks plausible; an unapproved
draft is not authorization. (Claudex binds approval to the plan's path + SHA256 — use that pairing.)

Implement the approved behaviour using the existing architecture. Do not invent scheduling rules,
APIs, schemas, fields or requirements.

When a material requirement is missing, contradictory, or conflicts with a documented invariant:
stop the affected work and report **BLOCKED**, naming the decision needed. Never silently change the
approved plan or a policy.

## Inspect before editing

Read the implementation, its callers, types, tests and the applicable project instructions before
changing code. Use repository evidence, not assumptions about how the code works.

## Minimal, complete changes

Make the smallest maintainable change that fully satisfies the task. No unrelated features,
dependencies, abstractions, renames, cleanup or refactors. No placeholders or half-finished branches
described as done. **Preserve unrelated uncommitted work.**

## The implementation stays in this session

Do the assigned implementation yourself. Do not hand it to another provider or a separate CLI/API
session (Codex, a second `claude -p`) except through the workflow's documented `runner.py build`
path with the coordinator's authorization. Owner, 17 Sep 26: while the Claudex loop itself is the
work, the implementation is not farmed out to lower-tier subagents either. CLAUDE.md's delegation
rule still governs read-only exploration, and any subagent's diff is yours to read, test and answer
for as your own.

Never disable or bypass the workflow's independent reviewer.

## Correctness

Follow CLAUDE.md's rules-engine robustness doctrine and `docs/feature-impact.md`. Do not invent a
second correctness checklist beside them.

Date maths must stay timezone-independent — the Leave War suite runs under a hostile TZ
(`Pacific/Midway`) to prove it. Do not weaken that.

No `eval`, `new Function`, or equivalent execution of user-supplied rule strings.

## Verification without self-approval

Run the repository's real gates from `raptor-port/` (CLAUDE.md §Build & verify). A backgrounded job
starts in the folder the chat STARTED in (usually the repo root), not where the foreground shell has moved
to — `cd` into `raptor-port/` by its full path first or it fails instantly.

Write the focused tests the plan or project testing policy requires; where that policy is silent,
add a focused regression test for changed behaviour using the existing framework. Do not create a
new testing framework.

Never delete or skip a relevant test, weaken an assertion, relax validation, or change an expected
result merely to obtain a pass. An intentional change to existing expected behaviour must trace to
the approved requirement.

Fix failures your changes caused. Report unrelated failures with evidence rather than expanding
scope. Report an unavailable check as **NOT RUN**, with the reason. Do not call a failure
pre-existing without evidence.

**Passing checks are evidence, not independent approval.** Never mark your own implementation
APPROVED or bypass external review.

## Review integrity

Never edit approval gates, reviewer prompts, tool permissions, hooks, or these rules to get a result
accepted.

Implement reviewer corrections that are consistent with the approved specification. Where feedback
conflicts with the specification or a documented invariant, return the conflict and its evidence
rather than applying it blindly or silently rejecting it. Do not mark the review complete yourself.

## Communication

Plain, concise English — the owner is non-technical (CLAUDE.md's plain-language rules apply in
full). Edit files with tools; never print proposed code and call the task done. Brief progress
updates only at real milestones or blockers.

Finish an implementation task with:

```
Status: READY FOR INDEPENDENT REVIEW | BLOCKED | INCOMPLETE
Changes: files changed and a brief description
Checks: exact commands, working directory, and PASS / FAIL / NOT RUN
Open items: unresolved issues, blockers, or none
```

Preserve any machine-readable output the installed workflow requires — this footer is in addition to
that protocol, never a replacement for it.
