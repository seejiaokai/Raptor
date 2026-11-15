# Part 5's read — the project guide's "Product invariants" line (D2024), chat 79, 15 Nov 26

A read of a working-guide change (D70, D1761, D1770): one round, by Astra and by a fresh, blind Opus reader, each blind to
the other and to the writer. **Read only — change no file, commit nothing.** Repo root: `C:\Users\User\projects\Raptor`,
branch `claude/rules-check-batch2`.

## What changed

1. `raptor-port/CLAUDE.md` §Stable decisions → "Product invariants" (its first item). See it with
   `git diff origin/main...HEAD -- raptor-port/CLAUDE.md`. Old: "no rule versioning (narrowed 26 Sep 26 by D186: a
   published day keeps the brief lead it printed, with it — one printed value, not a versioned rulebook)". New: "a
   published day keeps the Logic settings it went out with — the brief lead it printed (D186), every setting its checks
   read (D2005) and its OIL's three values (D592, D2044); a changed setting reaches it from its next amendment, a changed
   OIL value reading pending at once; the old "no rule versioning" is set aside (D2024)".
2. The lines it left stale, corrected in the same change: `.claude/rules/decisions/scheduler.md` §Settled, the D186
   "Keep it:" line, and §Publishing, amendments and signing, the "A Logic change never starts a flag on a published day"
   line (`git diff origin/main...HEAD -- .claude/rules/decisions/scheduler.md`); the comment in
   `raptor-port/src/engine/publish.ts` `freezeWarn` (`git diff origin/main...HEAD -- raptor-port/src/engine/publish.ts`).

## The rulings it must state truly

Open each full row (Git Bash, from the repo root): `grep -h '^| D186 |' .claude/decisions-full/*.md` — and the same for
D2005, D592, D2044, D2024, D1991, D2013. Read the whole row, including any NARROWED / ANSWERED marks.

## The questions — answer each, with the exact words at issue

1. Does each changed line say what D186, D2005, D592, D2044 and D2024 mean — no more, no less? In particular: is "a
   changed setting reaches it from its next amendment" true for every setting (D2005; D2013's "as built" detail about the
   working copy), and is "a changed OIL value reading pending at once" true for all three OIL values (D2044) and only
   where the change would move that day's OIL?
2. Does any change drop a safeguard the old wording carried (a rule a future agent would now miss or read more loosely)?
3. Does any change contradict another ruling, another line of the same page, or the code it describes? Check the claim
   against the engine where you can (`raptor-port/src/engine/faceattrs.ts` `KEPT_RULE_KEYS`, `oilev.ts`, `publish.ts`).
4. Does it add bulk — words that carry nothing a fresh model would get wrong untold?
5. Is the scheduler page's D186 line now consistent with the same page's other lines (it still says "a published day's
   crew rest is to be measured to that printed brief … — [RULES-CHECK-FIXES]" — built or not? check D1991's row and the
   code)?

**Not a finding:** anything that lives only in data already stored (demo data, cleared before the database step — D56).
A finding needs a concrete wrong reading, its cause, and the exact replacement words. Say "none" where there is none.
Report in plain prose, findings first, most serious first; at most about 600 words.
