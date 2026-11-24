# The checking fix — readers' brief (chat 173, 24 Nov 26; his D2567, D2610)

You are a blind reader. Read-only: change no file, commit nothing. **Do not open** any file named
`*-build-report.md`, `*-read-astra*`, `*-read-opus*`, `*-read-fable*` — other readers' and the builder's words.

**What you read:** the commit `2e9a83d0e` on this branch (`git show 2e9a83d0e --stat`, then each file's diff) —
a change to working guides and rules (DECISIONS.md, `.claude/rules/raptor-executor.md`, `ui-design.md`,
`record-decisions.md`, `raptor-port/docs/bug-check-order.md` and its checklist) and a new check
(`raptor-port/scripts/readings.mjs`, its tests, its wiring into `docsize.mjs`, `docsize-selftest.mjs`,
`package.json`, `.github/workflows/docs-guard.yml`). Its approved plan:
`raptor-port/docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md` (§C, as revised in §E). The lapse it
answers: `raptor-port/docs/bug-check-order.md` §7.11 lesson 32 (the case text).

**The narrow brief for the guide changes (D70, D1761):** does each change say what the plan and the lesson meant;
does it contradict a guide or a ruling (`.claude/rules/decisions/how-we-work.md`, `.claude/rules/bug-check.md`,
`.claude/rules/shipping.md`, `AGENTS.md`); does it drop a safeguard; does it add bulk his rules forbid (each rule
concise and stated once, D1987, D2460); did lesson 32's case text stay byte for byte, and does its folded "Lesson:"
sentence lose any of the four rules it held.

**For the check (code):** does it do what C7 says — list every `READING, OPEN` mark in the full rows and every
`READING D<n>` tag under `raptor-port/src`; fail on a tag whose row has no mark; fail on a free-text reading phrase
on a line the branch adds under `src` with no tag? Concrete failures only: a false pass (a lapse like the 22 Nov
comment slipping through — e.g. a different phrasing, a test file, a renamed file, a line moved), a false fail that
would block ordinary work, and how it behaves on other open branches that bring `main` in after it merges (they
add "the agent's reading" comments often — would each such branch now fail, and is that what the plan wants?).
Also: the base it measures against (this branch is cut from an unmerged branch; its 9 failures come from that
branch's lines — is the behaviour on `main` correct?).

**Not findings:** problems only in data already stored (D56); tidiness without a failure. A finding counts only
with a concrete failure, its cause and its fix (D489); rank must-fix / should-fix / minor. At most ~700 words.
