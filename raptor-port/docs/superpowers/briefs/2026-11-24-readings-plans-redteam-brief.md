# Red team of two plans — brief (chat 173, 24 Nov 26)

You are a blind red-team reader. Read-only: change no file, commit nothing. Do not read any other reader's report (none exist yet; ignore any file named *-read-astra*, *-read-opus*).

Working copy: the repo root you are in. The two plans:
1. raptor-port/docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md — the fix to the checking METHOD after a builder's reading of a ruled word ("planned", in the SANS reminder) passed as the owner's rule through the build, four rounds of blind reads and three walks (the lesson: raptor-port/docs/bug-check-order.md §7.11 lesson 32, ~line 1218).
2. raptor-port/docs/superpowers/plans/2026-11-24-rulings-audit-plan.md — an audit of designs, the app's words and builders' readings in code comments against the owner's rulings.

The owner's ruling (full row: shell `grep -h '^| D2567 \|^| D2564 ' .claude/decisions-full/*.md`): Fable plans and reviews, Opus does the work; fix the lapse, the rules made clearer if needed; audit what has been designed and the app's words against his rulings.

His standing constraints on rule text: every rule concise, few words (D1987); each rule stated once, in one place, the always-loaded files kept short (D2460, D1735); no rule dropped; a rule that rewrites/shortens another must not change its meaning. Area rule pages are under .claude/rules/decisions/; how readers and builders work: .claude/rules/decisions/how-we-work.md §Models and readers; the build policy .claude/rules/raptor-executor.md; DECISIONS.md (the steps for recording a ruling).

Answer, for EACH plan:
1. Would it actually have caught the SANS "planned" case, and the next one like it? Where could the same lapse still slip through (e.g. a reading the builder does not notice, a reading made in a drawing or in words, a reading recorded but never asked)?
2. Does any proposed change contradict a standing ruling or another guide, drop a safeguard, duplicate a rule stated elsewhere, or add bulk the owner's rules forbid? Quote the exact text.
3. Is anything over-built (a step, a script, a helper) for what it buys? Is anything missing?
4. For the audit plan: is the scope right (too wide / too narrow), the counts plausible (spot-check one or two by grep), the classification and "was he told" test sound, and the rounds to the owner workable?
A finding counts only with a concrete failure, its cause and its fix (D489). Rank findings: must-fix / should-fix / minor. Be brief: at most ~600 words in total.
