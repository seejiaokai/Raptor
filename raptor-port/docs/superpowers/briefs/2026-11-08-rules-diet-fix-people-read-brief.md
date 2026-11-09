# Blind read — the trimmed People & accounts rules page against its account by requirement (chat 36, 8 Nov 26)

Repo (a git worktree; run every command from here): `C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2`

You are a fresh reader. You have not seen how the page was trimmed or why; judge only what is on the page now.

## What happened
The People & accounts rulings page `.claude/rules/decisions/people-accounts.md` (a page of how accounts, sign-in, the
roster, postings, archive, restore and delete work now, each rule stated once with its rulings cited after it; the full
rows in `.claude/decisions-full/people-accounts.md`) was trimmed from 50,556 bytes towards the size of the one-line list
it replaced (21,160 bytes), on the owner's ruling D1932: no rule, condition, exception or citation may be dropped. It
stands at 26,796 bytes — the owner will choose between raising the limit and returning some conditions to the rows; your
read judges what is on the page now. Read D1932's row first: `grep -h '^| D1932 |' .claude/decisions-full/*.md`.

## What the trim was ALLOWED to do (not findings)
- "From other areas" is now bare pointer lines: another area's ruling named by number, stated on its own area's file.
  A pointer losing its gloss is not a finding. A NUMBER that was on the page before and is gone now IS a finding.
- The agent's readings (sentences the old page framed "as built, and put to him as readings" / "the agent's reading,
  not checked with him") were moved back to the full rows, which already held them; the page keeps his rule. A reading
  absent from the page but present in its full row is not a finding. A reading absent from BOTH is a finding.
- The "Settled" list was shortened to pointers naming the design of record; a settled item's document path and its
  "leave it" must still be there.
- Wording was tightened and bullets merged; a merged bullet must still carry every cited number of both.
- Frontmatter path lines wholly covered by another pattern on the same list were removed — not findings.

## Your job
Check the page, requirement by requirement, against its account:
`raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step5a-people-account.md` — the account of every People &
accounts ruling split into parts, each part mapped to the page line that stated it (as of 8 Nov 26, before the trim) or
marked spent, detail or superseded, with gap tables whose "Fixed:" notes say what the page was made to carry. Also
compare with the page BEFORE the trim: `git show 991a2bb70:.claude/rules/decisions/people-accounts.md`, and the old
one-line list: `git show 97eaa5251:.claude/rules/decisions/people-accounts.md` (on Windows Git Bash set
`MSYS_NO_PATHCONV=1` first). Where the account marks a part as a reading ("r" before it), confirm the full row holds it
(`grep -h '^| D<n> |' .claude/decisions-full/people-accounts.md`, or the area's file for another area's ruling).

Report every place where the trimmed page:
1. no longer states a requirement the account says the page carried (a rule, a condition, an exception, a scope, a
   wording shown on screen, a control's name, a number he would act by);
2. states a requirement with a changed meaning (wider, narrower, the other way round);
3. lost a citation (a D-number present before and absent now, anywhere on the page);
4. states as his rule something the account marks as an agent's reading;
5. is wrong against a full row (read the pointers' rulings in their own areas too — the earlier reads found the
   cross-area bends there: `.claude/rules/decisions/leave-war.md`, `scheduler.md`, `tracker.md`, `inputs.md`,
   `design.md`, `how-we-work.md` — a pointer line's numbers must each be STATED on that area's own file; one stated
   nowhere that loads is a finding).

Exclusion (D56): a problem that lives only in data already stored, with the code correct going forward, is not a finding.

## Report format
For each finding: severity (high / medium / low), the ruling number(s), what the account or the row says (quote the
part), what the page says now (quote the line's first words), and the smallest fix in words. Then one paragraph on
anything you could not decide. No fix is to be made by you — change no file. At most 1,500 words.
