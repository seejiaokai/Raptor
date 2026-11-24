# Brief — the read of the every-chat rules' tightening (D2460, 24 Nov 26)

You are one of two readers of this change, each blind to the other (D1738, D1761). Read-only: change no file. Do not
read `HANDOFF.md` or any other reader's report for this job.

## What changed, and why

His ruling D2460 (`grep -h '^| D2460 |' .claude/decisions-full/*.md`, the shell): the rules every chat loads are
tightened — each repeated rule stated once, and the detail that matters at one moment read when needed behind a short
statement that always loads; **no rule dropped, no meaning changed.** No file under `raptor-port/src`.

In this copy: `OLD/` holds each changed rule file as it stood on `main` at `53e05ba88`; `CHANGE.patch` is
`git diff 53e05ba88 HEAD` over the rule files and guides. The changes:

1. **`.claude/rules/shipping.md` is now a short form** (17,402 → about 8,300 bytes). Its whole old body moved, byte for
   byte, to `raptor-port/docs/shipping-steps.md`, under the same headings; there, two lines were then corrected to say a
   notes-only push builds nothing on Vercel (D2032, the backlog's `[VERCEL-SHIPPING-LINES]`). The short form states each
   rule and names the moment to open its steps.
2. **`.claude/rules/decisions/how-we-work.md`, the general rulings page:** 30 lines moved whole to
   `raptor-port/docs/how-we-work-when-needed.md` (§The rules diet, §The platform and the database, §Overnight runs,
   §Compaction); seven statements written in their place — three under §Records ("The rules are kept short…", "Of the
   diet, in every chat…", "Also of it…"), two under §The platform and the database ("Before any work on…", "Also stated
   there…"), two under §Long runs ("Before an `/overnight` run…", "Every chat compacts…").
3. **Who reads what, stated once** (the same page, §Models and readers): three lines — the final code reads on risky
   work, an important plan's red team, a working-guide change — merged into two ("Two readers, each blind to the
   other…", "A job, plan or guide change that went without…"). `.claude/rules/bug-check.md` §When to call in Fable and
   Codex and `.claude/rules/doc-structure.md`'s Claudex-loop line now point to that section instead of restating it.
4. `DECISIONS.md`, the steps for a converted area: one clause on where a ruling of a moved section is stated.

## The questions — a narrow read (D70, D1761)

1. **The shipping short form against its full wording.** Go through `raptor-port/docs/shipping-steps.md` bullet by
   bullet. For each rule there, the short form must either keep it with the same meaning, or leave only a step, a
   command or a detail that is needed at a moment the short form names. Name: (a) any rule that must hold with no such
   moment — a prohibition or a duty in ordinary work — that the short form lost or weakened; (b) any short line that
   says more, less or other than the full wording; (c) any pointer whose named moment is too narrow, so a chat would
   act without opening the steps.
2. **The general page's seven statements against the 30 moved lines.** Is any moved line a rule that binds ordinary
   work with no trigger moment, so that reading it "when needed" would lose it? Does each statement say enough that a
   chat which never opens the section still breaks none of its rules by accident? Does any statement say more, less or
   other than the lines it stands for?
3. **The merged readers' lines.** Compare `OLD/how-we-work.md` §Models and readers' three lines with the two new ones.
   Is any condition lost or changed — who reads first, the second seat, "the agent's reading" marks (for a plan the
   Opus fallback is his word, D1760), the reads-owed list, "if Astra cannot run, he is told first and the change
   waits"? One clause was dropped on purpose as history, not rule: "as plans have been read since 13 Oct". Sound?
4. **The two pointers.** `bug-check.md` and `doc-structure.md` no longer restate the readers. Did either old text
   hold a condition the page's §Models and readers does not state? Name it and where it should go.
5. **Contradiction and dangling pointers.** Search the guides, rule files, skills and hooks for the subjects moved —
   the four merge steps, "only notes", the checks lock, the overnight rules, the compaction figures, the database
   step — not only for file names. Name any place that points at text which is no longer where it says, or that now
   contradicts a changed line.
6. **Safeguards.** Is any dropped or weakened: his "merge live"; the merge lock and level check; never pushing while
   checks run; the notes-only boundary; nothing of the database before its step; Astra's read of a reworded step; the
   fresh, blind Opus read; "never by its writer"?
7. **Bulk.** Does any new sentence add words not needed where they sit?

## What counts

A finding is concrete: the file and sentence, what it would make a chat do wrong, its cause, and the exact rewording
(D489). Not findings: a problem that lives only in data already stored (D56); his personal instructions file, which is
not in the project (D2254); how much smaller the files could still be made.

## The report

Findings first, ranked by harm, each with its file, the sentence, the failure and the fix. Then, in one line each, what
you checked and found sound. Say plainly if you found nothing.
