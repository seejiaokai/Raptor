# Brief — one fresh, blind read of the draft overnight command (`[OVERNIGHT-SKILL]`, D859)

**Reader:** one fresh Opus reader that did not write the draft (D70; D810's way while the ChatGPT readers are out).
**Read-only:** change no file, commit nothing. Return the whole report as your answer.

## What it is

The owner (non-technical) asked on 14 Oct 26 that the questions he asks every night before he sleeps become one command
(D859). The draft is a working guide — a skill — that the agent follows when he types `/overnight`:
`raptor-port/docs/superpowers/specs/2026-10-15-overnight-skill-draft.md`. It is not installed; your read comes before
he approves its wording.

## Read first, whole

1. The draft.
2. The full rows of the rulings it rests on — the shell, not the Grep tool (a long row is hidden there):
   `grep -h '^| D596 \|^| D667 \|^| D766 \|^| D856 \|^| D857 \|^| D858 \|^| D859 \|^| D853 \|^| D541 \|^| D790 \|^| D822 \|^| D864 \|^| D151 \|^| D228 \|^| D761 \|^| D368 ' .claude/decisions-full/*.md`
3. `.claude/rules/doc-structure.md` §In his workflow (the "Unattended runs" bullet); `.claude/rules/shipping.md`
   ("Done" means LIVE; The checks); `.claude/rules/plain-language.md`.
4. `.claude/skills/session-handoff/SKILL.md` (the draft hands the morning block to it).
5. `raptor-port/docs/bug-check-order.md` §0a and §5 only.
6. In `.claude/skill-observations/log.md`: observations 591 and 594.

## What to do — run the guide, do not only read it

1. **The night of 14 Oct 26, replayed.** The repo as it stood before that night: `git show 1d29b83c8:HANDOFF.md` and
   `git show 1d29b83c8:OUTSTANDING.md` (on Windows Git Bash prefix `MSYS_NO_PATHCONV=1`). Write the Part 1 message the
   guide would have produced that night. Compare it with what actually happened (rows D856–D858; the block at
   `git show 81b65274b:HANDOFF.md`). Where they differ, say which was right and why.
2. **Tonight.** The repo as it is now (`main`). Write the Part 1 message the guide would produce tonight, from
   `HANDOFF.md` and `OUTSTANDING.md`'s priority list. Name any job you could not classify by the guide's three lists alone.
3. **Break it.** Construct a case where following the guide to the letter leads the agent to (a) assume a permission he
   did not give, (b) merge or change the live app, (c) answer a product choice for him, or (d) lose work at a
   compaction. Give the case, and the exact wording that closes it.
4. **Faithful to his rulings.** Every rule the draft states: is it supported by a ruling or a standing rule, and does it
   contradict a newer one (the newer wins — D90)? Anything the rulings require of an unattended run that the draft
   leaves out?
5. **The commands it names** — run each read-only one once and say whether it does what the draft says.
6. **His reading.** Part 1's message and the morning report reach a non-technical owner: do the draft's instructions
   produce messages he can act on in a minute?

## What counts as a finding (D489)

A finding has a concrete failure (what goes wrong, on which night, for whom), its cause in the draft's text, and the
exact replacement wording. Style preferences without a failure are not findings — list them separately, briefly, if at
all. A problem that lives only in data already stored, while the code is correct going forward, is not a finding (D56)
— not expected to arise here.

## Report

Findings first, most serious first, each with its fix wording. Then the two Part 1 messages you wrote (tasks 1 and 2).
Then what you did not check.
