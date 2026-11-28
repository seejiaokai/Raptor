# The checking fix — readers' brief, round 2 (chat 173, 25 Nov 26)

You are a fresh, blind reader of round 2. Read-only. **Do not open** any `*-read2-astra*`, `*-read2-opus*`,
`*-read2-fable*` file (the other round-2 readers'). You MAY read round 1's three reports
(`2026-11-24-readings-fix-read-{astra,opus,fable}.md`) and the builder's report
(`2026-11-24-readings-fix-build-report.md`, its "Round 1 fixes" section) — to check each fix, not to adopt their view.

**What you read:** the whole change, `git diff e6d855310 b6479344c -- . ':(exclude)raptor-port/docs/superpowers'
':(exclude)HANDOFF.md' ':(exclude).claude/decisions-full' ':(exclude).claude/rules/decisions'`, against its plan
`raptor-port/docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md` (§C as revised in §E) and the lesson
(`raptor-port/docs/bug-check-order.md` §7.11 lesson 32's case text).

Everything in round 1's brief (`2026-11-24-readings-fix-read-brief.md`) still applies — the narrow brief for the guide
changes, the questions for the check, what is not a finding. Beyond it, round 2 asks:
1. Is each round-1 finding really fixed? Reproduce the ones about the check (wrapped phrases, other phrasings, the
   comment reader's blind spots, moved lines, the listing) with your own cases, not only the new tests.
2. Three changes to approved wording need a meaning check: the C1 block's added last sentence (a comment citing
   "ruled D<n>" passes), the rewritten line in `.claude/rules/record-decisions.md`, and lesson 32's folded "Lesson:"
   sentence — does each say what the plan and lesson meant, lose nothing, add nothing his rules forbid?
3. New false fails or passes the fixes brought (e.g. "his to change" meaning "he may edit it"), and whether the
   check stays fast enough for the turn-end hook (it was 15–17 s, now about 2 s).
4. Two size tripwires were raised (DECISIONS.md 110 → 120, raptor-executor.md 108 → 110): is anything in those
   additions not needed where it sits?
A finding counts only with a concrete failure, its cause and its fix (D489); rank must-fix / should-fix / minor;
at most ~600 words.
