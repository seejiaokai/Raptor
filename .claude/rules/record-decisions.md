# Write his rulings down — at the moment he says them

Unscoped, so it loads before any project file. The record is `DECISIONS.md` at the repo root, and
`.claude/hooks/record-decisions.sh` fires this check on every message he sends.

## The lapse this exists to stop

**Owner, 21 Sep 26:** *"This is a recurring problem. Whenever we discussed something important to
note down. I dont see u noting them down. How do we fix your behavior lapse?"*

He is right, and the cause is **not forgetting — it is misclassifying.** A ruling stated mid-task
gets read as an instruction for the work in front of you. You execute it correctly, and that feels
like it has been handled. **The work absorbing a ruling is not the record keeping it.** Because the
work comes out right, nothing feels missing, so the lapse repeats and is only ever caught when he
asks.

Two from one evening, both caught only because he asked: his instruction that the bug-check order
must fire itself went into the reminder file that happened to be open at that moment, not into the
order where it belonged; his ruling that it supersedes the earlier methods went into a commit
message and a memory, not into the document.

## The rule

**The moment he states something that outlives the current task, append it to `DECISIONS.md`
BEFORE doing the work it implies.** Not after the work, not at the end of the session, not "once I
see where it lands".

What counts: a ruling, a product decision, a correction to how you work, a preference, a "leave
it", an explicit no, a supersession of an earlier ruling, an answer to a question you put to him.

What does not: ordinary task instructions ("run the tests", "check that file", "push it"). Those
die with the task and belong nowhere.

**Every entry names the file that will now carry it — and then you make that file carry it.**
`DECISIONS.md` is an INDEX, never the only home. A ruling recorded only there is still lost,
because nobody reads an index while building. The home is the document the next session will
actually open: the behaviour register, `engine-rules.md`, `ui-contracts.md`, the standing order,
`CLAUDE.md` §Stable decisions. **Never `OUTSTANDING.md` alone** (D29 rule 2, 23 Sep 26): the backlog
is where finished work leaves from, so a ruling homed only there is one archive pass from lost.

**Put it where it BELONGS, not where you happen to be working.** That is the specific error both
misses shared.

## Two catches, because the moment will sometimes be missed

1. **The checkpoint sweep.** Before any handoff, any commit that closes a piece of work, and any
   report that calls something done: re-read what he actually said this session, list every ruling,
   and check each one is in `DECISIONS.md` **and** in its real home. This is what catches what the
   moment missed.
2. **The report line.** Every closing report carries, beside Status / Changes / Checks / Walk:

   `Rulings: <n> recorded → DECISIONS.md (D<x>–D<y>)` — or `Rulings: none this session`.

   A field that cannot be filled without doing the thing makes a miss visible to HIM, not just to
   you. That is the same shape as the `Walk:` line, and for the same reason.

## If you notice a ruling you never recorded

Say so plainly and record it, however old. Do not quietly fold it in — he has no way to tell the
difference between a ruling that was captured and one that merely got done, and that ambiguity is
the whole problem.

## READ IT BEFORE YOU ASK HIM ANYTHING (added 22 Sep 26)

The rule above is the WRITING half, and it works — on 22 Sep 26 an approved design was saved to
`docs/mock/`, ruled on four times in `DECISIONS.md` (D38–D41) and filed in `OUTSTANDING.md` as the
next job. Every one of those records was correct and current.

**And the agent still told the owner no design existed, and put the settled question to him as an
open choice.** It answered from a CODE COMMENT that had gone stale the same afternoon. He had to
ask three times before it searched the record.

**Owner, 22 Sep 26:** *"God dam why u need me to tell u 3 times to find the mock up? Is it because
u didn't save this to outstanding?"* — the answer was no. Saving was never the problem.

### The check

**Before you tell him something is undecided, before you put ANY choice to him, and before you call
anything missing or unbuilt: search `DECISIONS.md` and `OUTSTANDING.md`.** Not the code. Not the
specs folder. Those two files, by keyword, every time. It costs one search.

Three failures made it, and each one is worth recognising on sight:

1. **A handoff that names specific entries** ("read D48–D49") is a POINTER, not a scope. Grepping
   for exactly those two and stopping leaves every other live ruling unread. Read the file.
2. **`OUTSTANDING.md`'s read-trigger was scoped to "resuming parked work"**, and a session that
   thinks it is "continuing a build" will skip it. It is now UNCONDITIONAL: read it whenever you
   are about to ask him something or report something as absent.
3. **Searching for the words the stale comment used can only CONFIRM it.** Searching for the THING
   ("mock", "window", the feature's name) is what disconfirms. When you are checking whether a
   claim is still true, search for its subject, never its phrasing.

**A code comment is dated the moment it is written.** "Not yet ruled", "TODO", "the owner has not
picked" — none of it is evidence about today. The rulings file is. Where the two disagree, the
rulings file wins and **you fix the comment in the same change** (the newest-instruction-wins rule
already says so).
