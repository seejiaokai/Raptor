# Red-team brief — Build 1's plan after the round-5/6 fold and the four-section split (chat 191, 26 Nov 26)

You read an exported copy of commit `22ada16e1` of branch `claude/msq-b1-screens-135`. **Blind read:** this copy's
`HANDOFF.md` block for the branch and this round's writer's brief and report are removed on purpose; do not look for
them, and read no other reader's report of this round. Read-only: change no file except your report.

## What to read

- The plan: `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` (465 KB — read by section,
  `grep -n '^## \|^### '`). What changed in this round: the head, §1, §8 (new §8.5), §10, §11 (risks 23, 29–40), §13,
  §17, §19.11, new §19.12, §19.13, **new §21 (the four section chats)**, new §22 (the posting sheet), new §23 (the fold
  table). Compare with the previous version: `git -C <this copy>` has only one commit, so read the plan as it stands;
  the fold table §23 says what was added where.
- His rulings, full rows: `grep -h '^| D2638 |' .claude/decisions-full/*.md` — read D2620–D2657 at least, and any row
  the plan cites at a place you question. The rulings pages: `.claude/rules/decisions/people-accounts.md`,
  `leave-war.md`, `design.md`, `how-we-work.md`.
- The app's code under `raptor-port/src/` to test the plan's claims about today and about which files each section
  changes.

## The questions — one round

1. **Does the fold say what he ruled?** For each of D2638–D2655: is it built where the plan says, with nothing he did
   not rule added as his rule, and no reading (the agent's interpretation) promoted to a ruling? Where the plan says
   "(default)" now means "his answer", is that true for each case it covers?
2. **Is the four-section split safe to build in parallel?** §21's file lists against the real code: a file two
   sections change that §21 does not name; an order ("core first through K2") that does not actually protect the
   second section; a section that depends on another's code but is said to wait on nothing; the posting sheet said to
   "ship alone" while touching a file the batch also changes; a test file two chats would both edit.
3. **What would go wrong first** if the four chats started tomorrow from §21 as written — the concrete failure, its
   cause, and the plan fix.
4. Anything in the new §19.12, §19.13, §22 that contradicts an earlier section, a ruling, or today's code.

A finding needs a concrete failure (who does what, what goes wrong), its cause, and its fix in the plan (D489).
A problem that lives only in data already stored is not a finding (D56). A scheduler is always an admin (D785).
Rank findings by severity. Say plainly where you only searched rather than read.
