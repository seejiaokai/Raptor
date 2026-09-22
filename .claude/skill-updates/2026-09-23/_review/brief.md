# Independent read: draft changes to the working guides (skills), 23 Sep 26

You are an independent reviewer. A different model (Claude Opus 5.5) wrote these
drafts; your job is to find what is wrong with them BEFORE the owner approves them
(owner ruling D68: both Fable and Astra read skill changes, one round each).
**Read-only: do not edit, create or delete any file.**

## What you are reviewing

- This repo vendors agent "skills" (method guides the coding agent loads when a kind
  of work starts) under `.claude/skills/`. A review of 181 logged observations
  (`.claude/skill-observations/log.md`, each headed `### Observation N:`) produced
  DRAFT changes, staged under `.claude/skill-updates/2026-09-23/` at the same
  relative paths (`_hooks/` = `.claude/hooks/`, `_notes/` = `.claude/skills/*.md`
  provenance notes). Nothing under `.claude/skills/` has been changed.
- **The whole change set, live → draft, is one file:**
  `.claude/skill-updates/2026-09-23/_review/diff.patch` (24 files).
- **Which observation each change implements:**
  `.claude/skill-updates/2026-09-23/_install/dispositions.py` — `GROUPS` maps a group
  to a skill and its observation numbers; `REFLECTED` closes observations as already
  covered, citing where; `DECLINED` gives a reason; `OPEN` stays open.
- Proposed additions to machine-local memory notes (outside the repo):
  `.claude/skill-updates/2026-09-23/_memory/additions.md`.
- Where lessons go and why (skills, not the always-loaded `raptor-port/CLAUDE.md`,
  which is at its size ceiling): `.claude/skills/TASK-OBSERVER-VENDORED.md`
  §Reviews in this repo.

## Check, in this order

1. **Fidelity.** Does each change say what its observation meant? Open the
   observation by number and compare. Flag distortion, overstatement, lost
   nuance, or an observation mapped to a change that does not actually carry it.
2. **Contradictions** — within the same skill, across skills, and with the repo's
   rules (`.claude/rules/*.md`, `raptor-port/CLAUDE.md`, `DECISIONS.md`). Look hard at:
   - brainstorming: "the offer MUST be its own message" vs the new exception;
   - subagent-driven-development: "a plan-conflicting finding is the human's
     decision" vs the new "escalate decisions, not premises"; "minor findings never
     enter the loop" vs "minors ride a round that is open anyway"; "continuous
     execution, don't pause" vs anything that pauses;
   - systematic-debugging: the upstream "implement appropriate handling (retry,
     timeout …)" vs the new "never fixed with a retry or a longer timeout" block;
   - `raptor-port/CLAUDE.md` §Token discipline ("pipe logs through tail/grep") vs the
     new "capture to a file, then tail the file" pattern.
3. **Lost safeguards.** Did any edit weaken or delete an existing rule, check or
   enforcement step?
4. **Wrong closures.** Spot-check at least ten `REFLECTED` entries: is the lesson
   really stated at the cited place, clearly enough that a future agent would not
   repeat the mistake?
5. **Bloat.** Anything that repeats what the skill already says, or would not change
   an agent's behaviour.
6. **Commands and scripts.** Any command in the drafts that is wrong. The script
   `subagent-driven-development/scripts/task-brief` was changed — check its logic
   (it must still extract exactly the same task text as before, now with the plan's
   shared header prepended).
7. **Leakage.** Project-specific detail in the generic upstream skills that would
   mislead outside this repo. Pointers to this repo's own docs are intentional; flag
   them only if misleading.

## Not findings — do not report

- Style or word choice that does not change meaning.
- Upstream skill text the drafts did not touch.
- Anything that lives only in data already stored in the app (owner ruling D56).
- The choice to put lessons in skills rather than `raptor-port/CLAUDE.md`.

## Output

A numbered list, most severe first. For each: the draft file and line, what is
wrong, why it matters, and the EXACT fix (the owner's standing rule: reviewers give
precise fix instructions, not directions). Then a one-word verdict: APPROVE or
REVISE. Keep it under 1,200 words.
