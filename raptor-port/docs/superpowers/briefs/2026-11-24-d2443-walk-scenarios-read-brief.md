# Read brief — D2443, every walk's scenarios designed by Astra and a fresh, blind Fable (24 Nov 26)

A working-guide change, read before his approval by two readers blind to each other (D1761, D1770): Astra and a
fresh, blind Opus reader. This is a read of documents, not code. Read only; change no file.

## What he said

*"We should also ask fable and Astra to design the walk scenarios so that is robust"* — 24 Nov 26, after being told
that a fresh Fable designs a walk's scenarios beside Astra only on the work the agent ranks high risk (D2258, D2440).

The agent's readings, recorded in D2443's full row and his to change: "the walk" is every check of the WALK or FULL
tier, so a WALK now gets a designed scenario list too (the order asked for one only on FULL); a LOOK has no walk and no
list; where Astra cannot run a fresh Opus takes Astra's seat and Fable still designs; side questions stay with one
reader (D353); a plan's red team and the code reads are unchanged.

## What to read

The change: `git diff origin/main..claude/fable-astra-scenarios` (six files). Around it, as needed:
`.claude/rules/decisions/how-we-work.md` §Models and readers; `raptor-port/docs/bug-check-order.md` §4 and §5's tier
table; `raptor-port/docs/bug-check-checklist.md` step 6; `raptor-port/docs/guide-full.md` §Models; the full rows of
D353, D2257, D2258, D2440, D2443 (`grep -h '^| D2443 |' .claude/decisions-full/*.md`).

## The questions — only these (D70)

1. Does each changed line say what D2443 means — no more, no less?
2. Does any changed line contradict another guide, rule file or live ruling? Search for other places that still say a
   walk's scenarios are designed by one reader, or by Fable only on high-risk work, and name each one the change missed.
3. Does the change drop a safeguard (a rule or check that was there before and is now gone) or add bulk?
4. Is the reading "WALK as well as FULL" a fair reading of his words, or does it go beyond them? Say which, and why.

Not a finding: wording you would merely prefer; history passages that record what was true at the time (the walk
ledger's rows, archived files); anything in data already stored (D56).

## Report

Each finding: the file and the line's words, what is wrong, the concrete fix (exact new words). If none, say so.
Write the whole report to the file path you are given, and reply with the same text.
