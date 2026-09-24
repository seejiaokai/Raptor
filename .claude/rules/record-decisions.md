# Write his rulings down — at the moment he says them

Unscoped, so it loads before any project file. The record is one file per AREA under
`.claude/rules/decisions/`, with `DECISIONS.md` at the repo root as the front door and map (D137 — the last
section below), and `.claude/hooks/record-decisions.sh` fires this check on every message he sends.

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

**The moment he states something that outlives the current task, add it to its area's rulings file
BEFORE doing the work it implies** (the three steps are at the head of `DECISIONS.md`). Not after the
work, not at the end of the session, not "once I see where it lands".

What counts: a ruling, a product decision, a correction to how you work, a preference, a "leave
it", an explicit no, a supersession of an earlier ruling, an answer to a question you put to him.

What does not: ordinary task instructions ("run the tests", "check that file", "push it"). Those
die with the task and belong nowhere.

**Every entry names the file that will now carry it — and then you make that file carry it.**
The rulings list is an INDEX, never the only home. A ruling recorded only there is still lost,
because nobody reads an index while building. The home is the document the next session will
actually open: the behaviour register, `engine-rules.md`, `ui-contracts.md`, the standing order,
`CLAUDE.md` §Stable decisions. **Never `OUTSTANDING.md` alone** (D29 rule 2, 23 Sep 26): the backlog
is where finished work leaves from, so a ruling homed only there is one archive pass from lost.

**Put it where it BELONGS, not where you happen to be working.** That is the specific error both
misses shared.

## Two catches, because the moment will sometimes be missed

1. **The checkpoint sweep.** Before any handoff, any commit that closes a piece of work, and any
   report that calls something done: re-read what he actually said this session, list every ruling,
   and check each one is in its area's rulings file **and** in its real home — and that every ruling
   it REPLACED, and every one-off permission it SPENT, is marked and archived (`DECISIONS.md` step 2).
   This is what catches what the moment missed.
2. **The report line.** Every closing report carries, beside Status / Changes / Checks / Walk:

   `Rulings: <n> recorded → <area file(s)> (D<x>–D<y>)` — or `Rulings: none this session`.

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
anything missing or unbuilt: search the rulings and the backlog** — `.claude/rules/decisions/` (every
area, not only the ones loaded: an area loads only when one of its files is READ, so a notes-only or
design session has none of them), `DECISIONS-ARCHIVE.md` and `OUTSTANDING.md`. Not the code. Not the
specs folder. Those, by keyword, every time. It costs one search.

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
picked" — none of it is evidence about today. The rulings are. Where the two disagree, the
rulings win and **you fix the comment in the same change** (the newest-instruction-wins rule
already says so).

## Keeping the list whole, and read by relevance (D136 + D137, 24 Sep 26)

**Owner:** *"If you archive an old ruling would it be lost and not read even tho it's applicable? … anything I change
you will have the context of the ruling."* An archived ruling a chat does not know about is one it will not look for.
So the list is **never shrunk by moving a live ruling out**: at a size budget the BUDGET rises. Only a ruling
**replaced by a later one**, or a **one-off permission once spent**, leaves — to `DECISIONS-ARCHIVE.md`, marked,
never deleted, still searched before asking him anything.

**And the same day (D137):** *"general rules should be read each session or rules that are applicable should be
read, once we venture into things concerning other areas then that should be automatically read too … I don't want
to bloat the ai to context that doesn't matter."* So the rulings are **split by area**, one file each under
`.claude/rules/decisions/` — Tracker, Leave War, Scheduler & amendments, OIL, How we work — every row keeping its date:
- **How we work loads in every session** (no `paths:`); **each other area loads by itself** when a session READS a
  file matching its `paths:` — so work that strays into a second area picks that area up too. Choose paths
  generously: a ruling missed costs more than one loaded (D68).
- **A ruling spanning two areas** sits in the one it mostly governs; the other file's "Also read" line names it.
- **Filing is mechanical** (`DECISIONS.md`, steps 1–3): a row at the top of its area's table, the replaced or spent
  row marked, then `node raptor-port/scripts/backlog-archive.mjs --rulings` moves marked rows and rewrites the map.
  `docsize` — in CI and at the end of every turn — fails on a lost or doubled D-number, a map out of step, a marked
  row still live, or a row written in `DECISIONS.md` itself. A NEW area gets its own file, `paths:` and map row.
