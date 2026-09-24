# Vendored: obra/superpowers

The 14 skill directories beside this file — everything except `session-handoff`,
which is ours — come from [obra/superpowers](https://github.com/obra/superpowers)
**v6.2.0**, MIT licensed (`SUPERPOWERS-LICENSE`, © 2025 Jesse Vincent).

## Why vendored rather than installed

Superpowers is a plugin marketplace, and a plugin install lives in
`~/.claude/plugins` on the machine that ran `/plugin marketplace add`. Claude
Code web sessions get a fresh container with only this repo cloned into it, so a
locally-installed plugin is never present. Repo-level skills ship with the clone,
which is why `session-handoff` has always worked in web sessions and superpowers
did not.

## What changed from upstream

1. **Cross-references de-namespaced.** Upstream skills call each other as
   `superpowers:test-driven-development`; a repo-level skill is invoked by its
   bare name, so the `superpowers:` prefix was stripped from all 26 references.
   Beyond that, the skill bodies were upstream's until change 3.
2. **The SessionStart hook is vendored but NOT wired in.** Upstream ships a hook
   that injects the whole `using-superpowers` skill into every session as
   `<EXTREMELY_IMPORTANT>` context. The adapted script is at
   `.claude/hooks/superpowers-session-start.sh` with enabling instructions in its
   header. Nothing in `.claude/settings.json` references it.

   Without the hook the skills still work normally — the Skill tool matches them
   on their descriptions. The hook only makes `using-superpowers` unconditional,
   at a cost of ~8K of context on every session start in this repo.
3. **Local lessons from the skill review of 23 Sep 26** (owner-approved;
   `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo says why
   lessons land in skills). An upstream refresh overwrites these — re-apply
   them (see Updating). `git log -p -- .claude/skills/<skill>` shows each one.

   | Skill | What was added |
   |---|---|
   | `verification-before-completion` | seven rows in Common Failures; the "long check runs" pattern (bash + PowerShell); new `browser-checks.md` |
   | `systematic-debugging` | reproduce / recent-change / working-example lines; the "flaky is a hypothesis" block; new `device-only-bugs.md`; pointer to `raptor-port/docs/performance.md` |
   | `test-driven-development` | Verify RED/GREEN additions (green-before-implementation, reverting only the fix, races, shared fixtures, deliberate behaviour changes); `writing-good-tests.md` additions |
   | `writing-plans` | plan-file check, per-task browser check, `Model:` line, standing orders, three No-Placeholders items, self-review checks 4-9 (4 hands its checks to an independent plan reviewer) |
   | `subagent-driven-development` | pre-flight items, brief contents, machine rules, safe parallelism, DONE_WITH_CONCERNS (incl. settling a disputed number), decisions-vs-premises in the text AND the flowchart, minors ride an open round, FIX_BASE after interleaved commits, ledger/turn-boundary/stop lines, pre-final-review deviation list; `implementer-prompt.md`, `task-reviewer-prompt.md`, `re-review-prompt.md` (optional minors, FIX_BASE); `scripts/task-brief` prepends the plan's shared header |
   | `dispatching-parallel-agents` | three Common Mistakes pairs; "When Agents Share the Working Tree or the Machine" |
   | `brainstorming` | visual-first layout rounds; enumerate "every"; layered-rule decision table; trap hunt; search stylesheet comments for a device; reversed rules list their old pins; the offer-as-an-answer exception; mocks drawn on the real app (local/preview build, never production) |
   | `requesting-code-review` | line-ending check before review; `code-reviewer.md` "Shared state and data" checklist + one Testing item |
   | `receiving-code-review` | finding / diagnosis / fix as three claims; two-of-a-kind; "can't happen" needs proof |
   | `executing-plans` | premise check before building (`git status -sb`, merged/behind); deviation list before review |
   | `using-git-worktrees` | the symlinked-dependencies staging trap (`--summary` check, ignore without trailing slash) |
4. **Local lessons from the skill review of 24 Sep 26** (owner-approved; the same rules as change 3 — an
   upstream refresh overwrites these, re-apply them).

   | Skill | What was added |
   |---|---|
   | `systematic-debugging` | Phase 1: a one-frame defect (sample per frame, pin in the same task); two "environmental differences" (a fresh checkout's defaults, a service that cannot answer a prompt); Red Flags: identical before/after numbers; the flaky questions: a test's leftovers as the product's bug, human pace; `condition-based-waiting.md`: "Before You Pace a Test" (human pace first, reproduce the CI's slowness) and two Common Mistakes (waiting on a proxy, reading what is not there yet) |
   | `test-driven-development` | Verify RED: the second cure in a scenario; read the red (premises, ids not counts); a flash or a jump; failure paths injected at the call |
   | `verification-before-completion` | three Common Failures rows (a clean verdict's scope, "removed everywhere", green elsewhere); a "long check runs" line (a gate chained into a commit); `browser-checks.md`: line positions not rects, measuring across a mode switch |
   | `writing-plans` | Task Right-Sizing: a migration of shared records starts with its checks |

## Updating

There is no auto-update. Re-clone upstream, copy `skills/` over, and re-apply
change 1 — then changes 3 and 4: `cp -a` overwrites every edited file (and keeps
the added reference files), so diff each skill in the tables of changes 3 and 4
against the pre-refresh commit and carry the local lines forward:

```sh
git clone --depth 1 https://github.com/obra/superpowers.git /tmp/sp
cp -a /tmp/sp/skills/. .claude/skills/
cd .claude/skills
NAMES=$(ls -d */ | tr -d '/' | grep -v session-handoff | paste -sd'|')
grep -rlEZ "superpowers:($NAMES)" . | xargs -0 sed -i -E "s/superpowers:($NAMES)/\1/g"
```

Check upstream's release notes before taking a new version: several of these
skills carry deliberately aggressive trigger descriptions (`brainstorming` says
"You MUST use this before any creative work"), so a version bump can change how
often they fire.

## Overlap with what this repo and Claude Code already have

Not conflicts, but know they coexist:

| superpowers skill | already covered by |
|---|---|
| `using-git-worktrees` | the Agent tool's `isolation: "worktree"` |
| `dispatching-parallel-agents` | the Agent tool and Workflow |
| `requesting-code-review` | `/code-review`, `/security-review` |
| `verification-before-completion` | `CLAUDE.md` §Build & verify — **that one wins**, it names this repo's five actual gates |
