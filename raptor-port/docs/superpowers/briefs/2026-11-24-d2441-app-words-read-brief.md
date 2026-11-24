# Brief — the read of a working-guide change: D2441, Fable adjusts the app's words (24 Nov 26)

You are one of two readers of this change, each blind to the other (D1761). Read-only: change no file. Do not read
`HANDOFF.md`, any other reader's report for this job, or the earlier brief for D2440.

## What to read

The newest commit on branch `claude/fable-rule-stands`: `git diff HEAD~1 HEAD`, leaving out this brief. It does two things:

1. **States a new ruling, D2441:** the words people read in the app are drafted by Opus, then reviewed and adjusted by a
   fresh Fable helper.
2. **Reconciles the guides with D2258 and D2440** (the agent picks Fable for the work it ranks high risk, with no end
   date): who plans and builds that work, who designs its walk scenarios, and who reads a fix round.

His words and the readings: `grep -h '^| D2441 |' .claude/decisions-full/*.md` (the shell). The rulings it rests on — open
each full row the same way: D2440, D2258, D2257, D2269, D903, D2085, D2224, D2236, D1625, D808, D835, D2148.

## The questions — a narrow read (D70, D1761)

1. **Meaning.** Does each changed sentence say what those rulings mean, no more and no less? Does D2441's text, or a
   reading in its row, claim anything his words do not support?
2. **Contradiction.** Does any changed sentence contradict another guide, rule file or live ruling? Search for the
   subject — who writes the app's words, who builds high-risk work — and name any place that still states the older rule.
3. **Safeguards.** Is any safeguard dropped or weakened: the fresh, blind Opus read; Astra's read; the reads-owed list;
   never the chat that wrote it; Sol 6.1 only on his call; a mock-up before anything new on screen; the writing guide?
4. **The trims.** The project guide's MODELS line was shortened to stay within 350 characters. Would a chat following it
   do anything different from the rulings?
5. **Bulk.** Does any change add words that are not needed where they sit?

## What counts

A finding is concrete: the file and sentence, what it would make a chat do wrong, its cause, and the exact rewording
(D489). Not findings: a problem that lives only in data already stored (D56); his personal instructions file, which is
not in the project (D2254); the overnight guide's "Fable only on his word", left on purpose for its next review (skill
note 1029); the unmarked rows of D903 and D2085, which carry a pointer on purpose.

## The report

Findings first, ranked by harm, each with its file, the sentence, the failure and the fix. Then, in one line each, what
you checked and found sound. Say plainly if you found nothing.
