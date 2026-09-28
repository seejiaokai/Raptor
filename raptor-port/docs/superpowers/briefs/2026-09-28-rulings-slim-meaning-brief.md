# Meaning read brief — every short line against its full row (D138, D390, 28 Sep 26)

You are an independent reviewer; you did not write these lines. **Read-only: change no file.**

**What happened.** The owner approved (D390) that every ruling now loads into a chat as ONE short line — number, date,
the rule — while its full row (his words, the readings he was told, where it lives) sits whole in
`.claude/decisions-full/`, never loaded, opened before a chat acts on the ruling's detail. The owner's rule D138: a
condensed version never changes what the original meant, and is checked against the original by a model that did not
write it. That check is you. The plan: `raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md` §2.1.

**Your input** is a file (named in your prompt) listing, per ruling: its short line; whether it is an EXTRACT (the full
row's own bold heading, word for word) or HAND-WRITTEN; the later rulings its full row marks as changing it (the short
line's " — changed by" tail must name exactly those — the gate already checks that); any BACK-MARKS (a later ruling
that names it with a change verb but is not marked on it); and the full row. Five rows are marked ROW REPAIRED: their
column dividers were fixed (a missing `|` added or a stray one removed) — check nothing else changed in meaning.

**For EVERY short line, ask** — about the line as a chat would act on it, alone:
- (a) does it say anything the full row does not?
- (b) would a chat acting on it alone do something the full row forbids?
- (c) would it omit something the full row REQUIRES — a process step, a check, a picture first, an order of work?
- (d) is it the rule IN FORCE, after every later ruling that changed it (its marks, and its back-marks — read those
  later rows' short lines in the same file if you need them)?
- (e) does it drop a condition the row's readings ("the agent's reading, stated to him") make part of the rule?
- (f) could it be confused with another short line in the same area?

A short line cannot carry every detail — that is the design; the full row is opened before acting on detail. The
test is whether the LINE, as the thing a chat sees first, is true and not misleading, and whether a chat that trusted
it would do the right thing or know to open the row.

**Out of scope:** the full rows themselves (never propose rewording them); the app; the scripts; style preferences
(capitals versus sentence case, word choice that does not change meaning). A problem that lives only in stored data is
not a finding (D56).

**Output.** First line: `faithful: N of M`. Then ONLY the lines that are not faithful, most serious first, each as:
`D<n> — omits | stale | says more | forbidden act | confusable — <one sentence: what is wrong, citing the full row>`
and on the next line `REPLACE WITH: <the exact new rule text, at most 350 characters, no "|" character, stating the rule
as it stands, without the change tail>`. Then a short list of back-marks you think are real changes the older row
should carry a mark for (the older row, the later row, one line why). Plain text, no preamble.
