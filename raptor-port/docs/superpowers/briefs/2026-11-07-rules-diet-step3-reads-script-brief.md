# Brief — the fresh read of `docsize --reads` taught step 3's reads by section (7 Nov 26)

**You are one fresh reader (his D1736: a change to the document check or its scripts is tested, its self-test gains a
case, and one fresh reader reads it before it is switched on).** Read only; change no file; commit nothing.

**What changed** (uncommitted in the worktree: `git diff -- raptor-port/scripts/docsize-reads.mjs
raptor-port/scripts/docsize-selftest.mjs`). `docsize --reads` (`node raptor-port/scripts/docsize.mjs --reads --verbose`)
is a report of what a chat reads, in tokens — never a gate (D141). The rules diet's step 3 (his D1735; plan
`raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §1, §4, §5, §6) now has three documents read by
section, and the measure's check reads (`CHECK_READS`) were taught to count the parts instead of the whole files. Some
parts are no heading of their own, so `partOf` gained `spans` (from one line start to the line before another), `rows`
(one table row) and `grep` (the text `grep -o` prints), any of them together, each line counted once; `measure` names the
parts and reports a missing one.

**What to check:**
1. **`partOf` is right:** the boundary rule ("**7.0" never takes "**7.0a"; "**7.1" never takes "**7.10"; "## 1." never
   "## 10."), fenced lines, a span's missing from or to, overlapping parts counted once, the order of the text, the grep
   (does it read as `grep -o` would — a pattern with `^`, the `u` flag, an empty match), and the old behaviours unchanged
   (`upTo` alone; `sections` alone; no options). Does `measure` say "counted whole" and "counted as nothing" truthfully in
   every case, and name the parts right?
2. **The reads match the documents:** each new entry in `CHECK_READS` against what the documents now say is read —
   the bug-check order's parts against `raptor-port/docs/bug-check-checklist.md` for a WALK of a screen (the entry's
   `why` says what it leaves out and why: is that fair, and is anything a WALK reads missing or anything a WALK does not
   read counted?); the design guide's against `.claude/rules/ui-design.md` §Which part of the guide to open; the ripple
   map's against the note under `raptor-port/docs/feature-impact.md`'s title. Run the measure and look for `NOTE:` lines.
   Each entry is one stated case, not every job: say whether its case is a fair and honest one to report to him.
3. **The self-test cases pin it:** the new `reads(...)` cases in `raptor-port/scripts/docsize-selftest.mjs` (after
   "a heading is matched to a boundary"): would each fail if the code it guards were wrong? Name any behaviour of the new
   code that no case would catch. The full self-test takes several minutes and is run by the host — to try a case
   yourself, write a small script file in your own temp folder that imports `partOf` / `measure` from
   `raptor-port/scripts/docsize-reads.mjs` and run it with node (an inline `node -e` loses escapes in Git Bash).

**Not a finding:** a size; style you would merely prefer. **A finding is a claim with a concrete failure** (an input
and the wrong figure or label it gives), **its cause and its fix** (D489).

**Report:** findings ranked high / medium / low, each with file, line, the failing input, and the fix; then what you
checked and found right. Plain prose, no preamble.
