# Red team of batch 1's second-half plan, round 3 — the readers' brief (chat 139, 22 Nov 26)

**First line for every reader: you read an exported copy. Do not read `HANDOFF.md`'s `claude/msq-b1-screens-135`
block (removed in your copy) nor any reader's report of this round. You are one of three readers, blind to the others.
Read only — change no file.**

Everything in round 1's brief, `2026-11-22-msq-b1-second-half-plan-read-brief.md` (beside this one), still holds — the
files to read, what is and is not a finding (a problem only in data already stored is not one, D56; a finding needs a
concrete failure, its cause and its exact fix, D489), how to report. Read it first.

## What round 3 asks — §15 alone

The plan `raptor-port/docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md` was revised after round 2. Its §15
is that revision — Fable's shape rule and decisions D1–D14 — and where §15 and an earlier section differ, §15 is the
plan. Round 2's reports (`…-read2-astra.md`, `…-read2-opus.md`, `…-read-fable.md`, beside this brief) may be read to see
what was found. This is the last round under the cap; the build follows it.

For each of D1–D14, against the code and the rulings (`.claude/rules/decisions/`, the full rows in
`.claude/decisions-full/` — `grep -h '^| D2310 |' .claude/decisions-full/*.md`):

1. **Is the decision right?** Name any decision that still fails, with the concrete case (who, which squadron, which
   press, what he sees or what the gate lets through).
2. **What does it break?** A decision that contradicts another decision or an earlier section §15 did not override; a
   gate change that opens a hole (a forged command it would now let through, or a lawful one it would now refuse); an
   Undo or Redo it leaves wrong; a test that cannot pass as written.
3. **Anything new on screen not drawn** — §15 lists what goes to him as pictures (§9 F2, F3, F6, F7, F8); name any
   other new words or marks a decision implies.

Report new findings only. If a decision holds, one line saying so is enough. End with one line per decision D1–D14:
holds / holds with the findings named / does not hold.
