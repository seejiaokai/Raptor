# Read brief — [CHK-ROUTE-2A], the bug-check checklist routed to §2a whole (D1937), 8 Nov 26

A working-guide change, read before the owner's "merge live" by two readers, each blind to the other: Astra and a fresh
Opus reader (how-we-work's "A working-guide change is read before his approval…", D1761, D1770). Read-only: change no
file, commit nothing.

## What to read
- The change: `git diff origin/main...claude/chk-route-2a -- raptor-port/docs/bug-check-checklist.md` (the branch's
  other changes are the backlog item moving to its archive).
- The finding it answers: `raptor-port/docs/superpowers/briefs/2026-11-08-review-8nov-jobs-fable.md` §2, F-CHK-1.
- The ruling: `grep -h '^| D1937 |' .claude/decisions-full/*.md`.
- The sections of the order it routes to: `raptor-port/docs/bug-check-order.md` §2a (the heading
  `## 2a.` to `## 2b.`) and §7.1 (`**7.1 ` to `**7.2 `). The checklist's head says how a named section is read.

## The questions — a narrow brief, one round
1. Does each change do what D1937 asks — send a walk's sizing (and the other routed steps) to §2a whole, its words on the
   Tracker's and the Leave War's everything-case included, not its table only?
2. Does any changed line contradict the order, another guide, or a ruling?
3. Does it drop a safeguard the old wording carried, or change the meaning of a step beyond the routing?
4. Does it add bulk that is not needed where it sits?

## What is not a finding
- A problem that lives only in data already stored (D56) — none is expected here.
- The order's own wording (§2a, §7.1) — it is not changed by this job; a fault there is a separate note, not this
  change's finding.
- The LOW points Fable listed beside F-CHK-1 (§3, "With the Claudex loop", §4a, ui-design.md) — out of this job's scope.

## What to hand back
Each finding with: the line, what it says, what it should say, and the consequence for a walk that follows it. If
nothing, say "nothing found" and what you checked.
