# Write his rulings down — at the moment he says them

Unscoped, so it loads before any project file. The record is one file per AREA under
`.claude/rules/decisions/`, with `DECISIONS.md` at the repo root as the front door and map (D137 — the last
section below), and `.claude/hooks/record-decisions.sh` fires this check on every message he sends.

## The lapse this exists to stop

The story behind this rule — two misses of one evening, 21 Sep 26 (D13), and why the lapse is misclassifying, not forgetting — is kept whole in `raptor-port/docs/guide-full.md` §Write his rulings down at the moment (D1556).

## The rule

**The moment he states something that outlives the current task, add it to its area's rulings file
BEFORE doing the work it implies** (the three steps are at the head of `DECISIONS.md`). Not after the
work, not at the end of the session, not "once I see where it lands".

What counts: a ruling, a product decision, a correction to how you work, a preference, a "leave
it", an explicit no, a supersession of an earlier ruling, an answer to a question you put to him.

What does not: ordinary task instructions ("run the tests", "check that file", "push it"). Those
die with the task and belong nowhere.

**Every entry names the file that will now carry it — and then you make that file carry it, with its D-number
beside the ruling there** (the gate fails a new row whose Markdown home never mentions its number — `[RULING-HOMES-AUDIT]`,
28 Sep 26: one row's "corrected" home had never been corrected, and only reading found it).
The rulings list is an INDEX, never the only home. A ruling recorded only there is still lost,
because nobody reads an index while building. The home is the document the next session will
actually open: the behaviour register, `engine-rules.md`, `ui-contracts.md`, the standing order,
the area file, or `raptor-port/CLAUDE.md` if EVERY task needs it (`doc-structure.md`). **Never `OUTSTANDING.md` alone** (D29 rule 2, 23 Sep 26): the backlog
is where finished work leaves from, so a ruling homed only there is one archive pass from lost.

**Put it where it BELONGS, not where you happen to be working.** That is the specific error both
misses shared.

## Two catches, because the moment will sometimes be missed

1. **The checkpoint sweep.** Before any handoff, any commit that closes a piece of work, and any
   report that calls something done: re-read what he actually said this session, list every ruling,
   and check each one is in its area's rulings file **and** in its real home — and that every ruling
   it REPLACED or RESTATES IN FULL (D971), and every one-off permission it SPENT, is marked and archived (`DECISIONS.md` step 2).
   This is what catches what the moment missed.
2. **The report line.** Every closing report carries, beside Status / Changes / Checks / Walk:

   `Rulings: <n> recorded → <area file(s)> (D<x>–D<y>)` — or `Rulings: none this session`.

   A field that cannot be filled without doing the thing makes a miss visible to HIM, not just to
   you. That is the same shape as the `Walk:` line, and for the same reason.

## When a ruling overwrites another — fix what it leaves behind (D201, 26 Sep 26)

**Owner:** *"every new ruling if it overwrites the old ones make sure u fix the things u mentioned."* The later ruling wins
(D90) — but the older one lives on in every file that still states it, in the app that still does it, and by its absence
from the lists that should carry the new one. Nobody reading those later knows the rule changed. So, **in the same change
that records the ruling**:
1. **The documents.** Search for the rule's SUBJECT (the thing it governs — "own row", "change history", "OIL award"), not
   only its D-number, across `raptor-port/docs/` (the reference docs, `data-model.md` and its §11 permissions table,
   `handover-dataverse.md`, specs, look cards), code comments and test names. Correct each, or mark it with a pointer.
2. **The app.** If the app does not yet do what the new ruling says, file the build in `OUTSTANDING.md` with its place.
3. **The lists.** Add the ruling to every list it belongs in that does not carry it (the permissions table, a register).

The new row's "Where it lives now" names what was fixed and what was filed. A change inside `raptor-port/src` still never
trims a document (D29) — a correction is not a trim.

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

**Owner, 22 Sep 26 (D53):** *"God dam why u need me to tell u 3 times to find the mock up? Is it because
u didn't save this to outstanding?"* — the answer was no. Saving was never the problem.

### The check

**Before you tell him something is undecided, before you put ANY choice to him, and before you call
anything missing or unbuilt: search the rulings and the backlog** — `.claude/rules/decisions/` (every
area, not only the ones loaded: an area loads only when one of its files is READ, so a notes-only or
design session has none of them), **the full rows in `.claude/decisions-full/`** (a short line is the rule; his
words, its conditions and its readings are only there — D390), `DECISIONS-ARCHIVE.md` and `OUTSTANDING.md`. Not
the code. Not the specs folder. Those, by keyword, every time — with the SHELL's grep: the Grep tool prints
"[Omitted long matching line]" for a full row, and a search that returned no text is not a read. It costs one search.

The three failures that made this check, and why a code comment is never evidence about today (the rulings win; fix the comment in the same change): kept whole in `raptor-port/docs/guide-full.md` §Write his rulings down at the moment (D1556).

## Keeping the list whole, and read by relevance (D136, D137, D390) — moved whole to `raptor-port/docs/doc-budget.md` §5 (D1556)
