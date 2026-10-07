# Meaning read — the short lines and the guide lines written for D588, D589, D590 — 5 Oct 26

Work READ-ONLY: change nothing. You did not write any of this; Opus 5.5 did, on 5 Oct 26, in commits `e2febafd` and
`8785118d` (`git show e2febafd`, `git show 8785118d`). Two owner rules are being checked: **D138 — a summary must never
change what the original meant**, and **D70 — a change to a working guide is read, before the owner approves it, by
reviewers who did not write it**. Report as your final message, in the format at the foot.

## Part 1 — each short line against its full row (D138)

The owner's rulings load as ONE short line each in `.claude/rules/decisions/how-we-work.md`; the full row — his words,
the readings he was told, where the rule lives — is in `.claude/decisions-full/how-we-work.md`
(`grep -h '^| D588 |' .claude/decisions-full/*.md`). On 5 Oct 26 three new rulings were filed and seven older short
lines were rewritten to state the rule as it now stands:

- new: **D588, D589, D590**
- rewritten: **D16, D67, D70, D353, D476, D480, D540**

For each of the ten: read the full row whole (and, for a rewritten line, the full rows of the later rulings its
" — changed by" tail names), then the short line. Say whether the short line (a) states anything the full row does not,
(b) drops a condition, limit or exception a reader acting on the short line alone would need, (c) contradicts the full
row or a later ruling, or (d) is faithful. For a rewritten line also check that the mark written into its FULL row says
which later ruling changed it and how.

## Part 2 — the changed guide lines (D70)

The same two commits changed these working guides so that they carry D588–D590. Read every changed line (the commits'
diffs) against the three full rows:

- `AGENTS.md` — the note at its head ("SINCE THE RESET …")
- `.claude/skills/TASK-OBSERVER-VENDORED.md` — §Reviews in this repo (the D590 pointer)
- `.claude/rules/bug-check.md` — §When to call in Fable and Codex, and §With the Claudex loop
- `raptor-port/docs/bug-check-order.md` §4 — the paragraph "WHO THE TWO ARE NOW" and the paragraph "FROM 5 OCT 26 THE
  WALKERS ARE SONNET 5.5"
- `raptor-port/CLAUDE.md` §How to work here — the MODELS line and the Delegate-frugally line
- `raptor-port/docs/guide-full.md` §Models and §Delegate frugally
- `.claude/rules/doc-structure.md` and `.claude/rules/record-decisions.md` — any line that still names the OLD
  arrangement ("Fable and Astra review", "the walkers are Opus") without the new one beside it

For each: does the guide line say what the rulings say — no more, no less? Is anything the owner ruled missing from
every guide (so that an agent following the guides would not do it)? Does any guide line, anywhere in those files, still
state the old arrangement as live (search for the SUBJECT — "Fable", "walker", "Sonnet", "second reader", "both" — not
only for the D-numbers)? Do two guides now contradict each other?

## How to report

One table for Part 1 (ruling · faithful / NOT — what differs, quoting both texts · the exact replacement wording you
propose) and one for Part 2 (file and section · faithful / NOT — what differs · the exact replacement wording). Then:
explicit negatives ("I checked X and found nothing"). A difference counts only if you can say what an agent acting on
the shorter text would do WRONG because of it.
