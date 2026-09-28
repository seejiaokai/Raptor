# Brief — the meaning read of the project guide's short forms (D391, D138) — Fable 5.1, read-only

**Branch:** `claude/rulings-slim-d391-078ad2` (worktree `.claude/worktrees/rulings-slim-d391-078ad2`), cut from `main`
after the rulings slim-down merged (PR #458). **Plan:** `raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md`
§2.6. **You change nothing** — you report.

## What changed

The project guide, `raptor-port/CLAUDE.md`, loads in every chat that opens a file under `raptor-port/`. 35 of its
blocks were moved WHOLE, byte for byte (the mover proved each block landed once and left once), to
`raptor-port/docs/guide-full.md`, each under its own `###` heading. In each block's place the guide now holds ONE line —
its short form, at most 350 characters — ending `· full text: docs/guide-full.md §<heading>`. A chat reads the short
form every time and is told to open the full text before acting on a rule's detail. The guide went from ~60k to ~35k
bytes. What every task needs in full stayed in full (the five gate commands, the slot-key list, the two funnels, the
product invariants, the map table).

## Your job — one verdict per short form

Read `pairs.md` (the path is given in your task message): all 35 pairs, each short form beside the full text it replaced.
For each, answer (D138 — a summary must never change what the original meant):

- (a) Does the short form say anything the full text does not?
- (b) Would a chat acting on the short form ALONE do something the full text forbids?
- (c) Does it omit something the full text REQUIRES of every task it covers — a step, a check, a condition, a "never"?
  (Omitting detail is the point; omitting a requirement a chat would break without opening the full text is a finding.)
- (d) Is it the rule IN FORCE? Several blocks carry later corrections or supersessions inside them ("SUPERSEDED",
  "CORRECTED", "narrowed by") — the short form must state the rule after them, never the stale one.
- (e) Is it distinguishable from the other short forms, and does its heading name it plainly?

Verdict per pair: **faithful / omits / says more / stale**, with ONE line of reason, and for anything but faithful the
exact replacement text you propose (≤ 350 characters, no `|`, keep any ruling number the original carries).

**Also read, the same way:** D390's short line in `.claude/rules/decisions/how-we-work.md` (rewritten by hand when D391
was recorded) against its full row — `grep -h '^| D390 |' .claude/decisions-full/*.md` (use the shell; the Grep tool
hides a long row) — and D391's full row beside it, since D391 narrowed D390.

**And, briefly:** the other lines this branch wrote (not moved) — `git diff origin/main -- raptor-port/CLAUDE.md` for the
intro's two new lines and the map rows; `.claude/rules/doc-structure.md`, `.claude/rules/plain-language.md`,
`raptor-port/docs/doc-budget.md`, `raptor-port/docs/file-map.md` (`git diff origin/main -- <file>`). Same questions.

**Optional, if time allows:** the new check, `guidePairing()` in `raptor-port/scripts/docsize.mjs`, and its eight
self-test cases (search `THE GUIDE AND ITS FULL TEXT` in `docsize-selftest.mjs`): can a short form and its full text
drift apart, a heading be orphaned, or a pointer lead nowhere without it failing?

## Not a finding (D56)

A problem that lives only in data already stored is not a finding — there is none here, but do not go looking. The
wording of the FULL TEXT is not under review: it is the old guide, moved unchanged. Do not propose rewording it.

## Report

A table: pair number, heading, verdict, reason, replacement (if any). Then the D390 line, the other edits, the check.
Keep it plain; no preamble.
