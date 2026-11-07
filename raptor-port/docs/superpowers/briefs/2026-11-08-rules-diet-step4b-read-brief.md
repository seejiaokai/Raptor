# Brief — the blind read of the rules diet's step 4, part 2: the five always-loaded files as checklists (8 Nov 26)

**You are one of two readers, each blind to the other (his D1739).** Do not open, search for or read any file named
`*step4b-read-opus*` or `*step4b-read-astra*`. Read only; change no file; commit nothing. Your final message is your
report.

**What changed** (the branch `claude/rules-diet-step-4-7b92cb`; the whole change: `git diff 7744e66db HEAD -- .claude
raptor-port/docs/archive raptor-port/scripts/docsize.mjs`). The five rule files every chat loads —
`.claude/rules/shipping.md`, `doc-structure.md`, `record-decisions.md`, `plain-language.md`, `bug-check.md` — were
prose; each is now a checklist (his D1735, approving the plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md`
— read its §3). Each file's old text was moved whole, byte for byte, by the project's move script into
`raptor-port/docs/archive/rule-files-2026-11-08.md`, a one-line pointer left; the checklist above the pointer is new
text, and it is what you read. The builder's account — every requirement of the old text mapped to the checklist line
that states it, or marked as a story — is `raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step4b-account.md`:
use it as a map, and check it; do not trust it. The general rulings are stated on the page
`.claude/rules/decisions/how-we-work.md` (part 1, already live): a checklist may lean on it, never contradict it.

**The authority:** the old text (in the archive file, or `git show 7744e66db:.claude/rules/<file>`) and the full rows of
the rulings it cites — `.claude/decisions-full/*.md` and `DECISIONS-ARCHIVE.md`, searched with the shell
(`grep -h '^| D1742 |' .claude/decisions-full/*.md DECISIONS-ARCHIVE.md`); a search tool may hide a long row; never read
those files whole.

**The question, for every requirement of the old text: does the checklist say more, less or other?** A rule, a
condition, an exception, an "only", "never", "unless", "until" or "both", a scope or a "who does what" dropped, narrowed,
widened or bent; a command, a path, a number or a line's shape (the `Rulings:` and `Walk:` lines, the lock folder, the
2-hour stale lock, the `gh run list` check, the eight questions, the tiers) changed; a passage moved to the archive as a
story that in fact carried a rule. Ask what is MISSING, not only whether what is there is right. D138: a summary must
never change what the original meant.

1. **Each file, old against new, requirement by requirement.** Read the full row of every ruling a line cites where
   the line states more than a pointer.
2. **The headings other files point at:** shipping `## The checks`, `## Pull requests`; doc-structure `## What a chat
   reads, and when`, `## Where a new fact goes`, `## When it leaves`, `## In his workflow`, `## The check that keeps it`;
   record-decisions `## The rule`, `## Two catches`, `## When a ruling overwrites another`; plain-language `## A check
   before you send` (`AGENTS.md` tells Codex to run it); bug-check `## The trigger`, `## When to call in Fable and
   Codex`, `## What is not a finding`. Is each there, and does it still hold what the pointing file expects?
3. **The rules a hook or guard enforces** — is each still stated in words, since Codex has no hooks (`AGENTS.md`)?
4. **Part 1's fixes**, made after its two blind reads and not read since: `git diff 9710cf413 fa16305f6 --
   .claude/rules raptor-port/docs/doc-budget.md OUTSTANDING.md`. Does each changed line now say what its full rows say —
   no more, no less?
5. **The tripwires** lowered in `raptor-port/scripts/docsize.mjs`: each a tripwire above the new size, with its reason?

**Not a finding (D56):** a problem that lives only in data already stored. Not a finding either: a checklist's length
or style as such (D141 — no size targets).

**Report:** findings first, most serious first — each with the ruling or old passage, the line (file and a few words
to find it), what the old text or full row requires, what the checklist says, a concrete fix in one sentence, and a
severity (high: an agent following the checklist would do what he ruled against or skip what he ruled for; medium: a
condition or scope bent; low: wording or citation). Then: how many requirements you checked, and which files you found
whole. Plain words.
