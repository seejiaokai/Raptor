# Blind read — the trimmed Screen design rules page against its account by requirement (chat 36, 8 Nov 26)

Repo (a git worktree; run every command from here): `C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2`

You are a fresh reader. You have not seen how the page was trimmed or why; judge only what is on the page now.

## What happened
The screen-design rulings page `.claude/rules/decisions/design.md` (a page of how a screen looks and behaves now, each rule
stated once with its rulings cited after it; the full rows in `.claude/decisions-full/design.md`) was trimmed from 42,088
bytes to under the size of the one-line list it replaced (22,050 bytes as the plan measured it; 22,409 by the time the
page landed, two rulings later), on the owner's ruling D1932: no rule, condition, exception or citation may be dropped.
Read D1932's row first: `grep -h '^| D1932 |' .claude/decisions-full/*.md`.

## What the trim was ALLOWED to do (not findings)
- "From other areas" is now bare pointer lines: another area's ruling named by number, stated on its own area's file.
  A pointer losing its gloss is not a finding. A NUMBER that was on the page before and is gone now IS a finding.
- The agent's readings (sentences the old page framed "as built, and put to him as readings" / "the agent's reading,
  not checked with him") were moved back to the full rows, which already held them; the page keeps his rule. A reading
  absent from the page but present in its full row is not a finding. A reading absent from BOTH is a finding.
- The "Settled" list was shortened to pointers naming the design of record; a settled item's document path and its
  "leave it" must still be there.
- Wording was tightened and bullets merged; a merged bullet must still carry every cited number of both.
- The design guide's worked examples (a row's non-bold text repeating the guide) may go where the guide
  (`raptor-port/docs/design-practices.md`) still carries them; a condition, an exception, a scope, a wording shown on
  screen, a measurement or a number he would act by may not.

## Your job
Check the page, requirement by requirement, against its account:
`raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-design-account.md` — the account of every screen-design
ruling split into parts, each part mapped to the page line that stated it (as of 8 Nov 26, before the trim) or marked
spent, detail or superseded, with gap tables whose "Fixed:" notes say what the page was made to carry. Also compare
with the page BEFORE the trim: `git show c8a52c3ea:.claude/rules/decisions/design.md`, and the old one-line list:
`git show 0245d5d81:.claude/rules/decisions/design.md` (on Windows Git Bash set `MSYS_NO_PATHCONV=1` first). Where the
account marks a part as a reading ("r" before it), confirm the full row holds it
(`grep -h '^| D<n> |' .claude/decisions-full/design.md`, or the area's file for another area's ruling).

Report every place where the trimmed page:
1. no longer states a requirement the account says the page carried (a rule, a condition, an exception, a scope, a
   wording shown on screen, a control's name, a measurement or number he would act by);
2. states a requirement with a changed meaning (wider, narrower, the other way round);
3. lost a citation (a D-number present before and absent now, anywhere on the page);
4. states as his rule something the account marks as an agent's reading;
5. is wrong against a full row (read the pointers' rulings in their own areas too — the earlier reads found the
   cross-area bends there: `.claude/rules/decisions/how-we-work.md`, `scheduler.md`, `oil.md`, `inputs.md`,
   `leave-war.md`, `tracker.md`, `people-accounts.md` — a pointer line's numbers must each be STATED on that area's own
   file; one stated nowhere that loads is a finding).

## Report format
For each finding: severity (high / medium / low), the ruling number(s), what the account or the row says (quote the
part), what the page says now (quote the line's first words), and the smallest fix in words. Then one paragraph on
anything you could not decide. No fix is to be made by you — change no file. At most 1,500 words.
