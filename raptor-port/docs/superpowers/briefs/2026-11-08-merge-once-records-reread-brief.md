# [MERGE-ONCE-RECORDS] — the narrow re-read of the fixes (8 Nov 26, chat 33)

Sent word for word to Astra (`codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`) and to a fresh, blind Opus
reader, each blind to the other. Reports: `2026-11-08-merge-once-records-reread-astra.md`, `…-reread-opus.md`.

---

You are a blind code reader for the Raptor repo. Read only; change no file in the repo (throwaway repos in a temp folder are fine and
encouraged — the settle step's tests build them). Nobody else's report on THIS re-read is given to you — do not look for one.

WHAT HAPPENED: the settle step for the record files (`raptor-port/scripts/records-merge.mjs`), its tests, its replay
(`records-merge-replay.mjs`) and a new skill-note number check in `raptor-port/scripts/docsize.mjs` / `docsize-rulings.mjs` were read
blind at commit `0e059ce63` by two readers; their findings are `raptor-port/docs/superpowers/briefs/2026-11-08-merge-once-records-read-astra.md`
(6) and `…-read-opus.md` (8, its finding 7 a records point handled apart). Every finding was then fixed, each red first, in the commits
`git log --oneline 0e059ce63..HEAD --no-merges` (the merges in that range only bring `main` in). The intent: the plan's last section,
`raptor-port/docs/superpowers/plans/2026-11-08-merge-once-records-plan.md` §After the red team; the original brief,
`…/briefs/2026-11-08-merge-once-records-read-brief.md`.

ASK, narrowly:
1. For each of the 13 code findings: is it truly fixed — rerun its reproduction against the current code (build the throwaway merge);
   a fix that only covers the exact example and not the shape is a finding.
2. What did the fixes BREAK or newly allow: `git diff 0e059ce63 HEAD -- raptor-port/scripts/` (ignore the `main` merges' unrelated
   files). Above all the new rules in the join of two insertions (a `## ` heading on both sides leaves the region; a shared start or end
   kept once; main's text before this branch's first new heading; blank lines only before a heading), the citation rule (rewritten only
   inside the renumbered note or a line naming its title), the stable renumber on a second run, the conflict-style retries, the
   docsize check counting across the log and every archive against the base, the fence-aware heading shared by four places, and the
   replay's new "fail on a doubled identity" rule and its exemption for a renumbered note's new number.
3. Run: `node --test raptor-port/scripts/records-merge.test.mjs` (about 2 min), `node raptor-port/scripts/docsize-selftest.mjs`,
   `cd raptor-port && npm run docsize`. Report any failure.
Severity as before: P1 a record lost, doubled, revived, mis-numbered or silently changed; P2 a wrong result caught only later, a refusal
of ordinary work, a check that passes while broken; P3 waste. Each finding with its failure, cause, proof and exact fix (D489). Then a
short "checked and sound" list. Plain text, no preamble.
