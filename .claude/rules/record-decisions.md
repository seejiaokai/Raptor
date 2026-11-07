# Write his rulings down — at the moment he says them

Unscoped, so it loads before any project file. The record is one file per area under `.claude/rules/decisions/`, with
`DECISIONS.md` at the repo root as the front door and map (D137), and `.claude/hooks/record-decisions.sh` fires this
check on every message he sends.

## The lapse this exists to stop

A ruling stated mid-task is absorbed into the work and feels handled: the lapse is misclassifying, not forgetting (D13,
D137). The story — two misses of one evening, 21 Sep 26 — is kept whole in `raptor-port/docs/guide-full.md` §Write his
rulings down at the moment (D1556).

## The rule

- **The moment he states something that outlives the current task, add it to its area's rulings file before doing the
  work it implies** — not after the work, not at the end of the session, not "once I see where it lands" (D13, D137).
  The three steps — and, for an area converted to a page, its own steps — are at the head of `DECISIONS.md`.
- Ask it of every message he sends: the hook asks it each time, and without hooks (Codex) you ask it yourself.
- What counts: a ruling, a product decision, a correction to how you work, a preference, a "leave it", an explicit no,
  a supersession of an earlier ruling, an answer to a question you put to him.
- What does not: ordinary task instructions ("run the tests", "check that file", "push it") — they die with the task
  and belong nowhere.
- **Every entry names the file that will now carry it — and then you make that file carry it, with its D-number beside
  the ruling there.** The gate fails a new row whose Markdown home never mentions its number ([RULING-HOMES-AUDIT]).
- The rulings list is an index, never the only home: a ruling recorded only there is still lost, because nobody reads
  an index while building. The home is the document the next session will actually open — the behaviour register,
  `engine-rules.md`, `ui-contracts.md`, the standing order, the area file, or `raptor-port/CLAUDE.md` if every task
  needs it (`doc-structure.md`).
- **Never `OUTSTANDING.md` alone:** the backlog is where finished work leaves from, so a ruling homed only there is one
  archive pass from lost (D29 rule 2, D137).
- **Put it where it belongs, not where you happen to be working** — the error both misses shared.

## Two catches, because the moment will sometimes be missed

1. **The checkpoint sweep.** Before any handoff, any commit that closes a piece of work, and any report that calls
   something done: re-read what he actually said this session, list every ruling, and check each one is in its area's
   rulings file **and** in its real home — and that every ruling it replaced or restates in full (D971), and every
   one-off permission it spent, is marked and archived (`DECISIONS.md` step 2).
2. **The report line.** Every closing report carries, beside Status / Changes / Checks / Walk:
   `Rulings: <n> recorded → <area file(s)> (D<x>–D<y>)` — or `Rulings: none this session`. A field that cannot be
   filled without doing the thing makes a miss visible to him, not just to you — the same shape as the `Walk:` line.

## When a ruling overwrites another — fix what it leaves behind (D201)

The later ruling wins (D90, D201) — but the older one lives on in every file that still states it, in the app that still
does it, and by its absence from the lists that should carry the new one. So, in the same change that records the
ruling:
1. **The documents.** Search for the rule's subject (the thing it governs — "own row", "change history", "OIL award"),
   not only its D-number, across `raptor-port/docs/` (the reference docs, `data-model.md` and its §11 permissions
   table, `handover-dataverse.md`, specs, look cards), code comments and test names. Correct each, or mark it with a
   pointer.
2. **The app.** If the app does not yet do what the new ruling says, file the build in `OUTSTANDING.md` with its place.
3. **The lists.** Add the ruling to every list it belongs in that does not carry it (the permissions table, a register).

The new row's "Where it lives now" names what was fixed and what was filed. A change inside `raptor-port/src` still never
trims a document (D29, D137) — a correction is not a trim.

## If you notice a ruling you never recorded

Say so plainly and record it, however old. Never fold it in quietly: he cannot tell a ruling that was captured from one
that merely got done.

## Read it before you ask him anything

Writing a ruling down is half the rule; reading it is the other: on 22 Sep 26 a design ruled on four times (D38–D41) was
put to him as an open question, answered from a code comment gone stale the same afternoon (D53, D137).

### The check

- **Before you tell him something is undecided, before you put any choice to him, and before you call anything missing
  or unbuilt: search the rulings and the backlog** — `.claude/rules/decisions/` (every area, not only the ones loaded:
  an area loads only when one of its files is read, so a notes-only or design session has none of them), the full rows
  in `.claude/decisions-full/` (a short line — or a page's line once its area converts — is the rule; his words, its
  conditions and its readings are only there — D390, D1735), `DECISIONS-ARCHIVE.md` and `OUTSTANDING.md` (D53, D137).
- Not the code. Not the specs folder. Those, by keyword, every time — with the shell's grep: the Grep tool prints
  "[Omitted long matching line]" for a full row, and a search that returned no text is not a read. It costs one search.
- A named entry is a pointer, not a scope; the backlog is read every time; search for a claim's subject, never its
  phrasing; a code comment is never evidence about today — the rulings win, and the comment is fixed in the same change.
  The three failures behind these are kept whole in `raptor-port/docs/guide-full.md` §Write his rulings down at the
  moment (D1556).

## Keeping the list whole, and read by relevance (D136, D137, D390) — moved whole to `raptor-port/docs/doc-budget.md` §5 (D1556)

## The old wording of this file, its stories and worked examples with it — moved whole to `raptor-port/docs/archive/rule-files-2026-11-08.md` (D138, D1735)
