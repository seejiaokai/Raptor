# Two small owed reads — 6 Oct 26 (Astra does Parts 1, 2 and 3; Sol 6.1 does Part 2 only)

Work READ-ONLY: change nothing, run nothing that builds or tests. You did not write any of this; Opus 5.5 did. Your
final message is your report (at most about 900 words), part by part: findings with file and line and the exact
correction, then one line per thing checked and found sound. Do not open any other reviewer's report of 6 Oct 26.

## Part 1 — five short lines against their full rows (owner's rule D138: a summary must never change what the original meant)

Each of the owner's rulings loads as ONE short line in `.claude/rules/decisions/<area>.md`; its full row — his words,
the readings he was told, where it lives — is in `.claude/decisions-full/<area>.md`
(`grep -h '^| D591 |' .claude/decisions-full/*.md`, any number). Five were filed on 5–6 Oct 26: **D591, D592** (OIL),
**D593, D594** (the scheduler), **D596** (how we work). For each: read the full row whole, then the short line. Say
whether the short line (a) states anything the full row does not, (b) drops a condition, limit or exception a reader
acting on the short line alone would need, (c) contradicts the full row or another ruling, or (d) is faithful.

## Part 2 — one changed working guide (owner's rule D70: a guide change is read by reviewers who did not write it, before he approves it)

Commit `9f463a1f` (`git show 9f463a1f`) added one bullet to `.claude/rules/doc-structure.md` §In his workflow —
"Unattended runs (D596, …)". Read D596's full row, then the bullet. Does the bullet say what the ruling says — no more,
no less? Is anything in the ruling that an agent would need missing from it? Does any other always-loaded rule file
(`.claude/rules/*.md`, `raptor-port/CLAUDE.md`, `AGENTS.md`) say something that now contradicts it?

## Part 3 — one fix never independently read (Astra only)

Commit `bcc69fc8` on this branch — "[SAVE-NOTE-COVERS] fix the findings of Astra's second read (the last round)" —
`git show bcc69fc8`. The findings it set out to fix are in
`raptor-port/docs/handpass/2026-10-05-save-note-controls-astra-final-r2.md`; the rulings are D586 and D587 (full rows
as above); the browser test is `raptor-port/e2e/save-note.spec.ts`. For each finding of that second read: is it fixed,
by what, and is it pinned by a test that would fail without the fix? Did the commit break anything the earlier rounds
had right? One later commit on this branch, `5b55e1c1`, changed the same stylesheet part again
(`raptor-port/src/ui/scheduler/17-save-status.css` — the band pinned to the screen in the phone board's Desktop
layout): say whether that later rule can disturb anything `bcc69fc8` settled. A claim is a finding only with a concrete
failure a person can meet, its cause (file and line) and its fix, step by step. This app's stored world is demo data
that will be cleared: do not report harm that exists only in data already stored when the code is right going forward.
